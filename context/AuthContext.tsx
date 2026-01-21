
import React, { createContext, useContext, useEffect, useState, useRef } from 'react';
import { supabase } from '../lib/supabase';
import { User, Session } from 'https://esm.sh/@supabase/supabase-js@2.48.1';

export type AuthStatus = 'loading' | 'authenticated' | 'unauthenticated';

interface UserProfile {
  id: string;
  display_name: string;
  role: 'free' | 'pro' | 'adm';
  text_credits: number;
  image_credits: number;
  subscription_status: string;
  plan_id: string;
  minutes_per_credit?: number;
  max_duration_limit?: number;
}

interface AuthContextType {
  user: User | null;
  profile: UserProfile | null;
  session: Session | null;
  status: AuthStatus;
  isLoading: boolean; // Estado definitivo de carregamento inicial
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  const fetchingProfileId = useRef<string | null>(null);

  const fetchProfile = async (userId: string) => {
    // Evita chamadas duplicadas para o mesmo ID
    if (fetchingProfileId.current === userId) return;
    fetchingProfileId.current = userId;

    try {
      console.log("[AUTH] Buscando perfil no banco...");
      const { data, error } = await supabase
        .from('profiles')
        .select('*, plans(*)')
        .eq('id', userId)
        .maybeSingle();
      
      if (error) {
        console.error("[AUTH] Erro ao buscar perfil:", error.message);
      } else if (data) {
        setProfile({
          ...data,
          minutes_per_credit: data.plans?.minutes_per_credit || 30,
          max_duration_limit: data.plans?.max_duration_limit || 60
        } as any);
      } else {
        console.warn("[AUTH] Perfil não encontrado na tabela 'profiles'.");
      }
    } catch (e) {
      console.error("[AUTH] Exceção na busca de perfil:", e);
    } finally {
      fetchingProfileId.current = null;
    }
  };

  const refreshProfile = async () => {
    if (user) await fetchProfile(user.id);
  };

  useEffect(() => {
    const initialize = async () => {
      try {
        console.log("[AUTH] Verificando sessão inicial...");
        const { data: { session: initialSession } } = await supabase.auth.getSession();
        
        if (initialSession?.user) {
          console.log("[AUTH] Sessão encontrada:", initialSession.user.email);
          setSession(initialSession);
          setUser(initialSession.user);
          // Buscamos o perfil, mas não bloqueamos o estado final se demorar
          await fetchProfile(initialSession.user.id);
        } else {
          console.log("[AUTH] Nenhuma sessão ativa.");
        }
      } catch (e) {
        console.error("[AUTH] Erro crítico na inicialização:", e);
      } finally {
        // Marcamos como inicializado independente do resultado do perfil
        setIsLoading(false);
        console.log("[AUTH] Inicialização concluída.");
      }
    };

    initialize();

    // Listener de mudanças de estado (Login, Logout, Token Refresh)
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, newSession) => {
      console.log("[AUTH] Evento detectado:", event);
      
      if (newSession?.user) {
        setSession(newSession);
        setUser(newSession.user);
        
        // Só busca perfil se houver mudança ou se não tivermos o perfil ainda
        if (!profile || profile.id !== newSession.user.id) {
          await fetchProfile(newSession.user.id);
        }
      } else {
        // Se não há sessão, limpamos tudo
        setSession(null);
        setUser(null);
        setProfile(null);
        // Garantimos que o loading pare se o evento for de assinar saída
        setIsLoading(false);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const signOut = async () => {
    console.log("[AUTH] Realizando logout...");
    try {
      await supabase.auth.signOut();
    } catch (e) {
      console.error("[AUTH] Erro no signOut:", e);
    }
    // Limpeza imediata do estado local para feedback instantâneo
    setProfile(null);
    setUser(null);
    setSession(null);
    window.location.hash = '#/login';
  };

  // Determina o status baseado nos estados atômicos
  const status: AuthStatus = isLoading 
    ? 'loading' 
    : user 
      ? 'authenticated' 
      : 'unauthenticated';

  return (
    <AuthContext.Provider value={{ user, profile, session, status, isLoading, signOut, refreshProfile }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth deve ser usado dentro de um AuthProvider');
  }
  return context;
};

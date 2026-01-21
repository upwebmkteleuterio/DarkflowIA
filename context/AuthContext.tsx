
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
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [status, setStatus] = useState<AuthStatus>('loading');
  
  // Usamos um ref para evitar múltiplas chamadas simultâneas ao perfil
  const fetchingProfileId = useRef<string | null>(null);

  const fetchProfile = async (userId: string) => {
    // Evita buscar o mesmo perfil se já estiver em progresso
    if (fetchingProfileId.current === userId) return;
    fetchingProfileId.current = userId;

    try {
      console.log("[AUTH] Buscando perfil para ID:", userId);
      
      const { data, error } = await supabase
        .from('profiles')
        .select('*, plans(*)')
        .eq('id', userId)
        .maybeSingle();
      
      if (error) {
        console.error("[AUTH] Erro ao buscar perfil:", error.message);
        // Se houver erro de rede, mantemos o que temos ou tentamos novamente silenciosamente
        // Não forçamos unauthenticated aqui para não deslogar o usuário por erro de rede temporário
      } else if (data) {
        console.log("[AUTH] Perfil carregado.");
        setProfile({
          ...data,
          minutes_per_credit: data.plans?.minutes_per_credit || 30,
          max_duration_limit: data.plans?.max_duration_limit || 60
        } as any);
        setStatus('authenticated');
      } else {
        console.warn("[AUTH] Perfil não encontrado na tabela 'profiles'.");
        // Apenas aqui, se o usuário logou mas não tem registro no banco, mandamos pro login
        setStatus('unauthenticated');
      }
    } catch (e) {
      console.error("[AUTH] Exceção crítica ao buscar perfil:", e);
    } finally {
      fetchingProfileId.current = null;
    }
  };

  const refreshProfile = async () => {
    if (user) await fetchProfile(user.id);
  };

  useEffect(() => {
    const initializeAuth = async () => {
      try {
        console.log("[AUTH] Recuperando sessão persistida...");
        const { data: { session: currentSession } } = await supabase.auth.getSession();
        
        if (currentSession?.user) {
          setSession(currentSession);
          setUser(currentSession.user);
          await fetchProfile(currentSession.user.id);
        } else {
          setStatus('unauthenticated');
        }
      } catch (e) {
        console.error("[AUTH] Falha na recuperação de sessão:", e);
        setStatus('unauthenticated');
      }
    };

    initializeAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, newSession) => {
      console.log("[AUTH] Evento detectado:", event);
      
      if (newSession?.user) {
        setSession(newSession);
        setUser(newSession.user);
        if (status !== 'authenticated') {
          await fetchProfile(newSession.user.id);
        }
      } else if (event === 'SIGNED_OUT') {
        setSession(null);
        setUser(null);
        setProfile(null);
        setStatus('unauthenticated');
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const signOut = async () => {
    console.log("[AUTH] Encerrando sessão...");
    try {
      await supabase.auth.signOut();
    } catch (e) {
      console.error("[AUTH] Erro no logout:", e);
    }
    setProfile(null);
    setUser(null);
    setSession(null);
    setStatus('unauthenticated');
    window.location.hash = '#/login';
  };

  return (
    <AuthContext.Provider value={{ user, profile, session, status, signOut, refreshProfile }}>
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

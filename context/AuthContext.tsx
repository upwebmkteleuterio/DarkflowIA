
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
  isLoading: boolean;
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
    if (fetchingProfileId.current === userId) return;
    fetchingProfileId.current = userId;

    try {
      console.log("[AUTH] Buscando perfil no banco (Assíncrono)...");
      const { data, error } = await supabase
        .from('profiles')
        .select('*, plans(*)')
        .eq('id', userId)
        .maybeSingle();
      
      if (error) {
        console.error("[AUTH] Erro ao buscar perfil:", error.message);
      } else if (data) {
        console.log("[AUTH] Perfil carregado com sucesso.");
        setProfile({
          ...data,
          minutes_per_credit: data.plans?.minutes_per_credit || 30,
          max_duration_limit: data.plans?.max_duration_limit || 60
        } as any);
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
    const initializeAuth = async () => {
      try {
        console.log("[AUTH] Verificando sessão local...");
        const { data: { session: initialSession } } = await supabase.auth.getSession();
        
        if (initialSession?.user) {
          console.log("[AUTH] Token validado:", initialSession.user.email);
          setSession(initialSession);
          setUser(initialSession.user);
          
          // PONTO CHAVE: Disparamos a busca do perfil MAS NÃO usamos 'await'
          // Isso libera a interface (isLoading vira false) imediatamente
          fetchProfile(initialSession.user.id);
          
          setIsLoading(false);
        } else {
          console.log("[AUTH] Nenhuma sessão ativa no dispositivo.");
          setIsLoading(false);
        }
      } catch (e) {
        console.error("[AUTH] Erro na inicialização do Auth:", e);
        setIsLoading(false);
      }
    };

    initializeAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, newSession) => {
      console.log("[AUTH] Evento de Sessão:", event);
      
      if (newSession?.user) {
        setSession(newSession);
        setUser(newSession.user);
        setIsLoading(false); // Garante liberação em logins manuais
        
        if (!profile || profile.id !== newSession.user.id) {
          fetchProfile(newSession.user.id);
        }
      } else if (event === 'SIGNED_OUT') {
        setSession(null);
        setUser(null);
        setProfile(null);
        setIsLoading(false);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const signOut = async () => {
    console.log("[AUTH] Saindo...");
    try {
      await supabase.auth.signOut();
    } catch (e) {}
    setProfile(null);
    setUser(null);
    setSession(null);
    setIsLoading(false);
    window.location.hash = '#/login';
  };

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

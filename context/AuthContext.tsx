
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

const SAFETY_TIMEOUT_MS = 10000; // 10 segundos

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [status, setStatus] = useState<AuthStatus>('loading');
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const fetchProfile = async (userId: string) => {
    // Inicia o timer de segurança para evitar trava no loading infinito
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => {
      if (status === 'loading') {
        console.warn("[AUTH] Timeout de segurança atingido ao carregar perfil.");
        setStatus('unauthenticated');
      }
    }, SAFETY_TIMEOUT_MS);

    try {
      console.log("[AUTH] Buscando perfil para ID:", userId);
      const { data, error } = await supabase
        .from('profiles')
        .select('*, plans(*)')
        .eq('id', userId)
        .single();
      
      if (error) {
        console.error("[AUTH] Erro ao buscar perfil:", error.message);
        setStatus('unauthenticated');
      } else if (data) {
        console.log("[AUTH] Perfil carregado com sucesso.");
        setProfile({
          ...data,
          minutes_per_credit: data.plans?.minutes_per_credit || 30,
          max_duration_limit: data.plans?.max_duration_limit || 60
        } as any);
        setStatus('authenticated');
      } else {
        setStatus('unauthenticated');
      }
    } catch (e) {
      console.error("[AUTH] Exceção ao buscar perfil:", e);
      setStatus('unauthenticated');
    } finally {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
    }
  };

  const refreshProfile = async () => {
    if (user) await fetchProfile(user.id);
  };

  useEffect(() => {
    const initializeAuth = async () => {
      try {
        console.log("[AUTH] Inicializando...");
        const { data: { session: currentSession } } = await supabase.auth.getSession();
        
        setSession(currentSession);
        setUser(currentSession?.user ?? null);
        
        if (currentSession?.user) {
          await fetchProfile(currentSession.user.id);
        } else {
          setStatus('unauthenticated');
        }
      } catch (e) {
        console.error("[AUTH] Erro na inicialização:", e);
        setStatus('unauthenticated');
      }
    };

    initializeAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, newSession) => {
      console.log("[AUTH] Evento Auth:", event);
      
      if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
        setSession(newSession);
        setUser(newSession?.user ?? null);
        if (newSession?.user) {
          setStatus('loading');
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
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  const signOut = async () => {
    console.log("[AUTH] Saindo...");
    try {
      await supabase.auth.signOut();
    } catch (e) {
      console.error("[AUTH] Erro no logout:", e);
    }
    localStorage.clear();
    sessionStorage.clear();
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

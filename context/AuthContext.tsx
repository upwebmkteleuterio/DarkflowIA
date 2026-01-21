
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
  
  const fetchingProfileId = useRef<string | null>(null);
  const initTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const fetchProfile = async (userId: string) => {
    if (fetchingProfileId.current === userId) return;
    fetchingProfileId.current = userId;

    try {
      console.log("[AUTH] Sincronizando Perfil...");
      const { data, error } = await supabase
        .from('profiles')
        .select('*, plans(*)')
        .eq('id', userId)
        .maybeSingle();
      
      if (error) {
        console.error("[AUTH] Erro na sincronização:", error.message);
        // Em caso de erro de rede, se já estivermos logados, não deslogamos
        if (status === 'loading') setStatus('unauthenticated');
      } else if (data) {
        setProfile({
          ...data,
          minutes_per_credit: data.plans?.minutes_per_credit || 30,
          max_duration_limit: data.plans?.max_duration_limit || 60
        } as any);
        setStatus('authenticated');
        // Limpa o timeout de segurança pois tivemos sucesso
        if (initTimeoutRef.current) clearTimeout(initTimeoutRef.current);
      } else {
        // Usuário existe no Auth mas não no banco de Profiles
        setStatus('unauthenticated');
      }
    } catch (e) {
      console.error("[AUTH] Falha Crítica:", e);
      if (status === 'loading') setStatus('unauthenticated');
    } finally {
      fetchingProfileId.current = null;
    }
  };

  const refreshProfile = async () => {
    if (user) await fetchProfile(user.id);
  };

  useEffect(() => {
    // TRAVA DE SEGURANÇA (Failsafe)
    // Se em 10 segundos o sistema não definir um estado, destravamos para unauthenticated
    initTimeoutRef.current = setTimeout(() => {
      if (status === 'loading') {
        console.warn("[AUTH] Timeout de segurança atingido. Destravando interface...");
        setStatus('unauthenticated');
      }
    }, 10000);

    const initializeAuth = async () => {
      try {
        const { data: { session: currentSession } } = await supabase.auth.getSession();
        
        if (currentSession?.user) {
          setSession(currentSession);
          setUser(currentSession.user);
          await fetchProfile(currentSession.user.id);
        } else {
          setStatus('unauthenticated');
          if (initTimeoutRef.current) clearTimeout(initTimeoutRef.current);
        }
      } catch (e) {
        setStatus('unauthenticated');
        if (initTimeoutRef.current) clearTimeout(initTimeoutRef.current);
      }
    };

    initializeAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, newSession) => {
      console.log("[AUTH] Evento de Sessão:", event);
      
      if (newSession?.user) {
        setSession(newSession);
        setUser(newSession.user);
        // Só buscamos o perfil se ele ainda não existir ou for troca de usuário
        if (!profile || profile.id !== newSession.user.id) {
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
      if (initTimeoutRef.current) clearTimeout(initTimeoutRef.current);
    };
  }, []);

  const signOut = async () => {
    try {
      await supabase.auth.signOut();
    } catch (e) {}
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

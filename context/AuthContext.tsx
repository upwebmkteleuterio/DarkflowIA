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
  cellphone?: string;
  tax_id?: string;
  minutes_per_credit?: number;
  max_duration_limit?: number;
  current_period_end?: string;
  stripe_customer_id?: string;
}

interface AuthContextType {
  user: User | null;
  profile: UserProfile | null;
  session: Session | null;
  status: AuthStatus;
  isLoading: boolean;
  isPasswordRecovery: boolean;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
  setIsPasswordRecovery: (value: boolean) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isPasswordRecovery, setIsPasswordRecovery] = useState(false);
  
  const fetchingProfileId = useRef<string | null>(null);

  const fetchProfile = async (userId: string) => {
    if (fetchingProfileId.current === userId) return;
    fetchingProfileId.current = userId;

    try {
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
      console.log("[AUTH] Inicializando sistema de autenticação...");
      console.log("[AUTH] URL Atual:", window.location.href);
      console.log("[AUTH] Fragmento Hash:", window.location.hash);

      try {
        const { data: { session: initialSession }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error("[AUTH] Erro ao recuperar sessão do Supabase:", error.message);
        }

        if (initialSession?.user) {
          console.log("[AUTH] Usuário detectado via sessão ativa:", initialSession.user.email);
          setSession(initialSession);
          setUser(initialSession.user);
          fetchProfile(initialSession.user.id);
        } else {
          console.log("[AUTH] Nenhuma sessão ativa encontrada na inicialização.");
        }
      } catch (e) {
        console.error("[AUTH] Falha crítica ao inicializar Auth:", e);
      } finally {
        setIsLoading(false);
      }
    };
    initializeAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, newSession) => {
      console.log(`[AUTH] Evento detectado: ${event}`);
      
      if (event === 'PASSWORD_RECOVERY') {
        setIsPasswordRecovery(true);
      }

      if (newSession?.user) {
        console.log("[AUTH] Nova sessão estabelecida para:", newSession.user.email);
        setSession(newSession);
        setUser(newSession.user);
        setIsLoading(false);
        if (!profile || profile.id !== newSession.user.id) {
          fetchProfile(newSession.user.id);
        }
      } else if (event === 'SIGNED_OUT') {
        console.log("[AUTH] Usuário desconectado.");
        setSession(null);
        setUser(null);
        setProfile(null);
        setIsLoading(false);
      }
    });
    return () => subscription.unsubscribe();
  }, []);

  const signOut = async () => {
    try { await supabase.auth.signOut(); } catch (e) {}
    setProfile(null);
    setUser(null);
    setSession(null);
    setIsLoading(false);
    setIsPasswordRecovery(false);
    window.location.hash = '#/';
  };

  const status: AuthStatus = isLoading ? 'loading' : user ? 'authenticated' : 'unauthenticated';

  return (
    <AuthContext.Provider value={{ 
      user, 
      profile, 
      session, 
      status, 
      isLoading, 
      isPasswordRecovery, 
      signOut, 
      refreshProfile,
      setIsPasswordRecovery 
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) throw new Error('useAuth deve ser usado dentro de um AuthProvider');
  return context;
};
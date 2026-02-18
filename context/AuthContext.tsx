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

  const fetchProfile = async (userId: string, retryCount = 0) => {
    if (fetchingProfileId.current === userId && retryCount === 0) return;
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
      } else if (retryCount < 3) {
        // Se não achou o perfil, pode ser que a trigger ainda esteja rodando. Tenta de novo em 1.5s
        console.log(`[AUTH] Perfil não encontrado, tentando novamente... (${retryCount + 1})`);
        setTimeout(() => fetchProfile(userId, retryCount + 1), 1500);
      }
    } catch (e) {
      console.error("[AUTH] Exceção na busca de perfil:", e);
    } finally {
      if (retryCount >= 3 || profile) fetchingProfileId.current = null;
    }
  };

  const refreshProfile = async () => {
    if (user) await fetchProfile(user.id);
  };

  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const { data: { session: initialSession } } = await supabase.auth.getSession();
        if (initialSession?.user) {
          setSession(initialSession);
          setUser(initialSession.user);
          await fetchProfile(initialSession.user.id);
        }
      } catch (e) {
        console.error("[AUTH] Erro inicialização:", e);
      } finally {
        setIsLoading(false);
      }
    };

    initializeAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, newSession) => {
      console.log(`[AUTH] Evento Auth: ${event}`);
      
      if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED' || event === 'USER_UPDATED') {
        if (newSession?.user) {
          setSession(newSession);
          setUser(newSession.user);
          fetchProfile(newSession.user.id);
        }
        setIsLoading(false);
      }

      if (event === 'SIGNED_OUT') {
        setSession(null);
        setUser(null);
        setProfile(null);
        setIsLoading(false);
        window.location.hash = '#/';
      }

      if (event === 'PASSWORD_RECOVERY') {
        setIsPasswordRecovery(true);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const signOut = async () => {
    // LIMPEZA IMEDIATA: Não espera o Supabase responder para liberar a UI
    setIsLoading(true);
    setUser(null);
    setProfile(null);
    setSession(null);
    
    try { 
      await supabase.auth.signOut(); 
    } catch (e) {
      console.warn("[AUTH] Erro ao comunicar saída ao servidor:", e);
    } finally {
      setIsLoading(false);
      window.location.hash = '#/';
    }
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
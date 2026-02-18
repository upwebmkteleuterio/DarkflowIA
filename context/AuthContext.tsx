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
        console.log("[AUTH] Perfil carregado:", data.display_name);
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
      const hash = window.location.hash;
      console.log("[AUTH] Inicializando...");
      console.log("[AUTH] Hash da URL:", hash);

      // Se detectarmos tokens de auth na URL, esperamos um pouco mais para o Supabase processar
      const hasAuthToken = hash.includes('access_token=') || hash.includes('id_token=') || hash.includes('type=recovery');
      
      if (hasAuthToken) {
        console.log("[AUTH] Token de autenticação detectado na URL. Aguardando processamento...");
      }

      try {
        const { data: { session: initialSession }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error("[AUTH] Erro getSession:", error.message);
        }

        if (initialSession?.user) {
          console.log("[AUTH] Sessão inicial encontrada:", initialSession.user.email);
          setSession(initialSession);
          setUser(initialSession.user);
          await fetchProfile(initialSession.user.id);
        } else if (hasAuthToken) {
          // Se tem token mas getSession falhou, damos um pequeno tempo para o onAuthStateChange agir
          console.log("[AUTH] Token presente mas sessão ainda não pronta. Aguardando listener...");
          return; 
        }
      } catch (e) {
        console.error("[AUTH] Falha crítica inicial:", e);
      } finally {
        // Só liberamos o loading se não estivermos esperando um token OAuth
        if (!hasAuthToken) {
          setIsLoading(false);
        }
      }
    };

    initializeAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, newSession) => {
      console.log(`[AUTH] Evento Supabase: ${event}`);
      
      if (event === 'PASSWORD_RECOVERY') {
        setIsPasswordRecovery(true);
      }

      if (newSession?.user) {
        console.log("[AUTH] Usuário autenticado via evento:", newSession.user.email);
        setSession(newSession);
        setUser(newSession.user);
        setIsLoading(false); // Garante que o loading para ao receber a sessão
        
        if (!profile || profile.id !== newSession.user.id) {
          await fetchProfile(newSession.user.id);
        }
      } else if (event === 'SIGNED_OUT') {
        console.log("[AUTH] Logout detectado.");
        setSession(null);
        setUser(null);
        setProfile(null);
        setIsLoading(false);
      } else if (event === 'INITIAL_SESSION' && !newSession) {
        // Se após a verificação inicial não houver nada, liberamos o loading
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
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import Button from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import EnergyBeam from '../components/ui/energy-beam';
import { useAuth } from '../context/AuthContext';

type LoginView = 'login' | 'forgot' | 'reset';

const Login: React.FC = () => {
  const [view, setView] = useState<LoginView>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  
  const { isPasswordRecovery, setIsPasswordRecovery, status } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (status === 'authenticated') {
      navigate('/dashboard');
    }
  }, [status, navigate]);

  useEffect(() => {
    if (isPasswordRecovery) {
      setView('reset');
    }
  }, [isPasswordRecovery]);

  const handleGoogleLogin = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const { error: authError } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          // Usamos o origin sem barra para o Supabase injetar o hash corretamente
          redirectTo: window.location.origin,
          queryParams: {
            access_type: 'offline',
            prompt: 'consent',
          },
        },
      });

      if (authError) throw authError;
    } catch (err: any) {
      setError(`Erro Google: ${err.message}`);
      setLoading(false);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const { error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (authError) {
        setError(authError.message === 'Invalid login credentials' 
          ? 'E-mail ou senha incorretos.' 
          : authError.message);
        setLoading(false);
      } else {
        navigate('/dashboard');
      }
    } catch (err) {
      setError("Ocorreu um erro inesperado. Tente novamente.");
      setLoading(false);
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: window.location.origin + '/#/login',
      });

      if (resetError) {
        setError(resetError.message);
      } else {
        setSuccess("Link de recuperação enviado para o seu e-mail!");
      }
    } catch (err) {
      setError("Erro ao solicitar recuperação. Verifique o e-mail.");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const { error: updateError } = await supabase.auth.updateUser({
        password: newPassword,
      });

      if (updateError) {
        setError(updateError.message);
      } else {
        setSuccess("Senha atualizada com sucesso! Você já pode entrar.");
        setIsPasswordRecovery(false);
        setTimeout(() => setView('login'), 2000);
      }
    } catch (err) {
      setError("Erro ao atualizar senha. Tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  const renderLoginForm = () => (
    <div className="space-y-6">
      <Button 
        fullWidth 
        variant="white"
        size="lg" 
        onClick={handleGoogleLogin}
        disabled={loading}
        className="shadow-xl"
      >
        <img src="https://api.iconify.design/logos:google-icon.svg" className="size-5 mr-2" alt="Google" />
        ENTRAR COM GOOGLE
      </Button>

      <div className="flex items-center gap-4">
        <div className="h-px bg-border-dark flex-1"></div>
        <span className="text-[10px] font-black text-slate-600 uppercase tracking-widest">Ou com e-mail</span>
        <div className="h-px bg-border-dark flex-1"></div>
      </div>

      <form onSubmit={handleLogin} className="space-y-6">
        <Input 
          label="E-MAIL"
          type="email"
          placeholder="seu@email.com"
          icon="mail"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          disabled={loading}
        />

        <div className="relative">
          <Input 
            label="SENHA"
            type={showPassword ? "text" : "password"}
            placeholder="••••••••"
            icon="lock"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            disabled={loading}
          />
          <button 
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-4 top-[38px] text-slate-500 hover:text-white transition-colors"
          >
            <span className="material-symbols-outlined text-xl">
              {showPassword ? 'visibility_off' : 'visibility'}
            </span>
          </button>
        </div>

        <div className="flex justify-end">
          <button 
            type="button"
            onClick={() => { setView('forgot'); setError(null); setSuccess(null); }}
            className="text-[10px] font-black text-primary uppercase tracking-widest hover:underline"
          >
            Esqueceu a senha?
          </button>
        </div>

        <Button 
          fullWidth 
          size="lg" 
          loading={loading}
          type="submit"
        >
          ENTRAR NO PAINEL
        </Button>

        <p className="text-center text-xs text-slate-500 font-medium">
          Não tem uma conta? <Link to="/register" className="text-primary font-bold hover:underline">Cadastre-se</Link>
        </p>
      </form>
    </div>
  );

  const renderForgotForm = () => (
    <form onSubmit={handleForgotPassword} className="space-y-6">
      <p className="text-slate-400 text-sm leading-relaxed mb-4">
        Informe seu e-mail para receber um link de redefinição de senha.
      </p>
      
      <Input 
        label="E-MAIL DE RECUPERAÇÃO"
        type="email"
        placeholder="seu@email.com"
        icon="mail"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        required
        disabled={loading}
      />

      <Button 
        fullWidth 
        size="lg" 
        loading={loading}
        type="submit"
      >
        ENVIAR LINK
      </Button>

      <div className="flex justify-center">
        <button 
          type="button"
          onClick={() => { setView('login'); setError(null); setSuccess(null); }}
          className="text-[10px] font-black text-slate-500 uppercase tracking-widest hover:text-white transition-colors"
        >
          Voltar para o Login
        </button>
      </div>
    </form>
  );

  const renderResetForm = () => (
    <form onSubmit={handleUpdatePassword} className="space-y-6">
      <p className="text-slate-400 text-sm leading-relaxed mb-4">
        Quase lá! Escolha sua nova senha de acesso.
      </p>

      <div className="relative">
        <Input 
          label="NOVA SENHA"
          type={showPassword ? "text" : "password"}
          placeholder="••••••••"
          icon="lock"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          required
          disabled={loading}
        />
        <button 
          type="button"
          onClick={() => setShowPassword(!showPassword)}
          className="absolute right-4 top-[38px] text-slate-500 hover:text-white transition-colors"
        >
          <span className="material-symbols-outlined text-xl">
            {showPassword ? 'visibility_off' : 'visibility'}
          </span>
        </button>
      </div>

      <Button 
        fullWidth 
        size="lg" 
        loading={loading}
        type="submit"
      >
        ATUALIZAR SENHA
      </Button>
    </form>
  );

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-black p-6 relative overflow-hidden text-left">
      <div className="absolute inset-0 z-0">
        <EnergyBeam />
      </div>

      <div className="w-full max-w-md relative z-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
        <div className="text-center mb-10">
          <div className="bg-primary size-16 rounded-2xl flex items-center justify-center shadow-2xl shadow-primary/30 mx-auto mb-6">
            <span className="material-symbols-outlined text-white text-4xl">
              {view === 'login' ? 'rocket_launch' : view === 'forgot' ? 'lock_open' : 'key'}
            </span>
          </div>
          <h1 className="text-3xl font-black text-white font-display tracking-tight">
            {view === 'login' && <>Bem-vindo ao <span className="text-primary italic">DarkFlow</span></>}
            {view === 'forgot' && <>Recuperar <span className="text-primary italic">Acesso</span></>}
            {view === 'reset' && <>Nova <span className="text-primary italic">Senha</span></>}
          </h1>
          <p className="text-slate-500 mt-2">
            {view === 'login' && 'Entre na sua conta para continuar criando.'}
            {view === 'forgot' && 'Não se preocupe, vamos te ajudar.'}
            {view === 'reset' && 'Defina seu novo segredo de acesso.'}
          </p>
        </div>

        <div className="bg-surface-dark/80 backdrop-blur-xl border border-border-dark p-8 rounded-[32px] shadow-2xl space-y-6">
          {error && (
            <div className="bg-red-500/10 border border-red-500/20 text-red-500 p-4 rounded-xl text-xs font-bold flex items-center gap-2 animate-in zoom-in-95 duration-200">
              <span className="material-symbols-outlined text-sm">error_outline</span>
              {error}
            </div>
          )}

          {success && (
            <div className="bg-accent-green/10 border border-accent-green/20 text-accent-green p-4 rounded-xl text-xs font-bold flex items-center gap-2 animate-in zoom-in-95 duration-200">
              <span className="material-symbols-outlined text-sm">check_circle</span>
              {success}
            </div>
          )}

          {view === 'login' && renderLoginForm()}
          {view === 'forgot' && renderForgotForm()}
          {view === 'reset' && renderResetForm()}
        </div>
      </div>
    </div>
  );
};

export default Login;
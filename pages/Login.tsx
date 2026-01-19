
import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import Button from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import EnergyBeam from '../components/ui/energy-beam';

const SAFETY_TIMEOUT_MS = 10000; // 10 segundos para desistir

const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loadingTime, setLoadingTime] = useState(0);
  const navigate = useNavigate();
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (loading) {
      const interval = setInterval(() => {
        setLoadingTime(prev => prev + 1000);
      }, 1000);

      timerRef.current = setTimeout(() => {
        setLoading(false);
        setError("O servidor demorou muito para responder. Por favor, tente novamente ou verifique sua conexão.");
        clearInterval(interval);
      }, SAFETY_TIMEOUT_MS);

      return () => {
        if (timerRef.current) clearTimeout(timerRef.current);
        clearInterval(interval);
        setLoadingTime(0);
      };
    }
  }, [loading]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setLoadingTime(0);

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
        navigate('/');
      }
    } catch (err) {
      setError("Ocorreu um erro inesperado. Tente novamente.");
      setLoading(false);
    }
  };

  const getLoadingMessage = () => {
    if (loadingTime < 3000) return "Autenticando...";
    if (loadingTime < 7000) return "Sincronizando dados seguros...";
    return "Quase lá, o servidor está sob carga...";
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-black p-6 relative overflow-hidden">
      {/* Energy Beam Background */}
      <div className="absolute inset-0 z-0">
        <EnergyBeam />
      </div>

      <div className="w-full max-w-md relative z-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
        <div className="text-center mb-10">
          <div className="bg-primary size-16 rounded-2xl flex items-center justify-center shadow-2xl shadow-primary/30 mx-auto mb-6">
            <span className="material-symbols-outlined text-white text-4xl">rocket_launch</span>
          </div>
          <h1 className="text-3xl font-black text-white font-display tracking-tight">Bem-vindo ao <span className="text-primary italic">DarkFlow</span></h1>
          <p className="text-slate-500 mt-2">Entre na sua conta para continuar criando.</p>
        </div>

        <form onSubmit={handleLogin} className="bg-surface-dark/80 backdrop-blur-xl border border-border-dark p-8 rounded-[32px] shadow-2xl space-y-6">
          {error && (
            <div className="bg-red-500/10 border border-red-500/20 text-red-500 p-4 rounded-xl text-xs font-bold flex items-center gap-2 animate-in zoom-in-95 duration-200">
              <span className="material-symbols-outlined text-sm">error_outline</span>
              {error}
            </div>
          )}

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
            <Link to="/forgot-password" size="sm" className="text-[10px] font-black text-primary uppercase tracking-widest hover:underline">
              Esqueceu a senha?
            </Link>
          </div>

          <Button 
            fullWidth 
            size="lg" 
            loading={loading}
            type="submit"
          >
            {loading ? getLoadingMessage() : 'ENTRAR NO PAINEL'}
          </Button>

          <p className="text-center text-xs text-slate-500 font-medium">
            Não tem uma conta? <Link to="/register" className="text-primary font-bold hover:underline">Cadastre-se</Link>
          </p>
        </form>
      </div>
    </div>
  );
};

export default Login;

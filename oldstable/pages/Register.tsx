
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import Button from '../components/ui/Button';
import { Input } from '../components/ui/Input';

const Register: React.FC = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const { error, data } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          display_name: name,
        }
      }
    });

    if (error) {
      setError(error.message);
      setLoading(false);
    } else {
      // O Supabase pode exigir confirmação de e-mail dependendo da config
      if (data.session) {
        navigate('/');
      } else {
        alert('Cadastro realizado! Verifique seu e-mail para confirmar a conta.');
        navigate('/login');
      }
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background-dark p-6">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 -left-20 size-96 bg-primary/10 rounded-full blur-[120px]"></div>
        <div className="absolute bottom-1/4 -right-20 size-96 bg-primary/5 rounded-full blur-[120px]"></div>
      </div>

      <div className="w-full max-w-md relative z-10">
        <div className="text-center mb-10">
          <div className="bg-primary size-16 rounded-2xl flex items-center justify-center shadow-2xl shadow-primary/30 mx-auto mb-6">
            <span className="material-symbols-outlined text-white text-4xl">person_add</span>
          </div>
          <h1 className="text-3xl font-black text-white font-display tracking-tight">Crie sua <span className="text-primary italic">Conta</span></h1>
          <p className="text-slate-500 mt-2">Comece a automatizar seus canais hoje mesmo.</p>
        </div>

        <form onSubmit={handleRegister} className="bg-surface-dark border border-border-dark p-8 rounded-[32px] shadow-2xl space-y-6">
          {error && (
            <div className="bg-red-500/10 border border-red-500/20 text-red-500 p-4 rounded-xl text-xs font-bold flex items-center gap-2">
              <span className="material-symbols-outlined text-sm">error</span>
              {error}
            </div>
          )}

          <Input 
            label="Nome Completo"
            type="text"
            placeholder="Seu Nome"
            icon="person"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />

          <Input 
            label="E-mail"
            type="email"
            placeholder="seu@email.com"
            icon="mail"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <div className="relative">
            <Input 
              label="Senha"
              type={showPassword ? "text" : "password"}
              placeholder="Min. 6 caracteres"
              icon="lock"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
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
            Criar Conta Grátis
          </Button>

          <p className="text-center text-xs text-slate-500 font-medium">
            Já tem uma conta? <Link to="/login" className="text-primary font-bold hover:underline">Faça Login</Link>
          </p>
        </form>
      </div>
    </div>
  );
};

export default Register;

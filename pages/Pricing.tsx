
import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import Badge from '../components/ui/Badge';
import { useAuth } from '../context/AuthContext';

interface Plan {
  id: string;
  name: string;
  price: number;
  text_credits: number;
  image_credits: number;
  minutes_per_credit: number;
  features: string[];
  type: 'free' | 'pro';
}

const Pricing: React.FC = () => {
  const [plans, setPlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(true);
  const { profile } = useAuth();

  useEffect(() => {
    const fetchPlans = async () => {
      const { data, error } = await supabase
        .from('plans')
        .select('*')
        .order('price', { ascending: true });
      
      if (!error && data) setPlans(data);
      setLoading(false);
    };
    fetchPlans();
  }, []);

  return (
    <div className="max-w-[1200px] mx-auto w-full px-6 py-10 animate-in fade-in duration-700">
      <div className="flex flex-wrap justify-between items-end gap-6 mb-12 text-center md:text-left">
        <div className="flex flex-col gap-3 max-w-2xl">
          <h2 className="text-white text-5xl font-black leading-tight tracking-tight font-display uppercase">Planos & <span className="text-primary italic">Créditos</span></h2>
          <p className="text-slate-400 text-lg">Turbine seus canais dark com inteligência artificial de ponta e escale sua produção.</p>
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-96 bg-surface-dark border border-border-dark rounded-3xl animate-pulse"></div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16 items-stretch">
          {plans.map((plan) => {
            const isCurrentPlan = profile?.plan_id === plan.id || (plan.type === 'free' && !profile?.plan_id);

            return (
              <div 
                key={plan.id} 
                className={`flex flex-col gap-8 rounded-[40px] border p-10 transition-all duration-500 hover:shadow-2xl relative group ${
                  plan.price > 0 && plan.price < 200 
                  ? 'border-primary bg-primary/5 shadow-2xl shadow-primary/10 md:scale-105 z-10' 
                  : 'border-border-dark bg-surface-dark hover:border-primary/30'
                }`}
              >
                {plan.price > 0 && plan.price < 200 && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-primary text-white text-[10px] font-black uppercase px-6 py-1.5 rounded-full shadow-lg">
                    Mais Popular
                  </div>
                )}

                <div className="space-y-2">
                  <h3 className="text-slate-500 text-xs font-black uppercase tracking-[0.2em]">{plan.name}</h3>
                  <div className="flex items-baseline gap-1">
                    <span className="text-white text-5xl font-black tracking-tighter">R$ {plan.price}</span>
                    <span className="text-slate-500 text-sm font-bold">/mês</span>
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-3 p-6 bg-background-dark/50 rounded-3xl border border-dashed border-border-dark group-hover:border-primary/40 transition-colors">
                  <div className="text-primary text-xl font-black flex items-center justify-between">
                    <span>{plan.text_credits}</span>
                    <span className="text-[9px] text-slate-500 uppercase tracking-widest">Créditos de Texto</span>
                  </div>
                  <div className="text-accent-green text-xl font-black flex items-center justify-between">
                    <span>{plan.image_credits}</span>
                    <span className="text-[9px] text-slate-500 uppercase tracking-widest">Créditos de Imagem</span>
                  </div>
                </div>

                <div className="space-y-4 flex-1">
                  <div className="flex items-center gap-3 text-xs font-bold text-white bg-primary/10 p-2 rounded-xl border border-primary/20">
                     <span className="material-symbols-outlined text-primary">schedule</span>
                     1 Crédito = {plan.minutes_per_credit} min
                  </div>
                  {plan.features.map((feature, idx) => (
                    <div key={idx} className="flex items-center gap-3 text-sm text-slate-300">
                      <span className="material-symbols-outlined text-primary text-lg">verified</span>
                      {feature}
                    </div>
                  ))}
                </div>

                <button 
                  disabled={isCurrentPlan}
                  className={`w-full py-4 rounded-2xl font-black text-sm uppercase tracking-widest transition-all active:scale-95 shadow-xl ${
                  isCurrentPlan
                  ? 'bg-slate-800 text-slate-500 cursor-default'
                  : plan.price > 0 && plan.price < 200
                    ? 'bg-primary text-white hover:bg-primary-hover shadow-primary/30'
                    : 'bg-white text-black hover:bg-slate-200'
                }`}>
                  {isCurrentPlan ? 'Plano Atual' : 'Assinar Plano'}
                </button>
              </div>
            );
          })}
        </div>
      )}

      <div className="bg-surface-dark border border-border-dark p-10 rounded-[48px] flex flex-col md:flex-row items-center justify-between gap-8 shadow-2xl border-dashed">
         <div className="flex items-center gap-6">
            <div className="bg-primary/20 size-16 rounded-full flex items-center justify-center text-primary border border-primary/20">
               <span className="material-symbols-outlined text-4xl">pix</span>
            </div>
            <div className="text-left">
               <h4 className="text-xl font-black text-white uppercase italic">Pagamento via PIX</h4>
               <p className="text-slate-500 text-sm">Liberação instantânea de créditos após a confirmação do pagamento manual.</p>
            </div>
         </div>
         <button className="px-10 py-4 bg-white/5 border border-white/10 text-white font-black text-xs uppercase tracking-widest rounded-2xl hover:bg-white/10 transition-all">
            Verificar Renovação
         </button>
      </div>
    </div>
  );
};

export default Pricing;

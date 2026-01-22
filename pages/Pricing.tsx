
import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import Badge from '../components/ui/Badge';
import Button from '../components/ui/Button';
import { useAuth } from '../context/AuthContext';
import PaymentModal from '../components/Pricing/PaymentModal';

interface Plan {
  id: string;
  name: string;
  price: number;
  text_credits: number;
  image_credits: number;
  minutes_per_credit: number;
  features: string[];
  type: 'free' | 'pro';
  stripe_price_id?: string;
}

const PIX_CACHE_KEY = 'darkflow_active_pix';

const Pricing: React.FC = () => {
  const [plans, setPlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingPayment, setProcessingPayment] = useState(false);
  const [checkingPix, setCheckingPix] = useState(false);
  const [selectedPlanForCheckout, setSelectedPlanForCheckout] = useState<Plan | null>(null);
  const [paymentStatus, setPaymentStatus] = useState<'success' | 'canceled' | null>(null);
  const [pendingPix, setPendingPix] = useState<any>(null);
  
  const { profile, user, refreshProfile } = useAuth();
  const location = useLocation();

  useEffect(() => {
    const fetchPlans = async () => {
      const { data, error } = await supabase.from('plans').select('*').order('price', { ascending: true });
      if (!error && data) setPlans(data);
      setLoading(false);
    };

    const searchParams = new URLSearchParams(location.search);
    if (searchParams.get('success') === 'true') setPaymentStatus('success');
    
    const cached = localStorage.getItem(PIX_CACHE_KEY);
    if (cached) {
      try {
        const parsed = JSON.parse(cached);
        if (parsed.userId === user?.id) {
           const expiry = new Date(parsed.pix.expiresAt).getTime();
           if (expiry > Date.now()) setPendingPix(parsed);
        }
      } catch (e) { localStorage.removeItem(PIX_CACHE_KEY); }
    }

    fetchPlans();
  }, [location.search, user?.id]);

  const handleCheckPendingPix = async () => {
    if (!pendingPix) return;
    setCheckingPix(true);
    try {
      const { data, error } = await supabase.functions.invoke('check-pix-status', {
        body: { pixId: pendingPix.pix.id, userId: user?.id, planId: pendingPix.planId }
      });
      if (error) throw error;
      if (data.status === 'PAID') {
        alert("Pagamento confirmado!");
        localStorage.removeItem(PIX_CACHE_KEY);
        setPendingPix(null);
        await refreshProfile();
        setPaymentStatus('success');
      } else {
        alert("Pagamento ainda pendente no banco.");
      }
    } catch (err: any) { alert("Erro ao verificar: " + err.message); }
    finally { setCheckingPix(false); }
  };

  const handleOpenCheckout = (plan: Plan) => {
    if (!user) { window.location.hash = '#/login'; return; }
    setSelectedPlanForCheckout(plan);
  };

  const handleStripeCheckout = async () => {
    if (!selectedPlanForCheckout || !user) return;
    setProcessingPayment(true);
    try {
      const { data, error } = await supabase.functions.invoke('create-checkout-session', {
        body: { priceId: selectedPlanForCheckout.stripe_price_id, userId: user.id, returnUrl: window.location.origin }
      });
      if (error) throw error;
      if (data?.url) window.location.href = data.url;
    } catch (err: any) { alert("Falha: " + err.message); }
    finally { setProcessingPayment(false); }
  };

  return (
    <div className="max-w-[1200px] mx-auto w-full px-6 py-10 animate-in fade-in duration-700">
      
      {/* ALERTA DE TOPO: PIX PENDENTE */}
      {pendingPix && !paymentStatus && (
        <div className="mb-10 p-6 bg-accent-green/10 border-2 border-accent-green/30 rounded-[32px] flex flex-col md:flex-row items-center justify-between gap-6 shadow-[0_0_40px_rgba(57,255,20,0.1)] animate-in slide-in-from-top-10 duration-500">
          <div className="flex items-center gap-5 text-left">
            <div className="size-14 bg-accent-green rounded-2xl flex items-center justify-center text-black shadow-lg"><span className="material-symbols-outlined text-3xl font-black">pix</span></div>
            <div>
              <h4 className="text-white font-black uppercase italic tracking-tight">Pagamento Pendente Detectado</h4>
              <p className="text-slate-400 text-xs">Você possui um QR Code ativo. Clique para validar sua assinatura agora.</p>
            </div>
          </div>
          <div className="flex gap-3 w-full md:w-auto">
             <Button variant="success" size="lg" loading={checkingPix} onClick={handleCheckPendingPix} className="flex-1 md:flex-none py-4 px-8 shadow-xl shadow-accent-green/20">
                Já paguei, liberar créditos!
             </Button>
             <Button variant="outline" size="lg" onClick={() => {
                const plan = plans.find(p => p.id === pendingPix.planId);
                if (plan) handleOpenCheckout(plan);
             }}>Ver QR Code</Button>
          </div>
        </div>
      )}

      {paymentStatus === 'success' && (
        <div className="mb-10 p-6 bg-accent-green/10 border border-accent-green/20 rounded-[32px] flex items-center gap-4 animate-in zoom-in-95 duration-500">
           <div className="size-12 bg-accent-green rounded-full flex items-center justify-center text-black"><span className="material-symbols-outlined font-black">check</span></div>
           <div className="text-left"><h4 className="text-white font-black uppercase italic">Assinatura Ativada!</h4><p className="text-slate-400 text-xs">Seus créditos já foram liberados em sua conta.</p></div>
        </div>
      )}

      <div className="text-center md:text-left mb-16">
        <h2 className="text-white text-5xl font-black leading-tight tracking-tight font-display uppercase">Planos & <span className="text-primary italic">Créditos</span></h2>
        <p className="text-slate-400 text-lg mt-2">Escolha a potência ideal para sua fábrica de vídeos.</p>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[1,2,3].map(i => <div key={i} className="h-96 bg-surface-dark border border-border-dark rounded-[40px] animate-pulse"></div>)}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {plans.map((plan) => {
            const isCurrentPlan = profile?.plan_id === plan.id || (plan.type === 'free' && !profile?.plan_id);
            return (
              <div key={plan.id} className={`flex flex-col gap-8 rounded-[40px] border p-10 transition-all duration-500 hover:shadow-2xl relative ${plan.price > 0 && plan.price < 200 ? 'border-primary bg-primary/5 shadow-2xl md:scale-105 z-10' : 'border-border-dark bg-surface-dark'}`}>
                <div className="text-left space-y-2">
                  <h3 className="text-slate-500 text-xs font-black uppercase tracking-[0.2em]">{plan.name}</h3>
                  <div className="flex items-baseline gap-1"><span className="text-white text-5xl font-black tracking-tighter">R$ {plan.price}</span><span className="text-slate-500 text-sm font-bold">/mês</span></div>
                </div>
                <div className="grid grid-cols-1 gap-3 p-6 bg-background-dark/50 rounded-3xl border border-dashed border-border-dark">
                  <div className="text-primary text-xl font-black flex items-center justify-between"><span>{plan.text_credits}</span><span className="text-[9px] text-slate-500 uppercase tracking-widest">Roteiros</span></div>
                  <div className="text-accent-green text-xl font-black flex items-center justify-between"><span>{plan.image_credits}</span><span className="text-[9px] text-slate-500 uppercase tracking-widest">Imagens</span></div>
                </div>
                <div className="space-y-4 flex-1 text-left">
                  <div className="text-xs font-bold text-white bg-primary/10 p-3 rounded-xl border border-primary/20 flex items-center gap-2"><span className="material-symbols-outlined text-primary">schedule</span>1 Crédito = {plan.minutes_per_credit} min</div>
                  {(plan.features || []).map((f, i) => <div key={i} className="flex items-center gap-3 text-sm text-slate-300"><span className="material-symbols-outlined text-primary text-lg">verified</span>{f}</div>)}
                </div>
                <button disabled={isCurrentPlan} onClick={() => handleOpenCheckout(plan)} className={`w-full py-4 rounded-2xl font-black text-sm uppercase tracking-widest transition-all active:scale-95 shadow-xl ${isCurrentPlan ? 'bg-slate-800 text-slate-500' : 'bg-primary text-white hover:bg-primary-hover shadow-primary/30'}`}>
                  {isCurrentPlan ? 'Plano Atual' : 'Assinar Agora'}
                </button>
              </div>
            );
          })}
        </div>
      )}

      {selectedPlanForCheckout && (
        <PaymentModal plan={selectedPlanForCheckout} loading={processingPayment} onClose={() => setSelectedPlanForCheckout(null)} onSelectStripe={handleStripeCheckout} />
      )}
    </div>
  );
};

export default Pricing;
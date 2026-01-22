
import React, { useState, useEffect } from 'react';
import Button from '../ui/Button';
import Badge from '../ui/Badge';
import { Input } from '../ui/Input';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../context/AuthContext';

interface PaymentModalProps {
  plan: {
    id: string;
    name: string;
    price: number;
    stripe_price_id?: string;
  };
  onClose: () => void;
  onSelectStripe: () => void;
  loading: boolean;
}

const PIX_CACHE_KEY = 'darkflow_active_pix';

const PaymentModal: React.FC<PaymentModalProps> = ({ plan, onClose, onSelectStripe, loading: externalLoading }) => {
  const { user, profile, refreshProfile } = useAuth();
  const [step, setStep] = useState<'method' | 'data' | 'qrcode'>('method');
  const [internalLoading, setInternalLoading] = useState(false);
  const [checkingStatus, setCheckingStatus] = useState(false);
  const [pixData, setPixData] = useState<any>(null);
  const [customerData, setCustomerData] = useState({
    name: profile?.display_name || '',
    email: user?.email || '',
    cellphone: profile?.cellphone || '',
    taxId: profile?.tax_id || ''
  });

  useEffect(() => {
    const cached = localStorage.getItem(PIX_CACHE_KEY);
    if (cached) {
      try {
        const parsed = JSON.parse(cached);
        if (parsed.userId === user?.id && parsed.planId === plan.id) {
          const expiry = new Date(parsed.pix.expiresAt).getTime();
          if (expiry > Date.now()) {
            setPixData(parsed.pix);
            setStep('qrcode');
          } else {
            localStorage.removeItem(PIX_CACHE_KEY);
          }
        }
      } catch (e) {
        localStorage.removeItem(PIX_CACHE_KEY);
      }
    }
  }, [user?.id, plan.id]);

  const isLoading = externalLoading || internalLoading;

  const handleGeneratePix = async () => {
    if (!customerData.name || !customerData.cellphone || !customerData.taxId) {
      alert("Por favor, preencha todos os campos.");
      return;
    }

    setInternalLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('create-pix-payment', {
        body: { planId: plan.id, userId: user?.id, customerData }
      });
      if (error) throw error;
      const newPixData = data.data;
      setPixData(newPixData);
      localStorage.setItem(PIX_CACHE_KEY, JSON.stringify({ userId: user?.id, planId: plan.id, pix: newPixData }));
      await refreshProfile();
      setStep('qrcode');
    } catch (err: any) {
      alert("Erro ao gerar PIX: " + err.message);
    } finally {
      setInternalLoading(false);
    }
  };

  const handleCheckStatus = async () => {
    if (!pixData?.id) return;
    setCheckingStatus(true);
    try {
      const { data, error } = await supabase.functions.invoke('check-pix-status', {
        body: { pixId: pixData.id, userId: user?.id, planId: plan.id }
      });
      if (error) throw error;
      if (data.status === 'PAID') {
        alert("Pagamento confirmado!");
        localStorage.removeItem(PIX_CACHE_KEY);
        await refreshProfile();
        onClose();
      } else {
        alert("Aguardando confirmação do banco...");
      }
    } catch (err: any) {
      alert("Erro ao verificar status: " + err.message);
    } finally {
      setCheckingStatus(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    alert("Código copiado!");
  };

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 animate-in fade-in duration-300">
      <div className="absolute inset-0 bg-black/95 backdrop-blur-lg" onClick={onClose} />
      <div className="relative bg-surface-dark border border-border-dark w-full max-w-md p-8 rounded-[40px] shadow-2xl space-y-8 animate-in zoom-in-95 duration-300">
        
        {step === 'method' && (
          <div className="space-y-6">
            <div className="text-center space-y-2">
              <Badge variant="primary">Checkout Seguro</Badge>
              <h3 className="text-2xl font-black text-white uppercase italic tracking-tight">Assinar {plan.name}</h3>
            </div>
            <div className="space-y-4">
              <button disabled={isLoading} onClick={onSelectStripe} className="w-full p-6 bg-background-dark/50 border border-border-dark rounded-[24px] flex items-center gap-5 hover:border-primary transition-all group">
                <div className="size-12 bg-primary/10 rounded-xl flex items-center justify-center text-primary border border-primary/20"><span className="material-symbols-outlined">credit_card</span></div>
                <div className="text-left flex-1"><p className="text-sm font-black text-white uppercase">Cartão de Crédito</p></div>
              </button>
              <button disabled={isLoading} onClick={() => setStep('data')} className="w-full p-6 bg-background-dark/50 border border-border-dark rounded-[24px] flex items-center gap-5 hover:border-accent-green transition-all group">
                <div className="size-12 bg-accent-green/10 rounded-xl flex items-center justify-center text-accent-green border border-accent-green/20"><span className="material-symbols-outlined">pix</span></div>
                <div className="text-left flex-1"><p className="text-sm font-black text-white uppercase">PIX Instantâneo</p></div>
              </button>
            </div>
          </div>
        )}

        {step === 'data' && (
          <div className="space-y-6">
            <h3 className="text-xl font-black text-white uppercase italic">Dados de Faturamento</h3>
            <div className="space-y-4 text-left">
              <Input label="Nome Completo" value={customerData.name} onChange={(e) => setCustomerData({...customerData, name: e.target.value})} />
              <div className="grid grid-cols-2 gap-4">
                <Input label="Celular" value={customerData.cellphone} onChange={(e) => setCustomerData({...customerData, cellphone: e.target.value})} />
                <Input label="CPF/CNPJ" value={customerData.taxId} onChange={(e) => setCustomerData({...customerData, taxId: e.target.value})} />
              </div>
            </div>
            <div className="flex flex-col gap-3">
              <Button fullWidth size="lg" loading={isLoading} onClick={handleGeneratePix}>Gerar PIX</Button>
              <Button variant="ghost" fullWidth onClick={() => setStep('method')}>Voltar</Button>
            </div>
          </div>
        )}

        {step === 'qrcode' && pixData && (
          <div className="space-y-6 text-center">
            <div className="bg-white p-4 rounded-[32px] inline-block shadow-2xl">
              <img src={pixData.brCodeBase64} alt="QR Code" className="size-64" />
            </div>
            
            <Button 
              fullWidth 
              variant="success" 
              loading={checkingStatus} 
              onClick={handleCheckStatus}
              className="py-6 text-lg shadow-[0_0_30px_rgba(57,255,20,0.4)] animate-pulse hover:animate-none font-black uppercase italic"
            >
              Já realizei o pagamento
            </Button>

            <div className="bg-background-dark/50 border border-border-dark p-4 rounded-2xl">
              <p className="text-[10px] font-black text-slate-500 uppercase mb-2 text-left">Pix Copia e Cola</p>
              <div className="flex gap-2">
                <input className="flex-1 bg-surface-dark border-none rounded-lg px-3 py-2 text-[10px] text-slate-400 font-mono outline-none" value={pixData.brCode} readOnly />
                <Button variant="primary" size="sm" onClick={() => copyToClipboard(pixData.brCode)}>Copiar</Button>
              </div>
            </div>
            <Button variant="ghost" fullWidth onClick={onClose}>Fechar e aguardar</Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default PaymentModal;
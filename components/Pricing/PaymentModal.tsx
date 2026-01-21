
import React from 'react';
import Button from '../ui/Button';
import Badge from '../ui/Badge';

interface PaymentModalProps {
  plan: {
    id: string;
    name: string;
    price: number;
    stripe_price_id?: string;
  };
  onClose: () => void;
  onSelectStripe: () => void;
  onSelectPix: () => void;
  loading: boolean;
}

const PaymentModal: React.FC<PaymentModalProps> = ({ plan, onClose, onSelectStripe, onSelectPix, loading }) => {
  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 animate-in fade-in duration-300">
      <div className="absolute inset-0 bg-black/95 backdrop-blur-lg" onClick={onClose} />
      
      <div className="relative bg-surface-dark border border-border-dark w-full max-w-md p-8 rounded-[40px] shadow-2xl space-y-8 animate-in zoom-in-95 duration-300 overflow-hidden">
        {/* Detalhes do Plano */}
        <div className="text-center space-y-2">
          <Badge variant="primary">Checkout Seguro</Badge>
          <h3 className="text-2xl font-black text-white uppercase italic tracking-tight">Assinar {plan.name}</h3>
          <p className="text-slate-400 text-sm">Total a pagar: <span className="text-white font-black">R$ {plan.price}/mês</span></p>
        </div>

        <div className="space-y-4">
          <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] text-center mb-6">Escolha o método de pagamento</p>
          
          {/* Opção Stripe (Cartão) */}
          <button 
            disabled={loading}
            onClick={onSelectStripe}
            className="w-full p-6 bg-background-dark/50 border border-border-dark rounded-[24px] flex items-center gap-5 hover:border-primary hover:bg-primary/5 transition-all group active:scale-[0.98] disabled:opacity-50"
          >
            <div className="size-14 bg-primary/10 rounded-2xl flex items-center justify-center text-primary border border-primary/20 group-hover:scale-110 transition-transform flex-shrink-0">
              <span className="material-symbols-outlined text-3xl font-light">credit_card</span>
            </div>
            <div className="text-left flex-1 min-w-0">
              <p className="text-sm font-black text-white uppercase tracking-tight">Cartão de Crédito</p>
              <p className="text-[10px] text-slate-500 truncate">Processamento seguro via Stripe</p>
            </div>
            <span className="material-symbols-outlined text-slate-600 group-hover:text-primary transition-colors">arrow_forward_ios</span>
          </button>

          {/* Opção PIX */}
          <button 
            disabled={loading}
            onClick={onSelectPix}
            className="w-full p-6 bg-background-dark/50 border border-border-dark rounded-[24px] flex items-center gap-5 hover:border-accent-green hover:bg-accent-green/5 transition-all group active:scale-[0.98] disabled:opacity-50"
          >
            <div className="size-14 bg-accent-green/10 rounded-2xl flex items-center justify-center text-accent-green border border-accent-green/20 group-hover:scale-110 transition-transform flex-shrink-0">
              <span className="material-symbols-outlined text-3xl font-light">pix</span>
            </div>
            <div className="text-left flex-1 min-w-0">
              <p className="text-sm font-black text-white uppercase tracking-tight">Pagamento via PIX</p>
              <p className="text-[10px] text-slate-500 truncate">Liberação manual ou QR Code em breve</p>
            </div>
            <span className="material-symbols-outlined text-slate-600 group-hover:text-accent-green transition-colors">arrow_forward_ios</span>
          </button>
        </div>

        <div className="flex flex-col gap-3 pt-4 border-t border-border-dark/50">
          <Button variant="ghost" fullWidth onClick={onClose} disabled={loading}>Cancelar Checkout</Button>
          <div className="flex items-center justify-center gap-2 opacity-30 grayscale pointer-events-none">
             <span className="text-[8px] font-black uppercase text-slate-400">Ambiente de Criptografia:</span>
             <span className="material-symbols-outlined text-xs">lock</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentModal;

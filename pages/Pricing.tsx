
import React from 'react';

const Pricing: React.FC = () => {
  return (
    <div className="max-w-[1200px] mx-auto w-full px-6 py-10">
      <div className="flex flex-wrap justify-between items-end gap-6 mb-10">
        <div className="flex flex-col gap-3 max-w-2xl">
          <p className="text-white text-4xl font-black leading-tight tracking-tight">Planos e Créditos</p>
          <p className="text-slate-400 text-lg">Turbine seus canais dark com inteligência artificial de ponta.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
        {/* Starter Plan */}
        <div className="flex flex-col gap-6 rounded-2xl border border-border-dark bg-surface-dark p-8 hover:border-primary/30 transition-all">
          <h3 className="text-slate-500 text-sm font-bold uppercase tracking-widest">Iniciante</h3>
          <p className="flex items-baseline gap-1">
            <span className="text-white text-5xl font-black tracking-tighter">R$ 49</span>
            <span className="text-slate-500 text-lg">/mês</span>
          </p>
          <div className="p-4 bg-background-dark rounded-xl border border-dashed border-border-dark">
            <div className="text-accent-green text-2xl font-black">50 Créditos</div>
          </div>
          <button className="flex w-full items-center justify-center rounded-lg h-12 px-4 bg-slate-800 text-white text-sm font-bold hover:brightness-125">
            Assinar Agora
          </button>
        </div>

        {/* Pro Plan */}
        <div className="flex flex-col gap-6 rounded-2xl border-2 border-primary bg-surface-dark p-8 relative shadow-2xl transform md:scale-105 z-10">
          <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-primary text-black text-[10px] font-black uppercase px-4 py-1 rounded-full">Melhor Custo Benefício</div>
          <h3 className="text-primary text-sm font-bold uppercase tracking-widest">Profissional</h3>
          <p className="flex items-baseline gap-1">
            <span className="text-white text-5xl font-black tracking-tighter">R$ 99</span>
            <span className="text-slate-500 text-lg">/mês</span>
          </p>
          <div className="p-4 bg-primary/10 rounded-xl border border-primary/20">
            <div className="text-primary text-2xl font-black">200 Créditos</div>
          </div>
          <button className="flex w-full items-center justify-center rounded-lg h-12 px-4 bg-primary text-black text-sm font-bold hover:scale-[1.02] shadow-lg shadow-primary/20">
            Começar Agora
          </button>
        </div>

        {/* Agency Plan */}
        <div className="flex flex-col gap-6 rounded-2xl border border-border-dark bg-surface-dark p-8 hover:border-primary/30 transition-all">
          <h3 className="text-slate-500 text-sm font-bold uppercase tracking-widest">Agência</h3>
          <p className="flex items-baseline gap-1">
            <span className="text-white text-5xl font-black tracking-tighter">R$ 249</span>
            <span className="text-slate-500 text-lg">/mês</span>
          </p>
          <div className="p-4 bg-background-dark rounded-xl border border-dashed border-border-dark">
            <div className="text-accent-green text-2xl font-black">600 Créditos</div>
          </div>
          <button className="flex w-full items-center justify-center rounded-lg h-12 px-4 bg-slate-800 text-white text-sm font-bold hover:brightness-125">
            Falar com Vendas
          </button>
        </div>
      </div>
    </div>
  );
};

export default Pricing;

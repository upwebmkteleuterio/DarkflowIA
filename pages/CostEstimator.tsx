
import React, { useState } from 'react';

const CostEstimator: React.FC = () => {
  const [videoCount, setVideoCount] = useState(10);
  
  // Preços oficiais médios (em USD) convertidos para estimativa por unidade
  // Gemini 1.5 Pro: ~$1.25 / 1M input tokens | ~$5.00 / 1M output tokens
  // Gemini 1.5 Flash: ~$0.10 / 1M tokens
  // Imagen / Flash Image: ~$0.02 - $0.03 por imagem
  
  const COST_PER_SCRIPT = 0.0035; // Média de um roteiro de 10-12 min (Gemini Pro)
  const COST_PER_SEO = 0.0001;    // Média de metadados (Gemini Flash)
  const COST_PER_IMAGE = 0.025;   // Média por geração de thumbnail (Flash Image)
  
  const totalScriptCost = videoCount * COST_PER_SCRIPT;
  const totalSEOCost = videoCount * COST_PER_SEO;
  const totalImageCost = videoCount * COST_PER_IMAGE * 2; // Simula 2 imagens por vídeo
  const totalProjectCost = totalScriptCost + totalSEOCost + totalImageCost;

  return (
    <div className="max-w-[1000px] mx-auto px-6 py-12 animate-in fade-in duration-700">
      <div className="mb-10 text-center">
        <h2 className="text-4xl font-black text-white font-display tracking-tight uppercase">
          Calculadora de <span className="text-primary italic">Custos API</span>
        </h2>
        <p className="text-slate-500 mt-2 font-medium">Estime seus gastos mensais de infraestrutura IA para precificar seus planos.</p>
      </div>

      <div className="bg-surface-dark border border-border-dark p-8 rounded-[40px] shadow-2xl mb-10">
        <div className="flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="flex-1 space-y-4">
             <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Simular Produção Mensal (Vídeos)</label>
             <div className="flex items-center gap-6">
                <input 
                  type="range" min="10" max="1000" step="10"
                  value={videoCount}
                  onChange={(e) => setVideoCount(parseInt(e.target.value))}
                  className="flex-1 h-2 bg-background-dark rounded-lg appearance-none cursor-pointer accent-primary"
                />
                <span className="bg-primary/20 text-primary text-xl font-black px-4 py-2 rounded-2xl border border-primary/20">{videoCount}</span>
             </div>
          </div>
          
          <div className="bg-background-dark/50 border border-border-dark rounded-3xl p-6 min-w-[280px] text-center">
             <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Custo Total Estimado</p>
             <p className="text-4xl font-black text-accent-green leading-none mb-1">${totalProjectCost.toFixed(2)}</p>
             <p className="text-[9px] text-slate-600 font-bold uppercase tracking-widest italic">Valores em Dólar (USD)</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-surface-dark border border-border-dark p-6 rounded-3xl flex flex-col items-center text-center">
          <div className="size-12 bg-blue-500/10 text-blue-400 rounded-2xl flex items-center justify-center mb-4">
            <span className="material-symbols-outlined text-2xl">description</span>
          </div>
          <h4 className="text-xs font-black text-white uppercase tracking-widest mb-1">Roteiros (Scripts)</h4>
          <p className="text-2xl font-black text-white">${totalScriptCost.toFixed(4)}</p>
          <p className="text-[9px] text-slate-500 mt-2 uppercase font-bold tracking-widest">
            Média: $0.35 a cada 100 vídeos
          </p>
        </div>

        <div className="bg-surface-dark border border-border-dark p-6 rounded-3xl flex flex-col items-center text-center">
          <div className="size-12 bg-primary/10 text-primary rounded-2xl flex items-center justify-center mb-4">
            <span className="material-symbols-outlined text-2xl">image</span>
          </div>
          <h4 className="text-xs font-black text-white uppercase tracking-widest mb-1">Thumbnails</h4>
          <p className="text-2xl font-black text-white">${totalImageCost.toFixed(4)}</p>
          <p className="text-[9px] text-slate-500 mt-2 uppercase font-bold tracking-widest">
            Média: $0.025 por imagem
          </p>
        </div>

        <div className="bg-surface-dark border border-border-dark p-6 rounded-3xl flex flex-col items-center text-center">
          <div className="size-12 bg-accent-green/10 text-accent-green rounded-2xl flex items-center justify-center mb-4">
            <span className="material-symbols-outlined text-2xl">trending_up</span>
          </div>
          <h4 className="text-xs font-black text-white uppercase tracking-widest mb-1">SEO & Tags</h4>
          <p className="text-2xl font-black text-white">${totalSEOCost.toFixed(4)}</p>
          <p className="text-[9px] text-slate-500 mt-2 uppercase font-bold tracking-widest">
            Média: $0.10 a cada 1000 vídeos
          </p>
        </div>
      </div>

      <div className="mt-12 bg-background-dark/30 border border-border-dark/50 rounded-[32px] p-8">
         <h4 className="text-sm font-black text-white uppercase tracking-tight mb-6 flex items-center gap-2">
            <span className="material-symbols-outlined text-primary">info</span>
            Notas sobre os custos de API
         </h4>
         <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-3">
               <p className="text-xs text-slate-400 leading-relaxed">
                  <strong className="text-white">Roteiros:</strong> Utilizamos o Gemini 3 Pro para garantir scripts de alta qualidade. O custo é calculado por tokens (aproximadamente 3 tokens por palavra). 1000 caracteres custam menos de <span className="text-primary">$0,001</span>.
               </p>
               <p className="text-xs text-slate-400 leading-relaxed">
                  <strong className="text-white">Imagens:</strong> O modelo Flash Image é extremamente eficiente. O custo fixo é por imagem gerada, independente da complexidade do prompt.
               </p>
            </div>
            <div className="space-y-3">
               <p className="text-xs text-slate-400 leading-relaxed">
                  <strong className="text-white">Escalabilidade:</strong> Com esses custos, uma assinatura de R$ 99 (aprox. $18) que permite 200 créditos (20 vídeos) custa para você apenas <span className="text-accent-green font-bold">~$1.20</span> em API. Margem de lucro superior a 90%.
               </p>
               <p className="text-xs text-slate-400 italic">
                  *Valores estimados com base na tabela da Google Vertex AI de Março/2025.
               </p>
            </div>
         </div>
      </div>
    </div>
  );
};

export default CostEstimator;

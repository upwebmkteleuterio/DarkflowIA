
import React, { useState } from 'react';

const CostEstimator: React.FC = () => {
  // Quantidades individuais
  const [scriptCount, setScriptCount] = useState(10);
  const [imageCount, setImageCount] = useState(20);
  const [seoCount, setSeoCount] = useState(10);
  
  /**
   * CUSTOS BASEADOS NA TABELA GOOGLE VERTEX AI (MARÇO/2025)
   * 
   * 1. Roteiro (Gemini 3 Flash): 
   *    Base: Roteiro de 30 min ~ 5.000 palavras (~6.650 tokens).
   *    Preço: $0.10 por 1 milhão de tokens de saída.
   *    Cálculo: (6650 / 1.000.000) * 0.10 = ~$0.000665. 
   *    Margem de segurança para input/contexto: $0.0007 por roteiro.
   * 
   * 2. Imagens (Gemini 2.5 Flash Image):
   *    Preço Fixo: $0.025 por imagem gerada.
   * 
   * 3. SEO (Gemini 3 Flash):
   *    Preço: Quase nulo. Estimativa de $0.0005 por geração de lote.
   */
  
  const PRICE_PER_SCRIPT = 0.0007; // Roteiro de 30 min (Gemini 3 Flash)
  const PRICE_PER_IMAGE = 0.025;  // Por imagem
  const PRICE_PER_SEO = 0.0005;   // Por lote SEO

  const totalScriptCost = scriptCount * PRICE_PER_SCRIPT;
  const totalImageCost = imageCount * PRICE_PER_IMAGE;
  const totalSEOCost = seoCount * PRICE_PER_SEO;
  const grandTotal = totalScriptCost + totalImageCost + totalSEOCost;

  return (
    <div className="max-w-[1100px] mx-auto px-6 py-12 animate-in fade-in duration-700">
      <div className="mb-12 text-center">
        <h2 className="text-4xl font-black text-white font-display tracking-tight uppercase">
          Calculadora de <span className="text-primary italic">Custos API</span>
        </h2>
        <p className="text-slate-500 mt-2 font-medium">Estime seus gastos mensais de IA para precificar seus planos de assinatura.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
        {/* Painel de Controles */}
        <div className="lg:col-span-2 space-y-8 bg-surface-dark border border-border-dark p-8 rounded-[40px] shadow-2xl">
          
          {/* Seção Roteiro */}
          <div className="space-y-4">
            <div className="flex justify-between items-end">
              <div>
                <h4 className="text-sm font-black text-white uppercase tracking-tight flex items-center gap-2">
                  <span className="material-symbols-outlined text-primary text-lg">description</span>
                  Produção de Roteiros
                </h4>
                <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-1">Base: Roteiros de 30 min (IA Flash)</p>
              </div>
              <div className="text-right">
                <span className="text-2xl font-black text-white">{scriptCount}</span>
                <p className="text-[9px] text-slate-600 font-black uppercase tracking-widest">Unidades</p>
              </div>
            </div>
            <input 
              type="range" min="0" max="1000" step="10"
              value={scriptCount}
              onChange={(e) => setScriptCount(parseInt(e.target.value))}
              className="w-full"
            />
            <div className="flex justify-between text-[10px] font-black text-slate-600 uppercase tracking-widest">
              <span>0</span>
              <div className="flex items-center gap-2 bg-background-dark px-3 py-1 rounded-full border border-border-dark">
                <span className="text-primary">Custo desta seção:</span>
                <span className="text-white">${totalScriptCost.toFixed(4)}</span>
              </div>
              <span>1000</span>
            </div>
          </div>

          <div className="h-px bg-border-dark/50"></div>

          {/* Seção Imagens */}
          <div className="space-y-4">
            <div className="flex justify-between items-end">
              <div>
                <h4 className="text-sm font-black text-white uppercase tracking-tight flex items-center gap-2">
                  <span className="material-symbols-outlined text-accent-green text-lg">image</span>
                  Geração de Imagens
                </h4>
                <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-1">Thumbnail / Backgrounds (IA Flash)</p>
              </div>
              <div className="text-right">
                <span className="text-2xl font-black text-white">{imageCount}</span>
                <p className="text-[9px] text-slate-600 font-black uppercase tracking-widest">Gerações</p>
              </div>
            </div>
            <input 
              type="range" min="0" max="2000" step="10"
              value={imageCount}
              onChange={(e) => setImageCount(parseInt(e.target.value))}
              className="w-full"
            />
            <div className="flex justify-between text-[10px] font-black text-slate-600 uppercase tracking-widest">
              <span>0</span>
              <div className="flex items-center gap-2 bg-background-dark px-3 py-1 rounded-full border border-border-dark">
                <span className="text-accent-green">Custo desta seção:</span>
                <span className="text-white">${totalImageCost.toFixed(2)}</span>
              </div>
              <span>2000</span>
            </div>
          </div>

          <div className="h-px bg-border-dark/50"></div>

          {/* Seção SEO */}
          <div className="space-y-4">
            <div className="flex justify-between items-end">
              <div>
                <h4 className="text-sm font-black text-white uppercase tracking-tight flex items-center gap-2">
                  <span className="material-symbols-outlined text-blue-400 text-lg">trending_up</span>
                  Otimização de SEO
                </h4>
                <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-1">Tags, Metadados e Capítulos (IA Flash)</p>
              </div>
              <div className="text-right">
                <span className="text-2xl font-black text-white">{seoCount}</span>
                <p className="text-[9px] text-slate-600 font-black uppercase tracking-widest">Gerações</p>
              </div>
            </div>
            <input 
              type="range" min="0" max="500" step="5"
              value={seoCount}
              onChange={(e) => setSeoCount(parseInt(e.target.value))}
              className="w-full"
            />
            <div className="flex justify-between text-[10px] font-black text-slate-600 uppercase tracking-widest">
              <span>0</span>
              <div className="flex items-center gap-2 bg-background-dark px-3 py-1 rounded-full border border-border-dark">
                <span className="text-blue-400">Custo desta seção:</span>
                <span className="text-white">${totalSEOCost.toFixed(4)}</span>
              </div>
              <span>500</span>
            </div>
          </div>

        </div>

        {/* Card de Resultado Final */}
        <div className="space-y-6">
           <div className="bg-card-dark border-2 border-primary rounded-[40px] p-8 shadow-2xl relative overflow-hidden h-full flex flex-col justify-between">
              <div className="absolute -top-10 -right-10 size-40 bg-primary/10 rounded-full blur-3xl"></div>
              
              <div>
                <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] mb-4">Resumo da Operação</h3>
                <div className="space-y-4 mb-8">
                   <div className="flex justify-between text-sm">
                      <span className="text-slate-400">Roteiros (30m)</span>
                      <span className="text-white font-bold">${totalScriptCost.toFixed(4)}</span>
                   </div>
                   <div className="flex justify-between text-sm">
                      <span className="text-slate-400">Imagens</span>
                      <span className="text-white font-bold">${totalImageCost.toFixed(2)}</span>
                   </div>
                   <div className="flex justify-between text-sm">
                      <span className="text-slate-400">SEO & Tags</span>
                      <span className="text-white font-bold">${totalSEOCost.toFixed(4)}</span>
                   </div>
                </div>
              </div>

              <div className="pt-8 border-t border-border-dark/50">
                <p className="text-[10px] font-black text-primary uppercase tracking-widest mb-1">Custo Total de API</p>
                <p className="text-6xl font-black text-white leading-none">${grandTotal.toFixed(2)}</p>
                <p className="text-[9px] text-slate-500 font-bold uppercase tracking-widest mt-4 italic">Valores calculados em Dólar (USD)</p>
                
                <div className="mt-8 bg-primary text-black font-black text-[10px] uppercase p-4 rounded-2xl text-center shadow-lg">
                  Sugestão de Plano: R$ 14 - R$ 24 /mês
                </div>
              </div>
           </div>
        </div>
      </div>

      {/* Tabela de Referência de Preços (Grounding) */}
      <div className="bg-surface-dark border border-border-dark rounded-[32px] overflow-hidden shadow-xl">
         <div className="bg-background-dark/50 p-6 border-b border-border-dark">
            <h4 className="text-xs font-black text-white uppercase tracking-widest">Tabela de Referência da IA (Oficial)</h4>
         </div>
         <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
               <thead>
                  <tr className="bg-background-dark/30 text-slate-500 font-black uppercase tracking-tighter">
                     <th className="px-6 py-4">Serviço</th>
                     <th className="px-6 py-4">Modelo Recomendado</th>
                     <th className="px-6 py-4">Consumo Médio</th>
                     <th className="px-6 py-4">Custo Unitário</th>
                  </tr>
               </thead>
               <tbody className="divide-y divide-border-dark/50 text-slate-300">
                  <tr>
                     <td className="px-6 py-4 font-bold text-white">Roteiro (Longa Duração)</td>
                     <td className="px-6 py-4">Gemini 3 Flash</td>
                     <td className="px-6 py-4">~7k Tokens (30 Minutos)</td>
                     <td className="px-6 py-4 text-accent-green">$0,0007</td>
                  </tr>
                  <tr>
                     <td className="px-6 py-4 font-bold text-white">Imagens HD</td>
                     <td className="px-6 py-4">Gemini 2.5 Flash Image</td>
                     <td className="px-6 py-4">1 Geração por Capa</td>
                     <td className="px-6 py-4 text-accent-green">$0,025</td>
                  </tr>
                  <tr>
                     <td className="px-6 py-4 font-bold text-white">Metadados SEO</td>
                     <td className="px-6 py-4">Gemini 3 Flash</td>
                     <td className="px-6 py-4">~1k Tokens (Tags/Desc)</td>
                     <td className="px-6 py-4 text-accent-green">$0,0005</td>
                  </tr>
               </tbody>
            </table>
         </div>
      </div>
    </div>
  );
};

export default CostEstimator;

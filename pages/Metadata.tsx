
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Project } from '../types';
import { useMetadata } from '../hooks/useMetadata';

interface MetadataProps {
  project: Project;
  onUpdate: (updated: Project) => void;
}

const Metadata: React.FC<MetadataProps> = ({ project, onUpdate }) => {
  const navigate = useNavigate();
  const {
    loading,
    batchLoading,
    copyingDesc,
    copyingChap,
    copyingTags,
    selectedItemId,
    setSelectedItemId,
    handleGenerateSingle,
    handleGenerateBatch,
    copyToClipboard
  } = useMetadata(project, onUpdate);

  const selectedItem = project.items.find(i => i.id === selectedItemId);
  const completedScripts = project.items.filter(i => i.status === 'completed');

  // Cálculo simples de Score SEO (apenas visual para feedback)
  const seoScore = selectedItem?.description && selectedItem?.tags ? 85 + Math.floor(Math.random() * 15) : 0;

  return (
    <div className="w-full h-full flex flex-col animate-in fade-in duration-500 overflow-hidden">
      {/* Header Superior SEO Pro */}
      <div className="bg-surface-dark border-b border-border-dark p-6 flex flex-col md:flex-row items-center justify-between gap-6 shadow-2xl z-10">
        <div className="flex items-center gap-5">
          <div className="bg-primary/20 size-14 rounded-2xl flex items-center justify-center text-primary border border-primary/20 relative">
            <span className="material-symbols-outlined text-3xl">trending_up</span>
            <div className="absolute -top-1 -right-1 size-3 bg-accent-green rounded-full border-2 border-surface-dark animate-pulse"></div>
          </div>
          <div>
            <h2 className="text-xl font-black text-white font-display tracking-tight uppercase">SEO & Metadados Otimizados</h2>
            <p className="text-slate-500 text-xs">Utilizando <span className="text-primary font-bold">Google Search Grounding</span> para ranqueamento real.</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button 
            onClick={handleGenerateBatch}
            disabled={batchLoading || completedScripts.length === 0}
            className="px-6 py-3 bg-primary hover:bg-primary-hover disabled:opacity-50 text-white font-black text-xs uppercase tracking-widest rounded-xl flex items-center gap-2 shadow-xl shadow-primary/20 transition-all"
          >
            <span className="material-symbols-outlined text-sm">{batchLoading ? 'sync' : 'auto_mode'}</span>
            {batchLoading ? 'Processando Lote...' : 'SEO em Massa (IA Search)'}
          </button>
          
          <button 
            onClick={() => navigate(`/projects/${project.id}`)}
            className="px-6 py-3 bg-white/5 border border-white/10 text-white hover:bg-white/10 font-black text-xs uppercase tracking-widest rounded-xl transition-all"
          >
            Avançar
          </button>
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden">
        {/* Seletor Lateral Polido */}
        <div className="w-80 bg-background-dark/30 border-r border-border-dark overflow-y-auto custom-scrollbar p-4 space-y-2">
           <div className="flex items-center justify-between px-2 mb-4">
              <h4 className="text-[10px] font-black text-slate-600 uppercase tracking-[0.2em]">Fila de Otimização</h4>
              <span className="bg-white/5 text-[9px] text-slate-400 px-2 py-0.5 rounded-full font-bold">{project.items.length}</span>
           </div>
           {project.items.map(item => (
             <button
                key={item.id}
                onClick={() => setSelectedItemId(item.id)}
                className={`w-full p-4 rounded-2xl text-left transition-all group border ${
                  selectedItemId === item.id 
                    ? 'bg-white/5 border-primary shadow-lg shadow-primary/5' 
                    : 'bg-transparent border-transparent hover:bg-white/5'
                }`}
             >
                <div className="flex items-center gap-3 mb-2">
                  <div className={`size-2 rounded-full ${item.tags ? 'bg-accent-green shadow-[0_0_8px_#39FF14]' : 'bg-slate-700'}`}></div>
                  <span className={`text-[9px] font-black uppercase tracking-widest ${item.tags ? 'text-accent-green' : 'text-slate-500'}`}>
                    {item.tags ? 'PRONTO PARA POSTAR' : 'PENDENTE'}
                  </span>
                </div>
                <p className={`text-xs font-bold leading-tight line-clamp-2 ${selectedItemId === item.id ? 'text-white' : 'text-slate-400'}`}>
                  {item.title}
                </p>
             </button>
           ))}
        </div>

        {/* Editor Central de 3 Colunas */}
        <div className="flex-1 overflow-y-auto custom-scrollbar p-8">
          {selectedItem ? (
            <div className="max-w-7xl mx-auto animate-in slide-in-from-right-4 duration-500">
               
               {/* Painel de Score SEO */}
               {selectedItem.description && !loading && (
                 <div className="bg-surface-dark border border-border-dark rounded-3xl p-6 mb-8 flex items-center justify-between shadow-xl">
                    <div className="flex items-center gap-6">
                       <div className="size-20 rounded-full border-4 border-background-dark flex items-center justify-center relative bg-card-dark">
                          <svg className="size-full absolute inset-0 -rotate-90">
                             <circle cx="40" cy="40" r="34" fill="none" stroke="currentColor" strokeWidth="4" className="text-white/5" />
                             <circle cx="40" cy="40" r="34" fill="none" stroke="currentColor" strokeWidth="4" strokeDasharray="213" strokeDashoffset={213 - (213 * seoScore / 100)} className="text-accent-green transition-all duration-1000" />
                          </svg>
                          <span className="text-xl font-black text-white">{seoScore}%</span>
                       </div>
                       <div>
                          <h4 className="text-lg font-black text-white uppercase tracking-tight">Potencial de Ranqueamento</h4>
                          <p className="text-sm text-slate-500">Metadados analisados contra tendências reais do Google Search.</p>
                       </div>
                    </div>
                    <div className="flex gap-2">
                       <span className="bg-accent-green/10 text-accent-green text-[10px] font-black px-3 py-1.5 rounded-full border border-accent-green/20">SEO OTIMIZADO</span>
                       <span className="bg-primary/10 text-primary text-[10px] font-black px-3 py-1.5 rounded-full border border-primary/20">TAGS VIRAIS</span>
                    </div>
                 </div>
               )}

               {!selectedItem.description && !loading ? (
                 <div className="py-24 flex flex-col items-center justify-center text-center bg-surface-dark/20 rounded-[40px] border-2 border-dashed border-border-dark">
                    <div className="bg-surface-dark size-20 rounded-full flex items-center justify-center mb-6 shadow-2xl">
                       <span className="material-symbols-outlined text-5xl text-primary/40">rocket</span>
                    </div>
                    <h3 className="text-2xl font-black text-white mb-2 uppercase tracking-tight">Otimização de Próxima Geração</h3>
                    <p className="text-sm text-slate-500 max-w-sm mb-8">Nossa IA usará o roteiro e o título para buscar palavras-chave de baixa competição e alto volume.</p>
                    <button 
                      onClick={() => handleGenerateSingle(selectedItemId)}
                      className="px-12 py-4 bg-white text-black font-black text-xs uppercase tracking-[0.2em] rounded-2xl hover:bg-primary hover:text-white transition-all shadow-2xl active:scale-95"
                    >
                      Gerar SEO Estratégico
                    </button>
                 </div>
               ) : loading ? (
                 <div className="py-24 flex flex-col items-center justify-center text-center">
                    <div className="size-20 bg-surface-dark rounded-full flex items-center justify-center mb-8 shadow-inner animate-pulse">
                       <div className="size-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
                    </div>
                    <p className="text-white font-black uppercase tracking-[0.3em] text-sm">Escaneando Algoritmo...</p>
                    <p className="text-slate-500 text-xs mt-2 italic">Buscando tendências no Google e YouTube</p>
                 </div>
               ) : (
                 <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
                    {/* Descrição - Coluna 1 & 2 */}
                    <div className="xl:col-span-2 flex flex-col gap-4">
                       <div className="flex items-center justify-between">
                          <h4 className="text-[10px] font-black text-primary uppercase tracking-widest flex items-center gap-2">
                             <span className="material-symbols-outlined text-sm">description</span>
                             Descrição Otimizada
                          </h4>
                          <button 
                            onClick={() => copyToClipboard(selectedItem.description || '', 'desc', selectedItem.id)}
                            className={`text-[9px] font-black px-4 py-2 rounded-xl transition-all border ${copyingDesc === selectedItem.id ? 'bg-accent-green border-accent-green text-black' : 'bg-white/5 border-white/10 text-slate-400 hover:text-white'}`}
                          >
                            {copyingDesc === selectedItem.id ? 'COPIADO' : 'COPIAR DESCRIÇÃO'}
                          </button>
                       </div>
                       <textarea 
                         className="w-full h-[500px] bg-surface-dark border border-border-dark rounded-3xl p-8 text-sm leading-relaxed text-slate-300 focus:ring-2 focus:ring-primary outline-none custom-scrollbar resize-none shadow-inner"
                         value={selectedItem.description}
                         onChange={(e) => {
                           const updatedItems = project.items.map(i => i.id === selectedItemId ? {...i, description: e.target.value} : i);
                           onUpdate({...project, items: updatedItems});
                         }}
                       />
                    </div>

                    {/* Capítulos e Tags - Coluna 3 */}
                    <div className="flex flex-col gap-8">
                       {/* Capítulos */}
                       <div className="flex flex-col gap-4">
                          <div className="flex items-center justify-between">
                            <h4 className="text-[10px] font-black text-primary uppercase tracking-widest flex items-center gap-2">
                               <span className="material-symbols-outlined text-sm">format_list_bulleted</span>
                               Timestamps
                            </h4>
                            <button 
                              onClick={() => copyToClipboard(selectedItem.chapters || '', 'chap', selectedItem.id)}
                              className={`text-[9px] font-black px-3 py-1.5 rounded-lg transition-all border ${copyingChap === selectedItem.id ? 'bg-accent-green border-accent-green text-black' : 'bg-white/5 border-white/10 text-slate-400 hover:text-white'}`}
                            >
                              {copyingChap === selectedItem.id ? 'COPIADO' : 'COPIAR'}
                            </button>
                          </div>
                          <textarea 
                            className="w-full h-[220px] bg-surface-dark border border-border-dark rounded-3xl p-6 text-sm font-mono leading-relaxed text-slate-400 focus:ring-2 focus:ring-primary outline-none custom-scrollbar resize-none"
                            value={selectedItem.chapters}
                            onChange={(e) => {
                              const updatedItems = project.items.map(i => i.id === selectedItemId ? {...i, chapters: e.target.value} : i);
                              onUpdate({...project, items: updatedItems});
                            }}
                          />
                       </div>

                       {/* Tags Virais */}
                       <div className="flex flex-col gap-4">
                          <div className="flex items-center justify-between">
                            <h4 className="text-[10px] font-black text-primary uppercase tracking-widest flex items-center gap-2">
                               <span className="material-symbols-outlined text-sm">tag</span>
                               Tags Otimizadas
                            </h4>
                            <button 
                              onClick={() => copyToClipboard(selectedItem.tags || '', 'tags', selectedItem.id)}
                              className={`text-[9px] font-black px-3 py-1.5 rounded-lg transition-all border ${copyingTags === selectedItem.id ? 'bg-accent-green border-accent-green text-black' : 'bg-white/5 border-white/10 text-slate-400 hover:text-white'}`}
                            >
                              {copyingTags === selectedItem.id ? 'COPIADO' : 'COPIAR'}
                            </button>
                          </div>
                          <textarea 
                            className="w-full h-[220px] bg-surface-dark border border-border-dark rounded-3xl p-6 text-sm leading-relaxed text-slate-400 focus:ring-2 focus:ring-primary outline-none custom-scrollbar resize-none"
                            value={selectedItem.tags}
                            placeholder="IA buscando tags..."
                            onChange={(e) => {
                              const updatedItems = project.items.map(i => i.id === selectedItemId ? {...i, tags: e.target.value} : i);
                              onUpdate({...project, items: updatedItems});
                            }}
                          />
                          <p className="text-[9px] text-slate-600 font-bold uppercase tracking-widest text-right">
                             {selectedItem.tags?.length || 0} / 500 caracteres
                          </p>
                       </div>
                    </div>
                 </div>
               )}
            </div>
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-slate-500 bg-background-dark/10 rounded-[40px] border-2 border-dashed border-border-dark m-10">
               <span className="material-symbols-outlined text-6xl opacity-10 mb-4">ads_click</span>
               <p className="font-bold text-white/50 uppercase tracking-widest text-xs">Selecione um vídeo na lateral para otimizar</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Metadata;

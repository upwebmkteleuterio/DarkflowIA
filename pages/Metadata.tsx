
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
    selectedItemId,
    setSelectedItemId,
    handleGenerateSingle,
    handleGenerateBatch,
    copyToClipboard
  } = useMetadata(project, onUpdate);

  const selectedItem = project.items.find(i => i.id === selectedItemId);
  const completedScripts = project.items.filter(i => i.status === 'completed');

  return (
    <div className="w-full h-full flex flex-col animate-in fade-in duration-500 overflow-hidden">
      {/* Header Superior do Lote */}
      <div className="bg-surface-dark border-b border-border-dark p-6 flex flex-col md:flex-row items-center justify-between gap-6 shadow-2xl z-10">
        <div className="flex items-center gap-5">
          <div className="bg-primary/20 size-14 rounded-2xl flex items-center justify-center text-primary border border-primary/20">
            <span className="material-symbols-outlined text-3xl">campaign</span>
          </div>
          <div>
            <h2 className="text-xl font-black text-white font-display tracking-tight uppercase">Central de Metadados & SEO</h2>
            <p className="text-slate-500 text-xs">Otimização pronta para o algoritmo em todos os seus vídeos.</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button 
            onClick={handleGenerateBatch}
            disabled={batchLoading || completedScripts.length === 0}
            className="px-6 py-3 bg-primary hover:bg-primary-hover disabled:opacity-50 text-white font-black text-xs uppercase tracking-widest rounded-xl flex items-center gap-2 shadow-xl shadow-primary/20 transition-all"
          >
            <span className="material-symbols-outlined text-sm">{batchLoading ? 'sync' : 'bolt'}</span>
            {batchLoading ? 'Gerando Lote...' : 'Gerar SEO em Massa'}
          </button>
          
          <button 
            onClick={() => navigate('/')}
            className="px-6 py-3 bg-white/5 border border-white/10 text-white hover:bg-white/10 font-black text-xs uppercase tracking-widest rounded-xl transition-all"
          >
            Finalizar Projeto
          </button>
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden">
        {/* Seletor Lateral */}
        <div className="w-80 bg-background-dark/30 border-r border-border-dark overflow-y-auto custom-scrollbar p-4 space-y-2">
           <h4 className="text-[10px] font-black text-slate-600 uppercase tracking-[0.2em] mb-4 ml-2">Lista de Produção</h4>
           {project.items.map(item => (
             <button
                key={item.id}
                onClick={() => setSelectedItemId(item.id)}
                className={`w-full p-4 rounded-2xl text-left transition-all group border ${
                  selectedItemId === item.id 
                    ? 'bg-white/5 border-primary shadow-lg' 
                    : 'bg-transparent border-transparent hover:bg-white/5'
                }`}
             >
                <div className="flex items-center gap-3 mb-2">
                  <div className={`size-2 rounded-full ${item.description ? 'bg-accent-green shadow-[0_0_8px_#39FF14]' : 'bg-slate-700'}`}></div>
                  <span className={`text-[9px] font-black uppercase tracking-widest ${item.description ? 'text-accent-green' : 'text-slate-500'}`}>
                    {item.description ? 'SEO OTIMIZADO' : 'PENDENTE'}
                  </span>
                </div>
                <p className={`text-xs font-bold leading-tight line-clamp-2 ${selectedItemId === item.id ? 'text-white' : 'text-slate-400'}`}>
                  {item.title}
                </p>
             </button>
           ))}
        </div>

        {/* Editor de Metadados */}
        <div className="flex-1 overflow-y-auto custom-scrollbar p-8">
          {selectedItem ? (
            <div className="max-w-5xl mx-auto animate-in slide-in-from-right-4 duration-500">
               {!selectedItem.description && !loading ? (
                 <div className="py-24 flex flex-col items-center justify-center text-center bg-surface-dark/20 rounded-[40px] border-2 border-dashed border-border-dark">
                    <span className="material-symbols-outlined text-6xl text-slate-700 mb-6">psychology_alt</span>
                    <h3 className="text-xl font-bold text-white mb-2">Sem Metadados para este Vídeo</h3>
                    <p className="text-sm text-slate-500 max-w-sm mb-8">A IA precisa analisar o roteiro deste item para criar a descrição e os capítulos.</p>
                    <button 
                      onClick={() => handleGenerateSingle(selectedItemId)}
                      className="px-10 py-4 bg-white text-black font-black text-xs uppercase tracking-[0.2em] rounded-2xl hover:bg-primary hover:text-white transition-all shadow-2xl"
                    >
                      Gerar Agora
                    </button>
                 </div>
               ) : loading ? (
                 <div className="py-24 flex flex-col items-center justify-center text-center animate-pulse">
                    <div className="size-16 border-4 border-primary border-t-transparent rounded-full animate-spin mb-6"></div>
                    <p className="text-white font-black uppercase tracking-widest">Criando Estratégia SEO...</p>
                 </div>
               ) : (
                 <div className="space-y-8">
                    <div className="flex flex-col md:flex-row gap-8">
                       {/* Descrição */}
                       <div className="flex-1 flex flex-col gap-4">
                          <div className="flex items-center justify-between">
                            <span className="text-[10px] font-black text-primary uppercase tracking-widest">Descrição do Vídeo</span>
                            <button 
                              onClick={() => copyToClipboard(selectedItem.description || '', 'desc', selectedItem.id)}
                              className={`text-[10px] font-bold px-3 py-1.5 rounded-lg transition-all ${copyingDesc === selectedItem.id ? 'bg-accent-green text-black' : 'bg-white/5 text-slate-400 hover:text-white'}`}
                            >
                              {copyingDesc === selectedItem.id ? 'COPIADO' : 'COPIAR'}
                            </button>
                          </div>
                          <textarea 
                            className="w-full h-[400px] bg-surface-dark border border-border-dark rounded-2xl p-6 text-sm leading-relaxed text-slate-300 focus:ring-2 focus:ring-primary outline-none custom-scrollbar resize-none"
                            value={selectedItem.description}
                            onChange={(e) => {
                              const updatedItems = project.items.map(i => i.id === selectedItemId ? {...i, description: e.target.value} : i);
                              onUpdate({...project, items: updatedItems});
                            }}
                          />
                       </div>

                       {/* Capítulos */}
                       <div className="w-full md:w-[350px] flex flex-col gap-4">
                          <div className="flex items-center justify-between">
                            <span className="text-[10px] font-black text-primary uppercase tracking-widest">Capítulos / Timestamps</span>
                            <button 
                              onClick={() => copyToClipboard(selectedItem.chapters || '', 'chap', selectedItem.id)}
                              className={`text-[10px] font-bold px-3 py-1.5 rounded-lg transition-all ${copyingChap === selectedItem.id ? 'bg-accent-green text-black' : 'bg-white/5 text-slate-400 hover:text-white'}`}
                            >
                              {copyingChap === selectedItem.id ? 'COPIADO' : 'COPIAR'}
                            </button>
                          </div>
                          <textarea 
                            className="w-full h-[400px] bg-surface-dark border border-border-dark rounded-2xl p-6 text-sm font-mono leading-relaxed text-slate-300 focus:ring-2 focus:ring-primary outline-none custom-scrollbar resize-none"
                            value={selectedItem.chapters}
                            onChange={(e) => {
                              const updatedItems = project.items.map(i => i.id === selectedItemId ? {...i, chapters: e.target.value} : i);
                              onUpdate({...project, items: updatedItems});
                            }}
                          />
                       </div>
                    </div>

                    <div className="bg-primary/5 border border-primary/20 p-6 rounded-3xl flex items-center justify-between">
                       <div className="flex items-center gap-4">
                          <div className="bg-primary size-10 rounded-full flex items-center justify-center text-white">
                             <span className="material-symbols-outlined text-xl">verified</span>
                          </div>
                          <p className="text-sm text-slate-300">Este conteúdo foi otimizado para <span className="text-white font-bold">retenção orgânica</span> e busca do YouTube.</p>
                       </div>
                       <button 
                         onClick={() => handleGenerateSingle(selectedItemId)}
                         className="text-xs font-black text-primary uppercase tracking-widest hover:text-white transition-colors"
                       >
                         Regerar Versão
                       </button>
                    </div>
                 </div>
               )}
            </div>
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-slate-500">
               <span className="material-symbols-outlined text-6xl opacity-10">ads_click</span>
               <p>Selecione um vídeo na lista lateral para editar o SEO.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Metadata;

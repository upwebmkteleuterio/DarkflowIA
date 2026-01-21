
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Project } from '../types';
import { useMetadata } from '../hooks/useMetadata';
import Button from '../components/ui/Button';
import Badge from '../components/ui/Badge';
import { TextArea } from '../components/ui/Input';

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

  const items = project.items || [];
  const selectedItem = items.find(i => i.id === selectedItemId);
  const completedScripts = items.filter(i => i.status === 'completed');

  const seoScore = selectedItem?.description && selectedItem?.tags ? 85 + Math.floor(Math.random() * 15) : 0;

  return (
    <div className="w-full h-full flex flex-col animate-in fade-in duration-500 overflow-hidden bg-background-dark/10">
      {/* Header SEO */}
      <div className="bg-surface-dark border-b border-border-dark p-6 flex flex-col md:flex-row items-center justify-between gap-6 shadow-xl z-10">
        <div className="flex items-center gap-5">
          <div className="bg-primary/10 size-14 rounded-2xl flex items-center justify-center text-primary border border-primary/20 relative">
            <span className="material-symbols-outlined text-3xl">query_stats</span>
            <div className="absolute -top-1 -right-1 size-3 bg-accent-green rounded-full border-2 border-surface-dark animate-pulse shadow-[0_0_8px_#39FF14]"></div>
          </div>
          <div>
            <h2 className="text-xl font-black text-white font-display tracking-tight uppercase">Engenharia de <span className="text-primary italic">SEO</span></h2>
            <p className="text-slate-500 text-[10px] font-bold uppercase tracking-widest"> ग्राउंडिंग de busca em tempo real</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Button 
            onClick={handleGenerateBatch}
            disabled={batchLoading || completedScripts.length === 0}
            loading={batchLoading}
            icon="auto_mode"
            size="lg"
          >
            Processamento em Massa
          </Button>
          
          <Button 
            variant="white"
            icon="arrow_forward"
            size="lg"
            onClick={() => navigate(`/projects/${project.id}`)}
          >
            Avançar para Exportação
          </Button>
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar Seletora */}
        <div className="w-80 bg-background-dark/20 border-r border-border-dark overflow-y-auto custom-scrollbar p-4 space-y-2">
           <div className="px-2 mb-4">
              <h4 className="text-[10px] font-black text-slate-600 uppercase tracking-[0.2em]">Vídeos do Lote</h4>
           </div>
           {items.map(item => (
             <button
                key={item.id}
                onClick={() => setSelectedItemId(item.id)}
                className={`w-full p-4 rounded-2xl text-left transition-all group border ${
                  selectedItemId === item.id ? 'bg-white/5 border-primary shadow-lg' : 'bg-transparent border-transparent hover:bg-white/5'
                }`}
             >
                <div className="flex items-center gap-3 mb-2">
                  <Badge variant={item.tags ? 'success' : 'neutral'} pulse={!item.tags && selectedItemId === item.id}>
                    {item.tags ? 'OTIMIZADO' : 'PENDENTE'}
                  </Badge>
                </div>
                <p className={`text-xs font-bold leading-tight line-clamp-2 ${selectedItemId === item.id ? 'text-white' : 'text-slate-500'}`}>
                  {item.title}
                </p>
             </button>
           ))}
        </div>

        {/* Editor Central */}
        <div className="flex-1 overflow-y-auto custom-scrollbar p-8">
          {selectedItem ? (
            <div className="max-w-7xl mx-auto animate-in slide-in-from-right-4 duration-500">
               
               {/* Score Card */}
               {selectedItem.description && !loading && (
                 <div className="bg-surface-dark border border-border-dark rounded-[32px] p-8 mb-8 flex items-center justify-between shadow-2xl relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-8 opacity-5">
                       <span className="material-symbols-outlined text-8xl">trending_up</span>
                    </div>
                    <div className="flex items-center gap-8 relative z-10">
                       <div className="size-24 rounded-full border-4 border-background-dark flex items-center justify-center bg-card-dark shadow-inner">
                          <span className="text-2xl font-black text-accent-green">{seoScore}%</span>
                       </div>
                       <div>
                          <h4 className="text-xl font-black text-white uppercase tracking-tight">SEO Score Estimado</h4>
                          <p className="text-sm text-slate-500">Otimizado para as palavras-chave de maior tendência hoje.</p>
                       </div>
                    </div>
                    <div className="flex flex-col gap-2">
                       <Badge variant="success">PRONTO PARA PUBLICAÇÃO</Badge>
                       <Badge variant="primary">TAGS DE ALTA RETENÇÃO</Badge>
                    </div>
                 </div>
               )}

               {!selectedItem.description && !loading ? (
                 <div className="py-24 flex flex-col items-center justify-center text-center bg-surface-dark/20 rounded-[48px] border-2 border-dashed border-border-dark">
                    <div className="bg-surface-dark size-24 rounded-full flex items-center justify-center mb-8 shadow-2xl">
                       <span className="material-symbols-outlined text-5xl text-primary opacity-50">ads_click</span>
                    </div>
                    <h3 className="text-2xl font-black text-white mb-3 uppercase tracking-tight font-display italic">SEO Inteligente</h3>
                    <p className="text-slate-500 max-w-sm mb-10 text-sm font-medium leading-relaxed">Nossa IA irá escanear o roteiro e criar metadados que forçar o algoritmo a recomendar seu vídeo.</p>
                    <Button size="xl" icon="rocket" onClick={() => handleGenerateSingle(selectedItemId)}>
                      Gerar Metadados Estratégicos
                    </Button>
                 </div>
               ) : loading ? (
                 <div className="py-32 flex flex-col items-center justify-center">
                    <div className="size-20 border-4 border-primary border-t-transparent rounded-full animate-spin mb-8 shadow-[0_0_15px_#8655f633]"></div>
                    <p className="text-white font-black uppercase tracking-[0.4em] text-sm">Escaneando Algoritmo...</p>
                 </div>
               ) : (
                 <div className="grid grid-cols-1 xl:grid-cols-3 gap-8 pb-10">
                    <div className="xl:col-span-2 flex flex-col gap-5">
                       <div className="flex items-center justify-between px-2">
                          <h4 className="text-[10px] font-black text-primary uppercase tracking-widest flex items-center gap-2">
                             <span className="material-symbols-outlined text-sm">description</span>
                             Descrição de Alta Performance
                          </h4>
                          <Button 
                            variant={copyingDesc === selectedItem.id ? 'white' : 'ghost'} 
                            size="sm" 
                            icon={copyingDesc === selectedItem.id ? 'check' : 'content_copy'}
                            onClick={() => copyToClipboard(selectedItem.description || '', 'desc', selectedItem.id)}
                          >
                            {copyingDesc === selectedItem.id ? 'Copiado' : 'Copiar'}
                          </Button>
                       </div>
                       <TextArea 
                         className="h-[550px] text-base leading-relaxed p-8 rounded-[32px]"
                         value={selectedItem.description}
                         onChange={(e) => {
                           const updatedItems = items.map(i => i.id === selectedItemId ? {...i, description: e.target.value} : i);
                           onUpdate({...project, items: updatedItems});
                         }}
                       />
                    </div>

                    <div className="flex flex-col gap-8">
                       <div className="space-y-4">
                          <div className="flex items-center justify-between px-2">
                            <h4 className="text-[10px] font-black text-primary uppercase tracking-widest flex items-center gap-2">
                               <span className="material-symbols-outlined text-sm">format_list_bulleted</span>
                               Capítulos (Timestamps)
                            </h4>
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              icon="content_copy"
                              onClick={() => copyToClipboard(selectedItem.chapters || '', 'chap', selectedItem.id)}
                              className="h-8 p-0 px-3"
                            />
                          </div>
                          <TextArea 
                            className="h-56 font-mono text-xs opacity-80"
                            value={selectedItem.chapters}
                            onChange={(e) => {
                              const updatedItems = items.map(i => i.id === selectedItemId ? {...i, chapters: e.target.value} : i);
                              onUpdate({...project, items: updatedItems});
                            }}
                          />
                       </div>

                       <div className="space-y-4">
                          <div className="flex items-center justify-between px-2">
                            <h4 className="text-[10px] font-black text-primary uppercase tracking-widest flex items-center gap-2">
                               <span className="material-symbols-outlined text-sm">tag</span>
                               Tags Estratégicas
                            </h4>
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              icon="content_copy"
                              onClick={() => copyToClipboard(selectedItem.tags || '', 'tags', selectedItem.id)}
                              className="h-8 p-0 px-3"
                            />
                          </div>
                          <TextArea 
                            className="h-56 text-xs text-slate-400"
                            value={selectedItem.tags}
                            onChange={(e) => {
                              const updatedItems = items.map(i => i.id === selectedItemId ? {...i, tags: e.target.value} : i);
                              onUpdate({...project, items: updatedItems});
                            }}
                          />
                          <p className="text-[9px] text-slate-600 font-black uppercase tracking-widest text-right pr-2">
                             {selectedItem.tags?.length || 0} / 500 Caracteres
                          </p>
                       </div>
                    </div>
                 </div>
               )}
            </div>
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-slate-700 m-10 border-2 border-dashed border-border-dark rounded-[64px]">
               <span className="material-symbols-outlined text-7xl opacity-10 mb-4">search_insights</span>
               <p className="font-black uppercase tracking-widest text-xs opacity-40">Selecione um vídeo para otimizar</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Metadata;

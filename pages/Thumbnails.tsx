
import React, { useState, useEffect } from 'react';
import { Project, ScriptItem } from '../types';
import { useThumbnailQueue } from '../hooks/useThumbnailQueue';
import FullscreenPreview from '../components/Thumbnails/FullscreenPreview';

interface ThumbnailsProps {
  project: Project;
  onUpdate: (updated: Project) => void;
  onNext: () => void;
}

const Thumbnails: React.FC<ThumbnailsProps> = ({ project, onUpdate, onNext }) => {
  const [fullscreenImage, setFullscreenImage] = useState<string | null>(null);
  const [selectedItemId, setSelectedItemId] = useState(project.items[0]?.id || '');
  
  // Configurações (Servem de fallback e controle de estilo/variante)
  const [batchConfig, setBatchConfig] = useState({
    mode: 'auto' as 'auto' | 'manual',
    prompt: '',
    style: 'realistic',
    variations: 1
  });

  const {
    isProcessing,
    handleGenerateSingle,
    handleRetry,
    stats
  } = useThumbnailQueue(project, onUpdate);

  const itemsArray = project.items || [];
  const selectedItem = itemsArray.find(i => i.id === selectedItemId);

  // Sincroniza o modo do item selecionado se ele já tiver um definido
  useEffect(() => {
    if (selectedItem) {
      setBatchConfig(prev => ({
        ...prev,
        mode: selectedItem.thumbMode || 'auto',
        prompt: selectedItem.thumbPrompt || ''
      }));
    }
  }, [selectedItemId]);

  const updateSelectedItemConfig = (updates: Partial<ScriptItem>) => {
    const updatedItems = itemsArray.map(item => 
      item.id === selectedItemId ? { ...item, ...updates } : item
    );
    onUpdate({ ...project, items: updatedItems });
  };

  const handleModeChange = (mode: 'auto' | 'manual') => {
    setBatchConfig(prev => ({ ...prev, mode }));
    updateSelectedItemConfig({ thumbMode: mode });
  };

  const handlePromptChange = (prompt: string) => {
    setBatchConfig(prev => ({ ...prev, prompt }));
    updateSelectedItemConfig({ thumbPrompt: prompt });
  };

  const downloadImage = (url: string, title: string) => {
    const link = document.createElement('a');
    link.href = url;
    link.download = `thumb-${title.substring(0, 20)}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="max-w-[1600px] mx-auto px-6 py-8 animate-in fade-in duration-500">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        
        {/* COLUNA ESQUERDA: CONFIGURAÇÕES E SELETOR (1/3) */}
        <div className="lg:col-span-1 space-y-6 lg:sticky lg:top-8">
          
          {/* SELETOR DE TÍTULOS */}
          <div className="bg-surface-dark border border-border-dark rounded-[32px] shadow-2xl overflow-hidden">
            <div className="p-5 border-b border-border-dark bg-card-dark/30 flex justify-between items-center">
               <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] ml-1">Lista de Vídeos</h4>
               <span className="text-[9px] font-bold text-slate-600 bg-background-dark px-2 py-0.5 rounded-full">{itemsArray.length} VÍDEOS</span>
            </div>
            <div className="max-h-[340px] overflow-y-auto custom-scrollbar p-3 space-y-2">
               {itemsArray.map(item => (
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
                      <div className={`size-2 rounded-full ${item.thumbnails.length > 0 ? 'bg-accent-green shadow-[0_0_8px_#39FF14]' : (item.thumbStatus === 'generating' ? 'bg-primary animate-pulse' : (item.thumbStatus === 'failed' ? 'bg-red-500 shadow-[0_0_8px_#ef4444]' : 'bg-slate-700'))}`}></div>
                      <span className={`text-[9px] font-black uppercase tracking-widest ${item.thumbnails.length > 0 ? 'text-accent-green' : (item.thumbStatus === 'generating' ? 'text-primary' : (item.thumbStatus === 'failed' ? 'text-red-500' : 'text-slate-500'))}`}>
                        {item.thumbnails.length > 0 ? `${item.thumbnails.length} ARTES PRONTAS` : (item.thumbStatus === 'generating' ? 'GERANDO...' : (item.thumbStatus === 'failed' ? 'FALHA' : 'PENDENTE'))}
                      </span>
                    </div>
                    <p className={`text-xs font-bold leading-tight line-clamp-2 ${selectedItemId === item.id ? 'text-white' : 'text-slate-400'}`}>
                      {item.title}
                    </p>
                 </button>
               ))}
            </div>
          </div>

          {/* CONFIGURAÇÕES DE ARTE */}
          <div className="bg-surface-dark border border-border-dark rounded-[32px] shadow-2xl overflow-hidden">
            <div className="p-6 border-b border-border-dark bg-card-dark/50">
              <h3 className="text-xl font-black text-white font-display tracking-tight uppercase">Configuração Visual</h3>
              <p className="text-slate-500 text-xs">Defina o comportamento da IA para as imagens.</p>
            </div>

            <div className="p-6 space-y-8">
              {/* MODO DE GERAÇÃO */}
              <div className="space-y-4">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Estratégia para este vídeo</label>
                
                <div 
                  onClick={() => handleModeChange('auto')}
                  className={`p-4 rounded-2xl border cursor-pointer transition-all ${batchConfig.mode === 'auto' ? 'border-primary bg-primary/5' : 'border-border-dark bg-background-dark/30 opacity-60'}`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className="material-symbols-outlined text-primary text-sm">auto_awesome</span>
                      <h4 className="text-[10px] font-black text-white uppercase tracking-widest">Automático</h4>
                    </div>
                    <input type="radio" checked={batchConfig.mode === 'auto'} readOnly className="accent-primary" />
                  </div>
                  <p className="text-[10px] text-slate-500 leading-relaxed italic">A IA analisará o título/roteiro para criar a cena perfeita.</p>
                </div>

                <div 
                  onClick={() => handleModeChange('manual')}
                  className={`p-4 rounded-2xl border cursor-pointer transition-all ${batchConfig.mode === 'manual' ? 'border-primary bg-primary/5' : 'border-border-dark bg-background-dark/30 opacity-60'}`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className="material-symbols-outlined text-primary text-sm">edit_note</span>
                      <h4 className="text-[10px] font-black text-white uppercase tracking-widest">Manual</h4>
                    </div>
                    <input type="radio" checked={batchConfig.mode === 'manual'} readOnly className="accent-primary" />
                  </div>
                  <textarea 
                    disabled={batchConfig.mode !== 'manual'}
                    className="w-full h-24 bg-surface-dark border border-border-dark rounded-xl p-3 text-xs text-slate-300 focus:ring-1 focus:ring-primary outline-none transition-all resize-none placeholder:text-slate-600 disabled:opacity-50"
                    placeholder="Descreva a cena específica..."
                    value={batchConfig.prompt}
                    onChange={(e) => handlePromptChange(e.target.value)}
                  />
                </div>
              </div>

              {/* ESTILO ARTÍSTICO */}
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Estilo Visual</label>
                <select 
                  className="w-full bg-surface-dark border border-border-dark rounded-xl py-3 px-3 text-xs text-white outline-none focus:ring-1 focus:ring-primary"
                  value={batchConfig.style}
                  onChange={(e) => setBatchConfig(prev => ({...prev, style: e.target.value}))}
                >
                  <option value="realistic">Foto Realista (Cinema 4D)</option>
                  <option value="3d">3D Render High-Contrast</option>
                  <option value="cyber">Cyberpunk Dark Channel</option>
                  <option value="anime">Anime / Ilustrado</option>
                  <option value="minimalist">Minimalista Moderno</option>
                </select>
              </div>

              {/* VARIAÇÕES */}
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Quantidade</label>
                  <span className="bg-primary/20 text-primary text-[10px] font-black px-2 py-0.5 rounded-md">{batchConfig.variations} {batchConfig.variations === 1 ? 'Imagem' : 'Imagens'}</span>
                </div>
                <div className="grid grid-cols-4 gap-2">
                  {[1, 2, 3, 4].map(n => (
                    <button 
                      key={n}
                      onClick={() => setBatchConfig(prev => ({...prev, variations: n}))}
                      className={`py-2 text-xs font-black rounded-lg border transition-all ${batchConfig.variations === n ? 'bg-primary border-primary text-white shadow-lg' : 'bg-background-dark border-border-dark text-slate-500 hover:text-white'}`}
                    >
                      {n}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* COLUNA DIREITA: PRODUÇÃO E GALERIA (2/3) */}
        <div className="lg:col-span-2 space-y-8 h-full flex flex-col">
          
          {/* Botão de Avançar Global (Fica fixo quando houver progresso) */}
          {stats.completed > 0 && (
            <div className="flex justify-end">
              <button 
                onClick={onNext}
                className="px-8 py-3.5 bg-white text-black font-black text-xs uppercase tracking-[0.2em] rounded-2xl hover:bg-slate-200 transition-all active:scale-95 flex items-center gap-2 shadow-xl"
              >
                Avançar para SEO
                <span className="material-symbols-outlined text-sm">arrow_forward</span>
              </button>
            </div>
          )}

          {/* Área de Visualização Individual */}
          <div className="bg-surface-dark border border-border-dark rounded-[32px] shadow-2xl overflow-hidden flex flex-col flex-1 min-h-[700px]">
            {/* Cabeçalho de Contexto */}
            <div className="p-8 border-b border-border-dark/50 bg-card-dark/30 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <span className="bg-primary/20 text-primary text-[9px] font-black px-2 py-0.5 rounded-full uppercase tracking-widest">Vídeo Selecionado</span>
                  <div className="h-px flex-1 bg-border-dark/50"></div>
                </div>
                <h3 className="text-2xl font-black text-white leading-tight mb-2">{selectedItem?.title || 'Selecione um vídeo'}</h3>
                <div className="flex items-center gap-4">
                   <div className="flex items-center gap-1.5">
                      <span className="material-symbols-outlined text-slate-500 text-sm">description</span>
                      <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{selectedItem?.script?.split(' ').length || 0} palavras</span>
                   </div>
                   <div className="flex items-center gap-1.5">
                      <span className="material-symbols-outlined text-slate-500 text-sm">tag</span>
                      <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{project.niche}</span>
                   </div>
                </div>
              </div>

              <div className="flex flex-col gap-2 w-full md:w-auto">
                 <button 
                   onClick={() => handleGenerateSingle(selectedItemId, batchConfig)}
                   disabled={selectedItem?.thumbStatus === 'generating' || isProcessing}
                   className="w-full md:w-auto px-8 py-4 bg-primary hover:bg-primary-hover text-white font-black text-xs uppercase tracking-[0.15em] rounded-2xl shadow-xl shadow-primary/20 transition-all flex items-center justify-center gap-2 disabled:opacity-30 active:scale-95"
                 >
                   <span className="material-symbols-outlined text-sm">{selectedItem?.thumbStatus === 'generating' ? 'sync' : 'brush'}</span>
                   {selectedItem?.thumbStatus === 'generating' ? 'Criando Artes...' : 'Gerar novas Imagens'}
                 </button>
                 {selectedItem?.thumbStatus === 'failed' && (
                    <button 
                      onClick={() => handleRetry(selectedItemId, batchConfig)}
                      className="text-[9px] font-black text-red-500 uppercase tracking-widest hover:underline flex items-center justify-center gap-1 p-2"
                    >
                      <span className="material-symbols-outlined text-xs">refresh</span>
                      Erro na geração. Tentar Novamente?
                    </button>
                 )}
              </div>
            </div>

            {/* Galeria de Thumbnails */}
            <div className="p-8 flex-1 overflow-y-auto custom-scrollbar bg-background-dark/10">
              {selectedItem?.thumbStatus === 'generating' && (
                <div className="mb-8 py-10 flex flex-col items-center justify-center bg-primary/5 rounded-3xl border border-primary/20 animate-in fade-in duration-500">
                  <div className="relative size-12 mb-4">
                     <div className="absolute inset-0 border-3 border-primary/10 rounded-full"></div>
                     <div className="absolute inset-0 border-3 border-primary border-t-transparent rounded-full animate-spin"></div>
                  </div>
                  <p className="text-white font-black uppercase tracking-widest text-[10px]">A IA está pintando sua cena...</p>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                {selectedItem?.thumbnails && selectedItem.thumbnails.length > 0 ? (
                  selectedItem.thumbnails.map((url, idx) => (
                    <div key={idx} className="group relative aspect-video bg-background-dark rounded-3xl overflow-hidden border border-border-dark shadow-2xl animate-in zoom-in-95 duration-500">
                      <div 
                        className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-105" 
                        style={{ backgroundImage: `url("${url}")` }}
                      />
                      <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-all duration-300 flex items-center justify-center gap-4 backdrop-blur-[2px]">
                        <button 
                          onClick={() => setFullscreenImage(url)}
                          className="bg-white text-black px-6 py-2.5 rounded-xl font-bold flex items-center gap-2 hover:scale-110 transition-transform shadow-2xl"
                        >
                          <span className="material-symbols-outlined">fullscreen</span>
                          Ampliar
                        </button>
                        <button 
                          onClick={() => downloadImage(url, selectedItem.title)}
                          className="bg-primary text-white size-12 rounded-xl flex items-center justify-center hover:scale-110 transition-transform shadow-lg shadow-primary/20"
                        >
                          <span className="material-symbols-outlined">download</span>
                        </button>
                      </div>
                      {idx === 0 && (
                        <div className="absolute top-4 left-4 bg-accent-green text-black text-[9px] font-black px-3 py-1 rounded-full shadow-lg">
                          RECOMENDADA
                        </div>
                      )}
                    </div>
                  ))
                ) : selectedItem?.thumbStatus !== 'generating' && (
                  <div className="col-span-full py-24 flex flex-col items-center justify-center text-slate-600 bg-background-dark/20 rounded-[40px] border-2 border-dashed border-border-dark/40">
                    <div className="size-20 bg-surface-dark rounded-full flex items-center justify-center mb-6">
                       <span className="material-symbols-outlined text-4xl opacity-20">image_search</span>
                    </div>
                    <h4 className="text-lg font-bold text-white mb-1 uppercase tracking-tight">Sem artes geradas</h4>
                    <p className="text-xs text-slate-500 max-w-xs text-center">Clique no botão "Gerar novas Imagens" para criar as artes para este vídeo.</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      <FullscreenPreview 
        url={fullscreenImage} 
        onClose={() => setFullscreenImage(null)}
        onDownload={(url) => downloadImage(url, 'download')}
      />
    </div>
  );
};

export default Thumbnails;

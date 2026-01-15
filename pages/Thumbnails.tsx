
import React from 'react';
import { Project } from '../types';
import { useThumbnail } from '../hooks/useThumbnail';
import ThumbnailSidebar from '../components/Thumbnails/ThumbnailSidebar';
import ThumbnailCard from '../components/Thumbnails/ThumbnailCard';
import FullscreenPreview from '../components/Thumbnails/FullscreenPreview';

interface ThumbnailsProps {
  project: Project;
  onUpdate: (updated: Project) => void;
  onNext: () => void;
}

const Thumbnails: React.FC<ThumbnailsProps> = ({ project, onUpdate, onNext }) => {
  const {
    loading,
    promptLoading,
    fullscreenImage,
    referenceImage,
    selectedItemId,
    setSelectedItemId,
    selectedItem,
    setFullscreenImage,
    setReferenceImage,
    config,
    updateConfig,
    handleGenerate,
    handleAIPrompt,
    handleReferenceUpload,
    clearHistory,
    downloadImage
  } = useThumbnail(project, onUpdate);

  const thumbnails = selectedItem?.thumbnails || [];
  const currentResults = thumbnails.slice(0, 6);
  const historyResults = thumbnails.slice(6);

  return (
    <div className="w-full h-full flex flex-col md:flex-row animate-in fade-in duration-500 overflow-hidden">
      {/* Seletor de Vídeo lateral (Novo para fluxo de lote) */}
      <div className="w-full md:w-72 bg-card-dark/50 border-r border-border-dark flex flex-col overflow-hidden">
        <div className="p-6 border-b border-border-dark bg-background-dark/30">
          <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">Selecione o Vídeo</h4>
          <p className="text-xs text-slate-400">Gere artes para cada item da sua fila.</p>
        </div>
        <div className="flex-1 overflow-y-auto custom-scrollbar p-3 space-y-2">
          {project.items.map((item) => (
            <button
              key={item.id}
              onClick={() => setSelectedItemId(item.id)}
              className={`w-full p-4 rounded-2xl border text-left transition-all group ${
                selectedItemId === item.id 
                  ? 'bg-primary border-primary shadow-lg shadow-primary/10' 
                  : 'bg-surface-dark/50 border-border-dark hover:border-white/20'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className={`text-[9px] font-black uppercase tracking-widest ${selectedItemId === item.id ? 'text-white' : 'text-primary'}`}>
                  {item.thumbnails.length > 0 ? 'COM ARTE' : 'SEM ARTE'}
                </span>
                {item.thumbnails.length > 0 && (
                   <span className="material-symbols-outlined text-xs text-accent-green">check_circle</span>
                )}
              </div>
              <p className={`text-xs font-bold leading-tight line-clamp-2 ${selectedItemId === item.id ? 'text-white' : 'text-slate-300'}`}>
                {item.title}
              </p>
            </button>
          ))}
        </div>
      </div>

      {/* Área Principal de Thumbnails */}
      <div className="flex-1 overflow-y-auto custom-scrollbar p-6">
        <div className="grid grid-cols-1 xl:grid-cols-[380px_1fr] gap-8 items-start max-w-[1400px] mx-auto">
          
          <ThumbnailSidebar 
            config={config}
            updateConfig={updateConfig}
            onGenerate={handleGenerate}
            onAIPrompt={handleAIPrompt}
            onReferenceUpload={handleReferenceUpload}
            onNext={onNext}
            loading={loading}
            promptLoading={promptLoading}
            referenceImage={referenceImage}
            onClearReference={() => setReferenceImage(null)}
            hasThumbnails={project.items.some(i => i.thumbnails.length > 0)}
          />

          <section className="flex flex-col gap-6">
            <div className="flex justify-between items-center bg-surface-dark p-6 rounded-2xl border border-border-dark shadow-lg">
              <div className="flex flex-col">
                <span className="text-xl font-bold text-white font-display tracking-tight truncate max-w-md">
                  {selectedItem?.title}
                </span>
                <span className="text-[11px] text-slate-500 font-medium">
                  {thumbnails.length} variações para este vídeo
                </span>
              </div>
              {thumbnails.length > 0 && (
                <button 
                  onClick={clearHistory} 
                  className="text-xs font-bold text-red-400 hover:text-red-500 transition-colors flex items-center gap-2 bg-red-500/10 px-4 py-2 rounded-lg border border-red-500/20"
                >
                  <span className="material-symbols-outlined text-sm">delete_sweep</span>
                  Limpar Vídeo
                </button>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {currentResults.map((img, idx) => (
                <ThumbnailCard 
                  key={idx}
                  url={img}
                  isNew={idx === 0 && !loading}
                  onPreview={setFullscreenImage}
                  onDownload={downloadImage}
                />
              ))}

              {loading && (
                <div className="aspect-video rounded-2xl border-2 border-dashed border-primary/40 flex flex-col items-center justify-center gap-5 bg-primary/5 animate-pulse">
                  <div className="relative size-14">
                    <div className="absolute inset-0 border-4 border-primary/20 rounded-full"></div>
                    <div className="absolute inset-0 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
                  </div>
                  <div className="text-center">
                    <p className="text-base font-black text-white uppercase tracking-[0.2em]">Processando Pixels</p>
                    <p className="text-[11px] text-slate-500 mt-1">A IA está renderizando em alta fidelidade...</p>
                  </div>
                </div>
              )}

              {!loading && thumbnails.length === 0 && (
                <div className="col-span-full py-24 flex flex-col items-center justify-center text-slate-500 bg-surface-dark/20 rounded-3xl border-2 border-dashed border-border-dark">
                  <div className="bg-primary/10 p-8 rounded-full mb-6">
                    <span className="material-symbols-outlined text-7xl text-primary/30">brush</span>
                  </div>
                  <p className="text-2xl font-bold text-white mb-2 tracking-tight">Crie sua Capa</p>
                  <p className="text-sm text-slate-500 max-w-xs text-center">Use o painel lateral para descrever a cena deste vídeo.</p>
                </div>
              )}
            </div>

            {historyResults.length > 0 && (
              <div className="mt-6 flex flex-col gap-6">
                <div className="flex items-center gap-4">
                  <h4 className="text-lg font-bold text-white font-display flex items-center gap-3">
                    <span className="material-symbols-outlined text-primary">history</span>
                    Outras Opções
                  </h4>
                  <div className="h-px flex-1 bg-border-dark"></div>
                </div>
                <div className="grid grid-cols-4 md:grid-cols-6 gap-4">
                  {historyResults.map((img, idx) => (
                    <div 
                      key={idx}
                      onClick={() => setFullscreenImage(img)}
                      className="aspect-video rounded-xl bg-cover bg-center border border-border-dark grayscale hover:grayscale-0 transition-all cursor-pointer opacity-60 hover:opacity-100 hover:scale-105 shadow-md" 
                      style={{ backgroundImage: `url("${img}")` }}
                    />
                  ))}
                </div>
              </div>
            )}
          </section>
        </div>
      </div>

      <FullscreenPreview 
        url={fullscreenImage} 
        onClose={() => setFullscreenImage(null)}
        onDownload={downloadImage}
      />
    </div>
  );
};

export default Thumbnails;

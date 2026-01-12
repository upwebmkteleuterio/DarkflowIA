
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

  const currentResults = project.thumbnails.slice(0, 6);
  const historyResults = project.thumbnails.slice(6);

  return (
    <div className="w-full p-6 pb-20 animate-in fade-in duration-500">
      <div className="grid grid-cols-1 lg:grid-cols-[380px_1fr] gap-8 items-start max-w-[1600px] mx-auto">
        
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
          hasThumbnails={project.thumbnails.length > 0}
        />

        <section className="flex flex-col gap-6">
          <div className="flex justify-between items-center bg-surface-dark p-6 rounded-2xl border border-border-dark shadow-lg">
            <div className="flex flex-col">
              <span className="text-xl font-bold text-white font-display tracking-tight">Galeria de Resultados</span>
              <span className="text-[11px] text-slate-500 font-medium">
                {project.thumbnails.length} variações criadas • {config.style}
              </span>
            </div>
            {project.thumbnails.length > 0 && (
              <button 
                onClick={clearHistory} 
                className="text-xs font-bold text-red-400 hover:text-red-500 transition-colors flex items-center gap-2 bg-red-500/10 px-4 py-2 rounded-lg border border-red-500/20"
              >
                <span className="material-symbols-outlined text-sm">delete_sweep</span>
                Limpar Tudo
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

            {!loading && project.thumbnails.length === 0 && (
              <div className="col-span-full py-32 flex flex-col items-center justify-center text-slate-500 bg-surface-dark/20 rounded-3xl border-2 border-dashed border-border-dark">
                <div className="bg-primary/10 p-8 rounded-full mb-6">
                  <span className="material-symbols-outlined text-7xl text-primary/30">brush</span>
                </div>
                <p className="text-2xl font-bold text-white mb-2 tracking-tight">Sua galeria está vazia</p>
                <p className="text-sm text-slate-500 max-w-xs text-center">Descreva a cena desejada ou gere com IA no painel lateral.</p>
              </div>
            )}
          </div>

          {historyResults.length > 0 && (
            <div className="mt-10 flex flex-col gap-6">
              <div className="flex items-center gap-4">
                <h4 className="text-lg font-bold text-white font-display flex items-center gap-3">
                  <span className="material-symbols-outlined text-primary">history</span>
                  Versões Anteriores
                </h4>
                <div className="h-px flex-1 bg-border-dark"></div>
              </div>
              <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                {historyResults.map((img, idx) => (
                  <div 
                    key={idx}
                    onClick={() => setFullscreenImage(img)}
                    className="aspect-video rounded-xl bg-cover bg-center border border-border-dark grayscale hover:grayscale-0 transition-all cursor-pointer opacity-40 hover:opacity-100 hover:scale-105 shadow-md" 
                    style={{ backgroundImage: `url("${img}")` }}
                  />
                ))}
              </div>
            </div>
          )}

          {project.thumbnails.length > 0 && !loading && (
            <div className="mt-6 flex justify-end">
              <button 
                onClick={onNext}
                className="bg-primary text-white font-bold px-8 py-3 rounded-xl flex items-center gap-2 hover:bg-primary-hover shadow-lg shadow-primary/20 transition-all active:scale-95"
              >
                Avançar para SEO & Metadados
                <span className="material-symbols-outlined">arrow_forward</span>
              </button>
            </div>
          )}
        </section>
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

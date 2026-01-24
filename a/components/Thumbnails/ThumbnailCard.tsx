
import React from 'react';

interface ThumbnailCardProps {
  url: string;
  isNew?: boolean;
  onPreview: (url: string) => void;
  onDownload: (url: string) => void;
}

const ThumbnailCard: React.FC<ThumbnailCardProps> = ({ url, isNew, onPreview, onDownload }) => {
  return (
    <div className="group relative aspect-video bg-surface-dark rounded-2xl overflow-hidden border border-border-dark shadow-xl">
      <div 
        className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-105" 
        style={{ backgroundImage: `url("${url}")` }}
      />
      
      {/* Overlay de Ações */}
      <div className="absolute inset-0 bg-black/70 opacity-0 group-hover:opacity-100 transition-all duration-300 flex flex-col items-center justify-center gap-4 backdrop-blur-[2px]">
        <button 
          onClick={() => onPreview(url)}
          className="bg-white text-black px-6 py-2.5 rounded-xl font-bold flex items-center gap-2 hover:scale-105 transition-all shadow-2xl"
        >
          <span className="material-symbols-outlined text-[20px]">fullscreen</span>
          Ver em Tela Cheia
        </button>
        <div className="flex gap-2">
          <button 
            onClick={() => onDownload(url)}
            className="bg-primary text-white size-12 rounded-xl flex items-center justify-center hover:bg-primary-hover transition-all shadow-lg shadow-primary/20"
            title="Baixar Imagem"
          >
            <span className="material-symbols-outlined">download</span>
          </button>
          <button className="bg-white/10 text-white size-12 rounded-xl flex items-center justify-center hover:bg-white/20 transition-all border border-white/20" title="Editar com IA">
            <span className="material-symbols-outlined">edit</span>
          </button>
        </div>
      </div>
      
      {isNew && (
        <div className="absolute top-4 left-4 px-3 py-1 bg-accent-green text-[10px] font-black rounded-full text-black shadow-lg z-10">
          RECENTE
        </div>
      )}
    </div>
  );
};

export default ThumbnailCard;

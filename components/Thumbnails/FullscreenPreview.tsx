
import React from 'react';

interface FullscreenPreviewProps {
  url: string | null;
  onClose: () => void;
  onDownload: (url: string) => void;
}

const FullscreenPreview: React.FC<FullscreenPreviewProps> = ({ url, onClose, onDownload }) => {
  if (!url) return null;

  return (
    <div 
      className="fixed inset-0 z-[100] bg-black/98 flex items-center justify-center p-4 md:p-10 animate-in fade-in zoom-in duration-300 backdrop-blur-xl"
      onClick={onClose}
    >
      <button 
        className="absolute top-6 right-6 text-white/50 hover:text-white transition-colors"
        onClick={onClose}
      >
        <span className="material-symbols-outlined text-5xl">close</span>
      </button>
      
      <img 
        src={url} 
        alt="Thumbnail Fullscreen" 
        className="max-w-full max-h-full rounded-2xl shadow-2xl object-contain border border-white/10"
        onClick={(e) => e.stopPropagation()}
      />
      
      <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex gap-4">
         <button 
           onClick={() => onDownload(url)}
           className="bg-primary text-white px-10 py-4 rounded-xl font-bold flex items-center gap-3 hover:scale-105 transition-all shadow-2xl shadow-primary/30"
         >
           <span className="material-symbols-outlined">download</span>
           Baixar Imagem (4K Ultra HD)
         </button>
      </div>
    </div>
  );
};

export default FullscreenPreview;

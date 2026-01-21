
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
        className="absolute top-6 right-6 text-white/50 hover:text-white transition-colors z-[110]"
        onClick={onClose}
      >
        <span className="material-symbols-outlined text-5xl">close</span>
      </button>
      
      <img 
        src={url} 
        alt="Thumbnail Fullscreen" 
        className="max-w-full max-h-full rounded-2xl shadow-2xl object-contain border border-white/10 relative z-[105]"
        onClick={(e) => e.stopPropagation()}
      />
    </div>
  );
};

export default FullscreenPreview;

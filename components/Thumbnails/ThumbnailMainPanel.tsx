
import React from 'react';
import { ScriptItem } from '../../types';
import Button from '../ui/Button';
import AdvanceButton from '../ui/AdvanceButton';

interface ThumbnailMainPanelProps {
  selectedItem: ScriptItem | undefined;
  projectNiche: string;
  isProcessing: boolean;
  onGenerate: () => void;
  onNext: () => void;
  onPreview: (url: string) => void;
  onDownload: (url: string, title: string) => void;
  stats: {
    completed: number;
  };
}

const ThumbnailMainPanel: React.FC<ThumbnailMainPanelProps> = ({
  selectedItem,
  projectNiche,
  isProcessing,
  onGenerate,
  onNext,
  onPreview,
  onDownload,
  stats
}) => {
  return (
    <div className="h-full flex flex-col overflow-hidden min-h-[600px] lg:min-h-0 lg:overflow-hidden pb-10 lg:pb-0">
      <div className="bg-surface-dark border border-border-dark rounded-[32px] p-5 md:p-8 shadow-2xl flex flex-col flex-1 overflow-hidden relative">
        <div className="p-0 border-b border-border-dark/50 bg-transparent flex flex-col md:flex-row justify-between items-start md:items-center gap-6 pb-6 mb-6">
          <div className="flex-1 min-w-0 text-left w-full">
            <h3 className="text-xl md:text-2xl font-black text-white leading-tight mb-2 break-words max-w-full">
              {selectedItem?.title || 'Selecione um vídeo'}
            </h3>
            <div className="flex items-center gap-4">
               <div className="flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-slate-500 text-sm">tag</span>
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{projectNiche}</span>
               </div>
            </div>
          </div>

          <div className="flex flex-col gap-2 w-full md:w-auto shrink-0">
             <Button 
               onClick={onGenerate}
               loading={selectedItem?.thumbStatus === 'generating' || isProcessing}
               icon="brush"
               size="lg"
               disabled={!selectedItem}
               fullWidth
             >
               Gerar Imagens
             </Button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto custom-scrollbar bg-background-dark/10 p-4 rounded-[24px] border border-border-dark/30">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 md:gap-8">
            {selectedItem?.thumbnails && selectedItem.thumbnails.length > 0 ? (
              selectedItem.thumbnails.map((url, idx) => (
                <div key={idx} className="group relative aspect-video bg-background-dark rounded-2xl overflow-hidden border border-border-dark shadow-2xl animate-in zoom-in-95 duration-500">
                  <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: `url("${url}")` }} />
                  <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-all duration-300 flex items-center justify-center gap-4 backdrop-blur-[2px]">
                    <Button variant="white" size="md" icon="fullscreen" onClick={() => onPreview(url)}>Ampliar</Button>
                    <Button 
                      variant="primary" 
                      size="md" 
                      icon="download" 
                      onClick={() => onDownload(url, selectedItem.title)} 
                      className="size-12 p-0" 
                    />
                  </div>
                </div>
              ))
            ) : (
              <div className="col-span-full py-24 flex flex-col items-center justify-center text-slate-600 border-2 border-dashed border-border-dark/40 rounded-[40px]">
                <span className="material-symbols-outlined text-4xl opacity-20">image_search</span>
                <p className="text-sm font-bold text-white uppercase tracking-tight mt-4">Sem artes geradas</p>
                <p className="text-[10px] text-slate-500 mt-1 uppercase tracking-widest">Clique em gerar para criar sua miniatura</p>
              </div>
            )}
          </div>
        </div>

        <div className="shrink-0 mt-6">
          <AdvanceButton 
            isVisible={stats.completed > 0 && !isProcessing} 
            onClick={onNext} 
            label="Avançar para SEO" 
          />
        </div>
      </div>
    </div>
  );
};

export default ThumbnailMainPanel;

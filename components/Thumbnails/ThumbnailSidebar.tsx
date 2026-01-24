
import React, { useRef } from 'react';
import Button from '../ui/Button';
import Badge from '../ui/Badge';
import { TextArea, Input } from '../ui/Input';

interface ThumbnailSidebarProps {
  config: {
    prompt: string;
    style: string;
    variations: number;
    thumbTitle: string;
  };
  updateConfig: (field: string, value: any) => void;
  onGenerate: () => void;
  onAIPrompt: () => void;
  onReferenceUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onNext: () => void;
  loading: boolean;
  promptLoading: boolean;
  referenceImage: string | null;
  onClearReference: () => void;
  hasThumbnails?: boolean;
}

const ThumbnailSidebar: React.FC<ThumbnailSidebarProps> = ({ 
  config, 
  updateConfig, 
  onGenerate, 
  onAIPrompt, 
  onReferenceUpload,
  onNext,
  loading, 
  promptLoading,
  referenceImage,
  onClearReference,
  hasThumbnails
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  return (
    <aside className="lg:sticky lg:top-8 flex flex-col gap-6 bg-surface-dark p-6 rounded-[32px] border border-border-dark shadow-2xl h-fit">
      <div className="space-y-1 border-b border-border-dark pb-4">
        <h3 className="text-white text-lg font-bold font-display uppercase tracking-tight">Estúdio de Arte</h3>
        <p className="text-slate-500 text-[11px] font-medium uppercase tracking-widest opacity-60">IA Visual Pro</p>
      </div>

      <div className="flex flex-col gap-6 overflow-y-auto max-h-[calc(100vh-340px)] pr-1 custom-scrollbar">
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Variações</label>
            <Badge variant="primary">{config.variations}</Badge>
          </div>
          <div className="grid grid-cols-4 gap-2 bg-background-dark/50 p-1 rounded-xl border border-border-dark">
            {[1, 2, 3, 4].map((num) => (
              <button 
                key={num}
                onClick={() => updateConfig('variations', num)}
                className={`h-9 rounded-lg text-xs font-bold transition-all ${
                  config.variations === num ? 'bg-primary text-white shadow-lg' : 'text-slate-500 hover:text-white'
                }`}
              >
                {num}
              </button>
            ))}
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Estilo Visual</label>
          <div className="relative">
            <select 
              className="w-full bg-background-dark/50 border border-border-dark rounded-xl text-xs text-white pl-4 pr-12 py-3.5 focus:ring-2 focus:ring-primary appearance-none cursor-pointer outline-none transition-all"
              value={config.style}
              onChange={(e) => updateConfig('style', e.target.value)}
            >
              <option value="realistic">Foto Realista</option>
              <option value="3d">3D Render</option>
              <option value="cyber">Cyberpunk</option>
              <option value="anime">Anime / Ilustrado</option>
              <option value="minimalist">Minimalista</option>
            </select>
            <span className="material-symbols-outlined absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none">expand_more</span>
          </div>
        </div>

        <Input 
          label="Texto Principal (Gatilho)"
          placeholder="Ex: GRÁTIS AGORA"
          value={config.thumbTitle}
          onChange={(e) => updateConfig('thumbTitle', e.target.value)}
        />

        <div className="space-y-3">
          <div className="flex justify-between items-center px-1">
            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Prompt da Cena</label>
            <Button 
              variant="ghost" 
              size="sm" 
              icon="auto_fix" 
              loading={promptLoading} 
              onClick={onAIPrompt}
              className="h-6 text-[9px] px-2 text-primary hover:bg-primary/10"
            >
              Assistente IA
            </Button>
          </div>
          <TextArea 
            placeholder="Descreva a imagem..."
            value={config.prompt}
            onChange={(e) => updateConfig('prompt', e.target.value)}
            className="h-28 text-xs"
          />
        </div>

        <div className="space-y-3">
          <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Mockup / Referência</label>
          {referenceImage ? (
            <div className="relative aspect-video rounded-2xl border border-primary/30 overflow-hidden group shadow-xl">
              <img src={referenceImage} alt="Ref" className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                <Button variant="danger" size="sm" icon="delete" onClick={onClearReference} className="size-10 p-0 rounded-full" />
              </div>
            </div>
          ) : (
            <div 
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-border-dark rounded-2xl p-6 flex flex-col items-center justify-center gap-2 bg-background-dark/20 cursor-pointer hover:border-primary/40 hover:bg-primary/5 transition-all group"
            >
              <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={onReferenceUpload} />
              <span className="material-symbols-outlined text-3xl text-slate-600 group-hover:text-primary transition-colors">upload_file</span>
              <p className="text-[9px] text-slate-500 uppercase font-black tracking-widest">Enviar Referência</p>
            </div>
          )}
        </div>
      </div>

      <div className="flex flex-col gap-3 pt-4">
        <Button 
          fullWidth
          size="lg"
          icon="brush"
          loading={loading}
          onClick={onGenerate}
          disabled={!config.prompt}
        >
          Gerar Miniatura
        </Button>

        {hasThumbnails && !loading && (
          <Button 
            fullWidth
            variant="outline"
            size="lg"
            icon="arrow_forward"
            onClick={onNext}
          >
            Avançar para SEO
          </Button>
        )}
      </div>
    </aside>
  );
};

export default ThumbnailSidebar;

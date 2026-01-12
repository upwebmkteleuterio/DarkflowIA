
import React, { useRef } from 'react';

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
    <aside className="lg:sticky lg:top-6 flex flex-col gap-6 bg-surface-dark p-6 rounded-2xl border border-border-dark shadow-2xl h-fit">
      <div className="flex flex-col gap-1 border-b border-border-dark pb-4">
        <h3 className="text-white text-xl font-bold font-display tracking-tight">Configurações de Arte</h3>
        <p className="text-slate-500 text-xs">Ajuste os parâmetros para a IA criar sua capa.</p>
      </div>

      <div className="flex flex-col gap-5 overflow-y-auto max-h-[calc(100vh-320px)] pr-2 custom-scrollbar">
        {/* Variações */}
        <div className="flex flex-col gap-3">
          <div className="flex justify-between items-center">
            <label className="text-sm font-semibold text-slate-300">Variações</label>
            <span className="text-[10px] bg-primary/20 text-primary px-2 py-0.5 rounded-md font-bold uppercase tracking-wider">Múltiplas</span>
          </div>
          <div className="flex h-11 items-center justify-center rounded-xl bg-background-dark p-1 border border-border-dark">
            {[1, 2, 3, 4].map((num) => (
              <label 
                key={num}
                className={`flex cursor-pointer h-full grow items-center justify-center overflow-hidden rounded-lg px-2 text-sm font-bold transition-all ${
                  config.variations === num 
                  ? 'bg-primary text-white shadow-lg' 
                  : 'text-slate-500 hover:text-slate-300'
                }`}
              >
                <span>{num}</span>
                <input 
                  className="hidden" 
                  type="radio" 
                  name="variations" 
                  value={num} 
                  checked={config.variations === num} 
                  onChange={() => updateConfig('variations', num)}
                />
              </label>
            ))}
          </div>
        </div>

        {/* Estilo */}
        <div className="flex flex-col gap-3">
          <label className="text-sm font-semibold text-slate-300">Estilo Artístico</label>
          <div className="relative">
            <select 
              className="w-full bg-surface-dark border border-border-dark rounded-xl text-sm text-white pl-4 pr-12 py-3 focus:ring-2 focus:ring-primary appearance-none cursor-pointer outline-none transition-all"
              value={config.style}
              onChange={(e) => updateConfig('style', e.target.value)}
            >
              <option value="realistic">Foto Realista (Cinema 4D)</option>
              <option value="3d">3D Render High-Contrast</option>
              <option value="cyber">Cyberpunk Dark Channel</option>
              <option value="anime">Anime / Ilustrado</option>
              <option value="minimalist">Minimalista Moderno</option>
            </select>
            <span className="material-symbols-outlined absolute right-3 top-3 text-slate-400 pointer-events-none">expand_more</span>
          </div>
        </div>

        {/* Texto na Thumb */}
        <div className="flex flex-col gap-3">
          <label className="text-sm font-semibold text-slate-300">Texto Sugerido</label>
          <input 
            type="text"
            className="w-full bg-surface-dark border border-border-dark rounded-xl text-sm text-white px-4 py-3 focus:ring-2 focus:ring-primary placeholder:text-slate-600 outline-none transition-all"
            placeholder="Ex: O SEGREDO REVELADO"
            value={config.thumbTitle}
            onChange={(e) => updateConfig('thumbTitle', e.target.value)}
          />
        </div>

        {/* Prompt */}
        <div className="flex flex-col gap-3">
          <div className="flex justify-between items-center">
            <label className="text-sm font-semibold text-slate-300">Prompt da Cena</label>
            <button 
              onClick={onAIPrompt}
              disabled={promptLoading}
              className="text-[10px] font-black text-primary hover:text-white uppercase tracking-wider flex items-center gap-1 bg-primary/10 px-2 py-1 rounded transition-colors"
            >
              <span className={`material-symbols-outlined text-xs ${promptLoading ? 'animate-spin' : ''}`}>auto_fix</span>
              {promptLoading ? 'Criando...' : 'Gerar com IA'}
            </button>
          </div>
          <textarea 
            className="w-full min-h-[120px] bg-surface-dark border border-border-dark rounded-xl text-sm text-white p-4 focus:ring-2 focus:ring-primary placeholder:text-slate-600 resize-none outline-none transition-all" 
            placeholder="Ex: Um investidor preocupado olhando para um gráfico de queda livre..."
            value={config.prompt}
            onChange={(e) => updateConfig('prompt', e.target.value)}
          />
        </div>

        {/* Upload Mockup */}
        <div className="flex flex-col gap-3">
          <label className="text-sm font-semibold text-slate-300">Referência Visual</label>
          <p className="text-[10px] text-slate-500 -mt-1">Envie o print de uma capa do youtube ou de um rascunho no papel.</p>
          
          {referenceImage ? (
            <div className="relative aspect-video rounded-xl border border-primary/30 overflow-hidden group">
              <img src={referenceImage} alt="Referência" className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                <button onClick={onClearReference} className="bg-red-500 text-white size-10 rounded-full flex items-center justify-center hover:scale-110 transition-transform">
                  <span className="material-symbols-outlined">delete</span>
                </button>
              </div>
            </div>
          ) : (
            <div 
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-border-dark rounded-2xl p-6 flex flex-col items-center justify-center gap-2 bg-background-dark/30 cursor-pointer hover:border-primary/50 hover:bg-primary/5 transition-all"
            >
              <input 
                type="file" 
                ref={fileInputRef} 
                className="hidden" 
                accept="image/*"
                onChange={onReferenceUpload}
              />
              <span className="material-symbols-outlined text-3xl text-slate-600">cloud_upload</span>
              <p className="text-[10px] text-slate-500 text-center uppercase font-bold">Upload de Referência</p>
            </div>
          )}
        </div>
      </div>

      <div className="flex flex-col gap-3 mt-4">
        <button 
          onClick={onGenerate}
          disabled={loading || !config.prompt}
          className="w-full bg-primary hover:bg-primary-hover disabled:opacity-50 text-white font-bold py-4 rounded-xl flex items-center justify-center gap-3 transition-all shadow-xl shadow-primary/20 active:scale-95"
        >
          <span className="material-symbols-outlined">auto_awesome</span>
          {loading ? 'Criando Arte...' : 'Gerar Thumbnail'}
        </button>

        {hasThumbnails && !loading && (
          <button 
            onClick={onNext}
            className="w-full flex items-center justify-center gap-2 rounded-xl h-12 bg-white/5 border border-white/10 text-white hover:bg-white/10 font-bold transition-all"
          >
            Avançar para SEO
            <span className="material-symbols-outlined text-sm">arrow_forward</span>
          </button>
        )}
      </div>
    </aside>
  );
};

export default ThumbnailSidebar;

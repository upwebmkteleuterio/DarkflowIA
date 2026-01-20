
import React from 'react';
import { TextArea } from '../ui/Input';

interface ThumbnailConfigPanelProps {
  mode: 'auto' | 'manual';
  prompt: string;
  style: string;
  variations: number;
  isProcessing: boolean;
  onModeChange: (mode: 'auto' | 'manual') => void;
  onPromptChange: (prompt: string) => void;
  onStyleChange: (style: string) => void;
  onVariationsChange: (count: number) => void;
}

const ThumbnailConfigPanel: React.FC<ThumbnailConfigPanelProps> = ({
  mode,
  prompt,
  style,
  variations,
  isProcessing,
  onModeChange,
  onPromptChange,
  onStyleChange,
  onVariationsChange
}) => {
  return (
    <div className="bg-surface-dark border border-border-dark rounded-[32px] shadow-2xl overflow-hidden shrink-0">
      <div className="p-6 border-b border-border-dark bg-card-dark/50 text-left">
        <h3 className="text-xl font-black text-white font-display tracking-tight uppercase">Configuração Visual</h3>
      </div>

      <div className="p-6 space-y-8">
        {/* Seletor de Variações */}
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Quantidade de Imagens</label>
            <span className="text-[10px] font-bold text-primary bg-primary/10 px-2 py-0.5 rounded-md border border-primary/20">
              {variations} {variations === 1 ? 'Arte' : 'Artes'}
            </span>
          </div>
          <div className="grid grid-cols-4 gap-2 bg-background-dark/50 p-1.5 rounded-2xl border border-border-dark">
            {[1, 2, 3, 4].map((num) => (
              <button 
                key={num}
                type="button"
                disabled={isProcessing}
                onClick={() => onVariationsChange(num)}
                className={`h-10 rounded-xl text-xs font-black transition-all ${
                  variations === num 
                  ? 'bg-primary text-white shadow-lg shadow-primary/20 scale-[1.05]' 
                  : 'text-slate-500 hover:text-white hover:bg-white/5'
                }`}
              >
                {num}
              </button>
            ))}
          </div>
          <p className="text-[9px] text-slate-600 font-bold uppercase tracking-tighter text-center">Cada imagem gerada consome 1 crédito</p>
        </div>

        <div className="space-y-4">
          <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1 block text-left">Estratégia para este vídeo</label>
          
          <div 
            onClick={() => !isProcessing && onModeChange('auto')} 
            className={`p-4 rounded-2xl border cursor-pointer transition-all text-left ${mode === 'auto' ? 'border-primary bg-primary/5 shadow-inner' : 'border-border-dark bg-background-dark/30 opacity-60 hover:opacity-100'}`}
          >
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-primary text-sm">auto_awesome</span>
                <h4 className="text-[10px] font-black text-white uppercase tracking-widest">Automático</h4>
              </div>
              {mode === 'auto' && <span className="material-symbols-outlined text-primary text-sm animate-pulse">check_circle</span>}
            </div>
            <p className="text-[10px] text-slate-500 leading-relaxed italic">IA analisará o conteúdo e criará a cena ideal.</p>
          </div>

          <div 
            onClick={() => !isProcessing && onModeChange('manual')} 
            className={`p-4 rounded-2xl border cursor-pointer transition-all text-left ${mode === 'manual' ? 'border-primary bg-primary/5 shadow-inner' : 'border-border-dark bg-background-dark/30 opacity-60 hover:opacity-100'}`}
          >
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-primary text-sm">edit_note</span>
                <h4 className="text-[10px] font-black text-white uppercase tracking-widest">Manual</h4>
              </div>
              {mode === 'manual' && <span className="material-symbols-outlined text-primary text-sm animate-pulse">check_circle</span>}
            </div>
            <TextArea 
              disabled={mode !== 'manual' || isProcessing}
              placeholder="Descreva a cena específica que você deseja..."
              value={prompt}
              onChange={(e) => onPromptChange(e.target.value)}
              className="h-24 text-xs"
            />
          </div>
        </div>

        <div className="space-y-2 text-left">
          <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Estilo Visual</label>
          <div className="relative">
            <select 
              disabled={isProcessing}
              className="w-full bg-surface-dark border border-border-dark rounded-xl py-3 px-3 text-xs text-white outline-none appearance-none cursor-pointer"
              value={style}
              onChange={(e) => onStyleChange(e.target.value)}
            >
              <option value="realistic">Foto Realista</option>
              <option value="3d">3D Render</option>
              <option value="cyber">Cyberpunk</option>
              <option value="anime">Estilo Anime</option>
            </select>
            <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none">expand_more</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ThumbnailConfigPanel;

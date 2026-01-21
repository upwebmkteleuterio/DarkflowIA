
import React from 'react';
import { TextArea } from '../ui/Input';

interface ThumbnailConfigPanelProps {
  mode: 'auto' | 'manual';
  prompt: string;
  style: string;
  variations: number;
  isProcessing: boolean;
  hasScript?: boolean;
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
  hasScript = false,
  onModeChange,
  onPromptChange,
  onStyleChange,
  onVariationsChange
}) => {
  return (
    <div className="bg-surface-dark border border-border-dark rounded-[32px] shadow-2xl overflow-hidden shrink-0 flex flex-col">
      {/* Header do Painel - Padronizado com DNA do Lote */}
      <div className="p-5 border-b border-border-dark bg-card-dark/50 text-left">
        <h3 className="text-lg font-black text-white font-display tracking-tight uppercase italic">
          Configuração <span className="text-primary">Visual</span>
        </h3>
      </div>

      <div className="p-6 space-y-6 overflow-y-auto custom-scrollbar max-h-[600px]">
        
        {/* Seção: Quantidade - Estilizada como a seção de Duração */}
        <section className="space-y-3 p-4 rounded-2xl border border-primary/20 bg-primary/5">
          <div className="flex justify-between items-center">
            <label className="text-[9px] font-black text-white uppercase tracking-widest">Quantidade de Imagens</label>
            <div className="bg-primary text-white text-[10px] font-black px-2 py-0.5 rounded-md shadow-lg">
              {variations} {variations === 1 ? 'ARTE' : 'ARTES'}
            </div>
          </div>
          <div className="grid grid-cols-4 gap-2 bg-background-dark/50 p-1 rounded-xl border border-border-dark">
            {[1, 2, 3, 4].map((num) => (
              <button 
                key={num}
                type="button"
                disabled={isProcessing}
                onClick={() => onVariationsChange(num)}
                className={`h-8 rounded-lg text-[10px] font-black transition-all ${
                  variations === num 
                  ? 'bg-primary text-white shadow-lg' 
                  : 'text-slate-500 hover:text-white'
                }`}
              >
                {num}
              </button>
            ))}
          </div>
          <p className="text-[8px] font-bold text-slate-500 uppercase tracking-tighter text-center opacity-60">1 imagem = 1 crédito</p>
        </section>

        {/* Estratégia: Automático - Padronizado com ScriptConfigPanel */}
        <div 
          onClick={() => !isProcessing && onModeChange('auto')} 
          className={`p-4 rounded-2xl border cursor-pointer transition-all text-left ${
            mode === 'auto' 
              ? 'border-primary bg-primary/5' 
              : 'border-border-dark bg-background-dark/30 opacity-60 hover:opacity-100'
          }`}
        >
          <div className="flex items-center justify-between mb-1">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-primary text-sm">auto_awesome</span>
              <h4 className="text-[9px] font-black text-white uppercase tracking-widest">Automático</h4>
            </div>
            <div className={`size-3 rounded-full border flex items-center justify-center ${mode === 'auto' ? 'border-primary bg-primary' : 'border-slate-600'}`}>
              {mode === 'auto' && <div className="size-1 bg-white rounded-full"></div>}
            </div>
          </div>
          <p className="text-[9px] text-slate-500 leading-tight">
            {hasScript 
              ? 'IA analisará o roteiro para criar a cena.' 
              : 'Sem roteiro detectado: IA usará apenas o título base.'}
          </p>
        </div>

        {/* Estratégia: Manual - Padronizado com ScriptConfigPanel */}
        <div 
          onClick={() => !isProcessing && onModeChange('manual')} 
          className={`p-4 rounded-2xl border cursor-pointer transition-all text-left ${
            mode === 'manual' 
              ? 'border-primary bg-primary/5' 
              : 'border-border-dark bg-background-dark/30 opacity-60 hover:opacity-100'
          }`}
        >
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-primary text-sm">edit_note</span>
              <h4 className="text-[9px] font-black text-white uppercase tracking-widest">Manual</h4>
            </div>
            <div className={`size-3 rounded-full border flex items-center justify-center ${mode === 'manual' ? 'border-primary bg-primary' : 'border-slate-600'}`}>
              {mode === 'manual' && <div className="size-1 bg-white rounded-full"></div>}
            </div>
          </div>
          
          {mode === 'manual' && (
            <div className="animate-in slide-in-from-top-1 duration-300">
              <TextArea 
                disabled={isProcessing}
                placeholder="Ex: Pessoa surpresa apontando para um gráfico..."
                value={prompt}
                onChange={(e) => onPromptChange(e.target.value)}
                className="h-20 text-[10px] bg-background-dark/50"
              />
            </div>
          )}
        </div>

        {/* Seção: Estilo Visual - Padronizado com o select do DNA do Lote */}
        <section className="space-y-1 text-left">
          <label className="text-[8px] font-black text-slate-500 uppercase ml-1">Estilo Visual</label>
          <div className="relative group">
            <select 
              disabled={isProcessing}
              className="w-full bg-background-dark border border-border-dark rounded-lg py-1.5 px-2 text-[10px] text-white outline-none appearance-none cursor-pointer focus:ring-1 focus:ring-primary transition-all"
              value={style}
              onChange={(e) => onStyleChange(e.target.value)}
            >
              <option value="realistic">Foto Realista (Ultra HD)</option>
              <option value="3d">Render 3D Pixar Style</option>
              <option value="cyber">Cyberpunk / Neon</option>
              <option value="anime">Anime / Ilustração Japonesa</option>
              <option value="cinematic">Cinematográfico</option>
            </select>
            <span className="material-symbols-outlined absolute right-2 top-1/2 -translate-y-1/2 text-slate-500 text-xs pointer-events-none group-hover:text-primary transition-colors">
              expand_more
            </span>
          </div>
        </section>
      </div>
    </div>
  );
};

export default ThumbnailConfigPanel;

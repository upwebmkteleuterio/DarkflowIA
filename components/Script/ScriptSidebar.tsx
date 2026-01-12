
import React from 'react';

interface ScriptSidebarProps {
  config: {
    tone: string;
    retention: string;
    duration: number;
    scriptPrompt: string;
    positives: string;
    negatives: string;
  };
  updateConfig: (field: string, value: any) => void;
  onGenerate: () => void;
  onNext: () => void;
  loading: boolean;
  isAdvancedOpen: boolean;
  onToggleAdvanced: () => void;
  hasScript?: boolean;
}

const ScriptSidebar: React.FC<ScriptSidebarProps> = ({ 
  config, 
  updateConfig, 
  onGenerate, 
  onNext,
  loading, 
  isAdvancedOpen, 
  onToggleAdvanced,
  hasScript
}) => {
  return (
    <aside className="w-full md:w-[360px] md:h-full border-r border-border-dark bg-background-dark md:overflow-y-auto p-6 space-y-6 custom-scrollbar flex-shrink-0">
      <div>
        <h2 className="text-white text-lg font-bold leading-tight mb-1">Configurações do Roteiro</h2>
        <p className="text-slate-400 text-xs">Personalize cada detalhe da sua narrativa.</p>
      </div>

      <div className="space-y-5">
        <div className="flex flex-col gap-2">
          <label className="text-white text-sm font-semibold flex items-center gap-2">
            <span className="material-symbols-outlined text-sm text-primary">record_voice_over</span>
            Tom de Voz
          </label>
          <div className="relative">
            <select 
              className="w-full rounded-lg text-white border border-border-dark bg-surface-dark h-11 pl-4 pr-12 text-sm font-medium outline-none focus:ring-1 focus:ring-primary appearance-none cursor-pointer"
              value={config.tone}
              onChange={(e) => updateConfig('tone', e.target.value)}
            >
              <option>Misterioso e Sombrio</option>
              <option>Enérgico e Rápido</option>
              <option>Sério e Documental</option>
              <option>Sensual</option>
              <option>Marqueteiro (Marketing Digital BR)</option>
              <option>Coaching</option>
            </select>
            <span className="material-symbols-outlined absolute right-3 top-2.5 text-slate-400 pointer-events-none">expand_more</span>
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <label className="text-white text-sm font-semibold flex items-center gap-2">
            <span className="material-symbols-outlined text-sm text-primary">psychology</span>
            Estrutura de Retenção
          </label>
          <div className="relative">
            <select 
              className="w-full rounded-lg text-white border border-border-dark bg-surface-dark h-11 pl-4 pr-12 text-sm font-medium outline-none focus:ring-1 focus:ring-primary appearance-none cursor-pointer"
              value={config.retention}
              onChange={(e) => updateConfig('retention', e.target.value)}
            >
              <option value="AIDA">AIDA (Atenção, Interesse, Desejo, Ação)</option>
              <option value="Jornada do Herói Simplificada">Jornada do Herói Simplificada</option>
              <option value="Problem-Agitate-Solve">Problem-Agitate-Solve</option>
              <option value="Mistério Progressivo">Mistério Progressivo</option>
            </select>
            <span className="material-symbols-outlined absolute right-3 top-2.5 text-slate-400 pointer-events-none">expand_more</span>
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <label className="text-white text-sm font-semibold flex items-center gap-2">
            <span className="material-symbols-outlined text-sm text-primary">edit_note</span>
            Contexto / Prompt (Opcional)
          </label>
          <textarea 
            className="w-full bg-surface-dark border border-border-dark rounded-lg py-3 px-4 text-sm text-white focus:ring-2 focus:ring-primary outline-none transition-all resize-none h-24 placeholder:text-slate-600"
            value={config.scriptPrompt}
            onChange={(e) => updateConfig('scriptPrompt', e.target.value)}
            placeholder="Ex: Um personagem que viveu na década de 70 revela os segredos..."
          />
        </div>

        <div className="flex flex-col gap-3 border-t border-border-dark pt-4">
          <div className="flex justify-between items-center">
            <label className="text-white text-sm font-semibold flex items-center gap-2">
              <span className="material-symbols-outlined text-sm text-primary">timer</span>
              Duração Estimada
            </label>
            <span className="text-primary text-xs font-bold bg-primary/10 px-2 py-0.5 rounded">{config.duration} min</span>
          </div>
          <input 
            type="range" min="3" max="30" value={config.duration} 
            onChange={(e) => updateConfig('duration', parseInt(e.target.value))}
            className="w-full h-1.5 bg-border-dark rounded-lg appearance-none cursor-pointer accent-primary" 
          />
        </div>

        <div className="border border-border-dark rounded-xl overflow-hidden">
          <button 
            onClick={onToggleAdvanced}
            className="w-full flex items-center justify-between p-3 bg-surface-dark/30 hover:bg-surface-dark/50 transition-colors"
          >
            <span className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
              <span className="material-symbols-outlined text-sm">settings_input_component</span>
              Avançado
            </span>
            <span className={`material-symbols-outlined text-slate-500 transition-transform ${isAdvancedOpen ? 'rotate-180' : ''}`}>expand_more</span>
          </button>
          
          {isAdvancedOpen && (
            <div className="p-4 space-y-4 bg-surface-dark/10 border-t border-border-dark animate-in slide-in-from-top-2 duration-200">
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-400">Positivo (Obrigatório falar)</label>
                <textarea 
                  className="w-full bg-surface-dark border border-border-dark rounded-lg py-2 px-3 text-xs text-white focus:ring-1 focus:ring-primary outline-none resize-none h-16"
                  value={config.positives}
                  onChange={(e) => updateConfig('positives', e.target.value)}
                  placeholder="Cite fontes históricas, fale sobre..."
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-400">Negativo (Não falar)</label>
                <textarea 
                  className="w-full bg-surface-dark border border-border-dark rounded-lg py-2 px-3 text-xs text-white focus:ring-1 focus:ring-red-500/50 outline-none resize-none h-16"
                  value={config.negatives}
                  onChange={(e) => updateConfig('negatives', e.target.value)}
                  placeholder="Não cite marcas, não use gírias..."
                />
              </div>
            </div>
          )}
        </div>

        <div className="flex flex-col gap-3 pt-2">
          <button 
            onClick={onGenerate}
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 rounded-xl h-12 bg-primary hover:bg-primary-hover disabled:opacity-50 text-white font-bold transition-all shadow-lg shadow-primary/20"
          >
            <span className="material-symbols-outlined">auto_awesome</span>
            {loading ? 'Gerando Roteiro...' : 'Gerar Novo Roteiro'}
          </button>

          {hasScript && !loading && (
            <button 
              onClick={onNext}
              className="w-full flex items-center justify-center gap-2 rounded-xl h-12 bg-white/5 border border-white/10 text-white hover:bg-white/10 font-bold transition-all"
            >
              Avançar para Thumbnail
              <span className="material-symbols-outlined text-sm">arrow_forward</span>
            </button>
          )}
        </div>
      </div>
    </aside>
  );
};

export default ScriptSidebar;

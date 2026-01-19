
import React from 'react';
import Button from '../ui/Button';
import Badge from '../ui/Badge';
import { TextArea } from '../ui/Input';
import { useAuth } from '../../context/AuthContext';

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
  const { profile } = useAuth();
  
  // Lógica de créditos: 140 palavras por minuto é o padrão industrial de locução
  const wordCount = config.duration * 140;
  
  // Pegar regras do plano do usuário (ou padrões se não carregado)
  const minutesPerCredit = (profile as any)?.plans?.minutes_per_credit || 30;
  const maxLimit = (profile as any)?.plans?.max_duration_limit || 60;
  
  const creditsNeeded = Math.ceil(config.duration / minutesPerCredit);

  return (
    <aside className="w-full md:w-[360px] md:h-full border-r border-border-dark bg-background-dark md:overflow-y-auto p-6 space-y-6 custom-scrollbar flex-shrink-0">
      <div className="space-y-1">
        <h2 className="text-white text-lg font-bold leading-tight font-display uppercase tracking-tight">DNA do Roteiro</h2>
        <p className="text-slate-400 text-[11px] font-medium uppercase tracking-widest opacity-60">Personalize a narrativa</p>
      </div>

      <div className="space-y-6">
        {/* DURAÇÃO / PALAVRAS - REESTRUTURADO */}
        <div className="flex flex-col gap-4 border-b border-border-dark pb-6">
          <div className="flex flex-col gap-1 items-center bg-primary/5 border border-primary/20 p-4 rounded-2xl shadow-inner">
             <div className="flex items-baseline gap-1">
               <span className="text-2xl font-black text-white">{wordCount.toLocaleString()}</span>
               <span className="text-[10px] font-bold text-slate-500 uppercase">palavras</span>
             </div>
             <p className="text-[10px] font-black text-primary uppercase tracking-[0.2em] animate-pulse">~ {config.duration} minutos de áudio</p>
          </div>
          
          <div className="space-y-2">
            <input 
              type="range" 
              min="3" 
              max={maxLimit} 
              step="1"
              value={config.duration} 
              onChange={(e) => updateConfig('duration', parseInt(e.target.value))}
              className="w-full h-2 bg-surface-dark rounded-lg appearance-none cursor-pointer accent-primary border border-border-dark" 
            />
            <div className="flex justify-between text-[8px] font-black text-slate-600 uppercase tracking-widest px-1">
               <span>3 min</span>
               <span>{maxLimit} min</span>
            </div>
          </div>

          {/* AVISO DE CRÉDITOS */}
          <div className={`p-3 rounded-xl border flex items-center justify-between transition-all ${creditsNeeded > 1 ? 'border-yellow-500/30 bg-yellow-500/5' : 'border-border-dark bg-background-dark/30'}`}>
            <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Custo de Produção:</span>
            <div className="flex items-center gap-1.5">
               <span className={`text-xs font-black ${creditsNeeded > 1 ? 'text-yellow-500' : 'text-primary'}`}>{creditsNeeded} {creditsNeeded === 1 ? 'Crédito' : 'Créditos'}</span>
               <span className="material-symbols-outlined text-xs text-slate-500">info</span>
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1 flex items-center gap-2">
            <span className="material-symbols-outlined text-xs text-primary">record_voice_over</span>
            Tom de Voz
          </label>
          <div className="relative">
            <select 
              className="w-full rounded-xl text-white border border-border-dark bg-surface-dark h-12 pl-4 pr-12 text-sm font-medium outline-none focus:ring-2 focus:ring-primary appearance-none cursor-pointer transition-all"
              value={config.tone}
              onChange={(e) => updateConfig('tone', e.target.value)}
            >
              <option>Misterioso e Sombrio</option>
              <option>Enérgico e Rápido</option>
              <option>Sério e Documental</option>
              <option>Sensual</option>
              <option>Marqueteiro</option>
            </select>
            <span className="material-symbols-outlined absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none">expand_more</span>
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1 flex items-center gap-2">
            <span className="material-symbols-outlined text-xs text-primary">psychology</span>
            Estrutura
          </label>
          <div className="relative">
            <select 
              className="w-full rounded-xl text-white border border-border-dark bg-surface-dark h-12 pl-4 pr-12 text-sm font-medium outline-none focus:ring-2 focus:ring-primary appearance-none cursor-pointer transition-all"
              value={config.retention}
              onChange={(e) => updateConfig('retention', e.target.value)}
            >
              <option value="AIDA">AIDA</option>
              <option value="Jornada do Herói">Jornada do Herói</option>
              <option value="Problem-Agitate-Solve">P.A.S</option>
              <option value="Mistério Progressivo">Mistério Progressivo</option>
            </select>
            <span className="material-symbols-outlined absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none">expand_more</span>
          </div>
        </div>

        <TextArea 
          label="Contexto / Prompt Extra"
          placeholder="Ex: Adicione uma reviravolta no final..."
          value={config.scriptPrompt}
          onChange={(e) => updateConfig('scriptPrompt', e.target.value)}
          className="h-28 text-xs"
        />

        <div className="border border-border-dark rounded-2xl overflow-hidden bg-surface-dark/20">
          <button 
            onClick={onToggleAdvanced}
            className="w-full flex items-center justify-between p-4 hover:bg-white/5 transition-colors"
          >
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
              <span className="material-symbols-outlined text-sm">settings_input_component</span>
              Instruções Avançadas
            </span>
            <span className={`material-symbols-outlined text-slate-500 transition-transform ${isAdvancedOpen ? 'rotate-180' : ''}`}>expand_more</span>
          </button>
          
          {isAdvancedOpen && (
            <div className="p-4 space-y-4 border-t border-border-dark animate-in slide-in-from-top-2 duration-200">
              <TextArea 
                label="Positivo (Obrigatório)"
                value={config.positives}
                onChange={(e) => updateConfig('positives', e.target.value)}
                className="h-20 text-[11px]"
              />
              <TextArea 
                label="Negativo (Evitar)"
                value={config.negatives}
                onChange={(e) => updateConfig('negatives', e.target.value)}
                className="h-20 text-[11px]"
              />
            </div>
          )}
        </div>

        <div className="flex flex-col gap-3 pt-4">
          <Button 
            fullWidth
            size="lg"
            icon="auto_awesome"
            loading={loading}
            onClick={onGenerate}
          >
            {loading ? 'Gerando...' : 'Regerar Roteiro'}
          </Button>

          {hasScript && !loading && (
            <Button 
              fullWidth
              variant="outline"
              size="lg"
              icon="arrow_forward"
              onClick={onNext}
            >
              Ir para Thumbnails
            </Button>
          )}
        </div>
      </div>
    </aside>
  );
};

export default ScriptSidebar;

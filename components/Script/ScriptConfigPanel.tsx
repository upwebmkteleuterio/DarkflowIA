
import React from 'react';
import Badge from '../ui/Badge';
import { TextArea } from '../ui/Input';
import { Project, ScriptMode } from '../../types';
import { useAuth } from '../../context/AuthContext';
import { SCRIPT_RULES } from '../../constants/ScriptRules';

interface ScriptConfigPanelProps {
  project: Project;
  onUpdateGlobal: (field: keyof Project, value: any) => void;
  isProcessing: boolean;
}

const ScriptConfigPanel: React.FC<ScriptConfigPanelProps> = ({ project, onUpdateGlobal, isProcessing }) => {
  const { profile } = useAuth();
  
  const duration = project.globalDuration || SCRIPT_RULES.DEFAULT_DURATION;
  const minutesPerCredit = profile?.minutes_per_credit || SCRIPT_RULES.CREDITS_LOGIC.base_minutes_per_credit;
  const creditsNeeded = SCRIPT_RULES.CREDITS_LOGIC.calculateNeeded(duration, minutesPerCredit);
  const estWordCount = duration * SCRIPT_RULES.WORDS_PER_MINUTE;

  const handleModeSelect = (mode: ScriptMode) => {
    onUpdateGlobal('scriptMode', mode);
  };

  return (
    <div className="bg-surface-dark border border-border-dark rounded-[32px] shadow-2xl overflow-hidden flex flex-col shrink-0">
      <div className="p-5 border-b border-border-dark bg-card-dark/50">
        <h3 className="text-lg font-black text-white font-display tracking-tight uppercase italic">DNA <span className="text-primary">do Lote</span></h3>
      </div>

      <div className="p-6 space-y-6 overflow-y-auto custom-scrollbar max-h-[500px]">
        {/* TEMPO */}
        <section className="space-y-4 p-4 rounded-2xl border border-primary/20 bg-primary/5">
          <div className="flex justify-between items-center">
            <label className="text-[9px] font-black text-white uppercase tracking-widest">Duração Alvo</label>
            <div className="bg-primary text-white text-[10px] font-black px-2 py-0.5 rounded-md shadow-lg">
              {duration} MIN
            </div>
          </div>
          
          <input 
            type="range" 
            min={SCRIPT_RULES.MIN_DURATION} 
            max={SCRIPT_RULES.MAX_DURATION} 
            value={duration} 
            disabled={isProcessing}
            onChange={(e) => onUpdateGlobal('globalDuration', parseInt(e.target.value))}
            className="w-full h-1.5 bg-background-dark rounded-lg appearance-none cursor-pointer accent-primary border border-border-dark" 
          />

          <div className="flex flex-col items-center gap-0.5">
             <p className="text-[9px] font-black text-primary uppercase tracking-widest">
               ~{estWordCount.toLocaleString()} palavras
             </p>
             <p className="text-[8px] font-bold text-slate-500 uppercase tracking-tighter">
               Custo: {creditsNeeded} {creditsNeeded === 1 ? 'Crédito' : 'Créditos'}
             </p>
          </div>
        </section>

        {/* MODO MANUAL */}
        <div 
          onClick={() => !isProcessing && handleModeSelect('manual')}
          className={`p-4 rounded-2xl border cursor-pointer transition-all ${project.scriptMode === 'manual' ? 'border-primary bg-primary/5' : 'border-border-dark bg-background-dark/30 opacity-60 hover:opacity-100'}`}
        >
          <div className="flex items-center justify-between mb-3">
             <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-primary text-sm">tune</span>
                <h4 className="text-[9px] font-black text-white uppercase tracking-widest">Manual</h4>
             </div>
             <div className={`size-3 rounded-full border flex items-center justify-center ${project.scriptMode === 'manual' ? 'border-primary bg-primary' : 'border-slate-600'}`}>
                {project.scriptMode === 'manual' && <div className="size-1 bg-white rounded-full"></div>}
             </div>
          </div>
          
          <div className={`space-y-3 ${project.scriptMode !== 'manual' ? 'hidden' : ''}`}>
            <div className="space-y-1">
               <label className="text-[8px] font-black text-slate-500 uppercase ml-1">Tom de Voz</label>
               <select 
                 className="w-full bg-background-dark border border-border-dark rounded-lg py-1.5 px-2 text-[10px] text-white outline-none"
                 value={project.globalTone}
                 onChange={(e) => onUpdateGlobal('globalTone', e.target.value)}
               >
                  <option>Misterioso e Sombrio</option>
                  <option>Enérgico e Rápido</option>
                  <option>Sério e Documental</option>
                  <option>Narrativa Acelerada</option>
               </select>
            </div>
            <div className="space-y-1">
               <label className="text-[8px] font-black text-slate-500 uppercase ml-1">Estrutura</label>
               <select 
                 className="w-full bg-background-dark border border-border-dark rounded-lg py-1.5 px-2 text-[10px] text-white outline-none"
                 value={project.globalRetention}
                 onChange={(e) => onUpdateGlobal('globalRetention', e.target.value)}
               >
                  <option>Mistério Progressivo</option>
                  <option>AIDA (Padrão Viral)</option>
                  <option>Problem-Agitate-Solve</option>
               </select>
            </div>
          </div>
        </div>

        {/* ROTEIRO VENCEDOR */}
        <div 
          onClick={() => !isProcessing && handleModeSelect('winner')}
          className={`p-4 rounded-2xl border cursor-pointer transition-all ${project.scriptMode === 'winner' ? 'border-primary bg-primary/5' : 'border-border-dark bg-background-dark/30 opacity-60 hover:opacity-100'}`}
        >
          <div className="flex items-center justify-between mb-2">
             <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-primary text-sm">workspace_premium</span>
                <h4 className="text-[9px] font-black text-white uppercase tracking-widest">Roteiro Vencedor</h4>
             </div>
             <div className={`size-3 rounded-full border flex items-center justify-center ${project.scriptMode === 'winner' ? 'border-primary bg-primary' : 'border-slate-600'}`}>
                {project.scriptMode === 'winner' && <div className="size-1 bg-white rounded-full"></div>}
             </div>
          </div>
          
          {project.scriptMode === 'winner' && (
            <TextArea 
              placeholder="Cole aqui seu roteiro de sucesso..."
              value={project.winnerTemplate || ''}
              onChange={(e) => onUpdateGlobal('winnerTemplate', e.target.value)}
              className="h-20 text-[10px] bg-background-dark/50"
            />
          )}
        </div>

        {/* AUTOMÁTICO */}
        <div 
          onClick={() => !isProcessing && handleModeSelect('auto')}
          className={`p-4 rounded-2xl border cursor-pointer transition-all ${project.scriptMode === 'auto' ? 'border-primary bg-primary/5' : 'border-border-dark bg-background-dark/30 opacity-60 hover:opacity-100'}`}
        >
          <div className="flex items-center justify-between mb-1">
             <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-primary text-sm">auto_awesome</span>
                <h4 className="text-[9px] font-black text-white uppercase tracking-widest">Automático</h4>
             </div>
             <div className={`size-3 rounded-full border flex items-center justify-center ${project.scriptMode === 'auto' ? 'border-primary bg-primary' : 'border-slate-600'}`}>
                {project.scriptMode === 'auto' && <div className="size-1 bg-white rounded-full"></div>}
             </div>
          </div>
          <p className="text-[9px] text-slate-500 leading-tight">IA definirá o melhor tom baseada na ideação.</p>
        </div>
      </div>
    </div>
  );
};

export default ScriptConfigPanel;

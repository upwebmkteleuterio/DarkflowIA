
import React from 'react';
import { Project, ScriptMode } from '../types';
import { useScriptQueue } from '../hooks/useScriptQueue';
import ScriptItemModal from '../components/Script/ScriptItemModal';

interface ScriptProps {
  project: Project;
  onUpdate: (updated: Project) => void;
  onNext: () => void;
}

const Script: React.FC<ScriptProps> = ({ project, onUpdate, onNext }) => {
  const {
    isProcessing,
    selectedItem,
    setSelectedItem,
    handleStartBatch,
    handleRetry,
    handleSaveItem,
    stats
  } = useScriptQueue(project, onUpdate);

  const updateGlobal = (field: keyof Project, value: any) => {
    const updates: Partial<Project> = { [field]: value };
    
    // Lógica de auto-seleção de chave:
    if (field === 'winnerTemplate' && value.trim().length > 5) {
      updates.scriptMode = 'winner';
    } else if (field === 'globalTone' || field === 'globalRetention') {
      updates.scriptMode = 'manual';
    }
    
    onUpdate({ ...project, ...updates });
  };

  const isStartDisabled = isProcessing || stats.pending === 0 || (
    project.scriptMode === 'winner' && (!project.winnerTemplate || project.winnerTemplate.trim().length < 10)
  );

  const itemsArray = project.items || [];

  return (
    <div className="max-w-[1600px] mx-auto px-6 py-8 animate-in fade-in duration-500">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        
        {/* COLUNA ESQUERDA: CONFIGURAÇÕES DE LOTE (1/3) */}
        <div className="lg:col-span-1 space-y-6 lg:sticky lg:top-8">
          <div className="bg-surface-dark border border-border-dark rounded-[32px] shadow-2xl overflow-hidden">
            <div className="p-6 border-b border-border-dark bg-card-dark/50">
              <h3 className="text-xl font-black text-white font-display tracking-tight uppercase">Configurações de Lote</h3>
              <p className="text-slate-500 text-xs">Defina o "DNA" criativo para os seus {stats.total} roteiros.</p>
            </div>

            <div className="p-6 space-y-8">
              {/* MODO MANUAL */}
              <section className={`space-y-4 p-4 rounded-2xl border transition-all ${project.scriptMode === 'manual' ? 'border-primary bg-primary/5' : 'border-border-dark bg-background-dark/30 opacity-60'}`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-primary text-sm">tune</span>
                    <h4 className="text-[10px] font-black text-white uppercase tracking-widest">Configuração Manual</h4>
                  </div>
                  <input 
                    type="radio" 
                    name="scriptMode"
                    checked={project.scriptMode === 'manual'} 
                    onChange={() => onUpdate({...project, scriptMode: 'manual'})}
                    className="accent-primary cursor-pointer"
                  />
                </div>
                
                <div className="space-y-3">
                  <div className="space-y-1">
                    <label className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">Tom de Voz</label>
                    <select 
                      disabled={project.scriptMode !== 'manual'}
                      className="w-full bg-surface-dark border border-border-dark rounded-xl py-2.5 px-3 text-xs text-white outline-none focus:ring-1 focus:ring-primary disabled:opacity-50"
                      value={project.globalTone}
                      onChange={(e) => updateGlobal('globalTone', e.target.value)}
                    >
                      <option>Misterioso e Sombrio</option>
                      <option>Enérgico e Rápido</option>
                      <option>Sério e Documental</option>
                      <option>Sensual</option>
                      <option>Marqueteiro</option>
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">Estrutura</label>
                    <select 
                      disabled={project.scriptMode !== 'manual'}
                      className="w-full bg-surface-dark border border-border-dark rounded-xl py-2.5 px-3 text-xs text-white outline-none focus:ring-1 focus:ring-primary disabled:opacity-50"
                      value={project.globalRetention}
                      onChange={(e) => updateGlobal('globalRetention', e.target.value)}
                    >
                      <option value="AIDA">AIDA</option>
                      <option value="Jornada do Herói">Jornada do Herói</option>
                      <option value="Problem-Agitate-Solve">P.A.S</option>
                      <option value="Mistério Progressivo">Mistério Progressivo</option>
                    </select>
                  </div>
                </div>
              </section>

              {/* MODO VENCEDOR */}
              <section className={`space-y-4 p-4 rounded-2xl border transition-all ${project.scriptMode === 'winner' ? 'border-primary bg-primary/5' : 'border-border-dark bg-background-dark/30 opacity-60'}`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-primary text-sm">workspace_premium</span>
                    <h4 className="text-[10px] font-black text-white uppercase tracking-widest">Roteiro Vencedor</h4>
                  </div>
                  <input 
                    type="radio" 
                    name="scriptMode"
                    checked={project.scriptMode === 'winner'} 
                    onChange={() => onUpdate({...project, scriptMode: 'winner'})}
                    className="accent-primary cursor-pointer"
                  />
                </div>
                
                <textarea 
                  className="w-full h-32 bg-surface-dark border border-border-dark rounded-xl p-3 text-xs text-slate-300 focus:ring-1 focus:ring-primary outline-none transition-all resize-none placeholder:text-slate-600"
                  placeholder="Cole aqui sua estrutura vencedora de roteiro e a nossa IA irá criar baseado nela..."
                  value={project.winnerTemplate || ''}
                  onChange={(e) => updateGlobal('winnerTemplate', e.target.value)}
                />
              </section>

              {/* MODO AUTOMÁTICO */}
              <section className={`space-y-4 p-4 rounded-2xl border transition-all ${project.scriptMode === 'auto' ? 'border-primary bg-primary/5' : 'border-border-dark bg-background-dark/30 opacity-60'}`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-primary text-sm">auto_awesome</span>
                    <h4 className="text-[10px] font-black text-white uppercase tracking-widest">Automático</h4>
                  </div>
                  <input 
                    type="radio" 
                    name="scriptMode"
                    checked={project.scriptMode === 'auto'} 
                    onChange={() => onUpdate({...project, scriptMode: 'auto'})}
                    className="accent-primary cursor-pointer"
                  />
                </div>
                <p className="text-[10px] text-slate-500 leading-relaxed italic">A IA definirá o melhor tom e estrutura narrativa de forma inteligente para cada vídeo individualmente.</p>
              </section>

              {/* DURAÇÃO (Sempre ativo) */}
              <section className="space-y-4 p-4 rounded-2xl border border-border-dark bg-background-dark/50">
                <div className="flex justify-between items-center">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Tempo do Roteiro</label>
                  <span className="bg-primary/20 text-primary text-[10px] font-black px-2 py-0.5 rounded-md">{project.globalDuration} min</span>
                </div>
                <input 
                  type="range" min="3" max="30" 
                  value={project.globalDuration} 
                  onChange={(e) => onUpdate({...project, globalDuration: parseInt(e.target.value)})}
                  className="w-full h-1.5 bg-background-dark rounded-lg appearance-none cursor-pointer accent-primary border border-border-dark" 
                />
                <p className="text-[9px] text-slate-600 font-bold text-center uppercase tracking-widest">~{project.globalDuration * 140} palavras</p>
              </section>
            </div>
          </div>
        </div>

        {/* COLUNA DIREITA: FILA E LISTA (2/3) */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* Resumo Rápido */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-surface-dark border border-border-dark p-4 rounded-2xl flex flex-col items-center">
              <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Total</span>
              <p className="text-xl font-black text-white">{stats.total}</p>
            </div>
            <div className="bg-surface-dark border border-border-dark p-4 rounded-2xl flex flex-col items-center">
              <span className="text-[9px] font-black text-accent-green uppercase tracking-widest">Prontos</span>
              <p className="text-xl font-black text-white">{stats.completed}</p>
            </div>
            <div className="bg-surface-dark border border-border-dark p-4 rounded-2xl flex flex-col items-center">
              <span className="text-[9px] font-black text-primary uppercase tracking-widest">Fila</span>
              <p className="text-xl font-black text-white">{stats.pending}</p>
            </div>
            <div className="bg-surface-dark border border-border-dark p-4 rounded-2xl flex flex-col items-center">
              <span className="text-[9px] font-black text-red-500 uppercase tracking-widest">Falhas</span>
              <p className="text-xl font-black text-white">{stats.failed}</p>
            </div>
          </div>

          {/* Ações da Fila */}
          <div className="bg-surface-dark border border-border-dark p-6 rounded-[32px] shadow-2xl flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <div className={`size-12 rounded-2xl flex items-center justify-center ${isProcessing ? 'bg-primary animate-pulse' : 'bg-white/5 text-slate-500'}`}>
                <span className="material-symbols-outlined">{isProcessing ? 'sync' : 'pause_circle'}</span>
              </div>
              <div>
                <h3 className="text-base font-bold text-white leading-tight">
                  {isProcessing ? 'Processando Lote...' : 'Status da Produção'}
                </h3>
                <p className="text-slate-400 text-[10px] uppercase tracking-widest font-bold">
                  {stats.completed}/{stats.total} Vídeos Finalizados
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 w-full md:w-auto">
              <button 
                onClick={handleStartBatch}
                disabled={isStartDisabled}
                className="flex-1 md:flex-none px-8 py-3.5 bg-primary hover:bg-primary-hover text-white font-black text-xs uppercase tracking-[0.2em] rounded-xl shadow-xl shadow-primary/20 transition-all active:scale-95 disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                <span className="material-symbols-outlined text-sm">play_arrow</span>
                Iniciar Produção
              </button>
              
              {stats.completed > 0 && (
                <button 
                  onClick={onNext}
                  className="flex-1 md:flex-none px-8 py-3.5 bg-white text-black font-black text-xs uppercase tracking-[0.2em] rounded-xl hover:bg-slate-200 transition-all active:scale-95 flex items-center justify-center gap-2"
                >
                  Próxima Etapa
                  <span className="material-symbols-outlined text-sm">arrow_forward</span>
                </button>
              )}
            </div>
          </div>

          {/* Lista de Itens */}
          <div className="bg-surface-dark border border-border-dark rounded-[32px] shadow-2xl overflow-hidden">
            {/* AJUSTE FINAL DE COLUNAS: Título (1fr) | Status (200px) | Ações (100px) */}
            <div className="grid grid-cols-[1fr_200px_100px] p-4 border-b border-border-dark bg-card-dark/30 text-[10px] font-black text-slate-500 uppercase tracking-widest">
              <span className="ml-4">Título do Vídeo</span>
              <span className="text-center">Status</span>
              <span className="text-right mr-4">Ações</span>
            </div>

            <div className="divide-y divide-border-dark/30 max-h-[500px] overflow-y-auto custom-scrollbar">
              {itemsArray.map((item) => (
                <div key={item.id} className="grid grid-cols-[1fr_200px_100px] p-5 items-center hover:bg-white/5 transition-colors group">
                  <p className="text-sm font-bold text-slate-200 truncate pr-4 max-w-full" title={item.title}>
                    {item.title}
                  </p>
                  
                  <div className="flex justify-center">
                    {item.status === 'completed' && <span className="text-[9px] font-black text-accent-green bg-accent-green/10 px-4 py-1.5 rounded-full border border-accent-green/20">CONCLUÍDO</span>}
                    {item.status === 'generating' && <span className="text-[9px] font-black text-primary bg-primary/10 px-4 py-1.5 rounded-full border border-primary/20 animate-pulse">GERANDO ROTEIRO...</span>}
                    {item.status === 'pending' && <span className="text-[9px] font-black text-slate-500 bg-slate-500/10 px-4 py-1.5 rounded-full border border-slate-500/20">NA FILA</span>}
                    {item.status === 'failed' && <span className="text-[9px] font-black text-red-500 bg-red-500/10 px-4 py-1.5 rounded-full border border-red-500/20">FALHA</span>}
                  </div>

                  <div className="flex justify-end gap-1.5 pr-2">
                    {item.status === 'completed' && (
                      <button 
                        onClick={() => setSelectedItem(item)}
                        className="size-8 bg-white/5 hover:bg-primary hover:text-white rounded-lg flex items-center justify-center text-slate-400 transition-all border border-border-dark"
                      >
                        <span className="material-symbols-outlined text-base">edit_square</span>
                      </button>
                    )}
                    
                    {item.status === 'failed' && (
                      <button 
                        onClick={() => handleRetry(item.id)}
                        className="size-8 bg-red-500/10 hover:bg-red-500 text-red-500 hover:text-white rounded-lg flex items-center justify-center transition-all border border-red-500/20"
                      >
                        <span className="material-symbols-outlined text-base">refresh</span>
                      </button>
                    )}

                    {item.status === 'completed' && (
                      <button 
                        onClick={() => {
                          navigator.clipboard.writeText(item.script || '');
                        }}
                        className="size-8 bg-white/5 hover:bg-accent-green hover:text-black rounded-lg flex items-center justify-center text-slate-400 transition-all border border-border-dark"
                      >
                        <span className="material-symbols-outlined text-base">content_copy</span>
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <ScriptItemModal 
        item={selectedItem} 
        onClose={() => setSelectedItem(null)} 
        onSave={handleSaveItem}
      />
    </div>
  );
};

export default Script;

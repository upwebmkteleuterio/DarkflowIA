
import React from 'react';
import { useBatch } from '../../context/BatchContext';

const GlobalBatchProgress: React.FC = () => {
  const { state, clearQueue, cancelQueue } = useBatch();
  const { stats, isProcessing, tasks, currentTaskId } = state;

  if (tasks.length === 0) return null;

  const currentTask = tasks.find(t => t.id === currentTaskId);
  const isFinished = stats.completed + stats.failed + stats.cancelled === stats.total;
  const wasCancelled = stats.cancelled > 0 && isFinished;

  const getTaskIcon = () => {
    if (wasCancelled) return 'block';
    if (isFinished) return 'check_circle';
    if (!currentTask) return 'sync';
    return currentTask.type === 'script' ? 'description' : 'image';
  };

  const getTaskLabel = () => {
    if (wasCancelled) return 'Processamento Interrompido';
    if (isFinished) return 'Processamento Concluído';
    if (!currentTask) return 'Preparando...';
    return currentTask.type === 'script' ? 'Gerando Roteiro' : 'Gerando Imagem';
  };

  return (
    <div className="fixed bottom-6 right-6 z-[100] w-[320px] md:w-[380px] animate-in slide-in-from-right-10 duration-500">
      <div className="bg-surface-dark border border-border-dark rounded-[24px] shadow-2xl overflow-hidden backdrop-blur-xl">
        <div className="p-5">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className={`size-10 rounded-xl flex items-center justify-center ${
                wasCancelled ? 'bg-red-500/20 text-red-500' :
                isFinished ? 'bg-accent-green/20 text-accent-green' : 
                'bg-primary/20 text-primary border border-primary/20'
              }`}>
                <span className={`material-symbols-outlined text-xl ${!isFinished && isProcessing ? 'animate-pulse' : ''}`}>
                  {getTaskIcon()}
                </span>
              </div>
              <div className="text-left">
                <p className={`text-[10px] font-black uppercase tracking-widest ${wasCancelled ? 'text-red-400' : 'text-slate-500'}`}>
                  {getTaskLabel()}
                </p>
                <p className="text-xs font-bold text-white">
                  {stats.completed + stats.cancelled} de {stats.total} finalizados
                </p>
              </div>
            </div>
            
            {isFinished ? (
              <button 
                onClick={clearQueue}
                className="text-slate-500 hover:text-white transition-colors"
              >
                <span className="material-symbols-outlined text-lg">close</span>
              </button>
            ) : (
              <button 
                onClick={cancelQueue}
                className="h-8 px-4 bg-red-500/10 text-red-500 rounded-xl flex items-center justify-center hover:bg-red-500 hover:text-white transition-all border border-red-500/20 text-[9px] font-black uppercase tracking-widest shadow-lg shadow-red-500/5 active:scale-95"
              >
                Cancelar
              </button>
            )}
          </div>

          <div className="space-y-2">
            <div className="flex justify-between text-[9px] font-black text-slate-500 uppercase tracking-widest">
              <span>Progresso Total</span>
              <span>{stats.percent}%</span>
            </div>
            <div className="w-full h-2 bg-background-dark rounded-full border border-border-dark overflow-hidden">
              <div 
                className={`h-full transition-all duration-1000 ${
                  wasCancelled ? 'bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.4)]' :
                  isFinished ? 'bg-accent-green shadow-[0_0_10px_#39FF14]' : 
                  'bg-primary shadow-[0_0_10px_#8655f6]'
                }`}
                style={{ width: `${stats.percent}%` }}
              ></div>
            </div>
          </div>

          {!isFinished && (
            <div className="mt-4 p-3 bg-background-dark/50 rounded-xl border border-border-dark flex items-center gap-3">
              <div className="size-2 bg-primary rounded-full animate-pulse shadow-[0_0_5px_#8655f6]"></div>
              <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest truncate">
                {currentTask?.config?.title || 'Trabalhando no fundo...'}
              </p>
            </div>
          )}

          {wasCancelled && (
            <p className="mt-3 text-[8px] font-black text-red-400 uppercase tracking-widest text-center italic">
              * Itens pendentes foram devolvidos para a fila.
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default GlobalBatchProgress;

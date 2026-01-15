
import React from 'react';
import { Project } from '../types';
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

  return (
    <div className="max-w-6xl mx-auto px-6 py-10 animate-in fade-in duration-500">
      {/* Resumo da Fila */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-10">
        <div className="bg-surface-dark border border-border-dark p-6 rounded-3xl shadow-xl flex flex-col gap-1">
          <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Total de Roteiros</span>
          <p className="text-3xl font-black text-white">{stats.total}</p>
        </div>
        <div className="bg-surface-dark border border-border-dark p-6 rounded-3xl shadow-xl flex flex-col gap-1">
          <span className="text-[10px] font-black text-accent-green uppercase tracking-widest">Concluídos</span>
          <p className="text-3xl font-black text-white">{stats.completed}</p>
        </div>
        <div className="bg-surface-dark border border-border-dark p-6 rounded-3xl shadow-xl flex flex-col gap-1">
          <span className="text-[10px] font-black text-primary uppercase tracking-widest">Aguardando</span>
          <p className="text-3xl font-black text-white">{stats.pending}</p>
        </div>
        <div className="bg-surface-dark border border-border-dark p-6 rounded-3xl shadow-xl flex flex-col gap-1">
          <span className="text-[10px] font-black text-red-500 uppercase tracking-widest">Falhas</span>
          <p className="text-3xl font-black text-white">{stats.failed}</p>
        </div>
      </div>

      {/* Ações da Fila */}
      <div className="bg-surface-dark border border-border-dark p-6 rounded-[32px] shadow-2xl mb-8 flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className={`size-12 rounded-2xl flex items-center justify-center ${isProcessing ? 'bg-primary animate-pulse' : 'bg-white/5 text-slate-500'}`}>
            <span className="material-symbols-outlined">{isProcessing ? 'sync' : 'pause_circle'}</span>
          </div>
          <div>
            <h3 className="text-lg font-bold text-white leading-tight">
              {isProcessing ? 'IA em Trabalho de Fundo' : 'Fila de Produção'}
            </h3>
            <p className="text-slate-400 text-xs">A IA gera os roteiros enquanto você gerencia seus projetos.</p>
          </div>
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto">
          {stats.pending > 0 && (
            <button 
              onClick={handleStartBatch}
              disabled={isProcessing}
              className="flex-1 md:flex-none px-8 py-4 bg-primary hover:bg-primary-hover text-white font-black text-xs uppercase tracking-widest rounded-xl shadow-xl shadow-primary/20 transition-all active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2"
            >
              <span className="material-symbols-outlined">play_arrow</span>
              Iniciar Produção
            </button>
          )}
          
          {stats.completed > 0 && (
            <button 
              onClick={onNext}
              className="flex-1 md:flex-none px-8 py-4 bg-white text-black font-black text-xs uppercase tracking-widest rounded-xl hover:bg-slate-200 transition-all active:scale-95 flex items-center justify-center gap-2"
            >
              Próxima Etapa (Thumb)
              <span className="material-symbols-outlined text-sm">arrow_forward</span>
            </button>
          )}
        </div>
      </div>

      {/* Lista de Itens da Fila */}
      <div className="bg-surface-dark border border-border-dark rounded-[32px] shadow-2xl overflow-hidden">
        <div className="grid grid-cols-[1fr_120px_160px] p-6 border-b border-border-dark bg-card-dark/30 text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">
          <span>Título do Roteiro</span>
          <span className="text-center">Status</span>
          <span className="text-right">Ações</span>
        </div>

        <div className="divide-y divide-border-dark/50 max-h-[600px] overflow-y-auto custom-scrollbar">
          {project.items.map((item) => (
            <div key={item.id} className="grid grid-cols-[1fr_120px_160px] p-6 items-center hover:bg-white/5 transition-colors group">
              <p className="text-sm font-bold text-slate-200 truncate pr-4">{item.title}</p>
              
              <div className="flex justify-center">
                {item.status === 'completed' && <span className="text-[10px] font-black text-accent-green bg-accent-green/10 px-3 py-1 rounded-full border border-accent-green/20">CONCLUÍDO</span>}
                {item.status === 'generating' && <span className="text-[10px] font-black text-primary bg-primary/10 px-3 py-1 rounded-full border border-primary/20 animate-pulse">GERANDO...</span>}
                {item.status === 'pending' && <span className="text-[10px] font-black text-slate-500 bg-slate-500/10 px-3 py-1 rounded-full border border-slate-500/20">NA FILA</span>}
                {item.status === 'failed' && <span className="text-[10px] font-black text-red-500 bg-red-500/10 px-3 py-1 rounded-full border border-red-500/20">FALHA</span>}
              </div>

              <div className="flex justify-end gap-2">
                {item.status === 'completed' && (
                  <button 
                    onClick={() => setSelectedItem(item)}
                    className="size-10 bg-white/5 hover:bg-primary hover:text-white rounded-xl flex items-center justify-center text-slate-400 transition-all shadow-inner"
                    title="Ver/Editar Roteiro"
                  >
                    <span className="material-symbols-outlined text-[20px]">edit_square</span>
                  </button>
                )}
                
                {item.status === 'failed' && (
                  <button 
                    onClick={() => handleRetry(item.id)}
                    className="size-10 bg-red-500/10 hover:bg-red-500 text-red-500 hover:text-white rounded-xl flex items-center justify-center transition-all border border-red-500/20"
                    title="Tentar Novamente"
                  >
                    <span className="material-symbols-outlined text-[20px]">refresh</span>
                  </button>
                )}

                {item.status === 'completed' && (
                  <button 
                    onClick={() => {
                      navigator.clipboard.writeText(item.script);
                      alert('Copiado!');
                    }}
                    className="size-10 bg-white/5 hover:bg-accent-green hover:text-black rounded-xl flex items-center justify-center text-slate-400 transition-all shadow-inner"
                    title="Copiar Rápido"
                  >
                    <span className="material-symbols-outlined text-[20px]">content_copy</span>
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Modal de Edição */}
      <ScriptItemModal 
        item={selectedItem} 
        onClose={() => setSelectedItem(null)} 
        onSave={handleSaveItem}
      />
    </div>
  );
};

export default Script;

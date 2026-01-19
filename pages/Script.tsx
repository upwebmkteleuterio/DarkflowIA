
import React from 'react';
import { Project } from '../types';
import { useScriptQueue } from '../hooks/useScriptQueue';
import ScriptItemModal from '../components/Script/ScriptItemModal';
import Button from '../components/ui/Button';
import Badge from '../components/ui/Badge';
import { TextArea } from '../components/ui/Input';

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
              {/* DURAÇÃO */}
              <section className="space-y-4 p-4 rounded-2xl border border-primary bg-primary/5 shadow-inner">
                <div className="flex justify-between items-center">
                  <label className="text-[10px] font-black text-white uppercase tracking-widest ml-1">Tempo do Roteiro</label>
                  <Badge variant="primary">{project.globalDuration} min</Badge>
                </div>
                <input 
                  type="range" min="3" max="30" 
                  value={project.globalDuration} 
                  onChange={(e) => onUpdate({...project, globalDuration: parseInt(e.target.value)})}
                  className="w-full h-1.5 bg-background-dark rounded-lg appearance-none cursor-pointer accent-primary border border-border-dark" 
                />
                <p className="text-[9px] text-primary/70 font-bold text-center uppercase tracking-widest">~{project.globalDuration * 140} palavras para narração</p>
              </section>

              {/* MODO MANUAL */}
              <section className={`space-y-4 p-4 rounded-2xl border transition-all duration-300 ${project.scriptMode === 'manual' ? 'border-primary bg-primary/5' : 'border-border-dark bg-background-dark/30'}`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-primary text-sm">tune</span>
                    <h4 className="text-[10px] font-black uppercase tracking-widest text-white">Configuração Manual</h4>
                  </div>
                  <input 
                    type="radio" 
                    name="scriptMode"
                    checked={project.scriptMode === 'manual'} 
                    onChange={() => onUpdate({...project, scriptMode: 'manual'})}
                    className="accent-primary cursor-pointer"
                  />
                </div>
                
                <div className={`space-y-3 transition-opacity duration-300 ${project.scriptMode === 'manual' ? 'opacity-100' : 'opacity-30'}`}>
                  <div className="space-y-1">
                    <label className="text-[9px] font-bold text-slate-500 uppercase tracking-widest ml-1">Tom de Voz</label>
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
                    <label className="text-[9px] font-bold text-slate-500 uppercase tracking-widest ml-1">Estrutura</label>
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
              <section className={`space-y-4 p-4 rounded-2xl border transition-all duration-300 ${project.scriptMode === 'winner' ? 'border-primary bg-primary/5' : 'border-border-dark bg-background-dark/30'}`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-primary text-sm">workspace_premium</span>
                    <h4 className="text-[10px] font-black uppercase tracking-widest text-white">Roteiro Vencedor</h4>
                  </div>
                  <input 
                    type="radio" 
                    name="scriptMode"
                    checked={project.scriptMode === 'winner'} 
                    onChange={() => onUpdate({...project, scriptMode: 'winner'})}
                    className="accent-primary cursor-pointer"
                  />
                </div>
                
                <div className={`transition-opacity duration-300 ${project.scriptMode === 'winner' ? 'opacity-100' : 'opacity-30'}`}>
                  <TextArea 
                    disabled={project.scriptMode !== 'winner'}
                    placeholder="Cole aqui sua estrutura vencedora de roteiro e a nossa IA irá criar baseado nela..."
                    value={project.winnerTemplate || ''}
                    onChange={(e) => updateGlobal('winnerTemplate', e.target.value)}
                    className="h-32 text-xs"
                  />
                </div>
              </section>

              {/* MODO AUTOMÁTICO */}
              <section className={`space-y-4 p-4 rounded-2xl border transition-all duration-300 ${project.scriptMode === 'auto' ? 'border-primary bg-primary/5' : 'border-border-dark bg-background-dark/30'}`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-primary text-sm">auto_awesome</span>
                    <h4 className="text-[10px] font-black uppercase tracking-widest text-white">Automático</h4>
                  </div>
                  <input 
                    type="radio" 
                    name="scriptMode"
                    checked={project.scriptMode === 'auto'} 
                    onChange={() => onUpdate({...project, scriptMode: 'auto'})}
                    className="accent-primary cursor-pointer"
                  />
                </div>
                <p className={`text-[10px] text-slate-500 leading-relaxed italic transition-opacity duration-300 ${project.scriptMode === 'auto' ? 'opacity-100' : 'opacity-30'}`}>
                  A IA definirá o melhor tom e estrutura narrativa de forma inteligente para cada vídeo individualmente.
                </p>
              </section>
            </div>
          </div>
        </div>

        {/* COLUNA DIREITA: FILA E LISTA (2/3) */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* Resumo Rápido */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: 'Total', value: stats.total, color: 'neutral' },
              { label: 'Prontos', value: stats.completed, color: 'success' },
              { label: 'Fila', value: stats.pending, color: 'primary' },
              { label: 'Falhas', value: stats.failed, color: 'error' }
            ].map(stat => (
              <div key={stat.label} className="bg-surface-dark border border-border-dark p-4 rounded-2xl flex flex-col items-center">
                <span className={`text-[9px] font-black uppercase tracking-widest mb-1 ${
                  stat.color === 'success' ? 'text-accent-green' : 
                  stat.color === 'primary' ? 'text-primary' : 
                  stat.color === 'error' ? 'text-red-500' : 'text-slate-500'
                }`}>{stat.label}</span>
                <p className="text-xl font-black text-white">{stat.value}</p>
              </div>
            ))}
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
              <Button 
                onClick={handleStartBatch}
                disabled={isStartDisabled}
                icon="play_arrow"
                size="lg"
                className="flex-1 md:flex-none"
              >
                Iniciar Produção
              </Button>
              
              {stats.completed > 0 && (
                <Button 
                  onClick={onNext}
                  variant="white"
                  size="lg"
                  icon="arrow_forward"
                  className="flex-1 md:flex-none"
                >
                  Próxima Etapa
                </Button>
              )}
            </div>
          </div>

          {/* Lista de Itens */}
          <div className="bg-surface-dark border border-border-dark rounded-[32px] shadow-2xl overflow-hidden">
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
                    {item.status === 'completed' && <Badge variant="success">CONCLUÍDO</Badge>}
                    {item.status === 'generating' && <Badge variant="primary" pulse>GERANDO ROTEIRO...</Badge>}
                    {item.status === 'pending' && <Badge variant="neutral">NA FILA</Badge>}
                    {item.status === 'failed' && <Badge variant="error">FALHA</Badge>}
                  </div>

                  <div className="flex justify-end gap-1.5 pr-2">
                    {item.status === 'completed' && (
                      <Button
                        variant="ghost"
                        size="sm"
                        icon="edit_square"
                        onClick={() => setSelectedItem(item)}
                        className="size-8 p-0"
                      />
                    )}
                    
                    {item.status === 'failed' && (
                      <Button
                        variant="danger"
                        size="sm"
                        icon="refresh"
                        onClick={() => handleRetry(item.id)}
                        className="size-8 p-0"
                      />
                    )}

                    {item.status === 'completed' && (
                      <Button
                        variant="ghost"
                        size="sm"
                        icon="content_copy"
                        onClick={() => {
                          navigator.clipboard.writeText(item.script || '');
                        }}
                        className="size-8 p-0 hover:text-accent-green hover:bg-accent-green/10"
                      />
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

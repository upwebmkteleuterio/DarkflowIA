
import React, { useState, useEffect, useRef } from 'react';
import { Project, ScriptItem } from '../types';
import { useScriptQueue } from '../hooks/useScriptQueue';
import { supabase } from '../lib/supabase';
import Button from '../components/ui/Button';
import Badge from '../components/ui/Badge';
import ScriptEditor from '../components/Script/ScriptEditor';
import ScriptConfigPanel from '../components/Script/ScriptConfigPanel';
import SidebarItemList from '../components/Project/SidebarItemList';
import AdvanceButton from '../components/ui/AdvanceButton';

interface ScriptProps {
  project: Project;
  onUpdate: (updated: Project) => void;
  onNext: () => void;
}

const Script: React.FC<ScriptProps> = ({ project, onUpdate, onNext }) => {
  const {
    isProcessing,
    handleStartBatch,
    handleRetry,
    stats
  } = useScriptQueue(project, onUpdate);

  const [selectedItemId, setSelectedItemId] = useState(project.items[0]?.id || '');
  const [isAutoSaving, setIsAutoSaving] = useState(false);
  const itemsArray = project.items || [];
  const selectedItem = itemsArray.find(i => i.id === selectedItemId);
  const saveTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!selectedItemId && itemsArray.length > 0) {
      setSelectedItemId(itemsArray[0].id);
    }
  }, [itemsArray, selectedItemId]);

  const updateGlobal = async (field: keyof Project, value: any) => {
    onUpdate({ ...project, [field]: value });

    const dbUpdates: any = {};
    if (field === 'globalTone') dbUpdates.global_tone = value;
    if (field === 'globalRetention') dbUpdates.global_retention = value;
    if (field === 'globalDuration') dbUpdates.global_duration = value;
    if (field === 'winnerTemplate') dbUpdates.winner_template = value;
    if (field === 'scriptMode') dbUpdates.script_mode = value;

    await supabase.from('projects').update(dbUpdates).eq('id', project.id);
  };

  const updateItemScript = (text: string) => {
    if (!selectedItemId) return;
    setIsAutoSaving(true);

    const updatedItems = itemsArray.map(item => 
      item.id === selectedItemId ? { ...item, script: text } : item
    );
    onUpdate({ ...project, items: updatedItems });

    if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
    saveTimeoutRef.current = setTimeout(async () => {
      await supabase
        .from('script_items')
        .update({ script: text })
        .eq('id', selectedItemId);
      setIsAutoSaving(false);
    }, 1500);
  };

  const isStartDisabled = isProcessing || stats.pending === 0 || (
    project.scriptMode === 'winner' && (!project.winnerTemplate || project.winnerTemplate.trim().length < 10)
  );

  const renderStatusBadge = (item: ScriptItem) => {
    if (item.status === 'completed') return <Badge variant="success" pulse>ROTEIRO PRONTO</Badge>;
    if (item.status === 'generating') return <Badge variant="primary" pulse>GERANDO...</Badge>;
    if (item.status === 'failed') return <Badge variant="error">FALHA</Badge>;
    return <Badge variant="neutral">PENDENTE</Badge>;
  };

  return (
    <div className="max-w-[1600px] mx-auto px-6 py-8 animate-in fade-in duration-500 h-full overflow-hidden">
      <div className="grid grid-cols-1 lg:grid-cols-[380px_1fr] gap-8 h-full items-start overflow-hidden">
        
        <div className="h-full flex flex-col gap-6 overflow-y-auto custom-scrollbar pr-1 pb-10">
          <ScriptConfigPanel 
            project={project} 
            onUpdateGlobal={updateGlobal} 
            isProcessing={isProcessing} 
          />

          <SidebarItemList 
            title="Fila de Roteiros"
            items={itemsArray}
            selectedId={selectedItemId}
            onSelect={setSelectedItemId}
            renderBadge={renderStatusBadge}
            footerAction={
              <Button 
                fullWidth
                size="lg" 
                icon="auto_awesome" 
                loading={isProcessing}
                onClick={handleStartBatch}
                disabled={isStartDisabled}
              >
                {isProcessing ? 'Processando Lote...' : 'Gerar Roteiros'}
              </Button>
            }
          />
        </div>

        <div className="h-full flex flex-col overflow-hidden">
          <div className="bg-surface-dark border border-border-dark rounded-[32px] p-8 shadow-2xl flex flex-col flex-1 overflow-hidden relative">
             <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-8">
                <div className="flex-1 min-w-0">
                   <h2 className="text-xl font-black text-white leading-tight truncate">{selectedItem?.title || 'Selecione um vídeo'}</h2>
                   <div className="flex items-center gap-3 mt-1">
                      <div className="flex items-center gap-1">
                        <span className="material-symbols-outlined text-primary text-xs">info</span>
                        <p className="text-slate-500 text-[10px] font-bold uppercase tracking-widest">
                          {selectedItem?.status === 'completed' ? 'Conteúdo Finalizado' : 'Aguardando Geração da IA'}
                        </p>
                      </div>
                      {isAutoSaving && (
                        <Badge variant="success" pulse className="px-2 py-0.5 animate-pulse">
                           <span className="text-[8px]">Salvando...</span>
                        </Badge>
                      )}
                      {!isAutoSaving && selectedItem?.script && (
                        <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-white/5 border border-white/10">
                           <span className="material-symbols-outlined text-[10px] text-slate-500">cloud_done</span>
                           <span className="text-[8px] font-black text-slate-500 uppercase tracking-widest">Salvo</span>
                        </div>
                      )}
                   </div>
                </div>
                
                {selectedItem?.status === 'failed' && (
                   <Button variant="danger" icon="refresh" onClick={() => handleRetry(selectedItemId)}>Tentar Novamente</Button>
                )}
             </div>

             <div className="flex-1 overflow-hidden">
                <ScriptEditor 
                  loading={selectedItem?.status === 'generating'} 
                  localScript={selectedItem?.script || ''} 
                  copying={false}
                  onCopy={() => navigator.clipboard.writeText(selectedItem?.script || '')}
                  onExecCommand={(cmd) => document.execCommand(cmd)}
                  onContentChange={updateItemScript}
                  editorRef={React.createRef()}
                />
             </div>

             <AdvanceButton 
               isVisible={stats.completed > 0} 
               onClick={onNext} 
               label="Ir para Thumbnails" 
             />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Script;

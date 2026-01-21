
import React, { useState, useEffect, useRef } from 'react';
import { Project, ScriptItem } from '../types';
import { useScriptQueue } from '../hooks/useScriptQueue';
import { supabase } from '../lib/supabase';
import Button from '../components/ui/Button';
import Badge from '../components/ui/Badge';
import ScriptConfigPanel from '../components/Script/ScriptConfigPanel';
import SidebarItemList from '../components/Project/SidebarItemList';
import ScriptMainPanel from '../components/Script/ScriptMainPanel';

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

  // Segurança: Garante que items exista antes de acessar a primeira posição
  const [selectedItemId, setSelectedItemId] = useState((project.items || [])[0]?.id || '');
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
    <div className="max-w-[1600px] mx-auto px-4 md:px-6 py-6 md:py-8 h-full overflow-y-auto lg:overflow-hidden animate-in fade-in duration-500">
      <div className="grid grid-cols-1 lg:grid-cols-[380px_1fr] gap-6 md:gap-8 items-start lg:h-full lg:overflow-hidden">
        
        <div className="flex flex-col gap-6 lg:h-full lg:overflow-y-auto custom-scrollbar lg:pr-1 pb-4 lg:pb-10">
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
                {isProcessing ? 'Processando...' : 'Gerar Roteiros'}
              </Button>
            }
          />
        </div>

        <ScriptMainPanel 
          selectedItem={selectedItem}
          isAutoSaving={isAutoSaving}
          isProcessing={isProcessing}
          onUpdateScript={updateItemScript}
          onRetry={handleRetry}
          onNext={onNext}
          stats={stats}
        />
      </div>
    </div>
  );
};

export default Script;

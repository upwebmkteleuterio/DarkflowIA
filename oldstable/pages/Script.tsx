
import React, { useState, useEffect, useRef } from 'react';
import { Project, ScriptItem } from '../types';
import { useScriptQueue } from '../hooks/useScriptQueue';
import { useBatch } from '../context/BatchContext';
import { supabase } from '../lib/supabase';
import { useNavigate } from 'react-router-dom';
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
  const navigate = useNavigate();
  const {
    isProcessing,
    handleStartBatch,
    confirmBatch,
    showConfirm,
    setShowConfirm,
    totalCost,
    pendingCount,
    canGenerateCount,
    isOutOfCredits,
    availableCredits,
    handleRetry,
    stats
  } = useScriptQueue(project, onUpdate);
  
  const { getTaskStatus } = useBatch();

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
    setIsAutoSaving(text !== selectedItem?.script);

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
    const batchTask = getTaskStatus(item.id, 'script');
    if (batchTask?.status === 'processing') return <Badge variant="primary" pulse>GERANDO...</Badge>;
    if (batchTask?.status === 'pending') return <Badge variant="neutral" pulse>NA FILA...</Badge>;
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

      {showConfirm && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-6 bg-black/80 backdrop-blur-md animate-in fade-in duration-300">
          <div className="bg-surface-dark border border-border-dark w-full max-w-md p-8 rounded-[32px] shadow-2xl space-y-8 animate-in zoom-in-95 duration-300">
            
            {/* ESTADO 1: TOTALMENTE SEM CRÉDITOS */}
            {isOutOfCredits ? (
              <>
                <div className="text-center space-y-4">
                  <div className="size-20 bg-red-500/20 text-red-500 rounded-full flex items-center justify-center mx-auto border border-red-500/20">
                    <span className="material-symbols-outlined text-4xl">warning</span>
                  </div>
                  <div className="space-y-1">
                    <h3 className="text-xl font-black text-white uppercase tracking-tight italic">Saldo Insuficiente</h3>
                    <p className="text-slate-400 text-sm">Você não possui créditos de roteiro suficientes para iniciar esta produção.</p>
                  </div>
                </div>

                <div className="bg-red-500/5 border border-red-500/20 rounded-2xl p-6 text-center">
                  <p className="text-[10px] font-black text-red-400 uppercase tracking-widest mb-1">Seu Saldo Atual</p>
                  <p className="text-3xl font-black text-white">{availableCredits} <span className="text-xs text-slate-500">créditos</span></p>
                </div>

                <div className="flex flex-col gap-3">
                  <Button size="lg" onClick={() => navigate('/plans')}>Ver Planos & Créditos</Button>
                  <Button variant="ghost" onClick={() => setShowConfirm(false)}>Agora não</Button>
                </div>
              </>
            ) : (
              /* ESTADO 2: SALDO DISPONÍVEL (TOTAL OU PARCIAL) */
              <>
                <div className="text-center space-y-2">
                  <div className="size-16 bg-primary/20 text-primary rounded-full flex items-center justify-center mx-auto mb-4 border border-primary/20">
                    <span className="material-symbols-outlined text-3xl">payments</span>
                  </div>
                  <h3 className="text-xl font-black text-white uppercase tracking-tight italic">Confirmar Produção</h3>
                  <p className="text-slate-400 text-xs">Abaixo está o resumo do processamento em lote.</p>
                </div>

                <div className="space-y-4">
                  <div className="bg-background-dark/50 border border-border-dark rounded-2xl p-6 space-y-4">
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-slate-500 font-bold uppercase tracking-widest">Itens na Fila</span>
                      <span className="text-white font-black">{pendingCount} vídeos</span>
                    </div>
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-slate-500 font-bold uppercase tracking-widest">Saldo Disponível</span>
                      <span className="text-accent-green font-black">{availableCredits} créditos</span>
                    </div>
                    <div className="h-px bg-border-dark"></div>
                    <div className="flex justify-between items-center">
                      <span className="text-[10px] text-slate-400 font-black uppercase tracking-widest">Investimento do Lote</span>
                      <span className="text-primary font-black text-lg">{totalCost} <span className="text-[10px]">créditos</span></span>
                    </div>
                  </div>

                  {/* AVISO DE GERAÇÃO PARCIAL */}
                  {canGenerateCount < pendingCount && (
                    <div className="bg-orange-500/10 border border-orange-500/20 p-4 rounded-2xl animate-in shake duration-500">
                      <div className="flex items-start gap-3">
                        <span className="material-symbols-outlined text-orange-500">error_outline</span>
                        <div className="text-left">
                          <p className="text-[10px] font-black text-orange-500 uppercase tracking-widest">Atenção: Limite de Saldo</p>
                          <p className="text-[11px] text-slate-300 leading-tight mt-1">
                            Você tem <strong>{pendingCount} itens</strong> na fila, mas apenas <strong>{availableCredits} créditos</strong> disponíveis. 
                            <span className="block mt-1 text-white font-bold">Os últimos {pendingCount - canGenerateCount} vídeos serão ignorados.</span>
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                <div className="flex flex-col gap-3">
                  <Button size="lg" onClick={confirmBatch}>Iniciar Geração</Button>
                  <Button variant="ghost" onClick={() => setShowConfirm(false)}>Cancelar</Button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Script;

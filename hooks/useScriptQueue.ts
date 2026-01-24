
import { useState, useCallback, useRef, useEffect } from 'react';
import { Project, ScriptItem } from '../types';
import { useBatch } from '../context/BatchContext';
import { useAuth } from '../context/AuthContext';

export const useScriptQueue = (project: Project, onUpdate: (updated: Project) => void) => {
  const { state: batchState, addToQueue } = useBatch();
  const { profile } = useAuth();
  const [showConfirm, setShowConfirm] = useState(false);
  const [pendingCount, setPendingCount] = useState(0);
  const [totalCost, setTotalCost] = useState(0);
  const [canGenerateCount, setCanGenerateCount] = useState(0);
  const [isOutOfCredits, setIsOutOfCredits] = useState(false);
  
  const projectRef = useRef(project);
  useEffect(() => { projectRef.current = project; }, [project]);

  const calculateBudget = useCallback(() => {
    const pendingItems = projectRef.current.items.filter(i => i.status === 'pending');
    if (pendingItems.length === 0) return { count: 0, cost: 0, canGen: 0, out: false };

    const minutesPerCredit = profile?.minutes_per_credit || 30;
    const duration = projectRef.current.globalDuration || 12;
    const costPerItem = Math.ceil(duration / minutesPerCredit);
    const availableCredits = profile?.text_credits || 0;
    
    // Quantos itens o usuário PODE gerar com o que tem
    const canGen = Math.floor(availableCredits / costPerItem);
    const actualItemsToGen = Math.min(pendingItems.length, canGen);
    
    return {
      count: pendingItems.length,
      cost: actualItemsToGen * costPerItem,
      canGen: canGen,
      out: availableCredits < costPerItem
    };
  }, [profile, project.globalDuration]);

  const handleStartBatch = () => {
    const budget = calculateBudget();
    
    setPendingCount(budget.count);
    setTotalCost(budget.cost);
    setCanGenerateCount(budget.canGen);
    setIsOutOfCredits(budget.out);
    setShowConfirm(true);
  };

  const confirmBatch = async () => {
    const pending = projectRef.current.items.filter(i => i.status === 'pending');
    const budget = calculateBudget();
    
    // Pega apenas os itens que cabem no saldo
    const itemsToProcess = pending.slice(0, budget.canGen);
    
    if (itemsToProcess.length === 0) return;

    // Callback de sucesso para injeção imediata na UI
    const handleScriptSuccess = (itemId: string, scriptText: string) => {
      console.log(`[SYNC] Injetando roteiro instantâneo para item ${itemId}`);
      const currentItems = projectRef.current.items || [];
      const updatedItems = currentItems.map(item => 
        item.id === itemId 
          ? { ...item, script: scriptText, status: 'completed' as const } 
          : item
      );
      
      onUpdate({
        ...projectRef.current,
        items: updatedItems
      });
    };

    addToQueue(projectRef.current, itemsToProcess.map(i => i.id), 'script', {}, handleScriptSuccess);
    setShowConfirm(false);
  };

  const isProcessing = batchState.isProcessing && batchState.tasks.some(t => t.projectId === project.id && t.type === 'script');

  return {
    isProcessing,
    handleStartBatch,
    confirmBatch,
    showConfirm,
    setShowConfirm,
    totalCost,
    pendingCount,
    canGenerateCount,
    isOutOfCredits,
    availableCredits: profile?.text_credits || 0,
    handleRetry: (itemId: string) => addToQueue(projectRef.current, [itemId], 'script'),
    stats: {
      total: project.items.length,
      completed: project.items.filter(i => i.status === 'completed').length,
      pending: project.items.filter(i => i.status === 'pending').length,
    }
  };
};

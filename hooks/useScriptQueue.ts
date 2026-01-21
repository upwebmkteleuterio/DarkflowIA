
import { useState, useCallback, useRef, useEffect } from 'react';
import { Project } from '../types';
import { useBatch } from '../context/BatchContext';
import { useAuth } from '../context/AuthContext';

export const useScriptQueue = (project: Project, onUpdate: (updated: Project) => void) => {
  const { state: batchState, addToQueue } = useBatch();
  const { profile } = useAuth();
  const [showConfirm, setShowConfirm] = useState(false);
  const [pendingCount, setPendingCount] = useState(0);
  const [totalCost, setTotalCost] = useState(0);
  
  const projectRef = useRef(project);
  useEffect(() => { projectRef.current = project; }, [project]);

  const calculateCost = useCallback(() => {
    const pending = projectRef.current.items.filter(i => i.status === 'pending');
    if (pending.length === 0) return { count: 0, cost: 0 };

    const minutesPerCredit = profile?.minutes_per_credit || 30;
    const duration = projectRef.current.globalDuration || 12;
    const costPerItem = Math.ceil(duration / minutesPerCredit);
    
    return {
      count: pending.length,
      cost: pending.length * costPerItem
    };
  }, [profile]);

  const handleStartBatch = () => {
    const { count, cost } = calculateCost();
    if (count === 0) return;

    setPendingCount(count);
    setTotalCost(cost);
    setShowConfirm(true);
  };

  const confirmBatch = async () => {
    const pending = projectRef.current.items.filter(i => i.status === 'pending');
    addToQueue(projectRef.current, pending.map(i => i.id), 'script');
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
    handleRetry: (itemId: string) => addToQueue(projectRef.current, [itemId], 'script'),
    stats: {
      total: project.items.length,
      completed: project.items.filter(i => i.status === 'completed').length,
      pending: project.items.filter(i => i.status === 'pending').length,
    }
  };
};

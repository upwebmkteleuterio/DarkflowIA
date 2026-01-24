
import { useState, useCallback, useRef, useEffect } from 'react';
import { Project, ScriptItem } from '../types';
import { useBatch } from '../context/BatchContext';
import { useAuth } from '../context/AuthContext';

export const useThumbnailQueue = (project: Project, onUpdate: (updated: Project) => void) => {
  const { state: batchState, addToQueue } = useBatch();
  const { profile } = useAuth();
  
  // Estados para o Modal de Confirmação
  const [showConfirm, setShowConfirm] = useState(false);
  const [pendingCount, setPendingCount] = useState(0);
  const [totalCost, setTotalCost] = useState(0);
  const [canGenerateCount, setCanGenerateCount] = useState(0);
  const [isOutOfCredits, setIsOutOfCredits] = useState(false);
  const [currentConfig, setCurrentConfig] = useState<any>(null);
  const [currentSelectedId, setCurrentSelectedId] = useState<string | null>(null);

  const projectRef = useRef(project);
  useEffect(() => {
    projectRef.current = project;
  }, [project]);

  const handleStartBatch = (itemId: string, config: any) => {
    const availableCredits = profile?.image_credits || 0;
    const requested = config.variations || 1;
    
    // Cálculos de Budget
    const canGen = Math.min(requested, availableCredits);
    const outOfCredits = availableCredits <= 0;
    
    setPendingCount(requested);
    setTotalCost(canGen); // Cada variação custa 1 crédito de imagem
    setCanGenerateCount(canGen);
    setIsOutOfCredits(outOfCredits);
    setCurrentConfig(config);
    setCurrentSelectedId(itemId);
    setShowConfirm(true);
  };

  const confirmBatch = async () => {
    if (!currentSelectedId || !currentConfig) return;

    // Ajusta a configuração para não ultrapassar o saldo
    const adjustedConfig = {
      ...currentConfig,
      variations: canGenerateCount
    };

    // Callback para atualizar a UI instantaneamente com as novas URLs
    const handleThumbSuccess = (id: string, urls: string[]) => {
      console.log(`[SYNC] Injetando ${urls.length} thumbnails instantâneas para item ${id}`);
      const currentItems = projectRef.current.items || [];
      const updatedItems = currentItems.map(item => 
        item.id === id 
          ? { ...item, thumbnails: urls, thumbStatus: 'completed' as const } 
          : item
      );
      
      onUpdate({
        ...projectRef.current,
        items: updatedItems
      });
    };

    // Adiciona apenas o que foi pago à fila global
    addToQueue(projectRef.current, [currentSelectedId], 'thumbnail', adjustedConfig, handleThumbSuccess);
    setShowConfirm(false);
  };

  const isProcessing = batchState.isProcessing && batchState.tasks.some(t => t.projectId === project.id && t.type === 'thumbnail');

  const items = project.items || [];
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
    availableCredits: profile?.image_credits || 0,
    stats: {
      total: items.length,
      completed: items.filter(i => i.thumbnails && i.thumbnails.length > 0).length,
      pending: items.filter(i => i.thumbStatus === 'pending').length,
      failed: items.filter(i => i.thumbStatus === 'failed').length,
      generating: items.filter(i => i.thumbStatus === 'generating').length,
    }
  };
};

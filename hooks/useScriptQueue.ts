
import { useState, useCallback, useRef, useEffect } from 'react';
import { Project, ScriptItem } from '../types';
import { generateScript } from '../services/geminiService';

export const useScriptQueue = (project: Project, onUpdate: (updated: Project) => void) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [selectedItem, setSelectedItem] = useState<ScriptItem | null>(null);
  
  const projectRef = useRef(project);
  
  useEffect(() => {
    projectRef.current = project;
  }, [project]);

  const updateItemStatus = useCallback((itemId: string, updates: Partial<ScriptItem>) => {
    const currentItems = projectRef.current.items || [];
    const updatedItems = currentItems.map(item => 
      item.id === itemId ? { ...item, ...updates } : item
    );
    
    onUpdate({ ...projectRef.current, items: updatedItems });
  }, [onUpdate]);

  const processNextPending = async () => {
    const currentItems = projectRef.current.items || [];
    const pendingItem = currentItems.find(item => item.status === 'pending');
    
    if (!pendingItem) {
      console.log("[QUEUE] Nenhum item pendente restante. Finalizando lote.");
      setIsProcessing(false);
      return;
    }

    console.group(`[QUEUE] Processando Item: ${pendingItem.title}`);
    updateItemStatus(pendingItem.id, { status: 'generating', error: undefined });

    try {
      const script = await generateScript(
        pendingItem.title,
        projectRef.current.niche,
        projectRef.current.globalDuration,
        projectRef.current.scriptMode,
        projectRef.current.globalTone,
        projectRef.current.globalRetention,
        projectRef.current.winnerTemplate,
        projectRef.current.baseTheme
      );

      updateItemStatus(pendingItem.id, { 
        status: 'completed', 
        script: script || '' 
      });
    } catch (error: any) {
      console.error("[QUEUE] Erro ao processar item:", error);
      updateItemStatus(pendingItem.id, { 
        status: 'failed', 
        error: error.message || 'Erro na API do Gemini' 
      });
    } finally {
      console.groupEnd();
      setTimeout(processNextPending, 1500);
    }
  };

  const handleStartBatch = () => {
    if (isProcessing) return;
    const currentItems = projectRef.current.items || [];
    const hasPending = currentItems.some(i => i.status === 'pending');
    if (!hasPending) return;

    setIsProcessing(true);
    processNextPending();
  };

  const handleRetry = (itemId: string) => {
    updateItemStatus(itemId, { status: 'pending', error: undefined });
    if (!isProcessing) {
      setIsProcessing(true);
      setTimeout(processNextPending, 500);
    }
  };

  const handleSaveItem = (itemId: string, newScript: string) => {
    updateItemStatus(itemId, { script: newScript });
    setSelectedItem(null);
  };

  const items = project.items || [];

  return {
    isProcessing,
    selectedItem,
    setSelectedItem,
    handleStartBatch,
    handleRetry,
    handleSaveItem,
    stats: {
      total: items.length,
      completed: items.filter(i => i.status === 'completed').length,
      pending: items.filter(i => i.status === 'pending').length,
      failed: items.filter(i => i.status === 'failed').length,
      generating: items.filter(i => i.status === 'generating').length,
    }
  };
};

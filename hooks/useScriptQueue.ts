
import { useState, useCallback, useRef } from 'react';
import { Project, ScriptItem } from '../types';
import { generateScript } from '../services/geminiService';

export const useScriptQueue = (project: Project, onUpdate: (updated: Project) => void) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [selectedItem, setSelectedItem] = useState<ScriptItem | null>(null);
  
  // Ref para evitar closures desatualizadas em processos longos
  const projectRef = useRef(project);
  projectRef.current = project;

  const updateItemStatus = useCallback((itemId: string, updates: Partial<ScriptItem>) => {
    const updatedItems = projectRef.current.items.map(item => 
      item.id === itemId ? { ...item, ...updates } : item
    );
    onUpdate({ ...projectRef.current, items: updatedItems });
  }, [onUpdate]);

  const processNextPending = async () => {
    const pendingItem = projectRef.current.items.find(item => item.status === 'pending');
    
    if (!pendingItem) {
      setIsProcessing(false);
      return;
    }

    setIsProcessing(true);
    updateItemStatus(pendingItem.id, { status: 'generating', error: undefined });

    try {
      const script = await generateScript(
        pendingItem.title,
        projectRef.current.niche,
        projectRef.current.globalDuration,
        projectRef.current.globalTone,
        projectRef.current.globalRetention,
        projectRef.current.baseTheme // Usamos o tema base como contexto extra
      );

      updateItemStatus(pendingItem.id, { 
        status: 'completed', 
        script: script || '' 
      });
    } catch (error: any) {
      updateItemStatus(pendingItem.id, { 
        status: 'failed', 
        error: error.message || 'Erro na API do Gemini' 
      });
    }

    // Pequena pausa para não estourar rate limit e processar o próximo
    setTimeout(processNextPending, 1000);
  };

  const handleStartBatch = () => {
    if (isProcessing) return;
    processNextPending();
  };

  const handleRetry = (itemId: string) => {
    updateItemStatus(itemId, { status: 'pending', error: undefined });
    if (!isProcessing) processNextPending();
  };

  const handleSaveItem = (itemId: string, newScript: string) => {
    updateItemStatus(itemId, { script: newScript });
    setSelectedItem(null);
  };

  return {
    isProcessing,
    selectedItem,
    setSelectedItem,
    handleStartBatch,
    handleRetry,
    handleSaveItem,
    stats: {
      total: project.items.length,
      completed: project.items.filter(i => i.status === 'completed').length,
      pending: project.items.filter(i => i.status === 'pending').length,
      failed: project.items.filter(i => i.status === 'failed').length,
      generating: project.items.filter(i => i.status === 'generating').length,
    }
  };
};


import { useState, useCallback, useRef, useEffect } from 'react';
import { Project, ScriptItem } from '../types';
import { generateThumbnail, generateScenePrompt } from '../services/geminiService';

export const useThumbnailQueue = (project: Project, onUpdate: (updated: Project) => void) => {
  const [isProcessing, setIsProcessing] = useState(false);
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

  const processNextPending = async (config: { mode: 'auto' | 'manual', prompt: string, style: string, variations: number }) => {
    const currentItems = projectRef.current.items || [];
    const pendingItem = currentItems.find(item => item.thumbStatus === 'pending');
    
    if (!pendingItem) {
      console.log("[THUMB-QUEUE] Todas as artes concluídas.");
      setIsProcessing(false);
      return;
    }

    updateItemStatus(pendingItem.id, { thumbStatus: 'generating' });

    try {
      let finalPrompt = config.prompt;

      // Se for automático, a IA gera o prompt baseada no roteiro específico
      if (config.mode === 'auto') {
        const generated = await generateScenePrompt(
          pendingItem.title, 
          pendingItem.script || "", 
          config.style
        );
        finalPrompt = generated || pendingItem.title;
      }

      // Gerar variações solicitadas
      const newImages: string[] = [];
      for (let i = 0; i < config.variations; i++) {
        const imgUrl = await generateThumbnail(finalPrompt, config.style, pendingItem.title);
        if (imgUrl) newImages.push(imgUrl);
      }

      if (newImages.length > 0) {
        updateItemStatus(pendingItem.id, { 
          thumbStatus: 'completed', 
          thumbnails: [...newImages, ...(pendingItem.thumbnails || [])] 
        });
      } else {
        throw new Error("IA não retornou imagens.");
      }
    } catch (error) {
      console.error("[THUMB-QUEUE] Erro no item:", pendingItem.title, error);
      updateItemStatus(pendingItem.id, { thumbStatus: 'failed' });
    } finally {
      // Pequeno delay entre gerações para evitar rate limit
      setTimeout(() => processNextPending(config), 1500);
    }
  };

  const handleStartBatch = (config: { mode: 'auto' | 'manual', prompt: string, style: string, variations: number }) => {
    if (isProcessing) return;
    
    // Marcar itens para fila (apenas os que não tem thumb ou falharam)
    const updatedItems = projectRef.current.items.map(item => ({
      ...item,
      thumbStatus: (item.thumbnails.length === 0 || item.thumbStatus === 'failed') ? 'pending' : item.thumbStatus
    }));
    
    onUpdate({ ...projectRef.current, items: updatedItems });
    setIsProcessing(true);
    setTimeout(() => processNextPending(config), 500);
  };

  const handleRetry = (itemId: string, config: { mode: 'auto' | 'manual', prompt: string, style: string, variations: number }) => {
    updateItemStatus(itemId, { thumbStatus: 'pending' });
    if (!isProcessing) {
      setIsProcessing(true);
      setTimeout(() => processNextPending(config), 500);
    }
  };

  const items = project.items || [];
  return {
    isProcessing,
    handleStartBatch,
    handleRetry,
    stats: {
      total: items.length,
      completed: items.filter(i => i.thumbnails.length > 0).length,
      pending: items.filter(i => i.thumbStatus === 'pending').length,
      failed: items.filter(i => i.thumbStatus === 'failed').length,
      generating: items.filter(i => i.thumbStatus === 'generating').length,
    }
  };
};

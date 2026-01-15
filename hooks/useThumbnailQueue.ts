
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

  const processNextPending = async (style: string) => {
    const currentItems = projectRef.current.items || [];
    // Busca item que ainda não tem thumbnail ou está com status pending
    const pendingItem = currentItems.find(item => item.thumbStatus === 'pending');
    
    if (!pendingItem) {
      console.log("[THUMB-QUEUE] Fila concluída.");
      setIsProcessing(false);
      return;
    }

    updateItemStatus(pendingItem.id, { thumbStatus: 'generating' });

    try {
      // 1. Gerar Prompt de IA baseado no roteiro e título
      const prompt = await generateScenePrompt(pendingItem.title, pendingItem.script || "", style);
      
      // 2. Gerar a Thumbnail
      const imgUrl = await generateThumbnail(prompt || pendingItem.title, style, pendingItem.title);
      
      if (imgUrl) {
        updateItemStatus(pendingItem.id, { 
          thumbStatus: 'completed', 
          thumbnails: [imgUrl, ...(pendingItem.thumbnails || [])] 
        });
      } else {
        throw new Error("Falha na geração da imagem");
      }
    } catch (error) {
      console.error("[THUMB-QUEUE] Erro:", error);
      updateItemStatus(pendingItem.id, { thumbStatus: 'failed' });
    } finally {
      setTimeout(() => processNextPending(style), 1000);
    }
  };

  const handleStartBatch = (style: string) => {
    if (isProcessing) return;
    
    // Marcar todos que não tem thumb como pending para entrar na fila
    const updatedItems = projectRef.current.items.map(item => ({
      ...item,
      thumbStatus: (item.thumbnails.length === 0 || item.thumbStatus === 'failed') ? 'pending' : item.thumbStatus
    }));
    
    onUpdate({ ...projectRef.current, items: updatedItems });
    
    setIsProcessing(true);
    setTimeout(() => processNextPending(style), 500);
  };

  const handleRetry = (itemId: string, style: string) => {
    updateItemStatus(itemId, { thumbStatus: 'pending' });
    if (!isProcessing) {
      setIsProcessing(true);
      setTimeout(() => processNextPending(style), 500);
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

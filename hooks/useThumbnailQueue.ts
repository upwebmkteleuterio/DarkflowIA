
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

  const processSingleItem = async (itemId: string, batchConfig: { mode: 'auto' | 'manual', prompt: string, style: string, variations: number }) => {
    const currentItems = projectRef.current.items || [];
    const item = currentItems.find(i => i.id === itemId);
    
    if (!item) return;

    // Sinaliza início da geração
    updateItemStatus(itemId, { thumbStatus: 'generating' });

    try {
      const itemMode = item.thumbMode || batchConfig.mode;
      const itemPrompt = item.thumbPrompt || batchConfig.prompt;
      
      let finalPrompt = itemPrompt;

      if (itemMode === 'auto') {
        const generated = await generateScenePrompt(
          item.title, 
          item.script || "", 
          batchConfig.style
        );
        finalPrompt = generated || item.title;
      }

      const newImages: string[] = [];
      // Gera as imagens conforme a quantidade solicitada
      for (let i = 0; i < batchConfig.variations; i++) {
        const imgUrl = await generateThumbnail(finalPrompt, batchConfig.style, item.title);
        if (imgUrl) newImages.push(imgUrl);
      }

      if (newImages.length > 0) {
        // Importante: Manter as imagens antigas e adicionar as novas no topo
        const existingThumbs = item.thumbnails || [];
        updateItemStatus(itemId, { 
          thumbStatus: 'completed', 
          thumbnails: [...newImages, ...existingThumbs] 
        });
      } else {
        throw new Error("A IA não retornou nenhuma imagem válida.");
      }
    } catch (error) {
      console.error("[THUMB-SINGLE] Erro no item:", item.title, error);
      updateItemStatus(itemId, { thumbStatus: 'failed' });
    }
  };

  const processNextPending = async (batchConfig: { mode: 'auto' | 'manual', prompt: string, style: string, variations: number }) => {
    const currentItems = projectRef.current.items || [];
    const pendingItem = currentItems.find(item => item.thumbStatus === 'pending');
    
    if (!pendingItem) {
      setIsProcessing(false);
      return;
    }

    await processSingleItem(pendingItem.id, batchConfig);
    
    // Continua para o próximo após um breve delay
    setTimeout(() => processNextPending(batchConfig), 1500);
  };

  const handleStartBatch = (config: { mode: 'auto' | 'manual', prompt: string, style: string, variations: number }) => {
    if (isProcessing) return;
    
    const updatedItems = projectRef.current.items.map(item => ({
      ...item,
      thumbStatus: (item.thumbnails.length === 0 || item.thumbStatus === 'failed') ? 'pending' : item.thumbStatus
    }));
    
    onUpdate({ ...projectRef.current, items: updatedItems });
    setIsProcessing(true);
    setTimeout(() => processNextPending(config), 500);
  };

  const handleGenerateSingle = async (itemId: string, config: { mode: 'auto' | 'manual', prompt: string, style: string, variations: number }) => {
    // Se já estiver gerando este item, ignora cliques repetidos
    const item = projectRef.current.items.find(i => i.id === itemId);
    if (item?.thumbStatus === 'generating') return;
    
    await processSingleItem(itemId, config);
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
    handleGenerateSingle,
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

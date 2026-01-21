
import { useCallback, useRef, useEffect } from 'react';
import { Project } from '../types';
import { useBatch } from '../context/BatchContext';

export const useThumbnailQueue = (project: Project, onUpdate: (updated: Project) => void) => {
  const { state: batchState, addToQueue } = useBatch();
  
  const projectRef = useRef(project);
  useEffect(() => {
    projectRef.current = project;
  }, [project]);

  const handleGenerateSingle = async (itemId: string, config: { mode: 'auto' | 'manual', prompt: string, style: string, variations: number }) => {
    // Adiciona a tarefa de thumbnail à fila global
    addToQueue(projectRef.current, [itemId], 'thumbnail', config);
    console.log(`[THUMB-QUEUE] Item ${itemId} enviado para a fila global de imagens.`);
  };

  const isProcessing = batchState.isProcessing && batchState.tasks.some(t => t.projectId === project.id && t.type === 'thumbnail');

  const items = project.items || [];
  return {
    isProcessing,
    handleGenerateSingle,
    stats: {
      total: items.length,
      completed: items.filter(i => i.thumbnails && i.thumbnails.length > 0).length,
      pending: items.filter(i => i.thumbStatus === 'pending').length,
      failed: items.filter(i => i.thumbStatus === 'failed').length,
      generating: items.filter(i => i.thumbStatus === 'generating').length,
    }
  };
};

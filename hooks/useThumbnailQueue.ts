
import { useCallback, useRef, useEffect } from 'react';
import { Project, ScriptItem } from '../types';
import { useBatch } from '../context/BatchContext';

export const useThumbnailQueue = (project: Project, onUpdate: (updated: Project) => void) => {
  const { state: batchState, addToQueue } = useBatch();
  
  const projectRef = useRef(project);
  useEffect(() => {
    projectRef.current = project;
  }, [project]);

  const handleGenerateSingle = async (itemId: string, config: { mode: 'auto' | 'manual', prompt: string, style: string, variations: number }) => {
    
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

    // Adiciona a tarefa de thumbnail à fila global com o callback de sucesso
    addToQueue(projectRef.current, [itemId], 'thumbnail', config, handleThumbSuccess);
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


import React, { createContext, useContext, useState, useCallback, useEffect, useRef } from 'react';
import { BatchTask, BatchType, BatchState, Project } from '../types';
import { generateScript, generateThumbnail, generateScenePrompt } from '../services/geminiService';
import { uploadThumbnail } from '../services/storageService';
import { supabase } from '../lib/supabase';
import { useAuth } from './AuthContext';

interface ExtendedBatchTask extends BatchTask {
  onSuccess?: (data: any) => void;
}

interface BatchContextType {
  state: BatchState;
  addToQueue: (project: Project, itemIds: string[], type: BatchType, config?: any, onSuccess?: (itemId: string, data: any) => void) => void;
  clearQueue: () => void;
  cancelQueue: () => void;
  stopProcessing: () => void;
  getTaskStatus: (itemId: string, type: BatchType) => BatchTask | undefined;
}

const BatchContext = createContext<BatchContextType | undefined>(undefined);

export const BatchProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, profile, refreshProfile } = useAuth();
  const [state, setState] = useState<BatchState & { tasks: ExtendedBatchTask[] }>({
    tasks: [],
    isProcessing: false,
    currentTaskId: null,
    stats: { total: 0, completed: 0, failed: 0, cancelled: 0, percent: 0 }
  });

  const isProcessingRef = useRef(false);
  const currentTaskIdRef = useRef<string | null>(null);

  useEffect(() => {
    const total = state.tasks.length;
    if (total === 0) {
      setState(prev => ({ ...prev, stats: { total: 0, completed: 0, failed: 0, cancelled: 0, percent: 0 } }));
      return;
    }
    const completed = state.tasks.filter(t => t.status === 'completed').length;
    const failed = state.tasks.filter(t => t.status === 'failed').length;
    const cancelled = state.tasks.filter(t => t.status === 'cancelled').length;
    const percent = Math.round(((completed + failed + cancelled) / total) * 100);
    
    setState(prev => ({ 
      ...prev, 
      stats: { total, completed, failed, cancelled, percent } 
    }));
  }, [state.tasks]);

  const processTask = async (task: ExtendedBatchTask, project: any): Promise<{ status: 'completed' | 'failed' | 'cancelled', data?: any, error?: string }> => {
    if (!user || !profile) return { status: 'failed', error: 'Usuário não autenticado' };
    
    // Verifica se a tarefa foi cancelada logo antes de começar
    if (!isProcessingRef.current || task.status === 'cancelled') return { status: 'cancelled' };

    try {
      if (task.type === 'script') {
        await supabase.from('script_items').update({ status: 'generating' }).eq('id', task.itemId);
        const minutesPerCredit = profile.minutes_per_credit || 30;
        const duration = project.global_duration || 12;
        const creditsToDeduct = Math.ceil(duration / minutesPerCredit);

        if ((profile.text_credits ?? 0) < creditsToDeduct) throw new Error("Saldo de créditos insuficiente.");

        const script = await generateScript(
          task.config?.title || "Sem Título",
          project.niche,
          duration,
          project.script_mode,
          project.global_tone,
          project.global_retention,
          project.winner_template,
          project.base_theme
        );

        // Verifica cancelamento após a chamada longa da IA
        if (!isProcessingRef.current) return { status: 'cancelled' };

        const { data: success } = await supabase.rpc('deduct_text_credits', { user_id: user.id, amount: creditsToDeduct });
        if (!success) throw new Error("Erro no pagamento de créditos.");

        await supabase.from('script_items').update({ script, status: 'completed' }).eq('id', task.itemId);
        
        return { status: 'completed', data: script };
      }

      if (task.type === 'thumbnail') {
        await supabase.from('script_items').update({ thumb_status: 'generating' }).eq('id', task.itemId);
        
        const variations = task.config?.variations || 1;
        if ((profile.image_credits ?? 0) < variations) throw new Error("Saldo de imagens insuficiente.");

        const { data: item } = await supabase.from('script_items').select('*').eq('id', task.itemId).single();
        
        let finalPrompt = task.config?.prompt || item?.title;
        if (task.config?.mode === 'auto') {
          finalPrompt = await generateScenePrompt(item?.title || "", item?.script || "", task.config?.style || 'realistic');
        }

        const finalVisualTitle = task.config?.titleOnArt || item?.title;

        const publicUrls: string[] = [];
        for (let i = 0; i < variations; i++) {
          // Check cancellation mid-variations loop
          if (!isProcessingRef.current) break;

          const base64 = await generateThumbnail(finalPrompt, task.config?.style || 'realistic', finalVisualTitle);
          if (base64) {
            const url = await uploadThumbnail(user.id, task.itemId, base64);
            publicUrls.push(url);
          }
        }

        if (publicUrls.length === 0 && !isProcessingRef.current) return { status: 'cancelled' };

        const { data: successImg } = await supabase.rpc('deduct_image_credits', { user_id: user.id, amount: publicUrls.length });
        if (!successImg) throw new Error("Erro no pagamento de imagens.");

        const existingThumbs = item?.thumbnails || [];
        const combinedThumbs = [...publicUrls, ...existingThumbs];

        await supabase.from('script_items').update({ 
          thumbnails: combinedThumbs,
          thumb_status: 'completed',
          thumb_prompt: finalPrompt
        }).eq('id', task.itemId);

        return { status: 'completed', data: combinedThumbs };
      }

      return { status: 'completed' };
    } catch (error: any) {
      const field = task.type === 'script' ? 'status' : 'thumb_status';
      await supabase.from('script_items').update({ [field]: 'failed', error: error.message }).eq('id', task.itemId);
      return { status: 'failed', error: error.message };
    }
  };

  useEffect(() => {
    const runQueue = async () => {
      if (isProcessingRef.current || state.tasks.length === 0) return;
      
      const nextTaskIndex = state.tasks.findIndex(t => t.status === 'pending');
      if (nextTaskIndex === -1) {
        if (state.isProcessing) {
          setState(prev => ({ ...prev, isProcessing: false, currentTaskId: null }));
          isProcessingRef.current = false;
        }
        return;
      }

      const nextTask = state.tasks[nextTaskIndex];

      isProcessingRef.current = true;
      currentTaskIdRef.current = nextTask.id;
      
      setState(prev => ({ 
        ...prev, 
        isProcessing: true, 
        currentTaskId: nextTask.id,
        tasks: prev.tasks.map(t => t.id === nextTask.id ? { ...t, status: 'processing' } : t)
      }));

      const { data: projectData } = await supabase.from('projects').select('*').eq('id', nextTask.projectId).single();
      const result = await processTask(nextTask, projectData);

      if (result.status === 'completed' && nextTask.onSuccess) {
        nextTask.onSuccess(result.data);
      }

      await refreshProfile();
      
      setState(prev => ({
        ...prev,
        tasks: prev.tasks.map(t => t.id === nextTask.id ? { ...t, status: result.status, error: result.error } : t),
        isProcessing: false,
        currentTaskId: null
      }));
      
      isProcessingRef.current = false;
      currentTaskIdRef.current = null;
    };
    
    runQueue();
  }, [state.tasks, user, profile]);

  const addToQueue = useCallback((project: Project, itemIds: string[], type: BatchType, config?: any, onSuccess?: (itemId: string, data: any) => void) => {
    const newTasks: ExtendedBatchTask[] = itemIds.map(itemId => {
      const item = project.items.find(i => i.id === itemId);
      return {
        id: `${type}-${itemId}-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
        itemId,
        projectId: project.id,
        type,
        status: 'pending',
        config: { ...config, title: item?.title },
        onSuccess: onSuccess ? (data) => onSuccess(itemId, data) : undefined
      };
    });
    setState(prev => ({ ...prev, tasks: [...prev.tasks, ...newTasks] }));
  }, []);

  const clearQueue = useCallback(() => {
    setState(prev => ({ ...prev, tasks: [], isProcessing: false, currentTaskId: null, stats: { total: 0, completed: 0, failed: 0, cancelled: 0, percent: 0 } }));
  }, []);

  const cancelQueue = useCallback(async () => {
    const activeTaskId = currentTaskIdRef.current;
    isProcessingRef.current = false;
    
    // Identifica qual item estava sendo processado para resetar no DB
    const activeTask = state.tasks.find(t => t.id === activeTaskId);
    
    setState(prev => ({
      ...prev,
      isProcessing: false,
      currentTaskId: null,
      tasks: prev.tasks.map(t => 
        (t.status === 'pending' || t.id === activeTaskId) ? { ...t, status: 'cancelled' } : t
      )
    }));

    // Se houver uma tarefa ativa sendo interrompida, reseta o status dela no Supabase
    if (activeTask) {
      const field = activeTask.type === 'script' ? 'status' : 'thumb_status';
      await supabase.from('script_items').update({ [field]: 'pending' }).eq('id', activeTask.itemId);
    }
  }, [state.tasks]);

  const stopProcessing = useCallback(() => {
    isProcessingRef.current = false;
    setState(prev => ({ ...prev, isProcessing: false, currentTaskId: null }));
  }, []);

  const getTaskStatus = useCallback((itemId: string, type: BatchType) => {
    return state.tasks.find(t => t.itemId === itemId && t.type === type);
  }, [state.tasks]);

  return (
    <BatchContext.Provider value={{ state, addToQueue, clearQueue, cancelQueue, stopProcessing, getTaskStatus }}>
      {children}
    </BatchContext.Provider>
  );
};

export const useBatch = () => {
  const context = useContext(BatchContext);
  if (context === undefined) throw new Error('useBatch deve ser usado dentro de um BatchProvider');
  return context;
};

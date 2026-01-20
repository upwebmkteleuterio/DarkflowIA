import { useState, useCallback, useRef, useEffect } from 'react';
import { Project, ScriptItem } from '../types';
import { generateScript } from '../services/geminiService';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';

export const useScriptQueue = (project: Project, onUpdate: (updated: Project) => void) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const { user, profile, refreshProfile } = useAuth();
  
  const projectRef = useRef(project);
  useEffect(() => { projectRef.current = project; }, [project]);

  const updateItemStatus = useCallback((itemId: string, updates: Partial<ScriptItem>) => {
    const currentItems = projectRef.current.items || [];
    const updatedItems = currentItems.map(item => 
      item.id === itemId ? { ...item, ...updates } : item
    );
    onUpdate({ ...projectRef.current, items: updatedItems });
  }, [onUpdate]);

  const processItem = async (itemId: string) => {
    const item = projectRef.current.items.find(i => i.id === itemId);
    if (!item || !user) return;

    console.log(`[SCRIPT-QUEUE] Processando: ${item.title}`);

    const minutesPerCredit = (profile as any)?.minutes_per_credit || 30;
    const duration = projectRef.current.globalDuration;
    const creditsToDeduct = Math.ceil(duration / minutesPerCredit);

    if ((profile?.text_credits ?? 0) < creditsToDeduct) {
      alert("Saldo insuficiente para gerar roteiro.");
      return;
    }

    updateItemStatus(itemId, { status: 'generating' });

    try {
      const script = await generateScript(
        item.title,
        projectRef.current.niche,
        duration,
        projectRef.current.scriptMode,
        projectRef.current.globalTone,
        projectRef.current.globalRetention,
        projectRef.current.winnerTemplate,
        projectRef.current.baseTheme
      );

      console.log(`[SCRIPT-QUEUE] Roteiro gerado para ${item.id}. Deduzindo ${creditsToDeduct} créditos.`);

      const { data: success, error: rpcError } = await supabase.rpc('deduct_text_credits', {
        user_id: user.id,
        amount: creditsToDeduct
      });

      if (rpcError || !success) throw new Error("Falha no pagamento de créditos.");

      await supabase.from('script_items').update({ script, status: 'completed' }).eq('id', itemId);

      updateItemStatus(itemId, { status: 'completed', script });
      await refreshProfile();
      console.log(`[SCRIPT-QUEUE] Concluído com sucesso: ${item.id}`);

    } catch (error: any) {
      console.error(`[SCRIPT-QUEUE] FALHA em ${item.id}:`, error);
      updateItemStatus(itemId, { status: 'failed', error: error.message });
    }
  };

  const handleStartBatch = async () => {
    if (isProcessing) return;
    const pending = projectRef.current.items.filter(i => i.status === 'pending');
    if (pending.length === 0) return;

    setIsProcessing(true);
    console.log(`[SCRIPT-QUEUE] Iniciando lote de ${pending.length} itens.`);
    for (const item of pending) {
      await processItem(item.id);
      await new Promise(r => setTimeout(r, 1000));
    }
    setIsProcessing(false);
  };

  return {
    isProcessing,
    handleStartBatch,
    handleRetry: processItem,
    stats: {
      total: project.items.length,
      completed: project.items.filter(i => i.status === 'completed').length,
      pending: project.items.filter(i => i.status === 'pending').length,
    }
  };
};
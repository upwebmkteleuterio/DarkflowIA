
import { useState, useCallback, useRef, useEffect } from 'react';
import { Project, ScriptItem } from '../types';
import { generateScript } from '../services/geminiService';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';

export const useScriptQueue = (project: Project, onUpdate: (updated: Project) => void) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [selectedItem, setSelectedItem] = useState<ScriptItem | null>(null);
  const { user, profile, refreshProfile } = useAuth();
  
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
    
    if (!pendingItem || !user) {
      setIsProcessing(false);
      return;
    }

    // Cálculo de custo baseado no plano do perfil
    const minutesPerCredit = (profile as any)?.minutes_per_credit || 30;
    const duration = projectRef.current.globalDuration;
    const creditsToDeduct = Math.ceil(duration / minutesPerCredit);

    // Verificação preventiva de saldo antes de chamar a IA
    if ((profile?.text_credits ?? 0) < creditsToDeduct) {
      alert("Saldo de créditos de texto insuficiente.");
      setIsProcessing(false);
      return;
    }

    updateItemStatus(pendingItem.id, { status: 'generating', error: undefined });

    try {
      // 1. CHAMA A IA
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

      if (!script) throw new Error("A IA retornou um roteiro vazio.");

      // 2. TENTA DEDUZIR CRÉDITOS VIA RPC (SEGURANÇA ATÔMICA)
      const { data: success, error: rpcError } = await supabase.rpc('deduct_text_credits', {
        user_id: user.id,
        amount: creditsToDeduct
      });

      if (rpcError || !success) {
        throw new Error("Falha ao processar pagamento de créditos. Operação cancelada.");
      }

      // 3. SALVA O RESULTADO
      updateItemStatus(pendingItem.id, { 
        status: 'completed', 
        script: script || '' 
      });

      // Atualiza saldo na UI
      await refreshProfile();

    } catch (error: any) {
      console.error("[QUEUE] Erro ao processar item:", error);
      updateItemStatus(pendingItem.id, { 
        status: 'failed', 
        error: error.message || 'Erro na produção' 
      });
    } finally {
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

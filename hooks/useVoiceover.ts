
import { useState, useCallback, useRef } from 'react';
import { Project, ScriptItem } from '../types';
import { generateSpeech } from '../services/geminiService';
import { supabase } from '../lib/supabase';

export const useVoiceover = (project: Project, onUpdate: (updated: Project) => void) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const projectRef = useRef(project);
  projectRef.current = project;

  const updateItemStatus = useCallback((itemId: string, updates: Partial<ScriptItem>) => {
    const updatedItems = projectRef.current.items.map(item => 
      item.id === itemId ? { ...item, ...updates } : item
    );
    onUpdate({ ...projectRef.current, items: updatedItems });
  }, [onUpdate]);

  const handleGenerateVoice = async (itemId: string, voiceName: string) => {
    const item = projectRef.current.items.find(i => i.id === itemId);
    if (!item || !item.script) return;

    updateItemStatus(itemId, { voiceStatus: 'generating', voiceName });
    
    try {
      // 1. Gera o Áudio via Gemini TTS (Retorna URL de Blob local)
      const audioUrl = await generateSpeech(item.script, voiceName);
      
      // 2. Atualiza no Banco de Dados
      const { error } = await supabase
        .from('script_items')
        .update({
          voice_status: 'completed',
          voice_name: voiceName,
          audio_url: audioUrl // Nota: Para produção real, deveríamos fazer upload para o Storage aqui também
        })
        .eq('id', itemId);

      if (error) throw error;

      updateItemStatus(itemId, { voiceStatus: 'completed', audioUrl });
    } catch (error) {
      console.error("Erro no TTS:", error);
      updateItemStatus(itemId, { voiceStatus: 'failed' });
    }
  };

  const handleGenerateBatch = async (voiceName: string) => {
    const pending = projectRef.current.items.filter(i => i.status === 'completed' && i.voiceStatus !== 'completed');
    if (pending.length === 0 || isProcessing) return;

    setIsProcessing(true);
    for (const item of pending) {
      await handleGenerateVoice(item.id, voiceName);
      // Pequeno delay para evitar overload
      await new Promise(r => setTimeout(r, 800));
    }
    setIsProcessing(false);
  };

  const items = project.items || [];
  return {
    isProcessing,
    handleGenerateVoice,
    handleGenerateBatch,
    stats: {
      total: items.length,
      ready: items.filter(i => i.status === 'completed').length,
      voiced: items.filter(i => i.voiceStatus === 'completed').length,
      pending: items.filter(i => i.status === 'completed' && i.voiceStatus !== 'completed').length,
    }
  };
};

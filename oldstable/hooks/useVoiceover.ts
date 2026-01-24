
import { useState, useCallback, useRef } from 'react';
import { Project, ScriptItem } from '../types';
import { generateSpeech } from '../services/geminiService';
import { uploadAudio } from '../services/storageService';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';

export const useVoiceover = (project: Project, onUpdate: (updated: Project) => void) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const { user } = useAuth();
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
    if (!item || !item.script || !user) return;

    updateItemStatus(itemId, { voiceStatus: 'generating', voiceName });
    
    try {
      // 1. Gera o Áudio via Gemini TTS (Retorna URL de Blob local)
      const blobUrl = await generateSpeech(item.script, voiceName);
      
      // Converte Blob URL de volta para Blob real para upload
      const response = await fetch(blobUrl);
      const audioBlob = await response.blob();

      // 2. Faz upload para o Storage permanente
      const publicAudioUrl = await uploadAudio(user.id, itemId, audioBlob);
      
      // 3. Atualiza no Banco de Dados
      const { error } = await supabase
        .from('script_items')
        .update({
          voice_status: 'completed',
          voice_name: voiceName,
          audio_url: publicAudioUrl
        })
        .eq('id', itemId);

      if (error) throw error;

      updateItemStatus(itemId, { 
        voiceStatus: 'completed', 
        audioUrl: publicAudioUrl 
      });

    } catch (error) {
      console.error("Erro no TTS / Banco:", error);
      updateItemStatus(itemId, { voiceStatus: 'failed' });
    }
  };

  const handleGenerateBatch = async (voiceName: string) => {
    const pending = projectRef.current.items.filter(i => i.status === 'completed' && i.voiceStatus !== 'completed');
    if (pending.length === 0 || isProcessing) return;

    setIsProcessing(true);
    for (const item of pending) {
      await handleGenerateVoice(item.id, voiceName);
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

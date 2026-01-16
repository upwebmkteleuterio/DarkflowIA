
import { useState, useCallback, useRef } from 'react';
import { Project, ScriptItem } from '../types';
import { generateSpeech } from '../services/geminiService';

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
      const audioUrl = await generateSpeech(item.script, voiceName);
      updateItemStatus(itemId, { voiceStatus: 'completed', audioUrl });
    } catch (error) {
      console.error("Erro no TTS:", error);
      updateItemStatus(itemId, { voiceStatus: 'failed' });
    }
  };

  const handleGenerateBatch = async (voiceName: string) => {
    const pending = projectRef.current.items.filter(i => i.status === 'completed' && !i.audioUrl);
    if (pending.length === 0 || isProcessing) return;

    setIsProcessing(true);
    for (const item of pending) {
      await handleGenerateVoice(item.id, voiceName);
      // Delay para evitar limites de cota
      await new Promise(r => setTimeout(r, 1000));
    }
    setIsProcessing(false);
  };

  return {
    isProcessing,
    handleGenerateVoice,
    handleGenerateBatch
  };
};

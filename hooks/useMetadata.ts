
import { useState, useCallback, useRef } from 'react';
import { generateMetadata } from '../services/geminiService';
import { Project, ScriptItem } from '../types';

export const useMetadata = (project: Project, onUpdate: (updated: Project) => void) => {
  const [loading, setLoading] = useState(false);
  const [batchLoading, setBatchLoading] = useState(false);
  const [copyingDesc, setCopyingDesc] = useState<string | null>(null);
  const [copyingChap, setCopyingChap] = useState<string | null>(null);
  const [selectedItemId, setSelectedItemId] = useState(project.items[0]?.id || '');

  const projectRef = useRef(project);
  projectRef.current = project;

  const updateItemMetadata = useCallback((itemId: string, description: string, chapters: string) => {
    const updatedItems = projectRef.current.items.map(item => 
      item.id === itemId ? { ...item, description, chapters } : item
    );
    onUpdate({ ...projectRef.current, items: updatedItems });
  }, [onUpdate]);

  const handleGenerateSingle = async (itemId: string) => {
    const item = projectRef.current.items.find(i => i.id === itemId);
    if (!item || !item.script) {
      alert("Roteiro não encontrado para este item.");
      return;
    }

    setLoading(true);
    try {
      const data = await generateMetadata(item.title, item.script);
      updateItemMetadata(itemId, data.description, data.chapters);
    } catch (error) {
      console.error("Erro ao gerar metadados:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateBatch = async () => {
    const pendingItems = projectRef.current.items.filter(i => i.script && (!i.description || !i.chapters));
    if (pendingItems.length === 0) {
      alert("Todos os vídeos com roteiro já possuem metadados.");
      return;
    }

    setBatchLoading(true);
    
    // Processamos em série para não sobrecarregar
    for (const item of pendingItems) {
      try {
        const data = await generateMetadata(item.topic || item.title, item.script);
        updateItemMetadata(item.id, data.description, data.chapters);
      } catch (err) {
        console.error(`Erro no item ${item.title}:`, err);
      }
    }

    setBatchLoading(false);
  };

  const copyToClipboard = useCallback((text: string, type: 'desc' | 'chap', itemId: string) => {
    if (!text) return;
    navigator.clipboard.writeText(text).then(() => {
      if (type === 'desc') {
        setCopyingDesc(itemId);
        setTimeout(() => setCopyingDesc(null), 2000);
      } else {
        setCopyingChap(itemId);
        setTimeout(() => setCopyingChap(null), 2000);
      }
    });
  }, []);

  return {
    loading,
    batchLoading,
    copyingDesc,
    copyingChap,
    selectedItemId,
    setSelectedItemId,
    handleGenerateSingle,
    handleGenerateBatch,
    copyToClipboard
  };
};

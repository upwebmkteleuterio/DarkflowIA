
import { useState, useCallback, useRef } from 'react';
import { generateMetadata } from '../services/geminiService';
import { Project, ScriptItem } from '../types';
import { supabase } from '../lib/supabase';

export const useMetadata = (project: Project, onUpdate: (updated: Project) => void) => {
  const [loading, setLoading] = useState(false);
  const [batchLoading, setBatchLoading] = useState(false);
  const [copyingDesc, setCopyingDesc] = useState<string | null>(null);
  const [copyingChap, setCopyingChap] = useState<string | null>(null);
  const [copyingTags, setCopyingTags] = useState<string | null>(null);
  const [selectedItemId, setSelectedItemId] = useState(project.items[0]?.id || '');

  const projectRef = useRef(project);
  projectRef.current = project;

  const updateItemMetadata = useCallback(async (itemId: string, description: string, chapters: string, tags: string) => {
    // Atualiza estado local
    const updatedItems = projectRef.current.items.map(item => 
      item.id === itemId ? { ...item, description, chapters, tags } : item
    );
    onUpdate({ ...projectRef.current, items: updatedItems });

    // Persiste no banco de dados
    await supabase
      .from('script_items')
      .update({ description, chapters, tags })
      .eq('id', itemId);
  }, [onUpdate]);

  const handleGenerateSingle = async (itemId: string) => {
    const item = projectRef.current.items.find(i => i.id === itemId);
    if (!item || !item.script) return;

    setLoading(true);
    try {
      const data = await generateMetadata(item.title, item.script);
      await updateItemMetadata(itemId, data.description, data.chapters, data.tags);
    } catch (error) {
      console.error("Erro ao gerar metadados:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateBatch = async () => {
    const pendingItems = projectRef.current.items.filter(i => i.script && (!i.description || !i.tags));
    if (pendingItems.length === 0) return;

    setBatchLoading(true);
    for (const item of pendingItems) {
      try {
        const data = await generateMetadata(item.title, item.script);
        await updateItemMetadata(item.id, data.description, data.chapters, data.tags);
      } catch (err) {
        console.error(`Erro no item ${item.title}:`, err);
      }
    }
    setBatchLoading(false);
  };

  const copyToClipboard = useCallback((text: string, type: 'desc' | 'chap' | 'tags', itemId: string) => {
    if (!text) return;
    navigator.clipboard.writeText(text).then(() => {
      if (type === 'desc') setCopyingDesc(itemId);
      else if (type === 'chap') setCopyingChap(itemId);
      else setCopyingTags(itemId);
      
      setTimeout(() => {
        setCopyingDesc(null);
        setCopyingChap(null);
        setCopyingTags(null);
      }, 2000);
    });
  }, []);

  return {
    loading,
    batchLoading,
    copyingDesc,
    copyingChap,
    copyingTags,
    selectedItemId,
    setSelectedItemId,
    handleGenerateSingle,
    handleGenerateBatch,
    copyToClipboard
  };
};

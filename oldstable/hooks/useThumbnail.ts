
import React, { useState, useCallback, useEffect } from 'react';
import { generateThumbnail, generateScenePrompt } from '../services/geminiService';
import { Project, ScriptItem } from '../types';

export const useThumbnail = (project: Project, onUpdate: (updated: Project) => void) => {
  const [loading, setLoading] = useState(false);
  const [promptLoading, setPromptLoading] = useState(false);
  const [fullscreenImage, setFullscreenImage] = useState<string | null>(null);
  const [referenceImage, setReferenceImage] = useState<string | null>(null);
  
  // Controle de qual item da fila estamos editando a thumb
  const [selectedItemId, setSelectedItemId] = useState<string>(project.items[0]?.id || '');
  
  const selectedItem = project.items.find(i => i.id === selectedItemId) || project.items[0];

  const [config, setConfig] = useState({
    prompt: '',
    style: 'realistic',
    variations: 1,
    thumbTitle: selectedItem?.title || ''
  });

  // Sincronizar título quando mudar o item selecionado
  useEffect(() => {
    if (selectedItem) {
      setConfig(prev => ({ ...prev, thumbTitle: selectedItem.title }));
    }
  }, [selectedItemId]);

  const updateConfig = useCallback((field: string, value: any) => {
    setConfig(prev => ({ ...prev, [field]: value }));
  }, []);

  const handleAIPrompt = async () => {
    if (!selectedItem) return;
    setPromptLoading(true);
    try {
      const generated = await generateScenePrompt(selectedItem.title, selectedItem.script || "", config.style);
      if (generated) {
        updateConfig('prompt', generated);
      }
    } catch (error) {
      console.error("Erro ao gerar prompt por IA:", error);
    } finally {
      setPromptLoading(false);
    }
  };

  const handleReferenceUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setReferenceImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleGenerate = async () => {
    if (!config.prompt || !selectedItemId) return;
    setLoading(true);
    try {
      const newThumbs = [];
      for (let i = 0; i < config.variations; i++) {
        const imgUrl = await generateThumbnail(config.prompt, config.style, config.thumbTitle, referenceImage || undefined);
        if (imgUrl) newThumbs.push(imgUrl);
      }
      
      const updatedItems = project.items.map(item => 
        item.id === selectedItemId 
          ? { ...item, thumbnails: [...newThumbs, ...item.thumbnails] }
          : item
      );

      onUpdate({
        ...project,
        items: updatedItems
      });
    } catch (error) {
      console.error("Erro ao gerar thumbnails:", error);
    } finally {
      setLoading(false);
    }
  };

  const clearHistory = useCallback(() => {
    if (!selectedItemId) return;
    if (confirm("Limpar galeria deste vídeo específico?")) {
      const updatedItems = project.items.map(item => 
        item.id === selectedItemId ? { ...item, thumbnails: [] } : item
      );
      onUpdate({ ...project, items: updatedItems });
    }
  }, [project, selectedItemId, onUpdate]);

  const downloadImage = useCallback((url: string) => {
    const link = document.createElement('a');
    link.href = url;
    link.download = `thumb-${selectedItemId}-${Date.now()}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }, [selectedItemId]);

  return {
    loading,
    promptLoading,
    fullscreenImage,
    referenceImage,
    selectedItemId,
    setSelectedItemId,
    selectedItem,
    setFullscreenImage,
    setReferenceImage,
    config,
    updateConfig,
    handleGenerate,
    handleAIPrompt,
    handleReferenceUpload,
    clearHistory,
    downloadImage
  };
};

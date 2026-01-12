
import React, { useState, useCallback, useEffect } from 'react';
import { generateThumbnail, generateScenePrompt } from '../services/geminiService';
import { Project } from '../types';

export const useThumbnail = (project: Project, onUpdate: (updated: Project) => void) => {
  const [loading, setLoading] = useState(false);
  const [promptLoading, setPromptLoading] = useState(false);
  const [fullscreenImage, setFullscreenImage] = useState<string | null>(null);
  const [referenceImage, setReferenceImage] = useState<string | null>(null);
  const [config, setConfig] = useState({
    prompt: '',
    style: 'realistic',
    variations: 1,
    thumbTitle: project.name || ''
  });

  useEffect(() => {
    if (!config.thumbTitle && project.name) {
      setConfig(prev => ({ ...prev, thumbTitle: project.name }));
    }
  }, [project.name]);

  const updateConfig = useCallback((field: string, value: any) => {
    setConfig(prev => ({ ...prev, [field]: value }));
  }, []);

  const handleAIPrompt = async () => {
    setPromptLoading(true);
    try {
      const generated = await generateScenePrompt(project.name, project.script || "", config.style);
      if (generated) {
        updateConfig('prompt', generated);
      }
    } catch (error) {
      console.error("Erro ao gerar prompt por IA:", error);
    } finally {
      setPromptLoading(false);
    }
  };

  // Fixed: Added React to the import statement above to resolve the namespace error
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
    if (!config.prompt) return;
    setLoading(true);
    try {
      const newThumbs = [];
      for (let i = 0; i < config.variations; i++) {
        const imgUrl = await generateThumbnail(config.prompt, config.style, config.thumbTitle, referenceImage || undefined);
        if (imgUrl) newThumbs.push(imgUrl);
      }
      
      onUpdate({
        ...project,
        thumbnails: [...newThumbs, ...project.thumbnails]
      });
    } catch (error) {
      console.error("Erro ao gerar thumbnails:", error);
    } finally {
      setLoading(false);
    }
  };

  const clearHistory = useCallback(() => {
    if (confirm("Tem certeza que deseja limpar toda a galeria deste projeto?")) {
      onUpdate({ ...project, thumbnails: [] });
    }
  }, [project, onUpdate]);

  const downloadImage = useCallback((url: string) => {
    const link = document.createElement('a');
    link.href = url;
    link.download = `thumbnail-${Date.now()}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }, []);

  return {
    loading,
    promptLoading,
    fullscreenImage,
    referenceImage,
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

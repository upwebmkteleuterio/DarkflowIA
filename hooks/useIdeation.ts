
import { useState, useCallback } from 'react';
import { generateTitles } from '../services/geminiService';
import { Project, TitleIdea } from '../types';

export const useIdeation = (project: Project, onUpdate: (updated: Project) => void) => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    niche: project.niche || 'Mistérios e Curiosidades',
    baseTheme: project.baseTheme || '',
    audience: project.targetAudience || 'Entusiastas de canais Dark',
    trigger: project.emotionalTrigger || 'curiosity',
    format: project.format || 'top10'
  });

  const updateField = useCallback((field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  }, []);

  const handleGenerate = async () => {
    if (!formData.baseTheme.trim()) {
      alert("Por favor, descreva do que o seu vídeo irá falar.");
      return;
    }

    setLoading(true);
    try {
      const titles = await generateTitles(
        formData.niche, 
        formData.audience, 
        formData.trigger, 
        formData.format,
        formData.baseTheme
      );
      
      const updatedTitles: TitleIdea[] = titles.map((t: any, i: number) => ({ 
        ...t, 
        id: Date.now().toString() + i 
      }));

      onUpdate({
        ...project,
        ...formData,
        titles: updatedTitles
      });
    } catch (error) {
      console.error("Erro ao gerar títulos:", error);
    } finally {
      setLoading(false);
    }
  };

  const selectTitle = useCallback((title: string, onNext: () => void) => {
    onUpdate({ ...project, name: title });
    onNext();
  }, [project, onUpdate]);

  return {
    loading,
    formData,
    updateField,
    handleGenerate,
    selectTitle
  };
};


import { useState, useCallback } from 'react';
import { Project, ScriptItem } from '../types';

export const useIdeation = (project: Project, onUpdate: (updated: Project) => void) => {
  const [loading, setLoading] = useState(false);
  const [titlesInput, setTitlesInput] = useState(project.items.map(item => item.title).join('\n'));
  const [formData, setFormData] = useState({
    niche: project.niche || '',
    baseTheme: project.baseTheme || '',
    audience: project.targetAudience || '',
  });

  const updateField = useCallback((field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  }, []);

  const handleProcessBatch = async (onNext: () => void) => {
    if (!formData.niche || !formData.baseTheme || !titlesInput.trim()) {
      alert("Por favor, preencha o nicho, o tema e cole ao menos um título.");
      return;
    }

    setLoading(true);
    
    // Transformar a string de títulos em array de ScriptItem
    const titlesArray = titlesInput
      .split('\n')
      .map(t => t.trim())
      .filter(t => t.length > 0);

    const newItems: ScriptItem[] = titlesArray.map((title, index) => {
      // Tentar manter o script se o título for idêntico ao que já existia
      const existing = project.items.find(item => item.title === title);
      
      return existing || {
        id: `item-${Date.now()}-${index}`,
        title,
        script: '',
        status: 'pending',
        thumbnails: []
      };
    });

    onUpdate({
      ...project,
      ...formData,
      items: newItems,
      // Nome do projeto será o primeiro título se estiver vazio
      name: project.name === 'Novo Projeto de Vídeo' ? (newItems[0]?.title || project.name) : project.name
    });

    setLoading(false);
    onNext();
  };

  return {
    loading,
    formData,
    titlesInput,
    setTitlesInput,
    updateField,
    handleProcessBatch
  };
};

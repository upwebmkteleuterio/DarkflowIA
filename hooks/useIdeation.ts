
import { useState, useCallback, useRef, useEffect } from 'react';
import { Project, ScriptItem } from '../types';
import { supabase } from '../lib/supabase';

export const useIdeation = (project: Project, onUpdate: (updated: Project) => void) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSaved, setIsSaved] = useState(false);
  
  // Fix: Garantindo que project.items exista antes de tentar mapear e juntar
  const [titlesInput, setTitlesInput] = useState(() => {
    return (project.items || []).map(item => item.title).join('\n') || '';
  });

  const [formData, setFormData] = useState({
    niche: project.niche || '',
    baseTheme: project.baseTheme || '',
    audience: project.targetAudience || '',
  });

  const saveTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    setFormData({
      niche: project.niche || '',
      baseTheme: project.baseTheme || '',
      audience: project.targetAudience || '',
    });
    setTitlesInput((project.items || []).map(item => item.title).join('\n') || '');
  }, [project.id]);

  const persistProjectData = useCallback(async (updatedFields: any) => {
    if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
    setIsSaved(false);
    
    saveTimeoutRef.current = setTimeout(async () => {
      console.log("[IDEATION] Persistindo dados no banco...", updatedFields);
      const { error: dbError } = await supabase
        .from('projects')
        .update({
          niche: updatedFields.niche,
          base_theme: updatedFields.baseTheme,
          target_audience: updatedFields.audience
        })
        .eq('id', project.id);

      if (dbError) {
        console.error("[IDEATION] Falha ao persistir:", dbError.message);
        setError("Erro ao salvar automaticamente: " + dbError.message);
      } else {
        console.log("[IDEATION] Dados persistidos com sucesso.");
        setIsSaved(true);
        setTimeout(() => setIsSaved(false), 2000);
      }
    }, 800);
  }, [project.id]);

  const updateField = useCallback((field: string, value: string) => {
    setError(null);
    const newFormData = { ...formData, [field]: value };
    setFormData(newFormData);
    onUpdate({ ...project, ...newFormData });
    persistProjectData(newFormData);
  }, [formData, onUpdate, project, persistProjectData]);

  const handleProcessBatch = async (onNext: () => void) => {
    setError(null);
    
    if (!formData.niche?.trim() || !formData.baseTheme?.trim() || !titlesInput.trim()) {
      setError("Por favor, preencha todos os campos obrigatórios antes de avançar.");
      return;
    }

    setLoading(true);
    
    const titlesArray = titlesInput
      .split('\n')
      .map(t => t.trim())
      .filter(t => t.length > 0);

    const newItems: ScriptItem[] = titlesArray.map((title, index) => {
      const existing = (project.items || []).find(item => item.title === title);
      return existing || {
        id: `item-${Date.now()}-${index}`,
        title,
        script: '',
        status: 'pending',
        thumbnails: []
      };
    });

    const dbItems = newItems.map(item => ({
      id: item.id,
      project_id: project.id,
      title: item.title,
      script: item.script || "",
      status: item.status || "pending"
    }));

    const { error: dbError } = await supabase.from('script_items').upsert(dbItems);

    if (dbError) {
      setError(`Erro no banco: ${dbError.message}`);
      setLoading(false);
    } else {
      onUpdate({
        ...project,
        ...formData,
        items: newItems,
      });
      onNext();
    }
  };

  return {
    loading,
    error,
    isSaved,
    formData,
    titlesInput,
    setTitlesInput,
    updateField,
    handleProcessBatch
  };
};

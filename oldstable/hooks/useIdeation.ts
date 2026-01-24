
import { useState, useCallback, useRef, useEffect } from 'react';
import { Project, ScriptItem } from '../types';
import { supabase } from '../lib/supabase';

export const useIdeation = (project: Project, onUpdate: (updated: Project) => void) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSaved, setIsSaved] = useState(false);
  
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
    // Sincroniza o input de títulos quando o projeto mudar (ex: ao trocar de projeto)
    setTitlesInput((project.items || []).map(item => item.title).join('\n') || '');
  }, [project.id]);

  const persistProjectData = useCallback(async (updatedFields: any) => {
    if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
    setIsSaved(false);
    
    saveTimeoutRef.current = setTimeout(async () => {
      const { error: dbError } = await supabase
        .from('projects')
        .update({
          niche: updatedFields.niche,
          base_theme: updatedFields.baseTheme,
          target_audience: updatedFields.audience
        })
        .eq('id', project.id);

      if (dbError) {
        setError("Erro ao salvar automaticamente: " + dbError.message);
      } else {
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
    
    try {
      const titlesFromInput = titlesInput
        .split('\n')
        .map(t => t.trim())
        .filter(t => t.length > 0);

      const currentItems = project.items || [];
      
      // 1. Identificar itens para deletar (existem no projeto mas não no novo input)
      const itemsToDelete = currentItems.filter(item => !titlesFromInput.includes(item.title));
      
      if (itemsToDelete.length > 0) {
        const deleteIds = itemsToDelete.map(i => i.id);
        const { error: delError } = await supabase
          .from('script_items')
          .delete()
          .in('id', deleteIds);
          
        if (delError) throw new Error(`Erro ao remover itens antigos: ${delError.message}`);
        console.log(`[IDEATION] ${itemsToDelete.length} itens removidos por sincronia.`);
      }

      // 2. Mapear novos itens mantendo os existentes
      const syncedItems: ScriptItem[] = titlesFromInput.map((title, index) => {
        const existing = currentItems.find(item => item.title === title);
        
        if (existing) {
          return existing; // Mantém ID, roteiro, status e thumbnails
        }

        // Se for realmente novo, gera novo ID
        return {
          id: `item-${Date.now()}-${index}-${Math.random().toString(36).substr(2, 4)}`,
          title,
          script: '',
          status: 'pending',
          thumbnails: []
        };
      });

      // 3. Persistir apenas os itens novos ou atualizados no banco
      const dbItems = syncedItems.map(item => ({
        id: item.id,
        project_id: project.id,
        title: item.title,
        script: item.script || "",
        status: item.status || "pending",
        thumbnails: item.thumbnails || [],
        thumb_status: item.thumbStatus || "pending",
        description: item.description || "",
        chapters: item.chapters || "",
        tags: item.tags || ""
      }));

      const { error: dbError } = await supabase.from('script_items').upsert(dbItems);

      if (dbError) throw dbError;

      // 4. Atualizar estado local e navegar
      onUpdate({
        ...project,
        ...formData,
        items: syncedItems,
      });
      
      onNext();
    } catch (err: any) {
      setError(err.message || "Erro desconhecido ao processar lote.");
    } finally {
      setLoading(false);
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

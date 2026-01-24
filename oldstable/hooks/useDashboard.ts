
import { useState, useMemo, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { Project } from '../types';

export const useDashboard = (projects: Project[], onUpdateProjects: (projects: Project[]) => void) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filter, setFilter] = useState<'all' | 'scripted' | 'thumbnailed'>('all');

  const filteredProjects = useMemo(() => {
    return projects.filter(project => {
      const name = project.name || '';
      const matchesSearch = name.toLowerCase().includes(searchQuery.toLowerCase());
      
      if (filter === 'scripted') {
         const hasScript = project.items?.some(i => i.status === 'completed');
         return matchesSearch && hasScript;
      }
      if (filter === 'thumbnailed') {
         const hasThumb = project.items?.some(i => i.thumbnails && i.thumbnails.length > 0);
         return matchesSearch && hasThumb;
      }
      return matchesSearch;
    });
  }, [projects, searchQuery, filter]);

  const handleDeleteProject = useCallback(async (id: string) => {
    if (confirm("Deseja realmente excluir este projeto? Esta ação é irreversível.")) {
      const { error } = await supabase
        .from('projects')
        .delete()
        .eq('id', id);

      if (!error) {
        const updated = projects.filter(p => p.id !== id);
        onUpdateProjects(updated);
      } else {
        alert("Erro ao excluir projeto: " + error.message);
      }
    }
  }, [projects, onUpdateProjects]);

  return {
    searchQuery,
    setSearchQuery,
    filter,
    setFilter,
    filteredProjects,
    handleDeleteProject
  };
};

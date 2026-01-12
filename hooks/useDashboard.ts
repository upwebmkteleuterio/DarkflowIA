
import { useState, useMemo, useCallback } from 'react';
import { Project } from '../types';

export const useDashboard = (projects: Project[], onUpdateProjects: (projects: Project[]) => void) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filter, setFilter] = useState<'all' | 'scripted' | 'thumbnailed'>('all');

  const filteredProjects = useMemo(() => {
    return projects.filter(project => {
      const matchesSearch = project.name.toLowerCase().includes(searchQuery.toLowerCase());
      if (filter === 'scripted') return matchesSearch && !!project.script;
      if (filter === 'thumbnailed') return matchesSearch && project.thumbnails.length > 0;
      return matchesSearch;
    });
  }, [projects, searchQuery, filter]);

  const handleDeleteProject = useCallback((id: string) => {
    if (confirm("Deseja realmente excluir este projeto? Esta ação é irreversível.")) {
      const updated = projects.filter(p => p.id !== id);
      onUpdateProjects(updated);
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

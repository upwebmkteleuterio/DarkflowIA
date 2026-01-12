
import { useState, useCallback } from 'react';
import { generateMetadata } from '../services/geminiService';
import { Project } from '../types';

export const useMetadata = (project: Project, onUpdate: (updated: Project) => void) => {
  const [loading, setLoading] = useState(false);
  const [copyingDesc, setCopyingDesc] = useState(false);
  const [copyingChap, setCopyingChap] = useState(false);

  const handleGenerate = async () => {
    if (!project.script) {
      alert("Gere o roteiro primeiro para criar os metadados.");
      return;
    }
    setLoading(true);
    try {
      const data = await generateMetadata(project.name, project.script);
      onUpdate({
        ...project,
        description: data.description,
        chapters: data.chapters
      });
    } catch (error) {
      console.error("Erro ao gerar metadados:", error);
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = useCallback((text: string, type: 'desc' | 'chap') => {
    if (!text) return;
    navigator.clipboard.writeText(text).then(() => {
      if (type === 'desc') {
        setCopyingDesc(true);
        setTimeout(() => setCopyingDesc(false), 2000);
      } else {
        setCopyingChap(true);
        setTimeout(() => setCopyingChap(false), 2000);
      }
    });
  }, []);

  return {
    loading,
    copyingDesc,
    copyingChap,
    handleGenerate,
    copyToClipboard
  };
};

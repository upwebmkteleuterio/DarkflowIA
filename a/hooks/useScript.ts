
import { useState, useCallback, useRef, useEffect } from 'react';
import { generateScript } from '../services/geminiService';
import { Project } from '../types';

export const useScript = (project: Project, onUpdate: (updated: Project) => void) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copying, setCopying] = useState(false);
  const [isAdvancedOpen, setIsAdvancedOpen] = useState(false);
  const [localScript, setLocalScript] = useState(project.script || '');
  
  const [config, setConfig] = useState({
    tone: 'Misterioso e Sombrio',
    retention: 'AIDA',
    duration: 12,
    scriptPrompt: project.scriptPrompt || '',
    positives: project.positiveInstructions || '',
    negatives: project.negativeInstructions || ''
  });

  const editorRef = useRef<HTMLDivElement>(null);

  const updateConfig = useCallback((field: string, value: any) => {
    setConfig(prev => ({ ...prev, [field]: value }));
  }, []);

  const handleGenerate = async () => {
    setLoading(true);
    setError(null);
    try {
      const script = await generateScript(
        project.name, 
        project.niche, 
        config.duration, 
        config.tone, 
        config.retention,
        config.scriptPrompt,
        config.negatives,
        config.positives
      );
      
      if (script) {
        setLocalScript(script);
        onUpdate({ 
          ...project, 
          script,
          scriptPrompt: config.scriptPrompt,
          positiveInstructions: config.positives,
          negativeInstructions: config.negatives
        });
      }
    } catch (err) {
      setError("Houve um erro ao gerar o roteiro. Tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = useCallback(() => {
    const text = editorRef.current?.innerText || localScript;
    if (!text) return;
    navigator.clipboard.writeText(text).then(() => {
      setCopying(true);
      setTimeout(() => setCopying(false), 2000);
    });
  }, [localScript]);

  const execCommand = useCallback((command: string, value?: string) => {
    document.execCommand(command, false, value);
    if (editorRef.current) {
      const newText = editorRef.current.innerText;
      setLocalScript(newText);
      onUpdate({ ...project, script: newText });
    }
  }, [project, onUpdate]);

  const toggleAdvanced = useCallback(() => setIsAdvancedOpen(prev => !prev), []);

  return {
    loading,
    error,
    copying,
    isAdvancedOpen,
    localScript,
    config,
    editorRef,
    updateConfig,
    handleGenerate,
    handleCopy,
    execCommand,
    toggleAdvanced,
    setLocalScript
  };
};

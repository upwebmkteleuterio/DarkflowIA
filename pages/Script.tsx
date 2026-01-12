
import React, { useEffect } from 'react';
import { Project } from '../types';
import { useScript } from '../hooks/useScript';
import ScriptSidebar from '../components/Script/ScriptSidebar';
import ScriptEditor from '../components/Script/ScriptEditor';

interface ScriptProps {
  project: Project;
  onUpdate: (updated: Project) => void;
  onNext: () => void;
}

const Script: React.FC<ScriptProps> = ({ project, onUpdate, onNext }) => {
  const {
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
  } = useScript(project, onUpdate);

  // Sincroniza o editor quando o script local muda (por exemplo, após geração)
  useEffect(() => {
    if (editorRef.current && !loading) {
      if (editorRef.current.innerText !== localScript) {
        editorRef.current.innerText = localScript;
      }
    }
  }, [localScript, loading, editorRef]);

  return (
    <div className="flex-1 flex flex-col md:flex-row h-full overflow-y-auto md:overflow-hidden pb-20">
      <ScriptSidebar 
        config={config}
        updateConfig={updateConfig}
        onGenerate={handleGenerate}
        onNext={onNext}
        loading={loading}
        isAdvancedOpen={isAdvancedOpen}
        onToggleAdvanced={toggleAdvanced}
        hasScript={!!project.script}
      />

      <section className="flex-1 flex flex-col bg-background-dark/50 md:overflow-y-auto custom-scrollbar">
        {error && (
          <div className="m-8 p-4 bg-red-500/10 border border-red-500/20 text-red-500 rounded-xl flex items-center gap-3">
            <span className="material-symbols-outlined">error</span>
            <p className="text-sm font-bold">{error}</p>
          </div>
        )}

        <div className="max-w-4xl mx-auto w-full flex-1 flex flex-col px-4 md:px-8 pb-12 pt-0">
          <ScriptEditor 
            editorRef={editorRef}
            loading={loading}
            localScript={localScript}
            copying={copying}
            onCopy={handleCopy}
            onExecCommand={execCommand}
            onContentChange={(text) => {
              setLocalScript(text);
              onUpdate({ ...project, script: text });
            }}
          />
          
          {project.script && !loading && (
            <div className="mt-6 flex justify-end">
              <button 
                onClick={onNext}
                className="bg-primary text-white font-bold px-8 py-3 rounded-xl flex items-center gap-2 hover:bg-primary-hover shadow-lg shadow-primary/20 transition-all active:scale-95"
              >
                Avançar para Thumbnail
                <span className="material-symbols-outlined">arrow_forward</span>
              </button>
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

export default Script;

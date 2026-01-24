
import React, { useEffect } from 'react';

interface ScriptEditorProps {
  editorRef: React.RefObject<HTMLDivElement>;
  loading: boolean;
  localScript: string;
  onContentChange: (text: string) => void;
}

const ScriptEditor: React.FC<ScriptEditorProps> = ({ 
  editorRef, 
  loading, 
  localScript, 
  onContentChange 
}) => {
  
  // Sincronização de conteúdo editável para garantir que o texto gerado apareça
  useEffect(() => {
    if (editorRef.current && localScript !== editorRef.current.innerText) {
      editorRef.current.innerText = localScript;
    }
  }, [localScript, loading]);

  return (
    <div className="bg-background-dark/20 border border-border-dark/50 rounded-[32px] flex-1 flex flex-col relative overflow-hidden min-h-[400px] md:min-h-0">
      <div className="flex-1 flex flex-col relative overflow-hidden">
        <div 
          ref={editorRef}
          contentEditable={!loading}
          onInput={(e) => onContentChange(e.currentTarget.innerText)}
          className="p-6 md:p-10 focus:outline-none flex-1 overflow-y-auto custom-scrollbar leading-relaxed text-lg md:text-xl text-white/90 whitespace-pre-wrap selection:bg-primary/30 font-sans"
          style={{ height: '100%' }}
        />
        
        {loading && (
          <div className="absolute inset-0 bg-background-dark/80 backdrop-blur-sm flex flex-col items-center justify-center gap-6 z-20">
            <div className="size-16 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
            <div className="text-center">
              <p className="text-lg font-black text-white uppercase tracking-[0.2em]">IA em ação</p>
              <p className="text-slate-500 text-xs mt-1">Escrevendo sua próxima obra-prima...</p>
            </div>
          </div>
        )}

        {!loading && !localScript && (
          <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-600 pointer-events-none opacity-20">
            <span className="material-symbols-outlined text-8xl mb-4">edit_document</span>
            <p className="text-sm font-black uppercase tracking-widest">O Roteiro aparecerá aqui</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ScriptEditor;

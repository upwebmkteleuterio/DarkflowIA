
import React from 'react';

interface ScriptEditorProps {
  editorRef: React.RefObject<HTMLDivElement>;
  loading: boolean;
  localScript: string;
  copying: boolean;
  onCopy: () => void;
  onExecCommand: (command: string) => void;
  onContentChange: (text: string) => void;
}

const ScriptEditor: React.FC<ScriptEditorProps> = ({ 
  editorRef, 
  loading, 
  localScript, 
  copying, 
  onCopy, 
  onExecCommand,
  onContentChange 
}) => {
  return (
    <div className="bg-surface-dark border border-border-dark rounded-2xl shadow-2xl flex-1 flex flex-col mt-8 relative">
      {/* Barra de Edição - Colada no Topo */}
      <div className="flex items-center gap-1 p-2 border-b border-border-dark bg-surface-dark/95 backdrop-blur-md sticky top-0 z-10 rounded-t-2xl">
        <button onClick={() => onExecCommand('bold')} className="p-2 text-slate-400 hover:text-white hover:bg-white/5 rounded transition-all" title="Negrito"><span className="material-symbols-outlined">format_bold</span></button>
        <button onClick={() => onExecCommand('italic')} className="p-2 text-slate-400 hover:text-white hover:bg-white/5 rounded transition-all" title="Itálico"><span className="material-symbols-outlined">format_italic</span></button>
        <button onClick={() => onExecCommand('insertUnorderedList')} className="p-2 text-slate-400 hover:text-white hover:bg-white/5 rounded transition-all" title="Lista"><span className="material-symbols-outlined">format_list_bulleted</span></button>
        <div className="w-px h-6 bg-border-dark mx-2"></div>
        
        <button 
          onClick={onCopy}
          className={`flex items-center gap-2 px-4 py-1.5 rounded-lg text-xs font-bold transition-all ml-auto ${copying ? 'bg-accent-green text-black' : 'bg-primary/20 text-primary hover:bg-primary hover:text-white'}`}
        >
          <span className="material-symbols-outlined text-sm">{copying ? 'check' : 'content_copy'}</span>
          {copying ? 'Copiado!' : 'Copiar Roteiro'}
        </button>
      </div>
      
      <div className="flex-1 flex flex-col relative h-full">
        <div 
          ref={editorRef}
          contentEditable={!loading}
          onInput={(e) => onContentChange(e.currentTarget.innerText)}
          className="p-6 md:p-10 focus:outline-none flex-1 leading-relaxed text-lg text-white/90 whitespace-pre-wrap selection:bg-primary/30 min-h-[500px]"
        />
        
        {loading && (
          <div className="absolute inset-0 bg-surface-dark/80 backdrop-blur-sm flex flex-col items-center justify-center gap-6 z-20 rounded-b-2xl">
            <div className="relative size-20">
              <div className="absolute inset-0 border-4 border-primary/20 rounded-full"></div>
              <div className="absolute inset-0 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
            </div>
            <div className="flex flex-col items-center gap-2">
              <p className="text-xl font-black text-white tracking-widest uppercase">Gerando Roteiro</p>
              <p className="text-slate-400 text-sm animate-pulse">Aguarde, a IA está criando o conteúdo...</p>
            </div>
          </div>
        )}

        {!loading && !localScript && (
          <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-500 pointer-events-none">
            <span className="material-symbols-outlined text-6xl mb-4 opacity-10">description</span>
            <p className="text-sm font-medium">O roteiro gerado aparecerá aqui</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ScriptEditor;

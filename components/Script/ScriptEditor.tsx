
import React, { useEffect } from 'react';
import Button from '../ui/Button';

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
  
  // SINCRONIZAÇÃO DE CONTEÚDO EDITÁVEL
  // Isso resolve o bug onde o roteiro gera mas não aparece na tela
  useEffect(() => {
    if (editorRef.current && localScript !== editorRef.current.innerText) {
      editorRef.current.innerText = localScript;
    }
  }, [localScript, loading]);

  return (
    <div className="bg-surface-dark border border-border-dark rounded-3xl shadow-2xl flex-1 flex flex-col mt-8 relative overflow-hidden">
      {/* Toolbar */}
      <div className="flex items-center gap-1 p-3 border-b border-border-dark bg-surface-dark/95 backdrop-blur-md sticky top-0 z-10">
        <div className="flex gap-1">
          <Button variant="ghost" size="sm" icon="format_bold" onClick={() => onExecCommand('bold')} className="size-10 p-0" />
          <Button variant="ghost" size="sm" icon="format_italic" onClick={() => onExecCommand('italic')} className="size-10 p-0" />
          <Button variant="ghost" size="sm" icon="format_list_bulleted" onClick={() => onExecCommand('insertUnorderedList')} className="size-10 p-0" />
        </div>
        
        <div className="w-px h-6 bg-border-dark mx-3"></div>
        
        <div className="ml-auto">
          <Button 
            variant={copying ? 'white' : 'primary'}
            size="md"
            icon={copying ? 'check' : 'content_copy'}
            onClick={onCopy}
          >
            {copying ? 'Copiado!' : 'Copiar Roteiro'}
          </Button>
        </div>
      </div>
      
      <div className="flex-1 flex flex-col relative bg-background-dark/10">
        <div 
          ref={editorRef}
          contentEditable={!loading}
          onInput={(e) => onContentChange(e.currentTarget.innerText)}
          className="p-8 md:p-12 focus:outline-none flex-1 leading-relaxed text-xl text-white/90 whitespace-pre-wrap selection:bg-primary/30 min-h-[600px] font-sans"
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


import React, { useState, useEffect } from 'react';
import { ScriptItem } from '../../types';

interface ScriptItemModalProps {
  item: ScriptItem | null;
  onClose: () => void;
  onSave: (itemId: string, script: string) => void;
}

const ScriptItemModal: React.FC<ScriptItemModalProps> = ({ item, onClose, onSave }) => {
  const [localText, setLocalText] = useState('');
  const [copying, setCopying] = useState(false);

  useEffect(() => {
    if (item) setLocalText(item.script || '');
  }, [item]);

  if (!item) return null;

  const handleCopy = () => {
    navigator.clipboard.writeText(localText).then(() => {
      setCopying(true);
      setTimeout(() => setCopying(false), 2000);
    });
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-10 animate-in fade-in duration-300">
      <div className="absolute inset-0 bg-black/90 backdrop-blur-xl" onClick={onClose} />
      
      <div className="relative bg-surface-dark border border-border-dark w-full max-w-5xl h-[85vh] rounded-[32px] shadow-2xl flex flex-col overflow-hidden animate-in zoom-in-95 duration-300">
        {/* Header */}
        <div className="p-6 md:p-8 border-b border-border-dark flex items-center justify-between bg-card-dark/50">
          <div className="space-y-1 pr-8">
            <span className="text-[10px] font-black text-primary uppercase tracking-widest">Editor de Roteiro</span>
            <h3 className="text-xl font-bold text-white truncate max-w-md md:max-w-xl">{item.title}</h3>
          </div>
          <button 
            onClick={onClose}
            className="size-10 flex items-center justify-center rounded-full hover:bg-white/10 text-slate-400 transition-colors"
          >
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        {/* Editor Area */}
        <div className="flex-1 overflow-hidden flex flex-col p-6 md:p-8">
          <div className="flex items-center gap-4 mb-4">
             <button 
                onClick={handleCopy}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-black transition-all ${copying ? 'bg-accent-green text-black' : 'bg-primary/20 text-primary hover:bg-primary hover:text-white'}`}
              >
                <span className="material-symbols-outlined text-sm">{copying ? 'check' : 'content_copy'}</span>
                {copying ? 'COPIADO!' : 'COPIAR ROTEIRO'}
              </button>
              <div className="h-4 w-px bg-border-dark"></div>
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                {localText.split(/\s+/).length} Palavras estimadas
              </span>
          </div>
          
          <textarea 
            className="flex-1 w-full bg-background-dark/50 border border-border-dark rounded-2xl p-6 md:p-8 text-lg leading-relaxed text-slate-300 focus:ring-2 focus:ring-primary outline-none custom-scrollbar resize-none font-sans"
            value={localText}
            onChange={(e) => setLocalText(e.target.value)}
            placeholder="O roteiro aparecerá aqui..."
          />
        </div>

        {/* Footer */}
        <div className="p-6 md:p-8 border-t border-border-dark flex justify-end gap-4 bg-card-dark/50">
          <button 
            onClick={onClose}
            className="px-8 py-3 rounded-xl font-bold text-slate-400 hover:text-white transition-colors"
          >
            Descartar
          </button>
          <button 
            onClick={() => onSave(item.id, localText)}
            className="px-10 py-3 bg-white text-black font-black rounded-xl hover:bg-primary hover:text-white transition-all active:scale-95"
          >
            Salvar Alterações
          </button>
        </div>
      </div>
    </div>
  );
};

export default ScriptItemModal;

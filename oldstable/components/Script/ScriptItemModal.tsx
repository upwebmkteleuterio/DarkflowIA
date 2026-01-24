
import React, { useState, useEffect } from 'react';
import { ScriptItem } from '../../types';
import Button from '../ui/Button';
import Badge from '../ui/Badge';
import { TextArea } from '../ui/Input';

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
          <div className="space-y-1 pr-8 text-left">
            <span className="text-[10px] font-black text-primary uppercase tracking-widest">Editor de Roteiro</span>
            <h3 className="text-xl font-bold text-white truncate max-w-md md:max-w-xl">{item.title}</h3>
          </div>
          <Button variant="ghost" icon="close" onClick={onClose} className="size-10 p-0 rounded-full" />
        </div>

        {/* Editor Area */}
        <div className="flex-1 overflow-hidden flex flex-col p-6 md:p-8">
          <div className="flex items-center gap-4 mb-4">
             <Button 
                variant={copying ? 'success' : 'primary'}
                size="sm"
                icon={copying ? 'check' : 'content_copy'}
                onClick={handleCopy}
              >
                {copying ? 'COPIADO!' : 'COPIAR ROTEIRO'}
              </Button>
              <div className="h-4 w-px bg-border-dark"></div>
              <Badge variant="neutral">
                {localText.split(/\s+/).length} Palavras estimadas
              </Badge>
          </div>
          
          <TextArea 
            className="flex-1 text-lg leading-relaxed text-slate-300 font-sans h-full"
            value={localText}
            onChange={(e) => setLocalText(e.target.value)}
            placeholder="O roteiro aparecerá aqui..."
          />
        </div>

        {/* Footer */}
        <div className="p-6 md:p-8 border-t border-border-dark flex justify-end gap-4 bg-card-dark/50">
          <Button 
            variant="ghost"
            onClick={onClose}
          >
            Descartar
          </Button>
          <Button 
            variant="white"
            size="lg"
            onClick={() => onSave(item.id, localText)}
          >
            Salvar Alterações
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ScriptItemModal;

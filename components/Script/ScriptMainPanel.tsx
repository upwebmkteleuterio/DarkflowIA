
import React, { useState, useMemo } from 'react';
import { ScriptItem } from '../../types';
import Badge from '../ui/Badge';
import Button from '../ui/Button';
import ScriptEditor from './ScriptEditor';
import AdvanceButton from '../ui/AdvanceButton';
import { useBatch } from '../../context/BatchContext';

interface ScriptMainPanelProps {
  selectedItem: ScriptItem | undefined;
  isAutoSaving: boolean;
  isProcessing: boolean;
  onUpdateScript: (text: string) => void;
  onRetry: (id: string) => void;
  onNext: () => void;
  stats: {
    completed: number;
  };
}

const ScriptMainPanel: React.FC<ScriptMainPanelProps> = ({
  selectedItem,
  isAutoSaving,
  isProcessing,
  onUpdateScript,
  onRetry,
  onNext,
  stats
}) => {
  const [copying, setCopying] = useState(false);
  const editorRef = React.useRef<HTMLDivElement>(null);
  const { cancelQueue } = useBatch();

  // Cálculo de palavras memoizado para performance
  const wordCount = useMemo(() => {
    const text = selectedItem?.script || "";
    if (!text.trim()) return 0;
    // Conta palavras reais, removendo espaços duplos
    return text.trim().split(/\s+/).filter(Boolean).length;
  }, [selectedItem?.script]);

  const handleCopy = () => {
    const text = selectedItem?.script || "";
    if (!text) return;
    
    navigator.clipboard.writeText(text).then(() => {
      setCopying(true);
      setTimeout(() => setCopying(false), 2000);
    });
  };

  const getStatusConfig = () => {
    const status = selectedItem?.status || 'pending';
    switch (status) {
      case 'completed':
        return { color: 'bg-accent-green', label: 'Finalizado', pulse: true };
      case 'generating':
        return { color: 'bg-primary', label: 'Gerando...', pulse: true };
      case 'failed':
        return { color: 'bg-red-500', label: 'Falhou', pulse: false };
      default:
        return { color: 'bg-slate-600', label: 'Pendente', pulse: false };
    }
  };

  const statusConfig = getStatusConfig();
  const isGenerating = selectedItem?.status === 'generating';

  return (
    <div className="flex flex-col h-full min-h-[600px] lg:min-h-0 lg:overflow-hidden pb-10 lg:pb-0">
      <div className="bg-surface-dark border border-border-dark rounded-[32px] p-5 md:p-8 shadow-2xl flex flex-col flex-1 overflow-hidden relative">
        
        {/* Cabeçalho do Painel */}
        <div className="flex flex-col gap-4 mb-6">
          <div className="flex justify-between items-start gap-4">
            <div className="flex-1 min-w-0 text-left">
              <h2 className="text-xl md:text-2xl font-black text-white leading-tight truncate">
                {selectedItem?.title || 'Selecione um vídeo na fila'}
              </h2>
            </div>
            
            {selectedItem?.status === 'failed' && (
              <Button 
                variant="danger" 
                size="sm"
                icon="refresh" 
                onClick={() => onRetry(selectedItem.id)}
              >
                Tentar
              </Button>
            )}
          </div>

          {/* Status, Cópia e Contador */}
          <div className="flex flex-wrap items-center gap-2 md:gap-3">
            <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/5 border border-white/10">
              <div className={`size-1.5 rounded-full ${statusConfig.color} ${statusConfig.pulse ? 'animate-pulse' : ''}`}></div>
              <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest">
                {statusConfig.label}
              </p>
            </div>

            {isAutoSaving ? (
              <Badge variant="success" pulse className="px-3 py-1">
                <span className="text-[9px]">Salvando...</span>
              </Badge>
            ) : selectedItem?.script ? (
              <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/5 border border-white/10">
                <span className="material-symbols-outlined text-[12px] text-slate-500">cloud_done</span>
                <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Salvo</span>
              </div>
            ) : null}

            {selectedItem?.script && (
              <>
                <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 border border-primary/20">
                  <span className="material-symbols-outlined text-[12px] text-primary">analytics</span>
                  <span className="text-[9px] font-black text-primary uppercase tracking-widest">{wordCount} Palavras</span>
                </div>

                <button 
                  onClick={handleCopy}
                  className={`flex items-center gap-1.5 px-3 py-1 rounded-full border transition-all active:scale-95 ${
                    copying 
                    ? 'bg-accent-green/20 border-accent-green/40 text-accent-green' 
                    : 'bg-white/5 border-white/10 text-slate-300 hover:bg-white/10 hover:text-white'
                  }`}
                >
                  <span className="material-symbols-outlined text-[12px]">{copying ? 'check' : 'content_copy'}</span>
                  <span className="text-[9px] font-black uppercase tracking-widest">{copying ? 'Copiado' : 'Copiar'}</span>
                </button>
              </>
            )}
          </div>
        </div>

        {/* Área do Editor - Garantindo rolagem interna */}
        <div className="flex-1 flex flex-col min-h-[450px] lg:min-h-0 overflow-hidden bg-background-dark/20 rounded-[24px] border border-border-dark/50 relative">
          <ScriptEditor 
            loading={isGenerating} 
            localScript={selectedItem?.script || ''} 
            onContentChange={onUpdateScript}
            editorRef={editorRef}
          />

          {/* Botão de Cancelar dentro do Overlay de IA em Ação */}
          {isGenerating && (
            <div className="absolute inset-x-0 bottom-12 flex justify-center z-[30] animate-in slide-in-from-bottom-4 duration-500">
              <button 
                onClick={cancelQueue}
                className="bg-red-500/10 border border-red-500/30 text-red-500 px-6 py-2 rounded-full text-[10px] font-black uppercase tracking-widest hover:bg-red-500 hover:text-white transition-all shadow-xl shadow-black/50 backdrop-blur-md flex items-center gap-2"
              >
                <span className="material-symbols-outlined text-sm">stop</span>
                Interromper Geração
              </button>
            </div>
          )}
        </div>

        {/* Botão de Avanço */}
        <div className="shrink-0 mt-6 text-right">
          <AdvanceButton 
            isVisible={stats.completed > 0 && !isProcessing} 
            onClick={onNext} 
            label="Ir para Thumbnails" 
          />
        </div>
      </div>
    </div>
  );
};

export default ScriptMainPanel;

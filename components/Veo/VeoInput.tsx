
import React, { useState, useEffect } from 'react';
import Button from '../ui/Button';
import { Input, TextArea } from '../ui/Input';

interface VeoInputProps {
  loading: boolean;
  initialTitulo?: string;
  initialRoteiro?: string;
  onAnalyze: (titulo: string, roteiro: string) => void;
}

const VeoInput: React.FC<VeoInputProps> = ({ loading, initialTitulo, initialRoteiro, onAnalyze }) => {
  const [titulo, setTitulo] = useState(initialTitulo || '');
  const [roteiro, setRoteiro] = useState(initialRoteiro || '');

  useEffect(() => {
    if (initialTitulo) setTitulo(initialTitulo);
    if (initialRoteiro) setRoteiro(initialRoteiro);
  }, [initialTitulo, initialRoteiro]);

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in slide-in-from-bottom-4 duration-700">
      <div className="bg-surface-dark border border-border-dark p-8 rounded-[40px] shadow-2xl space-y-8">
        <div className="space-y-4 text-left">
          <Input 
            label="Título do Projeto"
            placeholder="Ex: O Mistério da Cidade Perdida"
            value={titulo}
            onChange={(e) => setTitulo(e.target.value)}
            disabled={loading}
          />
          
          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Roteiro Completo</label>
            <TextArea 
              placeholder="Cole aqui o roteiro que deseja transformar em vídeo..."
              className="h-[400px] leading-relaxed"
              value={roteiro}
              onChange={(e) => setRoteiro(e.target.value)}
              disabled={loading}
            />
          </div>
        </div>

        <div className="flex flex-col items-center gap-4">
          <Button 
            size="xl" 
            fullWidth 
            icon="psychology" 
            loading={loading}
            onClick={() => onAnalyze(titulo, roteiro)}
            disabled={!titulo || !roteiro}
          >
            {loading ? 'Analisando Roteiro...' : 'Analisar e Gerar Consistência'}
          </Button>
          
          <p className="text-[10px] text-slate-500 font-bold uppercase tracking-[0.2em] max-w-sm text-center">
            A IA analisará personagens, locais, época e tom para garantir que seu vídeo seja visualmente coerente do início ao fim.
          </p>
        </div>
      </div>
    </div>
  );
};

export default VeoInput;

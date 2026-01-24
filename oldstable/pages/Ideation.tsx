
import React from 'react';
import { Project } from '../types';
import { useIdeation } from '../hooks/useIdeation';
import Button from '../components/ui/Button';
import { Input, TextArea } from '../components/ui/Input';
import Badge from '../components/ui/Badge';

interface IdeationProps {
  project: Project;
  onUpdate: (updated: Project) => void;
  onNext: () => void;
}

const Ideation: React.FC<IdeationProps> = ({ project, onUpdate, onNext }) => {
  const { 
    loading, 
    error,
    isSaved,
    formData, 
    titlesInput,
    setTitlesInput,
    updateField, 
    handleProcessBatch
  } = useIdeation(project, onUpdate);

  return (
    <div className="max-w-4xl mx-auto px-6 py-10 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-10">
        <div className="flex flex-col gap-2 text-left">
          <h2 className="text-3xl font-black text-white font-display">Entrada de <span className="text-primary italic">Lote</span></h2>
          <p className="text-slate-400">Cole seus títulos e defina o contexto. Criaremos um roteiro para cada um.</p>
        </div>
        
        {isSaved && (
          <div className="flex items-center gap-2 text-accent-green bg-accent-green/10 px-3 py-1 rounded-full animate-in fade-in zoom-in duration-300">
            <span className="material-symbols-outlined text-sm">cloud_done</span>
            <span className="text-[10px] font-black uppercase tracking-widest">Salvo no Banco</span>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-stretch">
        {/* Lado Esquerdo: Configurações de Nicho/Público */}
        <div className="space-y-6">
          <div className="bg-surface-dark border border-border-dark p-6 rounded-3xl shadow-xl space-y-5 h-full">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <span className="material-symbols-outlined text-primary">settings_suggest</span>
              Configurações Globais
            </h3>

            <Input 
              label="Nicho ou Tópico"
              placeholder="Ex: Finanças, Crime Real, Curiosidades"
              value={formData.niche}
              onChange={(e) => updateField('niche', e.target.value)}
            />

            <Input 
              label="Público Alvo"
              placeholder="Ex: Homens de 25-45 anos, Curiosos"
              value={formData.audience}
              onChange={(e) => updateField('audience', e.target.value)}
            />

            <TextArea 
              label="Do que o canal fala?"
              placeholder="Breve descrição do tema central dos seus vídeos..."
              value={formData.baseTheme}
              onChange={(e) => updateField('baseTheme', e.target.value)}
              className="h-32"
            />
          </div>
        </div>

        {/* Lado Direito: Área de Títulos */}
        <div className="space-y-6">
          <div className="bg-surface-dark border border-border-dark p-6 rounded-3xl shadow-xl flex flex-col h-full min-h-[450px]">
            <h3 className="text-lg font-bold text-white flex items-center gap-2 mb-4">
              <span className="material-symbols-outlined text-primary">list_alt</span>
              Títulos (Um por linha)
            </h3>
            
            <div className="flex-1 relative">
              <TextArea 
                placeholder="Ex:&#10;O Segredo dos Bilionários&#10;Como Investir do Zero&#10;A Verdade Sobre o Bitcoin"
                value={titlesInput}
                onChange={(e) => setTitlesInput(e.target.value)}
                className="h-full font-mono leading-relaxed"
              />
            </div>

            <p className="text-[10px] text-slate-500 mt-4 uppercase font-bold tracking-widest text-left">
              Dica: Você pode colar uma lista vinda do ChatGPT ou do nosso Gerador de Títulos.
            </p>
          </div>
        </div>
      </div>

      <div className="mt-10 flex flex-col items-end gap-4">
        {error && (
          <div className="bg-red-500/10 border border-red-500/20 text-red-500 px-6 py-3 rounded-2xl flex items-center gap-3 animate-in slide-in-from-bottom-2 duration-300 w-full md:w-auto">
            <span className="material-symbols-outlined">error</span>
            <span className="text-xs font-bold uppercase tracking-tight">{error}</span>
          </div>
        )}
        
        <Button 
          size="xl" 
          icon="arrow_forward" 
          loading={loading}
          onClick={() => handleProcessBatch(onNext)}
        >
          {loading ? 'Processando...' : 'Configurar Roteiros'}
        </Button>
      </div>
    </div>
  );
};

export default Ideation;

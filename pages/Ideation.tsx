
import React from 'react';
import { Project } from '../types';
import { useIdeation } from '../hooks/useIdeation';

interface IdeationProps {
  project: Project;
  onUpdate: (updated: Project) => void;
  onNext: () => void;
}

const Ideation: React.FC<IdeationProps> = ({ project, onUpdate, onNext }) => {
  const { 
    loading, 
    formData, 
    titlesInput,
    setTitlesInput,
    updateField, 
    handleProcessBatch
  } = useIdeation(project, onUpdate);

  return (
    <div className="max-w-4xl mx-auto px-6 py-10 animate-in fade-in duration-500">
      <div className="flex flex-col gap-2 mb-10">
        <h2 className="text-3xl font-black text-white font-display">Entrada de <span className="text-primary italic">Lote</span></h2>
        <p className="text-slate-400">Cole seus títulos e defina o contexto. Criaremos um roteiro para cada um.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Lado Esquerdo: Configurações de Nicho/Público */}
        <div className="space-y-6">
          <div className="bg-surface-dark border border-border-dark p-6 rounded-3xl shadow-xl space-y-5">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <span className="material-symbols-outlined text-primary">settings_suggest</span>
              Configurações Globais
            </h3>

            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Nicho ou Tópico</label>
              <input 
                className="w-full bg-background-dark border border-border-dark rounded-xl py-3 px-4 text-sm text-white focus:ring-2 focus:ring-primary outline-none transition-all"
                placeholder="Ex: Finanças, Crime Real, Curiosidades"
                value={formData.niche}
                onChange={(e) => updateField('niche', e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Público Alvo</label>
              <input 
                className="w-full bg-background-dark border border-border-dark rounded-xl py-3 px-4 text-sm text-white focus:ring-2 focus:ring-primary outline-none transition-all"
                placeholder="Ex: Homens de 25-45 anos, Curiosos"
                value={formData.audience}
                onChange={(e) => updateField('audience', e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Do que o canal fala?</label>
              <textarea 
                className="w-full bg-background-dark border border-border-dark rounded-xl py-3 px-4 text-sm text-white focus:ring-2 focus:ring-primary outline-none transition-all resize-none h-32"
                placeholder="Breve descrição do tema central dos seus vídeos..."
                value={formData.baseTheme}
                onChange={(e) => updateField('baseTheme', e.target.value)}
              />
            </div>
          </div>
        </div>

        {/* Lado Direito: Área de Títulos */}
        <div className="space-y-6">
          <div className="bg-surface-dark border border-border-dark p-6 rounded-3xl shadow-xl flex flex-col h-full">
            <h3 className="text-lg font-bold text-white flex items-center gap-2 mb-4">
              <span className="material-symbols-outlined text-primary">list_alt</span>
              Títulos (Um por linha)
            </h3>
            
            <div className="flex-1 min-h-[300px] relative">
              <textarea 
                className="w-full h-full bg-background-dark border border-border-dark rounded-xl py-4 px-4 text-sm text-white focus:ring-2 focus:ring-primary outline-none transition-all resize-none font-mono leading-relaxed"
                placeholder="Ex:&#10;O Segredo dos Bilionários&#10;Como Investir do Zero&#10;A Verdade Sobre o Bitcoin"
                value={titlesInput}
                onChange={(e) => setTitlesInput(e.target.value)}
              />
            </div>

            <p className="text-[10px] text-slate-500 mt-4 uppercase font-bold tracking-widest">
              Dica: Você pode colar uma lista vinda do ChatGPT ou do nosso Gerador de Títulos.
            </p>
          </div>
        </div>
      </div>

      <div className="mt-10 flex justify-end">
        <button 
          onClick={() => handleProcessBatch(onNext)}
          disabled={loading}
          className="bg-primary hover:bg-primary-hover text-white px-12 py-4 rounded-2xl font-black text-sm uppercase tracking-[0.2em] shadow-2xl shadow-primary/30 flex items-center gap-3 active:scale-95 transition-all"
        >
          {loading ? 'Processando...' : 'Configurar Roteiros'}
          <span className="material-symbols-outlined">arrow_forward</span>
        </button>
      </div>
    </div>
  );
};

export default Ideation;


import React from 'react';

interface IdeationFormProps {
  formData: {
    niche: string;
    baseTheme: string;
    audience: string;
    trigger: string;
    format: string;
  };
  updateField: (field: string, value: string) => void;
  onGenerate: () => void;
  loading: boolean;
}

const IdeationForm: React.FC<IdeationFormProps> = ({ formData, updateField, onGenerate, loading }) => {
  return (
    <aside className="w-full md:w-[400px] md:h-full border-r border-border-dark p-6 md:p-8 md:overflow-y-auto bg-background-dark/50 custom-scrollbar flex-shrink-0">
      <div className="space-y-6">
        <div>
          <h3 className="text-lg font-bold mb-1">Configurações da AI</h3>
          <p className="text-sm text-slate-500 mb-6">Defina os parâmetros para geração</p>
        </div>

        {/* Nicho */}
        <div className="space-y-2">
          <label className="text-sm font-semibold text-slate-300">Nicho ou Tópico</label>
          <div className="relative">
            <input 
              className="w-full bg-surface-dark border border-border-dark rounded-lg py-3 pl-4 pr-12 text-sm focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
              value={formData.niche}
              onChange={(e) => updateField('niche', e.target.value)}
              placeholder="Ex: Finanças, Mistério, Saúde"
            />
            <span className="material-symbols-outlined absolute right-3 top-3 text-slate-400">topic</span>
          </div>
        </div>

        {/* Tema Base */}
        <div className="space-y-2">
          <label className="text-sm font-semibold text-slate-300">Do que seu vídeo irá falar?</label>
          <div className="relative">
            <textarea 
              className="w-full bg-surface-dark border border-border-dark rounded-lg py-3 px-4 text-sm focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all resize-none h-24"
              value={formData.baseTheme}
              onChange={(e) => updateField('baseTheme', e.target.value)}
              placeholder="Descreva brevemente o tema central do seu conteúdo..."
            />
          </div>
        </div>

        {/* Público */}
        <div className="space-y-2">
          <label className="text-sm font-semibold text-slate-300">Público Alvo</label>
          <div className="relative">
            <input 
              className="w-full bg-surface-dark border border-border-dark rounded-lg py-3 pl-4 pr-12 text-sm focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
              value={formData.audience}
              onChange={(e) => updateField('audience', e.target.value)}
            />
            <span className="material-symbols-outlined absolute right-3 top-3 text-slate-400">groups</span>
          </div>
        </div>

        {/* Gatilho */}
        <div className="space-y-2">
          <label className="text-sm font-semibold text-slate-300">Gatilho Emocional</label>
          <div className="relative">
            <select 
              className="w-full bg-surface-dark border border-border-dark rounded-lg py-3 pl-4 pr-12 text-sm focus:ring-2 focus:ring-primary focus:border-transparent outline-none appearance-none cursor-pointer"
              value={formData.trigger}
              onChange={(e) => updateField('trigger', e.target.value)}
            >
              <option value="curiosity">Curiosidade Extrema</option>
              <option value="fear">Medo / Alerta</option>
              <option value="greed">Desejo / Ganância</option>
              <option value="inspiration">Inspiração / Sucesso</option>
            </select>
            <span className="material-symbols-outlined absolute right-3 top-3 text-slate-400 pointer-events-none">expand_more</span>
          </div>
        </div>

        {/* Formato */}
        <div className="space-y-2">
          <label className="text-sm font-semibold text-slate-300">Formato do Vídeo</label>
          <div className="relative">
            <select 
              className="w-full bg-surface-dark border border-border-dark rounded-lg py-3 pl-4 pr-12 text-sm focus:ring-2 focus:ring-primary focus:border-transparent outline-none appearance-none cursor-pointer"
              value={formData.format}
              onChange={(e) => updateField('format', e.target.value)}
            >
              <option value="top10">Top 10 / Listas</option>
              <option value="documentary">Mini-Documentário</option>
              <option value="storytelling">Storytelling Envolvente</option>
            </select>
            <span className="material-symbols-outlined absolute right-3 top-3 text-slate-400 pointer-events-none">expand_more</span>
          </div>
        </div>

        <button 
          onClick={onGenerate}
          disabled={loading}
          className="w-full bg-primary hover:bg-primary-hover disabled:opacity-50 text-white font-bold py-4 rounded-xl flex items-center justify-center gap-2 transition-transform active:scale-95 shadow-lg shadow-primary/20 mt-8"
        >
          <span className="material-symbols-outlined">auto_awesome</span>
          {loading ? 'Gerando...' : 'Gerar Sugestões'}
        </button>
      </div>
    </aside>
  );
};

export default IdeationForm;

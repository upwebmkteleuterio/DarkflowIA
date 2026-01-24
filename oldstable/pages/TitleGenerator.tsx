
import React, { useState } from 'react';
import { generateTitles } from '../services/geminiService';
import { TitleIdea } from '../types';

const TitleGenerator: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [ideas, setIdeas] = useState<TitleIdea[]>([]);
  const [form, setForm] = useState({
    niche: '',
    audience: '',
    trigger: 'curiosity',
    format: 'documentary',
    baseTheme: ''
  });

  const handleGenerate = async () => {
    if (!form.niche || !form.baseTheme) return;
    setLoading(true);
    try {
      const results = await generateTitles(
        form.niche, 
        form.audience, 
        form.trigger, 
        form.format, 
        form.baseTheme
      );
      setIdeas(results.map((r: any, i: number) => ({ ...r, id: Date.now() + i })));
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const copyTitle = (text: string) => {
    navigator.clipboard.writeText(text);
    alert('Título copiado!');
  };

  return (
    <div className="max-w-6xl mx-auto px-6 py-10 animate-in fade-in duration-700">
      <div className="mb-10">
        <h2 className="text-4xl font-black text-white font-display tracking-tight">
          Gerador de <span className="text-primary italic">Títulos</span>
        </h2>
        <p className="text-slate-400 text-lg">Crie ganchos irresistíveis para o algoritmo do YouTube.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[380px_1fr] gap-10">
        {/* Painel de Configuração */}
        <div className="bg-surface-dark border border-border-dark p-8 rounded-[32px] shadow-2xl h-fit space-y-6">
          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Nicho</label>
            <input 
              className="w-full bg-background-dark border border-border-dark rounded-xl py-3 px-4 text-sm text-white focus:ring-2 focus:ring-primary outline-none transition-all"
              placeholder="Ex: Curiosidades Históricas"
              value={form.niche}
              onChange={(e) => setForm({...form, niche: e.target.value})}
            />
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Tema Base</label>
            <textarea 
              className="w-full bg-background-dark border border-border-dark rounded-xl py-3 px-4 text-sm text-white focus:ring-2 focus:ring-primary outline-none transition-all resize-none h-24"
              placeholder="Sobre o que é o vídeo?"
              value={form.baseTheme}
              onChange={(e) => setForm({...form, baseTheme: e.target.value})}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
             <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Gatilho</label>
                <select 
                  className="w-full bg-background-dark border border-border-dark rounded-xl py-3 px-4 text-xs text-white outline-none"
                  value={form.trigger}
                  onChange={(e) => setForm({...form, trigger: e.target.value})}
                >
                  <option value="curiosity">Curiosidade</option>
                  <option value="fear">Medo</option>
                  <option value="greed">Ganância</option>
                </select>
             </div>
             <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Formato</label>
                <select 
                  className="w-full bg-background-dark border border-border-dark rounded-xl py-3 px-4 text-xs text-white outline-none"
                  value={form.format}
                  onChange={(e) => setForm({...form, format: e.target.value})}
                >
                  <option value="top10">Top 10</option>
                  <option value="documentary">Doc</option>
                  <option value="storytelling">Story</option>
                </select>
             </div>
          </div>

          <button 
            onClick={handleGenerate}
            disabled={loading || !form.baseTheme}
            className="w-full py-4 bg-primary hover:bg-primary-hover disabled:opacity-50 text-white font-black text-xs uppercase tracking-widest rounded-xl transition-all shadow-xl shadow-primary/20 active:scale-95 flex items-center justify-center gap-2"
          >
            <span className="material-symbols-outlined text-lg">auto_awesome</span>
            {loading ? 'Analisando CTR...' : 'Gerar Títulos'}
          </button>
        </div>

        {/* Lista de Resultados */}
        <div className="space-y-6">
          {ideas.length > 0 ? (
            <div className="grid grid-cols-1 gap-4">
              {ideas.map((idea) => (
                <div key={idea.id} className="group bg-surface-dark border border-border-dark p-6 rounded-[24px] hover:border-primary/50 transition-all flex items-center justify-between gap-6">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                       <span className="text-[9px] font-black bg-primary/20 text-primary px-2 py-0.5 rounded uppercase tracking-wider">{idea.ctrScore} CTR</span>
                       {idea.tags.map(t => <span key={t} className="text-[9px] font-bold text-slate-500">#{t}</span>)}
                    </div>
                    <h3 className="text-xl font-bold text-white group-hover:text-primary transition-colors">{idea.title}</h3>
                  </div>
                  <button 
                    onClick={() => copyTitle(idea.title)}
                    className="size-12 bg-white/5 hover:bg-primary text-slate-400 hover:text-white rounded-xl flex items-center justify-center transition-all"
                  >
                    <span className="material-symbols-outlined">content_copy</span>
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-slate-600 py-20 border-2 border-dashed border-border-dark rounded-[40px]">
               <span className="material-symbols-outlined text-7xl mb-4 opacity-20">lightbulb_circle</span>
               <p className="text-lg font-bold">Aguardando seu tema...</p>
               <p className="text-sm">Preencha o painel lateral para gerar títulos virais.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TitleGenerator;

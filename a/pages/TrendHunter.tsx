
import React, { useState } from 'react';
import { useTrendHunter } from '../hooks/useTrendHunter';
import { Trend } from '../types';

const TrendHunter: React.FC = () => {
  const {
    loading,
    theme,
    setTheme,
    country,
    setCountry,
    trends,
    handleSearch,
    clearTrends,
    countries,
    showSuggestions,
    setShowSuggestions
  } = useTrendHunter();

  const [copiedId, setCopiedId] = useState<string | null>(null);

  const handleCopyTitle = (trend: Trend) => {
    navigator.clipboard.writeText(trend.topic);
    setCopiedId(trend.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="max-w-[1200px] mx-auto px-6 py-10 animate-in fade-in duration-700">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10 text-left">
        <div className="flex flex-col gap-2">
          <h2 className="text-4xl font-black text-white font-display tracking-tight">
            Trend <span className="text-primary italic">Hunter</span>
          </h2>
          <p className="text-slate-400 text-lg">Encontre o próximo vídeo viral antes de todo mundo.</p>
        </div>
        
        {trends.length > 0 && !loading && (
          <button 
            onClick={clearTrends}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-slate-400 hover:text-red-400 hover:bg-red-500/10 transition-all text-xs font-black uppercase tracking-widest"
          >
            <span className="material-symbols-outlined text-lg">delete</span>
            Limpar Pesquisa
          </button>
        )}
      </div>

      <div className="bg-surface-dark border border-border-dark p-6 rounded-3xl shadow-2xl mb-12 flex flex-col gap-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 space-y-2 text-left">
            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Tema ou Nicho</label>
            <div className="relative group">
              <span className="material-symbols-outlined absolute left-4 top-3.5 text-slate-500 group-focus-within:text-primary transition-colors">search</span>
              <input 
                type="text"
                placeholder="Ex: Finanças, Crime Real, Tecnologia..."
                value={theme}
                onChange={(e) => setTheme(e.target.value)}
                className="w-full bg-background-dark/50 border-none rounded-xl py-4 pl-12 pr-4 text-white focus:ring-2 focus:ring-primary transition-all outline-none"
              />
            </div>
          </div>

          <div className="w-full md:w-[260px] space-y-2 relative text-left">
            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">País / Região</label>
            <div className="relative group">
              <span className="material-symbols-outlined absolute left-4 top-3.5 text-slate-500 group-focus-within:text-primary transition-colors">public</span>
              <input 
                type="text"
                value={country}
                onFocus={() => setShowSuggestions(true)}
                onBlur={() => setTimeout(() => setShowSuggestions(false), 200) }
                onChange={(e) => setCountry(e.target.value)}
                className="w-full bg-background-dark/50 border-none rounded-xl py-4 pl-12 pr-4 text-white focus:ring-2 focus:ring-primary transition-all outline-none"
                placeholder="Brasil, EUA..."
              />
              {showSuggestions && (
                <div className="absolute top-full left-0 w-full mt-2 bg-surface-dark border border-border-dark rounded-xl shadow-2xl z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
                  {countries.filter(c => c.toLowerCase().includes(country.toLowerCase())).map(c => (
                    <button 
                      key={c}
                      onClick={() => setCountry(c)}
                      className="w-full px-4 py-3 text-left text-sm text-slate-300 hover:bg-primary hover:text-white transition-colors border-b border-border-dark/50 last:border-none"
                    >
                      {c}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <button 
              onClick={handleSearch}
              disabled={loading || !theme}
              className="md:mt-6 px-10 py-4 bg-primary hover:bg-primary-hover disabled:opacity-50 text-white font-bold rounded-xl flex items-center justify-center gap-3 transition-all shadow-xl shadow-primary/20 active:scale-95 shrink-0"
            >
              <span className="material-symbols-outlined">radar</span>
              {loading ? 'Rastreando...' : 'Buscar Trends'}
            </button>
          </div>
        </div>

        {loading && (
          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em] animate-pulse text-center">
            Isso pode levar até 1 minuto e meio. Estamos minerando dados reais.
          </p>
        )}
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map(i => (
            <div key={i} className="bg-surface-dark/50 border border-border-dark rounded-3xl h-64 p-8 animate-pulse">
              <div className="h-4 w-24 bg-slate-800 rounded mb-6"></div>
              <div className="h-8 w-full bg-slate-800 rounded mb-4"></div>
              <div className="h-4 w-2/3 bg-slate-800 rounded"></div>
            </div>
          ))}
        </div>
      ) : trends.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {trends.map((trend) => (
            <div key={trend.id} className="group bg-surface-dark border border-border-dark rounded-[32px] p-8 hover:border-primary/50 hover:shadow-2xl hover:shadow-primary/5 transition-all duration-500 flex flex-col relative overflow-hidden text-left">
              <div className="absolute top-0 right-0 p-6">
                <div className={`size-14 rounded-full flex flex-col items-center justify-center border-2 ${trend.viralScore > 80 ? 'border-accent-green text-accent-green' : 'border-primary text-primary'} bg-background-dark shadow-xl`}>
                  <span className="text-lg font-black leading-none">{trend.viralScore}</span>
                  <span className="text-[8px] font-bold uppercase">Score</span>
                </div>
              </div>

              <div className="flex flex-col gap-4 flex-1">
                <div>
                  <span className="text-[10px] font-black text-primary uppercase tracking-[0.2em] mb-2 block">Tópico Emergente</span>
                  <h3 className="text-2xl font-black text-white leading-tight mb-2 pr-12">{trend.topic || "Tendência Sem Título"}</h3>
                </div>

                <div className="space-y-4">
                  <div className="bg-background-dark/50 p-4 rounded-2xl border border-border-dark/50">
                    <p className="text-[11px] font-bold text-slate-500 uppercase tracking-widest mb-1">Por que está subindo?</p>
                    <p className="text-sm text-slate-300 leading-relaxed italic">"{trend.reason || "Justificativa sendo analisada..."}"</p>
                  </div>

                  <div className="p-1">
                    <p className="text-[11px] font-bold text-slate-500 uppercase tracking-widest mb-2">Gap de Mercado</p>
                    <p className="text-xs text-slate-400 leading-relaxed">{trend.marketGap || "Oportunidade latente de criação."}</p>
                  </div>
                </div>

                {trend.sources && trend.sources.length > 0 && (
                  <div className="mt-4 pt-4 border-t border-border-dark/30">
                    <p className="text-[9px] font-black text-slate-600 uppercase tracking-widest mb-2">Fontes Verificadas</p>
                    <div className="flex flex-wrap gap-2">
                      {trend.sources.map((source, sIdx) => (
                        <a 
                          key={sIdx}
                          href={source.uri}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-[10px] text-blue-400 hover:text-white transition-colors bg-blue-500/5 border border-blue-500/20 px-2 py-1 rounded"
                        >
                          {source.title.length > 25 ? source.title.substring(0, 25) + '...' : source.title}
                        </a>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <button 
                onClick={() => handleCopyTitle(trend)}
                className={`mt-8 w-full py-4 font-black text-sm uppercase tracking-widest rounded-2xl transition-all shadow-xl active:scale-95 flex items-center justify-center gap-2 ${
                  copiedId === trend.id 
                  ? 'bg-accent-green text-black' 
                  : 'bg-white text-black hover:bg-primary hover:text-white'
                }`}
              >
                {copiedId === trend.id ? (
                  <>
                    Título Copiado!
                    <span className="material-symbols-outlined text-sm">check</span>
                  </>
                ) : (
                  <>
                    Copiar Título
                    <span className="material-symbols-outlined text-sm">content_copy</span>
                  </>
                )}
              </button>
            </div>
          ))}
        </div>
      ) : (
        <div className="py-32 flex flex-col items-center justify-center text-slate-500 bg-surface-dark/10 rounded-[48px] border-2 border-dashed border-border-dark">
          <div className="bg-primary/10 p-10 rounded-full mb-8 relative">
             <span className="material-symbols-outlined text-7xl text-primary/40">radar</span>
             <div className="absolute inset-0 border-4 border-primary/20 rounded-full animate-ping"></div>
          </div>
          <h3 className="text-2xl font-bold text-white mb-2">Rastreador Inativo</h3>
          <p className="text-sm text-slate-500 max-w-sm text-center">Digite um nicho acima para a IA vasculhar a web em busca de oportunidades de baixo suprimento e alta demanda.</p>
        </div>
      )}
    </div>
  );
};

export default TrendHunter;

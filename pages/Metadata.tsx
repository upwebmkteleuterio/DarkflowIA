
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Project } from '../types';
import { useMetadata } from '../hooks/useMetadata';

interface MetadataProps {
  project: Project;
  onUpdate: (updated: Project) => void;
}

const Metadata: React.FC<MetadataProps> = ({ project, onUpdate }) => {
  const navigate = useNavigate();
  const {
    loading,
    copyingDesc,
    copyingChap,
    handleGenerate,
    copyToClipboard
  } = useMetadata(project, onUpdate);

  return (
    <div className="w-full p-6 pb-20 animate-in fade-in duration-500">
      <div className="max-w-5xl mx-auto space-y-8">
        {/* Header Section */}
        <div className="bg-surface-dark border border-border-dark p-8 rounded-2xl shadow-xl flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-2">
            <h2 className="text-2xl font-black text-white font-display tracking-tight">Otimização de Metadados (SEO)</h2>
            <p className="text-slate-400 text-sm">Gere descrições magnéticas e capítulos automáticos para retenção extrema.</p>
          </div>
          <div className="flex flex-col md:flex-row gap-3 w-full md:w-auto">
            <button 
              onClick={handleGenerate}
              disabled={loading || !project.script}
              className="px-8 py-4 bg-primary hover:bg-primary-hover disabled:opacity-50 text-white font-bold rounded-xl flex items-center justify-center gap-3 transition-all shadow-xl shadow-primary/20 active:scale-95"
            >
              <span className="material-symbols-outlined text-[22px]">auto_awesome</span>
              {loading ? 'Processando Metadados...' : (project.description ? 'Regerar Metadados' : 'Gerar SEO Completo')}
            </button>
            <button 
              onClick={() => navigate('/')}
              className="px-8 py-4 bg-white/5 border border-white/10 text-white hover:bg-white/10 font-bold rounded-xl flex items-center justify-center gap-3 transition-all active:scale-95"
            >
              <span className="material-symbols-outlined">dashboard</span>
              Sair para o Painel
            </button>
          </div>
        </div>

        {!project.description && !loading && (
          <div className="py-24 bg-surface-dark/20 border-2 border-dashed border-border-dark rounded-3xl flex flex-col items-center justify-center text-center">
            <div className="bg-primary/10 p-6 rounded-full mb-6">
              <span className="material-symbols-outlined text-6xl text-primary/40">insights</span>
            </div>
            <h3 className="text-xl font-bold text-white mb-2">Pronto para o próximo nível?</h3>
            <p className="text-slate-500 max-w-sm text-sm">Clique no botão acima para analisar seu roteiro e gerar descrições ricas e capítulos otimizados.</p>
          </div>
        )}

        {loading && (
          <div className="py-24 bg-surface-dark/10 border border-border-dark rounded-3xl flex flex-col items-center justify-center text-center animate-pulse">
            <div className="relative size-16 mb-6">
              <div className="absolute inset-0 border-4 border-primary/20 rounded-full"></div>
              <div className="absolute inset-0 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
            </div>
            <p className="text-white font-black uppercase tracking-widest">Analisando Roteiro...</p>
            <p className="text-slate-500 text-sm mt-2">Extraindo palavras-chave e pontos de retenção.</p>
          </div>
        )}

        {(project.description || project.chapters) && !loading && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 animate-in slide-in-from-bottom-4 duration-500">
            {/* Descrição SEO */}
            <div className="flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <h3 className="text-white font-bold flex items-center gap-2">
                  <span className="material-symbols-outlined text-primary">notes</span>
                  Descrição Otimizada
                </h3>
                <button 
                  onClick={() => copyToClipboard(project.description || '', 'desc')}
                  className={`text-[10px] font-black px-3 py-1.5 rounded-lg transition-all ${copyingDesc ? 'bg-accent-green text-black' : 'bg-white/5 text-slate-400 hover:text-white'}`}
                >
                  {copyingDesc ? 'COPIADO!' : 'COPIAR TEXTO'}
                </button>
              </div>
              <textarea 
                className="w-full h-[500px] bg-surface-dark border border-border-dark rounded-2xl p-6 text-sm leading-relaxed text-slate-300 focus:ring-2 focus:ring-primary outline-none custom-scrollbar resize-none shadow-inner"
                value={project.description}
                onChange={(e) => onUpdate({...project, description: e.target.value})}
              />
            </div>

            {/* Capítulos */}
            <div className="flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <h3 className="text-white font-bold flex items-center gap-2">
                  <span className="material-symbols-outlined text-primary">format_list_numbered</span>
                  Capítulos & Timestamps
                </h3>
                <button 
                  onClick={() => copyToClipboard(project.chapters || '', 'chap')}
                  className={`text-[10px] font-black px-3 py-1.5 rounded-lg transition-all ${copyingChap ? 'bg-accent-green text-black' : 'bg-white/5 text-slate-400 hover:text-white'}`}
                >
                  {copyingChap ? 'COPIADO!' : 'COPIAR TEXTO'}
                </button>
              </div>
              <textarea 
                className="w-full h-[500px] bg-surface-dark border border-border-dark rounded-2xl p-6 text-sm font-mono leading-relaxed text-slate-300 focus:ring-2 focus:ring-primary outline-none custom-scrollbar resize-none shadow-inner"
                value={project.chapters}
                onChange={(e) => onUpdate({...project, chapters: e.target.value})}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Metadata;

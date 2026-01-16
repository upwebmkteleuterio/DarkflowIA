
import React from 'react';
import { Project } from '../types';

interface ExportProps {
  project: Project;
  onUpdate: (updated: Project) => void;
}

const Export: React.FC<ExportProps> = ({ project }) => {
  const downloadAllData = () => {
    const dataStr = JSON.stringify(project, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `darkflow-export-${project.name.toLowerCase().replace(/\s+/g, '-')}.json`;
    link.click();
  };

  return (
    <div className="max-w-7xl mx-auto px-6 py-10 animate-in fade-in duration-700">
      
      {/* Banner de Sucesso */}
      <div className="relative mb-12 overflow-hidden bg-surface-dark border border-border-dark p-10 rounded-[48px] shadow-2xl">
        <div className="absolute top-0 right-0 p-10 opacity-10">
           <span className="material-symbols-outlined text-[160px] text-primary rotate-12">verified</span>
        </div>
        <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="space-y-3 text-center md:text-left">
            <div className="flex items-center justify-center md:justify-start gap-2">
              <span className="bg-accent-green/20 text-accent-green text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-widest">Produção Concluída</span>
            </div>
            <h2 className="text-4xl font-black text-white font-display tracking-tight">Pronto para a <span className="text-primary italic">Dominação</span></h2>
            <p className="text-slate-400 max-w-lg">Seu lote de vídeos está pronto. Exporte os dados agora para iniciar a montagem no seu editor.</p>
          </div>
          
          <div className="flex flex-col gap-3 w-full md:w-auto">
             <button 
                onClick={downloadAllData}
                className="px-10 py-4 bg-white text-black font-black text-xs uppercase tracking-[0.2em] rounded-2xl hover:bg-primary hover:text-white transition-all shadow-2xl flex items-center justify-center gap-3 active:scale-95"
              >
                <span className="material-symbols-outlined">package_2</span>
                Exportar Projeto (JSON)
              </button>
              <p className="text-[10px] text-center text-slate-500 font-bold uppercase tracking-widest">Todos os vídeos inclusos</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 mb-12">
        {project.items.map(item => (
          <div key={item.id} className="bg-surface-dark/50 border border-border-dark/50 p-6 rounded-3xl flex flex-col gap-4 group hover:border-primary/30 transition-all">
             <div className="flex items-start justify-between gap-4">
                <h4 className="text-sm font-bold text-white line-clamp-2 flex-1">{item.title}</h4>
                <div className={`size-3 rounded-full flex-shrink-0 ${item.status === 'completed' ? 'bg-accent-green shadow-[0_0_8px_#39FF14]' : 'bg-slate-700'}`}></div>
             </div>

             <div className="aspect-video bg-background-dark/50 rounded-2xl overflow-hidden border border-border-dark relative">
                {item.thumbnails[0] ? (
                   <img src={item.thumbnails[0]} className="size-full object-cover" alt="Thumbnail" />
                ) : (
                   <div className="size-full flex items-center justify-center text-slate-700">
                      <span className="material-symbols-outlined text-3xl">image</span>
                   </div>
                )}
             </div>

             <div className="grid grid-cols-3 gap-2">
                <button 
                  onClick={() => navigator.clipboard.writeText(item.script)}
                  className="py-2.5 bg-white/5 hover:bg-white/10 text-[9px] font-black text-slate-400 uppercase tracking-widest rounded-lg border border-white/5"
                >
                  Script
                </button>
                <button 
                  onClick={() => navigator.clipboard.writeText(item.description || '')}
                  className="py-2.5 bg-white/5 hover:bg-white/10 text-[9px] font-black text-slate-400 uppercase tracking-widest rounded-lg border border-white/5"
                >
                  SEO
                </button>
                <button 
                  onClick={() => navigator.clipboard.writeText(item.tags || '')}
                  className="py-2.5 bg-white/5 hover:bg-white/10 text-[9px] font-black text-slate-400 uppercase tracking-widest rounded-lg border border-white/5"
                >
                  Tags
                </button>
             </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
         <div className="bg-surface-dark border border-border-dark p-6 rounded-3xl flex flex-col items-center text-center">
            <span className="material-symbols-outlined text-4xl text-accent-green mb-3">description</span>
            <p className="text-xl font-black text-white">{project.items.length}</p>
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Roteiros Prontos</p>
         </div>
         <div className="bg-surface-dark border border-border-dark p-6 rounded-3xl flex flex-col items-center text-center">
            <span className="material-symbols-outlined text-4xl text-primary mb-3">image</span>
            <p className="text-xl font-black text-white">{project.items.filter(i => i.thumbnails.length > 0).length}</p>
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Thumbnails HD</p>
         </div>
         <div className="bg-surface-dark border border-border-dark p-6 rounded-3xl flex flex-col items-center text-center">
            <span className="material-symbols-outlined text-4xl text-blue-500 mb-3">analytics</span>
            <p className="text-xl font-black text-white">{project.items.filter(i => i.tags).length}</p>
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Otimizações SEO</p>
         </div>
      </div>
    </div>
  );
};

export default Export;

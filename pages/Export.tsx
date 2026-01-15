
import React from 'react';
import { Project } from '../types';

interface ExportProps {
  project: Project;
}

const Export: React.FC<ExportProps> = ({ project }) => {
  const completedItems = project.items.filter(i => i.status === 'completed');

  const downloadAllData = () => {
    const dataStr = JSON.stringify(project, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `projeto-${project.name.toLowerCase().replace(/\s+/g, '-')}.json`;
    link.click();
  };

  return (
    <div className="max-w-7xl mx-auto px-6 py-10 animate-in fade-in duration-700">
      <div className="flex flex-col md:flex-row items-center justify-between gap-6 mb-12 bg-primary/10 border border-primary/20 p-8 rounded-[40px]">
        <div>
          <h2 className="text-3xl font-black text-white font-display tracking-tight">Projeto <span className="text-primary">Finalizado!</span></h2>
          <p className="text-slate-400">Todo o seu lote de {project.items.length} vídeos está pronto para ser postado.</p>
        </div>
        <button 
          onClick={downloadAllData}
          className="px-8 py-4 bg-white text-black font-black text-xs uppercase tracking-widest rounded-2xl hover:bg-primary hover:text-white transition-all shadow-2xl flex items-center gap-3"
        >
          <span className="material-symbols-outlined">download_for_offline</span>
          Exportar Projeto Completo (JSON)
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {project.items.map((item) => (
          <div key={item.id} className="bg-surface-dark border border-border-dark rounded-[32px] overflow-hidden flex flex-col group hover:border-primary/40 transition-all">
            <div className="aspect-video relative bg-background-dark">
              {item.thumbnails[0] ? (
                <img src={item.thumbnails[0]} className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity" alt={item.title} />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-slate-700">
                   <span className="material-symbols-outlined text-4xl">image_not_supported</span>
                </div>
              )}
              <div className="absolute top-4 left-4">
                 <span className={`text-[9px] font-black px-2 py-1 rounded-full uppercase ${item.status === 'completed' ? 'bg-accent-green text-black' : 'bg-red-500 text-white'}`}>
                   {item.status === 'completed' ? 'CONCLUÍDO' : 'PENDENTE'}
                 </span>
              </div>
            </div>

            <div className="p-6 flex-1 flex flex-col">
              <h3 className="text-lg font-bold text-white mb-6 line-clamp-2 leading-tight">{item.title}</h3>
              
              <div className="mt-auto space-y-2">
                <button 
                  disabled={!item.script}
                  onClick={() => { navigator.clipboard.writeText(item.script); alert('Roteiro Copiado!'); }}
                  className="w-full py-3 bg-white/5 hover:bg-white/10 text-slate-300 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all flex items-center justify-center gap-2"
                >
                  <span className="material-symbols-outlined text-sm">description</span>
                  Copiar Roteiro
                </button>
                <button 
                  disabled={!item.description}
                  onClick={() => { navigator.clipboard.writeText(`${item.description}\n\n${item.chapters}`); alert('SEO Copiado!'); }}
                  className="w-full py-3 bg-white/5 hover:bg-white/10 text-slate-300 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all flex items-center justify-center gap-2"
                >
                  <span className="material-symbols-outlined text-sm">campaign</span>
                  Copiar SEO (Metadados)
                </button>
                {item.thumbnails[0] && (
                  <a 
                    href={item.thumbnails[0]} 
                    download={`thumb-${item.id}.png`}
                    className="w-full py-3 bg-primary/20 hover:bg-primary text-primary hover:text-white text-[10px] font-black uppercase tracking-widest rounded-xl transition-all flex items-center justify-center gap-2"
                  >
                    <span className="material-symbols-outlined text-sm">download</span>
                    Baixar Thumbnail
                  </a>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Export;

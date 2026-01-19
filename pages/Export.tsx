
import React from 'react';
import { Project } from '../types';
import Button from '../components/ui/Button';
import Badge from '../components/ui/Badge';

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
    <div className="max-w-7xl mx-auto px-6 py-12 animate-in fade-in duration-700">
      
      {/* Banner de Sucesso */}
      <div className="relative mb-12 overflow-hidden bg-surface-dark border border-border-dark p-12 rounded-[48px] shadow-2xl">
        <div className="absolute top-0 right-0 p-12 opacity-5 pointer-events-none">
           <span className="material-symbols-outlined text-[180px] text-primary rotate-12">auto_awesome</span>
        </div>
        <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-10">
          <div className="space-y-4 text-center md:text-left">
            <Badge variant="success" pulse>Lote Processado com Sucesso</Badge>
            <h2 className="text-4xl md:text-5xl font-black text-white font-display tracking-tight leading-none uppercase">
              Arsenal <span className="text-primary italic">Pronto</span>
            </h2>
            <p className="text-slate-400 max-w-lg text-lg font-medium">Seus {project.items.length} vídeos foram gerados, otimizados e estão prontos para o upload.</p>
          </div>
          
          <div className="flex flex-col items-center gap-3 w-full md:w-auto">
             <Button 
                size="xl" 
                icon="package_2" 
                onClick={downloadAllData}
                className="w-full md:w-auto"
              >
                Exportar Projeto Completo
              </Button>
              <p className="text-[10px] text-slate-500 font-bold uppercase tracking-[0.2em] opacity-60">Formato .JSON de alta fidelidade</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8 mb-16">
        {project.items.map(item => (
          <div key={item.id} className="bg-surface-dark border border-border-dark p-6 rounded-[32px] flex flex-col gap-5 group hover:border-primary/50 transition-all shadow-xl">
             <div className="flex items-start justify-between gap-4">
                <h4 className="text-base font-bold text-white line-clamp-2 leading-tight flex-1">{item.title}</h4>
                <div className={`size-3 rounded-full flex-shrink-0 ${item.status === 'completed' ? 'bg-accent-green shadow-[0_0_10px_#39FF14]' : 'bg-slate-700'}`}></div>
             </div>

             <div className="aspect-video bg-background-dark/50 rounded-2xl overflow-hidden border border-border-dark relative shadow-inner">
                {item.thumbnails[0] ? (
                   <img src={item.thumbnails[0]} className="size-full object-cover transition-transform duration-700 group-hover:scale-105" alt="Thumb" />
                ) : (
                   <div className="size-full flex items-center justify-center text-slate-800">
                      <span className="material-symbols-outlined text-4xl">image_not_supported</span>
                   </div>
                )}
             </div>

             <div className="grid grid-cols-3 gap-2">
                <Button variant="outline" size="sm" onClick={() => navigator.clipboard.writeText(item.script)}>Script</Button>
                <Button variant="outline" size="sm" onClick={() => navigator.clipboard.writeText(item.description || '')}>SEO</Button>
                <Button variant="outline" size="sm" onClick={() => navigator.clipboard.writeText(item.tags || '')}>Tags</Button>
             </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
         <div className="bg-surface-dark border border-border-dark p-8 rounded-[40px] flex flex-col items-center text-center shadow-lg">
            <span className="material-symbols-outlined text-4xl text-accent-green mb-4">description</span>
            <p className="text-3xl font-black text-white">{project.items.length}</p>
            <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mt-1">Roteiros Prontos</p>
         </div>
         <div className="bg-surface-dark border border-border-dark p-8 rounded-[40px] flex flex-col items-center text-center shadow-lg">
            <span className="material-symbols-outlined text-4xl text-primary mb-4">image</span>
            <p className="text-3xl font-black text-white">{project.items.filter(i => i.thumbnails.length > 0).length}</p>
            <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mt-1">Miniaturas HD</p>
         </div>
         <div className="bg-surface-dark border border-border-dark p-8 rounded-[40px] flex flex-col items-center text-center shadow-lg">
            <span className="material-symbols-outlined text-4xl text-blue-500 mb-4">analytics</span>
            <p className="text-3xl font-black text-white">{project.items.filter(i => i.tags).length}</p>
            <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mt-1">Otimizações SEO</p>
         </div>
      </div>
    </div>
  );
};

export default Export;

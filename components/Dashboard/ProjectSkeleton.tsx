import React from 'react';

const ProjectSkeleton: React.FC = () => {
  return (
    <div className="bg-surface-dark rounded-2xl border border-border-dark overflow-hidden animate-pulse flex flex-col h-[340px]">
      {/* Área da Imagem */}
      <div className="w-full h-44 bg-slate-800/50 relative">
        <div className="absolute top-4 left-4 h-5 w-24 bg-slate-700 rounded-full"></div>
      </div>

      <div className="p-5 flex-1 flex flex-col gap-4">
        {/* Título e Data */}
        <div className="space-y-2">
          <div className="h-6 w-3/4 bg-slate-700 rounded"></div>
          <div className="h-3 w-1/4 bg-slate-800 rounded"></div>
        </div>

        {/* Barra de Progresso */}
        <div className="mt-auto space-y-3">
          <div className="flex justify-between">
            <div className="h-3 w-1/2 bg-slate-800 rounded"></div>
            <div className="h-3 w-10 bg-slate-800 rounded"></div>
          </div>
          <div className="w-full h-1.5 bg-background-dark rounded-full overflow-hidden border border-border-dark">
            <div className="bg-slate-800 h-full w-1/3"></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProjectSkeleton;
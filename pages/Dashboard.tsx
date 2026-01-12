
import React from 'react';
import { Project } from '../types';
import { useDashboard } from '../hooks/useDashboard';
import ProjectCard from '../components/Dashboard/ProjectCard';

interface DashboardProps {
  projects: Project[];
  setProjects: React.Dispatch<React.SetStateAction<Project[]>>;
  onCreateProject: () => void;
}

const Dashboard: React.FC<DashboardProps> = ({ projects, setProjects, onCreateProject }) => {
  const {
    searchQuery,
    setSearchQuery,
    filter,
    setFilter,
    filteredProjects,
    handleDeleteProject
  } = useDashboard(projects, (updated) => setProjects(updated));

  return (
    <div className="max-w-[1400px] mx-auto px-4 md:px-10 py-8 md:py-12 animate-in fade-in duration-700">
      {/* Header & Welcome */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
        <div className="space-y-1">
          <h2 className="text-white text-3xl md:text-5xl font-black tracking-tighter font-display">
            Central de <span className="text-primary italic">Criação</span>
          </h2>
          <p className="text-slate-400 text-sm font-medium">Você tem {projects.length} projetos em andamento hoje.</p>
        </div>
        
        <button 
          onClick={onCreateProject}
          className="flex items-center justify-center gap-3 px-8 py-4 bg-primary hover:bg-primary-hover text-white rounded-2xl transition-all shadow-2xl shadow-primary/20 group active:scale-95"
        >
          <span className="material-symbols-outlined font-bold group-hover:rotate-180 transition-transform duration-500">add</span>
          <span className="font-black text-sm uppercase tracking-widest">Novo Projeto</span>
        </button>
      </div>

      {/* Toolbar: Busca e Filtros */}
      <div className="bg-surface-dark border border-border-dark p-2 rounded-2xl mb-10 flex flex-col md:flex-row gap-2 shadow-xl">
        <div className="relative flex-1 group">
          <span className="material-symbols-outlined absolute left-4 top-3.5 text-slate-500 group-focus-within:text-primary transition-colors">search</span>
          <input 
            type="text"
            placeholder="Buscar projeto por nome..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-background-dark/50 border-none rounded-xl py-3.5 pl-12 pr-4 text-sm text-white focus:ring-2 focus:ring-primary transition-all outline-none placeholder:text-slate-600"
          />
        </div>
        
        <div className="flex gap-2">
          {[
            { id: 'all', label: 'Todos', icon: 'list' },
            { id: 'scripted', label: 'Roteiros', icon: 'description' },
            { id: 'thumbnailed', label: 'Thumbs', icon: 'image' }
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => setFilter(item.id as any)}
              className={`flex items-center gap-2 px-6 py-3 rounded-xl text-xs font-bold transition-all border ${
                filter === item.id 
                ? 'bg-primary border-primary text-white shadow-lg shadow-primary/10' 
                : 'bg-transparent border-transparent text-slate-500 hover:text-white hover:bg-white/5'
              }`}
            >
              <span className="material-symbols-outlined text-[18px]">{item.icon}</span>
              {item.label}
            </button>
          ))}
        </div>
      </div>

      {/* Grid de Projetos */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filteredProjects.map((project) => (
          <ProjectCard 
            key={project.id} 
            project={project} 
            onDelete={(e, id) => {
              e.preventDefault();
              e.stopPropagation();
              handleDeleteProject(id);
            }} 
          />
        ))}

        {/* Empty State / Add New */}
        {filteredProjects.length === 0 && searchQuery && (
          <div className="col-span-full py-20 flex flex-col items-center justify-center text-slate-500 bg-surface-dark/10 rounded-3xl border-2 border-dashed border-border-dark">
            <span className="material-symbols-outlined text-6xl mb-4 opacity-10">search_off</span>
            <p className="font-bold text-white">Nenhum projeto encontrado</p>
            <p className="text-sm">Tente mudar os termos da busca ou filtros.</p>
          </div>
        )}

        {filteredProjects.length === 0 && !searchQuery && (
          <button
            onClick={onCreateProject}
            className="group border-2 border-dashed border-border-dark rounded-2xl flex flex-col items-center justify-center p-10 hover:border-primary/50 transition-all duration-300 bg-surface-dark/20 min-h-[280px] w-full"
          >
            <div className="size-16 bg-primary/10 text-primary rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 group-hover:bg-primary group-hover:text-white transition-all shadow-xl shadow-primary/5">
              <span className="material-symbols-outlined text-4xl">add</span>
            </div>
            <p className="text-white font-black text-sm uppercase tracking-[0.2em]">Criar Primeiro Vídeo</p>
            <p className="text-slate-500 text-[11px] mt-2 font-medium max-w-[180px] text-center uppercase leading-relaxed opacity-60">Inicie sua jornada viral com a nossa inteligência artificial</p>
          </button>
        )}
      </div>

      {/* Footer Info */}
      <div className="mt-16 flex flex-col md:flex-row items-center justify-between border-t border-border-dark pt-8 gap-4">
        <div className="flex items-center gap-6">
          <div className="flex -space-x-3">
             {[1,2,3,4].map(i => (
               <div key={i} className="size-8 rounded-full border-2 border-background-dark bg-slate-800 flex items-center justify-center text-[10px] font-bold text-slate-400">
                 {String.fromCharCode(64 + i)}
               </div>
             ))}
          </div>
          <p className="text-[11px] font-bold text-slate-500 uppercase tracking-widest">+1,240 criadores usando agora</p>
        </div>
        <div className="flex gap-4">
           <span className="text-[11px] font-black text-accent-green uppercase tracking-widest flex items-center gap-2">
             <div className="size-2 bg-accent-green rounded-full animate-pulse shadow-[0_0_8px_#39FF14]"></div>
             Sistema Operacional
           </span>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;


import React from 'react';
import { Project } from '../types';
import { useDashboard } from '../hooks/useDashboard';
import ProjectCard from '../components/Dashboard/ProjectCard';
import DashboardToolbar from '../components/Dashboard/DashboardToolbar';
import Button from '../components/ui/Button';

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

  const filterItems = [
    { id: 'all', label: 'Todos', icon: 'list' },
    { id: 'scripted', label: 'Roteiros', icon: 'description' },
    { id: 'thumbnailed', label: 'Thumbs', icon: 'image' }
  ];

  return (
    <div className="max-w-[1400px] mx-auto px-4 md:px-10 py-8 md:py-12 animate-in fade-in duration-700">
      {/* Header & Welcome */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
        <div className="space-y-1">
          <h2 className="text-white text-3xl md:text-5xl font-black tracking-tighter font-display text-left">
            Central de <span className="text-primary italic">Criação</span>
          </h2>
          <p className="text-slate-400 text-sm font-medium text-left">Você tem {projects.length} projetos em andamento hoje.</p>
        </div>
        
        <Button 
          size="lg" 
          icon="add" 
          onClick={onCreateProject}
          className="group"
        >
          Novo Projeto
        </Button>
      </div>

      {/* Toolbar: Busca e Filtros (Refatorado para componente isolado) */}
      <DashboardToolbar 
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        filter={filter}
        setFilter={setFilter}
        filterItems={filterItems}
      />

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

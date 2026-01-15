
import React from 'react';
import { Link } from 'react-router-dom';
import { Project } from '../../types';

interface ProjectCardProps {
  project: Project;
  onDelete: (e: React.MouseEvent, id: string) => void;
}

const ProjectCard: React.FC<ProjectCardProps> = ({ project, onDelete }) => {
  // Proteções contra itens indefinidos para evitar o erro "Cannot read properties of undefined (reading 'length')"
  const itemsArray = project.items || [];
  const totalItems = itemsArray.length;
  const completedItems = itemsArray.filter(i => i.status === 'completed').length;
  const completionRate = totalItems > 0 ? Math.round((completedItems / totalItems) * 100) : 0;
  
  // Encontrar a primeira thumbnail disponível no lote para a capa
  const coverImage = itemsArray.find(i => i.thumbnails && i.thumbnails.length > 0)?.thumbnails?.[0];

  return (
    <Link
      to={`/projects/${project.id}`}
      className="group bg-surface-dark rounded-2xl border border-border-dark overflow-hidden hover:border-primary/50 hover:shadow-2xl hover:shadow-primary/5 transition-all duration-300 flex flex-col"
    >
      <div 
        className="w-full h-44 bg-center bg-no-repeat bg-cover relative" 
        style={{ backgroundImage: `url(${coverImage || 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=2564&auto=format&fit=crop'})` }}
      >
        <div className="absolute inset-0 bg-gradient-to-t from-surface-dark via-surface-dark/20 to-transparent opacity-80"></div>
        
        {/* Badge de Lote */}
        <div className="absolute top-4 left-4 flex gap-1">
          <div className="bg-primary/20 backdrop-blur-md border border-primary/30 text-primary text-[9px] font-black px-2 py-0.5 rounded-full uppercase">
            {totalItems} VÍDEOS EM LOTE
          </div>
        </div>

        {/* Botão Deletar */}
        <button 
          onClick={(e) => onDelete(e, project.id)}
          className="absolute top-4 right-4 size-8 flex items-center justify-center rounded-lg bg-black/40 text-red-400 opacity-0 group-hover:opacity-100 transition-all hover:bg-red-500 hover:text-white backdrop-blur-md z-10"
        >
          <span className="material-symbols-outlined text-lg">delete</span>
        </button>
      </div>

      <div className="p-5 flex-1 flex flex-col">
        <div className="mb-4">
          <h4 className="text-white text-lg font-bold mb-1 truncate leading-tight group-hover:text-primary transition-colors">{project.name}</h4>
          <p className="text-slate-500 text-[11px] font-medium flex items-center gap-1">
            <span className="material-symbols-outlined text-[12px]">calendar_today</span>
            {project.createdAt ? new Date(project.createdAt).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' }) : '---'}
          </p>
        </div>

        <div className="mt-auto space-y-3">
          <div className="flex items-center justify-between text-[10px] font-bold text-slate-400 uppercase tracking-widest">
            <span>Produção: {completedItems}/{totalItems}</span>
            <span className="text-primary">{completionRate}%</span>
          </div>
          <div className="w-full h-1.5 bg-background-dark rounded-full overflow-hidden border border-border-dark">
            <div 
              className="bg-primary h-full transition-all duration-1000" 
              style={{ width: `${completionRate}%` }}
            ></div>
          </div>
        </div>
      </div>
    </Link>
  );
};

export default ProjectCard;

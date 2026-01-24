
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Project } from '../../types';
import { supabase } from '../../lib/supabase';

interface ProjectCardProps {
  project: Project;
  onDelete: (e: React.MouseEvent, id: string) => void;
}

const ProjectCard: React.FC<ProjectCardProps> = ({ project, onDelete }) => {
  const [title, setTitle] = useState(project.name || '');
  const [isEditing, setIsEditing] = useState(false);
  
  const itemsArray = project.items || [];
  const totalItems = itemsArray.length;
  const completedItems = itemsArray.filter(i => i.status === 'completed').length;
  const completionRate = totalItems > 0 ? Math.round((completedItems / totalItems) * 100) : 0;
  
  const coverImage = itemsArray.find(i => i.thumbnails && i.thumbnails.length > 0)?.thumbnails?.[0];

  const handleTitleBlur = async () => {
    setIsEditing(false);
    if (title !== project.name) {
      console.log(`[DASHBOARD] Alterando título do projeto ${project.id} para: ${title}`);
      const { error } = await supabase
        .from('projects')
        .update({ name: title })
        .eq('id', project.id);
      
      if (error) console.error("[DASHBOARD] Erro ao salvar título:", error);
    }
  };

  return (
    <div className="group bg-surface-dark rounded-2xl border border-border-dark overflow-hidden hover:border-primary/50 hover:shadow-2xl hover:shadow-primary/5 transition-all duration-300 flex flex-col relative">
      <Link to={`/projects/${project.id}`} className="absolute inset-0 z-0"></Link>
      
      <div 
        className="w-full h-44 bg-center bg-no-repeat bg-cover relative pointer-events-none" 
        style={{ backgroundImage: `url(${coverImage || 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=2564&auto=format&fit=crop'})` }}
      >
        <div className="absolute inset-0 bg-gradient-to-t from-surface-dark via-surface-dark/20 to-transparent opacity-80"></div>
        <div className="absolute top-4 left-4 flex gap-1">
          <div className="bg-primary/20 backdrop-blur-md border border-primary/30 text-primary text-[9px] font-black px-2 py-0.5 rounded-full uppercase">
            {totalItems} VÍDEOS EM LOTE
          </div>
        </div>
      </div>

      {/* Botão Deletar (Fora do Link para não disparar navegação) */}
      <button 
        onClick={(e) => onDelete(e, project.id)}
        className="absolute top-4 right-4 size-8 flex items-center justify-center rounded-lg bg-black/40 text-red-400 opacity-0 group-hover:opacity-100 transition-all hover:bg-red-500 hover:text-white backdrop-blur-md z-20"
      >
        <span className="material-symbols-outlined text-lg">delete</span>
      </button>

      <div className="p-5 flex-1 flex flex-col relative z-10 pointer-events-auto">
        <div className="mb-4">
          {isEditing ? (
            <input 
              autoFocus
              className="w-full bg-background-dark border border-primary rounded px-2 py-1 text-lg font-bold text-white focus:outline-none"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              onBlur={handleTitleBlur}
              onKeyDown={(e) => e.key === 'Enter' && handleTitleBlur()}
            />
          ) : (
            <h4 
              onClick={() => setIsEditing(true)}
              className="text-white text-lg font-bold mb-1 truncate leading-tight group-hover:text-primary transition-colors cursor-text"
            >
              {title || 'Sem Nome'}
            </h4>
          )}
          
          <p className="text-slate-500 text-[11px] font-medium flex items-center gap-1">
            <span className="material-symbols-outlined text-[12px]">calendar_today</span>
            {/* Exibição garantida da data usando a data atual se createdAt for nulo por algum motivo de rede */}
            {new Date(project.createdAt || Date.now()).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' })}
          </p>
        </div>

        <div className="mt-auto space-y-3">
          <div className="flex items-center justify-between text-[10px] font-bold text-slate-400 uppercase tracking-widest">
            <span>Progresso de Roteiros: {completedItems}/{totalItems}</span>
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
    </div>
  );
};

export default ProjectCard;

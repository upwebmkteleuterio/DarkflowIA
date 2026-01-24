
import React from 'react';
import { TitleIdea } from '../../types';

interface TitleCardProps {
  idea: TitleIdea;
  onSelect: (title: string) => void;
}

// Fix: Changed TitleIdeaProps to TitleCardProps to match the interface definition
const TitleCard: React.FC<TitleCardProps> = ({ idea, onSelect }) => {
  return (
    <div className="group flex flex-col border border-border-dark p-6 rounded-2xl hover:border-primary/50 hover:bg-primary/5 transition-all bg-surface-dark shadow-xl">
      <div className="flex flex-wrap gap-2 mb-3">
        <span className="bg-primary/20 text-primary text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider">
          {idea.ctrScore}
        </span>
        {idea.tags.map((tag) => (
          <span 
            key={tag} 
            className="bg-blue-500/10 text-blue-400 text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider border border-blue-500/20"
          >
            {tag}
          </span>
        ))}
      </div>
      <h3 className="text-xl font-bold leading-snug mb-6 text-white group-hover:text-primary transition-colors">
        {idea.title}
      </h3>
      
      <div className="mt-auto pt-4 border-t border-border-dark/30 flex justify-end">
        <button 
          onClick={() => onSelect(idea.title)}
          className="w-full md:w-auto bg-primary text-white text-sm font-bold px-6 py-3 rounded-xl flex items-center justify-center gap-2 transition-all hover:bg-primary-hover shadow-lg shadow-primary/10 active:scale-95"
        >
          Selecionar e Continuar
          <span className="material-symbols-outlined text-sm">arrow_forward</span>
        </button>
      </div>
    </div>
  );
};

export default TitleCard;

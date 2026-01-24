
import React from 'react';
import { TitleIdea } from '../../types';
import TitleCard from './TitleCard';

interface TitleListProps {
  titles: TitleIdea[];
  loading: boolean;
  onSelect: (title: string) => void;
}

const TitleList: React.FC<TitleListProps> = ({ titles, loading, onSelect }) => {
  return (
    <section className="flex-1 p-6 md:p-8 overflow-y-auto custom-scrollbar">
      <div className="mb-8">
        <h2 className="text-2xl font-bold">Títulos Estratégicos Gerados</h2>
        <p className="text-slate-500">Escolha o título que melhor se adapta ao seu canal para continuar.</p>
      </div>

      <div className="grid grid-cols-1 gap-6 max-w-4xl">
        {titles.map((idea) => (
          <TitleCard key={idea.id} idea={idea} onSelect={onSelect} />
        ))}

        {loading && (
          <div className="border border-border-dark p-6 rounded-2xl bg-surface-dark/50 flex flex-col gap-4 animate-pulse">
            <div className="flex gap-2">
              <div className="h-4 w-12 bg-slate-700 rounded"></div>
              <div className="h-4 w-12 bg-slate-700 rounded"></div>
            </div>
            <div className="h-6 w-3/4 bg-slate-700 rounded"></div>
            <div className="h-10 w-40 bg-slate-700 rounded ml-auto mt-4"></div>
          </div>
        )}
        
        {!loading && titles.length === 0 && (
          <div className="text-center py-32 text-slate-500 bg-surface-dark/20 rounded-3xl border-2 border-dashed border-border-dark">
            <span className="material-symbols-outlined text-6xl block mb-4 opacity-20">lightbulb</span>
            <p className="font-bold">Nenhum título gerado ainda</p>
            <p className="text-sm">Preencha as configurações ao lado e gere sugestões</p>
          </div>
        )}
      </div>
    </section>
  );
};

export default TitleList;

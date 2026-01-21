
import React from 'react';
import Button from '../ui/Button';
import { Input } from '../ui/Input';

interface FilterItem {
  id: string;
  label: string;
  icon: string;
}

interface DashboardToolbarProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  filter: 'all' | 'scripted' | 'thumbnailed';
  setFilter: (filter: 'all' | 'scripted' | 'thumbnailed') => void;
  filterItems: FilterItem[];
}

const DashboardToolbar: React.FC<DashboardToolbarProps> = ({
  searchQuery,
  setSearchQuery,
  filter,
  setFilter,
  filterItems
}) => {
  return (
    <div className="bg-surface-dark border border-border-dark p-2 rounded-2xl mb-10 flex flex-col md:flex-row gap-2 shadow-xl">
      <div className="flex-1">
        <Input 
          icon="search"
          placeholder="Buscar projeto por nome..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>
      
      <div className="flex gap-2">
        {filterItems.map((item) => (
          <button
            key={item.id}
            onClick={() => setFilter(item.id as any)}
            className={`flex items-center gap-2 px-5 py-2.5 text-xs font-bold uppercase tracking-widest rounded-xl transition-all active:scale-95 ${
              filter === item.id 
                ? 'bg-primary text-white shadow-lg shadow-primary/20' 
                : 'bg-transparent text-slate-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <span className="material-symbols-outlined text-[1.2em]">{item.icon}</span>
            {item.label}
          </button>
        ))}
      </div>
    </div>
  );
};

export default DashboardToolbar;

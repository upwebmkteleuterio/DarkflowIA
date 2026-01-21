
import React from 'react';
import { Input } from '../ui/Input';

interface DashboardToolbarProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
}

const DashboardToolbar: React.FC<DashboardToolbarProps> = ({
  searchQuery,
  setSearchQuery,
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
    </div>
  );
};

export default DashboardToolbar;

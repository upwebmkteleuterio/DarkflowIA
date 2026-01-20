
import React from 'react';
import { ScriptItem } from '../../types';

interface SidebarItemListProps {
  items: ScriptItem[];
  selectedId: string;
  onSelect: (id: string) => void;
  renderBadge: (item: ScriptItem) => React.ReactNode;
  title: string;
  footerAction?: React.ReactNode;
}

const SidebarItemList: React.FC<SidebarItemListProps> = ({ 
  items, 
  selectedId, 
  onSelect, 
  renderBadge, 
  title,
  footerAction 
}) => {
  return (
    <div className="bg-surface-dark border border-border-dark rounded-[32px] shadow-2xl overflow-hidden flex flex-col shrink-0">
      <div className="p-5 border-b border-border-dark bg-card-dark/30 flex justify-between items-center">
         <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] ml-1">{title}</h4>
         <span className="text-[9px] font-bold text-slate-600 bg-background-dark px-2 py-0.5 rounded-full">{items.length} ITENS</span>
      </div>
      
      <div className="p-3 space-y-2 max-h-[400px] overflow-y-auto custom-scrollbar">
         {items.map(item => (
           <button
              key={item.id}
              onClick={() => onSelect(item.id)}
              className={`w-full p-4 rounded-2xl text-left transition-all border shrink-0 ${
                selectedId === item.id 
                  ? 'bg-white/5 border-primary shadow-lg shadow-primary/5' 
                  : 'bg-transparent border-transparent hover:bg-white/5'
              }`}
           >
              <div className="flex items-center gap-3 mb-2">
                {renderBadge(item)}
              </div>
              <p className={`text-xs font-bold leading-tight line-clamp-2 ${selectedId === item.id ? 'text-white' : 'text-slate-400'}`}>
                {item.title}
              </p>
           </button>
         ))}
      </div>

      {footerAction && (
        <div className="p-5 bg-card-dark/30 border-t border-border-dark">
           {footerAction}
        </div>
      )}
    </div>
  );
};

export default SidebarItemList;


import React from 'react';
import { ScriptItem } from '../../types';
import { useBatch } from '../../context/BatchContext';

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
  const { cancelQueue } = useBatch();

  return (
    <div className="bg-surface-dark border border-border-dark rounded-[32px] shadow-2xl overflow-hidden flex flex-col shrink-0">
      <div className="p-5 border-b border-border-dark bg-card-dark/30 flex justify-between items-center text-left">
         <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] ml-1">{title}</h4>
         <span className="text-[9px] font-bold text-slate-600 bg-background-dark px-2 py-0.5 rounded-full">{items.length} ITENS</span>
      </div>
      
      <div className="p-3 space-y-2 max-h-[400px] overflow-y-auto custom-scrollbar">
         {items.map(item => {
           const isGenerating = item.status === 'generating' || item.thumbStatus === 'generating';
           
           return (
             <div key={item.id} className="relative group">
               <button
                  onClick={() => onSelect(item.id)}
                  className={`w-full p-4 rounded-2xl text-left transition-all border shrink-0 ${
                    selectedId === item.id 
                      ? 'bg-white/5 border-primary shadow-lg shadow-primary/5' 
                      : 'bg-transparent border-transparent hover:bg-white/5'
                  }`}
               >
                  <div className="flex items-center justify-between mb-2">
                    {renderBadge(item)}
                    
                    {/* Botão de interrupção individual simulado via cancelQueue global */}
                    {isGenerating && (
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          cancelQueue();
                        }}
                        title="Interromper Processo"
                        className="size-6 bg-red-500/10 text-red-500 rounded-lg flex items-center justify-center hover:bg-red-500 hover:text-white transition-all border border-red-500/20"
                      >
                        <span className="material-symbols-outlined text-[14px]">close</span>
                      </button>
                    )}
                  </div>
                  <p className={`text-xs font-bold leading-tight line-clamp-2 ${selectedId === item.id ? 'text-white' : 'text-slate-400'}`}>
                    {item.title}
                  </p>
               </button>
             </div>
           );
         })}
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

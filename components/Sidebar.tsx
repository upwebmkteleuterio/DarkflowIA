
import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';

interface SidebarProps {
  isCollapsed: boolean;
  onToggleCollapse: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ isCollapsed, onToggleCollapse }) => {
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const isActive = (path: string) => location.pathname === path;

  const navItems = [
    { name: 'Meus Projetos', icon: 'grid_view', path: '/' },
    { name: 'Gerador de Títulos', icon: 'auto_fix_high', path: '/title-generator' },
    { name: 'Trend Hunter', icon: 'radar', path: '/trends' },
    { name: 'Planos & Créditos', icon: 'auto_awesome_motion', path: '/plans' },
    { name: 'Calculadora de Custos', icon: 'calculate', path: '/cost-estimator' }, // Novo link
    { name: 'Configurações', icon: 'settings', path: '/settings' },
  ];

  const closeMenu = () => setIsMobileMenuOpen(false);

  const SidebarContent = (isMobile: boolean) => (
    <div className={`flex flex-col justify-between h-full bg-surface-dark border-r border-border-dark transition-all duration-300 relative ${isMobile ? 'w-72' : (isCollapsed ? 'w-20' : 'w-64')}`}>
      <div className="flex flex-col gap-8 p-4 md:p-6">
        <div className={`flex items-center gap-3 transition-all ${isCollapsed && !isMobile ? 'justify-center' : ''}`}>
          <div className="bg-primary size-10 rounded-xl flex-shrink-0 flex items-center justify-center shadow-lg shadow-primary/30">
            <span className="material-symbols-outlined text-white text-2xl">rocket_launch</span>
          </div>
          {(!isCollapsed || isMobile) && (
            <div className="flex flex-col overflow-hidden whitespace-nowrap animate-in fade-in duration-300">
              <h1 className="text-white text-lg font-black leading-tight tracking-tight">DarkFlow AI</h1>
              <p className="text-primary text-[10px] font-bold uppercase tracking-widest">Creator Suite</p>
            </div>
          )}
        </div>

        <nav className="flex flex-col gap-2">
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              onClick={closeMenu}
              className={`flex items-center gap-3 px-3 py-3 rounded-xl transition-all duration-200 group relative ${
                isActive(item.path) || (item.path === '/' && location.pathname.startsWith('/projects'))
                  ? 'bg-primary text-white shadow-lg shadow-primary/20'
                  : 'text-slate-400 hover:bg-white/5 hover:text-white'
              } ${isCollapsed && !isMobile ? 'justify-center' : ''}`}
            >
              <span className={`material-symbols-outlined flex-shrink-0 ${isActive(item.path) ? 'fill-1' : 'group-hover:scale-110 transition-transform'}`}>
                {item.icon}
              </span>
              {(!isCollapsed || isMobile) && <p className="text-sm font-bold whitespace-nowrap overflow-hidden animate-in fade-in duration-300">{item.name}</p>}
              
              {isCollapsed && !isMobile && (
                <div className="absolute left-full ml-2 px-3 py-1.5 bg-primary text-white text-[10px] font-black rounded-lg opacity-0 group-hover:opacity-100 pointer-events-none transition-all z-[150] whitespace-nowrap shadow-2xl scale-95 group-hover:scale-100 border border-white/10">
                  {item.name}
                </div>
              )}
            </Link>
          ))}
        </nav>
      </div>

      <div className={`p-4 md:p-6 flex flex-col gap-4 border-t border-border-dark bg-background-dark/30 ${isCollapsed && !isMobile ? 'items-center' : ''}`}>
        {(!isCollapsed || isMobile) ? (
          <div className="bg-gradient-to-br from-surface-dark to-card-dark border border-border-dark rounded-2xl p-4 shadow-inner">
            <div className="flex justify-between items-center mb-3">
              <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">Saldo</span>
              <div className="bg-accent-green/20 text-accent-green text-[9px] font-bold px-2 py-0.5 rounded-full">ATIVO</div>
            </div>
            <div className="flex items-baseline gap-1 mb-3">
              <p className="text-2xl font-black text-white leading-none">350</p>
              <span className="text-[10px] font-bold text-slate-500">créditos</span>
            </div>
            <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
              <div className="bg-primary h-full w-2/3"></div>
            </div>
          </div>
        ) : (
          <div className="size-10 bg-primary/10 rounded-xl flex items-center justify-center text-primary font-black text-xs">
            350
          </div>
        )}

        {!isMobile && (
          <button 
            onClick={onToggleCollapse}
            className="absolute -right-3 top-1/2 -translate-y-1/2 size-6 bg-border-dark border border-white/10 text-slate-400 rounded-full flex items-center justify-center hover:bg-primary hover:text-white transition-all shadow-2xl z-[200]"
          >
            <span className={`material-symbols-outlined text-sm ${isCollapsed ? 'rotate-180' : ''}`}>chevron_left</span>
          </button>
        )}
      </div>
    </div>
  );

  return (
    <>
      <div className="lg:hidden flex items-center justify-between p-4 bg-surface-dark border-b border-border-dark sticky top-0 z-40">
        <div className="flex items-center gap-2">
          <div className="bg-primary size-8 rounded-lg flex items-center justify-center">
            <span className="material-symbols-outlined text-white text-lg">rocket_launch</span>
          </div>
          <span className="text-white font-black text-sm tracking-tight">DarkFlow</span>
        </div>
        <button onClick={() => setIsMobileMenuOpen(true)} className="size-10 flex items-center justify-center rounded-xl bg-background-dark text-white border border-border-dark">
          <span className="material-symbols-outlined">menu</span>
        </button>
      </div>

      <aside className={`hidden lg:flex flex-col flex-shrink-0 sticky top-0 h-screen overflow-visible transition-all duration-300 z-50 ${isCollapsed ? 'w-20' : 'w-64'}`}>
        {SidebarContent(false)}
      </aside>

      <div className={`fixed inset-0 z-50 lg:hidden pointer-events-none ${isMobileMenuOpen ? 'pointer-events-auto' : ''}`}>
        <div className={`absolute inset-0 bg-black/80 backdrop-blur-md transition-opacity duration-500 ${isMobileMenuOpen ? 'opacity-100' : 'opacity-0'}`} onClick={closeMenu} />
        <div className={`absolute top-0 left-0 h-full transition-transform duration-500 shadow-2xl ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}`}>
          {SidebarContent(true)}
        </div>
      </div>
    </>
  );
};

export default Sidebar;

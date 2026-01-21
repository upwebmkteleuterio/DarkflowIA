
import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

interface SidebarProps {
  isCollapsed: boolean;
  onToggleCollapse: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ isCollapsed, onToggleCollapse }) => {
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { user, profile, signOut } = useAuth();

  const isActive = (path: string) => {
    if (path === '/' && location.pathname.startsWith('/projects')) return true;
    return location.pathname === path;
  };

  const navItems = [
    { name: 'Meus Projetos', icon: 'grid_view', path: '/', roles: ['free', 'pro', 'adm'] },
    { name: 'Trend Hunter', icon: 'radar', path: '/trends', roles: ['free', 'pro', 'adm'] },
    { name: 'Planos & Créditos', icon: 'auto_awesome_motion', path: '/plans', roles: ['free', 'pro', 'adm'] },
    { name: 'Configurações', icon: 'settings', path: '/settings', roles: ['free', 'pro', 'adm'] },
    { name: 'Gestão de Planos', icon: 'payments', path: '/admin/plans', roles: ['adm'] },
    { name: 'Tecnologia & Docs', icon: 'terminal', path: '/admin/tech-specs', roles: ['adm'] },
    { name: 'Calculadora API', icon: 'calculate', path: '/cost-estimator', roles: ['adm'] },
  ];

  const userRole = profile?.role || 'free';
  const filteredNavItems = navItems.filter(item => item.roles.includes(userRole));

  const closeMenu = () => setIsMobileMenuOpen(false);

  const handleLogout = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    await signOut();
  };

  const SidebarContent = (isMobile: boolean) => (
    <div className={`flex flex-col justify-between h-full bg-surface-dark border-r border-border-dark transition-all duration-300 relative overflow-y-auto custom-scrollbar ${isMobile ? 'w-72' : (isCollapsed ? 'w-20' : 'w-64')}`}>
      <div className="flex flex-col gap-8 p-4 md:p-6 shrink-0">
        <div className={`flex items-center gap-3 transition-all ${isCollapsed && !isMobile ? 'justify-center' : ''}`}>
          <div className="bg-primary size-10 rounded-xl flex-shrink-0 flex items-center justify-center shadow-lg shadow-primary/30">
            <span className="material-symbols-outlined text-white text-2xl">rocket_launch</span>
          </div>
          {(!isCollapsed || isMobile) && (
            <div className="flex flex-col overflow-hidden whitespace-nowrap animate-in fade-in duration-300">
              <h1 className="text-white text-lg font-black leading-tight tracking-tight">DarkFlow AI</h1>
              <p className="text-primary text-[10px] font-bold uppercase tracking-widest">
                {userRole === 'adm' ? 'Admin Panel' : 'Creator Suite'}
              </p>
            </div>
          )}
        </div>

        <nav className="flex flex-col gap-2">
          {filteredNavItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              onClick={closeMenu}
              className={`flex items-center gap-3 px-3 py-3 rounded-xl transition-all duration-200 group relative ${
                isActive(item.path)
                  ? 'bg-primary text-white shadow-lg shadow-primary/20'
                  : 'text-slate-400 hover:bg-white/5 hover:text-white'
              } ${isCollapsed && !isMobile ? 'justify-center' : ''}`}
            >
              <span className={`material-symbols-outlined flex-shrink-0 ${isActive(item.path) ? 'fill-1' : 'group-hover:scale-110 transition-transform'}`}>
                {item.icon}
              </span>
              {(!isCollapsed || isMobile) && <p className="text-sm font-bold whitespace-nowrap overflow-hidden animate-in fade-in duration-300">{item.name}</p>}
            </Link>
          ))}
        </nav>
      </div>

      <div className="flex flex-col gap-4 shrink-0 mt-auto">
        <div className={`p-4 md:p-6 flex flex-col gap-3 border-t border-border-dark bg-background-dark/30 ${isCollapsed && !isMobile ? 'items-center' : ''}`}>
          {(!isCollapsed || isMobile) ? (
            <div className="space-y-3">
              <div className="bg-gradient-to-br from-surface-dark to-card-dark border border-border-dark rounded-2xl p-4 shadow-inner">
                <div className="flex justify-between items-center mb-1">
                  <span className="text-[9px] font-black uppercase tracking-widest text-slate-500">Texto</span>
                  <span className="material-symbols-outlined text-xs text-primary">description</span>
                </div>
                <div className="flex items-baseline gap-1">
                  <p className="text-2xl font-black text-white leading-none">{profile?.text_credits ?? 0}</p>
                  <span className="text-[10px] font-bold text-slate-500">créditos</span>
                </div>
              </div>

              <div className="bg-gradient-to-br from-surface-dark to-card-dark border border-border-dark rounded-2xl p-4 shadow-inner">
                <div className="flex justify-between items-center mb-1">
                  <span className="text-[9px] font-black uppercase tracking-widest text-slate-500">Imagens</span>
                  <span className="material-symbols-outlined text-xs text-accent-green">image</span>
                </div>
                <div className="flex items-baseline gap-1">
                  <p className="text-2xl font-black text-white leading-none">{profile?.image_credits ?? 0}</p>
                  <span className="text-[10px] font-bold text-slate-500">créditos</span>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex flex-col gap-2">
              <div className="size-10 bg-primary/10 rounded-xl flex items-center justify-center text-primary font-black text-xs" title="Créditos de Texto">
                {profile?.text_credits ?? 0}
              </div>
              <div className="size-10 bg-accent-green/10 rounded-xl flex items-center justify-center text-accent-green font-black text-xs" title="Imagens">
                {profile?.image_credits ?? 0}
              </div>
            </div>
          )}
        </div>

        <div className={`p-4 md:p-6 border-t border-border-dark ${isCollapsed && !isMobile ? 'items-center' : ''}`}>
           {(!isCollapsed || isMobile) ? (
             <div className="flex items-center justify-between gap-3">
                <Link to="/settings" className="flex items-center gap-3 overflow-hidden flex-1 group">
                   <div className="size-8 rounded-full bg-slate-800 flex items-center justify-center text-primary font-black text-xs flex-shrink-0 border border-border-dark group-hover:border-primary/50 transition-colors">
                      {(profile?.display_name || user?.email)?.charAt(0).toUpperCase()}
                   </div>
                   <div className="flex flex-col overflow-hidden flex-1">
                      <p className="text-[10px] text-white font-black truncate leading-tight group-hover:text-primary transition-colors">{profile?.display_name || user?.email}</p>
                      <button 
                        onClick={handleLogout} 
                        className="text-left text-[9px] text-red-400 font-bold hover:underline uppercase tracking-tighter"
                      >
                        Sair da Conta
                      </button>
                   </div>
                </Link>
             </div>
           ) : (
             <button 
              onClick={handleLogout} 
              className="size-10 rounded-xl bg-red-500/10 text-red-500 flex items-center justify-center hover:bg-red-500 hover:text-white transition-all"
              title="Sair"
             >
                <span className="material-symbols-outlined text-lg">logout</span>
             </button>
           )}
        </div>
      </div>
    </div>
  );

  return (
    <>
      <div className="lg:hidden w-full h-16 bg-surface-dark border-b border-border-dark flex items-center justify-between px-4 shrink-0 z-[50] relative">
        <div className="flex items-center gap-3">
          <div className="bg-primary size-9 rounded-xl flex items-center justify-center shadow-lg shadow-primary/20">
            <span className="material-symbols-outlined text-white text-xl">rocket_launch</span>
          </div>
          <span className="text-white font-black text-lg tracking-tight font-display italic">DarkFlow</span>
        </div>
        <button 
          onClick={() => setIsMobileMenuOpen(true)} 
          className="size-11 flex items-center justify-center rounded-xl bg-background-dark text-white border border-border-dark active:scale-95 transition-all"
        >
          <span className="material-symbols-outlined">menu</span>
        </button>
      </div>

      <aside className={`hidden lg:flex flex-col flex-shrink-0 h-screen sticky top-0 overflow-visible transition-all duration-300 z-[60] ${isCollapsed ? 'w-20' : 'w-64'}`}>
        {SidebarContent(false)}
      </aside>

      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-[100] lg:hidden flex">
          <div className="absolute inset-0 bg-black/80 backdrop-blur-md transition-opacity duration-500" onClick={closeMenu} />
          <div className="relative h-full animate-in slide-in-from-left duration-300 shadow-2xl">
            {SidebarContent(true)}
          </div>
          <button 
            onClick={closeMenu}
            className="absolute top-4 right-4 size-10 flex items-center justify-center bg-white/10 rounded-full text-white backdrop-blur-md"
          >
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>
      )}
    </>
  );
};

export default Sidebar;

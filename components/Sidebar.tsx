import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import SidebarCredits from './SidebarCredits';

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
    { name: 'Meus Roteiros', icon: 'grid_view', path: '/', roles: ['free', 'pro', 'adm'] },
    { name: 'VEO 3 Script', icon: 'movie_edit', path: '/veo-script', roles: ['adm'] },
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
    <div className={`flex flex-col justify-between h-full bg-surface-dark border-r border-border-dark transition-all duration-500 relative overflow-y-auto custom-scrollbar ${isMobile ? 'w-72' : (isCollapsed ? 'w-20' : 'w-64')}`}>
      <div className="flex flex-col gap-8 p-4 md:p-6 shrink-0">
        <div className={`flex items-center gap-3 transition-all ${isCollapsed && !isMobile ? 'justify-center' : ''}`}>
          <div className="bg-primary size-10 rounded-xl flex-shrink-0 flex items-center justify-center shadow-lg shadow-primary/30">
            <span className="material-symbols-outlined text-white text-2xl">rocket_launch</span>
          </div>
          {(!isCollapsed || isMobile) && (
            <div className="flex flex-col overflow-hidden whitespace-nowrap animate-in fade-in slide-in-from-left-2 duration-500">
              <h1 className="text-white text-lg font-black leading-tight tracking-tight italic">DarkFlow AI</h1>
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
              className={`flex items-center gap-3 px-3 py-3 rounded-xl transition-all duration-300 group relative ${
                isActive(item.path)
                  ? 'bg-primary text-white shadow-lg shadow-primary/20'
                  : 'text-slate-400 hover:bg-white/5 hover:text-white'
              } ${isCollapsed && !isMobile ? 'justify-center' : ''}`}
            >
              <span className={`material-symbols-outlined flex-shrink-0 ${isActive(item.path) ? 'fill-1 scale-110' : 'group-hover:scale-110 transition-transform duration-300'}`}>
                {item.icon}
              </span>
              {(!isCollapsed || isMobile) && <p className="text-sm font-bold whitespace-nowrap overflow-hidden animate-in fade-in duration-500">{item.name}</p>}
            </Link>
          ))}
        </nav>
      </div>

      <SidebarCredits 
        isCollapsed={isCollapsed} 
        isMobile={isMobile} 
        profile={profile} 
        user={user} 
        handleLogout={handleLogout} 
      />
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
          className="size-11 flex items-center justify-center rounded-xl bg-background-dark text-white border border-border-dark active:scale-95 transition-all shadow-lg"
        >
          <span className="material-symbols-outlined">menu</span>
        </button>
      </div>

      <aside className={`hidden lg:flex flex-col flex-shrink-0 h-screen sticky top-0 overflow-visible transition-all duration-500 z-[60] ${isCollapsed ? 'w-20' : 'w-64'}`}>
        {SidebarContent(false)}
      </aside>

      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-[100] lg:hidden flex overflow-hidden">
          <div 
            className="absolute inset-0 bg-black/80 backdrop-blur-sm transition-opacity duration-700 animate-in fade-in" 
            onClick={closeMenu} 
          />
          <div className="relative h-full shadow-2xl animate-in slide-in-from-left duration-500 ease-out fill-mode-forwards">
            {SidebarContent(true)}
          </div>
        </div>
      )}
    </>
  );
};

export default Sidebar;
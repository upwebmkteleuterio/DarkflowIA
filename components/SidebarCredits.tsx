
import React from 'react';
import { Link } from 'react-router-dom';

interface SidebarCreditsProps {
  isCollapsed: boolean;
  isMobile: boolean;
  profile: any;
  user: any;
  handleLogout: (e: React.MouseEvent) => void;
}

const SidebarCredits: React.FC<SidebarCreditsProps> = ({ 
  isCollapsed, 
  isMobile, 
  profile, 
  user, 
  handleLogout 
}) => {
  const showFull = !isCollapsed || isMobile;

  // Cálculos de porcentagem baseados no plano
  const textTotal = profile?.plans?.text_credits || 1;
  const imageTotal = profile?.plans?.image_credits || 1;
  
  const textPercent = Math.min(100, Math.max(0, ((profile?.text_credits || 0) / textTotal) * 100));
  const imagePercent = Math.min(100, Math.max(0, ((profile?.image_credits || 0) / imageTotal) * 100));

  return (
    <div className="flex flex-col gap-4 shrink-0 mt-auto">
      {/* Painel de Créditos */}
      <div className={`p-4 md:p-6 flex flex-col gap-3 border-t border-border-dark bg-background-dark/30 ${!showFull ? 'items-center' : ''}`}>
        {showFull ? (
          <div className="space-y-4 animate-in fade-in zoom-in-95 duration-500">
            {/* Créditos de Texto */}
            <div className="bg-gradient-to-br from-surface-dark to-card-dark border border-border-dark rounded-2xl p-4 shadow-inner group/credit">
              <div className="flex justify-between items-center mb-1">
                <span className="text-[9px] font-black uppercase tracking-widest text-slate-500">Texto</span>
                <span className="material-symbols-outlined text-xs text-primary group-hover/credit:rotate-12 transition-transform">description</span>
              </div>
              <div className="flex items-baseline gap-1 mb-3">
                <p className="text-2xl font-black text-white leading-none">{profile?.text_credits ?? 0}</p>
                <span className="text-[10px] font-bold text-slate-500">/ {textTotal}</span>
              </div>
              {/* Barra de Progresso Texto */}
              <div className="h-1.5 w-full bg-background-dark rounded-full overflow-hidden border border-border-dark/50">
                <div 
                  className="h-full bg-primary transition-all duration-1000 ease-out shadow-[0_0_8px_rgba(134,85,246,0.4)]"
                  style={{ width: `${textPercent}%` }}
                />
              </div>
            </div>

            {/* Créditos de Imagem */}
            <div className="bg-gradient-to-br from-surface-dark to-card-dark border border-border-dark rounded-2xl p-4 shadow-inner group/credit">
              <div className="flex justify-between items-center mb-1">
                <span className="text-[9px] font-black uppercase tracking-widest text-slate-500">Imagens</span>
                <span className="material-symbols-outlined text-xs text-accent-green group-hover/credit:rotate-12 transition-transform">image</span>
              </div>
              <div className="flex items-baseline gap-1 mb-3">
                <p className="text-2xl font-black text-white leading-none">{profile?.image_credits ?? 0}</p>
                <span className="text-[10px] font-bold text-slate-500">/ {imageTotal}</span>
              </div>
              {/* Barra de Progresso Imagem */}
              <div className="h-1.5 w-full bg-background-dark rounded-full overflow-hidden border border-border-dark/50">
                <div 
                  className="h-full bg-accent-green transition-all duration-1000 ease-out shadow-[0_0_8px_rgba(57,255,20,0.4)]"
                  style={{ width: `${imagePercent}%` }}
                />
              </div>
            </div>
          </div>
        ) : (
          <div className="flex flex-col gap-3 animate-in fade-in duration-300">
            {/* Versão Compacta com barra lateral sutil */}
            <div className="relative group/mini">
              <div className="size-10 bg-primary/10 rounded-xl flex items-center justify-center text-primary font-black text-xs border border-primary/20" title={`Texto: ${profile?.text_credits}/${textTotal}`}>
                {profile?.text_credits ?? 0}
              </div>
              <div className="absolute -bottom-1 left-0 right-0 h-1 bg-background-dark rounded-full overflow-hidden">
                 <div className="h-full bg-primary" style={{ width: `${textPercent}%` }} />
              </div>
            </div>
            
            <div className="relative group/mini">
              <div className="size-10 bg-accent-green/10 rounded-xl flex items-center justify-center text-accent-green font-black text-xs border border-accent-green/20" title={`Imagens: ${profile?.image_credits}/${imageTotal}`}>
                {profile?.image_credits ?? 0}
              </div>
              <div className="absolute -bottom-1 left-0 right-0 h-1 bg-background-dark rounded-full overflow-hidden">
                 <div className="h-full bg-accent-green" style={{ width: `${imagePercent}%` }} />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Seção de Perfil e Sair */}
      <div className={`p-4 md:p-6 border-t border-border-dark ${!showFull ? 'items-center' : ''}`}>
         {showFull ? (
           <div className="flex items-center justify-between gap-3 animate-in fade-in duration-500">
              <Link to="/settings" className="flex items-center gap-3 overflow-hidden flex-1 group">
                 <div className="size-8 rounded-full bg-slate-800 flex items-center justify-center text-primary font-black text-xs flex-shrink-0 border border-border-dark group-hover:border-primary/50 transition-colors">
                    {(profile?.display_name || user?.email)?.charAt(0).toUpperCase()}
                 </div>
                 <div className="flex flex-col overflow-hidden flex-1">
                    <p className="text-[10px] text-white font-black truncate leading-tight group-hover:text-primary transition-colors">
                      {profile?.display_name || user?.email?.split('@')[0]}
                    </p>
                    <button 
                      onClick={handleLogout} 
                      className="text-left text-[9px] text-red-400 font-bold hover:text-red-300 hover:underline uppercase tracking-tighter"
                    >
                      Encerrar Sessão
                    </button>
                 </div>
              </Link>
           </div>
         ) : (
           <button 
            onClick={handleLogout} 
            className="size-10 rounded-xl bg-red-500/10 text-red-500 flex items-center justify-center hover:bg-red-500 hover:text-white transition-all shadow-lg shadow-red-500/5"
            title="Sair"
           >
              <span className="material-symbols-outlined text-lg">logout</span>
           </button>
         )}
      </div>
    </div>
  );
};

export default SidebarCredits;

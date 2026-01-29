
import React from 'react';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'primary' | 'success' | 'warning' | 'error' | 'neutral' | 'outline';
  pulse?: boolean;
  className?: string;
}

const Badge: React.FC<BadgeProps> = ({ 
  children, 
  variant = 'neutral', 
  pulse = false,
  className = ''
}) => {
  const baseStyles = "inline-flex items-center px-2.5 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border";
  
  const variants = {
    primary: "bg-primary/10 text-primary border-primary/20",
    success: "bg-accent-green/10 text-accent-green border-accent-green/20",
    warning: "bg-yellow-500/10 text-yellow-500 border-yellow-500/20",
    error: "bg-red-500/10 text-red-500 border-red-500/20",
    neutral: "bg-white/5 text-slate-500 border-white/10",
    // Added outline variant to support local branding overrides via className
    outline: "bg-transparent border-white/10 text-white"
  };

  const pulseColor = {
    primary: "bg-primary",
    success: "bg-accent-green",
    warning: "bg-yellow-500",
    error: "bg-red-500",
    neutral: "bg-slate-500",
    outline: "bg-white"
  };

  return (
    <span className={`${baseStyles} ${variants[variant]} ${className}`}>
      {pulse && (
        <span className="relative flex h-2 w-2 mr-1.5">
          <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${pulseColor[variant]}`}></span>
          <span className={`relative inline-flex rounded-full h-2 w-2 ${pulseColor[variant]}`}></span>
        </span>
      )}
      {children}
    </span>
  );
};

export default Badge;

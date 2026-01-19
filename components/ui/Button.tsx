
import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'outline' | 'ghost' | 'danger' | 'white';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  loading?: boolean;
  icon?: string;
  fullWidth?: boolean;
}

const Button: React.FC<ButtonProps> = ({ 
  children, 
  variant = 'primary', 
  size = 'md', 
  loading, 
  icon, 
  fullWidth,
  className = '',
  disabled,
  ...props 
}) => {
  const baseStyles = "inline-flex items-center justify-center font-bold transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed gap-2 rounded-xl";
  
  const variants = {
    primary: "bg-primary hover:bg-primary-hover text-white shadow-lg shadow-primary/20",
    outline: "bg-transparent border border-border-dark text-slate-400 hover:text-white hover:bg-white/5",
    ghost: "bg-transparent text-slate-400 hover:text-white hover:bg-white/5",
    danger: "bg-red-500/10 border border-red-500/20 text-red-500 hover:bg-red-500 hover:text-white",
    white: "bg-white text-black hover:bg-slate-200 shadow-xl"
  };

  const sizes = {
    sm: "px-3 py-1.5 text-[10px] uppercase tracking-widest",
    md: "px-5 py-2.5 text-xs uppercase tracking-widest",
    lg: "px-8 py-3.5 text-sm uppercase tracking-widest",
    xl: "px-10 py-4 text-sm uppercase tracking-[0.2em]"
  };

  return (
    <button 
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${fullWidth ? 'w-full' : ''} ${className}`}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? (
        <span className="material-symbols-outlined animate-spin text-[1.2em]">sync</span>
      ) : icon ? (
        <span className="material-symbols-outlined text-[1.2em]">{icon}</span>
      ) : null}
      {children}
    </button>
  );
};

export default Button;

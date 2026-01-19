
import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  icon?: string;
}

export const Input: React.FC<InputProps> = ({ label, error, icon, className = '', ...props }) => {
  return (
    <div className="flex flex-col gap-2 w-full">
      {label && <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">{label}</label>}
      <div className="relative group">
        {icon && (
          <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-primary transition-colors">
            {icon}
          </span>
        )}
        <input 
          className={`w-full bg-background-dark/50 border border-border-dark rounded-xl py-3.5 px-4 text-sm text-white focus:ring-2 focus:ring-primary outline-none transition-all placeholder:text-slate-600 ${icon ? 'pl-12' : ''} ${error ? 'border-red-500' : ''} ${className}`}
          {...props}
        />
      </div>
      {error && <span className="text-[10px] font-bold text-red-500 mt-1 ml-1">{error}</span>}
    </div>
  );
};

interface TextAreaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
}

export const TextArea: React.FC<TextAreaProps> = ({ label, error, className = '', ...props }) => {
  const isFullHeight = className.includes('h-full');
  
  return (
    <div className={`flex flex-col gap-2 w-full ${isFullHeight ? 'h-full' : ''}`}>
      {label && <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">{label}</label>}
      <textarea 
        className={`w-full bg-background-dark/50 border border-border-dark rounded-xl py-4 px-4 text-sm text-white focus:ring-2 focus:ring-primary outline-none transition-all placeholder:text-slate-600 resize-none ${isFullHeight ? 'flex-1' : ''} ${error ? 'border-red-500' : ''} ${className}`}
        {...props}
      />
      {error && <span className="text-[10px] font-bold text-red-500 mt-1 ml-1">{error}</span>}
    </div>
  );
};

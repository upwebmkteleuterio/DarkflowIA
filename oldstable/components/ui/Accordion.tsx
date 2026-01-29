
import React, { useState } from 'react';

interface AccordionProps {
  children: React.ReactNode;
  type?: 'single' | 'multiple';
  collapsible?: boolean;
  className?: string;
}

export const Accordion: React.FC<AccordionProps> = ({ children, className = '' }) => {
  return <div className={`w-full space-y-2 ${className}`}>{children}</div>;
};

export const AccordionItem: React.FC<{ value: string; children: React.ReactNode; className?: string }> = ({ children, className = '' }) => {
  return <div className={`border-b border-white/10 ${className}`}>{children}</div>;
};

export const AccordionTrigger: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className = '' }) => {
  const [isOpen, setIsOpen] = useState(false);
  
  // Nota: Para simplificar sem context, o trigger apenas alterna a visibilidade do próximo elemento irmão (Content)
  // em um cenário real usaríamos um Context API, mas aqui faremos uma versão funcional simples.
  return (
    <button 
      onClick={(e) => {
        const content = e.currentTarget.nextElementSibling as HTMLElement;
        const icon = e.currentTarget.querySelector('.acc-icon') as HTMLElement;
        if (content) {
          const isHidden = content.classList.contains('hidden');
          content.classList.toggle('hidden');
          if (icon) icon.style.transform = isHidden ? 'rotate(180deg)' : 'rotate(0deg)';
        }
      }}
      className={`w-full py-4 flex items-center justify-between text-left font-medium transition-all hover:underline ${className}`}
    >
      {children}
      <span className="material-symbols-outlined acc-icon transition-transform duration-200">expand_more</span>
    </button>
  );
};

export const AccordionContent: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className = '' }) => {
  return (
    <div className={`hidden pb-4 pt-0 text-slate-400 animate-in slide-in-from-top-1 duration-200 ${className}`}>
      {children}
    </div>
  );
};


import React from 'react';
import Button from './Button';

interface AdvanceButtonProps {
  onClick: () => void;
  label: string;
  isVisible: boolean;
}

const AdvanceButton: React.FC<AdvanceButtonProps> = ({ onClick, label, isVisible }) => {
  if (!isVisible) return null;

  return (
    <div className="mt-6 pt-6 border-t border-border-dark flex justify-end">
      <Button 
        onClick={onClick} 
        variant="white" 
        icon="arrow_forward" 
        size="lg"
        className="px-10 shadow-[0_10px_30px_rgba(255,255,255,0.1)]"
      >
        {label}
      </Button>
    </div>
  );
};

export default AdvanceButton;

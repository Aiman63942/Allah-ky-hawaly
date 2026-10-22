import React from 'react';
import { ArrowLeft } from 'lucide-react';

interface BackButtonProps {
  onClick: () => void;
  label?: string;
  className?: string;
  variant?: 'subtle' | 'pill' | 'outline';
}

export const BackButton: React.FC<BackButtonProps> = ({
  onClick,
  label = 'Back',
  className = '',
  variant = 'subtle'
}) => {
  const baseStyles = 'inline-flex items-center space-x-2 text-xs font-semibold transition-all cursor-pointer select-none focus:outline-none focus:ring-2 focus:ring-[#0A3D24]/30 rounded-xl';

  const variants = {
    subtle: 'text-[#54665C] hover:text-[#0A3D24] hover:bg-[#E1EBE4]/40 px-3 py-1.5',
    pill: 'bg-white hover:bg-[#F0FDF4] text-[#0A3D24] border border-[#E1EBE4] shadow-2xs px-3.5 py-1.5',
    outline: 'border border-[#E1EBE4] text-[#112217] hover:bg-slate-50 px-3 py-1.5'
  };

  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={`Go back to ${label}`}
      className={`${baseStyles} ${variants[variant]} ${className}`}
    >
      <ArrowLeft className="w-4 h-4 text-[#0A3D24] shrink-0" aria-hidden="true" />
      <span>{label}</span>
    </button>
  );
};

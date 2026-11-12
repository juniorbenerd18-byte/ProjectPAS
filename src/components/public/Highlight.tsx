import React from 'react';

interface HighlightProps {
  children: React.ReactNode;
  className?: string;
}

export const Highlight: React.FC<HighlightProps> = ({ children, className = '' }) => {
  return (
    <span
      className={`relative inline-block text-[#1F3A5F] px-2 py-0.5 mx-0.5 rounded-md bg-[#FBEBC8] border border-[#F2B544]/50 font-extrabold shadow-2xs ${className}`}
    >
      {children}
    </span>
  );
};


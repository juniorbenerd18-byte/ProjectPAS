import React from 'react';

interface HighlightProps {
  children: React.ReactNode;
  className?: string;
}

export const Highlight: React.FC<HighlightProps> = ({ children, className = '' }) => {
  return (
    <span className={`highlight-stabilo ${className}`}>
      {children}
    </span>
  );
};

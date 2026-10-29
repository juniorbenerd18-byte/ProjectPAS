import React, { useEffect } from 'react';
import { X } from 'lucide-react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl';
}

export const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  subtitle,
  children,
  maxWidth = 'lg',
}) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const maxWidthClass = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl',
    '2xl': 'max-w-2xl',
    '3xl': 'max-w-3xl',
  }[maxWidth];

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-[#0E1B2C]/40 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />

      <div className="flex min-h-full items-center justify-center p-4 text-center sm:p-0">
        <div
          className={`relative transform overflow-hidden rounded-[20px] bg-[#FFFDF8] dark:bg-[#17293E] text-left transition-all w-full ${maxWidthClass} border border-[#E6DFD0] dark:border-[#283D56] shadow-none my-8`}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between border-b border-[#E6DFD0] dark:border-[#283D56] px-6 py-4">
            <div>
              <h3 className="text-base sm:text-lg font-extrabold text-[#1F3A5F] dark:text-[#FAF6EE]">{title}</h3>
              {subtitle && <p className="text-[14px] text-[#5A6472] dark:text-[#9AA8B8] mt-0.5">{subtitle}</p>}
            </div>
            <button
              onClick={onClose}
              className="min-h-[44px] min-w-[44px] flex items-center justify-center rounded-[12px] p-2 text-[#5A6472] dark:text-[#9AA8B8] hover:bg-[#E4EAF2] dark:hover:bg-[#213B5C] hover:text-[#1F3A5F] dark:hover:text-[#FAF6EE] transition-colors cursor-pointer"
              aria-label="Tutup dialog"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Body */}
          <div className="px-6 py-5 max-h-[75vh] overflow-y-auto text-[#1F3A5F] dark:text-[#FAF6EE] text-[15px]">{children}</div>
        </div>
      </div>
    </div>
  );
};

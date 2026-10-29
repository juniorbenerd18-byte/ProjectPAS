import React from 'react';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const Toast: React.FC = () => {
  const { toast } = useApp();

  if (!toast) return null;

  const icons = {
    success: <CheckCircle2 className="w-5 h-5 text-[#1F3A5F] dark:text-[#F2B544] shrink-0" />,
    error: <AlertCircle className="w-5 h-5 text-[#F2B544] shrink-0" />,
    info: <Info className="w-5 h-5 text-[#1F3A5F] dark:text-[#E4EAF2] shrink-0" />,
  };

  const toastStyles = {
    success: 'border-[#E6DFD0] dark:border-[#283D56] bg-[#FFFDF8] dark:bg-[#17293E] text-[#1F3A5F] dark:text-[#FAF6EE]',
    error: 'border-[#F2B544] bg-[#FFFDF8] dark:bg-[#17293E] text-[#1F3A5F] dark:text-[#FAF6EE]',
    info: 'border-[#E6DFD0] dark:border-[#283D56] bg-[#FFFDF8] dark:bg-[#17293E] text-[#1F3A5F] dark:text-[#FAF6EE]',
  };

  return (
    <div
      role="status"
      className={`fixed bottom-5 right-5 z-50 flex items-center gap-3 px-4 py-3 rounded-[14px] border transition-all duration-300 animate-in slide-in-from-bottom-5 max-w-md ${toastStyles[toast.type]}`}
    >
      {icons[toast.type]}
      <p className="text-[14px] font-bold">{toast.message}</p>
    </div>
  );
};

import React from 'react';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const Toast: React.FC = () => {
  const { toasts, dismissToast, toast } = useApp();

  const activeToasts = toasts && toasts.length > 0 ? toasts : toast ? [{ id: 'single', ...toast }] : [];
  if (activeToasts.length === 0) return null;

  const icons = {
    success: <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0" />,
    error: <AlertCircle className="w-5 h-5 text-amber-500 shrink-0" />,
    info: <Info className="w-5 h-5 text-[#1F3A5F] dark:text-[#E4EAF2] shrink-0" />,
  };

  const toastStyles = {
    success: 'border-emerald-200 dark:border-emerald-800/60 bg-[#FFFDF8] dark:bg-[#17293E] text-[#1F3A5F] dark:text-[#FAF6EE] shadow-lg',
    error: 'border-amber-400/80 bg-[#FFFDF8] dark:bg-[#17293E] text-[#1F3A5F] dark:text-[#FAF6EE] shadow-xl',
    info: 'border-[#E6DFD0] dark:border-[#283D56] bg-[#FFFDF8] dark:bg-[#17293E] text-[#1F3A5F] dark:text-[#FAF6EE] shadow-md',
  };

  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2.5 max-w-md pointer-events-none">
      {activeToasts.map((item) => (
        <div
          key={item.id}
          role="status"
          className={`pointer-events-auto flex items-center justify-between gap-3 px-4 py-3 rounded-[14px] border transition-all duration-300 animate-in slide-in-from-bottom-5 ${toastStyles[item.type]}`}
        >
          <div className="flex items-center gap-3">
            {icons[item.type]}
            <p className="text-[13px] sm:text-[14px] font-bold leading-snug">{item.message}</p>
          </div>
          {dismissToast && (
            <button
              type="button"
              onClick={() => dismissToast(item.id)}
              className="p-1 text-[#5A6472] dark:text-[#9AA8B8] hover:text-[#1F3A5F] dark:hover:text-[#FAF6EE] rounded-lg cursor-pointer shrink-0 transition-colors"
              title="Tutup pemberitahuan"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      ))}
    </div>
  );
};

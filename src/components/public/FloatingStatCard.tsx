import React from 'react';

interface FloatingStatCardProps {
  icon?: React.ReactNode;
  title: string;
  value: string | number;
  subtitle?: string;
  progressPercent?: number;
  className?: string;
}

export const FloatingStatCard: React.FC<FloatingStatCardProps> = ({
  icon,
  title,
  value,
  subtitle,
  progressPercent,
  className = '',
}) => {
  return (
    <div
      className={`bg-[#FFFDF8] border border-[#E6DFD0] rounded-xl p-3 sm:p-4 shadow-sm backdrop-blur-sm ${className}`}
    >
      <div className="flex items-center gap-3">
        {icon && (
          <div className="w-9 h-9 rounded-lg bg-[#E4EAF2] text-[#1F3A5F] flex items-center justify-center shrink-0">
            {icon}
          </div>
        )}
        <div className="min-w-0 flex-1">
          <p className="text-xs font-medium text-[#5A6472] truncate">{title}</p>
          <p className="text-base sm:text-lg font-bold text-[#1F3A5F] leading-tight">
            {value}
          </p>
          {subtitle && (
            <p className="text-[11px] text-[#5A6472] mt-0.5">{subtitle}</p>
          )}
        </div>
      </div>

      {typeof progressPercent === 'number' && (
        <div className="mt-2.5 pt-2 border-t border-[#E6DFD0]/70">
          <div className="flex items-center justify-between text-[11px] text-[#5A6472] mb-1">
            <span>Rata-rata</span>
            <span className="font-semibold text-[#1F3A5F]">{progressPercent}%</span>
          </div>
          <div className="w-full bg-[#E4EAF2] rounded-full h-1.5 overflow-hidden">
            <div
              className="bg-[#F2B544] h-1.5 rounded-full transition-all duration-500"
              style={{ width: `${Math.min(100, Math.max(0, progressPercent))}%` }}
            />
          </div>
        </div>
      )}
    </div>
  );
};

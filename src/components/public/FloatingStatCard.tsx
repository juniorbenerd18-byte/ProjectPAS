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
      className={`bg-white border border-[#E2E8F0] rounded-xl p-3 sm:p-4 shadow-sm backdrop-blur-sm ${className}`}
    >
      <div className="flex items-center gap-3">
        {icon && (
          <div className="w-9 h-9 rounded-lg bg-[#EFF6FF] text-[#2563EB] flex items-center justify-center shrink-0">
            {icon}
          </div>
        )}
        <div className="min-w-0 flex-1">
          <p className="text-xs font-medium text-[#64748B] truncate">{title}</p>
          <p className="text-base sm:text-lg font-bold text-[#0F172A] leading-tight">
            {value}
          </p>
          {subtitle && (
            <p className="text-[11px] text-[#64748B] mt-0.5">{subtitle}</p>
          )}
        </div>
      </div>

      {typeof progressPercent === 'number' && (
        <div className="mt-2.5 pt-2 border-t border-[#E2E8F0]/70">
          <div className="flex items-center justify-between text-[11px] text-[#64748B] mb-1">
            <span>Rata-rata</span>
            <span className="font-semibold text-[#2563EB]">{progressPercent}%</span>
          </div>
          <div className="w-full bg-[#EFF6FF] rounded-full h-1.5 overflow-hidden">
            <div
              className="bg-[#2563EB] h-1.5 rounded-full transition-all duration-500"
              style={{ width: `${Math.min(100, Math.max(0, progressPercent))}%` }}
            />
          </div>
        </div>
      )}
    </div>
  );
};

import React, { useEffect, useState, useRef } from 'react';
import {
  Layers,
  CheckCircle,
  Camera,
  Users,
  TrendingUp,
  Percent,
} from 'lucide-react';
import { PortalStats as PortalStatsType } from '../../data/portalData';

interface PortalStatsProps {
  stats: PortalStatsType;
}

// Custom animated count-up number component with IntersectionObserver
const CountUpNumber: React.FC<{ end: number; duration?: number; suffix?: string }> = ({
  end,
  duration = 1600,
  suffix = '',
}) => {
  const [count, setCount] = useState(0);
  const [hasAnimated, setHasAnimated] = useState(false);
  const elementRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasAnimated) {
          setHasAnimated(true);
        }
      },
      { threshold: 0.2 }
    );

    if (elementRef.current) {
      observer.observe(elementRef.current);
    }

    return () => observer.disconnect();
  }, [hasAnimated]);

  useEffect(() => {
    if (!hasAnimated) return;

    let startTime: number | null = null;
    let animationFrameId: number;

    const animate = (currentTime: number) => {
      if (!startTime) startTime = currentTime;
      const progress = Math.min((currentTime - startTime) / duration, 1);
      // easeOutExpo
      const easeOut = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
      const currentVal = Math.floor(easeOut * end);

      setCount(currentVal);

      if (progress < 1) {
        animationFrameId = requestAnimationFrame(animate);
      } else {
        setCount(end);
      }
    };

    animationFrameId = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animationFrameId);
  }, [hasAnimated, end, duration]);

  return (
    <span ref={elementRef} className="tabular-nums">
      {count}
      {suffix}
    </span>
  );
};

export const PortalStats: React.FC<PortalStatsProps> = ({ stats }) => {
  const statCards = [
    {
      id: 'total-proker',
      label: 'Total Program Kerja',
      value: stats.totalProker,
      suffix: '',
      subtext: `${stats.prokerBerjalan} program sedang berjalan`,
      icon: Layers,
      color: 'blue',
      gradient: 'from-blue-600 to-indigo-600',
      bgLight: 'bg-blue-50 dark:bg-blue-950/50',
      textAccent: 'text-blue-600 dark:text-blue-400',
      borderLight: 'border-blue-100 dark:border-blue-900/60',
    },
    {
      id: 'proker-selesai',
      label: 'Program Terealisasi',
      value: stats.prokerSelesai,
      suffix: '',
      subtext: `${Math.round((stats.prokerSelesai / stats.totalProker) * 100)}% dari target tahunan`,
      icon: CheckCircle,
      color: 'emerald',
      gradient: 'from-emerald-500 to-teal-600',
      bgLight: 'bg-emerald-50 dark:bg-emerald-950/50',
      textAccent: 'text-emerald-600 dark:text-emerald-400',
      borderLight: 'border-emerald-100 dark:border-emerald-900/60',
    },
    {
      id: 'total-dokumentasi',
      label: 'Arsip Dokumentasi',
      value: stats.totalDokumentasi,
      suffix: '+',
      subtext: 'Foto kegiatan resolusi tinggi',
      icon: Camera,
      color: 'amber',
      gradient: 'from-amber-500 to-orange-600',
      bgLight: 'bg-amber-50 dark:bg-amber-950/50',
      textAccent: 'text-amber-600 dark:text-amber-400',
      borderLight: 'border-amber-100 dark:border-amber-900/60',
    },
    {
      id: 'total-anggota',
      label: 'Pengurus & Relawan',
      value: stats.totalAnggota,
      suffix: ' Siswa',
      subtext: '6 Sekbid aktif terkoordinasi',
      icon: Users,
      color: 'violet',
      gradient: 'from-violet-600 to-purple-600',
      bgLight: 'bg-violet-50 dark:bg-violet-950/50',
      textAccent: 'text-violet-600 dark:text-violet-400',
      borderLight: 'border-violet-100 dark:border-violet-900/60',
    },
  ];

  return (
    <section className="relative -mt-6 sm:-mt-10 mb-16 z-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {statCards.map((card) => {
            const Icon = card.icon;
            return (
              <div
                key={card.id}
                className="group relative bg-white/95 dark:bg-slate-900/90 rounded-2xl p-5 sm:p-6 border border-slate-200/80 dark:border-slate-800 shadow-lg shadow-slate-200/50 dark:shadow-slate-950/50 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 backdrop-blur-md overflow-hidden"
              >
                {/* Subtle top indicator bar */}
                <div
                  className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${card.gradient} opacity-80 group-hover:opacity-100 transition-opacity`}
                />

                <div className="flex items-start justify-between gap-4">
                  <div className="space-y-1">
                    <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                      {card.label}
                    </p>
                    <div className="font-heading text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
                      <CountUpNumber end={card.value} suffix={card.suffix} />
                    </div>
                  </div>

                  <div
                    className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 ${card.bgLight} ${card.textAccent} border ${card.borderLight} group-hover:scale-110 transition-transform duration-300`}
                  >
                    <Icon className="w-5 h-5" />
                  </div>
                </div>

                <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                  <span className="line-clamp-1">{card.subtext}</span>
                  <span className="font-bold text-[11px] text-slate-400 group-hover:text-blue-500 transition-colors">
                    Transparan
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

import React, { useEffect, useState, useRef } from 'react';
import {
  Users,
  Award,
  Calendar,
  TrendingUp,
  Camera,
  Layers,
} from 'lucide-react';
import { PortalStats as PortalStatsType } from '../../data/portalData';

interface PortalStatsProps {
  stats: PortalStatsType;
}

// Custom animated count-up number component with IntersectionObserver
const CountUpNumber: React.FC<{ end: number; duration?: number; suffix?: string }> = ({
  end,
  duration = 1400,
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
      id: 'divisi',
      label: 'Divisi & Sekbid Aktif',
      value: 6,
      suffix: ' Sekbid',
      subtext: 'BPH & 5 Sekbid fungsional terkoordinasi',
      icon: Users,
      badge: 'Struktur',
    },
    {
      id: 'anggota',
      label: 'Pengurus OSIS',
      value: stats.totalAnggota,
      suffix: ' Siswa',
      subtext: 'Fungsionaris kepengurusan aktif 2025/2026',
      icon: Award,
      badge: 'Relawan',
    },
    {
      id: 'proker',
      label: 'Program Kerja',
      value: stats.totalProker,
      suffix: ' Agenda',
      subtext: `${stats.prokerSelesai} tuntas, ${stats.prokerBerjalan} sedang berjalan`,
      icon: Calendar,
      badge: 'Kegiatan',
    },
    {
      id: 'realisasi',
      label: 'Tingkat Realisasi',
      value: stats.realisasiAnggaranPersen,
      suffix: '%',
      subtext: 'Akuntabilitas terverifikasi pembina sekolah',
      icon: TrendingUp,
      badge: 'Transparan',
    },
  ];

  return (
    <section className="relative z-20 py-10 sm:py-12 bg-white dark:bg-[#0a0f0d] border-y border-slate-200/80 dark:border-slate-800 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {statCards.map((card) => {
            const Icon = card.icon;
            return (
              <div
                key={card.id}
                className="group relative bg-slate-50/80 dark:bg-[#121915] rounded-2xl p-5 sm:p-6 border border-slate-200/80 dark:border-emerald-950/60 shadow-xs hover:border-emerald-600/40 dark:hover:border-emerald-500/40 hover:shadow-md transition-all duration-300 flex flex-col justify-between"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="space-y-1">
                    <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                      {card.label}
                    </p>
                    <div className="font-heading text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                      <CountUpNumber end={card.value} suffix={card.suffix} />
                    </div>
                  </div>
                  <div className="w-11 h-11 rounded-2xl bg-emerald-50 dark:bg-emerald-950/70 border border-emerald-200/50 dark:border-emerald-800/50 text-emerald-700 dark:text-emerald-400 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform duration-300">
                    <Icon className="w-5 h-5" />
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-200/60 dark:border-slate-800/80 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                  <span className="line-clamp-1">{card.subtext}</span>
                  <span className="font-semibold text-[10px] px-2 py-0.5 rounded-md bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-800">
                    {card.badge}
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

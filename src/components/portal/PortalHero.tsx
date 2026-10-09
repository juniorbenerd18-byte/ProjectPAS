import React from 'react';
import {
  ArrowRight,
  Camera,
  CheckCircle2,
  Calendar,
  Sparkles,
  TrendingUp,
  ShieldCheck,
  Award,
  Clock,
  Compass,
} from 'lucide-react';
import { PortalOrganization, PortalStats } from '../../data/portalData';

interface PortalHeroProps {
  organization: PortalOrganization;
  stats: PortalStats;
  onExploreProker: () => void;
  onExploreGallery: () => void;
}

export const PortalHero: React.FC<PortalHeroProps> = ({
  organization,
  stats,
  onExploreProker,
  onExploreGallery,
}) => {
  return (
    <section
      id="beranda"
      className="relative overflow-hidden pt-8 pb-16 lg:pt-16 lg:pb-24 border-b border-slate-200/60 dark:border-slate-800/80 bg-gradient-to-b from-blue-50/50 via-white to-slate-50 dark:from-slate-900/60 dark:via-slate-950 dark:to-slate-950 transition-colors"
    >
      {/* Background Decorative Ambient Blurs */}
      <div className="absolute top-0 left-1/4 -translate-x-1/2 w-96 h-96 bg-blue-400/10 dark:bg-blue-600/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-1/3 right-10 w-80 h-80 bg-amber-400/10 dark:bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Grid Pattern Overlay */}
      <div
        className="absolute inset-0 opacity-[0.03] dark:opacity-[0.05] pointer-events-none"
        style={{
          backgroundImage: `radial-gradient(circle at 1px 1px, currentColor 1px, transparent 0)`,
          backgroundSize: '24px 24px',
        }}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
          {/* Left Column: Hero Copy & Actions */}
          <div className="lg:col-span-7 text-left space-y-6">
            {/* Pill Badge */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-100/80 dark:bg-blue-950/70 border border-blue-200 dark:border-blue-800/70 text-blue-700 dark:text-blue-300 text-xs font-semibold shadow-xs">
              <span className="flex h-2 w-2 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-600 dark:bg-blue-400"></span>
              </span>
              <span>{organization.heroBadge}</span>
              <span className="text-slate-400 dark:text-slate-600">•</span>
              <span className="text-slate-600 dark:text-slate-300 font-medium">
                TA {organization.academicYear}
              </span>
            </div>

            {/* Main Headline */}
            <h1 className="font-heading text-3xl sm:text-4xl md:text-5xl lg:text-5xl font-extrabold tracking-tight text-slate-900 dark:text-white leading-[1.15]">
              Pusat Informasi &amp;{' '}
              <span className="bg-gradient-to-r from-blue-600 via-indigo-600 to-amber-500 bg-clip-text text-transparent">
                Transparansi Kegiatan
              </span>{' '}
              {organization.name}
            </h1>

            {/* Subtitle / Tagline */}
            <p className="text-base sm:text-lg text-slate-600 dark:text-slate-300 font-normal leading-relaxed max-w-2xl">
              {organization.tagline}. Akses publik terbuka untuk seluruh siswa, dewan guru, dan warga sekolah guna memantau perkembangan program kerja, agenda kegiatan, serta dokumentasi secara nyata.
            </p>

            {/* Key Value Proposition Bullets */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
              <div className="flex items-center gap-2.5 text-xs text-slate-700 dark:text-slate-300 bg-white/60 dark:bg-slate-900/60 p-2.5 rounded-xl border border-slate-200/60 dark:border-slate-800/60 shadow-2xs backdrop-blur-xs">
                <ShieldCheck className="w-4 h-4 text-emerald-500 shrink-0" />
                <span className="font-medium">100% Transparan</span>
              </div>
              <div className="flex items-center gap-2.5 text-xs text-slate-700 dark:text-slate-300 bg-white/60 dark:bg-slate-900/60 p-2.5 rounded-xl border border-slate-200/60 dark:border-slate-800/60 shadow-2xs backdrop-blur-xs">
                <Clock className="w-4 h-4 text-blue-500 shrink-0" />
                <span className="font-medium">Linimasa Terjadwal</span>
              </div>
              <div className="flex items-center gap-2.5 text-xs text-slate-700 dark:text-slate-300 bg-white/60 dark:bg-slate-900/60 p-2.5 rounded-xl border border-slate-200/60 dark:border-slate-800/60 shadow-2xs backdrop-blur-xs">
                <Award className="w-4 h-4 text-amber-500 shrink-0" />
                <span className="font-medium">Akuntabilitas Rinci</span>
              </div>
            </div>

            {/* Call To Action Buttons */}
            <div className="flex flex-wrap items-center gap-3.5 pt-3">
              <button
                onClick={onExploreProker}
                className="inline-flex items-center justify-center gap-2.5 px-6 py-3.5 rounded-xl text-sm font-bold bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-600/30 hover:shadow-blue-600/40 transition-all duration-200 cursor-pointer hover:-translate-y-0.5 active:translate-y-0"
              >
                <span>Lihat Program Kerja</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <button
                onClick={onExploreGallery}
                className="inline-flex items-center justify-center gap-2.5 px-5 py-3.5 rounded-xl text-sm font-semibold bg-white dark:bg-slate-800/90 text-slate-800 dark:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 shadow-sm transition-all duration-200 cursor-pointer hover:-translate-y-0.5 active:translate-y-0"
              >
                <Camera className="w-4 h-4 text-amber-500" />
                <span>Lihat Dokumentasi</span>
              </button>
            </div>

            {/* Quick Status Bar */}
            <div className="pt-2 flex items-center gap-4 text-xs text-slate-500 dark:text-slate-400">
              <span className="flex items-center gap-1.5 font-medium">
                <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                {stats.prokerSelesai} Proker Tuntas
              </span>
              <span>•</span>
              <span className="flex items-center gap-1.5 font-medium">
                <span className="w-2 h-2 rounded-full bg-amber-500"></span>
                {stats.prokerBerjalan} Sedang Berjalan
              </span>
              <span>•</span>
              <span className="flex items-center gap-1.5 font-medium">
                <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                {stats.totalDokumentasi} Foto Terarsip
              </span>
            </div>
          </div>

          {/* Right Column: Interactive Visual Pattern / Card Mockup */}
          <div className="lg:col-span-5 relative">
            <div className="relative mx-auto max-w-md lg:max-w-none">
              {/* Outer Glow Ring */}
              <div className="absolute -inset-1.5 bg-gradient-to-tr from-blue-600 via-indigo-500 to-amber-500 rounded-3xl blur-xl opacity-30 dark:opacity-40 animate-pulse" />

              {/* Central Visual Glass Card */}
              <div className="relative rounded-2xl bg-white/90 dark:bg-slate-900/90 border border-slate-200/80 dark:border-slate-800 backdrop-blur-xl p-5 shadow-2xl space-y-4">
                {/* Header of Mock Card */}
                <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white font-bold text-xs">
                      SK
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-slate-800 dark:text-slate-100">
                        Monitoring Pelaksanaan
                      </h4>
                      <p className="text-[10px] text-slate-400">
                        Update Terakhir: Hari Ini
                      </p>
                    </div>
                  </div>
                  <span className="px-2 py-0.5 bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800 text-[10px] font-bold rounded-md">
                    Aktif
                  </span>
                </div>

                {/* Simulated Live Highlight Proker */}
                <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60 space-y-2.5">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <span className="text-[10px] font-semibold text-blue-600 dark:text-blue-400 uppercase tracking-wide">
                        Sekbid TIK &amp; Publikasi
                      </span>
                      <h5 className="text-xs font-bold text-slate-900 dark:text-white line-clamp-1">
                        Pekan Literasi Digital &amp; Workshop AI Siswa
                      </h5>
                    </div>
                    <span className="px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-950/80 text-amber-700 dark:text-amber-400 text-[10px] font-bold shrink-0">
                      80% Selesai
                    </span>
                  </div>

                  {/* Simulated Progress Bar */}
                  <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2 overflow-hidden">
                    <div
                      className="bg-gradient-to-r from-blue-600 to-amber-500 h-2 rounded-full transition-all duration-1000"
                      style={{ width: '80%' }}
                    />
                  </div>

                  <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400 pt-0.5">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3 h-3 text-blue-500" />
                      Okt 2026
                    </span>
                    <span className="font-semibold text-slate-700 dark:text-slate-300">
                      PIC: Dimas Anggoro
                    </span>
                  </div>
                </div>

                {/* Simulated Secondary Event Mini-Card */}
                <div className="p-3 rounded-xl bg-white dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-800 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-lg bg-amber-100 dark:bg-amber-950/80 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
                      <Sparkles className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-slate-800 dark:text-slate-200 line-clamp-1">
                        Peringatan Bulan Bahasa &amp; Seni
                      </p>
                      <p className="text-[10px] text-slate-500 dark:text-slate-400">
                        27 - 28 Oktober 2026 • Aula Utama
                      </p>
                    </div>
                  </div>
                  <span className="text-[10px] font-bold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/60 px-2 py-1 rounded-md shrink-0">
                    Mendatang
                  </span>
                </div>

                {/* Transparency Metric Banner */}
                <div className="p-3 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-700 text-white flex items-center justify-between shadow-md">
                  <div className="flex items-center gap-2.5">
                    <TrendingUp className="w-4 h-4 text-amber-300" />
                    <div>
                      <p className="text-[11px] font-medium text-blue-100">
                        Tingkat Realisasi Program
                      </p>
                      <p className="text-sm font-extrabold text-white">
                        {stats.realisasiAnggaranPersen}% Terlaksana
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] bg-white/20 text-white font-bold px-2 py-0.5 rounded-full backdrop-blur-xs">
                      15 Total Agenda
                    </span>
                  </div>
                </div>
              </div>

              {/* Floating Badge 1 - Bottom Left */}
              <div className="absolute -bottom-4 -left-4 bg-white dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700 px-3.5 py-2 rounded-xl shadow-lg flex items-center gap-2.5 backdrop-blur-md animate-float-slow">
                <div className="w-7 h-7 rounded-lg bg-emerald-100 dark:bg-emerald-950/70 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                  <CheckCircle2 className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-[10px] text-slate-400">Status Data</p>
                  <p className="text-xs font-bold text-slate-800 dark:text-slate-100">
                    Terverifikasi Pembina
                  </p>
                </div>
              </div>

              {/* Floating Badge 2 - Top Right */}
              <div className="absolute -top-3 -right-3 bg-white dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700 px-3 py-1.5 rounded-xl shadow-lg flex items-center gap-2 backdrop-blur-md hidden sm:flex">
                <Compass className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400 animate-spin" style={{ animationDuration: '8s' }} />
                <span className="text-[11px] font-bold text-slate-700 dark:text-slate-200">
                  {organization.motto}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

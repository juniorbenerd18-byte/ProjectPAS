import React, { useState } from 'react';
import {
  Search,
  ArrowRight,
  ChevronDown,
  Info,
  Layers,
  MessageSquare,
  Sparkles,
  X,
  Shield,
} from 'lucide-react';
import {
  PortalOrganization,
  PortalStats,
  PortalTimelineEvent,
} from '../../data/portalData';

interface PortalHeroProps {
  organization: PortalOrganization;
  stats: PortalStats;
  upcomingEvent?: PortalTimelineEvent;
  onExploreProker: () => void;
  onExploreTimeline: () => void;
  onExploreGallery: () => void;
  onExploreAspirasi: () => void;
  onExploreAbout: () => void;
  onSearchQuerySubmit?: (query: string) => void;
  onSelectDivision?: (divisionCode: string) => void;
}

export const PortalHero: React.FC<PortalHeroProps> = ({
  organization,
  stats,
  onExploreProker,
  onExploreTimeline,
  onExploreGallery,
  onExploreAspirasi,
  onExploreAbout,
  onSearchQuerySubmit,
  onSelectDivision,
}) => {
  const [searchTerm, setSearchTerm] = useState('');

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchTerm.trim() && onSearchQuerySubmit) {
      onSearchQuerySubmit(searchTerm.trim());
    } else {
      onExploreProker();
    }
  };

  const divisionShortcuts = [
    { label: 'Semua', code: 'ALL' },
    { label: 'BPH', code: 'BPH' },
    { label: 'Ketaqwaan', code: 'SEKBID-1' },
    { label: 'Bela Negara', code: 'SEKBID-2' },
    { label: 'Kewirausahaan', code: 'SEKBID-3' },
    { label: 'TIK & Media', code: 'SEKBID-4' },
    { label: 'Seni & Olahraga', code: 'SEKBID-5' },
  ];

  return (
    <section
      id="beranda"
      className="relative min-h-[92vh] sm:min-h-screen flex flex-col justify-center items-center text-center overflow-hidden bg-[#050505] text-white pt-24 pb-14 px-4 sm:px-6 lg:px-8 select-none"
    >
      {/* Background Hero Image with Dark Cinematic Overlay (Inspired by OSINTRA) */}
      <div className="absolute inset-0 z-0 bg-[#050505] overflow-hidden">
        <img
          src="https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=1920&auto=format&fit=crop&q=80"
          alt="OSIS Team Hero Background"
          className="w-full h-full object-cover opacity-25 mix-blend-luminosity scale-105 animate-pulse duration-[10000ms]"
          loading="eager"
        />
        {/* Cinematic Vignette Gradients */}
        <div className="absolute inset-0 bg-radial-[at_50%_35%] from-emerald-950/20 via-[#050505]/70 to-[#050505] pointer-events-none" />
        <div className="absolute inset-x-0 bottom-0 h-3/4 bg-gradient-to-t from-[#050505] via-[#050505]/80 to-transparent pointer-events-none" />
      </div>

      {/* Decorative Glow Elements */}
      <div
        className="absolute top-1/4 left-1/2 -translate-x-1/2 w-96 h-96 rounded-full opacity-20 blur-3xl pointer-events-none"
        style={{ backgroundColor: '#3B4D3A' }}
      />

      {/* Main Hero Content */}
      <div className="relative z-10 max-w-4xl mx-auto flex flex-col items-center">
        {/* Kicker Tag (OSINTRA Style) */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/15 text-white/80 text-xs sm:text-sm tracking-[0.25em] font-medium uppercase mb-5 drop-shadow-md">
          <Sparkles className="w-3.5 h-3.5 text-amber-300 animate-spin" style={{ animationDuration: '6s' }} />
          <span>Selamat Datang di Website Resmi</span>
        </div>

        {/* Big Majestic Headline */}
        <h1
          className="text-4xl sm:text-6xl md:text-7xl lg:text-7xl font-black text-white tracking-tight mb-4 drop-shadow-2xl font-heading"
          style={{
            textShadow: '0 0 35px rgba(255, 255, 255, 0.25), 0 0 70px rgba(255, 255, 255, 0.1)',
          }}
        >
          OSIS SMKN 1 CERDAS
        </h1>

        {/* Motto with Flanking Divider Lines (Signature SMKN 6 OSINTRA Style) */}
        <div className="flex items-center justify-center gap-3 sm:gap-5 mb-5 w-full">
          <div className="h-[1px] w-10 sm:w-20 bg-white/30 hidden sm:block" />
          <p className="text-[#E8DCC3] text-sm sm:text-lg md:text-xl font-light italic tracking-wider drop-shadow-md">
            "{organization.motto || 'Solid, Kompak, & Berprestasi'}"
          </p>
          <div className="h-[1px] w-10 sm:w-20 bg-white/30 hidden sm:block" />
        </div>

        {/* Tagline / Subtitle */}
        <p className="text-white/75 text-sm sm:text-base md:text-lg max-w-2xl mx-auto leading-relaxed mb-8 font-light">
          Platform dokumentasi, informasi program kerja, dan transparansi kegiatan OSIS SMK Negeri 1 Cerdas Bangsa.
        </p>

        {/* Quick Search Bar (Translucent Modern Pill) */}
        <div className="w-full max-w-xl mb-6">
          <form
            onSubmit={handleSearchSubmit}
            className="flex items-center gap-2 bg-white/10 hover:bg-white/15 backdrop-blur-md border border-white/20 rounded-full p-1.5 shadow-xl transition-all focus-within:border-emerald-400 focus-within:bg-black/60 focus-within:ring-2 focus-within:ring-emerald-400/30"
          >
            <Search className="w-4 h-4 text-white/60 ml-3.5 shrink-0" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Cari program kerja, agenda, atau sekbid..."
              className="w-full bg-transparent px-2 py-1 text-xs sm:text-sm text-white placeholder:text-white/50 focus:outline-none"
            />
            {searchTerm && (
              <button
                type="button"
                onClick={() => setSearchTerm('')}
                className="p-1 text-white/60 hover:text-white cursor-pointer"
                title="Hapus pencarian"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
            <button
              type="submit"
              className="px-4 py-2 rounded-full text-xs font-bold bg-[#3B4D3A] hover:bg-emerald-700 text-[#E8DCC3] shadow-md transition-all shrink-0 cursor-pointer flex items-center gap-1.5"
            >
              <span>Cari</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </form>

          {/* Quick Division Filter Chips */}
          <div className="flex flex-wrap items-center justify-center gap-1.5 pt-3">
            <span className="text-[11px] text-white/50 mr-1 hidden sm:inline">
              Pintasan:
            </span>
            {divisionShortcuts.map((div) => (
              <button
                key={div.code}
                type="button"
                onClick={() => {
                  if (onSelectDivision) onSelectDivision(div.code);
                  onExploreProker();
                }}
                className="px-2.5 py-1 rounded-full text-[11px] font-medium text-white/75 bg-white/5 border border-white/10 hover:bg-white/15 hover:text-white hover:border-[#E8DCC3]/50 transition-all cursor-pointer"
              >
                {div.label}
              </button>
            ))}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center justify-center gap-3 pt-1">
          <button
            onClick={onExploreProker}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-full text-xs sm:text-sm font-bold bg-white text-slate-950 hover:bg-[#E8DCC3] shadow-lg shadow-white/10 hover:scale-105 active:scale-95 transition-all cursor-pointer"
          >
            <Layers className="w-4 h-4 text-emerald-700" />
            <span>Jelajahi Program Kerja</span>
            <ArrowRight className="w-4 h-4" />
          </button>

          <button
            onClick={onExploreAbout}
            className="inline-flex items-center gap-2 px-5 py-3 rounded-full text-xs sm:text-sm font-semibold bg-white/10 hover:bg-white/20 text-white border border-white/20 backdrop-blur-md hover:scale-105 active:scale-95 transition-all cursor-pointer"
          >
            <Info className="w-4 h-4 text-[#E8DCC3]" />
            <span>Tentang Organisasi</span>
          </button>

          <button
            onClick={onExploreAspirasi}
            className="inline-flex items-center gap-2 px-5 py-3 rounded-full text-xs sm:text-sm font-medium text-white/80 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
          >
            <MessageSquare className="w-4 h-4 text-emerald-400" />
            <span>Kotak Aspirasi Siswa</span>
          </button>
        </div>
      </div>

      {/* Down Bouncing Scroll Cue (Inspired by OSINTRA) */}
      <div className="relative z-10 mt-12 sm:mt-16 flex flex-col items-center">
        <button
          onClick={onExploreAbout}
          className="group flex flex-col items-center gap-1.5 text-white/50 hover:text-white transition-colors cursor-pointer focus:outline-none"
        >
          <span className="text-[11px] tracking-widest uppercase font-medium">
            Jelajahi Portal
          </span>
          <ChevronDown className="w-5 h-5 animate-bounce text-[#E8DCC3] group-hover:scale-125 transition-transform" />
        </button>
      </div>
    </section>
  );
};

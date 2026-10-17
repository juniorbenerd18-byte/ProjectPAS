import React, { useEffect, useRef, useState } from 'react';
import { Eye, Target, Sparkles, Compass } from 'lucide-react';
import { Highlight } from './Highlight';
import { PortalOrganization } from '../../data/portalData';

interface VisionMissionSectionProps {
  organization: PortalOrganization;
}

/** Simple scroll-reveal hook with customizable threshold */
function useScrollReveal(threshold = 0.1) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (typeof IntersectionObserver === 'undefined') {
      setVisible(true);
      return;
    }
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { threshold, rootMargin: '0px 0px -40px 0px' }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [threshold]);

  return { ref, visible };
}

export const VisionMissionSection: React.FC<VisionMissionSectionProps> = ({
  organization,
}) => {
  const header = useScrollReveal(0.08);
  const vision = useScrollReveal(0.1);
  const mission = useScrollReveal(0.1);
  const photo = useScrollReveal(0.1);

  const defaultPhoto =
    'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=800&auto=format&fit=crop&q=80';
  const photoSrc = organization.visionPhotoUrl || defaultPhoto;

  const revealStyle = (
    visible: boolean,
    delay = 0,
    direction: 'up' | 'left' | 'right' = 'up'
  ): React.CSSProperties => {
    let transformHidden = 'translateY(36px)';
    if (direction === 'left') transformHidden = 'translateX(-36px) translateY(12px)';
    if (direction === 'right') transformHidden = 'translateX(36px) translateY(12px)';

    return {
      opacity: visible ? 1 : 0,
      transform: visible ? 'translate(0px, 0px)' : transformHidden,
      transitionProperty: 'opacity, transform',
      transitionDuration: '750ms',
      transitionTimingFunction: 'cubic-bezier(0.16, 1, 0.3, 1)',
      transitionDelay: `${delay}ms`,
      willChange: 'opacity, transform',
    };
  };

  return (
    <section id="visi-misi" className="bg-white py-16 sm:py-20 border-b border-[#E2E8F0] overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header Section */}
        <div
          ref={header.ref}
          style={revealStyle(header.visible)}
          className="text-center max-w-3xl mx-auto mb-12 sm:mb-16"
        >
          <div className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-[#EFF6FF] border border-blue-100 text-[#2563EB] text-xs font-bold mb-4 shadow-2xs">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Tentang Kami</span>
          </div>

          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-[#1E3A8A] tracking-tight leading-tight">
            Membangun Masa Depan
            <br />
            Bersama OSIS <Highlight>{organization.schoolName || 'SMKN 1 Cerdas Bangsa'}</Highlight>
          </h2>

          <p className="text-sm sm:text-base text-[#64748B] mt-3 max-w-2xl mx-auto leading-relaxed">
            {organization.tagline ||
              'Wadah aspirasi siswa yang inklusif, adaptif terhadap teknologi, dan berintegritas tinggi'}
          </p>

          {/* Garis Aksen Dekoratif */}
          <div className="flex items-center justify-center gap-3 my-5">
            <div className="w-10 h-0.5 bg-[#CBD5E1]" />
            <div className="w-2 h-2 rounded-full bg-[#1E3A8A]" />
            <div className="w-10 h-0.5 bg-[#CBD5E1]" />
          </div>
        </div>

        {/* 1. Foto Representasi Organisasi (Sinematik Banner) */}
        <div className="max-w-6xl mx-auto mb-8 sm:mb-10">
          <div
            ref={photo.ref}
            style={revealStyle(photo.visible, 60, 'up')}
            className="rounded-3xl overflow-hidden border border-[#E2E8F0] shadow-md group relative bg-slate-100"
          >
            <div className="aspect-16/9 sm:aspect-21/9 max-h-[360px] w-full overflow-hidden bg-slate-100">
              <img
                src={photoSrc}
                alt={`Foto Visi Misi ${organization.schoolName || 'Organisasi'}`}
                className="w-full h-full object-cover object-center group-hover:scale-102 transition-transform duration-700"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = defaultPhoto;
                }}
              />
            </div>
            {/* Caption overlay di bagian bawah foto */}
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-[#0F172A]/90 via-[#0F172A]/40 to-transparent p-5 sm:p-6 flex flex-col sm:flex-row sm:items-end justify-between gap-2">
              <div>
                <p className="text-white font-extrabold text-base sm:text-lg drop-shadow-sm">
                  {organization.schoolName || 'SMK Negeri 1 Cerdas Bangsa'}
                </p>
                <p className="text-blue-200 text-xs sm:text-sm mt-0.5 font-medium">
                  Masa Bakti {organization.academicYear || '2025/2026'}
                </p>
              </div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/15 backdrop-blur-md text-white text-xs font-semibold self-start sm:self-auto border border-white/25 shadow-xs">
                <Sparkles className="w-3.5 h-3.5 text-blue-300" />
                <span>Pengurus &amp; Anggota Terpadu</span>
              </div>
            </div>
          </div>
        </div>

        {/* 2. Grid Visi & Misi Bersebelahan dengan Efek Staggered Scroll Delay */}
        <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8 items-stretch">
          {/* Kolom Kiri: Visi Organisasi (Delay: 150ms, Slide dari Kiri) */}
          <div
            ref={vision.ref}
            style={revealStyle(vision.visible, 150, 'left')}
            className="lg:col-span-5 bg-gradient-to-br from-[#1E3A8A] via-[#1D4ED8] to-[#0F172A] rounded-3xl p-6 sm:p-8 shadow-xl border border-blue-400/20 text-white flex flex-col justify-between relative overflow-hidden group"
          >
            {/* Dekorasi Aksen Glow & Watermark */}
            <div className="absolute -right-10 -top-10 w-44 h-44 bg-blue-400/15 rounded-full blur-2xl pointer-events-none" />
            <div className="absolute -bottom-6 -right-4 text-white/5 pointer-events-none text-9xl font-serif select-none">
              “
            </div>

            <div className="relative z-10">
              <div className="flex items-center justify-between gap-3 mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-white/15 backdrop-blur-md text-white flex items-center justify-center shadow-inner">
                    <Eye className="w-6 h-6" />
                  </div>
                  <div>
                    <span className="text-[11px] font-extrabold tracking-wider uppercase text-blue-200/90 block">
                      Arah Pandang
                    </span>
                    <h3 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight">
                      Visi Organisasi
                    </h3>
                  </div>
                </div>
                <span className="px-2.5 py-1 rounded-full bg-white/10 backdrop-blur-md text-blue-100 text-[11px] font-semibold border border-white/15">
                  Fokus Utama
                </span>
              </div>

              {/* Kutipan Visi */}
              <div className="p-4 sm:p-5 rounded-2xl bg-white/10 backdrop-blur-md border border-white/15 shadow-sm">
                <p className="text-base sm:text-lg text-white font-medium leading-relaxed italic">
                  "{organization.vision ||
                    'Mewujudkan OSIS SMK Negeri 1 Cerdas Bangsa sebagai organisasi yang berkarakter unggul, adaptif terhadap teknologi digital, berintegritas tinggi, dan berjiwa wirausaha.'}"
                </p>
              </div>
            </div>

            {/* Bagian Bawah: 4 Pilar Nilai Inti */}
            <div className="relative z-10 mt-6 pt-5 border-t border-white/15">
              <p className="text-xs font-bold text-blue-200 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                <Compass className="w-3.5 h-3.5 text-blue-300" />
                <span>4 Pilar Nilai Inti Keunggulan</span>
              </p>
              <div className="grid grid-cols-2 gap-2">
                {[
                  'Karakter Unggul',
                  'Adaptif Digital',
                  'Integritas Tinggi',
                  'Jiwa Wirausaha',
                ].map((pill, idx) => (
                  <div
                    key={idx}
                    className="flex items-center gap-2 px-3 py-2 rounded-xl bg-white/10 backdrop-blur-xs text-white text-xs font-semibold border border-white/10 hover:bg-white/15 transition-colors"
                  >
                    <div className="w-1.5 h-1.5 rounded-full bg-blue-300 shrink-0" />
                    <span className="truncate">{pill}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Kolom Kanan: Misi Strategis (Delay Berurutan: 380ms, Slide dari Kanan) */}
          <div
            ref={mission.ref}
            style={revealStyle(mission.visible, 380, 'right')}
            className="lg:col-span-7 bg-white rounded-3xl p-6 sm:p-8 shadow-md border border-[#E2E8F0] hover:border-blue-300/60 transition-all flex flex-col justify-between"
          >
            <div>
              {/* Header Misi */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6 pb-4 border-b border-slate-100">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-[#1E3A8A] text-white flex items-center justify-center shadow-md">
                    <Target className="w-6 h-6" />
                  </div>
                  <div>
                    <span className="text-[11px] font-extrabold tracking-wider uppercase text-blue-600 block">
                      Langkah Aksi
                    </span>
                    <h3 className="text-xl sm:text-2xl font-extrabold text-[#0F172A] tracking-tight">
                      Misi Strategis
                    </h3>
                  </div>
                </div>

                <span className="text-xs font-bold text-[#2563EB] bg-[#EFF6FF] px-3.5 py-1.5 rounded-full border border-blue-100 self-start sm:self-auto shadow-2xs">
                  {organization.missions?.length || 5} Butir Misi Terarah
                </span>
              </div>

              {/* Daftar Butir Misi (dengan Staggered Delay Scroll) */}
              {organization.missions && organization.missions.length > 0 ? (
                <div className="space-y-3 sm:space-y-3.5">
                  {organization.missions.map((m, idx) => (
                    <div
                      key={idx}
                      style={{
                        opacity: mission.visible ? 1 : 0,
                        transform: mission.visible ? 'translateX(0px)' : 'translateX(24px)',
                        transition: `all 650ms cubic-bezier(0.16, 1, 0.3, 1) ${460 + idx * 80}ms`,
                      }}
                      className="flex items-start gap-3.5 p-3.5 sm:p-4 rounded-2xl bg-slate-50/90 border border-slate-100 hover:bg-blue-50/50 hover:border-blue-200 hover:shadow-xs transition-all duration-200 group/item"
                    >
                      <span className="w-7 h-7 rounded-xl bg-[#1E3A8A] group-hover/item:bg-[#2563EB] text-white flex items-center justify-center text-xs font-bold shrink-0 mt-0.5 shadow-2xs transition-colors">
                        {idx + 1}
                      </span>
                      <p className="text-xs sm:text-sm text-[#334155] group-hover/item:text-[#0F172A] leading-relaxed font-medium transition-colors">
                        {m}
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-[#64748B] leading-relaxed">
                  Mengembangkan potensi siswa melalui kegiatan yang positif, kreatif, inovatif, dan bermanfaat bagi seluruh civitas akademika.
                </p>
              )}
            </div>

            {/* Note Tambahan di Bagian Bawah Misi */}
            <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between text-xs text-[#64748B]">
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                Dievaluasi berkala tiap semester
              </span>
              <span className="font-semibold text-[#1E3A8A]">
                OSIS {organization.schoolName || 'SMKN 1 Cerdas Bangsa'}
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

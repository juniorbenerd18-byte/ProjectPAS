import React, { useEffect, useRef, useState } from 'react';
import { Eye, Target, Sparkles } from 'lucide-react';
import { Highlight } from './Highlight';
import { PortalOrganization } from '../../data/portalData';

interface VisionMissionSectionProps {
  organization: PortalOrganization;
}

/** Simple scroll-reveal hook */
function useScrollReveal(threshold = 0.1) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (typeof IntersectionObserver === 'undefined') { setVisible(true); return; }
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setVisible(true); observer.disconnect(); } },
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

  const revealStyle = (visible: boolean, delay = 0): React.CSSProperties => ({
    opacity: visible ? 1 : 0,
    transform: visible ? 'translateY(0px)' : 'translateY(36px)',
    transitionProperty: 'opacity, transform',
    transitionDuration: '700ms',
    transitionTimingFunction: 'cubic-bezier(0.16, 1, 0.3, 1)',
    transitionDelay: `${delay}ms`,
  });

  return (
    <section id="visi-misi" className="bg-white py-16 sm:py-20 border-b border-[#E2E8F0]">
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

        {/* Layout Vertikal: 1. Foto Widescreen -> 2. Kartu Visi -> 3. Kartu Misi */}
        <div className="max-w-4xl mx-auto space-y-6 sm:space-y-7">
          {/* 1. Foto Representasi Organisasi (Sinematik Banner) */}
          <div
            ref={photo.ref}
            style={revealStyle(photo.visible, 60)}
            className="rounded-3xl overflow-hidden border border-[#E2E8F0] shadow-md group relative bg-slate-100"
          >
            <div className="aspect-16/9 sm:aspect-21/9 max-h-[380px] w-full overflow-hidden bg-slate-100">
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

          {/* 2. Kartu Visi Organisasi (Vertikal di Bawah Foto) */}
          <div
            ref={vision.ref}
            style={revealStyle(vision.visible, 120)}
            className="bg-[#1E3A8A] rounded-2xl p-6 sm:p-8 shadow-md border border-[#1E3A8A]/80 group"
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-white/15 text-white flex items-center justify-center">
                <Eye className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg sm:text-xl font-bold text-white tracking-tight">
                  Visi Organisasi
                </h3>
                <div className="w-8 h-0.5 bg-blue-300/60 mt-1.5" />
              </div>
            </div>
            <p className="text-base sm:text-lg text-blue-50 leading-relaxed italic font-normal">
              "{organization.vision ||
                'Mewujudkan OSIS SMK Negeri 1 Cerdas Bangsa sebagai organisasi yang berkarakter unggul, adaptif terhadap teknologi digital, berintegritas tinggi, dan berjiwa wirausaha.'}"
            </p>
          </div>

          {/* 3. Kartu Misi Strategis (Vertikal di Bawah Visi) */}
          <div
            ref={mission.ref}
            style={revealStyle(mission.visible, 180)}
            className="bg-white border border-[#E2E8F0] rounded-2xl p-6 sm:p-8 shadow-xs hover:border-[#2563EB]/30 transition-all"
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6 pb-4 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#1E3A8A] text-white flex items-center justify-center">
                  <Target className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg sm:text-xl font-bold text-[#0F172A] tracking-tight">
                    Misi Strategis
                  </h3>
                  <div className="w-8 h-0.5 bg-[#2563EB] mt-1.5" />
                </div>
              </div>

              <span className="text-xs font-bold text-[#2563EB] bg-[#EFF6FF] px-3 py-1 rounded-full border border-blue-100 self-start sm:self-auto">
                {organization.missions?.length || 5} Butir Misi Terarah
              </span>
            </div>

            {/* Grid Butir Misi (1 kolom di mobile, 2 kolom di tablet/desktop) */}
            {organization.missions && organization.missions.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 sm:gap-4">
                {organization.missions.map((m, idx) => (
                  <div
                    key={idx}
                    className="flex items-start gap-3.5 p-4 rounded-xl bg-slate-50/80 border border-slate-100/90 hover:bg-blue-50/40 hover:border-blue-100 transition-colors"
                  >
                    <span className="w-6 h-6 rounded-full bg-[#1E3A8A] text-white flex items-center justify-center text-xs font-bold shrink-0 mt-0.5 shadow-2xs">
                      {idx + 1}
                    </span>
                    <p className="text-xs sm:text-sm text-[#334155] leading-relaxed font-normal">
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
        </div>
      </div>
    </section>
  );
};

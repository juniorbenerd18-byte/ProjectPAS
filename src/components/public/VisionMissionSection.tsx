import React, { useEffect, useRef, useState } from 'react';
import { Eye, Target, Sparkles } from 'lucide-react';
import { Highlight } from './Highlight';
import { PortalOrganization } from '../../data/portalData';

interface VisionMissionSectionProps {
  organization: PortalOrganization;
}

/** Simple, lightweight scroll-reveal hook */
function useScrollReveal(threshold = 0.05) {
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
      { threshold }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [threshold]);

  return { ref, visible };
}

export const VisionMissionSection: React.FC<VisionMissionSectionProps> = ({
  organization,
}) => {
  const header = useScrollReveal(0.05);
  const vision = useScrollReveal(0.05);
  const mission = useScrollReveal(0.05);

  const revealStyle = (visible: boolean, delay = 0): React.CSSProperties => ({
    opacity: visible ? 1 : 0,
    transform: visible ? 'translateY(0px)' : 'translateY(24px)',
    transitionProperty: 'opacity, transform',
    transitionDuration: '600ms',
    transitionTimingFunction: 'cubic-bezier(0.16, 1, 0.3, 1)',
    transitionDelay: `${delay}ms`,
  });

  // Tepat 3 butir misi utama terarah
  const missionItems =
    organization.missions && organization.missions.length > 0
      ? organization.missions.slice(0, 3)
      : [
          'Menanamkan nilai integritas, keimanan, dan etika kepemimpinan dalam setiap gerak langkah organisasi.',
          'Mewujudkan tata kelola program kerja dan anggaran yang transparan, terbuka, dan dapat dipantau seluruh siswa.',
          'Mengoptimalkan pemanfaatan teknologi digital untuk publikasi, sistem informasi, dan dokumentasi kegiatan sekolah.',
        ];

  return (
    <section id="visi-misi" className="bg-white py-16 sm:py-20 border-b border-[#E2E8F0]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header Section */}
        <div
          ref={header.ref}
          style={revealStyle(header.visible)}
          className="text-center max-w-3xl mx-auto mb-10 sm:mb-14"
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

        {/* Konten Utama: Hanya Kartu Visi dan Misi Berbentuk Persegi Panjang */}
        <div className="max-w-4xl mx-auto space-y-6 sm:space-y-7">
          {/* 1. Kartu Visi Organisasi (Persegi Panjang) */}
          <div
            ref={vision.ref}
            style={revealStyle(vision.visible, 60)}
            className="bg-[#1E3A8A] rounded-2xl p-6 sm:p-8 shadow-md border border-[#1E3A8A]/80 group"
          >
            <div className="flex items-center justify-between gap-3 mb-4">
              <div className="flex items-center gap-3">
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
              <span className="text-xs font-semibold text-blue-100 bg-white/10 px-3 py-1 rounded-full border border-white/15">
                Arah Pandang
              </span>
            </div>
            <p className="text-base sm:text-lg text-blue-50 leading-relaxed italic font-normal">
              "{organization.vision ||
                'Mewujudkan OSIS SMK Negeri 1 Cerdas Bangsa sebagai organisasi yang berkarakter unggul, adaptif terhadap teknologi digital, berintegritas tinggi, dan berjiwa wirausaha.'}"
            </p>
          </div>

          {/* 2. Kartu Misi Strategis (Persegi Panjang) */}
          <div
            ref={mission.ref}
            style={revealStyle(mission.visible, 120)}
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
                {missionItems.length} Butir Misi Terarah
              </span>
            </div>

            {/* 3 Butir Misi Bersebelahan Secara Horisontal di Dalam Card Persegi Panjang */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5 sm:gap-4">
              {missionItems.map((m, idx) => (
                <div
                  key={idx}
                  className="flex flex-col justify-between p-4 rounded-xl bg-slate-50/80 border border-slate-100/90 hover:bg-blue-50/40 hover:border-blue-100 transition-colors"
                >
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <span className="w-6 h-6 rounded-full bg-[#1E3A8A] text-white flex items-center justify-center text-xs font-bold shrink-0 shadow-2xs">
                        {idx + 1}
                      </span>
                      <span className="text-xs font-bold text-[#0F172A]">
                        {idx === 0
                          ? 'Integritas & Karakter'
                          : idx === 1
                          ? 'Tata Kelola Transparan'
                          : 'Inovasi & Digital'}
                      </span>
                    </div>
                    <p className="text-xs sm:text-sm text-[#334155] leading-relaxed font-normal">
                      {m}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

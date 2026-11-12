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
    <section id="visi-misi" className="bg-[#FAF6EE] py-16 sm:py-20 border-b border-[#E6DFD0]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header Section */}
        <div
          ref={header.ref}
          style={revealStyle(header.visible)}
          className="text-center max-w-3xl mx-auto mb-10 sm:mb-14"
        >
          <div className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-[#E4EAF2] border border-[#E6DFD0] text-[#1F3A5F] text-xs font-bold mb-4 shadow-2xs">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Tentang Kami</span>
          </div>

          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-[#1F3A5F] tracking-tight leading-tight">
            Membangun Masa Depan
            <br />
            Bersama OSIS <Highlight>{organization.schoolName || 'SMKN 1 Cerdas Bangsa'}</Highlight>
          </h2>

          <p className="text-sm sm:text-base text-[#5A6472] mt-3 max-w-2xl mx-auto leading-relaxed">
            {organization.tagline ||
              'Wadah aspirasi siswa yang inklusif, adaptif terhadap teknologi, dan berintegritas tinggi'}
          </p>

          {/* Garis Aksen Dekoratif */}
          <div className="flex items-center justify-center gap-3 my-5">
            <div className="w-10 h-0.5 bg-[#E6DFD0]" />
            <div className="w-2 h-2 rounded-full bg-[#F2B544]" />
            <div className="w-10 h-0.5 bg-[#E6DFD0]" />
          </div>
        </div>

        {/* Konten Utama: Hanya Kartu Visi dan Misi Berbentuk Persegi Panjang */}
        <div className="max-w-4xl mx-auto space-y-6 sm:space-y-7">
          {/* 1. Kartu Visi Organisasi (Persegi Panjang) */}
          <div
            ref={vision.ref}
            style={revealStyle(vision.visible, 60)}
            className="bg-[#1F3A5F] rounded-2xl p-6 sm:p-8 shadow-md border border-[#162B46] group"
          >
            <div className="flex items-center justify-between gap-3 mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-white/15 text-[#FAF6EE] flex items-center justify-center">
                  <Eye className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg sm:text-xl font-bold !text-white tracking-tight">
                    Visi Organisasi
                  </h3>
                  <div className="w-8 h-0.5 bg-[#F2B544]/70 mt-1.5" />
                </div>
              </div>
              <span className="text-xs font-semibold text-[#FAF6EE]/80 bg-white/10 px-3 py-1 rounded-full border border-white/15">
                Arah Pandang
              </span>
            </div>
            <p className="text-base sm:text-lg text-[#FAF6EE]/90 leading-relaxed italic font-normal">
              "{organization.vision ||
                'Mewujudkan OSIS SMK Negeri 1 Cerdas Bangsa sebagai organisasi yang berkarakter unggul, adaptif terhadap teknologi digital, berintegritas tinggi, dan berjiwa wirausaha.'}"
            </p>
          </div>

          {/* 2. Kartu Misi Strategis (Persegi Panjang) */}
          <div
            ref={mission.ref}
            style={revealStyle(mission.visible, 120)}
            className="bg-[#FFFDF8] border border-[#E6DFD0] rounded-2xl p-6 sm:p-8 shadow-xs hover:border-[#1F3A5F]/30 transition-all"
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6 pb-4 border-b border-[#E6DFD0]">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#1F3A5F] text-[#FAF6EE] flex items-center justify-center">
                  <Target className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg sm:text-xl font-bold text-[#1F3A5F] tracking-tight">
                    Misi Strategis
                  </h3>
                  <div className="w-8 h-0.5 bg-[#F2B544] mt-1.5" />
                </div>
              </div>

              <span className="text-xs font-bold text-[#1F3A5F] bg-[#E4EAF2] px-3 py-1 rounded-full border border-[#E6DFD0] self-start sm:self-auto">
                {missionItems.length} Butir Misi Terarah
              </span>
            </div>

            {/* 3 Butir Misi Bersebelahan Secara Horisontal di Dalam Card Persegi Panjang */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5 sm:gap-4">
              {missionItems.map((m, idx) => (
                <div
                  key={idx}
                  className="flex flex-col justify-between p-4 rounded-xl bg-[#FAF6EE] border border-[#E6DFD0] hover:border-[#1F3A5F] transition-colors"
                >
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <span className="w-6 h-6 rounded-full bg-[#1F3A5F] text-[#FAF6EE] flex items-center justify-center text-xs font-bold shrink-0 shadow-2xs">
                        {idx + 1}
                      </span>
                      <span className="text-xs font-bold text-[#1F3A5F]">
                        {idx === 0
                          ? 'Integritas & Karakter'
                          : idx === 1
                          ? 'Tata Kelola Transparan'
                          : 'Inovasi & Digital'}
                      </span>
                    </div>
                    <p className="text-xs sm:text-sm text-[#5A6472] leading-relaxed font-normal">
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

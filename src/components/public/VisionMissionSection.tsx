import React, { useEffect, useRef, useState } from 'react';
import { Eye, Target, Sparkles, CheckCircle2 } from 'lucide-react';
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
    if (direction === 'left') transformHidden = 'translateX(-32px) translateY(12px)';
    if (direction === 'right') transformHidden = 'translateX(32px) translateY(12px)';

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

  // Ambil tepat 3 butir misi utama terarah
  const missionItems =
    organization.missions && organization.missions.length > 0
      ? organization.missions.slice(0, 3)
      : [
          'Menanamkan nilai integritas, keimanan, dan etika kepemimpinan dalam setiap gerak langkah organisasi.',
          'Mewujudkan tata kelola program kerja dan anggaran yang transparan, terbuka, dan dapat dipantau seluruh siswa.',
          'Mengoptimalkan pemanfaatan teknologi digital untuk publikasi, sistem informasi, dan dokumentasi kegiatan sekolah.',
        ];

  // 3 Pilar penjabaran Visi agar berstruktur simetris (bentuk yang sama persis)
  const visionPillars = [
    {
      title: 'Karakter Unggul & Integritas',
      desc: 'Membina etika kepemimpinan, moralitas keagamaan, serta budi pekerti luhur bagi seluruh pengurus dan anggota.',
    },
    {
      title: 'Adaptif Inovasi & Transformasi Digital',
      desc: 'Memaksimalkan teknologi modern untuk keterbukaan informasi, publikasi interaktif, dan efisiensi sistem.',
    },
    {
      title: 'Daya Saing Vokasi & Jiwa Wirausaha',
      desc: 'Mengasah kompetensi kejuruan, kemandirian kreatif, serta kesiapan sinergi nyata bersama dunia industri.',
    },
  ];

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

        {/* 2. Grid Visi & Misi Bersebelahan: Bentuk Sama (Symmetric Twin Cards) & Masing-Masing 3 Butir */}
        <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8 items-stretch">
          {/* Kartu 1: Visi Organisasi (Delay: 150ms, Slide dari Kiri) */}
          <div
            ref={vision.ref}
            style={revealStyle(vision.visible, 150, 'left')}
            className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm hover:shadow-xl border border-slate-200/90 hover:border-blue-300/80 transition-all duration-300 flex flex-col justify-between group"
          >
            <div>
              {/* Header Kartu */}
              <div className="flex items-center justify-between gap-3 mb-6 pb-4 border-b border-slate-100">
                <div className="flex items-center gap-3.5">
                  <div className="w-12 h-12 rounded-2xl bg-blue-50 text-[#1E3A8A] border border-blue-100 flex items-center justify-center shadow-2xs group-hover:scale-105 transition-transform">
                    <Eye className="w-6 h-6 text-[#1E3A8A]" />
                  </div>
                  <div>
                    <span className="text-[11px] font-extrabold tracking-wider uppercase text-blue-600 block">
                      Arah Pandang
                    </span>
                    <h3 className="text-xl sm:text-2xl font-extrabold text-[#0F172A] tracking-tight">
                      Visi Organisasi
                    </h3>
                  </div>
                </div>

                <span className="text-xs font-bold text-[#1E3A8A] bg-blue-50 px-3.5 py-1.5 rounded-full border border-blue-100 shadow-2xs shrink-0">
                  3 Pilar Utama
                </span>
              </div>

              {/* Kutipan Visi Inti */}
              <div className="p-4 sm:p-4.5 rounded-2xl bg-slate-50/90 border border-slate-100/90 mb-5">
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">
                  Pernyataan Visi:
                </p>
                <p className="text-sm sm:text-[15px] text-[#1E3A8A] font-semibold leading-relaxed italic">
                  "{organization.vision ||
                    'Mewujudkan OSIS SMK Negeri 1 Cerdas Bangsa sebagai organisasi yang berkarakter unggul, adaptif terhadap inovasi digital, serta berdaya saing kejuruan.'}"
                </p>
              </div>

              {/* 3 Butir Pilar Visi */}
              <div className="space-y-3 sm:space-y-3.5">
                {visionPillars.map((pillar, idx) => (
                  <div
                    key={idx}
                    style={{
                      opacity: vision.visible ? 1 : 0,
                      transform: vision.visible ? 'translateX(0px)' : 'translateX(-20px)',
                      transition: `all 650ms cubic-bezier(0.16, 1, 0.3, 1) ${450 + idx * 80}ms`,
                    }}
                    className="flex items-start gap-3.5 p-3.5 sm:p-4 rounded-2xl bg-slate-50/80 border border-slate-100 hover:bg-blue-50/50 hover:border-blue-200 hover:shadow-xs transition-all duration-200 group/item"
                  >
                    <span className="w-7 h-7 rounded-xl bg-[#1E3A8A] group-hover/item:bg-[#2563EB] text-white flex items-center justify-center text-xs font-bold shrink-0 mt-0.5 shadow-2xs transition-colors">
                      {idx + 1}
                    </span>
                    <div className="flex-1">
                      <h4 className="text-xs sm:text-sm font-bold text-[#0F172A] mb-0.5">
                        {pillar.title}
                      </h4>
                      <p className="text-xs text-[#475569] leading-relaxed font-normal">
                        {pillar.desc}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Footer Kartu */}
            <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between text-xs text-[#64748B]">
              <span className="flex items-center gap-1.5 font-medium">
                <CheckCircle2 className="w-3.5 h-3.5 text-blue-600" />
                Landasan Cita-Cita Organisasi
              </span>
              <span className="font-semibold text-[#1E3A8A]">
                Masa Bakti {organization.academicYear || '2025/2026'}
              </span>
            </div>
          </div>

          {/* Kartu 2: Misi Strategis (Delay: 350ms, Slide dari Kanan) */}
          <div
            ref={mission.ref}
            style={revealStyle(mission.visible, 350, 'right')}
            className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm hover:shadow-xl border border-slate-200/90 hover:border-blue-300/80 transition-all duration-300 flex flex-col justify-between group"
          >
            <div>
              {/* Header Kartu */}
              <div className="flex items-center justify-between gap-3 mb-6 pb-4 border-b border-slate-100">
                <div className="flex items-center gap-3.5">
                  <div className="w-12 h-12 rounded-2xl bg-blue-50 text-[#1E3A8A] border border-blue-100 flex items-center justify-center shadow-2xs group-hover:scale-105 transition-transform">
                    <Target className="w-6 h-6 text-[#1E3A8A]" />
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

                <span className="text-xs font-bold text-[#1E3A8A] bg-blue-50 px-3.5 py-1.5 rounded-full border border-blue-100 shadow-2xs shrink-0">
                  3 Butir Terarah
                </span>
              </div>

              {/* Kutipan / Pengantar Misi */}
              <div className="p-4 sm:p-4.5 rounded-2xl bg-slate-50/90 border border-slate-100/90 mb-5">
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">
                  Komitmen Pelaksanaan:
                </p>
                <p className="text-sm sm:text-[15px] text-[#1E3A8A] font-semibold leading-relaxed italic">
                  "Menerjemahkan visi ke dalam program kerja nyata yang transparan, akuntabel, dan berdampak bagi seluruh siswa."
                </p>
              </div>

              {/* 3 Butir Misi Strategis */}
              <div className="space-y-3 sm:space-y-3.5">
                {missionItems.map((m, idx) => (
                  <div
                    key={idx}
                    style={{
                      opacity: mission.visible ? 1 : 0,
                      transform: mission.visible ? 'translateX(0px)' : 'translateX(20px)',
                      transition: `all 650ms cubic-bezier(0.16, 1, 0.3, 1) ${450 + idx * 80}ms`,
                    }}
                    className="flex items-start gap-3.5 p-3.5 sm:p-4 rounded-2xl bg-slate-50/80 border border-slate-100 hover:bg-blue-50/50 hover:border-blue-200 hover:shadow-xs transition-all duration-200 group/item"
                  >
                    <span className="w-7 h-7 rounded-xl bg-[#1E3A8A] group-hover/item:bg-[#2563EB] text-white flex items-center justify-center text-xs font-bold shrink-0 mt-0.5 shadow-2xs transition-colors">
                      {idx + 1}
                    </span>
                    <div className="flex-1">
                      <h4 className="text-xs sm:text-sm font-bold text-[#0F172A] mb-0.5">
                        {idx === 0
                          ? 'Integritas & Tata Kelola'
                          : idx === 1
                          ? 'Transparansi Informasi'
                          : 'Inovasi Digital & Vokasi'}
                      </h4>
                      <p className="text-xs text-[#475569] leading-relaxed font-normal">
                        {m}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Footer Kartu */}
            <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between text-xs text-[#64748B]">
              <span className="flex items-center gap-1.5 font-medium">
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

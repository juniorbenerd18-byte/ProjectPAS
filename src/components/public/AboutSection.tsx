import React from 'react';
import { ArrowRight, Sparkles } from 'lucide-react';
import { Highlight } from './Highlight';
import { PortalOrganization } from '../../data/portalData';
import { ScrollReveal } from '../common/ScrollReveal';

interface AboutSectionProps {
  organization: PortalOrganization;
  onLearnMoreClick?: () => void;
}

export const AboutSection: React.FC<AboutSectionProps> = ({
  organization,
  onLearnMoreClick,
}) => {
  const handleScrollToBoard = () => {
    if (onLearnMoreClick) {
      onLearnMoreClick();
      return;
    }
    const el = document.getElementById('pengurus');
    if (el) {
      const navOffset = 80;
      const elPos = el.getBoundingClientRect().top;
      const offset = elPos + window.pageYOffset - navOffset;
      window.scrollTo({ top: offset, behavior: 'smooth' });
    }
  };

  return (
    <section id="tentang" className="bg-white py-16 sm:py-24 border-b border-[#E2E8F0]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-16">
          {/* Kolom Kiri: Foto Ketua OSIS dengan Badge Melayang di Bawah */}
          <ScrollReveal distance={40} duration={750} delay={0} className="w-full lg:w-5/12 flex justify-center">
            <div className="relative w-full max-w-sm sm:max-w-md rounded-3xl overflow-hidden border border-[#E2E8F0] shadow-sm bg-slate-50 group">
              <div className="aspect-3/4 w-full overflow-hidden bg-slate-100">
                <img
                  src="/ketua-osis.png"
                  alt="Agustin Rahmadani - Ketua OSIS"
                  className="w-full h-full object-cover object-top group-hover:scale-102 transition-transform duration-500"
                  onError={(e) => {
                    // Fallback jika path lokal belum ter-load
                    (e.target as HTMLImageElement).src =
                      'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=800&auto=format&fit=crop&q=80';
                  }}
                />
              </div>

              {/* Kartu Nama Melayang di Bawah Foto */}
              <div className="absolute bottom-4 inset-x-4 bg-white/95 backdrop-blur-md border border-[#E2E8F0] rounded-2xl p-3.5 shadow-md text-center">
                <div className="inline-flex items-center justify-center gap-1.5 text-[#2563EB] mb-0.5">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span className="font-extrabold text-sm sm:text-base text-[#0F172A] tracking-tight">
                    Agustin Rahmadani
                  </span>
                </div>
                <p className="text-[10px] sm:text-[11px] font-bold tracking-wider text-[#64748B] uppercase">
                  KETUA OSIS PERIODE 2025/2026
                </p>
              </div>
            </div>
          </ScrollReveal>

          {/* Kolom Kanan: Sambutan Ketua OSIS */}
          <ScrollReveal distance={40} duration={750} delay={150} className="w-full lg:w-7/12">
            <div className="space-y-6 text-left">
              <div>
                <span className="inline-block bg-[#1E3A8A] text-white text-xs font-bold uppercase tracking-wider px-3.5 py-1.5 rounded-full shadow-xs">
                  SAMBUTAN KETUA OSIS
                </span>
                <h2 className="text-2xl sm:text-4xl lg:text-5xl font-extrabold text-[#1E3A8A] tracking-tight leading-tight mt-4">
                  “Menjadi Wadah Inovasi Untuk <Highlight>{organization.schoolName || 'SMKN 1 Cerdas Bangsa'}</Highlight> Unggul.”
                </h2>
              </div>

              {/* Paragraf Sambutan dengan Garis Aksen Vertikal */}
              <div className="border-l-2 border-[#CBD5E1] pl-5 sm:pl-6 space-y-3.5 text-sm sm:text-base text-[#64748B] italic leading-relaxed">
                <p>
                  Assalamu'alaikum Warahmatullahi Wabarakatuh, Salam Sejahtera untuk kita semua.
                </p>
                <p>
                  Teman-teman yang saya banggakan, OSIS bukan sekadar label organisasi, melainkan ruang kolaborasi. Kami hadir bukan untuk memberi perintah, tetapi untuk mengajak seluruh siswa bergerak melampaui kebiasaan.
                </p>
                <p>
                  Mari kita ciptakan sekolah yang tidak hanya unggul dalam angka, tapi juga kaya dalam inovasi dan karakter. SIMO hadir sebagai jembatan yang inklusif bagi setiap aspirasi.
                </p>
                <p>
                  Mari bersinergi, karena perubahan besar dimulai dari langkah kecil yang dilakukan bersama.
                </p>
              </div>

              {/* Link Kenali Pengurus Kami */}
              <div className="pt-2">
                <button
                  onClick={handleScrollToBoard}
                  className="inline-flex items-center gap-2 text-sm sm:text-base font-bold text-[#1E3A8A] hover:text-[#2563EB] transition-colors cursor-pointer group"
                >
                  Kenali pengurus kami
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </button>
              </div>
            </div>
          </ScrollReveal>
        </div>
      </div>
    </section>
  );
};

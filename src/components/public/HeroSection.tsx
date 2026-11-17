import React from 'react';
import { ArrowRight, Users, CheckCircle2 } from 'lucide-react';
import { Highlight } from './Highlight';
import { FloatingStatCard } from './FloatingStatCard';
import { PortalOrganization } from '../../data/portalData';

interface HeroSectionProps {
  organization: PortalOrganization;
  activeMembersCount?: number;
  attendanceRatePercent?: number;
  onJoinClick?: () => void;
  onExploreEventsClick?: () => void;
}

export const HeroSection: React.FC<HeroSectionProps> = ({
  organization,
  activeMembersCount = 120,
  attendanceRatePercent = 85,
  onJoinClick,
  onExploreEventsClick,
}) => {
  const handleScrollTo = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      const navOffset = 80;
      const elPos = el.getBoundingClientRect().top;
      const offset = elPos + window.pageYOffset - navOffset;
      window.scrollTo({ top: offset, behavior: 'smooth' });
    }
  };

  return (
    <section id="beranda" className="bg-[#FAF6EE] pt-24 sm:pt-36 pb-12 sm:pb-24 border-b border-[#E6DFD0] overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Split layout: On mobile, photo is above text (flex-col-reverse lg:flex-row) */}
        <div className="flex flex-col-reverse lg:flex-row items-center gap-8 sm:gap-12 lg:gap-16">
          {/* Kolom Kiri: Teks & Tombol Aksi (Animasi Muncul Bertahap / Staggered Fade-in) */}
          <div className="w-full lg:w-1/2 text-left space-y-6">
            <div className="flex items-center gap-2.5 flex-wrap animate-hero-1">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#E4EAF2] border border-[#E6DFD0] text-[#1F3A5F] text-xs font-semibold">
                <span className="w-2 h-2 rounded-full bg-[#1F3A5F]" />
                {organization.academicYear || 'Tahun Ajaran 2025/2026'}
              </div>
              {organization.isRegistrationOpen !== false ? (
                <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-bold">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  Pendaftaran GForm Dibuka
                </div>
              ) : (
                <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#FBEBC8] border border-[#F2B544]/40 text-[#7A4B00] text-xs font-bold">
                  Pendaftaran Ditutup
                </div>
              )}
            </div>

            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold text-[#1F3A5F] tracking-tight leading-[1.15] animate-hero-2">
              Satu wadah,
              <br />
              setiap anggota,
              <br />
              kegiatan yang <Highlight>nyata</Highlight>
            </h1>

            <p className="text-base sm:text-lg text-[#5A6472] leading-relaxed max-w-xl animate-hero-3">
              {organization.description ||
                'Pusat informasi, transparansi program kerja, dan keikutsertaan kegiatan bagi seluruh civitas sekolah dalam satu platform terpadu.'}
            </p>

            <div className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-4 animate-hero-4">
              <button
                onClick={() => {
                  if (onJoinClick) onJoinClick();
                  else handleScrollTo('kontak');
                }}
                className="group px-6 py-3.5 text-sm sm:text-base font-extrabold text-[#1F3A5F] bg-[#F2B544] hover:bg-[#E0A12F] hover:-translate-y-0.5 active:translate-y-0 rounded-xl shadow-2xs hover:shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                Gabung Sekarang
                <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
              </button>

              <button
                onClick={() => {
                  if (onExploreEventsClick) onExploreEventsClick();
                  else handleScrollTo('kegiatan');
                }}
                className="px-6 py-3.5 text-sm sm:text-base font-semibold text-[#1F3A5F] bg-transparent border border-[#E6DFD0] hover:bg-[#E4EAF2] hover:-translate-y-0.5 active:translate-y-0 rounded-xl transition-all flex items-center justify-center cursor-pointer"
              >
                Lihat Kegiatan
              </button>
            </div>
          </div>

          {/* Kolom Kanan: Foto Kegiatan & Dua Floating Stat Card (Animasi Muncul Bertahap & Pop-In) */}
          <div className="w-full lg:w-1/2 relative flex justify-center animate-hero-image">
            <div className="relative w-full max-w-lg lg:max-w-none">
              {/* Foto kegiatan utama */}
              <div className="relative rounded-2xl overflow-hidden border border-[#E6DFD0] shadow-sm aspect-[16/10] sm:aspect-4/3 bg-[#E4EAF2] group">
                <img
                  src="https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=1000&auto=format&fit=crop&q=80"
                  alt="Kegiatan Kolaborasi Organisasi"
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
              </div>

              {/* Floating Stat Card 1: Anggota Aktif (Kiri Atas) */}
              <div className="absolute -top-2.5 sm:-top-6 left-0 sm:-left-6 max-w-[170px] xs:max-w-[190px] sm:max-w-[230px] w-full shadow-md scale-85 sm:scale-100 origin-top-left animate-card-pop-1">
                <FloatingStatCard
                  icon={<Users className="w-4 h-4" />}
                  title="Anggota aktif"
                  value={`${activeMembersCount}`}
                  subtitle="Terdata & terverifikasi"
                />
              </div>

              {/* Floating Stat Card 2: Kehadiran Kegiatan (Kanan Bawah) */}
              <div className="absolute -bottom-2.5 sm:-bottom-7 right-0 sm:-right-5 max-w-[175px] xs:max-w-[200px] sm:max-w-[250px] w-full shadow-md scale-85 sm:scale-100 origin-bottom-right animate-card-pop-2">
                <FloatingStatCard
                  icon={<CheckCircle2 className="w-4 h-4" />}
                  title="Kehadiran kegiatan"
                  value={`${attendanceRatePercent}%`}
                  progressPercent={attendanceRatePercent}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

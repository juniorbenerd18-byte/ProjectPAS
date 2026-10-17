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
    <section id="beranda" className="bg-white pt-28 sm:pt-36 pb-16 sm:pb-24 border-b border-[#E2E8F0]/70 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Split layout: On mobile, photo is above text (flex-col-reverse lg:flex-row) */}
        <div className="flex flex-col-reverse lg:flex-row items-center gap-12 lg:gap-16">
          {/* Kolom Kiri: Teks & Tombol Aksi */}
          <div className="w-full lg:w-1/2 text-left space-y-6">
            <div className="flex items-center gap-2.5 flex-wrap">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#EFF6FF] border border-blue-100 text-[#2563EB] text-xs font-semibold">
                <span className="w-2 h-2 rounded-full bg-[#2563EB]" />
                {organization.academicYear || 'Tahun Ajaran 2025/2026'}
              </div>
              {organization.isRegistrationOpen !== false ? (
                <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-bold">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  Pendaftaran GForm Dibuka
                </div>
              ) : (
                <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-amber-50 border border-amber-200 text-amber-800 text-xs font-bold">
                  Pendaftaran Ditutup
                </div>
              )}
            </div>

            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold text-[#1E3A8A] tracking-tight leading-[1.15]">
              Satu wadah,
              <br />
              setiap anggota,
              <br />
              kegiatan yang <Highlight>nyata</Highlight>
            </h1>

            <p className="text-base sm:text-lg text-[#64748B] leading-relaxed max-w-xl">
              {organization.description ||
                'Pusat informasi, transparansi program kerja, dan keikutsertaan kegiatan bagi seluruh civitas sekolah dalam satu platform terpadu.'}
            </p>

            <div className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-4">
              <button
                onClick={() => {
                  if (onJoinClick) onJoinClick();
                  else handleScrollTo('cta');
                }}
                className="px-6 py-3.5 text-sm sm:text-base font-bold text-white bg-[#2563EB] hover:bg-blue-700 rounded-xl shadow-sm transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                Gabung Sekarang
                <ArrowRight className="w-4 h-4" />
              </button>

              <button
                onClick={() => {
                  if (onExploreEventsClick) onExploreEventsClick();
                  else handleScrollTo('kegiatan');
                }}
                className="px-6 py-3.5 text-sm sm:text-base font-semibold text-[#2563EB] bg-white border border-[#2563EB] hover:bg-[#EFF6FF] rounded-xl transition-all flex items-center justify-center cursor-pointer"
              >
                Lihat Kegiatan
              </button>
            </div>
          </div>

          {/* Kolom Kanan: Foto Kegiatan Asli & Dua Floating Stat Card Melayang */}
          <div className="w-full lg:w-1/2 relative flex justify-center">
            <div className="relative w-full max-w-lg lg:max-w-none">
              {/* Foto kegiatan utama */}
              <div className="relative rounded-2xl overflow-hidden border border-[#E2E8F0] shadow-sm aspect-4/3 bg-slate-100">
                <img
                  src="https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=1000&auto=format&fit=crop&q=80"
                  alt="Kegiatan Kolaborasi Organisasi"
                  className="w-full h-full object-cover"
                />
              </div>

              {/* Floating Stat Card 1: Anggota Aktif (Kiri Atas) */}
              <div className="absolute -top-4 sm:-top-6 -left-3 sm:-left-6 max-w-[210px] sm:max-w-[230px] w-full animate-fade-in shadow-md">
                <FloatingStatCard
                  icon={<Users className="w-4 h-4" />}
                  title="Anggota aktif"
                  value={`${activeMembersCount}`}
                  subtitle="Terdata & terverifikasi"
                />
              </div>

              {/* Floating Stat Card 2: Kehadiran Kegiatan (Kanan Bawah) */}
              <div className="absolute -bottom-5 sm:-bottom-7 -right-2 sm:-right-5 max-w-[220px] sm:max-w-[250px] w-full animate-fade-in shadow-md">
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

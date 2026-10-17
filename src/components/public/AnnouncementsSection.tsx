import React, { useState } from 'react';
import { Calendar, ArrowRight, X } from 'lucide-react';
import { Highlight } from './Highlight';
import { SectionHeader } from './SectionHeader';
import { ScrollReveal } from '../common/ScrollReveal';

export interface AnnouncementItem {
  id: string;
  title: string;
  content: string;
  date: string;
  category?: string;
  author?: string;
}

const DEFAULT_ANNOUNCEMENTS: AnnouncementItem[] = [
  {
    id: 'ann-1',
    title: 'Pendaftaran Calon Pengurus OSIS Periode 2026/2027 Resmi Dibuka',
    content:
      'Diberitahukan kepada seluruh siswa kelas X dan XI yang berminat mengembangkan bakat kepemimpinan, pendaftaran pengurus OSIS periode baru telah dibuka. Berkas formulir dan portofolio dapat diserahkan ke ruang sekretariat OSIS paling lambat 20 November 2026.',
    date: '12 Nov 2026',
    category: 'Rekrutmen',
    author: 'Panitia Seleksi OSIS',
  },
  {
    id: 'ann-2',
    title: 'Hasil Seleksi Delegasi Festival Lomba Seni Siswa Nasional (FLS2N)',
    content:
      'Selamat kepada rekan-rekan siswa yang telah terpilih mewakili sekolah dalam ajang FLS2N tingkat kota. Jadwal bimbingan intensif bersama pembina akan dimulai pekan depan di sanggar seni sekolah.',
    date: '05 Nov 2026',
    category: 'Prestasi',
    author: 'Sekbid Seni & Budaya',
  },
  {
    id: 'ann-3',
    title: 'Jadwal Kerja Bakti Kebersihan Lingkungan Sekolah & Bank Sampah',
    content:
      'Dalam rangka mewujudkan program Green School dan Adiwiyata, seluruh perwakilan kelas diharapkan hadir pada agenda kerja bakti serentak pada hari Sabtu pukul 07.30 WIB dengan membawa perlengkapan kebersihan.',
    date: '28 Okt 2026',
    category: 'Lingkungan',
    author: 'Sekbid Lingkungan Hidup',
  },
];

interface AnnouncementsSectionProps {
  announcements?: AnnouncementItem[];
}

export const AnnouncementsSection: React.FC<AnnouncementsSectionProps> = ({
  announcements = DEFAULT_ANNOUNCEMENTS,
}) => {
  const [selectedAnnouncement, setSelectedAnnouncement] = useState<AnnouncementItem | null>(null);

  return (
    <section id="pengumuman" className="bg-white py-16 sm:py-24 border-b border-[#E2E8F0]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <ScrollReveal distance={28} duration={650}>
          <SectionHeader
            badge="PENGUMUMAN RESMI"
            title={
              <>
                Informasi & <Highlight>pengumuman</Highlight> penting
              </>
            }
            description="Pembaruan warta, edaran resmi, dan hasil seleksi kegiatan organisasi yang perlu diketahui seluruh anggota."
            align="center"
          />
        </ScrollReveal>

        {/* Daftar Sederhana Pengumuman */}
        <ScrollReveal distance={36} duration={700} delay={100} className="max-w-4xl mx-auto">
          <div className="divide-y divide-[#E2E8F0] border border-[#E2E8F0] rounded-xl overflow-hidden bg-white shadow-xs">
            {announcements.map((item) => (
              <div
                key={item.id}
                className="p-5 sm:p-6 hover:bg-[#F8FAFC] transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-4"
              >
                <div className="space-y-1.5 flex-1 pr-0 sm:pr-6">
                  <div className="flex items-center gap-3 text-xs text-[#64748B]">
                    <span className="inline-flex items-center gap-1 font-semibold text-[#0F172A]">
                      <Calendar className="w-3.5 h-3.5 text-[#2563EB]" />
                      {item.date}
                    </span>
                    {item.category && (
                      <span className="px-2 py-0.5 rounded-full bg-[#EFF6FF] text-[#2563EB] font-bold text-[11px]">
                        {item.category}
                      </span>
                    )}
                  </div>

                  <h3 className="text-base sm:text-lg font-bold text-[#1E3A8A] leading-snug">
                    {item.title}
                  </h3>

                  <p className="text-xs sm:text-sm text-[#64748B] line-clamp-2 leading-relaxed">
                    {item.content}
                  </p>
                </div>

                {/* Tombol Baca Selengkapnya */}
                <div className="shrink-0 self-start sm:self-center">
                  <button
                    onClick={() => setSelectedAnnouncement(item)}
                    className="px-4 py-2 text-xs font-semibold text-[#2563EB] bg-white border border-[#2563EB] hover:bg-[#EFF6FF] rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer"
                  >
                    Baca selengkapnya
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </ScrollReveal>
      </div>

      {/* Modal Detail Pengumuman */}
      {selectedAnnouncement && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-fade-in">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 sm:p-8 border border-[#E2E8F0] shadow-xl relative space-y-4">
            <button
              onClick={() => setSelectedAnnouncement(null)}
              className="absolute top-5 right-5 p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
              aria-label="Tutup"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2 text-xs text-[#64748B]">
              <span className="inline-flex items-center gap-1 font-semibold text-[#0F172A]">
                <Calendar className="w-3.5 h-3.5 text-[#2563EB]" />
                {selectedAnnouncement.date}
              </span>
              {selectedAnnouncement.category && (
                <span className="px-2 py-0.5 rounded-full bg-[#EFF6FF] text-[#2563EB] font-bold text-[11px]">
                  {selectedAnnouncement.category}
                </span>
              )}
            </div>

            <h3 className="text-lg sm:text-xl font-bold text-[#1E3A8A] leading-snug pr-6">
              {selectedAnnouncement.title}
            </h3>

            <div className="text-sm text-[#0F172A] leading-relaxed pt-2 border-t border-[#E2E8F0] whitespace-pre-line">
              {selectedAnnouncement.content}
            </div>

            {selectedAnnouncement.author && (
              <p className="text-xs text-[#64748B] pt-2">
                Diterbitkan oleh: <span className="font-semibold text-[#0F172A]">{selectedAnnouncement.author}</span>
              </p>
            )}

            <div className="pt-4 flex justify-end">
              <button
                onClick={() => setSelectedAnnouncement(null)}
                className="px-5 py-2 text-xs font-semibold text-[#0F172A] bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};

import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, Quote } from 'lucide-react';
import { Highlight } from './Highlight';
import { ScrollReveal } from '../common/ScrollReveal';

// TODO: sambungkan ke Supabase tabel 'testimonials' (columns: id, name, role_or_class, avatar_url, content, is_published)
export interface TestimonialItem {
  id: string;
  name: string;
  roleOrClass: string;
  avatarUrl?: string;
  content: string;
}

const DUMMY_TESTIMONIALS: TestimonialItem[] = [
  {
    id: 't-1',
    name: 'Zevin',
    roleOrClass: 'Ketua Umum OSIS • XI RPL 1',
    avatarUrl: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200&auto=format&fit=crop&q=80',
    content:
      'Melalui SIMO, seluruh alur kerja kepengurusan OSIS mulai dari perencanaan proker, absensi presensi wajah, hingga keterbukaan anggaran dapat diakses secara transparan dan akuntabel oleh seluruh warga sekolah.',
  },
  {
    id: 't-2',
    name: 'Anisa Rahmawati',
    roleOrClass: 'Sekretaris Umum • XI TKJ 2',
    avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&auto=format&fit=crop&q=80',
    content:
      'Sistem pengarsipan surat digital dan notulensi rapat di SIMO membuat tata kelola administrasi organisasi jauh lebih tertib, cepat, dan tidak ada lagi dokumen penting yang tercecer.',
  },
  {
    id: 't-3',
    name: 'Rizky Alamsyah',
    roleOrClass: 'Bendahara Umum • XI AKL 1',
    avatarUrl: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=200&auto=format&fit=crop&q=80',
    content:
      'Transparansi arus kas dan iuran anggota yang tercatat otomatis memudahkan pertanggungjawaban dana kegiatan. Semua pengurus dan siswa bisa meninjau realisasi anggaran secara terbuka.',
  },
  {
    id: 't-4',
    name: 'Dimas Anggoro',
    roleOrClass: 'Koordinator Sekbid TIK • XI RPL 2',
    avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&auto=format&fit=crop&q=80',
    content:
      'Penerapan absensi biometrik scan wajah dan koordinasi divisi berbasis web ini membuktikan bahwa siswa SMK mampu menciptakan inovasi digital yang berdampak nyata.',
  },
  {
    id: 't-5',
    name: 'Siti Aulia Nur',
    roleOrClass: 'Anggota Siswa • X DKV 1',
    avatarUrl: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=200&auto=format&fit=crop&q=80',
    content:
      'Sebagai anggota baru, saya merasa sangat dirangkul dan transparan. Jadwal kegiatan dan pembagian peran selalu jelas, memberi ruang yang nyaman untuk belajar kepemimpinan.',
  },
  {
    id: 't-6',
    name: 'Bima Satria',
    roleOrClass: 'Koordinator Sekbid Bela Negara • XI TKRO 1',
    avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&auto=format&fit=crop&q=80',
    content:
      'Koordinasi gladi upacara dan latihan baris-berbaris jadi lebih disiplin karena kehadiran setiap perwakilan terpantau langsung lewat sistem presensi cerdas SIMO.',
  },
];

interface TestimonialsSectionProps {
  testimonials?: TestimonialItem[];
}

export const TestimonialsSection: React.FC<TestimonialsSectionProps> = ({
  testimonials = DUMMY_TESTIMONIALS,
}) => {
  const [startIndex, setStartIndex] = useState(0);

  const visibleCount = 3;
  const canSlide = testimonials.length > visibleCount;

  const handlePrev = () => {
    setStartIndex((prev) =>
      prev > 0 ? prev - 1 : Math.max(0, testimonials.length - visibleCount)
    );
  };

  const handleNext = () => {
    setStartIndex((prev) =>
      prev + visibleCount < testimonials.length ? prev + 1 : 0
    );
  };

  const visibleList = canSlide
    ? testimonials.slice(startIndex, startIndex + visibleCount)
    : testimonials;

  return (
    <section id="testimoni" className="bg-[#FFFDF8] py-16 sm:py-24 border-b border-[#E6DFD0]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header dengan Tombol Geser Panah Bulat di Kanan */}
        <ScrollReveal distance={28} duration={650}>
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-[#1F3A5F]">
                KATA ANGGOTA
              </span>
              <h2 className="text-2xl sm:text-4xl font-extrabold text-[#1F3A5F] tracking-tight leading-tight mt-2">
                Cerita nyata dari <Highlight>anggota</Highlight> kami
              </h2>
              <p className="text-sm sm:text-base text-[#5A6472] mt-2 max-w-xl">
                Pengalaman berharga, pembelajaran kepemimpinan, dan kesan mendalam selama berdinamika bersama organisasi.
              </p>
            </div>

            {/* Tombol Panah Bulat untuk Geser */}
            {canSlide && (
              <div className="flex items-center gap-2.5 shrink-0">
                <button
                  onClick={handlePrev}
                  className="w-10 h-10 rounded-full border border-[#E6DFD0] bg-[#FFFDF8] text-[#1F3A5F] hover:bg-[#1F3A5F] hover:text-[#FAF6EE] flex items-center justify-center transition-colors cursor-pointer shadow-2xs"
                  title="Sebelumnya"
                  aria-label="Sebelumnya"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <button
                  onClick={handleNext}
                  className="w-10 h-10 rounded-full border border-[#E6DFD0] bg-[#FFFDF8] text-[#1F3A5F] hover:bg-[#1F3A5F] hover:text-[#FAF6EE] flex items-center justify-center transition-colors cursor-pointer shadow-2xs"
                  title="Berikutnya"
                  aria-label="Berikutnya"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            )}
          </div>
        </ScrollReveal>

        {/* 3 Kartu Testimoni */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          {visibleList.map((item, idx) => (
            <ScrollReveal
              key={item.id}
              distance={38}
              duration={700}
              delay={idx * 110}
              className="flex flex-col h-full"
            >
              <div className="bg-[#FFFDF8] border border-[#E6DFD0] rounded-xl p-6 sm:p-7 shadow-xs hover:border-[#1F3A5F]/40 hover:shadow-md transition-all duration-200 flex flex-col justify-between h-full">
                <div className="space-y-4">
                  <Quote className="w-8 h-8 text-[#F2B544]/60" />
                  <p className="text-sm text-[#5A6472] leading-relaxed italic">
                    "{item.content}"
                  </p>
                </div>

                {/* Avatar, Nama, Angkatan/Divisi */}
                <div className="flex items-center gap-3 pt-6 mt-6 border-t border-[#E6DFD0]">
                  <div className="w-10 h-10 rounded-full overflow-hidden border border-[#E6DFD0] bg-[#FAF6EE] shrink-0">
                    <img
                      src={
                        item.avatarUrl ||
                        'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200&auto=format&fit=crop&q=80'
                      }
                      alt={item.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="min-w-0">
                    <h4 className="text-sm font-bold text-[#1F3A5F] truncate">
                      {item.name}
                    </h4>
                    <p className="text-xs text-[#5A6472] truncate">
                      {item.roleOrClass}
                    </p>
                  </div>
                </div>
              </div>
            </ScrollReveal>
          ))}
        </div>
      </div>
    </section>
  );
};

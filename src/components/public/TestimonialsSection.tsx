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
    name: 'Bagas Wicaksono',
    roleOrClass: 'Angkatan 2024 / Divisi TIK',
    avatarUrl: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200&auto=format&fit=crop&q=80',
    content:
      'Bergabung di SIMO mengajarkan saya bagaimana mengelola alur kerja tim secara profesional, mulai dari perencanaan proker hingga publikasi dokumentasi secara terbuka.',
  },
  {
    id: 't-2',
    name: 'Clara Salsabila',
    roleOrClass: 'Angkatan 2025 / Divisi Humas',
    avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&auto=format&fit=crop&q=80',
    content:
      'Transparansi program kerja di organisasi ini membuat seluruh anggota merasa dihargai dan memiliki ruang yang sama untuk berpendapat serta berkontribusi nyata.',
  },
  {
    id: 't-3',
    name: 'Raffi Pratama',
    roleOrClass: 'Angkatan 2024 / Sekbid Seni',
    avatarUrl: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=200&auto=format&fit=crop&q=80',
    content:
      'Penyelenggaraan pentas seni sekolah menjadi jauh lebih rapi karena sistem koordinasi jadwal dan pembagian tugas terdokumentasi dengan sangat jelas.',
  },
  {
    id: 't-4',
    name: 'Zahra Amelia',
    roleOrClass: 'Angkatan 2025 / Sekbid Kewirausahaan',
    avatarUrl: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=200&auto=format&fit=crop&q=80',
    content:
      'Pengalaman menyusun bazar dan laporan pertanggungjawaban di organisasi ini menjadi bekal berharga untuk persiapan masuk dunia kerja kejuruan.',
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
    <section id="testimoni" className="bg-white py-16 sm:py-24 border-b border-[#E2E8F0]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header dengan Tombol Geser Panah Bulat di Kanan */}
        <ScrollReveal distance={28} duration={650}>
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-[#2563EB]">
                KATA ANGGOTA
              </span>
              <h2 className="text-2xl sm:text-4xl font-extrabold text-[#1E3A8A] tracking-tight leading-tight mt-2">
                Cerita nyata dari <Highlight>anggota</Highlight> kami
              </h2>
              <p className="text-sm sm:text-base text-[#64748B] mt-2 max-w-xl">
                Pengalaman berharga, pembelajaran kepemimpinan, dan kesan mendalam selama berdinamika bersama organisasi.
              </p>
            </div>

            {/* Tombol Panah Bulat untuk Geser */}
            {canSlide && (
              <div className="flex items-center gap-2.5 shrink-0">
                <button
                  onClick={handlePrev}
                  className="w-10 h-10 rounded-full border border-[#2563EB] bg-white text-[#2563EB] hover:bg-[#2563EB] hover:text-white flex items-center justify-center transition-colors cursor-pointer shadow-xs"
                  title="Sebelumnya"
                  aria-label="Sebelumnya"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <button
                  onClick={handleNext}
                  className="w-10 h-10 rounded-full border border-[#2563EB] bg-white text-[#2563EB] hover:bg-[#2563EB] hover:text-white flex items-center justify-center transition-colors cursor-pointer shadow-xs"
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
              <div className="bg-white border border-[#E2E8F0] rounded-xl p-6 sm:p-7 shadow-xs hover:border-[#2563EB]/40 hover:shadow-md transition-all duration-200 flex flex-col justify-between h-full">
                <div className="space-y-4">
                  <Quote className="w-8 h-8 text-[#DBEAFE]" />
                  <p className="text-sm text-[#0F172A] leading-relaxed italic">
                    "{item.content}"
                  </p>
                </div>

                {/* Avatar, Nama, Angkatan/Divisi */}
                <div className="flex items-center gap-3 pt-6 mt-6 border-t border-[#E2E8F0]">
                  <div className="w-10 h-10 rounded-full overflow-hidden border border-[#E2E8F0] bg-slate-100 shrink-0">
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
                    <h4 className="text-sm font-bold text-[#0F172A] truncate">
                      {item.name}
                    </h4>
                    <p className="text-xs text-[#64748B] truncate">
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

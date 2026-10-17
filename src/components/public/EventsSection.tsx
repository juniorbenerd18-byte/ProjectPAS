import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, CalendarCheck } from 'lucide-react';
import { Highlight } from './Highlight';
import { PublicEventCard, PublicEventCardData } from './PublicEventCard';
import { ScrollReveal } from '../common/ScrollReveal';

interface EventsSectionProps {
  events?: PublicEventCardData[];
  onRegisterEvent?: (eventId: string) => void;
}

const DEFAULT_PUBLIC_EVENTS: PublicEventCardData[] = [
  {
    id: 'evt-1',
    title: 'Latihan Dasar Kepemimpinan Siswa (LDKS) 2026',
    date: '18 Nov 2026',
    time: '08:00 - 15:30 WIB',
    location: 'Aula Graha Utama & Lapangan Sekolah',
    category: 'Kepemimpinan',
    photoUrl: 'https://images.unsplash.com/photo-1517486808906-6ca8b3f04846?w=800&auto=format&fit=crop&q=80',
    description: 'Pelatihan karakter kepemimpinan, manajemen organisasi, dan sinergi tim bagi calon pengurus.',
  },
  {
    id: 'evt-2',
    title: 'Pekan Seni & Kreativitas Budaya Nusantara',
    date: '25 Nov 2026',
    time: '09:00 - 16:00 WIB',
    location: 'Panggung Terbuka Kampus Siswa',
    category: 'Seni & Budaya',
    photoUrl: 'https://images.unsplash.com/photo-1511578314322-379afb476865?w=800&auto=format&fit=crop&q=80',
    description: 'Ajang unjuk kebolehan minat bakat musik tradisional, teater monolog, dan tari daerah.',
  },
  {
    id: 'evt-3',
    title: 'Workshop Literasi Digital & Keamanan Siber Siswa',
    date: '02 Des 2026',
    time: '13:00 - 15:30 WIB',
    location: 'Laboratorium Komputer Sentral',
    category: 'Teknologi',
    photoUrl: 'https://images.unsplash.com/photo-1531482615713-2afd69097998?w=800&auto=format&fit=crop&q=80',
    description: 'Edukasi etika digital, pemanfaatan AI positif, serta proteksi privasi di ruang daring.',
  },
  {
    id: 'evt-4',
    title: 'Aksi Bersih Lingkungan & Penanaman Pohon Rindang',
    date: '10 Des 2026',
    time: '06:30 - 11:00 WIB',
    location: 'Area Hutan Kota & Jalur Hijau',
    category: 'Sosial & Ekologi',
    photoUrl: 'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?w=800&auto=format&fit=crop&q=80',
    description: 'Gerakan gotong royong kepedulian iklim dan penghijauan sekolah bersama warga sekitar.',
  },
  {
    id: 'evt-5',
    title: 'Bazar Siswa Kewirausahaan Mandiri',
    date: '18 Des 2026',
    time: '08:00 - 14:00 WIB',
    location: 'Selasar Utama Sekolah',
    category: 'Kewirausahaan',
    photoUrl: 'https://images.unsplash.com/photo-1556742049-0a67c5574f73?w=800&auto=format&fit=crop&q=80',
    description: 'Pameran produk karya wirausaha siswa dari tata boga, kerajinan, hingga startup rintisan.',
  },
];

export const EventsSection: React.FC<EventsSectionProps> = ({
  events = DEFAULT_PUBLIC_EVENTS,
  onRegisterEvent,
}) => {
  const [startIndex, setStartIndex] = useState(0);

  // Tampilkan maksimal 3 event dalam satu frame pada layar besar
  const visibleCount = 3;
  const canSlide = events.length > visibleCount;

  const handlePrev = () => {
    setStartIndex((prev) => (prev > 0 ? prev - 1 : Math.max(0, events.length - visibleCount)));
  };

  const handleNext = () => {
    setStartIndex((prev) => (prev + visibleCount < events.length ? prev + 1 : 0));
  };

  const visibleEvents = canSlide
    ? events.slice(startIndex, startIndex + visibleCount)
    : events;

  return (
    <section id="kegiatan" className="bg-[#EFF6FF] py-16 sm:py-24 border-b border-[#DBEAFE]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header Section dengan Tombol Geser Panah Bulat */}
        <ScrollReveal distance={28} duration={650}>
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-[#2563EB]">
                AGENDA KEGIATAN
              </span>
              <h2 className="text-2xl sm:text-4xl font-extrabold text-[#1E3A8A] tracking-tight leading-tight mt-2">
                Kegiatan <Highlight>mendatang</Highlight> yang terbuka untukmu
              </h2>
              <p className="text-sm sm:text-base text-[#64748B] mt-2 max-w-xl">
                Ikuti berbagai agenda produktif yang diselenggarakan pengurus untuk memperluas jejaring dan wawasan.
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

        {/* Grid Kartu Kegiatan */}
        {events.length === 0 ? (
          <ScrollReveal distance={30} duration={600}>
            <div className="bg-white border border-[#E2E8F0] rounded-xl p-10 text-center text-[#64748B]">
              <CalendarCheck className="w-10 h-10 text-[#2563EB] mx-auto mb-3" />
              <p className="font-semibold text-base text-[#0F172A]">Belum Ada Kegiatan Publik Mendatang</p>
              <p className="text-sm text-[#64748B] mt-1">Nantikan pembaruan jadwal kegiatan terbaru dari pengurus.</p>
            </div>
          </ScrollReveal>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {visibleEvents.map((evt, idx) => (
              <ScrollReveal
                key={evt.id}
                distance={38}
                duration={700}
                delay={idx * 100}
                className="h-full"
              >
                <PublicEventCard
                  event={evt}
                  onRegister={() => onRegisterEvent && onRegisterEvent(evt.id)}
                />
              </ScrollReveal>
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

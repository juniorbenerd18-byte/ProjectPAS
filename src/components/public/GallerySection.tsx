import React, { useState, useEffect } from 'react';
import {
  Images,
  X,
  ChevronLeft,
  ChevronRight,
  Maximize2,
  Calendar,
  Sparkles,
  ArrowRight,
} from 'lucide-react';
import { Highlight } from './Highlight';
import { SectionHeader } from './SectionHeader';
import { ScrollReveal } from '../common/ScrollReveal';

export interface GalleryItem {
  id: string;
  title: string;
  caption: string;
  imageUrl: string;
  date: string;
  category?: string;
}

export const DEFAULT_GALLERY_PHOTOS: GalleryItem[] = [
  {
    id: 'g-1',
    title: 'Sidang Pleno Paripurna Siswa',
    caption: 'Musyawarah perumusan agenda kerja tahunan bersama dewan pembina.',
    imageUrl: 'https://images.unsplash.com/photo-1577495508048-b635879837f1?w=800&auto=format&fit=crop&q=80',
    date: 'Oktober 2026',
    category: 'Musyawarah',
  },
  {
    id: 'g-2',
    title: 'Pelatihan Soft Skill & Komunikasi',
    caption: 'Workshop public speaking dan kepemimpinan pemuda inspiratif.',
    imageUrl: 'https://images.unsplash.com/photo-1524178232363-1fb2b075b655?w=800&auto=format&fit=crop&q=80',
    date: 'September 2026',
    category: 'Pelatihan',
  },
  {
    id: 'g-3',
    title: 'Turnamen Futsal Antarkelas',
    caption: 'Semangat sportivitas dan kebersamaan meriah antarjurusan kejuruan.',
    imageUrl: 'https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=800&auto=format&fit=crop&q=80',
    date: 'Agustus 2026',
    category: 'Olahraga',
  },
  {
    id: 'g-4',
    title: 'Bakti Sosial & Santunan Siswa',
    caption: 'Penyaluran sembako dan donasi buku pelajaran kepada panti asuhan.',
    imageUrl: 'https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?w=800&auto=format&fit=crop&q=80',
    date: 'Juli 2026',
    category: 'Sosial',
  },
  {
    id: 'g-5',
    title: 'Peringatan Hari Pahlawan Nasional',
    caption: 'Upacara khidmat dan pembagian apresiasi bagi siswa berprestasi.',
    imageUrl: 'https://images.unsplash.com/photo-1511632765486-a01980e01a18?w=800&auto=format&fit=crop&q=80',
    date: 'November 2026',
    category: 'Upacara',
  },
  {
    id: 'g-6',
    title: 'Pameran Karya Inovasi Digital',
    caption: 'Showcase aplikasi web dan produk kreatif hasil karya siswa SMK.',
    imageUrl: 'https://images.unsplash.com/photo-1531403009284-440f080d1e12?w=800&auto=format&fit=crop&q=80',
    date: 'Juni 2026',
    category: 'Inovasi',
  },
];

interface GallerySectionProps {
  photos?: GalleryItem[];
}

export const GallerySection: React.FC<GallerySectionProps> = ({
  photos = DEFAULT_GALLERY_PHOTOS,
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const [activeCategory, setActiveCategory] = useState<string>('Semua');

  // Kategori unik untuk filter dalam pop up modal
  const categories = ['Semua', ...Array.from(new Set(photos.map((p) => p.category).filter(Boolean))) as string[]];

  const filteredPhotos = activeCategory === 'Semua'
    ? photos
    : photos.filter((p) => p.category === activeCategory);

  // Keyboard navigation untuk lightbox & modal
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (lightboxIndex !== null) {
        if (e.key === 'Escape') setLightboxIndex(null);
        if (e.key === 'ArrowLeft') {
          setLightboxIndex((prev) => (prev !== null && prev > 0 ? prev - 1 : photos.length - 1));
        }
        if (e.key === 'ArrowRight') {
          setLightboxIndex((prev) => (prev !== null && prev < photos.length - 1 ? prev + 1 : 0));
        }
      } else if (isModalOpen && e.key === 'Escape') {
        setIsModalOpen(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [lightboxIndex, isModalOpen, photos.length]);

  const openLightbox = (index: number) => {
    setLightboxIndex(index);
  };

  const closeLightbox = () => {
    setLightboxIndex(null);
  };

  const currentLightboxPhoto = lightboxIndex !== null ? photos[lightboxIndex] : null;

  return (
    <section id="galeri" className="bg-[#FAF6EE] py-14 sm:py-24 border-b border-[#E6DFD0]">
      <div className="max-w-7xl mx-auto px-3.5 sm:px-6 lg:px-8">
        <ScrollReveal distance={28} duration={650}>
          <SectionHeader
            badge="DOKUMENTASI"
            title={
              <>
                Rekam jejak karya dan <Highlight>momen</Highlight> berharga
              </>
            }
            description="Kilas balik kegiatan organisasi yang telah berhasil terselenggara dengan penuh dedikasi dan antusiasme."
            align="center"
          />
        </ScrollReveal>

        {/* Grid Foto Preview: 
            - Di HP: 2 kolom compact (tidak makan layar tinggi), batas 4 foto pertama 
            - Di Tablet/Desktop: 3 kolom elegan, batas 6 foto 
        */}
        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-2.5 sm:gap-6 lg:gap-8">
          {photos.map((item, idx) => {
            // Sembunyikan item index >= 4 di mobile (HP hanya tampilkan 4 foto awal),
            // dan index >= 6 di desktop (karena sisanya dibuka lewat tombol popup)
            const isHiddenOnMobile = idx >= 4;
            const isHiddenOnDesktop = idx >= 6;

            if (isHiddenOnDesktop) return null;

            const isFourthOnMobile = idx === 3 && photos.length > 4;

            return (
              <ScrollReveal
                key={item.id}
                distance={24}
                duration={650}
                delay={(idx % 3) * 90}
                className={`flex-col h-full ${isHiddenOnMobile ? 'hidden sm:flex' : 'flex'}`}
              >
                <div
                  onClick={() => {
                    if (isFourthOnMobile && window.innerWidth < 640) {
                      setIsModalOpen(true);
                    } else {
                      openLightbox(idx);
                    }
                  }}
                  className="bg-[#FFFDF8] border border-[#E6DFD0] rounded-xl sm:rounded-2xl overflow-hidden shadow-2xs hover:border-[#1F3A5F] hover:shadow-md transition-all duration-200 group flex flex-col h-full cursor-pointer relative"
                >
                  {/* Container Foto Compact */}
                  <div className="relative aspect-[4/3] bg-[#E4EAF2] overflow-hidden">
                    <img
                      src={item.imageUrl}
                      alt={item.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      loading="lazy"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src =
                          'https://images.unsplash.com/photo-1511632765486-a01980e01a18?w=800&auto=format&fit=crop&q=80';
                      }}
                    />

                    {/* Badge Tanggal */}
                    <span className="absolute bottom-1.5 right-1.5 sm:bottom-2.5 sm:right-2.5 px-1.5 sm:px-2 py-0.5 bg-black/60 backdrop-blur-xs text-white text-[9px] sm:text-[11px] font-semibold rounded sm:rounded-md">
                      {item.date}
                    </span>

                    {/* Ikon Zoom di Hover Desktop */}
                    <div className="hidden sm:flex absolute inset-0 bg-[#1F3A5F]/20 opacity-0 group-hover:opacity-100 transition-opacity items-center justify-center">
                      <span className="p-2 rounded-full bg-white/90 text-[#1F3A5F] shadow-sm transform scale-90 group-hover:scale-100 transition-transform">
                        <Maximize2 className="w-4 h-4" />
                      </span>
                    </div>

                    {/* Overlay khusus foto ke-4 di Mobile jika ada foto tersisa */}
                    {isFourthOnMobile && (
                      <div className="sm:hidden absolute inset-0 bg-[#1F3A5F]/85 backdrop-blur-[2px] flex flex-col items-center justify-center p-2 text-center text-white">
                        <Images className="w-5 h-5 text-[#F2B544] mb-1" />
                        <span className="text-xs font-black tracking-tight text-white">
                          +{photos.length - 3} Foto
                        </span>
                        <span className="text-[9px] text-[#FAF6EE]/80 font-medium">
                          Buka Galeri
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Caption & Judul Compact */}
                  <div className="p-2.5 sm:p-4 flex-1 flex flex-col justify-between">
                    <div>
                      <h3 className="text-xs sm:text-base font-bold text-[#1F3A5F] group-hover:text-[#162B46] transition-colors leading-tight sm:leading-snug line-clamp-2">
                        {item.title}
                      </h3>
                      <p className="text-[10px] sm:text-xs text-[#5A6472] mt-1 sm:mt-1.5 line-clamp-2 leading-relaxed">
                        {item.caption}
                      </p>
                    </div>
                  </div>
                </div>
              </ScrollReveal>
            );
          })}
        </div>

        {/* Tombol Aksi Pop Up Foto Lengkap */}
        {photos.length > 4 && (
          <div className="mt-7 sm:mt-12 flex flex-col sm:flex-row items-center justify-center gap-3">
            <button
              type="button"
              onClick={() => setIsModalOpen(true)}
              className="w-full sm:w-auto px-5 sm:px-7 py-3 rounded-xl bg-[#1F3A5F] hover:bg-[#162B46] text-[#FAF6EE] font-bold text-xs sm:text-sm flex items-center justify-center gap-2.5 shadow-sm transition-all duration-200 cursor-pointer active:scale-95 group"
            >
              <Images className="w-4 h-4 text-[#F2B544] group-hover:rotate-6 transition-transform" />
              <span>Lihat Seluruh Dokumentasi ({photos.length} Foto)</span>
              <ArrowRight className="w-4 h-4 text-[#FAF6EE] group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        )}
      </div>

      {/* ======================================================== */}
      {/* POP UP MODAL: SELURUH DOKUMENTASI KEGIATAN               */}
      {/* ======================================================== */}
      {isModalOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 animate-fade-in"
          onClick={() => setIsModalOpen(false)}
        >
          <div
            className="bg-[#FFFDF8] dark:bg-[#17293E] w-full max-w-5xl max-h-[90vh] rounded-2xl sm:rounded-3xl border border-[#E6DFD0] dark:border-[#283D56] shadow-2xl flex flex-col overflow-hidden animate-scale-up"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="px-4 sm:px-6 py-3.5 sm:py-4 border-b border-[#E6DFD0] dark:border-[#283D56] flex items-center justify-between shrink-0 bg-[#FFFDF8] dark:bg-[#17293E]">
              <div className="flex items-center gap-2.5 sm:gap-3">
                <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-[#E4EAF2] dark:bg-[#213B5C] flex items-center justify-center text-[#1F3A5F] dark:text-[#FAF6EE] shrink-0">
                  <Images className="w-4 h-4 sm:w-5 sm:h-5 text-[#1F3A5F] dark:text-[#F2B544]" />
                </div>
                <div>
                  <h3 className="text-sm sm:text-lg font-black text-[#1F3A5F] dark:text-[#FAF6EE] tracking-tight leading-none">
                    Galeri Dokumentasi Lengkap
                  </h3>
                  <p className="text-[11px] sm:text-xs text-[#5A6472] dark:text-[#9AA8B8] font-medium mt-1">
                    Menampilkan seluruh {photos.length} arsip kegiatan &amp; karya nyata
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="w-8 h-8 sm:w-9 sm:h-9 flex items-center justify-center rounded-xl bg-[#FAF6EE] dark:bg-[#0E1B2C] text-[#5A6472] hover:text-[#1F3A5F] dark:text-[#9AA8B8] dark:hover:text-[#FAF6EE] transition-colors cursor-pointer"
                title="Tutup Galeri"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Filter Kategori Chips (Jika Ada) */}
            {categories.length > 2 && (
              <div className="px-4 sm:px-6 py-2.5 border-b border-[#E6DFD0] dark:border-[#283D56] flex items-center gap-1.5 overflow-x-auto scrollbar-none shrink-0 bg-[#FAF6EE]/60 dark:bg-[#0E1B2C]/40">
                {categories.map((cat) => (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setActiveCategory(cat)}
                    className={`px-3 py-1 rounded-full text-xs font-bold transition-all shrink-0 cursor-pointer ${
                      activeCategory === cat
                        ? 'bg-[#1F3A5F] text-[#FAF6EE] shadow-2xs'
                        : 'bg-white dark:bg-[#1C3048] text-[#5A6472] dark:text-[#9AA8B8] hover:bg-[#E4EAF2] dark:hover:bg-[#213B5C] border border-[#E6DFD0] dark:border-[#283D56]'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            )}

            {/* Modal Body: Grid Semua Foto */}
            <div className="p-3.5 sm:p-6 overflow-y-auto max-h-[calc(90vh-130px)]">
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2.5 sm:gap-4">
                {filteredPhotos.map((photo) => {
                  const originalIdx = photos.findIndex((p) => p.id === photo.id);
                  return (
                    <div
                      key={photo.id}
                      onClick={() => openLightbox(originalIdx >= 0 ? originalIdx : 0)}
                      className="bg-[#FFFDF8] dark:bg-[#1C3048] border border-[#E6DFD0] dark:border-[#283D56] rounded-xl overflow-hidden hover:border-[#1F3A5F] hover:shadow-md transition-all cursor-pointer group flex flex-col"
                    >
                      <div className="relative aspect-[4/3] bg-[#E4EAF2] overflow-hidden">
                        <img
                          src={photo.imageUrl}
                          alt={photo.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          loading="lazy"
                        />
                        <span className="absolute bottom-1.5 right-1.5 px-1.5 py-0.5 bg-black/60 text-white text-[9px] font-semibold rounded">
                          {photo.date}
                        </span>
                      </div>
                      <div className="p-2 sm:p-2.5 flex-1 flex flex-col justify-between">
                        <h4 className="text-[11px] sm:text-xs font-bold text-[#1F3A5F] dark:text-[#FAF6EE] line-clamp-1 group-hover:text-[#F2B544] transition-colors">
                          {photo.title}
                        </h4>
                        <p className="text-[10px] text-[#5A6472] dark:text-[#9AA8B8] line-clamp-1 mt-0.5">
                          {photo.caption}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* LIGHTBOX: TAMPILAN FOTO BESAR & DETAIL FULLSCREEN        */}
      {/* ======================================================== */}
      {lightboxIndex !== null && currentLightboxPhoto && (
        <div
          className="fixed inset-0 z-[70] bg-black/92 backdrop-blur-md flex flex-col justify-between p-3 sm:p-6 animate-fade-in select-none"
          onClick={closeLightbox}
        >
          {/* Lightbox Topbar */}
          <div
            className="flex items-center justify-between text-white shrink-0 pb-3"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded-md bg-white/20 text-xs font-mono font-bold">
                {lightboxIndex + 1} / {photos.length}
              </span>
              <span className="text-xs sm:text-sm font-semibold text-white/90 truncate max-w-[200px] sm:max-w-md">
                {currentLightboxPhoto.title}
              </span>
            </div>

            <button
              type="button"
              onClick={closeLightbox}
              className="w-9 h-9 rounded-full bg-white/15 hover:bg-white/30 text-white flex items-center justify-center transition-colors cursor-pointer"
              title="Tutup (Esc)"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Lightbox Main View with Prev / Next Buttons */}
          <div
            className="relative flex-1 flex items-center justify-center my-auto px-2"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Prev Button */}
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setLightboxIndex((prev) => (prev !== null && prev > 0 ? prev - 1 : photos.length - 1));
              }}
              className="absolute left-1 sm:left-4 z-10 w-9 h-9 sm:w-12 sm:h-12 rounded-full bg-black/50 hover:bg-black/80 text-white flex items-center justify-center backdrop-blur-xs transition-colors cursor-pointer border border-white/20"
              title="Foto Sebelumnya (Panah Kiri)"
            >
              <ChevronLeft className="w-5 h-5 sm:w-6 sm:h-6" />
            </button>

            {/* Image */}
            <img
              src={currentLightboxPhoto.imageUrl}
              alt={currentLightboxPhoto.title}
              className="max-h-[65vh] sm:max-h-[75vh] max-w-full object-contain rounded-xl shadow-2xl"
            />

            {/* Next Button */}
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setLightboxIndex((prev) => (prev !== null && prev < photos.length - 1 ? prev + 1 : 0));
              }}
              className="absolute right-1 sm:right-4 z-10 w-9 h-9 sm:w-12 sm:h-12 rounded-full bg-black/50 hover:bg-black/80 text-white flex items-center justify-center backdrop-blur-xs transition-colors cursor-pointer border border-white/20"
              title="Foto Berikutnya (Panah Kanan)"
            >
              <ChevronRight className="w-5 h-5 sm:w-6 sm:h-6" />
            </button>
          </div>

          {/* Lightbox Bottom Info */}
          <div
            className="text-center text-white shrink-0 pt-3 max-w-2xl mx-auto space-y-1"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-center gap-2 text-xs text-[#F2B544] font-bold">
              <Calendar className="w-3.5 h-3.5" />
              <span>{currentLightboxPhoto.date}</span>
            </div>
            <p className="text-xs sm:text-sm text-white/90 leading-relaxed">
              {currentLightboxPhoto.caption}
            </p>
          </div>
        </div>
      )}
    </section>
  );
};

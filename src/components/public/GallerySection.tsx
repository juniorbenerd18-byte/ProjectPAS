import React from 'react';
import { Highlight } from './Highlight';
import { SectionHeader } from './SectionHeader';
import { ScrollReveal } from '../common/ScrollReveal';

// TODO: sambungkan ke Supabase tabel 'public_gallery' (columns: id, title, image_url, caption, event_date, is_published)
export interface GalleryItem {
  id: string;
  title: string;
  caption: string;
  imageUrl: string;
  date: string;
}

const DUMMY_GALLERY_PHOTOS: GalleryItem[] = [
  {
    id: 'g-1',
    title: 'Sidang Pleno Paripurna Siswa',
    caption: 'Musyawarah perumusan agenda kerja tahunan bersama dewan pembina.',
    imageUrl: 'https://images.unsplash.com/photo-1577495508048-b635879837f1?w=800&auto=format&fit=crop&q=80',
    date: 'Oktober 2026',
  },
  {
    id: 'g-2',
    title: 'Pelatihan Soft Skill & Komunikasi',
    caption: 'Workshop public speaking dan kepemimpinan pemuda inspiratif.',
    imageUrl: 'https://images.unsplash.com/photo-1524178232363-1fb2b075b655?w=800&auto=format&fit=crop&q=80',
    date: 'September 2026',
  },
  {
    id: 'g-3',
    title: 'Turnamen Futsal Antarkelas',
    caption: 'Semangat sportivitas dan kebersamaan meriah antarjurusan kejuruan.',
    imageUrl: 'https://images.unsplash.com/photo-1517649763962-0c623266ddc0?w=800&auto=format&fit=crop&q=80',
    date: 'Agustus 2026',
  },
  {
    id: 'g-4',
    title: 'Bakti Sosial & Santunan Siswa',
    caption: 'Penyaluran sembako dan donasi buku pelajaran kepada panti asuhan.',
    imageUrl: 'https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?w=800&auto=format&fit=crop&q=80',
    date: 'Juli 2026',
  },
  {
    id: 'g-5',
    title: 'Peringatan Hari Pahlawan Nasional',
    caption: 'Upacara khidmat dan pembagian apresiasi bagi siswa berprestasi.',
    imageUrl: 'https://images.unsplash.com/photo-1511632765486-a01980e01a18?w=800&auto=format&fit=crop&q=80',
    date: 'November 2026',
  },
  {
    id: 'g-6',
    title: 'Pameran Karya Inovasi Digital',
    caption: 'Showcase aplikasi web dan produk kreatif hasil karya siswa SMK.',
    imageUrl: 'https://images.unsplash.com/photo-1531403009284-440f080d1e12?w=800&auto=format&fit=crop&q=80',
    date: 'Juni 2026',
  },
];

interface GallerySectionProps {
  photos?: GalleryItem[];
}

export const GallerySection: React.FC<GallerySectionProps> = ({
  photos = DUMMY_GALLERY_PHOTOS,
}) => {
  return (
    <section id="galeri" className="bg-white py-16 sm:py-24 border-b border-[#E2E8F0]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
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

        {/* Grid Foto Rapi dengan ScrollReveal */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          {photos.map((item, idx) => (
            <ScrollReveal
              key={item.id}
              distance={36}
              duration={700}
              delay={(idx % 3) * 110}
              className="flex flex-col h-full"
            >
              <div className="bg-white border border-[#E2E8F0] rounded-xl overflow-hidden shadow-xs hover:border-[#2563EB]/40 hover:shadow-md transition-all duration-200 group flex flex-col h-full">
                {/* Foto membulat */}
                <div className="relative aspect-4/3 bg-slate-100 overflow-hidden">
                  <img
                    src={item.imageUrl}
                    alt={item.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    loading="lazy"
                  />
                  <span className="absolute bottom-2.5 right-2.5 px-2 py-0.5 bg-black/60 backdrop-blur-xs text-white text-[11px] font-medium rounded">
                    {item.date}
                  </span>
                </div>

                {/* Caption Pendek */}
                <div className="p-4 flex-1 flex flex-col justify-between">
                  <div>
                    <h3 className="text-sm sm:text-base font-bold text-[#1E3A8A] group-hover:text-[#2563EB] transition-colors leading-snug">
                      {item.title}
                    </h3>
                    <p className="text-xs text-[#64748B] mt-1.5 line-clamp-2 leading-relaxed">
                      {item.caption}
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

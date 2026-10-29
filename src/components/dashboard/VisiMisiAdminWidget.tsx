import React, { useState } from 'react';
import {
  Compass,
  Target,
  Edit3,
  Plus,
  ImageIcon,
  Sparkles,
  ExternalLink,
  CheckCircle2,
  Quote,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { EditVisiMisiModal } from './EditVisiMisiModal';
import { ScrollReveal } from '../common/ScrollReveal';

export const VisiMisiAdminWidget: React.FC = () => {
  const { orgProfile, setActivePage } = useApp();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalInitialTab, setModalInitialTab] = useState<
    'all' | 'vision' | 'mission' | 'photo'
  >('all');

  const openModalWithTab = (tab: 'all' | 'vision' | 'mission' | 'photo') => {
    setModalInitialTab(tab);
    setIsModalOpen(true);
  };

  const visionPhoto =
    orgProfile.visionPhotoUrl ||
    'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=800&auto=format&fit=crop&q=80';

  const missions =
    orgProfile.mission && orgProfile.mission.length > 0
      ? orgProfile.mission
      : [
          'Menumbuhkan keimanan dan ketaqwaan kepada Tuhan Yang Maha Esa.',
          'Meningkatkan keterampilan digital dan inovasi teknologi bagi seluruh siswa SMK.',
          'Menyelenggarakan kegiatan ekstrakurikuler yang mendukung kompetensi keahlian.',
        ];

  return (
    <>
      <ScrollReveal distance={28} duration={600}>
        <div className="bg-[#FFFDF8] dark:bg-[#17293E] rounded-[20px] border border-[#E6DFD0] dark:border-[#283D56] p-6 shadow-none space-y-5">
          {/* Header Widget */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#E6DFD0] dark:border-[#283D56]">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-[12px] bg-[#1F3A5F] text-[#FAF6EE] flex items-center justify-center shrink-0">
                <Compass className="w-5 h-5" strokeWidth={2} />
              </div>
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="text-base sm:text-lg font-extrabold text-[#1F3A5F] dark:text-[#FAF6EE]">
                    Visi &amp; Misi Organisasi
                  </h3>
                  <span className="inline-flex items-center gap-1.5 text-[13px] font-bold text-[#1F3A5F] dark:text-[#FAF6EE] bg-[#E4EAF2] dark:bg-[#213B5C] border border-[#E6DFD0] dark:border-[#283D56] px-2.5 py-0.5 rounded-full">
                    <CheckCircle2 className="w-3.5 h-3.5 text-[#1F3A5F] dark:text-[#F2B544]" strokeWidth={2} />
                    <span>Tampil di Portal Publik</span>
                  </span>
                </div>
                <p className="text-[14px] text-[#5A6472] dark:text-[#9AA8B8] mt-0.5">
                  Rumusan visi, butir misi strategis, serta foto representasi sekolah yang dapat disesuaikan.
                </p>
              </div>
            </div>

            {/* Tombol Aksi Cepat */}
            <div className="flex items-center gap-2 self-start sm:self-auto flex-wrap">
              <button
                type="button"
                onClick={() => openModalWithTab('all')}
                className="min-h-[44px] px-4 py-2 bg-[#1F3A5F] hover:bg-[#162B46] text-[#FAF6EE] text-[14px] font-bold rounded-[12px] transition-all flex items-center gap-2 cursor-pointer shadow-none"
              >
                <Edit3 className="w-4 h-4" strokeWidth={2} />
                <span>Edit Visi, Misi &amp; Foto</span>
              </button>
              <button
                type="button"
                onClick={() => openModalWithTab('mission')}
                className="min-h-[44px] px-4 py-2 bg-transparent hover:bg-[#E4EAF2] dark:hover:bg-[#213B5C] text-[#1F3A5F] dark:text-[#FAF6EE] text-[14px] font-bold rounded-[12px] border border-[#E6DFD0] dark:border-[#283D56] transition-colors flex items-center gap-2 cursor-pointer shadow-none"
              >
                <Plus className="w-4 h-4" strokeWidth={2} />
                <span>Tambah Misi</span>
              </button>
              <button
                type="button"
                onClick={() => setActivePage('portal-publik')}
                className="min-h-[44px] min-w-[44px] flex items-center justify-center text-[#5A6472] hover:text-[#1F3A5F] dark:hover:text-[#FAF6EE] hover:bg-[#E4EAF2] dark:hover:bg-[#213B5C] rounded-[12px] border border-[#E6DFD0] dark:border-[#283D56] transition-colors cursor-pointer"
                title="Buka tampilan di Portal Publik"
                aria-label="Buka portal publik"
              >
                <ExternalLink className="w-4 h-4" strokeWidth={2} />
              </button>
            </div>
          </div>

          {/* Konten: Visi & Misi dengan Thumbnail Foto Kompak */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">
            {/* Kolom Utama: Visi & Misi */}
            <div className="lg:col-span-8 flex flex-col justify-between space-y-4">
              {/* Visi Box */}
              <div className="p-4 sm:p-5 rounded-[14px] bg-[#E4EAF2] dark:bg-[#213B5C] border border-[#E6DFD0] dark:border-[#283D56] space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-[8px] bg-[#1F3A5F] text-[#FAF6EE] flex items-center justify-center">
                      <Quote className="w-3.5 h-3.5" strokeWidth={2} />
                    </div>
                    <span className="text-[14px] font-extrabold text-[#1F3A5F] dark:text-[#FAF6EE]">
                      Visi Organisasi
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => openModalWithTab('vision')}
                    className="text-[14px] font-bold text-[#1F3A5F] dark:text-[#F2B544] hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    <Edit3 className="w-3.5 h-3.5" strokeWidth={2} />
                    <span>Edit Visi</span>
                  </button>
                </div>
                <p className="text-[15px] text-[#1F3A5F] dark:text-[#FAF6EE] font-medium leading-relaxed italic">
                  "{orgProfile.vision || 'Belum ada visi yang ditetapkan.'}"
                </p>
              </div>

              {/* Misi Box */}
              <div className="p-4 sm:p-5 rounded-[14px] bg-[#FAF6EE] dark:bg-[#17293E] border border-[#E6DFD0] dark:border-[#283D56] space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-[8px] bg-[#1F3A5F] text-[#FAF6EE] flex items-center justify-center">
                      <Target className="w-3.5 h-3.5" strokeWidth={2} />
                    </div>
                    <span className="text-[14px] font-extrabold text-[#1F3A5F] dark:text-[#FAF6EE]">
                      Misi Strategis ({missions.length} Butir)
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => openModalWithTab('mission')}
                    className="text-[14px] font-bold text-[#1F3A5F] dark:text-[#F2B544] hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" strokeWidth={2} />
                    <span>Kelola Misi</span>
                  </button>
                </div>

                <div className="space-y-2.5 max-h-[170px] overflow-y-auto pr-1">
                  {missions.map((m, idx) => (
                    <div
                      key={idx}
                      className="flex items-start gap-3 text-[15px] text-[#1F3A5F] dark:text-[#FAF6EE]"
                    >
                      <span className="w-5 h-5 rounded-full bg-[#E4EAF2] dark:bg-[#213B5C] text-[#1F3A5F] dark:text-[#FAF6EE] flex items-center justify-center text-[12px] font-black shrink-0 mt-0.5">
                        {idx + 1}
                      </span>
                      <p className="leading-snug">{m}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Status Sinkronisasi */}
              <div className="flex items-center justify-between text-[14px] text-[#5A6472] dark:text-[#9AA8B8] pt-1">
                <span className="flex items-center gap-1.5 font-semibold text-[#1F3A5F] dark:text-[#F2B544]">
                  <CheckCircle2 className="w-4 h-4" strokeWidth={2} />
                  <span>Tersinkronisasi otomatis ke portal publik</span>
                </span>
                <span>Terakhir diperbarui: Realtime</span>
              </div>
            </div>

            {/* Kolom Thumbnail Foto Kompak (Tidak Mendominasi Halaman) */}
            <div className="lg:col-span-4 flex flex-col justify-between rounded-[14px] border border-[#E6DFD0] dark:border-[#283D56] overflow-hidden bg-[#FAF6EE] dark:bg-[#1C3048] group p-3.5">
              <div className="relative aspect-video sm:aspect-4/3 rounded-[12px] overflow-hidden bg-[#E6DFD0]">
                <img
                  src={visionPhoto}
                  alt="Foto Utama Visi Misi Organisasi"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute inset-0 bg-[#0E1B2C]/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center p-2">
                  <button
                    type="button"
                    onClick={() => openModalWithTab('photo')}
                    className="min-h-[40px] px-3 py-1.5 rounded-[10px] bg-[#FFFDF8] text-[#1F3A5F] text-[13px] font-bold hover:bg-[#FAF6EE] transition-colors flex items-center gap-1.5 cursor-pointer shadow-none"
                  >
                    <ImageIcon className="w-4 h-4" strokeWidth={2} />
                    <span>Ganti Foto</span>
                  </button>
                </div>
              </div>

              <div className="mt-3 flex items-center justify-between text-[13px]">
                <div>
                  <p className="font-bold text-[#1F3A5F] dark:text-[#FAF6EE] line-clamp-1">
                    {orgProfile.schoolName || 'SMK Negeri 1 Cerdas Bangsa'}
                  </p>
                  <p className="text-[#5A6472] dark:text-[#9AA8B8]">
                    Masa Bakti {orgProfile.academicYear || '2025/2026'}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => openModalWithTab('photo')}
                  className="text-[13px] font-bold text-[#1F3A5F] dark:text-[#F2B544] hover:underline cursor-pointer"
                >
                  Ubah
                </button>
              </div>
            </div>
          </div>
        </div>
      </ScrollReveal>

      {/* Edit Modal */}
      <EditVisiMisiModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        initialTab={modalInitialTab}
      />
    </>
  );
};

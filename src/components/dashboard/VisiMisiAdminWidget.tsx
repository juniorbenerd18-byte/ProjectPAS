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
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 p-5 sm:p-6 shadow-2xs space-y-5">
          {/* Header Widget */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100 dark:border-slate-800">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-700 text-white flex items-center justify-center shrink-0 shadow-xs">
                <Compass className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">
                    Visi, Misi &amp; Foto Organisasi
                  </h3>
                  <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/70 border border-emerald-200 dark:border-emerald-800 px-2 py-0.5 rounded-full">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    Tampil di Portal Publik
                  </span>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Rumusan visi, butir misi strategis, serta foto representasi sekolah yang dapat diubah kapan saja.
                </p>
              </div>
            </div>

            {/* Tombol Aksi Cepat */}
            <div className="flex items-center gap-2 self-start sm:self-auto flex-wrap">
              <button
                type="button"
                onClick={() => openModalWithTab('all')}
                className="px-3.5 py-2 bg-[#2563EB] hover:bg-blue-700 active:scale-95 text-white text-xs font-bold rounded-xl transition-all shadow-xs flex items-center gap-1.5 cursor-pointer"
              >
                <Edit3 className="w-3.5 h-3.5" />
                <span>Edit Visi, Misi &amp; Foto</span>
              </button>
              <button
                type="button"
                onClick={() => openModalWithTab('mission')}
                className="px-3 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-semibold rounded-xl transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Tambah Misi</span>
              </button>
              <button
                type="button"
                onClick={() => setActivePage('portal-publik')}
                className="p-2 text-slate-400 hover:text-[#2563EB] dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950/60 rounded-xl transition-colors cursor-pointer"
                title="Lihat tampilan di Portal Publik"
              >
                <ExternalLink className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Grid Konten: Kiri (Foto) & Kanan (Visi + Misi) */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">
            {/* Kolom Kiri: Foto Organisasi / Visi Misi */}
            <div className="lg:col-span-4 flex flex-col justify-between rounded-2xl border border-slate-200/80 dark:border-slate-800 overflow-hidden bg-slate-50 dark:bg-slate-800/40 group relative">
              <div className="relative aspect-4/3 sm:aspect-video lg:aspect-auto lg:h-full w-full overflow-hidden bg-slate-100 dark:bg-slate-800 min-h-[220px]">
                <img
                  src={visionPhoto}
                  alt="Foto Utama Visi Misi Organisasi"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-950/20 to-transparent" />

                {/* Badge Melayang */}
                <div className="absolute top-3 left-3">
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-white/90 dark:bg-slate-900/90 backdrop-blur-md text-[#2563EB] dark:text-blue-300 text-[10px] font-bold shadow-xs">
                    <Sparkles className="w-3 h-3" />
                    <span>Foto Visi Misi</span>
                  </span>
                </div>

                {/* Overlay Button "Ganti Foto" on hover */}
                <div className="absolute inset-0 bg-slate-900/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center p-4">
                  <button
                    type="button"
                    onClick={() => openModalWithTab('photo')}
                    className="px-4 py-2 rounded-xl bg-white text-slate-900 text-xs font-bold shadow-lg hover:bg-slate-100 transition-colors flex items-center gap-2 cursor-pointer"
                  >
                    <ImageIcon className="w-4 h-4 text-[#2563EB]" />
                    <span>Ganti / Unggah Foto</span>
                  </button>
                </div>

                {/* Caption di bagian bawah foto */}
                <div className="absolute bottom-3 left-3 right-3 text-white">
                  <p className="text-[11px] font-bold leading-tight drop-shadow-sm">
                    {orgProfile.schoolName || 'SMK Negeri 1 Cerdas Bangsa'}
                  </p>
                  <p className="text-[10px] text-white/80 mt-0.5">
                    Masa Bakti {orgProfile.academicYear || '2025/2026'}
                  </p>
                </div>
              </div>
            </div>

            {/* Kolom Kanan: Visi & Misi */}
            <div className="lg:col-span-8 flex flex-col justify-between space-y-4">
              {/* Visi Box */}
              <div className="p-4 rounded-xl bg-[#EFF6FF] dark:bg-blue-950/40 border border-blue-100 dark:border-blue-900/60 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-5 h-5 rounded-md bg-[#2563EB] text-white flex items-center justify-center">
                      <Quote className="w-3 h-3" />
                    </div>
                    <span className="text-[11px] font-extrabold uppercase tracking-wider text-[#1E3A8A] dark:text-blue-300">
                      Visi Organisasi
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => openModalWithTab('vision')}
                    className="text-[11px] font-bold text-[#2563EB] hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    <Edit3 className="w-3 h-3" />
                    <span>Edit Visi</span>
                  </button>
                </div>
                <p className="text-xs sm:text-sm text-slate-800 dark:text-slate-100 font-medium leading-relaxed italic">
                  "{orgProfile.vision || 'Belum ada visi yang ditetapkan.'}"
                </p>
              </div>

              {/* Misi Box */}
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-5 h-5 rounded-md bg-emerald-600 text-white flex items-center justify-center">
                      <Target className="w-3 h-3" />
                    </div>
                    <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                      Misi Strategis ({missions.length} Butir)
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => openModalWithTab('mission')}
                    className="text-[11px] font-bold text-[#2563EB] hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    <Plus className="w-3 h-3" />
                    <span>Kelola Misi</span>
                  </button>
                </div>

                <div className="space-y-2 max-h-[160px] overflow-y-auto pr-1">
                  {missions.map((m, idx) => (
                    <div
                      key={idx}
                      className="flex items-start gap-2.5 text-xs text-slate-700 dark:text-slate-200"
                    >
                      <span className="w-4 h-4 rounded-full bg-blue-100 dark:bg-blue-950/90 text-[#2563EB] dark:text-blue-300 flex items-center justify-center text-[10px] font-black shrink-0 mt-0.5">
                        {idx + 1}
                      </span>
                      <p className="leading-snug">{m}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Status sinkronisasi */}
              <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1">
                <span className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 font-medium">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Tersinkronisasi otomatis ke portal publik</span>
                </span>
                <span className="text-slate-400">
                  Terakhir diperbarui: Realtime
                </span>
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

import React, { useState } from 'react';
import {
  FileText,
  Calendar,
  Clock,
  ExternalLink,
  Edit3,
  Lock,
  Unlock,
  CheckCircle2,
  Copy,
  AlertCircle,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { EditRegistrationModal } from './EditRegistrationModal';
import { ScrollReveal } from '../common/ScrollReveal';

export const RegistrationAdminWidget: React.FC = () => {
  const { orgProfile, updateOrgProfile, showToast } = useApp();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  const isRegistrationOpen = orgProfile.isRegistrationOpen !== false;
  const gformUrl =
    orgProfile.registrationGFormUrl ||
    'https://forms.gle/zG5aSLW3MzWud3uz7';
  const openDate = orgProfile.registrationOpenDate || '01 November 2026';
  const closeDate = orgProfile.registrationCloseDate || '20 November 2026';
  const noticeMessage =
    orgProfile.registrationNotice ||
    'Pendaftaran Anggota Baru Gelombang 1 ditutup sementara. Gelombang 2 akan dibuka kembali pada 15 Januari 2027 pukul 08:00 WIB.';

  const handleToggleStatus = () => {
    const nextStatus = !isRegistrationOpen;
    updateOrgProfile({
      isRegistrationOpen: nextStatus,
    });
    showToast(
      `Status pendaftaran anggota diubah menjadi: ${
        nextStatus ? 'DIBUKA' : 'DITUTUP'
      }`,
      nextStatus ? 'success' : 'info'
    );
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(gformUrl);
    setCopied(true);
    showToast('Tautan Google Form berhasil disalin!', 'success');
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <>
      <ScrollReveal distance={28} duration={650}>
        <div className="bg-[#FFFDF8] dark:bg-[#17293E] rounded-[20px] border border-[#E6DFD0] dark:border-[#283D56] p-6 shadow-none space-y-4">
          {/* Header Widget */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#E6DFD0] dark:border-[#283D56]">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-[12px] bg-[#1F3A5F] text-[#FAF6EE] flex items-center justify-center shrink-0">
                <FileText className="w-5 h-5" strokeWidth={2} />
              </div>
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="text-base sm:text-lg font-extrabold text-[#1F3A5F] dark:text-[#FAF6EE]">
                    Pendaftaran Anggota (Google Form)
                  </h3>
                  <span
                    className={`inline-flex items-center gap-1.5 text-[13px] font-bold px-2.5 py-0.5 rounded-full border ${
                      isRegistrationOpen
                        ? 'bg-[#E4EAF2] text-[#1F3A5F] border-[#E6DFD0] dark:bg-[#213B5C] dark:text-[#FAF6EE]'
                        : 'bg-[#FBEBC8] text-[#7A4B00] border-[#F2B544] dark:bg-[#3D2E14] dark:text-[#FFD584]'
                    }`}
                  >
                    {isRegistrationOpen ? (
                      <CheckCircle2 className="w-3.5 h-3.5 text-[#1F3A5F] dark:text-[#F2B544]" strokeWidth={2} />
                    ) : (
                      <Lock className="w-3.5 h-3.5 text-[#F2B544]" strokeWidth={2} />
                    )}
                    <span>{isRegistrationOpen ? 'Akses Terbuka' : 'Akses Ditutup'}</span>
                  </span>
                </div>
                <p className="text-[14px] text-[#5A6472] dark:text-[#9AA8B8] mt-0.5">
                  Atur buka/tutup pendaftaran siswa baru secara online via Google Form di portal publik.
                </p>
              </div>
            </div>

            {/* Tombol Aksi Cepat */}
            <div className="flex items-center gap-2 self-start sm:self-auto flex-wrap">
              {/* Tombol 1-Click Toggle */}
              <button
                type="button"
                onClick={handleToggleStatus}
                className={`min-h-[44px] px-3.5 py-2 rounded-[12px] text-[14px] font-bold transition-all flex items-center gap-2 cursor-pointer shadow-none border ${
                  isRegistrationOpen
                    ? 'bg-transparent hover:bg-[#FBEBC8] text-[#1F3A5F] dark:text-[#FAF6EE] border-[#E6DFD0] dark:border-[#283D56]'
                    : 'bg-[#F2B544] hover:bg-[#E0A12F] text-[#1F3A5F] border-[#F2B544]'
                }`}
                title={
                  isRegistrationOpen
                    ? 'Klik untuk Menutup Pendaftaran'
                    : 'Klik untuk Membuka Pendaftaran'
                }
              >
                {isRegistrationOpen ? (
                  <>
                    <Lock className="w-4 h-4 text-[#F2B544]" strokeWidth={2} />
                    <span>Tutup Pendaftaran</span>
                  </>
                ) : (
                  <>
                    <Unlock className="w-4 h-4 text-[#1F3A5F]" strokeWidth={2} />
                    <span>Buka Pendaftaran</span>
                  </>
                )}
              </button>

              {/* Tombol Edit Modal */}
              <button
                type="button"
                onClick={() => setIsModalOpen(true)}
                className="min-h-[44px] px-4 py-2 bg-[#1F3A5F] hover:bg-[#162B46] text-[#FAF6EE] text-[14px] font-bold rounded-[12px] transition-all shadow-none flex items-center gap-2 cursor-pointer"
              >
                <Edit3 className="w-4 h-4" strokeWidth={2} />
                <span>Pengaturan GForm</span>
              </button>
            </div>
          </div>

          {/* Grid Informasi Detail */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Card 1: Link GForm */}
            <div className="p-4 rounded-[14px] bg-[#FAF6EE] dark:bg-[#1C3048] border border-[#E6DFD0] dark:border-[#283D56] flex flex-col justify-between space-y-2">
              <span className="text-[14px] font-bold text-[#5A6472] dark:text-[#9AA8B8] flex items-center gap-1.5">
                <FileText className="w-4 h-4 text-[#1F3A5F] dark:text-[#FAF6EE]" strokeWidth={2} />
                Tautan Google Form
              </span>
              <p className="text-[14px] text-[#1F3A5F] dark:text-[#FAF6EE] font-mono truncate" title={gformUrl}>
                {gformUrl}
              </p>
              <div className="flex items-center gap-3 pt-2 border-t border-[#E6DFD0] dark:border-[#283D56] text-[13px]">
                <button
                  type="button"
                  onClick={handleCopyLink}
                  className="font-bold text-[#1F3A5F] dark:text-[#F2B544] hover:underline flex items-center gap-1 cursor-pointer"
                >
                  <Copy className="w-3.5 h-3.5" strokeWidth={2} />
                  <span>{copied ? 'Tersalin!' : 'Salin Link'}</span>
                </button>
                <span className="text-[#5A6472]">•</span>
                <a
                  href={gformUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-bold text-[#5A6472] dark:text-[#9AA8B8] hover:text-[#1F3A5F] dark:hover:text-[#FAF6EE] flex items-center gap-1"
                >
                  <span>Uji Buka</span>
                  <ExternalLink className="w-3.5 h-3.5" strokeWidth={2} />
                </a>
              </div>
            </div>

            {/* Card 2: Periode Jadwal */}
            <div className="p-4 rounded-[14px] bg-[#FAF6EE] dark:bg-[#1C3048] border border-[#E6DFD0] dark:border-[#283D56] flex flex-col justify-between space-y-2">
              <span className="text-[14px] font-bold text-[#5A6472] dark:text-[#9AA8B8] flex items-center gap-1.5">
                <Calendar className="w-4 h-4 text-[#1F3A5F] dark:text-[#FAF6EE]" strokeWidth={2} />
                Periode Pendaftaran
              </span>
              <div>
                <p className="text-[14px] font-bold text-[#1F3A5F] dark:text-[#FAF6EE]">
                  {openDate} s.d {closeDate}
                </p>
                <p className="text-[13px] text-[#5A6472] dark:text-[#9AA8B8] mt-0.5">
                  Ditampilkan kepada pengunjung portal publik
                </p>
              </div>
              <div className="text-[13px] text-[#5A6472] dark:text-[#9AA8B8] pt-2 border-t border-[#E6DFD0] dark:border-[#283D56]">
                <span>Status: </span>
                <span className="font-bold text-[#1F3A5F] dark:text-[#FAF6EE]">
                  {isRegistrationOpen ? 'Aktif Menerima Siswa' : 'Ditutup Sementara'}
                </span>
              </div>
            </div>

            {/* Card 3: Pesan Keterangan Kapan Dibuka */}
            <div className="p-4 rounded-[14px] bg-[#FAF6EE] dark:bg-[#1C3048] border border-[#E6DFD0] dark:border-[#283D56] flex flex-col justify-between space-y-2">
              <span className="text-[14px] font-bold text-[#5A6472] dark:text-[#9AA8B8] flex items-center gap-1.5">
                <AlertCircle className="w-4 h-4 text-[#F2B544]" strokeWidth={2} />
                Keterangan Pendaftaran
              </span>
              <p className="text-[14px] text-[#1F3A5F] dark:text-[#FAF6EE] line-clamp-2 italic leading-relaxed">
                "{noticeMessage}"
              </p>
              <div className="text-[13px] text-[#5A6472] dark:text-[#9AA8B8] pt-2 border-t border-[#E6DFD0] dark:border-[#283D56] font-medium">
                Tampil otomatis di portal publik saat ditutup
              </div>
            </div>
          </div>
        </div>
      </ScrollReveal>

      {/* Modal Pengaturan GForm */}
      <EditRegistrationModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </>
  );
};

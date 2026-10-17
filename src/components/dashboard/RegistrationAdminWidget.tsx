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
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 p-5 sm:p-6 shadow-2xs space-y-4">
          {/* Header Widget */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100 dark:border-slate-800">
            <div className="flex items-start gap-3">
              <div
                className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 shadow-xs ${
                  isRegistrationOpen
                    ? 'bg-gradient-to-br from-emerald-500 to-teal-700 text-white'
                    : 'bg-gradient-to-br from-rose-500 to-red-700 text-white'
                }`}
              >
                <FileText className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">
                    Pendaftaran Anggota (Google Form)
                  </h3>
                  <span
                    className={`inline-flex items-center gap-1.5 text-[11px] font-extrabold px-2.5 py-0.5 rounded-full border ${
                      isRegistrationOpen
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/70 dark:text-emerald-300'
                        : 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/70 dark:text-rose-300'
                    }`}
                  >
                    <span
                      className={`w-2 h-2 rounded-full ${
                        isRegistrationOpen
                          ? 'bg-emerald-500 animate-pulse'
                          : 'bg-rose-500'
                      }`}
                    />
                    {isRegistrationOpen ? 'AKSES DIBUKA' : 'AKSES DITUTUP'}
                  </span>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
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
                className={`px-3 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-xs ${
                  isRegistrationOpen
                    ? 'bg-rose-50 hover:bg-rose-100 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300 border border-rose-200 dark:border-rose-900'
                    : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-900'
                }`}
                title={
                  isRegistrationOpen
                    ? 'Klik untuk Menutup Pendaftaran'
                    : 'Klik untuk Membuka Pendaftaran'
                }
              >
                {isRegistrationOpen ? (
                  <>
                    <Lock className="w-3.5 h-3.5" />
                    <span>Tutup Pendaftaran</span>
                  </>
                ) : (
                  <>
                    <Unlock className="w-3.5 h-3.5" />
                    <span>Buka Pendaftaran</span>
                  </>
                )}
              </button>

              {/* Tombol Edit Modal */}
              <button
                type="button"
                onClick={() => setIsModalOpen(true)}
                className="px-3.5 py-2 bg-[#2563EB] hover:bg-blue-700 active:scale-95 text-white text-xs font-bold rounded-xl transition-all shadow-xs flex items-center gap-1.5 cursor-pointer"
              >
                <Edit3 className="w-3.5 h-3.5" />
                <span>Pengaturan GForm</span>
              </button>
            </div>
          </div>

          {/* Grid Informasi Detail */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Card 1: Link GForm */}
            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-800 flex flex-col justify-between space-y-2">
              <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5 text-[#2563EB]" />
                Tautan Google Form
              </span>
              <p className="text-xs text-slate-800 dark:text-slate-200 font-mono truncate" title={gformUrl}>
                {gformUrl}
              </p>
              <div className="flex items-center gap-2 pt-1 border-t border-slate-100 dark:border-slate-800/80 text-[11px]">
                <button
                  type="button"
                  onClick={handleCopyLink}
                  className="font-semibold text-[#2563EB] dark:text-blue-400 hover:underline flex items-center gap-1 cursor-pointer"
                >
                  <Copy className="w-3 h-3" />
                  <span>{copied ? 'Tersalin!' : 'Salin Link'}</span>
                </button>
                <span className="text-slate-300 dark:text-slate-700">•</span>
                <a
                  href={gformUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-semibold text-slate-600 dark:text-slate-400 hover:text-[#2563EB] flex items-center gap-1"
                >
                  <span>Uji Buka</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            </div>

            {/* Card 2: Periode Jadwal */}
            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-800 flex flex-col justify-between space-y-2">
              <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-emerald-600" />
                Periode Pendaftaran
              </span>
              <div>
                <p className="text-xs font-bold text-slate-800 dark:text-slate-200">
                  {openDate} s.d {closeDate}
                </p>
                <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">
                  Ditampilkan kepada pengunjung portal publik
                </p>
              </div>
              <div className="text-[11px] text-slate-500 pt-1 border-t border-slate-100 dark:border-slate-800/80">
                <span>Status: </span>
                <span className={isRegistrationOpen ? 'text-emerald-600 font-bold' : 'text-rose-600 font-bold'}>
                  {isRegistrationOpen ? 'Aktif Menerima Formulir' : 'Ditutup Sementara'}
                </span>
              </div>
            </div>

            {/* Card 3: Pesan Keterangan Kapan Dibuka */}
            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-800 flex flex-col justify-between space-y-2">
              <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                <AlertCircle className="w-3.5 h-3.5 text-amber-500" />
                Keterangan Kapan Dibuka
              </span>
              <p className="text-xs text-slate-700 dark:text-slate-300 line-clamp-2 italic leading-relaxed">
                "{noticeMessage}"
              </p>
              <div className="text-[10px] text-amber-700 dark:text-amber-400 pt-1 border-t border-slate-100 dark:border-slate-800/80 font-medium">
                Tampil otomatis saat pendaftaran ditutup
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

import React, { useState, useEffect } from 'react';
import {
  FileText,
  Calendar,
  Clock,
  ExternalLink,
  CheckCircle2,
  Lock,
  Unlock,
  AlertCircle,
  HelpCircle,
  Save,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { Modal } from '../common/Modal';

interface EditRegistrationModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const EditRegistrationModal: React.FC<EditRegistrationModalProps> = ({
  isOpen,
  onClose,
}) => {
  const { orgProfile, updateOrgProfile, showToast } = useApp();

  const [isOpenRegistration, setIsOpenRegistration] = useState(
    orgProfile.isRegistrationOpen !== false
  );
  const [gformUrl, setGformUrl] = useState(
    orgProfile.registrationGFormUrl || 'https://forms.gle/zG5aSLW3MzWud3uz7'
  );
  const [openDate, setOpenDate] = useState(
    orgProfile.registrationOpenDate || '01 November 2026'
  );
  const [closeDate, setCloseDate] = useState(
    orgProfile.registrationCloseDate || '20 November 2026'
  );
  const [noticeMessage, setNoticeMessage] = useState(
    orgProfile.registrationNotice ||
      'Pendaftaran Anggota Baru Gelombang 1 ditutup sementara. Gelombang 2 akan dibuka kembali pada 15 Januari 2027 pukul 08:00 WIB.'
  );

  useEffect(() => {
    if (isOpen) {
      setIsOpenRegistration(orgProfile.isRegistrationOpen !== false);
      setGformUrl(
        orgProfile.registrationGFormUrl || 'https://forms.gle/zG5aSLW3MzWud3uz7'
      );
      setOpenDate(orgProfile.registrationOpenDate || '01 November 2026');
      setCloseDate(orgProfile.registrationCloseDate || '20 November 2026');
      setNoticeMessage(
        orgProfile.registrationNotice ||
          'Pendaftaran Anggota Baru Gelombang 1 ditutup sementara. Gelombang 2 akan dibuka kembali pada 15 Januari 2027 pukul 08:00 WIB.'
      );
    }
  }, [isOpen, orgProfile]);

  const handleTestLink = () => {
    if (!gformUrl.trim()) {
      alert('Masukkan link Google Form terlebih dahulu.');
      return;
    }
    window.open(gformUrl, '_blank', 'noopener,noreferrer');
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();

    if (!gformUrl.trim()) {
      alert('Tautan Google Form tidak boleh kosong.');
      return;
    }

    updateOrgProfile({
      isRegistrationOpen: isOpenRegistration,
      registrationGFormUrl: gformUrl.trim(),
      registrationOpenDate: openDate.trim(),
      registrationCloseDate: closeDate.trim(),
      registrationNotice: noticeMessage.trim(),
    });

    showToast(
      `Pengaturan pendaftaran berhasil disimpan! Status: ${
        isOpenRegistration ? 'DIBUKA' : 'DITUTUP'
      }`,
      'success'
    );
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Pengaturan Akses Pendaftaran Anggota (Google Form)"
      maxWidth="2xl"
    >
      <form onSubmit={handleSave} className="space-y-6">
        {/* Toggle Status Buka/Tutup */}
        <div className="p-4 sm:p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-800/50 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <div
              className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                isOpenRegistration
                  ? 'bg-emerald-500 text-white'
                  : 'bg-rose-500 text-white'
              }`}
            >
              {isOpenRegistration ? (
                <Unlock className="w-5 h-5" />
              ) : (
                <Lock className="w-5 h-5" />
              )}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-sm text-slate-900 dark:text-white">
                  Status Akses Pendaftaran
                </span>
                <span
                  className={`text-[11px] font-extrabold px-2.5 py-0.5 rounded-full border ${
                    isOpenRegistration
                      ? 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/60 dark:text-emerald-300'
                      : 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/60 dark:text-rose-300'
                  }`}
                >
                  {isOpenRegistration ? 'SEDANG DIBUKA' : 'SEDANG DITUTUP'}
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                {isOpenRegistration
                  ? 'Tombol di portal publik aktif dan mengarahkan siswa langsung ke Google Form.'
                  : 'Tombol di portal dinonaktifkan dan menampilkan jadwal kapan akan dibuka kembali.'}
              </p>
            </div>
          </div>

          {/* Toggle Switch */}
          <button
            type="button"
            onClick={() => setIsOpenRegistration(!isOpenRegistration)}
            className={`relative inline-flex h-7 w-14 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-hidden ${
              isOpenRegistration ? 'bg-emerald-600' : 'bg-slate-300 dark:bg-slate-700'
            }`}
          >
            <span
              className={`pointer-events-none inline-block h-6 w-6 transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out ${
                isOpenRegistration ? 'translate-x-7' : 'translate-x-0'
              }`}
            />
          </button>
        </div>

        {/* Form Link Google Form */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-200 flex items-center gap-1.5">
              <FileText className="w-4 h-4 text-[#2563EB]" />
              <span>Link URL Google Form Pendaftaran</span>
              <span className="text-rose-500">*</span>
            </label>
            <button
              type="button"
              onClick={handleTestLink}
              className="text-xs font-semibold text-[#2563EB] hover:underline flex items-center gap-1 cursor-pointer"
            >
              <span>Uji Buka Link</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </button>
          </div>
          <input
            type="url"
            required
            value={gformUrl}
            onChange={(e) => setGformUrl(e.target.value)}
            placeholder="https://docs.google.com/forms/d/e/.../viewform atau https://forms.gle/..."
            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-[#2563EB] text-slate-900 dark:text-white"
          />
          <p className="text-[11px] text-slate-500 dark:text-slate-400">
            Salin tautan formulir pendaftaran dari Google Forms Anda (mendukung URL pendek forms.gle).
          </p>
        </div>

        {/* Tanggal Buka & Tutup */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-200 flex items-center gap-1.5">
              <Calendar className="w-4 h-4 text-emerald-600" />
              <span>Tanggal / Periode Buka</span>
            </label>
            <input
              type="text"
              value={openDate}
              onChange={(e) => setOpenDate(e.target.value)}
              placeholder="Contoh: 01 November 2026"
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-[#2563EB] text-slate-900 dark:text-white"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-200 flex items-center gap-1.5">
              <Clock className="w-4 h-4 text-rose-600" />
              <span>Tanggal Penutupan</span>
            </label>
            <input
              type="text"
              value={closeDate}
              onChange={(e) => setCloseDate(e.target.value)}
              placeholder="Contoh: 20 November 2026"
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-[#2563EB] text-slate-900 dark:text-white"
            />
          </div>
        </div>

        {/* Keterangan Kapan Akan Dibuka (Penting untuk calon pendaftar saat ditutup) */}
        <div className="space-y-2">
          <label className="text-xs font-bold text-slate-700 dark:text-slate-200 flex items-center gap-1.5">
            <AlertCircle className="w-4 h-4 text-amber-500" />
            <span>Pesan Keterangan Kapan Dibuka (Tampil saat Pendaftaran Ditutup)</span>
          </label>
          <textarea
            rows={3}
            value={noticeMessage}
            onChange={(e) => setNoticeMessage(e.target.value)}
            placeholder="Contoh: Pendaftaran gelombang ini telah ditutup. Gelombang 2 akan dibuka kembali pada 15 Januari 2027 pukul 08:00 WIB."
            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-[#2563EB] text-slate-900 dark:text-white leading-relaxed resize-none"
          />
          <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200/80 dark:border-amber-900/60 text-[11px] text-amber-900 dark:text-amber-200 flex items-start gap-2">
            <HelpCircle className="w-4 h-4 shrink-0 mt-0.5 text-amber-600" />
            <span>
              Teks ini akan otomatis ditampilkan di banner portal publik jika status pendaftaran sedang <strong>DITUTUP</strong>, sehingga siswa mengetahui tanggal dibukanya pendaftaran berikutnya.
            </span>
          </div>
        </div>

        {/* Tombol Aksi */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 text-xs font-semibold hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
          >
            Batal
          </button>
          <button
            type="submit"
            className="px-5 py-2.5 rounded-xl bg-[#2563EB] hover:bg-blue-700 active:scale-95 text-white text-xs font-bold shadow-md transition-all flex items-center gap-2 cursor-pointer"
          >
            <Save className="w-4 h-4" />
            <span>Simpan Pengaturan</span>
          </button>
        </div>
      </form>
    </Modal>
  );
};

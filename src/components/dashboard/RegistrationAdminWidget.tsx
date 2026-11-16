import React, { useState } from 'react';
import {
  FileText,
  Calendar,
  ExternalLink,
  Edit3,
  Lock,
  Unlock,
  CheckCircle2,
  Copy,
  AlertCircle,
  UserPlus,
  ArrowUpRight,
  UserCheck,
  Clock,
  Phone,
  Sparkles,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { EditRegistrationModal } from './EditRegistrationModal';
import { ScrollReveal } from '../common/ScrollReveal';

export const RegistrationAdminWidget: React.FC = () => {
  const {
    orgProfile,
    updateOrgProfile,
    recruitments,
    approveRecruitmentToMember,
    setActivePage,
    setKeanggotaanTab,
    showToast,
  } = useApp();

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

  // Recruitment Metrics
  const totalApplicants = recruitments.length;
  const pendingApplicants = recruitments.filter(
    (r) => r.status === 'menunggu' || r.status === 'lolos_berkas'
  ).length;
  const interviewApplicants = recruitments.filter((r) => r.status === 'wawancara').length;
  const acceptedApplicants = recruitments.filter((r) => r.status === 'diterima').length;

  // Latest 4 Applicants
  const latestApplicants = recruitments.slice(0, 4);

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

  const handleNavigateToApplicants = () => {
    setKeanggotaanTab('pendaftar');
    setActivePage('keanggotaan');
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'diterima':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-extrabold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300">
            Diterima
          </span>
        );
      case 'wawancara':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-extrabold px-2 py-0.5 rounded-full bg-purple-100 text-purple-800 dark:bg-purple-900/40 dark:text-purple-300">
            Wawancara
          </span>
        );
      case 'lolos_berkas':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-extrabold px-2 py-0.5 rounded-full bg-sky-100 text-sky-800 dark:bg-sky-900/40 dark:text-sky-300">
            Lolos Berkas
          </span>
        );
      case 'ditolak':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-extrabold px-2 py-0.5 rounded-full bg-rose-100 text-rose-800 dark:bg-rose-900/40 dark:text-rose-300">
            Ditolak
          </span>
        );
      case 'menunggu':
      default:
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-extrabold px-2 py-0.5 rounded-full bg-[#FBEBC8] text-[#7A4B00] border border-[#F2B544]">
            Menunggu
          </span>
        );
    }
  };

  return (
    <>
      <ScrollReveal distance={28} duration={650}>
        <div className="bg-[#FFFDF8] dark:bg-[#17293E] rounded-[20px] border border-[#E6DFD0] dark:border-[#283D56] p-6 shadow-none space-y-6">
          {/* Header Widget */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#E6DFD0] dark:border-[#283D56]">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-[12px] bg-[#1F3A5F] text-[#FAF6EE] flex items-center justify-center shrink-0">
                <UserPlus className="w-5 h-5 text-[#F2B544]" strokeWidth={2} />
              </div>
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="text-base sm:text-lg font-extrabold text-[#1F3A5F] dark:text-[#FAF6EE]">
                    Pendaftaran &amp; Calon Anggota Baru (OPREC)
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
                    <span>{isRegistrationOpen ? 'Pendaftaran Dibuka' : 'Pendaftaran Ditutup'}</span>
                  </span>
                </div>
                <p className="text-[14px] text-[#5A6472] dark:text-[#9AA8B8] mt-0.5">
                  Pantau formulir registrasi online web publik dan Google Form pendaftaran siswa baru.
                </p>
              </div>
            </div>

            {/* Tombol Aksi Cepat Header */}
            <div className="flex items-center gap-2 self-start sm:self-auto flex-wrap">
              <button
                type="button"
                onClick={handleToggleStatus}
                className={`min-h-[42px] px-3.5 py-2 rounded-[12px] text-[13px] sm:text-[14px] font-bold transition-all flex items-center gap-2 cursor-pointer shadow-none border ${
                  isRegistrationOpen
                    ? 'bg-transparent hover:bg-[#FBEBC8] text-[#1F3A5F] dark:text-[#FAF6EE] border-[#E6DFD0] dark:border-[#283D56]'
                    : 'bg-[#F2B544] hover:bg-[#E0A12F] text-[#1F3A5F] border-[#F2B544]'
                }`}
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

              <button
                type="button"
                onClick={() => setIsModalOpen(true)}
                className="min-h-[42px] px-3.5 py-2 bg-transparent hover:bg-[#E4EAF2] dark:hover:bg-[#213B5C] text-[#1F3A5F] dark:text-[#FAF6EE] text-[13px] sm:text-[14px] font-bold rounded-[12px] transition-all border border-[#E6DFD0] dark:border-[#283D56] flex items-center gap-2 cursor-pointer"
              >
                <Edit3 className="w-4 h-4" strokeWidth={2} />
                <span>Atur Jadwal &amp; Form</span>
              </button>

              <button
                type="button"
                onClick={handleNavigateToApplicants}
                className="min-h-[42px] px-3.5 py-2 bg-[#1F3A5F] hover:bg-[#162B46] text-[#FAF6EE] text-[13px] sm:text-[14px] font-bold rounded-[12px] transition-all shadow-none flex items-center gap-2 cursor-pointer"
              >
                <span>Semua Pendaftar</span>
                <ArrowUpRight className="w-4 h-4 text-[#F2B544]" strokeWidth={2} />
              </button>
            </div>
          </div>

          {/* Baris Ringkasan Metrik Pendaftar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-3.5 rounded-[14px] bg-[#FAF6EE] dark:bg-[#1C3048] border border-[#E6DFD0] dark:border-[#283D56]">
              <span className="text-[12px] font-bold text-[#5A6472] dark:text-[#9AA8B8]">
                Total Pendaftar
              </span>
              <p className="text-xl sm:text-2xl font-black text-[#1F3A5F] dark:text-[#FAF6EE] mt-0.5">
                {totalApplicants} Siswa
              </p>
            </div>
            <div className="p-3.5 rounded-[14px] bg-[#FAF6EE] dark:bg-[#1C3048] border border-[#E6DFD0] dark:border-[#283D56]">
              <span className="text-[12px] font-bold text-[#5A6472] dark:text-[#9AA8B8] flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-[#F2B544] animate-pulse" />
                Menunggu Review
              </span>
              <p className="text-xl sm:text-2xl font-black text-[#7A4B00] dark:text-[#F2B544] mt-0.5">
                {pendingApplicants} Siswa
              </p>
            </div>
            <div className="p-3.5 rounded-[14px] bg-[#FAF6EE] dark:bg-[#1C3048] border border-[#E6DFD0] dark:border-[#283D56]">
              <span className="text-[12px] font-bold text-[#5A6472] dark:text-[#9AA8B8]">
                Tahap Wawancara
              </span>
              <p className="text-xl sm:text-2xl font-black text-purple-700 dark:text-purple-300 mt-0.5">
                {interviewApplicants} Siswa
              </p>
            </div>
            <div className="p-3.5 rounded-[14px] bg-[#FAF6EE] dark:bg-[#1C3048] border border-[#E6DFD0] dark:border-[#283D56]">
              <span className="text-[12px] font-bold text-[#5A6472] dark:text-[#9AA8B8]">
                Resmi Diterima
              </span>
              <p className="text-xl sm:text-2xl font-black text-emerald-700 dark:text-emerald-400 mt-0.5">
                {acceptedApplicants} Siswa
              </p>
            </div>
          </div>

          {/* Tabel / List Pendaftar Calon Anggota Terbaru */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-[14px] sm:text-[15px] font-extrabold text-[#1F3A5F] dark:text-[#FAF6EE] flex items-center gap-2">
                <span>Daftar Pendaftar Terbaru</span>
                {pendingApplicants > 0 && (
                  <span className="text-[12px] font-extrabold px-2 py-0.5 rounded-full bg-[#FBEBC8] text-[#7A4B00] border border-[#F2B544]">
                    {pendingApplicants} Butuh Verifikasi
                  </span>
                )}
              </h4>
              <button
                type="button"
                onClick={handleNavigateToApplicants}
                className="text-[13px] font-bold text-[#1F3A5F] dark:text-[#F2B544] hover:underline flex items-center gap-1 cursor-pointer"
              >
                <span>Kelola di Keanggotaan</span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {latestApplicants.length === 0 ? (
              <div className="p-6 rounded-[14px] border border-dashed border-[#E6DFD0] dark:border-[#283D56] text-center space-y-1">
                <p className="text-[14px] font-bold text-[#1F3A5F] dark:text-[#FAF6EE]">
                  Belum ada calon anggota yang mendaftar
                </p>
                <p className="text-[13px] text-[#5A6472] dark:text-[#9AA8B8]">
                  Saat siswa mengisi form pendaftaran di Portal Publik, data mereka akan otomatis masuk ke sini.
                </p>
              </div>
            ) : (
              <div className="divide-y divide-[#E6DFD0] dark:divide-[#283D56] rounded-[14px] border border-[#E6DFD0] dark:border-[#283D56] overflow-hidden bg-[#FAF6EE]/50 dark:bg-[#1C3048]/50">
                {latestApplicants.map((rec) => (
                  <div
                    key={rec.id}
                    className="p-3.5 sm:p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-[#FAF6EE] dark:hover:bg-[#1C3048] transition-colors"
                  >
                    <div className="flex items-start sm:items-center gap-3 min-w-0">
                      <div className="w-9 h-9 rounded-full bg-[#E4EAF2] dark:bg-[#213B5C] text-[#1F3A5F] dark:text-[#FAF6EE] font-extrabold flex items-center justify-center shrink-0 text-[13px]">
                        {rec.fullName.charAt(0)}
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-[14px] font-bold text-[#1F3A5F] dark:text-[#FAF6EE] truncate">
                            {rec.fullName}
                          </span>
                          <span className="text-[12px] font-mono text-[#5A6472] dark:text-[#9AA8B8]">
                            ({rec.registrationNumber})
                          </span>
                          {getStatusBadge(rec.status)}
                        </div>
                        <p className="text-[13px] text-[#5A6472] dark:text-[#9AA8B8] truncate mt-0.5">
                          {rec.classRoom} • {rec.major} — Pilihan: <strong className="text-[#1F3A5F] dark:text-[#FAF6EE]">{rec.divisionChoice1}</strong>
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 self-end sm:self-auto shrink-0">
                      {rec.phone && rec.phone !== '-' && (
                        <a
                          href={`https://wa.me/${rec.phone.replace(/[^0-9]/g, '')}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="min-h-[34px] px-2.5 py-1 rounded-[8px] bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200 text-[12px] font-bold flex items-center gap-1 transition-colors"
                          title="Hubungi via WhatsApp"
                        >
                          <Phone className="w-3.5 h-3.5" />
                          <span className="hidden md:inline">WA</span>
                        </a>
                      )}

                      {rec.status !== 'diterima' ? (
                        <button
                          type="button"
                          onClick={() => approveRecruitmentToMember(rec.id)}
                          className="min-h-[34px] px-3 py-1 bg-[#F2B544] hover:bg-[#E0A12F] text-[#1F3A5F] text-[12px] font-extrabold rounded-[8px] transition-colors flex items-center gap-1 cursor-pointer"
                          title="Terima resmi sebagai anggota aktif dan terbitkan KTA"
                        >
                          <UserCheck className="w-3.5 h-3.5" />
                          <span>Terima Jadi Anggota</span>
                        </button>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[12px] font-bold text-emerald-700 dark:text-emerald-400 px-2 py-1">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Sudah Anggota</span>
                        </span>
                      )}

                      <button
                        type="button"
                        onClick={handleNavigateToApplicants}
                        className="min-h-[34px] px-2.5 py-1 bg-transparent hover:bg-[#E4EAF2] dark:hover:bg-[#213B5C] text-[#1F3A5F] dark:text-[#FAF6EE] text-[12px] font-bold rounded-[8px] border border-[#E6DFD0] dark:border-[#283D56] transition-colors cursor-pointer"
                      >
                        Detail
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Grid Informasi Tambahan: Link GForm & Periode */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2 border-t border-[#E6DFD0] dark:border-[#283D56]">
            {/* Card 1: Link GForm */}
            <div className="p-4 rounded-[14px] bg-[#FAF6EE] dark:bg-[#1C3048] border border-[#E6DFD0] dark:border-[#283D56] flex flex-col justify-between space-y-2">
              <span className="text-[13px] font-bold text-[#5A6472] dark:text-[#9AA8B8] flex items-center gap-1.5">
                <FileText className="w-4 h-4 text-[#1F3A5F] dark:text-[#FAF6EE]" strokeWidth={2} />
                Tautan Google Form Eksternal
              </span>
              <p className="text-[13px] text-[#1F3A5F] dark:text-[#FAF6EE] font-mono truncate" title={gformUrl}>
                {gformUrl}
              </p>
              <div className="flex items-center gap-3 pt-2 border-t border-[#E6DFD0] dark:border-[#283D56] text-[12px]">
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
                  <span>Buka Form</span>
                  <ExternalLink className="w-3.5 h-3.5" strokeWidth={2} />
                </a>
              </div>
            </div>

            {/* Card 2: Periode Jadwal */}
            <div className="p-4 rounded-[14px] bg-[#FAF6EE] dark:bg-[#1C3048] border border-[#E6DFD0] dark:border-[#283D56] flex flex-col justify-between space-y-2">
              <span className="text-[13px] font-bold text-[#5A6472] dark:text-[#9AA8B8] flex items-center gap-1.5">
                <Calendar className="w-4 h-4 text-[#1F3A5F] dark:text-[#FAF6EE]" strokeWidth={2} />
                Periode &amp; Jadwal Oprec
              </span>
              <div>
                <p className="text-[13px] font-bold text-[#1F3A5F] dark:text-[#FAF6EE]">
                  {openDate} s.d {closeDate}
                </p>
                <p className="text-[12px] text-[#5A6472] dark:text-[#9AA8B8] mt-0.5 line-clamp-1 italic">
                  "{noticeMessage}"
                </p>
              </div>
              <div className="text-[12px] text-[#5A6472] dark:text-[#9AA8B8] pt-2 border-t border-[#E6DFD0] dark:border-[#283D56]">
                <span>Status Oprec: </span>
                <span className="font-bold text-[#1F3A5F] dark:text-[#FAF6EE]">
                  {isRegistrationOpen ? 'Terbuka untuk Siswa Baru' : 'Ditutup Sementara'}
                </span>
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

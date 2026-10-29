import React from 'react';
import {
  Users,
  Briefcase,
  QrCode,
  ArrowUpRight,
  Calendar,
  Clock,
  Megaphone,
  CreditCard,
  Building2,
  Lightbulb,
  FileText,
  MoreHorizontal,
  Globe,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { formatDateIndo } from '../../lib/utils';
import { ScrollReveal } from '../../components/common/ScrollReveal';

export const DashboardPage: React.FC = () => {
  const {
    currentUser,
    currentRole,
    orgProfile,
    members,
    workPrograms,
    meetings,
    announcements,
    aspirations,
    documents,
    setActivePage,
  } = useApp();

  // Metrics
  const activeMembersCount = members.filter((m) => m.status === 'aktif').length;
  const alumniCount = members.filter((m) => m.status === 'alumni').length;

  const ongoingProkers = workPrograms.filter(
    (p) => p.status === 'berjalan' || p.status === 'disetujui'
  );
  const upcomingMeetings = meetings.filter(
    (m) => new Date(m.meetingDate) >= new Date('2026-09-01')
  );
  const totalAspirations = aspirations ? aspirations.length : 0;

  // Real action items for "Yang perlu dikerjakan"
  const newAspirations = aspirations
    ? aspirations.filter((a) => a.status === 'diterima' || a.status === 'diproses')
    : [];
  const pendingProkers = workPrograms.filter((p) => p.status === 'diajukan');
  const pendingDocs = documents ? documents.filter((d) => d.status === 'pending') : [];

  const totalActionItems =
    newAspirations.length +
    pendingProkers.length +
    pendingDocs.length;

  return (
    <div className="space-y-6">
      {/* ======================================================== */}
      {/* HEADER: SAPAAN + ROLE + MASA BAKTI + TOMBOL CEPAT        */}
      {/* ======================================================== */}
      <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4 pb-4 border-b border-[#E6DFD0] dark:border-[#283D56]">
        <div>
          <div className="flex items-center gap-2.5 flex-wrap">
            <h1 className="text-xl sm:text-2xl font-black text-[#1F3A5F] dark:text-[#FAF6EE] tracking-tight">
              Halo, {currentUser.fullName}!
            </h1>
            <span className="text-[13px] font-bold px-3 py-0.5 rounded-full bg-[#FBEBC8] text-[#7A4B00] border border-[#F2B544]/60">
              {currentRole.replace('_', ' ').toUpperCase()}
            </span>
          </div>
          <p className="text-[14px] text-[#5A6472] dark:text-[#9AA8B8] mt-1 font-medium">
            Masa Bakti {orgProfile.academicYear} • {orgProfile.schoolName} — Pantau tata kelola dan operasional organisasi.
          </p>
        </div>

        {/* Quick Shortcut Buttons - Sejajar Horizontal Tanpa Terputus */}
        <div className="flex items-center gap-2 sm:gap-2.5 overflow-x-auto pb-1 xl:pb-0 scrollbar-none flex-nowrap shrink-0">
          <button
            onClick={() => setActivePage('kegiatan-presensi')}
            className="min-h-[42px] px-3.5 py-2 bg-[#1F3A5F] hover:bg-[#162B46] text-[#FAF6EE] text-[13px] sm:text-[14px] font-bold rounded-[12px] transition-all flex items-center gap-2 cursor-pointer shadow-none whitespace-nowrap shrink-0"
          >
            <QrCode className="w-4 h-4 text-[#F2B544]" strokeWidth={2} />
            <span>Presensi AI &amp; QR</span>
          </button>
          <button
            onClick={() => setActivePage('keanggotaan')}
            className="min-h-[42px] px-3.5 py-2 bg-transparent hover:bg-[#E4EAF2] dark:hover:bg-[#213B5C] text-[#1F3A5F] dark:text-[#FAF6EE] text-[13px] sm:text-[14px] font-bold rounded-[12px] transition-all border border-[#E6DFD0] dark:border-[#283D56] flex items-center gap-2 cursor-pointer shadow-none whitespace-nowrap shrink-0"
          >
            <CreditCard className="w-4 h-4 text-[#1F3A5F] dark:text-[#FAF6EE]" strokeWidth={2} />
            <span>KTA Digital</span>
          </button>
          <button
            onClick={() => setActivePage('aspirasi')}
            className="min-h-[42px] px-3.5 py-2 bg-transparent hover:bg-[#E4EAF2] dark:hover:bg-[#213B5C] text-[#1F3A5F] dark:text-[#FAF6EE] text-[13px] sm:text-[14px] font-bold rounded-[12px] transition-all border border-[#E6DFD0] dark:border-[#283D56] flex items-center gap-2 cursor-pointer shadow-none whitespace-nowrap shrink-0"
          >
            <Lightbulb className="w-4 h-4 text-[#F2B544]" strokeWidth={2} />
            <span>Aspirasi ({newAspirations.length} Baru)</span>
          </button>
          <button
            onClick={() => setActivePage('portal-publik')}
            className="min-h-[42px] px-3.5 py-2 bg-transparent hover:bg-[#E4EAF2] dark:hover:bg-[#213B5C] text-[#1F3A5F] dark:text-[#FAF6EE] text-[13px] sm:text-[14px] font-bold rounded-[12px] transition-all border border-[#E6DFD0] dark:border-[#283D56] flex items-center gap-2 cursor-pointer shadow-none whitespace-nowrap shrink-0"
          >
            <Globe className="w-4 h-4 text-[#1F3A5F] dark:text-[#FAF6EE]" strokeWidth={2} />
            <span>Portal Publik</span>
          </button>
        </div>
      </div>

      {/* ======================================================== */}
      {/* BARIS 1: TUGAS TINDAK LANJUT / MASUKAN (KOMPAK & RINGKAS) */}
      {/* ======================================================== */}
      <div className="bg-[#1F3A5F] text-[#FAF6EE] p-4 sm:p-5 rounded-[16px] border border-[#162B46] shadow-none">
        <div className="flex items-center justify-between pb-2.5 border-b border-white/15">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#F2B544] animate-pulse" />
            <h2 className="text-[15px] sm:text-[16px] font-extrabold !text-[#FAF6EE]">
              Yang Perlu Dikerjakan
            </h2>
          </div>
          <span className="text-[12px] font-bold px-2.5 py-0.5 rounded-full bg-[#F2B544] text-[#1F3A5F]">
            {totalActionItems} Tindak Lanjut
          </span>
        </div>

        {/* List Tugas Dinamis dari Data Riil */}
        <div className="mt-3 space-y-2">
          {totalActionItems === 0 ? (
            <div className="py-3 px-4 rounded-[12px] bg-white/5 border border-white/10 text-center sm:text-left space-y-0.5">
              <p className="text-[14px] font-bold text-[#FAF6EE]">
                Semua beres! Tidak ada tugas mendesak saat ini.
              </p>
              <p className="text-[12px] text-[#A4B2C3]">
                Seluruh administrasi program kerja, aspirasi, dan arsip terselesaikan dengan baik.
              </p>
            </div>
          ) : (
            <>
              {/* Tugas 1: Ide & Aspirasi Baru */}
              {newAspirations.length > 0 && (
                <div className="p-2.5 sm:p-3 rounded-[12px] bg-white/10 border border-white/15 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-[8px] bg-[#F2B544] text-[#1F3A5F] flex items-center justify-center shrink-0">
                      <Lightbulb className="w-4 h-4" strokeWidth={2} />
                    </div>
                    <div className="min-w-0">
                      <p className="text-[13px] sm:text-[14px] font-bold text-[#FAF6EE] truncate">
                        {newAspirations.length} masukan baru di Kotak Aspirasi
                      </p>
                      <p className="text-[12px] text-[#A4B2C3] truncate">
                        Perlu ditinjau dan ditanggapi resmi pengurus
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => setActivePage('aspirasi')}
                    className="min-h-[34px] px-3.5 py-1 bg-[#F2B544] hover:bg-[#E0A12F] text-[#1F3A5F] font-extrabold text-[12px] rounded-[8px] transition-colors shrink-0 cursor-pointer shadow-none"
                  >
                    Tinjau
                  </button>
                </div>
              )}

              {/* Tugas 2: Proker Menunggu Persetujuan */}
              {pendingProkers.length > 0 && (
                <div className="p-2.5 sm:p-3 rounded-[12px] bg-white/10 border border-white/15 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-[8px] bg-[#F2B544] text-[#1F3A5F] flex items-center justify-center shrink-0">
                      <Briefcase className="w-4 h-4" strokeWidth={2} />
                    </div>
                    <div className="min-w-0">
                      <p className="text-[13px] sm:text-[14px] font-bold text-[#FAF6EE] truncate">
                        {pendingProkers.length} program kerja diajukan sekbid
                      </p>
                      <p className="text-[12px] text-[#A4B2C3] truncate">
                        Menunggu persetujuan Pembina / Ketua
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => setActivePage('kegiatan-presensi')}
                    className="min-h-[34px] px-3.5 py-1 bg-[#F2B544] hover:bg-[#E0A12F] text-[#1F3A5F] font-extrabold text-[12px] rounded-[8px] transition-colors shrink-0 cursor-pointer shadow-none"
                  >
                    Kelola
                  </button>
                </div>
              )}

              {/* Tugas 3: Dokumen / Surat Pending */}
              {pendingDocs.length > 0 && (
                <div className="p-2.5 sm:p-3 rounded-[12px] bg-white/10 border border-white/15 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-[8px] bg-[#F2B544] text-[#1F3A5F] flex items-center justify-center shrink-0">
                      <FileText className="w-4 h-4" strokeWidth={2} />
                    </div>
                    <div className="min-w-0">
                      <p className="text-[13px] sm:text-[14px] font-bold text-[#FAF6EE] truncate">
                        {pendingDocs.length} arsip dokumen pending disposisi
                      </p>
                      <p className="text-[12px] text-[#A4B2C3] truncate">
                        Administrasi persuratan sekolah
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => setActivePage('dokumen')}
                    className="min-h-[34px] px-3.5 py-1 bg-[#F2B544] hover:bg-[#E0A12F] text-[#1F3A5F] font-extrabold text-[12px] rounded-[8px] transition-colors shrink-0 cursor-pointer shadow-none"
                  >
                    Disposisi
                  </button>
                </div>
              )}
            </>
          )}
        </div>

        <div className="pt-2.5 mt-2.5 border-t border-white/15 flex items-center justify-between text-[12px] text-[#A4B2C3]">
          <span>Sinkronisasi otomatis dengan basis data UKK</span>
          <span className="text-[#F2B544] font-bold">Status: Terpantau</span>
        </div>
      </div>

      {/* ======================================================== */}
      {/* BARIS 2: TIGA RINGKASAN UTAMA ORGANISASI                 */}
      {/* ======================================================== */}
      <div className="bg-[#FFFDF8] dark:bg-[#17293E] rounded-[20px] border border-[#E6DFD0] dark:border-[#283D56] shadow-none overflow-hidden">
        <div className="grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-[#E6DFD0] dark:divide-[#283D56]">
          {/* Segmen 1: Anggota Aktif */}
          <div className="p-6 flex flex-col justify-between space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-[12px] bg-[#E4EAF2] dark:bg-[#213B5C] text-[#1F3A5F] dark:text-[#FAF6EE] flex items-center justify-center">
                  <Users className="w-5 h-5" strokeWidth={2} />
                </div>
                <span className="text-[14px] font-bold text-[#5A6472] dark:text-[#9AA8B8]">
                  Total Anggota Aktif
                </span>
              </div>
              <button
                onClick={() => setActivePage('keanggotaan')}
                className="text-[#5A6472] hover:text-[#1F3A5F] dark:hover:text-[#FAF6EE] p-1.5 rounded-[8px]"
                title="Kelola Keanggotaan"
                aria-label="Kelola Keanggotaan"
              >
                <MoreHorizontal className="w-4 h-4" />
              </button>
            </div>

            <div>
              <div className="text-3xl font-black text-[#1F3A5F] dark:text-[#FAF6EE]">
                {activeMembersCount} Siswa
              </div>
              <p className="text-[14px] text-[#5A6472] dark:text-[#9AA8B8] mt-1">
                +{alumniCount} demisioner / alumni tercatat
              </p>
            </div>

            <div className="pt-3 border-t border-[#E6DFD0] dark:border-[#283D56] flex justify-end">
              <button
                onClick={() => setActivePage('keanggotaan')}
                className="text-[14px] font-bold text-[#1F3A5F] dark:text-[#F2B544] hover:underline flex items-center gap-1 cursor-pointer"
              >
                <span>Detail</span>
                <ArrowUpRight className="w-4 h-4" strokeWidth={2} />
              </button>
            </div>
          </div>

          {/* Segmen 2: Program Kerja Berjalan */}
          <div className="p-6 flex flex-col justify-between space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-[12px] bg-[#E4EAF2] dark:bg-[#213B5C] text-[#1F3A5F] dark:text-[#FAF6EE] flex items-center justify-center">
                  <Briefcase className="w-5 h-5" strokeWidth={2} />
                </div>
                <span className="text-[14px] font-bold text-[#5A6472] dark:text-[#9AA8B8]">
                  Program Kerja Berjalan
                </span>
              </div>
              <button
                onClick={() => setActivePage('kegiatan-presensi')}
                className="text-[#5A6472] hover:text-[#1F3A5F] dark:hover:text-[#FAF6EE] p-1.5 rounded-[8px]"
                title="Kelola Program Kerja"
                aria-label="Kelola Program Kerja"
              >
                <MoreHorizontal className="w-4 h-4" />
              </button>
            </div>

            <div>
              <div className="text-3xl font-black text-[#1F3A5F] dark:text-[#FAF6EE]">
                {ongoingProkers.length}{' '}
                <span className="text-lg font-semibold text-[#5A6472] dark:text-[#9AA8B8]">
                  / {workPrograms.length} proker
                </span>
              </div>
              <p className="text-[14px] text-[#5A6472] dark:text-[#9AA8B8] mt-1">
                Target capaian semester gasal
              </p>
            </div>

            <div className="pt-3 border-t border-[#E6DFD0] dark:border-[#283D56] flex justify-end">
              <button
                onClick={() => setActivePage('kegiatan-presensi')}
                className="text-[14px] font-bold text-[#1F3A5F] dark:text-[#F2B544] hover:underline flex items-center gap-1 cursor-pointer"
              >
                <span>Kelola</span>
                <ArrowUpRight className="w-4 h-4" strokeWidth={2} />
              </button>
            </div>
          </div>

          {/* Segmen 3: Kotak Ide & Aspirasi Siswa */}
          <div className="p-6 flex flex-col justify-between space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-[12px] bg-[#E4EAF2] dark:bg-[#213B5C] text-[#1F3A5F] dark:text-[#FAF6EE] flex items-center justify-center">
                  <Lightbulb className="w-5 h-5" strokeWidth={2} />
                </div>
                <span className="text-[14px] font-bold text-[#5A6472] dark:text-[#9AA8B8]">
                  Kotak Ide &amp; Aspirasi
                </span>
              </div>
              <button
                onClick={() => setActivePage('aspirasi')}
                className="text-[#5A6472] hover:text-[#1F3A5F] dark:hover:text-[#FAF6EE] p-1.5 rounded-[8px]"
                title="Buka Kotak Aspirasi"
                aria-label="Buka Kotak Aspirasi"
              >
                <MoreHorizontal className="w-4 h-4" />
              </button>
            </div>

            <div>
              <div className="text-3xl font-black text-[#1F3A5F] dark:text-[#FAF6EE] flex items-center gap-2">
                <span>{totalAspirations} Masukan</span>
                {newAspirations.length > 0 && (
                  <span className="text-[12px] font-extrabold px-2 py-0.5 rounded-full bg-[#FBEBC8] text-[#7A4B00] border border-[#F2B544]">
                    {newAspirations.length} Baru
                  </span>
                )}
              </div>
              <p className="text-[14px] text-[#5A6472] dark:text-[#9AA8B8] mt-1">
                Kanal aspirasi siswa via Portal Publik
              </p>
            </div>

            <div className="pt-3 border-t border-[#E6DFD0] dark:border-[#283D56] flex justify-end">
              <button
                onClick={() => setActivePage('aspirasi')}
                className="text-[14px] font-bold text-[#1F3A5F] dark:text-[#F2B544] hover:underline flex items-center gap-1 cursor-pointer"
              >
                <span>Lihat Aspirasi</span>
                <ArrowUpRight className="w-4 h-4" strokeWidth={2} />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ======================================================== */}
      {/* BARIS 3: JADWAL RAPAT TERDEKAT & PAPAN PENGUMUMAN RESMI  */}
      {/* ======================================================== */}
      <ScrollReveal distance={28} duration={650} delay={0}>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Jadwal Rapat Terdekat */}
          <div className="bg-[#FFFDF8] dark:bg-[#17293E] rounded-[20px] border border-[#E6DFD0] dark:border-[#283D56] p-6 shadow-none flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between pb-3.5 mb-3.5 border-b border-[#E6DFD0] dark:border-[#283D56]">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-[10px] bg-[#E4EAF2] dark:bg-[#213B5C] text-[#1F3A5F] dark:text-[#FAF6EE] flex items-center justify-center">
                    <Calendar className="w-4 h-4" strokeWidth={2} />
                  </div>
                  <div>
                    <h3 className="text-[15px] font-extrabold text-[#1F3A5F] dark:text-[#FAF6EE]">
                      Jadwal Rapat &amp; Presensi Terdekat
                    </h3>
                    <p className="text-[13px] text-[#5A6472] dark:text-[#9AA8B8]">
                      Koordinasi dan kehadiran pengurus
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setActivePage('kegiatan-presensi')}
                  className="text-[14px] font-bold text-[#1F3A5F] dark:text-[#F2B544] hover:underline flex items-center gap-1 cursor-pointer"
                >
                  Semua Agenda <ArrowUpRight className="w-4 h-4" strokeWidth={2} />
                </button>
              </div>

              <div className="space-y-3">
                {upcomingMeetings.slice(0, 2).map((meet) => (
                  <div
                    key={meet.id}
                    className="p-4 rounded-[14px] border border-[#E6DFD0] dark:border-[#283D56] bg-[#FAF6EE] dark:bg-[#1C3048] space-y-2 hover:border-[#1F3A5F] transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-[12px] font-bold text-[#1F3A5F] dark:text-[#FAF6EE] bg-[#E4EAF2] dark:bg-[#213B5C] px-2.5 py-0.5 rounded-full border border-[#E6DFD0]">
                        Rapat {meet.type}
                      </span>
                      {meet.isAttendanceOpen && (
                        <span className="inline-flex items-center gap-1.5 text-[12px] font-bold text-[#7A4B00] bg-[#FBEBC8] px-2.5 py-0.5 rounded-full border border-[#F2B544]">
                          <span className="w-2 h-2 rounded-full bg-[#F2B544] animate-pulse" />
                          Presensi Terbuka
                        </span>
                      )}
                    </div>
                    <p className="text-[14px] font-bold text-[#1F3A5F] dark:text-[#FAF6EE] line-clamp-1">
                      {meet.title}
                    </p>
                    <div className="text-[13px] text-[#5A6472] dark:text-[#9AA8B8] space-y-1">
                      <p className="flex items-center gap-2">
                        <Clock className="w-4 h-4 text-[#5A6472]" strokeWidth={2} />
                        <span>{formatDateIndo(meet.meetingDate)} • {meet.startTime} - {meet.endTime} WIB</span>
                      </p>
                      <p className="flex items-center gap-2">
                        <Building2 className="w-4 h-4 text-[#5A6472]" strokeWidth={2} />
                        <span className="truncate">{meet.location}</span>
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-3.5 mt-4 border-t border-[#E6DFD0] dark:border-[#283D56] flex items-center justify-between text-[14px] text-[#5A6472] dark:text-[#9AA8B8]">
              <span>{upcomingMeetings.length} rapat terjadwal</span>
              <button
                onClick={() => setActivePage('kegiatan-presensi')}
                className="text-[#1F3A5F] dark:text-[#F2B544] font-bold hover:underline cursor-pointer"
              >
                Buka Kalender Agenda &rarr;
              </button>
            </div>
          </div>

          {/* Papan Pengumuman Organisasi */}
          <div className="bg-[#FFFDF8] dark:bg-[#17293E] rounded-[20px] border border-[#E6DFD0] dark:border-[#283D56] p-6 shadow-none flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between pb-3.5 mb-3.5 border-b border-[#E6DFD0] dark:border-[#283D56]">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-[10px] bg-[#E4EAF2] dark:bg-[#213B5C] text-[#1F3A5F] dark:text-[#FAF6EE] flex items-center justify-center">
                    <Megaphone className="w-4 h-4" strokeWidth={2} />
                  </div>
                  <div>
                    <h3 className="text-[15px] font-extrabold text-[#1F3A5F] dark:text-[#FAF6EE]">
                      Papan Pengumuman Resmi
                    </h3>
                    <p className="text-[13px] text-[#5A6472] dark:text-[#9AA8B8]">
                      Warta internal kepengurusan OSIS
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setActivePage('pengumuman')}
                  className="text-[14px] font-bold text-[#1F3A5F] dark:text-[#F2B544] hover:underline flex items-center gap-1 cursor-pointer"
                >
                  Semua Warta <ArrowUpRight className="w-4 h-4" strokeWidth={2} />
                </button>
              </div>

              <div className="space-y-3">
                {announcements.slice(0, 2).map((ann) => (
                  <div
                    key={ann.id}
                    className="p-4 rounded-[14px] bg-[#FAF6EE] dark:bg-[#1C3048] border border-[#E6DFD0] dark:border-[#283D56] space-y-1.5 hover:border-[#1F3A5F] transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <span
                        className={`text-[12px] font-bold px-2.5 py-0.5 rounded-full border ${
                          ann.priority === 'penting'
                            ? 'bg-[#FBEBC8] text-[#7A4B00] border-[#F2B544]'
                            : 'bg-[#E4EAF2] text-[#1F3A5F] border-[#E6DFD0]'
                        }`}
                      >
                        {ann.priority}
                      </span>
                      <span className="text-[13px] text-[#5A6472] dark:text-[#9AA8B8]">{formatDateIndo(ann.date)}</span>
                    </div>
                    <h4 className="text-[14px] font-bold text-[#1F3A5F] dark:text-[#FAF6EE] line-clamp-1">
                      {ann.title}
                    </h4>
                    <p className="text-[14px] text-[#5A6472] dark:text-[#9AA8B8] line-clamp-2 leading-relaxed">
                      {ann.content}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-3.5 mt-4 border-t border-[#E6DFD0] dark:border-[#283D56] flex items-center justify-between text-[14px] text-[#5A6472] dark:text-[#9AA8B8]">
              <span>{announcements.length} informasi aktif</span>
              <button
                onClick={() => setActivePage('pengumuman')}
                className="text-[#1F3A5F] dark:text-[#F2B544] font-bold hover:underline cursor-pointer"
              >
                Kelola Pengumuman &rarr;
              </button>
            </div>
          </div>
        </div>
      </ScrollReveal>
    </div>
  );
};

export default DashboardPage;


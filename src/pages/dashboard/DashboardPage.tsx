import React from 'react';
import {
  Users,
  Wallet,
  Briefcase,
  QrCode,
  ArrowUpRight,
  ArrowDownLeft,
  Calendar,
  Clock,
  Megaphone,
  CreditCard,
  Building2,
  Sparkles,
  TrendingUp,
  Globe,
  MoreHorizontal,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { formatRupiah, formatDateIndo } from '../../lib/utils';
import { CashFlowChart } from '../../components/dashboard/CashFlowChart';
import { DivisionDistributionChart } from '../../components/dashboard/DivisionDistributionChart';
import { AttendanceStatsWidget } from '../../components/dashboard/AttendanceStatsWidget';
import { RecentActivityTimeline } from '../../components/dashboard/RecentActivityTimeline';
import { VisiMisiAdminWidget } from '../../components/dashboard/VisiMisiAdminWidget';
import { RegistrationAdminWidget } from '../../components/dashboard/RegistrationAdminWidget';
import { AspirationAdminWidget } from '../../components/dashboard/AspirationAdminWidget';
import { ScrollReveal } from '../../components/common/ScrollReveal';

export const DashboardPage: React.FC = () => {
  const {
    currentUser,
    currentRole,
    orgProfile,
    divisions,
    members,
    workPrograms,
    meetings,
    attendances,
    cashTransactions,
    memberDues,
    announcements,
    setActivePage,
  } = useApp();

  // Metrics
  const activeMembersCount = members.filter((m) => m.status === 'aktif').length;
  const alumniCount = members.filter((m) => m.status === 'alumni').length;

  const totalIncome = cashTransactions
    .filter((t) => t.type === 'pemasukan')
    .reduce((sum, t) => sum + t.amount, 0);
  const totalExpense = cashTransactions
    .filter((t) => t.type === 'pengeluaran')
    .reduce((sum, t) => sum + t.amount, 0);
  const currentBalance = totalIncome - totalExpense;

  const ongoingProkers = workPrograms.filter(
    (p) => p.status === 'berjalan' || p.status === 'disetujui'
  );
  const upcomingMeetings = meetings.filter(
    (m) => new Date(m.meetingDate) >= new Date('2026-09-01')
  );
  const pendingDues = memberDues.filter((d) => d.status === 'belum_lunas').length;

  return (
    <div className="space-y-6">
      {/* ======================================================== */}
      {/* SLIM WELCOME HEADER & ACTIONS                            */}
      {/* ======================================================== */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-2 border-b border-slate-200/80 dark:border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
              Halo, {currentUser.fullName}! 👋
            </h1>
            <span className="text-[11px] font-bold uppercase px-2.5 py-0.5 rounded-full bg-blue-50 dark:bg-blue-950/60 text-[#2563EB] dark:text-blue-300 border border-blue-200/80 dark:border-blue-900">
              {currentRole.replace('_', ' ')}
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Masa Bakti {orgProfile.academicYear} • {orgProfile.schoolName} — Pantau tata kelola dan analitik organisasi.
          </p>
        </div>

        {/* Quick Shortcut Buttons (1 Primary Solid, Rest Outline) */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setActivePage('kegiatan-presensi')}
            className="px-3.5 py-2 bg-[#2563EB] hover:bg-blue-700 active:scale-95 text-white text-xs font-bold rounded-xl transition-all shadow-sm flex items-center gap-2 cursor-pointer"
          >
            <QrCode className="w-4 h-4" />
            <span>Presensi AI & QR</span>
          </button>
          <button
            onClick={() => setActivePage('keanggotaan')}
            className="px-3.5 py-2 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-semibold rounded-xl transition-all border border-slate-200/80 dark:border-slate-700 flex items-center gap-2 cursor-pointer shadow-2xs"
          >
            <CreditCard className="w-4 h-4 text-[#2563EB]" />
            <span>KTA Digital</span>
          </button>
          <button
            onClick={() => setActivePage('keuangan')}
            className="px-3.5 py-2 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-semibold rounded-xl transition-all border border-slate-200/80 dark:border-slate-700 flex items-center gap-2 cursor-pointer shadow-2xs"
          >
            <Wallet className="w-4 h-4 text-slate-500" />
            <span>Kas ({pendingDues} Tertunda)</span>
          </button>
          <button
            onClick={() => setActivePage('portal-publik')}
            className="px-3.5 py-2 bg-blue-50 dark:bg-blue-950/60 hover:bg-blue-100 dark:hover:bg-blue-900/60 text-[#2563EB] dark:text-blue-300 text-xs font-bold rounded-xl transition-all border border-blue-200/80 dark:border-blue-900 flex items-center gap-2 cursor-pointer shadow-2xs"
          >
            <Globe className="w-4 h-4 text-[#2563EB]" />
            <span className="hidden sm:inline">Portal Publik</span>
          </button>
        </div>
      </div>

      {/* ======================================================== */}
      {/* 4 STAT CARDS (EXONAD STYLE)                              */}
      {/* ======================================================== */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Anggota Aktif (White Card) */}
        <ScrollReveal distance={28} duration={650} delay={0} className="flex flex-col">
          <div
            onClick={() => setActivePage('keanggotaan')}
            className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-2xs hover:border-blue-200 dark:hover:border-blue-900 transition-all cursor-pointer group flex flex-col justify-between h-full"
          >
            <div className="flex items-center justify-between">
              <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-[#2563EB] dark:text-blue-400 flex items-center justify-center border border-blue-100 dark:border-blue-900 group-hover:scale-105 transition-transform">
                <Users className="w-5 h-5" />
              </div>
              <span className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300">
                <MoreHorizontal className="w-4 h-4" />
              </span>
            </div>

            <div className="mt-4">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                Total Anggota Aktif
              </span>
              <div className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white mt-1">
                {activeMembersCount}
              </div>
            </div>

            <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400">
              <span>+{alumniCount} demisioner/alumni</span>
              <span className="text-[#2563EB] dark:text-blue-400 font-semibold group-hover:underline">Detail &rarr;</span>
            </div>
          </div>
        </ScrollReveal>

        {/* Card 2: Saldo Kas (HERO SOLID BLUE CARD #2563EB) */}
        <ScrollReveal distance={28} duration={650} delay={70} className="flex flex-col">
          <div
            onClick={() => setActivePage('keuangan')}
            className="bg-[#2563EB] p-5 rounded-2xl border border-blue-600 shadow-sm hover:bg-blue-700 transition-all cursor-pointer text-white flex flex-col justify-between h-full group"
          >
            <div className="flex items-center justify-between">
              <div className="w-10 h-10 rounded-xl bg-white/20 text-white flex items-center justify-center border border-white/25 group-hover:scale-105 transition-transform backdrop-blur-xs">
                <Wallet className="w-5 h-5" />
              </div>
              <span className="text-white/60 hover:text-white">
                <MoreHorizontal className="w-4 h-4" />
              </span>
            </div>

            <div className="mt-4">
              <span className="text-[11px] font-bold uppercase tracking-wider text-blue-100">
                Saldo Kas Organisasi
              </span>
              <div className="text-2xl sm:text-3xl font-black text-white mt-1 tracking-tight">
                {formatRupiah(currentBalance)}
              </div>
            </div>

            <div className="mt-3 pt-3 border-t border-white/15 flex items-center justify-between text-[11px] text-blue-100 font-medium">
              <span className="flex items-center gap-1">
                <ArrowDownLeft className="w-3.5 h-3.5" />
                Masuk: {formatRupiah(totalIncome)}
              </span>
              <span className="underline decoration-blue-200">Buku Kas &rarr;</span>
            </div>
          </div>
        </ScrollReveal>

        {/* Card 3: Proker Berjalan (White Card) */}
        <ScrollReveal distance={28} duration={650} delay={140} className="flex flex-col">
          <div
            onClick={() => setActivePage('kegiatan-presensi')}
            className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-2xs hover:border-blue-200 dark:hover:border-blue-900 transition-all cursor-pointer group flex flex-col justify-between h-full"
          >
            <div className="flex items-center justify-between">
              <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-[#2563EB] dark:text-blue-400 flex items-center justify-center border border-blue-100 dark:border-blue-900 group-hover:scale-105 transition-transform">
                <Briefcase className="w-5 h-5" />
              </div>
              <span className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300">
                <MoreHorizontal className="w-4 h-4" />
              </span>
            </div>

            <div className="mt-4">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                Program Kerja Berjalan
              </span>
              <div className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white mt-1">
                {ongoingProkers.length}{' '}
                <span className="text-sm font-semibold text-slate-400">/ {workPrograms.length}</span>
              </div>
            </div>

            <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400">
              <span className="flex items-center gap-1 text-[#2563EB] dark:text-blue-400 font-medium">
                <TrendingUp className="w-3.5 h-3.5" />
                Target semester gasal
              </span>
              <span className="text-[#2563EB] dark:text-blue-400 font-semibold group-hover:underline">Kelola &rarr;</span>
            </div>
          </div>
        </ScrollReveal>

        {/* Card 4: Iuran Belum Lunas (White Card with Pending Alert) */}
        <ScrollReveal distance={28} duration={650} delay={210} className="flex flex-col">
          <div
            onClick={() => setActivePage('keuangan')}
            className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-2xs hover:border-blue-200 dark:hover:border-blue-900 transition-all cursor-pointer group flex flex-col justify-between h-full"
          >
            <div className="flex items-center justify-between">
              <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 flex items-center justify-center border border-slate-200 dark:border-slate-700 group-hover:scale-105 transition-transform">
                <CreditCard className="w-5 h-5 text-[#2563EB]" />
              </div>
              <span className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300">
                <MoreHorizontal className="w-4 h-4" />
              </span>
            </div>

            <div className="mt-4">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                Iuran Kas Belum Lunas
              </span>
              <div className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white mt-1">
                {pendingDues}{' '}
                <span className="text-xs font-bold text-rose-600 bg-rose-50 dark:bg-rose-950/60 px-2 py-0.5 rounded-full border border-rose-200 dark:border-rose-900">
                  Tertunda
                </span>
              </div>
            </div>

            <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400">
              <span>Pemeriksaan bendahara</span>
              <span className="text-[#2563EB] dark:text-blue-400 font-semibold group-hover:underline">Verifikasi &rarr;</span>
            </div>
          </div>
        </ScrollReveal>
      </div>

      {/* ======================================================== */}
      {/* ROW 0A: VISI, MISI & FOTO ORGANISASI (Full Width Widget) */}
      {/* ======================================================== */}
      <VisiMisiAdminWidget />

      {/* ======================================================== */}
      {/* ROW 0B: AKSES PENDAFTARAN ANGGOTA (GOOGLE FORM)          */}
      {/* ======================================================== */}
      <RegistrationAdminWidget />

      {/* ======================================================== */}
      {/* ROW 0C: KOTAK IDE & MASUKAN PUBLIK (BALAS VIA GMAIL)     */}
      {/* ======================================================== */}
      <AspirationAdminWidget />

      {/* ======================================================== */}
      {/* ROW 1: CASH FLOW CHART (2/3) + RECENT TIMELINE (1/3)     */}
      {/* ======================================================== */}
      <ScrollReveal distance={32} duration={700} delay={0}>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <CashFlowChart transactions={cashTransactions} />
          </div>
          <div className="lg:col-span-1">
            <RecentActivityTimeline
              transactions={cashTransactions}
              onViewAll={() => setActivePage('keuangan')}
              maxItems={5}
            />
          </div>
        </div>
      </ScrollReveal>

      {/* ======================================================== */}
      {/* ROW 2: DONUT CHART (1/2) + ATTENDANCE STATS (1/2)        */}
      {/* ======================================================== */}
      <ScrollReveal distance={32} duration={700} delay={60}>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div>
            <DivisionDistributionChart members={members} divisions={divisions} />
          </div>
          <div>
            <AttendanceStatsWidget attendances={attendances} workPrograms={workPrograms} />
          </div>
        </div>
      </ScrollReveal>

      {/* ======================================================== */}
      {/* ROW 3: AGENDA RAPAT TERDEKAT & PENGUMUMAN ORGANISASI     */}
      {/* ======================================================== */}
      <ScrollReveal distance={32} duration={700} delay={80}>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Jadwal Rapat Terdekat */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 p-5 shadow-2xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-blue-50 dark:bg-blue-950/60 text-[#2563EB] dark:text-blue-400 flex items-center justify-center">
                  <Calendar className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">Jadwal Rapat & Presensi Terdekat</h3>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">Koordinasi dan kehadiran pengurus</p>
                </div>
              </div>
              <button
                onClick={() => setActivePage('kegiatan-presensi')}
                className="text-xs font-bold text-[#2563EB] hover:text-blue-700 dark:text-blue-400 flex items-center gap-1 cursor-pointer"
              >
                Semua Agenda <ArrowUpRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="space-y-3">
              {upcomingMeetings.slice(0, 2).map((meet) => (
                <div
                  key={meet.id}
                  className="p-3.5 rounded-xl border border-slate-200/80 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 space-y-2 hover:border-blue-200 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold text-[#2563EB] dark:text-blue-400 bg-blue-50 dark:bg-blue-950/60 px-2 py-0.5 rounded-full uppercase border border-blue-200/60 dark:border-blue-900">
                      Rapat {meet.type}
                    </span>
                    {meet.isAttendanceOpen && (
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded-full border border-emerald-200 dark:border-emerald-900">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                        Presensi Terbuka
                      </span>
                    )}
                  </div>
                  <p className="text-xs font-bold text-slate-800 dark:text-slate-200 line-clamp-1">
                    {meet.title}
                  </p>
                  <div className="text-[11px] text-slate-500 dark:text-slate-400 space-y-1">
                    <p className="flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span>{formatDateIndo(meet.meetingDate)} • {meet.startTime} - {meet.endTime} WIB</span>
                    </p>
                    <p className="flex items-center gap-1.5">
                      <Building2 className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span className="truncate">{meet.location}</span>
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="pt-3 mt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-slate-400">
            <span>{upcomingMeetings.length} rapat terjadwal</span>
            <button
              onClick={() => setActivePage('kegiatan-presensi')}
              className="text-[#2563EB] dark:text-blue-400 font-semibold hover:underline cursor-pointer"
            >
              Buka Kalender Agenda &rarr;
            </button>
          </div>
        </div>

        {/* Papan Pengumuman Organisasi */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 p-5 shadow-2xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-blue-50 dark:bg-blue-950/60 text-[#2563EB] dark:text-blue-400 flex items-center justify-center">
                  <Megaphone className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">Papan Pengumuman Resmi</h3>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">Warta internal kepengurusan OSIS</p>
                </div>
              </div>
              <button
                onClick={() => setActivePage('pengumuman')}
                className="text-xs font-bold text-[#2563EB] hover:text-blue-700 dark:text-blue-400 flex items-center gap-1 cursor-pointer"
              >
                Semua Warta <ArrowUpRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="space-y-3">
              {announcements.slice(0, 2).map((ann) => (
                <div
                  key={ann.id}
                  className="p-3.5 rounded-xl bg-slate-50/50 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-800 space-y-1.5 hover:border-blue-200 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <span
                      className={`text-[9px] font-extrabold px-1.5 py-0.5 rounded uppercase ${
                        ann.priority === 'penting'
                          ? 'bg-rose-50 text-rose-700 border border-rose-200 dark:bg-rose-950/60 dark:text-rose-300 dark:border-rose-900'
                          : 'bg-slate-100 text-slate-700 border border-slate-200 dark:bg-slate-700 dark:text-slate-300 dark:border-slate-600'
                      }`}
                    >
                      {ann.priority}
                    </span>
                    <span className="text-[10px] text-slate-400">{formatDateIndo(ann.date)}</span>
                  </div>
                  <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200 line-clamp-1">
                    {ann.title}
                  </h4>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed">
                    {ann.content}
                  </p>
                </div>
              ))}
            </div>
          </div>

          <div className="pt-3 mt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-slate-400">
            <span>{announcements.length} informasi aktif</span>
            <button
              onClick={() => setActivePage('pengumuman')}
              className="text-[#2563EB] dark:text-blue-400 font-semibold hover:underline cursor-pointer"
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

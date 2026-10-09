import React from 'react';
import {
  Users,
  Wallet,
  Briefcase,
  QrCode,
  ArrowUpRight,
  ArrowDownLeft,
  Calendar,
  CheckCircle2,
  Clock,
  PlusCircle,
  Megaphone,
  CreditCard,
  Building2,
  Sparkles,
  TrendingUp,
  BarChart3,
  Globe,
  Eye,
  Target,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { formatRupiah, formatDateIndo } from '../../lib/utils';
import { CashFlowChart } from '../../components/dashboard/CashFlowChart';
import { DivisionDistributionChart } from '../../components/dashboard/DivisionDistributionChart';
import { AttendanceStatsWidget } from '../../components/dashboard/AttendanceStatsWidget';

export const DashboardPage: React.FC = () => {
  const {
    currentUser,
    currentRole,
    orgProfile,
    divisions,
    members,
    workPrograms,
    events,
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

  const ongoingProkers = workPrograms.filter((p) => p.status === 'berjalan' || p.status === 'disetujui');
  const upcomingMeetings = meetings.filter((m) => new Date(m.meetingDate) >= new Date('2026-09-01'));
  const pendingDues = memberDues.filter((d) => d.status === 'belum_lunas').length;

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 p-6 sm:p-8 shadow-2xs">
        <div className="relative z-10 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 text-xs font-semibold mb-3 border border-blue-200/80 dark:border-blue-900">
            <Sparkles className="w-3.5 h-3.5 text-blue-600" />
            <span>Masa Bakti {orgProfile.academicYear} • {orgProfile.schoolName}</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Selamat Datang, {currentUser.fullName}!
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
            Anda saat ini mengakses sistem sebagai{' '}
            <span className="font-bold text-blue-700 dark:text-blue-300 uppercase bg-blue-50 dark:bg-blue-950 px-2 py-0.5 rounded border border-blue-200 dark:border-blue-800">
              {currentRole.replace('_', ' ')}
            </span>
            . Pantau tata kelola organisasi, analitik arus kas, presensi AI biometrik, dan kemajuan program kerja secara transparan.
          </p>

          {/* Quick Shortcuts */}
          <div className="flex flex-wrap gap-2.5 mt-5">
            <button
              onClick={() => setActivePage('kegiatan-presensi')}
              className="px-3.5 py-2 bg-blue-600 hover:bg-blue-700 active:scale-95 text-white text-xs font-bold rounded-xl transition-all shadow-xs flex items-center gap-2 cursor-pointer"
            >
              <QrCode className="w-4 h-4" />
              Scan Presensi AI & QR
            </button>
            <button
              onClick={() => setActivePage('keanggotaan')}
              className="px-3.5 py-2 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-semibold rounded-xl transition-all border border-slate-200/80 dark:border-slate-700 flex items-center gap-2 cursor-pointer"
            >
              <CreditCard className="w-4 h-4 text-blue-600" />
              KTA Digital Siswa
            </button>
            <button
              onClick={() => setActivePage('keuangan')}
              className="px-3.5 py-2 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-semibold rounded-xl transition-all border border-slate-200/80 dark:border-slate-700 flex items-center gap-2 cursor-pointer"
            >
              <Wallet className="w-4 h-4 text-emerald-600" />
              Iuran Kas ({pendingDues} Tertunda)
            </button>
            <button
              onClick={() => setActivePage('portal-publik')}
              className="px-3.5 py-2 bg-blue-50 dark:bg-blue-950/60 hover:bg-blue-100 dark:hover:bg-blue-900/60 text-blue-700 dark:text-blue-300 text-xs font-bold rounded-xl transition-all border border-blue-200/80 dark:border-blue-800 flex items-center gap-2 cursor-pointer shadow-2xs"
            >
              <Globe className="w-4 h-4 text-blue-600" />
              Buka Website Portal Publik
            </button>
          </div>
        </div>

        {/* Subtle decorative circles */}
        <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-radial from-blue-500/5 to-transparent pointer-events-none" />
      </div>

      {/* Metrics Row (4 Cards) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric 1 */}
        <div
          onClick={() => setActivePage('keanggotaan')}
          className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-2xs hover:shadow-xs transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Anggota Aktif</span>
            <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center group-hover:scale-105 transition-transform border border-blue-100 dark:border-blue-900">
              <Users className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-2xl font-black text-slate-900 dark:text-white">{activeMembersCount}</span>
            <span className="text-xs text-slate-400 ml-1.5 font-medium">Siswa Pengurus</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-2 flex items-center gap-1">
            <span>+{alumniCount} data alumni/demisioner</span>
          </p>
        </div>

        {/* Metric 2 */}
        <div
          onClick={() => setActivePage('keuangan')}
          className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-2xs hover:shadow-xs transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Saldo Kas Organisasi</span>
            <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center group-hover:scale-105 transition-transform border border-emerald-100 dark:border-emerald-900">
              <Wallet className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-2xl font-black text-slate-900 dark:text-white">{formatRupiah(currentBalance)}</span>
          </div>
          <p className="text-[11px] text-emerald-600 mt-2 flex items-center gap-1 font-semibold">
            <ArrowDownLeft className="w-3.5 h-3.5" />
            <span>Pemasukan: {formatRupiah(totalIncome)}</span>
          </p>
        </div>

        {/* Metric 3 */}
        <div
          onClick={() => setActivePage('kegiatan-presensi')}
          className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-2xs hover:shadow-xs transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Proker Berjalan</span>
            <div className="w-10 h-10 rounded-xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center group-hover:scale-105 transition-transform border border-amber-100 dark:border-amber-900">
              <Briefcase className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-2xl font-black text-slate-900 dark:text-white">{ongoingProkers.length}</span>
            <span className="text-xs text-slate-400 ml-1.5 font-medium">dari {workPrograms.length} Total</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-2 flex items-center gap-1">
            <TrendingUp className="w-3.5 h-3.5 text-blue-500" />
            <span>Target selesai semester gasal</span>
          </p>
        </div>

        {/* Metric 4 */}
        <div
          onClick={() => setActivePage('kegiatan-presensi')}
          className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-2xs hover:shadow-xs transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Rapat Terdekat</span>
            <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center group-hover:scale-105 transition-transform border border-blue-100 dark:border-blue-900">
              <Calendar className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-2xl font-black text-slate-900 dark:text-white">{upcomingMeetings.length}</span>
            <span className="text-xs text-slate-400 ml-1.5 font-medium">Jadwal Agenda</span>
          </div>
          <p className="text-[11px] text-blue-600 dark:text-blue-400 mt-2 flex items-center gap-1 font-semibold">
            <Clock className="w-3.5 h-3.5" />
            <span>Rapat Pleno Koordinasi</span>
          </p>
        </div>
      </div>

      {/* ======================================================== */}
      {/* SECTION: VISI MISI ORGANISASI                            */}
      {/* ======================================================== */}
      <div className="space-y-3">
        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-400">
          <Eye className="w-3.5 h-3.5 text-blue-600" />
          <span>Visi & Misi Organisasi • Masa Bakti {orgProfile.academicYear}</span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-5">
          {/* Visi Card - 2 Columns */}
          <div className="lg:col-span-2 relative overflow-hidden rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 p-6 shadow-2xs flex flex-col justify-between">
            <div className="relative z-10">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center border border-blue-100 dark:border-blue-900">
                  <Eye className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">Visi</h3>
                  <p className="text-[10px] text-slate-400 font-medium">Arah & Cita-cita Organisasi</p>
                </div>
              </div>
              <blockquote className="text-sm leading-relaxed font-medium italic text-slate-700 dark:text-slate-300 border-l-2 border-blue-500 bg-blue-50/40 dark:bg-blue-950/20 pl-4 py-2.5 rounded-r-xl">
                "{orgProfile.vision}"
              </blockquote>
            </div>
            <div className="relative z-10 mt-5 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center gap-2 text-[11px] text-blue-600 dark:text-blue-400 font-semibold">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Motto: {orgProfile.motto}</span>
            </div>
          </div>

          {/* Misi Card - 3 Columns */}
          <div className="lg:col-span-3 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 p-6 shadow-2xs flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2 mb-4 pb-2 border-b border-slate-100 dark:border-slate-800">
                <div className="w-7 h-7 rounded-lg bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center border border-blue-100 dark:border-blue-900">
                  <Target className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">Misi Organisasi</h3>
                  <p className="text-[11px] text-slate-400">Langkah strategis mewujudkan visi bersama</p>
                </div>
              </div>

              <div className="space-y-2.5">
                {orgProfile.mission.map((item, idx) => (
                  <div
                    key={idx}
                    className="flex items-start gap-3 p-2.5 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/60 transition-colors group"
                  >
                    <div className="w-6 h-6 rounded-lg bg-blue-600 text-white flex items-center justify-center text-[10px] font-extrabold shrink-0 mt-0.5 group-hover:scale-105 transition-transform">
                      {idx + 1}
                    </div>
                    <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed font-medium pt-0.5">
                      {item}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-3 mt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[11px] text-slate-400">
              <span>{orgProfile.mission.length} Butir Misi Organisasi</span>
              <span className="font-semibold text-blue-600 hover:text-blue-700 cursor-pointer" onClick={() => setActivePage('organisasi-profil')}>
                Lihat Profil Lengkap &rarr;
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* ======================================================== */}
      {/* SECTION 1: KEUANGAN & ARUS KAS (FINANCIAL CENTER)        */}
      {/* ======================================================== */}
      <div className="space-y-3">
        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-400">
          <Wallet className="w-3.5 h-3.5 text-blue-600" />
          <span>Analisis Keuangan & Sirkulasi Kas</span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left 2 Cols: Cash Flow Bar Chart */}
          <div className="lg:col-span-2">
            <CashFlowChart transactions={cashTransactions} />
          </div>

          {/* Right 1 Col: Mutasi Kas Terbaru */}
          <div className="lg:col-span-1">
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 p-5 shadow-2xs h-full flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-4 pb-2 border-b border-slate-100 dark:border-slate-800">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
                      <Wallet className="w-4 h-4" />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-slate-900 dark:text-white">Mutasi Kas Terbaru</h3>
                      <p className="text-[11px] text-slate-500">Catatan transparansi kas OSIS</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setActivePage('keuangan')}
                    className="text-xs font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1 cursor-pointer"
                  >
                    Buku Kas <ArrowUpRight className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="divide-y divide-slate-100 dark:divide-slate-800">
                  {cashTransactions.slice(0, 4).map((trx) => (
                    <div key={trx.id} className="py-2.5 flex items-center justify-between gap-3">
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div
                          className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                            trx.type === 'pemasukan'
                              ? 'bg-emerald-50 text-emerald-600'
                              : 'bg-rose-50 text-rose-600'
                          }`}
                        >
                          {trx.type === 'pemasukan' ? (
                            <ArrowDownLeft className="w-4 h-4" />
                          ) : (
                            <ArrowUpRight className="w-4 h-4" />
                          )}
                        </div>
                        <div className="min-w-0">
                          <p className="text-xs font-bold text-slate-800 dark:text-slate-200 leading-tight truncate">{trx.description}</p>
                          <p className="text-[10px] text-slate-400 mt-0.5">
                            {formatDateIndo(trx.transactionDate)} • {trx.category.replace('_', ' ')}
                          </p>
                        </div>
                      </div>
                      <span
                        className={`text-xs font-extrabold shrink-0 ${
                          trx.type === 'pemasukan' ? 'text-emerald-600' : 'text-rose-600'
                        }`}
                      >
                        {trx.type === 'pemasukan' ? '+' : '-'} {formatRupiah(trx.amount)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-3 mt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
                <span className="text-[11px] font-medium text-slate-500">Saldo Kas Saat Ini:</span>
                <span className="font-extrabold text-slate-900 dark:text-white">{formatRupiah(currentBalance)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ======================================================== */}
      {/* SECTION 2: PROGRAM KERJA & DISTRIBUSI SEKBID             */}
      {/* ======================================================== */}
      <div className="space-y-3">
        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-400">
          <Briefcase className="w-3.5 h-3.5 text-blue-600" />
          <span>Program Kerja & Komposisi Kepengurusan</span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left: Progress Proker Section */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 p-5 shadow-2xs h-full flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-4 pb-2 border-b border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
                    <Briefcase className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white">Progress Program Kerja Utama</h3>
                    <p className="text-[11px] text-slate-500">Capaian milestone program kerja OSIS SMK</p>
                  </div>
                </div>
                <button
                  onClick={() => setActivePage('kegiatan-presensi')}
                  className="text-xs font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1 cursor-pointer"
                >
                  Lihat Semua <ArrowUpRight className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="space-y-3">
                {workPrograms.slice(0, 3).map((p) => {
                  const getStatusBadge = (status: string) => {
                    switch (status) {
                      case 'selesai':
                        return { text: 'Selesai', bg: 'bg-emerald-50 text-emerald-700 border-emerald-200' };
                      case 'berjalan':
                        return { text: 'Berjalan', bg: 'bg-blue-50 text-blue-700 border-blue-200' };
                      case 'disetujui':
                        return { text: 'Disetujui', bg: 'bg-amber-50 text-amber-700 border-amber-200' };
                      default:
                        return { text: status, bg: 'bg-slate-50 text-slate-600 border-slate-200' };
                    }
                  };
                  const statusBadge = getStatusBadge(p.status);

                  return (
                    <div
                      key={p.id}
                      className="p-3 rounded-xl bg-slate-50/70 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 hover:border-blue-100 hover:bg-slate-50 transition-all space-y-2"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <span className="font-bold text-slate-800 dark:text-slate-200 text-xs line-clamp-1">{p.title}</span>
                          <span className="text-[11px] text-slate-400 mt-0.5 block">{p.divisionName}</span>
                        </div>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border shrink-0 ${statusBadge.bg}`}>
                          {statusBadge.text}
                        </span>
                      </div>

                      <div>
                        <div className="flex items-center justify-between text-[11px] mb-1">
                          <span className="text-slate-500 font-medium">Capaian Milestone</span>
                          <span className="font-extrabold text-blue-600">{p.progressPercent}%</span>
                        </div>
                        <div className="w-full h-2 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all duration-500 ${
                              p.progressPercent === 100
                                ? 'bg-gradient-to-r from-emerald-500 to-teal-500'
                                : p.progressPercent >= 50
                                ? 'bg-gradient-to-r from-blue-600 to-sky-400'
                                : 'bg-gradient-to-r from-amber-500 to-orange-500'
                            }`}
                            style={{ width: `${p.progressPercent}%` }}
                          />
                        </div>
                      </div>

                      <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1 border-t border-slate-200/50 dark:border-slate-700">
                        <span>Target: {formatDateIndo(p.targetDate)}</span>
                        <span className="font-semibold text-slate-600 dark:text-slate-300">Anggaran: {formatRupiah(p.estimatedBudget)}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="pt-3 mt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500">
              <span>{workPrograms.length} Total Agenda Proker</span>
              <span className="font-bold text-blue-600 hover:text-blue-700 cursor-pointer" onClick={() => setActivePage('kegiatan-presensi')}>
                Kelola Proker &rarr;
              </span>
            </div>
          </div>

          {/* Right: Division Distribution Donut Chart */}
          <div className="h-full">
            <DivisionDistributionChart members={members} divisions={divisions} />
          </div>
        </div>
      </div>

      {/* ======================================================== */}
      {/* SECTION 3: PRESENSI, JADWAL RAPAT & PENGUMUMAN           */}
      {/* ======================================================== */}
      <div className="space-y-3">
        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-400">
          <QrCode className="w-3.5 h-3.5 text-blue-600" />
          <span>Operasional Harian, Presensi & Komunikasi</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Card 1: Attendance Rate & Proker KPI */}
          <div>
            <AttendanceStatsWidget attendances={attendances} workPrograms={workPrograms} />
          </div>

          {/* Card 2: Upcoming Meetings & QR Access */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 p-5 shadow-2xs h-full flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-4 pb-2 border-b border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
                    <Calendar className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white">Jadwal Rapat & Presensi</h3>
                    <p className="text-[11px] text-slate-500">Agenda koordinasi pengurus</p>
                  </div>
                </div>
                <button
                  onClick={() => setActivePage('kegiatan-presensi')}
                  className="text-xs font-bold text-blue-600 hover:text-blue-700 cursor-pointer"
                >
                  Lihat Agenda
                </button>
              </div>

              <div className="space-y-3">
                {meetings.slice(0, 2).map((meet) => (
                  <div
                    key={meet.id}
                    className="p-3 rounded-xl border border-slate-200/80 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/50 space-y-2 hover:bg-slate-50 transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/60 px-2 py-0.5 rounded-full uppercase border border-blue-200/60">
                        {meet.type}
                      </span>
                      {meet.isAttendanceOpen && (
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full animate-pulse">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                          Absensi Terbuka
                        </span>
                      )}
                    </div>
                    <p className="text-xs font-bold text-slate-800 dark:text-slate-200 line-clamp-1">{meet.title}</p>
                    <div className="text-[11px] text-slate-500 space-y-0.5">
                      <p className="flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span>{formatDateIndo(meet.meetingDate)} ({meet.startTime} - {meet.endTime})</span>
                      </p>
                      <p className="flex items-center gap-1.5">
                        <Building2 className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span className="truncate">{meet.location}</span>
                      </p>
                    </div>
                    <button
                      onClick={() => setActivePage('kegiatan-presensi')}
                      className="w-full py-1.5 mt-1 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-lg flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                    >
                      <QrCode className="w-3.5 h-3.5" />
                      Buka QR & Face Scan
                    </button>
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-3 mt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500">
              <span>{upcomingMeetings.length} Jadwal Rapat Terjadwal</span>
              <span className="font-bold text-blue-600 hover:text-blue-700 cursor-pointer" onClick={() => setActivePage('kegiatan-presensi')}>
                Kalender Rapat &rarr;
              </span>
            </div>
          </div>

          {/* Card 3: Announcements Card */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 p-5 shadow-2xs h-full flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-4 pb-2 border-b border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center">
                    <Megaphone className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white">Papan Pengumuman</h3>
                    <p className="text-[11px] text-slate-500">Warta resmi organisasi</p>
                  </div>
                </div>
                <button
                  onClick={() => setActivePage('pengumuman')}
                  className="text-xs font-bold text-blue-600 hover:text-blue-700 cursor-pointer"
                >
                  Semua
                </button>
              </div>

              <div className="space-y-2.5">
                {announcements.slice(0, 2).map((ann) => (
                  <div key={ann.id} className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 hover:bg-slate-100/60 transition-colors">
                    <div className="flex items-center justify-between mb-1">
                      <span
                        className={`text-[9px] font-extrabold px-1.5 py-0.5 rounded uppercase ${
                          ann.priority === 'penting'
                            ? 'bg-rose-100 text-rose-700'
                            : 'bg-slate-200 text-slate-700'
                        }`}
                      >
                        {ann.priority}
                      </span>
                      <span className="text-[10px] text-slate-400">{formatDateIndo(ann.date)}</span>
                    </div>
                    <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200 line-clamp-1">{ann.title}</h4>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 line-clamp-2 leading-relaxed">{ann.content}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-3 mt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500">
              <span>{announcements.length} Pengumuman Aktif</span>
              <span className="font-bold text-blue-600 hover:text-blue-700 cursor-pointer" onClick={() => setActivePage('pengumuman')}>
                Semua Informasi &rarr;
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

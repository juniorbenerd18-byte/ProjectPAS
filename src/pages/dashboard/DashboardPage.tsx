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
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { formatRupiah, formatDateIndo } from '../../lib/utils';

export const DashboardPage: React.FC = () => {
  const {
    currentUser,
    currentRole,
    orgProfile,
    members,
    workPrograms,
    events,
    meetings,
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
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white p-6 sm:p-8 shadow-sm">
        <div className="relative z-10 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-300 text-xs font-semibold mb-3 border border-indigo-500/30">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Masa Bakti {orgProfile.academicYear} • {orgProfile.schoolName}</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-extrabold tracking-tight">
            Selamat Datang, {currentUser.fullName}!
          </h2>
          <p className="text-xs sm:text-sm text-slate-300 mt-1 leading-relaxed">
            Anda saat ini mengakses sistem sebagai{' '}
            <span className="font-bold text-white uppercase bg-indigo-600/60 px-2 py-0.5 rounded">
              {currentRole.replace('_', ' ')}
            </span>
            . Pantau tata kelola organisasi, presensi kegiatan QR, dan buku kas secara transparan.
          </p>

          {/* Quick Shortcuts */}
          <div className="flex flex-wrap gap-2.5 mt-5">
            <button
              onClick={() => setActivePage('kegiatan-presensi')}
              className="px-3.5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-xl transition-all shadow-sm flex items-center gap-2 cursor-pointer"
            >
              <QrCode className="w-4 h-4" />
              Scan QR Presensi
            </button>
            <button
              onClick={() => setActivePage('keanggotaan')}
              className="px-3.5 py-2 bg-white/10 hover:bg-white/20 text-white text-xs font-semibold rounded-xl transition-all border border-white/10 flex items-center gap-2 cursor-pointer"
            >
              <CreditCard className="w-4 h-4" />
              KTA Digital Saya
            </button>
            <button
              onClick={() => setActivePage('keuangan')}
              className="px-3.5 py-2 bg-white/10 hover:bg-white/20 text-white text-xs font-semibold rounded-xl transition-all border border-white/10 flex items-center gap-2 cursor-pointer"
            >
              <Wallet className="w-4 h-4" />
              Iuran Kas ({pendingDues} Tertunda)
            </button>
          </div>
        </div>

        {/* Subtle decorative circles */}
        <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-radial from-indigo-500/10 to-transparent pointer-events-none" />
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric 1 */}
        <div
          onClick={() => setActivePage('keanggotaan')}
          className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-2xs hover:shadow-xs transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Anggota Aktif</span>
            <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center group-hover:scale-105 transition-transform">
              <Users className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-2xl font-black text-slate-900">{activeMembersCount}</span>
            <span className="text-xs text-slate-400 ml-1.5 font-medium">Siswa Pengurus</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-2 flex items-center gap-1">
            <span>+{alumniCount} data alumni/demisioner</span>
          </p>
        </div>

        {/* Metric 2 */}
        <div
          onClick={() => setActivePage('keuangan')}
          className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-2xs hover:shadow-xs transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Saldo Kas Organisasi</span>
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center group-hover:scale-105 transition-transform">
              <Wallet className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-2xl font-black text-slate-900">{formatRupiah(currentBalance)}</span>
          </div>
          <p className="text-[11px] text-emerald-600 mt-2 flex items-center gap-1 font-semibold">
            <ArrowDownLeft className="w-3.5 h-3.5" />
            <span>Pemasukan: {formatRupiah(totalIncome)}</span>
          </p>
        </div>

        {/* Metric 3 */}
        <div
          onClick={() => setActivePage('kegiatan-presensi')}
          className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-2xs hover:shadow-xs transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Proker Berjalan</span>
            <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center group-hover:scale-105 transition-transform">
              <Briefcase className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-2xl font-black text-slate-900">{ongoingProkers.length}</span>
            <span className="text-xs text-slate-400 ml-1.5 font-medium">dari {workPrograms.length} Total</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-2 flex items-center gap-1">
            <TrendingUp className="w-3.5 h-3.5 text-indigo-500" />
            <span>Target selesai semester gasal</span>
          </p>
        </div>

        {/* Metric 4 */}
        <div
          onClick={() => setActivePage('kegiatan-presensi')}
          className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-2xs hover:shadow-xs transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Rapat Terdekat</span>
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center group-hover:scale-105 transition-transform">
              <Calendar className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-2xl font-black text-slate-900">{upcomingMeetings.length}</span>
            <span className="text-xs text-slate-400 ml-1.5 font-medium">Jadwal Agenda</span>
          </div>
          <p className="text-[11px] text-indigo-600 mt-2 flex items-center gap-1 font-semibold">
            <Clock className="w-3.5 h-3.5" />
            <span>Rapat Pleno Koordinasi</span>
          </p>
        </div>
      </div>

      {/* Main Grid: Proker Progress & Rapat / Keuangan */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Proker Progress & Recent Transactions */}
        <div className="lg:col-span-2 space-y-6">
          {/* Progress Proker Section */}
          <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-2xs">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-sm font-bold text-slate-900">Progress Program Kerja Utama</h3>
                <p className="text-xs text-slate-500">Capaian milestone program kerja OSIS SMK</p>
              </div>
              <button
                onClick={() => setActivePage('kegiatan-presensi')}
                className="text-xs font-bold text-indigo-600 hover:text-indigo-700 flex items-center gap-1 cursor-pointer"
              >
                Lihat Semua <ArrowUpRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="space-y-4">
              {workPrograms.slice(0, 3).map((p) => (
                <div key={p.id} className="p-3.5 rounded-xl bg-slate-50/70 border border-slate-100">
                  <div className="flex items-center justify-between text-xs mb-1.5">
                    <span className="font-bold text-slate-800">{p.title}</span>
                    <span className="font-extrabold text-indigo-600">{p.progressPercent}%</span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-slate-200 overflow-hidden mb-2">
                    <div
                      className="h-full rounded-full bg-indigo-600 transition-all duration-500"
                      style={{ width: `${p.progressPercent}%` }}
                    />
                  </div>
                  <div className="flex items-center justify-between text-[11px] text-slate-400">
                    <span>{p.divisionName}</span>
                    <span>Anggaran: {formatRupiah(p.estimatedBudget)}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Recent Cash Transactions */}
          <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-2xs">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-sm font-bold text-slate-900">Mutasi Kas Terbaru</h3>
                <p className="text-xs text-slate-500">Catatan transparansi sirkulasi dana OSIS</p>
              </div>
              <button
                onClick={() => setActivePage('keuangan')}
                className="text-xs font-bold text-indigo-600 hover:text-indigo-700 flex items-center gap-1 cursor-pointer"
              >
                Buku Kas Lengkap <ArrowUpRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="divide-y divide-slate-100">
              {cashTransactions.slice(0, 4).map((trx) => (
                <div key={trx.id} className="py-3 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
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
                    <div>
                      <p className="text-xs font-bold text-slate-800 leading-tight">{trx.description}</p>
                      <p className="text-[10px] text-slate-400 mt-0.5">
                        {formatDateIndo(trx.transactionDate)} • {trx.category.replace('_', ' ')}
                      </p>
                    </div>
                  </div>
                  <span
                    className={`text-xs font-extrabold ${
                      trx.type === 'pemasukan' ? 'text-emerald-600' : 'text-rose-600'
                    }`}
                  >
                    {trx.type === 'pemasukan' ? '+' : '-'} {formatRupiah(trx.amount)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right 1 Col: Jadwal Rapat & Pengumuman */}
        <div className="space-y-6">
          {/* Upcoming Meetings & QR Access */}
          <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-2xs">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold text-slate-900">Jadwal Rapat & Absensi</h3>
              <button
                onClick={() => setActivePage('kegiatan-presensi')}
                className="text-xs font-bold text-indigo-600 hover:text-indigo-700 cursor-pointer"
              >
                Lihat
              </button>
            </div>

            <div className="space-y-3">
              {meetings.map((meet) => (
                <div
                  key={meet.id}
                  className="p-3.5 rounded-xl border border-slate-200/80 bg-slate-50/50 space-y-2"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full uppercase">
                      {meet.type}
                    </span>
                    {meet.isAttendanceOpen && (
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full animate-pulse">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                        Absensi Terbuka
                      </span>
                    )}
                  </div>
                  <p className="text-xs font-bold text-slate-800">{meet.title}</p>
                  <div className="text-[11px] text-slate-500 space-y-0.5">
                    <p className="flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-slate-400" />
                      {formatDateIndo(meet.meetingDate)} ({meet.startTime} - {meet.endTime})
                    </p>
                    <p className="flex items-center gap-1.5">
                      <Building2 className="w-3.5 h-3.5 text-slate-400" />
                      {meet.location}
                    </p>
                  </div>
                  <button
                    onClick={() => setActivePage('kegiatan-presensi')}
                    className="w-full py-1.5 mt-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-lg flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <QrCode className="w-3.5 h-3.5" />
                    Buka QR Absensi
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Announcements Card */}
          <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-2xs">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Megaphone className="w-4 h-4 text-indigo-600" />
                Papan Pengumuman
              </h3>
              <button
                onClick={() => setActivePage('pengumuman')}
                className="text-xs font-bold text-indigo-600 hover:text-indigo-700 cursor-pointer"
              >
                Semua
              </button>
            </div>

            <div className="space-y-3">
              {announcements.map((ann) => (
                <div key={ann.id} className="p-3 rounded-xl bg-slate-50 border border-slate-100">
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
                  <h4 className="text-xs font-bold text-slate-800">{ann.title}</h4>
                  <p className="text-[11px] text-slate-500 mt-1 line-clamp-2">{ann.content}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

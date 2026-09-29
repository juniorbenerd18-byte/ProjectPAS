import React from 'react';
import { BarChart3, Printer, Users, Wallet, Briefcase, CalendarCheck, CheckCircle2 } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { formatRupiah, formatDateIndo } from '../../lib/utils';

export const LaporanPusatPage: React.FC = () => {
  const { members, workPrograms, attendances, cashTransactions, orgProfile } = useApp();

  const totalMembers = members.length;
  const activeMembers = members.filter((m) => m.status === 'aktif').length;
  const alumniMembers = members.filter((m) => m.status === 'alumni').length;

  // Breakdown by Major
  const majorCounts = members.reduce((acc, m) => {
    acc[m.major] = (acc[m.major] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  // Proker summary
  const completedProkers = workPrograms.filter((p) => p.status === 'selesai').length;
  const ongoingProkers = workPrograms.filter((p) => p.status === 'berjalan' || p.status === 'disetujui').length;

  // Finance summary
  const totalIncome = cashTransactions
    .filter((t) => t.type === 'pemasukan')
    .reduce((sum, t) => sum + t.amount, 0);
  const totalExpense = cashTransactions
    .filter((t) => t.type === 'pengeluaran')
    .reduce((sum, t) => sum + t.amount, 0);
  const netBalance = totalIncome - totalExpense;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="no-print flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-5 rounded-2xl border border-slate-200/80 shadow-2xs">
        <div>
          <h2 className="text-base font-bold text-slate-900">Pusat Laporan & Rekapitulasi Organisasi</h2>
          <p className="text-xs text-slate-500">
            Ringkasan eksekutif seluruh modul untuk penilaian akreditasi & pengujian UKK
          </p>
        </div>
        <button
          onClick={handlePrint}
          className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold shadow-sm flex items-center gap-1.5 cursor-pointer self-start sm:self-auto"
        >
          <Printer className="w-4 h-4" />
          <span>Cetak Laporan Lengkap</span>
        </button>
      </div>

      {/* Main Report Container */}
      <div className="bg-white p-8 sm:p-12 rounded-2xl border border-slate-200/80 shadow-2xs space-y-8 print:border-none print:shadow-none print:p-0">
        {/* Letterhead */}
        <div className="border-b-2 border-slate-800 pb-4 text-center space-y-1">
          <h1 className="text-base font-black uppercase tracking-wider text-slate-900">
            {orgProfile.name}
          </h1>
          <h2 className="text-lg font-black uppercase text-indigo-700">{orgProfile.schoolName}</h2>
          <p className="text-xs text-slate-500">{orgProfile.address} • Telp: {orgProfile.phone}</p>
        </div>

        <div className="text-center py-1">
          <h3 className="text-sm font-extrabold uppercase underline tracking-wide text-slate-900">
            REKAPITULASI LAPORAN AKUNTABILITAS TATA KELOLA ORGANISASI
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Periode Kepengurusan: {orgProfile.academicYear} • Tanggal Cetak: {formatDateIndo(new Date().toISOString())}
          </p>
        </div>

        {/* Section 1: Keanggotaan */}
        <div className="space-y-3">
          <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-900 flex items-center gap-2 border-b border-slate-200 pb-1">
            <Users className="w-4 h-4 text-indigo-600" />
            1. Rekapitulasi Data Keanggotaan Siswa
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 text-xs">
              <span className="text-slate-400 block font-medium">Total Anggota Terdaftar:</span>
              <span className="text-lg font-bold text-slate-900">{totalMembers} Siswa</span>
            </div>
            <div className="p-3.5 bg-emerald-50/50 rounded-xl border border-emerald-200 text-xs">
              <span className="text-emerald-700 block font-medium">Anggota Aktif:</span>
              <span className="text-lg font-bold text-emerald-800">{activeMembers} Siswa</span>
            </div>
            <div className="p-3.5 bg-amber-50/50 rounded-xl border border-amber-200 text-xs">
              <span className="text-amber-700 block font-medium">Demisioner / Alumni:</span>
              <span className="text-lg font-bold text-amber-800">{alumniMembers} Siswa</span>
            </div>
          </div>

          {/* Breakdown per major table */}
          <div className="rounded-xl border border-slate-200 overflow-hidden text-xs">
            <table className="w-full text-left">
              <thead className="bg-slate-100 text-slate-600 font-bold uppercase text-[10px]">
                <tr>
                  <th className="py-2 px-3">Kompetensi Keahlian / Jurusan</th>
                  <th className="py-2 px-3 text-right">Jumlah Siswa Terdaftar</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {Object.entries(majorCounts).map(([major, count]) => (
                  <tr key={major}>
                    <td className="py-2 px-3 text-slate-800 font-semibold">{major}</td>
                    <td className="py-2 px-3 text-right font-bold text-slate-900">{count} Siswa</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Section 2: Program Kerja & Kegiatan */}
        <div className="space-y-3">
          <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-900 flex items-center gap-2 border-b border-slate-200 pb-1">
            <Briefcase className="w-4 h-4 text-indigo-600" />
            2. Rekapitulasi Capaian Program Kerja & Kegiatan
          </h4>
          <div className="grid grid-cols-3 gap-3">
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs">
              <span className="text-slate-400 block">Total Proker:</span>
              <span className="text-base font-bold text-slate-900">{workPrograms.length} Agenda</span>
            </div>
            <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200 text-xs">
              <span className="text-emerald-700 block">Selesai 100%:</span>
              <span className="text-base font-bold text-emerald-800">{completedProkers} Proker</span>
            </div>
            <div className="p-3 bg-blue-50 rounded-xl border border-blue-200 text-xs">
              <span className="text-blue-700 block">Sedang Berjalan:</span>
              <span className="text-base font-bold text-blue-800">{ongoingProkers} Proker</span>
            </div>
          </div>
        </div>

        {/* Section 3: Keuangan Kas */}
        <div className="space-y-3">
          <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-900 flex items-center gap-2 border-b border-slate-200 pb-1">
            <Wallet className="w-4 h-4 text-indigo-600" />
            3. Ringkasan Keuangan Kas Organisasi
          </h4>
          <div className="grid grid-cols-3 gap-3 p-4 bg-slate-50 rounded-xl border border-slate-200 text-xs">
            <div>
              <span className="text-[10px] text-slate-400 font-bold uppercase block">Total Pemasukan</span>
              <span className="text-sm font-black text-emerald-600">{formatRupiah(totalIncome)}</span>
            </div>
            <div>
              <span className="text-[10px] text-slate-400 font-bold uppercase block">Total Pengeluaran</span>
              <span className="text-sm font-black text-rose-600">{formatRupiah(totalExpense)}</span>
            </div>
            <div>
              <span className="text-[10px] text-slate-400 font-bold uppercase block">Saldo Kas Terkini</span>
              <span className="text-sm font-black text-indigo-700">{formatRupiah(netBalance)}</span>
            </div>
          </div>
        </div>

        {/* Signatures */}
        <div className="pt-8 grid grid-cols-2 gap-8 text-center text-xs text-slate-700">
          <div>
            <p className="text-slate-500">Mengetahui,</p>
            <p className="font-bold text-slate-800">Pembina OSIS</p>
            <div className="h-16 flex items-center justify-center font-serif italic text-slate-400">
              ( Tanda Tangan & Cap Sekolah )
            </div>
            <p className="font-bold text-slate-900 underline">{orgProfile.pembinaName}</p>
          </div>
          <div>
            <p className="text-slate-500">Ketua Umum,</p>
            <p className="font-bold text-slate-800">OSIS SMK</p>
            <div className="h-16 flex items-center justify-center font-serif italic text-indigo-600 font-bold text-sm">
              {orgProfile.ketuaName.split(' ')[0]}
            </div>
            <p className="font-bold text-slate-900 underline">{orgProfile.ketuaName}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

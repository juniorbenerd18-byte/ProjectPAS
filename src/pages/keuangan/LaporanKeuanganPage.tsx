import React, { useState } from 'react';
import { Printer, Download, ArrowDownLeft, ArrowUpRight, Wallet, CheckCircle2, Calendar } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { formatRupiah, formatDateIndo } from '../../lib/utils';

export const LaporanKeuanganPage: React.FC = () => {
  const { cashTransactions, orgProfile } = useApp();
  const [filterMonth, setFilterMonth] = useState<string>('all');

  // Sort chronological
  const sortedTransactions = [...cashTransactions].sort(
    (a, b) => new Date(a.transactionDate).getTime() - new Date(b.transactionDate).getTime()
  );

  let runningBalance = 0;
  const ledgerData = sortedTransactions.map((t) => {
    if (t.type === 'pemasukan') {
      runningBalance += t.amount;
    } else {
      runningBalance -= t.amount;
    }
    return {
      ...t,
      balanceAfter: runningBalance,
    };
  });

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
      {/* Header (hidden when printing) */}
      <div className="no-print flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-5 rounded-2xl border border-slate-200/80 shadow-2xs">
        <div>
          <h2 className="text-base font-bold text-slate-900">Buku Kas Umum & Laporan Keuangan</h2>
          <p className="text-xs text-slate-500">
            Rekapitulasi sirkulasi kas masuk dan kas keluar dengan format akuntansi resmi sekolah
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handlePrint}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold shadow-sm flex items-center gap-1.5 cursor-pointer"
          >
            <Printer className="w-4 h-4" />
            <span>Cetak Laporan Resmi (PDF)</span>
          </button>
        </div>
      </div>

      {/* Printable Sheet */}
      <div className="bg-white p-8 sm:p-12 rounded-2xl border border-slate-200/80 shadow-2xs space-y-6 print:border-none print:shadow-none print:p-0">
        {/* Kop Surat Resmi */}
        <div className="border-b-2 border-slate-800 pb-4 text-center space-y-1">
          <h1 className="text-sm sm:text-base font-black uppercase tracking-wider text-slate-900">
            {orgProfile.name}
          </h1>
          <h2 className="text-base sm:text-lg font-black uppercase text-indigo-700">
            {orgProfile.schoolName}
          </h2>
          <p className="text-xs text-slate-500">{orgProfile.address} • Telp: {orgProfile.phone}</p>
        </div>

        {/* Title */}
        <div className="text-center py-2">
          <h3 className="text-sm font-extrabold uppercase underline tracking-wide text-slate-900">
            LAPORAN PERTANGGUNGJAWABAN BUKU KAS UMUM
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Tahun Ajaran: {orgProfile.academicYear} • Per Tanggal: {formatDateIndo(new Date().toISOString())}
          </p>
        </div>

        {/* Ringkasan Angka */}
        <div className="grid grid-cols-3 gap-3 p-4 bg-slate-50 rounded-xl border border-slate-200/80 text-xs">
          <div>
            <span className="text-[10px] text-slate-400 font-bold uppercase block">Total Pemasukan (Debit)</span>
            <span className="text-sm font-black text-emerald-600">{formatRupiah(totalIncome)}</span>
          </div>
          <div>
            <span className="text-[10px] text-slate-400 font-bold uppercase block">Total Pengeluaran (Kredit)</span>
            <span className="text-sm font-black text-rose-600">{formatRupiah(totalExpense)}</span>
          </div>
          <div>
            <span className="text-[10px] text-slate-400 font-bold uppercase block">Saldo Kas Terkini</span>
            <span className="text-sm font-black text-indigo-700">{formatRupiah(netBalance)}</span>
          </div>
        </div>

        {/* Tabel Transaksi Akuntansi */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs border border-slate-300">
            <thead>
              <tr className="bg-slate-100 text-slate-700 font-bold uppercase tracking-wider text-[10px] border-b border-slate-300">
                <th className="py-2.5 px-3 border-r border-slate-300 text-center w-10">No</th>
                <th className="py-2.5 px-3 border-r border-slate-300 w-28">Tanggal</th>
                <th className="py-2.5 px-3 border-r border-slate-300">Uraian Transaksi</th>
                <th className="py-2.5 px-3 border-r border-slate-300 text-right w-28">Debit (Masuk)</th>
                <th className="py-2.5 px-3 border-r border-slate-300 text-right w-28">Kredit (Keluar)</th>
                <th className="py-2.5 px-3 text-right w-32">Saldo Akhir</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {ledgerData.map((trx, index) => (
                <tr key={trx.id} className="hover:bg-slate-50">
                  <td className="py-2 px-3 border-r border-slate-200 text-center text-slate-500 font-mono">
                    {index + 1}
                  </td>
                  <td className="py-2 px-3 border-r border-slate-200 font-medium text-slate-700">
                    {formatDateIndo(trx.transactionDate)}
                  </td>
                  <td className="py-2 px-3 border-r border-slate-200 text-slate-800">
                    <p className="font-semibold">{trx.description}</p>
                    <span className="text-[10px] text-slate-400 uppercase">
                      {trx.category.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="py-2 px-3 border-r border-slate-200 text-right text-emerald-600 font-bold">
                    {trx.type === 'pemasukan' ? formatRupiah(trx.amount) : '-'}
                  </td>
                  <td className="py-2 px-3 border-r border-slate-200 text-right text-rose-600 font-bold">
                    {trx.type === 'pengeluaran' ? formatRupiah(trx.amount) : '-'}
                  </td>
                  <td className="py-2 px-3 text-right font-black text-slate-900">
                    {formatRupiah(trx.balanceAfter)}
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="bg-slate-100 font-bold text-slate-900 border-t-2 border-slate-400">
                <td colSpan={3} className="py-2.5 px-3 text-right uppercase border-r border-slate-300">
                  Total Mutasi & Saldo Akhir:
                </td>
                <td className="py-2.5 px-3 text-right text-emerald-700 border-r border-slate-300">
                  {formatRupiah(totalIncome)}
                </td>
                <td className="py-2.5 px-3 text-right text-rose-700 border-r border-slate-300">
                  {formatRupiah(totalExpense)}
                </td>
                <td className="py-2.5 px-3 text-right text-indigo-900 font-black">
                  {formatRupiah(netBalance)}
                </td>
              </tr>
            </tfoot>
          </table>
        </div>

        {/* Lembar Pengesahan / Tanda Tangan */}
        <div className="pt-8 grid grid-cols-3 gap-4 text-center text-xs text-slate-700">
          <div>
            <p className="text-slate-500">Mengetahui,</p>
            <p className="font-bold text-slate-800">Pembina OSIS</p>
            <div className="h-16 flex items-center justify-center font-serif italic text-slate-400">
              ( Tanda Tangan & Cap )
            </div>
            <p className="font-bold text-slate-900 underline">{orgProfile.pembinaName}</p>
            <p className="text-[10px] text-slate-400">NIP. 19780512 200312 1 002</p>
          </div>

          <div>
            <p className="text-slate-500">Menyetujui,</p>
            <p className="font-bold text-slate-800">Ketua Umum OSIS</p>
            <div className="h-16 flex items-center justify-center font-serif italic text-indigo-600 font-bold text-sm">
              {orgProfile.ketuaName.split(' ')[0]}
            </div>
            <p className="font-bold text-slate-900 underline">{orgProfile.ketuaName}</p>
            <p className="text-[10px] text-slate-400">NISN. 0071234501</p>
          </div>

          <div>
            <p className="text-slate-500">Dibuat Oleh,</p>
            <p className="font-bold text-slate-800">Bendahara Umum</p>
            <div className="h-16 flex items-center justify-center font-serif italic text-emerald-600 font-bold text-sm">
              Rizky A.
            </div>
            <p className="font-bold text-slate-900 underline">Rizky Alamsyah</p>
            <p className="text-[10px] text-slate-400">NISN. 0071234503</p>
          </div>
        </div>
      </div>
    </div>
  );
};

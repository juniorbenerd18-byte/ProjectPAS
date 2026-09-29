import React, { useState } from 'react';
import {
  Wallet,
  ArrowUpRight,
  ArrowDownLeft,
  Plus,
  Receipt,
  CheckCircle2,
  Clock,
  AlertCircle,
  Search,
  Filter,
  Printer,
  FileText,
  Eye,
  Trash2,
  Building2,
  Check,
  Download,
  TrendingUp,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { CashTransaction, MemberDue } from '../../types';
import { formatRupiah, formatDateIndo, formatNumber, parseFormattedNumber } from '../../lib/utils';
import { Modal } from '../../components/common/Modal';
import { ImagePicker } from '../../components/common/ImagePicker';
import confetti from 'canvas-confetti';

export const KeuanganTerpaduPage: React.FC = () => {
  const {
    cashTransactions,
    addCashTransaction,
    deleteCashTransaction,
    memberDues,
    updateMemberDueStatus,
    uploadMemberDueProof,
    members,
    currentUser,
    currentRole,
    orgProfile,
    showToast,
  } = useApp();

  const [activeTab, setActiveTab] = useState<'buku_kas' | 'iuran_siswa' | 'laporan_cetak'>('buku_kas');

  // ----------------------------------------------------
  // Buku Kas Umum States & Handlers
  // ----------------------------------------------------
  const [kasFilterType, setKasFilterType] = useState<'semua' | 'pemasukan' | 'pengeluaran'>('semua');
  const [kasCategoryFilter, setKasCategoryFilter] = useState<string>('all');
  const [kasSearch, setKasSearch] = useState('');

  // Modal Catat Transaksi Baru
  const [isKasModalOpen, setIsKasModalOpen] = useState(false);
  const [kasForm, setKasForm] = useState({
    type: 'pemasukan' as 'pemasukan' | 'pengeluaran',
    category: 'dana_sekolah' as CashTransaction['category'],
    amountFormatted: '100.000',
    amount: 100000,
    transactionDate: new Date().toISOString().split('T')[0],
    description: '',
    proofUrl: '',
  });

  // Modal Pratinjau Bukti Struk
  const [previewProofUrl, setPreviewProofUrl] = useState<string | null>(null);

  // Quick Amount chips
  const quickAmounts = [10000, 50000, 100000, 500000, 1000000, 2500000];

  const handleKasAmountChange = (val: string) => {
    const raw = parseFormattedNumber(val);
    setKasForm((prev) => ({
      ...prev,
      amount: raw,
      amountFormatted: raw === 0 ? '' : formatNumber(raw),
    }));
  };

  const handleSelectQuickAmount = (amt: number) => {
    setKasForm((prev) => ({
      ...prev,
      amount: amt,
      amountFormatted: formatNumber(amt),
    }));
  };

  const handleSaveKas = (e: React.FormEvent) => {
    e.preventDefault();
    if (!kasForm.description.trim()) {
      showToast('Keterangan transaksi wajib diisi!', 'error');
      return;
    }
    if (kasForm.amount <= 0) {
      showToast('Nominal transaksi harus lebih dari 0!', 'error');
      return;
    }

    addCashTransaction({
      type: kasForm.type,
      category: kasForm.category,
      amount: kasForm.amount,
      transactionDate: kasForm.transactionDate,
      description: kasForm.description,
      proofUrl: kasForm.proofUrl || undefined,
      recordedBy: currentUser.fullName,
    });

    setIsKasModalOpen(false);
    setKasForm({
      type: 'pemasukan',
      category: 'dana_sekolah',
      amountFormatted: '100.000',
      amount: 100000,
      transactionDate: new Date().toISOString().split('T')[0],
      description: '',
      proofUrl: '',
    });
  };

  // Calculations for Buku Kas
  const totalIncome = cashTransactions
    .filter((t) => t.type === 'pemasukan')
    .reduce((sum, t) => sum + t.amount, 0);

  const totalExpense = cashTransactions
    .filter((t) => t.type === 'pengeluaran')
    .reduce((sum, t) => sum + t.amount, 0);

  const currentBalance = totalIncome - totalExpense;

  const duesIncomeTotal = cashTransactions
    .filter((t) => t.type === 'pemasukan' && t.category === 'iuran_kas')
    .reduce((sum, t) => sum + t.amount, 0);

  const filteredTransactions = cashTransactions.filter((trx) => {
    const matchType = kasFilterType === 'semua' || trx.type === kasFilterType;
    const matchCat = kasCategoryFilter === 'all' || trx.category === kasCategoryFilter;
    const matchSearch =
      trx.description.toLowerCase().includes(kasSearch.toLowerCase()) ||
      trx.recordedBy.toLowerCase().includes(kasSearch.toLowerCase()) ||
      formatNumber(trx.amount).includes(kasSearch);
    return matchType && matchCat && matchSearch;
  });

  // ----------------------------------------------------
  // Iuran Siswa States & Handlers
  // ----------------------------------------------------
  const [dueSearch, setDueSearch] = useState('');
  const [dueStatusFilter, setDueStatusFilter] = useState<'semua' | 'belum_lunas' | 'menunggu_verifikasi' | 'lunas'>('semua');
  const [selectedDueForPayment, setSelectedDueForPayment] = useState<MemberDue | null>(null);
  const [transferProofUrl, setTransferProofUrl] = useState('');

  const filteredDues = memberDues.filter((due) => {
    const matchStatus = dueStatusFilter === 'semua' || due.status === dueStatusFilter;
    const matchSearch =
      due.memberName.toLowerCase().includes(dueSearch.toLowerCase()) ||
      due.nisn.includes(dueSearch);
    return matchStatus && matchSearch;
  });

  const duesSummary = {
    total: memberDues.length,
    lunas: memberDues.filter((d) => d.status === 'lunas').length,
    menunggu: memberDues.filter((d) => d.status === 'menunggu_verifikasi').length,
    belum: memberDues.filter((d) => d.status === 'belum_lunas').length,
    targetNominal: memberDues.reduce((sum, d) => sum + d.amount, 0),
    terkumpulNominal: memberDues.filter((d) => d.status === 'lunas').reduce((sum, d) => sum + d.amount, 0),
  };

  const handleVerifyDue = (dueId: string) => {
    updateMemberDueStatus(dueId, 'lunas', currentUser.fullName);
    confetti({ particleCount: 50, spread: 60, origin: { y: 0.7 } });
  };

  const handleSubmitDueProof = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDueForPayment) return;
    if (!transferProofUrl) {
      showToast('Pilih foto bukti transfer terlebih dahulu!', 'error');
      return;
    }
    uploadMemberDueProof(selectedDueForPayment.id, transferProofUrl);
    setSelectedDueForPayment(null);
    setTransferProofUrl('');
  };

  // Helper for category label
  const getCategoryLabel = (category: string) => {
    const map: Record<string, string> = {
      iuran_kas: 'Iuran Kas',
      dana_sekolah: 'Dana Sekolah (BOS)',
      sponsor: 'Sponsorship / DUDI',
      logistik: 'Logistik & Perlengkapan',
      konsumsi: 'Konsumsi Rapat/Acara',
      atk: 'ATK & Kesekretariatan',
      kegiatan: 'Operasional Proker',
      lainnya: 'Lain-lain',
    };
    return map[category] || category;
  };

  // Export Kas to CSV
  const exportKasCSV = () => {
    if (cashTransactions.length === 0) {
      showToast('Belum ada transaksi kas untuk diekspor!', 'error');
      return;
    }
    const headers = ['No', 'Tanggal', 'Tipe', 'Kategori', 'Uraian Keterangan', 'Nominal (Rp)', 'Dicatat Oleh'];
    const rows = cashTransactions.map((t, idx) => [
      idx + 1,
      t.transactionDate,
      t.type.toUpperCase(),
      `"${getCategoryLabel(t.category)}"`,
      `"${t.description.replace(/"/g, '""')}"`,
      t.amount,
      `"${t.recordedBy}"`,
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Buku_Kas_OSIS_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('File CSV Buku Kas berhasil diunduh!');
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200/80 shadow-2xs">
        <div>
          <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-md bg-indigo-50 text-indigo-700 text-xs font-semibold mb-1">
            <Building2 className="w-3.5 h-3.5" />
            <span>Tata Kelola Transparan • {orgProfile.name}</span>
          </div>
          <h2 className="text-xl font-black text-slate-900 tracking-tight">Kas & Keuangan Terpadu</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Sirkulasi kas umum, status pembayaran iuran wajib siswa SMK, dan cetak pembukuan resmi.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {activeTab === 'laporan_cetak' ? (
            <button
              onClick={() => window.print()}
              className="px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl transition-all shadow-sm flex items-center gap-2 cursor-pointer"
            >
              <Printer className="w-4 h-4" />
              Cetak / PDF
            </button>
          ) : (
            <>
              <button
                onClick={exportKasCSV}
                className="px-3.5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition-colors flex items-center gap-1.5 cursor-pointer"
                title="Unduh Data CSV Buku Kas"
              >
                <Download className="w-4 h-4" />
                <span className="hidden sm:inline">Ekspor CSV</span>
              </button>
              <button
                onClick={() => setIsKasModalOpen(true)}
                className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-xl transition-all shadow-sm flex items-center gap-2 cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                Catat Transaksi Kas
              </button>
            </>
          )}
        </div>
      </div>

      {/* Tabs Switcher */}
      <div className="flex border-b border-slate-200 bg-white px-3 pt-2 rounded-t-2xl">
        <button
          onClick={() => setActiveTab('buku_kas')}
          className={`px-4 py-3 text-xs sm:text-sm font-bold flex items-center gap-2 border-b-2 transition-all cursor-pointer ${
            activeTab === 'buku_kas'
              ? 'border-indigo-600 text-indigo-600'
              : 'border-transparent text-slate-500 hover:text-slate-900'
          }`}
        >
          <Wallet className="w-4 h-4" />
          <span>Buku Kas Umum</span>
          <span className="px-1.5 py-0.2 bg-slate-100 text-slate-600 text-[10px] rounded-full font-bold">
            {cashTransactions.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('iuran_siswa')}
          className={`px-4 py-3 text-xs sm:text-sm font-bold flex items-center gap-2 border-b-2 transition-all cursor-pointer ${
            activeTab === 'iuran_siswa'
              ? 'border-indigo-600 text-indigo-600'
              : 'border-transparent text-slate-500 hover:text-slate-900'
          }`}
        >
          <Receipt className="w-4 h-4" />
          <span>Iuran Kas Siswa</span>
          {duesSummary.menunggu > 0 && (
            <span className="px-1.5 py-0.2 bg-amber-500 text-white text-[10px] rounded-full font-bold">
              {duesSummary.menunggu} Perlu Verifikasi
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab('laporan_cetak')}
          className={`px-4 py-3 text-xs sm:text-sm font-bold flex items-center gap-2 border-b-2 transition-all cursor-pointer ${
            activeTab === 'laporan_cetak'
              ? 'border-indigo-600 text-indigo-600'
              : 'border-transparent text-slate-500 hover:text-slate-900'
          }`}
        >
          <FileText className="w-4 h-4" />
          <span>Laporan & Cetak PDF</span>
        </button>
      </div>

      {/* ---------------------------------------------------- */}
      {/* TAB 1: BUKU KAS UMUM                                 */}
      {/* ---------------------------------------------------- */}
      {activeTab === 'buku_kas' && (
        <div className="space-y-6">
          {/* Summary Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Card Saldo */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-2xs">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Saldo Kas Bersih</span>
                <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                  <Wallet className="w-5 h-5" />
                </div>
              </div>
              <div className="mt-3">
                <span className="text-2xl font-black text-slate-900">{formatRupiah(currentBalance)}</span>
              </div>
              <p className="text-[11px] text-slate-400 mt-1">Saldo riil di kas bendahara OSIS</p>
            </div>

            {/* Card Pemasukan */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-2xs">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Total Pemasukan</span>
                <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                  <ArrowDownLeft className="w-5 h-5" />
                </div>
              </div>
              <div className="mt-3">
                <span className="text-2xl font-black text-emerald-600">{formatRupiah(totalIncome)}</span>
              </div>
              <p className="text-[11px] text-slate-400 mt-1">Dana sekolah + iuran + sponsor</p>
            </div>

            {/* Card Pengeluaran */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-2xs">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Total Pengeluaran</span>
                <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center">
                  <ArrowUpRight className="w-5 h-5" />
                </div>
              </div>
              <div className="mt-3">
                <span className="text-2xl font-black text-rose-600">{formatRupiah(totalExpense)}</span>
              </div>
              <p className="text-[11px] text-slate-400 mt-1">ATK, logistik, konsumsi & kegiatan</p>
            </div>

            {/* Card Iuran Kas Siswa */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-2xs">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Iuran Kas Siswa</span>
                <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
                  <Receipt className="w-5 h-5" />
                </div>
              </div>
              <div className="mt-3">
                <span className="text-2xl font-black text-slate-900">{formatRupiah(duesIncomeTotal)}</span>
              </div>
              <p className="text-[11px] text-amber-600 mt-1 font-semibold">Tersinkron otomatis ke buku kas</p>
            </div>
          </div>

          {/* Filter Bar */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-bold text-slate-500 mr-1 flex items-center gap-1">
                <Filter className="w-3.5 h-3.5" />
                Tipe:
              </span>
              {(['semua', 'pemasukan', 'pengeluaran'] as const).map((type) => (
                <button
                  key={type}
                  onClick={() => setKasFilterType(type)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold capitalize transition-all cursor-pointer ${
                    kasFilterType === type
                      ? 'bg-slate-900 text-white shadow-xs'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {type}
                </button>
              ))}

              <div className="h-4 w-[1px] bg-slate-200 mx-1 hidden sm:block" />

              <select
                value={kasCategoryFilter}
                onChange={(e) => setKasCategoryFilter(e.target.value)}
                className="px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold text-slate-700 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              >
                <option value="all">Semua Kategori</option>
                <option value="dana_sekolah">Dana Sekolah (BOS)</option>
                <option value="iuran_kas">Iuran Kas Siswa</option>
                <option value="sponsor">Sponsor</option>
                <option value="logistik">Logistik</option>
                <option value="konsumsi">Konsumsi</option>
                <option value="atk">ATK</option>
                <option value="kegiatan">Kegiatan</option>
                <option value="lainnya">Lainnya</option>
              </select>
            </div>

            <div className="relative w-full md:w-64">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={kasSearch}
                onChange={(e) => setKasSearch(e.target.value)}
                placeholder="Cari transaksi / nominal..."
                className="w-full pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-900"
              />
            </div>
          </div>

          {/* Transactions Table */}
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-2xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200/80 text-slate-600 font-bold uppercase tracking-wider text-[11px]">
                    <th className="py-3.5 px-4">Tanggal</th>
                    <th className="py-3.5 px-4">Kategori & Keterangan</th>
                    <th className="py-3.5 px-4">Dicatat Oleh</th>
                    <th className="py-3.5 px-4 text-right">Nominal</th>
                    <th className="py-3.5 px-4 text-center">Struk / Bukti</th>
                    <th className="py-3.5 px-4 text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredTransactions.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-12 text-center text-slate-400 font-medium">
                        Tidak ada transaksi yang sesuai dengan filter.
                      </td>
                    </tr>
                  ) : (
                    filteredTransactions.map((trx) => (
                      <tr key={trx.id} className="hover:bg-slate-50/60 transition-colors">
                        <td className="py-3.5 px-4 whitespace-nowrap text-slate-500 font-medium">
                          {formatDateIndo(trx.transactionDate)}
                        </td>
                        <td className="py-3.5 px-4">
                          <div className="flex flex-col gap-0.5">
                            <span className="font-bold text-slate-900">{trx.description}</span>
                            <div className="flex items-center gap-1.5">
                              <span className="inline-block px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-600">
                                {getCategoryLabel(trx.category)}
                              </span>
                              {trx.referenceId && (
                                <span className="inline-block px-1.5 py-0.5 rounded text-[9px] font-bold bg-indigo-50 text-indigo-600">
                                  Auto Iuran
                                </span>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="py-3.5 px-4 whitespace-nowrap text-slate-600 font-medium">
                          {trx.recordedBy}
                        </td>
                        <td className="py-3.5 px-4 whitespace-nowrap text-right">
                          <span
                            className={`font-black text-sm ${
                              trx.type === 'pemasukan' ? 'text-emerald-600' : 'text-rose-600'
                            }`}
                          >
                            {trx.type === 'pemasukan' ? '+ ' : '- '}
                            {formatRupiah(trx.amount)}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 whitespace-nowrap text-center">
                          {trx.proofUrl ? (
                            <button
                              onClick={() => setPreviewProofUrl(trx.proofUrl!)}
                              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-indigo-50 text-indigo-700 hover:bg-indigo-100 text-[11px] font-bold transition-colors cursor-pointer"
                            >
                              <Eye className="w-3.5 h-3.5" />
                              Lihat
                            </button>
                          ) : (
                            <span className="text-[11px] text-slate-300">-</span>
                          )}
                        </td>
                        <td className="py-3.5 px-4 whitespace-nowrap text-right">
                          {(currentRole === 'bendahara' || currentRole === 'admin' || currentRole === 'ketua') && (
                            <button
                              onClick={() => {
                                if (confirm(`Hapus catatan transaksi "${trx.description}"?`)) {
                                  deleteCashTransaction(trx.id);
                                }
                              }}
                              className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition-colors cursor-pointer"
                              title="Hapus Transaksi"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ---------------------------------------------------- */}
      {/* TAB 2: IURAN KAS SISWA                               */}
      {/* ---------------------------------------------------- */}
      {activeTab === 'iuran_siswa' && (
        <div className="space-y-6">
          {/* Dues Summary Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-2xs">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Target Kas Bulanan</span>
              <div className="mt-2 text-2xl font-black text-slate-900">{formatRupiah(duesSummary.targetNominal)}</div>
              <p className="text-[11px] text-slate-400 mt-1">{duesSummary.total} Anggota x Rp 15.000 / bln</p>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-2xs">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Terkumpul (Lunas)</span>
              <div className="mt-2 text-2xl font-black text-emerald-600">
                {formatRupiah(duesSummary.terkumpulNominal)}
              </div>
              <p className="text-[11px] text-emerald-600 mt-1 font-semibold">{duesSummary.lunas} siswa sudah bayar</p>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-2xs">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Menunggu Verifikasi</span>
              <div className="mt-2 text-2xl font-black text-amber-500">{duesSummary.menunggu} Siswa</div>
              <p className="text-[11px] text-slate-400 mt-1">Sudah kirim bukti transfer</p>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-2xs">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Belum Membayar</span>
              <div className="mt-2 text-2xl font-black text-rose-500">{duesSummary.belum} Siswa</div>
              <p className="text-[11px] text-slate-400 mt-1">Perlu diingatkan sekretaris/bendahara</p>
            </div>
          </div>

          {/* Filter Bar */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-bold text-slate-500 mr-1 flex items-center gap-1">
                <Filter className="w-3.5 h-3.5" />
                Status:
              </span>
              {(['semua', 'menunggu_verifikasi', 'belum_lunas', 'lunas'] as const).map((st) => (
                <button
                  key={st}
                  onClick={() => setDueStatusFilter(st)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold capitalize transition-all cursor-pointer ${
                    dueStatusFilter === st
                      ? 'bg-slate-900 text-white shadow-xs'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {st.replace('_', ' ')}
                  {st === 'menunggu_verifikasi' && duesSummary.menunggu > 0 && (
                    <span className="ml-1.5 px-1.5 py-0.2 bg-amber-400 text-amber-950 text-[10px] rounded-full font-black">
                      {duesSummary.menunggu}
                    </span>
                  )}
                </button>
              ))}
            </div>

            <div className="relative w-full md:w-64">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={dueSearch}
                onChange={(e) => setDueSearch(e.target.value)}
                placeholder="Cari nama siswa / NISN..."
                className="w-full pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-900"
              />
            </div>
          </div>

          {/* Dues Table */}
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-2xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200/80 text-slate-600 font-bold uppercase tracking-wider text-[11px]">
                    <th className="py-3.5 px-4">Nama Siswa</th>
                    <th className="py-3.5 px-4">Periode</th>
                    <th className="py-3.5 px-4 text-right">Nominal Tagihan</th>
                    <th className="py-3.5 px-4 text-center">Status Pembayaran</th>
                    <th className="py-3.5 px-4 text-center">Bukti Transfer</th>
                    <th className="py-3.5 px-4 text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredDues.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-12 text-center text-slate-400 font-medium">
                        Tidak ada catatan tagihan kas.
                      </td>
                    </tr>
                  ) : (
                    filteredDues.map((due) => {
                      const memberDetail = members.find((m) => m.id === due.memberId);
                      return (
                        <tr key={due.id} className="hover:bg-slate-50/60 transition-colors">
                          <td className="py-3.5 px-4">
                            <div className="flex items-center gap-3">
                              <img
                                src={
                                  memberDetail?.avatarUrl ||
                                  'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&auto=format&fit=crop&q=80'
                                }
                                alt={due.memberName}
                                className="w-8 h-8 rounded-full object-cover border border-slate-200"
                              />
                              <div>
                                <span className="font-bold text-slate-900 block">{due.memberName}</span>
                                <span className="text-[10px] text-slate-400">
                                  NISN: {due.nisn} {memberDetail ? `• ${memberDetail.classRoom} (${memberDetail.major})` : ''}
                                </span>
                              </div>
                            </div>
                          </td>
                          <td className="py-3.5 px-4 whitespace-nowrap text-slate-600 font-medium">
                            September {due.periodYear}
                          </td>
                          <td className="py-3.5 px-4 whitespace-nowrap text-right font-black text-slate-900">
                            {formatRupiah(due.amount)}
                          </td>
                          <td className="py-3.5 px-4 whitespace-nowrap text-center">
                            {due.status === 'lunas' && (
                              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                                <CheckCircle2 className="w-3.5 h-3.5" />
                                Lunas ({due.paidAt ? formatDateIndo(due.paidAt) : 'Terverifikasi'})
                              </span>
                            )}
                            {due.status === 'menunggu_verifikasi' && (
                              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
                                <Clock className="w-3.5 h-3.5" />
                                Menunggu Verifikasi
                              </span>
                            )}
                            {due.status === 'belum_lunas' && (
                              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-rose-50 text-rose-700 border border-rose-200">
                                <AlertCircle className="w-3.5 h-3.5" />
                                Belum Bayar
                              </span>
                            )}
                          </td>
                          <td className="py-3.5 px-4 whitespace-nowrap text-center">
                            {due.proofUrl ? (
                              <button
                                onClick={() => setPreviewProofUrl(due.proofUrl!)}
                                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-indigo-50 text-indigo-700 hover:bg-indigo-100 text-[11px] font-bold transition-colors cursor-pointer"
                              >
                                <Eye className="w-3.5 h-3.5" />
                                Bukti Transfer
                              </button>
                            ) : (
                              <span className="text-slate-300 text-[11px]">Belum ada</span>
                            )}
                          </td>
                          <td className="py-3.5 px-4 whitespace-nowrap text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              {due.status === 'menunggu_verifikasi' && (
                                <button
                                  onClick={() => handleVerifyDue(due.id)}
                                  className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg font-bold text-xs flex items-center gap-1 shadow-2xs transition-all cursor-pointer"
                                  title="Verifikasi dan otomatis catat ke buku kas"
                                >
                                  <Check className="w-3.5 h-3.5" />
                                  Verifikasi
                                </button>
                              )}

                              {due.status === 'belum_lunas' && (
                                <button
                                  onClick={() => {
                                    setSelectedDueForPayment(due);
                                    setTransferProofUrl('');
                                  }}
                                  className="px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-lg font-bold text-xs transition-colors cursor-pointer"
                                >
                                  Bayar / Upload
                                </button>
                              )}

                              {due.status === 'lunas' && (
                                <span className="text-[11px] text-slate-400 font-medium">
                                  {due.verifiedBy ? `Oleh: ${due.verifiedBy.split(' ')[0]}` : 'Otomatis'}
                                </span>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ---------------------------------------------------- */}
      {/* TAB 3: LAPORAN & CETAK PDF                           */}
      {/* ---------------------------------------------------- */}
      {activeTab === 'laporan_cetak' && (
        <div className="space-y-6">
          <div className="bg-white p-8 sm:p-12 rounded-2xl border border-slate-200/80 shadow-sm max-w-4xl mx-auto print:p-0 print:border-none print:shadow-none">
            {/* Header Surat Kop Sekolah */}
            <div className="flex items-center gap-5 border-b-2 border-slate-900 pb-5 mb-6">
              <img
                src={orgProfile.logoUrl}
                alt="Logo Sekolah"
                className="w-20 h-20 rounded-xl object-cover shrink-0"
              />
              <div className="flex-1 text-center pr-12">
                <h3 className="text-base font-extrabold text-slate-900 uppercase tracking-wider">
                  PEMERINTAH DAERAH PROVINSI DKI JAKARTA
                </h3>
                <h2 className="text-lg sm:text-xl font-black text-slate-900 uppercase tracking-tight">
                  {orgProfile.schoolName}
                </h2>
                <h4 className="text-sm font-bold text-indigo-700 uppercase tracking-wider">
                  ORGANISASI SISWA INTRA SEKOLAH (OSIS)
                </h4>
                <p className="text-[11px] text-slate-500 mt-1">
                  {orgProfile.address} • Email: {orgProfile.email} • Telp: {orgProfile.phone}
                </p>
              </div>
            </div>

            {/* Document Title */}
            <div className="text-center mb-8">
              <h1 className="text-base sm:text-lg font-black text-slate-900 uppercase tracking-wide underline underline-offset-4">
                LAPORAN PERTANGGUNGJAWABAN ARUS KAS KEUANGAN
              </h1>
              <p className="text-xs text-slate-600 mt-1">
                Tahun Ajaran {orgProfile.academicYear} • Periode s/d {formatDateIndo(new Date().toISOString())}
              </p>
            </div>

            {/* Neraca Saldo Summary Table */}
            <div className="mb-6">
              <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                I. Ringkasan Posisi Kas
              </h4>
              <div className="grid grid-cols-3 border border-slate-300 rounded-lg overflow-hidden text-center text-xs divide-x divide-slate-300">
                <div className="p-3 bg-emerald-50">
                  <span className="block text-slate-500 text-[10px] font-bold uppercase">Total Penerimaan</span>
                  <span className="text-base font-black text-emerald-700 mt-0.5 block">
                    {formatRupiah(totalIncome)}
                  </span>
                </div>
                <div className="p-3 bg-rose-50">
                  <span className="block text-slate-500 text-[10px] font-bold uppercase">Total Pengeluaran</span>
                  <span className="text-base font-black text-rose-700 mt-0.5 block">
                    {formatRupiah(totalExpense)}
                  </span>
                </div>
                <div className="p-3 bg-indigo-50">
                  <span className="block text-slate-500 text-[10px] font-bold uppercase">Saldo Akhir di Kas</span>
                  <span className="text-base font-black text-indigo-900 mt-0.5 block">
                    {formatRupiah(currentBalance)}
                  </span>
                </div>
              </div>
            </div>

            {/* Detailed Ledger Table */}
            <div className="mb-8">
              <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                II. Rincian Buku Kas Umum
              </h4>
              <table className="w-full text-left text-xs border border-slate-300 divide-y divide-slate-200">
                <thead className="bg-slate-100 font-bold text-slate-700 uppercase text-[10px]">
                  <tr>
                    <th className="p-2 border-r border-slate-300 w-10 text-center">No</th>
                    <th className="p-2 border-r border-slate-300 w-28">Tanggal</th>
                    <th className="p-2 border-r border-slate-300">Uraian / Keterangan</th>
                    <th className="p-2 border-r border-slate-300 w-24">Kategori</th>
                    <th className="p-2 border-r border-slate-300 text-right w-28">Masuk (Debet)</th>
                    <th className="p-2 text-right w-28">Keluar (Kredit)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {cashTransactions.map((trx, idx) => (
                    <tr key={trx.id} className="text-[11px]">
                      <td className="p-2 border-r border-slate-300 text-center">{idx + 1}</td>
                      <td className="p-2 border-r border-slate-300 text-slate-600">
                        {formatDateIndo(trx.transactionDate)}
                      </td>
                      <td className="p-2 border-r border-slate-300 font-medium text-slate-900">
                        {trx.description}
                      </td>
                      <td className="p-2 border-r border-slate-300 text-slate-600">
                        {getCategoryLabel(trx.category)}
                      </td>
                      <td className="p-2 border-r border-slate-300 text-right font-semibold text-emerald-700">
                        {trx.type === 'pemasukan' ? formatNumber(trx.amount) : '-'}
                      </td>
                      <td className="p-2 text-right font-semibold text-rose-700">
                        {trx.type === 'pengeluaran' ? formatNumber(trx.amount) : '-'}
                      </td>
                    </tr>
                  ))}
                  <tr className="bg-slate-50 font-bold text-xs border-t-2 border-slate-400">
                    <td colSpan={4} className="p-2 border-r border-slate-300 text-right uppercase">
                      Total Akumulasi
                    </td>
                    <td className="p-2 border-r border-slate-300 text-right text-emerald-700 font-black">
                      {formatNumber(totalIncome)}
                    </td>
                    <td className="p-2 text-right text-rose-700 font-black">
                      {formatNumber(totalExpense)}
                    </td>
                  </tr>
                  <tr className="bg-indigo-50 font-extrabold text-xs">
                    <td colSpan={4} className="p-2 border-r border-slate-300 text-right uppercase text-indigo-900">
                      Sisa Saldo Kas Bersih
                    </td>
                    <td colSpan={2} className="p-2 text-right text-indigo-950 text-sm font-black">
                      {formatRupiah(currentBalance)}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Signature Block */}
            <div className="mt-12 pt-4 grid grid-cols-3 gap-6 text-center text-xs text-slate-800">
              <div>
                <p className="text-slate-500 mb-14">
                  Mengetahui,
                  <br />
                  <strong>Ketua Umum OSIS</strong>
                </p>
                <p className="font-black underline">{orgProfile.ketuaName}</p>
                <p className="text-[10px] text-slate-500">NISN. 0071234501</p>
              </div>

              <div>
                <p className="text-slate-500 mb-14">
                  Diverifikasi oleh,
                  <br />
                  <strong>Pembina OSIS</strong>
                </p>
                <p className="font-black underline">{orgProfile.pembinaName}</p>
                <p className="text-[10px] text-slate-500">NIP. 19780512 200501 1 004</p>
              </div>

              <div>
                <p className="text-slate-500 mb-14">
                  Jakarta, {formatDateIndo(new Date().toISOString())}
                  <br />
                  <strong>Bendahara Umum OSIS</strong>
                </p>
                <p className="font-black underline">Rizky Alamsyah</p>
                <p className="text-[10px] text-slate-500">NISN. 0071234503</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ---------------------------------------------------- */}
      {/* MODAL 1: CATAT TRANSAKSI KAS BARU                    */}
      {/* ---------------------------------------------------- */}
      <Modal
        isOpen={isKasModalOpen}
        onClose={() => setIsKasModalOpen(false)}
        title="Catat Transaksi Kas Baru"
      >
        <form onSubmit={handleSaveKas} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase mb-1.5">Tipe Transaksi</label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() =>
                  setKasForm((prev) => ({
                    ...prev,
                    type: 'pemasukan',
                    category: 'dana_sekolah',
                  }))
                }
                className={`py-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-2 border transition-all cursor-pointer ${
                  kasForm.type === 'pemasukan'
                    ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm'
                    : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                }`}
              >
                <ArrowDownLeft className="w-4 h-4" />
                Pemasukan (Debet)
              </button>
              <button
                type="button"
                onClick={() =>
                  setKasForm((prev) => ({
                    ...prev,
                    type: 'pengeluaran',
                    category: 'atk',
                  }))
                }
                className={`py-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-2 border transition-all cursor-pointer ${
                  kasForm.type === 'pengeluaran'
                    ? 'bg-rose-600 text-white border-rose-600 shadow-sm'
                    : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                }`}
              >
                <ArrowUpRight className="w-4 h-4" />
                Pengeluaran (Kredit)
              </button>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Kategori</label>
            <select
              value={kasForm.category}
              onChange={(e) =>
                setKasForm((prev) => ({
                  ...prev,
                  category: e.target.value as CashTransaction['category'],
                }))
              }
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              {kasForm.type === 'pemasukan' ? (
                <>
                  <option value="dana_sekolah">Dana Alokasi Sekolah (BOS Kesiswaan)</option>
                  <option value="iuran_kas">Iuran Kas Wajib Anggota</option>
                  <option value="sponsor">Sponsorship & Kemitraan Industri</option>
                  <option value="lainnya">Pemasukan Lainnya</option>
                </>
              ) : (
                <>
                  <option value="atk">ATK, Fotokopi & Kesekretariatan</option>
                  <option value="logistik">Logistik, Banner & Perlengkapan</option>
                  <option value="konsumsi">Konsumsi Rapat / Tamu</option>
                  <option value="kegiatan">Operasional Acara & Lomba</option>
                  <option value="lainnya">Pengeluaran Lainnya</option>
                </>
              )}
            </select>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-xs font-bold text-slate-700 uppercase">
                Nominal Transaksi (Rp)
              </label>
              <span className="text-[10px] text-indigo-600 font-bold">
                Pemisah Titik (.) Aktif
              </span>
            </div>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 font-bold text-slate-400 text-xs">
                Rp
              </span>
              <input
                type="text"
                required
                value={kasForm.amountFormatted}
                onChange={(e) => handleKasAmountChange(e.target.value)}
                placeholder="100.000"
                className="w-full pl-10 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-black text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div className="flex flex-wrap gap-1.5 mt-2">
              {quickAmounts.map((amt) => (
                <button
                  key={amt}
                  type="button"
                  onClick={() => handleSelectQuickAmount(amt)}
                  className="px-2 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-[10px] font-bold transition-colors cursor-pointer"
                >
                  +{formatNumber(amt)}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Tanggal</label>
            <input
              type="date"
              required
              value={kasForm.transactionDate}
              onChange={(e) => setKasForm((prev) => ({ ...prev, transactionDate: e.target.value }))}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
              Keterangan / Uraian
            </label>
            <textarea
              required
              rows={2}
              value={kasForm.description}
              onChange={(e) => setKasForm((prev) => ({ ...prev, description: e.target.value }))}
              placeholder="Contoh: Pembelian tinta printer dan kertas HVS untuk proposal"
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
              Foto Bukti Nota / Kwitansi / Struk (Dari Komputer)
            </label>
            <ImagePicker
              value={kasForm.proofUrl}
              onChange={(url) => setKasForm((prev) => ({ ...prev, proofUrl: url }))}
              helperText="Pilih foto struk / nota dari laptop/komputer..."
            />
          </div>

          <div className="pt-2 flex justify-end gap-2 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setIsKasModalOpen(false)}
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-colors cursor-pointer"
            >
              Batal
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold transition-all shadow-sm cursor-pointer"
            >
              Simpan Transaksi
            </button>
          </div>
        </form>
      </Modal>

      {/* MODAL 2: UPLOAD BUKTI TRANSFER IURAN */}
      <Modal
        isOpen={!!selectedDueForPayment}
        onClose={() => setSelectedDueForPayment(null)}
        title="Upload Bukti Pembayaran Iuran Kas"
      >
        {selectedDueForPayment && (
          <form onSubmit={handleSubmitDueProof} className="space-y-4">
            <div className="bg-indigo-50 p-3 rounded-xl border border-indigo-100 text-xs">
              <p className="font-bold text-indigo-900">
                Konfirmasi Pembayaran: {selectedDueForPayment.memberName}
              </p>
              <p className="text-indigo-700 mt-0.5">
                Periode Bulan September {selectedDueForPayment.periodYear} • Nominal:{' '}
                <strong>{formatRupiah(selectedDueForPayment.amount)}</strong>
              </p>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1.5">
                Pilih Bukti Transfer / Bukti Pembayaran (Lokal Komputer)
              </label>
              <ImagePicker
                value={transferProofUrl}
                onChange={setTransferProofUrl}
                helperText="Pilih tangkapan layar m-banking / bukti struk dari file komputer..."
              />
            </div>

            <div className="pt-2 flex justify-end gap-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setSelectedDueForPayment(null)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-colors cursor-pointer"
              >
                Batal
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold transition-all shadow-sm cursor-pointer"
              >
                Kirim Bukti Pembayaran
              </button>
            </div>
          </form>
        )}
      </Modal>

      {/* MODAL 3: PREVIEW BUKTI GAMBAR/STRUK */}
      <Modal
        isOpen={!!previewProofUrl}
        onClose={() => setPreviewProofUrl(null)}
        title="Pratinjau Bukti Transaksi"
      >
        <div className="flex flex-col items-center justify-center p-2">
          {previewProofUrl && (
            <img
              src={previewProofUrl}
              alt="Bukti Transaksi"
              className="max-h-[60vh] max-w-full rounded-xl object-contain border border-slate-200 shadow-sm"
            />
          )}
          <div className="mt-4 flex justify-end w-full">
            <button
              onClick={() => setPreviewProofUrl(null)}
              className="px-4 py-2 bg-slate-900 text-white rounded-xl text-xs font-bold hover:bg-slate-800 transition-colors cursor-pointer"
            >
              Tutup
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

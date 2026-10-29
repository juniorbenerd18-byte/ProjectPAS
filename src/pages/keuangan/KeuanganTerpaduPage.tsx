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

  // Delete transaction confirm
  const [trxToDelete, setTrxToDelete] = useState<CashTransaction | null>(null);

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
      <div className="simo-card p-6 sm:p-7 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-5">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-[8px] bg-[#E4EAF2] dark:bg-[#1F3A5F]/40 text-[#1F3A5F] dark:text-[#E4EAF2] text-[14px] font-bold mb-2">
            <Building2 className="w-4 h-4" />
            <span>Tata Kelola Transparan • {orgProfile.name}</span>
          </div>
          <h2 className="text-2xl font-extrabold text-[#1F3A5F] dark:text-[#FAF6EE] tracking-tight">
            Kas &amp; Keuangan Terpadu
          </h2>
          <p className="text-[15px] text-[#5A6472] dark:text-[#9AA8B8] mt-1">
            Sirkulasi kas umum, status pembayaran iuran wajib siswa SMK, dan cetak pembukuan resmi.
          </p>
        </div>

        <div className="flex items-center gap-3 self-start sm:self-auto shrink-0 flex-wrap">
          {activeTab === 'laporan_cetak' ? (
            <button
              onClick={() => window.print()}
              className="simo-btn-primary min-h-[44px] px-5 py-2.5 rounded-[12px] flex items-center gap-2 cursor-pointer"
            >
              <Printer className="w-4 h-4" />
              <span>Cetak / PDF</span>
            </button>
          ) : (
            <>
              <button
                onClick={exportKasCSV}
                className="simo-btn-outline min-h-[44px] px-4 py-2.5 rounded-[12px] text-[14px] flex items-center gap-2 cursor-pointer"
                title="Unduh Data CSV Buku Kas"
              >
                <Download className="w-4 h-4" />
                <span className="hidden sm:inline">Ekspor CSV</span>
              </button>
              <button
                onClick={() => setIsKasModalOpen(true)}
                className="simo-btn-primary min-h-[44px] px-5 py-2.5 rounded-[12px] flex items-center gap-2 cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Catat Transaksi Kas</span>
              </button>
            </>
          )}
        </div>
      </div>

      {/* Tabs Switcher */}
      <div className="flex border-b border-[#E6DFD0] dark:border-[#283D56] bg-[#FFFDF8] dark:bg-[#17293E] px-4 pt-2 rounded-t-[20px] gap-2 overflow-x-auto">
        <button
          onClick={() => setActiveTab('buku_kas')}
          className={`min-h-[44px] px-4 py-2 text-[14px] sm:text-[15px] font-bold flex items-center gap-2 border-b-2 transition-all cursor-pointer whitespace-nowrap ${
            activeTab === 'buku_kas'
              ? 'border-[#1F3A5F] text-[#1F3A5F] dark:border-[#F2B544] dark:text-[#FAF6EE]'
              : 'border-transparent text-[#5A6472] hover:text-[#1F3A5F] dark:text-[#9AA8B8] dark:hover:text-[#FAF6EE]'
          }`}
        >
          <Wallet className="w-4 h-4" />
          <span>Buku Kas Umum</span>
          <span className="px-2 py-0.5 bg-[#E4EAF2] text-[#1F3A5F] dark:bg-[#1F3A5F]/40 dark:text-[#FAF6EE] text-[12px] rounded-full font-bold">
            {cashTransactions.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('iuran_siswa')}
          className={`min-h-[44px] px-4 py-2 text-[14px] sm:text-[15px] font-bold flex items-center gap-2 border-b-2 transition-all cursor-pointer whitespace-nowrap ${
            activeTab === 'iuran_siswa'
              ? 'border-[#1F3A5F] text-[#1F3A5F] dark:border-[#F2B544] dark:text-[#FAF6EE]'
              : 'border-transparent text-[#5A6472] hover:text-[#1F3A5F] dark:text-[#9AA8B8] dark:hover:text-[#FAF6EE]'
          }`}
        >
          <Receipt className="w-4 h-4" />
          <span>Iuran Kas Siswa</span>
          {duesSummary.menunggu > 0 && (
            <span className="px-2 py-0.5 bg-[#F2B544] text-[#1F3A5F] text-[12px] rounded-full font-extrabold">
              {duesSummary.menunggu} Verifikasi
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab('laporan_cetak')}
          className={`min-h-[44px] px-4 py-2 text-[14px] sm:text-[15px] font-bold flex items-center gap-2 border-b-2 transition-all cursor-pointer whitespace-nowrap ${
            activeTab === 'laporan_cetak'
              ? 'border-[#1F3A5F] text-[#1F3A5F] dark:border-[#F2B544] dark:text-[#FAF6EE]'
              : 'border-transparent text-[#5A6472] hover:text-[#1F3A5F] dark:text-[#9AA8B8] dark:hover:text-[#FAF6EE]'
          }`}
        >
          <FileText className="w-4 h-4" />
          <span>Laporan &amp; Cetak PDF</span>
        </button>
      </div>

      {/* ---------------------------------------------------- */}
      {/* TAB 1: BUKU KAS UMUM                                 */}
      {/* ---------------------------------------------------- */}
      {activeTab === 'buku_kas' && (
        <div className="space-y-6">
          {/* Summary Cards -> Merged into Single Continuous Card with Dividers */}
          <div className="simo-card p-0 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 divide-y sm:divide-y-0 sm:divide-x divide-[#E6DFD0] dark:divide-[#283D56] overflow-hidden">
            {/* Card Saldo Kas */}
            <div className="p-6 bg-[#FBEBC8] dark:bg-[#F2B544]/20 flex flex-col justify-between">
              <div className="flex items-center justify-between">
                <span className="text-[14px] font-bold text-[#1F3A5F] dark:text-[#FAF6EE]">Saldo Kas Bersih</span>
                <div className="w-9 h-9 rounded-[10px] bg-[#F2B544] text-[#1F3A5F] flex items-center justify-center">
                  <Wallet className="w-5 h-5" />
                </div>
              </div>
              <div className="my-2">
                <span className="text-3xl font-black text-[#1F3A5F] dark:text-[#FAF6EE]">{formatRupiah(currentBalance)}</span>
              </div>
              <p className="text-[13px] text-[#1F3A5F] dark:text-[#FAF6EE]">Saldo riil di kas bendahara OSIS</p>
            </div>

            {/* Card Pemasukan */}
            <div className="p-6 flex flex-col justify-between">
              <div className="flex items-center justify-between">
                <span className="text-[14px] font-bold text-[#1F3A5F] dark:text-[#E4EAF2]">Total Pemasukan</span>
                <div className="w-9 h-9 rounded-[10px] bg-[#E4EAF2] text-[#1F3A5F] dark:bg-[#1F3A5F]/40 dark:text-[#FAF6EE] flex items-center justify-center">
                  <ArrowDownLeft className="w-5 h-5" />
                </div>
              </div>
              <div className="my-2">
                <span className="text-3xl font-black text-[#1F3A5F] dark:text-[#FAF6EE]">{formatRupiah(totalIncome)}</span>
              </div>
              <p className="text-[13px] text-[#5A6472] dark:text-[#9AA8B8]">Dana sekolah + iuran + sponsor</p>
            </div>

            {/* Card Pengeluaran */}
            <div className="p-6 flex flex-col justify-between">
              <div className="flex items-center justify-between">
                <span className="text-[14px] font-bold text-[#1F3A5F] dark:text-[#E4EAF2]">Total Pengeluaran</span>
                <div className="w-9 h-9 rounded-[10px] bg-[#FAF6EE] text-[#1F3A5F] dark:bg-[#17293E] dark:text-[#FAF6EE] flex items-center justify-center border border-[#E6DFD0] dark:border-[#283D56]">
                  <ArrowUpRight className="w-5 h-5" />
                </div>
              </div>
              <div className="my-2">
                <span className="text-3xl font-black text-[#1F3A5F] dark:text-[#FAF6EE]">{formatRupiah(totalExpense)}</span>
              </div>
              <p className="text-[13px] text-[#5A6472] dark:text-[#9AA8B8]">ATK, logistik, konsumsi & kegiatan</p>
            </div>

            {/* Card Iuran Kas Siswa */}
            <div className="p-6 flex flex-col justify-between">
              <div className="flex items-center justify-between">
                <span className="text-[14px] font-bold text-[#1F3A5F] dark:text-[#E4EAF2]">Iuran Kas Siswa</span>
                <div className="w-9 h-9 rounded-[10px] bg-[#E4EAF2] text-[#1F3A5F] dark:bg-[#1F3A5F]/40 dark:text-[#FAF6EE] flex items-center justify-center">
                  <Receipt className="w-5 h-5" />
                </div>
              </div>
              <div className="my-2">
                <span className="text-3xl font-black text-[#1F3A5F] dark:text-[#FAF6EE]">{formatRupiah(duesIncomeTotal)}</span>
              </div>
              <p className="text-[13px] text-[#5A6472] dark:text-[#9AA8B8]">Tersinkron otomatis ke buku kas</p>
            </div>
          </div>

          {/* Filter Bar */}
          <div className="simo-card p-4 sm:p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex flex-wrap items-center gap-2.5">
              <span className="text-[14px] font-bold text-[#5A6472] dark:text-[#9AA8B8] mr-1 flex items-center gap-1.5">
                <Filter className="w-4 h-4" />
                Tipe:
              </span>
              {(['semua', 'pemasukan', 'pengeluaran'] as const).map((type) => (
                <button
                  key={type}
                  onClick={() => setKasFilterType(type)}
                  className={`min-h-[40px] px-3.5 py-1.5 rounded-[10px] text-[14px] font-bold capitalize transition-all cursor-pointer ${
                    kasFilterType === type
                      ? 'simo-chip-active'
                      : 'simo-chip'
                  }`}
                >
                  {type}
                </button>
              ))}

              <div className="h-5 w-[1px] bg-[#E6DFD0] dark:bg-[#283D56] mx-1 hidden sm:block" />

              <select
                value={kasCategoryFilter}
                onChange={(e) => setKasCategoryFilter(e.target.value)}
                className="simo-input min-h-[40px] px-3 text-[14px] font-semibold"
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

            <div className="relative w-full md:w-72">
              <Search className="w-4 h-4 text-[#5A6472] dark:text-[#9AA8B8] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                value={kasSearch}
                onChange={(e) => setKasSearch(e.target.value)}
                placeholder="Cari transaksi / nominal..."
                className="simo-input pl-10 pr-3 min-h-[40px] text-[14px] w-full"
              />
            </div>
          </div>

          {/* Transactions Table Desktop */}
          <div className="simo-card p-0 overflow-hidden hidden md:block">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-[15px]">
                <thead>
                  <tr className="bg-[#FAF6EE] dark:bg-[#17293E] border-b border-[#E6DFD0] dark:border-[#283D56] text-[#1F3A5F] dark:text-[#FAF6EE] font-bold text-[14px]">
                    <th className="py-4 px-5">Tanggal</th>
                    <th className="py-4 px-5">Kategori &amp; Keterangan</th>
                    <th className="py-4 px-5">Dicatat Oleh</th>
                    <th className="py-4 px-5 text-right">Nominal</th>
                    <th className="py-4 px-5 text-center">Struk / Bukti</th>
                    <th className="py-4 px-5 text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E6DFD0] dark:divide-[#283D56]">
                  {filteredTransactions.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-12 text-center text-[#5A6472] dark:text-[#9AA8B8] font-medium text-[15px]">
                        Tidak ada transaksi yang sesuai dengan filter.
                      </td>
                    </tr>
                  ) : (
                    filteredTransactions.map((trx) => (
                      <tr key={trx.id} className="hover:bg-[#FAF6EE]/50 dark:hover:bg-[#17293E]/50 transition-colors">
                        <td className="py-4 px-5 whitespace-nowrap text-[#5A6472] dark:text-[#9AA8B8] font-medium text-[14px]">
                          {formatDateIndo(trx.transactionDate)}
                        </td>
                        <td className="py-4 px-5">
                          <div className="flex flex-col gap-1 items-start">
                            <span className="font-bold text-[#1F3A5F] dark:text-[#FAF6EE] block text-[15px]">
                              {trx.description}
                            </span>
                            <div className="flex items-center gap-2">
                              <span className="inline-block px-2.5 py-0.5 rounded-[6px] text-[12px] font-bold bg-[#FAF6EE] dark:bg-[#17293E] text-[#1F3A5F] dark:text-[#FAF6EE] border border-[#E6DFD0] dark:border-[#283D56]">
                                {getCategoryLabel(trx.category)}
                              </span>
                              {trx.referenceId && (
                                <span className="inline-block px-2 py-0.5 rounded-[6px] text-[12px] font-bold bg-[#E4EAF2] text-[#1F3A5F] dark:bg-[#1F3A5F]/40 dark:text-[#FAF6EE]">
                                  Auto Iuran
                                </span>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="py-4 px-5 whitespace-nowrap text-[#5A6472] dark:text-[#9AA8B8] font-medium text-[14px]">
                          {trx.recordedBy}
                        </td>
                        <td className="py-4 px-5 whitespace-nowrap text-right">
                          <span
                            className={`font-black text-[16px] ${
                              trx.type === 'pemasukan' ? 'text-[#1F3A5F] dark:text-[#FAF6EE]' : 'text-[#5A6472] dark:text-[#F2B544]'
                            }`}
                          >
                            {trx.type === 'pemasukan' ? '+ ' : '- '}
                            {formatRupiah(trx.amount)}
                          </span>
                        </td>
                        <td className="py-4 px-5 whitespace-nowrap text-center">
                          {trx.proofUrl ? (
                            <button
                              onClick={() => setPreviewProofUrl(trx.proofUrl!)}
                              className="simo-btn-outline min-h-[36px] px-3 py-1 rounded-[10px] text-[13px] inline-flex items-center gap-1.5 cursor-pointer"
                            >
                              <Eye className="w-3.5 h-3.5" />
                              <span>Lihat</span>
                            </button>
                          ) : (
                            <span className="text-[13px] text-[#5A6472] dark:text-[#9AA8B8]">-</span>
                          )}
                        </td>
                        <td className="py-4 px-5 whitespace-nowrap text-right">
                          {(currentRole === 'bendahara' || currentRole === 'admin' || currentRole === 'ketua') && (
                            <button
                              onClick={() => setTrxToDelete(trx)}
                              className="min-h-[38px] min-w-[38px] flex items-center justify-center text-[#5A6472] hover:text-[#1F3A5F] dark:text-[#9AA8B8] dark:hover:text-[#FAF6EE] rounded-[10px] border border-transparent hover:border-[#E6DFD0] dark:hover:border-[#283D56] transition-colors cursor-pointer"
                              title="Hapus Transaksi"
                              aria-label={`Hapus transaksi ${trx.description}`}
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

          {/* Mobile Card List for Transactions */}
          <div className="space-y-3.5 md:hidden">
            {filteredTransactions.length === 0 ? (
              <div className="simo-card p-8 text-center text-[#5A6472] dark:text-[#9AA8B8] font-medium text-[15px]">
                Tidak ada transaksi yang sesuai dengan filter.
              </div>
            ) : (
              filteredTransactions.map((trx) => (
                <div key={trx.id} className="simo-card p-5 space-y-3">
                  <div className="flex items-center justify-between gap-2">
                    <span className="px-2.5 py-0.5 rounded-[6px] text-[12px] font-bold bg-[#FAF6EE] dark:bg-[#17293E] text-[#1F3A5F] dark:text-[#FAF6EE] border border-[#E6DFD0] dark:border-[#283D56]">
                      {getCategoryLabel(trx.category)}
                    </span>
                    <span
                      className={`font-black text-[16px] ${
                        trx.type === 'pemasukan' ? 'text-[#1F3A5F] dark:text-[#FAF6EE]' : 'text-[#5A6472] dark:text-[#F2B544]'
                      }`}
                    >
                      {trx.type === 'pemasukan' ? '+ ' : '- '}
                      {formatRupiah(trx.amount)}
                    </span>
                  </div>

                  <h4 className="font-bold text-[16px] text-[#1F3A5F] dark:text-[#FAF6EE]">
                    {trx.description}
                  </h4>

                  <div className="text-[14px] text-[#5A6472] dark:text-[#9AA8B8] space-y-1 pt-2 border-t border-[#E6DFD0] dark:border-[#283D56]">
                    <p><span className="font-semibold text-[#1F3A5F] dark:text-[#FAF6EE]">Tanggal:</span> {formatDateIndo(trx.transactionDate)}</p>
                    <p><span className="font-semibold text-[#1F3A5F] dark:text-[#FAF6EE]">Dicatat:</span> {trx.recordedBy}</p>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-[#E6DFD0] dark:border-[#283D56]">
                    {trx.proofUrl ? (
                      <button
                        onClick={() => setPreviewProofUrl(trx.proofUrl!)}
                        className="simo-btn-outline min-h-[44px] px-4 rounded-[12px] text-[14px] inline-flex items-center gap-1.5 cursor-pointer"
                      >
                        <Eye className="w-4 h-4" />
                        <span>Lihat Bukti</span>
                      </button>
                    ) : (
                      <span className="text-[13px] text-[#5A6472] dark:text-[#9AA8B8]">Tanpa lampiran</span>
                    )}

                    {(currentRole === 'bendahara' || currentRole === 'admin' || currentRole === 'ketua') && (
                      <button
                        onClick={() => setTrxToDelete(trx)}
                        className="min-h-[44px] min-w-[44px] flex items-center justify-center text-[#5A6472] hover:text-[#1F3A5F] rounded-[12px] border border-[#E6DFD0] dark:border-[#283D56] cursor-pointer"
                        title="Hapus Transaksi"
                        aria-label={`Hapus transaksi ${trx.description}`}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* ---------------------------------------------------- */}
      {/* TAB 2: IURAN KAS SISWA                               */}
      {/* ---------------------------------------------------- */}
      {activeTab === 'iuran_siswa' && (
        <div className="space-y-6">
          {/* Dues Summary Cards -> Single Continuous Card */}
          <div className="simo-card p-0 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 divide-y sm:divide-y-0 sm:divide-x divide-[#E6DFD0] dark:divide-[#283D56] overflow-hidden">
            <div className="p-6">
              <span className="text-[14px] font-bold text-[#5A6472] dark:text-[#9AA8B8]">Target Kas Bulanan</span>
              <div className="my-2 text-3xl font-black text-[#1F3A5F] dark:text-[#FAF6EE]">
                {formatRupiah(duesSummary.targetNominal)}
              </div>
              <p className="text-[13px] text-[#5A6472] dark:text-[#9AA8B8]">
                {duesSummary.total} Anggota x Rp 15.000 / bln
              </p>
            </div>

            <div className="p-6 bg-[#E4EAF2]/60 dark:bg-[#1F3A5F]/30">
              <span className="text-[14px] font-bold text-[#1F3A5F] dark:text-[#FAF6EE]">Terkumpul (Lunas)</span>
              <div className="my-2 text-3xl font-black text-[#1F3A5F] dark:text-[#FAF6EE]">
                {formatRupiah(duesSummary.terkumpulNominal)}
              </div>
              <p className="text-[13px] text-[#1F3A5F] dark:text-[#FAF6EE] font-semibold">
                {duesSummary.lunas} siswa sudah bayar
              </p>
            </div>

            <div className="p-6 bg-[#FBEBC8] dark:bg-[#F2B544]/20">
              <span className="text-[14px] font-bold text-[#1F3A5F] dark:text-[#F2B544]">Menunggu Verifikasi</span>
              <div className="my-2 text-3xl font-black text-[#1F3A5F] dark:text-[#FAF6EE]">
                {duesSummary.menunggu} Siswa
              </div>
              <p className="text-[13px] text-[#1F3A5F] dark:text-[#FAF6EE]">Sudah kirim bukti transfer</p>
            </div>

            <div className="p-6">
              <span className="text-[14px] font-bold text-[#5A6472] dark:text-[#9AA8B8]">Belum Membayar</span>
              <div className="my-2 text-3xl font-black text-[#1F3A5F] dark:text-[#FAF6EE]">
                {duesSummary.belum} Siswa
              </div>
              <p className="text-[13px] text-[#5A6472] dark:text-[#9AA8B8]">Perlu diingatkan pengurus</p>
            </div>
          </div>

          {/* Filter Bar */}
          <div className="simo-card p-4 sm:p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex flex-wrap items-center gap-2.5">
              <span className="text-[14px] font-bold text-[#5A6472] dark:text-[#9AA8B8] mr-1 flex items-center gap-1.5">
                <Filter className="w-4 h-4" />
                Status:
              </span>
              {(['semua', 'menunggu_verifikasi', 'belum_lunas', 'lunas'] as const).map((st) => (
                <button
                  key={st}
                  onClick={() => setDueStatusFilter(st)}
                  className={`min-h-[40px] px-3.5 py-1.5 rounded-[10px] text-[14px] font-bold capitalize transition-all cursor-pointer ${
                    dueStatusFilter === st
                      ? 'simo-chip-active'
                      : 'simo-chip'
                  }`}
                >
                  {st.replace('_', ' ')}
                  {st === 'menunggu_verifikasi' && duesSummary.menunggu > 0 && (
                    <span className="ml-2 px-2 py-0.5 bg-[#F2B544] text-[#1F3A5F] text-[11px] rounded-full font-black">
                      {duesSummary.menunggu}
                    </span>
                  )}
                </button>
              ))}
            </div>

            <div className="relative w-full md:w-72">
              <Search className="w-4 h-4 text-[#5A6472] dark:text-[#9AA8B8] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                value={dueSearch}
                onChange={(e) => setDueSearch(e.target.value)}
                placeholder="Cari nama siswa / NISN..."
                className="simo-input pl-10 pr-3 min-h-[40px] text-[14px] w-full"
              />
            </div>
          </div>

          {/* Dues Table Desktop */}
          <div className="simo-card p-0 overflow-hidden hidden md:block">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-[15px]">
                <thead>
                  <tr className="bg-[#FAF6EE] dark:bg-[#17293E] border-b border-[#E6DFD0] dark:border-[#283D56] text-[#1F3A5F] dark:text-[#FAF6EE] font-bold text-[14px]">
                    <th className="py-4 px-5">Nama Siswa</th>
                    <th className="py-4 px-5">Periode</th>
                    <th className="py-4 px-5 text-right">Nominal Tagihan</th>
                    <th className="py-4 px-5 text-center">Status Pembayaran</th>
                    <th className="py-4 px-5 text-center">Bukti Transfer</th>
                    <th className="py-4 px-5 text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E6DFD0] dark:divide-[#283D56]">
                  {filteredDues.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-12 text-center text-[#5A6472] dark:text-[#9AA8B8] font-medium text-[15px]">
                        Tidak ada catatan tagihan kas.
                      </td>
                    </tr>
                  ) : (
                    filteredDues.map((due) => {
                      const memberDetail = members.find((m) => m.id === due.memberId);
                      return (
                        <tr key={due.id} className="hover:bg-[#FAF6EE]/50 dark:hover:bg-[#17293E]/50 transition-colors">
                          <td className="py-4 px-5">
                            <div className="flex items-center gap-3">
                              <img
                                src={
                                  memberDetail?.avatarUrl ||
                                  'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&auto=format&fit=crop&q=80'
                                }
                                alt={due.memberName}
                                className="w-9 h-9 rounded-full object-cover border border-[#E6DFD0] dark:border-[#283D56]"
                              />
                              <div>
                                <span className="font-bold text-[#1F3A5F] dark:text-[#FAF6EE] block text-[15px]">
                                  {due.memberName}
                                </span>
                                <span className="text-[13px] text-[#5A6472] dark:text-[#9AA8B8]">
                                  NISN: {due.nisn} {memberDetail ? `• ${memberDetail.classRoom} (${memberDetail.major})` : ''}
                                </span>
                              </div>
                            </div>
                          </td>
                          <td className="py-4 px-5 whitespace-nowrap text-[#5A6472] dark:text-[#9AA8B8] font-medium text-[14px]">
                            September {due.periodYear}
                          </td>
                          <td className="py-4 px-5 whitespace-nowrap text-right font-extrabold text-[#1F3A5F] dark:text-[#FAF6EE]">
                            {formatRupiah(due.amount)}
                          </td>
                          <td className="py-4 px-5 whitespace-nowrap text-center">
                            {due.status === 'lunas' && (
                              <span className="simo-badge-blue">
                                <CheckCircle2 className="w-3.5 h-3.5" />
                                Lunas ({due.paidAt ? formatDateIndo(due.paidAt) : 'Terverifikasi'})
                              </span>
                            )}
                            {due.status === 'menunggu_verifikasi' && (
                              <span className="simo-badge-amber">
                                <Clock className="w-3.5 h-3.5" />
                                Menunggu Verifikasi
                              </span>
                            )}
                            {due.status === 'belum_lunas' && (
                              <span className="simo-badge-neutral">
                                <AlertCircle className="w-3.5 h-3.5" />
                                Belum Bayar
                              </span>
                            )}
                          </td>
                          <td className="py-4 px-5 whitespace-nowrap text-center">
                            {due.proofUrl ? (
                              <button
                                onClick={() => setPreviewProofUrl(due.proofUrl!)}
                                className="simo-btn-outline min-h-[36px] px-3 py-1 rounded-[10px] text-[13px] inline-flex items-center gap-1.5 cursor-pointer"
                              >
                                <Eye className="w-3.5 h-3.5" />
                                <span>Bukti</span>
                              </button>
                            ) : (
                              <span className="text-[#5A6472] dark:text-[#9AA8B8] text-[13px]">Belum ada</span>
                            )}
                          </td>
                          <td className="py-4 px-5 whitespace-nowrap text-right">
                            <div className="flex items-center justify-end gap-2">
                              {due.status === 'menunggu_verifikasi' && (
                                <button
                                  onClick={() => handleVerifyDue(due.id)}
                                  className="simo-btn-amber min-h-[36px] px-3.5 py-1 rounded-[10px] text-[13px] flex items-center gap-1.5 cursor-pointer"
                                  title="Verifikasi dan otomatis catat ke buku kas"
                                >
                                  <Check className="w-4 h-4" />
                                  <span>Verifikasi</span>
                                </button>
                              )}

                              {due.status === 'belum_lunas' && (
                                <button
                                  onClick={() => {
                                    setSelectedDueForPayment(due);
                                    setTransferProofUrl('');
                                  }}
                                  className="simo-btn-outline min-h-[36px] px-3.5 py-1 rounded-[10px] text-[13px] cursor-pointer"
                                >
                                  Bayar / Upload
                                </button>
                              )}

                              {due.status === 'lunas' && (
                                <span className="text-[13px] text-[#5A6472] dark:text-[#9AA8B8] font-medium">
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

          {/* Mobile Card List for Dues */}
          <div className="space-y-3.5 md:hidden">
            {filteredDues.length === 0 ? (
              <div className="simo-card p-8 text-center text-[#5A6472] dark:text-[#9AA8B8] font-medium text-[15px]">
                Tidak ada catatan tagihan kas.
              </div>
            ) : (
              filteredDues.map((due) => (
                <div key={due.id} className="simo-card p-5 space-y-3">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[13px] font-bold text-[#5A6472] dark:text-[#9AA8B8]">
                      September {due.periodYear}
                    </span>
                    <span className="font-black text-[16px] text-[#1F3A5F] dark:text-[#FAF6EE]">
                      {formatRupiah(due.amount)}
                    </span>
                  </div>

                  <h4 className="font-bold text-[16px] text-[#1F3A5F] dark:text-[#FAF6EE]">
                    {due.memberName}
                  </h4>
                  <p className="text-[13px] text-[#5A6472] dark:text-[#9AA8B8]">
                    NISN: {due.nisn}
                  </p>

                  <div className="pt-2 border-t border-[#E6DFD0] dark:border-[#283D56] flex items-center justify-between">
                    <div>
                      {due.status === 'lunas' && (
                        <span className="simo-badge-blue">
                          <CheckCircle2 className="w-3.5 h-3.5" /> Lunas
                        </span>
                      )}
                      {due.status === 'menunggu_verifikasi' && (
                        <span className="simo-badge-amber">
                          <Clock className="w-3.5 h-3.5" /> Verifikasi
                        </span>
                      )}
                      {due.status === 'belum_lunas' && (
                        <span className="simo-badge-neutral">
                          <AlertCircle className="w-3.5 h-3.5" /> Belum Bayar
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-2">
                      {due.proofUrl && (
                        <button
                          onClick={() => setPreviewProofUrl(due.proofUrl!)}
                          className="simo-btn-outline min-h-[44px] px-3.5 rounded-[12px] text-[13px] flex items-center gap-1.5 cursor-pointer"
                        >
                          <Eye className="w-4 h-4" />
                          <span>Bukti</span>
                        </button>
                      )}

                      {due.status === 'menunggu_verifikasi' && (
                        <button
                          onClick={() => handleVerifyDue(due.id)}
                          className="simo-btn-amber min-h-[44px] px-4 rounded-[12px] text-[14px] flex items-center gap-1.5 cursor-pointer"
                        >
                          <Check className="w-4 h-4" />
                          <span>Verifikasi</span>
                        </button>
                      )}

                      {due.status === 'belum_lunas' && (
                        <button
                          onClick={() => {
                            setSelectedDueForPayment(due);
                            setTransferProofUrl('');
                          }}
                          className="simo-btn-outline min-h-[44px] px-4 rounded-[12px] text-[14px] cursor-pointer"
                        >
                          Upload
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* ---------------------------------------------------- */}
      {/* TAB 3: LAPORAN & CETAK PDF                           */}
      {/* ---------------------------------------------------- */}
      {activeTab === 'laporan_cetak' && (
        <div className="space-y-6">
          <div className="simo-card p-8 sm:p-12 max-w-4xl mx-auto print:p-0 print:border-none">
            {/* Header Surat Kop Sekolah */}
            <div className="flex items-center gap-6 border-b-2 border-[#1F3A5F] dark:border-[#E6DFD0] pb-6 mb-6">
              <img
                src={orgProfile.logoUrl}
                alt="Logo Sekolah"
                className="w-20 h-20 rounded-[14px] object-cover shrink-0 border border-[#E6DFD0] dark:border-[#283D56]"
              />
              <div className="flex-1 text-center pr-12">
                <h3 className="text-[14px] font-bold text-[#5A6472] dark:text-[#9AA8B8] uppercase tracking-wider">
                  PEMERINTAH DAERAH PROVINSI DKI JAKARTA
                </h3>
                <h2 className="text-xl sm:text-2xl font-black text-[#1F3A5F] dark:text-[#FAF6EE] uppercase tracking-tight">
                  {orgProfile.schoolName}
                </h2>
                <h4 className="text-[15px] font-extrabold text-[#1F3A5F] dark:text-[#F2B544] uppercase tracking-wider mt-0.5">
                  ORGANISASI SISWA INTRA SEKOLAH (OSIS)
                </h4>
                <p className="text-[13px] text-[#5A6472] dark:text-[#9AA8B8] mt-1">
                  {orgProfile.address} • Email: {orgProfile.email} • Telp: {orgProfile.phone}
                </p>
              </div>
            </div>

            {/* Document Title */}
            <div className="text-center mb-8">
              <h1 className="text-lg sm:text-xl font-black text-[#1F3A5F] dark:text-[#FAF6EE] uppercase tracking-wide underline underline-offset-4">
                LAPORAN PERTANGGUNGJAWABAN ARUS KAS KEUANGAN
              </h1>
              <p className="text-[14px] text-[#5A6472] dark:text-[#9AA8B8] mt-1">
                Tahun Ajaran {orgProfile.academicYear} • Periode s/d {formatDateIndo(new Date().toISOString())}
              </p>
            </div>

            {/* Neraca Saldo Summary Table */}
            <div className="mb-6">
              <h4 className="text-[14px] font-bold text-[#1F3A5F] dark:text-[#FAF6EE] uppercase tracking-wider mb-2.5">
                I. Ringkasan Posisi Kas
              </h4>
              <div className="grid grid-cols-3 border border-[#E6DFD0] dark:border-[#283D56] rounded-[14px] overflow-hidden text-center text-[14px] divide-x divide-[#E6DFD0] dark:divide-[#283D56]">
                <div className="p-4 bg-[#E4EAF2] dark:bg-[#1F3A5F]/30">
                  <span className="block text-[#1F3A5F] dark:text-[#FAF6EE] text-[13px] font-bold">Total Penerimaan</span>
                  <span className="text-lg font-black text-[#1F3A5F] dark:text-[#FAF6EE] mt-1 block">
                    {formatRupiah(totalIncome)}
                  </span>
                </div>
                <div className="p-4 bg-[#FAF6EE] dark:bg-[#17293E]">
                  <span className="block text-[#5A6472] dark:text-[#9AA8B8] text-[13px] font-bold">Total Pengeluaran</span>
                  <span className="text-lg font-black text-[#1F3A5F] dark:text-[#FAF6EE] mt-1 block">
                    {formatRupiah(totalExpense)}
                  </span>
                </div>
                <div className="p-4 bg-[#FBEBC8] dark:bg-[#F2B544]/20">
                  <span className="block text-[#1F3A5F] dark:text-[#F2B544] text-[13px] font-bold">Saldo Akhir di Kas</span>
                  <span className="text-lg font-black text-[#1F3A5F] dark:text-[#FAF6EE] mt-1 block">
                    {formatRupiah(currentBalance)}
                  </span>
                </div>
              </div>
            </div>

            {/* Detailed Ledger Table */}
            <div className="mb-8">
              <h4 className="text-[14px] font-bold text-[#1F3A5F] dark:text-[#FAF6EE] uppercase tracking-wider mb-2.5">
                II. Rincian Buku Kas Umum
              </h4>
              <div className="border border-[#E6DFD0] dark:border-[#283D56] rounded-[14px] overflow-hidden">
                <table className="w-full text-left text-[14px] divide-y divide-[#E6DFD0] dark:divide-[#283D56]">
                  <thead className="bg-[#FAF6EE] dark:bg-[#17293E] font-bold text-[#1F3A5F] dark:text-[#FAF6EE] text-[13px]">
                    <tr>
                      <th className="p-3 border-r border-[#E6DFD0] dark:border-[#283D56] w-12 text-center">No</th>
                      <th className="p-3 border-r border-[#E6DFD0] dark:border-[#283D56] w-28">Tanggal</th>
                      <th className="p-3 border-r border-[#E6DFD0] dark:border-[#283D56]">Uraian / Keterangan</th>
                      <th className="p-3 border-r border-[#E6DFD0] dark:border-[#283D56] w-28">Kategori</th>
                      <th className="p-3 border-r border-[#E6DFD0] dark:border-[#283D56] text-right w-32">Masuk (Debet)</th>
                      <th className="p-3 text-right w-32">Keluar (Kredit)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#E6DFD0] dark:divide-[#283D56]">
                    {cashTransactions.map((trx, idx) => (
                      <tr key={trx.id} className="text-[13px]">
                        <td className="p-3 border-r border-[#E6DFD0] dark:border-[#283D56] text-center text-[#5A6472] dark:text-[#9AA8B8]">{idx + 1}</td>
                        <td className="p-3 border-r border-[#E6DFD0] dark:border-[#283D56] text-[#5A6472] dark:text-[#9AA8B8]">
                          {formatDateIndo(trx.transactionDate)}
                        </td>
                        <td className="p-3 border-r border-[#E6DFD0] dark:border-[#283D56] font-semibold text-[#1F3A5F] dark:text-[#FAF6EE]">
                          {trx.description}
                        </td>
                        <td className="p-3 border-r border-[#E6DFD0] dark:border-[#283D56] text-[#5A6472] dark:text-[#9AA8B8]">
                          {getCategoryLabel(trx.category)}
                        </td>
                        <td className="p-3 border-r border-[#E6DFD0] dark:border-[#283D56] text-right font-bold text-[#1F3A5F] dark:text-[#FAF6EE]">
                          {trx.type === 'pemasukan' ? formatNumber(trx.amount) : '-'}
                        </td>
                        <td className="p-3 text-right font-bold text-[#5A6472] dark:text-[#F2B544]">
                          {trx.type === 'pengeluaran' ? formatNumber(trx.amount) : '-'}
                        </td>
                      </tr>
                    ))}
                    <tr className="bg-[#FAF6EE] dark:bg-[#17293E] font-bold text-[14px] border-t-2 border-[#1F3A5F] dark:border-[#E6DFD0]">
                      <td colSpan={4} className="p-3 border-r border-[#E6DFD0] dark:border-[#283D56] text-right uppercase">
                        Total Akumulasi
                      </td>
                      <td className="p-3 border-r border-[#E6DFD0] dark:border-[#283D56] text-right text-[#1F3A5F] dark:text-[#FAF6EE] font-black">
                        {formatNumber(totalIncome)}
                      </td>
                      <td className="p-3 text-right text-[#5A6472] dark:text-[#F2B544] font-black">
                        {formatNumber(totalExpense)}
                      </td>
                    </tr>
                    <tr className="bg-[#FBEBC8] dark:bg-[#F2B544]/20 font-extrabold text-[15px]">
                      <td colSpan={4} className="p-3 border-r border-[#E6DFD0] dark:border-[#283D56] text-right uppercase text-[#1F3A5F] dark:text-[#FAF6EE]">
                        Sisa Saldo Kas Bersih
                      </td>
                      <td colSpan={2} className="p-3 text-right text-[#1F3A5F] dark:text-[#FAF6EE] font-black">
                        {formatRupiah(currentBalance)}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* Signature Block */}
            <div className="mt-12 pt-6 grid grid-cols-3 gap-6 text-center text-[14px] text-[#1F3A5F] dark:text-[#FAF6EE]">
              <div>
                <p className="text-[#5A6472] dark:text-[#9AA8B8] mb-14">
                  Mengetahui,
                  <br />
                  <strong>Ketua Umum OSIS</strong>
                </p>
                <p className="font-black underline">{orgProfile.ketuaName}</p>
                <p className="text-[12px] text-[#5A6472] dark:text-[#9AA8B8]">NISN. 0071234501</p>
              </div>

              <div>
                <p className="text-[#5A6472] dark:text-[#9AA8B8] mb-14">
                  Diverifikasi oleh,
                  <br />
                  <strong>Pembina OSIS</strong>
                </p>
                <p className="font-black underline">{orgProfile.pembinaName}</p>
                <p className="text-[12px] text-[#5A6472] dark:text-[#9AA8B8]">NIP. 19780512 200501 1 004</p>
              </div>

              <div>
                <p className="text-[#5A6472] dark:text-[#9AA8B8] mb-14">
                  Jakarta, {formatDateIndo(new Date().toISOString())}
                  <br />
                  <strong>Bendahara Umum OSIS</strong>
                </p>
                <p className="font-black underline">Rizky Alamsyah</p>
                <p className="text-[12px] text-[#5A6472] dark:text-[#9AA8B8]">NISN. 0071234503</p>
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
            <label className="block text-[14px] font-bold text-[#1F3A5F] dark:text-[#FAF6EE] mb-2">Tipe Transaksi</label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() =>
                  setKasForm((prev) => ({
                    ...prev,
                    type: 'pemasukan',
                    category: 'dana_sekolah',
                  }))
                }
                className={`min-h-[44px] rounded-[12px] text-[14px] font-bold flex items-center justify-center gap-2 border transition-all cursor-pointer ${
                  kasForm.type === 'pemasukan'
                    ? 'bg-[#1F3A5F] text-[#FAF6EE] border-[#1F3A5F]'
                    : 'bg-[#FFFDF8] dark:bg-[#17293E] text-[#1F3A5F] dark:text-[#FAF6EE] border-[#E6DFD0] dark:border-[#283D56]'
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
                className={`min-h-[44px] rounded-[12px] text-[14px] font-bold flex items-center justify-center gap-2 border transition-all cursor-pointer ${
                  kasForm.type === 'pengeluaran'
                    ? 'bg-[#1F3A5F] text-[#FAF6EE] border-[#1F3A5F]'
                    : 'bg-[#FFFDF8] dark:bg-[#17293E] text-[#1F3A5F] dark:text-[#FAF6EE] border-[#E6DFD0] dark:border-[#283D56]'
                }`}
              >
                <ArrowUpRight className="w-4 h-4" />
                Pengeluaran (Kredit)
              </button>
            </div>
          </div>

          <div>
            <label className="block text-[14px] font-bold text-[#1F3A5F] dark:text-[#FAF6EE] mb-1.5">Kategori</label>
            <select
              value={kasForm.category}
              onChange={(e) =>
                setKasForm((prev) => ({
                  ...prev,
                  category: e.target.value as CashTransaction['category'],
                }))
              }
              className="simo-input min-h-[44px] text-[14px] w-full"
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
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-[14px] font-bold text-[#1F3A5F] dark:text-[#FAF6EE]">
                Nominal Transaksi (Rp)
              </label>
              <span className="text-[13px] text-[#1F3A5F] dark:text-[#F2B544] font-bold">
                Pemisah Titik (.) Aktif
              </span>
            </div>
            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 font-bold text-[#5A6472] dark:text-[#9AA8B8] text-[14px]">
                Rp
              </span>
              <input
                type="text"
                required
                value={kasForm.amountFormatted}
                onChange={(e) => handleKasAmountChange(e.target.value)}
                placeholder="100.000"
                className="simo-input pl-11 pr-3 min-h-[44px] text-[16px] font-black w-full"
              />
            </div>

            <div className="flex flex-wrap gap-2 mt-2.5">
              {quickAmounts.map((amt) => (
                <button
                  key={amt}
                  type="button"
                  onClick={() => handleSelectQuickAmount(amt)}
                  className="px-3 py-1 bg-[#E4EAF2] text-[#1F3A5F] dark:bg-[#1F3A5F]/40 dark:text-[#FAF6EE] rounded-[8px] text-[13px] font-bold transition-colors cursor-pointer"
                >
                  +{formatNumber(amt)}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-[14px] font-bold text-[#1F3A5F] dark:text-[#FAF6EE] mb-1.5">Tanggal</label>
            <input
              type="date"
              required
              value={kasForm.transactionDate}
              onChange={(e) => setKasForm((prev) => ({ ...prev, transactionDate: e.target.value }))}
              className="simo-input min-h-[44px] text-[14px] w-full"
            />
          </div>

          <div>
            <label className="block text-[14px] font-bold text-[#1F3A5F] dark:text-[#FAF6EE] mb-1.5">
              Keterangan / Uraian
            </label>
            <textarea
              required
              rows={3}
              value={kasForm.description}
              onChange={(e) => setKasForm((prev) => ({ ...prev, description: e.target.value }))}
              placeholder="Contoh: Pembelian tinta printer dan kertas HVS untuk proposal"
              className="simo-input text-[14px] w-full p-3 leading-relaxed"
            />
          </div>

          <div>
            <label className="block text-[14px] font-bold text-[#1F3A5F] dark:text-[#FAF6EE] mb-1.5">
              Foto Bukti Nota / Kwitansi / Struk (Dari Komputer)
            </label>
            <ImagePicker
              value={kasForm.proofUrl}
              onChange={(url) => setKasForm((prev) => ({ ...prev, proofUrl: url }))}
              helperText="Pilih foto struk / nota dari laptop/komputer..."
            />
          </div>

          <div className="pt-3 flex justify-end gap-3 border-t border-[#E6DFD0] dark:border-[#283D56]">
            <button
              type="button"
              onClick={() => setIsKasModalOpen(false)}
              className="simo-btn-outline min-h-[44px] px-5 rounded-[12px] text-[14px] font-bold cursor-pointer"
            >
              Batal
            </button>
            <button
              type="submit"
              className="simo-btn-primary min-h-[44px] px-5 rounded-[12px] text-[14px] font-bold cursor-pointer"
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
            <div className="bg-[#FAF6EE] dark:bg-[#0E1B2C] p-4 rounded-[14px] border border-[#E6DFD0] dark:border-[#283D56] text-[14px]">
              <p className="font-bold text-[#1F3A5F] dark:text-[#FAF6EE]">
                Konfirmasi Pembayaran: {selectedDueForPayment.memberName}
              </p>
              <p className="text-[#5A6472] dark:text-[#9AA8B8] mt-1">
                Periode Bulan September {selectedDueForPayment.periodYear} • Nominal:{' '}
                <strong className="text-[#1F3A5F] dark:text-[#FAF6EE]">{formatRupiah(selectedDueForPayment.amount)}</strong>
              </p>
            </div>

            <div>
              <label className="block text-[14px] font-bold text-[#1F3A5F] dark:text-[#FAF6EE] mb-1.5">
                Pilih Bukti Transfer / Bukti Pembayaran (Lokal Komputer)
              </label>
              <ImagePicker
                value={transferProofUrl}
                onChange={setTransferProofUrl}
                helperText="Pilih tangkapan layar m-banking / bukti struk dari file komputer..."
              />
            </div>

            <div className="pt-3 flex justify-end gap-3 border-t border-[#E6DFD0] dark:border-[#283D56]">
              <button
                type="button"
                onClick={() => setSelectedDueForPayment(null)}
                className="simo-btn-outline min-h-[44px] px-5 rounded-[12px] text-[14px] font-bold cursor-pointer"
              >
                Batal
              </button>
              <button
                type="submit"
                className="simo-btn-primary min-h-[44px] px-5 rounded-[12px] text-[14px] font-bold cursor-pointer"
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
              className="max-h-[60vh] max-w-full rounded-[14px] object-contain border border-[#E6DFD0] dark:border-[#283D56]"
            />
          )}
          <div className="mt-5 flex justify-end w-full">
            <button
              onClick={() => setPreviewProofUrl(null)}
              className="simo-btn-primary min-h-[44px] px-5 rounded-[12px] text-[14px] font-bold cursor-pointer"
            >
              Tutup
            </button>
          </div>
        </div>
      </Modal>

      {/* MODAL 4: KONFIRMASI HAPUS TRANSAKSI */}
      <Modal
        isOpen={Boolean(trxToDelete)}
        onClose={() => setTrxToDelete(null)}
        title="Konfirmasi Hapus Transaksi"
      >
        {trxToDelete && (
          <div className="space-y-4">
            <div className="flex items-start gap-3 p-4 rounded-[14px] bg-[#FAF6EE] dark:bg-[#17293E] border border-[#E6DFD0] dark:border-[#283D56]">
              <AlertCircle className="w-5 h-5 text-[#F2B544] shrink-0 mt-0.5" />
              <div className="text-[15px] text-[#1F3A5F] dark:text-[#FAF6EE]">
                <p className="font-bold">Apakah Anda yakin ingin menghapus catatan transaksi ini?</p>
                <p className="text-[14px] text-[#5A6472] dark:text-[#9AA8B8] mt-1">
                  "{trxToDelete.description}" — {formatRupiah(trxToDelete.amount)}
                </p>
                <p className="text-[13px] text-[#5A6472] dark:text-[#9AA8B8] mt-2">
                  Saldo dan arus kas akan disesuaikan kembali secara otomatis.
                </p>
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setTrxToDelete(null)}
                className="simo-btn-outline min-h-[44px] px-5 rounded-[12px] text-[14px] font-bold cursor-pointer"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={() => {
                  deleteCashTransaction(trxToDelete.id);
                  setTrxToDelete(null);
                }}
                className="simo-btn-primary min-h-[44px] px-5 rounded-[12px] text-[14px] font-bold cursor-pointer"
              >
                Ya, Hapus Transaksi
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

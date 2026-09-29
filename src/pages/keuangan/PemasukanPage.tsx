import React, { useState } from 'react';
import {
  Plus,
  ArrowDownLeft,
  CheckCircle2,
  Clock,
  AlertCircle,
  Upload,
  Search,
  Check,
  Eye,
  Wallet,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { MemberDue, CashTransaction } from '../../types';
import { formatRupiah, formatDateIndo } from '../../lib/utils';
import { Modal } from '../../components/common/Modal';
import { ImagePicker } from '../../components/common/ImagePicker';

export const PemasukanPage: React.FC = () => {
  const {
    memberDues,
    updateMemberDueStatus,
    uploadMemberDueProof,
    cashTransactions,
    addCashTransaction,
    currentUser,
    currentRole,
  } = useApp();

  const [activeTab, setActiveTab] = useState<'iuran' | 'lainnya'>('iuran');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  // Modals
  const [uploadDueModal, setUploadDueModal] = useState<MemberDue | null>(null);
  const [uploadedProofUrl, setUploadedProofUrl] = useState('');
  const [viewProofUrl, setViewProofUrl] = useState<string | null>(null);

  // Modal Add Pemasukan Lain
  const [isAddIncomeModalOpen, setIsAddIncomeModalOpen] = useState(false);
  const [incomeForm, setIncomeForm] = useState({
    category: 'dana_sekolah' as CashTransaction['category'],
    amount: 1000000,
    transactionDate: new Date().toISOString().split('T')[0],
    description: '',
    proofUrl: '',
    recordedBy: currentUser.fullName,
  });

  const canVerify = currentRole === 'bendahara' || currentRole === 'admin' || currentRole === 'ketua';

  const handleUploadSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (uploadDueModal && uploadedProofUrl) {
      uploadMemberDueProof(uploadDueModal.id, uploadedProofUrl);
      setUploadDueModal(null);
      setUploadedProofUrl('');
    }
  };

  const handleAddIncomeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    addCashTransaction({
      type: 'pemasukan',
      ...incomeForm,
    });
    setIsAddIncomeModalOpen(false);
    setIncomeForm({
      category: 'dana_sekolah',
      amount: 1000000,
      transactionDate: new Date().toISOString().split('T')[0],
      description: '',
      proofUrl: '',
      recordedBy: currentUser.fullName,
    });
  };

  const otherIncomes = cashTransactions.filter(
    (t) => t.type === 'pemasukan' && t.category !== 'iuran_kas'
  );

  const filteredDues = memberDues.filter((d) => {
    const matchSearch =
      d.memberName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      d.nisn.includes(searchTerm);
    const matchStatus = statusFilter === 'all' || d.status === statusFilter;
    return matchSearch && matchStatus;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-5 rounded-2xl border border-slate-200/80 shadow-2xs">
        <div>
          <h2 className="text-base font-bold text-slate-900">Pemasukan & Iuran Kas Organisasi</h2>
          <p className="text-xs text-slate-500">
            Pengelolaan iuran wajib kas siswa, dana BOS kesiswaan, dan sponsorship kegiatan
          </p>
        </div>
        <div className="flex items-center gap-2 self-start sm:self-auto">
          <button
            onClick={() => setIsAddIncomeModalOpen(true)}
            className="px-3.5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold shadow-sm flex items-center gap-1.5 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Catat Pemasukan Kas</span>
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex p-1 bg-slate-100 rounded-xl max-w-sm">
        <button
          onClick={() => setActiveTab('iuran')}
          className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all cursor-pointer ${
            activeTab === 'iuran'
              ? 'bg-white text-indigo-700 shadow-xs'
              : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          Iuran Kas Siswa ({memberDues.length})
        </button>
        <button
          onClick={() => setActiveTab('lainnya')}
          className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all cursor-pointer ${
            activeTab === 'lainnya'
              ? 'bg-white text-indigo-700 shadow-xs'
              : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          Pemasukan Eksternal / BOS ({otherIncomes.length})
        </button>
      </div>

      {/* TAB 1: IURAN KAS SISWA */}
      {activeTab === 'iuran' && (
        <div className="space-y-4">
          {/* Filters */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-2xs flex flex-wrap items-center gap-3">
            <div className="flex-1 min-w-[200px] flex items-center gap-2 px-3 py-2 bg-slate-50 rounded-xl border border-slate-200/80 text-xs">
              <Search className="w-4 h-4 text-slate-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Cari nama siswa atau NISN..."
                className="w-full bg-transparent outline-none text-slate-700"
              />
            </div>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 bg-slate-50 border border-slate-200/80 rounded-xl text-xs text-slate-700 outline-none"
            >
              <option value="all">Semua Status Iuran</option>
              <option value="lunas">Lunas</option>
              <option value="menunggu_verifikasi">Menunggu Verifikasi</option>
              <option value="belum_lunas">Belum Bayar</option>
            </select>
          </div>

          {/* Dues Table */}
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-2xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200/80 text-slate-500 font-bold uppercase tracking-wider text-[11px]">
                    <th className="py-3 px-4">Siswa</th>
                    <th className="py-3 px-4">Periode</th>
                    <th className="py-3 px-4">Nominal</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4">Bukti Bayar</th>
                    <th className="py-3 px-4 text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredDues.map((due) => (
                    <tr key={due.id} className="hover:bg-slate-50/70">
                      <td className="py-3 px-4">
                        <p className="font-bold text-slate-900">{due.memberName}</p>
                        <p className="text-[10px] text-slate-400 font-mono">NISN: {due.nisn}</p>
                      </td>
                      <td className="py-3 px-4 font-semibold text-slate-700">
                        Bulan {due.periodMonth} / {due.periodYear}
                      </td>
                      <td className="py-3 px-4 font-bold text-slate-900">
                        {formatRupiah(due.amount)}
                      </td>
                      <td className="py-3 px-4">
                        <span
                          className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase ${
                            due.status === 'lunas'
                              ? 'bg-emerald-50 text-emerald-700'
                              : due.status === 'menunggu_verifikasi'
                              ? 'bg-amber-50 text-amber-700'
                              : 'bg-rose-50 text-rose-700'
                          }`}
                        >
                          {due.status.replace('_', ' ')}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        {due.proofUrl ? (
                          <button
                            onClick={() => setViewProofUrl(due.proofUrl || null)}
                            className="inline-flex items-center gap-1 text-[11px] font-bold text-indigo-600 hover:underline cursor-pointer"
                          >
                            <Eye className="w-3.5 h-3.5" />
                            <span>Lihat Bukti</span>
                          </button>
                        ) : (
                          <span className="text-[10px] text-slate-400 italic">Belum ada bukti</span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {/* Upload Proof Button (for student or committee) */}
                          <button
                            onClick={() => {
                              setUploadDueModal(due);
                              setUploadedProofUrl(due.proofUrl || '');
                            }}
                            className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold flex items-center gap-1 cursor-pointer"
                            title="Upload Bukti Transfer dari Komputer"
                          >
                            <Upload className="w-3.5 h-3.5" />
                            <span>Upload</span>
                          </button>

                          {/* Verify 1-Click Button (Bendahara) */}
                          {canVerify && due.status !== 'lunas' && (
                            <button
                              onClick={() => updateMemberDueStatus(due.id, 'lunas')}
                              className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-bold flex items-center gap-1 shadow-xs cursor-pointer"
                              title="Verifikasi Pembayaran"
                            >
                              <Check className="w-3.5 h-3.5" />
                              <span>Verif</span>
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: PEMASUKAN EKSTERNAL */}
      {activeTab === 'lainnya' && (
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-2xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200/80 text-slate-500 font-bold uppercase tracking-wider text-[11px]">
                  <th className="py-3 px-4">Tanggal</th>
                  <th className="py-3 px-4">Sumber / Kategori</th>
                  <th className="py-3 px-4">Keterangan</th>
                  <th className="py-3 px-4">Nominal</th>
                  <th className="py-3 px-4">Pencatat</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {otherIncomes.map((trx) => (
                  <tr key={trx.id} className="hover:bg-slate-50/70">
                    <td className="py-3 px-4 font-semibold text-slate-700">
                      {formatDateIndo(trx.transactionDate)}
                    </td>
                    <td className="py-3 px-4">
                      <span className="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-800 uppercase">
                        {trx.category.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-bold text-slate-900">{trx.description}</td>
                    <td className="py-3 px-4 font-black text-emerald-600">
                      +{formatRupiah(trx.amount)}
                    </td>
                    <td className="py-3 px-4 text-slate-500">{trx.recordedBy}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modal Upload Bukti Transfer (Pilih dari Komputer) */}
      <Modal
        isOpen={Boolean(uploadDueModal)}
        onClose={() => setUploadDueModal(null)}
        title="Upload Bukti Pembayaran Kas"
        subtitle={`Iuran Kas ${uploadDueModal?.memberName} (${formatRupiah(uploadDueModal?.amount || 0)})`}
      >
        <form onSubmit={handleUploadSubmit} className="space-y-4">
          <ImagePicker
            label="Pilih Foto Struk / Bukti Transfer dari Komputer"
            value={uploadedProofUrl}
            onChange={(url) => setUploadedProofUrl(url)}
            helperText="Pilih foto bukti transfer m-banking, QRIS, atau kuitansi dari komputer Anda"
            aspectRatio="video"
          />

          <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setUploadDueModal(null)}
              className="px-4 py-2 bg-slate-100 text-slate-600 text-xs font-semibold rounded-xl cursor-pointer"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={!uploadedProofUrl}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white text-xs font-bold rounded-xl shadow-xs cursor-pointer"
            >
              Kirim Bukti Pembayaran
            </button>
          </div>
        </form>
      </Modal>

      {/* Modal View Proof */}
      {viewProofUrl && (
        <div
          className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-4 cursor-pointer"
          onClick={() => setViewProofUrl(null)}
        >
          <div className="bg-white p-4 rounded-2xl max-w-lg w-full">
            <h4 className="text-xs font-bold text-slate-900 mb-2">Foto Bukti Transfer:</h4>
            <img src={viewProofUrl} alt="Bukti" className="w-full rounded-xl object-contain max-h-[70vh]" />
          </div>
        </div>
      )}

      {/* Modal Add Income */}
      <Modal
        isOpen={isAddIncomeModalOpen}
        onClose={() => setIsAddIncomeModalOpen(false)}
        title="Catat Pemasukan Kas Baru"
        subtitle="Catat penerimaan kas OSIS selain iuran bulanan siswa"
      >
        <form onSubmit={handleAddIncomeSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">Kategori</label>
              <select
                value={incomeForm.category}
                onChange={(e) => setIncomeForm({ ...incomeForm, category: e.target.value as any })}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-indigo-500"
              >
                <option value="dana_sekolah">Alokasi Dana BOS / Sekolah</option>
                <option value="sponsor">Sponsorship Industri (DUDI)</option>
                <option value="lainnya">Lainnya / Dana Usaha</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">Nominal (Rp)</label>
              <input
                type="number"
                min={1000}
                step={50000}
                value={incomeForm.amount}
                onChange={(e) => setIncomeForm({ ...incomeForm, amount: Number(e.target.value) })}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-indigo-500"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">Tanggal Transaksi</label>
            <input
              type="date"
              value={incomeForm.transactionDate}
              onChange={(e) => setIncomeForm({ ...incomeForm, transactionDate: e.target.value })}
              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-indigo-500"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">Keterangan / Uraian</label>
            <input
              type="text"
              value={incomeForm.description}
              onChange={(e) => setIncomeForm({ ...incomeForm, description: e.target.value })}
              placeholder="Contoh: Pencairan dana sponsor PT Telkom untuk Hackathon"
              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-indigo-500"
              required
            />
          </div>

          <ImagePicker
            label="Foto Nota / Kuitansi (Pilih dari Komputer)"
            value={incomeForm.proofUrl}
            onChange={(url) => setIncomeForm({ ...incomeForm, proofUrl: url })}
            helperText="Pilih foto kuitansi atau bukti transfer dari komputer Anda"
            aspectRatio="video"
          />

          <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setIsAddIncomeModalOpen(false)}
              className="px-4 py-2 bg-slate-100 text-slate-600 text-xs font-semibold rounded-xl cursor-pointer"
            >
              Batal
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-xl shadow-xs cursor-pointer"
            >
              Simpan Pemasukan
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

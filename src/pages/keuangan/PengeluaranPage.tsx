import React, { useState } from 'react';
import { Plus, ArrowUpRight, Search, Eye, Trash2 } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { CashTransaction } from '../../types';
import { formatRupiah, formatDateIndo } from '../../lib/utils';
import { Modal } from '../../components/common/Modal';
import { ImagePicker } from '../../components/common/ImagePicker';

export const PengeluaranPage: React.FC = () => {
  const { cashTransactions, addCashTransaction, deleteCashTransaction, currentUser } = useApp();
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [viewProofUrl, setViewProofUrl] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    category: 'konsumsi' as CashTransaction['category'],
    amount: 150000,
    transactionDate: new Date().toISOString().split('T')[0],
    description: '',
    proofUrl: '',
    recordedBy: currentUser.fullName,
  });

  const expenses = cashTransactions.filter((t) => t.type === 'pengeluaran');

  const filtered = expenses.filter(
    (t) =>
      t.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalExpense = expenses.reduce((sum, t) => sum + t.amount, 0);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    addCashTransaction({
      type: 'pengeluaran',
      ...formData,
    });
    setIsModalOpen(false);
    setFormData({
      category: 'konsumsi',
      amount: 150000,
      transactionDate: new Date().toISOString().split('T')[0],
      description: '',
      proofUrl: '',
      recordedBy: currentUser.fullName,
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-5 rounded-2xl border border-slate-200/80 shadow-2xs">
        <div>
          <h2 className="text-base font-bold text-slate-900">Catatan Pengeluaran Kas Organisasi</h2>
          <p className="text-xs text-slate-500">
            Arsip belanja logistik, konsumsi rapat, ATK kesekretariatan, dan operasional kegiatan
          </p>
        </div>
        <div className="flex items-center gap-3 self-start sm:self-auto">
          <div className="text-right">
            <span className="text-[10px] text-slate-400 font-bold uppercase block">Total Pengeluaran:</span>
            <span className="text-sm font-black text-rose-600">{formatRupiah(totalExpense)}</span>
          </div>
          <button
            onClick={() => setIsModalOpen(true)}
            className="px-3.5 py-2 bg-rose-600 hover:bg-rose-500 text-white rounded-xl text-xs font-bold shadow-sm flex items-center gap-1.5 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Catat Pengeluaran</span>
          </button>
        </div>
      </div>

      {/* Filter & Search */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-2xs flex items-center gap-2 max-w-sm">
        <Search className="w-4 h-4 text-slate-400" />
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Cari uraian belanja atau kategori..."
          className="w-full text-xs bg-transparent outline-none text-slate-700"
        />
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200/80 text-slate-500 font-bold uppercase tracking-wider text-[11px]">
                <th className="py-3 px-4">Tanggal</th>
                <th className="py-3 px-4">Kategori Belanja</th>
                <th className="py-3 px-4">Uraian / Keperluan</th>
                <th className="py-3 px-4">Nominal</th>
                <th className="py-3 px-4">Nota / Bukti</th>
                <th className="py-3 px-4 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.map((t) => (
                <tr key={t.id} className="hover:bg-slate-50/70">
                  <td className="py-3 px-4 font-semibold text-slate-700">
                    {formatDateIndo(t.transactionDate)}
                  </td>
                  <td className="py-3 px-4">
                    <span className="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-rose-50 text-rose-700 uppercase">
                      {t.category.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="py-3 px-4 font-bold text-slate-900">{t.description}</td>
                  <td className="py-3 px-4 font-black text-rose-600">
                    -{formatRupiah(t.amount)}
                  </td>
                  <td className="py-3 px-4">
                    {t.proofUrl ? (
                      <button
                        onClick={() => setViewProofUrl(t.proofUrl || null)}
                        className="inline-flex items-center gap-1 text-[11px] font-bold text-indigo-600 hover:underline cursor-pointer"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>Lihat Nota</span>
                      </button>
                    ) : (
                      <span className="text-[10px] text-slate-400 italic">Tanpa nota</span>
                    )}
                  </td>
                  <td className="py-3 px-4 text-right">
                    <button
                      onClick={() => {
                        if (confirm(`Hapus catatan transaksi ${t.description}?`)) {
                          deleteCashTransaction(t.id);
                        }
                      }}
                      className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg cursor-pointer"
                      title="Hapus"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Add Expense */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Catat Pengeluaran Kas Baru"
        subtitle="Pastikan bukti nota belanja difoto dan diunggah"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">Kategori</label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value as any })}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-indigo-500"
              >
                <option value="konsumsi">Konsumsi Rapat / Tamu</option>
                <option value="atk">ATK Kesekretariatan</option>
                <option value="logistik">Logistik & Perlengkapan</option>
                <option value="kegiatan">Operasional Acara</option>
                <option value="lainnya">Lain-lain</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">Nominal (Rp)</label>
              <input
                type="number"
                min={1000}
                step={5000}
                value={formData.amount}
                onChange={(e) => setFormData({ ...formData, amount: Number(e.target.value) })}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-indigo-500"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">Tanggal Belanja</label>
            <input
              type="date"
              value={formData.transactionDate}
              onChange={(e) => setFormData({ ...formData, transactionDate: e.target.value })}
              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-indigo-500"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">Uraian Keperluan</label>
            <input
              type="text"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Contoh: Pembelian snack rapat pleno di kantin sekolah"
              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-indigo-500"
              required
            />
          </div>

          <ImagePicker
            label="Foto Nota / Struk Belanja (Pilih dari Komputer)"
            value={formData.proofUrl}
            onChange={(url) => setFormData({ ...formData, proofUrl: url })}
            helperText="Pilih foto nota dari komputer Anda"
            aspectRatio="video"
          />

          <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="px-4 py-2 bg-slate-100 text-slate-600 text-xs font-semibold rounded-xl cursor-pointer"
            >
              Batal
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold rounded-xl shadow-xs cursor-pointer"
            >
              Simpan Pengeluaran
            </button>
          </div>
        </form>
      </Modal>

      {/* Lightbox Nota */}
      {viewProofUrl && (
        <div
          className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-4 cursor-pointer"
          onClick={() => setViewProofUrl(null)}
        >
          <div className="bg-white p-4 rounded-2xl max-w-lg w-full">
            <h4 className="text-xs font-bold text-slate-900 mb-2">Foto Nota Belanja:</h4>
            <img src={viewProofUrl} alt="Nota" className="w-full rounded-xl object-contain max-h-[70vh]" />
          </div>
        </div>
      )}
    </div>
  );
};

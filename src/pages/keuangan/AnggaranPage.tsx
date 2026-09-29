import React, { useState } from 'react';
import { Plus, PieChart, DollarSign, Edit2, Trash2 } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { BudgetPlan } from '../../types';
import { formatRupiah } from '../../lib/utils';
import { Modal } from '../../components/common/Modal';

export const AnggaranPage: React.FC = () => {
  const { budgets, addBudget, updateBudget, deleteBudget, divisions, orgProfile } = useApp();
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [formData, setFormData] = useState({
    divisionId: divisions[0]?.id || '',
    title: '',
    allocatedAmount: 3000000,
    usedAmount: 0,
    fiscalYear: orgProfile.academicYear,
    notes: '',
  });

  const totalAllocated = budgets.reduce((sum, b) => sum + b.allocatedAmount, 0);
  const totalUsed = budgets.reduce((sum, b) => sum + b.usedAmount, 0);
  const totalRemaining = totalAllocated - totalUsed;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const div = divisions.find((d) => d.id === formData.divisionId);
    addBudget({
      ...formData,
      divisionName: div?.name || 'Divisi',
    });
    setIsModalOpen(false);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-5 rounded-2xl border border-slate-200/80 shadow-2xs">
        <div>
          <h2 className="text-base font-bold text-slate-900">Rencana Anggaran Biaya (RAB)</h2>
          <p className="text-xs text-slate-500">
            Alokasi pagu anggaran tahunan per seksi bidang OSIS {orgProfile.schoolName}
          </p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold shadow-sm flex items-center gap-1.5 cursor-pointer self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Tambah Pagu Anggaran</span>
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-2xs">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Total Pagu Disetujui</span>
          <p className="text-xl font-black text-slate-900 mt-1">{formatRupiah(totalAllocated)}</p>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-2xs">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Total Dana Terpakai</span>
          <p className="text-xl font-black text-rose-600 mt-1">{formatRupiah(totalUsed)}</p>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-2xs">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Sisa Alokasi Pagu</span>
          <p className="text-xl font-black text-emerald-600 mt-1">{formatRupiah(totalRemaining)}</p>
        </div>
      </div>

      {/* Grid of Budget Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {budgets.map((b) => {
          const usedPercent = b.allocatedAmount > 0 ? Math.round((b.usedAmount / b.allocatedAmount) * 100) : 0;
          return (
            <div
              key={b.id}
              className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-2xs space-y-4"
            >
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-full uppercase">
                  {b.divisionName}
                </span>
                <span className="text-xs font-mono text-slate-400">{b.fiscalYear}</span>
              </div>

              <div>
                <h3 className="text-sm font-bold text-slate-900">{b.title}</h3>
                <p className="text-xs text-slate-500 mt-0.5">{b.notes}</p>
              </div>

              {/* Progress bar */}
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-slate-400">Realisasi Dana</span>
                  <span className="font-extrabold text-slate-800">{usedPercent}%</span>
                </div>
                <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all ${
                      usedPercent > 90 ? 'bg-rose-500' : 'bg-indigo-600'
                    }`}
                    style={{ width: `${Math.min(usedPercent, 100)}%` }}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 pt-3 border-t border-slate-100 text-xs">
                <div>
                  <span className="text-[10px] text-slate-400 block">Pagu Anggaran:</span>
                  <span className="font-bold text-slate-800">{formatRupiah(b.allocatedAmount)}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block">Tersisa:</span>
                  <span className="font-bold text-emerald-600">
                    {formatRupiah(b.allocatedAmount - b.usedAmount)}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Modal Add Budget */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Alokasi Pagu Anggaran RAB"
        subtitle="Tetapkan plafon anggaran untuk seksi bidang"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">Pilih Divisi</label>
            <select
              value={formData.divisionId}
              onChange={(e) => setFormData({ ...formData, divisionId: e.target.value })}
              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-indigo-500"
            >
              {divisions.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">Nama Pos Anggaran</label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="Contoh: Operasional Porseni & Classmeeting"
              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-indigo-500"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">Plafon Nominal Alokasi (Rp)</label>
            <input
              type="number"
              min={100000}
              step={100000}
              value={formData.allocatedAmount}
              onChange={(e) => setFormData({ ...formData, allocatedAmount: Number(e.target.value) })}
              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-indigo-500"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">Keterangan / Rincian Pos</label>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              rows={3}
              placeholder="Catatan penggunaan pos anggaran..."
              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-indigo-500"
            />
          </div>

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
              className="px-4 py-2 bg-indigo-600 text-white text-xs font-bold rounded-xl hover:bg-indigo-500 cursor-pointer"
            >
              Simpan Pos Anggaran
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

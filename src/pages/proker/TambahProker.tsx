import React, { useState } from 'react';
import { PlusCircle, ArrowLeft, Save, Briefcase, DollarSign, Calendar } from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const TambahProker: React.FC = () => {
  const { divisions, addWorkProgram, setActivePage } = useApp();

  const [formData, setFormData] = useState({
    title: '',
    divisionId: divisions[0]?.id || '',
    description: '',
    estimatedBudget: 1500000,
    targetDate: '2026-11-15',
    status: 'diajukan' as const,
    progressPercent: 0,
    proposalUrl: '#',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const div = divisions.find((d) => d.id === formData.divisionId);
    addWorkProgram({
      ...formData,
      divisionName: div?.name || 'Sekbid',
    });
    setActivePage('proker-daftar');
  };

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between bg-white p-5 rounded-2xl border border-slate-200/80 shadow-2xs">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setActivePage('proker-daftar')}
            className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-xl cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <h2 className="text-base font-bold text-slate-900">Tambah Program Kerja Baru</h2>
            <p className="text-xs text-slate-500">
              Form pengajuan rencana kegiatan OSIS SMK untuk semester berjalan
            </p>
          </div>
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-2xs space-y-4">
        <div>
          <label className="block text-xs font-semibold text-slate-600 mb-1">
            Nama Program Kerja / Kegiatan
          </label>
          <input
            type="text"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            placeholder="Contoh: Lomba Video Kreatif Profil Sekolah & Jurusan"
            className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-indigo-500"
            required
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">
              Divisi / Seksi Bidang Penanggung Jawab
            </label>
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
            <label className="block text-xs font-semibold text-slate-600 mb-1">
              Estimasi Kebutuhan Anggaran (Rp)
            </label>
            <input
              type="number"
              min={0}
              step={50000}
              value={formData.estimatedBudget}
              onChange={(e) => setFormData({ ...formData, estimatedBudget: Number(e.target.value) })}
              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-indigo-500"
              required
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-600 mb-1">
            Target Tanggal Pelaksanaan
          </label>
          <input
            type="date"
            value={formData.targetDate}
            onChange={(e) => setFormData({ ...formData, targetDate: e.target.value })}
            className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-indigo-500"
            required
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-600 mb-1">
            Deskripsi & Tujuan Program Kerja
          </label>
          <textarea
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            rows={4}
            placeholder="Jelaskan latar belakang, sasaran siswa, dan hasil yang diharapkan dari kegiatan ini..."
            className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-indigo-500"
            required
          />
        </div>

        <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
          <button
            type="button"
            onClick={() => setActivePage('proker-daftar')}
            className="px-4 py-2 bg-slate-100 text-slate-600 text-xs font-semibold rounded-xl cursor-pointer"
          >
            Batal
          </button>
          <button
            type="submit"
            className="px-5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-xl shadow-sm flex items-center gap-1.5 cursor-pointer"
          >
            <Save className="w-4 h-4" />
            <span>Ajukan Program Kerja</span>
          </button>
        </div>
      </form>
    </div>
  );
};

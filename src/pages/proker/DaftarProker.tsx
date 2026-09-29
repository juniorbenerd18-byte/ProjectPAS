import React, { useState } from 'react';
import { Plus, Search, Briefcase, CheckCircle, Clock, AlertCircle, Check, X, FileText } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { WorkProgram } from '../../types';
import { formatRupiah, formatDateIndo } from '../../lib/utils';

export const DaftarProker: React.FC = () => {
  const { workPrograms, updateWorkProgram, currentRole, setActivePage } = useApp();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const canApprove = currentRole === 'ketua' || currentRole === 'pembina' || currentRole === 'admin';

  const filtered = workPrograms.filter((p) => {
    const matchSearch =
      p.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.divisionName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchStatus = statusFilter === 'all' || p.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const getStatusBadge = (status: WorkProgram['status']) => {
    const configs = {
      draft: 'bg-slate-100 text-slate-700 border-slate-200',
      diajukan: 'bg-amber-50 text-amber-700 border-amber-200/80',
      disetujui: 'bg-blue-50 text-blue-700 border-blue-200/80',
      ditolak: 'bg-rose-50 text-rose-700 border-rose-200/80',
      berjalan: 'bg-indigo-50 text-indigo-700 border-indigo-200/80',
      selesai: 'bg-emerald-50 text-emerald-700 border-emerald-200/80',
    };
    return (
      <span className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase border ${configs[status]}`}>
        {status}
      </span>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-5 rounded-2xl border border-slate-200/80 shadow-2xs">
        <div>
          <h2 className="text-base font-bold text-slate-900">Daftar Program Kerja (Proker)</h2>
          <p className="text-xs text-slate-500">
            Seluruh program kerja tahunan OSIS SMK per seksi bidang & status persetujuannya
          </p>
        </div>
        <button
          onClick={() => setActivePage('proker-tambah')}
          className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold shadow-sm flex items-center gap-1.5 cursor-pointer self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Tambah Program Kerja</span>
        </button>
      </div>

      {/* Filter & Search */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-2xs flex flex-wrap items-center gap-3">
        <div className="flex-1 min-w-[200px] flex items-center gap-2 px-3 py-2 bg-slate-50 rounded-xl border border-slate-200/80 text-xs">
          <Search className="w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Cari program kerja..."
            className="w-full bg-transparent outline-none text-slate-700"
          />
        </div>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-3 py-2 bg-slate-50 border border-slate-200/80 rounded-xl text-xs text-slate-700 outline-none"
        >
          <option value="all">Semua Status</option>
          <option value="diajukan">Diajukan</option>
          <option value="disetujui">Disetujui</option>
          <option value="berjalan">Sedang Berjalan</option>
          <option value="selesai">Selesai</option>
          <option value="draft">Draft</option>
        </select>
      </div>

      {/* Proker Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filtered.map((proker) => (
          <div
            key={proker.id}
            className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-2xs space-y-4 hover:border-indigo-300 transition-all flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                  {proker.divisionName}
                </span>
                {getStatusBadge(proker.status)}
              </div>

              <h3 className="text-sm font-bold text-slate-900 leading-snug">{proker.title}</h3>
              <p className="text-xs text-slate-600 mt-1 leading-relaxed">{proker.description}</p>

              {/* Progress bar */}
              <div className="mt-4 pt-3 border-t border-slate-100">
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="text-slate-400 text-[11px]">Progress Pencapaian</span>
                  <span className="font-extrabold text-indigo-600">{proker.progressPercent}%</span>
                </div>
                <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden">
                  <div
                    className="h-full rounded-full bg-indigo-600 transition-all duration-300"
                    style={{ width: `${proker.progressPercent}%` }}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 mt-3 pt-3 border-t border-slate-100 text-xs">
                <div>
                  <span className="text-[10px] text-slate-400 block font-medium">Estimasi Anggaran</span>
                  <span className="font-bold text-slate-800">{formatRupiah(proker.estimatedBudget)}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block font-medium">Target Pelaksanaan</span>
                  <span className="font-semibold text-slate-700">{formatDateIndo(proker.targetDate)}</span>
                </div>
              </div>
            </div>

            {/* Approval Actions for Ketua/Pembina */}
            {canApprove && proker.status === 'diajukan' && (
              <div className="pt-3 border-t border-slate-100 flex items-center justify-between bg-amber-50/50 -mx-5 -mb-5 p-3 rounded-b-2xl">
                <span className="text-[11px] font-bold text-amber-800">Menunggu Persetujuan Anda:</span>
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => updateWorkProgram(proker.id, { status: 'disetujui' })}
                    className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-bold flex items-center gap-1 cursor-pointer"
                  >
                    <Check className="w-3.5 h-3.5" /> Setujui
                  </button>
                  <button
                    onClick={() => updateWorkProgram(proker.id, { status: 'ditolak' })}
                    className="px-2.5 py-1 bg-rose-600 hover:bg-rose-500 text-white rounded-lg text-xs font-bold flex items-center gap-1 cursor-pointer"
                  >
                    <X className="w-3.5 h-3.5" /> Tolak
                  </button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

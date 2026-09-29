import React, { useState } from 'react';
import { FileCheck2, Edit3, CheckCircle, AlertTriangle, FileText, Save } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { Modal } from '../../components/common/Modal';

export const EvaluasiProker: React.FC = () => {
  const { workPrograms, updateWorkProgram } = useApp();
  const [selectedProkerId, setSelectedProkerId] = useState<string | null>(null);
  const [evalText, setEvalText] = useState('');

  const completedProkers = workPrograms.filter((p) => p.status === 'selesai' || p.progressPercent >= 80);

  const handleOpenEdit = (id: string, currentEval?: string) => {
    setSelectedProkerId(id);
    setEvalText(currentEval || '');
  };

  const handleSaveEval = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedProkerId) {
      updateWorkProgram(selectedProkerId, { evaluation: evalText });
      setSelectedProkerId(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-2xs">
        <h2 className="text-base font-bold text-slate-900">Evaluasi & Kendala Program Kerja</h2>
        <p className="text-xs text-slate-500">
          Catatan kendala lapangan, rekomendasi perbaikan, dan laporan evaluasi pasca-kegiatan
        </p>
      </div>

      {/* List */}
      <div className="space-y-4">
        {completedProkers.map((p) => (
          <div
            key={p.id}
            className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-2xs space-y-4"
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <span className="text-[10px] font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded uppercase">
                  {p.divisionName}
                </span>
                <h3 className="text-sm font-bold text-slate-900 mt-1">{p.title}</h3>
              </div>
              <button
                onClick={() => handleOpenEdit(p.id, p.evaluation)}
                className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 self-start sm:self-auto cursor-pointer"
              >
                <Edit3 className="w-3.5 h-3.5" />
                <span>{p.evaluation ? 'Edit Catatan Evaluasi' : 'Tulis Evaluasi'}</span>
              </button>
            </div>

            {p.evaluation ? (
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 space-y-2">
                <span className="text-[10px] font-bold text-slate-500 uppercase flex items-center gap-1.5">
                  <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
                  Catatan Evaluasi Panitia & Pembina:
                </span>
                <p className="text-xs text-slate-700 leading-relaxed italic">{p.evaluation}</p>
              </div>
            ) : (
              <div className="p-3 rounded-xl bg-amber-50 border border-amber-200/60 text-amber-800 text-xs flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                <span>Belum ada catatan evaluasi untuk kegiatan ini. Klik tombol di atas untuk menulis.</span>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Modal Edit Evaluasi */}
      <Modal
        isOpen={Boolean(selectedProkerId)}
        onClose={() => setSelectedProkerId(null)}
        title="Catatan Evaluasi Kegiatan"
        subtitle="Tuliskan kendala teknis, solusi, serta saran untuk kepengurusan selanjutnya"
      >
        <form onSubmit={handleSaveEval} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">
              Catatan Evaluasi & Rekomendasi
            </label>
            <textarea
              value={evalText}
              onChange={(e) => setEvalText(e.target.value)}
              rows={5}
              placeholder="Contoh: Acara berjalan lancar dengan 300 peserta. Kendala ada pada koneksi proyektor utama yang sempat delay 15 menit. Rekomendasi: lakukan gladi resik sound & display H-1..."
              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-indigo-500"
              required
            />
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setSelectedProkerId(null)}
              className="px-4 py-2 bg-slate-100 text-slate-600 text-xs font-semibold rounded-xl cursor-pointer"
            >
              Batal
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-indigo-600 text-white text-xs font-bold rounded-xl hover:bg-indigo-500 cursor-pointer flex items-center gap-1.5"
            >
              <Save className="w-4 h-4" />
              <span>Simpan Evaluasi</span>
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

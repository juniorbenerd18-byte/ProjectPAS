import React from 'react';
import { TrendingUp, CheckCircle2, Sliders, ArrowUpRight } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import confetti from 'canvas-confetti';

export const ProgressProker: React.FC = () => {
  const { workPrograms, updateWorkProgram } = useApp();

  const handleProgressChange = (id: string, newPercent: number) => {
    const isCompleted = newPercent >= 100;
    updateWorkProgram(id, {
      progressPercent: newPercent,
      status: isCompleted ? 'selesai' : newPercent > 0 ? 'berjalan' : 'disetujui',
    });
    if (isCompleted) {
      confetti({ particleCount: 70, spread: 60 });
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-2xs">
        <h2 className="text-base font-bold text-slate-900">Progress Capaian Program Kerja</h2>
        <p className="text-xs text-slate-500">
          Ubah persentase perkembangan milestone setiap kegiatan secara real-time
        </p>
      </div>

      {/* Progress Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {workPrograms.map((p) => (
          <div
            key={p.id}
            className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-2xs space-y-4"
          >
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-full uppercase">
                {p.divisionName}
              </span>
              <span
                className={`text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full ${
                  p.status === 'selesai'
                    ? 'bg-emerald-50 text-emerald-700'
                    : 'bg-indigo-50 text-indigo-700'
                }`}
              >
                {p.status}
              </span>
            </div>

            <div>
              <h3 className="text-sm font-bold text-slate-900">{p.title}</h3>
              <p className="text-xs text-slate-500 mt-1 line-clamp-2">{p.description}</p>
            </div>

            {/* Slider & Controls */}
            <div className="space-y-2 pt-2 border-t border-slate-100">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-500 font-semibold flex items-center gap-1">
                  <Sliders className="w-3.5 h-3.5 text-slate-400" />
                  Atur Progress:
                </span>
                <span className="font-extrabold text-indigo-600 text-sm">
                  {p.progressPercent}%
                </span>
              </div>

              <input
                type="range"
                min="0"
                max="100"
                step="5"
                value={p.progressPercent}
                onChange={(e) => handleProgressChange(p.id, Number(e.target.value))}
                className="w-full accent-indigo-600 h-2 bg-slate-100 rounded-lg cursor-pointer"
              />

              <div className="flex justify-between text-[10px] text-slate-400">
                <span>0% Persiapan</span>
                <span>50% Eksekusi</span>
                <span>100% Selesai & LPJ</span>
              </div>
            </div>

            {p.progressPercent === 100 && (
              <div className="p-2.5 rounded-xl bg-emerald-50 text-emerald-800 text-xs font-semibold flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Program kerja telah rampung dan siap dievaluasi.</span>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

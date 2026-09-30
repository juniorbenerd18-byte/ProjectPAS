import React from 'react';
import { UserCheck, CheckCircle2, AlertTriangle, Clock, Target, Award } from 'lucide-react';
import { AttendanceRecord, WorkProgram } from '../../types';

interface AttendanceStatsWidgetProps {
  attendances: AttendanceRecord[];
  workPrograms: WorkProgram[];
}

export const AttendanceStatsWidget: React.FC<AttendanceStatsWidgetProps> = ({
  attendances,
  workPrograms,
}) => {
  const totalAttendances = attendances.length || 1;
  const hadirCount = attendances.filter((a) => a.status === 'hadir').length;
  const izinCount = attendances.filter((a) => a.status === 'izin').length;
  const sakitCount = attendances.filter((a) => a.status === 'sakit').length;
  const alpaCount = attendances.filter((a) => a.status === 'alpa').length;

  const hadirPercent = Math.round((hadirCount / totalAttendances) * 100);
  const izinPercent = Math.round((izinCount / totalAttendances) * 100);
  const sakitPercent = Math.round((sakitCount / totalAttendances) * 100);
  const alpaPercent = Math.round((alpaCount / totalAttendances) * 100);

  // Proker Completion KPI
  const completedProkers = workPrograms.filter((p) => p.status === 'selesai').length;
  const avgProgress = Math.round(
    workPrograms.reduce((sum, p) => sum + p.progressPercent, 0) / (workPrograms.length || 1)
  );

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-2xs space-y-4 h-full flex flex-col justify-between">
      <div className="flex items-center justify-between pb-2 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <UserCheck className="w-4 h-4" />
          </div>
          <h3 className="text-sm font-bold text-slate-900">Performa Kehadiran & Proker</h3>
        </div>
        <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700">
          Tingkat Sehat
        </span>
      </div>

      {/* Attendance Big Score */}
      <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between">
        <div>
          <span className="text-xs font-semibold text-slate-500">Tingkat Kehadiran Rapat & Event</span>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-3xl font-black text-slate-900">{hadirPercent}%</span>
            <span className="text-xs text-emerald-600 font-bold">Rasio Sangat Baik</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-0.5">
            Total {totalAttendances} pencatatan presensi digital (Face AI + QR + Manual)
          </p>
        </div>

        <div className="w-14 h-14 rounded-2xl bg-emerald-600 text-white flex items-center justify-center font-bold text-base shadow-sm shadow-emerald-200">
          <Award className="w-7 h-7" />
        </div>
      </div>

      {/* Breakdown Bar */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs">
          <span className="text-slate-600 font-semibold">Komposisi Presensi Siswa</span>
          <span className="text-slate-400 text-[11px]">{hadirCount} Hadir dari {totalAttendances}</span>
        </div>

        {/* Stacked Progress Bar */}
        <div className="h-3 rounded-full bg-slate-100 flex overflow-hidden">
          <div
            style={{ width: `${hadirPercent}%` }}
            className="bg-emerald-500 transition-all duration-500"
            title={`Hadir: ${hadirPercent}%`}
          />
          <div
            style={{ width: `${izinPercent}%` }}
            className="bg-blue-400 transition-all duration-500"
            title={`Izin: ${izinPercent}%`}
          />
          <div
            style={{ width: `${sakitPercent}%` }}
            className="bg-amber-400 transition-all duration-500"
            title={`Sakit: ${sakitPercent}%`}
          />
          <div
            style={{ width: `${alpaPercent}%` }}
            className="bg-rose-400 transition-all duration-500"
            title={`Alpa: ${alpaPercent}%`}
          />
        </div>

        {/* Legend Pills */}
        <div className="grid grid-cols-4 gap-2 pt-1 text-[11px]">
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            <span className="text-slate-600 font-medium">Hadir ({hadirCount})</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-blue-400" />
            <span className="text-slate-600 font-medium">Izin ({izinCount})</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-amber-400" />
            <span className="text-slate-600 font-medium">Sakit ({sakitCount})</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-rose-400" />
            <span className="text-slate-600 font-medium">Alpa ({alpaCount})</span>
          </div>
        </div>
      </div>

      {/* Proker Milestone Meter */}
      <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
        <div className="flex items-center gap-2">
          <Target className="w-4 h-4 text-indigo-600" />
          <span className="font-semibold text-slate-700">Rata-rata Capaian Proker</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="font-mono font-black text-indigo-600">{avgProgress}%</span>
          <span className="text-[10px] text-slate-400">({completedProkers} Selesai)</span>
        </div>
      </div>
    </div>
  );
};

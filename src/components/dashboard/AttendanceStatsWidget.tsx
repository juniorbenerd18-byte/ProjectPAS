import React from 'react';
import { UserCheck, Target, Award } from 'lucide-react';
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
    <div className="simo-card p-6 space-y-5 h-full flex flex-col justify-between">
      <div className="flex items-center justify-between pb-3 border-b border-[#E6DFD0] dark:border-[#283D56]">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-[10px] bg-[#E4EAF2] dark:bg-[#1F3A5F]/40 text-[#1F3A5F] dark:text-[#FAF6EE] flex items-center justify-center">
            <UserCheck className="w-4 h-4" />
          </div>
          <h3 className="text-[17px] font-extrabold text-[#1F3A5F] dark:text-[#FAF6EE]">
            Performa Presensi & Proker
          </h3>
        </div>
        <span className="text-[13px] font-bold px-3 py-1 rounded-[8px] bg-[#E4EAF2] text-[#1F3A5F] dark:bg-[#1F3A5F]/40 dark:text-[#FAF6EE] border border-[#E6DFD0] dark:border-[#283D56]">
          Tingkat Sehat
        </span>
      </div>

      {/* Attendance Big Score */}
      <div className="p-5 rounded-[16px] bg-[#FAF6EE] dark:bg-[#0E1B2C] border border-[#E6DFD0] dark:border-[#283D56] flex items-center justify-between">
        <div>
          <span className="text-[14px] font-bold text-[#5A6472] dark:text-[#9AA8B8]">
            Tingkat Kehadiran Rapat & Event
          </span>
          <div className="flex items-baseline gap-2.5 mt-1.5">
            <span className="text-3xl font-black text-[#1F3A5F] dark:text-[#FAF6EE]">{hadirPercent}%</span>
            <span className="text-[14px] text-[#1F3A5F] dark:text-[#F2B544] font-bold">Rasio Sangat Baik</span>
          </div>
          <p className="text-[13px] text-[#5A6472] dark:text-[#9AA8B8] mt-1">
            Total {totalAttendances} pencatatan presensi digital (Face AI + QR)
          </p>
        </div>

        <div className="w-12 h-12 rounded-[14px] bg-[#1F3A5F] text-[#FAF6EE] dark:bg-[#E4EAF2] dark:text-[#1F3A5F] flex items-center justify-center shrink-0">
          <Award className="w-6 h-6 text-[#F2B544]" />
        </div>
      </div>

      {/* Breakdown Bar */}
      <div className="space-y-2.5">
        <div className="flex items-center justify-between text-[14px]">
          <span className="text-[#1F3A5F] dark:text-[#FAF6EE] font-bold">Komposisi Presensi Anggota</span>
          <span className="text-[#5A6472] dark:text-[#9AA8B8] text-[13px]">{hadirCount} Hadir dari {totalAttendances}</span>
        </div>

        {/* Stacked Progress Bar */}
        <div className="h-3 rounded-[6px] bg-[#E6DFD0] dark:bg-[#283D56] flex overflow-hidden">
          <div
            style={{ width: `${hadirPercent}%` }}
            className="bg-[#1F3A5F] transition-all duration-500"
            title={`Hadir: ${hadirPercent}%`}
          />
          <div
            style={{ width: `${izinPercent}%` }}
            className="bg-[#6B96CD] transition-all duration-500"
            title={`Izin: ${izinPercent}%`}
          />
          <div
            style={{ width: `${sakitPercent}%` }}
            className="bg-[#F2B544] transition-all duration-500"
            title={`Sakit: ${sakitPercent}%`}
          />
          <div
            style={{ width: `${alpaPercent}%` }}
            className="bg-[#9AA8B8] transition-all duration-500"
            title={`Alpa: ${alpaPercent}%`}
          />
        </div>

        {/* Legend Pills */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1 text-[13px]">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-[#1F3A5F]" />
            <span className="text-[#5A6472] dark:text-[#9AA8B8] font-medium">Hadir ({hadirCount})</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-[#6B96CD]" />
            <span className="text-[#5A6472] dark:text-[#9AA8B8] font-medium">Izin ({izinCount})</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-[#F2B544]" />
            <span className="text-[#5A6472] dark:text-[#9AA8B8] font-medium">Sakit ({sakitCount})</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-[#9AA8B8]" />
            <span className="text-[#5A6472] dark:text-[#9AA8B8] font-medium">Alpa ({alpaCount})</span>
          </div>
        </div>
      </div>

      {/* Proker Milestone Meter */}
      <div className="pt-3 border-t border-[#E6DFD0] dark:border-[#283D56] flex items-center justify-between text-[14px]">
        <div className="flex items-center gap-2">
          <Target className="w-4 h-4 text-[#1F3A5F] dark:text-[#F2B544]" />
          <span className="font-bold text-[#1F3A5F] dark:text-[#FAF6EE]">Rata-rata Capaian Proker</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="font-mono font-bold text-[#1F3A5F] dark:text-[#F2B544] text-[15px]">{avgProgress}%</span>
          <span className="text-[13px] text-[#5A6472] dark:text-[#9AA8B8]">({completedProkers} Selesai)</span>
        </div>
      </div>
    </div>
  );
};

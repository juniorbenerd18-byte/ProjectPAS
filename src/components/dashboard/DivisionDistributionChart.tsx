import React, { useState } from 'react';
import { PieChart, Users, ChevronRight } from 'lucide-react';
import { Member, Division } from '../../types';

interface DivisionDistributionChartProps {
  members: Member[];
  divisions: Division[];
}

export const DivisionDistributionChart: React.FC<DivisionDistributionChartProps> = ({
  members,
  divisions,
}) => {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  // Filter only active members
  const activeMembers = members.filter((m) => m.status === 'aktif');
  const totalActive = activeMembers.length || 1;

  // Palette colors for divisions
  const colors = [
    { bg: 'bg-indigo-500', stroke: '#6366f1', text: 'text-indigo-600' },
    { bg: 'bg-emerald-500', stroke: '#10b981', text: 'text-emerald-600' },
    { bg: 'bg-amber-500', stroke: '#f59e0b', text: 'text-amber-600' },
    { bg: 'bg-cyan-500', stroke: '#06b6d4', text: 'text-cyan-600' },
    { bg: 'bg-violet-500', stroke: '#8b5cf6', text: 'text-violet-600' },
    { bg: 'bg-rose-500', stroke: '#f43f5e', text: 'text-rose-600' },
  ];

  // Aggregate members count per division
  const divisionStats = divisions.map((div, index) => {
    const count = activeMembers.filter((m) => m.divisionId === div.id || m.divisionName === div.name).length;
    const percentage = Math.round((count / totalActive) * 100);
    const color = colors[index % colors.length];

    return {
      division: div,
      count,
      percentage,
      color,
    };
  });

  // Calculate SVG Donut parameters
  const radius = 60;
  const strokeWidth = 18;
  const circumference = 2 * Math.PI * radius;
  let accumulatedOffset = 0;

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-2xs space-y-4 h-full flex flex-col justify-between">
      <div className="flex items-center justify-between pb-2 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
            <PieChart className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900">Distribusi Anggota per Sekbid</h3>
            <p className="text-[11px] text-slate-500">Komposisi pengurus aktif per divisi</p>
          </div>
        </div>
        <span className="text-[11px] font-bold text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-full border border-indigo-100/60">
          {activeMembers.length} Siswa Aktif
        </span>
      </div>

      <div className="flex flex-col sm:flex-row items-center gap-6 my-auto py-1">
        {/* SVG Donut */}
        <div className="relative w-36 h-36 sm:w-40 sm:h-40 shrink-0 flex items-center justify-center">
          <svg className="w-full h-full transform -rotate-90" viewBox="0 0 160 160">
            {/* Background ring */}
            <circle
              cx="80"
              cy="80"
              r={radius}
              stroke="#f1f5f9"
              strokeWidth={strokeWidth}
              fill="transparent"
            />
            {/* Segment rings */}
            {divisionStats.map((item, idx) => {
              const strokeLength = (item.count / totalActive) * circumference;
              const strokeDasharray = `${strokeLength} ${circumference - strokeLength}`;
              const strokeDashoffset = -accumulatedOffset;
              accumulatedOffset += strokeLength;

              const isHovered = hoveredIndex === idx;

              return (
                <circle
                  key={item.division.id}
                  cx="80"
                  cy="80"
                  r={radius}
                  stroke={item.color.stroke}
                  strokeWidth={isHovered ? strokeWidth + 4 : strokeWidth}
                  strokeDasharray={strokeDasharray}
                  strokeDashoffset={strokeDashoffset}
                  fill="transparent"
                  strokeLinecap="round"
                  className="transition-all duration-300 cursor-pointer"
                  onMouseEnter={() => setHoveredIndex(idx)}
                  onMouseLeave={() => setHoveredIndex(null)}
                />
              );
            })}
          </svg>

          {/* Center Label */}
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none text-center px-2">
            {hoveredIndex !== null ? (
              <>
                <span className="text-2xl font-black text-slate-900 leading-none">
                  {divisionStats[hoveredIndex]?.count}
                </span>
                <span className="text-[11px] text-slate-500 font-semibold mt-0.5">Siswa Pengurus</span>
                <span className="text-[11px] text-indigo-600 font-extrabold mt-0.5">
                  {divisionStats[hoveredIndex]?.percentage}%
                </span>
              </>
            ) : (
              <>
                <span className="text-2xl font-black text-slate-900 leading-none">
                  {activeMembers.length}
                </span>
                <span className="text-[11px] text-slate-500 font-medium mt-0.5">
                  Total Anggota
                </span>
                <span className="text-[10px] text-indigo-600 font-bold bg-indigo-50 px-2 py-0.5 rounded-full mt-1">
                  {divisions.length} Sekbid
                </span>
              </>
            )}
          </div>
        </div>

        {/* Division List / Legend */}
        <div className="flex-1 w-full space-y-1.5 min-w-0">
          {divisionStats.map((item, idx) => {
            const isHovered = hoveredIndex === idx;
            const cleanName = item.division.name.replace(/Sekbid \d+ - /, '');
            return (
              <div
                key={item.division.id}
                onMouseEnter={() => setHoveredIndex(idx)}
                onMouseLeave={() => setHoveredIndex(null)}
                className={`px-2.5 py-1.5 rounded-xl border transition-all duration-200 cursor-pointer flex items-center justify-between gap-2 ${
                  isHovered
                    ? 'bg-indigo-50/50 border-indigo-200 shadow-2xs'
                    : 'border-slate-100 hover:border-slate-200 bg-slate-50/40'
                }`}
              >
                <div className="flex items-center gap-2 min-w-0">
                  <span className={`w-2.5 h-2.5 rounded-full shrink-0 ${item.color.bg}`} />
                  <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-700 shrink-0">
                    {item.division.code}
                  </span>
                  <span className="text-xs font-semibold text-slate-800 truncate" title={item.division.name}>
                    {cleanName}
                  </span>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <span className="text-xs font-bold text-slate-800">{item.count} siswa</span>
                  <span className="text-[10px] font-mono font-bold text-indigo-600 bg-white px-1.5 py-0.5 rounded border border-slate-200/80 min-w-[34px] text-center">
                    {item.percentage}%
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

import React, { useState } from 'react';
import { PieChart } from 'lucide-react';
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

  const activeMembers = members.filter((m) => m.status === 'aktif');
  const totalActive = activeMembers.length || 1;

  // Tiga tingkat biru sesuai design brief
  const blueShades = [
    { stroke: '#1E3A8A', bg: 'bg-[#1E3A8A]', text: 'text-[#1E3A8A]' }, // biru gelap
    { stroke: '#2563EB', bg: 'bg-[#2563EB]', text: 'text-[#2563EB]' }, // biru utama
    { stroke: '#3B82F6', bg: 'bg-[#3B82F6]', text: 'text-[#3B82F6]' }, // biru mid
    { stroke: '#60A5FA', bg: 'bg-[#60A5FA]', text: 'text-[#60A5FA]' }, // biru terang
    { stroke: '#93C5FD', bg: 'bg-[#93C5FD]', text: 'text-[#93C5FD]' }, // biru pale
    { stroke: '#BFDBFE', bg: 'bg-[#BFDBFE]', text: 'text-[#BFDBFE]' }, // biru sangat muda
  ];

  const divisionStats = divisions.map((div, index) => {
    const count = activeMembers.filter(
      (m) => m.divisionId === div.id || m.divisionName === div.name
    ).length;
    const percentage = Math.round((count / totalActive) * 100);
    const color = blueShades[index % blueShades.length];
    return { division: div, count, percentage, color };
  });

  const radius = 58;
  const strokeWidth = 16;
  const circumference = 2 * Math.PI * radius;
  let accumulatedOffset = 0;

  return (
    <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-5 h-full flex flex-col gap-4">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-md bg-[#EFF6FF] flex items-center justify-center">
            <PieChart className="w-3.5 h-3.5 text-[#2563EB]" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-[#0F172A] dark:text-white">Distribusi per Sekbid</h3>
            <p className="text-[11px] text-[#64748B]">Komposisi pengurus aktif</p>
          </div>
        </div>
        <span className="text-[11px] font-bold text-[#2563EB] bg-[#EFF6FF] px-2.5 py-1 rounded-full border border-blue-100">
          {activeMembers.length} Aktif
        </span>
      </div>

      {/* Donut + List */}
      <div className="flex flex-col sm:flex-row items-center gap-5 flex-1">
        {/* SVG Donut */}
        <div className="relative w-36 h-36 shrink-0 flex items-center justify-center">
          <svg className="w-full h-full -rotate-90" viewBox="0 0 160 160">
            {/* Track ring */}
            <circle
              cx="80" cy="80" r={radius}
              stroke="#EFF6FF"
              strokeWidth={strokeWidth}
              fill="transparent"
            />
            {/* Segments */}
            {divisionStats.map((item, idx) => {
              const strokeLength = (item.count / totalActive) * circumference;
              const strokeDasharray = `${strokeLength} ${circumference - strokeLength}`;
              const strokeDashoffset = -accumulatedOffset;
              accumulatedOffset += strokeLength;
              const isHovered = hoveredIndex === idx;

              return (
                <circle
                  key={item.division.id}
                  cx="80" cy="80" r={radius}
                  stroke={item.color.stroke}
                  strokeWidth={isHovered ? strokeWidth + 3 : strokeWidth}
                  strokeDasharray={strokeDasharray}
                  strokeDashoffset={strokeDashoffset}
                  fill="transparent"
                  strokeLinecap="butt"
                  className="transition-all duration-200 cursor-pointer"
                  onMouseEnter={() => setHoveredIndex(idx)}
                  onMouseLeave={() => setHoveredIndex(null)}
                />
              );
            })}
          </svg>

          {/* Center label */}
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center pointer-events-none">
            {hoveredIndex !== null ? (
              <>
                <span className="text-2xl font-black text-[#0F172A] dark:text-white leading-none">
                  {divisionStats[hoveredIndex]?.count}
                </span>
                <span className="text-[10px] text-[#64748B] mt-0.5">Anggota</span>
                <span className="text-[11px] font-extrabold text-[#2563EB] mt-0.5">
                  {divisionStats[hoveredIndex]?.percentage}%
                </span>
              </>
            ) : (
              <>
                <span className="text-2xl font-black text-[#0F172A] dark:text-white leading-none">
                  {activeMembers.length}
                </span>
                <span className="text-[10px] text-[#64748B] mt-0.5">Total</span>
                <span className="text-[10px] font-bold text-[#2563EB] mt-0.5">
                  {divisions.length} Sekbid
                </span>
              </>
            )}
          </div>
        </div>

        {/* Division list */}
        <div className="flex-1 w-full space-y-1.5 min-w-0">
          {divisionStats.map((item, idx) => {
            const isHovered = hoveredIndex === idx;
            const cleanName = item.division.name.replace(/Sekbid \d+ - /, '');
            return (
              <div
                key={item.division.id}
                onMouseEnter={() => setHoveredIndex(idx)}
                onMouseLeave={() => setHoveredIndex(null)}
                className={`px-2.5 py-1.5 rounded-lg border transition-all cursor-pointer flex items-center justify-between gap-2 ${
                  isHovered
                    ? 'bg-[#EFF6FF] border-blue-200'
                    : 'border-slate-100 dark:border-slate-800 hover:border-slate-200 bg-[#F8FAFC] dark:bg-slate-800/40'
                }`}
              >
                <div className="flex items-center gap-2 min-w-0">
                  <span className={`w-2 h-2 rounded-full shrink-0 ${item.color.bg}`} />
                  <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-slate-100 dark:bg-slate-700 text-[#64748B] shrink-0">
                    {item.division.code}
                  </span>
                  <span className="text-[11px] font-semibold text-[#0F172A] dark:text-slate-200 truncate">
                    {cleanName}
                  </span>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <span className="text-[11px] font-bold text-[#0F172A] dark:text-white">{item.count}</span>
                  <span className={`text-[10px] font-mono font-bold px-1.5 py-0.5 rounded min-w-[30px] text-center ${
                    isHovered
                      ? 'bg-[#2563EB] text-white'
                      : 'bg-slate-100 dark:bg-slate-700 text-[#64748B]'
                  }`}>
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

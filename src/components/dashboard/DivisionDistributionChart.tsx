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

  // Shades derived from Deep Blue #1F3A5F and Amber #F2B544
  const themeShades = [
    { stroke: '#1F3A5F', bg: 'bg-[#1F3A5F]' },
    { stroke: '#2E5688', bg: 'bg-[#2E5688]' },
    { stroke: '#4775B0', bg: 'bg-[#4775B0]' },
    { stroke: '#F2B544', bg: 'bg-[#F2B544]' },
    { stroke: '#6B96CD', bg: 'bg-[#6B96CD]' },
    { stroke: '#F6CD7B', bg: 'bg-[#F6CD7B]' },
  ];

  const divisionStats = divisions.map((div, index) => {
    const count = activeMembers.filter(
      (m) => m.divisionId === div.id || m.divisionName === div.name
    ).length;
    const percentage = Math.round((count / totalActive) * 100);
    const color = themeShades[index % themeShades.length];
    return { division: div, count, percentage, color };
  });

  const radius = 58;
  const strokeWidth = 16;
  const circumference = 2 * Math.PI * radius;
  let accumulatedOffset = 0;

  return (
    <div className="simo-card p-6 h-full flex flex-col gap-5">
      {/* Header */}
      <div className="flex items-center justify-between pb-4 border-b border-[#E6DFD0] dark:border-[#283D56]">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-[10px] bg-[#E4EAF2] dark:bg-[#1F3A5F]/40 flex items-center justify-center">
            <PieChart className="w-4 h-4 text-[#1F3A5F] dark:text-[#FAF6EE]" />
          </div>
          <div>
            <h3 className="text-[17px] font-extrabold text-[#1F3A5F] dark:text-[#FAF6EE]">
              Distribusi per Sekbid
            </h3>
            <p className="text-[14px] text-[#5A6472] dark:text-[#9AA8B8]">Komposisi pengurus aktif</p>
          </div>
        </div>
        <span className="text-[13px] font-bold text-[#1F3A5F] dark:text-[#FAF6EE] bg-[#E4EAF2] dark:bg-[#1F3A5F]/40 px-3 py-1 rounded-[8px] border border-[#E6DFD0] dark:border-[#283D56]">
          {activeMembers.length} Aktif
        </span>
      </div>

      {/* Donut + List */}
      <div className="flex flex-col sm:flex-row items-center gap-6 flex-1">
        {/* SVG Donut */}
        <div className="relative w-40 h-40 shrink-0 flex items-center justify-center">
          <svg className="w-full h-full -rotate-90" viewBox="0 0 160 160">
            {/* Track ring */}
            <circle
              cx="80" cy="80" r={radius}
              stroke="#E6DFD0"
              strokeWidth={strokeWidth}
              fill="transparent"
              className="dark:stroke-[#283D56]"
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
                  strokeWidth={isHovered ? strokeWidth + 4 : strokeWidth}
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
                <span className="text-3xl font-black text-[#1F3A5F] dark:text-[#FAF6EE] leading-none">
                  {divisionStats[hoveredIndex]?.count}
                </span>
                <span className="text-[13px] text-[#5A6472] dark:text-[#9AA8B8] mt-0.5">Anggota</span>
                <span className="text-[13px] font-extrabold text-[#F2B544] mt-0.5">
                  {divisionStats[hoveredIndex]?.percentage}%
                </span>
              </>
            ) : (
              <>
                <span className="text-3xl font-black text-[#1F3A5F] dark:text-[#FAF6EE] leading-none">
                  {activeMembers.length}
                </span>
                <span className="text-[13px] text-[#5A6472] dark:text-[#9AA8B8] mt-0.5">Total</span>
                <span className="text-[13px] font-bold text-[#1F3A5F] dark:text-[#FAF6EE] mt-0.5">
                  {divisions.length} Sekbid
                </span>
              </>
            )}
          </div>
        </div>

        {/* Division list */}
        <div className="flex-1 w-full space-y-2 min-w-0">
          {divisionStats.map((item, idx) => {
            const isHovered = hoveredIndex === idx;
            const cleanName = item.division.name.replace(/Sekbid \d+ - /, '');
            return (
              <div
                key={item.division.id}
                onMouseEnter={() => setHoveredIndex(idx)}
                onMouseLeave={() => setHoveredIndex(null)}
                className={`px-3 py-2 rounded-[10px] border transition-all cursor-pointer flex items-center justify-between gap-3 ${
                  isHovered
                    ? 'bg-[#E4EAF2] border-[#1F3A5F] dark:bg-[#1F3A5F]/40 dark:border-[#F2B544]'
                    : 'border-[#E6DFD0] dark:border-[#283D56] hover:bg-[#FAF6EE] dark:hover:bg-[#17293E] bg-[#FFFDF8] dark:bg-[#0E1B2C]'
                }`}
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <span className={`w-2.5 h-2.5 rounded-full shrink-0 ${item.color.bg}`} />
                  <span className="px-2 py-0.5 rounded-[6px] text-[12px] font-bold bg-[#FAF6EE] dark:bg-[#17293E] text-[#5A6472] dark:text-[#9AA8B8] border border-[#E6DFD0] dark:border-[#283D56] shrink-0">
                    {item.division.code}
                  </span>
                  <span className="text-[14px] font-semibold text-[#1F3A5F] dark:text-[#FAF6EE] truncate">
                    {cleanName}
                  </span>
                </div>
                <div className="flex items-center gap-2.5 shrink-0">
                  <span className="text-[14px] font-bold text-[#1F3A5F] dark:text-[#FAF6EE]">{item.count}</span>
                  <span className={`text-[13px] font-mono font-bold px-2 py-0.5 rounded-[6px] min-w-[36px] text-center ${
                    isHovered
                      ? 'bg-[#1F3A5F] text-[#FAF6EE] dark:bg-[#F2B544] dark:text-[#1F3A5F]'
                      : 'bg-[#E4EAF2] text-[#1F3A5F] dark:bg-[#283D56] dark:text-[#FAF6EE]'
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

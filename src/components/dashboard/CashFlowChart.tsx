import React, { useState } from 'react';
import { TrendingUp, ArrowDownLeft, ArrowUpRight, DollarSign, Calendar } from 'lucide-react';
import { CashTransaction } from '../../types';
import { formatRupiah } from '../../lib/utils';

interface CashFlowChartProps {
  transactions: CashTransaction[];
}

interface MonthlyData {
  key: string;
  label: string;
  income: number;
  expense: number;
  count: number;
}

export const CashFlowChart: React.FC<CashFlowChartProps> = ({ transactions }) => {
  const [hoveredMonth, setHoveredMonth] = useState<MonthlyData | null>(null);
  const [activeView, setActiveView] = useState<'all' | '6m'>('6m');

  // Month list for Semester Gasal (Jul - Des 2026)
  const monthLabels: { [key: string]: string } = {
    '2026-07': 'Jul',
    '2026-08': 'Agu',
    '2026-09': 'Sep',
    '2026-10': 'Okt',
    '2026-11': 'Nov',
    '2026-12': 'Des',
  };

  // Group transactions by YYYY-MM
  const monthlyAggregates: MonthlyData[] = Object.keys(monthLabels).map((monthKey) => {
    const monthlyTrx = transactions.filter((t) => t.transactionDate.startsWith(monthKey));
    const income = monthlyTrx
      .filter((t) => t.type === 'pemasukan')
      .reduce((sum, t) => sum + t.amount, 0);
    const expense = monthlyTrx
      .filter((t) => t.type === 'pengeluaran')
      .reduce((sum, t) => sum + t.amount, 0);

    return {
      key: monthKey,
      label: monthLabels[monthKey],
      income,
      expense,
      count: monthlyTrx.length,
    };
  });

  // Calculate highest value for Y-axis scaling
  const maxVal = Math.max(
    ...monthlyAggregates.map((m) => Math.max(m.income, m.expense)),
    10000000 // minimum scale baseline 10 juta
  );

  const totalIncomeSemester = monthlyAggregates.reduce((sum, m) => sum + m.income, 0);
  const totalExpenseSemester = monthlyAggregates.reduce((sum, m) => sum + m.expense, 0);
  const netSurplus = totalIncomeSemester - totalExpenseSemester;

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-2xs space-y-4 h-full flex flex-col justify-between">
      {/* Chart Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-slate-100">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <TrendingUp className="w-4 h-4" />
            </div>
            <h3 className="text-sm font-bold text-slate-900">Grafik Arus Kas Bulanan (Cash Flow)</h3>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Komparasi pemasukan & pengeluaran kas OSIS Semester Gasal 2026
          </p>
        </div>

        {/* Legend */}
        <div className="flex items-center gap-4 text-xs">
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-md bg-emerald-500 inline-block shadow-2xs" />
            <span className="text-slate-600 font-medium">Pemasukan</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-md bg-rose-500 inline-block shadow-2xs" />
            <span className="text-slate-600 font-medium">Pengeluaran</span>
          </div>
        </div>
      </div>

      {/* Main Chart Area */}
      <div className="relative pt-4 pb-2">
        {/* Hover Tooltip Overlay */}
        {hoveredMonth && (
          <div className="absolute top-0 right-4 z-20 bg-slate-900/95 backdrop-blur-md text-white p-3 rounded-xl shadow-xl text-xs space-y-1.5 border border-slate-800 pointer-events-none animate-in fade-in-50">
            <div className="flex items-center justify-between gap-4 font-bold border-b border-slate-800 pb-1">
              <span className="text-indigo-400">Bulan {hoveredMonth.label} 2026</span>
              <span className="text-[10px] text-slate-400 font-normal">{hoveredMonth.count} Transaksi</span>
            </div>
            <div className="space-y-1 text-[11px]">
              <div className="flex items-center justify-between gap-3 text-emerald-400">
                <span>Pemasukan:</span>
                <span className="font-bold">{formatRupiah(hoveredMonth.income)}</span>
              </div>
              <div className="flex items-center justify-between gap-3 text-rose-400">
                <span>Pengeluaran:</span>
                <span className="font-bold">{formatRupiah(hoveredMonth.expense)}</span>
              </div>
              <div className="flex items-center justify-between gap-3 text-slate-300 pt-1 border-t border-slate-800 font-semibold">
                <span>Net:</span>
                <span className={hoveredMonth.income >= hoveredMonth.expense ? 'text-emerald-300' : 'text-rose-300'}>
                  {hoveredMonth.income >= hoveredMonth.expense ? '+' : ''}
                  {formatRupiah(hoveredMonth.income - hoveredMonth.expense)}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Chart Bars Grid */}
        <div className="h-52 flex items-end justify-between gap-2 sm:gap-4 px-2 sm:px-4 border-b border-slate-200">
          {monthlyAggregates.map((data) => {
            const incomeHeight = Math.max((data.income / maxVal) * 100, 4);
            const expenseHeight = Math.max((data.expense / maxVal) * 100, 4);
            const isHovered = hoveredMonth?.key === data.key;

            return (
              <div
                key={data.key}
                onMouseEnter={() => setHoveredMonth(data)}
                onMouseLeave={() => setHoveredMonth(null)}
                className={`flex-1 flex flex-col items-center h-full justify-end cursor-pointer group transition-all duration-200 ${
                  isHovered ? 'opacity-100 scale-105' : 'opacity-90 hover:opacity-100'
                }`}
              >
                {/* Bars Pair */}
                <div className="w-full flex items-end justify-center gap-1 sm:gap-1.5 h-full pb-1">
                  {/* Income Bar */}
                  <div
                    style={{ height: `${data.income > 0 ? incomeHeight : 3}%` }}
                    className={`w-1/2 max-w-[20px] rounded-t-lg transition-all duration-300 ${
                      data.income > 0
                        ? 'bg-gradient-to-t from-emerald-600 to-emerald-400 shadow-sm shadow-emerald-200 group-hover:from-emerald-500 group-hover:to-emerald-300'
                        : 'bg-slate-100'
                    }`}
                  />
                  {/* Expense Bar */}
                  <div
                    style={{ height: `${data.expense > 0 ? expenseHeight : 3}%` }}
                    className={`w-1/2 max-w-[20px] rounded-t-lg transition-all duration-300 ${
                      data.expense > 0
                        ? 'bg-gradient-to-t from-rose-600 to-rose-400 shadow-sm shadow-rose-200 group-hover:from-rose-500 group-hover:to-rose-300'
                        : 'bg-slate-100'
                    }`}
                  />
                </div>

                {/* X-axis Month Label */}
                <span
                  className={`text-[11px] font-bold mt-2 transition-colors ${
                    isHovered ? 'text-indigo-600' : 'text-slate-500'
                  }`}
                >
                  {data.label}
                </span>
              </div>
            );
          })}
        </div>

        {/* Y-axis Guides */}
        <div className="flex justify-between items-center text-[10px] text-slate-400 px-2 pt-1 font-mono">
          <span>Rp 0</span>
          <span>{formatRupiah(maxVal / 2)}</span>
          <span>Max: {formatRupiah(maxVal)}</span>
        </div>
      </div>

      {/* Financial Health Summary Pills */}
      <div className="grid grid-cols-3 gap-3 pt-1">
        <div className="p-3 bg-emerald-50/70 border border-emerald-100 rounded-xl">
          <span className="text-[10px] font-bold text-emerald-700 uppercase tracking-wider block">
            Total Pemasukan
          </span>
          <span className="text-xs sm:text-sm font-black text-emerald-900 mt-0.5 block">
            {formatRupiah(totalIncomeSemester)}
          </span>
        </div>
        <div className="p-3 bg-rose-50/70 border border-rose-100 rounded-xl">
          <span className="text-[10px] font-bold text-rose-700 uppercase tracking-wider block">
            Total Pengeluaran
          </span>
          <span className="text-xs sm:text-sm font-black text-rose-900 mt-0.5 block">
            {formatRupiah(totalExpenseSemester)}
          </span>
        </div>
        <div className="p-3 bg-indigo-50/70 border border-indigo-100 rounded-xl">
          <span className="text-[10px] font-bold text-indigo-700 uppercase tracking-wider block">
            Surplus Kas Bersih
          </span>
          <span className="text-xs sm:text-sm font-black text-indigo-900 mt-0.5 block">
            {netSurplus >= 0 ? '+' : ''}{formatRupiah(netSurplus)}
          </span>
        </div>
      </div>
    </div>
  );
};

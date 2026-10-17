import React, { useState } from 'react';
import { TrendingUp, ArrowDownLeft, ArrowUpRight } from 'lucide-react';
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

  // Bulan Semester Gasal (Jul - Des 2026)
  const monthLabels: { [key: string]: string } = {
    '2026-07': 'Jul',
    '2026-08': 'Agu',
    '2026-09': 'Sep',
    '2026-10': 'Okt',
    '2026-11': 'Nov',
    '2026-12': 'Des',
  };

  const monthlyAggregates: MonthlyData[] = Object.keys(monthLabels).map((monthKey) => {
    const monthlyTrx = transactions.filter((t) => t.transactionDate.startsWith(monthKey));
    const income = monthlyTrx
      .filter((t) => t.type === 'pemasukan')
      .reduce((sum, t) => sum + t.amount, 0);
    const expense = monthlyTrx
      .filter((t) => t.type === 'pengeluaran')
      .reduce((sum, t) => sum + t.amount, 0);
    return { key: monthKey, label: monthLabels[monthKey], income, expense, count: monthlyTrx.length };
  });

  const maxVal = Math.max(
    ...monthlyAggregates.map((m) => Math.max(m.income, m.expense)),
    10000000
  );

  const totalIncome = monthlyAggregates.reduce((sum, m) => sum + m.income, 0);
  const totalExpense = monthlyAggregates.reduce((sum, m) => sum + m.expense, 0);
  const netSurplus = totalIncome - totalExpense;

  return (
    <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-5 h-full flex flex-col gap-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2 pb-3 border-b border-slate-100 dark:border-slate-800">
        <div>
          <div className="flex items-center gap-2 mb-0.5">
            <div className="w-6 h-6 rounded-md bg-[#EFF6FF] flex items-center justify-center">
              <TrendingUp className="w-3.5 h-3.5 text-[#2563EB]" />
            </div>
            <h3 className="text-sm font-bold text-[#0F172A] dark:text-white">Arus Kas Bulanan</h3>
          </div>
          <p className="text-[11px] text-[#64748B] pl-8">
            Pemasukan vs pengeluaran kas OSIS · Semester Gasal 2026
          </p>
        </div>
        {/* Legenda */}
        <div className="flex items-center gap-4 text-[11px] shrink-0">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-sm bg-[#2563EB]" />
            <span className="text-[#64748B] font-medium">Pemasukan</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-sm bg-[#E2E8F0]" />
            <span className="text-[#64748B] font-medium">Pengeluaran</span>
          </div>
        </div>
      </div>

      {/* Chart area */}
      <div className="relative flex-1">
        {/* Tooltip */}
        {hoveredMonth && (
          <div className="absolute top-0 right-0 z-10 bg-[#1E3A8A] text-white p-3 rounded-xl text-xs shadow-lg pointer-events-none min-w-[180px]">
            <p className="font-bold border-b border-blue-700 pb-1.5 mb-1.5">
              {hoveredMonth.label} 2026
              <span className="ml-2 text-[10px] font-normal text-blue-300">{hoveredMonth.count} transaksi</span>
            </p>
            <div className="space-y-1 text-[11px]">
              <div className="flex justify-between gap-4">
                <span className="text-blue-300">Pemasukan</span>
                <span className="font-bold">{formatRupiah(hoveredMonth.income)}</span>
              </div>
              <div className="flex justify-between gap-4">
                <span className="text-slate-400">Pengeluaran</span>
                <span className="font-bold">{formatRupiah(hoveredMonth.expense)}</span>
              </div>
              <div className="flex justify-between gap-4 pt-1 border-t border-blue-700">
                <span className="text-blue-200">Net</span>
                <span className={`font-bold ${hoveredMonth.income >= hoveredMonth.expense ? 'text-green-300' : 'text-red-300'}`}>
                  {hoveredMonth.income >= hoveredMonth.expense ? '+' : ''}
                  {formatRupiah(hoveredMonth.income - hoveredMonth.expense)}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Bar chart */}
        <div className="h-48 flex items-end gap-2 sm:gap-3 border-b border-slate-200 dark:border-slate-700">
          {monthlyAggregates.map((data) => {
            const incomeH = Math.max((data.income / maxVal) * 100, data.income > 0 ? 5 : 2);
            const expenseH = Math.max((data.expense / maxVal) * 100, data.expense > 0 ? 5 : 2);
            const isHovered = hoveredMonth?.key === data.key;

            return (
              <div
                key={data.key}
                onMouseEnter={() => setHoveredMonth(data)}
                onMouseLeave={() => setHoveredMonth(null)}
                className="flex-1 flex flex-col items-center h-full justify-end cursor-pointer group"
              >
                <div className="w-full flex items-end justify-center gap-1 h-full pb-0.5">
                  {/* Income bar – biru */}
                  <div
                    style={{ height: `${incomeH}%` }}
                    className={`w-[40%] max-w-[16px] rounded-t-md transition-all duration-200 ${
                      data.income > 0
                        ? isHovered
                          ? 'bg-[#1d4ed8]'
                          : 'bg-[#2563EB] group-hover:bg-[#1d4ed8]'
                        : 'bg-[#EFF6FF] dark:bg-slate-800'
                    }`}
                  />
                  {/* Expense bar – abu muda (track) */}
                  <div
                    style={{ height: `${expenseH}%` }}
                    className={`w-[40%] max-w-[16px] rounded-t-md transition-all duration-200 ${
                      data.expense > 0
                        ? isHovered
                          ? 'bg-[#94a3b8]'
                          : 'bg-[#CBD5E1] group-hover:bg-[#94a3b8] dark:bg-slate-600'
                        : 'bg-[#F8FAFC] dark:bg-slate-800'
                    }`}
                  />
                </div>
                <span className={`text-[11px] font-semibold mt-1.5 ${
                  isHovered ? 'text-[#2563EB]' : 'text-[#64748B]'
                }`}>
                  {data.label}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Summary pills */}
      <div className="grid grid-cols-3 gap-2.5">
        <div className="p-2.5 rounded-xl bg-[#EFF6FF] border border-blue-100">
          <div className="flex items-center gap-1 mb-1">
            <ArrowDownLeft className="w-3 h-3 text-[#2563EB]" />
            <span className="text-[9px] font-bold text-[#2563EB] uppercase tracking-wide">Pemasukan</span>
          </div>
          <span className="text-xs font-extrabold text-[#1E3A8A] block">{formatRupiah(totalIncome)}</span>
        </div>
        <div className="p-2.5 rounded-xl bg-[#F8FAFC] border border-slate-200">
          <div className="flex items-center gap-1 mb-1">
            <ArrowUpRight className="w-3 h-3 text-[#64748B]" />
            <span className="text-[9px] font-bold text-[#64748B] uppercase tracking-wide">Pengeluaran</span>
          </div>
          <span className="text-xs font-extrabold text-[#0F172A] dark:text-white block">{formatRupiah(totalExpense)}</span>
        </div>
        <div className="p-2.5 rounded-xl bg-[#EFF6FF] border border-blue-100">
          <span className="text-[9px] font-bold text-[#2563EB] uppercase tracking-wide block mb-1">Surplus Bersih</span>
          <span className={`text-xs font-extrabold block ${netSurplus >= 0 ? 'text-[#16A34A]' : 'text-[#DC2626]'}`}>
            {netSurplus >= 0 ? '+' : ''}{formatRupiah(netSurplus)}
          </span>
        </div>
      </div>
    </div>
  );
};

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
    <div className="simo-card p-6 h-full flex flex-col gap-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 pb-4 border-b border-[#E6DFD0] dark:border-[#283D56]">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <div className="w-8 h-8 rounded-[10px] bg-[#E4EAF2] dark:bg-[#1F3A5F]/40 flex items-center justify-center">
              <TrendingUp className="w-4 h-4 text-[#1F3A5F] dark:text-[#FAF6EE]" />
            </div>
            <h3 className="text-[17px] font-extrabold text-[#1F3A5F] dark:text-[#FAF6EE]">
              Arus Kas Bulanan
            </h3>
          </div>
          <p className="text-[14px] text-[#5A6472] dark:text-[#9AA8B8] pl-10">
            Pemasukan vs pengeluaran kas OSIS · Semester Gasal 2026
          </p>
        </div>
        {/* Legenda */}
        <div className="flex items-center gap-4 text-[14px] shrink-0 pt-1">
          <div className="flex items-center gap-2">
            <span className="w-3.5 h-3.5 rounded-[4px] bg-[#1F3A5F] dark:bg-[#E4EAF2]" />
            <span className="text-[#5A6472] dark:text-[#9AA8B8] font-semibold">Pemasukan</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3.5 h-3.5 rounded-[4px] bg-[#F2B544]" />
            <span className="text-[#5A6472] dark:text-[#9AA8B8] font-semibold">Pengeluaran</span>
          </div>
        </div>
      </div>

      {/* Chart area */}
      <div className="relative flex-1">
        {/* Tooltip */}
        {hoveredMonth && (
          <div className="absolute top-0 right-0 z-10 bg-[#1F3A5F] text-[#FAF6EE] p-4 rounded-[14px] text-[14px] border border-[#283D56] pointer-events-none min-w-[200px]">
            <p className="font-extrabold border-b border-[#283D56] pb-2 mb-2 flex items-center justify-between">
              <span>{hoveredMonth.label} 2026</span>
              <span className="text-[12px] font-normal text-[#E4EAF2]">{hoveredMonth.count} transaksi</span>
            </p>
            <div className="space-y-1.5 text-[13px]">
              <div className="flex justify-between gap-4">
                <span className="text-[#E4EAF2]">Pemasukan</span>
                <span className="font-bold">{formatRupiah(hoveredMonth.income)}</span>
              </div>
              <div className="flex justify-between gap-4">
                <span className="text-[#F2B544]">Pengeluaran</span>
                <span className="font-bold">{formatRupiah(hoveredMonth.expense)}</span>
              </div>
              <div className="flex justify-between gap-4 pt-1.5 border-t border-[#283D56]">
                <span className="text-[#FAF6EE]">Net</span>
                <span className="font-bold text-[#F2B544]">
                  {hoveredMonth.income >= hoveredMonth.expense ? '+' : ''}
                  {formatRupiah(hoveredMonth.income - hoveredMonth.expense)}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Bar chart */}
        <div className="h-52 flex items-end gap-3 sm:gap-4 border-b border-[#E6DFD0] dark:border-[#283D56]">
          {monthlyAggregates.map((data) => {
            const incomeH = Math.max((data.income / maxVal) * 100, data.income > 0 ? 6 : 2);
            const expenseH = Math.max((data.expense / maxVal) * 100, data.expense > 0 ? 6 : 2);
            const isHovered = hoveredMonth?.key === data.key;

            return (
              <div
                key={data.key}
                onMouseEnter={() => setHoveredMonth(data)}
                onMouseLeave={() => setHoveredMonth(null)}
                className="flex-1 flex flex-col items-center h-full justify-end cursor-pointer group"
              >
                <div className="w-full flex items-end justify-center gap-1.5 h-full pb-1">
                  {/* Income bar – Deep Blue */}
                  <div
                    style={{ height: `${incomeH}%` }}
                    className={`w-[45%] max-w-[20px] rounded-t-[6px] transition-all duration-200 ${
                      data.income > 0
                        ? isHovered
                          ? 'bg-[#152741]'
                          : 'bg-[#1F3A5F] group-hover:bg-[#152741] dark:bg-[#E4EAF2] dark:group-hover:bg-white'
                        : 'bg-[#E4EAF2]/50 dark:bg-[#283D56]'
                    }`}
                  />
                  {/* Expense bar – Amber */}
                  <div
                    style={{ height: `${expenseH}%` }}
                    className={`w-[45%] max-w-[20px] rounded-t-[6px] transition-all duration-200 ${
                      data.expense > 0
                        ? isHovered
                          ? 'bg-[#d89f36]'
                          : 'bg-[#F2B544] group-hover:bg-[#d89f36]'
                        : 'bg-[#FBEBC8]/50 dark:bg-[#283D56]'
                    }`}
                  />
                </div>
                <span className={`text-[13px] font-bold mt-2 ${
                  isHovered ? 'text-[#1F3A5F] dark:text-[#F2B544]' : 'text-[#5A6472] dark:text-[#9AA8B8]'
                }`}>
                  {data.label}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Summary pills */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="p-3.5 rounded-[14px] bg-[#E4EAF2] dark:bg-[#1F3A5F]/30 border border-[#E6DFD0] dark:border-[#283D56]">
          <div className="flex items-center gap-1.5 mb-1">
            <ArrowDownLeft className="w-4 h-4 text-[#1F3A5F] dark:text-[#FAF6EE]" />
            <span className="text-[13px] font-bold text-[#1F3A5F] dark:text-[#FAF6EE]">Total Pemasukan</span>
          </div>
          <span className="text-[15px] font-extrabold text-[#1F3A5F] dark:text-[#FAF6EE] block">
            {formatRupiah(totalIncome)}
          </span>
        </div>

        <div className="p-3.5 rounded-[14px] bg-[#FBEBC8] dark:bg-[#F2B544]/20 border border-[#E6DFD0] dark:border-[#283D56]">
          <div className="flex items-center gap-1.5 mb-1">
            <ArrowUpRight className="w-4 h-4 text-[#1F3A5F] dark:text-[#FAF6EE]" />
            <span className="text-[13px] font-bold text-[#1F3A5F] dark:text-[#FAF6EE]">Total Pengeluaran</span>
          </div>
          <span className="text-[15px] font-extrabold text-[#1F3A5F] dark:text-[#FAF6EE] block">
            {formatRupiah(totalExpense)}
          </span>
        </div>

        <div className="p-3.5 rounded-[14px] bg-[#FAF6EE] dark:bg-[#17293E] border border-[#E6DFD0] dark:border-[#283D56]">
          <div className="flex items-center gap-1.5 mb-1">
            <TrendingUp className="w-4 h-4 text-[#1F3A5F] dark:text-[#F2B544]" />
            <span className="text-[13px] font-bold text-[#1F3A5F] dark:text-[#FAF6EE]">Surplus Bersih</span>
          </div>
          <span className="text-[15px] font-extrabold text-[#1F3A5F] dark:text-[#FAF6EE] block">
            {netSurplus >= 0 ? '+' : ''}{formatRupiah(netSurplus)}
          </span>
        </div>
      </div>
    </div>
  );
};

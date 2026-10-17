import React from 'react';
import { ArrowUpRight, ArrowDownLeft, Clock, MoreHorizontal } from 'lucide-react';
import { CashTransaction } from '../../types';
import { formatRupiah, formatDateIndo } from '../../lib/utils';

interface RecentActivityTimelineProps {
  transactions: CashTransaction[];
  onViewAll?: () => void;
  maxItems?: number;
}

export const RecentActivityTimeline: React.FC<RecentActivityTimelineProps> = ({
  transactions,
  onViewAll,
  maxItems = 5,
}) => {
  const displayItems = transactions.slice(0, maxItems);

  const formatCategory = (cat: string) => {
    return cat.replace('_', ' ').replace(/\b\w/g, (l) => l.toUpperCase());
  };

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 p-5 shadow-2xs h-full flex flex-col justify-between">
      <div>
        {/* Header */}
        <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-100 dark:border-slate-800">
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">Aktivitas Kas Terbaru</h3>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">Mutasi arus kas & bukti transaksi</p>
          </div>
          {onViewAll ? (
            <button
              onClick={onViewAll}
              className="text-xs font-bold text-[#2563EB] hover:text-blue-700 dark:text-blue-400 flex items-center gap-1 cursor-pointer transition-colors"
            >
              Lihat Semua
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          ) : (
            <div className="text-slate-400">
              <MoreHorizontal className="w-4 h-4" />
            </div>
          )}
        </div>

        {/* Timeline Items */}
        {displayItems.length === 0 ? (
          <div className="py-8 text-center text-xs text-slate-400">
            Belum ada aktivitas transaksi kas tercatat.
          </div>
        ) : (
          <div className="relative pl-5 space-y-4 pt-1">
            {/* Continuous Vertical Timeline Line */}
            <div className="absolute left-[7px] top-2 bottom-3 w-0.5 bg-slate-200 dark:bg-slate-800" />

            {displayItems.map((trx, idx) => {
              const isIncome = trx.type === 'pemasukan';
              const isLast = idx === displayItems.length - 1;

              return (
                <div key={trx.id} className="relative flex items-start justify-between gap-3 group">
                  {/* Timeline Dot Node */}
                  <div
                    className={`absolute -left-5 top-1 w-3.5 h-3.5 rounded-full border-2 border-white dark:border-slate-900 flex items-center justify-center transition-transform group-hover:scale-125 z-10 ${
                      isIncome
                        ? 'bg-[#2563EB] ring-4 ring-blue-50 dark:ring-blue-950/80'
                        : 'bg-slate-400 dark:bg-slate-500 ring-4 ring-slate-100 dark:ring-slate-800'
                    }`}
                  />

                  {/* Transaction Details */}
                  <div className="min-w-0 pr-2">
                    <p className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate group-hover:text-[#2563EB] dark:group-hover:text-blue-400 transition-colors">
                      {trx.description}
                    </p>
                    <div className="flex items-center gap-1.5 mt-0.5 text-[11px] text-slate-400 dark:text-slate-500">
                      <Clock className="w-3 h-3 shrink-0" />
                      <span>{formatDateIndo(trx.transactionDate)}</span>
                      <span>•</span>
                      <span className="truncate">{formatCategory(trx.category)}</span>
                    </div>
                  </div>

                  {/* Amount */}
                  <div className="text-right shrink-0">
                    <span
                      className={`text-xs font-black ${
                        isIncome
                          ? 'text-[#2563EB] dark:text-blue-400'
                          : 'text-slate-700 dark:text-slate-300'
                      }`}
                    >
                      {isIncome ? '+' : '-'} {formatRupiah(trx.amount)}
                    </span>
                    <span className="block text-[10px] text-slate-400 uppercase tracking-wider font-semibold">
                      {isIncome ? 'Pemasukan' : 'Pengeluaran'}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Footer Summary */}
      <div className="pt-3 mt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
        <span className="text-[11px]">{transactions.length} mutasi tersimpan</span>
        {onViewAll && (
          <button
            onClick={onViewAll}
            className="text-[11px] font-semibold text-[#2563EB] hover:underline cursor-pointer"
          >
            Buka Buku Kas &rarr;
          </button>
        )}
      </div>
    </div>
  );
};

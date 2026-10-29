import React from 'react';
import { ArrowUpRight, Clock, MoreHorizontal } from 'lucide-react';
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
    <div className="simo-card p-6 h-full flex flex-col justify-between">
      <div>
        {/* Header */}
        <div className="flex items-center justify-between pb-3 mb-4 border-b border-[#E6DFD0] dark:border-[#283D56]">
          <div>
            <h3 className="text-[17px] font-extrabold text-[#1F3A5F] dark:text-[#FAF6EE]">
              Aktivitas Kas Terbaru
            </h3>
            <p className="text-[14px] text-[#5A6472] dark:text-[#9AA8B8]">Mutasi arus kas & bukti transaksi</p>
          </div>
          {onViewAll ? (
            <button
              onClick={onViewAll}
              className="text-[14px] font-bold text-[#1F3A5F] dark:text-[#F2B544] hover:underline flex items-center gap-1 cursor-pointer transition-colors"
            >
              Lihat Semua
              <ArrowUpRight className="w-4 h-4" />
            </button>
          ) : (
            <div className="text-[#5A6472] dark:text-[#9AA8B8]">
              <MoreHorizontal className="w-5 h-5" />
            </div>
          )}
        </div>

        {/* Timeline Items */}
        {displayItems.length === 0 ? (
          <div className="py-8 text-center text-[14px] text-[#5A6472] dark:text-[#9AA8B8]">
            Belum ada aktivitas transaksi kas tercatat.
          </div>
        ) : (
          <div className="relative pl-6 space-y-4 pt-1">
            {/* Continuous Vertical Timeline Line */}
            <div className="absolute left-[9px] top-2 bottom-3 w-[2px] bg-[#E6DFD0] dark:bg-[#283D56]" />

            {displayItems.map((trx) => {
              const isIncome = trx.type === 'pemasukan';

              return (
                <div key={trx.id} className="relative flex items-start justify-between gap-3 group">
                  {/* Timeline Dot Node */}
                  <div
                    className={`absolute -left-6 top-1 w-4 h-4 rounded-full border-2 border-[#FFFDF8] dark:border-[#17293E] flex items-center justify-center transition-transform group-hover:scale-125 z-10 ${
                      isIncome
                        ? 'bg-[#1F3A5F] ring-4 ring-[#E4EAF2] dark:ring-[#1F3A5F]/40'
                        : 'bg-[#F2B544] ring-4 ring-[#FBEBC8] dark:ring-[#F2B544]/30'
                    }`}
                  />

                  {/* Transaction Details */}
                  <div className="min-w-0 pr-2">
                    <p className="text-[15px] font-bold text-[#1F3A5F] dark:text-[#FAF6EE] truncate group-hover:text-[#1F3A5F] dark:group-hover:text-[#F2B544] transition-colors">
                      {trx.description}
                    </p>
                    <div className="flex items-center gap-2 mt-1 text-[13px] text-[#5A6472] dark:text-[#9AA8B8]">
                      <Clock className="w-3.5 h-3.5 shrink-0" />
                      <span>{formatDateIndo(trx.transactionDate)}</span>
                      <span>•</span>
                      <span className="truncate">{formatCategory(trx.category)}</span>
                    </div>
                  </div>

                  {/* Amount */}
                  <div className="text-right shrink-0">
                    <span
                      className={`text-[15px] font-extrabold ${
                        isIncome
                          ? 'text-[#1F3A5F] dark:text-[#FAF6EE]'
                          : 'text-[#5A6472] dark:text-[#F2B544]'
                      }`}
                    >
                      {isIncome ? '+' : '-'} {formatRupiah(trx.amount)}
                    </span>
                    <span className="block text-[12px] text-[#5A6472] dark:text-[#9AA8B8] font-semibold">
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
      <div className="pt-3.5 mt-5 border-t border-[#E6DFD0] dark:border-[#283D56] flex items-center justify-between text-[14px] text-[#5A6472] dark:text-[#9AA8B8]">
        <span>{transactions.length} mutasi tersimpan</span>
        {onViewAll && (
          <button
            onClick={onViewAll}
            className="text-[14px] font-bold text-[#1F3A5F] dark:text-[#F2B544] hover:underline cursor-pointer"
          >
            Buka Buku Kas &rarr;
          </button>
        )}
      </div>
    </div>
  );
};

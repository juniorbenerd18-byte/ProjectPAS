import React, { useState } from 'react';
import {
  Calendar,
  Clock,
  MapPin,
  CheckCircle2,
  AlertCircle,
  Tag,
  Sparkles,
  ChevronRight,
  Flag,
} from 'lucide-react';
import { PortalTimelineEvent } from '../../data/portalData';

interface PortalTimelineProps {
  events: PortalTimelineEvent[];
}

export const PortalTimeline: React.FC<PortalTimelineProps> = ({ events }) => {
  const [filterStatus, setFilterStatus] = useState<string>('ALL');

  const filteredEvents = events.filter((ev) => {
    if (filterStatus === 'ALL') return true;
    return ev.status === filterStatus;
  });

  const getStatusColor = (status: PortalTimelineEvent['status']) => {
    switch (status) {
      case 'Sedang Berlangsung':
        return {
          pill: 'bg-amber-100 dark:bg-amber-950/80 text-amber-700 dark:text-amber-400 border-amber-300 dark:border-amber-800',
          dot: 'bg-amber-500 ring-4 ring-amber-400/20',
          pulse: true,
        };
      case 'Mendatang':
        return {
          pill: 'bg-blue-100 dark:bg-blue-950/80 text-blue-700 dark:text-blue-300 border-blue-300 dark:border-blue-800',
          dot: 'bg-blue-600 ring-4 ring-blue-500/20',
          pulse: false,
        };
      case 'Selesai':
      default:
        return {
          pill: 'bg-emerald-100 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-400 border-emerald-300 dark:border-emerald-800',
          dot: 'bg-emerald-500 ring-4 ring-emerald-400/20',
          pulse: false,
        };
    }
  };

  return (
    <section id="linimasa" className="py-16 bg-white dark:bg-slate-950 border-b border-slate-200/80 dark:border-slate-800 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        {/* Header & Filter Controls */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-100 dark:bg-amber-950/80 text-amber-700 dark:text-amber-400 text-xs font-bold uppercase tracking-wider mb-2">
              <Calendar className="w-3.5 h-3.5" />
              <span>Agenda &amp; Jadwal</span>
            </div>
            <h2 className="font-heading text-2xl sm:text-3xl md:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              Linimasa Kegiatan Sekolah
            </h2>
            <p className="mt-1 text-sm sm:text-base text-slate-600 dark:text-slate-400 max-w-2xl">
              Jadwal pelaksanaan program kerja dan aktivitas organisasi yang terencana secara berkala sepanjang tahun ajaran.
            </p>
          </div>

          {/* Filter Tabs */}
          <div className="flex items-center gap-1.5 p-1 bg-slate-100 dark:bg-slate-900 rounded-xl border border-slate-200/80 dark:border-slate-800 self-start md:self-auto">
            <button
              onClick={() => setFilterStatus('ALL')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                filterStatus === 'ALL'
                  ? 'bg-white dark:bg-slate-800 text-blue-600 dark:text-blue-400 shadow-2xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              Semua ({events.length})
            </button>
            <button
              onClick={() => setFilterStatus('Mendatang')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                filterStatus === 'Mendatang'
                  ? 'bg-white dark:bg-slate-800 text-blue-600 dark:text-blue-400 shadow-2xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              Mendatang
            </button>
            <button
              onClick={() => setFilterStatus('Sedang Berlangsung')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                filterStatus === 'Sedang Berlangsung'
                  ? 'bg-white dark:bg-slate-800 text-blue-600 dark:text-blue-400 shadow-2xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              Berlangsung
            </button>
            <button
              onClick={() => setFilterStatus('Selesai')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                filterStatus === 'Selesai'
                  ? 'bg-white dark:bg-slate-800 text-blue-600 dark:text-blue-400 shadow-2xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              Selesai
            </button>
          </div>
        </div>

        {/* Vertical Timeline Tree */}
        <div className="relative pl-4 sm:pl-8 lg:pl-10">
          {/* Central connecting vertical line */}
          <div className="absolute top-4 bottom-4 left-4 sm:left-8 lg:left-10 w-0.5 bg-gradient-to-b from-blue-500 via-amber-500 to-emerald-500 opacity-40 dark:opacity-30 -translate-x-1/2" />

          <div className="space-y-8">
            {filteredEvents.map((event, index) => {
              const statusStyle = getStatusColor(event.status);

              return (
                <div key={event.id} className="relative group">
                  {/* Timeline Node Dot */}
                  <div
                    className={`absolute -left-4 sm:-left-8 lg:-left-10 top-5 -translate-x-1/2 w-4 h-4 rounded-full ${statusStyle.dot} transition-transform duration-300 group-hover:scale-125 z-10 flex items-center justify-center`}
                  >
                    {statusStyle.pulse && (
                      <span className="w-2 h-2 rounded-full bg-white animate-ping" />
                    )}
                  </div>

                  {/* Event Content Card */}
                  <div
                    className={`ml-5 sm:ml-8 rounded-2xl p-5 sm:p-6 border transition-all duration-300 backdrop-blur-sm ${
                      event.isHighlighted
                        ? 'bg-gradient-to-br from-blue-50/90 via-white to-amber-50/40 dark:from-slate-900 dark:via-slate-900 dark:to-slate-850 border-amber-300/80 dark:border-amber-500/40 shadow-lg'
                        : 'bg-slate-50/80 dark:bg-slate-900/70 border-slate-200/80 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 shadow-xs hover:shadow-md'
                    }`}
                  >
                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                      <div className="space-y-1.5">
                        <div className="flex items-center gap-2 flex-wrap">
                          {/* Status Pill */}
                          <span
                            className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold border ${statusStyle.pill}`}
                          >
                            <span>{event.status}</span>
                          </span>

                          {/* Category Tag */}
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-slate-200/70 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                            <Tag className="w-3 h-3 text-slate-400" />
                            <span>{event.category}</span>
                          </span>

                          {/* Highlight Badge */}
                          {event.isHighlighted && (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-500 text-white shadow-2xs">
                              <Sparkles className="w-3 h-3" />
                              <span>Agenda Akbar</span>
                            </span>
                          )}
                        </div>

                        {/* Title */}
                        <h3 className="font-heading font-extrabold text-base sm:text-lg text-slate-900 dark:text-white pt-1 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                          {event.title}
                        </h3>

                        {/* Description */}
                        <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed max-w-3xl">
                          {event.description}
                        </p>
                      </div>

                      {/* Date & Day Badge */}
                      <div className="sm:text-right shrink-0 bg-white/80 dark:bg-slate-800/80 p-3 rounded-xl border border-slate-200/60 dark:border-slate-700/60 self-start">
                        <div className="flex sm:flex-col items-center sm:items-end justify-between gap-2 sm:gap-0">
                          <p className="font-heading text-sm font-extrabold text-blue-600 dark:text-blue-400">
                            {event.date}
                          </p>
                          <p className="text-[11px] font-medium text-slate-400">
                            {event.dayName}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Metadata Footer: Time, Location, Division */}
                    <div className="mt-4 pt-3.5 border-t border-slate-200/60 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-500 dark:text-slate-400">
                      <div className="flex flex-wrap items-center gap-4">
                        <span className="flex items-center gap-1.5 font-medium">
                          <Clock className="w-3.5 h-3.5 text-blue-500" />
                          <span>{event.time}</span>
                        </span>
                        <span className="flex items-center gap-1.5 font-medium">
                          <MapPin className="w-3.5 h-3.5 text-rose-500" />
                          <span>{event.location}</span>
                        </span>
                      </div>

                      <div className="flex items-center gap-1.5 font-bold text-slate-700 dark:text-slate-300">
                        <Flag className="w-3.5 h-3.5 text-amber-500" />
                        <span>{event.divisionName}</span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
};

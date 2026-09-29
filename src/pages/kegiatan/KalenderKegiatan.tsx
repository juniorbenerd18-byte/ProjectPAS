import React from 'react';
import { Calendar as CalendarIcon, Clock, MapPin, Tag, CheckCircle2 } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { formatDateIndo } from '../../lib/utils';

export const KalenderKegiatan: React.FC = () => {
  const { events, meetings } = useApp();

  // Combine events and meetings for complete timeline
  const timelineItems = [
    ...events.map((e) => ({
      id: e.id,
      title: e.title,
      date: e.eventDate,
      time: `${e.startTime} - ${e.endTime}`,
      location: e.location,
      type: 'Kegiatan Proker',
      isEvent: true,
    })),
    ...meetings.map((m) => ({
      id: m.id,
      title: m.title,
      date: m.meetingDate,
      time: `${m.startTime} - ${m.endTime}`,
      location: m.location,
      type: `Rapat ${m.type.toUpperCase()}`,
      isEvent: false,
    })),
  ].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-2xs">
        <h2 className="text-base font-bold text-slate-900">Kalender & Agenda Kegiatan</h2>
        <p className="text-xs text-slate-500">
          Jadwal kronologis seluruh event, proker lapangan, dan rapat koordinasi OSIS SMK
        </p>
      </div>

      {/* Timeline View */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-2xs">
        <div className="relative border-l-2 border-slate-200 ml-4 space-y-8 pl-6">
          {timelineItems.map((item) => (
            <div key={item.id} className="relative group">
              {/* Dot on Timeline */}
              <div
                className={`absolute -left-[31px] top-1 w-4 h-4 rounded-full border-2 border-white shadow-xs ${
                  item.isEvent ? 'bg-indigo-600' : 'bg-emerald-600'
                }`}
              />

              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/70 group-hover:border-indigo-300 transition-all">
                <div className="flex flex-wrap items-center justify-between gap-2 mb-1.5">
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${
                      item.isEvent
                        ? 'bg-indigo-100 text-indigo-800'
                        : 'bg-emerald-100 text-emerald-800'
                    }`}
                  >
                    {item.type}
                  </span>
                  <span className="text-xs font-bold text-slate-600 flex items-center gap-1.5">
                    <CalendarIcon className="w-3.5 h-3.5 text-slate-400" />
                    {formatDateIndo(item.date)}
                  </span>
                </div>

                <h3 className="text-sm font-bold text-slate-900">{item.title}</h3>

                <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500 mt-2">
                  <span className="flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-slate-400" />
                    {item.time} WIB
                  </span>
                  <span className="flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-slate-400" />
                    {item.location}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

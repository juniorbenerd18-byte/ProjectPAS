import React from 'react';
import { Calendar, Clock, MapPin, QrCode, ArrowRight } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { formatDateIndo } from '../../lib/utils';

export const KegiatanMendatang: React.FC = () => {
  const { events, setActivePage } = useApp();

  const upcomingEvents = events.filter((e) => e.status === 'mendatang');

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-2xs">
        <h2 className="text-base font-bold text-slate-900">Kegiatan Mendatang</h2>
        <p className="text-xs text-slate-500">
          Agenda event proker yang akan segera diselenggarakan oleh OSIS SMK ({upcomingEvents.length} Event)
        </p>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {upcomingEvents.map((evt) => (
          <div
            key={evt.id}
            className="bg-white rounded-2xl border border-slate-200/80 shadow-2xs overflow-hidden flex flex-col justify-between"
          >
            {evt.documentationPhotos[0] && (
              <div className="h-44 w-full overflow-hidden bg-slate-100">
                <img
                  src={evt.documentationPhotos[0]}
                  alt={evt.title}
                  className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                />
              </div>
            )}

            <div className="p-5 space-y-3 flex-1 flex flex-col justify-between">
              <div>
                <span className="text-[10px] font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-full uppercase">
                  {evt.workProgramTitle || 'Event Organisasi'}
                </span>
                <h3 className="text-sm font-bold text-slate-900 mt-2">{evt.title}</h3>
                <p className="text-xs text-slate-600 mt-1 leading-relaxed line-clamp-2">
                  {evt.description}
                </p>
              </div>

              <div className="space-y-1.5 pt-3 border-t border-slate-100 text-xs text-slate-500">
                <p className="flex items-center gap-2">
                  <Calendar className="w-3.5 h-3.5 text-slate-400" />
                  <strong className="text-slate-700">{formatDateIndo(evt.eventDate)}</strong>
                </p>
                <p className="flex items-center gap-2">
                  <Clock className="w-3.5 h-3.5 text-slate-400" />
                  <span>{evt.startTime} - {evt.endTime} WIB</span>
                </p>
                <p className="flex items-center gap-2">
                  <MapPin className="w-3.5 h-3.5 text-slate-400" />
                  <span>{evt.location}</span>
                </p>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                <span className="text-[10px] font-mono text-slate-400">Kode: {evt.qrToken}</span>
                <button
                  onClick={() => setActivePage('rapat-absensi')}
                  className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-xs"
                >
                  <QrCode className="w-3.5 h-3.5" />
                  <span>Buka Presensi QR</span>
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

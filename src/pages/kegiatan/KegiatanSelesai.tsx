import React from 'react';
import { CheckCircle2, Calendar, MapPin, Camera } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { formatDateIndo } from '../../lib/utils';

export const KegiatanSelesai: React.FC = () => {
  const { events, setActivePage } = useApp();

  const completedEvents = events.filter((e) => e.status === 'selesai');

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-2xs">
        <h2 className="text-base font-bold text-slate-900">Kegiatan Terlaksana (Selesai)</h2>
        <p className="text-xs text-slate-500">
          Arsip program kerja dan acara OSIS yang telah sukses diselenggarakan ({completedEvents.length} Acara)
        </p>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {completedEvents.map((evt) => (
          <div
            key={evt.id}
            className="bg-white rounded-2xl border border-slate-200/80 shadow-2xs overflow-hidden flex flex-col justify-between"
          >
            {evt.documentationPhotos[0] && (
              <div className="h-44 w-full overflow-hidden bg-slate-100">
                <img
                  src={evt.documentationPhotos[0]}
                  alt={evt.title}
                  className="w-full h-full object-cover"
                />
              </div>
            )}

            <div className="p-5 space-y-3 flex-1 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold text-slate-500 uppercase">
                    {evt.workProgramTitle || 'Event Organisasi'}
                  </span>
                  <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    Terlaksana
                  </span>
                </div>
                <h3 className="text-sm font-bold text-slate-900 mt-2">{evt.title}</h3>
                <p className="text-xs text-slate-600 mt-1 leading-relaxed line-clamp-2">
                  {evt.description}
                </p>
              </div>

              <div className="space-y-1 pt-3 border-t border-slate-100 text-xs text-slate-500">
                <p className="flex items-center gap-2">
                  <Calendar className="w-3.5 h-3.5 text-slate-400" />
                  <span>{formatDateIndo(evt.eventDate)}</span>
                </p>
                <p className="flex items-center gap-2">
                  <MapPin className="w-3.5 h-3.5 text-slate-400" />
                  <span>{evt.location}</span>
                </p>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                <span className="text-[11px] text-slate-500">
                  {evt.documentationPhotos.length} Foto Dokumentasi
                </span>
                <button
                  onClick={() => setActivePage('kegiatan-dokumentasi')}
                  className="text-xs font-bold text-indigo-600 hover:text-indigo-700 flex items-center gap-1 cursor-pointer"
                >
                  <Camera className="w-3.5 h-3.5" />
                  <span>Lihat Galeri</span>
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

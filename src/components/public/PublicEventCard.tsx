import React from 'react';
import { Calendar, Clock, MapPin, ArrowRight } from 'lucide-react';

export interface PublicEventCardData {
  id: string;
  title: string;
  date: string;
  time?: string;
  location: string;
  category?: string;
  photoUrl?: string;
  description?: string;
}

interface PublicEventCardProps {
  event: PublicEventCardData;
  onRegister?: (eventId: string) => void;
}

export const PublicEventCard: React.FC<PublicEventCardProps> = ({
  event,
  onRegister,
}) => {
  return (
    <div className="bg-white border border-[#E2E8F0] rounded-xl overflow-hidden shadow-sm flex flex-col h-full hover:border-[#2563EB]/40 transition-all duration-200 group">
      {/* Gambar Kegiatan */}
      <div className="relative aspect-16/9 bg-slate-100 overflow-hidden">
        <img
          src={
            event.photoUrl ||
            'https://images.unsplash.com/photo-1544717305-2782549b5136?w=800&auto=format&fit=crop&q=80'
          }
          alt={event.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        />
        {event.category && (
          <div className="absolute top-3 left-3 px-2.5 py-1 bg-white/95 backdrop-blur-sm rounded-md text-[11px] font-bold text-[#2563EB] shadow-xs">
            {event.category}
          </div>
        )}
      </div>

      {/* Konten Kegiatan */}
      <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
        <div className="space-y-2.5">
          <div className="flex items-center gap-3 text-xs text-[#64748B]">
            <span className="inline-flex items-center gap-1 font-semibold text-[#0F172A]">
              <Calendar className="w-3.5 h-3.5 text-[#2563EB]" />
              {event.date}
            </span>
            {event.time && (
              <span className="inline-flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-[#64748B]" />
                {event.time}
              </span>
            )}
          </div>

          <h3 className="text-base font-bold text-[#1E3A8A] group-hover:text-[#2563EB] transition-colors line-clamp-2">
            {event.title}
          </h3>

          <div className="flex items-center gap-1.5 text-xs text-[#64748B]">
            <MapPin className="w-3.5 h-3.5 text-[#64748B] shrink-0" />
            <span className="truncate">{event.location}</span>
          </div>

          {event.description && (
            <p className="text-xs text-[#64748B] line-clamp-2 leading-relaxed pt-1">
              {event.description}
            </p>
          )}
        </div>

        {/* Tombol Aksi "Daftar" */}
        <div className="pt-2 border-t border-[#E2E8F0]/70 flex items-center justify-between">
          <span className="text-[11px] text-[#64748B] font-medium">Terbuka untuk Umum</span>
          <button
            onClick={() => onRegister && onRegister(event.id)}
            className="px-3.5 py-1.5 text-xs font-bold text-white bg-[#2563EB] hover:bg-blue-700 rounded-lg shadow-xs transition-colors flex items-center gap-1 cursor-pointer"
          >
            Daftar
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};

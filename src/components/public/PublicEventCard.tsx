import React from 'react';
import { Calendar, Clock, MapPin, ArrowRight, CheckCircle2, Info } from 'lucide-react';

export interface PublicEventCardData {
  id: string;
  title: string;
  date: string;
  time?: string;
  location: string;
  category?: string;
  photoUrl?: string;
  description?: string;
  requiresRegistration?: boolean;
}

interface PublicEventCardProps {
  event: PublicEventCardData;
  onRegister?: (eventId: string) => void;
  onDetail?: (eventId: string) => void;
}

export const PublicEventCard: React.FC<PublicEventCardProps> = ({
  event,
  onRegister,
  onDetail,
}) => {
  return (
    <div className="bg-[#FFFDF8] border border-[#E6DFD0] rounded-xl overflow-hidden shadow-xs flex flex-col h-full hover:border-[#1F3A5F] transition-all duration-200 group">
      {/* Gambar Kegiatan */}
      <div className="relative aspect-16/9 bg-[#E4EAF2] overflow-hidden">
        <img
          src={
            event.photoUrl ||
            'https://images.unsplash.com/photo-1544717305-2782549b5136?w=800&auto=format&fit=crop&q=80'
          }
          alt={event.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        />
        {event.category && (
          <div className="absolute top-3 left-3 px-2.5 py-1 bg-[#FBEBC8] backdrop-blur-sm rounded-md text-[11px] font-bold text-[#7A4B00] border border-[#F2B544]/40 shadow-2xs">
            {event.category}
          </div>
        )}
      </div>

      {/* Konten Kegiatan */}
      <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
        <div className="space-y-2.5">
          <div className="flex items-center gap-3 text-xs text-[#5A6472]">
            <span className="inline-flex items-center gap-1 font-semibold text-[#1F3A5F]">
              <Calendar className="w-3.5 h-3.5 text-[#1F3A5F]" />
              {event.date}
            </span>
            {event.time && (
              <span className="inline-flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-[#5A6472]" />
                {event.time}
              </span>
            )}
          </div>

          <h3 className="text-base font-bold text-[#1F3A5F] group-hover:text-[#162B46] transition-colors line-clamp-2">
            {event.title}
          </h3>

          <div className="flex items-center gap-1.5 text-xs text-[#5A6472]">
            <MapPin className="w-3.5 h-3.5 text-[#5A6472] shrink-0" />
            <span className="truncate">{event.location}</span>
          </div>

          {event.description && (
            <p className="text-xs text-[#5A6472] line-clamp-2 leading-relaxed pt-1">
              {event.description}
            </p>
          )}
        </div>

        {/* Tombol Aksi & Status Akses Kegiatan */}
        <div className="pt-3 border-t border-[#E6DFD0]/70 flex items-center justify-between gap-2">
          {event.requiresRegistration ? (
            <>
              <span className="inline-flex items-center gap-1.5 text-[11px] font-bold text-[#7A4B00] bg-[#FBEBC8] px-2.5 py-1 rounded-md border border-[#F2B544]/40">
                <span className="w-1.5 h-1.5 rounded-full bg-[#F2B544] animate-pulse" />
                Wajib Daftar
              </span>
              <button
                onClick={() => onRegister && onRegister(event.id)}
                className="px-3.5 py-1.5 text-xs font-bold text-[#FAF6EE] bg-[#1F3A5F] hover:bg-[#162B46] rounded-lg shadow-2xs transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                <span>Daftar</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </>
          ) : (
            <>
              <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-md border border-emerald-200">
                <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                Terbuka Bebas
              </span>
              <button
                onClick={() => onDetail && onDetail(event.id)}
                className="px-3 py-1.5 text-xs font-bold text-[#1F3A5F] bg-[#FAF6EE] hover:bg-[#E4EAF2] border border-[#E6DFD0] rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                <Info className="w-3.5 h-3.5 text-[#5A6472]" />
                <span>Info Acara</span>
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

import React, { useState } from 'react';
import { Calendar, Clock, MapPin, QrCode, ArrowRight, Ticket, Users, Phone, Printer, Download } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { formatDateIndo } from '../../lib/utils';
import { Modal } from '../../components/common/Modal';
import { printTicketDirectly } from '../../lib/ticketPrinter';
import { EventRegistration } from '../../types';

export const KegiatanMendatang: React.FC = () => {
  const { events, eventRegistrations, setActivePage, orgProfile, showToast } = useApp();

  const [selectedEventForRegistrants, setSelectedEventForRegistrants] = useState<string | null>(null);

  const upcomingEvents = events.filter((e) => e.status === 'mendatang');

  // Menghitung pendaftar per kegiatan
  const getRegistrantsForEvent = (eventId: string, eventTitle: string) => {
    return eventRegistrations.filter(
      (r) => r.eventId === eventId || r.eventTitle.toLowerCase().trim() === eventTitle.toLowerCase().trim()
    );
  };

  const activeModalEvent = events.find((e) => e.id === selectedEventForRegistrants);
  const activeRegistrants = activeModalEvent
    ? getRegistrantsForEvent(activeModalEvent.id, activeModalEvent.title)
    : [];

  const handlePrintTicket = async (ticket: EventRegistration) => {
    if (!activeModalEvent) return;
    await printTicketDirectly({
      ticket,
      eventDetails: {
        date: formatDateIndo(activeModalEvent.eventDate),
        time: activeModalEvent.startTime ? `${activeModalEvent.startTime} - ${activeModalEvent.endTime} WIB` : undefined,
        location: activeModalEvent.location,
      },
      orgName: orgProfile.appName || 'SIMO - OSIS',
      schoolName: orgProfile.schoolName || 'SMKN 1 Cerdas Bangsa',
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-base font-bold text-slate-900">Kegiatan Mendatang</h2>
          <p className="text-xs text-slate-500">
            Agenda event proker yang akan segera diselenggarakan oleh OSIS SMK ({upcomingEvents.length} Event • {eventRegistrations.length} Peserta Terdaftar)
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              setActivePage('dashboard');
              setTimeout(() => {
                const el = document.getElementById('widget-pendaftar-kegiatan');
                el?.scrollIntoView({ behavior: 'smooth' });
              }, 100);
            }}
            className="px-3.5 py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer border border-indigo-200 transition-colors"
          >
            <Ticket className="w-4 h-4 text-indigo-600" />
            <span>Rekap Semua Tiket ({eventRegistrations.length})</span>
          </button>
        </div>
      </div>

      {/* Grid Kartu Kegiatan */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {upcomingEvents.map((evt) => {
          const registrants = getRegistrantsForEvent(evt.id, evt.title);

          return (
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
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[10px] font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-full uppercase">
                      {evt.workProgramTitle || 'Event Organisasi'}
                    </span>
                    <button
                      type="button"
                      onClick={() => setSelectedEventForRegistrants(evt.id)}
                      className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full flex items-center gap-1 cursor-pointer transition-colors ${
                        registrants.length > 0
                          ? 'bg-amber-100 text-amber-900 hover:bg-amber-200 border border-amber-300'
                          : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                      }`}
                    >
                      <Ticket className="w-3 h-3 text-amber-600" />
                      <span>{registrants.length} Pendaftar</span>
                    </button>
                  </div>

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

                <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                  <button
                    type="button"
                    onClick={() => setSelectedEventForRegistrants(evt.id)}
                    className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-lg text-xs font-semibold flex items-center gap-1.5 cursor-pointer"
                  >
                    <Users className="w-3.5 h-3.5 text-slate-600" />
                    <span>Peserta ({registrants.length})</span>
                  </button>

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
          );
        })}
      </div>

      {/* MODAL LIHAT DAFTAR PENDAFTAR EVENT TERTENTU */}
      {activeModalEvent && (
        <Modal
          isOpen={Boolean(selectedEventForRegistrants)}
          onClose={() => setSelectedEventForRegistrants(null)}
          title="Daftar Siswa Pendaftar Kegiatan"
          subtitle={`${activeModalEvent.title} (${activeRegistrants.length} Peserta)`}
          maxWidth="lg"
        >
          <div className="space-y-4 py-2">
            {activeRegistrants.length === 0 ? (
              <div className="p-8 text-center rounded-xl border border-dashed border-slate-200 space-y-1">
                <Ticket className="w-8 h-8 text-slate-400 mx-auto" />
                <p className="text-sm font-bold text-slate-800">Belum ada siswa mendaftar kegiatan ini</p>
                <p className="text-xs text-slate-500">
                  Data pendaftar akan otomatis masuk saat siswa mendaftar melalui Portal Publik.
                </p>
              </div>
            ) : (
              <div className="rounded-xl border border-slate-200 overflow-hidden">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase text-[10px]">
                    <tr>
                      <th className="px-3 py-2.5">Kode Tiket</th>
                      <th className="px-3 py-2.5">Nama Peserta</th>
                      <th className="px-3 py-2.5">Kelas &amp; NISN</th>
                      <th className="px-3 py-2.5">WhatsApp</th>
                      <th className="px-3 py-2.5">Waktu Daftar</th>
                      <th className="px-3 py-2.5 text-right">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {activeRegistrants.map((reg) => (
                      <tr key={reg.id} className="hover:bg-slate-50/70">
                        <td className="px-3 py-2.5 font-mono font-bold text-indigo-700">
                          {reg.ticketCode}
                        </td>
                        <td className="px-3 py-2.5 font-bold text-slate-900">
                          {reg.studentName}
                        </td>
                        <td className="px-3 py-2.5 text-slate-600">
                          {reg.classRoom} ({reg.nisn})
                        </td>
                        <td className="px-3 py-2.5">
                          {reg.phone ? (
                            <a
                              href={`https://wa.me/${reg.phone.replace(/[^0-9]/g, '')}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-emerald-700 hover:underline font-semibold flex items-center gap-1"
                            >
                              <Phone className="w-3 h-3" />
                              <span>{reg.phone}</span>
                            </a>
                          ) : (
                            '-'
                          )}
                        </td>
                        <td className="px-3 py-2.5 text-slate-500 text-[11px]">
                          {reg.registeredAt}
                        </td>
                        <td className="px-3 py-2.5 text-right">
                          <button
                            type="button"
                            onClick={() => handlePrintTicket(reg)}
                            className="p-1 rounded text-indigo-600 hover:bg-indigo-50"
                            title="Cetak Tiket"
                          >
                            <Printer className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            <div className="flex justify-end pt-2">
              <button
                type="button"
                onClick={() => setSelectedEventForRegistrants(null)}
                className="px-4 py-2 rounded-lg bg-slate-100 text-slate-700 text-xs font-bold hover:bg-slate-200 cursor-pointer"
              >
                Tutup
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};

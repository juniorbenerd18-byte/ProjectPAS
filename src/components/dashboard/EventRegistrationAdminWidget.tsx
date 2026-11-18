import React, { useState, useMemo } from 'react';
import {
  Ticket,
  Search,
  Filter,
  Download,
  Printer,
  Trash2,
  Phone,
  Calendar,
  Clock,
  MapPin,
  CheckCircle2,
  ExternalLink,
  Users,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { EventRegistration } from '../../types';
import { ScrollReveal } from '../common/ScrollReveal';
import { Modal } from '../common/Modal';
import { printTicketDirectly } from '../../lib/ticketPrinter';
import { generateQRCode } from '../../lib/utils';

export const EventRegistrationAdminWidget: React.FC = () => {
  const {
    eventRegistrations,
    events,
    deleteEventRegistration,
    orgProfile,
    showToast,
  } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedEventFilter, setSelectedEventFilter] = useState('all');
  const [ticketToView, setTicketToView] = useState<EventRegistration | null>(null);
  const [ticketQrUrl, setTicketQrUrl] = useState<string>('');
  const [ticketToDelete, setTicketToDelete] = useState<EventRegistration | null>(null);

  // Daftar unik judul kegiatan untuk dropdown filter
  const eventOptions = useMemo(() => {
    const unique = new Set<string>();
    eventRegistrations.forEach((r) => {
      if (r.eventTitle) unique.add(r.eventTitle);
    });
    return Array.from(unique);
  }, [eventRegistrations]);

  // Filter pendaftar
  const filteredRegistrations = useMemo(() => {
    return eventRegistrations.filter((reg) => {
      const matchSearch =
        reg.studentName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        reg.nisn.toLowerCase().includes(searchQuery.toLowerCase()) ||
        reg.ticketCode.toLowerCase().includes(searchQuery.toLowerCase()) ||
        reg.classRoom.toLowerCase().includes(searchQuery.toLowerCase()) ||
        reg.eventTitle.toLowerCase().includes(searchQuery.toLowerCase());

      const matchEvent =
        selectedEventFilter === 'all' || reg.eventTitle === selectedEventFilter;

      return matchSearch && matchEvent;
    });
  }, [eventRegistrations, searchQuery, selectedEventFilter]);

  // Statistik
  const totalRegistrations = eventRegistrations.length;
  const uniqueEventsCount = eventOptions.length;

  const handleOpenTicketModal = async (ticket: EventRegistration) => {
    setTicketToView(ticket);
    try {
      const payload = JSON.stringify({
        code: ticket.ticketCode,
        nisn: ticket.nisn,
        name: ticket.studentName,
        event: ticket.eventTitle,
      });
      const qr = await generateQRCode(payload);
      setTicketQrUrl(qr);
    } catch (e) {
      console.warn('QR generate error in admin widget:', e);
    }
  };

  const handlePrintSingleTicket = async (ticket: EventRegistration) => {
    const targetEvt = events.find((e) => e.id === ticket.eventId || e.title === ticket.eventTitle);
    await printTicketDirectly({
      ticket,
      eventDetails: {
        date: targetEvt?.eventDate || 'Sesuai Jadwal',
        time: targetEvt?.startTime ? `${targetEvt.startTime} WIB` : undefined,
        location: targetEvt?.location || 'Lokasi Sekolah',
      },
      orgName: orgProfile.appName || 'SIMO - OSIS',
      schoolName: orgProfile.schoolName || 'SMKN 1 Cerdas Bangsa',
    });
  };

  const handleExportCSV = () => {
    if (filteredRegistrations.length === 0) {
      showToast('Tidak ada data pendaftar untuk diekspor.', 'error');
      return;
    }

    const headers = [
      'Kode Tiket',
      'Nama Kegiatan',
      'Nama Lengkap Siswa',
      'NISN',
      'Kelas & Jurusan',
      'No. WhatsApp / HP',
      'Waktu Pendaftaran',
    ];

    const rows = filteredRegistrations.map((r) => [
      `"${r.ticketCode}"`,
      `"${r.eventTitle.replace(/"/g, '""')}"`,
      `"${r.studentName.replace(/"/g, '""')}"`,
      `"${r.nisn}"`,
      `"${r.classRoom}"`,
      `"${r.phone}"`,
      `"${r.registeredAt}"`,
    ]);

    const csvContent = [headers.join(','), ...rows.map((row) => row.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `Pendaftar_Kegiatan_${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    showToast('Data pendaftar kegiatan berhasil diekspor ke CSV!', 'success');
  };

  const confirmDeleteRegistration = () => {
    if (!ticketToDelete) return;
    deleteEventRegistration(ticketToDelete.id);
    setTicketToDelete(null);
  };

  return (
    <>
      <ScrollReveal distance={28} duration={650}>
        <div id="widget-pendaftar-kegiatan" className="bg-[#FFFDF8] dark:bg-[#17293E] rounded-[20px] border border-[#E6DFD0] dark:border-[#283D56] p-6 space-y-6">
          {/* Header Widget */}
          <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4 pb-4 border-b border-[#E6DFD0] dark:border-[#283D56]">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-[12px] bg-[#1F3A5F] text-[#FAF6EE] flex items-center justify-center shrink-0">
                <Ticket className="w-5 h-5 text-[#F2B544]" strokeWidth={2} />
              </div>
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="text-base sm:text-lg font-extrabold text-[#1F3A5F] dark:text-[#FAF6EE]">
                    Pendaftaran Kegiatan Siswa (Tiket Terdaftar)
                  </h3>
                  <span className="inline-flex items-center gap-1.5 text-[12px] font-bold px-2.5 py-0.5 rounded-full bg-[#E4EAF2] text-[#1F3A5F] border border-[#E6DFD0] dark:bg-[#213B5C] dark:text-[#FAF6EE]">
                    <CheckCircle2 className="w-3.5 h-3.5 text-[#1F3A5F] dark:text-[#F2B544]" />
                    <span>{totalRegistrations} Tiket Resmi Terbit</span>
                  </span>
                </div>
                <p className="text-[13px] sm:text-[14px] text-[#5A6472] dark:text-[#9AA8B8] mt-0.5">
                  Daftar siswa yang mendaftar kegiatan mendatang via Portal Publik.
                </p>
              </div>
            </div>

            {/* Quick Action Ekspor CSV */}
            <div className="flex items-center gap-2 self-start sm:self-auto shrink-0">
              <button
                type="button"
                onClick={handleExportCSV}
                className="min-h-[40px] px-3.5 py-2 bg-transparent hover:bg-[#E4EAF2] dark:hover:bg-[#213B5C] text-[#1F3A5F] dark:text-[#FAF6EE] text-[13px] font-bold rounded-[12px] transition-all border border-[#E6DFD0] dark:border-[#283D56] flex items-center gap-2 cursor-pointer"
                title="Ekspor daftar peserta ke file CSV"
              >
                <Download className="w-4 h-4 text-[#F2B544]" strokeWidth={2} />
                <span>Ekspor CSV</span>
              </button>
            </div>
          </div>

          {/* Baris Ringkasan Metrik */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            <div className="p-3.5 rounded-[14px] bg-[#FAF6EE] dark:bg-[#1C3048] border border-[#E6DFD0] dark:border-[#283D56]">
              <span className="text-[12px] font-bold text-[#5A6472] dark:text-[#9AA8B8]">
                Total Tiket Diterbitkan
              </span>
              <p className="text-xl sm:text-2xl font-black text-[#1F3A5F] dark:text-[#FAF6EE] mt-0.5">
                {totalRegistrations} Siswa
              </p>
            </div>
            <div className="p-3.5 rounded-[14px] bg-[#FAF6EE] dark:bg-[#1C3048] border border-[#E6DFD0] dark:border-[#283D56]">
              <span className="text-[12px] font-bold text-[#5A6472] dark:text-[#9AA8B8]">
                Kegiatan Terdaftar
              </span>
              <p className="text-xl sm:text-2xl font-black text-[#1F3A5F] dark:text-[#FAF6EE] mt-0.5">
                {uniqueEventsCount} Agenda
              </p>
            </div>
            <div className="col-span-2 sm:col-span-1 p-3.5 rounded-[14px] bg-[#FAF6EE] dark:bg-[#1C3048] border border-[#E6DFD0] dark:border-[#283D56]">
              <span className="text-[12px] font-bold text-[#5A6472] dark:text-[#9AA8B8] flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                Status Registrasi
              </span>
              <p className="text-xl sm:text-2xl font-black text-emerald-600 dark:text-emerald-400 mt-0.5">
                Aktif Sinkron
              </p>
            </div>
          </div>

          {/* Filter & Search Bar */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Cari nama siswa, NISN, kode tiket, atau kegiatan..."
                className="w-full pl-9 pr-3.5 py-2 rounded-[12px] bg-[#FAF6EE] dark:bg-[#1C3048] border border-[#E6DFD0] dark:border-[#283D56] text-[13px] text-[#1F3A5F] dark:text-[#FAF6EE] font-medium focus:outline-none focus:border-[#1F3A5F]"
              />
            </div>

            {eventOptions.length > 0 && (
              <div className="flex items-center gap-2 shrink-0">
                <Filter className="w-4 h-4 text-[#5A6472] dark:text-[#9AA8B8] shrink-0" />
                <select
                  value={selectedEventFilter}
                  onChange={(e) => setSelectedEventFilter(e.target.value)}
                  className="px-3 py-2 rounded-[12px] bg-[#FAF6EE] dark:bg-[#1C3048] border border-[#E6DFD0] dark:border-[#283D56] text-[13px] text-[#1F3A5F] dark:text-[#FAF6EE] font-medium focus:outline-none focus:border-[#1F3A5F] cursor-pointer"
                >
                  <option value="all">Semua Kegiatan ({totalRegistrations})</option>
                  {eventOptions.map((evt) => (
                    <option key={evt} value={evt}>
                      {evt}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>

          {/* Tabel / List Data Peserta */}
          {filteredRegistrations.length === 0 ? (
            <div className="p-8 rounded-[16px] border border-dashed border-[#E6DFD0] dark:border-[#283D56] text-center space-y-2">
              <Ticket className="w-10 h-10 text-slate-400 mx-auto" />
              <p className="text-[14px] font-bold text-[#1F3A5F] dark:text-[#FAF6EE]">
                {eventRegistrations.length === 0
                  ? 'Belum ada pendaftaran kegiatan masuk'
                  : 'Tidak ada pendaftar yang cocok dengan pencarian'}
              </p>
              <p className="text-[13px] text-[#5A6472] dark:text-[#9AA8B8] max-w-md mx-auto">
                {eventRegistrations.length === 0
                  ? 'Ketika siswa mendaftar kegiatan mendatang via formulir di Portal Publik, nomor tiket dan datanya otomatis tampil di sini secara real-time.'
                  : 'Coba ubah kata kunci pencarian atau ganti filter kegiatan di atas.'}
              </p>
            </div>
          ) : (
            <div className="rounded-[14px] border border-[#E6DFD0] dark:border-[#283D56] overflow-hidden bg-white dark:bg-[#17293E]">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-[13px]">
                  <thead className="bg-[#FAF6EE] dark:bg-[#1C3048] border-b border-[#E6DFD0] dark:border-[#283D56] text-[#5A6472] dark:text-[#9AA8B8] uppercase text-[11px] font-bold">
                    <tr>
                      <th className="px-4 py-3">Kode Tiket</th>
                      <th className="px-4 py-3">Nama Siswa</th>
                      <th className="px-4 py-3">Kelas &amp; NISN</th>
                      <th className="px-4 py-3">Kegiatan Terdaftar</th>
                      <th className="px-4 py-3">WhatsApp / HP</th>
                      <th className="px-4 py-3">Waktu Daftar</th>
                      <th className="px-4 py-3 text-right">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#E6DFD0] dark:divide-[#283D56]">
                    {filteredRegistrations.map((reg) => (
                      <tr
                        key={reg.id}
                        className="hover:bg-[#FAF6EE]/70 dark:hover:bg-[#1C3048]/70 transition-colors"
                      >
                        <td className="px-4 py-3.5 font-mono font-bold text-[#1F3A5F] dark:text-[#F2B544] whitespace-nowrap">
                          <span className="px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                            {reg.ticketCode}
                          </span>
                        </td>
                        <td className="px-4 py-3.5 font-bold text-[#1F3A5F] dark:text-[#FAF6EE]">
                          {reg.studentName}
                        </td>
                        <td className="px-4 py-3.5 text-[#5A6472] dark:text-[#9AA8B8] whitespace-nowrap">
                          {reg.classRoom} • <span className="font-mono text-[12px]">{reg.nisn}</span>
                        </td>
                        <td className="px-4 py-3.5 font-medium text-[#1F3A5F] dark:text-[#FAF6EE] max-w-[220px] truncate" title={reg.eventTitle}>
                          {reg.eventTitle}
                        </td>
                        <td className="px-4 py-3.5 whitespace-nowrap">
                          {reg.phone ? (
                            <a
                              href={`https://wa.me/${reg.phone.replace(/[^0-9]/g, '')}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-[8px] bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200 text-[12px] font-bold transition-colors"
                              title="Hubungi via WhatsApp"
                            >
                              <Phone className="w-3.5 h-3.5" />
                              <span>{reg.phone}</span>
                            </a>
                          ) : (
                            <span className="text-slate-400">-</span>
                          )}
                        </td>
                        <td className="px-4 py-3.5 text-[12px] text-[#5A6472] dark:text-[#9AA8B8] whitespace-nowrap">
                          {reg.registeredAt}
                        </td>
                        <td className="px-4 py-3.5 text-right whitespace-nowrap">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              type="button"
                              onClick={() => handleOpenTicketModal(reg)}
                              className="p-1.5 rounded-[8px] text-[#1F3A5F] dark:text-[#FAF6EE] hover:bg-[#E4EAF2] dark:hover:bg-[#213B5C] transition-colors"
                              title="Lihat Detail & Cetak Tiket"
                            >
                              <Printer className="w-4 h-4" />
                            </button>
                            <button
                              type="button"
                              onClick={() => setTicketToDelete(reg)}
                              className="p-1.5 rounded-[8px] text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
                              title="Batalkan / Hapus Pendaftaran"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </ScrollReveal>

      {/* MODAL LIHAT DETAIL & CETAK TIKET */}
      {ticketToView && (
        <Modal
          isOpen={Boolean(ticketToView)}
          onClose={() => setTicketToView(null)}
          title="Detail E-Tiket Peserta"
          subtitle={ticketToView.eventTitle}
          maxWidth="md"
        >
          <div className="space-y-4 py-2">
            <div className="p-5 rounded-[16px] bg-white dark:bg-[#1C3048] border-2 border-dashed border-[#1E3A8A]/40 space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-700">
                <div>
                  <span className="text-[11px] font-bold text-[#F2B544] bg-[#1F3A5F] px-2.5 py-0.5 rounded-[6px] uppercase tracking-wider inline-block">
                    {orgProfile.appName || 'SIMO'} OFFICIAL PASS
                  </span>
                  <h4 className="font-extrabold text-[15px] text-[#1F3A5F] dark:text-[#FAF6EE] mt-1.5">
                    {ticketToView.eventTitle}
                  </h4>
                </div>
                <div className="px-3 py-1 rounded-[8px] bg-[#1F3A5F] text-[#F2B544] font-mono font-black text-sm">
                  {ticketToView.ticketCode}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 text-[13px]">
                <div>
                  <span className="text-slate-500 block text-[11px] font-bold uppercase">Nama Peserta</span>
                  <span className="font-bold text-[#1F3A5F] dark:text-[#FAF6EE]">{ticketToView.studentName}</span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[11px] font-bold uppercase">NISN</span>
                  <span className="font-bold text-[#1F3A5F] dark:text-[#FAF6EE]">{ticketToView.nisn}</span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[11px] font-bold uppercase">Kelas &amp; Jurusan</span>
                  <span className="font-medium text-[#1F3A5F] dark:text-[#FAF6EE]">{ticketToView.classRoom}</span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[11px] font-bold uppercase">No. WhatsApp</span>
                  <span className="font-medium text-[#1F3A5F] dark:text-[#FAF6EE]">{ticketToView.phone}</span>
                </div>
              </div>

              {ticketQrUrl && (
                <div className="pt-3 border-t border-slate-200 dark:border-slate-700 flex items-center justify-between">
                  <div className="text-[11px] text-slate-500">
                    <p>Status: <strong className="text-emerald-600">TERDAFTAR RESMI</strong></p>
                    <p>Waktu: {ticketToView.registeredAt}</p>
                  </div>
                  <img src={ticketQrUrl} alt="QR Code" className="w-16 h-16 object-contain" />
                </div>
              )}
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => handlePrintSingleTicket(ticketToView)}
                className="px-4 py-2 rounded-[10px] bg-[#1F3A5F] text-[#FAF6EE] text-[13px] font-bold hover:bg-[#162B46] flex items-center gap-2 cursor-pointer"
              >
                <Printer className="w-4 h-4 text-[#F2B544]" />
                <span>Cetak Lembar Tiket</span>
              </button>
              <button
                type="button"
                onClick={() => setTicketToView(null)}
                className="px-4 py-2 rounded-[10px] border border-slate-300 text-slate-700 hover:bg-slate-100 text-[13px] font-bold cursor-pointer"
              >
                Tutup
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* MODAL KONFIRMASI HAPUS */}
      {ticketToDelete && (
        <Modal
          isOpen={Boolean(ticketToDelete)}
          onClose={() => setTicketToDelete(null)}
          title="Konfirmasi Pembatalan Pendaftaran"
        >
          <div className="space-y-4 py-2">
            <p className="text-[14px] text-slate-700 dark:text-slate-300">
              Apakah Anda yakin ingin menghapus data pendaftaran siswa{' '}
              <strong className="text-slate-900 dark:text-white">{ticketToDelete.studentName}</strong> (Tiket:{' '}
              <span className="font-mono font-bold text-indigo-600">{ticketToDelete.ticketCode}</span>) dari kegiatan{' '}
              <em>{ticketToDelete.eventTitle}</em>?
            </p>
            <div className="flex items-center justify-end gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => setTicketToDelete(null)}
                className="px-4 py-2 rounded-[10px] border border-slate-300 text-slate-700 hover:bg-slate-100 text-[13px] font-bold cursor-pointer"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={confirmDeleteRegistration}
                className="px-4 py-2 rounded-[10px] bg-rose-600 hover:bg-rose-700 text-white text-[13px] font-bold cursor-pointer"
              >
                Ya, Hapus Pendaftaran
              </button>
            </div>
          </div>
        </Modal>
      )}
    </>
  );
};

import React, { useState } from 'react';
import {
  CalendarCheck,
  MessagesSquare,
  Camera,
  Plus,
  CheckCircle2,
  Calendar,
  Clock,
  MapPin,
  FileText,
  Search,
  X,
  Printer,
  Download,
  Users,
  Trash2,
  Building2,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { Meeting } from '../../types';
import { formatDateIndo, formatAttendanceTime, normalizeMajor } from '../../lib/utils';
import { FaceRecognitionScanner } from '../../components/presensi/FaceRecognitionScanner';
import { Modal } from '../../components/common/Modal';
import { ImagePicker } from '../../components/common/ImagePicker';

export const KegiatanPresensiPage: React.FC = () => {
  const {
    meetings,
    events,
    attendances,
    members,
    addMeeting,
    updateMeeting,
    addEvent,
    addEventPhoto,
    removeEventPhoto,
    currentRole,
    showToast,
    orgProfile,
  } = useApp();

  const [activeTab, setActiveTab] = useState<'presensi' | 'rapat' | 'dokumentasi'>('presensi');
  const [selectedMeetingId, setSelectedMeetingId] = useState<string>(meetings[0]?.id || '');

  // Role pembatasan yang berwenang membuka / menutup sesi presensi
  const canManageAttendance =
    currentRole === 'admin' ||
    currentRole === 'ketua' ||
    currentRole === 'sekretaris' ||
    currentRole === 'pembina';

  // Meeting Modal state
  const [isAddMeetingModalOpen, setIsAddMeetingModalOpen] = useState(false);
  const [meetingForm, setMeetingForm] = useState({
    title: '',
    description: '',
    meetingDate: new Date().toISOString().split('T')[0],
    startTime: '14:30',
    endTime: '16:30',
    location: 'Ruang Rapat OSIS / Lab Komputer',
    type: 'koordinasi' as Meeting['type'],
    qrToken: `MEET-${Date.now().toString().slice(-4)}`,
    isAttendanceOpen: true,
    notulen: '',
    decisions: [] as string[],
  });

  // Documentation photo state
  const [isAddPhotoModalOpen, setIsAddPhotoModalOpen] = useState(false);
  const [selectedEventId, setSelectedEventId] = useState<string>(events[0]?.id || '');
  const [newPhotoUrl, setNewPhotoUrl] = useState('');
  const [lightboxPhoto, setLightboxPhoto] = useState<string | null>(null);
  const [confirmDeletePhoto, setConfirmDeletePhoto] = useState<{
    eventId: string;
    photoIndex: number;
    eventTitle: string;
    photoUrl: string;
  } | null>(null);

  const handleOpenAddPhoto = () => {
    const validId = events.some((e) => e.id === selectedEventId)
      ? selectedEventId
      : events[0]?.id || '';
    setSelectedEventId(validId);
    setNewPhotoUrl('');
    setIsAddPhotoModalOpen(true);
  };

  const currentMeeting = meetings.find((m) => m.id === selectedMeetingId) || meetings[0];

  // Submit Meeting
  const handleMeetingSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    addMeeting({
      ...meetingForm,
      qrToken: `MEET-${meetingForm.title.substring(0, 6).toUpperCase()}-${Date.now().toString().slice(-4)}`,
    });
    setIsAddMeetingModalOpen(false);
  };

  // Attendances for current meeting
  const meetingAttendances = attendances.filter((a) => a.targetId === currentMeeting?.id);

  // Grade analytics
  const gradeXCount = meetingAttendances.filter((a) => a.grade === 'X').length;
  const gradeXICount = meetingAttendances.filter((a) => a.grade === 'XI').length;
  const gradeXIICount = meetingAttendances.filter((a) => a.grade === 'XII').length;

  // Export Attendance CSV function
  const exportAttendanceCSV = () => {
    if (meetingAttendances.length === 0) {
      showToast('Belum ada data presensi untuk diekspor!', 'error');
      return;
    }
    const headers = ['No', 'Nama Siswa', 'NISN', 'Tingkat Kelas', 'Jurusan', 'Status Kehadiran', 'Waktu Presensi', 'Catatan'];
    const rows = meetingAttendances.map((a, idx) => [
      idx + 1,
      `"${a.memberName.replace(/"/g, '""')}"`,
      `="${a.nisn}"`,
      `"${a.grade}"`,
      `"${normalizeMajor(a.major).replace(/"/g, '""')}"`,
      a.status.toUpperCase(),
      `"${formatAttendanceTime(a.checkInTime)}"`,
      `"${(a.notes || 'Hadir').replace(/"/g, '""')}"`,
    ]);
    const csvString = '\uFEFF' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `Presensi_${currentMeeting?.title.replace(/[^a-zA-Z0-9]/g, '_')}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    showToast('File CSV presensi berhasil diunduh!');
  };

  // All photos
  const allPhotos = events.flatMap((evt) =>
    (evt.documentationPhotos || []).map((photo, index) => ({
      id: `${evt.id}-${index}-${photo.slice(-10)}`,
      url: photo,
      eventId: evt.id,
      photoIndex: index,
      eventTitle: evt.title,
      eventDate: evt.eventDate,
      location: evt.location,
    }))
  );

  return (
    <div className="space-y-3.5 sm:space-y-6">
      {/* Top Header & Internal Tab Bar */}
      <div className="simo-card p-4 sm:p-6 md:p-7 flex flex-col md:flex-row md:items-center md:justify-between gap-4 sm:gap-5">
        <div className="min-w-0">
          <div className="hidden sm:inline-flex items-center gap-2 px-3 py-1 rounded-[8px] bg-[#E4EAF2] dark:bg-[#1F3A5F]/40 text-[#1F3A5F] dark:text-[#E4EAF2] text-[12px] sm:text-[14px] font-bold mb-2">
            <Building2 className="w-4 h-4 shrink-0" />
            <span className="truncate">Kesiswaan &amp; Kedisiplinan • {orgProfile.name}</span>
          </div>
          <h2 className="text-lg sm:text-2xl font-extrabold text-[#1F3A5F] dark:text-[#FAF6EE] tracking-tight">
            Kegiatan &amp; Presensi Organisasi
          </h2>
          <p className="hidden sm:block text-[13px] sm:text-[15px] text-[#5A6472] dark:text-[#9AA8B8] mt-1">
            Presensi scan wajah biometrik, jadwal agenda rapat, dan galeri foto
          </p>
        </div>

        {/* Tab Controls */}
        <div className="grid grid-cols-3 sm:flex p-1 sm:p-1.5 bg-[#FAF6EE] dark:bg-[#0E1B2C] border border-[#E6DFD0] dark:border-[#283D56] rounded-[12px] sm:rounded-[14px] gap-1 self-stretch md:self-auto shrink-0">
          <button
            onClick={() => setActiveTab('presensi')}
            className={`min-h-[36px] sm:min-h-[44px] px-2 sm:px-4 py-1.5 sm:py-2 text-[12px] sm:text-[14px] font-bold rounded-[8px] sm:rounded-[10px] transition-all flex items-center justify-center gap-1.5 sm:gap-2 cursor-pointer ${
              activeTab === 'presensi'
                ? 'bg-[#1F3A5F] text-[#FAF6EE] shadow-sm'
                : 'text-[#5A6472] dark:text-[#9AA8B8] hover:text-[#1F3A5F] dark:hover:text-[#FAF6EE]'
            }`}
          >
            <Camera className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0" />
            <span>Presensi</span>
          </button>
          <button
            onClick={() => setActiveTab('rapat')}
            className={`min-h-[36px] sm:min-h-[44px] px-2 sm:px-4 py-1.5 sm:py-2 text-[12px] sm:text-[14px] font-bold rounded-[8px] sm:rounded-[10px] transition-all flex items-center justify-center gap-1.5 sm:gap-2 cursor-pointer ${
              activeTab === 'rapat'
                ? 'bg-[#1F3A5F] text-[#FAF6EE] shadow-sm'
                : 'text-[#5A6472] dark:text-[#9AA8B8] hover:text-[#1F3A5F] dark:hover:text-[#FAF6EE]'
            }`}
          >
            <MessagesSquare className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0" />
            <span>Rapat</span>
          </button>
          <button
            onClick={() => setActiveTab('dokumentasi')}
            className={`min-h-[36px] sm:min-h-[44px] px-2 sm:px-4 py-1.5 sm:py-2 text-[12px] sm:text-[14px] font-bold rounded-[8px] sm:rounded-[10px] transition-all flex items-center justify-center gap-1.5 sm:gap-2 cursor-pointer ${
              activeTab === 'dokumentasi'
                ? 'bg-[#1F3A5F] text-[#FAF6EE] shadow-sm'
                : 'text-[#5A6472] dark:text-[#9AA8B8] hover:text-[#1F3A5F] dark:hover:text-[#FAF6EE]'
            }`}
          >
            <Camera className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0" />
            <span>Foto</span>
          </button>
        </div>
      </div>

      {/* TAB 1: PRESENSI CERDAS */}
      {activeTab === 'presensi' && (
        <div className="space-y-3 sm:space-y-6">
          <div className="simo-card p-3 sm:p-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2.5 sm:gap-4">
            <div className="flex items-center gap-2 flex-1 min-w-0">
              <span className="text-[12px] sm:text-[14px] font-bold text-[#1F3A5F] dark:text-[#FAF6EE] shrink-0">
                Agenda:
              </span>
              <select
                value={selectedMeetingId}
                onChange={(e) => setSelectedMeetingId(e.target.value)}
                className="simo-input min-h-[38px] sm:min-h-[44px] px-2.5 sm:px-3 text-[12px] sm:text-[14px] font-semibold w-full"
              >
                {meetings.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.title} ({formatDateIndo(m.meetingDate)})
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-center justify-between sm:justify-end gap-2 shrink-0 pt-1.5 sm:pt-0 border-t sm:border-t-0 border-[#E6DFD0]/60 dark:border-[#283D56]/60">
              <span
                className={`inline-flex items-center gap-1.5 px-2.5 py-1 sm:py-1.5 rounded-[8px] sm:rounded-[10px] text-[11px] sm:text-[13px] font-bold ${
                  currentMeeting?.isAttendanceOpen
                    ? 'simo-badge-blue'
                    : 'simo-badge-neutral'
                }`}
              >
                <span
                  className={`w-2 h-2 rounded-full ${
                    currentMeeting?.isAttendanceOpen ? 'bg-[#1F3A5F] dark:bg-[#FAF6EE] animate-pulse' : 'bg-[#5A6472]'
                  }`}
                />
                <span>
                  {currentMeeting?.isAttendanceOpen ? 'Sesi Buka' : 'Presensi Tutup'}
                </span>
              </span>

              {canManageAttendance && (
                <button
                  onClick={() => {
                    const nextState = !currentMeeting.isAttendanceOpen;
                    updateMeeting(currentMeeting.id, {
                      isAttendanceOpen: nextState,
                    });
                    showToast(
                      nextState
                        ? `Sesi presensi untuk "${currentMeeting.title}" berhasil dibuka.`
                        : `Sesi presensi untuk "${currentMeeting.title}" telah ditutup.`,
                      'info'
                    );
                  }}
                  className="simo-btn-outline min-h-[32px] sm:min-h-[40px] px-3 sm:px-4 rounded-[8px] sm:rounded-[12px] text-[11px] sm:text-[13px] font-bold cursor-pointer"
                >
                  {currentMeeting?.isAttendanceOpen ? 'Tutup Sesi' : 'Buka Sesi'}
                </button>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 sm:gap-6">
            <div className="lg:col-span-7 simo-card p-2.5 sm:p-6">
              <FaceRecognitionScanner
                meetingId={currentMeeting.id}
                meetingTitle={currentMeeting.title}
                isAttendanceOpen={currentMeeting.isAttendanceOpen}
              />
            </div>

            <div className="lg:col-span-5 simo-card p-4 sm:p-6 space-y-4 flex flex-col justify-between">
              <div>
                <div className="flex items-start sm:items-center justify-between pb-3 border-b border-[#E6DFD0] dark:border-[#283D56] mb-3 gap-2">
                  <div className="min-w-0">
                    <h3 className="text-[15px] sm:text-[17px] font-extrabold text-[#1F3A5F] dark:text-[#FAF6EE]">Daftar Kehadiran</h3>
                    <p className="text-[12px] sm:text-[13px] text-[#5A6472] dark:text-[#9AA8B8] truncate">{currentMeeting.title}</p>
                  </div>
                  <span className="px-2.5 sm:px-3 py-1 rounded-[8px] bg-[#E4EAF2] text-[#1F3A5F] dark:bg-[#1F3A5F]/40 dark:text-[#FAF6EE] font-bold text-[12px] sm:text-[13px] shrink-0 whitespace-nowrap">
                    {meetingAttendances.length} Hadir
                  </span>
                </div>

                <div className="space-y-2.5 max-h-96 overflow-y-auto pr-1">
                  {meetingAttendances.length > 0 ? (
                    meetingAttendances.map((att) => (
                      <div
                        key={att.id}
                        className="p-3 sm:p-3.5 rounded-[12px] bg-[#FAF6EE] dark:bg-[#17293E] border border-[#E6DFD0] dark:border-[#283D56] flex items-start sm:items-center justify-between gap-2"
                      >
                        <div className="min-w-0 flex-1">
                          <p className="text-[13px] sm:text-[14px] font-bold text-[#1F3A5F] dark:text-[#FAF6EE] leading-tight truncate">
                            {att.memberName}
                          </p>
                          <p className="text-[11px] sm:text-[12px] text-[#5A6472] dark:text-[#9AA8B8] mt-0.5 sm:mt-1 truncate">
                            {att.grade} • {normalizeMajor(att.major)} ({att.nisn})
                          </p>
                        </div>
                        <div className="text-right shrink-0">
                          <span className="inline-block px-2 sm:px-2.5 py-0.5 rounded-[6px] text-[10px] sm:text-[11px] font-bold uppercase bg-[#E4EAF2] text-[#1F3A5F] dark:bg-[#1F3A5F]/40 dark:text-[#FAF6EE]">
                            {att.status}
                          </span>
                          <p className="text-[11px] sm:text-[12px] text-[#5A6472] dark:text-[#9AA8B8] font-mono mt-0.5 sm:mt-1">
                            {formatAttendanceTime(att.checkInTime)}
                          </p>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="py-12 text-center text-[14px] text-[#5A6472] dark:text-[#9AA8B8] space-y-1">
                      <p className="font-bold">Belum ada siswa yang presensi.</p>
                      <p className="text-[13px]">Gunakan kamera scan wajah di sebelah kiri atau tab Cari Nama.</p>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex gap-2 sm:gap-3 mt-4 pt-3 border-t border-[#E6DFD0] dark:border-[#283D56]">
                <button
                  onClick={exportAttendanceCSV}
                  className="simo-btn-outline flex-1 min-h-[40px] sm:min-h-[44px] rounded-[12px] text-[12px] sm:text-[14px] font-bold flex items-center justify-center gap-1.5 sm:gap-2 cursor-pointer"
                >
                  <Download className="w-4 h-4 shrink-0" />
                  <span>Ekspor CSV</span>
                </button>
                <button
                  onClick={() => window.print()}
                  className="simo-btn-primary flex-1 min-h-[40px] sm:min-h-[44px] rounded-[12px] text-[12px] sm:text-[14px] font-bold flex items-center justify-center gap-1.5 sm:gap-2 cursor-pointer"
                >
                  <Printer className="w-4 h-4 shrink-0" />
                  <span>Cetak</span>
                </button>
              </div>
            </div>
          </div>

          {/* Deep Analytics: Komposisi Tingkat Kelas Peserta Hadir (Single Continuous Card with Dividers) */}
          <div className="simo-card p-0 overflow-hidden">
            <div className="p-3 sm:p-4 md:p-5 border-b border-[#E6DFD0] dark:border-[#283D56]">
              <h4 className="text-[12px] sm:text-[14px] font-bold text-[#1F3A5F] dark:text-[#FAF6EE] uppercase tracking-wider flex items-center gap-2">
                <Users className="w-4 h-4 text-[#1F3A5F] dark:text-[#F2B544] shrink-0" />
                <span>Komposisi Kehadiran Berdasarkan Kelas</span>
              </h4>
            </div>
            <div className="grid grid-cols-3 divide-x divide-[#E6DFD0] dark:divide-[#283D56] text-center">
              <div className="p-3 sm:p-6">
                <span className="text-[11px] sm:text-[13px] text-[#5A6472] dark:text-[#9AA8B8] font-bold uppercase block">Kelas X</span>
                <span className="text-xl sm:text-3xl font-black text-[#1F3A5F] dark:text-[#FAF6EE] mt-1 block">{gradeXCount}</span>
                <span className="text-[10px] sm:text-[13px] text-[#5A6472] dark:text-[#9AA8B8] mt-0.5 sm:mt-1 block">Kader Junior</span>
              </div>
              <div className="p-3 sm:p-6 bg-[#E4EAF2]/60 dark:bg-[#1F3A5F]/30">
                <span className="text-[11px] sm:text-[13px] text-[#1F3A5F] dark:text-[#FAF6EE] font-bold uppercase block">Kelas XI</span>
                <span className="text-xl sm:text-3xl font-black text-[#1F3A5F] dark:text-[#FAF6EE] mt-1 block">{gradeXICount}</span>
                <span className="text-[10px] sm:text-[13px] text-[#1F3A5F] dark:text-[#FAF6EE] mt-0.5 sm:mt-1 block">Pengurus Inti</span>
              </div>
              <div className="p-3 sm:p-6">
                <span className="text-[11px] sm:text-[13px] text-[#5A6472] dark:text-[#9AA8B8] font-bold uppercase block">Kelas XII</span>
                <span className="text-xl sm:text-3xl font-black text-[#1F3A5F] dark:text-[#FAF6EE] mt-1 block">{gradeXIICount}</span>
                <span className="text-[10px] sm:text-[13px] text-[#5A6472] dark:text-[#9AA8B8] mt-0.5 sm:mt-1 block">Dewan Penasehat</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: JADWAL RAPAT & NOTULEN */}
      {activeTab === 'rapat' && (
        <div className="space-y-6">
          <div className="simo-card p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-[15px] sm:text-[17px] font-extrabold text-[#1F3A5F] dark:text-[#FAF6EE]">Jadwal Agenda Rapat &amp; Notulensi</h3>
              <p className="text-[12px] sm:text-[14px] text-[#5A6472] dark:text-[#9AA8B8]">Kelola jadwal musyawarah pengurus dan arsip keputusan rapat</p>
            </div>
            <button
              onClick={() => setIsAddMeetingModalOpen(true)}
              className="simo-btn-primary min-h-[44px] px-4 sm:px-5 py-2.5 rounded-[12px] flex items-center gap-2 cursor-pointer shrink-0 w-full sm:w-auto justify-center"
            >
              <Plus className="w-4 h-4" />
              <span>Jadwalkan Rapat</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {meetings.map((m) => (
              <div
                key={m.id}
                className="simo-card p-6 space-y-4 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[12px] font-bold text-[#1F3A5F] dark:text-[#FAF6EE] bg-[#E4EAF2] dark:bg-[#1F3A5F]/40 px-2.5 py-1 rounded-[8px] uppercase">
                      Rapat {m.type}
                    </span>
                    <span className="text-[12px] text-[#5A6472] dark:text-[#9AA8B8] font-mono">Kode: {m.qrToken}</span>
                  </div>

                  <h4 className="text-[17px] font-extrabold text-[#1F3A5F] dark:text-[#FAF6EE]">{m.title}</h4>
                  <p className="text-[14px] text-[#5A6472] dark:text-[#9AA8B8] mt-1.5 leading-relaxed line-clamp-2">
                    {m.description}
                  </p>

                  <div className="space-y-1.5 pt-3.5 border-t border-[#E6DFD0] dark:border-[#283D56] text-[14px] text-[#5A6472] dark:text-[#9AA8B8]">
                    <p className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-[#5A6472]" />
                      <span>{formatDateIndo(m.meetingDate)} ({m.startTime} - {m.endTime} WIB)</span>
                    </p>
                    <p className="flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-[#5A6472]" />
                      <span>{m.location}</span>
                    </p>
                  </div>
                </div>

                {m.notulen && (
                  <div className="p-3.5 rounded-[12px] bg-[#FAF6EE] dark:bg-[#17293E] border border-[#E6DFD0] dark:border-[#283D56] text-[13px] text-[#1F3A5F] dark:text-[#FAF6EE] italic">
                    <span className="not-italic text-[12px] font-bold text-[#5A6472] dark:text-[#9AA8B8] block mb-1 uppercase">
                      Poin Risalah:
                    </span>
                    "{m.notulen}"
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 4: DOKUMENTASI FOTO */}
      {activeTab === 'dokumentasi' && (
        <div className="space-y-6">
          <div className="simo-card p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-[15px] sm:text-[17px] font-extrabold text-[#1F3A5F] dark:text-[#FAF6EE] flex items-center gap-2">
                <span>Galeri Foto Dokumentasi Kegiatan</span>
                <span className="text-[12px] font-bold px-2.5 py-0.5 rounded-full bg-[#E4EAF2] text-[#1F3A5F] dark:bg-[#1F3A5F]/60 dark:text-[#E4EAF2]">
                  {allPhotos.length} Foto
                </span>
              </h3>
              <p className="text-[12px] sm:text-[14px] text-[#5A6472] dark:text-[#9AA8B8]">
                Pilih foto dari komputer lokal untuk dokumentasi kegiatan atau hapus foto yang tidak diperlukan
              </p>
            </div>
            <button
              onClick={handleOpenAddPhoto}
              className="simo-btn-primary min-h-[44px] px-4 sm:px-5 py-2.5 rounded-[12px] flex items-center gap-2 cursor-pointer shrink-0 w-full sm:w-auto justify-center"
            >
              <Plus className="w-4 h-4" />
              <span>Upload Foto dari Komputer</span>
            </button>
          </div>

          {allPhotos.length === 0 ? (
            <div className="simo-card p-10 sm:p-14 text-center flex flex-col items-center justify-center">
              <div className="w-16 h-16 rounded-2xl bg-[#E4EAF2] dark:bg-[#1F3A5F]/40 flex items-center justify-center mb-3 text-[#1F3A5F] dark:text-[#FAF6EE]">
                <Camera className="w-8 h-8" />
              </div>
              <h4 className="text-[16px] font-extrabold text-[#1F3A5F] dark:text-[#FAF6EE]">
                Belum Ada Foto Dokumentasi
              </h4>
              <p className="text-[13px] text-[#5A6472] dark:text-[#9AA8B8] max-w-md mt-1 mb-5">
                Dokumentasi foto kegiatan OSIS masih kosong. Klik tombol di bawah untuk mengunggah foto baru dari penyimpanan komputer atau HP Anda.
              </p>
              <button
                type="button"
                onClick={handleOpenAddPhoto}
                className="simo-btn-primary min-h-[42px] px-5 rounded-[12px] flex items-center gap-2 cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Upload Foto Sekarang</span>
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
              {allPhotos.map((item) => (
                <div
                  key={item.id}
                  onClick={() => setLightboxPhoto(item.url)}
                  className="group relative bg-[#FFFDF8] dark:bg-[#17293E] rounded-[16px] overflow-hidden border border-[#E6DFD0] dark:border-[#283D56] cursor-pointer aspect-4/3 shadow-2xs hover:shadow-md transition-all"
                >
                  <img
                    src={item.url}
                    alt={item.eventTitle}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />

                  {/* Tombol Hapus Foto - Pojok Kanan Atas */}
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setConfirmDeletePhoto({
                        eventId: item.eventId,
                        photoIndex: item.photoIndex,
                        eventTitle: item.eventTitle,
                        photoUrl: item.url,
                      });
                    }}
                    className="absolute top-2.5 right-2.5 p-2 rounded-xl bg-red-600/90 hover:bg-red-600 text-white shadow-md transition-all cursor-pointer z-10 opacity-90 hover:opacity-100 hover:scale-105 active:scale-95 flex items-center justify-center"
                    title="Hapus foto dokumentasi ini"
                    aria-label="Hapus foto dokumentasi"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>

                  {/* Info Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-[#1F3A5F]/95 via-[#1F3A5F]/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity p-4 flex flex-col justify-end text-[#FAF6EE] pointer-events-none">
                    <span className="text-[12px] font-bold text-[#F2B544]">{item.eventDate}</span>
                    <p className="text-[14px] font-bold leading-tight mt-1 line-clamp-2">
                      {item.eventTitle}
                    </p>
                    <p className="text-[12px] text-[#FAF6EE]/80 mt-1 flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-[#F2B544]" />
                      <span>{item.location}</span>
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Modal Add Meeting */}
      <Modal
        isOpen={isAddMeetingModalOpen}
        onClose={() => setIsAddMeetingModalOpen(false)}
        title="Jadwalkan Rapat Baru"
        subtitle="Agenda rapat koordinasi pengurus"
      >
        <form onSubmit={handleMeetingSubmit} className="space-y-4">
          <div>
            <label className="block text-[14px] font-bold text-[#1F3A5F] dark:text-[#FAF6EE] mb-1.5">Judul Rapat</label>
            <input
              type="text"
              value={meetingForm.title}
              onChange={(e) => setMeetingForm({ ...meetingForm, title: e.target.value })}
              placeholder="Contoh: Rapat Koordinasi Panitia Classmeeting"
              className="simo-input min-h-[44px] text-[15px] w-full"
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-[14px] font-bold text-[#1F3A5F] dark:text-[#FAF6EE] mb-1.5">Tanggal</label>
              <input
                type="date"
                value={meetingForm.meetingDate}
                onChange={(e) => setMeetingForm({ ...meetingForm, meetingDate: e.target.value })}
                className="simo-input min-h-[44px] text-[14px] w-full"
                required
              />
            </div>
            <div>
              <label className="block text-[14px] font-bold text-[#1F3A5F] dark:text-[#FAF6EE] mb-1.5">Lokasi</label>
              <input
                type="text"
                value={meetingForm.location}
                onChange={(e) => setMeetingForm({ ...meetingForm, location: e.target.value })}
                placeholder="Ruang OSIS / Lab Komputer"
                className="simo-input min-h-[44px] text-[14px] w-full"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-[14px] font-bold text-[#1F3A5F] dark:text-[#FAF6EE] mb-1.5">Agenda Pembahasan</label>
            <textarea
              value={meetingForm.description}
              onChange={(e) => setMeetingForm({ ...meetingForm, description: e.target.value })}
              rows={3}
              placeholder="Poin-poin yang akan dibahas..."
              className="simo-input text-[14px] w-full p-3 leading-relaxed"
              required
            />
          </div>

          <div className="flex justify-end gap-3 pt-3 border-t border-[#E6DFD0] dark:border-[#283D56]">
            <button
              type="button"
              onClick={() => setIsAddMeetingModalOpen(false)}
              className="simo-btn-outline min-h-[44px] px-5 rounded-[12px] text-[14px] font-bold cursor-pointer"
            >
              Batal
            </button>
            <button
              type="submit"
              className="simo-btn-primary min-h-[44px] px-5 rounded-[12px] text-[14px] font-bold cursor-pointer"
            >
              Jadwalkan Rapat
            </button>
          </div>
        </form>
      </Modal>

      {/* Modal Add Photo */}
      <Modal
        isOpen={isAddPhotoModalOpen}
        onClose={() => {
          setIsAddPhotoModalOpen(false);
          setNewPhotoUrl('');
        }}
        title="Upload Foto Dokumentasi dari Komputer"
        subtitle="Pilih foto dokumentasi dari penyimpanan komputer atau HP Anda"
      >
        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (!newPhotoUrl) return;

            let targetEventId = selectedEventId;
            if (!targetEventId || !events.some((ev) => ev.id === targetEventId)) {
              if (events.length > 0) {
                targetEventId = events[0].id;
              } else {
                // Buat event dokumentasi default jika belum ada kegiatan terdaftar
                addEvent({
                  title: 'Dokumentasi Umum Kegiatan OSIS',
                  description: 'Arsip visual foto kegiatan dan aktivitas pengurus OSIS',
                  eventDate: new Date().toISOString().split('T')[0],
                  startTime: '08:00',
                  endTime: '15:00',
                  location: 'SMK Negeri 1 Cerdas Bangsa',
                  status: 'selesai',
                  documentationPhotos: [newPhotoUrl],
                  qrToken: `EVT-DOK-${Date.now().toString().slice(-4)}`,
                });
                setNewPhotoUrl('');
                setIsAddPhotoModalOpen(false);
                return;
              }
            }

            addEventPhoto(targetEventId, newPhotoUrl);
            setNewPhotoUrl('');
            setIsAddPhotoModalOpen(false);
          }}
          className="space-y-4"
        >
          <div>
            <label className="block text-[14px] font-bold text-[#1F3A5F] dark:text-[#FAF6EE] mb-1.5">
              Pilih Kegiatan Terkait
            </label>
            {events.length > 0 ? (
              <select
                value={selectedEventId || events[0]?.id || ''}
                onChange={(e) => setSelectedEventId(e.target.value)}
                className="simo-input min-h-[44px] text-[14px] w-full"
              >
                {events.map((evt) => (
                  <option key={evt.id} value={evt.id}>
                    {evt.title} ({evt.eventDate})
                  </option>
                ))}
              </select>
            ) : (
              <p className="text-[13px] text-[#5A6472] dark:text-[#9AA8B8] italic bg-[#FAF6EE] dark:bg-[#17293E] p-3 rounded-xl border border-[#E6DFD0] dark:border-[#283D56]">
                Foto akan otomatis dimasukkan ke dalam arsip dokumentasi kegiatan umum OSIS.
              </p>
            )}
          </div>

          <ImagePicker
            label="Pilih Foto Berkas Lokal (Komputer / HP)"
            value={newPhotoUrl}
            onChange={(url) => setNewPhotoUrl(url)}
            helperText="Format: JPG, PNG, WebP (otomatis dikompres & dioptimasi)"
            aspectRatio="video"
          />

          <div className="flex justify-end gap-3 pt-3 border-t border-[#E6DFD0] dark:border-[#283D56]">
            <button
              type="button"
              onClick={() => {
                setIsAddPhotoModalOpen(false);
                setNewPhotoUrl('');
              }}
              className="simo-btn-outline min-h-[44px] px-5 rounded-[12px] text-[14px] font-bold cursor-pointer"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={!newPhotoUrl}
              className="simo-btn-primary min-h-[44px] px-5 rounded-[12px] text-[14px] font-bold cursor-pointer disabled:opacity-50"
            >
              Simpan Foto Dokumentasi
            </button>
          </div>
        </form>
      </Modal>

      {/* Modal Konfirmasi Hapus Foto Dokumentasi */}
      {confirmDeletePhoto && (
        <Modal
          isOpen={true}
          onClose={() => setConfirmDeletePhoto(null)}
          title="Hapus Foto Dokumentasi?"
          subtitle={`Kegiatan: ${confirmDeletePhoto.eventTitle}`}
        >
          <div className="space-y-4">
            <div className="rounded-xl overflow-hidden border border-[#E6DFD0] dark:border-[#283D56] bg-black/10 flex items-center justify-center">
              <img
                src={confirmDeletePhoto.photoUrl}
                alt="Foto dokumentasi yang akan dihapus"
                className="max-h-56 w-full object-cover"
              />
            </div>
            <p className="text-[14px] text-[#5A6472] dark:text-[#9AA8B8] leading-relaxed">
              Apakah Anda yakin ingin menghapus foto dokumentasi ini dari kegiatan{' '}
              <strong className="text-[#1F3A5F] dark:text-[#FAF6EE]">
                {confirmDeletePhoto.eventTitle}
              </strong>
              ? Foto yang telah dihapus tidak dapat dipulihkan kembali.
            </p>
            <div className="flex justify-end gap-3 pt-3 border-t border-[#E6DFD0] dark:border-[#283D56]">
              <button
                type="button"
                onClick={() => setConfirmDeletePhoto(null)}
                className="simo-btn-outline min-h-[42px] px-5 rounded-[12px] text-[14px] font-bold cursor-pointer"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={() => {
                  removeEventPhoto(confirmDeletePhoto.eventId, confirmDeletePhoto.photoIndex);
                  if (lightboxPhoto === confirmDeletePhoto.photoUrl) {
                    setLightboxPhoto(null);
                  }
                  setConfirmDeletePhoto(null);
                }}
                className="min-h-[42px] px-5 rounded-[12px] bg-red-600 hover:bg-red-700 text-white text-[14px] font-bold cursor-pointer transition-colors shadow-sm flex items-center gap-1.5"
              >
                <Trash2 className="w-4 h-4" />
                <span>Ya, Hapus Foto</span>
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* Lightbox Modal Pratinjau Foto */}
      {lightboxPhoto && (
        <div
          className="fixed inset-0 z-50 bg-[#0E1B2C]/90 backdrop-blur-xs flex flex-col items-center justify-center p-4"
          onClick={() => setLightboxPhoto(null)}
        >
          <div
            className="relative max-h-[92vh] max-w-[94vw] flex flex-col items-center"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Toolbar Atas */}
            <div className="w-full flex items-center justify-between pb-3 text-white">
              <span className="text-[13px] font-bold text-[#F2B544] flex items-center gap-1.5">
                <Camera className="w-4 h-4" />
                <span>Pratinjau Foto Dokumentasi</span>
              </span>
              <div className="flex items-center gap-2">
                {(() => {
                  const targetItem = allPhotos.find((p) => p.url === lightboxPhoto);
                  if (targetItem) {
                    return (
                      <button
                        type="button"
                        onClick={() => {
                          setConfirmDeletePhoto({
                            eventId: targetItem.eventId,
                            photoIndex: targetItem.photoIndex,
                            eventTitle: targetItem.eventTitle,
                            photoUrl: targetItem.url,
                          });
                        }}
                        className="px-3 py-1.5 bg-red-600/90 hover:bg-red-600 text-white text-xs font-bold rounded-xl flex items-center gap-1.5 transition-colors cursor-pointer shadow-sm"
                        title="Hapus foto ini"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>Hapus Foto</span>
                      </button>
                    );
                  }
                  return null;
                })()}
                <button
                  type="button"
                  onClick={() => setLightboxPhoto(null)}
                  className="p-1.5 bg-white/20 hover:bg-white/30 text-white rounded-xl transition-colors cursor-pointer"
                  title="Tutup pratinjau"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            <img
              src={lightboxPhoto}
              alt="Preview"
              className="max-h-[80vh] max-w-[90vw] object-contain rounded-[16px] border border-[#283D56] shadow-2xl"
            />
          </div>
        </div>
      )}
    </div>
  );
};

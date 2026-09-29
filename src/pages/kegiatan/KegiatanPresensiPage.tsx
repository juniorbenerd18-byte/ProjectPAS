import React, { useState } from 'react';
import {
  CalendarCheck,
  Briefcase,
  MessagesSquare,
  Camera,
  Plus,
  Sliders,
  CheckCircle2,
  Calendar,
  Clock,
  MapPin,
  FileText,
  Search,
  Check,
  X,
  Printer,
  Sparkles,
  Save,
  Download,
  TrendingUp,
  Users,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { WorkProgram, Meeting } from '../../types';
import { formatRupiah, formatDateIndo, formatNumber, parseFormattedNumber } from '../../lib/utils';
import { FaceRecognitionScanner } from '../../components/presensi/FaceRecognitionScanner';
import { Modal } from '../../components/common/Modal';
import { ImagePicker } from '../../components/common/ImagePicker';
import confetti from 'canvas-confetti';

export const KegiatanPresensiPage: React.FC = () => {
  const {
    meetings,
    workPrograms,
    events,
    attendances,
    divisions,
    addWorkProgram,
    updateWorkProgram,
    addMeeting,
    updateMeeting,
    addEventPhoto,
    currentRole,
    showToast,
  } = useApp();

  const [activeTab, setActiveTab] = useState<'presensi' | 'proker' | 'rapat' | 'dokumentasi'>('presensi');
  const [selectedMeetingId, setSelectedMeetingId] = useState<string>(meetings[0]?.id || '');

  // Proker Modal state
  const [isAddProkerModalOpen, setIsAddProkerModalOpen] = useState(false);
  const [prokerForm, setProkerForm] = useState({
    title: '',
    divisionId: divisions[0]?.id || '',
    description: '',
    estimatedBudgetRaw: '2.500.000',
    targetDate: '2026-11-15',
    status: 'diajukan' as const,
    progressPercent: 0,
    proposalUrl: '#',
  });

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

  const currentMeeting = meetings.find((m) => m.id === selectedMeetingId) || meetings[0];
  const canApprove = currentRole === 'ketua' || currentRole === 'pembina' || currentRole === 'admin';

  // Submit Proker
  const handleProkerSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const div = divisions.find((d) => d.id === prokerForm.divisionId);
    addWorkProgram({
      title: prokerForm.title,
      divisionId: prokerForm.divisionId,
      divisionName: div?.name || 'Sekbid',
      description: prokerForm.description,
      estimatedBudget: parseFormattedNumber(prokerForm.estimatedBudgetRaw),
      targetDate: prokerForm.targetDate,
      status: prokerForm.status,
      progressPercent: prokerForm.progressPercent,
      proposalUrl: prokerForm.proposalUrl,
    });
    setIsAddProkerModalOpen(false);
  };

  // Submit Meeting
  const handleMeetingSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    addMeeting({
      ...meetingForm,
      qrToken: `MEET-${meetingForm.title.substring(0, 6).toUpperCase()}-${Date.now().toString().slice(-4)}`,
    });
    setIsAddMeetingModalOpen(false);
  };

  // Progress change handler
  const handleProgressChange = (id: string, newPercent: number) => {
    const isCompleted = newPercent >= 100;
    updateWorkProgram(id, {
      progressPercent: newPercent,
      status: isCompleted ? 'selesai' : newPercent > 0 ? 'berjalan' : 'disetujui',
    });
    if (isCompleted) {
      confetti({ particleCount: 70, spread: 60 });
    }
  };

  // Attendances for current meeting
  const meetingAttendances = attendances.filter((a) => a.targetId === currentMeeting?.id);

  // Grade analytics
  const gradeXCount = meetingAttendances.filter((a) => a.grade === 'X').length;
  const gradeXICount = meetingAttendances.filter((a) => a.grade === 'XI').length;
  const gradeXIICount = meetingAttendances.filter((a) => a.grade === 'XII').length;

  // Proker budget analytics
  const totalProkerBudget = workPrograms.reduce((sum, p) => sum + p.estimatedBudget, 0);
  const avgProkerProgress = workPrograms.length > 0
    ? Math.round(workPrograms.reduce((sum, p) => sum + p.progressPercent, 0) / workPrograms.length)
    : 0;

  // Export Attendance CSV function
  const exportAttendanceCSV = () => {
    if (meetingAttendances.length === 0) {
      showToast('Belum ada data presensi untuk diekspor!', 'error');
      return;
    }
    const headers = ['No', 'Nama Siswa', 'NISN', 'Tingkat Kelas', 'Jurusan', 'Status Kehadiran', 'Waktu Presensi', 'Catatan'];
    const rows = meetingAttendances.map((a, idx) => [
      idx + 1,
      `"${a.memberName}"`,
      `"${a.nisn}"`,
      `"${a.grade}"`,
      `"${a.major}"`,
      a.status.toUpperCase(),
      a.checkInTime,
      `"${a.notes || 'Hadir'}"`,
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Presensi_${currentMeeting?.title.replace(/[^a-zA-Z0-9]/g, '_')}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('File CSV presensi berhasil diunduh!');
  };

  // All photos
  const allPhotos = events.flatMap((evt) =>
    evt.documentationPhotos.map((photo, index) => ({
      id: `${evt.id}-${index}`,
      url: photo,
      eventTitle: evt.title,
      eventDate: evt.eventDate,
      location: evt.location,
    }))
  );

  return (
    <div className="space-y-6">
      {/* Top Header & Internal Tab Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200/80 shadow-2xs">
        <div>
          <h2 className="text-base font-bold text-slate-900">Kegiatan & Presensi Organisasi</h2>
          <p className="text-xs text-slate-500">
            Presensi scan wajah biometrik, manajemen proker, jadwal agenda rapat, dan galeri foto
          </p>
        </div>

        {/* Tab Controls */}
        <div className="flex flex-wrap p-1 bg-slate-100 rounded-xl">
          <button
            onClick={() => setActiveTab('presensi')}
            className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'presensi'
                ? 'bg-white text-indigo-700 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Camera className="w-3.5 h-3.5 text-indigo-600" />
            <span>Presensi Wajah / QR</span>
          </button>
          <button
            onClick={() => setActiveTab('proker')}
            className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'proker'
                ? 'bg-white text-indigo-700 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Briefcase className="w-3.5 h-3.5" />
            <span>Program Kerja</span>
          </button>
          <button
            onClick={() => setActiveTab('rapat')}
            className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'rapat'
                ? 'bg-white text-indigo-700 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <MessagesSquare className="w-3.5 h-3.5" />
            <span>Jadwal & Notulen</span>
          </button>
          <button
            onClick={() => setActiveTab('dokumentasi')}
            className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'dokumentasi'
                ? 'bg-white text-indigo-700 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Camera className="w-3.5 h-3.5 text-rose-500" />
            <span>Dokumentasi Foto</span>
          </button>
        </div>
      </div>

      {/* TAB 1: PRESENSI CERDAS */}
      {activeTab === 'presensi' && (
        <div className="space-y-6">
          <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <span className="text-xs font-bold text-slate-700 shrink-0">Pilih Agenda Rapat:</span>
              <select
                value={selectedMeetingId}
                onChange={(e) => setSelectedMeetingId(e.target.value)}
                className="px-3 py-2 bg-slate-50 border border-slate-200/80 rounded-xl text-xs font-semibold text-slate-800 outline-none w-full sm:w-auto"
              >
                {meetings.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.title} ({formatDateIndo(m.meetingDate)})
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-center gap-2">
              <span
                className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold ${
                  currentMeeting?.isAttendanceOpen
                    ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                    : 'bg-slate-100 text-slate-500'
                }`}
              >
                <span
                  className={`w-2 h-2 rounded-full ${
                    currentMeeting?.isAttendanceOpen ? 'bg-emerald-500 animate-pulse' : 'bg-slate-400'
                  }`}
                />
                <span>
                  {currentMeeting?.isAttendanceOpen ? 'Sesi Presensi Buka' : 'Presensi Ditutup'}
                </span>
              </span>

              <button
                onClick={() =>
                  updateMeeting(currentMeeting.id, {
                    isAttendanceOpen: !currentMeeting.isAttendanceOpen,
                  })
                }
                className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold cursor-pointer"
              >
                {currentMeeting?.isAttendanceOpen ? 'Tutup Sesi' : 'Buka Sesi'}
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <div className="lg:col-span-7 bg-white p-6 rounded-2xl border border-slate-200/80 shadow-2xs">
              <FaceRecognitionScanner
                meetingId={currentMeeting.id}
                meetingTitle={currentMeeting.title}
                isAttendanceOpen={currentMeeting.isAttendanceOpen}
              />
            </div>

            <div className="lg:col-span-5 bg-white p-6 rounded-2xl border border-slate-200/80 shadow-2xs space-y-4 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-3">
                  <div>
                    <h3 className="text-sm font-bold text-slate-900">Daftar Kehadiran</h3>
                    <p className="text-[11px] text-slate-400">{currentMeeting.title}</p>
                  </div>
                  <span className="px-2.5 py-1 rounded-full bg-indigo-50 text-indigo-700 font-extrabold text-xs">
                    {meetingAttendances.length} Hadir
                  </span>
                </div>

                <div className="space-y-2 max-h-96 overflow-y-auto pr-1">
                  {meetingAttendances.length > 0 ? (
                    meetingAttendances.map((att) => (
                      <div
                        key={att.id}
                        className="p-3 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between"
                      >
                        <div>
                          <p className="text-xs font-bold text-slate-800 leading-tight">
                            {att.memberName}
                          </p>
                          <p className="text-[10px] text-slate-400 mt-0.5">
                            {att.grade} • {att.major} ({att.nisn})
                          </p>
                        </div>
                        <div className="text-right">
                          <span className="inline-block px-2 py-0.5 rounded-full text-[9px] font-extrabold uppercase bg-emerald-100 text-emerald-800">
                            {att.status}
                          </span>
                          <p className="text-[10px] text-slate-400 font-mono mt-0.5">
                            {att.checkInTime}
                          </p>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="py-12 text-center text-xs text-slate-400 space-y-1">
                      <p className="font-semibold">Belum ada siswa yang presensi.</p>
                      <p className="text-[11px]">Gunakan kamera scan wajah di sebelah kiri atau tab Cari Nama.</p>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex gap-2 mt-4">
                <button
                  onClick={exportAttendanceCSV}
                  className="flex-1 py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Ekspor CSV</span>
                </button>
                <button
                  onClick={() => window.print()}
                  className="flex-1 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Cetak Presensi</span>
                </button>
              </div>
            </div>
          </div>

          {/* Deep Analytics: Komposisi Tingkat Kelas Peserta Hadir (Di Bawah Kompleks) */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-2xs space-y-3">
            <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2">
              <Users className="w-4 h-4 text-indigo-600" />
              Komposisi Kehadiran Peserta Berdasarkan Tingkat Kelas
            </h4>
            <div className="grid grid-cols-3 gap-3 text-center">
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                <span className="text-[10px] text-slate-400 font-bold uppercase block">Kelas X</span>
                <span className="text-lg font-black text-slate-900 mt-0.5 block">{gradeXCount} Siswa</span>
                <span className="text-[10px] text-slate-500">Kader Junior</span>
              </div>
              <div className="p-3 bg-indigo-50 rounded-xl border border-indigo-100">
                <span className="text-[10px] text-indigo-600 font-bold uppercase block">Kelas XI</span>
                <span className="text-lg font-black text-indigo-900 mt-0.5 block">{gradeXICount} Siswa</span>
                <span className="text-[10px] text-indigo-600">Pengurus Inti</span>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                <span className="text-[10px] text-slate-400 font-bold uppercase block">Kelas XII</span>
                <span className="text-lg font-black text-slate-900 mt-0.5 block">{gradeXIICount} Siswa</span>
                <span className="text-[10px] text-slate-500">Dewan Penasehat</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: PROGRAM KERJA */}
      {activeTab === 'proker' && (
        <div className="space-y-4">
          {/* Deep Analytics: RAB & Financial Burn Rate (Di Bawah Kompleks) */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-2xs">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Total Pagu Anggaran Proker</span>
              <p className="text-xl font-black text-slate-900 mt-1">{formatRupiah(totalProkerBudget)}</p>
              <p className="text-[10px] text-slate-400 mt-0.5">{workPrograms.length} Rencana kegiatan semester ini</p>
            </div>
            <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-2xs">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Rata-Rata Capaian Proker</span>
              <p className="text-xl font-black text-indigo-600 mt-1">{avgProkerProgress}%</p>
              <div className="w-full h-1.5 bg-slate-100 rounded-full mt-1.5 overflow-hidden">
                <div className="h-full bg-indigo-600 rounded-full" style={{ width: `${avgProkerProgress}%` }} />
              </div>
            </div>
            <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-2xs">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Status Kelayakan</span>
              <p className="text-xl font-black text-emerald-600 mt-1">
                {workPrograms.filter((p) => p.status === 'disetujui' || p.status === 'berjalan' || p.status === 'selesai').length} / {workPrograms.length}
              </p>
              <p className="text-[10px] text-emerald-600 mt-0.5 font-semibold">Telah disetujui Pembina OSIS</p>
            </div>
          </div>

          <div className="flex items-center justify-between bg-white p-4 rounded-2xl border border-slate-200/80 shadow-2xs">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Program Kerja & Capaian Milestone</h3>
              <p className="text-xs text-slate-500">Kelola target anggaran dan perbarui progres pelaksanaan</p>
            </div>
            <button
              onClick={() => setIsAddProkerModalOpen(true)}
              className="px-3.5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold shadow-sm flex items-center gap-1.5 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Tambah Proker</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {workPrograms.map((p) => (
              <div
                key={p.id}
                className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-2xs space-y-4 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] font-bold text-indigo-700 bg-indigo-50 px-2.5 py-0.5 rounded-full uppercase">
                      {p.divisionName}
                    </span>
                    <span
                      className={`text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full ${
                        p.status === 'selesai'
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : 'bg-indigo-50 text-indigo-700 border border-indigo-200'
                      }`}
                    >
                      {p.status}
                    </span>
                  </div>

                  <h4 className="text-sm font-bold text-slate-900">{p.title}</h4>
                  <p className="text-xs text-slate-600 mt-1 line-clamp-2 leading-relaxed">
                    {p.description}
                  </p>

                  <div className="grid grid-cols-2 gap-2 mt-3 pt-3 border-t border-slate-100 text-xs">
                    <div>
                      <span className="text-[10px] text-slate-400 block">Kebutuhan Anggaran:</span>
                      <span className="font-bold text-slate-800">{formatRupiah(p.estimatedBudget)}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 block">Target Waktu:</span>
                      <span className="font-semibold text-slate-700">{formatDateIndo(p.targetDate)}</span>
                    </div>
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-100 space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-500 font-semibold flex items-center gap-1">
                      <Sliders className="w-3.5 h-3.5 text-slate-400" />
                      Progress:
                    </span>
                    <span className="font-extrabold text-indigo-600">{p.progressPercent}%</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    step="5"
                    value={p.progressPercent}
                    onChange={(e) => handleProgressChange(p.id, Number(e.target.value))}
                    className="w-full accent-indigo-600 h-2 bg-slate-100 rounded-lg cursor-pointer"
                  />
                </div>

                {canApprove && p.status === 'diajukan' && (
                  <div className="pt-2 flex items-center justify-between bg-amber-50 p-2.5 rounded-xl border border-amber-200/60">
                    <span className="text-[10px] font-bold text-amber-900">Perlu Persetujuan:</span>
                    <div className="flex gap-1.5">
                      <button
                        onClick={() => updateWorkProgram(p.id, { status: 'disetujui' })}
                        className="px-2.5 py-1 bg-emerald-600 text-white rounded-lg text-xs font-bold flex items-center gap-1 cursor-pointer"
                      >
                        <Check className="w-3 h-3" /> Setujui
                      </button>
                      <button
                        onClick={() => updateWorkProgram(p.id, { status: 'ditolak' })}
                        className="px-2.5 py-1 bg-rose-600 text-white rounded-lg text-xs font-bold flex items-center gap-1 cursor-pointer"
                      >
                        <X className="w-3 h-3" /> Tolak
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 3: JADWAL RAPAT & NOTULEN */}
      {activeTab === 'rapat' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between bg-white p-4 rounded-2xl border border-slate-200/80 shadow-2xs">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Jadwal Agenda Rapat & Notulensi</h3>
              <p className="text-xs text-slate-500">Kelola jadwal musyawarah pengurus dan arsip keputusan rapat</p>
            </div>
            <button
              onClick={() => setIsAddMeetingModalOpen(true)}
              className="px-3.5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold shadow-sm flex items-center gap-1.5 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Jadwalkan Rapat</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {meetings.map((m) => (
              <div
                key={m.id}
                className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-2xs space-y-3 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-[10px] font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-full uppercase">
                      Rapat {m.type}
                    </span>
                    <span className="text-[10px] text-slate-400 font-mono">Kode: {m.qrToken}</span>
                  </div>

                  <h4 className="text-sm font-bold text-slate-900">{m.title}</h4>
                  <p className="text-xs text-slate-600 mt-1 leading-relaxed line-clamp-2">
                    {m.description}
                  </p>

                  <div className="space-y-1 pt-3 border-t border-slate-100 text-xs text-slate-500">
                    <p className="flex items-center gap-2">
                      <Calendar className="w-3.5 h-3.5 text-slate-400" />
                      <span>{formatDateIndo(m.meetingDate)} ({m.startTime} - {m.endTime} WIB)</span>
                    </p>
                    <p className="flex items-center gap-2">
                      <MapPin className="w-3.5 h-3.5 text-slate-400" />
                      <span>{m.location}</span>
                    </p>
                  </div>
                </div>

                {m.notulen && (
                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 text-xs text-slate-700 italic">
                    <span className="not-italic text-[10px] font-bold text-slate-400 block mb-0.5 uppercase">
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
        <div className="space-y-4">
          <div className="flex items-center justify-between bg-white p-4 rounded-2xl border border-slate-200/80 shadow-2xs">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Galeri Foto Dokumentasi Kegiatan</h3>
              <p className="text-xs text-slate-500">Pilih foto dari komputer lokal untuk mendokumentasikan kegiatan</p>
            </div>
            <button
              onClick={() => setIsAddPhotoModalOpen(true)}
              className="px-3.5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold shadow-sm flex items-center gap-1.5 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Upload Foto dari Komputer</span>
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {allPhotos.map((item) => (
              <div
                key={item.id}
                onClick={() => setLightboxPhoto(item.url)}
                className="group relative bg-white rounded-2xl overflow-hidden border border-slate-200/80 shadow-2xs cursor-pointer aspect-4/3"
              >
                <img
                  src={item.url}
                  alt={item.eventTitle}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-900/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity p-4 flex flex-col justify-end text-white">
                  <span className="text-[10px] font-bold text-indigo-300">{item.eventDate}</span>
                  <p className="text-xs font-bold leading-tight mt-0.5 line-clamp-2">
                    {item.eventTitle}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Modal Add Proker with Thousands Separator Dots */}
      <Modal
        isOpen={isAddProkerModalOpen}
        onClose={() => setIsAddProkerModalOpen(false)}
        title="Tambah Program Kerja Baru"
        subtitle="Nominal anggaran otomatis terformat dengan titik ribuan (misal: 10.000, 100.000)"
      >
        <form onSubmit={handleProkerSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">Nama Program Kerja</label>
            <input
              type="text"
              value={prokerForm.title}
              onChange={(e) => setProkerForm({ ...prokerForm, title: e.target.value })}
              placeholder="Contoh: Lomba Desain Poster & Web Vokasi"
              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-indigo-500"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">Divisi Penanggung Jawab</label>
              <select
                value={prokerForm.divisionId}
                onChange={(e) => setProkerForm({ ...prokerForm, divisionId: e.target.value })}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-indigo-500"
              >
                {divisions.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">
                Estimasi Anggaran (Rp)
              </label>
              <input
                type="text"
                value={prokerForm.estimatedBudgetRaw}
                onChange={(e) => {
                  const num = parseFormattedNumber(e.target.value);
                  setProkerForm({ ...prokerForm, estimatedBudgetRaw: formatNumber(num) });
                }}
                placeholder="10.000 / 100.000"
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-indigo-500 font-bold text-slate-800"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">Target Tanggal</label>
            <input
              type="date"
              value={prokerForm.targetDate}
              onChange={(e) => setProkerForm({ ...prokerForm, targetDate: e.target.value })}
              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-indigo-500"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">Deskripsi Proker</label>
            <textarea
              value={prokerForm.description}
              onChange={(e) => setProkerForm({ ...prokerForm, description: e.target.value })}
              rows={3}
              placeholder="Jelaskan tujuan dan sasaran kegiatan..."
              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-indigo-500"
              required
            />
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setIsAddProkerModalOpen(false)}
              className="px-4 py-2 bg-slate-100 text-slate-600 text-xs font-semibold rounded-xl cursor-pointer"
            >
              Batal
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-xl cursor-pointer"
            >
              Simpan Proker
            </button>
          </div>
        </form>
      </Modal>

      {/* Modal Add Meeting */}
      <Modal
        isOpen={isAddMeetingModalOpen}
        onClose={() => setIsAddMeetingModalOpen(false)}
        title="Jadwalkan Rapat Baru"
        subtitle="Agenda rapat koordinasi pengurus"
      >
        <form onSubmit={handleMeetingSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">Judul Rapat</label>
            <input
              type="text"
              value={meetingForm.title}
              onChange={(e) => setMeetingForm({ ...meetingForm, title: e.target.value })}
              placeholder="Contoh: Rapat Koordinasi Panitia Classmeeting"
              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-indigo-500"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">Tanggal</label>
              <input
                type="date"
                value={meetingForm.meetingDate}
                onChange={(e) => setMeetingForm({ ...meetingForm, meetingDate: e.target.value })}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-indigo-500"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">Lokasi</label>
              <input
                type="text"
                value={meetingForm.location}
                onChange={(e) => setMeetingForm({ ...meetingForm, location: e.target.value })}
                placeholder="Ruang OSIS / Lab Komputer"
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-indigo-500"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">Agenda Pembahasan</label>
            <textarea
              value={meetingForm.description}
              onChange={(e) => setMeetingForm({ ...meetingForm, description: e.target.value })}
              rows={3}
              placeholder="Poin-poin yang akan dibahas..."
              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-indigo-500"
              required
            />
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setIsAddMeetingModalOpen(false)}
              className="px-4 py-2 bg-slate-100 text-slate-600 text-xs font-semibold rounded-xl cursor-pointer"
            >
              Batal
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-indigo-600 text-white text-xs font-bold rounded-xl cursor-pointer"
            >
              Jadwalkan Rapat
            </button>
          </div>
        </form>
      </Modal>

      {/* Modal Add Photo */}
      <Modal
        isOpen={isAddPhotoModalOpen}
        onClose={() => setIsAddPhotoModalOpen(false)}
        title="Upload Foto Dokumentasi dari Komputer"
        subtitle="Pilih foto dokumentasi dari penyimpanan komputer atau HP Anda"
      >
        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (selectedEventId && newPhotoUrl) {
              addEventPhoto(selectedEventId, newPhotoUrl);
              setNewPhotoUrl('');
              setIsAddPhotoModalOpen(false);
            }
          }}
          className="space-y-4"
        >
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">Pilih Kegiatan Terkait</label>
            <select
              value={selectedEventId}
              onChange={(e) => setSelectedEventId(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-indigo-500"
            >
              {events.map((evt) => (
                <option key={evt.id} value={evt.id}>
                  {evt.title} ({evt.eventDate})
                </option>
              ))}
            </select>
          </div>

          <ImagePicker
            label="Pilih Foto Berkas Lokal (Komputer / HP)"
            value={newPhotoUrl}
            onChange={(url) => setNewPhotoUrl(url)}
            helperText="Format: JPG, PNG, WebP (maks 5MB)"
            aspectRatio="video"
          />

          <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setIsAddPhotoModalOpen(false)}
              className="px-4 py-2 bg-slate-100 text-slate-600 text-xs font-semibold rounded-xl cursor-pointer"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={!newPhotoUrl}
              className="px-4 py-2 bg-indigo-600 disabled:opacity-50 text-white text-xs font-bold rounded-xl cursor-pointer"
            >
              Simpan Foto Dokumentasi
            </button>
          </div>
        </form>
      </Modal>

      {/* Lightbox Modal */}
      {lightboxPhoto && (
        <div
          className="fixed inset-0 z-50 bg-slate-950/90 backdrop-blur-sm flex items-center justify-center p-4 cursor-pointer"
          onClick={() => setLightboxPhoto(null)}
        >
          <img
            src={lightboxPhoto}
            alt="Preview"
            className="max-h-[85vh] max-w-[90vw] object-contain rounded-2xl shadow-2xl"
          />
        </div>
      )}
    </div>
  );
};


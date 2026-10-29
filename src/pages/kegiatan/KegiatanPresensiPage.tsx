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
  Download,
  Users,
  ListTodo,
  CheckSquare,
  Square,
  Trash2,
  ChevronDown,
  ChevronUp,
  User,
  Building2,
  AlertCircle,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { WorkProgram, Meeting, ProkerTask, CommitteeSection } from '../../types';
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
    members,
    addWorkProgram,
    updateWorkProgram,
    addProkerTask,
    toggleProkerTask,
    deleteProkerTask,
    addMeeting,
    updateMeeting,
    addEventPhoto,
    currentRole,
    showToast,
    orgProfile,
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

  // Proker Committee Task Management State
  const [expandedProkerId, setExpandedProkerId] = useState<string | null>('proker-1');
  const [isAddTaskModalOpen, setIsAddTaskModalOpen] = useState(false);
  const [activeProkerForTask, setActiveProkerForTask] = useState<WorkProgram | null>(null);
  const [taskForm, setTaskForm] = useState({
    title: '',
    section: 'Seksi Acara' as CommitteeSection,
    assignedMemberId: '',
    assignedMemberName: '',
    dueDate: new Date().toISOString().split('T')[0],
  });

  const handleOpenAddTask = (proker: WorkProgram) => {
    setActiveProkerForTask(proker);
    const defaultMember = members[0];
    setTaskForm({
      title: '',
      section: 'Seksi Acara',
      assignedMemberId: defaultMember?.id || '',
      assignedMemberName: defaultMember?.fullName || '',
      dueDate: proker.targetDate || new Date().toISOString().split('T')[0],
    });
    setIsAddTaskModalOpen(true);
  };

  const handleTaskSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeProkerForTask || !taskForm.title.trim()) return;
    const assigned = members.find((m) => m.id === taskForm.assignedMemberId);
    addProkerTask(activeProkerForTask.id, {
      title: taskForm.title,
      section: taskForm.section,
      assignedMemberId: taskForm.assignedMemberId,
      assignedMemberName: assigned?.fullName || taskForm.assignedMemberName,
      dueDate: taskForm.dueDate,
      isCompleted: false,
    });
    setIsAddTaskModalOpen(false);
    setExpandedProkerId(activeProkerForTask.id);
  };

  // Section badge styles strictly using 2-color variations
  const getSectionBadgeColor = (sec: CommitteeSection) => {
    switch (sec) {
      case 'Ketua Pelaksana':
        return 'bg-[#1F3A5F] text-[#FAF6EE] border-[#1F3A5F]';
      case 'Seksi Acara':
        return 'bg-[#E4EAF2] text-[#1F3A5F] border-[#E6DFD0] dark:bg-[#1F3A5F]/40 dark:text-[#E4EAF2] dark:border-[#283D56]';
      case 'Seksi Perlengkapan':
        return 'bg-[#FBEBC8] text-[#1F3A5F] border-[#E6DFD0] dark:bg-[#F2B544]/20 dark:text-[#FAF6EE] dark:border-[#283D56]';
      case 'Seksi Konsumsi':
        return 'bg-[#FAF6EE] text-[#1F3A5F] border-[#E6DFD0] dark:bg-[#17293E] dark:text-[#FAF6EE] dark:border-[#283D56]';
      case 'Seksi Pubdok':
        return 'bg-[#E4EAF2] text-[#1F3A5F] border-[#E6DFD0] dark:bg-[#1F3A5F]/40 dark:text-[#E4EAF2] dark:border-[#283D56]';
      case 'Seksi Humas':
        return 'bg-[#FBEBC8] text-[#1F3A5F] border-[#E6DFD0] dark:bg-[#F2B544]/20 dark:text-[#FAF6EE] dark:border-[#283D56]';
      case 'Seksi Keamanan':
        return 'bg-[#FAF6EE] text-[#1F3A5F] border-[#E6DFD0] dark:bg-[#17293E] dark:text-[#FAF6EE] dark:border-[#283D56]';
      default:
        return 'bg-[#FAF6EE] text-[#5A6472] border-[#E6DFD0] dark:bg-[#17293E] dark:text-[#9AA8B8] dark:border-[#283D56]';
    }
  };

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
      <div className="simo-card p-6 sm:p-7 flex flex-col sm:flex-row sm:items-center justify-between gap-5">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-[8px] bg-[#E4EAF2] dark:bg-[#1F3A5F]/40 text-[#1F3A5F] dark:text-[#E4EAF2] text-[14px] font-bold mb-2">
            <Building2 className="w-4 h-4" />
            <span>Kesiswaan &amp; Kedisiplinan • {orgProfile.name}</span>
          </div>
          <h2 className="text-2xl font-extrabold text-[#1F3A5F] dark:text-[#FAF6EE] tracking-tight">
            Kegiatan &amp; Presensi Organisasi
          </h2>
          <p className="text-[15px] text-[#5A6472] dark:text-[#9AA8B8] mt-1">
            Presensi scan wajah biometrik, manajemen proker, jadwal agenda rapat, dan galeri foto
          </p>
        </div>

        {/* Tab Controls */}
        <div className="flex p-1.5 bg-[#FAF6EE] dark:bg-[#0E1B2C] border border-[#E6DFD0] dark:border-[#283D56] rounded-[14px] gap-1 self-start sm:self-auto shrink-0 flex-wrap">
          <button
            onClick={() => setActiveTab('presensi')}
            className={`min-h-[40px] px-3.5 py-1.5 text-[14px] font-bold rounded-[10px] transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === 'presensi'
                ? 'bg-[#1F3A5F] text-[#FAF6EE]'
                : 'text-[#5A6472] dark:text-[#9AA8B8] hover:text-[#1F3A5F] dark:hover:text-[#FAF6EE]'
            }`}
          >
            <Camera className="w-4 h-4" />
            <span>Presensi Wajah / QR</span>
          </button>
          <button
            onClick={() => setActiveTab('proker')}
            className={`min-h-[40px] px-3.5 py-1.5 text-[14px] font-bold rounded-[10px] transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === 'proker'
                ? 'bg-[#1F3A5F] text-[#FAF6EE]'
                : 'text-[#5A6472] dark:text-[#9AA8B8] hover:text-[#1F3A5F] dark:hover:text-[#FAF6EE]'
            }`}
          >
            <Briefcase className="w-4 h-4" />
            <span>Program Kerja</span>
          </button>
          <button
            onClick={() => setActiveTab('rapat')}
            className={`min-h-[40px] px-3.5 py-1.5 text-[14px] font-bold rounded-[10px] transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === 'rapat'
                ? 'bg-[#1F3A5F] text-[#FAF6EE]'
                : 'text-[#5A6472] dark:text-[#9AA8B8] hover:text-[#1F3A5F] dark:hover:text-[#FAF6EE]'
            }`}
          >
            <MessagesSquare className="w-4 h-4" />
            <span>Jadwal &amp; Notulen</span>
          </button>
          <button
            onClick={() => setActiveTab('dokumentasi')}
            className={`min-h-[40px] px-3.5 py-1.5 text-[14px] font-bold rounded-[10px] transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === 'dokumentasi'
                ? 'bg-[#1F3A5F] text-[#FAF6EE]'
                : 'text-[#5A6472] dark:text-[#9AA8B8] hover:text-[#1F3A5F] dark:hover:text-[#FAF6EE]'
            }`}
          >
            <Camera className="w-4 h-4" />
            <span>Dokumentasi Foto</span>
          </button>
        </div>
      </div>

      {/* TAB 1: PRESENSI CERDAS */}
      {activeTab === 'presensi' && (
        <div className="space-y-6">
          <div className="simo-card p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3 flex-wrap">
              <span className="text-[14px] font-bold text-[#1F3A5F] dark:text-[#FAF6EE] shrink-0">Pilih Agenda Rapat:</span>
              <select
                value={selectedMeetingId}
                onChange={(e) => setSelectedMeetingId(e.target.value)}
                className="simo-input min-h-[44px] px-3 text-[14px] font-semibold w-full sm:w-auto"
              >
                {meetings.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.title} ({formatDateIndo(m.meetingDate)})
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-center gap-3">
              <span
                className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-[10px] text-[13px] font-bold ${
                  currentMeeting?.isAttendanceOpen
                    ? 'simo-badge-blue'
                    : 'simo-badge-neutral'
                }`}
              >
                <span
                  className={`w-2.5 h-2.5 rounded-full ${
                    currentMeeting?.isAttendanceOpen ? 'bg-[#1F3A5F] dark:bg-[#FAF6EE]' : 'bg-[#5A6472]'
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
                className="simo-btn-outline min-h-[44px] px-4 rounded-[12px] text-[14px] font-bold cursor-pointer"
              >
                {currentMeeting?.isAttendanceOpen ? 'Tutup Sesi' : 'Buka Sesi'}
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <div className="lg:col-span-7 simo-card p-6">
              <FaceRecognitionScanner
                meetingId={currentMeeting.id}
                meetingTitle={currentMeeting.title}
                isAttendanceOpen={currentMeeting.isAttendanceOpen}
              />
            </div>

            <div className="lg:col-span-5 simo-card p-6 space-y-4 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between pb-3 border-b border-[#E6DFD0] dark:border-[#283D56] mb-3">
                  <div>
                    <h3 className="text-[17px] font-extrabold text-[#1F3A5F] dark:text-[#FAF6EE]">Daftar Kehadiran</h3>
                    <p className="text-[13px] text-[#5A6472] dark:text-[#9AA8B8]">{currentMeeting.title}</p>
                  </div>
                  <span className="px-3 py-1 rounded-[8px] bg-[#E4EAF2] text-[#1F3A5F] dark:bg-[#1F3A5F]/40 dark:text-[#FAF6EE] font-bold text-[13px]">
                    {meetingAttendances.length} Hadir
                  </span>
                </div>

                <div className="space-y-2.5 max-h-96 overflow-y-auto pr-1">
                  {meetingAttendances.length > 0 ? (
                    meetingAttendances.map((att) => (
                      <div
                        key={att.id}
                        className="p-3.5 rounded-[12px] bg-[#FAF6EE] dark:bg-[#17293E] border border-[#E6DFD0] dark:border-[#283D56] flex items-center justify-between"
                      >
                        <div>
                          <p className="text-[14px] font-bold text-[#1F3A5F] dark:text-[#FAF6EE] leading-tight">
                            {att.memberName}
                          </p>
                          <p className="text-[12px] text-[#5A6472] dark:text-[#9AA8B8] mt-1">
                            {att.grade} • {att.major} ({att.nisn})
                          </p>
                        </div>
                        <div className="text-right">
                          <span className="inline-block px-2.5 py-0.5 rounded-[6px] text-[11px] font-bold uppercase bg-[#E4EAF2] text-[#1F3A5F] dark:bg-[#1F3A5F]/40 dark:text-[#FAF6EE]">
                            {att.status}
                          </span>
                          <p className="text-[12px] text-[#5A6472] dark:text-[#9AA8B8] font-mono mt-1">
                            {att.checkInTime}
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

              <div className="flex gap-3 mt-4 pt-3 border-t border-[#E6DFD0] dark:border-[#283D56]">
                <button
                  onClick={exportAttendanceCSV}
                  className="simo-btn-outline flex-1 min-h-[44px] rounded-[12px] text-[14px] font-bold flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Download className="w-4 h-4" />
                  <span>Ekspor CSV</span>
                </button>
                <button
                  onClick={() => window.print()}
                  className="simo-btn-primary flex-1 min-h-[44px] rounded-[12px] text-[14px] font-bold flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Printer className="w-4 h-4" />
                  <span>Cetak Presensi</span>
                </button>
              </div>
            </div>
          </div>

          {/* Deep Analytics: Komposisi Tingkat Kelas Peserta Hadir (Single Continuous Card with Dividers) */}
          <div className="simo-card p-0 overflow-hidden">
            <div className="p-4 sm:p-5 border-b border-[#E6DFD0] dark:border-[#283D56]">
              <h4 className="text-[14px] font-bold text-[#1F3A5F] dark:text-[#FAF6EE] uppercase tracking-wider flex items-center gap-2">
                <Users className="w-4 h-4 text-[#1F3A5F] dark:text-[#F2B544]" />
                <span>Komposisi Kehadiran Peserta Berdasarkan Tingkat Kelas</span>
              </h4>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 divide-y sm:divide-y-0 sm:divide-x divide-[#E6DFD0] dark:divide-[#283D56] text-center">
              <div className="p-6">
                <span className="text-[13px] text-[#5A6472] dark:text-[#9AA8B8] font-bold uppercase block">Kelas X</span>
                <span className="text-3xl font-black text-[#1F3A5F] dark:text-[#FAF6EE] mt-1 block">{gradeXCount} Siswa</span>
                <span className="text-[13px] text-[#5A6472] dark:text-[#9AA8B8] mt-1 block">Kader Junior</span>
              </div>
              <div className="p-6 bg-[#E4EAF2]/60 dark:bg-[#1F3A5F]/30">
                <span className="text-[13px] text-[#1F3A5F] dark:text-[#FAF6EE] font-bold uppercase block">Kelas XI</span>
                <span className="text-3xl font-black text-[#1F3A5F] dark:text-[#FAF6EE] mt-1 block">{gradeXICount} Siswa</span>
                <span className="text-[13px] text-[#1F3A5F] dark:text-[#FAF6EE] mt-1 block">Pengurus Inti</span>
              </div>
              <div className="p-6">
                <span className="text-[13px] text-[#5A6472] dark:text-[#9AA8B8] font-bold uppercase block">Kelas XII</span>
                <span className="text-3xl font-black text-[#1F3A5F] dark:text-[#FAF6EE] mt-1 block">{gradeXIICount} Siswa</span>
                <span className="text-[13px] text-[#5A6472] dark:text-[#9AA8B8] mt-1 block">Dewan Penasehat</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: PROGRAM KERJA */}
      {activeTab === 'proker' && (
        <div className="space-y-6">
          {/* Deep Analytics: RAB & Financial (Single Continuous Card with Dividers) */}
          <div className="simo-card p-0 grid grid-cols-1 sm:grid-cols-3 divide-y sm:divide-y-0 sm:divide-x divide-[#E6DFD0] dark:divide-[#283D56] overflow-hidden">
            <div className="p-6">
              <span className="text-[14px] font-bold text-[#5A6472] dark:text-[#9AA8B8]">Total Pagu Anggaran Proker</span>
              <p className="text-3xl font-black text-[#1F3A5F] dark:text-[#FAF6EE] mt-1">{formatRupiah(totalProkerBudget)}</p>
              <p className="text-[13px] text-[#5A6472] dark:text-[#9AA8B8] mt-1">{workPrograms.length} Rencana kegiatan semester ini</p>
            </div>
            <div className="p-6 bg-[#E4EAF2]/60 dark:bg-[#1F3A5F]/30">
              <span className="text-[14px] font-bold text-[#1F3A5F] dark:text-[#FAF6EE]">Rata-Rata Capaian Proker</span>
              <p className="text-3xl font-black text-[#1F3A5F] dark:text-[#FAF6EE] mt-1">{avgProkerProgress}%</p>
              <div className="w-full h-2 bg-[#FAF6EE] dark:bg-[#0E1B2C] rounded-full mt-2 overflow-hidden border border-[#E6DFD0] dark:border-[#283D56]">
                <div className="h-full bg-[#1F3A5F] dark:bg-[#F2B544] rounded-full" style={{ width: `${avgProkerProgress}%` }} />
              </div>
            </div>
            <div className="p-6">
              <span className="text-[14px] font-bold text-[#5A6472] dark:text-[#9AA8B8]">Status Kelayakan</span>
              <p className="text-3xl font-black text-[#1F3A5F] dark:text-[#FAF6EE] mt-1">
                {workPrograms.filter((p) => p.status === 'disetujui' || p.status === 'berjalan' || p.status === 'selesai').length} / {workPrograms.length}
              </p>
              <p className="text-[13px] text-[#5A6472] dark:text-[#9AA8B8] mt-1 font-semibold">Telah disetujui Pembina OSIS</p>
            </div>
          </div>

          <div className="simo-card p-5 flex items-center justify-between">
            <div>
              <h3 className="text-[17px] font-extrabold text-[#1F3A5F] dark:text-[#FAF6EE]">Program Kerja &amp; Capaian Milestone</h3>
              <p className="text-[14px] text-[#5A6472] dark:text-[#9AA8B8]">Kelola target anggaran dan perbarui progres pelaksanaan</p>
            </div>
            <button
              onClick={() => setIsAddProkerModalOpen(true)}
              className="simo-btn-primary min-h-[44px] px-5 py-2.5 rounded-[12px] flex items-center gap-2 cursor-pointer shrink-0"
            >
              <Plus className="w-4 h-4" />
              <span>Tambah Proker</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {workPrograms.map((p) => {
              const tasks = p.tasks || [];
              const completedCount = tasks.filter((t) => t.isCompleted).length;
              const isExpanded = expandedProkerId === p.id;

              return (
                <div
                  key={p.id}
                  className="simo-card p-6 space-y-4 flex flex-col justify-between"
                >
                  <div className="space-y-3.5">
                    <div className="flex items-center justify-between">
                      <span className="text-[12px] font-bold text-[#1F3A5F] dark:text-[#FAF6EE] bg-[#E4EAF2] dark:bg-[#1F3A5F]/40 border border-[#E6DFD0] dark:border-[#283D56] px-3 py-1 rounded-[8px] uppercase">
                        {p.divisionName}
                      </span>
                      <span
                        className={p.status === 'selesai' ? 'simo-badge-blue' : p.status === 'berjalan' ? 'simo-badge-amber' : 'simo-badge-neutral'}
                      >
                        {p.status}
                      </span>
                    </div>

                    <div>
                      <h4 className="text-[17px] font-extrabold text-[#1F3A5F] dark:text-[#FAF6EE]">{p.title}</h4>
                      <p className="text-[14px] text-[#5A6472] dark:text-[#9AA8B8] mt-1 line-clamp-2 leading-relaxed">
                        {p.description}
                      </p>
                    </div>

                    <div className="grid grid-cols-2 gap-3 pt-3 border-t border-[#E6DFD0] dark:border-[#283D56] text-[14px]">
                      <div>
                        <span className="text-[12px] text-[#5A6472] dark:text-[#9AA8B8] block">Kebutuhan Anggaran:</span>
                        <span className="font-extrabold text-[#1F3A5F] dark:text-[#FAF6EE]">{formatRupiah(p.estimatedBudget)}</span>
                      </div>
                      <div>
                        <span className="text-[12px] text-[#5A6472] dark:text-[#9AA8B8] block">Target Waktu:</span>
                        <span className="font-semibold text-[#1F3A5F] dark:text-[#FAF6EE]">{formatDateIndo(p.targetDate)}</span>
                      </div>
                    </div>

                    {/* Progress Slider */}
                    <div className="pt-3 border-t border-[#E6DFD0] dark:border-[#283D56] space-y-2">
                      <div className="flex items-center justify-between text-[14px]">
                        <span className="text-[#5A6472] dark:text-[#9AA8B8] font-semibold flex items-center gap-1.5">
                          <Sliders className="w-4 h-4 text-[#5A6472]" />
                          Progres Capaian Proker:
                        </span>
                        <span className="font-extrabold text-[#1F3A5F] dark:text-[#F2B544]">{p.progressPercent}%</span>
                      </div>
                      <input
                        type="range"
                        min="0"
                        max="100"
                        step="5"
                        value={p.progressPercent}
                        onChange={(e) => handleProgressChange(p.id, Number(e.target.value))}
                        className="w-full accent-[#1F3A5F] h-2 bg-[#FAF6EE] dark:bg-[#0E1B2C] rounded-lg cursor-pointer border border-[#E6DFD0] dark:border-[#283D56]"
                      />
                    </div>

                    {/* Kepanitiaan & Jobdesk Checklist Accordion */}
                    <div className="pt-2.5 border-t border-[#E6DFD0] dark:border-[#283D56]">
                      <div className="flex items-center justify-between">
                        <button
                          type="button"
                          onClick={() => setExpandedProkerId(isExpanded ? null : p.id)}
                          className="flex items-center gap-2 text-[14px] font-bold text-[#1F3A5F] dark:text-[#FAF6EE] hover:underline cursor-pointer"
                        >
                          <ListTodo className="w-4 h-4 text-[#1F3A5F] dark:text-[#F2B544] shrink-0" />
                          <span>Jobdesk Panitia</span>
                          <span className="text-[12px] px-2.5 py-0.5 rounded-[8px] font-bold bg-[#E4EAF2] text-[#1F3A5F] dark:bg-[#1F3A5F]/40 dark:text-[#FAF6EE]">
                            {completedCount}/{tasks.length} Selesai
                          </span>
                        </button>

                        <div className="flex items-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => handleOpenAddTask(p)}
                            className="px-3 py-1 text-[13px] font-bold text-[#1F3A5F] dark:text-[#F2B544] hover:underline flex items-center gap-1 cursor-pointer"
                            title="Tambah Tugas Kepanitiaan"
                          >
                            <Plus className="w-3.5 h-3.5" />
                            <span>Tugas</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => setExpandedProkerId(isExpanded ? null : p.id)}
                            className="p-1.5 text-[#5A6472] dark:text-[#9AA8B8] rounded-md cursor-pointer"
                          >
                            {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                          </button>
                        </div>
                      </div>

                      {/* Expanded Task List */}
                      {isExpanded && (
                        <div className="mt-3.5 space-y-2.5 pt-3 border-t border-[#E6DFD0] dark:border-[#283D56]">
                          {tasks.length === 0 ? (
                            <div className="text-center py-4 px-3 bg-[#FAF6EE] dark:bg-[#0E1B2C] rounded-[12px] border border-dashed border-[#E6DFD0] dark:border-[#283D56] text-[13px] text-[#5A6472] dark:text-[#9AA8B8]">
                              Belum ada checklist tugas panitia. Klik tombol <strong className="text-[#1F3A5F] dark:text-[#FAF6EE]">+ Tugas</strong> untuk menambahkan.
                            </div>
                          ) : (
                            <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                              {tasks.map((task) => (
                                <div
                                  key={task.id}
                                  className={`p-3 rounded-[12px] border transition-all flex items-start justify-between gap-2.5 text-[14px] ${
                                    task.isCompleted
                                      ? 'bg-[#FAF6EE]/70 dark:bg-[#0E1B2C]/70 border-[#E6DFD0] dark:border-[#283D56] text-[#5A6472]'
                                      : 'bg-[#FFFDF8] dark:bg-[#17293E] border-[#E6DFD0] dark:border-[#283D56] text-[#1F3A5F] dark:text-[#FAF6EE]'
                                  }`}
                                >
                                  <div className="flex items-start gap-2.5 min-w-0">
                                    <button
                                      type="button"
                                      onClick={() => toggleProkerTask(p.id, task.id)}
                                      className="mt-0.5 text-[#1F3A5F] dark:text-[#F2B544] cursor-pointer shrink-0"
                                      title={task.isCompleted ? 'Tandai belum selesai' : 'Tandai selesai'}
                                    >
                                      {task.isCompleted ? (
                                        <CheckSquare className="w-4 h-4 text-[#1F3A5F] dark:text-[#FAF6EE]" />
                                      ) : (
                                        <Square className="w-4 h-4 text-[#5A6472]" />
                                      )}
                                    </button>

                                    <div className="min-w-0">
                                      <p
                                        className={`font-semibold leading-snug break-words ${
                                          task.isCompleted ? 'line-through text-[#5A6472] dark:text-[#9AA8B8]' : ''
                                        }`}
                                      >
                                        {task.title}
                                      </p>
                                      <div className="flex flex-wrap items-center gap-2 mt-1.5">
                                        <span
                                          className={`text-[11px] font-bold px-2 py-0.5 rounded-[6px] border ${getSectionBadgeColor(
                                            task.section
                                          )}`}
                                        >
                                          {task.section}
                                        </span>
                                        {task.assignedMemberName && (
                                          <span className="inline-flex items-center gap-1 text-[12px] text-[#5A6472] dark:text-[#9AA8B8]">
                                            <User className="w-3.5 h-3.5 text-[#5A6472]" />
                                            {task.assignedMemberName}
                                          </span>
                                        )}
                                        {task.dueDate && (
                                          <span className="inline-flex items-center gap-1 text-[12px] text-[#5A6472] dark:text-[#9AA8B8]">
                                            <Clock className="w-3.5 h-3.5 text-[#5A6472]" />
                                            {task.dueDate}
                                          </span>
                                        )}
                                      </div>
                                    </div>
                                  </div>

                                  <button
                                    type="button"
                                    onClick={() => deleteProkerTask(p.id, task.id)}
                                    className="p-1 text-[#5A6472] hover:text-[#1F3A5F] rounded-md cursor-pointer transition-colors shrink-0"
                                    title="Hapus tugas ini"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </button>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>

                  {canApprove && p.status === 'diajukan' && (
                    <div className="pt-3 flex items-center justify-between bg-[#FBEBC8] dark:bg-[#F2B544]/20 p-3.5 rounded-[12px] border border-[#E6DFD0] dark:border-[#283D56]">
                      <span className="text-[13px] font-bold text-[#1F3A5F] dark:text-[#FAF6EE]">Perlu Persetujuan:</span>
                      <div className="flex gap-2">
                        <button
                          onClick={() => updateWorkProgram(p.id, { status: 'disetujui' })}
                          className="simo-btn-primary min-h-[36px] px-3.5 rounded-[10px] text-[13px] font-bold flex items-center gap-1 cursor-pointer"
                        >
                          <Check className="w-3.5 h-3.5" /> Setujui
                        </button>
                        <button
                          onClick={() => updateWorkProgram(p.id, { status: 'ditolak' })}
                          className="simo-btn-outline min-h-[36px] px-3.5 rounded-[10px] text-[13px] font-bold flex items-center gap-1 cursor-pointer"
                        >
                          <X className="w-3.5 h-3.5" /> Tolak
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 3: JADWAL RAPAT & NOTULEN */}
      {activeTab === 'rapat' && (
        <div className="space-y-6">
          <div className="simo-card p-5 flex items-center justify-between">
            <div>
              <h3 className="text-[17px] font-extrabold text-[#1F3A5F] dark:text-[#FAF6EE]">Jadwal Agenda Rapat &amp; Notulensi</h3>
              <p className="text-[14px] text-[#5A6472] dark:text-[#9AA8B8]">Kelola jadwal musyawarah pengurus dan arsip keputusan rapat</p>
            </div>
            <button
              onClick={() => setIsAddMeetingModalOpen(true)}
              className="simo-btn-primary min-h-[44px] px-5 py-2.5 rounded-[12px] flex items-center gap-2 cursor-pointer shrink-0"
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
          <div className="simo-card p-5 flex items-center justify-between">
            <div>
              <h3 className="text-[17px] font-extrabold text-[#1F3A5F] dark:text-[#FAF6EE]">Galeri Foto Dokumentasi Kegiatan</h3>
              <p className="text-[14px] text-[#5A6472] dark:text-[#9AA8B8]">Pilih foto dari komputer lokal untuk mendokumentasikan kegiatan</p>
            </div>
            <button
              onClick={() => setIsAddPhotoModalOpen(true)}
              className="simo-btn-primary min-h-[44px] px-5 py-2.5 rounded-[12px] flex items-center gap-2 cursor-pointer shrink-0"
            >
              <Plus className="w-4 h-4" />
              <span>Upload Foto dari Komputer</span>
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
            {allPhotos.map((item) => (
              <div
                key={item.id}
                onClick={() => setLightboxPhoto(item.url)}
                className="group relative bg-[#FFFDF8] dark:bg-[#17293E] rounded-[16px] overflow-hidden border border-[#E6DFD0] dark:border-[#283D56] cursor-pointer aspect-4/3"
              >
                <img
                  src={item.url}
                  alt={item.eventTitle}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#1F3A5F]/90 via-[#1F3A5F]/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity p-4 flex flex-col justify-end text-[#FAF6EE]">
                  <span className="text-[12px] font-bold text-[#F2B544]">{item.eventDate}</span>
                  <p className="text-[14px] font-bold leading-tight mt-1 line-clamp-2">
                    {item.eventTitle}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Modal Add Proker */}
      <Modal
        isOpen={isAddProkerModalOpen}
        onClose={() => setIsAddProkerModalOpen(false)}
        title="Tambah Program Kerja Baru"
        subtitle="Nominal anggaran otomatis terformat dengan titik ribuan (misal: 10.000, 100.000)"
      >
        <form onSubmit={handleProkerSubmit} className="space-y-4">
          <div>
            <label className="block text-[14px] font-bold text-[#1F3A5F] dark:text-[#FAF6EE] mb-1.5">Nama Program Kerja</label>
            <input
              type="text"
              value={prokerForm.title}
              onChange={(e) => setProkerForm({ ...prokerForm, title: e.target.value })}
              placeholder="Contoh: Lomba Desain Poster & Web Vokasi"
              className="simo-input min-h-[44px] text-[15px] w-full"
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-[14px] font-bold text-[#1F3A5F] dark:text-[#FAF6EE] mb-1.5">Divisi Penanggung Jawab</label>
              <select
                value={prokerForm.divisionId}
                onChange={(e) => setProkerForm({ ...prokerForm, divisionId: e.target.value })}
                className="simo-input min-h-[44px] text-[14px] w-full"
              >
                {divisions.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-[14px] font-bold text-[#1F3A5F] dark:text-[#FAF6EE] mb-1.5">
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
                className="simo-input min-h-[44px] text-[15px] font-bold w-full"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-[14px] font-bold text-[#1F3A5F] dark:text-[#FAF6EE] mb-1.5">Target Tanggal</label>
            <input
              type="date"
              value={prokerForm.targetDate}
              onChange={(e) => setProkerForm({ ...prokerForm, targetDate: e.target.value })}
              className="simo-input min-h-[44px] text-[14px] w-full"
              required
            />
          </div>

          <div>
            <label className="block text-[14px] font-bold text-[#1F3A5F] dark:text-[#FAF6EE] mb-1.5">Deskripsi Proker</label>
            <textarea
              value={prokerForm.description}
              onChange={(e) => setProkerForm({ ...prokerForm, description: e.target.value })}
              rows={3}
              placeholder="Jelaskan tujuan dan sasaran kegiatan..."
              className="simo-input text-[14px] w-full p-3 leading-relaxed"
              required
            />
          </div>

          <div className="flex justify-end gap-3 pt-3 border-t border-[#E6DFD0] dark:border-[#283D56]">
            <button
              type="button"
              onClick={() => setIsAddProkerModalOpen(false)}
              className="simo-btn-outline min-h-[44px] px-5 rounded-[12px] text-[14px] font-bold cursor-pointer"
            >
              Batal
            </button>
            <button
              type="submit"
              className="simo-btn-primary min-h-[44px] px-5 rounded-[12px] text-[14px] font-bold cursor-pointer"
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
            <label className="block text-[14px] font-bold text-[#1F3A5F] dark:text-[#FAF6EE] mb-1.5">Pilih Kegiatan Terkait</label>
            <select
              value={selectedEventId}
              onChange={(e) => setSelectedEventId(e.target.value)}
              className="simo-input min-h-[44px] text-[14px] w-full"
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

          <div className="flex justify-end gap-3 pt-3 border-t border-[#E6DFD0] dark:border-[#283D56]">
            <button
              type="button"
              onClick={() => setIsAddPhotoModalOpen(false)}
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

      {/* Modal Add Committee Task */}
      <Modal
        isOpen={isAddTaskModalOpen}
        onClose={() => setIsAddTaskModalOpen(false)}
        title="Tambah Tugas Kepanitiaan"
        subtitle={activeProkerForTask ? `Untuk Proker: ${activeProkerForTask.title}` : 'Penugasan jobdesk anggota panitia'}
      >
        <form onSubmit={handleTaskSubmit} className="space-y-4">
          <div>
            <label className="block text-[14px] font-bold text-[#1F3A5F] dark:text-[#FAF6EE] mb-1.5">
              Nama / Deskripsi Tugas <span className="text-[#F2B544]">*</span>
            </label>
            <input
              type="text"
              required
              value={taskForm.title}
              onChange={(e) => setTaskForm({ ...taskForm, title: e.target.value })}
              placeholder="Contoh: Booking Sound System & Genset 5000W"
              className="simo-input min-h-[44px] text-[15px] w-full"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-[14px] font-bold text-[#1F3A5F] dark:text-[#FAF6EE] mb-1.5">
                Seksi Kepanitiaan
              </label>
              <select
                value={taskForm.section}
                onChange={(e) => setTaskForm({ ...taskForm, section: e.target.value as CommitteeSection })}
                className="simo-input min-h-[44px] text-[14px] w-full"
              >
                <option value="Ketua Pelaksana">Ketua Pelaksana</option>
                <option value="Seksi Acara">Seksi Acara</option>
                <option value="Seksi Perlengkapan">Seksi Perlengkapan</option>
                <option value="Seksi Konsumsi">Seksi Konsumsi</option>
                <option value="Seksi Pubdok">Seksi Pubdok</option>
                <option value="Seksi Humas">Seksi Humas</option>
                <option value="Seksi Keamanan">Seksi Keamanan</option>
                <option value="Lainnya">Lainnya</option>
              </select>
            </div>

            <div>
              <label className="block text-[14px] font-bold text-[#1F3A5F] dark:text-[#FAF6EE] mb-1.5">
                Penanggung Jawab (PIC)
              </label>
              <select
                value={taskForm.assignedMemberId}
                onChange={(e) => {
                  const m = members.find((mem) => mem.id === e.target.value);
                  setTaskForm({
                    ...taskForm,
                    assignedMemberId: e.target.value,
                    assignedMemberName: m?.fullName || '',
                  });
                }}
                className="simo-input min-h-[44px] text-[14px] w-full"
              >
                {members.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.fullName} ({m.classRoom})
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-[14px] font-bold text-[#1F3A5F] dark:text-[#FAF6EE] mb-1.5">
              Target Selesai / Deadline
            </label>
            <input
              type="date"
              value={taskForm.dueDate}
              onChange={(e) => setTaskForm({ ...taskForm, dueDate: e.target.value })}
              className="simo-input min-h-[44px] text-[14px] w-full"
            />
          </div>

          <div className="flex justify-end gap-3 pt-3 border-t border-[#E6DFD0] dark:border-[#283D56]">
            <button
              type="button"
              onClick={() => setIsAddTaskModalOpen(false)}
              className="simo-btn-outline min-h-[44px] px-5 rounded-[12px] text-[14px] font-bold cursor-pointer"
            >
              Batal
            </button>
            <button
              type="submit"
              className="simo-btn-primary min-h-[44px] px-5 rounded-[12px] text-[14px] font-bold cursor-pointer"
            >
              Simpan Tugas
            </button>
          </div>
        </form>
      </Modal>

      {/* Lightbox Modal */}
      {lightboxPhoto && (
        <div
          className="fixed inset-0 z-50 bg-[#0E1B2C]/90 backdrop-blur-xs flex items-center justify-center p-4 cursor-pointer"
          onClick={() => setLightboxPhoto(null)}
        >
          <img
            src={lightboxPhoto}
            alt="Preview"
            className="max-h-[85vh] max-w-[90vw] object-contain rounded-[16px] border border-[#283D56]"
          />
        </div>
      )}
    </div>
  );
};

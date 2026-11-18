import React, { useState } from 'react';
import {
  Users,
  Layers,
  Plus,
  Search,
  Trash2,
  Edit,
  GraduationCap,
  UserCheck,
  Building2,
  Camera,
  AlertCircle,
  Lock,
  ShieldCheck,
  UserPlus,
  Phone,
  Calendar,
  CheckCircle2,
  Clock,
  Eye,
  Sparkles,
  ExternalLink,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { Member, UserRole, RecruitmentApplication } from '../../types';
import { Modal } from '../../components/common/Modal';
import { ImagePicker } from '../../components/common/ImagePicker';
import { StrukturOrganisasi } from '../organisasi/StrukturOrganisasi';

export const KeanggotaanPage: React.FC = () => {
  const {
    members,
    divisions,
    addMember,
    updateMember,
    deleteMember,
    recruitments,
    updateRecruitment,
    deleteRecruitment,
    approveRecruitmentToMember,
    keanggotaanTab,
    setKeanggotaanTab,
    orgProfile,
    currentRole,
    showToast,
  } = useApp();

  const activeTab = keanggotaanTab;
  const setActiveTab = setKeanggotaanTab;

  // RBAC Permission Check — hanya Ketua, Admin, dan Pembina
  const canManageMembers =
    currentRole === 'admin' ||
    currentRole === 'pembina' ||
    currentRole === 'ketua';

  // Filter states Direktori
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'aktif' | 'alumni'>('all');
  const [gradeFilter, setGradeFilter] = useState<string>('all');
  const [majorFilter, setMajorFilter] = useState<string>('all');

  // Pendaftar Oprec States
  const [recSearchTerm, setRecSearchTerm] = useState('');
  const [recStatusFilter, setRecStatusFilter] = useState<
    'all' | 'menunggu' | 'lolos_berkas' | 'wawancara' | 'diterima' | 'ditolak'
  >('all');
  const [selectedRecForDetail, setSelectedRecForDetail] = useState<RecruitmentApplication | null>(null);
  const [selectedRecForStatus, setSelectedRecForStatus] = useState<RecruitmentApplication | null>(null);
  const [selectedRecForApprove, setSelectedRecForApprove] = useState<RecruitmentApplication | null>(null);
  const [recToDelete, setRecToDelete] = useState<RecruitmentApplication | null>(null);

  // Status Edit Form State
  const [statusForm, setStatusForm] = useState<{
    status: RecruitmentApplication['status'];
    interviewSchedule: string;
    notes: string;
  }>({
    status: 'menunggu',
    interviewSchedule: '',
    notes: '',
  });

  // Approve Member Form State
  const [approveForm, setApproveForm] = useState<{
    divisionId: string;
    position: string;
  }>({
    divisionId: divisions[0]?.id || '',
    position: 'Anggota Sekbid',
  });

  // Modal Add / Edit
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingMember, setEditingMember] = useState<Member | null>(null);

  // Delete Confirm Modal
  const [memberToDelete, setMemberToDelete] = useState<Member | null>(null);

  const initialForm = {
    nisn: '',
    fullName: '',
    email: '',
    role: 'anggota' as UserRole,
    grade: 'XI' as 'X' | 'XI' | 'XII',
    classRoom: 'RPL 1',
    major: 'Rekayasa Perangkat Lunak',
    divisionId: divisions[0]?.id || '',
    position: 'Anggota Sekbid',
    phone: '',
    avatarUrl: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
    isActive: true,
    status: 'aktif' as 'aktif' | 'alumni',
    joinDate: new Date().toISOString().split('T')[0],
    generation: `Angkatan ${orgProfile.academicYear}`,
  };

  const [formData, setFormData] = useState(initialForm);

  const handleOpenAdd = () => {
    if (!canManageMembers) {
      showToast(
        'Akses dibatasi: Hanya Ketua, Sekretaris, Pembina, atau Admin yang dapat menambah data siswa.',
        'error'
      );
      return;
    }
    setEditingMember(null);
    setFormData(initialForm);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (m: Member) => {
    if (!canManageMembers) {
      showToast(
        'Akses dibatasi: Hanya Pengurus BPH atau Admin yang dapat mengubah data siswa.',
        'error'
      );
      return;
    }
    if (m.role === 'admin') {
      showToast('Akses ditolak: Akun Admin IT Sekolah dilindungi sistem dan tidak dapat diubah.', 'error');
      return;
    }
    if (m.role === 'pembina' && currentRole !== 'admin') {
      showToast('Akses dibatasi: Hanya Admin IT yang berwenang mengubah data Pembina Guru.', 'error');
      return;
    }
    if (m.role === 'ketua' && currentRole !== 'admin' && currentRole !== 'pembina') {
      showToast('Akses dibatasi: Hanya Admin IT atau Pembina Guru yang dapat mengubah data Ketua Umum.', 'error');
      return;
    }
    setEditingMember(m);
    setFormData({
      nisn: m.nisn,
      fullName: m.fullName,
      email: m.email,
      role: m.role,
      grade: m.grade,
      classRoom: m.classRoom,
      major: m.major,
      divisionId: m.divisionId || '',
      position: m.position,
      phone: m.phone,
      avatarUrl: m.avatarUrl,
      isActive: m.isActive,
      status: m.status,
      joinDate: m.joinDate,
      generation: m.generation,
    });
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!canManageMembers) {
      showToast('Akses ditolak: Anda tidak memiliki wewenang menyimpan data anggota.', 'error');
      return;
    }

    if (formData.role === 'pembina' && currentRole !== 'admin') {
      showToast('Akses ditolak: Hanya Admin IT yang dapat menetapkan role Pembina Guru.', 'error');
      return;
    }

    if (formData.role === 'ketua' && currentRole !== 'admin' && currentRole !== 'pembina') {
      showToast('Akses ditolak: Hanya Admin IT atau Pembina Guru yang dapat menetapkan role Ketua Umum.', 'error');
      return;
    }

    const cleanNisn = formData.nisn.trim();
    const cleanName = formData.fullName.trim();

    if (!cleanName) {
      showToast('Nama lengkap siswa wajib diisi!', 'error');
      return;
    }

    // Validasi Standar Kemdikbud: NISN harus 10 Digit Angka
    if (!/^\d{10}$/.test(cleanNisn)) {
      showToast('NISN tidak valid! Harus terdiri dari tepat 10 digit angka resmi Kemdikbud.', 'error');
      return;
    }

    // Cek Duplikasi NISN
    const isDuplicate = members.some(
      (m) => m.nisn.trim() === cleanNisn && m.id !== editingMember?.id
    );
    if (isDuplicate) {
      showToast(`NISN "${cleanNisn}" sudah terdaftar atas nama siswa lain!`, 'error');
      return;
    }

    const div = divisions.find((d) => d.id === formData.divisionId);
    const payload = {
      ...formData,
      nisn: cleanNisn,
      fullName: cleanName,
      divisionName: div?.name || 'BPH',
    };

    if (editingMember) {
      updateMember(editingMember.id, payload);
    } else {
      addMember(payload);
    }
    setIsModalOpen(false);
  };

  const handleConfirmDelete = () => {
    if (!canManageMembers) {
      showToast('Akses ditolak: Anda tidak berwenang menghapus data siswa.', 'error');
      setMemberToDelete(null);
      return;
    }
    if (memberToDelete?.role === 'admin') {
      showToast('Akses ditolak: Akun Admin IT Sekolah dilindungi sistem dan tidak dapat dihapus.', 'error');
      setMemberToDelete(null);
      return;
    }
    if (memberToDelete?.role === 'pembina' && currentRole !== 'admin') {
      showToast('Akses dibatasi: Hanya Admin IT yang berwenang menghapus data Pembina Guru.', 'error');
      setMemberToDelete(null);
      return;
    }
    if (memberToDelete?.role === 'ketua' && currentRole !== 'admin' && currentRole !== 'pembina') {
      showToast('Akses dibatasi: Hanya Admin IT atau Pembina Guru yang berwenang menghapus data Ketua Umum.', 'error');
      setMemberToDelete(null);
      return;
    }
    if (memberToDelete) {
      deleteMember(memberToDelete.id);
      setMemberToDelete(null);
    }
  };

  const filteredMembers = members.filter((m) => {
    const matchSearch =
      m.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      m.nisn.includes(searchTerm) ||
      m.classRoom.toLowerCase().includes(searchTerm.toLowerCase());
    const matchStatus = statusFilter === 'all' || m.status === statusFilter;
    const matchGrade = gradeFilter === 'all' || m.grade === gradeFilter;
    const matchMajor = majorFilter === 'all' || m.major === majorFilter;
    return matchSearch && matchStatus && matchGrade && matchMajor;
  });

  const majors = Array.from(new Set(members.map((m) => m.major)));
  const activeCount = members.filter((m) => m.status === 'aktif').length;
  const alumniCount = members.filter((m) => m.status === 'alumni').length;

  // Pendaftar Oprec Handlers & Filters
  const pendingRecruitmentsCount = recruitments.filter(
    (r) => r.status === 'menunggu' || r.status === 'lolos_berkas'
  ).length;

  const filteredRecruitments = recruitments.filter((r) => {
    const matchSearch =
      r.fullName.toLowerCase().includes(recSearchTerm.toLowerCase()) ||
      r.nisn.includes(recSearchTerm) ||
      r.registrationNumber.toLowerCase().includes(recSearchTerm.toLowerCase()) ||
      r.classRoom.toLowerCase().includes(recSearchTerm.toLowerCase()) ||
      r.divisionChoice1.toLowerCase().includes(recSearchTerm.toLowerCase());
    const matchStatus = recStatusFilter === 'all' || r.status === recStatusFilter;
    return matchSearch && matchStatus;
  });

  const handleOpenStatusModal = (rec: RecruitmentApplication) => {
    setSelectedRecForStatus(rec);
    setStatusForm({
      status: rec.status,
      interviewSchedule: rec.interviewSchedule || '',
      notes: rec.notes || '',
    });
  };

  const handleSaveStatus = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRecForStatus) return;
    updateRecruitment(selectedRecForStatus.id, {
      status: statusForm.status,
      interviewSchedule: statusForm.interviewSchedule.trim() || undefined,
      notes: statusForm.notes.trim() || undefined,
    });
    setSelectedRecForStatus(null);
  };

  const handleOpenApproveModal = (rec: RecruitmentApplication) => {
    setSelectedRecForApprove(rec);
    const matchedDiv = divisions.find(
      (d) =>
        d.id === rec.divisionChoice1 ||
        d.name.toLowerCase() === rec.divisionChoice1.toLowerCase()
    );
    setApproveForm({
      divisionId: matchedDiv?.id || divisions[0]?.id || '',
      position: 'Anggota Sekbid',
    });
  };

  const handleConfirmApprove = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRecForApprove) return;
    approveRecruitmentToMember(
      selectedRecForApprove.id,
      approveForm.divisionId,
      approveForm.position
    );
    setSelectedRecForApprove(null);
  };

  const handleConfirmDeleteRec = () => {
    if (recToDelete) {
      deleteRecruitment(recToDelete.id);
      setRecToDelete(null);
    }
  };

  const getRecStatusBadge = (status: string) => {
    switch (status) {
      case 'diterima':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-extrabold px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300">
            Diterima
          </span>
        );
      case 'wawancara':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-extrabold px-2.5 py-0.5 rounded-full bg-purple-100 text-purple-800 dark:bg-purple-900/40 dark:text-purple-300">
            Wawancara
          </span>
        );
      case 'lolos_berkas':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-extrabold px-2.5 py-0.5 rounded-full bg-sky-100 text-sky-800 dark:bg-sky-900/40 dark:text-sky-300">
            Lolos Berkas
          </span>
        );
      case 'ditolak':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-extrabold px-2.5 py-0.5 rounded-full bg-rose-100 text-rose-800 dark:bg-rose-900/40 dark:text-rose-300">
            Ditolak
          </span>
        );
      case 'menunggu':
      default:
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-extrabold px-2.5 py-0.5 rounded-full bg-[#FBEBC8] text-[#7A4B00] border border-[#F2B544]">
            Menunggu
          </span>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header & Internal Tab Bar */}
      <div className="simo-card p-6 sm:p-7 flex flex-col sm:flex-row sm:items-center justify-between gap-5">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-[8px] bg-[#E4EAF2] dark:bg-[#1F3A5F]/40 text-[#1F3A5F] dark:text-[#E4EAF2] text-[14px] font-bold mb-2">
            <Building2 className="w-4 h-4" />
            <span>Kaderisasi &amp; Kesiswaan • {orgProfile.name}</span>
          </div>
          <h2 className="text-2xl font-extrabold text-[#1F3A5F] dark:text-[#FAF6EE] tracking-tight">
            Manajemen Keanggotaan &amp; KTA
          </h2>
          <p className="text-[15px] text-[#5A6472] dark:text-[#9AA8B8] mt-1">
            Tata kelola data siswa, hierarki struktur organisasi, dan kartu identitas digital
          </p>
        </div>

        {/* Tab Controls */}
        <div className="grid grid-cols-3 gap-1 p-1 sm:flex sm:gap-1.5 sm:p-1.5 w-full sm:w-auto bg-[#FAF6EE] dark:bg-[#0E1B2C] border border-[#E6DFD0] dark:border-[#283D56] rounded-[14px] shrink-0">
          <button
            onClick={() => setActiveTab('direktori')}
            className={`min-h-[38px] sm:min-h-[40px] px-1.5 sm:px-3.5 py-1 sm:py-1.5 text-[11px] sm:text-[14px] font-bold rounded-[10px] transition-all flex items-center justify-center gap-1 sm:gap-2 cursor-pointer ${
              activeTab === 'direktori'
                ? 'bg-[#1F3A5F] text-[#FAF6EE]'
                : 'text-[#5A6472] dark:text-[#9AA8B8] hover:text-[#1F3A5F] dark:hover:text-[#FAF6EE]'
            }`}
          >
            <Users className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0" />
            <span className="truncate">Direktori ({members.length})</span>
          </button>
          <button
            onClick={() => setActiveTab('pendaftar')}
            className={`min-h-[38px] sm:min-h-[40px] px-1.5 sm:px-3.5 py-1 sm:py-1.5 text-[11px] sm:text-[14px] font-bold rounded-[10px] transition-all flex items-center justify-center gap-1 sm:gap-2 cursor-pointer ${
              activeTab === 'pendaftar'
                ? 'bg-[#1F3A5F] text-[#FAF6EE]'
                : 'text-[#5A6472] dark:text-[#9AA8B8] hover:text-[#1F3A5F] dark:hover:text-[#FAF6EE]'
            }`}
          >
            <UserPlus className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0" />
            <span className="truncate">
              <span className="hidden sm:inline">Pendaftar Oprec</span>
              <span className="sm:hidden">Pendaftar</span> ({recruitments.length})
            </span>
            {pendingRecruitmentsCount > 0 && (
              <span className="px-1.5 py-0.2 text-[10px] sm:text-xs rounded-full bg-[#F2B544] text-[#1F3A5F] font-extrabold shrink-0">
                {pendingRecruitmentsCount}
              </span>
            )}
          </button>
          <button
            onClick={() => setActiveTab('struktur')}
            className={`min-h-[38px] sm:min-h-[40px] px-1.5 sm:px-3.5 py-1 sm:py-1.5 text-[11px] sm:text-[14px] font-bold rounded-[10px] transition-all flex items-center justify-center gap-1 sm:gap-2 cursor-pointer ${
              activeTab === 'struktur'
                ? 'bg-[#1F3A5F] text-[#FAF6EE]'
                : 'text-[#5A6472] dark:text-[#9AA8B8] hover:text-[#1F3A5F] dark:hover:text-[#FAF6EE]'
            }`}
          >
            <Layers className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0" />
            <span className="truncate">
              <span className="hidden sm:inline">Bagan Struktur</span>
              <span className="sm:hidden">Struktur</span>
            </span>
          </button>
        </div>
      </div>

      {/* TAB 1: DIREKTORI ANGGOTA */}
      {activeTab === 'direktori' && (
        <div className="space-y-6">
          {/* Quick Metrics Bar -> Single Continuous Card with Dividers */}
          <div className="simo-card p-0 grid grid-cols-1 sm:grid-cols-3 divide-y sm:divide-y-0 sm:divide-x divide-[#E6DFD0] dark:divide-[#283D56] overflow-hidden">
            <div className="p-6 flex items-center justify-between">
              <div>
                <span className="text-[14px] text-[#5A6472] dark:text-[#9AA8B8] font-bold">Total Terdaftar</span>
                <p className="text-3xl font-black text-[#1F3A5F] dark:text-[#FAF6EE] mt-1">{members.length} Siswa</p>
                <p className="text-[13px] text-[#5A6472] dark:text-[#9AA8B8] mt-1">Database pengurus aktif & alumni</p>
              </div>
              <div className="w-10 h-10 rounded-[12px] bg-[#E4EAF2] text-[#1F3A5F] dark:bg-[#1F3A5F]/40 dark:text-[#FAF6EE] flex items-center justify-center">
                <Users className="w-5 h-5" />
              </div>
            </div>

            <div className="p-6 bg-[#E4EAF2]/60 dark:bg-[#1F3A5F]/30 flex items-center justify-between">
              <div>
                <span className="text-[14px] text-[#1F3A5F] dark:text-[#FAF6EE] font-bold">Anggota Aktif</span>
                <p className="text-3xl font-black text-[#1F3A5F] dark:text-[#FAF6EE] mt-1">{activeCount} Siswa</p>
                <p className="text-[13px] text-[#1F3A5F] dark:text-[#FAF6EE] mt-1">Menjalankan program kerja</p>
              </div>
              <div className="w-10 h-10 rounded-[12px] bg-[#1F3A5F] text-[#FAF6EE] dark:bg-[#E4EAF2] dark:text-[#1F3A5F] flex items-center justify-center">
                <UserCheck className="w-5 h-5 text-[#F2B544]" />
              </div>
            </div>

            <div className="p-6 flex items-center justify-between">
              <div>
                <span className="text-[14px] text-[#5A6472] dark:text-[#9AA8B8] font-bold">Demisioner / Alumni</span>
                <p className="text-3xl font-black text-[#1F3A5F] dark:text-[#FAF6EE] mt-1">{alumniCount} Siswa</p>
                <p className="text-[13px] text-[#5A6472] dark:text-[#9AA8B8] mt-1">Masa bakti sebelumnya</p>
              </div>
              <div className="w-10 h-10 rounded-[12px] bg-[#FAF6EE] text-[#1F3A5F] dark:bg-[#17293E] dark:text-[#FAF6EE] flex items-center justify-center border border-[#E6DFD0] dark:border-[#283D56]">
                <GraduationCap className="w-5 h-5" />
              </div>
            </div>
          </div>

          {/* Filter Bar */}
          <div className="simo-card p-4 sm:p-5 flex flex-col xl:flex-row xl:items-center justify-between gap-3">
            <div className="flex flex-col md:flex-row items-stretch md:items-center gap-2.5 flex-1">
              {/* Search */}
              <div className="relative flex-1 min-w-[200px] md:max-w-xs xl:max-w-sm">
                <Search className="w-4 h-4 text-[#5A6472] dark:text-[#9AA8B8] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Cari nama, NISN, atau kelas..."
                  className="simo-input !pl-10 pr-3 min-h-[42px] text-[13px] sm:text-[14px] w-full"
                />
              </div>

              {/* 3 Dropdown Filters - Selalu sejajar berdampingan */}
              <div className="grid grid-cols-3 gap-2 w-full md:w-auto md:flex md:items-center shrink-0">
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value as any)}
                  className="simo-input min-h-[42px] px-2.5 sm:px-3 text-[13px] font-semibold w-full md:w-auto cursor-pointer"
                >
                  <option value="all">Semua Status</option>
                  <option value="aktif">Anggota Aktif</option>
                  <option value="alumni">Demisioner / Alumni</option>
                </select>

                <select
                  value={gradeFilter}
                  onChange={(e) => setGradeFilter(e.target.value)}
                  className="simo-input min-h-[42px] px-2.5 sm:px-3 text-[13px] font-semibold w-full md:w-auto cursor-pointer"
                >
                  <option value="all">Semua Kelas</option>
                  <option value="X">Kelas X</option>
                  <option value="XI">Kelas XI</option>
                  <option value="XII">Kelas XII</option>
                </select>

                <select
                  value={majorFilter}
                  onChange={(e) => setMajorFilter(e.target.value)}
                  className="simo-input min-h-[42px] px-2.5 sm:px-3 text-[13px] font-semibold w-full md:w-auto cursor-pointer"
                >
                  <option value="all">Semua Jurusan</option>
                  {majors.map((mj) => (
                    <option key={mj} value={mj}>
                      {mj}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <button
              onClick={handleOpenAdd}
              className={`simo-btn-primary min-h-[42px] px-4 py-2 rounded-[12px] flex items-center justify-center gap-2 cursor-pointer shrink-0 text-[13px] font-bold ${
                !canManageMembers ? 'opacity-80' : ''
              }`}
              title={canManageMembers ? 'Tambah Siswa Baru' : 'Akses Terbatas: Hanya Pengurus BPH / Admin'}
            >
              {!canManageMembers ? <Lock className="w-4 h-4 text-amber-300" /> : <Plus className="w-4 h-4" />}
              <span className="whitespace-nowrap">Tambah Siswa</span>
            </button>
          </div>

          {/* Members Table Desktop */}
          <div className="simo-card p-0 overflow-hidden hidden md:block">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-[15px]">
                <thead>
                  <tr className="bg-[#FAF6EE] dark:bg-[#17293E] border-b border-[#E6DFD0] dark:border-[#283D56] text-[#1F3A5F] dark:text-[#FAF6EE] font-bold text-[14px]">
                    <th className="py-4 px-5">Siswa</th>
                    <th className="py-4 px-5">Kelas &amp; NISN</th>
                    <th className="py-4 px-5">Divisi / Sekbid</th>
                    <th className="py-4 px-5">Jabatan</th>
                    <th className="py-4 px-5 whitespace-nowrap">Status &amp; Biometrik</th>
                    <th className="py-4 px-5 text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E6DFD0] dark:divide-[#283D56]">
                  {filteredMembers.map((m) => (
                    <tr key={m.id} className="hover:bg-[#FAF6EE]/50 dark:hover:bg-[#17293E]/50 transition-colors">
                      <td className="py-4 px-5">
                        <div className="flex items-center gap-3">
                          <img
                            src={m.avatarUrl}
                            alt={m.fullName}
                            className="w-10 h-10 rounded-[12px] object-cover border border-[#E6DFD0] dark:border-[#283D56]"
                          />
                          <div>
                            <p className="font-bold text-[#1F3A5F] dark:text-[#FAF6EE] leading-tight text-[15px]">{m.fullName}</p>
                            <p className="text-[13px] text-[#5A6472] dark:text-[#9AA8B8] mt-0.5">{m.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-5">
                        <p className="font-bold text-[#1F3A5F] dark:text-[#FAF6EE] text-[14px]">{m.classRoom}</p>
                        <p className="text-[13px] text-[#5A6472] dark:text-[#9AA8B8] font-mono">NISN: {m.nisn}</p>
                        <p className="text-[13px] text-[#5A6472] dark:text-[#9AA8B8]">{m.major}</p>
                      </td>
                      <td className="py-4 px-5 font-semibold text-[#1F3A5F] dark:text-[#FAF6EE] text-[14px]">
                        {m.divisionName || 'BPH'}
                      </td>
                      <td className="py-4 px-5">
                        <span className="inline-block px-2.5 py-1 rounded-[8px] text-[13px] font-bold bg-[#E4EAF2] text-[#1F3A5F] dark:bg-[#1F3A5F]/40 dark:text-[#FAF6EE]">
                          {m.position}
                        </span>
                      </td>
                      <td className="py-4 px-5 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <span
                            className={m.status === 'aktif' ? 'simo-badge-blue' : 'simo-badge-neutral'}
                          >
                            {m.status}
                          </span>
                          {m.avatarUrl ? (
                            <span className="inline-flex items-center gap-1.5 text-[12px] font-bold text-[#1F3A5F] dark:text-[#FAF6EE] bg-[#FAF6EE] dark:bg-[#17293E] px-2.5 py-0.5 rounded-[6px] border border-[#E6DFD0] dark:border-[#283D56] whitespace-nowrap">
                              <Camera className="w-3 h-3 text-[#F2B544] shrink-0" />
                              <span>Wajah Terdaftar</span>
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1.5 text-[12px] font-bold text-[#5A6472] dark:text-[#9AA8B8] bg-[#FAF6EE] dark:bg-[#17293E]/60 px-2.5 py-0.5 rounded-[6px] whitespace-nowrap">
                              <span>Belum Rekam</span>
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="py-4 px-5 text-right whitespace-nowrap">
                        {m.role === 'admin' ? (
                          <span className="inline-flex items-center gap-1.5 text-[12px] font-bold text-indigo-700 dark:text-indigo-300 px-3 py-1 rounded-[8px] bg-indigo-50 dark:bg-indigo-950/50 border border-indigo-200 dark:border-indigo-800">
                            <ShieldCheck className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
                            <span>Admin IT (Terkunci)</span>
                          </span>
                        ) : (m.role === 'pembina' && currentRole !== 'admin') ||
                            (m.role === 'ketua' && currentRole !== 'admin' && currentRole !== 'pembina') ? (
                          <span className="text-[12px] font-bold text-[#5A6472] dark:text-[#9AA8B8] px-2.5 py-1 rounded-[8px] bg-[#E4EAF2]/60 dark:bg-[#1F3A5F]/40 border border-[#E6DFD0] dark:border-[#283D56]">
                            Hanya Lihat (Terkunci)
                          </span>
                        ) : canManageMembers ? (
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => handleOpenEdit(m)}
                              className="simo-btn-outline min-h-[36px] px-3 py-1 rounded-[10px] text-[13px] flex items-center gap-1 cursor-pointer"
                              title="Edit Data Siswa"
                            >
                              <Edit className="w-3.5 h-3.5" />
                              <span>Edit</span>
                            </button>
                            <button
                              onClick={() => setMemberToDelete(m)}
                              className="min-h-[36px] min-w-[36px] flex items-center justify-center text-[#5A6472] hover:text-[#1F3A5F] dark:text-[#9AA8B8] dark:hover:text-[#FAF6EE] rounded-[10px] border border-transparent hover:border-[#E6DFD0] dark:hover:border-[#283D56] transition-colors cursor-pointer"
                              title="Hapus"
                              aria-label={`Hapus ${m.fullName}`}
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        ) : (
                          <span className="text-[12px] font-bold text-[#5A6472] dark:text-[#9AA8B8] px-2.5 py-1 rounded-[8px] bg-[#E4EAF2]/60 dark:bg-[#1F3A5F]/40 border border-[#E6DFD0] dark:border-[#283D56]">
                            Hanya Lihat (Read-Only)
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Mobile Card List for Members */}
          <div className="space-y-3.5 md:hidden">
            {filteredMembers.map((m) => (
              <div key={m.id} className="simo-card p-5 space-y-3.5">
                <div className="flex items-center justify-between gap-2">
                  <span className={m.status === 'aktif' ? 'simo-badge-blue' : 'simo-badge-neutral'}>
                    {m.status}
                  </span>
                  <span className="text-[13px] font-bold px-2.5 py-0.5 rounded-[8px] bg-[#E4EAF2] text-[#1F3A5F] dark:bg-[#1F3A5F]/40 dark:text-[#FAF6EE]">
                    {m.position}
                  </span>
                </div>

                <div className="flex items-center gap-3">
                  <img
                    src={m.avatarUrl}
                    alt={m.fullName}
                    className="w-12 h-12 rounded-[14px] object-cover border border-[#E6DFD0] dark:border-[#283D56]"
                  />
                  <div>
                    <h4 className="font-bold text-[16px] text-[#1F3A5F] dark:text-[#FAF6EE]">
                      {m.fullName}
                    </h4>
                    <p className="text-[13px] text-[#5A6472] dark:text-[#9AA8B8]">
                      {m.classRoom} • {m.major}
                    </p>
                    <p className="text-[12px] text-[#5A6472] dark:text-[#9AA8B8] font-mono">
                      NISN: {m.nisn}
                    </p>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-[#E6DFD0] dark:border-[#283D56]">
                  <span className="text-[13px] font-semibold text-[#1F3A5F] dark:text-[#FAF6EE]">
                    {m.divisionName || 'BPH'}
                  </span>

                  {m.role === 'admin' ? (
                    <span className="inline-flex items-center gap-1.5 text-[12px] font-bold text-indigo-700 dark:text-indigo-300 px-3 py-1.5 rounded-[10px] bg-indigo-50 dark:bg-indigo-950/50 border border-indigo-200 dark:border-indigo-800">
                      <ShieldCheck className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
                      <span>Admin IT (Terkunci)</span>
                    </span>
                  ) : (m.role === 'pembina' && currentRole !== 'admin') ||
                      (m.role === 'ketua' && currentRole !== 'admin' && currentRole !== 'pembina') ? (
                    <span className="text-[12px] font-bold text-[#5A6472] dark:text-[#9AA8B8] px-2.5 py-1.5 rounded-[10px] bg-[#E4EAF2]/60 dark:bg-[#1F3A5F]/40 border border-[#E6DFD0] dark:border-[#283D56]">
                      Hanya Lihat (Terkunci)
                    </span>
                  ) : canManageMembers ? (
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleOpenEdit(m)}
                        className="simo-btn-outline min-h-[44px] px-4 rounded-[12px] text-[14px] flex items-center gap-1.5 cursor-pointer"
                      >
                        <Edit className="w-4 h-4" />
                        <span>Edit</span>
                      </button>
                      <button
                        onClick={() => setMemberToDelete(m)}
                        className="min-h-[44px] min-w-[44px] flex items-center justify-center text-[#5A6472] hover:text-[#1F3A5F] rounded-[12px] border border-[#E6DFD0] dark:border-[#283D56] cursor-pointer"
                        title="Hapus"
                        aria-label={`Hapus ${m.fullName}`}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ) : (
                    <span className="text-[12px] font-bold text-[#5A6472] dark:text-[#9AA8B8] px-2.5 py-1 rounded-[8px] bg-[#E4EAF2]/60 dark:bg-[#1F3A5F]/40 border border-[#E6DFD0] dark:border-[#283D56]">
                      Hanya Lihat
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 2: BAGAN STRUKTUR */}
      {activeTab === 'struktur' && <StrukturOrganisasi />}

      {/* TAB 3: PENDAFTAR OPREC */}
      {activeTab === 'pendaftar' && (
        <div className="space-y-6">
          {/* Summary Metric Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
            <div className="p-4 rounded-[14px] bg-[#FFFDF8] dark:bg-[#17293E] border border-[#E6DFD0] dark:border-[#283D56]">
              <span className="text-[12px] font-bold text-[#5A6472] dark:text-[#9AA8B8]">Total Pendaftar</span>
              <p className="text-xl sm:text-2xl font-black text-[#1F3A5F] dark:text-[#FAF6EE] mt-0.5">
                {recruitments.length}
              </p>
            </div>
            <div className="p-4 rounded-[14px] bg-[#FFFDF8] dark:bg-[#17293E] border border-[#E6DFD0] dark:border-[#283D56]">
              <span className="text-[12px] font-bold text-[#5A6472] dark:text-[#9AA8B8] flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-[#F2B544] animate-pulse" />
                Menunggu
              </span>
              <p className="text-xl sm:text-2xl font-black text-[#7A4B00] dark:text-[#F2B544] mt-0.5">
                {recruitments.filter((r) => r.status === 'menunggu').length}
              </p>
            </div>
            <div className="p-4 rounded-[14px] bg-[#FFFDF8] dark:bg-[#17293E] border border-[#E6DFD0] dark:border-[#283D56]">
              <span className="text-[12px] font-bold text-[#5A6472] dark:text-[#9AA8B8]">Lolos Berkas</span>
              <p className="text-xl sm:text-2xl font-black text-sky-700 dark:text-sky-400 mt-0.5">
                {recruitments.filter((r) => r.status === 'lolos_berkas').length}
              </p>
            </div>
            <div className="p-4 rounded-[14px] bg-[#FFFDF8] dark:bg-[#17293E] border border-[#E6DFD0] dark:border-[#283D56]">
              <span className="text-[12px] font-bold text-[#5A6472] dark:text-[#9AA8B8]">Wawancara</span>
              <p className="text-xl sm:text-2xl font-black text-purple-700 dark:text-purple-400 mt-0.5">
                {recruitments.filter((r) => r.status === 'wawancara').length}
              </p>
            </div>
            <div className="p-4 rounded-[14px] bg-[#FFFDF8] dark:bg-[#17293E] border border-[#E6DFD0] dark:border-[#283D56] col-span-2 sm:col-span-1">
              <span className="text-[12px] font-bold text-[#5A6472] dark:text-[#9AA8B8]">Resmi Diterima</span>
              <p className="text-xl sm:text-2xl font-black text-emerald-700 dark:text-emerald-400 mt-0.5">
                {recruitments.filter((r) => r.status === 'diterima').length}
              </p>
            </div>
          </div>

          {/* Filter Bar */}
          <div className="simo-card p-4 sm:p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex-1 relative">
              <Search className="w-4 h-4 text-[#5A6472] absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Cari berdasarkan nama, NISN, no registrasi, kelas, divisi..."
                value={recSearchTerm}
                onChange={(e) => setRecSearchTerm(e.target.value)}
                className="simo-input pl-10 w-full"
              />
            </div>
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0 scrollbar-none flex-nowrap">
              {(
                [
                  { id: 'all', label: 'Semua' },
                  { id: 'menunggu', label: 'Menunggu' },
                  { id: 'lolos_berkas', label: 'Lolos Berkas' },
                  { id: 'wawancara', label: 'Wawancara' },
                  { id: 'diterima', label: 'Diterima' },
                  { id: 'ditolak', label: 'Ditolak' },
                ] as const
              ).map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setRecStatusFilter(tab.id)}
                  className={`min-h-[38px] px-3 py-1.5 rounded-[10px] text-[13px] font-bold transition-all whitespace-nowrap cursor-pointer ${
                    recStatusFilter === tab.id
                      ? 'bg-[#1F3A5F] text-[#FAF6EE]'
                      : 'bg-[#FAF6EE] dark:bg-[#1C3048] text-[#5A6472] dark:text-[#9AA8B8] border border-[#E6DFD0] dark:border-[#283D56] hover:text-[#1F3A5F]'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {/* List of Applicants */}
          {filteredRecruitments.length === 0 ? (
            <div className="simo-card p-12 text-center space-y-2">
              <UserPlus className="w-12 h-12 text-[#5A6472] mx-auto opacity-50" />
              <h3 className="text-lg font-bold text-[#1F3A5F] dark:text-[#FAF6EE]">
                Tidak Ada Data Pendaftar
              </h3>
              <p className="text-[14px] text-[#5A6472] dark:text-[#9AA8B8] max-w-md mx-auto">
                {recSearchTerm || recStatusFilter !== 'all'
                  ? 'Tidak ditemukan calon pendaftar yang sesuai kriteria pencarian/filter.'
                  : 'Belum ada calon anggota yang mendaftar melalui formulir web open recruitment.'}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {filteredRecruitments.map((rec) => (
                <div
                  key={rec.id}
                  className="simo-card p-5 space-y-4 hover:border-[#1F3A5F] dark:hover:border-[#F2B544] transition-all flex flex-col justify-between"
                >
                  <div className="space-y-3">
                    {/* Header Card: No. Registrasi & Status */}
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-[12px] font-mono font-bold px-2.5 py-1 rounded-[8px] bg-[#E4EAF2] dark:bg-[#213B5C] text-[#1F3A5F] dark:text-[#FAF6EE] border border-[#E6DFD0] dark:border-[#283D56]">
                        {rec.registrationNumber}
                      </span>
                      <div className="flex items-center gap-1.5">
                        <span className="text-[12px] text-[#5A6472] dark:text-[#9AA8B8]">
                          {rec.appliedDate}
                        </span>
                        {getRecStatusBadge(rec.status)}
                      </div>
                    </div>

                    {/* Identitas Siswa */}
                    <div className="flex items-start gap-3.5">
                      <div className="w-12 h-12 rounded-[14px] bg-[#1F3A5F] text-[#FAF6EE] font-extrabold text-lg flex items-center justify-center shrink-0">
                        {rec.fullName.charAt(0)}
                      </div>
                      <div className="min-w-0 flex-1">
                        <h4 className="text-base font-extrabold text-[#1F3A5F] dark:text-[#FAF6EE] truncate">
                          {rec.fullName}
                        </h4>
                        <p className="text-[13px] text-[#5A6472] dark:text-[#9AA8B8]">
                          NISN: <span className="font-mono font-semibold">{rec.nisn}</span> • {rec.classRoom}
                        </p>
                        <p className="text-[12px] text-[#5A6472] dark:text-[#9AA8B8] font-medium">
                          {rec.major}
                        </p>
                      </div>
                    </div>

                    {/* Divisi & Kontak */}
                    <div className="p-3 rounded-[12px] bg-[#FAF6EE] dark:bg-[#1C3048] border border-[#E6DFD0] dark:border-[#283D56] text-[13px] space-y-1.5">
                      <div className="flex items-center justify-between">
                        <span className="text-[#5A6472] dark:text-[#9AA8B8]">Pilihan 1:</span>
                        <strong className="text-[#1F3A5F] dark:text-[#FAF6EE]">{rec.divisionChoice1}</strong>
                      </div>
                      {rec.divisionChoice2 && (
                        <div className="flex items-center justify-between">
                          <span className="text-[#5A6472] dark:text-[#9AA8B8]">Pilihan 2:</span>
                          <span className="text-[#5A6472] dark:text-[#9AA8B8]">{rec.divisionChoice2}</span>
                        </div>
                      )}
                      {rec.phone && rec.phone !== '-' && (
                        <div className="flex items-center justify-between pt-1 border-t border-[#E6DFD0]/60 dark:border-[#283D56]/60">
                          <span className="text-[#5A6472] dark:text-[#9AA8B8]">WhatsApp:</span>
                          <a
                            href={`https://wa.me/${rec.phone.replace(/[^0-9]/g, '')}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="font-bold text-emerald-700 dark:text-emerald-400 hover:underline flex items-center gap-1"
                          >
                            <Phone className="w-3.5 h-3.5" />
                            <span>{rec.phone}</span>
                          </a>
                        </div>
                      )}
                    </div>

                    {/* Jadwal Wawancara if exists */}
                    {rec.interviewSchedule && (
                      <div className="p-2.5 rounded-[10px] bg-purple-50 dark:bg-purple-950/40 border border-purple-200 dark:border-purple-800/40 text-[12px] text-purple-900 dark:text-purple-300 flex items-center gap-2">
                        <Calendar className="w-4 h-4 shrink-0 text-purple-600" />
                        <span><strong>Jadwal Wawancara:</strong> {rec.interviewSchedule}</span>
                      </div>
                    )}

                    {/* Motivasi Ringkas */}
                    <p className="text-[13px] text-[#5A6472] dark:text-[#9AA8B8] line-clamp-2 italic">
                      "{rec.reason}"
                    </p>
                  </div>

                  {/* Actions Bar */}
                  <div className="pt-3 border-t border-[#E6DFD0] dark:border-[#283D56] flex items-center justify-between gap-2 flex-wrap">
                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => setSelectedRecForDetail(rec)}
                        className="simo-btn-outline min-h-[36px] px-3 rounded-[10px] text-[13px] flex items-center gap-1.5 cursor-pointer"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>Detail</span>
                      </button>
                      {canManageMembers && (
                        <button
                          type="button"
                          onClick={() => handleOpenStatusModal(rec)}
                          className="simo-btn-outline min-h-[36px] px-3 rounded-[10px] text-[13px] flex items-center gap-1.5 cursor-pointer"
                        >
                          <Edit className="w-3.5 h-3.5" />
                          <span>Ubah Status</span>
                        </button>
                      )}
                    </div>

                    <div className="flex items-center gap-2">
                      {canManageMembers && rec.status !== 'diterima' && (
                        <button
                          type="button"
                          onClick={() => handleOpenApproveModal(rec)}
                          className="min-h-[36px] px-3.5 py-1 bg-[#F2B544] hover:bg-[#E0A12F] text-[#1F3A5F] text-[13px] font-extrabold rounded-[10px] transition-colors flex items-center gap-1.5 cursor-pointer shadow-none"
                        >
                          <UserCheck className="w-4 h-4" />
                          <span>Terima Jadi Anggota</span>
                        </button>
                      )}
                      {rec.status === 'diterima' && (
                        <span className="inline-flex items-center gap-1 text-[13px] font-bold text-emerald-700 dark:text-emerald-400">
                          <CheckCircle2 className="w-4 h-4" />
                          <span>Anggota Resmi</span>
                        </span>
                      )}
                      {canManageMembers && (
                        <button
                          type="button"
                          onClick={() => setRecToDelete(rec)}
                          className="min-h-[36px] min-w-[36px] flex items-center justify-center text-[#5A6472] hover:text-rose-600 rounded-[10px] border border-[#E6DFD0] dark:border-[#283D56] cursor-pointer"
                          title="Hapus Pendaftaran"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Modal Add / Edit Member */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingMember ? 'Edit Data Anggota Siswa' : 'Daftarkan Anggota Siswa Baru'}
        subtitle="Pilih foto seragam sekolah langsung dari komputer Anda"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <ImagePicker
            label="Foto Siswa (Pilih dari Komputer Lokal)"
            value={formData.avatarUrl}
            onChange={(url) => setFormData({ ...formData, avatarUrl: url })}
            helperText="Pilih berkas foto seragam dari folder komputer Anda (JPG, PNG, WebP)"
            aspectRatio="square"
            storageFolder="avatars"
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-[14px] font-bold text-[#1F3A5F] dark:text-[#FAF6EE] mb-1.5">Nama Siswa</label>
              <input
                type="text"
                value={formData.fullName}
                onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                placeholder="Nama lengkap"
                className="simo-input min-h-[44px] text-[15px] w-full"
                required
              />
            </div>
            <div>
              <label className="block text-[14px] font-bold text-[#1F3A5F] dark:text-[#FAF6EE] mb-1.5">NISN (10 Digit)</label>
              <input
                type="text"
                value={formData.nisn}
                onChange={(e) => setFormData({ ...formData, nisn: e.target.value })}
                placeholder="0071234501"
                className="simo-input min-h-[44px] font-mono font-bold text-[14px] w-full"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-[14px] font-bold text-[#1F3A5F] dark:text-[#FAF6EE] mb-1.5">Kelas</label>
              <select
                value={formData.grade}
                onChange={(e) => setFormData({ ...formData, grade: e.target.value as any })}
                className="simo-input min-h-[44px] text-[14px] w-full"
              >
                <option value="X">Kelas X</option>
                <option value="XI">Kelas XI</option>
                <option value="XII">Kelas XII</option>
              </select>
            </div>
            <div>
              <label className="block text-[14px] font-bold text-[#1F3A5F] dark:text-[#FAF6EE] mb-1.5">Ruang Kelas</label>
              <input
                type="text"
                value={formData.classRoom}
                onChange={(e) => setFormData({ ...formData, classRoom: e.target.value })}
                placeholder="RPL 1"
                className="simo-input min-h-[44px] text-[14px] w-full"
                required
              />
            </div>
            <div>
              <label className="block text-[14px] font-bold text-[#1F3A5F] dark:text-[#FAF6EE] mb-1.5">Jurusan</label>
              <input
                type="text"
                value={formData.major}
                onChange={(e) => setFormData({ ...formData, major: e.target.value })}
                placeholder="RPL / TKJ / DKV"
                className="simo-input min-h-[44px] text-[14px] w-full"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-[14px] font-bold text-[#1F3A5F] dark:text-[#FAF6EE] mb-1.5">Divisi / Sekbid</label>
              <select
                value={formData.divisionId}
                onChange={(e) => setFormData({ ...formData, divisionId: e.target.value })}
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
              <label className="block text-[14px] font-bold text-[#1F3A5F] dark:text-[#FAF6EE] mb-1.5">Jabatan</label>
              <input
                type="text"
                value={formData.position}
                onChange={(e) => setFormData({ ...formData, position: e.target.value })}
                placeholder="Anggota Sekbid"
                className="simo-input min-h-[44px] text-[14px] w-full"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-[14px] font-bold text-[#1F3A5F] dark:text-[#FAF6EE] mb-1.5">Email</label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              placeholder="siswa@smk.test"
              className="simo-input min-h-[44px] text-[14px] w-full"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-[14px] font-bold text-[#1F3A5F] dark:text-[#FAF6EE] mb-1.5">Status Keanggotaan</label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                className="simo-input min-h-[44px] text-[14px] w-full"
              >
                <option value="aktif">Anggota Aktif</option>
                <option value="alumni">Demisioner / Alumni</option>
              </select>
            </div>
            <div>
              <label className="block text-[14px] font-bold text-[#1F3A5F] dark:text-[#FAF6EE] mb-1.5">Peran Akses</label>
              <select
                value={formData.role}
                onChange={(e) => setFormData({ ...formData, role: e.target.value as any })}
                className="simo-input min-h-[44px] text-[14px] w-full"
              >
                <option value="anggota">Anggota</option>
                <option value="koordinator_sekbid">Koordinator Sekbid</option>
                <option value="sekretaris">Sekretaris</option>
                <option value="bendahara">Bendahara</option>
                {/* Ketua Umum hanya bisa dipilih oleh Admin IT dan Pembina Guru */}
                {(currentRole === 'admin' || currentRole === 'pembina') && (
                  <option value="ketua">Ketua Umum</option>
                )}
                {/* Pembina Guru hanya bisa dipilih oleh Admin IT */}
                {currentRole === 'admin' && (
                  <option value="pembina">Pembina Guru</option>
                )}
              </select>
            </div>
          </div>

          <div className="pt-3 flex justify-end gap-3 border-t border-[#E6DFD0] dark:border-[#283D56]">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="simo-btn-outline min-h-[44px] px-5 rounded-[12px] text-[14px] font-bold cursor-pointer"
            >
              Batal
            </button>
            <button
              type="submit"
              className="simo-btn-primary min-h-[44px] px-5 rounded-[12px] text-[14px] font-bold cursor-pointer"
            >
              {editingMember ? 'Simpan Perubahan' : 'Daftarkan Anggota'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Delete Member Confirmation Modal */}
      <Modal
        isOpen={Boolean(memberToDelete)}
        onClose={() => setMemberToDelete(null)}
        title="Konfirmasi Hapus Anggota Siswa"
      >
        {memberToDelete && (
          <div className="space-y-4">
            <div className="flex items-start gap-3 p-4 rounded-[14px] bg-[#FAF6EE] dark:bg-[#17293E] border border-[#E6DFD0] dark:border-[#283D56]">
              <AlertCircle className="w-5 h-5 text-[#F2B544] shrink-0 mt-0.5" />
              <div className="text-[15px] text-[#1F3A5F] dark:text-[#FAF6EE]">
                <p className="font-bold">Apakah Anda yakin ingin menghapus data anggota ini?</p>
                <p className="text-[14px] text-[#5A6472] dark:text-[#9AA8B8] mt-1">
                  "{memberToDelete.fullName}" — NISN: {memberToDelete.nisn} ({memberToDelete.classRoom})
                </p>
                <p className="text-[13px] text-[#5A6472] dark:text-[#9AA8B8] mt-2">
                  Data kartu anggota dan rekaman biometrik akan dihapus.
                </p>
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setMemberToDelete(null)}
                className="simo-btn-outline min-h-[44px] px-5 rounded-[12px] text-[14px] font-bold cursor-pointer"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                className="simo-btn-primary min-h-[44px] px-5 rounded-[12px] text-[14px] font-bold cursor-pointer"
              >
                Ya, Hapus Siswa
              </button>
            </div>
          </div>
        )}
      </Modal>

      {/* Detail Applicant Modal */}
      <Modal
        isOpen={Boolean(selectedRecForDetail)}
        onClose={() => setSelectedRecForDetail(null)}
        title="Detail Formulir Pendaftaran Oprec"
      >
        {selectedRecForDetail && (
          <div className="space-y-4 text-[14px]">
            <div className="p-4 rounded-[14px] bg-[#FAF6EE] dark:bg-[#17293E] border border-[#E6DFD0] dark:border-[#283D56] space-y-3">
              <div className="flex items-center justify-between border-b border-[#E6DFD0] dark:border-[#283D56] pb-2">
                <span className="text-xs font-mono font-bold text-[#5A6472] dark:text-[#9AA8B8]">
                  No. Registrasi: {selectedRecForDetail.registrationNumber}
                </span>
                {getRecStatusBadge(selectedRecForDetail.status)}
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <span className="text-xs text-[#5A6472] dark:text-[#9AA8B8] block">Nama Lengkap</span>
                  <strong className="text-base text-[#1F3A5F] dark:text-[#FAF6EE]">
                    {selectedRecForDetail.fullName}
                  </strong>
                </div>
                <div>
                  <span className="text-xs text-[#5A6472] dark:text-[#9AA8B8] block">NISN Resmi</span>
                  <span className="font-mono font-bold text-[#1F3A5F] dark:text-[#FAF6EE]">
                    {selectedRecForDetail.nisn}
                  </span>
                </div>
                <div>
                  <span className="text-xs text-[#5A6472] dark:text-[#9AA8B8] block">Kelas &amp; Jurusan</span>
                  <span className="font-semibold text-[#1F3A5F] dark:text-[#FAF6EE]">
                    {selectedRecForDetail.classRoom} • {selectedRecForDetail.major}
                  </span>
                </div>
                <div>
                  <span className="text-xs text-[#5A6472] dark:text-[#9AA8B8] block">Kontak WhatsApp</span>
                  <a
                    href={`https://wa.me/${selectedRecForDetail.phone.replace(/[^0-9]/g, '')}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-bold text-emerald-700 dark:text-emerald-400 hover:underline flex items-center gap-1"
                  >
                    <Phone className="w-3.5 h-3.5" />
                    <span>{selectedRecForDetail.phone}</span>
                  </a>
                </div>
                <div>
                  <span className="text-xs text-[#5A6472] dark:text-[#9AA8B8] block">Pilihan Divisi 1</span>
                  <span className="font-bold text-[#1F3A5F] dark:text-[#FAF6EE]">
                    {selectedRecForDetail.divisionChoice1}
                  </span>
                </div>
                <div>
                  <span className="text-xs text-[#5A6472] dark:text-[#9AA8B8] block">Pilihan Divisi 2</span>
                  <span className="text-[#5A6472] dark:text-[#9AA8B8]">
                    {selectedRecForDetail.divisionChoice2 || '-'}
                  </span>
                </div>
              </div>
            </div>

            <div>
              <span className="text-xs font-bold text-[#5A6472] dark:text-[#9AA8B8] uppercase tracking-wide block mb-1">
                Motivasi / Alasan Bergabung
              </span>
              <div className="p-3.5 rounded-[12px] bg-[#FAF6EE] dark:bg-[#1C3048] border border-[#E6DFD0] dark:border-[#283D56] text-[#1F3A5F] dark:text-[#FAF6EE] leading-relaxed">
                "{selectedRecForDetail.reason}"
              </div>
            </div>

            {selectedRecForDetail.skills && selectedRecForDetail.skills.length > 0 && (
              <div>
                <span className="text-xs font-bold text-[#5A6472] dark:text-[#9AA8B8] uppercase tracking-wide block mb-1">
                  Keahlian &amp; Minat
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {selectedRecForDetail.skills.map((skill, idx) => (
                    <span
                      key={idx}
                      className="text-xs font-semibold px-2.5 py-1 rounded-full bg-[#E4EAF2] dark:bg-[#213B5C] text-[#1F3A5F] dark:text-[#FAF6EE]"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {selectedRecForDetail.interviewSchedule && (
              <div className="p-3 rounded-[12px] bg-purple-50 dark:bg-purple-950/40 border border-purple-200 dark:border-purple-800/40 space-y-1">
                <span className="text-xs font-bold text-purple-900 dark:text-purple-300 block">
                  Jadwal Wawancara
                </span>
                <p className="text-sm font-semibold text-purple-900 dark:text-purple-200">
                  {selectedRecForDetail.interviewSchedule}
                </p>
              </div>
            )}

            {selectedRecForDetail.notes && (
              <div className="p-3 rounded-[12px] bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/40 space-y-1">
                <span className="text-xs font-bold text-amber-900 dark:text-amber-300 block">
                  Catatan Evaluasi Pengurus
                </span>
                <p className="text-sm text-amber-900 dark:text-amber-200">
                  {selectedRecForDetail.notes}
                </p>
              </div>
            )}

            <div className="pt-3 flex justify-end gap-2 border-t border-[#E6DFD0] dark:border-[#283D56]">
              {canManageMembers && selectedRecForDetail.status !== 'diterima' && (
                <button
                  type="button"
                  onClick={() => {
                    const rec = selectedRecForDetail;
                    setSelectedRecForDetail(null);
                    handleOpenApproveModal(rec);
                  }}
                  className="simo-btn-primary min-h-[40px] px-4 rounded-[10px] text-xs font-bold cursor-pointer"
                >
                  Terima Jadi Anggota
                </button>
              )}
              <button
                type="button"
                onClick={() => setSelectedRecForDetail(null)}
                className="simo-btn-outline min-h-[40px] px-4 rounded-[10px] text-xs font-bold cursor-pointer"
              >
                Tutup
              </button>
            </div>
          </div>
        )}
      </Modal>

      {/* Edit Status & Interview Modal */}
      <Modal
        isOpen={Boolean(selectedRecForStatus)}
        onClose={() => setSelectedRecForStatus(null)}
        title="Ubah Status & Jadwal Seleksi Pendaftar"
      >
        {selectedRecForStatus && (
          <form onSubmit={handleSaveStatus} className="space-y-4">
            <div>
              <p className="text-sm text-[#5A6472] dark:text-[#9AA8B8]">
                Calon Siswa: <strong className="text-[#1F3A5F] dark:text-[#FAF6EE]">{selectedRecForStatus.fullName}</strong> ({selectedRecForStatus.classRoom})
              </p>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#5A6472] dark:text-[#9AA8B8] mb-1">
                Status Seleksi
              </label>
              <select
                value={statusForm.status}
                onChange={(e) =>
                  setStatusForm({
                    ...statusForm,
                    status: e.target.value as RecruitmentApplication['status'],
                  })
                }
                className="simo-input w-full"
              >
                <option value="menunggu">Menunggu Verifikasi Berkas</option>
                <option value="lolos_berkas">Lolos Berkas Administrasi</option>
                <option value="wawancara">Tahap Wawancara &amp; Seleksi</option>
                <option value="diterima">Diterima Resmi</option>
                <option value="ditolak">Ditolak / Belum Memenuhi Kriteria</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#5A6472] dark:text-[#9AA8B8] mb-1">
                Jadwal Wawancara (opsional)
              </label>
              <input
                type="text"
                placeholder="Contoh: Sabtu, 4 Oktober 2026 pukul 09:00 WIB"
                value={statusForm.interviewSchedule}
                onChange={(e) =>
                  setStatusForm({ ...statusForm, interviewSchedule: e.target.value })
                }
                className="simo-input w-full"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[#5A6472] dark:text-[#9AA8B8] mb-1">
                Catatan Evaluasi / Keterangan (opsional)
              </label>
              <textarea
                rows={3}
                placeholder="Tuliskan catatan hasil interview atau alasan seleksi..."
                value={statusForm.notes}
                onChange={(e) => setStatusForm({ ...statusForm, notes: e.target.value })}
                className="simo-input w-full"
              />
            </div>

            <div className="pt-3 flex justify-end gap-2 border-t border-[#E6DFD0] dark:border-[#283D56]">
              <button
                type="button"
                onClick={() => setSelectedRecForStatus(null)}
                className="simo-btn-outline min-h-[40px] px-4 rounded-[10px] text-xs font-bold cursor-pointer"
              >
                Batal
              </button>
              <button
                type="submit"
                className="simo-btn-primary min-h-[40px] px-5 rounded-[10px] text-xs font-bold cursor-pointer"
              >
                Simpan Perubahan
              </button>
            </div>
          </form>
        )}
      </Modal>

      {/* Approve to Official Member Modal */}
      <Modal
        isOpen={Boolean(selectedRecForApprove)}
        onClose={() => setSelectedRecForApprove(null)}
        title="Terima Calon Siswa Menjadi Anggota Resmi"
      >
        {selectedRecForApprove && (
          <form onSubmit={handleConfirmApprove} className="space-y-4">
            <div className="p-4 rounded-[14px] bg-[#FAF6EE] dark:bg-[#17293E] border border-[#E6DFD0] dark:border-[#283D56] space-y-1.5">
              <p className="text-sm font-bold text-[#1F3A5F] dark:text-[#FAF6EE]">
                {selectedRecForApprove.fullName}
              </p>
              <p className="text-xs text-[#5A6472] dark:text-[#9AA8B8]">
                NISN: {selectedRecForApprove.nisn} • {selectedRecForApprove.classRoom} ({selectedRecForApprove.major})
              </p>
              <p className="text-xs text-[#7A4B00] dark:text-[#F2B544] font-medium pt-1">
                Pilihan Divisi Awal: <strong>{selectedRecForApprove.divisionChoice1}</strong>
              </p>
            </div>

            <p className="text-xs text-[#5A6472] dark:text-[#9AA8B8]">
              Siswa ini akan langsung didaftarkan ke basis data anggota resmi (Direktori Siswa), otomatis diterbitkan KTA Digital, dan status pendaftaran diubah menjadi <strong>Diterima</strong>.
            </p>

            <div>
              <label className="block text-xs font-bold text-[#5A6472] dark:text-[#9AA8B8] mb-1">
                Penempatan Divisi / Sekbid
              </label>
              <select
                value={approveForm.divisionId}
                onChange={(e) =>
                  setApproveForm({ ...approveForm, divisionId: e.target.value })
                }
                className="simo-input w-full"
              >
                {divisions.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#5A6472] dark:text-[#9AA8B8] mb-1">
                Jabatan / Posisi
              </label>
              <input
                type="text"
                value={approveForm.position}
                onChange={(e) =>
                  setApproveForm({ ...approveForm, position: e.target.value })
                }
                placeholder="Contoh: Anggota Sekbid, Staff Humas, dll"
                className="simo-input w-full"
                required
              />
            </div>

            <div className="pt-3 flex justify-end gap-2 border-t border-[#E6DFD0] dark:border-[#283D56]">
              <button
                type="button"
                onClick={() => setSelectedRecForApprove(null)}
                className="simo-btn-outline min-h-[40px] px-4 rounded-[10px] text-xs font-bold cursor-pointer"
              >
                Batal
              </button>
              <button
                type="submit"
                className="simo-btn-primary min-h-[40px] px-5 rounded-[10px] text-xs font-bold cursor-pointer flex items-center gap-1.5"
              >
                <UserCheck className="w-4 h-4" />
                <span>Terima &amp; Terbitkan KTA</span>
              </button>
            </div>
          </form>
        )}
      </Modal>

      {/* Delete Applicant Confirmation Modal */}
      <Modal
        isOpen={Boolean(recToDelete)}
        onClose={() => setRecToDelete(null)}
        title="Konfirmasi Hapus Data Pendaftar"
      >
        {recToDelete && (
          <div className="space-y-4">
            <div className="flex items-start gap-3 p-4 rounded-[14px] bg-[#FAF6EE] dark:bg-[#17293E] border border-[#E6DFD0] dark:border-[#283D56]">
              <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
              <div className="text-[14px] text-[#1F3A5F] dark:text-[#FAF6EE]">
                <p className="font-bold">Apakah Anda yakin ingin menghapus data pendaftar ini?</p>
                <p className="text-[13px] text-[#5A6472] dark:text-[#9AA8B8] mt-1">
                  "{recToDelete.fullName}" — No. Reg: {recToDelete.registrationNumber} ({recToDelete.classRoom})
                </p>
                <p className="text-[12px] text-rose-600 dark:text-rose-400 mt-2 font-medium">
                  Tindakan ini tidak dapat dibatalkan.
                </p>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setRecToDelete(null)}
                className="simo-btn-outline min-h-[40px] px-4 rounded-[10px] text-xs font-bold cursor-pointer"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleConfirmDeleteRec}
                className="simo-btn-primary min-h-[40px] px-5 rounded-[10px] text-xs font-bold cursor-pointer bg-rose-600 hover:bg-rose-700 text-white"
              >
                Ya, Hapus Pendaftar
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

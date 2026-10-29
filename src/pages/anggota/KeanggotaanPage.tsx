import React, { useState } from 'react';
import {
  Users,
  Layers,
  CreditCard,
  Plus,
  Search,
  Trash2,
  Edit,
  GraduationCap,
  UserCheck,
  Building2,
  Camera,
  AlertCircle,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { Member, UserRole } from '../../types';
import { Modal } from '../../components/common/Modal';
import { ImagePicker } from '../../components/common/ImagePicker';
import { KartuAnggota } from './KartuAnggota';
import { StrukturOrganisasi } from '../organisasi/StrukturOrganisasi';

export const KeanggotaanPage: React.FC = () => {
  const { members, divisions, addMember, updateMember, deleteMember, orgProfile } = useApp();
  const [activeTab, setActiveTab] = useState<'direktori' | 'struktur' | 'kta'>('direktori');

  // Filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'aktif' | 'alumni'>('all');
  const [gradeFilter, setGradeFilter] = useState<string>('all');
  const [majorFilter, setMajorFilter] = useState<string>('all');

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
    setEditingMember(null);
    setFormData(initialForm);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (m: Member) => {
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
    const div = divisions.find((d) => d.id === formData.divisionId);
    const payload = {
      ...formData,
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
        <div className="flex p-1.5 bg-[#FAF6EE] dark:bg-[#0E1B2C] border border-[#E6DFD0] dark:border-[#283D56] rounded-[14px] gap-1 self-start sm:self-auto shrink-0 flex-wrap">
          <button
            onClick={() => setActiveTab('direktori')}
            className={`min-h-[40px] px-3.5 py-1.5 text-[14px] font-bold rounded-[10px] transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === 'direktori'
                ? 'bg-[#1F3A5F] text-[#FAF6EE]'
                : 'text-[#5A6472] dark:text-[#9AA8B8] hover:text-[#1F3A5F] dark:hover:text-[#FAF6EE]'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>Direktori ({members.length})</span>
          </button>
          <button
            onClick={() => setActiveTab('struktur')}
            className={`min-h-[40px] px-3.5 py-1.5 text-[14px] font-bold rounded-[10px] transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === 'struktur'
                ? 'bg-[#1F3A5F] text-[#FAF6EE]'
                : 'text-[#5A6472] dark:text-[#9AA8B8] hover:text-[#1F3A5F] dark:hover:text-[#FAF6EE]'
            }`}
          >
            <Layers className="w-4 h-4" />
            <span>Bagan Struktur</span>
          </button>
          <button
            onClick={() => setActiveTab('kta')}
            className={`min-h-[40px] px-3.5 py-1.5 text-[14px] font-bold rounded-[10px] transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === 'kta'
                ? 'bg-[#1F3A5F] text-[#FAF6EE]'
                : 'text-[#5A6472] dark:text-[#9AA8B8] hover:text-[#1F3A5F] dark:hover:text-[#FAF6EE]'
            }`}
          >
            <CreditCard className="w-4 h-4" />
            <span>Cetak KTA (QR)</span>
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
          <div className="simo-card p-4 sm:p-5 flex flex-wrap items-center justify-between gap-4">
            <div className="flex flex-wrap items-center gap-3 flex-1">
              <div className="relative w-full sm:w-72">
                <Search className="w-4 h-4 text-[#5A6472] dark:text-[#9AA8B8] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Cari nama, NISN, atau kelas..."
                  className="simo-input pl-10 pr-3 min-h-[44px] text-[14px] w-full"
                />
              </div>

              {/* Status Filter */}
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as any)}
                className="simo-input min-h-[44px] px-3 text-[14px] font-semibold"
              >
                <option value="all">Semua Status</option>
                <option value="aktif">Anggota Aktif</option>
                <option value="alumni">Demisioner / Alumni</option>
              </select>

              {/* Grade Filter */}
              <select
                value={gradeFilter}
                onChange={(e) => setGradeFilter(e.target.value)}
                className="simo-input min-h-[44px] px-3 text-[14px] font-semibold"
              >
                <option value="all">Semua Kelas</option>
                <option value="X">Kelas X</option>
                <option value="XI">Kelas XI</option>
                <option value="XII">Kelas XII</option>
              </select>

              {/* Major Filter */}
              <select
                value={majorFilter}
                onChange={(e) => setMajorFilter(e.target.value)}
                className="simo-input min-h-[44px] px-3 text-[14px] font-semibold"
              >
                <option value="all">Semua Jurusan</option>
                {majors.map((mj) => (
                  <option key={mj} value={mj}>
                    {mj}
                  </option>
                ))}
              </select>
            </div>

            <button
              onClick={handleOpenAdd}
              className="simo-btn-primary min-h-[44px] px-5 py-2.5 rounded-[12px] flex items-center gap-2 cursor-pointer self-start sm:self-auto shrink-0"
            >
              <Plus className="w-4 h-4" />
              <span>Tambah Siswa</span>
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
                    <th className="py-4 px-5">Status &amp; Biometrik</th>
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
                      <td className="py-4 px-5">
                        <div className="flex flex-col gap-1.5 items-start">
                          <span
                            className={m.status === 'aktif' ? 'simo-badge-blue' : 'simo-badge-neutral'}
                          >
                            {m.status}
                          </span>
                          {m.avatarUrl ? (
                            <span className="inline-flex items-center gap-1.5 text-[12px] font-bold text-[#1F3A5F] dark:text-[#FAF6EE] bg-[#FAF6EE] dark:bg-[#17293E] px-2 py-0.5 rounded-[6px] border border-[#E6DFD0] dark:border-[#283D56]">
                              <Camera className="w-3 h-3 text-[#F2B544]" />
                              Wajah Terdaftar
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1.5 text-[12px] font-bold text-[#5A6472] dark:text-[#9AA8B8] bg-[#FAF6EE] px-2 py-0.5 rounded-[6px]">
                              Belum Rekam
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="py-4 px-5 text-right whitespace-nowrap">
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
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 2: BAGAN STRUKTUR */}
      {activeTab === 'struktur' && <StrukturOrganisasi />}

      {/* TAB 3: CETAK KTA DIGITAL */}
      {activeTab === 'kta' && <KartuAnggota />}

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
                <option value="ketua">Ketua Umum</option>
                <option value="pembina">Pembina Guru</option>
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
    </div>
  );
};

import React, { useState } from 'react';
import {
  Users,
  Layers,
  CreditCard,
  Plus,
  Search,
  Filter,
  Trash2,
  Edit,
  GraduationCap,
  UserCheck,
  Building2,
  Printer,
  Download,
  Camera,
  ShieldCheck,
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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200/80 shadow-2xs">
        <div>
          <h2 className="text-base font-bold text-slate-900">Manajemen Keanggotaan & KTA</h2>
          <p className="text-xs text-slate-500">
            Tata kelola data siswa, hierarki struktur organisasi, dan kartu identitas digital
          </p>
        </div>

        {/* Tab Controls */}
        <div className="flex p-1 bg-slate-100 rounded-xl">
          <button
            onClick={() => setActiveTab('direktori')}
            className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'direktori'
                ? 'bg-white text-indigo-700 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            <span>Direktori ({members.length})</span>
          </button>
          <button
            onClick={() => setActiveTab('struktur')}
            className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'struktur'
                ? 'bg-white text-indigo-700 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Bagan Struktur</span>
          </button>
          <button
            onClick={() => setActiveTab('kta')}
            className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'kta'
                ? 'bg-white text-indigo-700 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <CreditCard className="w-3.5 h-3.5" />
            <span>Cetak KTA (QR)</span>
          </button>
        </div>
      </div>

      {/* TAB 1: DIREKTORI ANGGOTA */}
      {activeTab === 'direktori' && (
        <div className="space-y-4">
          {/* Quick Metrics Bar */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-2xs flex items-center justify-between">
              <div>
                <span className="text-[10px] text-slate-400 font-bold uppercase">Total Terdaftar</span>
                <p className="text-lg font-black text-slate-900">{members.length} Siswa</p>
              </div>
              <div className="w-9 h-9 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                <Users className="w-4 h-4" />
              </div>
            </div>
            <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-2xs flex items-center justify-between">
              <div>
                <span className="text-[10px] text-slate-400 font-bold uppercase">Anggota Aktif</span>
                <p className="text-lg font-black text-emerald-600">{activeCount} Siswa</p>
              </div>
              <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                <UserCheck className="w-4 h-4" />
              </div>
            </div>
            <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-2xs flex items-center justify-between">
              <div>
                <span className="text-[10px] text-slate-400 font-bold uppercase">Demisioner / Alumni</span>
                <p className="text-lg font-black text-amber-600">{alumniCount} Siswa</p>
              </div>
              <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
                <GraduationCap className="w-4 h-4" />
              </div>
            </div>
          </div>

          {/* Filter Bar */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-2xs flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-2 flex-1">
              <div className="flex items-center gap-2 px-3 py-2 bg-slate-50 rounded-xl border border-slate-200/80 text-xs min-w-[200px] flex-1 sm:flex-none">
                <Search className="w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Cari nama, NISN, atau kelas..."
                  className="w-full bg-transparent outline-none text-slate-700"
                />
              </div>

              {/* Status Filter */}
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as any)}
                className="px-3 py-2 bg-slate-50 border border-slate-200/80 rounded-xl text-xs text-slate-700 outline-none"
              >
                <option value="all">Semua Status</option>
                <option value="aktif">Anggota Aktif</option>
                <option value="alumni">Demisioner / Alumni</option>
              </select>

              {/* Grade Filter */}
              <select
                value={gradeFilter}
                onChange={(e) => setGradeFilter(e.target.value)}
                className="px-3 py-2 bg-slate-50 border border-slate-200/80 rounded-xl text-xs text-slate-700 outline-none"
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
                className="px-3 py-2 bg-slate-50 border border-slate-200/80 rounded-xl text-xs text-slate-700 outline-none"
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
              className="px-3.5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold shadow-sm flex items-center gap-1.5 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Tambah Siswa</span>
            </button>
          </div>

          {/* Members Table */}
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-2xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200/80 text-slate-500 font-bold uppercase tracking-wider text-[11px]">
                    <th className="py-3 px-4">Siswa</th>
                    <th className="py-3 px-4">Kelas & NISN</th>
                    <th className="py-3 px-4">Divisi / Sekbid</th>
                    <th className="py-3 px-4">Status & Biometrik</th>
                    <th className="py-3 px-4 text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredMembers.map((m) => (
                    <tr key={m.id} className="hover:bg-slate-50/70">
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          <img
                            src={m.avatarUrl}
                            alt={m.fullName}
                            className="w-9 h-9 rounded-xl object-cover border border-slate-200 shadow-2xs"
                          />
                          <div>
                            <p className="font-bold text-slate-900 leading-tight">{m.fullName}</p>
                            <p className="text-[10px] text-slate-400 mt-0.5">{m.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <p className="font-semibold text-slate-800">{m.classRoom}</p>
                        <p className="text-[10px] text-slate-400 font-mono">NISN: {m.nisn}</p>
                        <p className="text-[10px] text-slate-500">{m.major}</p>
                      </td>
                      <td className="py-3 px-4 font-medium text-slate-700">
                        {m.divisionName || 'BPH'}
                      </td>
                      <td className="py-3 px-4">
                        <span className="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-100">
                          {m.position}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex flex-col gap-1 items-start">
                          <span
                            className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase ${
                              m.status === 'aktif'
                                ? 'bg-emerald-50 text-emerald-700'
                                : 'bg-amber-50 text-amber-700'
                            }`}
                          >
                            {m.status}
                          </span>
                          {m.avatarUrl ? (
                            <span className="inline-flex items-center gap-1 text-[9px] font-bold text-indigo-700 bg-indigo-50 px-1.5 py-0.5 rounded border border-indigo-200">
                              <Camera className="w-2.5 h-2.5" />
                              Wajah Terdaftar
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-[9px] font-bold text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded">
                              Belum Rekam
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => handleOpenEdit(m)}
                            className="p-1.5 text-slate-400 hover:text-indigo-600 rounded-lg cursor-pointer"
                            title="Edit Data Siswa"
                          >
                            <Edit className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => {
                              if (confirm(`Yakin ingin menghapus ${m.fullName}?`)) {
                                deleteMember(m.id);
                              }
                            }}
                            className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg cursor-pointer"
                            title="Hapus"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
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

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">Nama Siswa</label>
              <input
                type="text"
                value={formData.fullName}
                onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                placeholder="Nama lengkap"
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-indigo-500"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">NISN (10 Digit)</label>
              <input
                type="text"
                value={formData.nisn}
                onChange={(e) => setFormData({ ...formData, nisn: e.target.value })}
                placeholder="0071234501"
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-indigo-500"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">Kelas</label>
              <select
                value={formData.grade}
                onChange={(e) => setFormData({ ...formData, grade: e.target.value as any })}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-indigo-500"
              >
                <option value="X">Kelas X</option>
                <option value="XI">Kelas XI</option>
                <option value="XII">Kelas XII</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">Ruang Kelas</label>
              <input
                type="text"
                value={formData.classRoom}
                onChange={(e) => setFormData({ ...formData, classRoom: e.target.value })}
                placeholder="RPL 1"
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-indigo-500"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">Jurusan</label>
              <input
                type="text"
                value={formData.major}
                onChange={(e) => setFormData({ ...formData, major: e.target.value })}
                placeholder="RPL / TKJ / DKV"
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-indigo-500"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">Divisi / Sekbid</label>
              <select
                value={formData.divisionId}
                onChange={(e) => setFormData({ ...formData, divisionId: e.target.value })}
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
              <label className="block text-xs font-semibold text-slate-600 mb-1">Jabatan</label>
              <input
                type="text"
                value={formData.position}
                onChange={(e) => setFormData({ ...formData, position: e.target.value })}
                placeholder="Anggota Sekbid"
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-indigo-500"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">Status Keanggotaan</label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-indigo-500"
              >
                <option value="aktif">Anggota Aktif</option>
                <option value="alumni">Demisioner / Alumni</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">Peran Akses</label>
              <select
                value={formData.role}
                onChange={(e) => setFormData({ ...formData, role: e.target.value as any })}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-indigo-500"
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

          <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="px-4 py-2 bg-slate-100 text-slate-600 text-xs font-semibold rounded-xl cursor-pointer"
            >
              Batal
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-xl shadow-xs cursor-pointer"
            >
              {editingMember ? 'Simpan Perubahan' : 'Daftarkan Anggota'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

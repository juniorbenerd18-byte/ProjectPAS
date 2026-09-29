import React, { useState } from 'react';
import { Plus, Search, Filter, Trash2, Edit, CreditCard, UserCheck, ShieldCheck, Mail, Phone } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { Member, UserRole } from '../../types';
import { Modal } from '../../components/common/Modal';
import { ImagePicker } from '../../components/common/ImagePicker';

export const DataAnggota: React.FC = () => {
  const { members, divisions, addMember, updateMember, deleteMember, setActivePage } = useApp();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedMajor, setSelectedMajor] = useState<string>('all');
  const [selectedGrade, setSelectedGrade] = useState<string>('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingMember, setEditingMember] = useState<Member | null>(null);

  const initialForm = {
    nisn: '',
    fullName: '',
    email: '',
    role: 'anggota' as UserRole,
    grade: 'X' as 'X' | 'XI' | 'XII',
    classRoom: 'RPL 1',
    major: 'Rekayasa Perangkat Lunak',
    divisionId: divisions[0]?.id || '',
    position: 'Anggota Sekbid',
    phone: '',
    avatarUrl: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
    isActive: true,
    status: 'aktif' as 'aktif' | 'alumni',
    joinDate: new Date().toISOString().split('T')[0],
    generation: 'Angkatan 2025/2026',
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
      divisionName: div?.name || 'Tanpa Divisi',
    };

    if (editingMember) {
      updateMember(editingMember.id, payload);
    } else {
      addMember(payload);
    }
    setIsModalOpen(false);
  };

  // Filter list
  const filteredMembers = members.filter((m) => {
    const matchSearch =
      m.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      m.nisn.includes(searchTerm) ||
      m.classRoom.toLowerCase().includes(searchTerm.toLowerCase()) ||
      m.position.toLowerCase().includes(searchTerm.toLowerCase());

    const matchMajor = selectedMajor === 'all' || m.major === selectedMajor;
    const matchGrade = selectedGrade === 'all' || m.grade === selectedGrade;

    return matchSearch && matchMajor && matchGrade;
  });

  const majors = Array.from(new Set(members.map((m) => m.major)));

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-5 rounded-2xl border border-slate-200/80 shadow-2xs">
        <div>
          <h2 className="text-base font-bold text-slate-900">Data Master Anggota</h2>
          <p className="text-xs text-slate-500">
            Daftar seluruh siswa, pengurus OSIS SMK, dan informasi profil keanggotaan
          </p>
        </div>
        <div className="flex items-center gap-2 self-start sm:self-auto">
          <button
            onClick={() => setActivePage('anggota-kartu')}
            className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <CreditCard className="w-4 h-4 text-indigo-600" />
            <span>Cetak KTA</span>
          </button>
          <button
            onClick={handleOpenAdd}
            className="px-3.5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold shadow-sm flex items-center gap-1.5 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Tambah Anggota</span>
          </button>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-2xs flex flex-wrap items-center gap-3">
        <div className="flex-1 min-w-[220px] flex items-center gap-2 px-3 py-2 bg-slate-50 rounded-xl border border-slate-200/80">
          <Search className="w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Cari nama, NISN, atau kelas..."
            className="w-full text-xs bg-transparent outline-none text-slate-700"
          />
        </div>

        {/* Filter Tingkat Kelas */}
        <select
          value={selectedGrade}
          onChange={(e) => setSelectedGrade(e.target.value)}
          className="px-3 py-2 bg-slate-50 border border-slate-200/80 rounded-xl text-xs text-slate-700 outline-none"
        >
          <option value="all">Semua Kelas</option>
          <option value="X">Kelas X</option>
          <option value="XI">Kelas XI</option>
          <option value="XII">Kelas XII</option>
        </select>

        {/* Filter Jurusan */}
        <select
          value={selectedMajor}
          onChange={(e) => setSelectedMajor(e.target.value)}
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

      {/* Members Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200/80 text-slate-500 font-bold uppercase tracking-wider text-[11px]">
                <th className="py-3 px-4">Siswa / Anggota</th>
                <th className="py-3 px-4">NISN & Kelas</th>
                <th className="py-3 px-4">Divisi / Sekbid</th>
                <th className="py-3 px-4">Jabatan</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredMembers.map((m) => (
                <tr key={m.id} className="hover:bg-slate-50/70 transition-colors">
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
                  <td className="py-3 px-4">
                    <span className="text-[11px] font-medium text-slate-700">
                      {m.divisionName || '-'}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <span className="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-100">
                      {m.position}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <span
                      className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase ${
                        m.status === 'aktif'
                          ? 'bg-emerald-50 text-emerald-700'
                          : 'bg-amber-50 text-amber-700'
                      }`}
                    >
                      {m.status}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <button
                        onClick={() => handleOpenEdit(m)}
                        className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-slate-100 rounded-lg cursor-pointer"
                        title="Edit data"
                      >
                        <Edit className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => {
                          if (confirm(`Yakin ingin menghapus ${m.fullName}?`)) {
                            deleteMember(m.id);
                          }
                        }}
                        className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-slate-100 rounded-lg cursor-pointer"
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

      {/* Modal Add / Edit Member */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingMember ? 'Edit Data Anggota' : 'Daftarkan Anggota Baru'}
        subtitle="Data profil siswa anggota OSIS SMK"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Foto Siswa - Local Picker */}
          <ImagePicker
            label="Foto Siswa (Pilih dari Komputer)"
            value={formData.avatarUrl}
            onChange={(url) => setFormData({ ...formData, avatarUrl: url })}
            helperText="Pilih foto seragam sekolah atau formal dari komputer Anda"
            aspectRatio="square"
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">Nama Lengkap</label>
              <input
                type="text"
                value={formData.fullName}
                onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                placeholder="Nama lengkap siswa"
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

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">Tingkat Kelas</label>
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
              <label className="block text-xs font-semibold text-slate-600 mb-1">Jurusan / Kompetensi</label>
              <input
                type="text"
                value={formData.major}
                onChange={(e) => setFormData({ ...formData, major: e.target.value })}
                placeholder="Rekayasa Perangkat Lunak"
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-indigo-500"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
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

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">Email</label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="siswa@smk.test"
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-indigo-500"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">No. WhatsApp</label>
              <input
                type="text"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                placeholder="081234567890"
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-indigo-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">Status Keanggotaan</label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-indigo-500"
              >
                <option value="aktif">Anggota Aktif</option>
                <option value="alumni">Alumni / Demisioner</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">Hak Akses Role</label>
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
              className="px-4 py-2 bg-indigo-600 text-white text-xs font-bold rounded-xl hover:bg-indigo-500 cursor-pointer"
            >
              {editingMember ? 'Simpan Perubahan' : 'Daftarkan Anggota'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

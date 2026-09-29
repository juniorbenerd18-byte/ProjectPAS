import React, { useState } from 'react';
import { Plus, Edit2, Trash2, ShieldCheck, Users, Search } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { Division } from '../../types';
import { Modal } from '../../components/common/Modal';

export const DivisiPage: React.FC = () => {
  const { divisions, addDivision, updateDivision, deleteDivision, members } = useApp();
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingDivision, setEditingDivision] = useState<Division | null>(null);

  const [formData, setFormData] = useState({
    name: '',
    code: '',
    description: '',
    leaderName: '',
  });

  const handleOpenAdd = () => {
    setEditingDivision(null);
    setFormData({ name: '', code: '', description: '', leaderName: '' });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (div: Division) => {
    setEditingDivision(div);
    setFormData({
      name: div.name,
      code: div.code,
      description: div.description,
      leaderName: div.leaderName || '',
    });
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingDivision) {
      updateDivision(editingDivision.id, formData);
    } else {
      addDivision(formData);
    }
    setIsModalOpen(false);
  };

  const filteredDivisions = divisions.filter(
    (d) =>
      d.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      d.code.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-5 rounded-2xl border border-slate-200/80 shadow-2xs">
        <div>
          <h2 className="text-base font-bold text-slate-900">Divisi & Seksi Bidang (Sekbid)</h2>
          <p className="text-xs text-slate-500">
            Daftar departemen, seksi bidang OSIS SMK, dan koordinator masing-masing bidang
          </p>
        </div>
        <button
          onClick={handleOpenAdd}
          className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold shadow-sm flex items-center gap-1.5 cursor-pointer self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Tambah Divisi Baru</span>
        </button>
      </div>

      {/* Search Input */}
      <div className="flex items-center gap-2 px-3 py-2 bg-white rounded-xl border border-slate-200/80 max-w-sm">
        <Search className="w-4 h-4 text-slate-400" />
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Cari nama divisi atau kode..."
          className="w-full text-xs bg-transparent outline-none text-slate-700"
        />
      </div>

      {/* Grid of Divisions */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredDivisions.map((div) => {
          const divMembers = members.filter((m) => m.divisionId === div.id);
          return (
            <div
              key={div.id}
              className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-2xs space-y-3 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-full uppercase">
                    {div.code}
                  </span>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleOpenEdit(div)}
                      className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-slate-50 rounded-lg cursor-pointer"
                      title="Edit divisi"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    {div.id !== 'div-bph' && (
                      <button
                        onClick={() => {
                          if (confirm(`Yakin ingin menghapus divisi ${div.name}?`)) {
                            deleteDivision(div.id);
                          }
                        }}
                        className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-slate-50 rounded-lg cursor-pointer"
                        title="Hapus divisi"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>

                <h3 className="text-sm font-bold text-slate-900 leading-snug">{div.name}</h3>
                <p className="text-xs text-slate-500 mt-1 leading-relaxed">{div.description}</p>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                <div className="flex items-center gap-1.5 text-slate-500">
                  <Users className="w-3.5 h-3.5 text-slate-400" />
                  <span className="font-semibold text-slate-700">{divMembers.length}</span> Anggota
                </div>
                {div.leaderName && (
                  <span className="text-[11px] text-slate-500 truncate max-w-[150px]">
                    Koor: <strong className="text-slate-800">{div.leaderName}</strong>
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Modal Add/Edit */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingDivision ? 'Edit Divisi / Sekbid' : 'Tambah Divisi / Sekbid Baru'}
        subtitle="Kelola seksi bidang kepengurusan OSIS SMK"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">Nama Divisi / Sekbid</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="Contoh: Sekbid 6 - Keterampilan & Kewirausahaan"
              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-indigo-500"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">Kode Singkat</label>
              <input
                type="text"
                value={formData.code}
                onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                placeholder="SEKBID-6"
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-indigo-500"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">Nama Koordinator</label>
              <input
                type="text"
                value={formData.leaderName}
                onChange={(e) => setFormData({ ...formData, leaderName: e.target.value })}
                placeholder="Nama siswa"
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-indigo-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">Deskripsi Tugas</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={3}
              placeholder="Jelaskan ruang lingkup tugas divisi ini..."
              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-indigo-500"
              required
            />
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
              {editingDivision ? 'Simpan Perubahan' : 'Tambah Divisi'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

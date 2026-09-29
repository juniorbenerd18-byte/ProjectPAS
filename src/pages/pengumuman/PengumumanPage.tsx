import React, { useState } from 'react';
import { Plus, Megaphone, Trash2, Calendar, User, Search } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { Announcement } from '../../types';
import { formatDateIndo } from '../../lib/utils';
import { Modal } from '../../components/common/Modal';

export const PengumumanPage: React.FC = () => {
  const { announcements, addAnnouncement, deleteAnnouncement, currentUser } = useApp();
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [formData, setFormData] = useState({
    title: '',
    content: '',
    priority: 'biasa' as Announcement['priority'],
    author: currentUser.fullName,
    targetRole: 'Semua Pengurus',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    addAnnouncement(formData);
    setIsModalOpen(false);
    setFormData({
      title: '',
      content: '',
      priority: 'biasa',
      author: currentUser.fullName,
      targetRole: 'Semua Pengurus',
    });
  };

  const filtered = announcements.filter(
    (a) =>
      a.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      a.content.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-5 rounded-2xl border border-slate-200/80 shadow-2xs">
        <div>
          <h2 className="text-base font-bold text-slate-900">Papan Pengumuman Resmi</h2>
          <p className="text-xs text-slate-500">
            Informasi internal, instruksi pembina, dan pemberitahuan agenda mendesak ({announcements.length} Pengumuman)
          </p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold shadow-sm flex items-center gap-1.5 cursor-pointer self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Buat Pengumuman Baru</span>
        </button>
      </div>

      {/* Filter & Search */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-2xs flex items-center gap-2 max-w-sm">
        <Search className="w-4 h-4 text-slate-400" />
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Cari pengumuman..."
          className="w-full text-xs bg-transparent outline-none text-slate-700"
        />
      </div>

      {/* Announcements List */}
      <div className="space-y-4">
        {filtered.map((ann) => (
          <div
            key={ann.id}
            className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-2xs space-y-3"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span
                  className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase ${
                    ann.priority === 'penting'
                      ? 'bg-rose-100 text-rose-800'
                      : 'bg-slate-100 text-slate-700'
                  }`}
                >
                  {ann.priority}
                </span>
                <span className="text-[11px] text-slate-400">Sasaran: {ann.targetRole}</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-xs text-slate-400 flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5" />
                  {formatDateIndo(ann.date)}
                </span>
                <button
                  onClick={() => {
                    if (confirm(`Hapus pengumuman "${ann.title}"?`)) {
                      deleteAnnouncement(ann.id);
                    }
                  }}
                  className="p-1 text-slate-400 hover:text-rose-600 rounded-lg cursor-pointer"
                  title="Hapus"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            <h3 className="text-sm font-bold text-slate-900">{ann.title}</h3>
            <p className="text-xs text-slate-600 leading-relaxed whitespace-pre-line">{ann.content}</p>

            <div className="pt-3 border-t border-slate-100 flex items-center gap-2 text-[11px] text-slate-400">
              <User className="w-3.5 h-3.5 text-slate-400" />
              <span>Diterbitkan oleh: <strong className="text-slate-700">{ann.author}</strong></span>
            </div>
          </div>
        ))}
      </div>

      {/* Modal Add Announcement */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Terbitkan Pengumuman Baru"
        subtitle="Siarkan pengumuman ke seluruh pengurus organisasi"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">Judul Pengumuman</label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="Contoh: Jadwal Gladi Bersih Upacara Hari Sumpah Pemuda"
              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-indigo-500"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">Tingkat Prioritas</label>
              <select
                value={formData.priority}
                onChange={(e) => setFormData({ ...formData, priority: e.target.value as any })}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-indigo-500"
              >
                <option value="biasa">Biasa (Informasi Rutin)</option>
                <option value="penting">Penting (Wajib Diperhatikan)</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">Sasaran Pengumuman</label>
              <input
                type="text"
                value={formData.targetRole}
                onChange={(e) => setFormData({ ...formData, targetRole: e.target.value })}
                placeholder="Semua Pengurus / Sekbid Tertentu"
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-indigo-500"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">Isi Pesan Pengumuman</label>
            <textarea
              value={formData.content}
              onChange={(e) => setFormData({ ...formData, content: e.target.value })}
              rows={4}
              placeholder="Ketik isi pengumuman secara jelas di sini..."
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
              Terbitkan Pengumuman
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

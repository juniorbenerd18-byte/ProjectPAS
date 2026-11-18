import React, { useState } from 'react';
import { Quote, Plus, Edit2, Trash2, RotateCcw, Check, Sparkles, User, MessageSquare } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { TestimonialItem } from '../../types';
import { Modal } from '../common/Modal';
import { ScrollReveal } from '../common/ScrollReveal';

export const TestimonialAdminWidget: React.FC = () => {
  const { testimonials, addTestimonial, updateTestimonial, deleteTestimonial, resetTestimonials, showToast } =
    useApp();

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<TestimonialItem | null>(null);

  const [formData, setFormData] = useState({
    name: '',
    roleOrClass: '',
    avatarUrl: '',
    content: '',
  });

  const handleOpenAdd = () => {
    setEditingItem(null);
    setFormData({
      name: '',
      roleOrClass: '',
      avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80',
      content: '',
    });
    setIsEditModalOpen(true);
  };

  const handleOpenEdit = (item: TestimonialItem) => {
    setEditingItem(item);
    setFormData({
      name: item.name,
      roleOrClass: item.roleOrClass,
      avatarUrl: item.avatarUrl || '',
      content: item.content,
    });
    setIsEditModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.content.trim()) {
      showToast('Nama dan isi cerita pengurus wajib diisi.', 'error');
      return;
    }

    if (editingItem) {
      updateTestimonial(editingItem.id, {
        name: formData.name.trim(),
        roleOrClass: formData.roleOrClass.trim() || 'Pengurus OSIS',
        avatarUrl: formData.avatarUrl.trim() || undefined,
        content: formData.content.trim(),
      });
    } else {
      addTestimonial({
        name: formData.name.trim(),
        roleOrClass: formData.roleOrClass.trim() || 'Pengurus OSIS',
        avatarUrl: formData.avatarUrl.trim() || undefined,
        content: formData.content.trim(),
      });
    }

    setIsEditModalOpen(false);
  };

  const handleDelete = (item: TestimonialItem) => {
    if (window.confirm(`Yakin ingin menghapus cerita dari "${item.name}"?`)) {
      deleteTestimonial(item.id);
    }
  };

  const handleReset = () => {
    if (window.confirm('Kembalikan semua cerita pengurus ke teks bawaan?')) {
      resetTestimonials();
    }
  };

  return (
    <>
      <ScrollReveal distance={28} duration={650}>
        <div id="widget-cerita-pengurus" className="bg-[#FFFDF8] dark:bg-[#17293E] rounded-[20px] border border-[#E6DFD0] dark:border-[#283D56] p-6 space-y-6">
          {/* Header Widget */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#E6DFD0] dark:border-[#283D56]">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-[12px] bg-[#1F3A5F] text-[#FAF6EE] flex items-center justify-center shrink-0">
                <Quote className="w-5 h-5 text-[#F2B544]" strokeWidth={2} />
              </div>
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="text-base sm:text-lg font-extrabold text-[#1F3A5F] dark:text-[#FAF6EE]">
                    Cerita dari Pengurus Kami (Testimoni Beranda)
                  </h3>
                  <span className="inline-flex items-center gap-1.5 text-[12px] font-bold px-2.5 py-0.5 rounded-full bg-[#E4EAF2] text-[#1F3A5F] border border-[#E6DFD0] dark:bg-[#213B5C] dark:text-[#FAF6EE]">
                    <span>{testimonials.length} Cerita Aktif</span>
                  </span>
                </div>
                <p className="text-[13px] sm:text-[14px] text-[#5A6472] dark:text-[#9AA8B8] mt-0.5">
                  Ubah kutipan, nama, jabatan, atau foto pengurus yang tampil di beranda publik dengan cepat.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 self-start sm:self-auto shrink-0">
              <button
                type="button"
                onClick={handleReset}
                className="min-h-[40px] px-3 py-2 bg-transparent hover:bg-[#E4EAF2] dark:hover:bg-[#213B5C] text-[#5A6472] dark:text-[#9AA8B8] text-[12px] font-bold rounded-[12px] transition-all border border-[#E6DFD0] dark:border-[#283D56] flex items-center gap-1.5 cursor-pointer"
                title="Reset kembali ke cerita bawaan"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reset Bawaan</span>
              </button>
              <button
                type="button"
                onClick={handleOpenAdd}
                className="min-h-[40px] px-3.5 py-2 bg-[#1F3A5F] hover:bg-[#162B46] text-[#FAF6EE] text-[13px] font-bold rounded-[12px] transition-all flex items-center gap-1.5 cursor-pointer shadow-none"
              >
                <Plus className="w-4 h-4 text-[#F2B544]" strokeWidth={2.5} />
                <span>Tambah Cerita</span>
              </button>
            </div>
          </div>

          {/* Grid Kartu Cerita Pengurus */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {testimonials.map((item, idx) => (
              <div
                key={item.id}
                className="bg-white dark:bg-[#1C3048] border border-[#E6DFD0] dark:border-[#283D56] rounded-[16px] p-5 flex flex-col justify-between shadow-2xs hover:border-[#1F3A5F] transition-all"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Quote className="w-6 h-6 text-[#F2B544]" />
                    <span className="text-[11px] font-mono text-slate-400">#{idx + 1}</span>
                  </div>
                  <p className="text-[13px] text-[#5A6472] dark:text-[#9AA8B8] leading-relaxed italic line-clamp-4">
                    "{item.content}"
                  </p>
                </div>

                <div className="pt-4 mt-4 border-t border-[#E6DFD0] dark:border-[#283D56] flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="w-9 h-9 rounded-full overflow-hidden border border-[#E6DFD0] bg-[#FAF6EE] shrink-0">
                      <img
                        src={
                          item.avatarUrl ||
                          'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200&auto=format&fit=crop&q=80'
                        }
                        alt={item.name}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src =
                            'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200&auto=format&fit=crop&q=80';
                        }}
                      />
                    </div>
                    <div className="min-w-0">
                      <h4 className="text-[13px] font-bold text-[#1F3A5F] dark:text-[#FAF6EE] truncate">
                        {item.name}
                      </h4>
                      <p className="text-[11px] text-[#5A6472] dark:text-[#9AA8B8] truncate">
                        {item.roleOrClass}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      type="button"
                      onClick={() => handleOpenEdit(item)}
                      className="p-1.5 rounded-[8px] text-[#1F3A5F] dark:text-[#FAF6EE] hover:bg-[#E4EAF2] dark:hover:bg-[#213B5C] transition-colors cursor-pointer"
                      title="Edit cerita ini"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDelete(item)}
                      className="p-1.5 rounded-[8px] text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors cursor-pointer"
                      title="Hapus cerita ini"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </ScrollReveal>

      {/* MODAL EDIT / TAMBAH CERITA PENGURUS */}
      {isEditModalOpen && (
        <Modal
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          title={editingItem ? 'Edit Cerita Pengurus' : 'Tambah Cerita Pengurus Baru'}
          subtitle="Teks ini akan langsung muncul pada bagian 'Dari pengurus kami' di halaman beranda publik"
          maxWidth="md"
        >
          <form onSubmit={handleSubmit} className="space-y-4 py-2">
            <div>
              <label className="block text-[13px] font-bold text-[#1F3A5F] dark:text-[#FAF6EE] mb-1">
                Nama Pengurus <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Contoh: Alvaro Danendra"
                className="w-full px-3.5 py-2.5 rounded-[12px] bg-white dark:bg-[#1C3048] border border-[#E6DFD0] dark:border-[#283D56] text-[13px] font-semibold text-[#1F3A5F] dark:text-[#FAF6EE] focus:outline-none focus:border-[#1F3A5F]"
              />
            </div>

            <div>
              <label className="block text-[13px] font-bold text-[#1F3A5F] dark:text-[#FAF6EE] mb-1">
                Jabatan / Role &amp; Kelas <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                value={formData.roleOrClass}
                onChange={(e) => setFormData({ ...formData, roleOrClass: e.target.value })}
                placeholder="Contoh: Anggota Sekbid • RPL atau Sekretaris Umum • XI TKJ 2"
                className="w-full px-3.5 py-2.5 rounded-[12px] bg-white dark:bg-[#1C3048] border border-[#E6DFD0] dark:border-[#283D56] text-[13px] font-semibold text-[#1F3A5F] dark:text-[#FAF6EE] focus:outline-none focus:border-[#1F3A5F]"
              />
            </div>

            <div>
              <label className="block text-[13px] font-bold text-[#1F3A5F] dark:text-[#FAF6EE] mb-1">
                URL Foto Profil Avatar (Opsional)
              </label>
              <div className="flex gap-2">
                <input
                  type="url"
                  value={formData.avatarUrl}
                  onChange={(e) => setFormData({ ...formData, avatarUrl: e.target.value })}
                  placeholder="https://images.unsplash.com/..."
                  className="flex-1 px-3.5 py-2 rounded-[12px] bg-white dark:bg-[#1C3048] border border-[#E6DFD0] dark:border-[#283D56] text-[12px] text-[#1F3A5F] dark:text-[#FAF6EE] focus:outline-none focus:border-[#1F3A5F]"
                />
                {formData.avatarUrl && (
                  <div className="w-9 h-9 rounded-full overflow-hidden border border-slate-300 shrink-0">
                    <img src={formData.avatarUrl} alt="Preview" className="w-full h-full object-cover" />
                  </div>
                )}
              </div>
            </div>

            <div>
              <label className="block text-[13px] font-bold text-[#1F3A5F] dark:text-[#FAF6EE] mb-1">
                Isi Cerita / Kutipan Pengalaman <span className="text-rose-500">*</span>
              </label>
              <textarea
                required
                rows={4}
                value={formData.content}
                onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                placeholder="Tuliskan pengalaman, kesan, atau cerita kepengurusan di sini..."
                className="w-full px-3.5 py-2.5 rounded-[12px] bg-white dark:bg-[#1C3048] border border-[#E6DFD0] dark:border-[#283D56] text-[13px] font-normal leading-relaxed text-[#1F3A5F] dark:text-[#FAF6EE] focus:outline-none focus:border-[#1F3A5F]"
              />
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-[#E6DFD0] dark:border-[#283D56]">
              <button
                type="button"
                onClick={() => setIsEditModalOpen(false)}
                className="px-4 py-2 text-[13px] font-bold text-[#5A6472] dark:text-[#9AA8B8] hover:text-[#1F3A5F] cursor-pointer"
              >
                Batal
              </button>
              <button
                type="submit"
                className="px-5 py-2.5 rounded-[12px] bg-[#1F3A5F] hover:bg-[#162B46] text-[#FAF6EE] text-[13px] font-bold cursor-pointer transition-colors"
              >
                {editingItem ? 'Simpan Perubahan' : 'Tambah Cerita'}
              </button>
            </div>
          </form>
        </Modal>
      )}
    </>
  );
};

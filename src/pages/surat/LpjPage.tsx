import React, { useState } from 'react';
import { Plus, FolderArchive, Search, FileText, Trash2, CheckCircle2 } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { formatDateIndo } from '../../lib/utils';
import { Modal } from '../../components/common/Modal';

export const LpjPage: React.FC = () => {
  const { documents, addDocument, deleteDocument } = useApp();
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);

  const lpjDocs = documents.filter((d) => d.type === 'lpj');

  const [formData, setFormData] = useState({
    documentNumber: `LPJ-${Date.now().toString().slice(-4)}/OSIS/2026`,
    title: '',
    documentDate: new Date().toISOString().split('T')[0],
    senderOrReceiver: 'Diserahkan ke: Pembina OSIS & Komite Sekolah',
    fileUrl: '#',
    status: 'arsip' as const,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    addDocument({
      type: 'lpj',
      ...formData,
    });
    setIsModalOpen(false);
  };

  const filtered = lpjDocs.filter((p) =>
    p.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.documentNumber.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-5 rounded-2xl border border-slate-200/80 shadow-2xs">
        <div>
          <h2 className="text-base font-bold text-slate-900">Laporan Pertanggungjawaban (LPJ)</h2>
          <p className="text-xs text-slate-500">
            Arsip pelaporan pertanggungjawaban kegiatan, realisasi anggaran, dan dokumentasi ({lpjDocs.length} Berkas)
          </p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold shadow-sm flex items-center gap-1.5 cursor-pointer self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Arsipkan LPJ Baru</span>
        </button>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filtered.map((lpj) => (
          <div
            key={lpj.id}
            className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-2xs space-y-3 flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-mono font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
                  {lpj.documentNumber}
                </span>
                <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  Diterima & Disahkan
                </span>
              </div>

              <h3 className="text-sm font-bold text-slate-900">{lpj.title}</h3>
              <p className="text-xs text-slate-500 mt-1">{lpj.senderOrReceiver}</p>
            </div>

            <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
              <span className="text-slate-400">{formatDateIndo(lpj.documentDate)}</span>
              <button
                onClick={() => {
                  if (confirm(`Hapus arsip LPJ ${lpj.title}?`)) {
                    deleteDocument(lpj.id);
                  }
                }}
                className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg cursor-pointer"
                title="Hapus"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Modal Add LPJ */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Arsipkan Berkas LPJ Baru"
        subtitle="Laporan pertanggungjawaban kegiatan pasca-acara"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">Nomor Registrasi LPJ</label>
            <input
              type="text"
              value={formData.documentNumber}
              onChange={(e) => setFormData({ ...formData, documentNumber: e.target.value })}
              className="w-full px-3 py-2 text-xs font-mono font-bold bg-slate-50 rounded-xl border border-slate-200"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">Judul LPJ Acara</label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="Contoh: LPJ Penyelenggaraan Latihan Dasar Kepemimpinan (LDKS)"
              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-indigo-500"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">Diserahkan Kepada</label>
              <input
                type="text"
                value={formData.senderOrReceiver}
                onChange={(e) => setFormData({ ...formData, senderOrReceiver: e.target.value })}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-indigo-500"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">Tanggal Pengesahan</label>
              <input
                type="date"
                value={formData.documentDate}
                onChange={(e) => setFormData({ ...formData, documentDate: e.target.value })}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-indigo-500"
                required
              />
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
              Simpan Arsip LPJ
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

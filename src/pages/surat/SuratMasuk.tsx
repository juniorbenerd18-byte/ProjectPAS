import React, { useState } from 'react';
import { Plus, Inbox, Search, FileText, Trash2, Calendar } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { DocumentItem } from '../../types';
import { formatDateIndo } from '../../lib/utils';
import { Modal } from '../../components/common/Modal';

export const SuratMasuk: React.FC = () => {
  const { documents, addDocument, deleteDocument } = useApp();
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);

  const incomingLetters = documents.filter((d) => d.type === 'surat_masuk');

  const [formData, setFormData] = useState({
    documentNumber: '',
    title: '',
    documentDate: new Date().toISOString().split('T')[0],
    senderOrReceiver: '',
    fileUrl: '#',
    status: 'arsip' as const,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    addDocument({
      type: 'surat_masuk',
      ...formData,
    });
    setIsModalOpen(false);
    setFormData({
      documentNumber: '',
      title: '',
      documentDate: new Date().toISOString().split('T')[0],
      senderOrReceiver: '',
      fileUrl: '#',
      status: 'arsip',
    });
  };

  const filtered = incomingLetters.filter(
    (d) =>
      d.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      d.documentNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      d.senderOrReceiver.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-5 rounded-2xl border border-slate-200/80 shadow-2xs">
        <div>
          <h2 className="text-base font-bold text-slate-900">Buku Agenda Surat Masuk</h2>
          <p className="text-xs text-slate-500">
            Arsip penerimaan surat dinas, undangan eksternal, dan surat edaran sekolah ({incomingLetters.length} Surat)
          </p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold shadow-sm flex items-center gap-1.5 cursor-pointer self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Catat Surat Masuk</span>
        </button>
      </div>

      {/* Filter & Search */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-2xs flex items-center gap-2 max-w-sm">
        <Search className="w-4 h-4 text-slate-400" />
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Cari perihal atau pengirim..."
          className="w-full text-xs bg-transparent outline-none text-slate-700"
        />
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200/80 text-slate-500 font-bold uppercase tracking-wider text-[11px]">
                <th className="py-3 px-4">No. Berkas</th>
                <th className="py-3 px-4">Tanggal Terima</th>
                <th className="py-3 px-4">Pengirim</th>
                <th className="py-3 px-4">Perihal / Isi Surat</th>
                <th className="py-3 px-4 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.map((d) => (
                <tr key={d.id} className="hover:bg-slate-50/70">
                  <td className="py-3 px-4 font-mono font-bold text-indigo-700">
                    {d.documentNumber}
                  </td>
                  <td className="py-3 px-4 font-medium text-slate-700">
                    {formatDateIndo(d.documentDate)}
                  </td>
                  <td className="py-3 px-4 font-semibold text-slate-800">{d.senderOrReceiver}</td>
                  <td className="py-3 px-4 text-slate-600">{d.title}</td>
                  <td className="py-3 px-4 text-right">
                    <button
                      onClick={() => {
                        if (confirm(`Hapus catatan surat ${d.documentNumber}?`)) {
                          deleteDocument(d.id);
                        }
                      }}
                      className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg cursor-pointer"
                      title="Hapus arsip"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Add Incoming Letter */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Catat Surat Masuk Baru"
        subtitle="Registrasi nomor dan identitas surat yang diterima"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">Nomor Surat Asli</label>
            <input
              type="text"
              value={formData.documentNumber}
              onChange={(e) => setFormData({ ...formData, documentNumber: e.target.value })}
              placeholder="Contoh: 120/SMKN1-TU/IX/2026"
              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-indigo-500"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">Pengirim Surat</label>
              <input
                type="text"
                value={formData.senderOrReceiver}
                onChange={(e) => setFormData({ ...formData, senderOrReceiver: e.target.value })}
                placeholder="Contoh: Dinas Pendidikan Provinsi"
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-indigo-500"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">Tanggal Diterima</label>
              <input
                type="date"
                value={formData.documentDate}
                onChange={(e) => setFormData({ ...formData, documentDate: e.target.value })}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-indigo-500"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">Perihal / Ringkasan Isi</label>
            <textarea
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              rows={3}
              placeholder="Ringkasan perihal isi surat..."
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
              Simpan Agenda Surat
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

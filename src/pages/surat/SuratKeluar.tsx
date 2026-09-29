import React, { useState } from 'react';
import { Plus, Send, Search, FileText, Trash2, Calendar, Sparkles } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { DocumentItem } from '../../types';
import { formatDateIndo } from '../../lib/utils';
import { Modal } from '../../components/common/Modal';

export const SuratKeluar: React.FC = () => {
  const { documents, addDocument, deleteDocument, orgProfile } = useApp();
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);

  const outgoingLetters = documents.filter((d) => d.type === 'surat_keluar');

  // Generator auto nomor surat
  const generateNewLetterNumber = () => {
    const nextSeq = String(outgoingLetters.length + 1).padStart(3, '0');
    const monthRoman = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X', 'XI', 'XII'][
      new Date().getMonth()
    ];
    const year = new Date().getFullYear();
    return `${nextSeq}/OSIS-SMK/${monthRoman}/${year}`;
  };

  const [formData, setFormData] = useState({
    documentNumber: generateNewLetterNumber(),
    title: '',
    documentDate: new Date().toISOString().split('T')[0],
    senderOrReceiver: '',
    fileUrl: '#',
    status: 'terkirim' as const,
  });

  const handleOpenAdd = () => {
    setFormData({
      documentNumber: generateNewLetterNumber(),
      title: '',
      documentDate: new Date().toISOString().split('T')[0],
      senderOrReceiver: '',
      fileUrl: '#',
      status: 'terkirim',
    });
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    addDocument({
      type: 'surat_keluar',
      ...formData,
    });
    setIsModalOpen(false);
  };

  const filtered = outgoingLetters.filter(
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
          <h2 className="text-base font-bold text-slate-900">Buku Agenda Surat Keluar</h2>
          <p className="text-xs text-slate-500">
            Penomoran otomatis surat keluar, permohonan dispensasi, dan surat dinas organisasi
          </p>
        </div>
        <button
          onClick={handleOpenAdd}
          className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold shadow-sm flex items-center gap-1.5 cursor-pointer self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Buat Surat Keluar</span>
        </button>
      </div>

      {/* Filter & Search */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-2xs flex items-center gap-2 max-w-sm">
        <Search className="w-4 h-4 text-slate-400" />
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Cari perihal atau tujuan..."
          className="w-full text-xs bg-transparent outline-none text-slate-700"
        />
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200/80 text-slate-500 font-bold uppercase tracking-wider text-[11px]">
                <th className="py-3 px-4">No. Surat Keluar</th>
                <th className="py-3 px-4">Tanggal Keluar</th>
                <th className="py-3 px-4">Tujuan / Penerima</th>
                <th className="py-3 px-4">Perihal</th>
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

      {/* Modal Add Outgoing Letter */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Registrasi Surat Keluar Baru"
        subtitle="Nomor surat digenerate secara otomatis sesuai standar tata naskah dinas"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-xs font-semibold text-slate-600">
                Nomor Surat Otomatis
              </label>
              <span className="text-[10px] text-indigo-600 font-bold flex items-center gap-1">
                <Sparkles className="w-3 h-3" /> Auto-Generated
              </span>
            </div>
            <input
              type="text"
              value={formData.documentNumber}
              onChange={(e) => setFormData({ ...formData, documentNumber: e.target.value })}
              className="w-full px-3 py-2 text-xs font-mono font-bold bg-slate-50 rounded-xl border border-slate-200 text-slate-800"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">Tujuan / Penerima</label>
              <input
                type="text"
                value={formData.senderOrReceiver}
                onChange={(e) => setFormData({ ...formData, senderOrReceiver: e.target.value })}
                placeholder="Kepada: Kepala Sekolah / Instansi Luar"
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-indigo-500"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">Tanggal Surat</label>
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
            <label className="block text-xs font-semibold text-slate-600 mb-1">Perihal Surat</label>
            <textarea
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              rows={3}
              placeholder="Contoh: Permohonan Peminjaman Ruang Aula untuk Gladi Resik Hackathon"
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
              Terbitkan Nomor Surat
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

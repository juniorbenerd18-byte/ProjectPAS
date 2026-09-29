import React, { useState } from 'react';
import {
  FileText,
  Inbox,
  Send,
  FileCheck,
  Plus,
  Search,
  Filter,
  Printer,
  Eye,
  Trash2,
  Calendar,
  Sparkles,
  Building2,
  CheckCircle2,
  Clock,
  Download,
  Share2,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { DocumentItem } from '../../types';
import { formatDateIndo } from '../../lib/utils';
import { Modal } from '../../components/common/Modal';
import { ImagePicker } from '../../components/common/ImagePicker';

export const ArsipDokumenPage: React.FC = () => {
  const { documents, addDocument, deleteDocument, orgProfile, currentRole, showToast } = useApp();

  const [filterType, setFilterType] = useState<'semua' | 'surat_masuk' | 'surat_keluar' | 'proposal' | 'lpj'>('semua');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Modal Add Document
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [docForm, setDocForm] = useState({
    type: 'surat_keluar' as DocumentItem['type'],
    documentNumber: '043/OSIS-SMKN1/IX/2026',
    title: '',
    documentDate: new Date().toISOString().split('T')[0],
    senderOrReceiver: '',
    status: 'terkirim' as DocumentItem['status'],
    fileUrl: '',
  });

  // Modal Disposisi / Preview
  const [previewDoc, setPreviewDoc] = useState<DocumentItem | null>(null);
  const [isDisposisiModalOpen, setIsDisposisiModalOpen] = useState(false);

  // Auto-generate document number helper
  const generateDocNumber = (type: DocumentItem['type']) => {
    const year = new Date().getFullYear();
    const count = documents.filter((d) => d.type === type).length + 1;
    const padded = String(count).padStart(3, '0');
    switch (type) {
      case 'surat_keluar':
        return `${padded}/OSIS-SMKN1/IX/${year}`;
      case 'surat_masuk':
        return `${padded}/MASUK-SMKN1/${year}`;
      case 'proposal':
        return `PROP-${padded}/OSIS/${year}`;
      case 'lpj':
        return `LPJ-${padded}/OSIS/${year}`;
      default:
        return `DOC-${padded}/${year}`;
    }
  };

  const handleOpenAdd = () => {
    const defaultType: DocumentItem['type'] = 'surat_keluar';
    setDocForm({
      type: defaultType,
      documentNumber: generateDocNumber(defaultType),
      title: '',
      documentDate: new Date().toISOString().split('T')[0],
      senderOrReceiver: 'Kepada: ',
      status: 'terkirim',
      fileUrl: '',
    });
    setIsAddModalOpen(true);
  };

  const handleTypeChange = (type: DocumentItem['type']) => {
    setDocForm((prev) => ({
      ...prev,
      type,
      documentNumber: generateDocNumber(type),
      senderOrReceiver: type === 'surat_masuk' ? 'Dari: ' : 'Kepada: ',
      status: type === 'surat_masuk' ? 'arsip' : type === 'surat_keluar' ? 'terkirim' : 'arsip',
    }));
  };

  const handleSaveDoc = (e: React.FormEvent) => {
    e.preventDefault();
    if (!docForm.title.trim()) {
      showToast('Perihal / Judul dokumen wajib diisi!', 'error');
      return;
    }
    if (!docForm.documentNumber.trim()) {
      showToast('Nomor dokumen wajib diisi!', 'error');
      return;
    }

    addDocument({
      type: docForm.type,
      documentNumber: docForm.documentNumber,
      title: docForm.title,
      documentDate: docForm.documentDate,
      senderOrReceiver: docForm.senderOrReceiver,
      status: docForm.status,
      fileUrl: docForm.fileUrl || undefined,
    });

    setIsAddModalOpen(false);
  };

  // Calculations
  const stats = {
    total: documents.length,
    masuk: documents.filter((d) => d.type === 'surat_masuk').length,
    keluar: documents.filter((d) => d.type === 'surat_keluar').length,
    proposal: documents.filter((d) => d.type === 'proposal').length,
    lpj: documents.filter((d) => d.type === 'lpj').length,
  };

  const filteredDocuments = documents.filter((doc) => {
    const matchType = filterType === 'semua' || doc.type === filterType;
    const matchStatus = filterStatus === 'all' || doc.status === filterStatus;
    const matchSearch =
      doc.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      doc.documentNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      doc.senderOrReceiver.toLowerCase().includes(searchQuery.toLowerCase());
    return matchType && matchStatus && matchSearch;
  });

  const getTypeBadge = (type: DocumentItem['type']) => {
    switch (type) {
      case 'surat_masuk':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200">
            <Inbox className="w-3 h-3" />
            Surat Masuk
          </span>
        );
      case 'surat_keluar':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-200">
            <Send className="w-3 h-3" />
            Surat Keluar
          </span>
        );
      case 'proposal':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
            <FileText className="w-3 h-3" />
            Proposal
          </span>
        );
      case 'lpj':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
            <FileCheck className="w-3 h-3" />
            LPJ
          </span>
        );
      default:
        return null;
    }
  };

  const getStatusBadge = (status: DocumentItem['status']) => {
    switch (status) {
      case 'arsip':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-700">
            <CheckCircle2 className="w-3 h-3 text-slate-500" />
            Arsip Baku
          </span>
        );
      case 'terkirim':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-emerald-700">
            <Send className="w-3 h-3 text-emerald-600" />
            Terkirim
          </span>
        );
      case 'pending':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-amber-50 text-amber-700">
            <Clock className="w-3 h-3 text-amber-500" />
            Pending Review
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200/80 shadow-2xs">
        <div>
          <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-md bg-indigo-50 text-indigo-700 text-xs font-semibold mb-1">
            <Building2 className="w-3.5 h-3.5" />
            <span>Administrasi & Kesekretariatan • {orgProfile.name}</span>
          </div>
          <h2 className="text-xl font-black text-slate-900 tracking-tight">Arsip Dokumen & Persuratan</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Manajemen terpusat surat masuk, surat keluar bernomor otomatis, proposal, serta LPJ kegiatan.
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-xl transition-all shadow-sm flex items-center gap-2 cursor-pointer self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          Catat / Buat Dokumen
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-2xs">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Total Dokumen</span>
          <div className="mt-1 text-2xl font-black text-slate-900">{stats.total}</div>
          <p className="text-[10px] text-slate-400 mt-0.5">Semua berkas aktif</p>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-2xs">
          <span className="text-[11px] font-bold text-blue-600 uppercase tracking-wider">Surat Masuk</span>
          <div className="mt-1 text-2xl font-black text-slate-900">{stats.masuk}</div>
          <p className="text-[10px] text-slate-400 mt-0.5">Dari dinas / instansi luar</p>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-2xs">
          <span className="text-[11px] font-bold text-indigo-600 uppercase tracking-wider">Surat Keluar</span>
          <div className="mt-1 text-2xl font-black text-slate-900">{stats.keluar}</div>
          <p className="text-[10px] text-slate-400 mt-0.5">Dispensasi & undangan resmi</p>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-2xs">
          <span className="text-[11px] font-bold text-emerald-600 uppercase tracking-wider">Proposal & LPJ</span>
          <div className="mt-1 text-2xl font-black text-slate-900">{stats.proposal + stats.lpj}</div>
          <p className="text-[10px] text-slate-400 mt-0.5">{stats.proposal} Proposal • {stats.lpj} LPJ</p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-bold text-slate-500 mr-1 flex items-center gap-1">
            <Filter className="w-3.5 h-3.5" />
            Kategori:
          </span>
          {[
            { id: 'semua', label: 'Semua' },
            { id: 'surat_masuk', label: 'Surat Masuk' },
            { id: 'surat_keluar', label: 'Surat Keluar' },
            { id: 'proposal', label: 'Proposal' },
            { id: 'lpj', label: 'LPJ' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setFilterType(tab.id as any)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                filterType === tab.id
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {tab.label}
            </button>
          ))}

          <div className="h-4 w-[1px] bg-slate-200 mx-1 hidden sm:block" />

          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold text-slate-700 focus:outline-none focus:ring-1 focus:ring-indigo-500"
          >
            <option value="all">Semua Status</option>
            <option value="arsip">Arsip</option>
            <option value="terkirim">Terkirim</option>
            <option value="pending">Pending</option>
          </select>
        </div>

        <div className="relative w-full md:w-64">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cari no surat, perihal, pihak..."
            className="w-full pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-900"
          />
        </div>
      </div>

      {/* Document Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200/80 text-slate-600 font-bold uppercase tracking-wider text-[11px]">
                <th className="py-3.5 px-4">Tipe & No. Dokumen</th>
                <th className="py-3.5 px-4">Perihal / Judul Dokumen</th>
                <th className="py-3.5 px-4">Pengirim / Penerima</th>
                <th className="py-3.5 px-4">Tanggal</th>
                <th className="py-3.5 px-4 text-center">Status</th>
                <th className="py-3.5 px-4 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredDocuments.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-400 font-medium">
                    Tidak ada dokumen yang sesuai kriteria filter.
                  </td>
                </tr>
              ) : (
                filteredDocuments.map((doc) => (
                  <tr key={doc.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <div className="flex flex-col gap-1">
                        <div>{getTypeBadge(doc.type)}</div>
                        <span className="font-mono font-bold text-slate-700 text-[11px]">
                          {doc.documentNumber}
                        </span>
                      </div>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="font-bold text-slate-900 block">{doc.title}</span>
                      {doc.fileUrl && (
                        <span className="inline-flex items-center gap-1 text-[10px] text-indigo-600 font-semibold mt-0.5">
                          <Eye className="w-3 h-3" /> Berkas Terlampir
                        </span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-slate-600 font-medium whitespace-nowrap">
                      {doc.senderOrReceiver}
                    </td>
                    <td className="py-3.5 px-4 whitespace-nowrap text-slate-500 font-medium">
                      {formatDateIndo(doc.documentDate)}
                    </td>
                    <td className="py-3.5 px-4 whitespace-nowrap text-center">
                      {getStatusBadge(doc.status)}
                    </td>
                    <td className="py-3.5 px-4 whitespace-nowrap text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => {
                            setPreviewDoc(doc);
                            setIsDisposisiModalOpen(true);
                          }}
                          className="px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-bold transition-colors flex items-center gap-1 cursor-pointer"
                          title="Cetak Lembar Disposisi Resmi"
                        >
                          <Printer className="w-3.5 h-3.5" />
                          Disposisi
                        </button>

                        {(currentRole === 'sekretaris' || currentRole === 'admin' || currentRole === 'ketua') && (
                          <button
                            onClick={() => {
                              if (confirm(`Hapus arsip dokumen "${doc.title}"?`)) {
                                deleteDocument(doc.id);
                              }
                            }}
                            className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition-colors cursor-pointer"
                            title="Hapus Dokumen"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ---------------------------------------------------- */}
      {/* MODAL 1: CATAT DOKUMEN BARU                          */}
      {/* ---------------------------------------------------- */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Catat Dokumen / Surat Baru"
      >
        <form onSubmit={handleSaveDoc} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase mb-1.5">
              Jenis Dokumen
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {[
                { id: 'surat_keluar', label: 'Surat Keluar' },
                { id: 'surat_masuk', label: 'Surat Masuk' },
                { id: 'proposal', label: 'Proposal' },
                { id: 'lpj', label: 'LPJ' },
              ].map((opt) => (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => handleTypeChange(opt.id as any)}
                  className={`py-2 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                    docForm.type === opt.id
                      ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm'
                      : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-bold text-slate-700 uppercase">
                  Nomor Dokumen
                </label>
                <button
                  type="button"
                  onClick={() =>
                    setDocForm((prev) => ({
                      ...prev,
                      documentNumber: generateDocNumber(prev.type),
                    }))
                  }
                  className="text-[10px] text-indigo-600 font-bold hover:underline cursor-pointer"
                >
                  Auto-Gen
                </button>
              </div>
              <input
                type="text"
                required
                value={docForm.documentNumber}
                onChange={(e) => setDocForm((prev) => ({ ...prev, documentNumber: e.target.value }))}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                Tanggal Dokumen
              </label>
              <input
                type="date"
                required
                value={docForm.documentDate}
                onChange={(e) => setDocForm((prev) => ({ ...prev, documentDate: e.target.value }))}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
              Perihal / Judul Dokumen
            </label>
            <input
              type="text"
              required
              value={docForm.title}
              onChange={(e) => setDocForm((prev) => ({ ...prev, title: e.target.value }))}
              placeholder="Contoh: Undangan Narasumber Seminar AI Vokasi"
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                {docForm.type === 'surat_masuk' ? 'Pengirim (Instansi Asal)' : 'Tujuan (Penerima Surat)'}
              </label>
              <input
                type="text"
                required
                value={docForm.senderOrReceiver}
                onChange={(e) => setDocForm((prev) => ({ ...prev, senderOrReceiver: e.target.value }))}
                placeholder={docForm.type === 'surat_masuk' ? 'Dari: Dinas Pendidikan' : 'Kepada: Kepala Sekolah'}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                Status Dokumen
              </label>
              <select
                value={docForm.status}
                onChange={(e) => setDocForm((prev) => ({ ...prev, status: e.target.value as any }))}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="arsip">Arsip Baku</option>
                <option value="terkirim">Terkirim</option>
                <option value="pending">Pending Review</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
              Lampiran Berkas / Scan Surat (Dari Komputer)
            </label>
            <ImagePicker
              value={docForm.fileUrl}
              onChange={(url) => setDocForm((prev) => ({ ...prev, fileUrl: url }))}
              helperText="Pilih foto/scan berkas dari komputer..."
            />
          </div>

          <div className="pt-2 flex justify-end gap-2 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setIsAddModalOpen(false)}
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-colors cursor-pointer"
            >
              Batal
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold transition-all shadow-sm cursor-pointer"
            >
              Simpan Dokumen
            </button>
          </div>
        </form>
      </Modal>

      {/* ---------------------------------------------------- */}
      {/* MODAL 2: CETAK LEMBAR DISPOSISI SURAT RESMI          */}
      {/* ---------------------------------------------------- */}
      <Modal
        isOpen={isDisposisiModalOpen}
        onClose={() => setIsDisposisiModalOpen(false)}
        title="Lembar Disposisi & Rincian Surat Resmi"
      >
        {previewDoc && (
          <div className="space-y-4">
            {/* Sheet Preview */}
            <div className="border border-slate-300 p-5 rounded-xl bg-white text-xs text-slate-800 space-y-4">
              {/* Kop Mini */}
              <div className="text-center border-b border-slate-900 pb-3">
                <h4 className="font-extrabold uppercase text-[10px] text-slate-600">
                  {orgProfile.schoolName}
                </h4>
                <h3 className="font-black uppercase text-sm text-slate-900">
                  LEMBAR DISPOSISI RESMI OSIS
                </h3>
                <p className="text-[9px] text-slate-500">
                  Tahun Ajaran {orgProfile.academicYear} • Sekretariat OSIS
                </p>
              </div>

              {/* Data Surat */}
              <div className="grid grid-cols-2 gap-2 bg-slate-50 p-3 rounded-lg border border-slate-200 text-[11px]">
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">Nomor Surat</span>
                  <span className="font-mono font-bold text-slate-900">{previewDoc.documentNumber}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">Tanggal Surat</span>
                  <span className="font-bold text-slate-900">{formatDateIndo(previewDoc.documentDate)}</span>
                </div>
                <div className="col-span-2 mt-1">
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">Perihal / Isi Ringkas</span>
                  <span className="font-bold text-slate-900">{previewDoc.title}</span>
                </div>
                <div className="col-span-2">
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">Asal / Tujuan</span>
                  <span className="font-semibold text-slate-800">{previewDoc.senderOrReceiver}</span>
                </div>
              </div>

              {/* Instruksi Disposisi Checklist */}
              <div>
                <span className="font-bold text-slate-700 text-[10px] uppercase block mb-1.5">
                  Instruksi / Catatan Disposisi Pembina / Kepala Sekolah:
                </span>
                <div className="grid grid-cols-2 gap-1.5 text-[11px]">
                  <label className="flex items-center gap-1.5">
                    <input type="checkbox" defaultChecked className="rounded text-indigo-600" />
                    <span>Tindak lanjuti segera</span>
                  </label>
                  <label className="flex items-center gap-1.5">
                    <input type="checkbox" className="rounded text-indigo-600" />
                    <span>Hadiri / Wakili</span>
                  </label>
                  <label className="flex items-center gap-1.5">
                    <input type="checkbox" className="rounded text-indigo-600" />
                    <span>Koordinasikan dengan Sekbid</span>
                  </label>
                  <label className="flex items-center gap-1.5">
                    <input type="checkbox" defaultChecked className="rounded text-indigo-600" />
                    <span>Arsipkan dokumen baku</span>
                  </label>
                </div>
              </div>

              {/* Paraf Box */}
              <div className="grid grid-cols-2 gap-4 pt-3 border-t border-slate-200 text-center">
                <div>
                  <p className="text-[10px] text-slate-500 mb-10">Sekretaris Pengarsip,</p>
                  <p className="font-bold underline text-[11px]">Anisa Rahmawati</p>
                  <p className="text-[9px] text-slate-400">NISN. 0071234502</p>
                </div>
                <div>
                  <p className="text-[10px] text-slate-500 mb-10">Pembina OSIS,</p>
                  <p className="font-bold underline text-[11px]">{orgProfile.pembinaName}</p>
                  <p className="text-[9px] text-slate-400">NIP. 19780512 200501 1 004</p>
                </div>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setIsDisposisiModalOpen(false)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-colors cursor-pointer"
              >
                Tutup
              </button>
              <button
                type="button"
                onClick={() => window.print()}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold transition-all shadow-sm flex items-center gap-1.5 cursor-pointer"
              >
                <Printer className="w-3.5 h-3.5" />
                Cetak Lembar Disposisi
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

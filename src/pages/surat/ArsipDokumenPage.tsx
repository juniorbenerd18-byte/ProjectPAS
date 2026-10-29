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
  Building2,
  CheckCircle2,
  Clock,
  AlertCircle,
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

  // Modal Delete Confirm
  const [docToDelete, setDocToDelete] = useState<DocumentItem | null>(null);

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

  const handleConfirmDelete = () => {
    if (docToDelete) {
      deleteDocument(docToDelete.id);
      setDocToDelete(null);
    }
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
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-[8px] text-[13px] font-semibold bg-[#E4EAF2] text-[#1F3A5F] dark:bg-[#1F3A5F]/40 dark:text-[#E4EAF2]">
            <Inbox className="w-3.5 h-3.5" />
            Surat Masuk
          </span>
        );
      case 'surat_keluar':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-[8px] text-[13px] font-semibold bg-[#E4EAF2] text-[#1F3A5F] dark:bg-[#1F3A5F]/40 dark:text-[#E4EAF2]">
            <Send className="w-3.5 h-3.5" />
            Surat Keluar
          </span>
        );
      case 'proposal':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-[8px] text-[13px] font-semibold bg-[#FAF6EE] text-[#1F3A5F] border border-[#E6DFD0] dark:bg-[#17293E] dark:text-[#FAF6EE] dark:border-[#283D56]">
            <FileText className="w-3.5 h-3.5" />
            Proposal
          </span>
        );
      case 'lpj':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-[8px] text-[13px] font-semibold bg-[#FAF6EE] text-[#1F3A5F] border border-[#E6DFD0] dark:bg-[#17293E] dark:text-[#FAF6EE] dark:border-[#283D56]">
            <FileCheck className="w-3.5 h-3.5" />
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
          <span className="simo-badge-neutral">
            <CheckCircle2 className="w-3.5 h-3.5" />
            Arsip Baku
          </span>
        );
      case 'terkirim':
        return (
          <span className="simo-badge-blue">
            <CheckCircle2 className="w-3.5 h-3.5" />
            Terkirim
          </span>
        );
      case 'pending':
        return (
          <span className="simo-badge-amber">
            <Clock className="w-3.5 h-3.5" />
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
      <div className="simo-card p-6 sm:p-7 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-5">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-[8px] bg-[#E4EAF2] dark:bg-[#1F3A5F]/40 text-[#1F3A5F] dark:text-[#E4EAF2] text-[14px] font-bold mb-2">
            <Building2 className="w-4 h-4" />
            <span>Administrasi & Kesekretariatan • {orgProfile.name}</span>
          </div>
          <h2 className="text-2xl font-extrabold text-[#1F3A5F] dark:text-[#FAF6EE] tracking-tight">
            Arsip Dokumen & Persuratan
          </h2>
          <p className="text-[15px] text-[#5A6472] dark:text-[#9AA8B8] mt-1">
            Manajemen terpusat surat masuk, surat keluar bernomor otomatis, proposal, serta LPJ kegiatan.
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="simo-btn-primary min-h-[44px] px-5 py-2.5 rounded-[12px] flex items-center justify-center gap-2 cursor-pointer self-start sm:self-auto shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Catat / Buat Dokumen</span>
        </button>
      </div>

      {/* 4 Stats Cards -> Single Continuous Card with Dividers */}
      <div className="simo-card p-0 grid grid-cols-2 lg:grid-cols-4 divide-y sm:divide-y-0 sm:divide-x divide-[#E6DFD0] dark:divide-[#283D56] overflow-hidden">
        <div className="p-5 sm:p-6 flex flex-col justify-between">
          <span className="text-[14px] font-bold text-[#5A6472] dark:text-[#9AA8B8]">Total Dokumen</span>
          <div className="my-2 text-3xl font-extrabold text-[#1F3A5F] dark:text-[#FAF6EE]">{stats.total}</div>
          <p className="text-[14px] text-[#5A6472] dark:text-[#9AA8B8]">Semua berkas aktif</p>
        </div>

        <div className="p-5 sm:p-6 flex flex-col justify-between">
          <span className="text-[14px] font-bold text-[#1F3A5F] dark:text-[#E4EAF2]">Surat Masuk</span>
          <div className="my-2 text-3xl font-extrabold text-[#1F3A5F] dark:text-[#FAF6EE]">{stats.masuk}</div>
          <p className="text-[14px] text-[#5A6472] dark:text-[#9AA8B8]">Dari dinas & instansi luar</p>
        </div>

        <div className="p-5 sm:p-6 flex flex-col justify-between">
          <span className="text-[14px] font-bold text-[#1F3A5F] dark:text-[#E4EAF2]">Surat Keluar</span>
          <div className="my-2 text-3xl font-extrabold text-[#1F3A5F] dark:text-[#FAF6EE]">{stats.keluar}</div>
          <p className="text-[14px] text-[#5A6472] dark:text-[#9AA8B8]">Dispensasi & undangan resmi</p>
        </div>

        <div className="p-5 sm:p-6 flex flex-col justify-between">
          <span className="text-[14px] font-bold text-[#1F3A5F] dark:text-[#E4EAF2]">Proposal & LPJ</span>
          <div className="my-2 text-3xl font-extrabold text-[#1F3A5F] dark:text-[#FAF6EE]">{stats.proposal + stats.lpj}</div>
          <p className="text-[14px] text-[#5A6472] dark:text-[#9AA8B8]">{stats.proposal} Proposal • {stats.lpj} LPJ</p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="simo-card p-4 sm:p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-[14px] font-bold text-[#5A6472] dark:text-[#9AA8B8] mr-1 flex items-center gap-1.5">
            <Filter className="w-4 h-4" />
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
              className={`min-h-[40px] px-3.5 py-1.5 rounded-[10px] text-[14px] font-bold transition-all cursor-pointer ${
                filterType === tab.id
                  ? 'simo-chip-active'
                  : 'simo-chip'
              }`}
            >
              {tab.label}
            </button>
          ))}

          <div className="h-5 w-[1px] bg-[#E6DFD0] dark:bg-[#283D56] mx-1 hidden sm:block" />

          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="simo-input min-h-[40px] py-1.5 px-3 text-[14px] font-semibold text-[#1F3A5F] dark:text-[#FAF6EE]"
          >
            <option value="all">Semua Status</option>
            <option value="arsip">Arsip</option>
            <option value="terkirim">Terkirim</option>
            <option value="pending">Pending</option>
          </select>
        </div>

        <div className="relative w-full md:w-72">
          <Search className="w-4 h-4 text-[#5A6472] dark:text-[#9AA8B8] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cari no surat, perihal, pihak..."
            className="simo-input pl-10 pr-3 min-h-[40px] text-[14px] w-full"
          />
        </div>
      </div>

      {/* Desktop Document Table */}
      <div className="simo-card p-0 overflow-hidden hidden md:block">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-[15px]">
            <thead>
              <tr className="bg-[#FAF6EE] dark:bg-[#17293E] border-b border-[#E6DFD0] dark:border-[#283D56] text-[#1F3A5F] dark:text-[#FAF6EE] font-bold text-[14px]">
                <th className="py-4 px-5">Tipe & No. Dokumen</th>
                <th className="py-4 px-5">Perihal / Judul Dokumen</th>
                <th className="py-4 px-5">Pengirim / Penerima</th>
                <th className="py-4 px-5">Tanggal</th>
                <th className="py-4 px-5 text-center">Status</th>
                <th className="py-4 px-5 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E6DFD0] dark:divide-[#283D56]">
              {filteredDocuments.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-[#5A6472] dark:text-[#9AA8B8] font-medium text-[15px]">
                    Tidak ada dokumen yang sesuai kriteria filter.
                  </td>
                </tr>
              ) : (
                filteredDocuments.map((doc) => (
                  <tr key={doc.id} className="hover:bg-[#FAF6EE]/50 dark:hover:bg-[#17293E]/50 transition-colors">
                    <td className="py-4 px-5 whitespace-nowrap">
                      <div className="flex flex-col gap-1.5 items-start">
                        {getTypeBadge(doc.type)}
                        <span className="font-mono font-bold text-[#1F3A5F] dark:text-[#FAF6EE] text-[13px]">
                          {doc.documentNumber}
                        </span>
                      </div>
                    </td>
                    <td className="py-4 px-5">
                      <span className="font-bold text-[#1F3A5F] dark:text-[#FAF6EE] block text-[15px] leading-snug">
                        {doc.title}
                      </span>
                      {doc.fileUrl && (
                        <span className="inline-flex items-center gap-1.5 text-[13px] text-[#1F3A5F] dark:text-[#F2B544] font-semibold mt-1">
                          <Eye className="w-3.5 h-3.5" /> Berkas Terlampir
                        </span>
                      )}
                    </td>
                    <td className="py-4 px-5 text-[#5A6472] dark:text-[#9AA8B8] font-medium whitespace-nowrap text-[14px]">
                      {doc.senderOrReceiver}
                    </td>
                    <td className="py-4 px-5 whitespace-nowrap text-[#5A6472] dark:text-[#9AA8B8] font-medium text-[14px]">
                      {formatDateIndo(doc.documentDate)}
                    </td>
                    <td className="py-4 px-5 whitespace-nowrap text-center">
                      {getStatusBadge(doc.status)}
                    </td>
                    <td className="py-4 px-5 whitespace-nowrap text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => {
                            setPreviewDoc(doc);
                            setIsDisposisiModalOpen(true);
                          }}
                          className="simo-btn-outline min-h-[38px] px-3.5 py-1.5 rounded-[10px] text-[13px] flex items-center gap-1.5 cursor-pointer"
                          title="Cetak Lembar Disposisi Resmi"
                        >
                          <Printer className="w-3.5 h-3.5" />
                          <span>Disposisi</span>
                        </button>

                        {(currentRole === 'sekretaris' || currentRole === 'admin' || currentRole === 'ketua') && (
                          <button
                            onClick={() => setDocToDelete(doc)}
                            className="min-h-[38px] min-w-[38px] flex items-center justify-center text-[#5A6472] hover:text-[#1F3A5F] dark:text-[#9AA8B8] dark:hover:text-[#FAF6EE] rounded-[10px] border border-transparent hover:border-[#E6DFD0] dark:hover:border-[#283D56] transition-colors cursor-pointer"
                            title="Hapus Dokumen"
                            aria-label={`Hapus ${doc.title}`}
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

      {/* Mobile Card List (Responsive display below md) */}
      <div className="space-y-3.5 md:hidden">
        {filteredDocuments.length === 0 ? (
          <div className="simo-card p-8 text-center text-[#5A6472] dark:text-[#9AA8B8] font-medium text-[15px]">
            Tidak ada dokumen yang sesuai kriteria filter.
          </div>
        ) : (
          filteredDocuments.map((doc) => (
            <div key={doc.id} className="simo-card p-5 space-y-3.5">
              <div className="flex items-center justify-between gap-2">
                {getTypeBadge(doc.type)}
                {getStatusBadge(doc.status)}
              </div>

              <div>
                <span className="font-mono text-[13px] font-bold text-[#5A6472] dark:text-[#9AA8B8] block mb-1">
                  {doc.documentNumber}
                </span>
                <h4 className="font-bold text-[16px] text-[#1F3A5F] dark:text-[#FAF6EE]">
                  {doc.title}
                </h4>
              </div>

              <div className="text-[14px] text-[#5A6472] dark:text-[#9AA8B8] space-y-1 pt-2 border-t border-[#E6DFD0] dark:border-[#283D56]">
                <p><span className="font-semibold text-[#1F3A5F] dark:text-[#FAF6EE]">Pihak:</span> {doc.senderOrReceiver}</p>
                <p><span className="font-semibold text-[#1F3A5F] dark:text-[#FAF6EE]">Tanggal:</span> {formatDateIndo(doc.documentDate)}</p>
                {doc.fileUrl && (
                  <p className="inline-flex items-center gap-1.5 text-[13px] text-[#1F3A5F] dark:text-[#F2B544] font-semibold pt-1">
                    <Eye className="w-3.5 h-3.5" /> Berkas Terlampir
                  </p>
                )}
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#E6DFD0] dark:border-[#283D56]">
                <button
                  onClick={() => {
                    setPreviewDoc(doc);
                    setIsDisposisiModalOpen(true);
                  }}
                  className="simo-btn-outline min-h-[44px] px-4 rounded-[12px] text-[14px] flex items-center gap-2 cursor-pointer"
                >
                  <Printer className="w-4 h-4" />
                  <span>Disposisi</span>
                </button>

                {(currentRole === 'sekretaris' || currentRole === 'admin' || currentRole === 'ketua') && (
                  <button
                    onClick={() => setDocToDelete(doc)}
                    className="min-h-[44px] min-w-[44px] flex items-center justify-center text-[#5A6472] hover:text-[#1F3A5F] dark:text-[#9AA8B8] dark:hover:text-[#FAF6EE] rounded-[12px] border border-[#E6DFD0] dark:border-[#283D56] transition-colors cursor-pointer"
                    title="Hapus Dokumen"
                    aria-label={`Hapus ${doc.title}`}
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          ))
        )}
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
            <label className="block text-[14px] font-bold text-[#1F3A5F] dark:text-[#FAF6EE] mb-2">
              Jenis Dokumen
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
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
                  className={`min-h-[44px] px-3 py-2 rounded-[12px] text-[14px] font-bold transition-all cursor-pointer border ${
                    docForm.type === opt.id
                      ? 'bg-[#1F3A5F] text-[#FAF6EE] border-[#1F3A5F]'
                      : 'bg-[#FFFDF8] dark:bg-[#17293E] text-[#1F3A5F] dark:text-[#FAF6EE] border-[#E6DFD0] dark:border-[#283D56] hover:bg-[#FAF6EE]'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-[14px] font-bold text-[#1F3A5F] dark:text-[#FAF6EE]">
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
                  className="text-[13px] text-[#1F3A5F] dark:text-[#F2B544] font-bold hover:underline cursor-pointer"
                >
                  Auto-Gen
                </button>
              </div>
              <input
                type="text"
                required
                value={docForm.documentNumber}
                onChange={(e) => setDocForm((prev) => ({ ...prev, documentNumber: e.target.value }))}
                className="simo-input min-h-[44px] font-mono font-bold text-[14px] w-full"
              />
            </div>

            <div>
              <label className="block text-[14px] font-bold text-[#1F3A5F] dark:text-[#FAF6EE] mb-1.5">
                Tanggal Dokumen
              </label>
              <input
                type="date"
                required
                value={docForm.documentDate}
                onChange={(e) => setDocForm((prev) => ({ ...prev, documentDate: e.target.value }))}
                className="simo-input min-h-[44px] text-[14px] w-full"
              />
            </div>
          </div>

          <div>
            <label className="block text-[14px] font-bold text-[#1F3A5F] dark:text-[#FAF6EE] mb-1.5">
              Perihal / Judul Dokumen
            </label>
            <input
              type="text"
              required
              value={docForm.title}
              onChange={(e) => setDocForm((prev) => ({ ...prev, title: e.target.value }))}
              placeholder="Contoh: Undangan Narasumber Seminar AI Vokasi"
              className="simo-input min-h-[44px] text-[15px] w-full"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-[14px] font-bold text-[#1F3A5F] dark:text-[#FAF6EE] mb-1.5">
                {docForm.type === 'surat_masuk' ? 'Pengirim (Instansi Asal)' : 'Tujuan (Penerima Surat)'}
              </label>
              <input
                type="text"
                required
                value={docForm.senderOrReceiver}
                onChange={(e) => setDocForm((prev) => ({ ...prev, senderOrReceiver: e.target.value }))}
                placeholder={docForm.type === 'surat_masuk' ? 'Dari: Dinas Pendidikan' : 'Kepada: Kepala Sekolah'}
                className="simo-input min-h-[44px] text-[14px] w-full"
              />
            </div>

            <div>
              <label className="block text-[14px] font-bold text-[#1F3A5F] dark:text-[#FAF6EE] mb-1.5">
                Status Dokumen
              </label>
              <select
                value={docForm.status}
                onChange={(e) => setDocForm((prev) => ({ ...prev, status: e.target.value as any }))}
                className="simo-input min-h-[44px] text-[14px] w-full"
              >
                <option value="arsip">Arsip Baku</option>
                <option value="terkirim">Terkirim</option>
                <option value="pending">Pending Review</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-[14px] font-bold text-[#1F3A5F] dark:text-[#FAF6EE] mb-1.5">
              Lampiran Berkas / Scan Surat (Dari Komputer)
            </label>
            <ImagePicker
              value={docForm.fileUrl}
              onChange={(url) => setDocForm((prev) => ({ ...prev, fileUrl: url }))}
              helperText="Pilih foto/scan berkas dari komputer..."
            />
          </div>

          <div className="pt-3 flex justify-end gap-3 border-t border-[#E6DFD0] dark:border-[#283D56]">
            <button
              type="button"
              onClick={() => setIsAddModalOpen(false)}
              className="simo-btn-outline min-h-[44px] px-5 rounded-[12px] text-[14px] font-bold cursor-pointer"
            >
              Batal
            </button>
            <button
              type="submit"
              className="simo-btn-primary min-h-[44px] px-5 rounded-[12px] text-[14px] font-bold cursor-pointer"
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
          <div className="space-y-5">
            {/* Sheet Preview */}
            <div className="border border-[#E6DFD0] dark:border-[#283D56] p-6 rounded-[16px] bg-[#FFFDF8] dark:bg-[#17293E] text-[14px] text-[#1F3A5F] dark:text-[#FAF6EE] space-y-4">
              {/* Kop Mini */}
              <div className="text-center border-b border-[#1F3A5F] dark:border-[#E6DFD0] pb-3">
                <h4 className="font-extrabold uppercase text-[13px] text-[#5A6472] dark:text-[#9AA8B8]">
                  {orgProfile.schoolName}
                </h4>
                <h3 className="font-extrabold uppercase text-[17px] text-[#1F3A5F] dark:text-[#FAF6EE]">
                  LEMBAR DISPOSISI RESMI OSIS
                </h3>
                <p className="text-[13px] text-[#5A6472] dark:text-[#9AA8B8]">
                  Tahun Ajaran {orgProfile.academicYear} • Sekretariat OSIS
                </p>
              </div>

              {/* Data Surat */}
              <div className="grid grid-cols-2 gap-3 bg-[#FAF6EE] dark:bg-[#0E1B2C] p-4 rounded-[12px] border border-[#E6DFD0] dark:border-[#283D56] text-[14px]">
                <div>
                  <span className="text-[#5A6472] dark:text-[#9AA8B8] block text-[13px] font-bold">Nomor Surat</span>
                  <span className="font-mono font-bold text-[#1F3A5F] dark:text-[#FAF6EE]">{previewDoc.documentNumber}</span>
                </div>
                <div>
                  <span className="text-[#5A6472] dark:text-[#9AA8B8] block text-[13px] font-bold">Tanggal Surat</span>
                  <span className="font-bold text-[#1F3A5F] dark:text-[#FAF6EE]">{formatDateIndo(previewDoc.documentDate)}</span>
                </div>
                <div className="col-span-2 mt-1">
                  <span className="text-[#5A6472] dark:text-[#9AA8B8] block text-[13px] font-bold">Perihal / Isi Ringkas</span>
                  <span className="font-bold text-[#1F3A5F] dark:text-[#FAF6EE]">{previewDoc.title}</span>
                </div>
                <div className="col-span-2">
                  <span className="text-[#5A6472] dark:text-[#9AA8B8] block text-[13px] font-bold">Asal / Tujuan</span>
                  <span className="font-semibold text-[#1F3A5F] dark:text-[#FAF6EE]">{previewDoc.senderOrReceiver}</span>
                </div>
              </div>

              {/* Instruksi Disposisi Checklist */}
              <div>
                <span className="font-bold text-[#1F3A5F] dark:text-[#FAF6EE] text-[14px] block mb-2">
                  Instruksi / Catatan Disposisi Pembina / Kepala Sekolah:
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-[14px]">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" defaultChecked className="rounded border-[#E6DFD0] text-[#1F3A5F] focus:ring-[#1F3A5F]" />
                    <span>Tindak lanjuti segera</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" className="rounded border-[#E6DFD0] text-[#1F3A5F] focus:ring-[#1F3A5F]" />
                    <span>Hadiri / Wakili</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" className="rounded border-[#E6DFD0] text-[#1F3A5F] focus:ring-[#1F3A5F]" />
                    <span>Koordinasikan dengan Sekbid</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" defaultChecked className="rounded border-[#E6DFD0] text-[#1F3A5F] focus:ring-[#1F3A5F]" />
                    <span>Arsipkan dokumen baku</span>
                  </label>
                </div>
              </div>

              {/* Paraf Box */}
              <div className="grid grid-cols-2 gap-4 pt-4 border-t border-[#E6DFD0] dark:border-[#283D56] text-center">
                <div>
                  <p className="text-[13px] text-[#5A6472] dark:text-[#9AA8B8] mb-12">Sekretaris Pengarsip,</p>
                  <p className="font-bold underline text-[14px]">Anisa Rahmawati</p>
                  <p className="text-[12px] text-[#5A6472] dark:text-[#9AA8B8]">NISN. 0071234502</p>
                </div>
                <div>
                  <p className="text-[13px] text-[#5A6472] dark:text-[#9AA8B8] mb-12">Pembina OSIS,</p>
                  <p className="font-bold underline text-[14px]">{orgProfile.pembinaName}</p>
                  <p className="text-[12px] text-[#5A6472] dark:text-[#9AA8B8]">NIP. 19780512 200501 1 004</p>
                </div>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setIsDisposisiModalOpen(false)}
                className="simo-btn-outline min-h-[44px] px-5 rounded-[12px] text-[14px] font-bold cursor-pointer"
              >
                Tutup
              </button>
              <button
                type="button"
                onClick={() => window.print()}
                className="simo-btn-primary min-h-[44px] px-5 rounded-[12px] text-[14px] font-bold flex items-center gap-2 cursor-pointer"
              >
                <Printer className="w-4 h-4" />
                <span>Cetak Lembar Disposisi</span>
              </button>
            </div>
          </div>
        )}
      </Modal>

      {/* ---------------------------------------------------- */}
      {/* MODAL 3: KONFIRMASI HAPUS DOKUMEN                    */}
      {/* ---------------------------------------------------- */}
      <Modal
        isOpen={Boolean(docToDelete)}
        onClose={() => setDocToDelete(null)}
        title="Konfirmasi Hapus Dokumen"
      >
        {docToDelete && (
          <div className="space-y-4">
            <div className="flex items-start gap-3 p-4 rounded-[14px] bg-[#FAF6EE] dark:bg-[#17293E] border border-[#E6DFD0] dark:border-[#283D56]">
              <AlertCircle className="w-5 h-5 text-[#F2B544] shrink-0 mt-0.5" />
              <div className="text-[15px] text-[#1F3A5F] dark:text-[#FAF6EE]">
                <p className="font-bold">Apakah Anda yakin ingin menghapus arsip dokumen ini?</p>
                <p className="text-[14px] text-[#5A6472] dark:text-[#9AA8B8] mt-1">
                  "{docToDelete.title}" ({docToDelete.documentNumber})
                </p>
                <p className="text-[13px] text-[#5A6472] dark:text-[#9AA8B8] mt-2">
                  Tindakan ini tidak dapat dibatalkan.
                </p>
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setDocToDelete(null)}
                className="simo-btn-outline min-h-[44px] px-5 rounded-[12px] text-[14px] font-bold cursor-pointer"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                className="simo-btn-primary min-h-[44px] px-5 rounded-[12px] text-[14px] font-bold cursor-pointer"
              >
                Ya, Hapus Dokumen
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

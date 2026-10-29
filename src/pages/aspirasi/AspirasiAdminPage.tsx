import React, { useState, useMemo } from 'react';
import {
  Lightbulb,
  Mail,
  Search,
  CheckCircle2,
  Clock,
  ArrowLeft,
  Globe,
  Filter,
  X,
  Inbox,
  AlertCircle,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { StudentAspiration } from '../../types';
import { Modal } from '../../components/common/Modal';

export const AspirasiAdminPage: React.FC = () => {
  const {
    aspirations,
    updateAspirationStatus,
    orgProfile,
    showToast,
    setActivePage,
  } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | StudentAspiration['status']>('all');
  const [categoryFilter, setCategoryFilter] = useState<'all' | string>('all');
  const [selectedAsp, setSelectedAsp] = useState<StudentAspiration | null>(null);
  const [responseText, setResponseText] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<StudentAspiration['status']>('diproses');

  // Metrics
  const totalCount = aspirations.length;
  const pendingCount = aspirations.filter((a) => a.status === 'diterima').length;
  const inProgressCount = aspirations.filter((a) => a.status === 'diproses').length;
  const completedCount = aspirations.filter((a) => a.status === 'terealisasi').length;

  // Filtered Aspirations
  const filteredAspirations = useMemo(() => {
    return aspirations.filter((a) => {
      const matchSearch =
        a.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        a.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
        a.studentName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (a.email && a.email.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchStatus = statusFilter === 'all' || a.status === statusFilter;
      const matchCategory = categoryFilter === 'all' || a.category === categoryFilter;

      return matchSearch && matchStatus && matchCategory;
    });
  }, [aspirations, searchQuery, statusFilter, categoryFilter]);

  // Direct Gmail Composer
  const handleOpenGmail = (asp: StudentAspiration) => {
    if (!asp.email) {
      showToast('Pengirim tidak menyertakan email.', 'error');
      return;
    }

    const subject = `[Tanggapan OSIS ${orgProfile.schoolName || 'SMKN 1 Cerdas Bangsa'}] Mengenai: ${asp.title}`;
    const bodyText = `Halo Yth. ${asp.studentName},

Terima kasih banyak telah menyampaikan ide dan masukan kepada pengurus OSIS ${orgProfile.schoolName || 'SMK Negeri 1 Cerdas Bangsa'}.

Berikut rangkuman ide/masukan yang Anda kirimkan melalui Portal Publik:
--------------------------------------------------
Topik       : ${asp.title}
Kategori    : ${asp.category.toUpperCase()}
Status      : ${asp.senderRole ? asp.senderRole.replace('_', ' ').toUpperCase() : 'Publik'}
Tanggal     : ${asp.date}

Isi Pesan:
"${asp.content}"
--------------------------------------------------

Tanggapan dan Tindak Lanjut dari Pengurus OSIS:
[Tulis pesan balasan Anda di sini...]

Jika ada pertanyaan atau saran lanjutan, Anda dapat langsung membalas email ini.

Salam hormat,
Pengurus OSIS ${orgProfile.schoolName || 'SMK Negeri 1 Cerdas Bangsa'}
Email Resmi: ${orgProfile.email || 'osis@smkn1cerdasbangsa.sch.id'}`;

    const gmailUrl = `https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(
      asp.email
    )}&su=${encodeURIComponent(subject)}&body=${encodeURIComponent(bodyText)}`;

    window.open(gmailUrl, '_blank');
    showToast(`Membuka Gmail untuk membalas ke ${asp.email}`, 'info');
  };

  const handleSaveResponse = () => {
    if (!selectedAsp) return;

    updateAspirationStatus(
      selectedAsp.id,
      selectedStatus,
      responseText.trim() || undefined
    );

    showToast('Tanggapan resmi & status berhasil disimpan!', 'success');
    setSelectedAsp(null);
    setResponseText('');
  };

  const getStatusBadge = (status: StudentAspiration['status']) => {
    switch (status) {
      case 'terealisasi':
        return (
          <span className="simo-badge-blue">
            <CheckCircle2 className="w-3.5 h-3.5" />
            Terealisasi
          </span>
        );
      case 'diproses':
        return (
          <span className="simo-badge-amber">
            <Clock className="w-3.5 h-3.5" />
            Diproses
          </span>
        );
      case 'diterima':
        return (
          <span className="simo-badge-neutral">
            <Inbox className="w-3.5 h-3.5" />
            Diterima
          </span>
        );
      case 'ditolak':
        return (
          <span className="simo-badge-neutral">
            <X className="w-3.5 h-3.5" />
            Ditolak
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      {/* 1. Header */}
      <div className="simo-card p-6 sm:p-7 flex flex-col sm:flex-row sm:items-center justify-between gap-5">
        <div>
          <button
            onClick={() => setActivePage('dashboard')}
            className="inline-flex items-center gap-2 text-[14px] font-bold text-[#1F3A5F] dark:text-[#F2B544] hover:underline mb-2 cursor-pointer transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Kembali ke Dashboard</span>
          </button>
          <h1 className="text-2xl font-extrabold text-[#1F3A5F] dark:text-[#FAF6EE] flex items-center gap-2.5">
            <span>Daftar Kotak Ide &amp; Aspirasi Siswa/Publik</span>
            <span className="text-[13px] font-bold px-3 py-1 rounded-[8px] bg-[#E4EAF2] dark:bg-[#1F3A5F]/40 text-[#1F3A5F] dark:text-[#FAF6EE] border border-[#E6DFD0] dark:border-[#283D56]">
              {totalCount} Data
            </span>
          </h1>
          <p className="text-[15px] text-[#5A6472] dark:text-[#9AA8B8] mt-1">
            Kelola arsip masukan, tindak lanjut status kegiatan, dan kirim balasan resmi via email.
          </p>
        </div>

        <button
          onClick={() => setActivePage('portal-publik')}
          className="simo-btn-outline min-h-[44px] px-5 py-2.5 rounded-[12px] flex items-center gap-2 cursor-pointer self-start sm:self-auto shrink-0"
        >
          <Globe className="w-4 h-4" />
          <span>Buka Portal Publik</span>
        </button>
      </div>

      {/* 2. Ringkasan Status (Merged into Single Continuous Card with Dividers) */}
      <div className="simo-card p-0 grid grid-cols-2 lg:grid-cols-4 divide-y sm:divide-y-0 sm:divide-x divide-[#E6DFD0] dark:divide-[#283D56] overflow-hidden">
        <button
          type="button"
          onClick={() => setStatusFilter('all')}
          className={`p-5 sm:p-6 text-left transition-colors cursor-pointer ${
            statusFilter === 'all'
              ? 'bg-[#E4EAF2] dark:bg-[#1F3A5F]/40'
              : 'hover:bg-[#FAF6EE] dark:hover:bg-[#17293E]'
          }`}
        >
          <p className="text-[14px] text-[#5A6472] dark:text-[#9AA8B8] font-bold">Semua Masukan</p>
          <p className="text-3xl font-black text-[#1F3A5F] dark:text-[#FAF6EE] mt-1">{totalCount}</p>
          <p className="text-[13px] text-[#5A6472] dark:text-[#9AA8B8] mt-1">Semua kategori ide</p>
        </button>

        <button
          type="button"
          onClick={() => setStatusFilter('diterima')}
          className={`p-5 sm:p-6 text-left transition-colors cursor-pointer ${
            statusFilter === 'diterima'
              ? 'bg-[#E4EAF2] dark:bg-[#1F3A5F]/40'
              : 'hover:bg-[#FAF6EE] dark:hover:bg-[#17293E]'
          }`}
        >
          <p className="text-[14px] text-[#1F3A5F] dark:text-[#E4EAF2] font-bold">Menunggu / Baru</p>
          <p className="text-3xl font-black text-[#1F3A5F] dark:text-[#FAF6EE] mt-1">{pendingCount}</p>
          <p className="text-[13px] text-[#5A6472] dark:text-[#9AA8B8] mt-1">Perlu ditindaklanjuti</p>
        </button>

        <button
          type="button"
          onClick={() => setStatusFilter('diproses')}
          className={`p-5 sm:p-6 text-left transition-colors cursor-pointer ${
            statusFilter === 'diproses'
              ? 'bg-[#FBEBC8] dark:bg-[#F2B544]/20'
              : 'hover:bg-[#FAF6EE] dark:hover:bg-[#17293E]'
          }`}
        >
          <p className="text-[14px] text-[#1F3A5F] dark:text-[#F2B544] font-bold">Sedang Diproses</p>
          <p className="text-3xl font-black text-[#1F3A5F] dark:text-[#FAF6EE] mt-1">{inProgressCount}</p>
          <p className="text-[13px] text-[#5A6472] dark:text-[#9AA8B8] mt-1">Koordinasi sekbid</p>
        </button>

        <button
          type="button"
          onClick={() => setStatusFilter('terealisasi')}
          className={`p-5 sm:p-6 text-left transition-colors cursor-pointer ${
            statusFilter === 'terealisasi'
              ? 'bg-[#E4EAF2] dark:bg-[#1F3A5F]/40'
              : 'hover:bg-[#FAF6EE] dark:hover:bg-[#17293E]'
          }`}
        >
          <p className="text-[14px] text-[#1F3A5F] dark:text-[#E4EAF2] font-bold">Terealisasi</p>
          <p className="text-3xl font-black text-[#1F3A5F] dark:text-[#FAF6EE] mt-1">{completedCount}</p>
          <p className="text-[13px] text-[#5A6472] dark:text-[#9AA8B8] mt-1">Selesai dieksekusi</p>
        </button>
      </div>

      {/* 3. Baris Pencarian & Filter */}
      <div className="simo-card p-4 sm:p-5 flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-3 flex-1">
          {/* Kolom Pencarian */}
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 text-[#5A6472] dark:text-[#9AA8B8] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari nama, email, judul..."
              className="simo-input pl-10 pr-9 min-h-[44px] text-[14px] w-full"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#5A6472] hover:text-[#1F3A5F] cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Filter Status */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as any)}
            className="simo-input min-h-[44px] text-[14px] px-3 font-semibold"
          >
            <option value="all">Semua Status</option>
            <option value="diterima">Diterima (Baru)</option>
            <option value="diproses">Sedang Diproses</option>
            <option value="terealisasi">Terealisasi</option>
            <option value="ditolak">Ditolak</option>
          </select>

          {/* Filter Kategori */}
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="simo-input min-h-[44px] text-[14px] px-3 font-semibold"
          >
            <option value="all">Semua Kategori</option>
            <option value="inovasi">Inovasi</option>
            <option value="kegiatan">Kegiatan</option>
            <option value="fasilitas">Fasilitas</option>
            <option value="organisasi">Organisasi</option>
            <option value="kebersihan">Kebersihan</option>
            <option value="akademik">Akademik</option>
            <option value="lainnya">Lainnya</option>
          </select>

          {(searchQuery || statusFilter !== 'all' || categoryFilter !== 'all') && (
            <button
              onClick={() => {
                setSearchQuery('');
                setStatusFilter('all');
                setCategoryFilter('all');
              }}
              className="text-[14px] font-bold text-[#1F3A5F] dark:text-[#F2B544] hover:underline px-2 py-1 cursor-pointer"
            >
              Reset Filter
            </button>
          )}
        </div>

        <div className="text-[14px] text-[#5A6472] dark:text-[#9AA8B8]">
          Menampilkan <b className="text-[#1F3A5F] dark:text-[#FAF6EE]">{filteredAspirations.length}</b> data
        </div>
      </div>

      {/* 4. Tabel Desktop */}
      <div className="simo-card p-0 overflow-hidden hidden md:block">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-[15px]">
            <thead>
              <tr className="bg-[#FAF6EE] dark:bg-[#17293E] border-b border-[#E6DFD0] dark:border-[#283D56] text-[#1F3A5F] dark:text-[#FAF6EE] font-bold text-[14px]">
                <th className="py-4 px-4 text-center w-12">No</th>
                <th className="py-4 px-4 w-28">Tanggal</th>
                <th className="py-4 px-4 w-44">Pengirim</th>
                <th className="py-4 px-4 w-28">Kategori</th>
                <th className="py-4 px-5 min-w-[260px]">Judul &amp; Isi Masukan</th>
                <th className="py-4 px-4 w-44">Kontak / Email</th>
                <th className="py-4 px-4 w-28 text-center">Status</th>
                <th className="py-4 px-4 w-36 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E6DFD0] dark:divide-[#283D56]">
              {filteredAspirations.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-[#5A6472] dark:text-[#9AA8B8] font-medium text-[15px]">
                    Tidak ada data masukan yang sesuai dengan kriteria filter.
                  </td>
                </tr>
              ) : (
                filteredAspirations.map((asp, idx) => (
                  <tr
                    key={asp.id}
                    className="hover:bg-[#FAF6EE]/50 dark:hover:bg-[#17293E]/50 transition-colors"
                  >
                    {/* No */}
                    <td className="py-4 px-4 text-center font-medium text-[#5A6472] dark:text-[#9AA8B8]">
                      {idx + 1}
                    </td>

                    {/* Tanggal */}
                    <td className="py-4 px-4 whitespace-nowrap text-[#5A6472] dark:text-[#9AA8B8] font-medium text-[14px]">
                      {asp.date}
                    </td>

                    {/* Pengirim */}
                    <td className="py-4 px-4">
                      <div className="font-bold text-[#1F3A5F] dark:text-[#FAF6EE]">
                        {asp.studentName}
                      </div>
                      <div className="text-[13px] text-[#5A6472] dark:text-[#9AA8B8]">
                        {asp.classRoom || 'Publik'} {asp.senderRole ? `• ${asp.senderRole.replace('_', ' ')}` : ''}
                      </div>
                    </td>

                    {/* Kategori */}
                    <td className="py-4 px-4">
                      <span className="inline-block px-2.5 py-1 rounded-[8px] text-[13px] font-bold uppercase bg-[#FAF6EE] dark:bg-[#17293E] text-[#1F3A5F] dark:text-[#FAF6EE] border border-[#E6DFD0] dark:border-[#283D56]">
                        {asp.category}
                      </span>
                    </td>

                    {/* Judul & Isi Masukan */}
                    <td className="py-4 px-5">
                      <div className="font-bold text-[#1F3A5F] dark:text-[#FAF6EE] mb-1">
                        {asp.title}
                      </div>
                      <div className="text-[#5A6472] dark:text-[#9AA8B8] line-clamp-2 leading-relaxed text-[14px]">
                        "{asp.content}"
                      </div>
                      {asp.response && (
                        <div className="mt-2 p-2.5 rounded-[10px] bg-[#E4EAF2] dark:bg-[#1F3A5F]/30 border border-[#E6DFD0] dark:border-[#283D56] text-[13px] text-[#1F3A5F] dark:text-[#FAF6EE]">
                          <span className="font-bold">Tanggapan OSIS:</span> {asp.response}
                        </div>
                      )}
                    </td>

                    {/* Kontak / Email */}
                    <td className="py-4 px-4 font-mono text-[13px] text-[#5A6472] dark:text-[#9AA8B8]">
                      {asp.email ? (
                        <span className="break-all">{asp.email}</span>
                      ) : (
                        <span className="text-[#5A6472] dark:text-[#9AA8B8] italic">Tanpa Email</span>
                      )}
                    </td>

                    {/* Status */}
                    <td className="py-4 px-4 text-center whitespace-nowrap">
                      {getStatusBadge(asp.status)}
                    </td>

                    {/* Aksi */}
                    <td className="py-4 px-4 text-right whitespace-nowrap">
                      <div className="inline-flex items-center gap-2">
                        {asp.email && (
                          <button
                            onClick={() => handleOpenGmail(asp)}
                            title="Balas ke pengirim via Gmail"
                            className="simo-btn-outline min-h-[38px] px-3 py-1 rounded-[10px] text-[13px] flex items-center gap-1.5 cursor-pointer"
                          >
                            <Mail className="w-3.5 h-3.5" />
                            <span>Gmail</span>
                          </button>
                        )}
                        <button
                          onClick={() => {
                            setSelectedAsp(asp);
                            setResponseText(asp.response || '');
                            setSelectedStatus(asp.status);
                          }}
                          className="simo-btn-primary min-h-[38px] px-3.5 py-1 rounded-[10px] text-[13px] cursor-pointer"
                        >
                          Tanggapi
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Footer info tabel */}
        <div className="p-4 bg-[#FAF6EE] dark:bg-[#17293E] border-t border-[#E6DFD0] dark:border-[#283D56] text-[14px] text-[#5A6472] dark:text-[#9AA8B8] flex items-center justify-between">
          <span>Menampilkan {filteredAspirations.length} dari {aspirations.length} total masukan</span>
          <span>Data tersinkronisasi dengan formulir publik</span>
        </div>
      </div>

      {/* Mobile Card List */}
      <div className="space-y-3.5 md:hidden">
        {filteredAspirations.length === 0 ? (
          <div className="simo-card p-8 text-center text-[#5A6472] dark:text-[#9AA8B8] font-medium text-[15px]">
            Tidak ada data masukan yang sesuai dengan kriteria filter.
          </div>
        ) : (
          filteredAspirations.map((asp) => (
            <div key={asp.id} className="simo-card p-5 space-y-3.5">
              <div className="flex items-center justify-between gap-2">
                <span className="px-2.5 py-1 rounded-[8px] text-[12px] font-bold uppercase bg-[#FAF6EE] dark:bg-[#17293E] text-[#1F3A5F] dark:text-[#FAF6EE] border border-[#E6DFD0] dark:border-[#283D56]">
                  {asp.category}
                </span>
                {getStatusBadge(asp.status)}
              </div>

              <div>
                <h4 className="font-bold text-[16px] text-[#1F3A5F] dark:text-[#FAF6EE]">
                  {asp.title}
                </h4>
                <p className="text-[14px] text-[#5A6472] dark:text-[#9AA8B8] mt-1 leading-relaxed">
                  "{asp.content}"
                </p>
              </div>

              <div className="text-[13px] text-[#5A6472] dark:text-[#9AA8B8] space-y-1 pt-2 border-t border-[#E6DFD0] dark:border-[#283D56]">
                <p><span className="font-semibold text-[#1F3A5F] dark:text-[#FAF6EE]">Pengirim:</span> {asp.studentName} ({asp.classRoom || 'Publik'})</p>
                <p><span className="font-semibold text-[#1F3A5F] dark:text-[#FAF6EE]">Tanggal:</span> {asp.date}</p>
                {asp.email && (
                  <p className="font-mono text-[12px]"><span className="font-semibold text-[#1F3A5F] dark:text-[#FAF6EE]">Email:</span> {asp.email}</p>
                )}
              </div>

              {asp.response && (
                <div className="p-3 rounded-[10px] bg-[#E4EAF2] dark:bg-[#1F3A5F]/30 border border-[#E6DFD0] dark:border-[#283D56] text-[13px] text-[#1F3A5F] dark:text-[#FAF6EE]">
                  <span className="font-bold">Tanggapan OSIS:</span> {asp.response}
                </div>
              )}

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#E6DFD0] dark:border-[#283D56]">
                {asp.email && (
                  <button
                    onClick={() => handleOpenGmail(asp)}
                    className="simo-btn-outline min-h-[44px] px-4 rounded-[12px] text-[14px] flex items-center gap-1.5 cursor-pointer"
                  >
                    <Mail className="w-4 h-4" />
                    <span>Gmail</span>
                  </button>
                )}
                <button
                  onClick={() => {
                    setSelectedAsp(asp);
                    setResponseText(asp.response || '');
                    setSelectedStatus(asp.status);
                  }}
                  className="simo-btn-primary min-h-[44px] px-4 rounded-[12px] text-[14px] cursor-pointer"
                >
                  Tanggapi
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* 5. Modal Tindak Lanjut Ide / Aspirasi */}
      <Modal
        isOpen={Boolean(selectedAsp)}
        onClose={() => setSelectedAsp(null)}
        title="Tindak Lanjut Ide / Aspirasi"
      >
        {selectedAsp && (
          <div className="space-y-4 text-[14px]">
            {/* Info Pengirim */}
            <div className="p-4 bg-[#FAF6EE] dark:bg-[#0E1B2C] rounded-[14px] border border-[#E6DFD0] dark:border-[#283D56] space-y-1">
              <div className="flex items-center justify-between text-[13px] text-[#5A6472] dark:text-[#9AA8B8]">
                <span className="font-bold text-[#1F3A5F] dark:text-[#FAF6EE]">
                  {selectedAsp.title}
                </span>
                <span>{selectedAsp.date}</span>
              </div>
              <p className="text-[#5A6472] dark:text-[#9AA8B8] italic pt-1">
                "{selectedAsp.content}"
              </p>
              <p className="text-[13px] text-[#5A6472] dark:text-[#9AA8B8] pt-1">
                Dari: <b>{selectedAsp.studentName}</b> ({selectedAsp.email || 'Tanpa Email'})
              </p>
            </div>

            {selectedAsp.email && (
              <div className="p-4 bg-[#FBEBC8] dark:bg-[#F2B544]/20 rounded-[14px] border border-[#E6DFD0] dark:border-[#283D56] flex items-center justify-between gap-3">
                <div>
                  <p className="font-bold text-[#1F3A5F] dark:text-[#FAF6EE]">
                    Diskusi Langsung via Gmail
                  </p>
                  <p className="text-[13px] text-[#5A6472] dark:text-[#9AA8B8] font-mono">
                    {selectedAsp.email}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => handleOpenGmail(selectedAsp)}
                  className="simo-btn-amber min-h-[40px] px-4 rounded-[10px] text-[13px] font-bold flex items-center gap-1.5 cursor-pointer"
                >
                  <Mail className="w-4 h-4" />
                  <span>Buka Gmail</span>
                </button>
              </div>
            )}

            {/* Status Pilihan */}
            <div>
              <label className="block font-bold text-[#1F3A5F] dark:text-[#FAF6EE] mb-1.5">
                Status Penanganan
              </label>
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value as any)}
                className="simo-input min-h-[44px] text-[14px] w-full"
              >
                <option value="diterima">Diterima (Menunggu Peninjauan)</option>
                <option value="diproses">Diproses (Sedang Ditindaklanjuti)</option>
                <option value="terealisasi">Terealisasi (Selesai Dijalankan)</option>
                <option value="ditolak">Ditolak / Belum Dapat Dilaksanakan</option>
              </select>
            </div>

            {/* Tanggapan Resmi */}
            <div>
              <label className="block font-bold text-[#1F3A5F] dark:text-[#FAF6EE] mb-1.5">
                Tanggapan Resmi Pengurus (Tampil di Portal Publik)
              </label>
              <textarea
                rows={4}
                value={responseText}
                onChange={(e) => setResponseText(e.target.value)}
                placeholder="Tuliskan tanggapan atau evaluasi pengurus OSIS terhadap ide ini..."
                className="simo-input text-[14px] w-full p-3 leading-relaxed"
              />
            </div>

            {/* Modal Actions */}
            <div className="pt-3 flex justify-end gap-3 border-t border-[#E6DFD0] dark:border-[#283D56]">
              <button
                type="button"
                onClick={() => setSelectedAsp(null)}
                className="simo-btn-outline min-h-[44px] px-5 rounded-[12px] text-[14px] font-bold cursor-pointer"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleSaveResponse}
                className="simo-btn-primary min-h-[44px] px-5 rounded-[12px] text-[14px] font-bold cursor-pointer"
              >
                Simpan Status
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

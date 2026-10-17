import React, { useState, useMemo } from 'react';
import {
  Lightbulb,
  Mail,
  Search,
  Filter,
  CheckCircle2,
  Clock,
  ThumbsUp,
  User,
  ArrowLeft,
  ExternalLink,
  MessageSquare,
  AlertCircle,
  Sparkles,
  Send,
  Trash2,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { StudentAspiration } from '../../types';

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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-slate-800">
        <div>
          <button
            onClick={() => setActivePage('dashboard')}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-[#2563EB] mb-2 cursor-pointer transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Kembali ke Dashboard</span>
          </button>
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-2xl bg-amber-50 dark:bg-amber-950 text-amber-600 dark:text-amber-400 flex items-center justify-center border border-amber-200 dark:border-amber-900 shadow-2xs">
              <Lightbulb className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
                Kotak Ide, Saran &amp; Aspirasi Publik
              </h1>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Tinjau masukan dari siswa, orang tua, alumni, dan masyarakat luas serta balas langsung lewat Gmail.
              </p>
            </div>
          </div>
        </div>

        {/* Action Button */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActivePage('portal-publik')}
            className="px-4 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-200 text-xs font-bold rounded-xl transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <ExternalLink className="w-3.5 h-3.5 text-blue-600" />
            <span>Tinjau Form Publik</span>
          </button>
        </div>
      </div>

      {/* Metrics Banner */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-2xs">
          <p className="text-xs font-semibold text-slate-500">Total Masukan</p>
          <p className="text-2xl font-black text-slate-900 dark:text-white mt-1">{aspirations.length}</p>
        </div>
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-2xs">
          <p className="text-xs font-semibold text-blue-600">Diterima (Baru)</p>
          <p className="text-2xl font-black text-blue-600 mt-1">
            {aspirations.filter((a) => a.status === 'diterima').length}
          </p>
        </div>
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-2xs">
          <p className="text-xs font-semibold text-amber-600">Sedang Diproses</p>
          <p className="text-2xl font-black text-amber-600 mt-1">
            {aspirations.filter((a) => a.status === 'diproses').length}
          </p>
        </div>
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-2xs">
          <p className="text-xs font-semibold text-emerald-600">Terealisasi</p>
          <p className="text-2xl font-black text-emerald-600 mt-1">
            {aspirations.filter((a) => a.status === 'terealisasi').length}
          </p>
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-2xs flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cari ide, nama pengirim, email, atau isi masukan..."
            className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs text-slate-800 dark:text-white focus:outline-none focus:border-blue-500"
          />
        </div>

        <div className="flex items-center gap-2">
          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as any)}
            className="px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs text-slate-800 dark:text-white focus:outline-none cursor-pointer"
          >
            <option value="all">Semua Status</option>
            <option value="diterima">Diterima</option>
            <option value="diproses">Diproses</option>
            <option value="terealisasi">Terealisasi</option>
            <option value="ditolak">Ditolak</option>
          </select>

          {/* Category Filter */}
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs text-slate-800 dark:text-white focus:outline-none cursor-pointer"
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
        </div>
      </div>

      {/* Main Table / Cards */}
      <div className="space-y-3">
        {filteredAspirations.length === 0 ? (
          <div className="text-center py-16 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-8">
            <Lightbulb className="w-12 h-12 text-slate-300 mx-auto mb-2" />
            <h3 className="text-sm font-bold text-slate-800 dark:text-white">Tidak Ada Ide yang Sesuai</h3>
            <p className="text-xs text-slate-500 mt-1">Coba ubah kata kunci pencarian atau filter status Anda.</p>
          </div>
        ) : (
          filteredAspirations.map((asp) => (
            <div
              key={asp.id}
              className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200/80 dark:border-slate-800 shadow-2xs hover:border-blue-300 transition-colors flex flex-col md:flex-row md:items-start justify-between gap-4"
            >
              <div className="flex-1 space-y-2">
                <div className="flex flex-wrap items-center gap-2">
                  <span
                    className={`text-[10px] font-extrabold uppercase px-2 py-0.5 rounded ${
                      asp.status === 'terealisasi'
                        ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                        : asp.status === 'diproses'
                        ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                        : asp.status === 'ditolak'
                        ? 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300'
                        : 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300'
                    }`}
                  >
                    {asp.status}
                  </span>

                  <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                    {asp.category}
                  </span>

                  {asp.senderRole && (
                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-purple-50 text-purple-700 border border-purple-200 dark:bg-purple-950/60 dark:text-purple-300">
                      Peran: {asp.senderRole.replace('_', ' ')}
                    </span>
                  )}

                  <span className="text-[11px] text-slate-400 flex items-center gap-1 ml-auto">
                    <Clock className="w-3.5 h-3.5" />
                    {asp.date}
                  </span>
                </div>

                <h3 className="text-base font-bold text-slate-900 dark:text-white leading-snug">
                  {asp.title}
                </h3>

                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                  "{asp.content}"
                </p>

                {/* Sender Details */}
                <div className="pt-2 flex flex-wrap items-center gap-4 text-xs text-slate-500 border-t border-slate-100 dark:border-slate-800">
                  <span className="flex items-center gap-1 font-semibold text-slate-800 dark:text-slate-200">
                    <User className="w-3.5 h-3.5 text-blue-500" />
                    {asp.studentName} ({asp.classRoom || 'Publik'})
                  </span>

                  {asp.email && (
                    <span className="flex items-center gap-1 text-slate-600 dark:text-slate-400 font-mono text-[11px]">
                      <Mail className="w-3.5 h-3.5 text-rose-500" />
                      {asp.email}
                    </span>
                  )}

                  <span className="flex items-center gap-1 text-slate-400 text-[11px]">
                    <ThumbsUp className="w-3 h-3 text-blue-500" />
                    {asp.likes || 0} Dukungan
                  </span>
                </div>

                {/* Tanggapan Pengurus Jika Ada */}
                {asp.response && (
                  <div className="mt-2 p-3 rounded-xl bg-emerald-50/70 border border-emerald-100 dark:bg-emerald-950/30 dark:border-emerald-900 text-xs text-emerald-800 dark:text-emerald-300">
                    <p className="font-bold flex items-center gap-1 mb-0.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                      Tanggapan Resmi Pengurus ({asp.respondedBy || 'OSIS'}):
                    </p>
                    <p className="italic leading-relaxed">{asp.response}</p>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex md:flex-col items-center gap-2 shrink-0 pt-2 md:pt-0">
                {asp.email && (
                  <button
                    onClick={() => handleOpenGmail(asp)}
                    className="w-full px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold flex items-center justify-center gap-1.5 shadow-xs transition-colors cursor-pointer"
                  >
                    <Mail className="w-3.5 h-3.5" />
                    <span>Balas via Gmail</span>
                  </button>
                )}

                <button
                  onClick={() => {
                    setSelectedAsp(asp);
                    setResponseText(asp.response || '');
                    setSelectedStatus(asp.status);
                  }}
                  className="w-full px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-white text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                >
                  <MessageSquare className="w-3.5 h-3.5" />
                  <span>Tanggapi &amp; Status</span>
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* MODAL EDIT STATUS & TANGGAPAN */}
      {selectedAsp && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-lg w-full border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex items-start justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center">
                  <Lightbulb className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">
                    Tanggapi Ide &amp; Masukan
                  </h3>
                  <p className="text-xs text-slate-500">
                    Dari: {selectedAsp.studentName} ({selectedAsp.email || 'Tanpa Email'})
                  </p>
                </div>
              </div>
              <button
                onClick={() => setSelectedAsp(null)}
                className="text-slate-400 hover:text-slate-600 text-sm font-bold p-1 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
              <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 space-y-1">
                <h4 className="text-xs font-bold text-slate-800 dark:text-white">{selectedAsp.title}</h4>
                <p className="text-xs text-slate-600 dark:text-slate-300 italic">"{selectedAsp.content}"</p>
              </div>

              {selectedAsp.email && (
                <div className="p-3.5 rounded-2xl bg-rose-50/60 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900 flex items-center justify-between gap-3">
                  <div>
                    <p className="text-xs font-bold text-rose-800 dark:text-rose-300">
                      Buka Gmail untuk Diskusi Lanjutan
                    </p>
                    <p className="text-[11px] text-slate-600 dark:text-slate-400">
                      Penerima: {selectedAsp.email}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleOpenGmail(selectedAsp)}
                    className="px-3.5 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold flex items-center gap-1.5 shrink-0 shadow-xs transition-colors cursor-pointer"
                  >
                    <Mail className="w-3.5 h-3.5" />
                    <span>Buka Gmail</span>
                  </button>
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                  Ubah Status
                </label>
                <select
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value as any)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-slate-800 dark:text-white focus:outline-none focus:border-blue-500 cursor-pointer"
                >
                  <option value="diterima">Diterima (Menunggu Peninjauan)</option>
                  <option value="diproses">Diproses (Sedang Ditindaklanjuti)</option>
                  <option value="terealisasi">Terealisasi (Selesai Dijalankan)</option>
                  <option value="ditolak">Ditolak / Belum Dapat Dilaksanakan</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                  Tanggapan Resmi (Ditampilkan pada Portal Publik)
                </label>
                <textarea
                  rows={3}
                  value={responseText}
                  onChange={(e) => setResponseText(e.target.value)}
                  placeholder="Tuliskan tanggapan atau ucapan apresiasi pengurus OSIS..."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-slate-800 dark:text-white focus:outline-none focus:border-blue-500 leading-relaxed"
                />
              </div>
            </div>

            <div className="p-4 bg-slate-50 dark:bg-slate-800/60 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end gap-2.5">
              <button
                type="button"
                onClick={() => setSelectedAsp(null)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-200/60 transition-colors cursor-pointer"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleSaveResponse}
                className="px-5 py-2 rounded-xl bg-[#2563EB] hover:bg-blue-700 text-white text-xs font-bold shadow-xs transition-colors cursor-pointer"
              >
                Simpan Perubahan
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

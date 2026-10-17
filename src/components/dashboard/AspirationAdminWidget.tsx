import React, { useState } from 'react';
import {
  Lightbulb,
  Mail,
  ExternalLink,
  MessageSquare,
  CheckCircle2,
  Clock,
  ArrowUpRight,
  Filter,
  User,
  Send,
  AlertCircle,
  Sparkles,
  Tag,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { StudentAspiration } from '../../types';

export const AspirationAdminWidget: React.FC = () => {
  const { aspirations, updateAspirationStatus, orgProfile, showToast, setActivePage } = useApp();

  const [selectedAsp, setSelectedAsp] = useState<StudentAspiration | null>(null);
  const [internalReplyText, setInternalReplyText] = useState('');
  const [newStatus, setNewStatus] = useState<StudentAspiration['status']>('diproses');

  // Metrics
  const totalCount = aspirations.length;
  const pendingCount = aspirations.filter((a) => a.status === 'diterima' || a.status === 'diproses').length;
  const completedCount = aspirations.filter((a) => a.status === 'terealisasi').length;

  // Open Direct Gmail Compose
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

Jika ada hal yang ingin didiskusikan lebih lanjut, Anda dapat langsung membalas email ini.

Salam hangat,
Pengurus OSIS ${orgProfile.schoolName || 'SMK Negeri 1 Cerdas Bangsa'}
Email Resmi: ${orgProfile.email || 'osis@smkn1cerdasbangsa.sch.id'}`;

    const gmailUrl = `https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(
      asp.email
    )}&su=${encodeURIComponent(subject)}&body=${encodeURIComponent(bodyText)}`;

    window.open(gmailUrl, '_blank');
    showToast(`Membuka Gmail untuk membalas ke ${asp.email}`, 'info');
  };

  const handleSaveInternalResponse = () => {
    if (!selectedAsp) return;

    updateAspirationStatus(
      selectedAsp.id,
      newStatus,
      internalReplyText.trim() || undefined
    );

    showToast('Tanggapan internal & status berhasil disimpan!', 'success');
    setSelectedAsp(null);
    setInternalReplyText('');
  };

  return (
    <>
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 p-5 shadow-2xs flex flex-col justify-between">
        <div>
          {/* Header Widget */}
          <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center border border-amber-200 dark:border-amber-900 shadow-2xs">
                <Lightbulb className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                  <span>Kotak Ide &amp; Masukan Publik</span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-50 dark:bg-blue-950 text-[#2563EB] dark:text-blue-400 border border-blue-200 dark:border-blue-900">
                    {totalCount} Total
                  </span>
                </h3>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  Aspirasi orang luar &amp; siswa dengan fitur balasan Gmail
                </p>
              </div>
            </div>

            <button
              onClick={() => setActivePage('aspirasi')}
              className="text-xs font-bold text-[#2563EB] hover:text-blue-700 dark:text-blue-400 flex items-center gap-1 cursor-pointer transition-colors"
            >
              Kelola Semua <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Quick Metrics */}
          <div className="grid grid-cols-3 gap-2.5 mb-4">
            <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
              <p className="text-[10px] font-medium text-slate-500">Semua Masukan</p>
              <p className="text-base font-black text-slate-800 dark:text-white">{totalCount}</p>
            </div>
            <div className="p-2.5 rounded-xl bg-amber-50/70 dark:bg-amber-950/40 border border-amber-100 dark:border-amber-900/60">
              <p className="text-[10px] font-medium text-amber-700 dark:text-amber-300">Perlu Tanggapan</p>
              <p className="text-base font-black text-amber-800 dark:text-amber-200">{pendingCount}</p>
            </div>
            <div className="p-2.5 rounded-xl bg-emerald-50/70 dark:bg-emerald-950/40 border border-emerald-100 dark:border-emerald-900/60">
              <p className="text-[10px] font-medium text-emerald-700 dark:text-emerald-300">Terealisasi</p>
              <p className="text-base font-black text-emerald-800 dark:text-emerald-200">{completedCount}</p>
            </div>
          </div>

          {/* List of Recent 3 Aspirations */}
          <div className="space-y-3">
            {aspirations.slice(0, 3).map((asp) => (
              <div
                key={asp.id}
                className="p-3 rounded-xl bg-slate-50/50 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-800 space-y-2 hover:border-blue-200 transition-colors"
              >
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1.5 truncate">
                    <span className="text-[10px] font-bold text-slate-800 dark:text-slate-200 truncate">
                      {asp.studentName}
                    </span>
                    {asp.senderRole && (
                      <span className="text-[9px] font-semibold uppercase px-1.5 py-0.5 rounded bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300">
                        {asp.senderRole.replace('_', ' ')}
                      </span>
                    )}
                  </div>

                  <span
                    className={`text-[9px] font-extrabold uppercase px-1.5 py-0.5 rounded shrink-0 ${
                      asp.status === 'terealisasi'
                        ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                        : asp.status === 'diproses'
                        ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                        : 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300'
                    }`}
                  >
                    {asp.status}
                  </span>
                </div>

                <p className="text-xs font-bold text-slate-900 dark:text-white line-clamp-1">
                  {asp.title}
                </p>

                <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed">
                  "{asp.content}"
                </p>

                {/* Email & Action Buttons */}
                <div className="pt-2 border-t border-slate-100 dark:border-slate-800/60 flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1 text-[11px] text-slate-500 truncate">
                    <Mail className="w-3 h-3 text-rose-500 shrink-0" />
                    <span className="truncate">{asp.email || 'Tanpa Email'}</span>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0">
                    {/* Tombol Balas Gmail */}
                    {asp.email && (
                      <button
                        onClick={() => handleOpenGmail(asp)}
                        title="Balas pesan langsung lewat Gmail"
                        className="px-2.5 py-1 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 dark:bg-rose-950/60 dark:text-rose-300 dark:border-rose-900 text-[10px] font-bold flex items-center gap-1 transition-colors cursor-pointer"
                      >
                        <Mail className="w-3 h-3" />
                        <span>Balas Gmail</span>
                      </button>
                    )}

                    {/* Tombol Detail/Tanggapi */}
                    <button
                      onClick={() => {
                        setSelectedAsp(asp);
                        setInternalReplyText(asp.response || '');
                        setNewStatus(asp.status);
                      }}
                      className="px-2 py-1 rounded-lg bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 text-slate-700 dark:text-slate-200 text-[10px] font-semibold hover:bg-slate-100 transition-colors cursor-pointer"
                    >
                      Tanggapi
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Footer Widget */}
        <div className="pt-3 mt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-slate-400">
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            Kotak aspirasi tersinkronisasi live
          </span>
          <button
            onClick={() => setActivePage('aspirasi')}
            className="text-[#2563EB] dark:text-blue-400 font-semibold hover:underline cursor-pointer"
          >
            Buka Halaman Lengkap &rarr;
          </button>
        </div>
      </div>

      {/* MODAL TANGGAPAN & STATUS INTERNAL */}
      {selectedAsp && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-lg w-full border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            {/* Modal Header */}
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
                    Dari: {selectedAsp.studentName} ({selectedAsp.classRoom || 'Publik'})
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

            {/* Modal Body */}
            <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
              <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 space-y-1.5">
                <div className="flex items-center justify-between text-[11px] text-slate-500">
                  <span className="font-bold text-blue-600 uppercase">{selectedAsp.category}</span>
                  <span>{selectedAsp.date}</span>
                </div>
                <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                  {selectedAsp.title}
                </h4>
                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed italic">
                  "{selectedAsp.content}"
                </p>
                {selectedAsp.email && (
                  <div className="pt-2 flex items-center gap-1.5 text-xs text-slate-500">
                    <Mail className="w-3.5 h-3.5 text-rose-500" />
                    <span>Email Pengirim: <strong>{selectedAsp.email}</strong></span>
                  </div>
                )}
              </div>

              {/* Action Balas Gmail Langsung */}
              {selectedAsp.email ? (
                <div className="p-3.5 rounded-2xl bg-rose-50/60 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900 flex items-center justify-between gap-3">
                  <div>
                    <p className="text-xs font-bold text-rose-800 dark:text-rose-300">
                      Balas Langsung Lewat Gmail
                    </p>
                    <p className="text-[11px] text-slate-600 dark:text-slate-400">
                      Buka Gmail dengan kutipan ide dan email penerima otomatis terisi.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleOpenGmail(selectedAsp)}
                    className="px-3.5 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold flex items-center gap-1.5 shrink-0 shadow-xs transition-colors cursor-pointer"
                  >
                    <Mail className="w-4 h-4" />
                    <span>Buka Gmail</span>
                  </button>
                </div>
              ) : (
                <p className="text-xs text-slate-400 italic">
                  * Pengirim tidak mencantumkan email, tanggapan dapat ditampilkan di portal publik.
                </p>
              )}

              {/* Status Update */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                  Perbarui Status Aspirasi
                </label>
                <select
                  value={newStatus}
                  onChange={(e) => setNewStatus(e.target.value as any)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-slate-800 dark:text-white focus:outline-none focus:border-blue-500 cursor-pointer"
                >
                  <option value="diterima">Diterima (Menunggu Peninjauan)</option>
                  <option value="diproses">Diproses (Sedang Dibahas/Tindak Lanjut)</option>
                  <option value="terealisasi">Terealisasi (Tuntas Dilaksanakan)</option>
                  <option value="ditolak">Ditolak / Belum Dapat Direalisasikan</option>
                </select>
              </div>

              {/* Catatan / Tanggapan Publik */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                  Tanggapan Resmi (Akan tampil pada daftar ide di portal publik)
                </label>
                <textarea
                  rows={3}
                  value={internalReplyText}
                  onChange={(e) => setInternalReplyText(e.target.value)}
                  placeholder="Tuliskan tanggapan resmi pengurus OSIS atas ide ini..."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-slate-800 dark:text-white focus:outline-none focus:border-blue-500 leading-relaxed"
                />
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-4 bg-slate-50 dark:bg-slate-800/60 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end gap-2.5">
              <button
                type="button"
                onClick={() => setSelectedAsp(null)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-200/60 transition-colors cursor-pointer"
              >
                Tutup
              </button>
              <button
                type="button"
                onClick={handleSaveInternalResponse}
                className="px-5 py-2 rounded-xl bg-[#2563EB] hover:bg-blue-700 text-white text-xs font-bold shadow-xs transition-colors cursor-pointer"
              >
                Simpan Tanggapan
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

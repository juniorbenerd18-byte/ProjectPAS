import React, { useState } from 'react';
import {
  Lightbulb,
  Mail,
  ArrowUpRight,
  CheckCircle2,
  Clock,
  X,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { StudentAspiration } from '../../types';
import { Modal } from '../common/Modal';

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
      <div className="simo-card p-6 space-y-5">
        {/* Header Widget */}
        <div className="flex items-center justify-between pb-3 border-b border-[#E6DFD0] dark:border-[#283D56]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-[10px] bg-[#E4EAF2] dark:bg-[#1F3A5F]/40 flex items-center justify-center">
              <Lightbulb className="w-4 h-4 text-[#F2B544]" />
            </div>
            <div>
              <h3 className="text-[17px] font-extrabold text-[#1F3A5F] dark:text-[#FAF6EE] flex items-center gap-2">
                <span>Kotak Ide &amp; Aspirasi Siswa/Publik</span>
                <span className="text-[12px] font-bold px-2 py-0.5 rounded-[6px] bg-[#FAF6EE] dark:bg-[#17293E] text-[#1F3A5F] dark:text-[#FAF6EE] border border-[#E6DFD0] dark:border-[#283D56]">
                  {totalCount} Data
                </span>
              </h3>
              <p className="text-[14px] text-[#5A6472] dark:text-[#9AA8B8]">
                Masukan publik dan siswa yang masuk melalui formulir portal
              </p>
            </div>
          </div>

          <button
            onClick={() => setActivePage('aspirasi')}
            className="text-[14px] font-bold text-[#1F3A5F] dark:text-[#F2B544] hover:underline flex items-center gap-1 cursor-pointer transition-colors"
          >
            <span>Buka Tabel Lengkap</span>
            <ArrowUpRight className="w-4 h-4" />
          </button>
        </div>

        {/* Ringkasan Angka Mini -> Single continuous card */}
        <div className="rounded-[16px] border border-[#E6DFD0] dark:border-[#283D56] grid grid-cols-3 divide-x divide-[#E6DFD0] dark:divide-[#283D56] overflow-hidden">
          <div className="p-4 bg-[#FAF6EE] dark:bg-[#17293E]">
            <p className="text-[13px] text-[#5A6472] dark:text-[#9AA8B8] font-bold">Semua Masukan</p>
            <p className="text-2xl font-black text-[#1F3A5F] dark:text-[#FAF6EE] mt-0.5">{totalCount}</p>
          </div>
          <div className="p-4 bg-[#FBEBC8] dark:bg-[#F2B544]/20">
            <p className="text-[13px] text-[#1F3A5F] dark:text-[#F2B544] font-bold">Perlu Tanggapan</p>
            <p className="text-2xl font-black text-[#1F3A5F] dark:text-[#FAF6EE] mt-0.5">{pendingCount}</p>
          </div>
          <div className="p-4 bg-[#E4EAF2] dark:bg-[#1F3A5F]/30">
            <p className="text-[13px] text-[#1F3A5F] dark:text-[#FAF6EE] font-bold">Terealisasi</p>
            <p className="text-2xl font-black text-[#1F3A5F] dark:text-[#FAF6EE] mt-0.5">{completedCount}</p>
          </div>
        </div>

        {/* Tabel Ringkas Masukan Terbaru */}
        <div className="rounded-[16px] border border-[#E6DFD0] dark:border-[#283D56] overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-[14px]">
              <thead>
                <tr className="bg-[#FAF6EE] dark:bg-[#17293E] border-b border-[#E6DFD0] dark:border-[#283D56] text-[#1F3A5F] dark:text-[#FAF6EE] font-bold text-[13px]">
                  <th className="py-3 px-4 w-28">Tanggal</th>
                  <th className="py-3 px-4 w-40">Pengirim</th>
                  <th className="py-3 px-4 w-24">Kategori</th>
                  <th className="py-3 px-4 min-w-[200px]">Topik &amp; Pesan</th>
                  <th className="py-3 px-4 w-24 text-center">Status</th>
                  <th className="py-3 px-4 w-28 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E6DFD0] dark:divide-[#283D56]">
                {aspirations.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-[#5A6472] dark:text-[#9AA8B8]">
                      Belum ada masukan yang masuk.
                    </td>
                  </tr>
                ) : (
                  aspirations.slice(0, 3).map((asp) => (
                    <tr
                      key={asp.id}
                      className="hover:bg-[#FAF6EE]/50 dark:hover:bg-[#17293E]/50 transition-colors"
                    >
                      <td className="py-3 px-4 whitespace-nowrap text-[#5A6472] dark:text-[#9AA8B8] font-medium text-[13px]">
                        {asp.date}
                      </td>
                      <td className="py-3 px-4">
                        <div className="font-bold text-[#1F3A5F] dark:text-[#FAF6EE]">
                          {asp.studentName}
                        </div>
                        <div className="text-[12px] text-[#5A6472] dark:text-[#9AA8B8]">
                          {asp.classRoom || 'Publik'}
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <span className="px-2 py-0.5 rounded-[6px] text-[12px] font-bold uppercase bg-[#FAF6EE] dark:bg-[#17293E] text-[#1F3A5F] dark:text-[#FAF6EE] border border-[#E6DFD0] dark:border-[#283D56]">
                          {asp.category}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <div className="font-bold text-[#1F3A5F] dark:text-[#FAF6EE] line-clamp-1">
                          {asp.title}
                        </div>
                        <div className="text-[13px] text-[#5A6472] dark:text-[#9AA8B8] line-clamp-1 italic">
                          "{asp.content}"
                        </div>
                      </td>
                      <td className="py-3 px-4 text-center whitespace-nowrap">
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-[6px] text-[12px] font-bold uppercase border ${
                            asp.status === 'terealisasi'
                              ? 'simo-badge-blue'
                              : asp.status === 'diproses'
                              ? 'simo-badge-amber'
                              : 'simo-badge-neutral'
                          }`}
                        >
                          {asp.status}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right whitespace-nowrap">
                        <div className="inline-flex items-center gap-1.5 justify-end">
                          {asp.email && (
                            <button
                              onClick={() => handleOpenGmail(asp)}
                              title="Balas via Gmail"
                              className="simo-btn-outline min-h-[34px] px-2.5 py-1 rounded-[8px] text-[12px] font-bold flex items-center gap-1 cursor-pointer"
                            >
                              <Mail className="w-3 h-3" />
                              Gmail
                            </button>
                          )}
                          <button
                            onClick={() => {
                              setSelectedAsp(asp);
                              setInternalReplyText(asp.response || '');
                              setNewStatus(asp.status);
                            }}
                            className="simo-btn-primary min-h-[34px] px-3 py-1 rounded-[8px] text-[12px] font-bold cursor-pointer"
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
        </div>

        {/* Footer Widget */}
        <div className="pt-2 flex items-center justify-between text-[14px] text-[#5A6472] dark:text-[#9AA8B8]">
          <span>Menampilkan 3 masukan terbaru</span>
          <button
            onClick={() => setActivePage('aspirasi')}
            className="text-[#1F3A5F] dark:text-[#F2B544] font-bold hover:underline cursor-pointer"
          >
            Buka Halaman Lengkap &rarr;
          </button>
        </div>
      </div>

      {/* MODAL TANGGAPAN & STATUS INTERNAL */}
      <Modal
        isOpen={Boolean(selectedAsp)}
        onClose={() => setSelectedAsp(null)}
        title="Tindak Lanjut Ide / Masukan"
      >
        {selectedAsp && (
          <div className="space-y-4 text-[14px]">
            <div className="p-4 bg-[#FAF6EE] dark:bg-[#0E1B2C] rounded-[14px] border border-[#E6DFD0] dark:border-[#283D56] space-y-1">
              <p className="font-bold text-[#1F3A5F] dark:text-[#FAF6EE]">{selectedAsp.title}</p>
              <p className="text-[#5A6472] dark:text-[#9AA8B8] italic">"{selectedAsp.content}"</p>
              <p className="text-[13px] text-[#5A6472] dark:text-[#9AA8B8] pt-1">
                Dari: <b>{selectedAsp.studentName}</b> ({selectedAsp.email || 'Tanpa Email'})
              </p>
            </div>

            {selectedAsp.email && (
              <div className="p-4 bg-[#FBEBC8] dark:bg-[#F2B544]/20 rounded-[14px] border border-[#E6DFD0] dark:border-[#283D56] flex items-center justify-between gap-3">
                <div>
                  <p className="font-bold text-[#1F3A5F] dark:text-[#FAF6EE]">
                    Diskusi via Gmail
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

            <div>
              <label className="block font-bold text-[#1F3A5F] dark:text-[#FAF6EE] mb-1.5">
                Status Penanganan
              </label>
              <select
                value={newStatus}
                onChange={(e) => setNewStatus(e.target.value as any)}
                className="simo-input min-h-[44px] text-[14px] w-full"
              >
                <option value="diterima">Diterima</option>
                <option value="diproses">Sedang Diproses</option>
                <option value="terealisasi">Terealisasi</option>
                <option value="ditolak">Ditolak</option>
              </select>
            </div>

            <div>
              <label className="block font-bold text-[#1F3A5F] dark:text-[#FAF6EE] mb-1.5">
                Tanggapan Resmi (Tampil di Portal Publik)
              </label>
              <textarea
                rows={3}
                value={internalReplyText}
                onChange={(e) => setInternalReplyText(e.target.value)}
                placeholder="Tuliskan tanggapan atau evaluasi pengurus OSIS..."
                className="simo-input text-[14px] w-full p-3 leading-relaxed"
              />
            </div>

            <div className="pt-3 flex items-center justify-end gap-3 border-t border-[#E6DFD0] dark:border-[#283D56]">
              <button
                type="button"
                onClick={() => setSelectedAsp(null)}
                className="simo-btn-outline min-h-[44px] px-5 rounded-[12px] text-[14px] font-bold cursor-pointer"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleSaveInternalResponse}
                className="simo-btn-primary min-h-[44px] px-5 rounded-[12px] text-[14px] font-bold cursor-pointer"
              >
                Simpan
              </button>
            </div>
          </div>
        )}
      </Modal>
    </>
  );
};

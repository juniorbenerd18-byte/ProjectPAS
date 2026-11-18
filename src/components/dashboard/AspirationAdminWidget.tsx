import React, { useState } from 'react';
import {
  Lightbulb,
  Mail,
  ArrowUpRight,
  Trash2,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { StudentAspiration } from '../../types';
import { Modal } from '../common/Modal';

export const AspirationAdminWidget: React.FC = () => {
  const { aspirations, updateAspirationStatus, deleteAspiration, orgProfile, showToast, setActivePage } = useApp();

  const [confirmDeleteAsp, setConfirmDeleteAsp] = useState<StudentAspiration | null>(null);

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
                <span>Kotak Masuk Aspirasi Siswa/Publik</span>
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
            <table className="w-full min-w-[700px] text-left border-collapse text-[14px]">
              <thead>
                <tr className="bg-[#FAF6EE] dark:bg-[#17293E] border-b border-[#E6DFD0] dark:border-[#283D56] text-[#1F3A5F] dark:text-[#FAF6EE] font-bold text-[13px]">
                  <th className="py-3 px-4 w-28 whitespace-nowrap">Tanggal</th>
                  <th className="py-3 px-4 min-w-[150px] whitespace-nowrap">Pengirim</th>
                  <th className="py-3 px-4 w-24 text-center whitespace-nowrap">Kategori</th>
                  <th className="py-3 px-4 min-w-[200px]">Topik &amp; Pesan</th>
                  <th className="py-3 px-4 w-28 text-center whitespace-nowrap">Status</th>
                  <th className="py-3 px-4 w-36 text-right whitespace-nowrap">Aksi</th>
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
                      <td className="py-3 px-4 whitespace-nowrap">
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
                        <select
                          value={asp.status}
                          onChange={(e) => updateAspirationStatus(asp.id, e.target.value as StudentAspiration['status'])}
                          className={`cursor-pointer text-[11px] font-bold uppercase rounded-[6px] px-2 py-1 border transition-all focus:outline-none ${
                            asp.status === 'terealisasi'
                              ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border-emerald-300 dark:border-emerald-800'
                              : asp.status === 'diproses'
                              ? 'bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400 border-amber-300 dark:border-amber-800'
                              : asp.status === 'ditolak'
                              ? 'bg-red-50 dark:bg-red-950/40 text-red-700 dark:text-red-400 border-red-300 dark:border-red-800'
                              : 'bg-[#FAF6EE] dark:bg-[#17293E] text-[#1F3A5F] dark:text-[#FAF6EE] border-[#E6DFD0] dark:border-[#283D56]'
                          }`}
                          title="Klik untuk mengubah status"
                        >
                          <option value="diterima">Diterima</option>
                          <option value="diproses">Diproses</option>
                          <option value="terealisasi">Terealisasi</option>
                          <option value="ditolak">Ditolak</option>
                        </select>
                      </td>
                      <td className="py-3 px-4 text-right whitespace-nowrap">
                        <div className="inline-flex items-center gap-1.5 justify-end">
                          {asp.email ? (
                            <button
                              onClick={() => handleOpenGmail(asp)}
                              title="Balas via Gmail"
                              className="simo-btn-primary min-h-[34px] px-3 py-1 rounded-[8px] text-[12px] font-bold flex items-center gap-1 cursor-pointer"
                            >
                              <Mail className="w-3.5 h-3.5" />
                              <span>Balas Email</span>
                            </button>
                          ) : (
                            <span className="text-[11px] text-[#5A6472] dark:text-[#9AA8B8] italic px-1">
                              Tanpa Email
                            </span>
                          )}
                          <button
                            type="button"
                            onClick={() => setConfirmDeleteAsp(asp)}
                            title="Hapus pesan ini"
                            className="min-h-[34px] w-[34px] rounded-[8px] bg-red-50 hover:bg-red-100 dark:bg-red-950/40 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-900/60 transition-colors cursor-pointer flex items-center justify-center"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
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

      {/* MODAL KONFIRMASI HAPUS PESAN WIDGET */}
      {confirmDeleteAsp && (
        <Modal
          isOpen={true}
          onClose={() => setConfirmDeleteAsp(null)}
          title="Hapus Pesan Ide & Aspirasi?"
          subtitle={`Pengirim: ${confirmDeleteAsp.studentName} (${confirmDeleteAsp.classRoom || 'Publik'})`}
        >
          <div className="space-y-4">
            <div className="p-4 bg-[#FAF6EE] dark:bg-[#0E1B2C] rounded-[14px] border border-[#E6DFD0] dark:border-[#283D56] space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="font-extrabold text-[#1F3A5F] dark:text-[#FAF6EE]">
                  {confirmDeleteAsp.title}
                </span>
                <span className="text-xs text-[#5A6472] dark:text-[#9AA8B8]">{confirmDeleteAsp.date}</span>
              </div>
              <p className="text-[#5A6472] dark:text-[#9AA8B8] italic text-[14px] leading-relaxed">
                "{confirmDeleteAsp.content}"
              </p>
            </div>

            <p className="text-[14px] text-[#5A6472] dark:text-[#9AA8B8] leading-relaxed">
              Apakah Anda yakin ingin menghapus pesan ide &amp; aspirasi ini? Tindakan ini tidak dapat dibatalkan.
            </p>

            <div className="flex justify-end gap-3 pt-3 border-t border-[#E6DFD0] dark:border-[#283D56]">
              <button
                type="button"
                onClick={() => setConfirmDeleteAsp(null)}
                className="simo-btn-outline min-h-[42px] px-5 rounded-[12px] text-[14px] font-bold cursor-pointer"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={() => {
                  deleteAspiration(confirmDeleteAsp.id);
                  setConfirmDeleteAsp(null);
                }}
                className="min-h-[42px] px-5 rounded-[12px] bg-red-600 hover:bg-red-700 text-white text-[14px] font-bold cursor-pointer transition-colors shadow-sm flex items-center gap-1.5"
              >
                <Trash2 className="w-4 h-4" />
                <span>Ya, Hapus Pesan</span>
              </button>
            </div>
          </div>
        </Modal>
      )}
    </>
  );
};

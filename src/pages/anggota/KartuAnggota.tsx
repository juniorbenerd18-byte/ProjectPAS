import React, { useState, useEffect, useRef } from 'react';
import { Printer, Download, User } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { generateQRCode } from '../../lib/utils';
import html2canvas from 'html2canvas';

export const KartuAnggota: React.FC = () => {
  const { members, orgProfile } = useApp();
  const [selectedMemberId, setSelectedMemberId] = useState<string>(members[0]?.id || '');
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState<string>('');
  const cardRef = useRef<HTMLDivElement>(null);

  const selectedMember = members.find((m) => m.id === selectedMemberId) || members[0];

  useEffect(() => {
    if (selectedMember) {
      const qrPayload = JSON.stringify({
        org: orgProfile.name,
        nisn: selectedMember.nisn,
        name: selectedMember.fullName,
        position: selectedMember.position,
        year: orgProfile.academicYear,
      });
      generateQRCode(qrPayload).then((url) => setQrCodeDataUrl(url));
    }
  }, [selectedMember, orgProfile]);

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadImage = async () => {
    if (cardRef.current) {
      try {
        const canvas = await html2canvas(cardRef.current, { scale: 3, useCORS: true });
        const link = document.createElement('a');
        link.download = `KTA-${selectedMember.fullName.replace(/\s+/g, '_')}.png`;
        link.href = canvas.toDataURL('image/png');
        link.click();
      } catch (err) {
        console.error('Error downloading card image:', err);
      }
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="no-print simo-card p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-extrabold text-[#1F3A5F] dark:text-[#FAF6EE]">Kartu Tanda Anggota (KTA Digital)</h2>
          <p className="text-[14px] text-[#5A6472] dark:text-[#9AA8B8] mt-1">
            Generate kartu anggota resmi dengan QR Code verifikasi unik untuk seluruh siswa
          </p>
        </div>
        <div className="flex items-center gap-3 self-start sm:self-auto shrink-0">
          <button
            onClick={handleDownloadImage}
            className="simo-btn-primary min-h-[44px] px-4 rounded-[12px] text-[14px] font-bold flex items-center gap-2 cursor-pointer"
          >
            <Download className="w-4 h-4" />
            <span>Download PNG</span>
          </button>
          <button
            onClick={handlePrint}
            className="simo-btn-outline min-h-[44px] px-4 rounded-[12px] text-[14px] font-bold flex items-center gap-2 cursor-pointer"
          >
            <Printer className="w-4 h-4" />
            <span>Cetak Kartu</span>
          </button>
        </div>
      </div>

      {/* Member Selector Bar */}
      <div className="no-print simo-card p-4 sm:p-5 flex items-center gap-3">
        <User className="w-4 h-4 text-[#1F3A5F] dark:text-[#FAF6EE] shrink-0" />
        <span className="text-[14px] font-bold text-[#1F3A5F] dark:text-[#FAF6EE] shrink-0">Pilih Siswa:</span>
        <select
          value={selectedMemberId}
          onChange={(e) => setSelectedMemberId(e.target.value)}
          className="simo-input min-h-[40px] px-3 text-[14px] font-semibold flex-1 max-w-md"
        >
          {members.map((m) => (
            <option key={m.id} value={m.id}>
              {m.fullName} — {m.classRoom} ({m.position})
            </option>
          ))}
        </select>
      </div>

      {/* Card Preview Container */}
      <div className="flex flex-col lg:flex-row items-center justify-center gap-8 py-6">
        {/* KTA FRONT & BACK DISPLAY */}
        <div
          ref={cardRef}
          className="flex flex-col sm:flex-row gap-6 p-5 bg-[#FAF6EE] dark:bg-[#0E1B2C] rounded-[24px] border border-[#E6DFD0] dark:border-[#283D56]"
        >
          {/* FRONT SIDE */}
          <div className="w-[340px] h-[490px] rounded-[20px] overflow-hidden bg-[#FFFDF8] dark:bg-[#17293E] border border-[#E6DFD0] dark:border-[#283D56] flex flex-col justify-between relative text-[#1F3A5F] dark:text-[#FAF6EE]">
            {/* Top Navy Banner */}
            <div className="bg-[#1F3A5F] text-[#FAF6EE] p-4 pb-12 relative border-b border-[#152741]">
              <div className="flex items-center gap-3">
                <img
                  src={orgProfile.logoUrl}
                  alt="Logo"
                  className="w-10 h-10 rounded-[10px] object-cover border border-[#FAF6EE]/40 p-0.5 bg-[#FAF6EE]"
                />
                <div>
                  <h3 className="text-[12px] font-black tracking-tight text-[#FAF6EE] uppercase leading-tight">
                    {orgProfile.name}
                  </h3>
                  <p className="text-[10px] text-[#E4EAF2] font-semibold">{orgProfile.schoolName}</p>
                </div>
              </div>
              <div className="absolute right-3 bottom-2 text-right">
                <span className="text-[10px] font-extrabold text-[#F2B544] uppercase tracking-wider">
                  KTA DIGITAL
                </span>
              </div>
            </div>

            {/* Photo Avatar overlapping */}
            <div className="relative -mt-10 px-6 flex items-end justify-between">
              <div className="w-24 h-24 rounded-[16px] overflow-hidden border-4 border-[#FFFDF8] dark:border-[#17293E] bg-[#FFFDF8] dark:bg-[#17293E]">
                <img
                  src={selectedMember.avatarUrl}
                  alt={selectedMember.fullName}
                  className="w-full h-full object-cover"
                />
              </div>
              {/* QR Code */}
              <div className="w-20 h-20 p-1 bg-white rounded-[12px] border border-[#E6DFD0] flex items-center justify-center">
                {qrCodeDataUrl ? (
                  <img src={qrCodeDataUrl} alt="QR" className="w-full h-full object-contain" />
                ) : (
                  <div className="text-[10px] text-[#5A6472]">Loading QR...</div>
                )}
              </div>
            </div>

            {/* Member Details */}
            <div className="px-6 py-2 flex-1 flex flex-col justify-center space-y-3">
              <div>
                <span className="inline-block px-3 py-0.5 rounded-[6px] text-[11px] font-bold uppercase tracking-wider bg-[#E4EAF2] dark:bg-[#1F3A5F]/40 text-[#1F3A5F] dark:text-[#FAF6EE] border border-[#E6DFD0] dark:border-[#283D56]">
                  {selectedMember.position}
                </span>
                <h4 className="text-[17px] font-extrabold text-[#1F3A5F] dark:text-[#FAF6EE] mt-1 leading-snug">
                  {selectedMember.fullName}
                </h4>
                <p className="text-[13px] font-semibold text-[#5A6472] dark:text-[#9AA8B8]">
                  {selectedMember.classRoom} • {selectedMember.major}
                </p>
              </div>

              <div className="space-y-1.5 text-[12px] bg-[#FAF6EE] dark:bg-[#0E1B2C] p-3 rounded-[12px] border border-[#E6DFD0] dark:border-[#283D56]">
                <div className="flex justify-between">
                  <span className="text-[#5A6472] dark:text-[#9AA8B8] font-medium">NISN:</span>
                  <span className="font-bold text-[#1F3A5F] dark:text-[#FAF6EE] font-mono">{selectedMember.nisn}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#5A6472] dark:text-[#9AA8B8] font-medium">Divisi:</span>
                  <span className="font-semibold text-[#1F3A5F] dark:text-[#FAF6EE] truncate max-w-[170px]">
                    {selectedMember.divisionName || 'BPH'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#5A6472] dark:text-[#9AA8B8] font-medium">Status:</span>
                  <span className="font-extrabold text-[#1F3A5F] dark:text-[#FAF6EE] uppercase text-[11px]">
                    {selectedMember.status}
                  </span>
                </div>
              </div>
            </div>

            {/* Bottom Footer */}
            <div className="px-6 py-3 border-t border-[#E6DFD0] dark:border-[#283D56] bg-[#FAF6EE]/50 dark:bg-[#0E1B2C]/50 flex items-center justify-between text-[11px] text-[#5A6472] dark:text-[#9AA8B8] font-medium">
              <span>Masa Berlaku: {orgProfile.academicYear}</span>
              <span className="font-bold text-[#1F3A5F] dark:text-[#FAF6EE]">Terverifikasi</span>
            </div>
          </div>

          {/* BACK SIDE */}
          <div className="w-[340px] h-[490px] rounded-[20px] overflow-hidden bg-[#FFFDF8] dark:bg-[#17293E] border border-[#E6DFD0] dark:border-[#283D56] flex flex-col justify-between p-6 text-[#1F3A5F] dark:text-[#FAF6EE]">
            <div>
              <div className="text-center pb-3 border-b border-[#E6DFD0] dark:border-[#283D56]">
                <h4 className="text-[13px] font-extrabold uppercase text-[#1F3A5F] dark:text-[#FAF6EE]">
                  Ketentuan Pemegang Kartu
                </h4>
                <p className="text-[11px] text-[#5A6472] dark:text-[#9AA8B8]">{orgProfile.name}</p>
              </div>

              <ul className="mt-4 space-y-2 text-[12px] text-[#5A6472] dark:text-[#9AA8B8] list-disc list-inside leading-relaxed">
                <li>Kartu ini adalah identitas resmi pengurus OSIS SMK.</li>
                <li>Gunakan QR Code pada kartu untuk presensi kegiatan dan rapat.</li>
                <li>Wajib menjaga nama baik sekolah dan organisasi.</li>
                <li>Jika menemukan kartu ini, harap dikembalikan ke ruang sekretariat OSIS.</li>
              </ul>
            </div>

            {/* Signature Area */}
            <div className="space-y-4 pt-4 border-t border-[#E6DFD0] dark:border-[#283D56] text-center">
              <div className="grid grid-cols-2 gap-2 text-[11px]">
                <div>
                  <p className="text-[#5A6472] dark:text-[#9AA8B8]">Pembina OSIS,</p>
                  <div className="h-10 flex items-center justify-center font-serif italic text-[#1F3A5F] dark:text-[#FAF6EE] text-[13px] font-bold">
                    ( Tanda Tangan )
                  </div>
                  <p className="font-bold text-[#1F3A5F] dark:text-[#FAF6EE]">{orgProfile.pembinaName}</p>
                </div>
                <div>
                  <p className="text-[#5A6472] dark:text-[#9AA8B8]">Ketua Umum,</p>
                  <div className="h-10 flex items-center justify-center font-serif italic text-[#1F3A5F] dark:text-[#FAF6EE] text-[13px] font-bold">
                    {orgProfile.ketuaName.split(' ')[0]}
                  </div>
                  <p className="font-bold text-[#1F3A5F] dark:text-[#FAF6EE]">{orgProfile.ketuaName}</p>
                </div>
              </div>
              <p className="text-[10px] text-[#5A6472] dark:text-[#9AA8B8] font-mono">
                ID KTA: KTA-SMK-{selectedMember.nisn}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

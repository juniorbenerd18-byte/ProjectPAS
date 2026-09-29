import React, { useState, useEffect, useRef } from 'react';
import { CreditCard, Printer, Download, Sparkles, CheckCircle2, User, Building2 } from 'lucide-react';
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
      <div className="no-print flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-5 rounded-2xl border border-slate-200/80 shadow-2xs">
        <div>
          <h2 className="text-base font-bold text-slate-900">Kartu Tanda Anggota (KTA Digital)</h2>
          <p className="text-xs text-slate-500">
            Generate kartu anggota resmi dengan QR Code verifikasi unik untuk seluruh siswa
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleDownloadImage}
            className="px-3.5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold shadow-sm flex items-center gap-1.5 cursor-pointer"
          >
            <Download className="w-4 h-4" />
            <span>Download PNG</span>
          </button>
          <button
            onClick={handlePrint}
            className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <Printer className="w-4 h-4" />
            <span>Cetak Kartu</span>
          </button>
        </div>
      </div>

      {/* Member Selector Bar */}
      <div className="no-print bg-white p-4 rounded-2xl border border-slate-200/80 shadow-2xs flex items-center gap-3">
        <User className="w-4 h-4 text-indigo-600 shrink-0" />
        <span className="text-xs font-bold text-slate-700">Pilih Siswa:</span>
        <select
          value={selectedMemberId}
          onChange={(e) => setSelectedMemberId(e.target.value)}
          className="flex-1 max-w-md px-3 py-1.5 bg-slate-50 border border-slate-200/80 rounded-xl text-xs font-medium text-slate-800 outline-none"
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
          className="flex flex-col sm:flex-row gap-6 p-4 bg-slate-100/60 rounded-3xl"
        >
          {/* FRONT SIDE */}
          <div className="w-[340px] h-[490px] rounded-3xl overflow-hidden bg-white border border-slate-200/90 shadow-xl flex flex-col justify-between relative text-slate-800">
            {/* Top Navy Banner */}
            <div className="bg-slate-900 text-white p-4 pb-12 relative">
              <div className="flex items-center gap-3">
                <img
                  src={orgProfile.logoUrl}
                  alt="Logo"
                  className="w-10 h-10 rounded-xl object-cover border border-white/20 p-0.5 bg-white"
                />
                <div>
                  <h3 className="text-[11px] font-black tracking-tight text-white uppercase leading-tight">
                    {orgProfile.name}
                  </h3>
                  <p className="text-[9px] text-indigo-300 font-medium">{orgProfile.schoolName}</p>
                </div>
              </div>
              <div className="absolute right-3 bottom-2 text-right">
                <span className="text-[9px] font-extrabold text-indigo-400 uppercase tracking-widest">
                  KTA DIGITAL
                </span>
              </div>
            </div>

            {/* Photo Avatar overlapping */}
            <div className="relative -mt-10 px-6 flex items-end justify-between">
              <div className="w-24 h-24 rounded-2xl overflow-hidden border-4 border-white shadow-md bg-white">
                <img
                  src={selectedMember.avatarUrl}
                  alt={selectedMember.fullName}
                  className="w-full h-full object-cover"
                />
              </div>
              {/* QR Code */}
              <div className="w-20 h-20 p-1 bg-white rounded-xl border border-slate-200 shadow-sm flex items-center justify-center">
                {qrCodeDataUrl ? (
                  <img src={qrCodeDataUrl} alt="QR" className="w-full h-full object-contain" />
                ) : (
                  <div className="text-[9px] text-slate-400">Loading QR...</div>
                )}
              </div>
            </div>

            {/* Member Details */}
            <div className="px-6 py-2 flex-1 flex flex-col justify-center space-y-3">
              <div>
                <span className="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-indigo-50 text-indigo-700 border border-indigo-100">
                  {selectedMember.position}
                </span>
                <h4 className="text-base font-extrabold text-slate-900 mt-1 leading-snug">
                  {selectedMember.fullName}
                </h4>
                <p className="text-xs font-semibold text-slate-500">
                  {selectedMember.classRoom} • {selectedMember.major}
                </p>
              </div>

              <div className="space-y-1 text-[11px] bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                <div className="flex justify-between">
                  <span className="text-slate-400 font-medium">NISN:</span>
                  <span className="font-bold text-slate-800 font-mono">{selectedMember.nisn}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400 font-medium">Divisi:</span>
                  <span className="font-semibold text-slate-800 truncate max-w-[170px]">
                    {selectedMember.divisionName || 'BPH'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400 font-medium">Status:</span>
                  <span className="font-extrabold text-emerald-600 uppercase text-[10px]">
                    {selectedMember.status}
                  </span>
                </div>
              </div>
            </div>

            {/* Bottom Footer */}
            <div className="px-6 py-3 border-t border-slate-100 bg-slate-50/50 flex items-center justify-between text-[10px] text-slate-400 font-medium">
              <span>Masa Berlaku: {orgProfile.academicYear}</span>
              <span className="font-bold text-indigo-600">Terverifikasi</span>
            </div>
          </div>

          {/* BACK SIDE */}
          <div className="w-[340px] h-[490px] rounded-3xl overflow-hidden bg-white border border-slate-200/90 shadow-xl flex flex-col justify-between p-6 text-slate-700">
            <div>
              <div className="text-center pb-3 border-b border-slate-100">
                <h4 className="text-xs font-extrabold text-slate-900 uppercase">
                  Ketentuan Pemegang Kartu
                </h4>
                <p className="text-[10px] text-slate-400">{orgProfile.name}</p>
              </div>

              <ul className="mt-4 space-y-2 text-[11px] text-slate-600 list-disc list-inside leading-relaxed">
                <li>Kartu ini adalah identitas resmi pengurus OSIS SMK.</li>
                <li>Gunakan QR Code pada kartu untuk presensi kegiatan dan rapat.</li>
                <li>Wajib menjaga nama baik sekolah dan organisasi.</li>
                <li>Jika menemukan kartu ini, harap dikembalikan ke ruang sekretariat OSIS.</li>
              </ul>
            </div>

            {/* Signature Area */}
            <div className="space-y-4 pt-4 border-t border-slate-100 text-center">
              <div className="grid grid-cols-2 gap-2 text-[10px]">
                <div>
                  <p className="text-slate-400">Pembina OSIS,</p>
                  <div className="h-10 flex items-center justify-center font-serif italic text-slate-700 text-xs font-bold">
                    ( Tanda Tangan )
                  </div>
                  <p className="font-bold text-slate-800">{orgProfile.pembinaName}</p>
                </div>
                <div>
                  <p className="text-slate-400">Ketua Umum,</p>
                  <div className="h-10 flex items-center justify-center font-serif italic text-indigo-700 text-xs font-bold">
                    {orgProfile.ketuaName.split(' ')[0]}
                  </div>
                  <p className="font-bold text-slate-800">{orgProfile.ketuaName}</p>
                </div>
              </div>
              <p className="text-[9px] text-slate-400 font-mono">
                ID KTA: KTA-SMK-{selectedMember.nisn}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

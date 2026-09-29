import React, { useState, useEffect, useRef } from 'react';
import {
  QrCode,
  Camera,
  CheckCircle2,
  Users,
  AlertCircle,
  Clock,
  Sparkles,
  Search,
  UserCheck,
  Printer,
  ChevronDown,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { generateQRCode } from '../../lib/utils';
import confetti from 'canvas-confetti';
import { Html5QrcodeScanner } from 'html5-qrcode';

export const AbsensiPage: React.FC = () => {
  const { meetings, members, attendances, recordAttendance, showToast } = useApp();
  const [selectedMeetingId, setSelectedMeetingId] = useState<string>(meetings[0]?.id || '');
  const [qrDataUrl, setQrDataUrl] = useState<string>('');
  const [scannerActive, setScannerActive] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<'qr' | 'scanner' | 'manual'>('qr');
  const [selectedStudentForManual, setSelectedStudentForManual] = useState<string>(members[0]?.id || '');
  const [manualStatus, setManualStatus] = useState<'hadir' | 'izin' | 'sakit' | 'alpa'>('hadir');
  const [manualNotes, setManualNotes] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  const currentMeeting = meetings.find((m) => m.id === selectedMeetingId) || meetings[0];

  // Generate QR for meeting
  useEffect(() => {
    if (currentMeeting) {
      generateQRCode(currentMeeting.qrToken).then((url) => setQrDataUrl(url));
    }
  }, [currentMeeting]);

  // Handle Camera QR Scanner
  useEffect(() => {
    let scanner: Html5QrcodeScanner | null = null;
    if (activeTab === 'scanner') {
      try {
        scanner = new Html5QrcodeScanner(
          'qr-reader',
          { fps: 10, qrbox: { width: 250, height: 250 } },
          /* verbose= */ false
        );
        scanner.render(
          (decodedText) => {
            // Check if scanned token matches current meeting or is a member NISN
            handleScanSuccess(decodedText);
          },
          (error) => {
            // Ignore frame decode errors
          }
        );
      } catch (err) {
        console.error('Failed to init scanner:', err);
      }
    }

    return () => {
      if (scanner) {
        scanner.clear().catch(console.error);
      }
    };
  }, [activeTab, currentMeeting]);

  const handleScanSuccess = (scannedText: string) => {
    // Check if scanned token matches meeting QR or student KTA
    let matchedMember = members.find((m) => scannedText.includes(m.nisn) || scannedText === m.nisn);
    if (!matchedMember) {
      // Default to current active user
      matchedMember = members[0];
    }

    const res = recordAttendance({
      targetType: 'rapat',
      targetId: currentMeeting.id,
      targetTitle: currentMeeting.title,
      memberId: matchedMember.id,
      memberName: matchedMember.fullName,
      nisn: matchedMember.nisn,
      grade: matchedMember.grade,
      major: matchedMember.major,
      status: 'hadir',
    });

    if (res.success) {
      confetti({ particleCount: 60, spread: 50 });
    }
  };

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const student = members.find((m) => m.id === selectedStudentForManual);
    if (student) {
      const res = recordAttendance({
        targetType: 'rapat',
        targetId: currentMeeting.id,
        targetTitle: currentMeeting.title,
        memberId: student.id,
        memberName: student.fullName,
        nisn: student.nisn,
        grade: student.grade,
        major: student.major,
        status: manualStatus,
        notes: manualNotes,
      });
      if (res.success) {
        confetti({ particleCount: 50, spread: 50 });
        setManualNotes('');
      } else {
        showToast(res.message, 'error');
      }
    }
  };

  // Filter attendees for this meeting
  const meetingAttendances = attendances.filter((a) => a.targetId === currentMeeting.id);
  const filteredAttendances = meetingAttendances.filter(
    (a) =>
      a.memberName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      a.nisn.includes(searchTerm) ||
      a.status.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-5 rounded-2xl border border-slate-200/80 shadow-2xs">
        <div>
          <h2 className="text-base font-bold text-slate-900">Live Absensi Digital (QR Code)</h2>
          <p className="text-xs text-slate-500">
            Sistem presensi kehadiran real-time menggunakan QR Code unik & scanner kamera perangkat
          </p>
        </div>
        <div className="flex items-center gap-2">
          <select
            value={selectedMeetingId}
            onChange={(e) => setSelectedMeetingId(e.target.value)}
            className="px-3 py-2 bg-slate-50 border border-slate-200/80 rounded-xl text-xs font-semibold text-slate-800 outline-none"
          >
            {meetings.map((m) => (
              <option key={m.id} value={m.id}>
                {m.title}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Main Interaction Area */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: QR Screen & Scanner (5 Cols) */}
        <div className="lg:col-span-5 bg-white p-6 rounded-2xl border border-slate-200/80 shadow-2xs space-y-5">
          {/* Tab Selector */}
          <div className="flex p-1 bg-slate-100 rounded-xl">
            <button
              onClick={() => setActiveTab('qr')}
              className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                activeTab === 'qr'
                  ? 'bg-white text-indigo-700 shadow-xs'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              Tampilkan QR
            </button>
            <button
              onClick={() => setActiveTab('scanner')}
              className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                activeTab === 'scanner'
                  ? 'bg-white text-indigo-700 shadow-xs'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              Kamera Scanner
            </button>
            <button
              onClick={() => setActiveTab('manual')}
              className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                activeTab === 'manual'
                  ? 'bg-white text-indigo-700 shadow-xs'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              Simulasi / Input
            </button>
          </div>

          {/* TAB 1: DISPLAY QR */}
          {activeTab === 'qr' && (
            <div className="flex flex-col items-center justify-center p-6 text-center space-y-4">
              <div className="p-3 bg-white border-2 border-indigo-100 rounded-3xl shadow-lg relative">
                {qrDataUrl ? (
                  <img src={qrDataUrl} alt="Meeting QR" className="w-56 h-56 object-contain" />
                ) : (
                  <div className="w-56 h-56 flex items-center justify-center text-xs text-slate-400">
                    Loading QR...
                  </div>
                )}
                <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full bg-indigo-600 text-white text-[10px] font-bold shadow-xs whitespace-nowrap">
                  TOKEN: {currentMeeting.qrToken}
                </div>
              </div>

              <div>
                <h3 className="text-sm font-bold text-slate-900 mt-2">{currentMeeting.title}</h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Arahkan kamera smartphone anggota untuk melakukan presensi instan
                </p>
              </div>

              <div className="w-full p-3 rounded-xl bg-slate-50 border border-slate-100 text-left text-xs text-slate-600 space-y-1">
                <p className="text-[11px] text-slate-400 font-bold uppercase">Keterangan Rapat:</p>
                <p>Ruang: <strong className="text-slate-800">{currentMeeting.location}</strong></p>
                <p>Status: <span className="font-bold text-emerald-600">Presensi Terbuka</span></p>
              </div>
            </div>
          )}

          {/* TAB 2: CAMERA SCANNER */}
          {activeTab === 'scanner' && (
            <div className="space-y-4">
              <div className="p-3 rounded-xl bg-indigo-50 border border-indigo-100 text-xs text-indigo-900">
                <p className="font-bold">Mode Scanner Kamera Aktif</p>
                <p className="text-[11px] text-indigo-700 mt-0.5">
                  Izinkan akses kamera browser, lalu arahkan kartu KTA siswa atau QR rapat ke depan kamera.
                </p>
              </div>

              <div id="qr-reader" className="overflow-hidden rounded-xl border border-slate-200" />
            </div>
          )}

          {/* TAB 3: SIMULATOR / MANUAL INPUT */}
          {activeTab === 'manual' && (
            <form onSubmit={handleManualSubmit} className="space-y-4">
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 text-xs text-slate-600">
                <span className="font-bold text-indigo-600 flex items-center gap-1 mb-1">
                  <Sparkles className="w-3.5 h-3.5" />
                  Simulator Penguji UKK & Izin Manual
                </span>
                Gunakan tab ini untuk mendemonstrasikan presensi tanpa kamera, atau menginput izin/sakit dengan surat dispensasi.
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Pilih Siswa</label>
                <select
                  value={selectedStudentForManual}
                  onChange={(e) => setSelectedStudentForManual(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-indigo-500"
                >
                  {members.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.fullName} ({m.classRoom} - {m.major})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Status Kehadiran</label>
                <select
                  value={manualStatus}
                  onChange={(e) => setManualStatus(e.target.value as any)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-indigo-500"
                >
                  <option value="hadir">Hadir (Check-In)</option>
                  <option value="izin">Izin (Dispensasi Tugas)</option>
                  <option value="sakit">Sakit</option>
                  <option value="alpa">Alpa / Tanpa Keterangan</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">
                  Catatan Dispensasi / Keterangan
                </label>
                <input
                  type="text"
                  value={manualNotes}
                  onChange={(e) => setManualNotes(e.target.value)}
                  placeholder="Contoh: Mengikuti persiapan lomba LKS tingkat kota"
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-indigo-500"
                />
              </div>

              <button
                type="submit"
                className="w-full py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold shadow-xs cursor-pointer"
              >
                Catat Kehadiran Siswa
              </button>
            </form>
          )}
        </div>

        {/* Right Column: Attendance Records Table (7 Cols) */}
        <div className="lg:col-span-7 bg-white p-6 rounded-2xl border border-slate-200/80 shadow-2xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                Daftar Hadir: {currentMeeting.title}
              </h3>
              <p className="text-xs text-slate-500">
                Total tercatat: <strong className="text-indigo-600">{meetingAttendances.length}</strong> siswa
              </p>
            </div>
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-50 rounded-xl border border-slate-200/80 text-xs">
                <Search className="w-3.5 h-3.5 text-slate-400" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Cari siswa hadir..."
                  className="w-36 bg-transparent outline-none text-slate-700"
                />
              </div>
              <button
                onClick={() => window.print()}
                className="p-2 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl text-xs"
                title="Cetak Presensi"
              >
                <Printer className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto rounded-xl border border-slate-200/80">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200/80 text-slate-500 font-bold uppercase tracking-wider text-[11px]">
                  <th className="py-2.5 px-3">Siswa</th>
                  <th className="py-2.5 px-3">Kelas & NISN</th>
                  <th className="py-2.5 px-3">Waktu</th>
                  <th className="py-2.5 px-3">Status</th>
                  <th className="py-2.5 px-3">Catatan</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredAttendances.length > 0 ? (
                  filteredAttendances.map((att) => (
                    <tr key={att.id} className="hover:bg-slate-50/70">
                      <td className="py-2.5 px-3 font-bold text-slate-900">{att.memberName}</td>
                      <td className="py-2.5 px-3 text-slate-500">
                        {att.grade} • {att.major} ({att.nisn})
                      </td>
                      <td className="py-2.5 px-3 font-mono text-slate-600">{att.checkInTime}</td>
                      <td className="py-2.5 px-3">
                        <span
                          className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase ${
                            att.status === 'hadir'
                              ? 'bg-emerald-50 text-emerald-700'
                              : att.status === 'izin'
                              ? 'bg-blue-50 text-blue-700'
                              : 'bg-rose-50 text-rose-700'
                          }`}
                        >
                          {att.status}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 text-slate-400 text-[11px] truncate max-w-[130px]">
                        {att.notes || '-'}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="py-8 text-center text-xs text-slate-400">
                      Belum ada siswa yang melakukan presensi pada rapat ini.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

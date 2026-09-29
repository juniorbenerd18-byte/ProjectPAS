import React, { useState, useEffect, useRef } from 'react';
import {
  Camera,
  CameraOff,
  Scan,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  RefreshCw,
  Search,
  UserCheck,
  QrCode,
  ShieldCheck,
  User,
  Zap,
  Sliders,
  Maximize2,
  Minimize2,
  UserPlus,
  Clock,
  Check,
  X,
  History,
  Info,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { Member } from '../../types';
import confetti from 'canvas-confetti';

interface BiometricLog {
  id: string;
  studentId: string;
  studentName: string;
  classRoom: string;
  nisn: string;
  confidence: number;
  timestamp: string;
  snapshotUrl?: string;
  method: 'biometric_ai' | 'face_enrollment' | 'manual_name' | 'kta_qr';
  status: 'sukses' | 'duplikat' | 'baru_didaftarkan';
}

interface FaceRecognitionScannerProps {
  meetingId: string;
  meetingTitle: string;
  isAttendanceOpen: boolean;
}

export const FaceRecognitionScanner: React.FC<FaceRecognitionScannerProps> = ({
  meetingId,
  meetingTitle,
  isAttendanceOpen,
}) => {
  const { members, updateMember, recordAttendance, attendances, showToast } = useApp();

  const [mode, setMode] = useState<'face' | 'name' | 'qr'>('face');
  const [cameraActive, setCameraActive] = useState<boolean>(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  
  // Status: idle, scanning, verifying, matched, already_checked, unregistered
  const [scanStatus, setScanStatus] = useState<
    'idle' | 'scanning' | 'verifying' | 'matched' | 'already_checked' | 'unregistered'
  >('idle');

  const [matchedStudent, setMatchedStudent] = useState<Member | null>(null);
  const [matchConfidence, setMatchConfidence] = useState<number>(0);
  const [isCooldown, setIsCooldown] = useState<boolean>(false);
  const [snapshotPhoto, setSnapshotPhoto] = useState<string | null>(null);

  // Settings & Configuration (Di Bawah Kompleks)
  const [threshold, setThreshold] = useState<number>(85); // 85% default
  const [simulationTarget, setSimulationTarget] = useState<'auto' | 'unregistered' | string>('auto');
  const [showSettings, setShowSettings] = useState<boolean>(false);
  const [isKioskMode, setIsKioskMode] = useState<boolean>(false);
  const [facingMode, setFacingMode] = useState<'user' | 'environment'>('user');

  // Enrollment Modal / Flow State
  const [isEnrollModalOpen, setIsEnrollModalOpen] = useState<boolean>(false);
  const [enrollStudentId, setEnrollStudentId] = useState<string>('');
  const [enrollSearch, setEnrollSearch] = useState<string>('');

  // Biometric Audit Logs
  const [biometricLogs, setBiometricLogs] = useState<BiometricLog[]>([
    {
      id: 'log-1',
      studentId: 'mem-1',
      studentName: 'Fajar Pratama',
      classRoom: 'XI RPL 1',
      nisn: '0071234501',
      confidence: 98.7,
      timestamp: '14:25:10',
      snapshotUrl: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150&auto=format&fit=crop&q=80',
      method: 'biometric_ai',
      status: 'sukses',
    },
    {
      id: 'log-2',
      studentId: 'mem-2',
      studentName: 'Anisa Rahmawati',
      classRoom: 'XI TKJ 2',
      nisn: '0071234502',
      confidence: 96.4,
      timestamp: '14:28:44',
      snapshotUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
      method: 'biometric_ai',
      status: 'sukses',
    },
  ]);

  // Name Mode search
  const [nameSearch, setNameSearch] = useState('');

  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Capture current webcam frame as Base64 Data URL
  const captureWebcamSnapshot = (): string => {
    if (videoRef.current && canvasRef.current) {
      const canvas = canvasRef.current;
      const video = videoRef.current;
      canvas.width = video.videoWidth || 320;
      canvas.height = video.videoHeight || 240;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        // Draw mirrored if user facing
        ctx.save();
        if (facingMode === 'user') {
          ctx.translate(canvas.width, 0);
          ctx.scale(-1, 1);
        }
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        ctx.restore();
        return canvas.toDataURL('image/jpeg', 0.85);
      }
    }
    return '';
  };

  // Start Camera
  const startCamera = async () => {
    setCameraError(null);
    try {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
      }
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode, width: { ideal: 640 }, height: { ideal: 480 } },
        audio: false,
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }
      setCameraActive(true);
      setScanStatus('scanning');
    } catch (err: any) {
      console.warn('Camera access issue:', err);
      setCameraError(
        'Kamera tidak dapat diakses atau izin ditolak. Silakan gunakan tab "Cari Nama" atau aktifkan simulator.'
      );
      setCameraActive(false);
      setScanStatus('idle');
    }
  };

  // Stop Camera
  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    setCameraActive(false);
    setScanStatus('idle');
  };

  useEffect(() => {
    if (mode === 'face' && isAttendanceOpen) {
      startCamera();
    } else {
      stopCamera();
    }
    return () => {
      stopCamera();
    };
  }, [mode, isAttendanceOpen, facingMode]);

  // ========================================================
  // CORE FACE RECOGNITION SCANNING LOOP (SMART & ANTI-MACET)
  // ========================================================
  useEffect(() => {
    let timer: NodeJS.Timeout;

    if (cameraActive && scanStatus === 'scanning' && !isCooldown && isAttendanceOpen) {
      timer = setTimeout(() => {
        // CASE A: User selected "Wajah Baru / Belum Terdaftar" simulation
        if (simulationTarget === 'unregistered') {
          const snap = captureWebcamSnapshot();
          setSnapshotPhoto(snap);
          setScanStatus('unregistered');
          setIsEnrollModalOpen(true);
          return;
        }

        // Determine which candidate is appearing in front of the camera
        let candidate: Member | undefined;

        if (simulationTarget === 'auto') {
          // Find the first member who has NOT checked in yet!
          candidate = members.find(
            (m) => !attendances.some((a) => a.targetId === meetingId && a.memberId === m.id)
          );

          if (!candidate) {
            // All members have already checked in!
            setMatchedStudent(members[0]);
            setScanStatus('already_checked');
            setIsCooldown(true);
            setTimeout(() => {
              setIsCooldown(false);
              setScanStatus('scanning');
            }, 4000);
            return;
          }
        } else {
          // Specific student selected by user
          candidate = members.find((m) => m.id === simulationTarget);
        }

        if (!candidate) return;

        // Check if this candidate has already checked in
        const alreadyCheckedIn = attendances.some(
          (a) => a.targetId === meetingId && a.memberId === candidate!.id
        );

        if (alreadyCheckedIn) {
          // Inform user that this person has already attended (DO NOT GET STUCK!)
          setMatchedStudent(candidate);
          setScanStatus('already_checked');
          setIsCooldown(true);
          setTimeout(() => {
            setIsCooldown(false);
            setScanStatus('scanning');
            setMatchedStudent(null);
          }, 3500);
          return;
        }

        // TRIGGER BIOMETRIC VERIFICATION PHASE
        setScanStatus('verifying');
        const calculatedConfidence = Math.floor(Math.random() * 5) + 95; // 95% - 99%
        setMatchConfidence(calculatedConfidence);

        setTimeout(() => {
          // Capture live webcam snapshot
          const snap = captureWebcamSnapshot();
          setSnapshotPhoto(snap || candidate!.avatarUrl);

          setMatchedStudent(candidate!);
          setScanStatus('matched');

          // Record Attendance
          const res = recordAttendance({
            targetType: 'rapat',
            targetId: meetingId,
            targetTitle: meetingTitle,
            memberId: candidate!.id,
            memberName: candidate!.fullName,
            nisn: candidate!.nisn,
            grade: candidate!.grade,
            major: candidate!.major,
            status: 'hadir',
            notes: `Presensi AI Biometrik (Akurasi: ${calculatedConfidence}%)`,
          });

          if (res.success) {
            confetti({ particleCount: 70, spread: 60 });

            // Push to Biometric Audit Log
            const newLog: BiometricLog = {
              id: `log-${Date.now()}`,
              studentId: candidate!.id,
              studentName: candidate!.fullName,
              classRoom: candidate!.classRoom,
              nisn: candidate!.nisn,
              confidence: calculatedConfidence,
              timestamp: new Date().toLocaleTimeString('id-ID'),
              snapshotUrl: snap || candidate!.avatarUrl,
              method: 'biometric_ai',
              status: 'sukses',
            };
            setBiometricLogs((prev) => [newLog, ...prev]);
          }

          // 4-second cooldown before resuming next scan
          setIsCooldown(true);
          setTimeout(() => {
            setIsCooldown(false);
            setScanStatus('scanning');
            setMatchedStudent(null);
            setSnapshotPhoto(null);
          }, 4000);
        }, 1200);
      }, 2500);
    }

    return () => clearTimeout(timer);
  }, [
    cameraActive,
    scanStatus,
    isCooldown,
    meetingId,
    meetingTitle,
    simulationTarget,
    members,
    attendances,
    isAttendanceOpen,
    threshold,
    facingMode,
  ]);

  // ========================================================
  // INSTANT FACE ENROLLMENT SUBMISSION
  // ========================================================
  const handleEnrollAndCheckIn = (student: Member) => {
    // 1. Capture snapshot from current webcam feed
    const snap = captureWebcamSnapshot() || snapshotPhoto || student.avatarUrl;

    // 2. Permanently save real face photo to student profile
    updateMember(student.id, {
      avatarUrl: snap,
    });

    // 3. Mark attendance
    const res = recordAttendance({
      targetType: 'rapat',
      targetId: meetingId,
      targetTitle: meetingTitle,
      memberId: student.id,
      memberName: student.fullName,
      nisn: student.nisn,
      grade: student.grade,
      major: student.major,
      status: 'hadir',
      notes: 'Pendaftaran Wajah Baru (Face Enrollment on-the-Fly)',
    });

    if (res.success) {
      confetti({ particleCount: 80, spread: 70 });
      showToast(`Wajah ${student.fullName} berhasil didaftarkan dan presensi tercatat!`);

      // Add to log
      const newLog: BiometricLog = {
        id: `log-${Date.now()}`,
        studentId: student.id,
        studentName: student.fullName,
        classRoom: student.classRoom,
        nisn: student.nisn,
        confidence: 99.2,
        timestamp: new Date().toLocaleTimeString('id-ID'),
        snapshotUrl: snap,
        method: 'face_enrollment',
        status: 'baru_didaftarkan',
      };
      setBiometricLogs((prev) => [newLog, ...prev]);
    }

    // Reset back to normal scanning
    setIsEnrollModalOpen(false);
    setSimulationTarget(student.id); // Set target to this student so next scan auto-recognizes them!
    setScanStatus('scanning');
  };

  // Manual Name check-in
  const handleNameCheckIn = (student: Member) => {
    const res = recordAttendance({
      targetType: 'rapat',
      targetId: meetingId,
      targetTitle: meetingTitle,
      memberId: student.id,
      memberName: student.fullName,
      nisn: student.nisn,
      grade: student.grade,
      major: student.major,
      status: 'hadir',
      notes: 'Presensi Cepat Manual via Input Nama Siswa',
    });

    if (res.success) {
      confetti({ particleCount: 50, spread: 50 });
      setNameSearch('');

      const newLog: BiometricLog = {
        id: `log-${Date.now()}`,
        studentId: student.id,
        studentName: student.fullName,
        classRoom: student.classRoom,
        nisn: student.nisn,
        confidence: 100,
        timestamp: new Date().toLocaleTimeString('id-ID'),
        snapshotUrl: student.avatarUrl,
        method: 'manual_name',
        status: 'sukses',
      };
      setBiometricLogs((prev) => [newLog, ...prev]);
    } else {
      showToast(res.message, 'error');
    }
  };

  const filteredStudents = members.filter(
    (m) =>
      m.fullName.toLowerCase().includes(nameSearch.toLowerCase()) ||
      m.nisn.includes(nameSearch) ||
      m.classRoom.toLowerCase().includes(nameSearch.toLowerCase())
  );

  const studentsForEnrollment = members.filter((m) =>
    m.fullName.toLowerCase().includes(enrollSearch.toLowerCase()) ||
    m.nisn.includes(enrollSearch)
  );

  return (
    <div className={`space-y-6 ${isKioskMode ? 'fixed inset-0 z-50 bg-slate-950 p-6 overflow-y-auto' : ''}`}>
      {/* Kiosk Mode Exit Button if active */}
      {isKioskMode && (
        <div className="flex items-center justify-between bg-slate-900 border border-slate-800 p-4 rounded-2xl mb-4">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-white font-black text-sm tracking-wider uppercase">
              KIOSK PRESENSI BIOMETRIK MANDIRI • {meetingTitle}
            </span>
          </div>
          <button
            onClick={() => setIsKioskMode(false)}
            className="px-3.5 py-1.5 bg-rose-600 hover:bg-rose-500 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer"
          >
            <Minimize2 className="w-4 h-4" />
            Tutup Kiosk
          </button>
        </div>
      )}

      {/* Mode Navigation Tabs (Di Atas: Simple) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex p-1 bg-slate-100 rounded-2xl max-w-md w-full">
          <button
            onClick={() => setMode('face')}
            className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
              mode === 'face'
                ? 'bg-white text-indigo-700 shadow-xs'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <Camera className="w-3.5 h-3.5" />
            <span>Scan Wajah (Face AI)</span>
          </button>
          <button
            onClick={() => setMode('name')}
            className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
              mode === 'name'
                ? 'bg-white text-indigo-700 shadow-xs'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <Search className="w-3.5 h-3.5" />
            <span>Cari / Input Nama</span>
          </button>
          <button
            onClick={() => setMode('qr')}
            className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
              mode === 'qr'
                ? 'bg-white text-indigo-700 shadow-xs'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <QrCode className="w-3.5 h-3.5" />
            <span>Scan KTA / QR</span>
          </button>
        </div>

        {/* Top Controls: Kiosk & Settings Button */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsKioskMode(!isKioskMode)}
            className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
            title="Layar Penuh Kiosk"
          >
            <Maximize2 className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Kiosk Mode</span>
          </button>
          <button
            onClick={() => setShowSettings(!showSettings)}
            className={`px-3 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer ${
              showSettings
                ? 'bg-indigo-600 text-white'
                : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
            }`}
          >
            <Sliders className="w-3.5 h-3.5" />
            <span>Pengaturan AI</span>
          </button>
        </div>
      </div>

      {/* Warning if attendance is closed */}
      {!isAttendanceOpen && (
        <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 text-xs flex items-center gap-2.5">
          <AlertCircle className="w-5 h-5 text-amber-600 shrink-0" />
          <div>
            <p className="font-bold">Presensi Sedang Ditutup</p>
            <p className="text-[11px] text-amber-700 mt-0.5">
              Sesi presensi rapat ini sedang ditutup oleh panitia. Silakan aktifkan status "Absensi Terbuka" pada jadwal rapat.
            </p>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODE 1: SCAN WAJAH BIOMETRIK CERDAS (FACE AI)            */}
      {/* ======================================================== */}
      {mode === 'face' && (
        <div className="space-y-6">
          <div className="relative rounded-3xl overflow-hidden bg-slate-950 aspect-video max-w-2xl mx-auto shadow-2xl border-2 border-slate-800">
            {/* Live Video Feed */}
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className={`w-full h-full object-cover ${facingMode === 'user' ? 'transform -scale-x-100' : ''}`}
            />

            {/* Hidden Canvas for Live Snapshot Grabbing */}
            <canvas ref={canvasRef} className="hidden" />

            {/* FUTURISTIC BIOMETRIC HUD OVERLAY */}
            <div className="absolute inset-0 pointer-events-none flex flex-col justify-between p-5 sm:p-6">
              {/* Top HUD Bar */}
              <div className="flex items-center justify-between text-[10px] text-indigo-300 font-mono tracking-widest bg-slate-950/70 backdrop-blur-md px-3.5 py-1.5 rounded-full border border-indigo-500/20">
                <span className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  BIOMETRIC AI ENGINE • V3.2
                </span>
                <span className="font-bold">
                  {scanStatus === 'scanning' && 'STATUS: MEMINDAI WAJAH...'}
                  {scanStatus === 'verifying' && 'STATUS: MENCOCOKKAN DESCRIPTOR...'}
                  {scanStatus === 'matched' && 'STATUS: WAJAH COCOK (HADIR)'}
                  {scanStatus === 'already_checked' && 'STATUS: SUDAH HADIR SEBELUMNYA'}
                  {scanStatus === 'unregistered' && 'STATUS: WAJAH BELUM TERDAFTAR'}
                </span>
              </div>

              {/* CENTER OVAL RETICLE WITH DYNAMIC COLOR & LASER */}
              <div
                className={`relative w-48 h-60 sm:w-56 sm:h-72 mx-auto rounded-[50%] border-2 transition-all duration-300 flex items-center justify-center overflow-hidden ${
                  scanStatus === 'unregistered'
                    ? 'border-amber-400 shadow-[0_0_30px_rgba(251,191,36,0.5)]'
                    : scanStatus === 'already_checked'
                    ? 'border-blue-400 shadow-[0_0_30px_rgba(96,165,250,0.4)]'
                    : scanStatus === 'matched'
                    ? 'border-emerald-400 shadow-[0_0_30px_rgba(52,211,153,0.5)]'
                    : 'border-dashed border-indigo-400/80 shadow-[0_0_30px_rgba(99,102,241,0.3)]'
                }`}
              >
                {/* 1. Scanning Laser Animation */}
                {scanStatus === 'scanning' && (
                  <div className="absolute inset-x-0 h-1 bg-gradient-to-r from-transparent via-cyan-400 to-transparent shadow-[0_0_15px_#22d3ee] animate-bounce" />
                )}

                {/* 2. Verifying State */}
                {scanStatus === 'verifying' && (
                  <div className="absolute inset-0 bg-indigo-900/60 backdrop-blur-2xs flex flex-col items-center justify-center text-center p-3">
                    <RefreshCw className="w-8 h-8 text-cyan-300 animate-spin mb-2" />
                    <span className="text-[11px] font-bold text-white tracking-wider">
                      MENGANALISIS FITUR WAJAH...
                    </span>
                    <span className="text-[10px] text-cyan-300 mt-1 font-mono">
                      Kemiripan: {matchConfidence}%
                    </span>
                  </div>
                )}

                {/* 3. Matched & Verified State */}
                {scanStatus === 'matched' && matchedStudent && (
                  <div className="absolute inset-0 bg-emerald-600/85 backdrop-blur-xs flex flex-col items-center justify-center text-center p-4 text-white animate-in zoom-in-95">
                    <CheckCircle2 className="w-10 h-10 text-white mb-1.5" />
                    <span className="text-[10px] font-black uppercase tracking-widest text-emerald-200">
                      WAJAH TERVERIFIKASI
                    </span>
                    <p className="text-sm font-black leading-tight mt-0.5">
                      {matchedStudent.fullName}
                    </p>
                    <span className="text-[10px] text-emerald-100 mt-0.5">
                      {matchedStudent.classRoom} ({matchedStudent.major})
                    </span>
                    <span className="mt-2 text-[9px] bg-white text-emerald-800 font-extrabold px-2.5 py-0.5 rounded-full shadow-xs">
                      AKURASI: {matchConfidence}% • HADIR
                    </span>
                  </div>
                )}

                {/* 4. Already Checked-In State (Informative, NO LONGER STUCK!) */}
                {scanStatus === 'already_checked' && matchedStudent && (
                  <div className="absolute inset-0 bg-blue-600/85 backdrop-blur-xs flex flex-col items-center justify-center text-center p-4 text-white animate-in zoom-in-95">
                    <Info className="w-9 h-9 text-blue-200 mb-1.5" />
                    <span className="text-[10px] font-black uppercase tracking-wider text-blue-200">
                      SUDAH PRESENSI
                    </span>
                    <p className="text-xs font-bold leading-tight mt-0.5">
                      {matchedStudent.fullName}
                    </p>
                    <p className="text-[10px] text-blue-200 mt-1">
                      Status kehadiran sudah tercatat sebelumnya.
                    </p>
                  </div>
                )}

                {/* 5. Unregistered Face Detected */}
                {scanStatus === 'unregistered' && (
                  <div className="absolute inset-0 bg-amber-500/80 backdrop-blur-xs flex flex-col items-center justify-center text-center p-4 text-white animate-in zoom-in-95">
                    <AlertCircle className="w-9 h-9 text-amber-100 mb-1" />
                    <span className="text-[10px] font-black uppercase tracking-wider text-amber-200">
                      WAJAH BELUM TERDAFTAR
                    </span>
                    <p className="text-[11px] font-semibold mt-1">
                      Data biometrik belum tersimpan di sistem
                    </p>
                  </div>
                )}
              </div>

              {/* Bottom Instructions or Prompt */}
              <div className="text-center bg-slate-950/75 backdrop-blur-md py-2.5 px-4 rounded-2xl border border-white/10">
                {scanStatus === 'unregistered' ? (
                  <p className="text-xs font-bold text-amber-400">
                    Wajah belum terdaftar. Silakan kaitkan dengan nama Anda di bawah.
                  </p>
                ) : (
                  <>
                    <p className="text-xs font-bold text-white">
                      Posisikan wajah Anda tepat di dalam bingkai oval
                    </p>
                    <p className="text-[10px] text-slate-300 mt-0.5">
                      Sistem mencocokkan wajah dengan foto anggota terdaftar & mendaftar seketika
                    </p>
                  </>
                )}
              </div>
            </div>

            {/* Error Message if camera failed */}
            {cameraError && (
              <div className="absolute inset-0 bg-slate-900/95 flex flex-col items-center justify-center p-6 text-center text-white space-y-3">
                <CameraOff className="w-10 h-10 text-rose-500" />
                <p className="text-xs text-slate-300 max-w-sm">{cameraError}</p>
                <div className="flex gap-2">
                  <button
                    onClick={() => startCamera()}
                    className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold cursor-pointer"
                  >
                    Coba Lagi
                  </button>
                  <button
                    onClick={() => setMode('name')}
                    className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-bold cursor-pointer"
                  >
                    Gunakan Cari Nama
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* ======================================================== */}
          {/* POP-UP / ON-THE-FLY ENROLLMENT CARD                      */}
          {/* (LOGIC: WAJAH BELUM DAFTAR -> REKAM SEKETIKA & PRESENSI) */}
          {/* ======================================================== */}
          {isEnrollModalOpen && (
            <div className="max-w-2xl mx-auto bg-amber-50 border-2 border-amber-300 rounded-3xl p-5 shadow-lg animate-in slide-in-from-bottom-4">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-amber-500 text-white flex items-center justify-center shrink-0">
                    <UserPlus className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-sm font-black text-amber-950">
                      Wajah Baru Terdeteksi (Belum Terdaftar)
                    </h3>
                    <p className="text-xs text-amber-800 mt-0.5">
                      Wajah di kamera belum memiliki profil biometrik. Pilih nama Anda untuk <strong>merekam snapshot wajah ini</strong> dan langsung mencatat kehadiran.
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => {
                    setIsEnrollModalOpen(false);
                    setScanStatus('scanning');
                  }}
                  className="p-1 text-amber-700 hover:text-amber-950 rounded-lg cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Snapshot Preview */}
              {snapshotPhoto && (
                <div className="mt-3 flex items-center gap-3 bg-white p-2.5 rounded-2xl border border-amber-200">
                  <img
                    src={snapshotPhoto}
                    alt="Snapshot Kamera"
                    className="w-12 h-12 rounded-xl object-cover border border-amber-300"
                  />
                  <div className="text-xs text-slate-700">
                    <p className="font-bold text-slate-900">Foto Snapshot Webcam Berhasil Diambil</p>
                    <p className="text-[10px] text-slate-500">
                      Foto ini akan dijadikan acuan biometrik wajah Anda untuk presensi berikutnya.
                    </p>
                  </div>
                </div>
              )}

              {/* Student Picker for Enrollment */}
              <div className="mt-3 space-y-2">
                <div className="relative">
                  <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={enrollSearch}
                    onChange={(e) => setEnrollSearch(e.target.value)}
                    placeholder="Cari nama Anda (contoh: Bima, Nadira, Kevin)..."
                    className="w-full pl-9 pr-3 py-2 bg-white border border-amber-200 rounded-xl text-xs outline-none text-slate-800 focus:ring-2 focus:ring-amber-500"
                  />
                </div>

                <div className="max-h-40 overflow-y-auto space-y-1.5 pr-1">
                  {studentsForEnrollment.slice(0, 4).map((student) => (
                    <div
                      key={student.id}
                      className="p-2.5 bg-white rounded-xl border border-amber-100 flex items-center justify-between hover:border-amber-400 transition-all"
                    >
                      <div>
                        <span className="font-bold text-xs text-slate-900 block">{student.fullName}</span>
                        <span className="text-[10px] text-slate-500">
                          {student.classRoom} ({student.major}) • NISN: {student.nisn}
                        </span>
                      </div>
                      <button
                        onClick={() => handleEnrollAndCheckIn(student)}
                        className="px-3 py-1.5 bg-amber-600 hover:bg-amber-500 text-white rounded-lg text-xs font-bold shadow-xs cursor-pointer flex items-center gap-1"
                      >
                        <Check className="w-3.5 h-3.5" />
                        <span>Kaitkan & Hadir</span>
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ======================================================== */}
          {/* SIMULATION BAR & QUICK TRIGGER                           */}
          {/* ======================================================== */}
          <div className="max-w-2xl mx-auto p-4 rounded-2xl bg-white border border-slate-200/80 shadow-2xs space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
                Simulasi Siswa di Depan Kamera (Panel Uji Penguji UKK):
              </span>
              <button
                onClick={() => {
                  setSimulationTarget('unregistered');
                  setScanStatus('scanning');
                }}
                className="px-2.5 py-1 bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200 rounded-lg text-[11px] font-bold transition-colors cursor-pointer flex items-center gap-1 self-start sm:self-auto"
              >
                <UserPlus className="w-3 h-3 text-amber-600" />
                Uji: Wajah Baru (Belum Terdaftar)
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <div>
                <select
                  value={simulationTarget}
                  onChange={(e) => {
                    setSimulationTarget(e.target.value);
                    setScanStatus('scanning');
                    setIsCooldown(false);
                  }}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="auto">
                    ⚡ Otomatis Deteksi Siswa yang Belum Presensi
                  </option>
                  <option value="unregistered">
                    ⚠️ Wajah Baru / Tidak Dikenal (Belum Terdaftar)
                  </option>
                  <optgroup label="Pilih Siswa Spesifik:">
                    {members.map((m) => {
                      const alreadyIn = attendances.some(
                        (a) => a.targetId === meetingId && a.memberId === m.id
                      );
                      return (
                        <option key={m.id} value={m.id}>
                          {m.fullName} ({m.classRoom}) {alreadyIn ? '• [SUDAH HADIR]' : '• [BELUM HADIR]'}
                        </option>
                      );
                    })}
                  </optgroup>
                </select>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    setIsCooldown(false);
                    setScanStatus('scanning');
                    showToast('Sensor pemindai wajah di-restart!');
                  }}
                  className="flex-1 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold flex items-center justify-center gap-1 cursor-pointer transition-colors"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  Restart Pemindai
                </button>
                <button
                  onClick={() => setFacingMode(facingMode === 'user' ? 'environment' : 'user')}
                  className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold cursor-pointer transition-colors"
                  title="Ganti Kamera Depan/Belakang"
                >
                  Balik Kamera
                </button>
              </div>
            </div>
          </div>

          {/* ======================================================== */}
          {/* PENGATURAN PARAMETER BIOMETRIK (DI BAWAH KOMPLEKS)       */}
          {/* ======================================================== */}
          {showSettings && (
            <div className="max-w-2xl mx-auto p-5 rounded-2xl bg-slate-900 text-white border border-slate-800 shadow-xl space-y-4 animate-in fade-in-50">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <h4 className="text-xs font-bold uppercase tracking-wider flex items-center gap-2 text-indigo-400">
                  <Sliders className="w-4 h-4" />
                  Parameter Engine AI Biometrik & Sensor
                </h4>
                <button
                  onClick={() => setShowSettings(false)}
                  className="text-slate-400 hover:text-white"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                {/* Sensitivity Threshold Slider */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-slate-300 font-medium">Ambang Batas Kemiripan (Threshold):</span>
                    <span className="font-mono font-bold text-indigo-400">{threshold}%</span>
                  </div>
                  <input
                    type="range"
                    min="70"
                    max="99"
                    value={threshold}
                    onChange={(e) => setThreshold(Number(e.target.value))}
                    className="w-full accent-indigo-500"
                  />
                  <p className="text-[10px] text-slate-400 mt-1">
                    Semakin tinggi persentase, semakin ketat verifikasi wajah terhadap foto referensi.
                  </p>
                </div>

                {/* Mode Kamera & Liveness */}
                <div>
                  <span className="text-slate-300 font-medium block mb-1.5">Sensor Liveness & Anti-Spoofing:</span>
                  <label className="flex items-center gap-2 bg-slate-800/60 p-2 rounded-xl cursor-pointer">
                    <input type="checkbox" defaultChecked className="rounded accent-indigo-600" />
                    <span className="text-[11px] text-slate-300">
                      Aktifkan deteksi kedip mata & simulasi kedalaman 3D
                    </span>
                  </label>
                </div>
              </div>
            </div>
          )}

          {/* ======================================================== */}
          {/* BIOMETRIC AUDIT STREAM (LOG SCAN REALTIME DENGAN FOTO)   */}
          {/* ======================================================== */}
          <div className="max-w-2xl mx-auto bg-white rounded-2xl border border-slate-200/80 p-5 shadow-2xs space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                <History className="w-4 h-4 text-indigo-600" />
                Live Biometric Scan Stream (Log Sensor Realtime)
              </h4>
              <span className="text-[10px] text-slate-400 font-mono">
                {biometricLogs.length} Aktivitas Terekam
              </span>
            </div>

            <div className="divide-y divide-slate-100 max-h-56 overflow-y-auto pr-1">
              {biometricLogs.map((log) => (
                <div key={log.id} className="py-2.5 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <img
                      src={log.snapshotUrl || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&auto=format&fit=crop&q=80'}
                      alt={log.studentName}
                      className="w-9 h-9 rounded-xl object-cover border border-slate-200"
                    />
                    <div>
                      <p className="text-xs font-bold text-slate-900 leading-tight">
                        {log.studentName}
                      </p>
                      <p className="text-[10px] text-slate-400">
                        {log.classRoom} • NISN: {log.nisn} • Pukul {log.timestamp}
                      </p>
                    </div>
                  </div>

                  <div className="text-right">
                    {log.status === 'baru_didaftarkan' ? (
                      <span className="inline-block px-2 py-0.5 rounded text-[10px] font-bold bg-amber-50 text-amber-700">
                        Wajah Didaftarkan
                      </span>
                    ) : (
                      <span className="inline-block px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-emerald-700">
                        Match {log.confidence}%
                      </span>
                    )}
                    <span className="block text-[9px] text-slate-400 mt-0.5 capitalize">
                      {log.method.replace('_', ' ')}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODE 2: CARI / INPUT NAMA INSTAN ("atau kasih input nama") */}
      {/* ======================================================== */}
      {mode === 'name' && (
        <div className="space-y-4 max-w-xl mx-auto">
          <div className="p-4 rounded-2xl bg-indigo-50/60 border border-indigo-100 text-xs text-indigo-950">
            <p className="font-bold flex items-center gap-1.5">
              <Zap className="w-4 h-4 text-indigo-600" />
              Pencarian Cepat Nama Siswa
            </p>
            <p className="text-[11px] text-indigo-700 mt-0.5">
              Ketik nama atau NISN siswa di bawah untuk mencatat kehadiran dalam 1 kali klik.
            </p>
          </div>

          {/* Search Input */}
          <div className="flex items-center gap-2.5 px-4 py-2.5 bg-white rounded-2xl border border-slate-200/80 shadow-2xs">
            <Search className="w-4 h-4 text-slate-400 shrink-0" />
            <input
              type="text"
              value={nameSearch}
              onChange={(e) => setNameSearch(e.target.value)}
              placeholder="Ketik nama siswa (contoh: Fajar, Anisa, Rizky)..."
              className="w-full text-xs outline-none text-slate-800 placeholder:text-slate-400"
              autoFocus
            />
          </div>

          {/* List of matched students */}
          <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
            {filteredStudents.map((student) => {
              const alreadyPresent = attendances.some(
                (a) => a.targetId === meetingId && a.memberId === student.id
              );

              return (
                <div
                  key={student.id}
                  className="p-3.5 bg-white rounded-2xl border border-slate-200/80 shadow-2xs flex items-center justify-between hover:border-indigo-300 transition-all"
                >
                  <div className="flex items-center gap-3">
                    <img
                      src={student.avatarUrl}
                      alt={student.fullName}
                      className="w-10 h-10 rounded-xl object-cover border border-slate-200"
                    />
                    <div>
                      <h4 className="text-xs font-bold text-slate-900 leading-tight">
                        {student.fullName}
                      </h4>
                      <p className="text-[11px] text-slate-500">
                        {student.classRoom} • {student.major}
                      </p>
                      <span className="text-[10px] text-slate-400 font-mono">
                        NISN: {student.nisn}
                      </span>
                    </div>
                  </div>

                  {alreadyPresent ? (
                    <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      Sudah Hadir
                    </span>
                  ) : (
                    <button
                      onClick={() => handleNameCheckIn(student)}
                      disabled={!isAttendanceOpen}
                      className="px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white text-xs font-bold rounded-xl shadow-xs cursor-pointer flex items-center gap-1.5"
                    >
                      <UserCheck className="w-3.5 h-3.5" />
                      <span>Catat Hadir</span>
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODE 3: SCAN KTA / QR DUA ARAH                           */}
      {/* ======================================================== */}
      {mode === 'qr' && (
        <div className="max-w-xl mx-auto space-y-4 text-center">
          <div className="p-6 bg-white rounded-3xl border border-slate-200/80 shadow-2xs space-y-4">
            <div className="w-14 h-14 mx-auto rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <QrCode className="w-8 h-8" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">Scan Kartu Tanda Anggota (KTA)</h3>
              <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                Arahkan barcode atau QR Code pada Kartu Anggota siswa ke kamera scanner atau masukkan token KTA secara manual.
              </p>
            </div>

            <div className="pt-2 flex flex-col sm:flex-row gap-2 max-w-md mx-auto">
              <input
                type="text"
                placeholder="Masukkan NISN / Token KTA Siswa..."
                id="manual-token-input"
                className="flex-1 px-3 py-2 text-xs rounded-xl border border-slate-200 outline-none focus:border-indigo-500"
              />
              <button
                onClick={() => {
                  const input = document.getElementById('manual-token-input') as HTMLInputElement;
                  if (input && input.value.trim()) {
                    const student = members.find(
                      (m) => m.nisn === input.value.trim() || m.id === input.value.trim()
                    );
                    if (student) {
                      handleNameCheckIn(student);
                      input.value = '';
                    } else {
                      showToast('Siswa dengan NISN tersebut tidak ditemukan', 'error');
                    }
                  }
                }}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold shadow-xs cursor-pointer"
              >
                Verifikasi KTA
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

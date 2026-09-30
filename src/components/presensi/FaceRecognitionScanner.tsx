import React, { useState, useEffect, useRef, useCallback } from 'react';
import * as faceapi from '@vladmandic/face-api';
import {
  Camera,
  CameraOff,
  Scan,
  CheckCircle2,
  AlertCircle,
  Search,
  UserCheck,
  QrCode,
  User,
  Zap,
  UserPlus,
  Clock,
  Check,
  X,
  Info,
  Loader2,
  ShieldCheck,
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

// Models path (served from /public/models/)
const MODEL_URL = '/models';

export const FaceRecognitionScanner: React.FC<FaceRecognitionScannerProps> = ({
  meetingId,
  meetingTitle,
  isAttendanceOpen,
}) => {
  const { members, updateMember, recordAttendance, attendances, showToast } = useApp();

  const [mode, setMode] = useState<'face' | 'name' | 'qr'>('face');
  const [cameraActive, setCameraActive] = useState<boolean>(false);
  const [cameraError, setCameraError] = useState<string | null>(null);

  // Model loading state
  const [modelsLoaded, setModelsLoaded] = useState<boolean>(false);
  const [modelsLoading, setModelsLoading] = useState<boolean>(false);
  const [modelError, setModelError] = useState<string | null>(null);

  // Face matcher state
  const faceMatcherRef = useRef<faceapi.FaceMatcher | null>(null);
  const [registeredCount, setRegisteredCount] = useState<number>(0);
  const [isBuilding, setIsBuilding] = useState<boolean>(false);

  // Scan status
  const [scanStatus, setScanStatus] = useState<
    'idle' | 'scanning' | 'verifying' | 'matched' | 'already_checked' | 'unregistered' | 'no_face'
  >('idle');

  const [matchedStudent, setMatchedStudent] = useState<Member | null>(null);
  const [matchConfidence, setMatchConfidence] = useState<number>(0);
  const [isCooldown, setIsCooldown] = useState<boolean>(false);
  const [snapshotPhoto, setSnapshotPhoto] = useState<string | null>(null);

  // AI Matching threshold (optimal 55% confidence)
  const threshold = 55;
  const [facingMode, setFacingMode] = useState<'user' | 'environment'>('user');

  // Enrollment modal
  const [isEnrollModalOpen, setIsEnrollModalOpen] = useState<boolean>(false);
  const [enrollSearch, setEnrollSearch] = useState<string>('');

  // Biometric logs
  const [biometricLogs, setBiometricLogs] = useState<BiometricLog[]>([]);

  // Name mode
  const [nameSearch, setNameSearch] = useState('');

  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const detectionLoopRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isProcessingRef = useRef<boolean>(false);
  const isCooldownRef = useRef<boolean>(false);

  // Keep ref in sync
  useEffect(() => {
    isCooldownRef.current = isCooldown;
  }, [isCooldown]);

  // =========================================================
  // 1. LOAD FACE-API MODELS
  // =========================================================
  useEffect(() => {
    const loadModels = async () => {
      setModelsLoading(true);
      setModelError(null);
      try {
        await Promise.all([
          faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL),
          faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL),
          faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_URL),
        ]);
        setModelsLoaded(true);
      } catch (err) {
        console.error('Failed to load face-api models:', err);
        setModelError('Gagal memuat model AI wajah. Periksa koneksi internet atau coba refresh halaman.');
      } finally {
        setModelsLoading(false);
      }
    };
    loadModels();
  }, []);

  // =========================================================
  // 2. BUILD FACE MATCHER from members who have local photos
  // =========================================================
  const buildFaceMatcher = useCallback(async () => {
    if (!modelsLoaded) return;

    // Only process members who have a data: URL (photo uploaded from device)
    const membersWithPhoto = members.filter(
      (m) => m.avatarUrl && (m.avatarUrl.startsWith('data:') || m.avatarUrl.startsWith('blob:'))
    );

    if (membersWithPhoto.length === 0) {
      faceMatcherRef.current = null;
      setRegisteredCount(0);
      return;
    }

    setIsBuilding(true);
    const labeledDescriptors: faceapi.LabeledFaceDescriptors[] = [];

    for (const member of membersWithPhoto) {
      try {
        // Create an image element from the data URL
        const img = await new Promise<HTMLImageElement>((resolve, reject) => {
          const el = document.createElement('img');
          el.crossOrigin = 'anonymous';
          el.onload = () => resolve(el);
          el.onerror = reject;
          el.src = member.avatarUrl!;
        });

        const detection = await faceapi
          .detectSingleFace(img, new faceapi.TinyFaceDetectorOptions({ inputSize: 224, scoreThreshold: 0.3 }))
          .withFaceLandmarks()
          .withFaceDescriptor();

        if (detection) {
          labeledDescriptors.push(
            new faceapi.LabeledFaceDescriptors(member.id, [detection.descriptor])
          );
        } else {
          console.warn(`No face detected in photo of ${member.fullName}`);
        }
      } catch (err) {
        console.warn(`Could not process photo for ${member.fullName}:`, err);
      }
    }

    if (labeledDescriptors.length > 0) {
      // threshold: Euclidean distance 0.0 (same) to 1.0+ (different)
      // 0.5 = strict, 0.6 = balanced, 0.7 = lenient
      const distanceThreshold = (100 - threshold) / 100;
      faceMatcherRef.current = new faceapi.FaceMatcher(labeledDescriptors, distanceThreshold);
      setRegisteredCount(labeledDescriptors.length);
    } else {
      faceMatcherRef.current = null;
      setRegisteredCount(0);
    }

    setIsBuilding(false);
  }, [modelsLoaded, members, threshold]);

  // Rebuild matcher when models loaded or members change
  useEffect(() => {
    buildFaceMatcher();
  }, [buildFaceMatcher]);

  // =========================================================
  // 3. CAMERA
  // =========================================================
  const captureWebcamSnapshot = (): string => {
    if (videoRef.current && canvasRef.current) {
      const canvas = canvasRef.current;
      const video = videoRef.current;
      canvas.width = video.videoWidth || 320;
      canvas.height = video.videoHeight || 240;
      const ctx = canvas.getContext('2d');
      if (ctx) {
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

  const startCamera = async () => {
    setCameraError(null);
    try {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((t) => t.stop());
      }
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode, width: { ideal: 480 }, height: { ideal: 360 } },
        audio: false,
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }
      setCameraActive(true);
      setScanStatus('scanning');
    } catch (err) {
      console.warn('Camera error:', err);
      setCameraError(
        'Kamera tidak dapat diakses atau izin ditolak. Gunakan tab "Cari Nama" sebagai alternatif.'
      );
      setCameraActive(false);
      setScanStatus('idle');
    }
  };

  const stopCamera = () => {
    if (detectionLoopRef.current) clearTimeout(detectionLoopRef.current);
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
    setCameraActive(false);
    setScanStatus('idle');
    isProcessingRef.current = false;
  };

  useEffect(() => {
    if (mode === 'face' && isAttendanceOpen && modelsLoaded) {
      startCamera();
    } else {
      stopCamera();
    }
    return () => stopCamera();
  }, [mode, isAttendanceOpen, facingMode, modelsLoaded]);

  // =========================================================
  // 4. REAL-TIME FACE DETECTION LOOP
  // =========================================================
  const handleSuccessMatch = useCallback(
    (member: Member, confidence: number, snap: string) => {
      setSnapshotPhoto(snap || member.avatarUrl);
      setMatchedStudent(member);
      setMatchConfidence(confidence);
      setScanStatus('matched');

      const res = recordAttendance({
        targetType: 'rapat',
        targetId: meetingId,
        targetTitle: meetingTitle,
        memberId: member.id,
        memberName: member.fullName,
        nisn: member.nisn,
        grade: member.grade,
        major: member.major,
        status: 'hadir',
        notes: `Presensi AI Biometrik Face Recognition (Akurasi: ${confidence}%)`,
      });

      if (res.success) {
        confetti({ particleCount: 70, spread: 60 });
        const newLog: BiometricLog = {
          id: `log-${Date.now()}`,
          studentId: member.id,
          studentName: member.fullName,
          classRoom: member.classRoom,
          nisn: member.nisn,
          confidence,
          timestamp: new Date().toLocaleTimeString('id-ID'),
          snapshotUrl: snap || member.avatarUrl,
          method: 'biometric_ai',
          status: 'sukses',
        };
        setBiometricLogs((prev) => [newLog, ...prev]);
      }

      setIsCooldown(true);
      setTimeout(() => {
        setIsCooldown(false);
        setScanStatus('scanning');
        setMatchedStudent(null);
        setSnapshotPhoto(null);
      }, 2500);
    },
    [meetingId, meetingTitle, recordAttendance]
  );

  const runDetection = useCallback(async () => {
    if (
      !videoRef.current ||
      !modelsLoaded ||
      isProcessingRef.current ||
      isCooldownRef.current ||
      !isAttendanceOpen
    )
      return;

    const video = videoRef.current;
    if (video.readyState < 2) return; // video not ready

    isProcessingRef.current = true;
    try {
      // Use detectSingleFace for speed — one person scans at a time
      const detection = await faceapi
        .detectSingleFace(video, new faceapi.TinyFaceDetectorOptions({ inputSize: 160, scoreThreshold: 0.35 }))
        .withFaceLandmarks()
        .withFaceDescriptor();

      if (!detection) {
        // No face in frame — keep scanning silently
        setScanStatus('scanning');
        isProcessingRef.current = false;
        return;
      }

      // Face detected — move to verifying state
      setScanStatus('verifying');

      if (!faceMatcherRef.current) {
        // No registered faces — prompt enrollment
        const snap = captureWebcamSnapshot();
        setSnapshotPhoto(snap);
        setScanStatus('unregistered');
        setIsEnrollModalOpen(true);
        isProcessingRef.current = false;
        return;
      }

      // Match against registered faces
      const match = faceMatcherRef.current.findBestMatch(detection.descriptor);

      if (!match || match.label === 'unknown') {
        // Face detected but not recognized → prompt enrollment
        const snap = captureWebcamSnapshot();
        setSnapshotPhoto(snap);
        setScanStatus('unregistered');
        setIsEnrollModalOpen(true);
        isProcessingRef.current = false;
        return;
      }

      // Face recognized!
      const confidence = Math.round((1 - match.distance) * 100);
      const memberId = match.label;
      const member = members.find((m) => m.id === memberId);
      if (!member) {
        isProcessingRef.current = false;
        setScanStatus('scanning');
        return;
      }

      // Check if already checked in
      const alreadyIn = attendances.some(
        (a) => a.targetId === meetingId && a.memberId === member.id
      );

      if (alreadyIn) {
        setMatchedStudent(member);
        setScanStatus('already_checked');
        setIsCooldown(true);
        setTimeout(() => {
          setIsCooldown(false);
          setScanStatus('scanning');
          setMatchedStudent(null);
        }, 2000);
        isProcessingRef.current = false;
        return;
      }

      // NEW check-in!
      const snap = captureWebcamSnapshot();
      handleSuccessMatch(member, confidence, snap);
    } catch (err) {
      console.error('Detection error:', err);
      setScanStatus('scanning');
    } finally {
      isProcessingRef.current = false;
    }
  }, [modelsLoaded, isAttendanceOpen, members, attendances, meetingId, handleSuccessMatch]);

  // Detection loop: run every 500ms when camera is active and scanning
  useEffect(() => {
    if (!cameraActive || !modelsLoaded || scanStatus !== 'scanning' || isCooldown) return;

    const loop = () => {
      runDetection().finally(() => {
        if (!isCooldownRef.current) {
          detectionLoopRef.current = setTimeout(loop, 500);
        }
      });
    };

    detectionLoopRef.current = setTimeout(loop, 300);
    return () => {
      if (detectionLoopRef.current) clearTimeout(detectionLoopRef.current);
    };
  }, [cameraActive, modelsLoaded, scanStatus, isCooldown, runDetection]);

  // =========================================================
  // 5. ENROLLMENT (register new face on-the-fly)
  // =========================================================
  const handleEnrollAndCheckIn = (student: Member) => {
    const snap = captureWebcamSnapshot() || snapshotPhoto || student.avatarUrl;

    // Save live snapshot as their registered face photo
    updateMember(student.id, { avatarUrl: snap });

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

      const newLog: BiometricLog = {
        id: `log-${Date.now()}`,
        studentId: student.id,
        studentName: student.fullName,
        classRoom: student.classRoom,
        nisn: student.nisn,
        confidence: 100,
        timestamp: new Date().toLocaleTimeString('id-ID'),
        snapshotUrl: snap,
        method: 'face_enrollment',
        status: 'baru_didaftarkan',
      };
      setBiometricLogs((prev) => [newLog, ...prev]);
    }

    setIsEnrollModalOpen(false);
    setScanStatus('scanning');
    setIsCooldown(false);
  };

  // =========================================================
  // 6. MANUAL NAME CHECK-IN
  // =========================================================
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
      notes: 'Presensi Manual via Input Nama',
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

  const studentsForEnrollment = members.filter(
    (m) =>
      m.fullName.toLowerCase().includes(enrollSearch.toLowerCase()) ||
      m.nisn.includes(enrollSearch)
  );

  // =========================================================
  // RENDER
  // =========================================================
  return (
    <div className="space-y-6">

      {/* Model loading status banner */}
      {modelsLoading && (
        <div className="p-3.5 rounded-2xl bg-indigo-50 border border-indigo-200 text-indigo-900 text-xs flex items-center gap-2.5">
          <Loader2 className="w-4 h-4 text-indigo-500 animate-spin shrink-0" />
          <div>
            <p className="font-bold">Memuat Model AI Face Recognition...</p>
            <p className="text-[11px] text-indigo-600 mt-0.5">
              Harap tunggu, engine biometrik sedang diinisialisasi (hanya perlu beberapa detik).
            </p>
          </div>
        </div>
      )}

      {modelError && (
        <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-900 text-xs flex items-center gap-2.5">
          <AlertCircle className="w-4 h-4 text-rose-500 shrink-0" />
          <div>
            <p className="font-bold">Error Model AI</p>
            <p className="text-[11px] text-rose-700 mt-0.5">{modelError}</p>
          </div>
        </div>
      )}

      {/* Registered faces info */}
      {modelsLoaded && !isBuilding && (
        <div className="p-3 rounded-2xl bg-emerald-50 border border-emerald-200 text-xs flex items-center gap-2 text-emerald-900">
          <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
          <span className="font-semibold">
            {registeredCount > 0
              ? `${registeredCount} wajah terdaftar terdeteksi dari foto lokal anggota — siap verifikasi real-time.`
              : 'Belum ada foto wajah lokal terdaftar. Upload foto anggota dari perangkat agar face recognition aktif.'}
          </span>
        </div>
      )}

      {isBuilding && (
        <div className="p-3 rounded-2xl bg-amber-50 border border-amber-200 text-xs flex items-center gap-2 text-amber-900">
          <Loader2 className="w-4 h-4 text-amber-600 animate-spin shrink-0" />
          <span className="font-semibold">Membangun database biometrik wajah dari foto anggota...</span>
        </div>
      )}

      {/* Mode Tabs */}
      <div className="flex items-center justify-center sm:justify-start">
        <div className="flex p-1 bg-slate-100 rounded-2xl max-w-md w-full">
          <button
            onClick={() => setMode('face')}
            className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
              mode === 'face' ? 'bg-white text-indigo-700 shadow-xs' : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <Camera className="w-3.5 h-3.5" />
            <span>Scan Wajah (Face AI)</span>
          </button>
          <button
            onClick={() => setMode('name')}
            className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
              mode === 'name' ? 'bg-white text-indigo-700 shadow-xs' : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <Search className="w-3.5 h-3.5" />
            <span>Cari / Input Nama</span>
          </button>
          <button
            onClick={() => setMode('qr')}
            className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
              mode === 'qr' ? 'bg-white text-indigo-700 shadow-xs' : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <QrCode className="w-3.5 h-3.5" />
            <span>Scan KTA / QR</span>
          </button>
        </div>
      </div>

      {/* Warning if attendance closed */}
      {!isAttendanceOpen && (
        <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 text-xs flex items-center gap-2.5">
          <AlertCircle className="w-5 h-5 text-amber-600 shrink-0" />
          <div>
            <p className="font-bold">Presensi Sedang Ditutup</p>
            <p className="text-[11px] text-amber-700 mt-0.5">
              Sesi presensi rapat ini sedang ditutup. Silakan aktifkan status "Absensi Terbuka" pada jadwal rapat.
            </p>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODE 1: FACE AI                                          */}
      {/* ======================================================== */}
      {mode === 'face' && (
        <div className="space-y-6">
          {/* Video Area */}
          <div className="relative rounded-3xl overflow-hidden bg-slate-950 aspect-video max-w-2xl mx-auto shadow-2xl border-2 border-slate-800">
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className={`w-full h-full object-cover ${facingMode === 'user' ? 'transform -scale-x-100' : ''}`}
            />
            <canvas ref={canvasRef} className="hidden" />

            {/* HUD Overlay */}
            <div className="absolute inset-0 pointer-events-none flex flex-col justify-between p-5 sm:p-6">
              {/* Top bar (Clean Glassmorphism) */}
              <div className="flex items-center justify-between text-[11px] text-slate-300 bg-slate-950/60 backdrop-blur-md px-4 py-2 rounded-full border border-white/10 shadow-lg">
                <span className="flex items-center gap-2 font-medium">
                  <span className={`w-2 h-2 rounded-full ${modelsLoaded ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'}`} />
                  <span className="text-white font-semibold">AI Face Scanner</span>
                </span>
                <span className="font-bold">
                  {scanStatus === 'scanning' && <span className="text-slate-300">Siap Memindai</span>}
                  {scanStatus === 'verifying' && <span className="text-cyan-400 animate-pulse">Menganalisis...</span>}
                  {scanStatus === 'matched' && <span className="text-emerald-400">Wajah Terverifikasi</span>}
                  {scanStatus === 'already_checked' && <span className="text-blue-400">Sudah Hadir</span>}
                  {scanStatus === 'unregistered' && <span className="text-amber-300">Wajah Belum Terdaftar</span>}
                  {(scanStatus === 'idle' || scanStatus === 'no_face') && <span className="text-slate-400">Menunggu...</span>}
                </span>
              </div>

              {/* Center oval reticle (Clean & Unobstructed) */}
              <div
                className={`relative w-48 h-60 sm:w-56 sm:h-72 mx-auto rounded-[50%] border-2 transition-all duration-300 flex items-center justify-center ${
                  scanStatus === 'unregistered'
                    ? 'border-amber-400 shadow-[0_0_25px_rgba(251,191,36,0.45)] ring-4 ring-amber-400/20'
                    : scanStatus === 'already_checked'
                    ? 'border-blue-400 shadow-[0_0_25px_rgba(96,165,250,0.45)] ring-4 ring-blue-400/20'
                    : scanStatus === 'matched'
                    ? 'border-emerald-400 shadow-[0_0_30px_rgba(52,211,153,0.6)] ring-4 ring-emerald-400/20'
                    : scanStatus === 'verifying'
                    ? 'border-cyan-400 shadow-[0_0_25px_rgba(34,211,238,0.5)] ring-2 ring-cyan-400/20'
                    : 'border-dashed border-indigo-400/70 shadow-[0_0_20px_rgba(99,102,241,0.25)]'
                }`}
              >
                {/* Scanning laser sweep */}
                {scanStatus === 'scanning' && (
                  <div className="absolute inset-x-4 h-0.5 bg-gradient-to-r from-transparent via-cyan-400 to-transparent shadow-[0_0_12px_#22d3ee] animate-bounce" />
                )}

                {/* Verifying subtle pill */}
                {scanStatus === 'verifying' && (
                  <div className="absolute bottom-4 px-3 py-1 rounded-full bg-slate-900/80 backdrop-blur-md text-cyan-300 text-[11px] font-semibold flex items-center gap-1.5 border border-cyan-500/30 animate-in fade-in-50">
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Menganalisis wajah...</span>
                  </div>
                )}

                {/* Matched sleek bottom card */}
                {scanStatus === 'matched' && matchedStudent && (
                  <div className="absolute bottom-3 inset-x-3 bg-emerald-600/90 backdrop-blur-md text-white p-2.5 rounded-2xl text-center shadow-xl border border-emerald-400/40 animate-in slide-in-from-bottom-2">
                    <div className="flex items-center justify-center gap-1.5 text-xs font-black">
                      <CheckCircle2 className="w-4 h-4 text-emerald-200 shrink-0" />
                      <span className="truncate">{matchedStudent.fullName}</span>
                    </div>
                    <p className="text-[10px] text-emerald-100 mt-0.5 font-medium">
                      {matchedStudent.classRoom} • {matchConfidence}% Cocok • Hadir
                    </p>
                  </div>
                )}

                {/* Already checked bottom pill */}
                {scanStatus === 'already_checked' && matchedStudent && (
                  <div className="absolute bottom-3 inset-x-3 bg-blue-600/90 backdrop-blur-md text-white p-2 rounded-2xl text-center shadow-xl border border-blue-400/40 animate-in slide-in-from-bottom-2">
                    <div className="flex items-center justify-center gap-1.5 text-xs font-black">
                      <Info className="w-3.5 h-3.5 text-blue-200 shrink-0" />
                      <span className="truncate">{matchedStudent.fullName}</span>
                    </div>
                    <p className="text-[10px] text-blue-100 mt-0.5">Sudah presensi sebelumnya</p>
                  </div>
                )}

                {/* Unregistered floating pill (Minimal & Face is 100% visible) */}
                {scanStatus === 'unregistered' && (
                  <div className="absolute bottom-4 px-3.5 py-1.5 rounded-full bg-amber-500/90 backdrop-blur-md text-white text-[11px] font-bold flex items-center gap-1.5 shadow-lg border border-amber-300/40 animate-in zoom-in-95">
                    <AlertCircle className="w-3.5 h-3.5 text-amber-100" />
                    <span>Wajah Baru Terdeteksi</span>
                  </div>
                )}
              </div>

              {/* Bottom hint */}
              <div className="text-center bg-slate-950/70 backdrop-blur-md py-2 px-4 rounded-xl border border-white/10 max-w-md mx-auto">
                {scanStatus === 'unregistered' ? (
                  <p className="text-xs font-semibold text-amber-300">
                    Wajah belum terdaftar. Pilih nama Anda di bawah untuk mendaftar & hadir.
                  </p>
                ) : scanStatus === 'matched' ? (
                  <p className="text-xs font-semibold text-emerald-300">
                    Presensi berhasil dicatat!
                  </p>
                ) : scanStatus === 'already_checked' ? (
                  <p className="text-xs font-semibold text-blue-300">
                    Kehadiran Anda sudah tercatat sebelumnya.
                  </p>
                ) : (
                  <p className="text-xs text-slate-300">
                    Posisikan wajah Anda di dalam bingkai oval
                  </p>
                )}
              </div>
            </div>

            {/* Camera error overlay */}
            {cameraError && (
              <div className="absolute inset-0 bg-slate-900/95 flex flex-col items-center justify-center p-6 text-center text-white space-y-3">
                <CameraOff className="w-10 h-10 text-rose-500" />
                <p className="text-xs text-slate-300 max-w-sm">{cameraError}</p>
                <div className="flex gap-2">
                  <button
                    onClick={startCamera}
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

            {/* Models loading overlay */}
            {modelsLoading && (
              <div className="absolute inset-0 bg-slate-900/95 flex flex-col items-center justify-center p-6 text-center text-white space-y-3">
                <Loader2 className="w-10 h-10 text-indigo-400 animate-spin" />
                <p className="text-xs text-slate-300">Memuat model AI face recognition...</p>
              </div>
            )}
          </div>

          {/* Enrollment Card (Compact & Clean) */}
          {isEnrollModalOpen && (
            <div className="max-w-2xl mx-auto bg-amber-50/90 border border-amber-300 rounded-3xl p-4 shadow-lg animate-in slide-in-from-bottom-3 backdrop-blur-sm">
              <div className="flex items-center justify-between gap-3 pb-3 border-b border-amber-200/60">
                <div className="flex items-center gap-3 min-w-0">
                  {snapshotPhoto ? (
                    <img
                      src={snapshotPhoto}
                      alt="Snapshot"
                      className="w-11 h-11 rounded-xl object-cover border-2 border-amber-400 shrink-0 shadow-xs"
                    />
                  ) : (
                    <div className="w-11 h-11 rounded-xl bg-amber-500 text-white flex items-center justify-center shrink-0">
                      <UserPlus className="w-5 h-5" />
                    </div>
                  )}
                  <div className="min-w-0">
                    <h3 className="text-xs font-black text-amber-950 truncate">Kaitkan Wajah Baru dengan Nama</h3>
                    <p className="text-[11px] text-amber-800 mt-0.5">
                      Pilih nama Anda untuk mendaftar biometrik & langsung presensi hadir
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => {
                    setIsEnrollModalOpen(false);
                    setScanStatus('scanning');
                    setIsCooldown(false);
                  }}
                  className="p-1 text-amber-700 hover:text-amber-950 rounded-lg cursor-pointer shrink-0"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="mt-3 space-y-2">
                <div className="relative">
                  <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={enrollSearch}
                    onChange={(e) => setEnrollSearch(e.target.value)}
                    placeholder="Ketik nama atau NISN Anda..."
                    className="w-full pl-9 pr-3 py-2 bg-white border border-amber-200 rounded-xl text-xs outline-none text-slate-800 focus:ring-2 focus:ring-amber-500 shadow-2xs"
                    autoFocus
                  />
                </div>
                <div className="max-h-40 overflow-y-auto space-y-1.5 pr-1">
                  {studentsForEnrollment.slice(0, 6).map((student) => (
                    <div
                      key={student.id}
                      className="p-2.5 bg-white rounded-xl border border-amber-100 flex items-center justify-between hover:border-amber-400 transition-all"
                    >
                      <div>
                        <span className="font-bold text-xs text-slate-900 block">{student.fullName}</span>
                        <span className="text-[10px] text-slate-500">
                          {student.classRoom} • NISN: {student.nisn}
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


        </div>
      )}

      {/* ======================================================== */}
      {/* MODE 2: CARI NAMA                                        */}
      {/* ======================================================== */}
      {mode === 'name' && (
        <div className="space-y-4 max-w-xl mx-auto">
          <div className="p-4 rounded-2xl bg-indigo-50/60 border border-indigo-100 text-xs text-indigo-950">
            <p className="font-bold flex items-center gap-1.5">
              <Zap className="w-4 h-4 text-indigo-600" />
              Pencarian Cepat Nama Siswa
            </p>
            <p className="text-[11px] text-indigo-700 mt-0.5">
              Ketik nama atau NISN untuk mencatat kehadiran dalam 1 klik.
            </p>
          </div>

          <div className="flex items-center gap-2.5 px-4 py-2.5 bg-white rounded-2xl border border-slate-200/80 shadow-2xs">
            <Search className="w-4 h-4 text-slate-400 shrink-0" />
            <input
              type="text"
              value={nameSearch}
              onChange={(e) => setNameSearch(e.target.value)}
              placeholder="Ketik nama atau NISN siswa..."
              className="w-full text-xs outline-none text-slate-800 placeholder:text-slate-400"
              autoFocus
            />
          </div>

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
                    {student.avatarUrl ? (
                      <img
                        src={student.avatarUrl}
                        alt={student.fullName}
                        className="w-10 h-10 rounded-xl object-cover border border-slate-200"
                      />
                    ) : (
                      <div className="w-10 h-10 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center">
                        <User className="w-4 h-4 text-slate-400" />
                      </div>
                    )}
                    <div>
                      <h4 className="text-xs font-bold text-slate-900 leading-tight">{student.fullName}</h4>
                      <p className="text-[11px] text-slate-500">
                        {student.classRoom} • {student.major}
                      </p>
                      <span className="text-[10px] text-slate-400 font-mono">NISN: {student.nisn}</span>
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
      {/* MODE 3: SCAN KTA / QR                                    */}
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
                Arahkan barcode/QR pada KTA ke kamera, atau masukkan NISN secara manual.
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

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
  User,
  Zap,
  UserPlus,
  Clock,
  Check,
  X,
  Info,
  Loader2,
  ShieldCheck,
  RefreshCw,
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
  method: 'biometric_ai' | 'face_enrollment' | 'manual_name';
  status: 'sukses' | 'duplikat' | 'baru_didaftarkan';
}

interface FaceRecognitionScannerProps {
  meetingId: string;
  meetingTitle: string;
  isAttendanceOpen: boolean;
}

// Models path (served from /public/models/)
const MODEL_URL = `${import.meta.env.BASE_URL.replace(/\/$/, '')}/models`;

export const FaceRecognitionScanner: React.FC<FaceRecognitionScannerProps> = ({
  meetingId,
  meetingTitle,
  isAttendanceOpen,
}) => {
  const { members, updateMember, recordAttendance, attendances, showToast } = useApp();

  const [mode, setMode] = useState<'face' | 'name'>('face');
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

  const toggleFacingMode = () => {
    setFacingMode((prev) => (prev === 'user' ? 'environment' : 'user'));
  };

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
  // Build token: setiap build baru dapat token unik; build lama yang masih berjalan
  // akan memeriksa token setelah setiap operasi async dan membatalkan diri jika sudah usang.
  const buildTokenRef = useRef<number>(0);
  const unknownStreakRef = useRef<number>(0);

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
        // Pastikan TensorFlow.js backend sudah siap dengan fallback CPU jika WebGL tidak didukung
        const tf = faceapi.tf as any;
        if (tf) {
          try {
            await tf.setBackend?.('webgl');
          } catch {
            try {
              await tf.setBackend?.('cpu');
            } catch (e) {
              console.warn('Backend setup fallback warning:', e);
            }
          }
          await tf.ready?.();
        }
        await Promise.all([
          faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL),
          faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL),
          faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_URL),
        ]);
        setModelsLoaded(true);
      } catch (err) {
        console.error('Failed to load face-api models:', err);
        setModelError(
          `Gagal memuat model AI wajah. Pastikan file model ada di /public/models/. Error: ${err instanceof Error ? err.message : String(err)}`
        );
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

    // Dapatkan token unik untuk build ini. Build lama akan membatalkan diri
    // jika token berubah (artinya ada build baru yang lebih baru dimulai).
    const myToken = ++buildTokenRef.current;

    // Langsung bersihkan matcher lama agar tidak ada wajah usang yang terdeteksi
    // selama proses rebuild berlangsung.
    faceMatcherRef.current = null;

    // Only process members who have a data: URL (photo uploaded from device)
    const membersWithPhoto = members.filter(
      (m) => m.avatarUrl && (m.avatarUrl.startsWith('data:') || m.avatarUrl.startsWith('blob:'))
    );

    if (membersWithPhoto.length === 0) {
      setRegisteredCount(0);
      setIsBuilding(false);
      return;
    }

    setIsBuilding(true);
    const labeledDescriptors: faceapi.LabeledFaceDescriptors[] = [];

    for (const member of membersWithPhoto) {
      // Batalkan build ini jika sudah ada build yang lebih baru
      if (myToken !== buildTokenRef.current) {
        return;
      }
      try {
        // Create an image element from the data URL
        const img = await new Promise<HTMLImageElement>((resolve, reject) => {
          const el = document.createElement('img');
          el.crossOrigin = 'anonymous';
          el.onload = () => resolve(el);
          el.onerror = reject;
          el.src = member.avatarUrl!;
        });

        // Cek lagi setelah operasi async (image load)
        if (myToken !== buildTokenRef.current) return;

        const detection = await faceapi
          .detectSingleFace(img, new faceapi.TinyFaceDetectorOptions({ inputSize: 224, scoreThreshold: 0.25 }))
          .withFaceLandmarks()
          .withFaceDescriptor();

        // Cek lagi setelah operasi async (face detection)
        if (myToken !== buildTokenRef.current) return;

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

    // Cek final sebelum set matcher — pastikan ini masih build yang valid
    if (myToken !== buildTokenRef.current) return;

    if (labeledDescriptors.length > 0) {
      // Standar balanced Euclidean distance face-api: 0.58
      // Mencegah mismatch sekaligus toleran terhadap variasi pencahayaan, jarak & ekspresi wajah
      const distanceThreshold = 0.58;
      faceMatcherRef.current = new faceapi.FaceMatcher(labeledDescriptors, distanceThreshold);
      setRegisteredCount(labeledDescriptors.length);
    } else {
      faceMatcherRef.current = null;
      setRegisteredCount(0);
    }

    setIsBuilding(false);
  }, [modelsLoaded, members]);

  // Rebuild matcher when models loaded or members change
  useEffect(() => {
    buildFaceMatcher();
  }, [buildFaceMatcher]);

  // =========================================================
  // 3. CAMERA
  // =========================================================
  const captureWebcamSnapshot = (): string => {
    if (videoRef.current) {
      const video = videoRef.current;
      const offscreenCanvas = document.createElement('canvas');
      offscreenCanvas.width = video.videoWidth || 480;
      offscreenCanvas.height = video.videoHeight || 360;
      const ctx = offscreenCanvas.getContext('2d');
      if (ctx) {
        ctx.save();
        if (facingMode === 'user') {
          ctx.translate(offscreenCanvas.width, 0);
          ctx.scale(-1, 1);
        }
        ctx.drawImage(video, 0, 0, offscreenCanvas.width, offscreenCanvas.height);
        ctx.restore();
        return offscreenCanvas.toDataURL('image/jpeg', 0.85);
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
      setScanStatus('scanning'); // langsung set scanning agar loop bisa mulai saat model ready
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
    // Kamera langsung nyala saat mode face & presensi terbuka
    // Tidak perlu tunggu model loaded — deteksi akan jalan otomatis setelah model siap
    if (mode === 'face' && isAttendanceOpen) {
      startCamera();
    } else {
      stopCamera();
    }
    return () => stopCamera();
  }, [mode, isAttendanceOpen, facingMode]);

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
      isEnrollModalOpen ||
      !isAttendanceOpen
    )
      return;

    const video = videoRef.current;
    if (video.readyState < 2 || !video.videoWidth || !video.videoHeight) return; // video not ready or dimensions not initialized

    isProcessingRef.current = true;
    try {
      // TinyFaceDetector dengan inputSize 224 konsisten dengan pembuatan deskriptor
      const detection = await faceapi
        .detectSingleFace(video, new faceapi.TinyFaceDetectorOptions({ inputSize: 224, scoreThreshold: 0.25 }))
        .withFaceLandmarks()
        .withFaceDescriptor();

      if (!detection) {
        // Tidak ada wajah dalam frame — reset streak dan pertahankan status scanning
        unknownStreakRef.current = 0;
        setScanStatus((prev) => (prev === 'verifying' ? 'scanning' : prev));
        return;
      }

      // Wajah terdeteksi — pindah ke status menganalisis
      setScanStatus('verifying');

      if (!faceMatcherRef.current) {
        // Belum ada data wajah terdaftar di database
        unknownStreakRef.current += 1;
        if (unknownStreakRef.current >= 4) {
          const snap = captureWebcamSnapshot();
          setSnapshotPhoto(snap);
          setScanStatus('unregistered');
          setIsEnrollModalOpen(true);
        }
        return;
      }

      // Cocokkan terhadap database biometrik wajah
      const match = faceMatcherRef.current.findBestMatch(detection.descriptor);

      if (!match || match.label === 'unknown') {
        // Wajah belum cocok: akumulasikan streak agar tidak freeze akibat noise 1 frame
        unknownStreakRef.current += 1;
        if (unknownStreakRef.current >= 4) {
          const snap = captureWebcamSnapshot();
          setSnapshotPhoto(snap);
          setScanStatus('unregistered');
          setIsEnrollModalOpen(true);
        }
        return;
      }

      // Wajah dikenali! Reset streak
      unknownStreakRef.current = 0;
      const confidence = Math.round((1 - match.distance) * 100);
      const memberId = match.label;
      const member = members.find((m) => m.id === memberId);
      if (!member) {
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
  }, [modelsLoaded, isAttendanceOpen, isEnrollModalOpen, members, attendances, meetingId, handleSuccessMatch]);

  // Detection loop: berjalan kontinu tanpa terputus saat status transisi scanning -> verifying
  useEffect(() => {
    if (!cameraActive || !modelsLoaded || isCooldown || isEnrollModalOpen) return;

    let isSubscribed = true;
    const loop = () => {
      runDetection().finally(() => {
        if (isSubscribed && !isCooldownRef.current) {
          detectionLoopRef.current = setTimeout(loop, 350);
        }
      });
    };

    detectionLoopRef.current = setTimeout(loop, 250);
    return () => {
      isSubscribed = false;
      if (detectionLoopRef.current) clearTimeout(detectionLoopRef.current);
    };
  }, [cameraActive, modelsLoaded, isCooldown, isEnrollModalOpen, runDetection]);

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
    unknownStreakRef.current = 0;
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
    <div className="space-y-2.5 sm:space-y-4">

      {/* Model loading status banner */}
      {modelsLoading && (
        <div className="p-2.5 sm:p-3 rounded-xl sm:rounded-2xl bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-800/60 text-indigo-900 dark:text-indigo-200 text-xs flex items-center gap-2">
          <Loader2 className="w-4 h-4 text-indigo-500 animate-spin shrink-0" />
          <div className="min-w-0">
            <p className="font-bold truncate">Memuat Model AI Face Recognition...</p>
            <p className="text-[10px] sm:text-[11px] text-indigo-600 dark:text-indigo-300 mt-0.5 hidden xs:block">
              Harap tunggu, engine biometrik sedang diinisialisasi.
            </p>
          </div>
        </div>
      )}

      {modelError && (
        <div className="p-2.5 sm:p-3 rounded-xl sm:rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800/60 text-rose-900 dark:text-rose-200 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-rose-500 shrink-0" />
          <div className="min-w-0">
            <p className="font-bold">Error Model AI</p>
            <p className="text-[10px] sm:text-[11px] text-rose-700 dark:text-rose-300 mt-0.5">{modelError}</p>
          </div>
        </div>
      )}

      {/* Registered faces info - Compact 1-line strip */}
      {modelsLoaded && !isBuilding && (
        <div className="px-3 py-1.5 sm:py-2 rounded-xl sm:rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60 text-[11px] sm:text-xs flex items-center justify-between gap-2 text-emerald-900 dark:text-emerald-200">
          <div className="flex items-center gap-1.5 sm:gap-2 min-w-0">
            <ShieldCheck className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
            <span className="font-semibold truncate">
              {registeredCount > 0
                ? `${registeredCount} wajah terdaftar (Biometrik Siap)`
                : 'Belum ada foto wajah lokal terdaftar'}
            </span>
          </div>
          <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-emerald-200/60 dark:bg-emerald-800/60 shrink-0">
            AI Aktif
          </span>
        </div>
      )}

      {isBuilding && (
        <div className="p-2.5 sm:p-3 rounded-xl sm:rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/60 text-xs flex items-center gap-2 text-amber-900 dark:text-amber-200">
          <Loader2 className="w-4 h-4 text-amber-600 animate-spin shrink-0" />
          <span className="font-semibold text-[11px] sm:text-xs">Membangun database biometrik wajah...</span>
        </div>
      )}

      {/* Mode Tabs (Sleek SIMO Design System) */}
      <div className="flex items-center justify-center sm:justify-start">
        <div className="grid grid-cols-2 p-1 bg-[#FAF6EE] dark:bg-[#0E1B2C] border border-[#E6DFD0] dark:border-[#283D56] rounded-xl sm:rounded-2xl w-full max-w-md">
          <button
            onClick={() => setMode('face')}
            className={`py-1.5 sm:py-2 px-1 text-[11px] sm:text-xs font-bold rounded-lg sm:rounded-xl transition-all flex items-center justify-center gap-1 sm:gap-1.5 cursor-pointer ${
              mode === 'face'
                ? 'bg-[#1F3A5F] text-[#FAF6EE] shadow-xs'
                : 'text-[#5A6472] dark:text-[#9AA8B8] hover:text-[#1F3A5F] dark:hover:text-[#FAF6EE]'
            }`}
          >
            <Camera className="w-3.5 h-3.5 shrink-0" />
            <span className="truncate">Scan Wajah</span>
          </button>
          <button
            onClick={() => setMode('name')}
            className={`py-1.5 sm:py-2 px-1 text-[11px] sm:text-xs font-bold rounded-lg sm:rounded-xl transition-all flex items-center justify-center gap-1 sm:gap-1.5 cursor-pointer ${
              mode === 'name'
                ? 'bg-[#1F3A5F] text-[#FAF6EE] shadow-xs'
                : 'text-[#5A6472] dark:text-[#9AA8B8] hover:text-[#1F3A5F] dark:hover:text-[#FAF6EE]'
            }`}
          >
            <Search className="w-3.5 h-3.5 shrink-0" />
            <span className="truncate">Cari Nama</span>
          </button>
        </div>
      </div>

      {/* Warning if attendance closed */}
      {!isAttendanceOpen && (
        <div className="p-3 sm:p-4 rounded-xl sm:rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/60 text-amber-900 dark:text-amber-200 text-xs flex items-center gap-2.5">
          <AlertCircle className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0" />
          <div>
            <p className="font-bold">Presensi Sedang Ditutup</p>
            <p className="text-[10px] sm:text-[11px] text-amber-700 dark:text-amber-300 mt-0.5">
              Sesi presensi rapat ini sedang ditutup. Klik "Buka Sesi" pada bar jadwal agenda rapat.
            </p>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODE 1: FACE AI                                          */}
      {/* ======================================================== */}
      {mode === 'face' && (
        <div className="space-y-3 sm:space-y-4">
          {/* Video Area */}
          <div className="relative rounded-2xl sm:rounded-3xl overflow-hidden bg-slate-950 aspect-[4/5] sm:aspect-[16/10] min-h-[380px] max-h-[58vh] sm:max-h-[500px] max-w-2xl mx-auto shadow-2xl border-2 border-slate-800">
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className={`w-full h-full object-cover ${facingMode === 'user' ? 'transform -scale-x-100' : ''}`}
            />
            <canvas ref={canvasRef} className="hidden" />

            {/* HUD Overlay */}
            <div className="absolute inset-0 pointer-events-none flex flex-col justify-between p-3 sm:p-5 md:p-6 z-10">
              {/* Top bar (Clean Glassmorphism) */}
              <div className="flex items-center justify-between text-[10px] sm:text-[11px] text-slate-300 bg-slate-950/75 backdrop-blur-md px-3 sm:px-4 py-1.5 sm:py-2 rounded-full border border-white/10 shadow-lg shrink-0">
                <span className="flex items-center gap-1.5 sm:gap-2 font-medium">
                  <span className={`w-2 h-2 rounded-full ${modelsLoaded ? 'bg-emerald-400 animate-pulse' : modelsLoading ? 'bg-amber-400 animate-pulse' : 'bg-rose-400'}`} />
                  <span className="text-white font-semibold">AI Face Scanner</span>
                </span>
                
                <div className="flex items-center gap-1.5 sm:gap-2">
                  <span className="font-bold">
                    {modelsLoading && <span className="text-amber-300 animate-pulse">Memuat...</span>}
                    {!modelsLoading && !modelsLoaded && <span className="text-rose-400">Gagal Dimuat</span>}
                    {modelsLoaded && scanStatus === 'scanning' && <span className="text-slate-300">Siap</span>}
                    {modelsLoaded && scanStatus === 'verifying' && <span className="text-cyan-400 animate-pulse">Menganalisis...</span>}
                    {modelsLoaded && scanStatus === 'matched' && <span className="text-emerald-400">Terverifikasi</span>}
                    {modelsLoaded && scanStatus === 'already_checked' && <span className="text-blue-400">Sudah Hadir</span>}
                    {modelsLoaded && scanStatus === 'unregistered' && (
                      <span className="text-amber-300 flex items-center gap-1 font-bold">
                        <AlertCircle className="w-3 h-3 text-amber-400 inline shrink-0" />
                        Belum Terdaftar
                      </span>
                    )}
                    {modelsLoaded && (scanStatus === 'idle' || scanStatus === 'no_face') && <span className="text-slate-400">Menunggu...</span>}
                  </span>

                  {/* Switch Camera Button (Front/Back) */}
                  <button
                    type="button"
                    onClick={toggleFacingMode}
                    className="pointer-events-auto p-1 px-1.5 sm:px-2 rounded-full bg-white/10 hover:bg-white/20 active:scale-95 text-white transition-all flex items-center gap-1 text-[10px] font-bold border border-white/15 cursor-pointer shadow-xs"
                    title="Ganti Kamera Depan / Belakang"
                  >
                    <RefreshCw className="w-3 h-3" />
                    <span className="hidden sm:inline">{facingMode === 'user' ? 'Depan' : 'Belakang'}</span>
                  </button>
                </div>
              </div>

              {/* Center Biometric Face Reticle - Dihilangkan, hanya laser scan sweep */}
              <div className="relative my-auto flex items-center justify-center py-2 sm:py-3">
                <div
                  className="relative w-32 h-44 sm:w-36 sm:h-48 md:w-36 md:h-48 mx-auto transition-all duration-300 flex items-center justify-center"
                >
                  {/* Smooth Laser Scan Sweep */}
                  {scanStatus === 'scanning' && (
                    <div className="absolute inset-x-2 h-0.5 bg-gradient-to-r from-transparent via-cyan-400 to-transparent shadow-[0_0_12px_#22d3ee] animate-scan-laser pointer-events-none" />
                  )}
                </div>
              </div>

              {/* Bottom Dedicated Status & Identification Dock - Selalu Tampil Jelas & Tidak Tenggelam */}
              <div className="shrink-0 w-full max-w-sm sm:max-w-md mx-auto z-20">
                {scanStatus === 'matched' && matchedStudent ? (
                  <div className="bg-emerald-600/95 dark:bg-emerald-700/95 backdrop-blur-md text-white py-2 px-3.5 rounded-2xl text-center shadow-2xl border border-emerald-400/50 animate-in slide-in-from-bottom-2">
                    <div className="flex items-center justify-center gap-1.5 font-black text-xs sm:text-sm">
                      <CheckCircle2 className="w-4 h-4 text-emerald-200 shrink-0" />
                      <span className="truncate">{matchedStudent.fullName}</span>
                      <span className="text-[10px] bg-white/20 px-2 py-0.5 rounded-full font-bold shrink-0">{matchedStudent.classRoom}</span>
                    </div>
                    <p className="text-[10px] sm:text-[11px] text-emerald-100 font-semibold mt-0.5">
                      Presensi Berhasil Dicatat • {matchConfidence}% Cocok
                    </p>
                  </div>
                ) : scanStatus === 'already_checked' && matchedStudent ? (
                  <div className="bg-blue-600/95 backdrop-blur-md text-white py-2 px-3.5 rounded-2xl text-center shadow-2xl border border-blue-400/50 animate-in slide-in-from-bottom-2">
                    <div className="flex items-center justify-center gap-1.5 font-bold text-xs sm:text-sm">
                      <Info className="w-4 h-4 text-blue-200 shrink-0" />
                      <span className="truncate">{matchedStudent.fullName}</span>
                      <span className="text-[10px] bg-white/20 px-2 py-0.5 rounded-full font-bold shrink-0">{matchedStudent.classRoom}</span>
                    </div>
                    <p className="text-[10px] text-blue-100 mt-0.5 font-medium">Sudah presensi hadir pada agenda ini</p>
                  </div>
                ) : scanStatus === 'verifying' ? (
                  <div className="bg-slate-900/90 backdrop-blur-md text-cyan-300 py-1.5 px-4 rounded-full text-center border border-cyan-500/40 shadow-lg text-[11px] font-bold flex items-center justify-center gap-2 mx-auto w-fit animate-in fade-in-50">
                    <Loader2 className="w-3.5 h-3.5 animate-spin text-cyan-400" />
                    <span>Menganalisis biometrik wajah...</span>
                  </div>
                ) : scanStatus === 'unregistered' ? (
                  <div className="bg-amber-500/90 backdrop-blur-md text-white py-1.5 px-4 rounded-full text-center border border-amber-400/50 shadow-lg text-[11px] font-bold flex items-center justify-center gap-1.5 mx-auto w-fit animate-in fade-in-50">
                    <AlertCircle className="w-3.5 h-3.5 text-amber-200 shrink-0" />
                    <span>Wajah Belum Terdaftar di Sistem</span>
                  </div>
                ) : (
                  <div className="bg-slate-950/80 backdrop-blur-md py-1.5 px-3.5 rounded-full border border-white/10 text-center text-slate-300 text-[10px] sm:text-[11px] font-medium max-w-xs mx-auto shadow-md">
                    Posisikan wajah Anda di depan kamera
                  </div>
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
              <div className="absolute inset-0 bg-slate-900/70 backdrop-blur-sm flex flex-col items-center justify-center p-6 text-center text-white space-y-3">
                <Loader2 className="w-10 h-10 text-indigo-400 animate-spin" />
                <div>
                  <p className="text-sm font-bold text-white">Memuat Model AI...</p>
                  <p className="text-xs text-slate-300 mt-1">Harap tunggu, ini hanya perlu beberapa detik</p>
                </div>
              </div>
            )}
          </div>

          {/* Enrollment Card (Compact & Clean) */}
          {isEnrollModalOpen && (
            <div className="max-w-2xl mx-auto bg-amber-50/90 border border-amber-300 rounded-2xl sm:rounded-3xl p-3 sm:p-4 shadow-lg animate-in slide-in-from-bottom-3 backdrop-blur-sm">
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
                    unknownStreakRef.current = 0;
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
                        className="px-2.5 sm:px-3 py-1.5 bg-amber-600 hover:bg-amber-500 text-white rounded-lg text-[11px] sm:text-xs font-bold shadow-xs cursor-pointer flex items-center gap-1 shrink-0 whitespace-nowrap"
                      >
                        <Check className="w-3.5 h-3.5 shrink-0" />
                        <span className="hidden sm:inline">Kaitkan & Hadir</span>
                        <span className="sm:hidden">Hadir</span>
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
        <div className="space-y-3 sm:space-y-4 max-w-xl mx-auto">
          <div className="p-3 sm:p-4 rounded-xl sm:rounded-2xl bg-[#E4EAF2] dark:bg-[#1F3A5F]/30 border border-[#E6DFD0] dark:border-[#283D56] text-xs text-[#1F3A5F] dark:text-[#E4EAF2]">
            <p className="font-bold flex items-center gap-1.5">
              <Zap className="w-4 h-4 text-[#F2B544]" />
              Pencarian Cepat Nama Siswa
            </p>
            <p className="text-[11px] text-[#5A6472] dark:text-[#9AA8B8] mt-0.5">
              Ketik nama atau NISN untuk mencatat kehadiran dalam 1 klik.
            </p>
          </div>

          <div className="flex items-center gap-2.5 px-3.5 py-2 bg-white dark:bg-[#17293E] rounded-xl sm:rounded-2xl border border-[#E6DFD0] dark:border-[#283D56] shadow-2xs">
            <Search className="w-4 h-4 text-slate-400 shrink-0" />
            <input
              type="text"
              value={nameSearch}
              onChange={(e) => setNameSearch(e.target.value)}
              placeholder="Ketik nama atau NISN siswa..."
              className="w-full text-xs outline-none bg-transparent text-slate-800 dark:text-[#FAF6EE] placeholder:text-slate-400 dark:placeholder:text-[#9AA8B8]"
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
                  className="p-3 sm:p-3.5 bg-white dark:bg-[#17293E] rounded-xl sm:rounded-2xl border border-[#E6DFD0] dark:border-[#283D56] shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 hover:border-[#1F3A5F] dark:hover:border-[#F2B544] transition-all"
                >
                  <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
                    {student.avatarUrl ? (
                      <img
                        src={student.avatarUrl}
                        alt={student.fullName}
                        className="w-10 h-10 rounded-xl object-cover border border-[#E6DFD0] dark:border-[#283D56]"
                      />
                    ) : (
                      <div className="w-10 h-10 rounded-xl bg-[#FAF6EE] dark:bg-[#0E1B2C] border border-[#E6DFD0] dark:border-[#283D56] flex items-center justify-center">
                        <User className="w-4 h-4 text-slate-400" />
                      </div>
                    )}
                    <div>
                      <h4 className="text-xs font-bold text-[#1F3A5F] dark:text-[#FAF6EE] leading-tight">{student.fullName}</h4>
                      <p className="text-[11px] text-[#5A6472] dark:text-[#9AA8B8]">
                        {student.classRoom} • {student.major}
                      </p>
                      <span className="text-[10px] text-slate-400 font-mono">NISN: {student.nisn}</span>
                    </div>
                  </div>

                  {alreadyPresent ? (
                    <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 dark:bg-emerald-950/40 dark:text-emerald-300 px-2.5 py-1 rounded-full shrink-0 self-end sm:self-auto">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      Sudah Hadir
                    </span>
                  ) : (
                    <button
                      onClick={() => handleNameCheckIn(student)}
                      disabled={!isAttendanceOpen}
                      className="px-3 sm:px-3.5 py-1.5 simo-btn-primary disabled:opacity-50 text-xs font-bold rounded-xl shadow-xs cursor-pointer flex items-center gap-1.5 shrink-0 self-end sm:self-auto"
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

    </div>
  );
};

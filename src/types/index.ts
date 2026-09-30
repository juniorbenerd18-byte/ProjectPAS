export type UserRole = 'admin' | 'pembina' | 'ketua' | 'bendahara' | 'sekretaris' | 'koordinator_sekbid' | 'anggota';

export interface Division {
  id: string;
  name: string;
  code: string;
  description: string;
  leaderId?: string;
  leaderName?: string;
  icon?: string;
}

export interface Position {
  id: string;
  name: string;
  level: number;
  description: string;
}

export interface Member {
  id: string;
  nisn: string;
  fullName: string;
  email: string;
  role: UserRole;
  grade: 'X' | 'XI' | 'XII';
  classRoom: string; // e.g., 'RPL 1', 'TKJ 2'
  major: string; // e.g., 'Rekayasa Perangkat Lunak'
  divisionId?: string;
  divisionName?: string;
  position: string;
  phone: string;
  avatarUrl: string;
  isActive: boolean;
  status: 'aktif' | 'alumni';
  joinDate: string;
  generation: string; // e.g., 'Angkatan 2024/2025'
  alumniYear?: string;
}

export type CommitteeSection =
  | 'Ketua Pelaksana'
  | 'Seksi Acara'
  | 'Seksi Perlengkapan'
  | 'Seksi Konsumsi'
  | 'Seksi Pubdok'
  | 'Seksi Humas'
  | 'Seksi Keamanan'
  | 'Lainnya';

export interface ProkerTask {
  id: string;
  title: string;
  assignedMemberId?: string;
  assignedMemberName?: string;
  section: CommitteeSection;
  isCompleted: boolean;
  dueDate?: string;
}

export interface WorkProgram {
  id: string;
  divisionId: string;
  divisionName: string;
  title: string;
  description: string;
  estimatedBudget: number;
  targetDate: string;
  status: 'draft' | 'diajukan' | 'disetujui' | 'ditolak' | 'berjalan' | 'selesai';
  progressPercent: number;
  proposalUrl?: string;
  lpjUrl?: string;
  evaluation?: string;
  createdAt: string;
  tasks?: ProkerTask[];
}

export interface EventItem {
  id: string;
  workProgramId?: string;
  workProgramTitle?: string;
  title: string;
  description: string;
  eventDate: string;
  startTime: string;
  endTime: string;
  location: string;
  status: 'mendatang' | 'selesai';
  documentationPhotos: string[];
  qrToken: string;
}

export interface Meeting {
  id: string;
  title: string;
  description: string;
  meetingDate: string;
  startTime: string;
  endTime: string;
  location: string;
  type: 'koordinasi' | 'evaluasi' | 'pleno' | 'rutin';
  qrToken: string;
  isAttendanceOpen: boolean;
  notulen?: string;
  decisions?: string[];
}

export interface AttendanceRecord {
  id: string;
  targetType: 'rapat' | 'kegiatan';
  targetId: string;
  targetTitle: string;
  memberId: string;
  memberName: string;
  nisn: string;
  grade: string;
  major: string;
  status: 'hadir' | 'izin' | 'sakit' | 'alpa';
  checkInTime: string;
  notes?: string;
}

export interface CashTransaction {
  id: string;
  type: 'pemasukan' | 'pengeluaran';
  category: 'iuran_kas' | 'dana_sekolah' | 'sponsor' | 'logistik' | 'konsumsi' | 'atk' | 'kegiatan' | 'lainnya';
  amount: number;
  transactionDate: string;
  description: string;
  proofUrl?: string;
  recordedBy: string;
  referenceId?: string;
}

export interface MemberDue {
  id: string;
  memberId: string;
  memberName: string;
  nisn: string;
  periodMonth: number; // 1-12
  periodYear: number;
  amount: number;
  status: 'belum_lunas' | 'menunggu_verifikasi' | 'lunas';
  proofUrl?: string;
  paidAt?: string;
  verifiedBy?: string;
  verifiedAt?: string;
}

export interface BudgetPlan {
  id: string;
  divisionId: string;
  divisionName: string;
  title: string;
  allocatedAmount: number;
  usedAmount: number;
  fiscalYear: string;
  notes: string;
}

export interface DocumentItem {
  id: string;
  type: 'surat_masuk' | 'surat_keluar' | 'proposal' | 'lpj';
  documentNumber: string;
  title: string;
  documentDate: string;
  senderOrReceiver: string;
  fileUrl?: string;
  status: 'arsip' | 'pending' | 'terkirim';
}

export interface Announcement {
  id: string;
  title: string;
  content: string;
  priority: 'penting' | 'biasa';
  author: string;
  date: string;
  targetRole: string;
}

export interface OrgProfile {
  name: string;
  schoolName: string;
  academicYear: string;
  vision: string;
  mission: string[];
  history: string;
  logoUrl: string;
  pembinaName: string;
  nipPembina?: string;
  headmasterName: string;
  nipHeadmaster?: string;
  ketuaName: string;
  nisnKetua?: string;
  motto?: string;
  address: string;
  phone: string;
  email: string;
  instagram: string;
  monthlyDueAmount?: number;
  dueDueDay?: number;
  bankName?: string;
  bankAccountNumber?: string;
  bankAccountHolder?: string;
}

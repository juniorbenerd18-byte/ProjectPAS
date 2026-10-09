import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  UserRole,
  OrgProfile,
  Division,
  Position,
  Member,
  WorkProgram,
  EventItem,
  Meeting,
  AttendanceRecord,
  CashTransaction,
  MemberDue,
  BudgetPlan,
  DocumentItem,
  Announcement,
  ProkerTask,
  StudentAspiration,
  RecruitmentApplication,
  EventRegistration,
} from '../types';
import {
  initialOrgProfile,
  initialDivisions,
  initialPositions,
  initialMembers,
  initialWorkPrograms,
  initialEvents,
  initialMeetings,
  initialAttendances,
  initialCashTransactions,
  initialMemberDues,
  initialBudgets,
  initialDocuments,
  initialAnnouncements,
  initialAspirations,
  initialRecruitments,
  initialEventRegistrations,
} from '../data/mockData';

interface Toast {
  message: string;
  type: 'success' | 'error' | 'info';
}

interface AppContextType {
  activePage: string;
  setActivePage: (page: string) => void;
  currentRole: UserRole;
  setCurrentRole: (role: UserRole) => void;
  currentUser: Member;
  setCurrentUser: (member: Member) => void;
  
  // Data States
  orgProfile: OrgProfile;
  updateOrgProfile: (profile: Partial<OrgProfile>) => void;
  
  divisions: Division[];
  addDivision: (div: Omit<Division, 'id'>) => void;
  updateDivision: (id: string, div: Partial<Division>) => void;
  deleteDivision: (id: string) => void;
  
  positions: Position[];
  addPosition: (pos: Omit<Position, 'id'>) => void;
  deletePosition: (id: string) => void;
  
  members: Member[];
  addMember: (member: Omit<Member, 'id'>) => void;
  updateMember: (id: string, member: Partial<Member>) => void;
  deleteMember: (id: string) => void;
  
  workPrograms: WorkProgram[];
  addWorkProgram: (proker: Omit<WorkProgram, 'id' | 'createdAt'>) => void;
  updateWorkProgram: (id: string, proker: Partial<WorkProgram>) => void;
  deleteWorkProgram: (id: string) => void;
  addProkerTask: (prokerId: string, task: Omit<ProkerTask, 'id'>) => void;
  toggleProkerTask: (prokerId: string, taskId: string) => void;
  deleteProkerTask: (prokerId: string, taskId: string) => void;

  events: EventItem[];
  addEvent: (evt: Omit<EventItem, 'id'>) => void;
  updateEvent: (id: string, evt: Partial<EventItem>) => void;
  deleteEvent: (id: string) => void;
  addEventPhoto: (eventId: string, photoUrl: string) => void;

  meetings: Meeting[];
  addMeeting: (meet: Omit<Meeting, 'id'>) => void;
  updateMeeting: (id: string, meet: Partial<Meeting>) => void;
  deleteMeeting: (id: string) => void;

  attendances: AttendanceRecord[];
  recordAttendance: (record: Omit<AttendanceRecord, 'id' | 'checkInTime'>) => { success: boolean; message: string };
  updateAttendanceStatus: (id: string, status: AttendanceRecord['status'], notes?: string) => void;

  cashTransactions: CashTransaction[];
  addCashTransaction: (trx: Omit<CashTransaction, 'id'>) => void;
  deleteCashTransaction: (id: string) => void;

  memberDues: MemberDue[];
  updateMemberDueStatus: (id: string, status: MemberDue['status'], verifiedBy?: string) => void;
  uploadMemberDueProof: (id: string, proofUrl: string) => void;

  budgets: BudgetPlan[];
  addBudget: (b: Omit<BudgetPlan, 'id'>) => void;
  updateBudget: (id: string, b: Partial<BudgetPlan>) => void;
  deleteBudget: (id: string) => void;

  documents: DocumentItem[];
  addDocument: (doc: Omit<DocumentItem, 'id'>) => void;
  deleteDocument: (id: string) => void;

  announcements: Announcement[];
  addAnnouncement: (ann: Omit<Announcement, 'id' | 'date'>) => void;
  deleteAnnouncement: (id: string) => void;

  // Public Portal Features (Aspirasi Siswa, Oprec, & Registrasi Event)
  aspirations: StudentAspiration[];
  addAspiration: (asp: Omit<StudentAspiration, 'id' | 'date' | 'status' | 'likes'>) => void;
  likeAspiration: (id: string) => void;
  updateAspirationStatus: (id: string, status: StudentAspiration['status'], response?: string, respondedBy?: string) => void;

  recruitments: RecruitmentApplication[];
  addRecruitment: (rec: Omit<RecruitmentApplication, 'id' | 'registrationNumber' | 'appliedDate' | 'status'>) => RecruitmentApplication;
  updateRecruitment: (id: string, partial: Partial<RecruitmentApplication>) => void;

  eventRegistrations: EventRegistration[];
  registerForEvent: (reg: Omit<EventRegistration, 'id' | 'ticketCode' | 'registeredAt'>) => EventRegistration;

  // Theme & Appearance
  theme: 'light' | 'dark';
  setTheme: (theme: 'light' | 'dark') => void;
  toggleTheme: () => void;

  // Helpers & Maintenance
  toast: Toast | null;
  showToast: (message: string, type?: 'success' | 'error' | 'info') => void;
  resetAllData: () => void;
  importAllData: (jsonData: string) => boolean;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Load state from localStorage or use initial data
  const loadStored = <T,>(key: string, initial: T): T => {
    try {
      const saved = localStorage.getItem(`schoolorg_${key}`);
      return saved ? JSON.parse(saved) : initial;
    } catch {
      return initial;
    }
  };

  const [activePage, setActivePage] = useState<string>(() => loadStored('activePage', 'portal-publik'));
  const [currentRole, setCurrentRole] = useState<UserRole>('ketua');
  const [toast, setToast] = useState<Toast | null>(null);

  const [orgProfile, setOrgProfile] = useState<OrgProfile>(() => loadStored('orgProfile', initialOrgProfile));
  const [divisions, setDivisions] = useState<Division[]>(() => loadStored('divisions', initialDivisions));
  const [positions, setPositions] = useState<Position[]>(() => loadStored('positions', initialPositions));
  const [members, setMembers] = useState<Member[]>(() => loadStored('members', initialMembers));
  const [workPrograms, setWorkPrograms] = useState<WorkProgram[]>(() => loadStored('workPrograms', initialWorkPrograms));
  const [events, setEvents] = useState<EventItem[]>(() => loadStored('events', initialEvents));
  const [meetings, setMeetings] = useState<Meeting[]>(() => loadStored('meetings', initialMeetings));
  const [attendances, setAttendances] = useState<AttendanceRecord[]>(() => loadStored('attendances', initialAttendances));
  const [cashTransactions, setCashTransactions] = useState<CashTransaction[]>(() => loadStored('cashTransactions', initialCashTransactions));
  const [memberDues, setMemberDues] = useState<MemberDue[]>(() => loadStored('memberDues', initialMemberDues));
  const [budgets, setBudgets] = useState<BudgetPlan[]>(() => loadStored('budgets', initialBudgets));
  const [documents, setDocuments] = useState<DocumentItem[]>(() => loadStored('documents', initialDocuments));
  const [announcements, setAnnouncements] = useState<Announcement[]>(() => loadStored('announcements', initialAnnouncements));
  
  // Public Portal States
  const [aspirations, setAspirations] = useState<StudentAspiration[]>(() => loadStored('aspirations', initialAspirations));
  const [recruitments, setRecruitments] = useState<RecruitmentApplication[]>(() => loadStored('recruitments', initialRecruitments));
  const [eventRegistrations, setEventRegistrations] = useState<EventRegistration[]>(() => loadStored('eventRegistrations', initialEventRegistrations));

  // Determine current user based on active role
  const currentUser = members.find((m) => m.role === currentRole) || members[0];
  const setCurrentUser = (m: Member) => {
    setCurrentRole(m.role);
  };

  // Sync to localStorage
  useEffect(() => {
    localStorage.setItem('schoolorg_activePage', JSON.stringify(activePage));
    localStorage.setItem('schoolorg_orgProfile', JSON.stringify(orgProfile));
    localStorage.setItem('schoolorg_divisions', JSON.stringify(divisions));
    localStorage.setItem('schoolorg_positions', JSON.stringify(positions));
    localStorage.setItem('schoolorg_members', JSON.stringify(members));
    localStorage.setItem('schoolorg_workPrograms', JSON.stringify(workPrograms));
    localStorage.setItem('schoolorg_events', JSON.stringify(events));
    localStorage.setItem('schoolorg_meetings', JSON.stringify(meetings));
    localStorage.setItem('schoolorg_attendances', JSON.stringify(attendances));
    localStorage.setItem('schoolorg_cashTransactions', JSON.stringify(cashTransactions));
    localStorage.setItem('schoolorg_memberDues', JSON.stringify(memberDues));
    localStorage.setItem('schoolorg_budgets', JSON.stringify(budgets));
    localStorage.setItem('schoolorg_documents', JSON.stringify(documents));
    localStorage.setItem('schoolorg_announcements', JSON.stringify(announcements));
    localStorage.setItem('schoolorg_aspirations', JSON.stringify(aspirations));
    localStorage.setItem('schoolorg_recruitments', JSON.stringify(recruitments));
    localStorage.setItem('schoolorg_eventRegistrations', JSON.stringify(eventRegistrations));
  }, [
    activePage, orgProfile, divisions, positions, members, workPrograms, events,
    meetings, attendances, cashTransactions, memberDues, budgets,
    documents, announcements, aspirations, recruitments, eventRegistrations
  ]);

  const showToast = (message: string, type: 'success' | 'error' | 'info' = 'success') => {
    setToast({ message, type });
    setTimeout(() => {
      setToast(null);
    }, 3500);
  };

  const updateOrgProfile = (profile: Partial<OrgProfile>) => {
    setOrgProfile((prev) => ({ ...prev, ...profile }));
    showToast('Profil organisasi berhasil diperbarui!');
  };

  // Divisions CRUD
  const addDivision = (div: Omit<Division, 'id'>) => {
    const newDiv: Division = { ...div, id: `div-${Date.now()}` };
    setDivisions((prev) => [...prev, newDiv]);
    showToast(`Divisi ${newDiv.name} berhasil ditambahkan!`);
  };

  const updateDivision = (id: string, div: Partial<Division>) => {
    setDivisions((prev) => prev.map((d) => (d.id === id ? { ...d, ...div } : d)));
    showToast('Divisi berhasil diperbarui!');
  };

  const deleteDivision = (id: string) => {
    setDivisions((prev) => prev.filter((d) => d.id !== id));
    showToast('Divisi telah dihapus.', 'info');
  };

  // Positions
  const addPosition = (pos: Omit<Position, 'id'>) => {
    const newPos: Position = { ...pos, id: `pos-${Date.now()}` };
    setPositions((prev) => [...prev, newPos]);
    showToast(`Jabatan ${newPos.name} ditambahkan!`);
  };

  const deletePosition = (id: string) => {
    setPositions((prev) => prev.filter((p) => p.id !== id));
    showToast('Jabatan dihapus.', 'info');
  };

  // Members CRUD
  const addMember = (member: Omit<Member, 'id'>) => {
    const newMember: Member = { ...member, id: `mem-${Date.now()}` };
    setMembers((prev) => [...prev, newMember]);
    // Generate initial dues for the member
    const newDue: MemberDue = {
      id: `due-${Date.now()}`,
      memberId: newMember.id,
      memberName: newMember.fullName,
      nisn: newMember.nisn,
      periodMonth: new Date().getMonth() + 1,
      periodYear: new Date().getFullYear(),
      amount: 15000,
      status: 'belum_lunas',
    };
    setMemberDues((prev) => [...prev, newDue]);
    showToast(`Anggota ${newMember.fullName} berhasil didaftarkan!`);
  };

  const updateMember = (id: string, member: Partial<Member>) => {
    setMembers((prev) => prev.map((m) => (m.id === id ? { ...m, ...member } : m)));
    showToast('Data anggota berhasil diperbarui!');
  };

  const deleteMember = (id: string) => {
    setMembers((prev) => prev.filter((m) => m.id !== id));
    showToast('Anggota telah dihapus.', 'info');
  };

  // Theme State (Default to Clean White Light Mode)
  const [theme, setThemeState] = useState<'light' | 'dark'>(() => {
    try {
      const saved = localStorage.getItem('schoolorg_theme_v3');
      if (saved === 'dark' || saved === 'light') return saved;
      return 'light'; // Default: Clean White
    } catch {
      return 'light';
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem('schoolorg_theme_v3', theme);
      if (theme === 'dark') {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    } catch (e) {
      console.warn('Error applying theme:', e);
    }
  }, [theme]);

  const setTheme = (t: 'light' | 'dark') => {
    setThemeState(t);
  };

  const toggleTheme = () => {
    setThemeState((prev) => (prev === 'dark' ? 'light' : 'dark'));
  };

  // Work Programs
  const addWorkProgram = (proker: Omit<WorkProgram, 'id' | 'createdAt'>) => {
    const newProker: WorkProgram = {
      ...proker,
      id: `proker-${Date.now()}`,
      createdAt: new Date().toISOString().split('T')[0],
      tasks: proker.tasks || [],
    };
    setWorkPrograms((prev) => [...prev, newProker]);
    showToast(`Program Kerja "${newProker.title}" berhasil diajukan!`);
  };

  const updateWorkProgram = (id: string, proker: Partial<WorkProgram>) => {
    setWorkPrograms((prev) => prev.map((p) => (p.id === id ? { ...p, ...proker } : p)));
    showToast('Program kerja berhasil diperbarui!');
  };

  const deleteWorkProgram = (id: string) => {
    setWorkPrograms((prev) => prev.filter((p) => p.id !== id));
    showToast('Program kerja dihapus.', 'info');
  };

  // Proker Tasks (Kepanitiaan & Jobdesk)
  const addProkerTask = (prokerId: string, task: Omit<ProkerTask, 'id'>) => {
    const newTask: ProkerTask = {
      ...task,
      id: `task-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    };
    setWorkPrograms((prev) =>
      prev.map((p) => {
        if (p.id !== prokerId) return p;
        const currentTasks = p.tasks || [];
        const nextTasks = [...currentTasks, newTask];
        const completedCount = nextTasks.filter((t) => t.isCompleted).length;
        const autoProgress = Math.round((completedCount / nextTasks.length) * 100);
        return {
          ...p,
          tasks: nextTasks,
          progressPercent: autoProgress,
        };
      })
    );
    showToast(`Tugas baru berhasil ditambahkan!`);
  };

  const toggleProkerTask = (prokerId: string, taskId: string) => {
    setWorkPrograms((prev) =>
      prev.map((p) => {
        if (p.id !== prokerId) return p;
        const currentTasks = p.tasks || [];
        const nextTasks = currentTasks.map((t) =>
          t.id === taskId ? { ...t, isCompleted: !t.isCompleted } : t
        );
        const completedCount = nextTasks.filter((t) => t.isCompleted).length;
        const autoProgress = nextTasks.length > 0 ? Math.round((completedCount / nextTasks.length) * 100) : p.progressPercent;
        return {
          ...p,
          tasks: nextTasks,
          progressPercent: autoProgress,
          status: autoProgress === 100 ? 'selesai' : (autoProgress > 0 && p.status === 'disetujui' ? 'berjalan' : p.status),
        };
      })
    );
  };

  const deleteProkerTask = (prokerId: string, taskId: string) => {
    setWorkPrograms((prev) =>
      prev.map((p) => {
        if (p.id !== prokerId) return p;
        const nextTasks = (p.tasks || []).filter((t) => t.id !== taskId);
        const completedCount = nextTasks.filter((t) => t.isCompleted).length;
        const autoProgress = nextTasks.length > 0 ? Math.round((completedCount / nextTasks.length) * 100) : 0;
        return {
          ...p,
          tasks: nextTasks,
          progressPercent: autoProgress,
        };
      })
    );
    showToast('Tugas kepanitiaan dihapus.', 'info');
  };

  // Events
  const addEvent = (evt: Omit<EventItem, 'id'>) => {
    const newEvt: EventItem = { ...evt, id: `evt-${Date.now()}` };
    setEvents((prev) => [...prev, newEvt]);
    showToast(`Kegiatan "${newEvt.title}" berhasil dijadwalkan!`);
  };

  const updateEvent = (id: string, evt: Partial<EventItem>) => {
    setEvents((prev) => prev.map((e) => (e.id === id ? { ...e, ...evt } : e)));
    showToast('Kegiatan berhasil diperbarui!');
  };

  const deleteEvent = (id: string) => {
    setEvents((prev) => prev.filter((e) => e.id !== id));
    showToast('Kegiatan dihapus.', 'info');
  };

  const addEventPhoto = (eventId: string, photoUrl: string) => {
    setEvents((prev) =>
      prev.map((e) => (e.id === eventId ? { ...e, documentationPhotos: [...e.documentationPhotos, photoUrl] } : e))
    );
    showToast('Foto dokumentasi berhasil ditambahkan!');
  };

  // Meetings
  const addMeeting = (meet: Omit<Meeting, 'id'>) => {
    const newMeet: Meeting = { ...meet, id: `meet-${Date.now()}` };
    setMeetings((prev) => [...prev, newMeet]);
    showToast(`Rapat "${newMeet.title}" dijadwalkan!`);
  };

  const updateMeeting = (id: string, meet: Partial<Meeting>) => {
    setMeetings((prev) => prev.map((m) => (m.id === id ? { ...m, ...meet } : m)));
    showToast('Data rapat berhasil diperbarui!');
  };

  const deleteMeeting = (id: string) => {
    setMeetings((prev) => prev.filter((m) => m.id !== id));
    showToast('Rapat dihapus.', 'info');
  };

  // Attendance
  const recordAttendance = (record: Omit<AttendanceRecord, 'id' | 'checkInTime'>) => {
    const alreadyAttended = attendances.some(
      (a) => a.targetId === record.targetId && a.memberId === record.memberId
    );
    if (alreadyAttended) {
      return { success: false, message: 'Anda sudah melakukan presensi sebelumnya.' };
    }
    const newAtt: AttendanceRecord = {
      ...record,
      id: `att-${Date.now()}`,
      checkInTime: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }),
    };
    setAttendances((prev) => [newAtt, ...prev]);
    showToast(`Presensi berhasil: ${newAtt.memberName} (${newAtt.status.toUpperCase()})`);
    return { success: true, message: 'Presensi berhasil dicatat!' };
  };

  const updateAttendanceStatus = (id: string, status: AttendanceRecord['status'], notes?: string) => {
    setAttendances((prev) =>
      prev.map((a) => (a.id === id ? { ...a, status, notes: notes !== undefined ? notes : a.notes } : a))
    );
    showToast('Status presensi diperbarui!');
  };

  // Cash Transactions
  const addCashTransaction = (trx: Omit<CashTransaction, 'id'>) => {
    const newTrx: CashTransaction = { ...trx, id: `trx-${Date.now()}` };
    setCashTransactions((prev) => [newTrx, ...prev]);
    showToast(`Transaksi ${trx.type} sebesar Rp ${trx.amount.toLocaleString()} berhasil dicatat!`);
  };

  const deleteCashTransaction = (id: string) => {
    setCashTransactions((prev) => prev.filter((t) => t.id !== id));
    showToast('Catatan transaksi dihapus.', 'info');
  };

  // Member Dues
  const updateMemberDueStatus = (id: string, status: MemberDue['status'], verifiedBy?: string) => {
    setMemberDues((prev) =>
      prev.map((d) =>
        d.id === id
          ? {
              ...d,
              status,
              verifiedBy: verifiedBy || (status === 'lunas' ? currentUser.fullName : undefined),
              verifiedAt: status === 'lunas' ? new Date().toISOString() : undefined,
            }
          : d
      )
    );
    if (status === 'lunas') {
      const due = memberDues.find((d) => d.id === id);
      if (due) {
        // Automatically log into cash transactions
        addCashTransaction({
          type: 'pemasukan',
          category: 'iuran_kas',
          amount: due.amount,
          transactionDate: new Date().toISOString().split('T')[0],
          description: `Iuran Kas ${due.memberName} (${due.periodMonth}/${due.periodYear})`,
          recordedBy: currentUser.fullName,
          referenceId: due.id,
        });
      }
    }
    showToast(`Status iuran kas diperbarui: ${status.replace('_', ' ').toUpperCase()}`);
  };

  const uploadMemberDueProof = (id: string, proofUrl: string) => {
    setMemberDues((prev) =>
      prev.map((d) => (d.id === id ? { ...d, proofUrl, status: 'menunggu_verifikasi', paidAt: new Date().toISOString().split('T')[0] } : d))
    );
    showToast('Bukti transfer berhasil diunggah! Menunggu verifikasi Bendahara.');
  };

  // Budgets
  const addBudget = (b: Omit<BudgetPlan, 'id'>) => {
    const newB: BudgetPlan = { ...b, id: `bud-${Date.now()}` };
    setBudgets((prev) => [...prev, newB]);
    showToast('Anggaran RAB berhasil ditambahkan!');
  };

  const updateBudget = (id: string, b: Partial<BudgetPlan>) => {
    setBudgets((prev) => prev.map((item) => (item.id === id ? { ...item, ...b } : item)));
    showToast('Anggaran RAB berhasil diperbarui!');
  };

  const deleteBudget = (id: string) => {
    setBudgets((prev) => prev.filter((b) => b.id !== id));
    showToast('Anggaran dihapus.', 'info');
  };

  // Documents
  const addDocument = (doc: Omit<DocumentItem, 'id'>) => {
    const newDoc: DocumentItem = { ...doc, id: `doc-${Date.now()}` };
    setDocuments((prev) => [newDoc, ...prev]);
    showToast(`Dokumen "${newDoc.title}" berhasil diarsipkan!`);
  };

  const deleteDocument = (id: string) => {
    setDocuments((prev) => prev.filter((d) => d.id !== id));
    showToast('Dokumen dihapus.', 'info');
  };

  // Announcements
  const addAnnouncement = (ann: Omit<Announcement, 'id' | 'date'>) => {
    const newAnn: Announcement = {
      ...ann,
      id: `ann-${Date.now()}`,
      date: new Date().toISOString().split('T')[0],
    };
    setAnnouncements((prev) => [newAnn, ...prev]);
    showToast('Pengumuman baru telah diterbitkan!');
  };

  const deleteAnnouncement = (id: string) => {
    setAnnouncements((prev) => prev.filter((a) => a.id !== id));
    showToast('Pengumuman dihapus.', 'info');
  };

  // Public Portal Actions: Aspirasi Siswa
  const addAspiration = (asp: Omit<StudentAspiration, 'id' | 'date' | 'status' | 'likes'>) => {
    const newAsp: StudentAspiration = {
      ...asp,
      id: `asp-${Date.now()}`,
      date: new Date().toISOString().split('T')[0],
      status: 'diterima',
      likes: 1,
    };
    setAspirations((prev) => [newAsp, ...prev]);
    showToast('Aspirasi Anda berhasil dikirim dan akan ditinjau oleh Pengurus OSIS!', 'success');
  };

  const likeAspiration = (id: string) => {
    setAspirations((prev) =>
      prev.map((a) => (a.id === id ? { ...a, likes: a.likes + 1 } : a))
    );
    showToast('Dukungan aspirasi berhasil ditambahkan!');
  };

  const updateAspirationStatus = (
    id: string,
    status: StudentAspiration['status'],
    response?: string,
    respondedBy?: string
  ) => {
    setAspirations((prev) =>
      prev.map((a) =>
        a.id === id
          ? {
              ...a,
              status,
              response: response !== undefined ? response : a.response,
              respondedBy: respondedBy || currentUser.fullName,
            }
          : a
      )
    );
    showToast(`Status aspirasi diperbarui menjadi: ${status.toUpperCase()}`);
  };

  // Public Portal Actions: Open Recruitment
  const addRecruitment = (
    rec: Omit<RecruitmentApplication, 'id' | 'registrationNumber' | 'appliedDate' | 'status'>
  ): RecruitmentApplication => {
    const randomSuffix = Math.floor(100 + Math.random() * 900);
    const newRec: RecruitmentApplication = {
      ...rec,
      id: `rec-${Date.now()}`,
      registrationNumber: `OPREC-2026-${rec.grade}${randomSuffix}`,
      appliedDate: new Date().toISOString().split('T')[0],
      status: 'menunggu',
    };
    setRecruitments((prev) => [newRec, ...prev]);
    showToast(`Pendaftaran Oprec berhasil! No. Registrasi: ${newRec.registrationNumber}`, 'success');
    return newRec;
  };

  const updateRecruitment = (id: string, partial: Partial<RecruitmentApplication>) => {
    setRecruitments((prev) =>
      prev.map((r) => (r.id === id ? { ...r, ...partial } : r))
    );
    showToast('Status pendaftaran calon anggota diperbarui!');
  };

  // Public Portal Actions: Event Registrations
  const registerForEvent = (
    reg: Omit<EventRegistration, 'id' | 'ticketCode' | 'registeredAt'>
  ): EventRegistration => {
    const randomCode = Math.floor(1000 + Math.random() * 9000);
    const newReg: EventRegistration = {
      ...reg,
      id: `evtr-${Date.now()}`,
      ticketCode: `TKT-${randomCode}`,
      registeredAt: new Date().toLocaleString('id-ID', { dateStyle: 'short', timeStyle: 'short' }),
    };
    setEventRegistrations((prev) => [newReg, ...prev]);
    showToast(`Tiket pendaftaran ${newReg.ticketCode} berhasil diterbitkan!`, 'success');
    return newReg;
  };

  // Reset Data to Factory Initial
  const resetAllData = () => {
    localStorage.clear();
    setOrgProfile(initialOrgProfile);
    setDivisions(initialDivisions);
    setPositions(initialPositions);
    setMembers(initialMembers);
    setWorkPrograms(initialWorkPrograms);
    setEvents(initialEvents);
    setMeetings(initialMeetings);
    setAttendances(initialAttendances);
    setCashTransactions(initialCashTransactions);
    setMemberDues(initialMemberDues);
    setBudgets(initialBudgets);
    setDocuments(initialDocuments);
    setAnnouncements(initialAnnouncements);
    setAspirations(initialAspirations);
    setRecruitments(initialRecruitments);
    setEventRegistrations(initialEventRegistrations);
    showToast('Data berhasil di-reset ke nilai default UKK!', 'info');
  };

  // Import Data from JSON Backup
  const importAllData = (jsonData: string): boolean => {
    try {
      const parsed = JSON.parse(jsonData);
      if (parsed.orgProfile) setOrgProfile(parsed.orgProfile);
      if (parsed.divisions) setDivisions(parsed.divisions);
      if (parsed.positions) setPositions(parsed.positions);
      if (parsed.members) setMembers(parsed.members);
      if (parsed.workPrograms) setWorkPrograms(parsed.workPrograms);
      if (parsed.events) setEvents(parsed.events);
      if (parsed.meetings) setMeetings(parsed.meetings);
      if (parsed.attendances) setAttendances(parsed.attendances);
      if (parsed.cashTransactions) setCashTransactions(parsed.cashTransactions);
      if (parsed.memberDues) setMemberDues(parsed.memberDues);
      if (parsed.budgets) setBudgets(parsed.budgets);
      if (parsed.documents) setDocuments(parsed.documents);
      if (parsed.announcements) setAnnouncements(parsed.announcements);
      if (parsed.aspirations) setAspirations(parsed.aspirations);
      if (parsed.recruitments) setRecruitments(parsed.recruitments);
      if (parsed.eventRegistrations) setEventRegistrations(parsed.eventRegistrations);
      showToast('Seluruh data berhasil dipulihkan dari cadangan!', 'success');
      return true;
    } catch (e) {
      console.error(e);
      showToast('Gagal memulihkan data: format file JSON tidak valid.', 'error');
      return false;
    }
  };

  return (
    <AppContext.Provider
      value={{
        activePage,
        setActivePage,
        currentRole,
        setCurrentRole,
        currentUser,
        setCurrentUser,
        orgProfile,
        updateOrgProfile,
        divisions,
        addDivision,
        updateDivision,
        deleteDivision,
        positions,
        addPosition,
        deletePosition,
        members,
        addMember,
        updateMember,
        deleteMember,
        workPrograms,
        addWorkProgram,
        updateWorkProgram,
        deleteWorkProgram,
        addProkerTask,
        toggleProkerTask,
        deleteProkerTask,
        events,
        addEvent,
        updateEvent,
        deleteEvent,
        addEventPhoto,
        meetings,
        addMeeting,
        updateMeeting,
        deleteMeeting,
        attendances,
        recordAttendance,
        updateAttendanceStatus,
        cashTransactions,
        addCashTransaction,
        deleteCashTransaction,
        memberDues,
        updateMemberDueStatus,
        uploadMemberDueProof,
        budgets,
        addBudget,
        updateBudget,
        deleteBudget,
        documents,
        addDocument,
        deleteDocument,
        announcements,
        addAnnouncement,
        deleteAnnouncement,
        aspirations,
        addAspiration,
        likeAspiration,
        updateAspirationStatus,
        recruitments,
        addRecruitment,
        updateRecruitment,
        eventRegistrations,
        registerForEvent,
        theme,
        setTheme,
        toggleTheme,
        toast,
        showToast,
        resetAllData,
        importAllData,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};

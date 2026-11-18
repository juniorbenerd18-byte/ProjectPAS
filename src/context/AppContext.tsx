import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useRef,
  useCallback,
} from 'react';
import {
  UserRole,
  OrgProfile,
  GalleryItem,
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
  TestimonialItem,
} from '../types';
import { DEFAULT_GALLERY_PHOTOS } from '../components/public/GallerySection';
import { DEFAULT_TESTIMONIALS } from '../components/public/TestimonialsSection';
import { formatAttendanceTime, normalizeMajor } from '../lib/utils';
import {
  isCloudConnected,
  stringToUuid,
  setSyncErrorHandler,
  fetchAllFromCloud,
  fetchMembersFromCloud,
  addMemberToCloud,
  updateMemberInCloud,
  deleteMemberFromCloud,
  addDivisionToCloud,
  updateDivisionInCloud,
  deleteDivisionFromCloud,
  addPositionToCloud,
  deletePositionFromCloud,
  saveOrgProfileToCloud,
  addWorkProgramToCloud,
  updateWorkProgramInCloud,
  deleteWorkProgramFromCloud,
  addEventToCloud,
  updateEventInCloud,
  deleteEventFromCloud,
  addMeetingToCloud,
  updateMeetingInCloud,
  deleteMeetingFromCloud,
  recordAttendanceToCloud,
  updateAttendanceInCloud,
  addCashTransactionToCloud,
  deleteCashTransactionFromCloud,
  addMemberDueToCloud,
  updateMemberDueInCloud,
  addBudgetToCloud,
  updateBudgetInCloud,
  deleteBudgetFromCloud,
  addDocumentToCloud,
  deleteDocumentFromCloud,
  addAnnouncementToCloud,
  deleteAnnouncementFromCloud,
  addRecruitmentToCloud,
  updateRecruitmentInCloud,
  deleteRecruitmentFromCloud,
  addAspirationToCloud,
  updateAspirationInCloud,
  deleteAspirationFromCloud,
  addGalleryPhotoToCloud,
  updateGalleryPhotoInCloud,
  deleteGalleryPhotoFromCloud,
  addEventRegistrationToCloud,
  deleteEventRegistrationFromCloud,
  getAppMeta,
  setAppMeta,
  replaceCloudWithSnapshot,
  subscribeToCloudChanges,
  type CloudSnapshot,
  type LocalSnapshot,
} from '../lib/supabaseService';
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

const DEFAULT_PASSWORD = 'osis2025';
const SESSION_KEY = 'schoolorg_session';
const MERGE_META_KEY = 'local_merge_v1';

interface Toast {
  message: string;
  type: 'success' | 'error' | 'info';
}

export interface ToastItem {
  id: string;
  message: string;
  type: 'success' | 'error' | 'info';
}

interface StoredSession {
  memberId: string;
  nisn: string;
  remember: boolean;
}

interface SyncState {
  state: 'idle' | 'syncing' | 'ok' | 'error';
  message?: string;
  lastSyncedAt?: string;
}

interface LoginResult {
  success: boolean;
  message: string;
}

interface AppContextType {
  activePage: string;
  setActivePage: (page: string) => void;
  currentRole: UserRole;
  setCurrentRole: (role: UserRole) => void;
  currentUser: Member;
  setCurrentUser: (member: Member) => void;

  // Auth & Session
  isAuthenticated: boolean;
  login: (identifier: string, password: string, remember?: boolean) => Promise<LoginResult>;
  logout: () => void;

  // Cloud Sync
  cloudConnected: boolean;
  syncState: SyncState;
  syncNow: () => Promise<boolean>;

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
  removeEventPhoto: (eventId: string, photoIndexOrUrl: number | string) => void;

  meetings: Meeting[];
  addMeeting: (meet: Omit<Meeting, 'id'>) => void;
  updateMeeting: (id: string, meet: Partial<Meeting>) => void;
  deleteMeeting: (id: string) => void;

  attendances: AttendanceRecord[];
  recordAttendance: (record: Omit<AttendanceRecord, 'id' | 'checkInTime'>) => {
    success: boolean;
    message: string;
  };
  updateAttendanceStatus: (
    id: string,
    status: AttendanceRecord['status'],
    notes?: string
  ) => void;

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

  aspirations: StudentAspiration[];
  addAspiration: (
    asp: Omit<StudentAspiration, 'id' | 'date' | 'status' | 'likes'>
  ) => void;
  likeAspiration: (id: string) => void;
  updateAspirationStatus: (
    id: string,
    status: StudentAspiration['status'],
    response?: string,
    respondedBy?: string
  ) => void;
  deleteAspiration: (id: string) => void;

  recruitments: RecruitmentApplication[];
  addRecruitment: (
    rec: Omit<RecruitmentApplication, 'id' | 'registrationNumber' | 'appliedDate' | 'status'>
  ) => RecruitmentApplication;
  updateRecruitment: (id: string, partial: Partial<RecruitmentApplication>) => void;
  deleteRecruitment: (id: string) => void;
  approveRecruitmentToMember: (
    recruitmentId: string,
    customDivisionId?: string,
    customPosition?: string
  ) => void;

  keanggotaanTab: 'direktori' | 'struktur' | 'pendaftar' | 'cerita';
  setKeanggotaanTab: (tab: 'direktori' | 'struktur' | 'pendaftar' | 'cerita') => void;

  eventRegistrations: EventRegistration[];
  registerForEvent: (
    reg: Omit<EventRegistration, 'id' | 'ticketCode' | 'registeredAt'>
  ) => EventRegistration;
  deleteEventRegistration: (id: string) => void;

  galleryPhotos: GalleryItem[];
  addGalleryPhoto: (photo: Omit<GalleryItem, 'id'>) => void;
  updateGalleryPhoto: (id: string, photo: Partial<GalleryItem>) => void;
  deleteGalleryPhoto: (id: string) => void;
  resetGalleryPhotos: () => void;

  testimonials: TestimonialItem[];
  addTestimonial: (item: Omit<TestimonialItem, 'id'>) => void;
  updateTestimonial: (id: string, item: Partial<TestimonialItem>) => void;
  deleteTestimonial: (id: string) => void;
  resetTestimonials: () => void;

  theme: 'light' | 'dark';
  setTheme: (theme: 'light' | 'dark') => void;
  toggleTheme: () => void;

  toast: Toast | null;
  toasts: ToastItem[];
  dismissToast: (id: string) => void;
  showToast: (message: string, type?: 'success' | 'error' | 'info') => void;
  resetAllData: () => void;
  importAllData: (jsonData: string) => boolean;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

// ==========================================
// SESSION STORAGE HELPERS
// ==========================================

function readStoredSession(): StoredSession | null {
  try {
    const raw = sessionStorage.getItem(SESSION_KEY) || localStorage.getItem(SESSION_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<StoredSession>;
    if (parsed && typeof parsed.memberId === 'string' && parsed.memberId.length > 0) {
      return {
        memberId: parsed.memberId,
        nisn: typeof parsed.nisn === 'string' ? parsed.nisn : '',
        remember: parsed.remember !== false,
      };
    }
    return null;
  } catch {
    return null;
  }
}

function writeStoredSession(session: StoredSession) {
  try {
    const payload = JSON.stringify(session);
    localStorage.removeItem(SESSION_KEY);
    sessionStorage.removeItem(SESSION_KEY);
    if (session.remember) {
      localStorage.setItem(SESSION_KEY, payload);
    } else {
      sessionStorage.setItem(SESSION_KEY, payload);
    }
  } catch {
    /* storage may be unavailable */
  }
}

function clearStoredSession() {
  try {
    localStorage.removeItem(SESSION_KEY);
    sessionStorage.removeItem(SESSION_KEY);
  } catch {
    /* ignore */
  }
}

// ==========================================
// PROVIDER
// ==========================================

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const loadStored = <T,>(key: string, initial: T): T => {
    try {
      const saved = localStorage.getItem(`schoolorg_${key}`);
      return saved ? (JSON.parse(saved) as T) : initial;
    } catch {
      return initial;
    }
  };

  const [activePage, setActivePage] = useState<string>(() =>
    loadStored('activePage', 'portal-publik')
  );
  const [keanggotaanTab, setKeanggotaanTab] = useState<
    'direktori' | 'struktur' | 'pendaftar' | 'cerita'
  >('direktori');
  const [session, setSession] = useState<StoredSession | null>(() => readStoredSession());
  const [currentRole, setCurrentRole] = useState<UserRole>('ketua');
  const [toast, setToast] = useState<Toast | null>(null);

  const [orgProfile, setOrgProfile] = useState<OrgProfile>(() =>
    loadStored('orgProfile', initialOrgProfile)
  );
  const [divisions, setDivisions] = useState<Division[]>(() =>
    loadStored('divisions', initialDivisions)
  );
  const [positions, setPositions] = useState<Position[]>(() =>
    loadStored('positions', initialPositions)
  );
  const [members, setMembers] = useState<Member[]>(() => loadStored('members', initialMembers));
  const [workPrograms, setWorkPrograms] = useState<WorkProgram[]>(() =>
    loadStored('workPrograms', initialWorkPrograms)
  );
  const [events, setEvents] = useState<EventItem[]>(() => {
    try {
      const stored = loadStored<EventItem[]>('events', initialEvents);
      if (!Array.isArray(stored)) return initialEvents;
      return stored.map((e) => ({
        ...e,
        documentationPhotos: Array.isArray(e.documentationPhotos)
          ? e.documentationPhotos.filter((p) => typeof p === 'string' && p.length > 0)
          : [],
      }));
    } catch {
      return initialEvents;
    }
  });
  const [meetings, setMeetings] = useState<Meeting[]>(() =>
    loadStored('meetings', initialMeetings)
  );
  const [attendances, setAttendances] = useState<AttendanceRecord[]>(() => {
    try {
      const stored = loadStored<AttendanceRecord[]>('attendances', initialAttendances);
      const arr = Array.isArray(stored) ? stored : initialAttendances;
      return arr.map((a) => ({
        ...a,
        checkInTime: formatAttendanceTime(a.checkInTime),
        major: normalizeMajor(a.major),
        notes: a.notes || 'Hadir',
      }));
    } catch {
      return initialAttendances;
    }
  });
  const [cashTransactions, setCashTransactions] = useState<CashTransaction[]>(() =>
    loadStored('cashTransactions', initialCashTransactions)
  );
  const [memberDues, setMemberDues] = useState<MemberDue[]>(() =>
    loadStored('memberDues', initialMemberDues)
  );
  const [budgets, setBudgets] = useState<BudgetPlan[]>(() =>
    loadStored('budgets', initialBudgets)
  );
  const [documents, setDocuments] = useState<DocumentItem[]>(() =>
    loadStored('documents', initialDocuments)
  );
  const [announcements, setAnnouncements] = useState<Announcement[]>(() =>
    loadStored('announcements', initialAnnouncements)
  );

  const [aspirations, setAspirations] = useState<StudentAspiration[]>(() =>
    loadStored('aspirations', initialAspirations)
  );
  const [recruitments, setRecruitments] = useState<RecruitmentApplication[]>(() =>
    loadStored('recruitments', initialRecruitments)
  );
  const [eventRegistrations, setEventRegistrations] = useState<EventRegistration[]>(() =>
    loadStored('eventRegistrations', initialEventRegistrations)
  );
  const [galleryPhotos, setGalleryPhotos] = useState<GalleryItem[]>(() =>
    loadStored('galleryPhotos', DEFAULT_GALLERY_PHOTOS)
  );
  const [testimonials, setTestimonials] = useState<TestimonialItem[]>(() =>
    loadStored('portal_testimonials', DEFAULT_TESTIMONIALS)
  );

  const [syncState, setSyncState] = useState<SyncState>({
    state: isCloudConnected() ? 'idle' : 'error',
    message: isCloudConnected() ? undefined : 'Cloud Supabase belum dikonfigurasi.',
  });

  const cloudConnected = isCloudConnected();

  // Detect "perangkat ini sudah punya data sebelum pembaruan sinkronisasi".
  // Harus dibaca saat render pertama: efek penyimpanan lokal akan segera
  // menulis `schoolorg_orgProfile` sehingga pengecekan yang terlambat akan
  // menganggap perangkat baru sebagai perangkat lama.
  const [hadLocalHistory] = useState<boolean>(() => {
    try {
      return localStorage.getItem('schoolorg_orgProfile') !== null;
    } catch {
      return false;
    }
  });

  // ==========================================
  // IDENTITY
  // ==========================================

  const currentUser: Member =
    (session
      ? members.find((m) => m.id === session.memberId) ||
        members.find((m) => m.nisn && m.nisn === session.nisn)
      : null) ||
    members[0] ||
    initialMembers[0];

  const isAuthenticated = Boolean(
    session &&
      (members.find((m) => m.id === session.memberId) ||
        members.find((m) => m.nisn && m.nisn === session.nisn))
  );

  // Keep the legacy `currentRole` value aligned with the signed-in member.
  useEffect(() => {
    if (isAuthenticated && currentUser && currentUser.role !== currentRole) {
      setCurrentRole(currentUser.role);
    }
  }, [isAuthenticated, currentUser?.id, currentUser?.role, currentRole]);

  // ==========================================
  // LOCAL PERSISTENCE
  // ==========================================

  useEffect(() => {
    try {
      const safeSave = (key: string, data: unknown) => {
        try {
          localStorage.setItem(`schoolorg_${key}`, JSON.stringify(data));
        } catch (e) {
          console.warn(
            `Could not save schoolorg_${key} to localStorage (quota or permission):`,
            e
          );
        }
      };

      safeSave('activePage', activePage);
      safeSave('orgProfile', orgProfile);
      safeSave('divisions', divisions);
      safeSave('positions', positions);
      safeSave('members', members);
      safeSave('workPrograms', workPrograms);
      safeSave('events', events);
      safeSave('meetings', meetings);
      safeSave('attendances', attendances);
      safeSave('cashTransactions', cashTransactions);
      safeSave('memberDues', memberDues);
      safeSave('budgets', budgets);
      safeSave('documents', documents);
      safeSave('announcements', announcements);
      safeSave('aspirations', aspirations);
      safeSave('recruitments', recruitments);
      safeSave('eventRegistrations', eventRegistrations);
      safeSave('galleryPhotos', galleryPhotos);
      safeSave('portal_testimonials', testimonials);
    } catch (err) {
      console.warn('LocalStorage batch sync notice:', err);
    }
  }, [
    activePage,
    orgProfile,
    divisions,
    positions,
    members,
    workPrograms,
    events,
    meetings,
    attendances,
    cashTransactions,
    memberDues,
    budgets,
    documents,
    announcements,
    aspirations,
    recruitments,
    eventRegistrations,
    galleryPhotos,
    testimonials,
  ]);

  // ==========================================
  // TOAST
  // ==========================================

  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const dismissToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const showToast = useCallback((message: string, type: 'success' | 'error' | 'info' = 'success') => {
    const id = `toast-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
    const newToast: ToastItem = { id, message, type };
    setToast({ message, type });
    setToasts((prev) => [...prev.slice(-3), newToast]);

    if (toastTimer.current) clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast(null), 3800);

    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4500);
  }, []);

  // Report cloud failures to the UI instead of swallowing them.
  useEffect(() => {
    setSyncErrorHandler((message) => {
      setSyncState((prev) => ({ ...prev, state: 'error', message }));
      showToast(`Sinkronisasi cloud gagal — ${message}`, 'error');
    });
    return () => setSyncErrorHandler(null);
  }, [showToast]);

  // ==========================================
  // CLOUD STATE APPLICATION
  // ==========================================

  const applySnapshot = useCallback((snapshot: CloudSnapshot) => {
    if (snapshot.members) setMembers(snapshot.members);
    if (snapshot.divisions) setDivisions(snapshot.divisions);
    if (snapshot.positions) setPositions(snapshot.positions);
    if (snapshot.workPrograms) setWorkPrograms(snapshot.workPrograms);
    if (snapshot.events) setEvents(snapshot.events);
    if (snapshot.meetings) setMeetings(snapshot.meetings);
    if (snapshot.attendances) {
      setAttendances(
        snapshot.attendances.map((a) => ({
          ...a,
          checkInTime: formatAttendanceTime(a.checkInTime),
          major: normalizeMajor(a.major),
          notes: a.notes || 'Hadir',
        }))
      );
    }
    if (snapshot.cashTransactions) setCashTransactions(snapshot.cashTransactions);
    if (snapshot.memberDues) setMemberDues(snapshot.memberDues);
    if (snapshot.budgets) setBudgets(snapshot.budgets);
    if (snapshot.documents) setDocuments(snapshot.documents);
    if (snapshot.announcements) setAnnouncements(snapshot.announcements);
    if (snapshot.aspirations) setAspirations(snapshot.aspirations);
    if (snapshot.recruitments) setRecruitments(snapshot.recruitments);
    if (snapshot.eventRegistrations) setEventRegistrations(snapshot.eventRegistrations);
    if (snapshot.galleryPhotos) setGalleryPhotos(snapshot.galleryPhotos);

    if (snapshot.orgProfile) {
      setOrgProfile((prev) => {
        const merged: OrgProfile = { ...prev };
        (Object.keys(snapshot.orgProfile as OrgProfile) as (keyof OrgProfile)[]).forEach((key) => {
          const value = (snapshot.orgProfile as OrgProfile)[key];
          if (value === null || value === undefined) return;
          if (Array.isArray(value) && value.length === 0) return;
          (merged as unknown as Record<string, unknown>)[key as string] = value;
        });
        return merged;
      });
    }
  }, []);

  // Fill member.divisionName from the divisions list (cloud stores only the id).
  useEffect(() => {
    setMembers((prev) => {
      let changed = false;
      const next = prev.map((m) => {
        if (!m.divisionId) return m;
        const division = divisions.find((d) => d.id === m.divisionId);
        if (!division || division.name === m.divisionName) return m;
        changed = true;
        return { ...m, divisionName: division.name };
      });
      return changed ? next : prev;
    });
  }, [divisions]);

  // ==========================================
  // BOOTSTRAP: PULL CLOUD + ONE-TIME PUSH
  // ==========================================

  const bootstrappedRef = useRef(false);
  const syncingRef = useRef(false);
  const pushLocalDataOnceRef = useRef<
    ((snapshot: CloudSnapshot) => Promise<boolean>) | null
  >(null);

  const runSync = useCallback(
    async (options?: { silent?: boolean; mergeLocal?: boolean }): Promise<boolean> => {
      if (!isCloudConnected()) {
        setSyncState({ state: 'error', message: 'Cloud Supabase belum dikonfigurasi.' });
        return false;
      }
      if (syncingRef.current) return false;
      syncingRef.current = true;
      if (!options?.silent) {
        setSyncState((prev) => ({ ...prev, state: 'syncing', message: 'Menyinkronkan data...' }));
      }
      try {
        const snapshot = await fetchAllFromCloud();
        applySnapshot(snapshot);

        let mergeFailed = false;
        if (options?.mergeLocal) {
          mergeFailed = (await pushLocalDataOnceRef.current?.(snapshot)) ?? false;
          if (!mergeFailed) {
            const refreshed = await fetchAllFromCloud();
            applySnapshot(refreshed);
          }
        }

        const hasFailure =
          mergeFailed ||
          Object.entries(snapshot).some(
            ([key, value]) => key !== 'orgProfile' && value === null
          );

        setSyncState({
          state: hasFailure ? 'error' : 'ok',
          message: hasFailure ? 'Sebagian data gagal dimuat dari cloud.' : undefined,
          lastSyncedAt: new Date().toISOString(),
        });
        return !hasFailure;
      } catch (err) {
        setSyncState({
          state: 'error',
          message: err instanceof Error ? err.message : 'Sinkronisasi gagal.',
        });
        return false;
      } finally {
        syncingRef.current = false;
      }
    },
    [applySnapshot]
  );

  /**
   * One-time migration of this device's local data into the cloud.
   * Only runs when the browser already had app data before this update, so a
   * brand new device never overwrites the cloud with seed/demo values.
   */
  const pushLocalDataOnce = useCallback(
    async (snapshot: CloudSnapshot): Promise<boolean> => {
      // Perangkat baru (belum pernah menyimpan data) tidak boleh menimpa cloud.
      if (!hadLocalHistory) return false;

      // Pastikan perangkat ini benar-benar punya data untuk disumbangkan.
      // Perangkat baru yang sudah pernah membuka aplikasi hanya berisi data
      // hasil tarikan cloud (array kosong), jadi tidak boleh dianggap sumber.
      const normalise = (value: unknown) => (value === null || value === undefined ? '' : value);
      const profileFields: (keyof OrgProfile)[] = [
        'logoUrl',
        'heroPhotoUrl',
        'visionPhotoUrl',
        'ketuaPhotoUrl',
        'ketuaName',
        'ketuaPeriod',
        'ketuaWelcomeTitle',
        'ketuaSpeech',
        'motto',
        'appName',
        'bankName',
        'bankAccountNumber',
        'bankAccountHolder',
        'monthlyDueAmount',
        'registrationGFormUrl',
        'registrationNotice',
        'isRegistrationOpen',
      ];
      const cloudProfile = snapshot.orgProfile;
      const profileDiffers =
        !cloudProfile ||
        profileFields.some(
          (field) => normalise(orgProfile[field]) !== normalise(cloudProfile[field])
        );

      // Hanya hitung sebagai kontribusi jika cloud memang belum punya datanya.
      const cloudIsEmpty = (rows: unknown[] | null) => Array.isArray(rows) && rows.length === 0;
      const cloudEventIds = new Set((snapshot.events ?? []).map((e) => e.id));
      const hasLocalOnlyEvents = events.some((e) => !cloudEventIds.has(e.id));
      const cloudAttendanceKeys = new Set(
        (snapshot.attendances ?? []).map((a) => `${stringToUuid(a.targetId)}-${stringToUuid(a.memberId)}`)
      );
      const hasLocalOnlyAttendances = attendances.some(
        (a) => !cloudAttendanceKeys.has(`${stringToUuid(a.targetId)}-${stringToUuid(a.memberId)}`)
      );

      const contributes =
        (cloudIsEmpty(snapshot.positions) && positions.length > 0) ||
        (cloudIsEmpty(snapshot.galleryPhotos) && galleryPhotos.length > 0) ||
        (cloudIsEmpty(snapshot.documents) && documents.length > 0) ||
        (cloudIsEmpty(snapshot.cashTransactions) && cashTransactions.length > 0) ||
        (cloudIsEmpty(snapshot.budgets) && budgets.length > 0) ||
        (cloudIsEmpty(snapshot.workPrograms) && workPrograms.length > 0) ||
        (cloudIsEmpty(snapshot.eventRegistrations) && eventRegistrations.length > 0) ||
        hasLocalOnlyEvents ||
        hasLocalOnlyAttendances ||
        profileDiffers;

      if (!contributes) return false;

      // Migrasi hanya sekali untuk seluruh organisasi.
      const meta = await getAppMeta(MERGE_META_KEY);
      if (meta) return false;

      let failed = false;

      // Profil (logo, hero, sambutan, pengaturan iuran) belum pernah tersimpan
      // ke cloud pada versi sebelumnya.
      if (profileDiffers && !(await saveOrgProfileToCloud(orgProfile))) failed = true;

      // Tables that were never synced before: only upload when the cloud is empty.
      const uploadIfCloudEmpty = async <T,>(
        cloudRows: T[] | null,
        localRows: T[],
        uploader: (row: T) => Promise<boolean>
      ) => {
        if (!cloudRows || cloudRows.length > 0 || localRows.length === 0) return;
        for (const row of localRows) {
          if (!(await uploader(row))) failed = true;
        }
      };

      await uploadIfCloudEmpty(snapshot.positions, positions, addPositionToCloud);
      await uploadIfCloudEmpty(snapshot.galleryPhotos, galleryPhotos, addGalleryPhotoToCloud);
      await uploadIfCloudEmpty(snapshot.documents, documents, addDocumentToCloud);
      await uploadIfCloudEmpty(snapshot.cashTransactions, cashTransactions, addCashTransactionToCloud);
      await uploadIfCloudEmpty(snapshot.budgets, budgets, addBudgetToCloud);
      await uploadIfCloudEmpty(
        snapshot.eventRegistrations,
        eventRegistrations,
        addEventRegistrationToCloud
      );

      // Work programs: union when cloud is empty (jobdesk tasks are stored too).
      if (snapshot.workPrograms && snapshot.workPrograms.length === 0) {
        for (const program of workPrograms) {
          if (!(await addWorkProgramToCloud(program))) failed = true;
        }
      }

      // Events: union by id so locally created activities are not lost.
      if (snapshot.events) {
        const cloudIds = new Set(snapshot.events.map((e) => e.id));
        for (const event of events) {
          if (cloudIds.has(event.id)) continue;
          if (!(await addEventToCloud(event))) failed = true;
        }
      }

      // Attendances: union by target + member.
      if (snapshot.attendances) {
        const cloudKeys = new Set(
          snapshot.attendances.map((a) => `${stringToUuid(a.targetId)}-${stringToUuid(a.memberId)}`)
        );
        for (const record of attendances) {
          const key = `${stringToUuid(record.targetId)}-${stringToUuid(record.memberId)}`;
          if (cloudKeys.has(key)) continue;
          if (!(await recordAttendanceToCloud(record))) failed = true;
        }
      }

      if (!failed) {
        await setAppMeta(MERGE_META_KEY, {
          at: new Date().toISOString(),
          tables: [
            'org_profiles',
            'positions',
            'gallery_photos',
            'documents',
            'cash_transactions',
            'budgets',
            'event_registrations',
            'work_programs',
            'events',
            'member_dues',
            'attendances',
          ],
        });
        showToast('Data lokal perangkat ini berhasil diunggah ke cloud.', 'success');
      }

      return failed;
    },
    [
      hadLocalHistory,
      orgProfile,
      positions,
      galleryPhotos,
      documents,
      cashTransactions,
      budgets,
      eventRegistrations,
      workPrograms,
      events,
      memberDues,
      attendances,
      showToast,
    ]
  );

  // Expose the one-time migration to runSync without a circular dependency.
  useEffect(() => {
    pushLocalDataOnceRef.current = pushLocalDataOnce;
  }, [pushLocalDataOnce]);

  useEffect(() => {
    if (bootstrappedRef.current) return;
    bootstrappedRef.current = true;
    void runSync({ mergeLocal: true });
  }, [runSync]);

  // ==========================================
  // REALTIME + FOCUS REFRESH
  // ==========================================

  const lastRefreshRef = useRef(0);
  const realtimeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const scheduleRefresh = useCallback(() => {
    if (realtimeTimer.current) clearTimeout(realtimeTimer.current);
    realtimeTimer.current = setTimeout(() => {
      void runSync({ silent: true });
    }, 900);
  }, [runSync]);

  useEffect(() => {
    if (!cloudConnected) return;
    const unsubscribe = subscribeToCloudChanges(scheduleRefresh);
    return () => {
      unsubscribe();
      if (realtimeTimer.current) clearTimeout(realtimeTimer.current);
    };
  }, [cloudConnected, scheduleRefresh]);

  useEffect(() => {
    if (!cloudConnected) return;
    const onFocus = () => {
      if (document.visibilityState === 'hidden') return;
      const now = Date.now();
      if (now - lastRefreshRef.current < 20000) return;
      lastRefreshRef.current = now;
      void runSync({ silent: true });
    };
    window.addEventListener('focus', onFocus);
    document.addEventListener('visibilitychange', onFocus);
    return () => {
      window.removeEventListener('focus', onFocus);
      document.removeEventListener('visibilitychange', onFocus);
    };
  }, [cloudConnected, runSync]);

  const syncNow = useCallback(async () => {
    const ok = await runSync({ silent: false });
    if (ok) {
      showToast('Sinkronisasi cloud berhasil diperbarui.', 'success');
    } else if (isCloudConnected()) {
      showToast('Sinkronisasi selesai dengan beberapa kendala. Cek pesan error.', 'error');
    }
    return ok;
  }, [runSync, showToast]);

  // ==========================================
  // AUTH
  // ==========================================

  const login = useCallback(
    async (identifier: string, password: string, remember = true): Promise<LoginResult> => {
      const cleanUser = identifier.trim();
      const cleanPass = password.trim();

      if (!cleanUser) {
        return { success: false, message: 'Harap masukkan NISN atau email akun pengurus.' };
      }
      if (!cleanPass) {
        return { success: false, message: 'Harap masukkan kata sandi.' };
      }
      if (cleanPass !== DEFAULT_PASSWORD) {
        return { success: false, message: 'Kata sandi salah. Periksa kembali kata sandi Anda.' };
      }

      let pool: Member[] = members;
      if (isCloudConnected()) {
        const fresh = await fetchMembersFromCloud();
        if (fresh && fresh.length > 0) {
          pool = fresh;
          setMembers(fresh);
        }
      }

      const needle = cleanUser.toLowerCase();
      const matched = pool.find(
        (m) =>
          (m.nisn || '').trim().toLowerCase() === needle ||
          (m.email || '').trim().toLowerCase() === needle
      );

      if (!matched) {
        return {
          success: false,
          message: `Akun "${cleanUser}" tidak terdaftar dalam database pengurus OSIS. Silakan periksa kembali NISN atau email Anda.`,
        };
      }

      if (!matched.isActive || matched.status === 'alumni') {
        return {
          success: false,
          message: 'Akun ini sudah tidak aktif (demisioner/alumni). Hubungi admin OSIS.',
        };
      }

      const stored: StoredSession = {
        memberId: matched.id,
        nisn: matched.nisn,
        remember,
      };
      setSession(stored);
      writeStoredSession(stored);
      setCurrentRole(matched.role);
      setActivePage('dashboard');

      return {
        success: true,
        message: `Berhasil masuk! Selamat datang, ${matched.fullName} (${matched.role
          .replace('_', ' ')
          .toUpperCase()}).`,
      };
    },
    [members]
  );

  const logout = useCallback(() => {
    clearStoredSession();
    setSession(null);
    setCurrentRole('ketua');
    setActivePage('portal-publik');
    showToast('Anda telah keluar dari sesi admin SMO.', 'info');
  }, [showToast]);

  // Legacy helper: set the signed-in member directly.
  const setCurrentUser = useCallback((m: Member) => {
    const stored: StoredSession = { memberId: m.id, nisn: m.nisn, remember: true };
    setSession(stored);
    writeStoredSession(stored);
    setCurrentRole(m.role);
  }, []);

  // If the stored session points to a member that no longer exists, sign out.
  useEffect(() => {
    if (!session) return;
    if (members.length === 0) return;
    const exists = members.some(
      (m) => m.id === session.memberId || (session.nisn && m.nisn === session.nisn)
    );
    if (!exists) {
      clearStoredSession();
      setSession(null);
    }
  }, [members, session]);

  // ==========================================
  // CLOUD WRITE HELPER
  // ==========================================

  const runCloudWrite = useCallback((operation: Promise<boolean> | null) => {
    if (!operation) return;
    operation
      .then((ok) => {
        if (!ok) {
          setSyncState((prev) => ({
            ...prev,
            state: 'error',
            message: 'Sebagian perubahan gagal tersimpan ke cloud.',
          }));
        }
      })
      .catch(() => {
        setSyncState((prev) => ({
          ...prev,
          state: 'error',
          message: 'Sebagian perubahan gagal tersimpan ke cloud.',
        }));
      });
  }, []);

  // ==========================================
  // MUTATORS
  // ==========================================

  const updateOrgProfile = (profile: Partial<OrgProfile>) => {
    const next: OrgProfile = { ...orgProfile, ...profile };
    setOrgProfile(next);
    runCloudWrite(saveOrgProfileToCloud(next));
    showToast('Profil organisasi berhasil diperbarui!');
  };

  // Divisions
  const addDivision = (div: Omit<Division, 'id'>) => {
    const newDiv: Division = { ...div, id: `div-${Date.now()}` };
    setDivisions((prev) => [...prev, newDiv]);
    runCloudWrite(addDivisionToCloud(newDiv));
    showToast(`Divisi ${newDiv.name} berhasil ditambahkan!`);
  };

  const updateDivision = (id: string, div: Partial<Division>) => {
    setDivisions((prev) => prev.map((d) => (d.id === id ? { ...d, ...div } : d)));
    runCloudWrite(updateDivisionInCloud(id, div));
    showToast('Divisi berhasil diperbarui!');
  };

  const deleteDivision = (id: string) => {
    setDivisions((prev) => prev.filter((d) => d.id !== id));
    runCloudWrite(deleteDivisionFromCloud(id));
    showToast('Divisi telah dihapus.', 'info');
  };

  // Positions
  const addPosition = (pos: Omit<Position, 'id'>) => {
    const newPos: Position = { ...pos, id: `pos-${Date.now()}` };
    setPositions((prev) => [...prev, newPos]);
    runCloudWrite(addPositionToCloud(newPos));
    showToast(`Jabatan ${newPos.name} ditambahkan!`);
  };

  const deletePosition = (id: string) => {
    setPositions((prev) => prev.filter((p) => p.id !== id));
    runCloudWrite(deletePositionFromCloud(id));
    showToast('Jabatan dihapus.', 'info');
  };

  // Members
  const addMember = (member: Omit<Member, 'id'>) => {
    const newMember: Member = { ...member, id: `mem-${Date.now()}` };
    setMembers((prev) => [...prev, newMember]);
    runCloudWrite(addMemberToCloud(newMember));
    showToast(`Anggota ${newMember.fullName} berhasil didaftarkan & disinkronkan ke Cloud!`);
  };

  const updateMember = (id: string, member: Partial<Member>) => {
    const existing = members.find((m) => m.id === id);
    if (existing?.role === 'admin') {
      showToast('Akses ditolak: Akun Admin IT Sekolah dilindungi sistem dan tidak dapat diubah.', 'error');
      return;
    }
    setMembers((prev) => prev.map((m) => (m.id === id ? { ...m, ...member } : m)));
    runCloudWrite(updateMemberInCloud(id, member));
    showToast('Data anggota berhasil diperbarui & disinkronkan ke Cloud!');
  };

  const deleteMember = (id: string) => {
    const existing = members.find((m) => m.id === id);
    if (existing?.role === 'admin') {
      showToast('Akses ditolak: Akun Admin IT Sekolah dilindungi sistem dan tidak dapat dihapus.', 'error');
      return;
    }
    setMembers((prev) => prev.filter((m) => m.id !== id));
    runCloudWrite(deleteMemberFromCloud(id));
    setAttendances((prev) => prev.filter((a) => a.memberId !== id));
    setMemberDues((prev) => prev.filter((d) => d.memberId !== id));
    showToast('Anggota dan riwayat terkait telah dihapus.', 'info');
  };

  // Theme
  const [theme, setThemeState] = useState<'light' | 'dark'>(() => {
    try {
      const saved = localStorage.getItem('schoolorg_theme_v3');
      if (saved === 'dark' || saved === 'light') return saved;
      return 'light';
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

  const setTheme = (t: 'light' | 'dark') => setThemeState(t);
  const toggleTheme = () => setThemeState((prev) => (prev === 'dark' ? 'light' : 'dark'));

  // Work Programs
  const addWorkProgram = (proker: Omit<WorkProgram, 'id' | 'createdAt'>) => {
    const newProker: WorkProgram = {
      ...proker,
      id: `proker-${Date.now()}`,
      createdAt: new Date().toISOString().split('T')[0],
      tasks: proker.tasks || [],
    };
    setWorkPrograms((prev) => [...prev, newProker]);
    runCloudWrite(addWorkProgramToCloud(newProker));
    showToast(`Program Kerja "${newProker.title}" berhasil diajukan!`);
  };

  const updateWorkProgram = (id: string, proker: Partial<WorkProgram>) => {
    setWorkPrograms((prev) => prev.map((p) => (p.id === id ? { ...p, ...proker } : p)));
    runCloudWrite(updateWorkProgramInCloud(id, proker));
    showToast('Program kerja berhasil diperbarui!');
  };

  const deleteWorkProgram = (id: string) => {
    setWorkPrograms((prev) => prev.filter((p) => p.id !== id));
    runCloudWrite(deleteWorkProgramFromCloud(id));
    showToast('Program kerja dihapus.', 'info');
  };

  // Proker tasks
  const addProkerTask = (prokerId: string, task: Omit<ProkerTask, 'id'>) => {
    const target = workPrograms.find((p) => p.id === prokerId);
    if (!target) return;
    const newTask: ProkerTask = {
      ...task,
      id: `task-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    };
    const nextTasks = [...(target.tasks || []), newTask];
    const completedCount = nextTasks.filter((t) => t.isCompleted).length;
    const autoProgress = Math.round((completedCount / nextTasks.length) * 100);

    setWorkPrograms((prev) =>
      prev.map((p) =>
        p.id === prokerId
          ? { ...p, tasks: nextTasks, progressPercent: autoProgress }
          : p
      )
    );
    runCloudWrite(
      updateWorkProgramInCloud(prokerId, {
        tasks: nextTasks,
        progressPercent: autoProgress,
      })
    );
    showToast('Tugas baru berhasil ditambahkan!');
  };

  const toggleProkerTask = (prokerId: string, taskId: string) => {
    const target = workPrograms.find((p) => p.id === prokerId);
    if (!target) return;
    const nextTasks = (target.tasks || []).map((t) =>
      t.id === taskId ? { ...t, isCompleted: !t.isCompleted } : t
    );
    const completedCount = nextTasks.filter((t) => t.isCompleted).length;
    const autoProgress =
      nextTasks.length > 0 ? Math.round((completedCount / nextTasks.length) * 100) : 0;
    const nextStatus =
      autoProgress === 100
        ? 'selesai'
        : autoProgress > 0 && target.status === 'disetujui'
          ? 'berjalan'
          : target.status;

    setWorkPrograms((prev) =>
      prev.map((p) =>
        p.id === prokerId
          ? { ...p, tasks: nextTasks, progressPercent: autoProgress, status: nextStatus }
          : p
      )
    );
    runCloudWrite(
      updateWorkProgramInCloud(prokerId, {
        tasks: nextTasks,
        progressPercent: autoProgress,
        status: nextStatus,
      })
    );
  };

  const deleteProkerTask = (prokerId: string, taskId: string) => {
    const target = workPrograms.find((p) => p.id === prokerId);
    if (!target) return;
    const nextTasks = (target.tasks || []).filter((t) => t.id !== taskId);
    const completedCount = nextTasks.filter((t) => t.isCompleted).length;
    const autoProgress =
      nextTasks.length > 0 ? Math.round((completedCount / nextTasks.length) * 100) : 0;

    setWorkPrograms((prev) =>
      prev.map((p) =>
        p.id === prokerId
          ? { ...p, tasks: nextTasks, progressPercent: autoProgress }
          : p
      )
    );
    runCloudWrite(
      updateWorkProgramInCloud(prokerId, {
        tasks: nextTasks,
        progressPercent: autoProgress,
      })
    );
    showToast('Tugas kepanitiaan dihapus.', 'info');
  };

  // Events
  const addEvent = (evt: Omit<EventItem, 'id'>) => {
    const newEvt: EventItem = { ...evt, id: `evt-${Date.now()}` };
    setEvents((prev) => [...prev, newEvt]);
    runCloudWrite(addEventToCloud(newEvt));
    showToast(`Kegiatan "${newEvt.title}" berhasil dijadwalkan!`);
  };

  const updateEvent = (id: string, evt: Partial<EventItem>) => {
    setEvents((prev) => prev.map((e) => (e.id === id ? { ...e, ...evt } : e)));
    runCloudWrite(updateEventInCloud(id, evt));
    showToast('Kegiatan berhasil diperbarui!');
  };

  const deleteEvent = (id: string) => {
    setEvents((prev) => prev.filter((e) => e.id !== id));
    runCloudWrite(deleteEventFromCloud(id));
    showToast('Kegiatan dihapus.', 'info');
  };

  const addEventPhoto = (eventId: string, photoUrl: string) => {
    if (!photoUrl) return;
    const target = events.find((e) => e.id === eventId);
    if (!target) return;
    const nextPhotos = [...(target.documentationPhotos || []), photoUrl];
    setEvents((prev) =>
      prev.map((e) => (e.id === eventId ? { ...e, documentationPhotos: nextPhotos } : e))
    );
    runCloudWrite(updateEventInCloud(eventId, { documentationPhotos: nextPhotos }));
    showToast('Foto dokumentasi berhasil ditambahkan!');
  };

  const removeEventPhoto = (eventId: string, photoIndexOrUrl: number | string) => {
    const target = events.find((e) => e.id === eventId);
    if (!target) return;
    const photos = target.documentationPhotos || [];
    const nextPhotos =
      typeof photoIndexOrUrl === 'number'
        ? photos.filter((_, i) => i !== photoIndexOrUrl)
        : photos.filter((p) => p !== photoIndexOrUrl);

    setEvents((prev) =>
      prev.map((e) => (e.id === eventId ? { ...e, documentationPhotos: nextPhotos } : e))
    );
    runCloudWrite(updateEventInCloud(eventId, { documentationPhotos: nextPhotos }));
    showToast('Foto dokumentasi telah dihapus.', 'info');
  };

  // Meetings
  const addMeeting = (meet: Omit<Meeting, 'id'>) => {
    const newMeet: Meeting = { ...meet, id: `meet-${Date.now()}` };
    setMeetings((prev) => [...prev, newMeet]);
    runCloudWrite(addMeetingToCloud(newMeet));
    showToast(`Rapat "${newMeet.title}" dijadwalkan!`);
  };

  const updateMeeting = (id: string, meet: Partial<Meeting>) => {
    setMeetings((prev) => prev.map((m) => (m.id === id ? { ...m, ...meet } : m)));
    runCloudWrite(updateMeetingInCloud(id, meet));
    showToast('Data rapat berhasil diperbarui!');
  };

  const deleteMeeting = (id: string) => {
    setMeetings((prev) => prev.filter((m) => m.id !== id));
    runCloudWrite(deleteMeetingFromCloud(id));
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
    const now = new Date();
    const hh = String(now.getHours()).padStart(2, '0');
    const mm = String(now.getMinutes()).padStart(2, '0');
    const newAtt: AttendanceRecord = {
      ...record,
      id: `att-${Date.now()}`,
      checkInTime: `${hh}:${mm} WIB`,
      major: normalizeMajor(record.major),
      notes: record.notes || 'Hadir',
    };
    setAttendances((prev) => [newAtt, ...prev]);
    runCloudWrite(recordAttendanceToCloud(newAtt));
    showToast(`Presensi berhasil: ${newAtt.memberName} (${newAtt.status.toUpperCase()})`);
    return { success: true, message: 'Presensi berhasil dicatat!' };
  };

  const updateAttendanceStatus = (
    id: string,
    status: AttendanceRecord['status'],
    notes?: string
  ) => {
    const current = attendances.find((a) => a.id === id);
    const nextNotes = notes !== undefined ? notes : current?.notes;
    setAttendances((prev) =>
      prev.map((a) => (a.id === id ? { ...a, status, notes: nextNotes } : a))
    );
    runCloudWrite(updateAttendanceInCloud(id, { status, notes: nextNotes }));
    showToast('Status presensi diperbarui!');
  };

  // Cash
  const addCashTransaction = (trx: Omit<CashTransaction, 'id'>) => {
    const newTrx: CashTransaction = { ...trx, id: `trx-${Date.now()}` };
    setCashTransactions((prev) => [newTrx, ...prev]);
    runCloudWrite(addCashTransactionToCloud(newTrx));
    showToast(
      `Transaksi ${trx.type} sebesar Rp ${trx.amount.toLocaleString()} berhasil dicatat!`
    );
  };

  const deleteCashTransaction = (id: string) => {
    setCashTransactions((prev) => prev.filter((t) => t.id !== id));
    runCloudWrite(deleteCashTransactionFromCloud(id));
    showToast('Catatan transaksi dihapus.', 'info');
  };

  // Member dues
  const updateMemberDueStatus = (
    id: string,
    status: MemberDue['status'],
    verifiedBy?: string
  ) => {
    const due = memberDues.find((d) => d.id === id);
    const nextVerifiedBy =
      verifiedBy || (status === 'lunas' ? currentUser.fullName : undefined);
    const nextVerifiedAt = status === 'lunas' ? new Date().toISOString() : undefined;

    setMemberDues((prev) =>
      prev.map((d) =>
        d.id === id
          ? { ...d, status, verifiedBy: nextVerifiedBy, verifiedAt: nextVerifiedAt }
          : d
      )
    );
    runCloudWrite(
      updateMemberDueInCloud(id, {
        status,
        verifiedBy: nextVerifiedBy,
        verifiedAt: nextVerifiedAt,
      })
    );

    if (status === 'lunas' && due) {
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
    showToast(`Status iuran kas diperbarui: ${status.replace('_', ' ').toUpperCase()}`);
  };

  const uploadMemberDueProof = (id: string, proofUrl: string) => {
    const paidAt = new Date().toISOString().split('T')[0];
    setMemberDues((prev) =>
      prev.map((d) =>
        d.id === id ? { ...d, proofUrl, status: 'menunggu_verifikasi', paidAt } : d
      )
    );
    runCloudWrite(
      updateMemberDueInCloud(id, { proofUrl, status: 'menunggu_verifikasi', paidAt })
    );
    showToast('Bukti transfer berhasil diunggah! Menunggu verifikasi Bendahara.');
  };

  // Budgets
  const addBudget = (b: Omit<BudgetPlan, 'id'>) => {
    const newB: BudgetPlan = { ...b, id: `bud-${Date.now()}` };
    setBudgets((prev) => [...prev, newB]);
    runCloudWrite(addBudgetToCloud(newB));
    showToast('Anggaran RAB berhasil ditambahkan!');
  };

  const updateBudget = (id: string, b: Partial<BudgetPlan>) => {
    setBudgets((prev) => prev.map((item) => (item.id === id ? { ...item, ...b } : item)));
    runCloudWrite(updateBudgetInCloud(id, b));
    showToast('Anggaran RAB berhasil diperbarui!');
  };

  const deleteBudget = (id: string) => {
    setBudgets((prev) => prev.filter((b) => b.id !== id));
    runCloudWrite(deleteBudgetFromCloud(id));
    showToast('Anggaran dihapus.', 'info');
  };

  // Documents
  const addDocument = (doc: Omit<DocumentItem, 'id'>) => {
    const newDoc: DocumentItem = { ...doc, id: `doc-${Date.now()}` };
    setDocuments((prev) => [newDoc, ...prev]);
    runCloudWrite(addDocumentToCloud(newDoc));
    showToast(`Dokumen "${newDoc.title}" berhasil diarsipkan!`);
  };

  const deleteDocument = (id: string) => {
    setDocuments((prev) => prev.filter((d) => d.id !== id));
    runCloudWrite(deleteDocumentFromCloud(id));
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
    runCloudWrite(addAnnouncementToCloud(newAnn));
    showToast('Pengumuman baru telah diterbitkan!');
  };

  const deleteAnnouncement = (id: string) => {
    setAnnouncements((prev) => prev.filter((a) => a.id !== id));
    runCloudWrite(deleteAnnouncementFromCloud(id));
    showToast('Pengumuman dihapus.', 'info');
  };

  // Aspirations
  const addAspiration = (asp: Omit<StudentAspiration, 'id' | 'date' | 'status' | 'likes'>) => {
    const newAsp: StudentAspiration = {
      ...asp,
      id: `asp-${Date.now()}`,
      date: new Date().toISOString().split('T')[0],
      status: 'diterima',
      likes: 1,
    };
    setAspirations((prev) => [newAsp, ...prev]);
    runCloudWrite(addAspirationToCloud(newAsp));
    showToast('Aspirasi Anda berhasil dikirim dan akan ditinjau oleh Pengurus OSIS!', 'success');
  };

  const likeAspiration = (id: string) => {
    const target = aspirations.find((a) => a.id === id);
    if (!target) return;
    const nextLikes = target.likes + 1;
    setAspirations((prev) =>
      prev.map((a) => (a.id === id ? { ...a, likes: nextLikes } : a))
    );
    runCloudWrite(updateAspirationInCloud(id, { likes: nextLikes }));
    showToast('Dukungan aspirasi berhasil ditambahkan!');
  };

  const updateAspirationStatus = (
    id: string,
    status: StudentAspiration['status'],
    response?: string,
    respondedBy?: string
  ) => {
    const responder = respondedBy || currentUser.fullName;
    const target = aspirations.find((a) => a.id === id);
    const nextResponse = response !== undefined ? response : target?.response;

    setAspirations((prev) =>
      prev.map((a) =>
        a.id === id
          ? { ...a, status, response: nextResponse, respondedBy: responder }
          : a
      )
    );
    runCloudWrite(
      updateAspirationInCloud(id, {
        status,
        response: nextResponse,
        respondedBy: responder,
      })
    );
    showToast(`Status aspirasi diperbarui menjadi: ${status.toUpperCase()}`);
  };

  const deleteAspiration = (id: string) => {
    setAspirations((prev) => prev.filter((a) => a.id !== id));
    runCloudWrite(deleteAspirationFromCloud(id));
    showToast('Pesan ide & aspirasi berhasil dihapus.', 'info');
  };

  // Recruitment
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
    runCloudWrite(addRecruitmentToCloud(newRec));
    showToast(
      'Pendaftaran Oprec berhasil terkirim ke sistem pengurus OSIS!',
      'success'
    );
    return newRec;
  };

  const updateRecruitment = (id: string, partial: Partial<RecruitmentApplication>) => {
    setRecruitments((prev) => prev.map((r) => (r.id === id ? { ...r, ...partial } : r)));
    runCloudWrite(updateRecruitmentInCloud(id, partial));
    showToast('Status pendaftaran calon anggota diperbarui!');
  };

  const deleteRecruitment = (id: string) => {
    setRecruitments((prev) => prev.filter((r) => r.id !== id));
    runCloudWrite(deleteRecruitmentFromCloud(id));
    showToast('Data pendaftaran berhasil dihapus');
  };

  const approveRecruitmentToMember = (
    recruitmentId: string,
    customDivisionId?: string,
    customPosition?: string
  ) => {
    const rec = recruitments.find((r) => r.id === recruitmentId);
    if (!rec) {
      showToast('Data calon pendaftar tidak ditemukan!', 'error');
      return;
    }

    const isDuplicate = members.some((m) => m.nisn.trim() === rec.nisn.trim());
    if (isDuplicate) {
      showToast(`Siswa dengan NISN "${rec.nisn}" sudah terdaftar sebagai anggota resmi!`, 'error');
      return;
    }

    const targetDivision =
      divisions.find((d) => d.id === customDivisionId) ||
      divisions.find(
        (d) =>
          d.id === rec.divisionChoice1 ||
          d.name.toLowerCase() === rec.divisionChoice1.toLowerCase()
      ) ||
      divisions[0];

    const newMember: Omit<Member, 'id'> = {
      nisn: rec.nisn,
      fullName: rec.fullName,
      email: rec.email || `${rec.nisn}@student.smk.id`,
      role: 'anggota',
      grade: rec.grade,
      classRoom: rec.classRoom,
      major: rec.major,
      divisionId: targetDivision?.id || '',
      divisionName: targetDivision?.name || 'BPH',
      position: customPosition || 'Anggota Sekbid',
      phone: rec.phone,
      avatarUrl:
        'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
      isActive: true,
      status: 'aktif',
      joinDate: new Date().toISOString().split('T')[0],
      generation: `Angkatan ${orgProfile.academicYear}`,
    };

    addMember(newMember);
    updateRecruitment(recruitmentId, { status: 'diterima' });
    showToast(
      `Selamat! ${rec.fullName} resmi diterima sebagai anggota dan KTA telah diterbitkan!`,
      'success'
    );
  };

  // Event registrations
  const registerForEvent = (
    reg: Omit<EventRegistration, 'id' | 'ticketCode' | 'registeredAt'>
  ): EventRegistration => {
    const randomCode = Math.floor(1000 + Math.random() * 9000);
    const newReg: EventRegistration = {
      ...reg,
      id: `evtr-${Date.now()}`,
      ticketCode: `TKT-${randomCode}`,
      registeredAt: new Date().toLocaleString('id-ID', {
        dateStyle: 'short',
        timeStyle: 'short',
      }),
    };
    setEventRegistrations((prev) => [newReg, ...prev]);
    runCloudWrite(addEventRegistrationToCloud(newReg));
    showToast(`Tiket pendaftaran ${newReg.ticketCode} berhasil diterbitkan!`, 'success');
    return newReg;
  };

  const deleteEventRegistration = (id: string) => {
    setEventRegistrations((prev) => prev.filter((r) => r.id !== id));
    runCloudWrite(deleteEventRegistrationFromCloud(id));
    showToast('Data pendaftaran kegiatan berhasil dihapus', 'info');
  };

  // Gallery
  const addGalleryPhoto = (photo: Omit<GalleryItem, 'id'>) => {
    const newPhoto: GalleryItem = { ...photo, id: `g-${Date.now()}` };
    setGalleryPhotos((prev) => [newPhoto, ...prev]);
    runCloudWrite(addGalleryPhotoToCloud(newPhoto));
    showToast('Foto dokumentasi baru berhasil ditambahkan!');
  };

  const updateGalleryPhoto = (id: string, photo: Partial<GalleryItem>) => {
    setGalleryPhotos((prev) => prev.map((p) => (p.id === id ? { ...p, ...photo } : p)));
    runCloudWrite(updateGalleryPhotoInCloud(id, photo));
    showToast('Foto dokumentasi berhasil diperbarui!');
  };

  const deleteGalleryPhoto = (id: string) => {
    setGalleryPhotos((prev) => prev.filter((p) => p.id !== id));
    runCloudWrite(deleteGalleryPhotoFromCloud(id));
    showToast('Foto dokumentasi telah dihapus.', 'info');
  };

  const resetGalleryPhotos = () => {
    const previous = galleryPhotos;
    setGalleryPhotos(DEFAULT_GALLERY_PHOTOS);
    runCloudWrite(
      (async () => {
        for (const photo of previous) {
          await deleteGalleryPhotoFromCloud(photo.id);
        }
        for (const photo of DEFAULT_GALLERY_PHOTOS) {
          await addGalleryPhotoToCloud(photo);
        }
        return true;
      })()
    );
    showToast('Galeri foto telah direset ke dokumentasi bawaan.');
  };

  // Testimonials / Cerita Pengurus
  const addTestimonial = (item: Omit<TestimonialItem, 'id'>) => {
    const newItem: TestimonialItem = { ...item, id: `t-${Date.now()}` };
    setTestimonials((prev) => [...prev, newItem]);
    showToast('Cerita pengurus berhasil ditambahkan!', 'success');
  };

  const updateTestimonial = (id: string, item: Partial<TestimonialItem>) => {
    setTestimonials((prev) =>
      prev.map((t) => (t.id === id ? { ...t, ...item } : t))
    );
    showToast('Cerita pengurus berhasil diperbarui!', 'success');
  };

  const deleteTestimonial = (id: string) => {
    setTestimonials((prev) => prev.filter((t) => t.id !== id));
    showToast('Cerita pengurus telah dihapus.', 'info');
  };

  const resetTestimonials = () => {
    setTestimonials(DEFAULT_TESTIMONIALS);
    showToast('Cerita pengurus telah direset ke bawaan.', 'info');
  };

  // ==========================================
  // RESET / IMPORT (ADMIN ONLY)
  // ==========================================

  const buildSnapshot = (overrides: Partial<LocalSnapshot> = {}): LocalSnapshot => ({
    orgProfile,
    divisions,
    positions,
    members,
    workPrograms,
    events,
    meetings,
    attendances,
    cashTransactions,
    memberDues,
    budgets,
    documents,
    announcements,
    aspirations,
    recruitments,
    eventRegistrations,
    galleryPhotos,
    ...overrides,
  });

  const resetAllData = () => {
    const snapshot: LocalSnapshot = {
      orgProfile: initialOrgProfile,
      divisions: initialDivisions,
      positions: initialPositions,
      members: initialMembers,
      workPrograms: initialWorkPrograms,
      events: initialEvents,
      meetings: initialMeetings,
      attendances: initialAttendances,
      cashTransactions: initialCashTransactions,
      memberDues: initialMemberDues,
      budgets: initialBudgets,
      documents: initialDocuments,
      announcements: initialAnnouncements,
      aspirations: initialAspirations,
      recruitments: initialRecruitments,
      eventRegistrations: initialEventRegistrations,
      galleryPhotos: DEFAULT_GALLERY_PHOTOS,
    };

    setOrgProfile(snapshot.orgProfile);
    setDivisions(snapshot.divisions);
    setPositions(snapshot.positions);
    setMembers(snapshot.members);
    setWorkPrograms(snapshot.workPrograms);
    setEvents(snapshot.events);
    setMeetings(snapshot.meetings);
    setAttendances(snapshot.attendances);
    setCashTransactions(snapshot.cashTransactions);
    setMemberDues(snapshot.memberDues);
    setBudgets(snapshot.budgets);
    setDocuments(snapshot.documents);
    setAnnouncements(snapshot.announcements);
    setAspirations(snapshot.aspirations);
    setRecruitments(snapshot.recruitments);
    setEventRegistrations(snapshot.eventRegistrations);
    setGalleryPhotos(snapshot.galleryPhotos);

    if (isCloudConnected()) {
      setSyncState({ state: 'syncing', message: 'Mengosongkan & memuat ulang data cloud...' });
      void replaceCloudWithSnapshot(snapshot).then((ok) => {
        setSyncState({
          state: ok ? 'ok' : 'error',
          message: ok ? undefined : 'Reset cloud gagal sebagian.',
          lastSyncedAt: new Date().toISOString(),
        });
      });
    }

    showToast('Data berhasil di-reset ke nilai default UKK!', 'info');
  };

  const importAllData = (jsonData: string): boolean => {
    try {
      const parsed = JSON.parse(jsonData) as Partial<LocalSnapshot>;
      const next = buildSnapshot(parsed);

      setOrgProfile(next.orgProfile);
      setDivisions(next.divisions);
      setPositions(next.positions);
      setMembers(next.members);
      setWorkPrograms(next.workPrograms);
      setEvents(next.events);
      setMeetings(next.meetings);
      setAttendances(next.attendances);
      setCashTransactions(next.cashTransactions);
      setMemberDues(next.memberDues);
      setBudgets(next.budgets);
      setDocuments(next.documents);
      setAnnouncements(next.announcements);
      setAspirations(next.aspirations);
      setRecruitments(next.recruitments);
      setEventRegistrations(next.eventRegistrations);
      setGalleryPhotos(next.galleryPhotos);

      if (isCloudConnected()) {
        void replaceCloudWithSnapshot(next);
      }

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
        isAuthenticated,
        login,
        logout,
        cloudConnected,
        syncState,
        syncNow,
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
        removeEventPhoto,
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
        deleteAspiration,
        recruitments,
        addRecruitment,
        updateRecruitment,
        deleteRecruitment,
        approveRecruitmentToMember,
        keanggotaanTab,
        setKeanggotaanTab,
        eventRegistrations,
        registerForEvent,
        deleteEventRegistration,
        galleryPhotos,
        addGalleryPhoto,
        updateGalleryPhoto,
        deleteGalleryPhoto,
        resetGalleryPhotos,
        testimonials,
        addTestimonial,
        updateTestimonial,
        deleteTestimonial,
        resetTestimonials,
        theme,
        setTheme,
        toggleTheme,
        toast,
        toasts,
        dismissToast,
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

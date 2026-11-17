import { supabase, isSupabaseConfigured, compressImageForCloud } from './supabase';
import {
  Member,
  Division,
  Position,
  Meeting,
  AttendanceRecord,
  Announcement,
  OrgProfile,
  RecruitmentApplication,
  StudentAspiration,
  WorkProgram,
  EventItem,
  CashTransaction,
  MemberDue,
  BudgetPlan,
  DocumentItem,
  GalleryItem,
  EventRegistration,
} from '../types';

/**
 * Helper to convert any string ID into a deterministic RFC-4122 v4 UUID.
 * Ensures consistency between local string IDs ('mem-1', 'div-bph') and
 * Postgres UUID columns.
 */
export function stringToUuid(str: string): string {
  if (/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(str)) {
    return str.toLowerCase();
  }
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash |= 0;
  }
  const hex = Math.abs(hash).toString(16).padStart(8, '0');
  const hexPadded = (hex + '1234567890abcdef1234567890abcdef').slice(0, 32);
  return [
    hexPadded.substring(0, 8),
    hexPadded.substring(8, 12),
    '4' + hexPadded.substring(13, 16),
    'a' + hexPadded.substring(17, 20),
    hexPadded.substring(20, 32),
  ].join('-');
}

export const isCloudConnected = () => isSupabaseConfigured() && Boolean(supabase);

// ==========================================
// ERROR REPORTING
// Setiap kegagalan sinkronisasi dilaporkan ke UI, tidak lagi ditelan diam-diam.
// ==========================================

type SyncErrorHandler = (message: string) => void;

let syncErrorHandler: SyncErrorHandler | null = null;
let lastErrorSignature = '';
let lastErrorAt = 0;

export function setSyncErrorHandler(handler: SyncErrorHandler | null) {
  syncErrorHandler = handler;
}

function notifyError(scope: string, error: unknown) {
  const detail =
    error && typeof error === 'object' && 'message' in error
      ? String((error as { message?: unknown }).message)
      : String(error);
  const message = `${scope}: ${detail}`;
  const now = Date.now();
  if (message === lastErrorSignature && now - lastErrorAt < 8000) return;
  lastErrorSignature = message;
  lastErrorAt = now;
  console.warn('[SMO Cloud]', message);
  syncErrorHandler?.(message);
}

// ==========================================
// GENERIC HELPERS
// ==========================================

async function selectRows<T>(
  table: string,
  label: string,
  mapper: (row: any) => T,
  order?: { column: string; ascending?: boolean }
): Promise<T[] | null> {
  if (!supabase) return null;
  try {
    let query = supabase.from(table).select('*');
    if (order) query = query.order(order.column, { ascending: order.ascending ?? true });
    const { data, error } = await query;
    if (error) {
      notifyError(label, error);
      return null;
    }
    return (data ?? []).map(mapper);
  } catch (err) {
    notifyError(label, err);
    return null;
  }
}

async function upsertRows(
  table: string,
  rows: Record<string, any>[],
  label: string
): Promise<boolean> {
  if (!supabase) return false;
  const clean = rows.filter(Boolean);
  if (clean.length === 0) return true;
  try {
    for (let i = 0; i < clean.length; i += 20) {
      const chunk = clean.slice(i, i + 20);
      const { error } = await supabase.from(table).upsert(chunk);
      if (error) {
        notifyError(label, error);
        return false;
      }
    }
    return true;
  } catch (err) {
    notifyError(label, err);
    return false;
  }
}

async function updateRow(
  table: string,
  id: string,
  payload: Record<string, any>,
  label: string
): Promise<boolean> {
  if (!supabase) return false;
  if (Object.keys(payload).length === 0) return true;
  try {
    const { error } = await supabase.from(table).update(payload).eq('id', stringToUuid(id));
    if (error) {
      notifyError(label, error);
      return false;
    }
    return true;
  } catch (err) {
    notifyError(label, err);
    return false;
  }
}

async function deleteRow(table: string, id: string, label: string): Promise<boolean> {
  if (!supabase) return false;
  try {
    const { error } = await supabase.from(table).delete().eq('id', stringToUuid(id));
    if (error) {
      notifyError(label, error);
      return false;
    }
    return true;
  } catch (err) {
    notifyError(label, err);
    return false;
  }
}

async function deleteAllRows(table: string, label: string): Promise<boolean> {
  if (!supabase) return false;
  try {
    const { error } = await supabase
      .from(table)
      .delete()
      .neq('id', '00000000-0000-0000-0000-000000000000');
    if (error) {
      notifyError(label, error);
      return false;
    }
    return true;
  } catch (err) {
    notifyError(label, err);
    return false;
  }
}

/**
 * Foreign keys in Supabase will reject rows whose parent is unknown.
 * Convert unknown parents to NULL so the row itself is still saved.
 */
const knownDivisionIds = new Set<string>();
const knownMemberIds = new Set<string>();
const knownWorkProgramIds = new Set<string>();

function fkDivision(id?: string | null): string | null {
  if (!id) return null;
  const uuid = stringToUuid(id);
  return knownDivisionIds.has(uuid) ? uuid : null;
}

function fkMember(id?: string | null): string | null {
  if (!id) return null;
  const uuid = stringToUuid(id);
  return knownMemberIds.has(uuid) ? uuid : null;
}

function fkWorkProgram(id?: string | null): string | null {
  if (!id) return null;
  const uuid = stringToUuid(id);
  return knownWorkProgramIds.has(uuid) ? uuid : null;
}

const DEFAULT_AVATAR =
  'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80';

// ==========================================
// MEMBERS (ANGGOTA)
// ==========================================

function mapMember(row: any): Member {
  return {
    id: row.id,
    nisn: row.nisn || '',
    fullName: row.full_name || '',
    email: row.email || '',
    role: row.role,
    grade: row.grade || 'X',
    classRoom: row.class_room || '-',
    major: row.major || '-',
    divisionId: row.division_id || undefined,
    position: row.position || '',
    phone: row.phone || '',
    avatarUrl: row.avatar_url || DEFAULT_AVATAR,
    isActive: row.is_active ?? true,
    status: (row.status as 'aktif' | 'alumni') || 'aktif',
    joinDate: row.join_date || new Date().toISOString().split('T')[0],
    generation: row.generation || '',
    alumniYear: row.alumni_year || undefined,
  };
}

export async function fetchMembersFromCloud(): Promise<Member[] | null> {
  const members = await selectRows('members', 'Gagal memuat anggota', mapMember, {
    column: 'full_name',
    ascending: true,
  });
  if (members) {
    knownMemberIds.clear();
    members.forEach((m) => knownMemberIds.add(stringToUuid(m.id)));
  }
  return members;
}

function memberPayload(member: Member): Record<string, any> {
  return {
    id: stringToUuid(member.id),
    nisn: member.nisn,
    full_name: member.fullName,
    email: member.email || null,
    role: member.role,
    grade: member.grade,
    class_room: member.classRoom,
    major: member.major,
    division_id: fkDivision(member.divisionId),
    position: member.position,
    phone: member.phone,
    avatar_url: member.avatarUrl,
    is_active: member.isActive,
    status: member.status,
    join_date: member.joinDate || null,
    generation: member.generation,
    alumni_year: member.alumniYear || null,
  };
}

export async function addMemberToCloud(member: Member): Promise<boolean> {
  knownMemberIds.add(stringToUuid(member.id));
  let avatar = member.avatarUrl;
  if (avatar?.startsWith('data:image/')) {
    const uploaded = await uploadImageToStorage(avatar, `avatars/${stringToUuid(member.id)}.png`);
    avatar = uploaded || (await compressImageForCloud(avatar));
  }
  return upsertRows('members', [{ ...memberPayload(member), avatar_url: avatar }], 'Gagal menyimpan anggota');
}

export async function updateMemberInCloud(
  id: string,
  partial: Partial<Member>
): Promise<boolean> {
  const payload: Record<string, any> = {};
  if (partial.fullName !== undefined) payload.full_name = partial.fullName;
  if (partial.nisn !== undefined) payload.nisn = partial.nisn;
  if (partial.email !== undefined) payload.email = partial.email || null;
  if (partial.role !== undefined) payload.role = partial.role;
  if (partial.grade !== undefined) payload.grade = partial.grade;
  if (partial.classRoom !== undefined) payload.class_room = partial.classRoom;
  if (partial.major !== undefined) payload.major = partial.major;
  if (partial.position !== undefined) payload.position = partial.position;
  if (partial.phone !== undefined) payload.phone = partial.phone;
  if (partial.avatarUrl !== undefined) {
    let avatar = partial.avatarUrl;
    if (avatar?.startsWith('data:image/')) {
      const uploaded = await uploadImageToStorage(avatar, `avatars/${stringToUuid(id)}.png`);
      avatar = uploaded || (await compressImageForCloud(avatar));
    }
    payload.avatar_url = avatar;
  }
  if (partial.status !== undefined) payload.status = partial.status;
  if (partial.isActive !== undefined) payload.is_active = partial.isActive;
  if (partial.generation !== undefined) payload.generation = partial.generation;
  if (partial.alumniYear !== undefined) payload.alumni_year = partial.alumniYear || null;
  if (partial.divisionId !== undefined) payload.division_id = fkDivision(partial.divisionId);
  return updateRow('members', id, payload, 'Gagal memperbarui anggota');
}

export async function deleteMemberFromCloud(id: string): Promise<boolean> {
  knownMemberIds.delete(stringToUuid(id));
  return deleteRow('members', id, 'Gagal menghapus anggota');
}

// ==========================================
// DIVISIONS
// ==========================================

function mapDivision(row: any): Division {
  return {
    id: row.id,
    name: row.name,
    code: row.code,
    description: row.description || '',
    leaderName: row.leader_name || '',
  };
}

export async function fetchDivisionsFromCloud(): Promise<Division[] | null> {
  const divisions = await selectRows('divisions', 'Gagal memuat divisi', mapDivision, {
    column: 'name',
    ascending: true,
  });
  if (divisions) {
    knownDivisionIds.clear();
    divisions.forEach((d) => knownDivisionIds.add(stringToUuid(d.id)));
  }
  return divisions;
}

function divisionPayload(div: Division): Record<string, any> {
  return {
    id: stringToUuid(div.id),
    name: div.name,
    code: div.code || div.name.slice(0, 20),
    description: div.description || '',
    leader_name: div.leaderName || '',
  };
}

export async function addDivisionToCloud(div: Division): Promise<boolean> {
  knownDivisionIds.add(stringToUuid(div.id));
  return upsertRows('divisions', [divisionPayload(div)], 'Gagal menyimpan divisi');
}

export async function updateDivisionInCloud(
  id: string,
  partial: Partial<Division>
): Promise<boolean> {
  const payload: Record<string, any> = {};
  if (partial.name !== undefined) payload.name = partial.name;
  if (partial.code !== undefined) payload.code = partial.code;
  if (partial.description !== undefined) payload.description = partial.description;
  if (partial.leaderName !== undefined) payload.leader_name = partial.leaderName;
  return updateRow('divisions', id, payload, 'Gagal memperbarui divisi');
}

export async function deleteDivisionFromCloud(id: string): Promise<boolean> {
  knownDivisionIds.delete(stringToUuid(id));
  return deleteRow('divisions', id, 'Gagal menghapus divisi');
}

// ==========================================
// POSITIONS (JABATAN)
// ==========================================

function mapPosition(row: any): Position {
  return {
    id: row.id,
    name: row.name,
    level: Number(row.level) || 1,
    description: row.description || '',
  };
}

export async function fetchPositionsFromCloud(): Promise<Position[] | null> {
  return selectRows('positions', 'Gagal memuat jabatan', mapPosition, {
    column: 'level',
    ascending: true,
  });
}

function positionPayload(pos: Position): Record<string, any> {
  return {
    id: stringToUuid(pos.id),
    name: pos.name,
    level: pos.level,
    description: pos.description || '',
  };
}

export async function addPositionToCloud(pos: Position): Promise<boolean> {
  return upsertRows('positions', [positionPayload(pos)], 'Gagal menyimpan jabatan');
}

export async function updatePositionInCloud(
  id: string,
  partial: Partial<Position>
): Promise<boolean> {
  const payload: Record<string, any> = {};
  if (partial.name !== undefined) payload.name = partial.name;
  if (partial.level !== undefined) payload.level = partial.level;
  if (partial.description !== undefined) payload.description = partial.description;
  return updateRow('positions', id, payload, 'Gagal memperbarui jabatan');
}

export async function deletePositionFromCloud(id: string): Promise<boolean> {
  return deleteRow('positions', id, 'Gagal menghapus jabatan');
}

// ==========================================
// ORG PROFILE
// ==========================================

let orgProfileRowId: string | null = null;
const FALLBACK_ORG_PROFILE_ID = stringToUuid('smo-org-profile');

function mapOrgProfile(row: any): OrgProfile {
  return {
    name: row.name || '',
    appName: row.app_name || undefined,
    schoolName: row.school_name || '',
    academicYear: row.academic_year || '',
    vision: row.vision || '',
    mission: Array.isArray(row.mission) ? row.mission : [],
    visionPhotoUrl: row.vision_photo_url || undefined,
    heroPhotoUrl: row.hero_photo_url || undefined,
    history: row.history || '',
    logoUrl: row.logo_url || '',
    pembinaName: row.pembina_name || '',
    nipPembina: row.nip_pembina || undefined,
    headmasterName: row.headmaster_name || '',
    nipHeadmaster: row.nip_headmaster || undefined,
    ketuaName: row.ketua_name || '',
    nisnKetua: row.nisn_ketua || undefined,
    ketuaPhotoUrl: row.ketua_photo_url || undefined,
    ketuaPeriod: row.ketua_period || undefined,
    ketuaWelcomeTitle: row.ketua_welcome_title || undefined,
    ketuaSpeech: row.ketua_speech || undefined,
    motto: row.motto || undefined,
    address: row.address || '',
    phone: row.phone || '',
    email: row.email || '',
    instagram: row.instagram || '',
    monthlyDueAmount:
      row.monthly_due_amount === null || row.monthly_due_amount === undefined
        ? undefined
        : Number(row.monthly_due_amount),
    dueDueDay: row.due_due_day === null || row.due_due_day === undefined ? undefined : Number(row.due_due_day),
    bankName: row.bank_name || undefined,
    bankAccountNumber: row.bank_account_number || undefined,
    bankAccountHolder: row.bank_account_holder || undefined,
    isRegistrationOpen: row.is_registration_open ?? undefined,
    registrationGFormUrl: row.registration_gform_url || undefined,
    registrationOpenDate: row.registration_open_date || undefined,
    registrationCloseDate: row.registration_close_date || undefined,
    registrationNotice: row.registration_notice || undefined,
  };
}

export async function fetchOrgProfileFromCloud(): Promise<OrgProfile | null> {
  if (!supabase) return null;
  try {
    const { data, error } = await supabase
      .from('org_profiles')
      .select('*')
      .order('created_at', { ascending: true })
      .limit(1);
    if (error) {
      notifyError('Gagal memuat profil organisasi', error);
      return null;
    }
    if (!data || data.length === 0) {
      orgProfileRowId = null;
      return null;
    }
    orgProfileRowId = data[0].id;
    return mapOrgProfile(data[0]);
  } catch (err) {
    notifyError('Gagal memuat profil organisasi', err);
    return null;
  }
}

function orgProfilePayload(profile: OrgProfile): Record<string, any> {
  return {
    id: orgProfileRowId || FALLBACK_ORG_PROFILE_ID,
    name: profile.name,
    app_name: profile.appName || null,
    school_name: profile.schoolName,
    academic_year: profile.academicYear,
    vision: profile.vision,
    mission: profile.mission || [],
    history: profile.history,
    logo_url: profile.logoUrl || null,
    pembina_name: profile.pembinaName,
    nip_pembina: profile.nipPembina || null,
    headmaster_name: profile.headmasterName,
    nip_headmaster: profile.nipHeadmaster || null,
    ketua_name: profile.ketuaName,
    nisn_ketua: profile.nisnKetua || null,
    ketua_photo_url: profile.ketuaPhotoUrl || null,
    ketua_period: profile.ketuaPeriod || null,
    ketua_welcome_title: profile.ketuaWelcomeTitle || null,
    ketua_speech: profile.ketuaSpeech || null,
    motto: profile.motto || null,
    address: profile.address,
    phone: profile.phone,
    email: profile.email,
    instagram: profile.instagram,
    vision_photo_url: profile.visionPhotoUrl || null,
    hero_photo_url: profile.heroPhotoUrl || null,
    monthly_due_amount: profile.monthlyDueAmount ?? 15000,
    due_due_day: profile.dueDueDay ?? 25,
    bank_name: profile.bankName || null,
    bank_account_number: profile.bankAccountNumber || null,
    bank_account_holder: profile.bankAccountHolder || null,
    is_registration_open: profile.isRegistrationOpen ?? true,
    registration_gform_url: profile.registrationGFormUrl || null,
    registration_open_date: profile.registrationOpenDate || null,
    registration_close_date: profile.registrationCloseDate || null,
    registration_notice: profile.registrationNotice || null,
    updated_at: new Date().toISOString(),
  };
}

export async function saveOrgProfileToCloud(profile: OrgProfile): Promise<boolean> {
  if (!supabase) return false;
  try {
    // Pastikan kita gunakan ID baris yang ada di database agar tidak salah ID
    if (!orgProfileRowId) {
      const { data: existing } = await supabase
        .from('org_profiles')
        .select('id')
        .order('created_at', { ascending: true })
        .limit(1);
      if (existing && existing.length > 0) {
        orgProfileRowId = existing[0].id;
      }
    }

    const payload = orgProfilePayload(profile);

    // Upload base64 ke Supabase Storage (smo-images) agar menjadi CDN URL permanen & ringan
    const uploadIfBase64 = async (url: string | null | undefined, path: string) => {
      if (!url || !url.startsWith('data:image/')) return url ?? null;
      const uploaded = await uploadImageToStorage(url, path);
      if (uploaded) return uploaded;
      return compressImageForCloud(url);
    };

    if (payload.logo_url?.startsWith('data:')) {
      payload.logo_url = await uploadIfBase64(payload.logo_url, `logos/logo-${Date.now()}.png`);
    }
    if (payload.hero_photo_url?.startsWith('data:')) {
      payload.hero_photo_url = await uploadIfBase64(payload.hero_photo_url, `profile/hero-${Date.now()}.png`);
    }
    if (payload.ketua_photo_url?.startsWith('data:')) {
      payload.ketua_photo_url = await uploadIfBase64(payload.ketua_photo_url, `profile/ketua-${Date.now()}.png`);
    }
    if (payload.vision_photo_url?.startsWith('data:')) {
      payload.vision_photo_url = await uploadIfBase64(payload.vision_photo_url, `profile/vision-${Date.now()}.png`);
    }

    const { data, error } = await supabase
      .from('org_profiles')
      .upsert(payload, { onConflict: 'id' })
      .select('id');
    if (error) {
      notifyError('Gagal menyimpan profil organisasi', error);
      return false;
    }
    if (data && data.length > 0) orgProfileRowId = data[0].id;
    else orgProfileRowId = payload.id;
    return true;
  } catch (err) {
    notifyError('Gagal menyimpan profil organisasi', err);
    return false;
  }
}

// ==========================================
// WORK PROGRAMS (PROKER) + JOBDESK
// ==========================================

function mapWorkProgram(row: any): WorkProgram {
  return {
    id: row.id,
    divisionId: row.division_id || '',
    divisionName: row.division_name || '',
    title: row.title,
    description: row.description || '',
    estimatedBudget: Number(row.estimated_budget) || 0,
    targetDate: row.target_date || new Date().toISOString().split('T')[0],
    status: row.status || 'draft',
    progressPercent: Number(row.progress_percent) || 0,
    proposalUrl: row.proposal_url || undefined,
    lpjUrl: row.lpj_url || undefined,
    evaluation: row.evaluation || undefined,
    createdAt: row.created_at || new Date().toISOString().split('T')[0],
    tasks: Array.isArray(row.tasks) ? row.tasks : [],
  };
}

export async function fetchWorkProgramsFromCloud(): Promise<WorkProgram[] | null> {
  const programs = await selectRows(
    'work_programs',
    'Gagal memuat program kerja',
    mapWorkProgram,
    { column: 'created_at', ascending: false }
  );
  if (programs) {
    knownWorkProgramIds.clear();
    programs.forEach((p) => knownWorkProgramIds.add(stringToUuid(p.id)));
  }
  return programs;
}

function workProgramPayload(p: WorkProgram): Record<string, any> {
  return {
    id: stringToUuid(p.id),
    division_id: fkDivision(p.divisionId),
    division_name: p.divisionName || null,
    title: p.title,
    description: p.description || '',
    estimated_budget: p.estimatedBudget || 0,
    target_date: p.targetDate || null,
    status: p.status,
    progress_percent: p.progressPercent || 0,
    proposal_url: p.proposalUrl || null,
    lpj_url: p.lpjUrl || null,
    evaluation: p.evaluation || null,
    tasks: p.tasks || [],
  };
}

export async function addWorkProgramToCloud(p: WorkProgram): Promise<boolean> {
  knownWorkProgramIds.add(stringToUuid(p.id));
  return upsertRows('work_programs', [workProgramPayload(p)], 'Gagal menyimpan program kerja');
}

export async function updateWorkProgramInCloud(
  id: string,
  partial: Partial<WorkProgram>
): Promise<boolean> {
  const payload: Record<string, any> = {};
  if (partial.title !== undefined) payload.title = partial.title;
  if (partial.description !== undefined) payload.description = partial.description;
  if (partial.estimatedBudget !== undefined) payload.estimated_budget = partial.estimatedBudget;
  if (partial.targetDate !== undefined) payload.target_date = partial.targetDate || null;
  if (partial.status !== undefined) payload.status = partial.status;
  if (partial.progressPercent !== undefined) payload.progress_percent = partial.progressPercent;
  if (partial.proposalUrl !== undefined) payload.proposal_url = partial.proposalUrl || null;
  if (partial.lpjUrl !== undefined) payload.lpj_url = partial.lpjUrl || null;
  if (partial.evaluation !== undefined) payload.evaluation = partial.evaluation || null;
  if (partial.divisionId !== undefined) payload.division_id = fkDivision(partial.divisionId);
  if (partial.divisionName !== undefined) payload.division_name = partial.divisionName || null;
  if (partial.tasks !== undefined) payload.tasks = partial.tasks;
  return updateRow('work_programs', id, payload, 'Gagal memperbarui program kerja');
}

export async function deleteWorkProgramFromCloud(id: string): Promise<boolean> {
  knownWorkProgramIds.delete(stringToUuid(id));
  return deleteRow('work_programs', id, 'Gagal menghapus program kerja');
}

// ==========================================
// EVENTS (KEGIATAN) + DOKUMENTASI
// ==========================================

function mapEvent(row: any): EventItem {
  return {
    id: row.id,
    workProgramId: row.work_program_id || undefined,
    workProgramTitle: row.work_program_title || undefined,
    title: row.title,
    description: row.description || '',
    eventDate: row.event_date || new Date().toISOString().split('T')[0],
    endDate: row.end_date || undefined,
    startTime: (row.start_time || '08:00').slice(0, 5),
    endTime: (row.end_time || '12:00').slice(0, 5),
    startDateTime: row.start_datetime || undefined,
    endDateTime: row.end_datetime || undefined,
    location: row.location || '',
    status: row.status === 'selesai' ? 'selesai' : 'mendatang',
    documentationPhotos: Array.isArray(row.documentation_photos)
      ? row.documentation_photos.filter((p: unknown) => typeof p === 'string' && p.length > 0)
      : [],
    qrToken: row.qr_token || '',
  };
}

export async function fetchEventsFromCloud(): Promise<EventItem[] | null> {
  return selectRows('events', 'Gagal memuat kegiatan', mapEvent, {
    column: 'event_date',
    ascending: true,
  });
}

function eventPayload(e: EventItem): Record<string, any> {
  return {
    id: stringToUuid(e.id),
    work_program_id: fkWorkProgram(e.workProgramId),
    work_program_title: e.workProgramTitle || null,
    title: e.title,
    description: e.description || '',
    event_date: e.eventDate,
    end_date: e.endDate || null,
    start_time: e.startTime || null,
    end_time: e.endTime || null,
    start_datetime: e.startDateTime || null,
    end_datetime: e.endDateTime || null,
    location: e.location || '',
    status: e.status,
    documentation_photos: e.documentationPhotos || [],
    qr_token: e.qrToken || null,
  };
}

async function processDocumentationPhotos(photos: string[] | undefined, eventId: string): Promise<string[]> {
  if (!photos || photos.length === 0) return [];
  return Promise.all(
    photos.map(async (photo, idx) => {
      if (typeof photo === 'string' && photo.startsWith('data:image/')) {
        const uploaded = await uploadImageToStorage(
          photo,
          `events/${stringToUuid(eventId)}/doc-${Date.now()}-${idx}.png`
        );
        return uploaded || (await compressImageForCloud(photo));
      }
      return photo;
    })
  );
}

export async function addEventToCloud(e: EventItem): Promise<boolean> {
  const photos = await processDocumentationPhotos(e.documentationPhotos, e.id);
  const payload = { ...eventPayload(e), documentation_photos: photos };
  return upsertRows('events', [payload], 'Gagal menyimpan kegiatan');
}

export async function updateEventInCloud(
  id: string,
  partial: Partial<EventItem>
): Promise<boolean> {
  const payload: Record<string, any> = {};
  if (partial.title !== undefined) payload.title = partial.title;
  if (partial.description !== undefined) payload.description = partial.description;
  if (partial.eventDate !== undefined) payload.event_date = partial.eventDate;
  if (partial.endDate !== undefined) payload.end_date = partial.endDate || null;
  if (partial.startTime !== undefined) payload.start_time = partial.startTime || null;
  if (partial.endTime !== undefined) payload.end_time = partial.endTime || null;
  if (partial.startDateTime !== undefined) payload.start_datetime = partial.startDateTime || null;
  if (partial.endDateTime !== undefined) payload.end_datetime = partial.endDateTime || null;
  if (partial.location !== undefined) payload.location = partial.location;
  if (partial.status !== undefined) payload.status = partial.status;
  if (partial.documentationPhotos !== undefined) {
    payload.documentation_photos = await processDocumentationPhotos(partial.documentationPhotos, id);
  }
  if (partial.qrToken !== undefined) payload.qr_token = partial.qrToken || null;
  if (partial.workProgramId !== undefined)
    payload.work_program_id = fkWorkProgram(partial.workProgramId);
  if (partial.workProgramTitle !== undefined)
    payload.work_program_title = partial.workProgramTitle || null;
  return updateRow('events', id, payload, 'Gagal memperbarui kegiatan');
}

export async function deleteEventFromCloud(id: string): Promise<boolean> {
  return deleteRow('events', id, 'Gagal menghapus kegiatan');
}

// ==========================================
// MEETINGS (RAPAT)
// ==========================================

function mapMeeting(row: any): Meeting {
  return {
    id: row.id,
    title: row.title,
    description: row.description || '',
    meetingDate: row.meeting_date || new Date().toISOString().split('T')[0],
    startTime: (row.start_time || '14:30').slice(0, 5),
    endTime: (row.end_time || '16:30').slice(0, 5),
    location: row.location || 'Ruang Rapat OSIS',
    type: row.type || 'koordinasi',
    qrToken: row.qr_token || '',
    isAttendanceOpen: row.is_attendance_open ?? false,
    notulen: row.notulen || '',
    decisions: Array.isArray(row.decisions) ? row.decisions : [],
  };
}

export async function fetchMeetingsFromCloud(): Promise<Meeting[] | null> {
  return selectRows('meetings', 'Gagal memuat rapat', mapMeeting, {
    column: 'meeting_date',
    ascending: false,
  });
}

function meetingPayload(m: Meeting): Record<string, any> {
  return {
    id: stringToUuid(m.id),
    title: m.title,
    description: m.description || '',
    meeting_date: m.meetingDate,
    start_time: m.startTime || null,
    end_time: m.endTime || null,
    location: m.location || '',
    type: m.type,
    qr_token: m.qrToken || null,
    is_attendance_open: m.isAttendanceOpen,
    notulen: m.notulen || null,
    decisions: m.decisions || [],
  };
}

export async function addMeetingToCloud(m: Meeting): Promise<boolean> {
  return upsertRows('meetings', [meetingPayload(m)], 'Gagal menyimpan rapat');
}

export async function updateMeetingInCloud(
  id: string,
  partial: Partial<Meeting>
): Promise<boolean> {
  const payload: Record<string, any> = {};
  if (partial.title !== undefined) payload.title = partial.title;
  if (partial.description !== undefined) payload.description = partial.description;
  if (partial.meetingDate !== undefined) payload.meeting_date = partial.meetingDate;
  if (partial.startTime !== undefined) payload.start_time = partial.startTime || null;
  if (partial.endTime !== undefined) payload.end_time = partial.endTime || null;
  if (partial.location !== undefined) payload.location = partial.location;
  if (partial.type !== undefined) payload.type = partial.type;
  if (partial.qrToken !== undefined) payload.qr_token = partial.qrToken || null;
  if (partial.isAttendanceOpen !== undefined)
    payload.is_attendance_open = partial.isAttendanceOpen;
  if (partial.notulen !== undefined) payload.notulen = partial.notulen || null;
  if (partial.decisions !== undefined) payload.decisions = partial.decisions;
  return updateRow('meetings', id, payload, 'Gagal memperbarui rapat');
}

export async function deleteMeetingFromCloud(id: string): Promise<boolean> {
  return deleteRow('meetings', id, 'Gagal menghapus rapat');
}

// ==========================================
// ATTENDANCES (PRESENSI)
// ==========================================

function mapAttendance(row: any): AttendanceRecord {
  return {
    id: row.id,
    targetType: row.target_type === 'kegiatan' ? 'kegiatan' : 'rapat',
    targetId: row.target_id,
    targetTitle: row.target_title || '',
    memberId: row.member_id || '',
    memberName: row.member_name || '',
    nisn: row.nisn || '',
    grade: row.grade || '',
    major: row.major || '',
    status: row.status || 'hadir',
    checkInTime: row.check_in_time || '',
    notes: row.notes || '',
  };
}

export async function fetchAttendancesFromCloud(): Promise<AttendanceRecord[] | null> {
  return selectRows('attendances', 'Gagal memuat presensi', mapAttendance, {
    column: 'check_in_time',
    ascending: false,
  });
}

function attendancePayload(record: AttendanceRecord): Record<string, any> {
  const payload: Record<string, any> = {
    id: stringToUuid(record.id),
    target_type: record.targetType,
    target_id: stringToUuid(record.targetId),
    member_id: fkMember(record.memberId),
    status: record.status,
    notes: record.notes || 'Hadir',
    target_title: record.targetTitle || null,
    member_name: record.memberName || null,
    nisn: record.nisn || null,
    grade: record.grade || null,
    major: record.major || null,
  };
  // ISO timestamp is accepted directly by Postgres timestamptz.
  const iso = toIsoTimestamp(record.checkInTime);
  if (iso) payload.check_in_time = iso;
  return payload;
}

/** Convert "HH:mm WIB" or local strings into an ISO timestamp. */
function toIsoTimestamp(value: string): string | null {
  if (!value) return null;
  if (/^\d{4}-\d{2}-\d{2}T/.test(value)) return value;
  const match = value.match(/(\d{1,2})[.:](\d{2})/);
  if (!match) return null;
  const now = new Date();
  const hours = Number(match[1]);
  const minutes = Number(match[2]);
  if (Number.isNaN(hours) || Number.isNaN(minutes)) return null;
  now.setHours(hours, minutes, 0, 0);
  return now.toISOString();
}

export async function recordAttendanceToCloud(record: AttendanceRecord): Promise<boolean> {
  return upsertRows('attendances', [attendancePayload(record)], 'Gagal menyimpan presensi');
}

export async function updateAttendanceInCloud(
  id: string,
  partial: Partial<AttendanceRecord>
): Promise<boolean> {
  const payload: Record<string, any> = {};
  if (partial.status !== undefined) payload.status = partial.status;
  if (partial.notes !== undefined) payload.notes = partial.notes;
  return updateRow('attendances', id, payload, 'Gagal memperbarui presensi');
}

export async function deleteAttendanceFromCloud(id: string): Promise<boolean> {
  return deleteRow('attendances', id, 'Gagal menghapus presensi');
}

// ==========================================
// CASH TRANSACTIONS (KAS)
// ==========================================

function mapCash(row: any): CashTransaction {
  return {
    id: row.id,
    type: row.type,
    category: row.category,
    amount: Number(row.amount) || 0,
    transactionDate: row.transaction_date || new Date().toISOString().split('T')[0],
    description: row.description || '',
    proofUrl: row.proof_url || undefined,
    recordedBy: row.recorded_by || '',
    referenceId: row.reference_id || undefined,
  };
}

export async function fetchCashTransactionsFromCloud(): Promise<CashTransaction[] | null> {
  return selectRows('cash_transactions', 'Gagal memuat kas', mapCash, {
    column: 'transaction_date',
    ascending: false,
  });
}

function cashPayload(t: CashTransaction): Record<string, any> {
  return {
    id: stringToUuid(t.id),
    type: t.type,
    category: t.category,
    amount: t.amount,
    transaction_date: t.transactionDate,
    description: t.description || '',
    proof_url: t.proofUrl || null,
    recorded_by: t.recordedBy || '',
    reference_id: t.referenceId || null,
  };
}

export async function addCashTransactionToCloud(t: CashTransaction): Promise<boolean> {
  return upsertRows('cash_transactions', [cashPayload(t)], 'Gagal menyimpan transaksi kas');
}

export async function deleteCashTransactionFromCloud(id: string): Promise<boolean> {
  return deleteRow('cash_transactions', id, 'Gagal menghapus transaksi kas');
}

// ==========================================
// MEMBER DUES (IURAN KAS)
// ==========================================

function mapDue(row: any): MemberDue {
  return {
    id: row.id,
    memberId: row.member_id || '',
    memberName: row.member_name || '',
    nisn: row.nisn || '',
    periodMonth: Number(row.period_month) || 1,
    periodYear: Number(row.period_year) || new Date().getFullYear(),
    amount: Number(row.amount) || 0,
    status: row.status || 'belum_lunas',
    proofUrl: row.proof_url || undefined,
    paidAt: row.paid_at || undefined,
    verifiedBy: row.verified_by || undefined,
    verifiedAt: row.verified_at || undefined,
  };
}

export async function fetchMemberDuesFromCloud(): Promise<MemberDue[] | null> {
  return selectRows('member_dues', 'Gagal memuat iuran', mapDue, {
    column: 'created_at',
    ascending: false,
  });
}

function duePayload(d: MemberDue): Record<string, any> {
  return {
    id: stringToUuid(d.id),
    member_id: fkMember(d.memberId),
    member_name: d.memberName || null,
    nisn: d.nisn || null,
    period_month: d.periodMonth,
    period_year: d.periodYear,
    amount: d.amount,
    status: d.status,
    proof_url: d.proofUrl || null,
    paid_at: d.paidAt || null,
    verified_by: d.verifiedBy || null,
    verified_at: d.verifiedAt || null,
  };
}

export async function addMemberDueToCloud(d: MemberDue): Promise<boolean> {
  return upsertRows('member_dues', [duePayload(d)], 'Gagal menyimpan iuran');
}

export async function updateMemberDueInCloud(
  id: string,
  partial: Partial<MemberDue>
): Promise<boolean> {
  const payload: Record<string, any> = {};
  if (partial.status !== undefined) payload.status = partial.status;
  if (partial.proofUrl !== undefined) payload.proof_url = partial.proofUrl || null;
  if (partial.paidAt !== undefined) payload.paid_at = partial.paidAt || null;
  if (partial.verifiedBy !== undefined) payload.verified_by = partial.verifiedBy || null;
  if (partial.verifiedAt !== undefined) payload.verified_at = partial.verifiedAt || null;
  if (partial.amount !== undefined) payload.amount = partial.amount;
  return updateRow('member_dues', id, payload, 'Gagal memperbarui iuran');
}

export async function deleteMemberDueFromCloud(id: string): Promise<boolean> {
  return deleteRow('member_dues', id, 'Gagal menghapus iuran');
}

// ==========================================
// BUDGETS (RAB)
// ==========================================

function mapBudget(row: any): BudgetPlan {
  return {
    id: row.id,
    divisionId: row.division_id || '',
    divisionName: row.division_name || '',
    title: row.title,
    allocatedAmount: Number(row.allocated_amount) || 0,
    usedAmount: Number(row.used_amount) || 0,
    fiscalYear: row.fiscal_year || '',
    notes: row.notes || '',
  };
}

export async function fetchBudgetsFromCloud(): Promise<BudgetPlan[] | null> {
  return selectRows('budgets', 'Gagal memuat anggaran', mapBudget, {
    column: 'created_at',
    ascending: false,
  });
}

function budgetPayload(b: BudgetPlan): Record<string, any> {
  return {
    id: stringToUuid(b.id),
    division_id: fkDivision(b.divisionId),
    division_name: b.divisionName || null,
    title: b.title,
    allocated_amount: b.allocatedAmount,
    used_amount: b.usedAmount,
    fiscal_year: b.fiscalYear,
    notes: b.notes || '',
  };
}

export async function addBudgetToCloud(b: BudgetPlan): Promise<boolean> {
  return upsertRows('budgets', [budgetPayload(b)], 'Gagal menyimpan anggaran');
}

export async function updateBudgetInCloud(
  id: string,
  partial: Partial<BudgetPlan>
): Promise<boolean> {
  const payload: Record<string, any> = {};
  if (partial.title !== undefined) payload.title = partial.title;
  if (partial.allocatedAmount !== undefined) payload.allocated_amount = partial.allocatedAmount;
  if (partial.usedAmount !== undefined) payload.used_amount = partial.usedAmount;
  if (partial.fiscalYear !== undefined) payload.fiscal_year = partial.fiscalYear;
  if (partial.notes !== undefined) payload.notes = partial.notes;
  if (partial.divisionId !== undefined) payload.division_id = fkDivision(partial.divisionId);
  if (partial.divisionName !== undefined) payload.division_name = partial.divisionName || null;
  return updateRow('budgets', id, payload, 'Gagal memperbarui anggaran');
}

export async function deleteBudgetFromCloud(id: string): Promise<boolean> {
  return deleteRow('budgets', id, 'Gagal menghapus anggaran');
}

// ==========================================
// DOCUMENTS (ARSIP SURAT)
// ==========================================

function mapDocument(row: any): DocumentItem {
  return {
    id: row.id,
    type: row.type,
    documentNumber: row.document_number || '',
    title: row.title,
    documentDate: row.document_date || new Date().toISOString().split('T')[0],
    senderOrReceiver: row.sender_or_receiver || '',
    fileUrl: row.file_url || undefined,
    status: row.status || 'arsip',
  };
}

export async function fetchDocumentsFromCloud(): Promise<DocumentItem[] | null> {
  return selectRows('documents', 'Gagal memuat dokumen', mapDocument, {
    column: 'document_date',
    ascending: false,
  });
}

function documentPayload(d: DocumentItem): Record<string, any> {
  return {
    id: stringToUuid(d.id),
    type: d.type,
    document_number: d.documentNumber || '',
    title: d.title,
    document_date: d.documentDate,
    sender_or_receiver: d.senderOrReceiver || '',
    file_url: d.fileUrl || null,
    status: d.status,
  };
}

export async function addDocumentToCloud(d: DocumentItem): Promise<boolean> {
  return upsertRows('documents', [documentPayload(d)], 'Gagal menyimpan dokumen');
}

export async function updateDocumentInCloud(
  id: string,
  partial: Partial<DocumentItem>
): Promise<boolean> {
  const payload: Record<string, any> = {};
  if (partial.type !== undefined) payload.type = partial.type;
  if (partial.documentNumber !== undefined) payload.document_number = partial.documentNumber;
  if (partial.title !== undefined) payload.title = partial.title;
  if (partial.documentDate !== undefined) payload.document_date = partial.documentDate;
  if (partial.senderOrReceiver !== undefined)
    payload.sender_or_receiver = partial.senderOrReceiver;
  if (partial.fileUrl !== undefined) payload.file_url = partial.fileUrl || null;
  if (partial.status !== undefined) payload.status = partial.status;
  return updateRow('documents', id, payload, 'Gagal memperbarui dokumen');
}

export async function deleteDocumentFromCloud(id: string): Promise<boolean> {
  return deleteRow('documents', id, 'Gagal menghapus dokumen');
}

// ==========================================
// ANNOUNCEMENTS (PENGUMUMAN)
// ==========================================

function mapAnnouncement(row: any): Announcement {
  return {
    id: row.id,
    title: row.title,
    content: row.content,
    priority: row.priority === 'penting' ? 'penting' : 'biasa',
    author: row.author || '',
    date: row.date || new Date().toISOString().split('T')[0],
    targetRole: row.target_role || 'Semua',
  };
}

export async function fetchAnnouncementsFromCloud(): Promise<Announcement[] | null> {
  return selectRows('announcements', 'Gagal memuat pengumuman', mapAnnouncement, {
    column: 'date',
    ascending: false,
  });
}

function announcementPayload(a: Announcement): Record<string, any> {
  return {
    id: stringToUuid(a.id),
    title: a.title,
    content: a.content,
    priority: a.priority,
    author: a.author || '',
    date: a.date,
    target_role: a.targetRole || 'Semua',
  };
}

export async function addAnnouncementToCloud(a: Announcement): Promise<boolean> {
  return upsertRows('announcements', [announcementPayload(a)], 'Gagal menyimpan pengumuman');
}

export async function deleteAnnouncementFromCloud(id: string): Promise<boolean> {
  return deleteRow('announcements', id, 'Gagal menghapus pengumuman');
}

// ==========================================
// ASPIRATIONS
// ==========================================

function mapAspiration(row: any): StudentAspiration {
  return {
    id: row.id,
    studentName: row.student_name,
    isAnonymous: row.is_anonymous ?? false,
    classRoom: row.class_room || '',
    email: row.email || undefined,
    senderRole: row.sender_role || 'siswa',
    category: row.category || 'lainnya',
    title: row.title,
    content: row.content,
    date: row.date || new Date().toISOString().split('T')[0],
    status: row.status || 'diterima',
    response: row.response || undefined,
    respondedBy: row.responded_by || undefined,
    likes: Number(row.likes) || 0,
  };
}

export async function fetchAspirationsFromCloud(): Promise<StudentAspiration[] | null> {
  return selectRows('aspirations', 'Gagal memuat aspirasi', mapAspiration, {
    column: 'date',
    ascending: false,
  });
}

function aspirationPayload(a: StudentAspiration): Record<string, any> {
  return {
    id: stringToUuid(a.id),
    student_name: a.studentName,
    is_anonymous: a.isAnonymous,
    class_room: a.classRoom,
    email: a.email || null,
    sender_role: a.senderRole || 'siswa',
    category: a.category,
    title: a.title,
    content: a.content,
    date: a.date,
    status: a.status,
    response: a.response || null,
    responded_by: a.respondedBy || null,
    likes: a.likes || 0,
  };
}

export async function addAspirationToCloud(a: StudentAspiration): Promise<boolean> {
  return upsertRows('aspirations', [aspirationPayload(a)], 'Gagal menyimpan aspirasi');
}

export async function updateAspirationInCloud(
  id: string,
  partial: Partial<StudentAspiration>
): Promise<boolean> {
  const payload: Record<string, any> = {};
  if (partial.status !== undefined) payload.status = partial.status;
  if (partial.response !== undefined) payload.response = partial.response;
  if (partial.respondedBy !== undefined) payload.responded_by = partial.respondedBy;
  if (partial.likes !== undefined) payload.likes = partial.likes;
  return updateRow('aspirations', id, payload, 'Gagal memperbarui aspirasi');
}

export async function deleteAspirationFromCloud(id: string): Promise<boolean> {
  return deleteRow('aspirations', id, 'Gagal menghapus aspirasi');
}

// ==========================================
// RECRUITMENTS (OPREC)
// ==========================================

function mapRecruitment(row: any): RecruitmentApplication {
  return {
    id: row.id,
    registrationNumber: row.registration_number,
    fullName: row.full_name,
    nisn: row.nisn,
    grade: row.grade,
    classRoom: row.class_room,
    major: row.major,
    phone: row.phone,
    email: row.email || undefined,
    divisionChoice1: row.division_choice_1,
    divisionChoice2: row.division_choice_2,
    reason: row.reason,
    skills: Array.isArray(row.skills) ? row.skills : [],
    appliedDate: row.applied_date || new Date().toISOString().split('T')[0],
    status: row.status || 'menunggu',
    interviewSchedule: row.interview_schedule || undefined,
    notes: row.notes || undefined,
  };
}

export async function fetchRecruitmentsFromCloud(): Promise<RecruitmentApplication[] | null> {
  return selectRows('recruitments', 'Gagal memuat pendaftar oprec', mapRecruitment, {
    column: 'applied_date',
    ascending: false,
  });
}

function recruitmentPayload(r: RecruitmentApplication): Record<string, any> {
  return {
    id: stringToUuid(r.id),
    registration_number: r.registrationNumber,
    full_name: r.fullName,
    nisn: r.nisn,
    grade: r.grade,
    class_room: r.classRoom,
    major: r.major,
    phone: r.phone,
    email: r.email || null,
    division_choice_1: r.divisionChoice1,
    division_choice_2: r.divisionChoice2,
    reason: r.reason,
    skills: r.skills || [],
    applied_date: r.appliedDate,
    status: r.status,
    interview_schedule: r.interviewSchedule || null,
    notes: r.notes || null,
  };
}

export async function addRecruitmentToCloud(r: RecruitmentApplication): Promise<boolean> {
  return upsertRows('recruitments', [recruitmentPayload(r)], 'Gagal menyimpan pendaftar oprec');
}

export async function updateRecruitmentInCloud(
  id: string,
  partial: Partial<RecruitmentApplication>
): Promise<boolean> {
  const payload: Record<string, any> = {};
  if (partial.status !== undefined) payload.status = partial.status;
  if (partial.interviewSchedule !== undefined)
    payload.interview_schedule = partial.interviewSchedule || null;
  if (partial.notes !== undefined) payload.notes = partial.notes || null;
  if (partial.fullName !== undefined) payload.full_name = partial.fullName;
  if (partial.phone !== undefined) payload.phone = partial.phone;
  if (partial.divisionChoice1 !== undefined) payload.division_choice_1 = partial.divisionChoice1;
  if (partial.divisionChoice2 !== undefined) payload.division_choice_2 = partial.divisionChoice2;
  return updateRow('recruitments', id, payload, 'Gagal memperbarui pendaftar oprec');
}

export async function deleteRecruitmentFromCloud(id: string): Promise<boolean> {
  return deleteRow('recruitments', id, 'Gagal menghapus pendaftar oprec');
}

// ==========================================
// GALLERY / DOKUMENTASI PORTAL
// ==========================================

function mapGallery(row: any): GalleryItem {
  return {
    id: row.id,
    title: row.title || '',
    caption: row.caption || '',
    imageUrl: row.image_url,
    date: row.date || new Date().toISOString().split('T')[0],
    category: row.category || undefined,
  };
}

export async function fetchGalleryPhotosFromCloud(): Promise<GalleryItem[] | null> {
  return selectRows('gallery_photos', 'Gagal memuat galeri', mapGallery, {
    column: 'date',
    ascending: false,
  });
}

export function parseToIsoDate(dateStr: string | undefined): string {
  if (!dateStr) return new Date().toISOString().split('T')[0];
  if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) return dateStr;
  const months: Record<string, string> = {
    januari: '01', februari: '02', maret: '03', april: '04', mei: '05', juni: '06',
    juli: '07', agustus: '08', september: '09', oktober: '10', november: '11', desember: '12'
  };
  const parts = dateStr.toLowerCase().split(/\s+/);
  if (parts.length === 2) {
    const m = months[parts[0]];
    const y = parts[1];
    if (m && /^\d{4}$/.test(y)) return `${y}-${m}-01`;
  }
  const parsed = Date.parse(dateStr);
  if (!isNaN(parsed)) return new Date(parsed).toISOString().split('T')[0];
  return new Date().toISOString().split('T')[0];
}

function galleryPayload(g: GalleryItem): Record<string, any> {
  return {
    id: stringToUuid(g.id),
    title: g.title || '',
    caption: g.caption || '',
    image_url: g.imageUrl,
    date: parseToIsoDate(g.date),
    category: g.category || null,
  };
}

export async function addGalleryPhotoToCloud(g: GalleryItem): Promise<boolean> {
  let imageUrl = g.imageUrl;
  if (imageUrl?.startsWith('data:image/')) {
    const uploaded = await uploadImageToStorage(
      imageUrl,
      `gallery/${Date.now()}-${stringToUuid(g.id).slice(0, 8)}.png`
    );
    imageUrl = uploaded || (await compressImageForCloud(imageUrl));
  }
  return upsertRows('gallery_photos', [{ ...galleryPayload(g), image_url: imageUrl }], 'Gagal menyimpan foto galeri');
}

export async function updateGalleryPhotoInCloud(
  id: string,
  partial: Partial<GalleryItem>
): Promise<boolean> {
  const payload: Record<string, any> = {};
  if (partial.title !== undefined) payload.title = partial.title;
  if (partial.caption !== undefined) payload.caption = partial.caption;
  if (partial.imageUrl !== undefined) {
    let img = partial.imageUrl;
    if (img?.startsWith('data:image/')) {
      const uploaded = await uploadImageToStorage(
        img,
        `gallery/${Date.now()}-${stringToUuid(id).slice(0, 8)}.png`
      );
      img = uploaded || (await compressImageForCloud(img));
    }
    payload.image_url = img;
  }
  if (partial.date !== undefined) payload.date = parseToIsoDate(partial.date);
  if (partial.category !== undefined) payload.category = partial.category || null;
  return updateRow('gallery_photos', id, payload, 'Gagal memperbarui foto galeri');
}

export async function deleteGalleryPhotoFromCloud(id: string): Promise<boolean> {
  return deleteRow('gallery_photos', id, 'Gagal menghapus foto galeri');
}

// ==========================================
// EVENT REGISTRATIONS
// ==========================================

function mapEventRegistration(row: any): EventRegistration {
  return {
    id: row.id,
    ticketCode: row.ticket_code,
    eventId: row.event_id,
    eventTitle: row.event_title,
    studentName: row.student_name,
    nisn: row.nisn,
    classRoom: row.class_room || '',
    phone: row.phone || '',
    registeredAt: row.registered_at || row.created_at || '',
  };
}

export async function fetchEventRegistrationsFromCloud(): Promise<EventRegistration[] | null> {
  return selectRows(
    'event_registrations',
    'Gagal memuat pendaftaran kegiatan',
    mapEventRegistration,
    { column: 'created_at', ascending: false }
  );
}

function eventRegistrationPayload(r: EventRegistration): Record<string, any> {
  return {
    id: stringToUuid(r.id),
    ticket_code: r.ticketCode,
    event_id: r.eventId,
    event_title: r.eventTitle,
    student_name: r.studentName,
    nisn: r.nisn,
    class_room: r.classRoom,
    phone: r.phone,
    registered_at: r.registeredAt || new Date().toISOString(),
    status: 'terdaftar',
  };
}

export async function addEventRegistrationToCloud(r: EventRegistration): Promise<boolean> {
  return upsertRows(
    'event_registrations',
    [eventRegistrationPayload(r)],
    'Gagal menyimpan pendaftaran kegiatan'
  );
}

export async function deleteEventRegistrationFromCloud(id: string): Promise<boolean> {
  return deleteRow('event_registrations', id, 'Gagal menghapus pendaftaran kegiatan');
}

// ==========================================
// APP META
// ==========================================

export async function getAppMeta(key: string): Promise<Record<string, any> | null> {
  if (!supabase) return null;
  try {
    const { data, error } = await supabase
      .from('app_meta')
      .select('value')
      .eq('key', key)
      .maybeSingle();
    if (error) {
      notifyError('Gagal membaca metadata aplikasi', error);
      return null;
    }
    return data?.value ?? null;
  } catch (err) {
    notifyError('Gagal membaca metadata aplikasi', err);
    return null;
  }
}

export async function setAppMeta(key: string, value: Record<string, any>): Promise<boolean> {
  if (!supabase) return false;
  try {
    const { error } = await supabase
      .from('app_meta')
      .upsert({ key, value, updated_at: new Date().toISOString() });
    if (error) {
      notifyError('Gagal menyimpan metadata aplikasi', error);
      return false;
    }
    return true;
  } catch (err) {
    notifyError('Gagal menyimpan metadata aplikasi', err);
    return false;
  }
}

// ==========================================
// FULL SNAPSHOT
// ==========================================

export interface CloudSnapshot {
  members: Member[] | null;
  divisions: Division[] | null;
  positions: Position[] | null;
  workPrograms: WorkProgram[] | null;
  events: EventItem[] | null;
  meetings: Meeting[] | null;
  attendances: AttendanceRecord[] | null;
  cashTransactions: CashTransaction[] | null;
  memberDues: MemberDue[] | null;
  budgets: BudgetPlan[] | null;
  documents: DocumentItem[] | null;
  announcements: Announcement[] | null;
  aspirations: StudentAspiration[] | null;
  recruitments: RecruitmentApplication[] | null;
  eventRegistrations: EventRegistration[] | null;
  galleryPhotos: GalleryItem[] | null;
  orgProfile: OrgProfile | null;
}

export async function fetchAllFromCloud(): Promise<CloudSnapshot> {
  const [
    members,
    divisions,
    positions,
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
    orgProfile,
  ] = await Promise.all([
    fetchMembersFromCloud(),
    fetchDivisionsFromCloud(),
    fetchPositionsFromCloud(),
    fetchWorkProgramsFromCloud(),
    fetchEventsFromCloud(),
    fetchMeetingsFromCloud(),
    fetchAttendancesFromCloud(),
    fetchCashTransactionsFromCloud(),
    fetchMemberDuesFromCloud(),
    fetchBudgetsFromCloud(),
    fetchDocumentsFromCloud(),
    fetchAnnouncementsFromCloud(),
    fetchAspirationsFromCloud(),
    fetchRecruitmentsFromCloud(),
    fetchEventRegistrationsFromCloud(),
    fetchGalleryPhotosFromCloud(),
    fetchOrgProfileFromCloud(),
  ]);

  return {
    members,
    divisions,
    positions,
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
    orgProfile,
  };
}

/**
 * Push an entire local snapshot back to the cloud.
 * Used only by "reset data" / "restore backup" which are admin-only actions.
 */
export interface LocalSnapshot {
  orgProfile: OrgProfile;
  divisions: Division[];
  positions: Position[];
  members: Member[];
  workPrograms: WorkProgram[];
  events: EventItem[];
  meetings: Meeting[];
  attendances: AttendanceRecord[];
  cashTransactions: CashTransaction[];
  memberDues: MemberDue[];
  budgets: BudgetPlan[];
  documents: DocumentItem[];
  announcements: Announcement[];
  aspirations: StudentAspiration[];
  recruitments: RecruitmentApplication[];
  eventRegistrations: EventRegistration[];
  galleryPhotos: GalleryItem[];
}

export async function replaceCloudWithSnapshot(snapshot: LocalSnapshot): Promise<boolean> {
  if (!supabase) return false;

  // Child tables first to satisfy foreign keys.
  const deleteOrder = [
    'attendances',
    'member_dues',
    'cash_transactions',
    'budgets',
    'events',
    'documents',
    'announcements',
    'aspirations',
    'recruitments',
    'event_registrations',
    'gallery_photos',
    'positions',
    'work_programs',
    'members',
    'divisions',
  ];

  for (const table of deleteOrder) {
    const ok = await deleteAllRows(table, `Gagal mengosongkan tabel ${table}`);
    if (!ok) return false;
  }

  knownDivisionIds.clear();
  knownMemberIds.clear();
  knownWorkProgramIds.clear();

  const divisionsOk = await upsertRows(
    'divisions',
    snapshot.divisions.map(divisionPayload),
    'Gagal mengunggah divisi'
  );
  if (!divisionsOk) return false;
  snapshot.divisions.forEach((d) => knownDivisionIds.add(stringToUuid(d.id)));

  const membersOk = await upsertRows(
    'members',
    snapshot.members.map(memberPayload),
    'Gagal mengunggah anggota'
  );
  if (!membersOk) return false;
  snapshot.members.forEach((m) => knownMemberIds.add(stringToUuid(m.id)));

  const promiseResults = await Promise.all([
    saveOrgProfileToCloud(snapshot.orgProfile),
    upsertRows('positions', snapshot.positions.map(positionPayload), 'Gagal mengunggah jabatan'),
    upsertRows(
      'work_programs',
      snapshot.workPrograms.map((p) => {
        knownWorkProgramIds.add(stringToUuid(p.id));
        return workProgramPayload(p);
      }),
      'Gagal mengunggah program kerja'
    ),
    upsertRows('events', snapshot.events.map(eventPayload), 'Gagal mengunggah kegiatan'),
    upsertRows('meetings', snapshot.meetings.map(meetingPayload), 'Gagal mengunggah rapat'),
    upsertRows(
      'attendances',
      snapshot.attendances.map(attendancePayload),
      'Gagal mengunggah presensi'
    ),
    upsertRows(
      'cash_transactions',
      snapshot.cashTransactions.map(cashPayload),
      'Gagal mengunggah kas'
    ),
    upsertRows('member_dues', snapshot.memberDues.map(duePayload), 'Gagal mengunggah iuran'),
    upsertRows('budgets', snapshot.budgets.map(budgetPayload), 'Gagal mengunggah anggaran'),
    upsertRows('documents', snapshot.documents.map(documentPayload), 'Gagal mengunggah dokumen'),
    upsertRows(
      'announcements',
      snapshot.announcements.map(announcementPayload),
      'Gagal mengunggah pengumuman'
    ),
    upsertRows(
      'aspirations',
      snapshot.aspirations.map(aspirationPayload),
      'Gagal mengunggah aspirasi'
    ),
    upsertRows(
      'recruitments',
      snapshot.recruitments.map(recruitmentPayload),
      'Gagal mengunggah pendaftar oprec'
    ),
    upsertRows(
      'event_registrations',
      snapshot.eventRegistrations.map(eventRegistrationPayload),
      'Gagal mengunggah pendaftaran kegiatan'
    ),
    upsertRows(
      'gallery_photos',
      snapshot.galleryPhotos.map(galleryPayload),
      'Gagal mengunggah galeri'
    ),
  ]);

  return promiseResults.every(Boolean);
}

// ==========================================
// REALTIME
// ==========================================

export const SYNCED_TABLES = [
  'members',
  'divisions',
  'positions',
  'org_profiles',
  'work_programs',
  'events',
  'meetings',
  'attendances',
  'cash_transactions',
  'member_dues',
  'budgets',
  'documents',
  'announcements',
  'aspirations',
  'recruitments',
  'event_registrations',
  'gallery_photos',
] as const;

// ==========================================
// STORAGE — Upload gambar ke Supabase Storage
// Bucket "smo-images" harus dibuat di Supabase Dashboard (Storage > New bucket)
// dengan opsi "Public bucket" diaktifkan.
// ==========================================

const STORAGE_BUCKET = 'smo-images';

/**
 * Upload gambar (base64 data URL atau File) ke Supabase Storage.
 * Mengembalikan URL publik gambar jika berhasil, atau null jika gagal.
 *
 * @param dataUrlOrFile  base64 data URL (contoh: "data:image/png;base64,...") atau File
 * @param path           path dalam bucket, misal: "logos/logo.jpg" atau "gallery/foto1.jpg"
 */
export async function uploadImageToStorage(
  dataUrlOrFile: string | File,
  path: string
): Promise<string | null> {
  if (!supabase) return null;
  try {
    let file: File;
    if (typeof dataUrlOrFile === 'string') {
      // Convert base64 data URL to File
      if (!dataUrlOrFile.startsWith('data:image/')) {
        // Already a URL — no upload needed
        return dataUrlOrFile;
      }
      const arr = dataUrlOrFile.split(',');
      const mimeMatch = arr[0].match(/:(.*?);/);
      const mime = mimeMatch ? mimeMatch[1] : 'image/jpeg';
      const bstr = atob(arr[1]);
      const n = bstr.length;
      const u8arr = new Uint8Array(n);
      for (let i = 0; i < n; i++) u8arr[i] = bstr.charCodeAt(i);
      const ext = mime.split('/')[1] || 'jpg';
      file = new File([u8arr], path.split('/').pop() || `image.${ext}`, { type: mime });
    } else {
      file = dataUrlOrFile;
    }

    const { error } = await supabase.storage
      .from(STORAGE_BUCKET)
      .upload(path, file, {
        upsert: true,
        cacheControl: '3600',
        contentType: file.type || 'image/jpeg',
      });

    if (error) {
      notifyError('Gagal mengunggah gambar ke cloud', error);
      return null;
    }

    const { data } = supabase.storage.from(STORAGE_BUCKET).getPublicUrl(path);
    return data?.publicUrl ?? null;
  } catch (err) {
    notifyError('Gagal mengunggah gambar', err);
    return null;
  }
}

/**
 * Hapus gambar dari Supabase Storage.
 */
export async function deleteImageFromStorage(path: string): Promise<boolean> {
  if (!supabase) return false;
  try {
    const { error } = await supabase.storage.from(STORAGE_BUCKET).remove([path]);
    if (error) {
      notifyError('Gagal menghapus gambar dari cloud', error);
      return false;
    }
    return true;
  } catch (err) {
    notifyError('Gagal menghapus gambar', err);
    return false;
  }
}

/**
 * Subscribe to every synced table. Returns an unsubscribe function.
 * Realtime is best-effort: focus/visibility refetch keeps working without it.
 */
export function subscribeToCloudChanges(onChange: () => void): () => void {
  if (!supabase) return () => {};
  const client = supabase;
  try {
    const channel = client.channel('smo-cloud-sync');
    for (const table of SYNCED_TABLES) {
      channel.on(
        'postgres_changes',
        { event: '*', schema: 'public', table } as any,
        () => onChange()
      );
    }
    channel.subscribe();
    return () => {
      try {
        client.removeChannel(channel);
      } catch {
        /* ignore */
      }
    };
  } catch (err) {
    console.warn('[SMO Cloud] Realtime tidak tersedia:', err);
    return () => {};
  }
}

import { supabase, isSupabaseConfigured } from './supabase';
import {
  Member,
  Division,
  Meeting,
  AttendanceRecord,
  Announcement,
  OrgProfile,
  RecruitmentApplication,
  StudentAspiration,
  WorkProgram,
} from '../types';

/**
 * Helper to convert any string ID into a deterministic RFC-4122 v4 UUID
 * Ensures consistency between local string IDs ('mem-1', 'div-bph') and Postgres UUID columns
 */
export function stringToUuid(str: string): string {
  // If already a valid UUID, return as-is
  if (/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(str)) {
    return str.toLowerCase();
  }
  // Simple deterministic UUID-like hash for frontend environment
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
// MEMBERS (ANGGOTA) CLOUD SYNC
// ==========================================

export async function fetchMembersFromCloud(): Promise<Member[] | null> {
  if (!supabase) return null;
  try {
    const { data, error } = await supabase.from('members').select('*');
    if (error || !data) return null;

    return data.map((row: any) => ({
      id: row.id,
      nisn: row.nisn,
      fullName: row.full_name,
      email: row.email,
      role: row.role,
      grade: row.grade,
      classRoom: row.class_room,
      major: row.major,
      divisionId: row.division_id,
      position: row.position,
      phone: row.phone || '',
      avatarUrl: row.avatar_url || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
      isActive: row.is_active ?? true,
      status: (row.status as 'aktif' | 'alumni') || 'aktif',
      joinDate: row.join_date || new Date().toISOString().split('T')[0],
      generation: row.generation || 'Angkatan 2024/2025',
    }));
  } catch (err) {
    console.warn('Failed to fetch members from Supabase Cloud:', err);
    return null;
  }
}

export async function addMemberToCloud(member: Member): Promise<boolean> {
  if (!supabase) return false;
  try {
    const uuid = stringToUuid(member.id);
    const divUuid = member.divisionId ? stringToUuid(member.divisionId) : null;
    const { error } = await supabase.from('members').upsert([
      {
        id: uuid,
        nisn: member.nisn,
        full_name: member.fullName,
        email: member.email,
        role: member.role,
        grade: member.grade,
        class_room: member.classRoom,
        major: member.major,
        division_id: divUuid,
        position: member.position,
        phone: member.phone,
        avatar_url: member.avatarUrl,
        is_active: member.isActive,
        status: member.status,
        join_date: member.joinDate,
        generation: member.generation,
      },
    ]);
    return !error;
  } catch {
    return false;
  }
}

export async function updateMemberInCloud(id: string, partial: Partial<Member>): Promise<boolean> {
  if (!supabase) return false;
  try {
    const uuid = stringToUuid(id);
    const updatePayload: Record<string, any> = {};
    if (partial.fullName !== undefined) updatePayload.full_name = partial.fullName;
    if (partial.nisn !== undefined) updatePayload.nisn = partial.nisn;
    if (partial.email !== undefined) updatePayload.email = partial.email;
    if (partial.role !== undefined) updatePayload.role = partial.role;
    if (partial.grade !== undefined) updatePayload.grade = partial.grade;
    if (partial.classRoom !== undefined) updatePayload.class_room = partial.classRoom;
    if (partial.major !== undefined) updatePayload.major = partial.major;
    if (partial.position !== undefined) updatePayload.position = partial.position;
    if (partial.phone !== undefined) updatePayload.phone = partial.phone;
    if (partial.avatarUrl !== undefined) updatePayload.avatar_url = partial.avatarUrl;
    if (partial.status !== undefined) updatePayload.status = partial.status;
    if (partial.isActive !== undefined) updatePayload.is_active = partial.isActive;
    if (partial.divisionId !== undefined) updatePayload.division_id = partial.divisionId ? stringToUuid(partial.divisionId) : null;

    const { error } = await supabase.from('members').update(updatePayload).eq('id', uuid);
    return !error;
  } catch {
    return false;
  }
}

export async function deleteMemberFromCloud(id: string): Promise<boolean> {
  if (!supabase) return false;
  try {
    const uuid = stringToUuid(id);
    const { error } = await supabase.from('members').delete().eq('id', uuid);
    return !error;
  } catch {
    return false;
  }
}

// ==========================================
// DIVISIONS CLOUD SYNC
// ==========================================

export async function fetchDivisionsFromCloud(): Promise<Division[] | null> {
  if (!supabase) return null;
  try {
    const { data, error } = await supabase.from('divisions').select('*');
    if (error || !data || data.length === 0) return null;

    return data.map((row: any) => ({
      id: row.id,
      name: row.name,
      code: row.code,
      description: row.description || '',
      leaderName: row.leader_name || '',
    }));
  } catch {
    return null;
  }
}

// ==========================================
// MEETINGS & ATTENDANCE CLOUD SYNC
// ==========================================

export async function fetchMeetingsFromCloud(): Promise<Meeting[] | null> {
  if (!supabase) return null;
  try {
    const { data, error } = await supabase.from('meetings').select('*');
    if (error || !data || data.length === 0) return null;

    return data.map((row: any) => ({
      id: row.id,
      title: row.title,
      description: row.description || '',
      meetingDate: row.meeting_date,
      startTime: (row.start_time || '14:30').slice(0, 5),
      endTime: (row.end_time || '16:30').slice(0, 5),
      location: row.location || 'Ruang Rapat OSIS',
      type: row.type || 'koordinasi',
      qrToken: row.qr_token || 'MEET-TOKEN',
      isAttendanceOpen: row.is_attendance_open ?? false,
      notulen: row.notulen || '',
      decisions: Array.isArray(row.decisions) ? row.decisions : [],
    }));
  } catch {
    return null;
  }
}

export async function recordAttendanceToCloud(record: AttendanceRecord): Promise<boolean> {
  if (!supabase) return false;
  try {
    const uuid = stringToUuid(record.id);
    const targetUuid = stringToUuid(record.targetId);
    const memberUuid = stringToUuid(record.memberId);

    const { error } = await supabase.from('attendances').upsert([
      {
        id: uuid,
        target_type: record.targetType,
        target_id: targetUuid,
        member_id: memberUuid,
        status: record.status,
        notes: record.notes || 'Hadir',
      },
    ]);
    return !error;
  } catch {
    return false;
  }
}

// ==========================================
// ANNOUNCEMENTS CLOUD SYNC
// ==========================================

export async function fetchAnnouncementsFromCloud(): Promise<Announcement[] | null> {
  if (!supabase) return null;
  try {
    const { data, error } = await supabase.from('announcements').select('*');
    if (error || !data || data.length === 0) return null;

    return data.map((row: any) => ({
      id: row.id,
      title: row.title,
      content: row.content,
      priority: row.priority || 'biasa',
      author: row.author || 'Pengurus OSIS',
      date: row.date || new Date().toISOString().split('T')[0],
      targetRole: row.target_role || 'Semua',
    }));
  } catch {
    return null;
  }
}

// ==========================================
// OPEN RECRUITMENT (PENDAFTAR OPREC) CLOUD SYNC
// ==========================================

export async function fetchRecruitmentsFromCloud(): Promise<RecruitmentApplication[] | null> {
  if (!supabase) return null;
  try {
    const { data, error } = await supabase
      .from('recruitments')
      .select('*')
      .order('applied_date', { ascending: false });
    if (error || !data || data.length === 0) return null;

    return data.map((row: any) => ({
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
    }));
  } catch {
    return null;
  }
}

export async function addRecruitmentToCloud(r: RecruitmentApplication): Promise<boolean> {
  if (!supabase) return false;
  try {
    const uuid = stringToUuid(r.id);
    const { error } = await supabase.from('recruitments').upsert([
      {
        id: uuid,
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
      },
    ]);
    return !error;
  } catch {
    return false;
  }
}

export async function updateRecruitmentInCloud(
  id: string,
  partial: Partial<RecruitmentApplication>
): Promise<boolean> {
  if (!supabase) return false;
  try {
    const uuid = stringToUuid(id);
    const updatePayload: Record<string, any> = {};
    if (partial.status !== undefined) updatePayload.status = partial.status;
    if (partial.interviewSchedule !== undefined) updatePayload.interview_schedule = partial.interviewSchedule;
    if (partial.notes !== undefined) updatePayload.notes = partial.notes;
    if (partial.fullName !== undefined) updatePayload.full_name = partial.fullName;
    if (partial.phone !== undefined) updatePayload.phone = partial.phone;
    if (partial.divisionChoice1 !== undefined) updatePayload.division_choice_1 = partial.divisionChoice1;
    if (partial.divisionChoice2 !== undefined) updatePayload.division_choice_2 = partial.divisionChoice2;

    const { error } = await supabase.from('recruitments').update(updatePayload).eq('id', uuid);
    return !error;
  } catch {
    return false;
  }
}

export async function deleteRecruitmentFromCloud(id: string): Promise<boolean> {
  if (!supabase) return false;
  try {
    const uuid = stringToUuid(id);
    const { error } = await supabase.from('recruitments').delete().eq('id', uuid);
    return !error;
  } catch {
    return false;
  }
}

// ==========================================
// ASPIRASI & KOTAK SARAN CLOUD SYNC
// ==========================================

export async function fetchAspirationsFromCloud(): Promise<StudentAspiration[] | null> {
  if (!supabase) return null;
  try {
    const { data, error } = await supabase
      .from('aspirations')
      .select('*')
      .order('date', { ascending: false });
    if (error || !data || data.length === 0) return null;

    return data.map((row: any) => ({
      id: row.id,
      studentName: row.student_name,
      isAnonymous: row.is_anonymous ?? false,
      classRoom: row.class_room,
      email: row.email || undefined,
      senderRole: row.sender_role || 'siswa',
      category: row.category,
      title: row.title,
      content: row.content,
      date: row.date || new Date().toISOString().split('T')[0],
      status: row.status || 'diterima',
      response: row.response || undefined,
      respondedBy: row.responded_by || undefined,
      likes: row.likes ?? 0,
    }));
  } catch {
    return null;
  }
}

export async function addAspirationToCloud(a: StudentAspiration): Promise<boolean> {
  if (!supabase) return false;
  try {
    const uuid = stringToUuid(a.id);
    const { error } = await supabase.from('aspirations').upsert([
      {
        id: uuid,
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
      },
    ]);
    return !error;
  } catch {
    return false;
  }
}

export async function updateAspirationInCloud(
  id: string,
  partial: Partial<StudentAspiration>
): Promise<boolean> {
  if (!supabase) return false;
  try {
    const uuid = stringToUuid(id);
    const updatePayload: Record<string, any> = {};
    if (partial.status !== undefined) updatePayload.status = partial.status;
    if (partial.response !== undefined) updatePayload.response = partial.response;
    if (partial.respondedBy !== undefined) updatePayload.responded_by = partial.respondedBy;
    if (partial.likes !== undefined) updatePayload.likes = partial.likes;

    const { error } = await supabase.from('aspirations').update(updatePayload).eq('id', uuid);
    return !error;
  } catch {
    return false;
  }
}

export async function deleteAspirationFromCloud(id: string): Promise<boolean> {
  if (!supabase) return false;
  try {
    const uuid = stringToUuid(id);
    const { error } = await supabase.from('aspirations').delete().eq('id', uuid);
    return !error;
  } catch {
    return false;
  }
}

// ==========================================
// WORK PROGRAMS (PROKER) CLOUD SYNC
// ==========================================

export async function fetchWorkProgramsFromCloud(): Promise<WorkProgram[] | null> {
  if (!supabase) return null;
  try {
    const { data, error } = await supabase.from('work_programs').select('*');
    if (error || !data || data.length === 0) return null;

    return data.map((row: any) => ({
      id: row.id,
      divisionId: row.division_id || '',
      divisionName: 'Sekbid',
      title: row.title,
      description: row.description || '',
      estimatedBudget: Number(row.estimated_budget) || 0,
      targetDate: row.target_date || new Date().toISOString().split('T')[0],
      status: row.status || 'draft',
      progressPercent: row.progress_percent || 0,
      proposalUrl: row.proposal_url || undefined,
      lpjUrl: row.lpj_url || undefined,
      evaluation: row.evaluation || undefined,
      createdAt: row.created_at || new Date().toISOString().split('T')[0],
    }));
  } catch {
    return null;
  }
}

export async function addWorkProgramToCloud(p: WorkProgram): Promise<boolean> {
  if (!supabase) return false;
  try {
    const uuid = stringToUuid(p.id);
    const divUuid = p.divisionId ? stringToUuid(p.divisionId) : null;
    const { error } = await supabase.from('work_programs').upsert([
      {
        id: uuid,
        division_id: divUuid,
        title: p.title,
        description: p.description,
        estimated_budget: p.estimatedBudget,
        target_date: p.targetDate,
        status: p.status,
        progress_percent: p.progressPercent,
        proposal_url: p.proposalUrl || null,
        lpj_url: p.lpjUrl || null,
        evaluation: p.evaluation || null,
      },
    ]);
    return !error;
  } catch {
    return false;
  }
}

export async function updateWorkProgramInCloud(
  id: string,
  partial: Partial<WorkProgram>
): Promise<boolean> {
  if (!supabase) return false;
  try {
    const uuid = stringToUuid(id);
    const updatePayload: Record<string, any> = {};
    if (partial.title !== undefined) updatePayload.title = partial.title;
    if (partial.description !== undefined) updatePayload.description = partial.description;
    if (partial.estimatedBudget !== undefined) updatePayload.estimated_budget = partial.estimatedBudget;
    if (partial.targetDate !== undefined) updatePayload.target_date = partial.targetDate;
    if (partial.status !== undefined) updatePayload.status = partial.status;
    if (partial.progressPercent !== undefined) updatePayload.progress_percent = partial.progressPercent;
    if (partial.proposalUrl !== undefined) updatePayload.proposal_url = partial.proposalUrl;
    if (partial.lpjUrl !== undefined) updatePayload.lpj_url = partial.lpjUrl;
    if (partial.evaluation !== undefined) updatePayload.evaluation = partial.evaluation;

    const { error } = await supabase.from('work_programs').update(updatePayload).eq('id', uuid);
    return !error;
  } catch {
    return false;
  }
}

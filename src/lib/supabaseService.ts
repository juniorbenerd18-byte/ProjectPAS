import { supabase, isSupabaseConfigured } from './supabase';
import { Member, Division, Meeting, AttendanceRecord, Announcement, OrgProfile } from '../types';

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

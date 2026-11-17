-- =========================================================================
-- MIGRATION 2026-11-18 — SINKRONISASI PENUH SMO KE SUPABASE
-- Idempoten: aman dijalankan berulang kali, tidak menghapus data.
-- =========================================================================

-- ---------------------------------------------------------------------
-- 1. PROFIL ORGANISASI
--    Branding, foto hero/visi, sambutan ketua, iuran, rekening, pendaftaran.
-- ---------------------------------------------------------------------
alter table public.org_profiles
  add column if not exists app_name varchar(80),
  add column if not exists motto text,
  add column if not exists vision_photo_url text,
  add column if not exists hero_photo_url text,
  add column if not exists nip_pembina varchar(50),
  add column if not exists nip_headmaster varchar(50),
  add column if not exists nisn_ketua varchar(20),
  add column if not exists ketua_photo_url text,
  add column if not exists ketua_period varchar(50),
  add column if not exists ketua_welcome_title varchar(150),
  add column if not exists ketua_speech text,
  add column if not exists monthly_due_amount numeric default 15000,
  add column if not exists due_due_day integer default 25,
  add column if not exists bank_name varchar(80),
  add column if not exists bank_account_number varchar(60),
  add column if not exists bank_account_holder varchar(150),
  add column if not exists is_registration_open boolean default true,
  add column if not exists registration_gform_url text,
  add column if not exists registration_open_date varchar(60),
  add column if not exists registration_close_date varchar(60),
  add column if not exists registration_notice text,
  add column if not exists updated_at timestamptz default now();

update public.org_profiles set updated_at = now() where updated_at is null;

-- ---------------------------------------------------------------------
-- 2. KEGIATAN (EVENTS): rentang tanggal & judul program kerja
-- ---------------------------------------------------------------------
alter table public.events
  add column if not exists end_date date,
  add column if not exists start_datetime timestamptz,
  add column if not exists end_datetime timestamptz,
  add column if not exists work_program_title varchar(200);

-- ---------------------------------------------------------------------
-- 3. PROGRAM KERJA: nama divisi & jobdesk kepanitiaan
-- ---------------------------------------------------------------------
alter table public.work_programs
  add column if not exists division_name varchar(150),
  add column if not exists tasks jsonb default '[]'::jsonb;

update public.work_programs set tasks = '[]'::jsonb where tasks is null;

-- ---------------------------------------------------------------------
-- 4. KAS: referensi ke iuran / kegiatan
-- ---------------------------------------------------------------------
alter table public.cash_transactions
  add column if not exists reference_id varchar(100);

-- ---------------------------------------------------------------------
-- 5. PRESENSI: snapshot identitas peserta
-- ---------------------------------------------------------------------
alter table public.attendances
  add column if not exists target_title varchar(200),
  add column if not exists member_name varchar(150),
  add column if not exists nisn varchar(20),
  add column if not exists grade varchar(10),
  add column if not exists major varchar(100);

-- ---------------------------------------------------------------------
-- 6. IURAN KAS: snapshot identitas anggota
-- ---------------------------------------------------------------------
alter table public.member_dues
  add column if not exists member_name varchar(150),
  add column if not exists nisn varchar(20);

-- ---------------------------------------------------------------------
-- 7. ANGGARAN (RAB): nama divisi
-- ---------------------------------------------------------------------
alter table public.budgets
  add column if not exists division_name varchar(150);

-- ---------------------------------------------------------------------
-- 8. GALERI / DOKUMENTASI PORTAL PUBLIK
-- ---------------------------------------------------------------------
create table if not exists public.gallery_photos (
    id uuid primary key default gen_random_uuid(),
    title varchar(200) not null default '',
    caption text default '',
    image_url text not null,
    date date default current_date,
    category varchar(80),
    created_at timestamptz default now()
);

-- ---------------------------------------------------------------------
-- 9. PENDAFTARAN EVENT / KEGIATAN SISWA
-- ---------------------------------------------------------------------
create table if not exists public.event_registrations (
    id uuid primary key default gen_random_uuid(),
    ticket_code varchar(50) unique not null,
    event_id varchar(100) not null,
    event_title varchar(200) not null,
    student_name varchar(150) not null,
    nisn varchar(20) not null,
    grade varchar(10),
    class_room varchar(30),
    major varchar(100),
    phone varchar(30),
    email varchar(150),
    registered_at timestamptz default now(),
    registration_date date default current_date,
    status varchar(30) default 'terdaftar',
    created_at timestamptz default now()
);

-- ---------------------------------------------------------------------
-- 10. META APLIKASI (penanda migrasi lokal -> cloud, versi skema)
-- ---------------------------------------------------------------------
create table if not exists public.app_meta (
    key text primary key,
    value jsonb not null default '{}'::jsonb,
    updated_at timestamptz default now()
);

-- ---------------------------------------------------------------------
-- 10b. KOMPATIBILITAS: kolom yang diisi opsional oleh aplikasi
-- ---------------------------------------------------------------------
alter table public.events alter column qr_token drop not null;
alter table public.meetings alter column qr_token drop not null;
alter table public.event_registrations
  alter column grade drop not null,
  alter column class_room drop not null,
  alter column major drop not null,
  alter column phone drop not null;

-- ---------------------------------------------------------------------
-- 11. HAK AKSES UNTUK TABEL BARU
-- ---------------------------------------------------------------------
grant select, insert, update, delete
  on public.gallery_photos, public.event_registrations, public.app_meta
  to anon, authenticated;

-- ---------------------------------------------------------------------
-- 12. RLS PERMISSIVE UNTUK SEMUA TABEL APLIKASI
--     Aplikasi memakai anon key + satu password bersama (level demo UKK).
-- ---------------------------------------------------------------------
do $$
declare
  t text;
begin
  foreach t in array array[
    'announcements', 'aspirations', 'attendances', 'budgets', 'cash_transactions',
    'divisions', 'documents', 'events', 'meetings', 'member_dues', 'members',
    'org_profiles', 'positions', 'recruitments', 'work_programs',
    'gallery_photos', 'event_registrations', 'app_meta'
  ]
  loop
    execute format('alter table public.%I enable row level security', t);
    execute format('drop policy if exists %I on public.%I', 'Allow all for ' || t, t);
    execute format(
      'create policy %I on public.%I for all using (true) with check (true)',
      'Allow all for ' || t, t
    );
  end loop;
end $$;

-- ---------------------------------------------------------------------
-- 13. AKUN ADMIN: gunakan Gmail pemilik aplikasi
--     NISN 0000000009 tetap dipertahankan agar login NISN masih bisa.
-- ---------------------------------------------------------------------
update public.members
   set email = 'juniorbenerd18@gmail.com'
 where nisn = '0000000009'
   and role = 'admin';

-- ---------------------------------------------------------------------
-- 14. REALTIME PUBLICATION (SINKRONISASI ANTAR PERANGKAT)
-- ---------------------------------------------------------------------
do $$
declare
  t text;
begin
  foreach t in array array[
    'members', 'divisions', 'positions', 'org_profiles', 'work_programs', 'events',
    'meetings', 'attendances', 'cash_transactions', 'member_dues', 'budgets',
    'documents', 'announcements', 'aspirations', 'recruitments',
    'event_registrations', 'gallery_photos'
  ]
  loop
    if not exists (
      select 1 from pg_publication_tables
      where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = t
    ) then
      execute format('alter publication supabase_realtime add table public.%I', t);
    end if;
  end loop;
end $$;

-- ---------------------------------------------------------------------
-- 15. Segarkan cache skema PostgREST
-- ---------------------------------------------------------------------
notify pgrst, 'reload schema';

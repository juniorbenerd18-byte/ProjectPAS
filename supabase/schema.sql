-- =========================================================================
-- SCHOOLORG - SISTEM MANAJEMEN ORGANISASI SMK
-- DATABASE SCHEMA FOR SUPABASE (POSTGRESQL)
-- =========================================================================

-- 1. ENUM TYPES
DO $$ BEGIN
    CREATE TYPE user_role AS ENUM ('admin', 'pembina', 'ketua', 'bendahara', 'sekretaris', 'koordinator_sekbid', 'anggota');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE proker_status AS ENUM ('draft', 'diajukan', 'disetujui', 'ditolak', 'berjalan', 'selesai');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE attendance_status AS ENUM ('hadir', 'izin', 'sakit', 'alpa');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE transaction_type AS ENUM ('pemasukan', 'pengeluaran');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE due_status AS ENUM ('belum_lunas', 'menunggu_verifikasi', 'lunas');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- 2. ORGANISASI PROFILE
CREATE TABLE IF NOT EXISTS org_profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(150) NOT NULL,
    school_name VARCHAR(150) NOT NULL,
    academic_year VARCHAR(20) NOT NULL,
    vision TEXT,
    mission JSONB,
    history TEXT,
    logo_url TEXT,
    pembina_name VARCHAR(100),
    headmaster_name VARCHAR(100),
    ketua_name VARCHAR(100),
    address TEXT,
    phone VARCHAR(30),
    email VARCHAR(100),
    instagram VARCHAR(50),
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 3. DIVISI / SEKBID
CREATE TABLE IF NOT EXISTS divisions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL,
    code VARCHAR(20) UNIQUE NOT NULL,
    description TEXT,
    leader_name VARCHAR(100),
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 4. JABATAN
CREATE TABLE IF NOT EXISTS positions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL,
    level INT NOT NULL DEFAULT 5,
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 5. ANGGOTA (PROFILES)
CREATE TABLE IF NOT EXISTS members (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nisn VARCHAR(20) UNIQUE NOT NULL,
    full_name VARCHAR(150) NOT NULL,
    email VARCHAR(150) UNIQUE NOT NULL,
    role user_role DEFAULT 'anggota',
    grade VARCHAR(10) NOT NULL, -- 'X', 'XI', 'XII'
    class_room VARCHAR(30) NOT NULL,
    major VARCHAR(100) NOT NULL,
    division_id UUID REFERENCES divisions(id) ON DELETE SET NULL,
    position VARCHAR(100) DEFAULT 'Anggota',
    phone VARCHAR(30),
    avatar_url TEXT,
    is_active BOOLEAN DEFAULT true,
    status VARCHAR(20) DEFAULT 'aktif', -- 'aktif' | 'alumni'
    join_date DATE DEFAULT CURRENT_DATE,
    generation VARCHAR(50),
    alumni_year VARCHAR(10),
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 6. PROGRAM KERJA
CREATE TABLE IF NOT EXISTS work_programs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    division_id UUID REFERENCES divisions(id) ON DELETE CASCADE,
    title VARCHAR(200) NOT NULL,
    description TEXT,
    estimated_budget NUMERIC(12,2) DEFAULT 0,
    target_date DATE,
    status proker_status DEFAULT 'draft',
    progress_percent INT DEFAULT 0,
    proposal_url TEXT,
    lpj_url TEXT,
    evaluation TEXT,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 7. KEGIATAN
CREATE TABLE IF NOT EXISTS events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    work_program_id UUID REFERENCES work_programs(id) ON DELETE SET NULL,
    title VARCHAR(200) NOT NULL,
    description TEXT,
    event_date DATE NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    location VARCHAR(150) NOT NULL,
    status VARCHAR(20) DEFAULT 'mendatang',
    documentation_photos JSONB DEFAULT '[]'::jsonb,
    qr_token VARCHAR(100) UNIQUE NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 8. RAPAT
CREATE TABLE IF NOT EXISTS meetings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(200) NOT NULL,
    description TEXT,
    meeting_date DATE NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    location VARCHAR(150) NOT NULL,
    type VARCHAR(50) DEFAULT 'koordinasi',
    qr_token VARCHAR(100) UNIQUE NOT NULL,
    is_attendance_open BOOLEAN DEFAULT false,
    notulen TEXT,
    decisions JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 9. ABSENSI (RAPAT & KEGIATAN)
CREATE TABLE IF NOT EXISTS attendances (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    target_type VARCHAR(20) NOT NULL, -- 'rapat' | 'kegiatan'
    target_id UUID NOT NULL,
    member_id UUID REFERENCES members(id) ON DELETE CASCADE,
    status attendance_status DEFAULT 'hadir',
    check_in_time TIMESTAMPTZ DEFAULT now(),
    notes TEXT,
    UNIQUE(target_type, target_id, member_id)
);

-- 10. TRANSAKSI BUKU KAS
CREATE TABLE IF NOT EXISTS cash_transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    type transaction_type NOT NULL,
    category VARCHAR(50) NOT NULL,
    amount NUMERIC(12,2) NOT NULL,
    transaction_date DATE DEFAULT CURRENT_DATE,
    description TEXT NOT NULL,
    proof_url TEXT,
    recorded_by VARCHAR(100) NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 11. IURAN KAS SISWA
CREATE TABLE IF NOT EXISTS member_dues (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    member_id UUID REFERENCES members(id) ON DELETE CASCADE,
    period_month INT NOT NULL CHECK (period_month BETWEEN 1 AND 12),
    period_year INT NOT NULL,
    amount NUMERIC(12,2) NOT NULL,
    status due_status DEFAULT 'belum_lunas',
    proof_url TEXT,
    paid_at TIMESTAMPTZ,
    verified_by VARCHAR(100),
    verified_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE(member_id, period_month, period_year)
);

-- 12. ANGGARAN RAB PER DIVISI
CREATE TABLE IF NOT EXISTS budgets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    division_id UUID REFERENCES divisions(id) ON DELETE CASCADE,
    title VARCHAR(200) NOT NULL,
    allocated_amount NUMERIC(12,2) NOT NULL DEFAULT 0,
    used_amount NUMERIC(12,2) NOT NULL DEFAULT 0,
    fiscal_year VARCHAR(20) NOT NULL,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 13. DOKUMEN & PERSURATAN
CREATE TABLE IF NOT EXISTS documents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    type VARCHAR(30) NOT NULL, -- 'surat_masuk' | 'surat_keluar' | 'proposal' | 'lpj'
    document_number VARCHAR(100) UNIQUE NOT NULL,
    title VARCHAR(200) NOT NULL,
    document_date DATE DEFAULT CURRENT_DATE,
    sender_or_receiver VARCHAR(150),
    file_url TEXT,
    status VARCHAR(20) DEFAULT 'arsip',
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 14. PENGUMUMAN
CREATE TABLE IF NOT EXISTS announcements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(200) NOT NULL,
    content TEXT NOT NULL,
    priority VARCHAR(20) DEFAULT 'biasa', -- 'penting' | 'biasa'
    author VARCHAR(100) NOT NULL,
    date DATE DEFAULT CURRENT_DATE,
    target_role VARCHAR(50) DEFAULT 'Semua',
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 15. PENDAFTAR OPREC CALON ANGGOTA (OPEN RECRUITMENT)
CREATE TABLE IF NOT EXISTS recruitments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    registration_number VARCHAR(50) UNIQUE NOT NULL,
    full_name VARCHAR(150) NOT NULL,
    nisn VARCHAR(20) NOT NULL,
    grade VARCHAR(10) NOT NULL,
    class_room VARCHAR(30) NOT NULL,
    major VARCHAR(100) NOT NULL,
    phone VARCHAR(30) NOT NULL,
    email VARCHAR(150),
    division_choice_1 VARCHAR(100) NOT NULL,
    division_choice_2 VARCHAR(100) NOT NULL,
    reason TEXT NOT NULL,
    skills JSONB DEFAULT '[]'::jsonb,
    applied_date DATE DEFAULT CURRENT_DATE,
    status VARCHAR(30) DEFAULT 'menunggu',
    interview_schedule VARCHAR(100),
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 16. KOTAK IDE & ASPIRASI SISWA
CREATE TABLE IF NOT EXISTS aspirations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_name VARCHAR(150) NOT NULL,
    is_anonymous BOOLEAN DEFAULT false,
    class_room VARCHAR(30) NOT NULL,
    email VARCHAR(150),
    sender_role VARCHAR(50) DEFAULT 'siswa',
    category VARCHAR(50) NOT NULL,
    title VARCHAR(200) NOT NULL,
    content TEXT NOT NULL,
    date DATE DEFAULT CURRENT_DATE,
    status VARCHAR(30) DEFAULT 'diterima',
    response TEXT,
    responded_by VARCHAR(100),
    likes INT DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 17. PENDAFTARAN EVENT / KEGIATAN SISWA
CREATE TABLE IF NOT EXISTS event_registrations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    ticket_code VARCHAR(50) UNIQUE NOT NULL,
    event_id VARCHAR(100) NOT NULL,
    event_title VARCHAR(200) NOT NULL,
    student_name VARCHAR(150) NOT NULL,
    grade VARCHAR(10) NOT NULL,
    class_room VARCHAR(30) NOT NULL,
    major VARCHAR(100) NOT NULL,
    nisn VARCHAR(20) NOT NULL,
    phone VARCHAR(30) NOT NULL,
    email VARCHAR(150),
    registration_date DATE DEFAULT CURRENT_DATE,
    status VARCHAR(30) DEFAULT 'terdaftar',
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 18. GALERI / DOKUMENTASI KEGIATAN (PORTAL PUBLIK)
CREATE TABLE IF NOT EXISTS gallery_photos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(200) NOT NULL DEFAULT '',
    caption TEXT DEFAULT '',
    image_url TEXT NOT NULL,
    date DATE DEFAULT CURRENT_DATE,
    category VARCHAR(80),
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 19. META APLIKASI (PENANDA MIGRASI & VERSI SKEMA)
CREATE TABLE IF NOT EXISTS app_meta (
    key TEXT PRIMARY KEY,
    value JSONB NOT NULL DEFAULT '{}'::jsonb,
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- =========================================================================
-- 20. KOLOM TAMBAHAN (SINKRONISASI PENUH APLIKASI <-> CLOUD)
--     Idempoten: aman dijalankan berulang kali.
-- =========================================================================

-- Branding & pengaturan portal organisasi
ALTER TABLE org_profiles
    ADD COLUMN IF NOT EXISTS app_name VARCHAR(80),
    ADD COLUMN IF NOT EXISTS motto TEXT,
    ADD COLUMN IF NOT EXISTS vision_photo_url TEXT,
    ADD COLUMN IF NOT EXISTS hero_photo_url TEXT,
    ADD COLUMN IF NOT EXISTS nip_pembina VARCHAR(50),
    ADD COLUMN IF NOT EXISTS nip_headmaster VARCHAR(50),
    ADD COLUMN IF NOT EXISTS nisn_ketua VARCHAR(20),
    ADD COLUMN IF NOT EXISTS ketua_photo_url TEXT,
    ADD COLUMN IF NOT EXISTS ketua_period VARCHAR(50),
    ADD COLUMN IF NOT EXISTS ketua_welcome_title VARCHAR(150),
    ADD COLUMN IF NOT EXISTS ketua_speech TEXT,
    ADD COLUMN IF NOT EXISTS monthly_due_amount NUMERIC(12,2) DEFAULT 15000,
    ADD COLUMN IF NOT EXISTS due_due_day INT DEFAULT 25,
    ADD COLUMN IF NOT EXISTS bank_name VARCHAR(80),
    ADD COLUMN IF NOT EXISTS bank_account_number VARCHAR(60),
    ADD COLUMN IF NOT EXISTS bank_account_holder VARCHAR(150),
    ADD COLUMN IF NOT EXISTS is_registration_open BOOLEAN DEFAULT true,
    ADD COLUMN IF NOT EXISTS registration_gform_url TEXT,
    ADD COLUMN IF NOT EXISTS registration_open_date VARCHAR(60),
    ADD COLUMN IF NOT EXISTS registration_close_date VARCHAR(60),
    ADD COLUMN IF NOT EXISTS registration_notice TEXT,
    ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT now();

-- Kegiatan: rentang tanggal & judul program kerja
ALTER TABLE events
    ADD COLUMN IF NOT EXISTS end_date DATE,
    ADD COLUMN IF NOT EXISTS start_datetime TIMESTAMPTZ,
    ADD COLUMN IF NOT EXISTS end_datetime TIMESTAMPTZ,
    ADD COLUMN IF NOT EXISTS work_program_title VARCHAR(200);

-- Program kerja: nama divisi & jobdesk kepanitiaan
ALTER TABLE work_programs
    ADD COLUMN IF NOT EXISTS division_name VARCHAR(150),
    ADD COLUMN IF NOT EXISTS tasks JSONB DEFAULT '[]'::jsonb;

-- Kas: referensi ke iuran / kegiatan
ALTER TABLE cash_transactions
    ADD COLUMN IF NOT EXISTS reference_id VARCHAR(100);

-- Presensi: snapshot identitas peserta
ALTER TABLE attendances
    ADD COLUMN IF NOT EXISTS target_title VARCHAR(200),
    ADD COLUMN IF NOT EXISTS member_name VARCHAR(150),
    ADD COLUMN IF NOT EXISTS nisn VARCHAR(20),
    ADD COLUMN IF NOT EXISTS grade VARCHAR(10),
    ADD COLUMN IF NOT EXISTS major VARCHAR(100);

-- Iuran kas: snapshot identitas anggota
ALTER TABLE member_dues
    ADD COLUMN IF NOT EXISTS member_name VARCHAR(150),
    ADD COLUMN IF NOT EXISTS nisn VARCHAR(20);

-- Anggaran RAB: nama divisi
ALTER TABLE budgets
    ADD COLUMN IF NOT EXISTS division_name VARCHAR(150);

-- Kompatibilitas: kolom yang diisi opsional oleh aplikasi
ALTER TABLE events ALTER COLUMN qr_token DROP NOT NULL;
ALTER TABLE meetings ALTER COLUMN qr_token DROP NOT NULL;
ALTER TABLE event_registrations
    ALTER COLUMN grade DROP NOT NULL,
    ALTER COLUMN class_room DROP NOT NULL,
    ALTER COLUMN major DROP NOT NULL,
    ALTER COLUMN phone DROP NOT NULL;

-- =========================================================================
-- 21. HAK AKSES (ANON KEY DIPAKAI APLIKASI)
-- =========================================================================
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO anon, authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON gallery_photos, app_meta TO anon, authenticated;

-- =========================================================================
-- 22. ROW LEVEL SECURITY (PERMISSIVE)
--     Level keamanan aplikasi UKK: satu kata sandi bersama untuk pengurus.
-- =========================================================================
DO $$
DECLARE
    t TEXT;
BEGIN
    FOREACH t IN ARRAY ARRAY[
        'announcements', 'aspirations', 'attendances', 'budgets', 'cash_transactions',
        'divisions', 'documents', 'events', 'meetings', 'member_dues', 'members',
        'org_profiles', 'positions', 'recruitments', 'work_programs',
        'gallery_photos', 'event_registrations', 'app_meta'
    ]
    LOOP
        EXECUTE format('ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY', t);
        EXECUTE format('DROP POLICY IF EXISTS %I ON public.%I', 'Allow all for ' || t, t);
        EXECUTE format(
            'CREATE POLICY %I ON public.%I FOR ALL USING (true) WITH CHECK (true)',
            'Allow all for ' || t, t
        );
    END LOOP;
END $$;

-- =========================================================================
-- 23. REALTIME PUBLICATION (SINKRONISASI ANTAR PERANGKAT)
-- =========================================================================
DO $$
DECLARE
    t TEXT;
BEGIN
    FOREACH t IN ARRAY ARRAY[
        'members', 'divisions', 'positions', 'org_profiles', 'work_programs', 'events',
        'meetings', 'attendances', 'cash_transactions', 'member_dues', 'budgets',
        'documents', 'announcements', 'aspirations', 'recruitments',
        'event_registrations', 'gallery_photos'
    ]
    LOOP
        IF NOT EXISTS (
            SELECT 1 FROM pg_publication_tables
            WHERE pubname = 'supabase_realtime' AND schemaname = 'public' AND tablename = t
        ) THEN
            EXECUTE format('ALTER PUBLICATION supabase_realtime ADD TABLE public.%I', t);
        END IF;
    END LOOP;
END $$;

-- =========================================================================
-- 24. AKUN ADMIN (GMAIL PEMILIK APLIKASI)
-- =========================================================================
UPDATE members
   SET email = 'juniorbenerd18@gmail.com'
 WHERE nisn = '0000000009'
   AND role = 'admin';

-- Segarkan cache skema PostgREST
NOTIFY pgrst, 'reload schema';

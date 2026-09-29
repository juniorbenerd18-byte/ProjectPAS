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

-- =========================================================================
-- MIGRATION: PENDAFTAR OPREC, KOTAK ASPIRASI & PENDAFTARAN EVENT
-- SIMO (SISTEM INFORMASI MANAJEMEN ORGANISASI) SMK
-- Jalankan script ini di: Supabase Dashboard -> SQL Editor -> New Query -> Run
-- =========================================================================

-- 1. TABEL PENDAFTAR OPREC (CALON ANGGOTA BARU)
CREATE TABLE IF NOT EXISTS public.recruitments (
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
    status VARCHAR(30) DEFAULT 'menunggu', -- 'menunggu' | 'lolos_berkas' | 'wawancara' | 'diterima' | 'ditolak'
    interview_schedule VARCHAR(100),
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- RLS: Izinkan akses penuh untuk recruitments
ALTER TABLE public.recruitments ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow all for recruitments" ON public.recruitments;
CREATE POLICY "Allow all for recruitments" ON public.recruitments FOR ALL USING (true) WITH CHECK (true);

-- 2. TABEL KOTAK ASPIRASI & MASUKAN SISWA
CREATE TABLE IF NOT EXISTS public.aspirations (
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
    status VARCHAR(30) DEFAULT 'diterima', -- 'diterima' | 'diproses' | 'terealisasi' | 'ditolak'
    response TEXT,
    responded_by VARCHAR(100),
    likes INT DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- RLS: Izinkan akses penuh untuk aspirations
ALTER TABLE public.aspirations ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow all for aspirations" ON public.aspirations;
CREATE POLICY "Allow all for aspirations" ON public.aspirations FOR ALL USING (true) WITH CHECK (true);

-- 3. TABEL PENDAFTARAN EVENT / KEGIATAN SISWA
CREATE TABLE IF NOT EXISTS public.event_registrations (
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

-- RLS: Izinkan akses penuh untuk event_registrations
ALTER TABLE public.event_registrations ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow all for event_registrations" ON public.event_registrations;
CREATE POLICY "Allow all for event_registrations" ON public.event_registrations FOR ALL USING (true) WITH CHECK (true);

-- 4. BUKA AKSES RLS UNTUK WORK PROGRAMS & CASH TRANSACTIONS
ALTER TABLE public.work_programs ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow all for work_programs" ON public.work_programs;
CREATE POLICY "Allow all for work_programs" ON public.work_programs FOR ALL USING (true) WITH CHECK (true);

ALTER TABLE public.cash_transactions ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow all for cash_transactions" ON public.cash_transactions;
CREATE POLICY "Allow all for cash_transactions" ON public.cash_transactions FOR ALL USING (true) WITH CHECK (true);

-- 5. SEED DATA AWAL PENDAFTAR OPREC
INSERT INTO public.recruitments (registration_number, full_name, nisn, grade, class_room, major, phone, email, division_choice_1, division_choice_2, reason, skills, applied_date, status)
VALUES
('REG-2026-001', 'Bagus Ramadhan', '0081234509', 'X', 'X PPLG 1', 'PPLG', '081234567890', 'bagus@smkn1cb.sch.id', 'Sekbid 9: TIK & Multimedia', 'Sekbid 5: Demokrasi & HAM', 'Ingin berkontribusi dalam tim pubdok dan pengelolaan website organisasi OSIS.', '["Web Development", "UI Design", "Fotografi"]'::jsonb, '2026-11-12', 'wawancara'),
('REG-2026-002', 'Nabila Zahra', '0081234510', 'X', 'X AKL 2', 'AKL', '081298765432', 'nabila@smkn1cb.sch.id', 'Sekbid 6: Kewirausahaan', 'Sekbid 2: Budi Pekerti Luhur', 'Memiliki minat di bidang pencatatan keuangan dan kewirausahaan bazar sekolah.', '["Public Speaking", "Microsoft Excel", "Administrasi"]'::jsonb, '2026-11-14', 'lolos_berkas'),
('REG-2026-003', 'Dimas Rizky', '0081234511', 'X', 'X DKV 1', 'DKV', '081377889900', 'dimas@smkn1cb.sch.id', 'Sekbid 9: TIK & Multimedia', 'Sekbid 8: Sastra & Budaya', 'Ingin membantu desain konten media sosial dan dokumentasi kegiatan OSIS.', '["Graphic Design", "Video Editing", "Canva"]'::jsonb, '2026-11-15', 'menunggu')
ON CONFLICT (registration_number) DO NOTHING;

-- 6. SEED DATA AWAL KOTAK ASPIRASI
INSERT INTO public.aspirations (student_name, is_anonymous, class_room, category, title, content, date, status, response, responded_by, likes)
VALUES
('Ahmad Fauzi', false, 'XI PPLG 2', 'fasilitas', 'Penambahan Titik Akses WiFi di Selasar Belakang Lab Komputer', 'Mohon izin mengusulkan penambahan hotspot WiFi di sekitar selasar lab untuk siswa yang mengerjakan tugas coding dan project PAS saat istirahat.', '2026-11-10', 'diproses', 'Usulan telah diteruskan ke Sekbid TIK dan pihak sarpras sekolah untuk evaluasi titik access point.', 'Fajar Pratama (Ketua OSIS)', 12),
('Hamba Allah', true, 'X MPLB 1', 'kegiatan', 'Pelatihan Public Speaking & Leadership untuk Siswa Kelas X', 'Semoga OSIS bisa mengadakan workshop public speaking gratis di hari Sabtu agar kami lebih percaya diri saat presentasi kelas.', '2026-11-13', 'diterima', null, null, 8),
('Dewi Lestari', false, 'XII AKL 1', 'kebersihan', 'Pemisahan Tempat Sampah Organik dan Anorganik di Kantin Baru', 'Kantin baru sekolah sudah ramai, tapi tempat sampah masih campur aduk. Mohon OSIS mengadakan program bank sampah atau penataan tempat sampah pilah.', '2026-11-14', 'terealisasi', 'Program pilah sampah bekerjasama dengan Sekbid 7 dan Adiwiyata telah diluncurkan per 15 November 2026.', 'Anisa Rahmawati (Sekretaris)', 24)
ON CONFLICT DO NOTHING;

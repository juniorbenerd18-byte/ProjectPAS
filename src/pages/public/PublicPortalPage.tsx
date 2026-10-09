import React, { useState, useMemo } from 'react';
import {
  Building2,
  Calendar,
  MapPin,
  Search,
  CheckCircle2,
  ArrowRight,
  ShieldCheck,
  Sparkles,
  MessageSquare,
  Send,
  X,
  Lock,
  Sun,
  Moon,
  Menu,
  ThumbsUp,
  AlertCircle,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import QRCode from 'qrcode';
import { useApp } from '../../context/AppContext';
import { Member, EventItem, StudentAspiration, EventRegistration } from '../../types';

export const PublicPortalPage: React.FC = () => {
  const {
    orgProfile,
    divisions,
    members,
    events,
    workPrograms,
    aspirations,
    addAspiration,
    likeAspiration,
    registerForEvent,
    setActivePage,
    theme,
    toggleTheme,
    showToast,
  } = useApp();

  // Navigation & Mobile Menu
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeTabAspirasi, setActiveTabAspirasi] = useState<'feed' | 'form'>('feed');

  // Filters
  const [selectedDivisionTab, setSelectedDivisionTab] = useState<string>('all');
  const [searchMemberQuery, setSearchMemberQuery] = useState('');
  const [aspirationCategoryFilter, setAspirationCategoryFilter] = useState<string>('all');
  const [eventFilter, setEventFilter] = useState<'all' | 'mendatang' | 'selesai'>('all');

  // Event Registration Modal
  const [selectedEventForReg, setSelectedEventForReg] = useState<EventItem | null>(null);
  const [eventRegModalOpen, setEventRegModalOpen] = useState(false);
  const [issuedTicket, setIssuedTicket] = useState<EventRegistration | null>(null);
  const [ticketQrDataUrl, setTicketQrDataUrl] = useState<string>('');

  // KTA Verification
  const [verifyQuery, setVerifyQuery] = useState('');
  const [verifiedMember, setVerifiedMember] = useState<Member | null>(null);
  const [hasSearchedVerify, setHasSearchedVerify] = useState(false);

  // FAQ Accordion
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);

  // Form State: Aspirasi Siswa
  const [aspirationForm, setAspirationForm] = useState({
    studentName: '',
    isAnonymous: false,
    classRoom: '',
    category: 'fasilitas' as StudentAspiration['category'],
    title: '',
    content: '',
  });

  // Form State: Event Registration
  const [eventRegForm, setEventRegForm] = useState({
    studentName: '',
    nisn: '',
    classRoom: '',
    phone: '',
  });

  const activeMembersCount = members.filter((m) => m.status === 'aktif').length;

  // Filtered Members
  const filteredMembers = useMemo(() => {
    return members.filter((m) => {
      const matchDiv = selectedDivisionTab === 'all' || m.divisionId === selectedDivisionTab;
      const matchQuery =
        m.fullName.toLowerCase().includes(searchMemberQuery.toLowerCase()) ||
        m.position.toLowerCase().includes(searchMemberQuery.toLowerCase()) ||
        m.classRoom.toLowerCase().includes(searchMemberQuery.toLowerCase());
      return matchDiv && matchQuery && m.status === 'aktif';
    });
  }, [members, selectedDivisionTab, searchMemberQuery]);

  // Filtered Events
  const filteredEvents = useMemo(() => {
    return events.filter((e) => {
      if (eventFilter === 'all') return true;
      return e.status === eventFilter;
    });
  }, [events, eventFilter]);

  // Filtered Aspirations
  const filteredAspirations = useMemo(() => {
    return aspirations.filter((a) => {
      if (aspirationCategoryFilter === 'all') return true;
      return a.category === aspirationCategoryFilter;
    });
  }, [aspirations, aspirationCategoryFilter]);

  // Handle Submit Aspirasi
  const handleAspirationSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!aspirationForm.title.trim() || !aspirationForm.content.trim()) {
      showToast('Judul dan isi aspirasi wajib diisi.', 'error');
      return;
    }
    const finalStudentName = aspirationForm.isAnonymous
      ? 'Anonim (Siswa)'
      : aspirationForm.studentName.trim() || 'Siswa SMKN 1';

    addAspiration({
      studentName: finalStudentName,
      isAnonymous: aspirationForm.isAnonymous,
      classRoom: aspirationForm.classRoom.trim() || 'Umum',
      category: aspirationForm.category,
      title: aspirationForm.title,
      content: aspirationForm.content,
    });

    setAspirationForm({
      studentName: '',
      isAnonymous: false,
      classRoom: '',
      category: 'fasilitas',
      title: '',
      content: '',
    });
    setActiveTabAspirasi('feed');

    confetti({
      particleCount: 50,
      spread: 60,
      origin: { y: 0.7 },
    });
  };

  // Handle Event Registration
  const handleOpenEventRegModal = (evt: EventItem) => {
    setSelectedEventForReg(evt);
    setEventRegModalOpen(true);
  };

  const handleEventRegSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedEventForReg) return;
    if (!eventRegForm.studentName.trim() || !eventRegForm.nisn.trim() || !eventRegForm.classRoom.trim()) {
      showToast('Lengkapi nama, NISN, dan kelas untuk mendapatkan tiket.', 'error');
      return;
    }

    const registered = registerForEvent({
      eventId: selectedEventForReg.id,
      eventTitle: selectedEventForReg.title,
      studentName: eventRegForm.studentName.trim(),
      nisn: eventRegForm.nisn.trim(),
      classRoom: eventRegForm.classRoom.trim(),
      phone: eventRegForm.phone.trim() || '-',
    });

    try {
      const qr = await QRCode.toDataURL(
        `TICKET|${registered.ticketCode}|${registered.studentName}|${selectedEventForReg.title}`
      );
      setTicketQrDataUrl(qr);
    } catch (err) {
      console.error(err);
    }

    setIssuedTicket(registered);
    setEventRegForm({ studentName: '', nisn: '', classRoom: '', phone: '' });

    confetti({
      particleCount: 80,
      spread: 70,
      origin: { y: 0.6 },
    });
  };

  // Handle Verify Search
  const handleVerifySearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!verifyQuery.trim()) {
      setVerifiedMember(null);
      setHasSearchedVerify(false);
      return;
    }
    const q = verifyQuery.trim().toLowerCase();
    const found = members.find(
      (m) =>
        m.nisn.toLowerCase() === q ||
        m.fullName.toLowerCase().includes(q) ||
        m.id.toLowerCase() === q
    );
    setVerifiedMember(found || null);
    setHasSearchedVerify(true);
  };

  const faqList = [
    {
      q: 'Apakah siswa non-pengurus bisa mengikuti kegiatan OSIS?',
      a: 'Ya, tentu saja! Seluruh agenda kegiatan seperti Classmeeting, SMK Hackathon, Peringatan Hari Besar, dan Seminar terbuka untuk seluruh siswa SMKN 1 Cerdas Bangsa.',
    },
    {
      q: 'Bagaimana cara menyampaikan aspirasi atau keluhan sarana kelas?',
      a: 'Kamu dapat memanfaatkan fitur "Suara Siswa" di portal ini. Masukkan judul dan pesanmu, serta centang opsi Anonim jika ingin merahasiakan identitasmu.',
    },
    {
      q: 'Bagaimana cara memverifikasi keaslian kartu tanda anggota (KTA) pengurus?',
      a: 'Cukup masukkan NISN atau nama pengurus di bagian "Cek Validitas KTA". Sistem akan memverifikasi langsung dengan data resmi sekolah.',
    },
  ];

  return (
    <div className="min-h-screen bg-white dark:bg-slate-950 text-slate-800 dark:text-slate-100 font-sans transition-colors duration-200">
      {/* ========================================================================= */}
      {/* 1. CLEAN & MINIMALIST NAVBAR (WHITE & SOFT LIGHT BLUE) */}
      {/* ========================================================================= */}
      <header className="sticky top-0 z-40 bg-white/95 dark:bg-slate-950/95 backdrop-blur-md border-b border-sky-100 dark:border-slate-800 transition-colors">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-18 flex items-center justify-between">
          {/* Logo & School Name */}
          <a href="#beranda" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-xl bg-sky-500 text-white flex items-center justify-center font-bold shadow-xs transition-transform group-hover:scale-105">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-bold tracking-tight text-slate-900 dark:text-white">
                  OSIS <span className="text-sky-600 dark:text-sky-400">SMKN 1 CERDAS</span>
                </span>
                <span className="hidden sm:inline-block px-2 py-0.5 rounded-full text-[10px] font-semibold bg-sky-50 dark:bg-sky-950/60 text-sky-700 dark:text-sky-300 border border-sky-200/80 dark:border-sky-900">
                  Portal Siswa
                </span>
              </div>
              <p className="text-[11px] text-slate-400 font-normal">
                Masa Bakti {orgProfile.academicYear}
              </p>
            </div>
          </a>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-6 text-xs font-semibold text-slate-600 dark:text-slate-300">
            <a href="#beranda" className="hover:text-sky-600 dark:hover:text-sky-400 transition-colors">
              Beranda
            </a>
            <a href="#tentang" className="hover:text-sky-600 dark:hover:text-sky-400 transition-colors">
              Profil
            </a>
            <a href="#pengurus" className="hover:text-sky-600 dark:hover:text-sky-400 transition-colors">
              Pengurus
            </a>
            <a href="#agenda" className="hover:text-sky-600 dark:hover:text-sky-400 transition-colors">
              Agenda Event
            </a>
            <a href="#aspirasi" className="hover:text-sky-600 dark:hover:text-sky-400 transition-colors flex items-center gap-1.5">
              <span>Suara Siswa</span>
              <span className="w-1.5 h-1.5 rounded-full bg-sky-500" />
            </a>
            <a href="#verifikasi" className="hover:text-sky-600 dark:hover:text-sky-400 transition-colors">
              Cek KTA
            </a>
          </nav>

          {/* Right Action: Theme Toggle & Dashboard Switch */}
          <div className="flex items-center gap-2">
            <button
              onClick={toggleTheme}
              className="p-2 rounded-xl text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 hover:bg-sky-50 dark:hover:bg-slate-900 transition-colors cursor-pointer"
              title={theme === 'dark' ? 'Mode Terang' : 'Mode Gelap'}
            >
              {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-sky-600" />}
            </button>

            <button
              onClick={() => setActivePage('dashboard')}
              className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-sky-500 hover:bg-sky-600 active:scale-95 text-white text-xs font-semibold shadow-xs transition-all cursor-pointer"
            >
              <Lock className="w-3.5 h-3.5" />
              <span>Masuk Dashboard</span>
              <ArrowRight className="w-3.5 h-3.5 hidden sm:inline" />
            </button>

            {/* Mobile Hamburger */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-xl text-slate-500 hover:text-slate-800 dark:text-slate-400 md:hidden cursor-pointer"
            >
              <Menu className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Mobile Dropdown */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-sky-100 dark:border-slate-800 bg-white dark:bg-slate-950 px-4 py-3 space-y-1 text-xs font-semibold text-slate-700 dark:text-slate-200">
            <a href="#beranda" onClick={() => setMobileMenuOpen(false)} className="block px-3 py-2 rounded-lg hover:bg-sky-50 dark:hover:bg-slate-900">
              Beranda
            </a>
            <a href="#tentang" onClick={() => setMobileMenuOpen(false)} className="block px-3 py-2 rounded-lg hover:bg-sky-50 dark:hover:bg-slate-900">
              Profil & Visi Misi
            </a>
            <a href="#pengurus" onClick={() => setMobileMenuOpen(false)} className="block px-3 py-2 rounded-lg hover:bg-sky-50 dark:hover:bg-slate-900">
              Pengurus & Sekbid
            </a>
            <a href="#agenda" onClick={() => setMobileMenuOpen(false)} className="block px-3 py-2 rounded-lg hover:bg-sky-50 dark:hover:bg-slate-900">
              Agenda Event
            </a>
            <a href="#aspirasi" onClick={() => setMobileMenuOpen(false)} className="block px-3 py-2 rounded-lg hover:bg-sky-50 dark:hover:bg-slate-900 text-sky-600 dark:text-sky-400 font-bold">
              Suara Siswa & Kotak Aspirasi
            </a>
            <a href="#verifikasi" onClick={() => setMobileMenuOpen(false)} className="block px-3 py-2 rounded-lg hover:bg-sky-50 dark:hover:bg-slate-900">
              Cek Validitas KTA
            </a>
          </div>
        )}
      </header>

      {/* ========================================================================= */}
      {/* 2. HERO SECTION (MINIMALIST, CLEAN WHITE & BLUE ACCENTS) */}
      {/* ========================================================================= */}
      <section id="beranda" className="relative py-16 sm:py-20 border-b border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-950">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center">
          {/* Subtle Tag */}
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-sky-100/70 dark:bg-sky-950/60 text-sky-700 dark:text-sky-300 border border-sky-200/60 dark:border-sky-800 mb-5">
            <Sparkles className="w-3.5 h-3.5 text-sky-500" />
            <span>Keterbukaan Informasi & Kolaborasi Pelajar</span>
          </div>

          {/* Clean Headline */}
          <h1 className="text-3xl sm:text-5xl font-extrabold text-slate-900 dark:text-white tracking-tight leading-tight sm:leading-tight">
            Portal Informasi & Aspirasi{' '}
            <span className="text-sky-600 dark:text-sky-400">
              Pelajar SMKN 1 Cerdas
            </span>
          </h1>

          {/* Clean Subtitle */}
          <p className="mt-4 text-sm sm:text-base text-slate-600 dark:text-slate-300 max-w-2xl mx-auto leading-relaxed font-normal">
            Website publik resmi OSIS untuk seluruh siswa. Sampaikan aspirasi fasilitas kelas, pantau agenda kegiatan sekolah, dan kenali struktur pengurus perwakilanmu.
          </p>

          {/* 3 Clean Action Buttons */}
          <div className="mt-7 flex flex-wrap items-center justify-center gap-3">
            <a
              href="#aspirasi"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-sky-500 hover:bg-sky-600 active:scale-95 text-white font-semibold text-xs shadow-xs transition-all cursor-pointer"
            >
              <MessageSquare className="w-4 h-4" />
              <span>Sampaikan Aspirasi Siswa</span>
            </a>

            <a
              href="#agenda"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white dark:bg-slate-900 hover:bg-sky-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 font-semibold text-xs border border-sky-200/80 dark:border-slate-800 shadow-2xs transition-all cursor-pointer"
            >
              <Calendar className="w-4 h-4 text-sky-500" />
              <span>Lihat Agenda Kegiatan</span>
            </a>

            <a
              href="#verifikasi"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white dark:bg-slate-900 hover:bg-sky-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 font-semibold text-xs border border-sky-200/80 dark:border-slate-800 shadow-2xs transition-all cursor-pointer"
            >
              <ShieldCheck className="w-4 h-4 text-emerald-500" />
              <span>Cek Validitas KTA</span>
            </a>
          </div>

          {/* 4 Minimalist Stat Badges with Distinct Gray Containers */}
          <div className="mt-12 grid grid-cols-2 sm:grid-cols-4 gap-3.5 max-w-3xl mx-auto">
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 text-center shadow-xs hover:border-blue-300 transition-colors">
              <p className="text-2xl sm:text-3xl font-extrabold text-blue-600 dark:text-blue-400">{activeMembersCount}</p>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-semibold mt-1">Pengurus Aktif</p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 text-center shadow-xs hover:border-blue-300 transition-colors">
              <p className="text-2xl sm:text-3xl font-extrabold text-blue-600 dark:text-blue-400">{workPrograms.length}</p>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-semibold mt-1">Program Kerja</p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 text-center shadow-xs hover:border-blue-300 transition-colors">
              <p className="text-2xl sm:text-3xl font-extrabold text-blue-600 dark:text-blue-400">{divisions.length}</p>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-semibold mt-1">Seksi Bidang</p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 text-center shadow-xs hover:border-blue-300 transition-colors">
              <p className="text-2xl sm:text-3xl font-extrabold text-blue-600 dark:text-blue-400">{aspirations.length}</p>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-semibold mt-1">Aspirasi Siswa</p>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 3. PROFIL & VISI MISI (CLEAN GROUPED CARDS WITH GRAY PANELS) */}
      {/* ========================================================================= */}
      <section id="tentang" className="py-14 sm:py-16 border-b border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-950">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <div className="text-center max-w-2xl mx-auto mb-10">
            <span className="text-[11px] font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400">
              Profil Organisasi
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white mt-1">
              Tentang OSIS & Visi Masa Bakti
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Menjunjung tinggi transparansi, integritas, dan pelayanan bagi seluruh warga sekolah.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-stretch">
            {/* Sambutan Singkat - Distinct Gray Card Container */}
            <div className="p-6 sm:p-7 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs flex flex-col justify-between hover:border-blue-200 transition-colors">
              <div>
                <div className="flex items-center gap-3.5 mb-4">
                  <img
                    src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80"
                    alt={orgProfile.ketuaName}
                    className="w-13 h-13 rounded-xl object-cover ring-2 ring-blue-200 dark:ring-slate-700 shadow-2xs"
                  />
                  <div>
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white">{orgProfile.ketuaName}</h3>
                    <p className="text-xs font-semibold text-blue-600 dark:text-blue-400">Ketua Umum OSIS</p>
                  </div>
                </div>
                <div className="p-4 rounded-xl bg-white dark:bg-slate-800/80 border border-slate-200/70 dark:border-slate-700 shadow-2xs">
                  <p className="text-xs text-slate-700 dark:text-slate-200 leading-relaxed font-normal italic">
                    "OSIS adalah wadah bersama bagi seluruh siswa SMKN 1 Cerdas Bangsa. Setiap gagasan, aspirasi fasilitas, maupun usulan kegiatan selalu kami dengar dan perjuangkan untuk kemajuan sekolah."
                  </p>
                </div>
              </div>
              <div className="mt-4 pt-3 border-t border-slate-200/70 dark:border-slate-800 text-[11px] text-slate-500 dark:text-slate-400 flex items-center justify-between font-medium">
                <span>Pembina OSIS: {orgProfile.pembinaName}</span>
                <span className="text-blue-600 dark:text-blue-400">Masa Bakti {orgProfile.academicYear}</span>
              </div>
            </div>

            {/* Visi & Misi Lengkap - Distinct Gray Card Container with White Nested Cards */}
            <div className="p-6 sm:p-7 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs flex flex-col justify-between hover:border-blue-200 transition-colors">
              <div>
                {/* Visi Sub-Card */}
                <div className="mb-4">
                  <div className="flex items-center gap-2 text-blue-700 dark:text-blue-300 font-bold text-xs uppercase tracking-wider mb-2">
                    <CheckCircle2 className="w-4 h-4 text-blue-600" />
                    <span>Visi Periode {orgProfile.academicYear}</span>
                  </div>
                  <div className="p-3.5 rounded-xl bg-white dark:bg-slate-800/80 border border-slate-200/70 dark:border-slate-700 shadow-2xs">
                    <p className="text-xs text-slate-700 dark:text-slate-200 leading-relaxed italic">
                      "{orgProfile.vision}"
                    </p>
                  </div>
                </div>

                {/* Misi Sub-Cards */}
                <div>
                  <div className="flex items-center gap-2 text-blue-700 dark:text-blue-300 font-bold text-xs uppercase tracking-wider mb-2">
                    <Sparkles className="w-4 h-4 text-blue-600" />
                    <span>Misi Organisasi</span>
                  </div>
                  <div className="space-y-2">
                    {orgProfile.mission.map((item, idx) => (
                      <div
                        key={idx}
                        className="flex items-start gap-2.5 p-2.5 rounded-xl bg-white dark:bg-slate-800/80 border border-slate-200/70 dark:border-slate-700 shadow-2xs text-xs text-slate-700 dark:text-slate-200"
                      >
                        <span className="w-5 h-5 rounded-md bg-blue-600 text-white flex items-center justify-center text-[9px] font-extrabold shrink-0 mt-0.5 shadow-2xs">
                          {idx + 1}
                        </span>
                        <span className="leading-relaxed font-medium">{item}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-200/70 dark:border-slate-800 text-[11px] text-blue-700 dark:text-blue-300 font-semibold flex items-center justify-between">
                <span>Motto: {orgProfile.motto}</span>
                <span className="text-slate-400 font-normal">{orgProfile.mission.length} Program Misi</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 4. STRUKTUR PENGURUS & SEKBID (CLEAN MINIMAL GRID WITH GRAY BACKGROUND) */}
      {/* ========================================================================= */}
      <section id="pengurus" className="py-14 sm:py-16 border-b border-slate-200/80 dark:border-slate-800 bg-slate-50/90 dark:bg-slate-950">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-6">
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400">
                Pengurus Organisasi
              </span>
              <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white mt-0.5">
                Kenali Pengurus OSIS & Seksi Bidang
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Hubungi perwakilan bidang terkait jika membutuhkan koordinasi atau informasi kegiatan.
              </p>
            </div>

            {/* Clean Search Input */}
            <div className="relative w-full sm:w-64">
              <Search className="w-3.5 h-3.5 absolute left-3 top-3 text-slate-400" />
              <input
                type="text"
                placeholder="Cari nama atau kelas..."
                value={searchMemberQuery}
                onChange={(e) => setSearchMemberQuery(e.target.value)}
                className="w-full pl-8 pr-3 py-2 rounded-xl text-xs bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 text-slate-800 dark:text-slate-100 outline-none focus:border-blue-500 shadow-2xs"
              />
            </div>
          </div>

          {/* Division Filter Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-2.5 mb-6 no-scrollbar">
            <button
              onClick={() => setSelectedDivisionTab('all')}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap cursor-pointer transition-colors ${
                selectedDivisionTab === 'all'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 border border-slate-200/80 dark:border-slate-800 hover:bg-slate-50'
              }`}
            >
              Semua Pengurus
            </button>
            {divisions.map((div) => (
              <button
                key={div.id}
                onClick={() => setSelectedDivisionTab(div.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap cursor-pointer transition-colors ${
                  selectedDivisionTab === div.id
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 border border-slate-200/80 dark:border-slate-800 hover:bg-slate-50'
                }`}
              >
                {div.code}
              </button>
            ))}
          </div>

          {/* Members Cards - Clean White Cards on Soft Gray Section */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {filteredMembers.map((member) => (
              <div
                key={member.id}
                className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 text-center shadow-xs hover:shadow-md hover:border-blue-300 transition-all group"
              >
                <img
                  src={member.avatarUrl}
                  alt={member.fullName}
                  className="w-16 h-16 rounded-xl object-cover mx-auto mb-2.5 ring-2 ring-slate-100 dark:ring-slate-800 group-hover:scale-105 transition-transform"
                />
                <h4 className="text-xs font-bold text-slate-900 dark:text-white truncate">
                  {member.fullName}
                </h4>
                <p className="text-[11px] font-semibold text-blue-600 dark:text-blue-400 mt-0.5 truncate">
                  {member.position}
                </p>
                <p className="text-[10px] text-slate-400 mt-0.5 truncate">
                  Kelas {member.classRoom}
                </p>
              </div>
            ))}
          </div>

          {filteredMembers.length === 0 && (
            <div className="text-center py-8 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 text-xs text-slate-400 shadow-2xs">
              Tidak ada pengurus yang cocok dengan pencarian.
            </div>
          )}
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 5. AGENDA KEGIATAN TERBUKA (EVENT CARDS WITH DISTINCT GRAY GROUPS) */}
      {/* ========================================================================= */}
      <section id="agenda" className="py-14 sm:py-16 border-b border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-950">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400">
                Agenda Kegiatan
              </span>
              <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white mt-0.5">
                Kegiatan & Event Sekolah Terbuka
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Seluruh siswa dapat mengikuti event dan mendaftar tiket masuk secara gratis.
              </p>
            </div>

            <div className="flex items-center gap-1.5">
              <button
                onClick={() => setEventFilter('all')}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold cursor-pointer ${
                  eventFilter === 'all'
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'bg-slate-50 dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 text-slate-600 dark:text-slate-300'
                }`}
              >
                Semua
              </button>
              <button
                onClick={() => setEventFilter('mendatang')}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold cursor-pointer ${
                  eventFilter === 'mendatang'
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'bg-slate-50 dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 text-slate-600 dark:text-slate-300'
                }`}
              >
                Mendatang
              </button>
              <button
                onClick={() => setEventFilter('selesai')}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold cursor-pointer ${
                  eventFilter === 'selesai'
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'bg-slate-50 dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 text-slate-600 dark:text-slate-300'
                }`}
              >
                Selesai
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {filteredEvents.map((evt) => {
              const isUpcoming = evt.status === 'mendatang';
              return (
                <div
                  key={evt.id}
                  className="p-6 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs flex flex-col justify-between hover:border-blue-300 hover:shadow-sm transition-all"
                >
                  <div>
                    <div className="flex items-center justify-between mb-2.5">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-blue-700 dark:text-blue-300 bg-blue-50 dark:bg-blue-950/60 px-2 py-0.5 rounded-md border border-blue-200/60">
                        {evt.workProgramTitle || 'Event Kesiswaan'}
                      </span>
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          isUpcoming
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : 'bg-slate-200 text-slate-600'
                        }`}
                      >
                        {isUpcoming ? 'Pendaftaran Buka' : 'Selesai'}
                      </span>
                    </div>

                    <h3 className="text-sm font-bold text-slate-900 dark:text-white leading-snug">
                      {evt.title}
                    </h3>
                    <p className="text-xs text-slate-600 dark:text-slate-300 mt-1.5 line-clamp-2">
                      {evt.description}
                    </p>

                    <div className="mt-4 p-3 rounded-xl bg-white dark:bg-slate-800 border border-slate-200/70 dark:border-slate-700 shadow-2xs space-y-1.5 text-xs text-slate-600 dark:text-slate-300">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                        <span>{evt.eventDate} ({evt.startTime} - {evt.endTime} WIB)</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <MapPin className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                        <span>{evt.location}</span>
                      </div>
                    </div>
                  </div>

                  <div className="mt-5 pt-3.5 border-t border-slate-200/70 dark:border-slate-800 flex items-center justify-between">
                    <span className="text-[11px] text-slate-500 font-medium">Gratis untuk seluruh siswa</span>
                    {isUpcoming ? (
                      <button
                        onClick={() => handleOpenEventRegModal(evt)}
                        className="px-3.5 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs shadow-xs cursor-pointer transition-colors"
                      >
                        Ambil Tiket
                      </button>
                    ) : (
                      <span className="text-xs text-slate-400 font-medium">Terlaksana</span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 6. SUARA SISWA & KOTAK ASPIRASI ONLINE (DISTINCT GRAY CONTAINER) */}
      {/* ========================================================================= */}
      <section id="aspirasi" className="py-14 sm:py-16 border-b border-slate-200/80 dark:border-slate-800 bg-slate-50/90 dark:bg-slate-950">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <div className="text-center max-w-xl mx-auto mb-8">
            <span className="text-[11px] font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400 flex items-center justify-center gap-1.5">
              <MessageSquare className="w-3.5 h-3.5" />
              <span>Suara Siswa</span>
            </span>
            <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white mt-0.5">
              Kotak Aspirasi & Usulan Siswa
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Kirim keluhan fasilitas, usulan lomba, atau masukan untuk sekolah. Bisa dikirim sebagai anonim.
            </p>
          </div>

          {/* Toggle Tab */}
          <div className="flex justify-center mb-6">
            <div className="inline-flex p-1 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-2xs">
              <button
                onClick={() => setActiveTabAspirasi('feed')}
                className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                  activeTabAspirasi === 'feed'
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'text-slate-600 dark:text-slate-300'
                }`}
              >
                Aspirasi Terkini ({aspirations.length})
              </button>
              <button
                onClick={() => setActiveTabAspirasi('form')}
                className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                  activeTabAspirasi === 'form'
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'text-slate-600 dark:text-slate-300'
                }`}
              >
                Kirim Aspirasi Baru
              </button>
            </div>
          </div>

          {/* Feed Tab */}
          {activeTabAspirasi === 'feed' && (
            <div className="space-y-3.5">
              {/* Category Filter */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
                {['all', 'fasilitas', 'kegiatan', 'kebersihan', 'organisasi'].map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setAspirationCategoryFilter(cat)}
                    className={`px-3 py-1 rounded-lg capitalize whitespace-nowrap cursor-pointer transition-colors ${
                      aspirationCategoryFilter === cat
                        ? 'bg-blue-600 text-white font-bold shadow-xs'
                        : 'bg-white dark:bg-slate-900 text-slate-600 border border-slate-200/80 dark:border-slate-800 hover:bg-slate-100'
                    }`}
                  >
                    {cat === 'all' ? 'Semua Kategori' : cat}
                  </button>
                ))}
              </div>

              {filteredAspirations.map((asp) => (
                <div
                  key={asp.id}
                  className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs hover:border-blue-300 transition-colors"
                >
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                        {asp.studentName}
                      </span>
                      <span className="text-[10px] text-slate-400">({asp.classRoom})</span>
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 font-medium capitalize border border-blue-200/60">
                        {asp.category}
                      </span>
                    </div>

                    {/* Status Badge */}
                    <div>
                      {asp.status === 'terealisasi' && (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                          Terealisasi
                        </span>
                      )}
                      {asp.status === 'diproses' && (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
                          Diproses
                        </span>
                      )}
                      {asp.status === 'diterima' && (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200">
                          Diterima
                        </span>
                      )}
                    </div>
                  </div>

                  <h3 className="text-xs font-bold text-slate-900 dark:text-white">{asp.title}</h3>
                  <p className="text-xs text-slate-600 dark:text-slate-300 mt-1 leading-relaxed">
                    {asp.content}
                  </p>

                  {asp.response && (
                    <div className="mt-3 p-3.5 rounded-xl bg-blue-50/70 dark:bg-slate-800/80 border border-blue-100 dark:border-slate-700 text-xs text-slate-800 dark:text-slate-200">
                      <span className="font-bold text-blue-700 dark:text-blue-400">Tanggapan OSIS: </span>
                      <span>{asp.response}</span>
                    </div>
                  )}

                  <div className="mt-3.5 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[11px] text-slate-400">
                    <span>{asp.date}</span>
                    <button
                      onClick={() => likeAspiration(asp.id)}
                      className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-slate-50 hover:bg-blue-50 text-slate-700 hover:text-blue-700 dark:bg-slate-800 dark:text-blue-300 font-medium cursor-pointer border border-slate-200/60 transition-colors"
                    >
                      <ThumbsUp className="w-3 h-3 text-blue-600" />
                      <span>Dukung ({asp.likes})</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Form Tab */}
          {activeTabAspirasi === 'form' && (
            <div className="p-6 sm:p-8 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm">
              <form onSubmit={handleAspirationSubmit} className="space-y-4 text-xs">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  <div>
                    <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                      Nama Pengirim
                    </label>
                    <input
                      type="text"
                      placeholder="Nama lengkap..."
                      value={aspirationForm.studentName}
                      disabled={aspirationForm.isAnonymous}
                      onChange={(e) => setAspirationForm({ ...aspirationForm, studentName: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 outline-none focus:border-blue-500 focus:bg-white disabled:opacity-50"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                      Kelas
                    </label>
                    <input
                      type="text"
                      placeholder="Contoh: XI RPL 1"
                      value={aspirationForm.classRoom}
                      onChange={(e) => setAspirationForm({ ...aspirationForm, classRoom: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 outline-none focus:border-blue-500 focus:bg-white"
                    />
                  </div>
                </div>

                <div className="flex items-center gap-2 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60">
                  <input
                    type="checkbox"
                    id="anonCheckbox"
                    checked={aspirationForm.isAnonymous}
                    onChange={(e) => setAspirationForm({ ...aspirationForm, isAnonymous: e.target.checked })}
                    className="rounded text-blue-600 focus:ring-blue-500 w-4 h-4 cursor-pointer"
                  />
                  <label htmlFor="anonCheckbox" className="text-slate-700 dark:text-slate-300 font-medium cursor-pointer">
                    Kirim sebagai <strong>Anonim</strong> (Identitas Anda dirahasiakan dari publik)
                  </label>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                    Kategori Aspirasi
                  </label>
                  <select
                    value={aspirationForm.category}
                    onChange={(e) => setAspirationForm({ ...aspirationForm, category: e.target.value as any })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 outline-none focus:border-blue-500 focus:bg-white cursor-pointer"
                  >
                    <option value="fasilitas">Fasilitas Kelas & Lab</option>
                    <option value="kegiatan">Usulan Kegiatan / Lomba</option>
                    <option value="kebersihan">Kantin & Kebersihan</option>
                    <option value="organisasi">Saran untuk OSIS</option>
                    <option value="akademik">Akademik & Ekskul</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                    Judul Usulan <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Contoh: Penambahan colokan listrik di lab komputer"
                    value={aspirationForm.title}
                    onChange={(e) => setAspirationForm({ ...aspirationForm, title: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 outline-none focus:border-blue-500 focus:bg-white"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                    Rincian Pesan & Harapan <span className="text-rose-500">*</span>
                  </label>
                  <textarea
                    required
                    rows={4}
                    placeholder="Jelaskan secara sopan apa yang diusulkan..."
                    value={aspirationForm.content}
                    onChange={(e) => setAspirationForm({ ...aspirationForm, content: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 outline-none focus:border-blue-500 focus:bg-white"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold flex items-center justify-center gap-2 cursor-pointer transition-colors shadow-xs"
                >
                  <Send className="w-4 h-4" />
                  <span>Kirimkan Aspirasi Sekarang</span>
                </button>
              </form>
            </div>
          )}
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 7. PUSAT VERIFIKASI KEASLIAN KTA (CLEAN GRAY CONTAINER BOX) */}
      {/* ========================================================================= */}
      <section id="verifikasi" className="py-14 sm:py-16 border-b border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-950">
        <div className="max-w-3xl mx-auto px-4 sm:px-6">
          <div className="p-6 sm:p-8 rounded-3xl bg-slate-50 dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs">
            <div className="text-center mb-6">
              <span className="text-[11px] font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400 flex items-center justify-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-500" />
                <span>Verifikasi Resmi</span>
              </span>
              <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white mt-1">
                Cek Validitas Pengurus OSIS
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Ketikkan NISN atau nama lengkap untuk mengecek status keanggotaan resmi.
              </p>
            </div>

            <form onSubmit={handleVerifySearch} className="flex gap-2 mb-6">
              <div className="relative flex-1">
                <Search className="w-4 h-4 absolute left-3.5 top-3.5 text-slate-400" />
                <input
                  type="text"
                  placeholder="Masukkan NISN atau Nama Pengurus..."
                  value={verifyQuery}
                  onChange={(e) => setVerifyQuery(e.target.value)}
                  className="w-full pl-10 pr-3.5 py-3 rounded-xl text-xs bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-100 outline-none focus:border-blue-500 shadow-2xs"
                />
              </div>
              <button
                type="submit"
                className="px-5 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs cursor-pointer transition-colors shadow-xs"
              >
                Cek Data
              </button>
            </form>

            {hasSearchedVerify && verifiedMember && (
              <div className="p-5 rounded-2xl bg-white dark:bg-slate-800 border border-emerald-300 dark:border-emerald-800 shadow-xs animate-in zoom-in-95">
                <div className="flex items-center gap-4">
                  <img
                    src={verifiedMember.avatarUrl}
                    alt={verifiedMember.fullName}
                    className="w-16 h-16 rounded-xl object-cover ring-2 ring-emerald-400 shadow-2xs"
                  />
                  <div className="text-xs space-y-0.5">
                    <div className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-bold text-[11px]">
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Terdaftar Resmi sebagai Pengurus Aktif</span>
                    </div>
                    <h4 className="font-extrabold text-slate-900 dark:text-white text-sm">{verifiedMember.fullName}</h4>
                    <p className="text-blue-600 dark:text-blue-400 font-semibold">{verifiedMember.position} • {verifiedMember.divisionName}</p>
                    <p className="text-slate-400 text-[11px]">NISN: {verifiedMember.nisn} • Kelas: {verifiedMember.classRoom}</p>
                  </div>
                </div>
              </div>
            )}

            {hasSearchedVerify && !verifiedMember && (
              <div className="p-5 rounded-2xl bg-white dark:bg-slate-800 border border-rose-200 dark:border-rose-900 text-center text-xs shadow-2xs">
                <AlertCircle className="w-6 h-6 text-rose-500 mx-auto mb-1.5" />
                <p className="font-bold text-slate-800 dark:text-slate-200">Data Tidak Ditemukan</p>
                <p className="text-slate-400 text-[11px] mt-0.5">"{verifyQuery}" tidak terdaftar sebagai pengurus aktif.</p>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 8. FAQ ACCORDION (DISTINCT GRAY BACKGROUND WITH WHITE ACCORDION CARDS) */}
      {/* ========================================================================= */}
      <section className="py-14 border-b border-slate-200/80 dark:border-slate-800 bg-slate-50/90 dark:bg-slate-950">
        <div className="max-w-2xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-8">
            <span className="text-[11px] font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400">
              Pertanyaan Umum
            </span>
            <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white mt-1">
              Informasi Seputar OSIS
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Pertanyaan yang sering diajukan seputar kegiatan dan keterlibatan siswa.
            </p>
          </div>

          <div className="space-y-2.5">
            {faqList.map((item, idx) => {
              const isOpen = openFaqIndex === idx;
              return (
                <div
                  key={idx}
                  className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs overflow-hidden transition-all"
                >
                  <button
                    onClick={() => setOpenFaqIndex(isOpen ? null : idx)}
                    className="w-full p-4 text-left flex items-center justify-between gap-3 font-bold text-xs text-slate-900 dark:text-white cursor-pointer hover:bg-slate-50/80 transition-colors"
                  >
                    <span>{item.q}</span>
                    {isOpen ? <ChevronUp className="w-4 h-4 text-blue-600 shrink-0" /> : <ChevronDown className="w-4 h-4 text-slate-400 shrink-0" />}
                  </button>
                  {isOpen && (
                    <div className="px-4 pb-4 text-xs text-slate-600 dark:text-slate-300 leading-relaxed border-t border-slate-100 dark:border-slate-800 pt-3 bg-slate-50/50 dark:bg-slate-800/40">
                      {item.a}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 9. CLEAN MINIMALIST FOOTER */}
      {/* ========================================================================= */}
      <footer className="bg-white dark:bg-slate-950 border-t border-sky-100 dark:border-slate-800 py-10 text-xs text-slate-500">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pb-6 border-b border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-sky-500 text-white flex items-center justify-center font-bold">
                <Building2 className="w-4 h-4" />
              </div>
              <div>
                <p className="font-bold text-slate-900 dark:text-white text-sm">OSIS SMKN 1 Cerdas Bangsa</p>
                <p className="text-[11px] text-slate-400">Portal Informasi & Aspirasi Publik</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={() => setActivePage('dashboard')}
                className="px-3 py-1.5 rounded-xl bg-sky-50 dark:bg-slate-800 text-sky-700 dark:text-sky-300 font-semibold border border-sky-200/80 dark:border-slate-700 cursor-pointer hover:bg-sky-100 transition-colors"
              >
                Panel Dashboard Pengurus ➔
              </button>
            </div>
          </div>

          <div className="pt-4 flex flex-col sm:flex-row items-center justify-between gap-2 text-[11px] text-slate-400">
            <p>© {new Date().getFullYear()} OSIS SMKN 1 Cerdas Bangsa. Minimalist Edition.</p>
            <p>Email: {orgProfile.email} • Instagram: {orgProfile.instagram}</p>
          </div>
        </div>
      </footer>

      {/* ========================================================================= */}
      {/* MODAL: TIKET PENDAFTARAN EVENT */}
      {/* ========================================================================= */}
      {eventRegModalOpen && selectedEventForReg && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-sm w-full p-5 border border-sky-100 dark:border-slate-800 shadow-xl relative animate-in zoom-in-95">
            <button
              onClick={() => {
                setEventRegModalOpen(false);
                setIssuedTicket(null);
              }}
              className="absolute top-3.5 right-3.5 p-1 text-slate-400 hover:text-slate-600 rounded-lg cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>

            {!issuedTicket ? (
              <>
                <div className="mb-3">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-sky-600">
                    Tiket Kegiatan
                  </span>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white mt-0.5">
                    {selectedEventForReg.title}
                  </h3>
                </div>

                <form onSubmit={handleEventRegSubmit} className="space-y-2.5 text-xs">
                  <div>
                    <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">
                      Nama Lengkap
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Nama lengkap..."
                      value={eventRegForm.studentName}
                      onChange={(e) => setEventRegForm({ ...eventRegForm, studentName: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 outline-none focus:border-sky-500"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">
                        NISN
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="NISN..."
                        value={eventRegForm.nisn}
                        onChange={(e) => setEventRegForm({ ...eventRegForm, nisn: e.target.value })}
                        className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 outline-none focus:border-sky-500"
                      />
                    </div>
                    <div>
                      <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">
                        Kelas
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="Contoh: XI RPL 1"
                        value={eventRegForm.classRoom}
                        onChange={(e) => setEventRegForm({ ...eventRegForm, classRoom: e.target.value })}
                        className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 outline-none focus:border-sky-500"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="w-full mt-2 py-2 rounded-xl bg-sky-500 hover:bg-sky-600 text-white font-semibold text-xs shadow-xs cursor-pointer transition-colors"
                  >
                    Dapatkan Tiket
                  </button>
                </form>
              </>
            ) : (
              <div className="text-center py-2">
                <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto mb-1.5" />
                <h4 className="text-sm font-bold text-slate-900 dark:text-white">Tiket Berhasil Diterbitkan</h4>
                <p className="text-[11px] text-slate-500 mb-3">Tunjukkan QR code ini pada panitia saat acara.</p>

                <div className="p-3 rounded-xl bg-sky-50/60 dark:bg-slate-800/60 border border-sky-100 dark:border-slate-700 text-left">
                  <div className="flex items-center justify-between border-b border-sky-100 dark:border-slate-700 pb-1.5 mb-2">
                    <span className="text-[10px] font-bold text-sky-700 dark:text-sky-300">KODE TIKET</span>
                    <span className="text-xs font-mono font-bold text-slate-800 dark:text-white">{issuedTicket.ticketCode}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    {ticketQrDataUrl && (
                      <img src={ticketQrDataUrl} alt="QR Code" className="w-16 h-16 rounded bg-white p-1" />
                    )}
                    <div className="text-[11px] space-y-0.5">
                      <p className="font-bold text-slate-900 dark:text-white">{issuedTicket.studentName}</p>
                      <p className="text-slate-500">Kelas: {issuedTicket.classRoom}</p>
                      <p className="text-slate-500">{issuedTicket.eventTitle}</p>
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => {
                    setEventRegModalOpen(false);
                    setIssuedTicket(null);
                  }}
                  className="w-full mt-3 py-2 rounded-xl bg-sky-500 text-white font-semibold text-xs cursor-pointer"
                >
                  Selesai
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

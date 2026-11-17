import React, { useMemo, useState } from 'react';
import { useApp } from '../../context/AppContext';
import { portalData } from '../../data/portalData';
import { EventRegistration } from '../../types';
import { Modal } from '../../components/common/Modal';
import { CheckCircle2, Printer, Ticket } from 'lucide-react';

// Komponen Redesign Halaman Publik Baru
import { PublicNavbar } from '../../components/public/PublicNavbar';
import { HeroSection } from '../../components/public/HeroSection';
import { VisionMissionSection } from '../../components/public/VisionMissionSection';
import { AboutSection } from '../../components/public/AboutSection';
import { EventsSection } from '../../components/public/EventsSection';
import { GallerySection } from '../../components/public/GallerySection';
import { BoardSection, BoardMember } from '../../components/public/BoardSection';
import { TestimonialsSection, TestimonialItem } from '../../components/public/TestimonialsSection';
import { CtaSection } from '../../components/public/CtaSection';
import { PublicFooter } from '../../components/public/PublicFooter';
import { PublicEventCardData } from '../../components/public/PublicEventCard';

export const PublicPortalPage: React.FC = () => {
  const {
    setActivePage,
    members,
    events,
    announcements,
    galleryPhotos,
    showToast,
    orgProfile,
    registerForEvent,
  } = useApp();

  // Dialog State untuk Registrasi & Detail Kegiatan
  const [selectedEventForRegister, setSelectedEventForRegister] = useState<PublicEventCardData | null>(null);
  const [selectedEventForDetail, setSelectedEventForDetail] = useState<PublicEventCardData | null>(null);
  const [issuedTicket, setIssuedTicket] = useState<EventRegistration | null>(null);

  // Form input pendaftaran
  const [regForm, setRegForm] = useState({
    studentName: '',
    nisn: '',
    classRoom: '',
    phone: '',
  });
  const [regError, setRegError] = useState<string | null>(null);

  // 1. Data Organisasi Terpadu — merge admin-editable orgProfile fields over static portalData
  const organizationData = useMemo(() => {
    const ketuaMember = members.find((m) => m.role === 'ketua');
    const ketuaClass = ketuaMember?.classRoom
      ? ` (${ketuaMember.grade ? `${ketuaMember.grade} ` : ''}${ketuaMember.classRoom})`
      : '';
    const ketuaName = ketuaMember ? `${ketuaMember.fullName}${ketuaClass}` : (orgProfile.ketuaName || 'Zevin');
    // Prioritas: foto dari data keanggotaan (avatarUrl) → foto yang di-upload di pengaturan → fallback
    const ketuaPhoto = ketuaMember?.avatarUrl || orgProfile.ketuaPhotoUrl || '/ketua-osis.png';

    return {
      ...portalData.organization,
      // Override with admin-editable fields from orgProfile (stored in localStorage)
      appName: orgProfile.appName || 'SIMO',
      shortName: orgProfile.appName || 'SIMO',
      schoolName: orgProfile.schoolName || portalData.organization.schoolName,
      name: orgProfile.name || portalData.organization.name,
      academicYear: orgProfile.academicYear || portalData.organization.academicYear,
      logoUrl: orgProfile.logoUrl || portalData.organization.logoUrl,
      vision: orgProfile.vision || portalData.organization.vision,
      missions: orgProfile.mission?.length
        ? orgProfile.mission
        : portalData.organization.missions,
      visionPhotoUrl:
        orgProfile.visionPhotoUrl ||
        portalData.organization.visionPhotoUrl ||
        undefined,
      heroPhotoUrl:
        orgProfile.heroPhotoUrl ||
        portalData.organization.heroPhotoUrl ||
        undefined,
      ketuaName,
      ketuaPhotoUrl: ketuaPhoto,
      ketuaPeriod: orgProfile.ketuaPeriod || 'KETUA OSIS PERIODE 2025/2026',
      ketuaWelcomeTitle: orgProfile.ketuaWelcomeTitle,
      ketuaSpeech: orgProfile.ketuaSpeech,
      isRegistrationOpen:
        orgProfile.isRegistrationOpen !== undefined
          ? orgProfile.isRegistrationOpen
          : true,
      registrationGFormUrl:
        orgProfile.registrationGFormUrl ||
        'https://forms.gle/zG5aSLW3MzWud3uz7',
      registrationOpenDate:
        orgProfile.registrationOpenDate || '01 November 2026',
      registrationCloseDate:
        orgProfile.registrationCloseDate || '20 November 2026',
      registrationNotice:
        orgProfile.registrationNotice ||
        'Pendaftaran akan dibuka kembali pada periode berikutnya.',
    };
  }, [orgProfile, members]);

  // 2. Statistik Agregat untuk Hero Card (Tanpa data pribadi / transaksi)
  const activeMembersCount = useMemo(() => {
    const active = members.filter((m) => m.status === 'aktif' || m.isActive).length;
    return active > 0 ? active : portalData.stats.totalAnggota || 120;
  }, [members]);

  const prokerAttendanceRate = useMemo(() => {
    return portalData.stats.realisasiAnggaranPersen || 85;
  }, []);

  // 3. Sinkronisasi Data Pengurus untuk BoardSection
  const boardMembers: BoardMember[] = useMemo(() => {
    return portalData.structureMembers.map((sm) => {
      const adminMatch = members.find((m) => {
        if (m.nisn && sm.nisn && m.nisn.trim() === sm.nisn.trim()) return true;
        if (m.fullName.toLowerCase().trim() === sm.fullName.toLowerCase().trim()) return true;
        if (m.role === 'ketua' && sm.role.toLowerCase().includes('ketua umum')) return true;
        if (m.role === 'sekretaris' && sm.role.toLowerCase().includes('sekretaris umum')) return true;
        if (m.role === 'bendahara' && sm.role.toLowerCase().includes('bendahara umum')) return true;
        return false;
      });

      return {
        id: sm.id,
        name: adminMatch?.fullName || sm.fullName,
        role: sm.role,
        photoUrl: adminMatch?.avatarUrl || sm.photoUrl,
        division: sm.divisionCode,
      };
    });
  }, [members]);

  // 3b. Sinkronisasi Testimoni Nyata dari Anggota Aktif OSIS (KATA ANGGOTA)
  const memberTestimonials: TestimonialItem[] = useMemo(() => {
    const quotesByRole: Record<string, string> = {
      ketua:
        'Melalui SIMO, seluruh alur kerja kepengurusan OSIS mulai dari perencanaan proker, absensi presensi wajah, hingga keterbukaan anggaran dapat diakses secara transparan dan akuntabel oleh seluruh warga sekolah.',
      sekretaris:
        'Sistem pengarsipan surat digital dan notulensi rapat di SIMO membuat tata kelola administrasi organisasi jauh lebih tertib, cepat, dan tidak ada lagi dokumen penting yang tercecer.',
      bendahara:
        'Transparansi arus kas dan iuran anggota yang tercatat otomatis memudahkan pertanggungjawaban dana kegiatan. Semua pengurus dan siswa bisa meninjau realisasi anggaran secara terbuka.',
      koordinator_sekbid:
        'Penerapan absensi biometrik scan wajah dan koordinasi divisi berbasis web ini membuktikan bahwa siswa SMK mampu menciptakan inovasi digital yang berdampak nyata.',
      anggota:
        'Sebagai anggota baru, saya merasa sangat dirangkul dan transparan. Jadwal kegiatan dan pembagian peran selalu jelas, memberi ruang yang nyaman untuk belajar kepemimpinan.',
    };

    const activeList = members.filter((m) => m.status === 'aktif' || m.isActive !== false);

    return activeList.map((m, idx) => {
      const defaultQuote =
        quotesByRole[m.role] ||
        'Pengalaman berorganisasi di OSIS menjadi wadah luar biasa untuk mengasah keterampilan kerja sama tim, tanggung jawab, dan kedewasaan berorganisasi.';

      const roleOrClass = m.position
        ? `${m.position}${m.classRoom ? ` • ${m.classRoom}` : ''}`
        : `${m.grade || ''} ${m.classRoom || ''} • ${m.divisionName || 'OSIS'}`.trim();

      return {
        id: `t-${m.id || idx}`,
        name: m.fullName,
        roleOrClass: roleOrClass || 'Anggota OSIS',
        avatarUrl: m.avatarUrl,
        content: defaultQuote,
      };
    });
  }, [members]);

  // 4. Sinkronisasi Kegiatan Publik
  const checkRegistrationRequired = (title: string, desc?: string, cat?: string) => {
    const text = `${title} ${desc || ''} ${cat || ''}`.toLowerCase();
    return (
      text.includes('ldks') ||
      text.includes('workshop') ||
      text.includes('pelatihan') ||
      text.includes('lomba') ||
      text.includes('seleksi') ||
      text.includes('seminar') ||
      text.includes('pendaftaran') ||
      text.includes('registrasi') ||
      text.includes('oprec') ||
      text.includes('diklat')
    );
  };

  const publicEvents: PublicEventCardData[] = useMemo(() => {
    if (events && events.length > 0) {
      const upcoming = events.filter((e) => e.status === 'mendatang');
      if (upcoming.length > 0) {
        return upcoming.map((e) => ({
          id: e.id,
          title: e.title,
          date: e.eventDate,
          time: e.startTime ? `${e.startTime} WIB` : undefined,
          location: e.location,
          category: e.workProgramTitle || 'Kegiatan Publik',
          photoUrl:
            e.documentationPhotos && e.documentationPhotos.length > 0
              ? e.documentationPhotos[0]
              : undefined,
          description: e.description,
          requiresRegistration: checkRegistrationRequired(e.title, e.description, e.workProgramTitle),
        }));
      }
    }

    return portalData.timelineEvents.map((te) => ({
      id: te.id,
      title: te.title,
      date: te.date,
      time: te.time,
      location: te.location,
      category: te.category,
      photoUrl: undefined,
      description: te.description,
      requiresRegistration: checkRegistrationRequired(te.title, te.description, te.category),
    }));
  }, [events]);

  // Handler interaksi tombol (Secret 5x gesture to Login Page)
  const handleAdminLogin = () => {
    setActivePage('login');
  };

  const handleRegisterEvent = (eventId: string) => {
    const targetEvent = publicEvents.find((e) => e.id === eventId);
    if (!targetEvent) return;
    setSelectedEventForRegister(targetEvent);
    setIssuedTicket(null);
    setRegError(null);
    setRegForm({
      studentName: '',
      nisn: '',
      classRoom: '',
      phone: '',
    });
  };

  const handleDetailEvent = (eventId: string) => {
    const targetEvent = publicEvents.find((e) => e.id === eventId);
    if (!targetEvent) return;
    setSelectedEventForDetail(targetEvent);
  };

  const handleSubmitRegistration = (e: React.FormEvent) => {
    e.preventDefault();
    setRegError(null);
    if (!selectedEventForRegister) return;

    if (!regForm.studentName.trim()) {
      setRegError('Nama lengkap siswa wajib diisi.');
      return;
    }
    if (!regForm.nisn.trim()) {
      setRegError('NISN wajib diisi.');
      return;
    }
    if (!regForm.classRoom.trim()) {
      setRegError('Kelas & Jurusan wajib diisi.');
      return;
    }
    if (!regForm.phone.trim()) {
      setRegError('Nomor WhatsApp / HP wajib diisi.');
      return;
    }

    try {
      const ticket = registerForEvent({
        eventId: selectedEventForRegister.id,
        eventTitle: selectedEventForRegister.title,
        studentName: regForm.studentName.trim(),
        nisn: regForm.nisn.trim(),
        classRoom: regForm.classRoom.trim(),
        phone: regForm.phone.trim(),
      });
      setIssuedTicket(ticket);
    } catch (err) {
      console.error(err);
      setRegError('Gagal memproses pendaftaran. Silakan coba kembali.');
    }
  };

  return (
    <div className="min-h-screen bg-[#FAF6EE] text-[#1F3A5F] flex flex-col font-sans antialiased selection:bg-[#FBEBC8] selection:text-[#7A4B00]">
      {/* 1. Navbar Sticky */}
      <PublicNavbar
        organization={organizationData}
        onAdminLogin={handleAdminLogin}
      />

      {/* Konten Utama 11 Section */}
      <main className="flex-1">
        {/* 2. Hero Section (Latar: Putih) */}
        <HeroSection
          organization={organizationData}
          activeMembersCount={activeMembersCount}
          attendanceRatePercent={prokerAttendanceRate}
          onJoinClick={() => {
            const kontak = document.getElementById('kontak');
            if (kontak) {
              const navOffset = 80;
              const elPos = kontak.getBoundingClientRect().top;
              const offset = elPos + window.pageYOffset - navOffset;
              window.scrollTo({ top: offset, behavior: 'smooth' });
            }
          }}
          onExploreEventsClick={() => {
            const kegiatan = document.getElementById('kegiatan');
            if (kegiatan) {
              const navOffset = 80;
              const elPos = kegiatan.getBoundingClientRect().top;
              const offset = elPos + window.pageYOffset - navOffset;
              window.scrollTo({ top: offset, behavior: 'smooth' });
            }
          }}
        />

        {/* 3. Visi & Misi Organisasi (Latar: Putih) */}
        <VisionMissionSection organization={organizationData} />

        {/* 4. Sambutan Ketua OSIS (Latar: Putih) */}
        <AboutSection organization={organizationData} />

        {/* 5. Pengurus / Struktur Organisasi (Latar: Abu Muda #F8FAFC) */}
        <BoardSection members={boardMembers} />

        {/* 6. Kegiatan Mendatang (Latar: Biru Muda #EFF6FF) */}
        <EventsSection
          events={publicEvents}
          onRegisterEvent={handleRegisterEvent}
          onDetailEvent={handleDetailEvent}
        />

        {/* 7. Galeri / Dokumentasi Kegiatan Lalu (Latar: Putih) */}
        <GallerySection photos={galleryPhotos} />

        {/* 8. Kontak & Kotak Ide Terpadu (Latar: Biru Muda #EFF6FF) */}
        <CtaSection organization={organizationData} />

        {/* 11. Kata Anggota / Testimoni: Cerita Nyata dari Kami (Latar: Putih) */}
        <TestimonialsSection testimonials={memberTestimonials} />
      </main>

      {/* 12. Footer (Latar: Biru Gelap #1E3A8A) */}
      <PublicFooter
        organization={organizationData}
        onAdminLogin={handleAdminLogin}
      />

      {/* MODAL 1: Formulir Pendaftaran Kegiatan & E-Tiket Digital */}
      {selectedEventForRegister && (
        <Modal
          isOpen={Boolean(selectedEventForRegister)}
          onClose={() => {
            setSelectedEventForRegister(null);
            setIssuedTicket(null);
          }}
          title={issuedTicket ? 'E-Tiket Resmi Diterbitkan' : 'Pendaftaran Kegiatan Siswa'}
          subtitle={
            issuedTicket
              ? 'Tunjukkan tiket ini ke panitia di lokasi kegiatan'
              : selectedEventForRegister.title
          }
          maxWidth="lg"
        >
          {issuedTicket ? (
            <div className="space-y-5 py-2">
              {/* Alert Sukses */}
              <div className="p-4 rounded-[16px] bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900/50 flex items-center gap-3">
                <CheckCircle2 className="w-6 h-6 text-emerald-600 dark:text-emerald-400 shrink-0" />
                <div>
                  <h4 className="font-extrabold text-[15px] text-emerald-900 dark:text-emerald-200">
                    Pendaftaran Berhasil!
                  </h4>
                  <p className="text-[13px] text-emerald-700 dark:text-emerald-300">
                    Data Anda telah terdaftar dan tiket resmi telah berhasil diterbitkan.
                  </p>
                </div>
              </div>

              {/* Kartu E-Tiket Digital */}
              <div className="p-6 rounded-[20px] bg-[#FAF6EE] dark:bg-[#0E1B2C] border-2 border-dashed border-[#F2B544] relative space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-[#E6DFD0] dark:border-[#283D56]">
                  <div>
                    <span className="text-[11px] font-bold text-[#F2B544] uppercase tracking-wider block">
                      {organizationData.appName || 'SIMO'} OFFICIAL PASS
                    </span>
                    <h5 className="font-extrabold text-[15px] text-[#1F3A5F] dark:text-[#FAF6EE]">
                      {issuedTicket.eventTitle}
                    </h5>
                  </div>
                  <div className="px-3.5 py-1.5 rounded-[10px] bg-[#1F3A5F] text-[#F2B544] font-mono font-black text-sm tracking-wider">
                    {issuedTicket.ticketCode}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 text-[13px]">
                  <div>
                    <span className="text-[#5A6472] dark:text-[#9AA8B8] block text-[11px]">Nama Peserta</span>
                    <span className="font-bold text-[#1F3A5F] dark:text-[#FAF6EE]">{issuedTicket.studentName}</span>
                  </div>
                  <div>
                    <span className="text-[#5A6472] dark:text-[#9AA8B8] block text-[11px]">Kelas &amp; NISN</span>
                    <span className="font-bold text-[#1F3A5F] dark:text-[#FAF6EE]">
                      {issuedTicket.classRoom} • {issuedTicket.nisn}
                    </span>
                  </div>
                  <div>
                    <span className="text-[#5A6472] dark:text-[#9AA8B8] block text-[11px]">Waktu &amp; Tanggal</span>
                    <span className="font-medium text-[#1F3A5F] dark:text-[#FAF6EE]">
                      {selectedEventForRegister.date} {selectedEventForRegister.time ? `• ${selectedEventForRegister.time}` : ''}
                    </span>
                  </div>
                  <div>
                    <span className="text-[#5A6472] dark:text-[#9AA8B8] block text-[11px]">Lokasi Acara</span>
                    <span className="font-medium text-[#1F3A5F] dark:text-[#FAF6EE] truncate block">
                      {selectedEventForRegister.location}
                    </span>
                  </div>
                </div>

                <div className="pt-3 border-t border-[#E6DFD0] dark:border-[#283D56] flex items-center justify-between text-[11px] text-[#5A6472] dark:text-[#9AA8B8]">
                  <span>Terdaftar: {issuedTicket.registeredAt}</span>
                  <span className="font-bold text-emerald-600 dark:text-emerald-400">STATUS: TERKONFIRMASI</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="simo-btn-outline px-4 py-2 text-[13px] font-bold rounded-[10px] flex items-center gap-2 cursor-pointer"
                >
                  <Printer className="w-4 h-4" />
                  <span>Cetak Tiket</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setSelectedEventForRegister(null);
                    setIssuedTicket(null);
                  }}
                  className="px-5 py-2 rounded-[10px] bg-[#1F3A5F] text-[#FAF6EE] text-[13px] font-bold hover:bg-[#162B46] transition-colors cursor-pointer"
                >
                  Selesai
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmitRegistration} className="space-y-4 py-2">
              {/* Event Quick Info Banner */}
              <div className="p-4 rounded-[14px] bg-white border border-slate-200 space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-[#F2B544] bg-[#1F3A5F] px-2.5 py-0.5 rounded-[6px]">
                    {selectedEventForRegister.category || 'Kegiatan OSIS'}
                  </span>
                  <span className="text-[12px] font-bold text-[#1F3A5F]">
                    {selectedEventForRegister.date}
                  </span>
                </div>
                <h4 className="font-extrabold text-[15px] text-[#1F3A5F] leading-snug">
                  {selectedEventForRegister.title}
                </h4>
                <div className="flex items-center gap-3 text-[12px] text-[#5A6472] pt-0.5">
                  {selectedEventForRegister.time && <span>🕒 {selectedEventForRegister.time}</span>}
                  <span>📍 {selectedEventForRegister.location}</span>
                </div>
              </div>

              {regError && (
                <div className="p-3 rounded-[10px] bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/50 text-red-700 dark:text-red-300 text-[13px] font-semibold">
                  {regError}
                </div>
              )}

              {/* Inputs */}
              <div className="space-y-3">
                <div>
                  <label className="block text-[13px] font-bold text-[#1F3A5F] mb-1">
                    Nama Lengkap Siswa <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={regForm.studentName}
                    onChange={(e) => setRegForm({ ...regForm, studentName: e.target.value })}
                    placeholder="Contoh: Muhammad Rizky Pratama"
                    className="w-full px-3.5 py-2.5 rounded-[12px] bg-white border border-slate-200 text-[#1F3A5F] text-[14px] font-semibold focus:outline-none focus:border-[#1F3A5F]"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[13px] font-bold text-[#1F3A5F] mb-1">
                      NISN <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={regForm.nisn}
                      onChange={(e) => setRegForm({ ...regForm, nisn: e.target.value })}
                      placeholder="Contoh: 0081234567"
                      className="w-full px-3.5 py-2.5 rounded-[12px] bg-white border border-slate-200 text-[#1F3A5F] text-[14px] font-semibold focus:outline-none focus:border-[#1F3A5F]"
                    />
                  </div>

                  <div>
                    <label className="block text-[13px] font-bold text-[#1F3A5F] mb-1">
                      Kelas &amp; Jurusan <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={regForm.classRoom}
                      onChange={(e) => setRegForm({ ...regForm, classRoom: e.target.value })}
                      placeholder="Contoh: X PPLG 1"
                      className="w-full px-3.5 py-2.5 rounded-[12px] bg-white border border-slate-200 text-[#1F3A5F] text-[14px] font-semibold focus:outline-none focus:border-[#1F3A5F]"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[13px] font-bold text-[#1F3A5F] mb-1">
                    Nomor WhatsApp / HP <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="tel"
                    required
                    value={regForm.phone}
                    onChange={(e) => setRegForm({ ...regForm, phone: e.target.value })}
                    placeholder="Contoh: 081234567890"
                    className="w-full px-3.5 py-2.5 rounded-[12px] bg-white border border-slate-200 text-[#1F3A5F] text-[14px] font-semibold focus:outline-none focus:border-[#1F3A5F]"
                  />
                </div>
              </div>

              {/* Submit Buttons */}
              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-[#E6DFD0] dark:border-[#283D56]">
                <button
                  type="button"
                  onClick={() => setSelectedEventForRegister(null)}
                  className="px-4 py-2 text-[13px] font-bold text-[#5A6472] dark:text-[#9AA8B8] hover:text-[#1F3A5F] dark:hover:text-[#FAF6EE] cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-[12px] bg-[#1F3A5F] hover:bg-[#162B46] text-[#FAF6EE] text-[13px] font-bold flex items-center gap-2 cursor-pointer transition-colors shadow-none"
                >
                  <Ticket className="w-4 h-4 text-[#F2B544]" />
                  <span>Daftar &amp; Dapatkan Tiket</span>
                </button>
              </div>
            </form>
          )}
        </Modal>
      )}

      {/* MODAL 2: Detail Kegiatan Terbuka untuk Umum */}
      {selectedEventForDetail && (
        <Modal
          isOpen={Boolean(selectedEventForDetail)}
          onClose={() => setSelectedEventForDetail(null)}
          title="Informasi Kegiatan Publik"
          subtitle={selectedEventForDetail.category || 'Agenda Terbuka OSIS'}
          maxWidth="md"
        >
          <div className="space-y-4 py-2">
            {selectedEventForDetail.photoUrl && (
              <img
                src={selectedEventForDetail.photoUrl}
                alt={selectedEventForDetail.title}
                className="w-full h-48 rounded-[14px] object-cover border border-[#E6DFD0] dark:border-[#283D56]"
              />
            )}

            <div>
              <h4 className="text-lg font-extrabold text-[#1F3A5F] dark:text-[#FAF6EE] leading-snug">
                {selectedEventForDetail.title}
              </h4>
              <div className="flex flex-wrap items-center gap-3 text-[13px] text-[#5A6472] dark:text-[#9AA8B8] mt-2">
                <span className="font-bold text-[#1F3A5F] dark:text-[#FAF6EE]">📅 {selectedEventForDetail.date}</span>
                {selectedEventForDetail.time && <span>🕒 {selectedEventForDetail.time}</span>}
                <span>📍 {selectedEventForDetail.location}</span>
              </div>
            </div>

            {selectedEventForDetail.description && (
              <p className="text-[14px] text-[#5A6472] dark:text-[#9AA8B8] leading-relaxed pt-1">
                {selectedEventForDetail.description}
              </p>
            )}

            {/* Banner Terbuka untuk Umum */}
            <div className="p-4 rounded-[14px] bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900/50 flex items-start gap-3 text-emerald-800 dark:text-emerald-300 text-[13px]">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
              <div>
                <p className="font-bold">Terbuka Bebas untuk Umum</p>
                <p className="text-emerald-700 dark:text-emerald-300/90 mt-0.5 leading-relaxed">
                  Kegiatan ini tidak memerlukan pendaftaran atau tiket khusus. Seluruh siswa, guru, dan warga sekolah dapat langsung hadir meramaikan acara di lokasi sesuai jadwal!
                </p>
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="button"
                onClick={() => setSelectedEventForDetail(null)}
                className="px-5 py-2 rounded-[10px] bg-[#1F3A5F] text-[#FAF6EE] text-[13px] font-bold hover:bg-[#162B46] cursor-pointer"
              >
                Tutup
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};

export default PublicPortalPage;

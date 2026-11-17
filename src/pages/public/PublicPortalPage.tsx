import React, { useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { portalData } from '../../data/portalData';

// Komponen Redesign Halaman Publik Baru
import { PublicNavbar } from '../../components/public/PublicNavbar';
import { HeroSection } from '../../components/public/HeroSection';
import { VisionMissionSection } from '../../components/public/VisionMissionSection';
import { AboutSection } from '../../components/public/AboutSection';
import { EventsSection } from '../../components/public/EventsSection';
import { GallerySection } from '../../components/public/GallerySection';
import { BoardSection, BoardMember } from '../../components/public/BoardSection';
import { AnnouncementsSection, AnnouncementItem } from '../../components/public/AnnouncementsSection';
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
  } = useApp();

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
    }));
  }, [events]);

  // 5. Sinkronisasi Pengumuman Publik
  const publicAnnouncements: AnnouncementItem[] | undefined = useMemo(() => {
    if (announcements && announcements.length > 0) {
      return announcements
        .filter(
          (a) =>
            a.targetRole === 'semua' ||
            a.targetRole === 'anggota' ||
            a.targetRole === 'publik'
        )
        .map((a) => ({
          id: a.id,
          title: a.title,
          content: a.content,
          date: a.date,
          category: a.priority === 'penting' ? 'Pemberitahuan Utama' : 'Pengumuman',
          author: a.author,
        }));
    }
    return undefined; // Akan memakai DEFAULT_ANNOUNCEMENTS di dalam komponen
  }, [announcements]);

  // Handler interaksi tombol (Secret 5x gesture to Login Page)
  const handleAdminLogin = () => {
    setActivePage('login');
  };

  const handleRegisterEvent = (eventId: string) => {
    const targetEvent = publicEvents.find((e) => e.id === eventId);
    showToast(
      `Pendaftaran untuk "${targetEvent?.title || 'kegiatan'}" dibuka. Silakan hubungi pengurus atau panitia kegiatan!`,
      'info'
    );
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
        />

        {/* 7. Galeri / Dokumentasi Kegiatan Lalu (Latar: Putih) */}
        <GallerySection photos={galleryPhotos} />

        {/* 9. Pengumuman Publik (Latar: Putih) */}
        <AnnouncementsSection announcements={publicAnnouncements} />

        {/* 10. Kontak & Kotak Ide Terpadu (Latar: Biru Muda #EFF6FF) */}
        <CtaSection organization={organizationData} />

        {/* 11. Kata Anggota / Testimoni: Cerita Nyata dari Kami (Latar: Putih) */}
        <TestimonialsSection testimonials={memberTestimonials} />
      </main>

      {/* 12. Footer (Latar: Biru Gelap #1E3A8A) */}
      <PublicFooter
        organization={organizationData}
        onAdminLogin={handleAdminLogin}
      />
    </div>
  );
};

export default PublicPortalPage;

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
import { TestimonialsSection } from '../../components/public/TestimonialsSection';
import { CtaSection } from '../../components/public/CtaSection';
import { PublicFooter } from '../../components/public/PublicFooter';
import { PublicEventCardData } from '../../components/public/PublicEventCard';

export const PublicPortalPage: React.FC = () => {
  const {
    setActivePage,
    members,
    events,
    announcements,
    showToast,
    orgProfile,
  } = useApp();

  // 1. Data Organisasi Terpadu — merge admin-editable orgProfile fields over static portalData
  const organizationData = useMemo(() => ({
    ...portalData.organization,
    // Override with admin-editable fields from orgProfile (stored in localStorage)
    vision: orgProfile.vision || portalData.organization.vision,
    missions: orgProfile.mission?.length
      ? orgProfile.mission
      : portalData.organization.missions,
    visionPhotoUrl:
      orgProfile.visionPhotoUrl ||
      portalData.organization.visionPhotoUrl ||
      undefined,
    schoolName: orgProfile.schoolName || portalData.organization.schoolName,
    name: orgProfile.name || portalData.organization.name,
    academicYear: orgProfile.academicYear || portalData.organization.academicYear,
    logoUrl: orgProfile.logoUrl || portalData.organization.logoUrl,
    isRegistrationOpen:
      orgProfile.isRegistrationOpen !== undefined
        ? orgProfile.isRegistrationOpen
        : true,
    registrationGFormUrl:
      orgProfile.registrationGFormUrl ||
      'https://forms.gle/contohFormPendaftaranOSIS',
    registrationOpenDate:
      orgProfile.registrationOpenDate || '01 November 2026',
    registrationCloseDate:
      orgProfile.registrationCloseDate || '20 November 2026',
    registrationNotice:
      orgProfile.registrationNotice ||
      'Pendaftaran akan dibuka kembali pada periode berikutnya.',
  }), [orgProfile]);

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

  // Handler interaksi tombol
  const handleAdminLogin = () => {
    setActivePage('dashboard');
  };

  const handleRegisterEvent = (eventId: string) => {
    const targetEvent = publicEvents.find((e) => e.id === eventId);
    showToast(
      `Pendaftaran untuk "${targetEvent?.title || 'kegiatan'}" dibuka. Silakan hubungi pengurus atau panitia kegiatan!`,
      'info'
    );
  };

  return (
    <div className="min-h-screen bg-white text-[#0F172A] flex flex-col font-sans antialiased selection:bg-[#DBEAFE] selection:text-[#1E3A8A]">
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
            const cta = document.getElementById('cta');
            if (cta) cta.scrollIntoView({ behavior: 'smooth' });
          }}
          onExploreEventsClick={() => {
            const kegiatan = document.getElementById('kegiatan');
            if (kegiatan) kegiatan.scrollIntoView({ behavior: 'smooth' });
          }}
        />

        {/* 3. Visi & Misi Organisasi (Latar: Putih) */}
        <VisionMissionSection organization={organizationData} />

        {/* 4. Sambutan Ketua OSIS (Latar: Putih) */}
        <AboutSection organization={organizationData} />

        {/* 6. Kegiatan Mendatang (Latar: Biru Muda #EFF6FF) */}
        <EventsSection
          events={publicEvents}
          onRegisterEvent={handleRegisterEvent}
        />

        {/* 7. Galeri / Dokumentasi Kegiatan Lalu (Latar: Putih) */}
        <GallerySection />

        {/* 8. Pengurus (Latar: Abu Muda #F8FAFC) */}
        <BoardSection members={boardMembers} />

        {/* 9. Pengumuman Publik (Latar: Putih) */}
        <AnnouncementsSection announcements={publicAnnouncements} />

        {/* 10. Kata Anggota / Testimoni (Latar: Putih) */}
        <TestimonialsSection />

        {/* 11. Kontak & Kotak Ide Terpadu (Latar: Biru Muda #EFF6FF) */}
        <CtaSection organization={organizationData} />
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

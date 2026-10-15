import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { portalData } from '../../data/portalData';
import { PortalNavbar } from '../../components/portal/PortalNavbar';
import { PortalHero } from '../../components/portal/PortalHero';
import { PortalStats } from '../../components/portal/PortalStats';
import { PortalProkerDashboard } from '../../components/portal/PortalProkerDashboard';
import { PortalTimeline } from '../../components/portal/PortalTimeline';
import { PortalGallery } from '../../components/portal/PortalGallery';
import { PortalStructure } from '../../components/portal/PortalStructure';
import { PortalAboutAndAspirasi } from '../../components/portal/PortalAboutAndAspirasi';
import { PortalFooter } from '../../components/portal/PortalFooter';

export const PublicPortalPage: React.FC = () => {
  const {
    theme,
    toggleTheme,
    setActivePage,
    aspirations,
    addAspiration,
    likeAspiration,
    members,
  } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDivision, setSelectedDivision] = useState('ALL');

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      const navOffset = 90;
      const elementPosition = element.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - navOffset;
      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth',
      });
    }
  };

  const handleHeroSearch = (query: string) => {
    setSearchQuery(query);
    scrollToSection('proker');
  };

  const handleHeroDivision = (divCode: string) => {
    setSelectedDivision(divCode);
    scrollToSection('proker');
  };

  // Sinkronisasi foto anggota struktur organisasi dengan data dashboard admin
  const synchronizedMembers = useMemo(() => {
    return portalData.structureMembers.map((sm) => {
      const adminMatch = members.find((m) => {
        if (m.nisn && sm.nisn && m.nisn.trim() === sm.nisn.trim()) return true;
        if (m.fullName.toLowerCase().trim() === sm.fullName.toLowerCase().trim()) return true;
        if (m.role === 'ketua' && sm.role.toLowerCase().includes('ketua umum')) return true;
        if (m.role === 'sekretaris' && sm.role.toLowerCase().includes('sekretaris umum')) return true;
        if (m.role === 'bendahara' && sm.role.toLowerCase().includes('bendahara umum')) return true;
        return false;
      });

      if (adminMatch && adminMatch.avatarUrl) {
        return {
          ...sm,
          fullName: adminMatch.fullName || sm.fullName,
          photoUrl: adminMatch.avatarUrl,
        };
      }
      return sm;
    });
  }, [members]);

  // Sinkronisasi foto PIC program kerja dengan data dashboard admin
  const synchronizedWorkPrograms = useMemo(() => {
    return portalData.workPrograms.map((p) => {
      const adminMatch = members.find(
        (m) => m.fullName.toLowerCase().trim() === p.picName.toLowerCase().trim()
      );
      if (adminMatch && adminMatch.avatarUrl) {
        return {
          ...p,
          picAvatar: adminMatch.avatarUrl,
        };
      }
      return p;
    });
  }, [members]);

  return (
    <div className="min-h-screen bg-white dark:bg-[#070b09] text-slate-800 dark:text-slate-100 flex flex-col font-sans transition-colors duration-200">
      {/* 1. Floating Capsule Navigation Bar (OSINTRA Style) */}
      <PortalNavbar
        organization={portalData.organization}
        theme={theme}
        onToggleTheme={toggleTheme}
        onAdminLogin={() => setActivePage('dashboard')}
      />

      {/* Main Content Sections */}
      <main className="flex-1">
        {/* 2. Immersive Cinematic Dark Hero Section */}
        <PortalHero
          organization={portalData.organization}
          stats={portalData.stats}
          upcomingEvent={portalData.timelineEvents[0]}
          onExploreProker={() => scrollToSection('proker')}
          onExploreTimeline={() => scrollToSection('linimasa')}
          onExploreGallery={() => scrollToSection('galeri')}
          onExploreAspirasi={() => scrollToSection('tentang')}
          onExploreAbout={() => scrollToSection('tentang')}
          onSearchQuerySubmit={handleHeroSearch}
          onSelectDivision={handleHeroDivision}
        />

        {/* 3. Ringkasan Statistik Floating Cards */}
        <PortalStats stats={portalData.stats} />

        {/* 4. Tentang Kami, Sambutan Ketua OSIS, Nilai Inti & Aspirasi */}
        <PortalAboutAndAspirasi
          organization={portalData.organization}
          aspirations={aspirations}
          onAddAspiration={addAspiration}
          onLikeAspiration={likeAspiration}
          members={members}
        />

        {/* 5. Struktur Organisasi Kepengurusan (Foto Tersinkronisasi dengan Dashboard Admin) */}
        <PortalStructure
          organization={portalData.organization}
          divisions={portalData.divisions}
          members={synchronizedMembers}
        />

        {/* 6. Dashboard Program Kerja (Foto PIC & Filter Tersinkronisasi) */}
        <PortalProkerDashboard
          workPrograms={synchronizedWorkPrograms}
          divisions={portalData.divisions}
          externalSearchQuery={searchQuery}
          externalDivision={selectedDivision}
          onSearchQueryChange={setSearchQuery}
          onDivisionChange={setSelectedDivision}
        />

        {/* 7. Linimasa / Agenda Kegiatan */}
        <PortalTimeline events={portalData.timelineEvents} />

        {/* 8. Galeri Dokumentasi Foto & Lightbox */}
        <PortalGallery photos={portalData.galleryPhotos} />
      </main>

      {/* 9. Footer Lengkap */}
      <PortalFooter
        organization={portalData.organization}
        onAdminLogin={() => setActivePage('dashboard')}
      />
    </div>
  );
};

export default PublicPortalPage;

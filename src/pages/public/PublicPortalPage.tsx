import React from 'react';
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

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      const navOffset = 76;
      const elementPosition = element.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - navOffset;
      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth',
      });
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 flex flex-col font-sans transition-colors duration-200">
      {/* 1. Sticky Navigation Bar */}
      <PortalNavbar
        organization={portalData.organization}
        theme={theme}
        onToggleTheme={toggleTheme}
        onAdminLogin={() => setActivePage('dashboard')}
      />

      {/* Main Content Sections */}
      <main className="flex-1">
        {/* 2. Hero Section */}
        <PortalHero
          organization={portalData.organization}
          stats={portalData.stats}
          onExploreProker={() => scrollToSection('proker')}
          onExploreGallery={() => scrollToSection('galeri')}
        />

        {/* 3. Ringkasan Statistik (Count-Up Cards) */}
        <PortalStats stats={portalData.stats} />

        {/* 4. Dashboard Program Kerja (Filter, Search, Grid/List, Detail Modal) */}
        <PortalProkerDashboard
          workPrograms={portalData.workPrograms}
          divisions={portalData.divisions}
        />

        {/* 5. Linimasa / Agenda Kegiatan */}
        <PortalTimeline events={portalData.timelineEvents} />

        {/* 6. Galeri Dokumentasi Foto & Lightbox */}
        <PortalGallery photos={portalData.galleryPhotos} />

        {/* 7. Struktur Organisasi Kepengurusan */}
        <PortalStructure
          organization={portalData.organization}
          divisions={portalData.divisions}
          members={portalData.structureMembers}
        />

        {/* 8. Visi & Misi, Kotak Aspirasi Terbuka, & Verifikasi KTA */}
        <PortalAboutAndAspirasi
          organization={portalData.organization}
          aspirations={aspirations}
          onAddAspiration={addAspiration}
          onLikeAspiration={likeAspiration}
          members={members}
        />
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

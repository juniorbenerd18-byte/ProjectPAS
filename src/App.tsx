import React, { useState, useEffect } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Sidebar } from './components/layout/Sidebar';
import { Navbar } from './components/layout/Navbar';
import { Toast } from './components/common/Toast';
import { initSmoothScroll } from './lib/smoothScroll';

// ===== Unified Pages (Clean 5-Menu) =====
import { DashboardPage } from './pages/dashboard/DashboardPage';
import { KeanggotaanPage } from './pages/anggota/KeanggotaanPage';
import { KegiatanPresensiPage } from './pages/kegiatan/KegiatanPresensiPage';
import { ArsipDokumenPage } from './pages/surat/ArsipDokumenPage';
import { PengaturanPage } from './pages/pengaturan/PengaturanPage';
import { PublicPortalPage } from './pages/public/PublicPortalPage';
import { AspirasiAdminPage } from './pages/aspirasi/AspirasiAdminPage';
import { LoginPage } from './pages/auth/LoginPage';

// ===== Legacy Pages (backward-compat for old routes) =====
import { ProfilOrganisasi } from './pages/organisasi/ProfilOrganisasi';
import { StrukturOrganisasi } from './pages/organisasi/StrukturOrganisasi';
import { DivisiPage } from './pages/organisasi/DivisiPage';
import { JabatanPage } from './pages/organisasi/JabatanPage';
import { DataAnggota } from './pages/anggota/DataAnggota';
import { AnggotaAktif } from './pages/anggota/AnggotaAktif';
import { AlumniPage } from './pages/anggota/AlumniPage';
import { KartuAnggota } from './pages/anggota/KartuAnggota';
import { DaftarProker } from './pages/proker/DaftarProker';
import { TambahProker } from './pages/proker/TambahProker';
import { ProgressProker } from './pages/proker/ProgressProker';
import { EvaluasiProker } from './pages/proker/EvaluasiProker';
import { KalenderKegiatan } from './pages/kegiatan/KalenderKegiatan';
import { KegiatanMendatang } from './pages/kegiatan/KegiatanMendatang';
import { KegiatanSelesai } from './pages/kegiatan/KegiatanSelesai';
import { DokumentasiKegiatan } from './pages/kegiatan/DokumentasiKegiatan';
import { JadwalRapat } from './pages/rapat/JadwalRapat';
import { AbsensiPage } from './pages/rapat/AbsensiPage';
import { NotulenPage } from './pages/rapat/NotulenPage';
import { SuratMasuk } from './pages/surat/SuratMasuk';
import { SuratKeluar } from './pages/surat/SuratKeluar';
import { ProposalPage } from './pages/surat/ProposalPage';
import { LpjPage } from './pages/surat/LpjPage';
import { PengumumanPage } from './pages/pengumuman/PengumumanPage';
import { LaporanPusatPage } from './pages/laporan/LaporanPusatPage';

const MainLayout: React.FC = () => {
  const { activePage, setActivePage } = useApp();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Inisialisasi smooth inertia momentum scroll (sensasi scroll licin & halus)
  useEffect(() => {
    const cleanup = initSmoothScroll();
    return cleanup;
  }, []);

  const renderCurrentPage = () => {
    switch (activePage) {
      case 'dashboard':
        return <DashboardPage />;

      // ===== Unified 5-Menu Pages =====
      case 'keanggotaan':
        return <KeanggotaanPage />;
      case 'kegiatan-presensi':
        return <KegiatanPresensiPage />;
      case 'dokumen':
        return <ArsipDokumenPage />;
      case 'aspirasi':
        return <AspirasiAdminPage />;
      case 'pengaturan':
        return <PengaturanPage />;

      // ===== Legacy Routes (backward-compat) =====
      // Organisasi
      case 'organisasi-profil':
        return <ProfilOrganisasi />;
      case 'organisasi-struktur':
        return <StrukturOrganisasi />;
      case 'organisasi-divisi':
        return <DivisiPage />;
      case 'organisasi-jabatan':
        return <JabatanPage />;
      // Anggota
      case 'anggota-data':
        return <DataAnggota />;
      case 'anggota-aktif':
        return <AnggotaAktif />;
      case 'anggota-alumni':
        return <AlumniPage />;
      case 'anggota-kartu':
        return <KartuAnggota />;
      // Program Kerja
      case 'proker-daftar':
        return <DaftarProker />;
      case 'proker-tambah':
        return <TambahProker />;
      case 'proker-progress':
        return <ProgressProker />;
      case 'proker-evaluasi':
        return <EvaluasiProker />;
      // Kegiatan
      case 'kegiatan-kalender':
        return <KalenderKegiatan />;
      case 'kegiatan-mendatang':
        return <KegiatanMendatang />;
      case 'kegiatan-selesai':
        return <KegiatanSelesai />;
      case 'kegiatan-dokumentasi':
        return <DokumentasiKegiatan />;
      // Rapat
      case 'rapat-jadwal':
        return <JadwalRapat />;
      case 'rapat-absensi':
        return <AbsensiPage />;
      case 'rapat-notulen':
        return <NotulenPage />;

      // Surat & Dokumen (legacy)
      case 'surat-masuk':
        return <SuratMasuk />;
      case 'surat-keluar':
        return <SuratKeluar />;
      case 'surat-proposal':
        return <ProposalPage />;
      case 'surat-lpj':
        return <LpjPage />;
      // Pengumuman & Laporan
      case 'pengumuman':
        return <PengumumanPage />;
      case 'laporan':
        return <LaporanPusatPage />;
      default:
        return <DashboardPage />;
    }
  };

  if (activePage === 'login') {
    return (
      <div className="min-h-screen bg-[#FAF6EE] dark:bg-[#0E1B2C] text-[#1F3A5F] dark:text-[#FAF6EE] flex flex-col transition-colors duration-200">
        <LoginPage onBackToPublic={() => setActivePage('portal-publik')} />
        <Toast />
      </div>
    );
  }

  if (activePage === 'portal-publik' || activePage === 'public') {
    return (
      <div className="min-h-screen bg-[#FAF6EE] dark:bg-[#0E1B2C] text-[#1F3A5F] dark:text-[#FAF6EE] flex flex-col transition-colors duration-200">
        <PublicPortalPage />
        <Toast />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FAF6EE] dark:bg-[#0E1B2C] text-[#1F3A5F] dark:text-[#FAF6EE] flex transition-colors duration-200">
      {/* Sidebar Navigation */}
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* Main Content Container (280px sidebar offset, max-w-[1200px], 36-40px padding) */}
      <div className="flex-1 lg:pl-[280px] flex flex-col min-w-0">
        <Navbar onOpenSidebar={() => setSidebarOpen(true)} />
        <main className="flex-1 p-4 sm:p-6 lg:p-10 max-w-[1200px] mx-auto w-full">
          {renderCurrentPage()}
        </main>
      </div>

      {/* Global Toast Notification */}
      <Toast />
    </div>
  );
};

export function App() {
  return (
    <AppProvider>
      <MainLayout />
    </AppProvider>
  );
}

export default App;


import React, { useState } from 'react';
import {
  Settings,
  Database,
  Cloud,
  CheckCircle2,
  Building2,
  Palette,
  Download,
  Upload,
  Sun,
  Moon,
  Mail,
  MapPin,
  ShieldCheck,
  UserCheck,
  AlertCircle,
  Save,
  Image as ImageIcon,
  Plus,
  Trash2,
  Edit2,
  Sparkles,
  RotateCcw,
  Lock,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { Modal } from '../../components/common/Modal';
import { ImagePicker } from '../../components/common/ImagePicker';
import { GalleryItem } from '../../types';

export const PengaturanPage: React.FC = () => {
  const {
    orgProfile,
    updateOrgProfile,
    resetAllData,
    importAllData,
    theme,
    setTheme,
    toggleTheme,
    divisions,
    positions,
    members,
    workPrograms,
    events,
    meetings,
    attendances,
    cashTransactions,
    memberDues,
    budgets,
    documents,
    announcements,
    galleryPhotos,
    addGalleryPhoto,
    updateGalleryPhoto,
    deleteGalleryPhoto,
    resetGalleryPhotos,
    currentRole,
    setActivePage,
    showToast,
  } = useApp();

  const canResetData = currentRole === 'admin' || currentRole === 'pembina';
  const canAccessSettings = currentRole === 'admin' || currentRole === 'ketua' || currentRole === 'sekretaris' || currentRole === 'pembina';

  // Guard: redirect ke dashboard jika role tidak diizinkan
  if (!canAccessSettings) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-5 text-center p-6">
        <div className="w-16 h-16 rounded-2xl bg-[#E4EAF2] dark:bg-[#1F3A5F]/40 flex items-center justify-center">
          <Lock className="w-8 h-8 text-[#1F3A5F] dark:text-[#FAF6EE]" />
        </div>
        <div>
          <h2 className="text-xl font-extrabold text-[#1F3A5F] dark:text-[#FAF6EE] mb-2">Akses Dibatasi</h2>
          <p className="text-[15px] text-[#5A6472] dark:text-[#9AA8B8] max-w-sm">
            Halaman pengaturan hanya dapat diakses oleh <strong>Admin, Ketua OSIS, Sekretaris,</strong> dan <strong>Pembina OSIS</strong>.
          </p>
        </div>
        <button
          onClick={() => setActivePage('dashboard')}
          className="simo-btn-primary min-h-[44px] px-6 rounded-[12px] text-[14px] font-bold cursor-pointer"
        >
          Kembali ke Dashboard
        </button>
      </div>
    );
  }

  const [activeTab, setActiveTab] = useState<'profil' | 'portal' | 'data'>('profil');
  const [isResetModalOpen, setIsResetModalOpen] = useState(false);

  // Data Ketua OSIS aktif (otomatis tersinkronisasi dari data keanggotaan)
  const currentKetuaMember = members.find((m) => m.role === 'ketua');
  const currentKetuaName = currentKetuaMember?.fullName || orgProfile.ketuaName || 'Zevin';
  const currentKetuaClass = currentKetuaMember?.classRoom
    ? ` (${currentKetuaMember.grade ? `${currentKetuaMember.grade} ` : ''}${currentKetuaMember.classRoom})`
    : '';

  // Form states for Foto & Profil Ketua OSIS
  const [ketuaForm, setKetuaForm] = useState({
    name: currentKetuaName,
    photoUrl: orgProfile.ketuaPhotoUrl || '/ketua-osis.png',
    period: orgProfile.ketuaPeriod || 'KETUA OSIS PERIODE 2025/2026',
    welcomeTitle: orgProfile.ketuaWelcomeTitle || `Menjadi Wadah Inovasi Untuk ${orgProfile.schoolName || 'SMKN 1 Cerdas Bangsa'} Unggul.`,
    speech: orgProfile.ketuaSpeech || `Assalamu'alaikum Warahmatullahi Wabarakatuh, Salam Sejahtera untuk kita semua.\n\nTeman-teman yang saya banggakan, OSIS bukan sekadar label organisasi, melainkan ruang kolaborasi. Kami hadir bukan untuk memberi perintah, tetapi untuk mengajak seluruh siswa bergerak melampaui kebiasaan.\n\nMari kita ciptakan sekolah yang tidak hanya unggul dalam angka, tapi juga kaya dalam inovasi dan karakter. SIMO hadir sebagai jembatan yang inklusif bagi setiap aspirasi.\n\nMari bersinergi, karena perubahan besar dimulai dari langkah kecil yang dilakukan bersama.`,
  });

  const handleSaveKetua = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    updateOrgProfile({
      ketuaName: currentKetuaName,
      ketuaPhotoUrl: ketuaForm.photoUrl,
      ketuaPeriod: ketuaForm.period,
      ketuaWelcomeTitle: ketuaForm.welcomeTitle,
      ketuaSpeech: ketuaForm.speech,
    });
    showToast('Foto & data Ketua OSIS berhasil diperbarui!', 'success');
  };

  // State Modal Tambah / Edit Foto Galeri Dokumentasi
  const [isGalleryModalOpen, setIsGalleryModalOpen] = useState(false);
  const [editingPhoto, setEditingPhoto] = useState<GalleryItem | null>(null);
  const [photoForm, setPhotoForm] = useState({
    title: '',
    caption: '',
    imageUrl: '',
    date: 'Oktober 2026',
  });

  const handleOpenAddPhoto = () => {
    setEditingPhoto(null);
    setPhotoForm({
      title: '',
      caption: '',
      imageUrl: '',
      date: new Date().toLocaleDateString('id-ID', { month: 'long', year: 'numeric' }),
    });
    setIsGalleryModalOpen(true);
  };

  const handleOpenEditPhoto = (item: GalleryItem) => {
    setEditingPhoto(item);
    setPhotoForm({
      title: item.title,
      caption: item.caption,
      imageUrl: item.imageUrl,
      date: item.date,
    });
    setIsGalleryModalOpen(true);
  };

  const handleSaveGalleryPhoto = (e: React.FormEvent) => {
    e.preventDefault();
    if (!photoForm.title.trim()) {
      showToast('Harap isi judul kegiatan.', 'error');
      return;
    }
    if (!photoForm.imageUrl) {
      showToast('Harap pilih foto dari komputer atau masukkan link URL.', 'error');
      return;
    }

    if (editingPhoto) {
      updateGalleryPhoto(editingPhoto.id, {
        title: photoForm.title,
        caption: photoForm.caption,
        imageUrl: photoForm.imageUrl,
        date: photoForm.date,
      });
    } else {
      addGalleryPhoto({
        title: photoForm.title,
        caption: photoForm.caption,
        imageUrl: photoForm.imageUrl,
        date: photoForm.date,
      });
    }
    setIsGalleryModalOpen(false);
  };

  // Form states for Profil Organisasi (Identitas & Legalitas Dokumen Resmi)
  const [profileForm, setProfileForm] = useState({
    name: orgProfile.name,
    appName: orgProfile.appName || 'SIMO',
    schoolName: orgProfile.schoolName,
    motto: orgProfile.motto || 'Kreatif, Kolaboratif, Berkarakter & Berprestasi di Era Digital',
    academicYear: orgProfile.academicYear,
    address: orgProfile.address,
    email: orgProfile.email,
    headmasterName: orgProfile.headmasterName,
    nipHeadmaster: orgProfile.nipHeadmaster || '19680315 199403 2 004',
    pembinaName: orgProfile.pembinaName,
    nipPembina: orgProfile.nipPembina || '19750812 200212 1 003',
    ketuaName: orgProfile.ketuaName,
    nisnKetua: orgProfile.nisnKetua || '0081234501',
    logoUrl: orgProfile.logoUrl,
  });

  // Save Profil Organisasi
  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    updateOrgProfile({
      name: profileForm.name,
      appName: profileForm.appName,
      schoolName: profileForm.schoolName,
      motto: profileForm.motto,
      academicYear: profileForm.academicYear,
      address: profileForm.address,
      email: profileForm.email,
      headmasterName: profileForm.headmasterName,
      nipHeadmaster: profileForm.nipHeadmaster,
      pembinaName: profileForm.pembinaName,
      nipPembina: profileForm.nipPembina,
      ketuaName: profileForm.ketuaName,
      nisnKetua: profileForm.nisnKetua,
      logoUrl: profileForm.logoUrl,
    });
    showToast('Identitas & legalitas dokumen organisasi berhasil disimpan!', 'success');
  };

  // Export Backup JSON
  const handleExportBackup = () => {
    const backupData = {
      app: 'SchoolOrg UKK Management System',
      version: '2.0.0',
      exportedAt: new Date().toISOString(),
      orgProfile,
      divisions,
      positions,
      members,
      workPrograms,
      events,
      meetings,
      attendances,
      cashTransactions,
      memberDues,
      budgets,
      documents,
      announcements,
    };
    const blob = new Blob([JSON.stringify(backupData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `backup_schoolorg_${orgProfile.academicYear.replace('/', '-')}_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
    showToast('File cadangan data JSON berhasil diunduh!', 'success');
  };

  // Import Backup JSON
  const handleImportFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (content) {
        importAllData(content);
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const handleConfirmReset = () => {
    if (!canResetData) {
      showToast('Akses ditolak: Hanya Super Admin dan Pembina Guru yang berwenang me-reset data sistem!', 'error');
      setIsResetModalOpen(false);
      return;
    }
    resetAllData();
    setIsResetModalOpen(false);
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="simo-card p-6 sm:p-7 flex flex-col sm:flex-row sm:items-center justify-between gap-5">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <div className="w-8 h-8 rounded-[10px] bg-[#E4EAF2] dark:bg-[#1F3A5F]/40 text-[#1F3A5F] dark:text-[#FAF6EE] flex items-center justify-center">
              <Settings className="w-4 h-4" />
            </div>
            <h2 className="text-2xl font-extrabold text-[#1F3A5F] dark:text-[#FAF6EE] tracking-tight">
              Pusat Pengaturan Organisasi &amp; Sistem
            </h2>
          </div>
          <p className="text-[15px] text-[#5A6472] dark:text-[#9AA8B8]">
            Konfigurasi identitas legalitas sekolah, kebijakan kas, mode tema tampilan, dan cadangan data
          </p>
        </div>

        {/* Quick Theme Toggle */}
        <button
          onClick={toggleTheme}
          className="simo-btn-outline min-h-[44px] px-4 rounded-[12px] text-[14px] font-bold flex items-center gap-2 cursor-pointer shrink-0"
          title={`Saat ini ${theme === 'dark' ? 'Mode Gelap' : 'Mode Terang'}. Klik untuk beralih mode.`}
        >
          {theme === 'dark' ? (
            <>
              <Moon className="w-4 h-4 text-[#F2B544]" />
              <span>Mode Gelap (Aktif)</span>
            </>
          ) : (
            <>
              <Sun className="w-4 h-4 text-[#F2B544]" />
              <span>Mode Terang (Aktif)</span>
            </>
          )}
        </button>
      </div>

      {/* Settings Navigation Tabs */}
      <div className="flex p-1.5 bg-[#FAF6EE] dark:bg-[#0E1B2C] border border-[#E6DFD0] dark:border-[#283D56] rounded-[14px] overflow-x-auto text-[14px] font-bold gap-1">
        <button
          onClick={() => setActiveTab('profil')}
          className={`min-h-[40px] flex items-center gap-2 px-4 py-2 rounded-[10px] whitespace-nowrap transition-all cursor-pointer ${
            activeTab === 'profil'
              ? 'bg-[#1F3A5F] text-[#FAF6EE]'
              : 'text-[#5A6472] dark:text-[#9AA8B8] hover:text-[#1F3A5F] dark:hover:text-[#FAF6EE]'
          }`}
        >
          <Building2 className="w-4 h-4" />
          <span>Identitas &amp; Legalitas OSIS</span>
        </button>
        <button
          onClick={() => setActiveTab('portal')}
          className={`min-h-[40px] flex items-center gap-2 px-4 py-2 rounded-[10px] whitespace-nowrap transition-all cursor-pointer ${
            activeTab === 'portal'
              ? 'bg-[#1F3A5F] text-[#FAF6EE]'
              : 'text-[#5A6472] dark:text-[#9AA8B8] hover:text-[#1F3A5F] dark:hover:text-[#FAF6EE]'
          }`}
        >
          <ImageIcon className="w-4 h-4" />
          <span>Foto &amp; Konten Portal</span>
        </button>
        <button
          onClick={() => setActiveTab('data')}
          className={`min-h-[40px] flex items-center gap-2 px-4 py-2 rounded-[10px] whitespace-nowrap transition-all cursor-pointer ${
            activeTab === 'data'
              ? 'bg-[#1F3A5F] text-[#FAF6EE]'
              : 'text-[#5A6472] dark:text-[#9AA8B8] hover:text-[#1F3A5F] dark:hover:text-[#FAF6EE]'
          }`}
        >
          <Database className="w-4 h-4" />
          <span>Cadangan &amp; Pemeliharaan</span>
        </button>
      </div>

      {/* ======================================================== */}
      {/* TAB 1: IDENTITAS & PROFIL LEGALITAS ORGANISASI           */}
      {/* ======================================================== */}
      {activeTab === 'profil' && (
        <form onSubmit={handleSaveProfile} className="space-y-6">
          <div className="simo-card p-6 space-y-5">
            <div className="flex items-center justify-between border-b border-[#E6DFD0] dark:border-[#283D56] pb-3.5">
              <div>
                <h3 className="text-[17px] font-extrabold text-[#1F3A5F] dark:text-[#FAF6EE] flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-[#1F3A5F] dark:text-[#F2B544]" />
                  <span>Profil Resmi Lembaga Sekolah &amp; Organisasi</span>
                </h3>
                <p className="text-[14px] text-[#5A6472] dark:text-[#9AA8B8] mt-0.5">
                  Data ini dicantumkan pada kop surat resmi, dokumen proposal, kartu tanda anggota (KTA), dan LPJ
                </p>
              </div>
              <button
                type="submit"
                className="simo-btn-primary min-h-[44px] px-5 py-2 rounded-[12px] text-[14px] font-bold flex items-center gap-2 cursor-pointer shrink-0"
              >
                <Save className="w-4 h-4" />
                <span>Simpan Perubahan</span>
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-[14px] font-bold text-[#1F3A5F] dark:text-[#FAF6EE] mb-1.5">
                  Nama Aplikasi / Brand Sistem (Header) <span className="text-[#F2B544]">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={profileForm.appName}
                  onChange={(e) => setProfileForm({ ...profileForm, appName: e.target.value })}
                  placeholder="SIMO"
                  className="simo-input min-h-[44px] text-[15px] w-full font-bold"
                />
                <p className="text-[12px] text-[#5A6472] dark:text-[#9AA8B8] mt-1">
                  Nama brand aplikasi yang muncul di navbar portal publik, sidebar admin, dan header mobile (misal: SIMO, OSIS-APP, dll.)
                </p>
              </div>

              <div>
                <label className="block text-[14px] font-bold text-[#1F3A5F] dark:text-[#FAF6EE] mb-1.5">
                  Masa Bakti / Tahun Ajaran Aktif <span className="text-[#F2B544]">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={profileForm.academicYear}
                  onChange={(e) => setProfileForm({ ...profileForm, academicYear: e.target.value })}
                  placeholder="2025/2026"
                  className="simo-input min-h-[44px] text-[15px] w-full"
                />
                <p className="text-[12px] text-[#5A6472] dark:text-[#9AA8B8] mt-1">
                  Tahun periode kepengurusan aktif (tampil di bawah nama sistem di sidebar)
                </p>
              </div>

              <div>
                <label className="block text-[14px] font-bold text-[#1F3A5F] dark:text-[#FAF6EE] mb-1.5">
                  Nama Organisasi Lengkap <span className="text-[#F2B544]">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={profileForm.name}
                  onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })}
                  placeholder="OSIS SMK Negeri 1 Cerdas Bangsa"
                  className="simo-input min-h-[44px] text-[15px] w-full"
                />
              </div>

              <div>
                <label className="block text-[14px] font-bold text-[#1F3A5F] dark:text-[#FAF6EE] mb-1.5">
                  Nama Sekolah / Instansi Induk <span className="text-[#F2B544]">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={profileForm.schoolName}
                  onChange={(e) => setProfileForm({ ...profileForm, schoolName: e.target.value })}
                  placeholder="SMK Negeri 1 Cerdas Bangsa"
                  className="simo-input min-h-[44px] text-[15px] w-full"
                />
              </div>

              <div>
                <label className="block text-[14px] font-bold text-[#1F3A5F] dark:text-[#FAF6EE] mb-1.5">
                  Motto / Slogan Organisasi
                </label>
                <input
                  type="text"
                  value={profileForm.motto}
                  onChange={(e) => setProfileForm({ ...profileForm, motto: e.target.value })}
                  placeholder="Kreatif, Kolaboratif, Berkarakter & Berprestasi"
                  className="simo-input min-h-[44px] text-[15px] w-full"
                />
              </div>

              <div className="space-y-2">
                <label className="block text-[14px] font-bold text-[#1F3A5F] dark:text-[#FAF6EE] mb-1.5">
                  Logo Aplikasi &amp; Organisasi (Opsional)
                </label>
                <div className="flex flex-col sm:flex-row gap-4 items-start">
                  <div className="w-24 shrink-0">
                    <ImagePicker
                      label=""
                      value={profileForm.logoUrl}
                      onChange={(url) => setProfileForm({ ...profileForm, logoUrl: url })}
                      helperText=""
                      aspectRatio="square"
                    />
                  </div>
                  <div className="flex-1 w-full space-y-2">
                    <input
                      type="text"
                      value={profileForm.logoUrl}
                      onChange={(e) => setProfileForm({ ...profileForm, logoUrl: e.target.value })}
                      placeholder="Atau tempel tautan gambar (https://...)"
                      className="simo-input min-h-[44px] text-[14px] w-full"
                    />
                    <p className="text-[12px] text-[#5A6472] dark:text-[#9AA8B8]">
                      Unggah logo dari komputer atau masukkan link URL gambar. Logo otomatis tampil di navbar portal publik, sidebar admin, halaman login, kop surat, dan kartu KTA.
                    </p>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-[14px] font-bold text-[#1F3A5F] dark:text-[#FAF6EE] mb-1.5">
                  Alamat Sekretariat / Kampus Sekolah
                </label>
                <div className="relative">
                  <MapPin className="w-4 h-4 text-[#5A6472] dark:text-[#9AA8B8] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none z-10" />
                  <input
                    type="text"
                    value={profileForm.address}
                    onChange={(e) => setProfileForm({ ...profileForm, address: e.target.value })}
                    placeholder="Jl. Merdeka Belajar No. 45, Kompleks Pendidikan, Jakarta"
                    className="simo-input !pl-10 pr-3 min-h-[44px] text-[15px] w-full"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[14px] font-bold text-[#1F3A5F] dark:text-[#FAF6EE] mb-1.5">
                  Email Resmi OSIS (Untuk Kop Surat)
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-[#5A6472] dark:text-[#9AA8B8] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none z-10" />
                  <input
                    type="email"
                    value={profileForm.email}
                    onChange={(e) => setProfileForm({ ...profileForm, email: e.target.value })}
                    placeholder="osis@smkn1cerdas.sch.id"
                    className="simo-input !pl-10 pr-3 min-h-[44px] text-[15px] w-full"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Pejabat Penandatangan Resmi (Legalitas Dokumen) */}
          <div className="simo-card p-6 space-y-4">
            <div className="border-b border-[#E6DFD0] dark:border-[#283D56] pb-3.5">
              <h3 className="text-[17px] font-extrabold text-[#1F3A5F] dark:text-[#FAF6EE] flex items-center gap-2">
                <UserCheck className="w-5 h-5 text-[#1F3A5F] dark:text-[#F2B544]" />
                <span>Pejabat Penandatangan Resmi (Kop Surat &amp; Lembar Pengesahan)</span>
              </h3>
              <p className="text-[14px] text-[#5A6472] dark:text-[#9AA8B8] mt-0.5">
                Nama dan NIP/NISN ini otomatis mengisi kolom tanda tangan laporan, proposal kegiatan, dan lembar LPJ
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {/* Kepala Sekolah */}
              <div className="p-4 rounded-[14px] bg-[#FAF6EE] dark:bg-[#0E1B2C] border border-[#E6DFD0] dark:border-[#283D56] space-y-3">
                <span className="font-extrabold text-[#1F3A5F] dark:text-[#FAF6EE] text-[14px] block border-b border-[#E6DFD0] dark:border-[#283D56] pb-2">
                  1. Kepala Sekolah
                </span>
                <div>
                  <label className="block text-[13px] font-bold text-[#5A6472] dark:text-[#9AA8B8] mb-1">Nama Lengkap &amp; Gelar</label>
                  <input
                    type="text"
                    value={profileForm.headmasterName}
                    onChange={(e) => setProfileForm({ ...profileForm, headmasterName: e.target.value })}
                    className="simo-input min-h-[40px] text-[14px] w-full"
                  />
                </div>
                <div>
                  <label className="block text-[13px] font-bold text-[#5A6472] dark:text-[#9AA8B8] mb-1">NIP Kepala Sekolah</label>
                  <input
                    type="text"
                    value={profileForm.nipHeadmaster}
                    onChange={(e) => setProfileForm({ ...profileForm, nipHeadmaster: e.target.value })}
                    className="simo-input min-h-[40px] text-[14px] w-full font-mono"
                  />
                </div>
              </div>

              {/* Pembina OSIS */}
              <div className="p-4 rounded-[14px] bg-[#FAF6EE] dark:bg-[#0E1B2C] border border-[#E6DFD0] dark:border-[#283D56] space-y-3">
                <span className="font-extrabold text-[#1F3A5F] dark:text-[#FAF6EE] text-[14px] block border-b border-[#E6DFD0] dark:border-[#283D56] pb-2">
                  2. Pembina OSIS (Guru)
                </span>
                <div>
                  <label className="block text-[13px] font-bold text-[#5A6472] dark:text-[#9AA8B8] mb-1">Nama Lengkap &amp; Gelar</label>
                  <input
                    type="text"
                    value={profileForm.pembinaName}
                    onChange={(e) => setProfileForm({ ...profileForm, pembinaName: e.target.value })}
                    className="simo-input min-h-[40px] text-[14px] w-full"
                  />
                </div>
                <div>
                  <label className="block text-[13px] font-bold text-[#5A6472] dark:text-[#9AA8B8] mb-1">NIP Pembina</label>
                  <input
                    type="text"
                    value={profileForm.nipPembina}
                    onChange={(e) => setProfileForm({ ...profileForm, nipPembina: e.target.value })}
                    className="simo-input min-h-[40px] text-[14px] w-full font-mono"
                  />
                </div>
              </div>

              {/* Ketua OSIS */}
              <div className="p-4 rounded-[14px] bg-[#FAF6EE] dark:bg-[#0E1B2C] border border-[#E6DFD0] dark:border-[#283D56] space-y-3">
                <span className="font-extrabold text-[#1F3A5F] dark:text-[#FAF6EE] text-[14px] block border-b border-[#E6DFD0] dark:border-[#283D56] pb-2">
                  3. Ketua Umum OSIS
                </span>
                <div>
                  <label className="block text-[13px] font-bold text-[#5A6472] dark:text-[#9AA8B8] mb-1">Nama Ketua OSIS</label>
                  <input
                    type="text"
                    value={profileForm.ketuaName}
                    onChange={(e) => setProfileForm({ ...profileForm, ketuaName: e.target.value })}
                    className="simo-input min-h-[40px] text-[14px] w-full"
                  />
                </div>
                <div>
                  <label className="block text-[13px] font-bold text-[#5A6472] dark:text-[#9AA8B8] mb-1">NISN Ketua OSIS</label>
                  <input
                    type="text"
                    value={profileForm.nisnKetua}
                    onChange={(e) => setProfileForm({ ...profileForm, nisnKetua: e.target.value })}
                    className="simo-input min-h-[40px] text-[14px] w-full font-mono"
                  />
                </div>
              </div>
            </div>

            <div className="pt-3 flex justify-end border-t border-[#E6DFD0] dark:border-[#283D56]">
              <button
                type="submit"
                className="simo-btn-primary min-h-[44px] px-5 py-2.5 rounded-[12px] text-[14px] font-bold flex items-center gap-2 cursor-pointer"
              >
                <Save className="w-4 h-4" />
                <span>Simpan Perubahan Legalitas</span>
              </button>
            </div>
          </div>
        </form>
      )}

      {/* ======================================================== */}
      {/* TAB 2: FOTO & KONTEN PORTAL PUBLIK                      */}
      {/* ======================================================== */}
      {activeTab === 'portal' && (
        <div className="space-y-8">
          {/* SECTION 1: FOTO & SAMBUTAN KETUA OSIS */}
          <div className="simo-card p-6 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-[#E6DFD0] dark:border-[#283D56] gap-3">
              <div>
                <h3 className="text-[17px] font-extrabold text-[#1F3A5F] dark:text-[#FAF6EE] flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-[#F2B544]" />
                  <span>Foto &amp; Profil Sambutan Ketua OSIS</span>
                </h3>
                <p className="text-[14px] text-[#5A6472] dark:text-[#9AA8B8] mt-0.5">
                  Foto dan sambutan ini tampil pada bagian "Tentang / Sambutan Ketua OSIS" di portal publik
                </p>
              </div>
              <button
                type="button"
                onClick={() => handleSaveKetua()}
                className="simo-btn-primary min-h-[44px] px-5 py-2 rounded-[12px] text-[14px] font-bold flex items-center gap-2 cursor-pointer shrink-0"
              >
                <Save className="w-4 h-4" />
                <span>Simpan Profil Ketua OSIS</span>
              </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              {/* Kolom Preview Kartu Foto (Aspect 3:4) */}
              <div className="lg:col-span-4 flex flex-col items-center">
                <p className="text-xs font-bold uppercase tracking-wider text-[#5A6472] dark:text-[#9AA8B8] mb-2 self-start">
                  Live Preview Kartu di Portal
                </p>
                <div className="relative w-full max-w-[260px] rounded-2xl overflow-hidden border border-[#E6DFD0] dark:border-[#283D56] shadow-md bg-[#FAF6EE] dark:bg-[#17293E] group">
                  <div className="aspect-[3/4] w-full overflow-hidden bg-[#E4EAF2] dark:bg-[#213B5C]">
                    <img
                      src={ketuaForm.photoUrl || currentKetuaMember?.avatarUrl || '/ketua-osis.png'}
                      alt="Ketua OSIS Preview"
                      className="w-full h-full object-cover object-top"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src =
                          'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=800&auto=format&fit=crop&q=80';
                      }}
                    />
                  </div>
                  {/* Badge Nama Melayang (Otomatis Tersinkron Sesuai Ketua OSIS Aktif) */}
                  <div className="absolute bottom-3 inset-x-3 bg-[#FFFDF8]/95 dark:bg-[#17293E]/95 backdrop-blur-md border border-[#E6DFD0] dark:border-[#283D56] rounded-xl p-2.5 text-center shadow-sm">
                    <div className="inline-flex items-center justify-center gap-1 text-[#F2B544] mb-0.5">
                      <Sparkles className="w-3 h-3" />
                      <span className="font-extrabold text-[13px] text-[#1F3A5F] dark:text-[#FAF6EE] truncate">
                        {currentKetuaName}{currentKetuaClass}
                      </span>
                    </div>
                    <p className="text-[10px] font-bold tracking-wider text-[#5A6472] dark:text-[#9AA8B8] uppercase truncate">
                      {ketuaForm.period || 'KETUA OSIS PERIODE 2025/2026'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Form Input Data Ketua */}
              <div className="lg:col-span-8 space-y-4">
                <div>
                  <ImagePicker
                    label="Unggah Foto Ketua OSIS (Dari Komputer)"
                    value={ketuaForm.photoUrl}
                    onChange={(url) => setKetuaForm({ ...ketuaForm, photoUrl: url })}
                    helperText="Pilih foto portrait resmi Ketua OSIS dari komputer (JPG/PNG). Rekomendasi rasio 3:4 atau tegak."
                    aspectRatio="card"
                  />
                  <div className="mt-2">
                    <label className="block text-[12px] font-bold text-[#5A6472] dark:text-[#9AA8B8] mb-1">
                      Atau Masukkan URL Link Foto (Opsional)
                    </label>
                    <input
                      type="text"
                      value={ketuaForm.photoUrl}
                      onChange={(e) => setKetuaForm({ ...ketuaForm, photoUrl: e.target.value })}
                      placeholder="/ketua-osis.png atau https://..."
                      className="simo-input min-h-[40px] text-[13px] w-full"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[14px] font-bold text-[#1F3A5F] dark:text-[#FAF6EE] mb-1.5 flex items-center justify-between">
                      <span>Nama Ketua OSIS</span>
                      <span className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/50 px-2 py-0.5 rounded-full border border-emerald-200 dark:border-emerald-800">
                        Otomatis Tersinkron
                      </span>
                    </label>
                    <div className="flex items-center gap-2.5 px-3.5 min-h-[44px] rounded-[12px] bg-[#E4EAF2]/60 dark:bg-[#1E344D] border border-[#CBD5E1] dark:border-[#283D56] text-[14px] font-bold text-[#1F3A5F] dark:text-[#FAF6EE]">
                      <UserCheck className="w-4 h-4 text-[#F2B544] shrink-0" />
                      <span className="truncate">{currentKetuaName}{currentKetuaClass}</span>
                    </div>
                    <p className="text-[12px] text-[#5A6472] dark:text-[#9AA8B8] mt-1">
                      Otomatis mengikuti data pengurus Ketua OSIS saat ini.
                    </p>
                  </div>
                  <div>
                    <label className="block text-[14px] font-bold text-[#1F3A5F] dark:text-[#FAF6EE] mb-1.5">
                      Jabatan &amp; Periode
                    </label>
                    <input
                      type="text"
                      value={ketuaForm.period}
                      onChange={(e) => setKetuaForm({ ...ketuaForm, period: e.target.value })}
                      placeholder="KETUA OSIS PERIODE 2025/2026"
                      className="simo-input min-h-[44px] text-[14px] w-full"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[14px] font-bold text-[#1F3A5F] dark:text-[#FAF6EE] mb-1.5">
                    Judul / Kutipan Sambutan Utama
                  </label>
                  <input
                    type="text"
                    value={ketuaForm.welcomeTitle}
                    onChange={(e) => setKetuaForm({ ...ketuaForm, welcomeTitle: e.target.value })}
                    placeholder={`"Menjadi Wadah Inovasi Untuk ${orgProfile.schoolName || 'SMKN 1 Cerdas Bangsa'} Unggul."`}
                    className="simo-input min-h-[44px] text-[14px] w-full"
                  />
                </div>

                <div>
                  <label className="block text-[14px] font-bold text-[#1F3A5F] dark:text-[#FAF6EE] mb-1.5">
                    Isi Teks Sambutan (Pisahkan paragraf dengan baris baru)
                  </label>
                  <textarea
                    rows={4}
                    value={ketuaForm.speech}
                    onChange={(e) => setKetuaForm({ ...ketuaForm, speech: e.target.value })}
                    placeholder="Tuliskan kata sambutan Ketua OSIS untuk portal publik..."
                    className="simo-input p-3 text-[14px] w-full resize-y"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* SECTION 2: GALERI DOKUMENTASI KEGIATAN ("Rekam jejak karya dan momen berharga") */}
          <div className="simo-card p-6 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-[#E6DFD0] dark:border-[#283D56] gap-3">
              <div>
                <h3 className="text-[17px] font-extrabold text-[#1F3A5F] dark:text-[#FAF6EE] flex items-center gap-2">
                  <ImageIcon className="w-5 h-5 text-[#1F3A5F] dark:text-[#F2B544]" />
                  <span>Galeri Dokumentasi Portal ("Rekam Jejak Karya &amp; Momen")</span>
                </h3>
                <p className="text-[14px] text-[#5A6472] dark:text-[#9AA8B8] mt-0.5">
                  Kelola foto, judul kegiatan, dan periode yang tampil pada galeri dokumentasi publik ({galleryPhotos.length} Foto Aktif)
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleOpenAddPhoto}
                  className="simo-btn-primary min-h-[44px] px-4 py-2 rounded-[12px] text-[13px] font-bold flex items-center gap-2 cursor-pointer shrink-0"
                >
                  <Plus className="w-4 h-4" />
                  <span>+ Tambah Foto Dokumentasi</span>
                </button>
              </div>
            </div>

            {/* Grid Kartu Foto Dokumentasi */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {galleryPhotos.map((item, index) => (
                <div
                  key={item.id}
                  className="bg-[#FFFDF8] dark:bg-[#17293E] border border-[#E6DFD0] dark:border-[#283D56] rounded-2xl overflow-hidden shadow-xs hover:border-[#1F3A5F] transition-all flex flex-col group"
                >
                  <div className="relative aspect-4/3 bg-slate-100 dark:bg-slate-800 overflow-hidden">
                    <img
                      src={item.imageUrl}
                      alt={item.title}
                      className="w-full h-full object-cover group-hover:scale-103 transition-transform duration-300"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src =
                          'https://images.unsplash.com/photo-1511632765486-a01980e01a18?w=800&auto=format&fit=crop&q=80';
                      }}
                    />
                    <span className="absolute bottom-2.5 right-2.5 px-2.5 py-0.5 bg-black/70 backdrop-blur-xs text-white text-[11px] font-bold rounded-md">
                      {item.date}
                    </span>
                    <span className="absolute top-2.5 left-2.5 px-2 py-0.5 bg-[#1F3A5F]/80 backdrop-blur-xs text-white text-[10px] font-extrabold rounded-md">
                      #{index + 1}
                    </span>
                  </div>

                  <div className="p-4 flex-1 flex flex-col justify-between">
                    <div>
                      <h4 className="font-extrabold text-[15px] text-[#1F3A5F] dark:text-[#FAF6EE] leading-snug line-clamp-1">
                        {item.title}
                      </h4>
                      <p className="text-[12px] text-[#5A6472] dark:text-[#9AA8B8] mt-1 line-clamp-2 leading-relaxed">
                        {item.caption}
                      </p>
                    </div>

                    <div className="flex items-center justify-end gap-2 mt-4 pt-3 border-t border-[#E6DFD0] dark:border-[#283D56]">
                      <button
                        type="button"
                        onClick={() => handleOpenEditPhoto(item)}
                        className="px-3 py-1.5 bg-[#E4EAF2] hover:bg-[#d8e2ed] dark:bg-[#213B5C] dark:hover:bg-[#284870] text-[#1F3A5F] dark:text-[#FAF6EE] rounded-[10px] text-[12px] font-bold flex items-center gap-1.5 cursor-pointer transition-colors"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                        <span>Edit</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          if (window.confirm(`Yakin ingin menghapus foto kegiatan "${item.title}"?`)) {
                            deleteGalleryPhoto(item.id);
                          }
                        }}
                        className="px-3 py-1.5 bg-red-50 hover:bg-red-100 dark:bg-red-950/30 dark:hover:bg-red-950/50 text-red-600 dark:text-red-400 rounded-[10px] text-[12px] font-bold flex items-center gap-1.5 cursor-pointer transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>Hapus</span>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* TAB 3: CADANGAN & PEMELIHARAAN BASIS DATA               */}
      {/* ======================================================== */}
      {activeTab === 'data' && (
        <div className="space-y-6">
          {/* Dual-Mode Architecture Status */}
          <div className="simo-card p-6 space-y-4">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-[10px] bg-[#E4EAF2] text-[#1F3A5F] dark:bg-[#1F3A5F]/40 dark:text-[#FAF6EE] flex items-center justify-center">
                <Database className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-[17px] font-extrabold text-[#1F3A5F] dark:text-[#FAF6EE]">Status Penyimpanan Data UKK</h3>
                <p className="text-[14px] text-[#5A6472] dark:text-[#9AA8B8]">Arsitektur Dual-Mode Resilient</p>
              </div>
            </div>

            <div className="p-4 rounded-[14px] bg-[#FAF6EE] dark:bg-[#0E1B2C] border border-[#E6DFD0] dark:border-[#283D56] space-y-2 text-[14px]">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <span className="font-bold text-[#1F3A5F] dark:text-[#FAF6EE]">Status Database Cloud:</span>
                <span className="simo-badge-blue">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                  Supabase Cloud PostgreSQL Aktif &amp; Terhubung
                </span>
              </div>
              <p className="text-[13px] text-[#5A6472] dark:text-[#9AA8B8] leading-relaxed">
                Aplikasi telah terhubung langsung ke proyek <strong>Supabase Cloud (ProjectPAS)</strong>. Data anggota, notulen rapat, pengumuman, dan divisi tersimpan di cloud PostgreSQL dengan mekanisme sinkronisasi instan serta didukung cadangan luring (Offline-Resilient).
              </p>
            </div>
          </div>

          {/* Backup & Restore Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {/* Download Backup */}
            <div className="simo-card p-6 space-y-3 flex flex-col justify-between">
              <div>
                <div className="w-10 h-10 rounded-[12px] bg-[#E4EAF2] text-[#1F3A5F] dark:bg-[#1F3A5F]/40 dark:text-[#FAF6EE] flex items-center justify-center mb-2.5">
                  <Download className="w-5 h-5" />
                </div>
                <h4 className="text-[16px] font-bold text-[#1F3A5F] dark:text-[#FAF6EE]">Ekspor Cadangan Lengkap (.JSON)</h4>
                <p className="text-[14px] text-[#5A6472] dark:text-[#9AA8B8] mt-1 leading-relaxed">
                  Unduh seluruh database (anggota, kas, proker, rapat, surat, arsip) ke dalam satu file JSON untuk dipindahkan ke komputer lain.
                </p>
              </div>

              <button
                type="button"
                onClick={handleExportBackup}
                className="simo-btn-primary w-full mt-4 min-h-[44px] rounded-[12px] text-[14px] font-bold flex items-center justify-center gap-2 cursor-pointer"
              >
                <Download className="w-4 h-4" />
                <span>Unduh Cadangan JSON</span>
              </button>
            </div>

            {/* Restore from File */}
            <div className="simo-card p-6 space-y-3 flex flex-col justify-between">
              <div>
                <div className="w-10 h-10 rounded-[12px] bg-[#E4EAF2] text-[#1F3A5F] dark:bg-[#1F3A5F]/40 dark:text-[#FAF6EE] flex items-center justify-center mb-2.5">
                  <Upload className="w-5 h-5" />
                </div>
                <h4 className="text-[16px] font-bold text-[#1F3A5F] dark:text-[#FAF6EE]">Pulihkan Data dari Cadangan</h4>
                <p className="text-[14px] text-[#5A6472] dark:text-[#9AA8B8] mt-1 leading-relaxed">
                  Unggah file cadangan JSON yang pernah Anda unduh sebelumnya untuk mengembalikan seluruh kondisi aplikasi.
                </p>
              </div>

              <label className="simo-btn-outline w-full mt-4 min-h-[44px] rounded-[12px] text-[14px] font-bold flex items-center justify-center gap-2 cursor-pointer">
                <Upload className="w-4 h-4" />
                <span>Pilih File JSON</span>
                <input
                  type="file"
                  accept=".json,application/json"
                  onChange={handleImportFile}
                  className="hidden"
                />
              </label>
            </div>
          </div>

          {/* Factory Reset Data */}
          <div className="simo-card p-6 space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-[12px] bg-[#FAF6EE] dark:bg-[#0E1B2C] text-[#1F3A5F] dark:text-[#FAF6EE] flex items-center justify-center shrink-0 mt-0.5 border border-[#E6DFD0] dark:border-[#283D56]">
                  <AlertCircle className="w-5 h-5 text-[#F2B544]" />
                </div>
                <div>
                  <h3 className="text-[16px] font-bold text-[#1F3A5F] dark:text-[#FAF6EE]">Reset Seluruh Data ke Nilai Standar Awal</h3>
                  <p className="text-[14px] text-[#5A6472] dark:text-[#9AA8B8] mt-0.5 leading-relaxed">
                    Menghapus data ubahan lokal dan memulihkan data anggota, jadwal rapat, proker, dan transaksi kas standar.
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => {
                  if (!canResetData) {
                    showToast('Akses dibatasi: Hanya Super Admin & Pembina Guru yang berwenang me-reset database.', 'error');
                    return;
                  }
                  setIsResetModalOpen(true);
                }}
                className={`simo-btn-outline min-h-[44px] px-5 rounded-[12px] text-[14px] font-bold cursor-pointer shrink-0 flex items-center gap-2 ${
                  !canResetData ? 'opacity-70' : ''
                }`}
                title={canResetData ? 'Reset ke Default UKK' : 'Akses Terbatas: Hanya Super Admin & Pembina'}
              >
                {!canResetData && <Lock className="w-4 h-4 text-amber-500" />}
                <span>Reset ke Default</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Tambah / Edit Foto Galeri Dokumentasi */}
      <Modal
        isOpen={isGalleryModalOpen}
        onClose={() => setIsGalleryModalOpen(false)}
        title={editingPhoto ? 'Edit Foto Dokumentasi Kegiatan' : 'Tambah Foto Dokumentasi Kegiatan'}
      >
        <form onSubmit={handleSaveGalleryPhoto} className="space-y-4">
          <div>
            <ImagePicker
              label="Pilih Foto Kegiatan"
              value={photoForm.imageUrl}
              onChange={(url) => setPhotoForm({ ...photoForm, imageUrl: url })}
              helperText="Pilih foto dokumentasi dari komputer (JPG/PNG/WEBP). Rekomendasi rasio 4:3 atau 16:9."
              aspectRatio="video"
            />
          </div>

          <div>
            <label className="block text-[14px] font-bold text-[#1F3A5F] dark:text-[#FAF6EE] mb-1.5">
              Judul Kegiatan
            </label>
            <input
              type="text"
              value={photoForm.title}
              onChange={(e) => setPhotoForm({ ...photoForm, title: e.target.value })}
              placeholder="Contoh: Latihan Dasar Kepemimpinan Siswa (LDKS)"
              className="simo-input min-h-[44px] text-[14px] w-full"
              required
            />
          </div>

          <div>
            <label className="block text-[14px] font-bold text-[#1F3A5F] dark:text-[#FAF6EE] mb-1.5">
              Keterangan / Deskripsi Singkat
            </label>
            <textarea
              value={photoForm.caption}
              onChange={(e) => setPhotoForm({ ...photoForm, caption: e.target.value })}
              placeholder="Deskripsi kegiatan, tujuan, atau momen yang tertangkap..."
              className="simo-input text-[14px] w-full p-3 min-h-[80px]"
              rows={3}
            />
          </div>

          <div>
            <label className="block text-[14px] font-bold text-[#1F3A5F] dark:text-[#FAF6EE] mb-1.5">
              Waktu / Periode Pelaksanaan
            </label>
            <input
              type="text"
              value={photoForm.date}
              onChange={(e) => setPhotoForm({ ...photoForm, date: e.target.value })}
              placeholder="Contoh: Oktober 2026 atau 15 November 2026"
              className="simo-input min-h-[44px] text-[14px] w-full"
              required
            />
          </div>

          <div className="flex justify-end gap-3 pt-3 border-t border-[#E6DFD0] dark:border-[#283D56]">
            <button
              type="button"
              onClick={() => setIsGalleryModalOpen(false)}
              className="simo-btn-outline min-h-[44px] px-5 rounded-[12px] text-[14px] font-bold cursor-pointer"
            >
              Batal
            </button>
            <button
              type="submit"
              className="simo-btn-primary min-h-[44px] px-5 rounded-[12px] text-[14px] font-bold flex items-center gap-2 cursor-pointer"
            >
              <Save className="w-4 h-4" />
              <span>{editingPhoto ? 'Simpan Perubahan' : 'Tambahkan Foto'}</span>
            </button>
          </div>
        </form>
      </Modal>

      {/* Confirmation Modal for Reset */}
      <Modal
        isOpen={isResetModalOpen}
        onClose={() => setIsResetModalOpen(false)}
        title="Konfirmasi Reset Data Aplikasi"
      >
        <div className="space-y-4">
          <div className="flex items-start gap-3 p-4 rounded-[14px] bg-[#FAF6EE] dark:bg-[#17293E] border border-[#E6DFD0] dark:border-[#283D56]">
            <AlertCircle className="w-5 h-5 text-[#F2B544] shrink-0 mt-0.5" />
            <div className="text-[15px] text-[#1F3A5F] dark:text-[#FAF6EE]">
              <p className="font-bold">Apakah Anda yakin ingin me-reset seluruh data ke nilai awal default UKK?</p>
              <p className="text-[14px] text-[#5A6472] dark:text-[#9AA8B8] mt-1">
                Data anggota baru, perubahan kas, dan presensi yang belum dicadangkan ke file JSON akan dihapus dari penyimpanan browser.
              </p>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={() => setIsResetModalOpen(false)}
              className="simo-btn-outline min-h-[44px] px-5 rounded-[12px] text-[14px] font-bold cursor-pointer"
            >
              Batal
            </button>
            <button
              type="button"
              onClick={handleConfirmReset}
              className="simo-btn-primary min-h-[44px] px-5 rounded-[12px] text-[14px] font-bold cursor-pointer"
            >
              Ya, Reset Data
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

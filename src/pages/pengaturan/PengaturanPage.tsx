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
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { isSupabaseConfigured } from '../../lib/supabase';
import { Modal } from '../../components/common/Modal';

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
    showToast,
  } = useApp();

  const [activeTab, setActiveTab] = useState<'profil' | 'tampilan' | 'data'>('profil');
  const [isResetModalOpen, setIsResetModalOpen] = useState(false);
  const isCloud = isSupabaseConfigured();

  // Form states for Profil Organisasi (Identitas & Legalitas Dokumen Resmi)
  const [profileForm, setProfileForm] = useState({
    name: orgProfile.name,
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
        >
          {theme === 'dark' ? (
            <>
              <Sun className="w-4 h-4 text-[#F2B544]" />
              <span>Mode Gelap (Aktif)</span>
            </>
          ) : (
            <>
              <Moon className="w-4 h-4 text-[#1F3A5F]" />
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
          onClick={() => setActiveTab('tampilan')}
          className={`min-h-[40px] flex items-center gap-2 px-4 py-2 rounded-[10px] whitespace-nowrap transition-all cursor-pointer ${
            activeTab === 'tampilan'
              ? 'bg-[#1F3A5F] text-[#FAF6EE]'
              : 'text-[#5A6472] dark:text-[#9AA8B8] hover:text-[#1F3A5F] dark:hover:text-[#FAF6EE]'
          }`}
        >
          <Palette className="w-4 h-4" />
          <span>Preferensi Tampilan &amp; Mode</span>
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
                  Nama Organisasi <span className="text-[#F2B544]">*</span>
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

              <div>
                <label className="block text-[14px] font-bold text-[#1F3A5F] dark:text-[#FAF6EE] mb-1.5">
                  Alamat Sekretariat / Kampus Sekolah
                </label>
                <div className="relative">
                  <MapPin className="w-4 h-4 text-[#5A6472] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type="text"
                    value={profileForm.address}
                    onChange={(e) => setProfileForm({ ...profileForm, address: e.target.value })}
                    placeholder="Jl. Merdeka Belajar No. 45, Kompleks Pendidikan, Jakarta"
                    className="simo-input pl-10 pr-3 min-h-[44px] text-[15px] w-full"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[14px] font-bold text-[#1F3A5F] dark:text-[#FAF6EE] mb-1.5">
                  Email Resmi OSIS (Untuk Kop Surat)
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-[#5A6472] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type="email"
                    value={profileForm.email}
                    onChange={(e) => setProfileForm({ ...profileForm, email: e.target.value })}
                    placeholder="osis@smkn1cerdas.sch.id"
                    className="simo-input pl-10 pr-3 min-h-[44px] text-[15px] w-full"
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
      {/* TAB 2: PREFERENSI TAMPILAN & MODE SISTEM                */}
      {/* ======================================================== */}
      {activeTab === 'tampilan' && (
        <div className="space-y-6">
          {/* Theme Selector */}
          <div className="simo-card p-6 space-y-5">
            <div>
              <h3 className="text-[17px] font-extrabold text-[#1F3A5F] dark:text-[#FAF6EE] flex items-center gap-2">
                <Palette className="w-5 h-5 text-[#1F3A5F] dark:text-[#F2B544]" />
                <span>Mode Tampilan Aplikasi (Theme Appearance)</span>
              </h3>
              <p className="text-[14px] text-[#5A6472] dark:text-[#9AA8B8] mt-0.5">
                Pilih antara mode terang yang hangat atau mode gelap bernuansa biru tua
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Light Mode Card */}
              <button
                type="button"
                onClick={() => setTheme('light')}
                className={`p-5 rounded-[16px] border text-left transition-all cursor-pointer relative ${
                  theme === 'light'
                    ? 'border-[#1F3A5F] bg-[#E4EAF2]/50 ring-2 ring-[#1F3A5F]'
                    : 'border-[#E6DFD0] dark:border-[#283D56] hover:bg-[#FAF6EE] bg-[#FFFDF8] dark:bg-[#17293E]'
                }`}
              >
                {theme === 'light' && (
                  <span className="absolute top-4 right-4 text-[#1F3A5F]">
                    <CheckCircle2 className="w-5 h-5 fill-[#1F3A5F] text-white" />
                  </span>
                )}
                <div className="w-10 h-10 rounded-[12px] bg-[#FAF6EE] text-[#1F3A5F] flex items-center justify-center mb-3 border border-[#E6DFD0]">
                  <Sun className="w-5 h-5 text-[#F2B544]" />
                </div>
                <h4 className="text-[16px] font-bold text-[#1F3A5F] dark:text-[#FAF6EE]">Mode Terang (Light Mode)</h4>
                <p className="text-[14px] text-[#5A6472] dark:text-[#9AA8B8] mt-1 leading-relaxed">
                  Tampilan krem hangat (#FAF6EE), kontras tinggi, sangat cocok untuk pencetakan laporan dan penggunaan siang hari.
                </p>
              </button>

              {/* Dark Mode Card */}
              <button
                type="button"
                onClick={() => setTheme('dark')}
                className={`p-5 rounded-[16px] border text-left transition-all cursor-pointer relative ${
                  theme === 'dark'
                    ? 'border-[#F2B544] bg-[#1F3A5F]/40 ring-2 ring-[#F2B544]'
                    : 'border-[#E6DFD0] dark:border-[#283D56] hover:bg-[#FAF6EE] bg-[#FFFDF8] dark:bg-[#17293E]'
                }`}
              >
                {theme === 'dark' && (
                  <span className="absolute top-4 right-4 text-[#F2B544]">
                    <CheckCircle2 className="w-5 h-5 fill-[#F2B544] text-[#1F3A5F]" />
                  </span>
                )}
                <div className="w-10 h-10 rounded-[12px] bg-[#0E1B2C] text-[#FAF6EE] flex items-center justify-center mb-3 border border-[#283D56]">
                  <Moon className="w-5 h-5 text-[#F2B544]" />
                </div>
                <h4 className="text-[16px] font-bold text-[#1F3A5F] dark:text-[#FAF6EE]">Mode Gelap (Dark Mode)</h4>
                <p className="text-[14px] text-[#5A6472] dark:text-[#9AA8B8] mt-1 leading-relaxed">
                  Tampilan bernuansa biru tua sangat gelap (#0E1B2C), mengurangi silau mata saat presentasi UKK di proyektor.
                </p>
              </button>
            </div>
          </div>

          {/* Cloudflare Pages Deployment Guide */}
          <div className="simo-card p-6 space-y-4">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-[10px] bg-[#E4EAF2] text-[#1F3A5F] dark:bg-[#1F3A5F]/40 dark:text-[#FAF6EE] flex items-center justify-center">
                <Cloud className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-[17px] font-extrabold text-[#1F3A5F] dark:text-[#FAF6EE]">Panduan Deployment ke Cloudflare Pages</h3>
                <p className="text-[14px] text-[#5A6472] dark:text-[#9AA8B8]">Hosting gratis, kilat, dan aman untuk pengujian UKK</p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-[14px]">
              <div className="p-4 bg-[#FAF6EE] dark:bg-[#0E1B2C] rounded-[14px] border border-[#E6DFD0] dark:border-[#283D56]">
                <p className="font-bold text-[#1F3A5F] dark:text-[#FAF6EE]">1. Build Command</p>
                <code className="text-[13px] font-mono bg-[#FFFDF8] dark:bg-[#17293E] px-2.5 py-1.5 rounded-[8px] border border-[#E6DFD0] dark:border-[#283D56] text-[#1F3A5F] dark:text-[#F2B544] block mt-1.5 font-bold">
                  npm run build
                </code>
              </div>
              <div className="p-4 bg-[#FAF6EE] dark:bg-[#0E1B2C] rounded-[14px] border border-[#E6DFD0] dark:border-[#283D56]">
                <p className="font-bold text-[#1F3A5F] dark:text-[#FAF6EE]">2. Output Directory</p>
                <code className="text-[13px] font-mono bg-[#FFFDF8] dark:bg-[#17293E] px-2.5 py-1.5 rounded-[8px] border border-[#E6DFD0] dark:border-[#283D56] text-[#1F3A5F] dark:text-[#F2B544] block mt-1.5 font-bold">
                  dist
                </code>
              </div>
              <div className="p-4 bg-[#FAF6EE] dark:bg-[#0E1B2C] rounded-[14px] border border-[#E6DFD0] dark:border-[#283D56]">
                <p className="font-bold text-[#1F3A5F] dark:text-[#FAF6EE]">3. Node Version</p>
                <code className="text-[13px] font-mono bg-[#FFFDF8] dark:bg-[#17293E] px-2.5 py-1.5 rounded-[8px] border border-[#E6DFD0] dark:border-[#283D56] text-[#1F3A5F] dark:text-[#F2B544] block mt-1.5 font-bold">
                  NODE_VERSION: 20+
                </code>
              </div>
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
              <div className="flex items-center justify-between">
                <span className="font-bold text-[#1F3A5F] dark:text-[#FAF6EE]">Mode Penyimpanan Aktif:</span>
                <span className="simo-badge-blue">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  {isCloud ? 'Supabase Cloud Database Terkoneksi' : 'Dual-Mode (Local Persisted)'}
                </span>
              </div>
              <p className="text-[13px] text-[#5A6472] dark:text-[#9AA8B8] leading-relaxed">
                Semua data keanggotaan, iuran kas, jobdesk tugas panitia, dan presensi biometrik tersimpan otomatis di penyimpanan lokal browser Anda. Bebas risiko offline saat presentasi UKK di hadapan dewan penguji.
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
                  <h3 className="text-[16px] font-bold text-[#1F3A5F] dark:text-[#FAF6EE]">Reset Seluruh Data ke Nilai Default UKK</h3>
                  <p className="text-[14px] text-[#5A6472] dark:text-[#9AA8B8] mt-0.5 leading-relaxed">
                    Menghapus data ubahan lokal dan mengembalikan data anggota demo, jadwal rapat, proker, dan transaksi kas awal.
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setIsResetModalOpen(true)}
                className="simo-btn-outline min-h-[44px] px-5 rounded-[12px] text-[14px] font-bold cursor-pointer shrink-0"
              >
                Reset ke Default
              </button>
            </div>
          </div>
        </div>
      )}

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

import React, { useState } from 'react';
import {
  Settings,
  Database,
  RefreshCw,
  Cloud,
  CheckCircle2,
  Building2,
  Wallet,
  Palette,
  Download,
  Upload,
  Sun,
  Moon,
  Plus,
  Trash2,
  Mail,
  Phone,
  Globe,
  MapPin,
  ShieldCheck,
  UserCheck,
  CreditCard,
  Calendar,
  AlertTriangle,
  Save,
  Sparkles,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { isSupabaseConfigured } from '../../lib/supabase';
import { formatRupiah, parseFormattedNumber } from '../../lib/utils';
import { ImagePicker } from '../../components/common/ImagePicker';

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

  const [activeTab, setActiveTab] = useState<'profil' | 'keuangan' | 'tampilan' | 'data'>('profil');
  const isCloud = isSupabaseConfigured();

  // Form states for Profil Organisasi
  const [profileForm, setProfileForm] = useState({
    name: orgProfile.name,
    schoolName: orgProfile.schoolName,
    motto: orgProfile.motto || 'Kreatif, Kolaboratif, Berkarakter & Berprestasi di Era Digital',
    academicYear: orgProfile.academicYear,
    address: orgProfile.address,
    phone: orgProfile.phone,
    email: orgProfile.email,
    instagram: orgProfile.instagram,
    vision: orgProfile.vision,
    mission: [...orgProfile.mission],
    headmasterName: orgProfile.headmasterName,
    nipHeadmaster: orgProfile.nipHeadmaster || '19680315 199403 2 004',
    pembinaName: orgProfile.pembinaName,
    nipPembina: orgProfile.nipPembina || '19750812 200212 1 003',
    ketuaName: orgProfile.ketuaName,
    nisnKetua: orgProfile.nisnKetua || '0081234501',
    logoUrl: orgProfile.logoUrl,
  });

  const [newMissionItem, setNewMissionItem] = useState('');

  // Form states for Keuangan Organisasi
  const [financeForm, setFinanceForm] = useState({
    monthlyDueAmountRaw: String(orgProfile.monthlyDueAmount || 15000),
    dueDueDay: orgProfile.dueDueDay || 10,
    bankName: orgProfile.bankName || 'Bank BCA / Seabank / DANA',
    bankAccountNumber: orgProfile.bankAccountNumber || '8271-9920-1123',
    bankAccountHolder: orgProfile.bankAccountHolder || 'KAS OSIS SMKN 1 CERDAS (Bendahara)',
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
      phone: profileForm.phone,
      email: profileForm.email,
      instagram: profileForm.instagram,
      vision: profileForm.vision,
      mission: profileForm.mission,
      headmasterName: profileForm.headmasterName,
      nipHeadmaster: profileForm.nipHeadmaster,
      pembinaName: profileForm.pembinaName,
      nipPembina: profileForm.nipPembina,
      ketuaName: profileForm.ketuaName,
      nisnKetua: profileForm.nisnKetua,
      logoUrl: profileForm.logoUrl,
    });
    showToast('Identitas & profil organisasi berhasil disimpan!', 'success');
  };

  // Add Mission Item
  const handleAddMission = () => {
    if (!newMissionItem.trim()) return;
    setProfileForm({
      ...profileForm,
      mission: [...profileForm.mission, newMissionItem.trim()],
    });
    setNewMissionItem('');
  };

  // Remove Mission Item
  const handleRemoveMission = (index: number) => {
    const updated = profileForm.mission.filter((_, i) => i !== index);
    setProfileForm({ ...profileForm, mission: updated });
  };

  // Save Keuangan
  const handleSaveFinance = (e: React.FormEvent) => {
    e.preventDefault();
    updateOrgProfile({
      monthlyDueAmount: parseFormattedNumber(financeForm.monthlyDueAmountRaw),
      dueDueDay: Number(financeForm.dueDueDay),
      bankName: financeForm.bankName,
      bankAccountNumber: financeForm.bankAccountNumber,
      bankAccountHolder: financeForm.bankAccountHolder,
    });
    showToast('Kebijakan iuran kas & rekening resmi berhasil diperbarui!', 'success');
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

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-colors">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-indigo-50 dark:bg-indigo-950/70 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
              <Settings className="w-4 h-4" />
            </div>
            <h2 className="text-base font-bold text-slate-900 dark:text-white">
              Pusat Pengaturan Organisasi & Sistem
            </h2>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Konfigurasi identitas legalitas sekolah, kebijakan kas, mode tema tampilan, dan cadangan data
          </p>
        </div>

        {/* Quick Theme Badge */}
        <button
          onClick={toggleTheme}
          className="flex items-center gap-2 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 text-xs font-bold text-slate-700 dark:text-slate-200 hover:border-indigo-400 cursor-pointer transition-colors shrink-0"
        >
          {theme === 'dark' ? (
            <>
              <Sun className="w-4 h-4 text-amber-400" />
              <span>Mode Gelap (Aktif)</span>
            </>
          ) : (
            <>
              <Moon className="w-4 h-4 text-indigo-600" />
              <span>Mode Terang (Aktif)</span>
            </>
          )}
        </button>
      </div>

      {/* Settings Navigation Tabs */}
      <div className="flex p-1 bg-slate-100 dark:bg-slate-900 rounded-2xl overflow-x-auto text-xs font-bold border border-slate-200/80 dark:border-slate-800">
        <button
          onClick={() => setActiveTab('profil')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl whitespace-nowrap transition-all cursor-pointer ${
            activeTab === 'profil'
              ? 'bg-white dark:bg-slate-800 text-indigo-700 dark:text-indigo-300 shadow-xs'
              : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
          }`}
        >
          <Building2 className="w-4 h-4" />
          <span>Identitas & Legalitas OSIS</span>
        </button>
        <button
          onClick={() => setActiveTab('keuangan')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl whitespace-nowrap transition-all cursor-pointer ${
            activeTab === 'keuangan'
              ? 'bg-white dark:bg-slate-800 text-indigo-700 dark:text-indigo-300 shadow-xs'
              : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
          }`}
        >
          <Wallet className="w-4 h-4" />
          <span>Kebijakan Iuran & Kas</span>
        </button>
        <button
          onClick={() => setActiveTab('tampilan')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl whitespace-nowrap transition-all cursor-pointer ${
            activeTab === 'tampilan'
              ? 'bg-white dark:bg-slate-800 text-indigo-700 dark:text-indigo-300 shadow-xs'
              : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
          }`}
        >
          <Palette className="w-4 h-4" />
          <span>Preferensi Tampilan & Mode</span>
        </button>
        <button
          onClick={() => setActiveTab('data')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl whitespace-nowrap transition-all cursor-pointer ${
            activeTab === 'data'
              ? 'bg-white dark:bg-slate-800 text-indigo-700 dark:text-indigo-300 shadow-xs'
              : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
          }`}
        >
          <Database className="w-4 h-4" />
          <span>Cadangan & Pemeliharaan</span>
        </button>
      </div>

      {/* ======================================================== */}
      {/* TAB 1: IDENTITAS & PROFIL LEGALITAS ORGANISASI           */}
      {/* ======================================================== */}
      {activeTab === 'profil' && (
        <form onSubmit={handleSaveProfile} className="space-y-6 animate-in fade-in duration-200">
          <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-2xs space-y-5 transition-colors">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                  Profil Resmi Lembaga Sekolah & Organisasi
                </h3>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  Data ini dicantumkan pada kop surat resmi, dokumen proposal, kartu tanda anggota (KTA), dan LPJ
                </p>
              </div>
              <button
                type="submit"
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold shadow-xs flex items-center gap-1.5 cursor-pointer transition-colors"
              >
                <Save className="w-3.5 h-3.5" />
                <span>Simpan Perubahan</span>
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
                  Nama Organisasi <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={profileForm.name}
                  onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })}
                  placeholder="OSIS SMK Negeri 1 Cerdas Bangsa"
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 focus:outline-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
                  Nama Sekolah / Instansi Induk <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={profileForm.schoolName}
                  onChange={(e) => setProfileForm({ ...profileForm, schoolName: e.target.value })}
                  placeholder="SMK Negeri 1 Cerdas Bangsa"
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 focus:outline-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
                  Motto / Slogan Organisasi
                </label>
                <input
                  type="text"
                  value={profileForm.motto}
                  onChange={(e) => setProfileForm({ ...profileForm, motto: e.target.value })}
                  placeholder="Kreatif, Kolaboratif, Berkarakter & Berprestasi"
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 focus:outline-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
                  Masa Bakti / Tahun Ajaran Aktif
                </label>
                <input
                  type="text"
                  required
                  value={profileForm.academicYear}
                  onChange={(e) => setProfileForm({ ...profileForm, academicYear: e.target.value })}
                  placeholder="2025/2026"
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 focus:outline-indigo-500"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
                  Alamat Sekretariat / Kampus Sekolah
                </label>
                <div className="relative">
                  <MapPin className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    value={profileForm.address}
                    onChange={(e) => setProfileForm({ ...profileForm, address: e.target.value })}
                    placeholder="Jl. Merdeka Belajar No. 45, Kompleks Pendidikan, Jakarta"
                    className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 focus:outline-indigo-500"
                  />
                </div>
              </div>
            </div>

            {/* Kontak Resmi */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
                  Email Resmi OSIS
                </label>
                <div className="relative">
                  <Mail className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="email"
                    value={profileForm.email}
                    onChange={(e) => setProfileForm({ ...profileForm, email: e.target.value })}
                    placeholder="osis@smkn1cerdas.sch.id"
                    className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 focus:outline-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
                  No. Telepon / WhatsApp
                </label>
                <div className="relative">
                  <Phone className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    value={profileForm.phone}
                    onChange={(e) => setProfileForm({ ...profileForm, phone: e.target.value })}
                    placeholder="0812-3456-7890"
                    className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 focus:outline-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
                  Akun Instagram / Media Sosial
                </label>
                <div className="relative">
                  <Globe className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    value={profileForm.instagram}
                    onChange={(e) => setProfileForm({ ...profileForm, instagram: e.target.value })}
                    placeholder="@osis_smkn1cerdas"
                    className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 focus:outline-indigo-500"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Pejabat Penandatangan Resmi (Legalitas) */}
          <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-2xs space-y-4 transition-colors">
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <UserCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                Pejabat Penandatangan Resmi (Kop Surat & Lembar Pengesahan)
              </h3>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                Nama dan NIP/NISN ini otomatis mengisi kolom tanda tangan laporan, proposal kegiatan, dan lembar LPJ
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
              {/* Kepala Sekolah */}
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700 space-y-3">
                <span className="font-bold text-slate-800 dark:text-slate-200 block border-b border-slate-200 dark:border-slate-700 pb-1.5">
                  1. Kepala Sekolah
                </span>
                <div>
                  <label className="block text-[11px] text-slate-500 dark:text-slate-400 mb-1">Nama Lengkap & Gelar</label>
                  <input
                    type="text"
                    value={profileForm.headmasterName}
                    onChange={(e) => setProfileForm({ ...profileForm, headmasterName: e.target.value })}
                    className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100"
                  />
                </div>
                <div>
                  <label className="block text-[11px] text-slate-500 dark:text-slate-400 mb-1">NIP Kepala Sekolah</label>
                  <input
                    type="text"
                    value={profileForm.nipHeadmaster}
                    onChange={(e) => setProfileForm({ ...profileForm, nipHeadmaster: e.target.value })}
                    className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100"
                  />
                </div>
              </div>

              {/* Pembina OSIS */}
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700 space-y-3">
                <span className="font-bold text-slate-800 dark:text-slate-200 block border-b border-slate-200 dark:border-slate-700 pb-1.5">
                  2. Pembina OSIS (Guru)
                </span>
                <div>
                  <label className="block text-[11px] text-slate-500 dark:text-slate-400 mb-1">Nama Lengkap & Gelar</label>
                  <input
                    type="text"
                    value={profileForm.pembinaName}
                    onChange={(e) => setProfileForm({ ...profileForm, pembinaName: e.target.value })}
                    className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100"
                  />
                </div>
                <div>
                  <label className="block text-[11px] text-slate-500 dark:text-slate-400 mb-1">NIP Pembina</label>
                  <input
                    type="text"
                    value={profileForm.nipPembina}
                    onChange={(e) => setProfileForm({ ...profileForm, nipPembina: e.target.value })}
                    className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100"
                  />
                </div>
              </div>

              {/* Ketua OSIS */}
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700 space-y-3">
                <span className="font-bold text-slate-800 dark:text-slate-200 block border-b border-slate-200 dark:border-slate-700 pb-1.5">
                  3. Ketua Umum OSIS
                </span>
                <div>
                  <label className="block text-[11px] text-slate-500 dark:text-slate-400 mb-1">Nama Ketua OSIS</label>
                  <input
                    type="text"
                    value={profileForm.ketuaName}
                    onChange={(e) => setProfileForm({ ...profileForm, ketuaName: e.target.value })}
                    className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100"
                  />
                </div>
                <div>
                  <label className="block text-[11px] text-slate-500 dark:text-slate-400 mb-1">NISN Ketua OSIS</label>
                  <input
                    type="text"
                    value={profileForm.nisnKetua}
                    onChange={(e) => setProfileForm({ ...profileForm, nisnKetua: e.target.value })}
                    className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Visi & Misi Organisasi */}
          <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-2xs space-y-4 transition-colors">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-500" />
              Visi & Misi Organisasi
            </h3>

            <div>
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
                Visi Organisasi
              </label>
              <textarea
                rows={2}
                value={profileForm.vision}
                onChange={(e) => setProfileForm({ ...profileForm, vision: e.target.value })}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 focus:outline-indigo-500 leading-relaxed"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1.5">
                Daftar Misi Organisasi
              </label>
              <div className="space-y-2 mb-3">
                {profileForm.mission.map((item, idx) => (
                  <div
                    key={idx}
                    className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700 flex items-center justify-between gap-3 text-xs"
                  >
                    <span className="text-slate-700 dark:text-slate-200 flex-1 leading-relaxed">
                      <strong className="text-indigo-600 dark:text-indigo-400 mr-2">{idx + 1}.</strong>
                      {item}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleRemoveMission(idx)}
                      className="p-1 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 rounded cursor-pointer"
                      title="Hapus butir misi ini"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>

              {/* Add Mission Input */}
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newMissionItem}
                  onChange={(e) => setNewMissionItem(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddMission();
                    }
                  }}
                  placeholder="Ketik butir misi baru..."
                  className="flex-1 px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 focus:outline-indigo-500"
                />
                <button
                  type="button"
                  onClick={handleAddMission}
                  className="px-3.5 py-2 bg-indigo-50 dark:bg-indigo-950/70 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800 hover:bg-indigo-100 rounded-xl text-xs font-bold flex items-center gap-1 cursor-pointer transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Tambah</span>
                </button>
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                type="submit"
                className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold shadow-xs flex items-center gap-2 cursor-pointer transition-colors"
              >
                <Save className="w-4 h-4" />
                <span>Simpan Semua Pengaturan Profil</span>
              </button>
            </div>
          </div>
        </form>
      )}

      {/* ======================================================== */}
      {/* TAB 2: KEBIJAKAN KEUANGAN & KAS ORGANISASI               */}
      {/* ======================================================== */}
      {activeTab === 'keuangan' && (
        <form onSubmit={handleSaveFinance} className="space-y-6 animate-in fade-in duration-200">
          <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-2xs space-y-5 transition-colors">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <Wallet className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                  Ketentuan Iuran Kas Anggota & Rekening Penampung
                </h3>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  Besaran tarif iuran bulanan dan rekening resmi yang ditampilkan ke siswa saat pembayaran kas
                </p>
              </div>
              <button
                type="submit"
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold shadow-xs flex items-center gap-1.5 cursor-pointer transition-colors"
              >
                <Save className="w-3.5 h-3.5" />
                <span>Simpan Kebijakan Kas</span>
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
                  Nominal Iuran Wajib Kas Per Bulan (Rp)
                </label>
                <div className="relative">
                  <span className="text-xs font-bold text-slate-400 absolute left-3 top-2.5">Rp</span>
                  <input
                    type="number"
                    value={financeForm.monthlyDueAmountRaw}
                    onChange={(e) => setFinanceForm({ ...financeForm, monthlyDueAmountRaw: e.target.value })}
                    className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 focus:outline-emerald-500 font-bold"
                  />
                </div>
                <p className="text-[10px] text-slate-400 mt-1">
                  Tertulis: {formatRupiah(Number(financeForm.monthlyDueAmountRaw) || 0)} per anggota
                </p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
                  Tanggal Jatuh Tempo Tiap Bulan
                </label>
                <div className="relative">
                  <Calendar className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="number"
                    min="1"
                    max="28"
                    value={financeForm.dueDueDay}
                    onChange={(e) => setFinanceForm({ ...financeForm, dueDueDay: Number(e.target.value) })}
                    className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 focus:outline-emerald-500"
                  />
                </div>
                <p className="text-[10px] text-slate-400 mt-1">
                  Pembayaran lewat tanggal {financeForm.dueDueDay} berstatus tagihan berjalan
                </p>
              </div>
            </div>

            {/* Rekening Resmi */}
            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-3">
              <span className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                <CreditCard className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                Informasi Rekening / E-Wallet Resmi Bendahara OSIS
              </span>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                <div>
                  <label className="block text-[11px] text-slate-500 dark:text-slate-400 mb-1">Nama Bank / Platform</label>
                  <input
                    type="text"
                    value={financeForm.bankName}
                    onChange={(e) => setFinanceForm({ ...financeForm, bankName: e.target.value })}
                    placeholder="BCA / Seabank / DANA"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100"
                  />
                </div>

                <div>
                  <label className="block text-[11px] text-slate-500 dark:text-slate-400 mb-1">Nomor Rekening / No. HP</label>
                  <input
                    type="text"
                    value={financeForm.bankAccountNumber}
                    onChange={(e) => setFinanceForm({ ...financeForm, bankAccountNumber: e.target.value })}
                    placeholder="8271-9920-1123"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 font-mono"
                  />
                </div>

                <div>
                  <label className="block text-[11px] text-slate-500 dark:text-slate-400 mb-1">Atas Nama Rekening</label>
                  <input
                    type="text"
                    value={financeForm.bankAccountHolder}
                    onChange={(e) => setFinanceForm({ ...financeForm, bankAccountHolder: e.target.value })}
                    placeholder="KAS OSIS SMKN 1 (Rizky A)"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100"
                  />
                </div>
              </div>
            </div>
          </div>
        </form>
      )}

      {/* ======================================================== */}
      {/* TAB 3: PREFERENSI TAMPILAN & MODE SISTEM                */}
      {/* ======================================================== */}
      {activeTab === 'tampilan' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          {/* Theme Selector */}
          <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-2xs space-y-4 transition-colors">
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Palette className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                Mode Tampilan Aplikasi (Theme Appearance)
              </h3>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                Pilih antara mode terang yang bersih atau mode gelap yang nyaman di mata untuk presentasi UKK
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Light Mode Card */}
              <button
                type="button"
                onClick={() => setTheme('light')}
                className={`p-4 rounded-2xl border text-left transition-all cursor-pointer relative ${
                  theme === 'light'
                    ? 'border-indigo-600 bg-indigo-50/50 dark:bg-indigo-950/30 ring-2 ring-indigo-600'
                    : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-white dark:bg-slate-800'
                }`}
              >
                {theme === 'light' && (
                  <span className="absolute top-3 right-3 text-indigo-600">
                    <CheckCircle2 className="w-5 h-5 fill-indigo-600 text-white" />
                  </span>
                )}
                <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center mb-3">
                  <Sun className="w-5 h-5" />
                </div>
                <h4 className="text-xs font-bold text-slate-900 dark:text-white">Mode Terang (Light Mode)</h4>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                  Tampilan putih bersih, kontras tinggi, sangat cocok untuk pencetakan laporan dan penggunaan siang hari.
                </p>
              </button>

              {/* Dark Mode Card */}
              <button
                type="button"
                onClick={() => setTheme('dark')}
                className={`p-4 rounded-2xl border text-left transition-all cursor-pointer relative ${
                  theme === 'dark'
                    ? 'border-indigo-600 bg-indigo-50/50 dark:bg-indigo-950/30 ring-2 ring-indigo-600'
                    : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-white dark:bg-slate-800'
                }`}
              >
                {theme === 'dark' && (
                  <span className="absolute top-3 right-3 text-indigo-600 dark:text-indigo-400">
                    <CheckCircle2 className="w-5 h-5 fill-indigo-600 text-white" />
                  </span>
                )}
                <div className="w-10 h-10 rounded-xl bg-slate-900 text-indigo-400 flex items-center justify-center mb-3 border border-slate-700">
                  <Moon className="w-5 h-5" />
                </div>
                <h4 className="text-xs font-bold text-slate-900 dark:text-white">Mode Gelap (Dark Mode)</h4>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                  Tampilan modern bernuansa gelap elegan, mengurangi silau mata saat presentasi UKK di proyektor.
                </p>
              </button>
            </div>
          </div>

          {/* Cloudflare Pages Deployment Guide */}
          <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-2xs space-y-3 transition-colors">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-blue-50 dark:bg-blue-950/70 text-blue-600 dark:text-blue-400 flex items-center justify-center">
                <Cloud className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">Panduan Deployment ke Cloudflare Pages</h3>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">Hosting gratis, kilat, dan aman untuk pengujian UKK</p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 text-xs">
              <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
                <p className="font-bold text-slate-800 dark:text-slate-200">1. Build Command</p>
                <code className="text-[11px] font-mono bg-white dark:bg-slate-900 px-2 py-1 rounded border border-slate-200 dark:border-slate-700 text-indigo-600 dark:text-indigo-400 block mt-1">
                  npm run build
                </code>
              </div>
              <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
                <p className="font-bold text-slate-800 dark:text-slate-200">2. Output Directory</p>
                <code className="text-[11px] font-mono bg-white dark:bg-slate-900 px-2 py-1 rounded border border-slate-200 dark:border-slate-700 text-indigo-600 dark:text-indigo-400 block mt-1">
                  dist
                </code>
              </div>
              <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
                <p className="font-bold text-slate-800 dark:text-slate-200">3. Node Version</p>
                <code className="text-[11px] font-mono bg-white dark:bg-slate-900 px-2 py-1 rounded border border-slate-200 dark:border-slate-700 text-indigo-600 dark:text-indigo-400 block mt-1">
                  NODE_VERSION: 20+
                </code>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* TAB 4: CADANGAN & PEMELIHARAAN BASIS DATA               */}
      {/* ======================================================== */}
      {activeTab === 'data' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          {/* Dual-Mode Architecture Status */}
          <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-2xs space-y-4 transition-colors">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-emerald-50 dark:bg-emerald-950/70 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                <Database className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">Status Penyimpanan Data UKK</h3>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">Arsitektur Dual-Mode Resilient</p>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 space-y-2 text-xs">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-slate-700 dark:text-slate-300">Mode Penyimpanan Aktif:</span>
                <span className="inline-flex items-center gap-1 font-bold text-emerald-700 dark:text-emerald-400 bg-emerald-100 dark:bg-emerald-950/80 px-2.5 py-0.5 rounded-full text-[10px]">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  {isCloud ? 'Supabase Cloud Database Terkoneksi' : 'Dual-Mode (Local Persisted)'}
                </span>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
                Semua data keanggotaan, iuran kas, jobdesk tugas panitia, dan presensi biometrik tersimpan otomatis di penyimpanan lokal browser Anda. Bebas risiko offline saat presentasi UKK di hadapan dewan penguji.
              </p>
            </div>
          </div>

          {/* Backup & Restore Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Download Backup */}
            <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-2xs space-y-3 transition-colors flex flex-col justify-between">
              <div>
                <div className="w-9 h-9 rounded-xl bg-indigo-50 dark:bg-indigo-950/70 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mb-2">
                  <Download className="w-4 h-4" />
                </div>
                <h4 className="text-xs font-bold text-slate-900 dark:text-white">Ekspor Cadangan Lengkap (.JSON)</h4>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                  Unduh seluruh database (anggota, kas, proker, rapat, surat, arsip) ke dalam satu file JSON untuk dipindahkan ke komputer lain.
                </p>
              </div>

              <button
                type="button"
                onClick={handleExportBackup}
                className="w-full mt-3 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold shadow-xs flex items-center justify-center gap-1.5 cursor-pointer transition-colors"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Unduh Cadangan JSON</span>
              </button>
            </div>

            {/* Restore from File */}
            <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-2xs space-y-3 transition-colors flex flex-col justify-between">
              <div>
                <div className="w-9 h-9 rounded-xl bg-emerald-50 dark:bg-emerald-950/70 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mb-2">
                  <Upload className="w-4 h-4" />
                </div>
                <h4 className="text-xs font-bold text-slate-900 dark:text-white">Pulihkan Data dari Cadangan</h4>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                  Unggah file cadangan JSON yang pernah Anda unduh sebelumnya untuk mengembalikan seluruh kondisi aplikasi.
                </p>
              </div>

              <label className="w-full mt-3 py-2.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer transition-colors">
                <Upload className="w-3.5 h-3.5" />
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
          <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-rose-200 dark:border-rose-900/60 shadow-2xs space-y-3 transition-colors">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-xl bg-rose-50 dark:bg-rose-950/70 text-rose-600 dark:text-rose-400 flex items-center justify-center shrink-0 mt-0.5">
                  <AlertTriangle className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-xs font-bold text-slate-900 dark:text-white">Reset Seluruh Data ke Nilai Default UKK</h3>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 leading-relaxed">
                    Menghapus data ubahan lokal dan mengembalikan data anggota demo, jadwal rapat, proker, dan transaksi kas awal.
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => {
                  if (confirm('Apakah Anda yakin ingin me-reset seluruh data ke nilai awal default UKK? Data yang belum dicadangkan akan hilang.')) {
                    resetAllData();
                  }
                }}
                className="px-4 py-2 bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/40 dark:hover:bg-rose-900/60 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800 rounded-xl text-xs font-bold transition-all cursor-pointer shrink-0"
              >
                Reset ke Default
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

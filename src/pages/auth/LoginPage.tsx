import React, { useState } from 'react';
import {
  UserCheck,
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  ArrowLeft,
  Sun,
  Moon,
  Sparkles,
  AlertCircle,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { UserRole, Member } from '../../types';

interface LoginPageProps {
  onBackToPublic: () => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({ onBackToPublic }) => {
  const {
    members,
    setCurrentUser,
    setCurrentRole,
    setActivePage,
    showToast,
    theme,
    toggleTheme,
    orgProfile,
  } = useApp();

  const [username, setUsername] = useState('0081234501'); // Default Ketua
  const [password, setPassword] = useState('osis2025');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedPreset, setSelectedPreset] = useState<UserRole>('ketua');
  const [errorAlert, setErrorAlert] = useState<string | null>(null);

  // Quick Account Presets for seamless testing
  const demoAccounts: {
    role: UserRole;
    name: string;
    identifier: string;
    label: string;
    badgeColor: string;
  }[] = [
    {
      role: 'ketua',
      name: 'Fajar Pratama',
      identifier: '0081234501',
      label: 'Ketua Umum',
      badgeColor: 'bg-[#FBEBC8] text-[#7A4B00] border-[#F2B544]',
    },
    {
      role: 'sekretaris',
      name: 'Anisa Rahmawati',
      identifier: '0071234502',
      label: 'Sekretaris',
      badgeColor: 'bg-[#E4EAF2] text-[#1F3A5F] border-[#1F3A5F]/20',
    },
    {
      role: 'bendahara',
      name: 'Rizky Alamsyah',
      identifier: '0071234503',
      label: 'Bendahara',
      badgeColor: 'bg-[#E4EAF2] text-[#1F3A5F] border-[#1F3A5F]/20',
    },
    {
      role: 'pembina',
      name: 'Drs. H. Bambang Sudiro',
      identifier: 'pembina@smk.test',
      label: 'Pembina Guru',
      badgeColor: 'bg-[#FBEBC8] text-[#7A4B00] border-[#F2B544]',
    },
    {
      role: 'admin',
      name: 'Admin IT Sekolah',
      identifier: 'admin@smk.test',
      label: 'Super Admin',
      badgeColor: 'bg-[#1F3A5F] text-[#FAF6EE] border-[#162B46]',
    },
  ];

  const handleSelectPreset = (preset: typeof demoAccounts[0]) => {
    setSelectedPreset(preset.role);
    setUsername(preset.identifier);
    setPassword('osis2025');
    setErrorAlert(null);
    showToast(`Akun ${preset.label} (${preset.name}) terpilih.`, 'info');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorAlert(null);

    const cleanUser = username.trim();
    const cleanPass = password.trim();

    if (!cleanUser) {
      setErrorAlert('Harap masukkan NISN atau email akun pengurus.');
      showToast('Harap masukkan NISN atau email.', 'error');
      return;
    }

    if (!cleanPass) {
      setErrorAlert('Harap masukkan kata sandi.');
      showToast('Harap masukkan kata sandi.', 'error');
      return;
    }

    // Validasi Kata Sandi Pengurus (Default resmi: osis2025)
    if (cleanPass !== 'osis2025') {
      setErrorAlert('Kata sandi salah! Kata sandi default pengurus adalah: osis2025');
      showToast('Kata sandi tidak sesuai.', 'error');
      return;
    }

    setIsLoading(true);

    setTimeout(() => {
      // Cari anggota berdasarkan NISN, email, atau preset akun demo
      const matched = members.find(
        (m) =>
          m.nisn.toLowerCase() === cleanUser.toLowerCase() ||
          m.email.toLowerCase() === cleanUser.toLowerCase() ||
          (cleanUser === 'admin@smk.test' && m.role === 'admin') ||
          (cleanUser === 'pembina@smk.test' && m.role === 'pembina')
      );

      // Cek apakah user cocok dengan salah satu preset demo
      const matchedPreset = demoAccounts.find(
        (acc) => acc.identifier.toLowerCase() === cleanUser.toLowerCase()
      );

      if (!matched && !matchedPreset) {
        setIsLoading(false);
        setErrorAlert(
          `Akun "${cleanUser}" tidak terdaftar dalam database pengurus OSIS. Silakan periksa kembali atau pilih salah satu akun demo di atas.`
        );
        showToast('Akun tidak ditemukan!', 'error');
        return;
      }

      const targetMember: Member = matched || {
        id: `mem-${matchedPreset ? matchedPreset.role : 'custom'}`,
        nisn: cleanUser,
        fullName: matchedPreset ? matchedPreset.name : 'Pengurus OSIS',
        email: cleanUser.includes('@') ? cleanUser : `${cleanUser}@smk.test`,
        role: matchedPreset ? matchedPreset.role : selectedPreset,
        grade: 'XI',
        classRoom: 'RPL 1',
        major: 'Rekayasa Perangkat Lunak',
        divisionId: 'div-bph',
        divisionName: 'Badan Pengurus Harian (BPH)',
        position: matchedPreset ? matchedPreset.label : 'Pengurus',
        phone: '081234567890',
        avatarUrl: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
        isActive: true,
        status: 'aktif',
        joinDate: '2024-07-15',
        generation: 'Angkatan 2024/2025',
      };

      setCurrentUser(targetMember);
      setCurrentRole(targetMember.role);
      setIsLoading(false);
      showToast(
        `Berhasil masuk! Selamat datang, ${targetMember.fullName} (${targetMember.role.replace('_', ' ').toUpperCase()}).`,
        'success'
      );
      setActivePage('dashboard');
    }, 400);
  };

  return (
    <div className="min-h-screen bg-[#FAF6EE] dark:bg-[#0E1B2C] text-[#1F3A5F] dark:text-[#FAF6EE] flex flex-col justify-between p-4 sm:p-6 transition-colors duration-200 relative selection:bg-[#FBEBC8] selection:text-[#7A4B00]">
      {/* Top Header Bar */}
      <div className="w-full max-w-5xl mx-auto flex items-center justify-between py-2">
        <button
          onClick={onBackToPublic}
          className="inline-flex items-center gap-2 px-3.5 py-2 rounded-[12px] text-sm font-bold text-[#1F3A5F] dark:text-[#FAF6EE] bg-[#FFFDF8] dark:bg-[#17293E] border border-[#E6DFD0] dark:border-[#283D56] hover:bg-[#E4EAF2] dark:hover:bg-[#213B5C] transition-colors cursor-pointer shadow-none"
        >
          <ArrowLeft className="w-4 h-4" strokeWidth={2.5} />
          <span>Kembali ke Portal Publik</span>
        </button>

        <button
          onClick={toggleTheme}
          className="w-10 h-10 flex items-center justify-center rounded-[12px] bg-[#FFFDF8] dark:bg-[#17293E] border border-[#E6DFD0] dark:border-[#283D56] text-[#5A6472] dark:text-[#9AA8B8] hover:text-[#1F3A5F] dark:hover:text-[#FAF6EE] transition-colors cursor-pointer"
          title={theme === 'dark' ? 'Mode Terang' : 'Mode Gelap'}
          aria-label="Ganti mode gelap/terang"
        >
          {theme === 'dark' ? (
            <Sun className="w-5 h-5 text-[#F2B544]" strokeWidth={2} />
          ) : (
            <Moon className="w-5 h-5 text-[#1F3A5F]" strokeWidth={2} />
          )}
        </button>
      </div>

      {/* Main Centered Login Card */}
      <div className="w-full max-w-md mx-auto my-auto py-6">
        <div className="bg-[#FFFDF8] dark:bg-[#17293E] rounded-[24px] border border-[#E6DFD0] dark:border-[#283D56] p-6 sm:p-8 shadow-none transition-all">
          {/* Card Header & Brand Logo */}
          <div className="flex flex-col items-center text-center space-y-3 pb-5 border-b border-[#E6DFD0] dark:border-[#283D56]">
            {/* The Official SIMO Logo */}
            {orgProfile.logoUrl ? (
              <img
                src={orgProfile.logoUrl}
                alt="Logo"
                className="w-14 h-14 rounded-[16px] object-cover border border-[#E6DFD0] dark:border-[#283D56] shadow-none"
                onError={(e) => {
                  (e.target as HTMLImageElement).style.display = 'none';
                  (e.target as HTMLElement).nextElementSibling?.classList.remove('hidden');
                }}
              />
            ) : null}
            <div
              className={`w-14 h-14 rounded-[16px] bg-[#1F3A5F] flex items-center justify-center text-[#FAF6EE] shadow-none ${
                orgProfile.logoUrl ? 'hidden' : ''
              }`}
            >
              <span className="w-6 h-6 rounded-full border-2 border-[#F2B544] flex items-center justify-center text-[12px] text-[#F2B544]">
                ●
              </span>
            </div>

            <div>
              <h1 className="text-xl sm:text-2xl font-black text-[#1F3A5F] dark:text-[#FAF6EE] tracking-tight">
                Masuk ke {orgProfile.appName || 'SIMO'}
              </h1>
              <p className="text-xs text-[#5A6472] dark:text-[#9AA8B8] font-medium mt-1">
                {orgProfile.academicYear ? `Periode ${orgProfile.academicYear} • ` : ''}Portal Manajemen Organisasi
              </p>
            </div>
          </div>

          {/* Quick Account Switcher Pills (Sangat ramah penguji & juri) */}
          <div className="pt-5 pb-3">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[12px] font-bold text-[#5A6472] dark:text-[#9AA8B8]">
                Pilih Akun Cepat (Mode Uji Coba)
              </span>
              <Sparkles className="w-3.5 h-3.5 text-[#F2B544]" />
            </div>
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none flex-nowrap">
              {demoAccounts.map((acc) => {
                const isSelected = selectedPreset === acc.role;
                return (
                  <button
                    key={acc.role}
                    type="button"
                    onClick={() => handleSelectPreset(acc)}
                    className={`px-3 py-1.5 rounded-[10px] text-[12px] font-extrabold whitespace-nowrap transition-all border cursor-pointer shrink-0 ${
                      isSelected
                        ? 'bg-[#1F3A5F] text-[#FAF6EE] border-[#1F3A5F]'
                        : 'bg-transparent text-[#5A6472] dark:text-[#9AA8B8] border-[#E6DFD0] dark:border-[#283D56] hover:bg-[#E4EAF2] dark:hover:bg-[#213B5C]'
                    }`}
                  >
                    {acc.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="space-y-4 pt-2">
            {/* Error Alert Box */}
            {errorAlert && (
              <div className="p-3.5 rounded-[12px] bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/60 flex items-start gap-2.5 text-red-700 dark:text-red-300 text-[13px] animate-fadeIn">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span className="font-semibold leading-relaxed">{errorAlert}</span>
              </div>
            )}
            {/* Username / NISN Input */}
            <div className="space-y-1.5">
              <label
                htmlFor="username-input"
                className="block text-[13px] font-bold text-[#1F3A5F] dark:text-[#FAF6EE]"
              >
                NISN atau Email Pengurus
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#5A6472] dark:text-[#9AA8B8]">
                  <UserCheck className="w-4 h-4" />
                </div>
                <input
                  id="username-input"
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="0081234501 atau email pengurus"
                  required
                  className="w-full pl-10 pr-4 py-2.5 rounded-[12px] bg-[#FAF6EE] dark:bg-[#1C3048] border border-[#E6DFD0] dark:border-[#283D56] text-[#1F3A5F] dark:text-[#FAF6EE] text-[14px] font-semibold focus:outline-none focus:border-[#1F3A5F] dark:focus:border-[#F2B544] transition-colors"
                />
              </div>
            </div>

            {/* Password Input */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label
                  htmlFor="password-input"
                  className="block text-[13px] font-bold text-[#1F3A5F] dark:text-[#FAF6EE]"
                >
                  Kata Sandi
                </label>
                <span className="text-[11px] font-semibold text-[#5A6472] dark:text-[#9AA8B8]">
                  Default: osis2025
                </span>
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#5A6472] dark:text-[#9AA8B8]">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  id="password-input"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Masukkan kata sandi"
                  required
                  className="w-full pl-10 pr-11 py-2.5 rounded-[12px] bg-[#FAF6EE] dark:bg-[#1C3048] border border-[#E6DFD0] dark:border-[#283D56] text-[#1F3A5F] dark:text-[#FAF6EE] text-[14px] font-semibold focus:outline-none focus:border-[#1F3A5F] dark:focus:border-[#F2B544] transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-[#5A6472] dark:text-[#9AA8B8] hover:text-[#1F3A5F] dark:hover:text-[#FAF6EE] cursor-pointer"
                  aria-label="Lihat kata sandi"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Remember Me & Note */}
            <div className="flex items-center justify-between pt-1 text-[13px]">
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-4 h-4 rounded border-[#E6DFD0] text-[#1F3A5F] focus:ring-0 cursor-pointer accent-[#1F3A5F]"
                />
                <span className="text-[#5A6472] dark:text-[#9AA8B8] font-medium">
                  Ingat sesi di perangkat ini
                </span>
              </label>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full min-h-[46px] mt-2 bg-[#F2B544] hover:bg-[#E0A12F] text-[#1F3A5F] font-black text-[14px] sm:text-[15px] rounded-[12px] flex items-center justify-center gap-2 transition-all cursor-pointer shadow-none disabled:opacity-70"
            >
              {isLoading ? (
                <div className="flex items-center gap-2">
                  <span className="w-4 h-4 border-2 border-[#1F3A5F] border-t-transparent rounded-full animate-spin" />
                  <span>Memverifikasi Akun...</span>
                </div>
              ) : (
                <>
                  <span>Masuk ke Dashboard Admin</span>
                  <ArrowRight className="w-4 h-4" strokeWidth={2.5} />
                </>
              )}
            </button>
          </form>
        </div>
      </div>

      {/* Page Footer */}
      <div className="w-full max-w-md mx-auto text-center py-2 text-[12px] text-[#5A6472] dark:text-[#9AA8B8]">
        &copy; 2026 SIMO • Sistem Manajemen Organisasi OSIS Terpadu
      </div>
    </div>
  );
};

export default LoginPage;

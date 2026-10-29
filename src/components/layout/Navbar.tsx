import React, { useState } from 'react';
import {
  Menu,
  Bell,
  UserCheck,
  ChevronDown,
  Sparkles,
  Check,
  Sun,
  Moon,
  Globe,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { UserRole } from '../../types';

interface NavbarProps {
  onOpenSidebar: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onOpenSidebar }) => {
  const { currentRole, setCurrentRole, currentUser, announcements, setActivePage, theme, toggleTheme } = useApp();
  const [showRoleMenu, setShowRoleMenu] = useState(false);
  const [showNotificationMenu, setShowNotificationMenu] = useState(false);

  const availableRoles: { role: UserRole; label: string; desc: string }[] = [
    { role: 'ketua', label: 'Ketua Umum OSIS', desc: 'Fajar Pratama (XI RPL 1)' },
    { role: 'sekretaris', label: 'Sekretaris Umum', desc: 'Anisa Rahmawati (XI TKJ 2)' },
    { role: 'bendahara', label: 'Bendahara Umum', desc: 'Rizky Alamsyah (XI AKL 1)' },
    { role: 'koordinator_sekbid', label: 'Koordinator Sekbid TIK', desc: 'Dimas Anggoro (XI RPL 2)' },
    { role: 'anggota', label: 'Anggota Siswa', desc: 'Siti Aulia Nur (X DKV 1)' },
    { role: 'pembina', label: 'Pembina OSIS (Guru)', desc: 'Drs. H. Bambang Sudiro, M.Pd.' },
    { role: 'admin', label: 'Super Admin Sistem', desc: 'Administrator IT Sekolah' },
  ];

  const handleRoleSelect = (role: UserRole) => {
    setCurrentRole(role);
    setShowRoleMenu(false);
  };

  const unreadCount = announcements.length;

  return (
    <header className="h-16 bg-[#FFFDF8] dark:bg-[#17293E] border-b border-[#E6DFD0] dark:border-[#283D56] px-4 sm:px-6 flex items-center justify-between sticky top-0 z-30 transition-colors shadow-none">
      {/* Kiri: hamburger + judul organisasi di mobile */}
      <div className="flex items-center gap-3">
        <button
          onClick={onOpenSidebar}
          className="min-h-[44px] min-w-[44px] flex items-center justify-center text-[#5A6472] hover:text-[#1F3A5F] dark:text-[#9AA8B8] dark:hover:text-[#FAF6EE] hover:bg-[#E4EAF2] dark:hover:bg-[#213B5C] rounded-[12px] lg:hidden cursor-pointer transition-colors"
          aria-label="Buka navigasi menu"
        >
          <Menu className="w-5 h-5" strokeWidth={2} />
        </button>

        {/* Nama organisasi di mobile */}
        <span className="text-base font-extrabold text-[#1F3A5F] dark:text-[#FAF6EE] lg:hidden">
          SIMO
        </span>
      </div>

      {/* Kanan: actions */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Portal Publik Shortcut */}
        <button
          onClick={() => setActivePage('portal-publik')}
          className="hidden sm:inline-flex items-center gap-2 px-3.5 min-h-[44px] rounded-[12px] border border-[#E6DFD0] dark:border-[#283D56] bg-transparent hover:bg-[#E4EAF2] dark:hover:bg-[#213B5C] text-[#1F3A5F] dark:text-[#FAF6EE] text-[14px] font-bold transition-colors cursor-pointer"
          title="Buka Portal Publik"
        >
          <Globe className="w-4 h-4 text-[#1F3A5F] dark:text-[#FAF6EE]" strokeWidth={2} />
          <span>Portal Publik</span>
        </button>

        {/* Dark / Light Mode Toggle */}
        <button
          onClick={toggleTheme}
          className="min-h-[44px] min-w-[44px] flex items-center justify-center text-[#5A6472] hover:text-[#1F3A5F] dark:text-[#9AA8B8] dark:hover:text-[#FAF6EE] hover:bg-[#E4EAF2] dark:hover:bg-[#213B5C] rounded-[12px] cursor-pointer transition-colors"
          title={theme === 'dark' ? 'Mode Terang' : 'Mode Gelap'}
          aria-label="Ganti tema mode terang/gelap"
        >
          {theme === 'dark' ? (
            <Sun className="w-5 h-5 text-[#F2B544]" strokeWidth={2} />
          ) : (
            <Moon className="w-5 h-5 text-[#1F3A5F]" strokeWidth={2} />
          )}
        </button>

        {/* Notification Bell */}
        <div className="relative">
          <button
            onClick={() => {
              setShowNotificationMenu(!showNotificationMenu);
              setShowRoleMenu(false);
            }}
            className="min-h-[44px] min-w-[44px] flex items-center justify-center text-[#5A6472] hover:text-[#1F3A5F] dark:text-[#9AA8B8] dark:hover:text-[#FAF6EE] hover:bg-[#E4EAF2] dark:hover:bg-[#213B5C] rounded-[12px] relative cursor-pointer transition-colors"
            title="Pengumuman Organisasi"
            aria-label="Buka notifikasi pengumuman"
          >
            <Bell className="w-5 h-5" strokeWidth={2} />
            {unreadCount > 0 && (
              <span className="absolute top-2.5 right-2.5 w-2.5 h-2.5 rounded-full bg-[#F2B544] ring-2 ring-[#FFFDF8] dark:ring-[#17293E]" />
            )}
          </button>

          {showNotificationMenu && (
            <>
              <div className="fixed inset-0 z-40" onClick={() => setShowNotificationMenu(false)} />
              <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-[#FFFDF8] dark:bg-[#17293E] rounded-[14px] border border-[#E6DFD0] dark:border-[#283D56] shadow-none z-50">
                <div className="flex items-center justify-between px-4 py-3.5 border-b border-[#E6DFD0] dark:border-[#283D56]">
                  <span className="text-[15px] font-extrabold text-[#1F3A5F] dark:text-[#FAF6EE]">Warta &amp; Pengumuman</span>
                  <button
                    onClick={() => {
                      setActivePage('pengumuman');
                      setShowNotificationMenu(false);
                    }}
                    className="text-[14px] text-[#1F3A5F] dark:text-[#F2B544] hover:underline font-bold cursor-pointer"
                  >
                    Lihat Semua
                  </button>
                </div>
                <div className="p-2 space-y-1 max-h-72 overflow-y-auto">
                  {announcements.slice(0, 4).map((ann) => (
                    <div
                      key={ann.id}
                      className="px-3.5 py-3 rounded-[12px] hover:bg-[#FAF6EE] dark:hover:bg-[#213B5C] transition-colors cursor-pointer"
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className={`text-[12px] font-extrabold px-2 py-0.5 rounded-full border ${
                          ann.priority === 'penting'
                            ? 'bg-[#FBEBC8] text-[#7A4B00] border-[#F2B544]'
                            : 'bg-[#E4EAF2] text-[#1F3A5F] border-[#E6DFD0]'
                        }`}>
                          {ann.priority}
                        </span>
                        <span className="text-[13px] text-[#5A6472] dark:text-[#9AA8B8] font-medium">{ann.date}</span>
                      </div>
                      <p className="text-[14px] font-bold text-[#1F3A5F] dark:text-[#FAF6EE] line-clamp-1">{ann.title}</p>
                      <p className="text-[14px] text-[#5A6472] dark:text-[#9AA8B8] line-clamp-1 mt-0.5">{ann.content}</p>
                    </div>
                  ))}
                  {announcements.length === 0 && (
                    <p className="text-center text-[14px] text-[#5A6472] py-6">Belum ada pengumuman</p>
                  )}
                </div>
              </div>
            </>
          )}
        </div>

        {/* Role Switcher / User Menu */}
        <div className="relative">
          <button
            onClick={() => {
              setShowRoleMenu(!showRoleMenu);
              setShowNotificationMenu(false);
            }}
            className="flex items-center gap-2.5 px-3 min-h-[44px] rounded-[12px] border border-[#E6DFD0] dark:border-[#283D56] bg-[#FFFDF8] dark:bg-[#17293E] hover:bg-[#FAF6EE] dark:hover:bg-[#213B5C] transition-colors cursor-pointer"
            aria-label="Pilih peran simulator penguji"
          >
            <img
              src={currentUser.avatarUrl}
              alt={currentUser.fullName}
              className="w-7 h-7 rounded-[8px] object-cover border border-[#E6DFD0]"
            />
            <div className="hidden sm:block text-left">
              <p className="text-[14px] font-bold text-[#1F3A5F] dark:text-[#FAF6EE] leading-none truncate max-w-[120px]">
                {currentUser.fullName}
              </p>
              <p className="text-[13px] text-[#5A6472] dark:text-[#9AA8B8] font-semibold mt-0.5 capitalize">
                {currentRole.replace('_', ' ')}
              </p>
            </div>
            <ChevronDown className="w-4 h-4 text-[#5A6472] dark:text-[#9AA8B8] shrink-0" strokeWidth={2} />
          </button>

          {showRoleMenu && (
            <>
              <div className="fixed inset-0 z-40" onClick={() => setShowRoleMenu(false)} />
              <div className="absolute right-0 mt-2 w-72 bg-[#FFFDF8] dark:bg-[#17293E] rounded-[14px] border border-[#E6DFD0] dark:border-[#283D56] shadow-none z-50">
                <div className="px-4 py-3.5 border-b border-[#E6DFD0] dark:border-[#283D56]">
                  <div className="flex items-center gap-1.5 text-[#1F3A5F] dark:text-[#FAF6EE]">
                    <Sparkles className="w-4 h-4 text-[#F2B544]" strokeWidth={2} />
                    <span className="text-[14px] font-extrabold">Simulator Penguji UKK</span>
                  </div>
                  <p className="text-[13px] text-[#5A6472] dark:text-[#9AA8B8] mt-0.5">
                    Ganti peran untuk memvalidasi hak akses
                  </p>
                </div>
                <div className="p-2 space-y-1 max-h-64 overflow-y-auto">
                  {availableRoles.map((r) => {
                    const isSelected = currentRole === r.role;
                    return (
                      <button
                        key={r.role}
                        onClick={() => handleRoleSelect(r.role)}
                        className={`w-full flex items-center justify-between px-3 py-2.5 rounded-[10px] text-left transition-colors cursor-pointer ${
                          isSelected
                            ? 'bg-[#E4EAF2] dark:bg-[#213B5C] text-[#1F3A5F] dark:text-[#FAF6EE]'
                            : 'hover:bg-[#FAF6EE] dark:hover:bg-[#283D56] text-[#1F3A5F] dark:text-[#FAF6EE]'
                        }`}
                      >
                        <div>
                          <p className="text-[14px] font-bold">{r.label}</p>
                          <p className="text-[13px] text-[#5A6472] dark:text-[#9AA8B8] font-normal mt-0.5">{r.desc}</p>
                        </div>
                        {isSelected && <Check className="w-4 h-4 text-[#1F3A5F] dark:text-[#F2B544] shrink-0" strokeWidth={2} />}
                      </button>
                    );
                  })}
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
};

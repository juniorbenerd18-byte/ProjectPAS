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
    <header className="h-14 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 px-4 sm:px-6 flex items-center justify-between sticky top-0 z-30 transition-colors">

      {/* Kiri: hamburger + judul halaman */}
      <div className="flex items-center gap-3">
        <button
          onClick={onOpenSidebar}
          className="p-2 text-[#64748B] hover:text-[#0F172A] dark:text-slate-400 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg lg:hidden cursor-pointer transition-colors"
          aria-label="Buka menu"
        >
          <Menu className="w-4 h-4" />
        </button>

        {/* Nama organisasi di mobile */}
        <span className="text-sm font-bold text-[#0F172A] dark:text-white lg:hidden">
          SI<span className="text-[#2563EB]">MO</span>
        </span>
      </div>

      {/* Kanan: actions */}
      <div className="flex items-center gap-1.5 sm:gap-2">

        {/* Portal Publik */}
        <button
          onClick={() => setActivePage('portal-publik')}
          className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-[#EFF6FF] dark:bg-blue-950/40 hover:bg-blue-100 dark:hover:bg-blue-900/50 text-[#2563EB] text-xs font-semibold transition-colors cursor-pointer"
          title="Buka Portal Publik"
        >
          <Globe className="w-3.5 h-3.5" />
          <span>Portal Publik</span>
        </button>

        {/* Dark / Light Mode Toggle */}
        <button
          onClick={toggleTheme}
          className="p-2 text-[#64748B] hover:text-[#0F172A] dark:text-slate-400 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg cursor-pointer transition-colors"
          title={theme === 'dark' ? 'Mode Terang' : 'Mode Gelap'}
          aria-label="Ganti tema"
        >
          {theme === 'dark' ? (
            <Sun className="w-4 h-4 text-amber-400" />
          ) : (
            <Moon className="w-4 h-4" />
          )}
        </button>

        {/* Notification Bell */}
        <div className="relative">
          <button
            onClick={() => {
              setShowNotificationMenu(!showNotificationMenu);
              setShowRoleMenu(false);
            }}
            className="p-2 text-[#64748B] hover:text-[#0F172A] dark:text-slate-400 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg relative cursor-pointer transition-colors"
            title="Pengumuman"
          >
            <Bell className="w-4 h-4" />
            {unreadCount > 0 && (
              <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full bg-[#2563EB]" />
            )}
          </button>

          {showNotificationMenu && (
            <>
              <div className="fixed inset-0 z-40" onClick={() => setShowNotificationMenu(false)} />
              <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-lg z-50">
                <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100 dark:border-slate-800">
                  <span className="text-xs font-bold text-[#0F172A] dark:text-white">Pengumuman</span>
                  <button
                    onClick={() => {
                      setActivePage('pengumuman');
                      setShowNotificationMenu(false);
                    }}
                    className="text-[11px] text-[#2563EB] hover:underline font-semibold cursor-pointer"
                  >
                    Lihat Semua
                  </button>
                </div>
                <div className="p-2 space-y-1 max-h-72 overflow-y-auto">
                  {announcements.slice(0, 4).map((ann) => (
                    <div
                      key={ann.id}
                      className="px-3 py-2.5 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className={`text-[9px] font-bold uppercase px-1.5 py-0.5 rounded ${
                          ann.priority === 'penting'
                            ? 'bg-[#FEF2F2] text-[#DC2626]'
                            : 'bg-[#EFF6FF] text-[#2563EB]'
                        }`}>
                          {ann.priority}
                        </span>
                        <span className="text-[10px] text-[#64748B]">{ann.date}</span>
                      </div>
                      <p className="text-xs font-semibold text-[#0F172A] dark:text-white line-clamp-1">{ann.title}</p>
                      <p className="text-[11px] text-[#64748B] line-clamp-1 mt-0.5">{ann.content}</p>
                    </div>
                  ))}
                  {announcements.length === 0 && (
                    <p className="text-center text-xs text-[#64748B] py-6">Belum ada pengumuman</p>
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
            className="flex items-center gap-2 pl-2 pr-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <img
              src={currentUser.avatarUrl}
              alt={currentUser.fullName}
              className="w-6 h-6 rounded-md object-cover"
            />
            <div className="hidden sm:block text-left">
              <p className="text-[11px] font-bold text-[#0F172A] dark:text-white leading-none truncate max-w-[110px]">
                {currentUser.fullName}
              </p>
              <p className="text-[10px] text-[#2563EB] font-semibold mt-0.5 capitalize">
                {currentRole.replace('_', ' ')}
              </p>
            </div>
            <ChevronDown className="w-3 h-3 text-[#64748B] shrink-0" />
          </button>

          {showRoleMenu && (
            <>
              <div className="fixed inset-0 z-40" onClick={() => setShowRoleMenu(false)} />
              <div className="absolute right-0 mt-2 w-64 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-lg z-50">
                <div className="px-4 py-3 border-b border-slate-100 dark:border-slate-800">
                  <div className="flex items-center gap-1.5 text-[#2563EB]">
                    <Sparkles className="w-3.5 h-3.5" />
                    <span className="text-xs font-bold">Simulator Penguji UKK</span>
                  </div>
                  <p className="text-[10px] text-[#64748B] mt-0.5">
                    Simulasi peran dan hak akses pengguna
                  </p>
                </div>
                <div className="p-1.5 space-y-0.5 max-h-64 overflow-y-auto">
                  {availableRoles.map((r) => {
                    const isSelected = currentRole === r.role;
                    return (
                      <button
                        key={r.role}
                        onClick={() => handleRoleSelect(r.role)}
                        className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-left transition-colors cursor-pointer ${
                          isSelected
                            ? 'bg-[#EFF6FF] dark:bg-blue-950/60 text-[#1E3A8A] dark:text-blue-200'
                            : 'hover:bg-slate-50 dark:hover:bg-slate-800 text-[#0F172A] dark:text-slate-300'
                        }`}
                      >
                        <div>
                          <p className="text-xs font-semibold">{r.label}</p>
                          <p className="text-[10px] text-[#64748B] font-normal mt-0.5">{r.desc}</p>
                        </div>
                        {isSelected && <Check className="w-3.5 h-3.5 text-[#2563EB] shrink-0" />}
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

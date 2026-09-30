import React, { useState } from 'react';
import {
  Menu,
  Bell,
  Search,
  UserCheck,
  ChevronDown,
  Sparkles,
  Database,
  Check,
  Sun,
  Moon,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { UserRole } from '../../types';
import { isSupabaseConfigured } from '../../lib/supabase';

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

  const isCloud = isSupabaseConfigured();

  return (
    <header className="h-16 bg-white dark:bg-slate-900 border-b border-slate-200/80 dark:border-slate-800 px-4 sm:px-6 flex items-center justify-between sticky top-0 z-30 shadow-2xs transition-colors">
      <div className="flex items-center gap-3">
        <button
          onClick={onOpenSidebar}
          className="p-2 text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl lg:hidden cursor-pointer"
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* Quick Search */}
        <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-100/80 dark:bg-slate-800/80 text-slate-400 text-xs w-64 border border-transparent focus-within:border-indigo-400 focus-within:bg-white dark:focus-within:bg-slate-800 transition-all">
          <Search className="w-3.5 h-3.5 shrink-0" />
          <input
            type="text"
            placeholder="Cari anggota, proker, surat..."
            className="bg-transparent border-none outline-none text-slate-700 dark:text-slate-200 placeholder:text-slate-400 text-xs w-full"
          />
        </div>
      </div>

      <div className="flex items-center gap-2 sm:gap-3">
        {/* Cloud / Demo Indicator */}
        <div className="hidden md:flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 border border-emerald-200/80 dark:border-emerald-800">
          <Database className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
          <span>{isCloud ? 'Supabase Cloud' : 'Dual-Mode (UKK Ready)'}</span>
        </div>

        {/* Dark / Light Mode Toggle Button */}
        <button
          onClick={toggleTheme}
          className="p-2 text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl cursor-pointer transition-colors"
          title={theme === 'dark' ? 'Ganti ke Mode Terang' : 'Ganti ke Mode Gelap'}
          aria-label="Toggle theme"
        >
          {theme === 'dark' ? (
            <Sun className="w-4 h-4 text-amber-400 animate-in spin-in-180" />
          ) : (
            <Moon className="w-4 h-4 text-indigo-600" />
          )}
        </button>

        {/* Notification Bell */}
        <div className="relative">
          <button
            onClick={() => setShowNotificationMenu(!showNotificationMenu)}
            className="p-2 text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl relative cursor-pointer"
            title="Pengumuman & Notifikasi"
          >
            <Bell className="w-4 h-4" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-rose-500" />
          </button>

          {showNotificationMenu && (
            <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-slate-200/80 dark:border-slate-800 p-3 z-50 animate-in fade-in zoom-in-95">
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2 mb-2">
                <span className="text-xs font-bold text-slate-800 dark:text-slate-200">Pengumuman Terbaru</span>
                <button
                  onClick={() => {
                    setActivePage('pengumuman');
                    setShowNotificationMenu(false);
                  }}
                  className="text-[11px] text-indigo-600 hover:underline font-semibold cursor-pointer"
                >
                  Lihat Semua
                </button>
              </div>
              <div className="space-y-2">
                {announcements.slice(0, 3).map((ann) => (
                  <div key={ann.id} className="p-2 rounded-lg bg-slate-50 dark:bg-slate-800 hover:bg-slate-100/70 dark:hover:bg-slate-700/60 transition-colors">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/60 px-1.5 py-0.5 rounded">
                        {ann.priority.toUpperCase()}
                      </span>
                      <span className="text-[10px] text-slate-400">{ann.date}</span>
                    </div>
                    <p className="text-xs font-semibold text-slate-800 dark:text-slate-200 line-clamp-1">{ann.title}</p>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-1 mt-0.5">{ann.content}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Role Switcher (For UKK Presentation) */}
        <div className="relative">
          <button
            onClick={() => setShowRoleMenu(!showRoleMenu)}
            className="flex items-center gap-2.5 pl-2 pr-3 py-1.5 rounded-xl border border-slate-200/80 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-800/80 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all cursor-pointer"
          >
            <img
              src={currentUser.avatarUrl}
              alt={currentUser.fullName}
              className="w-7 h-7 rounded-lg object-cover ring-1 ring-slate-200 dark:ring-slate-700"
            />
            <div className="text-left hidden sm:block">
              <p className="text-xs font-bold text-slate-800 dark:text-slate-200 leading-none truncate max-w-[130px]">
                {currentUser.fullName}
              </p>
              <div className="flex items-center gap-1 mt-0.5">
                <span className="text-[10px] font-semibold text-indigo-600 dark:text-indigo-400 capitalize">
                  {currentRole.replace('_', ' ')}
                </span>
                <span className="text-[9px] text-slate-400 font-medium">({currentUser.classRoom})</span>
              </div>
            </div>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
          </button>

          {showRoleMenu && (
            <div className="absolute right-0 mt-2 w-72 bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-slate-200/80 dark:border-slate-800 p-2 z-50 animate-in fade-in zoom-in-95">
              <div className="px-3 py-2 border-b border-slate-100 dark:border-slate-800 mb-1">
                <div className="flex items-center gap-1.5 text-indigo-600 dark:text-indigo-400">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span className="text-xs font-bold">Simulator Penguji UKK</span>
                </div>
                <p className="text-[10px] text-slate-400 mt-0.5">
                  Klik untuk simulasi peran dan hak akses pengguna:
                </p>
              </div>

              <div className="space-y-0.5 max-h-72 overflow-y-auto">
                {availableRoles.map((r) => {
                  const isSelected = currentRole === r.role;
                  return (
                    <button
                      key={r.role}
                      onClick={() => handleRoleSelect(r.role)}
                      className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-left transition-colors cursor-pointer ${
                        isSelected
                          ? 'bg-indigo-50 dark:bg-indigo-950/70 text-indigo-900 dark:text-indigo-200 font-bold'
                          : 'hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300'
                      }`}
                    >
                      <div>
                        <p className="text-xs">{r.label}</p>
                        <p className="text-[10px] text-slate-400 font-normal">{r.desc}</p>
                      </div>
                      {isSelected && <Check className="w-4 h-4 text-indigo-600 shrink-0" />}
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

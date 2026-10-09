import React from 'react';
import {
  LayoutDashboard,
  Users,
  CalendarCheck,
  Wallet,
  FileText,
  Settings,
  X,
  Building2,
  Sparkles,
  QrCode,
  CreditCard,
  Globe,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  const { activePage, setActivePage, orgProfile, memberDues, workPrograms } = useApp();

  const pendingDuesCount = memberDues.filter((d) => d.status === 'menunggu_verifikasi').length;
  const pendingProkerCount = workPrograms.filter((p) => p.status === 'diajukan').length;

  const handleNavClick = (pageId: string) => {
    setActivePage(pageId);
    if (window.innerWidth < 1024) {
      onClose();
    }
  };

  const navItems = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: <LayoutDashboard className="w-4 h-4 shrink-0" />,
      badge: null,
    },
    {
      id: 'keanggotaan',
      label: 'Keanggotaan & KTA',
      icon: <Users className="w-4 h-4 shrink-0" />,
      badge: null,
    },
    {
      id: 'kegiatan-presensi',
      label: 'Kegiatan & Presensi Wajah',
      icon: <CalendarCheck className="w-4 h-4 shrink-0" />,
      badge: pendingProkerCount > 0 ? `${pendingProkerCount}` : null,
      badgeColor: 'bg-blue-500',
    },
    {
      id: 'keuangan',
      label: 'Kas & Keuangan',
      icon: <Wallet className="w-4 h-4 shrink-0" />,
      badge: pendingDuesCount > 0 ? `${pendingDuesCount}` : null,
      badgeColor: 'bg-emerald-500',
    },
    {
      id: 'dokumen',
      label: 'Arsip Dokumen & Surat',
      icon: <FileText className="w-4 h-4 shrink-0" />,
      badge: null,
    },
  ];

  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-900/50 backdrop-blur-xs lg:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={`fixed top-0 bottom-0 left-0 z-40 w-64 bg-white dark:bg-slate-900 border-r border-slate-200/80 dark:border-slate-800 flex flex-col transition-transform duration-300 lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Brand Header */}
        <div className="h-16 flex items-center justify-between px-5 border-b border-slate-100 dark:border-slate-800 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold shadow-sm shadow-blue-200">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-sm font-extrabold text-slate-900 dark:text-white tracking-tight leading-none">
                SCHOOL<span className="text-blue-600">ORG</span>
              </h1>
              <p className="text-[10px] text-slate-400 font-medium tracking-wide mt-0.5">
                {orgProfile.academicYear} • Clean Edition
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="lg:hidden p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Clean 5-Item Navigation */}
        <div className="flex-1 overflow-y-auto px-3 py-4 space-y-1.5 text-xs font-semibold">
          {/* Public Portal Switcher */}
          <div className="mb-3">
            <button
              onClick={() => handleNavClick('portal-publik')}
              className="w-full flex items-center justify-between px-3.5 py-2.5 rounded-2xl bg-blue-50/80 dark:bg-blue-950/60 border border-blue-200/80 dark:border-blue-800 text-blue-700 dark:text-blue-300 font-bold text-xs hover:bg-blue-100 dark:hover:bg-blue-900/80 transition-all cursor-pointer shadow-2xs"
            >
              <div className="flex items-center gap-2.5">
                <Globe className="w-4 h-4 text-blue-600 dark:text-blue-400 shrink-0" />
                <span>Portal Publik Siswa</span>
              </div>
              <span className="text-[10px] font-extrabold px-1.5 py-0.5 rounded-md bg-blue-200/70 dark:bg-blue-900 text-blue-800 dark:text-blue-200">
                Tamu
              </span>
            </button>
          </div>

          <div className="px-1 pb-1 text-[10px] font-bold uppercase tracking-wider text-slate-400">
            Menu Internal Pengurus
          </div>

          {navItems.map((item) => {
            const isActive = activePage === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleNavClick(item.id)}
                className={`w-full flex items-center justify-between px-3.5 py-3 rounded-2xl transition-all cursor-pointer ${
                  isActive
                    ? 'bg-blue-600 text-white font-bold shadow-md shadow-blue-200'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/60 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className={isActive ? 'text-white' : 'text-slate-400'}>
                    {item.icon}
                  </span>
                  <span>{item.label}</span>
                </div>
                {item.badge && (
                  <span
                    className={`px-1.5 py-0.5 rounded-full text-[10px] text-white font-extrabold ${
                      isActive ? 'bg-blue-800' : item.badgeColor || 'bg-slate-500'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Bottom Quick Feature Highlights & Settings */}
        <div className="p-3 border-t border-slate-100 dark:border-slate-800 space-y-2 bg-slate-50/50 dark:bg-slate-900/50 text-xs shrink-0">
          <button
            onClick={() => handleNavClick('pengaturan')}
            className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-slate-600 dark:text-slate-400 hover:bg-white dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer ${
              activePage === 'pengaturan' ? 'bg-white dark:bg-slate-800 text-blue-700 dark:text-blue-400 font-bold shadow-xs' : ''
            }`}
          >
            <Settings className="w-4 h-4 text-slate-400" />
            <span>Pengaturan Sistem</span>
          </button>

          <div className="px-3 py-1 flex items-center justify-between text-[11px] text-slate-400">
            <span>Masa Bakti:</span>
            <span className="font-bold text-slate-700 dark:text-slate-300">{orgProfile.academicYear}</span>
          </div>
        </div>
      </aside>
    </>
  );
};

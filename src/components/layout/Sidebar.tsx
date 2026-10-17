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
  Globe,
  ChevronRight,
  Lightbulb,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  const { activePage, setActivePage, orgProfile, memberDues, workPrograms, aspirations } = useApp();

  const pendingDuesCount = memberDues.filter((d) => d.status === 'menunggu_verifikasi').length;
  const pendingProkerCount = workPrograms.filter((p) => p.status === 'diajukan').length;
  const pendingAspirationsCount = aspirations ? aspirations.filter((a) => a.status === 'diterima' || a.status === 'diproses').length : 0;

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
      badge: null as string | null,
    },
    {
      id: 'keanggotaan',
      label: 'Keanggotaan & KTA',
      icon: <Users className="w-4 h-4 shrink-0" />,
      badge: null as string | null,
    },
    {
      id: 'kegiatan-presensi',
      label: 'Kegiatan & Presensi',
      icon: <CalendarCheck className="w-4 h-4 shrink-0" />,
      badge: pendingProkerCount > 0 ? `${pendingProkerCount}` : null,
    },
    {
      id: 'keuangan',
      label: 'Kas & Keuangan',
      icon: <Wallet className="w-4 h-4 shrink-0" />,
      badge: pendingDuesCount > 0 ? `${pendingDuesCount}` : null,
    },
    {
      id: 'dokumen',
      label: 'Arsip & Dokumen',
      icon: <FileText className="w-4 h-4 shrink-0" />,
      badge: null as string | null,
    },
    {
      id: 'aspirasi',
      label: 'Kotak Ide & Aspirasi',
      icon: <Lightbulb className="w-4 h-4 shrink-0 text-amber-500" />,
      badge: pendingAspirationsCount > 0 ? `${pendingAspirationsCount}` : null,
    },
  ];

  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-900/40 backdrop-blur-sm lg:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={`fixed top-0 bottom-0 left-0 z-40 w-64 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 flex flex-col transition-transform duration-300 lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Brand Header */}
        <div className="h-16 flex items-center justify-between px-5 border-b border-slate-100 dark:border-slate-800 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-[#2563EB] flex items-center justify-center">
              <Building2 className="w-4 h-4 text-white" />
            </div>
            <div>
              <p className="text-sm font-bold text-[#0F172A] dark:text-white tracking-tight leading-none">
                SI<span className="text-[#2563EB]">MO</span>
              </p>
              <p className="text-[10px] text-[#64748B] font-medium mt-0.5">
                {orgProfile.academicYear}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="lg:hidden p-1.5 text-[#64748B] hover:text-[#0F172A] dark:hover:text-white rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Navigation */}
        <div className="flex-1 overflow-y-auto px-3 py-4 space-y-1">

          {/* Label seksi */}
          <p className="px-3 pb-2 text-[10px] font-bold uppercase tracking-widest text-[#64748B]">
            Menu Utama
          </p>

          {navItems.map((item) => {
            const isActive = activePage === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleNavClick(item.id)}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                  isActive
                    ? 'bg-[#EFF6FF] text-[#2563EB]'
                    : 'text-[#64748B] dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/60 hover:text-[#0F172A] dark:hover:text-white'
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className={isActive ? 'text-[#2563EB]' : 'text-[#64748B] dark:text-slate-500'}>
                    {item.icon}
                  </span>
                  <span>{item.label}</span>
                </div>
                <div className="flex items-center gap-1.5 shrink-0">
                  {item.badge && (
                    <span className="px-1.5 py-0.5 rounded-full text-[10px] font-bold bg-[#2563EB] text-white">
                      {item.badge}
                    </span>
                  )}
                  {isActive && (
                    <ChevronRight className="w-3.5 h-3.5 text-[#2563EB]" />
                  )}
                </div>
              </button>
            );
          })}

          {/* Divider */}
          <div className="pt-3 pb-2">
            <div className="h-px bg-slate-100 dark:bg-slate-800" />
          </div>

          {/* Portal Publik */}
          <p className="px-3 pb-2 text-[10px] font-bold uppercase tracking-widest text-[#64748B]">
            Akses Cepat
          </p>

          <button
            onClick={() => handleNavClick('portal-publik')}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
              activePage === 'portal-publik'
                ? 'bg-[#EFF6FF] text-[#2563EB]'
                : 'text-[#64748B] dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/60 hover:text-[#0F172A] dark:hover:text-white'
            }`}
          >
            <Globe className={`w-4 h-4 shrink-0 ${activePage === 'portal-publik' ? 'text-[#2563EB]' : 'text-[#64748B] dark:text-slate-500'}`} />
            <span>Portal Publik</span>
            <span className="ml-auto text-[9px] font-bold px-1.5 py-0.5 rounded-md bg-[#EFF6FF] text-[#2563EB] border border-blue-200">
              Tamu
            </span>
          </button>
        </div>

        {/* Bottom: Pengaturan + Info */}
        <div className="shrink-0 border-t border-slate-100 dark:border-slate-800 p-3 space-y-1">
          <button
            onClick={() => handleNavClick('pengaturan')}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-colors cursor-pointer ${
              activePage === 'pengaturan'
                ? 'bg-[#EFF6FF] text-[#2563EB]'
                : 'text-[#64748B] dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-[#0F172A] dark:hover:text-white'
            }`}
          >
            <Settings className={`w-4 h-4 shrink-0 ${activePage === 'pengaturan' ? 'text-[#2563EB]' : 'text-[#64748B]'}`} />
            <span>Pengaturan</span>
          </button>

          <div className="px-3 py-1.5 flex items-center justify-between">
            <span className="text-[10px] text-[#64748B]">Masa Bakti</span>
            <span className="text-[10px] font-bold text-[#0F172A] dark:text-slate-200">
              {orgProfile.academicYear}
            </span>
          </div>
        </div>
      </aside>
    </>
  );
};

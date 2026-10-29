import React from 'react';
import {
  LayoutDashboard,
  Users,
  CalendarCheck,
  FileText,
  Settings,
  X,
  Building2,
  Globe,
  ChevronRight,
  Lightbulb,
  LogOut,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  const { activePage, setActivePage, orgProfile, workPrograms, aspirations, showToast } = useApp();

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
        className={`fixed top-0 bottom-0 left-0 z-40 w-[280px] bg-[#FFFDF8] dark:bg-[#17293E] border-r border-[#E6DFD0] dark:border-[#283D56] flex flex-col transition-transform duration-300 lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Brand Header */}
        <div className="h-16 flex items-center justify-between px-6 border-b border-[#E6DFD0] dark:border-[#283D56] shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-[12px] bg-[#1F3A5F] flex items-center justify-center shrink-0">
              <Building2 className="w-5 h-5 text-[#FAF6EE]" strokeWidth={2} />
            </div>
            <div>
              <p className="text-base font-extrabold text-[#1F3A5F] dark:text-[#FAF6EE] tracking-tight leading-none">
                SIMO
              </p>
              <p className="text-[14px] text-[#5A6472] dark:text-[#9AA8B8] font-semibold mt-1">
                {orgProfile.academicYear}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="lg:hidden min-h-[44px] min-w-[44px] flex items-center justify-center text-[#5A6472] hover:text-[#1F3A5F] dark:hover:text-[#FAF6EE] rounded-[12px] hover:bg-[#E4EAF2] dark:hover:bg-[#213B5C] transition-colors"
            aria-label="Tutup navigasi"
          >
            <X className="w-5 h-5" strokeWidth={2} />
          </button>
        </div>

        {/* Navigation */}
        <div className="flex-1 overflow-y-auto px-3.5 py-4 space-y-1.5">
          {/* Label Seksi */}
          <p className="px-3 pb-2 text-[14px] font-bold text-[#5A6472] dark:text-[#9AA8B8]">
            Menu Utama
          </p>

          {navItems.map((item) => {
            const isActive = activePage === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleNavClick(item.id)}
                className={`w-full min-h-[48px] flex items-center justify-between px-4 py-3 rounded-[14px] text-[15px] font-bold transition-all cursor-pointer ${
                  isActive
                    ? 'bg-[#E4EAF2] dark:bg-[#213B5C] text-[#1F3A5F] dark:text-[#FAF6EE] shadow-2xs'
                    : 'text-[#5A6472] dark:text-[#9AA8B8] hover:bg-[#FAF6EE] dark:hover:bg-[#1C3048] hover:text-[#1F3A5F] dark:hover:text-[#FAF6EE]'
                }`}
              >
                <div className="flex items-center gap-3.5 min-w-0">
                  <span className={`shrink-0 ${isActive ? 'text-[#1F3A5F] dark:text-[#FAF6EE]' : 'text-[#5A6472] dark:text-[#9AA8B8]'}`}>
                    {item.icon}
                  </span>
                  <span className="whitespace-nowrap select-none">{item.label}</span>
                </div>
                <div className="flex items-center gap-1.5 shrink-0 ml-2">
                  {item.badge && (
                    <span className="px-2 py-0.5 rounded-full text-[12px] font-extrabold bg-[#F2B544] text-[#1F3A5F]">
                      {item.badge}
                    </span>
                  )}
                  {isActive && (
                    <ChevronRight className="w-4 h-4 text-[#1F3A5F] dark:text-[#FAF6EE] shrink-0" strokeWidth={2.5} />
                  )}
                </div>
              </button>
            );
          })}

          {/* Divider */}
          <div className="pt-3 pb-2">
            <div className="h-px bg-[#E6DFD0] dark:border-[#283D56]" />
          </div>

          {/* Akses Cepat */}
          <p className="px-3 pb-2 text-[14px] font-bold text-[#5A6472] dark:text-[#9AA8B8]">
            Akses Cepat
          </p>

          <button
            onClick={() => handleNavClick('portal-publik')}
            className={`w-full min-h-[48px] flex items-center gap-3.5 px-4 py-3 rounded-[14px] text-[15px] font-bold transition-all cursor-pointer ${
              activePage === 'portal-publik'
                ? 'bg-[#E4EAF2] dark:bg-[#213B5C] text-[#1F3A5F] dark:text-[#FAF6EE]'
                : 'text-[#5A6472] dark:text-[#9AA8B8] hover:bg-[#FAF6EE] dark:hover:bg-[#1C3048] hover:text-[#1F3A5F] dark:hover:text-[#FAF6EE]'
            }`}
          >
            <Globe
              className={`w-4 h-4 shrink-0 ${
                activePage === 'portal-publik' ? 'text-[#1F3A5F] dark:text-[#FAF6EE]' : 'text-[#5A6472] dark:text-[#9AA8B8]'
              }`}
              strokeWidth={2}
            />
            <span className="whitespace-nowrap select-none">Portal Publik</span>
            <span className="ml-auto text-[12px] font-extrabold px-2 py-0.5 rounded-md bg-[#FBEBC8] text-[#7A4B00] border border-[#F2B544]/50">
              Tamu
            </span>
          </button>
        </div>

        {/* Bottom: Pengaturan + Info */}
        <div className="shrink-0 border-t border-[#E6DFD0] dark:border-[#283D56] p-3.5 space-y-1.5">
          <button
            onClick={() => handleNavClick('pengaturan')}
            className={`w-full min-h-[48px] flex items-center gap-3.5 px-4 py-3 rounded-[14px] text-[15px] font-bold transition-colors cursor-pointer ${
              activePage === 'pengaturan'
                ? 'bg-[#E4EAF2] dark:bg-[#213B5C] text-[#1F3A5F] dark:text-[#FAF6EE]'
                : 'text-[#5A6472] dark:text-[#9AA8B8] hover:bg-[#FAF6EE] dark:hover:bg-[#1C3048] hover:text-[#1F3A5F] dark:hover:text-[#FAF6EE]'
            }`}
          >
            <Settings
              className={`w-4 h-4 shrink-0 ${
                activePage === 'pengaturan' ? 'text-[#1F3A5F] dark:text-[#FAF6EE]' : 'text-[#5A6472]'
              }`}
              strokeWidth={2}
            />
            <span className="whitespace-nowrap select-none">Pengaturan</span>
          </button>

          <button
            onClick={() => {
              setActivePage('portal-publik');
              showToast('Anda telah keluar dari sesi admin SIMO.', 'info');
            }}
            className="w-full min-h-[44px] flex items-center gap-3.5 px-4 py-2.5 rounded-[12px] text-[14px] font-bold text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/20 transition-colors cursor-pointer"
          >
            <LogOut className="w-4 h-4 shrink-0" strokeWidth={2} />
            <span className="whitespace-nowrap select-none">Keluar Sesi</span>
          </button>

          <div className="px-4 py-2 flex items-center justify-between text-[14px]">
            <span className="text-[#5A6472] dark:text-[#9AA8B8] font-medium">Masa Bakti</span>
            <span className="font-extrabold text-[#1F3A5F] dark:text-[#FAF6EE]">
              {orgProfile.academicYear}
            </span>
          </div>
        </div>
      </aside>
    </>
  );
};

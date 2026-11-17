import React from 'react';
import {
  Menu,
  Sun,
  Moon,
  Globe,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';

interface NavbarProps {
  onOpenSidebar: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onOpenSidebar }) => {
  const { currentRole, currentUser, setActivePage, theme, toggleTheme, orgProfile } = useApp();

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
        <span className="text-base font-extrabold text-[#1F3A5F] dark:text-[#FAF6EE] lg:hidden truncate max-w-[160px]">
          {orgProfile.appName || 'SIMO'}
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

        {/* User Profile Info */}
        <div className="flex items-center gap-2.5 px-3 min-h-[44px] rounded-[12px] border border-[#E6DFD0] dark:border-[#283D56] bg-[#FFFDF8] dark:bg-[#17293E] select-none">
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
        </div>
      </div>
    </header>
  );
};

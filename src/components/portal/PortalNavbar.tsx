import React, { useState, useEffect } from 'react';
import {
  Shield,
  Sun,
  Moon,
  Menu,
  X,
  LogIn,
  Layers,
  Sparkles,
  Calendar,
  Image as ImageIcon,
  Users,
  Info,
} from 'lucide-react';
import { PortalOrganization } from '../../data/portalData';

interface PortalNavbarProps {
  organization: PortalOrganization;
  theme: 'light' | 'dark';
  onToggleTheme: () => void;
  onAdminLogin: () => void;
}

export const PortalNavbar: React.FC<PortalNavbarProps> = ({
  organization,
  theme,
  onToggleTheme,
  onAdminLogin,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [activeSection, setActiveSection] = useState('beranda');

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);

      const sections = ['beranda', 'proker', 'linimasa', 'galeri', 'struktur', 'tentang'];
      const current = sections.find((sec) => {
        const el = document.getElementById(sec);
        if (el) {
          const rect = el.getBoundingClientRect();
          return rect.top <= 120 && rect.bottom >= 120;
        }
        return false;
      });
      if (current) {
        setActiveSection(current);
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { id: 'beranda', label: 'Beranda', icon: Sparkles },
    { id: 'proker', label: 'Program Kerja', icon: Layers },
    { id: 'linimasa', label: 'Linimasa', icon: Calendar },
    { id: 'galeri', label: 'Dokumentasi', icon: ImageIcon },
    { id: 'struktur', label: 'Struktur', icon: Users },
    { id: 'tentang', label: 'Tentang', icon: Info },
  ];

  const scrollToSection = (id: string) => {
    setMobileMenuOpen(false);
    const element = document.getElementById(id);
    if (element) {
      const navOffset = 76;
      const elementPosition = element.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - navOffset;
      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth',
      });
    }
  };

  return (
    <header
      className={`sticky top-0 z-50 transition-all duration-300 ${
        scrolled
          ? 'bg-white/90 dark:bg-slate-900/90 backdrop-blur-md shadow-sm border-b border-slate-200/80 dark:border-slate-800/80 py-3'
          : 'bg-white/70 dark:bg-slate-900/70 backdrop-blur-sm border-b border-slate-200/40 dark:border-slate-800/40 py-4'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between gap-4">
          {/* Logo & School Brand */}
          <button
            onClick={() => scrollToSection('beranda')}
            className="flex items-center gap-3 text-left group cursor-pointer focus:outline-none"
            title="Kembali ke Beranda"
          >
            <div className="relative">
              <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-gradient-to-br from-blue-600 via-blue-700 to-amber-500 p-0.5 shadow-md shadow-blue-500/20 group-hover:scale-105 transition-transform duration-300">
                <div className="w-full h-full bg-white dark:bg-slate-900 rounded-[10px] flex items-center justify-center">
                  <Shield className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600 dark:text-blue-400 group-hover:rotate-6 transition-transform duration-300" />
                </div>
              </div>
              <span className="absolute -bottom-1 -right-1 w-3.5 h-3.5 bg-amber-500 rounded-full border-2 border-white dark:border-slate-900 flex items-center justify-center">
                <span className="w-1.5 h-1.5 bg-white rounded-full"></span>
              </span>
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-heading font-extrabold text-base sm:text-lg tracking-tight text-slate-900 dark:text-white">
                  OSIS
                </span>
                <span className="px-1.5 py-0.2 bg-blue-100 dark:bg-blue-950/80 text-blue-700 dark:text-blue-300 text-[10px] font-bold rounded uppercase tracking-wider border border-blue-200/60 dark:border-blue-800/60">
                  Resmi
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-medium line-clamp-1">
                {organization.schoolName}
              </p>
            </div>
          </button>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-1 bg-slate-100/70 dark:bg-slate-800/60 p-1.5 rounded-full border border-slate-200/60 dark:border-slate-700/50 backdrop-blur-md">
            {navLinks.map((link) => {
              const Icon = link.icon;
              const isActive = activeSection === link.id;
              return (
                <button
                  key={link.id}
                  onClick={() => scrollToSection(link.id)}
                  className={`flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold rounded-full transition-all duration-200 cursor-pointer ${
                    isActive
                      ? 'bg-blue-600 text-white shadow-sm shadow-blue-500/25'
                      : 'text-slate-600 dark:text-slate-300 hover:text-blue-600 dark:hover:text-white hover:bg-white/80 dark:hover:bg-slate-700/70'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  {link.label}
                </button>
              );
            })}
          </nav>

          {/* Action Buttons: Theme Toggle & Admin Login */}
          <div className="flex items-center gap-2">
            {/* Theme Toggle */}
            <button
              onClick={onToggleTheme}
              className="p-2.5 rounded-xl text-slate-600 dark:text-slate-300 hover:text-blue-600 dark:hover:text-amber-400 hover:bg-slate-100 dark:hover:bg-slate-800/80 transition-all duration-200 border border-slate-200/60 dark:border-slate-800/80 cursor-pointer"
              aria-label="Ganti mode gelap/terang"
              title={theme === 'dark' ? 'Beralih ke Mode Terang' : 'Beralih ke Mode Gelap'}
            >
              {theme === 'dark' ? (
                <Sun className="w-4 h-4 text-amber-400 transition-transform duration-300 rotate-0 hover:rotate-90" />
              ) : (
                <Moon className="w-4 h-4 text-slate-700 transition-transform duration-300 rotate-0 hover:-rotate-12" />
              )}
            </button>

            {/* Admin Login Button */}
            <button
              onClick={onAdminLogin}
              className="hidden sm:inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-sm shadow-blue-600/25 hover:shadow-md hover:shadow-blue-600/30 transition-all duration-200 cursor-pointer hover:scale-[1.02] active:scale-[0.98]"
            >
              <LogIn className="w-3.5 h-3.5" />
              <span>Portal Admin</span>
            </button>

            {/* Mobile Hamburger Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2.5 md:hidden rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200/60 dark:border-slate-800 cursor-pointer"
              aria-label="Buka menu navigasi"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Dropdown Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden mt-3 pt-3 pb-4 border-t border-slate-200/80 dark:border-slate-800 space-y-1.5 animate-fadeIn">
            {navLinks.map((link) => {
              const Icon = link.icon;
              const isActive = activeSection === link.id;
              return (
                <button
                  key={link.id}
                  onClick={() => scrollToSection(link.id)}
                  className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-semibold transition-colors cursor-pointer ${
                    isActive
                      ? 'bg-blue-600 text-white'
                      : 'text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800'
                  }`}
                >
                  <Icon className="w-4 h-4 shrink-0" />
                  <span>{link.label}</span>
                </button>
              );
            })}

            <div className="pt-2">
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  onAdminLogin();
                }}
                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold bg-blue-600 text-white hover:bg-blue-700 shadow-sm cursor-pointer"
              >
                <LogIn className="w-4 h-4" />
                <span>Masuk Dashboard Pengurus</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </header>
  );
};

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
  ArrowRight,
  MessageSquare,
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
      const isScrolled = window.scrollY > 40;
      setScrolled(isScrolled);

      const sections = ['beranda', 'tentang', 'struktur', 'proker', 'linimasa', 'galeri'];
      const current = sections.find((sec) => {
        const el = document.getElementById(sec);
        if (el) {
          const rect = el.getBoundingClientRect();
          return rect.top <= 140 && rect.bottom >= 140;
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
    { id: 'beranda', label: 'Beranda' },
    { id: 'tentang', label: 'Tentang' },
    { id: 'struktur', label: 'Struktur' },
    { id: 'proker', label: 'Program Kerja' },
    { id: 'linimasa', label: 'Linimasa' },
    { id: 'galeri', label: 'Galeri' },
  ];

  const scrollToSection = (id: string) => {
    setMobileMenuOpen(false);
    const element = document.getElementById(id);
    if (element) {
      const navOffset = 90;
      const elementPosition = element.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - navOffset;
      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth',
      });
    }
  };

  return (
    <header className="fixed inset-x-0 top-3 sm:top-5 z-50 flex justify-center px-3 sm:px-6 pointer-events-none">
      <div
        className={`pointer-events-auto relative w-full max-w-5xl backdrop-blur-md transition-all duration-300 ease-out border shadow-lg ${
          mobileMenuOpen ? 'rounded-3xl' : 'rounded-full'
        } ${
          scrolled
            ? 'bg-white/90 dark:bg-slate-900/90 border-slate-200/80 dark:border-slate-800 text-slate-800 dark:text-slate-100 shadow-xl'
            : 'bg-black/40 dark:bg-black/60 border-white/15 text-white shadow-2xl'
        }`}
      >
        <div className="flex items-center justify-between px-4 sm:px-6 py-2.5 sm:py-3">
          {/* Logo & Brand (OSINTRA Style) */}
          <button
            onClick={() => scrollToSection('beranda')}
            className="flex items-center gap-2.5 text-left group cursor-pointer focus:outline-none"
            title="Kembali ke Beranda"
          >
            <div className="relative">
              <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-gradient-to-tr from-emerald-600 via-teal-500 to-amber-300 p-0.5 shadow-md group-hover:scale-105 transition-transform">
                <div className="w-full h-full bg-[#0a0f0d] rounded-full flex items-center justify-center">
                  <Shield className="w-4 h-4 text-emerald-400 group-hover:rotate-6 transition-transform" />
                </div>
              </div>
            </div>
            <div>
              <span
                className={`font-heading font-black text-sm sm:text-base tracking-wider uppercase transition-colors ${
                  scrolled ? 'text-slate-900 dark:text-white' : 'text-white'
                }`}
              >
                OSINTRA
              </span>
              <p
                className={`text-[10px] hidden sm:block tracking-wide font-medium line-clamp-1 transition-colors ${
                  scrolled ? 'text-slate-500 dark:text-slate-400' : 'text-white/70'
                }`}
              >
                SMKN 1 Cerdas Bangsa
              </p>
            </div>
          </button>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-1 lg:gap-1.5">
            {navLinks.map((link) => {
              const isActive = activeSection === link.id;
              return (
                <button
                  key={link.id}
                  onClick={() => scrollToSection(link.id)}
                  className={`px-3 py-1.5 text-xs font-semibold rounded-full transition-all duration-150 cursor-pointer ${
                    isActive
                      ? scrolled
                        ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-xs'
                        : 'bg-white text-slate-900 shadow-md font-bold'
                      : scrolled
                      ? 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/60'
                      : 'text-white/80 hover:text-white hover:bg-white/10'
                  }`}
                >
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
              className={`p-2 rounded-full transition-all duration-200 cursor-pointer ${
                scrolled
                  ? 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                  : 'text-white/80 hover:text-white hover:bg-white/10'
              }`}
              aria-label="Ganti tema mode gelap/terang"
              title={theme === 'dark' ? 'Mode Terang' : 'Mode Gelap'}
            >
              {theme === 'dark' ? (
                <Sun className="w-4 h-4 text-amber-400" />
              ) : (
                <Moon className="w-4 h-4" />
              )}
            </button>

            {/* Portal Admin CTA */}
            <button
              onClick={onAdminLogin}
              className={`hidden sm:inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-bold transition-all duration-200 shadow-xs cursor-pointer hover:scale-105 active:scale-95 ${
                scrolled
                  ? 'bg-emerald-700 hover:bg-emerald-800 text-white shadow-emerald-700/20'
                  : 'bg-white hover:bg-amber-100 text-slate-900'
              }`}
            >
              <LogIn className="w-3.5 h-3.5" />
              <span>Portal Admin</span>
            </button>

            {/* Mobile Hamburger Toggle */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className={`p-2 md:hidden rounded-full cursor-pointer transition-colors ${
                scrolled
                  ? 'text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800'
                  : 'text-white hover:bg-white/10'
              }`}
              aria-label="Buka menu navigasi"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Dropdown Menu inside capsule */}
        {mobileMenuOpen && (
          <div
            className={`md:hidden px-4 pt-2 pb-4 border-t space-y-1 ${
              scrolled
                ? 'border-slate-200/80 dark:border-slate-800'
                : 'border-white/15'
            }`}
          >
            {navLinks.map((link) => {
              const isActive = activeSection === link.id;
              return (
                <button
                  key={link.id}
                  onClick={() => scrollToSection(link.id)}
                  className={`w-full flex items-center justify-between px-3.5 py-2 rounded-xl text-sm font-semibold transition-colors cursor-pointer ${
                    isActive
                      ? scrolled
                        ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900'
                        : 'bg-white text-slate-900'
                      : scrolled
                      ? 'text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800'
                      : 'text-white/90 hover:bg-white/10'
                  }`}
                >
                  <span>{link.label}</span>
                  {isActive && <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />}
                </button>
              );
            })}

            <div className="pt-2">
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  onAdminLogin();
                }}
                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold bg-emerald-700 hover:bg-emerald-800 text-white shadow-xs cursor-pointer"
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

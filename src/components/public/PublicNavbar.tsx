import React, { useState, useEffect } from 'react';
import { Menu, X, ArrowRight } from 'lucide-react';
import { PortalOrganization } from '../../data/portalData';

interface PublicNavbarProps {
  organization: PortalOrganization;
  onAdminLogin: () => void;
  onRegisterClick?: () => void;
}

export const PublicNavbar: React.FC<PublicNavbarProps> = ({
  organization,
  onAdminLogin,
  onRegisterClick,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeSection, setActiveSection] = useState('beranda');

  useEffect(() => {
    const handleScroll = () => {
      const sections = ['beranda', 'visi-misi', 'tentang', 'pengurus', 'kegiatan', 'galeri', 'pengumuman', 'kontak', 'testimoni'];
      const current = sections.find((sec) => {
        const el = document.getElementById(sec);
        if (el) {
          const rect = el.getBoundingClientRect();
          return rect.top <= 160 && rect.bottom >= 160;
        }
        return false;
      });
      if (current) {
        if (current === 'visi-misi' || current === 'tentang') {
          setActiveSection('tentang');
        } else if (current === 'testimoni') {
          setActiveSection('kontak');
        } else {
          setActiveSection(current);
        }
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { href: '#beranda', id: 'beranda', label: 'Beranda' },
    { href: '#visi-misi', id: 'tentang', label: 'Tentang' },
    { href: '#pengurus', id: 'pengurus', label: 'Struktur' },
    { href: '#kegiatan', id: 'kegiatan', label: 'Kegiatan' },
    { href: '#galeri', id: 'galeri', label: 'Galeri' },
    { href: '#kontak', id: 'kontak', label: 'Kontak' },
  ];

  const handleNavClick = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    e.preventDefault();
    setMobileMenuOpen(false);
    const targetId = href.replace('#', '');
    const element = document.getElementById(targetId);
    if (element) {
      const navOffset = 95;
      const elementPosition = element.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - navOffset;
      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth',
      });
    }
  };

  const handleRegister = () => {
    setMobileMenuOpen(false);
    if (onRegisterClick) {
      onRegisterClick();
    } else {
      const cta = document.getElementById('kontak');
      if (cta) {
        cta.scrollIntoView({ behavior: 'smooth' });
      }
    }
  };

  return (
    <header className="fixed top-3 sm:top-5 inset-x-0 z-50 flex justify-center px-3 sm:px-6 pointer-events-none">
      <div
        className={`pointer-events-auto w-full max-w-5xl bg-white/95 backdrop-blur-md border border-[#E2E8F0] shadow-md transition-all duration-300 ease-out ${
          mobileMenuOpen ? 'rounded-3xl' : 'rounded-full'
        } px-4 sm:px-6 py-2.5 sm:py-3`}
      >
        <div className="flex items-center justify-between">
          {/* Logo Brand dengan Ikon Kotak Membulat Gelap (OSINTRA Style) */}
          <a
            href="#beranda"
            className="flex items-center gap-2.5 sm:gap-3 group focus:outline-none"
            onClick={(e) => {
              e.preventDefault();
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
          >
            <div className="w-9 h-9 rounded-xl bg-[#1E3A8A] flex items-center justify-center text-white font-black text-sm shadow-xs group-hover:bg-[#2563EB] transition-colors">
              <span className="w-4 h-4 rounded-full border-2 border-white flex items-center justify-center text-[10px]">
                ●
              </span>
            </div>
            <div className="flex flex-col">
              <span className="text-sm sm:text-base font-extrabold text-[#0F172A] tracking-tight leading-none">
                SIMO
              </span>
              <span className="text-[10px] text-[#64748B] font-semibold leading-tight line-clamp-1">
                {organization.name || 'Portal Resmi OSIS'}
              </span>
            </div>
          </a>

          {/* Desktop Nav Links dengan Indikator Titik Aktif di Bawah */}
          <nav className="hidden md:flex items-center gap-6 lg:gap-8">
            {navLinks.map((link) => {
              const isActive = activeSection === link.id;
              return (
                <a
                  key={link.href}
                  href={link.href}
                  onClick={(e) => handleNavClick(e, link.href)}
                  className={`relative text-xs sm:text-sm font-semibold transition-colors py-1 flex flex-col items-center ${
                    isActive
                      ? 'text-[#0F172A] font-bold'
                      : 'text-[#64748B] hover:text-[#2563EB]'
                  }`}
                >
                  <span>{link.label}</span>
                  {isActive && (
                    <span className="w-1.5 h-1.5 rounded-full bg-[#1E3A8A] absolute -bottom-1" />
                  )}
                </a>
              );
            })}
          </nav>

          {/* Desktop Action Buttons */}
          <div className="hidden md:flex items-center gap-2.5">
            <button
              onClick={onAdminLogin}
              className="px-3.5 py-1.5 text-xs font-bold text-[#2563EB] bg-white border border-[#2563EB] rounded-full hover:bg-[#EFF6FF] transition-all cursor-pointer"
            >
              Masuk
            </button>
            <button
              onClick={handleRegister}
              className="px-4 py-1.5 text-xs font-bold text-white bg-[#2563EB] hover:bg-blue-700 rounded-full shadow-xs transition-all cursor-pointer flex items-center gap-1"
            >
              Daftar
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Mobile Hamburger Toggle */}
          <div className="flex md:hidden items-center gap-2">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-1.5 rounded-full text-[#0F172A] hover:bg-[#EFF6FF] transition-colors focus:outline-none"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Drawer Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden pt-4 pb-2 border-t border-[#E2E8F0] mt-3 space-y-3 animate-fade-in">
            <div className="flex flex-col space-y-1">
              {navLinks.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  onClick={(e) => handleNavClick(e, link.href)}
                  className="px-3 py-2 rounded-xl text-sm font-semibold text-[#0F172A] hover:text-[#2563EB] hover:bg-[#EFF6FF] transition-colors"
                >
                  {link.label}
                </a>
              ))}
            </div>
            <div className="pt-3 border-t border-[#E2E8F0] flex flex-col gap-2">
              <button
                onClick={onAdminLogin}
                className="w-full py-2 text-center text-xs font-bold text-[#2563EB] border border-[#2563EB] rounded-full hover:bg-[#EFF6FF] transition-colors cursor-pointer"
              >
                Masuk Dashboard
              </button>
              <button
                onClick={handleRegister}
                className="w-full py-2 text-center text-xs font-bold text-white bg-[#2563EB] hover:bg-blue-700 rounded-full shadow-xs transition-colors cursor-pointer"
              >
                Daftar Jadi Anggota
              </button>
            </div>
          </div>
        )}
      </div>
    </header>
  );
};

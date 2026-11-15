import React, { useState, useEffect, useRef } from 'react';
import { Menu, X, ArrowRight } from 'lucide-react';
import { PortalOrganization } from '../../data/portalData';
import { useApp } from '../../context/AppContext';

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
  const { showToast } = useApp();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeSection, setActiveSection] = useState('beranda');
  const menuContainerRef = useRef<HTMLDivElement>(null);

  // Close menu on click outside or Escape key
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuContainerRef.current && !menuContainerRef.current.contains(event.target as Node)) {
        setMobileMenuOpen(false);
      }
    };
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setMobileMenuOpen(false);
      }
    };

    if (mobileMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [mobileMenuOpen]);

  // Secret 5x logo click mechanism
  const [logoClickCount, setLogoClickCount] = useState(0);
  const clickTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [isLogoPulsing, setIsLogoPulsing] = useState(false);

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
        const headerOffset = 90;
        const elementPosition = cta.getBoundingClientRect().top;
        const offsetPosition = elementPosition + window.pageYOffset - headerOffset;
        window.scrollTo({
          top: offsetPosition,
          behavior: 'smooth',
        });
      }
    }
  };

  return (
    <header className="fixed top-3 sm:top-5 inset-x-0 z-50 flex justify-center px-3 sm:px-6 pointer-events-none">
      <div
        ref={menuContainerRef}
        className={`pointer-events-auto w-full max-w-5xl bg-[#FFFDF8]/95 backdrop-blur-md border border-[#E6DFD0] shadow-sm transition-[box-shadow,background-color] duration-300 ease-out ${
          mobileMenuOpen ? 'rounded-2xl sm:rounded-3xl' : 'rounded-[28px] md:rounded-full'
        } px-4 sm:px-6 py-2.5 sm:py-3`}
      >
        <div className="flex items-center justify-between">
          {/* Logo Brand dengan Secret 5x Click Gesture */}
          <a
            href="#beranda"
            className="flex items-center gap-2.5 sm:gap-3 group focus:outline-none select-none cursor-pointer"
            onClick={(e) => {
              e.preventDefault();

              // Micro-feedback scale on click
              setIsLogoPulsing(true);
              setTimeout(() => setIsLogoPulsing(false), 220);

              if (clickTimerRef.current) {
                clearTimeout(clickTimerRef.current);
              }

              const nextCount = logoClickCount + 1;

              if (nextCount >= 5) {
                setLogoClickCount(0);
                showToast('Akses Khusus Terbuka: Mengarahkan ke Halaman Login Pengurus...', 'success');
                onAdminLogin();
              } else {
                setLogoClickCount(nextCount);

                // Friendly secret gesture hint
                if (nextCount === 3) {
                  showToast('2 klik lagi untuk akses login pengurus...', 'info');
                } else if (nextCount === 4) {
                  showToast('1 klik lagi untuk membuka login pengurus!', 'info');
                }

                clickTimerRef.current = setTimeout(() => {
                  setLogoClickCount(0);
                }, 2500);

                // Normal smooth scroll to top on single click
                if (nextCount === 1) {
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }
              }
            }}
            title={`${organization.appName || organization.shortName || 'SIMO'} - Portal Resmi OSIS`}
          >
            {organization.logoUrl ? (
              <img
                src={organization.logoUrl}
                alt="Logo"
                className={`w-9 h-9 rounded-xl object-cover shrink-0 border border-[#E6DFD0] shadow-2xs group-hover:scale-105 transition-all duration-200 ${
                  isLogoPulsing ? 'scale-90 ring-2 ring-[#F2B544]' : 'scale-100'
                }`}
                onError={(e) => {
                  (e.target as HTMLImageElement).style.display = 'none';
                  (e.target as HTMLElement).nextElementSibling?.classList.remove('hidden');
                }}
              />
            ) : null}
            <div
              className={`w-9 h-9 rounded-xl bg-[#1F3A5F] flex items-center justify-center text-[#FAF6EE] font-black text-sm shadow-2xs group-hover:bg-[#162B46] transition-all duration-200 ${
                organization.logoUrl ? 'hidden' : ''
              } ${isLogoPulsing ? 'scale-90 ring-2 ring-[#F2B544]' : 'scale-100'}`}
            >
              <span className="w-4 h-4 rounded-full border-2 border-[#F2B544] flex items-center justify-center text-[10px] text-[#F2B544]">
                ●
              </span>
            </div>
            <div className="flex flex-col min-w-0">
              <span className="text-sm sm:text-base font-extrabold text-[#1F3A5F] tracking-tight leading-none truncate">
                {organization.appName || organization.shortName || 'SIMO'}
              </span>
              <span className="text-[12px] sm:text-[13px] text-[#5A6472] font-semibold mt-1 truncate">
                {organization.academicYear || '2025/2026'}
              </span>
            </div>
          </a>

          {/* Desktop Nav Links dengan Indikator Titik Aktif Emas di Bawah */}
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
                      ? 'text-[#1F3A5F] font-bold'
                      : 'text-[#5A6472] hover:text-[#1F3A5F]'
                  }`}
                >
                  <span>{link.label}</span>
                  {isActive && (
                    <span className="w-1.5 h-1.5 rounded-full bg-[#F2B544] absolute -bottom-1" />
                  )}
                </a>
              );
            })}
          </nav>

          {/* Desktop Action Buttons: Tombol Masuk Tersembunyi (Akses via 5x Klik Logo) */}
          <div className="hidden md:flex items-center gap-2.5">
            <button
              onClick={handleRegister}
              className="px-4 py-1.5 text-xs font-extrabold text-[#1F3A5F] bg-[#F2B544] hover:bg-[#E0A12F] rounded-full shadow-2xs transition-all cursor-pointer flex items-center gap-1"
            >
              Daftar
              <ArrowRight className="w-3.5 h-3.5 text-[#1F3A5F]" />
            </button>
          </div>

          {/* Mobile Hamburger Toggle */}
          <div className="flex md:hidden items-center gap-2">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="min-h-[44px] min-w-[44px] flex items-center justify-center rounded-full text-[#1F3A5F] hover:bg-[#E4EAF2] transition-colors focus:outline-none cursor-pointer"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Drawer Menu dengan transisi accordion mulus tanpa glitch lingkaran */}
        <div
          className={`grid md:hidden transition-[grid-template-rows,opacity,margin,padding] duration-300 ease-in-out ${
            mobileMenuOpen
              ? 'grid-rows-[1fr] opacity-100 mt-3 pt-3 border-t border-[#E6DFD0]'
              : 'grid-rows-[0fr] opacity-0 mt-0 pt-0 border-t-0 pointer-events-none'
          }`}
        >
          <div className="overflow-hidden">
            <div className="flex flex-col space-y-1 pb-2">
              {navLinks.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  onClick={(e) => handleNavClick(e, link.href)}
                  className="px-3.5 py-2.5 rounded-xl text-sm font-semibold text-[#1F3A5F] hover:bg-[#E4EAF2] transition-colors flex items-center justify-between"
                >
                  <span>{link.label}</span>
                  {activeSection === link.id && (
                    <span className="w-2 h-2 rounded-full bg-[#F2B544]" />
                  )}
                </a>
              ))}
            </div>
            <div className="pt-3 border-t border-[#E6DFD0] flex flex-col gap-2 pb-1">
              <button
                onClick={handleRegister}
                className="w-full min-h-[44px] flex items-center justify-center text-center text-xs font-extrabold text-[#1F3A5F] bg-[#F2B544] hover:bg-[#E0A12F] rounded-full shadow-2xs transition-colors cursor-pointer"
              >
                Daftar Jadi Anggota
              </button>
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  onAdminLogin();
                }}
                className="w-full min-h-[40px] flex items-center justify-center text-center text-xs font-bold text-[#5A6472] hover:text-[#1F3A5F] hover:bg-[#E4EAF2] rounded-full transition-colors cursor-pointer"
              >
                Akses Pengurus (Login)
              </button>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

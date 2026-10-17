import React from 'react';
import { Mail, MapPin, Clock, ArrowUp } from 'lucide-react';
import { InstagramIcon, YoutubeIcon, GithubIcon } from '../portal/SocialIcons';
import { PortalOrganization } from '../../data/portalData';

interface PublicFooterProps {
  organization: PortalOrganization;
  onAdminLogin?: () => void;
}

export const PublicFooter: React.FC<PublicFooterProps> = ({
  organization,
  onAdminLogin,
}) => {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const scrollToSection = (e: React.MouseEvent<HTMLAnchorElement>, id: string) => {
    e.preventDefault();
    const el = document.getElementById(id);
    if (el) {
      const navOffset = 80;
      const elPos = el.getBoundingClientRect().top;
      const offset = elPos + window.pageYOffset - navOffset;
      window.scrollTo({ top: offset, behavior: 'smooth' });
    }
  };

  return (
    <footer className="bg-[#1E3A8A] text-white pt-16 pb-10 border-t border-blue-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 lg:gap-12 pb-12 border-b border-blue-800/80">
          {/* Kolom 1: Logo & Deskripsi */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-white text-[#1E3A8A] font-bold text-lg flex items-center justify-center shadow-sm">
                S
              </div>
              <span className="text-xl font-bold tracking-tight text-white">
                SIMO
              </span>
            </div>
            <p className="text-sm text-blue-100/80 leading-relaxed">
              {organization.tagline ||
                'Sistem Informasi Manajemen Organisasi untuk keterbukaan, kolaborasi, dan akuntabilitas kegiatan seluruh anggota.'}
            </p>
            <div className="pt-1">
              <button
                onClick={onAdminLogin}
                className="text-xs text-blue-200 hover:text-white underline underline-offset-4 cursor-pointer transition-colors"
              >
                Akses Dashboard Pengurus &rarr;
              </button>
            </div>
          </div>

          {/* Kolom 2: Organisasi */}
          <div className="space-y-3">
            <h4 className="text-sm font-bold uppercase tracking-wider text-blue-200">
              Organisasi
            </h4>
            <ul className="space-y-2 text-sm text-blue-100/80">
              <li>
                <a
                  href="#tentang"
                  onClick={(e) => scrollToSection(e, 'tentang')}
                  className="hover:text-white transition-colors"
                >
                  Tentang Kami
                </a>
              </li>
              <li>
                <a
                  href="#pengurus"
                  onClick={(e) => scrollToSection(e, 'pengurus')}
                  className="hover:text-white transition-colors"
                >
                  Susunan Pengurus
                </a>
              </li>
              <li>
                <a
                  href="#testimoni"
                  onClick={(e) => scrollToSection(e, 'testimoni')}
                  className="hover:text-white transition-colors"
                >
                  Kata Anggota
                </a>
              </li>
            </ul>
          </div>

          {/* Kolom 3: Kegiatan & Informasi */}
          <div className="space-y-3">
            <h4 className="text-sm font-bold uppercase tracking-wider text-blue-200">
              Kegiatan
            </h4>
            <ul className="space-y-2 text-sm text-blue-100/80">
              <li>
                <a
                  href="#kegiatan"
                  onClick={(e) => scrollToSection(e, 'kegiatan')}
                  className="hover:text-white transition-colors"
                >
                  Kegiatan Mendatang
                </a>
              </li>
              <li>
                <a
                  href="#galeri"
                  onClick={(e) => scrollToSection(e, 'galeri')}
                  className="hover:text-white transition-colors"
                >
                  Dokumentasi & Galeri
                </a>
              </li>
              <li>
                <a
                  href="#pengumuman"
                  onClick={(e) => scrollToSection(e, 'pengumuman')}
                  className="hover:text-white transition-colors"
                >
                  Pengumuman Resmi
                </a>
              </li>
              <li>
                <a
                  href="#kontak"
                  onClick={(e) => scrollToSection(e, 'kontak')}
                  className="hover:text-white transition-colors"
                >
                  Kontak &amp; Pendaftaran
                </a>
              </li>
            </ul>
          </div>

          {/* Kolom 4: Kontak & Sosial Media */}
          <div className="space-y-3">
            <h4 className="text-sm font-bold uppercase tracking-wider text-blue-200">
              Kontak
            </h4>
            <div className="space-y-2.5 text-xs sm:text-sm text-blue-100/80">
              <div className="flex items-start gap-2.5">
                <MapPin className="w-4 h-4 text-blue-300 shrink-0 mt-0.5" />
                <span>{organization.contact.address}</span>
              </div>
              <div className="flex items-center gap-2.5">
                <Mail className="w-4 h-4 text-blue-300 shrink-0" />
                <a
                  href={`mailto:${organization.contact.email}`}
                  className="hover:text-white transition-colors underline"
                >
                  {organization.contact.email}
                </a>
              </div>
              <div className="flex items-center gap-2.5">
                <Clock className="w-4 h-4 text-blue-300 shrink-0" />
                <span>{organization.contact.piketHours}</span>
              </div>
            </div>

            {/* Sosial Media */}
            <div className="pt-2 flex items-center gap-3 text-blue-200">
              {organization.socials?.instagram && (
                <a
                  href={organization.socials.instagram}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-8 h-8 rounded-lg bg-blue-900/80 hover:bg-white hover:text-[#1E3A8A] flex items-center justify-center transition-colors"
                  aria-label="Instagram"
                >
                  <InstagramIcon className="w-4 h-4" />
                </a>
              )}
              {organization.socials?.youtube && (
                <a
                  href={organization.socials.youtube}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-8 h-8 rounded-lg bg-blue-900/80 hover:bg-white hover:text-[#1E3A8A] flex items-center justify-center transition-colors"
                  aria-label="YouTube"
                >
                  <YoutubeIcon className="w-4 h-4" />
                </a>
              )}
              {organization.socials?.github && (
                <a
                  href={organization.socials.github}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-8 h-8 rounded-lg bg-blue-900/80 hover:bg-white hover:text-[#1E3A8A] flex items-center justify-center transition-colors"
                  aria-label="GitHub"
                >
                  <GithubIcon className="w-4 h-4" />
                </a>
              )}
            </div>
          </div>
        </div>

        {/* Baris Bawah */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-blue-200/80">
          <p>
            &copy; {new Date().getFullYear()} {organization.name}. Seluruh hak cipta dilindungi.
          </p>

          <div className="flex items-center gap-6">
            <a href="#" className="hover:text-white transition-colors">
              Kebijakan Privasi
            </a>
            <a href="#" className="hover:text-white transition-colors">
              Syarat & Ketentuan
            </a>
            <button
              onClick={scrollToTop}
              className="w-8 h-8 rounded-full bg-blue-900/80 hover:bg-white hover:text-[#1E3A8A] flex items-center justify-center transition-colors cursor-pointer ml-2"
              title="Kembali ke atas"
            >
              <ArrowUp className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
};

import React from 'react';
import {
  Shield,
  MapPin,
  Mail,
  Phone,
  Clock,
  Instagram,
  Youtube,
  Github,
  ArrowUp,
  LogIn,
  Heart,
  ExternalLink,
} from 'lucide-react';
import { PortalOrganization } from '../../data/portalData';

interface PortalFooterProps {
  organization: PortalOrganization;
  onAdminLogin: () => void;
}

export const PortalFooter: React.FC<PortalFooterProps> = ({
  organization,
  onAdminLogin,
}) => {
  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  };

  const scrollToSection = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      const navOffset = 76;
      const elementPosition = el.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - navOffset;
      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth',
      });
    }
  };

  return (
    <footer className="bg-slate-900 text-slate-300 border-t border-slate-800 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-12 space-y-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-10">
          {/* Col 1: Brand & Description (5 cols) */}
          <div className="lg:col-span-5 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white shadow-md">
                <Shield className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-heading font-black text-lg text-white">
                  OSIS SMKN 1 CERDAS BANGSA
                </h3>
                <p className="text-xs text-blue-400 font-medium">
                  Portal Transparansi &amp; Informasi Publik
                </p>
              </div>
            </div>

            <p className="text-xs sm:text-sm text-slate-400 leading-relaxed max-w-sm">
              Wadah representatif kesiswaan resmi yang berkomitmen menjunjung integritas, inovasi, dan akuntabilitas terbuka untuk seluruh warga sekolah.
            </p>

            {/* Social Media Links */}
            <div className="flex items-center gap-2.5 pt-2">
              <a
                href={organization.socials.instagram}
                target="_blank"
                rel="noreferrer"
                className="w-9 h-9 rounded-xl bg-slate-800 hover:bg-pink-600 hover:text-white flex items-center justify-center text-slate-400 transition-colors"
                title="Instagram OSIS"
              >
                <Instagram className="w-4 h-4" />
              </a>
              <a
                href={organization.socials.youtube}
                target="_blank"
                rel="noreferrer"
                className="w-9 h-9 rounded-xl bg-slate-800 hover:bg-red-600 hover:text-white flex items-center justify-center text-slate-400 transition-colors"
                title="YouTube Resmi"
              >
                <Youtube className="w-4 h-4" />
              </a>
              <a
                href={organization.socials.github}
                target="_blank"
                rel="noreferrer"
                className="w-9 h-9 rounded-xl bg-slate-800 hover:bg-slate-700 hover:text-white flex items-center justify-center text-slate-400 transition-colors"
                title="Source Code Repository"
              >
                <Github className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Col 2: Navigasi Cepat (3 cols) */}
          <div className="lg:col-span-3 space-y-3">
            <h4 className="font-heading font-bold text-sm uppercase tracking-wider text-white">
              Navigasi Halaman
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <button
                  onClick={() => scrollToSection('beranda')}
                  className="hover:text-blue-400 transition-colors cursor-pointer"
                >
                  Beranda Utama
                </button>
              </li>
              <li>
                <button
                  onClick={() => scrollToSection('proker')}
                  className="hover:text-blue-400 transition-colors cursor-pointer"
                >
                  Dashboard Program Kerja
                </button>
              </li>
              <li>
                <button
                  onClick={() => scrollToSection('linimasa')}
                  className="hover:text-blue-400 transition-colors cursor-pointer"
                >
                  Linimasa &amp; Agenda Kegiatan
                </button>
              </li>
              <li>
                <button
                  onClick={() => scrollToSection('galeri')}
                  className="hover:text-blue-400 transition-colors cursor-pointer"
                >
                  Galeri Dokumentasi Foto
                </button>
              </li>
              <li>
                <button
                  onClick={() => scrollToSection('struktur')}
                  className="hover:text-blue-400 transition-colors cursor-pointer"
                >
                  Struktur Kepengurusan OSIS
                </button>
              </li>
              <li>
                <button
                  onClick={() => scrollToSection('tentang')}
                  className="hover:text-blue-400 transition-colors cursor-pointer"
                >
                  Visi Misi &amp; Suara Siswa
                </button>
              </li>
            </ul>
          </div>

          {/* Col 3: Kontak & Sekretariat (4 cols) */}
          <div className="lg:col-span-4 space-y-3">
            <h4 className="font-heading font-bold text-sm uppercase tracking-wider text-white">
              Sekretariat &amp; Kontak
            </h4>
            <ul className="space-y-2.5 text-xs text-slate-400">
              <li className="flex items-start gap-2.5">
                <MapPin className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
                <span>
                  {organization.contact.room}, {organization.contact.address}
                </span>
              </li>
              <li className="flex items-center gap-2.5">
                <Mail className="w-4 h-4 text-blue-400 shrink-0" />
                <span>{organization.contact.email}</span>
              </li>
              <li className="flex items-center gap-2.5">
                <Phone className="w-4 h-4 text-blue-400 shrink-0" />
                <span>{organization.contact.phone}</span>
              </li>
              <li className="flex items-center gap-2.5">
                <Clock className="w-4 h-4 text-amber-400 shrink-0" />
                <span>Piket: {organization.contact.piketHours}</span>
              </li>
            </ul>

            <div className="pt-2">
              <button
                onClick={onAdminLogin}
                className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition-colors cursor-pointer"
              >
                <LogIn className="w-3.5 h-3.5 text-blue-400" />
                <span>Login Pengurus &amp; Pembina</span>
              </button>
            </div>
          </div>
        </div>

        {/* Bottom Bar: Copyright & Back to Top */}
        <div className="pt-8 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <p>
            © {new Date().getFullYear()} {organization.name}. Seluruh hak cipta dilindungi.
          </p>

          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1">
              Dibuat dengan <Heart className="w-3 h-3 text-rose-500 fill-rose-500" /> untuk transparansi kesiswaan
            </span>

            <button
              onClick={scrollToTop}
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors cursor-pointer"
              title="Kembali ke atas"
              aria-label="Kembali ke atas"
            >
              <ArrowUp className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
};

import React, { useState } from 'react';
import {
  Shield,
  Heart,
  Compass,
  Briefcase,
  Laptop,
  Palette,
  Users,
  Award,
  Sparkles,
  TreePine,
  Share2,
  CheckCircle,
} from 'lucide-react';
import { Highlight } from './Highlight';
import { SectionHeader } from './SectionHeader';
import { PortalDivision, PortalWorkProgram } from '../../data/portalData';

interface ProgramGridProps {
  divisions?: PortalDivision[];
  workPrograms?: PortalWorkProgram[];
  onSelectDivision?: (code: string) => void;
}

// Helper ikon per divisi
const getDivisionIcon = (code: string) => {
  switch (code.toUpperCase()) {
    case 'BPH':
      return <Shield className="w-5 h-5" />;
    case 'SEKBID-1':
      return <Heart className="w-5 h-5" />;
    case 'SEKBID-2':
      return <Compass className="w-5 h-5" />;
    case 'SEKBID-3':
      return <Briefcase className="w-5 h-5" />;
    case 'SEKBID-4':
      return <Laptop className="w-5 h-5" />;
    case 'SEKBID-5':
      return <Palette className="w-5 h-5" />;
    case 'SEKBID-6':
      return <Users className="w-5 h-5" />;
    case 'SEKBID-7':
      return <TreePine className="w-5 h-5" />;
    case 'SEKBID-8':
      return <Share2 className="w-5 h-5" />;
    default:
      return <Sparkles className="w-5 h-5" />;
  }
};

const DEFAULT_DIVISIONS: PortalDivision[] = [
  { code: 'BPH', name: 'Badan Pengurus Harian', description: 'Kebijakan umum, administrasi, dan koordinasi terpadu.', leaderName: 'Fajar Pratama', color: 'blue' },
  { code: 'SEKBID-1', name: 'Ketaqwaan & Nilai Moral', description: 'Pembinaan keagamaan dan toleransi sekolah.', leaderName: 'Siti Rahma', color: 'blue' },
  { code: 'SEKBID-2', name: 'Bela Negara & Kedisiplinan', description: 'Kepemimpinan dan kepramukaan siswa.', leaderName: 'Dimas Wicaksono', color: 'blue' },
  { code: 'SEKBID-3', name: 'Kewirausahaan Siswa', description: 'Ekonomi kreatif dan kemandirian vokasi.', leaderName: 'Nadia Safitri', color: 'blue' },
  { code: 'SEKBID-4', name: 'TIK & Media Komunikasi', description: 'Pengelolaan sistem digital dan publikasi.', leaderName: 'Rian Hidayat', color: 'blue' },
  { code: 'SEKBID-5', name: 'Seni, Budaya & Olahraga', description: 'Pengembangan minat bakat dan turnamen.', leaderName: 'Maya Anggraini', color: 'blue' },
  { code: 'SEKBID-6', name: 'Kepemimpinan & Demokrasi', description: 'Forum aspirasi dan pendidikan pemilih pemula.', leaderName: 'Aditya Pratama', color: 'blue' },
  { code: 'SEKBID-7', name: 'Lingkungan Hidup', description: 'Sekolah hijau dan kesadaran ekologi.', leaderName: 'Clara Putri', color: 'blue' },
  { code: 'SEKBID-8', name: 'Humas & Kemitraan', description: 'Jejaring industri dan alumni kejuruan.', leaderName: 'Reza Akbar', color: 'blue' },
  { code: 'SEKBID-9', name: 'Kesehatan & PMR', description: 'Pertolongan pertama dan kesehatan siswa.', leaderName: 'Farhan Maulana', color: 'blue' },
];

export const ProgramGrid: React.FC<ProgramGridProps> = ({
  divisions = DEFAULT_DIVISIONS,
  workPrograms = [],
  onSelectDivision,
}) => {
  // Kartu pertama atau TIK aktif default seperti referensi
  const [activeCode, setActiveCode] = useState<string>('SEKBID-4');

  // Hitung jumlah proker per divisi
  const getProkerCount = (divCode: string) => {
    if (!workPrograms || workPrograms.length === 0) return '3-5 Program';
    const count = workPrograms.filter(
      (p) => p.divisionCode?.toUpperCase() === divCode.toUpperCase()
    ).length;
    return count > 0 ? `${count} Program kerja` : '3 Program kerja';
  };

  const handleCardClick = (code: string) => {
    setActiveCode(code);
    if (onSelectDivision) {
      onSelectDivision(code);
    }
  };

  return (
    <section id="program" className="bg-white py-16 sm:py-24 border-b border-[#E2E8F0]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <SectionHeader
          badge="PROGRAM KAMI"
          title={
            <>
              Temukan <Highlight>divisi</Highlight> yang cocok
            </>
          }
          description="Eksplorasi ragam bidang organisasi yang mewadahi minat, keahlian, dan aksi nyata seluruh siswa."
          align="center"
        />

        {/* Grid Kartu Kategori (Inspirasi layout 3-4-3 seperti referensi) */}
        <div className="flex flex-wrap justify-center gap-3 sm:gap-4 max-w-5xl mx-auto">
          {divisions.map((div) => {
            const isActive = activeCode === div.code;

            return (
              <button
                key={div.code}
                onClick={() => handleCardClick(div.code)}
                className={`flex items-center gap-3.5 px-4 sm:px-5 py-3 sm:py-3.5 rounded-xl border text-left transition-all duration-200 cursor-pointer w-full sm:w-[calc(50%-0.75rem)] md:w-[calc(33.333%-1rem)] lg:w-[calc(25%-1rem)] xl:w-auto xl:min-w-[210px] xl:max-w-[240px] flex-grow ${
                  isActive
                    ? 'bg-[#2563EB] border-[#2563EB] text-white shadow-md'
                    : 'bg-white border-[#E2E8F0] text-[#0F172A] hover:border-[#2563EB]/50 hover:bg-[#EFF6FF]/40'
                }`}
              >
                {/* Lingkaran Ikon */}
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 transition-colors ${
                    isActive
                      ? 'bg-white/20 text-white'
                      : 'bg-[#EFF6FF] text-[#2563EB]'
                  }`}
                >
                  {getDivisionIcon(div.code)}
                </div>

                {/* Teks */}
                <div className="min-w-0 flex-1">
                  <h3
                    className={`text-xs sm:text-sm font-bold truncate leading-snug ${
                      isActive ? 'text-white' : 'text-[#0F172A]'
                    }`}
                  >
                    {div.name}
                  </h3>
                  <p
                    className={`text-[11px] leading-none mt-1 ${
                      isActive ? 'text-blue-100' : 'text-[#64748B]'
                    }`}
                  >
                    {getProkerCount(div.code)}
                  </p>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </section>
  );
};

import React from 'react';
import {
  User,
  UserCheck,
  FileText,
  Wallet,
  Share2,
  Camera,
  Eye,
} from 'lucide-react';
import { Highlight } from './Highlight';
import { ScrollReveal } from '../common/ScrollReveal';

export interface BoardMember {
  id: string;
  name: string;
  role: string;
  photoUrl?: string;
  division?: string;
}

interface BoardSectionProps {
  members?: BoardMember[];
}

export const BoardSection: React.FC<BoardSectionProps> = () => {
  const topLeaders = [
    {
      title: 'Ketua OSIS',
      icon: <User className="w-5 h-5 text-white" />,
      desc: 'Pemimpin tertinggi yang bertanggung jawab atas seluruh kebijakan, koordinasi organisasi, dan menjadi perwakilan resmi siswa di dalam maupun luar sekolah.',
    },
    {
      title: 'Wakil Ketua OSIS',
      icon: <UserCheck className="w-5 h-5 text-white" />,
      desc: 'Pendamping utama ketua dalam menjalankan tugas, memberi saran keputusan, serta mengawasi kinerja divisi agar program kerja tetap berjalan lancar.',
    },
  ];

  const coreOfficers = [
    {
      title: 'SEKRETARIS',
      icon: <FileText className="w-5 h-5" />,
      desc: 'Mengelola administrasi organisasi, penyusunan proposal, surat-menyurat, arsip, dan dokumentasi kegiatan secara terstruktur.',
    },
    {
      title: 'BENDAHARA',
      icon: <Wallet className="w-5 h-5" />,
      desc: 'Mengelola anggaran, pencatatan pemasukan dan pengeluaran, serta menyusun laporan keuangan yang transparan.',
    },
    {
      title: 'HUBUNGAN MASYARAKAT',
      icon: <Share2 className="w-5 h-5" />,
      desc: 'Menjalin komunikasi organisasi dengan pihak internal dan eksternal serta menyampaikan informasi kegiatan secara efektif.',
    },
    {
      title: 'MEDIA KOMUNIKASI',
      icon: <Camera className="w-5 h-5" />,
      desc: 'Menjadi wajah digital organisasi melalui pengelolaan konten kreatif di media sosial dan dokumentasi kegiatan.',
    },
    {
      title: 'PENGAWAS SIE BID',
      icon: <Eye className="w-5 h-5" />,
      desc: 'Mengawasi dan mendampingi setiap bidang agar program berjalan sesuai rencana, tepat waktu, dan sejalan dengan visi OSIS.',
    },
  ];

  return (
    <section id="pengurus" className="bg-[#F8FAFC] py-16 sm:py-24 border-b border-[#E2E8F0]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header Section dengan ScrollReveal */}
        <ScrollReveal distance={30} duration={650}>
          <div className="text-center max-w-2xl mx-auto mb-14 sm:mb-16">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-[#1E3A8A] tracking-tight">
              Struktur <Highlight>Organisasi</Highlight> OSIS
            </h2>
            <div className="w-12 h-1 bg-[#2563EB] mx-auto my-3 rounded-full" />
            <p className="text-sm sm:text-base text-[#64748B] leading-relaxed">
              Hierarki kepemimpinan dan pembagian tugas dalam organisasi OSIS
            </p>
          </div>
        </ScrollReveal>

        {/* Tree Hierarki Organisasi */}
        <div className="max-w-6xl mx-auto">
          {/* TIER 1: Ketua & Wakil Ketua OSIS (Dua Kartu Biru Gelap) */}
          <div className="flex flex-col sm:flex-row justify-center items-stretch gap-6 max-w-2xl mx-auto">
            {topLeaders.map((leader, idx) => (
              <ScrollReveal
                key={idx}
                distance={36}
                duration={700}
                delay={idx * 120}
                className="flex-1 flex"
              >
                <div className="w-full bg-[#1E3A8A] text-white rounded-2xl p-6 sm:p-7 shadow-sm border border-blue-900 text-left flex flex-col justify-between hover:shadow-md transition-shadow">
                  <div>
                    <div className="w-10 h-10 rounded-xl bg-white/15 flex items-center justify-center mb-4">
                      {leader.icon}
                    </div>
                    <h3 className="text-lg sm:text-xl font-bold tracking-tight text-white mb-2">
                      {leader.title}
                    </h3>
                    <p className="text-xs sm:text-sm text-blue-100/90 leading-relaxed font-normal">
                      {leader.desc}
                    </p>
                  </div>
                </div>
              </ScrollReveal>
            ))}
          </div>

          {/* CONNECTOR LINE HIERARKI (Hanya Tampil di Layar Desktop/Tablet) */}
          <ScrollReveal distance={20} duration={500} delay={180}>
            <div className="hidden lg:block relative py-6">
              {/* Garis vertikal tengah turun dari Tier 1 */}
              <div className="w-0.5 h-6 bg-[#CBD5E1] mx-auto" />

              {/* Garis horizontal pembagi ke 5 cabang */}
              <div className="relative w-[90%] mx-auto h-0.5 bg-[#CBD5E1]">
                {/* Titik bulat (node) di setiap percabangan */}
                <div className="absolute left-[10%] -top-1 w-2.5 h-2.5 rounded-full bg-[#2563EB]" />
                <div className="absolute left-[30%] -top-1 w-2.5 h-2.5 rounded-full bg-[#2563EB]" />
                <div className="absolute left-[50%] -translate-x-1/2 -top-1 w-2.5 h-2.5 rounded-full bg-[#2563EB]" />
                <div className="absolute left-[70%] -top-1 w-2.5 h-2.5 rounded-full bg-[#2563EB]" />
                <div className="absolute left-[90%] -top-1 w-2.5 h-2.5 rounded-full bg-[#2563EB]" />
              </div>

              {/* Garis vertikal turun ke masing-masing kartu Tier 2 */}
              <div className="relative w-[90%] mx-auto h-6">
                <div className="absolute left-[10%] w-0.5 h-6 bg-[#CBD5E1]" />
                <div className="absolute left-[30%] w-0.5 h-6 bg-[#CBD5E1]" />
                <div className="absolute left-[50%] -translate-x-1/2 w-0.5 h-6 bg-[#CBD5E1]" />
                <div className="absolute left-[70%] w-0.5 h-6 bg-[#CBD5E1]" />
                <div className="absolute left-[90%] w-0.5 h-6 bg-[#CBD5E1]" />
              </div>
            </div>
          </ScrollReveal>

          {/* Jarak pengganti di mobile */}
          <div className="block lg:hidden h-8" />

          {/* TIER 2: 5 Kartu Pengurus Pelaksana */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 sm:gap-5">
            {coreOfficers.map((officer, idx) => (
              <ScrollReveal
                key={idx}
                distance={40}
                duration={700}
                delay={idx * 80}
                className="flex"
              >
                <div className="w-full bg-white border border-[#E2E8F0] rounded-2xl p-5 text-center shadow-xs hover:border-[#2563EB]/40 hover:shadow-sm transition-all flex flex-col items-center justify-between group">
                  <div>
                    {/* Ikon dalam kotak bulat gelap */}
                    <div className="w-11 h-11 rounded-xl bg-[#1E3A8A] text-white flex items-center justify-center mx-auto mb-3.5 group-hover:bg-[#2563EB] transition-colors">
                      {officer.icon}
                    </div>

                    {/* Judul Jabatan */}
                    <h4 className="text-xs sm:text-sm font-extrabold uppercase tracking-wider text-[#0F172A] mb-2 leading-snug">
                      {officer.title}
                    </h4>

                    {/* Uraian Tugas */}
                    <p className="text-[11px] sm:text-xs text-[#64748B] leading-relaxed">
                      {officer.desc}
                    </p>
                  </div>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

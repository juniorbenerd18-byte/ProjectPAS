import React, { useState } from 'react';
import {
  Compass,
  Target,
  MessageSquare,
  Send,
  ThumbsUp,
  ShieldCheck,
  CheckCircle2,
  Sparkles,
  Info,
  Building,
  Clock,
  MapPin,
  Search,
  Quote,
  Heart,
  Lightbulb,
  TrendingUp,
  User,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { PortalOrganization } from '../../data/portalData';
import { StudentAspiration, Member } from '../../types';

interface PortalAboutAndAspirasiProps {
  organization: PortalOrganization;
  aspirations: StudentAspiration[];
  onAddAspiration: (aspiration: Omit<StudentAspiration, 'id' | 'date' | 'status' | 'likes'>) => void;
  onLikeAspiration: (id: string) => void;
  members: Member[];
}

export const PortalAboutAndAspirasi: React.FC<PortalAboutAndAspirasiProps> = ({
  organization,
  aspirations,
  onAddAspiration,
  onLikeAspiration,
  members,
}) => {
  // Navigation Tab State
  const [activeTab, setActiveTab] = useState<'tentang' | 'aspirasi' | 'verifikasi'>('tentang');

  // Aspirasi Form State
  const [formName, setFormName] = useState('');
  const [formClass, setFormClass] = useState('');
  const [formCategory, setFormCategory] = useState<StudentAspiration['category']>('kegiatan');
  const [formTitle, setFormTitle] = useState('');
  const [formContent, setFormContent] = useState('');
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  // KTA Verify State
  const [searchKta, setSearchKta] = useState('');
  const [verifiedMember, setVerifiedMember] = useState<Member | null>(null);
  const [hasSearched, setHasSearched] = useState(false);

  const handleSubmitAspiration = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTitle.trim() || !formContent.trim()) return;

    onAddAspiration({
      studentName: isAnonymous ? 'Siswa SMKN 1' : formName.trim() || 'Siswa',
      isAnonymous,
      classRoom: isAnonymous ? '-' : formClass.trim() || 'Umum',
      category: formCategory,
      title: formTitle.trim(),
      content: formContent.trim(),
    });

    confetti({
      particleCount: 50,
      spread: 60,
      origin: { y: 0.8 },
    });

    setFormTitle('');
    setFormContent('');
    setFormName('');
    setFormClass('');
    setSubmitSuccess(true);
    setTimeout(() => setSubmitSuccess(false), 4000);
  };

  const handleVerifyKta = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchKta.trim()) return;

    const query = searchKta.toLowerCase().trim();
    const found = members.find(
      (m) =>
        m.nisn?.toLowerCase() === query ||
        m.id?.toLowerCase() === query ||
        m.fullName?.toLowerCase().includes(query)
    );

    setVerifiedMember(found || null);
    setHasSearched(true);
  };

  const coreValues = [
    {
      icon: Heart,
      title: 'Solidaritas',
      desc: 'Kebersamaan, empati, dan saling dukung antar fungsionaris serta seluruh warga sekolah.',
      color: 'rose',
    },
    {
      icon: Lightbulb,
      title: 'Inovasi',
      desc: 'Kreativitas tiada henti dalam setiap perancangan program kerja modern dan adaptif.',
      color: 'amber',
    },
    {
      icon: TrendingUp,
      title: 'Prestasi & Transparansi',
      desc: 'Komitmen keterbukaan informasi, integritas data, dan dedikasi mengukir prestasi kejuruan.',
      color: 'emerald',
    },
  ];

  const ketuaMember =
    members.find((m) => m.role === 'ketua') ||
    members.find((m) => m.position?.toLowerCase().includes('ketua umum')) ||
    members.find((m) => m.fullName.toLowerCase().includes('fajar'));
  const ketuaPhoto =
    ketuaMember?.avatarUrl ||
    'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=400&auto=format&fit=crop&q=80';
  const ketuaName = ketuaMember?.fullName || 'Fajar Pratama';
  const ketuaClass = ketuaMember
    ? `${ketuaMember.grade || 'XI'} ${ketuaMember.major || 'Rekayasa Perangkat Lunak 1'}`
    : 'XI Rekayasa Perangkat Lunak 1';

  return (
    <section id="tentang" className="py-16 bg-slate-50/70 dark:bg-[#070b09] border-b border-slate-200/80 dark:border-slate-800 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        {/* Navigation Tabs Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200/80 dark:border-slate-800 pb-5">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 text-xs font-bold uppercase tracking-wider mb-2 border border-emerald-200/60 dark:border-emerald-800/60">
              <Sparkles className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
              <span>Tentang Kami &amp; Transparansi</span>
            </div>
            <h2 className="font-heading text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              Profil Organisasi &amp; Suara Pelajar
            </h2>
          </div>

          {/* Navigation Pill Switches */}
          <div className="flex items-center gap-1.5 p-1 bg-white dark:bg-slate-900 rounded-full border border-slate-200 dark:border-slate-800 shadow-2xs self-start sm:self-auto">
            <button
              onClick={() => setActiveTab('tentang')}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'tentang'
                  ? 'bg-emerald-700 text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Compass className="w-3.5 h-3.5" />
              <span>Tentang &amp; Visi Misi</span>
            </button>

            <button
              onClick={() => setActiveTab('aspirasi')}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'aspirasi'
                  ? 'bg-emerald-700 text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <MessageSquare className="w-3.5 h-3.5" />
              <span>Kotak Aspirasi ({aspirations.length})</span>
            </button>

            <button
              onClick={() => setActiveTab('verifikasi')}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'verifikasi'
                  ? 'bg-emerald-700 text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Verifikasi KTA</span>
            </button>
          </div>
        </div>

        {/* Tab 1: Tentang Organisasi, Sambutan Ketua OSIS & Nilai Inti (OSINTRA Style) */}
        {activeTab === 'tentang' && (
          <div className="space-y-10 animate-fadeIn">
            {/* Sambutan Ketua OSIS Card */}
            <div className="bg-white dark:bg-[#0f1412] rounded-3xl p-6 sm:p-8 border border-slate-200/80 dark:border-emerald-950/60 shadow-sm relative overflow-hidden">
              <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-center">
                {/* Ketua Photo */}
                <div className="md:col-span-4 flex flex-col items-center text-center">
                  <div className="relative w-36 h-36 sm:w-44 sm:h-44 rounded-2xl overflow-hidden border-2 border-emerald-600/30 dark:border-emerald-400/30 shadow-lg bg-slate-100 dark:bg-slate-800">
                    <img
                      src={ketuaPhoto}
                      alt={`${ketuaName} - Ketua OSIS`}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <h4 className="font-heading font-extrabold text-base sm:text-lg text-slate-900 dark:text-white mt-3">
                    {ketuaName}
                  </h4>
                  <p className="text-xs font-semibold text-emerald-700 dark:text-emerald-400">
                    Ketua OSIS Periode 2025/2026
                  </p>
                  <p className="text-[11px] text-slate-400 mt-0.5">{ketuaClass}</p>
                </div>

                {/* Sambutan Text */}
                <div className="md:col-span-8 space-y-4">
                  <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/70 text-emerald-700 dark:text-emerald-400 flex items-center justify-center">
                    <Quote className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-heading text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
                      Sambutan Ketua OSIS
                    </h3>
                    <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 font-normal leading-relaxed mt-2 italic">
                      "Assalamu’alaikum Wr. Wb. Selamat datang di platform transparansi resmi OSIS SMK Negeri 1 Cerdas Bangsa. Website ini kami dedikasikan sebagai ruang keterbukaan informasi, wadah dokumentasi seluruh karya nyata fungsionaris, serta jembatan aspirasi bagi seluruh warga sekolah. Mari bersama wujudkan sekolah yang berkarakter, berprestasi, dan adaptif di era digital."
                    </p>
                  </div>
                  <div className="pt-2 flex flex-wrap items-center gap-4 text-xs text-slate-500 dark:text-slate-400 border-t border-slate-100 dark:border-slate-800">
                    <span className="flex items-center gap-1.5 font-medium">
                      <Clock className="w-3.5 h-3.5 text-emerald-600" />
                      Masa Bakti: 2025 – 2026
                    </span>
                    <span>•</span>
                    <span className="flex items-center gap-1.5 font-medium">
                      <Building className="w-3.5 h-3.5 text-slate-400" />
                      Ruang Pusat Kegiatan Siswa (PKS Lt. 2)
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* 3 Core Values (Nilai Inti - Solidaritas, Inovasi, Prestasi) */}
            <div>
              <div className="text-center max-w-xl mx-auto mb-6">
                <h3 className="font-heading text-lg sm:text-xl font-bold text-slate-900 dark:text-white">
                  Nilai Utama Organisasi
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  Pilar pembentuk karakter kepemimpinan dan budaya kerja seluruh pengurus OSIS.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                {coreValues.map((val, idx) => {
                  const Icon = val.icon;
                  return (
                    <div
                      key={idx}
                      className="bg-white dark:bg-[#0f1412] rounded-2xl p-6 border border-slate-200/80 dark:border-emerald-950/60 shadow-xs hover:border-emerald-600/40 dark:hover:border-emerald-500/40 transition-all flex flex-col justify-between"
                    >
                      <div className="space-y-3">
                        <div className="w-12 h-12 rounded-2xl bg-emerald-50 dark:bg-emerald-950/70 text-emerald-700 dark:text-emerald-400 border border-emerald-200/60 dark:border-emerald-800/60 flex items-center justify-center">
                          <Icon className="w-6 h-6" />
                        </div>
                        <h4 className="font-heading font-extrabold text-base text-slate-900 dark:text-white">
                          {val.title}
                        </h4>
                        <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                          {val.desc}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Visi & Misi */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              {/* Visi Card */}
              <div className="lg:col-span-5 bg-gradient-to-br from-[#1a2e22] via-[#0f1a14] to-[#0a110d] text-white rounded-3xl p-6 sm:p-8 shadow-lg border border-emerald-900/40 space-y-4">
                <div className="w-12 h-12 rounded-2xl bg-white/10 backdrop-blur-md flex items-center justify-center text-amber-300">
                  <Compass className="w-6 h-6" />
                </div>
                <div>
                  <span className="text-xs uppercase tracking-wider font-extrabold text-emerald-300">
                    Visi Organisasi
                  </span>
                  <h3 className="font-heading text-lg sm:text-xl font-bold mt-1.5 leading-snug text-[#E8DCC3]">
                    "{organization.vision}"
                  </h3>
                </div>
                <p className="text-xs text-white/70 leading-relaxed pt-2 border-t border-white/15">
                  Komitmen mewujudkan organisasi yang berkarakter luhur, berjiwa wirausaha, dan terdepan dalam penguasaan teknologi digital kejuruan.
                </p>
              </div>

              {/* Misi List */}
              <div className="lg:col-span-7 bg-white dark:bg-[#0f1412] rounded-3xl p-6 sm:p-8 border border-slate-200/80 dark:border-emerald-950/60 shadow-xs space-y-4">
                <div className="flex items-center gap-2">
                  <Target className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                  <h3 className="font-heading font-extrabold text-lg text-slate-900 dark:text-white">
                    Misi Strategis OSIS
                  </h3>
                </div>
                <div className="space-y-3 pt-1">
                  {organization.missions.map((misi, idx) => (
                    <div
                      key={idx}
                      className="flex items-start gap-3.5 p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-100 dark:border-slate-800"
                    >
                      <span className="w-6 h-6 rounded-full bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 font-extrabold text-xs flex items-center justify-center shrink-0 mt-0.5">
                        {idx + 1}
                      </span>
                      <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 font-medium leading-relaxed">
                        {misi}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Aspirasi Siswa Terbuka */}
        {activeTab === 'aspirasi' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start animate-fadeIn">
            {/* Form Aspirasi */}
            <div className="lg:col-span-5 bg-white dark:bg-[#0f1412] rounded-3xl p-6 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-4">
              <div>
                <h3 className="font-heading font-extrabold text-lg text-slate-900 dark:text-white">
                  Kirim Saran &amp; Aspirasi
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  Suara Anda sangat berarti demi kemajuan dan transparansi kegiatan sekolah.
                </p>
              </div>

              {submitSuccess && (
                <div className="p-3 bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 rounded-xl text-xs text-emerald-700 dark:text-emerald-300 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-500" />
                  <span>Terima kasih! Aspirasi Anda telah terkirim ke pengurus OSIS.</span>
                </div>
              )}

              <form onSubmit={handleSubmitAspiration} className="space-y-3.5 text-xs">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="font-semibold text-slate-700 dark:text-slate-300 mb-1 block">
                      Nama Lengkap
                    </label>
                    <input
                      type="text"
                      disabled={isAnonymous}
                      value={formName}
                      onChange={(e) => setFormName(e.target.value)}
                      placeholder={isAnonymous ? 'Anonim' : 'Nama siswa...'}
                      className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-100 disabled:opacity-50 focus:outline-none focus:border-emerald-500"
                    />
                  </div>

                  <div>
                    <label className="font-semibold text-slate-700 dark:text-slate-300 mb-1 block">
                      Kelas
                    </label>
                    <input
                      type="text"
                      disabled={isAnonymous}
                      value={formClass}
                      onChange={(e) => setFormClass(e.target.value)}
                      placeholder={isAnonymous ? '-' : 'Contoh: XI RPL 1'}
                      className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-100 disabled:opacity-50 focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                </div>

                <div className="flex items-center gap-2 pt-0.5">
                  <input
                    type="checkbox"
                    id="anonimCheck"
                    checked={isAnonymous}
                    onChange={(e) => setIsAnonymous(e.target.checked)}
                    className="rounded text-emerald-600 focus:ring-emerald-500"
                  />
                  <label htmlFor="anonimCheck" className="text-slate-600 dark:text-slate-400 select-none cursor-pointer">
                    Kirim sebagai anonim (identitas dirahasiakan)
                  </label>
                </div>

                <div>
                  <label className="font-semibold text-slate-700 dark:text-slate-300 mb-1 block">
                    Kategori Aspirasi
                  </label>
                  <select
                    value={formCategory}
                    onChange={(e) => setFormCategory(e.target.value as StudentAspiration['category'])}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-100 focus:outline-none focus:border-emerald-500"
                  >
                    <option value="kegiatan">Usulan Kegiatan &amp; Acara</option>
                    <option value="fasilitas">Fasilitas &amp; Sarana Sekolah</option>
                    <option value="kebijakan">Kebijakan &amp; Tata Tertib</option>
                    <option value="aspirasi-umum">Aspirasi Umum / Lainnya</option>
                  </select>
                </div>

                <div>
                  <label className="font-semibold text-slate-700 dark:text-slate-300 mb-1 block">
                    Judul Gagasan
                  </label>
                  <input
                    type="text"
                    required
                    value={formTitle}
                    onChange={(e) => setFormTitle(e.target.value)}
                    placeholder="Inti usulan Anda..."
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-100 focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="font-semibold text-slate-700 dark:text-slate-300 mb-1 block">
                    Uraian Pesan / Masukan
                  </label>
                  <textarea
                    required
                    rows={4}
                    value={formContent}
                    onChange={(e) => setFormContent(e.target.value)}
                    placeholder="Jelaskan gagasan Anda secara rinci dan santun..."
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-100 focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-2.5 rounded-xl text-xs font-bold bg-emerald-700 hover:bg-emerald-800 text-white shadow-xs transition-colors flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Kirim Aspirasi Sekarang</span>
                </button>
              </form>
            </div>

            {/* List Aspirasi Publik */}
            <div className="lg:col-span-7 space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-slate-200 dark:border-slate-800">
                <h3 className="font-heading font-extrabold text-base sm:text-lg text-slate-900 dark:text-white">
                  Aspirasi Siswa Terbaru
                </h3>
                <span className="text-xs text-slate-400">
                  {aspirations.length} masukan tersimpan
                </span>
              </div>

              <div className="space-y-3.5 max-h-[600px] overflow-y-auto pr-1">
                {aspirations.map((asp) => (
                  <div
                    key={asp.id}
                    className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-[#0f1412] border border-slate-200/80 dark:border-slate-800 shadow-2xs space-y-3"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-bold text-xs text-slate-900 dark:text-white">
                            {asp.studentName}
                          </span>
                          {!asp.isAnonymous && (
                            <span className="text-[10px] px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-medium">
                              {asp.classRoom}
                            </span>
                          )}
                          <span className="text-[10px] px-2 py-0.5 rounded-md bg-emerald-50 dark:bg-emerald-950/70 text-emerald-700 dark:text-emerald-400 font-semibold uppercase">
                            {asp.category}
                          </span>
                        </div>
                        <h4 className="font-heading font-bold text-sm text-slate-900 dark:text-white mt-1">
                          {asp.title}
                        </h4>
                      </div>

                      <span className="text-[11px] text-slate-400 shrink-0">
                        {asp.date}
                      </span>
                    </div>

                    <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                      {asp.content}
                    </p>

                    {Boolean(asp.response) && (
                      <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900/80 border-l-2 border-emerald-600 text-xs space-y-1">
                        <span className="font-bold text-[11px] text-emerald-700 dark:text-emerald-400 block">
                          Tanggapan Pengurus OSIS:
                        </span>
                        <p className="text-slate-700 dark:text-slate-300 text-[11px] leading-relaxed">
                          {asp.response}
                        </p>
                      </div>
                    )}

                    <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800/80">
                      <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
                        Status: {asp.status}
                      </span>
                      <button
                        onClick={() => onLikeAspiration(asp.id)}
                        className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 hover:bg-emerald-100 dark:hover:bg-emerald-900/70 transition-colors cursor-pointer"
                      >
                        <ThumbsUp className="w-3.5 h-3.5" />
                        <span>Dukung ({asp.likes || 0})</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Tab 3: Verifikasi KTA Pengurus OSIS */}
        {activeTab === 'verifikasi' && (
          <div className="max-w-2xl mx-auto space-y-6 animate-fadeIn">
            <div className="text-center space-y-2">
              <div className="w-12 h-12 rounded-2xl bg-emerald-50 dark:bg-emerald-950/70 text-emerald-700 dark:text-emerald-400 flex items-center justify-center mx-auto">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <h3 className="font-heading font-extrabold text-xl text-slate-900 dark:text-white">
                Verifikasi Kartu Tanda Anggota (KTA)
              </h3>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 max-w-md mx-auto">
                Validasi legalitas fungsionaris OSIS resmi SMK Negeri 1 Cerdas Bangsa dengan memasukkan Nomor Induk Siswa Nasional (NISN) atau Nama Lengkap.
              </p>
            </div>

            <form
              onSubmit={handleVerifyKta}
              className="flex items-center gap-2 p-1.5 bg-white dark:bg-[#0f1412] border border-slate-200 dark:border-slate-800 rounded-full shadow-sm focus-within:border-emerald-500"
            >
              <Search className="w-4 h-4 text-slate-400 ml-3 shrink-0" />
              <input
                type="text"
                value={searchKta}
                onChange={(e) => setSearchKta(e.target.value)}
                placeholder="Masukkan NISN atau Nama Pengurus..."
                className="w-full bg-transparent px-2 py-1.5 text-xs sm:text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none"
              />
              <button
                type="submit"
                className="px-5 py-2 rounded-full text-xs font-bold bg-emerald-700 hover:bg-emerald-800 text-white shadow-xs cursor-pointer transition-colors shrink-0"
              >
                Cek Validasi
              </button>
            </form>

            {hasSearched && (
              <div className="pt-2">
                {verifiedMember ? (
                  <div className="p-6 rounded-3xl bg-white dark:bg-[#0f1412] border border-emerald-500/40 shadow-lg space-y-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-400 flex items-center justify-center">
                        <CheckCircle2 className="w-5 h-5" />
                      </div>
                      <div>
                        <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                          Status: Fungsionaris Sah Terverifikasi
                        </span>
                        <h4 className="font-heading font-extrabold text-base text-slate-900 dark:text-white">
                          {verifiedMember.fullName}
                        </h4>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3 text-xs pt-2 border-t border-slate-100 dark:border-slate-800">
                      <div>
                        <span className="text-slate-400 block text-[10px]">Jabatan / Sekbid:</span>
                        <span className="font-bold text-slate-800 dark:text-slate-200">
                          {verifiedMember.role}
                        </span>
                      </div>
                      <div>
                        <span className="text-slate-400 block text-[10px]">Kelas:</span>
                        <span className="font-bold text-slate-800 dark:text-slate-200">
                          {verifiedMember.classRoom}
                        </span>
                      </div>
                      <div>
                        <span className="text-slate-400 block text-[10px]">NISN:</span>
                        <span className="font-mono text-slate-800 dark:text-slate-200">
                          {verifiedMember.nisn}
                        </span>
                      </div>
                      <div>
                        <span className="text-slate-400 block text-[10px]">Status Keanggotaan:</span>
                        <span className="text-emerald-600 dark:text-emerald-400 font-bold">
                          Aktif (TA 2025/2026)
                        </span>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="p-6 rounded-3xl bg-white dark:bg-[#0f1412] border border-rose-300 dark:border-rose-900/60 text-center space-y-2">
                    <p className="text-xs font-bold text-rose-600 dark:text-rose-400">
                      Data Tidak Ditemukan
                    </p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      NISN atau Nama "{searchKta}" tidak terdaftar sebagai fungsionaris aktif OSIS pada periode ini.
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </section>
  );
};

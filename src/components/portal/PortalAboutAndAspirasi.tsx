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
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { PortalOrganization } from '../../data/portalData';
import { StudentAspiration, Member } from '../../types';

interface PortalAboutAndAspirasiProps {
  organization: PortalOrganization;
  aspirations: StudentAspiration[];
  onAddAspiration: (aspiration: Omit<StudentAspiration, 'id' | 'createdAt' | 'likes'>) => void;
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
  // Aspirasi Tab
  const [activeTab, setActiveTab] = useState<'visi-misi' | 'aspirasi' | 'verifikasi'>('visi-misi');

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
      status: 'pending',
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

  return (
    <section id="tentang" className="py-16 bg-slate-50/70 dark:bg-slate-900/40 border-b border-slate-200/80 dark:border-slate-800 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        {/* Navigation Tabs between Visi-Misi, Aspirasi, and KTA */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200/80 dark:border-slate-800 pb-5">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-100 dark:bg-blue-950/80 text-blue-700 dark:text-blue-300 text-xs font-bold uppercase tracking-wider mb-2">
              <Info className="w-3.5 h-3.5" />
              <span>Transparansi &amp; Partisipasi</span>
            </div>
            <h2 className="font-heading text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              Tentang OSIS &amp; Suara Siswa
            </h2>
          </div>

          <div className="flex items-center gap-2 p-1 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-2xs self-start">
            <button
              onClick={() => setActiveTab('visi-misi')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'visi-misi'
                  ? 'bg-blue-600 text-white shadow-2xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Compass className="w-3.5 h-3.5" />
              <span>Visi &amp; Misi</span>
            </button>

            <button
              onClick={() => setActiveTab('aspirasi')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'aspirasi'
                  ? 'bg-blue-600 text-white shadow-2xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <MessageSquare className="w-3.5 h-3.5" />
              <span>Kotak Aspirasi ({aspirations.length})</span>
            </button>

            <button
              onClick={() => setActiveTab('verifikasi')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'verifikasi'
                  ? 'bg-blue-600 text-white shadow-2xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Verifikasi KTA</span>
            </button>
          </div>
        </div>

        {/* Tab 1: Visi & Misi */}
        {activeTab === 'visi-misi' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start animate-fadeIn">
            {/* Visi Card */}
            <div className="lg:col-span-5 bg-gradient-to-br from-blue-600 via-indigo-600 to-blue-800 text-white rounded-3xl p-6 sm:p-8 shadow-xl space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center text-amber-300">
                <Compass className="w-6 h-6" />
              </div>
              <div>
                <span className="text-xs uppercase tracking-wider font-extrabold text-blue-200">
                  Visi Organisasi
                </span>
                <h3 className="font-heading text-xl sm:text-2xl font-black mt-1 leading-snug">
                  "{organization.vision}"
                </h3>
              </div>
              <p className="text-xs sm:text-sm text-blue-100/90 leading-relaxed pt-2 border-t border-white/20">
                Landasan visi ini menjadi kompas seluruh program kerja dan aktivitas pengurus OSIS SMKN 1 Cerdas Bangsa periode 2025/2026.
              </p>
            </div>

            {/* Misi List */}
            <div className="lg:col-span-7 bg-white dark:bg-slate-800 rounded-3xl p-6 sm:p-8 border border-slate-200/80 dark:border-slate-700 shadow-sm space-y-4">
              <div className="flex items-center gap-2">
                <Target className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                <h3 className="font-heading font-extrabold text-lg sm:text-xl text-slate-900 dark:text-white">
                  Misi Strategis OSIS
                </h3>
              </div>
              <div className="space-y-3.5 pt-1">
                {organization.missions.map((misi, idx) => (
                  <div
                    key={idx}
                    className="flex items-start gap-3.5 p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-100 dark:border-slate-700/60"
                  >
                    <span className="w-6 h-6 rounded-full bg-blue-100 dark:bg-blue-950/80 text-blue-700 dark:text-blue-400 font-extrabold text-xs flex items-center justify-center shrink-0 mt-0.5">
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
        )}

        {/* Tab 2: Aspirasi Siswa Terbuka */}
        {activeTab === 'aspirasi' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start animate-fadeIn">
            {/* Form Aspirasi */}
            <div className="lg:col-span-5 bg-white dark:bg-slate-800 rounded-3xl p-6 border border-slate-200/80 dark:border-slate-700 shadow-sm space-y-4">
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
                      className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-100 disabled:opacity-50"
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
                      className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-100 disabled:opacity-50"
                    />
                  </div>
                </div>

                <div className="flex items-center gap-2 pt-0.5">
                  <input
                    type="checkbox"
                    id="anonymousCheck"
                    checked={isAnonymous}
                    onChange={(e) => setIsAnonymous(e.target.checked)}
                    className="rounded text-blue-600 focus:ring-blue-500"
                  />
                  <label
                    htmlFor="anonymousCheck"
                    className="text-slate-600 dark:text-slate-400 cursor-pointer"
                  >
                    Kirim sebagai anonim (identitas dirahasiakan)
                  </label>
                </div>

                <div>
                  <label className="font-semibold text-slate-700 dark:text-slate-300 mb-1 block">
                    Kategori Aspirasi
                  </label>
                  <select
                    value={formCategory}
                    onChange={(e) =>
                      setFormCategory(e.target.value as StudentAspiration['category'])
                    }
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-100 cursor-pointer"
                  >
                    <option value="kegiatan">Program &amp; Kegiatan</option>
                    <option value="fasilitas">Fasilitas Sekolah</option>
                    <option value="akademik">Akademik &amp; Kesiswaan</option>
                    <option value="lainnya">Lainnya / Umum</option>
                  </select>
                </div>

                <div>
                  <label className="font-semibold text-slate-700 dark:text-slate-300 mb-1 block">
                    Judul Saran
                  </label>
                  <input
                    type="text"
                    required
                    value={formTitle}
                    onChange={(e) => setFormTitle(e.target.value)}
                    placeholder="Contoh: Pengadaan Wi-Fi di Area Kantin"
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-100"
                  />
                </div>

                <div>
                  <label className="font-semibold text-slate-700 dark:text-slate-300 mb-1 block">
                    Isi Masukan / Saran
                  </label>
                  <textarea
                    required
                    rows={3}
                    value={formContent}
                    onChange={(e) => setFormContent(e.target.value)}
                    placeholder="Tuliskan detail aspirasi secara santun dan konstruktif..."
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-100"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl flex items-center justify-center gap-2 shadow-sm cursor-pointer transition-colors"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Kirim Aspirasi Sekarang</span>
                </button>
              </form>
            </div>

            {/* Feed Aspirasi Terkini */}
            <div className="lg:col-span-7 space-y-4">
              <h3 className="font-heading font-extrabold text-lg text-slate-900 dark:text-white flex items-center gap-2">
                <span>Daftar Aspirasi Terbaru</span>
                <span className="text-xs px-2 py-0.5 rounded-full bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300 font-bold">
                  {aspirations.length}
                </span>
              </h3>

              <div className="space-y-3 max-h-[480px] overflow-y-auto pr-1">
                {aspirations.map((asp) => (
                  <div
                    key={asp.id}
                    className="bg-white dark:bg-slate-800 rounded-2xl p-4 border border-slate-200/80 dark:border-slate-700 shadow-2xs space-y-2"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-slate-900 dark:text-white">
                          {asp.studentName}
                        </span>
                        {!asp.isAnonymous && (
                          <span className="text-[10px] text-slate-400">
                            • {asp.classRoom}
                          </span>
                        )}
                      </div>
                      <span className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 text-[10px] font-bold uppercase">
                        {asp.category}
                      </span>
                    </div>

                    <h4 className="font-heading font-bold text-sm text-slate-800 dark:text-slate-100">
                      {asp.title}
                    </h4>

                    <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                      {asp.content}
                    </p>

                    <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-700/60 text-[11px] text-slate-400">
                      <span>{asp.createdAt || 'Hari ini'}</span>
                      <button
                        onClick={() => onLikeAspiration(asp.id)}
                        className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-700 hover:bg-blue-50 dark:hover:bg-blue-950 text-slate-600 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors cursor-pointer"
                      >
                        <ThumbsUp className="w-3 h-3" />
                        <span>Dukung ({asp.likes || 0})</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Tab 3: Verifikasi KTA Pengurus & Anggota */}
        {activeTab === 'verifikasi' && (
          <div className="max-w-2xl mx-auto bg-white dark:bg-slate-800 rounded-3xl p-6 sm:p-8 border border-slate-200/80 dark:border-slate-700 shadow-sm space-y-6 animate-fadeIn">
            <div className="text-center space-y-2">
              <div className="w-12 h-12 rounded-2xl bg-blue-100 dark:bg-blue-950 text-blue-600 dark:text-blue-400 mx-auto flex items-center justify-center">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <h3 className="font-heading font-extrabold text-xl text-slate-900 dark:text-white">
                Verifikasi Legalitas KTA Pengurus
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 max-w-md mx-auto">
                Cek keaslian kartu tanda anggota OSIS SMKN 1 Cerdas Bangsa dengan memasukkan Nomor Induk Siswa Nasional (NISN) atau Nama Lengkap.
              </p>
            </div>

            <form onSubmit={handleVerifyKta} className="flex gap-2">
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchKta}
                  onChange={(e) => setSearchKta(e.target.value)}
                  placeholder="Masukkan NISN atau Nama Pengurus..."
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs sm:text-sm text-slate-800 dark:text-slate-100 focus:outline-none focus:border-blue-500"
                />
              </div>
              <button
                type="submit"
                className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl cursor-pointer transition-colors"
              >
                Verifikasi
              </button>
            </form>

            {hasSearched && (
              <div className="pt-2">
                {verifiedMember ? (
                  <div className="p-5 rounded-2xl bg-emerald-50/70 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/80 space-y-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-emerald-500 text-white flex items-center justify-center">
                        <CheckCircle2 className="w-6 h-6" />
                      </div>
                      <div>
                        <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                          Data Terverifikasi Resmi
                        </span>
                        <h4 className="font-heading font-extrabold text-base text-slate-900 dark:text-white">
                          {verifiedMember.fullName}
                        </h4>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3 text-xs pt-2 border-t border-emerald-200/60 dark:border-emerald-800/60">
                      <div>
                        <span className="text-slate-400 block text-[11px]">Jabatan:</span>
                        <span className="font-bold text-slate-800 dark:text-slate-200">
                          {verifiedMember.position}
                        </span>
                      </div>
                      <div>
                        <span className="text-slate-400 block text-[11px]">Kelas:</span>
                        <span className="font-bold text-slate-800 dark:text-slate-200">
                          {verifiedMember.classRoom}
                        </span>
                      </div>
                      <div>
                        <span className="text-slate-400 block text-[11px]">Status Keanggotaan:</span>
                        <span className="font-bold text-emerald-600 dark:text-emerald-400">
                          {verifiedMember.status.toUpperCase()}
                        </span>
                      </div>
                      <div>
                        <span className="text-slate-400 block text-[11px]">NISN:</span>
                        <span className="font-bold text-slate-800 dark:text-slate-200">
                          {verifiedMember.nisn}
                        </span>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-center text-xs text-rose-700 dark:text-rose-300">
                    Data tidak ditemukan dalam database pengurus resmi periode ini. Mohon periksa kembali NISN atau ejaan nama Anda.
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

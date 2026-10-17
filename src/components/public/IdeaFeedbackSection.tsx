import React, { useState } from 'react';
import {
  Lightbulb,
  Send,
  Mail,
  User,
  Tag,
  CheckCircle2,
  Sparkles,
  MessageSquare,
  ThumbsUp,
  Clock,
  ShieldCheck,
  ChevronRight,
  HelpCircle,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { StudentAspiration } from '../../types';
import { ScrollReveal } from '../common/ScrollReveal';

export const IdeaFeedbackSection: React.FC = () => {
  const { aspirations, addAspiration, likeAspiration, showToast } = useApp();

  const [activeTab, setActiveTab] = useState<'form' | 'list'>('form');

  // Form State
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [senderRole, setSenderRole] = useState<'siswa' | 'orang_tua' | 'alumni' | 'guru' | 'masyarakat_umum'>('masyarakat_umum');
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [category, setCategory] = useState<StudentAspiration['category']>('inovasi');
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [classRoom, setClassRoom] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim() || !content.trim()) {
      showToast('Harap isi judul dan rincian ide/masukan Anda.', 'error');
      return;
    }

    if (!email.trim() || !email.includes('@')) {
      showToast('Harap masukkan alamat email/Gmail yang valid agar kami dapat membalas.', 'error');
      return;
    }

    setIsSubmitting(true);

    setTimeout(() => {
      addAspiration({
        studentName: isAnonymous ? 'Anonim (Orang Luar/Publik)' : name.trim() || 'Warga Sekolah / Publik',
        isAnonymous,
        classRoom: classRoom.trim() || (senderRole === 'siswa' ? 'Siswa SMKN 1' : 'Masyarakat Umum'),
        category,
        title: title.trim(),
        content: content.trim(),
        email: email.trim(),
        senderRole,
      });

      setIsSubmitting(false);
      setSubmitSuccess(true);
      showToast('Ide & masukan Anda berhasil terkirim! Admin dapat membalas via Gmail.', 'success');

      // Reset form
      setName('');
      setEmail('');
      setTitle('');
      setContent('');
      setClassRoom('');
      setIsAnonymous(false);
    }, 600);
  };

  return (
    <section id="ide-masukan" className="bg-[#F8FAFC] py-16 sm:py-24 border-b border-[#E2E8F0]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <ScrollReveal distance={30} duration={650}>
          <div className="text-center max-w-3xl mx-auto mb-12 sm:mb-16">
            <div className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-blue-50 border border-blue-100 text-[#2563EB] text-xs font-bold mb-4 shadow-2xs">
              <Lightbulb className="w-3.5 h-3.5 text-amber-500" />
              <span>Partisipasi Publik &amp; Aspirasi</span>
            </div>

            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-[#0F172A] tracking-tight leading-tight">
              Kotak Ide &amp; Masukan <span className="text-[#2563EB]">Terbuka</span>
            </h2>

            <p className="text-sm sm:text-base text-[#64748B] mt-3 max-w-2xl mx-auto leading-relaxed">
              Punya ide kreatif, masukan kegiatan, atau saran fasilitas? Siapapun dari luar maupun dalam sekolah dapat berkontribusi. Pengurus OSIS akan meninjau dan dapat membalas langsung ke alamat <strong>Gmail</strong> Anda!
            </p>

            {/* Tab Navigasi */}
            <div className="flex items-center justify-center gap-2 mt-6">
              <button
                onClick={() => {
                  setActiveTab('form');
                  setSubmitSuccess(false);
                }}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
                  activeTab === 'form'
                    ? 'bg-[#1E3A8A] text-white shadow-md scale-102'
                    : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
                }`}
              >
                <Send className="w-3.5 h-3.5" />
                <span>Kirim Ide / Saran</span>
              </button>

              <button
                onClick={() => setActiveTab('list')}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
                  activeTab === 'list'
                    ? 'bg-[#1E3A8A] text-white shadow-md scale-102'
                    : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
                }`}
              >
                <MessageSquare className="w-3.5 h-3.5" />
                <span>Ide Terkirim ({aspirations.length})</span>
              </button>
            </div>
          </div>
        </ScrollReveal>

        {/* Tab 1: Form Pengiriman Ide */}
        {activeTab === 'form' && (
          <ScrollReveal distance={36} duration={700}>
            <div className="max-w-3xl mx-auto bg-white rounded-3xl p-6 sm:p-10 shadow-sm border border-slate-200/90 hover:shadow-md transition-shadow">
              {submitSuccess ? (
                <div className="text-center py-10 space-y-4">
                  <div className="w-16 h-16 rounded-3xl bg-emerald-50 text-emerald-600 border border-emerald-100 flex items-center justify-center mx-auto shadow-xs">
                    <CheckCircle2 className="w-8 h-8" />
                  </div>
                  <h3 className="text-xl sm:text-2xl font-black text-[#0F172A]">
                    Ide &amp; Masukan Anda Berhasil Terkirim!
                  </h3>
                  <p className="text-sm text-[#475569] max-w-md mx-auto leading-relaxed">
                    Terima kasih atas kontribusi Anda. Data telah masuk ke dasbor pengurus OSIS, dan kami akan meninjau serta membalas langsung ke alamat Gmail yang Anda cantumkan.
                  </p>

                  <div className="pt-4 flex flex-wrap items-center justify-center gap-3">
                    <button
                      onClick={() => setSubmitSuccess(false)}
                      className="px-5 py-2.5 bg-[#1E3A8A] text-white text-xs font-bold rounded-xl shadow-xs hover:bg-blue-900 transition-colors cursor-pointer"
                    >
                      Kirim Ide Lainnya
                    </button>
                    <button
                      onClick={() => setActiveTab('list')}
                      className="px-5 py-2.5 bg-slate-100 text-slate-700 text-xs font-bold rounded-xl hover:bg-slate-200 transition-colors cursor-pointer"
                    >
                      Lihat Daftar Masukan
                    </button>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Banner Notifikasi Gmail */}
                  <div className="p-4 rounded-2xl bg-blue-50/70 border border-blue-100 flex items-start gap-3 text-xs text-[#1E3A8A]">
                    <Mail className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                    <div>
                      <p className="font-bold">Terhubung Langsung dengan Email OSIS</p>
                      <p className="text-[#475569] mt-0.5 leading-relaxed">
                        Masukkan alamat Gmail aktif Anda agar pengurus OSIS dapat membalas, mengklarifikasi, atau berdiskusi lebih lanjut langsung ke kotak masuk Anda.
                      </p>
                    </div>
                  </div>

                  {/* Baris 1: Nama & Status Pengirim */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-[#0F172A] mb-1.5 flex items-center gap-1.5">
                        <User className="w-3.5 h-3.5 text-[#2563EB]" />
                        <span>Nama Lengkap / Panggilan</span>
                      </label>
                      <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Contoh: Budi Prasetyo"
                        disabled={isAnonymous}
                        className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50/50 text-xs text-[#0F172A] focus:outline-none focus:border-[#2563EB] focus:bg-white transition-colors disabled:opacity-50"
                      />
                      <div className="mt-1.5 flex items-center gap-1.5">
                        <input
                          type="checkbox"
                          id="anonCheck"
                          checked={isAnonymous}
                          onChange={(e) => setIsAnonymous(e.target.checked)}
                          className="rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                        />
                        <label htmlFor="anonCheck" className="text-[11px] text-[#64748B] cursor-pointer">
                          Sembunyikan nama di tampilan publik (Kirim Anonim)
                        </label>
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-[#0F172A] mb-1.5">
                        Status / Identitas Pengirim
                      </label>
                      <select
                        value={senderRole}
                        onChange={(e) => setSenderRole(e.target.value as any)}
                        className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50/50 text-xs text-[#0F172A] focus:outline-none focus:border-[#2563EB] focus:bg-white transition-colors cursor-pointer"
                      >
                        <option value="masyarakat_umum">Masyarakat Umum / Pihak Luar</option>
                        <option value="orang_tua">Orang Tua / Wali Siswa</option>
                        <option value="alumni">Alumni Sekolah</option>
                        <option value="siswa">Siswa SMK Negeri 1</option>
                        <option value="guru">Guru / Tenaga Pendidik</option>
                      </select>
                      <p className="text-[11px] text-[#64748B] mt-1">
                        Membantu pengurus menyesuaikan konteks balasan.
                      </p>
                    </div>
                  </div>

                  {/* Baris 2: Email Pengirim & Kategori Ide */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-[#0F172A] mb-1.5 flex items-center gap-1.5">
                        <Mail className="w-3.5 h-3.5 text-rose-500" />
                        <span>Email / Akun Gmail Pengirim <span className="text-rose-500">*</span></span>
                      </label>
                      <input
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="contoh: nama.anda@gmail.com"
                        className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50/50 text-xs text-[#0F172A] focus:outline-none focus:border-[#2563EB] focus:bg-white transition-colors"
                      />
                      <p className="text-[11px] text-[#64748B] mt-1">
                        Penting: Email ini untuk admin membalas via Gmail.
                      </p>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-[#0F172A] mb-1.5 flex items-center gap-1.5">
                        <Tag className="w-3.5 h-3.5 text-[#2563EB]" />
                        <span>Kategori Ide / Masukan</span>
                      </label>
                      <select
                        value={category}
                        onChange={(e) => setCategory(e.target.value as any)}
                        className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50/50 text-xs text-[#0F172A] focus:outline-none focus:border-[#2563EB] focus:bg-white transition-colors cursor-pointer"
                      >
                        <option value="inovasi">Inovasi &amp; Ide Kreatif Baru</option>
                        <option value="kegiatan">Kegiatan &amp; Event Siswa</option>
                        <option value="fasilitas">Fasilitas &amp; Sarana Sekolah</option>
                        <option value="organisasi">Tata Kelola &amp; Transparansi OSIS</option>
                        <option value="kebersihan">Kebersihan &amp; Lingkungan</option>
                        <option value="akademik">Akademik &amp; Kesiapan Kejuruan</option>
                        <option value="lainnya">Saran &amp; Masukan Umum</option>
                      </select>
                    </div>
                  </div>

                  {/* Judul Ide */}
                  <div>
                    <label className="block text-xs font-bold text-[#0F172A] mb-1.5">
                      Judul Ide atau Pokok Masukan <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      placeholder="Ringkas usulan Anda dalam 1 kalimat (Contoh: Pengadaan Workshop Desain Grafis dari Alumni)"
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50/50 text-xs text-[#0F172A] focus:outline-none focus:border-[#2563EB] focus:bg-white transition-colors"
                    />
                  </div>

                  {/* Isi Ide / Rincian */}
                  <div>
                    <label className="block text-xs font-bold text-[#0F172A] mb-1.5">
                      Rincian Ide, Masukan, atau Harapan <span className="text-rose-500">*</span>
                    </label>
                    <textarea
                      required
                      rows={4}
                      value={content}
                      onChange={(e) => setContent(e.target.value)}
                      placeholder="Jelaskan secara rinci latar belakang, bentuk kegiatan, atau usulan solusi yang Anda tawarkan..."
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50/50 text-xs text-[#0F172A] focus:outline-none focus:border-[#2563EB] focus:bg-white transition-colors leading-relaxed"
                    />
                  </div>

                  {/* Submit Button */}
                  <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-4">
                    <span className="text-[11px] text-[#64748B] flex items-center gap-1.5">
                      <ShieldCheck className="w-4 h-4 text-emerald-500" />
                      Data Anda dikelola secara aman oleh Pengurus OSIS
                    </span>

                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full sm:w-auto px-7 py-3 rounded-xl bg-[#1E3A8A] hover:bg-blue-900 active:scale-98 text-white text-xs font-bold flex items-center justify-center gap-2 shadow-md hover:shadow-lg transition-all cursor-pointer disabled:opacity-50"
                    >
                      {isSubmitting ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                          <span>Mengirimkan Ide...</span>
                        </>
                      ) : (
                        <>
                          <Send className="w-4 h-4" />
                          <span>Kirim Ide &amp; Masukan</span>
                        </>
                      )}
                    </button>
                  </div>
                </form>
              )}
            </div>
          </ScrollReveal>
        )}

        {/* Tab 2: Daftar Ide Terkirim */}
        {activeTab === 'list' && (
          <ScrollReveal distance={36} duration={700}>
            <div className="max-w-4xl mx-auto space-y-4">
              <div className="flex items-center justify-between px-2">
                <span className="text-xs font-bold text-slate-700">
                  {aspirations.length} Ide &amp; Masukan Masuk
                </span>
                <button
                  onClick={() => setActiveTab('form')}
                  className="text-xs font-bold text-[#2563EB] hover:underline flex items-center gap-1 cursor-pointer"
                >
                  + Tulis Ide Baru
                </button>
              </div>

              {aspirations.length === 0 ? (
                <div className="text-center py-12 bg-white rounded-3xl border border-slate-200 p-8">
                  <Lightbulb className="w-10 h-10 text-slate-300 mx-auto mb-2" />
                  <p className="text-sm font-bold text-slate-700">Belum ada ide yang dikirimkan</p>
                  <p className="text-xs text-slate-400 mt-1">Jadilah yang pertama menyampaikan ide untuk sekolah!</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {aspirations.map((asp) => (
                    <div
                      key={asp.id}
                      className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-2xs hover:shadow-md transition-shadow flex flex-col justify-between"
                    >
                      <div>
                        {/* Top Meta */}
                        <div className="flex items-center justify-between gap-2 mb-2.5">
                          <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-blue-50 text-[#2563EB] border border-blue-100">
                            {asp.category}
                          </span>
                          <span className="text-[10px] text-slate-400 flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {asp.date}
                          </span>
                        </div>

                        {/* Judul & Isi */}
                        <h4 className="text-sm font-bold text-[#0F172A] mb-1.5 leading-snug">
                          {asp.title}
                        </h4>
                        <p className="text-xs text-[#475569] leading-relaxed line-clamp-3 mb-3">
                          "{asp.content}"
                        </p>
                      </div>

                      {/* Footer & Respon */}
                      <div className="pt-3 border-t border-slate-100 space-y-2">
                        {/* Pengirim */}
                        <div className="flex items-center justify-between text-[11px] text-slate-500">
                          <span className="font-semibold text-slate-700">
                            {asp.studentName}
                          </span>
                          <span className="text-[10px] bg-slate-100 px-2 py-0.5 rounded">
                            {asp.classRoom || 'Publik'}
                          </span>
                        </div>

                        {/* Tanggapan jika ada */}
                        {asp.response && (
                          <div className="p-2.5 rounded-xl bg-emerald-50/70 border border-emerald-100 text-[11px] text-emerald-800">
                            <p className="font-bold flex items-center gap-1 mb-0.5">
                              <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                              Tanggapan Pengurus ({asp.respondedBy || 'OSIS'}):
                            </p>
                            <p className="italic leading-relaxed">{asp.response}</p>
                          </div>
                        )}

                        {/* Like button */}
                        <div className="flex items-center justify-between pt-1">
                          <span
                            className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded ${
                              asp.status === 'terealisasi'
                                ? 'bg-emerald-100 text-emerald-800'
                                : asp.status === 'diproses'
                                ? 'bg-amber-100 text-amber-800'
                                : 'bg-slate-100 text-slate-700'
                            }`}
                          >
                            {asp.status}
                          </span>

                          <button
                            onClick={() => likeAspiration(asp.id)}
                            className="inline-flex items-center gap-1.5 text-xs text-slate-600 hover:text-[#2563EB] active:scale-95 transition-all cursor-pointer"
                          >
                            <ThumbsUp className="w-3.5 h-3.5" />
                            <span className="font-bold">{asp.likes || 0}</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </ScrollReveal>
        )}
      </div>
    </section>
  );
};

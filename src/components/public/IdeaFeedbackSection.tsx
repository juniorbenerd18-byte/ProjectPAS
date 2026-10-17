import React, { useState } from 'react';
import { Lightbulb, Send, CheckCircle2 } from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const IdeaFeedbackSection: React.FC = () => {
  const { addAspiration, showToast } = useApp();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!message.trim()) {
      showToast('Harap tuliskan ide atau masukan Anda.', 'error');
      return;
    }

    if (!email.trim() || !email.includes('@')) {
      showToast('Harap masukkan alamat email / Gmail yang valid.', 'error');
      return;
    }

    setIsSubmitting(true);

    setTimeout(() => {
      const trimmedMessage = message.trim();
      const firstLine = trimmedMessage.split('\n')[0].slice(0, 60);

      addAspiration({
        studentName: name.trim() || 'Pengirim Anonim',
        isAnonymous: !name.trim(),
        classRoom: 'Publik',
        category: 'inovasi',
        title: firstLine + (trimmedMessage.length > 60 ? '...' : ''),
        content: trimmedMessage,
        email: email.trim(),
        senderRole: 'masyarakat_umum',
      });

      setIsSubmitting(false);
      setIsSubmitted(true);
      showToast('Ide berhasil dikirim! Admin akan membalas lewat Gmail.', 'success');

      setName('');
      setEmail('');
      setMessage('');
    }, 400);
  };

  return (
    <section id="ide-masukan" className="bg-[#F8FAFC] py-14 sm:py-16 border-b border-[#E2E8F0]">
      <div className="max-w-2xl mx-auto px-4 sm:px-6">
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/90 shadow-sm">
          {/* Header */}
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center border border-amber-200/80 shadow-2xs shrink-0">
              <Lightbulb className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg sm:text-xl font-bold text-[#0F172A]">
                Kotak Ide &amp; Masukan
              </h3>
              <p className="text-xs text-[#64748B]">
                Sampaikan ide atau saran Anda. Pengurus OSIS akan meninjau dan membalas lewat Gmail.
              </p>
            </div>
          </div>

          {isSubmitted ? (
            <div className="text-center py-6 space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto border border-emerald-100">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <h4 className="text-base font-bold text-[#0F172A]">
                Ide Anda Berhasil Terkirim!
              </h4>
              <p className="text-xs text-[#64748B] max-w-sm mx-auto leading-relaxed">
                Terima kasih atas masukannya. Pengurus OSIS akan membaca dan membalas langsung ke alamat Gmail Anda.
              </p>
              <button
                type="button"
                onClick={() => setIsSubmitted(false)}
                className="mt-2 px-4 py-2 rounded-xl bg-[#1E3A8A] text-white text-xs font-semibold hover:bg-blue-900 transition-colors cursor-pointer"
              >
                Kirim Ide Lain
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-xs font-semibold text-[#0F172A] mb-1">
                    Nama <span className="text-slate-400 font-normal">(opsional)</span>
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Nama Anda atau kosongkan"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50/50 text-xs text-[#0F172A] focus:outline-none focus:border-[#2563EB] focus:bg-white transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#0F172A] mb-1">
                    Email / Gmail <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="nama@gmail.com"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50/50 text-xs text-[#0F172A] focus:outline-none focus:border-[#2563EB] focus:bg-white transition-colors"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#0F172A] mb-1">
                  Ide atau Masukan Anda <span className="text-rose-500">*</span>
                </label>
                <textarea
                  required
                  rows={4}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Tuliskan ide, kritik, saran kegiatan, atau masukan fasilitas di sini..."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50/50 text-xs text-[#0F172A] focus:outline-none focus:border-[#2563EB] focus:bg-white transition-colors leading-relaxed"
                />
              </div>

              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1">
                <span className="text-[11px] text-[#64748B]">
                  * Balasan akan dikirim langsung ke Gmail Anda.
                </span>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-[#1E3A8A] hover:bg-blue-900 active:scale-95 text-white text-xs font-bold flex items-center justify-center gap-2 shadow-xs transition-all cursor-pointer disabled:opacity-50"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>{isSubmitting ? 'Mengirim...' : 'Kirim Ide'}</span>
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </section>
  );
};

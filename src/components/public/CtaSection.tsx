import React, { useState } from "react";
import {
  Mail,
  Phone,
  X,
  ExternalLink,
  Clock,
  Lock,
  Lightbulb,
  Send,
  CheckCircle2,
} from "lucide-react";
import { Highlight } from "./Highlight";
import { PortalOrganization } from "../../data/portalData";
import { ScrollReveal } from "../common/ScrollReveal";
import { useApp } from "../../context/AppContext";

interface CtaSectionProps {
  organization: PortalOrganization;
  onJoinClick?: () => void;
}

export const CtaSection: React.FC<CtaSectionProps> = ({ organization }) => {
  const { addAspiration, showToast } = useApp();

  const [showContactModal, setShowContactModal] = useState(false);

  const isRegistrationOpen = organization.isRegistrationOpen !== false;
  const gformUrl =
    organization.registrationGFormUrl || "https://forms.gle/zG5aSLW3MzWud3uz7";
  const openDate = organization.registrationOpenDate || "01 November 2026";
  const closeDate = organization.registrationCloseDate || "20 November 2026";
  const noticeMessage =
    organization.registrationNotice ||
    "Pendaftaran Anggota Baru Gelombang 1 ditutup sementara. Gelombang 2 akan dibuka kembali pada 15 Januari 2027 pukul 08:00 WIB.";

  const [ideaName, setIdeaName] = useState("");
  const [ideaEmail, setIdeaEmail] = useState("");
  const [ideaMessage, setIdeaMessage] = useState("");
  const [isIdeaSubmitting, setIsIdeaSubmitting] = useState(false);
  const [isIdeaSubmitted, setIsIdeaSubmitted] = useState(false);

  const handleIdeaSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!ideaMessage.trim()) {
      showToast("Harap tuliskan ide atau masukan Anda.", "error");
      return;
    }
    if (!ideaEmail.trim() || !ideaEmail.includes("@")) {
      showToast("Harap masukkan alamat email / Gmail yang valid.", "error");
      return;
    }
    setIsIdeaSubmitting(true);
    setTimeout(() => {
      const trimmed = ideaMessage.trim();
      addAspiration({
        studentName: ideaName.trim() || "Pengirim Anonim",
        isAnonymous: !ideaName.trim(),
        classRoom: "Publik",
        category: "inovasi",
        title: trimmed.split("\n")[0].slice(0, 60) + (trimmed.length > 60 ? "..." : ""),
        content: trimmed,
        email: ideaEmail.trim(),
        senderRole: "masyarakat_umum",
      });
      setIsIdeaSubmitting(false);
      setIsIdeaSubmitted(true);
      showToast("Ide berhasil dikirim! Admin akan membalas lewat Gmail.", "success");
      setIdeaName("");
      setIdeaEmail("");
      setIdeaMessage("");
    }, 400);
  };

  return (
    <section id="kontak" className="bg-[#FAF6EE] py-16 sm:py-24 border-b border-[#E6DFD0] scroll-mt-24 relative">
      <span id="cta" className="sr-only" />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <ScrollReveal distance={30} duration={600}>
          <div className="text-center max-w-2xl mx-auto mb-10 sm:mb-14">
            <div className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-[#E4EAF2] border border-[#E6DFD0] text-[#1F3A5F] text-xs font-bold mb-4 shadow-sm">
              <Mail className="w-3.5 h-3.5" />
              <span>Hubungi &amp; Berkontribusi</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-[#1F3A5F] tracking-tight leading-tight">
              <Highlight>Bergabung</Highlight> &amp; Sampaikan Idemu
            </h2>
            <p className="text-sm sm:text-base text-[#5A6472] mt-3 leading-relaxed">
              Daftarkan dirimu sebagai anggota OSIS, atau bagikan ide dan masukan untuk kemajuan bersama.
            </p>
          </div>
        </ScrollReveal>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8 items-start">
          <ScrollReveal distance={40} duration={700}>
            <div className="bg-[#FFFDF8] border border-[#E6DFD0] rounded-3xl p-7 sm:p-9 shadow-sm h-full flex flex-col">
              <div className="mb-5">
                {isRegistrationOpen ? (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    PENDAFTARAN DIBUKA ({openDate} - {closeDate})
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold bg-rose-50 text-rose-700 border border-rose-200">
                    <Lock className="w-3.5 h-3.5" />
                    PENDAFTARAN DITUTUP
                  </span>
                )}
              </div>
              <h3 className="text-2xl sm:text-3xl font-extrabold text-[#1F3A5F] leading-tight mb-3">
                Gabung bersama kami hari ini
              </h3>
              <p className="text-sm text-[#5A6472] leading-relaxed mb-5">
                Jadilah bagian dari generasi pelajar yang aktif, berintegritas, dan berdampak nyata bagi lingkungan sekolah.
              </p>
              {!isRegistrationOpen && (
                <div className="bg-amber-50 border border-amber-200/90 rounded-2xl p-4 mb-5 space-y-1.5">
                  <div className="flex items-center gap-1.5 text-amber-800 font-bold text-xs">
                    <Clock className="w-4 h-4 text-amber-600" />
                    <span>Informasi Jadwal Pembukaan</span>
                  </div>
                  <p className="text-xs text-amber-900 leading-relaxed">{noticeMessage}</p>
                </div>
              )}
              <div className="mt-auto flex flex-col sm:flex-row gap-3 pt-2">
                {isRegistrationOpen ? (
                  <>
                    <a
                      href={gformUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-1 px-5 py-3 text-sm font-extrabold text-[#1F3A5F] bg-[#F2B544] hover:bg-[#E0A12F] active:scale-95 rounded-xl shadow-sm transition-all flex items-center justify-center gap-2 group"
                    >
                      <span>Daftar via Google Form</span>
                      <ExternalLink className="w-4 h-4 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                    </a>
                    <button
                      onClick={() => setShowContactModal(true)}
                      className="flex-1 px-5 py-3 text-sm font-semibold text-[#1F3A5F] bg-[#FFFDF8] border border-[#E6DFD0] hover:bg-[#E4EAF2] rounded-xl transition-all flex items-center justify-center cursor-pointer"
                    >
                      Hubungi Kami
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      disabled
                      className="flex-1 px-5 py-3 text-sm font-bold text-slate-400 bg-slate-100 border border-slate-200 rounded-xl cursor-not-allowed flex items-center justify-center gap-2"
                    >
                      <Lock className="w-4 h-4" />
                      <span>Pendaftaran Ditutup</span>
                    </button>
                    <button
                      onClick={() => setShowContactModal(true)}
                      className="flex-1 px-5 py-3 text-sm font-semibold text-[#1F3A5F] bg-[#FFFDF8] border border-[#E6DFD0] hover:bg-[#E4EAF2] rounded-xl transition-all flex items-center justify-center cursor-pointer"
                    >
                      Tanya Jadwal Pengurus
                    </button>
                  </>
                )}
              </div>
            </div>
          </ScrollReveal>

          <ScrollReveal distance={40} duration={700}>
            <div className="bg-[#FFFDF8] border border-[#E6DFD0] rounded-3xl p-7 sm:p-9 shadow-sm h-full flex flex-col">
              <div className="flex items-center gap-3 mb-5">
                <div className="w-10 h-10 rounded-2xl bg-[#FBEBC8] text-[#7A4B00] flex items-center justify-center border border-[#F2B544]/40 shadow-sm shrink-0">
                  <Lightbulb className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg sm:text-xl font-bold text-[#1F3A5F]">Kotak Ide &amp; Masukan</h3>
                  <p className="text-xs text-[#64748B]">
                    Sampaikan ide atau saran. Admin akan membalas lewat Gmail.
                  </p>
                </div>
              </div>
              {isIdeaSubmitted ? (
                <div className="flex-1 flex flex-col items-center justify-center text-center py-6 space-y-3">
                  <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center border border-emerald-100">
                    <CheckCircle2 className="w-6 h-6" />
                  </div>
                  <h4 className="text-base font-bold text-[#0F172A]">Ide Berhasil Terkirim!</h4>
                  <p className="text-xs text-[#64748B] max-w-xs leading-relaxed">
                    Pengurus OSIS akan membaca dan membalas langsung ke alamat Gmail Anda.
                  </p>
                  <button
                    type="button"
                    onClick={() => setIsIdeaSubmitted(false)}
                    className="mt-2 px-4 py-2 rounded-xl bg-[#1F3A5F] text-[#FAF6EE] text-xs font-semibold hover:bg-[#162B46] transition-colors cursor-pointer"
                  >
                    Kirim Ide Lain
                  </button>
                </div>
              ) : (
                <form onSubmit={handleIdeaSubmit} className="flex flex-col flex-1 space-y-3.5">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-[#0F172A] mb-1">
                        Nama <span className="text-slate-400 font-normal">(opsional)</span>
                      </label>
                      <input
                        type="text"
                        value={ideaName}
                        onChange={(e) => setIdeaName(e.target.value)}
                        placeholder="Nama atau kosongkan"
                        className="w-full px-3.5 py-2.5 rounded-xl border border-[#E6DFD0] bg-[#FAF6EE] text-xs text-[#1F3A5F] focus:outline-none focus:border-[#1F3A5F] focus:bg-[#FFFDF8] transition-colors"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-[#0F172A] mb-1">
                        Email / Gmail <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="email"
                        required
                        value={ideaEmail}
                        onChange={(e) => setIdeaEmail(e.target.value)}
                        placeholder="nama@gmail.com"
                        className="w-full px-3.5 py-2.5 rounded-xl border border-[#E6DFD0] bg-[#FAF6EE] text-xs text-[#1F3A5F] focus:outline-none focus:border-[#1F3A5F] focus:bg-[#FFFDF8] transition-colors"
                      />
                    </div>
                  </div>
                  <div className="flex-1">
                    <label className="block text-xs font-semibold text-[#0F172A] mb-1">
                      Ide atau Masukan Anda <span className="text-rose-500">*</span>
                    </label>
                    <textarea
                      required
                      rows={5}
                      value={ideaMessage}
                      onChange={(e) => setIdeaMessage(e.target.value)}
                      placeholder="Tuliskan ide, kritik, saran kegiatan, atau masukan fasilitas di sini..."
                      className="w-full min-h-[120px] px-3.5 py-2.5 rounded-xl border border-[#E6DFD0] bg-[#FAF6EE] text-xs text-[#1F3A5F] focus:outline-none focus:border-[#1F3A5F] focus:bg-[#FFFDF8] transition-colors leading-relaxed resize-none"
                    />
                  </div>
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mt-auto">
                    <span className="text-[11px] text-[#64748B]">
                      * Balasan dikirim langsung ke Gmail Anda.
                    </span>
                    <button
                      type="submit"
                      disabled={isIdeaSubmitting}
                      className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-[#1F3A5F] hover:bg-[#162B46] active:scale-95 text-[#FAF6EE] text-xs font-bold flex items-center justify-center gap-2 shadow-sm transition-all cursor-pointer disabled:opacity-50"
                    >
                      <Send className="w-3.5 h-3.5" />
                      <span>{isIdeaSubmitting ? "Mengirim..." : "Kirim Ide"}</span>
                    </button>
                  </div>
                </form>
              )}
            </div>
          </ScrollReveal>
        </div>
      </div>

      {showContactModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-fade-in">
          <div className="bg-[#FFFDF8] rounded-2xl max-w-md w-full p-6 sm:p-8 border border-[#E6DFD0] shadow-xl relative space-y-4 max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setShowContactModal(false)}
              className="absolute top-5 right-5 p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
            <h3 className="text-xl font-bold text-[#1F3A5F]">Hubungi Pengurus</h3>
            <p className="text-xs text-[#5A6472]">
              Sekretariat OSIS siap menyambut pertanyaan, masukan, dan konsultasi kerja sama.
            </p>
            <div className="space-y-3 pt-2 text-sm text-[#0F172A]">
              <div className="flex items-start gap-3 p-3 bg-[#FAF6EE] rounded-xl border border-[#E6DFD0]">
                <Mail className="w-5 h-5 text-[#1F3A5F] shrink-0 mt-0.5" />
                <div>
                  <p className="text-xs text-[#5A6472]">Email Resmi</p>
                  <a href={`mailto:${organization.contact.email}`} className="font-semibold hover:underline">
                    {organization.contact.email}
                  </a>
                </div>
              </div>
              <div className="flex items-start gap-3 p-3 bg-[#FAF6EE] rounded-xl border border-[#E6DFD0]">
                <Phone className="w-5 h-5 text-[#1F3A5F] shrink-0 mt-0.5" />
                <div>
                  <p className="text-xs text-[#5A6472]">Nomor Telepon / Hotline</p>
                  <p className="font-semibold">{organization.contact.phone}</p>
                </div>
              </div>
            </div>
            <div className="pt-2 flex justify-end">
              <button
                onClick={() => setShowContactModal(false)}
                className="px-5 py-2 text-xs font-semibold text-[#1F3A5F] bg-[#FAF6EE] hover:bg-[#E4EAF2] rounded-lg transition-colors cursor-pointer"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};
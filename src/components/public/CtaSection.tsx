import React, { useState } from 'react';
import {
  ArrowRight,
  Mail,
  Phone,
  CheckCircle,
  X,
  ExternalLink,
  Calendar,
  Clock,
  Lock,
  Unlock,
} from 'lucide-react';
import { Highlight } from './Highlight';
import { PortalOrganization } from '../../data/portalData';
import { ScrollReveal } from '../common/ScrollReveal';

interface CtaSectionProps {
  organization: PortalOrganization;
  onJoinClick?: () => void;
}

export const CtaSection: React.FC<CtaSectionProps> = ({
  organization,
  onJoinClick,
}) => {
  const [showContactModal, setShowContactModal] = useState(false);
  const [showJoinModal, setShowJoinModal] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const isRegistrationOpen = organization.isRegistrationOpen !== false;
  const gformUrl =
    organization.registrationGFormUrl ||
    'https://forms.gle/zG5aSLW3MzWud3uz7';
  const openDate = organization.registrationOpenDate || '01 November 2026';
  const closeDate = organization.registrationCloseDate || '20 November 2026';
  const noticeMessage =
    organization.registrationNotice ||
    'Pendaftaran Anggota Baru Gelombang 1 ditutup sementara. Gelombang 2 akan dibuka kembali pada 15 Januari 2027 pukul 08:00 WIB.';

  // Form state untuk pendaftaran fallback lokal (jika dibutuhkan)
  const [formData, setFormData] = useState({
    fullName: '',
    classGrade: '',
    phone: '',
    chosenDivision: '',
    reason: '',
  });

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitted(true);
  };

  return (
    <section id="cta" className="bg-[#EFF6FF] py-16 sm:py-24 border-b border-[#DBEAFE]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <ScrollReveal distance={40} duration={750}>
          <div className="bg-white border border-[#DBEAFE] rounded-3xl p-8 sm:p-12 lg:p-16 text-center max-w-4xl mx-auto shadow-sm hover:shadow-md transition-shadow">
            {/* Status Badge Live: DIBUKA vs DITUTUP */}
            <div className="inline-flex items-center gap-2 mb-4">
              {isRegistrationOpen ? (
                <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  <span>PENDAFTARAN DIBUKA ({openDate} - {closeDate})</span>
                </span>
              ) : (
                <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-bold bg-rose-50 text-rose-700 border border-rose-200">
                  <Lock className="w-3.5 h-3.5 text-rose-600" />
                  <span>PENDAFTARAN SAAT INI DITUTUP</span>
                </span>
              )}
            </div>

            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-[#1E3A8A] tracking-tight leading-tight mb-4">
              <Highlight>Gabung</Highlight> bersama kami hari ini
            </h2>

            <p className="text-base sm:text-lg text-[#64748B] max-w-2xl mx-auto leading-relaxed mb-6">
              Jadilah bagian dari generasi pelajar yang aktif, berintegritas, dan berdampak nyata bagi lingkungan sekolah dan masyarakat.
            </p>

            {/* Jika DITUTUP: Tampilkan Box Pemberitahuan Kapan Akan Dibuka */}
            {!isRegistrationOpen && (
              <div className="bg-amber-50 border border-amber-200/90 rounded-2xl p-5 sm:p-6 my-6 text-center max-w-xl mx-auto shadow-2xs space-y-2">
                <div className="inline-flex items-center gap-1.5 text-amber-800 font-bold text-xs sm:text-sm">
                  <Clock className="w-4 h-4 text-amber-600" />
                  <span>Informasi Jadwal Pembukaan Pendaftaran</span>
                </div>
                <p className="text-xs sm:text-sm text-amber-900 leading-relaxed font-medium">
                  {noticeMessage}
                </p>
                <p className="text-[11px] text-amber-700">
                  Silakan pantau terus laman pengumuman atau hubungi pengurus untuk informasi lebih lanjut.
                </p>
              </div>
            )}

            {/* Tombol Aksi Pendaftaran */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 pt-2">
              {isRegistrationOpen ? (
                <>
                  <a
                    href={gformUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full sm:w-auto px-7 py-3.5 text-sm sm:text-base font-bold text-white bg-[#2563EB] hover:bg-blue-700 active:scale-95 rounded-xl shadow-sm transition-all flex items-center justify-center gap-2 cursor-pointer group"
                  >
                    <span>Daftar via Google Form</span>
                    <ExternalLink className="w-4 h-4 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                  </a>

                  <button
                    onClick={() => setShowContactModal(true)}
                    className="w-full sm:w-auto px-7 py-3.5 text-sm sm:text-base font-semibold text-[#2563EB] bg-white border border-[#2563EB] hover:bg-[#EFF6FF] rounded-xl transition-all flex items-center justify-center cursor-pointer"
                  >
                    Hubungi Kami
                  </button>
                </>
              ) : (
                <>
                  <button
                    disabled
                    className="w-full sm:w-auto px-7 py-3.5 text-sm sm:text-base font-bold text-slate-400 bg-slate-100 border border-slate-200 rounded-xl cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    <Lock className="w-4 h-4" />
                    <span>Pendaftaran Sedang Ditutup</span>
                  </button>

                  <button
                    onClick={() => setShowContactModal(true)}
                    className="w-full sm:w-auto px-7 py-3.5 text-sm sm:text-base font-semibold text-[#2563EB] bg-white border border-[#2563EB] hover:bg-[#EFF6FF] rounded-xl transition-all flex items-center justify-center cursor-pointer"
                  >
                    Tanya Jadwal Pengurus
                  </button>
                </>
              )}
            </div>
          </div>
        </ScrollReveal>
      </div>

      {/* Modal Pendaftaran Anggota Sederhana */}
      {showJoinModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-fade-in">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 sm:p-8 border border-[#E2E8F0] shadow-xl relative">
            <button
              onClick={() => {
                setShowJoinModal(false);
                setIsSubmitted(false);
              }}
              className="absolute top-5 right-5 p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            {isSubmitted ? (
              <div className="text-center py-6 space-y-4">
                <div className="w-14 h-14 bg-[#EFF6FF] text-[#2563EB] rounded-full flex items-center justify-center mx-auto">
                  <CheckCircle className="w-8 h-8" />
                </div>
                <h3 className="text-xl font-bold text-[#1E3A8A]">Pendaftaran Diterima!</h3>
                <p className="text-sm text-[#64748B]">
                  Terima kasih, data Anda telah tercatat. Pengurus akan menghubungi Anda melalui kontak yang dicantumkan untuk tahapan verifikasi berkas.
                </p>
                <div className="pt-2">
                  <button
                    onClick={() => {
                      setShowJoinModal(false);
                      setIsSubmitted(false);
                    }}
                    className="px-6 py-2.5 bg-[#2563EB] text-white text-sm font-semibold rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Selesai
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleFormSubmit} className="space-y-4">
                <div>
                  <h3 className="text-lg font-bold text-[#1E3A8A]">Formulir Minat Anggota</h3>
                  <p className="text-xs text-[#64748B] mt-0.5">
                    Silakan isi data ringkas Anda untuk bergabung ke organisasi.
                  </p>
                </div>

                <div className="space-y-3 pt-2">
                  <div>
                    <label className="block text-xs font-semibold text-[#0F172A] mb-1">
                      Nama Lengkap
                    </label>
                    <input
                      required
                      type="text"
                      placeholder="Masukkan nama lengkap"
                      value={formData.fullName}
                      onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                      className="w-full px-3 py-2 text-sm border border-[#E2E8F0] rounded-lg focus:outline-none focus:border-[#2563EB]"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-[#0F172A] mb-1">
                        Kelas & Jurusan
                      </label>
                      <input
                        required
                        type="text"
                        placeholder="Contoh: X RPL 1"
                        value={formData.classGrade}
                        onChange={(e) => setFormData({ ...formData, classGrade: e.target.value })}
                        className="w-full px-3 py-2 text-sm border border-[#E2E8F0] rounded-lg focus:outline-none focus:border-[#2563EB]"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-[#0F172A] mb-1">
                        Nomor WhatsApp
                      </label>
                      <input
                        required
                        type="tel"
                        placeholder="0812xxxxxxx"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        className="w-full px-3 py-2 text-sm border border-[#E2E8F0] rounded-lg focus:outline-none focus:border-[#2563EB]"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[#0F172A] mb-1">
                      Minat Divisi / Sekbid
                    </label>
                    <select
                      required
                      value={formData.chosenDivision}
                      onChange={(e) => setFormData({ ...formData, chosenDivision: e.target.value })}
                      className="w-full px-3 py-2 text-sm border border-[#E2E8F0] rounded-lg focus:outline-none focus:border-[#2563EB] bg-white"
                    >
                      <option value="">Pilih Divisi</option>
                      <option value="TIK & Media">TIK & Media Komunikasi</option>
                      <option value="Seni & Olahraga">Seni, Budaya & Olahraga</option>
                      <option value="Kewirausahaan">Kewirausahaan Siswa</option>
                      <option value="Bela Negara">Bela Negara & Kedisiplinan</option>
                      <option value="Ketaqwaan">Ketaqwaan & Nilai Moral</option>
                      <option value="Lingkungan">Lingkungan Hidup & Kebersihan</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[#0F172A] mb-1">
                      Alasan Ingin Bergabung
                    </label>
                    <textarea
                      rows={2}
                      placeholder="Ceritakan motivasi singkat Anda..."
                      value={formData.reason}
                      onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                      className="w-full px-3 py-2 text-sm border border-[#E2E8F0] rounded-lg focus:outline-none focus:border-[#2563EB]"
                    />
                  </div>
                </div>

                <div className="pt-3">
                  <button
                    type="submit"
                    className="w-full py-2.5 text-sm font-bold text-white bg-[#2563EB] hover:bg-blue-700 rounded-lg shadow-sm transition-colors cursor-pointer"
                  >
                    Kirim Formulir Pendaftaran
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* Modal Kontak Kami */}
      {showContactModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-fade-in">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 sm:p-8 border border-[#E2E8F0] shadow-xl relative space-y-4">
            <button
              onClick={() => setShowContactModal(false)}
              className="absolute top-5 right-5 p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-xl font-bold text-[#1E3A8A]">Hubungi Pengurus</h3>
            <p className="text-xs text-[#64748B]">
              Sekretariat OSIS siap menyambut pertanyaan, masukan, dan konsultasi kerja sama.
            </p>

            <div className="space-y-3 pt-2 text-sm text-[#0F172A]">
              <div className="flex items-start gap-3 p-3 bg-[#F8FAFC] rounded-xl border border-[#E2E8F0]">
                <Mail className="w-5 h-5 text-[#2563EB] shrink-0 mt-0.5" />
                <div>
                  <p className="text-xs text-[#64748B]">Email Resmi</p>
                  <a href={`mailto:${organization.contact.email}`} className="font-semibold hover:underline">
                    {organization.contact.email}
                  </a>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 bg-[#F8FAFC] rounded-xl border border-[#E2E8F0]">
                <Phone className="w-5 h-5 text-[#2563EB] shrink-0 mt-0.5" />
                <div>
                  <p className="text-xs text-[#64748B]">Nomor Telepon / Hotline</p>
                  <p className="font-semibold">{organization.contact.phone}</p>
                </div>
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                onClick={() => setShowContactModal(false)}
                className="px-5 py-2 text-xs font-semibold text-[#0F172A] bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer"
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

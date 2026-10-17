import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  Eye,
  Target,
  Plus,
  Trash2,
  Save,
  ImageIcon,
  CheckCircle2,
  HelpCircle,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { Modal } from '../common/Modal';
import { ImagePicker } from '../common/ImagePicker';

interface EditVisiMisiModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialTab?: 'all' | 'vision' | 'mission' | 'photo';
}

export const EditVisiMisiModal: React.FC<EditVisiMisiModalProps> = ({
  isOpen,
  onClose,
  initialTab = 'all',
}) => {
  const { orgProfile, updateOrgProfile } = useApp();

  const [visionText, setVisionText] = useState(orgProfile.vision || '');
  const [missionsList, setMissionsList] = useState<string[]>(
    orgProfile.mission || []
  );
  const [newMissionInput, setNewMissionInput] = useState('');
  const [photoUrl, setPhotoUrl] = useState(
    orgProfile.visionPhotoUrl ||
      'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=800&auto=format&fit=crop&q=80'
  );
  const [activeTab, setActiveTab] = useState<'all' | 'vision' | 'mission' | 'photo'>(
    initialTab
  );

  // Sync state when modal opens or orgProfile changes
  useEffect(() => {
    if (isOpen) {
      setVisionText(orgProfile.vision || '');
      setMissionsList(orgProfile.mission ? [...orgProfile.mission] : []);
      setPhotoUrl(
        orgProfile.visionPhotoUrl ||
          'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=800&auto=format&fit=crop&q=80'
      );
      setActiveTab(initialTab);
    }
  }, [isOpen, orgProfile, initialTab]);

  const handleAddMission = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!newMissionInput.trim()) return;
    setMissionsList((prev) => [...prev, newMissionInput.trim()]);
    setNewMissionInput('');
  };

  const handleRemoveMission = (index: number) => {
    setMissionsList((prev) => prev.filter((_, i) => i !== index));
  };

  const handleMissionChange = (index: number, value: string) => {
    const updated = [...missionsList];
    updated[index] = value;
    setMissionsList(updated);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();

    // Validasi sederhana
    if (!visionText.trim()) {
      alert('Teks visi tidak boleh kosong');
      return;
    }

    // Include pending new mission input if user typed something but didn't click "+"
    let finalMissions = [...missionsList];
    if (newMissionInput.trim()) {
      finalMissions.push(newMissionInput.trim());
      setNewMissionInput('');
    }

    updateOrgProfile({
      vision: visionText.trim(),
      mission: finalMissions.filter((m) => m.trim().length > 0),
      visionPhotoUrl: photoUrl.trim(),
    });

    onClose();
  };

  const presetPhotos = [
    {
      title: 'Kolaborasi Pengurus',
      url: 'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=800&auto=format&fit=crop&q=80',
    },
    {
      title: 'Diskusi & Inovasi',
      url: 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=800&auto=format&fit=crop&q=80',
    },
    {
      title: 'Prestasi & Kepemimpinan',
      url: 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=800&auto=format&fit=crop&q=80',
    },
    {
      title: 'Pendidikan Vokasi Siswa',
      url: 'https://images.unsplash.com/photo-1577896851231-70ef18881754?w=800&auto=format&fit=crop&q=80',
    },
  ];

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Kelola Visi, Misi & Foto Organisasi"
      subtitle="Edit rumusan visi, butir misi strategis, dan foto utama yang tampil di portal publik"
      maxWidth="3xl"
    >
      <form onSubmit={handleSave} className="space-y-6">
        {/* Navigation Tabs */}
        <div className="flex items-center gap-1.5 p-1 bg-slate-100 dark:bg-slate-800 rounded-xl border border-slate-200/80 dark:border-slate-700 text-xs font-semibold overflow-x-auto">
          <button
            type="button"
            onClick={() => setActiveTab('all')}
            className={`px-3.5 py-1.5 rounded-lg transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'all'
                ? 'bg-white dark:bg-slate-900 text-[#2563EB] dark:text-blue-400 shadow-2xs font-bold'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            Semua Bagian
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('vision')}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'vision'
                ? 'bg-white dark:bg-slate-900 text-[#2563EB] dark:text-blue-400 shadow-2xs font-bold'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            <Eye className="w-3.5 h-3.5" />
            <span>Teks Visi</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('mission')}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'mission'
                ? 'bg-white dark:bg-slate-900 text-[#2563EB] dark:text-blue-400 shadow-2xs font-bold'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            <Target className="w-3.5 h-3.5" />
            <span>Butir Misi ({missionsList.length})</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('photo')}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'photo'
                ? 'bg-white dark:bg-slate-900 text-[#2563EB] dark:text-blue-400 shadow-2xs font-bold'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            <ImageIcon className="w-3.5 h-3.5" />
            <span>Foto Organisasi</span>
          </button>
        </div>

        <div className="space-y-6">
          {/* Section 1: Teks Visi */}
          {(activeTab === 'all' || activeTab === 'vision') && (
            <div className="bg-slate-50/70 dark:bg-slate-900/40 p-4 sm:p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-blue-100 dark:bg-blue-950/80 text-[#2563EB] dark:text-blue-400 flex items-center justify-center">
                    <Eye className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200">
                      Visi Utama Organisasi
                    </h4>
                    <p className="text-[11px] text-slate-500">
                      Garis besar arah jangka panjang kepengurusan OSIS
                    </p>
                  </div>
                </div>
                <span className="text-[10px] font-semibold text-slate-400">
                  {visionText.length} karakter
                </span>
              </div>

              <div>
                <textarea
                  value={visionText}
                  onChange={(e) => setVisionText(e.target.value)}
                  rows={3}
                  required
                  placeholder="Tuliskan visi kepengurusan OSIS..."
                  className="w-full px-3.5 py-2.5 text-xs sm:text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#2563EB] leading-relaxed"
                />
                <p className="text-[11px] text-slate-400 mt-1 flex items-center gap-1">
                  <Sparkles className="w-3 h-3 text-amber-500 shrink-0" />
                  <span>Tips: Gunakan kalimat yang lugas, inspiratif, dan mencerminkan semangat siswa.</span>
                </p>
              </div>
            </div>
          )}

          {/* Section 2: Daftar Butir Misi */}
          {(activeTab === 'all' || activeTab === 'mission') && (
            <div className="bg-slate-50/70 dark:bg-slate-900/40 p-4 sm:p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-emerald-100 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-400 flex items-center justify-center">
                    <Target className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200">
                      Daftar Butir Misi Strategis
                    </h4>
                    <p className="text-[11px] text-slate-500">
                      Langkah konkrit yang dilaksanakan untuk mewujudkan visi
                    </p>
                  </div>
                </div>
                <span className="px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 text-[10px] font-bold">
                  {missionsList.length} Butir
                </span>
              </div>

              {/* List of missions */}
              <div className="space-y-2.5">
                {missionsList.map((m, idx) => (
                  <div
                    key={idx}
                    className="flex items-center gap-2 bg-white dark:bg-slate-900 p-2 sm:p-2.5 rounded-xl border border-slate-200/80 dark:border-slate-700/80 shadow-2xs group"
                  >
                    <span className="w-6 h-6 rounded-full bg-[#EFF6FF] dark:bg-blue-950/80 text-[#2563EB] dark:text-blue-300 flex items-center justify-center text-xs font-extrabold shrink-0">
                      {idx + 1}
                    </span>
                    <input
                      type="text"
                      value={m}
                      onChange={(e) => handleMissionChange(idx, e.target.value)}
                      placeholder={`Butir misi ${idx + 1}...`}
                      className="flex-1 text-xs text-slate-800 dark:text-slate-200 bg-transparent focus:outline-none"
                    />
                    <button
                      type="button"
                      onClick={() => handleRemoveMission(idx)}
                      className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/50 rounded-lg transition-colors cursor-pointer"
                      title="Hapus butir misi ini"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}

                {missionsList.length === 0 && (
                  <p className="text-xs text-slate-400 text-center py-3 italic">
                    Belum ada butir misi. Tambahkan butir pertama di bawah ini.
                  </p>
                )}
              </div>

              {/* Add New Mission Input */}
              <div className="pt-2 flex flex-col sm:flex-row gap-2">
                <input
                  type="text"
                  value={newMissionInput}
                  onChange={(e) => setNewMissionInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddMission();
                    }
                  }}
                  placeholder="Tulis butir misi baru (tekan Enter untuk menambah)..."
                  className="flex-1 px-3 py-2 text-xs rounded-xl border border-dashed border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 focus:outline-none focus:border-[#2563EB]"
                />
                <button
                  type="button"
                  onClick={() => handleAddMission()}
                  disabled={!newMissionInput.trim()}
                  className="px-4 py-2 bg-[#2563EB] hover:bg-blue-700 disabled:opacity-40 disabled:hover:bg-[#2563EB] text-white text-xs font-bold rounded-xl transition-colors flex items-center justify-center gap-1.5 cursor-pointer shrink-0"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Tambah Misi</span>
                </button>
              </div>
            </div>
          )}

          {/* Section 3: Foto Visi & Misi / Organisasi */}
          {(activeTab === 'all' || activeTab === 'photo') && (
            <div className="bg-slate-50/70 dark:bg-slate-900/40 p-4 sm:p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 space-y-4">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-amber-100 dark:bg-amber-950/80 text-amber-700 dark:text-amber-400 flex items-center justify-center">
                  <ImageIcon className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200">
                    Foto Utama Visi & Misi
                  </h4>
                  <p className="text-[11px] text-slate-500">
                    Foto yang ditampilkan berdampingan dengan kartu visi & misi di portal
                  </p>
                </div>
              </div>

              {/* Image Picker with local browse & preview */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-start">
                <div>
                  <ImagePicker
                    label="Pilih Foto dari Komputer (Lokal)"
                    value={photoUrl}
                    onChange={(newVal) => setPhotoUrl(newVal)}
                    helperText="Mendukung format JPG, PNG, WebP dari komputer Anda"
                    aspectRatio="video"
                  />
                </div>

                <div className="space-y-3">
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1">
                      Atau Masukkan URL Gambar
                    </label>
                    <input
                      type="url"
                      value={photoUrl}
                      onChange={(e) => setPhotoUrl(e.target.value)}
                      placeholder="https://images.unsplash.com/..."
                      className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 focus:outline-none focus:border-[#2563EB]"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-500 dark:text-slate-400 mb-1.5">
                      Pilihan Cepat Foto Inspiratif:
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      {presetPhotos.map((preset, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => setPhotoUrl(preset.url)}
                          className={`p-2 rounded-xl border text-left text-[11px] transition-all cursor-pointer flex items-center gap-2 ${
                            photoUrl === preset.url
                              ? 'border-[#2563EB] bg-blue-50/70 dark:bg-blue-950/60 text-[#2563EB] font-bold'
                              : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:border-blue-300'
                          }`}
                        >
                          <img
                            src={preset.url}
                            alt={preset.title}
                            className="w-8 h-8 rounded-lg object-cover shrink-0"
                          />
                          <span className="truncate">{preset.title}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modal Actions */}
        <div className="flex items-center justify-between pt-3 border-t border-slate-100 dark:border-slate-800">
          <p className="text-[11px] text-slate-400 flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            <span>Perubahan langsung tersimpan dan tampil di portal publik</span>
          </p>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            >
              Batal
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 bg-[#2563EB] hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-sm transition-all flex items-center gap-2 cursor-pointer active:scale-95"
            >
              <Save className="w-4 h-4" />
              <span>Simpan Perubahan</span>
            </button>
          </div>
        </div>
      </form>
    </Modal>
  );
};

import React, { useState } from 'react';
import { Building2, Award, Edit3, Save, Plus, Trash2, Mail, Phone, Globe, MapPin } from 'lucide-react';
import { useApp } from '../../context/AppContext';

import { ImagePicker } from '../../components/common/ImagePicker';

export const ProfilOrganisasi: React.FC = () => {
  const { orgProfile, updateOrgProfile } = useApp();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState(orgProfile);
  const [newMission, setNewMission] = useState('');

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    updateOrgProfile(formData);
    setIsEditing(false);
  };

  const handleAddMission = () => {
    if (newMission.trim()) {
      setFormData({
        ...formData,
        mission: [...formData.mission, newMission.trim()],
      });
      setNewMission('');
    }
  };

  const handleRemoveMission = (index: number) => {
    setFormData({
      ...formData,
      mission: formData.mission.filter((_, i) => i !== index),
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-5 rounded-2xl border border-slate-200/80 shadow-2xs">
        <div>
          <h2 className="text-base font-bold text-slate-900">Profil Organisasi</h2>
          <p className="text-xs text-slate-500">
            Identitas resmi, visi, misi, dan kontak organisasi {orgProfile.schoolName}
          </p>
        </div>
        <button
          onClick={() => {
            if (isEditing) {
              setFormData(orgProfile);
            }
            setIsEditing(!isEditing);
          }}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
            isEditing
              ? 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              : 'bg-indigo-600 text-white hover:bg-indigo-500 shadow-sm'
          }`}
        >
          <Edit3 className="w-4 h-4" />
          <span>{isEditing ? 'Batal Edit' : 'Edit Profil'}</span>
        </button>
      </div>

      {isEditing ? (
        <form onSubmit={handleSave} className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Logo & Basic Info */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200/80 space-y-4">
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">Logo & Identitas</h3>
              
              <ImagePicker
                label="Logo Organisasi (Pilih dari Komputer)"
                value={formData.logoUrl}
                onChange={(url) => setFormData({ ...formData, logoUrl: url })}
                helperText="Pilih logo sekolah atau lambang OSIS dari komputer"
              />

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Nama Organisasi</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-indigo-500"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Nama Sekolah</label>
                <input
                  type="text"
                  value={formData.schoolName}
                  onChange={(e) => setFormData({ ...formData, schoolName: e.target.value })}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-indigo-500"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Tahun Ajaran Aktif</label>
                <input
                  type="text"
                  value={formData.academicYear}
                  onChange={(e) => setFormData({ ...formData, academicYear: e.target.value })}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-indigo-500"
                  required
                />
              </div>
            </div>

            {/* Visi, Misi & Sejarah */}
            <div className="lg:col-span-2 bg-white p-5 rounded-2xl border border-slate-200/80 space-y-4">
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">Visi & Misi</h3>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Visi Organisasi</label>
                <textarea
                  value={formData.vision}
                  onChange={(e) => setFormData({ ...formData, vision: e.target.value })}
                  rows={3}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-indigo-500"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Daftar Misi</label>
                <div className="space-y-2 mb-2">
                  {formData.mission.map((m, idx) => (
                    <div key={idx} className="flex items-center gap-2">
                      <span className="text-xs text-slate-400 font-bold">{idx + 1}.</span>
                      <input
                        type="text"
                        value={m}
                        onChange={(e) => {
                          const updated = [...formData.mission];
                          updated[idx] = e.target.value;
                          setFormData({ ...formData, mission: updated });
                        }}
                        className="flex-1 px-3 py-1.5 text-xs rounded-lg border border-slate-200 focus:outline-indigo-500"
                      />
                      <button
                        type="button"
                        onClick={() => handleRemoveMission(idx)}
                        className="p-1.5 text-rose-500 hover:bg-rose-50 rounded-lg cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newMission}
                    onChange={(e) => setNewMission(e.target.value)}
                    placeholder="Tambah butir misi baru..."
                    className="flex-1 px-3 py-1.5 text-xs rounded-lg border border-slate-200 focus:outline-indigo-500"
                  />
                  <button
                    type="button"
                    onClick={handleAddMission}
                    className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-lg flex items-center gap-1 cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" /> Tambah
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Sejarah Singkat</label>
                <textarea
                  value={formData.history}
                  onChange={(e) => setFormData({ ...formData, history: e.target.value })}
                  rows={3}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-indigo-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-slate-100">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Nama Kepala Sekolah</label>
                  <input
                    type="text"
                    value={formData.headmasterName}
                    onChange={(e) => setFormData({ ...formData, headmasterName: e.target.value })}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Nama Pembina OSIS</label>
                  <input
                    type="text"
                    value={formData.pembinaName}
                    onChange={(e) => setFormData({ ...formData, pembinaName: e.target.value })}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-indigo-500"
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-xl shadow-sm flex items-center gap-2 cursor-pointer"
            >
              <Save className="w-4 h-4" />
              Simpan Perubahan Profil
            </button>
          </div>
        </form>
      ) : (
        /* View Mode */
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Card Profil Utama */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-2xs space-y-5 text-center">
            <div className="w-24 h-24 mx-auto rounded-2xl overflow-hidden border-2 border-indigo-100 p-1 bg-white shadow-sm">
              <img
                src={orgProfile.logoUrl}
                alt={orgProfile.name}
                className="w-full h-full object-cover rounded-xl"
              />
            </div>
            <div>
              <h3 className="text-base font-extrabold text-slate-900">{orgProfile.name}</h3>
              <p className="text-xs text-indigo-600 font-semibold">{orgProfile.schoolName}</p>
              <span className="inline-block px-2.5 py-0.5 mt-2 rounded-full bg-slate-100 text-slate-600 text-[10px] font-bold">
                Periode {orgProfile.academicYear}
              </span>
            </div>

            <div className="pt-4 border-t border-slate-100 text-left space-y-2.5 text-xs text-slate-600">
              <div className="flex items-center gap-2.5">
                <MapPin className="w-4 h-4 text-slate-400 shrink-0" />
                <span>{orgProfile.address}</span>
              </div>
              <div className="flex items-center gap-2.5">
                <Phone className="w-4 h-4 text-slate-400 shrink-0" />
                <span>{orgProfile.phone}</span>
              </div>
              <div className="flex items-center gap-2.5">
                <Mail className="w-4 h-4 text-slate-400 shrink-0" />
                <span>{orgProfile.email}</span>
              </div>
              <div className="flex items-center gap-2.5">
                <Globe className="w-4 h-4 text-slate-400 shrink-0" />
                <span className="text-indigo-600 font-semibold">{orgProfile.instagram}</span>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-slate-50 text-left space-y-1 text-xs">
              <p className="text-[10px] text-slate-400 font-bold uppercase">Penanggung Jawab:</p>
              <p className="font-semibold text-slate-800">Kepala Sekolah: {orgProfile.headmasterName}</p>
              <p className="font-semibold text-slate-800">Pembina OSIS: {orgProfile.pembinaName}</p>
              <p className="font-semibold text-slate-800">Ketua OSIS: {orgProfile.ketuaName}</p>
            </div>
          </div>

          {/* Visi, Misi & Sejarah Card */}
          <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-slate-200/80 shadow-2xs space-y-6">
            <div>
              <span className="text-[10px] font-bold text-indigo-600 uppercase tracking-widest bg-indigo-50 px-2 py-0.5 rounded">
                Visi Organisasi
              </span>
              <p className="text-xs sm:text-sm text-slate-800 font-medium mt-2.5 leading-relaxed bg-slate-50 p-4 rounded-xl border border-slate-100 italic">
                "{orgProfile.vision}"
              </p>
            </div>

            <div>
              <span className="text-[10px] font-bold text-indigo-600 uppercase tracking-widest bg-indigo-50 px-2 py-0.5 rounded">
                Misi Organisasi
              </span>
              <ul className="mt-2.5 space-y-2 text-xs sm:text-sm text-slate-700">
                {orgProfile.mission.map((m, idx) => (
                  <li key={idx} className="flex items-start gap-2.5">
                    <span className="w-5 h-5 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5">
                      {idx + 1}
                    </span>
                    <span className="leading-relaxed">{m}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest bg-slate-100 px-2 py-0.5 rounded">
                Sejarah Singkat
              </span>
              <p className="text-xs text-slate-600 mt-2.5 leading-relaxed">
                {orgProfile.history}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

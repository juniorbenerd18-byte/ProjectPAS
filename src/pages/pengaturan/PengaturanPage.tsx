import React, { useState } from 'react';
import { Settings, Database, RefreshCw, Cloud, ShieldCheck, CheckCircle2, AlertTriangle, ExternalLink } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { isSupabaseConfigured } from '../../lib/supabase';

export const PengaturanPage: React.FC = () => {
  const { orgProfile, updateOrgProfile, resetAllData } = useApp();
  const [academicYear, setAcademicYear] = useState(orgProfile.academicYear);
  const isCloud = isSupabaseConfigured();

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    updateOrgProfile({ academicYear });
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-2xs">
        <h2 className="text-base font-bold text-slate-900">Pengaturan Sistem & Konfigurasi UKK</h2>
        <p className="text-xs text-slate-500">
          Konfigurasi koneksi Supabase, integrasi Cloudflare Pages, dan pemeliharaan basis data
        </p>
      </div>

      {/* Grid Settings */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Card 1: Periode Kepengurusan */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-2xs space-y-4">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <Settings className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">Periode Tahun Ajaran</h3>
              <p className="text-[11px] text-slate-500">Masa bakti kepengurusan organisasi</p>
            </div>
          </div>

          <form onSubmit={handleSaveSettings} className="space-y-3">
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">
                Tahun Ajaran Aktif
              </label>
              <input
                type="text"
                value={academicYear}
                onChange={(e) => setAcademicYear(e.target.value)}
                placeholder="2025/2026"
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-indigo-500"
                required
              />
            </div>
            <button
              type="submit"
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold shadow-xs cursor-pointer"
            >
              Simpan Periode
            </button>
          </form>
        </div>

        {/* Card 2: Status Mode Sistem (Dual-Mode UKK) */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-2xs space-y-4">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <Database className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">Status Penyimpanan Data</h3>
              <p className="text-[11px] text-slate-500">Arsitektur Dual-Mode Resilient UKK</p>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2 text-xs">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-slate-700">Mode Aktif:</span>
              <span className="inline-flex items-center gap-1 font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full text-[10px]">
                <CheckCircle2 className="w-3.5 h-3.5" />
                {isCloud ? 'Supabase Live Connected' : 'Dual-Mode (Local Persisted)'}
              </span>
            </div>
            <p className="text-[11px] text-slate-500 leading-relaxed">
              Semua data keanggotaan, iuran kas, foto dari komputer, dan presensi tersimpan otomatis dan persisten di browser (anti-crash saat presentasi UKK tanpa internet).
            </p>
          </div>
        </div>

        {/* Card 3: Cloudflare Pages Deployment Guide */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-2xs space-y-3 md:col-span-2">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <Cloud className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">Panduan Deployment ke Cloudflare Pages</h3>
              <p className="text-[11px] text-slate-500">Hosting gratis, kilat, dan aman untuk UKK</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 text-xs">
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
              <p className="font-bold text-slate-800">1. Build Command</p>
              <code className="text-[11px] font-mono bg-white px-2 py-1 rounded border border-slate-200 block mt-1">
                npm run build
              </code>
            </div>
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
              <p className="font-bold text-slate-800">2. Output Directory</p>
              <code className="text-[11px] font-mono bg-white px-2 py-1 rounded border border-slate-200 block mt-1">
                dist
              </code>
            </div>
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
              <p className="font-bold text-slate-800">3. Node Version</p>
              <code className="text-[11px] font-mono bg-white px-2 py-1 rounded border border-slate-200 block mt-1">
                NODE_VERSION: 20+
              </code>
            </div>
          </div>
        </div>

        {/* Card 4: Factory Reset Data */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-2xs space-y-3 md:col-span-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center">
                <RefreshCw className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900">Reset Data Demo ke Default UKK</h3>
                <p className="text-[11px] text-slate-500">
                  Kembalikan seluruh data siswa, kas, rapat, dan dokumen ke kondisi awal pengujian
                </p>
              </div>
            </div>
            <button
              onClick={() => {
                if (confirm('Apakah Anda yakin ingin me-reset seluruh data ke nilai default awal UKK?')) {
                  resetAllData();
                }
              }}
              className="px-4 py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-xl text-xs font-bold transition-all cursor-pointer"
            >
              Reset ke Default
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

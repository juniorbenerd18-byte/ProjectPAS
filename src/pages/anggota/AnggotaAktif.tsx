import React, { useState } from 'react';
import { Users, Phone, Mail, Award, Search, CreditCard } from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const AnggotaAktif: React.FC = () => {
  const { members, setActivePage } = useApp();
  const [searchTerm, setSearchTerm] = useState('');

  const activeMembers = members.filter((m) => m.status === 'aktif');
  const filtered = activeMembers.filter(
    (m) =>
      m.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      m.classRoom.toLowerCase().includes(searchTerm.toLowerCase()) ||
      m.position.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-5 rounded-2xl border border-slate-200/80 shadow-2xs">
        <div>
          <h2 className="text-base font-bold text-slate-900">Daftar Anggota Aktif</h2>
          <p className="text-xs text-slate-500">
            Seluruh siswa yang tercatat sebagai pengurus aktif periode berjalan ({activeMembers.length} Siswa)
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-50 rounded-xl border border-slate-200/80 text-xs">
            <Search className="w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Cari pengurus aktif..."
              className="w-40 sm:w-56 bg-transparent outline-none text-slate-700"
            />
          </div>
        </div>
      </div>

      {/* Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((m) => (
          <div
            key={m.id}
            className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-2xs space-y-4 hover:border-indigo-300 transition-all flex flex-col justify-between"
          >
            <div>
              <div className="flex items-start gap-3">
                <img
                  src={m.avatarUrl}
                  alt={m.fullName}
                  className="w-12 h-12 rounded-2xl object-cover border border-slate-200 shadow-2xs"
                />
                <div className="flex-1 min-w-0">
                  <h3 className="text-sm font-bold text-slate-900 truncate">{m.fullName}</h3>
                  <span className="inline-block px-2 py-0.5 mt-0.5 rounded-full text-[10px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-100">
                    {m.position}
                  </span>
                  <p className="text-xs text-slate-500 mt-1">
                    {m.classRoom} • {m.major}
                  </p>
                </div>
              </div>

              <div className="mt-3 pt-3 border-t border-slate-100 space-y-1.5 text-xs text-slate-600">
                <p className="text-[11px] text-slate-400 font-mono">NISN: {m.nisn}</p>
                <p className="text-[11px] text-slate-500">{m.divisionName}</p>
                {m.phone && (
                  <p className="flex items-center gap-1.5 text-slate-500 text-[11px]">
                    <Phone className="w-3.5 h-3.5 text-slate-400" />
                    <span>{m.phone}</span>
                  </p>
                )}
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
              <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                Aktif Bertugas
              </span>
              <button
                onClick={() => setActivePage('anggota-kartu')}
                className="text-xs font-bold text-indigo-600 hover:text-indigo-700 flex items-center gap-1 cursor-pointer"
              >
                <CreditCard className="w-3.5 h-3.5" />
                <span>Lihat KTA</span>
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

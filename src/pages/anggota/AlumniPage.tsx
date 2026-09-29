import React, { useState } from 'react';
import { GraduationCap, Search, Mail, Phone, Calendar } from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const AlumniPage: React.FC = () => {
  const { members } = useApp();
  const [searchTerm, setSearchTerm] = useState('');

  const alumniMembers = members.filter((m) => m.status === 'alumni');
  const filtered = alumniMembers.filter(
    (m) =>
      m.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      m.generation.toLowerCase().includes(searchTerm.toLowerCase()) ||
      m.position.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-5 rounded-2xl border border-slate-200/80 shadow-2xs">
        <div>
          <h2 className="text-base font-bold text-slate-900">Arsip Alumni & Demisioner</h2>
          <p className="text-xs text-slate-500">
            Daftar jejak rekam mantan pengurus OSIS SMK yang telah purnatugas ({alumniMembers.length} Alumni)
          </p>
        </div>
        <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-50 rounded-xl border border-slate-200/80 text-xs">
          <Search className="w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Cari nama alumni..."
            className="w-48 bg-transparent outline-none text-slate-700"
          />
        </div>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((alumni) => (
          <div
            key={alumni.id}
            className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-2xs space-y-3"
          >
            <div className="flex items-center gap-3">
              <img
                src={alumni.avatarUrl}
                alt={alumni.fullName}
                className="w-12 h-12 rounded-2xl object-cover border border-slate-200"
              />
              <div>
                <h3 className="text-sm font-bold text-slate-900">{alumni.fullName}</h3>
                <p className="text-xs font-semibold text-amber-600">{alumni.position}</p>
                <p className="text-[11px] text-slate-400">{alumni.major}</p>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 space-y-1 text-xs text-slate-600">
              <p className="flex items-center gap-1.5 text-slate-500">
                <GraduationCap className="w-3.5 h-3.5 text-slate-400" />
                <span>{alumni.generation}</span>
              </p>
              {alumni.alumniYear && (
                <p className="flex items-center gap-1.5 text-slate-500">
                  <Calendar className="w-3.5 h-3.5 text-slate-400" />
                  <span>Tahun Lulus: {alumni.alumniYear}</span>
                </p>
              )}
            </div>

            <div className="pt-2">
              <span className="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-800 border border-amber-200/60">
                Demisioner Terhormat
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

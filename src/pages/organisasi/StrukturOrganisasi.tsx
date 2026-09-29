import React from 'react';
import { Layers, ShieldCheck, Users, Phone, Mail } from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const StrukturOrganisasi: React.FC = () => {
  const { orgProfile, members, divisions } = useApp();

  const pembina = {
    name: orgProfile.pembinaName,
    role: 'Pembina OSIS',
    title: 'Guru Pembina Kesiswaan',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
  };

  const ketua = members.find((m) => m.position === 'Ketua Umum') || members[0];
  const sekretaris = members.find((m) => m.position === 'Sekretaris Umum') || members[1];
  const bendahara = members.find((m) => m.position === 'Bendahara Umum') || members[2];

  // Sekbid coordinators
  const sekbidMembers = members.filter(
    (m) => m.divisionId && m.divisionId !== 'div-bph' && m.status === 'aktif'
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-2xs">
        <h2 className="text-base font-bold text-slate-900">Bagan Struktur Organisasi</h2>
        <p className="text-xs text-slate-500">
          Hierarki kepengurusan resmi OSIS {orgProfile.schoolName} Masa Bakti {orgProfile.academicYear}
        </p>
      </div>

      {/* Organizational Tree Chart Visualizer */}
      <div className="bg-white p-6 sm:p-10 rounded-2xl border border-slate-200/80 shadow-2xs overflow-x-auto">
        <div className="min-w-[700px] flex flex-col items-center">
          {/* Level 1: Pembina */}
          <div className="flex flex-col items-center">
            <div className="w-64 p-4 rounded-2xl bg-slate-900 text-white shadow-md text-center border border-slate-800">
              <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest">
                Pelindung & Pembina
              </span>
              <h4 className="text-xs font-bold mt-1 text-slate-100">{pembina.name}</h4>
              <p className="text-[10px] text-slate-400">{pembina.title}</p>
            </div>
            {/* Connecting Line */}
            <div className="w-0.5 h-8 bg-slate-300" />
          </div>

          {/* Level 2: Ketua OSIS */}
          <div className="flex flex-col items-center">
            <div className="w-72 p-4 rounded-2xl bg-indigo-600 text-white shadow-md text-center border border-indigo-500 relative">
              <span className="text-[10px] font-bold text-indigo-200 uppercase tracking-widest">
                Ketua Umum OSIS
              </span>
              <div className="flex items-center justify-center gap-3 mt-2">
                <img
                  src={ketua.avatarUrl}
                  alt={ketua.fullName}
                  className="w-10 h-10 rounded-full object-cover border-2 border-white/50"
                />
                <div className="text-left">
                  <h4 className="text-xs font-bold leading-tight">{ketua.fullName}</h4>
                  <p className="text-[10px] text-indigo-200">{ketua.classRoom} • {ketua.major}</p>
                  <p className="text-[10px] text-indigo-200">NISN: {ketua.nisn}</p>
                </div>
              </div>
            </div>
            {/* Connecting Vertical Line */}
            <div className="w-0.5 h-8 bg-slate-300" />
          </div>

          {/* Level 3: Sekretaris & Bendahara (Horizontal Branch) */}
          <div className="relative w-full max-w-xl">
            {/* Horizontal Bar */}
            <div className="absolute top-0 left-1/4 right-1/4 h-0.5 bg-slate-300" />
            <div className="flex justify-around pt-8">
              {/* Sekretaris */}
              <div className="w-60 p-3.5 rounded-2xl bg-slate-50 border border-slate-200/90 text-center shadow-xs">
                <span className="text-[10px] font-bold text-indigo-600 uppercase tracking-wider bg-indigo-50 px-2 py-0.5 rounded">
                  Sekretaris Umum
                </span>
                <div className="flex items-center gap-2.5 mt-2.5 text-left">
                  <img
                    src={sekretaris.avatarUrl}
                    alt={sekretaris.fullName}
                    className="w-9 h-9 rounded-full object-cover border border-slate-200"
                  />
                  <div>
                    <h5 className="text-xs font-bold text-slate-800 leading-tight">{sekretaris.fullName}</h5>
                    <p className="text-[10px] text-slate-400">{sekretaris.classRoom} • {sekretaris.major}</p>
                  </div>
                </div>
              </div>

              {/* Bendahara */}
              <div className="w-60 p-3.5 rounded-2xl bg-slate-50 border border-slate-200/90 text-center shadow-xs">
                <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-wider bg-emerald-50 px-2 py-0.5 rounded">
                  Bendahara Umum
                </span>
                <div className="flex items-center gap-2.5 mt-2.5 text-left">
                  <img
                    src={bendahara.avatarUrl}
                    alt={bendahara.fullName}
                    className="w-9 h-9 rounded-full object-cover border border-slate-200"
                  />
                  <div>
                    <h5 className="text-xs font-bold text-slate-800 leading-tight">{bendahara.fullName}</h5>
                    <p className="text-[10px] text-slate-400">{bendahara.classRoom} • {bendahara.major}</p>
                  </div>
                </div>
              </div>
            </div>
            {/* Connecting Vertical Line down to Sekbid */}
            <div className="w-0.5 h-8 bg-slate-300 mx-auto" />
          </div>

          {/* Level 4: Koordinator Seksi Bidang (Sekbid) */}
          <div className="w-full mt-2 pt-6 border-t-2 border-dashed border-slate-200">
            <div className="text-center mb-6">
              <span className="text-xs font-extrabold text-slate-700 uppercase tracking-wider bg-slate-100 px-3 py-1 rounded-full">
                Seksi Bidang (Sekbid) & Divisi
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {divisions
                .filter((d) => d.id !== 'div-bph')
                .map((div) => {
                  const divMembers = members.filter((m) => m.divisionId === div.id);
                  const coordinator = divMembers.find((m) => m.position === 'Koordinator Sekbid') || divMembers[0];
                  const staffMembers = divMembers.filter((m) => m.id !== coordinator?.id);

                  return (
                    <div
                      key={div.id}
                      className="p-4 rounded-2xl border border-slate-200/80 bg-white hover:border-indigo-300 transition-all shadow-2xs space-y-3"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded uppercase">
                          {div.code}
                        </span>
                        <span className="text-[10px] text-slate-400 font-semibold">
                          {divMembers.length} Anggota
                        </span>
                      </div>
                      <h4 className="text-xs font-bold text-slate-900 leading-snug">{div.name}</h4>
                      <p className="text-[11px] text-slate-500 line-clamp-2">{div.description}</p>

                      {/* Koordinator */}
                      {coordinator && (
                        <div className="p-2.5 rounded-xl bg-slate-50 flex items-center gap-2.5">
                          <img
                            src={coordinator.avatarUrl}
                            alt={coordinator.fullName}
                            className="w-8 h-8 rounded-lg object-cover"
                          />
                          <div>
                            <p className="text-[10px] font-bold text-slate-500 uppercase">Koordinator</p>
                            <p className="text-xs font-bold text-slate-800 leading-tight">
                              {coordinator.fullName}
                            </p>
                            <p className="text-[10px] text-slate-400">{coordinator.classRoom}</p>
                          </div>
                        </div>
                      )}

                      {/* Staff Anggota */}
                      {staffMembers.length > 0 && (
                        <div className="space-y-1 pt-1">
                          <p className="text-[10px] text-slate-400 font-bold uppercase">Staff Pelaksana:</p>
                          <div className="flex flex-wrap gap-1.5">
                            {staffMembers.map((sm) => (
                              <span
                                key={sm.id}
                                className="text-[10px] font-medium bg-slate-100 text-slate-700 px-2 py-0.5 rounded-md"
                              >
                                {sm.fullName} ({sm.classRoom})
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

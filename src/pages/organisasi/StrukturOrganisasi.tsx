import React from 'react';
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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="simo-card p-6">
        <h2 className="text-xl font-extrabold text-[#1F3A5F] dark:text-[#FAF6EE]">Bagan Struktur Organisasi</h2>
        <p className="text-[14px] text-[#5A6472] dark:text-[#9AA8B8] mt-1">
          Hierarki kepengurusan resmi OSIS {orgProfile.schoolName} Masa Bakti {orgProfile.academicYear}
        </p>
      </div>

      {/* Organizational Tree Chart Visualizer */}
      <div className="simo-card p-6 sm:p-10 overflow-x-auto">
        <div className="min-w-[700px] flex flex-col items-center">
          {/* Level 1: Pembina */}
          <div className="flex flex-col items-center">
            <div className="w-64 p-4 rounded-[16px] bg-[#1F3A5F] text-[#FAF6EE] text-center border border-[#152741]">
              <span className="text-[12px] font-bold text-[#F2B544] uppercase tracking-wider block">
                Pelindung &amp; Pembina
              </span>
              <h4 className="text-[15px] font-bold mt-1 text-[#FAF6EE]">{pembina.name}</h4>
              <p className="text-[12px] text-[#E4EAF2]">{pembina.title}</p>
            </div>
            {/* Connecting Line */}
            <div className="w-[2px] h-8 bg-[#E6DFD0] dark:bg-[#283D56]" />
          </div>

          {/* Level 2: Ketua OSIS */}
          <div className="flex flex-col items-center">
            <div className="w-72 p-4 rounded-[16px] bg-[#1F3A5F] text-[#FAF6EE] text-center border border-[#152741] relative">
              <span className="text-[12px] font-bold text-[#F2B544] uppercase tracking-wider block">
                Ketua Umum OSIS
              </span>
              <div className="flex items-center justify-center gap-3 mt-2.5">
                <img
                  src={ketua.avatarUrl}
                  alt={ketua.fullName}
                  className="w-11 h-11 rounded-full object-cover border-2 border-[#FAF6EE]"
                />
                <div className="text-left">
                  <h4 className="text-[14px] font-bold leading-tight">{ketua.fullName}</h4>
                  <p className="text-[12px] text-[#E4EAF2]">{ketua.classRoom} • {ketua.major}</p>
                  <p className="text-[12px] text-[#E4EAF2] font-mono">NISN: {ketua.nisn}</p>
                </div>
              </div>
            </div>
            {/* Connecting Vertical Line */}
            <div className="w-[2px] h-8 bg-[#E6DFD0] dark:bg-[#283D56]" />
          </div>

          {/* Level 3: Sekretaris & Bendahara (Horizontal Branch) */}
          <div className="relative w-full max-w-xl">
            {/* Horizontal Bar */}
            <div className="absolute top-0 left-1/4 right-1/4 h-[2px] bg-[#E6DFD0] dark:bg-[#283D56]" />
            <div className="flex justify-around pt-8">
              {/* Sekretaris */}
              <div className="w-64 p-4 rounded-[16px] bg-[#FAF6EE] dark:bg-[#0E1B2C] border border-[#E6DFD0] dark:border-[#283D56] text-center">
                <span className="text-[12px] font-bold text-[#1F3A5F] dark:text-[#FAF6EE] uppercase tracking-wider bg-[#E4EAF2] dark:bg-[#1F3A5F]/40 px-2.5 py-0.5 rounded-[6px] inline-block">
                  Sekretaris Umum
                </span>
                <div className="flex items-center gap-3 mt-3 text-left">
                  <img
                    src={sekretaris.avatarUrl}
                    alt={sekretaris.fullName}
                    className="w-10 h-10 rounded-full object-cover border border-[#E6DFD0] dark:border-[#283D56]"
                  />
                  <div>
                    <h5 className="text-[14px] font-bold text-[#1F3A5F] dark:text-[#FAF6EE] leading-tight">{sekretaris.fullName}</h5>
                    <p className="text-[12px] text-[#5A6472] dark:text-[#9AA8B8]">{sekretaris.classRoom} • {sekretaris.major}</p>
                  </div>
                </div>
              </div>

              {/* Bendahara */}
              <div className="w-64 p-4 rounded-[16px] bg-[#FAF6EE] dark:bg-[#0E1B2C] border border-[#E6DFD0] dark:border-[#283D56] text-center">
                <span className="text-[12px] font-bold text-[#1F3A5F] dark:text-[#FAF6EE] uppercase tracking-wider bg-[#FBEBC8] dark:bg-[#F2B544]/20 px-2.5 py-0.5 rounded-[6px] inline-block">
                  Bendahara Umum
                </span>
                <div className="flex items-center gap-3 mt-3 text-left">
                  <img
                    src={bendahara.avatarUrl}
                    alt={bendahara.fullName}
                    className="w-10 h-10 rounded-full object-cover border border-[#E6DFD0] dark:border-[#283D56]"
                  />
                  <div>
                    <h5 className="text-[14px] font-bold text-[#1F3A5F] dark:text-[#FAF6EE] leading-tight">{bendahara.fullName}</h5>
                    <p className="text-[12px] text-[#5A6472] dark:text-[#9AA8B8]">{bendahara.classRoom} • {bendahara.major}</p>
                  </div>
                </div>
              </div>
            </div>
            {/* Connecting Vertical Line down to Sekbid */}
            <div className="w-[2px] h-8 bg-[#E6DFD0] dark:bg-[#283D56] mx-auto" />
          </div>

          {/* Level 4: Koordinator Seksi Bidang (Sekbid) */}
          <div className="w-full mt-2 pt-6 border-t border-[#E6DFD0] dark:border-[#283D56]">
            <div className="text-center mb-6">
              <span className="text-[14px] font-extrabold text-[#1F3A5F] dark:text-[#FAF6EE] uppercase tracking-wider bg-[#E4EAF2] dark:bg-[#1F3A5F]/40 px-4 py-1.5 rounded-full border border-[#E6DFD0] dark:border-[#283D56]">
                Seksi Bidang (Sekbid) &amp; Divisi
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
                      className="p-5 rounded-[16px] border border-[#E6DFD0] dark:border-[#283D56] bg-[#FFFDF8] dark:bg-[#17293E] space-y-3"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-[12px] font-bold text-[#1F3A5F] dark:text-[#FAF6EE] bg-[#E4EAF2] dark:bg-[#1F3A5F]/40 px-2.5 py-0.5 rounded-[6px] uppercase">
                          {div.code}
                        </span>
                        <span className="text-[13px] text-[#5A6472] dark:text-[#9AA8B8] font-semibold">
                          {divMembers.length} Anggota
                        </span>
                      </div>
                      <h4 className="text-[15px] font-bold text-[#1F3A5F] dark:text-[#FAF6EE] leading-snug">{div.name}</h4>
                      <p className="text-[13px] text-[#5A6472] dark:text-[#9AA8B8] line-clamp-2">{div.description}</p>

                      {/* Koordinator */}
                      {coordinator && (
                        <div className="p-3 rounded-[12px] bg-[#FAF6EE] dark:bg-[#0E1B2C] border border-[#E6DFD0] dark:border-[#283D56] flex items-center gap-3">
                          <img
                            src={coordinator.avatarUrl}
                            alt={coordinator.fullName}
                            className="w-9 h-9 rounded-[10px] object-cover"
                          />
                          <div>
                            <p className="text-[11px] font-bold text-[#5A6472] dark:text-[#9AA8B8] uppercase">Koordinator</p>
                            <p className="text-[14px] font-bold text-[#1F3A5F] dark:text-[#FAF6EE] leading-tight">
                              {coordinator.fullName}
                            </p>
                            <p className="text-[12px] text-[#5A6472] dark:text-[#9AA8B8]">{coordinator.classRoom}</p>
                          </div>
                        </div>
                      )}

                      {/* Staff Anggota */}
                      {staffMembers.length > 0 && (
                        <div className="space-y-1.5 pt-1.5">
                          <p className="text-[12px] text-[#5A6472] dark:text-[#9AA8B8] font-bold uppercase">Staff Pelaksana:</p>
                          <div className="flex flex-wrap gap-1.5">
                            {staffMembers.map((sm) => (
                              <span
                                key={sm.id}
                                className="text-[12px] font-semibold bg-[#FAF6EE] dark:bg-[#0E1B2C] text-[#1F3A5F] dark:text-[#FAF6EE] border border-[#E6DFD0] dark:border-[#283D56] px-2.5 py-0.5 rounded-[6px]"
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

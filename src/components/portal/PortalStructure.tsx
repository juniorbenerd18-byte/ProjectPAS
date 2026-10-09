import React, { useState } from 'react';
import {
  Users,
  GraduationCap,
  Award,
  BookOpen,
  Instagram,
  Mail,
  Sparkles,
  ChevronRight,
  Shield,
  HeartHandshake,
} from 'lucide-react';
import {
  PortalMember,
  PortalDivision,
  PortalOrganization,
} from '../../data/portalData';

interface PortalStructureProps {
  organization: PortalOrganization;
  divisions: PortalDivision[];
  members: PortalMember[];
}

export const PortalStructure: React.FC<PortalStructureProps> = ({
  organization,
  divisions,
  members,
}) => {
  const [selectedDivisionTab, setSelectedDivisionTab] = useState<string>('BPH');

  // Leaders / BPH
  const bphMembers = members.filter((m) => m.divisionCode === 'BPH');

  // Sekbid divisions (excluding BPH)
  const sekbidDivisions = divisions.filter((d) => d.code !== 'BPH');

  // Currently selected division members
  const activeMembers = members.filter(
    (m) => m.divisionCode === selectedDivisionTab
  );

  const activeDivisionInfo = divisions.find(
    (d) => d.code === selectedDivisionTab
  );

  return (
    <section id="struktur" className="py-16 bg-white dark:bg-slate-950 border-b border-slate-200/80 dark:border-slate-800 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-100 dark:bg-indigo-950/80 text-indigo-700 dark:text-indigo-300 text-xs font-bold uppercase tracking-wider">
            <Users className="w-3.5 h-3.5" />
            <span>Kepengurusan Periode 2025/2026</span>
          </div>
          <h2 className="font-heading text-2xl sm:text-3xl md:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Struktur Organisasi OSIS
          </h2>
          <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400 leading-relaxed">
            Dipimpin oleh generasi siswa berintegritas, kreatif, dan berdedikasi tinggi di bawah bimbingan pembina sekolah.
          </p>
        </div>

        {/* Pembina & Kepala Sekolah Endorsement Banner */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
          {/* Kepala Sekolah */}
          <div className="bg-gradient-to-r from-blue-900 to-indigo-950 text-white rounded-2xl p-5 sm:p-6 border border-blue-800/60 shadow-lg flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-blue-700/60 border border-blue-500/40 flex items-center justify-center shrink-0">
              <Award className="w-7 h-7 text-amber-300" />
            </div>
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-blue-300">
                Pelindung &amp; Penasihat
              </span>
              <h3 className="font-heading font-extrabold text-base text-white">
                {organization.headmaster.name}
              </h3>
              <p className="text-xs text-blue-200">{organization.headmaster.role}</p>
              <p className="text-[11px] text-blue-300/80 mt-0.5">
                NIP. {organization.headmaster.nip}
              </p>
            </div>
          </div>

          {/* Pembina OSIS */}
          <div className="bg-gradient-to-r from-slate-900 to-blue-950 text-white rounded-2xl p-5 sm:p-6 border border-slate-800 shadow-lg flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center shrink-0">
              <GraduationCap className="w-7 h-7 text-amber-400" />
            </div>
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400">
                Pembina Resmi OSIS
              </span>
              <h3 className="font-heading font-extrabold text-base text-white">
                {organization.pembina.name}
              </h3>
              <p className="text-xs text-slate-300">{organization.pembina.role}</p>
              <p className="text-[11px] text-slate-400 mt-0.5">
                NIP. {organization.pembina.nip}
              </p>
            </div>
          </div>
        </div>

        {/* Badan Pengurus Harian (BPH) Highlight */}
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Shield className="w-4 h-4 text-blue-600 dark:text-blue-400" />
            <h3 className="font-heading font-bold text-lg text-slate-900 dark:text-white">
              Badan Pengurus Harian (BPH)
            </h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {bphMembers.map((member) => (
              <div
                key={member.id}
                className="group bg-slate-50 dark:bg-slate-900/80 rounded-2xl p-5 border border-slate-200/80 dark:border-slate-800 hover:border-blue-400 dark:hover:border-blue-500/50 shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1 flex flex-col justify-between"
              >
                <div>
                  {/* Photo & Role Badge */}
                  <div className="relative mb-4">
                    <div className="w-20 h-20 mx-auto rounded-2xl overflow-hidden ring-4 ring-blue-500/20 group-hover:ring-blue-500/40 transition-all">
                      <img
                        src={member.photoUrl}
                        alt={member.fullName}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    </div>
                    <span className="absolute -bottom-2.5 left-1/2 -translate-x-1/2 px-2.5 py-0.5 rounded-full bg-blue-600 text-white text-[10px] font-bold tracking-wide shadow-sm whitespace-nowrap">
                      {member.role}
                    </span>
                  </div>

                  <div className="text-center mt-3 space-y-1">
                    <h4 className="font-heading font-bold text-sm text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                      {member.fullName}
                    </h4>
                    <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                      {member.classRoom}
                    </p>
                    <p className="text-[11px] italic text-slate-400 dark:text-slate-500 pt-1 line-clamp-2">
                      "{member.motto}"
                    </p>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-200/60 dark:border-slate-800 flex items-center justify-between text-[11px] text-slate-400">
                  <span>NISN: {member.nisn}</span>
                  <a
                    href={`https://instagram.com/${member.instagram.replace('@', '')}`}
                    target="_blank"
                    rel="noreferrer"
                    className="text-slate-400 hover:text-pink-500 transition-colors flex items-center gap-1"
                  >
                    <Instagram className="w-3.5 h-3.5" />
                    <span>{member.instagram}</span>
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Seksi Bidang (Sekbid) Explorer Tabs */}
        <div className="space-y-6 pt-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-500" />
              <h3 className="font-heading font-bold text-lg text-slate-900 dark:text-white">
                Pengurus Seksi Bidang (Sekbid)
              </h3>
            </div>

            {/* Division Tabs */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
              {sekbidDivisions.map((div) => (
                <button
                  key={div.code}
                  onClick={() => setSelectedDivisionTab(div.code)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                    selectedDivisionTab === div.code
                      ? 'bg-blue-600 text-white shadow-sm shadow-blue-500/25'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                  }`}
                >
                  {div.code}
                </button>
              ))}
            </div>
          </div>

          {/* Active Division Description Header */}
          {activeDivisionInfo && (
            <div className="p-4 sm:p-5 rounded-2xl bg-blue-50/70 dark:bg-slate-900/90 border border-blue-100 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded bg-blue-600 text-white text-[10px] font-bold">
                    {activeDivisionInfo.code}
                  </span>
                  <h4 className="font-heading font-bold text-base text-slate-900 dark:text-white">
                    {activeDivisionInfo.name}
                  </h4>
                </div>
                <p className="mt-1 text-xs text-slate-600 dark:text-slate-400">
                  {activeDivisionInfo.description}
                </p>
              </div>

              <div className="text-xs text-slate-500 dark:text-slate-400 shrink-0">
                <span className="font-medium">Koordinator:</span>{' '}
                <span className="font-bold text-slate-800 dark:text-slate-200">
                  {activeDivisionInfo.leaderName}
                </span>
              </div>
            </div>
          )}

          {/* Division Members Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {activeMembers.map((member) => (
              <div
                key={member.id}
                className="bg-white dark:bg-slate-900 rounded-2xl p-4 sm:p-5 border border-slate-200/80 dark:border-slate-800 hover:border-blue-400 dark:hover:border-blue-500/50 shadow-xs hover:shadow-md transition-all flex items-center gap-4"
              >
                <div className="w-14 h-14 rounded-xl overflow-cover ring-2 ring-slate-100 dark:ring-slate-800 shrink-0 overflow-hidden">
                  <img
                    src={member.photoUrl}
                    alt={member.fullName}
                    className="w-full h-full object-cover"
                  />
                </div>

                <div className="space-y-0.5 flex-1 min-w-0">
                  <span className="text-[10px] font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wide">
                    {member.role}
                  </span>
                  <h5 className="font-heading font-bold text-sm text-slate-900 dark:text-white truncate">
                    {member.fullName}
                  </h5>
                  <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                    {member.classRoom}
                  </p>
                  <p className="text-[11px] italic text-slate-400 truncate">
                    "{member.motto}"
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

import React, { useState, useMemo } from 'react';
import {
  Search,
  Filter,
  Grid,
  List,
  CheckCircle2,
  Clock,
  Calendar,
  Layers,
  User,
  Target,
  Sparkles,
  DollarSign,
  ChevronRight,
  X,
  FileText,
  Check,
  Share2,
} from 'lucide-react';
import {
  PortalWorkProgram,
  PortalDivision,
  ProkerStatus,
} from '../../data/portalData';

interface PortalProkerDashboardProps {
  workPrograms: PortalWorkProgram[];
  divisions: PortalDivision[];
}

export const PortalProkerDashboard: React.FC<PortalProkerDashboardProps> = ({
  workPrograms,
  divisions,
}) => {
  // Search & Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDivision, setSelectedDivision] = useState<string>('ALL');
  const [selectedMonth, setSelectedMonth] = useState<string>('ALL');
  const [selectedStatus, setSelectedStatus] = useState<string>('ALL');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  // Detail Modal
  const [selectedProker, setSelectedProker] = useState<PortalWorkProgram | null>(null);
  const [copiedLink, setCopiedLink] = useState(false);

  // Month list derived from data
  const months = useMemo(() => {
    const set = new Set<string>();
    workPrograms.forEach((p) => {
      if (p.month) set.add(p.month);
    });
    return Array.from(set);
  }, [workPrograms]);

  // Filtered proker items
  const filteredPrograms = useMemo(() => {
    return workPrograms.filter((p) => {
      const matchDivision =
        selectedDivision === 'ALL' || p.divisionCode === selectedDivision;
      const matchMonth = selectedMonth === 'ALL' || p.month === selectedMonth;
      const matchStatus =
        selectedStatus === 'ALL' || p.status === selectedStatus;
      const matchSearch =
        p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.picName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.divisionName.toLowerCase().includes(searchQuery.toLowerCase());

      return matchDivision && matchMonth && matchStatus && matchSearch;
    });
  }, [workPrograms, selectedDivision, selectedMonth, selectedStatus, searchQuery]);

  // Status Badge Component
  const renderStatusBadge = (status: ProkerStatus) => {
    switch (status) {
      case 'Selesai':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 dark:bg-emerald-950/70 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
            <span>Selesai</span>
          </span>
        );
      case 'Berjalan':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-50 dark:bg-amber-950/70 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
            <span className="w-2 h-2 rounded-full bg-amber-500 animate-ping inline-block" />
            <span>Sedang Berjalan</span>
          </span>
        );
      case 'Direncanakan':
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-50 dark:bg-blue-950/70 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
            <Clock className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
            <span>Direncanakan</span>
          </span>
        );
    }
  };

  const handleCopyLink = () => {
    if (selectedProker) {
      navigator.clipboard.writeText(
        `${window.location.origin}/#proker-${selectedProker.id}`
      );
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
    }
  };

  return (
    <section id="proker" className="py-16 bg-slate-50/70 dark:bg-slate-900/40 border-b border-slate-200/80 dark:border-slate-800 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-100 dark:bg-blue-950/80 text-blue-700 dark:text-blue-300 text-xs font-bold uppercase tracking-wider mb-2">
              <Layers className="w-3.5 h-3.5" />
              <span>Transparansi Kinerja</span>
            </div>
            <h2 className="font-heading text-2xl sm:text-3xl md:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              Dashboard Program Kerja OSIS
            </h2>
            <p className="mt-1 text-sm sm:text-base text-slate-600 dark:text-slate-400 max-w-2xl">
              Pantau progres realisasi, sasaran, indikator keberhasilan, dan penanggung jawab seluruh program kerja secara terbuka.
            </p>
          </div>

          {/* Quick Counter */}
          <div className="flex items-center gap-2 bg-white dark:bg-slate-800 px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 shadow-2xs self-start md:self-auto">
            <span className="text-xs text-slate-500 dark:text-slate-400">Menampilkan:</span>
            <span className="text-sm font-extrabold text-blue-600 dark:text-blue-400">
              {filteredPrograms.length}
            </span>
            <span className="text-xs text-slate-500 dark:text-slate-400">dari {workPrograms.length} Program</span>
          </div>
        </div>

        {/* Filter Controls Bar */}
        <div className="bg-white dark:bg-slate-800/90 rounded-2xl p-4 sm:p-5 border border-slate-200/80 dark:border-slate-700/80 shadow-md space-y-4">
          <div className="flex flex-col lg:flex-row gap-3 items-stretch lg:items-center justify-between">
            {/* Search Input */}
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Cari program kerja, kata kunci, indikator, atau PIC..."
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-900/70 border border-slate-200 dark:border-slate-700 text-sm text-slate-800 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Dropdown Filters & Grid/List Toggle */}
            <div className="flex flex-wrap sm:flex-nowrap items-center gap-2.5">
              {/* Month Filter */}
              <select
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(e.target.value)}
                className="px-3 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-900/70 border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-200 focus:outline-none focus:border-blue-500 cursor-pointer"
              >
                <option value="ALL">Semua Bulan</option>
                {months.map((m) => (
                  <option key={m} value={m}>
                    Bulan {m}
                  </option>
                ))}
              </select>

              {/* Status Filter */}
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="px-3 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-900/70 border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-200 focus:outline-none focus:border-blue-500 cursor-pointer"
              >
                <option value="ALL">Semua Status</option>
                <option value="Berjalan">Sedang Berjalan</option>
                <option value="Selesai">Selesai</option>
                <option value="Direncanakan">Direncanakan</option>
              </select>

              {/* Grid / List Layout Switcher */}
              <div className="flex items-center rounded-xl bg-slate-100 dark:bg-slate-900 p-1 border border-slate-200 dark:border-slate-700 shrink-0">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                    viewMode === 'grid'
                      ? 'bg-white dark:bg-slate-800 text-blue-600 dark:text-blue-400 shadow-2xs'
                      : 'text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
                  }`}
                  title="Tampilan Grid Kartu"
                >
                  <Grid className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                    viewMode === 'list'
                      ? 'bg-white dark:bg-slate-800 text-blue-600 dark:text-blue-400 shadow-2xs'
                      : 'text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
                  }`}
                  title="Tampilan Daftar / Tabel"
                >
                  <List className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Division Pill Filter */}
          <div className="pt-2 border-t border-slate-100 dark:border-slate-700/60 flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
            <button
              onClick={() => setSelectedDivision('ALL')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                selectedDivision === 'ALL'
                  ? 'bg-blue-600 text-white shadow-sm shadow-blue-500/25'
                  : 'bg-slate-100 dark:bg-slate-900/60 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
              }`}
            >
              Semua Divisi ({workPrograms.length})
            </button>
            {divisions.map((div) => {
              const count = workPrograms.filter((p) => p.divisionCode === div.code).length;
              return (
                <button
                  key={div.code}
                  onClick={() => setSelectedDivision(div.code)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer flex items-center gap-1.5 ${
                    selectedDivision === div.code
                      ? 'bg-blue-600 text-white shadow-sm shadow-blue-500/25'
                      : 'bg-slate-100 dark:bg-slate-900/60 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                  }`}
                >
                  <span>{div.name}</span>
                  <span
                    className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                      selectedDivision === div.code
                        ? 'bg-white/20 text-white'
                        : 'bg-slate-200 dark:bg-slate-800 text-slate-500'
                    }`}
                  >
                    {count}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Content: Grid or List View */}
        {filteredPrograms.length === 0 ? (
          <div className="bg-white dark:bg-slate-800 rounded-2xl p-12 text-center border border-slate-200 dark:border-slate-700 space-y-3">
            <Filter className="w-10 h-10 text-slate-300 mx-auto" />
            <h3 className="font-heading text-lg font-bold text-slate-800 dark:text-slate-100">
              Tidak Ada Program Kerja yang Sesuai
            </h3>
            <p className="text-sm text-slate-500 dark:text-slate-400 max-w-md mx-auto">
              Coba sesuaikan kata kunci pencarian atau ubah filter divisi, bulan, dan status kegiatan.
            </p>
            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedDivision('ALL');
                setSelectedMonth('ALL');
                setSelectedStatus('ALL');
              }}
              className="mt-2 px-4 py-2 bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 text-xs font-bold rounded-xl hover:bg-blue-100 transition-colors cursor-pointer"
            >
              Reset Semua Filter
            </button>
          </div>
        ) : viewMode === 'grid' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredPrograms.map((proker) => (
              <div
                key={proker.id}
                onClick={() => setSelectedProker(proker)}
                className="group bg-white dark:bg-slate-800/90 rounded-2xl p-5 border border-slate-200/80 dark:border-slate-700/80 hover:border-blue-400 dark:hover:border-blue-500/50 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-between cursor-pointer hover:-translate-y-1 relative"
              >
                <div>
                  {/* Top tags: Division & Status */}
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <span className="text-[11px] font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wide truncate max-w-[170px]">
                      {proker.divisionName}
                    </span>
                    {renderStatusBadge(proker.status)}
                  </div>

                  {/* Title */}
                  <h3 className="font-heading font-bold text-base text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors line-clamp-2">
                    {proker.title}
                  </h3>

                  {/* Description snippet */}
                  <p className="mt-2 text-xs text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed">
                    {proker.description}
                  </p>

                  {/* Progress bar */}
                  <div className="mt-4 space-y-1.5">
                    <div className="flex items-center justify-between text-xs font-medium">
                      <span className="text-slate-500 dark:text-slate-400">Progres Realisasi</span>
                      <span className="font-bold text-slate-800 dark:text-slate-200">
                        {proker.progress}%
                      </span>
                    </div>
                    <div className="w-full bg-slate-100 dark:bg-slate-700 rounded-full h-2 overflow-hidden">
                      <div
                        className={`h-2 rounded-full transition-all duration-500 ${
                          proker.status === 'Selesai'
                            ? 'bg-emerald-500'
                            : proker.status === 'Berjalan'
                            ? 'bg-gradient-to-r from-blue-600 to-amber-500'
                            : 'bg-blue-400'
                        }`}
                        style={{ width: `${proker.progress}%` }}
                      />
                    </div>
                  </div>
                </div>

                {/* Footer details: Date & PIC */}
                <div className="mt-5 pt-3.5 border-t border-slate-100 dark:border-slate-700/60 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400">
                    <Calendar className="w-3.5 h-3.5 text-blue-500" />
                    <span>{proker.month} 2026</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <img
                      src={proker.picAvatar}
                      alt={proker.picName}
                      className="w-5 h-5 rounded-full object-cover border border-slate-200 dark:border-slate-700"
                    />
                    <span className="font-medium text-slate-700 dark:text-slate-300 truncate max-w-[110px]">
                      {proker.picName}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          /* List / Table View */
          <div className="bg-white dark:bg-slate-800/90 rounded-2xl border border-slate-200/80 dark:border-slate-700/80 overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 dark:bg-slate-900/60 border-b border-slate-200/80 dark:border-slate-700 text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider">
                  <tr>
                    <th className="py-3.5 px-4">Program Kerja</th>
                    <th className="py-3.5 px-4">Divisi</th>
                    <th className="py-3.5 px-4">Bulan / Jadwal</th>
                    <th className="py-3.5 px-4">Status</th>
                    <th className="py-3.5 px-4">Progres</th>
                    <th className="py-3.5 px-4">PIC</th>
                    <th className="py-3.5 px-4 text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-700/60 text-slate-700 dark:text-slate-200">
                  {filteredPrograms.map((proker) => (
                    <tr
                      key={proker.id}
                      onClick={() => setSelectedProker(proker)}
                      className="hover:bg-blue-50/40 dark:hover:bg-slate-750 cursor-pointer transition-colors"
                    >
                      <td className="py-3.5 px-4 font-semibold text-slate-900 dark:text-white max-w-xs">
                        <p className="font-heading font-bold text-sm truncate">{proker.title}</p>
                        <p className="text-[11px] text-slate-400 line-clamp-1">{proker.description}</p>
                      </td>
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <span className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 font-medium text-[11px]">
                          {proker.divisionCode}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 whitespace-nowrap font-medium text-slate-600 dark:text-slate-300">
                        {proker.month} 2026
                      </td>
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        {renderStatusBadge(proker.status)}
                      </td>
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <div className="flex items-center gap-2 w-28">
                          <div className="flex-1 bg-slate-100 dark:bg-slate-700 rounded-full h-1.5 overflow-hidden">
                            <div
                              className="bg-blue-600 h-1.5 rounded-full"
                              style={{ width: `${proker.progress}%` }}
                            />
                          </div>
                          <span className="font-bold text-[11px]">{proker.progress}%</span>
                        </div>
                      </td>
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <img
                            src={proker.picAvatar}
                            alt={proker.picName}
                            className="w-5 h-5 rounded-full object-cover"
                          />
                          <span className="text-slate-700 dark:text-slate-300 font-medium">
                            {proker.picName}
                          </span>
                        </div>
                      </td>
                      <td className="py-3.5 px-4 text-right whitespace-nowrap">
                        <span className="inline-flex items-center gap-1 text-blue-600 dark:text-blue-400 font-bold hover:underline">
                          Detail
                          <ChevronRight className="w-3.5 h-3.5" />
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Proker Detail Modal */}
        {selectedProker && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-fadeIn">
            <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-2xl w-full border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden max-h-[90vh] flex flex-col animate-scaleUp">
              {/* Modal Header */}
              <div className="p-5 sm:p-6 border-b border-slate-100 dark:border-slate-800 flex items-start justify-between gap-4 bg-slate-50/70 dark:bg-slate-850">
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-xs font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wide">
                      {selectedProker.divisionName}
                    </span>
                    <span className="text-slate-300 dark:text-slate-700">•</span>
                    {renderStatusBadge(selectedProker.status)}
                  </div>
                  <h3 className="font-heading text-lg sm:text-xl font-extrabold text-slate-900 dark:text-white leading-snug">
                    {selectedProker.title}
                  </h3>
                </div>
                <button
                  onClick={() => setSelectedProker(null)}
                  className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Modal Body */}
              <div className="p-5 sm:p-6 overflow-y-auto space-y-6 text-sm text-slate-600 dark:text-slate-300">
                {/* Realisasi Progress Pill */}
                <div className="p-4 rounded-xl bg-blue-50/60 dark:bg-blue-950/40 border border-blue-100 dark:border-blue-900/50 space-y-2">
                  <div className="flex items-center justify-between text-xs font-bold text-blue-900 dark:text-blue-200">
                    <span>Realisasi Target Program</span>
                    <span>{selectedProker.progress}% Selesai</span>
                  </div>
                  <div className="w-full bg-blue-200/50 dark:bg-blue-900 rounded-full h-2.5 overflow-hidden">
                    <div
                      className="bg-gradient-to-r from-blue-600 to-amber-500 h-2.5 rounded-full"
                      style={{ width: `${selectedProker.progress}%` }}
                    />
                  </div>
                </div>

                {/* Deskripsi */}
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2 flex items-center gap-1.5">
                    <FileText className="w-3.5 h-3.5 text-blue-500" />
                    Deskripsi Program
                  </h4>
                  <p className="text-slate-700 dark:text-slate-300 leading-relaxed bg-slate-50 dark:bg-slate-800/40 p-3.5 rounded-xl border border-slate-100 dark:border-slate-800">
                    {selectedProker.description}
                  </p>
                </div>

                {/* Grid Info: Jadwal, Sasaran, Anggaran, PIC */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800/50 space-y-1">
                    <p className="text-[11px] font-semibold text-slate-400 flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-blue-500" />
                      Rentang Pelaksanaan
                    </p>
                    <p className="font-bold text-slate-800 dark:text-slate-100">
                      {selectedProker.startDate} s/d {selectedProker.endDate}
                    </p>
                  </div>

                  <div className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800/50 space-y-1">
                    <p className="text-[11px] font-semibold text-slate-400 flex items-center gap-1.5">
                      <Target className="w-3.5 h-3.5 text-emerald-500" />
                      Sasaran Partisipan
                    </p>
                    <p className="font-bold text-slate-800 dark:text-slate-100">
                      {selectedProker.targetAudience}
                    </p>
                  </div>

                  <div className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800/50 space-y-1">
                    <p className="text-[11px] font-semibold text-slate-400 flex items-center gap-1.5">
                      <DollarSign className="w-3.5 h-3.5 text-amber-500" />
                      Alokasi Anggaran Kegiatan
                    </p>
                    <p className="font-bold text-slate-800 dark:text-slate-100">
                      {selectedProker.budget}
                    </p>
                  </div>

                  <div className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800/50 space-y-1">
                    <p className="text-[11px] font-semibold text-slate-400 flex items-center gap-1.5">
                      <User className="w-3.5 h-3.5 text-purple-500" />
                      Penanggung Jawab (PIC)
                    </p>
                    <div className="flex items-center gap-2 pt-0.5">
                      <img
                        src={selectedProker.picAvatar}
                        alt={selectedProker.picName}
                        className="w-5 h-5 rounded-full object-cover"
                      />
                      <span className="font-bold text-slate-800 dark:text-slate-100">
                        {selectedProker.picName} ({selectedProker.picRole})
                      </span>
                    </div>
                  </div>
                </div>

                {/* Indikator Keberhasilan */}
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                    Indikator Keberhasilan Kegiatan
                  </h4>
                  <ul className="space-y-2">
                    {selectedProker.indicators.map((ind, idx) => (
                      <li
                        key={idx}
                        className="flex items-start gap-2.5 text-xs text-slate-700 dark:text-slate-300"
                      >
                        <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                        <span>{ind}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Target Output */}
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">
                    Hasil / Output Nyata:
                  </h4>
                  <p className="text-xs italic text-slate-600 dark:text-slate-400">
                    "{selectedProker.outputs}"
                  </p>
                </div>
              </div>

              {/* Modal Footer */}
              <div className="p-4 sm:p-5 border-t border-slate-100 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-850 flex items-center justify-between">
                <button
                  onClick={handleCopyLink}
                  className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors cursor-pointer"
                >
                  {copiedLink ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-500" />
                      <span>Tersalin!</span>
                    </>
                  ) : (
                    <>
                      <Share2 className="w-3.5 h-3.5" />
                      <span>Salin Tautan Proker</span>
                    </>
                  )}
                </button>

                <button
                  onClick={() => setSelectedProker(null)}
                  className="px-5 py-2 rounded-xl text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white transition-colors cursor-pointer"
                >
                  Tutup
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
};

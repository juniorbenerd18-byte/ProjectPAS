import React, { useState } from 'react';
import { Plus, Calendar, Clock, MapPin, QrCode, FileText, ToggleLeft, ToggleRight } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { Meeting } from '../../types';
import { formatDateIndo } from '../../lib/utils';
import { Modal } from '../../components/common/Modal';

export const JadwalRapat: React.FC = () => {
  const { meetings, addMeeting, updateMeeting, setActivePage } = useApp();
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    meetingDate: new Date().toISOString().split('T')[0],
    startTime: '14:00',
    endTime: '16:00',
    location: 'Ruang Rapat OSIS',
    type: 'koordinasi' as Meeting['type'],
    qrToken: `MEET-${Date.now()}`,
    isAttendanceOpen: true,
    notulen: '',
    decisions: [] as string[],
  });

  const handleCreateMeeting = (e: React.FormEvent) => {
    e.preventDefault();
    addMeeting({
      ...formData,
      qrToken: `MEET-${formData.title.substring(0, 8).toUpperCase()}-${Date.now().toString().slice(-4)}`,
    });
    setIsModalOpen(false);
  };

  const toggleAttendance = (id: string, currentStatus: boolean) => {
    updateMeeting(id, { isAttendanceOpen: !currentStatus });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-5 rounded-2xl border border-slate-200/80 shadow-2xs">
        <div>
          <h2 className="text-base font-bold text-slate-900">Jadwal Rapat & Musyawarah OSIS</h2>
          <p className="text-xs text-slate-500">
            Agenda rapat koordinasi pengurus, rapat pleno BPH, dan musyawarah perwakilan kelas
          </p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold shadow-sm flex items-center gap-1.5 cursor-pointer self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Jadwalkan Rapat Baru</span>
        </button>
      </div>

      {/* Meetings List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {meetings.map((meet) => (
          <div
            key={meet.id}
            className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-2xs space-y-4 hover:border-indigo-300 transition-all flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-full uppercase">
                  Rapat {meet.type}
                </span>
                <button
                  onClick={() => toggleAttendance(meet.id, meet.isAttendanceOpen)}
                  className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold transition-colors cursor-pointer ${
                    meet.isAttendanceOpen
                      ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                      : 'bg-slate-100 text-slate-500 border border-slate-200'
                  }`}
                  title="Klik untuk membuka/menutup presensi"
                >
                  <span
                    className={`w-1.5 h-1.5 rounded-full ${
                      meet.isAttendanceOpen ? 'bg-emerald-500 animate-pulse' : 'bg-slate-400'
                    }`}
                  />
                  <span>{meet.isAttendanceOpen ? 'Absensi Aktif' : 'Absensi Ditutup'}</span>
                </button>
              </div>

              <h3 className="text-sm font-bold text-slate-900 leading-snug">{meet.title}</h3>
              <p className="text-xs text-slate-600 mt-1 leading-relaxed line-clamp-2">
                {meet.description}
              </p>

              <div className="space-y-1.5 mt-3 pt-3 border-t border-slate-100 text-xs text-slate-500">
                <p className="flex items-center gap-2">
                  <Calendar className="w-3.5 h-3.5 text-slate-400" />
                  <strong className="text-slate-700">{formatDateIndo(meet.meetingDate)}</strong>
                </p>
                <p className="flex items-center gap-2">
                  <Clock className="w-3.5 h-3.5 text-slate-400" />
                  <span>{meet.startTime} - {meet.endTime} WIB</span>
                </p>
                <p className="flex items-center gap-2">
                  <MapPin className="w-3.5 h-3.5 text-slate-400" />
                  <span>{meet.location}</span>
                </p>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
              <button
                onClick={() => setActivePage('rapat-notulen')}
                className="text-xs font-bold text-slate-600 hover:text-slate-900 flex items-center gap-1 cursor-pointer"
              >
                <FileText className="w-3.5 h-3.5" />
                <span>Notulensi</span>
              </button>
              <button
                onClick={() => setActivePage('rapat-absensi')}
                className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 shadow-xs cursor-pointer"
              >
                <QrCode className="w-3.5 h-3.5" />
                <span>Absensi QR</span>
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Modal Add Meeting */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Jadwalkan Rapat OSIS Baru"
        subtitle="Rapat koordinasi internal organisasi"
      >
        <form onSubmit={handleCreateMeeting} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">Judul / Agenda Rapat</label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="Contoh: Rapat Koordinasi Panitia Classmeeting"
              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-indigo-500"
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">Jenis Rapat</label>
              <select
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value as any })}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-indigo-500"
              >
                <option value="koordinasi">Rapat Koordinasi</option>
                <option value="pleno">Rapat Pleno BPH</option>
                <option value="evaluasi">Rapat Evaluasi</option>
                <option value="rutin">Rapat Rutin Mingguan</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">Tanggal</label>
              <input
                type="date"
                value={formData.meetingDate}
                onChange={(e) => setFormData({ ...formData, meetingDate: e.target.value })}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-indigo-500"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">Waktu Mulai</label>
              <input
                type="time"
                value={formData.startTime}
                onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-indigo-500"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">Waktu Selesai</label>
              <input
                type="time"
                value={formData.endTime}
                onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-indigo-500"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">Lokasi / Ruangan</label>
            <input
              type="text"
              value={formData.location}
              onChange={(e) => setFormData({ ...formData, location: e.target.value })}
              placeholder="Ruang OSIS / Lab Komputer"
              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-indigo-500"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">Keterangan / Agenda</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={3}
              placeholder="Agenda pembahasan rapat..."
              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-indigo-500"
              required
            />
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="px-4 py-2 bg-slate-100 text-slate-600 text-xs font-semibold rounded-xl cursor-pointer"
            >
              Batal
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-indigo-600 text-white text-xs font-bold rounded-xl hover:bg-indigo-500 cursor-pointer"
            >
              Jadwalkan Rapat
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

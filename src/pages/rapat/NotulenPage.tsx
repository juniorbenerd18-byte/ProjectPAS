import React, { useState } from 'react';
import { FileText, Save, Plus, Trash2, Printer, CheckCircle2 } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { formatDateIndo } from '../../lib/utils';

export const NotulenPage: React.FC = () => {
  const { meetings, updateMeeting, showToast } = useApp();
  const [selectedMeetingId, setSelectedMeetingId] = useState<string>(meetings[0]?.id || '');

  const meeting = meetings.find((m) => m.id === selectedMeetingId) || meetings[0];
  const [notulenText, setNotulenText] = useState(meeting?.notulen || '');
  const [decisions, setDecisions] = useState<string[]>(meeting?.decisions || []);
  const [newDecision, setNewDecision] = useState('');

  // Update local state when selected meeting changes
  React.useEffect(() => {
    if (meeting) {
      setNotulenText(meeting.notulen || '');
      setDecisions(meeting.decisions || []);
    }
  }, [meeting]);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (meeting) {
      updateMeeting(meeting.id, {
        notulen: notulenText,
        decisions: decisions,
      });
      showToast('Notulensi rapat berhasil disimpan!');
    }
  };

  const handleAddDecision = () => {
    if (newDecision.trim()) {
      setDecisions([...decisions, newDecision.trim()]);
      setNewDecision('');
    }
  };

  const handleRemoveDecision = (index: number) => {
    setDecisions(decisions.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="no-print flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-5 rounded-2xl border border-slate-200/80 shadow-2xs">
        <div>
          <h2 className="text-base font-bold text-slate-900">Notulensi & Keputusan Rapat</h2>
          <p className="text-xs text-slate-500">
            Pencatatan hasil musyawarah, butir keputusan mufakat, dan arsip risalah rapat
          </p>
        </div>
        <div className="flex items-center gap-2">
          <select
            value={selectedMeetingId}
            onChange={(e) => setSelectedMeetingId(e.target.value)}
            className="px-3 py-2 bg-slate-50 border border-slate-200/80 rounded-xl text-xs font-semibold text-slate-800 outline-none"
          >
            {meetings.map((m) => (
              <option key={m.id} value={m.id}>
                {m.title}
              </option>
            ))}
          </select>
          <button
            onClick={() => window.print()}
            className="p-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer"
            title="Cetak Notulen"
          >
            <Printer className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Editor & Content */}
      <form onSubmit={handleSave} className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-2xs space-y-6">
        {/* Meeting Details Bar */}
        <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div>
            <span className="text-[10px] font-bold text-indigo-700 uppercase bg-indigo-50 px-2 py-0.5 rounded">
              {meeting.type}
            </span>
            <h3 className="text-sm font-bold text-slate-900 mt-1">{meeting.title}</h3>
          </div>
          <div className="text-slate-500 space-y-0.5 text-right">
            <p className="font-semibold text-slate-700">{formatDateIndo(meeting.meetingDate)}</p>
            <p>{meeting.startTime} - {meeting.endTime} WIB • {meeting.location}</p>
          </div>
        </div>

        {/* Notulen Textarea */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1.5 uppercase tracking-wider">
            Risalah Jalannya Rapat (Notulen)
          </label>
          <textarea
            value={notulenText}
            onChange={(e) => setNotulenText(e.target.value)}
            rows={8}
            placeholder="Tuliskan poin-poin pembahasan rapat secara rinci di sini..."
            className="w-full p-4 text-xs sm:text-sm rounded-xl border border-slate-200 focus:outline-indigo-500 font-sans leading-relaxed"
            required
          />
        </div>

        {/* Decisions Section */}
        <div className="space-y-3 pt-3 border-t border-slate-100">
          <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider">
            Poin Keputusan / Hasil Mufakat
          </label>
          
          <div className="space-y-2">
            {decisions.map((dec, idx) => (
              <div key={idx} className="flex items-center gap-2 p-2 rounded-xl bg-slate-50 border border-slate-100">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span className="flex-1 text-xs text-slate-800 font-medium">{dec}</span>
                <button
                  type="button"
                  onClick={() => handleRemoveDecision(idx)}
                  className="p-1 text-rose-500 hover:bg-rose-50 rounded-lg cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>

          <div className="flex gap-2">
            <input
              type="text"
              value={newDecision}
              onChange={(e) => setNewDecision(e.target.value)}
              placeholder="Ketik butir keputusan baru..."
              className="flex-1 px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-indigo-500"
            />
            <button
              type="button"
              onClick={handleAddDecision}
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl flex items-center gap-1 cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" /> Tambah Poin
            </button>
          </div>
        </div>

        <div className="no-print flex justify-end pt-4 border-t border-slate-100">
          <button
            type="submit"
            className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold shadow-sm flex items-center gap-2 cursor-pointer"
          >
            <Save className="w-4 h-4" />
            <span>Simpan Notulensi Rapat</span>
          </button>
        </div>
      </form>
    </div>
  );
};

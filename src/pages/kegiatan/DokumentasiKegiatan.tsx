import React, { useState } from 'react';
import { Camera, Plus, Image as ImageIcon, X, Calendar, MapPin } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { ImagePicker } from '../../components/common/ImagePicker';
import { Modal } from '../../components/common/Modal';

export const DokumentasiKegiatan: React.FC = () => {
  const { events, addEventPhoto } = useApp();
  const [selectedEventId, setSelectedEventId] = useState<string>(events[0]?.id || '');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newPhotoUrl, setNewPhotoUrl] = useState('');
  const [lightboxPhoto, setLightboxPhoto] = useState<string | null>(null);

  const handleUploadPhoto = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedEventId && newPhotoUrl) {
      addEventPhoto(selectedEventId, newPhotoUrl);
      setNewPhotoUrl('');
      setIsModalOpen(false);
    }
  };

  const allPhotos = events.flatMap((evt) =>
    evt.documentationPhotos.map((photo, index) => ({
      id: `${evt.id}-${index}`,
      url: photo,
      eventTitle: evt.title,
      eventDate: evt.eventDate,
      location: evt.location,
    }))
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-5 rounded-2xl border border-slate-200/80 shadow-2xs">
        <div>
          <h2 className="text-base font-bold text-slate-900">Galeri Dokumentasi Foto Kegiatan</h2>
          <p className="text-xs text-slate-500">
            Arsip visual foto-foto pelaksanaan acara & kegiatan lapangan OSIS SMK
          </p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold shadow-sm flex items-center gap-1.5 cursor-pointer self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Upload Foto dari Komputer</span>
        </button>
      </div>

      {/* Photo Gallery Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {allPhotos.map((item) => (
          <div
            key={item.id}
            onClick={() => setLightboxPhoto(item.url)}
            className="group relative bg-white rounded-2xl overflow-hidden border border-slate-200/80 shadow-2xs cursor-pointer aspect-4/3"
          >
            <img
              src={item.url}
              alt={item.eventTitle}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
            {/* Overlay on hover */}
            <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 via-slate-900/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity p-4 flex flex-col justify-end text-white">
              <span className="text-[10px] font-bold text-indigo-300 uppercase tracking-wider">
                {item.eventDate}
              </span>
              <p className="text-xs font-bold leading-tight mt-0.5 line-clamp-2">
                {item.eventTitle}
              </p>
              <p className="text-[10px] text-slate-300 mt-1 flex items-center gap-1">
                <MapPin className="w-3 h-3" />
                <span>{item.location}</span>
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Modal Upload Photo (Local File Picker) */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Upload Foto Dokumentasi dari Komputer"
        subtitle="Pilih foto dokumentasi dari penyimpanan lokal perangkat Anda"
      >
        <form onSubmit={handleUploadPhoto} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">
              Pilih Kegiatan Terkait
            </label>
            <select
              value={selectedEventId}
              onChange={(e) => setSelectedEventId(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-indigo-500"
            >
              {events.map((e) => (
                <option key={e.id} value={e.id}>
                  {e.title} ({e.eventDate})
                </option>
              ))}
            </select>
          </div>

          {/* Local File Image Picker */}
          <ImagePicker
            label="Pilih Foto Berkas Lokal (Komputer / HP)"
            value={newPhotoUrl}
            onChange={(url) => setNewPhotoUrl(url)}
            helperText="Pilih foto dokumentasi format JPG, PNG, atau WebP dari komputer Anda"
            aspectRatio="video"
          />

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
              disabled={!newPhotoUrl}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white text-xs font-bold rounded-xl shadow-xs cursor-pointer"
            >
              Simpan Foto Dokumentasi
            </button>
          </div>
        </form>
      </Modal>

      {/* Lightbox Modal */}
      {lightboxPhoto && (
        <div
          className="fixed inset-0 z-50 bg-slate-950/90 backdrop-blur-sm flex items-center justify-center p-4 cursor-pointer"
          onClick={() => setLightboxPhoto(null)}
        >
          <button
            onClick={() => setLightboxPhoto(null)}
            className="absolute top-5 right-5 p-2 rounded-full bg-white/10 text-white hover:bg-white/20"
          >
            <X className="w-6 h-6" />
          </button>
          <img
            src={lightboxPhoto}
            alt="Preview"
            className="max-h-[85vh] max-w-[90vw] object-contain rounded-2xl shadow-2xl"
          />
        </div>
      )}
    </div>
  );
};

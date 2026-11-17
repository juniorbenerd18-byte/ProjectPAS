import React, { useState } from 'react';
import { Camera, Plus, Image as ImageIcon, X, Calendar, MapPin, Trash2 } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { ImagePicker } from '../../components/common/ImagePicker';
import { Modal } from '../../components/common/Modal';

export const DokumentasiKegiatan: React.FC = () => {
  const { events, addEventPhoto, removeEventPhoto, currentRole } = useApp();
  const [selectedEventId, setSelectedEventId] = useState<string>(events[0]?.id || '');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newPhotoUrl, setNewPhotoUrl] = useState('');
  const [lightboxPhoto, setLightboxPhoto] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<{ eventId: string; index: number; title: string } | null>(null);

  // Hanya ketua, admin, pembina, sekretaris yang bisa hapus foto dokumentasi
  const canDelete =
    currentRole === 'admin' ||
    currentRole === 'ketua' ||
    currentRole === 'pembina' ||
    currentRole === 'sekretaris';

  const canUpload = canDelete;

  const handleUploadPhoto = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPhotoUrl) return;
    const targetId = selectedEventId || events[0]?.id;
    if (targetId) {
      addEventPhoto(targetId, newPhotoUrl);
      setNewPhotoUrl('');
      setIsModalOpen(false);
    }
  };

  const handleDeletePhoto = () => {
    if (confirmDelete) {
      removeEventPhoto(confirmDelete.eventId, confirmDelete.index);
      setConfirmDelete(null);
    }
  };

  // Flatten semua foto dari semua kegiatan beserta info kegiatan & index asli
  const allPhotos = events.flatMap((evt) =>
    (evt.documentationPhotos || []).map((photo, index) => ({
      id: `${evt.id}-${index}`,
      url: photo,
      eventId: evt.id,
      photoIndex: index,
      eventTitle: evt.title,
      eventDate: evt.eventDate,
      location: evt.location,
    }))
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white dark:bg-[#17293E] p-5 rounded-2xl border border-slate-200/80 dark:border-[#283D56] shadow-2xs">
        <div>
          <h2 className="text-base font-bold text-slate-900 dark:text-[#FAF6EE]">Galeri Dokumentasi Foto Kegiatan</h2>
          <p className="text-xs text-slate-500 dark:text-[#9AA8B8]">
            Arsip visual foto-foto pelaksanaan acara & kegiatan lapangan OSIS SMK
            {' '}({allPhotos.length} foto)
          </p>
        </div>
        {canUpload && (
          <button
            onClick={() => setIsModalOpen(true)}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold shadow-sm flex items-center gap-1.5 cursor-pointer self-start sm:self-auto"
          >
            <Plus className="w-4 h-4" />
            <span>Upload Foto dari Komputer</span>
          </button>
        )}
      </div>

      {/* Photo Gallery Grid */}
      {allPhotos.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <div className="w-16 h-16 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center mb-4">
            <ImageIcon className="w-8 h-8 text-slate-400" />
          </div>
          <p className="text-sm font-bold text-slate-600 dark:text-slate-300">Belum ada foto dokumentasi</p>
          <p className="text-xs text-slate-400 mt-1">Upload foto pertama untuk memulai galeri</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {allPhotos.map((item) => (
            <div
              key={item.id}
              className="group relative bg-white dark:bg-[#17293E] rounded-2xl overflow-hidden border border-slate-200/80 dark:border-[#283D56] shadow-2xs aspect-4/3"
            >
              <img
                src={item.url}
                alt={item.eventTitle}
                onClick={() => setLightboxPhoto(item.url)}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300 cursor-pointer"
              />

              {/* Overlay on hover */}
              <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 via-slate-900/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity p-3 flex flex-col justify-end text-white pointer-events-none">
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

              {/* Tombol hapus — hanya untuk role yang berwenang */}
              {canDelete && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setConfirmDelete({
                      eventId: item.eventId,
                      index: item.photoIndex,
                      title: item.eventTitle,
                    });
                  }}
                  className="absolute top-2 right-2 p-1.5 bg-red-600/90 hover:bg-red-600 text-white rounded-lg opacity-100 transition-opacity cursor-pointer shadow-md z-10"
                  title="Hapus foto ini"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Modal Upload Photo (Local File Picker) */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Upload Foto Dokumentasi dari Komputer"
        subtitle="Pilih foto dokumentasi dari penyimpanan lokal perangkat Anda"
      >
        <form onSubmit={handleUploadPhoto} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">
              Pilih Kegiatan Terkait
            </label>
            <select
              value={selectedEventId}
              onChange={(e) => setSelectedEventId(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-[#283D56] dark:bg-[#17293E] dark:text-[#FAF6EE] focus:outline-indigo-500"
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
            storageFolder="documentation"
          />

          <div className="flex justify-end gap-2 pt-2 border-t border-slate-100 dark:border-[#283D56]">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="px-4 py-2 bg-slate-100 dark:bg-[#213B5C] text-slate-600 dark:text-[#FAF6EE] text-xs font-semibold rounded-xl cursor-pointer"
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

      {/* Modal Konfirmasi Hapus Foto */}
      <Modal
        isOpen={!!confirmDelete}
        onClose={() => setConfirmDelete(null)}
        title="Hapus Foto Dokumentasi?"
        subtitle={confirmDelete ? `Foto dari kegiatan "${confirmDelete.title}"` : ''}
      >
        <div className="space-y-4">
          <p className="text-sm text-slate-600 dark:text-[#9AA8B8]">
            Foto ini akan dihapus permanen dari galeri dan tidak bisa dikembalikan.
          </p>
          <div className="flex justify-end gap-3 pt-2 border-t border-slate-100 dark:border-[#283D56]">
            <button
              type="button"
              onClick={() => setConfirmDelete(null)}
              className="px-4 py-2 bg-slate-100 dark:bg-[#213B5C] text-slate-600 dark:text-[#FAF6EE] text-xs font-semibold rounded-xl cursor-pointer"
            >
              Batal
            </button>
            <button
              type="button"
              onClick={handleDeletePhoto}
              className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-xs font-bold rounded-xl cursor-pointer flex items-center gap-1.5"
            >
              <Trash2 className="w-3.5 h-3.5" />
              Ya, Hapus Foto
            </button>
          </div>
        </div>
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
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}
    </div>
  );
};

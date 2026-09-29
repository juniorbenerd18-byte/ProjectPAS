import React, { useRef } from 'react';
import { Upload, Image as ImageIcon, X } from 'lucide-react';
import { readLocalImageAsDataUrl } from '../../lib/supabase';

interface ImagePickerProps {
  label?: string;
  value?: string;
  onChange: (dataUrl: string) => void;
  helperText?: string;
  aspectRatio?: 'square' | 'video' | 'card';
  className?: string;
}

export const ImagePicker: React.FC<ImagePickerProps> = ({
  label = 'Pilih Foto dari Komputer',
  value,
  onChange,
  helperText = 'Format: JPG, PNG, WebP (maks. 5MB)',
  aspectRatio = 'square',
  className = '',
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        const dataUrl = await readLocalImageAsDataUrl(file);
        onChange(dataUrl);
      } catch (err) {
        console.error('Failed to read image file:', err);
      }
    }
  };

  const aspectClass =
    aspectRatio === 'video'
      ? 'aspect-video'
      : aspectRatio === 'card'
      ? 'aspect-[3/4]'
      : 'aspect-square';

  return (
    <div className={`space-y-1.5 ${className}`}>
      {label && <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600">{label}</label>}
      
      {value ? (
        <div className="relative group w-full rounded-xl overflow-hidden border border-slate-200 bg-slate-100 shadow-sm">
          <img
            src={value}
            alt="Preview"
            className={`w-full object-cover ${aspectClass}`}
          />
          <div className="absolute inset-0 bg-slate-900/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="px-3 py-1.5 bg-white text-slate-800 text-xs font-medium rounded-lg shadow hover:bg-slate-50 transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <Upload className="w-3.5 h-3.5" />
              Ganti Foto
            </button>
            <button
              type="button"
              onClick={() => onChange('')}
              className="p-1.5 bg-rose-600 text-white rounded-lg shadow hover:bg-rose-700 transition-colors cursor-pointer"
              title="Hapus foto"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      ) : (
        <div
          onClick={() => fileInputRef.current?.click()}
          className={`w-full border-2 border-dashed border-slate-300 hover:border-indigo-500 hover:bg-indigo-50/30 transition-all rounded-xl p-4 flex flex-col items-center justify-center text-center cursor-pointer ${aspectClass}`}
        >
          <div className="w-10 h-10 rounded-full bg-slate-100 text-slate-500 flex items-center justify-center mb-2 group-hover:bg-indigo-100 group-hover:text-indigo-600 transition-colors">
            <ImageIcon className="w-5 h-5" />
          </div>
          <p className="text-xs font-semibold text-slate-700">Pilih Berkas Lokal</p>
          <p className="text-[11px] text-slate-400 mt-0.5">Klik untuk browse file di komputer</p>
        </div>
      )}

      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/gif"
        onChange={handleFileChange}
        className="hidden"
      />
      {helperText && <p className="text-[11px] text-slate-400">{helperText}</p>}
    </div>
  );
};

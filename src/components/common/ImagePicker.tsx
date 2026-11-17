import React, { useRef, useState } from 'react';
import { Upload, Image as ImageIcon, X, Loader2 } from 'lucide-react';
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
  helperText = 'Format: JPG, PNG, WebP (otomatis dioptimasi)',
  aspectRatio = 'square',
  className = '',
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorNotice, setErrorNotice] = useState<string | null>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setIsProcessing(true);
      setErrorNotice(null);
      try {
        const dataUrl = await readLocalImageAsDataUrl(file);
        onChange(dataUrl);
      } catch (err) {
        console.error('Failed to read image file:', err);
        setErrorNotice('Gagal membaca gambar. Pastikan format file sesuai.');
      } finally {
        setIsProcessing(false);
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
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
      {label && (
        <label className="block text-[13px] font-bold text-[#1F3A5F] dark:text-[#FAF6EE]">
          {label}
        </label>
      )}

      {isProcessing ? (
        <div
          className={`w-full border-2 border-dashed border-[#1F3A5F]/30 dark:border-[#283D56] bg-[#FAF6EE]/50 dark:bg-[#17293E]/50 rounded-xl p-4 flex flex-col items-center justify-center text-center ${aspectClass}`}
        >
          <Loader2 className="w-8 h-8 text-[#1F3A5F] dark:text-[#F2B544] animate-spin mb-2" />
          <p className="text-[13px] font-bold text-[#1F3A5F] dark:text-[#FAF6EE]">Mengoptimasi Gambar...</p>
          <p className="text-[11px] text-[#5A6472] dark:text-[#9AA8B8] mt-0.5">Memproses kompresi otomatis agar ringan</p>
        </div>
      ) : value ? (
        <div className="relative group w-full rounded-xl overflow-hidden border border-[#E6DFD0] dark:border-[#283D56] bg-slate-100 dark:bg-[#17293E] shadow-xs">
          <img
            src={value}
            alt="Preview"
            className={`w-full object-cover ${aspectClass}`}
          />
          <div className="absolute inset-0 bg-[#0E1B2C]/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="px-3 py-1.5 bg-white text-[#1F3A5F] text-xs font-bold rounded-lg shadow-sm hover:bg-slate-50 transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <Upload className="w-3.5 h-3.5" />
              Ganti Foto
            </button>
            <button
              type="button"
              onClick={() => onChange('')}
              className="p-1.5 bg-red-600 text-white rounded-lg shadow-sm hover:bg-red-700 transition-colors cursor-pointer"
              title="Hapus foto"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      ) : (
        <div
          onClick={() => fileInputRef.current?.click()}
          className={`w-full border-2 border-dashed border-[#E6DFD0] dark:border-[#283D56] hover:border-[#1F3A5F] dark:hover:border-[#F2B544] hover:bg-[#FAF6EE] dark:hover:bg-[#17293E] transition-all rounded-xl p-4 flex flex-col items-center justify-center text-center cursor-pointer ${aspectClass}`}
        >
          <div className="w-10 h-10 rounded-full bg-[#E4EAF2] dark:bg-[#1F3A5F]/40 text-[#1F3A5F] dark:text-[#FAF6EE] flex items-center justify-center mb-2 transition-colors">
            <ImageIcon className="w-5 h-5" />
          </div>
          <p className="text-xs font-bold text-[#1F3A5F] dark:text-[#FAF6EE]">Pilih Berkas Lokal</p>
          <p className="text-[11px] text-[#5A6472] dark:text-[#9AA8B8] mt-0.5">Klik untuk browse file di komputer / HP</p>
        </div>
      )}

      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/gif"
        onChange={handleFileChange}
        className="hidden"
      />
      {errorNotice && <p className="text-[11px] text-red-500 font-medium">{errorNotice}</p>}
      {helperText && !errorNotice && (
        <p className="text-[11px] text-[#5A6472] dark:text-[#9AA8B8]">{helperText}</p>
      )}
    </div>
  );
};

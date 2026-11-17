import { createClient } from '@supabase/supabase-js';

const supabaseUrl =
  import.meta.env.VITE_SUPABASE_URL || 'https://bhsonotbelgsxatglxce.supabase.co';
const supabaseAnonKey =
  import.meta.env.VITE_SUPABASE_ANON_KEY || 'sb_publishable_D6h6k9rOQPSocIlpcbjpNA_9oRB4oyD';

export const isSupabaseConfigured = () => {
  const validUrl = Boolean(supabaseUrl && supabaseUrl !== 'https://placeholder.supabase.co' && !supabaseUrl.includes('abcdefghijkl'));
  const validKey = Boolean(supabaseAnonKey && supabaseAnonKey !== '');
  return validUrl && validKey;
};

export const supabase = isSupabaseConfigured()
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

/**
 * Compress and downscale images so they fit safely within browser storage
 * limits and render instantly without blank-screen crashes or DOMExceptions.
 */
export const compressImage = (
  dataUrl: string,
  maxWidth = 1280,
  maxHeight = 1280,
  quality = 0.78
): Promise<string> => {
  return new Promise((resolve) => {
    if (typeof window === 'undefined' || !dataUrl.startsWith('data:image/')) {
      resolve(dataUrl);
      return;
    }

    if (dataUrl.startsWith('data:image/svg+xml') || dataUrl.startsWith('data:image/gif')) {
      resolve(dataUrl);
      return;
    }

    const img = new Image();
    img.onload = () => {
      try {
        let { width, height } = img;
        if (width <= 0 || height <= 0) {
          resolve(dataUrl);
          return;
        }

        if (width > maxWidth || height > maxHeight) {
          if (width / height > maxWidth / maxHeight) {
            height = Math.round((height * maxWidth) / width);
            width = maxWidth;
          } else {
            width = Math.round((width * maxHeight) / height);
            maxHeight = height;
          }
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          resolve(dataUrl);
          return;
        }

        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';
        ctx.drawImage(img, 0, 0, width, height);

        const compressed = canvas.toDataURL('image/jpeg', quality);
        resolve(compressed);
      } catch (e) {
        console.warn('Image compression fallback:', e);
        resolve(dataUrl);
      }
    };
    img.onerror = () => {
      resolve(dataUrl);
    };
    img.src = dataUrl;
  });
};

/**
 * Utility to read image files chosen from local device/computer and convert to optimized Base64
 * Ensures "ketika ingin menambah foto bisa dipilih lewat local" works seamlessly
 * both in local demo mode and online mode without quota crashes or blank screens.
 */
export const readLocalImageAsDataUrl = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    if (!file) {
      reject(new Error('No file provided'));
      return;
    }
    const reader = new FileReader();
    reader.onload = async () => {
      try {
        const rawDataUrl = reader.result as string;
        const optimized = await compressImage(rawDataUrl, 1280, 1280, 0.78);
        resolve(optimized);
      } catch (err) {
        console.warn('Compression notice, returning original dataUrl:', err);
        resolve(reader.result as string);
      }
    };
    reader.onerror = (error) => {
      reject(error);
    };
    reader.readAsDataURL(file);
  });
};

/**
 * Compress image aggressively for cloud storage.
 * Target: < 200KB (suitable for Supabase text column).
 * Used when uploading images that need to sync across devices.
 */
export const compressImageForCloud = async (dataUrl: string): Promise<string> => {
  if (!dataUrl.startsWith('data:image/')) return dataUrl;

  // Try progressively lower quality until size is acceptable
  const TARGET_SIZE = 200 * 1024; // 200KB in bytes
  const qualities = [0.65, 0.5, 0.35, 0.2];
  const maxDim = 800;

  for (const q of qualities) {
    const compressed = await compressImage(dataUrl, maxDim, maxDim, q);
    // Estimate byte size: base64 is ~4/3 of binary size
    const byteSize = (compressed.length * 3) / 4;
    if (byteSize <= TARGET_SIZE) return compressed;
  }

  // Last resort: very small thumbnail
  return compressImage(dataUrl, 400, 400, 0.15);
};

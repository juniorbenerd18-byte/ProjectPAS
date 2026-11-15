import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import QRCode from 'qrcode';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatNumber(amount: number): string {
  if (isNaN(amount) || amount === null || amount === undefined) return '0';
  return Math.round(amount).toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');
}

export function parseFormattedNumber(value: string): number {
  const clean = value.replace(/\./g, '').replace(/[^0-9]/g, '');
  return clean ? parseInt(clean, 10) : 0;
}

export function formatRupiah(amount: number): string {
  return `Rp ${formatNumber(amount)}`;
}


export function formatDateIndo(dateString: string): string {
  if (!dateString) return '-';
  try {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    }).format(date);
  } catch {
    return dateString;
  }
}

export function formatDateTimeIndo(dateTimeString: string): string {
  if (!dateTimeString) return '-';
  try {
    const date = new Date(dateTimeString);
    return new Intl.DateTimeFormat('id-ID', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  } catch {
    return dateTimeString;
  }
}

export async function generateQRCode(text: string): Promise<string> {
  try {
    return await QRCode.toDataURL(text, {
      width: 256,
      margin: 2,
      color: {
        dark: '#0f172a',
        light: '#ffffff',
      },
    });
  } catch (err) {
    console.error('Error generating QR code', err);
    return '';
  }
}

export function formatAttendanceTime(timeStr?: string): string {
  if (!timeStr) return '-';
  const trimmed = String(timeStr).trim();
  if (trimmed.endsWith('WIB')) return trimmed;

  // Handle 'YYYY-MM-DD HH:mm' or 'YYYY-MM-DDTHH:mm:ss'
  const dateSplit = trimmed.split(/[ T]/);
  if (dateSplit.length > 1) {
    const timePart = dateSplit[1];
    const [h, m] = timePart.split(/[:.]/);
    if (h !== undefined && m !== undefined) {
      return `${h.padStart(2, '0')}:${m.padStart(2, '0')} WIB`;
    }
  }

  // Handle '18.42', '9.03', '09:03', '14:25'
  const timeMatch = trimmed.match(/^(\d{1,2})[:.](\d{2})/);
  if (timeMatch) {
    const [, h, m] = timeMatch;
    return `${h.padStart(2, '0')}:${m.padStart(2, '0')} WIB`;
  }

  const parsed = new Date(trimmed);
  if (!isNaN(parsed.getTime())) {
    const h = parsed.getHours().toString().padStart(2, '0');
    const m = parsed.getMinutes().toString().padStart(2, '0');
    return `${h}:${m} WIB`;
  }

  return trimmed;
}

export function normalizeMajor(major?: string): string {
  if (!major) return '-';
  const trimmed = major.trim();
  const map: Record<string, string> = {
    RPL: 'Rekayasa Perangkat Lunak',
    TKJ: 'Teknik Komputer & Jaringan',
    AKL: 'Akuntansi & Keuangan Lembaga',
    DKV: 'Desain Komunikasi Visual',
    TKRO: 'Teknik Kendaraan Ringan Otomotif',
    TKR: 'Teknik Kendaraan Ringan Otomotif',
    MPLB: 'Manajemen Perkantoran & Layanan Bisnis',
    BD: 'Bisnis Digital',
  };
  return map[trimmed.toUpperCase()] || trimmed;
}


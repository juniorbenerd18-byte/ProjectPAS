import { EventRegistration } from '../types';
import { generateQRCode } from './utils';

export interface TicketPrintData {
  ticket: EventRegistration;
  eventDetails?: {
    date: string;
    time?: string;
    location: string;
  };
  orgName?: string;
  schoolName?: string;
  qrCodeUrl?: string;
}

/**
 * Mencetak tiket secara langsung tanpa bug 10 halaman & tanpa halaman kosong.
 * Mengisolasi cetakan hanya pada elemen tiket menggunakan kelas `printing-ticket-mode`
 * sehingga seluruh sisa halaman web diberi `display: none` saat print.
 */
export async function printTicketDirectly(data: TicketPrintData): Promise<void> {
  const {
    ticket,
    eventDetails,
    orgName = 'SIMO - OSIS',
    schoolName = 'SMKN 1 Cerdas Bangsa',
    qrCodeUrl: precomputedQr,
  } = data;

  let qrDataUrl = precomputedQr || '';
  if (!qrDataUrl) {
    try {
      const payload = JSON.stringify({
        code: ticket.ticketCode,
        nisn: ticket.nisn,
        name: ticket.studentName,
        event: ticket.eventTitle,
      });
      qrDataUrl = await generateQRCode(payload);
    } catch (err) {
      console.warn('QR code generation notice in printer:', err);
    }
  }

  // Cari atau buat wadah cetak di document.body
  let printRoot = document.getElementById('print-ticket-root');
  if (!printRoot) {
    printRoot = document.createElement('div');
    printRoot.id = 'print-ticket-root';
    document.body.appendChild(printRoot);
  }

  // HTML tiket resmi berkualitas tinggi (1 halaman A4/A5)
  printRoot.innerHTML = `
    <div style="
      width: 100%;
      max-width: 600px;
      margin: 0 auto;
      background: #FFFFFF;
      border: 2px solid #1E3A8A;
      border-radius: 16px;
      overflow: hidden;
      box-sizing: border-box;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
      color: #0F172A;
      box-shadow: 0 4px 12px rgba(0,0,0,0.08);
      page-break-inside: avoid;
    ">
      <!-- Header Tiket -->
      <div style="
        background: #1E3A8A;
        color: #FFFFFF;
        padding: 16px 22px;
        display: flex;
        align-items: center;
        justify-content: space-between;
        border-bottom: 4px solid #F59E0B;
        box-sizing: border-box;
      ">
        <div>
          <h1 style="font-size: 17px; font-weight: 800; margin: 0; color: #FFFFFF; letter-spacing: -0.3px;">
            ${schoolName}
          </h1>
          <p style="font-size: 11px; margin: 2px 0 0 0; color: #E2E8F0; text-transform: uppercase; letter-spacing: 0.5px;">
            ${orgName} • OFFICIAL EVENT PASS
          </p>
        </div>
        <div style="
          background: #F59E0B;
          color: #0F172A;
          font-size: 11px;
          font-weight: 800;
          padding: 4px 12px;
          border-radius: 9999px;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        ">
          E-TIKET RESMI
        </div>
      </div>

      <!-- Badan Tiket -->
      <div style="padding: 20px 22px; box-sizing: border-box;">
        <!-- Banner Info Event -->
        <div style="
          background: #F8FAFC;
          border: 1px solid #E2E8F0;
          border-left: 4px solid #1E3A8A;
          border-radius: 10px;
          padding: 12px 14px;
          margin-bottom: 18px;
        ">
          <div style="font-size: 15px; font-weight: 800; color: #1E3A8A; margin-bottom: 4px;">
            ${ticket.eventTitle}
          </div>
          <div style="display: flex; flex-wrap: wrap; gap: 12px; font-size: 12px; color: #475569;">
            ${eventDetails?.date ? `<span>📅 <strong>${eventDetails.date}</strong></span>` : ''}
            ${eventDetails?.time ? `<span>⏰ ${eventDetails.time}</span>` : ''}
            ${eventDetails?.location ? `<span>📍 ${eventDetails.location}</span>` : ''}
          </div>
        </div>

        <!-- Tabel Rincian Siswa -->
        <table style="width: 100%; border-collapse: collapse; margin-bottom: 16px; font-size: 13px;">
          <tbody>
            <tr style="border-bottom: 1px dashed #E2E8F0;">
              <td style="padding: 7px 0; color: #64748B; font-weight: 600; font-size: 11px; text-transform: uppercase; width: 38%;">Nama Lengkap</td>
              <td style="padding: 7px 0; color: #0F172A; font-weight: 800; font-size: 14px;">${ticket.studentName}</td>
            </tr>
            <tr style="border-bottom: 1px dashed #E2E8F0;">
              <td style="padding: 7px 0; color: #64748B; font-weight: 600; font-size: 11px; text-transform: uppercase;">NISN</td>
              <td style="padding: 7px 0; color: #0F172A; font-weight: 700; font-family: monospace;">${ticket.nisn}</td>
            </tr>
            <tr style="border-bottom: 1px dashed #E2E8F0;">
              <td style="padding: 7px 0; color: #64748B; font-weight: 600; font-size: 11px; text-transform: uppercase;">Kelas &amp; Jurusan</td>
              <td style="padding: 7px 0; color: #0F172A; font-weight: 700;">${ticket.classRoom}</td>
            </tr>
            <tr style="border-bottom: 1px dashed #E2E8F0;">
              <td style="padding: 7px 0; color: #64748B; font-weight: 600; font-size: 11px; text-transform: uppercase;">No. WhatsApp / HP</td>
              <td style="padding: 7px 0; color: #0F172A; font-weight: 700;">${ticket.phone}</td>
            </tr>
            <tr style="border-bottom: 1px dashed #E2E8F0;">
              <td style="padding: 7px 0; color: #64748B; font-weight: 600; font-size: 11px; text-transform: uppercase;">Waktu Registrasi</td>
              <td style="padding: 7px 0; color: #475569; font-weight: 600;">${ticket.registeredAt}</td>
            </tr>
          </tbody>
        </table>

        <!-- Ketentuan Ringkas -->
        <div style="
          padding: 10px 12px;
          border-radius: 8px;
          background: #FEF3C7;
          border: 1px solid #FDE68A;
          font-size: 11px;
          color: #92400E;
          line-height: 1.45;
        ">
          <strong>Catatan Penting:</strong> Tunjukkan tiket fisik/digital ini ke panitia di pintu masuk kegiatan. Hadir 15 menit sebelum acara dengan pakaian seragam sekolah rapi.
        </div>
      </div>

      <!-- Footer Tiket: Barcode & Kode -->
      <div style="
        background: #F8FAFC;
        border-top: 2px dashed #CBD5E1;
        padding: 16px 22px;
        display: flex;
        align-items: center;
        justify-content: space-between;
        box-sizing: border-box;
      ">
        <div style="text-align: left;">
          <div style="font-size: 10px; font-weight: 700; color: #64748B; text-transform: uppercase; letter-spacing: 0.5px;">KODE TIKET RESMI</div>
          <div style="font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace; font-size: 22px; font-weight: 900; color: #1E3A8A; letter-spacing: 1px;">
            ${ticket.ticketCode}
          </div>
          <div style="font-size: 10px; font-weight: 800; color: #059669; margin-top: 2px;">
            ✓ TERVERIFIKASI &amp; TERDAFTAR
          </div>
        </div>
        ${qrDataUrl ? `
        <div style="
          width: 76px;
          height: 76px;
          background: #FFFFFF;
          border: 1px solid #CBD5E1;
          border-radius: 8px;
          padding: 3px;
          display: flex;
          align-items: center;
          justify-content: center;
        ">
          <img src="${qrDataUrl}" alt="QR Tiket" style="width: 100%; height: 100%; object-fit: contain;" />
        </div>` : ''}
      </div>
    </div>
  `;

  // Aktifkan mode cetak eksklusif
  document.body.classList.add('printing-ticket-mode');

  // Bersihkan setelah dialog cetak ditutup
  const cleanup = () => {
    document.body.classList.remove('printing-ticket-mode');
    if (printRoot) {
      printRoot.innerHTML = '';
    }
    window.removeEventListener('afterprint', cleanup);
  };

  window.addEventListener('afterprint', cleanup, { once: true });

  // Panggil cetak browser
  setTimeout(() => {
    try {
      window.print();
    } catch (e) {
      console.error('Print trigger error:', e);
    }
    // Fallback safety cleanup jika afterprint tidak terpanggil
    setTimeout(cleanup, 4000);
  }, 100);
}

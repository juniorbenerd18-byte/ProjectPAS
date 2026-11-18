import { EventRegistration } from '../types';
import { generateQRCode } from './utils';

export interface PrintTicketOptions {
  ticket: EventRegistration;
  eventDetails?: {
    date: string;
    time?: string;
    location: string;
  };
  orgName?: string;
  schoolName?: string;
  logoUrl?: string;
}

/**
 * Mencetak tiket secara terisolasi menggunakan hidden iframe
 * Menghindari bug window.print() yang mencetak seluruh halaman portal (10 halaman kosong)
 */
export async function printEventTicket(options: PrintTicketOptions): Promise<void> {
  const { ticket, eventDetails, orgName = 'SIMO - OSIS', schoolName = 'SMKN 1 Cerdas Bangsa' } = options;

  let qrDataUrl = '';
  try {
    const payload = JSON.stringify({
      code: ticket.ticketCode,
      nisn: ticket.nisn,
      name: ticket.studentName,
      event: ticket.eventTitle,
    });
    qrDataUrl = await generateQRCode(payload);
  } catch (err) {
    console.error('Failed to generate QR code for print ticket:', err);
  }

  // Buat iframe tersembunyi
  const iframe = document.createElement('iframe');
  iframe.style.position = 'fixed';
  iframe.style.right = '0';
  iframe.style.bottom = '0';
  iframe.style.width = '0';
  iframe.style.height = '0';
  iframe.style.border = 'none';
  iframe.style.opacity = '0';
  iframe.style.pointerEvents = 'none';
  document.body.appendChild(iframe);

  const doc = iframe.contentWindow?.document;
  if (!doc) {
    // Fallback jika iframe tidak tersedia
    window.print();
    return;
  }

  const htmlContent = `<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="utf-8">
  <title>E-Tiket Resmi - ${ticket.ticketCode}</title>
  <style>
    @page {
      size: A4 portrait;
      margin: 15mm;
    }
    * {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
      -webkit-print-color-adjust: exact !important;
      print-color-adjust: exact !important;
    }
    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
      background: #FFFFFF;
      color: #0F172A;
      display: flex;
      justify-content: center;
      padding: 20px 0;
    }
    .ticket-wrapper {
      width: 100%;
      max-width: 600px;
      border: 2px solid #1E3A8A;
      border-radius: 16px;
      overflow: hidden;
      background: #FFFFFF;
      box-shadow: 0 4px 16px rgba(0,0,0,0.06);
    }
    .ticket-header {
      background: #1E3A8A;
      color: #FFFFFF;
      padding: 18px 24px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      border-bottom: 4px solid #F59E0B;
    }
    .ticket-brand h1 {
      font-size: 18px;
      font-weight: 800;
      letter-spacing: -0.5px;
      color: #FFFFFF;
    }
    .ticket-brand p {
      font-size: 11px;
      color: #94A3B8;
      margin-top: 2px;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
    .ticket-badge {
      background: #F59E0B;
      color: #0F172A;
      font-size: 11px;
      font-weight: 800;
      padding: 4px 12px;
      border-radius: 9999px;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
    .ticket-body {
      padding: 24px;
    }
    .event-card {
      background: #F8FAFC;
      border: 1px solid #E2E8F0;
      border-left: 4px solid #1E3A8A;
      border-radius: 10px;
      padding: 14px 16px;
      margin-bottom: 20px;
    }
    .event-title {
      font-size: 16px;
      font-weight: 800;
      color: #1E3A8A;
      line-height: 1.3;
    }
    .event-details {
      display: flex;
      flex-wrap: wrap;
      gap: 12px;
      margin-top: 8px;
      font-size: 12px;
      color: #475569;
    }
    .details-table {
      width: 100%;
      border-collapse: collapse;
      margin-bottom: 20px;
    }
    .details-table tr {
      border-bottom: 1px dashed #E2E8F0;
    }
    .details-table td {
      padding: 10px 0;
      font-size: 13px;
    }
    .label-col {
      width: 38%;
      color: #64748B;
      font-weight: 600;
      font-size: 12px;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
    .value-col {
      color: #0F172A;
      font-weight: 700;
    }
    .ticket-footer {
      background: #F8FAFC;
      border-top: 2px dashed #CBD5E1;
      padding: 18px 24px;
      display: flex;
      align-items: center;
      justify-content: space-between;
    }
    .code-box {
      text-align: left;
    }
    .code-label {
      font-size: 10px;
      font-weight: 700;
      color: #64748B;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
    .code-val {
      font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
      font-size: 22px;
      font-weight: 900;
      color: #1E3A8A;
      letter-spacing: 1px;
    }
    .code-status {
      font-size: 10px;
      font-weight: 800;
      color: #059669;
      margin-top: 2px;
    }
    .qr-box {
      width: 80px;
      height: 80px;
      background: #FFFFFF;
      border: 1px solid #E2E8F0;
      border-radius: 8px;
      padding: 4px;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .qr-box img {
      width: 100%;
      height: 100%;
      object-fit: contain;
    }
    .notice {
      margin-top: 16px;
      padding: 12px;
      border-radius: 8px;
      background: #FEF3C7;
      border: 1px solid #FDE68A;
      font-size: 11px;
      color: #92400E;
      line-height: 1.5;
    }
    .notice ol {
      margin-left: 16px;
      margin-top: 4px;
    }
  </style>
</head>
<body>
  <div class="ticket-wrapper">
    <div class="ticket-header">
      <div class="ticket-brand">
        <h1>${schoolName}</h1>
        <p>${orgName} • OFFICIAL EVENT PASS</p>
      </div>
      <div class="ticket-badge">E-TIKET RESMI</div>
    </div>
    <div class="ticket-body">
      <div class="event-card">
        <div class="event-title">${ticket.eventTitle}</div>
        <div class="event-details">
          ${eventDetails?.date ? `<span>📅 ${eventDetails.date}</span>` : ''}
          ${eventDetails?.time ? `<span>⏰ ${eventDetails.time}</span>` : ''}
          ${eventDetails?.location ? `<span>📍 ${eventDetails.location}</span>` : ''}
        </div>
      </div>

      <table class="details-table">
        <tr>
          <td class="label-col">Nama Peserta</td>
          <td class="value-col">${ticket.studentName}</td>
        </tr>
        <tr>
          <td class="label-col">NISN</td>
          <td class="value-col">${ticket.nisn}</td>
        </tr>
        <tr>
          <td class="label-col">Kelas &amp; Jurusan</td>
          <td class="value-col">${ticket.classRoom}</td>
        </tr>
        <tr>
          <td class="label-col">No. WhatsApp / HP</td>
          <td class="value-col">${ticket.phone}</td>
        </tr>
        <tr>
          <td class="label-col">Waktu Pendaftaran</td>
          <td class="value-col">${ticket.registeredAt}</td>
        </tr>
      </table>

      <div class="notice">
        <strong>Ketentuan Peserta:</strong>
        <ol>
          <li>Tunjukkan lembar tiket ini (cetak atau tangkapan layar) kepada panitia di lokasi acara.</li>
          <li>Hadir 15 menit sebelum acara dimulai dengan mengenakan seragam sekolah rapi.</li>
          <li>Tiket berlaku khusus untuk 1 orang peserta terdaftar.</li>
        </ol>
      </div>
    </div>

    <div class="ticket-footer">
      <div class="code-box">
        <div class="code-label">KODE TIKET RESMI</div>
        <div class="code-val">${ticket.ticketCode}</div>
        <div class="code-status">✓ TERDAFTAR &amp; TERVERIFIKASI</div>
      </div>
      ${qrDataUrl ? `
      <div class="qr-box">
        <img src="${qrDataUrl}" alt="QR Code" />
      </div>` : ''}
    </div>
  </div>
</body>
</html>`;

  doc.open();
  doc.write(htmlContent);
  doc.close();

  // Berikan waktu render font dan gambar QR
  setTimeout(() => {
    try {
      iframe.contentWindow?.focus();
      iframe.contentWindow?.print();
    } catch (e) {
      console.error('Print iframe error:', e);
    } finally {
      // Hapus iframe setelah print selesai / dialog ditutup
      setTimeout(() => {
        document.body.removeChild(iframe);
      }, 2000);
    }
  }, 350);
}

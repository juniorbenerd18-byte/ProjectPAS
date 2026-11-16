import { chromium } from './node_modules/playwright/index.mjs';
import fs from 'fs';
import path from 'path';

async function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function smoothScroll(page, targetY, durationMs = 1200) {
  await page.evaluate(async ({ targetY, durationMs }) => {
    const startY = window.scrollY;
    const diff = targetY - startY;
    const startTime = performance.now();
    return new Promise(resolve => {
      function step() {
        const elapsed = performance.now() - startTime;
        const progress = Math.min(elapsed / durationMs, 1);
        const ease = 0.5 - Math.cos(progress * Math.PI) / 2;
        window.scrollTo(0, startY + diff * ease);
        if (progress < 1) {
          requestAnimationFrame(step);
        } else {
          resolve();
        }
      }
      requestAnimationFrame(step);
    });
  }, { targetY, durationMs });
  await sleep(durationMs + 200);
}

(async () => {
  const outputDir = path.resolve('qa-evidence/video-admin');
  if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir, { recursive: true });

  console.log('🚀 Memulai Browser Engine untuk merekam Dashboard Admin...');
  const browser = await chromium.launch({
    headless: true
  });

  const context = await browser.newContext({
    viewport: { width: 1280, height: 720 },
    recordVideo: {
      dir: outputDir,
      size: { width: 1280, height: 720 }
    }
  });

  const page = await context.newPage();

  console.log('1. Buka smo.web.id dan navigasi ke login...');
  await page.goto('https://smo.web.id', { waitUntil: 'networkidle' });
  await sleep(1500);

  // Akses login via 5x klik logo
  const logoLink = page.locator('a[href="#beranda"]').first();
  if (await logoLink.isVisible()) {
    for (let i = 1; i <= 5; i++) {
      await logoLink.click();
      await sleep(200);
    }
  }
  await sleep(2500);

  console.log('2. Mengisi Akun Ketua Umum / Pengurus OSIS...');
  const nisnInput = page.locator('input[placeholder*="NISN"], input[type="text"]').first();
  await nisnInput.fill('0081234501');
  await sleep(800);

  const passInput = page.locator('input[type="password"]').first();
  await passInput.fill('osis2025');
  await sleep(800);

  // Klik tombol Masuk
  const submitBtn = page.locator('button[type="submit"], button:has-text("Masuk ke Dashboard Admin")').first();
  await submitBtn.click();
  console.log('3. Berhasil login! Menunggu Dashboard Admin termuat...');
  
  await page.waitForSelector('aside', { timeout: 10000 });
  await sleep(3000);

  // ===== MODUL 1: DASHBOARD UTAMA =====
  console.log('4. Eksplorasi Dashboard Utama (Statistik, Kas, Kehadiran, Agenda)...');
  await sleep(2000);
  await smoothScroll(page, 450, 1500);
  await sleep(2500);
  await smoothScroll(page, 950, 1500);
  await sleep(2500);
  await smoothScroll(page, 0, 1200);
  await sleep(1500);

  // ===== MODUL 2: KEANGGOTAAN & KTA =====
  console.log('5. Navigasi ke menu Keanggotaan & KTA...');
  const navKeanggotaan = page.locator('aside button:has-text("Keanggotaan")').first();
  await navKeanggotaan.click();
  await sleep(2500);

  // Tab Direktori Anggota
  console.log('   - Scroll Direktori Anggota...');
  await smoothScroll(page, 350, 1200);
  await sleep(2000);

  // Tab Pendaftar Oprec
  console.log('   - Klik Tab Pendaftar Oprec...');
  const tabPendaftar = page.locator('button:has-text("Pendaftar")').first();
  if (await tabPendaftar.isVisible()) {
    await tabPendaftar.click();
    await sleep(2500);
    await smoothScroll(page, 300, 1000);
    await sleep(2000);
  }

  // Tab Struktur Organisasi
  console.log('   - Klik Tab Struktur Organisasi...');
  const tabStruktur = page.locator('button:has-text("Struktur")').first();
  if (await tabStruktur.isVisible()) {
    await tabStruktur.click();
    await sleep(2500);
  }

  // Tab Cetak KTA Digital
  console.log('   - Klik Tab Cetak KTA...');
  const tabKTA = page.locator('button:has-text("KTA")').first();
  if (await tabKTA.isVisible()) {
    await tabKTA.click();
    await sleep(3000);
    await smoothScroll(page, 300, 1000);
    await sleep(2000);
  }

  // ===== MODUL 3: KEGIATAN & PRESENSI =====
  console.log('6. Navigasi ke Kegiatan & Presensi (Face AI Scanner)...');
  const navKegiatan = page.locator('aside button:has-text("Kegiatan & Presensi")').first();
  await navKegiatan.click();
  await sleep(3000);

  console.log('   - Menampilkan AI Biometric Face Scanner & Agenda...');
  await smoothScroll(page, 350, 1200);
  await sleep(3000);

  // Tab Proker
  console.log('   - Beralih ke Tab Program Kerja...');
  const tabProker = page.locator('button:has-text("Proker")').first();
  if (await tabProker.isVisible()) {
    await tabProker.click();
    await sleep(2500);
    await smoothScroll(page, 400, 1200);
    await sleep(2000);
  }

  // Tab Agenda Rapat
  console.log('   - Beralih ke Tab Rapat...');
  const tabRapat = page.locator('button:has-text("Rapat")').first();
  if (await tabRapat.isVisible()) {
    await tabRapat.click();
    await sleep(2500);
    await smoothScroll(page, 300, 1000);
    await sleep(1500);
  }

  // Tab Galeri Foto
  console.log('   - Beralih ke Tab Galeri Foto...');
  const tabFoto = page.locator('button:has-text("Foto")').first();
  if (await tabFoto.isVisible()) {
    await tabFoto.click();
    await sleep(2500);
  }

  // ===== MODUL 4: ARSIP & DOKUMEN =====
  console.log('7. Navigasi ke Arsip & Dokumen...');
  const navDokumen = page.locator('aside button:has-text("Arsip & Dokumen")').first();
  if (await navDokumen.isVisible()) {
    await navDokumen.click();
    await sleep(2500);
    await smoothScroll(page, 350, 1000);
    await sleep(2000);
  }

  // ===== MODUL 5: KOTAK ASPIRASI ADMIN =====
  console.log('8. Navigasi ke Kotak Ide & Aspirasi Siswa...');
  const navAspirasi = page.locator('aside button:has-text("Kotak Ide & Aspirasi")').first();
  if (await navAspirasi.isVisible()) {
    await navAspirasi.click();
    await sleep(2500);
    await smoothScroll(page, 300, 1000);
    await sleep(2000);
  }

  // ===== MODUL 6: PENGATURAN & TEMA =====
  console.log('9. Navigasi ke Pengaturan Organisasi...');
  const navPengaturan = page.locator('aside button:has-text("Pengaturan")').first();
  if (await navPengaturan.isVisible()) {
    await navPengaturan.click();
    await sleep(2500);
    await smoothScroll(page, 400, 1200);
    await sleep(2000);
  }

  // Uji Dark Mode di Dashboard Admin
  console.log('10. Menguji Dark Mode di Dashboard Admin...');
  const darkModeToggle = page.locator('header button[title*="Mode"], header button[aria-label*="mode"], header button:has(svg.lucide-moon), header button:has(svg.lucide-sun)').first();
  if (await darkModeToggle.isVisible()) {
    await darkModeToggle.click();
    await sleep(3000);
    // Kembali ke mode terang
    await darkModeToggle.click();
    await sleep(1500);
  }

  // Kembali ke Dashboard Utama
  console.log('11. Kembali ke Dashboard Utama...');
  const navDashboard = page.locator('aside button:has-text("Dashboard")').first();
  await navDashboard.click();
  await sleep(2500);

  console.log('12. Perekaman selesai. Menyimpan file video...');
  await sleep(2000);

  await page.close();
  await context.close();
  await browser.close();

  const vFiles = fs.readdirSync(outputDir).filter(f => f.endsWith('.webm'));
  if (vFiles.length > 0) {
    const latestVideo = path.join(outputDir, vFiles[vFiles.length - 1]);
    const finalDest = path.resolve('qa-evidence/simo-admin-dashboard-recording.webm');
    fs.copyFileSync(latestVideo, finalDest);
    console.log('🎉 SUKSES! Video rekaman Dashboard Admin tersimpan di:', finalDest);
  } else {
    console.log('❌ File video tidak ditemukan.');
  }
})();

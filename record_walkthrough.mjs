import { chromium } from './node_modules/playwright/index.mjs';
import fs from 'fs';
import path from 'path';

async function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function smoothScroll(page, targetY, durationMs = 1500) {
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
  const outputDir = path.resolve('qa-evidence/video');
  if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir, { recursive: true });

  console.log('Launching browser to record video...');
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

  console.log('1. Navigating to https://smo.web.id...');
  await page.goto('https://smo.web.id', { waitUntil: 'networkidle' });
  await sleep(2500);

  console.log('2. Exploring Hero Section & Stats...');
  await sleep(2000);

  console.log('3. Scrolling to Visi & Misi...');
  await smoothScroll(page, 750, 1500);
  await sleep(2500);

  console.log('4. Scrolling to Sambutan Ketua & Pengurus...');
  await smoothScroll(page, 1500, 1500);
  await sleep(2500);

  console.log('5. Scrolling to Agenda Kegiatan & Galeri...');
  await smoothScroll(page, 2400, 1500);
  await sleep(2500);

  // Coba buka modal foto jika ada
  try {
    const fotoCard = page.locator('button:has-text("Lihat Seluruh"), img[alt*="Sidang"], div:has-text("Sidang Pleno")').first();
    if (await fotoCard.isVisible()) {
      console.log('Opening gallery lightbox...');
      await fotoCard.click();
      await sleep(2500);
      const closeBtn = page.locator('button[aria-label="Tutup"], button:has-text("Tutup")').first();
      if (await closeBtn.isVisible()) {
        await closeBtn.click();
        await sleep(1000);
      } else {
        await page.keyboard.press('Escape');
        await sleep(1000);
      }
    }
  } catch (e) {
    console.log('Lightbox test skipped:', e.message);
  }

  console.log('6. Scrolling to Pendaftaran & Aspirasi...');
  await smoothScroll(page, 3400, 1500);
  await sleep(2500);

  // Buka modal pendaftaran
  try {
    const btnDaftar = page.locator('button:has-text("Daftar di Web"), button:has-text("Daftar Jadi Anggota")').first();
    if (await btnDaftar.isVisible()) {
      console.log('Opening registration modal...');
      await btnDaftar.click();
      await sleep(2000);
      
      const namaInput = page.locator('input[placeholder*="nama"], input[id*="nama"]').first();
      if (await namaInput.isVisible()) {
        await namaInput.fill('Ahmad Fauzi (Siswa Baru)');
        await sleep(1500);
      }

      const btnBatal = page.locator('button:has-text("Batal"), button:has-text("Tutup")').first();
      if (await btnBatal.isVisible()) {
        await btnBatal.click();
        await sleep(1500);
      } else {
        await page.keyboard.press('Escape');
        await sleep(1500);
      }
    }
  } catch (e) {
    console.log('Registration modal test skipped:', e.message);
  }

  console.log('7. Scrolling smoothly back to Navbar...');
  await smoothScroll(page, 0, 2000);
  await sleep(1500);

  console.log('8. Triggering 5x Click Easter Egg for Login Pengurus...');
  const logoLink = page.locator('a[href="#beranda"]').first();
  if (await logoLink.isVisible()) {
    for (let i = 1; i <= 5; i++) {
      await logoLink.click();
      await sleep(250);
    }
  }
  await sleep(3000);

  console.log('9. Interacting with Login Page...');
  await sleep(2000);

  try {
    const nisnInput = page.locator('input[placeholder*="NISN"], input[type="text"]').first();
    if (await nisnInput.isVisible()) {
      await nisnInput.fill('1234567890');
      await sleep(1000);
    }

    const passInput = page.locator('input[type="password"]').first();
    if (await passInput.isVisible()) {
      await passInput.fill('RahasiaOSIS2026');
      await sleep(1000);

      const toggleEye = page.locator('button[aria-label*="sandi"], button:has(svg)').first();
      if (await toggleEye.isVisible()) {
        await toggleEye.click();
        await sleep(1500);
        await toggleEye.click();
        await sleep(1000);
      }
    }

    const darkModeBtn = page.locator('button[aria-label*="mode"], button[aria-label*="tema"], button:has(svg.lucide-moon), button:has(svg.lucide-sun)').first();
    if (await darkModeBtn.isVisible()) {
      console.log('Toggling dark mode...');
      await darkModeBtn.click();
      await sleep(2500);
      await darkModeBtn.click();
      await sleep(1500);
    }

    const btnBack = page.locator('button:has-text("Kembali"), a:has-text("Kembali")').first();
    if (await btnBack.isVisible()) {
      console.log('Returning to public portal...');
      await btnBack.click();
      await sleep(3000);
    }
  } catch (e) {
    console.log('Login interactions skipped:', e.message);
  }

  console.log('10. Walkthrough completed. Saving video...');
  await sleep(2000);

  await page.close();
  await context.close();
  await browser.close();

  const vFiles = fs.readdirSync(outputDir).filter(f => f.endsWith('.webm'));
  if (vFiles.length > 0) {
    const latestVideo = path.join(outputDir, vFiles[vFiles.length - 1]);
    const finalDest = path.resolve('qa-evidence/simo-qa-test-recording.webm');
    fs.copyFileSync(latestVideo, finalDest);
    console.log('SUCCESS! Video recording saved to:', finalDest);
  } else {
    console.log('No video file found in output directory.');
  }
})();

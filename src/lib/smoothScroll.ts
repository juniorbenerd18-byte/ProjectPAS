/**
 * Smooth Inertia Momentum Scrolling (Licin & Responsif)
 * 
 * Memberikan sensasi scroll yang meluncur halus (gliding inertia / licin)
 * ketika roda mouse atau trackpad di-scroll, sehingga halaman melanjutkan
 * luncuran secara alami dengan perlambatan kurva fisika yang elegan.
 */

let isInitialized = false;
let currentY = 0;
let targetY = 0;
let rafId: number | null = null;
let isAnimating = false;

// Faktor kehalusan luncuran (0.075 - 0.09 memberikan sensasi meluncur "licin" dan responsif)
const EASE_FACTOR = 0.085;
const DELTA_MULTIPLIER = 1.05;

function isScrollableElement(el: HTMLElement | null): boolean {
  if (!el) return false;
  
  // Periksa apakah elemen berada di dalam dialog/modal, textarea, atau container overflow
  if (
    el.tagName === 'TEXTAREA' ||
    el.tagName === 'SELECT' ||
    el.isContentEditable ||
    el.closest('[role="dialog"]') ||
    el.closest('.modal-content')
  ) {
    return true;
  }

  let curr: HTMLElement | null = el;
  while (curr && curr !== document.body && curr !== document.documentElement) {
    const style = window.getComputedStyle(curr);
    const overflowY = style.overflowY;
    if (
      (overflowY === 'auto' || overflowY === 'scroll') &&
      curr.scrollHeight > curr.clientHeight
    ) {
      return true;
    }
    curr = curr.parentElement;
  }

  return false;
}

function updateScroll() {
  const diff = targetY - currentY;

  if (Math.abs(diff) > 0.4) {
    currentY += diff * EASE_FACTOR;
    window.scrollTo(0, Math.round(currentY));
    rafId = requestAnimationFrame(updateScroll);
    isAnimating = true;
  } else {
    currentY = targetY;
    window.scrollTo(0, targetY);
    isAnimating = false;
    rafId = null;
  }
}

function onWheel(e: WheelEvent) {
  // Biarkan scrolling native jika berada di dalam modal/dropdown/textarea scrollable
  const target = e.target as HTMLElement | null;
  if (isScrollableElement(target)) {
    return;
  }

  // Hanya proses jika halaman memiliki ruang scroll
  const maxScroll = Math.max(
    0,
    document.documentElement.scrollHeight - window.innerHeight
  );
  if (maxScroll <= 0) return;

  // Cegah lompatan kaku native browser
  e.preventDefault();

  if (!isAnimating) {
    currentY = window.scrollY;
    targetY = window.scrollY;
  }

  // Akumulasikan jarak scroll dengan momentum
  targetY += e.deltaY * DELTA_MULTIPLIER;
  targetY = Math.max(0, Math.min(targetY, maxScroll));

  if (!isAnimating) {
    isAnimating = true;
    rafId = requestAnimationFrame(updateScroll);
  }
}

function onNativeScroll() {
  // Jika scroll terjadi di luar animasi roda (misal drag scrollbar atau keyboard), sinkronkan posisi
  if (!isAnimating) {
    currentY = window.scrollY;
    targetY = window.scrollY;
  }
}

export function initSmoothScroll(): () => void {
  if (typeof window === 'undefined') return () => {};
  if (isInitialized) return () => {};

  isInitialized = true;
  currentY = window.scrollY;
  targetY = window.scrollY;

  // Pasang listener dengan passive: false agar e.preventDefault() dapat bekerja
  window.addEventListener('wheel', onWheel, { passive: false });
  window.addEventListener('scroll', onNativeScroll, { passive: true });

  return () => {
    isInitialized = false;
    window.removeEventListener('wheel', onWheel);
    window.removeEventListener('scroll', onNativeScroll);
    if (rafId) {
      cancelAnimationFrame(rafId);
      rafId = null;
    }
  };
}

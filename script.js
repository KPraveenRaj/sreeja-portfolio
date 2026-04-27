/* ============================================================
   KONATHAM SREEJA — site interactivity
   Modes (driven by <body data-page="...">):
     - landing  : default (index.html)
     - portfolio: webtoon / continuous vertical strip
     - deck     : horizontal Swiper slide deck (Cyber Play, Quiet Erosion)
   ============================================================ */

const PAGE = document.body.dataset.page || 'landing';
const pad2 = n => String(n).padStart(2, '0');

/* ============================================================
   DARK MODE — toggle in nav + persisted in localStorage.
   Initial mode is set in <head> inline script (no FOUC).
   ============================================================ */

function applyMode(mode) {
  document.documentElement.dataset.mode = mode;
  try { localStorage.setItem('mode', mode); } catch (e) {}
  const btn = document.querySelector('.mode-toggle');
  if (btn) {
    btn.querySelector('.mode-toggle__icon').textContent = mode === 'dark' ? '☾' : '☼';
    btn.setAttribute('aria-pressed', mode === 'dark' ? 'true' : 'false');
    btn.title = mode === 'dark' ? 'Switch to light mode' : 'Switch to dark mode';
  }
}

function toggleMode() {
  const cur = document.documentElement.dataset.mode || 'light';
  applyMode(cur === 'dark' ? 'light' : 'dark');
}

(function injectModeToggle() {
  const nav = document.querySelector('.nav');
  if (!nav) return;
  const btn = document.createElement('button');
  btn.className = 'mode-toggle';
  btn.type = 'button';
  btn.innerHTML = '<span class="mode-toggle__icon">☼</span>';
  // Append to nav__links if it exists (landing), otherwise to .nav directly
  const links = nav.querySelector('.nav__links');
  if (links) links.appendChild(btn);
  else nav.appendChild(btn);
  btn.addEventListener('click', toggleMode);
  // sync icon to current mode (set by inline head script)
  applyMode(document.documentElement.dataset.mode || 'light');
})();

/* ----- First-visit toast announcing dark mode ----- */
function showDarkModeToast() {
  try { if (localStorage.getItem('seenDarkToast') === '1') return; } catch (e) { return; }
  const toast = document.createElement('div');
  toast.className = 'toast';
  toast.setAttribute('role', 'status');
  toast.setAttribute('aria-live', 'polite');
  toast.innerHTML = '<span>Tip: dark mode is available — toggle ☼ / ☾ in the top corner.</span>' +
    '<button class="toast__close" type="button" aria-label="Dismiss">×</button>';
  document.body.appendChild(toast);
  requestAnimationFrame(() => toast.classList.add('show'));
  let timer = null;
  const dismiss = () => {
    if (timer) clearTimeout(timer);
    toast.classList.remove('show');
    setTimeout(() => toast.remove(), 350);
    try { localStorage.setItem('seenDarkToast', '1'); } catch (e) {}
  };
  toast.querySelector('.toast__close').addEventListener('click', dismiss);
  timer = setTimeout(dismiss, 9000);
}
setTimeout(showDarkModeToast, 1400);

/* ---------- Sticky nav border on scroll ---------- */
const nav = document.querySelector('.nav');
if (nav) {
  const onScroll = () => nav.classList.toggle('scrolled', window.scrollY > 8);
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();
}

/* ---------- Fade-in observer (landing page hero/cards) ---------- */
const fadeObserver = new IntersectionObserver((entries) => {
  entries.forEach(e => {
    if (e.isIntersecting) {
      e.target.classList.add('in-view');
      fadeObserver.unobserve(e.target);
    }
  });
}, { threshold: 0.08, rootMargin: '0px 0px -40px 0px' });

document.querySelectorAll('.fade-in').forEach(el => fadeObserver.observe(el));

/* ---------- Lightbox with pan + zoom ---------- */
const lightbox = document.querySelector('.lightbox');
let openLightbox = null, closeLightbox = null;
if (lightbox) {
  const lbImg = lightbox.querySelector('img');
  const lbCap = lightbox.querySelector('.lightbox__caption');

  // pan/zoom state (per-open session)
  let zoom = 1, panX = 0, panY = 0;
  let dragging = false, lastX = 0, lastY = 0;
  let pinchDist = 0, pinchZoom0 = 1;

  const apply = () => {
    lbImg.style.transform = `translate(${panX}px, ${panY}px) scale(${zoom})`;
  };
  const reset = () => { zoom = 1; panX = 0; panY = 0; apply(); };

  const setZoom = (newZoom, cx, cy) => {
    const rect = lbImg.getBoundingClientRect();
    const ox = cx - (rect.left + rect.width / 2);
    const oy = cy - (rect.top + rect.height / 2);
    const ratio = newZoom / zoom;
    panX = (panX - ox) * ratio + ox;
    panY = (panY - oy) * ratio + oy;
    zoom = newZoom;
    apply();
  };

  openLightbox = (loSrc, caption, hiSrc) => {
    // show low-res immediately, then upgrade to hi-res when it loads
    lbImg.src = loSrc;
    if (lbCap) lbCap.textContent = caption || '';
    reset();
    lightbox.classList.add('active');
    document.body.style.overflow = 'hidden';
    if (hiSrc && hiSrc !== loSrc) {
      const pre = new Image();
      pre.onload = () => {
        if (lightbox.classList.contains('active') && lbImg.src.indexOf(loSrc) >= 0) {
          lbImg.src = hiSrc;
        }
      };
      pre.src = hiSrc;
    }
  };
  closeLightbox = () => {
    lightbox.classList.remove('active');
    document.body.style.overflow = '';
    setTimeout(() => { lbImg.src = ''; reset(); }, 200);
  };

  // Mouse wheel zoom (centered on cursor)
  lightbox.addEventListener('wheel', (e) => {
    if (!lightbox.classList.contains('active')) return;
    e.preventDefault();
    const factor = e.deltaY < 0 ? 1.15 : 1 / 1.15;
    const next = Math.max(1, Math.min(8, zoom * factor));
    setZoom(next, e.clientX, e.clientY);
  }, { passive: false });

  // Drag to pan (only when zoomed)
  lbImg.addEventListener('mousedown', (e) => {
    if (zoom <= 1) return;
    dragging = true;
    lastX = e.clientX; lastY = e.clientY;
    lbImg.style.cursor = 'grabbing';
    e.preventDefault();
  });
  window.addEventListener('mousemove', (e) => {
    if (!dragging) return;
    panX += e.clientX - lastX;
    panY += e.clientY - lastY;
    lastX = e.clientX; lastY = e.clientY;
    apply();
  });
  window.addEventListener('mouseup', () => {
    dragging = false;
    lbImg.style.cursor = '';
  });

  // Double-click to toggle 1x / 2.5x
  lbImg.addEventListener('dblclick', (e) => {
    e.stopPropagation();
    setZoom(zoom > 1.05 ? 1 : 2.5, e.clientX, e.clientY);
    if (zoom <= 1.05) reset();
  });

  // Touch: pinch to zoom, drag to pan
  lbImg.addEventListener('touchstart', (e) => {
    if (e.touches.length === 2) {
      const dx = e.touches[0].clientX - e.touches[1].clientX;
      const dy = e.touches[0].clientY - e.touches[1].clientY;
      pinchDist = Math.hypot(dx, dy);
      pinchZoom0 = zoom;
    } else if (e.touches.length === 1 && zoom > 1) {
      dragging = true;
      lastX = e.touches[0].clientX;
      lastY = e.touches[0].clientY;
    }
  }, { passive: true });
  lbImg.addEventListener('touchmove', (e) => {
    if (e.touches.length === 2) {
      e.preventDefault();
      const dx = e.touches[0].clientX - e.touches[1].clientX;
      const dy = e.touches[0].clientY - e.touches[1].clientY;
      const dist = Math.hypot(dx, dy);
      const cx = (e.touches[0].clientX + e.touches[1].clientX) / 2;
      const cy = (e.touches[0].clientY + e.touches[1].clientY) / 2;
      const next = Math.max(1, Math.min(8, pinchZoom0 * (dist / pinchDist)));
      setZoom(next, cx, cy);
    } else if (e.touches.length === 1 && dragging) {
      e.preventDefault();
      panX += e.touches[0].clientX - lastX;
      panY += e.touches[0].clientY - lastY;
      lastX = e.touches[0].clientX;
      lastY = e.touches[0].clientY;
      apply();
    }
  }, { passive: false });
  lbImg.addEventListener('touchend', () => { dragging = false; });

  // Click on backdrop closes; click on image does nothing (so dblclick works)
  lightbox.addEventListener('click', (e) => {
    if (e.target === lbImg) return;
    closeLightbox();
  });
  lbImg.addEventListener('click', (e) => e.stopPropagation());

  document.addEventListener('keydown', (e) => {
    if (!lightbox.classList.contains('active')) return;
    if (e.key === 'Escape') closeLightbox();
    else if (e.key === '+' || e.key === '=') {
      const r = lbImg.getBoundingClientRect();
      setZoom(Math.min(8, zoom * 1.2), r.left + r.width/2, r.top + r.height/2);
    } else if (e.key === '-' || e.key === '_') {
      const r = lbImg.getBoundingClientRect();
      setZoom(Math.max(1, zoom / 1.2), r.left + r.width/2, r.top + r.height/2);
    } else if (e.key === '0') reset();
  });
}

/* ============================================================
   PORTFOLIO — webtoon strip
   ============================================================ */
if (PAGE === 'portfolio') {
  const strip = document.querySelector('.webtoon');
  const counter = document.querySelector('.counter');

  /* reading progress bar (top of viewport) */
  const progress = document.createElement('div');
  progress.className = 'read-progress';
  document.body.appendChild(progress);
  const updateProgress = () => {
    const max = document.documentElement.scrollHeight - window.innerHeight;
    const pct = max > 0 ? (window.scrollY / max) * 100 : 0;
    progress.style.width = pct + '%';
  };
  window.addEventListener('scroll', updateProgress, { passive: true });
  updateProgress();

  if (strip) {
    const total = parseInt(strip.dataset.pages, 10) || 0;
    const prefix = strip.dataset.prefix || 'portfolio';

    const frag = document.createDocumentFragment();
    for (let i = 1; i <= total; i++) {
      const img = document.createElement('img');
      img.src = `images/${prefix}/page-${pad2(i)}.webp`;
      img.alt = `Page ${i}`;
      img.dataset.index = String(i);
      img.dataset.hires = `images/${prefix}/page-${pad2(i)}@hi.webp`;
      img.loading = i <= 2 ? 'eager' : 'lazy';
      img.decoding = 'async';
      frag.appendChild(img);
    }
    strip.appendChild(frag);

    /* counter */
    if (counter) {
      const cTotal = counter.querySelector('[data-total]');
      const cCurrent = counter.querySelector('[data-current]');
      if (cTotal) cTotal.textContent = pad2(total);

      const pageObs = new IntersectionObserver((entries) => {
        entries.forEach(e => {
          if (e.isIntersecting) {
            const idx = parseInt(e.target.dataset.index, 10);
            if (!isNaN(idx) && cCurrent) cCurrent.textContent = pad2(idx);
          }
        });
      }, { rootMargin: '-40% 0px -55% 0px' });
      strip.querySelectorAll('img').forEach(img => pageObs.observe(img));

      const hero = document.querySelector('.project-hero');
      const nextProj = document.querySelector('.next-project');
      let pastHero = false, atBottom = false;
      const update = () => counter.classList.toggle('visible', pastHero && !atBottom);
      if (hero) new IntersectionObserver(es => { es.forEach(e => { pastHero = !e.isIntersecting; update(); }); }).observe(hero);
      if (nextProj) new IntersectionObserver(es => { es.forEach(e => { atBottom = e.isIntersecting; update(); }); }).observe(nextProj);
    }

    /* lightbox click — open lo-res, upgrade to @hi.webp when it loads */
    if (openLightbox) {
      strip.addEventListener('click', (e) => {
        const img = e.target.closest('img');
        if (!img) return;
        const idx = img.dataset.index;
        openLightbox(img.src, `Page ${pad2(idx)} / ${pad2(total)}`, img.dataset.hires);
      });
    }

    /* arrow keys jump to next/prev page in strip */
    const imgs = () => Array.from(strip.querySelectorAll('img'));
    document.addEventListener('keydown', (e) => {
      if (e.target.matches('input, textarea')) return;
      if (lightbox && lightbox.classList.contains('active')) return;
      const all = imgs();
      if (!all.length) return;
      const mid = window.scrollY + window.innerHeight / 2;
      let cur = 0;
      all.forEach((p, i) => { if (p.offsetTop < mid) cur = i; });
      if (e.key === 'ArrowDown' || e.key === 'PageDown' || e.key === 'j') {
        e.preventDefault();
        const n = all[Math.min(cur + 1, all.length - 1)];
        if (n) n.scrollIntoView({ behavior: 'smooth', block: 'start' });
      } else if (e.key === 'ArrowUp' || e.key === 'PageUp' || e.key === 'k') {
        e.preventDefault();
        const p = all[Math.max(cur - 1, 0)];
        if (p) p.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
  }
}

/* ============================================================
   DECK — Swiper slide deck (Cyber Play, Quiet Erosion)
   ============================================================ */
if (PAGE === 'deck') {
  const stage = document.querySelector('.deck-stage');
  const deck = document.querySelector('.swiper.deck');
  const counterCur = document.querySelector('.deck-counter [data-current]');
  const counterTot = document.querySelector('.deck-counter [data-total]');
  const prevBtn = document.querySelector('.deck-nav.prev');
  const nextBtn = document.querySelector('.deck-nav.next');
  const progressEl = document.querySelector('.deck-progress');

  if (deck && typeof Swiper !== 'undefined') {
    const total = parseInt(deck.dataset.pages, 10) || 0;
    const prefix = deck.dataset.prefix;
    const theme = stage ? stage.dataset.theme : null;

    /* cyber-only: drifting scanline overlay */
    if (theme === 'cyber' && stage) {
      const scan = document.createElement('div');
      scan.className = 'deck-scanline';
      stage.appendChild(scan);
    }

    /* build wrapper + slides */
    const wrapper = document.createElement('div');
    wrapper.className = 'swiper-wrapper';
    for (let i = 1; i <= total; i++) {
      const slide = document.createElement('div');
      slide.className = 'swiper-slide';
      slide.dataset.index = String(i);
      const img = document.createElement('img');
      img.src = `images/${prefix}/page-${pad2(i)}.webp`;
      img.alt = `Page ${i}`;
      img.dataset.hires = `images/${prefix}/page-${pad2(i)}@hi.webp`;
      img.loading = i <= 2 ? 'eager' : 'lazy';
      img.decoding = 'async';
      slide.appendChild(img);
      wrapper.appendChild(slide);
    }
    deck.appendChild(wrapper);

    if (counterTot) counterTot.textContent = pad2(total);

    const swiper = new Swiper(deck, {
      direction: 'horizontal',
      slidesPerView: 1,
      speed: 500,
      grabCursor: true,
      keyboard: { enabled: true, onlyInViewport: true },
      mousewheel: { enabled: true, sensitivity: 1, thresholdDelta: 10, forceToAxis: true },
      freeMode: {
        enabled: true,
        sticky: true,
        momentum: true,
        momentumRatio: 1,
        momentumVelocityRatio: 1.6,
        momentumBounce: false,
      },
      pagination: progressEl ? {
        el: progressEl,
        type: 'progressbar',
      } : false,
      navigation: {
        prevEl: prevBtn,
        nextEl: nextBtn,
      },
      preloadImages: false,
      lazy: false,
      a11y: {
        prevSlideMessage: 'Previous slide',
        nextSlideMessage: 'Next slide',
      },
      on: {
        slideChange(s) {
          if (counterCur) counterCur.textContent = pad2(s.activeIndex + 1);
          if (theme === 'cyber') {
            const active = s.slides[s.activeIndex];
            if (active) {
              active.classList.remove('glitching');
              // force reflow so animation restarts
              void active.offsetWidth;
              active.classList.add('glitching');
              setTimeout(() => active.classList.remove('glitching'), 600);
            }
          }
        },
      },
    });

    /* lightbox click on active slide — open lo-res, upgrade to @hi.webp.
       Use Swiper's own 'click' event: it fires only on real clicks (not after
       a drag), and is dispatched after Swiper's internal click-suppression
       gate, so it works immediately on page load without the stale-diff race
       that a raw DOM 'click' listener hits. */
    if (openLightbox) {
      swiper.on('click', (s, e) => {
        const img = e.target.closest('.swiper-slide img');
        if (!img) return;
        const idx = parseInt(img.parentElement.dataset.index, 10);
        openLightbox(img.src, `Page ${pad2(idx)} / ${pad2(total)}`, img.dataset.hires);
      });
    }
  }
}

/* ---------- Year in footer ---------- */
const yearEl = document.querySelector('[data-year]');
if (yearEl) yearEl.textContent = new Date().getFullYear();

/* ============================================================
   KONATHAM SREEJA — site interactivity
   Modes (driven by <body data-page="...">):
     - landing  : default (index.html)
     - portfolio: webtoon / continuous vertical strip
     - deck     : horizontal Swiper slide deck (Cyber Play, Quiet Erosion)
   ============================================================ */

const PAGE = document.body.dataset.page || 'landing';
const pad2 = n => String(n).padStart(2, '0');

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

/* ---------- Lightbox (shared) ---------- */
const lightbox = document.querySelector('.lightbox');
let openLightbox = null, closeLightbox = null;
if (lightbox) {
  const lbImg = lightbox.querySelector('img');
  const lbCap = lightbox.querySelector('.lightbox__caption');
  openLightbox = (src, caption) => {
    lbImg.src = src;
    if (lbCap) lbCap.textContent = caption || '';
    lightbox.classList.add('active');
    document.body.style.overflow = 'hidden';
  };
  closeLightbox = () => {
    lightbox.classList.remove('active');
    document.body.style.overflow = '';
    setTimeout(() => { lbImg.src = ''; }, 200);
  };
  lightbox.addEventListener('click', closeLightbox);
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && lightbox.classList.contains('active')) closeLightbox();
  });
}

/* ============================================================
   PORTFOLIO — webtoon strip
   ============================================================ */
if (PAGE === 'portfolio') {
  const strip = document.querySelector('.webtoon');
  const counter = document.querySelector('.counter');

  if (strip) {
    const total = parseInt(strip.dataset.pages, 10) || 0;
    const prefix = strip.dataset.prefix || 'portfolio';

    const frag = document.createDocumentFragment();
    for (let i = 1; i <= total; i++) {
      const img = document.createElement('img');
      img.src = `images/${prefix}/page-${pad2(i)}.jpg`;
      img.alt = `Page ${i}`;
      img.dataset.index = String(i);
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

    /* lightbox click */
    if (openLightbox) {
      strip.addEventListener('click', (e) => {
        const img = e.target.closest('img');
        if (!img) return;
        const idx = img.dataset.index;
        openLightbox(img.src, `Page ${pad2(idx)} / ${pad2(total)}`);
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

    /* build wrapper + slides */
    const wrapper = document.createElement('div');
    wrapper.className = 'swiper-wrapper';
    for (let i = 1; i <= total; i++) {
      const slide = document.createElement('div');
      slide.className = 'swiper-slide';
      slide.dataset.index = String(i);
      const img = document.createElement('img');
      img.src = `images/${prefix}/page-${pad2(i)}.jpg`;
      img.alt = `Page ${i}`;
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

    /* lightbox click on active slide image */
    if (openLightbox) {
      deck.addEventListener('click', (e) => {
        const img = e.target.closest('.swiper-slide img');
        if (!img) return;
        // only trigger if the user actually clicked (not dragged)
        if (swiper.touches && Math.abs(swiper.touches.diff) > 6) return;
        const idx = parseInt(img.parentElement.dataset.index, 10);
        openLightbox(img.src, `Page ${pad2(idx)} / ${pad2(total)}`);
      });
    }
  }
}

/* ---------- Year in footer ---------- */
const yearEl = document.querySelector('[data-year]');
if (yearEl) yearEl.textContent = new Date().getFullYear();

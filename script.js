/* ============================================================
   Minimal interactivity
   ============================================================ */

// Sticky nav border on scroll
const nav = document.querySelector('.nav');
if (nav) {
  const onScroll = () => {
    nav.classList.toggle('scrolled', window.scrollY > 8);
  };
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();
}

// Fade-in on intersection
const fadeObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('in-view');
      fadeObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.08, rootMargin: '0px 0px -40px 0px' });

document.querySelectorAll('.fade-in, .gallery__page').forEach(el => fadeObserver.observe(el));

// Page counter on project pages
const counter = document.querySelector('.counter');
const galleryPages = document.querySelectorAll('.gallery__page');

if (counter && galleryPages.length) {
  const total = galleryPages.length;
  const counterTotal = counter.querySelector('[data-total]');
  if (counterTotal) counterTotal.textContent = String(total).padStart(2, '0');

  const counterCurrent = counter.querySelector('[data-current]');

  let pageIndex = 1;
  const counterObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const idx = parseInt(entry.target.dataset.index, 10);
        if (!isNaN(idx)) {
          pageIndex = idx;
          if (counterCurrent) counterCurrent.textContent = String(pageIndex).padStart(2, '0');
        }
      }
    });
  }, { rootMargin: '-40% 0px -55% 0px' });

  galleryPages.forEach(p => counterObserver.observe(p));

  // Show counter once user has scrolled past hero
  const heroSection = document.querySelector('.project-hero');
  const nextProject = document.querySelector('.next-project');
  let pastHero = false;
  let atBottom = false;
  const updateCounterVisibility = () => {
    counter.classList.toggle('visible', pastHero && !atBottom);
  };

  if (heroSection) {
    const heroObs = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        pastHero = !entry.isIntersecting;
        updateCounterVisibility();
      });
    });
    heroObs.observe(heroSection);
  }

  if (nextProject) {
    const bottomObs = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        atBottom = entry.isIntersecting;
        updateCounterVisibility();
      });
    });
    bottomObs.observe(nextProject);
  }
}

// Keyboard navigation: arrow keys scroll between pages
document.addEventListener('keydown', (e) => {
  if (!galleryPages.length) return;
  if (e.target.matches('input, textarea')) return;

  const viewportMid = window.scrollY + window.innerHeight / 2;
  let currentIdx = 0;
  galleryPages.forEach((p, i) => {
    const top = p.offsetTop;
    if (top < viewportMid) currentIdx = i;
  });

  if (e.key === 'ArrowDown' || e.key === 'PageDown' || e.key === 'j') {
    e.preventDefault();
    const next = galleryPages[Math.min(currentIdx + 1, galleryPages.length - 1)];
    if (next) next.scrollIntoView({ behavior: 'smooth', block: 'start' });
  } else if (e.key === 'ArrowUp' || e.key === 'PageUp' || e.key === 'k') {
    e.preventDefault();
    const prev = galleryPages[Math.max(currentIdx - 1, 0)];
    if (prev) prev.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }
});

// Lightbox - click any gallery image to view full-size
const lightbox = document.querySelector('.lightbox');
if (lightbox) {
  const lightboxImg = lightbox.querySelector('img');
  const lightboxCaption = lightbox.querySelector('.lightbox__caption');

  const open = (src, caption) => {
    lightboxImg.src = src;
    if (lightboxCaption) lightboxCaption.textContent = caption || '';
    lightbox.classList.add('active');
    document.body.style.overflow = 'hidden';
  };
  const close = () => {
    lightbox.classList.remove('active');
    document.body.style.overflow = '';
    setTimeout(() => { lightboxImg.src = ''; }, 200);
  };

  document.querySelectorAll('.gallery__page img').forEach((img, idx) => {
    img.addEventListener('click', () => {
      open(img.src, `Page ${String(idx + 1).padStart(2, '0')} / ${String(galleryPages.length).padStart(2, '0')}`);
    });
  });

  lightbox.addEventListener('click', close);

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && lightbox.classList.contains('active')) close();
  });
}

// Year in footer
const yearEl = document.querySelector('[data-year]');
if (yearEl) yearEl.textContent = new Date().getFullYear();

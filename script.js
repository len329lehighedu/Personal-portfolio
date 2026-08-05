// ---------- Reveal on scroll ----------
const io = new IntersectionObserver((entries) => {
  entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } });
}, { threshold: 0.15 });
document.querySelectorAll('.reveal').forEach(el => io.observe(el));

// ---------- Draggable & autoplay image carousels ----------
function initCarousels() {
  document.querySelectorAll('.carousel').forEach(carousel => {
    let images = [];
    try { images = JSON.parse(carousel.dataset.images); } catch (e) { images = []; }
    if (!images.length) return;

    const track = document.createElement('div');
    track.className = 'carousel-track';
    images.forEach(src => {
      const img = document.createElement('img');
      img.src = src;
      img.alt = 'Project preview';
      img.draggable = false;
      track.appendChild(img);
    });
    carousel.appendChild(track);

    let dots = null;
    let autoplayTimer = null;
    let currentIdx = 0;
    let direction = 1;

    function startAutoplay() {
      if (images.length <= 1) return;
      autoplayTimer = setInterval(() => {
        currentIdx += direction;
        if (currentIdx >= images.length - 1) direction = -1;
        if (currentIdx <= 0) direction = 1;
        track.scrollTo({ left: track.clientWidth * currentIdx, behavior: 'smooth' });
      }, 3400);
    }

    function stopAutoplay() {
      if (autoplayTimer) clearInterval(autoplayTimer);
    }

    if (images.length > 1) {
      dots = document.createElement('div');
      dots.className = 'carousel-dots';
      images.forEach((_, i) => {
        const dot = document.createElement('div');
        dot.className = 'carousel-dot' + (i === 0 ? ' active' : '');
        dot.addEventListener('click', () => {
          stopAutoplay();
          track.scrollTo({ left: track.clientWidth * i, behavior: 'smooth' });
          currentIdx = i;
          startAutoplay();
        });
        dots.appendChild(dot);
      });
      carousel.appendChild(dots);

      track.addEventListener('scroll', () => {
        const idx = Math.round(track.scrollLeft / track.clientWidth);
        currentIdx = idx;
        dots.querySelectorAll('.carousel-dot').forEach((d, i) => d.classList.toggle('active', i === idx));
      });

      startAutoplay();
    }

    let isDown = false, startX = 0, scrollStart = 0;
    track.addEventListener('pointerdown', (e) => {
      stopAutoplay();
      isDown = true;
      track.classList.add('dragging');
      startX = e.pageX;
      scrollStart = track.scrollLeft;
      track.setPointerCapture(e.pointerId);
    });
    track.addEventListener('pointermove', (e) => {
      if (!isDown) return;
      track.scrollLeft = scrollStart - (e.pageX - startX);
    });
    ['pointerup', 'pointercancel', 'pointerleave'].forEach(evt => {
      track.addEventListener(evt, () => {
        if (isDown) {
          isDown = false;
          track.classList.remove('dragging');
          startAutoplay();
        }
      });
    });
  });
}
initCarousels();

// ---------- Animated counters ----------
const counters = document.querySelectorAll('[data-count]');
const countIO = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      const el = entry.target;
      const target = parseFloat(el.dataset.count);
      const decimals = parseInt(el.dataset.decimals || '0');
      const suffix = el.dataset.suffix || '';
      let cur = 0;
      const step = target / 40;
      const tick = () => {
        cur += step;
        if (cur >= target) { el.textContent = target.toFixed(decimals) + suffix; return; }
        el.textContent = cur.toFixed(decimals) + suffix;
        requestAnimationFrame(tick);
      };
      tick();
      countIO.unobserve(el);
    }
  });
}, { threshold: 0.4 });
counters.forEach(c => countIO.observe(c));

// ---------- Index nav: scrollspy ----------
(function () {
  const items = document.querySelectorAll('.idx-item');
  if (!items.length) return;
  const sections = Array.from(items)
    .map(item => document.getElementById(item.dataset.target))
    .filter(Boolean);

  const spyIO = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      const item = document.querySelector(`.idx-item[data-target="${entry.target.id}"]`);
      if (!item) return;
      if (entry.isIntersecting) {
        items.forEach(i => i.classList.remove('active'));
        item.classList.add('active');
      }
    });
  }, { rootMargin: '-40% 0px -50% 0px', threshold: 0 });

  sections.forEach(sec => spyIO.observe(sec));
})();

// ---------- Dark mode toggle ----------
(function () {
  const root = document.documentElement;
  const toggle = document.getElementById('themeToggle');
  if (!toggle) return;

  toggle.addEventListener('click', () => {
    const current = root.getAttribute('data-theme') === 'dark' ? 'dark' : 'light';
    const next = current === 'dark' ? 'light' : 'dark';
    root.setAttribute('data-theme', next);
    try { localStorage.setItem('theme', next); } catch (e) { /* storage unavailable, ignore */ }
  });

  window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
    let saved = null;
    try { saved = localStorage.getItem('theme'); } catch (err) { /* ignore */ }
    if (!saved) root.setAttribute('data-theme', e.matches ? 'dark' : 'light');
  });
})();
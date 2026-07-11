const io = new IntersectionObserver((entries) => {
  entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } });
}, { threshold: 0.15 });
document.querySelectorAll('.reveal').forEach(el => io.observe(el));

// ---------- Draggable & Autoplay image carousels ----------
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

    // Hàm quản lý autoplay
    let direction = 1;
    function startAutoplay() {
      if (images.length <= 1) return;
      autoplayTimer = setInterval(() => {
        currentIdx += direction;
        if (currentIdx >= images.length - 1) {
          direction = -1;
        }
        if (currentIdx <= 0) {
          direction = 1;
        }
        track.scrollTo({
          left: track.clientWidth * currentIdx,
          behavior: 'smooth'
        });
      }, 3000);

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

      // Bắt đầu tự động chạy
      startAutoplay();
    }

    // Drag to browse (Chuột/Cảm ứng) + Tạm dừng autoplay khi tương tác
    let isDown = false, startX = 0, scrollStart = 0;
    track.addEventListener('pointerdown', (e) => {
      stopAutoplay(); // Dừng chạy tự động khi user click/chạm vào ảnh
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
          startAutoplay(); // Chạy lại autoplay sau khi user thả chuột/tay ra
        }
      });
    });
  });
}
initCarousels();

// ---------- Glass cursor (replaces native cursor on desktop) ----------
(function () {
  if (!window.matchMedia('(pointer: fine)').matches) return; // skip on touch devices

  const cursor = document.createElement('div');
  cursor.className = 'glass-cursor';
  document.body.appendChild(cursor);

  const mouse = { x: innerWidth / 2, y: innerHeight / 2 };
  let curX = mouse.x, curY = mouse.y;

  window.addEventListener('pointermove', (e) => {
    mouse.x = e.clientX;
    mouse.y = e.clientY;
  });
  window.addEventListener('pointerdown', () => cursor.classList.add('click'));
  window.addEventListener('pointerup', () => cursor.classList.remove('click'));

  function tick() {
    curX += (mouse.x - curX) * 0.18;
    curY += (mouse.y - curY) * 0.18;
    cursor.style.transform = `translate(${curX}px, ${curY}px) translate(-50%,-50%)`;
    requestAnimationFrame(tick);
  }
  tick();

  const HOVER_SELECTOR = 'a, button, .btn, .social-circle, .pill, .carousel, .carousel-dot';
  document.addEventListener('pointerover', (e) => {
    if (e.target.closest(HOVER_SELECTOR)) cursor.classList.add('hover');
  });
  document.addEventListener('pointerout', (e) => {
    if (e.target.closest(HOVER_SELECTOR)) cursor.classList.remove('hover');
  });
})();

// ---------- Magnetic buttons ----------
(function () {
  if (!window.matchMedia('(pointer: fine)').matches) return;

  document.querySelectorAll('.btn, .social-circle').forEach(el => {
    const strength = el.classList.contains('social-circle') ? 0.45 : 0.3;

    el.addEventListener('pointermove', (e) => {
      const r = el.getBoundingClientRect();
      const relX = e.clientX - r.left - r.width / 2;
      const relY = e.clientY - r.top - r.height / 2;
      el.style.transform = `translate(${(relX * strength).toFixed(1)}px, ${(relY * strength).toFixed(1)}px)`;
    });

    el.addEventListener('pointerleave', () => {
      el.style.transform = '';
    });
  });
})();

// ---------- Card tilt + image parallax ----------
(function () {
  if (!window.matchMedia('(pointer: fine)').matches) return;

  document.querySelectorAll('.project-card').forEach(card => {
    const track = card.querySelector('.carousel-track');

    card.addEventListener('pointermove', (e) => {
      const r = card.getBoundingClientRect();
      const px = (e.clientX - r.left) / r.width - 0.5;
      const py = (e.clientY - r.top) / r.height - 0.5;
      const rotateX = (-py * 6).toFixed(2);
      const rotateY = (px * 8).toFixed(2);

      card.style.transition = 'transform .1s linear';
      card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-6px)`;

      if (track) {
        track.style.transition = 'transform .1s linear';
        track.style.transform = `translate(${(-px * 20).toFixed(1)}px, ${(-py * 20).toFixed(1)}px) scale(1.06)`;
      }
    });

    card.addEventListener('pointerleave', () => {
      card.style.transition = 'transform .5s cubic-bezier(.22,1,.36,1)';
      card.style.transform = '';
      if (track) {
        track.style.transition = 'transform .5s cubic-bezier(.22,1,.36,1)';
        track.style.transform = '';
      }
    });
  });
})();

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
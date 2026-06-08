(function () {
  const $ = (sel) => document.querySelector(sel);
  const $$ = (sel) => Array.from(document.querySelectorAll(sel));

  // Year
  const yearEl = $('#year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  // Mobile nav toggle
  const toggleBtn = $('#navToggle');
  const nav = $('#siteNav');



  if (toggleBtn && nav) {
    const setExpanded = (val) => toggleBtn.setAttribute('aria-expanded', String(val));

    const open = () => {
      nav.classList.add('is-open');
      setExpanded(true);
      toggleBtn.setAttribute('aria-label', 'Cerrar menú');
    };

    const close = () => {
      nav.classList.remove('is-open');
      setExpanded(false);
      toggleBtn.setAttribute('aria-label', 'Abrir menú');
    };

    toggleBtn.addEventListener('click', () => {
      const isOpen = nav.classList.contains('is-open');
      if (isOpen) close();
      else open();
    });

    // Close when clicking a link (mobile)
    $$('#siteNav a').forEach((a) => {
      a.addEventListener('click', () => {
        if (nav.classList.contains('is-open')) close();
      });
    });

    // Close on escape
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && nav.classList.contains('is-open')) close();
    });

    // Close if resizing to desktop
    window.addEventListener('resize', () => {
      if (window.innerWidth > 720) close();
    });
  }

  // Active link based on current path
  const path = window.location.pathname;
  const routeToActive = () => {
    const links = $$('.nav-link');
    links.forEach((l) => l.classList.remove('active'));

    const active = links.find((l) => {
      const href = l.getAttribute('href') || '';
      // match by end of path
      return path.endsWith(href.replace(/^\.\//, '')) || path.endsWith(href.replace(/^\.\.\//, ''));
    });

    if (active) active.classList.add('active');
    // fallback by data-route
    const byData = links.find((l) => {
      const r = l.getAttribute('data-route');
      if (!r) return false;
      if (r === 'inicio') return path.endsWith('index.html') || path.endsWith('/');
      if (r === 'mision') return path.endsWith('mision.html');
      if (r === 'vision') return path.endsWith('vision.html');
      if (r === 'servicios') return path.endsWith('servicios.html');
      if (r === 'proyectos') return path.endsWith('proyectos.html');
      if (r === 'personal') return path.endsWith('personal.html');
      if (r === 'contacto') return path.endsWith('contacto.html');


      return false;
    });
    if (!active && byData) byData.classList.add('active');
  };
  routeToActive();

  // Reveal on scroll
  const revealEls = $$('.reveal');
  if (revealEls.length) {
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add('is-visible');
            io.unobserve(e.target);
          }
        });
      },
      { threshold: 0.12 }
    );

    revealEls.forEach((el) => io.observe(el));
  }

  // Smooth scrolling for in-page anchors (with offset handled by browser since we use skip-link)
  document.addEventListener('click', (e) => {
    const a = e.target.closest('a[href^="#"]');
    if (!a) return;
    const href = a.getAttribute('href');
    if (!href || href === '#') return;
    const target = document.querySelector(href);
    if (target) {
      e.preventDefault();
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  });

  // Contact form (demo)
  const form = $('#contactForm');
  const note = $('#formNote');
  if (form && note) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      note.textContent = 'Mensaje enviado (demo). ¡Gracias por escribir!';
      form.reset();
    });
  }

  // ✨ Estrellitas al hacer click y al mover el mouse
  const STAR_TTL = 900;
  const MAX_STARS_PER_BURST = 22;

  const spawnStar = (x, y) => {
    const el = document.createElement('span');
    el.className = 'star-pop';
    el.style.left = `${x}px`;
    el.style.top = `${y}px`;
    el.style.setProperty('--star-hue', String(280 + Math.random() * 80));

    // tamaño aleatorio
    const size = 10 + Math.random() * 12;
    el.style.width = `${size}px`;
    el.style.height = `${size}px`;

    // Estrella en forma “spark”: usamos pseudo-elementos con clip-path (fallback circle)
    el.style.borderRadius = '6px';
    el.style.background = `hsla(${280 + Math.random() * 80}, 95%, 78%, .95)`;
    el.style.clipPath = 'polygon(50% 0%, 62% 32%, 100% 50%, 62% 68%, 50% 100%, 38% 68%, 0% 50%, 38% 32%)';


    document.body.appendChild(el);
    setTimeout(() => el.remove(), STAR_TTL);
  };

  const burstStars = (x, y) => {
    const count = 10 + Math.floor(Math.random() * MAX_STARS_PER_BURST);
    for (let i = 0; i < count; i++) {
      const ox = (Math.random() - 0.5) * 60;
      const oy = (Math.random() - 0.5) * 60;
      spawnStar(x + ox, y + oy);
    }
  };

  document.addEventListener('click', (e) => {
    burstStars(e.clientX, e.clientY);

    // Brillar el botón "Ver servicios" (si existe)
    const btn = e.target.closest('a[href$="/pages/servicios.html"], a[href$="pages/servicios.html"], a[data-route="servicios"], a[href="./pages/servicios.html"]');
    if (btn) {
      btn.classList.remove('star-btn');
      // forzar reflow para reiniciar animación
      void btn.offsetWidth;
      btn.classList.add('star-btn');
    }
  });

  let lastMoveAt = 0;
  document.addEventListener('mousemove', (e) => {
    const now = performance.now();
    if (now - lastMoveAt < 120) return;
    lastMoveAt = now;
    // menos frecuente para no saturar
    if (Math.random() < 0.55) return;
    burstStars(e.clientX, e.clientY);
  });

  // Deslizar a la izquierda al entrar a páginas internas (simple)
  // (solo si viene con navegación; no rompe la página)
  window.addEventListener('load', () => {
    const main = document.querySelector('main');
    if (main) {
      main.style.transform = 'translateX(20px)';
      main.style.transition = 'transform .55s ease';
      requestAnimationFrame(() => {
        main.style.transform = 'translateX(0)';
      });
    }
  });

  // Count-up stats (optional)
  const countEls = $$('[data-count]');
  if (countEls.length) {
    const start = (el) => {
      const target = Number(el.getAttribute('data-count')) || 0;
      const duration = 900;
      const startTime = performance.now();
      const from = 0;

      const tick = (t) => {
        const p = Math.min(1, (t - startTime) / duration);
        const eased = 1 - Math.pow(1 - p, 3);
        const val = Math.round(from + (target - from) * eased);
        el.textContent = String(val);
        if (p < 1) requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
    };

    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            start(e.target);
            io.unobserve(e.target);
          }
        });
      },
      { threshold: 0.25 }
    );

    countEls.forEach((el) => io.observe(el));
  }
})();


/**
 * danndev — main.js
 * Dependências: tsParticles, Typed.js, VanillaTilt, Lucide Icons
 */
'use strict';

/* ================================================================
   Utilitários
   ================================================================ */
const qs  = (sel, ctx = document) => ctx.querySelector(sel);
const qsa = (sel, ctx = document) => [...ctx.querySelectorAll(sel)];

function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}

const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

// Ícones Lucide
if (typeof lucide !== 'undefined') lucide.createIcons();

/* ================================================================
   Matrix canvas
   ================================================================ */
(function initMatrix() {
  if (prefersReducedMotion) return;

  const isWeakDevice = (navigator.hardwareConcurrency || 4) <= 2 ||
                       (navigator.deviceMemory || 8) <= 2;
  if (isWeakDevice) return;

  const canvas = qs('#matrix-canvas');
  if (!canvas) return;

  const ctx = canvas.getContext('2d');
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789@#$%^&*()_+-=[]{}|;:.,<>?/\\~`';
  const colors = ['#7c3aed', '#2563eb', '#06b6d4', '#a855f7'];

  let cols, drops;

  function resize() {
    canvas.width  = window.innerWidth;
    canvas.height = window.innerHeight;
    cols  = Math.floor(canvas.width / 18);
    drops = Array(cols).fill(1).map(() => Math.random() * -canvas.height);
  }
  resize();
  window.addEventListener('resize', debounce(resize, 200));

  function drawMatrix() {
    ctx.fillStyle = 'rgba(10, 10, 15, 0.05)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.font = '14px Share Tech Mono, monospace';

    for (let i = 0; i < drops.length; i++) {
      const char = chars[Math.floor(Math.random() * chars.length)];
      ctx.fillStyle = colors[Math.floor(Math.random() * colors.length)];
      ctx.fillText(char, i * 18, drops[i]);
      drops[i] += 18;
      if (drops[i] > canvas.height && Math.random() > 0.975) drops[i] = 0;
    }
  }

  let animId, lastTime = 0;
  const fpsLimit = 20;
  const frameDelay = 1000 / fpsLimit;

  function loop(timestamp) {
    if (!lastTime) lastTime = timestamp;
    const elapsed = timestamp - lastTime;
    if (elapsed > frameDelay) {
      drawMatrix();
      lastTime = timestamp - (elapsed % frameDelay);
    }
    animId = requestAnimationFrame(loop);
  }
  animId = requestAnimationFrame(loop);

  document.addEventListener('visibilitychange', () => {
    if (document.hidden) cancelAnimationFrame(animId);
    else animId = requestAnimationFrame(loop);
  });
})();

/* ================================================================
   Header — scroll e navegação ativa
   ================================================================ */
(function initHeader() {
  const header   = qs('#header');
  const backTop  = qs('#back-top');
  const sections = qsa('section[id]');
  const navLinks = qsa('.nav-link');

  const onScroll = () => {
    const y = window.scrollY;
    const headerHeight = header.offsetHeight;

    header.classList.toggle('scrolled', y > headerHeight);
    if (backTop) backTop.hidden = y < headerHeight + 200;

    let current = '';
    sections.forEach(sec => {
      if (y >= sec.offsetTop - headerHeight - 20) current = sec.id;
    });
    navLinks.forEach(link => {
      link.classList.toggle('active', link.getAttribute('href') === '#' + current);
    });
  };

  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  if (backTop) {
    backTop.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
  }
})();

/* ================================================================
   Menu mobile
   ================================================================ */
(function initMobileNav() {
  const toggle = qs('#nav-toggle');
  const menu   = qs('#nav-menu');
  if (!toggle || !menu) return;

  toggle.addEventListener('click', () => {
    const isOpen = menu.classList.toggle('open');
    toggle.classList.toggle('open', isOpen);
    toggle.setAttribute('aria-expanded', isOpen);
    document.body.style.overflow = isOpen ? 'hidden' : '';
  });

  menu.querySelectorAll('.nav-link').forEach(link => {
    link.addEventListener('click', () => {
      menu.classList.remove('open');
      toggle.classList.remove('open');
      toggle.setAttribute('aria-expanded', false);
      document.body.style.overflow = '';
    });
  });

  document.addEventListener('click', (e) => {
    if (!menu.contains(e.target) && !toggle.contains(e.target)) {
      menu.classList.remove('open');
      toggle.classList.remove('open');
      toggle.setAttribute('aria-expanded', false);
      document.body.style.overflow = '';
    }
  });
})();

/* ================================================================
   Typed.js — efeito de digitação no hero
   ================================================================ */
(function initTyped() {
  const el = qs('#typed-text');
  if (!el || typeof Typed === 'undefined') return;

  new Typed('#typed-text', {
    strings: ['no topo', 'online em 24h', 'profissional', 'vendendo mais', 'no digital'],
    typeSpeed: 30,
    backSpeed: 28,
    backDelay: 2000,
    loop: true,
    showCursor: true,
    cursorChar: '|',
  });
})();

/* ================================================================
   Contador animado das stats
   ================================================================ */
(function initCounters() {
  const nums = qsa('[data-count]');
  if (!nums.length) return;

  const ease = (t) => t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;

  function animateCounter(el) {
    const target   = +el.dataset.count;
    const duration = 1500;
    const start    = performance.now();

    function tick(now) {
      const t = Math.min((now - start) / duration, 1);
      el.textContent = Math.round(ease(t) * target);
      if (t < 1) requestAnimationFrame(tick);
      else el.textContent = target;
    }
    requestAnimationFrame(tick);
  }

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        animateCounter(entry.target);
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.5 });

  nums.forEach(n => observer.observe(n));
})();

/* ================================================================
   Scroll reveal
   ================================================================ */
(function initReveal() {
  const items = qsa('.reveal');
  if (!items.length) return;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry, i) => {
      if (entry.isIntersecting) {
        const delay = entry.target.dataset.delay || (i * 40);
        setTimeout(() => entry.target.classList.add('visible'), parseInt(delay));
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.08 });

  items.forEach((el, i) => {
    el.dataset.delay = i * 40;
    observer.observe(el);
  });
})();

/* ================================================================
   VanillaTilt nos cards de serviço
   ================================================================ */
(function initTilt() {
  if (typeof VanillaTilt === 'undefined') return;
  if (window.matchMedia('(hover: none)').matches) return;
  if (window.innerWidth < 768) return;

  VanillaTilt.init(qsa('[data-tilt]'), {
    max: 6,
    speed: 300,
    glare: false,
    scale: 1,
  });
})();

/* ================================================================
   tsParticles — partículas no hero
   ================================================================ */
(function initParticles() {
  if (prefersReducedMotion) return;
  if (typeof tsParticles === 'undefined') return;

  tsParticles.load('hero-particles', {
    fullScreen: { enable: false },
    background: { color: { value: 'transparent' } },
    fpsLimit: 60,
    interactivity: {
      events: { onHover: { enable: true, mode: 'repulse' }, resize: true },
      modes: { repulse: { distance: 80, duration: 0.4 } },
    },
    particles: {
      color: { value: ['#7c3aed', '#2563eb', '#06b6d4'] },
      links: { color: '#7c3aed', distance: 140, enable: true, opacity: 0.15, width: 1 },
      move: { enable: true, speed: 0.6, direction: 'none', random: true, straight: false, outModes: { default: 'bounce' } },
      number: { density: { enable: true, area: 900 }, value: 60 },
      opacity: { value: 0.4 },
      shape: { type: 'circle' },
      size: { value: { min: 1, max: 3 } },
    },
    detectRetina: true,
  });
})();

/* ================================================================
   FAQ accordion
   ================================================================ */
(function initFAQ() {
  const items = qsa('.faq-item');

  items.forEach(item => {
    const btn    = qs('.faq-btn', item);
    const answer = qs('.faq-answer', item);
    if (!btn || !answer) return;

    btn.addEventListener('click', () => {
      const isOpen = btn.getAttribute('aria-expanded') === 'true';

      items.forEach(other => {
        if (other !== item) {
          qs('.faq-btn', other)?.setAttribute('aria-expanded', 'false');
          qs('.faq-answer', other)?.classList.remove('open');
        }
      });

      btn.setAttribute('aria-expanded', !isOpen);
      answer.classList.toggle('open', !isOpen);
    });
  });
})();

/* ================================================================
   Ticker — rolagem infinita
   ================================================================ */
(function initTicker() {
  const track = qs('#ticker-track');
  if (!track) return;

  track.innerHTML += track.innerHTML;

  let pos = 0;
  const speed = 0.6;
  const halfWidth = track.scrollWidth / 2;

  (function animateTicker() {
    pos -= speed;
    if (Math.abs(pos) >= halfWidth) pos = 0;
    track.style.transform = `translateX(${pos}px)`;
    requestAnimationFrame(animateTicker);
  })();
})();

/* ================================================================
   Formulário de contato → WhatsApp
   ================================================================ */
(function initForm() {
  const form    = qs('#contact-form');
  const status  = qs('#form-status');
  const success = qs('#form-success');
  const btn     = qs('#submit-btn');
  if (!form) return;

  qsa('.form-input', form).forEach(input => {
    input.addEventListener('focus', () => { if (status) status.textContent = '● digitando...'; });
    input.addEventListener('blur',  () => { if (status) status.textContent = '● pronto'; });
  });

  function validate() {
    const name     = qs('#name', form).value.trim();
    const business = qs('#business', form).value.trim();
    const service  = qs('#service', form).value;

    if (!name)     { showError('Por favor, informe seu nome.'); return false; }
    if (!business) { showError('Por favor, informe o tipo de negócio.'); return false; }
    if (!service)  { showError('Selecione o que você precisa.'); return false; }
    return true;
  }

  function showError(msg) {
    if (status) { status.textContent = '● erro: ' + msg; status.style.color = '#f87171'; }
  }

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    if (!validate()) return;

    const name     = qs('#name', form).value.trim();
    const business = qs('#business', form).value.trim();
    const service  = qs('#service', form).value;

    btn.disabled = true;
    qs('.btn-text', btn).textContent = 'Enviando...';
    if (status) status.textContent = '● enviando...';

    const serviceLabels = {
      landing:    'Landing Page',
      ecommerce:  'Loja Virtual',
      system:     'Sistema Web',
      other:      'ajuda em outro tipo de projeto',
    };
    const introTexts = {
      landing:   'queria uma Landing Page profissional pro meu negócio',
      ecommerce: 'queria montar uma Loja Virtual pra começar a vender meus produtos online',
      system:    'preciso de um Sistema Web personalizado pra organizar meus processos',
      other:     'tenho um projeto diferente e queria saber se você consegue me ajudar',
    };

    const waMsg = encodeURIComponent(
      `Olá Danilo! Vi seu site e fiquei interessado. Me chamo ${name}, tenho um negócio de ${business} e estou precisando de uma ${serviceLabels[service] || 'projeto'}. ${introTexts[service] || 'queria um orçamento'}. Podemos conversar sobre isso?`
    );

    setTimeout(() => {
      if (success) success.hidden = false;
      if (status) { status.textContent = '● enviado ✓'; status.style.color = '#4ade80'; }
      window.open(`https://wa.me/5511942623115?text=${waMsg}`, '_blank', 'noopener noreferrer');
      form.reset();
      btn.disabled = false;
      qs('.btn-text', btn).textContent = 'Solicitar orçamento';
    }, 800);
  });
})();

/* ================================================================
   Footer — ano dinâmico
   ================================================================ */
const yearEl = qs('#year');
if (yearEl) yearEl.textContent = new Date().getFullYear();

/* ================================================================
   Scroll suave com offset do header fixo
   ================================================================ */
qsa('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', function(e) {
    const target = document.querySelector(this.getAttribute('href'));
    if (!target) return;
    e.preventDefault();
    const header = qs('#header');
    const offset = header ? header.offsetHeight + 20 : 80;
    const y = target.getBoundingClientRect().top + window.scrollY - offset;
    window.scrollTo({ top: y, behavior: 'smooth' });
  });
});

/* ================================================================
   Terminal — animação das linhas ao carregar
   ================================================================ */
(function initTerminal() {
  if (prefersReducedMotion) return;
  const lines = qsa('.t-line');
  lines.forEach((line, i) => {
    line.style.opacity = '0';
    line.style.transform = 'translateX(-8px)';
    line.style.transition = 'opacity 0.4s ease, transform 0.4s ease';
    setTimeout(() => {
      line.style.opacity = '1';
      line.style.transform = 'translateX(0)';
    }, 300 + i * 100);
  });
})();
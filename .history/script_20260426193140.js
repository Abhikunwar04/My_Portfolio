/* ============================================================
   ABHI KUNWAR PORTFOLIO — SCRIPT.JS  (v3 CLEAN BUILD)
   ============================================================ */

gsap.registerPlugin(ScrollTrigger);

if ('scrollRestoration' in history) {
  history.scrollRestoration = 'manual';
}

/* ============================================================
   0.  GLOBALS
   ============================================================ */
const clamp   = (v, a, b) => Math.max(a, Math.min(b, v));
const easeOut = t => 1 - Math.pow(1 - t, 3);


/* ============================================================
   1.  CANVAS HERO EFFECT
   ============================================================ */
const heroCanvas = document.getElementById('heroCanvas');
const ctx        = heroCanvas.getContext('2d');

const hero    = new Image();
const nameImg = new Image();
const bottom  = new Image();

hero.src    = 'hero.jpg';
nameImg.src = 'name.png';
bottom.src  = 'bottom.png';

let loadedCount = 0;
let canvasReady = false;

function checkImagesLoaded() {
  loadedCount++;
  if (loadedCount >= 3) { canvasReady = true; canvasInit(); }
}

hero.onload    = checkImagesLoaded;
nameImg.onload = checkImagesLoaded;
bottom.onload  = checkImagesLoaded;
function handleError() {
  console.warn("Image failed to load");
  checkImagesLoaded();
}

hero.onerror = nameImg.onerror = bottom.onerror = handleError;
setTimeout(() => {
  if (!canvasReady && loadedCount < 3) {
    canvasReady = true;
    canvasInit();
  }
}, 1200);

/* ---------- SMOOTH SCROLL LERP ---------- */
const BASE_LERP = 0.08;
let smoothP  = 0;
let rawP     = 0;
let lastTime = 0;

/* ---------- OFFSCREEN MASK CANVAS ---------- */
let mc   = null;
let mctx = null;

function ensureMaskCanvas(W, H, dpr) {
  const needW = Math.ceil(W * dpr);
  const needH = Math.ceil(H * dpr);
  if (!mc || mc.width !== needW || mc.height !== needH) {
    mc = document.createElement('canvas');
    mc.width = needW; mc.height = needH;
    mctx = mc.getContext('2d');
  }
}

/* ---------- STATE ---------- */
let heroTextSettled = false;
let mainSettled     = false;

/* ---------- CANVAS RESIZE ---------- */
function canvasResize() {
  const dpr = window.devicePixelRatio || 1;
  heroCanvas.width  = window.innerWidth  * dpr;
  heroCanvas.height = window.innerHeight * dpr;
  heroCanvas.style.width  = window.innerWidth  + 'px';
  heroCanvas.style.height = window.innerHeight + 'px';
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  mc = null;
  if (canvasReady) canvasDraw();
}
window.addEventListener('resize', canvasResize, { passive: true });

/* ---------- SCROLL PROGRESS ---------- */
function getScrollProgress() {
  const hs = document.getElementById('heroScroll');
  if (!hs) return 0;
  const total = hs.offsetHeight - window.innerHeight;
  return total <= 0 ? 0 : clamp(-hs.getBoundingClientRect().top / total, 0, 1);
}

/* ---------- HERO TEXT ---------- */
function updateHeroText(p) {
  const heroText = document.getElementById('hero');
  if (!heroText) return;
  if (p > 0.95) {
    heroText.style.opacity = '1';
    heroText.classList.add('reveal');
  } else {
    heroText.style.opacity = '0';
  }
  const resume = document.querySelector('.resume-wrapper');
  if (resume) {
    heroText.style.zIndex = resume.getBoundingClientRect().top < window.innerHeight * 0.9 ? '1' : '10';
  }
}

/* ---------- DRAW ---------- */
function canvasDraw() {
  if (!canvasReady) return;
  const W = window.innerWidth, H = window.innerHeight;
  const p = smoothP * 1.3;
  const dpr = window.devicePixelRatio || 1;

  ctx.clearRect(0, 0, W, H);

  const imgAR = (hero.naturalWidth || W) / (hero.naturalHeight || H);
  let imgW = W, imgH = W / imgAR;
  if (imgH < H) { imgH = H; imgW = imgH * imgAR; }

  const zoom = 1.35 + (1.00 - 1.35) * easeOut(p);
  const scaledW = imgW * zoom, scaledH = imgH * zoom;
  const baseX = (W - scaledW) * 0.5, baseY = (H - scaledH) * 0.45;

  ctx.drawImage(hero, baseX, baseY - p * scaledH * 0.06, scaledW, scaledH);

  const nameW = W;
  const nameH = nameW * ((nameImg.naturalHeight || 200) / (nameImg.naturalWidth || W));
  const textY = (H * 0.85 - nameH / 2) + ((H * 0.50 - nameH / 2) - (H * 0.85 - nameH / 2)) * easeOut(clamp((p - 0.05) / 0.7, 0, 1));
  const nameAlpha = clamp((p - 0.05) / 0.3, 0, 1);

  ensureMaskCanvas(W, H, dpr);
  mctx.clearRect(0, 0, mc.width, mc.height);
  mctx.save();
  mctx.scale(dpr, dpr);
  mctx.globalAlpha = nameAlpha;
  mctx.drawImage(nameImg, (W - nameW) / 2, textY, nameW, nameH);
  const bottomShiftY = p * scaledH * 0.12;
  mctx.globalCompositeOperation = 'destination-out';
  mctx.globalAlpha = 1;
  mctx.drawImage(bottom, baseX, baseY - bottomShiftY, scaledW, scaledH);
  mctx.restore();

  ctx.drawImage(mc, 0, 0, mc.width, mc.height, 0, 0, W, H);
  ctx.drawImage(bottom, baseX, baseY - bottomShiftY, scaledW, scaledH);

  /* mainContent slide-in */
  const main = document.getElementById('mainContent');
  if (main && !mainSettled) {
    if (p > 1.0) {
      const prog = clamp((p - 1.0) / 0.2, 0, 1);
      main.style.opacity   = prog;
      main.style.transform = `translateY(${(1 - prog) * 100}px)`;
    } else {
      main.style.opacity   = '0';
      main.style.transform = 'translateY(100px)';
    }
  }

  /* Vignettes */
  const vBot = ctx.createLinearGradient(0, H * 0.6, 0, H);
  vBot.addColorStop(0, 'rgba(0,0,0,0)');
  vBot.addColorStop(0.85, 'rgba(0,0,0,0.25)');
  vBot.addColorStop(1.0, 'rgba(0,0,0,0.47)');
  ctx.fillStyle = vBot; ctx.fillRect(0, 0, W, H);

  const vL = ctx.createLinearGradient(0, 0, W * 0.22, 0);
  vL.addColorStop(0, 'rgba(0,0,0,0.2)'); vL.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.fillStyle = vL; ctx.fillRect(0, 0, W, H);

  const vR = ctx.createLinearGradient(W, 0, W * 0.78, 0);
  vR.addColorStop(0, 'rgba(0,0,0,0.14)'); vR.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.fillStyle = vR; ctx.fillRect(0, 0, W, H);

  const darkAlpha = clamp((p - 0.5) / 0.6, 0, 0.4);
  ctx.fillStyle = `rgba(0,0,0,${darkAlpha})`; ctx.fillRect(0, 0, W, H);

  updateHeroText(p);
}

/* ---------- RAF LOOP ---------- */
function canvasTick(now) {
  const dt = lastTime ? Math.min(now - lastTime, 2 * 16.67) : 16.67;
  lastTime = now;
  rawP = getScrollProgress();
  smoothP += (rawP - smoothP) * (1 - Math.pow(1 - BASE_LERP, dt / 16.67));

  if (smoothP > 0.98 && !heroTextSettled) {
    heroTextSettled = true;
    mainSettled = true;
    const heroText = document.getElementById('hero');
    const main = document.getElementById('mainContent');
    if (heroText) heroText.classList.add('settled');
    if (main) {
      main.style.opacity   = '1';
      main.style.transform = 'translateY(0)';
      main.classList.add('settled');
    }
  }

  canvasDraw();
  requestAnimationFrame(canvasTick);
}

function canvasInit() { canvasResize(); requestAnimationFrame(canvasTick); }


/* ============================================================
   2.  NAVBAR SCROLL EFFECT + ACTIVE LINKS
   ============================================================ */
const topBar = document.getElementById('top-bar');
let lastScroll = 0;

window.addEventListener('scroll', () => {
  const cur = window.pageYOffset;
  if (!topBar) return;
  topBar.classList.toggle('scrolled', cur > 20);
  topBar.classList.toggle('hide', cur > lastScroll && cur > 80);
  lastScroll = Math.max(cur, 0);
  updateActiveNav();
}, { passive: true });

function updateActiveNav() {
  const navH = topBar ? topBar.offsetHeight : 70;
  const sections = ['about', 'skills', 'projects', 'contact'];
  let current = '';
  sections.forEach(id => {
    const el = document.getElementById(id);
    if (!el) return;
    const scrollPos = window.scrollY + navH + window.innerHeight * 0.3;
if (scrollPos >= el.offsetTop) current = id;
  });
  document.querySelectorAll('.nav-links a').forEach(a => {
    a.classList.toggle('active-link', a.getAttribute('href') === '#' + current);
  });
}


/* ============================================================
   3.  NAVBAR CLICK — BUG-FREE SCROLL
       Root cause: hero scroll zone ka height account nahi tha
       Fix: hero scroll se pehle jump karo, phir section scroll
   ============================================================ */
document.querySelectorAll('a[href^="#"]').forEach(link => {
  link.addEventListener('click', function(e) {
    const href = this.getAttribute('href');
    if (!href || href === '#') return;
    const target = document.querySelector(href);
    if (!target) return;
    e.preventDefault();

    if (href === '#home') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    const navH = topBar ? topBar.offsetHeight : 70;
    const heroScrollEl = document.getElementById('heroScroll');
    const heroScrollEnd = heroScrollEl
      ? heroScrollEl.offsetTop + heroScrollEl.offsetHeight
      : 0;

    const doScroll = () => {
      const targetTop =
  target.getBoundingClientRect().top +
  window.scrollY -
  navH;

window.scrollTo({ top: targetTop, behavior: 'smooth' });
    };

    if (window.scrollY < heroScrollEnd - window.innerHeight * 0.3) {
      /* Jump instantly past hero scroll zone */
      window.scrollTo({ top: heroScrollEnd, behavior: 'auto' });
      /* Two rAF frames to let layout recalculate */
      requestAnimationFrame(() => requestAnimationFrame(() => requestAnimationFrame(doScroll)));
    } else {
      doScroll();
    }
  });
});


/* ============================================================
   4.  HAMBURGER
   ============================================================ */
const hamburger = document.getElementById('hamburger');
const navLinks  = document.getElementById('nav-links');

if (hamburger && navLinks) {
  hamburger.addEventListener('click', () => navLinks.classList.toggle('active'));
  navLinks.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => navLinks.classList.remove('active'));
  });
}


/* ============================================================
   5.  CUSTOM CURSOR
   ============================================================ */
const dot  = document.getElementById('cursorDot');
const ring = document.getElementById('cursorRing');

if (dot && ring) {
  let mouseX = 0, mouseY = 0, ringX = 0, ringY = 0, velX = 0, velY = 0;
  const stiffness = 0.20, damping = 0.72;

  document.addEventListener('mousemove', (e) => {
    mouseX = e.clientX; mouseY = e.clientY;
    dot.style.transform = `translate(${mouseX}px, ${mouseY}px)`;
  });

  (function animateRing() {
    velX += (mouseX - ringX) * stiffness;
    velY += (mouseY - ringY) * stiffness;
    velX *= damping; velY *= damping;
    ringX += velX; ringY += velY;
    ring.style.transform = `translate(${ringX}px, ${ringY}px)`;
    requestAnimationFrame(animateRing);
  })();

  document.querySelectorAll('a, button, .skill, .project-card, .highlight').forEach(el => {
    el.addEventListener('mouseenter', () => ring.classList.add('hovered'));
    el.addEventListener('mouseleave', () => ring.classList.remove('hovered'));
  });

  document.addEventListener('mousedown', () => ring.classList.add('click'));
  document.addEventListener('mouseup',   () => ring.classList.remove('click'));
}


/* ============================================================
   6.  DOM READY — AOS + EmailJS + Typing
   ============================================================ */
window.addEventListener('DOMContentLoaded', () => {

  if (typeof AOS !== 'undefined') {
    AOS.init({ duration: 700, once: true, offset: 80 });
  }

  if (window.emailjs) emailjs.init('vI-NhtzREwXqZQq5N');

  const form = document.getElementById('feedback-form');
  if (form) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const name    = form.from_name.value.trim();
      const email   = form.from_email.value.trim();
      const message = form.message.value.trim();
      if (!name || !email || !message) { alert('Please fill all fields'); return; }
      if (!/^[a-zA-Z0-9._%+-]+@gmail\.com$/.test(email)) { alert('Enter a valid Gmail address'); return; }
      if (!window.emailjs) { alert('Email service not loaded'); return; }
      const btn = form.querySelector("button[type='submit']");
      btn.textContent = 'Sending…'; btn.disabled = true;
      emailjs.sendForm('service_71kywa9', 'template_lh1bgai', form)
        .then(() => { alert('Message sent!'); form.reset(); })
        .catch(() => alert('Failed. Try again.'))
        .finally(() => { btn.innerHTML = '<i class="fas fa-paper-plane"></i> Send Message'; btn.disabled = false; });
    });
  }

  document.querySelectorAll('.skill').forEach(skill => {
    const color = skill.getAttribute('data-color');
    if (color) skill.style.setProperty('--skill-color', color);
  });

  /* Typing effect */
  let typingStarted = false;
  function initTypingEffect() {
    if (typingStarted) return;
    typingStarted = true;
    const heroP = document.querySelector('.hero-text p');
    if (!heroP) return;
    const phrases = ['IT Learner', 'Frontend Developer', 'Creative Builder', 'UI/UX Enthusiast'];
    let pi = 0, ci = 0, deleting = false;
    function type() {
      const cur = phrases[pi];
      if (!deleting) {
        heroP.textContent = cur.slice(0, ci + 1); ci++;
        if (ci === cur.length) { deleting = true; setTimeout(type, 1800); return; }
      } else {
        heroP.textContent = cur.slice(0, ci - 1); ci--;
        if (ci === 0) { deleting = false; pi = (pi + 1) % phrases.length; }
      }
      setTimeout(type, deleting ? 45 : 80);
    }
    type();
  }

  const heroEl = document.getElementById('hero');
  if (heroEl) {
    if (heroEl.classList.contains('reveal') || heroEl.classList.contains('settled')) {
      initTypingEffect();
    } else {
      const obs = new MutationObserver(() => {
        if (heroEl.classList.contains('reveal') || heroEl.classList.contains('settled')) {
          initTypingEffect(); obs.disconnect();
        }
      });
      obs.observe(heroEl, { attributes: true, attributeFilter: ['class'] });
    }
  }
});


/* ============================================================
   7.  SKILLS INFINITE SCROLL
   ============================================================ */
window.addEventListener('load', () => {
  const track   = document.getElementById('skillsTrack');
  const wrapper = document.querySelector('.skills-wrapper');
  if (!track || !wrapper) return;

  if (!track.dataset.tripled) {
    track.innerHTML += track.innerHTML + track.innerHTML;
    track.dataset.tripled = '1';
  }

  const CARD_WIDTH = 130;
  const singleSetWidth = (track.children.length / 3) * CARD_WIDTH;
  let offset = 0, paused = false;

  wrapper.addEventListener('mouseenter', () => paused = true);
  wrapper.addEventListener('mouseleave', () => paused = false);

  (function animate() {
    if (!paused) {
      offset += 0.5;
      if (offset >= singleSetWidth) offset -= singleSetWidth;
      track.style.transform = `translateX(-${offset}px)`;
    }
    requestAnimationFrame(animate);
  })();
});


/* ============================================================
   8.  GSAP SCROLL ANIMATIONS (once: true — no flicker)
   ============================================================ */
gsap.from('.about-text', {
  scrollTrigger: { trigger: '.about-section', start: 'top 82%', once: true },
  opacity: 0, y: 50, duration: 0.9, ease: 'power3.out'
});
gsap.from('.about-lottie.left', {
  scrollTrigger: { trigger: '.about-section', start: 'top 82%', once: true },
  opacity: 0, x: -80, duration: 1.0, ease: 'power3.out'
});
gsap.from('.about-lottie.right', {
  scrollTrigger: { trigger: '.about-section', start: 'top 82%', once: true },
  opacity: 0, x: 80, duration: 1.0, ease: 'power3.out'
});
gsap.from('.project-card', {
  scrollTrigger: { trigger: '#projects', start: 'top 82%', once: true },
  opacity: 0, y: 60, stagger: 0.15, duration: 0.8, ease: 'power3.out'
});
gsap.from('.contact-form-wrapper', {
  scrollTrigger: { trigger: '#contact', start: 'top 82%', once: true },
  opacity: 0, y: 40, duration: 0.9, ease: 'power3.out'
});
gsap.from('.resume-wrapper', {
  scrollTrigger: { trigger: '.resume-wrapper', start: 'top 85%', once: true },
  opacity: 0, y: 30, duration: 0.7, ease: 'power2.out'
});


/* ============================================================
   9.  SCROLL-TO-TOP BUTTON
   ============================================================ */
(function initScrollTop() {
  const btn = document.createElement('button');
  btn.id = 'scrollTopBtn';
  btn.innerHTML = '<i class="fas fa-chevron-up"></i>';
  btn.setAttribute('aria-label', 'Scroll to top');
  document.body.appendChild(btn);
  window.addEventListener('scroll', () => btn.classList.toggle('visible', window.scrollY > 600), { passive: true });
  btn.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
})();


/* ============================================================
   10. TILT + GLOW on Project Cards
   ============================================================ */
(function initTilt() {
  document.querySelectorAll('.project-card').forEach(card => {
    card.addEventListener('mousemove', (e) => {
      const rect = card.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width  - 0.5;
      const y = (e.clientY - rect.top)  / rect.height - 0.5;
      card.style.transform = `perspective(700px) rotateY(${(x * 10).toFixed(2)}deg) rotateX(${(-y * 8).toFixed(2)}deg) translateY(-6px)`;
      card.style.setProperty('--mx', ((e.clientX - rect.left) / rect.width * 100).toFixed(1) + '%');
      card.style.setProperty('--my', ((e.clientY - rect.top)  / rect.height * 100).toFixed(1) + '%');
    });
    card.addEventListener('mouseleave', () => { card.style.transform = ''; });
  });
})();


/* ============================================================
   11. CINEMATIC SECTION BACKGROUNDS
       Har section ka apna dark cinematic atmosphere
   ============================================================ */
(function initCinematicBg() {
  const sectionCfg = [
    {
      selector: '.about-section',
      base: ['#07060f', '#060a18', '#07080a'],
      accents: [
        { x: 0.85, y: 0.15, r: 550, c: 'rgba(35,0,90,0.30)' },
        { x: 0.05, y: 0.75, r: 420, c: 'rgba(0,30,100,0.20)' }
      ]
    },
    {
      selector: '.skills-section',
      base: ['#060810', '#04050c', '#050810'],
      accents: [
        { x: 0.50, y: 0.50, r: 620, c: 'rgba(0,50,120,0.16)' },
        { x: 0.05, y: 0.10, r: 300, c: 'rgba(0,90,70,0.11)' }
      ]
    },
    {
      selector: '#projects',
      base: ['#050908', '#060808', '#07060c'],
      accents: [
        { x: 0.90, y: 0.35, r: 520, c: 'rgba(0,70,50,0.17)' },
        { x: 0.10, y: 0.80, r: 370, c: 'rgba(55,0,90,0.14)' }
      ]
    },
    {
      selector: '.feedback-section',
      base: ['#050710', '#060708', '#060510'],
      accents: [
        { x: 0.50, y: 0.25, r: 720, c: 'rgba(0,25,80,0.24)' },
        { x: 0.88, y: 0.88, r: 320, c: 'rgba(75,0,55,0.14)' }
      ]
    }
  ];

  sectionCfg.forEach(cfg => {
    const el = document.querySelector(cfg.selector);
    if (!el) return;

    el.style.position = 'relative';
    el.style.overflow = 'hidden';

    const cv = document.createElement('canvas');
    cv.style.cssText = 'position:absolute;inset:0;width:100%;height:100%;pointer-events:none;z-index:0;';
    el.insertBefore(cv, el.firstChild);

    function draw() {
      const W = el.offsetWidth || window.innerWidth;
      const H = el.offsetHeight || 600;
      cv.width = W; cv.height = H;
      const c = cv.getContext('2d');

      /* Base gradient */
      const bg = c.createLinearGradient(0, 0, W * 0.5, H);
      bg.addColorStop(0,   cfg.base[0]);
      bg.addColorStop(0.5, cfg.base[1]);
      bg.addColorStop(1,   cfg.base[2]);
      c.fillStyle = bg; c.fillRect(0, 0, W, H);

      /* Accent glows */
      cfg.accents.forEach(a => {
        const g = c.createRadialGradient(a.x * W, a.y * H, 0, a.x * W, a.y * H, a.r);
        g.addColorStop(0, a.c); g.addColorStop(1, 'rgba(0,0,0,0)');
        c.fillStyle = g; c.fillRect(0, 0, W, H);
      });

      /* Top/bottom vignette */
      const tv = c.createLinearGradient(0, 0, 0, H);
      tv.addColorStop(0,   'rgba(0,0,0,0.5)');
      tv.addColorStop(0.12, 'rgba(0,0,0,0)');
      tv.addColorStop(0.88, 'rgba(0,0,0,0)');
      tv.addColorStop(1,   'rgba(0,0,0,0.55)');
      c.fillStyle = tv; c.fillRect(0, 0, W, H);

      /* Side vignettes */
      const lv = c.createLinearGradient(0, 0, W * 0.14, 0);
      lv.addColorStop(0, 'rgba(0,0,0,0.35)'); lv.addColorStop(1, 'rgba(0,0,0,0)');
      c.fillStyle = lv; c.fillRect(0, 0, W, H);

      const rv = c.createLinearGradient(W, 0, W * 0.86, 0);
      rv.addColorStop(0, 'rgba(0,0,0,0.30)'); rv.addColorStop(1, 'rgba(0,0,0,0)');
      c.fillStyle = rv; c.fillRect(0, 0, W, H);
    }

    draw();
    window.addEventListener('resize', draw, { passive: true });
    /* Redraw once content loads (lottie expands height) */
    setTimeout(draw, 800);
  });
})();


/* ============================================================
   12. MOUSE REVEAL — CONSTELLATION EFFECT
   ============================================================ */
(function initMouseReveal() {
  const main = document.getElementById('mainContent');
  if (!main) return;

  const canvas = document.createElement('canvas');
  canvas.id = 'revealCanvas';
  canvas.style.cssText = 'position:fixed;inset:0;width:100%;height:100%;pointer-events:none;z-index:19;opacity:0;transition:opacity 0.6s ease;';
  document.body.insertBefore(canvas, main);
  const rctx = canvas.getContext('2d');

  let W = window.innerWidth, H = window.innerHeight;
  let mx = -999, my = -999;
  let particles = [];
  let frameCount = 0;
  let isActive = false;
  let rafStarted = false;

  function resize() { W = canvas.width = window.innerWidth; H = canvas.height = window.innerHeight; }
  resize();
  window.addEventListener('resize', resize, { passive: true });

  class Particle {
    constructor(x, y) {
      this.x = x; this.y = y;
      this.vx = (Math.random() - 0.5) * 1.5;
      this.vy = (Math.random() - 0.5) * 1.5 - 0.5;
      this.life = 1;
      this.decay = 0.018 + Math.random() * 0.01;
      this.size = 1.2 + Math.random() * 2;
      this.hue = 180 + Math.random() * 60;
    }
    update() { this.x += this.vx; this.y += this.vy; this.vy += 0.025; this.life -= this.decay; }
    draw(c) {
      c.save();
      c.globalAlpha = Math.max(0, this.life) * 0.75;
      c.beginPath();
      c.arc(this.x, this.y, Math.max(0, this.size * this.life), 0, Math.PI * 2);
      c.fillStyle = `hsl(${this.hue},100%,70%)`;
      c.fill();
      c.restore();
    }
  }

  const NODES = Array.from({ length: 55 }, () => ({
    x: Math.random(), y: Math.random(),
    vx: (Math.random() - 0.5) * 0.00015,
    vy: (Math.random() - 0.5) * 0.00015,
    r: 0.8 + Math.random() * 1.4
  }));

  function drawReveal() {
    requestAnimationFrame(drawReveal);
    if (!isActive) return;

    rctx.clearRect(0, 0, W, H);

    const mRect = main.getBoundingClientRect();
    const inMain = my > mRect.top && my < mRect.bottom && mx > 0 && mx < W;
    if (!inMain) return;

    frameCount++;

    /* Spotlight glow */
    const sp = rctx.createRadialGradient(mx, my, 0, mx, my, 240);
    sp.addColorStop(0,   'rgba(0,210,255,0.045)');
    sp.addColorStop(0.45,'rgba(0,80,180,0.02)');
    sp.addColorStop(1,   'rgba(0,0,0,0)');
    rctx.fillStyle = sp; rctx.fillRect(0, 0, W, H);

    /* Drift nodes */
    NODES.forEach(n => {
      n.x += n.vx; n.y += n.vy;
      if (n.x < 0) n.x = 1; if (n.x > 1) n.x = 0;
      if (n.y < 0) n.y = 1; if (n.y > 1) n.y = 0;
    });

    /* Draw constellation near cursor */
    NODES.forEach((n, i) => {
      const nx = n.x * W;
      const ny = (n.y * mRect.height) + mRect.top;
      const dC = Math.hypot(mx - nx, my - ny);
      if (dC > 220) return;

      const alpha = 1 - dC / 220;

      rctx.save();
      rctx.globalAlpha = alpha * 0.6;
      rctx.beginPath();
      rctx.arc(nx, ny, n.r, 0, Math.PI * 2);
      rctx.fillStyle = '#00e5ff';
      rctx.shadowBlur = 5;
      rctx.shadowColor = '#00e5ff';
      rctx.fill();
      rctx.restore();

      NODES.slice(i + 1).forEach(m => {
        const mx2 = m.x * W;
        const my2 = (m.y * mRect.height) + mRect.top;
        const d = Math.hypot(nx - mx2, ny - my2);
        if (d < 130) {
          rctx.save();
          rctx.globalAlpha = alpha * (1 - d / 130) * 0.35;
          rctx.strokeStyle = 'rgba(0,160,255,0.8)';
          rctx.lineWidth = 0.5;
          rctx.beginPath(); rctx.moveTo(nx, ny); rctx.lineTo(mx2, my2); rctx.stroke();
          rctx.restore();
        }
      });

      if (dC < 90) {
        rctx.save();
        rctx.globalAlpha = (1 - dC / 90) * 0.28;
        rctx.strokeStyle = 'rgba(0,229,255,0.5)';
        rctx.lineWidth = 0.7;
        rctx.setLineDash([2, 6]);
        rctx.beginPath(); rctx.moveTo(mx, my); rctx.lineTo(nx, ny); rctx.stroke();
        rctx.setLineDash([]);
        rctx.restore();
      }
    });

    /* Particles */
    if (frameCount % 4 === 0) {
      particles.push(new Particle(mx + (Math.random()-0.5)*6, my + (Math.random()-0.5)*6));
    }
    particles = particles.filter(p => p.life > 0);
    particles.forEach(p => { p.update(); p.draw(rctx); });

    /* Cursor pulse rings */
    const pr = 30 + Math.sin(frameCount * 0.07) * 5;
    rctx.save();
    rctx.globalAlpha = 0.09;
    rctx.strokeStyle = '#00e5ff';
    rctx.lineWidth = 1;
    rctx.beginPath(); rctx.arc(mx, my, pr, 0, Math.PI * 2); rctx.stroke();
    rctx.globalAlpha = 0.045;
    rctx.beginPath(); rctx.arc(mx, my, pr * 1.8, 0, Math.PI * 2); rctx.stroke();
    rctx.restore();
  }

  drawReveal();

  function activate() { canvas.style.opacity = '1'; isActive = true; }

  new MutationObserver(() => {
    if (main.classList.contains('settled') || parseFloat(main.style.opacity || 0) > 0.5) activate();
  }).observe(main, { attributes: true, attributeFilter: ['class', 'style'] });

  window.addEventListener('scroll', () => {
    if (window.scrollY > window.innerHeight * 1.5) activate();
  }, { passive: true });

  document.addEventListener('mousemove', (e) => { mx = e.clientX; my = e.clientY; });
})();


/* ============================================================
   13. MAGNETIC BUTTONS
   ============================================================ */
(function initMagnetic() {
  function magnetic(els, strength) {
    els.forEach(el => {
      el.addEventListener('mousemove', (e) => {
        const r = el.getBoundingClientRect();
        const dx = (e.clientX - (r.left + r.width  / 2)) / r.width;
        const dy = (e.clientY - (r.top  + r.height / 2)) / r.height;
        el.style.transform = `translate(${dx * strength}px, ${dy * strength}px)`;
      });
      el.addEventListener('mouseleave', () => {
        el.style.transition = 'transform 0.5s cubic-bezier(0.34,1.56,0.64,1)';
        el.style.transform = '';
        setTimeout(() => el.style.transition = '', 500);
      });
    });
  }
  magnetic(document.querySelectorAll('.cta-btn, .resume-btn'), 8);
  magnetic(document.querySelectorAll('.highlight'), 5);
  magnetic(document.querySelectorAll('.social-link'), 6);
})();


/* ============================================================
   14. SECTION REVEAL — top line + heading word split
   ============================================================ */
(function initSectionReveal() {
  document.querySelectorAll(
    '#mainContent .section, #mainContent .about-section, #mainContent .skills-section, #mainContent .feedback-section'
  ).forEach(sec => {
    const line = document.createElement('div');
    line.className = 'section-line';
    sec.prepend(line);
    new IntersectionObserver(([e], obs) => {
      if (e.isIntersecting) { line.classList.add('drawn'); obs.disconnect(); }
    }, { threshold: 0.05 }).observe(sec);
  });

  document.querySelectorAll(
    '.section h2, .about-section h2, .skills-section h2, #projects h2, .contact-form-wrapper h2'
  ).forEach(h => {
    const words = h.textContent.trim().split(' ');
    h.innerHTML = words.map(w => `<span class="h-word">${w}&nbsp;</span>`).join('');
    h.classList.add('split-heading');
    new IntersectionObserver(([e], obs) => {
      if (e.isIntersecting) { h.classList.add('revealed'); obs.disconnect(); }
    }, { threshold: 0.3 }).observe(h);
  });
})();


/* ============================================================
   15. INIT — scroll to top on load
   ============================================================ */
window.addEventListener('load', () => {
  window.scrollTo({ top: 0, behavior: 'instant' });
  setTimeout(() => window.dispatchEvent(new Event('resize')), 300);
  document.body.style.overflowAnchor = 'none';
});
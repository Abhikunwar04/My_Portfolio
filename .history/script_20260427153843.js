/* ============================================================
   ABHI KUNWAR PORTFOLIO — CLEAN PRODUCTION SCRIPT
   ============================================================ */

gsap.registerPlugin(ScrollTrigger);

/* ===================== RESET SCROLL ===================== */
if ('scrollRestoration' in history) history.scrollRestoration = 'manual';
window.scrollTo(0, 0);
window.addEventListener('beforeunload', () => window.scrollTo(0, 0));

/* ===================== HERO CANVAS ===================== */
let entryProgress = 0;
let entryDone = false;

const heroCanvas = document.getElementById('heroCanvas');
const ctx = heroCanvas?.getContext('2d');

const hero = new Image();
const nameImg = new Image();
const bottom = new Image();

hero.src = 'hero.jpg';
nameImg.src = 'name.png';
bottom.src = 'bottom.png';

let loaded = 0;
let canvasReady = false;

function initCanvas() {
  canvasReady = true;
  requestAnimationFrame(loop);
}

function checkLoad() {
  loaded++;
  if (loaded >= 3) initCanvas();
}

hero.onload = checkLoad;
nameImg.onload = checkLoad;
bottom.onload = checkLoad;

/* fallback */
setTimeout(() => {
  if (!canvasReady) initCanvas();
}, 1200);

/* ===================== HELPERS ===================== */
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
const easeOut = t => 1 - Math.pow(1 - t, 3);

/* ===================== SCROLL ===================== */
let smoothP = 0;
let rawP = 0;
let lastTime = 0;

function getScroll() {
  const el = document.getElementById('heroScroll');
  if (!el) return 0;

  const rect = el.getBoundingClientRect();
  const total = el.offsetHeight - innerHeight;
  const scrolled = -rect.top;

  return total > 0 ? clamp(scrolled / total, 0, 1) : 0;
}

/* ===================== RESIZE ===================== */
function resize() {
  if (!heroCanvas) return;

  const dpr = devicePixelRatio || 1;
  heroCanvas.width = innerWidth * dpr;
  heroCanvas.height = innerHeight * dpr;

  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
}
window.addEventListener('resize', resize);
resize();

/* ===================== HERO TEXT ===================== */
function updateHeroText(p) {
  const el = document.getElementById('hero');
  if (!el) return;

  el.style.opacity = p > 0.95 ? 1 : 0;

  const resume = document.querySelector('.resume-wrapper');
  if (resume) {
    const r = resume.getBoundingClientRect();
    el.style.zIndex = r.top < innerHeight * 0.9 ? 1 : 10;
  }
}

/* ===================== DRAW ===================== */
function draw() {
  if (!canvasReady || !ctx) return;

  const W = innerWidth;
  const H = innerHeight;
  const p = smoothP * 1.2;

  ctx.clearRect(0, 0, W, H);

  const ar = (hero.naturalWidth || W) / (hero.naturalHeight || H);
  let iw = W;
  let ih = iw / ar;
  if (ih < H) { ih = H; iw = ih * ar; }

  const zoom = 1.3 + (1 - 1.3) * easeOut(p);
  const sw = iw * zoom;
  const sh = ih * zoom;

  const x = (W - sw) / 2;
  const y = (H - sh) / 2;

  ctx.drawImage(hero, x, y, sw, sh);

  /* NAME */
  const nameW = W;
  const nameH = nameW * ((nameImg.naturalHeight || 1) / (nameImg.naturalWidth || 1));

  const finalY = H * 0.5 - nameH / 2;

  let ty = finalY;
  let alpha = 1;

  if (!entryDone) {
    ty = H * 1.2 + (finalY - H * 1.2) * easeOut(entryProgress);
    alpha = entryProgress;
  }

  ctx.globalAlpha = alpha;
  ctx.drawImage(nameImg, 0, ty, nameW, nameH);
  ctx.globalAlpha = 1;

  /* BOTTOM MASK */
  const bottomShift = p * sh * 0.1;
  ctx.drawImage(bottom, x, y - bottomShift, sw, sh);

  updateHeroText(p);
}

/* ===================== LOOP ===================== */
function loop(t) {
  const dt = lastTime ? Math.min(t - lastTime, 33) : 16;
  lastTime = t;

  /* entry animation */
  if (!entryDone) {
    entryProgress += 0.02;
    if (entryProgress >= 1) {
      entryProgress = 1;
      entryDone = true;
    }
  }

  /* scroll */
  rawP = getScroll();
  smoothP += (rawP - smoothP) * 0.08;

  draw();
  requestAnimationFrame(loop);
}

/* ===================== NAV ===================== */
const topBar = document.getElementById('top-bar');
let lastScroll = 0;

window.addEventListener('scroll', () => {
  const y = scrollY;

  if (topBar) {
    topBar.classList.toggle('scrolled', y > 20);
    topBar.classList.toggle('hide', y > lastScroll && y > 80);
  }

  lastScroll = y;
});

/* ===================== CURSOR ===================== */
const dot = document.getElementById('cursorDot');
const ring = document.getElementById('cursorRing');

if (dot && ring) {
  let mx = 0, my = 0, rx = 0, ry = 0;

  document.addEventListener('mousemove', e => {
    mx = e.clientX;
    my = e.clientY;
    dot.style.transform = `translate(${mx}px,${my}px)`;
  });

  (function anim() {
    rx += (mx - rx) * 0.15;
    ry += (my - ry) * 0.15;
    ring.style.transform = `translate(${rx}px,${ry}px)`;
    requestAnimationFrame(anim);
  })();
}

/* ===================== GSAP ===================== */
window.addEventListener('DOMContentLoaded', () => {
  if (typeof AOS !== 'undefined') AOS.init({ duration: 800, once: false });

  gsap.from('.project-card', {
    scrollTrigger: { trigger: '#projects', start: 'top 80%' },
    y: 60,
    opacity: 0,
    stagger: 0.15
  });
});

/* ===================== TILT ===================== */
document.querySelectorAll('.project-card').forEach(card => {
  card.addEventListener('mousemove', e => {
    const r = card.getBoundingClientRect();
    const x = (e.clientX - r.left) / r.width - 0.5;
    const y = (e.clientY - r.top) / r.height - 0.5;

    card.style.transform =
      `perspective(700px) rotateY(${x * 10}deg) rotateX(${-y * 10}deg)`;
  });

  card.addEventListener('mouseleave', () => {
    card.style.transform = '';
  });
});
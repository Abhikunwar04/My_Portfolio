/* ============================================================
   ABHI KUNWAR PORTFOLIO — FIXED SCRIPT.JS
   (Optimized + Stable Canvas + No Flicker)
   ============================================================ */

gsap.registerPlugin(ScrollTrigger);

/* ================= CANVAS ================= */
const heroCanvas = document.getElementById('heroCanvas');
const ctx = heroCanvas.getContext('2d');

const hero = new Image();
const nameImg = new Image();
const bottom = new Image();

hero.src = 'hero.jpg';
nameImg.src = 'name.png';
bottom.src = 'bottom.png';

let loaded = 0;
let ready = false;

/* preload safe */
function check() {
  loaded++;
  if (loaded >= 3) initCanvas();
}

hero.onload = check;
nameImg.onload = check;
bottom.onload = check;

/* fallback safety */
setTimeout(() => {
  if (!ready) initCanvas();
}, 2000);

/* ================= STATE ================= */
let smoothP = 0;
const LERP = 0.07;

/* IMPORTANT FIX: ONE CANVAS ONLY (NO PER FRAME CREATION) */
const mc = document.createElement('canvas');
const mctx = mc.getContext('2d');

/* ================= RESIZE ================= */
function resizeCanvas() {
  const dpr = window.devicePixelRatio || 1;

  heroCanvas.width = innerWidth * dpr;
  heroCanvas.height = innerHeight * dpr;

  heroCanvas.style.width = innerWidth + "px";
  heroCanvas.style.height = innerHeight + "px";

  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
}
window.addEventListener('resize', resizeCanvas);

/* ================= SCROLL PROGRESS ================= */
function getProgress() {
  const spacer = document.getElementById('scrollSpacer');
  if (!spacer) return 0;

  const max = spacer.offsetHeight - innerHeight;
  return max > 0 ? Math.min(Math.max(scrollY / max, 0), 1) : 0;
}

/* ================= HERO TEXT ================= */
function updateHeroText(p) {
  const el = document.getElementById('hero');
  if (!el) return;

  const alpha = Math.min(Math.max((p - 0.78) / 0.18, 0), 1);

  el.style.opacity = alpha;
  el.classList.toggle('reveal', alpha > 0.05);
}

/* ================= MAIN CONTENT ================= */
function updateMainContent(p) {
  const el = document.getElementById('mainContent');
  if (!el) return;

  const t = Math.min(Math.max((p - 0.68) / 0.32, 0), 1);
  const ease = 1 - Math.pow(1 - t, 3);

  el.style.transform = `translateY(${(1 - ease) * 80}px)`;
  el.style.opacity = ease;
}

/* ================= DRAW ================= */
function draw() {
  if (!ready) return;

  const W = innerWidth;
  const H = innerHeight;
  const p = smoothP;

  ctx.clearRect(0, 0, W, H);

  /* -------- HERO BACKGROUND -------- */
  const ar = hero.naturalWidth / hero.naturalHeight;
  let w = W, h = W / ar;
  if (h < H) { h = H; w = h * ar; }

  const zoom = 1.35 + (1 - 1.35) * (1 - Math.pow(1 - p, 3));

  const sw = w * zoom;
  const sh = h * zoom;

  const x = (W - sw) / 2;
  const y = (H - sh) / 2;

  ctx.drawImage(hero, x, y, sw, sh);

  /* -------- PARALLAX BOTTOM -------- */
  const bottomShift = p * sh * 0.12;

  /* -------- NAME OVERLAY -------- */
  const nameW = W;
  const nameH = nameW * (nameImg.naturalHeight / nameImg.naturalWidth);

  const nameY =
    (H * 0.85) +
    ((H * 0.5) - (H * 0.85)) * p;

  const alpha = Math.min(Math.max((p - 0.08) / 0.25, 0), 1);

  /* reuse canvas (NO recreate bug fixed) */
  mc.width = W;
  mc.height = H;

  mctx.clearRect(0, 0, W, H);
  mctx.globalAlpha = alpha;
  mctx.drawImage(nameImg, (W - nameW) / 2, nameY, nameW, nameH);

  /* mask bottom */
  mctx.globalCompositeOperation = "destination-out";
  mctx.drawImage(bottom, x, y - bottomShift, sw, sh);

  ctx.drawImage(mc, 0, 0);

  /* foreground bottom */
  ctx.drawImage(bottom, x, y - bottomShift, sw, sh);

  /* dark overlay */
  ctx.fillStyle = "rgba(0,0,0,0.55)";
  ctx.fillRect(0, 0, W, H);

  updateHeroText(p);
  updateMainContent(p);
}

/* ================= LOOP ================= */
function loop() {
  const p = getProgress();
  smoothP += (p - smoothP) * LERP;

  draw();
  requestAnimationFrame(loop);
}

/* ================= INIT ================= */
function initCanvas() {
  if (ready) return;
  ready = true;

  resizeCanvas();
  loop();
}

/* ============================================================
   NAVBAR
   ============================================================ */
const topBar = document.getElementById('top-bar');
let lastScroll = 0;

window.addEventListener('scroll', () => {
  const y = scrollY;

  if (!topBar) return;

  topBar.classList.toggle('scrolled', y > 20);
  topBar.classList.toggle('hide', y > lastScroll && y > 80);

  lastScroll = y;
}, { passive: true });

/* ============================================================
   HAMBURGER
   ============================================================ */
const hamburger = document.getElementById('hamburger');
const navLinks = document.getElementById('nav-links');

hamburger?.addEventListener('click', () => {
  navLinks.classList.toggle('active');
});

navLinks?.querySelectorAll('a').forEach(a =>
  a.addEventListener('click', () =>
    navLinks.classList.remove('active')
  )
);

/* ============================================================
   CUSTOM CURSOR
   ============================================================ */
const dot = document.getElementById("cursorDot");
const ring = document.getElementById("cursorRing");

let mx = 0, my = 0, rx = 0, ry = 0;

document.addEventListener("mousemove", e => {
  mx = e.clientX;
  my = e.clientY;

  dot.style.transform = `translate(${mx}px,${my}px)`;
});

function cursorLoop() {
  rx += (mx - rx) * 0.18;
  ry += (my - ry) * 0.18;

  ring.style.transform = `translate(${rx}px,${ry}px)`;

  requestAnimationFrame(cursorLoop);
}
cursorLoop();

/* hover effect */
document.querySelectorAll('a, button, .skill, .project-card')
  .forEach(el => {
    el.addEventListener('mouseenter', () =>
      ring.classList.add('hovered')
    );
    el.addEventListener('mouseleave', () =>
      ring.classList.remove('hovered')
    );
  });

/* ============================================================
   AOS + EMAILJS SAFE INIT
   ============================================================ */
window.addEventListener("DOMContentLoaded", () => {

  if (typeof AOS !== "undefined") {
    AOS.init({
      duration: 800,
      once: false,
      mirror: true
    });
  }

  if (window.emailjs) {
    emailjs.init("vI-NhtzREwXqZQq5N");
  }
});
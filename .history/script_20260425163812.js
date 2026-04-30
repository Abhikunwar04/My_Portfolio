/* ============================================================
   ABHI KUNWAR PORTFOLIO — FINAL FIXED SCRIPT.JS
   (FULL MERGED + STABLE + NO CRASH CANVAS)
   ============================================================ */

gsap.registerPlugin(ScrollTrigger);

/* ============================================================
   CANVAS HERO (FIXED VERSION - STABLE)
   ============================================================ */

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

function check() {
  loaded++;
  if (loaded >= 3) initCanvas();
}

hero.onload = check;
nameImg.onload = check;
bottom.onload = check;

setTimeout(() => {
  if (!ready) initCanvas();
}, 2000);

/* state */
let smoothP = 0;
const LERP = 0.07;

/* reuse canvas (IMPORTANT FIX) */
const mc = document.createElement('canvas');
const mctx = mc.getContext('2d');

/* resize */
function resizeCanvas() {
  const dpr = window.devicePixelRatio || 1;

  heroCanvas.width = innerWidth * dpr;
  heroCanvas.height = innerHeight * dpr;

  heroCanvas.style.width = innerWidth + "px";
  heroCanvas.style.height = innerHeight + "px";

  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
}
window.addEventListener('resize', resizeCanvas);

/* scroll progress */
function getProgress() {
  const spacer = document.getElementById('scrollSpacer');
  if (!spacer) return 0;

  const max = spacer.offsetHeight - innerHeight;
  return max > 0 ? Math.min(Math.max(scrollY / max, 0), 1) : 0;
}

/* hero text */
function updateHeroText(p) {
  const el = document.getElementById('hero');
  if (!el) return;

  const alpha = Math.min(Math.max((p - 0.78) / 0.18, 0), 1);
  el.style.opacity = alpha;
  el.classList.toggle('reveal', alpha > 0.05);
}

/* main content */
function updateMainContent(p) {
  const el = document.getElementById('mainContent');
  if (!el) return;

  const t = Math.min(Math.max((p - 0.68) / 0.32, 0), 1);
  const ease = 1 - Math.pow(1 - t, 3);

  el.style.transform = `translateY(${(1 - ease) * 80}px)`;
  el.style.opacity = ease;
}

/* DRAW ENGINE */
function draw() {
  if (!ready) return;

  const W = innerWidth;
  const H = innerHeight;
  const p = smoothP;

  ctx.clearRect(0, 0, W, H);

  /* HERO IMAGE */
  const ar = hero.naturalWidth / hero.naturalHeight;
  let w = W, h = W / ar;
  if (h < H) { h = H; w = h * ar; }

  const zoom = 1.35 + (1 - 1.35) * (1 - Math.pow(1 - p, 3));

  const sw = w * zoom;
  const sh = h * zoom;

  const x = (W - sw) / 2;
  const y = (H - sh) / 2;

  ctx.drawImage(hero, x, y, sw, sh);

  /* bottom parallax */
  const bottomShift = p * sh * 0.12;

  /* NAME */
  const nameW = W;
  const nameH = nameW * (nameImg.naturalHeight / nameImg.naturalWidth);

  const nameY = (H * 0.85) + ((H * 0.5) - (H * 0.85)) * p;
  const alpha = Math.min(Math.max((p - 0.08) / 0.25, 0), 1);

  mc.width = W;
  mc.height = H;

  mctx.clearRect(0, 0, W, H);
  mctx.globalAlpha = alpha;
  mctx.drawImage(nameImg, (W - nameW) / 2, nameY, nameW, nameH);

  mctx.globalCompositeOperation = "destination-out";
  mctx.drawImage(bottom, x, y - bottomShift, sw, sh);

  ctx.drawImage(mc, 0, 0);

  ctx.drawImage(bottom, x, y - bottomShift, sw, sh);

  ctx.fillStyle = "rgba(0,0,0,0.55)";
  ctx.fillRect(0, 0, W, H);

  updateHeroText(p);
  updateMainContent(p);
}

/* loop */
function loop() {
  const p = getProgress();
  smoothP += (p - smoothP) * LERP;

  draw();
  requestAnimationFrame(loop);
}

/* init */
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
   CURSOR
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

/* hover */
document.querySelectorAll('a, button, .skill, .project-card')
  .forEach(el => {
    el.addEventListener('mouseenter', () => ring.classList.add('hovered'));
    el.addEventListener('mouseleave', () => ring.classList.remove('hovered'));
  });

/* ============================================================
   EMAILJS + AOS
   ============================================================ */
window.addEventListener("DOMContentLoaded", () => {

  if (typeof AOS !== "undefined") {
    AOS.init({ duration: 800, once: false });
  }

  if (window.emailjs) {
    emailjs.init("vI-NhtzREwXqZQq5N");
  }

  const form = document.getElementById("feedback-form");

  form?.addEventListener("submit", (e) => {
    e.preventDefault();

    const btn = form.querySelector("button");

    btn.textContent = "Sending...";
    btn.disabled = true;

    emailjs.sendForm("service_71kywa9", "template_lh1bgai", form)
      .then(() => {
        alert("Message Sent!");
        form.reset();
      })
      .catch(() => alert("Failed!"))
      .finally(() => {
        btn.innerHTML = "Send";
        btn.disabled = false;
      });
  });
});
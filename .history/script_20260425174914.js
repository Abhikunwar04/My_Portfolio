/* ============================================================
   ABHI KUNWAR PORTFOLIO — SCRIPT.JS  (clean rewrite)
   ============================================================ */

gsap.registerPlugin(ScrollTrigger);

/* ============================================================
   HELPERS
   ============================================================ */
const clamp   = (v, a, b) => Math.max(a, Math.min(b, v));
const easeOut = t => 1 - Math.pow(1 - t, 3);
const lerp    = (a, b, t) => a + (b - a) * t;

/* ============================================================
   CANVAS HERO SETUP
   ============================================================ */
const heroCanvas = document.getElementById('heroCanvas');
const ctx        = heroCanvas.getContext('2d');

const heroImg   = new Image();
const nameImg   = new Image();
const bottomImg = new Image();

heroImg.src   = 'hero.jpg';
nameImg.src   = 'name.png';
bottomImg.src = 'bottom.png';

let loadedCount = 0;
let canvasReady = false;

function onImageLoad() {
  loadedCount++;
  if (loadedCount >= 3) { canvasReady = true; canvasInit(); }
}
heroImg.onload   = onImageLoad;
nameImg.onload   = onImageLoad;
bottomImg.onload = onImageLoad;
heroImg.onerror  = onImageLoad;
nameImg.onerror  = onImageLoad;
bottomImg.onerror = onImageLoad;
setTimeout(() => { if (!canvasReady) { canvasReady = true; canvasInit(); } }, 1000);

/* ============================================================
   CANVAS RESIZE
   ============================================================ */
function canvasResize() {
  const dpr = window.devicePixelRatio || 1;
  heroCanvas.width  = window.innerWidth  * dpr;
  heroCanvas.height = window.innerHeight * dpr;
  heroCanvas.style.width  = window.innerWidth  + 'px';
  heroCanvas.style.height = window.innerHeight + 'px';
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
}
window.addEventListener('resize', canvasResize, { passive: true });

/* ============================================================
   SCROLL PROGRESS  0 to 1  over heroScroll height
   ============================================================ */
let rawP    = 0;
let smoothP = 0;

function updateScrollProgress() {
  const hs  = document.getElementById('heroScroll');
  if (!hs) return;
  const max = hs.offsetHeight - window.innerHeight;
  rawP = max <= 0 ? 0 : clamp(window.scrollY / max, 0, 1);
}
window.addEventListener('scroll', updateScrollProgress, { passive: true });

/* ============================================================
   HERO TEXT FADE
   ============================================================ */
let heroTextSettled = false;

function updateHeroText(p) {
  const heroText = document.getElementById('hero');
  if (!heroText || heroTextSettled) return;
  const alpha = clamp((p - 0.78) / 0.18, 0, 1);
  heroText.style.opacity   = alpha;
  heroText.style.transform = `translate(-50%, calc(-50% + ${(1 - alpha) * 18}px))`;
}

/* ============================================================
   MAIN CONTENT SLIDE UP
   ============================================================ */
let mainSettled = false;

function updateMainContent(p) {
  const main    = document.getElementById('mainContent');
  const hText   = document.getElementById('hero');
  const hCanvas = document.getElementById('heroCanvas');
  if (!main || mainSettled) return;

  const sp   = clamp((p - 0.45) / 0.55, 0, 1);
  const ease = easeOut(sp);
  const vh   = window.innerHeight;

  main.style.transform = `translateY(${(1 - ease) * vh * 0.95}px)`;
  main.style.opacity   = clamp((p - 0.45) / 0.30, 0, 1);

  if (p >= 0.999) {
    mainSettled     = true;
    heroTextSettled = true;

    main.classList.add('settled');
    main.style.transform = '';
    main.style.opacity   = '';

    if (hText) {
      hText.classList.add('settled');
      hText.style.opacity   = '';
      hText.style.transform = '';
    }
    if (hCanvas) hCanvas.style.display = 'none';
  }
}

/* ============================================================
   CANVAS DRAW
   ============================================================ */
function canvasDraw() {
  if (!canvasReady) return;

  const W   = window.innerWidth;
  const H   = window.innerHeight;
  const p   = smoothP;
  const dpr = window.devicePixelRatio || 1;

  ctx.clearRect(0, 0, W, H);

  /* hero image zoom-out + parallax */
  const imgAR  = (heroImg.naturalWidth || W) / (heroImg.naturalHeight || H);
  let imgW = W, imgH = W / imgAR;
  if (imgH < H) { imgH = H; imgW = imgH * imgAR; }

  const zoom    = 1.35 - 0.35 * easeOut(p);
  const scaledW = imgW * zoom;
  const scaledH = imgH * zoom;
  const baseX   = (W - scaledW) * 0.5;
  const baseY   = (H - scaledH) * 0.45;

  ctx.drawImage(heroImg, baseX, baseY - p * scaledH * 0.05, scaledW, scaledH);

  /* name with depth mask */
  const nameW     = W;
  const nameH     = nameW * ((nameImg.naturalHeight || 200) / (nameImg.naturalWidth || W));
  const nameAlpha = clamp((p - 0.05) / 0.25, 0, 1);
  const textY     = (H * 0.82 - nameH / 2) + ((H * 0.48 - nameH / 2) - (H * 0.82 - nameH / 2)) * easeOut(clamp((p - 0.05) / 0.65, 0, 1));

  const mc   = document.createElement('canvas');
  mc.width   = W * dpr;
  mc.height  = H * dpr;
  const mctx = mc.getContext('2d');
  mctx.scale(dpr, dpr);

  mctx.globalAlpha = nameAlpha;
  mctx.drawImage(nameImg, (W - nameW) / 2, textY, nameW, nameH);

  const bottomShiftY = p * scaledH * 0.12;
  mctx.globalCompositeOperation = 'destination-out';
  mctx.drawImage(bottomImg, baseX, baseY - bottomShiftY, scaledW, scaledH);

  ctx.drawImage(mc, 0, 0, W * dpr, H * dpr, 0, 0, W, H);

  /* bottom foreground */
  ctx.drawImage(bottomImg, baseX, baseY - bottomShiftY, scaledW, scaledH);

  /* vignettes */
  const vBot = ctx.createLinearGradient(0, H * 0.45, 0, H);
  vBot.addColorStop(0,    'rgba(0,0,0,0)');
  vBot.addColorStop(0.5,  'rgba(0,0,0,0.25)');
  vBot.addColorStop(0.82, 'rgba(0,0,0,0.72)');
  vBot.addColorStop(1,    'rgba(0,0,0,0.98)');
  ctx.fillStyle = vBot; ctx.fillRect(0, 0, W, H);

  const vL = ctx.createLinearGradient(0, 0, W * 0.22, 0);
  vL.addColorStop(0, 'rgba(0,0,0,0.5)');
  vL.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.fillStyle = vL; ctx.fillRect(0, 0, W, H);

  const vR = ctx.createLinearGradient(W, 0, W * 0.78, 0);
  vR.addColorStop(0, 'rgba(0,0,0,0.4)');
  vR.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.fillStyle = vR; ctx.fillRect(0, 0, W, H);

  const topA = clamp(1 - p * 2.2, 0, 0.35);
  const vT = ctx.createLinearGradient(0, 0, 0, H * 0.38);
  vT.addColorStop(0, `rgba(0,0,0,${topA})`);
  vT.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.fillStyle = vT; ctx.fillRect(0, 0, W, H);

  /* smooth dark overlay as content rises */
  const darkAlpha = clamp((p - 0.42) / 0.52, 0, 0.85);
  ctx.fillStyle = `rgba(0,0,0,${darkAlpha})`;
  ctx.fillRect(0, 0, W, H);

  updateHeroText(p);
  updateMainContent(p);
}

/* ============================================================
   RAF LOOP
   ============================================================ */
function canvasTick() {
  smoothP = lerp(smoothP, rawP, 0.08);

  /* reset when user scrolls back into hero zone */
  if (rawP < 0.97 && mainSettled) {
    mainSettled     = false;
    heroTextSettled = false;

    const main    = document.getElementById('mainContent');
    const hText   = document.getElementById('hero');
    const hCanvas = document.getElementById('heroCanvas');

    if (main)    main.classList.remove('settled');
    if (hText)   hText.classList.remove('settled', 'reveal');
    if (hCanvas) hCanvas.style.display = '';
  }

  canvasDraw();
  requestAnimationFrame(canvasTick);
}

function canvasInit() {
  canvasResize();
  updateScrollProgress();
  canvasTick();
}

/* ============================================================
   NAVBAR scroll hide / show
   ============================================================ */
const topBar   = document.getElementById('top-bar');
let lastScroll = 0;

window.addEventListener('scroll', () => {
  const cur = window.scrollY;
  if (!topBar) return;
  topBar.classList.toggle('scrolled', cur > 30);
  topBar.classList.toggle('hide', cur > lastScroll && cur > 100);
  lastScroll = Math.max(cur, 0);
}, { passive: true });

/* ============================================================
   NAVBAR LINKS
   ============================================================ */
const hamburger = document.getElementById('hamburger');
const navLinks  = document.getElementById('nav-links');

if (hamburger && navLinks) {
  hamburger.addEventListener('click', () => navLinks.classList.toggle('active'));
}

document.querySelectorAll('.nav-links a').forEach(link => {
  link.addEventListener('click', e => {
    e.preventDefault();
    if (navLinks) navLinks.classList.remove('active');
    if (topBar)   topBar.classList.remove('hide');

    const href   = link.getAttribute('href');
    const isHome = !href || href === '#' || href === '#home';

    if (isHome) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    const target  = document.querySelector(href);
    if (!target) return;

    const hs      = document.getElementById('heroScroll');
    const heroEnd = hs ? hs.offsetHeight - window.innerHeight : 0;

    if (window.scrollY < heroEnd * 0.95) {
      /* in hero zone — complete hero scroll first then jump */
      window.scrollTo({ top: heroEnd + 5, behavior: 'smooth' });
      setTimeout(() => target.scrollIntoView({ behavior: 'smooth', block: 'start' }), 900);
    } else {
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  });
});

/* ============================================================
   CYBER PRELOADER
   ============================================================ */
window.addEventListener('load', () => {
  const preloader = document.getElementById('preloader');
  if (!preloader) return;

  const canvas = document.getElementById('mc');
  const mctx   = canvas.getContext('2d');
  let mW, mH;

  function resizeMatrix() {
    mW = canvas.width  = window.innerWidth;
    mH = canvas.height = window.innerHeight;
  }
  resizeMatrix();
  window.addEventListener('resize', resizeMatrix);

  const CHARS = 'アイウエオカキクケコ0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ@#$%&';
  const drops = Array.from({ length: 70 }, () => Math.random() * -80);
  let matrixRunning = true;

  (function drawMatrix() {
    if (!matrixRunning) return;
    mctx.fillStyle = 'rgba(2,12,5,0.07)';
    mctx.fillRect(0, 0, mW, mH);
    mctx.font = "13px 'Share Tech Mono', monospace";
    drops.forEach((y, i) => {
      const ch = CHARS[Math.floor(Math.random() * CHARS.length)];
      mctx.fillStyle = Math.random() > 0.93 ? 'rgba(200,255,210,0.95)' : 'rgba(0,255,65,0.65)';
      mctx.fillText(ch, i * (mW / drops.length), y * 16);
      if (y * 16 > mH && Math.random() > 0.975) drops[i] = 0;
      drops[i] += 0.6;
    });
    requestAnimationFrame(drawMatrix);
  })();

  const greetings = ['Hello','नमस्ते','Hola','Bonjour','Ciao','Olá','Здравствуйте','Merhaba','Hej','Hallo'];
  const greetEl   = document.getElementById('greetEl');
  let gi = 0;
  const per = 1800 / greetings.length;

  function animIn() {
    greetEl.style.transition = 'none';
    greetEl.style.opacity    = '0';
    greetEl.style.transform  = 'scale(0.85)';
    requestAnimationFrame(() => {
      greetEl.style.transition = '0.2s ease';
      greetEl.style.opacity    = '1';
      greetEl.style.transform  = 'scale(1)';
    });
  }
  function animOut(cb) {
    greetEl.style.transition = '0.12s ease';
    greetEl.style.opacity    = '0';
    greetEl.style.transform  = 'scale(1.1)';
    setTimeout(cb, 130);
  }
  function runGreetings(cb) {
    greetEl.textContent = greetings[0]; animIn();
    function next() {
      if (gi >= greetings.length - 1) { animOut(cb); return; }
      animOut(() => { gi++; greetEl.textContent = greetings[gi]; animIn(); setTimeout(next, per - 120); });
    }
    setTimeout(next, per - 120);
  }

  const nameEl  = document.getElementById('nm');
  const glR     = document.getElementById('glR');
  const glG     = document.getElementById('glG');
  const FULL    = 'ABHI KUNWAR';
  const LETTERS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';

  function scramble(cb) {
    let rev = 0, count = 0;
    function loop() {
      let str = '';
      for (let i = 0; i < FULL.length; i++) {
        str += i < rev ? FULL[i] : FULL[i] === ' ' ? ' ' : LETTERS[Math.floor(Math.random() * LETTERS.length)];
      }
      nameEl.textContent = glR.textContent = glG.textContent = str;
      if (++count % 3 === 0 && rev < FULL.length) rev++;
      if (rev < FULL.length) { setTimeout(loop, 45); }
      else { nameEl.textContent = glR.textContent = glG.textContent = FULL; if (cb) cb(); }
    }
    loop();
  }

  function glitch() {
    let r = 0;
    function g() {
      if (r >= 8) { glR.style.opacity = glG.style.opacity = 0; return; }
      const dx = (Math.random() - 0.5) * 14, dy = (Math.random() - 0.5) * 5;
      glR.style.opacity = 0.75; glG.style.opacity = 0.5;
      glR.style.transform = `translate(${dx}px,${dy}px)`;
      glG.style.transform = `translate(${-dx}px,${-dy}px)`;
      r++; setTimeout(g, 30);
    }
    g();
  }

  const fill  = document.getElementById('fill');
  const pctL  = document.getElementById('pctL');
  const pctC  = document.getElementById('pctC');
  const stTxt = document.getElementById('stTxt');
  const statuses = ['LOADING','PARSING DATA','BUILDING WORLD','ALMOST READY','COMPLETE'];
  let si = 0;
  function nextStatus() { if (si < statuses.length - 1) stTxt.textContent = statuses[++si]; }

  function runProgress(cb) {
    let progress = 0;
    const iv = setInterval(() => {
      progress += Math.random() * 3.5 + 0.5;
      if (progress >= 100) { progress = 100; clearInterval(iv); nextStatus(); if (cb) setTimeout(cb, 200); }
      const p = Math.floor(progress);
      fill.style.width = p + '%';
      pctL.textContent = pctC.textContent = p + '%';
      if (p > 25 && si < 1) nextStatus();
      if (p > 55 && si < 2) nextStatus();
      if (p > 80 && si < 3) nextStatus();
    }, 50);
  }

  const phase1 = document.getElementById('phase1');
  const phase2 = document.getElementById('phase2');

  runGreetings(() => {
    phase1.style.transition = 'opacity 0.4s ease';
    phase1.style.opacity    = '0';
    setTimeout(() => {
      phase1.style.display = 'none';
      phase2.style.opacity = '1';
      scramble(() => { glitch(); setTimeout(glitch, 400); });
      runProgress(() => {
        setTimeout(() => {
          preloader.classList.add('hide');
          setTimeout(() => {
            preloader.style.display = 'none';
            document.body.classList.remove('loading');
            matrixRunning = false;
          }, 700);
        }, 300);
      });
    }, 400);
  });
});

/* ============================================================
   CUSTOM CURSOR
   ============================================================ */
const dot  = document.getElementById('cursorDot');
const ring = document.getElementById('cursorRing');

if (dot && ring) {
  let mX = 0, mY = 0, rX = 0, rY = 0, vX = 0, vY = 0;

  document.addEventListener('mousemove', e => {
    mX = e.clientX; mY = e.clientY;
    dot.style.transform = `translate(${mX}px,${mY}px)`;
  });

  (function animRing() {
    vX = (vX + (mX - rX) * 0.20) * 0.72;
    vY = (vY + (mY - rY) * 0.20) * 0.72;
    rX += vX; rY += vY;
    ring.style.transform = `translate(${rX}px,${rY}px)`;
    requestAnimationFrame(animRing);
  })();

  document.querySelectorAll('a, button, .skill, .project-card, .highlight').forEach(el => {
    el.addEventListener('mouseenter', () => ring.classList.add('hovered'));
    el.addEventListener('mouseleave', () => ring.classList.remove('hovered'));
  });
  document.addEventListener('mousedown', () => ring.classList.add('click'));
  document.addEventListener('mouseup',   () => ring.classList.remove('click'));
}

/* ============================================================
   DOM READY — AOS + EmailJS
   ============================================================ */
window.addEventListener('DOMContentLoaded', () => {
  if (typeof AOS !== 'undefined') {
    AOS.init({ duration: 900, once: true, offset: 80, easing: 'ease-out-cubic' });
  }

  if (window.emailjs) emailjs.init('vI-NhtzREwXqZQq5N');

  const form = document.getElementById('feedback-form');
  if (form && window.emailjs) {
    form.addEventListener('submit', e => {
      e.preventDefault();
      const name    = form.from_name.value.trim();
      const email   = form.from_email.value.trim();
      const message = form.message.value.trim();
      if (!name || !email || !message) { alert('❌ Please fill all fields'); return; }
      if (!/^[^\s@]+@gmail\.com$/.test(email)) { alert('❌ Enter a valid Gmail address'); return; }

      const btn = form.querySelector('button[type="submit"]');
      btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Sending…';
      btn.disabled  = true;

      emailjs.sendForm('service_71kywa9', 'template_lh1bgai', form)
        .then(() => { alert('✅ Message sent!'); form.reset(); })
        .catch(() => alert('❌ Failed. Please try again.'))
        .finally(() => {
          btn.innerHTML = '<i class="fas fa-paper-plane"></i> Send Message';
          btn.disabled  = false;
        });
    });
  }

  document.querySelectorAll('.skill').forEach(skill => {
    const c = skill.getAttribute('data-color');
    if (c) skill.style.setProperty('--skill-color', c);
  });
});

/* ============================================================
   SKILLS INFINITE SCROLL
   ============================================================ */
window.addEventListener('load', () => {
  const track   = document.getElementById('skillsTrack');
  const wrapper = document.querySelector('.skills-wrapper');
  if (!track || !wrapper) return;

  if (!track.classList.contains('cloned')) {
    track.innerHTML += track.innerHTML + track.innerHTML;
    track.classList.add('cloned');
  }

  const singleSetW = (track.children.length / 3) * 130;
  let offset = 0, paused = false;

  wrapper.addEventListener('mouseenter', () => paused = true);
  wrapper.addEventListener('mouseleave', () => paused = false);

  (function animate() {
    if (!paused) {
      offset = (offset + 0.5) % singleSetW;
      track.style.transform = `translateX(-${offset}px)`;
    }
    requestAnimationFrame(animate);
  })();
});

/* ============================================================
   GSAP ANIMATIONS
   ============================================================ */
gsap.from('.about-lottie.left',  { scrollTrigger: { trigger: '.about-section', start: 'top 80%' }, opacity: 0, x: -80, duration: 1.0, ease: 'power3.out' });
gsap.from('.about-text',         { scrollTrigger: { trigger: '.about-section', start: 'top 80%' }, opacity: 0, y:  40, duration: 0.9, ease: 'power3.out', delay: 0.1 });
gsap.from('.about-lottie.right', { scrollTrigger: { trigger: '.about-section', start: 'top 80%' }, opacity: 0, x:  80, duration: 1.0, ease: 'power3.out' });
gsap.from('.skills-section h2',  { scrollTrigger: { trigger: '.skills-section', start: 'top 85%' }, opacity: 0, y: 30, duration: 0.8, ease: 'power3.out' });
gsap.from('#projects h2',        { scrollTrigger: { trigger: '#projects', start: 'top 85%' }, opacity: 0, y: 30, duration: 0.8, ease: 'power3.out' });
gsap.from('.project-card',       { scrollTrigger: { trigger: '#projects', start: 'top 80%' }, opacity: 0, y: 50, stagger: 0.15, duration: 0.8, ease: 'power3.out' });
gsap.from('.contact-form-wrapper', { scrollTrigger: { trigger: '#contact', start: 'top 80%' }, opacity: 0, y: 40, duration: 0.9, ease: 'power3.out' });
gsap.from('.warrior-gate lottie-player', { scrollTrigger: { trigger: '#contact', start: 'top 80%' }, opacity: 0, scale: 0.85, stagger: 0.2, duration: 0.9, ease: 'back.out(1.4)' });
gsap.from('.resume-btn', { scrollTrigger: { trigger: '.resume-wrapper', start: 'top 90%' }, opacity: 0, y: 20, duration: 0.7, ease: 'power3.out' });
/* ============================================================
   ABHI KUNWAR PORTFOLIO — SCRIPT.JS  (FINAL MERGED BUILD)
   ============================================================ */

gsap.registerPlugin(ScrollTrigger);

if ('scrollRestoration' in history) {
  history.scrollRestoration = 'manual';
}

window.scrollTo(0, 0);

window.addEventListener('beforeunload', () => {
  window.scrollTo(0, 0);
});

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
hero.onerror = nameImg.onerror = bottom.onerror = checkImagesLoaded;
setTimeout(() => { if (!canvasReady) { canvasReady = true; canvasInit(); } }, 800);


/* ---------- HELPERS ---------- */
const clamp     = (v, a, b) => Math.max(a, Math.min(b, v));
const easeOut   = t => 1 - Math.pow(1 - t, 3);
const easeInOut = t => t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;


/* ---------- SMOOTH SCROLL (frame-rate-independent LERP) ---------- */
const BASE_LERP = 0.08;
let smoothP  = 0;
let rawP     = 0;
let lastTime = 0;


/* ---------- OFFSCREEN MASK CANVAS (reused, never recreated mid-frame) ---------- */
let mc   = null;
let mctx = null;

function ensureMaskCanvas(W, H, dpr) {
  const needW = Math.ceil(W * dpr);
  const needH = Math.ceil(H * dpr);
  if (!mc || mc.width !== needW || mc.height !== needH) {
    mc        = document.createElement('canvas');
    mc.width  = needW;
    mc.height = needH;
    mctx      = mc.getContext('2d');
  }
}


/* ---------- STATE FLAGS ---------- */
let heroTextVisible = false;
let heroTextSettled = false;
let mainSettled     = false;


/* ---------- CANVAS RESIZE ---------- */
function canvasResize() {
  const dpr = window.devicePixelRatio || 1;
  heroCanvas.width        = window.innerWidth  * dpr;
  heroCanvas.height       = window.innerHeight * dpr;
  heroCanvas.style.width  = window.innerWidth  + 'px';
  heroCanvas.style.height = window.innerHeight + 'px';
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  mc = null;
  if (canvasReady) canvasDraw();
}
window.addEventListener('resize', canvasResize, { passive: true });


/* ---------- SCROLL PROGRESS ---------- */
function getScrollProgress() {
  const heroScroll = document.getElementById('heroScroll');
  if (!heroScroll) return 0;

  const rect = heroScroll.getBoundingClientRect();
  const total = heroScroll.offsetHeight - window.innerHeight;

  let scrolled = -rect.top;

  return total <= 0 ? 0 : clamp(scrolled / total, 0, 1);
}

/* ---------- HERO TEXT FADE ---------- */
function updateHeroText(p) {
  const heroText = document.getElementById('hero');
  const heroRightLottie = document.querySelector('.hero-lottie-right');
  const resume   = document.querySelector('.resume-wrapper');
  
  if (!heroText) return;

  if (p > 0.7) {
    heroText.style.opacity = 1;
    heroCanvas.style.filter = 'blur(6px) brightness(0.5)';  // ← ADD
    if (heroRightLottie) heroRightLottie.style.opacity = 1;
  } else {
    heroText.style.opacity = 0;
    heroCanvas.style.filter = 'none';  // ← ADD
    if (heroRightLottie) heroRightLottie.style.opacity = 0; 
  }
  // baaki code same rehne do...

  // 🔥 2. Layer effect (resume section ke piche chala jaye)
  if (resume) {
    const rect = resume.getBoundingClientRect();
    const vh = window.innerHeight;

    if (rect.top < vh * 0.9) {
      heroText.style.zIndex = "1";   // peeche
    } else {
      heroText.style.zIndex = "10";  // upar
    }
  }
}
/* ---------- MAIN CONTENT SLIDE ---------- */


/* ---------- DRAW ---------- */
function canvasDraw() {
  if (!canvasReady) return;

  const W   = window.innerWidth;
  const H   = window.innerHeight;
  const p = smoothP * 1.3;
  const dpr = window.devicePixelRatio || 1;

  ctx.clearRect(0, 0, W, H);

  const imgAR = (hero.naturalWidth || W) / (hero.naturalHeight || H);
  let imgW = W, imgH = W / imgAR;
  if (imgH < H) { imgH = H; imgW = imgH * imgAR; }

  const zoom    = 1.35 + (1.00 - 1.35) * easeOut(p);
  const scaledW = imgW * zoom;
  const scaledH = imgH * zoom;
  const baseX   = (W - scaledW) * 0.5;
  const baseY   = (H - scaledH) * 0.45;

  const heroShiftY = p * scaledH * 0.06;
  ctx.drawImage(hero, baseX, baseY - heroShiftY, scaledW, scaledH);

  const nameW     = W;
  const nameH     = nameW * ((nameImg.naturalHeight || 200) / (nameImg.naturalWidth || W));
  const textY     = (H * 0.85 - nameH / 2)
                  + ((H * 0.50 - nameH / 2) - (H * 0.85 - nameH / 2))
                  * easeOut(clamp((p - 0.05) / 0.7, 0, 1));
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

  const main = document.getElementById('mainContent');

if (main) {
  if (p > 1.0) {
  const prog = (p - 1.0) / 0.2;
  main.style.opacity = Math.min(prog, 1);
  main.style.transform = `translateY(${100 - prog * 100}px)`;
} else {
  main.style.opacity = "0";
  main.style.transform = "translateY(100px)";
}
}
  /* Vignettes */
  const vBot = ctx.createLinearGradient(0, H * 0.5, 0, H);
  vBot.addColorStop(0,   'rgba(0,0,0,0)');
  vBot.addColorStop(0.5, 'rgba(0,0,0,0.2)');
  vBot.addColorStop(0.8, 'rgba(0,0,0,0.65)');
  vBot.addColorStop(1.0, 'rgba(0,0,0,0.97)');
  ctx.fillStyle = vBot; ctx.fillRect(0, 0, W, H);

  const vL = ctx.createLinearGradient(0, 0, W * 0.22, 0);
  vL.addColorStop(0, 'rgba(0,0,0,0.5)'); vL.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.fillStyle = vL; ctx.fillRect(0, 0, W, H);

  const vR = ctx.createLinearGradient(W, 0, W * 0.78, 0);
  vR.addColorStop(0, 'rgba(0,0,0,0.4)'); vR.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.fillStyle = vR; ctx.fillRect(0, 0, W, H);

  const topA = clamp(1 - p * 2, 0, 0.35);
  const vT   = ctx.createLinearGradient(0, 0, 0, H * 0.4);
  vT.addColorStop(0, `rgba(0,0,0,${topA})`); vT.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.fillStyle = vT; ctx.fillRect(0, 0, W, H);

 // const darkAlpha = clamp((p - 0.35) / 0.55, 0, 0.88);
  //ctx.fillStyle   = `rgba(0,0,0,${darkAlpha})`;
  //ctx.fillRect(0, 0, W, H);

  updateHeroText(p);
 
}


/* ---------- RAF LOOP ---------- */
function canvasTick(now) {
  if (document.hidden) { requestAnimationFrame(canvasTick); return; } 
  const dt        = lastTime ? Math.min(now - lastTime, 2 * 16.67) : 16.67;
  lastTime        = now;
  rawP            = getScrollProgress();
  const lerpAlpha = 1 - Math.pow(1 - BASE_LERP, dt / 16.67);
  smoothP += (rawP - smoothP) * lerpAlpha;

  /* Scroll back into hero → reset (canvas shown FIRST to avoid black flash) */
 if (smoothP > 0.98 && !heroTextSettled) {
  heroTextSettled = true;
  mainSettled = true;

  const heroText = document.getElementById('hero');
  const main     = document.getElementById('mainContent');

  if (heroText) heroText.classList.add('settled');
  if (main)     main.classList.add('settled');
}

  canvasDraw();
  requestAnimationFrame(canvasTick);
}

function canvasInit() {
  canvasResize();
  requestAnimationFrame(canvasTick);
}


/* ============================================================
   2.  NAVBAR SCROLL EFFECT
   ============================================================ */
const topBar = document.getElementById('top-bar');
let lastScroll = 0;

window.addEventListener('scroll', () => {
  const cur = window.pageYOffset;
  if (!topBar) return;
  topBar.classList.toggle('scrolled', cur > 20);
  topBar.classList.toggle('hide', cur > lastScroll && cur > 80);
  lastScroll = Math.max(cur, 0);
}, { passive: true });


/* ============================================================
   3.  CYBER PRELOADER
   ============================================================ */
window.addEventListener('load', () => {
  const preloader = document.getElementById('preloader');
  if (!preloader) return;

  const mc2 = document.getElementById('mc');
  const c2  = mc2.getContext('2d');
  let PW, PH;

  const CHARS = 'アイウエオカキクケコ0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ@#$%&';
  const COL_SIZE = 16;
  let drops = [];

  function preloaderResize() {
    PW = mc2.width  = window.innerWidth;
    PH = mc2.height = window.innerHeight;
    const newCols = Math.floor(PW / COL_SIZE);
    drops.length = 0;
    for (let i = 0; i < newCols; i++)
      drops.push({ y: -(8 + Math.floor(Math.random() * 12)) - Math.random() * 50, len: 10 + Math.floor(Math.random() * 15) });
  }
  preloaderResize();
  window.addEventListener('resize', preloaderResize);

  let matrixRunning = true;

  function drawMatrix() {
    if (!matrixRunning) return;

    c2.fillStyle = 'rgba(0, 0, 0, 0.08)';
    c2.fillRect(0, 0, PW, PH);

    drops.forEach((drop, i) => {
      // trail — 6 characters upar, fading
      for (let j = 1; j <= 6; j++) {
        const trailY = drop.y - j;
        if (trailY < 0) continue;
        const alpha = (1 - j / 7) * 0.6;
        c2.fillStyle = `rgba(0, 200, 60, ${alpha})`;
        c2.font = "13px 'Share Tech Mono', monospace";
        c2.fillText(CHARS[Math.floor(Math.random() * CHARS.length)], i * COL_SIZE, trailY * COL_SIZE);
      }

      // head — bright
      c2.fillStyle = 'rgba(180, 255, 180, 0.95)';
      c2.font = "13px 'Share Tech Mono', monospace";
      c2.fillText(CHARS[Math.floor(Math.random() * CHARS.length)], i * COL_SIZE, drop.y * COL_SIZE);

      drop.y += 1;
      if (drop.y * COL_SIZE > PH + drop.len * COL_SIZE) {
        drop.y = -(drop.len + Math.random() * 20);
        drop.len = 10 + Math.floor(Math.random() * 15);
      }
    });
  }

  const matrixInterval = setInterval(() => {
    if (!matrixRunning) { clearInterval(matrixInterval); return; }
    drawMatrix();
  }, 55);
  /* Greetings */
  const greetings = ['Hello','नमस्ते','Hola','Bonjour','Ciao','Olá','Print','Merhaba','Hello World','Hallo'];
  const greetEl   = document.getElementById('greetEl');
  let gi = 0;
  const per = 1800 / greetings.length;

  function animateIn() {
    greetEl.style.transition = 'none';
    greetEl.style.opacity    = '0';
    greetEl.style.transform  = 'scale(0.85)';
    requestAnimationFrame(() => {
      greetEl.style.transition = '0.2s ease';
      greetEl.style.opacity    = '1';
      greetEl.style.transform  = 'scale(1)';
    });
  }
  function animateOut(cb) {
    greetEl.style.transition = '0.12s ease';
    greetEl.style.opacity    = '0';
    greetEl.style.transform  = 'scale(1.1)';
    setTimeout(cb, 130);
  }
  function runGreetings(callback) {
    greetEl.textContent = greetings[0]; animateIn();
    function next() {
      if (gi >= greetings.length - 1) { animateOut(callback); return; }
      animateOut(() => { gi++; greetEl.textContent = greetings[gi]; animateIn(); setTimeout(next, per - 120); });
    }
    setTimeout(next, per - 120);
  }

  /* Scramble */
  const nameEl  = document.getElementById('nm');
  const glR     = document.getElementById('glR');
  const glG     = document.getElementById('glG');
  const FULL    = 'Loading...';
  const LETTERS = 'ABCDEFGHIJKLMNOPQRSTU,.VWXYZ0123456789';

  function scramble(callback) {
    let rev = 0, count = 0;
    function loop() {
      let str = '';
      for (let i = 0; i < FULL.length; i++) {
        if (i < rev) str += FULL[i];
        else if (FULL[i] === ' ') str += ' ';
        else str += LETTERS[Math.floor(Math.random() * LETTERS.length)];
      }
      nameEl.textContent = glR.textContent = glG.textContent = str;
      count++;
      if (count % 3 === 0 && rev < FULL.length) rev++;
      if (rev < FULL.length) { setTimeout(loop, 45); }
      else { nameEl.textContent = glR.textContent = glG.textContent = FULL; if (callback) callback(); }
    }
    loop();
  }

  /* Glitch */
  function glitch() {
    let r = 0;
    function g() {
      if (r >= 8) { glR.style.opacity = glG.style.opacity = 0; return; }
      const dx = (Math.random() - 0.5) * 14;
      const dy = (Math.random() - 0.5) * 5;
      glR.style.opacity = 0.75; glG.style.opacity = 0.5;
      glR.style.transform = `translate(${dx}px,${dy}px)`;
      glG.style.transform = `translate(${-dx}px,${-dy}px)`;
      r++; setTimeout(g, 30);
    }
    g();
  }

  /* Progress */
  const fill     = document.getElementById('fill');
  const pctL     = document.getElementById('pctL');
  const pctC     = document.getElementById('pctC');
  const stTxt    = document.getElementById('stTxt');
  const statuses = ['LOADING','PARSING DATA','BUILDING WORLD','ALMOST READY','COMPLETE'];
  let si = 0;
  function nextStatus() { if (si < statuses.length - 1) stTxt.textContent = statuses[++si]; }

  function runProgress(duration, callback) {
    let progress = 0;
    const interval = setInterval(() => {
      progress += Math.random() * 3.5 + 0.5;
      if (progress >= 100) {
        progress = 100; clearInterval(interval); nextStatus();
        if (callback) setTimeout(callback, 200);
      }
      const p = Math.floor(progress);
      fill.style.width = p + '%';
      pctL.textContent = pctC.textContent = p + '%';
      if (p > 25 && si < 1) nextStatus();
      if (p > 55 && si < 2) nextStatus();
      if (p > 80 && si < 3) nextStatus();
    }, 50);
  }

  /* Main flow */
  const phase1 = document.getElementById('phase1');
  const phase2 = document.getElementById('phase2');

  runGreetings(() => {
    phase1.style.transition = 'opacity 0.4s ease';
    phase1.style.opacity    = '0';
    setTimeout(() => {
      phase1.style.display = 'none';
      phase2.style.opacity = '1';
      scramble(() => { glitch(); setTimeout(glitch, 400); });
      runProgress(900, () => {
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
   4.  HAMBURGER
   ============================================================ */
const hamburger = document.getElementById('hamburger');
const navLinks  = document.getElementById('nav-links');

if (hamburger && navLinks) {
  const toggle = () => navLinks.classList.toggle('active');
  hamburger.addEventListener('click', toggle);
  hamburger.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); toggle(); }
  });
  navLinks.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => navLinks.classList.remove('active'));
  });
}


/* ============================================================
   5.  CUSTOM CURSOR
   ============================================================ */

const isTouchDevice = ('ontouchstart' in window) || navigator.maxTouchPoints > 0;
if (!isTouchDevice && dot && ring) {
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
    ringX += velX;   ringY += velY;
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
}

/* ============================================================
   6.  DOM READY — AOS + EmailJS + Skill colors + Typing effect
   ============================================================ */
window.addEventListener('DOMContentLoaded', () => {

  if (typeof AOS !== 'undefined') {
    AOS.init({ duration: 800, once: true, mirror: false, offset: 100 });
  }

  if (window.emailjs) emailjs.init('vI-NhtzREwXqZQq5N');

  const form = document.getElementById('feedback-form');
  if (form && window.emailjs) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const name    = form.from_name.value.trim();
      const email   = form.from_email.value.trim();
      const message = form.message.value.trim();
      if (!name || !email || !message) { alert('❌ Please fill all fields'); return; }
     if (!/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(email)) { alert('❌ Enter a valid Email address'); return; }
      const btn = form.querySelector("button[type='submit']");
      btn.textContent = 'Sending…'; btn.disabled = true;
      emailjs.sendForm('service_71kywa9', 'template_lh1bgai', form)
        .then(() => { alert('✅ Message sent successfully!'); form.reset(); })
        .catch(() => alert('❌ Failed to send. Please try again.'))
        .finally(() => { btn.innerHTML = '<i class="fas fa-paper-plane"></i> Send Message'; btn.disabled = false; });
    });
  }

  document.querySelectorAll('.skill').forEach(skill => {
    const color = skill.getAttribute('data-color');
    if (color) skill.style.setProperty('--skill-color', color);
  });

  /* Typing effect — starts only after hero text is revealed */
  let typingStarted = false;

  function initTypingEffect() {
    if (typingStarted) return;
    typingStarted = true;
    const heroP = document.querySelector('.hero-text p');
    if (!heroP) return;
    const phrases = ['IT Learner','Frontend Developer','Creative Builder','UI/UX Enthusiast'];
    let pi = 0, ci = 0, deleting = false;
    function type() {
      const current = phrases[pi];
      if (!deleting) {
        heroP.textContent = current.slice(0, ci + 1); ci++;
        if (ci === current.length) { deleting = true; setTimeout(type, 1800); return; }
      } else {
        heroP.textContent = current.slice(0, ci - 1); ci--;
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

// Line 596-597 replace karo:
const firstCard = track.children[0];
const CARD_WIDTH = firstCard ? firstCard.getBoundingClientRect().width + 8 : 130;
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
   8.  GSAP SCROLL ANIMATIONS
   ============================================================ */
gsap.from('.about-text', {
  scrollTrigger: { trigger: '.about-section', start: 'top 80%' },
  opacity: 0, y: 50, duration: 0.9, ease: 'power3.out'
});
gsap.from('.about-lottie.left', {
  scrollTrigger: { trigger: '.about-section', start: 'top 80%' },
  opacity: 0, x: -100, duration: 1.1, ease: 'power3.out'
});
gsap.from('.about-lottie.right', {
  scrollTrigger: { trigger: '.about-section', start: 'top 80%' },
  opacity: 0, x: 100, duration: 1.1, ease: 'power3.out'
});
gsap.from('.project-card', {
  scrollTrigger: { trigger: '#projects', start: 'top 80%' },
  opacity: 0, y: 60, stagger: 0.18, duration: 0.8, ease: 'power3.out'
});
gsap.from('.contact-form-wrapper', {
  scrollTrigger: { trigger: '#contact', start: 'top 80%' },
  opacity: 0, y: 40, duration: 0.9, ease: 'power3.out'
});


(function initActiveNav() {
  const sections = document.querySelectorAll('section[id], div[id="home"]');
  const navLinks = document.querySelectorAll('.nav-links a');
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        navLinks.forEach(a => a.classList.remove('active-link'));
        const active = document.querySelector(`.nav-links a[href="#${entry.target.id}"]`);
        if (active) active.classList.add('active-link');
      }
    });
  }, { threshold: 0.4 });
  sections.forEach(s => observer.observe(s));
})();




function showToast(msg, type = 'success') {
  const t = document.createElement('div');
  t.style.cssText = `
    position:fixed; bottom:2rem; left:50%; transform:translateX(-50%) translateY(20px);
    background:${type === 'success' ? '#1D9E75' : '#A32D2D'};
    color:#fff; padding:0.8rem 1.6rem; border-radius:50px; font-size:0.9rem;
    font-weight:600; z-index:9999; opacity:0; transition:all 0.3s ease;
    box-shadow:0 8px 24px rgba(0,0,0,0.4);
  `;
  t.textContent = msg;
  document.body.appendChild(t);
  requestAnimationFrame(() => { t.style.opacity = '1'; t.style.transform = 'translateX(-50%) translateY(0)'; });
  setTimeout(() => { t.style.opacity = '0'; setTimeout(() => t.remove(), 300); }, 4000);
}


/* ============================================================
   10.  SCROLL-TO-TOP BUTTON
   ============================================================ */
(function initScrollTop() {
  const btn = document.createElement('button');
  btn.id        = 'scrollTopBtn';
  btn.innerHTML = '<i class="fas fa-chevron-up"></i>';
  btn.setAttribute('aria-label', 'Scroll to top');
  document.body.appendChild(btn);
  window.addEventListener('scroll', () => btn.classList.toggle('visible', window.scrollY > 600), { passive: true });
  btn.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
})();


/* ============================================================
   11.  TILT EFFECT on Project Cards
   ============================================================ */
(function initTilt() {
  document.querySelectorAll('.project-card').forEach(card => {
    card.addEventListener('mousemove', (e) => {
      const rect = card.getBoundingClientRect();
      const x    = (e.clientX - rect.left) / rect.width  - 0.5;
      const y    = (e.clientY - rect.top)  / rect.height - 0.5;
      card.style.transform = `perspective(600px) rotateY(${(x*12).toFixed(2)}deg) rotateX(${(-y*10).toFixed(2)}deg) translateY(-6px)`;
    });
    card.addEventListener('mouseleave', () => { card.style.transform = ''; });
  });
})();

/* ── PRO SECTION SHAPES ── */
(function initSectionShapes() {

  const CONFIGS = {
    'about':            { color: [0, 200, 255],   count: 18 },
    'skills-section':   { color: [0, 255, 180],   count: 18 },
    'projects':         { color: [160, 0, 255],   count: 18 },
    'feedback-section': { color: [255, 120, 0],   count: 18 }
  };

  const TYPES = ['cube', 'ring', 'triangle', 'diamond', 'dot', 'hexagon', 'cross', 'pill'];

  function createShapes(section, color, count) {
    const [r, g, b] = color;
    const shapes = [];

    for (let i = 0; i < count; i++) {
      const el   = document.createElement('div');
      const type = TYPES[i % TYPES.length];

      // Random scatter across full section
      const bx = 3 + Math.random() * 94;
      const by = 3 + Math.random() * 94;
      const size = 18 + Math.random() * 32;
      const baseRot = Math.random() * 360;

      el.className = `fs fs-${type}`;
      el.style.cssText = `
        left: ${bx}%;
        top:  ${by}%;
        width: ${size}px;
        height: ${size}px;
        --r: ${r}; --g: ${g}; --b: ${b};
        --rot: ${baseRot}deg;
      `;

      section.appendChild(el);
      shapes.push({ el, bx, by, vx: 0, vy: 0, tx: 0, ty: 0, rot: baseRot, baseRot });
    }
    return shapes;
  }

  function lerp(a, b, t) { return a + (b - a) * t; }

  Object.entries(CONFIGS).forEach(([key, cfg]) => {
    const section = document.getElementById(key) ||
                    document.querySelector('.' + key);
    if (!section) return;

    section.style.position = 'relative';
    section.style.overflow = 'hidden';

    const shapes = createShapes(section, cfg.color, cfg.count);
    let mx = -999, my = -999;
    let rafId = null;

    // Track mouse across full section
    section.addEventListener('mousemove', (e) => {
      const rect = section.getBoundingClientRect();
      mx = (e.clientX - rect.left) / rect.width  * 100;
      my = (e.clientY - rect.top)  / rect.height * 100;
      if (!rafId) rafId = requestAnimationFrame(tick);
    });

    section.addEventListener('mouseleave', () => {
      mx = -999; my = -999;
    });

    function tick() {
      rafId = null;
      let anyVisible = false;

      shapes.forEach((s, i) => {
        const dist = Math.hypot(mx - s.bx, my - s.by);
        const range = 28; // influence radius in % units

        let targetTx, targetTy, targetOpacity, targetScale;

        if (mx === -999) {
          targetTx = 0; targetTy = 0;
          targetOpacity = 0;
          targetScale = 0.6;
        } else if (dist < range) {
          const strength  = Math.pow(1 - dist / range, 1.5);
          const angle     = Math.atan2(my - s.by, mx - s.bx);
          const push      = strength * 55;
          targetTx        = -Math.cos(angle) * push;
          targetTy        = -Math.sin(angle) * push;
          targetOpacity   = 0.25 + strength * 0.65;
          targetScale     = 0.9 + strength * 0.7;
          anyVisible      = true;
        } else {
          // fade in softly based on proximity
          const fade = Math.max(0, 1 - (dist - range) / 40);
          targetTx = 0; targetTy = 0;
          targetOpacity = fade * 0.18;
          targetScale = 0.7 + fade * 0.2;
          if (fade > 0) anyVisible = true;
        }

        s.tx  = lerp(s.tx,  targetTx,  0.12);
        s.ty  = lerp(s.ty,  targetTy,  0.12);
        s.rot = lerp(s.rot, s.baseRot + (targetScale - 1) * 120, 0.08);

        const op = parseFloat(s.el.style.opacity || 0);
        s.el.style.opacity   = lerp(op, targetOpacity, 0.1).toFixed(3);
        s.el.style.transform =
          `translate(${s.tx.toFixed(2)}px, ${s.ty.toFixed(2)}px)
           scale(${targetScale.toFixed(3)})
           rotate(${s.rot.toFixed(2)}deg)`;
      });

      if (mx !== -999 || anyVisible) {
        rafId = requestAnimationFrame(tick);
      }
    }
  });
})();

/* ── SCROLL HINT HIDE ── */
const scrollHint = document.querySelector('.scroll-hint');
window.addEventListener('scroll', () => {
  if (scrollHint) {
    scrollHint.classList.toggle('hide', window.scrollY > 50);
  }
}, { passive: true });\


// Create button
const btn = document.createElement("div");
btn.id = "scrollTopBtn";
btn.innerHTML = "↑";
document.body.appendChild(btn);

// Show on scroll
window.addEventListener("scroll", () => {
  if (window.scrollY > 300) {
    btn.classList.add("visible");
  } else {
    btn.classList.remove("visible");
  }
});

// Scroll to top
btn.addEventListener("click", () => {
  window.scrollTo({ top: 0, behavior: "smooth" });
});
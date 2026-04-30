/* ============================================================
   ABHI KUNWAR PORTFOLIO — SCRIPT.JS  (FINAL MERGED BUILD)
   ============================================================ */

gsap.registerPlugin(ScrollTrigger);

if ('scrollRestoration' in history) {
  history.scrollRestoration = 'manual';
}

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
  const resume   = document.querySelector('.resume-wrapper');

  if (!heroText) return;

  // 🔥 1. Hero text tabhi aaye jab hero scroll complete ho
  if (p > 0.95) {
    heroText.style.opacity = 1;
    heroText.classList.add('reveal');
  } else {
    heroText.style.opacity = 0;
  }

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
  const vBot = ctx.createLinearGradient(0, H * 0.6, 0, H);
  vBot.addColorStop(0,   'rgba(0,0,0,0)');
  vBot.addColorStop(0.6, 'rgba(0,0,0,0.1)');
  vBot.addColorStop(0.85, 'rgba(0,0,0,0.25)');
  vBot.addColorStop(1.0, 'rgba(0,0,0,0.47)');
  ctx.fillStyle = vBot; ctx.fillRect(0, 0, W, H);

  const vL = ctx.createLinearGradient(0, 0, W * 0.22, 0);
  vL.addColorStop(0, 'rgba(0,0,0,0.2)'); vL.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.fillStyle = vL; ctx.fillRect(0, 0, W, H);

  const vR = ctx.createLinearGradient(W, 0, W * 0.78, 0);
  vR.addColorStop(0, 'rgba(0,0,0,0.14)'); vR.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.fillStyle = vR; ctx.fillRect(0, 0, W, H);

  const topA = clamp(1 - p * 2, 0, 0.35);
  const vT   = ctx.createLinearGradient(0, 0, 0, H * 0.4);
  vT.addColorStop(0, `rgba(0,0,0,${topA})`); vT.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.fillStyle = vT; ctx.fillRect(0, 0, W, H);

  const darkAlpha = clamp((p - 0.5) / 0.6, 0, 0.4);
  ctx.fillStyle   = `rgba(0,0,0,${darkAlpha})`;
  ctx.fillRect(0, 0, W, H);

  updateHeroText(p);
 
}


/* ---------- RAF LOOP ---------- */
function canvasTick(now) {
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


// SMOOTH NAVBAR SCROLL

// FINAL SMOOTH SCROLL FIX
function smoothScrollTo(target) {
  const navbar = document.getElementById('top-bar');
  const offset = navbar ? navbar.offsetHeight : 0;

  const elementPosition = target.getBoundingClientRect().top + window.pageYOffset;
  const offsetPosition = elementPosition - offset;

  // wait for layout settle (IMPORTANT)
  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
      });
    });
  });
}

document.querySelectorAll('a[href^="#"]').forEach(link => {
  link.addEventListener('click', function (e) {
    const id = this.getAttribute('href');
    const target = document.querySelector(id);

    if (!target) return;

    e.preventDefault();

    smoothScrollTo(target);
  });
});
// FIX FIRST CLICK ISSUE
window.addEventListener('load', () => {
  setTimeout(() => {
    window.scrollTo(0, 0);
  }, 10);
});


/* ============================================================
   3.  CYBER PRELOADER
   ============================================================ */
window.addEventListener('load', () => {
  const preloader = document.getElementById('preloader');
  if (!preloader) return;

  /* Matrix canvas — use mc2 to avoid conflict with hero mask canvas variable */
  const mc2 = document.getElementById('mc');
  const c2  = mc2.getContext('2d');
  let PW, PH;

  function preloaderResize() {
    PW = mc2.width  = window.innerWidth;
    PH = mc2.height = window.innerHeight;
  }
  preloaderResize();
  window.addEventListener('resize', preloaderResize);

  const CHARS = 'アイウエオカキクケコ0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ@#$%&';
  const drops = Array.from({ length: 70 }, () => Math.random() * -80);
  let matrixRunning = true;

  function drawMatrix() {
    if (!matrixRunning) return;
    c2.fillStyle = 'rgba(2,12,5,0.07)';
    c2.fillRect(0, 0, PW, PH);
    c2.font = "13px 'Share Tech Mono', monospace";
    const colW = PW / drops.length;
    drops.forEach((y, i) => {
      const text = CHARS[Math.floor(Math.random() * CHARS.length)];
      c2.fillStyle = Math.random() > 0.93 ? 'rgba(200,255,210,0.95)' : 'rgba(0,255,65,0.65)';
      c2.fillText(text, i * colW, y * 16);
      if (y * 16 > PH && Math.random() > 0.975) drops[i] = 0;
      drops[i] += 0.6;
    });
    requestAnimationFrame(drawMatrix);
  }
  drawMatrix();

  /* Greetings */
  const greetings = ['Hello','नमस्ते','Hola','Bonjour','Ciao','Olá','Здравствуйте','Merhaba','Hej','Hallo'];
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
  const FULL    = 'ABHI KUNWAR';
  const LETTERS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';

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


/* ============================================================
   6.  DOM READY — AOS + EmailJS + Skill colors + Typing effect
   ============================================================ */
window.addEventListener('DOMContentLoaded', () => {

  if (typeof AOS !== 'undefined') {
    AOS.init({ duration: 800, once: false, mirror: true, offset: 100 });
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
      if (!/^[a-zA-Z0-9._%+-]+@gmail\.com$/.test(email)) { alert('❌ Enter a valid Gmail address'); return; }
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

  const CARD_WIDTH     = 130;
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


/* ============================================================
   9.  PARTICLE SPARKLES
   ============================================================ */



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

/* ============================================================
   12.  start se load site
   ============================================================ */
window.addEventListener('load', () => {
  window.scrollTo({
    top: 0,
    behavior: 'instant'
  });
});

window.addEventListener('load', () => {
  setTimeout(() => {
    window.dispatchEvent(new Event('resize'));
  }, 300);
});

window.addEventListener('load', () => {
  document.body.style.overflowAnchor = "none";
});

/* ============================================================
   13. MOUSE REVEAL — CONSTELLATION / SPOTLIGHT EFFECT
       (mainContent bg mein mouse jahan jaye wahan reveal ho)
   ============================================================ */
(function initMouseReveal() {
  const main = document.getElementById('mainContent');
  if (!main) return;

  /* --- Canvas inject karo --- */
  const canvas = document.createElement('canvas');
  canvas.id = 'revealCanvas';
  document.body.insertBefore(canvas, main);
  const rctx = canvas.getContext('2d');

  /* --- Grid overlay inject --- */
  const grid = document.createElement('div');
  grid.id = 'gridOverlay';
  main.insertBefore(grid, main.firstChild);

  /* --- Floating orbs inject --- */
  [1,2,3].forEach(n => {
    const orb = document.createElement('div');
    orb.className = `orb orb-${n}`;
    main.appendChild(orb);
    setTimeout(() => orb.classList.add('visible'), 500 * n);
  });

  let W, H, mx = -999, my = -999;
  let particles = [];
  let rafId;
  let isActive = false;

  function resize() {
    W = canvas.width  = window.innerWidth;
    H = canvas.height = window.innerHeight;
  }
  resize();
  window.addEventListener('resize', resize, { passive: true });

  /* Particle class — cursor trail nodes */
  class Particle {
    constructor(x, y) {
      this.x = x; this.y = y;
      this.ox = x; this.oy = y;
      this.vx = (Math.random() - 0.5) * 1.2;
      this.vy = (Math.random() - 0.5) * 1.2 - 0.4;
      this.life = 1;
      this.decay = 0.016 + Math.random() * 0.012;
      this.size = 1.5 + Math.random() * 2.5;
      this.hue = 180 + Math.random() * 80; /* cyan to blue */
    }
    update() {
      this.x += this.vx;
      this.y += this.vy;
      this.vy += 0.02; /* gravity */
      this.life -= this.decay;
    }
    draw(ctx) {
      ctx.save();
      ctx.globalAlpha = Math.max(0, this.life) * 0.8;
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.size * this.life, 0, Math.PI * 2);
      ctx.fillStyle = `hsl(${this.hue}, 100%, 70%)`;
      ctx.fill();
      ctx.restore();
    }
  }

  /* Constellation nodes — fixed points that connect near cursor */
  const NODES = [];
  const NODE_COUNT = 60;
  for (let i = 0; i < NODE_COUNT; i++) {
    NODES.push({
      x: Math.random(),  /* normalized 0-1 */
      y: Math.random(),
      vx: (Math.random() - 0.5) * 0.0002,
      vy: (Math.random() - 0.5) * 0.0002,
      r: 1 + Math.random() * 1.5
    });
  }

  let frameCount = 0;

  function drawReveal() {
    rafId = requestAnimationFrame(drawReveal);
    if (!isActive) return;

    rctx.clearRect(0, 0, W, H);

    /* Only draw when cursor is within mainContent bounds */
    const mRect = main.getBoundingClientRect();
    const inMain = (my > mRect.top && my < mRect.bottom && mx > 0 && mx < W);
    if (!inMain) return;

    frameCount++;

    /* 1. Spotlight reveal */
    const spotR = 220;
    const spot = rctx.createRadialGradient(mx, my, 0, mx, my, spotR);
    spot.addColorStop(0,   'rgba(0,229,255,0.055)');
    spot.addColorStop(0.4, 'rgba(0,100,200,0.025)');
    spot.addColorStop(1,   'rgba(0,0,0,0)');
    rctx.fillStyle = spot;
    rctx.fillRect(0, 0, W, H);

    /* 2. Constellation */
    const CONNECT_DIST = 140;
    const CURSOR_DIST  = 200;

    NODES.forEach(n => {
      n.x += n.vx; n.y += n.vy;
      if (n.x < 0) n.x = 1; if (n.x > 1) n.x = 0;
      if (n.y < 0) n.y = 1; if (n.y > 1) n.y = 0;
    });

    NODES.forEach((n, i) => {
      const nx = n.x * W;
      const ny = n.y * H + mRect.top; /* offset by mainContent scroll */
      const screenY = ny - window.scrollY;

      const dCursor = Math.hypot(mx - nx, my - screenY);
      if (dCursor > CURSOR_DIST + 60) return; /* only near cursor */

      const alpha = Math.max(0, 1 - dCursor / (CURSOR_DIST + 60));

      /* Draw node dot */
      rctx.save();
      rctx.globalAlpha = alpha * 0.7;
      rctx.beginPath();
      rctx.arc(nx, screenY, n.r, 0, Math.PI * 2);
      rctx.fillStyle = `rgba(0,229,255,0.9)`;
      rctx.shadowBlur = 6;
      rctx.shadowColor = '#00e5ff';
      rctx.fill();
      rctx.restore();

      /* Connect nearby nodes */
      NODES.slice(i + 1).forEach(m => {
        const mx2 = m.x * W;
        const my2 = m.y * H + mRect.top - window.scrollY;
        const d = Math.hypot(nx - mx2, screenY - my2);
        if (d < CONNECT_DIST) {
          const lineAlpha = alpha * (1 - d / CONNECT_DIST) * 0.5;
          rctx.save();
          rctx.globalAlpha = lineAlpha;
          rctx.strokeStyle = `rgba(0,180,255,0.8)`;
          rctx.lineWidth = 0.6;
          rctx.beginPath();
          rctx.moveTo(nx, screenY);
          rctx.lineTo(mx2, my2);
          rctx.stroke();
          rctx.restore();
        }
      });

      /* Line from cursor to nearest nodes */
      if (dCursor < 100) {
        const la = (1 - dCursor / 100) * 0.35;
        rctx.save();
        rctx.globalAlpha = la;
        rctx.strokeStyle = 'rgba(0,229,255,0.6)';
        rctx.lineWidth = 0.8;
        rctx.setLineDash([3, 5]);
        rctx.beginPath();
        rctx.moveTo(mx, my);
        rctx.lineTo(nx, screenY);
        rctx.stroke();
        rctx.setLineDash([]);
        rctx.restore();
      }
    });

    /* 3. Particle sparkles */
    if (frameCount % 3 === 0 && inMain) {
      particles.push(new Particle(mx, my));
      particles.push(new Particle(mx + (Math.random()-0.5)*8, my + (Math.random()-0.5)*8));
    }
    particles = particles.filter(p => p.life > 0);
    particles.forEach(p => { p.update(); p.draw(rctx); });

    /* 4. Ring pulse at cursor */
    const pulseR = 28 + Math.sin(frameCount * 0.08) * 6;
    rctx.save();
    rctx.globalAlpha = 0.12;
    rctx.strokeStyle = '#00e5ff';
    rctx.lineWidth = 1;
    rctx.beginPath();
    rctx.arc(mx, my, pulseR, 0, Math.PI * 2);
    rctx.stroke();
    rctx.globalAlpha = 0.06;
    rctx.beginPath();
    rctx.arc(mx, my, pulseR * 1.7, 0, Math.PI * 2);
    rctx.stroke();
    rctx.restore();
  }

  /* Activate reveal canvas when mainContent is settled */
  const observer = new MutationObserver(() => {
    if (main.classList.contains('settled') || parseFloat(main.style.opacity) > 0.5) {
      canvas.classList.add('active');
      isActive = true;
      if (!rafId) drawReveal();
    }
  });
  observer.observe(main, { attributes: true, attributeFilter: ['class', 'style'] });

  /* Also activate on scroll past hero */
  window.addEventListener('scroll', () => {
    if (window.scrollY > window.innerHeight * 1.5) {
      canvas.classList.add('active');
      isActive = true;
      if (!rafId) drawReveal();
    }
  }, { passive: true });

  document.addEventListener('mousemove', (e) => {
    mx = e.clientX;
    my = e.clientY;
  });
})();


/* ============================================================
   14. MAGNETIC HIGHLIGHT CARDS — smooth follow
   ============================================================ */
(function initMagneticCards() {
  function applyMagnetic(els, strength) {
    els.forEach(el => {
      el.addEventListener('mousemove', (e) => {
        const rect = el.getBoundingClientRect();
        const cx = rect.left + rect.width / 2;
        const cy = rect.top  + rect.height / 2;
        const dx = (e.clientX - cx) / rect.width;
        const dy = (e.clientY - cy) / rect.height;
        el.style.transform = `translate(${dx * strength}px, ${dy * strength}px)`;
      });
      el.addEventListener('mouseleave', () => {
        el.style.transition = 'transform 0.5s cubic-bezier(0.34,1.56,0.64,1)';
        el.style.transform = '';
        setTimeout(() => el.style.transition = '', 500);
      });
    });
  }
  applyMagnetic(document.querySelectorAll('.cta-btn, .resume-btn'), 8);
  applyMagnetic(document.querySelectorAll('.highlight'), 5);
  applyMagnetic(document.querySelectorAll('.social-link'), 6);
})();


/* ============================================================
   15. SPLIT HEADING ANIMATION
   ============================================================ */
(function initSplitHeadings() {
  const headings = document.querySelectorAll('.section h2, .about-section h2, .skills-section h2, #projects h2, .contact-form-wrapper h2');
  headings.forEach(h => {
    h.classList.add('split-heading');
    const words = h.textContent.trim().split(' ');
    h.innerHTML = words.map(w => `<span class="word">${w}&nbsp;</span>`).join('');

    const io = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        h.classList.add('revealed');
        io.disconnect();
      }
    }, { threshold: 0.3 });
    io.observe(h);
  });
})();


/* ============================================================
   16. SECTION LINE DRAW ON SCROLL
   ============================================================ */
(function initSectionLines() {
  const sections = document.querySelectorAll('#mainContent .section, #mainContent .about-section, #mainContent .skills-section, #mainContent .feedback-section');
  sections.forEach(sec => {
    const line = document.createElement('div');
    line.className = 'section-line';
    sec.prepend(line);

    const io = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        line.classList.add('drawn');
        io.disconnect();
      }
    }, { threshold: 0.1 });
    io.observe(sec);
  });
})();


/* ============================================================
   17. PROJECT CARD — mouse-tracked glow position
   ============================================================ */
document.querySelectorAll('.project-card').forEach(card => {
  card.addEventListener('mousemove', (e) => {
    const rect = card.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width  * 100).toFixed(1) + '%';
    const y = ((e.clientY - rect.top)  / rect.height * 100).toFixed(1) + '%';
    card.style.setProperty('--mx', x);
    card.style.setProperty('--my', y);
  });
});


/* ============================================================
   18. CURSOR DOT EXPAND in mainContent
   ============================================================ */
(function initCursorExpand() {
  const dot = document.getElementById('cursorDot');
  const main = document.getElementById('mainContent');
  if (!dot || !main) return;
  main.addEventListener('mouseenter', () => dot.classList.add('expanded'));
  main.addEventListener('mouseleave', () => dot.classList.remove('expanded'));
})();
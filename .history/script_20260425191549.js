/* ============================================================
   ABHI KUNWAR PORTFOLIO — SCRIPT.JS (PRODUCTION BUILD)
   Zero bugs · Smooth canvas hero · Professional interactions
   ============================================================ */

gsap.registerPlugin(ScrollTrigger);

/* ============================================================
   CANVAS HERO EFFECT
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
const clamp   = (v, a, b) => Math.max(a, Math.min(b, v));
const easeOut = t => 1 - Math.pow(1 - t, 3);
const easeInOut = t => t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;

/* ---------- SMOOTH SCROLL PROGRESS ---------- */
let smoothP = 0;
const LERP  = 0.12; // faster lerp = snappier response

/* ---------- STATE FLAGS ---------- */
let heroTextVisible  = false;
let heroTextSettled  = false;
let mainSettled      = false;

/* ---------- CANVAS RESIZE ---------- */
function canvasResize() {
  const dpr = window.devicePixelRatio || 1;
  heroCanvas.width  = window.innerWidth  * dpr;
  heroCanvas.height = window.innerHeight * dpr;
  heroCanvas.style.width  = window.innerWidth  + 'px';
  heroCanvas.style.height = window.innerHeight + 'px';
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  if (canvasReady) canvasDraw();
}
window.addEventListener('resize', canvasResize, { passive: true });

/* ---------- SCROLL PROGRESS (0 → 1 over the 220vh heroScroll) ---------- */
function getScrollProgress() {
  const heroScroll = document.getElementById('heroScroll');
  if (!heroScroll) return 0;
  const max = heroScroll.offsetHeight - window.innerHeight;
  return max <= 0 ? 0 : clamp(window.scrollY / max, 0, 1);
}

/* ---------- HERO TEXT FADE & SETTLE ---------- */
function updateHeroText(p) {
  const heroText = document.getElementById('hero');
  if (!heroText || heroTextSettled) return;

  const textAlpha = clamp((p - 0.72) / 0.20, 0, 1);
  heroText.style.opacity = textAlpha;

  if (textAlpha > 0.05 && !heroTextVisible) {
    heroText.classList.add('reveal');
    heroTextVisible = true;
  }
  if (textAlpha < 0.05 && heroTextVisible) {
    heroText.classList.remove('reveal');
    heroTextVisible = false;
  }
}

/* ---------- MAIN CONTENT SLIDE ---------- */
function updateMainContent(p) {
  const main       = document.getElementById('mainContent');
  const heroText   = document.getElementById('hero');
  const hCanvas    = document.getElementById('heroCanvas');
  if (!main || mainSettled) return;

  const slideProgress = clamp((p - 0.30) / 0.70, 0, 1);
  const ease          = easeOut(slideProgress);
  const vh            = window.innerHeight;
  const translateY    = (1 - ease) * vh;
  const opacity       = clamp((p - 0.30) / 0.40, 0, 1);

  main.style.transform = `translateY(${translateY}px)`;
  main.style.opacity   = opacity;

  if (p >= 0.999) {
    mainSettled     = true;
    heroTextSettled = true;

    main.classList.add('settled');
    main.style.transform = '';
    main.style.opacity   = '';

    if (heroText) {
      heroText.classList.add('settled');
      heroText.style.opacity = '';
    }

    if (hCanvas) hCanvas.style.display = 'none';

    main.querySelectorAll('*').forEach(el => {
      el.style.visibility = 'visible';
    });
  }
}

/* ---------- DRAW ---------- */
function canvasDraw() {
  if (!canvasReady) return;

  const W   = window.innerWidth;
  const H   = window.innerHeight;
  const p   = smoothP;
  const dpr = window.devicePixelRatio || 1;

  ctx.clearRect(0, 0, W, H);

  /* Cover-fit the hero image */
  const imgAR  = (hero.naturalWidth  || W) / (hero.naturalHeight || H);
  let imgW = W, imgH = W / imgAR;
  if (imgH < H) { imgH = H; imgW = imgH * imgAR; }

  /* Zoom-out on scroll: 1.35 → 1.00 */
  const zoom    = 1.35 + (1.00 - 1.35) * easeOut(p);
  const scaledW = imgW * zoom;
  const scaledH = imgH * zoom;
  const baseX   = (W - scaledW) * 0.5;
  const baseY   = (H - scaledH) * 0.45;

  /* Background hero layer */
  const heroShiftY = p * scaledH * 0.06;
  ctx.drawImage(hero, baseX, baseY - heroShiftY, scaledW, scaledH);

  /* Name overlay with depth mask */
  const nameW  = W;
  const nameH  = nameW * ((nameImg.naturalHeight || 200) / (nameImg.naturalWidth || W));
  const textY  = (H * 0.85 - nameH / 2)
               + ((H * 0.50 - nameH / 2) - (H * 0.85 - nameH / 2))
               * easeOut(clamp((p - 0.05) / 0.7, 0, 1));
  const nameAlpha = clamp((p - 0.05) / 0.3, 0, 1);

  const mc    = document.createElement('canvas');
  mc.width    = W * dpr;
  mc.height   = H * dpr;
  const mctx  = mc.getContext('2d');
  mctx.scale(dpr, dpr);

  mctx.globalAlpha = nameAlpha;
  mctx.drawImage(nameImg, (W - nameW) / 2, textY, nameW, nameH);

  /* Bottom foreground parallax */
  const bottomShiftY = p * scaledH * 0.12;

  /* Cut name wherever bottom.png is drawn (depth mask) */
  mctx.globalCompositeOperation = 'destination-out';
  mctx.drawImage(bottom, baseX, baseY - bottomShiftY, scaledW, scaledH);

  ctx.drawImage(mc, 0, 0, W * dpr, H * dpr, 0, 0, W, H);

  /* Bottom foreground on top */
  ctx.drawImage(bottom, baseX, baseY - bottomShiftY, scaledW, scaledH);

  /* ---- VIGNETTES ---- */
  // Bottom
  const vBot = ctx.createLinearGradient(0, H * 0.5, 0, H);
  vBot.addColorStop(0, 'rgba(0,0,0,0)');
  vBot.addColorStop(1, 'rgba(0,0,0,0.85)');
  ctx.fillStyle = vBot;
  ctx.fillRect(0, 0, W, H);

  // Left
  const vL = ctx.createLinearGradient(0, 0, W * 0.22, 0);
  vL.addColorStop(0, 'rgba(0,0,0,0.5)');
  vL.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.fillStyle = vL;
  ctx.fillRect(0, 0, W, H);

  // Right
  const vR = ctx.createLinearGradient(W, 0, W * 0.78, 0);
  vR.addColorStop(0, 'rgba(0,0,0,0.4)');
  vR.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.fillStyle = vR;
  ctx.fillRect(0, 0, W, H);

  // Top
  const topA = clamp(1 - p * 2, 0, 0.35);
  const vT   = ctx.createLinearGradient(0, 0, 0, H * 0.4);
  vT.addColorStop(0, `rgba(0,0,0,${topA})`);
  vT.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.fillStyle = vT;
  ctx.fillRect(0, 0, W, H);

  /* Dark overlay as content rises */
  const darkAlpha = clamp((p - 0.35) / 0.55, 0, 0.88);
  ctx.fillStyle   = `rgba(0,0,0,${darkAlpha})`;
  ctx.fillRect(0, 0, W, H);

  /* Update hero text & main content */
  updateHeroText(p);
  updateMainContent(p);
}

/* ---------- RAF LOOP ---------- */
function canvasTick() {
  const rawP = getScrollProgress();
  smoothP   += (rawP - smoothP) * LERP;

  /* If user scrolls back into hero zone — reset settled state */
  if (rawP < 0.98 && mainSettled) {
    mainSettled     = false;
    heroTextSettled = false;

    const main     = document.getElementById('mainContent');
    const heroText = document.getElementById('hero');
    const hCanvas  = document.getElementById('heroCanvas');

    if (main)     { main.classList.remove('settled'); }
    if (heroText) { heroText.classList.remove('settled'); heroText.classList.remove('reveal'); }
    if (hCanvas)  { hCanvas.style.display = ''; }
  }

  canvasDraw();
  requestAnimationFrame(canvasTick);
}

function canvasInit() {
  canvasResize();
  canvasTick();
}


/* ============================================================
   NAVBAR SCROLL EFFECT
   ============================================================ */
const topBar = document.getElementById('top-bar');
let lastScroll = 0;

window.addEventListener('scroll', () => {
  const currentScroll = window.pageYOffset;
  if (!topBar) return;

  topBar.classList.toggle('scrolled', currentScroll > 20);
  topBar.classList.toggle('hide', currentScroll > lastScroll && currentScroll > 80);
  lastScroll = Math.max(currentScroll, 0);
}, { passive: true });


/* ============================================================
   CYBER PRELOADER
   ============================================================ */
window.addEventListener('load', () => {

  const preloader = document.getElementById('preloader');
  if (!preloader) return;

  /* Matrix canvas */
  const canvas = document.getElementById('mc');
  const mctx   = canvas.getContext('2d');
  let W, H;

  function resizeMatrix() {
    W = canvas.width  = window.innerWidth;
    H = canvas.height = window.innerHeight;
  }
  resizeMatrix();
  window.addEventListener('resize', resizeMatrix, { passive: true });

  const CHARS = 'アイウエオカキクケコ0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ@#$%&';
  const drops = Array.from({ length: 70 }, () => Math.random() * -80);
  let matrixRunning = true;

  function drawMatrix() {
    if (!matrixRunning) return;
    mctx.fillStyle = 'rgba(2,12,5,0.07)';
    mctx.fillRect(0, 0, W, H);
    mctx.font = "13px 'Share Tech Mono', monospace";

    const colW = W / drops.length;
    for (let i = 0; i < drops.length; i++) {
      const text = CHARS[Math.floor(Math.random() * CHARS.length)];
      const x    = i * colW;
      const y    = drops[i] * 16;
      mctx.fillStyle = Math.random() > 0.93
        ? 'rgba(200,255,210,0.95)'
        : 'rgba(0,255,65,0.65)';
      mctx.fillText(text, x, y);
      if (y > H && Math.random() > 0.975) drops[i] = 0;
      drops[i] += 0.6;
    }
    requestAnimationFrame(drawMatrix);
  }
  drawMatrix();

  /* Greetings */
  const greetings = [
    'Hello', 'नमस्ते', 'Hola', 'Bonjour', 'Ciao',
    'Olá', 'Здравствуйте', 'Merhaba', 'Hej', 'Hallo'
  ];
  const greetEl   = document.getElementById('greetEl');
  let gi = 0;
  const totalTime = 1800;
  const per       = totalTime / greetings.length;

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

  function runGreetings(callback) {
    greetEl.textContent = greetings[0];
    animIn();

    function next() {
      if (gi >= greetings.length - 1) { animOut(callback); return; }
      animOut(() => {
        gi++;
        greetEl.textContent = greetings[gi];
        animIn();
        setTimeout(next, per - 120);
      });
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
      nameEl.textContent = str;
      glR.textContent    = str;
      glG.textContent    = str;
      count++;
      if (count % 3 === 0 && rev < FULL.length) rev++;
      if (rev < FULL.length) {
        setTimeout(loop, 45);
      } else {
        nameEl.textContent = FULL;
        glR.textContent    = FULL;
        glG.textContent    = FULL;
        if (callback) callback();
      }
    }
    loop();
  }

  /* Glitch */
  function glitch() {
    let r = 0;
    const max = 8;
    function g() {
      if (r >= max) {
        glR.style.opacity = 0;
        glG.style.opacity = 0;
        return;
      }
      const dx = (Math.random() - 0.5) * 14;
      const dy = (Math.random() - 0.5) * 5;
      glR.style.opacity   = 0.75;
      glG.style.opacity   = 0.5;
      glR.style.transform = `translate(${dx}px, ${dy}px)`;
      glG.style.transform = `translate(${-dx}px, ${-dy}px)`;
      r++;
      setTimeout(g, 30);
    }
    g();
  }

  /* Progress */
  const fill     = document.getElementById('fill');
  const pctL     = document.getElementById('pctL');
  const pctC     = document.getElementById('pctC');
  const stTxt    = document.getElementById('stTxt');
  const statuses = ['LOADING', 'PARSING DATA', 'BUILDING WORLD', 'ALMOST READY', 'COMPLETE'];
  let si = 0;

  function nextStatus() {
    if (si < statuses.length - 1) { si++; stTxt.textContent = statuses[si]; }
  }

  function runProgress(duration, callback) {
    let progress = 0;
    const interval = setInterval(() => {
      progress += Math.random() * 3.5 + 0.5;
      if (progress >= 100) {
        progress = 100;
        clearInterval(interval);
        nextStatus();
        if (callback) setTimeout(callback, 200);
      }
      const p = Math.floor(progress);
      fill.style.width  = p + '%';
      pctL.textContent  = p + '%';
      pctC.textContent  = p + '%';
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

      scramble(() => {
        glitch();
        setTimeout(glitch, 400);
      });

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
   HAMBURGER
   ============================================================ */
const hamburger = document.getElementById('hamburger');
const navLinks  = document.getElementById('nav-links');

if (hamburger && navLinks) {
  hamburger.addEventListener('click', () => navLinks.classList.toggle('active'));

  // Close on outside click
  document.addEventListener('click', (e) => {
    if (!hamburger.contains(e.target) && !navLinks.contains(e.target)) {
      navLinks.classList.remove('active');
    }
  });
}

document.querySelectorAll('.nav-links a').forEach(link => {
  link.addEventListener('click', (e) => {
    e.preventDefault();
    navLinks.classList.remove('active');

    const href       = link.getAttribute('href');
    const isHome     = href === '#home' || href === '#';
    const target     = isHome ? null : document.querySelector(href);
    const heroScroll = document.getElementById('heroScroll');
    const heroEnd    = heroScroll ? heroScroll.offsetHeight - window.innerHeight : 0;
    const inHeroZone = window.scrollY <= heroEnd;

  function scrollToSection(target) {
  if (!target) return;
  const heroScroll = document.getElementById('heroScroll');
  const heroEnd = heroScroll ? heroScroll.offsetHeight - window.innerHeight : 0;
  const targetTop = heroEnd + window.innerHeight + target.offsetTop;
  window.scrollTo({ top: targetTop, behavior: 'smooth' });
}

if (isHome) {
  window.scrollTo({ top: 0, behavior: 'smooth' });
  return;
}

if (inHeroZone) {
  window.scrollTo({ top: heroEnd + 10, behavior: 'smooth' });
  setTimeout(() => scrollToSection(target), 600);
} else {
  scrollToSection(target);
}
  });
});

/* ============================================================
   CUSTOM CURSOR
   ============================================================ */
const dot  = document.getElementById('cursorDot');
const ring = document.getElementById('cursorRing');

if (dot && ring) {
  // Hide on mobile
  if ('ontouchstart' in window) {
    dot.style.display  = 'none';
    ring.style.display = 'none';
  } else {
    let mouseX = 0, mouseY = 0;
    let ringX  = 0, ringY  = 0;
    let velX   = 0, velY   = 0;
    const stiffness = 0.20;
    const damping   = 0.72;

    document.addEventListener('mousemove', (e) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
      dot.style.transform = `translate(${mouseX}px, ${mouseY}px)`;
    });

    function animateRing() {
      const dx = mouseX - ringX;
      const dy = mouseY - ringY;
      velX += dx * stiffness;
      velY += dy * stiffness;
      velX *= damping;
      velY *= damping;
      ringX += velX;
      ringY += velY;
      ring.style.transform = `translate(${ringX}px, ${ringY}px)`;
      requestAnimationFrame(animateRing);
    }
    animateRing();

    const hoverTargets = document.querySelectorAll('a, button, .skill, .project-card, .highlight');
    hoverTargets.forEach(el => {
      el.addEventListener('mouseenter', () => ring.classList.add('hovered'));
      el.addEventListener('mouseleave', () => ring.classList.remove('hovered'));
    });

    document.addEventListener('mousedown', () => ring.classList.add('click'));
    document.addEventListener('mouseup',   () => ring.classList.remove('click'));
  }
}


/* ============================================================
   DOM LOADED — AOS + EmailJS
   ============================================================ */
window.addEventListener('DOMContentLoaded', () => {

  if (typeof AOS !== 'undefined') {
    AOS.init({ duration: 800, once: false, mirror: true, offset: 100 });
  }

  if (window.emailjs) {
    emailjs.init('vI-NhtzREwXqZQq5N');
  }

  const form = document.getElementById('feedback-form');
  if (form && window.emailjs) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const name    = form.from_name.value.trim();
      const email   = form.from_email.value.trim();
      const message = form.message.value.trim();

      if (!name || !email || !message) { alert('❌ Please fill all fields'); return; }

      const gmailPattern = /^[a-zA-Z0-9._%+-]+@gmail\.com$/;
      if (!gmailPattern.test(email)) { alert('❌ Enter a valid Gmail address'); return; }

      const btn = form.querySelector("button[type='submit']");
      btn.textContent = 'Sending…';
      btn.disabled    = true;

      emailjs.sendForm('service_71kywa9', 'template_lh1bgai', form)
        .then(() => { alert('✅ Message sent successfully!'); form.reset(); })
        .catch(() => alert('❌ Failed to send. Please try again.'))
        .finally(() => {
          btn.innerHTML = '<i class="fas fa-paper-plane"></i> Send Message';
          btn.disabled  = false;
        });
    });
  }

  document.querySelectorAll('.skill').forEach(skill => {
    const color = skill.getAttribute('data-color');
    if (color) skill.style.setProperty('--skill-color', color);
  });

  /* ---- TYPING EFFECT on hero subtitle ---- */
  function initTypingEffect() {
    const heroP = document.querySelector('.hero-text p');
    if (!heroP) return;
    const phrases = ['IT Learner', 'Frontend Developer', 'Creative Builder', 'UI/UX Enthusiast'];
    let pi = 0, ci = 0, deleting = false;
    const MIN_WAIT = 1800, TYPE_SPEED = 80, DEL_SPEED = 45;

    function type() {
      const current = phrases[pi];
      if (!deleting) {
        heroP.textContent = current.slice(0, ci + 1);
        ci++;
        if (ci === current.length) {
          deleting = true;
          setTimeout(type, MIN_WAIT);
          return;
        }
      } else {
        heroP.textContent = current.slice(0, ci - 1);
        ci--;
        if (ci === 0) {
          deleting = false;
          pi = (pi + 1) % phrases.length;
        }
      }
      setTimeout(type, deleting ? DEL_SPEED : TYPE_SPEED);
    }
    type();
  }

  // Start typing only after hero text is revealed
  const heroTextObserver = new MutationObserver((mutations) => {
    for (const m of mutations) {
      if ([...m.addedNodes].length || m.target.classList.contains('reveal')) {
        if (document.querySelector('.hero-text.reveal') || document.querySelector('.hero-text.settled')) {
          initTypingEffect();
          heroTextObserver.disconnect();
        }
      }
    }
  });
  const heroEl = document.getElementById('hero');
  if (heroEl) heroTextObserver.observe(heroEl, { attributes: true, attributeFilter: ['class'] });
});


/* ============================================================
   SKILLS INFINITE SCROLL
   ============================================================ */
window.addEventListener('load', () => {
  const track   = document.getElementById('skillsTrack');
  const wrapper = document.querySelector('.skills-wrapper');
  if (!track || !wrapper) return;

  if (!track.classList.contains('tripled')) {
    track.innerHTML += track.innerHTML + track.innerHTML;
    track.classList.add('tripled');
  }

  let offset = 0;
  let paused = false;
  const CARD_WIDTH     = 130;
  const singleSetWidth = (track.children.length / 3) * CARD_WIDTH;

  wrapper.addEventListener('mouseenter', () => { paused = true;  });
  wrapper.addEventListener('mouseleave', () => { paused = false; });

  function animate() {
    if (!paused) {
      offset += 0.5;
      if (offset >= singleSetWidth) offset -= singleSetWidth;
      track.style.transform = `translateX(-${offset}px)`;
    }
    requestAnimationFrame(animate);
  }
  animate();
});


/* ============================================================
   GSAP SCROLL ANIMATIONS
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
   PARTICLE SPARKLES on Hero (lightweight, CSS-only via JS)
   ============================================================ */
(function createParticles() {
  const container = document.body; // fixed position ke liye body mein dalo
  if (!container) return;
  const NUM = 28;
  for (let i = 0; i < NUM; i++) {
    const sp = document.createElement('span');
    sp.className = 'hero-particle';
    sp.style.cssText = `
      left:${Math.random() * 100}%;
      top:${Math.random() * 100}%;
      animation-delay:${(Math.random() * 6).toFixed(2)}s;
      animation-duration:${(4 + Math.random() * 5).toFixed(2)}s;
      width:${(1.5 + Math.random() * 2).toFixed(1)}px;
      height:${(1.5 + Math.random() * 2).toFixed(1)}px;
      opacity:${(0.2 + Math.random() * 0.5).toFixed(2)};
    `;
    container.appendChild(sp);
  }
})();


/* ============================================================
   SECTION REVEAL — subtle line wipe for headings
   ============================================================ */
document.querySelectorAll('.section h2, .skills-section h2').forEach(h2 => {
  h2.classList.add('heading-wipe');
});


/* ============================================================
   SCROLL-TO-TOP BUTTON
   ============================================================ */
(function initScrollTop() {
  const btn = document.createElement('button');
  btn.id        = 'scrollTopBtn';
  btn.innerHTML = '<i class="fas fa-chevron-up"></i>';
  btn.setAttribute('aria-label', 'Scroll to top');
  document.body.appendChild(btn);

  window.addEventListener('scroll', () => {
    btn.classList.toggle('visible', window.scrollY > 600);
  }, { passive: true });

  btn.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
})();


/* ============================================================
   TILT EFFECT on Project Cards
   ============================================================ */
(function initTilt() {
  document.querySelectorAll('.project-card').forEach(card => {
    card.addEventListener('mousemove', (e) => {
      const rect  = card.getBoundingClientRect();
      const x     = (e.clientX - rect.left) / rect.width  - 0.5;
      const y     = (e.clientY - rect.top)  / rect.height - 0.5;
      card.style.transform = `
        perspective(600px)
        rotateY(${(x * 12).toFixed(2)}deg)
        rotateX(${(-y * 10).toFixed(2)}deg)
        translateY(-6px)
      `;
    });
    card.addEventListener('mouseleave', () => {
      card.style.transform = '';
    });
  });
})();


/* ============================================================
   ACTIVE NAV LINK HIGHLIGHT (IntersectionObserver)
   ============================================================ */
(function initActiveNav() {
  const sections = document.querySelectorAll('section[id], #about, #skills, #projects, #contact');
  const navItems = document.querySelectorAll('.nav-links a');

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        navItems.forEach(a => a.classList.remove('active-link'));
        const match = document.querySelector(`.nav-links a[href="#${entry.target.id}"]`);
        if (match) match.classList.add('active-link');
      }
    });
  }, { threshold: 0.4 });

  sections.forEach(s => observer.observe(s));
})();
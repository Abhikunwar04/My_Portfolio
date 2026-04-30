/* ============================================================
   ABHI KUNWAR PORTFOLIO — SCRIPT.JS  (FINAL MERGED BUILD)
   • New hero effect (frame-rate-independent LERP, no per-frame
     canvas allocation, proper mask canvas reuse)
   • All preloader / navbar / typing / skills / contact logic
   • Every known bug fixed (see comment blocks below)
   ============================================================ */

gsap.registerPlugin(ScrollTrigger);


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
// onerror also counts so a missing image never blocks the site
hero.onerror = nameImg.onerror = bottom.onerror = checkImagesLoaded;
// Fallback: if images are very slow, proceed after 800ms anyway
setTimeout(() => { if (!canvasReady) { canvasReady = true; canvasInit(); } }, 800);


/* ---------- HELPERS ---------- */
const clamp     = (v, a, b) => Math.max(a, Math.min(b, v));
const easeOut   = t => 1 - Math.pow(1 - t, 3);
const easeInOut = t => t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;


/* ---------- SMOOTH SCROLL (frame-rate-independent) ----------
   BASE_LERP = fraction of gap to close per 16.67 ms (one 60 fps frame).
   Formula:  alpha = 1 - (1 - BASE_LERP)^(dt / 16.67)
   dt is capped at 4 frames so a tab-switch never causes a jump.
   ---------------------------------------------------------- */
const BASE_LERP = 0.07;
let smoothP  = 0;
let rawP     = 0;
let lastTime = 0;


/* ---------- OFFSCREEN MASK CANVAS ----------
   BUG FIX: old code created a new canvas on EVERY draw() call → memory leak.
   Now we reuse one offscreen canvas, only reallocating on resize.
   ----------------------------------------- */
let mc   = null;
let mctx = null;

function ensureMaskCanvas(W, H, dpr) {
  const needW = Math.ceil(W * dpr);
  const needH = Math.ceil(H * dpr);
  if (!mc || mc.width !== needW || mc.height !== needH) {
    mc       = document.createElement('canvas');
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
  heroCanvas.width   = window.innerWidth  * dpr;
  heroCanvas.height  = window.innerHeight * dpr;
  heroCanvas.style.width  = window.innerWidth  + 'px';
  heroCanvas.style.height = window.innerHeight + 'px';
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  mc = null; // force mask canvas recreation at new size
  if (canvasReady) canvasDraw();
}
window.addEventListener('resize', canvasResize, { passive: true });


/* ---------- SCROLL PROGRESS (0 → 1 over the heroScroll zone) ----------
   BUG FIX: use heroScroll element height, not scrollSpacer, so extra
   content below never mis-calibrates the 0→1 range.
   --------------------------------------------------------------------- */
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
  const main     = document.getElementById('mainContent');
  const heroText = document.getElementById('hero');
  const hCanvas  = document.getElementById('heroCanvas');
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

    // Hide canvas once content has fully settled (saves GPU)
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
  const imgAR = (hero.naturalWidth || W) / (hero.naturalHeight || H);
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

  /* ---- Name overlay with depth mask ---- */
  const nameW = W;
  const nameH = nameW * ((nameImg.naturalHeight || 200) / (nameImg.naturalWidth || W));
  const textY = (H * 0.85 - nameH / 2)
              + ((H * 0.50 - nameH / 2) - (H * 0.85 - nameH / 2))
              * easeOut(clamp((p - 0.05) / 0.7, 0, 1));
  const nameAlpha = clamp((p - 0.05) / 0.3, 0, 1);

  /* Reuse the offscreen mask canvas — never new() inside draw() */
  ensureMaskCanvas(W, H, dpr);
  mctx.clearRect(0, 0, mc.width, mc.height);
  mctx.save();
  mctx.scale(dpr, dpr);

  mctx.globalAlpha = nameAlpha;
  mctx.drawImage(nameImg, (W - nameW) / 2, textY, nameW, nameH);

  /* Bottom foreground parallax shift */
  const bottomShiftY = p * scaledH * 0.12;

  /* Cut name wherever bottom.png is drawn (depth mask) */
  mctx.globalCompositeOperation = 'destination-out';
  mctx.globalAlpha = 1;
  mctx.drawImage(bottom, baseX, baseY - bottomShiftY, scaledW, scaledH);

  mctx.restore();
  ctx.drawImage(mc, 0, 0, mc.width, mc.height, 0, 0, W, H);

  /* Bottom foreground on top */
  ctx.drawImage(bottom, baseX, baseY - bottomShiftY, scaledW, scaledH);

  /* ---- VIGNETTES ---- */
  // Bottom — smooth multi-stop for cinematic feel
  const vBot = ctx.createLinearGradient(0, H * 0.5, 0, H);
  vBot.addColorStop(0,   'rgba(0,0,0,0)');
  vBot.addColorStop(0.5, 'rgba(0,0,0,0.2)');
  vBot.addColorStop(0.8, 'rgba(0,0,0,0.65)');
  vBot.addColorStop(1.0, 'rgba(0,0,0,0.97)');
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

  // Top (fades out as user scrolls)
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

  /* Sync hero text + main content */
  updateHeroText(p);
  updateMainContent(p);
}


/* ---------- RAF LOOP ---------- */
function canvasTick(now) {
  const dt        = lastTime ? Math.min(now - lastTime, 4 * 16.67) : 16.67;
  lastTime        = now;

  rawP            = getScrollProgress();
  const lerpAlpha = 1 - Math.pow(1 - BASE_LERP, dt / 16.67);
  smoothP        += (rawP - smoothP) * lerpAlpha;

  /* BUG FIX: Scroll back into hero zone → reset settled state properly.
     Old code caused a black-flash because heroCanvas.style.display was
     reset in the same frame smoothP jumped.  Now we gate on smoothP < 0.97
     (not rawP) so the canvas is guaranteed visible before draw() runs. */
  if (smoothP < 0.97 && mainSettled) {
    mainSettled     = false;
    heroTextSettled = false;

    const main     = document.getElementById('mainContent');
    const heroText = document.getElementById('hero');
    const hCanvas  = document.getElementById('heroCanvas');

    if (hCanvas)  { hCanvas.style.display = ''; }   // show canvas FIRST
    if (main)     { main.classList.remove('settled'); }
    if (heroText) {
      heroText.classList.remove('settled');
      heroText.classList.remove('reveal');
    }
  }

  canvasDraw();
  requestAnimationFrame(canvasTick);
}


/* ---------- INIT ---------- */
function canvasInit() {
  canvasResize();
  requestAnimationFrame(canvasTick);
}


/* ============================================================
   2.  PRELOADER
   ============================================================ */
(function initPreloader() {
  /* ---- Matrix rain on #mc canvas ---- */
  const mc2 = document.getElementById('mc');
  if (mc2) {
    const c2  = mc2.getContext('2d');
    mc2.width  = window.innerWidth;
    mc2.height = window.innerHeight;
    const cols = Math.floor(mc2.width / 14);
    const drops = Array(cols).fill(1);
    const chars  = 'アイウエオカキクケコABCDEF0123456789@#$%';

    function rainDraw() {
      c2.fillStyle = 'rgba(0,0,0,0.05)';
      c2.fillRect(0, 0, mc2.width, mc2.height);
      c2.fillStyle = '#00ff41';
      c2.font      = '13px "Share Tech Mono", monospace';
      drops.forEach((y, i) => {
        const ch = chars[Math.floor(Math.random() * chars.length)];
        c2.fillText(ch, i * 14, y * 14);
        if (y * 14 > mc2.height && Math.random() > 0.975) drops[i] = 0;
        drops[i]++;
      });
    }
    const rainInterval = setInterval(rainDraw, 45);

    /* ---- Greeting cycle ---- */
    const greetEl = document.getElementById('greetEl');
    const greets  = ['Hello','नमस्ते','こんにちは','Hola','مرحبا','Bonjour','안녕하세요'];
    let gi = 0;
    function cycleGreet() {
      if (!greetEl) return;
      greetEl.style.opacity = 0;
      setTimeout(() => {
        greetEl.textContent = greets[gi++ % greets.length];
        greetEl.style.opacity = 1;
      }, 300);
    }
    cycleGreet();
    const greetTimer = setInterval(cycleGreet, 600);

    /* ---- Phase 1 → Phase 2 ---- */
    const phase1 = document.getElementById('phase1');
    const phase2 = document.getElementById('phase2');
    setTimeout(() => {
      if (phase1) phase1.style.display = 'none';
      if (phase2) { phase2.style.display = 'flex'; phase2.style.opacity = 1; }
      clearInterval(greetTimer);
    }, 2000);

    /* ---- Progress bar ---- */
    const fill  = document.getElementById('fill');
    const pctC  = document.getElementById('pctC');
    const pctL  = document.getElementById('pctL');
    const stTxt = document.getElementById('stTxt');
    let pct = 0;

    const stLabels = ['LOADING','BOOTING','INIT','READY'];
    const progTimer = setInterval(() => {
      pct = Math.min(pct + Math.random() * 4 + 1, 100);
      const p100 = Math.floor(pct);
      if (fill)  fill.style.width  = p100 + '%';
      if (pctC)  pctC.textContent  = (p100 < 10 ? '0' : '') + p100 + '%';
      if (pctL)  pctL.textContent  = p100 + '%';
      if (stTxt) stTxt.textContent = stLabels[Math.min(Math.floor(p100 / 26), 3)];
      if (pct >= 100) clearInterval(progTimer);
    }, 60);

    /* ---- Dismiss preloader ---- */
    const PRELOADER_DURATION = 3800;
    setTimeout(() => {
      clearInterval(rainInterval);
      clearInterval(greetTimer);
      const preloader = document.getElementById('preloader');
      if (preloader) {
        preloader.style.transition = 'opacity 0.7s ease';
        preloader.style.opacity    = '0';
        setTimeout(() => {
          preloader.style.display = 'none';
          // BUG FIX: remove body.loading so any CSS gated on it works correctly
          document.body.classList.remove('loading');
        }, 700);
      }
    }, PRELOADER_DURATION);
  }
})();


/* ============================================================
   3.  NAVBAR  (hamburger + smooth close on link click)
   ============================================================ */
(function initNavbar() {
  const hamburger = document.getElementById('hamburger');
  const navLinks  = document.getElementById('nav-links');
  if (!hamburger || !navLinks) return;

  function toggleMenu() {
    const open = navLinks.classList.toggle('open');
    hamburger.setAttribute('aria-expanded', open);
  }

  hamburger.addEventListener('click', toggleMenu);
  hamburger.addEventListener('keydown', e => {
    if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); toggleMenu(); }
  });

  navLinks.querySelectorAll('a').forEach(a => {
    a.addEventListener('click', () => {
      navLinks.classList.remove('open');
      hamburger.setAttribute('aria-expanded', 'false');
    });
  });
})();


/* ============================================================
   4.  CUSTOM CURSOR
   ============================================================ */
(function initCursor() {
  const dot  = document.getElementById('cursorDot');
  const ring = document.getElementById('cursorRing');
  if (!dot || !ring) return;

  let mx = 0, my = 0, rx = 0, ry = 0;

  document.addEventListener('mousemove', e => {
    mx = e.clientX;
    my = e.clientY;
    dot.style.left = mx + 'px';
    dot.style.top  = my + 'px';
  });

  (function ringTick() {
    rx += (mx - rx) * 0.14;
    ry += (my - ry) * 0.14;
    ring.style.left = rx + 'px';
    ring.style.top  = ry + 'px';
    requestAnimationFrame(ringTick);
  })();

  ['a','button','.cta-btn','.project-btn','.social-link','.skill'].forEach(sel => {
    document.querySelectorAll(sel).forEach(el => {
      el.addEventListener('mouseenter', () => ring.classList.add('hovered'));
      el.addEventListener('mouseleave', () => ring.classList.remove('hovered'));
    });
  });
})();


/* ============================================================
   5.  DOM-READY  (AOS · EmailJS · Typing · Active Nav)
   ============================================================ */
document.addEventListener('DOMContentLoaded', () => {

  /* AOS */
  if (window.AOS) {
    AOS.init({ duration: 800, once: false, mirror: true, offset: 100 });
  }

  /* EmailJS */
  if (window.emailjs) {
    emailjs.init('vI-NhtzREwXqZQq5N');
  }

  /* Contact form */
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

  /* Skill card colors */
  document.querySelectorAll('.skill').forEach(skill => {
    const color = skill.getAttribute('data-color');
    if (color) skill.style.setProperty('--skill-color', color);
  });

  /* ---- TYPING EFFECT ----
     BUG FIX: old MutationObserver missed the case where 'reveal' was
     already present before observe() was called (fast scroll on load).
     Now we check immediately AND observe.
     ---------------------- */
  let typingStarted = false;

  function initTypingEffect() {
    if (typingStarted) return;
    typingStarted = true;

    const heroP   = document.querySelector('.hero-text p');
    if (!heroP) return;

    const phrases   = ['IT Learner','Frontend Developer','Creative Builder','UI/UX Enthusiast'];
    let pi = 0, ci = 0, deleting = false;
    const MIN_WAIT   = 1800;
    const TYPE_SPEED = 80;
    const DEL_SPEED  = 45;

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

  const heroEl = document.getElementById('hero');
  if (heroEl) {
    // Check if already revealed (e.g. user refreshed mid-scroll)
    if (heroEl.classList.contains('reveal') || heroEl.classList.contains('settled')) {
      initTypingEffect();
    } else {
      const obs = new MutationObserver(() => {
        if (heroEl.classList.contains('reveal') || heroEl.classList.contains('settled')) {
          initTypingEffect();
          obs.disconnect();
        }
      });
      obs.observe(heroEl, { attributes: true, attributeFilter: ['class'] });
    }
  }

  /* ---- ACTIVE NAV LINK ---- */
  (function initActiveNav() {
    const sections = document.querySelectorAll('section[id], div[id="about"], div[id="skills"], div[id="projects"], div[id="contact"]');
    const navItems = document.querySelectorAll('.nav-links a');
    if (!sections.length || !navItems.length) return;

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

  /* ---- HEADING WIPE ---- */
  document.querySelectorAll('.section h2, .skills-section h2, .feedback-section h2').forEach(h2 => {
    h2.classList.add('heading-wipe');
  });
});


/* ============================================================
   6.  SKILLS INFINITE SCROLL
   BUG FIX: guard against triple being applied more than once
   (handles hot-reload / back-forward cache scenarios)
   ============================================================ */
window.addEventListener('load', () => {
  const track   = document.getElementById('skillsTrack');
  const wrapper = document.querySelector('.skills-wrapper');
  if (!track || !wrapper) return;

  if (!track.dataset.tripled) {
    track.innerHTML += track.innerHTML + track.innerHTML;
    track.dataset.tripled = '1'; // use data attribute, not classList, to survive innerHTML
  }

  const CARD_WIDTH     = 130;
  const singleSetWidth = (track.children.length / 3) * CARD_WIDTH;

  let offset = 0;
  let paused = false;

  wrapper.addEventListener('mouseenter', () => { paused = true;  });
  wrapper.addEventListener('mouseleave', () => { paused = false; });

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
   7.  GSAP SCROLL ANIMATIONS
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
   8.  PARTICLE SPARKLES  (lightweight CSS-driven)
   ============================================================ */
(function createParticles() {
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
    document.body.appendChild(sp);
  }
})();


/* ============================================================
   9.  SCROLL-TO-TOP BUTTON
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
   10.  TILT EFFECT on Project Cards
   ============================================================ */
(function initTilt() {
  document.querySelectorAll('.project-card').forEach(card => {
    card.addEventListener('mousemove', (e) => {
      const rect = card.getBoundingClientRect();
      const x    = (e.clientX - rect.left) / rect.width  - 0.5;
      const y    = (e.clientY - rect.top)  / rect.height - 0.5;
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
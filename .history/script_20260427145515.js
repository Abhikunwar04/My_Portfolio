/* ============================================================
   ABHI KUNWAR PORTFOLIO — SCRIPT.JS  (PRODUCTION v3)
   Bug-free, Clean, Professional Build
   ============================================================ */

'use strict';

/* ============================================================
   0. SCROLL RESTORATION — Prevent flash on reload
   ============================================================ */
if ('scrollRestoration' in history) {
  history.scrollRestoration = 'manual';
}
window.scrollTo(0, 0);
window.addEventListener('beforeunload', () => window.scrollTo(0, 0));


/* ============================================================
   1. GSAP SETUP
   ============================================================ */
gsap.registerPlugin(ScrollTrigger);


/* ============================================================
   2. CANVAS HERO EFFECT
   ============================================================ */
(function initCanvasHero() {

  const heroCanvas = document.getElementById('heroCanvas');
  if (!heroCanvas) return;

  const ctx = heroCanvas.getContext('2d');

  /* Images */
  const hero    = new Image();
  const nameImg = new Image();
  const bottom  = new Image();

  hero.src    = 'hero.jpg';
  nameImg.src = 'name.png';
  bottom.src  = 'bottom.png';

  let loadedCount = 0;
  let canvasReady = false;

  function onImageLoad() {
    loadedCount++;
    if (loadedCount >= 3 && !canvasReady) {
      canvasReady = true;
      canvasInit();
    }
  }

  hero.onload    = onImageLoad;
  nameImg.onload = onImageLoad;
  bottom.onload  = onImageLoad;
  hero.onerror   = onImageLoad;
  nameImg.onerror = onImageLoad;
  bottom.onerror  = onImageLoad;

  /* Safety timeout */
  setTimeout(() => {
    if (!canvasReady) { canvasReady = true; canvasInit(); }
  }, 1000);


  /* ---------- HELPERS ---------- */
  const clamp     = (v, a, b) => Math.max(a, Math.min(b, v));
  const easeOut   = t => 1 - Math.pow(1 - t, 3);


  /* ---------- LERP SMOOTH SCROLL ---------- */
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
      mc        = document.createElement('canvas');
      mc.width  = needW;
      mc.height = needH;
      mctx      = mc.getContext('2d');
    }
  }


  /* ---------- STATE ---------- */
  let heroTextSettled = false;
  let mainSettled     = false;


  /* ---------- RESIZE ---------- */
  function canvasResize() {
    const dpr = window.devicePixelRatio || 1;
    heroCanvas.width        = window.innerWidth  * dpr;
    heroCanvas.height       = window.innerHeight * dpr;
    heroCanvas.style.width  = window.innerWidth  + 'px';
    heroCanvas.style.height = window.innerHeight + 'px';
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    mc = null; // force mask canvas recreate
    if (canvasReady) canvasDraw();
  }
  window.addEventListener('resize', canvasResize, { passive: true });


  /* ---------- SCROLL PROGRESS ---------- */
  function getScrollProgress() {
    const heroScroll = document.getElementById('heroScroll');
    if (!heroScroll) return 0;
    const total   = heroScroll.offsetHeight - window.innerHeight;
    const scrolled = window.scrollY; // use window.scrollY (more reliable)
    return total <= 0 ? 0 : clamp(scrolled / total, 0, 1);
  }


  /* ---------- HERO TEXT FADE ---------- */
  function updateHeroText(p) {
    const heroText = document.getElementById('hero');
    const resume   = document.querySelector('.resume-wrapper');
    if (!heroText) return;

    if (p > 0.95) {
      heroText.style.opacity = 1;
      heroText.classList.add('active');
    } else {
      heroText.style.opacity = 0;
      heroText.classList.remove('active');
    }
  
    /* Layer: slide behind main content when resume comes into view */
    if (resume) {
      const rect = resume.getBoundingClientRect();
      heroText.style.zIndex = rect.top < window.innerHeight * 0.9 ? '1' : '10';
    }
  }
      // updateVignette function — canvasDraw ke bahar, updateHeroText ke paas
function updateVignette(p) {
  const v = document.getElementById('heroVignette');
  if (!v) return;
  // 0.25 pe shuru, 0.65 tak poora visible
  v.style.opacity = Math.min(Math.max((p - 0.25) / 0.4, 0), 1);
}


  /* ---------- DRAW ---------- */
  function canvasDraw() {
    if (!canvasReady) return;

    const W   = window.innerWidth;
    const H   = window.innerHeight;
    const p   = clamp(smoothP * 1.3, 0, 1.4); // cap extended range
    const dpr = window.devicePixelRatio || 1;

    ctx.clearRect(0, 0, W, H);

    /* --- Hero image --- */
    const imgAR  = (hero.naturalWidth  || W) / (hero.naturalHeight || H);
    let imgW = W, imgH = W / imgAR;
    if (imgH < H) { imgH = H; imgW = imgH * imgAR; }

    const zoom    = 1.35 + (1.0 - 1.35) * easeOut(clamp(p, 0, 1));
    const scaledW = imgW * zoom;
    const scaledH = imgH * zoom;
    const baseX   = (W - scaledW) * 0.5;
    const baseY   = (H - scaledH) * 0.45;

    const heroShiftY = clamp(p, 0, 1) * scaledH * 0.06;

    if (hero.complete && hero.naturalWidth) {
      ctx.drawImage(hero, baseX, baseY - heroShiftY, scaledW, scaledH);
    }
   // canvasDraw() ke andar, end mein:
updateVignette(p);
  }

    /* --- Name overlay with mask --- */
    if (nameImg.complete && nameImg.naturalWidth) {
      const nameW  = W;
      const nameH  = nameW * ((nameImg.naturalHeight || 200) / (nameImg.naturalWidth || W));
      const tStart = clamp((p - 0.05) / 0.7, 0, 1);
      const textY  = (H * 0.85 - nameH / 2) + ((H * 0.50 - nameH / 2) - (H * 0.85 - nameH / 2)) * easeOut(tStart);
      const nameAlpha = clamp((p - 0.05) / 0.3, 0, 1);

      ensureMaskCanvas(W, H, dpr);
      mctx.clearRect(0, 0, mc.width, mc.height);
      mctx.save();
      mctx.scale(dpr, dpr);
      mctx.globalAlpha = nameAlpha;
      mctx.drawImage(nameImg, (W - nameW) / 2, textY, nameW, nameH);

      if (bottom.complete && bottom.naturalWidth) {
        const bottomShiftY = clamp(p, 0, 1) * scaledH * 0.12;
        mctx.globalCompositeOperation = 'destination-out';
        mctx.globalAlpha = 1;
        mctx.drawImage(bottom, baseX, baseY - bottomShiftY, scaledW, scaledH);
        mctx.restore();
        ctx.drawImage(mc, 0, 0, mc.width, mc.height, 0, 0, W, H);
        ctx.drawImage(bottom, baseX, baseY - bottomShiftY, scaledW, scaledH);
      } else {
        mctx.restore();
        ctx.drawImage(mc, 0, 0, mc.width, mc.height, 0, 0, W, H);
      }
    }

    /* --- Main content reveal --- */
    const main = document.getElementById('mainContent');
    if (main && !mainSettled) {
      if (p > 1.0) {
        const prog = clamp((p - 1.0) / 0.2, 0, 1);
        main.style.opacity   = prog;
        main.style.transform = `translateY(${(1 - prog) * 80}px)`;
      } else {
        main.style.opacity   = '0';
        main.style.transform = 'translateY(80px)';
      }
    }

    /* --- Vignettes --- */
  

// LEFT (thoda light)
const vL = ctx.createLinearGradient(0, 0, W * 0.22, 0);
vL.addColorStop(0, 'rgba(0,0,0,0.18)'); // 0.5 → 0.18
vL.addColorStop(1, 'rgba(0,0,0,0)');
ctx.fillStyle = vL;
ctx.fillRect(0, 0, W, H);

// RIGHT (thoda light)
const vR = ctx.createLinearGradient(W, 0, W * 0.78, 0);
vR.addColorStop(0, 'rgba(0,0,0,0.15)'); // 0.4 → 0.15
vR.addColorStop(1, 'rgba(0,0,0,0)');
ctx.fillStyle = vR;
ctx.fillRect(0, 0, W, H);

// TOP (light)
const topA = clamp(1 - p * 2, 0, 0.18); // 0.35 → 0.18
const vT   = ctx.createLinearGradient(0, 0, 0, H * 0.4);
vT.addColorStop(0, `rgba(0,0,0,${topA})`);
vT.addColorStop(1, 'rgba(0,0,0,0)');
ctx.fillStyle = vT;
ctx.fillRect(0, 0, W, H);

// GLOBAL (MAIN FIX)
const darkAlpha = clamp((p - 0.35) / 0.55, 0, 0.30); // 0.88 → 0.30
ctx.fillStyle   = `rgba(0,0,0,${darkAlpha})`;
ctx.fillRect(0, 0, W, H);

updateHeroText(p);


  /* ---------- RAF LOOP ---------- */
  function canvasTick(now) {
    const dt        = lastTime ? Math.min(now - lastTime, 50) : 16.67;
    lastTime        = now;
    rawP            = getScrollProgress();
    const lerpAlpha = 1 - Math.pow(1 - BASE_LERP, dt / 16.67);
    smoothP        += (rawP - smoothP) * lerpAlpha;

    /* Settle: once user scrolls past hero, lock the main content in place */
    if (smoothP > 0.98 && !heroTextSettled) {
      heroTextSettled = true;

      const heroText = document.getElementById('hero');
      const main     = document.getElementById('mainContent');

      if (heroText) heroText.classList.add('settled');
      if (main && !mainSettled) {
        mainSettled = true;
        main.style.opacity   = '1';
        main.style.transform = 'translateY(0)';
        main.classList.add('settled');
      }
    }

    canvasDraw();
    requestAnimationFrame(canvasTick);
  }

  function canvasInit() {
    canvasResize();
    requestAnimationFrame(canvasTick);
  }

})(); /* end initCanvasHero */


/* ============================================================
   3. NAVBAR SCROLL EFFECT
   ============================================================ */
(function initNavbar() {
  const topBar = document.getElementById('top-bar');
  if (!topBar) return;

  let lastScroll = 0;
  let ticking    = false;

  window.addEventListener('scroll', () => {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(() => {
      const cur = window.scrollY;
      topBar.classList.toggle('scrolled', cur > 20);
      topBar.classList.toggle('hide', cur > lastScroll && cur > 80);
      lastScroll = Math.max(cur, 0);
      ticking    = false;
    });
  }, { passive: true });

  /* Active link highlight on scroll */
  const sections  = document.querySelectorAll('section[id], div[id="home"]');
  const navLinks  = document.querySelectorAll('.nav-link');

  if (sections.length && navLinks.length) {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          navLinks.forEach(link => link.classList.remove('active-link'));
          const active = document.querySelector(`.nav-link[href="#${entry.target.id}"]`);
          if (active) active.classList.add('active-link');
        }
      });
    }, { rootMargin: '-40% 0px -55% 0px', threshold: 0 });

    sections.forEach(s => observer.observe(s));
  }

})();


/* ============================================================
   4. HAMBURGER MENU
   ============================================================ */
(function initHamburger() {
  const hamburger = document.getElementById('hamburger');
  const navLinks  = document.getElementById('nav-links');
  if (!hamburger || !navLinks) return;

  hamburger.addEventListener('click', () => {
    const isOpen = navLinks.classList.toggle('active');
    hamburger.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
    hamburger.querySelector('i').className = isOpen ? 'fas fa-times' : 'fas fa-bars';
  });

  /* Close on link click */
  navLinks.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
      navLinks.classList.remove('active');
      hamburger.setAttribute('aria-expanded', 'false');
      hamburger.querySelector('i').className = 'fas fa-bars';
    });
  });

  /* Close on outside click */
  document.addEventListener('click', (e) => {
    if (!hamburger.contains(e.target) && !navLinks.contains(e.target)) {
      navLinks.classList.remove('active');
      hamburger.setAttribute('aria-expanded', 'false');
      hamburger.querySelector('i').className = 'fas fa-bars';
    }
  });

  /* Keyboard support */
  hamburger.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      hamburger.click();
    }
  });

})();


/* ============================================================
   5. CYBER PRELOADER
   ============================================================ */
window.addEventListener('load', () => {
  const preloader = document.getElementById('preloader');
  if (!preloader) return;

  const mc2 = document.getElementById('mc');
  if (!mc2) return;

  const c2 = mc2.getContext('2d');
  let PW, PH;

  function preloaderResize() {
    PW = mc2.width  = window.innerWidth;
    PH = mc2.height = window.innerHeight;
  }
  preloaderResize();

  /* Use a scoped resize listener — removed after preloader done */
  const onResize = preloaderResize;
  window.addEventListener('resize', onResize, { passive: true });

  const CHARS = 'アイウエオカキクケコ0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ@#$%&';
  const drops  = Array.from({ length: 70 }, () => Math.random() * -80);
  let matrixRunning = true;
  let matrixRafId   = null;

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
    matrixRafId = requestAnimationFrame(drawMatrix);
  }
  drawMatrix();

  /* --- Greetings --- */
  const greetings = ['Hello','नमस्ते','Hola','Bonjour','Ciao','Olá','Здравствуйте','Merhaba','Hej','Hallo'];
  const greetEl   = document.getElementById('greetEl');
  let gi = 0;
  const per = 1800 / greetings.length;

  function animateIn() {
    if (!greetEl) return;
    greetEl.style.transition = 'none';
    greetEl.style.opacity    = '0';
    greetEl.style.transform  = 'scale(0.85)';
    requestAnimationFrame(() => requestAnimationFrame(() => {
      greetEl.style.transition = '0.2s ease';
      greetEl.style.opacity    = '1';
      greetEl.style.transform  = 'scale(1)';
    }));
  }

  function animateOut(cb) {
    if (!greetEl) { cb(); return; }
    greetEl.style.transition = '0.12s ease';
    greetEl.style.opacity    = '0';
    greetEl.style.transform  = 'scale(1.1)';
    setTimeout(cb, 130);
  }

  function runGreetings(callback) {
    if (!greetEl) { callback(); return; }
    greetEl.textContent = greetings[0];
    animateIn();
    function next() {
      if (gi >= greetings.length - 1) { animateOut(callback); return; }
      animateOut(() => {
        gi++;
        greetEl.textContent = greetings[gi];
        animateIn();
        setTimeout(next, per - 120);
      });
    }
    setTimeout(next, per - 120);
  }

  /* --- Scramble effect --- */
  const nameEl  = document.getElementById('nm');
  const glR     = document.getElementById('glR');
  const glG     = document.getElementById('glG');
  const FULL    = 'ABHI KUNWAR';
  const LETTERS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';

  function scramble(callback) {
    if (!nameEl) { if (callback) callback(); return; }
    let rev = 0, count = 0;
    function loop() {
      let str = '';
      for (let i = 0; i < FULL.length; i++) {
        if (i < rev) { str += FULL[i]; }
        else if (FULL[i] === ' ') { str += ' '; }
        else { str += LETTERS[Math.floor(Math.random() * LETTERS.length)]; }
      }
      nameEl.textContent = str;
      if (glR) glR.textContent = str;
      if (glG) glG.textContent = str;
      count++;
      if (count % 3 === 0 && rev < FULL.length) rev++;
      if (rev < FULL.length) {
        setTimeout(loop, 45);
      } else {
        nameEl.textContent = FULL;
        if (glR) glR.textContent = FULL;
        if (glG) glG.textContent = FULL;
        if (callback) callback();
      }
    }
    loop();
  }

  /* --- Glitch effect --- */
  function glitch() {
    if (!glR || !glG) return;
    let r = 0;
    function g() {
      if (r >= 8) { glR.style.opacity = '0'; glG.style.opacity = '0'; return; }
      const dx = (Math.random() - 0.5) * 14;
      const dy = (Math.random() - 0.5) * 5;
      glR.style.opacity   = '0.75';
      glG.style.opacity   = '0.5';
      glR.style.transform = `translate(${dx}px,${dy}px)`;
      glG.style.transform = `translate(${-dx}px,${-dy}px)`;
      r++;
      setTimeout(g, 30);
    }
    g();
  }

  /* --- Progress bar --- */
  const fill      = document.getElementById('fill');
  const pctL      = document.getElementById('pctL');
  const pctC      = document.getElementById('pctC');
  const stTxt     = document.getElementById('stTxt');
  const statuses  = ['LOADING','PARSING DATA','BUILDING WORLD','ALMOST READY','COMPLETE'];
  const progressBar = document.getElementById('progressBar');
  let si = 0;

  function nextStatus() {
    if (stTxt && si < statuses.length - 1) stTxt.textContent = statuses[++si];
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
      if (fill) fill.style.width = p + '%';
      if (pctL) pctL.textContent = p + '%';
      if (pctC) pctC.textContent = p + '%';
      if (progressBar) progressBar.setAttribute('aria-valuenow', p);
      if (p > 25 && si < 1) nextStatus();
      if (p > 55 && si < 2) nextStatus();
      if (p > 80 && si < 3) nextStatus();
    }, 50);
  }

  /* --- Main flow --- */
  const phase1 = document.getElementById('phase1');
  const phase2 = document.getElementById('phase2');

  runGreetings(() => {
    if (phase1) {
      phase1.style.transition = 'opacity 0.4s ease';
      phase1.style.opacity    = '0';
    }
    setTimeout(() => {
      if (phase1) phase1.style.display = 'none';
      if (phase2) phase2.style.opacity = '1';
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
            if (matrixRafId) cancelAnimationFrame(matrixRafId);
            window.removeEventListener('resize', onResize);
          }, 700);
        }, 300);
      });
    }, 400);
  });

}); /* end window.load */


/* ============================================================
   6. CUSTOM CURSOR
   ============================================================ */
(function initCursor() {
  /* Only on devices with mouse */
  if (window.matchMedia('(hover: none)').matches) return;

  const dot  = document.getElementById('cursorDot');
  const ring = document.getElementById('cursorRing');
  if (!dot || !ring) return;

  let mouseX = -100, mouseY = -100;
  let ringX  = -100, ringY  = -100;
  let velX   = 0,    velY   = 0;
  let moved  = false;

  const STIFFNESS = 0.20;
  const DAMPING   = 0.72;

  document.addEventListener('mousemove', (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
    dot.style.transform = `translate(${mouseX}px, ${mouseY}px)`;

    if (!moved) {
      moved = true;
      dot.classList.add('ready');
      ring.classList.add('ready');
    }
  }, { passive: true });

  (function animateRing() {
    velX = (velX + (mouseX - ringX) * STIFFNESS) * DAMPING;
    velY = (velY + (mouseY - ringY) * STIFFNESS) * DAMPING;
    ringX += velX;
    ringY += velY;
    ring.style.transform = `translate(${ringX}px, ${ringY}px)`;
    requestAnimationFrame(animateRing);
  })();

  /* Interactive elements */
  document.addEventListener('mouseover', (e) => {
    if (e.target.closest('a, button, .skill, .project-card, .highlight')) {
      ring.classList.add('hovered');
    }
  });
  document.addEventListener('mouseout', (e) => {
    if (e.target.closest('a, button, .skill, .project-card, .highlight')) {
      ring.classList.remove('hovered');
    }
  });

  document.addEventListener('mousedown', () => ring.classList.add('click'));
  document.addEventListener('mouseup',   () => ring.classList.remove('click'));

  /* Hide cursor when leaving window */
  document.addEventListener('mouseleave', () => { dot.style.opacity = '0'; ring.style.opacity = '0'; });
  document.addEventListener('mouseenter', () => {
    if (moved) { dot.style.opacity = '1'; ring.style.opacity = '1'; }
  });

})();


/* ============================================================
   7. DOM READY — AOS + EmailJS + Skill colors + Typing
   ============================================================ */
document.addEventListener('DOMContentLoaded', () => {

  /* AOS */
  if (typeof AOS !== 'undefined') {
    AOS.init({ duration: 800, once: false, mirror: true, offset: 100 });
  }

  /* EmailJS */
  if (window.emailjs) {
    emailjs.init('vI-NhtzREwXqZQq5N');
  }

  /* Contact form */
  const form = document.getElementById('feedback-form');
  const formStatus = document.getElementById('formStatus');

  if (form) {
    form.addEventListener('submit', async (e) => {
      e.preventDefault();

      const nameVal  = form.from_name?.value.trim();
      const emailVal = form.from_email?.value.trim();
      const msgVal   = form.message?.value.trim();

      /* Validation */
      if (!nameVal || !emailVal || !msgVal) {
        showStatus('error', '❌ Please fill in all fields.');
        return;
      }
      if (!/^[a-zA-Z0-9._%+-]+@gmail\.com$/.test(emailVal)) {
        showStatus('error', '❌ Please enter a valid Gmail address.');
        return;
      }

      const btn     = form.querySelector('button[type="submit"]');
      const btnText = btn?.querySelector('.btn-text');
      if (btn) { btn.disabled = true; if (btnText) btnText.textContent = 'Sending…'; }

      if (window.emailjs) {
        try {
          await emailjs.sendForm('service_71kywa9', 'template_lh1bgai', form);
          showStatus('success', '✅ Message sent successfully!');
          form.reset();
        } catch {
          showStatus('error', '❌ Failed to send. Please try again.');
        } finally {
          if (btn) {
            btn.disabled = false;
            if (btnText) btnText.textContent = 'Send Message';
          }
        }
      } else {
        showStatus('error', '❌ Email service not loaded. Please try again later.');
        if (btn) {
          btn.disabled = false;
          if (btnText) btnText.textContent = 'Send Message';
        }
      }
    });
  }

  function showStatus(type, msg) {
    if (!formStatus) return;
    formStatus.textContent  = msg;
    formStatus.className    = `form-status ${type}`;
    setTimeout(() => { formStatus.textContent = ''; formStatus.className = 'form-status'; }, 5000);
  }

  /* Skill colors */
  document.querySelectorAll('.skill').forEach(skill => {
    const color = skill.getAttribute('data-color');
    if (color) skill.style.setProperty('--skill-color', color);
  });

  /* Typing effect — starts only after hero text is visible */
  let typingStarted = false;

  function initTypingEffect() {
    if (typingStarted) return;
    typingStarted = true;
    const heroP = document.querySelector('.hero-text p');
    if (!heroP) return;

    const phrases = ['IT Learner', 'Frontend Developer', 'Creative Builder', 'UI/UX Enthusiast'];
    let pi = 0, ci = 0, deleting = false;

    function type() {
      const current = phrases[pi];
      if (!deleting) {
        heroP.textContent = current.slice(0, ci + 1);
        ci++;
        if (ci === current.length) {
          deleting = true;
          setTimeout(type, 1800);
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
      setTimeout(type, deleting ? 45 : 80);
    }
    type();
  }

  const heroEl = document.getElementById('hero');
  if (heroEl) {
    if (heroEl.classList.contains('reveal') || heroEl.classList.contains('settled') || heroEl.classList.contains('active')) {
      initTypingEffect();
    } else {
      const obs = new MutationObserver(() => {
        if (heroEl.classList.contains('reveal') || heroEl.classList.contains('settled') || heroEl.classList.contains('active')) {
          initTypingEffect();
          obs.disconnect();
        }
      });
      obs.observe(heroEl, { attributes: true, attributeFilter: ['class'] });
    }
  }

  /* Mouse parallax on project cards */
  document.querySelectorAll('.project-card').forEach(card => {
    card.addEventListener('mousemove', (e) => {
      const rect = card.getBoundingClientRect();
      const mx   = ((e.clientX - rect.left) / rect.width  * 100).toFixed(1) + '%';
      const my   = ((e.clientY - rect.top)  / rect.height * 100).toFixed(1) + '%';
      card.style.setProperty('--mx', mx);
      card.style.setProperty('--my', my);
    });
  });

}); /* end DOMContentLoaded */


/* ============================================================
   8. SKILLS INFINITE SCROLL
   ============================================================ */
window.addEventListener('load', () => {
  const track   = document.getElementById('skillsTrack');
  const wrapper = document.querySelector('.skills-wrapper');
  if (!track || !wrapper) return;

  /* Clone items for seamless loop */
  if (!track.dataset.cloned) {
    const original = track.innerHTML;
    track.innerHTML = original + original + original;
    track.dataset.cloned = '1';
  }

  const CARD_WIDTH     = 130; /* width(120) + margin(0.5*2) ≈ 121, rounded up */
  const totalItems     = track.children.length;
  const singleSetWidth = (totalItems / 3) * CARD_WIDTH;
  let offset = 0;
  let paused = false;

  wrapper.addEventListener('mouseenter', () => { paused = true; });
  wrapper.addEventListener('mouseleave', () => { paused = false; });
  wrapper.addEventListener('touchstart', () => { paused = true; },  { passive: true });
  wrapper.addEventListener('touchend',   () => { paused = false; }, { passive: true });

  let lastRAF = null;
  (function animate(ts) {
    if (!paused) {
      offset += 0.5;
      if (offset >= singleSetWidth) offset -= singleSetWidth;
      track.style.transform = `translateX(-${offset}px)`;
    }
    lastRAF = requestAnimationFrame(animate);
  })();

}); /* end load */


/* ============================================================
   9. GSAP SCROLL ANIMATIONS
   ============================================================ */
document.addEventListener('DOMContentLoaded', () => {
  /* Guard: only run if GSAP loaded */
  if (typeof gsap === 'undefined') return;

  gsap.from('.about-text', {
    scrollTrigger: { trigger: '.about-section', start: 'top 80%', once: true },
    opacity: 0, y: 50, duration: 0.9, ease: 'power3.out'
  });
  gsap.from('.about-lottie.left', {
    scrollTrigger: { trigger: '.about-section', start: 'top 80%', once: true },
    opacity: 0, x: -80, duration: 1.1, ease: 'power3.out'
  });
  gsap.from('.about-lottie.right', {
    scrollTrigger: { trigger: '.about-section', start: 'top 80%', once: true },
    opacity: 0, x: 80, duration: 1.1, ease: 'power3.out'
  });
  gsap.from('.project-card', {
    scrollTrigger: { trigger: '#projects', start: 'top 80%', once: true },
    opacity: 0, y: 60, stagger: 0.18, duration: 0.8, ease: 'power3.out'
  });
  gsap.from('.contact-form-wrapper', {
    scrollTrigger: { trigger: '#contact', start: 'top 80%', once: true },
    opacity: 0, y: 40, duration: 0.9, ease: 'power3.out'
  });
});


/* ============================================================
   10. TILT EFFECT on Project Cards
   ============================================================ */
document.addEventListener('DOMContentLoaded', () => {
  if (window.matchMedia('(hover: none)').matches) return; /* skip on touch */

  document.querySelectorAll('.project-card').forEach(card => {
    card.addEventListener('mousemove', (e) => {
      const rect = card.getBoundingClientRect();
      const x    = (e.clientX - rect.left) / rect.width  - 0.5;
      const y    = (e.clientY - rect.top)  / rect.height - 0.5;
      card.style.transform = `perspective(800px) rotateY(${(x * 10).toFixed(2)}deg) rotateX(${(-y * 8).toFixed(2)}deg) translateY(-6px)`;
    });
    card.addEventListener('mouseleave', () => { card.style.transform = ''; });
    card.addEventListener('mousedown',  () => { card.style.transform = 'perspective(800px) translateY(-2px) scale(0.99)'; });
    card.addEventListener('mouseup',    () => { card.style.transform = ''; });
  });
});


/* ============================================================
   11. SCROLL-TO-TOP BUTTON
   ============================================================ */
(function initScrollTop() {
  const btn = document.createElement('button');
  btn.id        = 'scrollTopBtn';
  btn.innerHTML = '<i class="fas fa-chevron-up" aria-hidden="true"></i>';
  btn.setAttribute('aria-label', 'Scroll to top');
  document.body.appendChild(btn);

  window.addEventListener('scroll', () => {
    btn.classList.toggle('visible', window.scrollY > 600);
  }, { passive: true });

  btn.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
})();
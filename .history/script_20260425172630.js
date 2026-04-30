/* ============================================================
   ABHI KUNWAR PORTFOLIO — SCRIPT.JS
   Canvas Hero Effect + All Portfolio Interactions
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

/* ---------- SMOOTH SCROLL PROGRESS ---------- */
let smoothP = 0;
const LERP  = 0.07;

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
  // Total scrollable distance = heroScroll height - viewport height
  const max = heroScroll.offsetHeight - window.innerHeight;
  return max <= 0 ? 0 : clamp(window.scrollY / max, 0, 1);
}

/* ---------- HERO TEXT FADE & SETTLE ---------- */
// Hero text fades in when scroll progress reaches ~0.85
// When p=1 (scroll complete), it settles into normal DOM flow
let heroTextVisible = false;
let heroTextSettled = false;

function updateHeroText(p) {
  const heroText = document.getElementById('hero');
  if (!heroText) return;

  if (heroTextSettled) return; // CSS handles it after settled

  // Start fading in at 85% scroll progress
  const textAlpha = clamp((p - 0.82) / 0.15, 0, 1);
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

/* ---------- MAIN CONTENT SLIDE ----------
   #mainContent slides up continuously as scroll reaches 100%,
   perfectly in sync with the bottom.png parallax
   ----------------------------------------------------------- */
let mainSettled = false;

function updateMainContent(p) {
  const main = document.getElementById('mainContent');
  const heroText = document.getElementById('hero');
  const heroCanvas = document.getElementById('heroCanvas');
  if (!main) return;

  if (mainSettled) return; // already locked in

  // Only start revealing near the end of the hero scroll
  const slideProgress = clamp((p - 0.50) / 0.50, 0, 1);
  const ease = easeOut(slideProgress);

const vh = window.innerHeight;
const translateY = (1 - ease) * vh;
const opacity = clamp((p - 0.50) / 0.30, 0, 1);

  main.style.transform = `translateY(${translateY}px)`;
  main.style.opacity   = opacity;

  // When scroll is complete — settle everything so normal scroll takes over
  if (p >= 0.999) {
    mainSettled = true;

    main.classList.add('settled');
    main.style.transform = '';
    main.style.opacity   = '';

    if (heroText) {
      heroText.classList.add('settled');
      heroText.style.opacity = '';
    }

    if (heroCanvas) {
      heroCanvas.style.display = 'none';
    }

    // Force all inner content visible
    main.style.zIndex = '20';
    main.querySelectorAll('section, .projects-grid, .contact-form-wrapper').forEach(el => {
      el.style.position = 'relative';
      el.style.zIndex = '1';
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

  const baseX = (W - scaledW) * 0.5;
  const baseY = (H - scaledH) * 0.45;

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

  const mc   = document.createElement('canvas');
  mc.width   = W * dpr;
  mc.height  = H * dpr;
  const mctx = mc.getContext('2d');
  mctx.scale(dpr, dpr);

  mctx.globalAlpha = nameAlpha;
  mctx.drawImage(nameImg, (W - nameW) / 2, textY, nameW, nameH);

  /* Bottom foreground parallax — moves faster = depth illusion */
  const bottomShiftY = p * scaledH * 0.12;

  /* Cut name wherever bottom.png is drawn (depth mask) */
  mctx.globalCompositeOperation = 'destination-out';
  mctx.drawImage(bottom, baseX, baseY - bottomShiftY, scaledW, scaledH);

  ctx.drawImage(mc, 0, 0, W * dpr, H * dpr, 0, 0, W, H);

  /* Bottom foreground on top */
  ctx.drawImage(bottom, baseX, baseY - bottomShiftY, scaledW, scaledH);

  /* Vignettes */
  // Bottom
 const vBot = ctx.createLinearGradient(0, H * 0.5, 0, H);
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
  const vT = ctx.createLinearGradient(0, 0, 0, H * 0.4);
  vT.addColorStop(0, `rgba(0,0,0,${topA})`);
  vT.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.fillStyle = vT;
  ctx.fillRect(0, 0, W, H);

 /* Smooth dark overlay on hero as content rises */
  const darkAlpha = clamp((p - 0.45) / 0.50, 0, 0.88);
  ctx.fillStyle = `rgba(0,0,0,${darkAlpha})`;
  ctx.fillRect(0, 0, W, H);

  /* Update hero text & main content based on progress */
  updateHeroText(p);
  updateMainContent(p);
}
/* ---------- RAF LOOP ---------- */
function canvasTick() {
  const rawP = getScrollProgress();
  smoothP   += (rawP - smoothP) * LERP;

  // If user scrolls back up into hero zone — reset settled state
  if (rawP < 0.98 && mainSettled) {
    mainSettled = false;
    heroTextSettled = false;

    const main       = document.getElementById('mainContent');
    const heroText   = document.getElementById('hero');
    const heroCanvas = document.getElementById('heroCanvas');

    if (main)       { main.classList.remove('settled'); }
    if (heroText)   { heroText.classList.remove('settled'); heroText.classList.remove('reveal'); }
    if (heroCanvas) { heroCanvas.style.display = ''; }
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

  if (currentScroll > 20) {
    topBar.classList.add('scrolled');
  } else {
    topBar.classList.remove('scrolled');
  }

  if (currentScroll > lastScroll && currentScroll > 80) {
    topBar.classList.add('hide');
  } else {
    topBar.classList.remove('hide');
  }

  lastScroll = Math.max(currentScroll, 0);
}, { passive: true });


/* ============================================================
   CYBER PRELOADER
   ============================================================ */
window.addEventListener("load", () => {

  const preloader = document.getElementById("preloader");
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
  window.addEventListener('resize', resizeMatrix);

  const CHARS = "アイウエオカキクケコ0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ@#$%&";
  const drops = Array.from({ length: 70 }, () => Math.random() * -80);

  let matrixRunning = true;

  function drawMatrix() {
    if (!matrixRunning) return;
    mctx.fillStyle = "rgba(2,12,5,0.07)";
    mctx.fillRect(0, 0, W, H);
    mctx.font = "13px 'Share Tech Mono', monospace";

    const colW = W / drops.length;
    for (let i = 0; i < drops.length; i++) {
      const text = CHARS[Math.floor(Math.random() * CHARS.length)];
      const x = i * colW;
      const y = drops[i] * 16;

      mctx.fillStyle = Math.random() > 0.93
        ? "rgba(200,255,210,0.95)"
        : "rgba(0,255,65,0.65)";
      mctx.fillText(text, x, y);

      if (y > H && Math.random() > 0.975) drops[i] = 0;
      drops[i] += 0.6;
    }
    requestAnimationFrame(drawMatrix);
  }
  drawMatrix();

  /* Greetings */
  const greetings = [
    "Hello", "नमस्ते", "Hola", "Bonjour", "Ciao",
    "Olá", "Здравствуйте", "Merhaba", "Hej", "Hallo"
  ];

  const greetEl = document.getElementById("greetEl");
  let gi = 0;
  const totalTime = 1800;
  const per = totalTime / greetings.length;

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

  function animIn() {
    greetEl.style.transition = "none";
    greetEl.style.opacity = "0";
    greetEl.style.transform = "scale(0.85)";
    requestAnimationFrame(() => {
      greetEl.style.transition = "0.2s ease";
      greetEl.style.opacity = "1";
      greetEl.style.transform = "scale(1)";
    });
  }

  function animOut(cb) {
    greetEl.style.transition = "0.12s ease";
    greetEl.style.opacity = "0";
    greetEl.style.transform = "scale(1.1)";
    setTimeout(cb, 130);
  }

  /* Scramble */
  const nameEl = document.getElementById("nm");
  const glR    = document.getElementById("glR");
  const glG    = document.getElementById("glG");
  const FULL   = "ABHI KUNWAR";
  const LETTERS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";

  function scramble(callback) {
    let rev = 0, count = 0;
    function loop() {
      let str = "";
      for (let i = 0; i < FULL.length; i++) {
        if (i < rev) str += FULL[i];
        else if (FULL[i] === " ") str += " ";
        else str += LETTERS[Math.floor(Math.random() * LETTERS.length)];
      }
      nameEl.textContent = str;
      glR.textContent = str;
      glG.textContent = str;
      count++;
      if (count % 3 === 0 && rev < FULL.length) rev++;
      if (rev < FULL.length) {
        setTimeout(loop, 45);
      } else {
        nameEl.textContent = FULL;
        glR.textContent = FULL;
        glG.textContent = FULL;
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
      if (r >= max) { glR.style.opacity = 0; glG.style.opacity = 0; return; }
      const dx = (Math.random() - 0.5) * 14;
      const dy = (Math.random() - 0.5) * 5;
      glR.style.opacity = 0.75;
      glG.style.opacity = 0.5;
      glR.style.transform = `translate(${dx}px, ${dy}px)`;
      glG.style.transform = `translate(${-dx}px, ${-dy}px)`;
      r++;
      setTimeout(g, 30);
    }
    g();
  }

  /* Progress */
  const fill  = document.getElementById("fill");
  const pctL  = document.getElementById("pctL");
  const pctC  = document.getElementById("pctC");
  const stTxt = document.getElementById("stTxt");
  const statuses = ["LOADING", "PARSING DATA", "BUILDING WORLD", "ALMOST READY", "COMPLETE"];
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
      fill.style.width = p + "%";
      pctL.textContent = p + "%";
      pctC.textContent = p + "%";
      if (p > 25 && si < 1) nextStatus();
      if (p > 55 && si < 2) nextStatus();
      if (p > 80 && si < 3) nextStatus();
    }, 50);
  }

  /* Main flow */
  const phase1 = document.getElementById("phase1");
  const phase2 = document.getElementById("phase2");

  runGreetings(() => {
    phase1.style.transition = "opacity 0.4s ease";
    phase1.style.opacity = "0";

    setTimeout(() => {
      phase1.style.display = "none";
      phase2.style.opacity = "1";

      scramble(() => {
        glitch();
        setTimeout(glitch, 400);
      });

      runProgress(900, () => {
        setTimeout(() => {
          preloader.classList.add("hide");
          setTimeout(() => {
            preloader.style.display = "none";
            document.body.classList.remove("loading");
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
}

document.querySelectorAll('.nav-links a').forEach(link => {
  link.addEventListener('click', (e) => {
    const href = link.getAttribute('href');
    if (!href || href === '#home' || href === '#') return; // normal scroll

    const target = document.querySelector(href);
    if (!target) return;

    navLinks.classList.remove('active');

    // Agar hero section mein hain (scroll < heroScroll end)
    const heroScroll = document.getElementById('heroScroll');
    const heroEnd = heroScroll ? heroScroll.offsetTop + heroScroll.offsetHeight : 0;

    if (window.scrollY < heroEnd - window.innerHeight * 0.5) {
      e.preventDefault();
      // Pehle top pe jao (hero animation dikhega)
      window.scrollTo({ top: 0, behavior: 'smooth' });
      // Phir 800ms baad target section pe
      setTimeout(() => {
        target.scrollIntoView({ behavior: 'smooth' });
      }, 900);
    }
    // Agar already hero ke baad hain — seedha scroll
  });
});

/* ============================================================
   CUSTOM CURSOR
   ============================================================ */
const dot  = document.getElementById("cursorDot");
const ring = document.getElementById("cursorRing");

if (dot && ring) {
  let mouseX = 0, mouseY = 0;
  let ringX  = 0, ringY  = 0;
  let velX   = 0, velY   = 0;

  const stiffness = 0.20;
  const damping   = 0.72;

  document.addEventListener("mousemove", (e) => {
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


/* ============================================================
   DOM LOADED — AOS + EmailJS
   ============================================================ */
window.addEventListener("DOMContentLoaded", () => {

  if (typeof AOS !== "undefined") {
    AOS.init({ duration: 800, once: false, mirror: true, offset: 100 });
  }

  if (window.emailjs) {
    emailjs.init("vI-NhtzREwXqZQq5N");
  }

  const form = document.getElementById("feedback-form");
  if (form && window.emailjs) {
    form.addEventListener("submit", (e) => {
      e.preventDefault();
      const name    = form.from_name.value.trim();
      const email   = form.from_email.value.trim();
      const message = form.message.value.trim();

      if (!name || !email || !message) { alert("❌ Please fill all fields"); return; }

      const gmailPattern = /^[a-zA-Z0-9._%+-]+@gmail\.com$/;
      if (!gmailPattern.test(email)) { alert("❌ Enter a valid Gmail address"); return; }

      const btn = form.querySelector("button[type='submit']");
      btn.textContent = "Sending…";
      btn.disabled = true;

      emailjs.sendForm("service_71kywa9", "template_lh1bgai", form)
        .then(() => { alert("✅ Message sent successfully!"); form.reset(); })
        .catch(() => alert("❌ Failed to send. Please try again."))
        .finally(() => {
          btn.innerHTML = '<i class="fas fa-paper-plane"></i> Send Message';
          btn.disabled = false;
        });
    });
  }

  document.querySelectorAll(".skill").forEach(skill => {
    const color = skill.getAttribute("data-color");
    if (color) skill.style.setProperty("--skill-color", color);
  });
});


/* ============================================================
   SKILLS INFINITE SCROLL
   ============================================================ */
window.addEventListener("load", () => {
  const track   = document.getElementById("skillsTrack");
  const wrapper = document.querySelector(".skills-wrapper");

  if (!track || !wrapper) return;

  if (!track.classList.contains("tripled")) {
    track.innerHTML += track.innerHTML + track.innerHTML;
    track.classList.add("tripled");
  }

  let offset = 0;
  let paused = false;

  const CARD_WIDTH     = 130;
  const singleSetWidth = (track.children.length / 3) * CARD_WIDTH;

  wrapper.addEventListener("mouseenter", () => paused = true);
  wrapper.addEventListener("mouseleave", () => paused = false);

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
   GSAP SCROLL ANIMATIONS (for sections below hero)
   ============================================================ */
gsap.from(".about-text", {
  scrollTrigger: { trigger: ".about-section", start: "top 80%" },
  opacity: 0, y: 50, duration: 0.9, ease: "power3.out"
});

gsap.from(".about-lottie.left", {
  scrollTrigger: { trigger: ".about-section", start: "top 80%" },
  opacity: 0, x: -100, duration: 1.1, ease: "power3.out"
});

gsap.from(".about-lottie.right", {
  scrollTrigger: { trigger: ".about-section", start: "top 80%" },
  opacity: 0, x: 100, duration: 1.1, ease: "power3.out"
});

gsap.from(".project-card", {
  scrollTrigger: { trigger: "#projects", start: "top 80%" },
  opacity: 0, y: 60, stagger: 0.18, duration: 0.8, ease: "power3.out"
});

gsap.from(".contact-form-wrapper", {
  scrollTrigger: { trigger: "#contact", start: "top 80%" },
  opacity: 0, y: 40, duration: 0.9, ease: "power3.out"
});
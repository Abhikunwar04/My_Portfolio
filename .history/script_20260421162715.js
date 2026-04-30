gsap.registerPlugin(ScrollTrigger);

/* =========================
   THEME TOGGLE
========================= */
const toggleBtn = document.getElementById('theme-toggle');
if (toggleBtn) {
  toggleBtn.addEventListener('click', () => {
    document.body.classList.toggle('light-theme');
  });
}

/* =========================
   NAVBAR EFFECT
========================= */
const topBar = document.getElementById('top-bar');
let lastScroll = 0;

window.addEventListener('scroll', () => {
  if (!topBar) return;

  const currentScroll = window.pageYOffset;

  topBar.classList.toggle('scrolled', currentScroll > 10);
  topBar.classList.toggle('hide', currentScroll > lastScroll && currentScroll > 50);

  lastScroll = currentScroll;
});

/* =========================
   PRELOADER
========================= */
window.addEventListener("load", () => {
  const preloader = document.getElementById('preloader');
  if (!preloader) return;

  for (let i = 0; i < 80; i++) {
    const p = document.createElement('div');
    p.className = 'particle';

    p.style.setProperty('--x0', Math.random() * window.innerWidth - window.innerWidth / 2 + 'px');
    p.style.setProperty('--y0', Math.random() * window.innerHeight - window.innerHeight / 2 + 'px');
    p.style.setProperty('--x1', (Math.random() * 500 - 250) + 'px');
    p.style.setProperty('--y1', (Math.random() * 500 - 250) + 'px');
    p.style.setProperty('--size', (2 + Math.random() * 4) + 'px');
    p.style.setProperty('--opacity', (0.3 + Math.random() * 0.7));

    preloader.appendChild(p);
  }

  const progress = document.querySelector('.progress');
  const text = document.querySelector('.progress-text');

  let percent = 0;

  function load() {
    percent++;
    if (progress) progress.style.width = percent + '%';
    if (text) text.textContent = percent + '%';

    if (percent < 100) {
      setTimeout(load, 30);
    } else {
      preloader.classList.add("slide-out");

      setTimeout(() => {
        preloader.style.display = "none";
        document.body.style.overflow = "auto";
      }, 800);
    }
  }

  load();
});

/* =========================
   SKILLS SCROLL
========================= */
window.addEventListener("load", () => {
  const track = document.getElementById("skillsTrack");
  const wrapper = document.querySelector(".skills-wrapper");

  if (!track || !wrapper) return;

  if (!track.classList.contains("tripled")) {
    track.innerHTML += track.innerHTML + track.innerHTML;
    track.classList.add("tripled");
  }

  let offset = 0;
  let paused = false;

  const singleSetWidth = track.scrollWidth / 3;

  wrapper.addEventListener("mouseenter", () => paused = true);
  wrapper.addEventListener("mouseleave", () => paused = false);

  function animate() {
    if (!paused) {
      offset += 0.5;
      if (offset >= singleSetWidth) offset = 0;
      track.style.transform = `translateX(-${offset}px)`;
    }
    requestAnimationFrame(animate);
  }

  animate();
});

/* =========================
   SKILL COLORS (FIXED)
========================= */
window.addEventListener("DOMContentLoaded", () => {
  document.querySelectorAll(".skill").forEach(skill => {
    const color = skill.getAttribute("data-color");
    if (!color) return;

    skill.style.setProperty("--skill-color", color);
    skill.style.borderColor = color + "33";

    skill.addEventListener("mouseenter", () => {
      skill.style.background = color + "15";
      skill.style.boxShadow = `0 0 25px ${color}`;
      skill.style.transform = "translateY(-6px) scale(1.06)";
    });

    skill.addEventListener("mouseleave", () => {
      skill.style.background = "rgba(255,255,255,0.03)";
      skill.style.boxShadow = "none";
      skill.style.transform = "translateY(0) scale(1)";
    });
  });
});

/* =========================
   🔥 PROFESSIONAL SCROLL REVEAL SYSTEM
========================= */

gsap.utils.toArray("section, .section, .about-container, .project-card, .skills-section h2").forEach((el) => {
  gsap.from(el, {
    scrollTrigger: {
      trigger: el,
      start: "top 85%",
      toggleActions: "play none none reverse"
    },
    opacity: 0,
    y: 60,
    scale: 0.98,
    duration: 0.9,
    ease: "power3.out"
  });
});

/* =========================
   ABOUT SPECIAL ANIMATION
========================= */

gsap.from(".about-lottie.left", {
  scrollTrigger: {
    trigger: ".about-section",
    start: "top 80%"
  },
  opacity: 0,
  x: -100,
  duration: 1.2,
  ease: "power3.out"
});

gsap.from(".about-lottie.right", {
  scrollTrigger: {
    trigger: ".about-section",
    start: "top 80%"
  },
  opacity: 0,
  x: 100,
  duration: 1.2,
  ease: "power3.out"
});
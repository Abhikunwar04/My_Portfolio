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
   NAVBAR SCROLL EFFECT
========================= */
const topBar = document.getElementById('top-bar');
let lastScroll = 0;

window.addEventListener('scroll', () => {
  const currentScroll = window.pageYOffset;
  if (!topBar) return;

  topBar.classList.toggle('scrolled', currentScroll > 10);

  if (currentScroll > lastScroll && currentScroll > 50) {
    topBar.classList.add('hide');
  } else {
    topBar.classList.remove('hide');
  }

  lastScroll = currentScroll;
});

/* =========================
   PRELOADER (SAFE + SAME)
========================= */
window.addEventListener("load", () => {
  const preloader = document.getElementById('preloader');
  const progressBar = document.querySelector('.progress');
  const progressText = document.querySelector('.progress-text');

  if (!preloader) return;

  for (let i = 0; i < 80; i++) {
    const p = document.createElement('div');
    p.className = 'particle';

    const size = 2 + Math.random() * 4;

    p.style.setProperty('--x0', Math.random() * window.innerWidth - window.innerWidth / 2 + 'px');
    p.style.setProperty('--y0', Math.random() * window.innerHeight - window.innerHeight / 2 + 'px');
    p.style.setProperty('--x1', (Math.random() * 500 - 250) + 'px');
    p.style.setProperty('--y1', (Math.random() * 500 - 250) + 'px');
    p.style.setProperty('--size', size + 'px');
    p.style.setProperty('--opacity', 0.5);
    p.style.animationDuration = (4 + Math.random() * 4) + 's';

    preloader.appendChild(p);
  }

  let percent = 0;

  function load() {
    percent++;

    if (progressBar) progressBar.style.width = percent + '%';
    if (progressText) progressText.textContent = percent + '%';

    if (percent < 100) {
      setTimeout(load, 25);
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
   HERO SCROLL REVEAL (FIXED - REPEATABLE)
========================= */
function revealObserver(el, className) {
  if (!el) return;

  const obs = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        el.classList.add(className);
      } else {
        el.classList.remove(className); // 🔥 repeat animation fix
      }
    });
  }, { threshold: 0.5 });

  obs.observe(el);
}

revealObserver(document.getElementById('hero'), 'reveal');
revealObserver(document.querySelector('.social-icons'), 'reveal');

/* =========================
   HAMBURGER MENU
========================= */
const hamburger = document.getElementById('hamburger');
const navLinks = document.getElementById('nav-links');

if (hamburger && navLinks) {
  hamburger.addEventListener('click', () => {
    navLinks.classList.toggle('active');
  });
}

/* =========================
   AOS + EMAILJS + TYPED + TILT
========================= */
window.addEventListener("DOMContentLoaded", () => {

  if (typeof AOS !== "undefined") {
    AOS.init({
      duration: 800,
      once: false // 🔥 repeat scroll animations
    });
  }

  if (window.emailjs) {
    emailjs.init("vI-NhtzREwXqZQq5N");
  }

  const form = document.getElementById("feedback-form");

  if (form && window.emailjs) {
    form.addEventListener("submit", (e) => {
      e.preventDefault();

      emailjs.sendForm("service_71kywa9", "template_lh1bgai", form)
        .then(() => {
          alert("Message sent!");
          form.reset();
        })
        .catch(() => alert("Failed"));
    });
  }

  if (window.Typed) {
    new Typed('#typed', {
      strings: ["IT Learner", "Frontend Developer", "UI Enthusiast"],
      typeSpeed: 60,
      backSpeed: 30,
      loop: true
    });
  }

  if (window.VanillaTilt) {
    VanillaTilt.init(document.querySelectorAll(".project-card"), {
      max: 15,
      speed: 400,
      glare: true,
      "max-glare": 0.2
    });
  }
});

/* =========================
   SKILLS SCROLL (SAFE + NO JUMP)
========================= */
window.addEventListener("load", () => {
  const track = document.getElementById("skillsTrack");
  const wrapper = document.querySelector(".skills-wrapper");

  if (!track || !wrapper) return;

  track.innerHTML = track.innerHTML + track.innerHTML + track.innerHTML;

  let offset = 0;
  let paused = false;

  const speed = 0.5;
  const width = track.scrollWidth / 3;

  wrapper.addEventListener("mouseenter", () => paused = true);
  wrapper.addEventListener("mouseleave", () => paused = false);

  function animate() {
    if (!paused) {
      offset += speed;
      if (offset >= width) offset = 0;
      track.style.transform = `translateX(-${offset}px)`;
    }
    requestAnimationFrame(animate);
  }

  animate();
});

/* =========================
   SKILL COLORS (UNCHANGED SAFE)
========================= */
document.querySelectorAll(".skill").forEach(skill => {
  const color = skill.getAttribute("data-color");
  if (!color) return;

  skill.style.setProperty("--skill-color", color);
});
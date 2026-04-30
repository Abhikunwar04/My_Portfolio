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

  if (currentScroll > 10) {
    topBar.classList.add('scrolled');
  } else {
    topBar.classList.remove('scrolled');
  }

  if (currentScroll > lastScroll && currentScroll > 50) {
    topBar.classList.add('hide');
  } else {
    topBar.classList.remove('hide');
  }

  lastScroll = currentScroll;
});

/* =========================
   PRELOADER
========================= */
window.addEventListener("load", () => {
  const preloader = document.getElementById('preloader');
  const progressBar = document.querySelector('.progress');
  const progressText = document.querySelector('.progress-text');

  if (!preloader) return;

  /* particles */
  for (let i = 0; i < 60; i++) {
    const p = document.createElement('div');
    p.className = 'particle';

    const size = 2 + Math.random() * 4;
    const opacity = 0.3 + Math.random() * 0.7;

    p.style.setProperty('--x0', Math.random() * window.innerWidth - window.innerWidth / 2 + 'px');
    p.style.setProperty('--y0', Math.random() * window.innerHeight - window.innerHeight / 2 + 'px');
    p.style.setProperty('--x1', (Math.random() * 400 - 200) + 'px');
    p.style.setProperty('--y1', (Math.random() * 400 - 200) + 'px');
    p.style.setProperty('--size', size + 'px');
    p.style.setProperty('--opacity', opacity);
    p.style.animationDuration = (4 + Math.random() * 4) + 's';

    preloader.appendChild(p);
  }

  /* progress animation */
  let percent = 0;

  function load() {
    percent++;

    if (progressBar) progressBar.style.width = percent + '%';
    if (progressText) progressText.textContent = percent + '%';

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
   HERO ANIMATION OBSERVER
========================= */
const heroText = document.getElementById('hero');
const socialIcons = document.querySelector('.social-icons');

if (heroText) {
  new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      heroText.classList.toggle('reveal', entry.isIntersecting);
    });
  }, { threshold: 0.6 }).observe(heroText);
}

if (socialIcons) {
  new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      socialIcons.classList.toggle('reveal', entry.isIntersecting);
    });
  }, { threshold: 0.6 }).observe(socialIcons);
}

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
   AOS INIT + EMAILJS + TYPED + TILT
========================= */
window.addEventListener("DOMContentLoaded", () => {

  /* AOS */
  if (typeof AOS !== "undefined") {
    AOS.init({
      duration: 800,
      once: true,
      offset: 100
    });
  }

  /* EMAILJS */
  if (window.emailjs) {
    emailjs.init("vI-NhtzREwXqZQq5N");
  }

  const form = document.getElementById("feedback-form");

  if (form && window.emailjs) {
    form.addEventListener("submit", (e) => {
      e.preventDefault();

      const name = form.from_name.value.trim();
      const email = form.from_email.value.trim();
      const message = form.message.value.trim();

      if (!name || !email || !message) {
        alert("❌ Please fill all fields");
        return;
      }

      const gmailPattern = /^[a-zA-Z0-9._%+-]+@gmail\.com$/;
      if (!gmailPattern.test(email)) {
        alert("❌ Enter valid Gmail");
        return;
      }

      emailjs.sendForm("service_71kywa9", "template_lh1bgai", form)
        .then(() => {
          alert("✅ Message sent!");
          form.reset();
        })
        .catch(() => {
          alert("❌ Failed to send");
        });
    });
  }

  /* Typed JS */
  if (window.Typed) {
    new Typed('#typed', {
      strings: ["IT Learner", "Frontend Developer", "UI Enthusiast"],
      typeSpeed: 60,
      backSpeed: 30,
      loop: true
    });
  }

  /* Tilt */
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
   SKILLS SCROLL (OPTIMIZED)
========================= */
window.addEventListener("load", () => {
  const track = document.getElementById("skillsTrack");
  const wrapper = document.querySelector(".skills-wrapper");

  if (!track || !wrapper) return;

  if (!track.classList.contains("tripled")) {
    track.innerHTML = track.innerHTML + track.innerHTML;
    track.classList.add("tripled");
  }

  let offset = 0;
  let paused = false;

  const CARD_WIDTH = 130;
  const singleSetWidth = (track.children.length / 2) * CARD_WIDTH;

  wrapper.addEventListener("mouseenter", () => paused = true);
  wrapper.addEventListener("mouseleave", () => paused = false);

  function animate() {
    if (!paused) {
      offset += 0.5;

      if (offset >= singleSetWidth) {
        offset = 0;
      }

      track.style.transform = `translateX(-${offset}px)`;
    }

    requestAnimationFrame(animate);
  }

  animate();
});

/* =========================
   GSAP ABOUT SECTION (SAFE)
========================= */
gsap.from(".about-text", {
  scrollTrigger: {
    trigger: ".about-section",
    start: "top 80%"
  },
  opacity: 0,
  y: 60,
  duration: 1,
  ease: "power3.out"
});

gsap.from(".about-lottie", {
  scrollTrigger: {
    trigger: ".about-section",
    start: "top 80%"
  },
  opacity: 0,
  y: 80,
  duration: 1,
  ease: "power3.out",
  stagger: 0.2
});
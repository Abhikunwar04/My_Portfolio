gsap.registerPlugin(ScrollTrigger);

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

  if (!preloader) return;

  for (let i = 0; i < 80; i++) {
    const p = document.createElement('div');
    p.className = 'particle';

    const size = 2 + Math.random() * 4;
    const opacity = 0.3 + Math.random() * 0.7;

    p.style.setProperty('--x0', Math.random() * window.innerWidth - window.innerWidth / 2 + 'px');
    p.style.setProperty('--y0', Math.random() * window.innerHeight - window.innerHeight / 2 + 'px');
    p.style.setProperty('--x1', (Math.random() * 500 - 250) + 'px');
    p.style.setProperty('--y1', (Math.random() * 500 - 250) + 'px');
    p.style.setProperty('--size', size + 'px');
    p.style.setProperty('--opacity', opacity);
    p.style.animationDuration = (5 + Math.random() * 5) + 's';

    preloader.appendChild(p);
  }

  const progressBar = document.querySelector('.progress');
  const progressText = document.querySelector('.progress-text');

  let percent = 0;

  function animateProgress() {
    percent++;
    if (progressBar) progressBar.style.width = percent + '%';
    if (progressText) progressText.textContent = percent + '%';

    if (percent < 100) {
      setTimeout(animateProgress, 40);
    } else {
      preloader.classList.add("slide-out");

      setTimeout(() => {
        preloader.style.display = "none";
        document.body.style.overflow = "auto";
      }, 800);
    }
  }

  animateProgress();
});

/* =========================
   HERO + SOCIAL OBSERVER
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
   AOS + EMAILJS + TYPED + TILT
========================= */
window.addEventListener("DOMContentLoaded", () => {

  if (typeof AOS !== "undefined") {
    AOS.init({ duration: 800, once: true, offset: 100 });
  }

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
      "max-glare": 0.2,
    });
  }
});

/* =========================
   SKILLS SCROLL
========================= */
window.addEventListener("load", () => {
  const track = document.getElementById("skillsTrack");
  const wrapper = document.querySelector(".skills-wrapper");

  if (!track || !wrapper) return;

  if (!track.classList.contains("tripled")) {
    track.innerHTML = track.innerHTML + track.innerHTML + track.innerHTML;
    track.classList.add("tripled");
  }

  let offset = 0;
  let paused = false;

  const CARD_WIDTH = 130;
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

/* =========================
   SKILL COLORS
========================= */
document.querySelectorAll(".skill").forEach(skill => {
  const color = skill.getAttribute("data-color");
  if (!color) return;

  skill.style.setProperty("--skill-color", color);

  // default subtle glow
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
/* =========================
   GSAP ABOUT SECTION (FIXED)
========================= */
gsap.from(".about-text", {
  scrollTrigger: {
    trigger: ".about-section",
    start: "top 80%",
  },
  opacity: 0,
  y: 60,
  duration: 1,
  ease: "power3.out"
});

gsap.from(".about-lottie.left", {
  scrollTrigger: {
    trigger: ".about-section",
    start: "top 80%",
  },
  opacity: 0,
  x: -120,
  duration: 1.2,
  ease: "power3.out"
});

gsap.from(".about-lottie.right", {
  scrollTrigger: {
    trigger: ".about-section",
    start: "top 80%",
  },
  opacity: 0,
  x: 120,
  duration: 1.2,
  ease: "power3.out"
});

gsap.from(".highlight", {
  scrollTrigger: {
    trigger: ".about-text",
    start: "top 85%",
  },
  opacity: 0,
  scale: 0.8,
  stagger: 0.15,
  duration: 0.6,
  ease: "back.out(1.7)"
});

const dot = document.getElementById("cursorDot");
const ring = document.getElementById("cursorRing");

let mouseX = 0, mouseY = 0;
let ringX = 0, ringY = 0;
let velocityX = 0, velocityY = 0;

/* tuning */
const stiffness = 0.22;
const damping = 0.7;

const dotSize = 6;

// dynamic ring size
function getRingSize() {
  return ring.offsetWidth;
}

// DOT follow
document.addEventListener("mousemove", (e) => {
  mouseX = e.clientX;
  mouseY = e.clientY;

  dot.style.transform = `translate(${mouseX - dotSize/2}px, ${mouseY - dotSize/2}px)`;
});

// RING animation
function animateRing() {
  const dx = mouseX - ringX;
  const dy = mouseY - ringY;

  velocityX += dx * stiffness;
  velocityY += dy * stiffness;

  velocityX *= damping;
  velocityY *= damping;

  ringX += velocityX;
  ringY += velocityY;

  const size = getRingSize();

  ring.style.transform = `translate(${ringX - size/2}px, ${ringY - size/2}px)`;

  requestAnimationFrame(animateRing);
}
animateRing();

// hover
document.querySelectorAll("a, button, .hover-target, .project-card").forEach(el => {
  el.addEventListener("mouseenter", () => ring.classList.add("hovered"));
  el.addEventListener("mouseleave", () => ring.classList.remove("hovered"));
});

// click
document.addEventListener("mousedown", () => ring.classList.add("click"));
document.addEventListener("mouseup", () => ring.classList.remove("click"));

// hide
document.addEventListener("mouseleave", () => {
  dot.style.opacity = "0";
  ring.style.opacity = "0";
});

document.addEventListener("mouseenter", () => {
  dot.style.opacity = "1";
  ring.style.opacity = "1";
});
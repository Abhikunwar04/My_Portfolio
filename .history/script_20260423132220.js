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
// =========================
// 🔥 CYBER PRELOADER EXIT
// =========================

window.addEventListener("load", () => {
  const preloader = document.getElementById("preloader");

  if (!preloader) return;

  // body lock (start)
  document.body.classList.add("loading");

  // total animation timing (match your preloader)
  setTimeout(() => {
    preloader.classList.add("hide");

    setTimeout(() => {
      preloader.style.display = "none";
      document.body.classList.remove("loading");
    }, 600);

  }, 3200); // timing tweak kar sakta hai (3000–4000 best)
});
/* =========================
   HERO + SOCIAL
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
   DOM LOADED (IMPORTANT)
========================= */
window.addEventListener("DOMContentLoaded", () => {

  // AOS
  if (typeof AOS !== "undefined") {
    AOS.init({
      duration: 900,
      once: false,
      mirror: true,
      offset: 120
    });
  }

  // EMAILJS
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

  /* =========================
     ✅ SKILL COLOR FIX
  ========================= */
  document.querySelectorAll(".skill").forEach(skill => {
    const color = skill.getAttribute("data-color");
    if (color) {
      skill.style.setProperty("--skill-color", color);
    }
  });

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
   GSAP ANIMATIONS
========================= */
gsap.from(".about-text", {
  scrollTrigger: {
    trigger: ".about-section",
    start: "top 80%",
    toggleActions: "play reverse play reverse"
  },
  opacity: 0,
  y: 60,
  duration: 1
});

gsap.from(".about-lottie.left", {
  scrollTrigger: {
    trigger: ".about-section",
    start: "top 80%"
  },
  opacity: 0,
  x: -120,
  duration: 1.2
});

gsap.from(".about-lottie.right", {
  scrollTrigger: {
    trigger: ".about-section",
    start: "top 80%"
  },
  opacity: 0,
  x: 120,
  duration: 1.2
});

gsap.from(".project-card", {
  scrollTrigger: {
    trigger: "#projects",
    start: "top 80%"
  },
  opacity: 0,
  y: 50,
  stagger: 0.2
});

gsap.from(".contact-form-wrapper", {
  scrollTrigger: {
    trigger: "#contact",
    start: "top 80%"
  },
  opacity: 0,
  y: 60
});

/* =========================
   CUSTOM CURSOR
========================= */
const dot = document.getElementById("cursorDot");
const ring = document.getElementById("cursorRing");

let mouseX = 0, mouseY = 0;
let ringX = 0, ringY = 0;
let velocityX = 0, velocityY = 0;

const stiffness = 0.22;
const damping = 0.7;
const dotSize = 6;

document.addEventListener("mousemove", (e) => {
  mouseX = e.clientX;
  mouseY = e.clientY;

  dot.style.transform = `translate(${mouseX - dotSize/2}px, ${mouseY - dotSize/2}px)`;
});

function animateRing() {
  const dx = mouseX - ringX;
  const dy = mouseY - ringY;

  velocityX += dx * stiffness;
  velocityY += dy * stiffness;

  velocityX *= damping;
  velocityY *= damping;

  ringX += velocityX;
  ringY += velocityY;

  const size = ring.offsetWidth;
  ring.style.transform = `translate(${ringX - size/2}px, ${ringY - size/2}px)`;

  requestAnimationFrame(animateRing);
}
animateRing();

document.querySelectorAll("a, button, .project-card").forEach(el => {
  el.addEventListener("mouseenter", () => ring.classList.add("hovered"));
  el.addEventListener("mouseleave", () => ring.classList.remove("hovered"));
});

document.addEventListener("mousedown", () => ring.classList.add("click"));
document.addEventListener("mouseup", () => ring.classList.remove("click"));
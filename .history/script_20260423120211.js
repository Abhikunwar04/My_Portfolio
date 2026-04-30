// =========================
// SAFE GSAP INIT
// =========================
if (typeof gsap !== "undefined" && typeof ScrollTrigger !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

// =========================
// NAVBAR SCROLL
// =========================
const topBar = document.getElementById('top-bar');
let lastScroll = 0;

window.addEventListener('scroll', () => {
  if (!topBar) return;

  const currentScroll = window.pageYOffset;

  topBar.classList.toggle('scrolled', currentScroll > 10);

  if (currentScroll > lastScroll && currentScroll > 50) {
    topBar.classList.add('hide');
  } else {
    topBar.classList.remove('hide');
  }

  lastScroll = currentScroll;
});

// =========================
// PRELOADER
// =========================
window.addEventListener("load", () => {
  document.body.classList.add("loading");

  const preloader = document.getElementById('preloader');
  if (!preloader) return;

  // particles
  for (let i = 0; i < 60; i++) {
    const p = document.createElement('div');
    p.className = 'particle';

    p.style.setProperty('--x0', Math.random()*window.innerWidth+'px');
    p.style.setProperty('--y0', Math.random()*window.innerHeight+'px');
    p.style.setProperty('--x1', (Math.random()*400-200)+'px');
    p.style.setProperty('--y1', (Math.random()*400-200)+'px');
    p.style.setProperty('--size', (2+Math.random()*3)+'px');

    preloader.appendChild(p);
  }

  const progressBar = document.querySelector('.progress');
  const progressText = document.querySelector('.progress-text');

  let percent = 0;

  function animate() {
    percent++;

    if (progressBar) progressBar.style.width = percent + '%';
    if (progressText) progressText.textContent = percent + '%';

    if (percent < 100) {
      requestAnimationFrame(animate);
    } else {
      preloader.classList.add("slide-out");

      setTimeout(() => {
        preloader.remove();
        document.body.classList.remove("loading");
      }, 700);
    }
  }

  animate();
});

// =========================
// HERO OBSERVER
// =========================
const heroText = document.getElementById('hero');
const socialIcons = document.querySelector('.social-icons');

const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    entry.target.classList.toggle('reveal', entry.isIntersecting);
  });
}, { threshold: 0.5 });

if (heroText) observer.observe(heroText);
if (socialIcons) observer.observe(socialIcons);

// =========================
// HAMBURGER
// =========================
const hamburger = document.getElementById('hamburger');
const navLinks = document.getElementById('nav-links');

hamburger?.addEventListener('click', () => {
  navLinks?.classList.toggle('active');
});

// =========================
// AOS + EMAILJS
// =========================
window.addEventListener("DOMContentLoaded", () => {

  if (window.AOS) {
    AOS.init({
      duration: 900,
      once: false,
      mirror: true
    });
  }

  if (window.emailjs) {
    emailjs.init("vI-NhtzREwXqZQq5N");
  }

  const form = document.getElementById("feedback-form");

  form?.addEventListener("submit", (e) => {
    e.preventDefault();

    const { from_name, from_email, message } = form;

    if (!from_name.value || !from_email.value || !message.value) {
      alert("Fill all fields");
      return;
    }

    emailjs.sendForm("service_71kywa9", "template_lh1bgai", form)
      .then(() => {
        alert("Message sent!");
        form.reset();
      })
      .catch(() => alert("Error sending"));
  });

});

// =========================
// SKILLS SCROLL
// =========================
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
  const singleWidth = (track.children.length / 3) * CARD_WIDTH;

  wrapper.addEventListener("mouseenter", () => paused = true);
  wrapper.addEventListener("mouseleave", () => paused = false);

  function loop() {
    if (!paused) {
      offset += 0.4;
      if (offset >= singleWidth) offset = 0;
      track.style.transform = `translateX(-${offset}px)`;
    }
    requestAnimationFrame(loop);
  }

  loop();
});

// =========================
// GSAP ANIMATIONS
// =========================
if (window.gsap) {

  gsap.from(".about-text", {
    scrollTrigger: ".about-section",
    y: 60,
    opacity: 0,
    duration: 1
  });

  gsap.from(".project-card", {
    scrollTrigger: "#projects",
    y: 50,
    opacity: 0,
    stagger: 0.2
  });

}

// =========================
// CUSTOM CURSOR (SAFE)
// =========================
const dot = document.getElementById("cursorDot");
const ring = document.getElementById("cursorRing");

if (dot && ring) {

  let mouseX = 0, mouseY = 0;
  let ringX = 0, ringY = 0;
  let vx = 0, vy = 0;

  const stiffness = 0.2;
  const damping = 0.7;

  document.addEventListener("mousemove", e => {
    mouseX = e.clientX;
    mouseY = e.clientY;
    dot.style.transform = `translate(${mouseX}px, ${mouseY}px)`;
  });

  function animate() {
    const dx = mouseX - ringX;
    const dy = mouseY - ringY;

    vx += dx * stiffness;
    vy += dy * stiffness;

    vx *= damping;
    vy *= damping;

    ringX += vx;
    ringY += vy;

    ring.style.transform = `translate(${ringX}px, ${ringY}px)`;

    requestAnimationFrame(animate);
  }

  animate();

  document.addEventListener("mouseover", (e) => {
    if (e.target.closest("a, button, .project-card")) {
      ring.classList.add("hovered");
    } else {
      ring.classList.remove("hovered");
    }
  });

}
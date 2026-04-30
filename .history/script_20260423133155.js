gsap.registerPlugin(ScrollTrigger);

/* =========================
   BODY LOADING START (FIX)
========================= */
document.body.classList.add("loading");

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
   🔥 FULL CYBER PRELOADER
========================= */
window.addEventListener("load", () => {

  const preloader = document.getElementById("preloader");
  if (!preloader) return;

  // MATRIX CANVAS
  const canvas = document.getElementById('mc');
  const ctx = canvas.getContext('2d');

  let W, H;
  function resize(){
    const r = canvas.parentElement.getBoundingClientRect();
    W = canvas.width = r.width;
    H = canvas.height = r.height;
  }
  resize();
  window.addEventListener('resize', resize);

  const chars = "アカサタナハマヤラ0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  const drops = Array.from({length: 60}, () => Math.random() * -50);

  function draw(){
    ctx.fillStyle = "rgba(2,12,5,0.1)";
    ctx.fillRect(0,0,W,H);

    ctx.fillStyle = "#00ff41";
    ctx.font = "14px monospace";

    for(let i=0;i<drops.length;i++){
      const text = chars[Math.floor(Math.random()*chars.length)];
      ctx.fillText(text, i*20, drops[i]*20);

      if(drops[i]*20 > H && Math.random() > 0.97){
        drops[i] = 0;
      }
      drops[i]++;
    }
  }

  setInterval(draw, 40);

  /* GREETINGS */
  const greetings = ["Hello","नमस्ते","Hola","Bonjour","Ciao"];
  const greetEl = document.getElementById("greetEl");

  let i = 0;
  function showGreeting(){
    if(i >= greetings.length) return;
    greetEl.textContent = greetings[i];
    greetEl.style.opacity = "1";

    setTimeout(() => {
      greetEl.style.opacity = "0";
      i++;
      setTimeout(showGreeting, 200);
    }, 300);
  }
  showGreeting();

  /* SCRAMBLE NAME */
  const nameEl = document.getElementById("nm");
  const letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";

  function scramble(){
    let iteration = 0;

    const interval = setInterval(() => {
      nameEl.innerText = "ABHI KUNWAR"
        .split("")
        .map((letter, index) => {
          if(index < iteration){
            return "ABHI KUNWAR"[index];
          }
          return letters[Math.floor(Math.random()*26)];
        })
        .join("");

      if(iteration >= "ABHI KUNWAR".length){
        clearInterval(interval);
      }

      iteration += 1/3;
    }, 40);
  }

  setTimeout(scramble, 1200);

  /* PROGRESS BAR */
  const fill = document.getElementById("fill");
  const pctL = document.getElementById("pctL");
  const pctC = document.getElementById("pctC");

  let progress = 0;
  const progInterval = setInterval(() => {
    progress += Math.random()*5;
    if(progress >= 100){
      progress = 100;
      clearInterval(progInterval);
    }

    const p = Math.floor(progress);
    fill.style.width = p + "%";
    pctL.textContent = p + "%";
    pctC.textContent = p + "%";
  }, 60);

  /* EXIT PRELOADER */
  setTimeout(() => {
    preloader.classList.add("hide");

    setTimeout(() => {
      preloader.style.display = "none";
      document.body.classList.remove("loading");
    }, 600);

  }, 3000);

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
   HAMBURGER
========================= */
const hamburger = document.getElementById('hamburger');
const navLinks = document.getElementById('nav-links');

if (hamburger && navLinks) {
  hamburger.addEventListener('click', () => {
    navLinks.classList.toggle('active');
  });
}

/* =========================
   DOM LOADED
========================= */
window.addEventListener("DOMContentLoaded", () => {

  if (typeof AOS !== "undefined") {
    AOS.init({
      duration: 900,
      once: false,
      mirror: true,
      offset: 120
    });
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
   GSAP
========================= */
gsap.from(".about-text", {
  scrollTrigger: {
    trigger: ".about-section",
    start: "top 80%"
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

/* =========================
   CURSOR
========================= */
const dot = document.getElementById("cursorDot");
const ring = document.getElementById("cursorRing");

let mouseX = 0, mouseY = 0;
let ringX = 0, ringY = 0;
let velocityX = 0, velocityY = 0;

const stiffness = 0.22;
const damping = 0.7;

document.addEventListener("mousemove", (e) => {
  mouseX = e.clientX;
  mouseY = e.clientY;
  dot.style.transform = `translate(${mouseX}px, ${mouseY}px)`;
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

  ring.style.transform = `translate(${ringX}px, ${ringY}px)`;

  requestAnimationFrame(animateRing);
}
animateRing();
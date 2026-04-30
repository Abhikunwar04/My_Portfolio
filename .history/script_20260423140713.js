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

  document.body.classList.add("loading");

  /* =========================
     MATRIX (ORIGINAL FEEL)
  ========================= */
  const canvas = document.getElementById('mc');
  const ctx = canvas.getContext('2d');

  let W, H;

  function resize(){
    const rect = canvas.parentElement.getBoundingClientRect();
    W = canvas.width = rect.width;
    H = canvas.height = rect.height;
  }

  resize();
  window.addEventListener('resize', resize);

  const CHARS = "アイウエオカキクケコ0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ@#$%&";
  const drops = Array.from({length: 60}, () => Math.random() * -80);

  function drawMatrix(){
    ctx.fillStyle = "rgba(2,12,5,0.07)";
    ctx.fillRect(0,0,W,H);

    ctx.font = "13px 'Share Tech Mono', monospace";

    const colW = W / drops.length;

    for(let i=0;i<drops.length;i++){
      const text = CHARS[Math.floor(Math.random()*CHARS.length)];

      const x = i * colW;
      const y = drops[i] * 16;

      ctx.fillStyle = Math.random() > 0.93
        ? "rgba(200,255,210,0.9)"
        : "rgba(0,255,65,0.7)";

      ctx.fillText(text, x, y);

      if(y > H && Math.random() > 0.975){
        drops[i] = 0;
      }

      drops[i] += 0.6;
    }

    requestAnimationFrame(drawMatrix);
  }

  drawMatrix();


  /* =========================
     GREETINGS (ORIGINAL FLOW)
  ========================= */
  const greetings = [
    "Hello","नमस्ते","Hola","Bonjour","Ciao",
    "Olá","Здравствуйте","Merhaba","Hej","Hallo"
  ];

  const greetEl = document.getElementById("greetEl");

  let gi = 0;
  const totalTime = 1800;
  const per = totalTime / greetings.length;

  function runGreetings(callback){
    greetEl.textContent = greetings[0];
    animateIn();

    function next(){
      if(gi >= greetings.length - 1){
        animateOut(callback);
        return;
      }

      animateOut(() => {
        gi++;
        greetEl.textContent = greetings[gi];
        animateIn();
        setTimeout(next, per - 120);
      });
    }

    setTimeout(next, per - 120);
  }

  function animateIn(){
    greetEl.style.transition = "none";
    greetEl.style.opacity = "0";
    greetEl.style.transform = "scale(0.85)";

    requestAnimationFrame(() => {
      greetEl.style.transition = "0.2s ease";
      greetEl.style.opacity = "1";
      greetEl.style.transform = "scale(1)";
    });
  }

  function animateOut(cb){
    greetEl.style.transition = "0.12s ease";
    greetEl.style.opacity = "0";
    greetEl.style.transform = "scale(1.1)";
    setTimeout(cb, 120);
  }


  /* =========================
     SCRAMBLE TEXT
  ========================= */
  const nameEl = document.getElementById("nm");
  const glR = document.getElementById("glR");
  const glG = document.getElementById("glG");

  const FULL = "ABHI KUNWAR";
  const LETTERS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";

  function scramble(callback){
    let rev = 0;
    let count = 0;

    function loop(){
      let str = "";

      for(let i=0;i<FULL.length;i++){
        if(i < rev) str += FULL[i];
        else if(FULL[i] === " ") str += " ";
        else str += LETTERS[Math.floor(Math.random()*LETTERS.length)];
      }

      nameEl.textContent = str;
      glR.textContent = str;
      glG.textContent = str;

      count++;

      if(count % 3 === 0 && rev < FULL.length){
        rev++;
      }

      if(rev < FULL.length){
        setTimeout(loop, 45);
      } else {
        nameEl.textContent = FULL;
        glR.textContent = FULL;
        glG.textContent = FULL;
        if(callback) callback();
      }
    }

    loop();
  }


  /* =========================
     GLITCH EFFECT 🔥
  ========================= */
  function glitch(){
    let r = 0;
    const max = 8;

    function g(){
      if(r >= max){
        glR.style.opacity = 0;
        glG.style.opacity = 0;
        return;
      }

      const dx = (Math.random()-0.5)*12;
      const dy = (Math.random()-0.5)*5;

      glR.style.opacity = 0.7;
      glG.style.opacity = 0.5;

      glR.style.transform = `translate(${dx}px,${dy}px)`;
      glG.style.transform = `translate(${-dx}px,${-dy}px)`;

      r++;
      setTimeout(g, 30);
    }

    g();
  }


  /* =========================
     PROGRESS
  ========================= */
  const fill = document.getElementById("fill");
  const pctL = document.getElementById("pctL");
  const pctC = document.getElementById("pctC");
  const stTxt = document.getElementById("stTxt");

  const statuses = ["LOADING","PARSING DATA","BUILDING WORLD","ALMOST READY","COMPLETE"];
  let si = 0;

  function nextStatus(){
    if(si < statuses.length - 1){
      si++;
      stTxt.textContent = statuses[si];
    }
  }

  function runProgress(duration, callback){
    let progress = 0;

    const interval = setInterval(() => {
      progress += Math.random() * 4;

      if(progress >= 100){
        progress = 100;
        clearInterval(interval);
        nextStatus();
        if(callback) setTimeout(callback, 200);
      }

      const p = Math.floor(progress);

      fill.style.width = p + "%";
      pctL.textContent = p + "%";
      pctC.textContent = p + "%";

      if(p > 25 && si < 1) nextStatus();
      if(p > 55 && si < 2) nextStatus();
      if(p > 80 && si < 3) nextStatus();

    }, 50);
  }


  /* =========================
     FLOW (EXACT MATCH)
  ========================= */
  const phase1 = document.getElementById("phase1");
  const phase2 = document.getElementById("phase2");

  runGreetings(() => {

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
          }, 600);

        }, 300);

      });

    }, 350);

  });

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
// Updated script.js for refined animations and feedback + new enhancements

// === Theme Toggle ===
const toggleBtn = document.getElementById('theme-toggle');
if (toggleBtn) {
  toggleBtn.addEventListener('click', () => {
    document.body.classList.toggle('light-theme');
  });
}

// === Scroll Navbar Background and Hide on Scroll ===
const topBar = document.getElementById('top-bar');
let lastScroll = 0;
window.addEventListener('scroll', () => {
  const currentScroll = window.pageYOffset;
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

// === Preloader ===
// ===== NEW PRELOADER =====
window.addEventListener("load", () => {
  const preloader = document.getElementById('preloader');

  // particles
  for(let i=0;i<80;i++){
    const p=document.createElement('div');
    p.className='particle';

    const size=2+Math.random()*4;
    const opacity=0.3+Math.random()*0.7;

    p.style.setProperty('--x0', Math.random()*window.innerWidth - window.innerWidth/2 + 'px');
    p.style.setProperty('--y0', Math.random()*window.innerHeight - window.innerHeight/2 + 'px');
    p.style.setProperty('--x1', (Math.random()*500-250)+'px');
    p.style.setProperty('--y1', (Math.random()*500-250)+'px');
    p.style.setProperty('--size', size+'px');
    p.style.setProperty('--opacity', opacity);
    p.style.animationDuration=(5+Math.random()*5)+'s';

    preloader.appendChild(p);
  }

  const progressBar = document.querySelector('.progress');
  const progressText = document.querySelector('.progress-text');

  let percent = 0;

  function animateProgress(){
    percent++;
    progressBar.style.width = percent + '%';
    progressText.textContent = percent + '%';

    if(percent < 100){
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

// === Hero Animation ===
const heroText = document.getElementById('hero');
if (heroText) {
  const heroObserver = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        heroText.classList.remove('reveal');
        void heroText.offsetWidth;
        heroText.classList.add('reveal');
      } else {
        heroText.classList.remove('reveal');
      }
    });
  }, { threshold: 0.6 });
  heroObserver.observe(heroText);
}

// === Social Icons Reveal ===
const socialIcons = document.querySelector('.social-icons');
if (socialIcons) {
  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        socialIcons.classList.add('reveal');
      }
    });
  }, { threshold: 0.6 });
  observer.observe(socialIcons);
}

// === Hamburger Menu ===
const hamburger = document.getElementById('hamburger');
const navLinks = document.getElementById('nav-links');
if (hamburger && navLinks) {
  hamburger.addEventListener('click', () => {
    navLinks.classList.toggle('active');
  });
}

// === AOS and EmailJS Init ===
window.addEventListener("DOMContentLoaded", () => {
  if (typeof AOS !== "undefined") {
    AOS.init({ duration: 800, once: true, offset: 100 });
  }
  emailjs.init("vI-NhtzREwXqZQq5N");

  const form = document.getElementById("feedback-form");
  if (form) {
    form.addEventListener("submit", function (e) {
      e.preventDefault();

      const name = form.from_name.value.trim();
      const email = form.from_email.value.trim();
      const message = form.message.value.trim();

      if (!name || !email || !message) {
        alert("❌ Please fill in all fields.");
        return;
      }

      const gmailPattern = /^[a-zA-Z0-9._%+-]+@gmail\.com$/;
      if (!gmailPattern.test(email)) {
        alert("❌ Please enter a valid Gmail address.");
        return;
      }

      const domain = email.split("@")[1].toLowerCase();
      const blockedDomains = ["gmal.com", "gmial.com", "gmail.co", "gmail.in", "gmail.org", "mailinator.com", "tempmail.com", "yopmail.com"];
      if (blockedDomains.includes(domain)) {
        alert("❌ Disposable or fake Gmail domains are not allowed.");
        return;
      }

      emailjs.sendForm("service_71kywa9", "template_lh1bgai", form)
        .then(() => {
          alert("✅ Message sent successfully!");
          form.reset();
        })
        .catch((error) => {
          console.error("EmailJS Error:", error);
          alert("❌ Failed to send. Please try again later.");
        });
    });
  }

  // === Typing Animation ===
  if (window.Typed) {
    new Typed('#typed', {
      strings: ["IT Learner", "Frontend Developer", "UI Enthusiast"],
      typeSpeed: 60,
      backSpeed: 30,
      loop: true
    });
  }

  // === 3D Tilt Effect ===
  if (window.VanillaTilt) {
    VanillaTilt.init(document.querySelectorAll(".project-card"), {
      max: 15,
      speed: 400,
      glare: true,
      "max-glare": 0.2,
    });
  }
});

// === Skills Scroll Animation (ULTRA SMOOTH + NO CONFLICT) ===
window.addEventListener("load", () => {
  const track = document.getElementById("skillsTrack");

  if (!track) return;

  if (!track.classList.contains("duplicated")) {
    track.innerHTML += track.innerHTML;
    track.classList.add("duplicated");
  }

  let offset = 0;
  let direction = 1;
  let lastScrollY = window.scrollY;

  let ticking = false;

  window.addEventListener("scroll", () => {
    if (!ticking) {
      window.requestAnimationFrame(() => {
        const currentScroll = window.scrollY;
        direction = currentScroll > lastScrollY ? 1 : -1;
        lastScrollY = currentScroll;
        ticking = false;
      });

      ticking = true;
    }
  });

  function animate() {
    offset += direction * 0.4;

    if (Math.abs(offset) >= track.scrollWidth / 2) {
      offset = 0;
    }

    track.style.transform = `translateX(${offset}px)`;

    requestAnimationFrame(animate);
  }

  animate();
});
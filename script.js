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
window.addEventListener("load", () => {
  const preloader = document.getElementById("preloader");
  setTimeout(() => {
    preloader.style.transition = "opacity 1s ease, transform 0.4s";
    preloader.style.opacity = "0";
    preloader.style.transform = "scale(1.05)";
    setTimeout(() => {
      preloader.remove();
      document.body.style.overflow = "auto";
    }, 1000);
  }, 2500);
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

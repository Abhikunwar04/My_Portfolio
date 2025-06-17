// === Theme Toggle ===
const toggleBtn = document.getElementById('theme-toggle');
toggleBtn.addEventListener('click', () => {
  document.body.classList.toggle('light-theme');
});

// === Scroll Navbar Background ===
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

// === Smooth Scroll to Contact Section (Optional) ===
const contactLink = document.getElementById("contact-link");
if (contactLink) {
  contactLink.addEventListener("click", () => {
    document.querySelector("#contact").scrollIntoView({ behavior: "smooth" });
  });
}
// === Social Icons Reveal on Scroll ===
const socialIcons = document.querySelector('.social-icons');
const observer = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      socialIcons.classList.add('reveal');
    }
  });
}, { threshold: 0.6 });

if (socialIcons) observer.observe(socialIcons);

// === Hero Text Reveal Every Scroll ===
const heroText = document.getElementById('hero');

const heroObserver = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      heroText.classList.remove('reveal');
      void heroText.offsetWidth; // Force reflow
      heroText.classList.add('reveal');
    } else {
      heroText.classList.remove('reveal'); // Reset when out of view
    }
  });
}, {
  threshold: 0.6
});

if (heroText) {
  heroObserver.observe(heroText);
}

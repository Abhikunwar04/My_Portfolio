// ✅ AOS animation init
AOS.init();

// ✅ Lightbox effect for gallery images
document.querySelectorAll('.gallery-container img').forEach(img => {
  img.addEventListener('click', () => {
    const overlay = document.createElement('div');
    overlay.style.position = 'fixed';
    overlay.style.top = 0;
    overlay.style.left = 0;
    overlay.style.width = '100%';
    overlay.style.height = '100%';
    overlay.style.backgroundColor = 'rgba(0,0,0,0.9)';
    overlay.style.display = 'flex';
    overlay.style.alignItems = 'center';
    overlay.style.justifyContent = 'center';
    overlay.style.zIndex = 1000;
    overlay.innerHTML = `<img src="${img.src}" style="max-width:90%; max-height:90%;">`;
    overlay.addEventListener('click', () => document.body.removeChild(overlay));
    document.body.appendChild(overlay);
  });
});
// ✅ Lightbox for devotional images
document.querySelectorAll('.zoomable').forEach(img => {
  img.addEventListener('click', () => {
    const overlay = document.createElement('div');
    overlay.style.position = 'fixed';
    overlay.style.top = 0;
    overlay.style.left = 0;
    overlay.style.width = '100%';
    overlay.style.height = '100%';
    overlay.style.backgroundColor = 'rgba(0,0,0,0.9)';
    overlay.style.display = 'flex';
    overlay.style.alignItems = 'center';
    overlay.style.justifyContent = 'center';
    overlay.style.zIndex = 1000;
    overlay.innerHTML = `<img src="${img.src}" style="max-width:95%; max-height:95%; border-radius:10px;">`;
    overlay.addEventListener('click', () => document.body.removeChild(overlay));
    document.body.appendChild(overlay);
  });
});


// ✅ Theme toggle with localStorage
const toggleBtn = document.getElementById('toggle-theme');
const currentTheme = localStorage.getItem('theme');

if (currentTheme === 'light') {
  document.body.classList.add('light');
  toggleBtn.textContent = '🌙';
}

toggleBtn.addEventListener('click', () => {
  document.body.classList.toggle('light');
  const isLight = document.body.classList.contains('light');
  toggleBtn.textContent = isLight ? '🌙' : '🌞';
  localStorage.setItem('theme', isLight ? 'light' : 'dark');
});

// ✅ Scroll behavior for hiding top bar + icons
let lastScroll = 0;
const topBar = document.getElementById('top-bar');
const backToTopBtn = document.getElementById('back-to-top');
const slideshowIcons = document.getElementById('slideshow-icons');
const galleryTop = document.getElementById('gallery').offsetTop;

window.addEventListener('scroll', () => {
  const currentScroll = window.pageYOffset;

  if (currentScroll > lastScroll && currentScroll > 50) {
    topBar.classList.add('hide');
  } else {
    topBar.classList.remove('hide');
  }
  lastScroll = currentScroll;

  if (currentScroll > 200) {
    backToTopBtn.classList.add('show');
  } else {
    backToTopBtn.classList.remove('show');
  }

  if (currentScroll < 50 || currentScroll > galleryTop - 100) {
    slideshowIcons.classList.add('hide');
  } else {
    slideshowIcons.classList.remove('hide');
  }
});

// ✅ Slideshow and Quotes
const quotes = [
  "Through My Device.",
  "कुछ यूँ मिली नज़र तुजसे की,बाक़ी सब नज़रंदाज़ हो गये...! 🦋🕊",
  "Every picture tells your story.",
  "यूं तो लिखा नहीं कभी, सुना हज़ारों दफा है।तुम्हारी तारीफें सुनकर, लिखने का प्रयास भी किया हैं।",
  "Be a WARRIOR not a worrier.",
  "शान्तिः सर्वदा सुन्दरः भवति|",
  "सितारों को आँखों में महफूज़ रखना, बड़ी देर तक रात ही रात होगी।मुसाफ़िर हैं हम भी, मुसाफ़िर हो तुम भी, किसी मोड़ पर फिर मुलाक़ात होगी।",
  "Beauty is found through the lens.",
  "सब तय है|",
  "The best images are unplanned."
];

const mainTitle = document.getElementById("main-title");
const quoteText = document.getElementById("quote-text");
const fadeImages = document.querySelectorAll(".fade-slide img");

fadeImages.forEach(img => {
  img.style.opacity = 0;
  img.style.transition = 'opacity 1s ease-in-out';
  img.style.zIndex = 0;
});

let current = 0;

function showSlide(index) {
  fadeImages.forEach((img, i) => {
    img.style.zIndex = i === index ? 1 : 0;
    img.style.opacity = i === index ? 1 : 0;
  });

  quoteText.style.opacity = 0;
  quoteText.style.animation = 'none';

  setTimeout(() => {
    quoteText.textContent = quotes[index];
    quoteText.style.animation = 'fadeUpIn 1s ease-out forwards';
  }, 300);

  mainTitle.style.opacity = index === 0 ? 1 : 0;
}

showSlide(current);

setInterval(() => {
  current = (current + 1) % fadeImages.length;
  showSlide(current);
}, 5000);

// ✅ Back to top
backToTopBtn.addEventListener('click', () => {
  window.scrollTo({ top: 0, behavior: 'smooth' });
});

// ✅ Reels scroll buttons
function scrollReels(direction) {
  const container = document.getElementById('reel-scroll');
  const scrollAmount = 300;

  if (direction === 'left') {
    container.scrollBy({ left: -scrollAmount, behavior: 'smooth' });
  } else {
    container.scrollBy({ left: scrollAmount, behavior: 'smooth' });
  }
}

// ✅ Reels hover autoplay + one-at-a-time
const allReels = document.querySelectorAll('#reel-scroll video');

function pauseOtherReels(currentVideo) {
  allReels.forEach(video => {
    if (video !== currentVideo && !video.paused) {
      video.pause();
    }
  });
}

allReels.forEach(video => {
  // Pause others if one plays
  video.addEventListener('play', () => pauseOtherReels(video));

  // Click toggle
  video.addEventListener('click', (e) => {
    e.preventDefault();
    if (video.paused) {
      pauseOtherReels(video);
      video.play();
    } else {
      video.pause();
    }
  });

  // Hover autoplay
  video.addEventListener('mouseenter', () => {
    pauseOtherReels(video);
    video.muted = true;
    video.play();
  });

  // Stop on leave
  video.addEventListener('mouseleave', () => {
    video.pause();
    video.currentTime = 0;
  });
});

// ✅ Contact scroll to social icons center
document.addEventListener('DOMContentLoaded', () => {
  const contactLink = document.getElementById('contact-link');
  const socialIcons = document.getElementById('slideshow-icons');

  contactLink?.addEventListener('click', (e) => {
    e.preventDefault();

    const elementTop = socialIcons.getBoundingClientRect().top + window.scrollY;
    const centerOffset = elementTop - (window.innerHeight / 2) + (socialIcons.offsetHeight / 2);

    window.scrollTo({
      top: centerOffset,
      behavior: 'smooth'
    });
  });
});

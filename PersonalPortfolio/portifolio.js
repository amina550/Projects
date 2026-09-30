/* =============================================
   PORTFOLIO JS — Amina | AAU CTBE Sof. Eng.
   ============================================= */

'use strict';

/* ── 1. NAVBAR: scroll effect + active link ── */
const navbar    = document.getElementById('navbar');
const navLinks  = document.querySelectorAll('.nav-link');
const sections  = document.querySelectorAll('section[id]');

const onScroll = () => {
  // Scrolled class for glass effect
  navbar.classList.toggle('scrolled', window.scrollY > 20);

  // Active nav link based on scroll position
  let current = '';
  sections.forEach(section => {
    if (window.scrollY >= section.offsetTop - 120) {
      current = section.getAttribute('id');
    }
  });
  navLinks.forEach(link => {
    link.classList.remove('active');
    if (link.getAttribute('href') === `#${current}`) {
      link.classList.add('active');
    }
  });
};
window.addEventListener('scroll', onScroll, { passive: true });


/* ── 2. HAMBURGER MENU ── */
const hamburger = document.getElementById('hamburger');
const navLinksEl = document.getElementById('navLinks');

hamburger.addEventListener('click', () => {
  const isOpen = hamburger.classList.toggle('open');
  navLinksEl.classList.toggle('open', isOpen);
  hamburger.setAttribute('aria-expanded', String(isOpen));
  document.body.style.overflow = isOpen ? 'hidden' : '';
});

// Close menu when a link is clicked
navLinksEl.querySelectorAll('.nav-link').forEach(link => {
  link.addEventListener('click', () => {
    hamburger.classList.remove('open');
    navLinksEl.classList.remove('open');
    hamburger.setAttribute('aria-expanded', 'false');
    document.body.style.overflow = '';
  });
});


/* ── 3. TYPEWRITER EFFECT ── */
const phrases = [
  'Software Engineering Student 👩‍💻',
  'Web Developer in the Making 🌐',
  'Problem Solver & Learner 🎯',
  'AAU CTBE · 2nd Year 🎓',
];

const typewriterEl = document.getElementById('typewriter');
let phraseIndex = 0;
let charIndex = 0;
let isDeleting = false;
let typeTimeout;

const type = () => {
  const current = phrases[phraseIndex];

  if (isDeleting) {
    charIndex--;
  } else {
    charIndex++;
  }

  typewriterEl.innerHTML =
    current.substring(0, charIndex) + '<span class="cursor"></span>';

  let delay = isDeleting ? 50 : 90;

  if (!isDeleting && charIndex === current.length) {
    delay = 2200; // pause at full phrase
    isDeleting = true;
  } else if (isDeleting && charIndex === 0) {
    isDeleting = false;
    phraseIndex = (phraseIndex + 1) % phrases.length;
    delay = 400; // pause before next phrase
  }

  typeTimeout = setTimeout(type, delay);
};

type(); // kick off


/* ── 4. INTERSECTION OBSERVER — scroll-reveal animations ── */
const animateEls = document.querySelectorAll('[data-animate]');

const revealObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;

      const el = entry.target;
      const delay = parseInt(el.dataset.delay || '0', 10);

      setTimeout(() => {
        el.classList.add('in-view');
      }, delay);

      revealObserver.unobserve(el); // only animate once
    });
  },
  { threshold: 0.12, rootMargin: '0px 0px -60px 0px' }
);

animateEls.forEach(el => revealObserver.observe(el));


/* ── 5. PROGRESS BAR ANIMATION ── */
const progressFills = document.querySelectorAll('.progress-fill');

const progressObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      const fill = entry.target;
      const targetWidth = fill.dataset.width || '0';
      // Short delay so the section reveal happens first
      setTimeout(() => {
        fill.style.width = targetWidth + '%';
      }, 300);
      progressObserver.unobserve(fill);
    });
  },
  { threshold: 0.5 }
);

progressFills.forEach(fill => progressObserver.observe(fill));


/* ── 6. CONTACT FORM VALIDATION & SUBMISSION ── */
const contactForm = document.getElementById('contactForm');
const formSuccess = document.getElementById('formSuccess');
const submitBtn   = document.getElementById('submitBtn');

const showError = (id, msg) => {
  const el = document.getElementById(id);
  if (el) el.textContent = msg;
};
const clearErrors = () => {
  ['nameError', 'emailError', 'messageError'].forEach(id => showError(id, ''));
};

const isValidEmail = email =>
  /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

contactForm.addEventListener('submit', e => {
  e.preventDefault();
  clearErrors();
  formSuccess.style.display = 'none';

  const name    = contactForm.name.value.trim();
  const email   = contactForm.email.value.trim();
  const message = contactForm.message.value.trim();

  let valid = true;

  if (name.length < 2) {
    showError('nameError', 'Please enter your full name.');
    valid = false;
  }
  if (!isValidEmail(email)) {
    showError('emailError', 'Please enter a valid email address.');
    valid = false;
  }
  if (message.length < 10) {
    showError('messageError', 'Message must be at least 10 characters.');
    valid = false;
  }

  if (!valid) return;

  // Simulate send (replace with actual backend / EmailJS etc.)
  submitBtn.disabled = true;
  submitBtn.querySelector('.btn-text').textContent = 'Sending…';

  setTimeout(() => {
    contactForm.reset();
    submitBtn.disabled = false;
    submitBtn.querySelector('.btn-text').textContent = 'Send Message';
    formSuccess.style.display = 'block';

    // Hide success message after 5 seconds
    setTimeout(() => { formSuccess.style.display = 'none'; }, 5000);
  }, 1400);
});

// Clear individual field errors on input
['name', 'email', 'message'].forEach(field => {
  contactForm[field]?.addEventListener('input', () => {
    showError(field + 'Error', '');
  });
});


/* ── 7. FOOTER YEAR ── */
document.getElementById('year').textContent = new Date().getFullYear();


/* ── 8. SMOOTH SCROLL for anchor links (fallback) ── */
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', e => {
    const target = document.querySelector(anchor.getAttribute('href'));
    if (!target) return;
    // CSS scroll-behavior handles it; this is a JS fallback
    target.scrollIntoView({ behavior: 'smooth', block: 'start' });
  });
});

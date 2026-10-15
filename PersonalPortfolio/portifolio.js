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


/* ── 9. 100 DAYS OF CODE — card generator ── */

/**
 * CONFIGURATION — update as you build each day:
 *
 *   DAYS_DONE  : total days fully completed (0–100)
 *   TODAY_DAY  : the day you are currently working on (1–100), 0 = not started
 *
 *   COMPLETED_PROJECTS : object keyed by day number (1-based).
 *     Each entry: { title, emoji, url }
 *       title — project name shown in the tooltip
 *       emoji — icon shown on the card
 *       url   — link opened when the card is clicked (GitHub repo or live demo)
 *
 *  Example entries (uncomment & fill in as you go):
 *   1: { title: 'To-Do List',     emoji: '📋', url: 'https://github.com/amina550/Projects/tree/main/Todo-list' },
 *   2: { title: 'Grade Calc',     emoji: '🧮', url: 'https://gradecalculator-pink.vercel.app/' },
 *   3: { title: 'Weather App',    emoji: '🌤️', url: 'https://weather-app-puce-two-67.vercel.app/' },
 */
const DAYS_DONE  = 8;   // ← bump this every time you finish a day
const TODAY_DAY  = 9;   // ← set to your current day (1–100), 0 if not started yet

const COMPLETED_PROJECTS = {
  // ── Fill in each entry as: { title, emoji, url }
  // url can be a live demo OR a GitHub link — whichever best shows the project.
  // ─────────────────────────────────────────────────────────────────────────────
  1: { title: 'Grade Calculator',       emoji: '🧮', url: 'https://gradecalculator-pink.vercel.app/' },
  2: { title: 'To-Do List',            emoji: '📋', url: 'https://amina-pp.vercel.app/' },
  3: { title: 'Sorting Algorithm Viz', emoji: '🔢', url: 'https://github.com/amina550/Projects' },
  4: { title: 'Weather App',           emoji: '🌤️', url: 'https://weather-app-puce-two-67.vercel.app/' },
  5: { title: 'Quran App',             emoji: '📖', url: 'https://quranapp-beta.vercel.app/' },
  6: { title: 'Expense Tracker',       emoji: '💰', url: 'https://expensetracker-zeta-steel.vercel.app/' },
  8: { title: 'Fullstack Day 1',       emoji: '🌐', url: 'https://100days-of-fullstuck-day-1.vercel.app/' },
  // 9:  { title: 'Your Day 9 project',  emoji: '🚀', url: 'https://your-project-link.com' },
  // 10: { title: 'Your Day 10 project', emoji: '💡', url: 'https://your-project-link.com' },
  // ── Keep adding one line per day as you build! ──────────────────────────────
};



const TOTAL_DAYS = 100;

(function buildDaysGrid() {
  const grid        = document.getElementById('days100Grid');
  const fillEl      = document.getElementById('days100Fill');
  const pctEl       = document.getElementById('days100Pct');
  const doneCountEl = document.getElementById('daysCompleted');

  if (!grid) return;

  for (let i = 1; i <= TOTAL_DAYS; i++) {
    const project   = COMPLETED_PROJECTS[i];
    const isDone    = (i < TODAY_DAY || i <= DAYS_DONE);
    const isToday   = (i === TODAY_DAY && TODAY_DAY > 0);
    const hasLink   = isDone && project && project.url;

    // Use <a> for linked completed cards, <div> for everything else
    const card = document.createElement(hasLink ? 'a' : 'div');
    card.className = 'day-card';

    if (hasLink) {
      card.href   = project.url;
      card.target = '_blank';
      card.rel    = 'noopener noreferrer';
    }

    // Day number
    const numSpan = document.createElement('span');
    numSpan.className   = 'day-num';
    numSpan.textContent = i;

    // Icon
    const iconSpan = document.createElement('span');
    iconSpan.className = 'day-icon';

    if (isDone) {
      card.classList.add('day-done');
      iconSpan.textContent = project ? project.emoji : '✅';
      card.title = project
        ? `Day ${i}: ${project.title}${project.url ? ' — click to open ↗' : ''}`
        : `Day ${i}: Done!`;
      if (hasLink) card.classList.add('day-linked');
    } else if (isToday) {
      card.classList.add('day-today');
      iconSpan.textContent = '🔥';
      card.title = `Day ${i}: In progress…`;
    } else {
      card.classList.add('day-todo');
      iconSpan.textContent = '⬜';
      card.title = `Day ${i}: Coming soon`;
    }

    card.appendChild(numSpan);
    card.appendChild(iconSpan);

    // Small launch badge for linked cards
    if (hasLink) {
      const badge = document.createElement('span');
      badge.className   = 'day-link-badge';
      badge.textContent = '↗';
      card.appendChild(badge);
    }

    grid.appendChild(card);
  }

  // Animate progress bar when section scrolls into view
  const section = document.getElementById('100days');
  if (!section) return;

  const pct = Math.round((DAYS_DONE / TOTAL_DAYS) * 100);
  const obs100 = new IntersectionObserver(
    (entries) => {
      if (!entries[0].isIntersecting) return;
      setTimeout(() => {
        fillEl.style.width      = pct + '%';
        pctEl.textContent       = pct;
        doneCountEl.textContent = DAYS_DONE;
      }, 300);
      obs100.unobserve(section);
    },
    { threshold: 0.2 }
  );
  obs100.observe(section);
})();

'use strict';

/* ----------------------------------------------------------------
   Init Lucide icons
---------------------------------------------------------------- */
document.addEventListener('DOMContentLoaded', () => {
  if (window.lucide) lucide.createIcons();
});

/* ----------------------------------------------------------------
   Navbar — scroll state + active link highlighting
---------------------------------------------------------------- */
const navbar    = document.getElementById('navbar');
const navLinks  = document.getElementById('nav-links');
const hamburger = document.getElementById('hamburger');

const updateNavbar = () => {
  const scrolled = window.scrollY > 40;
  navbar.classList.toggle('scrolled', scrolled);
};

window.addEventListener('scroll', updateNavbar, { passive: true });
updateNavbar();

hamburger.addEventListener('click', () => {
  const open = navLinks.classList.toggle('open');
  hamburger.setAttribute('aria-expanded', String(open));
  if (open) hamburger.focus();
});

// Close mobile menu when a link is clicked
navLinks.querySelectorAll('.nav-link').forEach(link => {
  link.addEventListener('click', () => {
    navLinks.classList.remove('open');
    hamburger.setAttribute('aria-expanded', 'false');
  });
});

// Close on outside click
document.addEventListener('click', e => {
  if (!navbar.contains(e.target)) {
    navLinks.classList.remove('open');
    hamburger.setAttribute('aria-expanded', 'false');
  }
});

// Active section highlight
const sectionIds = ['home', 'about', 'programs', 'impact', 'stories', 'donate', 'events', 'contact'];

const highlightNavLink = () => {
  let current = 'home';
  sectionIds.forEach(id => {
    const el = document.getElementById(id);
    if (el && window.scrollY >= el.offsetTop - 120) current = id;
  });
  navLinks.querySelectorAll('.nav-link').forEach(link => {
    link.classList.toggle('active', link.getAttribute('href') === `#${current}`);
  });
};

window.addEventListener('scroll', highlightNavLink, { passive: true });

/* ----------------------------------------------------------------
   Scroll animations (Intersection Observer)
---------------------------------------------------------------- */
const revealObserver = new IntersectionObserver(
  entries => {
    entries.forEach(({ target, isIntersecting }) => {
      if (isIntersecting) {
        target.classList.add('visible');
        revealObserver.unobserve(target);
      }
    });
  },
  { threshold: 0.12, rootMargin: '0px 0px -40px 0px' }
);

document.querySelectorAll('.reveal-up, .reveal-left, .reveal-right').forEach(el => {
  revealObserver.observe(el);
});

/* ----------------------------------------------------------------
   Animated counters (hero + impact band)
---------------------------------------------------------------- */
const animateCounter = (el) => {
  const target = parseInt(el.dataset.target, 10);
  const duration = 2000;
  const start = performance.now();

  const step = (timestamp) => {
    const elapsed = timestamp - start;
    const progress = Math.min(elapsed / duration, 1);
    const eased = 1 - Math.pow(1 - progress, 3);
    el.textContent = Math.round(eased * target).toLocaleString();
    if (progress < 1) requestAnimationFrame(step);
  };
  requestAnimationFrame(step);
};

const counterObserver = new IntersectionObserver(
  entries => {
    entries.forEach(({ target, isIntersecting }) => {
      if (isIntersecting) {
        animateCounter(target);
        counterObserver.unobserve(target);
      }
    });
  },
  { threshold: 0.5 }
);

document.querySelectorAll('.counter, .stat-num').forEach(el => {
  counterObserver.observe(el);
});

/* ----------------------------------------------------------------
   Stories Carousel
---------------------------------------------------------------- */
const track   = document.getElementById('storiesTrack');
const prevBtn = document.getElementById('storyPrev');
const nextBtn = document.getElementById('storyNext');
const dots    = document.querySelectorAll('#carouselDots .dot');

if (track && prevBtn && nextBtn) {
  const cards      = track.querySelectorAll('.story-card');
  const totalCards = cards.length;
  let current      = 0;

  const getCardsVisible = () => {
    if (window.innerWidth <= 768) return 1;
    if (window.innerWidth <= 1024) return 2;
    return 3;
  };

  const getMaxIndex = () => Math.max(0, totalCards - getCardsVisible());

  const goTo = (index) => {
    const max = getMaxIndex();
    current = Math.max(0, Math.min(index, max));
    const visible = getCardsVisible();
    const cardWidth = track.parentElement.offsetWidth / visible;
    const gap = parseFloat(getComputedStyle(track).gap) || 24;
    track.style.transform = `translateX(-${current * (cardWidth + gap)}px)`;

    dots.forEach((dot, i) => {
      dot.classList.toggle('active', i === current);
      dot.setAttribute('aria-selected', String(i === current));
    });
  };

  prevBtn.addEventListener('click', () => goTo(current - 1));
  nextBtn.addEventListener('click', () => goTo(current + 1));
  dots.forEach((dot, i) => dot.addEventListener('click', () => goTo(i)));

  // Auto-advance
  let autoplay = setInterval(() => goTo(current + 1 > getMaxIndex() ? 0 : current + 1), 5000);

  track.parentElement.addEventListener('mouseenter', () => clearInterval(autoplay));
  track.parentElement.addEventListener('mouseleave', () => {
    autoplay = setInterval(() => goTo(current + 1 > getMaxIndex() ? 0 : current + 1), 5000);
  });

  // Touch swipe
  let touchStartX = 0;
  track.addEventListener('touchstart', e => { touchStartX = e.touches[0].clientX; }, { passive: true });
  track.addEventListener('touchend',   e => {
    const diff = touchStartX - e.changedTouches[0].clientX;
    if (Math.abs(diff) > 50) goTo(diff > 0 ? current + 1 : current - 1);
  });

  window.addEventListener('resize', () => goTo(Math.min(current, getMaxIndex())));
}

/* ----------------------------------------------------------------
   Donation amount selector
---------------------------------------------------------------- */
let selectedAmount = '20';

document.querySelectorAll('.amount-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.amount-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    selectedAmount = btn.dataset.amount;
    const customWrapper = document.getElementById('customAmountWrapper');
    if (customWrapper) {
      customWrapper.hidden = selectedAmount !== 'custom';
      if (selectedAmount === 'custom') {
        document.getElementById('customAmount').focus();
      }
    }
  });
});

/* ----------------------------------------------------------------
   Donate modal
---------------------------------------------------------------- */
const donateModal      = document.getElementById('donateModal');
const donateModalClose = document.getElementById('donateModalClose');

window.openDonateModal = () => {
  const customInput = document.getElementById('customAmount');
  let amount = selectedAmount;

  if (selectedAmount === 'custom') {
    amount = customInput ? customInput.value : '';
    if (!amount || isNaN(amount) || Number(amount) < 1) {
      customInput && customInput.focus();
      return;
    }
  }

  const display = document.getElementById('modalAmountDisplay');
  if (display) {
    display.textContent = `Your donation: GH₵${Number(amount).toLocaleString()}`;
  }
  donateModal.hidden = false;
  document.body.style.overflow = 'hidden';
  donateModalClose.focus();
};

const closeDonateModal = () => {
  donateModal.hidden = true;
  document.body.style.overflow = '';
};

donateModalClose && donateModalClose.addEventListener('click', closeDonateModal);

donateModal && donateModal.addEventListener('click', e => {
  if (e.target === donateModal) closeDonateModal();
});

document.addEventListener('keydown', e => {
  if (e.key === 'Escape' && donateModal && !donateModal.hidden) closeDonateModal();
});

/* ----------------------------------------------------------------
   Contact form validation
---------------------------------------------------------------- */
const contactForm = document.getElementById('contactForm');

if (contactForm) {
  const showError = (id, msg) => {
    const el = document.getElementById(id);
    if (el) el.textContent = msg;
    const input = contactForm.querySelector(`[aria-describedby="${id}"], #contact${id.replace('Error','').charAt(0).toUpperCase() + id.replace('Error','').slice(1)}`);
    input && input.classList.add('error');
  };
  const clearError = (id) => {
    const el = document.getElementById(id);
    if (el) el.textContent = '';
  };

  const validateEmail = email => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  contactForm.addEventListener('submit', e => {
    e.preventDefault();
    let valid = true;
    const name    = document.getElementById('contactName');
    const email   = document.getElementById('contactEmail');
    const message = document.getElementById('contactMessage');

    ['nameError','emailError','messageError'].forEach(clearError);
    [name, email, message].forEach(f => f && f.classList.remove('error'));

    if (!name.value.trim()) {
      document.getElementById('nameError').textContent = 'Please enter your full name.';
      name.classList.add('error');
      valid = false;
    }
    if (!email.value.trim()) {
      document.getElementById('emailError').textContent = 'Please enter your email address.';
      email.classList.add('error');
      valid = false;
    } else if (!validateEmail(email.value.trim())) {
      document.getElementById('emailError').textContent = 'Please enter a valid email address.';
      email.classList.add('error');
      valid = false;
    }
    if (!message.value.trim()) {
      document.getElementById('messageError').textContent = 'Please enter a message.';
      message.classList.add('error');
      valid = false;
    }

    if (!valid) {
      contactForm.querySelector('.error')?.focus();
      return;
    }

    // Simulate submission
    const submitBtn = document.getElementById('contactSubmit');
    submitBtn.disabled = true;
    submitBtn.innerHTML = '<i data-lucide="loader" aria-hidden="true"></i> Sending…';
    if (window.lucide) lucide.createIcons();

    setTimeout(() => {
      contactForm.reset();
      submitBtn.disabled = false;
      submitBtn.innerHTML = '<i data-lucide="send" aria-hidden="true"></i> Send Message';
      if (window.lucide) lucide.createIcons();

      const success = document.getElementById('formSuccess');
      if (success) {
        success.hidden = false;
        success.focus();
        if (window.lucide) lucide.createIcons();
        setTimeout(() => { success.hidden = true; }, 6000);
      }
    }, 1200);
  });

  // Real-time validation clear on input
  contactForm.querySelectorAll('input, textarea').forEach(field => {
    field.addEventListener('input', () => {
      field.classList.remove('error');
      const errorId = field.id.replace('contact', '').toLowerCase() + 'Error';
      const errEl = document.getElementById(errorId.charAt(0).toUpperCase() + errorId.slice(1));
      if (errEl) errEl.textContent = '';
    });
  });
}

/* ----------------------------------------------------------------
   Scroll to top button
---------------------------------------------------------------- */
const scrollTopBtn = document.getElementById('scrollTopBtn');

window.addEventListener('scroll', () => {
  if (scrollTopBtn) scrollTopBtn.hidden = window.scrollY < 400;
}, { passive: true });

scrollTopBtn && scrollTopBtn.addEventListener('click', () => {
  window.scrollTo({ top: 0, behavior: 'smooth' });
});

/* ----------------------------------------------------------------
   Footer year
---------------------------------------------------------------- */
const yearEl = document.getElementById('year');
if (yearEl) yearEl.textContent = new Date().getFullYear();

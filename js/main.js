'use strict';

/* ----------------------------------------------------------------
   Lucide icons
---------------------------------------------------------------- */
document.addEventListener('DOMContentLoaded', () => {
  if (window.lucide) lucide.createIcons();
});

/* ----------------------------------------------------------------
   Preloader
---------------------------------------------------------------- */
const preloader = document.getElementById('preloader');
window.addEventListener('load', () => {
  setTimeout(() => {
    preloader.classList.add('hidden');
    document.body.style.overflow = '';
    if (window.lucide) lucide.createIcons();
  }, 1900);
});
document.body.style.overflow = 'hidden';

/* ----------------------------------------------------------------
   Scroll progress bar
---------------------------------------------------------------- */
const scrollProgress = document.getElementById('scrollProgress');
const updateScrollProgress = () => {
  const scrollTop  = window.scrollY;
  const docHeight  = document.documentElement.scrollHeight - window.innerHeight;
  const pct        = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
  scrollProgress.style.width = pct + '%';

  // Progress ring on scroll-to-top button
  const ring = document.getElementById('progressRing');
  if (ring) {
    const circumference = 2 * Math.PI * 18; // r=18
    const offset = circumference - (pct / 100) * circumference;
    ring.style.strokeDashoffset = offset;
  }
};
window.addEventListener('scroll', updateScrollProgress, { passive: true });

/* ----------------------------------------------------------------
   Navbar scroll state + active section
---------------------------------------------------------------- */
const navbar   = document.getElementById('navbar');
const navLinks = document.getElementById('nav-links');
const hamburger = document.getElementById('hamburger');

window.addEventListener('scroll', () => {
  navbar.classList.toggle('scrolled', window.scrollY > 40);
}, { passive: true });

hamburger.addEventListener('click', () => {
  const open = navLinks.classList.toggle('open');
  hamburger.setAttribute('aria-expanded', String(open));
});
document.addEventListener('click', e => {
  if (!navbar.contains(e.target)) {
    navLinks.classList.remove('open');
    hamburger.setAttribute('aria-expanded', 'false');
  }
});
navLinks.querySelectorAll('.nav-link').forEach(l => l.addEventListener('click', () => {
  navLinks.classList.remove('open');
  hamburger.setAttribute('aria-expanded', 'false');
}));

const sectionIds = ['home','about','programs','impact','stories','support','events','contact'];
const highlightNav = () => {
  let current = 'home';
  sectionIds.forEach(id => {
    const el = document.getElementById(id);
    if (el && window.scrollY >= el.offsetTop - 130) current = id;
  });
  navLinks.querySelectorAll('.nav-link').forEach(l => {
    l.classList.toggle('active', l.getAttribute('href') === `#${current}`);
  });
};
window.addEventListener('scroll', highlightNav, { passive: true });

/* ----------------------------------------------------------------
   Ripple effect on .ripple buttons
---------------------------------------------------------------- */
document.querySelectorAll('.ripple').forEach(btn => {
  btn.addEventListener('click', function (e) {
    const rect   = this.getBoundingClientRect();
    const size   = Math.max(rect.width, rect.height);
    const x      = e.clientX - rect.left - size / 2;
    const y      = e.clientY - rect.top  - size / 2;
    const wave   = document.createElement('span');
    wave.classList.add('ripple-wave');
    wave.style.cssText = `width:${size}px;height:${size}px;left:${x}px;top:${y}px`;
    this.appendChild(wave);
    wave.addEventListener('animationend', () => wave.remove());
  });
});

/* ----------------------------------------------------------------
   Scroll reveal
---------------------------------------------------------------- */
const revealObserver = new IntersectionObserver(
  entries => entries.forEach(({ target, isIntersecting }) => {
    if (isIntersecting) { target.classList.add('visible'); revealObserver.unobserve(target); }
  }),
  { threshold: 0.1, rootMargin: '0px 0px -40px 0px' }
);
document.querySelectorAll('.reveal-up,.reveal-left,.reveal-right').forEach(el => revealObserver.observe(el));

/* ----------------------------------------------------------------
   Animated counters
---------------------------------------------------------------- */
const animateCounter = el => {
  const target   = parseInt(el.dataset.target, 10);
  const duration = 2200;
  const start    = performance.now();
  const step = ts => {
    const p = Math.min((ts - start) / duration, 1);
    const e = 1 - Math.pow(1 - p, 3);
    el.textContent = Math.round(e * target).toLocaleString();
    if (p < 1) requestAnimationFrame(step);
  };
  requestAnimationFrame(step);
};
const counterObserver = new IntersectionObserver(
  entries => entries.forEach(({ target, isIntersecting }) => {
    if (isIntersecting) { animateCounter(target); counterObserver.unobserve(target); }
  }),
  { threshold: 0.5 }
);
document.querySelectorAll('.counter,.stat-num').forEach(el => counterObserver.observe(el));

/* ----------------------------------------------------------------
   Fundraise bar fill animation
---------------------------------------------------------------- */
const fundraiseFill = document.querySelector('.fundraise-fill');
if (fundraiseFill) {
  const fillObserver = new IntersectionObserver(
    ([{ isIntersecting }]) => {
      if (isIntersecting) {
        fundraiseFill.style.width = fundraiseFill.dataset.width + '%';
        fillObserver.disconnect();
      }
    },
    { threshold: 0.5 }
  );
  fillObserver.observe(fundraiseFill);
}

/* ----------------------------------------------------------------
   Inline SVG gradient for progress ring
---------------------------------------------------------------- */
const svgDefs = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
svgDefs.setAttribute('aria-hidden', 'true');
svgDefs.style.cssText = 'position:absolute;width:0;height:0;';
svgDefs.innerHTML = `
  <defs>
    <linearGradient id="ringGrad" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%"   stop-color="#6B21C8"/>
      <stop offset="100%" stop-color="#D91A6B"/>
    </linearGradient>
  </defs>`;
document.body.prepend(svgDefs);

/* ----------------------------------------------------------------
   Stories carousel
---------------------------------------------------------------- */
const track   = document.getElementById('storiesTrack');
const prevBtn = document.getElementById('storyPrev');
const nextBtn = document.getElementById('storyNext');
const dots    = document.querySelectorAll('#carouselDots .dot');

if (track && prevBtn && nextBtn) {
  const cards = track.querySelectorAll('.story-card');
  let current = 0;

  const getVisible = () => window.innerWidth <= 768 ? 1 : window.innerWidth <= 1024 ? 2 : 3;
  const getMax     = () => Math.max(0, cards.length - getVisible());

  const goTo = idx => {
    current = Math.max(0, Math.min(idx, getMax()));
    const visible   = getVisible();
    const cardWidth = track.parentElement.offsetWidth / visible;
    const gap       = parseFloat(getComputedStyle(track).gap) || 24;
    track.style.transform = `translateX(-${current * (cardWidth + gap)}px)`;
    dots.forEach((d, i) => {
      d.classList.toggle('active', i === current);
      d.setAttribute('aria-selected', String(i === current));
    });
  };

  prevBtn.addEventListener('click', () => goTo(current - 1));
  nextBtn.addEventListener('click', () => goTo(current + 1));
  dots.forEach((d, i) => d.addEventListener('click', () => goTo(i)));

  let auto = setInterval(() => goTo(current + 1 > getMax() ? 0 : current + 1), 5000);
  track.parentElement.addEventListener('mouseenter', () => clearInterval(auto));
  track.parentElement.addEventListener('mouseleave', () => {
    auto = setInterval(() => goTo(current + 1 > getMax() ? 0 : current + 1), 5000);
  });

  let tx = 0;
  track.addEventListener('touchstart', e => { tx = e.touches[0].clientX; }, { passive: true });
  track.addEventListener('touchend',   e => {
    const diff = tx - e.changedTouches[0].clientX;
    if (Math.abs(diff) > 50) goTo(diff > 0 ? current + 1 : current - 1);
  });

  window.addEventListener('resize', () => goTo(Math.min(current, getMax())));
}

/* ----------------------------------------------------------------
   Donation amount selector
---------------------------------------------------------------- */
let selectedAmount = '10';
document.querySelectorAll('.amount-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.amount-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    selectedAmount = btn.dataset.amount;
    const wrapper = document.getElementById('customAmountWrapper');
    if (wrapper) {
      wrapper.hidden = selectedAmount !== 'custom';
      if (selectedAmount === 'custom') document.getElementById('customAmount').focus();
    }
  });
});

/* ----------------------------------------------------------------
   Donate modal
---------------------------------------------------------------- */
const donateModal      = document.getElementById('donateModal');
const donateModalClose = document.getElementById('donateModalClose');

window.openDonateModal = () => {
  let amount = selectedAmount;
  if (amount === 'custom') {
    const input = document.getElementById('customAmount');
    amount = input ? input.value : '';
    if (!amount || isNaN(amount) || Number(amount) < 1) { input && input.focus(); return; }
  }
  const display = document.getElementById('modalAmountDisplay');
  if (display) display.textContent = `Your donation: £${Number(amount).toLocaleString()}`;
  donateModal.hidden = false;
  document.body.style.overflow = 'hidden';
  if (window.lucide) lucide.createIcons();
  donateModalClose.focus();
};

const closeDonateModal = () => { donateModal.hidden = true; document.body.style.overflow = ''; };
donateModalClose && donateModalClose.addEventListener('click', closeDonateModal);
donateModal && donateModal.addEventListener('click', e => { if (e.target === donateModal) closeDonateModal(); });
document.addEventListener('keydown', e => { if (e.key === 'Escape' && donateModal && !donateModal.hidden) closeDonateModal(); });

/* ----------------------------------------------------------------
   Contact form
---------------------------------------------------------------- */
const contactForm = document.getElementById('contactForm');
if (contactForm) {
  const validateEmail = e => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e);

  contactForm.addEventListener('submit', e => {
    e.preventDefault();
    let valid = true;
    const name    = document.getElementById('contactName');
    const email   = document.getElementById('contactEmail');
    const message = document.getElementById('contactMessage');

    ['nameError','emailError','messageError'].forEach(id => {
      const el = document.getElementById(id); if (el) el.textContent = '';
    });
    [name, email, message].forEach(f => f && f.classList.remove('error'));

    if (!name.value.trim()) {
      document.getElementById('nameError').textContent = 'Please enter your full name.';
      name.classList.add('error'); valid = false;
    }
    if (!email.value.trim()) {
      document.getElementById('emailError').textContent = 'Please enter your email address.';
      email.classList.add('error'); valid = false;
    } else if (!validateEmail(email.value.trim())) {
      document.getElementById('emailError').textContent = 'Please enter a valid email address.';
      email.classList.add('error'); valid = false;
    }
    if (!message.value.trim()) {
      document.getElementById('messageError').textContent = 'Please enter a message.';
      message.classList.add('error'); valid = false;
    }
    if (!valid) { contactForm.querySelector('.error')?.focus(); return; }

    const submitBtn = document.getElementById('contactSubmit');
    submitBtn.disabled = true;
    submitBtn.innerHTML = '<i data-lucide="loader-2"></i> Sending…';
    if (window.lucide) lucide.createIcons();

    setTimeout(() => {
      contactForm.reset();
      submitBtn.disabled = false;
      submitBtn.innerHTML = '<i data-lucide="send"></i> Send Message';
      if (window.lucide) lucide.createIcons();
      const success = document.getElementById('formSuccess');
      if (success) {
        success.hidden = false;
        if (window.lucide) lucide.createIcons();
        success.focus();
        setTimeout(() => { success.hidden = true; }, 6000);
      }
    }, 1400);
  });

  contactForm.querySelectorAll('input,textarea').forEach(f => {
    f.addEventListener('input', () => {
      f.classList.remove('error');
      const errId = f.id.replace('contact','').toLowerCase() + 'Error';
      const el = document.getElementById(errId.charAt(0).toUpperCase() + errId.slice(1));
      if (el) el.textContent = '';
    });
  });
}

/* ----------------------------------------------------------------
   Newsletter form
---------------------------------------------------------------- */
const newsletterForm = document.getElementById('newsletterForm');
if (newsletterForm) {
  newsletterForm.addEventListener('submit', e => {
    e.preventDefault();
    const input   = document.getElementById('newsletterEmail');
    const success = document.getElementById('newsletterSuccess');
    if (!input.value.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(input.value)) {
      input.focus(); return;
    }
    input.disabled = true;
    setTimeout(() => {
      success.hidden = false;
      input.value    = '';
      input.disabled = false;
      if (window.lucide) lucide.createIcons();
    }, 800);
  });
}

/* ----------------------------------------------------------------
   Scroll to top + mobile sticky bar
---------------------------------------------------------------- */
const scrollTopBtn  = document.getElementById('scrollTopBtn');
const stickyDonate  = document.getElementById('stickyDonate');

window.addEventListener('scroll', () => {
  const show = window.scrollY > 450;
  if (scrollTopBtn) scrollTopBtn.hidden = !show;
  if (stickyDonate) stickyDonate.style.transform = show ? 'translateY(0)' : 'translateY(100%)';
}, { passive: true });

scrollTopBtn && scrollTopBtn.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));

/* ----------------------------------------------------------------
   Footer year
---------------------------------------------------------------- */
const yearEl = document.getElementById('year');
if (yearEl) yearEl.textContent = new Date().getFullYear();

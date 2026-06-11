/* ============================================================
   NGỌC ANH — script.js
   Vanilla JavaScript: Interactions, Animations, Scroll FX
   ============================================================ */

(function () {
  'use strict';

  /* ──────────────────────────────────────
     1. NAVBAR: Scroll & Mobile Toggle
  ────────────────────────────────────── */
  const header    = document.getElementById('header');
  const burger    = document.getElementById('nav-burger');
  const mobileNav = document.getElementById('nav-mobile');
  const mobileLinks = mobileNav ? mobileNav.querySelectorAll('.nav-mobile-link') : [];

  function updateHeader() {
    if (window.scrollY > 60) {
      header.classList.add('scrolled');
    } else {
      header.classList.remove('scrolled');
    }
  }
  window.addEventListener('scroll', updateHeader, { passive: true });
  updateHeader();

  function toggleMobileNav(open) {
    burger.classList.toggle('active', open);
    mobileNav.classList.toggle('open', open);
    burger.setAttribute('aria-expanded', String(open));
    document.body.style.overflow = open ? 'hidden' : '';
  }

  burger && burger.addEventListener('click', () => {
    const isOpen = mobileNav.classList.contains('open');
    toggleMobileNav(!isOpen);
  });

  mobileLinks.forEach(link => {
    link.addEventListener('click', () => toggleMobileNav(false));
  });

  /* Close on outside click */
  document.addEventListener('click', (e) => {
    if (mobileNav.classList.contains('open') &&
        !mobileNav.contains(e.target) &&
        !burger.contains(e.target)) {
      toggleMobileNav(false);
    }
  });

  /* ──────────────────────────────────────
     2. SCROLL REVEAL (Intersection Observer)
  ────────────────────────────────────── */
  const revealEls = document.querySelectorAll('.reveal, .reveal-left, .reveal-right');

  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        revealObserver.unobserve(entry.target);
      }
    });
  }, {
    threshold: 0.12,
    rootMargin: '0px 0px -60px 0px'
  });

  revealEls.forEach(el => revealObserver.observe(el));

  /* ──────────────────────────────────────
     3. COUNTER ANIMATION
  ────────────────────────────────────── */
  const counters = document.querySelectorAll('.counter-num[data-target]');

  function formatNumber(n, format) {
    if (format === 'short') {
      if (n >= 1000000) return (n / 1000000).toFixed(1).replace('.0', '') + 'M';
      if (n >= 1000)    return (n / 1000).toFixed(0) + 'K';
    }
    return n.toLocaleString('vi-VN');
  }

  function animateCounter(el) {
    const target  = parseInt(el.getAttribute('data-target'), 10);
    const suffix  = el.getAttribute('data-suffix') || '';
    const format  = el.getAttribute('data-format') || '';
    const duration = 2200;
    const start   = performance.now();

    function step(now) {
      const elapsed  = now - start;
      const progress = Math.min(elapsed / duration, 1);
      // Ease-out-expo
      const eased = 1 - Math.pow(2, -10 * progress);
      const current = Math.round(eased * target);

      el.textContent = formatNumber(current, format) + suffix;

      if (progress < 1) {
        requestAnimationFrame(step);
      } else {
        el.textContent = formatNumber(target, format) + suffix;
      }
    }
    requestAnimationFrame(step);
  }

  /* Trigger counters when About section enters view */
  const countersStrip = document.querySelector('.counters-strip');
  if (countersStrip) {
    let counted = false;
    const counterObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting && !counted) {
          counted = true;
          counters.forEach(animateCounter);
        }
      });
    }, { threshold: 0.4 });
    counterObserver.observe(countersStrip);
  }

  /* ──────────────────────────────────────
     4. FLEET SLIDER
  ────────────────────────────────────── */
  const slider     = document.getElementById('fleet-slider');
  const prevBtn    = document.getElementById('fleet-prev');
  const nextBtn    = document.getElementById('fleet-next');
  const dotsWrap   = document.getElementById('fleet-dots');
  const fleetCards = slider ? slider.querySelectorAll('.fleet-card') : [];

  let currentSlide = 0;
  let isDragging   = false;
  let startX       = 0;
  let scrollStart  = 0;
  let autoSlideTimer;

  /* Build dots */
  if (fleetCards.length && dotsWrap) {
    fleetCards.forEach((_, i) => {
      const dot = document.createElement('button');
      dot.classList.add('fleet-dot');
      dot.setAttribute('role', 'tab');
      dot.setAttribute('aria-label', `Xe số ${i + 1}`);
      dot.setAttribute('aria-selected', i === 0 ? 'true' : 'false');
      if (i === 0) dot.classList.add('active');
      dot.addEventListener('click', () => goToSlide(i));
      dotsWrap.appendChild(dot);
    });
  }

  function updateDots(idx) {
    const dots = dotsWrap ? dotsWrap.querySelectorAll('.fleet-dot') : [];
    dots.forEach((d, i) => {
      d.classList.toggle('active', i === idx);
      d.setAttribute('aria-selected', i === idx ? 'true' : 'false');
    });
  }

  function goToSlide(idx) {
    if (!slider || !fleetCards.length) return;
    idx = (idx + fleetCards.length) % fleetCards.length;
    currentSlide = idx;
    const card     = fleetCards[idx];
    const cardLeft = card.offsetLeft;
    const sliderW  = slider.offsetWidth;
    const cardW    = card.offsetWidth;
    const scrollTo = cardLeft - (sliderW - cardW) / 2;
    slider.scrollTo({ left: Math.max(0, scrollTo), behavior: 'smooth' });
    updateDots(idx);
  }

  prevBtn && prevBtn.addEventListener('click', () => {
    resetAutoSlide();
    goToSlide(currentSlide - 1);
  });
  nextBtn && nextBtn.addEventListener('click', () => {
    resetAutoSlide();
    goToSlide(currentSlide + 1);
  });

  /* Auto-slide */
  function startAutoSlide() {
    autoSlideTimer = setInterval(() => {
      goToSlide(currentSlide + 1);
    }, 4500);
  }
  function resetAutoSlide() {
    clearInterval(autoSlideTimer);
    startAutoSlide();
  }
  if (slider) startAutoSlide();

  /* Drag to scroll */
  if (slider) {
    slider.addEventListener('mousedown', (e) => {
      isDragging  = true;
      startX      = e.pageX;
      scrollStart = slider.scrollLeft;
      slider.style.cursor = 'grabbing';
    });
    slider.addEventListener('mousemove', (e) => {
      if (!isDragging) return;
      const dx = e.pageX - startX;
      slider.scrollLeft = scrollStart - dx;
    });
    slider.addEventListener('mouseup',    endDrag);
    slider.addEventListener('mouseleave', endDrag);
    function endDrag() {
      isDragging = false;
      slider.style.cursor = 'grab';
    }

    /* Track which card is centered on scroll */
    slider.addEventListener('scroll', () => {
      const center = slider.scrollLeft + slider.offsetWidth / 2;
      let closest  = 0;
      let minDist  = Infinity;
      fleetCards.forEach((card, i) => {
        const cardCenter = card.offsetLeft + card.offsetWidth / 2;
        const dist = Math.abs(center - cardCenter);
        if (dist < minDist) { minDist = dist; closest = i; }
      });
      if (closest !== currentSlide) {
        currentSlide = closest;
        updateDots(closest);
      }
    }, { passive: true });
  }

  /* ──────────────────────────────────────
     5. SMOOTH ANCHOR SCROLLING
  ────────────────────────────────────── */
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
      const target = document.querySelector(this.getAttribute('href'));
      if (target) {
        e.preventDefault();
        const offset     = header ? header.offsetHeight + 16 : 80;
        const targetTop  = target.getBoundingClientRect().top + window.scrollY - offset;
        window.scrollTo({ top: Math.max(0, targetTop), behavior: 'smooth' });
      }
    });
  });

  /* ──────────────────────────────────────
     6. BACK TO TOP BUTTON
  ────────────────────────────────────── */
  const backToTop = document.getElementById('back-to-top');

  function updateBackToTop() {
    if (!backToTop) return;
    backToTop.classList.toggle('visible', window.scrollY > 500);
  }
  window.addEventListener('scroll', updateBackToTop, { passive: true });
  updateBackToTop();

  backToTop && backToTop.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });

  /* ──────────────────────────────────────
     7. CONTACT FORM VALIDATION & SUBMIT
  ────────────────────────────────────── */
  const form       = document.getElementById('contact-form');
  const submitBtn  = document.getElementById('form-submit-btn');

  function showToast(message, type = 'success') {
    const old = document.getElementById('toast-notification');
    if (old) old.remove();

    const toast = document.createElement('div');
    toast.id = 'toast-notification';
    toast.setAttribute('role', 'alert');
    toast.setAttribute('aria-live', 'polite');
    Object.assign(toast.style, {
      position: 'fixed',
      bottom: '2rem',
      left: '50%',
      transform: 'translateX(-50%) translateY(20px)',
      background: type === 'success'
        ? 'linear-gradient(135deg, #C9A84C, #E2C97E)'
        : 'linear-gradient(135deg, #c0392b, #e74c3c)',
      color: type === 'success' ? '#1A1A1A' : '#fff',
      padding: '1rem 2rem',
      borderRadius: '8px',
      fontWeight: '600',
      fontSize: '0.9rem',
      zIndex: '9999',
      boxShadow: '0 8px 30px rgba(0,0,0,0.4)',
      transition: 'opacity 0.4s ease, transform 0.4s ease',
      opacity: '0',
      maxWidth: '90vw',
      textAlign: 'center',
    });
    toast.textContent = message;
    document.body.appendChild(toast);

    requestAnimationFrame(() => {
      toast.style.opacity = '1';
      toast.style.transform = 'translateX(-50%) translateY(0)';
    });

    setTimeout(() => {
      toast.style.opacity  = '0';
      toast.style.transform = 'translateX(-50%) translateY(20px)';
      setTimeout(() => toast.remove(), 400);
    }, 4000);
  }

  function validateField(input) {
    const val = input.value.trim();
    if (input.required && !val) return false;
    if (input.type === 'tel' && val && !/^[0-9\s\.\-\+]{9,15}$/.test(val)) return false;
    if (input.type === 'email' && val && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val)) return false;
    return true;
  }

  /* Live inline feedback */
  if (form) {
    form.querySelectorAll('.form-input, .form-textarea').forEach(input => {
      input.addEventListener('blur', () => {
        const valid = validateField(input);
        input.style.borderColor = !valid
          ? 'rgba(192,57,43,0.7)'
          : 'rgba(201,168,76,0.35)';
      });
      input.addEventListener('input', () => {
        input.style.borderColor = '';
      });
    });

    form.addEventListener('submit', (e) => {
      e.preventDefault();

      const nameEl  = document.getElementById('f-name');
      const phoneEl = document.getElementById('f-phone');
      let hasError  = false;

      [nameEl, phoneEl].forEach(el => {
        if (!validateField(el)) {
          el.style.borderColor = 'rgba(192,57,43,0.7)';
          el.focus();
          hasError = true;
        }
      });

      if (hasError) {
        showToast('⚠️ Vui lòng điền đầy đủ họ tên và số điện thoại.', 'error');
        return;
      }

      /* Simulate submission */
      submitBtn.textContent  = 'Đang Gửi…';
      submitBtn.disabled     = true;
      submitBtn.style.opacity = '0.7';

      setTimeout(() => {
        form.reset();
        submitBtn.textContent   = 'Gửi Yêu Cầu Báo Giá Ngay →';
        submitBtn.disabled      = false;
        submitBtn.style.opacity = '1';
        showToast('✅ Yêu cầu đã gửi thành công! Chúng tôi sẽ liên hệ trong vòng 30 phút.', 'success');
      }, 1800);
    });
  }

  /* ──────────────────────────────────────
     8. ACTIVE NAV LINK HIGHLIGHT (Scroll Spy)
  ────────────────────────────────────── */
  const sections    = document.querySelectorAll('section[id]');
  const navAnchors  = document.querySelectorAll('.nav-links a[href^="#"]');

  const spyObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const id = entry.target.getAttribute('id');
        navAnchors.forEach(a => {
          const isActive = a.getAttribute('href') === `#${id}`;
          a.style.color = isActive ? 'var(--gold)' : '';
        });
      }
    });
  }, {
    threshold: 0.35,
    rootMargin: '-80px 0px -40% 0px'
  });

  sections.forEach(s => spyObserver.observe(s));

  /* ──────────────────────────────────────
     9. HERO PARALLAX (subtle)
  ────────────────────────────────────── */
  const heroBgImg = document.querySelector('.hero-bg img');
  if (heroBgImg && window.matchMedia('(min-width: 768px)').matches) {
    window.addEventListener('scroll', () => {
      const scrolled = window.scrollY;
      if (scrolled < window.innerHeight) {
        heroBgImg.style.transform = `scale(1.06) translateY(${scrolled * 0.25}px)`;
      }
    }, { passive: true });
  }

  /* ──────────────────────────────────────
     10. BUSINESS REGISTRY TABS
  ────────────────────────────────────── */
  const registryTabBtns = document.querySelectorAll('.registry-tab-btn');
  const registryPanels  = document.querySelectorAll('.registry-panel');

  registryTabBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      // Deactivate all buttons
      registryTabBtns.forEach(b => {
        b.classList.remove('active');
        b.setAttribute('aria-selected', 'false');
      });
      // Activate clicked button
      btn.classList.add('active');
      btn.setAttribute('aria-selected', 'true');

      // Hide all panels
      registryPanels.forEach(p => {
        p.style.display = 'none';
      });

      // Show targeted panel
      const targetId = btn.getAttribute('aria-controls');
      const targetPanel = document.getElementById(targetId);
      if (targetPanel) {
        targetPanel.style.display = 'block';
      }
    });
  });

})();

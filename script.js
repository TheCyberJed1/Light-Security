/* Light Security — script.js
   Handles: nav scroll state, mobile menu, smooth-scroll, form validation,
   footer year, and IntersectionObserver fade-in animations
*/

(function () {
  'use strict';

  /* ---------------------------------------------------------------
     1. Dynamic footer year
  --------------------------------------------------------------- */
  const yearEl = document.getElementById('footer-year');
  if (yearEl) {
    yearEl.textContent = new Date().getFullYear();
  }

  /* ---------------------------------------------------------------
     2. Sticky nav — add "scrolled" class after scrolling
  --------------------------------------------------------------- */
  const navHeader = document.getElementById('nav-header');

  var scrollTicking = false;

  function updateNavOnScroll() {
    if (!navHeader) return;
    if (window.scrollY > 20) {
      navHeader.classList.add('scrolled');
    } else {
      navHeader.classList.remove('scrolled');
    }
    scrollTicking = false;
  }

  window.addEventListener('scroll', function () {
    if (!scrollTicking) {
      window.requestAnimationFrame(updateNavOnScroll);
      scrollTicking = true;
    }
  }, { passive: true });
  updateNavOnScroll(); // run once on load

  /* ---------------------------------------------------------------
     3. Mobile hamburger menu
  --------------------------------------------------------------- */
  const hamburger  = document.getElementById('hamburger');
  const mobileMenu = document.getElementById('mobile-menu');

  function toggleMobileMenu(open) {
    if (!hamburger || !mobileMenu) return;
    hamburger.setAttribute('aria-expanded', open ? 'true' : 'false');
    mobileMenu.setAttribute('aria-hidden', open ? 'false' : 'true');
    mobileMenu.classList.toggle('open', open);
  }

  if (hamburger) {
    hamburger.addEventListener('click', () => {
      const isOpen = mobileMenu.classList.contains('open');
      toggleMobileMenu(!isOpen);
    });
  }

  // Close mobile menu when a link is clicked
  if (mobileMenu) {
    mobileMenu.querySelectorAll('a').forEach(function (link) {
      link.addEventListener('click', function () {
        toggleMobileMenu(false);
      });
    });
  }

  // Close mobile menu on Escape key
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && mobileMenu && mobileMenu.classList.contains('open')) {
      toggleMobileMenu(false);
      if (hamburger) hamburger.focus();
    }
  });

  /* ---------------------------------------------------------------
     4. Smooth scroll for anchor links (fallback for older browsers)
  --------------------------------------------------------------- */
  document.querySelectorAll('a[href^="#"]').forEach(function (anchor) {
    anchor.addEventListener('click', function (e) {
      const targetId = this.getAttribute('href').slice(1);
      if (!targetId) return;

      const target = document.getElementById(targetId);
      if (!target) return;

      e.preventDefault();
      const navHeight = navHeader ? navHeader.offsetHeight : 70;
      const offsetTop = target.getBoundingClientRect().top + window.scrollY - navHeight - 8;

      window.scrollTo({ top: offsetTop, behavior: 'smooth' });
    });
  });

  /* ---------------------------------------------------------------
     5. Scroll-driven fade-in animations (IntersectionObserver)
  --------------------------------------------------------------- */
  const animatableSelectors = [
    '.service-card',
    '.process-step',
    '.diff-item',
    '.stat-card',
    '.problem-stat-card',
    '.problem-content',
    '.section-header',
    '.cta-content',
    '.cta-form-card',
    '.about-content',
    '.about-stats',
    '.compliance-inner',
  ];

  function addFadeInClasses() {
    animatableSelectors.forEach(function (selector) {
      document.querySelectorAll(selector).forEach(function (el) {
        el.classList.add('fade-in');
      });
    });
  }

  function initObserver() {
    if (!('IntersectionObserver' in window)) {
      // Fallback: show everything immediately
      document.querySelectorAll('.fade-in').forEach(function (el) {
        el.classList.add('visible');
      });
      return;
    }

    const observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible');
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: '0px 0px -40px 0px' }
    );

    document.querySelectorAll('.fade-in').forEach(function (el) {
      observer.observe(el);
    });
  }

  addFadeInClasses();
  // Run after a tick so CSS class additions don't block first paint
  requestAnimationFrame(initObserver);

  /* ---------------------------------------------------------------
     6. Contact form — client-side validation & submission UX
  --------------------------------------------------------------- */
  const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  const form        = document.getElementById('contact-form');
  const submitBtn   = form ? form.querySelector('button[type="submit"]') : null;
  const submitText  = document.getElementById('submit-text');
  const spinner     = document.getElementById('submit-spinner');
  const successMsg  = document.getElementById('form-success');

  function showError(fieldId, message) {
    const field = document.getElementById(fieldId);
    const error = document.getElementById(fieldId + '-error');
    if (field)  field.classList.add('error');
    if (error)  error.textContent = message;
  }

  function clearError(fieldId) {
    const field = document.getElementById(fieldId);
    const error = document.getElementById(fieldId + '-error');
    if (field)  field.classList.remove('error');
    if (error)  error.textContent = '';
  }

  function validateForm() {
    let valid = true;

    // Name
    const name = document.getElementById('name');
    clearError('name');
    if (!name || name.value.trim().length < 2) {
      showError('name', 'Please enter your full name.');
      valid = false;
    }

    // Email
    const email = document.getElementById('email');
    clearError('email');
    if (!email || !EMAIL_REGEX.test(email.value.trim())) {
      showError('email', 'Please enter a valid work email address.');
      valid = false;
    }

    // Company
    const company = document.getElementById('company');
    clearError('company');
    if (!company || company.value.trim().length < 2) {
      showError('company', 'Please enter your company or practice name.');
      valid = false;
    }

    // Industry
    const industry = document.getElementById('industry');
    clearError('industry');
    if (!industry || industry.value === '') {
      showError('industry', 'Please select your industry.');
      valid = false;
    }

    return valid;
  }

  // Live validation — clear errors as user types/selects
  ['name', 'email', 'company', 'industry'].forEach(function (fieldId) {
    const field = document.getElementById(fieldId);
    if (!field) return;
    field.addEventListener('input', function () { clearError(fieldId); });
    field.addEventListener('change', function () { clearError(fieldId); });
  });

  function sendContactEmail() {
    var nameEl = document.getElementById('name');
    var emailEl = document.getElementById('email');
    var companyEl = document.getElementById('company');
    var industryEl = document.getElementById('industry');
    var messageEl = document.getElementById('message');
    var requiredFieldsPresent = nameEl && emailEl && companyEl && industryEl;

    if (!requiredFieldsPresent) {
      return false;
    }

    var industryText = '';
    if (industryEl && industryEl.selectedIndex >= 0 && industryEl.options[industryEl.selectedIndex]) {
      industryText = industryEl.options[industryEl.selectedIndex].text;
    }

    var subject = encodeURIComponent('New Consultation Request - Light Security');
    var body = encodeURIComponent([
      'Name: ' + nameEl.value.trim(),
      'Work Email: ' + emailEl.value.trim(),
      'Company: ' + companyEl.value.trim(),
      'Industry: ' + industryText,
      '',
      'Biggest Security Concern:',
      messageEl && messageEl.value ? messageEl.value.trim() : 'N/A'
    ].join('\n'));

    window.location.href = 'mailto:light.security1@gmail.com?subject=' + subject + '&body=' + body;
    return true;
  }

  if (form) {
    form.addEventListener('submit', function (e) {
      e.preventDefault();

      if (!validateForm()) return;

      // Show loading state
      if (submitBtn)  submitBtn.disabled = true;
      if (submitText) submitText.textContent = 'Sending…';
      if (spinner)    spinner.classList.remove('hidden');
      var errorBanner = document.getElementById('form-submit-error');
      if (errorBanner) errorBanner.classList.add('hidden');

      var emailDraftOpened = sendContactEmail();

      if (!emailDraftOpened) {
        if (errorBanner) errorBanner.classList.remove('hidden');
        if (submitBtn)  submitBtn.disabled = false;
        if (submitText) submitText.textContent = 'Schedule My Free Strategy Call';
        if (spinner)    spinner.classList.add('hidden');
        return;
      }

      // Show confirmation that email compose was opened
      if (successMsg) {
        successMsg.classList.remove('hidden');
        successMsg.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }

      if (submitBtn)  submitBtn.disabled = false;
      if (submitText) submitText.textContent = 'Schedule My Free Strategy Call';
      if (spinner)    spinner.classList.add('hidden');
    });
  }

})();

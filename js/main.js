/* ============================================
   PureFlow — Main JavaScript
   Mobile nav, smooth scroll, FAQ accordion,
   form validation, scroll animations
   ============================================ */

document.addEventListener('DOMContentLoaded', function () {

  /* ----------------------------------------
     MOBILE NAV
     ---------------------------------------- */
  const hamburger = document.querySelector('.hamburger');
  const drawer = document.querySelector('.mobile-drawer');
  const overlay = document.querySelector('.mobile-overlay');

  function openDrawer() {
    hamburger.classList.add('active');
    drawer.classList.add('open');
    overlay.classList.add('open');
    document.body.style.overflow = 'hidden';
  }

  function closeDrawer() {
    hamburger.classList.remove('active');
    drawer.classList.remove('open');
    overlay.classList.remove('open');
    document.body.style.overflow = '';
  }

  if (hamburger) {
    hamburger.addEventListener('click', function () {
      if (drawer.classList.contains('open')) {
        closeDrawer();
      } else {
        openDrawer();
      }
    });
  }

  if (overlay) {
    overlay.addEventListener('click', closeDrawer);
  }

  // Close drawer on link click
  if (drawer) {
    drawer.querySelectorAll('a').forEach(function (link) {
      link.addEventListener('click', closeDrawer);
    });
  }

  /* ----------------------------------------
     SMOOTH SCROLL
     ---------------------------------------- */
  document.querySelectorAll('a[href^="#"]').forEach(function (anchor) {
    anchor.addEventListener('click', function (e) {
      var targetId = this.getAttribute('href');
      if (targetId === '#') return;
      var target = document.querySelector(targetId);
      if (target) {
        e.preventDefault();
        var headerHeight = document.querySelector('.site-header')
          ? document.querySelector('.site-header').offsetHeight
          : 0;
        var top = target.getBoundingClientRect().top + window.pageYOffset - headerHeight - 16;
        window.scrollTo({ top: top, behavior: 'smooth' });
      }
    });
  });

  /* ----------------------------------------
     FAQ ACCORDION
     ---------------------------------------- */
  document.querySelectorAll('.faq-question').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var item = this.closest('.faq-item');
      var answer = item.querySelector('.faq-answer');
      var isActive = item.classList.contains('active');

      // Close all
      document.querySelectorAll('.faq-item').forEach(function (faq) {
        faq.classList.remove('active');
        faq.querySelector('.faq-answer').style.maxHeight = null;
      });

      // Open clicked (if it wasn't already open)
      if (!isActive) {
        item.classList.add('active');
        answer.style.maxHeight = answer.scrollHeight + 'px';
      }
    });
  });

  /* ----------------------------------------
     FORM VALIDATION
     ---------------------------------------- */
  var contactForm = document.getElementById('contact-form');
  if (contactForm) {
    contactForm.addEventListener('submit', function (e) {
      e.preventDefault();
      var valid = true;

      // Clear previous errors
      contactForm.querySelectorAll('.form-group').forEach(function (group) {
        group.classList.remove('error');
      });

      // Required fields
      var requiredFields = contactForm.querySelectorAll('[required]');
      requiredFields.forEach(function (field) {
        var group = field.closest('.form-group');
        if (!field.value.trim()) {
          group.classList.add('error');
          valid = false;
        }
      });

      // Email validation
      var emailField = contactForm.querySelector('input[type="email"]');
      if (emailField && emailField.value.trim()) {
        var emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(emailField.value.trim())) {
          emailField.closest('.form-group').classList.add('error');
          valid = false;
        }
      }

      // Phone validation
      var phoneField = contactForm.querySelector('input[type="tel"]');
      if (phoneField && phoneField.value.trim()) {
        var phoneClean = phoneField.value.replace(/[\s\-\(\)\.]/g, '');
        if (phoneClean.length < 10 || !/^\+?\d+$/.test(phoneClean)) {
          phoneField.closest('.form-group').classList.add('error');
          valid = false;
        }
      }

      if (valid) {
        // In production, submit to a backend endpoint
        var successMsg = document.getElementById('form-success');
        if (successMsg) {
          successMsg.style.display = 'block';
          contactForm.reset();
          setTimeout(function () {
            successMsg.style.display = 'none';
          }, 5000);
        }
      }
    });
  }

  // Email capture form
  var emailCaptureForm = document.getElementById('email-capture-form');
  if (emailCaptureForm) {
    emailCaptureForm.addEventListener('submit', function (e) {
      e.preventDefault();
      var emailInput = emailCaptureForm.querySelector('input[type="email"]');
      if (emailInput && emailInput.value.trim()) {
        var emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (emailRegex.test(emailInput.value.trim())) {
          // In production, submit to a backend endpoint
          emailInput.value = '';
          var msg = emailCaptureForm.querySelector('.capture-success');
          if (msg) {
            msg.style.display = 'block';
            setTimeout(function () {
              msg.style.display = 'none';
            }, 4000);
          }
        }
      }
    });
  }

  /* ----------------------------------------
     SCROLL ANIMATIONS
     ---------------------------------------- */
  var fadeElements = document.querySelectorAll('.fade-in');

  function checkFade() {
    var triggerBottom = window.innerHeight * 0.88;
    fadeElements.forEach(function (el) {
      var box = el.getBoundingClientRect();
      if (box.top < triggerBottom) {
        el.classList.add('visible');
      }
    });
  }

  if (fadeElements.length > 0) {
    checkFade();
    window.addEventListener('scroll', checkFade, { passive: true });
    window.addEventListener('resize', checkFade, { passive: true });
  }

  /* ----------------------------------------
     ACTIVE NAV HIGHLIGHT
     ---------------------------------------- */
  var currentPage = window.location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.nav-links a, .mobile-drawer a').forEach(function (link) {
    var href = link.getAttribute('href');
    if (href === currentPage || (currentPage === '' && href === 'index.html')) {
      link.classList.add('active');
    }
  });

});

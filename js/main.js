/* ============================================
   PureFlow — Main JavaScript
   Mobile nav, smooth scroll, FAQ accordion,
   form validation, scroll animations
   ============================================ */

const LEAD_ENDPOINT = 'https://pureflow-leads.ben-8b5.workers.dev/submit';

function showLeadStatus(element, success, message) {
  if (!element) return;

  element.replaceChildren(document.createTextNode(message));
  element.style.color = success ? '#059669' : '#B42318';

  if (!success) {
    element.appendChild(document.createTextNode(' You can also '));
    var emailLink = document.createElement('a');
    emailLink.href = 'mailto:nick@pureflowut.com';
    emailLink.textContent = 'email nick@pureflowut.com';
    element.appendChild(emailLink);
    element.appendChild(document.createTextNode('.'));
  }

  element.style.display = 'block';
}

async function submitLead(payload) {
  var response = await fetch(LEAD_ENDPOINT, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });
  var result = await response.json().catch(function () { return null; });

  if (!response.ok || !result || result.ok !== true) {
    throw new Error('Lead submission was not confirmed.');
  }

  return result;
}

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
    contactForm.addEventListener('submit', async function (e) {
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

      if (!valid) return;

      var successMsg = document.getElementById('form-success');
      var submitButton = contactForm.querySelector('button[type="submit"]');
      var originalButtonText = submitButton ? submitButton.textContent : '';
      var serviceField = contactForm.querySelector('[name="service"]');
      var productField = contactForm.querySelector('[name="product"]');
      var messageField = contactForm.querySelector('[name="message"]');
      var messageParts = [];

      if (serviceField && serviceField.value) messageParts.push('Interest: ' + serviceField.value);
      if (productField && productField.value.trim()) messageParts.push('Model: ' + productField.value.trim());
      if (messageField && messageField.value.trim()) messageParts.push(messageField.value.trim());

      if (successMsg) successMsg.style.display = 'none';
      if (submitButton) {
        submitButton.disabled = true;
        submitButton.textContent = 'Sending...';
      }

      try {
        await submitLead({
          form: 'contact',
          name: contactForm.querySelector('[name="name"]').value.trim(),
          email: emailField.value.trim(),
          phone: phoneField.value.trim(),
          company: contactForm.querySelector('[name="company"]').value.trim(),
          message: messageParts.join('\n'),
          page: window.location.href
        });
        showLeadStatus(successMsg, true, "Thank you! We'll be in touch within one business day.");
        contactForm.reset();
      } catch (error) {
        showLeadStatus(successMsg, false, 'We could not send your request. Please try again.');
      } finally {
        if (submitButton) {
          submitButton.disabled = false;
          submitButton.textContent = originalButtonText;
        }
      }
    });
  }

  // Email capture form
  var emailCaptureForm = document.getElementById('email-capture-form');
  if (emailCaptureForm) {
    emailCaptureForm.addEventListener('submit', async function (e) {
      e.preventDefault();
      var emailInput = emailCaptureForm.querySelector('input[type="email"]');
      if (emailInput && emailInput.value.trim()) {
        var emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(emailInput.value.trim())) return;

        var msg = emailCaptureForm.parentElement.querySelector('.capture-success');
        var submitButton = emailCaptureForm.querySelector('button[type="submit"]');
        var originalButtonText = submitButton ? submitButton.textContent : '';

        if (msg) msg.style.display = 'none';
        if (submitButton) {
          submitButton.disabled = true;
          submitButton.textContent = 'Sending...';
        }

        try {
          await submitLead({
            form: 'ebook',
            email: emailInput.value.trim(),
            page: window.location.href
          });
          showLeadStatus(msg, true, 'Thanks! We received your request and will follow up shortly.');
          emailCaptureForm.reset();
        } catch (error) {
          showLeadStatus(msg, false, 'We could not send your request. Please try again.');
        } finally {
          if (submitButton) {
            submitButton.disabled = false;
            submitButton.textContent = originalButtonText;
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

  /* ----------------------------------------
     CONTACT FORM PREFILL FROM ?product=
     Lets "Request Free Trial" buttons carry the
     chosen cooler into the contact form.
     ---------------------------------------- */
  (function () {
    var params = new URLSearchParams(window.location.search);
    var product = params.get('product');
    if (!product) return;

    var serviceField = document.getElementById('contact-service');
    var productField = document.getElementById('contact-product');
    var messageField = document.getElementById('contact-message');

    if (product === 'free-trial') {
      if (serviceField) serviceField.value = 'free-trial';
      if (messageField && !messageField.value) {
        messageField.value = "I'd like to set up a free trial for my business.";
      }
    } else {
      // A specific model was requested.
      if (productField) productField.value = product.replace(/-/g, ' ');
      if (serviceField) serviceField.value = 'free-trial';
      if (messageField && !messageField.value) {
        messageField.value = "I'm interested in a free trial of the " + product.replace(/-/g, ' ') + ".";
      }
    }
  })();

});

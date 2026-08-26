/* =========================================================
   Haulo Junk Removal — interactions
   Vanilla JS, no dependencies, no external calls.
   ========================================================= */
(function () {
  'use strict';

  var PHONE = '+14802994648';

  /* ---------------------------------------------------
     Mobile navigation
     --------------------------------------------------- */
  var burger = document.getElementById('burger');
  var nav = document.getElementById('nav');

  function closeNav() {
    if (!nav || !burger) return;
    nav.classList.remove('is-open');
    burger.setAttribute('aria-expanded', 'false');
    burger.setAttribute('aria-label', 'Open menu');
    document.body.classList.remove('is-locked');
  }

  function toggleNav() {
    if (!nav || !burger) return;
    var open = nav.classList.toggle('is-open');
    burger.setAttribute('aria-expanded', open ? 'true' : 'false');
    burger.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
    document.body.classList.toggle('is-locked', open);
  }

  if (burger) burger.addEventListener('click', toggleNav);

  if (nav) {
    nav.addEventListener('click', function (e) {
      var link = e.target.closest('a');
      if (link) closeNav();
    });
  }

  window.addEventListener('resize', function () {
    if (window.innerWidth > 1040) closeNav();
  });

  /* ---------------------------------------------------
     Sticky header shadow
     --------------------------------------------------- */
  var header = document.getElementById('header');
  function onScroll() {
    if (!header) return;
    header.classList.toggle('is-stuck', window.scrollY > 12);
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* ---------------------------------------------------
     Scroll reveal
     --------------------------------------------------- */
  var revealables = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window && revealables.length) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('is-in');
        io.unobserve(entry.target);
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });

    Array.prototype.forEach.call(revealables, function (el, i) {
      el.style.transitionDelay = (i % 6) * 55 + 'ms';
      io.observe(el);
    });
  } else {
    Array.prototype.forEach.call(revealables, function (el) {
      el.classList.add('is-in');
    });
  }

  /* ---------------------------------------------------
     Active nav link on scroll (scroll spy)
     --------------------------------------------------- */
  var navLinks = document.querySelectorAll('.nav__list a[href^="#"]');
  var sections = [];
  Array.prototype.forEach.call(navLinks, function (link) {
    var id = link.getAttribute('href').slice(1);
    var section = document.getElementById(id);
    if (section) sections.push({ link: link, section: section });
  });

  if (sections.length && 'IntersectionObserver' in window) {
    var spy = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        sections.forEach(function (s) {
          s.link.classList.toggle('is-active', s.section === entry.target);
        });
      });
    }, { rootMargin: '-45% 0px -50% 0px', threshold: 0 });

    sections.forEach(function (s) { spy.observe(s.section); });
  }

  /* ---------------------------------------------------
     Quote form -> pre-filled SMS (no backend, no API)
     --------------------------------------------------- */
  var form = document.getElementById('quoteForm');
  var note = document.getElementById('quoteNote');
  var defaultNote = note ? note.innerHTML : '';

  function setNote(msg, state) {
    if (!note) return;
    note.innerHTML = msg;
    note.classList.remove('is-ok', 'is-err');
    if (state) note.classList.add(state);
  }

  function markInvalid(field, invalid) {
    if (!field) return;
    if (invalid) field.setAttribute('aria-invalid', 'true');
    else field.removeAttribute('aria-invalid');
  }

  if (form) {
    var name = document.getElementById('qName');
    var zip = document.getElementById('qZip');
    var items = document.getElementById('qItems');

    [name, zip, items].forEach(function (f) {
      if (!f) return;
      f.addEventListener('input', function () { markInvalid(f, false); });
    });

    form.addEventListener('submit', function (e) {
      e.preventDefault();

      var nameVal = (name.value || '').trim();
      var zipVal = (zip.value || '').trim();
      var itemsVal = (items.value || '').trim();

      var bad = null;
      markInvalid(name, false); markInvalid(zip, false); markInvalid(items, false);

      if (!nameVal) { markInvalid(name, true); bad = bad || name; }
      if (!/^\d{5}$/.test(zipVal)) { markInvalid(zip, true); bad = bad || zip; }
      if (!itemsVal) { markInvalid(items, true); bad = bad || items; }

      if (bad) {
        setNote('Please add your name, a 5-digit ZIP, and what needs to go.', 'is-err');
        bad.focus();
        return;
      }

      var body = 'Hi Haulo, I have some items to haul away. Name: ' + nameVal +
                 '. ZIP: ' + zipVal + '. Items: ' + itemsVal + '.';

      setNote('Opening your text app — send it and we’ll reply with a price.', 'is-ok');
      window.location.href = 'sms:' + PHONE + '?&body=' + encodeURIComponent(body);

      window.setTimeout(function () {
        setNote('Prefer to talk? Call <a href="tel:' + PHONE + '">480-299-4648</a> for same-day availability.');
      }, 6000);
    });

    form.addEventListener('reset', function () {
      setNote(defaultNote);
    });
  }

  /* ---------------------------------------------------
     Estimate modal — shows once per session, on intent
     --------------------------------------------------- */
  var modal = document.getElementById('modal');
  var lastFocused = null;
  var STORAGE_KEY = 'haulo:modal-seen';

  function modalSeen() {
    try { return window.sessionStorage.getItem(STORAGE_KEY) === '1'; }
    catch (err) { return false; }
  }

  function rememberModal() {
    try { window.sessionStorage.setItem(STORAGE_KEY, '1'); }
    catch (err) { /* storage unavailable — fail quietly */ }
  }

  function openModal() {
    if (!modal || modalSeen()) return;
    lastFocused = document.activeElement;
    modal.hidden = false;
    document.body.classList.add('is-locked');
    rememberModal();
    var close = document.getElementById('modalClose');
    if (close) close.focus();
  }

  function closeModal() {
    if (!modal || modal.hidden) return;
    modal.hidden = true;
    document.body.classList.remove('is-locked');
    if (lastFocused && lastFocused.focus) lastFocused.focus();
  }

  if (modal) {
    modal.addEventListener('click', function (e) {
      if (e.target.closest('[data-close]')) closeModal();
    });

    // Keep focus inside the dialog while it is open.
    modal.addEventListener('keydown', function (e) {
      if (e.key !== 'Tab') return;
      var focusables = modal.querySelectorAll('a[href], button:not([disabled])');
      if (!focusables.length) return;
      var first = focusables[0];
      var last = focusables[focusables.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault(); last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault(); first.focus();
      }
    });

    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') { closeModal(); closeNav(); }
    });

    // Trigger: scrolled well into the page, or exit intent on desktop.
    var triggered = false;
    function trigger() {
      if (triggered || modalSeen()) return;
      triggered = true;
      openModal();
    }

    window.addEventListener('scroll', function () {
      var doc = document.documentElement;
      var max = doc.scrollHeight - window.innerHeight;
      if (max > 0 && window.scrollY / max > 0.45) trigger();
    }, { passive: true });

    document.addEventListener('mouseout', function (e) {
      if (!e.relatedTarget && e.clientY <= 0) trigger();
    });
  }

  /* ---------------------------------------------------
     Footer year (keeps copyright accurate over time)
     --------------------------------------------------- */
  var yearHost = document.querySelector('.footer__bottom p');
  if (yearHost) {
    var year = new Date().getFullYear();
    if (year > 2026) {
      yearHost.textContent = '© ' + year + ' Haulo Junk Removal · Clear, upfront service in Arizona';
    }
  }
})();

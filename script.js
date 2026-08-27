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
     Assistant widget icons

     The voice and chat launchers are injected by a
     third-party loader that hard-codes its own glyphs and
     exposes no icon option, so we replace the SVG in place
     once each bubble mounts. Only the glyph changes — the
     button, its listeners, and the panel are untouched.
     --------------------------------------------------- */
  var WIDGET_ICONS = {
    // Telephone handset — matches the "call us" language used site-wide.
    voice: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' +
           '<path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6A19.79 19.79 0 0 1 2.12 4.18 2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.13.96.36 1.9.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.9.34 1.85.57 2.81.7A2 2 0 0 1 22 16.92Z"/></svg>',
    // Stacked speech bubbles — a conversation, not a single message.
    chatbot: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' +
             '<path d="M14 9a2 2 0 0 1-2 2H6l-4 4V4a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2Z"/>' +
             '<path d="M18 9h2a2 2 0 0 1 2 2v11l-4-4h-6a2 2 0 0 1-2-2v-1"/></svg>'
  };

  function widgetKind(bubble) {
    var label = (bubble.getAttribute('aria-label') || '').toLowerCase();
    if (/talk|voice|speak/.test(label)) return 'voice';
    if (/chat|message/.test(label)) return 'chatbot';
    // Labels are configurable on the embed tag, so fall back to the
    // shape of the glyph the loader shipped.
    var path = bubble.querySelector('svg path');
    var d = path ? (path.getAttribute('d') || '') : '';
    if (d.indexOf('M12 2a3') === 0) return 'voice';
    if (d.indexOf('M21 15a2') === 0) return 'chatbot';
    return null;
  }

  function paintWidgetIcon(bubble) {
    if (bubble.hasAttribute('data-haulo-icon')) return;
    var kind = widgetKind(bubble);
    if (!kind) return;
    bubble.setAttribute('data-haulo-icon', kind);
    bubble.innerHTML = WIDGET_ICONS[kind];

    var svg = bubble.querySelector('svg');
    if (!svg) return;
    // Our global `svg{width:100%;height:100%;fill:currentColor}` rule would
    // otherwise stretch these outline glyphs to the edge of the bubble and
    // flood their interiors, so pin size and paint inline.
    svg.style.setProperty('width', '26px', 'important');
    svg.style.setProperty('height', '26px', 'important');
    var parts = bubble.querySelectorAll('svg, svg *');
    for (var p = 0; p < parts.length; p++) {
      parts[p].style.setProperty('fill', 'none', 'important');
      parts[p].style.setProperty('stroke', 'currentColor', 'important');
    }
  }

  function scanWidgetBubbles() {
    var bubbles = document.querySelectorAll('.lv-widget-bubble');
    Array.prototype.forEach.call(bubbles, paintWidgetIcon);
    return bubbles.length;
  }

  // The launchers mount asynchronously, and only for widgets that are live,
  // so watch for them instead of assuming they exist at load.
  if (scanWidgetBubbles() < 2 && 'MutationObserver' in window) {
    var widgetWatch = new MutationObserver(function () {
      if (scanWidgetBubbles() >= 2) widgetWatch.disconnect();
    });
    widgetWatch.observe(document.body, { childList: true });
    // If a launcher never arrives, stop watching rather than linger forever.
    window.setTimeout(function () { widgetWatch.disconnect(); }, 20000);
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

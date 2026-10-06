/* Creative Acoustics Ltd. — site script */
(function () {
  'use strict';

  /* ---------- Mobile nav ---------- */
  var toggle = document.querySelector('.nav-toggle');
  var nav = document.getElementById('site-nav');

  function setNav(open) {
    nav.classList.toggle('is-open', open);
    toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
    toggle.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
  }

  toggle.addEventListener('click', function () {
    setNav(!nav.classList.contains('is-open'));
  });

  nav.addEventListener('click', function (e) {
    if (e.target.closest('a')) setNav(false);
  });

  document.addEventListener('click', function (e) {
    if (nav.classList.contains('is-open') && !e.target.closest('.header-inner')) setNav(false);
  });

  window.matchMedia('(min-width: 721px)').addEventListener('change', function (mq) {
    if (mq.matches) setNav(false);
  });

  /* ---------- Gallery filter ---------- */
  var filters = document.querySelectorAll('.filter');
  var items = Array.prototype.slice.call(document.querySelectorAll('.gallery-item'));

  filters.forEach(function (btn) {
    btn.addEventListener('click', function () {
      var cat = btn.getAttribute('data-filter');
      filters.forEach(function (b) {
        var active = b === btn;
        b.classList.toggle('is-active', active);
        b.setAttribute('aria-pressed', active ? 'true' : 'false');
      });
      items.forEach(function (item) {
        item.hidden = !(cat === 'all' || item.getAttribute('data-category') === cat);
      });
    });
  });

  /* ---------- Lightbox ---------- */
  var lb = document.getElementById('lightbox');
  var lbImg = lb.querySelector('.lb-img');
  var lbCap = lb.querySelector('.lb-caption');
  var current = 0;
  var visible = [];
  var lastFocus = null;

  function show(i) {
    current = (i + visible.length) % visible.length;
    var link = visible[current].querySelector('a');
    var thumb = link.querySelector('img');
    lbImg.src = link.getAttribute('href');
    lbImg.alt = thumb.alt;
    lbCap.textContent = thumb.alt;
  }

  function open(item) {
    visible = items.filter(function (el) { return !el.hidden; });
    lastFocus = document.activeElement;
    lb.hidden = false;
    document.body.classList.add('no-scroll');
    show(visible.indexOf(item));
    lb.querySelector('.lb-close').focus();
  }

  function close() {
    lb.hidden = true;
    lbImg.removeAttribute('src');
    document.body.classList.remove('no-scroll');
    if (lastFocus) lastFocus.focus();
  }

  items.forEach(function (item) {
    item.querySelector('a').addEventListener('click', function (e) {
      e.preventDefault();
      open(item);
    });
  });

  lb.querySelector('.lb-close').addEventListener('click', close);
  lb.querySelector('.lb-prev').addEventListener('click', function () { show(current - 1); });
  lb.querySelector('.lb-next').addEventListener('click', function () { show(current + 1); });
  lb.addEventListener('click', function (e) { if (e.target === lb) close(); });

  document.addEventListener('keydown', function (e) {
    if (lb.hidden) {
      if (e.key === 'Escape' && nav.classList.contains('is-open')) setNav(false);
      return;
    }
    if (e.key === 'Escape') close();
    else if (e.key === 'ArrowLeft') show(current - 1);
    else if (e.key === 'ArrowRight') show(current + 1);
    else if (e.key === 'Tab') {
      var f = lb.querySelectorAll('button');
      var first = f[0], last = f[f.length - 1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    }
  });

  /* ---------- Footer year ---------- */
  var y = document.getElementById('year');
  if (y) y.textContent = new Date().getFullYear();

  /* ---------- Contact: compose-window chooser (runs for everyone, no motion required) ---------- */
  var JAMES_EMAIL = 'creativeacousticsluthier@gmail.com';
  /* Phones: native mail apps pre-fill reliably; Gmail web drops compose params on mobile */
  var isPhone = window.matchMedia('(pointer: coarse)').matches || window.innerWidth <= 900;
  var chooser = null;

  function pling(freq, vol) {
    if (typeof window.flPluck === 'function') window.flPluck(freq, vol);
  }
  /* A small root-fifth-octave chord for the bigger moments */
  function plink(freq, vol) {
    if (typeof window.flStrum === 'function') window.flStrum([freq, freq * 1.5, freq * 2], vol * 0.6, 0.045);
    else pling(freq, vol);
  }

  function buildChooser() {
    chooser = document.createElement('div');
    chooser.className = 'fl-chooser';
    chooser.setAttribute('role', 'dialog');
    chooser.setAttribute('aria-modal', 'true');
    chooser.setAttribute('aria-label', 'Send an email to James');
    chooser.hidden = true;
    chooser.innerHTML =
      '<div class="flc-card">' +
      '<button class="flc-close" type="button" aria-label="Close">&times;</button>' +
      '<p class="eyebrow">Send a message</p>' +
      '<h3 class="flc-title" data-testid="chooser-email">' + JAMES_EMAIL + '</h3>' +
      '<p class="flc-sub">Your message is already written below &mdash; edit it if you like, then choose where it opens.</p>' +
      '<label class="flc-label" for="flc-subject">Subject</label>' +
      '<input class="flc-input" id="flc-subject" type="text" data-testid="chooser-subject">' +
      '<label class="flc-label" for="flc-message">Message</label>' +
      '<textarea class="flc-input flc-msg" id="flc-message" rows="7" data-testid="chooser-message"></textarea>' +
      (isPhone
        ? '<button class="flc-btn flc-mailapp flc-primary" type="button" data-testid="chooser-mailapp">Open your mail app &mdash; message included</button>' +
          '<button class="flc-btn flc-copy-msg" type="button" data-testid="chooser-copy-message">Copy the message</button>' +
          '<button class="flc-btn flc-copy" type="button" data-testid="chooser-copy-email">Copy the email address</button>' +
          '<button class="flc-btn flc-gmail" type="button" data-testid="chooser-gmail">Open Gmail on the web</button>' +
          '<p class="flc-hint" data-testid="chooser-hint">Your mail app opens with everything filled in. Gmail on the web can&rsquo;t pre-fill on phones &mdash; use &ldquo;Copy the message&rdquo; there.</p>'
        : '<button class="flc-btn flc-gmail flc-primary" type="button" data-testid="chooser-gmail">Open in Gmail &mdash; message included</button>' +
          '<button class="flc-btn flc-mailapp" type="button" data-testid="chooser-mailapp">Open your mail app</button>' +
          '<button class="flc-btn flc-copy-msg" type="button" data-testid="chooser-copy-message">Copy the message</button>' +
          '<button class="flc-btn flc-copy" type="button" data-testid="chooser-copy-email">Copy the email address</button>' +
          '<p class="flc-hint" data-testid="chooser-hint">Mail app opened empty? Use &ldquo;Copy the message&rdquo; and paste it in.</p>') +
      '</div>';
    document.body.appendChild(chooser);
    chooser.querySelector('.flc-close').addEventListener('click', closeMailChooser);
    chooser.addEventListener('click', function (e) { if (e.target === chooser) closeMailChooser(); });

    function currentDraft() {
      return {
        su: chooser.querySelector('#flc-subject').value.trim(),
        bd: chooser.querySelector('#flc-message').value
      };
    }

    chooser.querySelector('.flc-gmail').addEventListener('click', function () {
      var dft = currentDraft();
      var url = 'https://mail.google.com/mail/?view=cm&fs=1&to=' + JAMES_EMAIL +
        (dft.su ? '&su=' + encodeURIComponent(dft.su) : '') +
        (dft.bd ? '&body=' + encodeURIComponent(dft.bd) : '');
      window.open(url, '_blank', 'noopener');
      pling(98, 0.12);
    });

    chooser.querySelector('.flc-mailapp').addEventListener('click', function () {
      var dft = currentDraft();
      /* First mailto parameter must use "?" (the old "&su=" broke some mail apps) */
      var url = 'mailto:' + JAMES_EMAIL +
        (dft.su ? '?subject=' + encodeURIComponent(dft.su) : '') +
        (dft.bd ? '&body=' + encodeURIComponent(dft.bd) : '');
      window.location.href = url;
      pling(55, 0.12);
    });

    chooser.querySelector('.flc-copy-msg').addEventListener('click', function () {
      var btn = this;
      var dft = currentDraft();
      var text = 'To: ' + JAMES_EMAIL + (dft.su ? '\nSubject: ' + dft.su : '') + '\n\n' + dft.bd;
      function ok() {
        btn.textContent = 'Copied \u2713';
        setTimeout(function () { btn.textContent = 'Copy the message'; }, 1800);
      }
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(text).then(ok, ok);
      } else {
        var ta = document.createElement('textarea');
        ta.value = text;
        document.body.appendChild(ta);
        ta.select();
        try { document.execCommand('copy'); } catch (err) {}
        document.body.removeChild(ta);
        ok();
      }
      pling(98, 0.12);
    });

    chooser.querySelector('.flc-copy').addEventListener('click', function () {
      var btn = this;
      function ok() {
        btn.textContent = 'Copied \u2713';
        setTimeout(function () { btn.textContent = 'Copy the email address'; }, 1800);
      }
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(JAMES_EMAIL).then(ok, ok);
      } else { ok(); }
      pling(98, 0.12);
    });
  }

  function openMailChooser(subject, body) {
    if (!chooser || !chooser.isConnected || !chooser.querySelector('.flc-gmail')) {
      if (chooser && chooser.parentNode) chooser.parentNode.removeChild(chooser);
      chooser = null;
      buildChooser();
    }
    chooser.querySelector('#flc-subject').value = subject || '';
    chooser.querySelector('#flc-message').value = body || '';
    chooser.hidden = false;
    document.body.classList.add('no-scroll');
    plink(55, 0.1);
  }

  function closeMailChooser() {
    chooser.hidden = true;
    document.body.classList.remove('no-scroll');
  }

  document.addEventListener('keydown', function (e) {
    if (chooser && !chooser.hidden && e.key === 'Escape') closeMailChooser();
  });

  /* The visible email link opens the same compose window, with a starter draft */
  var emailLink = document.querySelector('.contact-list a[href^="mailto:"]');
  if (emailLink) {
    emailLink.addEventListener('click', function (e) {
      e.preventDefault();
      openMailChooser('', 'Hi James,\n\n');
    });
  }

  /* ---------- Build inquiry form (static, no backend) ---------- */
  var buildForm = document.getElementById('build-form');
  if (buildForm) {
    var chips = buildForm.querySelectorAll('.chip');
    var chosen = 'a custom guitar';
    chips.forEach(function (c) {
      c.addEventListener('click', function () {
        chips.forEach(function (o) { o.classList.remove('is-on'); });
        c.classList.add('is-on');
        chosen = c.getAttribute('data-v');
        pling(98, 0.16);
      });
    });
    buildForm.addEventListener('submit', function (e) {
      e.preventDefault();
      var msg = document.getElementById('bf-msg').value.trim();
      var body = 'Hi James,\n\nI am after ' + chosen + '.' + (msg ? '\n\n' + msg : '') + '\n\n\u2014 from the Creative Acoustics website';
      openMailChooser('Build inquiry \u2014 ' + chosen, body);
      var note = document.getElementById('bf-note');
      if (note) {
        note.hidden = false;
        note.textContent = 'The message is written below \u2014 edit it if you like, then pick Gmail or your mail app.';
      }
      plink(73.42, 0.14);
    });
  }
})();

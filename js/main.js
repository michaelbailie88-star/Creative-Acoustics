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

  /* ---------- Contact: messages are sent from the page itself (no mail app) ---------- */
  /* Build inquiries go straight to James's inbox through FormSubmit. */
  var JAMES_EMAIL = 'creativeacousticsluthier@gmail.com';
  var FORM_ENDPOINT = 'https://formsubmit.co/ajax/' + JAMES_EMAIL;

  function pling(freq, vol) {
    if (typeof window.flPluck === 'function') window.flPluck(freq, vol);
  }
  /* A small root-fifth-octave chord for the bigger moments */
  function plink(freq, vol) {
    if (typeof window.flStrum === 'function') window.flStrum([freq, freq * 1.5, freq * 2], vol * 0.6, 0.045);
    else pling(freq, vol);
  }

  /* The visible email address jumps to the message form */
  var emailLink = document.querySelector('.contact-list a[data-testid="email-link"]');
  if (emailLink) {
    emailLink.addEventListener('click', function () {
      var first = document.getElementById('bf-name');
      if (first) setTimeout(function () { first.focus({ preventScroll: true }); }, 500);
    });
  }

  /* ---------- Build inquiry form (sends in the page, no mail app) ---------- */
  var buildForm = document.getElementById('build-form');
  if (buildForm) {
    var chips = buildForm.querySelectorAll('.chip');
    var chosen = 'a custom guitar';
    var interest = document.getElementById('bf-interest');
    var bfName = document.getElementById('bf-name');
    var bfEmail = document.getElementById('bf-email');
    var bfMsg = document.getElementById('bf-msg');
    var bfSend = document.getElementById('bf-send');
    var note = document.getElementById('bf-note');

    function bfStatus(msg, type) {
      note.hidden = !msg;
      note.textContent = msg;
      note.className = 'bf-note' + (type ? ' ' + type : '');
    }

    chips.forEach(function (c) {
      c.addEventListener('click', function () {
        chips.forEach(function (o) { o.classList.remove('is-on'); });
        c.classList.add('is-on');
        chosen = c.getAttribute('data-v');
        if (interest) interest.value = chosen;
        pling(98, 0.16);
      });
    });

    [bfName, bfEmail].forEach(function (el) {
      el.addEventListener('input', function () {
        el.classList.remove('invalid');
        if (note.classList.contains('error')) bfStatus('', '');
      });
    });

    buildForm.addEventListener('submit', function (e) {
      e.preventDefault();
      bfStatus('', '');

      var okName = bfName.value.trim() !== '';
      var okEmail = bfEmail.value.trim() !== '' && bfEmail.checkValidity();
      bfName.classList.toggle('invalid', !okName);
      bfEmail.classList.toggle('invalid', !okEmail);
      if (!okName || !okEmail) {
        bfStatus('Please add your name and a valid email so James can reply.', 'error');
        (okName ? bfEmail : bfName).focus();
        return;
      }

      var data = new FormData(buildForm);
      var payload = {};
      data.forEach(function (value, key) { payload[key] = value; });
      payload.interested_in = chosen;
      payload.message = bfMsg.value.trim() || '(no message added)';
      payload._subject = 'Build inquiry \u2014 ' + chosen + ' \u2014 ' + payload.name;

      bfSend.disabled = true;
      bfStatus('Sending\u2026', '');

      fetch(FORM_ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
        body: JSON.stringify(payload)
      })
        .then(function (res) { return res.json().then(function (json) { return { ok: res.ok, json: json }; }); })
        .then(function (r) {
          if (r.ok && String(r.json.success) === 'true') {
            buildForm.reset();
            chips.forEach(function (o, i) { o.classList.toggle('is-on', i === 0); });
            chosen = chips[0].getAttribute('data-v');
            if (interest) interest.value = chosen;
            bfStatus('Thank you! Your message is on its way to James. He\u2019ll be in touch soon.', 'success');
            plink(73.42, 0.14);
          } else {
            throw new Error('Send failed');
          }
        })
        .catch(function () {
          bfStatus('Sorry, something went wrong and your message was not sent. Please try again, or email ' + JAMES_EMAIL + ' directly.', 'error');
        })
        .finally(function () { bfSend.disabled = false; });
    });
  }
})();

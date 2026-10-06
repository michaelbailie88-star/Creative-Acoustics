/* Creative Acoustics — flare layer v3
   Masked reveals, embers, playable strings (WebAudio, no files),
   fretboard progress, glow cursor, marquee, momentum scrolling,
   3D tilt cards, cinematic lightbox.
   Enhancements only; the site works fully without this file. */
(function () {
  'use strict';

  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  if (!('IntersectionObserver' in window)) return;
  /* ---------- Branded preloader (skips repeat visits, never blocks) ---------- */
  var pre = document.getElementById('fl-preloader');
  if (pre && sessionStorage.getItem('flSeen')) {
    pre.parentNode.removeChild(pre);
    pre = null;
  }
  if (pre) {
    document.documentElement.classList.add('fl-pausing');
    function dismissPre() {
      if (!pre.parentNode) return;
      pre.classList.add('fl-done');
      document.documentElement.classList.remove('fl-pausing');
      sessionStorage.setItem('flSeen', '1');
      setTimeout(function () { if (pre && pre.parentNode) pre.parentNode.removeChild(pre); }, 700);
    }
    window.addEventListener('load', function () { setTimeout(dismissPre, 900); });
    setTimeout(dismissPre, 4000);
  }

  document.documentElement.classList.add('fl-js');

  var dpr = Math.min(window.devicePixelRatio || 1, 2);
  var desktopPointer = window.matchMedia('(pointer: fine)').matches && window.innerWidth > 900;

  /* ---------- Hero headline: masked word reveal ---------- */
  var title = document.querySelector('.hero h1');
  if (title) {
    var words = title.textContent.trim().split(/\s+/);
    title.textContent = '';
    words.forEach(function (w, i) {
      var mask = document.createElement('span');
      mask.className = 'fl-mask';
      var s = document.createElement('span');
      s.className = 'fl-word';
      s.style.setProperty('--i', i);
      s.textContent = w;
      mask.appendChild(s);
      title.appendChild(mask);
      if (i < words.length - 1) title.appendChild(document.createTextNode(' '));
    });
  }

  /* ---------- Section headings: masked words, animate on reveal ---------- */
  document.querySelectorAll('.section-head h2, .why-copy h2, .contact-copy h2').forEach(function (h) {
    var words = h.textContent.trim().split(/\s+/);
    h.classList.add('fl-split');
    h.textContent = '';
    words.forEach(function (w, i) {
      var mask = document.createElement('span');
      mask.className = 'fl-mask';
      var s = document.createElement('span');
      s.className = 'fl-w2';
      s.style.setProperty('--i', i);
      s.textContent = w;
      mask.appendChild(s);
      h.appendChild(mask);
      if (i < words.length - 1) h.appendChild(document.createTextNode(' '));
    });
  });

  /* ---------- Scroll reveals: staggered per viewport batch ---------- */
  var io = new IntersectionObserver(function (entries) {
    entries.filter(function (e) { return e.isIntersecting; }).forEach(function (e, i) {
      e.target.style.animationDelay = (i * 80) + 'ms';
      e.target.classList.add('fl-in');
      io.unobserve(e.target);
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
  document.querySelectorAll('.section-head, .service-card, .quote-card, .why-media, .why-copy, .contact-copy, .area-card, .gallery-item, .step-card, .build-form, .map-card')
    .forEach(function (el) { io.observe(el); });

  /* ---------- String + bridge-pin strands in section headers ---------- */
  document.querySelectorAll('.section-head').forEach(function (h) {
    var d = document.createElement('div');
    d.className = 'fl-strand';
    d.setAttribute('aria-hidden', 'true');
    d.innerHTML = '<i></i><b></b><i></i>';
    h.insertBefore(d, h.firstChild);
  });

  /* ---------- Ghost guitars faded into section backgrounds ---------- */
  var GHOSTS = [
    ['#why', 'bass-6-string-flamed-maple', 'gr', '2 / 3'],
    ['#services', 'archtop-sunburst', 'gl', '2 / 3'],
    ['#gallery', 'guitar-burl-angle', 'gr', '3 / 2'],
    ['#process', 'guitar-top-detail', 'gl', '3 / 2'],
    ['#testimonials', 'bass-green-neck-through', 'gr', '2 / 3'],
    ['#contact', 'guitar-burl-body', 'gl', '3 / 2']
  ];
  GHOSTS.forEach(function (g) {
    var sec = document.querySelector(g[0]);
    if (!sec) return;
    var d = document.createElement('div');
    d.className = 'fl-ghost ' + g[2];
    d.setAttribute('aria-hidden', 'true');
    d.style.backgroundImage = 'url(assets/img/thumbs/' + g[1] + '.jpg)';
    d.style.aspectRatio = g[3];
    d.dataset.f = g[3];
    d.style.width = g[3] === '3 / 2' ? 'min(660px, 50vw)' : 'min(480px, 34vw)';
    d.style.top = '7%';
    sec.insertBefore(d, sec.firstChild);
  });

  /* ---------- Wood-grain dividers at section boundaries ---------- */
  document.querySelectorAll('main > .section').forEach(function (sec, si) {
    if (si === 0) return;
    var wl = document.createElement('div');
    wl.className = 'fl-woodline';
    wl.setAttribute('aria-hidden', 'true');
    sec.insertBefore(wl, sec.firstChild);
  });

  /* ---------- Living ghosts: brighten + deep note on hover ---------- */
  document.querySelectorAll('.fl-ghost').forEach(function (g) {
    var last = 0;
    g.addEventListener('pointerenter', function () {
      g.classList.add('fl-live');
      var now = Date.now();
      if (now - last > 1200) {
        var gRoot = g.dataset.f === '3 / 2' ? NOTE_FREQS[1] : NOTE_FREQS[0];
        strumChord([gRoot, gRoot * 1.5, gRoot * 2], 0.09, 0.05);
        last = now;
      }
    });
    g.addEventListener('pointerleave', function () {
      setTimeout(function () { g.classList.remove('fl-live'); }, 350);
    });
  });

  /* ---------- Slow editorial marquee after the hero ---------- */
  var hero = document.querySelector('.hero');
  if (hero) {
    var groups = [
      { cat: 'Guitars', items: ['Custom bodies, necks & headstocks', 'One-off designs', 'Left- & right-handed builds'] },
      { cat: 'Basses', items: ['4-string', '5-string', '6-string', 'Left-handed'] },
      { cat: 'Accessories', items: ['Control knobs', 'Switch tips', 'Pickup rings & plates', 'Custom design details'] },
      { cat: 'Wood Selections', items: ['Figured & flamed tops', 'Burls & exotic hardwoods', 'Tonewood pairing guidance'] }
    ];
    var mq = document.createElement('div');
    mq.className = 'fl-marquee';
    mq.setAttribute('aria-hidden', 'true');
    var track = document.createElement('div');
    track.className = 'fl-marquee-track';
    for (var rep = 0; rep < 2; rep++) {
      groups.forEach(function (g) {
        var c = document.createElement('span');
        c.className = 'fl-mq-cat';
        c.textContent = g.cat;
        track.appendChild(c);
        g.items.forEach(function (it) {
          var el = document.createElement('span');
          el.className = 'fl-mq-item';
          el.textContent = it;
          track.appendChild(el);
        });
      });
    }
    mq.appendChild(track);
    hero.parentNode.insertBefore(mq, hero.nextSibling);
  }

  /* ---------- Hero: stage, playable strings, embers, cue, parallax ---------- */
  var emberState = null, embersOn = true;
  var heroBg = document.querySelector('.hero-bg');
  var heroContent = document.querySelector('.hero-content');

  if (hero) {
    var stage = document.createElement('div');
    stage.className = 'fl-stage';
    stage.setAttribute('aria-hidden', 'true');
    hero.appendChild(stage);

    startEmbers(hero);

    var cue = document.createElement('a');
    cue.className = 'fl-scrollcue';
    cue.href = '#why';
    cue.setAttribute('aria-label', 'Scroll to content');
    hero.appendChild(cue);

  }

  function makeSpark(st) {
    return {
      x: Math.random() * st.w,
      y: st.h + 10,
      r: 0.6 + Math.random() * 2,
      vy: 0.25 + Math.random() * 0.6,
      vx: (Math.random() - 0.5) * 0.28,
      a: 0.15 + Math.random() * 0.5,
      ph: Math.random() * Math.PI * 2
    };
  }

  function startEmbers(host) {
    var cv = document.createElement('canvas');
    cv.className = 'fl-embers';
    cv.setAttribute('aria-hidden', 'true');
    host.appendChild(cv);
    var ctx = cv.getContext('2d');
    if (!ctx) return;
    var st = { ctx: ctx, w: 0, h: 0, parts: [] };
    function size() {
      var r = host.getBoundingClientRect();
      st.w = r.width;
      st.h = r.height;
      cv.width = st.w * dpr;
      cv.height = st.h * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }
    size();
    window.addEventListener('resize', size);
    var count = Math.max(24, Math.min(90, Math.round(st.w * st.h / 12000)));
    for (var p = 0; p < count; p++) {
      var pt = makeSpark(st);
      pt.y = Math.random() * st.h;
      st.parts.push(pt);
    }
    new IntersectionObserver(function (en) { embersOn = en[0].isIntersecting; }, { threshold: 0.02 }).observe(host);
    emberState = st;
  }

  var tick = 0;
  function drawEmbers() {
    var st = emberState;
    tick += 0.016;
    st.ctx.clearRect(0, 0, st.w, st.h);
    st.ctx.globalCompositeOperation = 'lighter';
    for (var i = 0; i < st.parts.length; i++) {
      var pt = st.parts[i];
      pt.y -= pt.vy;
      pt.x += pt.vx + Math.sin(tick * 1.4 + pt.ph) * 0.2;
      if (pt.y < -12) { st.parts[i] = makeSpark(st); continue; }
      var flick = 0.7 + 0.3 * Math.sin(tick * 5 + pt.ph);
      st.ctx.beginPath();
      st.ctx.fillStyle = 'rgba(240, 180, 120, ' + (pt.a * flick).toFixed(3) + ')';
      st.ctx.arc(pt.x, pt.y, pt.r, 0, Math.PI * 2);
      st.ctx.fill();
    }
  }

  /* ---------- Footer equalizer ---------- */
  var footerInner = document.querySelector('.site-footer .footer-inner');
  if (footerInner) {
    var eq = document.createElement('div');
    eq.className = 'fl-eq';
    eq.setAttribute('aria-hidden', 'true');
    for (var b = 0; b < 26; b++) {
      var bar = document.createElement('i');
      bar.style.setProperty('--d', (b * 0.11).toFixed(2) + 's');
      bar.style.setProperty('--h', (0.25 + Math.abs(Math.sin(b * 1.7)) * 0.75).toFixed(2));
      eq.appendChild(bar);
    }
    footerInner.insertBefore(eq, footerInner.firstChild);
  }

  /* ---------- Fretboard nav: strings behind the links ---------- */
  var siteNav = document.getElementById('site-nav');
  if (siteNav) {
    var navStrings = document.createElement('div');
    navStrings.className = 'fl-navstrings';
    navStrings.setAttribute('aria-hidden', 'true');
    for (var ns = 0; ns < 4; ns++) navStrings.appendChild(document.createElement('span'));
    siteNav.insertBefore(navStrings, siteNav.firstChild);
  }

  /* ---------- Guitar header: body, sound hole, bridge, full strings ---------- */
  var siteHeader = document.querySelector('.site-header');
  if (siteHeader) {
    var gBody = document.createElement('div');
    gBody.className = 'fl-guitar-body';
    gBody.setAttribute('aria-hidden', 'true');
    var gHole = document.createElement('div');
    gHole.className = 'fl-soundhole';
    gHole.setAttribute('aria-hidden', 'true');
    gBody.appendChild(gHole);
    var gBridge = document.createElement('div');
    gBridge.className = 'fl-bridge';
    gBridge.setAttribute('aria-hidden', 'true');
    for (var bp = 0; bp < 4; bp++) gBridge.appendChild(document.createElement('i'));
    var hStrings = document.createElement('div');
    hStrings.className = 'fl-headerstrings';
    hStrings.setAttribute('aria-hidden', 'true');
    for (var hs = 0; hs < 4; hs++) hStrings.appendChild(document.createElement('span'));
    siteHeader.appendChild(gBody);
    siteHeader.appendChild(gBridge);
    siteHeader.appendChild(hStrings);
  }

  /* ---------- Keep the logo exactly centered between bridge and sound hole ---------- */
  var brandLink = siteHeader ? siteHeader.querySelector('.brand') : null;
  var innerBar = siteHeader ? siteHeader.querySelector('.header-inner') : null;
  function centerLogo() {
    if (!brandLink || !innerBar) return;
    var bridge = siteHeader.querySelector('.fl-bridge');
    var hole = siteHeader.querySelector('.fl-soundhole');
    if (!bridge || !hole) return;
    var br = bridge.getBoundingClientRect();
    var hr = hole.getBoundingClientRect();
    var ir = innerBar.getBoundingClientRect();
    var bw = brandLink.getBoundingClientRect().width;
    var mid = (br.right + hr.left) / 2;
    brandLink.style.left = (mid - bw / 2 - ir.left) + 'px';
  }
  centerLogo();
  window.addEventListener('resize', centerLogo);

  /* ---------- Flames for the burning hover ---------- */
  if (brandLink) {
    for (var fl = 0; fl < 3; fl++) {
      var flame = document.createElement('i');
      flame.className = 'fl-flame';
      flame.setAttribute('aria-hidden', 'true');
      brandLink.appendChild(flame);
    }
  }

  /* ---------- Audio: strummed chords with a real plucked voice (no sound files) ---------- */
  /* Phone speakers cannot reproduce the true bass register, so touch devices and
     narrow screens play the same music two octaves up — same chords, audible size. */
  var phoneAudio = window.matchMedia('(pointer: coarse)').matches || window.innerWidth <= 900;
  var REG = phoneAudio ? 4 : 1;
  var NOTE_FREQS = [41.2, 55, 73.42, 98, 110].map(function (hz) { return hz * REG; });
  /* Chord shapes in the bass register — Em, G, A, D, C (one per nav link) */
  var CHORDS = [
    [41.2, 61.74, 82.41, 98, 123.47],
    [49, 73.42, 98, 123.47, 146.83],
    [55, 82.41, 110, 138.59],
    [73.42, 110, 146.83, 185],
    [65.41, 98, 130.81, 164.81]
  ].map(function (chord) {
    return chord.map(function (hz) { return hz * REG; });
  });
  var AC = null, master = null, noiseBuf = null;
  function initAudio() {
    if (AC) {
      if (AC.state === 'suspended') AC.resume();
      return;
    }
    var Ctor = window.AudioContext || window.webkitAudioContext;
    if (!Ctor) return;
    AC = new Ctor();
    master = AC.createGain();
    master.gain.value = phoneAudio ? 0.7 : 0.55;
    /* Compressor glues the chord together and keeps strums from clipping */
    var comp = AC.createDynamicsCompressor();
    comp.threshold.value = -18;
    comp.knee.value = 14;
    comp.ratio.value = 4;
    comp.attack.value = 0.004;
    comp.release.value = 0.26;
    master.connect(comp);
    comp.connect(AC.destination);
    /* Guitar-body resonance: two soft bandpass bumps re-voicing the strings */
    var bodyGain = AC.createGain();
    bodyGain.gain.value = 0.35;
    bodyGain.connect(comp);
    [[110, 1.1], [225, 1.6]].forEach(function (b) {
      var bp = AC.createBiquadFilter();
      bp.type = 'bandpass';
      bp.frequency.value = b[0] * REG;
      bp.Q.value = b[1];
      master.connect(bp);
      bp.connect(bodyGain);
    });
    /* Shared noise buffer for the pick-attack transient */
    noiseBuf = AC.createBuffer(1, Math.floor(AC.sampleRate * 0.25), AC.sampleRate);
    var nd = noiseBuf.getChannelData(0);
    for (var n = 0; n < nd.length; n++) nd[n] = Math.random() * 2 - 1;
    /* Silent buffer + resume inside the gesture: the combination that unlocks iOS */
    try {
      var silent = AC.createBuffer(1, 1, 22050);
      var src = AC.createBufferSource();
      src.buffer = silent;
      src.connect(AC.destination);
      src.start(0);
    } catch (err) {}
    if (AC.state === 'suspended') AC.resume();
    setTimeout(function () {
      if (AC && AC.state === 'running') strum(0.08);
    }, 150);
  }
  ['pointerdown', 'touchstart', 'keydown'].forEach(function (evt) {
    document.addEventListener(evt, initAudio, { passive: true });
  });

  function pluckNote(freq, vol, when) {
    if (!AC) return;
    if (AC.state === 'suspended') AC.resume(); /* keep scheduling; it plays on resume */
    var t = when || AC.currentTime;
    /* Random ±3.5 cents so no two plucks are ever identical */
    freq = freq * Math.pow(2, (Math.random() * 7 - 3.5) / 1200);
    var f = AC.createBiquadFilter();
    f.type = 'lowpass';
    f.Q.value = 0.8;
    f.frequency.setValueAtTime(freq * 6, t);
    f.frequency.exponentialRampToValueAtTime(freq * 1.1, t + 1.8);
    f.connect(master);
    /* Pick attack: a 25ms filtered noise burst — the part that makes it a pluck */
    if (noiseBuf) {
      var pk = AC.createBufferSource();
      pk.buffer = noiseBuf;
      var pkF = AC.createBiquadFilter();
      pkF.type = 'bandpass';
      pkF.frequency.value = Math.min(freq * 12, 5200 * REG);
      pkF.Q.value = 1.2;
      var pkG = AC.createGain();
      pkG.gain.setValueAtTime(vol * 0.45, t);
      pkG.gain.exponentialRampToValueAtTime(0.0001, t + 0.045);
      pk.connect(pkF);
      pkF.connect(pkG);
      pkG.connect(master);
      pk.start(t);
    }
    /* String voice: fundamental + detuned twin (natural beating) + partials that
       die faster as they rise — body through the lowpass, shine bypasses it so
       small phone speakers still reproduce the chord. */
    [
      ['triangle', 1, vol, 2.6, true],
      ['sine', 1.0035, vol * 0.3, 2.2, true],
      ['sine', 2.001, vol * 0.42, 1.3, true],
      ['sine', 3.01, vol * 0.22, 0.7, false],
      ['triangle', 4.016, vol * 0.16, 0.42, false]
    ].forEach(function (cfg) {
      var o = AC.createOscillator(), g = AC.createGain();
      o.type = cfg[0];
      o.frequency.value = freq * cfg[1];
      g.gain.setValueAtTime(cfg[2], t);
      g.gain.exponentialRampToValueAtTime(0.0001, t + cfg[3]);
      o.connect(g);
      g.connect(cfg[4] ? f : master);
      o.start(t);
      o.stop(t + cfg[3] + 0.05);
    });
  }

  /* A strum: strings picked in sequence with human jitter and volume roll-off */
  function strumChord(freqs, vol, pace) {
    if (!AC) return;
    if (AC.state === 'suspended') AC.resume();
    var t0 = AC.currentTime + 0.015;
    var step = pace || 0.055;
    freqs.forEach(function (freq, i) {
      pluckNote(freq, vol * (1 - i * 0.07), t0 + i * step + Math.random() * 0.025);
    });
  }
  function strum(vol) { strumChord(CHORDS[0], vol, 0.06); }
  /* Contact sounds hook — main.js pings these when the compose window is used */
  window.flPluck = pluckNote;
  window.flStrum = strumChord;

  /* Nav fretboard: each link strums its own chord; hover hums root + fifth */
  document.querySelectorAll('#site-nav a').forEach(function (a, i) {
    var chord = CHORDS[i % CHORDS.length];
    var root = chord[0];
    a.addEventListener('click', function () { strumChord(chord, 0.15); });
    if (desktopPointer) {
      a.addEventListener('pointerenter', function () { strumChord([root, root * 1.5], 0.055, 0.04); });
    }
  });

  /* Buttons and gallery filters */
  document.querySelectorAll('.btn, .filter').forEach(function (b) {
    b.addEventListener('click', function () { strumChord(CHORDS[2], 0.11, 0.045); });
  });

  /* Lightbox: open with a full chord, step through notes, close low */
  document.querySelectorAll('.gallery-item a').forEach(function (a) {
    a.addEventListener('click', function () { strum(0.12); });
  });
  var lbNav = document.getElementById('lightbox');
  if (lbNav) {
    lbNav.querySelector('.lb-prev').addEventListener('click', function () { pluckNote(55, 0.16); });
    lbNav.querySelector('.lb-next').addEventListener('click', function () { pluckNote(73.42, 0.16); });
    lbNav.querySelector('.lb-close').addEventListener('click', function () { pluckNote(41.2, 0.14); });
  }

  /* ---------- Fretboard scroll progress ---------- */
  var fretsBar = document.createElement('div');
  fretsBar.className = 'fl-frets';
  fretsBar.setAttribute('aria-hidden', 'true');
  var fretFill = document.createElement('span');
  fretFill.className = 'fl-fretfill';
  fretsBar.appendChild(fretFill);
  var fretMarks = [];
  for (var fi = 1; fi <= 12; fi++) {
    var m = document.createElement('i');
    m.style.left = ((1 - Math.pow(2, -fi / 12)) * 200).toFixed(2) + '%';
    fretsBar.appendChild(m);
    fretMarks.push(m);
  }
  document.body.appendChild(fretsBar);

  /* ---------- Copper glow cursor (desktop) ---------- */
  var cursor = null, mx = -500, my = -500, cx = -500, cy = -500;
  if (desktopPointer) {
    cursor = document.createElement('div');
    cursor.className = 'fl-cursor';
    cursor.setAttribute('aria-hidden', 'true');
    document.body.appendChild(cursor);
    document.addEventListener('mousemove', function (e) {
      mx = e.clientX;
      my = e.clientY;
      document.documentElement.classList.add('fl-cursor-on');
    }, { passive: true });
  }

  /* ---------- 3D tilt on cards (desktop) ---------- */
  if (desktopPointer) {
    document.querySelectorAll('.service-card, .area-card').forEach(function (card) {
      card.addEventListener('pointermove', function (e) {
        var r = card.getBoundingClientRect();
        var px = (e.clientX - r.left) / r.width - 0.5;
        var py = (e.clientY - r.top) / r.height - 0.5;
        card.style.transform = 'perspective(900px) rotateX(' + (-py * 5).toFixed(2) + 'deg) rotateY(' + (px * 5).toFixed(2) + 'deg) translateY(-6px)';
      });
      card.addEventListener('pointerleave', function () { card.style.transform = ''; });
    });
    /* Cursor-tracked spotlight across gallery thumbs */
    document.querySelectorAll('.gallery-item a').forEach(function (a) {
      a.addEventListener('pointermove', function (e) {
        var r = a.getBoundingClientRect();
        a.style.setProperty('--gx', ((e.clientX - r.left) / r.width * 100).toFixed(1) + '%');
        a.style.setProperty('--gy', ((e.clientY - r.top) / r.height * 100).toFixed(1) + '%');
      });
    });
  }

  /* ---------- Cinematic lightbox: counter + crossfade ---------- */
  var lb = document.getElementById('lightbox');
  if (lb) {
    var fig = lb.querySelector('.lb-figure');
    var lbImg = lb.querySelector('.lb-img');
    var counter = document.createElement('div');
    counter.className = 'fl-lbcount';
    counter.setAttribute('aria-hidden', 'true');
    fig.appendChild(counter);
    var myIdx = 0;

    function visibleTotal() {
      return document.querySelectorAll('.gallery-item:not([hidden])').length;
    }
    function refresh() {
      counter.textContent = (myIdx + 1) + ' / ' + visibleTotal();
    }
    function fadeSwap() {
      lbImg.classList.add('fl-fading');
    }
    lbImg.addEventListener('load', function () {
      lbImg.classList.remove('fl-fading');
    });

    document.querySelectorAll('.gallery-item').forEach(function (item, idx) {
      item.querySelector('a').addEventListener('click', function () {
        myIdx = idx;
        fadeSwap();
        refresh();
      });
    });
    lb.querySelector('.lb-prev').addEventListener('click', function () {
      var total = visibleTotal();
      myIdx = (myIdx - 1 + total) % total;
      fadeSwap();
      refresh();
    });
    lb.querySelector('.lb-next').addEventListener('click', function () {
      var total = visibleTotal();
      myIdx = (myIdx + 1) % total;
      fadeSwap();
      refresh();
    });
  }

  /* ---------- Featured Builds: cinematic story spread ---------- */
  var STORIES = {
    'archtop-sunburst': { type: 'Guitar', t: 'The Sunburst Archtop', w: ['Sunburst finish'], h: ['F-hole voice', 'Hand-turned wooden knobs'], text: 'A classic sunburst archtop with an f-hole voice and hand-turned wooden knobs. Every curve carved by hand in the shop, right down to the finish.' },
    'bass-5-string-striped': { type: 'Bass', t: 'The Striped Five', w: ['Striped hardwood body'], h: ['Gold bridge', 'Wooden knobs'], text: 'Five strings of striped hardwood with a gold bridge. The stripes run the whole way through — no two boards ever repeat.' },
    'bass-5-string-flamed-maple': { type: 'Bass', t: 'The Flamed Five', w: ['Flamed maple top'], h: ['Gold hardware'], text: 'A flamed maple top under gold hardware. Turn it in the light and the grain moves like water.' },
    'bass-5-string-figured': { type: 'Bass', t: 'The Figured Five', w: ['Figured wood top'], h: [], text: 'A five-string bass with a deeply figured top — proof that the wood sets the look before a note is even played.' },
    'guitar-burl-full': { type: 'Guitar', t: 'The Burl, In Full', w: ['Burl top'], h: ['Gold hardware', 'Wooden knobs'], text: 'The full view of a burl-top build: wild grain up front, gold hardware, and wooden knobs turned to match.' },
    'bass-6-string-flamed-maple': { type: 'Bass', t: 'The Six', w: ['Flamed maple top'], h: ['Gold bridge', 'Wooden control knobs'], text: 'A left-handed six-string bass in flamed maple with a gold bridge. Lefties deserve their own legend, not a swapped righty.' },
    'guitar-burl-body': { type: 'Guitar', t: 'The Burl Body', w: ['Burl top', 'Purple binding'], h: [], text: 'A burl-top body edged in purple binding — the moment the wood gets its frame and the build gets its attitude.' },
    'guitar-burl-angle': { type: 'Guitar', t: 'The Burl, At An Angle', w: ['Burl top'], h: ['Gold pickups', 'Wooden knobs'], text: 'The hero of the shop: a burl top with gold pickups and wooden knobs, angled the way it greets you on a stand.' },
    'bass-4-string-neck-through': { type: 'Bass', t: 'The Laminated Four', w: ['Figured body', 'Laminated neck'], h: [], text: 'A four-string with a figured body and a laminated neck running through — sustain that starts at the strap and never stops.' },
    'bass-striped-angle': { type: 'Bass', t: 'Stripes, At An Angle', w: ['Striped hardwood body'], h: ['Wooden knobs'], text: 'The striped hardwood bass from another angle — alternating boards, wooden knobs, and not a drop of plastic in sight.' },
    'bass-green-neck-through': { type: 'Bass', t: 'The Green Stain', w: ['Green-stained body', 'Laminated neck'], h: [], text: 'A green-stained body over a laminated neck. Different stain, same shop rule: the wood does the talking.' },
    'knobs-pair-dark': { type: 'Accessory', t: 'Dark-Hardwood Knobs', w: ['Dark hardwood'], h: ['Hand-turned'], text: 'A pair of hand-turned dark hardwood knobs — the upgrade that makes a stock guitar feel like yours.' },
    'pickup-rings-pair': { type: 'Accessory', t: 'Wooden Pickup Rings', w: ['Hardwood'], h: ['Humbucker fit'], text: 'Hand-turned pickup rings that frame a humbucker the way it deserves. Plastic never stood a chance.' },
    'knobs-pair-tall': { type: 'Accessory', t: 'Tall Knobs', w: ['Hardwood'], h: ['Hand-turned'], text: 'Taller-profile hand-turned knobs for players who grip from the side — same warmth, more leverage.' },
    'knobs-low-profile-set': { type: 'Accessory', t: 'Low-Profile Set', w: ['Hardwood'], h: ['Matching switch tip'], text: 'A low-profile knob set with a matching switch tip — subtle grain, zero snags, all feel.' },
    'pickup-rings-square': { type: 'Accessory', t: 'Square Rings', w: ['Hardwood'], h: ['Square cut'], text: 'Square-cut wooden pickup rings for builds that walk their own line.' },
    'knobs-striped-set': { type: 'Accessory', t: 'Striped Knob Set', w: ['Striped hardwood'], h: ['Matching switch tip'], text: 'A striped hardwood knob set with a matching switch tip — tiny details, finished properly.' },
    'pickup-rings-stacked': { type: 'Accessory', t: 'Stacked Rings', w: ['Hardwood'], h: [], text: 'Pickup rings, stacked — a little pile of frames waiting for their instruments.' },
    'knobs-installed-flamed': { type: 'Accessory', t: 'Knobs, Installed', w: ['Flamed top'], h: ['Hand-turned knobs'], text: 'Hand-turned wooden knobs sitting in a flamed top — the moment a customer texts you a photo from their workshop.' },
    'knobs-installed-maple': { type: 'Accessory', t: 'On The Maple Bass', w: ['Maple body'], h: ['Wooden knobs'], text: 'Wooden knobs installed on a maple bass — matched grain, honest fit, no adapters.' },
    'knobs-switch-tip': { type: 'Accessory', t: 'Knobs & Switch Tip', w: ['Burl top'], h: ['Wooden switch tip'], text: 'Knobs and a switch tip on a burl top — the full wooden hardware treatment.' },
    'knobs-dome-set': { type: 'Accessory', t: 'Dome-Top Set', w: ['Hardwood'], h: ['Dome tops', 'Matching switch tip'], text: 'Dome-top wooden knobs with a matching switch tip — smooth under the palm, warm under the lights.' },
    'body-back-neck-joint': { type: 'Detail', t: 'The Neck Joint', w: ['Figured body'], h: [], text: 'The back of a figured body at the neck joint — where sustain either gets lost or gets legendary. No shortcuts here.' },
    'body-edge-purple-binding': { type: 'Detail', t: 'Purple Binding', w: ['Purple binding'], h: ['Output jack'], text: 'A body edge with purple binding and a clean output jack — the frame around the whole picture.' },
    'headstock-back-tuners': { type: 'Detail', t: 'Behind The Headstock', w: ['Laminated headstock'], h: ['Gold tuners'], text: 'The back of a laminated headstock wearing gold tuners — the part only the player really gets to know.' },
    'body-edge-burl-jack': { type: 'Detail', t: 'Burl Meets Gold', w: ['Burl body'], h: ['Gold output jack'], text: 'A burl body edge meeting a gold output jack. Even the parts you plug into get dressed up here.' },
    'guitar-back-figured': { type: 'Detail', t: 'The Figured Back', w: ['Figured back'], h: ['Control cover'], text: 'The back of a guitar, figured and finished with a control cover — because the player sees this side every day.' },
    'guitar-top-detail': { type: 'Detail', t: 'Top, Up Close', w: ['Burl top'], h: ['Gold pickups', 'Black knobs'], text: 'A burl top up close with gold pickups — look long enough and the grain starts moving.' },
    'headstock-logo-inlay': { type: 'Detail', t: 'The Inlay', w: ['Burl headstock'], h: ['Creative Acoustics inlay'], text: 'The Creative Acoustics inlay set into a burl headstock — the signature before the first note.' },
    'bass-4-string-detail': { type: 'Detail', t: 'Four Strings, Close', w: ['Figured body'], h: [], text: 'A figured bass body up close — every pass of the scraper still visible if you know where to look.' },
    'guitar-back-neck-heel': { type: 'Detail', t: 'The Heel', w: ['Figured back'], h: ['Sculpted neck heel'], text: 'A sculpted neck heel on a figured back — shaped for the hand long before it ever meets a fretboard.' },
    'guitar-burl-pickups': { type: 'Detail', t: 'Burl & Gold', w: ['Burl top'], h: ['Gold humbuckers'], text: 'A burl top wearing gold humbuckers — the pairing that started half the builds in the gallery.' }
  };
  var story = null, storyIdx = 0;

  function visibleItems() {
    return Array.prototype.slice.call(document.querySelectorAll('.gallery-item:not([hidden])'));
  }
  function buildStory() {
    story = document.createElement('div');
    story.className = 'fl-story';
    story.setAttribute('role', 'dialog');
    story.setAttribute('aria-modal', 'true');
    story.setAttribute('aria-label', 'Build story');
    story.hidden = true;
    story.innerHTML =
      '<button class="fs-close" type="button" aria-label="Close story" data-testid="story-close">&times;</button>' +
      '<div class="fs-grid">' +
      '<figure class="fs-media"><img class="fs-img" alt="" data-testid="story-image"><figcaption class="fs-cap"></figcaption></figure>' +
      '<div class="fs-copy">' +
      '<p class="eyebrow fs-type"></p>' +
      '<h3 class="fs-title"></h3>' +
      '<p class="fs-text"></p>' +
      '<p class="fs-specs"></p>' +
      '<div class="fs-nav">' +
      '<button class="fs-prev" type="button" aria-label="Previous build" data-testid="story-prev">&#8249;</button>' +
      '<span class="fs-count"></span>' +
      '<button class="fs-next" type="button" aria-label="Next build" data-testid="story-next">&#8250;</button>' +
      '</div>' +
      '</div>' +
      '</div>';
    document.body.appendChild(story);
    story.querySelector('.fs-close').addEventListener('click', closeStory);
    story.querySelector('.fs-prev').addEventListener('click', function () { showStory(storyIdx - 1); });
    story.querySelector('.fs-next').addEventListener('click', function () { showStory(storyIdx + 1); });
    story.addEventListener('click', function (e) { if (e.target === story) closeStory(); });
    /* Mobile escape hatch: swipe down from the top of the story to close it */
    var touchStartY = null;
    story.addEventListener('touchstart', function (e) {
      touchStartY = story.scrollTop <= 0 ? e.touches[0].clientY : null;
    }, { passive: true });
    story.addEventListener('touchend', function (e) {
      if (touchStartY === null) return;
      var dy = e.changedTouches[0].clientY - touchStartY;
      touchStartY = null;
      if (dy > 90) closeStory();
    }, { passive: true });
  }
  function showStory(i) {
    var vis = visibleItems();
    storyIdx = (i + vis.length) % vis.length;
    var item = vis[storyIdx];
    var link = item.querySelector('a');
    var name = link.getAttribute('href').split('/').pop().replace(/\.jpg$/, '');
    var d = STORIES[name] || { type: 'Build', t: 'From the Shop', w: [], h: [], text: link.querySelector('img').alt };
    story.querySelector('.fs-img').src = link.getAttribute('href');
    story.querySelector('.fs-img').alt = link.querySelector('img').alt;
    story.querySelector('.fs-cap').textContent = link.querySelector('img').alt;
    story.querySelector('.fs-type').textContent = d.type;
    story.querySelector('.fs-title').textContent = d.t;
    story.querySelector('.fs-text').textContent = d.text;
    story.querySelector('.fs-specs').innerHTML = d.w.concat(d.h).map(function (sp) { return '<span>' + sp + '</span>'; }).join('');
    story.querySelector('.fs-count').textContent = (storyIdx + 1) + ' / ' + vis.length;
    story.hidden = false;
    document.body.classList.add('no-scroll');
    strum(0.1);
  }
  function closeStory() {
    story.hidden = true;
    document.body.classList.remove('no-scroll');
    pluckNote(41.2, 0.12);
  }
  document.querySelectorAll('.gallery-item a').forEach(function (a) {
    a.addEventListener('click', function (e) {
      e.preventDefault();
      e.stopPropagation();
      if (!story) buildStory();
      var vis = visibleItems();
      showStory(Math.max(0, vis.indexOf(a.closest('.gallery-item'))));
    }, true);
  });
  document.addEventListener('keydown', function (e) {
    if (!story || story.hidden) return;
    if (e.key === 'Escape') closeStory();
    else if (e.key === 'ArrowLeft') showStory(storyIdx - 1);
    else if (e.key === 'ArrowRight') showStory(storyIdx + 1);
  });

  /* ---------- Momentum scrolling (wheel only; touch/keyboard native) ---------- */
  var tgt = window.scrollY, cur = window.scrollY, hijack = false;
  window.addEventListener('wheel', function (e) {
    if (document.body.classList.contains('no-scroll')) return;
    e.preventDefault();
    var max = document.documentElement.scrollHeight - window.innerHeight;
    tgt = cur = window.scrollY;
    tgt = Math.max(0, Math.min(tgt + e.deltaY, max));
    hijack = true;
  }, { passive: false });
  document.querySelectorAll('a[href^="#"]').forEach(function (a) {
    a.addEventListener('click', function (e) {
      var href = a.getAttribute('href');
      if (!href || href.length < 2) return;
      var el = document.querySelector(href);
      if (!el) return;
      e.preventDefault();
      var max = document.documentElement.scrollHeight - window.innerHeight;
      cur = window.scrollY;
      tgt = href === '#top' ? 0 : Math.max(0, Math.min(el.getBoundingClientRect().top + cur - 78, max));
      hijack = true;
    });
  });

  /* ---------- Master animation loop ---------- */
  (function loop() {
    requestAnimationFrame(loop);
    if (hijack) {
      cur += (tgt - cur) * 0.115;
      if (Math.abs(tgt - cur) < 0.5) { cur = tgt; hijack = false; }
      window.scrollTo({ top: cur, behavior: 'instant' });
    }
    var sy = window.scrollY;
    if (heroBg) {
      heroBg.style.transform = sy < window.innerHeight * 1.3 ? 'translateY(' + (sy * 0.18).toFixed(1) + 'px) scale(1.15)' : '';
    }
    if (heroContent && sy < window.innerHeight * 1.2) {
      var f = Math.max(0, 1 - sy / (window.innerHeight * 0.85));
      heroContent.style.opacity = f.toFixed(3);
      heroContent.style.transform = 'translateY(' + (sy * 0.14).toFixed(1) + 'px)';
    }
    var max = document.documentElement.scrollHeight - window.innerHeight;
    var prog = max > 0 ? (sy / max) * 100 : 0;
    fretFill.style.width = prog.toFixed(2) + '%';
    for (var fm = 0; fm < fretMarks.length; fm++) {
      fretMarks[fm].classList.toggle('on', prog >= parseFloat(fretMarks[fm].style.left));
    }
    if (cursor) {
      cx += (mx - cx) * 0.14;
      cy += (my - cy) * 0.14;
      cursor.style.transform = 'translate(' + (cx - 170).toFixed(1) + 'px,' + (cy - 170).toFixed(1) + 'px)';
    }
    if (emberState && embersOn) drawEmbers();
  })();
})();

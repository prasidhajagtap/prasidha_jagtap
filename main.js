// Written in plain, widely supported JavaScript so it runs in all modern
// browsers and in-app browsers (LinkedIn, WhatsApp, Instagram, Gmail).
(function () {
  var root = document.documentElement;

  function store(key, value) {
    try { window.localStorage.setItem(key, value); } catch (e) {}
  }

  // ---------- Footer year ----------
  var year = document.getElementById('year');
  if (year) year.textContent = new Date().getFullYear();

  // ---------- Light / dark toggle (light is the default; the choice is remembered) ----------
  // (one round button in the header; on phones the same switch sits in the menu)
  var themeBtns = document.querySelectorAll('[data-theme-toggle]');
  var themeMeta = document.querySelector('meta[name="theme-color"]');
  function isDark() { return root.getAttribute('data-theme') === 'dark'; }
  function applyTheme(dark) {
    if (dark) root.setAttribute('data-theme', 'dark'); else root.removeAttribute('data-theme');
    for (var t = 0; t < themeBtns.length; t++) {
      if (themeBtns[t].classList.contains('theme-toggle')) themeBtns[t].setAttribute('aria-label', dark ? 'Switch to light mode' : 'Switch to dark mode');
    }
    if (themeMeta) themeMeta.setAttribute('content', dark ? '#000000' : '#ffffff');
  }
  applyTheme(isDark());
  for (var tb0 = 0; tb0 < themeBtns.length; tb0++) {
    themeBtns[tb0].addEventListener('click', function () {
      var dark = !isDark();
      applyTheme(dark);
      store('theme', dark ? 'dark' : 'light');
    });
  }

  // ---------- Phone menu ----------
  var nav = document.querySelector('.nav');
  var menuBtn = document.querySelector('[data-menu-toggle]');
  function setMenu(open) {
    if (!nav || !menuBtn) return;
    if (open) nav.classList.add('open'); else nav.classList.remove('open');
    menuBtn.setAttribute('aria-expanded', open ? 'true' : 'false');
    menuBtn.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
  }
  if (menuBtn) {
    menuBtn.addEventListener('click', function () { setMenu(!nav.classList.contains('open')); });
    var links = document.querySelectorAll('#nav-links a');
    for (var i = 0; i < links.length; i++) links[i].addEventListener('click', function () { setMenu(false); });
  }

  // ---------- Profile picture joins the name once the big photo scrolls away ----------
  var portrait = document.querySelector('.hero .portrait');
  if (nav && portrait && 'IntersectionObserver' in window) {
    new IntersectionObserver(function (en) {
      var e = en[en.length - 1];
      if (!e.isIntersecting && e.boundingClientRect.top < 0) nav.classList.add('has-pic'); else nav.classList.remove('has-pic');
    }, { rootMargin: '-60px 0px 0px 0px' }).observe(portrait);
  }

  // ---------- Back to top ----------
  var toTop = document.querySelector('[data-to-top]');
  if (toTop) {
    var ticking = false;
    var update = function () {
      var y = window.pageYOffset || document.documentElement.scrollTop;
      if (y > 700) toTop.classList.add('show'); else toTop.classList.remove('show');
      ticking = false;
    };
    window.addEventListener('scroll', function () {
      if (!ticking) { ticking = true; (window.requestAnimationFrame || setTimeout)(update); }
    }, { passive: true });
    update();
    toTop.addEventListener('click', function () {
      var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      try { window.scrollTo({ top: 0, behavior: reduce ? 'auto' : 'smooth' }); }
      catch (e) { window.scrollTo(0, 0); }
      var brand = document.querySelector('.brand');
      if (brand) { try { brand.focus({ preventScroll: true }); } catch (e) {} }
    });
  }

  // ---------- Fade sections in as they scroll into view ----------
  var items = document.querySelectorAll('.reveal');
  function showAll() { for (var i = 0; i < items.length; i++) items[i].classList.add('in'); }
  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (entries) {
      for (var i = 0; i < entries.length; i++) {
        if (entries[i].isIntersecting) {
          entries[i].target.classList.add('in');
          io.unobserve(entries[i].target);
        }
      }
    }, { rootMargin: '0px 0px -8% 0px' });
    for (var j = 0; j < items.length; j++) io.observe(items[j]);
    // Safety net: never leave content hidden (e.g. printing, odd in-app browsers)
    window.addEventListener('beforeprint', showAll);
    setTimeout(function () {
      if (document.querySelectorAll('.reveal.in').length === 0) showAll();
    }, 2500);
  } else {
    showAll();
  }

  // ---------- Résumé button: shown only when the PDF exists ----------
  var resumes = document.querySelectorAll('[data-resume]');
  if (resumes.length && window.fetch && location.protocol.indexOf('http') === 0) {
    fetch(resumes[0].getAttribute('href'), { method: 'HEAD' }).then(function (r) {
      var type = r.headers.get('content-type') || '';
      if (r.ok && type.indexOf('pdf') !== -1) {
        for (var i = 0; i < resumes.length; i++) resumes[i].classList.add('is-ready');
      }
    }).catch(function () {});
  }

  // ---------- Contact form ----------
  // The address is put together only when needed, so simple bots that read
  // the page source do not find it.
  function emailAddress() {
    return ['prasidha', 'jagtap'].join('') + '@' + ['yahoo', 'com'].join('.');
  }

  var modal = document.getElementById('contact-modal');
  var form = document.getElementById('contact-form');
  var lastFocus = null;

  function openModal() {
    if (!modal) return;
    lastFocus = document.activeElement;
    modal.hidden = false;
    root.classList.add('modal-open');
    var first = form && form.querySelector('input[name="name"]');
    if (first) setTimeout(function () { first.focus(); }, 50);
  }
  function closeModal() {
    if (!modal) return;
    modal.hidden = true;
    root.classList.remove('modal-open');
    if (lastFocus && lastFocus.focus) lastFocus.focus();
  }

  var openers = document.querySelectorAll('[data-contact-open]');
  for (var k = 0; k < openers.length; k++) openers[k].addEventListener('click', openModal);
  var closers = document.querySelectorAll('[data-contact-close]');
  for (var m = 0; m < closers.length; m++) closers[m].addEventListener('click', closeModal);
  document.addEventListener('keydown', function (e) {
    if ((e.key === 'Escape' || e.keyCode === 27) && modal && !modal.hidden) closeModal();
  });

  if (form) {
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var name = form.elements.name.value.trim();
      var company = form.elements.company.value.trim();
      var topic = form.elements.topic.value;
      var message = form.elements.message.value.trim();
      var error = form.querySelector('.form-error');

      if (form.elements.website.value) return; // spam bot filled the hidden field
      if (!name || !message) {
        if (error) error.hidden = false;
        return;
      }
      if (error) error.hidden = true;

      var subject = topic + ' — from ' + name + (company ? ' (' + company + ')' : '');
      var body = 'Hi Prasidha,\r\n\r\n' + message + '\r\n\r\n' + name + (company ? '\r\n' + company : '') +
                 '\r\n\r\n—\r\nSent from the contact form on Prasidha\'s website';
      window.location.href = 'mailto:' + emailAddress() +
        '?subject=' + encodeURIComponent(subject) +
        '&body=' + encodeURIComponent(body);
    });
  }

  // Show / copy the address (for in-app browsers or devices with no email app)
  var copyBtn = document.querySelector('[data-email-copy]');
  var emailText = document.querySelector('[data-email-text]');
  function copyText(text, done) {
    if (navigator.clipboard && window.isSecureContext) {
      navigator.clipboard.writeText(text).then(function () { done(true); }, function () { done(false); });
      return;
    }
    try {
      var ta = document.createElement('textarea');
      ta.value = text;
      ta.setAttribute('readonly', '');
      ta.style.position = 'fixed';
      ta.style.opacity = '0';
      document.body.appendChild(ta);
      ta.select();
      var ok = document.execCommand('copy');
      document.body.removeChild(ta);
      done(ok);
    } catch (err) { done(false); }
  }
  if (copyBtn && emailText) {
    copyBtn.addEventListener('click', function () {
      var addr = emailAddress();
      emailText.textContent = addr;
      copyText(addr, function (ok) {
        copyBtn.textContent = ok ? 'Copied ✓' : 'Select & copy';
      });
    });
  }

  // ---------- Header: highlight the link for the section being read ----------
  if ('IntersectionObserver' in window) {
    var navLinks = document.querySelectorAll('#nav-links a[href^="#"]');
    var navMap = {};
    for (var nl = 0; nl < navLinks.length; nl++) navMap[navLinks[nl].getAttribute('href').slice(1)] = navLinks[nl];
    var navSpy = new IntersectionObserver(function (entries) {
      for (var i = 0; i < entries.length; i++) {
        if (!entries[i].isIntersecting) continue;
        for (var k in navMap) navMap[k].classList.remove('current');
        var hit = navMap[entries[i].target.id];
        if (hit) hit.classList.add('current');
      }
    }, { rootMargin: '-45% 0px -50% 0px' });
    for (var id in navMap) { var sec = document.getElementById(id); if (sec) navSpy.observe(sec); }
  }

  // ---------- Section rail on the right: milestones to jump to any heading ----------
  var rail = document.querySelector('[data-rail]');
  if (rail) {
    var railLinks = rail.querySelectorAll('a');
    var railIds = [];
    for (var rl = 0; rl < railLinks.length; rl++) railIds.push(railLinks[rl].getAttribute('href').slice(1));
    var setRail = function (id) {
      var idx = railIds.indexOf(id);
      if (idx < 0) return;
      for (var i = 0; i < railLinks.length; i++) {
        var li = railLinks[i].parentNode;
        if (i === idx) railLinks[i].setAttribute('aria-current', 'true'); else railLinks[i].removeAttribute('aria-current');
        if (i < idx) li.classList.add('passed'); else li.classList.remove('passed');
      }
    };
    var hero = document.querySelector('.hero');
    if ('IntersectionObserver' in window) {
      var railSpy = new IntersectionObserver(function (en) {
        for (var i = 0; i < en.length; i++) if (en[i].isIntersecting) setRail(en[i].target.id);
      }, { rootMargin: '-40% 0px -55% 0px' });
      for (var ri = 0; ri < railIds.length; ri++) { var rs = document.getElementById(railIds[ri]); if (rs) railSpy.observe(rs); }
      if (hero) {
        new IntersectionObserver(function (en) {
          var e = en[en.length - 1];
          if (!e.isIntersecting && e.boundingClientRect.top < 0) rail.classList.add('show');
          else { rail.classList.remove('show'); rail.classList.remove('open'); }
        }, { threshold: 0, rootMargin: '0px 0px -40% 0px' }).observe(hero);
      }
    } else {
      rail.classList.add('show');
    }
    // Touch screens have no hover: the first tap opens the labels, the next tap jumps
    var touchOnly = window.matchMedia && window.matchMedia('(hover: none)').matches;
    var railTimer = null;
    var closeRail = function () { rail.classList.remove('open'); };
    rail.addEventListener('click', function (e) {
      if (touchOnly && !rail.classList.contains('open')) {
        e.preventDefault(); e.stopPropagation();
        rail.classList.add('open');
        clearTimeout(railTimer); railTimer = setTimeout(closeRail, 5000);
        return;
      }
      clearTimeout(railTimer);
      setTimeout(closeRail, 250);
    }, true);
    document.addEventListener('click', function (e) { if (!rail.contains(e.target)) closeRail(); });
  }

  // ---------- Discourage casual copying: right-click, view-source shortcuts, image dragging ----------
  // (Right-click still works inside the contact form so people can paste.)
  var isField = function (el) { var t = el && el.tagName; return t === 'INPUT' || t === 'TEXTAREA' || t === 'SELECT'; };
  document.addEventListener('contextmenu', function (e) { if (!isField(e.target)) e.preventDefault(); });
  document.addEventListener('dragstart', function (e) { if (e.target && e.target.tagName === 'IMG') e.preventDefault(); });
  document.addEventListener('keydown', function (e) {
    var k = (e.key || '').toLowerCase();
    var code = e.code || '';
    if (code.indexOf('Key') === 0) k = code.slice(3).toLowerCase(); // physical key (Option changes e.key on Mac)
    var mod = e.ctrlKey || e.metaKey;
    if (k === 'f12' || e.keyCode === 123 ||
        (mod && (k === 'u' || k === 's')) ||                                   // view source / save page
        (mod && e.shiftKey && (k === 'i' || k === 'j' || k === 'c')) ||        // developer tools (Windows)
        (e.metaKey && e.altKey && (k === 'i' || k === 'j' || k === 'c' || k === 'u'))) { // developer tools (Mac)
      e.preventDefault();
    }
  });

  // ==========================================================
  // v14: stacked chapters, journey, rolling numbers, Cover Flow,
  //      skill tabs and the LinkedIn app prompt
  // ==========================================================
  var noMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  function closestAcc(el) { while (el && el !== document) { if (el.classList && el.classList.contains('acc')) return el; el = el.parentNode; } return null; }

  // ---------- Accordion (several chapters can be open at once) ----------
  function setAcc(acc, open) {
    if (!acc) return;
    var btn = acc.querySelector('.acc-btn');
    if (open) acc.classList.add('open'); else acc.classList.remove('open');
    if (btn) btn.setAttribute('aria-expanded', open ? 'true' : 'false');
  }
  var accBtns = document.querySelectorAll('.acc-btn');
  for (var ab = 0; ab < accBtns.length; ab++) {
    accBtns[ab].addEventListener('click', function () {
      var acc = closestAcc(this);
      var opening = !acc.classList.contains('open');
      setAcc(acc, opening);
      if (opening) rollIn(acc);
      var fl = acc.querySelectorAll('[data-coverflow]');
      for (var k = 0; k < fl.length; k++) if (fl[k].fitCards) fl[k].fitCards();
    });
  }
  // Menu links and #links open the chapter they point to
  function openForHash(hash) {
    if (!hash || hash.length < 2) return;
    var t = document.getElementById(hash.slice(1));
    var acc = closestAcc(t);
    if (acc && !acc.classList.contains('open')) setAcc(acc, true);
  }
  openForHash(location.hash);
  window.addEventListener('hashchange', function () { openForHash(location.hash); });
  var hashLinks = document.querySelectorAll('a[href^="#"]');
  for (var hl = 0; hl < hashLinks.length; hl++) {
    hashLinks[hl].addEventListener('click', function () { openForHash(this.getAttribute('href')); });
  }

  // ---------- "Know more" on the current role ----------
  var moreBtn = document.querySelector('[data-more]');
  if (moreBtn) {
    var morePanel = document.getElementById(moreBtn.getAttribute('aria-controls'));
    var moreLabel = moreBtn.querySelector('[data-more-label]');
    moreBtn.addEventListener('click', function () {
      var open = !morePanel.classList.contains('open');
      if (open) morePanel.classList.add('open'); else morePanel.classList.remove('open');
      moreBtn.setAttribute('aria-expanded', open ? 'true' : 'false');
      if (moreLabel) moreLabel.textContent = open ? 'Show less' : 'Know more';
    });
  }

  // ---------- Journey timeline fills when it comes into view ----------
  var journey = document.querySelector('[data-journey]');
  if (journey) {
    if (!('IntersectionObserver' in window) || noMotion) { journey.classList.add('run'); }
    else {
      var jo = new IntersectionObserver(function (en) {
        for (var i = 0; i < en.length; i++) if (en[i].isIntersecting) { journey.classList.add('run'); jo.disconnect(); }
      }, { threshold: 0.35 });
      jo.observe(journey);
    }
  }

  // ---------- Rolling numbers (bold figures count up on scroll) ----------
  var NUM_SEL = '.stat strong, .mini-stats strong, .result strong, .tab-proof strong';
  var numEls = document.querySelectorAll(NUM_SEL);
  var canRoll = !!window.requestAnimationFrame;
  function rollNumber(el) {
    if (!canRoll) return;
    var txt = el.getAttribute('data-final') || el.textContent;
    var m = txt.match(/\d[\d,]*(\.\d+)?/);
    if (!m) return;
    el.setAttribute('data-final', txt);
    var run = (+el.getAttribute('data-roll') || 0) + 1;   // a newer roll stops an older one
    el.setAttribute('data-roll', run);
    var pre = txt.slice(0, m.index), post = txt.slice(m.index + m[0].length);
    var target = parseFloat(m[0].replace(/,/g, ''));
    var decimals = m[1] ? m[1].length - 1 : 0, commas = m[0].indexOf(',') !== -1;
    var fmt = function (v) {
      var n = v.toFixed(decimals);
      if (commas) n = Number(n).toLocaleString('en-US', { minimumFractionDigits: decimals, maximumFractionDigits: decimals });
      return pre + n + post;
    };
    var start = null, dur = noMotion ? 500 : (target <= 10 ? 800 : 1600);
    var step = function (ts) {
      if (+el.getAttribute('data-roll') !== run) return;
      if (start === null) start = ts;
      var p = Math.min(1, (ts - start) / dur);
      var eased = 1 - Math.pow(1 - p, 3);
      el.textContent = p < 1 ? fmt(target * eased) : txt;
      if (p < 1) window.requestAnimationFrame(step);
    };
    window.requestAnimationFrame(step);
  }
  // Replay the numbers inside a box (used when a chapter opens or a skill tab is picked)
  function rollIn(box) {
    if (!box) return;
    var list = box.querySelectorAll(NUM_SEL);
    for (var r = 0; r < list.length; r++) rollNumber(list[r]);
  }
  if (numEls.length && 'IntersectionObserver' in window && canRoll) {
    var no = new IntersectionObserver(function (en) {
      for (var i = 0; i < en.length; i++) if (en[i].isIntersecting) { rollNumber(en[i].target); no.unobserve(en[i].target); }
    }, { threshold: 0.15 });
    for (var ne = 0; ne < numEls.length; ne++) if (/\d/.test(numEls[ne].textContent)) no.observe(numEls[ne]);
  }

  // ---------- Cover Flow (iPod style): Moments, Problems solved, Things I've made ----------
  function initCoverFlow(cf) {
    var items = cf.querySelectorAll('.cf-item');
    if (!items.length) return;
    var mode = cf.getAttribute('data-cf-mode') || 'photos';
    var cap = cf.querySelector('[data-cf-caption]');
    var dotsBox = cf.querySelector('[data-cf-dots]');
    var active = Math.floor((items.length - 1) / 2);            // start in the middle, like the iPod
    var dots = [];
    var go = function (i) { active = Math.max(0, Math.min(items.length - 1, i)); layout(); };
    for (var d = 0; d < items.length; d++) {
      if (dotsBox) {
        var dot = document.createElement('button');
        dot.type = 'button';
        dot.setAttribute('aria-label', 'Item ' + (d + 1) + ' of ' + items.length);
        (function (i) { dot.addEventListener('click', function () { go(i); }); })(d);
        dotsBox.appendChild(dot); dots.push(dot);
      }
      (function (i) {
        items[i].addEventListener('click', function (e) {
          if (i !== active) { e.preventDefault(); go(i); }   // side items: bring to front first
        });
      })(d);
    }
    var layout = function () {
      for (var i = 0; i < items.length; i++) {
        var off = i - active, abs = Math.abs(off), sign = off < 0 ? -1 : 1;
        var tx = abs ? sign * (58 + (abs - 1) * 14) : 0;          // tight stacks on both sides
        var tz = abs ? -170 - (abs - 1) * 30 : 0;
        var ry = abs ? -sign * 70 : 0;
        items[i].style.transform = 'translateX(calc(-50% + ' + tx + '%)) translateZ(' + tz + 'px) rotateY(' + ry + 'deg)';
        items[i].style.zIndex = String(100 - abs);
        items[i].style.opacity = abs > 5 ? '0' : '1';
        items[i].style.filter = abs ? 'brightness(' + Math.max(0.75, 0.92 - (abs - 1) * 0.06) + ')' : 'none';
        items[i].setAttribute('aria-hidden', abs ? 'true' : 'false');
        var focusables = items[i].querySelectorAll('a, button');
        for (var f = 0; f < focusables.length; f++) focusables[f].tabIndex = abs ? -1 : 0;
        if (dots[i]) dots[i].setAttribute('aria-current', i === active ? 'true' : 'false');
      }
      if (cap) {
        cap.textContent = '';
        if (mode === 'photos') {
          var fc = items[active].querySelector('figcaption');
          if (fc) { var clone = fc.cloneNode(true); while (clone.firstChild) cap.appendChild(clone.firstChild); }
        } else {
          cap.textContent = (active + 1) + ' of ' + items.length;
        }
      }
      var prevB = cf.querySelector('[data-cf-prev]'), nextB = cf.querySelector('[data-cf-next]');
      if (prevB) prevB.disabled = active === 0;
      if (nextB) nextB.disabled = active === items.length - 1;
    };
    var prev = cf.querySelector('[data-cf-prev]'), next = cf.querySelector('[data-cf-next]');
    if (prev) prev.addEventListener('click', function () { go(active - 1); });
    if (next) next.addEventListener('click', function () { go(active + 1); });
    cf.addEventListener('keydown', function (e) {
      if (e.key === 'ArrowLeft') { e.preventDefault(); go(active - 1); }
      if (e.key === 'ArrowRight') { e.preventDefault(); go(active + 1); }
    });
    var sx = null, sy = null;
    cf.addEventListener('pointerdown', function (e) { sx = e.clientX; sy = e.clientY; });
    cf.addEventListener('pointerup', function (e) {
      if (sx === null) return;
      var dx = e.clientX - sx, dy = e.clientY - sy; sx = null;
      if (Math.abs(dx) > 40 && Math.abs(dx) > Math.abs(dy)) go(active + (dx < 0 ? 1 : -1));
    });
    // Cards: make every card exactly as tall as the tallest text needs (no clipping, no extra gap)
    var stage = cf.querySelector('.cf-stage');
    var fit = function () {
      if (mode !== 'cards' || !stage) return;
      var max = 0, i;
      for (i = 0; i < items.length; i++) items[i].style.height = 'auto';
      for (i = 0; i < items.length; i++) max = Math.max(max, items[i].offsetHeight);
      if (!max) return;                                          // chapter still closed
      for (i = 0; i < items.length; i++) items[i].style.height = max + 'px';
      stage.style.height = (max + 12) + 'px';
    };
    var fitTimer = null;
    window.addEventListener('resize', function () { clearTimeout(fitTimer); fitTimer = setTimeout(fit, 150); });
    cf.fitCards = fit;
    cf.classList.add('cf-ready');
    fit();
    layout();
  }
  var flows = document.querySelectorAll('[data-coverflow]');
  for (var fl = 0; fl < flows.length; fl++) initCoverFlow(flows[fl]);

  // ---------- Curved card ring (AI & things I've made) ----------
  // Cards sit on the inside of a big cylinder: the front card is flat, side cards
  // curve towards you. Drag, swipe, arrows, dots or click a side card to turn it.
  function initRing(ring) {
    var stage = ring.querySelector('.ring-stage'), track = ring.querySelector('.ring-track');
    var cards = ring.querySelectorAll('.ring-card');
    if (!stage || !track || !cards.length) return;
    var n = cards.length, active = Math.floor((n - 1) / 2), step = 24, R = 700, GAP = 18;
    var cap = ring.querySelector('[data-ring-caption]'), dotsBox = ring.querySelector('[data-ring-dots]'), dots = [];
    var prevB = ring.querySelector('[data-ring-prev]'), nextB = ring.querySelector('[data-ring-next]');

    function turn(deg, animate) {
      track.style.transition = animate ? '' : 'none';
      track.style.transform = 'translateZ(' + R + 'px) rotateY(' + deg + 'deg)';
    }
    function measure() {
      var w = window.innerWidth, i, max = 0;
      step = w < 735 ? 40 : (w < 1024 ? 30 : 24);
      var cw = cards[0].offsetWidth || 280;
      R = Math.round((cw + GAP) / (2 * Math.tan(step * Math.PI / 360)));
      for (i = 0; i < n; i++) cards[i].style.height = 'auto';
      for (i = 0; i < n; i++) max = Math.max(max, cards[i].offsetHeight);
      for (i = 0; i < n; i++) {
        cards[i].style.height = max + 'px';
        cards[i].style.top = (-max / 2) + 'px';
        cards[i].style.transform = 'rotateY(' + (-i * step) + 'deg) translateZ(' + (-R) + 'px)';
      }
      // room for the nearer (slightly larger) side cards and the shadows
      var z2 = R * (1 - Math.cos((w < 735 ? 1 : 2) * step * Math.PI / 180));   // nearest cards still on screen
      stage.style.height = Math.round(max * 1800 / (1800 - Math.min(z2, 900)) + 60) + 'px';
    }
    function layout(animate) {
      turn(active * step, animate !== false);
      for (var i = 0; i < n; i++) {
        var off = Math.abs(i - active), front = off === 0;
        cards[i].style.opacity = off * step > 100 ? '0' : '1';
        cards[i].style.filter = front ? 'none' : 'brightness(' + Math.max(0.82, 0.95 - (off - 1) * 0.05) + ')';
        cards[i].setAttribute('aria-hidden', front ? 'false' : 'true');
        if (front) cards[i].classList.add('is-front'); else cards[i].classList.remove('is-front');
        var focusables = cards[i].querySelectorAll('a, button');
        for (var f = 0; f < focusables.length; f++) focusables[f].tabIndex = front ? 0 : -1;
        if (dots[i]) dots[i].setAttribute('aria-current', front ? 'true' : 'false');
      }
      if (cap) cap.textContent = (active + 1) + ' of ' + n;
      if (prevB) prevB.disabled = active === 0;
      if (nextB) nextB.disabled = active === n - 1;
    }
    function go(i) { active = Math.max(0, Math.min(n - 1, i)); layout(true); }

    for (var d = 0; d < n; d++) {
      if (dotsBox) {
        var dot = document.createElement('button');
        dot.type = 'button';
        dot.setAttribute('aria-label', 'Card ' + (d + 1) + ' of ' + n);
        (function (i) { dot.addEventListener('click', function () { go(i); }); })(d);
        dotsBox.appendChild(dot); dots.push(dot);
      }
      (function (i) {
        cards[i].addEventListener('click', function (e) { if (i !== active) { e.preventDefault(); go(i); } });
      })(d);
    }
    if (prevB) prevB.addEventListener('click', function () { go(active - 1); });
    if (nextB) nextB.addEventListener('click', function () { go(active + 1); });
    ring.addEventListener('keydown', function (e) {
      if (e.key === 'ArrowLeft') { e.preventDefault(); go(active - 1); }
      if (e.key === 'ArrowRight') { e.preventDefault(); go(active + 1); }
    });

    // Drag (mouse) or swipe (touch): the ring follows the finger, then settles on a card
    var startX = null, startDeg = 0, moved = false;
    function degFor(dx) {
      var deg = startDeg - dx / (R * Math.PI / 180);
      return Math.max(-step * 0.6, Math.min((n - 1 + 0.6) * step, deg));
    }
    stage.addEventListener('pointerdown', function (e) {
      if (e.button > 0) return;
      startX = e.clientX; startDeg = active * step; moved = false;
    });
    window.addEventListener('pointermove', function (e) {
      if (startX === null) return;
      var dx = e.clientX - startX;
      if (!moved && Math.abs(dx) < 8) return;
      moved = true; ring.classList.add('dragging');
      turn(degFor(dx), false);
    });
    function endDrag(e) {
      if (startX === null) return;
      var dx = (e && e.clientX != null ? e.clientX : startX) - startX;
      startX = null; ring.classList.remove('dragging');
      if (moved) go(Math.round(degFor(dx) / step));
    }
    window.addEventListener('pointerup', endDrag);
    window.addEventListener('pointercancel', function () { if (startX !== null) { startX = null; ring.classList.remove('dragging'); layout(true); } });
    stage.addEventListener('click', function (e) { if (moved) { e.preventDefault(); e.stopPropagation(); moved = false; } }, true);

    var t = null;
    window.addEventListener('resize', function () { clearTimeout(t); t = setTimeout(function () { measure(); layout(false); }, 150); });
    window.addEventListener('load', function () { measure(); layout(false); });
    ring.classList.add('ring-ready');
    measure();
    layout(false);
  }
  var rings = document.querySelectorAll('[data-ring]');
  for (var rg = 0; rg < rings.length; rg++) initRing(rings[rg]);

  // ---------- Skills tabs ----------
  var tabsWrap = document.querySelector('[data-tabs]');
  if (tabsWrap) {
    var tabs = tabsWrap.querySelectorAll('[role="tab"]');
    var selectTab = function (tab, focus) {
      for (var i = 0; i < tabs.length; i++) {
        var on = tabs[i] === tab;
        tabs[i].setAttribute('aria-selected', on ? 'true' : 'false');
        tabs[i].tabIndex = on ? 0 : -1;
        var panel = document.getElementById(tabs[i].getAttribute('aria-controls'));
        if (panel) panel.hidden = !on;
        if (panel && on) rollIn(panel);
      }
      if (focus) tab.focus();
      if (tab.scrollIntoView) { try { tab.scrollIntoView({ block: 'nearest', inline: 'center', behavior: noMotion ? 'auto' : 'smooth' }); } catch (e) {} }
    };
    for (var tb = 0; tb < tabs.length; tb++) {
      tabs[tb].addEventListener('click', function () { selectTab(this, false); });
      tabs[tb].addEventListener('keydown', function (e) {
        var i = Array.prototype.indexOf.call(tabs, this), n = null;
        if (e.key === 'ArrowRight') n = (i + 1) % tabs.length;
        if (e.key === 'ArrowLeft') n = (i - 1 + tabs.length) % tabs.length;
        if (e.key === 'Home') n = 0;
        if (e.key === 'End') n = tabs.length - 1;
        if (n !== null) { e.preventDefault(); selectTab(tabs[n], true); }
      });
    }
  }

  // ---------- LinkedIn: ask first, then open the app where possible ----------
  var LI_WEB = 'https://www.linkedin.com/in/prasidhajagtap';
  var liModal = document.getElementById('li-modal');
  var ua = navigator.userAgent || '';
  var isAndroid = /Android/i.test(ua);
  var isIOS = /iPhone|iPad|iPod/i.test(ua) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
  var liLast = null;
  function liOpen() {
    if (!liModal) return false;
    liLast = document.activeElement;
    var note = liModal.querySelector('[data-li-note]');
    var appBtn = liModal.querySelector('[data-li-app]');
    var webBtn = liModal.querySelector('[data-li-web]');
    if (isAndroid || isIOS) {
      note.textContent = 'View Prasidha’s profile in the LinkedIn app. If the app isn’t installed, the profile opens in your browser.';
      appBtn.textContent = 'Open LinkedIn app'; webBtn.hidden = false;
    } else {
      note.textContent = 'This opens Prasidha’s LinkedIn profile in a new tab.';
      appBtn.textContent = 'Open LinkedIn'; webBtn.hidden = true;
    }
    liModal.hidden = false;
    root.classList.add('modal-open');
    setTimeout(function () { appBtn.focus(); }, 50);
    return true;
  }
  function liClose() {
    if (!liModal || liModal.hidden) return;
    liModal.hidden = true;
    root.classList.remove('modal-open');
    if (liLast && liLast.focus) liLast.focus();
  }
  function liApp() {
    liClose();
    if (isAndroid) {
      window.location.href = 'intent://www.linkedin.com/in/prasidhajagtap/#Intent;scheme=https;package=com.linkedin.android;S.browser_fallback_url=' + encodeURIComponent(LI_WEB) + ';end';
    } else if (isIOS) {
      window.location.href = LI_WEB;               // iOS hands LinkedIn links to the app when it is installed
    } else {
      window.open(LI_WEB, '_blank', 'noopener,noreferrer');
    }
  }
  var liLinks = document.querySelectorAll('[data-linkedin]');
  for (var ll = 0; ll < liLinks.length; ll++) {
    liLinks[ll].addEventListener('click', function (e) { if (liOpen()) e.preventDefault(); });
  }
  if (liModal) {
    liModal.querySelector('[data-li-app]').addEventListener('click', liApp);
    liModal.querySelector('[data-li-web]').addEventListener('click', function () { liClose(); window.open(LI_WEB, '_blank', 'noopener,noreferrer'); });
    var liCloses = liModal.querySelectorAll('[data-li-close]');
    for (var lc = 0; lc < liCloses.length; lc++) liCloses[lc].addEventListener('click', liClose);
    document.addEventListener('keydown', function (e) { if ((e.key === 'Escape' || e.keyCode === 27)) liClose(); });
  }
})();

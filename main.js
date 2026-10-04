/*!
 * Prasidha Jagtap — personal website
 * Designed & developed by Prasidha Jagtap · https://prasidhajagtap.github.io/prasidha_jagtap/
 * © 2026 Prasidha Jagtap. All rights reserved. Not licensed for reuse.
 */
// Written in plain, widely supported JavaScript so it runs in all modern
// browsers and in-app browsers (LinkedIn, WhatsApp, Instagram, Gmail).
(function () {
  var root = document.documentElement;

  // ---------- Talking to the database (visits, votes, feedback, enquiry clicks) ----------
  // Each call answers 'ok' or 'limit'. 'limit' means this network has sent far too many
  // today (the database's spam guard), so the visitor is asked to stop.
  var api = window.SITE_COUNTER || {};
  function callApi(fn, body) {
    if (!api.url || !api.anonKey || navigator.webdriver || !window.fetch) return;
    try {
      fetch(api.url.replace(/\/$/, '') + '/rest/v1/rpc/' + fn, {
        method: 'POST', keepalive: true,
        headers: { 'apikey': api.anonKey, 'Authorization': 'Bearer ' + api.anonKey, 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      }).then(function (r) { return r.ok ? r.json() : null; })
        .then(function (res) { if (res === 'limit') stopSpam(); })
        .catch(function () {});
    } catch (e) {}
  }

  // "Too many requests" message. OK, Esc, or a tap anywhere on a touch screen tries to
  // close the tab; browsers only allow that for some tabs, so if it stays open the page
  // is replaced by a plain "please close this tab" screen.
  var spamShown = false;
  function stopSpam() {
    if (spamShown) return;
    spamShown = true;
    var open = document.querySelectorAll('.modal, .fb-sheet');
    for (var i = 0; i < open.length; i++) open[i].hidden = true;
    var box = document.createElement('div');
    box.className = 'spam-stop';
    box.setAttribute('role', 'alertdialog'); box.setAttribute('aria-modal', 'true');
    box.setAttribute('aria-labelledby', 'spam-title'); box.setAttribute('aria-describedby', 'spam-text');
    var card = document.createElement('div'); card.className = 'spam-card';
    var light = document.createElement('div'); light.className = 'spam-light'; light.setAttribute('aria-hidden', 'true'); light.textContent = '🚦';
    var h = document.createElement('h2'); h.id = 'spam-title'; h.textContent = 'Whoa, speedy fingers!';
    var p = document.createElement('p'); p.id = 'spam-text';
    p.textContent = 'You’ve sent a lot today. Please take a break and close this tab. You’re welcome back tomorrow.';
    var ok = document.createElement('button'); ok.type = 'button'; ok.className = 'btn btn-solid btn-3d'; ok.textContent = 'OK';
    card.appendChild(light); card.appendChild(h); card.appendChild(p); card.appendChild(ok);
    box.appendChild(card); document.body.appendChild(box);
    root.classList.add('modal-open');
    ok.focus();
    function leave() {
      try { window.close(); } catch (e) {}
      setTimeout(function () {                                         // still open: the browser said no
        document.body.textContent = '';
        document.body.className = 'spam-closed';
        var msg = document.createElement('p'); msg.textContent = '🚦 Please close this tab.';
        document.body.appendChild(msg);
      }, 300);
    }
    ok.addEventListener('click', leave);
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape') leave(); });
    box.addEventListener('pointerup', function (e) { if (e.pointerType !== 'mouse') leave(); });
  }
  // Signature for anyone who opens the developer console
  try {
    if (window.console && console.log) console.log('%cDesigned & developed by Prasidha Jagtap%c\n© ' + new Date().getFullYear() + ' Prasidha Jagtap. All rights reserved.\nhttps://prasidhajagtap.github.io/prasidha_jagtap/',
      'font: 600 15px -apple-system, Segoe UI, sans-serif; color: #1d1d1f; padding: 6px 0;', 'font: 12px -apple-system, Segoe UI, sans-serif; color: #6e6e73;');
  } catch (e) {}
  // Normally theme-init.js sets this; if that small file failed to load, set it here so the layout still works
  if (!/(^|\s)js(\s|$)/.test(root.className)) root.className += ' js';

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
    // Tap or click anywhere outside the menu closes it; so does Esc
    document.addEventListener('click', function (e) {
      if (nav.classList.contains('open') && !nav.contains(e.target)) setMenu(false);
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && nav.classList.contains('open')) { setMenu(false); menuBtn.focus(); }
    });
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

  // ---------- "Want a website of your own?": a ready-made enquiry, one tap to send ----------
  var build = document.getElementById('build-modal');
  if (build) {
    var B_SUBJECT = 'Enquiry: a website like yours';
    var B_BODY = 'Hello Prasidha,\n\nI saw your website and I would like to build a similar website.\n\n' +
                 'Please get back to me to discuss the details.\n\nKind regards,';
    var bLast = null, enc = encodeURIComponent, counted = {};
    // Count interest for the admin page: "open" and "send", once each per page load.
    // The owner's own browsers and automated browsers are not counted.
    function tally(step) {
      if (counted[step]) return;
      counted[step] = true;
      try { if (localStorage.getItem('pj_owner') === '1') return; } catch (e) {}
      callApi('record_build', { step: step });
    }
    build.querySelector('[data-build-subject]').textContent = B_SUBJECT;
    build.querySelector('[data-build-body]').textContent = B_BODY;
    var crlf = B_BODY.replace(/\n/g, '\r\n');
    var bLinks = build.querySelectorAll('[data-build-web]');
    function openBuild() {
      bLast = document.activeElement;
      // Web-mail links get the address only now, so it is never in the page source
      tally('open');
      for (var i = 0; i < bLinks.length; i++) {
        bLinks[i].href = bLinks[i].getAttribute('data-build-web') === 'gmail'
          ? 'https://mail.google.com/mail/u/0/?tf=cm&to=' + enc(emailAddress()) + '&su=' + enc(B_SUBJECT) + '&body=' + enc(B_BODY)
          : 'https://outlook.live.com/mail/0/deeplink/compose?to=' + enc(emailAddress()) + '&subject=' + enc(B_SUBJECT) + '&body=' + enc(B_BODY);
      }
      build.hidden = false; root.classList.add('modal-open');
      var s = build.querySelector('[data-build-send]'); setTimeout(function () { s.focus(); }, 50);
    }
    function closeBuild() {
      build.hidden = true; root.classList.remove('modal-open');
      if (bLast && bLast.focus) bLast.focus();
    }
    var bo = document.querySelectorAll('[data-build-open]');
    for (var bi = 0; bi < bo.length; bi++) bo[bi].addEventListener('click', openBuild);
    var bc = build.querySelectorAll('[data-build-close]');
    for (var bj = 0; bj < bc.length; bj++) bc[bj].addEventListener('click', closeBuild);
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && !build.hidden) closeBuild(); });
    for (var bk = 0; bk < bLinks.length; bk++) bLinks[bk].addEventListener('click', function () { tally('send'); });
    build.querySelector('[data-build-send]').addEventListener('click', function () {
      tally('send');
      window.location.href = 'mailto:' + emailAddress() + '?subject=' + enc(B_SUBJECT) + '&body=' + enc(crlf);
    });
  }

  // ---------- Every window sits in the middle of what is visible, above the keyboard ----------
  // Phones shrink the *visible* area when the keyboard opens (iPhone and newer Android
  // only shrink this "visual viewport", older Android resizes the whole page). Each open
  // window is fitted to that visible area, so its card stays centred above the keyboard,
  // and a focused field is scrolled into the middle of the card.
  var vv = window.visualViewport;
  function fitDialogs() {
    var open = document.querySelectorAll('.modal:not([hidden]), .fb-sheet:not([hidden])');
    var h = vv ? vv.height : window.innerHeight;
    for (var i = 0; i < open.length; i++) {
      open[i].classList.toggle('is-tight', h < 480);                 // little room (keyboard open): compact layout
      if (vv) { open[i].style.top = vv.offsetTop + 'px'; open[i].style.height = vv.height + 'px'; open[i].style.bottom = 'auto'; }
      else { open[i].style.top = ''; open[i].style.height = ''; open[i].style.bottom = ''; }
    }
  }
  if (vv) { vv.addEventListener('resize', fitDialogs); vv.addEventListener('scroll', fitDialogs); }
  window.addEventListener('resize', fitDialogs);
  new MutationObserver(fitDialogs).observe(root, { attributes: true, attributeFilter: ['class'] });   // a window opened or closed
  document.addEventListener('focusin', function (e) {
    var el = e.target;
    if (!el || !/^(INPUT|TEXTAREA|SELECT)$/.test(el.tagName) || !el.closest || !el.closest('.modal, .fb-sheet')) return;
    setTimeout(function () { fitDialogs(); try { el.scrollIntoView({ block: 'center', behavior: 'auto' }); } catch (x) { el.scrollIntoView(false); } }, 320);   // after the keyboard has opened
  });

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

  // ---------- Bookmarks tab: jump back to any heading already passed ----------
  // Opens only on click / tap (never on hover), so it can't get in the way.
  var marks = document.querySelector('[data-marks]');
  if (marks) {
    var marksBtn = marks.querySelector('[data-marks-btn]');
    var marksPanel = marks.querySelector('.marks-panel');
    var markLinks = marksPanel.querySelectorAll('a');
    var markSecs = [];
    for (var mk = 0; mk < markLinks.length; mk++) markSecs.push(document.getElementById(markLinks[mk].getAttribute('href').slice(1)));
    var setMarksOpen = function (open, focusBtn) {
      marksPanel.hidden = !open;
      marksBtn.setAttribute('aria-expanded', open ? 'true' : 'false');
      if (open) marks.classList.add('open'); else marks.classList.remove('open');
      if (!open && focusBtn) marksBtn.focus();
    };
    var updateMarks = function () {
      var line = window.innerHeight * 0.4, last = -1;
      for (var i = 0; i < markSecs.length; i++) {
        var passed = !!markSecs[i] && markSecs[i].getBoundingClientRect().top < line;
        markLinks[i].parentNode.hidden = !passed;
        if (passed) last = i;
      }
      for (var j = 0; j < markLinks.length; j++) {
        if (j === last) markLinks[j].setAttribute('aria-current', 'true'); else markLinks[j].removeAttribute('aria-current');
      }
      if (last >= 0) marks.classList.add('show');
      else { marks.classList.remove('show'); setMarksOpen(false); }
    };
    var marksTick = false;
    window.addEventListener('scroll', function () {
      if (!marksTick) { marksTick = true; (window.requestAnimationFrame || setTimeout)(function () { marksTick = false; updateMarks(); }); }
    }, { passive: true });
    window.addEventListener('resize', updateMarks);
    marksBtn.addEventListener('click', function () { updateMarks(); setMarksOpen(marksPanel.hidden); });
    for (var ml = 0; ml < markLinks.length; ml++) markLinks[ml].addEventListener('click', function () { setMarksOpen(false); });
    document.addEventListener('click', function (e) { if (!marksPanel.hidden && !marks.contains(e.target)) setMarksOpen(false); });
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && !marksPanel.hidden) setMarksOpen(false, true); });
    updateMarks();
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
  // Chapters, journey, rolling numbers, carousels and skill tabs
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
  var NUM_SEL = '.stat strong, .mini-stats strong, .result strong';
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

  // ---------- Carousels play by themselves ----------
  // Starts 0.5 s after a carousel comes into view, then moves on every 2 s and wraps
  // round. Holds while the pointer, a finger or keyboard focus is on it, while the tab is
  // hidden or a window is open, and never runs for people who ask for less motion.
  // The pause / play button lets anyone stop it (WCAG 2.2.2).
  var SVGNS = 'http://www.w3.org/2000/svg';
  function svgIcon(cls, d) {
    var s = document.createElementNS(SVGNS, 'svg'); s.setAttribute('viewBox', '0 0 24 24'); s.setAttribute('aria-hidden', 'true'); s.setAttribute('class', cls);
    var p = document.createElementNS(SVGNS, 'path'); p.setAttribute('d', d); s.appendChild(p); return s;
  }
  var EVERY = 2000;                                              // time on each slide
  function autoplay(box, next) {
    if (!('IntersectionObserver' in window)) return;
    var stopped = noMotion, inView = false, held = false, timer = null;
    var btn = document.createElement('button');
    btn.type = 'button'; btn.className = 'icon-btn cf-play';
    btn.appendChild(svgIcon('i-pause', 'M8 5h3v14H8zM13 5h3v14h-3z'));
    btn.appendChild(svgIcon('i-play', 'M8 5l11 7-11 7z'));
    var controls = box.querySelector('.cf-controls');
    if (controls) controls.appendChild(btn);
    function paint() {
      btn.setAttribute('aria-label', stopped ? 'Play slideshow' : 'Pause slideshow');
      btn.setAttribute('aria-pressed', stopped ? 'false' : 'true');
      box.classList.toggle('is-stopped', stopped);
    }
    function blocked() { return held || document.hidden || root.classList.contains('modal-open'); }
    function plan(wait) {
      clearTimeout(timer);
      if (stopped || !inView) return;
      timer = setTimeout(function tick() {
        if (!blocked()) next();
        timer = setTimeout(tick, EVERY);
      }, wait);
    }
    btn.addEventListener('click', function (e) { e.stopPropagation(); stopped = !stopped; paint(); plan(EVERY); });
    new IntersectionObserver(function (en) {
      var v = en[en.length - 1].isIntersecting;
      if (v && !inView) { inView = true; plan(500); } else if (!v) { inView = false; clearTimeout(timer); }
    }, { threshold: 0.5 }).observe(box);
    box.addEventListener('pointerenter', function (e) { if (e.pointerType === 'mouse') held = true; });
    box.addEventListener('pointerleave', function (e) { if (e.pointerType === 'mouse') { held = false; plan(EVERY); } });
    box.addEventListener('pointerdown', function () { held = true; });
    box.addEventListener('pointerup', function (e) { if (e.pointerType !== 'mouse') { held = false; plan(EVERY); } });
    box.addEventListener('pointercancel', function () { held = false; plan(EVERY); });
    box.addEventListener('focusin', function () { held = true; });
    box.addEventListener('focusout', function (e) { if (!box.contains(e.relatedTarget)) { held = false; plan(EVERY); } });
    paint();
  }

  // ---------- Cover Flow (iPod style): Problems solved, Moments ----------
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
    autoplay(cf, function () { go(active >= items.length - 1 ? 0 : active + 1); });
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
    autoplay(ring, function () { go(active >= n - 1 ? 0 : active + 1); });
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

  // ---------- Visit counter (Supabase; off until site-config.js is filled in) ----------
  // Every page open counts. Each browser gets a random ID (nothing personal) so
  // unique and returning visitors can be told apart; a "visit" is a browser
  // session (new tab session or 30 minutes idle). Browsers where the owner has
  // opened the admin panel are counted separately. Automated browsers are skipped.
  (function () {
    if (!api.url || !api.anonKey || navigator.webdriver || !window.fetch) return;
    var vid = null, newVisit = true, own = false, now = Date.now();
    try {
      vid = localStorage.getItem('pj_vid');
      if (!vid || !/^[A-Za-z0-9-]{16,64}$/.test(vid)) {
        var r = new Uint8Array(16); (window.crypto || window.msCrypto).getRandomValues(r);
        vid = Array.prototype.map.call(r, function (x) { return ('0' + x.toString(16)).slice(-2); }).join('');
        localStorage.setItem('pj_vid', vid);
      }
      var last = Number(localStorage.getItem('pj_last') || 0);
      newVisit = !sessionStorage.getItem('pj_sid') || now - last > 30 * 60 * 1000;
      if (newVisit) sessionStorage.setItem('pj_sid', String(now));
      localStorage.setItem('pj_last', String(now));
      own = localStorage.getItem('pj_owner') === '1';
    } catch (e) { return; }
    callApi('record_visit', { vid: vid, new_visit: newVisit, own: own });
  })();

  // ---------- Feedback: one quiet question at "Let's talk", then 3–4 quick taps ----------
  // Duolingo-style: a progress bar, one question at a time, cheerful nudges and a small
  // celebration at the end. No Continue button: picking an answer moves on by itself.
  (function () {
    var ask = document.querySelector('[data-fb-ask]'), sheet = document.getElementById('fb-sheet');
    var contact = document.getElementById('contact');
    if (!ask || !sheet || !contact) return;
    if (!(api.url && api.anonKey) && !api.demo) return;   // nothing to send to: stay hidden
    var seen = null;
    try { seen = localStorage.getItem('pj_fb'); } catch (e) {}
    if (seen) return;                                 // asked once per device
    function remember(v) { try { localStorage.setItem('pj_fb', v); } catch (e) {} }
    // A soft "tick" on each tap and a gentle two-note chime at the end. Made by the
    // browser (Web Audio): no sound file, very quiet, and only ever after a tap.
    var actx = null;
    function tone(freq, start, len, vol) {
      var t = actx.currentTime + start, o = actx.createOscillator(), g = actx.createGain();
      o.type = 'sine'; o.frequency.setValueAtTime(freq, t);
      g.gain.setValueAtTime(0.0001, t);
      g.gain.exponentialRampToValueAtTime(vol, t + 0.008);
      g.gain.exponentialRampToValueAtTime(0.0001, t + len);
      o.connect(g); g.connect(actx.destination);
      o.start(t); o.stop(t + len + 0.02);
    }
    function sound(kind) {
      try {
        var AC = window.AudioContext || window.webkitAudioContext;
        if (!AC) return;
        if (!actx) actx = new AC();
        if (actx.state === 'suspended' && actx.resume) actx.resume();
        if (kind === 'done') { tone(880, 0, 0.18, 0.05); tone(1320, 0.11, 0.26, 0.05); }
        else tone(1200, 0, 0.07, 0.045);
      } catch (e) {}
    }
    var WHO = { key: 'who', q: 'Who’s visiting today?', type: 'chips', opts: [['recruiter', 'Recruiter / HR'], ['manager', 'Hiring manager'], ['peer', 'Colleague / peer'], ['friend', 'Friend or family'], ['exploring', 'Just exploring']] };
    var FLOWS = {
      up: [
        { key: 'stood_out', q: 'Nice! What stood out most?', type: 'chips', opts: [['experience', 'Experience & impact'], ['problems', 'Problems solved'], ['ai', 'AI & things built'], ['design', 'Design & feel'], ['skills', 'Skills']] },
        WHO,
        { key: 'intent', q: 'Would you like to connect?', type: 'chips', opts: [['yes', 'Yes, let’s talk'], ['later', 'Maybe later'], ['browsing', 'Just browsing']] },
        { key: 'note', q: 'Anything you’d add?', type: 'note', ph: 'A line of feedback (optional)' }
      ],
      down: [
        { key: 'reason', q: 'Thanks for being honest! What would make it better?', type: 'chips', opts: [['long', 'Shorter and quicker to read'], ['hard_to_find', 'Easier to find things'], ['design', 'A fresher look'], ['not_relevant', 'More about my field'], ['broken', 'A fix — something didn’t work'], ['other', 'Something else']] },
        { key: 'improve', q: 'Great tip! Where should I start?', type: 'chips', opts: [['content', 'The content'], ['design', 'The design'], ['speed', 'Loading speed'], ['phone', 'The phone view'], ['clarity', 'Clearer wording']] },
        WHO,
        { key: 'note', q: 'How could it be better?', type: 'note', ph: 'Tell me in a line (optional)' }
      ]
    };
    var CHEER = ['Just 3 quick taps ✨', 'Nice! 2 more to go', 'Last tap!', 'Optional — add a line or skip'];
    var vote = null, steps = [], at = 0, answers = {}, finished = false, moving = false;
    var $ = function (s) { return sheet.querySelector(s); };
    var stage = $('[data-fb-stage]'), prog = $('[data-fb-progress]'), cheer = $('[data-fb-cheer]');
    var nextB = $('[data-fb-next]'), foot = $('[data-fb-foot]');
    var lastFocus = null;

    // Show the question only once "Let's talk" is properly in view
    if ('IntersectionObserver' in window) {
      var io = new IntersectionObserver(function (en) {
        if (en[en.length - 1].isIntersecting) { ask.hidden = false; requestAnimationFrame(function () { ask.classList.add('in'); }); io.disconnect(); }
      }, { threshold: 0.35 });
      io.observe(contact);
    } else { ask.hidden = false; ask.classList.add('in'); }

    var thumbs = ask.querySelectorAll('[data-vote]');
    for (var t = 0; t < thumbs.length; t++) thumbs[t].addEventListener('click', function () {
      vote = this.getAttribute('data-vote');
      sound('tick');
      callApi('record_vote', { vote: vote });
      remember('voted');
      this.classList.add('picked');
      ask.querySelector('[data-fb-ask-text]').textContent = vote === 'up' ? 'Thank you! ❤️' : 'Thanks — noted.';
      for (var j = 0; j < thumbs.length; j++) thumbs[j].disabled = true;
      setTimeout(open, 450);
    });

    function open() {
      steps = FLOWS[vote]; at = 0; answers = {}; finished = false; moving = false;
      prog.textContent = '';
      for (var i = 0; i < steps.length; i++) prog.appendChild(document.createElement('span'));
      lastFocus = document.activeElement;
      sheet.hidden = false; root.classList.add('modal-open');
      requestAnimationFrame(function () { sheet.classList.add('in'); });
      render(1);
    }
    function close() {
      sheet.classList.remove('in'); root.classList.remove('modal-open');
      setTimeout(function () { sheet.hidden = true; }, 250);
      ask.classList.add('done');
      if (lastFocus && lastFocus.focus) lastFocus.focus();
    }
    function bar() {
      var segs = prog.children;
      for (var i = 0; i < segs.length; i++) segs[i].className = i < at ? 'full' : (i === at ? 'now' : '');
    }
    function render(dir) {
      var st = steps[at];
      bar(); cheer.textContent = CHEER[Math.min(at, CHEER.length - 1)];
      var panel = document.createElement('div');
      panel.className = 'fb-panel ' + (dir < 0 ? 'from-left' : 'from-right');
      var h = document.createElement('h2'); h.className = 'fb-q'; h.id = 'fb-title'; h.textContent = st.q; panel.appendChild(h);
      var old = stage.querySelector('.fb-panel');
      if (old) { old.removeAttribute('id'); var oh = old.querySelector('#fb-title'); if (oh) oh.removeAttribute('id'); old.className = 'fb-panel ' + (dir < 0 ? 'to-right' : 'to-left'); setTimeout(function () { if (old.parentNode) old.parentNode.removeChild(old); }, 240); }
      if (st.type === 'chips') {
        var grp = document.createElement('div'); grp.className = 'fb-chips'; grp.setAttribute('role', 'radiogroup'); grp.setAttribute('aria-labelledby', 'fb-title');
        st.opts.forEach(function (o) {
          var b = document.createElement('button'); b.type = 'button'; b.className = 'fb-chip'; b.setAttribute('role', 'radio');
          b.setAttribute('aria-checked', answers[st.key] === o[0] ? 'true' : 'false'); b.textContent = o[1];
          b.addEventListener('click', function () {
            if (moving) return;
            sound('tick');
            answers[st.key] = o[0];
            var all = grp.querySelectorAll('.fb-chip');
            for (var i = 0; i < all.length; i++) all[i].setAttribute('aria-checked', all[i] === b ? 'true' : 'false');
            next();
          });
          grp.appendChild(b);
        });
        panel.appendChild(grp);
      } else {
        var ta = document.createElement('textarea'); ta.className = 'fb-note'; ta.maxLength = 300; ta.rows = 3; ta.placeholder = st.ph; ta.setAttribute('aria-labelledby', 'fb-title');
        ta.value = answers.note || '';
        var cnt = document.createElement('span'); cnt.className = 'fb-count'; cnt.textContent = ta.value.length + ' / 300';
        ta.addEventListener('input', function () { answers.note = ta.value; cnt.textContent = ta.value.length + ' / 300'; noteLabel(); });
        panel.appendChild(ta); panel.appendChild(cnt);
      }
      stage.appendChild(panel);
      // Only the last, optional step has a button: "Skip" when empty, "Send" once typed
      foot.hidden = st.type !== 'note';
      if (st.type === 'note') noteLabel();
      setTimeout(function () { moving = false; var f = panel.querySelector('.fb-chip, textarea'); if (f && f.focus) f.focus({ preventScroll: true }); }, 60);
    }
    function noteLabel() { nextB.textContent = (answers.note || '').trim() ? 'Send' : 'Skip'; }
    // Short pause so the tapped answer visibly lights up, then slide on
    function next() {
      if (moving || finished) return;
      moving = true;
      setTimeout(function () { if (at < steps.length - 1) { at++; render(1); } else finish(); }, 160);
    }
    function finish() {
      finished = true; at = steps.length; bar(); cheer.textContent = '';
      sound('done');
      var a = {}; for (var k in answers) if (k !== 'note' && answers.hasOwnProperty(k)) a[k] = answers[k];
      callApi('submit_feedback', { vote: vote, answers: a, note: (answers.note || '').trim().slice(0, 300) || null });
      remember('done');
      var old = stage.querySelector('.fb-panel'); if (old) old.className = 'fb-panel to-left';
      setTimeout(function () { if (old && old.parentNode) old.parentNode.removeChild(old); }, 240);
      var done = document.createElement('div'); done.className = 'fb-panel fb-done from-right';
      var tick = document.createElement('div'); tick.className = 'fb-tick'; tick.setAttribute('aria-hidden', 'true');
      var h = document.createElement('h2'); h.className = 'fb-q'; h.id = 'fb-title';
      h.textContent = vote === 'up' ? 'Thank you! 🎉' : 'Thank you 🙏';
      var p = document.createElement('p'); p.className = 'fb-sub';
      p.textContent = vote === 'up' ? 'Your feedback just made my day.' : 'Honest feedback helps me make this better.';
      done.appendChild(tick); done.appendChild(h); done.appendChild(p);
      stage.appendChild(done);
      foot.hidden = false;
      nextB.textContent = 'Done';
      moving = false;
    }
    nextB.addEventListener('click', function () {
      if (finished) { close(); return; }
      if (!(answers.note || '').trim()) answers.note = '';
      finish();
    });

    // Tap anywhere outside the card (or press Esc) to leave: the window closes at once and
    // only the 👍 / 👎 vote is kept; answers are sent only when the flow is finished.
    sheet.querySelector('[data-fb-close]').addEventListener('click', close);
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && !sheet.hidden) close(); });
  })();
})();

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
  var themeBtn = document.querySelector('[data-theme-toggle]');
  var themeMeta = document.querySelector('meta[name="theme-color"]');
  function isDark() { return root.getAttribute('data-theme') === 'dark'; }
  function applyTheme(dark) {
    if (dark) root.setAttribute('data-theme', 'dark'); else root.removeAttribute('data-theme');
    if (themeBtn) themeBtn.setAttribute('aria-label', dark ? 'Switch to light mode' : 'Switch to dark mode');
    if (themeMeta) themeMeta.setAttribute('content', dark ? '#000000' : '#ffffff');
  }
  applyTheme(isDark());
  if (themeBtn) {
    themeBtn.addEventListener('click', function () {
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
  var resume = document.querySelector('[data-resume]');
  if (resume && window.fetch && location.protocol.indexOf('http') === 0) {
    fetch(resume.getAttribute('href'), { method: 'HEAD' }).then(function (r) {
      var type = r.headers.get('content-type') || '';
      if (r.ok && type.indexOf('pdf') !== -1) resume.classList.add('is-ready');
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
})();

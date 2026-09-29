// Runs before the page paints (kept in its own file so the page can use a strict security policy).
// 1) Light by default, dark only if the visitor chose it before.
// 2) Stop other websites from showing this page inside a frame (clickjacking protection).
(function () {
  var root = document.documentElement;
  root.className += ' js';
  try { if (window.localStorage && localStorage.getItem('theme') === 'dark') root.setAttribute('data-theme', 'dark'); } catch (e) {}
  if (window.top !== window.self) {
    root.style.display = 'none';                       // never show inside someone else's page
    try { window.top.location = window.self.location.href; } catch (e) {}
  }
})();

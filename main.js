// Footer year
document.getElementById('year').textContent = new Date().getFullYear();

// Fade sections in as they scroll into view
const items = document.querySelectorAll('.reveal');
if ('IntersectionObserver' in window) {
  const io = new IntersectionObserver((entries) => {
    entries.forEach((e) => {
      if (e.isIntersecting) {
        e.target.classList.add('in');
        io.unobserve(e.target);
      }
    });
  }, { rootMargin: '0px 0px -8% 0px' });
  items.forEach((el) => io.observe(el));
} else {
  items.forEach((el) => el.classList.add('in'));
}

// Hide the "Download résumé" button until the PDF is added to /assets.
// (Cloudflare Pages answers missing files with index.html, so check the type too.)
const resume = document.querySelector('[data-resume]');
if (resume && location.protocol.startsWith('http')) {
  fetch(resume.getAttribute('href'), { method: 'HEAD' })
    .then((r) => {
      const type = r.headers.get('content-type') || '';
      if (!r.ok || !type.includes('pdf')) resume.hidden = true;
    })
    .catch(() => { resume.hidden = true; });
}

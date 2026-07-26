/* Site behaviour: scroll reveals, sticky nav, and the photo lightbox (home page only). */

(function () {
  var root = document.documentElement;
  root.classList.add('js');
  var reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* reveal on scroll (IntersectionObserver, staggered by position within a shared parent) */
  var reveals = [].slice.call(document.querySelectorAll('.reveal'));
 var revealAll = function () { reveals.forEach(function (el) { el.classList.add('in'); }); };
  if (reduce || !('IntersectionObserver' in window)) {
    revealAll();
  } else {
    var revealed = false;
    reveals.forEach(function (el) {
      var sibs = [].slice.call(el.parentNode.children).filter(function (c) { return c.classList.contains('reveal'); });
      el.style.setProperty('--d', Math.min(sibs.indexOf(el) * 80, 400) + 'ms');
    });
    var io = new IntersectionObserver(function (list) {
      list.forEach(function (e) { if (e.isIntersecting) { revealed = true; e.target.classList.add('in'); io.unobserve(e.target); } });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.12 });
    reveals.forEach(function (el) { io.observe(el); });
    setTimeout(function () { if (!revealed) revealAll(); }, 2000);
  }

  /* sticky-nav background: toggle when a top sentinel leaves the viewport (no scroll listener) */
  var nav = document.getElementById('nav');
  var sentinel = document.getElementById('top-sentinel');
  if (nav && sentinel && 'IntersectionObserver' in window) {
    new IntersectionObserver(function (e) {
      nav.classList.toggle('stuck', !e[0].isIntersecting);
    }, { threshold: 0 }).observe(sentinel);
  }

  /* lightbox (only present on the home page's photo grid) */
  var lb = document.getElementById('lightbox');
  if (lb) {
    var lbImg = document.getElementById('lbImg'),
        lbClose = document.getElementById('lbClose'),
        lastFocus = null;
    var open = function (full, alt) {
      lastFocus = document.activeElement;
      lbImg.src = full; lbImg.alt = alt || '';
      lb.classList.add('open'); document.body.style.overflow = 'hidden'; lbClose.focus();
    };
    var close = function () {
      lb.classList.remove('open'); lbImg.src = ''; document.body.style.overflow = '';
      if (lastFocus) lastFocus.focus();
    };
    [].slice.call(document.querySelectorAll('.photo')).forEach(function (btn) {
      btn.addEventListener('click', function () {
        var img = btn.querySelector('img');
        open(btn.getAttribute('data-full') || img.src, img.alt);
      });
    });
    lbClose.addEventListener('click', close);
    lb.addEventListener('click', function (e) { if (e.target === lb) close(); });
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && lb.classList.contains('open')) close(); });
  }

  /* footer year */
  var y = document.getElementById('year');
  if (y) y.textContent = new Date().getFullYear();
})();

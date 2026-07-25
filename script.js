/* Site behaviour: theme toggle, scroll reveals, sticky nav, scroll-spy, lightbox. */

(function () {
  var root = document.documentElement;
  root.classList.add('js');
  var reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* theme toggle (in-memory; to persist across reloads once deployed, save the value
     to localStorage in this handler and read it in the head script above) */
  var toggle = document.getElementById('toggle');
  function syncLabel() {
    var dark = root.getAttribute('data-theme') === 'dark';
    toggle.textContent = dark ? 'Light' : 'Dark';
    toggle.setAttribute('aria-label', 'Switch to ' + (dark ? 'light' : 'dark') + ' theme');
  }
  syncLabel();
  toggle.addEventListener('click', function () {
    root.setAttribute('data-theme', root.getAttribute('data-theme') === 'dark' ? 'light' : 'dark');
    syncLabel();
  });

  /* reveal on scroll (IntersectionObserver, staggered by position within a shared parent) */
  var reveals = [].slice.call(document.querySelectorAll('.reveal'));
  if (reduce || !('IntersectionObserver' in window)) {
    reveals.forEach(function (el) { el.classList.add('in'); });
  } else {
    reveals.forEach(function (el) {
      var sibs = [].slice.call(el.parentNode.children).filter(function (c) { return c.classList.contains('reveal'); });
      el.style.setProperty('--d', Math.min(sibs.indexOf(el) * 80, 400) + 'ms');
    });
    var io = new IntersectionObserver(function (list) {
      list.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.12 });
    reveals.forEach(function (el) { io.observe(el); });
  }

  /* sticky-nav background: toggle when a top sentinel leaves the viewport (no scroll listener) */
  var nav = document.getElementById('nav');
  var sentinel = document.getElementById('top-sentinel');
  if ('IntersectionObserver' in window && sentinel) {
    new IntersectionObserver(function (e) {
      nav.classList.toggle('stuck', !e[0].isIntersecting);
    }, { threshold: 0 }).observe(sentinel);
  }

  /* scroll-spy: highlight the active section link */
  var links = {};
  [].slice.call(document.querySelectorAll('.nav__links a')).forEach(function (a) { links[a.getAttribute('href').slice(1)] = a; });
  if ('IntersectionObserver' in window) {
    var spy = new IntersectionObserver(function (list) {
      list.forEach(function (e) {
        var a = links[e.target.id];
        if (a && e.isIntersecting) {
          Object.keys(links).forEach(function (k) { links[k].classList.remove('active'); });
          a.classList.add('active');
        }
      });
    }, { rootMargin: '-45% 0px -45% 0px' });
    ['writing', 'photos', 'cv'].forEach(function (id) { var s = document.getElementById(id); if (s) spy.observe(s); });
  }

  /* lightbox */
  var lb = document.getElementById('lightbox'), lbImg = document.getElementById('lbImg'),
      lbClose = document.getElementById('lbClose'), lastFocus = null;
  function open(full, alt) {
    lastFocus = document.activeElement;
    lbImg.src = full; lbImg.alt = alt || '';
    lb.classList.add('open'); document.body.style.overflow = 'hidden'; lbClose.focus();
  }
  function close() {
    lb.classList.remove('open'); lbImg.src = ''; document.body.style.overflow = '';
    if (lastFocus) lastFocus.focus();
  }
  [].slice.call(document.querySelectorAll('.photo')).forEach(function (btn) {
    btn.addEventListener('click', function () {
      var img = btn.querySelector('img');
      open(btn.getAttribute('data-full') || img.src, img.alt);
    });
  });
  lbClose.addEventListener('click', close);
  lb.addEventListener('click', function (e) { if (e.target === lb) close(); });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && lb.classList.contains('open')) close(); });

  document.getElementById('year').textContent = new Date().getFullYear();
})();

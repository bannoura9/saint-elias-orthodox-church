/* Saint Elias — shared interactions */
(function () {
  // Mobile menu toggle
  var btn = document.querySelector('.menubtn');
  var drawer = document.getElementById('mobile-nav');
  if (btn && drawer) {
    btn.addEventListener('click', function () {
      var open = drawer.classList.toggle('open');
      btn.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
  }

  // Giving widget (present only on pages with a give card)
  document.querySelectorAll('.tiers button').forEach(function (b) {
    b.addEventListener('click', function () {
      document.querySelectorAll('.tiers button').forEach(function (x) { x.classList.remove('on'); });
      b.classList.add('on');
    });
  });
  document.querySelectorAll('.give-card .toggle button').forEach(function (b) {
    b.addEventListener('click', function () {
      document.querySelectorAll('.give-card .toggle button').forEach(function (x) { x.classList.remove('on'); });
      b.classList.add('on');
    });
  });

  // Tawk.to live chat widget (free) — loads on every page that includes site.js
  var Tawk_API = window.Tawk_API = window.Tawk_API || {};
  window.Tawk_LoadStart = window.Tawk_LoadStart || new Date();
  (function () {
    var s1 = document.createElement('script'), s0 = document.getElementsByTagName('script')[0];
    s1.async = true;
    s1.src = 'https://embed.tawk.to/6a4aba84a784211d46d3a6e5/1jspuh59a';
    s1.charset = 'UTF-8';
    s1.setAttribute('crossorigin', '*');
    s0.parentNode.insertBefore(s1, s0);
  })();
})();

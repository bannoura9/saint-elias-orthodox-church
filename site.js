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
})();

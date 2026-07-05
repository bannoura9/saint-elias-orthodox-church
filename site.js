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

  // Give card → PayPal donate with the chosen amount + frequency
  var giveBtn = document.getElementById('giveBtn');
  if (giveBtn) {
    giveBtn.addEventListener('click', function (e) {
      e.preventDefault();
      var amtBtn = document.querySelector('.give-card .tiers button.on');
      var freqBtn = document.querySelector('.give-card .toggle button.on');
      var amt = amtBtn ? amtBtn.textContent.replace(/[^0-9.]/g, '') : '';
      var monthly = freqBtn && /month/i.test(freqBtn.textContent);
      var url = 'https://www.paypal.com/donate/?business=' + encodeURIComponent('frgeorgeshawareb@yahoo.com') +
        '&currency_code=USD&item_name=' + encodeURIComponent(monthly ? 'Saint Elias Church — Monthly Stewardship' : 'Saint Elias Church Donation') +
        '&no_recurring=' + (monthly ? '0' : '1');
      if (amt) url += '&amount=' + amt;
      window.open(url, '_blank', 'noopener');
    });
  }

  // Parish forms that actually send (contact, volunteer) — via FormSubmit AJAX
  document.querySelectorAll('form[data-endpoint]').forEach(function (f) {
    f.addEventListener('submit', function (e) {
      e.preventDefault();
      var s = f.querySelector('.form-status');
      var btn = f.querySelector('button[type="submit"]');
      var label = btn ? btn.textContent : '';
      if (btn) { btn.disabled = true; btn.textContent = 'Sending…'; }
      var data = {};
      Array.prototype.forEach.call(f.elements, function (el) {
        if (el.name && el.type !== 'submit') data[el.name] = el.value;
      });
      data._subject = f.getAttribute('data-subject') || 'New message from the Saint Elias website';
      data._template = 'table';
      function show(msg) { if (s) { s.hidden = false; s.textContent = msg; } }
      fetch(f.getAttribute('data-endpoint'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
        body: JSON.stringify(data)
      }).then(function (r) { return r.json(); }).then(function () {
        show('Thank you — your message has been sent. Someone from the parish will be in touch soon.');
        f.reset();
        if (btn) { btn.textContent = 'Sent ✓'; }
      }).catch(function () {
        show('Sorry, something went wrong. Please call us at (303) 949-5809 or use the live chat and we\'ll respond right away.');
        if (btn) { btn.disabled = false; btn.textContent = label; }
      });
    });
  });

  // Parish forms (informational, e.g. newsletter) — route submitters to phone + live chat
  document.querySelectorAll('form[data-parish-form]').forEach(function (f) {
    f.addEventListener('submit', function (e) {
      e.preventDefault();
      var msg = f.getAttribute('data-parish-form');
      var s = f.querySelector('.form-status');
      if (s) { s.hidden = false; s.textContent = msg; }
      var b = f.querySelector('button[type="submit"]');
      if (b) { b.disabled = true; b.textContent = 'Thank you'; }
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

/* Saint Elias — shared interactions */
(function () {
  // Supabase (system of record). The publishable key is browser-safe — Row-Level
  // Security limits it to inserting submissions; it cannot read anyone's data.
  var SUPABASE_URL = 'https://uwewlcjouzkykzyuxzow.supabase.co';
  var SUPABASE_KEY = 'sb_publishable_EEcUb26HzVB-JRQwGs6NSw_TB2xIRol';
  function supabaseInsert(table, row) {
    return fetch(SUPABASE_URL + '/rest/v1/' + table, {
      method: 'POST',
      headers: {
        'apikey': SUPABASE_KEY,
        'Authorization': 'Bearer ' + SUPABASE_KEY,
        'Content-Type': 'application/json',
        'Prefer': 'return=minimal'
      },
      body: JSON.stringify(row)
    }).catch(function () { /* the email notification is the backup channel */ });
  }

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

  // Parish forms that actually send (contact, volunteer, newsletter):
  // write to Supabase (system of record) AND email via FormSubmit (notification).
  document.querySelectorAll('form[data-endpoint]').forEach(function (f) {
    f.addEventListener('submit', function (e) {
      e.preventDefault();
      var s = f.querySelector('.form-status');
      var btn = f.querySelector('button[type="submit"]');
      var label = btn ? btn.textContent : '';
      if (btn) { btn.disabled = true; btn.textContent = 'Sending…'; }

      // Collect the real fields; skip the submit button and FormSubmit meta ("_honey", etc.)
      var fields = {}, honeypot = false;
      Array.prototype.forEach.call(f.elements, function (el) {
        if (!el.name || el.type === 'submit') return;
        if (el.name.charAt(0) === '_') { if (el.value) honeypot = true; return; }
        fields[el.name] = el.value;
      });
      function show(msg) { if (s) { s.hidden = false; s.textContent = msg; } }

      // Store in the database (skips silently if the honeypot was tripped by a bot)
      var table = f.getAttribute('data-supabase-table');
      if (table && !honeypot) { supabaseInsert(table, fields); }

      // Email notification via FormSubmit — drives the success/error UI
      var data = {};
      for (var k in fields) { data[k] = fields[k]; }
      data._subject = f.getAttribute('data-subject') || 'New message from the Saint Elias website';
      data._template = 'table';
      fetch(f.getAttribute('data-endpoint'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
        body: JSON.stringify(data)
      }).then(function (r) { return r.json(); }).then(function () {
        show(f.getAttribute('data-success') || 'Thank you — your message has been sent. Someone from the parish will be in touch soon.');
        f.reset();
        if (btn) { btn.textContent = f.getAttribute('data-sent-label') || 'Sent ✓'; }
      }).catch(function () {
        show('Sorry, something went wrong. Please call us at (303) 949-5809 or use the live chat and we\'ll respond right away.');
        if (btn) { btn.disabled = false; btn.textContent = label; }
      });
    });
  });

  // Tawk.to live chat widget (free) — loads on every page that includes site.js.
  // Deferred until first user interaction (or 4s after load) so the ~430KB widget
  // doesn't block first paint, shift layout mid-read, or hurt Core Web Vitals.
  (function () {
    var loaded = false;
    function loadTawk() {
      if (loaded) return;
      loaded = true;
      var Tawk_API = window.Tawk_API = window.Tawk_API || {};
      window.Tawk_LoadStart = window.Tawk_LoadStart || new Date();
      Tawk_API.onLoad = function () {
        // Tawk's iframes ship without titles (accessibility failure) — label them.
        document.querySelectorAll('iframe:not([title])').forEach(function (f) {
          f.setAttribute('title', 'Live chat');
        });
      };
      var s1 = document.createElement('script'), s0 = document.getElementsByTagName('script')[0];
      s1.async = true;
      s1.src = 'https://embed.tawk.to/6a4aba84a784211d46d3a6e5/1jspuh59a';
      s1.charset = 'UTF-8';
      s1.setAttribute('crossorigin', '*');
      s0.parentNode.insertBefore(s1, s0);
      ['pointerdown', 'keydown', 'touchstart', 'scroll'].forEach(function (ev) {
        window.removeEventListener(ev, loadTawk);
      });
    }
    ['pointerdown', 'keydown', 'touchstart', 'scroll'].forEach(function (ev) {
      window.addEventListener(ev, loadTawk, { passive: true, once: true });
    });
    window.addEventListener('load', function () { setTimeout(loadTawk, 4000); });
  })();
})();

/* ============================================================
   PureFlow — Google Analytics 4 loader
   ------------------------------------------------------------
   SINGLE SOURCE OF TRUTH for the GA4 Measurement ID.
   Every page loads this file (before </head> is fine) so the
   ID only ever needs to be set in ONE place.

   TO FINISH SETUP:
   1. Create the GA4 property in Ben's Google Analytics account
      (Admin > Create Property > Web data stream for pureflowut.com).
   2. Copy the Measurement ID it gives you (looks like G-ABC123XYZ).
   3. Replace the placeholder value below.
   That's it — the snippet auto-injects gtag on every page.
   ============================================================ */

(function () {
  // ⬇⬇⬇  REPLACE THIS PLACEHOLDER WITH THE REAL GA4 MEASUREMENT ID  ⬇⬇⬇
  var GA_MEASUREMENT_ID = 'G-XXXXXXXXXX';
  // ⬆⬆⬆  (see README.md > Google Analytics for full instructions)  ⬆⬆⬆

  // Don't load analytics until a real ID is present.
  if (!GA_MEASUREMENT_ID || GA_MEASUREMENT_ID === 'G-XXXXXXXXXX') return;

  // Inject the gtag.js library.
  var s = document.createElement('script');
  s.async = true;
  s.src = 'https://www.googletagmanager.com/gtag/js?id=' + GA_MEASUREMENT_ID;
  document.head.appendChild(s);

  // Standard GA4 bootstrap.
  window.dataLayer = window.dataLayer || [];
  function gtag() { window.dataLayer.push(arguments); }
  window.gtag = gtag;
  gtag('js', new Date());
  gtag('config', GA_MEASUREMENT_ID);
})();

# PureFlow Utah — Website

Static HTML/CSS/JS site (no build step, no framework) for PureFlow, a Utah B2B
bottleless water & ice cooler dealer serving the Wasatch Front.

Deployed via **GitHub Pages** from the `main` branch, root path. Live at
**www.pureflowut.com**.

---

## Local preview

```bash
python3 -m http.server 8788
# then open http://localhost:8788/
```

---

## August 2026 B2B redesign — what changed

The site was refactored from a residential + commercial water-filtration site
into a **B2B-only bottleless water & ice** dealer site, referencing the clean,
simple layout of dealer sites like BEC Pure Water & Ice.

- Residential removed entirely (`residential.html` deleted; all nav/footer/link
  references dropped; removed from `sitemap.xml`).
- All product pricing removed — every cooler now has a **Request Free Trial** CTA
  that deep-links to the contact form with the model pre-filled (`?product=`).
- **"Free Water Test"** replaced with **"Contact Us"** across the site.
- New brand product renders wired in (Pure Water Technology / Wellsys lineup).
- Auto-scrolling **client logo carousel** (pure CSS, pauses on hover).
- **Ebook lead-capture** section (email capture works today; PDF pending).
- **i14 video-ready feature** slot (poster wired; clip pending).
- Google Analytics 4 scaffold on every page.

---

## Google Analytics — FINISH SETUP

GA4 is wired on every page through a **single file**: `js/analytics.js`.
The Measurement ID lives in exactly one place there.

To turn it on:

1. In **Ben's Google Analytics account**, create a GA4 property for
   `pureflowut.com` (Admin → Create property → add a Web data stream).
   *(This requires Ben's Google account — it has not been created yet.)*
2. Copy the **Measurement ID** it issues (format `G-XXXXXXXXXX`).
3. Open `js/analytics.js` and replace the placeholder:
   ```js
   var GA_MEASUREMENT_ID = 'G-XXXXXXXXXX';   // ← paste the real ID here
   ```
4. Done. The script auto-injects `gtag.js` on every page. Until a real ID is
   present it stays dormant (no network calls, no errors).

---

## Pending assets (TODO — placeholders in place, nothing fabricated)

| Item | Status | Where it drops in |
|------|--------|-------------------|
| **Rick's branded ebook PDF** | Not received | Place at `assets/pureflow-water-guide.pdf`; the ebook section on `index.html` already captures emails via the working form handler. See the HTML comment above the `.ebook-section`. |
| **Parker's i14 walkthrough video** | Not received | Drop into a `video/` folder and un-comment the `<video>` block in the "i14 VIDEO FEATURE" section of `index.html` (poster already set to `images/products/i14-front.png`). |
| **GA4 Measurement ID** | Not created | Needs Ben's Google account (see above). |
| **Case-study photos** (The Picklr, ES Solar) | Optional | Text placeholders on `commercial.html`; swap `.case-study-img` contents when photos arrive. |

---

## Structure

```
index.html            Home (B2B hero, logo carousel, featured coolers, i14 video, ebook)
commercial.html       Full cooler & ice lineup + Who We Serve + case studies
about.html            Team (Ben / Nick / Parker) + Utah water story
contact.html          Contact form (product pre-fill) + FAQ + service map
join.html             Rep / careers page (commercial-only earnings)
salt-lake-city.html   SEO location page
provo.html            SEO location page
ogden.html            SEO location page
css/style.css         All styles (cache-busted via ?v=3)
js/main.js            Nav, FAQ, form validation, scroll anims, product pre-fill
js/analytics.js       GA4 loader (single source of the Measurement ID)
images/products/      Cooler renders (pw50, pw90, pw90-ct, i14-front, i15-new, s4, xl1-new, i30-new)
images/logos/         Normalized client logos for the carousel
```

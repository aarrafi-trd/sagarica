# Sagarica — Immersive Experience Design Site

Production-ready single-page site. Vanilla HTML/CSS/JS, no build step.
GSAP + Lenis from CDN. Forms post to JotForm. Deploys to Vercel as-is.

## Files
- `index.html` — markup + all styles
- `config.js` — **the only file you edit** (video, JotForm IDs, পেঁচা link)
- `main.js` — interaction layer (no need to touch)
- `vercel.json` — deploy + caching config
- `assets/` — drop your hero video / poster here

---

## 1 · Hero video
Pick a free, no-attribution clip — recommend **underwater sun-rays**
(bright cyan, atmospheric, on-brand). Sources: pexels.com/videos,
coverr.co, pixabay.com. Search "sunlight underwater" or "dark water".
Download the **1920×1080** version (not 4K), then compress:

```bash
ffmpeg -i raw.mp4 -vf "scale=1920:-2" -c:v libx264 -crf 28 \
  -preset slow -an -movflags +faststart -t 12 assets/ocean.mp4
ffmpeg -i assets/ocean.mp4 -vframes 1 -q:v 3 assets/ocean-poster.jpg
```
Then in `config.js`:
```js
heroVideoSrc: "assets/ocean.mp4",
heroVideoPoster: "assets/ocean-poster.jpg"
```
Leave `heroVideoSrc: ""` to use the built-in animated gradient (zero weight).
Confirm the clip's license reads "free, no attribution" on its own page before shipping.

---

## 2 · Forms — embedded JotForm
Each modal embeds a live JotForm via a lazy iframe (loads only when the
modal is first opened, so it costs nothing on page load). JotForm handles
rendering, validation, submission, email notifications, and any
Zapier/Sheets/Slack integrations you add in the JotForm dashboard.

Three forms are already created in your JotForm account and wired in
`config.js` → `jotformIds`:

| Form | Title | ID |
|---|---|---|
| A | Sagarica — General Inquiry | 261632830038049 |
| B | Sagarica — Event Organiser Inquiry | 261633549182057 |
| C | Sagarica — Vendor & Partner Application | 261633408637056 |

To swap a form later, just change its ID in `config.js`. Configure
notification emails and integrations inside the JotForm dashboard.

## 3 · পেঁচা link
```js
pachaUrl: "https://pacha.yoursite.com"
```

---

## 4 · Deploy to Vercel + connect Namecheap domain

**Deploy:**
```bash
cd sagarica
npx vercel          # first run: log in, accept defaults → preview URL
npx vercel --prod   # promote to production
```
Or: push the folder to a GitHub repo → import at vercel.com/new (zero config; it's static).

**Connect your Namecheap domain:**
1. Vercel dashboard → your project → **Settings → Domains** → add `yourdomain.com` (and `www`).
2. Vercel shows the DNS records to set. Two options:
   - **Easiest (apex + www):** at Namecheap → Domain → **Advanced DNS**, add:
     - `A` record, host `@`, value `76.76.21.21`
     - `CNAME` record, host `www`, value `cname.vercel-dns.com`
   - **Or** point Namecheap's nameservers to Vercel (Vercel will list them) for full DNS-on-Vercel.
3. Use whatever Vercel's panel displays — it's authoritative and occasionally changes the IP/target.
4. DNS propagation: minutes to a few hours. HTTPS cert is issued by Vercel automatically once DNS resolves.

---

## What's implemented
**Hero** — lazy MP4 bg + gradient fallback, dark overlay, canvas ocean
particles, mouse parallax, masked headline load animation.
**Scroll** — Lenis smooth scroll, IntersectionObserver reveals, GSAP
ScrollTrigger parallax. **Visual** — organic SVG wave separator, oversized
Bengali decorative wordmarks (সাগর / দল / পেঁচা), depth-as-descent palette.
**পেঁচা** — full-width abyssal block, parallax bg + giant scrubbing
wordmark, cinematic reveals. **Interactions** — magnetic buttons (spring
return), dual-layer cursor glow, card hover lift. **Performance** —
GPU transforms only, particles pause off-screen, video lazy-loaded,
`prefers-reduced-motion` fully honoured, focus-trapped modal (Esc/backdrop close).

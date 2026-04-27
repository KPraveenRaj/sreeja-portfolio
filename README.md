# Konatham Sreeja — Portfolio Site

A static portfolio site for Konatham Sreeja (B.Des Knitwear, NIFT Chennai, 2022-2026). Three projects, two viewing modes, dark mode, per-project theming, dual-resolution images with a pan/zoom lightbox. No framework, no build step, just HTML + CSS + vanilla JS + one CDN dependency (Swiper for the slide decks).

**Live:** https://raspy-band-8406.konatham-praveen-raj.workers.dev
**Repo:** https://github.com/KPraveenRaj/sreeja-portfolio
**Hosting:** Cloudflare Workers (Static Assets)

---

## Quick orient

```
sreeja-portfolio/
├── index.html              Landing: hero, work grid, about, contact
├── portfolio.html          Academic portfolio (54 pages, webtoon strip)
├── cyber-play.html         Cyber Play deck (41 pages, Swiper)
├── quiet-erosion.html      Quiet Erosion deck (45 pages, Swiper)
├── styles.css              All styling, themes, dark mode, animations
├── script.js               Mode dispatch, dark toggle, lightbox, decks
├── robots.txt              Block crawlers
├── wrangler.toml           Cloudflare Workers Static Assets config
├── .assetsignore           What NOT to ship to the Worker
├── .gitignore              What NOT to commit
├── images/
│   ├── profile.webp        1200x1682, hero portrait
│   ├── covers/             Card thumbnails on landing page
│   ├── portfolio/          page-01.webp ... page-54.webp + @hi.webp
│   ├── cyber-play/         page-01.webp ... page-41.webp + @hi.webp
│   └── quiet-erosion/      page-01.webp ... page-45.webp + @hi.webp
└── *.pdf, *.zip            Source PDFs (gitignored, not deployed)
```

Total deployed payload: ~30 MB of images, all WebP, lazy-loaded after the first two pages of each project.

---

## How the site is wired

### Page modes
Each HTML page declares its mode on `<body>`:
- `data-page="landing"` (`index.html`) — fade-in cards, no deck/strip
- `data-page="portfolio"` (`portfolio.html`) — vertical webtoon strip with reading progress bar
- `data-page="deck"` (`cyber-play.html`, `quiet-erosion.html`) — horizontal Swiper deck

`script.js` reads `document.body.dataset.page` once and runs only the relevant block. This keeps the JS small and predictable.

### Per-project themes
Each page also declares a theme on `<body>`:
- `data-theme="landing"` — warm neutral
- `data-theme="portfolio"` — academic / paper
- `data-theme="cyber"` — neon, glitchy, HUD brackets, drifting RGB ray
- `data-theme="erosion"` — stone, ken-burns micro-zoom, drifting grain

Themes are CSS variables (`--bg`, `--text`, `--accent`, etc.) cascaded under `body[data-theme="X"]` selectors in `styles.css`. The deck stage also carries `data-theme` so theme-specific overlays (cyber scanline, erosion grain) can attach in `styles.css` without touching JS.

### Dark mode
- Toggle button is injected into `.nav` by `script.js` (`injectModeToggle()`).
- Mode is stored in `localStorage.mode` (`"light"` | `"dark"`).
- An inline script in every `<head>` reads the stored mode (or `prefers-color-scheme`) and sets `document.documentElement.dataset.mode` BEFORE first paint — this is the FOUC fix, do not remove it.
- Dark variants live under `:root[data-mode="dark"]` and `:root[data-mode="dark"] body[data-theme="X"]` selectors.
- First-time visitors get a one-shot toast (`localStorage.seenDarkToast`) telling them dark mode exists.

### Dual-resolution images
Every project page exists in two WebP sizes:
- `page-NN.webp` — display res (~2340px wide, q82), inlined in the strip/deck
- `page-NN@hi.webp` — high res (~3510px, q80), preloaded only when the lightbox opens

The lightbox shows the lo-res instantly, then upgrades to `@hi.webp` once the hi-res preload resolves. Pan/zoom (mouse wheel, drag, double-click, pinch, keyboard `+ - 0`) is supported up to 8x — useful for spec sheets and tech packs that the source PDFs render at 300 DPI.

### Slide deck (Swiper)
`cyber-play.html` and `quiet-erosion.html` use Swiper 11 in `freeMode` with `sticky: true` and `momentumVelocityRatio: 1.6` — gives a flick-able deck that snaps but feels weighty. Mousewheel and arrow keys both work. Click on the active slide opens the lightbox; we use Swiper's own `swiper.on('click', ...)` callback (not a raw DOM click) because it correctly distinguishes drag vs. click and fires after Swiper's internal click suppression.

### Webtoon strip (portfolio)
`portfolio.html` just appends 54 `<img>` elements stacked vertically. A reading progress bar (`.read-progress`) tracks scroll, and an `IntersectionObserver` updates the page counter as each image crosses the middle of the viewport.

---

## Editing content

### Replace a project's pages
Re-render the source PDF and overwrite the WebPs. The encoder script lives in commit history (search for `pdftoppm` / `Pillow` snippets), but the gist is:

```bash
# Render PDF pages to PNG at 300 DPI
pdftoppm -png -r 300 "Source.pdf" /tmp/proj

# Then in Python:
#   - resize each page to 2340 wide for page-NN.webp (quality 82, method 4)
#   - keep original 3510 wide for page-NN@hi.webp (quality 80, method 4)
#   - use multiprocessing.Pool(20) for the encode — single-threaded WebP is glacial
```

Filenames must stay zero-padded: `page-01.webp`, `page-02.webp`, ... matching `data-pages` in the HTML.

### Edit copy
- **Landing hero / about / contact:** `index.html`
- **Project descriptions:** the `.project-hero__desc` paragraph in each `<project>.html`
- **Tools / skills:** `.about__cols` block in `index.html`

### Add a new project
1. Create `images/<new-slug>/page-NN.webp` + `@hi.webp` for every page
2. Copy `cyber-play.html` → `<new-slug>.html`, swap `data-pages`, `data-prefix`, `data-theme`, copy
3. Add a new theme block in `styles.css` under `body[data-theme="<new-slug>"]` (and dark variant)
4. Add a card to the `.work__grid` in `index.html`
5. Update the "Next project" link at the bottom of the previous deck page

---

## Cloudflare Workers (deployment)

The site is served via **Cloudflare Workers Static Assets** (the modern replacement for Cloudflare Pages). Auto-deploys on push to `main`.

### Worker config (`wrangler.toml`)
```toml
name = "raspy-band-8406"
compatibility_date = "2025-01-01"

[assets]
directory = "."
not_found_handling = "404-page"
```

That's the entire backend. No Worker script — `[assets] directory = "."` tells Cloudflare to serve every file in the repo as a static asset. `not_found_handling = "404-page"` makes unknown paths render `/404.html` if present (currently falls through to the default).

### What ships vs. what doesn't
`.assetsignore` is the deploy filter — anything matched here is excluded from the Worker bundle even though it's in the repo:
```
*.pdf       # source PDFs are too big and unnecessary
*.zip       # archives
*.md        # README etc.
.git
.github
.gitignore
.assetsignore
wrangler.toml
```

### Deploy pipeline
- **GitHub repo:** `KPraveenRaj/sreeja-portfolio`, branch `main`
- **Cloudflare → Workers & Pages → raspy-band-8406 → Settings → Builds:** connected to the GitHub repo
- Every push to `main` triggers a Workers Build, which reads `wrangler.toml` and uploads the asset bundle. Live in 30-60 seconds.
- No build command, no framework preset — it's pure static.

### Manual deploy (if you ever need it)
```bash
npm install -g wrangler
wrangler login
wrangler deploy
```

### Custom domain
Not configured. To add: Cloudflare dashboard → the Worker → Settings → Domains & Routes → add a route. Buy the domain on Cloudflare Registrar to skip DNS plumbing.

### What's NOT in this repo (intentionally)
- Cloudflare account ID, API tokens, deploy hooks — never commit these
- The `CLOUDFLARE_API_TOKEN` GitHub Actions secret (we don't use Actions; Cloudflare Builds runs server-side)
- `.dev.vars` / any env files

If you fork this for a different site, just `wrangler login` once locally and you're set.

---

## Privacy posture

This site is "unlisted YouTube" style — public URL, but discoverable only by people Sreeja shares the link with:
- `<meta name="robots" content="noindex, nofollow">` on every page
- `robots.txt` blocks all crawlers
- Not linked from any indexed source

Don't remove the `noindex` meta tags. That's the actual mechanism — `robots.txt` is just polite signaling.

---

## Browser support

CSS variables, grid, `clamp()`, `color-mix()`, `backdrop-filter`, `aspect-ratio`, IntersectionObserver, native `loading="lazy"`, WebP. All supported in every evergreen browser from ~2022 onward.

---

## Useful interactions

- **Decks:** drag, scroll, or `← →` arrows. Click slide → lightbox. Inside lightbox: wheel to zoom, drag to pan, double-click for 1x ↔ 2.5x, `+ - 0` keys, `Esc` to close.
- **Webtoon:** scroll, or `↑ ↓` / `j k` / `PageUp PageDown` to jump pages. Click any page for lightbox.
- **Dark mode:** ☼/☾ button in the nav, top right.

---

## Conventions for future edits

- No em-dashes (—) or en-dashes (–) in copy. Sister explicitly dislikes them. Use commas, hyphens, or `·`.
- Keep image filenames zero-padded (`page-01`, not `page-1`).
- When editing themes, always update the dark variant too — they live next to each other in `styles.css`.
- Don't add a build step. The whole point is that any future maintainer can open an HTML file in a browser and see the change.

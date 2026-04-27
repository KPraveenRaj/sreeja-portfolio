# Konatham Sreeja — Portfolio Site

A static, fast, mobile-friendly portfolio site for Sreeja's design work.
No framework, no build step. Pure HTML + CSS + a tiny bit of JS.

## What's inside

```
sreeja-portfolio/
├── index.html              ← Landing page (hero, work, about, contact)
├── portfolio.html          ← Main 5-chapter academic portfolio
├── cyber-play.html         ← Reliance Trends internship project 1
├── quiet-erosion.html      ← Reliance Trends internship project 2
├── styles.css              ← All styling
├── script.js               ← Page counter, lightbox, keyboard nav
├── robots.txt              ← Tells search engines NOT to index
├── images/
│   ├── profile.jpg
│   ├── covers/             ← Project preview thumbnails
│   ├── portfolio/          ← 54 pages of the main portfolio
│   ├── cyber-play/         ← 41 pages
│   └── quiet-erosion/      ← 45 pages
└── README.md               ← (this file)
```

Total size: ~14 MB. Loads fast even on slow connections (images lazy-load).

## Privacy approach: "unlisted YouTube" style

Like an unlisted YouTube video — anyone with the link can view, but:

- `<meta name="robots" content="noindex, nofollow">` on every page → tells Google etc. to skip indexing
- `robots.txt` blocks all crawlers
- Site is not linked from anywhere public, so it's effectively findable only by people Sreeja shares the link with

This matches what Behance "private link" and Drive "anyone with the link" do.

## Deploy on Cloudflare Pages (recommended — free, fast, easy)

### Option A: Drag-and-drop (no GitHub needed, takes 2 minutes)

1. Go to https://dash.cloudflare.com → sign up / log in (free)
2. Left sidebar → **Workers & Pages** → **Create** → **Pages** tab → **Upload assets**
3. Project name: pick something obscure like `sreeja-design-aw26` or `ks-folio-9k3p`
   (this becomes the URL: `sreeja-design-aw26.pages.dev`)
4. Drag the entire `sreeja-portfolio` folder onto the upload area
5. Click **Deploy site**
6. Done — site is live in ~30 seconds. Share the URL.

### Option B: Via GitHub (better for ongoing edits)

1. Create a private GitHub repo, push this folder
2. Cloudflare Pages → **Create application** → **Connect to Git**
3. Pick the repo, accept defaults (no build command needed)
4. Every time you push to GitHub, the site auto-redeploys

## Custom domain (optional, ~₹800/yr)

1. Buy a domain (e.g. `sreejakonatham.com`) on Namecheap, GoDaddy, or Cloudflare itself
2. In Cloudflare Pages → your project → **Custom domains** → **Set up a domain**
3. Follow the DNS instructions (5 minutes)

A custom domain looks 10× more professional on a resume than `*.pages.dev`.

## Updating the site later

### Replace a project
1. Replace JPGs in `images/<project>/` (keep the same filenames: `page-01.jpg`, `page-02.jpg`, etc.)
2. Update the description / meta in the relevant `.html` file
3. Re-deploy (drag folder again, or git push)

### Add a new project
1. Create new image folder under `images/`
2. Copy one of the project HTML files (e.g. `cyber-play.html`) → rename
3. Update the gallery `<figure>` blocks to point at new images
4. Add a new `<a class="project">` card to `index.html`

### Convert PDF to JPGs (for new projects)
On Linux/Mac (after `brew install poppler` or `apt install poppler-utils`):
```bash
# Portrait PDFs (A4):
pdftoppm -jpeg -jpegopt quality=80 -r 100 input.pdf images/new-project/page

# Landscape PDFs:
pdftoppm -jpeg -jpegopt quality=80 -r 90 input.pdf images/new-project/page
```

## Customization

- **Colors / fonts:** edit the `:root { ... }` block at the top of `styles.css`
- **Bio / about copy:** edit `index.html` (search for "knitwear designer")
- **Contact info:** edit the `.contact` section in `index.html`
- **Meta description (for link previews):** edit the `<meta name="description">` tags

## Browser features used

- CSS variables, grid, clamp, backdrop-filter
- IntersectionObserver, CSS scroll-behavior
- Native `loading="lazy"` for images

All supported in every browser from 2021 onward — Chrome, Safari, Firefox, Edge, mobile browsers.

## Notes

- The `<meta name="robots" content="noindex">` is the actual privacy mechanism. Don't remove it.
- The favicon is an inline SVG — no extra file. Replace if you want a custom one.
- Keyboard nav on project pages: `↑` `↓` arrow keys move between pages, `Esc` closes lightbox.
- Lightbox: click any page in the gallery to view full-size.

---

Built with care. Best of luck to Sreeja with placements.

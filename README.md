# MFS — Performance Perfected

Static marketing and product catalog site for **MFS** (aftermarket parts and automotive brand). The home page showcases the collection; hash-based routing drives category listings, downpipe products, product detail, and a local-only cart.

This is **not** an Angular or SPA framework app. It uses plain HTML, CSS, and vanilla JavaScript with no build step.

## Features

- Landing sections: hero, category grid, brand story, fitment inquiry form
- Category filters on the home collection
- Client-side catalog: `#/category/…`, `#/products/downpipes`, `#/product/{id}`
- BMW downpipe product line (N20, N26, B46, B47, B58) with photos; the B47 price is still unavailable
- Shopping cart stored in `localStorage` (`mfs-cart-v2`)
- Fitment brief: generate and download a plain-text inquiry on the device

Online checkout and backend contact are **not** connected; copy in the UI reflects preview/demo behavior.
Only downpipes currently have product records. The other category routes show an inquiry prompt, and the Mercedes, Audi, Volkswagen, and Alfa Romeo downpipe filters currently return no products.

## Project structure

```
MFS/
├── index.html                 # Page shell and markup
├── css/
│   ├── main.css               # Entry: @imports partials (order = cascade)
│   ├── 01-base.css … 16-header-nav-current.css
│   └── (run `node scripts/format-css.mjs` only when re-splitting legacy CSS)
├── js/
│   ├── interactions.js        # Collection filters + fitment brief
│   ├── catalog.js             # Routing, products, cart
│   └── hash-make-sync.js      # Header make filter ↔ URL hash
├── data/product-images.json   # Product id → image path (reference)
├── assets/images/             # Logos, category photos, downpipe cutouts
├── scripts/
│   ├── verify-build.mjs       # Checks asset paths referenced by index.html
│   └── refactor-from-monolith.py
├── index.original.html        # Backup of the pre-refactor single-file site
└── archive/                   # Duplicate legacy HTML editions
```

Product image paths are also embedded in `index.html` as a small JSON block (`#mfs-product-images`) so the catalog script can load them without a network `fetch`—useful when opening the file directly.

## Requirements

- A modern browser
- **Optional:** [Node.js](https://nodejs.org/) with npm/npx for `npm start` and `npm run verify`. There are no installed project dependencies; `npm start` downloads `serve` through `npx` when it is not already cached, so its first run may require internet access.

## Quick start

### Option A — Local static server (recommended)

```bash
cd /path/to/MFS
npm start
```

Open [http://localhost:3000](http://localhost:3000).

### Option B — Open the file directly

Open `index.html` in a browser. Relative paths to CSS, JS, and images work; hash routing and `localStorage` cart work as on a server.

## Scripts

| Command | Description |
| ------- | ----------- |
| `npm start` | Serves the project root on port **3000** |
| `npm run verify` | Ensures local `src`/`href` references in `index.html` and entries in `data/product-images.json` resolve to files on disk |

## Routing (hash URLs)

| URL | Purpose |
| --- | ------- |
| `#parts` | Home collection (default product grid) |
| `#/category/{id}` | Subcategories for a category group |
| `#/products/downpipes` | Downpipe listing |
| `#/products/downpipes?make=BMW` | Filter by make |
| `#/product/{id}` | Product detail (`n20`, `n26`, `b46`, `b47`, `b58`) |

## Adding or changing products

1. Add or update PNGs under `assets/images/` (naming: `downpipe-{id}-cutout.png`).
2. Update `data/product-images.json` and the matching JSON in `index.html` (`#mfs-product-images`).
3. Extend the `products` array in `js/catalog.js`.
4. Run `npm run verify`.

Set a product's `price` to `null` when it should be visible but not purchasable. Product data currently lives in `js/catalog.js`; `data/product-images.json` is an asset manifest used by verification, not the catalog data source.

## Legacy / cleanup

- `index.original.html` — single ~12 MB file with inline base64 images (kept for reference).
- `archive/MFS-*-Edition.html` — identical copies of that monolith; safe to delete if you do not need them.

To regenerate the modular site from the monolith backup:

```bash
python3 scripts/refactor-from-monolith.py
```

> **Warning:** this script immediately overwrites `index.html`, `css/main.css`, the files under `js/`, and `data/product-images.json`. Commit or back up current changes before running it. It recreates the version embedded in `index.original.html`, so later modular edits may be lost.

## SEO, link previews, and Google

Production site: [https://www.mfs.ge/](https://www.mfs.ge/)

- **Open Graph / Twitter** meta tags in `index.html` control title, description, and image when links are pasted in chat or social apps.
- **Share image:** `assets/images/og-image.jpg` (1200×630). Refresh previews with [Meta Sharing Debugger](https://developers.facebook.com/tools/debug/) or LinkedIn Post Inspector after deploy.
- **`robots.txt`** allows crawlers and points to the sitemap.
- **`sitemap.xml`** lists the homepage for Google.
- **JSON-LD** (`Organization`, `WebSite`) helps search engines understand the brand.

**Getting on Google** (manual, one-time):

1. Open [Google Search Console](https://search.google.com/search-console).
2. Add property **URL prefix** `https://www.mfs.ge/`.
3. Verify via DNS (Cloudflare) or HTML file/meta tag Cloudflare gives you.
4. Submit sitemap: `https://www.mfs.ge/sitemap.xml`.
5. Use **URL inspection** → **Request indexing** for the homepage.

Indexing can take days to weeks for a new domain. Hash routes (`#/products/...`) are not separate URLs for Google; the homepage is what gets indexed unless you add server-rendered pages later.

## License

Not specified in the repository. Add a license file if you plan to distribute or open-source the project.

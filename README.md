# MFS — Performance Perfected

Static marketing and product catalog site for **MFS** (aftermarket parts and automotive brand). The home page showcases the collection; hash-based routing drives category listings, downpipe products, product detail, and a local-only cart.

This is **not** an Angular or SPA framework app. It uses plain HTML, CSS, and vanilla JavaScript with no build step.

## Features

- Landing sections: hero, category grid, brand story, fitment inquiry form
- Category filters on the home collection
- Client-side catalog: `#/category/…`, `#/products/downpipes`, `#/product/{id}`
- Downpipe product line (BMW N20, N26, B46, B47, B58) with photos and pricing
- Shopping cart stored in `localStorage` (`mfs-cart-v2`)
- Fitment brief: generate and download a plain-text inquiry on the device

Online checkout and backend contact are **not** connected; copy in the UI reflects preview/demo behavior.

## Project structure

```
MFS/
├── index.html                 # Page shell and markup
├── css/main.css               # All site styles
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
- **Optional:** [Node.js](https://nodejs.org/) for `npm start` and `npm run verify` (no project dependencies are installed; `serve` is pulled via `npx`)

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
| `npm run verify` | Ensures every `src`/`href` in `index.html` and entries in `data/product-images.json` resolve to files on disk |

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

## Legacy / cleanup

- `index.original.html` — single ~12 MB file with inline base64 images (kept for reference).
- `archive/MFS-*-Edition.html` — identical copies of that monolith; safe to delete if you do not need them.

To re-split from the monolith backup (destructive to current modular files if you overwrite manually):

```bash
python3 scripts/refactor-from-monolith.py
```

## License

Not specified in the repository. Add a license file if you plan to distribute or open-source the project.

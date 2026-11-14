import { readFileSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const index = readFileSync(join(root, 'index.html'), 'utf8');

const assetRefs = [
  ...index.matchAll(/\b(?:src|href)="([^"]+)"/g),
]
  .map((m) => m[1])
  .filter(
    (p) =>
      !p.startsWith('#') &&
      !p.startsWith('mailto:') &&
      !/^https?:\/\//i.test(p),
  );

const missing = assetRefs.filter((rel) => {
  const path = join(root, rel.split('?')[0]);
  return !existsSync(path);
});

if (missing.length) {
  console.error('Missing assets:\n' + missing.map((p) => `  - ${p}`).join('\n'));
  process.exit(1);
}

const productImages = JSON.parse(
  readFileSync(join(root, 'data/product-images.json'), 'utf8'),
);
for (const [id, rel] of Object.entries(productImages)) {
  if (!existsSync(join(root, rel))) {
    console.error(`Missing product image for ${id}: ${rel}`);
    process.exit(1);
  }
}

const seoFiles = ['robots.txt', 'sitemap.xml', 'assets/images/og-image.jpg'];
for (const rel of seoFiles) {
  if (!existsSync(join(root, rel))) {
    console.error(`Missing SEO asset: ${rel}`);
    process.exit(1);
  }
}

const mainCss = readFileSync(join(root, 'css/main.css'), 'utf8');
for (const m of mainCss.matchAll(/@import url\("([^"]+)"\)/g)) {
  const rel = join('css', m[1]);
  if (!existsSync(join(root, rel))) {
    console.error(`Missing CSS partial: ${rel}`);
    process.exit(1);
  }
}
if (!existsSync(join(root, 'assets/images/hero-background.jpg'))) {
  console.error('Missing assets/images/hero-background.jpg');
  process.exit(1);
}

console.log(`OK: index.html references ${assetRefs.length} assets; all present.`);

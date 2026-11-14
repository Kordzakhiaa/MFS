#!/usr/bin/env node
/**
 * Split legacy main.css into partials, extract embedded hero image, prettify.
 * Run from repo root: node scripts/format-css.mjs
 */
import { readFileSync, writeFileSync, mkdirSync, existsSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { execSync } from "node:child_process";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const cssDir = join(root, "css");
const mainPath = join(cssDir, "main.css");

let text = readFileSync(mainPath, "utf8");

const uriRe =
  /url\(['"]?(data:image\/(jpeg|png|webp);base64,([A-Za-z0-9+/=]+))['"]?\)/g;

text = text.replace(uriRe, (_, _full, mime, b64) => {
  const ext = { jpeg: "jpg", png: "png", webp: "webp" }[mime];
  const out = join(root, "assets/images", `hero-background.${ext}`);
  mkdirSync(dirname(out), { recursive: true });
  writeFileSync(out, Buffer.from(b64, "base64"));
  return `url('../assets/images/hero-background.${ext}')`;
});

/** Split on blank lines; drop obsolete top migration comment. */
const chunks = text
  .split(/\n\s*\n/)
  .map((c) => c.trim())
  .filter(Boolean)
  .filter(
    (c, i) =>
      !(
        i === 0 &&
        c.startsWith("/* MFS site styles") &&
        !c.includes("{")
      ),
  );

const names = [
  "01-base.css",
  "02-brand-hero.css",
  "03-header-layout.css",
  "04-header-shell.css",
  "05-motion.css",
  "06-hero-typography.css",
  "07-collection.css",
  "08-cart-product.css",
  "09-downpipes.css",
  "10-catalog-routes.css",
  "11-catalog-responsive.css",
  "12-header-make.css",
  "13-make-icons-toolbar.css",
  "14-touch-mobile.css",
  "15-maintenance.css",
  "16-header-nav-current.css",
];

if (chunks.length !== names.length) {
  console.error(`Expected ${names.length} chunks, got ${chunks.length}`);
  chunks.forEach((c, i) =>
    console.error(i, c.slice(0, 72).replace(/\n/g, " ")),
  );
  process.exit(1);
}

const sectionTitle = (file) =>
  file
    .replace(/^\d+-/, "")
    .replace(".css", "")
    .split("-")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");

for (let i = 0; i < names.length; i++) {
  let body = chunks[i];
  if (!body.startsWith("/*")) {
    body =
      `/* ==========================================================================\n   ${sectionTitle(names[i])}\n   ========================================================================== */\n\n` +
      body;
  }
  const path = join(cssDir, names[i]);
  writeFileSync(path, body.trim() + "\n", "utf8");
}

const imports = names.map((f) => `@import url("${f}");`).join("\n");
writeFileSync(
  join(cssDir, "main.css"),
  `/* MFS styles — entry file. Import order defines cascade (do not reorder lightly). */\n\n${imports}\n`,
  "utf8"
);

try {
  execSync(`npx --yes prettier --write "${join(cssDir, "*.css")}"`, {
    cwd: root,
    stdio: "inherit",
  });
} catch {
  console.warn("Prettier failed; partials are written but unformatted.");
}

console.log("CSS refactor complete.");
#!/usr/bin/env python3
"""Split index.original.html into css/, js/, assets/, and a slim index.html.

Safe to re-run only when index.original.html is the 12MB monolith; the current
index.html is already modular.
"""
from __future__ import annotations

import base64
import hashlib
import json
import re
import shutil
import subprocess
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
SRC = ROOT / "index.original.html"

if not SRC.exists():
    sys.exit("index.original.html not found — keep the monolith backup before re-running.")


def main() -> None:
    text = SRC.read_text(encoding="utf-8")
    if len(text) < 1_000_000:
        sys.exit("index.original.html does not look like the monolith; aborting.")

    # Delegate to inline refactor (same steps as initial extraction).
    subprocess.check_call([sys.executable, "-c", REFACTOR_CODE], cwd=ROOT)


REFACTOR_CODE = r'''
# noqa — executed via refactor-from-monolith.py
import base64, hashlib, json, re, shutil
from pathlib import Path

ROOT = Path(".")
SRC = ROOT / "index.original.html"
text = SRC.read_text(encoding="utf-8")

head_match = re.search(r"<head[^>]*>(.*?)</head>", text, re.I | re.S)
head_inner = head_match.group(1)
meta_bits = [
    m.group(0)
    for m in re.finditer(r"<meta[^>]+>|<title>[^<]+</title>", head_inner, re.I)
    if any(
        x in m.group(0)
        for x in ("charset", "viewport", "description", "theme-color", "apple-mobile", "<title>")
    )
]
meta_html = "\n  ".join(meta_bits)

styles = re.findall(r"<style[^>]*>(.*?)</style>", text, re.I | re.S)
(ROOT / "css").mkdir(exist_ok=True)
(ROOT / "css" / "main.css").write_text("\n\n".join(s.strip() for s in styles) + "\n", encoding="utf-8")

scripts = re.findall(r"<script([^>]*)>(.*?)</script>", text, re.I | re.S)
interaction_js = catalog_js = hash_js = None
for attrs, body in scripts:
    if "mfs-product-images" in attrs:
        continue
    if "const catalog=" in body:
        catalog_js = body.strip()
    elif "syncMakes" in body:
        hash_js = body.strip()
    elif "data-filter" in body:
        interaction_js = body.strip()

(ROOT / "js").mkdir(exist_ok=True)
(ROOT / "js" / "interactions.js").write_text(interaction_js + "\n", encoding="utf-8")
catalog_patched = catalog_js.replace(
    "const images=JSON.parse(document.getElementById('mfs-product-images').textContent)",
    'const images=JSON.parse(document.getElementById("mfs-product-images").textContent)',
)
(ROOT / "js" / "catalog.js").write_text(catalog_patched + "\n", encoding="utf-8")
(ROOT / "js" / "hash-make-sync.js").write_text(hash_js + "\n", encoding="utf-8")

assets_img = ROOT / "assets" / "images"
assets_img.mkdir(parents=True, exist_ok=True)
png_map = {
    "n20": "downpipe-n20-cutout.png",
    "n26": "downpipe-n26-cutout.png",
    "b46": "downpipe-b46-cutout.png",
    "b47": "downpipe-b47-cutout.png",
    "b58": "downpipe-b58-cutout.png",
}
for key, fname in png_map.items():
    src = ROOT / fname
    if src.exists():
        shutil.copy2(src, assets_img / fname)

(ROOT / "data").mkdir(exist_ok=True)
product_images = {k: f"assets/images/{v}" for k, v in png_map.items()}
(ROOT / "data" / "product-images.json").write_text(json.dumps(product_images, indent=2) + "\n", encoding="utf-8")

text_wo_json = re.sub(
    r'<script[^>]*id="mfs-product-images"[^>]*>.*?</script>', "", text, flags=re.I | re.S
)
uri_to_path = {}

def replace_uri(match):
    uri = match.group(1)
    if uri in uri_to_path:
        return f'src="{uri_to_path[uri]}"'
    header, b64 = uri.split(",", 1)
    mime = header.split(":")[1].split(";")[0]
    ext = {"image/jpeg": "jpg", "image/png": "png", "image/webp": "webp"}.get(mime, "bin")
    raw = base64.b64decode(b64)
    filename = f"inline-{hashlib.sha256(raw).hexdigest()[:10]}.{ext}"
    path = assets_img / filename
    if not path.exists():
        path.write_bytes(raw)
    rel = f"assets/images/{filename}"
    uri_to_path[uri] = rel
    return f'src="{rel}"'

after_head = text.split("</head>", 1)[1]
body_markup = re.sub(r"<script[^>]*>.*?</script>", "", after_head, flags=re.I | re.S)
body_markup = re.sub(r"<style[^>]*>.*?</style>", "", body_markup, flags=re.I | re.S)
body_markup = body_markup.replace("</html>", "").strip()
body_markup = re.sub(r"^<body[^>]*>", "", body_markup, count=1, flags=re.I).strip()
body_markup = re.sub(r'src="(data:image/[^"]+)"', replace_uri, body_markup)
body_markup = re.sub(
    r'(id="n20-product"[^>]*>.*?<img\s+src=")[^"]+(")',
    rf"\1assets/images/downpipe-n20-cutout.png\2",
    body_markup,
    count=1,
    flags=re.I | re.S,
)
body_markup = re.sub(
    r"<(header|main|footer|section|nav|form|dialog|article)([\s>])",
    r"\n<\1\2",
    body_markup,
)

manifest = json.dumps(product_images, separators=(",", ":"))
index_html = f"""<!doctype html>
<html lang="en">
<head>
  {meta_html}
  <link rel="stylesheet" href="css/main.css">
</head>
<body>
{body_markup}

  <script type="application/json" id="mfs-product-images">{manifest}</script>

  <script src="js/interactions.js" defer></script>
  <script src="js/catalog.js" defer></script>
  <script src="js/hash-make-sync.js" defer></script>
</body>
</html>
"""
(ROOT / "index.html").write_text(index_html, encoding="utf-8")
print("Wrote modular site from index.original.html")
'''

if __name__ == "__main__":
    main()

#!/usr/bin/env python3
"""Fold each page into a self-contained HTML file under dist/.

The multi-file source stays the source of truth; this exists so the site can be
handed to a host that wants plain files with no dependencies. CSS and JS are
inlined and SVGs become data URIs — including the ones named only inside
data.js. Links between pages stay relative, so dist/ works as a whole.
"""
import base64
import pathlib
import re
import sys

ROOT = pathlib.Path(__file__).resolve().parent.parent
DIST = ROOT / "dist"

SCRIPTS = ("assets/js/data.js", "assets/js/main.js")
STYLE = "assets/css/style.css"


def data_uri(path: pathlib.Path) -> str:
    return "data:image/svg+xml;base64," + base64.b64encode(path.read_bytes()).decode("ascii")


def build(page: pathlib.Path, css: str, js: dict, images: list) -> str:
    html = page.read_text()
    html = html.replace(f'<link rel="stylesheet" href="{STYLE}">', "<style>\n" + css + "\n</style>")
    for src in SCRIPTS:
        html = html.replace(f'<script src="{src}"></script>', "<script>\n" + js[src] + "\n</script>")
    for svg in images:
        html = html.replace(f"assets/img/{svg.name}", data_uri(svg))
    return html


def main() -> int:
    css = (ROOT / STYLE).read_text()
    js = {src: (ROOT / src).read_text() for src in SCRIPTS}
    # Longest name first so no filename is a prefix of another (m-bundle / m-bundle-kit).
    images = sorted((ROOT / "assets/img").glob("*.svg"), key=lambda p: -len(p.name))

    pages = sorted(p for p in ROOT.glob("*.html"))
    if not pages:
        print("no pages found at repo root", file=sys.stderr)
        return 1

    DIST.mkdir(exist_ok=True)
    failed = False
    for page in pages:
        html = build(page, css, js, images)
        leftover = sorted(set(re.findall(r"assets/[\w./-]+", html)))
        if leftover:
            print(f"{page.name}: unresolved asset references: {leftover}", file=sys.stderr)
            failed = True
            continue
        (DIST / page.name).write_text(html)
        print(f"  {page.name:<12} {len(html):>8,} bytes")

    if failed:
        return 1
    print(f"wrote {len(pages)} pages to {DIST}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())

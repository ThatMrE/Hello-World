#!/usr/bin/env python3
"""Fold the site into one self-contained index.html.

The multi-file version under assets/ stays the source of truth; this exists so
the site can be handed to a host that takes a single HTML bundle. CSS and JS are
inlined, SVGs become data URIs — including the ones named only inside data.js.
"""
import base64
import pathlib
import re
import sys

ROOT = pathlib.Path(__file__).resolve().parent.parent
OUT = ROOT / "dist" / "index.html"


def data_uri(path: pathlib.Path) -> str:
    raw = path.read_bytes()
    return "data:image/svg+xml;base64," + base64.b64encode(raw).decode("ascii")


def main() -> int:
    html = (ROOT / "index.html").read_text()

    css = (ROOT / "assets/css/style.css").read_text()
    html = html.replace(
        '<link rel="stylesheet" href="assets/css/style.css">',
        "<style>\n" + css + "\n</style>",
    )

    for src in ("assets/js/data.js", "assets/js/main.js"):
        js = (ROOT / src).read_text()
        html = html.replace(
            f'<script src="{src}"></script>',
            "<script>\n" + js + "\n</script>",
        )

    # Longest path first so no name is a prefix of another (m-bundle / m-bundle-kit).
    svgs = sorted((ROOT / "assets/img").glob("*.svg"), key=lambda p: -len(p.name))
    for svg in svgs:
        html = html.replace(f"assets/img/{svg.name}", data_uri(svg))

    leftover = re.findall(r"assets/[\w./-]+", html)
    if leftover:
        print("unresolved asset references:", sorted(set(leftover)), file=sys.stderr)
        return 1

    OUT.parent.mkdir(exist_ok=True)
    OUT.write_text(html)
    print(f"wrote {OUT} ({len(html):,} bytes, {len(svgs)} images inlined)")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())

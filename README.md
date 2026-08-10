# HALF BAD — band website

A static site for **HALF BAD**, a (fictional) eight-piece ska band from Coventry.
No build step, no dependencies — open `index.html` and it runs.

**Live:** https://thatmre.github.io/Hello-World/

```bash
python3 -m http.server 8000   # then visit http://localhost:8000
```

## Pages

| Page | What's on it |
| --- | --- |
| `index.html` | Hero with live stat counters, next three shows, the new record, three merch picks |
| `tour.html` | 32 dates across four regions, filterable, with sold-out / low-ticket states and routing-request and accessibility callouts |
| `merch.html` | 11 products in four categories, size pickers, sold-out state, shipping and returns info |
| `music.html` | 5 releases with sleeve art, formats and expandable tracklists |
| `band.html` | Line-up, short history, press and booking contacts |
| `list.html` | Mailing-list signup with client-side validation |

The cart lives in `localStorage`, so it survives navigation between pages.

## How a page is put together

Each page is a thin shell — a `<body data-page="…">`, a couple of empty
containers, and two script tags. Everything shared (ticker, nav with its current
-page marker, footer, cart drawer) is rendered by `main.js`, so the chrome has
one source of truth instead of six copies drifting apart. Section rendering is
conditional on its container being present, which is why one JS file serves
every page.

Adding a page means copying a shell, setting `data-page`, and adding an entry to
`NAV` in `main.js`.

## Design reference

The look follows the visual language the best-known ska band sites and sleeves
share, rather than copying any one of them:

- **2 Tone / Coventry** — the black-and-bone checkerboard, run as a repeating
  motif through the nav strip, hero, section rules and the display type itself.
- **Third-wave gig-poster** (Reel Big Fish, Less Than Jake school) — heavy
  condensed display type, hard offset drop-shadows, one loud accent colour.
- **Trojan-era sleeve print** — mustard, oxblood and green against uncoated bone,
  with monospace as the secondary "printed ephemera" voice.

All artwork is original SVG drawn for this repo. Nothing is traced from, or
reproduces, an existing band's logo, mascot or sleeve.

## Layout

```
*.html                  one shell per page
assets/css/style.css    all styling, tokens at the top of the file
assets/js/data.js       tour dates, products, discography — edit copy here
assets/js/main.js       shared chrome, rendering, filters, cart, form
assets/img/*.svg        logo, hero art, sleeve art, product mockups
tools/bundle.py         folds each page into a standalone file under dist/
netlify.toml            publish-from-root config for a git-linked deploy
```

To change a tour date, a price, or a tracklist, edit `assets/js/data.js` only —
the markup is generated from it.

## Deploying

```bash
python3 tools/bundle.py        # writes dist/<page>.html, everything inlined
```

Each page in `dist/` is self-contained — CSS and JS inlined, SVGs as data URIs —
and links between them stay relative, so the folder works as a unit. The build
fails loudly if any `assets/` reference survives the rewrite, so a renamed image
can't silently ship as a broken link.

Publishing is automatic: `.github/workflows/pages.yml` serves the repo root via
GitHub Pages on every push to `master`, so the live site is never a snapshot.
The same workflow runs `tools/bundle.py` on pull requests and fails if `dist/`
has drifted from source, so the standalone bundles cannot go stale unnoticed.

`netlify.toml` remains for anyone who would rather point Netlify (or another
static host) at this repo instead — publish the root, no build step.

## Notes

- Responsive down to 390px; no horizontal scroll at any width tested.
- One `<h1>` per page, no heading-level jumps, labelled form controls, skip link,
  visible focus rings, and a `prefers-reduced-motion` block that stops the ticker.
- Item heading levels adapt to context: on a listing page they sit directly under
  the page `<h1>`, on the home page under each section's `<h2>`.
- Navigation is rendered by JS; a `<noscript>` fallback nav is on every page.
- The checkout button is a stub — this is a front end, not a shop.

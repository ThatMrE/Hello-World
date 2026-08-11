# HALF BAD — band website

A static site for **HALF BAD**, a fictional eight-piece ska band from Coventry.
No build step, no dependencies. Open `index.html` and it runs.

**Live:** https://half-bad.netlify.app

```bash
python3 -m http.server 8000   # then visit http://localhost:8000
```

## Pages

| Page | What is on it |
| --- | --- |
| `index.html` | Hero with live stat counters, next three shows, the new record, three merch picks |
| `tour.html` | 32 dates across four regions, filterable, with sold-out and low-ticket states, plus routing-request and accessibility callouts |
| `merch.html` | 11 products in four categories, size pickers, sold-out state, shipping and returns info |
| `music.html` | 5 releases with sleeve art, formats and expandable tracklists |
| `band.html` | Line-up, short history, press and booking contacts |
| `list.html` | Mailing-list signup with client-side validation |

The cart lives in `localStorage`, so it survives navigation between pages.

## How a page works

Each page is a thin shell: a `<body data-page="…">`, a few empty containers, and
two script tags. `main.js` renders everything shared — ticker, nav with its
current-page marker, footer, cart drawer. The chrome then has one source of
truth instead of six copies that drift apart. Each section renders only when its
container exists, so one JS file serves every page.

To add a page, copy a shell, set `data-page`, then add an entry to `NAV` in
`main.js`.

## Design reference

The look draws on what the best-known ska sites and sleeves share, rather than
copying any one:

- **2 Tone / Coventry** — the black-and-bone checkerboard, run as a repeating
  motif through the nav strip, hero, section rules and the display type.
- **Third-wave gig-poster** (Reel Big Fish, Less Than Jake school) — heavy
  condensed display type, hard offset drop-shadows, one loud accent color.
- **Trojan-era sleeve print** — mustard, oxblood and green against uncoated bone,
  with monospace as the secondary "printed ephemera" voice.

All artwork is original SVG drawn for this repo. Nothing traces or reproduces an
existing band's logo, mascot or sleeve.

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

To change a tour date, price, or tracklist, edit `assets/js/data.js` only. The
markup comes from it.

## Deploying

Netlify publishes the site. It links to this repo and builds on every push to
`master`, with a preview deploy per pull request, so the live site is never a
hand-made snapshot. `netlify.toml` supplies the publish directory and headers.

`tools/bundle.py` covers a different case: a host that wants plain files.

```bash
python3 tools/bundle.py        # writes dist/<page>.html, everything inlined
```

Each page in `dist/` stands alone: CSS and JS inlined, SVGs as data URIs. Links
between pages stay relative, so the folder works as a unit. The build fails
loudly if any `assets/` reference survives the rewrite, so a renamed image
cannot ship as a broken link. `.github/workflows/ci.yml` runs the same script
and fails if `dist/` drifted.

## Notes

- Responsive down to 390px. No horizontal scroll at any width tested.
- One `<h1>` per page, no heading-level jumps, labelled form controls, a skip
  link, visible focus rings, and a `prefers-reduced-motion` block that stops the
  ticker.
- Item heading levels adapt: under the page `<h1>` on a listing page, under each
  section's `<h2>` on the home page.
- JS renders the navigation. Every page carries a `<noscript>` fallback nav.
- The checkout button is a stub. This is a front end, not a shop.

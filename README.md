# HALF BAD — band website

A static site for **HALF BAD**, a (fictional) eight-piece ska band from Coventry.
No build step, no dependencies — open `index.html` and it runs.

**Live:** https://half-bad-official-site-cd-0ce7814b5e.netlify.app

```bash
python3 -m http.server 8000   # then visit http://localhost:8000
```

## Deploying

The live site is the single-file bundle, not the multi-file tree:

```bash
python3 tools/bundle.py        # writes dist/index.html, everything inlined
```

Re-deploy by rebuilding the bundle, pushing, and re-importing it to Netlify from
its public raw URL. `netlify.toml` covers the alternative route — pointing
Netlify (or any static host) straight at this repo, publishing the root with no
build step.

## Sections

| Section | What's in it |
| --- | --- |
| **Hero** | Band mark, tagline, live stat counters wired to the content files |
| **Tour** | 32 dates across four regions, filterable, with sold-out / low-ticket states and a routing-request callout |
| **Merch** | 11 products in four categories, size pickers, sold-out state, and a working cart that persists in `localStorage` |
| **Discography** | 5 releases with sleeve art, formats, and expandable tracklists |
| **Band** | Line-up and a short history |
| **Mailing list** | Client-side validated signup |

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
index.html              markup and section structure
assets/css/style.css    all styling, tokens at the top of the file
assets/js/data.js       tour dates, products, discography — edit copy here
assets/js/main.js       rendering, filters, cart, form
assets/img/*.svg        logo, hero art, sleeve art, product mockups
```

To change a tour date, a price, or a tracklist, edit `assets/js/data.js` only —
the markup is generated from it.

## Notes

- Responsive down to 390px; no horizontal scroll at any width tested.
- One `<h1>`, ordered headings, labelled form controls, skip link, visible focus
  rings, and a `prefers-reduced-motion` block that stops the ticker.
- The checkout button is a stub — this is a front end, not a shop.

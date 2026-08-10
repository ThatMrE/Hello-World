# The Analog Atlas

A researched world map of **analog astronaut mission locations** — the habitats, sealed
chambers, caves, deserts, ice sheets and undersea stations where people rehearse living on the
Moon and Mars — with every site rated on an eight-criterion **Analog Fidelity Index (AFI)**.

**79 locations · 34 countries · every continent including Antarctica.**

Static site, no framework, no build dependencies. Designed to deploy to Netlify.

---

## What's here

| Path | What it is |
|---|---|
| `index.html` | The whole site: definition, rubric, map, ranking, submission form, gallery, method |
| `assets/js/standards.js` | The Analog Fidelity Index — criteria, anchors, weights, tiers, scoring functions |
| `assets/js/sites.js` | The dataset: every location, with coordinates, metadata and scores |
| `assets/js/app.js` | Map, filters, ranking table, detail drawer, submissions, NASA imagery |
| `assets/css/style.css` | Space theme |
| `scripts/build-data.js` | Validates the dataset and emits `data/*.json|geojson|csv` |
| `netlify/functions/pexels.js` | Optional Pexels proxy (needs an API key; degrades silently) |
| `data/` | Generated machine-readable exports |

---

## What counts as an analog astronaut mission

Five conditions, spelled out in full on the site. The first three are necessary for the term to
mean anything; the last two separate a *mission* from a mere analog *site*.

1. **A crew, living the mission** — humans occupy the environment continuously, in flight roles.
2. **A maintained simulation** — the constraints of the target body are enforced, not imagined.
3. **Real, transferable stressors** — isolation, confinement, and something genuinely extreme.
4. **An operational framework** — flight plan, procedures, mission support, comms protocol,
   mission rules for anomalies and sim break.
5. **A research payload** — protocols, ethical oversight, baseline and post measurement, and
   data that leaves the habitat in a form somebody else can use.

## The Analog Fidelity Index

Eight criteria, each scored 0–5 against written anchors, combined as a weighted mean on 0–100.

| Code | Criterion | Default weight |
|---|---|---|
| ISO | Isolation & Confinement | 15% |
| ENV | Environmental & Geological Analogy | 12% |
| DUR | Duration & Mission Continuity | 15% |
| EVA | EVA & Suit Simulation | 12% |
| COM | Communication Latency & Autonomy | 12% |
| CLO | Resource Closure & Life Support | 11% |
| OPS | Operational Realism (SimOps) | 13% |
| SCI | Scientific Rigor & Data Return | 10% |

Tiers: **V Peak** (85+) · **IV High** (70–84.9) · **III Moderate** (55–69.9) ·
**II Entry** (40–54.9) · **I Experiential** (<40).

The weights are adjustable in the browser and the entire atlas re-ranks live, because the right
weighting depends on the question. Three presets ship with the site (behavioural health, surface
operations, field science).

> **This is not an official rating.** The rubric is informed by
> [analogstandards.space](https://analogstandards.space/), the IGSA-STD-1 standard (2023) and the
> EFCSA fidelity-classification work published in *Frontiers in Space Technologies*, but it is an
> independent index. No habitat operator has reviewed or endorsed its score. Where an operator
> disagrees, assume the operator is right and use the submission form.

## Submitting and updating locations

The map has a submission panel that does two things:

- **Adds the location to your own map immediately**, stored in `localStorage`, drawn in violet,
  included in filters, ranking and every export. Nothing leaves your browser.
- **Sends it for review** via [Netlify Forms](https://docs.netlify.com/forms/setup/) (form name
  `analog-site`), where a human checks it against the evidence you supplied before it enters the
  public dataset.

Submissions appear under **Forms** in the Netlify dashboard. Nothing a visitor submits changes
what other visitors see. To promote an accepted submission, add it to `assets/js/sites.js` and
push — `scripts/build-data.js` regenerates the exports on deploy.

If the form endpoint is unavailable (running from `file://`, a non-Netlify host, or offline) the
site says so plainly and keeps the local copy rather than pretending the submission was sent.

## Deploying to Netlify

**Git-based (recommended).** Connect this repository as a new Netlify site:

- Build command: `node scripts/build-data.js`
- Publish directory: `.`
- Functions directory: `netlify/functions`

Those values are already in `netlify.toml`, so Netlify picks them up automatically. Forms are
detected at deploy time from the static `<form data-netlify="true">` in `index.html`.

**CLI.**

```bash
npm i -g netlify-cli
netlify deploy --build --prod
```

## Imagery

The gallery and hero pull public-domain photographs live from the
[NASA Image and Video Library](https://images.nasa.gov) (`images-api.nasa.gov`) on every page
load — no API key, no bundled binaries, always current. If the API is unreachable the page falls
back to its procedural star field and says so.

Pexels needs an API key, so it is wired as an optional serverless proxy. Set `PEXELS_API_KEY` in
**Site settings → Environment variables** and a Pexels strip appends itself to the gallery; leave
it unset and the function returns 501 and the front end skips it silently. The key is never sent
to the browser, and only a whitelist of curated queries is forwarded upstream.

NASA material is generally not copyrighted, but check NASA's media usage guidelines before
republishing — and note that NASA does not endorse this or any other site.

## Data exports

`node scripts/build-data.js` validates the dataset (unique IDs, coordinate ranges, score ranges,
required fields — the build fails rather than shipping bad data) and writes:

- `data/analog-sites.json` — full records with default AFI and tier, plus the rubric itself
- `data/analog-sites.geojson` — FeatureCollection, drops straight into QGIS or Mapbox
- `data/analog-sites.csv` — flat table

The same three formats are downloadable from the site under your current weighting.

## Accuracy and known gaps

Every record is marked `exact` or `approx`. **Exact** is a published position for the facility
itself; **approx** is the settlement, crater, valley or campus hosting it, typically good to a
few kilometres — sometimes because the operator does not publish a precise location. Do not
navigate by this map.

Known gaps, listed on the site and open to contributions:

- The French node of the 2025 World's Biggest Analog is documented as participating but is not
  publicly named or located.
- Several university and national habitats commissioned since 2024 have no permanent public site.
- Analog programmes in South and Central America, West Africa and Southeast Asia are almost
  certainly under-represented here relative to reality.

## Credits

Map data © OpenStreetMap contributors · tiles © CARTO · [Leaflet](https://leafletjs.com) ·
imagery courtesy NASA. Not affiliated with NASA, ESA, the Austrian Space Forum, the Mars Society,
analogstandards.space or any habitat operator.

Dataset licensed CC BY 4.0 — attribute "The Analog Atlas".

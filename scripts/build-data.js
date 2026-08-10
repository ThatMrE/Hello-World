#!/usr/bin/env node
/*
 * Build step: derive machine-readable exports from assets/js/sites.js so the
 * dataset is consumable without running the page.
 *
 *   data/analog-sites.json     — full records + default AFI + tier
 *   data/analog-sites.geojson  — same, as a FeatureCollection
 *   data/analog-sites.csv      — flat table
 *
 * Run: node scripts/build-data.js
 */

const fs = require('fs');
const path = require('path');
const vm = require('vm');

const root = path.join(__dirname, '..');
const out = path.join(root, 'data');

const sandbox = { window: {} };
vm.createContext(sandbox);
for (const f of ['assets/js/standards.js', 'assets/js/sites.js']) {
  vm.runInContext(fs.readFileSync(path.join(root, f), 'utf8'), sandbox, { filename: f });
}

const AFI = sandbox.window.AFI;
const SITES = sandbox.window.ANALOG_SITES;

if (!AFI || !Array.isArray(SITES) || !SITES.length) {
  console.error('build-data: could not load AFI or ANALOG_SITES');
  process.exit(1);
}

// Integrity checks — fail the build on bad data rather than shipping it.
const seen = new Set();
const problems = [];
for (const s of SITES) {
  if (!s.id) problems.push(`missing id: ${s.name}`);
  if (seen.has(s.id)) problems.push(`duplicate id: ${s.id}`);
  seen.add(s.id);
  if (typeof s.lat !== 'number' || s.lat < -90 || s.lat > 90) problems.push(`bad lat: ${s.id}`);
  if (typeof s.lon !== 'number' || s.lon < -180 || s.lon > 180) problems.push(`bad lon: ${s.id}`);
  if (!s.country) problems.push(`missing country: ${s.id}`);
  for (const c of AFI.CRITERIA) {
    const v = (s.scores || {})[c.key];
    if (typeof v !== 'number' || v < 0 || v > 5) problems.push(`bad score ${c.key}: ${s.id}`);
  }
}
if (problems.length) {
  console.error('build-data: dataset problems\n  ' + problems.join('\n  '));
  process.exit(1);
}

const rows = SITES.map((s) => {
  const afi = AFI.score(s);
  return Object.assign({}, s, { afi: afi, tier: AFI.tier(afi).code, tier_name: AFI.tier(afi).name });
});

fs.mkdirSync(out, { recursive: true });

fs.writeFileSync(
  path.join(out, 'analog-sites.json'),
  JSON.stringify(
    {
      name: 'The Analog Atlas',
      description: 'Analog astronaut mission locations worldwide, scored on the Analog Fidelity Index v1.0.',
      generated: new Date().toISOString().slice(0, 10),
      count: rows.length,
      license: 'CC BY 4.0 — attribute "The Analog Atlas"',
      criteria: AFI.CRITERIA.map((c) => ({ key: c.key, code: c.code, name: c.name, weight: c.weight })),
      tiers: AFI.TIERS.map((t) => ({ code: t.code, name: t.name, min: t.min })),
      sites: rows
    },
    null,
    2
  ) + '\n'
);

fs.writeFileSync(
  path.join(out, 'analog-sites.geojson'),
  JSON.stringify(
    {
      type: 'FeatureCollection',
      features: rows.map((s) => {
        const props = Object.assign({}, s);
        delete props.lat;
        delete props.lon;
        return { type: 'Feature', geometry: { type: 'Point', coordinates: [s.lon, s.lat] }, properties: props };
      })
    },
    null,
    2
  ) + '\n'
);

const cols = ['id', 'name', 'alias', 'operator', 'country', 'region', 'lat', 'lon', 'precision', 'env',
  'kind', 'target', 'status', 'since', 'crew', 'duration', 'url', 'afi', 'tier']
  .concat(AFI.CRITERIA.map((c) => 'score_' + c.key));

const cell = (v) => {
  v = v == null ? '' : String(v);
  return /[",\n]/.test(v) ? '"' + v.replace(/"/g, '""') + '"' : v;
};

fs.writeFileSync(
  path.join(out, 'analog-sites.csv'),
  [cols.join(',')]
    .concat(rows.map((s) => cols.map((c) =>
      cell(c.startsWith('score_') ? (s.scores || {})[c.slice(6)] : s[c])).join(',')))
    .join('\n') + '\n'
);

const byTier = {};
rows.forEach((r) => { byTier[r.tier] = (byTier[r.tier] || 0) + 1; });
const countries = new Set(rows.map((r) => r.country));

console.log(`build-data: ${rows.length} sites across ${countries.size} countries`);
console.log('build-data: tiers ' + AFI.TIERS.map((t) => `${t.code}=${byTier[t.code] || 0}`).join(' '));
console.log('build-data: wrote data/analog-sites.{json,geojson,csv}');

/* ============================================================
   THE ANALOG ATLAS — application
   ============================================================ */
(function () {
'use strict';

var AFI = window.AFI;
var BASE = window.ANALOG_SITES;
var LS_KEY = 'analog-atlas:local-sites:v1';
var LS_W   = 'analog-atlas:weights:v1';

var weights = loadWeights();
var localSites = loadLocal();
var selectedId = null;
var sortKey = 'afi', sortDir = -1;
var map, markerLayer, markers = {};

/* ───────────────────────── helpers ───────────────────────── */

function $(s, r) { return (r || document).querySelector(s); }
function $$(s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); }
function esc(s) {
  return String(s == null ? '' : s)
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
}
function all() { return BASE.concat(localSites); }
function afi(site) { return AFI.scoreWith(site, weights); }

function tierColor(t) {
  return { I: '#6b7690', II: '#7fb3ff', III: '#5ce1e6', IV: '#ffc14d', V: '#ff7a3d' }[t.code] || '#6b7690';
}

var ENV_LABEL = {
  desert: 'Desert', volcanic: 'Volcanic', polar: 'Polar', arctic: 'Arctic',
  cave: 'Cave / lava tube', underwater: 'Underwater', crater: 'Impact crater',
  altitude: 'High altitude', chamber: 'Sealed chamber', 'analog-terrain': 'Analog terrain'
};
var KIND_LABEL = {
  habitat: 'Crewed habitat', chamber: 'Isolation chamber', field: 'Field test site',
  expedition: 'Expedition analog', underwater: 'Undersea habitat', planned: 'Planned',
  historic: 'Historic'
};

function loadWeights() {
  var w = {};
  AFI.CRITERIA.forEach(function (c) { w[c.key] = c.weight; });
  try {
    var s = JSON.parse(localStorage.getItem(LS_W) || 'null');
    if (s) AFI.CRITERIA.forEach(function (c) { if (typeof s[c.key] === 'number') w[c.key] = s[c.key]; });
  } catch (e) { /* ignore */ }
  return w;
}
function saveWeights() { try { localStorage.setItem(LS_W, JSON.stringify(weights)); } catch (e) {} }

function loadLocal() {
  try { return JSON.parse(localStorage.getItem(LS_KEY) || '[]') || []; }
  catch (e) { return []; }
}
function saveLocal() { try { localStorage.setItem(LS_KEY, JSON.stringify(localSites)); } catch (e) {} }

/* ───────────────────────── starfield ───────────────────────── */

(function starfield() {
  var cv = $('#starfield');
  if (!cv) return;
  var ctx = cv.getContext('2d');
  var stars = [], w = 0, h = 0;
  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function seed() {
    w = cv.width = window.innerWidth;
    h = cv.height = window.innerHeight;
    var n = Math.min(340, Math.round(w * h / 5200));
    stars = [];
    for (var i = 0; i < n; i++) {
      stars.push({
        x: Math.random() * w, y: Math.random() * h,
        r: Math.random() * 1.25 + 0.25,
        a: Math.random() * 0.6 + 0.15,
        s: Math.random() * 0.012 + 0.003,
        p: Math.random() * Math.PI * 2
      });
    }
  }
  function draw(t) {
    ctx.clearRect(0, 0, w, h);
    for (var i = 0; i < stars.length; i++) {
      var s = stars[i];
      var a = reduce ? s.a : s.a + Math.sin(t * s.s + s.p) * 0.28;
      if (a < 0.04) a = 0.04;
      ctx.beginPath();
      ctx.fillStyle = 'rgba(220,232,255,' + a.toFixed(3) + ')';
      ctx.arc(s.x, s.y, s.r, 0, 6.2832);
      ctx.fill();
    }
    if (!reduce) requestAnimationFrame(draw);
  }
  seed(); requestAnimationFrame(draw);
  var to;
  window.addEventListener('resize', function () {
    clearTimeout(to);
    to = setTimeout(function () { seed(); if (reduce) draw(0); }, 200);
  });
})();

/* ───────────────────────── static content ───────────────────────── */

function renderDefinition() {
  $('#defineGrid').innerHTML = AFI.DEFINITION.map(function (d) {
    return '<article class="card"><div class="num">CONDITION ' + d.n + '</div>' +
      '<h3>' + esc(d.title) + '</h3><p>' + esc(d.body) + '</p></article>';
  }).join('');
}

function renderCriteria() {
  $('#critGrid').innerHTML = AFI.CRITERIA.map(function (c) {
    return '<article class="card crit">' +
      '<div class="crit-head"><span class="crit-code">' + c.code + '</span>' +
      '<h3 style="margin:0">' + esc(c.name) + '</h3>' +
      '<span class="crit-w" data-wlabel="' + c.key + '">' + Math.round(weights[c.key] * 100) + '%</span></div>' +
      '<p class="crit-short">' + esc(c.short) + '</p>' +
      '<p class="detail">' + esc(c.detail) + '</p>' +
      '<ul class="anchors">' + c.anchors.map(function (a) {
        var i = a.indexOf('—');
        return '<li><b>' + esc(a.slice(0, i).trim()) + '</b><span>' + esc(a.slice(i + 1).trim()) + '</span></li>';
      }).join('') + '</ul></article>';
  }).join('');
}

function renderTiers() {
  $('#tierLegend').innerHTML = AFI.TIERS.map(function (t) {
    var next = t.min >= 85 ? '100' : (AFI.TIERS[AFI.TIERS.indexOf(t) - 1].min - 0.1).toFixed(1);
    return '<div class="tier-row"><div class="tier-badge ' + t.cls + '">' + t.code + '</div>' +
      '<div><b>' + esc(t.name) + '</b> <span style="font-family:var(--mono);color:var(--text-faint)">· AFI ' +
      t.min + '–' + next + '</span><br><span>' + esc(t.blurb) + '</span></div></div>';
  }).join('');
}

function renderWeightPanel() {
  $('#weightPanel').innerHTML = AFI.CRITERIA.map(function (c) {
    return '<div class="weight"><label for="w_' + c.key + '">' + c.code +
      ' <i data-wval="' + c.key + '">' + Math.round(weights[c.key] * 100) + '%</i></label>' +
      '<input type="range" id="w_' + c.key + '" data-wkey="' + c.key + '" min="0" max="30" step="1" value="' +
      Math.round(weights[c.key] * 100) + '"></div>';
  }).join('');

  $$('#weightPanel input[type=range]').forEach(function (el) {
    el.addEventListener('input', function () {
      weights[el.dataset.wkey] = Number(el.value) / 100;
      syncWeightLabels();
      saveWeights();
      refresh();
    });
  });
}

function syncWeightLabels() {
  var sum = 0;
  AFI.CRITERIA.forEach(function (c) { sum += weights[c.key]; });
  AFI.CRITERIA.forEach(function (c) {
    var pct = sum ? Math.round((weights[c.key] / sum) * 100) : 0;
    var a = $('[data-wval="' + c.key + '"]'); if (a) a.textContent = pct + '%';
    var b = $('[data-wlabel="' + c.key + '"]'); if (b) b.textContent = pct + '%';
  });
}

function applyPreset(map_) {
  AFI.CRITERIA.forEach(function (c) { weights[c.key] = map_[c.key]; });
  $$('#weightPanel input[type=range]').forEach(function (el) {
    el.value = Math.round(weights[el.dataset.wkey] * 100);
  });
  syncWeightLabels(); saveWeights(); refresh();
}

/* ───────────────────────── filters ───────────────────────── */

function filtered() {
  var q = ($('#q').value || '').trim().toLowerCase();
  var region = $('#fRegion').value, env = $('#fEnv').value;
  var target = $('#fTarget').value, status = $('#fStatus').value, tier = $('#fTier').value;

  return all().filter(function (s) {
    if (region && s.region !== region) return false;
    if (env && s.env !== env) return false;
    if (target && s.target !== target) return false;
    if (status && s.status !== status) return false;
    if (tier && AFI.tier(afi(s)).code !== tier) return false;
    if (q) {
      var hay = [s.name, s.alias, s.operator, s.country, s.region, s.summary].join(' ').toLowerCase();
      if (hay.indexOf(q) === -1) return false;
    }
    return true;
  });
}

function fillSelect(sel, values, labeler) {
  var cur = sel.value;
  var first = sel.options[0].outerHTML;
  sel.innerHTML = first + values.map(function (v) {
    return '<option value="' + esc(v) + '">' + esc(labeler ? labeler(v) : v) + '</option>';
  }).join('');
  sel.value = cur;
}

function buildFilters() {
  var list = all();
  var uniq = function (k) {
    var out = [];
    list.forEach(function (s) { if (s[k] && out.indexOf(s[k]) === -1) out.push(s[k]); });
    return out.sort();
  };
  fillSelect($('#fRegion'), uniq('region'));
  fillSelect($('#fEnv'), uniq('env'), function (v) { return ENV_LABEL[v] || v; });
  fillSelect($('#fTarget'), uniq('target'));
  fillSelect($('#fStatus'), uniq('status'), function (v) { return v.charAt(0).toUpperCase() + v.slice(1); });
}

/* ───────────────────────── map ───────────────────────── */

function initMap() {
  if (typeof L === 'undefined') {
    $('#map').innerHTML =
      '<div style="padding:34px;color:var(--text-dim);font-size:.9rem;max-width:46ch">' +
      '<b style="color:var(--plume)">Map library unavailable.</b><br><br>Leaflet is loaded from a ' +
      'CDN and this network blocked it. Everything else on the page still works — the list, ' +
      'filters, fidelity ranking, detail records and data exports all run from the local ' +
      'dataset.</div>';
    return;
  }
  map = L.map('map', {
    center: [24, 12], zoom: 2, minZoom: 2, worldCopyJump: true,
    scrollWheelZoom: false, attributionControl: true
  });
  map.on('click', function () { map.scrollWheelZoom.enable(); });
  map.on('mouseout', function () { map.scrollWheelZoom.disable(); });

  L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/attributions">CARTO</a>',
    subdomains: 'abcd', maxZoom: 19
  }).addTo(map);

  markerLayer = L.layerGroup().addTo(map);
}

function drawMarkers(list) {
  if (!markerLayer) return;
  markerLayer.clearLayers();
  markers = {};
  list.forEach(function (s) {
    var score = afi(s);
    var t = AFI.tier(score);
    var col = s.local ? '#9d7bff' : tierColor(t);
    var size = 9 + Math.round(score / 8);
    var pulse = score >= 70 ? ' pulse' : '';
    var icon = L.divIcon({
      className: '',
      html: '<div class="marker-dot' + pulse + '" style="color:' + col +
            ';width:' + size + 'px;height:' + size + 'px"></div>',
      iconSize: [size, size], iconAnchor: [size / 2, size / 2]
    });
    var m = L.marker([s.lat, s.lon], { icon: icon, title: s.name }).addTo(markerLayer);
    m.bindPopup(
      '<b>' + esc(s.name) + '</b><br>' +
      '<span style="color:#97a3c4">' + esc(s.flag || '') + ' ' + esc(s.country) + ' · ' +
      esc(ENV_LABEL[s.env] || s.env) + '</span><br>' +
      '<span style="font-family:ui-monospace,monospace">AFI ' + score.toFixed(1) +
      ' · Tier ' + t.code + '</span><br>' +
      '<a href="#" data-open="' + esc(s.id) + '">Open full record →</a>'
    );
    m.on('click', function () { select(s.id, false); });
    markers[s.id] = m;
  });

  map.on('popupopen', function (e) {
    var a = e.popup.getElement().querySelector('[data-open]');
    if (a) a.addEventListener('click', function (ev) {
      ev.preventDefault(); select(a.getAttribute('data-open'), false);
    });
  });
}

/* ───────────────────────── list ───────────────────────── */

function drawList(list) {
  var sorted = list.slice().sort(function (a, b) { return afi(b) - afi(a); });
  $('#siteList').innerHTML = sorted.map(function (s) {
    var score = afi(s), t = AFI.tier(score);
    return '<div class="site-item' + (s.id === selectedId ? ' on' : '') + '" data-id="' + esc(s.id) + '">' +
      '<b>' + esc(s.flag || '') + ' ' + esc(s.name) + '</b>' +
      '<span class="afi-chip" style="background:' + (s.local ? '#9d7bff' : tierColor(t)) + '">' +
      score.toFixed(0) + '</span>' +
      '<small>' + esc(s.country) + ' · ' + esc(ENV_LABEL[s.env] || s.env) + ' · ' + esc(s.status) + '</small>' +
      '</div>';
  }).join('') || '<div style="padding:20px;color:var(--text-faint);font-size:.85rem">No locations match those filters.</div>';

  $$('#siteList .site-item').forEach(function (el) {
    el.addEventListener('click', function () { select(el.dataset.id, true); });
  });
  $('#shownCount').textContent = list.length + ' of ' + all().length + ' shown';
}

/* ───────────────────────── ranking table ───────────────────────── */

function drawTable(list) {
  var rows = list.slice();
  rows.sort(function (a, b) {
    var va, vb;
    if (sortKey === 'afi') { va = afi(a); vb = afi(b); }
    else if (sortKey === 'tier') { va = afi(a); vb = afi(b); }
    else if (sortKey === 'rank') { va = afi(a); vb = afi(b); }
    else if (['name', 'country', 'env'].indexOf(sortKey) >= 0) {
      va = String(a[sortKey === 'env' ? 'env' : sortKey] || '').toLowerCase();
      vb = String(b[sortKey === 'env' ? 'env' : sortKey] || '').toLowerCase();
      return va < vb ? -sortDir : va > vb ? sortDir : 0;
    } else { va = (a.scores || {})[sortKey] || 0; vb = (b.scores || {})[sortKey] || 0; }
    return (va - vb) * sortDir;
  });

  $('#rankBody').innerHTML = rows.map(function (s, i) {
    var score = afi(s), t = AFI.tier(score), sc = s.scores || {};
    return '<tr data-id="' + esc(s.id) + '">' +
      '<td class="num" style="color:var(--text-faint)">' + (i + 1) + '</td>' +
      '<td><b>' + esc(s.flag || '') + ' ' + esc(s.name) + '</b><br>' +
      '<span style="color:var(--text-faint);font-size:.78rem">' + esc(s.operator || '') + '</span></td>' +
      '<td style="color:var(--text-dim)">' + esc(s.country) + '</td>' +
      '<td style="color:var(--text-dim)">' + esc(ENV_LABEL[s.env] || s.env) + '</td>' +
      '<td class="num" style="color:' + tierColor(t) + ';font-weight:700">' + score.toFixed(1) + '</td>' +
      '<td><span class="tier-badge ' + t.cls + '" style="display:inline-block;padding:2px 8px;font-size:.7rem">' + t.code + '</span></td>' +
      ['isolation', 'environment', 'duration', 'eva', 'comms', 'closure', 'ops', 'science'].map(function (k) {
        return '<td class="num" style="color:var(--text-dim)">' + (sc[k] != null ? sc[k] : '–') + '</td>';
      }).join('') +
      '</tr>';
  }).join('');

  $$('#rankBody tr').forEach(function (tr) {
    tr.addEventListener('click', function () { select(tr.dataset.id, true); });
  });
}

/* ───────────────────────── detail drawer ───────────────────────── */

function radar(site) {
  var R = 92, cx = 118, cy = 112, n = AFI.CRITERIA.length;
  function pt(i, r) {
    var a = (Math.PI * 2 * i / n) - Math.PI / 2;
    return [cx + Math.cos(a) * r, cy + Math.sin(a) * r];
  }
  var rings = '';
  [0.25, 0.5, 0.75, 1].forEach(function (f) {
    var pts = [];
    for (var i = 0; i < n; i++) pts.push(pt(i, R * f).map(function (v) { return v.toFixed(1); }).join(','));
    rings += '<polygon points="' + pts.join(' ') + '" fill="none" stroke="#26304d" stroke-width="1"/>';
  });
  var axes = '', labels = '', shape = [];
  for (var i = 0; i < n; i++) {
    var c = AFI.CRITERIA[i];
    var v = (site.scores || {})[c.key] || 0;
    var o = pt(i, R), l = pt(i, R + 17), s = pt(i, R * (v / 5));
    axes += '<line x1="' + cx + '" y1="' + cy + '" x2="' + o[0].toFixed(1) + '" y2="' + o[1].toFixed(1) + '" stroke="#1b2136"/>';
    labels += '<text x="' + l[0].toFixed(1) + '" y="' + (l[1] + 4).toFixed(1) +
      '" text-anchor="middle" font-size="9" font-family="ui-monospace,monospace" fill="#64708f">' + c.code + '</text>';
    shape.push(s.map(function (q) { return q.toFixed(1); }).join(','));
  }
  return '<svg class="radar" width="236" height="236" viewBox="0 0 236 236" role="img" aria-label="Fidelity profile">' +
    rings + axes +
    '<polygon points="' + shape.join(' ') + '" fill="rgba(92,225,230,.18)" stroke="#5ce1e6" stroke-width="2"/>' +
    shape.map(function (p) {
      var xy = p.split(',');
      return '<circle cx="' + xy[0] + '" cy="' + xy[1] + '" r="2.6" fill="#ff7a3d"/>';
    }).join('') + labels + '</svg>';
}

function select(id, pan) {
  var s = all().filter(function (x) { return x.id === id; })[0];
  if (!s) return;
  selectedId = id;

  var score = afi(s), t = AFI.tier(score), col = tierColor(t);

  var bars = AFI.CRITERIA.map(function (c) {
    var v = (s.scores || {})[c.key] || 0;
    return '<div class="bar"><span title="' + esc(c.name) + '">' + c.code + '</span>' +
      '<span class="track"><span class="fill" style="width:' + (v / 5 * 100) + '%"></span></span>' +
      '<span style="text-align:right;color:var(--text)">' + v + '</span></div>';
  }).join('');

  $('#detailIn').innerHTML =
    '<button class="detail-close" id="detailClose" aria-label="Close">✕</button>' +
    '<h3>' + esc(s.flag || '') + ' ' + esc(s.name) + '</h3>' +
    '<p class="sub">' + esc(s.alias && s.alias !== s.name ? s.alias + ' · ' : '') +
      esc(s.operator || '') + '</p>' +
    '<div class="afi-hero">' +
      '<span class="afi-big" style="color:' + col + '">' + score.toFixed(1) + '</span>' +
      '<div><span class="afi-tier ' + t.cls + '">TIER ' + t.code + ' · ' + esc(t.name.toUpperCase()) + '</span>' +
      '<div style="font-family:var(--mono);font-size:.68rem;color:var(--text-faint);margin-top:6px">' +
      'Analog Fidelity Index · current weighting</div></div>' +
    '</div>' +
    radar(s) +
    '<div class="bars">' + bars + '</div>' +
    '<p class="body" style="margin-top:20px">' + esc(s.summary || '') + '</p>' +
    '<dl class="kv">' +
      row('Country', esc(s.country) + (s.region ? ' · ' + esc(s.region) : '')) +
      row('Coordinates', '<span style="font-family:var(--mono)">' + s.lat.toFixed(4) + ', ' + s.lon.toFixed(4) +
          '</span> <span style="color:var(--text-faint)">(' + esc(s.precision || 'approx') + ')</span>') +
      row('Environment', esc(ENV_LABEL[s.env] || s.env)) +
      row('Type', esc(KIND_LABEL[s.kind] || s.kind)) +
      row('Target', esc(s.target || '—')) +
      row('Status', esc(s.status || '—')) +
      row('Since', esc(s.since || '—')) +
      row('Crew', esc(s.crew || '—')) +
      row('Duration', esc(s.duration || '—')) +
      (s.url ? row('Website', '<a href="' + esc(s.url) + '" target="_blank" rel="noopener">' +
        esc(String(s.url).replace(/^https?:\/\//, '').replace(/\/$/, '')) + ' ↗</a>') : '') +
    '</dl>' +
    (s.local ? '<div class="callout" style="margin-top:14px">Added by you in this browser. ' +
      'It is not part of the published dataset until reviewed.</div>' : '') +
    '<div class="btn-row"><a class="btn" href="https://www.openstreetmap.org/?mlat=' + s.lat +
      '&mlon=' + s.lon + '#map=9/' + s.lat + '/' + s.lon + '" target="_blank" rel="noopener">View on OSM ↗</a>' +
      '<a class="btn" href="#submit" id="challengeBtn">Challenge this score</a></div>';

  function row(k, v) { return '<dt>' + k + '</dt><dd>' + v + '</dd>'; }

  var d = $('#detail');
  d.classList.add('open');
  d.setAttribute('aria-hidden', 'false');
  $('#detailClose').addEventListener('click', closeDetail);
  var cb = $('#challengeBtn');
  if (cb) cb.addEventListener('click', function () {
    closeDetail();
    $('#f_kind').value = 'score';
    $('#f_name').value = s.name;
    $('#f_country').value = s.country;
    $('#f_lat').value = s.lat; $('#f_lon').value = s.lon;
    AFI.CRITERIA.forEach(function (c) {
      var el = $('#s_' + c.key); if (el) el.value = (s.scores || {})[c.key] || 0;
    });
  });

  if (pan && markers[s.id]) { map.setView([s.lat, s.lon], Math.max(map.getZoom(), 5)); markers[s.id].openPopup(); }
  drawList(filtered());
}

function closeDetail() {
  var d = $('#detail');
  d.classList.remove('open');
  d.setAttribute('aria-hidden', 'true');
}
document.addEventListener('keydown', function (e) { if (e.key === 'Escape') closeDetail(); });

/* ───────────────────────── stats ───────────────────────── */

function drawStats() {
  var list = all();
  var countries = {}, active = 0, high = 0;
  list.forEach(function (s) {
    countries[s.country] = 1;
    if (s.status === 'active' || s.status === 'seasonal') active++;
    var code = AFI.tier(afi(s)).code;
    if (code === 'IV' || code === 'V') high++;
  });
  $('#statSites').textContent = list.length;
  $('#statCountries').textContent = Object.keys(countries).length;
  $('#statActive').textContent = active;
  $('#statPeak').textContent = high;
  $('#siteCountEyebrow').textContent = list.length;
}

/* ───────────────────────── exports ───────────────────────── */

function exportRows() {
  return all().map(function (s) {
    var o = JSON.parse(JSON.stringify(s));
    o.afi_default = AFI.score(s);
    o.afi_current = afi(s);
    o.tier = AFI.tier(afi(s)).code;
    return o;
  });
}
function download(name, mime, text) {
  var b = new Blob([text], { type: mime });
  var a = document.createElement('a');
  a.href = URL.createObjectURL(b); a.download = name;
  document.body.appendChild(a); a.click();
  setTimeout(function () { URL.revokeObjectURL(a.href); a.remove(); }, 1000);
}
function toGeoJSON() {
  return JSON.stringify({
    type: 'FeatureCollection',
    features: exportRows().map(function (s) {
      var p = JSON.parse(JSON.stringify(s));
      delete p.lat; delete p.lon;
      return { type: 'Feature', geometry: { type: 'Point', coordinates: [s.lon, s.lat] }, properties: p };
    })
  }, null, 2);
}
function toCSV() {
  var cols = ['id', 'name', 'operator', 'country', 'region', 'lat', 'lon', 'precision', 'env', 'kind',
    'target', 'status', 'since', 'crew', 'duration', 'url', 'afi_default', 'afi_current', 'tier']
    .concat(AFI.CRITERIA.map(function (c) { return 'score_' + c.key; }));
  var esc2 = function (v) {
    v = v == null ? '' : String(v);
    return /[",\n]/.test(v) ? '"' + v.replace(/"/g, '""') + '"' : v;
  };
  var lines = [cols.join(',')];
  exportRows().forEach(function (s) {
    lines.push(cols.map(function (c) {
      if (c.indexOf('score_') === 0) return esc2((s.scores || {})[c.slice(6)]);
      return esc2(s[c]);
    }).join(','));
  });
  return lines.join('\n');
}

/* ───────────────────────── submission form ───────────────────────── */

function renderScoreInputs() {
  $('#scoreInputs').innerHTML = AFI.CRITERIA.map(function (c) {
    return '<div class="field"><label for="s_' + c.key + '" title="' + esc(c.detail) + '">' +
      c.code + ' · ' + esc(c.name.split(' ')[0]) + '</label>' +
      '<input id="s_' + c.key + '" name="score_' + c.key + '" type="number" min="0" max="5" step="1" value="0"></div>';
  }).join('');
}

function readForm() {
  var f = $('#siteForm');
  var scores = {};
  AFI.CRITERIA.forEach(function (c) {
    var v = Number(($('#s_' + c.key) || {}).value || 0);
    scores[c.key] = Math.max(0, Math.min(5, isNaN(v) ? 0 : v));
  });
  var lat = parseFloat(f.lat.value), lon = parseFloat(f.lon.value);
  if (isNaN(lat) || isNaN(lon) || lat < -90 || lat > 90 || lon < -180 || lon > 180) return null;
  return {
    id: 'local-' + Date.now().toString(36),
    name: f.name.value.trim(),
    alias: '', operator: f.operator.value.trim(), country: f.country.value.trim(),
    flag: '📍', region: 'User submitted',
    lat: lat, lon: lon, precision: 'approx',
    env: f.environment.value, kind: 'habitat', target: f.target.value,
    status: f.status.value, since: '', crew: f.crew.value.trim(),
    duration: f.duration.value.trim(), url: f.url.value.trim(),
    summary: f.summary.value.trim(), scores: scores, local: true
  };
}

function msg(kind, text) {
  var m = $('#formMsg');
  m.className = 'msg ' + kind;
  m.textContent = text;
}

function addLocal(site) {
  localSites.push(site);
  saveLocal();
  buildFilters();
  refresh();
  drawStats();
  renderLocalList();
}

function renderLocalList() {
  var el = $('#localList');
  if (!localSites.length) {
    el.innerHTML = '<span style="color:var(--text-faint)">Nothing added yet.</span>';
    return;
  }
  el.innerHTML = localSites.map(function (s) {
    return '<div style="display:flex;justify-content:space-between;gap:10px;padding:5px 0;border-bottom:1px solid var(--line-soft)">' +
      '<a href="#atlas" data-goto="' + esc(s.id) + '">' + esc(s.name) + '</a>' +
      '<span style="color:var(--violet)">' + afi(s).toFixed(0) + '</span></div>';
  }).join('');
  $$('#localList [data-goto]').forEach(function (a) {
    a.addEventListener('click', function () { setTimeout(function () { select(a.dataset.goto, true); }, 260); });
  });
}

function wireForm() {
  var form = $('#siteForm');

  $('#addLocalOnly').addEventListener('click', function () {
    var s = readForm();
    if (!s || !s.name || !s.country) { msg('err', 'Name, country and valid coordinates are required.'); return; }
    addLocal(s);
    msg('ok', '“' + s.name + '” added to your map. It has not been sent anywhere.');
    setTimeout(function () { select(s.id, true); document.getElementById('atlas').scrollIntoView(); }, 300);
  });

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    var s = readForm();
    if (!s || !s.name || !s.country) { msg('err', 'Name, country and valid coordinates are required.'); return; }
    $('#f_afi').value = AFI.score(s).toFixed(1);

    var data = new FormData(form);
    var body = new URLSearchParams();
    data.forEach(function (v, k) { body.append(k, v); });

    fetch('/', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: body.toString()
    }).then(function (r) {
      addLocal(s);
      if (r.ok) {
        msg('ok', 'Received. “' + s.name + '” is on your map now and queued for review.');
        form.reset(); renderScoreInputs();
      } else {
        msg('ok', '“' + s.name + '” was added to your map. The submission endpoint is not ' +
          'available on this deployment, so it was not sent for review — export your additions ' +
          'and send them instead.');
      }
    }).catch(function () {
      addLocal(s);
      msg('ok', '“' + s.name + '” was added to your map. It could not be transmitted (offline or ' +
        'running locally), so nothing was sent for review.');
    });
  });

  $('#exportLocal').addEventListener('click', function () {
    if (!localSites.length) { msg('err', 'You have not added any locations yet.'); return; }
    download('analog-atlas-my-sites.json', 'application/json', JSON.stringify(localSites, null, 2));
  });

  $('#clearLocal').addEventListener('click', function () {
    if (!localSites.length) return;
    if (!confirm('Remove all ' + localSites.length + ' locations you added in this browser?')) return;
    localSites = []; saveLocal(); buildFilters(); refresh(); drawStats(); renderLocalList();
  });
}

/* ───────────────────────── imagery ───────────────────────── */

var NASA_QUERIES = [
  { q: 'Mars Perseverance surface', cap: 'Martian surface' },
  { q: 'Apollo lunar surface astronaut', cap: 'Lunar surface' },
  { q: 'HI-SEAS analog habitat', cap: 'Analog habitat' },
  { q: 'NEEMO aquanaut undersea', cap: 'Undersea analog' },
  { q: 'Desert RATS rover field test', cap: 'Field analog' },
  { q: 'HERA analog crew', cap: 'Isolation analog' },
  { q: 'Haughton Mars Project Devon Island', cap: 'Arctic analog' },
  { q: 'Antarctica research station', cap: 'Polar analog' },
  { q: 'spacewalk EVA astronaut', cap: 'EVA' },
  { q: 'Mars Dune Alpha CHAPEA', cap: 'Simulated Mars habitat' },
  { q: 'lava tube volcanic terrain', cap: 'Volcanic analog' },
  { q: 'Curiosity Gale Crater panorama', cap: 'Gale Crater' }
];

function nasaSearch(q) {
  return fetch('https://images-api.nasa.gov/search?media_type=image&q=' + encodeURIComponent(q))
    .then(function (r) { return r.ok ? r.json() : null; })
    .then(function (j) {
      if (!j || !j.collection || !j.collection.items || !j.collection.items.length) return null;
      var items = j.collection.items.filter(function (it) { return it.links && it.links[0] && it.links[0].href; });
      if (!items.length) return null;
      var pick = items[Math.floor(Math.random() * Math.min(items.length, 12))];
      var thumb = pick.links[0].href;
      var data = (pick.data && pick.data[0]) || {};
      return {
        thumb: thumb,
        medium: thumb.replace('~thumb.jpg', '~medium.jpg'),
        title: data.title || q,
        center: data.center || 'NASA'
      };
    })
    .catch(function () { return null; });
}

function loadHero() {
  nasaSearch('Mars surface panorama').then(function (img) {
    if (!img) return;
    var el = $('#heroImg');
    el.onerror = function () { el.onerror = null; el.src = img.thumb; };
    el.src = img.medium;
    el.alt = img.title;
    $('#heroCredit').textContent = img.title.slice(0, 90) + ' — ' + img.center;
  });
}

function loadGallery() {
  var g = $('#gallery');
  g.innerHTML = NASA_QUERIES.map(function (_, i) {
    return '<figure class="shot" data-i="' + i + '"><figcaption>loading…</figcaption></figure>';
  }).join('');

  var ok = 0;
  NASA_QUERIES.forEach(function (spec, i) {
    nasaSearch(spec.q).then(function (img) {
      var fig = g.querySelector('[data-i="' + i + '"]');
      if (!fig) return;
      if (!img) { fig.querySelector('figcaption').textContent = spec.cap + ' — image unavailable'; return; }
      ok++;
      var im = new Image();
      im.loading = 'lazy';
      im.alt = img.title;
      im.onerror = function () { im.onerror = null; im.src = img.thumb; };
      im.src = img.medium;
      fig.insertBefore(im, fig.firstChild);
      fig.querySelector('figcaption').textContent = spec.cap + ' · ' + img.title.slice(0, 60);
    });
  });

  setTimeout(function () {
    $('#galleryNote').textContent = ok
      ? ok + ' images retrieved live from the NASA Image and Video Library. Public domain; NASA does not endorse this site.'
      : 'NASA imagery could not be reached from this network — the page falls back to its procedural star field.';
  }, 4000);

  loadPexels();
}

/* Optional Pexels strip. Requires PEXELS_API_KEY in the Netlify environment;
   silently does nothing if the function is absent or unconfigured. */
function loadPexels() {
  fetch('/.netlify/functions/pexels?query=' + encodeURIComponent('desert night sky stars'))
    .then(function (r) { return r.ok ? r.json() : null; })
    .then(function (j) {
      if (!j || !j.photos || !j.photos.length) return;
      var g = $('#gallery');
      j.photos.slice(0, 4).forEach(function (p) {
        var fig = document.createElement('figure');
        fig.className = 'shot';
        var im = new Image();
        im.loading = 'lazy'; im.src = p.src; im.alt = p.alt || 'Pexels photograph';
        fig.appendChild(im);
        var cap = document.createElement('figcaption');
        cap.textContent = 'Pexels · ' + (p.photographer || 'unknown');
        fig.appendChild(cap);
        g.appendChild(fig);
      });
    })
    .catch(function () { /* not configured — expected */ });
}

/* ───────────────────────── wiring ───────────────────────── */

function refresh() {
  var list = filtered();
  drawMarkers(list);
  drawList(list);
  drawTable(list);
  renderLocalList();
}

function wireFilters() {
  ['q', 'fRegion', 'fEnv', 'fTarget', 'fStatus', 'fTier'].forEach(function (id) {
    var el = document.getElementById(id);
    el.addEventListener(id === 'q' ? 'input' : 'change', refresh);
  });
  $('#clearFilters').addEventListener('click', function () {
    $('#q').value = '';
    ['fRegion', 'fEnv', 'fTarget', 'fStatus', 'fTier'].forEach(function (id) { document.getElementById(id).value = ''; });
    refresh();
  });
}

function wireSorting() {
  $$('#rankTable th').forEach(function (th) {
    th.addEventListener('click', function () {
      var k = th.dataset.sort;
      if (sortKey === k) sortDir = -sortDir;
      else { sortKey = k; sortDir = (['name', 'country', 'env'].indexOf(k) >= 0) ? 1 : -1; }
      drawTable(filtered());
    });
  });
}

function wireDownloads() {
  function bind(id, fn) {
    var el = document.getElementById(id);
    if (el) el.addEventListener('click', function (e) { e.preventDefault(); fn(); });
  }
  var j = function () { download('analog-atlas.json', 'application/json', JSON.stringify(exportRows(), null, 2)); };
  var g = function () { download('analog-atlas.geojson', 'application/geo+json', toGeoJSON()); };
  var c = function () { download('analog-atlas.csv', 'text/csv', toCSV()); };
  bind('dlJson', j); bind('dlGeo', g); bind('dlCsv', c);
  bind('footJson', j); bind('footGeo', g); bind('footCsv', c);
}

function wirePresets() {
  $('#resetWeights').addEventListener('click', function () {
    var d = {}; AFI.CRITERIA.forEach(function (c) { d[c.key] = c.weight; });
    applyPreset(d);
  });
  $('#presetBehav').addEventListener('click', function () {
    applyPreset({ isolation: .26, environment: .03, duration: .26, eva: .04, comms: .16, closure: .06, ops: .11, science: .08 });
  });
  $('#presetEVA').addEventListener('click', function () {
    applyPreset({ isolation: .08, environment: .18, duration: .06, eva: .27, comms: .10, closure: .05, ops: .21, science: .05 });
  });
  $('#presetGeo').addEventListener('click', function () {
    applyPreset({ isolation: .05, environment: .34, duration: .04, eva: .10, comms: .04, closure: .03, ops: .12, science: .28 });
  });
}

function boot() {
  renderDefinition();
  renderCriteria();
  renderTiers();
  renderWeightPanel();
  renderScoreInputs();
  syncWeightLabels();
  buildFilters();
  initMap();
  wireFilters();
  wireSorting();
  wireDownloads();
  wirePresets();
  wireForm();
  refresh();
  drawStats();
  loadHero();
  loadGallery();
}

if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
else boot();

})();

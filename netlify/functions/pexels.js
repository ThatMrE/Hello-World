/*
 * Optional Pexels image proxy.
 *
 * Set PEXELS_API_KEY in the Netlify site environment to enable the Pexels strip
 * in the gallery. Without a key this returns 501 and the front end silently
 * skips Pexels — the NASA Image and Video Library remains the primary source.
 *
 * The key is never exposed to the browser; only whitelisted, curated queries
 * are forwarded upstream.
 */

const ALLOWED = [
  'desert night sky stars',
  'mars landscape',
  'volcano lava field',
  'antarctica ice station',
  'astronaut suit',
  'cave exploration',
  'underwater diver',
  'observatory night sky',
  'sand dunes',
  'milky way'
];

exports.handler = async function (event) {
  const key = process.env.PEXELS_API_KEY;
  if (!key) {
    return json(501, { error: 'PEXELS_API_KEY not configured', photos: [] });
  }

  const requested = (event.queryStringParameters || {}).query || ALLOWED[0];
  const query = ALLOWED.includes(requested) ? requested : ALLOWED[0];
  const perPage = Math.min(12, Number((event.queryStringParameters || {}).per_page) || 6);

  try {
    const res = await fetch(
      'https://api.pexels.com/v1/search?orientation=landscape&per_page=' +
        perPage + '&query=' + encodeURIComponent(query),
      { headers: { Authorization: key } }
    );

    if (!res.ok) return json(res.status, { error: 'Pexels request failed', photos: [] });

    const body = await res.json();
    const photos = (body.photos || []).map(function (p) {
      return {
        src: (p.src && (p.src.large || p.src.medium)) || '',
        alt: p.alt || '',
        photographer: p.photographer || '',
        url: p.url || ''
      };
    }).filter(function (p) { return p.src; });

    return json(200, { query: query, photos: photos });
  } catch (err) {
    return json(502, { error: 'Upstream error', photos: [] });
  }
};

function json(statusCode, body) {
  return {
    statusCode: statusCode,
    headers: {
      'Content-Type': 'application/json',
      'Cache-Control': 'public, max-age=3600'
    },
    body: JSON.stringify(body)
  };
}

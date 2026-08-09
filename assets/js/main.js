/* HALF BAD — behaviour. No dependencies, no build step. */
(function () {
  'use strict';

  const $ = (sel, root) => (root || document).querySelector(sel);
  const $$ = (sel, root) => Array.from((root || document).querySelectorAll(sel));
  const money = n => '£' + n.toFixed(2);
  const esc = s => String(s).replace(/[&<>"']/g, c =>
    ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

  const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

  /* ── Tour ───────────────────────────────────────────────── */

  const datesEl = $('#dates');
  const countEl = $('#tourCount');
  const emptyEl = $('#tourEmpty');
  const today = new Date(); today.setHours(0, 0, 0, 0);

  function dateRow(gig) {
    // ISO parts, parsed manually so the row never shifts by timezone.
    const [y, m, d] = gig.date.split('-').map(Number);
    const when = new Date(y, m - 1, d);
    const past = when < today;

    const status = gig.status === 'soldout'
      ? '<span class="tag tag--sold">Sold Out</span>'
      : gig.status === 'low'
        ? '<span class="tag tag--low">Low Tickets</span>'
        : '';

    // A sold-out row already carries the tag, so the button offers the useful thing instead.
    const action = gig.status === 'soldout'
      ? '<a class="btn btn--small btn--ghost" href="#list">Waiting List</a>'
      : '<a class="btn btn--small btn--primary" href="#list">Tickets</a>';

    const li = document.createElement('li');
    li.className = 'datepin' + (past ? ' is-past' : '');
    li.dataset.region = gig.region;
    li.innerHTML = `
      <div class="datepin__when">
        <span class="d">${String(d).padStart(2, '0')}</span>
        <span class="m">${MONTHS[m - 1]} ${y}</span>
      </div>
      <div class="datepin__where">
        <h3>${esc(gig.city)} <span class="country">${esc(gig.country)}</span></h3>
        <p>${esc(gig.venue)}${gig.note ? ' · ' + esc(gig.note) : ''}</p>
      </div>
      <div class="datepin__act">${status}${action}</div>`;
    return li;
  }

  function renderTour(region) {
    const list = region === 'all' ? TOUR : TOUR.filter(g => g.region === region);
    datesEl.replaceChildren(...list.map(dateRow));
    countEl.textContent = list.length;
    emptyEl.hidden = list.length > 0;
  }

  $$('.section--tour .chip').forEach(chip => {
    chip.addEventListener('click', () => {
      $$('.section--tour .chip').forEach(c => c.classList.remove('is-on'));
      chip.classList.add('is-on');
      renderTour(chip.dataset.region);
    });
  });

  /* ── Merch ──────────────────────────────────────────────── */

  const gridEl = $('#merchGrid');

  function productCard(p) {
    const el = document.createElement('article');
    el.className = 'card';
    el.dataset.cat = p.cat;

    const sizeSelect = p.sizes.length
      ? `<label class="visually-hidden" for="size-${p.id}">Size for ${esc(p.name)}</label>
         <select class="card__size" id="size-${p.id}">
           ${p.sizes.map(s => `<option>${esc(s)}</option>`).join('')}
         </select>`
      : '<span class="card__size" aria-hidden="true">One size</span>';

    el.innerHTML = `
      <div class="card__media">
        <img src="${p.img}" alt="${esc(p.name)}" loading="lazy" width="400" height="400">
        ${p.badge ? `<span class="card__badge">${esc(p.badge)}</span>` : ''}
        ${p.sold ? '<span class="card__sold">Sold Out</span>' : ''}
      </div>
      <div class="card__body">
        <h3 class="card__name">${esc(p.name)}</h3>
        <p class="card__blurb">${esc(p.blurb)}</p>
        <div class="card__row">
          <span class="card__price">${money(p.price)}</span>
          ${sizeSelect}
        </div>
        ${p.sold
          ? '<button class="btn btn--wide" disabled>Sold Out</button>'
          : `<button class="btn btn--primary btn--wide" data-add="${p.id}">Add to Cart</button>`}
      </div>`;
    return el;
  }

  function renderMerch(cat) {
    const list = cat === 'all' ? MERCH : MERCH.filter(p => p.cat === cat);
    gridEl.replaceChildren(...list.map(productCard));
  }

  $$('.filters--merch .chip').forEach(chip => {
    chip.addEventListener('click', () => {
      $$('.filters--merch .chip').forEach(c => c.classList.remove('is-on'));
      chip.classList.add('is-on');
      renderMerch(chip.dataset.cat);
    });
  });

  gridEl.addEventListener('click', e => {
    const btn = e.target.closest('[data-add]');
    if (!btn) return;
    const product = MERCH.find(p => p.id === btn.dataset.add);
    if (!product) return;
    const size = $('#size-' + product.id);
    addToCart(product, size && size.tagName === 'SELECT' ? size.value : '');
    btn.textContent = 'Added ✓';
    setTimeout(() => { btn.textContent = 'Add to Cart'; }, 1200);
  });

  /* ── Discography ────────────────────────────────────────── */

  const discogEl = $('#discog');

  DISCOG.forEach(rel => {
    const art = document.createElement('article');
    art.className = 'rel';
    art.style.setProperty('--accent', rel.accent);
    art.innerHTML = `
      <div class="rel__cover"><img src="${rel.cover}" alt="${esc(rel.title)} cover artwork" loading="lazy" width="600" height="600"></div>
      <div class="rel__info">
        <p class="rel__meta">${rel.year} · ${esc(rel.kind)} · ${rel.tracks.length} tracks</p>
        <h3 class="rel__title">${esc(rel.title)}</h3>
        <p class="rel__blurb">${esc(rel.blurb)}</p>
        <ul class="rel__formats">${rel.formats.map(f => `<li>${esc(f)}</li>`).join('')}</ul>
        <div class="rel__links">
          <a class="btn btn--primary btn--small" href="#merch">Buy</a>
          <a class="btn btn--ghost btn--small" href="#">Bandcamp</a>
          <a class="btn btn--ghost btn--small" href="#">Stream</a>
        </div>
        <details class="tracklist">
          <summary>Tracklist</summary>
          <ol>${rel.tracks.map(t => `<li>${esc(t)}</li>`).join('')}</ol>
        </details>
      </div>`;
    discogEl.appendChild(art);
  });

  /* ── Cart ───────────────────────────────────────────────── */

  const KEY = 'halfbad.cart.v1';
  let cart = [];
  try { cart = JSON.parse(localStorage.getItem(KEY)) || []; } catch (_) { cart = []; }

  const cartList = $('#cartList');
  const cartCount = $('#cartCount');
  const cartTotal = $('#cartTotal');
  const cartPanel = $('#cartPanel');
  const scrim = $('#scrim');

  function saveCart() {
    try { localStorage.setItem(KEY, JSON.stringify(cart)); } catch (_) { /* private mode */ }
  }

  function addToCart(product, size) {
    const line = cart.find(l => l.id === product.id && l.size === size);
    if (line) line.qty += 1;
    else cart.push({ id: product.id, name: product.name, price: product.price, size: size, qty: 1 });
    saveCart();
    drawCart();
  }

  function drawCart() {
    const qty = cart.reduce((n, l) => n + l.qty, 0);
    const total = cart.reduce((n, l) => n + l.qty * l.price, 0);
    cartCount.textContent = qty;
    cartTotal.textContent = money(total);

    if (!cart.length) {
      cartList.innerHTML = '<li class="cartpanel__empty">Nothing in here yet.<br>The vinyl comes with a free 7".</li>';
      return;
    }
    cartList.innerHTML = cart.map((l, i) => `
      <li class="cartline">
        <div>
          <h3>${esc(l.name)}</h3>
          <p>${l.size ? esc(l.size) + ' · ' : ''}Qty ${l.qty}</p>
          <button class="cartline__rm" data-rm="${i}">Remove</button>
        </div>
        <span class="cartline__price">${money(l.price * l.qty)}</span>
      </li>`).join('');
  }

  cartList.addEventListener('click', e => {
    const btn = e.target.closest('[data-rm]');
    if (!btn) return;
    cart.splice(Number(btn.dataset.rm), 1);
    saveCart();
    drawCart();
  });

  function openCart(open) {
    cartPanel.hidden = !open;
    scrim.hidden = !open;
    $('#cartBtn').setAttribute('aria-expanded', String(open));
    if (open) $('#cartClose').focus();
  }

  $('#cartBtn').addEventListener('click', () => openCart(cartPanel.hidden));
  $('#cartClose').addEventListener('click', () => openCart(false));
  scrim.addEventListener('click', () => openCart(false));
  document.addEventListener('keydown', e => { if (e.key === 'Escape') openCart(false); });

  $('#checkout').addEventListener('click', () => {
    if (!cart.length) return;
    alert('Demo store — no payment is taken.\n\nOn the real thing this hands off to the shop.\nCome say hello at the merch desk instead.');
  });

  /* ── Nav + form + odds and ends ─────────────────────────── */

  const links = $('#navLinks');
  $('#burger').addEventListener('click', function () {
    const open = links.classList.toggle('is-open');
    this.setAttribute('aria-expanded', String(open));
  });
  links.addEventListener('click', e => {
    if (e.target.tagName === 'A') {
      links.classList.remove('is-open');
      $('#burger').setAttribute('aria-expanded', 'false');
    }
  });

  const form = $('#signup');
  const note = $('#formNote');
  form.addEventListener('submit', e => {
    e.preventDefault();
    const email = $('#email');
    const city = $('#city').value.trim();
    if (!email.checkValidity()) {
      note.textContent = 'That email does not look right. Try again.';
      note.classList.add('is-bad');
      email.focus();
      return;
    }
    note.classList.remove('is-bad');
    note.textContent = city
      ? `You're on the list. ${city} is going on the routing map.`
      : "You're on the list. Check your inbox for the presale code.";
    form.reset();
  });

  $('#year').textContent = new Date().getFullYear();
  $('#statReleases').textContent = String(DISCOG.length).padStart(2, '0');
  $('#statShows').textContent = String(TOUR.length).padStart(2, '0');

  renderTour('all');
  renderMerch('all');
  drawCart();
})();

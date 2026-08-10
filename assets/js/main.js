/* HALF BAD — behaviour for every page. No dependencies, no build step.

   Each page is a thin shell: it declares which page it is via <body data-page>
   and provides empty containers. Everything shared — ticker, nav, footer, cart
   — is rendered from here so the chrome has one source of truth rather than six
   copies drifting apart. Section rendering is conditional on its container
   existing, so one file serves all pages. */
(function () {
  'use strict';

  const $ = (sel, root) => (root || document).querySelector(sel);
  const $$ = (sel, root) => Array.from((root || document).querySelectorAll(sel));
  const money = n => '£' + n.toFixed(2);
  const esc = s => String(s).replace(/[&<>"']/g, c =>
    ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

  const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const PAGE = document.body.dataset.page || '';

  const NAV = [
    { key: 'tour', href: 'tour.html', label: 'Tour' },
    { key: 'merch', href: 'merch.html', label: 'Merch' },
    { key: 'music', href: 'music.html', label: 'Music' },
    { key: 'band', href: 'band.html', label: 'Band' }
  ];

  /* ── Shared chrome ──────────────────────────────────────── */

  function chromeHTML() {
    const links = NAV.map(n =>
      `<a href="${n.href}"${n.key === PAGE ? ' class="is-current" aria-current="page"' : ''}>${n.label}</a>`
    ).join('');

    const shout = `
      <b>★</b> New album <em>PORKPIE PARANOIA</em> out now
      <b>★</b> UK &amp; EU tour on sale Friday 10am
      <b>★</b> Free 7" with every vinyl order
      <b>★</b> Coventry homecoming show — 2 nights, 1 left`;

    return `
      <div class="ticker" aria-label="Announcements">
        <div class="ticker__track"><span class="ticker__set">${shout}${shout}</span></div>
      </div>
      <header class="nav">
        <div class="nav__inner">
          <a class="brand" href="index.html" aria-label="HALF BAD home">
            <img src="assets/img/logo-halfbad.svg" alt="" width="42" height="42">
            <span class="brand__type">HALF<span class="brand__slash">/</span>BAD</span>
          </a>
          <nav class="nav__links" id="navLinks" aria-label="Primary">
            ${links}
            <a href="list.html" class="nav__cta${PAGE === 'list' ? ' is-current' : ''}">Mailing List</a>
          </nav>
          <div class="nav__tools">
            <button class="cart" id="cartBtn" aria-label="Open cart" aria-expanded="false" aria-controls="cartPanel">
              <span class="cart__icon" aria-hidden="true">▣</span>
              <span class="cart__label">Cart</span>
              <span class="cart__count" id="cartCount">0</span>
            </button>
            <button class="burger" id="burger" aria-label="Menu" aria-expanded="false" aria-controls="navLinks">
              <span></span><span></span><span></span>
            </button>
          </div>
        </div>
        <div class="checkerstrip" aria-hidden="true"></div>
      </header>`;
  }

  function footerHTML() {
    return `
      <div class="checkerstrip" aria-hidden="true"></div>
      <div class="wrap foot__inner">
        <div class="foot__brand">
          <img src="assets/img/logo-halfbad.svg" alt="" width="52" height="52">
          <p>HALF BAD<br><small>Coventry, England</small></p>
        </div>
        <nav class="foot__col" aria-label="Site">
          <h3>Site</h3>
          ${NAV.map(n => `<a href="${n.href}">${n.label}</a>`).join('')}
          <a href="list.html">Mailing list</a>
        </nav>
        <nav class="foot__col" aria-label="Elsewhere">
          <h3>Elsewhere</h3>
          <a href="#">Bandcamp</a><a href="#">Spotify</a><a href="#">Instagram</a><a href="#">YouTube</a>
        </nav>
        <div class="foot__col">
          <h3>Business</h3>
          <a href="mailto:booking@halfbad.example">Booking</a>
          <a href="mailto:press@halfbad.example">Press &amp; photos</a>
          <a href="mailto:shop@halfbad.example">Order help</a>
        </div>
      </div>
      <p class="foot__legal">© <span id="year">2026</span> HALF BAD. All dates subject to the van. Site built with two colours.</p>`;
  }

  function cartHTML() {
    return `
      <div class="cartpanel" id="cartPanel" hidden aria-label="Shopping cart">
        <div class="cartpanel__head">
          <h2>Your Cart</h2>
          <button class="cartpanel__close" id="cartClose" aria-label="Close cart">✕</button>
        </div>
        <ul class="cartpanel__list" id="cartList"></ul>
        <div class="cartpanel__foot">
          <p class="cartpanel__total"><span>Subtotal</span><b id="cartTotal">£0.00</b></p>
          <button class="btn btn--primary btn--wide" id="checkout">Checkout</button>
          <p class="cartpanel__note">Demo store — nothing is charged.</p>
        </div>
      </div>
      <div class="scrim" id="scrim" hidden></div>`;
  }

  function renderChrome() {
    $('#siteChrome').innerHTML = chromeHTML();
    $('#siteFooter').innerHTML = footerHTML();
    document.body.insertAdjacentHTML('beforeend', cartHTML());
    $('#year').textContent = new Date().getFullYear();

    const links = $('#navLinks');
    $('#burger').addEventListener('click', function () {
      this.setAttribute('aria-expanded', String(links.classList.toggle('is-open')));
    });
    links.addEventListener('click', e => {
      if (e.target.tagName === 'A') {
        links.classList.remove('is-open');
        $('#burger').setAttribute('aria-expanded', 'false');
      }
    });
  }

  /* ── Tour ───────────────────────────────────────────────── */

  const today = new Date(); today.setHours(0, 0, 0, 0);

  function dateRow(gig, level) {
    const H = 'h' + (level || 3);
    // ISO parts parsed by hand so a row never shifts by timezone.
    const [y, m, d] = gig.date.split('-').map(Number);
    const past = new Date(y, m - 1, d) < today;

    const status = gig.status === 'soldout'
      ? '<span class="tag tag--sold">Sold Out</span>'
      : gig.status === 'low'
        ? '<span class="tag tag--low">Low Tickets</span>'
        : '';

    // A sold-out row already carries the tag, so the button offers the useful thing.
    const action = gig.status === 'soldout'
      ? '<a class="btn btn--small btn--ghost" href="list.html">Waiting List</a>'
      : '<a class="btn btn--small btn--primary" href="list.html">Tickets</a>';

    const li = document.createElement('li');
    li.className = 'datepin' + (past ? ' is-past' : '');
    li.dataset.region = gig.region;
    li.innerHTML = `
      <div class="datepin__when">
        <span class="d">${String(d).padStart(2, '0')}</span>
        <span class="m">${MONTHS[m - 1]} ${y}</span>
      </div>
      <div class="datepin__where">
        <${H} class="datepin__city">${esc(gig.city)} <span class="country">${esc(gig.country)}</span></${H}>
        <p>${esc(gig.venue)}${gig.note ? ' · ' + esc(gig.note) : ''}</p>
      </div>
      <div class="datepin__act">${status}${action}</div>`;
    return li;
  }

  function initTour() {
    const datesEl = $('#dates');
    if (!datesEl) return;
    const countEl = $('#tourCount');
    const emptyEl = $('#tourEmpty');

    function render(region) {
      const list = region === 'all' ? TOUR : TOUR.filter(g => g.region === region);
      datesEl.replaceChildren(...list.map(g => dateRow(g, 2)));
      countEl.textContent = list.length;
      emptyEl.hidden = list.length > 0;
    }

    $$('.filters--tour .chip').forEach(chip => {
      chip.addEventListener('click', () => {
        $$('.filters--tour .chip').forEach(c => c.classList.remove('is-on'));
        chip.classList.add('is-on');
        render(chip.dataset.region);
      });
    });
    render('all');
  }

  /* ── Merch ──────────────────────────────────────────────── */

  function productCard(p, level) {
    const H = 'h' + (level || 3);
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
        <${H} class="card__name">${esc(p.name)}</${H}>
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

  function initMerch() {
    const gridEl = $('#merchGrid');
    if (!gridEl) return;

    function render(cat) {
      const list = cat === 'all' ? MERCH : MERCH.filter(p => p.cat === cat);
      gridEl.replaceChildren(...list.map(p => productCard(p, 2)));
    }

    $$('.filters--merch .chip').forEach(chip => {
      chip.addEventListener('click', () => {
        $$('.filters--merch .chip').forEach(c => c.classList.remove('is-on'));
        chip.classList.add('is-on');
        render(chip.dataset.cat);
      });
    });
    render('all');
  }

  /* ── Discography ────────────────────────────────────────── */

  function releaseCard(rel, level) {
    const H = 'h' + (level || 3);
    const art = document.createElement('article');
    art.className = 'rel';
    art.style.setProperty('--accent', rel.accent);
    art.innerHTML = `
      <div class="rel__cover"><img src="${rel.cover}" alt="${esc(rel.title)} cover artwork" loading="lazy" width="600" height="600"></div>
      <div class="rel__info">
        <p class="rel__meta">${rel.year} · ${esc(rel.kind)} · ${rel.tracks.length} tracks</p>
        <${H} class="rel__title">${esc(rel.title)}</${H}>
        <p class="rel__blurb">${esc(rel.blurb)}</p>
        <ul class="rel__formats">${rel.formats.map(f => `<li>${esc(f)}</li>`).join('')}</ul>
        <div class="rel__links">
          <a class="btn btn--primary btn--small" href="merch.html">Buy</a>
          <a class="btn btn--ghost btn--small" href="#">Bandcamp</a>
          <a class="btn btn--ghost btn--small" href="#">Stream</a>
        </div>
        <details class="tracklist">
          <summary>Tracklist</summary>
          <ol>${rel.tracks.map(t => `<li>${esc(t)}</li>`).join('')}</ol>
        </details>
      </div>`;
    return art;
  }

  function initDiscog() {
    const el = $('#discog');
    if (!el) return;
    el.replaceChildren(...DISCOG.map(r => releaseCard(r, 2)));
  }

  /* ── Home teasers ───────────────────────────────────────── */

  function initHome() {
    const nextEl = $('#nextDates');
    if (!nextEl) return;

    nextEl.replaceChildren(...TOUR.slice(0, 3).map(g => dateRow(g, 3)));
    $('#statReleases').textContent = String(DISCOG.length).padStart(2, '0');
    $('#statShows').textContent = String(TOUR.length).padStart(2, '0');

    const latest = DISCOG[0];
    const feat = $('#latestRelease');
    feat.style.setProperty('--accent', latest.accent);
    feat.innerHTML = `
      <div class="rel__cover"><img src="${latest.cover}" alt="${esc(latest.title)} cover artwork" width="600" height="600"></div>
      <div class="rel__info">
        <p class="rel__meta">${latest.year} · ${esc(latest.kind)} · ${latest.tracks.length} tracks</p>
        <h3 class="rel__title">${esc(latest.title)}</h3>
        <p class="rel__blurb">${esc(latest.blurb)}</p>
        <div class="rel__links">
          <a class="btn btn--primary btn--small" href="merch.html">Buy the Record</a>
          <a class="btn btn--ghost btn--small" href="music.html">All Releases</a>
        </div>
      </div>`;

    const picks = MERCH.filter(p => !p.sold).slice(0, 3);
    $('#merchPicks').replaceChildren(...picks.map(p => productCard(p, 3)));
  }

  /* ── Cart ───────────────────────────────────────────────── */

  const KEY = 'halfbad.cart.v1';
  let cart = [];
  try { cart = JSON.parse(localStorage.getItem(KEY)) || []; } catch (_) { cart = []; }

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
    const list = $('#cartList');
    $('#cartCount').textContent = cart.reduce((n, l) => n + l.qty, 0);
    $('#cartTotal').textContent = money(cart.reduce((n, l) => n + l.qty * l.price, 0));

    if (!cart.length) {
      list.innerHTML = '<li class="cartpanel__empty">Nothing in here yet.<br>The vinyl comes with a free 7".</li>';
      return;
    }
    list.innerHTML = cart.map((l, i) => `
      <li class="cartline">
        <div>
          <h3>${esc(l.name)}</h3>
          <p>${l.size ? esc(l.size) + ' · ' : ''}Qty ${l.qty}</p>
          <button class="cartline__rm" data-rm="${i}">Remove</button>
        </div>
        <span class="cartline__price">${money(l.price * l.qty)}</span>
      </li>`).join('');
  }

  function openCart(open) {
    $('#cartPanel').hidden = !open;
    $('#scrim').hidden = !open;
    $('#cartBtn').setAttribute('aria-expanded', String(open));
    if (open) $('#cartClose').focus();
  }

  function initCart() {
    $('#cartBtn').addEventListener('click', () => openCart($('#cartPanel').hidden));
    $('#cartClose').addEventListener('click', () => openCart(false));
    $('#scrim').addEventListener('click', () => openCart(false));
    document.addEventListener('keydown', e => { if (e.key === 'Escape') openCart(false); });

    $('#cartList').addEventListener('click', e => {
      const btn = e.target.closest('[data-rm]');
      if (!btn) return;
      cart.splice(Number(btn.dataset.rm), 1);
      saveCart();
      drawCart();
    });

    $('#checkout').addEventListener('click', () => {
      if (!cart.length) return;
      alert('Demo store — no payment is taken.\n\nOn the real thing this hands off to the shop.\nCome say hello at the merch desk instead.');
    });

    // One delegated listener covers every grid on the page.
    document.addEventListener('click', e => {
      const btn = e.target.closest('[data-add]');
      if (!btn) return;
      const product = MERCH.find(p => p.id === btn.dataset.add);
      if (!product) return;
      const size = $('#size-' + product.id);
      addToCart(product, size && size.tagName === 'SELECT' ? size.value : '');
      btn.textContent = 'Added ✓';
      setTimeout(() => { btn.textContent = 'Add to Cart'; }, 1200);
    });

    drawCart();
  }

  /* ── Mailing list ───────────────────────────────────────── */

  function initForm() {
    const form = $('#signup');
    if (!form) return;
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
  }

  renderChrome();
  initCart();
  initHome();
  initTour();
  initMerch();
  initDiscog();
  initForm();
})();

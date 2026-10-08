/* ==========================================================================
   Portfolio v3 · behaviour. Content comes from content.js.
   ========================================================================== */
import { links, postcard, stops, work, hats, astroStats, sites, process, places } from './content.js';

const $ = (s, el = document) => el.querySelector(s);
const $$ = (s, el = document) => [...el.querySelectorAll(s)];
const esc = (s = '') => String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
const finePointer = matchMedia('(hover: hover) and (pointer: fine)').matches;

/* ---------- 1. Hero: pins on the trail + the journey sheet ---------- */
const heroArt = $('.hero-art');
const heroImg = $('.hero-art img');
const pinsEl = $('#pins');
const hint = $('#hero-hint');

pinsEl.innerHTML = stops.map((s, i) => `
  <button class="pin" type="button" role="listitem" data-i="${i}" aria-expanded="false" aria-controls="sheet">
    <span class="pin-dot" aria-hidden="true"></span>
    <span class="pin-label">${esc(s.pin)}</span>
    <span class="sr-only">: open stop ${i + 1} of ${stops.length}</span>
  </button>`).join('');
const pins = $$('.pin', pinsEl);

function placePins() {
  const W = heroArt.clientWidth, H = heroArt.clientHeight;
  const iw = heroImg.naturalWidth || 2400, ih = heroImg.naturalHeight || 1325;
  const sc = Math.max(W / iw, H / ih), dw = iw * sc, dh = ih * sc;
  const [px, py] = getComputedStyle(heroImg).objectPosition.split(' ').map((v) => parseFloat(v) / 100);
  const ox = (W - dw) * (isNaN(px) ? 0.5 : px), oy = (H - dh) * (isNaN(py) ? 0.5 : py);
  pins.forEach((pin, i) => {
    const x = ox + stops[i].x * dw, y = oy + stops[i].y * dh;
    const inside = x > 16 && x < W - 16 && y > 16 && y < H - 16;
    pin.hidden = !inside;
    pin.style.left = x.toFixed(1) + 'px';
    pin.style.top = y.toFixed(1) + 'px';
    // labels flip to the left when a pin sits near the right edge
    pin.style.flexDirection = x > W - 200 ? 'row-reverse' : 'row';
    pin.style.transform = x > W - 200 ? 'translate(calc(-100% + 14px), -14px)' : 'translate(-14px, -14px)';
  });
  // the hand-written hint points at the cabin (stop 2)
  const ref = pins[1];
  if (hint && ref && !ref.hidden) {
    const r = heroArt.getBoundingClientRect(), hero = $('.hero').getBoundingClientRect();
    hint.style.left = (r.left - hero.left + parseFloat(ref.style.left) - 290) + 'px';
    hint.style.top = (r.top - hero.top + parseFloat(ref.style.top) + 6) + 'px';
  }
}
if (heroImg.complete) placePins(); else heroImg.addEventListener('load', placePins, { once: true });
new ResizeObserver(placePins).observe(heroArt);

const sheet = $('#sheet'), backdrop = $('#sheet-backdrop');
let current = -1, opener = null;
function fillSheet(i) {
  const s = stops[i];
  $('#sheet-eyebrow').textContent = `Stop ${String(i + 1).padStart(2, '0')} of ${String(stops.length).padStart(2, '0')} · ${s.when}`;
  $('#sheet-title').textContent = s.title;
  $('#sheet-role').textContent = s.role;
  $('#sheet-body').textContent = s.body;
  const note = $('#sheet-note'); note.textContent = s.note || ''; note.hidden = !s.note;
  const link = $('#sheet-link');
  if (s.link) { link.hidden = false; link.href = s.link.href; link.innerHTML = `${esc(s.link.label)} <span class="arrow" aria-hidden="true">→</span>`; } else link.hidden = true;
  $('#sheet-prev').disabled = i === 0;
  $('#sheet-next').disabled = i === stops.length - 1;
  pins.forEach((p, k) => p.setAttribute('aria-expanded', String(k === i)));
  pins[i].classList.add('is-visited');
  current = i;
}
function openSheet(i, from) {
  opener = from || opener;
  fillSheet(i);
  sheet.hidden = false; backdrop.hidden = false;
  requestAnimationFrame(() => document.body.classList.add('sheet-open'));
  $('#sheet-close').focus({ preventScroll: true });
}
function closeSheet() {
  document.body.classList.remove('sheet-open');
  pins.forEach((p) => p.setAttribute('aria-expanded', 'false'));
  const done = () => { sheet.hidden = true; backdrop.hidden = true; };
  reduce ? done() : setTimeout(done, 260);
  if (opener) opener.focus({ preventScroll: true });
  current = -1;
}
pins.forEach((p, i) => p.addEventListener('click', () => openSheet(i, p)));
$('#sheet-close').addEventListener('click', closeSheet);
backdrop.addEventListener('click', closeSheet);
$('#sheet-prev').addEventListener('click', () => current > 0 && fillSheet(current - 1));
$('#sheet-next').addEventListener('click', () => current < stops.length - 1 && fillSheet(current + 1));
sheet.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') { e.preventDefault(); closeSheet(); }
  if (e.key === 'ArrowRight' && current < stops.length - 1) fillSheet(current + 1);
  if (e.key === 'ArrowLeft' && current > 0) fillSheet(current - 1);
  if (e.key === 'Tab') { // keep focus inside the sheet
    const f = $$('button:not([disabled]), a[href]:not([hidden])', sheet).filter((el) => el.offsetParent !== null);
    if (!f.length) return;
    if (e.shiftKey && document.activeElement === f[0]) { e.preventDefault(); f[f.length - 1].focus(); }
    else if (!e.shiftKey && document.activeElement === f[f.length - 1]) { e.preventDefault(); f[0].focus(); }
  }
});
// swipe the sheet down to close
let sy = null;
sheet.addEventListener('touchstart', (e) => { sy = e.touches[0].clientY; }, { passive: true });
sheet.addEventListener('touchend', (e) => { if (sy !== null && e.changedTouches[0].clientY - sy > 70 && sheet.scrollTop <= 0) closeSheet(); sy = null; });

/* ---------- 2. Work: postcards ---------- */
const phones = () => `<div class="phones" aria-hidden="true">${[0, 1].map(() => '<div class="phone"><i class="hero-blk"></i><i class="ln"></i><i class="ln s"></i><i class="cta"></i></div>').join('')}</div>`;
const front = (w, flip) => `
  <div class="postcard pc-front tint-${esc(w.tint)}">
    <div class="pc-art">
      <span class="t-eyebrow">${esc(w.label)}</span>
      ${w.image ? `<img src="${esc(w.image)}" alt="${esc(w.label)} screens" loading="lazy">` : phones()}
      ${flip ? '' : '<span class="t-hand greet">greetings from the trail</span>'}
    </div>
    ${flip ? `<button class="flip-btn" type="button" aria-label="Flip the ${esc(w.label)} postcard to read the story">Flip <span aria-hidden="true">↻</span></button>` : ''}
  </div>`;
const back = (w, flip) => `
  <div class="postcard pc-back${flip ? ' pc-back-face' : ''}">
    <div class="rows">
      <h3 class="t-display-m">${esc(w.title)}</h3>
      <dl class="rows">
        <div><dt class="t-eyebrow">Problem</dt><dd class="t-body-s">${esc(w.problem)}</dd></div>
        <div><dt class="t-eyebrow">My role</dt><dd class="t-body-s">${esc(w.role)}</dd></div>
        <div class="metric"><dt class="t-eyebrow">Result</dt><dd class="t-metric">${esc(w.metric)}</dd></div>
      </dl>
      <p class="t-body-s muted">${esc(w.metricLabel)}</p>
      <a class="link" href="${esc(w.link.href)}">${esc(w.link.label)} <span class="arrow" aria-hidden="true">→</span></a>
    </div>
    <span class="rule" aria-hidden="true"></span>
    <div class="addr" aria-hidden="true">
      <span class="pc-stamp">${esc(w.stamp)}</span>
      <span class="postmark">Shipped<br>${esc(w.year)}</span>
      <div class="addr-lines"><span>To: whoever’s hiring</span><span>From: Deeva</span><span>India · ${esc(w.year)}</span></div>
    </div>
    ${flip ? '<button class="flip-btn" type="button">Flip back <span aria-hidden="true">↻</span></button>' : ''}
  </div>`;

const [feat, ...rest] = work;
$('#cards').innerHTML = `
  <article class="feature reveal" aria-label="${esc(feat.label)}">${front(feat, false)}${back(feat, false)}</article>
  <div class="pair">
    <span class="t-hand note work-note" aria-hidden="true">flip me ↓</span>
    ${rest.map((w, i) => `<article class="flip reveal" style="--d:${i * 80}ms" aria-label="${esc(w.label)}"><div class="flip-inner">${front(w, true)}${back(w, true)}</div></article>`).join('')}
  </div>`;

$$('.flip').forEach((card) => {
  const f = $('.pc-front', card), b = $('.pc-back-face', card);
  let pinned = false;
  const set = (on) => {
    card.classList.toggle('is-flipped', on);
    f.inert = on; b.inert = !on;
  };
  set(false);
  $$('.flip-btn', card).forEach((btn) => btn.addEventListener('click', () => {
    pinned = !card.classList.contains('is-flipped');
    set(pinned);
    (pinned ? $('.flip-btn', b) : $('.flip-btn', f)).focus({ preventScroll: true });
  }));
  if (finePointer) {
    card.addEventListener('mouseenter', () => set(true));
    card.addEventListener('mouseleave', () => set(pinned));
  }
});

/* ---------- 3. Astroverse: every hat ---------- */
const ICON = {
  research: '<circle cx="17" cy="17" r="9"/><path d="M24 24l9 9"/>',
  strategy: '<circle cx="20" cy="20" r="14"/><path d="M26 14l-4 8.5-8.5 4 4-8.5z"/>',
  ui: '<rect x="12" y="5" width="16" height="30" rx="4"/><path d="M17 30h6"/>',
  writing: '<path d="M10 30l3-9L27 7l6 6-14 14z"/><path d="M8 34h24"/>',
  ai: '<path d="M20 5l3 10 10 3-10 3-3 10-3-10-10-3 10-3z"/>',
  delivery: '<path d="M6 33h28"/><path d="M10 27l7-8 6 5 10-12"/><path d="M27 12h6v6"/>',
};
$('#hats').innerHTML = hats.map((h, i) => `
  <li class="hat reveal" style="--d:${(i % 3) * 70}ms">
    <svg viewBox="0 0 40 40" aria-hidden="true">${ICON[h.icon] || ICON.ui}</svg>
    <h3 class="t-label">${esc(h.title)}</h3>
    <p class="t-body-s">${esc(h.body)}</p>
    <span class="tool">${esc(h.tool)}</span>
  </li>`).join('');
$('#astro-stats').innerHTML = astroStats.map((s) => `<div class="metric"><dt class="t-body-s">${esc(s.label)}</dt><dd class="t-metric">${esc(s.value)}</dd></div>`).join('');

/* ---------- 4. Websites: the souvenir shelf ---------- */
const shelf = $('#shelf');
shelf.innerHTML = sites.map((s) => `
  <li class="shelf-item tint-${esc(s.tint)}">
    <figure>
      <div class="browser">
        <div class="browser-bar" aria-hidden="true"><i></i><i></i><i></i></div>
        <div class="browser-view">
          ${s.image ? `<img src="${esc(s.image)}" alt="${esc(s.name)}: ${esc(s.kind)}" loading="lazy">`
                    : `<div class="ph" aria-hidden="true"><b>${esc(s.name)}</b><i></i><i></i><u></u></div>`}
        </div>
      </div>
      <figcaption>
        <span class="t-eyebrow">${esc(s.who)}</span>
        <h3>${esc(s.name)}</h3>
        <p class="t-body-s muted">${esc(s.kind)}</p>
      </figcaption>
    </figure>
  </li>`).join('');
const shelfBtns = $$('[data-shelf]');
const shelfState = () => {
  shelfBtns[0].disabled = shelf.scrollLeft < 8;
  shelfBtns[1].disabled = shelf.scrollLeft + shelf.clientWidth > shelf.scrollWidth - 8;
};
shelfBtns.forEach((b) => b.addEventListener('click', () => {
  const step = ($('.shelf-item', shelf)?.offsetWidth || 400) + 24;
  shelf.scrollBy({ left: step * Number(b.dataset.shelf), behavior: reduce ? 'auto' : 'smooth' });
}));
shelf.addEventListener('scroll', shelfState, { passive: true });
addEventListener('resize', shelfState);
shelfState();

/* ---------- 5. Process ---------- */
$('#trail').innerHTML = process.map((p, i) => `
  <li class="step reveal" style="--d:${i * 80}ms">
    <span class="step-dot" aria-hidden="true">${String(i + 1).padStart(2, '0')}</span>
    <h3>${esc(p.title)}</h3>
    <p class="t-body-s">${esc(p.body)}</p>
  </li>`).join('');

/* ---------- 6. Off the clock: the fridge door ---------- */
const fridge = $('#fridge'), tip = $('#tip');
const SPOTS = [[0.08, 0.1], [0.32, 0.06], [0.56, 0.12], [0.76, 0.2], [0.12, 0.52], [0.36, 0.46], [0.58, 0.56], [0.78, 0.6]];
fridge.insertAdjacentHTML('beforeend', places.map((p, i) => `
  <button class="magnet ${esc(p.shape)}" type="button" data-i="${i}" aria-pressed="false" style="background:${esc(p.color)}"
    aria-label="${esc(p.name)}, ${esc(p.state)}. Tap to read the tip. Arrow keys move it.">${esc(p.name)}</button>`).join(''));
const magnets = $$('.magnet', fridge);
let layoutDone = false;
function placeMagnets(force) {
  const W = fridge.clientWidth, H = fridge.clientHeight;
  magnets.forEach((m, i) => {
    if (!force && m.dataset.x) { m.style.left = (m.dataset.x * W) + 'px'; m.style.top = (m.dataset.y * H) + 'px'; return; }
    const [fx, fy] = SPOTS[i % SPOTS.length];
    const narrow = W < 520;
    const x = narrow ? [0.06, 0.52][i % 2] + (i % 3) * 0.02 : fx;
    const y = narrow ? 0.04 + Math.floor(i / 2) * 0.22 : fy;
    m.dataset.x = Math.min(x, (W - m.offsetWidth - 12) / W);
    m.dataset.y = Math.min(y, (H - m.offsetHeight - 40) / H);
    m.style.left = (m.dataset.x * W) + 'px'; m.style.top = (m.dataset.y * H) + 'px';
    m.style.rotate = `${((i * 37) % 11) - 5}deg`;
  });
  layoutDone = true;
}
function showTip(i) {
  const p = places[i];
  magnets.forEach((m, k) => m.setAttribute('aria-pressed', String(k === i)));
  tip.classList.remove('is-swap'); void tip.offsetWidth; tip.classList.add('is-swap');
  tip.innerHTML = `
    <div class="tip-photo" style="${p.photo ? '' : `background:${esc(p.color)}`}">
      ${p.photo ? `<img src="${esc(p.photo)}" alt="${esc(p.name)}, ${esc(p.state)}" loading="lazy">`
                : `<span class="t-display-m" style="color:var(--paper-50)">${esc(p.name)}</span>`}
    </div>
    ${p.sample ? '<span class="stamp" title="Placeholder story, swap in your own"><b>Sample</b></span>' : ''}
    <div class="tip-body">
      <p class="t-eyebrow">${esc(p.name)} · ${esc(p.state)} · ${esc(p.kind)}</p>
      <blockquote>“${esc(p.tip)}”</blockquote>
      ${p.who ? `<p class="t-body-s who">— ${esc(p.who)}</p>` : ''}
    </div>`;
}
let drag = null;
magnets.forEach((m, i) => {
  m.addEventListener('pointerdown', (e) => {
    m.setPointerCapture(e.pointerId);
    drag = { m, i, sx: e.clientX, sy: e.clientY, x: m.offsetLeft, y: m.offsetTop, moved: false };
  });
  m.addEventListener('pointermove', (e) => {
    if (!drag || drag.m !== m) return;
    const dx = e.clientX - drag.sx, dy = e.clientY - drag.sy;
    if (!drag.moved && Math.hypot(dx, dy) < 5) return;
    drag.moved = true; m.classList.add('is-dragging');
    const W = fridge.clientWidth, H = fridge.clientHeight;
    const x = Math.max(4, Math.min(W - m.offsetWidth - 4, drag.x + dx));
    const y = Math.max(4, Math.min(H - m.offsetHeight - 4, drag.y + dy));
    m.style.left = x + 'px'; m.style.top = y + 'px';
    m.dataset.x = x / W; m.dataset.y = y / H;
  });
  const end = () => {
    if (!drag || drag.m !== m) return;
    m.classList.remove('is-dragging');
    if (!drag.moved) showTip(i);
    drag = null;
  };
  m.addEventListener('pointerup', end);
  m.addEventListener('pointercancel', end);
  m.addEventListener('click', (e) => { if (e.detail === 0) showTip(i); }); // keyboard
  m.addEventListener('keydown', (e) => {
    const d = { ArrowLeft: [-12, 0], ArrowRight: [12, 0], ArrowUp: [0, -12], ArrowDown: [0, 12] }[e.key];
    if (!d) return;
    e.preventDefault();
    const W = fridge.clientWidth, H = fridge.clientHeight;
    const x = Math.max(4, Math.min(W - m.offsetWidth - 4, m.offsetLeft + d[0]));
    const y = Math.max(4, Math.min(H - m.offsetHeight - 4, m.offsetTop + d[1]));
    m.style.left = x + 'px'; m.style.top = y + 'px'; m.dataset.x = x / W; m.dataset.y = y / H;
  });
});
placeMagnets(true);
new ResizeObserver(() => layoutDone && placeMagnets(false)).observe(fridge);
showTip(1);

/* ---------- 7. Say hello: send a postcard + the wall ---------- */
const form = $('#pc-form'), msg = $('#pc-msg'), count = $('#pc-count'), slot = $('#stamp-slot');
msg.maxLength = postcard.maxLength;
const updateCount = () => { count.textContent = `${msg.value.length} / ${postcard.maxLength}`; };
msg.addEventListener('input', updateCount); updateCount();

let frontChoice = 'trail';
const fronts = $$('.front-opt');
fronts.forEach((b, i) => {
  b.tabIndex = b.getAttribute('aria-checked') === 'true' ? 0 : -1;
  b.addEventListener('click', () => choose(i));
  b.addEventListener('keydown', (e) => {
    const k = { ArrowDown: 1, ArrowRight: 1, ArrowUp: -1, ArrowLeft: -1 }[e.key];
    if (k) { e.preventDefault(); const n = (i + k + fronts.length) % fronts.length; choose(n); fronts[n].focus(); }
  });
});
function choose(i) {
  fronts.forEach((b, k) => { b.setAttribute('aria-checked', String(k === i)); b.tabIndex = k === i ? 0 : -1; });
  frontChoice = fronts[i].dataset.front;
}

const setErr = (input, errEl, text) => {
  input.setAttribute('aria-invalid', text ? 'true' : 'false');
  errEl.textContent = text || '';
};
function validate() {
  const name = $('#pc-name'), email = $('#pc-email');
  const errs = [
    [msg, $('#pc-msg-err'), msg.value.trim().length < 2 ? 'Write a line or two on the back first.' : ''],
    [name, $('#pc-name-err'), name.value.trim() ? '' : 'Add your name so I know who it’s from.'],
    [email, $('#pc-email-err'), /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value.trim()) ? '' : 'Add an email I can reply to.'],
  ];
  // show one error at a time, the first one
  let first = null;
  errs.forEach(([i, e, t]) => { if (t && !first) { first = i; setErr(i, e, t); } else setErr(i, e, ''); });
  if (first) first.focus();
  return !first;
}

form.addEventListener('submit', async (e) => {
  e.preventDefault();
  if (!validate()) return;
  const data = {
    front: frontChoice,
    message: msg.value.trim(),
    name: $('#pc-name').value.trim(),
    email: $('#pc-email').value.trim(),
    wall: $('#pc-wall').checked,
  };
  slot.classList.add('is-stamped'); slot.textContent = 'D';
  const btn = $('button[type="submit"]', form);
  btn.disabled = true;
  let viaEmailApp = !postcard.endpoint;
  if (postcard.endpoint) {
    try {
      const r = await fetch(postcard.endpoint, { method: 'POST', headers: { 'Content-Type': 'application/json', Accept: 'application/json' }, body: JSON.stringify({ ...data, _subject: `A postcard from ${data.name}` }) });
      if (!r.ok) throw new Error(r.status);
    } catch { viaEmailApp = true; }
  }
  if (viaEmailApp) {
    const body = `${data.message}\n\n— ${data.name} (${data.email})\n\nPostcard front: ${data.front}\nPin it to the wall: ${data.wall ? 'yes' : 'no'}`;
    location.href = `mailto:${links.email}?subject=${encodeURIComponent(`A postcard from ${data.name}`)}&body=${encodeURIComponent(body)}`;
  }
  $('#sent-date').textContent = new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
  $('#sent-msg').textContent = viaEmailApp
    ? 'Your email app should open with the postcard already written. Hit send there and it’s on its way.'
    : 'I read every one and reply within a few days.';
  setTimeout(() => { $('#sent').classList.add('is-on'); $('#sent').focus(); btn.disabled = false; }, reduce ? 0 : 450);
});
$('#pc-again').addEventListener('click', () => {
  form.reset(); updateCount(); slot.classList.remove('is-stamped'); slot.textContent = 'stamp';
  $('#sent').classList.remove('is-on'); msg.focus();
});

fetch('assets/data/postcards.json', { cache: 'no-cache' })
  .then((r) => (r.ok ? r.json() : { cards: [] }))
  .catch(() => ({ cards: [] }))
  .then(({ cards = [] }) => {
    $('#wall').innerHTML = cards.length
      ? cards.map((c, i) => `
        <li class="wall-card${c.mine ? ' is-mine' : ''}" style="--rot:${[-1.5, 1.2, -0.6, 1.8, -2][i % 5]}deg">
          <div class="top"><span class="t-eyebrow">${esc([c.place, c.date].filter(Boolean).join(' · '))}</span><span class="mini-stamp" aria-hidden="true"></span></div>
          <blockquote>${esc(c.message)}</blockquote>
          <p class="t-body-s from">— ${esc(c.from)}</p>
        </li>`).join('')
      : '<li class="t-body muted">No postcards yet. Yours could be the first.</li>';
  });

/* ---------- 8. Footer, nav, reveals ---------- */
$('#email-text').textContent = links.email;
$('#copy-email').addEventListener('click', async () => {
  const state = $('#copy-state');
  try { await navigator.clipboard.writeText(links.email); state.textContent = 'Copied'; state.classList.add('done'); }
  catch { location.href = `mailto:${links.email}`; }
  setTimeout(() => { state.textContent = 'Copy'; state.classList.remove('done'); }, 2000);
});
if (links.linkedin) { const a = $('#linkedin'); a.href = links.linkedin; a.hidden = false; a.target = '_blank'; a.rel = 'noopener'; }

const navLinks = $$('.nav a');
const io = new IntersectionObserver((entries) => {
  entries.forEach((en) => {
    if (!en.isIntersecting) return;
    const id = en.target.id;
    navLinks.forEach((a) => a.setAttribute('aria-current', String(a.getAttribute('href') === '#' + id)));
  });
}, { rootMargin: '-45% 0px -50% 0px' });
['top', 'story', 'work', 'astroverse', 'sites', 'process', 'off-the-clock', 'hello'].forEach((id) => io.observe(document.getElementById(id)));

const rv = new IntersectionObserver((entries) => {
  entries.forEach((en) => { if (en.isIntersecting) { en.target.classList.add('is-in'); rv.unobserve(en.target); } });
}, { rootMargin: '0px 0px -8% 0px', threshold: 0.05 });
$$('.reveal').forEach((el) => rv.observe(el));

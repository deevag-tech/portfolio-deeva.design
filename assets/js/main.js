/* ==========================================================================
   Portfolio v3 · behaviour. Content comes from content.js.
   ========================================================================== */
import { links, postcard, stops, work, steps, tools, sites, places } from './content.js';

const $ = (s, el = document) => el.querySelector(s);
const $$ = (s, el = document) => [...el.querySelectorAll(s)];
const esc = (s = '') => String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
const finePointer = matchMedia('(hover: hover) and (pointer: fine)').matches;
const wait = (ms) => new Promise((r) => setTimeout(r, reduce ? 0 : ms));

/* ---------- 1. Hero: pins on the trail + the journey sheet ---------- */
const heroArt = $('.hero-art');
const heroImg = $('.hero-art img');
const pinsEl = $('#pins');

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
    pin.hidden = !(x > 16 && x < W - 16 && y > 16 && y < H - 16);
    pin.style.left = x.toFixed(1) + 'px';
    pin.style.top = y.toFixed(1) + 'px';
    // labels flip to the left when a pin sits near the right edge
    const flip = x > W - 200;
    pin.style.flexDirection = flip ? 'row-reverse' : 'row';
    pin.style.transform = flip ? 'translate(calc(-100% + 14px), -14px)' : 'translate(-14px, -14px)';
  });
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
let sy = null; // swipe the sheet down to close
sheet.addEventListener('touchstart', (e) => { sy = e.touches[0].clientY; }, { passive: true });
sheet.addEventListener('touchend', (e) => { if (sy !== null && e.changedTouches[0].clientY - sy > 70 && sheet.scrollTop <= 0) closeSheet(); sy = null; });

/* ---------- 2. Story: tear the stub off the boarding pass ---------- */
const pass = $('#pass'), stub = $('#stub');
stub.addEventListener('click', () => {
  pass.classList.add('is-torn');
  stub.setAttribute('aria-expanded', 'true');
  setTimeout(() => $('#stub-back').focus({ preventScroll: true }), reduce ? 0 : 450);
});
$('#stub-back').addEventListener('click', () => {
  pass.classList.remove('is-torn');
  stub.setAttribute('aria-expanded', 'false');
  stub.focus({ preventScroll: true });
});

/* ---------- 3. Work: postcards, front and back side by side ---------- */
const phones = () => `<div class="phones" aria-hidden="true">${[0, 1].map(() => '<div class="phone"><i class="hero-blk"></i><i class="ln"></i><i class="ln s"></i><i class="cta"></i></div>').join('')}</div>`;
const browserMock = () => `<div class="web-mock" aria-hidden="true"><span class="web-bar"><i></i><i></i><i></i></span><span class="web-h"></span><span class="web-l"></span><span class="web-l s"></span><span class="web-cta"></span><span class="web-chart"><i></i><i></i><i></i><i></i></span></div>`;
$('#cards').innerHTML = work.map((w, i) => `
  <article class="work-row reveal" style="--d:${i * 60}ms" aria-label="${esc(w.label)}">
    <a class="postcard pc-front tint-${esc(w.tint)}" href="${esc(w.link.href)}" tabindex="-1" aria-hidden="true">
      <span class="pc-art">
        <span class="t-eyebrow">${esc(w.label)}</span>
        ${w.image ? `<img src="${esc(w.image)}" alt="" loading="lazy">` : (w.kind === 'web' ? browserMock() : phones())}
        <span class="t-hand greet">greetings from the trail</span>
      </span>
    </a>
    <div class="postcard pc-back">
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
    </div>
  </article>`).join('');

/* ---------- 4. Astroverse: start to finish ---------- */
const ART = {
  ratio: () => `
    <div class="art-ratio">
      <p class="big">3.4</p>
      <p class="t-body-l">dislikes for every like in the old, endless Discover feed.</p>
      <div class="dots" role="img" aria-label="17 swipes left for every 5 likes">
        <span class="row">${'<i></i>'.repeat(17)}<em>swipes left</em></span>
        <span class="row like">${'<i></i>'.repeat(5)}<em>likes</em></span>
      </div>
    </div>`,
  note: () => `
    <div class="art-note">
      <div class="sticky"><p class="t-eyebrow">North star for 2.0</p><p class="t-display-m">Fewer profiles, better matches.</p></div>
      <p class="t-hand">every screen: one good decision</p>
    </div>`,
  phones: () => `
    <div class="art-phones">
      <figure><div class="mini-phone before">${'<i></i>'.repeat(7)}</div><figcaption class="t-eyebrow">Before · endless feed</figcaption></figure>
      <span class="art-arrow" aria-hidden="true">→</span>
      <figure><div class="mini-phone after">${'<i></i>'.repeat(3)}</div><figcaption class="t-eyebrow accent">After · 3 handpicked a day</figcaption></figure>
    </div>`,
  copy: () => `
    <div class="art-copy">
      <p class="t-eyebrow muted">Before</p><p class="was">“Prove you’re human”</p>
      <p class="t-eyebrow accent">After</p><p class="now">“Get seen by trusted profiles”</p>
      <p class="t-hand">asked after 3 likes, not at the door</p>
    </div>`,
  chart: () => `
    <div class="art-chart" role="img" aria-label="Likes rose from 23% to 38% of Discover decisions">
      <div class="bar-row"><span class="t-metric muted">23%</span><span class="bar"><i style="--w:23%"></i></span><span class="t-body-s muted">before</span></div>
      <div class="bar-row"><span class="t-metric accent">38%</span><span class="bar now"><i style="--w:38%"></i></span><span class="t-body-s">after</span></div>
      <p class="t-body-s muted">Likes as a share of Discover decisions. Plus ~4 in 5 active users open Top Picks, and 11K+ questions asked to Veda in 3 months.</p>
    </div>`,
};
const stepsEl = $('#steps'), panel = $('#step-panel'), dotsEl = $('#step-dots');
stepsEl.innerHTML = steps.map((s, i) => `
  <button class="step" type="button" role="tab" id="step-${i}" aria-controls="step-panel" aria-selected="false" tabindex="-1">
    <span class="step-num">${String(i + 1).padStart(2, '0')}</span>
    <span class="step-text"><span class="step-title">${esc(s.title)}</span><span class="t-eyebrow step-hat">Hat · ${esc(s.hat)}</span></span>
  </button>`).join('');
dotsEl.innerHTML = steps.map(() => '<i></i>').join('');
const stepBtns = $$('.step', stepsEl), stepDots = $$('i', dotsEl);
let stepNow = -1;
function showStep(i, focus) {
  if (i === stepNow) return;
  stepNow = i;
  const s = steps[i];
  stepBtns.forEach((b, k) => { b.setAttribute('aria-selected', String(k === i)); b.tabIndex = k === i ? 0 : -1; });
  stepDots.forEach((d, k) => d.classList.toggle('on', k === i));
  panel.setAttribute('aria-labelledby', 'step-' + i);
  panel.innerHTML = `
    <header class="window-bar"><span class="t-eyebrow accent">Step ${String(i + 1).padStart(2, '0')} · ${esc(s.title)}</span><span class="t-label muted">Hat: ${esc(s.hat)}</span></header>
    <div class="window-body">
      <div class="window-art">${ART[s.art]()}</div>
      <div class="window-foot">
        <div><p class="t-eyebrow muted">What I did</p><p class="t-body">${esc(s.did)}</p></div>
        <div class="window-side">
          <ul class="tool-stamps">${s.tools.map((t) => `<li>${esc(t)}</li>`).join('')}</ul>
          ${i < steps.length - 1 ? `<button class="link" type="button" data-next>Next: ${esc(steps[i + 1].title)} <span class="arrow" aria-hidden="true">→</span></button>` : '<a class="link" href="astroverse.html">Read the whole case study <span class="arrow" aria-hidden="true">→</span></a>'}
        </div>
      </div>
    </div>`;
  panel.classList.remove('is-in'); void panel.offsetWidth; panel.classList.add('is-in');
  const next = $('[data-next]', panel);
  if (next) next.addEventListener('click', () => { stopAuto(); showStep(i + 1); stepBtns[i + 1].focus({ preventScroll: true }); });
  if (focus) stepBtns[i].focus({ preventScroll: true });
}
stepBtns.forEach((b, i) => {
  b.addEventListener('click', () => { stopAuto(); showStep(i); });
  b.addEventListener('keydown', (e) => {
    const k = { ArrowDown: 1, ArrowRight: 1, ArrowUp: -1, ArrowLeft: -1 }[e.key];
    if (k) { e.preventDefault(); stopAuto(); showStep((i + k + steps.length) % steps.length, true); }
  });
});
showStep(0);
// auto-advance gently while the section is in view, until someone takes over
let autoTimer = null, autoOn = !reduce;
const journey = $('.journey');
function stopAuto() { autoOn = false; clearInterval(autoTimer); }
new IntersectionObserver(([en]) => {
  clearInterval(autoTimer);
  if (en.isIntersecting && autoOn) autoTimer = setInterval(() => showStep((stepNow + 1) % steps.length), 6000);
}, { threshold: 0.5 }).observe(journey);
journey.addEventListener('pointerenter', () => clearInterval(autoTimer));
journey.addEventListener('focusin', stopAuto);
$('#toolbox').innerHTML = tools.map((t, i) => `<li style="--r:${[-2, 1.5, -1, 2, -1.5, 1][i % 6]}deg">${esc(t)}</li>`).join('');

/* ---------- 5. Websites: the souvenir shelf ---------- */
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

/* ---------- 7. Say hello: the post office desk + the wall ---------- */
const desk = $('#desk'), form = $('#pc-form'), msg = $('#pc-msg'), count = $('#pc-count'), sent = $('#sent');
msg.maxLength = postcard.maxLength;
const updateCount = () => { count.textContent = `${msg.value.length} / ${postcard.maxLength}`; };
msg.addEventListener('input', updateCount); updateCount();

let frontChoice = 'trail';
const picks = $$('.pick');
function choose(i) {
  picks.forEach((b, k) => { b.setAttribute('aria-checked', String(k === i)); b.tabIndex = k === i ? 0 : -1; });
  frontChoice = picks[i].dataset.front;
  const art = $('#slot-art');
  art.className = 'pick-art art-' + frontChoice;
  art.parentElement.classList.remove('is-new'); void art.offsetWidth; art.parentElement.classList.add('is-new');
}
picks.forEach((b, i) => {
  b.tabIndex = b.getAttribute('aria-checked') === 'true' ? 0 : -1;
  b.addEventListener('click', () => choose(i));
  b.addEventListener('keydown', (e) => {
    const k = { ArrowDown: 1, ArrowRight: 1, ArrowUp: -1, ArrowLeft: -1 }[e.key];
    if (k) { e.preventDefault(); const n = (i + k + picks.length) % picks.length; choose(n); picks[n].focus(); }
  });
});

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
  let first = null; // one error at a time, the first one
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
  const btn = $('button[type="submit"]', form);
  btn.disabled = true;
  let viaEmailApp = !postcard.endpoint;
  if (postcard.endpoint) {
    try {
      const r = await fetch(postcard.endpoint, { method: 'POST', headers: { 'Content-Type': 'application/json', Accept: 'application/json' }, body: JSON.stringify({ ...data, _subject: `A postcard from ${data.name}` }) });
      if (!r.ok) throw new Error(r.status);
    } catch { viaEmailApp = true; }
  }
  // the card folds into the postbox, the box gives a little shake
  desk.classList.add('is-posting');
  await wait(700);
  if (viaEmailApp) {
    const body = `${data.message}\n\n— ${data.name} (${data.email})\n\nStamp: ${data.front}\nPin it to the wall: ${data.wall ? 'yes' : 'no'}`;
    location.href = `mailto:${links.email}?subject=${encodeURIComponent(`A postcard from ${data.name}`)}&body=${encodeURIComponent(body)}`;
  }
  $('#sent-date').textContent = new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
  $('#sent-msg').textContent = viaEmailApp
    ? 'Your email app should open with the postcard already written. Hit send there and it’s on its way.'
    : 'I read every one and reply within a few days.';
  form.hidden = true; sent.hidden = false; desk.classList.remove('is-posting'); desk.classList.add('is-sent');
  sent.focus();
  btn.disabled = false;
});
$('#pc-again').addEventListener('click', () => {
  form.reset(); updateCount(); form.hidden = false; sent.hidden = true; desk.classList.remove('is-sent'); msg.focus();
});

fetch('assets/data/postcards.json', { cache: 'no-cache' })
  .then((r) => (r.ok ? r.json() : { cards: [] }))
  .catch(() => ({ cards: [] }))
  .then(({ cards = [] }) => {
    const rot = [-3, 2, -1.5, 3, -2, 1.2];
    const pinCol = ['var(--terra-500)', 'var(--ochre-500)', 'var(--forest-600)'];
    const real = cards.map((c, i) => `
      <li class="wall-card${c.mine ? ' is-mine' : ''}" style="--rot:${rot[i % rot.length]}deg;--pin:${pinCol[i % 3]}">
        <div class="top"><span class="t-eyebrow">${esc([c.place, c.date].filter(Boolean).join(' · '))}</span><span class="mini-stamp" aria-hidden="true"></span></div>
        <blockquote>${esc(c.message)}</blockquote>
        <p class="t-body-s from">— ${esc(c.from)}</p>
      </li>`);
    const empty = Array.from({ length: Math.max(0, 4 - cards.length) }, (_, k) => `
      <li class="wall-card is-empty" style="--rot:${rot[(cards.length + k) % rot.length]}deg;--pin:${pinCol[(cards.length + k) % 3]}">
        <a class="t-hand" href="#hello">your card here</a>
      </li>`);
    $('#wall').innerHTML = real.join('') + empty.join('');
  });

/* ---------- 8. Footer: the stamp pad ---------- */
$('#email-link').textContent = links.email;
$('#email-link').href = `mailto:${links.email}`;
const copyEmail = async () => { try { await navigator.clipboard.writeText(links.email); return true; } catch { return false; } };
$('#copy-email').addEventListener('click', async (e) => {
  const ok = await copyEmail();
  e.currentTarget.textContent = ok ? 'Copied' : 'Copy failed';
  setTimeout(() => { $('#copy-email').textContent = 'Copy'; }, 2000);
});
const stampDefs = [
  { label: 'Email', ink: 'Copied ✓', sub: links.email, run: async () => { if (!(await copyEmail())) location.href = `mailto:${links.email}`; } },
  links.linkedin && { label: 'LinkedIn', ink: 'LinkedIn ↗', sub: 'opening…', run: () => open(links.linkedin, '_blank', 'noopener') },
  links.resume && { label: 'Résumé', ink: 'Résumé ↗', sub: 'opening…', run: () => open(links.resume, '_blank', 'noopener') },
  { label: 'Case study', ink: 'Astroverse 2.0', sub: 'opening the case study', run: () => { location.href = links.caseStudy; } },
  { label: 'Postcard', ink: 'Write to me', sub: 'back to the desk', run: () => $('#hello').scrollIntoView({ behavior: reduce ? 'auto' : 'smooth' }) },
  { label: 'Top ↑', ink: 'Trailhead', sub: 'back to the start', run: () => scrollTo({ top: 0, behavior: reduce ? 'auto' : 'smooth' }) },
].filter(Boolean).slice(0, 4);
const rstamps = $('#rstamps'), strip = $('#strip');
rstamps.innerHTML = stampDefs.map((s, i) => `
  <button class="rstamp" type="button" data-i="${i}">
    <span class="knob" aria-hidden="true"></span><span class="neck" aria-hidden="true"></span><span class="block" aria-hidden="true"></span>
    <span class="face">${esc(s.label)}</span>
  </button>`).join('');
$$('.rstamp', rstamps).forEach((b) => b.addEventListener('click', async () => {
  const s = stampDefs[b.dataset.i];
  b.classList.add('is-pressed');
  await wait(260);
  $('.ghost', strip)?.remove();
  const imp = document.createElement('span');
  imp.className = 'imprint';
  imp.style.setProperty('--r', `${(Math.random() * 8 - 4).toFixed(1)}deg`);
  imp.innerHTML = `<b>${esc(s.ink)}</b><span>${esc(s.sub)}</span>`;
  strip.append(imp);
  while (strip.children.length > 2) strip.firstElementChild.remove();
  await wait(180);
  b.classList.remove('is-pressed');
  await wait(220);
  s.run();
}));
const clock = $('#clock');
const tick = () => {
  const t = new Date().toLocaleTimeString('en-IN', { timeZone: 'Asia/Kolkata', hour: '2-digit', minute: '2-digit', hour12: false });
  clock.textContent = `It’s ${t} in India right now`;
};
tick(); setInterval(tick, 30000);

/* ---------- 9. Nav + reveals ---------- */
const navLinks = $$('.nav a');
const io = new IntersectionObserver((entries) => {
  entries.forEach((en) => {
    if (!en.isIntersecting) return;
    const id = en.target.id;
    navLinks.forEach((a) => a.setAttribute('aria-current', String(a.getAttribute('href') === '#' + id)));
  });
}, { rootMargin: '-45% 0px -50% 0px' });
['top', 'story', 'work', 'astroverse', 'sites', 'off-the-clock', 'hello', 'foot'].forEach((id) => io.observe(document.getElementById(id)));

const rv = new IntersectionObserver((entries) => {
  entries.forEach((en) => { if (en.isIntersecting) { en.target.classList.add('is-in'); rv.unobserve(en.target); } });
}, { rootMargin: '0px 0px -8% 0px', threshold: 0.05 });
$$('.reveal').forEach((el) => rv.observe(el));

/* UI: reveals, altitude HUD, trail map, Astroverse switchbacks, fridge magnets, contact. */
import { readProgress, MAX_ALT } from './progress.js';
import { legs, places, links } from './content.js';

const root = document.documentElement;
root.classList.add('js');
const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
const finePointer = matchMedia('(hover: hover) and (pointer: fine)').matches;
const $ = (id) => document.getElementById(id);

/* ---------- reveal ---------- */
const io = new IntersectionObserver((entries) => entries.forEach((e) => {
  if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); }
}), { rootMargin: '0px 0px -8% 0px' });
document.querySelectorAll('.rv').forEach((el) => io.observe(el));
requestAnimationFrame(() => document.querySelectorAll('.rv').forEach((el) => {
  if (el.getBoundingClientRect().top < innerHeight) el.classList.add('in');
}));

/* ---------- HUD + trail map highlight ---------- */
const altEl = $('alt'), altName = $('altname'), gFill = $('g-fill'), gDot = $('g-dot');
const mapLinks = [...document.querySelectorAll('#maplist a')];
function updateHud() {
  const s = readProgress();
  altEl.textContent = Math.round(s.alt).toLocaleString('en-IN') + ' m';
  altName.textContent = s.alt >= MAX_ALT ? 'Summit' : s.name;
  const h = (s.alt / MAX_ALT * 100) + '%';
  gFill.style.height = h; gDot.style.bottom = h;
  root.style.setProperty('--dawn-t', s.dawn.toFixed(3));
  mapLinks.forEach((a, i) => a.setAttribute('aria-current', String(i === s.index)));
}
let ticking = false;
addEventListener('scroll', () => {
  if (ticking) return; ticking = true;
  requestAnimationFrame(() => { updateHud(); ticking = false; });
}, { passive: true });
addEventListener('resize', updateHud);
updateHud();

/* ---------- trail map ---------- */
const mapBtn = $('mapbtn'), mapList = $('maplist');
mapBtn.addEventListener('click', () => {
  const open = mapList.hidden; mapList.hidden = !open; mapBtn.setAttribute('aria-expanded', String(open));
});
mapList.addEventListener('click', (e) => {
  if (e.target.closest('a')) { mapList.hidden = true; mapBtn.setAttribute('aria-expanded', 'false'); }
});
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && !mapList.hidden) { mapList.hidden = true; mapBtn.setAttribute('aria-expanded', 'false'); mapBtn.focus(); }
});
document.addEventListener('click', (e) => {
  if (!mapList.hidden && !e.target.closest('.nav')) { mapList.hidden = true; mapBtn.setAttribute('aria-expanded', 'false'); }
});

/* ---------- Astroverse switchbacks ---------- */
const tabs = [...document.querySelectorAll('.switch button')];
const legEl = $('leg');
const pins = $('pins');
const pinX = [250, 470, 700, 920], pinY = [92, 70, 44, 18];
pinX.forEach((x, i) => {
  const g = document.createElementNS('http://www.w3.org/2000/svg', 'g');
  g.innerHTML = `<circle cx="${x}" cy="${pinY[i]}" r="9" fill="#0B1714" stroke="#FF8A3D" stroke-width="3"/>` +
    `<text x="${x}" y="${pinY[i] + 30}" text-anchor="middle" font-family="JetBrains Mono, monospace" font-size="13" fill="#9FB5AD">0${i + 1}</text>`;
  g.style.cursor = 'pointer';
  g.addEventListener('click', () => showLeg(i));
  pins.appendChild(g);
});
const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
function showLeg(i) {
  const L = legs[i];
  tabs.forEach((b, j) => { b.setAttribute('aria-selected', String(i === j)); b.tabIndex = i === j ? 0 : -1; });
  legEl.setAttribute('aria-labelledby', 'tab-' + i);
  $('leg-title').textContent = L.title;
  $('leg-p').textContent = L.problem;
  $('leg-i').textContent = L.insight;
  $('leg-d').textContent = L.did;
  $('leg-r').textContent = L.result;
  $('leg-phones').innerHTML = L.screens.map((s) => s.src
    ? `<div class="phone"><img src="${esc(s.src)}" alt="Astroverse screen: ${esc(s.label)}" loading="lazy"></div>`
    : `<div class="phone" role="img" aria-label="Placeholder for screen: ${esc(s.label)}"><div class="bar"></div><div class="blk"></div><div class="ln"></div><div class="ln s"></div><div class="ln"></div><em>Screen · ${esc(s.label)}</em><div class="cta"></div></div>`
  ).join('');
  [...pins.children].forEach((g, j) => g.firstChild.setAttribute('fill', j <= i ? '#FF8A3D' : '#0B1714'));
  if (!reduce) legEl.animate([{ opacity: 0, transform: 'translateY(10px)' }, { opacity: 1, transform: 'none' }], { duration: 450, easing: 'cubic-bezier(.2,.7,.2,1)' });
}
tabs.forEach((b) => b.addEventListener('click', () => showLeg(+b.dataset.i)));
document.querySelector('.switch').addEventListener('keydown', (e) => {
  const i = tabs.findIndex((b) => b.getAttribute('aria-selected') === 'true');
  let n;
  if (e.key === 'ArrowRight') n = (i + 1) % tabs.length;
  else if (e.key === 'ArrowLeft') n = (i + tabs.length - 1) % tabs.length;
  else if (e.key === 'Home') n = 0;
  else if (e.key === 'End') n = tabs.length - 1;
  else return;
  e.preventDefault(); showLeg(n); tabs[n].focus();
});
showLeg(0);

const cs = $('caseStudyLink');
if (links.caseStudy) cs.href = links.caseStudy; else cs.hidden = true;

/* ---------- 3D tilt on cards (pointer devices only) ---------- */
if (finePointer && !reduce) {
  document.querySelectorAll('.sign, .fact, .summit-stats > div').forEach((card) => {
    card.addEventListener('pointermove', (e) => {
      const r = card.getBoundingClientRect();
      const x = (e.clientX - r.left) / r.width - 0.5, y = (e.clientY - r.top) / r.height - 0.5;
      card.style.transform = `perspective(900px) rotateX(${(-y * 6).toFixed(2)}deg) rotateY(${(x * 8).toFixed(2)}deg) translateY(-4px)`;
    });
    card.addEventListener('pointerleave', () => { card.style.transform = ''; });
  });
}

/* ---------- fridge magnets ---------- */
const door = $('fridgeDoor');
const mags = [];
const small = () => innerWidth < 520;
function placeMagnets() {
  const W = door.clientWidth, H = door.clientHeight;
  const cols = W < 520 ? 3 : 4;
  const rows = Math.ceil(places.length / cols);
  mags.forEach((m, i) => {
    if (m.dataset.moved) return;
    const col = i % cols, row = Math.floor(i / cols);
    const cw = (W - 60) / cols, rh = (H - 90) / rows;
    const jx = +m.dataset.jx, jy = +m.dataset.jy;
    const x = 24 + col * cw + (cw - m.offsetWidth) / 2 + jx;
    const y = 24 + row * rh + (rh - m.offsetHeight) / 2 * 0.6 + jy;
    m.style.left = Math.max(6, Math.min(W - m.offsetWidth - 30, x)) + 'px';
    m.style.top = Math.max(6, Math.min(H - m.offsetHeight - 40, y)) + 'px';
  });
}
places.forEach((p, i) => {
  const b = document.createElement('button');
  b.type = 'button'; b.className = 'magnet';
  b.setAttribute('aria-pressed', 'false');
  b.setAttribute('aria-label', `${p.name} magnet, ${p.state}. Open postcard`);
  const rot = (Math.random() * 16 - 8).toFixed(1);
  b.dataset.rot = rot; b.dataset.jx = (Math.random() * 16 - 8).toFixed(1); b.dataset.jy = (Math.random() * 16 - 8).toFixed(1);
  b.style.transform = `rotate(${rot}deg)`;
  const sz = small() ? 84 : 104;
  const shape = p.shape === 'round' ? `width:${sz}px;height:${sz}px;border-radius:50%`
    : p.shape === 'rect' ? `width:${sz + 24}px;height:${sz - 24}px;border-radius:12px`
    : `width:${sz}px;height:${sz}px;border-radius:18px 18px 50% 50%`;
  b.innerHTML = `<span class="face" style="${shape};background-color:${p.color}">${esc(p.name)}<small>${esc(p.state.toUpperCase())}</small></span>`;
  door.appendChild(b); mags.push(b);

  let sx, sy, ox, oy, moved = false, pid = null;
  b.addEventListener('pointerdown', (e) => {
    pid = e.pointerId; b.setPointerCapture(pid);
    sx = e.clientX; sy = e.clientY; ox = b.offsetLeft; oy = b.offsetTop; moved = false;
    b.classList.add('dragging');
  });
  b.addEventListener('pointermove', (e) => {
    if (e.pointerId !== pid) return;
    const dx = e.clientX - sx, dy = e.clientY - sy;
    if (Math.abs(dx) + Math.abs(dy) > 5) moved = true;
    if (!moved) return;
    const W = door.clientWidth, H = door.clientHeight;
    b.style.left = Math.max(0, Math.min(W - b.offsetWidth, ox + dx)) + 'px';
    b.style.top = Math.max(0, Math.min(H - b.offsetHeight, oy + dy)) + 'px';
    b.style.transform = `rotate(${(+b.dataset.rot + dx * 0.04).toFixed(1)}deg) scale(1.06)`;
  });
  const end = (e) => {
    if (e.pointerId !== pid) return;
    pid = null; b.classList.remove('dragging');
    b.style.transform = `rotate(${b.dataset.rot}deg)`;
    if (moved) b.dataset.moved = '1'; else openCard(i);
  };
  b.addEventListener('pointerup', end);
  b.addEventListener('pointercancel', end);
  b.addEventListener('keydown', (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); openCard(i); } });
});
requestAnimationFrame(placeMagnets);
addEventListener('resize', () => requestAnimationFrame(placeMagnets));

const pc = $('postcard');
const photo = $('pc-photo');
function openCard(i, scroll = true) {
  const p = places[i];
  mags.forEach((m, j) => m.setAttribute('aria-pressed', String(i === j)));
  $('pc-meta').textContent = `${p.kind} · ${p.name}, ${p.state}`;
  $('pc-meta-b').textContent = `From ${p.name}`;
  photo.dataset.label = `Photo · ${p.name}, ${p.state}`;
  photo.innerHTML = p.photo ? `<img src="${esc(p.photo)}" alt="${esc(p.name)}, ${esc(p.state)}" loading="lazy">` : '';
  photo.style.background = `radial-gradient(120% 80% at 70% 15%, rgba(246,180,143,.35), transparent 60%), linear-gradient(170deg, ${p.color} 0%, #12261F 70%)`;
  $('pc-title').textContent = `${p.name}, ${p.state}`;
  $('pc-local').textContent = p.local;
  $('pc-note').textContent = p.note;
  pc.classList.remove('flip');
  if (scroll && innerWidth < 900) pc.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'nearest' });
}
$('pc-flip').addEventListener('click', () => pc.classList.add('flip'));
$('pc-flip2').addEventListener('click', () => pc.classList.remove('flip'));
openCard(0, false);

/* ---------- contact ---------- */
const copyBtn = $('copyEmail'), copied = $('copied');
copyBtn.textContent = `${links.email} · copy`;
$('emailLink').href = `mailto:${links.email}`;
copyBtn.addEventListener('click', () => {
  const ok = () => { copied.textContent = 'Email copied. See you on the trail!'; };
  const fail = () => { copied.textContent = links.email; };
  try { navigator.clipboard.writeText(links.email).then(ok, fail); } catch { fail(); }
});
const li = $('linkedin');
if (links.linkedin) { li.href = links.linkedin; li.hidden = false; }

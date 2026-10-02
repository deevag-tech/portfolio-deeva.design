/* UI: reveals, the trail rail (progress + nav), permit card, fridge magnets, contact. */
import { readProgress, MAX_ALT } from './progress.js';
import { places, links } from './content.js';

const root = document.documentElement;
root.classList.add('js');
const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
const finePointer = matchMedia('(hover: hover) and (pointer: fine)').matches;
const $ = (id) => document.getElementById(id);
const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

/* ---------- reveal (staggered within each section) ---------- */
document.querySelectorAll('section.camp').forEach((sec) => {
  sec.querySelectorAll('.rv').forEach((el, i) => el.style.setProperty('--d', i));
});
const io = new IntersectionObserver((entries) => entries.forEach((e) => {
  if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); }
}), { rootMargin: '0px 0px -8% 0px' });
document.querySelectorAll('.rv').forEach((el) => io.observe(el));

/* ---------- trail rail: progress + navigation ---------- */
const CAMP_ALTS = [...document.querySelectorAll('section.camp')].map((s) => +s.dataset.alt);
const railLinks = [...document.querySelectorAll('.route a')];
const fill = $('routeFill'), altEl = $('alt'), altName = $('altname');
function railFraction(alt) {
  for (let i = 0; i < CAMP_ALTS.length - 1; i++) {
    const a0 = CAMP_ALTS[i], a1 = CAMP_ALTS[i + 1];
    if (alt <= a1) return (i + (alt - a0) / (a1 - a0)) / (CAMP_ALTS.length - 1);
  }
  return 1;
}
function updateRail() {
  const s = readProgress();
  altEl.textContent = Math.round(s.alt).toLocaleString('en-IN') + ' m';
  const current = s.alt >= MAX_ALT ? CAMP_ALTS.length - 1 : s.index;
  altName.textContent = railLinks[current]?.querySelector('b')?.textContent || '';
  fill.style.height = (railFraction(s.alt) * 100).toFixed(2) + '%';
  railLinks.forEach((a, i) => {
    a.setAttribute('aria-current', String(i === current));
    a.classList.toggle('passed', i < current);
  });
  root.style.setProperty('--dawn-t', s.dawn.toFixed(3));
  // keep the reading scrim until the very last stretch of sunrise
  root.style.setProperty('--scrim', (1 - Math.min(1, Math.max(0, (s.dawn - 0.7) / 0.3))).toFixed(3));
}
let ticking = false;
addEventListener('scroll', () => {
  if (ticking) return; ticking = true;
  requestAnimationFrame(() => { updateRail(); ticking = false; });
}, { passive: true });
addEventListener('resize', updateRail);
addEventListener('load', updateRail);
updateRail();

/* ---------- case study link ---------- */
const cs = $('caseStudyLink');
if (cs && links.caseStudy) cs.href = links.caseStudy;

/* ---------- permit card: flip + gentle tilt ---------- */
const permit = $('permit');
const flipBtns = [...document.querySelectorAll('.permit-flip')];
function setFlip(on) {
  permit.classList.toggle('flipped', on);
  flipBtns[0].setAttribute('aria-expanded', String(on));
  // keep focus on the visible side
  const target = on ? flipBtns[1] : flipBtns[0];
  setTimeout(() => target.focus({ preventScroll: true }), reduce ? 0 : 450);
  document.querySelector('.permit-face.front').inert = on;
  document.querySelector('.permit-face.back').inert = !on;
}
document.querySelector('.permit-face.back').inert = true;
flipBtns.forEach((b, i) => b.addEventListener('click', () => setFlip(i === 0)));
if (finePointer && !reduce) {
  const wrap = document.querySelector('.permit-wrap');
  wrap.addEventListener('pointermove', (e) => {
    const r = wrap.getBoundingClientRect();
    const x = (e.clientX - r.left) / r.width - 0.5, y = (e.clientY - r.top) / r.height - 0.5;
    permit.style.transform = `rotate(-1deg) rotateX(${(-y * 7).toFixed(2)}deg) rotateY(${(x * 9).toFixed(2)}deg)`;
  });
  wrap.addEventListener('pointerleave', () => { permit.style.transform = ''; });
}

/* ---------- fridge magnets ---------- */
const door = $('fridgeDoor');
const mags = [];
function placeMagnets() {
  const W = door.clientWidth, H = door.clientHeight;
  const cols = W < 520 ? 3 : 4;
  const rows = Math.ceil(places.length / cols);
  mags.forEach((m, i) => {
    if (m.dataset.moved) return;
    const col = i % cols, row = Math.floor(i / cols);
    const cw = (W - 60) / cols, rh = (H - 90) / rows;
    const x = 24 + col * cw + (cw - m.offsetWidth) / 2 + +m.dataset.jx;
    const y = 24 + row * rh + (rh - m.offsetHeight) / 2 * 0.6 + +m.dataset.jy;
    m.style.left = Math.max(6, Math.min(W - m.offsetWidth - 30, x)) + 'px';
    m.style.top = Math.max(6, Math.min(H - m.offsetHeight - 40, y)) + 'px';
  });
}
places.forEach((p, i) => {
  const b = document.createElement('button');
  b.type = 'button'; b.className = 'magnet';
  b.setAttribute('aria-pressed', 'false');
  b.setAttribute('aria-label', `${p.name} magnet, ${p.state}. Open postcard`);
  const rot = (Math.random() * 14 - 7).toFixed(1);
  b.dataset.rot = rot; b.dataset.jx = (Math.random() * 14 - 7).toFixed(1); b.dataset.jy = (Math.random() * 14 - 7).toFixed(1);
  b.style.transform = `rotate(${rot}deg)`;
  const sz = innerWidth < 520 ? 84 : 104;
  const shape = p.shape === 'round' ? `width:${sz}px;height:${sz}px;border-radius:50%`
    : p.shape === 'rect' ? `width:${sz + 24}px;height:${sz - 24}px;border-radius:12px`
    : `width:${sz}px;height:${sz}px;border-radius:18px 18px 50% 50%`;
  const bg = p.photo ? `background-image:linear-gradient(rgba(15,27,45,.35),rgba(15,27,45,.35)),url('${esc(p.photo)}')` : `background-color:${p.color}`;
  b.innerHTML = `<span class="face" style="${shape};${bg}">${esc(p.name)}<small>${esc(p.state.toUpperCase())}</small></span>`;
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
  photo.style.background = `radial-gradient(120% 80% at 70% 15%, rgba(244,167,185,.35), transparent 60%), linear-gradient(170deg, ${p.color} 0%, #1C2B44 70%)`;
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
$('emailText').textContent = links.email;
$('emailLink').href = `mailto:${links.email}`;
copyBtn.addEventListener('click', () => {
  const ok = () => { copied.textContent = 'Copied. See you on the trail!'; };
  const fail = () => { copied.textContent = links.email; };
  try { navigator.clipboard.writeText(links.email).then(ok, fail); } catch { fail(); }
});
const li = $('linkedin');
if (links.linkedin) { li.href = links.linkedin; li.hidden = false; }

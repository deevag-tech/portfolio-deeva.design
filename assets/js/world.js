/* ==========================================================================
   The world behind the trail: one real photograph of the mountain.
   As you scroll, a camera climbs towards the big peak: it starts on the
   whole range above the cloud sea and ends close on the summit, with the
   light warming from dawn to sunset and banks of cloud passing on the way.

   In the hero the name sits between the photo and a cut-out of the same
   photo's peaks and cloud sea (a CSS mask, see .hero-scene .fg), so it
   genuinely rises from behind the mountains when the clouds part.
   ========================================================================== */
import { intro } from './intro.js';
import { readProgress } from './progress.js';
import { paintClouds } from './clouds.js';

const root = document.documentElement;
const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
const finePointer = matchMedia('(hover: hover) and (pointer: fine)').matches;
const world = document.getElementById('world');
const scene = world.querySelector('.hero-scene');
const name = world.querySelector('.hero-name');
const imgs = [...scene.querySelectorAll('img')];
const tag = document.querySelector('.hero-tag');
const gDay = world.querySelector('.grade-day');
const gSun = world.querySelector('.grade-sunset');
const sun = world.querySelector('.sun');
const drifts = [...world.querySelectorAll('.drift canvas')];

/* Photo geometry, in pixels of the 2560-wide hero.jpg. */
const IMG = { w: 2560, h: 1706, horizon: 836 };

/* The climb. alt = altitude of each camp (see data-alt in index.html).
   s = zoom, p = the point of the photo the camera looks at,
   q = where that point sits on screen (fractions of the viewport). */
const PATH = [
  { alt: 0,    s: 1.04, p: [1280, 853], q: [0.5, 0.5] },
  { alt: 1200, s: 1.3,  p: [1440, 860], q: [0.5, 0.5] },
  { alt: 2600, s: 1.62, p: [1610, 850], q: [0.55, 0.5] },
  { alt: 3300, s: 1.8,  p: [1720, 845], q: [0.52, 0.49] },
  { alt: 3900, s: 2.05, p: [1820, 840], q: [0.44, 0.47] },
  { alt: 4500, s: 2.3,  p: [1890, 880], q: [0.3, 0.48] },  // summit: the peak on the left, the card on the right
];
/* Where the clouds pass: between the camps. */
const BANKS = [620, 1900, 2950, 3600, 4200];

const clamp01 = (v) => (v < 0 ? 0 : v > 1 ? 1 : v);
const lerp = (a, b, t) => a + (b - a) * t;
const ease = (t) => t * t * (3 - 2 * t);

function camAt(alt, W, H) {
  let i = 0;
  while (i < PATH.length - 2 && alt > PATH[i + 1].alt) i++;
  const A = PATH[i], B = PATH[i + 1];
  const t = ease(clamp01((alt - A.alt) / (B.alt - A.alt)));
  const portrait = W / H < 0.8;
  const qx = (k) => (portrait ? 0.5 : k.q[0]);
  const qy = (k) => (portrait && k === PATH[PATH.length - 1] ? 0.8 : k.q[1]);   // phones: the peak rises below the card
  return {
    s: Math.exp(lerp(Math.log(A.s), Math.log(B.s), t)),   // zoom feels even when it's interpolated in log space
    px: lerp(A.p[0], B.p[0], t), py: lerp(A.p[1], B.p[1], t),
    qx: lerp(qx(A), qx(B), t), qy: lerp(qy(A), qy(B), t),
  };
}

/* ---------- loading: the hero photo first, a sharper copy for the close-ups later ---------- */
const heroImg = imgs[0];
let announced = false;
function ready() {
  if (announced) return;
  announced = true;
  root.classList.add('world-ready');
  intro.ready = true;
  dispatchEvent(new Event('world:ready'));
}
if (heroImg.complete && heroImg.naturalWidth) ready();
else {
  heroImg.addEventListener('load', () => (heroImg.decode ? heroImg.decode().catch(() => {}) : Promise.resolve()).then(ready), { once: true });
  heroImg.addEventListener('error', ready, { once: true });
}
setTimeout(ready, 4000); // never hold the page hostage to one photo

let xlState = 0;
function loadXL() {
  if (xlState) return;
  xlState = 1;
  const xl = new Image();
  xl.src = 'assets/img/hero-xl.jpg';
  (xl.decode ? xl.decode() : new Promise((r) => (xl.onload = r))).then(() => {
    imgs.forEach((im) => { im.removeAttribute('srcset'); im.removeAttribute('sizes'); im.src = xl.src; });
    xlState = 2;
  }).catch(() => { xlState = 3; });   // stay on the normal photo
}

/* ---------- passing clouds ---------- */
const sstep = (a, b, x) => { const t = clamp01((x - a) / (b - a)); return t * t * (3 - 2 * t); };
// a wide bank, thickest through the middle, ragged at the top and bottom
const band = (u, v) => sstep(0.02, 0.42, v) * sstep(0.02, 0.42, 1 - v) * (0.75 + 0.25 * Math.sin(u * 7.0 + v * 3.0));
function paintDrift() {
  const q = innerWidth < 760 ? 0.36 : 0.42;
  drifts.forEach((c, i) => {
    const r = c.getBoundingClientRect();
    c.width = Math.max(32, Math.round(r.width * q));
    c.height = Math.max(32, Math.round(r.height * q));
    paintClouds(c, { shape: band, seed: 21 + i * 17, scale: 2.2, cover: 0.52, softness: 0.3 });
  });
}

/* ---------- layout: pin the tagline and the name to the photo's horizon ---------- */
let W = 0, H = 0, base = 1, hx = 0.5;
function layout() {
  W = world.clientWidth; H = world.clientHeight;
  hx = W / H < 0.8 ? 0.62 : 0.5;
  base = Math.max(W / IMG.w, H / IMG.h);
  const s0 = PATH[0].s;
  const horizonRaw = (H - IMG.h * base) / 2 + IMG.horizon * base;      // in the photo's own layout
  const horizon = H / 2 + (horizonRaw - H / 2) * s0;                   // on screen, with the first camera
  const gap = Math.max(10, H * 0.02);
  const tagY = horizon - gap;
  const nameScreen = tagY - (tag ? tag.offsetHeight : 0) - gap * 1.4;
  const nameY = H / 2 + (nameScreen - H / 2) / s0;                     // back into the scene's coordinates
  root.style.setProperty('--horizon', horizon.toFixed(1) + 'px');
  root.style.setProperty('--tag-y', tagY.toFixed(1) + 'px');
  root.style.setProperty('--name-y', nameY.toFixed(1) + 'px');
  root.style.setProperty('--rise', (horizonRaw - nameY + name.offsetHeight + 24).toFixed(1) + 'px');
}

/* ---------- frame ---------- */
let cur = null, mx = 0, my = 0, tmx = 0, tmy = 0, ticking = false;
const request = () => { if (!ticking) { ticking = true; requestAnimationFrame(frame); } };

function frame() {
  ticking = false;
  const { alt } = readProgress();
  const target = camAt(reduce ? 0 : alt, W, H);
  if (!cur || reduce) cur = { ...target };
  else for (const k in target) cur[k] += (target[k] - cur[k]) * 0.12;   // a little inertia, like a real camera
  mx += (tmx - mx) * 0.08; my += (tmy - my) * 0.08;

  // camera: put photo point p at screen point q, at zoom s (scene scales from its top-left corner)
  const ox = (W - IMG.w * base) * hx, oy = (H - IMG.h * base) / 2;
  let tx = cur.qx * W - (ox + cur.px * base) * cur.s - mx * 12;
  let ty = cur.qy * H - (oy + cur.py * base) * cur.s - my * 8;
  tx = Math.min(0, Math.max(W - W * cur.s, tx));
  ty = Math.min(0, Math.max(H - H * cur.s, ty));
  scene.style.transform = `translate3d(${tx.toFixed(1)}px, ${ty.toFixed(1)}px, 0) scale(${cur.s.toFixed(4)})`;
  if (cur.s > 1.45) loadXL();

  // the name lifts away as you leave the trailhead
  const p = Math.min(1.3, scrollY / innerHeight);
  name.style.opacity = clamp01(1 - p * 1.6).toFixed(3);
  if (!reduce) name.style.transform = `translate3d(${(mx * 14).toFixed(1)}px, calc(-100% - ${(p * 18).toFixed(2)}vh), 0)`;

  // light: dawn at the trailhead, clear morning on the trail, sunset at the summit
  const a = alt;
  gDay.style.opacity = (0.55 * clamp01((a - 300) / 1200) * (1 - clamp01((a - 3100) / 900))).toFixed(3);
  const dusk = clamp01((a - 3300) / 1200);
  gSun.style.opacity = (dusk * 0.72).toFixed(3);
  sun.style.opacity = (dusk * 0.85).toFixed(3);

  // clouds you climb through between camps
  if (!reduce) {
    let k = 0, d = 9;
    BANKS.forEach((b, i) => { const dd = (a - b) / 380; if (Math.abs(dd) < Math.abs(d)) { d = dd; k = i; } });
    drifts.forEach((c, i) => {
      const on = i === k % 2 && Math.abs(d) < 1;
      const o = on ? Math.pow(1 - Math.abs(d), 1.6) * 0.8 : 0;
      c.style.opacity = o.toFixed(3);
      if (on) c.style.transform = `translate3d(${(i ? 1 : -1) * d * 6}vw, ${(-d * 62).toFixed(2)}vh, 0) scale(${(1.05 + (1 - Math.abs(d)) * 0.12).toFixed(3)})${i ? ' scaleX(-1)' : ''}`;
    });
  }

  const moving = Math.abs(target.s - cur.s) > 0.0004 || Math.abs(target.px - cur.px) > 0.2 || Math.abs(target.py - cur.py) > 0.2
    || Math.abs(tmx - mx) > 0.002 || Math.abs(tmy - my) > 0.002;
  if (moving) request();
}

function measure() { layout(); request(); }

addEventListener('scroll', request, { passive: true });
let rt;
addEventListener('resize', () => { clearTimeout(rt); rt = setTimeout(() => { measure(); paintDrift(); }, 150); });
addEventListener('load', measure);
if (document.fonts) document.fonts.ready.then(measure);
if (finePointer && !reduce) addEventListener('pointermove', (e) => { tmx = e.clientX / innerWidth - 0.5; tmy = e.clientY / innerHeight - 0.5; request(); }, { passive: true });
measure();
if (!reduce) requestAnimationFrame(paintDrift);

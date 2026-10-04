/* ==========================================================================
   Hero intro: the trailhead starts buried in golden-hour cloud. Once the 3D
   world is ready the clouds part to the sides, the name rises from behind
   the peak (scene.js), and the intro copy settles in the middle.
   Scrolling then pulls the cloud layers away at different speeds (parallax).
   ========================================================================== */
import { paintClouds, shapes } from './clouds.js';
import { intro } from './intro.js';

const root = document.documentElement;
const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
const finePointer = matchMedia('(hover: hover) and (pointer: fine)').matches;
const box = document.querySelector('.hero-clouds');

/* ---------- paint the cloud layers ---------- */
const layers = box ? [
  { el: box.querySelector('.cl-left canvas'), opts: { shape: shapes.curtain(-1, 0.82), seed: 3, scale: 3.0, cover: 0.62 } },
  { el: box.querySelector('.cl-right canvas'), opts: { shape: shapes.curtain(1, 0.82), seed: 7, scale: 3.0, cover: 0.62 } },
  { el: box.querySelector('.cl-bank canvas'), opts: { shape: shapes.bank(0.34), seed: 11, scale: 1.9, cover: 0.58, softness: 0.24 } },
] : [];
let paintedFor = '';
function paint() {
  const key = Math.round(innerWidth / 80) + 'x' + Math.round(innerHeight / 80);
  if (key === paintedFor) return;
  paintedFor = key;
  const q = innerWidth < 760 ? 0.38 : 0.45; // clouds are soft: paint at under half resolution
  for (const L of layers) {
    const r = L.el.getBoundingClientRect();
    L.el.width = Math.max(32, Math.round(r.width * q));
    L.el.height = Math.max(32, Math.round(r.height * q));
    paintClouds(L.el, L.opts);
  }
}

/* ---------- timeline ---------- */
function part() {
  if (intro.start !== null) return;
  intro.start = performance.now();
  root.classList.remove('intro-cover');
  root.classList.add('intro-part');
  setTimeout(() => root.classList.add('intro-done'), 3400);
}

if (!box) {
  intro.start = performance.now() - 9999;
} else if (reduce || scrollY > innerHeight * 0.3) {
  // no show: start with the clouds already parted
  root.classList.remove('intro-cover');
  root.classList.add('intro-part', 'intro-done', 'intro-instant');
  paint();
  intro.start = performance.now() - 9999;
} else {
  root.classList.add('intro-cover');
  requestAnimationFrame(() => {
    paint();
    if (intro.ready) setTimeout(part, 350);
    else addEventListener('world:ready', () => setTimeout(part, 350), { once: true });
    setTimeout(part, 3200);                // never wait forever (slow GPU, no WebGL)
  });
  // scrolling or a key press skips straight to the reveal
  const skip = () => part();
  addEventListener('wheel', skip, { once: true, passive: true });
  addEventListener('touchmove', skip, { once: true, passive: true });
  addEventListener('keydown', skip, { once: true });
}

/* ---------- parallax ---------- */
if (box && !reduce) {
  const px = [...box.querySelectorAll('.px')];
  let mx = 0, my = 0, tmx = 0, tmy = 0, ticking = false;
  const apply = () => {
    ticking = false;
    const p = Math.min(1.4, scrollY / innerHeight);
    mx += (tmx - mx) * 0.08; my += (tmy - my) * 0.08;
    px.forEach((el) => {
      const d = +el.dataset.depth || 1, side = +el.dataset.side || 0;
      const x = side * p * 26 * d, y = (side ? 10 : 38) * p * d;   // scroll: drift apart and sink (vw / vh)
      el.style.transform = `translate3d(calc(${x.toFixed(2)}vw + ${(-mx * 16 * d).toFixed(1)}px), calc(${y.toFixed(2)}vh + ${(-my * 10 * d).toFixed(1)}px), 0)`;
    });
    box.style.opacity = Math.max(0, 1 - Math.max(0, p - 0.35) * 1.6).toFixed(3);
    box.style.visibility = p > 1 ? 'hidden' : '';
    if (Math.abs(tmx - mx) > 0.002 || Math.abs(tmy - my) > 0.002) request();
  };
  const request = () => { if (!ticking) { ticking = true; requestAnimationFrame(apply); } };
  addEventListener('scroll', request, { passive: true });
  if (finePointer) addEventListener('pointermove', (e) => { tmx = e.clientX / innerWidth - 0.5; tmy = e.clientY / innerHeight - 0.5; request(); }, { passive: true });
  apply();
}

let rt;
addEventListener('resize', () => { clearTimeout(rt); rt = setTimeout(paint, 300); });

/* Scroll -> altitude. Shared by the UI (app.js) and the 3D world (scene.js)
   so the HUD, the camera and the lantern always agree on where you are. */

export const MAX_ALT = 4500;

const camps = () => [...document.querySelectorAll('section.camp')];
const lerp = (a, b, t) => a + (b - a) * t;
const clamp01 = (v) => Math.min(1, Math.max(0, v));

export function readProgress() {
  const list = camps();
  const y = window.scrollY;
  const vh = window.innerHeight;
  const docH = document.documentElement.scrollHeight - vh;
  const page = docH > 0 ? clamp01(y / docH) : 0;

  // The probe sits near the middle of the viewport once you start scrolling.
  const probe = y + vh * 0.5 * Math.min(1, y / 300);
  let alt = 0;
  let index = 0;
  for (let i = 0; i < list.length; i++) {
    const c = list[i];
    const n = list[i + 1];
    const t0 = c.offsetTop;
    const a0 = +c.dataset.alt;
    if (!n) { if (probe >= t0) { alt = a0; index = i; } break; }
    const t1 = n.offsetTop;
    const a1 = +n.dataset.alt;
    if (probe >= t0 && probe < t1) { alt = lerp(a0, a1, (probe - t0) / (t1 - t0)); index = i; break; }
  }
  if (page > 0.985) { alt = MAX_ALT; index = list.length - 1; }

  const p = alt / MAX_ALT;                       // 0 trailhead -> 1 summit
  const dawn = clamp01((alt - 1500) / 3000);      // golden hour -> sunset as you climb
  return { p, alt, dawn, page, index, name: list[index]?.dataset.name || '' };
}

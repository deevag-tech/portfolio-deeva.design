/* ==========================================================================
   Procedural golden-hour clouds, painted pixel by pixel on a 2D canvas.
   Billowy fBm noise gives the shape; sampling the density a step towards
   the sun gives the lighting (sunlit rims, blue-grey undersides).
   Used for the hero's cloud curtains and for the 3D cloud-sea sprites.
   ========================================================================== */

export const CLOUD = {
  light: [255, 244, 230],  // sunlit rims
  peach: [246, 196, 160],  // golden mid-tones
  shade: [150, 163, 172],  // blue-grey undersides
  deep:  [96, 110, 122],   // deepest shadow
};

/* --- tiny seeded value noise --- */
function makeNoise(seed) {
  const P = new Uint8Array(512);
  let s = seed * 9301 + 49297;
  const r = () => { s = (s * 9301 + 49297) % 233280; return s / 233280; };
  const perm = [...Array(256).keys()];
  for (let i = 255; i > 0; i--) { const j = Math.floor(r() * (i + 1)); [perm[i], perm[j]] = [perm[j], perm[i]]; }
  for (let i = 0; i < 512; i++) P[i] = perm[i & 255];
  const V = new Float32Array(256); for (let i = 0; i < 256; i++) V[i] = r();
  return (x, y) => {
    const xi = Math.floor(x), yi = Math.floor(y), xf = x - xi, yf = y - yi;
    const u = xf * xf * (3 - 2 * xf), v = yf * yf * (3 - 2 * yf);
    const X = xi & 255, Y = yi & 255;
    const a = V[P[P[X] + Y]], b = V[P[P[X + 1] + Y]], c = V[P[P[X] + Y + 1]], d = V[P[P[X + 1] + Y + 1]];
    return a + (b - a) * u + (c - a) * v + (a - b - c + d) * u * v;
  };
}

const clamp01 = (v) => v < 0 ? 0 : v > 1 ? 1 : v;
const sstep = (a, b, x) => { const t = clamp01((x - a) / (b - a)); return t * t * (3 - 2 * t); };
const mix = (a, b, t) => a + (b - a) * t;

/* Ready-made masks: (u, v) in 0..1 -> how much cloud belongs there (0..1) */
export const shapes = {
  /* hugs the left (side -1) or right (side 1) edge, reaching `reach` across */
  curtain: (side, reach) => (u, v) => sstep(-0.05, 0.35, (side < 0 ? reach - u : u - (1 - reach)) + 0.06 * Math.sin(v * 9)),
  /* a bank rising from the bottom, top edge at `top` */
  bank: (top) => (u, v) => sstep(-0.04, 0.3, v - top),
  /* a single flat-bottomed cumulus */
  puff: () => (u, v) => {
    const dx = (u - 0.5) / 0.48, dy = v < 0.66 ? (v - 0.66) / 0.6 : (v - 0.66) / 0.3;
    return sstep(0, 0.75, 1 - Math.hypot(dx, dy));
  },
};

/**
 * Paint clouds into a canvas.
 * scale: noise frequency (bigger = smaller billows). cover: 0..1 how solid.
 * light: direction to the sun in canvas space (x right, y down).
 */
export function paintClouds(canvas, { shape, seed = 1, scale = 3.2, cover = 0.55, light = [-0.6, -0.8], softness = 0.12, warm = 1 } = {}) {
  const w = canvas.width, h = canvas.height;
  const ctx = canvas.getContext('2d');
  const img = ctx.createImageData(w, h);
  const D = img.data;
  const n = makeNoise(seed);
  const aspect = w / h;
  // fBm with a rotation per octave (no grid-aligned streaks)
  const C1 = Math.cos(0.65), S1 = Math.sin(0.65);
  const fbm = (x, y, oct = 6) => {
    let s = 0, a = 0.5, t;
    for (let o = 0; o < oct; o++) { s += a * n(x, y); t = (x * C1 - y * S1) * 2.03 + 5.2; y = (x * S1 + y * C1) * 2.03 + 1.7; x = t; a *= 0.5; }
    return s;
  };
  const density = (u, v, oct) => {
    const m = shape(u, v);
    if (m <= 0.001) return -1;
    const x = u * scale * aspect, y = v * scale;
    const wx = fbm(x * 0.5 + 7.1, y * 0.5, 3) - 0.5, wy = fbm(x * 0.5, y * 0.5 + 3.3, 3) - 0.5;
    const base = fbm(x + wx * 1.4, y + wy * 1.4, oct);
    return (base + m * 0.75) - (1.05 - cover * 0.6);
  };
  const step = 0.035;
  const lx = light[0] * step, ly = light[1] * step;
  const [L, P, S, Dp] = [CLOUD.light, CLOUD.peach, CLOUD.shade, CLOUD.deep];
  for (let j = 0; j < h; j++) {
    const v = j / h;
    for (let i = 0; i < w; i++) {
      const u = i / w;
      const d = density(u, v, 6);
      const k = (j * w + i) * 4;
      if (d <= 0) { D[k + 3] = 0; continue; }
      const alpha = sstep(0, softness, d);
      // lighting: how much less cloud there is towards the sun
      const toward = density(u + lx / aspect, v + ly, 4);
      let lit = clamp01(0.5 + (d - Math.max(toward, 0)) * 3.2 - sstep(0, 0.5, d) * 0.25);
      lit = mix(lit, 1 - v * 0.6, 0.25);            // tops a bit brighter overall
      const core = sstep(0.1, 0.6, d);               // thick cores go slightly grey
      let r, g, b;
      if (lit > 0.6) { const t = (lit - 0.6) / 0.4; r = mix(P[0], L[0], t); g = mix(P[1], L[1], t); b = mix(P[2], L[2], t); }
      else if (lit > 0.3) { const t = (lit - 0.3) / 0.3; r = mix(S[0], P[0], t); g = mix(S[1], P[1], t); b = mix(S[2], P[2], t); }
      else { const t = lit / 0.3; r = mix(Dp[0], S[0], t); g = mix(Dp[1], S[1], t); b = mix(Dp[2], S[2], t); }
      const grey = core * 0.18;
      r = mix(r, S[0], grey); g = mix(g, S[1], grey); b = mix(b, S[2], grey);
      if (warm < 1) { const avg = (r + g + b) / 3; r = mix(avg, r, warm); g = mix(avg, g, warm); b = mix(avg, b, warm); }
      D[k] = r; D[k + 1] = g; D[k + 2] = b; D[k + 3] = alpha * 255;
    }
  }
  ctx.putImageData(img, 0, 0);
  return canvas;
}

/* A cumulus texture for a 3D sprite. */
export function cloudCanvas(w, h, seed) {
  const c = document.createElement('canvas'); c.width = w; c.height = h;
  return paintClouds(c, { shape: shapes.puff(), seed, scale: 2.2, cover: 0.5, softness: 0.32 });
}

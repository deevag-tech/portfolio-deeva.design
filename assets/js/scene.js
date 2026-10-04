/* ==========================================================================
   The 3D world: a low-poly mountain above a sea of golden-hour clouds, with
   a lit trail that spirals to the summit. Scroll moves the hiker (and the
   camera) up the trail; camp beacons light up as you pass them, and the
   light deepens from golden hour to sunset at the top. The hero title is a
   plane far behind the peak, so it really rises from behind the mountains.
   Uses Three.js from the CDN (see the importmap in index.html).
   ========================================================================== */
import * as THREE from 'three';
import { readProgress, MAX_ALT } from './progress.js';
import { cloudCanvas } from './clouds.js';
import { intro } from './intro.js';

const canvas = document.getElementById('world');
const root = document.documentElement;
const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
const narrow = () => innerWidth < 760;
const lowPower = matchMedia('(max-width: 760px)').matches || (navigator.hardwareConcurrency || 8) <= 4;

/* ---------- small helpers ---------- */
const clamp01 = (v) => Math.min(1, Math.max(0, v));
const lerp = (a, b, t) => a + (b - a) * t;
const smooth = (a, b, x) => { const t = clamp01((x - a) / (b - a)); return t * t * (3 - 2 * t); };
const C = (hex) => new THREE.Color(hex);

/* Value noise + fBm (deterministic, no dependencies) */
function hash(x, y) { const s = Math.sin(x * 127.1 + y * 311.7) * 43758.5453; return s - Math.floor(s); }
function vnoise(x, y) {
  const xi = Math.floor(x), yi = Math.floor(y), xf = x - xi, yf = y - yi;
  const u = xf * xf * (3 - 2 * xf), v = yf * yf * (3 - 2 * yf);
  const a = hash(xi, yi), b = hash(xi + 1, yi), c = hash(xi, yi + 1), d = hash(xi + 1, yi + 1);
  return a + (b - a) * u + (c - a) * v + (a - b - c + d) * u * v;
}
function fbm(x, y, o = 5) { let s = 0, a = 0.5, f = 1; for (let i = 0; i < o; i++) { s += a * vnoise(x * f, y * f); f *= 2.03; a *= 0.5; } return s; }
function ridged(x, y) { let s = 0, a = 0.5, f = 1; for (let i = 0; i < 4; i++) { const n = 1 - Math.abs(vnoise(x * f, y * f) * 2 - 1); s += a * n * n; f *= 2.1; a *= 0.5; } return s; }

/* ---------- terrain height field ---------- */
function heightAt(x, z) {
  const r = Math.hypot(x, z);
  const massif = 46 * Math.exp(-(r * r) / (2 * 30 * 30));
  const spire = 12 * Math.pow(Math.max(0, 1 - r / 20), 1.6);
  const shoulders = 15 * Math.exp(-((x - 40) ** 2 + (z + 24) ** 2) / (2 * 19 * 19))
                  + 11 * Math.exp(-((x + 42) ** 2 + (z - 30) ** 2) / (2 * 17 * 17));
  const ridges = ridged(x * 0.035 + 3.1, z * 0.035 - 1.7) * 10 * (0.35 + 0.65 * Math.exp(-r / 70));
  const range = 44 * smooth(115, 210, r) * (0.35 + fbm(x * 0.018 + 7, z * 0.018 - 3));
  const detail = (fbm(x * 0.09, z * 0.09, 3) - 0.5) * 3;
  return massif + spire + shoulders + ridges + range + detail - 3;
}

function init() {
  let renderer;
  try {
    renderer = new THREE.WebGLRenderer({ canvas, antialias: !lowPower, powerPreference: 'high-performance' });
  } catch (e) {
    return; // html.no-webgl stays on and the CSS sky is shown instead
  }
  root.classList.remove('no-webgl');
  canvas.style.opacity = '0';
  canvas.style.transition = 'opacity 1.2s ease';

  renderer.setPixelRatio(Math.min(devicePixelRatio || 1, lowPower ? 1.5 : 1.75));
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.0;

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(50, 1, 0.5, 2000);

  /* ---------- palette (golden hour -> sunset) ---------- */
  // "night"/"dawn" keep their old names: 0 = golden hour at the trailhead, 1 = sunset at the summit
  const night = { top: C('#3F7E8C'), horizon: C('#F2C7A2'), bottom: C('#B8A79A'), hemiSky: C('#cfe1e2'), hemiGround: C('#4b4a4c'), key: C('#ffcf9c'), fog: C('#c9c4bb') };
  const dawn  = { top: C('#2F5866'), horizon: C('#F0A06C'), bottom: C('#C98A6A'), hemiSky: C('#f4c7a8'), hemiGround: C('#4a3a40'), key: C('#ff9f6a'), fog: C('#d9a888') };
  const tmp = new THREE.Color();

  /* ---------- sky dome ---------- */
  const skyUniforms = {
    uTop: { value: night.top.clone() }, uHorizon: { value: night.horizon.clone() }, uBottom: { value: night.bottom.clone() },
    uSunDir: { value: new THREE.Vector3(0, 0.1, -1) }, uSunColor: { value: C('#ffe2bf') }, uDawn: { value: 0 },
  };
  const sky = new THREE.Mesh(
    new THREE.SphereGeometry(1500, 32, 16),
    new THREE.ShaderMaterial({
      side: THREE.BackSide, depthWrite: false, fog: false, uniforms: skyUniforms,
      vertexShader: `varying vec3 vDir; void main(){ vDir = normalize(position); gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0); }`,
      fragmentShader: `
        uniform vec3 uTop, uHorizon, uBottom, uSunColor, uSunDir; uniform float uDawn; varying vec3 vDir;
        void main(){
          vec3 d = normalize(vDir);
          float h = d.y;
          vec3 col = h > 0.0 ? mix(uHorizon, uTop, smoothstep(0.0, 0.55, h)) : mix(uHorizon, uBottom, smoothstep(0.0, -0.25, h));
          float s = max(dot(d, normalize(uSunDir)), 0.0);
          col += uSunColor * (pow(s, 900.0) * 5.0 + pow(s, 24.0) * 0.5 + pow(s, 4.0) * 0.22) * (0.65 + 0.35 * uDawn);
          gl_FragColor = vec4(col, 1.0);
          #include <tonemapping_fragment>
          #include <colorspace_fragment>
        }`,
    }),
  );
  scene.add(sky);
  scene.fog = new THREE.Fog(night.fog.clone(), 80, 560);

  /* ---------- lights ---------- */
  const hemi = new THREE.HemisphereLight(night.hemiSky, night.hemiGround, 1.3);
  scene.add(hemi);
  const key = new THREE.DirectionalLight(night.key, 1.1);
  scene.add(key);

  /* ---------- terrain mesh (custom grid so the trail can sit exactly on it) ---------- */
  const SIZE = 560, N = lowPower ? 140 : 200, D = SIZE / N, X0 = -SIZE / 2;
  const H = new Float32Array((N + 1) * (N + 1));
  for (let j = 0; j <= N; j++) for (let i = 0; i <= N; i++) H[j * (N + 1) + i] = heightAt(X0 + i * D, X0 + j * D);
  const meshHeight = (x, z) => {
    const fi = (x - X0) / D, fj = (z - X0) / D;
    const i = Math.max(0, Math.min(N - 1, Math.floor(fi))), j = Math.max(0, Math.min(N - 1, Math.floor(fj)));
    const fx = fi - i, fz = fj - j;
    const h00 = H[j * (N + 1) + i], h10 = H[j * (N + 1) + i + 1], h01 = H[(j + 1) * (N + 1) + i], h11 = H[(j + 1) * (N + 1) + i + 1];
    return fx + fz <= 1 ? h00 + (h10 - h00) * fx + (h01 - h00) * fz : h11 + (h01 - h11) * (1 - fx) + (h10 - h11) * (1 - fz);
  };

  const pos = new Float32Array((N + 1) * (N + 1) * 3);
  const col = new Float32Array((N + 1) * (N + 1) * 3);
  const forest = C('#33463f'), forest2 = C('#45574b'), rock = C('#76625a'), rock2 = C('#9a7363'), snow = C('#f6e7da');
  for (let j = 0; j <= N; j++) for (let i = 0; i <= N; i++) {
    const k = j * (N + 1) + i, x = X0 + i * D, z = X0 + j * D, h = H[k];
    pos.set([x, h, z], k * 3);
    const hx = H[j * (N + 1) + Math.min(N, i + 1)] - H[j * (N + 1) + Math.max(0, i - 1)];
    const hz = H[Math.min(N, j + 1) * (N + 1) + i] - H[Math.max(0, j - 1) * (N + 1) + i];
    const ny = 2 * D / Math.hypot(hx, 2 * D, hz);                // normal.y (1 = flat)
    const n = fbm(x * 0.05, z * 0.05, 3);
    tmp.copy(forest).lerp(forest2, n);
    tmp.lerp(rock, smooth(14, 30, h + n * 6) * 0.9 + (1 - ny) * 0.5);
    if (h > 30) tmp.lerp(rock2, smooth(30, 40, h));
    const snowLine = 38 - n * 8;
    tmp.lerp(snow, smooth(snowLine, snowLine + 5, h) * smooth(0.45, 0.75, ny));
    col.set([tmp.r, tmp.g, tmp.b], k * 3);
  }
  const idx = [];
  for (let j = 0; j < N; j++) for (let i = 0; i < N; i++) {
    const a = j * (N + 1) + i, b = a + 1, c = a + (N + 1), d = c + 1;
    idx.push(a, c, b, b, c, d);
  }
  const terrainGeo = new THREE.BufferGeometry();
  terrainGeo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  terrainGeo.setAttribute('color', new THREE.BufferAttribute(col, 3));
  terrainGeo.setIndex(idx);
  const terrainGeoFlat = terrainGeo.toNonIndexed();
  terrainGeoFlat.computeVertexNormals();
  const terrain = new THREE.Mesh(terrainGeoFlat, new THREE.MeshStandardMaterial({
    vertexColors: true, flatShading: true, roughness: 0.95, metalness: 0,
    polygonOffset: true, polygonOffsetFactor: 1, polygonOffsetUnits: 1,
  }));
  scene.add(terrain);

  /* ---------- the trail ---------- */
  const TURNS = 1.15, A0 = 0.9;
  const spiral = (t) => {
    const r = 104 * Math.pow(1 - t, 1.1) + 1.2;
    const a = A0 + t * TURNS * Math.PI * 2 + 0.07 * Math.sin(t * 37);
    return { r, a, x: Math.cos(a) * r, z: Math.sin(a) * r };
  };
  const SAMPLES = 1400;
  const pts = [];
  for (let s = 0; s <= SAMPLES; s++) {
    const { x, z } = spiral(s / SAMPLES);
    pts.push(new THREE.Vector3(x, meshHeight(x, z) + 0.4, z));
  }
  const curve = new THREE.CatmullRomCurve3(pts, false, 'centripetal');
  curve.arcLengthDivisions = 4000;
  const SEG = lowPower ? 1400 : 2200, RAD = 5;
  const tubeGeo = new THREE.TubeGeometry(curve, SEG, 0.17, RAD, false);
  const trailDim = new THREE.Mesh(tubeGeo, new THREE.MeshBasicMaterial({ color: C('#7d8a90'), transparent: true, opacity: 0.55 }));
  const trailLit = new THREE.Mesh(tubeGeo, new THREE.MeshBasicMaterial({ color: C('#FFF0DC'), toneMapped: false }));
  trailDim.scale.setScalar(0.999); // avoid z-fighting with the lit tube
  scene.add(trailDim, trailLit);
  const PEAK = new THREE.Vector3(0, meshHeight(0, 0), 0);
  const angleAt = (u) => { const t = curve.getUtoTmapping(u); return { t, ...spiral(t) }; };

  /* ---------- sprites ---------- */
  const glowTex = (() => {
    const c = document.createElement('canvas'); c.width = c.height = 128;
    const g = c.getContext('2d'); const gr = g.createRadialGradient(64, 64, 0, 64, 64, 64);
    gr.addColorStop(0, 'rgba(255,255,255,1)'); gr.addColorStop(0.18, 'rgba(255,255,255,.7)'); gr.addColorStop(0.5, 'rgba(255,255,255,.12)'); gr.addColorStop(1, 'rgba(255,255,255,0)');
    g.fillStyle = gr; g.fillRect(0, 0, 128, 128);
    const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; return t;
  })();
  const glow = (color, size, opacity = 1) => {
    const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: glowTex, color: C(color), transparent: true, opacity, blending: THREE.AdditiveBlending, depthWrite: false, toneMapped: false }));
    s.scale.setScalar(size); return s;
  };

  /* ---------- pine forest (instanced) ---------- */
  const treeCount = lowPower ? 500 : 1100;
  const treeGeo = new THREE.ConeGeometry(1, 1, 5); treeGeo.translate(0, 0.5, 0);
  const trees = new THREE.InstancedMesh(treeGeo, new THREE.MeshStandardMaterial({ flatShading: true, roughness: 1 }), treeCount);
  const m4 = new THREE.Matrix4(), q = new THREE.Quaternion(), sc = new THREE.Vector3(), p3 = new THREE.Vector3();
  const trailNear = (x, z) => { for (let s = 0; s <= SAMPLES; s += 6) { const P = pts[s]; if ((P.x - x) ** 2 + (P.z - z) ** 2 < 9) return true; } return false; };
  let placed = 0, guard = 0;
  while (placed < treeCount && guard++ < treeCount * 12) {
    const a = Math.random() * Math.PI * 2, r = 24 + Math.random() * 150;
    const x = Math.cos(a) * r, z = Math.sin(a) * r, h = meshHeight(x, z);
    if (h > 22 + fbm(x * 0.05, z * 0.05) * 6 || trailNear(x, z)) continue;
    if (fbm(x * 0.03 + 11, z * 0.03) < 0.42) continue; // clumps, not a carpet
    const s = 0.7 + Math.random() * 0.9;
    m4.compose(p3.set(x, h - 0.2, z), q.setFromAxisAngle(sc.set(0, 1, 0), Math.random() * 6), sc.set(s, s * (2.6 + Math.random() * 1.4), s));
    trees.setMatrixAt(placed, m4);
    trees.setColorAt(placed, tmp.set('#2a3d3a').lerp(C('#3c5248'), Math.random()));
    placed++;
  }
  trees.count = placed;
  scene.add(trees);

  /* ---------- camps (beacons) ---------- */
  const camps = [...document.querySelectorAll('section.camp')].map((s) => +s.dataset.alt / MAX_ALT);
  const beacons = camps.map((u, i) => {
    if (i === 0) return null; // the lantern itself marks the trailhead
    const g = new THREE.Group();
    const { a, r } = angleAt(Math.min(u, 0.995));
    const P = curve.getPointAt(u);
    const out = r > 3 ? new THREE.Vector3(Math.cos(a), 0, Math.sin(a)) : new THREE.Vector3(1, 0, 0);
    const base = P.clone().addScaledVector(out, i === camps.length - 1 ? 0 : 1.6);
    base.y = meshHeight(base.x, base.z);
    const summit = i === camps.length - 1;
    const poleH = summit ? 5 : 3.2;
    const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.07, poleH, 5), new THREE.MeshStandardMaterial({ color: C('#efe2d2'), roughness: 0.8 }));
    pole.position.set(0, poleH / 2, 0);
    const flagGeo = new THREE.PlaneGeometry(summit ? 2.2 : 1.4, summit ? 1.3 : 0.85, 6, 1); flagGeo.translate(summit ? 1.1 : 0.7, 0, 0);
    const flag = new THREE.Mesh(flagGeo, new THREE.MeshBasicMaterial({ color: C('#F7C59F'), side: THREE.DoubleSide, toneMapped: false }));
    flag.position.set(0, poleH - (summit ? 0.65 : 0.45), 0);
    g.add(pole, flag);
    if (i > 0 && !summit) {
      const tent = new THREE.Mesh(new THREE.ConeGeometry(1.2, 1.5, 4), new THREE.MeshStandardMaterial({ color: C('#B85C3C'), flatShading: true, roughness: 0.9 }));
      tent.position.set(1.6, 0.75, 0.6); tent.rotation.y = Math.PI / 4;
      g.add(tent);
    }
    const halo = glow('#F7C59F', summit ? 9 : 6, 0.25);
    halo.position.set(0, poleH, 0);
    g.add(halo);
    g.position.copy(base);
    g.lookAt(PEAK.x, base.y, PEAK.z);
    scene.add(g);
    return { u, flag, halo, flagGeo, base: flagGeo.attributes.position.array.slice() };
  });

  /* ---------- the hiker's lantern ---------- */
  const lantern = new THREE.Group();
  const core = new THREE.Mesh(new THREE.SphereGeometry(0.28, 12, 8), new THREE.MeshBasicMaterial({ color: C('#fff6e6'), toneMapped: false }));
  const halo = glow('#FFD9A0', 7, 0.95);
  const lampLight = new THREE.PointLight(C('#ffd9a0'), 60, 45, 2);
  lantern.add(core, halo, lampLight);
  scene.add(lantern);

  /* ---------- the sea of clouds ---------- */
  const cloudTexes = [11, 23, 37, 41].map((seed) => {
    const t = new THREE.CanvasTexture(cloudCanvas(lowPower ? 256 : 384, lowPower ? 128 : 192, seed));
    t.colorSpace = THREE.SRGBColorSpace; return t;
  });
  const clouds = [];
  const cloudN = lowPower ? 34 : 56;
  for (let i = 0; i < cloudN; i++) {
    const m = new THREE.SpriteMaterial({ map: cloudTexes[i % cloudTexes.length], transparent: true, depthWrite: false, fog: true, opacity: 0.95 });
    const s = new THREE.Sprite(m);
    const far = i % 3 !== 0;                          // two rings: valleys around the massif, and a far sea
    const w = far ? 110 + Math.random() * 120 : 60 + Math.random() * 60;
    s.scale.set(w, w * 0.48, 1);
    clouds.push({ s, w, a: Math.random() * Math.PI * 2, r: far ? 190 + Math.random() * 110 : 118 + Math.random() * 50,
      y: far ? 12 + Math.random() * 14 : 16 + Math.random() * 12, v: (Math.random() * 0.5 + 0.5) * 0.006 * (Math.random() < 0.5 ? 1 : -1) });
    scene.add(s);
  }

  /* ---------- hero title: far behind the peak ---------- */
  const TITLE_D = 560;
  const titleCanvas = document.createElement('canvas');
  const titleTex = new THREE.CanvasTexture(titleCanvas);
  titleTex.colorSpace = THREE.SRGBColorSpace;
  titleTex.anisotropy = renderer.capabilities.getMaxAnisotropy();
  const title = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), new THREE.MeshBasicMaterial({ map: titleTex, transparent: true, depthWrite: false, fog: false, toneMapped: false, opacity: 0 }));
  title.visible = false;
  scene.add(title);
  let titleAspect = 4, titleLines = 0, titleReady = false;
  function drawTitle() {
    const two = innerWidth / innerHeight < 0.85;
    const lines = two ? 2 : 1;
    if (lines === titleLines && titleReady) return;
    titleLines = lines;
    const fs = 520, padX = 60, padY = 90;
    const g = titleCanvas.getContext('2d');
    const fontA = `400 ${fs}px "Instrument Serif", Georgia, serif`, fontB = `italic 400 ${fs}px "Instrument Serif", Georgia, serif`;
    g.font = fontA; const wA = g.measureText('Deeva').width; const wSp = g.measureText(' ').width;
    g.font = fontB; const wB = g.measureText('Gupta').width;
    const lineH = fs * 0.98;
    const W = Math.ceil((two ? Math.max(wA, wB) : wA + wSp + wB) + padX * 2);
    const H = Math.ceil(lineH * lines + padY * 2);
    titleCanvas.width = W; titleCanvas.height = H;
    g.clearRect(0, 0, W, H);
    g.textBaseline = 'alphabetic';
    const paintWord = (txt, font, x, baseY) => {
      g.font = font;
      const top = baseY - fs * 0.78, bot = baseY + fs * 0.12;
      const fill = g.createLinearGradient(0, top, 0, bot);
      fill.addColorStop(0, 'rgba(255,248,238,0.98)');
      fill.addColorStop(0.55, 'rgba(252,222,196,0.78)');
      fill.addColorStop(1, 'rgba(247,197,159,0.10)');
      g.shadowColor = 'rgba(255,214,170,0.45)'; g.shadowBlur = 50;
      g.fillStyle = fill; g.fillText(txt, x, baseY);
      g.shadowBlur = 0;
      const st = g.createLinearGradient(0, top, 0, bot);
      st.addColorStop(0, 'rgba(255,250,244,1)'); st.addColorStop(1, 'rgba(255,236,214,0.55)');
      g.lineWidth = 5; g.strokeStyle = st; g.strokeText(txt, x, baseY);
    };
    if (two) {
      paintWord('Deeva', fontA, (W - wA) / 2, padY + fs * 0.8);
      paintWord('Gupta', fontB, (W - wB) / 2, padY + fs * 0.8 + lineH);
    } else {
      const x0 = (W - (wA + wSp + wB)) / 2, base = padY + fs * 0.8;
      paintWord('Deeva', fontA, x0, base);
      paintWord('Gupta', fontB, x0 + wA + wSp, base);
    }
    titleAspect = W / H;
    titleTex.needsUpdate = true;
    titleReady = true;
  }
  Promise.race([
    Promise.all([document.fonts.load('400 120px "Instrument Serif"'), document.fonts.load('italic 400 120px "Instrument Serif"')]),
    new Promise((r) => setTimeout(r, 2500)),
  ]).catch(() => {}).then(() => { titleLines = 0; drawTitle(); });
  addEventListener('resize', () => { if (titleReady) drawTitle(); });

  /* ---------- sun: low on the left of the trailhead view, setting beyond the summit ---------- */
  const endA = angleAt(1).a - 0.35;
  // trailhead view: sun low on the left and a little behind the camera, so the faces we see glow
  const startCa = angleAt(0).a - 0.38;
  const fx = -Math.cos(startCa), fz = -Math.sin(startCa);          // camera forward (towards the peak)
  const sx = fz * 0.85 - fx * 0.5, sz = -fx * 0.85 - fz * 0.5;      // left of the camera, slightly behind it
  const sunAz0 = Math.atan2(sz, sx);
  let sunAz1 = endA + Math.PI + 0.25;
  while (sunAz1 - sunAz0 > Math.PI) sunAz1 -= Math.PI * 2;
  while (sunAz0 - sunAz1 > Math.PI) sunAz1 += Math.PI * 2;
  const sun = glow('#ffe2bf', 110, 0);
  scene.add(sun);

  /* ---------- sizing ---------- */
  function resize() {
    const w = canvas.clientWidth || innerWidth, h = canvas.clientHeight || innerHeight;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.fov = w < h ? 62 : 50;
    camera.updateProjectionMatrix();
  }
  addEventListener('resize', resize);
  resize();

  /* Horizontal framing per camp: push the mountain away from the text panel. */
  const FRAME_ALTS = [0, 1200, 2600, 3300, 3900, 4500];
  const FRAME_X = [0, 0, 0, 0, 0.04, 0.2];
  const frameAt = (alt) => {
    if (narrow()) return 0;
    for (let i = 0; i < FRAME_ALTS.length - 1; i++) {
      if (alt <= FRAME_ALTS[i + 1]) return lerp(FRAME_X[i], FRAME_X[i + 1], smooth(FRAME_ALTS[i], FRAME_ALTS[i + 1], alt));
    }
    return 0;
  };

  /* ---------- input ---------- */
  const mouse = { x: 0, y: 0, tx: 0, ty: 0 };
  const ease = (t) => 1 - Math.pow(1 - clamp01(t), 3);
  const ndc = new THREE.Vector3();
  if (!reduce) addEventListener('pointermove', (e) => { mouse.tx = e.clientX / innerWidth - 0.5; mouse.ty = e.clientY / innerHeight - 0.5; }, { passive: true });

  /* ---------- frame loop ---------- */
  const state = { u: readProgress().p, dawn: 0, frame: 0 };
  state.frame = frameAt(readProgress().alt);
  const camPos = new THREE.Vector3(), look = new THREE.Vector3(), camLook = new THREE.Vector3();
  const sunDir = new THREE.Vector3();
  const totalIdx = tubeGeo.index.count, perSeg = RAD * 6;
  let first = true, last = performance.now(), announced = false;

  function frame(now) {
    const dt = Math.min(0.05, (now - last) / 1000); last = now;
    const s = readProgress();
    const k = reduce ? 1 : 1 - Math.exp(-dt * 3.2);
    state.u += (s.p - state.u) * k;
    state.dawn += (s.dawn - state.dawn) * k;
    state.frame += (frameAt(s.alt) - state.frame) * k;
    mouse.x += (mouse.tx - mouse.x) * 0.05; mouse.y += (mouse.ty - mouse.y) * 0.05;
    const u = clamp01(state.u), dn = state.dawn;

    // Lantern + lit trail
    const L = curve.getPointAt(u);
    lantern.position.set(L.x, L.y + 0.9, L.z);
    trailLit.geometry.setDrawRange(0, Math.min(totalIdx, Math.ceil(u * SEG) * perSeg));
    const flicker = reduce ? 1 : 0.92 + Math.sin(now * 0.011) * 0.04 + Math.sin(now * 0.027) * 0.04;
    halo.material.opacity = 0.8 * flicker;
    lampLight.intensity = 60 * flicker;

    // Camera: trails behind and outside the lantern, looking up the mountain
    const { a, r, t } = angleAt(u);
    const hero = 1 - smooth(0, 0.16, u);              // 1 at the trailhead, fades out by the first camp
    const ca = a - 0.38 + mouse.x * 0.06;
    const cr = r + 30 + 12 * (1 - t) + 8 * smooth(0.85, 1, t) + hero * 12;
    camPos.set(Math.cos(ca) * cr, 0, Math.sin(ca) * cr);
    camPos.y = Math.max(L.y + 11 + 7 * (1 - t) - mouse.y * 2 + hero * 6, meshHeight(camPos.x, camPos.z) + 5);
    // at the trailhead, frame the peak in the middle of the screen; ease into the trail view as you climb
    look.copy(L).lerp(PEAK, lerp((narrow() ? 0.55 : 0.32) * (1 - t) + 0.1, 1, hero));
    look.y += (2 + dn * 6) * (1 - hero) - hero * (narrow() ? 26 : 31);
    if (first) camLook.copy(look); else camLook.lerp(look, reduce ? 1 : 0.2);
    camera.position.copy(camPos);
    camera.lookAt(camLook);
    const w = renderer.domElement.width, h = renderer.domElement.height;
    if (Math.abs(state.frame) > 0.002) camera.setViewOffset(w, h, state.frame * w, 0, w, h); else camera.clearViewOffset();

    // Sky, fog, light: night -> dawn
    skyUniforms.uTop.value.copy(night.top).lerp(dawn.top, dn);
    skyUniforms.uHorizon.value.copy(night.horizon).lerp(dawn.horizon, dn);
    skyUniforms.uBottom.value.copy(night.bottom).lerp(dawn.bottom, dn);
    skyUniforms.uDawn.value = dn;
    const el = lerp(0.13, 0.03, smooth(0, 1, u));
    const sunAz = lerp(sunAz0, sunAz1, smooth(0.45, 1, u));
    sunDir.set(Math.cos(sunAz) * Math.cos(el), Math.sin(el), Math.sin(sunAz) * Math.cos(el));
    skyUniforms.uSunDir.value.copy(sunDir);
    sky.position.copy(camera.position);
    scene.fog.color.copy(night.fog).lerp(dawn.fog, dn);
    scene.fog.near = lerp(80, 110, dn); scene.fog.far = lerp(560, 760, dn);
    hemi.color.copy(night.hemiSky).lerp(dawn.hemiSky, dn);
    hemi.groundColor.copy(night.hemiGround).lerp(dawn.hemiGround, dn);
    hemi.intensity = lerp(1.15, 1.05, dn);
    key.color.copy(night.key).lerp(dawn.key, dn);
    key.intensity = lerp(2.4, 2.8, dn);
    key.position.copy(sunDir).multiplyScalar(300);
    sun.position.copy(camera.position).addScaledVector(sunDir, 900);
    sun.material.opacity = lerp(0.55, 0.9, dn);

    // Beacons: lit once you've passed them
    beacons.forEach((b, i) => {
      if (!b) return;
      const lit = u >= b.u - 0.004;
      const pulse = reduce ? 1 : 0.85 + Math.sin(now * 0.003 + i) * 0.15;
      b.halo.material.opacity = (lit ? 0.7 * pulse : 0.15);
      b.halo.material.color.set(lit ? '#FFD9A0' : '#cfe1e2');
      b.flag.material.color.set(lit ? '#F7C59F' : '#7d8a90');
      if (!reduce) { // flag ripple
        const arr = b.flagGeo.attributes.position.array;
        for (let v = 0; v < arr.length; v += 3) arr[v + 2] = Math.sin(b.base[v] * 3 - now * 0.006 + i) * 0.12 * b.base[v];
        b.flagGeo.attributes.position.needsUpdate = true;
      }
    });

    // The cloud sea drifts slowly; clouds close to the camera fade so you never fly into a wall
    clouds.forEach((c) => {
      if (!reduce) c.a += c.v * dt;
      c.s.position.set(Math.cos(c.a) * c.r, c.y, Math.sin(c.a) * c.r);
      const dist = c.s.position.distanceTo(camera.position);
      c.s.material.opacity = 0.95 * smooth(c.w * 0.35, c.w * 0.9, dist);
      c.s.material.color.copy(tmp.set('#ffffff').lerp(C('#ffd8bd'), dn));
    });

    // Hero title: anchored to the view, far behind the peak; rises once the clouds part
    if (titleReady) {
      const vh = innerHeight || 1, heroY = clamp01(scrollY / vh);
      const rise = reduce ? 1 : intro.start === null ? 0 : ease((now - intro.start - 250) / 2100);
      const two = titleLines === 2;
      const yN = lerp(two ? 0.0 : -0.1, two ? 0.5 : 0.42, rise) + heroY * 0.5;
      const viewH = 2 * TITLE_D * Math.tan(THREE.MathUtils.degToRad(camera.fov) / 2);
      const wW = Math.min(viewH * camera.aspect * (two ? 0.82 : 0.78), viewH * (two ? 0.42 : 0.27) * titleAspect);
      ndc.set(0, yN, 0.5).unproject(camera).sub(camera.position).normalize();
      title.position.copy(camera.position).addScaledVector(ndc, TITLE_D);
      title.quaternion.copy(camera.quaternion);
      title.scale.set(wW, wW / titleAspect, 1);
      title.material.opacity = Math.min(1, rise * 1.8) * (1 - smooth(0.08, 0.7, heroY));
      title.visible = title.material.opacity > 0.005;
    }

    renderer.render(scene, camera);
    if (first) { first = false; canvas.style.opacity = '1'; }
    if (!announced && titleReady) { announced = true; intro.ready = true; dispatchEvent(new Event('world:ready')); }
    requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);

  // If the GPU context is lost, fall back to the CSS sky.
  canvas.addEventListener('webglcontextlost', (e) => { e.preventDefault(); root.classList.add('no-webgl'); });
}

init();

# deeva.design: a portfolio you climb

This is Deeva Gupta's portfolio, built as a 3D trek above a sea of golden-hour clouds. The page opens buried in cloud; the clouds part and her name rises from behind the peak. As you scroll, a lantern climbs a low-poly mountain made with Three.js. Along the way you pass five camps (About, Work, Side trails, Travel, Contact) and reach the summit at sunset. The rail on the left is both the altitude meter and the menu.

- `index.html`: the trek (home page)
- `astroverse.html`: the full Astroverse 2.0 case study

**Look:** "Golden hour". Teal sky (`#6FA9B5`), peach cloud light as the single accent (`#F7C59F`), terracotta rock (`#B85C3C`) and slate shadows (`#2E3B47`). Content sits on smoked glass panels. Type is Instrument Serif (headlines, italic accent words), Geist (UI and body), Geist Mono (labels) and Caveat (one or two handwritten notes).

It is a static site with no build step. It runs on GitHub Pages as it is.

## Run locally

```bash
python3 -m http.server 8000
# open http://localhost:8000
```

You have to serve the site over HTTP because ES modules don't load from `file://`.

## Edit content

| What | Where |
|---|---|
| Astroverse case study (problems, decisions, results, screens) | `astroverse.html` |
| Work cards, About boarding pass, side trails | `index.html` |
| Fridge magnets and local stories (placeholders now) | `assets/js/content.js` → `places` |
| Email, LinkedIn, case study link | `assets/js/content.js` → `links` |
| Colours and fonts | `assets/css/style.css` and `assets/css/case.css` → `:root` |
| Mountain, trail, sky, cloud sea, camera and the 3D hero title | `assets/js/scene.js` |
| Hero cloud intro and parallax | `assets/js/hero.js` (clouds are painted by `assets/js/clouds.js`) |

### Replace placeholders with real images

1. Put images in `assets/img/`.
2. Then do one of the following:
   - **Travel photos**: set `photo` in `content.js`, for example `photo: "assets/img/hampi.jpg"`.
   - **Boarding pass photo** (`.pass-photo`) and **case study screens** (`.shot` in `astroverse.html`): put an `<img>` inside the placeholder. The label hides automatically.
   - **Work card mockups** (`.wc-stage` in `index.html`): replace the `.phone` / `.browser` placeholders with an `<img>` of your real screens.
     ```html
     <div class="ph pass-photo" data-label="Your photo"><img src="assets/img/me.jpg" alt="Deeva on the Kedarkantha trail"></div>
     ```

### LinkedIn

Paste your URL into `links.linkedin` in `content.js`. The button appears at the summit only once the URL is set.

## Deploy on GitHub Pages

1. Go to the repo's **Settings → Pages**.
2. Under **Source**, choose **Deploy from a branch**, then select `main` and `/ (root)`.
3. The site goes live at `https://deevag-tech.github.io/portfolio-deeva.design/`.

### Custom domain (deeva.design)

1. In **Settings → Pages → Custom domain**, enter `deeva.design`. GitHub adds a `CNAME` file for you.
2. At your DNS provider, add the following records:
   - `A` records for `@` pointing to `185.199.108.153`, `185.199.109.153`, `185.199.110.153` and `185.199.111.153`
   - a `CNAME` record for `www` pointing to `deevag-tech.github.io`
3. Once DNS has propagated, tick **Enforce HTTPS**.

## Under the hood

- **Three.js r160**, loaded from jsDelivr through an import map.
- **Terrain**: a procedural height field (value-noise fBm with ridges) rendered with flat shading. It is coloured by height and slope: forest, then rock, then snow.
- **Trail and camera**: the trail is a spiral `CatmullRomCurve3` laid on the actual mesh surface. The lit part is a `TubeGeometry` whose draw range grows as you scroll. The camera follows the lantern along the curve.
- **Scroll mapping**: `assets/js/progress.js` maps scroll position to altitude. The HUD and the 3D camera both use it, so they always agree.
- **Sky**: a shader dome that deepens from golden hour to sunset as you climb, with a low sun, fog and a drifting sea of clouds.
- **Hero intro**: cloud curtains are painted procedurally on canvas (no image files), part on load, then drift apart and sink as you scroll. The name is a plane far behind the peak in the 3D scene, so it genuinely rises from behind the mountains.
- **Accessibility**:
  - Reduced motion is respected: no cloud intro, parallax, smoothing, flicker or drift.
  - The boarding pass flips on hover with a mouse, and on tap, Enter or Space otherwise.
  - The trail map, tabs and magnets work with the keyboard.
  - Content stays readable without WebGL, because a CSS sky is used as the fallback.

# deeva.design: a portfolio you climb

This is Deeva Gupta's portfolio, built as a 3D night trek. As you scroll, a lantern climbs a low-poly mountain made with Three.js. Along the way you pass five camps (About, Astroverse, Client work, Travel, Contact) and reach the summit at sunrise.

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
| Astroverse problems, results, phone screens | `assets/js/content.js` → `legs` |
| Fridge magnets and local stories (placeholders now) | `assets/js/content.js` → `places` |
| Email, LinkedIn, case study link | `assets/js/content.js` → `links` |
| All other copy (hero, about, client work, summit) | `index.html` |
| Colours and fonts | `assets/css/style.css` → `:root` |
| Mountain, trail, sky and camera | `assets/js/scene.js` |

### Replace placeholders with real images

1. Put images in `assets/img/`.
2. Then do one of the following:
   - **Phone screens and travel photos**: set `src` / `photo` in `content.js`, for example `photo: "assets/img/hampi.jpg"`.
   - **Portrait and client work cards** in `index.html`: put an `<img>` inside the placeholder. The label hides automatically.
     ```html
     <div class="ph portrait" data-label="…"><img src="assets/img/me.jpg" alt="Deeva on the Kedarkantha trail"></div>
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
- **Sky**: a shader dome that blends from night to dawn, with a sun glow, stars, fog and drifting clouds.
- **Accessibility**:
  - Reduced motion is respected: no smoothing, flicker or drift.
  - The trail map, tabs and magnets work with the keyboard.
  - Content stays readable without WebGL, because a CSS sky is used as the fallback.

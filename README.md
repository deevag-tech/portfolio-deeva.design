# deeva.design: a portfolio you climb

This is Deeva Gupta's portfolio, built as a climb up a real mountain. The page opens buried in cloud; the clouds part and her name rises from behind the actual peaks of a dawn photograph. As you scroll, the camera climbs towards the big peak through five camps (About, Work, Side trails, Travel, Contact), passing banks of cloud on the way, while the light warms from dawn to sunset. At the summit the peak sits on the left and the contact card on the right. The rail on the left is both the altitude meter and the menu.

- `index.html`: the trek (home page)
- `astroverse.html`: the full Astroverse 2.0 case study

**Look:** "Above the clouds". Colours come from the photos: deep alpine navy ink (`#16213B`), an alpenglow rose accent (`#BE4766`), sky blue (`#5B8FD0`) and dawn pink (`#F4ADBD`). Every surface is light frosted glass. Type is Instrument Serif (headlines, italic accent words), Geist (UI and body), Geist Mono (labels) and Caveat (one or two handwritten notes).

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
| The climb (camera path, light, passing clouds) and the hero name | `assets/js/world.js`, photo in `assets/img/` |
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

- **One photo**: a free-licence Unsplash photo of two peaks above a sea of cloud at dawn, in three sizes: `hero-sm.jpg` for phones, `hero.jpg`, and `hero-xl.jpg` (5000px), which loads once the camera starts zooming so the summit stays sharp.
- **The climb**: `world.js` maps the altitude to a camera path (`PATH`): zoom, the point of the photo it looks at, and where that point sits on screen. The camera eases towards it, like a real camera. Soft-light colour layers warm the photo from dawn to sunset, and painted cloud banks drift past between camps.
- **Name behind the peaks**: the hero shows the same photo twice. The top copy is cut down to the peaks and the cloud sea with an SVG mask in `style.css` (`.hero-scene .fg`). The name sits between the two copies, so it rises from behind the mountains. `world.js` pins the name and tagline to the photo's horizon on every screen size.
- **Hero intro**: cloud curtains are painted procedurally on canvas in the colours of the real cloud sea. They part on load, then drift apart and sink as you scroll.
- **Scroll mapping**: `assets/js/progress.js` maps scroll position to altitude for the rail.
- **Accessibility**:
  - Reduced motion is respected: no cloud intro, parallax or drift.
  - The boarding pass flips on hover with a mouse, and on tap, Enter or Space otherwise.
  - The trail map, tabs and magnets work with the keyboard.

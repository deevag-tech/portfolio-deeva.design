# deeva.design: the Trek Journal

This is Deeva Gupta's portfolio. A painted trail runs through it: her career is the route, and each section is an object picked up on the way. It reads as a product designer's portfolio first. The hero is quiet, the work cards lead with metrics, and travel gets one section near the end.

- `index.html`: the home page
- `astroverse.html`: the full Astroverse 2.0 case study

**Style guide:** Figma → "Style guide · Portfolio v3". It holds the colour variables, text styles, spacing, components and the one section pattern. `assets/css/site.css` uses the same tokens, so change a token and not a component.

- **Colour:** paper `#F5EFE3`, ink `#1E1B16`, forest `#22352B` for the two dark chapters, terracotta `#C2553A` for marks, and ochre `#D99A2B` for the single primary action in a section.
- **Type:** Fraunces for headlines and numbers, Geist for UI and body, Geist Mono for eyebrows, and Caveat for margin notes only.

It is a static site with no build step. It runs on GitHub Pages as it is.

## The page, top to bottom

| # | Section | Object | Content lives in |
|---|---|---|---|
| 1 | Hero | Painted trail with 5 stops. Tapping a stop opens a bottom sheet | `content.js` → `stops` (x / y place the pin on the art) |
| 2 | Story | Journal spread with facts and skills | `index.html` |
| 3 | Work | Postcards. The back holds problem, role and result | `content.js` → `work` |
| 4 | Astroverse 2.0 | Every hat I wore, plus the key numbers | `content.js` → `hats`, `astroStats` |
| 5 | Side trails | Souvenir shelf of websites | `content.js` → `sites` |
| 6 | Process | Five switchbacks | `content.js` → `process` |
| 7 | Off the clock | Fridge door with draggable magnets and local tips | `content.js` → `places` |
| 8 | Say hello | Send-a-postcard form and the wall | `content.js` → `postcard`, `assets/data/postcards.json` |

## Run locally

```bash
python3 -m http.server 8000
# open http://localhost:8000
```

You have to serve the site over HTTP because ES modules don't load from `file://`.

## Swap in real images

1. Put the files in `assets/img/`.
2. Set the path in `assets/js/content.js`:
   - `work[].image` for real app screens on a postcard front
   - `sites[].image` for website screenshots
   - `places[].photo` for travel photos
3. Set `sample: false` (or delete it) on any place once its tip is yours.
4. Case study screens go in `astroverse.html`: put an `<img>` inside the `.shot` placeholder.

## Postcards (the contact form)

- **By default:** "Stamp & send" opens the visitor's email app with the postcard already written, addressed to `links.email`.
- **To receive cards without an email app:** create a free form endpoint (for example on Formspree), paste its URL into `postcard.endpoint` in `content.js`, and cards arrive in your inbox.
- **The wall** only shows cards you approve. To approve one, add it to `assets/data/postcards.json` (`from`, `place`, `date`, `message`).

## LinkedIn

Paste your URL into `links.linkedin` in `content.js`. The link appears in the footer only once the URL is set.

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

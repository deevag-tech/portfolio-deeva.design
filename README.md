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
| 2 | Story | Boarding pass on grid paper. Tearing off the stub reveals the skills | `index.html` |
| 3 | Work | Postcards, front (mockup) and back (problem, role, result) side by side | `content.js` → `work` |
| 4 | How I work | Five switchbacks of my process, the hat worn at each, where it showed up in real projects, plus the toolbox | `content.js` → `steps`, `tools` |
| 5 | Side trails | Souvenir shelf of websites | `content.js` → `sites` |
| 6 | Off the clock | Fridge door with real souvenir magnets you can drag, each with a local tip | `content.js` → `places`, art in `assets/img/magnets/` |
| 7 | Say hello | Post office desk: pick a stamp, write the card, drop it in the postbox. Corkboard wall of approved cards | `content.js` → `postcard`, `assets/data/postcards.json` |
| 8 | Footer | Rubber stamps on an ink pad (Email, Case study, Postcard, Top) | `content.js` → `links` (a LinkedIn or Résumé stamp appears once `links.linkedin` / `links.resume` is set) |

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
   - `places[].image` for a souvenir magnet (a cut-out PNG/WebP with a transparent background; `w` sets its width on the fridge)
   - `places[].photo` for a travel photo on the tip card (without one, the card shows the magnet)
3. Set `sample: false` (or delete it) on any place once its tip is yours.
4. Case study screens go in `astroverse.html`: put an `<img>` inside the `.shot` placeholder.

## Postcards (the contact form)

Cards are saved to Firebase Realtime Database (`postcard.firebase` in `content.js`).

- **Every card** goes to `/inbox` with the message, name, email and chosen stamp. Read them in the Firebase console under Realtime Database → `inbox`.
- **Cards for the wall:** if the visitor ticks "Pin it to the wall", a public copy (first name and message only) goes to `/wall` with `approved: false`. To pin it, open it in the console and set `approved` to `true`. It shows up on the wall on the next page load.
- **Your own card(s)** stay in `assets/data/postcards.json` and always show first.
- **If saving fails** (offline, blocked), "Drop it in" falls back to opening the visitor's email app with the card already written.
- **Security rules:** paste `firebase.rules.json` into Realtime Database → Rules. With them, nobody can read the inbox, nobody can edit or delete cards, and the wall only returns approved cards.

## LinkedIn

Paste your URL into `links.linkedin` in `content.js` and a LinkedIn stamp appears in the footer. `links.resume` does the same for a Résumé stamp (the footer shows four stamps at most).

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

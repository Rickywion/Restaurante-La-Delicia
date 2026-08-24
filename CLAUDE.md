# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

Static site (HTML + CSS + vanilla JS, **no dependencies, no bundler**) for **La Delicia · Restaurante Cafetería** (Quito, Ecuador). Single page (`index.html`). Node is only used locally to run `build.js`; the published site needs no server-side runtime.

## Commands

There is no `package.json` / npm scripts. The only build step:

```bash
node build.js
```

Run this **every time `assets/js/menu-data.js` changes** (menu items, prices, hours, reviews, contact info). It reads that file and rewrites the corresponding chunks of `index.html` in place — nothing else touches `index.html` automatically.

Local preview (service worker requires http(s), not `file://`):

```bash
python -m http.server 8123
```

After publishing any change, bump the cache version so phones drop the stale copy:

```js
// sw.js
const CACHE_VERSION = 'ld-v5';   // increment, e.g. -> 'ld-v6'
```

There is no test suite, linter, or CI in this repo.

## Architecture: HTML is generated twice, on purpose

`assets/js/menu-data.js` is the **single source of truth** (`window.LD_CONFIG`, `LD_CATEGORIAS`, `LD_PLATOS`, `LD_RESENAS`). Two independent renderers consume it and must stay in sync conceptually:

1. **`build.js` (Node, build-time)** — writes the menu, favorites, reviews, hours, tabs, and marquee straight into `index.html` between `<!-- LD:zona --> ... <!-- /LD:zona -->` marker pairs (one zone per generator in the `zonas` object). This is what search engines and no-JS clients see; it also means the page renders correctly before any JavaScript runs.
2. **`assets/js/app.js` (browser, runtime)** — re-renders the same zones client-side on load (`hydrateConfig`, `renderHorarios`, `renderFavs`, `renderTabs`, `render`, `renderResenas`, …) so that search/filter/tab interactions work without a page reload. It takes over the DOM the build step already populated.

Practical implications:
- Never hand-edit menu/review/hours content inside `index.html` — edit `menu-data.js` and run `node build.js`, or the static HTML and the live JS render will drift apart.
- If you add a new data-driven zone, you generally need a generator in **both** `build.js`'s `zonas` object and a matching render function in `app.js`, using the same `<!-- LD:zona -->` marker convention.
- `build.js` also reads actual WebP dimensions from `assets/img/` (parsing VP8/VP8L/VP8X headers directly, no image library) to emit `width`/`height` attributes and avoid layout shift — keep this in mind if adding new images.

## Editing the menu (`assets/js/menu-data.js`)

- Each dish: `{ id, cat, nombre, desc, precio, img, tags?, destacado?, variantes?, nota? }`.
  - `precio: null` + `variantes: [{ etiqueta, precio }]` for multi-price items instead of a single number.
  - `img` is the filename in `assets/img/` **without extension**; `null` renders a styled letter-mosaic placeholder instead of a photo.
  - `destacado: true` promotes the dish into the homepage "Los favoritos" section (max 6 are shown, and only ones that also have an `img`).
  - `cat` must match an id in `LD_CATEGORIAS`, which also carries the `tono` (`'brasa'` dark / `'dia'` light) that drives the page's skin-swap between sections.
- New photos: save as `.webp` in `assets/img/` (~760px wide) under the exact name used in `img`.
- Reviews (`LD_RESENAS`): `texto` must be the reviewer's literal wording — never paraphrase and attribute it as a quote. Empty `texto` renders "Calificó con N estrellas, sin comentario" instead of inventing a quote.

## Design system (`assets/css/styles.css`)

Token-driven, two "skins" (`--bg`, `--fg`, `--accent`, etc. redefined for dark/"brasa" vs light/"dia" sections — see tokens block near the top). Fonts: Oswald (headings/prices), Lobster Two (accents), Karla (body). No CSS framework.

## Service worker (`sw.js`)

Precaches the app shell, caches menu images on demand (capped, LRU-trimmed), network-first for navigations with an offline fallback to cached `index.html`. All cache names are derived from `CACHE_VERSION` — bumping it invalidates everything from prior deploys. Every cache read/write is wrapped to fail open to the network (private browsing, full quota, etc. must never break the page).

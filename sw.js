/* Service worker de La Delicia
   Estrategia:
   - App shell (HTML/CSS/JS/iconos) → precache + "stale while revalidate"
   - Imágenes de la carta            → cache on demand, con límite
   - Todo lo externo (fuentes, mapa) → red, con cache de respaldo

   Regla de oro: si el almacenamiento falla (modo privado, cuota llena,
   navegador raro), NUNCA se rompe la página: siempre se cae a la red.

   Sube CACHE_VERSION cada vez que publiques cambios. */

const CACHE_VERSION = 'ld-v8';
const SHELL = CACHE_VERSION + '-shell';
const MEDIA = CACHE_VERSION + '-media';
const MAX_MEDIA = 80;

const PRECACHE = [
  './',
  './index.html',
  './assets/css/styles.css',
  './assets/js/app.js',
  './assets/js/menu-data.js',
  './assets/img/logo-marca-neg.webp',
  './assets/img/logo-marca-neg-sm.webp',
  './assets/img/logo-marca-neg-nav.webp',
  './assets/img/aro-1.webp',
  './assets/img/aro-2.webp',
  './assets/img/aro-3.webp',
  './assets/img/icon-192.png',
  './manifest.webmanifest'
];

/* Envoltorios a prueba de fallos ------------------------------------- */
const hasCaches = typeof caches !== 'undefined';

async function openCache(name) {
  if (!hasCaches) return null;
  try { return await caches.open(name); } catch (e) { return null; }
}
async function cacheMatch(req) {
  if (!hasCaches) return undefined;
  try { return await caches.match(req); } catch (e) { return undefined; }
}
async function cachePut(name, req, res) {
  const c = await openCache(name);
  if (!c) return;
  try { await c.put(req, res); } catch (e) { /* cuota llena: se ignora */ }
}
async function trimCache(name, max) {
  const c = await openCache(name);
  if (!c) return;
  try {
    const keys = await c.keys();
    for (let i = 0; i < keys.length - max; i++) await c.delete(keys[i]);
  } catch (e) { /* nada */ }
}

/* Ciclo de vida ------------------------------------------------------- */
self.addEventListener('install', (e) => {
  e.waitUntil((async () => {
    const c = await openCache(SHELL);
    if (c) { try { await c.addAll(PRECACHE); } catch (err) { /* seguimos igual */ } }
    await self.skipWaiting();
  })());
});

self.addEventListener('activate', (e) => {
  e.waitUntil((async () => {
    if (hasCaches) {
      try {
        const keys = await caches.keys();
        await Promise.all(
          keys.filter((k) => !k.startsWith(CACHE_VERSION)).map((k) => caches.delete(k))
        );
      } catch (err) { /* nada */ }
    }
    await self.clients.claim();
  })());
});

/* Peticiones ---------------------------------------------------------- */
self.addEventListener('fetch', (e) => {
  const req = e.request;
  if (req.method !== 'GET') return;

  let url;
  try { url = new URL(req.url); } catch (err) { return; }
  if (url.protocol !== 'http:' && url.protocol !== 'https:') return;

  const sameOrigin = url.origin === self.location.origin;

  // Navegación: red primero, cae al HTML guardado si no hay señal
  if (req.mode === 'navigate') {
    e.respondWith((async () => {
      try {
        const res = await fetch(req);
        cachePut(SHELL, './index.html', res.clone());
        return res;
      } catch (err) {
        return (await cacheMatch('./index.html')) || Response.error();
      }
    })());
    return;
  }

  // Imágenes propias: cache primero
  if (sameOrigin && /\.(webp|png|jpg|jpeg|svg|ico)$/i.test(url.pathname)) {
    e.respondWith((async () => {
      const hit = await cacheMatch(req);
      if (hit) return hit;
      const res = await fetch(req);
      cachePut(MEDIA, req, res.clone()).then(() => trimCache(MEDIA, MAX_MEDIA));
      return res;
    })());
    return;
  }

  // Shell y recursos externos: sirve del cache y revalida en segundo plano
  e.respondWith((async () => {
    const hit = await cacheMatch(req);
    const net = fetch(req).then((res) => {
      if (res && (res.ok || res.type === 'opaque')) cachePut(SHELL, req, res.clone());
      return res;
    });
    if (hit) { net.catch(() => {}); return hit; }
    return net;
  })());
});

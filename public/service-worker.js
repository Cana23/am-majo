const CACHE_NAME = 'pokeapi-static-v1';
const API_CACHE = 'pokeapi-api-v1';
const IMAGE_CACHE = 'pokeapi-images-v1';
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/manifest.json'
];

// Install -> cache static shell
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(STATIC_ASSETS))
  );
  globalThis.skipWaiting();
});

// Activate
self.addEventListener('activate', (event) => {
  event.waitUntil(globalThis.clients.claim());
});

// Helper: try network then fallback to cache
async function networkFirst(request, cacheName) {
  try {
    const res = await fetch(request);
    if (res && res.ok) {
      const cache = await caches.open(cacheName);
      cache.put(request, res.clone());
    }
    return res;
  } catch (err) {
    return new Response(null, { status: 503 });
  }
}

self.addEventListener('fetch', (event) => {
  const req = event.request;
  const url = new URL(req.url);

  if (url.hostname.includes('pokeapi.co')) {
    event.respondWith((async () => {
      const cache = await caches.open(API_CACHE);
      const cached = await cache.match(req);
      const networkPromise = fetch(req).then(resp => {
        if (resp && resp.ok) cache.put(req, resp.clone());
        return resp;
      }).catch(() => null);

      return cached || (await networkPromise) || new Response(null, { status: 503 });
    })());
    return;
  }

  if (req.destination === 'image' || url.hostname.includes('raw.githubusercontent.com')) {
    event.respondWith((async () => {
      const cache = await caches.open(IMAGE_CACHE);
      const cached = await cache.match(req);
      if (cached) return cached;
      try {
        const networkResp = await fetch(req);
        if (networkResp && networkResp.ok) {
          cache.put(req, networkResp.clone());
        }
        return networkResp;
      } catch {
        return new Response(null, { status: 503 });
      }
    })());
    return;
  }

  // Navigation
  if (req.mode === 'navigate') {
    event.respondWith(
      caches.match(req).then(resp => resp || fetch(req).catch(() => caches.match('/index.html')))
    );
    return;
  }

  // Default: try network, fallback to cache
  event.respondWith(
    fetch(req).catch(() => caches.match(req))
  );
});

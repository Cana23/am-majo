const CACHE_NAME = 'pokeapi-static-v1';
const API_CACHE = 'pokeapi-api-v1';
const IMAGE_CACHE = 'pokeapi-images-v1';
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/favicon.ico',
  '/manifest.json'
];

// Install -> cache static shell
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(STATIC_ASSETS))
  );
  self.skipWaiting();
});

// Activate
self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim());
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
    const cached = await caches.match(request);
    return cached || Response.error();
  }
}

// Fetch handler
self.addEventListener('fetch', (event) => {
  const req = event.request;
  const url = new URL(req.url);

  // 1) PokeAPI endpoints -> Stale-While-Revalidate: return cache if exists, update in background
  if (url.hostname.includes('pokeapi.co')) {
    event.respondWith((async () => {
      const cache = await caches.open(API_CACHE);
      const cached = await cache.match(req);
      const networkPromise = fetch(req).then(resp => {
        if (resp && resp.ok) cache.put(req, resp.clone());
        return resp;
      }).catch(() => null);

      // Return cached if available, otherwise wait for network, otherwise 503
      return cached || (await networkPromise) || new Response(null, { status: 503 });
    })());
    return;
  }

  // 2) Images (sprites hosted on raw.githubusercontent or raw.githubusercontentusercontent.com)
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
      } catch (err) {
        // If image missing in cache and offline, return a simple transparent 1x1 or fallback image if you have one
        return caches.match('/fallback-image.png') || new Response(null, { status: 503 });
      }
    })());
    return;
  }

  // 3) Navigation (single page) -> Cache First for shell, fallback to network
  if (req.mode === 'navigate') {
    event.respondWith(
      caches.match(req).then(resp => resp || fetch(req).catch(() => caches.match('/index.html')))
    );
    return;
  }

  // 4) Default: try network, fallback to cache
  event.respondWith(
    fetch(req).catch(() => caches.match(req))
  );
});

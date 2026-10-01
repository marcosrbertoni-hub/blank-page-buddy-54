const CACHE = 'skyline-city-v1';
const STATIC = new Set(['/','/index.html']);
self.addEventListener('install', (event) => {
  event.waitUntil(caches.open(CACHE).then((cache) => cache.addAll([...STATIC])).then(() => self.skipWaiting()));
});
self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim());
});
self.addEventListener('fetch', (event) => {
  const req = event.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  if (url.origin !== self.location.origin) return;
  const isStatic = url.pathname.startsWith('/assets/') || /\.(?:js|css|woff2?|png|jpe?g|webp|ktx2|hdr|exr|glb|gltf|bin|svg)$/.test(url.pathname);
  if (!isStatic) {
    event.respondWith(fetch(req).catch(() => caches.match(req)));
    return;
  }
  event.respondWith(
    caches.match(req).then((cached) => {
      const fresh = fetch(req).then((res) => {
        if (res.ok) caches.open(CACHE).then((cache) => cache.put(req, res.clone()));
        return res;
      }).catch(() => cached);
      return cached || fresh;
    })
  );
});

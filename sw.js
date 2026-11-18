const CACHE_NAME = 'nfclab-pwa-v1.2';
const ASSETS = [
  './',
  './index.html',
  './styles.css?v=1.2',
  './app.js?v=1.2',
  './qrcode.min.js',
  './manifest.json',
  './icon-192.png?v=1.2',
  './icon-512.png?v=1.2',
  './favicon.png?v=1.2',
  './help.html',
  './privacy.html',
  './terms.html'
];

self.addEventListener('install', (event) => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS)).catch(() => {})
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys.map((k) => {
          if (k !== CACHE_NAME) return caches.delete(k);
        })
      )
    ).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;
  const url = new URL(event.request.url);

  // Network-First for same-origin
  if (url.origin === location.origin) {
    event.respondWith(
      fetch(event.request, { cache: 'no-cache' })
        .then((response) => {
          if (response && response.status === 200) {
            const clone = response.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone));
          }
          return response;
        })
        .catch(() => caches.match(event.request))
    );
    return;
  }

  // Cache-first for external fonts/scripts
  event.respondWith(
    caches.match(event.request).then((cached) => cached || fetch(event.request))
  );
});

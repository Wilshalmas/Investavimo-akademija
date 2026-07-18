const CACHE_NAME = 'investavimo-akademija-v1';
const APP_SHELL = [
  './',
  './index.html',
  './manifest.json',
  './icon-192.png',
  './icon-512.png'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(APP_SHELL))
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  const url = event.request.url;

  // Firebase / Google API užklausas leidžiame eiti tiesiai į tinklą —
  // jų nekešuojame, kad duomenų sinchronizacija visada būtų šviežia.
  if (url.includes('firestore.googleapis.com') || url.includes('googleapis.com') || url.includes('gstatic.com/firebasejs')) {
    return;
  }

  // Programėlės failams (HTML/CSS/JS/ikonos/šriftai) — cache-first,
  // kad viskas veiktų ir be interneto ryšio.
  event.respondWith(
    caches.match(event.request).then((cached) => {
      if (cached) return cached;
      return fetch(event.request)
        .then((response) => {
          const clone = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone));
          return response;
        })
        .catch(() => cached);
    })
  );
});

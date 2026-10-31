// Muster website service worker (copied into the web build by vite.config.ts):
// the app opens offline. The shell is cached on install; every other file of
// this site (faction data, missions) is cached the first time it loads. Pages
// come from the network when there is one, so a new version shows up on the
// next visit. Data updates from GitHub are left to the app itself.
const CACHE = 'muster-pff10m';
const SHELL = ["./","./assets/index-C1xs5jsw.js","./assets/missions-D6F9UfWg.js","./assets/icon-BPqAN67T.svg","./assets/index-52C6NajV.css","./manifest.webmanifest","./apple-touch-icon.png","./icon-512.png"];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches
      .open(CACHE)
      .then((c) => c.addAll(SHELL))
      .then(() => self.skipWaiting()),
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.filter((k) => k.startsWith('muster-') && k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim()),
  );
});

self.addEventListener('fetch', (event) => {
  const req = event.request;
  if (req.method !== 'GET' || new URL(req.url).origin !== self.location.origin) return;
  if (req.mode === 'navigate') {
    // The page itself: the newest from the network, else the cached one.
    event.respondWith(
      fetch(req)
        .then((res) => {
          const copy = res.clone();
          void caches.open(CACHE).then((c) => c.put('./', copy));
          return res;
        })
        .catch(() => caches.match('./', { ignoreVary: true }).then((r) => r ?? Response.error())),
    );
    return;
  }
  // Built files never change under the same name: the cache first.
  event.respondWith(
    caches.match(req, { ignoreVary: true }).then(
      (hit) =>
        hit ??
        fetch(req).then((res) => {
          if (res.ok) {
            const copy = res.clone();
            void caches.open(CACHE).then((c) => c.put(req, copy));
          }
          return res;
        }),
    ),
  );
});

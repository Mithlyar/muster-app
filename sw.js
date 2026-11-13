// Muster website service worker (copied into the web build by vite.config.ts):
// the app opens offline. The shell is cached on install; every other file of
// this site (faction data, missions) is cached the first time it loads. Pages
// come from the network when there is one, so a new version shows up on the
// next visit. Data updates from GitHub are left to the app itself.
const CACHE = 'muster-vn8y4l';
const SHELL = ["./","./assets/index-D-3tD6yB.js","./assets/missions-BJp0hpJC.js","./assets/almendra-sc-latin-400-normal-T-ss3kUA.woff2","./assets/audiowide-latin-400-normal-6GFCX7ni.woff2","./assets/bebas-neue-latin-400-normal-9mHNbWWO.woff2","./assets/black-ops-one-latin-400-normal-CYRH0z_U.woff2","./assets/cinzel-decorative-latin-700-normal-CnX1aK6s.woff2","./assets/cinzel-latin-700-normal-Dkw14w9r.woff2","./assets/cormorant-sc-latin-700-normal-DbXnBeCd.woff2","./assets/eagle-lake-latin-400-normal-BnCxE_R4.woff2","./assets/exo-2-latin-700-normal-OoACPC18.woff2","./assets/germania-one-latin-400-normal-BqJ7AzEa.woff2","./assets/grenze-gotisch-latin-700-normal-CWOqrlF-.woff2","./assets/grenze-latin-700-normal-BhnHXdwr.woff2","./assets/icon-BPqAN67T.svg","./assets/im-fell-english-sc-latin-400-normal-CW_nhHm4.woff2","./assets/index-FXlSBzAx.css","./assets/italiana-latin-400-normal-CRZrqGQm.woff2","./assets/macondo-swash-caps-latin-400-normal-CS70t-eN.woff2","./assets/marcellus-sc-latin-400-normal-BVWXGf4k.woff2","./assets/metal-mania-latin-400-normal-BU9ZNXhH.woff2","./assets/metamorphous-latin-400-normal-B8QJBOqa.woff2","./assets/michroma-latin-400-normal-4gS0VCia.woff2","./assets/new-rocker-latin-400-normal-Dx1Qcjw-.woff2","./assets/orbitron-latin-700-normal-4jsRXGGJ.woff2","./assets/oswald-latin-600-normal-plFmSr5g.woff2","./assets/pirata-one-latin-400-normal-C8jLWNfm.woff2","./assets/russo-one-latin-400-normal-BfOuQF9V.woff2","./assets/saira-stencil-one-latin-400-normal-CaP09Fmm.woff2","./assets/share-tech-mono-latin-400-normal-CCqdbj5z.woff2","./assets/special-elite-latin-400-normal-YjDd9tmf.woff2","./assets/syncopate-latin-700-normal-D6Fv_luC.woff2","./assets/teko-latin-600-normal-Cj5MAY47.woff2","./assets/uncial-antiqua-latin-400-normal-DPalS0aZ.woff2","./assets/unifrakturcook-latin-700-normal-Hw99rxGi.woff2","./manifest.webmanifest","./apple-touch-icon.png","./icon-512.png"];

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
  // Only the app's own page is kept as the start page (not the privacy policy).
  if (req.mode === 'navigate' && !new URL(req.url).pathname.endsWith('.html')) {
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

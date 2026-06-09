/**
 * Cache-busting service worker — v2
 * Forces ALL old caches to be deleted on activation.
 * This resolves stale-bundle errors like "PROMOstyles is not defined".
 */

// On install: skip waiting immediately so this SW activates right away
self.addEventListener('install', (event) => {
  self.skipWaiting();
});

// On activate: delete ALL old caches, then claim all clients
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          console.log('[SW] Deleting old cache:', cacheName);
          return caches.delete(cacheName);
        })
      );
    }).then(() => {
      console.log('[SW] All old caches cleared. Claiming clients.');
      return self.clients.claim();
    })
  );
});

// Fetch: always go to network (no caching of JS/HTML to prevent stale bundles)
self.addEventListener('fetch', (event) => {
  // Let the browser handle all requests normally
  event.respondWith(fetch(event.request));
});

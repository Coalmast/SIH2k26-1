const CACHE_NAME = 'maptiler-cache-v1';

self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(clients.claim());
});

self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);
  
  // Only cache requests to the Maptiler API
  if (url.hostname === 'api.maptiler.com') {
    event.respondWith(
      caches.match(event.request).then((response) => {
        // Return from cache if available
        if (response) {
          return response;
        }

        // Otherwise fetch from network, cache it, and return
        return fetch(event.request).then((networkResponse) => {
          // Check if we received a valid response
          if (!networkResponse || networkResponse.status !== 200 || (networkResponse.type !== 'basic' && networkResponse.type !== 'cors')) {
            return networkResponse;
          }

          // Clone the response because it's a stream that can only be consumed once
          const responseToCache = networkResponse.clone();

          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseToCache);
          });

          return networkResponse;
        });
      })
    );
  }
});

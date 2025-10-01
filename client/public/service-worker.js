// Service Worker for Educasheer
const CACHE_NAME = 'educasheer-cache-v1759240857'; // Increment cache version to force refresh
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/images/logo.png',
  '/src/main.jsx',
  '/src/index.css',
];

// Cache version timestamp for cache busting
const CACHE_TIMESTAMP = new Date().getTime();

// Install event - cache static assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('Opened cache');
        return cache.addAll(STATIC_ASSETS);
      })
  );
});

// Activate event - clean up old caches and claim clients immediately
self.addEventListener('activate', (event) => {
  const cacheWhitelist = [CACHE_NAME];

  // Delete old caches
  const cacheCleanup = caches.keys().then((cacheNames) => {
    return Promise.all(
      cacheNames.map((cacheName) => {
        if (cacheWhitelist.indexOf(cacheName) === -1) {
          console.log('Service Worker: Deleting old cache:', cacheName);
          return caches.delete(cacheName);
        }
      })
    );
  });

  // Claim clients to ensure updates take effect immediately
  const clientClaim = self.clients.claim().then(() => {
    console.log('Service Worker: Claimed all clients');

    // Notify all clients about the update
    self.clients.matchAll().then(clients => {
      clients.forEach(client => {
        client.postMessage({
          type: 'CACHE_UPDATED',
          timestamp: CACHE_TIMESTAMP
        });
      });
    });
  });

  event.waitUntil(Promise.all([cacheCleanup, clientClaim]));
});

// Fetch event - use network-first strategy for better cache control
self.addEventListener('fetch', (event) => {
  // Skip cross-origin requests
  if (!event.request.url.startsWith(self.location.origin)) {
    return;
  }

  // For HTML pages, always fetch from network
  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request)
        .catch(() => {
          return caches.match('/index.html');
        })
    );
    return;
  }

  // For API requests, always use network-first
  if (event.request.url.includes('/api/')) {
    event.respondWith(
      fetch(event.request.clone())
        .catch(() => {
          return caches.match(event.request);
        })
    );
    return;
  }

  // For CSS/JS files, use network-first strategy with cache fallback
  if (event.request.url.match(/\.(css|js)$/)) {
    event.respondWith(
      fetch(event.request.clone())
        .then(response => {
          // Cache the updated resource for future use
          const responseToCache = response.clone();
          caches.open(CACHE_NAME).then(cache => {
            cache.put(event.request, responseToCache);
          });
          return response;
        })
        .catch(() => {
          // If network fails, try to return from cache
          return caches.match(event.request);
        })
    );
    return;
  }

  // For other assets (images, fonts, etc.), use cache-first strategy
  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        // Cache hit - return response
        if (response) {
          return response;
        }

        // Clone the request
        const fetchRequest = event.request.clone();

        return fetch(fetchRequest).then(
          (response) => {
            // Check if valid response
            if(!response || response.status !== 200 || response.type !== 'basic') {
              return response;
            }

            // Clone the response
            const responseToCache = response.clone();

            caches.open(CACHE_NAME)
              .then((cache) => {
                cache.put(event.request, responseToCache);
              });

            return response;
          }
        );
      })
  );
});

// Add message handler for manual cache clearing
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'CLEAR_CACHE') {
    console.log('Service Worker: Clearing cache by request');

    // Clear all caches
    event.waitUntil(
      caches.keys().then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            console.log('Service Worker: Deleting cache:', cacheName);
            return caches.delete(cacheName);
          })
        ).then(() => {
          console.log('Service Worker: All caches cleared');
          // Notify the client that sent the message
          if (event.source) {
            event.source.postMessage({
              type: 'CACHE_CLEARED',
              timestamp: new Date().getTime()
            });
          }
        });
      })
    );
  }
});
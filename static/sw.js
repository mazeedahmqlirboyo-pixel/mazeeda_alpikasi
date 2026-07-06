const CACHE_NAME = 'mazeeda-cache-v1.7';
const ASSETS_TO_CACHE = [
  '/',
  '/manifest.json',
  '/logo.png',
  '/sw.js'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS_TO_CACHE);
    })
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cache) => {
          if (cache !== CACHE_NAME) {
            return caches.delete(cache);
          }
        })
      );
    })
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;

  const url = new URL(event.request.url);
  // Ignore Vite dev server files, APIs, and non-http protocols
  if (
    !url.protocol.startsWith('http') ||
    url.pathname.includes('@vite') ||
    url.pathname.includes('@fs') ||
    url.pathname.includes('node_modules') ||
    url.pathname.includes('.svelte-kit') ||
    url.pathname.startsWith('/api') ||
    url.pathname.endsWith('env.js') || // Bypas caching untuk env.js agar perubahan API Key langsung terbaca
    url.search.includes('v=') // Ignore vite cache busting queries
  ) {
    return;
  }

  const isHtml = event.request.mode === 'navigate' || 
                 (event.request.headers.get('accept') && 
                  event.request.headers.get('accept').includes('text/html'));

  if (isHtml) {
    // Network-First for HTML pages to ensure updates are instantly visible online
    event.respondWith(
      fetch(event.request)
        .then((response) => {
          const copy = response.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, copy);
          });
          return response;
        })
        .catch(() => {
          return caches.match(event.request);
        })
    );
  } else {
    // Cache-First for static assets (images, CSS, JS, etc.)
    event.respondWith(
      caches.match(event.request).then((cachedResponse) => {
        if (cachedResponse) {
          return cachedResponse;
        }
        return fetch(event.request);
      })
    );
  }
});


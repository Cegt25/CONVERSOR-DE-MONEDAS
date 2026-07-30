const CACHE_NAME = 'conversor-v1';
const urlsToCache = [
  './',
  './index.html',
  './style.css',
  './script.js'
];

// Instala el Service Worker y guarda los archivos estáticos
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(urlsToCache))
  );
});

// Intercepta las peticiones de red
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => response || fetch(event.request))
  );
});
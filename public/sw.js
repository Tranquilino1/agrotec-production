const CACHE_NAME = 'agronomo-ge-cache-v3.2.0';
const OFFLINE_URL = '/offline.html';

const STATIC_ASSETS = [
  '/offline.html',
  '/manifest.json',
  '/favicon.svg',
  '/icons/app-icon-3d.png',
  '/icons/scanner-3d.png',
  '/icons/shield-3d.png',
  '/qr-apk.svg'
];

// 1. Instalación: forzar actualización inmediata
self.addEventListener('install', (event) => {
  console.log('[Agrónomo PWA] Instalando Service Worker v3.2.0...');
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(STATIC_ASSETS);
    })
  );
});

// 2. Activación: purgar inmediatamente cualquier caché antiguo
self.addEventListener('activate', (event) => {
  console.log('[Agrónomo PWA] Activando Service Worker v3.2.0 y purgando cachés anteriores...');
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            console.log('[Agrónomo PWA] Purgando caché obsoleto:', key);
            return caches.delete(key);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// 3. Estrategia de Fetch: Network-First para HTML y chunks
self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;

  const url = new URL(event.request.url);

  // APIs y _next chunks dinámicos: DIRECTO A LA RED SIEMPRE (cero caché obsoleto)
  if (url.pathname.startsWith('/api/') || url.pathname.startsWith('/_next/')) {
    event.respondWith(fetch(event.request));
    return;
  }

  // Navegación (Páginas HTML): Network-First estricto con fallback a offline.html
  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request)
        .then((response) => {
          return response;
        })
        .catch(() => {
          return caches.match(OFFLINE_URL);
        })
    );
    return;
  }

  // Activos estáticos cacheados (imágenes, iconos): Stale-While-Revalidate
  event.respondWith(
    caches.match(event.request).then((cached) => {
      const networked = fetch(event.request).then((res) => {
        if (res && res.status === 200) {
          const clone = res.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone));
        }
        return res;
      }).catch(() => cached);

      return cached || networked;
    })
  );
});

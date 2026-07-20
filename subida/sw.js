// IAtorpes Service Worker · v2
// Estrategia: SIEMPRE intenta la red primero (así los cambios se ven al instante).
// Solo usa la caché como respaldo si no hay conexión.
const CACHE = 'iatorpes-v2';

self.addEventListener('install', e => {
  // Activa la nueva versión inmediatamente, sin esperar
  self.skipWaiting();
});

self.addEventListener('activate', e => {
  e.waitUntil(
    (async () => {
      // Borra cachés antiguas de versiones anteriores
      const nombres = await caches.keys();
      await Promise.all(nombres.map(n => n !== CACHE ? caches.delete(n) : null));
      await clients.claim();
    })()
  );
});

self.addEventListener('fetch', e => {
  // Solo peticiones GET
  if (e.request.method !== 'GET') return;
  e.respondWith(
    fetch(e.request)
      .then(resp => {
        // Guarda una copia fresca en caché para uso sin conexión
        const copia = resp.clone();
        caches.open(CACHE).then(c => c.put(e.request, copia)).catch(() => {});
        return resp;
      })
      .catch(() => caches.match(e.request)) // Sin red: usa lo cacheado
  );
});

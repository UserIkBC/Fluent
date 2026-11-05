/* Service worker: guarda la app para que abra rápido y funcione sin conexión.
   Todo el contenido va incluido en la app. */
const CACHE = 'fluent-v4.0.2';
const SHELL = ['./', 'index.html', 'styles.css', 'config.js', 'app.js', 'mine.js', 'sync.js', 'data.js', 'manifest.webmanifest',
  'content/vocab_general.js', 'content/vocab_general2.js', 'content/vocab_general3.js', 'content/vocab_expr.js', 'content/vocab_expr2.js',
  'content/vocab_legal.js', 'content/vocab_legal2.js', 'content/grammar.js', 'content/grammar2.js', 'content/situations.js', 'content/situations2.js',
  'content/readings.js', 'content/readings2.js', 'content/pronunciation.js',
  'icons/icon-192.png', 'icons/icon-512.png', 'icons/apple-touch-icon.png'];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(SHELL)).then(() => self.skipWaiting()));
});
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener('fetch', e => {
  const url = new URL(e.request.url);
  if (e.request.method !== 'GET' || url.origin !== location.origin) return; // APIs externas: directo a la red
  // red primero (para recibir siempre la última versión) y copia local si no hay conexión
  e.respondWith(
    fetch(e.request).then(r => {
      const copy = r.clone();
      caches.open(CACHE).then(c => c.put(e.request, copy));
      return r;
    }).catch(() => caches.match(e.request).then(m => m || caches.match('index.html')))
  );
});

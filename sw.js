/* Service worker: guarda la app para que abra rápido y funcione sin conexión.
   Todo el contenido va incluido en la app. */
const CACHE = 'fluent-v6.0.2';
const SHELL = ["./", "index.html", "styles.css?v=6.0.2", "manifest.webmanifest", "icons/icon-192.png", "icons/icon-512.png", "icons/apple-touch-icon.png", "config.js?v=6.0.2", "content/vocab_general.js?v=6.0.2", "content/vocab_general2.js?v=6.0.2", "content/vocab_general3.js?v=6.0.2", "content/vocab_expr.js?v=6.0.2", "content/vocab_expr2.js?v=6.0.2", "content/phrasal3.js?v=6.0.2", "content/chunks.js?v=6.0.2", "content/slang.js?v=6.0.2", "content/vocab_legal.js?v=6.0.2", "content/vocab_legal2.js?v=6.0.2", "content/grammar.js?v=6.0.2", "content/grammar2.js?v=6.0.2", "content/situations.js?v=6.0.2", "content/situations2.js?v=6.0.2", "content/readings.js?v=6.0.2", "content/readings2.js?v=6.0.2", "content/pronunciation.js?v=6.0.2", "content/native.js?v=6.0.2", "content/story.js?v=6.0.2", "content/dialogues.js?v=6.0.2", "content/connected.js?v=6.0.2", "content/freq.js?v=6.0.2", "content/books/index.js?v=6.0.2", "content/texts/index.js?v=6.0.2", "content/texts/t01.js?v=6.0.2", "content/texts/t02.js?v=6.0.2", "content/texts/t03.js?v=6.0.2", "content/texts/t04.js?v=6.0.2", "content/texts/t05.js?v=6.0.2", "content/texts/t06.js?v=6.0.2", "content/monthly.js?v=6.0.2", "core.js?v=6.0.2", "reader.js?v=6.0.2", "library.js?v=6.0.2", "exercises.js?v=6.0.2", "vocab.js?v=6.0.2", "listen.js?v=6.0.2", "home.js?v=6.0.2", "mine.js?v=6.0.2", "sync.js?v=6.0.2"];

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

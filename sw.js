/* Service worker: guarda la app para que abra rápido y funcione sin conexión.
   Todo el contenido va incluido en la app. */
const CACHE = 'fluent-v6.1.0';
const SHELL = ["./", "index.html", "styles.css?v=6.1.0", "manifest.webmanifest", "icons/icon-192.png", "icons/icon-512.png", "icons/apple-touch-icon.png", "config.js?v=6.1.0", "content/vocab_general.js?v=6.1.0", "content/vocab_general2.js?v=6.1.0", "content/vocab_general3.js?v=6.1.0", "content/vocab_expr.js?v=6.1.0", "content/vocab_expr2.js?v=6.1.0", "content/phrasal3.js?v=6.1.0", "content/chunks.js?v=6.1.0", "content/slang.js?v=6.1.0", "content/vocab_legal.js?v=6.1.0", "content/vocab_legal2.js?v=6.1.0", "content/grammar.js?v=6.1.0", "content/grammar2.js?v=6.1.0", "content/situations.js?v=6.1.0", "content/situations2.js?v=6.1.0", "content/pronunciation.js?v=6.1.0", "content/native.js?v=6.1.0", "content/dialogues.js?v=6.1.0", "content/connected.js?v=6.1.0", "content/freq.js?v=6.1.0", "content/books/index.js?v=6.1.0", "content/texts/index.js?v=6.1.0", "content/texts/t06.js", "content/texts/t07.js", "content/texts/t08.js", "content/texts/t09.js", "content/texts/d20261107-1031.js", "content/texts/d20261108-0214.js", "content/texts/d20261109-0218.js", "content/monthly.js?v=6.1.0", "core.js?v=6.1.0", "reader.js?v=6.1.0", "library.js?v=6.1.0", "exercises.js?v=6.1.0", "vocab.js?v=6.1.0", "listen.js?v=6.1.0", "home.js?v=6.1.0", "mine.js?v=6.1.0", "learn.js?v=6.1.0", "sync.js?v=6.1.0"];

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

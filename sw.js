/* Service worker: guarda la app para que abra rápido y funcione sin conexión.
   Todo el contenido va incluido en la app. */
const CACHE = 'fluent-v7.0.2';
const SHELL = ["./", "index.html", "styles.css?v=7.0.0", "manifest.webmanifest", "icons/icon-192.png", "icons/icon-512.png", "icons/apple-touch-icon.png", "fonts/newsreader.woff2", "fonts/newsreader-italic.woff2", "fonts/franklin.woff2", "config.js?v=7.0.0", "content/vocab_general.js?v=7.0.0", "content/vocab_general2.js?v=7.0.0", "content/vocab_general3.js?v=7.0.0", "content/vocab_expr.js?v=7.0.0", "content/vocab_expr2.js?v=7.0.0", "content/phrasal3.js?v=7.0.0", "content/chunks.js?v=7.0.0", "content/slang.js?v=7.0.0", "content/vocab_legal.js?v=7.0.0", "content/vocab_legal2.js?v=7.0.0", "content/grammar.js?v=7.0.0", "content/grammar2.js?v=7.0.0", "content/situations.js?v=7.0.0", "content/situations2.js?v=7.0.0", "content/pronunciation.js?v=7.0.0", "content/native.js?v=7.0.0", "content/dialogues.js?v=7.0.0", "content/connected.js?v=7.0.0", "content/freq.js?v=7.0.0", "content/books/index.js?v=7.0.0", "content/texts/index.js?v=7.0.0", "content/texts/s00.js", "content/texts/s01.js", "content/texts/s02.js", "content/texts/s03.js", "content/texts/s04.js", "content/texts/s05.js", "content/texts/s06.js", "content/texts/s07.js", "content/texts/s08.js", "content/monthly.js?v=7.0.0", "core.js?v=7.0.0", "reader.js?v=7.0.0", "library.js?v=7.0.0", "exercises.js?v=7.0.0", "vocab.js?v=7.0.0", "listen.js?v=7.0.0", "home.js?v=7.0.0", "mine.js?v=7.0.0", "learn.js?v=7.0.0", "practice.js?v=7.0.0", "words.js?v=7.0.0", "sync.js?v=7.0.0"];

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

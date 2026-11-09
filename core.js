'use strict';
/* ==========================================================
   Fluent 6 · núcleo: utilidades, estado, tema, voz, biblioteca,
   repetición espaciada (FSRS), estadísticas y navegación
   ========================================================== */
const VERSION = '6.1.0';

/* ---------- utilidades ---------- */
const $ = (s, el = document) => el.querySelector(s);
const $$ = (s, el = document) => Array.from(el.querySelectorAll(s));
const esc = s => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const stripTags = s => { const d = document.createElement('div'); d.innerHTML = s || ''; return d.textContent || ''; };
const shuffle = a => { a = a.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };
const pick = a => a[Math.floor(Math.random() * a.length)];
const uid = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
const norm = s => String(s || '').toLowerCase().replace(/[’‘]/g, "'").replace(/[^a-z0-9' -]/g, '').replace(/\s+/g, ' ').trim();
const dayKey = (d = new Date()) => d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
const DAY = 86400000;
const fmtMin = sec => { const m = Math.round((sec || 0) / 60); return m < 60 ? m + ' min' : Math.floor(m / 60) + ' h ' + (m % 60) + ' min'; };
const fmtNum = n => Number(n || 0).toLocaleString('es-ES');
function dailyPick(arr, salt) { if (!arr || !arr.length) return null; const k = dayKey() + salt; let h = 0; for (const c of k) h = (h * 31 + c.charCodeAt(0)) >>> 0; return arr[h % arr.length]; }

const store = {
  get(k, d) { try { const v = localStorage.getItem('fl_' + k); return v == null ? d : JSON.parse(v); } catch (e) { return d; } },
  set(k, v) { try { localStorage.setItem('fl_' + k, JSON.stringify(v)); return true; } catch (e) { toast('El móvil no tiene más espacio para la app. Borra textos guardados.'); return false; } }
};

/* almacén grande en IndexedDB (artículos descargados, libros) */
const BIG = {
  db: null,
  open() { return this.db ? Promise.resolve(this.db) : new Promise((ok, ko) => { try { const r = indexedDB.open('fluent-big', 1); r.onupgradeneeded = () => r.result.createObjectStore('kv'); r.onsuccess = () => { this.db = r.result; ok(r.result); }; r.onerror = () => ko(r.error); } catch (e) { ko(e); } }); },
  async get(k) { try { const db = await this.open(); return await new Promise(ok => { const q = db.transaction('kv').objectStore('kv').get(k); q.onsuccess = () => ok(q.result); q.onerror = () => ok(undefined); }); } catch (e) { return undefined; } },
  async set(k, v) { try { const db = await this.open(); return await new Promise(ok => { const t = db.transaction('kv', 'readwrite'); t.objectStore('kv').put(v, k); t.oncomplete = () => ok(true); t.onerror = () => ok(false); }); } catch (e) { return false; } }
};

/* ---------- estado ---------- */
const DEFAULT_SETTINGS = {
  newPerDay: 10, newNotesPerDay: 20, voice: '', rate: 1, theme: 'auto', readSize: 19, name: 'Iker', accent: 'blue', font: 'serif', uiSize: 'normal',
  cardFront: 'en', autoplay: true, exLen: 10, showEs: true, startTab: 'home', guardianKey: '', autoKnown: true,
  mix: { word: true, phrasal: true, idiom: true, convo: true, colloc: true, linker: true, false: true, legal: true, business: true, chunk: true, slang: true, ukus: true },
  topics: ['news', 'opinion', 'law', 'business', 'sport', 'culture', 'science', 'society'], sessionLen: 'long'
};
let S = Object.assign({}, DEFAULT_SETTINGS, store.get('settings', {}));
S.mix = Object.assign({}, DEFAULT_SETTINGS.mix, S.mix || {});
if (S.rate < 0.5 || S.rate > 1.6) S.rate = 1;
let NOTES = store.get('notes', []);
let HISTORY = store.get('history', []);
let STATS = store.get('stats', {});
let LEARN = store.get('learn', {});
let GPROG = store.get('gprog', {});
const saveSettings = () => { S._upd = Date.now(); store.set('settings', S); };
const saveNotes = () => { store.set('notes', NOTES); POOL = []; updateBadge(); };
const saveStats = () => store.set('stats', STATS);
const saveLearn = () => { store.set('learn', LEARN); updateBadge(); };

const CATS = {
  word: 'Vocabulario', vocab: 'Vocabulario', phrasal: 'Phrasal verb', idiom: 'Expresión', convo: 'Para conversar', colloc: 'Collocation',
  linker: 'Conector', false: 'Falso amigo', legal: 'Inglés jurídico', business: 'Negocios', chunk: 'Chunk', slang: 'Slang', ukus: 'UK / US', grammar: 'Gramática', other: 'Otro'
};
function today() { const k = dayKey(); if (!STATS[k]) STATS[k] = { art: 0, sec: 0, ex: 0, ok: 0, rev: 0, saved: 0 }; return STATS[k]; }
function bump(field, n = 1) { const t = today(); t[field] = (t[field] || 0) + n; saveStats(); renderStreak(); }

/* ---------- tema ---------- */
const ACCENTS = { blue: ['#0e4a7e', '#e3ecf5', '#7fb3e6', '#1b2c3e'], green: ['#1d6b45', '#e1f0e7', '#6fcf97', '#173126'], red: ['#a32b2b', '#f6e3e3', '#f08b8b', '#3a1d1d'], purple: ['#5b3a9e', '#ece5f6', '#b69cf0', '#2a2140'], teal: ['#0f6e6a', '#dff1f0', '#5fd0c8', '#14302e'], orange: ['#b8541b', '#f8e8df', '#f5a26b', '#3a2418'], ink: ['#1f2937', '#e5e7eb', '#d1d5db', '#2a313b'] };
function applyTheme() {
  const r = document.documentElement;
  if (S.theme === 'auto') r.removeAttribute('data-theme'); else r.setAttribute('data-theme', S.theme);
  r.style.setProperty('--read-size', S.readSize + 'px');
  const dark = S.theme === 'dark' || (S.theme === 'auto' && window.matchMedia && matchMedia('(prefers-color-scheme: dark)').matches);
  const a = ACCENTS[S.accent] || ACCENTS.blue;
  r.style.setProperty('--accent', dark ? a[2] : a[0]); r.style.setProperty('--accent-soft', dark ? a[3] : a[1]);
  if (S.font === 'sans') r.style.setProperty('--serif', 'var(--sans)'); else r.style.removeProperty('--serif');
  document.body.style.fontSize = { small: '15px', normal: '16px', large: '17.5px' }[S.uiSize] || '16px';
  document.body.classList.toggle('hide-es', !S.showEs);
}
if (window.matchMedia) matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => applyTheme());

/* ---------- avisos y panel inferior ---------- */
let toastT;
function toast(msg) { const t = $('#toast'); if (!t) return; t.textContent = msg; t.classList.add('show'); clearTimeout(toastT); toastT = setTimeout(() => t.classList.remove('show'), 2300); }
let SHEET_T = null;
function openSheet(html, onMount) {
  clearTimeout(SHEET_T);
  $('#sheetBody').innerHTML = html;
  const b = $('#backdrop'), s = $('#sheet');
  b.classList.remove('hidden'); s.classList.remove('hidden');
  requestAnimationFrame(() => { b.classList.add('show'); s.classList.add('show'); });
  s.scrollTop = 0;
  if (onMount) onMount($('#sheetBody'));
}
function closeSheet() {
  const b = $('#backdrop'), s = $('#sheet');
  b.classList.remove('show'); s.classList.remove('show');
  clearTimeout(SHEET_T);
  SHEET_T = setTimeout(() => { b.classList.add('hidden'); s.classList.add('hidden'); $('#sheetBody').innerHTML = ''; }, 230);
  $$('.w.sel').forEach(x => x.classList.remove('sel'));
}
const sheetOpen = () => !$('#sheet').classList.contains('hidden') && $('#sheet').classList.contains('show');

/* ---------- iconos ---------- */
const svg = (p, f) => `<svg viewBox="0 0 24 24" ${f ? 'fill="currentColor"' : 'fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"'}>${p}</svg>`;
const IC = {
  book: svg('<path d="M4 5a2 2 0 012-2h13v16H6a2 2 0 00-2 2z"/><path d="M4 19V5M19 17H6a2 2 0 00-2 2"/>'),
  news: svg('<rect x="3" y="4" width="18" height="16" rx="2"/><path d="M7 8h10M7 12h10M7 16h6"/>'),
  globe: svg('<circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3a14 14 0 010 18M12 3a14 14 0 000 18"/>'),
  link: svg('<path d="M10 14a4 4 0 005.7 0l3-3a4 4 0 00-5.7-5.7l-1 1"/><path d="M14 10a4 4 0 00-5.7 0l-3 3a4 4 0 005.7 5.7l1-1"/>'),
  chat: svg('<path d="M4 5h16v11H9l-5 4z"/><path d="M8 9h8M8 12h5"/>'),
  scale: svg('<path d="M12 3v18M7 21h10M5 7h14M5 7l-3 7a3 3 0 006 0zM19 7l-3 7a3 3 0 006 0z"/>'),
  speak: svg('<path d="M11 5L6 9H2v6h4l5 4V5z"/><path d="M15.5 8.5a5 5 0 010 7M19 5a10 10 0 010 14"/>'),
  play: svg('<path d="M7 4.5v15l13-7.5z"/>', 1),
  pause: svg('<rect x="6" y="4.5" width="4" height="15" rx="1"/><rect x="14" y="4.5" width="4" height="15" rx="1"/>', 1),
  stop: svg('<rect x="6" y="6" width="12" height="12" rx="2"/>', 1),
  prev: svg('<path d="M18 5v14l-9-7zM6 5v14"/>'),
  next: svg('<path d="M6 5v14l9-7zM18 5v14"/>'),
  back10: svg('<path d="M3 12a9 9 0 109-9 9 9 0 00-6.4 2.6L3 8"/><path d="M3 3v5h5"/>'),
  search: svg('<circle cx="11" cy="11" r="7"/><path d="M20 20l-3.5-3.5"/>'),
  plus: svg('<path d="M12 5v14M5 12h14"/>'),
  check: svg('<path d="M5 12l5 5L20 7"/>'),
  bookmark: svg('<path d="M6 3h12v18l-6-4-6 4z"/>'),
  ext: svg('<path d="M14 4h6v6M20 4l-9 9M18 14v5a1 1 0 01-1 1H5a1 1 0 01-1-1V7a1 1 0 011-1h5"/>'),
  cards: svg('<rect x="3" y="6" width="14" height="14" rx="2"/><path d="M7 3h12a2 2 0 012 2v12"/>'),
  quiz: svg('<circle cx="12" cy="12" r="9"/><path d="M9.5 9a2.5 2.5 0 015 .5c0 2-2.5 2-2.5 4M12 17h.01"/>'),
  gap: svg('<path d="M3 12h4M17 12h4"/><rect x="9" y="8" width="6" height="8" rx="1.5"/>'),
  pen: svg('<path d="M4 20h4L19 9l-4-4L4 16z"/>'),
  ear: svg('<path d="M3 14v-2a9 9 0 0118 0v2"/><rect x="3" y="14" width="4" height="6" rx="1.5"/><rect x="17" y="14" width="4" height="6" rx="1.5"/>'),
  order: svg('<path d="M4 6h10M4 12h16M4 18h7"/>'),
  spark: svg('<path d="M12 3l2 6 6 2-6 2-2 6-2-6-6-2 6-2z"/>'),
  flag: svg('<path d="M5 21V4M5 4h11l-2 4 2 4H5"/>'),
  trash: svg('<path d="M4 7h16M9 7V4h6v3M6 7l1 13h10l1-13"/>'),
  podcast: svg('<circle cx="12" cy="11" r="3"/><path d="M12 14v7M7.5 16.5a7 7 0 119 0"/>'),
  video: svg('<rect x="3" y="5" width="14" height="14" rx="2"/><path d="M17 10l4-2v8l-4-2"/>'),
  shuffle: svg('<path d="M16 3h5v5M4 20L21 3M21 16v5h-5M15 15l6 6M4 4l5 5"/>'),
  clock: svg('<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>'),
  gear: svg('<circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.6 1.6 0 00.3 1.8l.1.1a2 2 0 11-2.8 2.8l-.1-.1a1.6 1.6 0 00-1.8-.3 1.6 1.6 0 00-1 1.5V21a2 2 0 11-4 0v-.1a1.6 1.6 0 00-1-1.5 1.6 1.6 0 00-1.8.3l-.1.1a2 2 0 11-2.8-2.8l.1-.1a1.6 1.6 0 00.3-1.8 1.6 1.6 0 00-1.5-1H3a2 2 0 110-4h.1a1.6 1.6 0 001.5-1 1.6 1.6 0 00-.3-1.8l-.1-.1a2 2 0 112.8-2.8l.1.1a1.6 1.6 0 001.8.3H9a1.6 1.6 0 001-1.5V3a2 2 0 114 0v.1a1.6 1.6 0 001 1.5 1.6 1.6 0 001.8-.3l.1-.1a2 2 0 112.8 2.8l-.1.1a1.6 1.6 0 00-.3 1.8V9a1.6 1.6 0 001.5 1H21a2 2 0 110 4h-.1a1.6 1.6 0 00-1.5 1z"/>'),
  chart: svg('<path d="M4 20V10M10 20V4M16 20v-7M22 20H2"/>')
};
const ico = (k, s = 16) => (IC[k] || '').replace('<svg', `<svg width="${s}" height="${s}"`);

/* ==========================================================
   VOZ · lee por frases para que no se corte en el iPhone
   ========================================================== */
const TTS = {
  voices: [], all: [], token: 0, timer: null, startedAt: 0, cur: null,
  ok: 'speechSynthesis' in window,
  load() { if (!this.ok) return; this.all = speechSynthesis.getVoices(); this.voices = this.all.filter(x => /^en/i.test(x.lang)); },
  rank(v) { let s = 0; if (/en[-_]GB/i.test(v.lang)) s += 10; if (/premium/i.test(v.name)) s += 6; if (/enhanced|natural|neural/i.test(v.name)) s += 4; if (/google/i.test(v.name)) s += 2; if (/compact|eloquence|novelty|bad news|bells|boing|bubbles|cellos|whisper|zarvox|trinoids|organ|jester|superstar|wobble|albert|fred|junior|ralph|bahh/i.test(v.name)) s -= 30; return s; },
  voice() {
    if (!this.voices.length) this.load();
    const chosen = this.voices.find(v => v.name === S.voice);
    if (chosen) return chosen;
    return this.voices.slice().sort((a, b) => this.rank(b) - this.rank(a))[0] || null;
  },
  esVoice() { if (!this.all.length) this.load(); return this.all.find(v => /^es[-_]ES/i.test(v.lang)) || this.all.find(v => /^es/i.test(v.lang)) || null; },
  pair() {
    if (!this.voices.length) this.load();
    const good = this.voices.filter(v => this.rank(v) > -10).sort((a, b) => this.rank(b) - this.rank(a));
    const male = /daniel|arthur|oliver|george|james|rishi|aaron|tom|alex|male|guy|ryan|thomas/i, female = /kate|serena|martha|stephanie|samantha|karen|moira|tessa|fiona|victoria|female|susan|catherine|libby|sonia|sarah|emily/i;
    const m = good.find(v => male.test(v.name)) || good[0] || null;
    const f = good.find(v => female.test(v.name) && v !== m) || good.find(v => v !== m) || m;
    return { m, f };
  },
  chunks(text) {
    const t = String(text || '').replace(/\s+/g, ' ').trim(); if (!t) return [];
    const sents = t.match(/[^.!?;]+(?:[.!?;]+["”’)\]]*|$)/g) || [t];
    const out = []; let cur = '';
    sents.forEach(s => {
      s = s.trim(); if (!s) return;
      if (s.length > 230) { s.split(/(?<=,)\s+/).forEach(p => { if ((cur + ' ' + p).length > 230 && cur) { out.push(cur); cur = p; } else cur = (cur ? cur + ' ' : '') + p; }); return; }
      if ((cur + ' ' + s).length > 230 && cur) { out.push(cur); cur = s; } else cur = (cur ? cur + ' ' : '') + s;
    });
    if (cur) out.push(cur);
    return out;
  },
  speak(text, opts = {}) {
    if (!this.ok) { toast('Este navegador no tiene voz'); return; }
    const tok = ++this.token; clearTimeout(this.timer);
    const parts = this.chunks(text); if (!parts.length) { if (opts.onend) opts.onend(); return; }
    const busy = speechSynthesis.speaking || speechSynthesis.pending;
    speechSynthesis.cancel();
    let i = 0;
    const v = opts.voice || (opts.es ? this.esVoice() : this.voice());
    const rate = opts.rate || S.rate || 1;
    const next = () => {
      if (tok !== this.token) return;
      if (i >= parts.length) { this.track(); if (opts.onend) opts.onend(); return; }
      const u = new SpeechSynthesisUtterance(parts[i]); this.cur = u;
      const idx = i++;
      if (v) u.voice = v;
      u.lang = v ? v.lang : (opts.es ? 'es-ES' : 'en-GB');
      u.rate = rate; if (opts.pitch) u.pitch = opts.pitch;
      let done = false;
      const fin = () => { if (done) return; done = true; clearTimeout(this.timer); next(); };
      u.onstart = () => { if (!this.startedAt) this.startedAt = Date.now(); if (opts.onchunk) opts.onchunk(idx, parts.length); };
      u.onend = fin;
      u.onerror = () => { if (tok === this.token) fin(); };
      this.timer = setTimeout(fin, parts[idx].length * 95 / rate + 5000);
      speechSynthesis.speak(u);
    };
    if (busy) setTimeout(next, 120); else next();
  },
  track() { if (this.startedAt) { const s = (Date.now() - this.startedAt) / 1000; this.startedAt = 0; if (s > 0 && s < 1800) { const t = today(); t.lsec = (t.lsec || 0) + s; saveStats(); } } },
  stop() { this.token++; clearTimeout(this.timer); if (this.ok) speechSynthesis.cancel(); this.track(); }
};
if (TTS.ok) { TTS.load(); speechSynthesis.onvoiceschanged = () => TTS.load(); }

/* ==========================================================
   BIBLIOTECA DE VOCABULARIO
   ========================================================== */
const LIB_CATS = {
  word: { name: 'Vocabulario', desc: 'Palabras del día a día por temas', ic: 'book' },
  phrasal: { name: 'Phrasal verbs', desc: 'Los que más usan los nativos', ic: 'link' },
  idiom: { name: 'Expresiones e idioms', desc: 'Frases hechas para sonar natural', ic: 'spark' },
  convo: { name: 'Para conversar', desc: 'Muletillas y frases de la vida real', ic: 'chat' },
  chunk: { name: 'Chunks', desc: 'Bloques de frase que usan los nativos', ic: 'link' },
  colloc: { name: 'Collocations', desc: 'Palabras que van juntas', ic: 'link' },
  linker: { name: 'Conectores', desc: 'Para enlazar ideas', ic: 'order' },
  false: { name: 'Falsos amigos', desc: 'Parecen españolas y no lo son', ic: 'quiz' },
  slang: { name: 'Slang y coloquial', desc: 'Lo que oirás en la calle y en series', ic: 'spark' },
  ukus: { name: 'Británico vs americano', desc: 'Palabras que cambian a cada lado', ic: 'globe' },
  legal: { name: 'Inglés jurídico', desc: 'Vocabulario por áreas del Derecho', ic: 'scale' },
  business: { name: 'Inglés de negocios', desc: 'Finanzas, reuniones y correos', ic: 'chat' }
};
const TOPICS = {
  daily: 'Día a día y casa', people: 'Personas y carácter', feelings: 'Sentimientos', opinion: 'Opiniones', work: 'Trabajo',
  money: 'Dinero', travel: 'Viajes', food: 'Comida', health: 'Salud y deporte', tech: 'Tecnología', society: 'Sociedad',
  time: 'Tiempo y frecuencia', describing: 'Adjetivos útiles',
  basics: 'Profesión y sistema', contracts: 'Contratos', litigation: 'Litigios', courtroom: 'En el tribunal', corporate: 'Mercantil y societario',
  criminal: 'Penal', employment: 'Laboral', 'data-ip': 'Datos y propiedad intelectual', office: 'Inglés en el despacho',
  home: 'Casa', clothes: 'Ropa y aspecto', city: 'Ciudad y transporte', nature: 'Naturaleza y tiempo', family: 'Familia y relaciones', education: 'Estudios',
  shopping: 'Compras', media: 'Ocio y medios', body: 'Cuerpo y salud', politics: 'Política', environment: 'Medio ambiente', science: 'Ciencia',
  advanced: 'Palabras cultas', cooking: 'Cocina', sport: 'Deporte', verbs: 'Verbos del día a día', quantity: 'Cantidades',
  property: 'Inmobiliario', family_law: 'Familia', tax: 'Fiscal', public: 'Público y UE', dispute: 'Procedimiento y arbitraje', 'finance-law': 'Bancario y M&A', practice: 'La profesión',
  start: 'Empezar y ganar tiempo', plans: 'Planes', react: 'Reaccionar', request: 'Pedir cosas', bye: 'Despedirse', uk: 'Británico', us: 'Americano',
  general: 'General', grammar: 'Gramática', spelling: 'Ortografía', finance: 'Finanzas', meetings: 'Reuniones y negociación', emails: 'Correos', strategy: 'Estrategia y empresa'
};
const LIB = (window.VOCAB || []).map(v => { const id = v.c + ':' + v.t; return { id, term: v.t, cat: v.c, top: v.top, def: v.d, es: v.es, ex: v.ex, lib: true, srs: LEARN[id] || null }; });
const LIB_BY_ID = Object.fromEntries(LIB.map(x => [x.id, x]));

/* ==========================================================
   REPETICIÓN ESPACIADA · FSRS (el algoritmo moderno de Anki)
   ========================================================== */
const FW = [0.4872, 1.4003, 3.7145, 13.8206, 5.1618, 1.2298, 0.8975, 0.031, 1.6474, 0.1367, 1.0461, 2.1072, 0.0793, 0.3246, 1.587, 0.2272, 2.8755];
const clampD = d => Math.min(10, Math.max(1, d));
function newSrs() { return { due: Date.now(), ivl: 0, reps: 0, lapses: 0 }; }
function srsFix(s) {
  if (s.S == null && s.reps > 0) { s.S = Math.max(1, s.ivl || 1); s.D = clampD(11 - ((s.ef || 2.5) - 1.3) * 5); s.last = (s.due || Date.now()) - (s.ivl || 1) * DAY; }
  if (s.S != null && s.D == null) s.D = 5;
  return s;
}
function srsPreview(s, g) { const c = JSON.parse(JSON.stringify(s || newSrs())); fsrsApply(c, g); return c; }
function fsrsApply(s, g) {
  srsFix(s);
  const r = g + 1; const now = Date.now();
  const elapsed = s.last ? Math.max(0, (now - s.last) / DAY) : 0;
  if (!s.S) {
    s.S = FW[r - 1]; s.D = clampD(FW[4] - (r - 3) * FW[5]);
  } else {
    const R = Math.pow(1 + 19 / 81 * elapsed / s.S, -0.5);
    const D0e = FW[4] - (4 - 3) * FW[5];
    s.D = clampD(FW[7] * D0e + (1 - FW[7]) * (s.D - FW[6] * (r - 3)));
    if (r === 1) s.S = Math.min(s.S, FW[11] * Math.pow(s.D, -FW[12]) * (Math.pow(s.S + 1, FW[13]) - 1) * Math.exp(FW[14] * (1 - R)));
    else s.S = s.S * (Math.exp(FW[8]) * (11 - s.D) * Math.pow(s.S, -FW[9]) * (Math.exp(FW[10] * (1 - R)) - 1) * (r === 2 ? FW[15] : 1) * (r === 4 ? FW[16] : 1) + 1);
  }
  s.S = Math.max(0.1, s.S);
  s.last = now; s.upd = now;
  if (r === 1) { s.lapses = (s.lapses || 0) + 1; s.reps = 0; s.ivl = 0; s.due = now + 10 * 60000; }
  else { s.reps = (s.reps || 0) + 1; s.ivl = Math.max(1, Math.round(s.S)); const d = new Date(); d.setHours(4, 0, 0, 0); s.due = d.getTime() + s.ivl * DAY; }
  return s;
}
const ivlLabel = s => s.ivl === 0 ? '10 min' : s.ivl < 30 ? s.ivl + ' d' : s.ivl < 365 ? Math.round(s.ivl / 30) + ' mes' : (s.ivl / 365).toFixed(1) + ' años';
function startLearning(x, known) {
  if (x.srs) return;
  const s = newSrs(); s.added = Date.now(); s.upd = Date.now();
  if (known) { s.reps = 3; s.ivl = 60; s.S = 60; s.D = 3; s.last = Date.now(); s.due = Date.now() + 60 * DAY; s.known = true; }
  LEARN[x.id] = s; x.srs = s;
}
function itemStatus(x) { if (!x.srs) return 'new'; const s = srsFix(x.srs); if (s.known || (s.S || 0) >= 21) return 'done'; return 'learning'; }
const STATUS_TAG = { new: '', learning: '<span class="tag">Aprendiendo</span>', done: '<span class="tag good">Dominada</span>' };
function isNew(n) { return !n.srs || ((n.srs.reps || 0) === 0 && !(n.srs.lapses || 0)); }
function dueNotes() {
  const now = Date.now();
  NOTES.forEach(n => { if (!n.srs) n.srs = newSrs(); });
  const old = NOTES.filter(n => !isNew(n) && n.srs.due <= now);
  const left = Math.max(0, (S.newNotesPerDay || 20) - (today().newSeen || 0));
  const fresh = NOTES.filter(n => isNew(n)).sort((a, b) => (a.created || 0) - (b.created || 0)).slice(0, left);
  return old.concat(fresh);
}
function grade(n, g) {
  if (!n.srs) { if (n.lib) startLearning(n); else n.srs = newSrs(); }
  if (!n.lib && isNew(n)) { const t = today(); t.newSeen = (t.newSeen || 0) + 1; saveStats(); }
  fsrsApply(n.srs, g);
  if (n.lib) saveLearn(); else saveNotes();
}
function dueCards() { const now = Date.now(); return dueNotes().concat(LIB.filter(x => x.srs && x.srs.due <= now)); }
function updateBadge() { const n = dueCards().length; const b = $('#dueBadge'); if (!b) return; b.textContent = n > 99 ? '99+' : n; b.classList.toggle('hidden', !n); }

/* ---------- frases de toda la app (para ejemplos y ejercicios) ---------- */
let POOL = [];
function splitSentences(text) {
  const res = []; const re = /[^.!?]+(?:[.!?]+["”’)]*|$)/g; let m;
  while ((m = re.exec(text))) { if (!m[0].trim()) { if (re.lastIndex === m.index) re.lastIndex++; continue; } res.push({ s: m[0].trim(), a: m.index, b: m.index + m[0].length }); }
  return res;
}
function buildPool() {
  const p = [];
  const add = (s, src, id, legal) => { const n = s.split(/\s+/).length; if (n >= 5 && n <= 32) p.push({ s, src, id, legal: !!legal }); };
  LIB.forEach(x => x.ex && x.ex.split(' / ').forEach(e => add(e, LIB_CATS[x.cat] ? LIB_CATS[x.cat].name : '', x.id, x.cat === 'legal')));
  allTexts().forEach(t => t.body.forEach(par => { if (/^[A-Z][a-z]+: /.test(par)) par = par.replace(/^[^:]{1,20}: /, ''); splitSentences(par).forEach(se => add(se.s, t.title, t.id, t.topic === 'law')); }));
  (window.SITUATIONS || []).forEach(si => { si.phrases.forEach(ph => add(ph[0], si.title, si.id, si.legal)); (si.dialogue || []).forEach(d => add(d[1], si.title, si.id, si.legal)); });
  (window.DIALOGUES || []).forEach(d => d.lines.forEach(l => add(l[1], d.title, d.id)));
  NOTES.forEach(n => n.ex && add(n.ex, 'Mis palabras', n.id));
  POOL = p.filter(x => /^[A-Z“"‘'(]/.test(x.s));
}
function sentencePool(srcId) {
  if (srcId && typeof TEXT_POOLS !== 'undefined' && TEXT_POOLS[srcId] && TEXT_POOLS[srcId].length) return TEXT_POOLS[srcId];
  if (!POOL.length) buildPool();
  let p = srcId === 'legal' ? POOL.filter(x => x.legal) : srcId ? POOL.filter(x => x.id === srcId) : POOL;
  if (!p.length) p = POOL;
  return p;
}

/* ---------- estadísticas y racha ---------- */
function isActive(d) { return d && ((d.art || 0) >= 1 || (d.ex || 0) >= 10 || (d.rev || 0) >= 10 || (d.newLib || 0) >= 5 || (d.sec || 0) >= 600 || (d.lsec || 0) >= 300); }
function streak() {
  let n = 0; const d = new Date();
  if (!isActive(STATS[dayKey(d)])) d.setDate(d.getDate() - 1);
  while (isActive(STATS[dayKey(d)])) { n++; d.setDate(d.getDate() - 1); }
  return n;
}
function renderStreak() { const el = $('#streakNum'); if (el) el.textContent = streak(); }

/* ==========================================================
   NAVEGACIÓN
   ========================================================== */
const ROUTES = {};          // nombre -> { fn, tab, title }
const STOPPERS = [];        // funciones que paran audio o temporizadores al cambiar de pantalla
const TABS = ['home', 'read', 'listen', 'words', 'mine'];
function addRoute(name, fn, tab, title) { ROUTES[name] = { fn, tab, title }; }
let currentTab = 'home';
function go(hash) { if (location.hash === hash) route(); else location.hash = hash; }
window.addEventListener('hashchange', route);
function route() {
  STOPPERS.forEach(f => { try { f(); } catch (e) {} });
  TTS.stop();
  $('#view').onclick = null;
  if ($('#sheet') && !$('#sheet').classList.contains('hidden')) closeSheet();
  const h = decodeURIComponent(location.hash.slice(1) || S.startTab || 'home');
  const [view, ...rest] = h.split('/');
  const arg = rest.join('/');
  const r = ROUTES[view] || ROUTES.home;
  const isRoot = TABS.includes(view);
  if (isRoot && view !== 'home' && typeof HOME_SESSION !== 'undefined') HOME_SESSION = false;
  $('#backBtn').classList.toggle('hidden', isRoot);
  currentTab = r.tab || currentTab;
  $$('.tab').forEach(t => t.classList.toggle('active', t.dataset.tab === currentTab));
  $('#brandSub').textContent = r.title || '';
  window.scrollTo(0, 0);
  try { r.fn(arg); }
  catch (e) { console.error(e); $('#view').innerHTML = `<div class="empty">Algo ha fallado al abrir esta pantalla.<br><span class="meta">${esc(e.message)}</span></div><a class="btn block" href="#home">Volver a Hoy</a>`; }
}
function hubTile(href, ic, title, desc, extra = '') { return `<a class="mode" href="${href}"><div class="ico">${IC[ic] || IC.book}</div><b>${title}</b><span>${desc}</span>${extra}</a>`; }
function emptyBox(msg, href, label) { return `<div class="card pad empty">${msg}</div>${href ? `<a class="btn primary block" href="${href}">${label}</a>` : ''}`; }

window.addEventListener('DOMContentLoaded', () => {
  $$('.tab').forEach(t => t.addEventListener('click', () => go('#' + t.dataset.tab)));
  $('#backBtn').addEventListener('click', () => { if (history.length > 1) history.back(); else go('#' + currentTab); });
  $('#settingsBtn').addEventListener('click', () => go('#settings'));
  $('#streakPill').addEventListener('click', () => go('#progress'));
  $('#backdrop').addEventListener('click', closeSheet);
  applyTheme(); renderStreak(); updateBadge();
  route();
});
if ('serviceWorker' in navigator && location.protocol.startsWith('http')) window.addEventListener('load', () => navigator.serviceWorker.register('sw.js').catch(() => {}));

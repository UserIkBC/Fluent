'use strict';
/* ==========================================================
   Fluent · app para aprender inglés (PWA)
   Datos guardados en el propio dispositivo (localStorage).
   ========================================================== */

const VERSION = '5.0.0';

/* ---------- utilidades ---------- */
const $ = (s, el = document) => el.querySelector(s);
const $$ = (s, el = document) => Array.from(el.querySelectorAll(s));
const esc = s => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const stripTags = s => { const d = document.createElement('div'); d.innerHTML = s || ''; return d.textContent || ''; };
const shuffle = a => { a = a.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };
const pick = a => a[Math.floor(Math.random() * a.length)];
const uid = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
const norm = s => String(s || '').toLowerCase().replace(/[’‘]/g, "'").replace(/[^a-z0-9' -]/g, '').replace(/\s+/g, ' ').trim();
const dayKey = (d = new Date()) => d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
const DAY = 86400000;

const store = {
  get(k, d) { try { const v = localStorage.getItem('fl_' + k); return v == null ? d : JSON.parse(v); } catch (e) { return d; } },
  set(k, v) { try { localStorage.setItem('fl_' + k, JSON.stringify(v)); return true; } catch (e) { toast('No queda espacio. Borra artículos guardados o haz copia y limpia.'); return false; } }
};

/* ---------- estado ---------- */
const DEFAULT_SETTINGS = {
  newPerDay: 10, newNotesPerDay: 15, voice: '', rate: 0.95, theme: 'auto', readSize: 19, goalExercises: 20, goalReviews: 15,
  mix: { word: true, phrasal: true, idiom: true, convo: true, colloc: true, linker: true, false: true, legal: true, business: true, chunk: true, slang: true, ukus: true },
  aiModel: 'claude-haiku-5-5', name: 'Iker', accent: 'blue', font: 'serif', uiSize: 'normal', cardFront: 'en', autoplay: true, exLen: 10, showEs: true, startTab: 'home',
  home: { plan: true, words: true, exp: true, legal: true, sugg: true }
};
let S = Object.assign({}, DEFAULT_SETTINGS, store.get('settings', {}));
S.mix = Object.assign({}, DEFAULT_SETTINGS.mix, S.mix || {});
S.home = Object.assign({}, DEFAULT_SETTINGS.home, S.home || {});
let NOTES = store.get('notes', []);
let HISTORY = store.get('history', []);      // lecturas terminadas
let STATS = store.get('stats', {});          // por día

const saveSettings = () => { S._upd = Date.now(); store.set('settings', S); };
const saveNotes = () => { store.set('notes', NOTES); updateBadge(); };
const saveStats = () => store.set('stats', STATS);

const CATS = {
  word: 'Vocabulario', vocab: 'Vocabulario', phrasal: 'Phrasal verb', idiom: 'Expresión', convo: 'Para conversar', colloc: 'Collocation',
  linker: 'Conector', false: 'Falso amigo', legal: 'Inglés jurídico', business: 'Negocios', chunk: 'Chunk', slang: 'Slang', ukus: 'UK / US', grammar: 'Gramática', other: 'Otro'
};

function today() { const k = dayKey(); if (!STATS[k]) STATS[k] = { art: 0, sec: 0, ex: 0, ok: 0, rev: 0, saved: 0, spoke: 0 }; return STATS[k]; }
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

/* ---------- toast ---------- */
let toastT;
function toast(msg) { const t = $('#toast'); t.textContent = msg; t.classList.add('show'); clearTimeout(toastT); toastT = setTimeout(() => t.classList.remove('show'), 2300); }

/* ---------- sheet (panel inferior) ---------- */
function openSheet(html, onMount) {
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
  setTimeout(() => { b.classList.add('hidden'); s.classList.add('hidden'); $('#sheetBody').innerHTML = ''; }, 230);
  $$('.w.sel').forEach(x => x.classList.remove('sel'));
}

/* ---------- iconos ---------- */
const IC = {
  globe: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3a14 14 0 010 18M12 3a14 14 0 000 18"/></svg>',
  flag: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 21V4M5 4h11l-2 4 2 4H5"/></svg>',
  book: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 5a2 2 0 012-2h13v16H6a2 2 0 00-2 2z"/><path d="M4 19V5M19 17H6a2 2 0 00-2 2"/></svg>',
  link: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M10 14a4 4 0 005.7 0l3-3a4 4 0 00-5.7-5.7l-1 1"/><path d="M14 10a4 4 0 00-5.7 0l-3 3a4 4 0 005.7 5.7l1-1"/></svg>',
  chat: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"><path d="M4 5h16v11H9l-5 4z"/><path d="M8 9h8M8 12h5" stroke-linecap="round"/></svg>',
  scale: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3v18M7 21h10M5 7h14M5 7l-3 7a3 3 0 006 0zM19 7l-3 7a3 3 0 006 0z"/></svg>',
  speak: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 5L6 9H2v6h4l5 4V5z"/><path d="M15.5 8.5a5 5 0 010 7M19 5a10 10 0 010 14"/></svg>',
  play: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M7 4.5v15l13-7.5z"/></svg>',
  pause: '<svg viewBox="0 0 24 24" fill="currentColor"><rect x="6" y="4.5" width="4" height="15" rx="1"/><rect x="14" y="4.5" width="4" height="15" rx="1"/></svg>',
  stop: '<svg viewBox="0 0 24 24" fill="currentColor"><rect x="6" y="6" width="12" height="12" rx="2"/></svg>',
  search: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><circle cx="11" cy="11" r="7"/><path d="M20 20l-3.5-3.5"/></svg>',
  plus: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"><path d="M12 5v14M5 12h14"/></svg>',
  bookmark: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"><path d="M6 3h12v18l-6-4-6 4z"/></svg>',
  bookmarkOn: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M6 3h12v18l-6-4-6 4z"/></svg>',
  ext: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 4h6v6M20 4l-9 9M18 14v5a1 1 0 01-1 1H5a1 1 0 01-1-1V7a1 1 0 011-1h5"/></svg>',
  cards: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"><rect x="3" y="6" width="14" height="14" rx="2"/><path d="M7 3h12a2 2 0 012 2v12"/></svg>',
  quiz: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="12" cy="12" r="9"/><path d="M9.5 9a2.5 2.5 0 015 .5c0 2-2.5 2-2.5 4M12 17h.01"/></svg>',
  gap: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M3 12h4M17 12h4"/><rect x="9" y="8" width="6" height="8" rx="1.5"/></svg>',
  pen: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 20h4L19 9l-4-4L4 16z"/></svg>',
  ear: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M3 14v-2a9 9 0 0118 0v2"/><rect x="3" y="14" width="4" height="6" rx="1.5"/><rect x="17" y="14" width="4" height="6" rx="1.5"/></svg>',
  order: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M4 6h10M4 12h16M4 18h7"/></svg>',
  mic: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><rect x="9" y="3" width="6" height="11" rx="3"/><path d="M5 11a7 7 0 0014 0M12 18v3"/></svg>',
  spark: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"><path d="M12 3l2 6 6 2-6 2-2 6-2-6-6-2 6-2z"/></svg>',
  trash: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M4 7h16M9 7V4h6v3M6 7l1 13h10l1-13"/></svg>'
};

/* ==========================================================
   VOZ (síntesis británica)
   ========================================================== */
const TTS = {
  voices: [], all: [], playing: 0, startedAt: 0,
  load() {
    if (!('speechSynthesis' in window)) return;
    this.all = speechSynthesis.getVoices();
    this.voices = this.all.filter(x => /^en/i.test(x.lang));
  },
  voice() {
    if (!this.voices.length) this.load();
    return this.voices.find(v => v.name === S.voice) || this.voices.find(v => /en[-_]GB/i.test(v.lang) && /premium|enhanced|natural/i.test(v.name))
      || this.voices.find(v => /en[-_]GB/i.test(v.lang)) || this.voices[0] || null;
  },
  esVoice() { if (!this.all.length) this.load(); return this.all.find(v => /^es[-_]ES/i.test(v.lang)) || this.all.find(v => /^es/i.test(v.lang)) || null; },
  /* dos voces distintas para diálogos (hombre / mujer si es posible) */
  pair() {
    if (!this.voices.length) this.load();
    const gb = this.voices.filter(v => /en[-_]GB/i.test(v.lang)); const pool = gb.length >= 2 ? gb : this.voices;
    const male = /daniel|arthur|oliver|george|james|rishi|aaron|fred|tom|alex|male|guy/i, female = /kate|serena|martha|stephanie|samantha|karen|moira|tessa|fiona|victoria|female|susan|catherine|libby|sonia/i;
    const m = pool.find(v => male.test(v.name)) || pool[0] || null;
    const f = pool.find(v => female.test(v.name) && v !== m) || pool.find(v => v !== m) || m;
    return { m, f };
  },
  speak(text, opts = {}) {
    if (!('speechSynthesis' in window)) { toast('Este navegador no tiene voz'); return null; }
    if (!opts.queue) speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(text);
    const v = opts.voice || (opts.es ? this.esVoice() : this.voice()); if (v) u.voice = v;
    u.lang = v ? v.lang : (opts.es ? 'es-ES' : 'en-GB');
    u.rate = opts.rate || S.rate;
    if (opts.pitch) u.pitch = opts.pitch;
    u.onstart = () => { this.startedAt = Date.now(); };
    u.onend = () => { this.track(); if (opts.onend) opts.onend(); };
    u.onerror = () => { this.track(); if (opts.onerror) opts.onerror(); };
    speechSynthesis.speak(u);
    return u;
  },
  track() { if (this.startedAt) { const s = (Date.now() - this.startedAt) / 1000; this.startedAt = 0; if (s > 0 && s < 120) { const t = today(); t.lsec = (t.lsec || 0) + s; saveStats(); } } },
  stop() { if ('speechSynthesis' in window) speechSynthesis.cancel(); }
};
if ('speechSynthesis' in window) { TTS.load(); speechSynthesis.onvoiceschanged = () => TTS.load(); }

/* ==========================================================
   BIBLIOTECA
   ========================================================== */
const LIB_CATS = {
  word: { name: 'Vocabulario', desc: 'Palabras del día a día por temas', ic: 'book' },
  phrasal: { name: 'Phrasal verbs', desc: 'Los más usados por los nativos', ic: 'link' },
  idiom: { name: 'Expresiones e idioms', desc: 'Frases hechas para sonar natural', ic: 'spark' },
  convo: { name: 'Para conversar', desc: 'Muletillas y frases de la vida real', ic: 'chat' },
  colloc: { name: 'Collocations', desc: 'Palabras que van juntas', ic: 'link' },
  linker: { name: 'Conectores', desc: 'Para enlazar ideas al hablar y escribir', ic: 'order' },
  false: { name: 'Falsos amigos', desc: 'Palabras que parecen españolas y no lo son', ic: 'quiz' },
  legal: { name: 'Inglés jurídico', desc: 'Vocabulario por áreas del Derecho', ic: 'scale' },
  business: { name: 'Inglés de negocios', desc: 'Finanzas, reuniones, negociación y correos', ic: 'chat' },
  chunk: { name: 'Chunks', desc: 'Bloques de frase para hablar con fluidez', ic: 'link' },
  slang: { name: 'Slang y coloquial', desc: 'Lo que oirás en la calle, en series y entre amigos', ic: 'spark' },
  ukus: { name: 'Británico vs americano', desc: 'Palabras que cambian a cada lado del Atlántico', ic: 'chat' }
};
const TOPICS = {
  daily: 'Día a día y casa', people: 'Personas y carácter', feelings: 'Sentimientos', opinion: 'Opiniones', work: 'Trabajo',
  money: 'Dinero', travel: 'Viajes', food: 'Comida', health: 'Salud y deporte', tech: 'Tecnología', society: 'Sociedad',
  time: 'Tiempo y frecuencia', describing: 'Adjetivos útiles',
  basics: 'Profesión y sistema', contracts: 'Contratos', litigation: 'Litigios', courtroom: 'En el tribunal', corporate: 'Mercantil y societario',
  criminal: 'Penal', employment: 'Laboral', 'data-ip': 'Datos y propiedad intelectual', office: 'Inglés en el despacho',
  home: 'Casa', clothes: 'Ropa y aspecto', city: 'Ciudad y transporte', nature: 'Naturaleza y tiempo', family: 'Familia y relaciones', education: 'Estudios',
  shopping: 'Compras', media: 'Ocio y medios', body: 'Cuerpo y salud', politics: 'Política', environment: 'Medio ambiente', science: 'Ciencia',
  advanced: 'Nivel avanzado (C1-C2)', cooking: 'Cocina', sport: 'Deporte', verbs: 'Verbos del día a día', quantity: 'Cantidades',
  property: 'Inmobiliario', family_law: 'Familia', tax: 'Fiscal', public: 'Público y UE', dispute: 'Procedimiento y arbitraje', 'finance-law': 'Bancario y M&A', practice: 'La profesión',
  start: 'Empezar y ganar tiempo', plans: 'Planes', react: 'Reaccionar', request: 'Pedir cosas', bye: 'Despedirse', uk: 'Británico', us: 'Americano',
  general: 'General', grammar: 'Gramática', spelling: 'Ortografía', finance: 'Finanzas', meetings: 'Reuniones y negociación', emails: 'Correos', strategy: 'Estrategia y empresa'
};
let LEARN = store.get('learn', {});
let GPROG = store.get('gprog', {});
const saveLearn = () => { store.set('learn', LEARN); updateBadge(); };
const LIB = (window.VOCAB || []).map(v => {
  const id = v.c + ':' + v.t;
  return { id, term: v.t, cat: v.c, top: v.top, def: v.d, es: v.es, ex: v.ex, lib: true, srs: LEARN[id] || null };
});
const LIB_BY_ID = Object.fromEntries(LIB.map(x => [x.id, x]));
function startLearning(x, known) {
  if (x.srs) return;
  const s = newSrs(); s.added = Date.now(); s.upd = Date.now();
  if (known) { s.reps = 3; s.ivl = 45; s.ef = 2.7; s.due = Date.now() + 45 * DAY; s.known = true; }
  LEARN[x.id] = s; x.srs = s;
}
function itemStatus(x) { if (!x.srs) return 'new'; if (x.srs.known || x.srs.ivl >= 21) return 'done'; return 'learning'; }
const STATUS_TAG = { new: '', learning: '<span class="tag">Aprendiendo</span>', done: '<span class="tag good">Dominada</span>' };

/* frases para los ejercicios: ejemplos, lecturas, situaciones y notas */
let POOL = [];
function buildPool() {
  const p = [];
  LIB.forEach(x => x.ex && p.push({ s: x.ex, src: LIB_CATS[x.cat].name, id: x.id, legal: x.cat === 'legal' }));
  (window.READINGS || []).forEach(r => r.body.forEach(par => splitSentences(par).forEach(se => { const n = se.s.split(/\s+/).length; if (n >= 6 && n <= 30) p.push({ s: se.s, src: r.headline, id: r.id, legal: r.legal }); })));
  (window.SITUATIONS || []).forEach(si => { si.phrases.forEach(ph => p.push({ s: ph[0], src: si.title, id: si.id, legal: si.legal })); si.dialogue.forEach(d => { if (d[1].split(/\s+/).length >= 5) p.push({ s: d[1], src: si.title, id: si.id, legal: si.legal }); }); });
  NOTES.forEach(n => { if (n.ex && n.ex.split(/\s+/).length >= 5) p.push({ s: n.ex, src: 'Mis notas', id: n.id }); });
  (window.DIALOGUES || []).forEach(d => d.lines.forEach(l => { if (l[1].split(/\s+/).length >= 5) p.push({ s: l[1], src: d.title, id: d.id }); }));
  (window.TEXTS || []).forEach(t => String(t.body || '').split(/\n+/).forEach(par => splitSentences(par).forEach(se => { const n = se.s.split(/\s+/).length; if (n >= 5 && n <= 30) p.push({ s: se.s, src: t.title || 'Mi texto', id: t.id }); })));
  POOL = p.filter(x => /^[A-Z“"‘']/.test(x.s));
}

/* ==========================================================
   ROUTER
   ========================================================== */
let currentTab = 'home';
let reading = null;
let PENDING_PROMPT = null;
function go(hash) { if (location.hash === hash) route(); else location.hash = hash; }
window.addEventListener('hashchange', route);
const SUBTITLE = { listen: 'Escuchar', dlg: 'Diálogos', fast: 'Inglés rápido', accents: 'Acentos', handsfree: 'Manos libres', videos: 'Vídeos y podcasts', speak: 'Hablar', ai: 'Conversación IA', rp: 'Role-plays', native: 'Dilo como un nativo', diary: 'Diario hablado', texts: 'Mis textos', phrasal: 'Phrasal verbs', level: 'Test de nivel', packs: 'Lo que dicen los nativos', mine: 'Mío', list: 'Mis listas', nb: 'Cuaderno', set: 'Marcas', home: 'Hoy', learn: 'Aprender', lib: 'Aprender', legal: 'Inglés jurídico', grammar: 'Gramática', sit: 'Situaciones', read: 'Lecturas', pron: 'Pronunciación', new: 'Palabras nuevas', practice: 'Practicar', ex: 'Practicar', notes: 'Mis notas', progress: 'Progreso', settings: 'Ajustes' };
const TAB_OF = { listen: 'listen', dlg: 'listen', fast: 'listen', accents: 'listen', handsfree: 'listen', videos: 'listen', speak: 'speak', ai: 'speak', rp: 'speak', native: 'speak', diary: 'speak', texts: 'learn', phrasal: 'learn', level: 'home', packs: 'learn', mine: 'mine', notes: 'mine', list: 'mine', nb: 'mine', set: 'mine', home: 'home', new: 'home', learn: 'learn', lib: 'learn', legal: 'learn', grammar: 'learn', sit: 'learn', read: 'learn', pron: 'learn', practice: 'practice', ex: 'practice', progress: 'home' };
function route() {
  endReadingSession(); TTS.stop(); stopRecording(); stopDialogue();
  if (typeof stopHandsFree === 'function') { stopHandsFree(); stopDialogPlay(); stopVideoTimer(); }
  $('#view').onclick = null;
  if ($('#sheet') && !$('#sheet').classList.contains('hidden')) closeSheet();
  const h = decodeURIComponent(location.hash.slice(1) || S.startTab || 'home');
  const [view, ...rest] = h.split('/');
  const arg = rest.join('/');
  const isRoot = ['home', 'learn', 'listen', 'speak', 'practice', 'mine'].includes(view);
  $('#backBtn').classList.toggle('hidden', isRoot || !SUBTITLE[view]);
  currentTab = TAB_OF[view] || currentTab;
  $$('.tab').forEach(t => t.classList.toggle('active', t.dataset.tab === currentTab));
  $('#brandSub').textContent = SUBTITLE[view] || 'Hoy';
  window.scrollTo(0, 0);
  const R = { home: renderHome, learn: renderLearn, lib: renderLib, legal: () => renderLib('legal'), grammar: renderGrammar, sit: renderSit, read: renderRead, pron: renderPron, new: renderNewWords, practice: renderPractice, ex: startExercise, listen: renderListen, dlg: renderDialogues, fast: renderFast, accents: renderAccents, handsfree: renderHandsFree, videos: renderVideos, speak: renderSpeak, ai: renderAI, rp: renderRoleplays, native: renderNative, diary: renderDiary, texts: renderTexts, phrasal: renderPhrasal, level: renderLevel, packs: renderPacks, notes: renderMine, mine: renderMine, list: renderList, nb: renderNB, set: renderSet, progress: renderProgress, settings: renderSettings };
  (R[view] || renderHome)(arg);
}
$$('.tab').forEach(t => t.addEventListener('click', () => go('#' + t.dataset.tab)));
$('#backBtn').addEventListener('click', () => { if (history.length > 1) history.back(); else go('#' + currentTab); });
$('#settingsBtn').addEventListener('click', () => go('#settings'));
$('#streakPill').addEventListener('click', () => go('#progress'));
$('#backdrop').addEventListener('click', closeSheet);

/* ==========================================================
   HOY
   ========================================================== */
function dailyPick(arr, salt) { if (!arr.length) return null; const k = dayKey() + salt; let h = 0; for (const c of k) h = (h * 31 + c.charCodeAt(0)) >>> 0; return arr[h % arr.length]; }
function newLeftToday() { return Math.max(0, S.newPerDay - (today().newLib || 0)); }
function planHTML() {
  const t = today(); const due = dueCards().length;
  const rows = [
    { lbl: 'Aprender ' + S.newPerDay + ' palabras o expresiones nuevas', done: !newLeftToday(), val: (t.newLib || 0) + '/' + S.newPerDay, href: '#new' },
    { lbl: 'Repasar lo que estás aprendiendo', done: !due && (t.rev || 0) > 0 || (t.rev || 0) >= S.goalReviews, val: due ? due + ' pendientes' : (t.rev || 0) + ' hechos', href: '#ex/review' },
    { lbl: 'Hacer ejercicios', done: (t.ex || 0) >= S.goalExercises, val: (t.ex || 0) + '/' + S.goalExercises, href: '#practice' },
    { lbl: 'Escuchar y hablar (shadowing, speaking, pronunciación o una situación)', done: (t.spoke || 0) + (t.shadow || 0) + (t.listen || 0) >= 1, val: ((t.spoke || 0) + (t.shadow || 0) + (t.listen || 0)) ? '✓' : '0/1', href: '#ex/shadow' },
    { lbl: 'Leer algo en inglés', done: (t.art || 0) >= 1, val: (t.art || 0) ? '✓' : '0/1', href: '#read' }
  ];
  const n = rows.filter(r => r.done).length;
  return `<div class="card plan"><div class="row" style="margin-bottom:4px"><b class="grow">Tu plan de hoy</b><span class="tag ${n === rows.length ? 'good' : ''}">${n}/${rows.length}</span></div>
    ${rows.map(r => `<a class="plan-row ${r.done ? 'done' : ''}" href="${r.href}"><span class="check">${r.done ? '✓' : ''}</span><span class="grow">${esc(r.lbl)}</span><span class="muted" style="white-space:nowrap">${r.val}</span></a>`).join('')}</div>`;
}
function libRow(x, opts = {}) {
  const st = itemStatus(x);
  return `<div class="note" data-id="${esc(x.id)}"><div class="grow"><div class="row wrap" style="gap:6px"><span class="term">${esc(x.term)}</span>${opts.cat ? `<span class="tag ${x.cat === 'legal' ? 'warm' : ''}">${esc(LIB_CATS[x.cat].name)}</span>` : ''}${STATUS_TAG[st]}${markBadges(x.id)}</div>
    <div class="def">${esc(x.def)}</div><div class="es">${esc(x.es)}</div><div class="ex">${esc(x.ex)}</div></div>
    <div style="display:flex;flex-direction:column;gap:6px"><button class="mini" data-say="${esc(x.term)}" aria-label="Escuchar">${IC.speak}</button><button class="mini" data-mark="${esc(x.id)}" aria-label="Marcar">${IC.flag}</button>${st === 'new' ? `<button class="mini" data-learn="${esc(x.id)}" aria-label="Aprender">${IC.plus}</button>` : ''}</div></div>`;
}
function libClicks(rerender) {
  return e => {
    const s = e.target.closest('[data-say]'); if (s) { TTS.speak(s.dataset.say, { rate: 0.9 }); return true; }
    const l = e.target.closest('[data-learn]'); if (l) { startLearning(LIB_BY_ID[l.dataset.learn]); saveLearn(); toast('Añadida a tus repasos'); if (rerender) rerender(); return true; }
    const ex = e.target.closest('.ex'); if (ex) { TTS.speak(ex.textContent); return true; }
    return false;
  };
}
function renderHome() {
  const d = new Date();
  let dateStr = d.toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long' }); dateStr = dateStr.charAt(0).toUpperCase() + dateStr.slice(1);
  const h = d.getHours(); const hello = h < 13 ? 'Good morning' : h < 20 ? 'Good afternoon' : 'Good evening';
  const exp = dailyPick(LIB.filter(x => ['idiom', 'convo', 'phrasal'].includes(x.cat)), 'e');
  const legal = dailyPick(LIB.filter(x => x.cat === 'legal'), 'l');
  const gram = (window.GRAMMAR || []).find(g => !GPROG[g.id]) || dailyPick(window.GRAMMAR || [], 'g');
  const readIds = new Set(HISTORY.map(x => x.id));
  const rd = (window.READINGS || []).find(r => !readIds.has(r.id)) || dailyPick(window.READINGS || [], 'r');
  const sit = dailyPick(window.SITUATIONS || [], 's');
  const left = newLeftToday();
  $('#view').innerHTML = `
    <div class="eyebrow">${esc(dateStr)}</div>
    <div class="h1">${hello}${S.name ? ', ' + esc(S.name) : ''}</div>
    <p class="lede">Un poco cada día. La fluidez llega con constancia.</p>
    ${typeof cfg === 'function' && cfg() && SYNC.ready && !SYNC.user ? `<a class="card pad cta" href="#settings" style="border-color:var(--warm)"><div class="grow"><b>Crea tu cuenta</b><div class="muted" style="font-size:14px">Guarda tu progreso en internet para no perderlo nunca</div></div><span class="btn warm small">Crear</span></a>` : ''}
    ${left && S.home.words ? `<a class="card pad cta" href="#new"><div class="grow"><b>${left === S.newPerDay ? 'Tus ' + left + ' palabras de hoy' : 'Te quedan ' + left + ' palabras nuevas hoy'}</b><div class="muted" style="font-size:14px">Vocabulario, phrasal verbs, expresiones${S.mix.legal ? ' e inglés jurídico' : ''}</div></div><span class="btn primary small">Empezar</span></a>` : ''}
    ${S.home.plan ? planHTML() : ''}
    ${S.home.exp || S.home.legal ? '<div class="h2">Para hoy</div>' : ''}
    <div class="cards2">
      ${exp && S.home.exp ? `<div class="card pad dayexp"><div class="eyebrow" style="margin:0 0 4px">Expresión del día</div><div class="row"><b class="grow" style="font-family:var(--serif);font-size:20px">${esc(exp.term)}</b><button class="mini" data-say="${esc(exp.term)}">${IC.speak}</button></div><div class="es">${esc(exp.es)}</div><div class="ex">${esc(exp.ex)}</div><div class="row" style="margin-top:8px;gap:6px">${!exp.srs ? `<button class="btn small" data-learn="${esc(exp.id)}">Aprenderla</button>` : ''}<button class="btn small" data-mark="${esc(exp.id)}">${IC.flag.replace('<svg', '<svg width="14" height="14"')} Marcar</button>${markBadges(exp.id)}</div></div>` : ''}
      ${legal && S.home.legal ? `<div class="card pad dayexp legal"><div class="eyebrow" style="margin:0 0 4px">Término jurídico del día</div><div class="row"><b class="grow" style="font-family:var(--serif);font-size:20px">${esc(legal.term)}</b><button class="mini" data-say="${esc(legal.term)}">${IC.speak}</button></div><div class="es">${esc(legal.es)}</div><div class="ex">${esc(legal.ex)}</div><div class="row" style="margin-top:8px;gap:6px">${!legal.srs ? `<button class="btn small" data-learn="${esc(legal.id)}">Aprenderlo</button>` : ''}<button class="btn small" data-mark="${esc(legal.id)}">${IC.flag.replace('<svg', '<svg width="14" height="14"')} Marcar</button>${markBadges(legal.id)}</div></div>` : ''}
    </div>
    ${typeof routeCard === 'function' ? routeCard() : ''}
    <div class="suggest ${S.home.sugg ? '' : 'hidden'}">
      ${gram ? `<a class="card pad sug" href="#grammar/${gram.id}"><span class="sug-k">Gramática</span><b>${esc(gram.title)}</b><span class="muted">${esc(gram.es)}</span></a>` : ''}
      ${rd ? `<a class="card pad sug" href="#read/${rd.id}"><span class="sug-k">Lectura · ${esc(rd.level)}</span><b>${esc(rd.headline)}</b><span class="muted">${Math.max(1, Math.round(rd.body.join(' ').split(/\s+/).length / 200))} min · con audio</span></a>` : ''}
      ${sit ? `<a class="card pad sug" href="#sit/${sit.id}"><span class="sug-k">Situación</span><b>${esc(sit.title)}</b><span class="muted">${esc(sit.es)}</span></a>` : ''}
    </div>`;
  $('#view').onclick = rowClicks(renderHome);
}

/* ==========================================================
   APRENDER
   ========================================================== */
function catCounts(cat) { const a = LIB.filter(x => x.cat === cat); return { total: a.length, learned: a.filter(x => x.srs).length }; }
function renderLearn() {
  const lc = catCounts('legal');
  const tile = (href, ic, title, desc, extra = '') => `<a class="mode" href="${href}"><div class="ico">${IC[ic] || IC.book}</div><b>${title}</b><span>${desc}</span>${extra}</a>`;
  const prog = c => { const k = catCounts(c); return `<div class="mini-prog"><i style="width:${k.total ? k.learned / k.total * 100 : 0}%"></i></div><span class="muted" style="font-size:12px">${k.learned}/${k.total}</span>`; };
  $('#view').innerHTML = `
    <div class="h1">Aprender</div>
    <p class="sub">Todo el contenido de la app. Toca cualquier palabra para escucharla y pulsa + para añadirla a tus repasos.</p>
    <a class="card pad legal-hero" href="#legal"><div class="ico">${IC.scale}</div><div class="grow"><b>Inglés jurídico</b><div class="muted" style="font-size:14px">${lc.total} términos en ${Object.keys(TOPICS).filter(t => LIB.some(x => x.cat === 'legal' && x.top === t)).length} áreas, más situaciones y lecturas del despacho</div><div class="mini-prog" style="margin-top:8px"><i style="width:${lc.learned / lc.total * 100}%"></i></div></div></a>
    <div class="h2">Vocabulario</div>
    <div class="modes">${['word', 'phrasal', 'idiom', 'convo', 'chunk', 'slang', 'ukus', 'colloc', 'linker', 'false', 'business'].map(c => tile('#lib/' + c, LIB_CATS[c].ic, LIB_CATS[c].name, LIB_CATS[c].desc, prog(c))).join('')}</div>
    <div class="h2">Habilidades</div>
    <div class="modes">
      ${tile('#grammar', 'pen', 'Gramática', (window.GRAMMAR || []).length + ' lecciones con ejercicios', `<span class="muted" style="font-size:12px">${Object.keys(GPROG).length} completadas</span>`)}
      ${tile('#sit', 'chat', 'Situaciones', 'Frases y diálogos para la vida real y el despacho')}
      ${tile('#read', 'book', 'Lecturas', 'Textos cortos con audio y preguntas')}
      ${tile('#pron', 'ear', 'Pronunciación', 'Sonidos difíciles, acento y ritmo')}
      ${tile('#phrasal', 'link', 'Phrasal verbs por partícula', 'Entiende qué significan up, out, off… y agrúpalos por verbo')}
      ${tile('#packs', 'spark', 'Lo que dicen los nativos', 'Packs de frases para el pub, el gimnasio, la oficina…')}
      ${tile('#texts', 'pen', 'Mis textos', 'Pega cualquier texto y conviértelo en lectura con audio')}
      ${tile('#level', 'flag', 'Test de nivel', 'Descubre tu nivel y tu ruta personalizada')}
    </div>
    <div class="h2">Buscar</div>
    <div class="search">${IC.search}<input class="input" id="libq" type="search" placeholder="Busca en las ${LIB.length} entradas (inglés o español)…"></div>
    <div id="libRes"></div>`;
  $('#libq').addEventListener('input', e => {
    const q = norm(e.target.value); const box = $('#libRes');
    if (q.length < 2) { box.innerHTML = ''; return; }
    const r = NOTES.concat(LIB).filter(x => norm(x.term + ' ' + x.es + ' ' + (x.def || '')).includes(q)).slice(0, 50);
    box.innerHTML = r.length ? `<div class="card">${r.map(anyRow).join('')}</div>` : '<div class="empty">Sin resultados.</div>';
  });
  $('#view').onclick = rowClicks(() => $('#libq').dispatchEvent(new Event('input')));
}
let libState = { top: 'all', filter: 'all' };
function renderLib(cat) {
  if (!LIB_CATS[cat]) return renderLearn();
  const items = LIB.filter(x => x.cat === cat);
  const tops = Array.from(new Set(items.map(x => x.top))).filter(t => TOPICS[t]);
  if (libState.cat !== cat) libState = { cat, top: 'all', filter: 'all' };
  const extra = cat === 'legal' ? `<div class="row wrap" style="margin:6px 0 14px"><a class="btn small" href="#sit/client">Reunión con cliente</a><a class="btn small" href="#sit/negotiation">Negociación</a><a class="btn small" href="#sit/legalemail">Correos del despacho</a><a class="btn small" href="#read/r-trainee">Lectura: un día de trainee</a><a class="btn small" href="#read/r-contract">Lectura: cláusulas clave</a><a class="btn small primary" href="#ex/vocab/legal">Test jurídico</a></div>` : '';
  $('#view').innerHTML = `
    <div class="h1">${esc(LIB_CATS[cat].name)}</div>
    <p class="sub">${esc(LIB_CATS[cat].desc)} · ${items.length} entradas · ${items.filter(x => x.srs).length} en tus repasos</p>
    ${extra}
    ${tops.length > 1 ? `<div class="chips" id="topChips"><button class="chip ${libState.top === 'all' ? 'active' : ''}" data-t="all">Todas</button>${tops.map(t => `<button class="chip ${libState.top === t ? 'active' : ''}" data-t="${t}">${esc(TOPICS[t])}</button>`).join('')}</div>` : ''}
    <div class="row wrap" style="margin-bottom:10px"><select class="select" id="libFilter" style="width:auto;padding:8px 10px;font-size:14px"><option value="all">Todas</option><option value="new">Sin aprender</option><option value="learning">Aprendiendo</option><option value="done">Dominadas</option><option value="fav">★ Favoritas</option><option value="unknown">✗ No me la sé</option><option value="hard">! Difíciles</option><option value="known">✓ Me la sé</option>${LABELS.map(L => `<option value="label:${L.id}">${esc(L.name)}</option>`).join('')}</select><span class="grow"></span><button class="btn small" id="learnAll">Añadir estas a mis repasos</button></div>
    <div id="libList"></div>`;
  $('#libFilter').value = libState.filter;
  const list = () => items.filter(x => (libState.top === 'all' || x.top === libState.top) && (libState.filter === 'all' || (['new', 'learning', 'done'].includes(libState.filter) ? itemStatus(x) === libState.filter : matchMark(x.id, libState.filter))));
  const paint = () => { const l = list(); $('#libList').innerHTML = l.length ? `<div class="card">${l.map(x => libRow(x)).join('')}</div>` : '<div class="empty">Nada por aquí.</div>'; };
  if ($('#topChips')) $('#topChips').onclick = e => { const b = e.target.closest('.chip'); if (!b) return; libState.top = b.dataset.t; $$('#topChips .chip').forEach(c => c.classList.toggle('active', c === b)); paint(); };
  $('#libFilter').onchange = e => { libState.filter = e.target.value; paint(); };
  $('#learnAll').onclick = () => { const l = list().filter(x => !x.srs); if (!l.length) { toast('Ya están todas en tus repasos'); return; } if (l.length > 15 && !confirm('¿Añadir ' + l.length + ' entradas a tus repasos de golpe? Entrarán en tus tarjetas a partir de hoy.')) return; l.forEach(x => startLearning(x)); saveLearn(); toast(l.length + ' añadidas a tus repasos'); paint(); };
  $('#view').onclick = rowClicks(paint);
  paint();
  const a = $('#topChips .chip.active'); if (a) a.scrollIntoView({ inline: 'center', block: 'nearest' });
}

/* ---------- palabras nuevas del día ---------- */
function nextNewItems(n) {
  const cats = Object.keys(LIB_CATS).filter(c => S.mix[c]);
  const pools = cats.map(c => LIB.filter(x => x.cat === c && !x.srs));
  const out = []; let i = 0, guard = 0;
  while (out.length < n && guard++ < 2000 && pools.some(p => p.length)) { const p = pools[i % pools.length]; if (p.length) out.push(p.shift()); i++; }
  return out;
}
function renderNewWords(arg) {
  const left = newLeftToday();
  const extra = arg === 'more';
  const batch = nextNewItems(extra ? 5 : left);
  if (!batch.length) {
    const any = LIB.some(x => !x.srs);
    $('#view').innerHTML = `<div class="card pad" style="text-align:center;padding:28px"><div style="font-size:42px">✓</div><b>${any ? 'Ya has aprendido tus palabras de hoy' : '¡Has visto toda la biblioteca!'}</b>
      <p class="muted">${any ? 'Ahora toca repasarlas para que se queden. Si quieres más, puedes añadir 5 extra.' : 'Pídeme más contenido y lo añadimos en la próxima versión.'}</p>
      <a class="btn primary block" href="#ex/vocab/today">Practicar las de hoy</a>${any ? '<a class="btn block" href="#new/more" style="margin-top:8px">Aprender 5 más</a>' : ''}<a class="btn ghost block" href="#home" style="margin-top:8px">Volver</a></div>`;
    return;
  }
  let i = 0; let learned = 0;
  const show = () => {
    if (i >= batch.length) {
      $('#view').innerHTML = `<div class="card pad" style="text-align:center;padding:28px"><div style="font-size:42px">🎉</div><b>${learned} ${learned === 1 ? 'entrada nueva' : 'entradas nuevas'} en tus repasos</b><p class="muted">Ahora un test rápido para fijarlas. Mañana te las volveré a preguntar.</p>
        <a class="btn primary block" href="#ex/vocab/today">Test rápido</a><a class="btn ghost block" href="#home" style="margin-top:8px">Más tarde</a></div>`;
      return;
    }
    const x = batch[i];
    $('#view').innerHTML = `<div class="row" style="margin-bottom:8px"><b class="grow">Palabras nuevas</b><span class="muted">${i + 1}/${batch.length}</span></div>
      <div class="progressbar"><i style="width:${i / batch.length * 100}%"></i></div>
      <div class="card flash" style="margin-top:14px;min-height:300px"><span class="tag ${x.cat === 'legal' ? 'warm' : ''}">${esc(LIB_CATS[x.cat].name)}${TOPICS[x.top] ? ' · ' + esc(TOPICS[x.top]) : ''}</span>
        <div class="term" style="margin-top:12px">${esc(x.term)}</div><button class="mini" id="nwSay" style="margin-top:10px">${IC.speak}</button>
        <div style="margin-top:14px;font-size:17px">${esc(x.def)}</div>
        <div id="nwBack" class="back hidden"><div style="font-size:19px;font-weight:700">${esc(x.es)}</div><div class="ctx muted" style="margin-top:8px;font-style:italic" id="nwEx">${esc(x.ex)}</div></div></div>
      <button class="btn block" id="nwReveal" style="margin-top:12px">Ver traducción y ejemplo</button>
      <div class="row" style="margin-top:10px"><button class="btn grow" id="nwKnow">Ya me la sé</button><button class="btn primary grow" id="nwLearn">Aprender</button></div>
      <div class="row" style="margin-top:8px;justify-content:center;gap:8px"><button class="btn small" id="nwFav">★ Favorita</button><button class="btn small" id="nwMark">${IC.flag.replace('<svg', '<svg width="14" height="14"')} Más marcas</button><span id="nwBadges">${markBadges(x.id)}</span></div>`;
    if (S.autoplay) TTS.speak(x.term, { rate: 0.9 });
    $('#nwFav').onclick = () => { setMark(x.id, { fav: !mark(x.id).fav }); $('#nwBadges').innerHTML = markBadges(x.id); };
    $('#nwMark').onclick = () => openMarkSheet(x.id, () => { const b = $('#nwBadges'); if (b) b.innerHTML = markBadges(x.id); });
    $('#nwSay').onclick = () => TTS.speak(x.term, { rate: 0.9 });
    $('#nwReveal').onclick = () => { $('#nwBack').classList.remove('hidden'); $('#nwReveal').classList.add('hidden'); if (S.autoplay) TTS.speak(x.ex); };
    $('#nwEx').onclick = () => TTS.speak(x.ex);
    const next = known => { startLearning(x, known); if (known) setMark(x.id, { st: 'known' }); saveLearn(); const t = today(); t.newLib = (t.newLib || 0) + 1; saveStats(); renderStreak(); if (!known) learned++; i++; show(); };
    $('#nwKnow').onclick = () => next(true);
    $('#nwLearn').onclick = () => next(false);
  };
  show();
}

/* ==========================================================
   GRAMÁTICA
   ========================================================== */
function renderGrammar(id) {
  const G = window.GRAMMAR || [];
  if (!id) {
    $('#view').innerHTML = `<div class="h1">Gramática</div><p class="sub">Lo esencial para hablar con soltura, explicado sin rollos. Cada lección tiene ejercicios.</p>
      <a class="btn primary block" href="#ex/gram" style="margin-bottom:14px">Ejercicios mezclados de todas las lecciones</a>
      <div class="card">${G.map(g => `<a class="note" href="#grammar/${g.id}" style="text-decoration:none;color:inherit"><div class="grow"><span class="term">${esc(g.title)}</span><div class="es">${esc(g.es)}</div></div>${GPROG[g.id] != null ? `<span class="tag ${GPROG[g.id] >= 6 ? 'good' : ''}">${GPROG[g.id]}/8</span>` : '<span class="muted">›</span>'}</a>`).join('')}</div>`;
    return;
  }
  const g = G.find(x => x.id === id); if (!g) return renderGrammar();
  $('#view').innerHTML = `<div class="eyebrow">Gramática</div><div class="h1">${esc(g.title)}</div><p class="lede" style="font-family:var(--sans);font-size:16px">${esc(g.intro)}</p>
    ${g.points.map(p => `<div class="card pad" style="margin-bottom:10px"><b>${esc(p[0])}</b>${p[1].map(e => `<div class="gex" data-say="${esc(e)}">${IC.speak.replace('<svg', '<svg width="15" height="15"')} ${esc(e)}</div>`).join('')}</div>`).join('')}
    <a class="btn primary block" href="#ex/gram/${g.id}" style="margin-top:6px">Practicar (8 preguntas)</a>
    ${GPROG[g.id] != null ? `<p class="meta" style="justify-content:center;margin-top:8px">Tu mejor resultado · ${GPROG[g.id]}/8</p>` : ''}`;
  $('#view').onclick = e => { const s = e.target.closest('[data-say]'); if (s) TTS.speak(s.dataset.say.replace(/\(.*?\)/g, '')); };
}
function genGram(id) {
  const G = window.GRAMMAR || [];
  const lessons = id ? G.filter(g => g.id === id) : G;
  if (!SESSION.gq) {
    let all = [];
    lessons.forEach(g => g.ex.forEach(e => all.push({ g, e })));
    SESSION.gq = id ? shuffle(all) : shuffle(all).slice(0, 10);
    SESSION.total = SESSION.gq.length;
  }
  const it = SESSION.gq[SESSION.n]; if (!it) return null;
  return { type: 'gram', g: it.g, sentence: it.e[0], answer: it.e[1], options: shuffle(it.e[2]), why: it.e[3] };
}
function renderGramQ(q) {
  const [a, b] = q.sentence.split('___');
  $('#view').innerHTML = `${exHeader()}<div id="qArea"><p class="muted" style="margin:16px 0 0">${esc(q.g.title)}</p>
    <div class="q">${esc(a)}<span class="gap">?</span>${esc(b || '')}</div>
    <div class="opts">${q.options.map(o => `<button class="opt" data-o="${esc(o)}">${esc(o)}</button>`).join('')}</div></div>`;
  $$('.opt').forEach(btn => btn.onclick = () => {
    if ($('.opt.right')) return;
    const ok = btn.dataset.o === q.answer;
    $$('.opt').forEach(x => { if (x.dataset.o === q.answer) x.classList.add('right'); });
    if (!ok) btn.classList.add('wrong');
    $('.gap').textContent = q.answer === '—' ? '(nada)' : q.answer;
    q.it = { s: q.sentence.replace('___', q.answer === '—' ? '' : q.answer).replace(/\s+/g, ' '), src: q.g.title };
    answered(ok, `<div style="margin-top:4px">${esc(q.why)}</div>`);
  });
}

/* ==========================================================
   SITUACIONES
   ========================================================== */
let DLG = null;
function stopDialogue() { if (DLG) { DLG.stop = true; DLG = null; } }
function renderSit(id) {
  const L = window.SITUATIONS || [];
  if (!id) {
    const row = s => `<a class="note" href="#sit/${s.id}" style="text-decoration:none;color:inherit"><div class="grow"><span class="term">${esc(s.title)}</span><div class="es">${esc(s.es)}</div></div><span class="muted">›</span></a>`;
    $('#view').innerHTML = `<div class="h1">Situaciones</div><p class="sub">Frases listas para usar y diálogos para escuchar y practicar. En el role-play tú dices las frases de Iker.</p>
      <a class="card pad cta" href="#packs"><div class="grow"><b>Lo que dicen los nativos en…</b><div class="muted" style="font-size:14px">El pub, el gimnasio, la oficina, una cita, el fútbol…</div></div><span class="muted">›</span></a>
      <div class="h2">Día a día y trabajo</div><div class="card">${L.filter(s => !s.legal && !s.pack).map(row).join('')}</div>
      <div class="h2">En el despacho</div><div class="card">${L.filter(s => s.legal).map(row).join('')}</div>`;
    return;
  }
  const s = L.find(x => x.id === id); if (!s) return renderSit();
  $('#view').innerHTML = `<div class="eyebrow">${s.legal ? 'Inglés jurídico · ' : ''}Situación</div><div class="h1">${esc(s.title)}</div><p class="sub">${esc(s.es)}</p>
    <div class="h2">Frases útiles</div>
    <div class="card">${s.phrases.map((p, k) => `<div class="note" data-say="${esc(p[0])}"><div class="grow"><span class="term" style="font-size:16px">${esc(p[0])}</span><div class="es">${esc(p[1])}</div></div><button class="mini">${IC.speak}</button></div>`).join('')}</div>
    <button class="btn block" id="savePh" style="margin-top:10px">Guardar estas frases en mis notas</button>
    <div class="${s.dialogue.length ? '' : 'hidden'}"><div class="h2">Diálogo</div>
    <div class="row wrap" style="margin-bottom:10px"><button class="btn primary grow" id="dlgPlay">${IC.play.replace('<svg', '<svg width="16" height="16"')} Escuchar diálogo</button><button class="btn grow" id="dlgRole">${IC.mic.replace('<svg', '<svg width="16" height="16"')} Role-play (tú eres Iker)</button></div>
    <div class="card pad dialogue" id="dlg">${s.dialogue.map((d, k) => `<div class="dl ${d[0] === 'Iker' ? 'me' : ''}" data-k="${k}"><span class="who">${esc(d[0])}</span><span class="line">${esc(d[1])}</span></div>`).join('')}</div>
    <div id="dlgHint" class="muted" style="font-size:14px;margin-top:8px"></div></div>
    ${s.pack ? `<div class="row wrap" style="margin-top:14px"><a class="btn grow" href="#ex/say/${s.id}">${IC.mic.replace('<svg', '<svg width="16" height="16"')} Dilas en voz alta</a><a class="btn grow" href="#packs">Más packs</a></div>` : ''}`;
  $('#view').onclick = e => { const n = e.target.closest('.note[data-say]'); if (n) { TTS.speak(n.dataset.say); return; } const l = e.target.closest('.dl'); if (l && !DLG) TTS.speak(s.dialogue[+l.dataset.k][1]); };
  $('#savePh').onclick = () => { const have = new Set(NOTES.map(n => norm(n.term))); let c = 0; s.phrases.forEach(p => { if (have.has(norm(p[0]))) return; NOTES.unshift({ id: uid(), term: p[0], cat: s.legal ? 'legal' : 'convo', es: p[1], ex: '', def: '', note: '', src: s.title, created: Date.now(), srs: newSrs() }); c++; }); saveNotes(); toast(c ? c + ' frases guardadas' : 'Ya las tenías'); };
  const lines = $$('#dlg .dl');
  const hl = k => lines.forEach((el, j) => el.classList.toggle('on', j === k));
  const playFrom = (k, role) => {
    const me = DLG; if (!me || me.stop) return;
    if (k >= s.dialogue.length) { hl(-1); lines.forEach(el => el.classList.remove('hide')); $('#dlgHint').textContent = role ? '¡Bien hecho! Repítelo hasta que te salga fluido.' : ''; DLG = null; bump('ex'); const t = today(); t.listen = (t.listen || 0) + 1; saveStats(); return; }
    hl(k); lines[k].scrollIntoView({ block: 'nearest', behavior: 'smooth' });
    const [who, line] = s.dialogue[k];
    if (role && who === 'Iker') {
      $('#dlgHint').innerHTML = 'Tu turno. Di la frase en voz alta y luego toca <b>Siguiente</b>. <button class="btn small" id="dlgShow">Ver frase</button> <button class="btn small primary" id="dlgNext">Siguiente</button>';
      $('#dlgShow').onclick = () => { lines[k].classList.remove('hide'); TTS.speak(line); };
      $('#dlgNext').onclick = () => { lines[k].classList.remove('hide'); $('#dlgHint').textContent = ''; playFrom(k + 1, role); };
      return;
    }
    TTS.speak(line, { onend: () => setTimeout(() => playFrom(k + 1, role), 350) });
  };
  $('#dlgPlay').onclick = () => { stopDialogue(); TTS.stop(); lines.forEach(el => el.classList.remove('hide')); DLG = {}; playFrom(0, false); };
  $('#dlgRole').onclick = () => { stopDialogue(); TTS.stop(); lines.forEach((el, k) => el.classList.toggle('hide', s.dialogue[k][0] === 'Iker')); DLG = {}; playFrom(0, true); };
}

/* ==========================================================
   PRONUNCIACIÓN
   ========================================================== */
function renderPron(id) {
  const P = window.PRONUNCIATION || [];
  if (!id) {
    $('#view').innerHTML = `<div class="h1">Pronunciación</div><p class="sub">Los sonidos que más cuestan a los hispanohablantes. Toca cada palabra para oírla y repítela en voz alta.</p>
      <a class="btn primary block" href="#ex/pair" style="margin-bottom:14px">Escucha y elige (sonidos mezclados)</a>
      <div class="card">${P.map(p => `<a class="note" href="#pron/${p.id}" style="text-decoration:none;color:inherit"><div class="grow"><span class="term">${esc(p.title)}</span><div class="es">${esc(p.es)}</div></div><span class="muted">›</span></a>`).join('')}</div>`;
    return;
  }
  const p = P.find(x => x.id === id); if (!p) return renderPron();
  $('#view').innerHTML = `<div class="eyebrow">Pronunciación</div><div class="h1">${esc(p.title)}</div>
    <div class="notice">${esc(p.tip)}</div>
    <div class="h2">Escucha y repite</div>
    <div class="pairs">${p.pairs.map(pr => `<div class="pair"><button class="wchip" data-say="${esc(pr[0])}">${esc(pr[0])}</button><span class="muted">·</span><button class="wchip" data-say="${esc(pr[1])}">${esc(pr[1])}</button></div>`).join('')}</div>
    <div class="h2">Frases</div>
    <div class="card">${p.sentences.map(se => `<div class="note" data-say="${esc(se)}"><div class="grow ctx">${esc(se)}</div><button class="mini">${IC.speak}</button></div>`).join('')}</div>
    <div class="row" style="margin-top:12px">${p.noQuiz ? '' : `<a class="btn primary grow" href="#ex/pair/${p.id}">Escucha y elige</a>`}<button class="btn grow" id="slowAll">Todas despacio</button></div>`;
  $('#view').onclick = e => { const s = e.target.closest('[data-say]'); if (s) { TTS.speak(s.dataset.say.replace(/\s*\(.*\)/, ''), { rate: 0.85 }); const t = today(); t.listen = (t.listen || 0); } };
  $('#slowAll').onclick = () => { const words = p.pairs.flat().map(w => w.replace(/\s*\(.*\)/, '')); let k = 0; const nx = () => { if (k < words.length && location.hash.startsWith('#pron/')) TTS.speak(words[k++], { rate: 0.75, onend: () => setTimeout(nx, 350) }); }; nx(); const t = today(); t.listen = (t.listen || 0) + 1; saveStats(); };
}
function genPair(id) {
  const P = (window.PRONUNCIATION || []).filter(p => !p.noQuiz && (!id || p.id === id));
  if (!P.length) return null;
  const p = pick(P); const pr = pick(p.pairs); const k = Math.random() < 0.5 ? 0 : 1;
  return { type: 'pair', p, pair: pr, answer: pr[k] };
}
function renderPairQ(q) {
  $('#view').innerHTML = `${exHeader()}<div id="qArea"><p class="muted" style="margin:16px 0 4px">${esc(q.p.title)}</p><p style="margin:0 0 14px">¿Qué palabra has oído?</p>
    <div class="row" style="justify-content:center;gap:10px;margin-bottom:16px"><button class="btn primary" id="pPlayQ">${IC.play.replace('<svg', '<svg width="16" height="16"')} Escuchar</button><button class="btn" id="pSlowQ">🐢 Lento</button></div>
    <div class="opts">${q.pair.map(o => `<button class="opt" data-o="${esc(o)}" style="text-align:center;font-size:20px">${esc(o)}</button>`).join('')}</div></div>`;
  $('#view').onclick = e => { const b = e.target.closest('[data-say]'); if (b) TTS.speak(b.dataset.say, { rate: 0.85 }); };
  $('#pPlayQ').onclick = () => TTS.speak(q.answer, { rate: 0.9 });
  $('#pSlowQ').onclick = () => TTS.speak(q.answer, { rate: 0.7 });
  setTimeout(() => TTS.speak(q.answer, { rate: 0.9 }), 250);
  $$('.opt').forEach(b => b.onclick = () => {
    if ($('.opt.right')) return;
    const ok = b.dataset.o === q.answer;
    $$('.opt').forEach(x => { if (x.dataset.o === q.answer) x.classList.add('right'); });
    if (!ok) b.classList.add('wrong');
    const t = today(); t.listen = (t.listen || 0) + 1; saveStats();
    answered(ok, `<div class="row" style="margin-top:8px;gap:8px">${q.pair.map(w => `<button class="btn small" data-say="${esc(w)}">${IC.speak.replace('<svg', '<svg width="15" height="15"')} ${esc(w)}</button>`).join('')}</div><div class="muted" style="font-size:13px;margin-top:6px">La voz del móvil no es perfecta. Si dudas, escucha las dos y compara.</div>`);
  });
}

/* ==========================================================
   PHRASAL VERBS: ¿qué partícula va?
   ========================================================== */
const PART_WORDS = new Set(['up', 'out', 'off', 'down', 'in', 'on', 'over', 'away', 'back', 'through', 'into', 'about', 'around', 'across', 'along', 'forward', 'apart', 'aside', 'with', 'for', 'after', 'by', 'of', 'to']);
function phrasalParts(term) {
  const w = termWords(term.split('/')[0].replace(/\(.*?\)/g, ''));
  const parts = w.slice(1).filter(x => PART_WORDS.has(x));
  return parts.length === w.length - 1 && parts.length ? parts : null;
}
function genParticle() {
  const items = shuffle(LIB.filter(x => x.cat === 'phrasal' && phrasalParts(x.term)));
  const allParts = Array.from(new Set(LIB.filter(x => x.cat === 'phrasal').map(x => phrasalParts(x.term)).filter(Boolean).map(p => p.join(' '))));
  for (const x of items) {
    const parts = phrasalParts(x.term);
    const ex = x.ex.split(' / ')[0];
    const toks = tokenize(ex);
    for (let i = 1; i < toks.length - parts.length + 1; i++) {
      if (parts.every((p, j) => toks[i + j].w.toLowerCase() === p)) {
        const ans = parts.join(' ');
        const opts = shuffle(allParts.filter(p => p !== ans && p.split(' ').length === parts.length)).slice(0, 3);
        if (opts.length < 3) continue;
        return { type: 'particle', x, it: { s: ex, src: 'Phrasal verbs', id: x.id }, before: ex.slice(0, toks[i].s), after: ex.slice(toks[i + parts.length - 1].e), answer: ans, options: shuffle([ans].concat(opts)) };
      }
    }
  }
  return null;
}
function renderParticleQ(q) {
  $('#view').innerHTML = `${exHeader()}<div id="qArea"><p class="muted" style="margin:16px 0 0">¿Qué partícula completa el phrasal verb?</p>
    <div class="q">${esc(q.before)}<span class="gap">?</span>${esc(q.after)}</div>
    <div class="opts">${q.options.map(o => `<button class="opt" data-o="${esc(o)}">${esc(o)}</button>`).join('')}</div></div>`;
  $$('.opt').forEach(b => b.onclick = () => {
    if ($('.opt.right')) return;
    const ok = b.dataset.o === q.answer;
    $$('.opt').forEach(x => { if (x.dataset.o === q.answer) x.classList.add('right'); });
    if (!ok) b.classList.add('wrong');
    $('.gap').textContent = q.answer;
    if (q.x.srs && !ok) grade(q.x, 0);
    answered(ok, `<div style="margin-top:4px"><b>${esc(q.x.term)}</b> · ${esc(q.x.es)}</div><div class="muted" style="font-size:14px">${esc(q.x.def)}</div>`);
  });
}

/* ==========================================================
   ARTÍCULO
   ========================================================== */
let ART = null; // {item, paras:[{text,tokens,html,tag}], sentences}
const WORD_RE = /[A-Za-zÀ-ÖØ-öø-ÿ]+(?:['’-][A-Za-zÀ-ÖØ-öø-ÿ]+)*/g;

function tokenize(text) {
  const tokens = []; let m; WORD_RE.lastIndex = 0;
  while ((m = WORD_RE.exec(text))) tokens.push({ w: m[0], s: m.index, e: m.index + m[0].length });
  return tokens;
}
function paraHTML(p, pi) {
  let h = '', last = 0;
  p.tokens.forEach((t, ti) => {
    h += esc(p.text.slice(last, t.s)) + `<span class="w" data-p="${pi}" data-t="${ti}">${esc(t.w)}</span>`;
    last = t.e;
  });
  return h + esc(p.text.slice(last));
}
function splitSentences(text) {
  const res = []; const re = /[^.!?]+(?:[.!?]+["”’)]*|$)/g; let m;
  while ((m = re.exec(text))) { if (!m[0].trim()) { if (re.lastIndex === m.index) re.lastIndex++; continue; } res.push({ s: m[0].trim(), a: m.index, b: m.index + m[0].length }); }
  return res;
}

/* coincidencia aproximada de palabras (plurales, -ed, -ing) */
function stem(w) {
  w = norm(w);
  if (w.length > 5 && w.endsWith('ies')) return w.slice(0, -3) + 'y';
  if (w.length > 5 && w.endsWith('ied')) return w.slice(0, -3) + 'y';
  if (w.length > 5 && w.endsWith('ing')) return w.slice(0, -3).replace(/(.)\1$/, '$1');
  if (w.length > 4 && w.endsWith('ed')) return w.slice(0, -2).replace(/(.)\1$/, '$1');
  if (w.length > 4 && w.endsWith('es')) return w.slice(0, -2);
  if (w.length > 3 && w.endsWith('s') && !w.endsWith('ss')) return w.slice(0, -1);
  return w;
}
function wordEq(a, b) {
  a = norm(a); b = norm(b); if (a === b) return true;
  const sa = stem(a), sb = stem(b);
  return sa.length > 2 && (sa === sb || sa === sb + 'e' || sb === sa + 'e' || sa.replace(/e$/, '') === sb.replace(/e$/, ''));
}
const FILLER = new Set(['a', 'an', 'the', 'something', 'somebody', 'someone', 'sth', 'sb', 'be', 'to']);
function termWords(term) { return norm(term).split(' ').filter(Boolean); }

function markKnown() {
  if (!ART) return;
  $$('.w.known').forEach(x => x.classList.remove('known'));
  const terms = NOTES.map(n => termWords(n.term).filter(w => !FILLER.has(w))).filter(t => t.length);
  ART.paras.forEach((p, pi) => {
    const toks = p.tokens;
    for (let i = 0; i < toks.length; i++) {
      for (const tw of terms) {
        if (!wordEq(toks[i].w, tw[0])) continue;
        // permite hasta 2 palabras intermedias (p. ej. "turned the offer down")
        let j = i, k = 1, ok = true, span = [i];
        while (k < tw.length) {
          let found = false;
          for (let g = 1; g <= 3 && j + g < toks.length; g++) { if (wordEq(toks[j + g].w, tw[k])) { j = j + g; span.push(j); found = true; break; } }
          if (!found) { ok = false; break; }
          k++;
        }
        if (ok) span.forEach(ti => { const el = $(`.w[data-p="${pi}"][data-t="${ti}"]`); if (el) el.classList.add('known'); });
      }
    }
  });
}

/* ==========================================================
   LECTURAS
   ========================================================== */
const rdWords = r => r.body.join(' ').split(/\s+/).length;
function renderRead(id) {
  const R = window.READINGS || [];
  const read = new Set(HISTORY.map(h => h.id));
  if (!id) {
    const card = r => `<a class="story" href="#read/${r.id}"><div class="meta"><span class="tag ${r.legal ? 'warm' : ''}">${esc(r.topic)}</span><span>${esc(r.level)}</span><span>${Math.max(1, Math.round(rdWords(r) / 200))} min</span>${read.has(r.id) ? '<span class="read-badge">✓ Leída</span>' : ''}</div><h3>${esc(r.headline)}</h3><p class="trail">${esc(r.standfirst)}</p></a>`;
    const series = Array.from(new Set(R.filter(r => r.series).map(r => r.series)));
    $('#view').innerHTML = `<div class="h1">Lecturas</div><p class="sub">Textos con audio. Toca cualquier palabra para traducirla y guardarla.</p>
      <a class="card pad cta" href="#texts"><div class="grow"><b>Lee lo que tú quieras</b><div class="muted" style="font-size:14px">Pega cualquier texto en inglés (un artículo, un email…) y conviértelo en lectura con audio</div></div><span class="btn primary small">Abrir</span></a>
      ${series.map(sr => `<div class="h2">Historia · ${esc(sr)}</div><div class="card list-card">${R.filter(r => r.series === sr).sort((a, b) => a.chapter - b.chapter).map(card).join('')}</div>`).join('')}
      <div class="h2">Lecturas cortas</div><div class="card list-card">${R.filter(r => !r.legal && !r.series).map(card).join('')}</div>
      <div class="h2">Inglés jurídico</div><div class="card list-card">${R.filter(r => r.legal && !r.series).map(card).join('')}</div>`;
    return;
  }
  const tx = id.startsWith('tx-') ? (window.TEXTS || []).find(t => t.id === id) : null;
  const it = tx ? { id: tx.id, headline: tx.title || 'Sin título', standfirst: tx.src || 'Texto añadido por ti', topic: 'Mi texto', level: '', legal: false, body: tx.body.split(/\n\s*\n|\n/).map(x => x.trim()).filter(Boolean), vocab: [], quiz: [], questions: [], mine: true } : R.find(r => r.id === id);
  if (!it) return renderRead();
  const nextCh = it.series ? R.find(r => r.series === it.series && r.chapter === it.chapter + 1) : null;
  const paras = it.body.map(t => ({ tag: 'p', text: t, tokens: tokenize(t) }));
  ART = { item: it, paras };
  const have = new Set(NOTES.map(n => norm(n.term)));
  $('#view').innerHTML = `
    <div class="art-top"><span class="tag ${it.legal ? 'warm' : ''}">${esc(it.topic)}</span><span class="meta">${it.level ? esc(it.level) + ' · ' : ''}${rdWords(it)} palabras · ${Math.max(1, Math.round(rdWords(it) / 200))} min</span>${it.mine ? `<span class="grow"></span><button class="mini" id="txEdit">${IC.pen}</button>` : ''}</div>
    <h1 class="art-title">${esc(it.headline)}</h1><p class="art-stand">${esc(it.standfirst)}</p>
    <div class="hint-tap">Toca cualquier palabra para traducirla. Las que ya tienes en notas salen resaltadas.</div>
    <div class="player"><button class="iconbtn" id="pPlay" aria-label="Escuchar">${IC.play}</button><button class="iconbtn" id="pStop" aria-label="Parar">${IC.stop}</button><div class="label" id="pLabel">Escuchar el texto</div><button class="btn small" id="pRate">${S.rate}×</button></div>
    <div class="row" style="margin-top:8px"><button class="btn small" id="hideTxt">Modo listening: ocultar texto</button></div>
    <div class="art-body" id="artBody">${paras.map((p, i) => `<p data-pi="${i}">${paraHTML(p, i)}</p>`).join('')}</div>
    ${it.quiz.length ? '<div class="h2">Comprensión</div>' : ''}
    ${it.quiz.map((q, k) => `<div class="card pad" style="margin-bottom:10px" data-qz="${k}"><b>${k + 1}. ${esc(q[0])}</b><div class="opts" style="margin-top:10px">${q[1].map((o, j) => `<button class="opt" data-j="${j}">${esc(o)}</button>`).join('')}</div></div>`).join('')}
    ${it.vocab.length ? '<div class="h2">Vocabulario del texto</div>' : ''}
    <div class="card ${it.vocab.length ? '' : 'hidden'}">${it.vocab.map((x, k) => `<div class="note"><div class="grow"><span class="term">${esc(x[0])}</span><div class="es">${esc(x[1])}</div>${x[2] ? `<div class="ex">${esc(x[2])}</div>` : ''}</div>
      <div style="display:flex;flex-direction:column;gap:6px"><button class="mini" data-say="${esc(x[0])}">${IC.speak}</button>${have.has(norm(x[0])) ? '<span class="tag good" style="text-align:center">✓</span>' : `<button class="mini" data-addv="${k}">${IC.plus}</button>`}</div></div>`).join('')}</div>
    ${it.questions.length ? '<div class="h2">Para hablar</div>' : ''}
    ${it.questions.map((q, k) => `<div class="card pad" style="margin-bottom:10px"><div class="ctx" style="font-size:18px">${esc(q)}</div><div class="row" style="margin-top:10px"><button class="btn small" data-say="${esc(q)}">${IC.speak.replace('<svg', '<svg width="16" height="16"')} Escuchar</button><button class="btn small primary" data-q="${k}">${IC.mic.replace('<svg', '<svg width="16" height="16"')} Responder en voz alta</button></div></div>`).join('')}
    <div class="h2">Practica con este texto</div>
    <div class="row wrap"><a class="btn grow" href="#ex/gap/${it.id}">Huecos</a><a class="btn grow" href="#ex/dict/${it.id}">Dictado</a><a class="btn grow" href="#ex/shadow/${it.id}">Shadowing</a><a class="btn grow" href="#ex/trans/${it.id}">Tradúcelo tú</a></div>
    <div class="art-end"><button class="btn primary block" id="doneBtn">${read.has(it.id) ? '✓ Ya la has leído' : 'He terminado de leer ✓'}</button>${nextCh ? `<a class="btn block" href="#read/${nextCh.id}">Siguiente capítulo ›</a>` : ''}</div>`;
  markKnown();
  reading = { id: it.id, start: Date.now() };
  $('#artBody').addEventListener('click', e => { const w = e.target.closest('.w'); if (w) openWord(+w.dataset.p, +w.dataset.t); });
  $('#hideTxt').onclick = () => { const b = $('#artBody'); b.classList.toggle('blurred'); $('#hideTxt').textContent = b.classList.contains('blurred') ? 'Mostrar texto' : 'Modo listening: ocultar texto'; };
  $('#view').onclick = e => {
    const s = e.target.closest('[data-say]'); if (s) { TTS.speak(s.dataset.say, { rate: 0.95 }); return; }
    const a = e.target.closest('[data-addv]'); if (a) { const x = it.vocab[+a.dataset.addv]; NOTES.unshift({ id: uid(), term: x[0], cat: guessCat(x[0]), es: x[1], ex: x[2] || '', def: '', note: '', src: it.headline, created: Date.now(), upd: Date.now(), srs: newSrs() }); saveNotes(); bump('saved'); a.outerHTML = '<span class="tag good" style="text-align:center">✓</span>'; toast('Guardada en tus notas'); return; }
    const q = e.target.closest('[data-q]'); if (q) { PENDING_PROMPT = it.questions[+q.dataset.q]; go('#ex/speak'); return; }
    const o = e.target.closest('[data-qz] .opt'); if (o) {
      const c = o.closest('[data-qz]'); if (c.dataset.done) return; c.dataset.done = 1;
      const qz = it.quiz[+c.dataset.qz]; const ok = +o.dataset.j === qz[2];
      $$('.opt', c).forEach(x => +x.dataset.j === qz[2] && x.classList.add('right')); if (!ok) o.classList.add('wrong');
      bump('ex'); if (ok) bump('ok');
    }
  };
  if ($('#txEdit')) $('#txEdit').onclick = () => openTextEditor(tx);
  $('#doneBtn').onclick = () => { if (!read.has(it.id)) { markRead(it); read.add(it.id); $('#doneBtn').textContent = '✓ Ya la has leído'; toast('¡Lectura completada!'); } };
  setupPlayer(paras);
}
function markRead(it) {
  if (HISTORY.some(h => h.id === it.id)) return;
  HISTORY.unshift({ id: it.id, title: it.headline, section: it.topic, readAt: Date.now() });
  store.set('history', HISTORY); bump('art');
}
function endReadingSession() {
  if (!reading) return;
  const sec = Math.min(3600, Math.round((Date.now() - reading.start) / 1000));
  if (sec > 5) bump('sec', sec);
  reading = null;
}
document.addEventListener('visibilitychange', () => {
  if (document.hidden) { if (reading) { const id = reading.id; endReadingSession(); reading = { id, start: Infinity }; } }
  else if (reading && reading.start === Infinity) reading.start = Date.now();
});

function setupPlayer(paras) {
  let idx = 0, playing = false, paused = false;
  const label = $('#pLabel'), btn = $('#pPlay');
  const els = $$('#artBody [data-pi]');
  const hl = i => { els.forEach(e => e.classList.remove('speaking')); if (els[i]) { els[i].classList.add('speaking'); els[i].scrollIntoView({ block: 'center', behavior: 'smooth' }); } };
  const next = () => {
    if (!playing) return;
    if (idx >= paras.length) { playing = false; btn.innerHTML = IC.play; label.textContent = 'Fin del artículo'; hl(-1); return; }
    hl(idx); label.textContent = 'Párrafo ' + (idx + 1) + ' de ' + paras.length;
    TTS.speak(paras[idx].text.replace(/^• /, ''), { onend: () => { if (playing && !paused) { idx++; next(); } }, onerror: () => {} });
  };
  btn.onclick = () => {
    if (!playing) { playing = true; paused = false; btn.innerHTML = IC.pause; next(); }
    else if (!paused) { paused = true; speechSynthesis.cancel(); btn.innerHTML = IC.play; label.textContent = 'En pausa · párrafo ' + (idx + 1); }
    else { paused = false; btn.innerHTML = IC.pause; next(); }
  };
  $('#pStop').onclick = () => { playing = false; paused = false; idx = 0; TTS.stop(); btn.innerHTML = IC.play; hl(-1); label.textContent = 'Escuchar el artículo (voz británica)'; };
  $('#pRate').onclick = () => {
    const rates = [0.8, 0.9, 0.95, 1, 1.1, 1.25];
    S.rate = rates[(rates.indexOf(S.rate) + 1) % rates.length] || 1; saveSettings();
    $('#pRate').textContent = S.rate + '×';
    if (playing && !paused) { speechSynthesis.cancel(); setTimeout(next, 80); }
  };
  // tocar un párrafo con doble toque para empezar desde ahí
  els.forEach((el, i) => el.addEventListener('dblclick', () => { idx = i; playing = true; paused = false; btn.innerHTML = IC.pause; TTS.stop(); setTimeout(next, 60); }));
}

/* ---------- panel de palabra ---------- */
const PARTICLES = new Set(['up', 'out', 'off', 'down', 'in', 'on', 'over', 'away', 'back', 'through', 'into', 'about', 'around', 'across', 'along', 'forward', 'apart', 'aside']);
let WSEL = null;

function sentenceOf(p, ti) {
  const pos = p.tokens[ti].s;
  return splitSentences(p.text).find(s => pos >= s.a && pos < s.b) || { s: p.text, a: 0, b: p.text.length };
}
function guessCat(term) {
  const w = termWords(term);
  if (w.length === 1) return 'vocab';
  if (w.length <= 3 && PARTICLES.has(w[1])) return 'phrasal';
  return 'idiom';
}
function openWord(pi, ti) {
  WSEL = { p: pi, a: ti, b: ti };
  paintWordSheet(true);
}
function selText() { const p = ART.paras[WSEL.p]; return p.text.slice(p.tokens[WSEL.a].s, p.tokens[WSEL.b].e); }
function paintSel() {
  $$('.w.sel').forEach(x => x.classList.remove('sel'));
  for (let i = WSEL.a; i <= WSEL.b; i++) { const el = $(`.w[data-p="${WSEL.p}"][data-t="${i}"]`); if (el) el.classList.add('sel'); }
}
function paintWordSheet(first) {
  const p = ART.paras[WSEL.p];
  const term = selText();
  const sent = sentenceOf(p, WSEL.a);
  const ctx = esc(sent.s).replace(new RegExp('\\b' + esc(term).replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '\\b'), '<b>$&</b>');
  const existing = NOTES.find(n => norm(n.term) === norm(term));
  const gl = (ART.item.vocab || []).find(x => { const tw = termWords(x[0]).filter(w => !FILLER.has(w)); return norm(x[0]) === norm(term) || tw.some(w => termWords(term).some(t => wordEq(t, w))); });
  paintSel();
  const html = `
    <div class="row"><h3 class="grow" id="wTerm">${esc(term)}</h3><button class="mini" id="wSpeak">${IC.speak}</button></div>
    <div class="row wrap" style="gap:6px;margin:6px 0 10px">
      <button class="btn small" id="wLeft" ${WSEL.a === 0 ? 'disabled' : ''}>◀ + palabra</button>
      <button class="btn small" id="wRight" ${WSEL.b >= p.tokens.length - 1 ? 'disabled' : ''}>+ palabra ▶</button>
      ${WSEL.b > WSEL.a ? '<button class="btn small" id="wShrink">− quitar</button>' : ''}
    </div>
    ${gl ? `<div class="box" style="background:var(--warm-soft);margin-bottom:8px"><div class="muted" style="font-size:12px;font-weight:700;margin-bottom:3px">EN ESTA NOTICIA</div><div style="font-size:17px;font-weight:700">${esc(gl[0])}</div><div style="font-size:16px">${esc(gl[1])}</div></div>` : ''}
    <div class="box"><div class="muted" style="font-size:12px;font-weight:700;margin-bottom:3px">EN ESPAÑOL</div><div id="wTr" style="font-size:18px;font-weight:600">…</div></div>
    <div id="wDef" style="margin-top:6px"></div>
    <label class="lbl">En contexto</label>
    <div class="box ctx">${ctx}</div>
    <div class="row" style="margin-top:8px;gap:8px"><button class="btn small" id="ctxSpeak">${IC.speak.replace('<svg', '<svg width="16" height="16"')} Escuchar frase</button><button class="btn small" id="ctxTr">Traducir frase</button></div>
    <div id="ctxTrOut" class="muted" style="margin-top:8px;font-size:15px"></div>
    <div style="margin-top:16px">${existing ? `<div class="notice">Ya está en tus notas (${esc(CATS[existing.cat] || '')}).</div><button class="btn block" id="wEdit">Ver o editar la nota</button>`
      : `<button class="btn primary block" id="wSave">${IC.plus.replace('<svg', '<svg width="18" height="18"')} Guardar en mis notas</button>`}</div>`;
  const mount = body => {
    $('#wSpeak', body).onclick = () => TTS.speak(term, { rate: Math.min(S.rate, 0.9) });
    $('#ctxSpeak', body).onclick = () => TTS.speak(sent.s);
    $('#ctxTr', body).onclick = async () => { $('#ctxTrOut').textContent = 'Traduciendo…'; $('#ctxTrOut').textContent = await translate(sent.s) || 'No se pudo traducir.'; };
    if ($('#wLeft', body)) $('#wLeft', body).onclick = () => { WSEL.a = Math.max(0, WSEL.a - 1); paintWordSheet(); };
    if ($('#wRight', body)) $('#wRight', body).onclick = () => { WSEL.b = Math.min(p.tokens.length - 1, WSEL.b + 1); paintWordSheet(); };
    if ($('#wShrink', body)) $('#wShrink', body).onclick = () => { WSEL.b = Math.max(WSEL.a, WSEL.b - 1); paintWordSheet(); };
    if ($('#wSave', body)) $('#wSave', body).onclick = () => openNoteEditor({ term: termWords(term).length === 1 ? term.toLowerCase() : term, cat: guessCat(term), es: (gl && termWords(gl[0]).length === termWords(term).length ? gl[1] : '') || $('#wTr').dataset.tr || '', ex: sent.s, src: ART.item.headline, srcId: ART.item.id, def: $('#wDef').dataset.def || '' });
    if ($('#wEdit', body)) $('#wEdit', body).onclick = () => openNoteEditor(existing);
    loadTranslation(term);
    if (termWords(term).length === 1) loadDefinition(term);
  };
  if (first || !$('#sheet').classList.contains('show')) openSheet(html, mount);
  else { $('#sheetBody').innerHTML = html; mount($('#sheetBody')); }
}
const trCache = {};
async function translate(text) {
  const k = norm(text); if (trCache[k]) return trCache[k];
  try {
    const r = await fetch('https://api.mymemory.translated.net/get?langpair=en|es&q=' + encodeURIComponent(text.slice(0, 480)));
    const j = await r.json();
    let t = j && j.responseData && j.responseData.translatedText;
    if (t && /MYMEMORY WARNING|QUERY LENGTH/i.test(t)) t = '';
    if (t) trCache[k] = t;
    return t || '';
  } catch (e) { return ''; }
}
async function loadTranslation(term) {
  const t = await translate(term);
  const el = $('#wTr'); if (!el || norm($('#wTerm').textContent) !== norm(term)) return;
  el.textContent = t || 'Sin conexión con el traductor';
  el.dataset.tr = t || '';
}
async function lookupDef(word) {
  const tries = [word.toLowerCase()]; const s = stem(word); if (s !== tries[0]) tries.push(s, s + 'e');
  for (const w of tries) {
    try {
      const r = await fetch('https://api.dictionaryapi.dev/api/v2/entries/en/' + encodeURIComponent(w));
      if (r.ok) { const j = await r.json(); if (Array.isArray(j) && j.length) return j[0]; }
    } catch (e) { return null; }
  }
  return null;
}
async function loadDefinition(term) {
  const el = $('#wDef'); if (!el) return;
  el.innerHTML = '<div class="muted" style="font-size:13px;margin-top:6px">Buscando definición…</div>';
  const d = await lookupDef(term);
  if (!$('#wDef') || norm($('#wTerm').textContent) !== norm(term)) return;
  if (!d) { el.innerHTML = ''; return; }
  const phon = d.phonetic || (d.phonetics || []).map(p => p.text).find(Boolean) || '';
  const defs = [];
  (d.meanings || []).forEach(m => (m.definitions || []).slice(0, 2).forEach(df => defs.length < 4 && defs.push({ pos: m.partOfSpeech, d: df.definition, ex: df.example })));
  el.dataset.def = defs[0] ? defs[0].d : '';
  el.innerHTML = `<div class="row" style="margin-top:8px"><b>${esc(d.word)}</b><span class="phon">${esc(phon)}</span></div>
    <ul class="defs">${defs.map(x => `<li><span class="pos">${esc(x.pos)}</span>${esc(x.d)}${x.ex ? `<div class="muted" style="font-style:italic;font-size:14px;margin-top:3px">“${esc(x.ex)}”</div>` : ''}</li>`).join('')}</ul>`;
}

/* ==========================================================
   FICHAS (ver mine.js)
   ========================================================== */
function newSrs() { return { due: Date.now(), ivl: 0, ef: 2.5, reps: 0, lapses: 0 }; }

/* ==========================================================
   REPETICIÓN ESPACIADA
   ========================================================== */
function isNew(n) { return !n.srs || (n.srs.reps === 0 && n.srs.lapses === 0); }
function dueNotes() {
  const now = Date.now();
  NOTES.forEach(n => { if (!n.srs) n.srs = newSrs(); });
  const old = NOTES.filter(n => !isNew(n) && n.srs.due <= now);
  const left = Math.max(0, (S.newNotesPerDay || 15) - (today().newSeen || 0));
  const fresh = NOTES.filter(n => isNew(n)).sort((a, b) => a.created - b.created).slice(0, left);
  return old.concat(fresh);
}
function grade(n, g) { // 0 otra vez, 1 difícil, 2 bien, 3 fácil
  if (!n.srs) { if (n.lib) startLearning(n); else n.srs = newSrs(); }
  const s = n.srs; s.upd = Date.now();
  if (!n.lib && isNew(n)) { const t = today(); t.newSeen = (t.newSeen || 0) + 1; saveStats(); }
  if (g === 0) { s.reps = 0; s.lapses++; s.ef = Math.max(1.3, s.ef - 0.2); s.ivl = 0; s.due = Date.now() + 10 * 60000; }
  else {
    s.reps++;
    if (s.reps === 1) s.ivl = g === 3 ? 4 : 1;
    else if (s.reps === 2) s.ivl = g === 1 ? 2 : g === 3 ? 7 : 4;
    else s.ivl = Math.max(1, Math.round(s.ivl * s.ef * (g === 1 ? 0.6 : g === 3 ? 1.3 : 1)));
    s.ef = Math.max(1.3, s.ef + (g === 1 ? -0.15 : g === 3 ? 0.1 : 0));
    const d = new Date(); d.setHours(4, 0, 0, 0); s.due = d.getTime() + s.ivl * DAY;
  }
  if (n.lib) saveLearn(); else saveNotes();
}
function dueCards() { const now = Date.now(); return dueNotes().concat(LIB.filter(x => x.srs && x.srs.due <= now)); }
function updateBadge() { const n = dueCards().length; const b = $('#dueBadge'); if (!b) return; b.textContent = n > 99 ? '99+' : n; b.classList.toggle('hidden', !n); }

/* ==========================================================
   PRACTICAR
   ========================================================== */
const MODES = [
  { id: 'review', ic: 'cards', name: 'Repaso', desc: 'Tarjetas de lo que estás aprendiendo' },
  { id: 'vocab', ic: 'quiz', name: 'Test de vocabulario', desc: 'Inglés, español y definiciones' },
  { id: 'particle', ic: 'link', name: 'Phrasal verbs', desc: '¿Qué partícula va? Up, out, off…' },
  { id: 'gram', ic: 'pen', name: 'Gramática', desc: 'Preguntas de todas las lecciones' },
  { id: 'gap', ic: 'gap', name: 'Huecos en contexto', desc: 'Elige la palabra que falta' },
  { id: 'cloze', ic: 'pen', name: 'Palabra que falta', desc: 'Escríbela tú (preposiciones, conectores…)' },
  { id: 'dict', ic: 'ear', name: 'Dictado', desc: 'Escucha y escribe' },
  { id: 'pair', ic: 'ear', name: 'Escucha y elige', desc: 'Distingue sonidos parecidos' },
  { id: 'order', ic: 'order', name: 'Ordena la frase', desc: 'Construye frases correctas' },
  { id: 'trans', ic: 'pen', name: 'Tradúcela tú', desc: 'Del español al inglés' },
  { id: 'prod', ic: 'cards', name: 'Producción', desc: 'Del español al inglés, en voz alta' },
  { id: 'say', ic: 'mic', name: 'Pronuncia', desc: 'El móvil te dice si te entiende' },
  { id: 'ear', ic: 'ear', name: 'Tarjetas de oído', desc: 'Reconoce tus palabras solo oyéndolas' },
  { id: 'fast', ic: 'ear', name: 'Inglés rápido', desc: 'Frases dichas a velocidad nativa' },
  { id: 'native', ic: 'spark', name: 'Dilo como un nativo', desc: 'Corrige frases que suenan traducidas' },
  { id: 'accent', ic: 'globe', name: 'Acentos', desc: '¿De dónde es esta voz?' },
  { id: 'shadow', ic: 'ear', name: 'Shadowing', desc: 'Escucha, repite y grábate. La mejor forma de mejorar pronunciación y ritmo', wide: true },
  { id: 'speak', ic: 'mic', name: 'Speaking', desc: 'Habla un minuto sobre una pregunta y escúchate', wide: true }
];
function renderPractice() {
  const due = dueCards().length; const t = today();
  $('#view').innerHTML = `
    <div class="h1">Practicar</div>
    <p class="sub">Los ejercicios se crean al momento con todo el contenido de la app y con tus notas, así que nunca se acaban.</p>
    ${due ? `<a class="card pad cta" href="#ex/review" style="border-color:var(--warm)"><div class="grow"><b>Tienes ${due} ${due === 1 ? 'repaso' : 'repasos'} pendientes</b><div class="muted" style="font-size:14px">Hazlos hoy para que no se te olviden</div></div><span class="btn warm small">Empezar</span></a>` : ''}
    <div class="modes">${MODES.map(m => `<button class="mode ${m.wide ? 'wide' : ''}" data-m="${m.id}"><div class="ico">${IC[m.ic]}</div><div><b>${m.name}</b><br><span>${m.desc}</span></div></button>`).join('')}</div>
    <div class="h2">Lo tuyo</div>
    <div class="mysets">${[['set:mine', '✎', 'Mis palabras', NOTES.length], ['fav', '★', 'Favoritas', setItems('fav').length], ['unknown', '✗', 'No me la sé', setItems('unknown').length], ['hard', '!', 'Difíciles', setItems('hard').length]].concat(LISTS.map(L => ['list:' + L.id, '▤', L.name, L.items.length])).concat(LABELS.map(L => ['label:' + L.id, '●', L.name, setItems('label:' + L.id).length])).map(([k, ic, n, c]) => `<div class="myset ${c < 2 ? 'off' : ''}"><span class="mkbig">${ic}</span><div class="grow"><b>${esc(n)}</b><div class="muted" style="font-size:13px">${c} ${c === 1 ? 'entrada' : 'entradas'}</div></div>${c >= 2 ? `<a class="btn small" href="#ex/vocab/${k}">Test</a><a class="btn small" href="#ex/review/${k}">Tarjetas</a>` : ''}</div>`).join('')}</div>
    <div class="h2">Inglés jurídico y de negocios</div>
    <div class="modes"><button class="mode" data-m="vocab/business"><div class="ico" style="background:var(--warm-soft);color:var(--warm)">${IC.chat}</div><b>Test de negocios</b><span>Finanzas, reuniones y correos</span></button><button class="mode" data-m="vocab/false"><div class="ico">${IC.quiz}</div><b>Falsos amigos</b><span>Actually, eventually, sensible…</span></button></div>
    <div class="modes" style="margin-top:10px"><button class="mode" data-m="vocab/legal"><div class="ico" style="background:var(--warm-soft);color:var(--warm)">${IC.scale}</div><b>Test jurídico</b><span>Términos de todas las áreas</span></button>
      <button class="mode" data-m="gap/legal"><div class="ico" style="background:var(--warm-soft);color:var(--warm)">${IC.gap}</div><b>Huecos jurídicos</b><span>Frases del despacho y los tribunales</span></button></div>
    <p class="meta" style="margin-top:16px">Hoy · ${t.ex || 0} ejercicios · ${t.rev || 0} repasos</p>`;
  $('#view').onclick = e => { const b = e.target.closest('.mode'); if (b) go('#ex/' + b.dataset.m); };
}

const STOP = new Set('a an the and or but if of to in on at by for with from as is are was were be been being have has had do does did not no it its this that these those there their they them he she his her we our you your i me my mine us who whom whose which what when where why how than then so such very can could will would shall should may might must also just only even more most less much many some any all each other into over under about after before between through during up down out off again further once here both few own same too s t said says say mr mrs ms'.split(' '));
const FUNC_WORDS = ['in', 'on', 'at', 'of', 'for', 'to', 'with', 'by', 'from', 'which', 'whose', 'whom', 'although', 'despite', 'unless', 'whether', 'such', 'so', 'as', 'than', 'whereas', 'however', 'though', 'since', 'until', 'while', 'because', 'if', 'what', 'who', 'where', 'when', 'its', 'their', 'there', 'been', 'being', 'had', 'has', 'would', 'could', 'should', 'might', 'any', 'some', 'few', 'little', 'much', 'many', 'every', 'each', 'enough', 'too', 'even', 'only', 'yet', 'still', 'already', 'against', 'among', 'between', 'without', 'within', 'into', 'onto', 'upon', 'about', 'over', 'under', 'whereby', 'not', 'nor', 'neither', 'either', 'unlike', 'like', 'own', 'rather', 'instead', 'order', 'spite', 'regardless', 'apart', 'whatever', 'whoever', 'however'];
const FUNC_SET = new Set(FUNC_WORDS);

function sentencePool(srcId) {
  if (!POOL.length) buildPool();
  let p = srcId === 'legal' ? POOL.filter(x => x.legal) : srcId ? POOL.filter(x => x.id === srcId) : POOL;
  if (!p.length) p = POOL;
  return p;
}
function isSetKey(a) { return a && (a.startsWith('set:') || a.startsWith('list:') || a.startsWith('label:') || a.startsWith('cat:') || a.startsWith('phr:') || !!SETS[a]); }
function setFromArg(a) { return setItems(a.startsWith('set:') ? a.slice(4) : a); }
function vocabPool(arg) {
  if (arg === 'legal') return LIB.filter(x => x.cat === 'legal');
  if (arg === 'business') return LIB.filter(x => x.cat === 'business');
  if (arg === 'false') return LIB.filter(x => x.cat === 'false');
  if (isSetKey(arg)) return setFromArg(arg).filter(x => x.es);
  if (arg === 'today') { const t0 = new Date(); t0.setHours(0, 0, 0, 0); const a = LIB.filter(x => x.srs && x.srs.added >= t0.getTime() && !x.srs.known); if (a.length >= 4) return a; }
  const mine = LIB.filter(x => x.srs).concat(NOTES.filter(n => n.es));
  return mine.length >= 12 ? mine : mine.concat(shuffle(LIB.filter(x => !x.srs)).slice(0, 40));
}
function wordClass(w) {
  w = w.toLowerCase();
  if (w.endsWith('ly')) return 'ly'; if (w.endsWith('ing')) return 'ing'; if (w.endsWith('ed')) return 'ed';
  if (/(tion|sion|ment|ness|ity|ance|ence)$/.test(w)) return 'n'; if (/(ous|ive|able|ible|al|ful|less|ic)$/.test(w)) return 'adj';
  if (w.endsWith('s')) return 's'; return 'x' + Math.min(10, w.length);
}
let WORDBANK = null;
function wordBank() {
  if (WORDBANK && WORDBANK.n === POOL.length) return WORDBANK.m;
  const m = {};
  sentencePool().forEach(x => tokenize(x.s).forEach(t => {
    const w = t.w; if (w.length < 5 || STOP.has(w.toLowerCase()) || /^[A-Z]/.test(w)) return;
    const c = wordClass(w); (m[c] = m[c] || new Set()).add(w.toLowerCase());
  }));
  WORDBANK = { n: POOL.length, m }; return m;
}

function genGap(srcId) {
  const pool = sentencePool(srcId);
  for (let tries = 0; tries < 40; tries++) {
    const it = pick(pool);
    const toks = tokenize(it.s);
    // ¿contiene alguna nota del usuario?
    if (NOTES.length && Math.random() < 0.5) {
      for (const n of shuffle(NOTES).slice(0, 60)) {
        const tw = termWords(n.term).filter(w => !FILLER.has(w)); if (tw.length !== 1) continue;
        const ti = toks.findIndex(t => wordEq(t.w, tw[0]));
        if (ti >= 0) { const q = buildGap(it, toks, ti); if (q) return q; }
      }
    }
    const cand = toks.map((t, i) => i).filter(i => i > 0 && toks[i].w.length >= 5 && !STOP.has(toks[i].w.toLowerCase()) && !/^[A-Z]/.test(toks[i].w) && !/['’-]/.test(toks[i].w));
    if (!cand.length) continue;
    const q = buildGap(it, toks, pick(cand)); if (q) return q;
  }
  return null;
}
function buildGap(it, toks, ti) {
  const ans = toks[ti].w, al = ans.toLowerCase();
  const wb = wordBank(); const cls = wordClass(ans);
  let pool = Array.from(wb[cls] || []).filter(w => w !== al && !wordEq(w, al));
  if (pool.length < 3) pool = pool.concat(...Object.values(wb).map(s => Array.from(s))).filter(w => w !== al && !wordEq(w, al));
  const distract = shuffle(Array.from(new Set(pool))).slice(0, 3);
  if (distract.length < 3) return null;
  return { type: 'gap', it, before: it.s.slice(0, toks[ti].s), after: it.s.slice(toks[ti].e), answer: ans, options: shuffle([al].concat(distract)) };
}
function genCloze(srcId) {
  const pool = sentencePool(srcId);
  for (let tries = 0; tries < 60; tries++) {
    const it = pick(pool); const toks = tokenize(it.s);
    const cand = toks.map((t, i) => i).filter(i => i > 0 && FUNC_SET.has(toks[i].w.toLowerCase()));
    if (!cand.length) continue;
    const ti = pick(cand);
    return { type: 'cloze', it, before: it.s.slice(0, toks[ti].s), after: it.s.slice(toks[ti].e), answer: toks[ti].w };
  }
  return null;
}
function genOrder(srcId) {
  const pool = sentencePool(srcId).filter(x => { const n = x.s.split(/\s+/).length; return n >= 6 && n <= 15; });
  if (!pool.length) return null;
  const it = pick(pool);
  const words = it.s.replace(/[.!?]+["”’)]*$/, '').split(/\s+/);
  let sh = shuffle(words); let g = 0; while (sh.join(' ') === words.join(' ') && g++ < 5) sh = shuffle(words);
  return { type: 'order', it, words, shuffled: sh.map((w, i) => ({ w, i })) };
}
function genDict(srcId) {
  const pool = sentencePool(srcId).filter(x => { const n = x.s.split(/\s+/).length; return n >= 6 && n <= 20; });
  if (!pool.length) return null;
  return { type: 'dict', it: pick(pool) };
}
function genVocab(arg) {
  const vp = vocabPool(arg); if (vp.length < 2) return null;
  const item = pick(vp);
  let pool = vp.length >= 6 ? vp : vp.concat(LIB);
  const same = pool.filter(x => x !== item && x.cat === item.cat && norm(x.es) !== norm(item.es) && norm(x.term) !== norm(item.term));
  const others = shuffle(same.length >= 3 ? same : pool.filter(x => x !== item && norm(x.es) !== norm(item.es))).slice(0, 3);
  if (others.length < 3) return null;
  const r = Math.random();
  if (item.def && r < 0.34) return { type: 'vocab', item, prompt: item.def, sub: '¿Qué palabra o expresión es?', answer: item.term, options: shuffle([item.term].concat(others.map(o => o.term))), long: true };
  return r < 0.67
    ? { type: 'vocab', item, prompt: item.es, sub: '¿Cómo se dice en inglés?', answer: item.term, options: shuffle([item.term].concat(others.map(o => o.term))) }
    : { type: 'vocab', item, prompt: item.term, sub: '¿Qué significa?', answer: item.es, options: shuffle([item.es].concat(others.map(o => o.es))), say: true };
}

/* ---------- motor de sesiones ---------- */
let SESSION = null;
function startExercise(arg) {
  const [mode, ...r] = arg.split('/'); const srcId = r.join('/') || null;
  if (mode === 'review') return startReview(srcId);
  if (mode === 'speak') return startSpeaking(srcId);
  if (mode === 'shadow') return startShadow(srcId);
  if (window.EXTRA_STARTS && EXTRA_STARTS[mode]) return EXTRA_STARTS[mode](srcId);
  const gen = (window.EXTRA_GENS && EXTRA_GENS[mode]) || { gap: genGap, cloze: genCloze, order: genOrder, dict: genDict, vocab: genVocab, trans: genTrans, gram: genGram, pair: genPair, particle: genParticle }[mode];
  if (!gen) return go('#practice');
  SESSION = { mode, srcId, gen, n: 0, total: S.exLen || 10, ok: 0 };
  nextQ();
}
const MODE_TITLE_BASE = { gap: 'Huecos en contexto', cloze: 'Palabra que falta', order: 'Ordena la frase', dict: 'Dictado', vocab: 'Test de vocabulario', trans: 'Tradúcela tú', gram: 'Gramática', pair: 'Escucha y elige', particle: 'Phrasal verbs' };
const MODE_TITLE = new Proxy(MODE_TITLE_BASE, { get: (o, k) => o[k] || (window.EXTRA_TITLES || {})[k] || 'Práctica' });
function exHeader() {
  return `<div class="row" style="margin-bottom:8px"><b class="grow">${MODE_TITLE[SESSION.mode]}${SESSION.srcId === 'legal' ? ' · jurídico' : SESSION.srcId === 'business' ? ' · negocios' : SESSION.srcId === 'false' ? ' · falsos amigos' : isSetKey(SESSION.srcId) ? ' · ' + esc(setName(SESSION.srcId.replace(/^set:/, ''))) : SESSION.srcId === 'today' ? ' · palabras de hoy' : SESSION.srcId && !['gram', 'pair'].includes(SESSION.mode) ? ' · este texto' : ''}</b><span class="muted">${SESSION.n + 1}/${SESSION.total}</span></div>
    <div class="progressbar"><i style="width:${(SESSION.n / SESSION.total) * 100}%"></i></div>`;
}
async function nextQ() {
  if (SESSION.n >= SESSION.total) return endSession();
  if (SESSION.mode === 'trans') $('#view').innerHTML = exHeader() + '<div class="spinner"></div>';
  const sess = SESSION;
  const q = await SESSION.gen(SESSION.srcId);
  if (sess !== SESSION || !location.hash.startsWith('#ex/')) return;
  if (!q && SESSION.mode === 'accent') { $('#view').innerHTML = `<div class="empty">Este dispositivo no tiene instaladas voces de varios acentos. En el iPhone puedes añadirlas en Ajustes › Accesibilidad › Contenido leído › Voces › Inglés.</div><a class="btn block" href="#accents">Volver</a>`; return; }
  if (!q) { $('#view').innerHTML = `<div class="empty">Aún no hay suficiente material para este ejercicio.<br>Lee algún artículo o añade notas y vuelve a intentarlo.</div><a class="btn block" href="#practice">Volver</a>`; return; }
  SESSION.q = q;
  (({ gap: renderGapQ, cloze: renderClozeQ, order: renderOrderQ, dict: renderDictQ, vocab: renderVocabQ, trans: renderTransQ, gram: renderGramQ, pair: renderPairQ, particle: renderParticleQ })[q.type] || EXTRA_RENDER[q.type])(q);
}
function answered(ok, extraHTML) {
  SESSION.ok += ok ? 1 : 0; bump('ex'); if (ok) bump('ok');
  const q = SESSION.q;
  const src = q.it ? `<div class="meta" style="margin-top:6px">${esc(q.it.src)}</div>` : '';
  const fb = document.createElement('div');
  fb.innerHTML = `<div class="feedback ${ok ? 'ok' : 'ko'}"><b>${ok ? '¡Correcto!' : 'No es correcto'}</b>${extraHTML || ''}${src}</div>
    <div class="row" style="margin-top:12px">${q.it ? `<button class="btn" id="fbSay">${IC.speak.replace('<svg', '<svg width="18" height="18"')}</button>` : ''}${q.type === 'gap' || q.type === 'cloze' ? `<button class="btn" id="fbSave">Guardar palabra</button>` : ''}<button class="btn primary grow" id="nextBtn">Siguiente</button></div>`;
  $('#qArea').appendChild(fb);
  if ($('#fbSay')) $('#fbSay').onclick = () => TTS.speak(q.it.s);
  if ($('#fbSave')) $('#fbSave').onclick = () => openNoteEditor({ term: q.answer.toLowerCase(), cat: 'vocab', ex: q.it.s, src: q.it.src, srcId: q.it.id });
  $('#nextBtn').onclick = () => { SESSION.n++; nextQ(); };
  fb.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}
function endSession() {
  if (SESSION.mode === 'gram' && SESSION.srcId) { GPROG[SESSION.srcId] = Math.max(GPROG[SESSION.srcId] || 0, SESSION.ok); store.set('gprog', GPROG); }
  const pct = Math.round(SESSION.ok / SESSION.total * 100);
  $('#view').innerHTML = `<div class="card pad" style="text-align:center;padding:30px 18px">
    <div class="muted">${MODE_TITLE[SESSION.mode]}</div><div style="font-family:var(--serif);font-size:54px;font-weight:700;color:${pct >= 70 ? 'var(--good)' : 'var(--warm)'}">${SESSION.ok}/${SESSION.total}</div>
    <p>${pct >= 90 ? 'Excelente.' : pct >= 70 ? 'Muy bien, sigue así.' : pct >= 50 ? 'Bien, pero hay margen.' : 'Toca repasar un poco más.'}</p>
    <button class="btn primary block" id="again">Otra ronda</button><a class="btn block ghost" href="#practice" style="margin-top:8px">Volver a ejercicios</a></div>`;
  $('#again').onclick = () => { SESSION.n = 0; SESSION.ok = 0; SESSION.gq = null; nextQ(); };
}
function renderGapQ(q) {
  $('#view').innerHTML = `${exHeader()}<div id="qArea"><p class="muted" style="margin:16px 0 0">Elige la palabra que falta</p>
    <div class="q">${esc(q.before)}<span class="gap">?</span>${esc(q.after)}</div>
    <div class="opts">${q.options.map(o => `<button class="opt" data-o="${esc(o)}">${esc(o)}</button>`).join('')}</div></div>`;
  $$('.opt').forEach(b => b.onclick = () => {
    if ($('.opt.right')) return;
    const ok = b.dataset.o === q.answer.toLowerCase();
    $$('.opt').forEach(x => { if (x.dataset.o === q.answer.toLowerCase()) x.classList.add('right'); });
    if (!ok) b.classList.add('wrong');
    $('.gap').textContent = q.answer;
    answered(ok);
  });
}
function renderClozeQ(q) {
  $('#view').innerHTML = `${exHeader()}<div id="qArea"><p class="muted" style="margin:16px 0 0">Escribe UNA palabra que complete la frase</p>
    <div class="q">${esc(q.before)}<span class="gap">?</span>${esc(q.after)}</div>
    <form id="clForm" class="row"><input class="input grow" id="clIn" autocomplete="off" autocapitalize="off" autocorrect="off" spellcheck="false" placeholder="Tu respuesta"><button class="btn primary">Comprobar</button></form>
    <button class="btn small ghost" id="clHint" style="margin-top:8px">Pista</button><span id="hintOut" class="muted" style="margin-left:6px"></span></div>`;
  setTimeout(() => $('#clIn').focus(), 100);
  $('#clHint').onclick = () => { $('#hintOut').textContent = 'Empieza por «' + q.answer[0].toLowerCase() + '» y tiene ' + q.answer.length + ' letras'; };
  $('#clForm').onsubmit = e => {
    e.preventDefault(); if ($('.feedback')) return;
    const v = norm($('#clIn').value); if (!v) return;
    const ok = v === norm(q.answer);
    $('.gap').textContent = q.answer;
    $('#clForm').querySelector('button').disabled = true;
    answered(ok, ok ? '' : `<div>La palabra original era <b>${esc(q.answer)}</b>. Has escrito «${esc($('#clIn').value)}». A veces hay más de una respuesta válida.</div><button class="btn small" id="override" style="margin-top:8px">Mi respuesta también vale</button>`);
    if ($('#override')) $('#override').onclick = () => { SESSION.ok++; bump('ok'); $('#override').replaceWith(Object.assign(document.createElement('span'), { textContent: ' ✓ Contada como correcta' })); };
  };
}
function renderOrderQ(q) {
  const chosen = [];
  $('#view').innerHTML = `${exHeader()}<div id="qArea"><p class="muted" style="margin:16px 0 8px">Toca las palabras en el orden correcto</p>
    <div class="words" id="ordAns"></div><div class="words" id="ordPool" style="border-style:solid">${q.shuffled.map((x, k) => `<button class="wchip" data-k="${k}">${esc(x.w)}</button>`).join('')}</div>
    <div class="row"><button class="btn" id="ordReset">Borrar</button><button class="btn primary grow" id="ordCheck">Comprobar</button></div></div>`;
  const paint = () => {
    $('#ordAns').innerHTML = chosen.map((k, i) => `<button class="wchip" data-i="${i}">${esc(q.shuffled[k].w)}</button>`).join('');
    $$('#ordPool .wchip').forEach(b => b.classList.toggle('used', chosen.includes(+b.dataset.k)));
  };
  $('#ordPool').onclick = e => { const b = e.target.closest('.wchip'); if (!b || $('.feedback')) return; chosen.push(+b.dataset.k); paint(); };
  $('#ordAns').onclick = e => { const b = e.target.closest('.wchip'); if (!b || $('.feedback')) return; chosen.splice(+b.dataset.i, 1); paint(); };
  $('#ordReset').onclick = () => { if ($('.feedback')) return; chosen.length = 0; paint(); };
  $('#ordCheck').onclick = () => {
    if ($('.feedback') || chosen.length < q.words.length) { if (!$('.feedback')) toast('Usa todas las palabras'); return; }
    const user = chosen.map(k => q.shuffled[k].w).join(' ');
    const ok = norm(user) === norm(q.words.join(' '));
    answered(ok, ok ? '' : `<div class="ctx" style="margin-top:6px">${esc(q.it.s)}</div>`);
  };
}
function lcsDiff(a, b) { // a = original, b = usuario (arrays)
  const m = a.length, n = b.length, d = Array.from({ length: m + 1 }, () => new Array(n + 1).fill(0));
  for (let i = m - 1; i >= 0; i--) for (let j = n - 1; j >= 0; j--) d[i][j] = norm(a[i]) === norm(b[j]) ? d[i + 1][j + 1] + 1 : Math.max(d[i + 1][j], d[i][j + 1]);
  const out = []; let i = 0, j = 0;
  while (i < m && j < n) { if (norm(a[i]) === norm(b[j])) { out.push(['ok', a[i]]); i++; j++; } else if (d[i + 1][j] >= d[i][j + 1]) { out.push(['add', a[i]]); i++; } else { out.push(['miss', b[j]]); j++; } }
  while (i < m) out.push(['add', a[i++]]); while (j < n) out.push(['miss', b[j++]]);
  return { out, score: d[0][0] / Math.max(1, m) };
}
function renderDictQ(q) {
  $('#view').innerHTML = `${exHeader()}<div id="qArea"><p class="muted" style="margin:16px 0 8px">Escucha la frase y escríbela</p>
    <div class="row" style="justify-content:center;gap:12px;margin:14px 0"><button class="btn primary" id="dPlay">${IC.play.replace('<svg', '<svg width="18" height="18"')} Escuchar</button><button class="btn" id="dSlow">🐢 Lento</button></div>
    <textarea class="textarea" id="dIn" autocomplete="off" autocapitalize="sentences" spellcheck="false" placeholder="Escribe lo que oyes…"></textarea>
    <button class="btn primary block" id="dCheck" style="margin-top:10px">Comprobar</button></div>`;
  $('#dPlay').onclick = () => TTS.speak(q.it.s);
  $('#dSlow').onclick = () => TTS.speak(q.it.s, { rate: 0.7 });
  setTimeout(() => TTS.speak(q.it.s), 300);
  $('#dCheck').onclick = () => {
    if ($('.feedback')) return;
    const a = tokenize(q.it.s).map(t => t.w), b = tokenize($('#dIn').value).map(t => t.w);
    if (!b.length) return;
    const { out, score } = lcsDiff(a, b);
    const ok = score >= 0.9 && b.length <= a.length + 1;
    answered(ok, `<div class="diff ctx" style="margin-top:6px">${out.map(([k, w]) => `<span class="${k}">${esc(w)}</span>`).join(' ')}</div><div class="muted" style="font-size:13px;margin-top:6px">${Math.round(score * 100)}% de palabras correctas · <span style="color:var(--warm);font-weight:700">naranja</span> = te faltó · <s>tachado</s> = sobra o mal escrito</div>`);
  };
}
function renderVocabQ(q) {
  $('#view').innerHTML = `${exHeader()}<div id="qArea"><p class="muted" style="margin:16px 0 0">${esc(q.sub)}</p>
    <div class="row"><div class="q grow" style="font-weight:${q.long ? 500 : 700};${q.long ? 'font-size:19px' : ''}">${esc(q.prompt)}</div>${q.say ? `<button class="mini" id="vSay">${IC.speak}</button>` : ''}</div>
    <div class="opts">${q.options.map(o => `<button class="opt" data-o="${esc(o)}">${esc(o)}</button>`).join('')}</div></div>`;
  if ($('#vSay')) $('#vSay').onclick = () => TTS.speak(q.prompt, { rate: 0.9 });
  $$('.opt').forEach(b => b.onclick = () => {
    if ($('.opt.right')) return;
    const ok = b.dataset.o === q.answer;
    $$('.opt').forEach(x => { if (x.dataset.o === q.answer) x.classList.add('right'); });
    if (!ok) b.classList.add('wrong');
    if (q.item.srs && !ok) grade(q.item, 0);
    answered(ok, `<div style="margin-top:4px"><b>${esc(q.item.term)}</b> · ${esc(q.item.es)}</div>${q.item.def ? `<div class="muted" style="font-size:14px">${esc(q.item.def)}</div>` : ''}${q.item.ex ? `<div class="ctx muted" style="margin-top:4px">${esc(q.item.ex)}</div>` : ''}`);
  });
}

/* ---------- repaso con tarjetas ---------- */
function startReview(arg) {
  const v = $('#view');
  const setMode = isSetKey(arg);
  const ALLC = setMode ? setFromArg(arg) : NOTES.concat(LIB.filter(x => x.srs));
  if (setMode && !ALLC.length) { v.innerHTML = `<div class="empty">No hay nada que repasar en «${esc(setName(arg.replace(/^set:/, '')))}».</div><a class="btn block" href="#mine">Volver</a>`; return; }
  if (!ALLC.length) { v.innerHTML = `<div class="card pad empty">Todavía no estás aprendiendo nada.<br><br>Empieza con tus palabras nuevas de hoy.</div><a class="btn primary block" href="#new">Palabras nuevas de hoy</a>`; return; }
  let queue = setMode ? shuffle(ALLC) : shuffle(dueCards()); let extra = false;
  if (!queue.length) { queue = shuffle(ALLC).slice(0, 15); extra = true; }
  let done = 0; const total = queue.length;
  const show = () => {
    if (!queue.length) {
      v.innerHTML = `<div class="card pad" style="text-align:center;padding:30px"><div style="font-size:46px">✓</div><b>Repaso terminado</b><p class="muted">${done} tarjetas repasadas. Las próximas aparecerán cuando toque.</p><a class="btn primary block" href="#practice">Volver</a></div>`; updateBadge(); return;
    }
    const n = queue[0];
    const sr = n.srs || newSrs();
    const front = S.cardFront === 'mix' ? (Math.random() < 0.5 ? 'es' : 'en') : (S.cardFront === 'es' && n.es ? 'es' : 'en');
    v.innerHTML = `<div class="row" style="margin-bottom:8px"><b class="grow">${setMode ? esc(setName(arg.replace(/^set:/, ''))) : 'Repaso' + (extra ? ' extra' : '')}</b><span class="muted">${done + 1}/${total}</span></div><div class="progressbar"><i style="width:${done / total * 100}%"></i></div>
      ${extra && done === 0 ? '<div class="notice" style="margin-top:12px">No tienes repasos pendientes hoy. Aquí van unas cuantas tarjetas extra.</div>' : ''}
      <div class="card flash" style="margin-top:14px" id="card"><div class="row" style="width:100%;justify-content:center;gap:6px"><span class="tag">${esc(CATS[n.cat] || '')}</span>${markBadges(n.id)}</div>${front === 'es' ? `<div class="term" style="margin-top:10px;font-size:24px">${esc(n.es || n.term)}</div><div class="muted" style="font-size:13px;margin-top:6px">¿Cómo se dice en inglés?</div>` : `<div class="term" style="margin-top:10px">${esc(n.term)}</div><button class="mini" id="cSay" style="margin-top:10px">${IC.speak}</button>`}
      <div id="back" class="back hidden">${front === 'es' ? `<div class="term" style="font-size:24px">${esc(n.term)}</div><button class="mini" id="cSay2" style="margin:6px auto">${IC.speak}</button>` : `<div style="font-size:19px;font-weight:600">${esc(n.es || '—')}</div>`}${n.def ? `<div class="muted" style="margin-top:6px;font-size:15px">${esc(n.def)}</div>` : ''}${n.ex ? `<div class="ctx muted" style="margin-top:8px;font-style:italic">${esc(n.ex)}</div>` : ''}${n.note ? `<div class="muted" style="margin-top:6px;font-size:14px">📝 ${esc(n.note)}</div>` : ''}</div></div>
      <button class="btn primary block" id="reveal" style="margin-top:14px">Mostrar respuesta</button>
      <div class="row" style="justify-content:center;margin-top:10px;gap:8px"><button class="btn small" id="cFav">★</button><button class="btn small" id="cMark">${IC.flag.replace('<svg', '<svg width="14" height="14"')} Marcar</button></div>
      <div class="grades hidden" id="grades">
        <button class="btn" data-g="0" style="color:var(--bad)">Otra vez<small>10 min</small></button>
        <button class="btn" data-g="1">Difícil<small>${sr.reps ? 'poco' : '1 día'}</small></button>
        <button class="btn" data-g="2" style="color:var(--good)">Bien<small>${sr.reps ? Math.max(1, Math.round((sr.ivl || 1) * sr.ef)) + ' d' : '1 día'}</small></button>
        <button class="btn" data-g="3" style="color:var(--accent)">Fácil<small>${sr.reps ? Math.max(2, Math.round((sr.ivl || 1) * sr.ef * 1.3)) + ' d' : '4 días'}</small></button></div>`;
    if ($('#cSay')) $('#cSay').onclick = e => { e.stopPropagation(); TTS.speak(n.term, { rate: 0.9 }); };
    if ($('#cSay2')) $('#cSay2').onclick = e => { e.stopPropagation(); TTS.speak(n.term, { rate: 0.9 }); };
    if (front === 'en' && S.autoplay) TTS.speak(n.term, { rate: 0.9 });
    $('#cFav').onclick = () => { setMark(n.id, { fav: !mark(n.id).fav }); toast(mark(n.id).fav ? 'Añadida a favoritas' : 'Quitada de favoritas'); };
    $('#cMark').onclick = () => openMarkSheet(n.id);
    const rev = () => { $('#back').classList.remove('hidden'); $('#reveal').classList.add('hidden'); $('#grades').classList.remove('hidden'); if (front === 'es' && S.autoplay) TTS.speak(n.term, { rate: 0.9 }); };
    $('#reveal').onclick = rev; $('#card').onclick = rev;
    $('#grades').onclick = e => {
      const b = e.target.closest('[data-g]'); if (!b) return;
      const g = +b.dataset.g; grade(n, g); bump('rev'); queue.shift();
      if (g === 0) queue.splice(Math.min(queue.length, 3), 0, n); else done++;
      show();
    };
  };
  show();
}

/* ---------- speaking ---------- */
let REC = null;
function stopRecording() { if (REC) { try { if (REC.mr && REC.mr.state !== 'inactive') REC.mr.stop(); } catch (e) {} try { REC.stream && REC.stream.getTracks().forEach(t => t.stop()); } catch (e) {} try { REC.sr && REC.sr.stop(); } catch (e) {} clearInterval(REC.timer); REC = null; } }
function startSpeaking(srcId) {
  let prompt, sub = 'Habla durante 1 minuto. Intenta usar alguna expresión de tus notas.';
  const art = srcId ? (window.READINGS || []).find(r => r.id === srcId) : null;
  if (PENDING_PROMPT) { prompt = PENDING_PROMPT; PENDING_PROMPT = null; }
  else if (art) prompt = 'Summarise the story “' + art.headline + '” in your own words and give your opinion.';
  else if (HISTORY.length && Math.random() < 0.35) { const h = pick(HISTORY.slice(0, 10)); prompt = 'Explain the main points of “' + h.title + '” and say what you think about it.'; }
  else prompt = pick(window.SPEAKING_PROMPTS);
  const useful = shuffle(NOTES.filter(n => ['linker', 'idiom', 'colloc', 'phrasal', 'convo'].includes(n.cat))).slice(0, 4);
  const sugg = useful.length ? useful : shuffle(LIB.filter(b => ['linker', 'convo', 'idiom'].includes(b.cat))).slice(0, 4);
  $('#view').innerHTML = `<b>Speaking</b><div class="card pad" style="margin-top:10px"><div class="q" style="margin:0">${esc(prompt)}</div>
    <button class="btn small" id="spSay" style="margin-top:6px">${IC.speak.replace('<svg', '<svg width="16" height="16"')} Escuchar pregunta</button></div>
    <p class="muted" style="font-size:14px;margin:10px 0 4px">${esc(sub)}</p>
    <div class="row wrap" style="gap:6px">${sugg.map(s => `<span class="chip" style="font-size:13px">${esc(s.term)}</span>`).join('')}</div>
    <div class="timer" id="spTimer" style="margin-top:16px">1:00</div>
    <button class="rec" id="recBtn" aria-label="Grabar">${IC.mic}</button>
    <p class="muted" style="text-align:center;font-size:13px;margin:0" id="recHint">Toca para empezar a grabar</p>
    <div id="spOut" style="margin-top:14px"></div>
    <div class="row" style="margin-top:16px"><button class="btn grow" id="spNew">Otra pregunta</button><a class="btn grow" href="#practice">Salir</a></div>`;
  $('#spSay').onclick = () => TTS.speak(prompt);
  $('#spNew').onclick = () => { stopRecording(); PENDING_PROMPT = null; startSpeaking(null); };
  $('#recBtn').onclick = () => REC ? finishRec() : beginRec();
  async function beginRec() {
    if (!navigator.mediaDevices || !window.MediaRecorder) { toast('Este navegador no permite grabar audio'); return; }
    let stream; try { stream = await navigator.mediaDevices.getUserMedia({ audio: true }); } catch (e) { toast('Necesito permiso para usar el micrófono'); return; }
    const chunks = []; const mr = new MediaRecorder(stream);
    mr.ondataavailable = e => e.data.size && chunks.push(e.data);
    mr.onstop = () => {
      if (!$('#spOut')) return;
      const blob = new Blob(chunks, { type: mr.mimeType || 'audio/mp4' });
      const url = URL.createObjectURL(blob);
      const tr = REC_TEXT.trim();
      $('#spOut').innerHTML = `<div class="card pad"><b>Tu grabación</b><audio controls src="${url}" style="width:100%;margin-top:8px"></audio>
        ${tr ? `<label class="lbl">Lo que ha entendido el móvil</label><div class="box ctx">${esc(tr)}</div><p class="meta" style="margin-top:6px">${tr.split(/\s+/).length} palabras. Si hay palabras mal transcritas, puede que tu pronunciación necesite trabajo en ellas.</p>` : ''}
        <p class="muted" style="font-size:14px">Escúchate y fíjate en las pausas, en las muletillas y en si has usado conectores variados.</p></div>`;
    };
    let REC_TEXT = '';
    REC = { mr, stream, left: 60 };
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SR) { try { const sr = new SR(); sr.lang = 'en-GB'; sr.continuous = true; sr.interimResults = false; sr.onresult = e => { for (let i = e.resultIndex; i < e.results.length; i++) if (e.results[i].isFinal) REC_TEXT += e.results[i][0].transcript + ' '; }; sr.onerror = () => {}; sr.start(); REC.sr = sr; } catch (e) {} }
    mr.start();
    $('#recBtn').classList.add('on'); $('#recBtn').innerHTML = IC.stop; $('#recHint').textContent = 'Grabando… toca para parar';
    REC.timer = setInterval(() => { REC.left--; $('#spTimer').textContent = '0:' + String(Math.max(0, REC.left)).padStart(2, '0'); if (REC.left <= 0) finishRec(); }, 1000);
  }
  function finishRec() {
    if (!REC) return;
    clearInterval(REC.timer);
    const r = REC; REC = null;
    try { r.sr && r.sr.stop(); } catch (e) {}
    setTimeout(() => { try { r.mr.stop(); } catch (e) {} r.stream.getTracks().forEach(t => t.stop()); }, 400);
    $('#recBtn').classList.remove('on'); $('#recBtn').innerHTML = IC.mic; $('#recHint').textContent = 'Toca para grabar otra vez';
    bump('spoke');
  }
}

/* ---------- shadowing: escucha y repite ---------- */
function startShadow(srcId) {
  const pool = sentencePool(srcId).filter(x => { const n = x.s.split(/\s+/).length; return n >= 6 && n <= 22; });
  if (!pool.length) { $('#view').innerHTML = `<div class="empty">Aún no hay frases para practicar.</div><a class="btn block" href="#practice">Volver</a>`; return; }
  const list = shuffle(pool).slice(0, 8); let i = 0;
  const show = () => {
    stopRecording();
    if (i >= list.length) { $('#view').innerHTML = `<div class="card pad" style="text-align:center;padding:30px"><div style="font-size:44px">🎧</div><b>Shadowing terminado</b><p class="muted">${list.length} frases repetidas. Hacerlo cada día mejora muchísimo la pronunciación, el ritmo y la entonación.</p><button class="btn primary block" id="again">Otra ronda</button><a class="btn block ghost" href="#practice" style="margin-top:8px">Volver</a></div>`; $('#again').onclick = () => startShadow(srcId); return; }
    const it = list[i];
    $('#view').innerHTML = `<div class="row" style="margin-bottom:8px"><b class="grow">Shadowing${srcId ? ' · esta noticia' : ''}</b><span class="muted">${i + 1}/${list.length}</span></div>
      <div class="progressbar"><i style="width:${i / list.length * 100}%"></i></div>
      <p class="muted" style="font-size:14px;margin:14px 0 6px">Escucha la frase y repítela en voz alta imitando el ritmo, las pausas y la entonación. Luego grábate y compara.</p>
      <div class="card pad"><div class="q" style="margin:0" id="shText">${esc(it.s)}</div><div class="meta" style="margin-top:8px">${esc(it.src)}</div></div>
      <div class="row wrap" style="margin-top:12px"><button class="btn primary grow" id="shPlay">${IC.play.replace('<svg', '<svg width="18" height="18"')} Escuchar</button><button class="btn grow" id="shSlow">🐢 Más lento</button><button class="btn grow" id="shHide">Ocultar texto</button></div>
      <button class="rec" id="shRec" aria-label="Grabar">${IC.mic}</button><p class="muted" style="text-align:center;font-size:13px;margin:0" id="shHint">Toca para grabarte</p>
      <div id="shOut" style="margin-top:12px"></div>
      <button class="btn block" id="shNext" style="margin-top:14px">Siguiente frase</button>`;
    $('#shPlay').onclick = () => TTS.speak(it.s);
    $('#shSlow').onclick = () => TTS.speak(it.s, { rate: 0.72 });
    $('#shHide').onclick = () => { const t = $('#shText'); t.style.filter = t.style.filter ? '' : 'blur(7px)'; $('#shHide').textContent = t.style.filter ? 'Mostrar texto' : 'Ocultar texto'; };
    $('#shNext').onclick = () => { i++; bump('ex'); show(); };
    $('#shRec').onclick = async () => {
      if (REC) { const r = REC; REC = null; setTimeout(() => { try { r.mr.stop(); } catch (e) {} r.stream.getTracks().forEach(t => t.stop()); }, 300); $('#shRec').classList.remove('on'); $('#shRec').innerHTML = IC.mic; $('#shHint').textContent = 'Toca para grabarte otra vez'; return; }
      if (!navigator.mediaDevices || !window.MediaRecorder) { toast('Este navegador no permite grabar audio'); return; }
      let stream; try { stream = await navigator.mediaDevices.getUserMedia({ audio: true }); } catch (e) { toast('Necesito permiso para usar el micrófono'); return; }
      const chunks = []; const mr = new MediaRecorder(stream);
      mr.ondataavailable = e => e.data.size && chunks.push(e.data);
      mr.onstop = () => {
        if (!$('#shOut')) return;
        const url = URL.createObjectURL(new Blob(chunks, { type: mr.mimeType || 'audio/mp4' }));
        $('#shOut').innerHTML = `<div class="card pad"><b>Tu versión</b><audio controls src="${url}" id="shMine" style="width:100%;margin-top:8px"></audio><div class="row wrap" style="margin-top:8px"><button class="btn small primary" id="shAB">A/B · original y luego tú</button><button class="btn small" id="shOrig">Solo la original</button></div><p class="meta" style="margin-top:8px">Fíjate en tres cosas: qué palabras se unen, dónde sube y baja la voz y qué sílabas suenan más fuertes.</p></div>`;
        $('#shOrig').onclick = () => TTS.speak(it.s);
        $('#shAB').onclick = () => { const a = $('#shMine'); a.pause(); a.currentTime = 0; TTS.speak(it.s, { onend: () => setTimeout(() => { try { a.play(); } catch (e) {} }, 350) }); };
        const t = today(); t.shadow = (t.shadow || 0) + 1; t.ssec = (t.ssec || 0) + Math.round((Date.now() - mr._t0) / 1000); saveStats(); renderStreak();
      };
      REC = { mr, stream }; mr._t0 = Date.now();
      mr.start(); $('#shRec').classList.add('on'); $('#shRec').innerHTML = IC.stop; $('#shHint').textContent = 'Grabando… toca para parar';
    };
    setTimeout(() => TTS.speak(it.s), 250);
  };
  show();
}

/* ---------- tradúcela tú: del español al inglés ---------- */
async function genTrans(srcId) {
  const pool = sentencePool(srcId).filter(x => { const n = x.s.split(/\s+/).length; return n >= 6 && n <= 20; });
  if (!pool.length) return null;
  const it = pick(pool);
  const es = await translate(it.s);
  if (!es) return { type: 'trans', it, es: '', offline: true };
  return { type: 'trans', it, es };
}
function renderTransQ(q) {
  if (q.offline) { $('#view').innerHTML = `${exHeader()}<div class="notice bad" style="margin-top:14px">Este ejercicio necesita internet para preparar la frase en español. Comprueba la conexión y vuelve a intentarlo.</div><a class="btn block" href="#practice">Volver</a>`; return; }
  $('#view').innerHTML = `${exHeader()}<div id="qArea"><p class="muted" style="margin:16px 0 6px">Escribe esta frase en inglés, como lo diría un nativo</p>
    <div class="card pad"><div class="q" style="margin:0">${esc(q.es)}</div><div class="meta" style="margin-top:6px">Traducción automática; la frase original es de la app.</div></div>
    <textarea class="textarea" id="tIn" style="margin-top:12px" autocomplete="off" autocapitalize="sentences" spellcheck="false" placeholder="Tu versión en inglés…"></textarea>
    <button class="btn primary block" id="tCheck" style="margin-top:10px">Comparar con la original</button></div>`;
  $('#tCheck').onclick = () => {
    if ($('.feedback')) return;
    const a = tokenize(q.it.s).map(t => t.w), b = tokenize($('#tIn').value).map(t => t.w);
    if (!b.length) return;
    const { out, score } = lcsDiff(a, b);
    const ok = score >= 0.75;
    answered(ok, `<div style="margin-top:6px">Frase original</div><div class="ctx" style="font-weight:600">${esc(q.it.s)}</div>
      <div class="diff ctx" style="margin-top:8px">${out.map(([k, w]) => `<span class="${k}">${esc(w)}</span>`).join(' ')}</div>
      <div class="muted" style="font-size:13px;margin-top:6px">${Math.round(score * 100)}% de coincidencia. Puedes haberlo dicho bien de otra forma; fíjate sobre todo en las expresiones que usa el original.</div>`);
  };
}

/* ==========================================================
   PROGRESO
   ========================================================== */
function isActive(d) { return d && ((d.art || 0) >= 1 || (d.ex || 0) >= 10 || (d.rev || 0) >= 10 || (d.newLib || 0) >= 5 || (d.spoke || 0) >= 1 || (d.shadow || 0) >= 1 || (d.sec || 0) >= 600 || (d.lsec || 0) >= 300 || (d.ssec || 0) >= 120); }
function streak() {
  let n = 0; const d = new Date();
  if (!isActive(STATS[dayKey(d)])) d.setDate(d.getDate() - 1);
  while (isActive(STATS[dayKey(d)])) { n++; d.setDate(d.getDate() - 1); }
  return n;
}
function renderStreak() { $('#streakNum').textContent = streak(); }
function renderProgress() {
  const t = today(); const st = streak();
  const tot = Object.values(STATS).reduce((a, d) => { for (const k in d) a[k] = (a[k] || 0) + d[k]; return a; }, {});
  const acc = tot.ex ? Math.round((tot.ok || 0) / tot.ex * 100) : 0;
  const days = []; for (let i = 13; i >= 0; i--) { const d = new Date(); d.setDate(d.getDate() - i); const s = STATS[dayKey(d)] || {}; days.push({ d, v: Math.round((s.sec || 0) / 60) + (s.ex || 0) + (s.rev || 0) + (s.newLib || 0) }); }
  const max = Math.max(10, ...days.map(x => x.v));
  const learning = LIB.filter(x => itemStatus(x) === 'learning').length + NOTES.filter(n => n.srs && n.srs.ivl < 21).length;
  const mastered = LIB.filter(x => itemStatus(x) === 'done').length + NOTES.filter(n => n.srs && n.srs.ivl >= 21).length;
  const catBars = Object.keys(LIB_CATS).map(c => { const k = catCounts(c); const done = LIB.filter(x => x.cat === c && itemStatus(x) === 'done').length; return `<div class="goal"><div class="row"><span>${esc(LIB_CATS[c].name)}</span><span class="muted">${k.learned}/${k.total}</span></div><div class="progressbar dual"><i style="width:${k.learned / k.total * 100}%"></i><b style="width:${done / k.total * 100}%"></b></div></div>`; }).join('');
  $('#view').innerHTML = `
    <div class="h1">Progreso</div>
    <div class="card hero-streak"><div class="big">${st}</div><div><b>${st === 1 ? 'día seguido' : 'días seguidos'}</b><div class="muted" style="font-size:14px">Un día cuenta si aprendes 5 palabras, haces 10 ejercicios o repasos, lees algo, escuchas 5 minutos o hablas 2 minutos.</div></div></div>
    <div class="h2">Hoy</div>
    <div class="stats">
      <div class="card stat"><b>${t.newLib || 0}</b><span>nuevas</span></div>
      <div class="card stat"><b>${t.rev || 0}</b><span>repasos</span></div>
      <div class="card stat"><b>${t.ex || 0}</b><span>ejercicios</span></div>
      <div class="card stat"><b>${Math.round((t.lsec || 0) / 60)}</b><span>min escuchando</span></div>
      <div class="card stat"><b>${Math.round((t.ssec || 0) / 60)}</b><span>min hablando</span></div>
      <div class="card stat"><b>${Math.round((t.sec || 0) / 60)}</b><span>min leyendo</span></div>
    </div>
    <div class="h2">Últimos 14 días</div>
    <div class="card pad"><div class="chart">${days.map((x, i) => `<div class="bar ${i === 13 ? 'today' : ''}"><i style="height:${x.v / max * 100}%"></i><span>${x.d.getDate()}</span></div>`).join('')}</div>
      <div class="meta" style="margin-top:6px">Actividad diaria (palabras nuevas, repasos, ejercicios y minutos de lectura)</div></div>
    <div class="h2">Tu vocabulario</div>
    <div class="stats">
      <div class="card stat"><b>${learning}</b><span>aprendiendo</span></div>
      <div class="card stat"><b>${mastered}</b><span>dominadas</span></div>
      <div class="card stat"><b>${NOTES.length}</b><span>notas propias</span></div>
    </div>
    <div class="card pad" style="margin-top:10px">${catBars}<div class="meta" style="margin-top:6px">Azul claro · en tus repasos. Verde · dominadas.</div></div>
    <div class="h2">En total</div>
    <div class="stats">
      <div class="card stat"><b>${tot.ex || 0}</b><span>ejercicios</span></div>
      <div class="card stat"><b>${acc}%</b><span>aciertos</span></div>
      <div class="card stat"><b>${(tot.spoke || 0) + (tot.shadow || 0)}</b><span>speaking</span></div>
      <div class="card stat"><b>${HISTORY.length}/${(window.READINGS || []).length}</b><span>lecturas</span></div>
      <div class="card stat"><b>${Object.keys(GPROG).length}/${(window.GRAMMAR || []).length}</b><span>gramática</span></div>
      <div class="card stat"><b>${Math.round((tot.sec || 0) / 60)}</b><span>min leyendo</span></div>
    </div>
    ${typeof progressExtra === 'function' ? progressExtra() : ''}`;
}

/* ==========================================================
   AJUSTES
   ========================================================== */
function renderSettings() {
  TTS.load();
  const voices = TTS.voices;
  const sw = (id, label, on) => `<label class="switch"><span>${label}</span><input type="checkbox" id="${id}" ${on ? 'checked' : ''}></label>`;
  $('#view').innerHTML = `
    <div class="h1">Ajustes</div>
    <div class="h2">Cuenta</div>
    <div class="card set-group" id="accountBox"></div>
    <div class="h2">Aspecto</div>
    <div class="card set-group">
      <label class="lbl">Tu nombre (para el saludo)</label><input class="input" id="sName" value="${esc(S.name || '')}" placeholder="Iker">
      <label class="lbl">Color principal</label>
      <div class="row wrap" style="gap:10px">${Object.entries(ACCENTS).map(([k, c]) => `<button type="button" class="swatch big ${S.accent === k ? 'on' : ''}" style="background:${c[0]}" data-acc="${k}" aria-label="${k}"></button>`).join('')}</div>
      <label class="lbl">Tema</label><select class="select" id="sTheme"><option value="auto">Automático (como el móvil)</option><option value="light">Claro</option><option value="dark">Oscuro</option></select>
      <label class="lbl">Tipo de letra de títulos y textos</label><select class="select" id="sFont"><option value="serif">Clásica (con remates)</option><option value="sans">Moderna (sin remates)</option></select>
      <label class="lbl">Tamaño de la interfaz</label><select class="select" id="sUi"><option value="small">Pequeño</option><option value="normal">Normal</option><option value="large">Grande</option></select>
      <label class="lbl">Tamaño de letra de las lecturas · <span id="sSizeV">${S.readSize}</span> px</label><input type="range" id="sSize" min="15" max="26" step="1" value="${S.readSize}" style="width:100%">
      <label class="lbl">Pestaña al abrir la app</label><select class="select" id="sStart"><option value="home">Hoy</option><option value="learn">Aprender</option><option value="listen">Escuchar</option><option value="speak">Hablar</option><option value="practice">Practicar</option><option value="mine">Mío</option></select>
    </div>
    <div class="h2">Pantalla Hoy</div>
    <div class="card set-group">
      ${sw('hWords', 'Botón de palabras nuevas', S.home.words)}${sw('hPlan', 'Plan del día', S.home.plan)}${sw('hExp', 'Expresión del día', S.home.exp)}${sw('hLegal', 'Término jurídico del día', S.home.legal)}${sw('hSugg', 'Sugerencias (gramática, lectura, situación)', S.home.sugg)}
    </div>
    <div class="h2">Aprendizaje</div>
    <div class="card set-group">
      <label class="lbl">Palabras o expresiones nuevas al día · <span id="nV">${S.newPerDay}</span></label>
      <input type="range" id="sNew" min="3" max="50" step="1" value="${S.newPerDay}" style="width:100%">
      <label class="lbl">Qué entra en tus palabras nuevas</label>
      ${Object.keys(LIB_CATS).map(c => `<label class="switch"><span>${esc(LIB_CATS[c].name)} <span class="muted">· ${LIB.filter(x => x.cat === c).length}</span></span><input type="checkbox" data-mix="${c}" ${S.mix[c] ? 'checked' : ''}></label>`).join('')}
      <label class="lbl">Fichas propias nuevas que entran en repaso cada día</label><input class="input" type="number" min="1" max="200" id="gN" value="${S.newNotesPerDay}">
      <label class="lbl">Tarjetas de repaso: qué ves primero</label><select class="select" id="sFront"><option value="en">Inglés (y piensas el significado)</option><option value="es">Español (y piensas cómo se dice)</option><option value="mix">Mezclado</option></select>
      <label class="lbl">Preguntas por ronda de ejercicios</label><select class="select" id="sExLen"><option>5</option><option>10</option><option>15</option><option>20</option><option>30</option></select>
      ${sw('sShowEs', 'Mostrar la traducción en las listas (desactívalo para autoevaluarte; tocando se ve)', S.showEs)}
    </div>
    <div class="h2">Objetivos diarios</div>
    <div class="card set-group">
      <label class="lbl">Ejercicios al día</label><input class="input" type="number" min="1" max="500" id="gE" value="${S.goalExercises}">
      <label class="lbl">Repasos al día</label><input class="input" type="number" min="1" max="500" id="gR" value="${S.goalReviews}">
    </div>
    <div class="h2">Voz y audio</div>
    <div class="card set-group">
      ${sw('sAuto', 'Pronunciar automáticamente las palabras', S.autoplay)}
      <label class="lbl">Voz inglesa</label>
      <select class="select" id="sVoice"><option value="">Automática (británica)</option>${voices.map(v => `<option value="${esc(v.name)}" ${v.name === S.voice ? 'selected' : ''}>${esc(v.name)} · ${esc(v.lang)}</option>`).join('')}</select>
      <p class="meta" style="margin-top:6px">En el iPhone puedes descargar voces mucho más naturales en Ajustes › Accesibilidad › Contenido leído › Voces › Inglés (Reino Unido). Las «mejoradas» o «premium» suenan casi como una persona.</p>
      <div class="row" style="margin-top:8px"><button class="btn small" id="sTest">Probar voz</button></div>
      <label class="lbl">Velocidad · <span id="sRateV">${S.rate}</span>×</label><input type="range" id="sRate" min="0.6" max="1.4" step="0.05" value="${S.rate}" style="width:100%">
    </div>
    <div class="h2">Conversación con IA</div>
    <div class="card set-group">
      <p class="muted" style="font-size:14px">Para hablar con la IA necesitas una clave de la API de Anthropic (console.anthropic.com). Se guarda solo en este dispositivo y no se sube a tu cuenta.</p>
      <label class="lbl">Clave de la API</label><div class="row"><input class="input grow" id="sAiKey" type="password" placeholder="sk-ant-…" autocomplete="off" autocapitalize="off" spellcheck="false" value="${esc(store.get('aikey', ''))}"><button class="btn" id="sAiDel">Quitar</button></div>
      <label class="lbl">Modelo</label><select class="select" id="sAiModel"><option value="claude-haiku-5-5">Rápido y barato (Haiku)</option><option value="claude-sonnet-5-5">Más listo (Sonnet)</option></select>
    </div>
    <div class="h2">Recordatorio diario</div>
    <div class="card set-group">
      <p class="muted" style="font-size:14px">Las apps web del iPhone no pueden avisarte a una hora fija por sí solas. Lo mejor es un recordatorio en la app Recordatorios del iPhone que abra Fluent; pídemelo y te lo creo a la hora que quieras.</p>
    </div>
    <div class="h2">Mis datos</div>
    <div class="card set-group">
      <p class="muted" style="font-size:14px">Con cuenta, todo se guarda solo en internet. Sin cuenta, se guarda en este dispositivo; haz una copia de vez en cuando.</p>
      <div class="row wrap"><button class="btn grow" id="exp">Exportar copia</button><label class="btn grow" for="imp">Importar copia</label><input type="file" id="imp" accept="application/json,.json" class="hidden"></div>
      <div class="row wrap" style="margin-top:8px"><button class="btn grow" id="expCsv">Exportar mis palabras (CSV)</button><button class="btn danger grow" id="wipe">Borrar todo</button></div>
    </div>
    <p class="meta" style="justify-content:center;margin:18px 0;text-align:center">Fluent ${VERSION} · ${LIB.length} entradas · ${(window.GRAMMAR || []).length} lecciones · ${(window.SITUATIONS || []).length} situaciones · ${(window.READINGS || []).length} lecturas</p>`;
  $('#accountBox').innerHTML = accountHTML(); bindAccount();
  $('#sTheme').value = S.theme; $('#sFont').value = S.font; $('#sUi').value = S.uiSize; $('#sStart').value = S.startTab; $('#sFront').value = S.cardFront; $('#sExLen').value = String(S.exLen);
  const bind = (id, fn, ev = 'change') => $(id).addEventListener(ev, e => { fn(e.target.type === 'checkbox' ? e.target.checked : e.target.value); saveSettings(); });
  bind('#sName', v => { S.name = v.trim().slice(0, 30); }, 'input');
  $$('[data-acc]').forEach(b => b.onclick = () => { S.accent = b.dataset.acc; saveSettings(); applyTheme(); $$('[data-acc]').forEach(x => x.classList.toggle('on', x === b)); });
  bind('#sTheme', v => { S.theme = v; applyTheme(); });
  bind('#sFont', v => { S.font = v; applyTheme(); });
  bind('#sUi', v => { S.uiSize = v; applyTheme(); });
  bind('#sSize', v => { S.readSize = +v; $('#sSizeV').textContent = v; applyTheme(); }, 'input');
  bind('#sStart', v => { S.startTab = v; });
  bind('#hWords', v => { S.home.words = v; }); bind('#hPlan', v => { S.home.plan = v; }); bind('#hExp', v => { S.home.exp = v; }); bind('#hLegal', v => { S.home.legal = v; }); bind('#hSugg', v => { S.home.sugg = v; });
  bind('#sNew', v => { S.newPerDay = +v; $('#nV').textContent = v; }, 'input');
  $$('[data-mix]').forEach(c => c.addEventListener('change', () => { S.mix[c.dataset.mix] = c.checked; if (!Object.values(S.mix).some(Boolean)) { S.mix.word = true; $('[data-mix="word"]').checked = true; } saveSettings(); }));
  bind('#gN', v => { S.newNotesPerDay = Math.max(1, +v || 15); updateBadge(); });
  bind('#sFront', v => { S.cardFront = v; });
  bind('#sExLen', v => { S.exLen = +v || 10; });
  bind('#sShowEs', v => { S.showEs = v; applyTheme(); });
  bind('#gE', v => S.goalExercises = Math.max(1, +v || 1));
  bind('#gR', v => S.goalReviews = Math.max(1, +v || 1));
  bind('#sAuto', v => { S.autoplay = v; });
  bind('#sVoice', v => { S.voice = v; });
  bind('#sRate', v => { S.rate = +v; $('#sRateV').textContent = v; }, 'input');
  $('#sTest').onclick = () => TTS.speak('Hi ' + (S.name || 'there') + '! This is how I sound. Shall we practise some English today?');
  $('#sAiModel').value = S.aiModel || 'claude-haiku-5-5';
  bind('#sAiModel', v => { S.aiModel = v; });
  $('#sAiKey').addEventListener('change', e => { store.set('aikey', e.target.value.trim()); toast('Clave guardada en este dispositivo'); });
  $('#sAiDel').onclick = () => { store.set('aikey', ''); $('#sAiKey').value = ''; toast('Clave quitada'); };
  $('#exp').onclick = exportBackup;
  $('#expCsv').onclick = exportCSV;
  $('#imp').onchange = importBackup;
  $('#wipe').onclick = () => { if (confirm('¿Seguro que quieres borrar TODO de este dispositivo? Si tienes cuenta, tus datos siguen guardados en internet.') && confirm('Última confirmación. ¿Lo borro todo?')) { Object.keys(localStorage).filter(k => k.startsWith('fl_')).forEach(k => localStorage.removeItem(k)); if (window.firebase && SYNC.user) firebase.auth().signOut(); location.hash = ''; location.reload(); } };
}

function download(name, text, type) {
  const blob = new Blob([text], { type }); const a = document.createElement('a');
  a.href = URL.createObjectURL(blob); a.download = name; document.body.appendChild(a); a.click();
  setTimeout(() => { URL.revokeObjectURL(a.href); a.remove(); }, 1000);
}
function exportBackup() {
  const data = Object.assign({ app: 'fluent', version: VERSION, date: new Date().toISOString() }, snapshot());
  download('fluent-copia-' + dayKey() + '.json', JSON.stringify(data), 'application/json');
}
function exportCSV() {
  const q = s => '"' + String(s || '').replace(/"/g, '""') + '"';
  const rows = [['term', 'type', 'spanish', 'definition', 'example', 'more examples', 'synonyms', 'notes', 'favourite', 'status']].concat(NOTES.map(n => [n.term, CATS[n.cat], n.es, n.def, n.ex, n.exs, n.syn, n.note, mark(n.id).fav ? 'yes' : '', mark(n.id).st || '']));
  download('fluent-notas-' + dayKey() + '.csv', '﻿' + rows.map(r => r.map(q).join(',')).join('\n'), 'text/csv');
}
function importBackup(e) {
  const f = e.target.files[0]; if (!f) return;
  const rd = new FileReader();
  rd.onload = () => {
    try {
      const d = JSON.parse(rd.result); if (d.app !== 'fluent') throw 0;
      if (!confirm('¿Combinar la copia con tus datos actuales? No se pierde nada de lo que ya tienes.')) return;
      const R = { notes: d.notes || [], learn: d.learn || {}, gprog: d.gprog || {}, stats: d.stats || {}, history: d.history || [], marks: d.marks || {}, labels: d.labels || [], lists: d.lists || [], nb: d.nb || [], tombs: d.tombs || {}, settings: d.settings || {}, texts: d.texts || [], videos: d.videos || [] };
      applyState(merge(snapshot(), R)); route();
      toast('Copia importada'); renderStreak();
    } catch (err) { toast('El archivo no es una copia válida de Fluent'); }
  };
  rd.readAsText(f);
}

/* ==========================================================
   INICIO
   ========================================================== */
window.addEventListener('DOMContentLoaded', () => {
  applyTheme();
  buildPool();
  renderStreak();
  updateBadge();
  route();
});
if ('serviceWorker' in navigator && location.protocol.startsWith('http')) {
  window.addEventListener('load', () => navigator.serviceWorker.register('sw.js').catch(() => {}));
}

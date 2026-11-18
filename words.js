'use strict';
/* ==========================================================
   PALABRAS · repaso, práctica con cuatro niveles que se adaptan,
   tu diccionario personal (A–Z) y colecciones
   ========================================================== */
if (!PR.lvl) PR.lvl = 2;
if (PR.adapt === undefined) PR.adapt = true;
if (!PR.how) PR.how = 'lx';
if (![5, 10, 20].includes(PR.n)) PR.n = 10;

const LVL = [
  { n: 'Reconocer', vocab: 'Ves la palabra en inglés y eliges qué significa entre cuatro opciones.', text: 'Frases cortas, más despacio y con opciones para elegir.' },
  { n: 'Recordar', vocab: 'Del español al inglés, con opciones muy parecidas entre sí o con la primera letra de pista.', text: 'Frases de longitud media y con pistas.' },
  { n: 'Escribir', vocab: 'La escribes tú, sin opciones, sola o dentro de una frase. Vale conjugada.', text: 'Frases más largas y sin opciones: lo escribes tú.' },
  { n: 'Sin ayuda', vocab: 'Solo la definición en inglés o solo el audio, y escribes la palabra o la frase entera.', text: 'Frases largas, a velocidad normal y sin ninguna pista.' }
];
const HOW = [
  { id: 'lx', n: 'Mezcla según el nivel', d: 'Cambia el tipo de pregunta y sigue tu nivel', v: 1, lv: 1 },
  { id: 'pmc', n: 'Test de opciones', d: 'Eliges la respuesta correcta', v: 1, lv: 1 },
  { id: 'pctx', n: 'Frases con hueco', d: 'Qué expresión encaja en la frase', v: 1, lv: 1 },
  { id: 'prod', n: 'Escribirla tú', d: 'Del español al inglés, escribiendo', v: 1, lv: 1 },
  { id: 'learn', n: 'Aprender a fondo', d: 'Cinco pasos por palabra, de seis en seis', v: 1 },
  { id: 'review', n: 'Tarjetas', d: 'Todas las de tu selección, como en el repaso', v: 1 },
  { id: 'own', n: 'Tu propia frase', d: 'Escribes frases tuyas con ellas', v: 1 },
  { id: 'particle', n: 'Qué partícula va', d: 'Solo phrasal verbs: up, out, off…', v: 1, phr: 1 },
  { id: 'gap', n: 'Huecos en tus textos', d: 'Frases reales de lo que has leído', lv: 1 },
  { id: 'dict', n: 'Dictado', d: 'Escuchas una frase y la escribes', lv: 1 },
  { id: 'order', n: 'Ordenar frases', d: 'Reconstruyes la frase palabra a palabra', lv: 1 },
  { id: 'trans', n: 'Traducir frases', d: 'Frases enteras del español al inglés (necesita internet)', lv: 1 },
  { id: 'cloze', n: 'Palabras pequeñas', d: 'Preposiciones, artículos y conectores' },
  { id: 'gram', n: 'Gramática', d: 'Preguntas de todas las lecciones' },
  { id: 'native', n: 'Cuál suena natural', d: 'Lo que diría un nativo frente a lo que suena traducido' }
];
const LEVEL_MODES = new Set(HOW.filter(h => h.lv).map(h => h.id));

/* ---------- generador por niveles ---------- */
const lxClean = t => String(t || '').split('/')[0].replace(/\(.*?\)/g, ' ').replace(/\b(sb|sth|someone|something|somebody|one's|oneself)\b/gi, ' ').replace(/\s+/g, ' ').trim();
function lxSet(arg) {
  if (arg === 'practice') { const p = setItems('practice'); return p.length ? p : prFilter(prBase()); }
  if (arg && isSetKey(arg)) return setFromArg(arg);
  const mine = LIB.filter(x => x.srs).concat(NOTES);
  return mine.length >= 4 ? mine : mine.concat(LIB.filter(x => ['chunk', 'convo', 'phrasal', 'idiom', 'colloc'].includes(x.cat)).slice(0, 120));
}
function lxDistract(x, pool, n, key, sim) {
  let c = pool.filter(y => y !== x && y[key] && norm(y[key]) !== norm(x[key]) && norm(y.term) !== norm(x.term));
  if (c.length < n + 2) c = c.concat(LIB.filter(y => y.cat === x.cat && y !== x && y[key] && norm(y[key]) !== norm(x[key])));
  if (sim) {
    const fw = firstWord(x.term), pp = partsOf(x), len = String(x.term).length;
    c = c.map(y => [(firstWord(y.term) === fw ? 3 : 0) + (pp.length && partsOf(y).some(p => pp.includes(p)) ? 2 : 0) + (y.cat === x.cat ? 1 : 0) + (Math.abs(String(y.term).length - len) < 4 ? 1 : 0) + Math.random() * 1.5, y]).sort((a, b) => b[0] - a[0]).map(z => z[1]);
  } else c = shuffle(c);
  const out = [], seen = new Set([norm(x[key])]);
  for (const y of c) { const v = norm(y[key]); if (!seen.has(v)) { seen.add(v); out.push(y[key]); } if (out.length >= n) break; }
  return out.length >= n ? out : null;
}
function lxSentences(x) {
  return shuffle([x.ex, ...(x.exs ? String(x.exs).split('\n') : []), ...((x.srs && x.srs.own) || []), ...poolExamples(x.term, 3)].filter(Boolean).map(s => String(s).split(' / ')[0].trim()));
}
function lxBlank(x) { for (const s of lxSentences(x)) { const bl = blankIn(s, x.term); if (bl) return { s, bl }; } return null; }
function lxHint(term, full) {
  const w = lxClean(term).split(' ').filter(Boolean);
  if (full) return w.map(p => p[0] + p.slice(1).replace(/[a-z]/gi, '_')).join('  ');
  return w[0][0] + '…  (' + w.length + (w.length === 1 ? ' palabra' : ' palabras') + ')';
}
const LX_MAKE = {
  en2es: (x, set) => { const o = x.es && lxDistract(x, set, 3, 'es', false); return o && { type: 'vocab', item: x, prompt: x.term, sub: '¿Qué significa?', answer: x.es, options: shuffle([x.es].concat(o)), say: true }; },
  es2enS: (x, set) => { const o = x.es && lxDistract(x, set, 3, 'term', true); return o && { type: 'vocab', item: x, prompt: x.es, sub: '¿Cómo se dice en inglés?', answer: x.term, options: shuffle([x.term].concat(o)) }; },
  def2termS: (x, set) => { const o = x.def && lxDistract(x, set, 3, 'term', true); return o && { type: 'vocab', item: x, prompt: x.def, sub: '¿Qué palabra o expresión es?', answer: x.term, options: shuffle([x.term].concat(o)), long: true }; },
  def2term6: (x, set) => { const o = x.def && lxDistract(x, set, 5, 'term', true); return o && { type: 'vocab', item: x, prompt: x.def, sub: '¿Qué palabra o expresión es?', answer: x.term, options: shuffle([x.term].concat(o)), long: true }; },
  gapPickR: (x, set) => { const b = lxBlank(x); const o = b && lxDistract(x, set, 3, 'term', false); return o && { type: 'pctx', x, s: b.s, bl: b.bl, options: shuffle([x.term].concat(o)) }; },
  gapPickS: (x, set) => { const b = lxBlank(x); const o = b && lxDistract(x, set, 3, 'term', true); return o && { type: 'pctx', x, s: b.s, bl: b.bl, options: shuffle([x.term].concat(o)) }; },
  typeHintFull: x => x.es && { type: 'lxType', x, ask: '¿Cómo se dice en inglés?', html: `<div class="q" style="margin:0">${esc(x.es)}</div>`, hint: lxHint(x.term, true), target: x.term },
  typeHint: x => x.es && { type: 'lxType', x, ask: '¿Cómo se dice en inglés?', html: `<div class="q" style="margin:0">${esc(x.es)}</div>`, hint: lxHint(x.term, false), target: x.term },
  typeEs: x => x.es && { type: 'lxType', x, ask: '¿Cómo se dice en inglés?', html: `<div class="q" style="margin:0">${esc(x.es)}</div>`, target: x.term },
  gapTypeH: x => { const b = lxBlank(x); return b && { type: 'lxType', x, ask: 'Escribe lo que falta en la frase', html: `<div class="q" style="margin:0">${b.bl.html}</div>${x.es ? `<div class="meta" style="margin-top:6px">${esc(x.es)}</div>` : ''}`, hint: lxHint(b.bl.said, false), target: b.bl.said, alt: x.term, s: b.s, fill: b.bl.said }; },
  gapType: x => { const b = lxBlank(x); return b && { type: 'lxType', x, ask: 'Escribe lo que falta en la frase', html: `<div class="q" style="margin:0">${b.bl.html}</div>`, target: b.bl.said, alt: x.term, s: b.s, fill: b.bl.said }; },
  defType: x => x.def && { type: 'lxType', x, ask: '¿Qué palabra o expresión es?', html: `<div class="q" style="margin:0;font-size:19px">${esc(x.def)}</div>`, target: x.term },
  listenTerm: x => ({ type: 'lxType', x, ask: 'Escucha y escribe la palabra o expresión', html: '', audio: lxClean(x.term), target: x.term }),
  listenSent: x => { const s = lxSentences(x).find(z => z.split(/\s+/).length >= 5 && z.split(/\s+/).length <= 22); return s && { type: 'lxType', x, ask: 'Escucha la frase y escríbela entera', html: '', audio: s, target: s, sent: true, s }; }
};
const LX_FMT = {
  lx: [['en2es', 'gapPickR'], ['es2enS', 'gapPickS', 'typeHint'], ['typeEs', 'gapTypeH', 'def2termS'], ['defType', 'listenSent', 'gapType', 'listenTerm']],
  pmc: [['en2es'], ['es2enS'], ['def2termS', 'es2enS'], ['def2term6', 'def2termS']],
  pctx: [['gapPickR'], ['gapPickS'], ['gapTypeH'], ['gapType']],
  prod: [['typeHintFull'], ['typeHint'], ['typeEs'], ['defType', 'listenTerm']]
};
function lxGen(fam) {
  return arg => {
    const set = lxSet(arg || 'practice').filter(x => x.term); if (!set.length) return null;
    const L = lvlNow();
    for (let t = 0; t < 30; t++) {
      const x = pick(set);
      for (const f of shuffle(LX_FMT[fam][L - 1])) { const q = LX_MAKE[f](x, set); if (q) return q; }
      if (L > 1 && t > 12) for (const f of LX_FMT[fam][L - 2]) { const q = LX_MAKE[f](x, set); if (q) return q; }
    }
    return null;
  };
}
EXTRA_TITLES.lx = 'Práctica'; EXTRA_GENS.lx = lxGen('lx');
EXTRA_GENS.pmc = lxGen('pmc'); EXTRA_GENS.pctx = lxGen('pctx'); EXTRA_GENS.prod = lxGen('prod');
EXTRA_TITLES.pmc = 'Test de opciones'; EXTRA_TITLES.prod = 'Escribirla tú';

EXTRA_RENDER.lxType = q => {
  const x = q.x;
  $('#view').innerHTML = `${exHeader()}<div id="qArea"><p class="muted" style="margin:16px 0 8px">${esc(q.ask)}</p>
    ${q.html || q.hint || q.audio ? `<div class="card pad">${q.html || ''}${q.hint ? `<div class="hintw">${esc(q.hint)}</div>` : ''}${q.audio ? `<div class="row" style="gap:10px;${q.html ? 'margin-top:12px' : ''}"><button class="btn primary" id="lxP">${IC.play.replace('<svg', '<svg width="16" height="16"')} Escuchar</button><button class="btn ghost" id="lxS">Más despacio</button></div>` : ''}</div>` : ''}
    <form id="lxF" style="margin-top:12px">${q.sent ? '<textarea class="textarea" id="lxIn" style="min-height:90px" autocomplete="off" autocapitalize="sentences" autocorrect="off" spellcheck="false" placeholder="Escribe lo que oyes"></textarea><button class="btn primary block" style="margin-top:10px">Comprobar</button>' : '<div class="row"><input class="input grow" id="lxIn" placeholder="Escríbelo en inglés" autocapitalize="off" autocomplete="off" autocorrect="off" spellcheck="false"><button class="btn primary">OK</button></div>'}</form>
    <button class="btn ghost small" id="lxGive" style="margin-top:8px">No me sale</button></div>`;
  if (q.audio) {
    $('#lxP').onclick = () => TTS.speak(q.audio, { rate: q.sent ? S.rate : 0.9 });
    $('#lxS').onclick = () => TTS.speak(q.audio, { rate: 0.68 });
    setTimeout(() => TTS.auto(q.audio, { rate: q.sent ? S.rate : 0.9 }), 300);
  } else setTimeout(() => $('#lxIn') && $('#lxIn').focus(), 100);
  const check = said => {
    if ($('.feedback')) return;
    let r;
    if (q.sent) { const d = lcsDiff(tokenize(q.target).map(t => t.w), tokenize(said).map(t => t.w)); r = d.score >= 0.92 ? 'ok' : d.score >= 0.75 ? 'typo' : 'ko'; q.diff = d; }
    else { r = checkTyped(said, q.target); if (r !== 'ok' && q.alt) { const r2 = checkTyped(said, q.alt); if (r2 === 'ok' || (r2 === 'typo' && r === 'ko')) r = r2; } }
    if (!said) r = 'ko';
    const ok = r !== 'ko';
    if (x.srs) { if (r === 'ok') { x.srs.prodOk = (x.srs.prodOk || 0) + 1; x.srs.upd = Date.now(); if (x.lib) saveLearn(); else saveNotes(); } else if (!ok) grade(x, 0); }
    const gap = $('#qArea .gap'); if (gap && q.fill) gap.textContent = q.fill;
    $('#lxF').querySelectorAll('button').forEach(b => b.disabled = true);
    q.it = { s: q.s || x.ex || x.term, src: (LIB_CATS[x.cat] || {}).name || 'Mis palabras' };
    const diff = q.sent && q.diff && said ? `<div class="diff ctx" style="margin-top:6px">${q.diff.out.map(([k, w]) => `<span class="${k}">${esc(w)}</span>`).join(' ')}</div>` : '';
    answered(ok, `${r === 'typo' ? '<div>Casi: revisa cómo se escribe.</div>' : ''}${said && !q.sent ? `<div style="margin-top:4px">Has escrito «${esc(said)}»</div>` : ''}${diff}${q.sent ? `<div class="ctx" style="margin-top:6px">${esc(q.target)}</div>` : ''}<div style="margin-top:6px"><b>${esc(x.term)}</b>${x.es ? ' · ' + esc(x.es) : ''}</div>${x.ex && !q.sent ? `<div class="ctx muted" style="margin-top:4px">${esc(x.ex)}</div>` : ''}`);
    TTS.auto(q.sent ? q.target : x.term, { rate: 0.9 });
  };
  $('#lxF').onsubmit = e => { e.preventDefault(); const v = $('#lxIn').value.trim(); if (v) check(v); };
  $('#lxGive').onclick = () => check('');
};

/* ---------- el nivel sube o baja según aciertas ---------- */
(function () {
  const _answered = answered;
  answered = function (ok, html) {
    _answered(ok, html);
    if (!SESSION || !SESSION.adapt || !LEVEL_MODES.has(SESSION.mode)) return;
    SESSION.run = ok ? Math.max(0, SESSION.run || 0) + 1 : Math.min(0, SESSION.run || 0) - 1;
    let msg = '';
    if (SESSION.run >= 3 && SESSION.lvl < 4) { SESSION.lvl++; SESSION.run = 0; msg = 'Tres seguidas. Subes al nivel ' + SESSION.lvl + ', ' + LVL[SESSION.lvl - 1].n.toLowerCase() + '.'; }
    else if (SESSION.run <= -2 && SESSION.lvl > 1) { SESSION.lvl--; SESSION.run = 0; msg = 'Bajamos un momento al nivel ' + SESSION.lvl + '.'; }
    if (msg) { const fb = $('#qArea .feedback'); if (fb) fb.insertAdjacentHTML('beforeend', `<div style="margin-top:8px;font:italic 500 15px var(--serif);color:var(--accent)">${esc(msg)}</div>`); PR.lvl = SESSION.lvl; savePR(); }
  };
  const _exHeader = exHeader;
  exHeader = function () {
    const h = _exHeader();
    if (!SESSION || !LEVEL_MODES.has(SESSION.mode)) return h;
    return h.replace('<span class="muted">', `<span class="lvtag" style="font:600 12.5px var(--sans);color:var(--accent);margin-right:10px">Nivel ${lvlNow()}</span><span class="muted">`);
  };
})();
addRoute('ex', arg => {
  startExercise(arg);
  if (SESSION && location.hash.startsWith('#ex/')) { if (!SESSION.lvl) SESSION.lvl = PR.lvl; SESSION.adapt = PR.adapt; if (/\/practice$/.test(arg || '')) SESSION.total = PR.n; }
}, 'words', 'Ejercicios');

/* ==========================================================
   PESTAÑA PALABRAS
   ========================================================== */
let DIC_F = 'all', DIC_Q = '', DIC_N = 150;
function dicItems() {
  const ids = new Set(); const out = [];
  const add = x => { if (x && x.term && !ids.has(x.id)) { ids.add(x.id); out.push(x); } };
  NOTES.forEach(add); LIB.filter(x => x.srs).forEach(add); Object.keys(MARKS).forEach(id => add(itemById(id)));
  const key = x => norm(String(x.term).replace(/^\s*to\s+/i, '')).replace(/^[^a-z0-9]+/, '');
  return out.sort((a, b) => key(a).localeCompare(key(b)));
}
function dicFilter(list) {
  const q = norm(DIC_Q);
  return list.filter(x => {
    if (q && !norm(x.term + ' ' + (x.es || '')).includes(q)) return false;
    const m = mark(x.id);
    if (DIC_F === 'learning') return itemStatus(x) === 'learning';
    if (DIC_F === 'hard') return m.hard || (x.srs && (x.srs.lapses || 0) >= 2);
    if (DIC_F === 'fav') return m.fav;
    if (DIC_F === 'unknown') return m.st === 'unknown';
    if (DIC_F === 'done') return itemStatus(x) === 'done';
    return true;
  });
}
function dicHTML() {
  const all = dicFilter(dicItems()); const list = all.slice(0, DIC_N);
  if (!all.length) return `<div class="empty">${DIC_Q ? 'Nada con esa búsqueda.' : DIC_F === 'all' ? 'Aquí irán las palabras que guardes al leer y las que aprendas de la biblioteca.' : 'Ninguna por ahora.'}</div>`;
  const first = x => { const c = norm(String(x.term).replace(/^\s*to\s+/i, '')).replace(/^[^a-z0-9]+/, '')[0] || '#'; return /[a-z]/.test(c) ? c.toUpperCase() : '#'; };
  let last = '', rows = '';
  const letters = new Set();
  list.forEach(x => {
    const L = first(x); letters.add(L);
    if (L !== last) { rows += `<div class="letter" id="dl-${L}">${L}</div>`; last = L; }
    const st = itemStatus(x), m = mark(x.id);
    const pos = x.lib ? (CATS[x.cat] || '').toLowerCase() : x.cat && CATS[x.cat] ? CATS[x.cat].toLowerCase() : 'mía';
    rows += `<div class="e" data-id="${esc(x.id)}"><span class="st ${m.hard ? 'hard' : ''}">${m.hard ? 'difícil' : st === 'done' ? 'dominada' : st === 'learning' ? 'aprendiendo' : ''}</span><b>${esc(x.term)}</b><i>${esc(pos)}</i>${x.es ? `<div>${esc(x.es)}</div>` : ''}</div>`;
  });
  const az = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('').map(L => `<button data-az="${L}" class="${letters.has(L) ? 'has' : ''}">${L}</button>`).join('');
  return `<div class="dic"><div class="ent">${rows}${all.length > list.length ? `<button class="btn block" id="dicMore" style="margin-top:10px">Ver ${Math.min(150, all.length - list.length)} más (${all.length - list.length} restantes)</button>` : ''}</div>${list.length > 12 ? `<div class="az">${az}</div>` : ''}</div>`;
}
function renderWords() {
  const due = dueCards().length; const t = today();
  const left = Math.max(0, S.newPerDay - (t.newLib || 0));
  const how = HOW.find(h => h.id === PR.how) || HOW[0];
  const vocabHow = !!how.v;
  const list = vocabHow ? prFilter(prBase()) : [];
  const dicN = dicItems().length;
  const catRow = c => { const k = catCounts(c); return `<a class="coll" href="#lib/${c}"><div class="grow"><b>${esc(LIB_CATS[c].name)}</b><small>${esc(LIB_CATS[c].desc)}</small></div><span>${k.learned} / ${k.total}</span></a>`; };
  const sets = [['fav', 'Favoritas'], ['unknown', 'No me la sé'], ['hard', 'Difíciles']].map(([k, n]) => [k, n, setItems(k).length]).concat(LISTS.map(L => ['list:' + L.id, L.name, L.items.length])).concat(LABELS.map(L => ['label:' + L.id, L.name, setItems('label:' + L.id).length]));
  const CAT_TILE = { word: ['book', 't-blue'], phrasal: ['link', 't-green'], idiom: ['quote', 't-orange'], convo: ['chat', 't-teal'], chunk: ['list', 't-slate'], colloc: ['link', 't-plum'], linker: ['order', 't-ochre'], false: ['x', 't-red'], slang: ['spark', 't-orange'], ukus: ['globe', 't-blue'], legal: ['gavel', 't-green'], business: ['chart', 't-slate'] };
  const collRow = (href, ic, col, name, desc, right) => `<a class="coll" href="${href}"><span class="tile" style="--tc:var(--${col})">${ICF[ic] || ICF.book}</span><div class="grow"><b>${esc(name)}</b><small>${esc(desc)}</small></div><span>${right}</span></a>`;
  $('#view').innerHTML = `
    <div class="h1">Palabras</div>
    <div class="card revhero"><div class="top"><span class="tile big" style="--tc:var(--t-blue)">${ICF.cards}</span><div class="grow"><b>${due ? due + (due === 1 ? ' tarjeta para hoy' : ' tarjetas para hoy') : 'Repaso al día'}</b><span>${due ? 'Unos ' + Math.max(1, Math.ceil(due / 4)) + ' minutos, con la frase donde las viste' : 'Puedes hacer un repaso extra cuando quieras'}</span></div></div>
      <a class="btn ${due ? 'primary' : ''}" href="#ex/review">${due ? 'Empezar repaso' : 'Hacer un repaso extra'}</a>
      <div class="alt"><a href="#learn/new">${left ? 'Aprender ' + left + (left === 1 ? ' palabra nueva' : ' palabras nuevas') : 'Aprender cinco palabras más'}</a></div></div>
    <div class="card build">
      <div class="bt">Practicar</div>
      ${vocabHow ? `<button class="prow" id="bWhat">Qué<span><em>${esc(prName())}</em>${IC.right}</span></button>` : `<div class="prow">Qué<span><em>Frases de tus textos</em></span></div>`}
      <button class="prow" id="bHow">Cómo<span><em>${esc(how.n)}</em>${IC.right}</span></button>
      ${how.lv ? `<div class="lv" id="bLv">${LVL.map((l, i) => `<button data-l="${i + 1}" class="${i + 1 === PR.lvl ? 'on' : ''}" aria-pressed="${i + 1 === PR.lvl}"><b>${i + 1}</b>${l.n}</button>`).join('')}</div>
      <div class="lvdesc">${esc(vocabHow ? LVL[PR.lvl - 1].vocab : LVL[PR.lvl - 1].text)}</div>
      <label class="switch"><span>Subir o bajar de nivel según aciertes</span><input type="checkbox" id="bAdapt" ${PR.adapt ? 'checked' : ''}></label>` : `<div class="lvdesc">${esc(how.d)}. Este ejercicio no tiene niveles.</div>`}
      <div class="row"><div class="seg mini" id="bN" style="margin:0;flex:0 0 132px">${[5, 10, 20].map(n => `<button data-n="${n}" class="${PR.n === n ? 'on' : ''}">${n}</button>`).join('')}</div><button class="btn primary grow" id="bGo" ${vocabHow && !list.length ? 'disabled' : ''}>${vocabHow && !list.length ? 'Nada con esa selección' : 'Empezar ' + PR.n + ' preguntas'}</button></div>
      ${vocabHow ? `<div class="meta" style="margin-top:10px">${fmtNum(list.length)} ${list.length === 1 ? 'entrada' : 'entradas'} en tu selección · <a href="#practice">Afinar con filtros</a></div>` : ''}
    </div>
    <div class="h2">Tu diccionario <span class="muted" style="font:500 15px var(--ui)">${fmtNum(dicN)}</span></div>
    <div class="chips" id="dFilt">${[['all', 'Todas'], ['learning', 'Aprendiendo'], ['done', 'Dominadas'], ['hard', 'Difíciles'], ['fav', 'Favoritas'], ['unknown', 'No me la sé']].map(([k, n]) => `<button class="chip ${DIC_F === k ? 'active' : ''}" data-f="${k}">${n}</button>`).join('')}</div>
    <div class="search">${IC.search}<input class="input" id="dQ" type="search" value="${esc(DIC_Q)}" placeholder="Buscar en tu diccionario" autocapitalize="off" autocomplete="off" aria-label="Buscar en tu diccionario"></div>
    <div id="dicBox">${dicHTML()}</div>
    <div class="h2">Colecciones <span class="muted" style="font:500 15px var(--ui)">${fmtNum(LIB.length)}</span></div>
    <div class="group">${Object.keys(LIB_CATS).map(c => { const k = catCounts(c); const [ic, col] = CAT_TILE[c] || ['book', 't-blue']; return collRow('#lib/' + c, ic, col, LIB_CATS[c].name, LIB_CATS[c].desc, k.learned + ' / ' + k.total); }).join('')}</div>
    <div class="group">
      ${collRow('#phrasal', 'link', 't-green', 'Phrasal verbs por partícula', 'La lógica de up, out, off… agrupados por verbo', '')}
      ${collRow('#grammar', 'cap', 't-blue', 'Gramática', (window.GRAMMAR || []).length + ' lecciones de consulta', Object.keys(GPROG).length + ' hechas')}
      ${collRow('#sit', 'chat', 't-teal', 'Situaciones', 'Frases para la vida real y el despacho', '')}
      ${collRow('#packs', 'quote', 't-orange', 'Lo que dicen los nativos', 'En el pub, en la oficina, en el fútbol', '')}
      ${collRow('#natural', 'spark', 't-ochre', 'Inglés natural', (window.NATIVE || []).length + ' frases que delatan a un español', '')}
      ${collRow('#freq', 'chart', 't-slate', 'Las 25.000 palabras más usadas', 'Descubre las frecuentes que aún no conoces', '')}
      ${collRow('#calib', 'target', 't-red', 'Calibrar tu vocabulario', 'Para que los textos sepan qué palabras conoces', '')}
    </div>
    <div class="h2">Tus listas <a href="#mine">Gestionar</a></div>
    <div class="group">${sets.map(([k, n, c]) => `<div class="coll"><span class="tile" style="--tc:var(--${k === 'fav' ? 't-ochre' : k === 'unknown' ? 't-red' : k === 'hard' ? 't-orange' : 't-slate'})">${ICF[k === 'fav' ? 'star' : k === 'unknown' ? 'x' : k === 'hard' ? 'flag' : 'list']}</span><div class="grow"><b>${esc(n)}</b><small>${c} ${c === 1 ? 'entrada' : 'entradas'}</small></div>${c >= 2 ? `<span style="display:flex;gap:14px"><a href="#ex/lx/${k}">Practicar</a><a href="#ex/review/${k}">Tarjetas</a></span>` : ''}</div>`).join('')}</div>
    <div class="h2">Buscar en toda la biblioteca</div>
    <div class="search">${IC.search}<input class="input" id="libq" type="search" placeholder="${fmtNum(LIB.length)} entradas, en inglés o español" aria-label="Buscar en la biblioteca"></div>
    <div id="libRes"></div>
    <p class="meta" style="margin:16px 4px 0">Hoy llevas ${t.ex || 0} ejercicios, ${t.rev || 0} repasos y ${t.newLib || 0} palabras nuevas.</p>`;
  const re = () => { savePR(); const y = scrollY; renderWords(); scrollTo(0, y); };
  if ($('#bWhat')) $('#bWhat').onclick = () => {
    const paint = () => `<h3>Qué practicar</h3><p class="sub">Puedes elegir varias.</p><div class="pickl" id="pkC">${Object.entries(PR_CATS).map(([k, n]) => { const c = k === 'mine' ? NOTES.length : LIB.filter(x => x.cat === k).length; return `<button data-c="${k}" class="${PR.cats.includes(k) ? 'on' : ''}"><span>${esc(n)}<small>${fmtNum(c)} entradas</small></span></button>`; }).join('')}</div>
      <div class="row" style="margin-top:14px"><a class="btn grow" href="#practice">Más filtros</a><button class="btn primary grow" id="pkOk">Usar selección</button></div>`;
    openSheet(paint());
    const bind = () => {
      $('#pkC').onclick = e => { const b = e.target.closest('[data-c]'); if (!b) return; const c = b.dataset.c; const i = PR.cats.indexOf(c); if (i >= 0) { if (PR.cats.length > 1) PR.cats.splice(i, 1); } else PR.cats.push(c); if (!PR.cats.includes('phrasal')) { PR.verb = ''; PR.parts = []; } PR.tops = []; savePR(); $('#sheetBody').innerHTML = paint(); bind(); };
      $('#pkOk').onclick = () => { closeSheet(); re(); };
    };
    bind();
  };
  $('#bHow').onclick = () => {
    const hasPhr = PR.cats.includes('phrasal');
    openSheet(`<h3>Cómo practicar</h3><div class="pickl" id="pkH">${HOW.filter(h => !h.phr || hasPhr).map((h, i) => `${i === 8 ? '<div class="h2">Con frases de tus textos</div>' : ''}<button data-h="${h.id}" class="${PR.how === h.id ? 'on' : ''}"><span>${esc(h.n)}<small>${esc(h.d)}${h.lv ? '' : ' · sin niveles'}</small></span></button>`).join('')}</div>`);
    $('#pkH').onclick = e => { const b = e.target.closest('[data-h]'); if (!b) return; PR.how = b.dataset.h; savePR(); closeSheet(); re(); };
  };
  if ($('#bLv')) $('#bLv').onclick = e => { const b = e.target.closest('[data-l]'); if (!b) return; PR.lvl = +b.dataset.l; re(); };
  if ($('#bAdapt')) $('#bAdapt').onchange = e => { PR.adapt = e.target.checked; savePR(); };
  $('#bN').onclick = e => { const b = e.target.closest('[data-n]'); if (!b) return; PR.n = +b.dataset.n; re(); };
  $('#bGo').onclick = () => {
    savePR();
    if (vocabHow) {
      PR_IDS = list.map(x => x.id); store.set('practiceIds', PR_IDS);
      if (how.id === 'learn') return go('#learn/practice');
      if (how.id === 'review') return go('#ex/review/practice');
      return go('#ex/' + how.id + '/practice');
    }
    S.exLen = PR.n; saveSettings();
    go('#ex/' + how.id);
  };
  $('#dFilt').onclick = e => { const b = e.target.closest('[data-f]'); if (!b) return; DIC_F = b.dataset.f; DIC_N = 150; $$('#dFilt button').forEach(x => x.classList.toggle('active', x === b)); $('#dicBox').innerHTML = dicHTML(); };
  let tq; $('#dQ').addEventListener('input', e => { clearTimeout(tq); tq = setTimeout(() => { DIC_Q = e.target.value; DIC_N = 150; $('#dicBox').innerHTML = dicHTML(); }, 200); });
  $('#libq').addEventListener('input', e => {
    const q = norm(e.target.value); const box = $('#libRes');
    if (q.length < 2) { box.innerHTML = ''; return; }
    const r = NOTES.concat(LIB).filter(x => norm(x.term + ' ' + x.es + ' ' + (x.def || '')).includes(q)).slice(0, 50);
    box.innerHTML = r.length ? `<div>${r.map(anyRow).join('')}</div>` : '<div class="empty">Sin resultados.</div>';
  });
  const rc = rowClicks(() => $('#libq').dispatchEvent(new Event('input')));
  $('#view').onclick = e => {
    const az = e.target.closest('[data-az]'); if (az) { const el = $('#dl-' + az.dataset.az); if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' }); else toast('Ninguna por la ' + az.dataset.az); return; }
    if (e.target.closest('#dicMore')) { DIC_N += 150; $('#dicBox').innerHTML = dicHTML(); return; }
    const en = e.target.closest('.e[data-id]'); if (en) { openDetail(en.dataset.id); return; }
    if (e.target.closest('#libRes')) rc(e);
  };
}
addRoute('words', renderWords, 'words', 'Palabras');

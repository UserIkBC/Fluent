'use strict';
/* ==========================================================
   PRACTICA LO QUE QUIERAS
   Eliges qué (categorías), filtras (empieza por, partícula,
   verbo, tema, estado, búsqueda) y eliges cómo (test, escribir,
   aprender a fondo, tarjetas, frases con hueco, tu frase…)
   ========================================================== */
const PR_DEFAULT = { cats: ['phrasal'], q: '', start: '', verb: '', parts: [], tops: [], st: 'all', mode: 'pmc', dir: 'mix', n: 10 };
let PR = Object.assign({}, PR_DEFAULT, store.get('practice', {}));
let PR_IDS = store.get('practiceIds', []);
const savePR = () => store.set('practice', PR);
const PR_CATS = Object.assign({}, ...Object.keys(LIB_CATS).map(k => ({ [k]: LIB_CATS[k].name })), { mine: 'Mis palabras' });
const PR_STATES = { all: 'Todas', new: 'Sin aprender', learning: 'Aprendiendo', done: 'Dominadas', inrev: 'En mis repasos', failed: 'Las que he fallado', hard: '! Difíciles', unknown: '✗ No me la sé', fav: '★ Favoritas' };
const PR_MODES = [
  { id: 'pmc', name: 'Test', desc: 'Elige la respuesta correcta' },
  { id: 'prod', name: 'Dilo tú', desc: 'Del español al inglés, escribiendo' },
  { id: 'pctx', name: 'Frases con hueco', desc: 'Qué expresión encaja en la frase' },
  { id: 'learn', name: 'Aprender a fondo', desc: '5 pasos por palabra, de 6 en 6' },
  { id: 'review', name: 'Tarjetas', desc: 'Todas las de tu selección' },
  { id: 'own', name: 'Tu propia frase', desc: 'Escribe frases tuyas con ellas' },
  { id: 'particle', name: '¿Qué partícula?', desc: 'Solo phrasal verbs', phr: true }
];
const firstWord = t => termWords(String(t).split('/')[0].replace(/\(.*?\)/g, ' ').replace(/^\s*to\s+/i, ''))[0] || '';
const partsOf = x => typeof phrParts === 'function' ? phrParts(x.term).parts : [];
function prBase() {
  let a = [];
  PR.cats.forEach(c => { a = a.concat(c === 'mine' ? NOTES.filter(n => n.term) : LIB.filter(x => x.cat === c)); });
  return a;
}
function prFilter(list, skip) {
  const q = norm(PR.q), st = norm(PR.start);
  return list.filter(x => {
    if (q && !norm(x.term + ' ' + (x.es || '') + ' ' + (x.def || '')).includes(q)) return false;
    if (st && skip !== 'start' && !norm(String(x.term).replace(/^\s*to\s+/i, '')).startsWith(st)) return false;
    if (PR.verb && skip !== 'verb' && firstWord(x.term) !== PR.verb) return false;
    if (PR.parts.length && skip !== 'parts') { const p = partsOf(x); if (!PR.parts.some(z => p.includes(z))) return false; }
    if (PR.tops.length && skip !== 'tops' && !PR.tops.includes(x.top)) return false;
    const s = PR.st, m = mark(x.id);
    if (s === 'new' && x.srs) return false;
    if ((s === 'learning' || s === 'done') && itemStatus(x) !== s) return false;
    if (s === 'inrev' && !x.srs) return false;
    if (s === 'failed' && !(x.srs && (x.srs.lapses || 0) > 0)) return false;
    if (['hard', 'unknown', 'fav'].includes(s) && !(s === 'hard' ? m.hard : s === 'fav' ? m.fav : m.st === 'unknown')) return false;
    return true;
  });
}
function prName() {
  const bits = [PR.cats.map(c => PR_CATS[c]).join(' + ')];
  if (PR.verb) bits.push(PR.verb + '…'); if (PR.start) bits.push('«' + PR.start + '…»'); if (PR.parts.length) bits.push(PR.parts.join('/'));
  if (PR.tops.length) bits.push(PR.tops.map(t => TOPICS[t] || t).join(', ')); if (PR.q) bits.push('«' + PR.q + '»'); if (PR.st !== 'all') bits.push(PR_STATES[PR.st].replace(/^[!✗★] /, '').toLowerCase());
  return bits.join(' · ');
}

/* la selección se comporta como cualquier otro conjunto (marcas, listas…) en todos los ejercicios */
(function () {
  const _isSetKey = isSetKey, _setItems = setItems, _setName = setName;
  isSetKey = a => a === 'practice' || a === 'set:practice' || _isSetKey(a);
  setItems = key => key === 'practice' ? PR_IDS.map(itemById).filter(Boolean) : _setItems(key);
  setName = key => key === 'practice' ? prName() : _setName(key);
})();

/* test con dirección elegida */
EXTRA_TITLES.pmc = 'Test';
EXTRA_GENS.pmc = arg => {
  const set = setFromArg(arg || 'practice').filter(x => x.es && x.term); if (set.length < 1) return null;
  const item = pick(set);
  const pool = set.length >= 8 ? set : set.concat(LIB.filter(x => x.cat === item.cat));
  const others = shuffle(pool.filter(x => x !== item && norm(x.es) !== norm(item.es) && norm(x.term) !== norm(item.term))).slice(0, 3);
  if (others.length < 3) return null;
  let d = PR.dir; if (d === 'mix') d = pick(item.def ? ['en', 'es', 'def'] : ['en', 'es']); if (d === 'def' && !item.def) d = 'es';
  if (d === 'en') return { type: 'vocab', item, prompt: item.term, sub: '¿Qué significa?', answer: item.es, options: shuffle([item.es].concat(others.map(o => o.es))), say: true };
  if (d === 'def') return { type: 'vocab', item, prompt: item.def, sub: '¿Qué palabra o expresión es?', answer: item.term, options: shuffle([item.term].concat(others.map(o => o.term))), long: true };
  return { type: 'vocab', item, prompt: item.es, sub: '¿Cómo se dice en inglés?', answer: item.term, options: shuffle([item.term].concat(others.map(o => o.term))) };
};
/* frase con hueco: ejemplos de la ficha o de los textos de la app */
EXTRA_TITLES.pctx = 'Frases con hueco';
EXTRA_GENS.pctx = arg => {
  const set = setFromArg(arg || 'practice').filter(x => x.term);
  for (const x of shuffle(set).slice(0, 40)) {
    const sents = [x.ex, ...(x.exs ? String(x.exs).split('\n') : []), ...((x.srs && x.srs.own) || []), ...poolExamples(x.term, 3)].filter(Boolean).map(s => String(s).split(' / ')[0]);
    for (const s of shuffle(sents)) {
      const bl = blankIn(s, x.term); if (!bl) continue;
      const pool = set.length >= 8 ? set : set.concat(LIB.filter(y => y.cat === x.cat));
      const others = shuffle(pool.filter(y => y !== x && norm(y.term) !== norm(x.term))).slice(0, 3).map(y => y.term);
      if (others.length < 3) continue;
      return { type: 'pctx', x, s, bl, options: shuffle([x.term].concat(others)) };
    }
  }
  return null;
};
EXTRA_RENDER.pctx = q => {
  const x = q.x;
  $('#view').innerHTML = `${exHeader()}<div id="qArea"><p class="muted" style="margin:16px 0 6px">¿Qué falta en la frase?</p>
    <div class="card pad"><div class="q" style="margin:0;font-weight:500;font-size:19px;line-height:1.5">${q.bl.html}</div><div class="meta" style="margin-top:6px">Elige la expresión (en la frase puede ir conjugada).</div></div>
    <div class="opts">${q.options.map(o => `<button class="opt" data-o="${esc(o)}">${esc(o)}</button>`).join('')}</div></div>`;
  const said = q.bl.said;
  $$('.opt').forEach(b => b.onclick = () => {
    if ($('.opt.right')) return; const ok = b.dataset.o === x.term;
    $$('.opt').forEach(o => { if (o.dataset.o === x.term) o.classList.add('right'); }); if (!ok) b.classList.add('wrong');
    if (x.srs && !ok) grade(x, 0);
    $('.gap', $('#qArea')).textContent = said;
    q.it = { s: q.s, src: CATS[x.cat] || 'Mis palabras' };
    answered(ok, `<div style="margin-top:4px"><b>${esc(x.term)}</b> · ${esc(x.es || '')}</div>${x.def ? `<div class="muted" style="font-size:14px">${esc(x.def)}</div>` : ''}`);
  });
};

/* ---------- pantalla ---------- */
function renderPractice(arg) {
  if (arg) { // atajos: cat:phrasal, p:up, v:get, set:fav…
    const [k, v] = [arg.split(':')[0], arg.split(':').slice(1).join(':')];
    if (k === 'cat' && (LIB_CATS[v] || v === 'mine')) Object.assign(PR, { cats: [v], q: '', start: '', verb: '', parts: [], tops: [], st: 'all' });
    if (k === 'p') Object.assign(PR, { cats: ['phrasal'], q: '', start: '', verb: '', parts: [v], tops: [], st: 'all' });
    if (k === 'v') Object.assign(PR, { cats: ['phrasal'], q: '', start: '', verb: v, parts: [], tops: [], st: 'all' });
    savePR(); history.replaceState(null, '', '#practice');
  }
  const base = prBase();
  const hasPhr = PR.cats.includes('phrasal');
  const verbs = hasPhr ? Object.entries(prFilter(base.filter(x => x.cat === 'phrasal'), 'verb').reduce((m, x) => { const v = firstWord(x.term); if (v) m[v] = (m[v] || 0) + 1; return m; }, {})).sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0])) : [];
  const partsCount = hasPhr ? prFilter(base.filter(x => x.cat === 'phrasal'), 'parts').reduce((m, x) => { partsOf(x).forEach(p => m[p] = (m[p] || 0) + 1); return m; }, {}) : {};
  const parts = Object.entries(partsCount).sort((a, b) => b[1] - a[1]);
  const tops = Object.entries(prFilter(base, 'tops').reduce((m, x) => { if (TOPICS[x.top]) m[x.top] = (m[x.top] || 0) + 1; return m; }, {})).sort((a, b) => b[1] - a[1]);
  const list = prFilter(base);
  const modes = PR_MODES.filter(m => !m.phr || hasPhr);
  if (!modes.some(m => m.id === PR.mode)) PR.mode = 'pmc';
  $('#view').innerHTML = `
    <div class="h1">Practica lo que quieras</div>
    <p class="sub">Elige qué, filtra y elige cómo. Se queda guardado para la próxima vez.</p>
    <div class="h2">Qué</div>
    <div class="chips wrapchips" id="prCats">${Object.entries(PR_CATS).map(([k, n]) => `<button class="chip ${PR.cats.includes(k) ? 'active' : ''}" data-c="${k}">${esc(n)}</button>`).join('')}</div>
    <div class="h2">Filtros</div>
    <div class="card set-group">
      <div class="row" style="gap:10px"><div class="grow"><label class="lbl" style="margin-top:0">Empieza por</label><input class="input" id="prStart" value="${esc(PR.start)}" placeholder="get, take, a…" autocapitalize="off" autocomplete="off" spellcheck="false"></div>
        <div class="grow"><label class="lbl" style="margin-top:0">Contiene</label><input class="input" id="prQ" value="${esc(PR.q)}" placeholder="en inglés o español" autocapitalize="off" autocomplete="off" spellcheck="false"></div></div>
      ${hasPhr ? `<label class="lbl">Phrasal verbs con el verbo</label><select class="select" id="prVerb"><option value="">Cualquier verbo</option>${verbs.map(([v, c]) => `<option value="${esc(v)}" ${v === PR.verb ? 'selected' : ''}>${esc(v)} · ${c}</option>`).join('')}${PR.verb && !verbs.some(([v]) => v === PR.verb) ? `<option value="${esc(PR.verb)}" selected>${esc(PR.verb)} · 0</option>` : ''}</select>
      <label class="lbl">Con la partícula</label><div class="chips wrapchips" id="prParts">${parts.map(([p, c]) => `<button class="chip ${PR.parts.includes(p) ? 'active' : ''}" data-p="${esc(p)}">${esc(p)} <span class="muted">${c}</span></button>`).join('')}</div>` : ''}
      ${tops.length > 1 ? `<label class="lbl">Tema</label><div class="chips wrapchips" id="prTops">${tops.map(([t, c]) => `<button class="chip ${PR.tops.includes(t) ? 'active' : ''}" data-t="${esc(t)}">${esc(TOPICS[t])} <span class="muted">${c}</span></button>`).join('')}</div>` : ''}
      <label class="lbl">Cuáles</label><select class="select" id="prSt">${Object.entries(PR_STATES).map(([k, n]) => `<option value="${k}" ${k === PR.st ? 'selected' : ''}>${esc(n)}</option>`).join('')}</select>
      <div class="row" style="margin-top:12px"><button class="btn small ghost" id="prReset">Quitar filtros</button></div>
    </div>
    <div class="row" style="margin:16px 0 8px"><b class="grow" style="font-size:18px">${list.length} ${list.length === 1 ? 'entrada' : 'entradas'}</b>${list.length ? `<button class="btn small" id="prList">Ver la lista</button>` : ''}</div>
    <div id="prListBox" class="hidden"><div class="card">${list.slice(0, 200).map(x => anyRow(x)).join('')}</div>${list.length > 200 ? `<p class="meta">Y ${list.length - 200} más.</p>` : ''}${list.some(x => x.lib && !x.srs) ? `<button class="btn block" id="prAddAll" style="margin-top:8px">Añadir todas a mis repasos</button>` : ''}</div>
    <div class="h2">Cómo</div>
    <div class="modes" id="prModes">${modes.map(m => `<button class="mode ${PR.mode === m.id ? 'on' : ''}" data-m="${m.id}"><b>${m.name}</b><span>${m.desc}</span></button>`).join('')}</div>
    ${PR.mode === 'pmc' ? `<label class="lbl">Qué te pregunta</label><div class="seg" id="prDir">${[['mix', 'Mezclado'], ['en', 'Inglés → español'], ['es', 'Español → inglés'], ['def', 'Definición']].map(([k, n]) => `<button class="${PR.dir === k ? 'on' : ''}" data-d="${k}">${n}</button>`).join('')}</div>` : ''}
    ${['pmc', 'prod', 'pctx', 'own', 'particle'].includes(PR.mode) ? `<label class="lbl">Preguntas</label><div class="seg" id="prN">${[5, 10, 20, 30].map(k => `<button class="${PR.n === k ? 'on' : ''}" data-n="${k}">${k}</button>`).join('')}</div>` : ''}
    <button class="btn primary block" id="prGo" style="margin-top:16px" ${list.length ? '' : 'disabled'}>${list.length ? 'Empezar' : 'No hay nada con estos filtros'}</button>
    ${list.length && list.length < 4 && ['pmc', 'pctx'].includes(PR.mode) ? '<p class="meta" style="text-align:center">Con tan pocas, las opciones falsas saldrán de la misma categoría.</p>' : ''}`;
  const re = () => { savePR(); const y = scrollY; renderPractice(); scrollTo(0, y); };
  $('#prCats').onclick = e => { const b = e.target.closest('[data-c]'); if (!b) return; const c = b.dataset.c; const i = PR.cats.indexOf(c); if (i >= 0) { if (PR.cats.length > 1) PR.cats.splice(i, 1); } else PR.cats.push(c); if (!PR.cats.includes('phrasal')) { PR.verb = ''; PR.parts = []; } PR.tops = []; re(); };
  let tq; const typed = (id, k) => $(id).addEventListener('input', e => { PR[k] = e.target.value.trim(); clearTimeout(tq); tq = setTimeout(() => { const pos = e.target.selectionStart; re(); const el = $(id); el.focus(); try { el.setSelectionRange(pos, pos); } catch (er) { } }, 450); });
  typed('#prStart', 'start'); typed('#prQ', 'q');
  if ($('#prVerb')) $('#prVerb').onchange = e => { PR.verb = e.target.value; re(); };
  if ($('#prParts')) $('#prParts').onclick = e => { const b = e.target.closest('[data-p]'); if (!b) return; const p = b.dataset.p; const i = PR.parts.indexOf(p); if (i >= 0) PR.parts.splice(i, 1); else PR.parts.push(p); re(); };
  if ($('#prTops')) $('#prTops').onclick = e => { const b = e.target.closest('[data-t]'); if (!b) return; const t = b.dataset.t; const i = PR.tops.indexOf(t); if (i >= 0) PR.tops.splice(i, 1); else PR.tops.push(t); re(); };
  $('#prSt').onchange = e => { PR.st = e.target.value; re(); };
  $('#prReset').onclick = () => { Object.assign(PR, { q: '', start: '', verb: '', parts: [], tops: [], st: 'all' }); re(); };
  if ($('#prList')) $('#prList').onclick = () => { $('#prListBox').classList.toggle('hidden'); };
  if ($('#prAddAll')) $('#prAddAll').onclick = () => { const l = list.filter(x => x.lib && !x.srs); if (l.length > 15 && !confirm('¿Añadir ' + l.length + ' entradas a tus repasos de golpe?')) return; l.forEach(x => startLearning(x)); saveLearn(); toast(l.length + ' añadidas a tus repasos'); re(); };
  $('#prListBox').onclick = rowClicks(re);
  $('#prModes').onclick = e => { const b = e.target.closest('[data-m]'); if (!b) return; PR.mode = b.dataset.m; re(); };
  if ($('#prDir')) $('#prDir').onclick = e => { const b = e.target.closest('[data-d]'); if (!b) return; PR.dir = b.dataset.d; re(); };
  if ($('#prN')) $('#prN').onclick = e => { const b = e.target.closest('[data-n]'); if (!b) return; PR.n = +b.dataset.n; re(); };
  $('#prGo').onclick = () => {
    PR_IDS = list.map(x => x.id); store.set('practiceIds', PR_IDS); savePR();
    if (PR.mode === 'learn') { go('#learn/practice'); return; }
    if (PR.mode === 'review') { go('#ex/review/practice'); return; }
    go('#ex/' + PR.mode + '/practice');
  };
}
addRoute('practice', renderPractice, 'words', 'Practicar');
/* el número de preguntas elegido se aplica a la sesión */
addRoute('ex', arg => { startExercise(arg); if (SESSION && /\/practice$/.test(arg || '')) SESSION.total = PR.n; }, 'words', 'Ejercicios');

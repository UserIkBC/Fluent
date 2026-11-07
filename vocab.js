'use strict';
/* ==========================================================
   PALABRAS · repaso, palabras nuevas, biblioteca completa,
   phrasal verbs por partícula, gramática y ejercicios
   ========================================================== */

/* ---------- motor de sesiones de ejercicios ---------- */
let SESSION = null;
const EXTRA_GENS = {}, EXTRA_RENDER = {}, EXTRA_TITLES = {}, EXTRA_STARTS = {};
function startExercise(arg) {
  const [mode, ...r] = (arg || '').split('/'); const srcId = r.length ? decodeURIComponent(r.join('/')) : null;
  if (mode === 'review') return startReview(srcId);
  if (EXTRA_STARTS[mode]) return EXTRA_STARTS[mode](srcId);
  const gen = EXTRA_GENS[mode] || { gap: genGap, cloze: genCloze, order: genOrder, dict: genDict, vocab: genVocab, trans: genTrans, gram: genGram, pair: genPair, particle: genParticle }[mode];
  if (!gen) return go('#words');
  SESSION = { mode, srcId, gen, n: 0, total: S.exLen || 10, ok: 0 };
  nextQ();
}
const MODE_TITLE_BASE = { gap: 'Huecos en contexto', cloze: 'Palabra que falta', order: 'Ordena la frase', dict: 'Dictado', vocab: 'Test de vocabulario', trans: 'Tradúcela tú', gram: 'Gramática', pair: 'Sonidos parecidos', particle: 'Phrasal verbs' };
const MODE_TITLE = new Proxy(MODE_TITLE_BASE, { get: (o, k) => o[k] || EXTRA_TITLES[k] || 'Práctica' });
function exHeader() {
  const sid = SESSION.srcId;
  const sub = sid === 'legal' ? ' · jurídico' : sid === 'business' ? ' · negocios' : sid === 'false' ? ' · falsos amigos' : isSetKey(sid) ? ' · ' + esc(setName(sid.replace(/^set:/, ''))) : sid === 'today' ? ' · palabras de hoy' : sid && /^[ogwbm]:/.test(sid) ? ' · este texto' : '';
  return `<div class="row" style="margin-bottom:8px"><b class="grow">${MODE_TITLE[SESSION.mode]}${sub}</b><span class="muted">${SESSION.n + 1}/${SESSION.total}</span></div><div class="progressbar"><i style="width:${(SESSION.n / SESSION.total) * 100}%"></i></div>`;
}
async function nextQ() {
  if (SESSION.n >= SESSION.total) return endSession();
  if (SESSION.mode === 'trans') $('#view').innerHTML = exHeader() + '<div class="spinner"></div>';
  const sess = SESSION;
  let q = null; try { q = await SESSION.gen(SESSION.srcId); } catch (e) { q = null; }
  if (sess !== SESSION || !location.hash.startsWith('#ex/')) return;
  if (!q) { $('#view').innerHTML = `<div class="card pad empty">Aún no hay suficiente material para este ejercicio.<br>Lee algo o guarda palabras y vuelve a intentarlo.</div><a class="btn block" href="#words">Volver</a>`; return; }
  SESSION.q = q;
  ({ gap: renderGapQ, cloze: renderClozeQ, order: renderOrderQ, dict: renderDictQ, vocab: renderVocabQ, trans: renderTransQ, gram: renderGramQ, pair: renderPairQ, particle: renderParticleQ }[q.type] || EXTRA_RENDER[q.type])(q);
}
function endSession() {
  if (SESSION.mode === 'gram' && SESSION.srcId) { GPROG[SESSION.srcId] = Math.max(GPROG[SESSION.srcId] || 0, SESSION.ok); store.set('gprog', GPROG); }
  const pct = Math.round(SESSION.ok / SESSION.total * 100);
  $('#view').innerHTML = `<div class="card pad" style="text-align:center;padding:30px 18px">
    <div class="muted">${MODE_TITLE[SESSION.mode]}</div><div style="font-family:var(--serif);font-size:54px;font-weight:700;color:${pct >= 70 ? 'var(--good)' : 'var(--warm)'}">${SESSION.ok}/${SESSION.total}</div>
    <p>${pct >= 90 ? 'Excelente.' : pct >= 70 ? 'Muy bien, sigue así.' : pct >= 50 ? 'Bien, pero hay margen.' : 'Toca repasar un poco más.'}</p>
    <button class="btn primary block" id="again">Otra ronda</button><a class="btn block ghost" href="${HOME_SESSION ? '#home' : '#words'}" style="margin-top:8px">${HOME_SESSION ? 'Volver a mi sesión' : 'Volver'}</a></div>`;
  $('#again').onclick = () => { SESSION.n = 0; SESSION.ok = 0; SESSION.gq = null; nextQ(); };
  if (typeof sessionStepDone === 'function') sessionStepDone('ex');
}

/* ---------- tarjetas de producción (escribiendo) ---------- */
EXTRA_TITLES.prod = 'Dilo tú en inglés';
EXTRA_GENS.prod = arg => {
  const pool = (isSetKey(arg) ? setFromArg(arg) : LIB.filter(x => x.srs).concat(NOTES)).filter(x => x.es && x.term && x.term.split(' ').length <= 8);
  const base = pool.length >= 4 ? pool : pool.concat(LIB.filter(x => ['chunk', 'convo', 'phrasal', 'idiom'].includes(x.cat)).slice(0, 80));
  if (!base.length) return null; return { type: 'prod', x: pick(base) };
};
EXTRA_RENDER.prod = q => {
  const x = q.x;
  $('#view').innerHTML = `${exHeader()}<div id="qArea"><p class="muted" style="margin:16px 0 6px">¿Cómo se dice en inglés?</p>
    <div class="card flash" style="min-height:140px"><div class="term" style="font-size:24px">${esc(x.es)}</div>${x.def ? `<div class="muted" style="margin-top:8px;font-size:14px">Pista · ${esc(x.def)}</div>` : ''}</div>
    <form class="row" id="pF" style="margin-top:12px"><input class="input grow" id="pIn" placeholder="Escríbelo en inglés" autocapitalize="off" autocomplete="off" spellcheck="false"><button class="btn primary">OK</button></form>
    <button class="btn ghost small" id="pGive" style="margin-top:8px">No me sale</button></div>`;
  setTimeout(() => $('#pIn') && $('#pIn').focus(), 100);
  const check = said => {
    if ($('.feedback')) return;
    const target = x.term.replace(/\(.*?\)/g, '').split('/')[0];
    const r = lcsDiff(tokenize(target).map(t => t.w), tokenize(said).map(t => t.w)); const ok = said && r.score >= 0.8;
    if (ok && x.srs) { x.srs.prodOk = (x.srs.prodOk || 0) + 1; x.srs.upd = Date.now(); if (x.lib) saveLearn(); else saveNotes(); }
    if (x.srs && !ok) grade(x, 0);
    q.it = { s: x.ex || x.term, src: (LIB_CATS[x.cat] || {}).name || 'Mis palabras' };
    answered(ok, `${said ? `<div style="margin-top:4px">Has escrito · «${esc(said)}»</div>` : ''}<div style="margin-top:4px"><b>${esc(x.term)}</b></div>${x.ex ? `<div class="ctx muted" style="margin-top:4px">${esc(x.ex)}</div>` : ''}`);
    TTS.speak(x.term, { rate: 0.9 });
  };
  $('#pF').onsubmit = e => { e.preventDefault(); const v = $('#pIn').value.trim(); if (v) check(v); };
  $('#pGive').onclick = () => check('');
};

/* ---------- ¿cuál suena natural? (frases que delatan a un español) ---------- */
EXTRA_TITLES.native = '¿Cuál suena natural?';
EXTRA_GENS.native = () => { const N = window.NATIVE || []; if (N.length < 4) return null; const n = pick(N); const wrongs = shuffle(N.filter(x => x !== n)).slice(0, 2).map(x => x[0]); return { type: 'native', n, opts: shuffle([n[1].split(' / ')[0], n[0]].concat(Math.random() < 0.5 ? [] : [])) }; };
EXTRA_RENDER.native = q => {
  const n = q.n; const right = n[1].split(' / ')[0];
  $('#view').innerHTML = `${exHeader()}<div id="qArea"><p class="muted" style="margin:16px 0 10px">Una de estas frases suena a español traducido. ¿Cuál diría un nativo?</p>
    <div class="opts">${q.opts.map(o => `<button class="opt" data-o="${esc(o)}">${esc(o)}</button>`).join('')}</div></div>`;
  $$('.opt').forEach(b => b.onclick = () => {
    if ($('.opt.right')) return;
    const ok = b.dataset.o === right;
    $$('.opt').forEach(x => { if (x.dataset.o === right) x.classList.add('right'); });
    if (!ok) b.classList.add('wrong');
    q.it = { s: right, src: 'Inglés natural' };
    answered(ok, `<div style="margin-top:4px"><span class="wrongline">${esc(n[0])}</span></div><div><b>${esc(n[1])}</b></div><div class="muted" style="font-size:14px">${esc(n[2])}</div>`);
  });
};

/* ==========================================================
   PESTAÑA PALABRAS
   ========================================================== */
function catCounts(cat) { const a = LIB.filter(x => x.cat === cat); return { total: a.length, learned: a.filter(x => x.srs).length }; }
const MODES = [
  { id: 'vocab', ic: 'quiz', name: 'Test de vocabulario', desc: 'Inglés, español y definiciones' },
  { id: 'gap', ic: 'gap', name: 'Huecos en contexto', desc: 'Elige la palabra que falta' },
  { id: 'cloze', ic: 'pen', name: 'Palabra que falta', desc: 'Escríbela tú (preposiciones, conectores…)' },
  { id: 'particle', ic: 'link', name: 'Phrasal verbs', desc: '¿Qué partícula va? Up, out, off…' },
  { id: 'prod', ic: 'cards', name: 'Dilo tú en inglés', desc: 'Del español al inglés, escribiendo' },
  { id: 'trans', ic: 'pen', name: 'Tradúcela tú', desc: 'Frases enteras del español al inglés' },
  { id: 'order', ic: 'order', name: 'Ordena la frase', desc: 'Construye frases correctas' },
  { id: 'gram', ic: 'pen', name: 'Gramática', desc: 'Preguntas de todas las lecciones' },
  { id: 'native', ic: 'spark', name: '¿Cuál suena natural?', desc: 'Detecta lo que suena a traducido' }
];
function renderWords() {
  const due = dueCards().length; const t = today();
  const left = Math.max(0, S.newPerDay - (t.newLib || 0));
  const prog = c => { const k = catCounts(c); return `<div class="mini-prog"><i style="width:${k.total ? k.learned / k.total * 100 : 0}%"></i></div><span class="muted" style="font-size:12px">${k.learned}/${k.total}</span>`; };
  $('#view').innerHTML = `
    <div class="h1">Palabras</div>
    <div class="stats3"><div><b>${fmtNum(knownCount())}</b><span>palabras conocidas</span></div><div><b>${fmtNum(NOTES.length + LIB.filter(x => x.srs).length)}</b><span>en tus repasos</span></div><div><b>${due}</b><span>pendientes hoy</span></div></div>
    ${due ? `<a class="card pad cta" href="#ex/review" style="border-color:var(--warm)"><div class="grow"><b>Repasar ${due} ${due === 1 ? 'tarjeta' : 'tarjetas'}</b><div class="muted" style="font-size:14px">Con la frase donde encontraste cada palabra</div></div><span class="btn warm small">Empezar</span></a>` : `<a class="card pad cta" href="#ex/review"><div class="grow"><b>Sin repasos pendientes</b><div class="muted" style="font-size:14px">Puedes hacer un repaso extra</div></div><span class="btn small">Repasar</span></a>`}
    <a class="card pad cta" href="#new"><div class="grow"><b>${left ? 'Aprender ' + left + ' palabras nuevas' : 'Aprender 5 más'}</b><div class="muted" style="font-size:14px">De la biblioteca, mezclando ${Object.keys(S.mix).filter(k => S.mix[k]).length} categorías</div></div><span class="btn primary small">Empezar</span></a>
    <a class="card pad cta" href="#freq"><div class="grow"><b>Las 25.000 palabras más usadas</b><div class="muted" style="font-size:14px">Descubre las frecuentes que aún no conoces</div></div><span class="muted">›</span></a>
    <div class="h2">Biblioteca</div>
    <div class="modes">${['word', 'phrasal', 'idiom', 'collocs'].map(c => c === 'collocs' ? '' : '').join('')}${Object.keys(LIB_CATS).map(c => hubTile('#lib/' + c, LIB_CATS[c].ic, LIB_CATS[c].name, LIB_CATS[c].desc, prog(c))).join('')}
      ${hubTile('#phrasal', 'link', 'Phrasal verbs por partícula', 'Entiende la lógica de up, out, off… y agrúpalos por verbo')}
      ${hubTile('#grammar', 'pen', 'Gramática', (window.GRAMMAR || []).length + ' lecciones de consulta', `<span class="muted" style="font-size:12px">${Object.keys(GPROG).length} practicadas</span>`)}
      ${hubTile('#sit', 'chat', 'Situaciones', 'Frases para la vida real y el despacho')}
      ${hubTile('#packs', 'spark', 'Lo que dicen los nativos', 'Frases para el pub, la oficina, el fútbol…')}
      ${hubTile('#natural', 'spark', 'Inglés natural', (window.NATIVE || []).length + ' frases que delatan a un español')}</div>
    <div class="h2">Ejercicios</div>
    <div class="modes">${MODES.map(m => `<a class="mode" href="#ex/${m.id}"><div class="ico">${IC[m.ic]}</div><b>${m.name}</b><span>${m.desc}</span></a>`).join('')}</div>
    <div class="h2">Lo tuyo</div>
    <div class="mysets">${[['set:mine', '✎', 'Mis palabras', NOTES.length], ['fav', '★', 'Favoritas', setItems('fav').length], ['unknown', '✗', 'No me la sé', setItems('unknown').length], ['hard', '!', 'Difíciles', setItems('hard').length]].concat(LISTS.map(L => ['list:' + L.id, '▤', L.name, L.items.length])).concat(LABELS.map(L => ['label:' + L.id, '●', L.name, setItems('label:' + L.id).length])).map(([k, ic, n, c]) => `<div class="myset ${c < 2 ? 'off' : ''}"><span class="mkbig">${ic}</span><div class="grow"><b>${esc(n)}</b><div class="muted" style="font-size:13px">${c} ${c === 1 ? 'entrada' : 'entradas'}</div></div>${c >= 2 ? `<a class="btn small" href="#ex/vocab/${k}">Test</a><a class="btn small" href="#ex/review/${k}">Tarjetas</a>` : ''}</div>`).join('')}</div>
    <div class="h2">Buscar</div>
    <div class="search">${IC.search}<input class="input" id="libq" type="search" placeholder="Busca en las ${fmtNum(LIB.length)} entradas (inglés o español)…"></div>
    <div id="libRes"></div>
    <p class="meta" style="margin-top:14px">Hoy · ${t.ex || 0} ejercicios · ${t.rev || 0} repasos · ${t.newLib || 0} palabras nuevas</p>`;
  $('#libq').addEventListener('input', e => {
    const q = norm(e.target.value); const box = $('#libRes');
    if (q.length < 2) { box.innerHTML = ''; return; }
    const r = NOTES.concat(LIB).filter(x => norm(x.term + ' ' + x.es + ' ' + (x.def || '')).includes(q)).slice(0, 50);
    box.innerHTML = r.length ? `<div class="card">${r.map(anyRow).join('')}</div>` : '<div class="empty">Sin resultados.</div>';
  });
  $('#view').onclick = rowClicks(() => $('#libq').dispatchEvent(new Event('input')));
}

/* ---------- lista de una categoría ---------- */
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
let libState = { top: 'all', filter: 'all' };
function renderVocabCat(cat) {
  if (!LIB_CATS[cat]) return renderWords();
  const items = LIB.filter(x => x.cat === cat);
  const tops = Array.from(new Set(items.map(x => x.top))).filter(t => TOPICS[t]);
  if (libState.cat !== cat) libState = { cat, top: 'all', filter: 'all' };
  $('#view').innerHTML = `
    <div class="h1">${esc(LIB_CATS[cat].name)}</div>
    <p class="sub">${esc(LIB_CATS[cat].desc)} · ${items.length} entradas · ${items.filter(x => x.srs).length} en tus repasos</p>
    <div class="row wrap" style="margin:0 0 12px"><a class="btn small primary" href="#ex/vocab/cat:${cat}">Test</a><a class="btn small" href="#ex/prod/cat:${cat}">Dilo tú</a>${cat === 'phrasal' ? '<a class="btn small" href="#phrasal">Por partícula</a><a class="btn small" href="#ex/particle">¿Qué partícula?</a>' : ''}</div>
    ${tops.length > 1 ? `<div class="chips" id="topChips"><button class="chip ${libState.top === 'all' ? 'active' : ''}" data-t="all">Todas</button>${tops.map(t => `<button class="chip ${libState.top === t ? 'active' : ''}" data-t="${t}">${esc(TOPICS[t])}</button>`).join('')}</div>` : ''}
    <div class="row wrap" style="margin-bottom:10px"><select class="select" id="libFilter" style="width:auto;padding:8px 10px;font-size:14px"><option value="all">Todas</option><option value="new">Sin aprender</option><option value="learning">Aprendiendo</option><option value="done">Dominadas</option><option value="fav">★ Favoritas</option><option value="unknown">✗ No me la sé</option><option value="hard">! Difíciles</option><option value="known">✓ Me la sé</option>${LABELS.map(L => `<option value="label:${L.id}">${esc(L.name)}</option>`).join('')}</select><span class="grow"></span><button class="btn small" id="learnAll">Añadir a repasos</button></div>
    <div id="libList"></div><button class="btn block hidden" id="libMore" style="margin-top:10px">Ver más</button>`;
  $('#libFilter').value = libState.filter;
  let shown = 60;
  const list = () => items.filter(x => (libState.top === 'all' || x.top === libState.top) && (libState.filter === 'all' || (['new', 'learning', 'done'].includes(libState.filter) ? itemStatus(x) === libState.filter : matchMark(x.id, libState.filter))));
  const paint = () => { const l = list(); $('#libList').innerHTML = l.length ? `<div class="card">${l.slice(0, shown).map(x => libRow(x)).join('')}</div>` : '<div class="empty">Nada por aquí.</div>'; $('#libMore').classList.toggle('hidden', l.length <= shown); };
  if ($('#topChips')) $('#topChips').onclick = e => { const b = e.target.closest('.chip'); if (!b) return; libState.top = b.dataset.t; shown = 60; $$('#topChips .chip').forEach(c => c.classList.toggle('active', c === b)); paint(); };
  $('#libFilter').onchange = e => { libState.filter = e.target.value; shown = 60; paint(); };
  $('#libMore').onclick = () => { shown += 60; paint(); };
  $('#learnAll').onclick = () => { const l = list().filter(x => !x.srs); if (!l.length) { toast('Ya están todas en tus repasos'); return; } if (l.length > 15 && !confirm('¿Añadir ' + l.length + ' entradas a tus repasos de golpe?')) return; l.forEach(x => startLearning(x)); saveLearn(); toast(l.length + ' añadidas a tus repasos'); paint(); };
  $('#view').onclick = rowClicks(paint);
  paint();
  const a = $('#topChips .chip.active'); if (a) a.scrollIntoView({ inline: 'center', block: 'nearest' });
}

/* ---------- palabras nuevas del día ---------- */
function nextNewItems(n) {
  const cats = Object.keys(LIB_CATS).filter(c => S.mix[c]);
  const pools = cats.map(c => LIB.filter(x => x.cat === c && !x.srs));
  const out = []; let i = 0, guard = 0;
  while (out.length < n && guard++ < 4000 && pools.some(p => p.length)) { const p = pools[i % pools.length]; if (p.length) out.push(p.shift()); i++; }
  return out;
}
function renderNewWords(arg) {
  const left = Math.max(0, S.newPerDay - (today().newLib || 0));
  const batch = nextNewItems(arg === 'more' || !left ? 5 : left);
  if (!batch.length) { $('#view').innerHTML = emptyBox('¡Has visto toda la biblioteca! Sigue leyendo y guardando palabras de los textos.', '#read', 'Ir a Leer'); return; }
  let i = 0, learned = 0;
  const show = () => {
    if (i >= batch.length) {
      $('#view').innerHTML = `<div class="card pad" style="text-align:center;padding:28px"><div style="font-size:42px">🎉</div><b>${learned} ${learned === 1 ? 'entrada nueva' : 'entradas nuevas'} en tus repasos</b><p class="muted">Ahora un test rápido para fijarlas. Mañana te las volveré a preguntar.</p>
        <a class="btn primary block" href="#ex/vocab/today">Test rápido</a><a class="btn ghost block" href="${HOME_SESSION ? '#home' : '#words'}" style="margin-top:8px">Más tarde</a></div>`;
      if (typeof sessionStepDone === 'function') sessionStepDone('new');
      return;
    }
    const x = batch[i];
    const more = moreExamples(x, 2);
    $('#view').innerHTML = `<div class="row" style="margin-bottom:8px"><b class="grow">Palabras nuevas</b><span class="muted">${i + 1}/${batch.length}</span></div>
      <div class="progressbar"><i style="width:${i / batch.length * 100}%"></i></div>
      <div class="card flash" style="margin-top:14px;min-height:300px"><span class="tag ${x.cat === 'legal' ? 'warm' : ''}">${esc(LIB_CATS[x.cat].name)}${TOPICS[x.top] ? ' · ' + esc(TOPICS[x.top]) : ''}</span>
        <div class="term" style="margin-top:12px">${esc(x.term)}</div><button class="mini" id="nwSay" style="margin-top:10px">${IC.speak}</button>
        <div style="margin-top:14px;font-size:17px">${esc(x.def)}</div>
        <div id="nwBack" class="back hidden"><div style="font-size:19px;font-weight:700">${esc(x.es)}</div><div class="ctx muted" style="margin-top:8px;font-style:italic" data-say="${esc(x.ex)}">${esc(x.ex)}</div>${more.map(p => `<div class="ctx muted" style="margin-top:6px;font-size:15px" data-say="${esc(p.s)}">${esc(p.s)}</div>`).join('')}</div></div>
      <button class="btn block" id="nwReveal" style="margin-top:12px">Ver traducción y ejemplos</button>
      <div class="row" style="margin-top:10px"><button class="btn grow" id="nwKnow">Ya me la sé</button><button class="btn primary grow" id="nwLearn">Aprender</button></div>`;
    if (S.autoplay) TTS.speak(x.term, { rate: 0.9 });
    $('#nwSay').onclick = () => TTS.speak(x.term, { rate: 0.9 });
    $('#nwReveal').onclick = () => { $('#nwBack').classList.remove('hidden'); $('#nwReveal').classList.add('hidden'); if (S.autoplay) TTS.speak(x.ex); };
    $('#nwBack').onclick = e => { const s = e.target.closest('[data-say]'); if (s) TTS.speak(s.dataset.say); };
    const next = known => { startLearning(x, known); saveLearn(); bump('newLib'); if (!known) learned++; i++; show(); };
    $('#nwKnow').onclick = () => next(true); $('#nwLearn').onclick = () => next(false);
  };
  show();
}

/* ---------- las palabras más frecuentes que aún no conoces ---------- */
function renderFreq(arg) {
  const F = window.FREQ || [];
  const from = Math.max(0, +arg || 0);
  const list = []; for (let i = from; i < F.length && list.length < 40; i++) { const w = F[i]; if (wstatus(w) !== 5 && WORDS[w] !== -1 && w.length > 2) list.push([w, i + 1]); }
  $('#view').innerHTML = `<div class="h1">Palabras frecuentes</div><p class="sub">Ordenadas por lo mucho que se usan en el inglés hablado. Estas son las siguientes que aún no tienes marcadas como conocidas.</p>
    ${!S.knownRank ? `<a class="card pad cta" href="#calib"><div class="grow"><b>Calibra tu vocabulario (2 min)</b><div class="muted" style="font-size:14px">Para que la app sepa qué palabras ya conoces</div></div><span class="btn primary small">Empezar</span></a>` : ''}
    <div class="card">${list.map(([w, r]) => `<div class="note fq" data-w="${esc(w)}"><div class="grow"><span class="term">${esc(w)}</span> <span class="meta">nº ${fmtNum(r)}</span><div class="es fqtr" style="display:block"></div></div><button class="mini" data-say="${esc(w)}">${IC.speak}</button><button class="btn small" data-k="${esc(w)}">La sé</button><button class="btn small" data-l="${esc(w)}">${ico('plus', 14)}</button></div>`).join('')}</div>
    <div class="row" style="margin-top:12px"><button class="btn grow" id="fqAll">Marcar todas como conocidas</button>${list.length ? `<a class="btn grow" href="#freq/${list[list.length - 1][1]}">Siguientes ›</a>` : ''}</div>`;
  $$('.note.fq').forEach(el => translate(el.dataset.w).then(t => { const x = $('.fqtr', el); if (x) x.textContent = t; }));
  $('#fqAll').onclick = () => { list.forEach(([w]) => { WORDS[w] = 5; }); saveWords(); toast(list.length + ' marcadas como conocidas'); renderFreq(arg); };
  $('#view').onclick = async e => {
    const s = e.target.closest('[data-say]'); if (s) { TTS.speak(s.dataset.say, { rate: 0.9 }); return; }
    const k = e.target.closest('[data-k]'); if (k) { setWord(k.dataset.k, 5); k.closest('.note').remove(); return; }
    const l = e.target.closest('[data-l]'); if (l) { const w = l.dataset.l; const ex = (moreExamplesWord(w)[0] || {}).s || ''; openNoteEditor({ term: w, cat: 'vocab', es: $('.fqtr', l.closest('.note')).textContent, ex, src: 'Palabras frecuentes' }, () => setWord(w, 1)); }
  };
}
function moreExamplesWord(w) { if (!POOL.length) buildPool(); const re = new RegExp('\\b' + w.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '\\b', 'i'); return POOL.filter(p => re.test(p.s)).slice(0, 3); }

/* ---------- calibración del vocabulario ---------- */
function renderCalib() {
  const F = window.FREQ || [];
  const bands = [500, 1000, 2000, 3000, 4000, 5000, 6500, 8000, 10000, 12500, 15000, 18000, 21000, 25000];
  let b = 0; const res = [];
  const show = () => {
    if (b >= bands.length || (res.length >= 3 && res.slice(-2).every(x => x < 0.35))) return finish();
    const lo = b ? bands[b - 1] : 0, hi = bands[b];
    const sample = shuffle(F.slice(lo, hi).filter(w => w.length > 2 && !/^(ok|yeah|hey|gonna|wanna|uh|um)$/.test(w))).slice(0, 12);
    $('#view').innerHTML = `<div class="row" style="margin-bottom:8px"><b class="grow">Calibración</b><span class="muted">${b + 1}/${bands.length}</span></div><div class="progressbar"><i style="width:${b / bands.length * 100}%"></i></div>
      <p style="margin:16px 0 10px">Toca las palabras que <b>conoces</b> (que sabrías qué significan si las leyeras). No hace falta saber usarlas.</p>
      <div class="chips wrapchips" id="clW">${sample.map(w => `<button class="chip big" data-w="${esc(w)}">${esc(w)}</button>`).join('')}</div>
      <button class="btn primary block" id="clNext" style="margin-top:16px">Siguiente</button>
      <p class="meta" style="text-align:center;margin-top:10px">Palabras entre la nº ${fmtNum(lo + 1)} y la ${fmtNum(hi)} más usadas</p>`;
    $('#clW').onclick = e => { const c = e.target.closest('.chip'); if (c) c.classList.toggle('active'); };
    $('#clNext').onclick = () => { res.push($$('#clW .chip.active').length / Math.max(1, sample.length)); b++; show(); };
  };
  const finish = () => {
    let rank = 0;
    res.forEach((f, i) => { const lo = i ? bands[i - 1] : 0, hi = bands[i]; if (f >= 0.5) rank = hi; else if (f >= 0.25 && rank === lo) rank = Math.round(lo + (hi - lo) * f); });
    S.knownRank = rank; S.calibrated = Date.now(); saveSettings(); WVER++;
    $('#view').innerHTML = `<div class="card pad" style="text-align:center;padding:28px"><div style="font-size:42px">✓</div><b>Listo</b><p>A partir de ahora la app da por conocidas las ${fmtNum(rank)} palabras más usadas del inglés (salvo las que tú marques como nuevas). En los textos verás en azul las que probablemente no conoces.</p><p class="muted" style="font-size:14px">Cuantos más textos termines, más preciso será. Puedes repetir la calibración cuando quieras desde Ajustes.</p><a class="btn primary block" href="#read">Empezar a leer</a></div>`;
  };
  show();
}

/* ---------- phrasal verbs por partícula y por verbo ---------- */
const PHR_PARTS = ['up', 'down', 'out', 'off', 'on', 'in', 'into', 'over', 'back', 'away', 'through', 'around', 'round', 'about', 'along', 'across', 'after', 'for', 'by', 'ahead', 'apart', 'forward', 'together', 'at', 'to', 'with', 'without', 'behind', 'under', 'past', 'onto', 'from', 'against'];
function phrParts(term) {
  const w = term.toLowerCase().replace(/\(.*?\)/g, ' ').replace(/^to /, '').split(/[\s/]+/).filter(x => x && !['sb', 'sth', 'someone', 'something', "one's", 'it', 'me', 'oneself', 'yourself'].includes(x));
  return { verb: w[0], parts: w.slice(1).filter(x => PHR_PARTS.includes(x)) };
}
function phrasalGroup(key) { const [k, v] = [key.slice(0, 1), key.slice(2)]; return LIB.filter(x => x.cat === 'phrasal').filter(x => { const p = phrParts(x.term); return k === 'p' ? p.parts.includes(v) : p.verb === v; }); }
let phrState = 'p';
function renderPhrasal(arg) {
  const all = LIB.filter(x => x.cat === 'phrasal');
  if (arg && /^[pv]:/.test(arg)) {
    const items = phrasalGroup(arg); const [k, v] = [arg[0], arg.slice(2)];
    const info = k === 'p' && window.PARTICLE_INFO ? PARTICLE_INFO[v] : null;
    $('#view').innerHTML = `<div class="eyebrow">Phrasal verbs ${k === 'p' ? 'con la partícula' : 'con el verbo'}</div><div class="h1">${esc(v)}</div>
      ${info ? `<div class="card pad" style="margin-bottom:12px"><b>${esc(info.es)}</b><div class="muted" style="margin-top:4px;font-size:14px">${esc(info.ex)}</div></div>` : `<p class="sub">${items.length} phrasal verbs</p>`}
      <div class="row wrap" style="margin-bottom:12px"><a class="btn primary grow" href="#ex/vocab/phr:${esc(arg)}">Test</a><a class="btn grow" href="#ex/prod/phr:${esc(arg)}">Dilos tú</a><button class="btn grow" id="phAll">Añadir a repasos</button></div>
      <div class="card">${items.map(x => libRow(x)).join('')}</div>`;
    const paint = () => renderPhrasal(arg);
    $('#phAll').onclick = () => { const l = items.filter(x => !x.srs); l.forEach(x => startLearning(x)); saveLearn(); toast(l.length ? l.length + ' añadidos a tus repasos' : 'Ya están todos en tus repasos'); paint(); };
    $('#view').onclick = rowClicks(paint);
    return;
  }
  const groups = {};
  all.forEach(x => { const p = phrParts(x.term); (phrState === 'p' ? p.parts : [p.verb]).forEach(g => { if (g) (groups[g] = groups[g] || []).push(x); }); });
  const list = Object.entries(groups).filter(([, v]) => v.length >= (phrState === 'p' ? 1 : 3)).sort((a, b) => b[1].length - a[1].length);
  $('#view').innerHTML = `<div class="h1">Phrasal verbs</div><p class="sub">${all.length} phrasal verbs. La partícula suele dar una pista del significado: si entiendes qué aporta «up» u «out», adivinarás muchos sin haberlos visto nunca.</p>
    <div class="seg"><button class="${phrState === 'p' ? 'on' : ''}" data-ps="p">Por partícula</button><button class="${phrState === 'v' ? 'on' : ''}" data-ps="v">Por verbo</button></div>
    <div class="card">${list.map(([g, v]) => { const info = phrState === 'p' && window.PARTICLE_INFO ? PARTICLE_INFO[g] : null; return `<a class="note" href="#phrasal/${phrState}:${esc(g)}" style="text-decoration:none;color:inherit"><div class="grow"><span class="term">${esc(g)}</span>${info ? `<div class="es" style="display:block">${esc(info.es)}</div>` : ''}<div class="meta">${v.length} phrasal verbs · ${v.filter(x => x.srs).length} en repasos</div></div><span class="muted">›</span></a>`; }).join('')}</div>
    <a class="btn block" href="#lib/phrasal" style="margin-top:12px">Ver la lista completa</a>`;
  $$('[data-ps]').forEach(b => b.onclick = () => { phrState = b.dataset.ps; renderPhrasal(); });
}

/* ---------- ficha completa de una entrada ---------- */
const IRREG = { get: 'got|gotten|gets|getting', put: 'puts|putting', take: 'took|taken|takes|taking', come: 'came|comes|coming', go: 'went|gone|goes|going', give: 'gave|given|gives|giving', make: 'made|makes|making', run: 'ran|runs|running', break: 'broke|broken|breaks|breaking', bring: 'brought|brings|bringing', set: 'sets|setting', fall: 'fell|fallen|falls|falling', hold: 'held|holds|holding', keep: 'kept|keeps|keeping', let: 'lets|letting', cut: 'cuts|cutting', find: 'found|finds|finding', think: 'thought|thinks|thinking', see: 'saw|seen|sees|seeing', sit: 'sat|sits|sitting', stand: 'stood|stands|standing', throw: 'threw|thrown|throws|throwing', wear: 'wore|worn|wears|wearing', write: 'wrote|written|writes|writing', speak: 'spoke|spoken|speaks|speaking', tell: 'told|tells|telling', sell: 'sold|sells|selling', pay: 'paid|pays|paying', lay: 'laid|lays|laying', leave: 'left|leaves|leaving', feel: 'felt|feels|feeling', catch: 'caught|catches|catching', draw: 'drew|drawn|draws|drawing', be: 'is|are|was|were|been|being' };
function termRegex(term) {
  const core = term.toLowerCase().replace(/\(.*?\)/g, ' ').replace(/…|\.\.\./g, ' ').split('/')[0].replace(/\b(sb|sth|someone|something|one's)\b/g, ' ').replace(/^to /, '').replace(/[^a-z' -]/g, ' ').trim().split(/\s+/).filter(Boolean);
  if (!core.length) return null;
  const v = core[0]; const forms = [v, v + 's', v + 'es', v + 'ed', v + 'd', v + 'ing', v.replace(/e$/, '') + 'ing'].concat((IRREG[v] || '').split('|').filter(Boolean));
  const head = '(?:' + Array.from(new Set(forms)).map(f => f.replace(/'/g, "['’]")).join('|') + ')';
  const rest = core.slice(1).map(w => w.replace(/'/g, "['’]"));
  return new RegExp('\\b' + head + (rest.length ? '(?:\\s+\\S+){0,3}?\\s+' + rest.join('\\s+') : '') + '\\b', 'i');
}
function moreExamples(x, n = 5) {
  if (!POOL.length) buildPool();
  const re = termRegex(x.term); if (!re) return [];
  const seen = new Set([norm(x.ex || '')]); const out = [];
  for (const p of shuffle(POOL)) { if (out.length >= n) break; if (seen.has(norm(p.s))) continue; if (re.test(p.s)) { seen.add(norm(p.s)); out.push(p); } }
  return out;
}
function registerTags(x) {
  const t = []; const d = (x.def || '') + ' ' + (x.ex || '');
  if (x.cat === 'ukus') t.push('UK / US'); else if (/\(UK\)/.test(d) || x.top === 'uk') t.push('🇬🇧 Británico'); else if (/\(US\)/.test(d) || x.top === 'us') t.push('🇺🇸 Americano');
  if (x.cat === 'slang' || /informal|slang|colloquial/i.test(d)) t.push('Informal'); else if (/\bformal\b/i.test(d) || x.cat === 'legal') t.push('Formal'); else if (['convo', 'chunk', 'idiom'].includes(x.cat)) t.push('Conversación'); else t.push('Neutro');
  return t;
}
function openDetail(id) {
  const x = LIB_BY_ID[id] || NOTES.find(n => n.id === id); if (!x) return;
  const exs = moreExamples(x); const st = itemStatus(x);
  const fam = x.cat === 'phrasal' ? phrParts(x.term) : null;
  const sib = fam ? LIB.filter(y => y.cat === 'phrasal' && y.id !== x.id && phrParts(y.term).verb === fam.verb).slice(0, 8) : [];
  const paint = () => openSheet(`<div class="row wrap" style="gap:6px"><span class="tag ${x.cat === 'legal' ? 'warm' : ''}">${esc((LIB_CATS[x.cat] || { name: CATS[x.cat] || 'Mía' }).name)}</span>${TOPICS[x.top] ? `<span class="tag">${esc(TOPICS[x.top])}</span>` : ''}${registerTags(x).map(t => `<span class="tag">${esc(t)}</span>`).join('')}${STATUS_TAG[st] || ''}${markBadges(x.id)}</div>
    <div class="term" style="font-size:26px;margin-top:10px">${esc(x.term)}</div>
    <div class="row" style="gap:8px;margin-top:8px"><button class="btn small" id="dtSay">${ico('speak', 15)} Escuchar</button><button class="btn small" id="dtSlow">🐢 Lento</button><button class="btn small" id="dtMark">${ico('flag', 14)} Marcar</button></div>
    ${x.def ? `<p style="margin:12px 0 4px;font-size:17px">${esc(x.def)}</p>` : ''}<p style="margin:4px 0;font-weight:700;font-size:17px">${esc(x.es || '')}</p>
    ${x.ex ? `<div class="h2" style="margin-top:14px">Ejemplo</div><div class="ctx" data-sayx="${esc(x.ex)}" style="cursor:pointer">${esc(x.ex)}</div>` : ''}
    ${exs.length ? `<div class="h2" style="margin-top:14px">Más ejemplos de los textos</div>${exs.map(p => `<div class="ctx" data-sayx="${esc(p.s)}" style="cursor:pointer;margin-bottom:8px">${esc(p.s)}<div class="meta">${esc(p.src)}</div></div>`).join('')}` : ''}
    ${fam && fam.parts.length && window.PARTICLE_INFO && PARTICLE_INFO[fam.parts[0]] ? `<div class="h2" style="margin-top:14px">Pista de la partícula «${esc(fam.parts[0])}»</div><p class="muted" style="margin:0">${esc(PARTICLE_INFO[fam.parts[0]].es)}</p>` : ''}
    ${sib.length ? `<div class="h2" style="margin-top:14px">Otros con «${esc(fam.verb)}»</div><div class="row wrap" style="gap:6px">${sib.map(y => `<button class="chip" data-sib="${esc(y.id)}">${esc(y.term)}</button>`).join('')}</div>` : ''}
    ${x.lib && !x.srs ? '<button class="btn primary block" id="dtLearn" style="margin-top:16px">Añadir a mis repasos</button>' : ''}<div class="row" style="margin-top:8px"><button class="btn grow" id="dtCopy">Copiar a Mío y editar</button><button class="btn grow" id="dtClose">Cerrar</button></div>`, () => {
    $('#dtSay').onclick = () => TTS.speak(x.term, { rate: 0.9 }); $('#dtSlow').onclick = () => TTS.speak(x.term, { rate: 0.65 });
    $('#dtMark').onclick = () => openMarkSheet(x.id, paint); $('#dtClose').onclick = closeSheet;
    if ($('#dtLearn')) $('#dtLearn').onclick = () => { startLearning(x); saveLearn(); toast('Añadida a tus repasos'); paint(); };
    $('#dtCopy').onclick = () => { closeSheet(); setTimeout(() => openNoteEditor({ term: x.term, cat: x.cat, es: x.es, def: x.def, ex: x.ex, exs: exs.map(p => p.s).slice(0, 3).join('\n'), src: 'Biblioteca' }), 260); };
    $('#sheetBody').onclick = e => { const s = e.target.closest('[data-sayx]'); if (s) TTS.speak(s.dataset.sayx); const b = e.target.closest('[data-sib]'); if (b) openDetail(b.dataset.sib); };
  });
  paint();
}

/* ---------- packs e inglés natural ---------- */
function renderPacks() {
  const P = (window.SITUATIONS || []).filter(s => s.pack);
  $('#view').innerHTML = `<div class="h1">Lo que dicen los nativos en…</div><p class="sub">Frases reales, de las que no salen en los libros, para cada sitio.</p>
    <div class="card">${P.map(s => `<a class="note" href="#sit/${s.id}" style="text-decoration:none;color:inherit"><div class="grow"><span class="term">${esc(s.title.replace('Lo que dicen los nativos ', '…'))}</span><div class="es" style="display:block">${esc(s.es)} · ${s.phrases.length} frases</div></div><span class="muted">›</span></a>`).join('')}</div>`;
}
function renderNatural() {
  const N = window.NATIVE || [];
  $('#view').innerHTML = `<div class="h1">Inglés natural</div><p class="sub">Frases que suenan a español traducido y cómo las diría un nativo.</p>
    <a class="btn primary block" href="#ex/native" style="margin-bottom:12px">Practicar</a>
    <div class="card">${N.map((n, k) => `<div class="note"><div class="grow"><div class="wrongline">${esc(n[0])}</div><div class="rightline">${esc(n[1])}</div><div class="muted" style="font-size:13.5px;margin-top:3px">${esc(n[2])}</div></div><div style="display:flex;flex-direction:column;gap:6px"><button class="mini" data-say="${esc(n[1].split(' / ')[0])}">${IC.speak}</button><button class="mini" data-nk="${k}">${IC.plus}</button></div></div>`).join('')}</div>`;
  $('#view').onclick = e => { const s = e.target.closest('[data-say]'); if (s) { TTS.speak(s.dataset.say); return; } const a = e.target.closest('[data-nk]'); if (a) { const n = N[+a.dataset.nk]; openNoteEditor({ term: n[1], cat: 'other', note: 'En vez de: ' + n[0] + ' · ' + n[2], src: 'Inglés natural' }); } };
}

addRoute('words', renderWords, 'words', 'Palabras');
addRoute('lib', renderVocabCat, 'words', 'Palabras');
addRoute('legal', () => renderVocabCat('legal'), 'words', 'Inglés jurídico');
addRoute('new', renderNewWords, 'words', 'Palabras nuevas');
addRoute('freq', renderFreq, 'words', 'Palabras frecuentes');
addRoute('calib', renderCalib, 'words', 'Calibración');
addRoute('phrasal', renderPhrasal, 'words', 'Phrasal verbs');
addRoute('grammar', renderGrammar, 'words', 'Gramática');
addRoute('sit', renderSit, 'words', 'Situaciones');
addRoute('packs', renderPacks, 'words', 'Lo que dicen los nativos');
addRoute('natural', renderNatural, 'words', 'Inglés natural');
addRoute('ex', startExercise, 'words', 'Ejercicios');
STOPPERS.push(() => { if (typeof stopDialogue === 'function') stopDialogue(); });

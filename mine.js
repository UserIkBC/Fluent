'use strict';
/* ==========================================================
   MÍO: fichas propias, marcas, etiquetas, listas y cuaderno
   ========================================================== */
let MARKS = store.get('marks', {});    // id -> { fav, st: 'known'|'unknown', hard, labels: [], upd }
let LABELS = store.get('labels', []);  // { id, name, color, upd }
let LISTS = store.get('lists', []);    // { id, name, color, items: [ids], created, upd }
let NB = store.get('nb', []);          // { id, title, body, pinned, created, upd }
let TOMBS = store.get('tombs', {});    // id borrado -> fecha
const saveMarks = () => store.set('marks', MARKS);
const saveLabels = () => store.set('labels', LABELS);
const saveLists = () => store.set('lists', LISTS);
const saveNB = () => store.set('nb', NB);
const saveTombs = () => store.set('tombs', TOMBS);
const COLORS = ['#0e4a7e', '#1d7a42', '#b8461b', '#7b3fa0', '#0f766e', '#b42323', '#a16207', '#475569'];
const NOTE_CATS = { word: 'Vocabulario', phrasal: 'Phrasal verb', idiom: 'Expresión / idiom', convo: 'Para conversar', colloc: 'Collocation', linker: 'Conector', false: 'Falso amigo', legal: 'Inglés jurídico', business: 'Negocios', grammar: 'Gramática', other: 'Otro' };

function itemById(id) { return LIB_BY_ID[id] || NOTES.find(n => n.id === id) || null; }
function mark(id) { return MARKS[id] || {}; }
function setMark(id, patch) {
  const m = Object.assign({}, MARKS[id] || {}, patch, { upd: Date.now() });
  if (!m.fav && !m.st && !m.hard && !(m.labels || []).length) { delete MARKS[id]; TOMBS['mark:' + id] = Date.now(); saveTombs(); }
  else MARKS[id] = m;
  const x = itemById(id);
  if (x && patch.st === 'known') {
    if (x.lib && !x.srs) startLearning(x, true);
    else if (x.srs) { x.srs.known = true; x.srs.ivl = Math.max(x.srs.ivl || 0, 30); x.srs.reps = Math.max(x.srs.reps || 0, 3); x.srs.due = Date.now() + 30 * DAY; x.srs.upd = Date.now(); }
  }
  if (x && patch.st === 'unknown') {
    if (x.lib && !x.srs) startLearning(x, false);
    if (x.srs) { x.srs.known = false; x.srs.due = Date.now(); x.srs.ivl = 0; x.srs.upd = Date.now(); }
  }
  if (x && x.lib) saveLearn(); else saveNotes();
  saveMarks();
}
function markBadges(id) {
  const m = mark(id); let h = '';
  if (m.fav) h += '<span class="mk fav" title="Favorita">★</span>';
  if (m.st === 'known') h += '<span class="mk ok" title="Me la sé">✓</span>';
  if (m.st === 'unknown') h += '<span class="mk ko" title="No me la sé">✗</span>';
  if (m.hard) h += '<span class="mk hard" title="Difícil">!</span>';
  (m.labels || []).forEach(l => { const L = LABELS.find(x => x.id === l); if (L) h += `<span class="lbl" style="--c:${L.color}">${esc(L.name)}</span>`; });
  return h;
}
const SETS = {
  fav: { name: 'Favoritas', ic: '★', test: id => mark(id).fav },
  unknown: { name: 'No me la sé', ic: '✗', test: id => mark(id).st === 'unknown' },
  hard: { name: 'Difíciles', ic: '!', test: id => mark(id).hard },
  known: { name: 'Me la sé', ic: '✓', test: id => mark(id).st === 'known' },
  mine: { name: 'Mis palabras', ic: '✎', test: id => NOTES.some(n => n.id === id) }
};
function setName(key) {
  if (SETS[key]) return SETS[key].name;
  if (key.startsWith('label:')) { const L = LABELS.find(x => x.id === key.slice(6)); return L ? 'Etiqueta · ' + L.name : 'Etiqueta'; }
  if (key.startsWith('list:')) { const L = LISTS.find(x => x.id === key.slice(5)); return L ? 'Lista · ' + L.name : 'Lista'; }
  if (key.startsWith('cat:')) return (LIB_CATS[key.slice(4)] || {}).name || 'Categoría';
  if (key.startsWith('phr:')) return 'Phrasal verbs con ' + key.slice(6);
  return key;
}
function setItems(key) {
  if (key === 'mine') return NOTES.slice();
  if (key.startsWith('cat:')) return LIB.filter(x => x.cat === key.slice(4));
  if (key.startsWith('phr:')) return typeof phrasalGroup === 'function' ? phrasalGroup(key.slice(4)) : [];
  if (key.startsWith('list:')) { const L = LISTS.find(x => x.id === key.slice(5)); return L ? L.items.map(itemById).filter(Boolean) : []; }
  if (key.startsWith('label:')) { const l = key.slice(6); return Object.keys(MARKS).filter(id => (MARKS[id].labels || []).includes(l)).map(itemById).filter(Boolean); }
  const s = SETS[key]; if (!s) return [];
  return Object.keys(MARKS).filter(s.test).map(itemById).filter(Boolean);
}

/* ---------- panel de marcas ---------- */
function openMarkSheet(id, after) {
  const x = itemById(id); if (!x) return;
  const isMine = !x.lib;
  const paint = () => {
    const m = mark(id);
    const inLists = LISTS.filter(L => L.items.includes(id));
    $('#sheetBody').innerHTML = `
      <div class="row"><h3 class="grow">${esc(x.term)}</h3><button class="mini" id="mkSay">${IC.speak}</button></div>
      <div class="muted" style="margin-bottom:12px">${esc(x.es || '')}</div>
      <div class="markbar">
        <button class="mkbtn ${m.fav ? 'on fav' : ''}" data-mk="fav"><span>★</span>Favorita</button>
        <button class="mkbtn ${m.st === 'known' ? 'on ok' : ''}" data-mk="known"><span>✓</span>Me la sé</button>
        <button class="mkbtn ${m.st === 'unknown' ? 'on ko' : ''}" data-mk="unknown"><span>✗</span>No me la sé</button>
        <button class="mkbtn ${m.hard ? 'on hard' : ''}" data-mk="hard"><span>!</span>Difícil</button>
      </div>
      <label class="lbl">Etiquetas</label>
      <div class="row wrap" style="gap:6px">${LABELS.map(L => `<button class="lchip ${(m.labels || []).includes(L.id) ? 'on' : ''}" style="--c:${L.color}" data-lb="${L.id}">${esc(L.name)}</button>`).join('')}<button class="lchip add" id="newLabel">+ Nueva etiqueta</button></div>
      <label class="lbl">Listas</label>
      <div class="row wrap" style="gap:6px">${LISTS.map(L => `<button class="lchip ${L.items.includes(id) ? 'on' : ''}" style="--c:${L.color}" data-ls="${L.id}">${esc(L.name)}</button>`).join('')}<button class="lchip add" id="newList">+ Nueva lista</button></div>
      <div class="row wrap" style="margin-top:18px">
        ${isMine ? `<button class="btn grow" id="mkEdit">Editar ficha</button>` : `<button class="btn grow" id="mkCopy">Copiar a mis palabras y personalizar</button>`}
        ${!isMine && !x.srs ? `<button class="btn primary grow" id="mkLearn">Añadir a repasos</button>` : ''}
      </div>
      <button class="btn ghost block" id="mkClose" style="margin-top:8px">Listo</button>`;
    const b = $('#sheetBody');
    $('#mkSay', b).onclick = () => TTS.speak(x.term, { rate: 0.9 });
    $$('[data-mk]', b).forEach(btn => btn.onclick = () => {
      const k = btn.dataset.mk, cur = mark(id);
      if (k === 'fav') setMark(id, { fav: !cur.fav });
      if (k === 'hard') setMark(id, { hard: !cur.hard });
      if (k === 'known') setMark(id, { st: cur.st === 'known' ? null : 'known' });
      if (k === 'unknown') setMark(id, { st: cur.st === 'unknown' ? null : 'unknown' });
      paint(); if (after) after();
    });
    $$('[data-lb]', b).forEach(btn => btn.onclick = () => { const cur = (mark(id).labels || []).slice(); const l = btn.dataset.lb; const i = cur.indexOf(l); if (i >= 0) cur.splice(i, 1); else cur.push(l); setMark(id, { labels: cur }); paint(); if (after) after(); });
    $$('[data-ls]', b).forEach(btn => btn.onclick = () => { toggleInList(btn.dataset.ls, id); paint(); if (after) after(); });
    $('#newLabel', b).onclick = () => { const L = createLabel(); if (L) { setMark(id, { labels: (mark(id).labels || []).concat(L.id) }); paint(); if (after) after(); } };
    $('#newList', b).onclick = () => { const L = createList(); if (L) { toggleInList(L.id, id); paint(); if (after) after(); } };
    if ($('#mkEdit', b)) $('#mkEdit', b).onclick = () => openNoteEditor(x);
    if ($('#mkCopy', b)) $('#mkCopy', b).onclick = () => openNoteEditor({ term: x.term, cat: x.cat, es: x.es, def: x.def, ex: x.ex, src: 'Copiada de la biblioteca' });
    if ($('#mkLearn', b)) $('#mkLearn', b).onclick = () => { startLearning(x); saveLearn(); toast('Añadida a tus repasos'); paint(); if (after) after(); };
    $('#mkClose', b).onclick = closeSheet;
  };
  openSheet('', paint);
}
function createLabel(name) {
  name = name || prompt('Nombre de la etiqueta (por ejemplo: Garrigues, Examen, Clase)');
  if (!name || !name.trim()) return null;
  const L = { id: uid(), name: name.trim().slice(0, 30), color: COLORS[LABELS.length % COLORS.length], upd: Date.now() };
  LABELS.push(L); saveLabels(); return L;
}
function createList(name) {
  name = name || prompt('Nombre de la lista');
  if (!name || !name.trim()) return null;
  const L = { id: uid(), name: name.trim().slice(0, 40), color: COLORS[LISTS.length % COLORS.length], items: [], created: Date.now(), upd: Date.now() };
  LISTS.unshift(L); saveLists(); return L;
}
function toggleInList(listId, itemId) {
  const L = LISTS.find(x => x.id === listId); if (!L) return;
  const i = L.items.indexOf(itemId);
  if (i >= 0) L.items.splice(i, 1); else L.items.unshift(itemId);
  L.upd = Date.now(); saveLists();
}

/* ---------- ficha completa de palabra ---------- */
function openNoteEditor(n) {
  const isNew = !n || !n.id || !NOTES.some(x => x.id === n.id);
  n = Object.assign({ term: '', cat: 'word', es: '', def: '', ex: '', exs: '', syn: '', ant: '', pron: '', note: '', src: '' }, n || {});
  const m = n.id ? mark(n.id) : {};
  let selLabels = (m.labels || []).slice();
  let selLists = n.id ? LISTS.filter(L => L.items.includes(n.id)).map(L => L.id) : [];
  if (isNew && n._list) selLists.push(n._list);
  openSheet(`
    <h3>${isNew ? 'Nueva palabra o expresión' : 'Editar ficha'}</h3>
    <label class="lbl">Palabra, expresión o frase (en inglés) *</label>
    <div class="row"><input class="input grow" id="nTerm" value="${esc(n.term)}" autocapitalize="off" autocomplete="off" placeholder="p. ej. to rule out"><button class="mini" id="nSay" type="button">${IC.speak}</button></div>
    <label class="lbl">Tipo</label>
    <select class="select" id="nCat">${Object.entries(NOTE_CATS).map(([k, v]) => `<option value="${k}" ${k === n.cat ? 'selected' : ''}>${v}</option>`).join('')}</select>
    <label class="lbl">Traducción al español</label>
    <div class="row"><input class="input grow" id="nEs" value="${esc(n.es)}" placeholder="descartar"><button class="btn small" id="nAutoTr" type="button">Traducir</button></div>
    <label class="lbl">Definición en inglés</label>
    <div class="row"><input class="input grow" id="nDef" value="${esc(n.def)}" placeholder="to decide that something is not possible"><button class="btn small" id="nAutoDef" type="button">Buscar</button></div>
    <label class="lbl">Ejemplo principal</label>
    <textarea class="textarea" id="nEx" style="min-height:64px" placeholder="The police ruled out murder.">${esc(n.ex)}</textarea>
    <label class="lbl">Más ejemplos (uno por línea)</label>
    <textarea class="textarea" id="nExs" style="min-height:64px">${esc(n.exs)}</textarea>
    <div class="row" style="gap:10px"><div class="grow"><label class="lbl">Sinónimos</label><input class="input" id="nSyn" value="${esc(n.syn)}" placeholder="exclude, dismiss"></div>
      <div class="grow"><label class="lbl">Antónimos</label><input class="input" id="nAnt" value="${esc(n.ant)}" placeholder="consider"></div></div>
    <label class="lbl">Pronunciación (truco para recordarla)</label>
    <input class="input" id="nPron" value="${esc(n.pron)}" placeholder="/ruːl aʊt/ · suena «rul aut»">
    <label class="lbl">Mis notas</label>
    <textarea class="textarea" id="nNote" style="min-height:64px" placeholder="Registro, cuándo usarla, la dijo el profesor…">${esc(n.note)}</textarea>
    <label class="lbl">Marcas</label>
    <div class="markbar small">
      <button class="mkbtn ${m.fav ? 'on fav' : ''}" data-emk="fav" type="button"><span>★</span>Favorita</button>
      <button class="mkbtn ${m.st === 'known' ? 'on ok' : ''}" data-emk="known" type="button"><span>✓</span>Me la sé</button>
      <button class="mkbtn ${m.st === 'unknown' ? 'on ko' : ''}" data-emk="unknown" type="button"><span>✗</span>No me la sé</button>
      <button class="mkbtn ${m.hard ? 'on hard' : ''}" data-emk="hard" type="button"><span>!</span>Difícil</button>
    </div>
    <label class="lbl">Etiquetas</label>
    <div class="row wrap" style="gap:6px" id="nLabels"></div>
    <label class="lbl">Listas</label>
    <div class="row wrap" style="gap:6px" id="nLists"></div>
    ${n.src ? `<p class="meta" style="margin-top:8px">Origen · ${esc(n.src)}</p>` : ''}
    <div class="row" style="margin-top:16px">
      ${!isNew ? `<button class="btn danger" id="nDel" type="button">${IC.trash.replace('<svg', '<svg width="18" height="18"')}</button>` : ''}
      <button class="btn ghost grow" id="nCancel" type="button">Cancelar</button>
      <button class="btn primary grow" id="nSave" type="button">Guardar</button>
    </div>`, body => {
    const em = { fav: !!m.fav, st: m.st || null, hard: !!m.hard };
    const paintMk = () => $$('[data-emk]', body).forEach(b => { const k = b.dataset.emk; const on = k === 'fav' ? em.fav : k === 'hard' ? em.hard : em.st === k; b.className = 'mkbtn ' + (on ? 'on ' + ({ fav: 'fav', known: 'ok', unknown: 'ko', hard: 'hard' }[k]) : ''); });
    $$('[data-emk]', body).forEach(b => b.onclick = () => { const k = b.dataset.emk; if (k === 'fav') em.fav = !em.fav; else if (k === 'hard') em.hard = !em.hard; else em.st = em.st === k ? null : k; paintMk(); });
    const paintChips = () => {
      $('#nLabels').innerHTML = LABELS.map(L => `<button type="button" class="lchip ${selLabels.includes(L.id) ? 'on' : ''}" style="--c:${L.color}" data-l="${L.id}">${esc(L.name)}</button>`).join('') + '<button type="button" class="lchip add" id="nNewL">+ Nueva</button>';
      $('#nLists').innerHTML = LISTS.map(L => `<button type="button" class="lchip ${selLists.includes(L.id) ? 'on' : ''}" style="--c:${L.color}" data-li="${L.id}">${esc(L.name)}</button>`).join('') + '<button type="button" class="lchip add" id="nNewLi">+ Nueva</button>';
      $$('[data-l]', body).forEach(b => b.onclick = () => { const i = selLabels.indexOf(b.dataset.l); if (i >= 0) selLabels.splice(i, 1); else selLabels.push(b.dataset.l); paintChips(); });
      $$('[data-li]', body).forEach(b => b.onclick = () => { const i = selLists.indexOf(b.dataset.li); if (i >= 0) selLists.splice(i, 1); else selLists.push(b.dataset.li); paintChips(); });
      $('#nNewL').onclick = () => { const L = createLabel(); if (L) { selLabels.push(L.id); paintChips(); } };
      $('#nNewLi').onclick = () => { const L = createList(); if (L) { selLists.push(L.id); paintChips(); } };
    };
    paintChips();
    $('#nSay').onclick = () => { const t = $('#nTerm').value.trim(); if (t) TTS.speak(t, { rate: 0.9 }); };
    $('#nAutoTr').onclick = async () => { const t = $('#nTerm').value.trim(); if (!t) return; $('#nEs').value = 'Traduciendo…'; $('#nEs').value = await translate(t) || ''; if (!$('#nEs').value) toast('Sin conexión con el traductor'); };
    $('#nAutoDef').onclick = async () => {
      const t = $('#nTerm').value.trim(); if (!t) return;
      const lib = LIB.find(x => norm(x.term) === norm(t)); if (lib) { $('#nDef').value = lib.def; if (!$('#nEx').value) $('#nEx').value = lib.ex; if (!$('#nEs').value) $('#nEs').value = lib.es; return; }
      $('#nDef').value = 'Buscando…'; const d = await lookupDef(t.split(' ').length === 1 ? t : t.split(' ')[0]);
      const df = d && d.meanings && d.meanings[0] && d.meanings[0].definitions[0];
      $('#nDef').value = df ? df.definition : ''; if (df && df.example && !$('#nEx').value) $('#nEx').value = df.example;
      if (!df) toast('No he encontrado la definición');
    };
    $('#nCancel').onclick = closeSheet;
    if ($('#nDel')) $('#nDel').onclick = () => { if (!confirm('¿Borrar esta ficha?')) return; deleteNote(n.id); closeSheet(); refreshMine(); toast('Ficha borrada'); };
    $('#nSave').onclick = () => {
      const term = $('#nTerm').value.trim(); if (!term) { toast('Escribe la palabra o expresión'); return; }
      const data = { term, cat: $('#nCat').value, es: $('#nEs').value.trim(), def: $('#nDef').value.trim(), ex: $('#nEx').value.trim(), exs: $('#nExs').value.trim(), syn: $('#nSyn').value.trim(), ant: $('#nAnt').value.trim(), pron: $('#nPron').value.trim(), note: $('#nNote').value.trim(), upd: Date.now() };
      let id = n.id;
      if (isNew) {
        if (NOTES.some(x => norm(x.term) === norm(term)) && !confirm('Ya tienes una ficha con «' + term + '». ¿Crear otra igualmente?')) return;
        id = uid();
        NOTES.unshift(Object.assign({ id, src: n.src || '', srcId: n.srcId || '', created: Date.now(), srs: newSrs() }, data));
        bump('saved');
      } else Object.assign(NOTES.find(x => x.id === n.id), data);
      saveNotes();
      setMark(id, { fav: em.fav, st: em.st, hard: em.hard, labels: selLabels });
      LISTS.forEach(L => { const has = L.items.includes(id), want = selLists.includes(L.id); if (has !== want) toggleInList(L.id, id); });
      closeSheet(); toast(isNew ? 'Guardada en Mío' : 'Ficha actualizada'); refreshMine();
    };
    if (isNew && !n.term) setTimeout(() => $('#nTerm').focus(), 250);
  });
}
function deleteNote(id) {
  NOTES = NOTES.filter(x => x.id !== id); TOMBS[id] = Date.now();
  delete MARKS[id];
  LISTS.forEach(L => { const i = L.items.indexOf(id); if (i >= 0) { L.items.splice(i, 1); L.upd = Date.now(); } });
  saveNotes(); saveMarks(); saveLists(); saveTombs();
}
function refreshMine() {
  const h = location.hash;
  if (h.startsWith('#mine') || h.startsWith('#list') || h.startsWith('#set')) route();
  else if (h.startsWith('#read/')) markKnown();
  else if (h.startsWith('#lib') || h.startsWith('#legal')) route();
}

/* ---------- filas ---------- */
function noteRow(n) {
  return `<div class="note" data-id="${esc(n.id)}"><div class="grow" data-open="${esc(n.id)}"><div class="row wrap" style="gap:6px"><span class="term">${esc(n.term)}</span><span class="tag ${n.cat === 'legal' ? 'warm' : ''}">${esc(NOTE_CATS[n.cat] || CATS[n.cat] || 'Otro')}</span>${markBadges(n.id)}</div>
    ${n.def ? `<div class="def">${esc(n.def)}</div>` : ''}${n.es ? `<div class="es">${esc(n.es)}</div>` : ''}${n.ex ? `<div class="ex">${esc(n.ex)}</div>` : ''}${n.note ? `<div class="muted" style="font-size:13.5px;margin-top:4px">📝 ${esc(n.note)}</div>` : ''}</div>
    <div style="display:flex;flex-direction:column;gap:6px"><button class="mini" data-say="${esc(n.term)}" aria-label="Escuchar">${IC.speak}</button><button class="mini" data-mark="${esc(n.id)}" aria-label="Marcar">${IC.flag}</button></div></div>`;
}
function anyRow(x) { return x.lib ? libRow(x, { cat: true }) : noteRow(x); }
function rowClicks(rerender) {
  const base = libClicks(rerender);
  return e => {
    const mk = e.target.closest('[data-mark]'); if (mk) { openMarkSheet(mk.dataset.mark, rerender); return; }
    if (base(e)) return;
    const dt = e.target.closest('.note[data-id] .term'); if (dt && typeof openDetail === 'function' && LIB_BY_ID[dt.closest('.note').dataset.id]) { openDetail(dt.closest('.note').dataset.id); return; }
    const o = e.target.closest('[data-open]'); if (o) { const n = NOTES.find(x => x.id === o.dataset.open); if (n) openNoteEditor(n); }
    const es = e.target.closest('.es'); if (es && document.body.classList.contains('hide-es')) es.classList.toggle('show');
  };
}

/* ---------- pantalla Mío ---------- */
let mineState = { tab: 'words', q: '', cat: 'all', mk: 'all', sort: 'new' };
function renderMine(arg) {
  if (arg) mineState.tab = arg;
  const t = mineState.tab;
  $('#view').innerHTML = `
    <div class="row"><div class="h1 grow">Mío</div><span class="muted" id="syncMini" style="font-size:12px"></span></div>
    <div class="seg">${[['words', 'Palabras'], ['lists', 'Listas'], ['nb', 'Cuaderno'], ['marks', 'Marcas']].map(([k, v]) => `<button class="${t === k ? 'on' : ''}" data-tab="${k}">${v}</button>`).join('')}</div>
    <div id="mineBody"></div>`;
  $$('.seg button').forEach(b => b.onclick = () => { history.replaceState(null, '', '#mine/' + b.dataset.tab); mineState.tab = b.dataset.tab; renderMine(); });
  if (window.syncLabel) $('#syncMini').textContent = syncLabel();
  ({ words: mineWords, lists: mineLists, nb: mineNB, marks: mineMarks })[t]();
}
function mineWords() {
  const box = $('#mineBody');
  const counts = {}; NOTES.forEach(n => counts[n.cat] = (counts[n.cat] || 0) + 1);
  box.innerHTML = `
    <div class="row" style="margin:4px 0 10px"><p class="sub grow" style="margin:0">${NOTES.length} ${NOTES.length === 1 ? 'ficha tuya' : 'fichas tuyas'}</p><button class="btn primary small" id="addNote">${IC.plus.replace('<svg', '<svg width="16" height="16"')} Nueva</button></div>
    <div class="search">${IC.search}<input class="input" id="nq" type="search" placeholder="Buscar en mis palabras…" value="${esc(mineState.q)}"></div>
    <div class="chips" id="catChips"><button class="chip ${mineState.cat === 'all' ? 'active' : ''}" data-c="all">Todas</button>${Object.entries(NOTE_CATS).filter(([k]) => counts[k]).map(([k, v]) => `<button class="chip ${mineState.cat === k ? 'active' : ''}" data-c="${k}">${v} · ${counts[k]}</button>`).join('')}</div>
    <div class="row wrap" style="margin-bottom:10px">
      <select class="select" id="nmk" style="width:auto;padding:8px 10px;font-size:14px"><option value="all">Todas las marcas</option><option value="fav">★ Favoritas</option><option value="unknown">✗ No me la sé</option><option value="hard">! Difíciles</option><option value="known">✓ Me la sé</option>${LABELS.map(L => `<option value="label:${L.id}">${esc(L.name)}</option>`).join('')}</select>
      <select class="select" id="nsort" style="width:auto;padding:8px 10px;font-size:14px"><option value="new">Más recientes</option><option value="az">A-Z</option><option value="hard">Las que más fallo</option></select>
    </div>
    <div id="notesList"></div>
    ${NOTES.length ? `<div class="row wrap" style="margin-top:12px"><a class="btn grow" href="#ex/vocab/set:mine">Test de mis palabras</a><a class="btn grow" href="#ex/review/set:mine">Tarjetas</a></div>` : ''}`;
  $('#nmk').value = mineState.mk; $('#nsort').value = mineState.sort;
  $('#addNote').onclick = () => openNoteEditor(null);
  $('#nq').addEventListener('input', e => { mineState.q = e.target.value; paint(); });
  $('#catChips').onclick = e => { const b = e.target.closest('.chip'); if (!b) return; mineState.cat = b.dataset.c; $$('#catChips .chip').forEach(c => c.classList.toggle('active', c === b)); paint(); };
  $('#nmk').onchange = e => { mineState.mk = e.target.value; paint(); };
  $('#nsort').onchange = e => { mineState.sort = e.target.value; paint(); };
  const paint = () => {
    let list = NOTES.slice();
    if (mineState.cat !== 'all') list = list.filter(n => n.cat === mineState.cat);
    if (mineState.mk !== 'all') list = list.filter(n => matchMark(n.id, mineState.mk));
    const q = norm(mineState.q); if (q) list = list.filter(n => norm([n.term, n.es, n.def, n.ex, n.exs, n.syn, n.note].join(' ')).includes(q));
    if (mineState.sort === 'az') list.sort((a, b) => a.term.localeCompare(b.term));
    if (mineState.sort === 'hard') list.sort((a, b) => ((b.srs || {}).lapses || 0) - ((a.srs || {}).lapses || 0));
    $('#notesList').innerHTML = !NOTES.length ? `<div class="card pad empty">Aquí van tus propias palabras, expresiones y frases.<br><br>Pulsa <b>Nueva</b> para crear una ficha, o toca el icono de bandera en cualquier palabra de la biblioteca y elige «Copiar a mis palabras».</div>`
      : list.length ? `<div class="card">${list.map(noteRow).join('')}</div>` : '<div class="empty">Nada coincide.</div>';
  };
  $('#view').onclick = rowClicks(paint);
  paint();
}
function matchMark(id, f) {
  const m = mark(id);
  if (f === 'fav') return !!m.fav; if (f === 'hard') return !!m.hard;
  if (f === 'known' || f === 'unknown') return m.st === f;
  if (f.startsWith('label:')) return (m.labels || []).includes(f.slice(6));
  return true;
}
function mineLists() {
  const box = $('#mineBody');
  box.innerHTML = `<div class="row" style="margin:4px 0 10px"><p class="sub grow" style="margin:0">Agrupa palabras de la biblioteca y tuyas como quieras.</p><button class="btn primary small" id="addList">${IC.plus.replace('<svg', '<svg width="16" height="16"')} Nueva</button></div>
    ${LISTS.length ? `<div class="listgrid">${LISTS.map(L => `<a class="card listcard" href="#list/${L.id}" style="--c:${L.color}"><b>${esc(L.name)}</b><span class="muted">${L.items.length} ${L.items.length === 1 ? 'entrada' : 'entradas'}</span></a>`).join('')}</div>`
      : '<div class="card pad empty">Aún no tienes listas.<br><br>Ideas: «Clase de inglés», «Garrigues», «Para la entrevista», «Phrasal verbs que me cuestan».</div>'}`;
  $('#addList').onclick = () => { const L = createList(); if (L) go('#list/' + L.id); };
}
function renderList(id) {
  const L = LISTS.find(x => x.id === id); if (!L) return go('#mine/lists');
  const items = L.items.map(itemById).filter(Boolean);
  $('#view').innerHTML = `<div class="eyebrow" style="color:${L.color}">Lista</div>
    <div class="row"><div class="h1 grow">${esc(L.name)}</div><button class="mini" id="lEdit" aria-label="Editar">${IC.pen}</button></div>
    <p class="sub">${items.length} ${items.length === 1 ? 'entrada' : 'entradas'}</p>
    <div class="row wrap" style="margin-bottom:12px"><button class="btn primary grow" id="lAdd">${IC.plus.replace('<svg', '<svg width="16" height="16"')} Añadir de la biblioteca</button><button class="btn grow" id="lNew">Crear palabra nueva</button></div>
    ${items.length >= 2 ? `<div class="row wrap" style="margin-bottom:12px"><a class="btn grow" href="#ex/vocab/list:${L.id}">Test</a><a class="btn grow" href="#ex/review/list:${L.id}">Tarjetas</a><button class="btn grow" id="lLearn">Todo a repasos</button></div>` : ''}
    <div id="lItems">${items.length ? `<div class="card">${items.map(anyRow).join('')}</div>` : '<div class="empty">La lista está vacía.</div>'}</div>`;
  $('#lEdit').onclick = () => openSheet(`<h3>Editar lista</h3><label class="lbl">Nombre</label><input class="input" id="lName" value="${esc(L.name)}">
    <label class="lbl">Color</label><div class="row wrap" style="gap:8px">${COLORS.map(c => `<button type="button" class="swatch ${c === L.color ? 'on' : ''}" style="background:${c}" data-c="${c}"></button>`).join('')}</div>
    <div class="row" style="margin-top:16px"><button class="btn danger" id="lDel">${IC.trash.replace('<svg', '<svg width="18" height="18"')}</button><button class="btn primary grow" id="lSave">Guardar</button></div>`, b => {
    let col = L.color;
    $$('.swatch', b).forEach(s => s.onclick = () => { col = s.dataset.c; $$('.swatch', b).forEach(x => x.classList.toggle('on', x === s)); });
    $('#lSave').onclick = () => { L.name = $('#lName').value.trim() || L.name; L.color = col; L.upd = Date.now(); saveLists(); closeSheet(); renderList(id); };
    $('#lDel').onclick = () => { if (!confirm('¿Borrar la lista «' + L.name + '»? Las palabras no se borran.')) return; LISTS = LISTS.filter(x => x.id !== id); TOMBS[id] = Date.now(); saveLists(); saveTombs(); closeSheet(); go('#mine/lists'); };
  });
  $('#lAdd').onclick = () => openPicker(L);
  $('#lNew').onclick = () => openNoteEditor({ _list: L.id });
  if ($('#lLearn')) $('#lLearn').onclick = () => { let c = 0; items.forEach(x => { if (x.lib && !x.srs) { startLearning(x); c++; } }); saveLearn(); toast(c ? c + ' añadidas a tus repasos' : 'Ya estaban todas en repasos'); };
  $('#view').onclick = rowClicks(() => renderList(id));
}
function openPicker(L) {
  openSheet(`<h3>Añadir a «${esc(L.name)}»</h3><div class="search">${IC.search}<input class="input" id="pq" type="search" placeholder="Busca en la biblioteca y en tus palabras…"></div><div id="pRes" class="picker"></div><button class="btn primary block" id="pDone" style="margin-top:12px">Listo</button>`, b => {
    const paint = () => {
      const q = norm($('#pq').value);
      let r = q.length < 2 ? NOTES.slice(0, 20) : NOTES.concat(LIB).filter(x => norm(x.term + ' ' + x.es).includes(q)).slice(0, 50);
      $('#pRes').innerHTML = r.length ? r.map(x => `<button class="pick ${L.items.includes(x.id) ? 'on' : ''}" data-p="${esc(x.id)}"><span class="grow"><b>${esc(x.term)}</b><br><span class="muted">${esc(x.es || '')}</span></span><span class="pk">${L.items.includes(x.id) ? '✓' : '+'}</span></button>`).join('') : '<div class="empty">Escribe para buscar.</div>';
    };
    $('#pq').addEventListener('input', paint);
    $('#pRes').onclick = e => { const p = e.target.closest('[data-p]'); if (!p) return; toggleInList(L.id, p.dataset.p); paint(); };
    $('#pDone').onclick = () => { closeSheet(); renderList(L.id); };
    paint(); setTimeout(() => $('#pq').focus(), 250);
  });
}
function mineNB() {
  const box = $('#mineBody');
  box.innerHTML = `<div class="row" style="margin:4px 0 10px"><p class="sub grow" style="margin:0">Apuntes libres: reglas, correcciones, frases que oyes…</p><button class="btn primary small" id="addNB">${IC.plus.replace('<svg', '<svg width="16" height="16"')} Nueva</button></div>
    <div class="search">${IC.search}<input class="input" id="nbq" type="search" placeholder="Buscar en el cuaderno…"></div><div id="nbList"></div>`;
  const paint = () => {
    const q = norm($('#nbq').value);
    const list = NB.filter(x => !q || norm(x.title + ' ' + x.body).includes(q)).sort((a, b) => (b.pinned ? 1 : 0) - (a.pinned ? 1 : 0) || b.upd - a.upd);
    $('#nbList').innerHTML = !NB.length ? '<div class="card pad empty">Tu cuaderno está vacío.<br><br>Úsalo para lo que no encaja en una ficha: explicaciones de clase, errores que cometes, frases de una serie…</div>'
      : list.length ? `<div class="card">${list.map(x => `<a class="note" href="#nb/${x.id}" style="text-decoration:none;color:inherit"><div class="grow"><span class="term">${x.pinned ? '📌 ' : ''}${esc(x.title || 'Sin título')}</span><div class="muted nbprev">${esc((x.body || '').slice(0, 140))}</div><div class="meta">${new Date(x.upd).toLocaleDateString('es-ES', { day: 'numeric', month: 'short' })}</div></div></a>`).join('')}</div>` : '<div class="empty">Nada coincide.</div>';
  };
  $('#nbq').addEventListener('input', paint);
  $('#addNB').onclick = () => { const x = { id: uid(), title: '', body: '', pinned: false, created: Date.now(), upd: Date.now() }; NB.unshift(x); saveNB(); go('#nb/' + x.id); };
  paint();
}
function renderNB(id) {
  const x = NB.find(n => n.id === id); if (!x) return go('#mine/nb');
  $('#view').innerHTML = `<div class="row" style="margin-bottom:8px"><span class="eyebrow grow" style="margin:0">Cuaderno</span><button class="btn small" id="nbPin">${x.pinned ? '📌 Fijada' : 'Fijar arriba'}</button><button class="mini" id="nbDel">${IC.trash}</button></div>
    <input class="input nbtitle" id="nbT" value="${esc(x.title)}" placeholder="Título">
    <textarea class="textarea nbbody" id="nbB" placeholder="Escribe aquí…">${esc(x.body)}</textarea>
    <div class="row" style="margin-top:8px"><span class="meta grow" id="nbSaved">Se guarda automáticamente</span><button class="btn small" id="nbSay">${IC.speak.replace('<svg', '<svg width="15" height="15"')} Leer en voz alta</button></div>`;
  let t;
  const save = () => { x.title = $('#nbT').value; x.body = $('#nbB').value; x.upd = Date.now(); saveNB(); $('#nbSaved').textContent = 'Guardado'; };
  const later = () => { $('#nbSaved').textContent = 'Guardando…'; clearTimeout(t); t = setTimeout(save, 600); };
  $('#nbT').addEventListener('input', later); $('#nbB').addEventListener('input', later);
  const grow = () => { const b = $('#nbB'); b.style.height = 'auto'; b.style.height = Math.max(260, b.scrollHeight) + 'px'; };
  $('#nbB').addEventListener('input', grow); grow();
  $('#nbPin').onclick = () => { x.pinned = !x.pinned; x.upd = Date.now(); saveNB(); $('#nbPin').textContent = x.pinned ? '📌 Fijada' : 'Fijar arriba'; };
  $('#nbDel').onclick = () => { if (!confirm('¿Borrar esta nota?')) return; NB = NB.filter(n => n.id !== id); TOMBS[id] = Date.now(); saveNB(); saveTombs(); go('#mine/nb'); };
  $('#nbSay').onclick = () => { const s = window.getSelection().toString() || $('#nbB').value; if (s.trim()) TTS.speak(s.slice(0, 3000)); };
  if (!x.title && !x.body) setTimeout(() => $('#nbT').focus(), 200);
  window.addEventListener('hashchange', function once() { if (!x.title.trim() && !x.body.trim()) { NB = NB.filter(n => n.id !== id); saveNB(); } window.removeEventListener('hashchange', once); });
}
function mineMarks() {
  const box = $('#mineBody');
  const card = (key, cls) => { const n = setItems(key).length; return `<a class="card markcard ${cls}" href="#set/${key}"><span class="mkbig">${SETS[key].ic}</span><b>${SETS[key].name}</b><span class="muted">${n}</span></a>`; };
  box.innerHTML = `<p class="sub" style="margin:4px 0 10px">Marca cualquier palabra con el icono de bandera, en la biblioteca, en tus listas o en tus fichas.</p>
    <div class="markgrid">${card('fav', 'fav')}${card('unknown', 'ko')}${card('hard', 'hard')}${card('known', 'ok')}</div>
    <div class="row" style="margin-top:18px"><div class="h2 grow" style="margin:0">Mis etiquetas</div><button class="btn small" id="addLbl">${IC.plus.replace('<svg', '<svg width="15" height="15"')} Nueva</button></div>
    <div style="margin-top:10px">${LABELS.length ? `<div class="card">${LABELS.map(L => `<div class="note"><a class="grow" href="#set/label:${L.id}" style="text-decoration:none;color:inherit"><span class="lbl big" style="--c:${L.color}">${esc(L.name)}</span> <span class="muted">${setItems('label:' + L.id).length}</span></a><button class="mini" data-elbl="${L.id}">${IC.pen}</button></div>`).join('')}</div>` : '<div class="card pad empty">Crea etiquetas propias con el color que quieras, por ejemplo «Garrigues», «Examen» o «Viaje a Londres».</div>'}</div>`;
  $('#addLbl').onclick = () => { if (createLabel()) mineMarks(); };
  $$('[data-elbl]').forEach(b => b.onclick = () => editLabel(b.dataset.elbl));
}
function editLabel(id) {
  const L = LABELS.find(x => x.id === id); if (!L) return;
  openSheet(`<h3>Editar etiqueta</h3><label class="lbl">Nombre</label><input class="input" id="eName" value="${esc(L.name)}">
    <label class="lbl">Color</label><div class="row wrap" style="gap:8px">${COLORS.map(c => `<button type="button" class="swatch ${c === L.color ? 'on' : ''}" style="background:${c}" data-c="${c}"></button>`).join('')}</div>
    <div class="row" style="margin-top:16px"><button class="btn danger" id="eDel">${IC.trash.replace('<svg', '<svg width="18" height="18"')}</button><button class="btn primary grow" id="eSave">Guardar</button></div>`, b => {
    let col = L.color;
    $$('.swatch', b).forEach(s => s.onclick = () => { col = s.dataset.c; $$('.swatch', b).forEach(x => x.classList.toggle('on', x === s)); });
    $('#eSave').onclick = () => { L.name = $('#eName').value.trim() || L.name; L.color = col; L.upd = Date.now(); saveLabels(); closeSheet(); route(); };
    $('#eDel').onclick = () => {
      if (!confirm('¿Borrar la etiqueta «' + L.name + '»?')) return;
      LABELS = LABELS.filter(x => x.id !== id); TOMBS[id] = Date.now();
      Object.keys(MARKS).forEach(k => { const m = MARKS[k]; if ((m.labels || []).includes(id)) { m.labels = m.labels.filter(l => l !== id); m.upd = Date.now(); } });
      saveLabels(); saveMarks(); saveTombs(); closeSheet(); route();
    };
  });
}
function renderSet(key) {
  const items = setItems(key);
  $('#view').innerHTML = `<div class="eyebrow">Marcas</div><div class="h1">${esc(setName(key))}</div><p class="sub">${items.length} ${items.length === 1 ? 'entrada' : 'entradas'}</p>
    ${items.length >= 2 ? `<div class="row wrap" style="margin-bottom:12px"><a class="btn primary grow" href="#ex/vocab/${key}">Test</a><a class="btn grow" href="#ex/review/${key}">Tarjetas</a></div>` : ''}
    ${items.length ? `<div class="card">${items.map(anyRow).join('')}</div>` : '<div class="empty">Todavía no hay nada aquí.</div>'}`;
  $('#view').onclick = rowClicks(() => renderSet(key));
}

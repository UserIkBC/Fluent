'use strict';
/* ==========================================================
   EXTRAS: mis textos, phrasal verbs por partícula y por verbo,
   ficha completa de cada entrada, packs de nativos, test de nivel
   con ruta personalizada y estadísticas nuevas
   ========================================================== */

/* ---------- mis textos (pega cualquier texto y léelo como una lectura) ---------- */
window.TEXTS = store.get('texts', []);
function saveTexts() { store.set('texts', window.TEXTS); POOL = []; }
function renderTexts() {
  const T = window.TEXTS;
  $('#view').innerHTML = `<div class="h1">Mis textos</div><p class="sub">Pega cualquier texto en inglés (un artículo, un email, la letra de un temario, apuntes…) y lo convierto en una lectura con audio, palabras traducibles con un toque y ejercicios.</p>
    <button class="btn primary block" id="txNew">${IC.plus.replace('<svg', '<svg width="16" height="16"')} Nuevo texto</button>
    <div class="h2">Guardados</div>
    ${T.length ? `<div class="card">${T.map(t => `<a class="note" href="#read/${t.id}" style="text-decoration:none;color:inherit"><div class="grow"><span class="term">${esc(t.title || 'Sin título')}</span><div class="meta">${String(t.body).split(/\s+/).length} palabras · ${new Date(t.upd || t.created).toLocaleDateString('es-ES', { day: 'numeric', month: 'short' })}${t.src ? ' · ' + esc(t.src) : ''}</div></div><span class="muted">›</span></a>`).join('')}</div>` : '<div class="empty">Aún no has añadido ningún texto.</div>'}`;
  $('#txNew').onclick = () => openTextEditor(null);
}
function openTextEditor(tx) {
  const isNew = !tx;
  openSheet(`<div class="h2" style="margin-top:0">${isNew ? 'Nuevo texto' : 'Editar texto'}</div>
    <label class="lbl">Título</label><input class="input" id="teT" value="${esc(tx ? tx.title : '')}" placeholder="Por ejemplo, Artículo sobre arbitraje">
    <label class="lbl">De dónde viene (opcional)</label><input class="input" id="teS" value="${esc(tx ? tx.src || '' : '')}" placeholder="The Guardian, un email, un libro…">
    <label class="lbl">Texto en inglés</label><textarea class="textarea" id="teB" style="min-height:220px" placeholder="Pega aquí el texto…">${esc(tx ? tx.body : '')}</textarea>
    <div class="row" style="margin-top:12px">${isNew ? '' : '<button class="btn danger" id="teDel">Borrar</button>'}<span class="grow"></span><button class="btn" id="teCancel">Cancelar</button><button class="btn primary" id="teSave">Guardar</button></div>`, () => {
    $('#teCancel').onclick = closeSheet;
    if ($('#teDel')) $('#teDel').onclick = () => { if (!confirm('¿Borrar este texto?')) return; window.TEXTS = window.TEXTS.filter(x => x.id !== tx.id); TOMBS[tx.id] = Date.now(); saveTombs(); saveTexts(); closeSheet(); go('#texts'); };
    $('#teSave').onclick = () => {
      const body = $('#teB').value.replace(/\r/g, '').trim();
      if (body.split(/\s+/).length < 5) { toast('Pega un texto un poco más largo'); return; }
      const title = $('#teT').value.trim() || body.split(/[.!?\n]/)[0].slice(0, 60);
      if (isNew) { tx = { id: 'tx-' + uid(), title, src: $('#teS').value.trim(), body, created: Date.now(), upd: Date.now() }; window.TEXTS.unshift(tx); }
      else Object.assign(tx, { title, src: $('#teS').value.trim(), body, upd: Date.now() });
      saveTexts(); closeSheet(); go('#read/' + tx.id); if (!isNew) route();
    };
  });
}

/* ---------- phrasal verbs por partícula y por verbo ---------- */
const PHR_PARTS = ['up', 'down', 'out', 'off', 'on', 'in', 'into', 'over', 'back', 'away', 'through', 'around', 'round', 'about', 'along', 'across', 'after', 'for', 'by', 'ahead', 'apart', 'forward', 'together', 'at', 'to', 'with', 'without', 'behind', 'under', 'past', 'onto', 'from', 'against'];
function phrParts(term) {
  const w = term.toLowerCase().replace(/\(.*?\)/g, ' ').replace(/^to /, '').split(/[\s/]+/).filter(x => x && !['sb', 'sth', 'someone', 'something', 'one\'s', 'it', 'me', 'oneself', 'yourself'].includes(x));
  return { verb: w[0], parts: w.slice(1).filter(x => PHR_PARTS.includes(x)) };
}
function phrasalGroup(key) {
  const [k, v] = [key.slice(0, 1), key.slice(2)];
  return LIB.filter(x => x.cat === 'phrasal').filter(x => { const p = phrParts(x.term); return k === 'p' ? p.parts.includes(v) : p.verb === v; });
}
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
  all.forEach(x => { const p = phrParts(x.term); const keys = phrState === 'p' ? p.parts : [p.verb]; keys.forEach(g => { if (g) (groups[g] = groups[g] || []).push(x); }); });
  const list = Object.entries(groups).filter(([, v]) => v.length >= (phrState === 'p' ? 1 : 3)).sort((a, b) => b[1].length - a[1].length);
  $('#view').innerHTML = `<div class="h1">Phrasal verbs</div><p class="sub">${all.length} phrasal verbs. La partícula suele dar una pista del significado: si entiendes qué aporta «up» u «out», adivinarás muchos sin haberlos visto nunca.</p>
    <div class="seg"><button class="${phrState === 'p' ? 'on' : ''}" data-ps="p">Por partícula</button><button class="${phrState === 'v' ? 'on' : ''}" data-ps="v">Por verbo</button></div>
    <div class="card">${list.map(([g, v]) => { const info = phrState === 'p' && window.PARTICLE_INFO ? PARTICLE_INFO[g] : null; const learned = v.filter(x => x.srs).length; return `<a class="note" href="#phrasal/${phrState}:${esc(g)}" style="text-decoration:none;color:inherit"><div class="grow"><span class="term">${esc(g)}</span>${info ? `<div class="es" style="display:block">${esc(info.es)}</div>` : ''}<div class="meta">${v.length} phrasal verbs · ${learned} en repasos</div></div><span class="muted">›</span></a>`; }).join('')}</div>
    <a class="btn block" href="#lib/phrasal" style="margin-top:12px">Ver la lista completa</a>`;
  $$('[data-ps]').forEach(b => b.onclick = () => { phrState = b.dataset.ps; renderPhrasal(); });
}

/* ---------- ficha completa de una entrada ---------- */
const IRREG = { get: 'got|gotten|gets|getting', put: 'puts|putting', take: 'took|taken|takes|taking', come: 'came|comes|coming', go: 'went|gone|goes|going', give: 'gave|given|gives|giving', make: 'made|makes|making', run: 'ran|runs|running', break: 'broke|broken|breaks|breaking', bring: 'brought|brings|bringing', set: 'sets|setting', turn: 'turned|turns|turning', look: 'looked|looks|looking', fall: 'fell|fallen|falls|falling', hold: 'held|holds|holding', keep: 'kept|keeps|keeping', let: 'lets|letting', cut: 'cuts|cutting', find: 'found|finds|finding', think: 'thought|thinks|thinking', see: 'saw|seen|sees|seeing', sit: 'sat|sits|sitting', stand: 'stood|stands|standing', throw: 'threw|thrown|throws|throwing', wear: 'wore|worn|wears|wearing', write: 'wrote|written|writes|writing', speak: 'spoke|spoken|speaks|speaking', tell: 'told|tells|telling', sell: 'sold|sells|selling', pay: 'paid|pays|paying', lay: 'laid|lays|laying', leave: 'left|leaves|leaving', feel: 'felt|feels|feeling', catch: 'caught|catches|catching', draw: 'drew|drawn|draws|drawing', drop: 'dropped|drops|dropping', stop: 'stopped|stops|stopping', be: 'is|are|was|were|been|being|\'s|\'re' };
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
  for (const p of POOL) { if (out.length >= n) break; if (seen.has(norm(p.s))) continue; if (re.test(p.s)) { seen.add(norm(p.s)); out.push(p); } }
  return out;
}
function registerTags(x) {
  const t = []; const d = (x.def || '') + ' ' + (x.ex || '');
  if (x.cat === 'ukus') t.push('UK / US');
  else if (/\(UK\)/.test(d) || x.top === 'uk') t.push('🇬🇧 Británico');
  else if (/\(US\)/.test(d) || x.top === 'us') t.push('🇺🇸 Americano');
  if (x.cat === 'slang' || /informal|slang|colloquial/i.test(d)) t.push('Informal');
  else if (/\bformal\b/i.test(d) || x.cat === 'legal') t.push('Formal');
  else if (['convo', 'chunk', 'idiom'].includes(x.cat)) t.push('Conversación');
  else t.push('Neutro');
  return t;
}
function openDetail(id) {
  const x = LIB_BY_ID[id] || NOTES.find(n => n.id === id); if (!x) return;
  const exs = moreExamples(x);
  const st = itemStatus(x);
  const fam = x.cat === 'phrasal' ? phrParts(x.term) : null;
  const sib = fam ? LIB.filter(y => y.cat === 'phrasal' && y.id !== x.id && phrParts(y.term).verb === fam.verb).slice(0, 8) : [];
  const paint = () => openSheet(`<div class="row wrap" style="gap:6px"><span class="tag ${x.cat === 'legal' ? 'warm' : ''}">${esc((LIB_CATS[x.cat] || { name: CATS[x.cat] || 'Mía' }).name)}</span>${TOPICS[x.top] ? `<span class="tag">${esc(TOPICS[x.top])}</span>` : ''}${registerTags(x).map(t => `<span class="tag">${esc(t)}</span>`).join('')}${STATUS_TAG[st] || ''}${markBadges(x.id)}</div>
    <div class="term" style="font-size:26px;margin-top:10px">${esc(x.term)}</div>
    <div class="row" style="gap:8px;margin-top:8px"><button class="btn small" id="dtSay">${IC.speak.replace('<svg', '<svg width="15" height="15"')} Escuchar</button><button class="btn small" id="dtSlow">🐢 Lento</button><button class="btn small" id="dtMark">${IC.flag.replace('<svg', '<svg width="14" height="14"')} Marcar</button></div>
    ${x.def ? `<p style="margin:12px 0 4px;font-size:17px">${esc(x.def)}</p>` : ''}
    <p style="margin:4px 0;font-weight:700;font-size:17px">${esc(x.es || '')}</p>
    ${x.ex ? `<div class="h2" style="margin-top:14px">Ejemplo</div><div class="ctx" data-sayx="${esc(x.ex)}" style="cursor:pointer">${esc(x.ex)} <span class="muted">${IC.speak.replace('<svg', '<svg width="14" height="14"')}</span></div>` : ''}
    ${exs.length ? `<div class="h2" style="margin-top:14px">Más ejemplos de la app</div>${exs.map(p => `<div class="ctx" data-sayx="${esc(p.s)}" style="cursor:pointer;margin-bottom:8px">${esc(p.s)}<div class="meta">${esc(p.src)}</div></div>`).join('')}` : ''}
    ${fam && fam.parts.length && window.PARTICLE_INFO && PARTICLE_INFO[fam.parts[0]] ? `<div class="h2" style="margin-top:14px">Pista de la partícula «${esc(fam.parts[0])}»</div><p class="muted" style="margin:0">${esc(PARTICLE_INFO[fam.parts[0]].es)}</p>` : ''}
    ${sib.length ? `<div class="h2" style="margin-top:14px">Otros con «${esc(fam.verb)}»</div><div class="row wrap" style="gap:6px">${sib.map(y => `<button class="chip" data-sib="${esc(y.id)}">${esc(y.term)}</button>`).join('')}</div>` : ''}
    ${x.lib && !x.srs ? '<button class="btn primary block" id="dtLearn" style="margin-top:16px">Añadir a mis repasos</button>' : ''}<div class="row" style="margin-top:8px"><button class="btn grow" id="dtCopy">Copiar a Mío y editar</button><button class="btn grow" id="dtClose">Cerrar</button></div>`, () => {
    $('#dtSay').onclick = () => TTS.speak(x.term, { rate: 0.9 });
    $('#dtSlow').onclick = () => TTS.speak(x.term, { rate: 0.65 });
    $('#dtMark').onclick = () => openMarkSheet(x.id, paint);
    $('#dtClose').onclick = closeSheet;
    if ($('#dtLearn')) $('#dtLearn').onclick = () => { startLearning(x); saveLearn(); toast('Añadida a tus repasos'); paint(); };
    $('#dtCopy').onclick = () => { closeSheet(); setTimeout(() => openNoteEditor({ term: x.term, cat: x.cat, es: x.es, def: x.def, ex: x.ex, exs: exs.map(p => p.s).slice(0, 3).join('\n'), src: 'Biblioteca' }), 260); };
    $('#sheetBody').onclick = e => { const s = e.target.closest('[data-sayx]'); if (s) TTS.speak(s.dataset.sayx); const b = e.target.closest('[data-sib]'); if (b) openDetail(b.dataset.sib); };
  });
  paint();
}

/* ---------- packs «Lo que dicen los nativos en…» ---------- */
function renderPacks() {
  const P = (window.SITUATIONS || []).filter(s => s.pack);
  $('#view').innerHTML = `<div class="h1">Lo que dicen los nativos en…</div><p class="sub">Frases reales, de las que no salen en los libros, para cada sitio. Escúchalas, guárdalas y dilas en voz alta.</p>
    <div class="card">${P.map(s => `<a class="note" href="#sit/${s.id}" style="text-decoration:none;color:inherit"><div class="grow"><span class="term">${esc(s.title.replace('Lo que dicen los nativos ', '…'))}</span><div class="es" style="display:block">${esc(s.es)} · ${s.phrases.length} frases</div></div><span class="muted">›</span></a>`).join('')}</div>`;
}

/* ---------- test de nivel y ruta personalizada ---------- */
const AREA_NAME = { grammar: 'Gramática', vocab: 'Vocabulario', natural: 'Inglés natural', legal: 'Inglés jurídico', listen: 'Comprensión oral' };
const AREA_ROUTE = {
  listen: [['#dlg', 'Escucha un diálogo real', 'A dos voces, primero sin texto'], ['#ex/fast', 'Test de inglés rápido', 'Cómo suenan de verdad las frases'], ['#ex/dict', 'Un dictado', 'Escucha y escribe'], ['#handsfree', 'Manos libres', 'Repasa en audio mientras caminas'], ['#ex/ear', 'Tarjetas de oído', 'Reconoce tus palabras sin leerlas']],
  natural: [['#native', 'Dilo como un nativo', 'Frases que delatan a un español'], ['#lib/chunk', 'Chunks', 'Bloques de frase para hablar con fluidez'], ['#rp', 'Un role-play', 'Elige la respuesta más natural'], ['#packs', 'Lo que dicen los nativos', 'Frases para cada sitio'], ['#lib/slang', 'Slang', 'Lo que oirás en la calle']],
  vocab: [['#new', 'Palabras nuevas', 'Tus palabras del día'], ['#phrasal', 'Phrasal verbs por partícula', 'Entiende la lógica de up, out, off…'], ['#ex/vocab', 'Test de vocabulario', 'Repasa lo aprendido'], ['#ex/prod', 'Tarjetas de producción', 'Del español al inglés en voz alta']],
  grammar: [['#grammar', 'Una lección de gramática', 'Con explicación y ejercicios'], ['#ex/gap', 'Huecos en contexto', 'Gramática y vocabulario en frases reales'], ['#ex/order', 'Ordena la frase', 'Para fijar el orden de las palabras']],
  legal: [['#legal', 'Inglés jurídico', 'Vocabulario por áreas'], ['#ex/vocab/legal', 'Test jurídico', 'Repasa términos del despacho'], ['#read/st-london-1', 'A Year in London', 'Historia de un trainee en Londres']],
  speak: [['#ai', 'Conversación con IA', 'Habla de lo que quieras y recibe correcciones'], ['#ex/say', 'Pronuncia', 'El móvil te marca lo que no entiende'], ['#diary', 'Diario hablado', 'Grábate un par de minutos'], ['#ex/shadow', 'Shadowing', 'Imita a un nativo frase a frase']]
};
function routeCard() {
  const P = S.placement;
  if (!P) return `<a class="card pad cta" href="#level" style="margin-top:12px"><div class="grow"><b>Haz el test de nivel</b><div class="muted" style="font-size:14px">5 minutos. Con el resultado te preparo una ruta diaria según tus puntos débiles</div></div><span class="btn primary small">Empezar</span></a>`;
  const weak = Object.entries(P.areas).sort((a, b) => a[1] - b[1]).map(x => x[0]);
  const picks = [dailyPick(AREA_ROUTE[weak[0]] || AREA_ROUTE.listen, 'r1'), dailyPick(AREA_ROUTE[weak[1]] || AREA_ROUTE.natural, 'r2'), dailyPick(AREA_ROUTE.speak, 'r3')];
  return `<div class="h2">Tu ruta de hoy · nivel ${esc(P.level)}</div><div class="card">${picks.map(r => `<a class="note" href="${r[0]}" style="text-decoration:none;color:inherit"><div class="grow"><span class="term" style="font-size:16px">${esc(r[1])}</span><div class="muted" style="font-size:13.5px">${esc(r[2])}</div></div><span class="muted">›</span></a>`).join('')}</div>`;
}
function renderLevel(arg) {
  const Q = window.PLACEMENT || [];
  const P = S.placement;
  if (arg !== 'start' && P) {
    $('#view').innerHTML = `<div class="h1">Tu nivel</div><div class="card pad" style="text-align:center"><div style="font-family:var(--serif);font-size:56px;font-weight:700;color:var(--accent)">${esc(P.level)}</div><div class="muted">Test hecho el ${new Date(P.date).toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' })}</div></div>
      <div class="h2">Por áreas</div><div class="card pad">${Object.entries(P.areas).map(([a, v]) => `<div class="goal"><div class="row"><span>${esc(AREA_NAME[a] || a)}</span><span class="muted">${v}%</span></div><div class="progressbar"><i style="width:${v}%"></i></div></div>`).join('')}</div>
      <div class="h2">Qué te recomiendo</div><div class="card pad">${levelAdvice(P)}</div>
      <button class="btn block" id="lvAgain" style="margin-top:12px">Repetir el test</button>`;
    $('#lvAgain').onclick = () => go('#level/start');
    return;
  }
  if (!Q.length) { $('#view').innerHTML = '<div class="empty">No hay test disponible.</div>'; return; }
  const qs = shuffle(Q.map((q, i) => ({ q, i }))); let k = 0; const res = [];
  const show = () => {
    if (k >= qs.length) return finish();
    const { q } = qs[k];
    const isL = q[0] === 'listen';
    $('#view').innerHTML = `<div class="row" style="margin-bottom:8px"><b class="grow">Test de nivel · ${esc(AREA_NAME[q[0]])}</b><span class="muted">${k + 1}/${qs.length}</span></div><div class="progressbar"><i style="width:${k / qs.length * 100}%"></i></div>
      <div id="qArea">${isL ? `<p class="muted" style="margin:16px 0 6px">Escucha y elige lo que has oído (puedes repetir 2 veces)</p><div style="text-align:center"><button class="btn primary" id="lvP">${IC.play.replace('<svg', '<svg width="16" height="16"')} Escuchar</button></div>` : `<div class="q">${esc(q[1])}</div>`}
      <div class="opts">${q[2].map((o, j) => `<button class="opt" data-j="${j}">${esc(o)}</button>`).join('')}</div>
      <button class="btn ghost block" id="lvSkip" style="margin-top:10px">No lo sé</button></div>`;
    let plays = 0;
    if (isL) { const play = () => { if (plays >= 3) return; plays++; TTS.speak(q[5], { rate: 1.05 }); }; $('#lvP').onclick = play; setTimeout(play, 300); }
    const ans = ok => { res.push({ area: q[0], level: q[4], ok }); k++; show(); };
    $('.opts').onclick = e => { const b = e.target.closest('.opt'); if (b) ans(+b.dataset.j === q[3]); };
    $('#lvSkip').onclick = () => ans(false);
  };
  const finish = () => {
    const acc = f => { const r = res.filter(f); return r.length ? r.filter(x => x.ok).length / r.length : 0; };
    const b1 = acc(x => x.level === 'B1'), b2 = acc(x => x.level === 'B2'), c1 = acc(x => x.level === 'C1');
    const level = c1 >= 0.6 && b2 >= 0.7 ? 'C1' : b2 >= 0.75 && b1 >= 0.8 ? 'B2+' : b2 >= 0.5 && b1 >= 0.7 ? 'B2' : b1 >= 0.6 ? 'B1' : 'A2';
    const areas = {}; Object.keys(AREA_NAME).forEach(a => { if (res.some(x => x.area === a)) areas[a] = Math.round(acc(x => x.area === a) * 100); });
    S.placement = { date: Date.now(), level, areas };
    if (!S._lvTuned) { S.newPerDay = level.startsWith('C') ? 15 : level.startsWith('B2') ? 12 : 8; S._lvTuned = true; }
    saveSettings();
    renderLevel();
  };
  show();
}
function levelAdvice(P) {
  const weak = Object.entries(P.areas).sort((a, b) => a[1] - b[1]);
  const tips = {
    listen: 'Tu oído es lo que más hay que entrenar. Cada día, 10 minutos de diálogos sin texto o del modo manos libres, y un dictado corto.',
    natural: 'Sabes inglés pero a veces suena traducido. Dedica tiempo a «Dilo como un nativo», a los chunks y a los role-plays.',
    vocab: 'Amplía vocabulario con las palabras del día y los phrasal verbs por partícula. Repasa siempre las tarjetas pendientes.',
    grammar: 'Hay estructuras que todavía fallan. Haz una lección de gramática cada dos días y practica con «Huecos en contexto».',
    legal: 'Refuerza el inglés jurídico con la sección del despacho y la historia «A Year in London».'
  };
  return `<p style="margin-top:0">Tus dos áreas más flojas son <b>${esc(AREA_NAME[weak[0][0]])}</b> y <b>${esc(AREA_NAME[(weak[1] || weak[0])[0]])}</b>. En la pantalla Hoy verás cada día una ruta con tres actividades pensadas para ellas.</p>${weak.slice(0, 2).map(([a]) => `<p>${esc(tips[a] || '')}</p>`).join('')}<p class="muted" style="margin-bottom:0">Y habla en voz alta todos los días, aunque sean 5 minutos. Es lo que más diferencia a quien entiende de quien habla con soltura.</p>`;
}

/* ---------- estadísticas nuevas ---------- */
function progressExtra() {
  const sum = (d, k) => d[k] || 0;
  const keys = Object.keys(STATS);
  const tot = k => keys.reduce((a, d) => a + sum(STATS[d], k), 0);
  const week = k => { let a = 0; for (let i = 0; i < 7; i++) { const d = new Date(); d.setDate(d.getDate() - i); a += sum(STATS[dayKey(d)] || {}, k); } return a; };
  const inRev = LIB.filter(x => x.srs).concat(NOTES.filter(n => n.srs));
  const passive = inRev.filter(x => x.srs.reps >= 1 || x.srs.known).length;
  const active = inRev.filter(x => (x.srs.prodOk || 0) >= 1).length;
  const months = []; for (let i = 5; i >= 0; i--) { const d = new Date(); d.setDate(1); d.setMonth(d.getMonth() - i); months.push({ y: d.getFullYear(), m: d.getMonth(), label: d.toLocaleDateString('es-ES', { month: 'short' }) }); }
  months.forEach(M => {
    const pref = M.y + '-' + String(M.m + 1).padStart(2, '0');
    const ks = keys.filter(k => k.startsWith(pref));
    M.min = Math.round(ks.reduce((a, k) => a + sum(STATS[k], 'sec') + sum(STATS[k], 'lsec') + sum(STATS[k], 'ssec'), 0) / 60);
    M.words = inRev.filter(x => { const t = x.srs.added || x.created; if (!t) return false; const d = new Date(t); return d.getFullYear() === M.y && d.getMonth() === M.m; }).length;
  });
  const maxW = Math.max(5, ...months.map(m => m.words)); const maxM = Math.max(10, ...months.map(m => m.min));
  const chart = (key, max) => `<div class="chart">${months.map((m, i) => `<div class="bar ${i === 5 ? 'today' : ''}"><i style="height:${m[key] / max * 100}%"></i><span>${esc(m.label)}</span></div>`).join('')}</div>`;
  return `<div class="h2">Escuchar y hablar</div>
    <div class="stats">
      <div class="card stat"><b>${Math.round(week('lsec') / 60)}</b><span>min escuchando (7 días)</span></div>
      <div class="card stat"><b>${Math.round(week('ssec') / 60)}</b><span>min hablando (7 días)</span></div>
      <div class="card stat"><b>${Math.round(tot('lsec') / 60)}</b><span>min escuchando en total</span></div>
      <div class="card stat"><b>${Math.round(tot('ssec') / 60)}</b><span>min hablando en total</span></div>
    </div>
    <div class="h2">Vocabulario activo y pasivo</div>
    <div class="card pad"><div class="goal"><div class="row"><span>Pasivo · lo entiendes</span><span class="muted">${passive}</span></div><div class="progressbar"><i style="width:${inRev.length ? passive / inRev.length * 100 : 0}%"></i></div></div>
      <div class="goal"><div class="row"><span>Activo · lo has dicho tú</span><span class="muted">${active}</span></div><div class="progressbar"><i style="width:${inRev.length ? active / inRev.length * 100 : 0}%;background:var(--good)"></i></div></div>
      <div class="meta" style="margin-top:6px">Una palabra pasa a activa cuando la produces tú en las tarjetas de producción. <a href="#ex/prod">Practicar ahora</a></div></div>
    <div class="h2">Por meses</div>
    <div class="card pad"><b style="font-size:14px">Palabras nuevas en tus repasos</b>${chart('words', maxW)}<b style="font-size:14px;display:block;margin-top:14px">Minutos de lectura, escucha y speaking</b>${chart('min', maxM)}</div>
    ${S.placement ? `<a class="card pad cta" href="#level" style="margin-top:12px"><div class="grow"><b>Nivel ${esc(S.placement.level)}</b><div class="muted" style="font-size:14px">Ver detalle o repetir el test de nivel</div></div><span class="muted">›</span></a>` : ''}`;
}

'use strict';
/* ==========================================================
   LEER · todas las fuentes de textos
   Textos Fluent (escritos para la app), The Guardian, Wikipedia,
   novelas clásicas completas y textos pegados por ti
   ========================================================== */
window.ORIG = window.ORIG || [];
window.TEXTS = store.get('texts', []);
function saveTexts() { store.set('texts', window.TEXTS); POOL = []; }

const KINDS = ['Ensayo', 'Opinión', 'Noticia explicada', 'Reportaje', 'Entrevista', 'Reseña', 'Perfil', 'Relato', 'Historia por capítulos', 'Despacho', 'Email', 'Mensajes', 'Foro', 'Carta', 'Guía', 'Diario', 'Discurso', 'Lectura'];
const TOPIC_NAMES = { news: 'Actualidad', myth: 'Mitos y leyendas', ideas: 'Ideas y filosofía', mind: 'Mente y psicología', tech: 'Tecnología', nature: 'Naturaleza', mystery: 'Crímenes y misterios', politics: 'Política', law: 'Derecho', business: 'Empresa y economía', sport: 'Deporte', culture: 'Cultura y ocio', science: 'Ciencia y tecnología', society: 'Sociedad', life: 'Vida diaria', history: 'Historia', travel: 'Viajes', food: 'Comida', work: 'Trabajo' };

/* textos Fluent normalizados */
let _ALLT = null;
function allTexts() {
  if (_ALLT && _ALLT.n === window.ORIG.length + window.TEXTS.length) return _ALLT.list;
  const list = [];
  (window.READINGS || []).forEach(r => list.push({ id: 'o:' + r.id, src: 'orig', kind: r.series ? 'Historia por capítulos' : r.legal ? 'Despacho' : 'Lectura', topic: r.legal ? 'law' : 'society', title: r.headline, sub: r.standfirst, body: r.body, series: r.series, chapter: r.chapter }));
  window.ORIG.forEach(o => list.push(Object.assign({ src: 'orig' }, o, { id: 'o:' + o.id, body: Array.isArray(o.body) ? o.body : String(o.body).split(/\n+/).map(x => x.trim()).filter(Boolean) })));
  window.TEXTS.forEach(t => list.push({ id: 'm:' + t.id, src: 'mine', kind: 'Mi texto', topic: 'mine', title: t.title || 'Sin título', sub: t.src || '', body: String(t.body).split(/\n+/).map(x => x.trim()).filter(Boolean), editable: true }));
  _ALLT = { n: window.ORIG.length + window.TEXTS.length, list };
  return list;
}
const origById = id => allTexts().find(t => t.id === id);

/* % conocido con caché por sesión */
const PCT_CACHE = {};
function cachedPct(t) { const k = t.id + '|' + WVER + '|' + (S.knownRank || 0); if (PCT_CACHE[k] == null) PCT_CACHE[k] = knownPct(t.body); return PCT_CACHE[k]; }

/* ---------- carga de un texto por id ---------- */
async function loadText(id) {
  const [pre, ...rest] = id.split(':'); const key = rest.join(':');
  if (pre === 'o' || pre === 'm') {
    const t = origById(id); if (!t) throw new Error('No encuentro este texto.');
    const o = Object.assign({ srcName: pre === 'm' ? 'Mi texto' : 'Fluent' }, t);
    if (t.series) { const nx = allTexts().find(x => x.series === t.series && x.chapter === t.chapter + 1); if (nx) o.next = { href: '#r/' + nx.id, label: 'Siguiente capítulo' }; }
    else { const sim = allTexts().filter(x => x.src === 'orig' && x.id !== id && (x.topic === t.topic || x.kind === t.kind) && !(READS[x.id] && READS[x.id].done)).slice(0, 4); if (sim.length) o.more = `<div class="card list-card">${sim.map(textCard).join('')}</div>`; }
    return o;
  }
  if (pre === 'g') return guardianArticle(key);
  if (pre === 'w') return wikiArticle(key);
  if (pre === 'b') return bookChapter(key);
  throw new Error('Texto desconocido.');
}

/* tarjeta de un texto en las listas */
function textCard(t) {
  const r = READS[t.id];
  const pct = t.body ? cachedPct(t) : null;
  const words = t.body ? wordCount(t.body) : t.words || 0;
  return `<a class="story" href="#r/${esc(t.id)}"><div class="meta"><span class="tag ${t.topic === 'law' ? 'warm' : ''}">${esc(t.kind || '')}</span>${t.topic && TOPIC_NAMES[t.topic] ? `<span>${esc(TOPIC_NAMES[t.topic])}</span>` : ''}${words ? `<span>${Math.max(1, Math.round(words / 160))} min</span>` : ''}${pct != null ? `<span class="pctchip ${pct >= 95 ? 'hi' : pct >= 88 ? 'mid' : 'lo'}">${pct}%</span>` : ''}${r && r.done ? '<span class="read-badge">✓ Leído</span>' : r && r.pct ? `<span class="read-badge">${r.pct}%</span>` : ''}</div><h3>${esc(t.title)}</h3>${t.sub ? `<p class="trail">${esc(t.sub)}</p>` : ''}</a>`;
}

/* ==========================================================
   PESTAÑA LEER
   ========================================================== */
function renderRead() {
  const all = allTexts().filter(t => t.src === 'orig');
  const unread = all.filter(t => !(READS[t.id] && READS[t.id].done));
  const cont = Object.entries(READS).filter(([, r]) => !r.done && r.pct > 0 && r.pct < 100).sort((a, b) => b[1].upd - a[1].upd).slice(0, 4);
  const forYou = recommend(unread, 5);
  const kinds = KINDS.map(k => [k, all.filter(t => t.kind === k).length]).filter(x => x[1]);
  $('#view').innerHTML = `
    <div class="h1">Leer</div>
    <p class="sub">Textos reales, sin niveles ni simplificar. El porcentaje indica cuántas de sus palabras conoces ya.</p>
    ${cont.length ? `<div class="h2">Seguir leyendo</div><div class="card list-card">${cont.map(([id, r]) => `<a class="story" href="#r/${esc(id)}"><div class="meta"><span class="tag">${esc(r.kind || '')}</span><span class="read-badge">${r.pct}%</span></div><h3>${esc(r.title)}</h3></a>`).join('')}</div>` : ''}
    <div class="srcgrid">
      <a class="srccard" href="#orig"><b>${fmtNum(all.length)}</b><span>Textos Fluent</span></a>
      <a class="srccard" href="#guardian"><b>${ico('news', 22)}</b><span>The Guardian</span></a>
      <a class="srccard" href="#wiki"><b>${ico('globe', 22)}</b><span>Wikipedia</span></a>
      <a class="srccard" href="#books"><b>${(window.BOOKS || []).length}</b><span>Novelas</span></a>
      <a class="srccard" href="#texts"><b>${window.TEXTS.length}</b><span>Mis textos</span></a>
      <a class="srccard" href="#history"><b>${HISTORY.length}</b><span>Leídos</span></a>
    </div>
    ${forYou.length ? `<div class="h2">Para ti ahora</div><div class="card list-card">${forYou.map(textCard).join('')}</div>` : ''}
    <div class="h2">Por tipo de texto</div>
    <div class="chips wrapchips">${kinds.map(([k, n]) => `<a class="chip" href="#orig/kind:${encodeURIComponent(k)}">${esc(k)} <span class="muted">${n}</span></a>`).join('')}</div>
    <div class="h2">Por tema</div>
    <div class="chips wrapchips">${Object.entries(TOPIC_NAMES).map(([k, n]) => [k, n, all.filter(t => t.topic === k).length]).filter(x => x[2]).map(([k, n, c]) => `<a class="chip" href="#orig/topic:${k}">${esc(n)} <span class="muted">${c}</span></a>`).join('')}</div>
    <div class="h2">Buscar</div>
    <div class="search">${IC.search}<input class="input" id="rq" type="search" placeholder="Busca en los ${fmtNum(all.length)} textos…"></div><div id="rqRes" style="margin-top:10px"></div>`;
  $('#rq').addEventListener('input', e => {
    const q = norm(e.target.value); if (q.length < 3) { $('#rqRes').innerHTML = ''; return; }
    const r = allTexts().filter(t => norm(t.title + ' ' + (t.sub || '')).includes(q) || norm(t.body.join(' ')).includes(q)).slice(0, 30);
    $('#rqRes').innerHTML = r.length ? `<div class="card list-card">${r.map(textCard).join('')}</div>` : '<div class="empty">Nada por aquí.</div>';
  });
}
/* recomendación: textos que no has leído, de tus temas, con un % conocido que permita leer cómodo */
function nextInSeries(t) { if (!t.series) return true; const prev = allTexts().find(x => x.series === t.series && x.chapter === t.chapter - 1); return !prev || (READS[prev.id] && READS[prev.id].done); }
function recommend(list, n) {
  const fav = new Set(S.topics || []);
  list = list.filter(nextInSeries);
  const scored = list.map(t => { const p = cachedPct(t); let sc = 0; const wc = wordCount(t.body); if (wc >= 2500) sc += 4; else if (wc >= 1200) sc += 2; if (p >= 88 && p <= 98) sc += 3; else if (p > 98) sc += 1; if (fav.has(t.topic)) sc += 2; sc += Math.random() * 1.5; return [sc, t]; });
  const seen = new Set(); const out = [];
  scored.sort((a, b) => b[0] - a[0]).forEach(([, t]) => { if (out.length < n && !seen.has(t.kind)) { seen.add(t.kind); out.push(t); } });
  return out;
}

/* lista de textos Fluent con filtros */
let olState = { sort: 'long', hideRead: false };
function renderOrigList(arg) {
  const filt = arg || '';
  let base = allTexts().filter(t => t.src === 'orig');
  let title = 'Textos Fluent';
  if (filt && filt.startsWith('kind:')) { const k = decodeURIComponent(filt.slice(5)); base = base.filter(t => t.kind === k); title = k; }
  if (filt && filt.startsWith('topic:')) { const k = filt.slice(6); base = base.filter(t => t.topic === k); title = TOPIC_NAMES[k] || k; }
  $('#view').innerHTML = `<div class="h1">${esc(title)}</div><p class="sub">${fmtNum(base.length)} textos</p>
    <div class="row wrap" style="margin-bottom:10px"><select class="select" id="olSort" style="width:auto;padding:8px 10px;font-size:14px"><option value="rec">Recomendados</option><option value="pctd">Más fáciles para ti</option><option value="pcta">Más retadores</option><option value="short">Más cortos</option><option value="long">Más largos</option><option value="new">Más nuevos</option></select>
    <label class="switch" style="padding:0;gap:6px;flex:1"><span style="font-size:14px">Ocultar leídos</span><input type="checkbox" id="olHide" ${olState.hideRead ? 'checked' : ''}></label></div>
    <div id="olList"></div><button class="btn block hidden" id="olMore" style="margin-top:10px">Ver más</button>`;
  $('#olSort').value = olState.sort;
  let shown = 30;
  const paint = () => {
    let l = base.filter(t => !olState.hideRead || !(READS[t.id] && READS[t.id].done));
    const s = olState.sort;
    if (s === 'rec') { const fav = new Set(S.topics || []); l = l.map(t => [((p => p >= 88 && p <= 98 ? 3 : p > 98 ? 1 : 0)(cachedPct(t))) + (fav.has(t.topic) ? 1 : 0) + (READS[t.id] && READS[t.id].done ? -5 : 0), t]).sort((a, b) => b[0] - a[0]).map(x => x[1]); }
    if (s === 'pctd') l.sort((a, b) => cachedPct(b) - cachedPct(a)); if (s === 'pcta') l.sort((a, b) => cachedPct(a) - cachedPct(b));
    if (s === 'short') l.sort((a, b) => wordCount(a.body) - wordCount(b.body)); if (s === 'long') l.sort((a, b) => wordCount(b.body) - wordCount(a.body));
    if (s === 'new') l = l.slice().reverse();
    $('#olList').innerHTML = l.length ? `<div class="card list-card">${l.slice(0, shown).map(textCard).join('')}</div>` : '<div class="empty">Nada por aquí.</div>';
    $('#olMore').classList.toggle('hidden', l.length <= shown);
  };
  $('#olSort').onchange = e => { olState.sort = e.target.value; shown = 30; paint(); };
  $('#olHide').onchange = e => { olState.hideRead = e.target.checked; paint(); };
  $('#olMore').onclick = () => { shown += 30; paint(); };
  paint();
}
function renderHistory() {
  $('#view').innerHTML = `<div class="h1">Leídos</div><p class="sub">${fmtNum(HISTORY.length)} textos terminados · ${fmtNum(HISTORY.reduce((a, h) => a + (h.words || 0), 0))} palabras leídas</p>
    ${HISTORY.length ? `<div class="card list-card">${HISTORY.slice(0, 200).map(h => `<a class="story" href="#r/${esc(h.id)}"><div class="meta"><span class="tag">${esc(h.section || '')}</span><span>${new Date(h.readAt).toLocaleDateString('es-ES', { day: 'numeric', month: 'short' })}</span></div><h3>${esc(h.title)}</h3></a>`).join('')}</div>` : '<div class="empty">Aún no has terminado ningún texto.</div>'}`;
}

/* ==========================================================
   THE GUARDIAN (clave gratuita del usuario)
   ========================================================== */
const G_SECTIONS = [
  ['latest', 'Lo último', ''], ['opinion', 'Opinión', 'section=commentisfree'], ['editorials', 'Editoriales', 'tag=tone/editorials'],
  ['longread', 'The Long Read', 'tag=news/series/the-long-read'], ['features', 'Reportajes', 'tag=tone/features'], ['interviews', 'Entrevistas', 'tag=tone/interviews'],
  ['world', 'Mundo', 'section=world'], ['uk', 'Reino Unido', 'section=uk-news'], ['politics', 'Política', 'section=politics'], ['law', 'Derecho', 'section=law'],
  ['business', 'Empresa', 'section=business'], ['money', 'Dinero', 'section=money'], ['tech', 'Tecnología', 'section=technology'], ['science', 'Ciencia', 'section=science'],
  ['environment', 'Medio ambiente', 'section=environment'], ['society', 'Sociedad', 'section=society'], ['education', 'Educación', 'section=education'],
  ['football', 'Fútbol', 'section=football'], ['sport', 'Deporte', 'section=sport'], ['culture', 'Cultura', 'section=culture'], ['film', 'Cine', 'section=film'],
  ['tv', 'Series y TV', 'section=tv-and-radio'], ['books', 'Libros', 'section=books'], ['music', 'Música', 'section=music'], ['reviews', 'Reseñas', 'tag=tone/reviews'],
  ['life', 'Estilo de vida', 'section=lifeandstyle'], ['travel', 'Viajes', 'section=travel'], ['food', 'Comida', 'section=food']
];
const G_API = 'https://content.guardianapis.com';
function gCalls() { const c = store.get('gcalls', {}); return c.d === dayKey() ? c.n : 0; }
async function gFetch(path) {
  if (!S.guardianKey) throw new Error('nokey');
  const c = { d: dayKey(), n: gCalls() + 1 }; store.set('gcalls', c);
  let r;
  try { r = await fetch(G_API + path + (path.includes('?') ? '&' : '?') + 'api-key=' + encodeURIComponent(S.guardianKey)); }
  catch (e) { throw new Error('No he podido conectar con The Guardian. Comprueba la conexión y que la clave de Ajustes esté bien copiada.'); }
  if (r.status === 401 || r.status === 403) throw new Error('La clave del Guardian no es válida. Revísala en Ajustes.');
  if (r.status === 429) throw new Error('Has llegado al límite de 500 artículos de hoy del Guardian. Mañana se renueva; mientras tanto tienes los textos Fluent, Wikipedia y las novelas.');
  if (!r.ok) throw new Error('The Guardian no responde ahora mismo (error ' + r.status + ').');
  const j = await r.json(); return j.response;
}
function gKeyBox() {
  return `<div class="card pad"><b>Conecta The Guardian</b><p class="muted" style="font-size:14.5px">Necesitas una clave gratuita a tu nombre. Se saca en dos minutos y no pide tarjeta.</p>
    <ol class="steps"><li>Entra en <a href="https://open-platform.theguardian.com/access/" target="_blank" rel="noopener">open-platform.theguardian.com</a> y pulsa «Register for a developer key».</li><li>Rellena tu nombre y tu correo. En el uso pon «personal English learning app».</li><li>Te llega la clave por correo. Pégala aquí.</li></ol>
    <input class="input" id="gkIn" placeholder="Clave del Guardian" autocomplete="off" autocapitalize="off" spellcheck="false"><button class="btn primary block" id="gkSave" style="margin-top:10px">Guardar clave</button></div>`;
}
function bindGKey(after) { if (!$('#gkSave')) return; $('#gkSave').onclick = () => { const k = $('#gkIn').value.trim(); if (k.length < 10) { toast('Esa clave parece incompleta'); return; } S.guardianKey = k; saveSettings(); toast('Clave guardada'); after(); }; }
async function renderGuardian(arg) {
  if (!S.guardianKey) { $('#view').innerHTML = `<div class="h1">The Guardian</div><p class="sub">Más de un millón de artículos reales: noticias, opinión, reportajes, entrevistas, deporte, cultura, derecho…</p>${gKeyBox()}`; bindGKey(() => renderGuardian(arg)); return; }
  const [sec = 'latest', q = ''] = (arg || '').split('/');
  const s = G_SECTIONS.find(x => x[0] === sec) || G_SECTIONS[0];
  $('#view').innerHTML = `<div class="h1">The Guardian</div>
    <div class="search">${IC.search}<input class="input" id="gq" type="search" placeholder="Busca artículos (en inglés)…" value="${esc(decodeURIComponent(q))}"></div>
    <div class="chips" id="gChips" style="margin-top:10px">${G_SECTIONS.map(x => `<a class="chip ${x[0] === s[0] && !q ? 'active' : ''}" href="#guardian/${x[0]}">${esc(x[1])}</a>`).join('')}</div>
    <div id="gList"><div class="spinner"></div></div><button class="btn block hidden" id="gMore" style="margin-top:10px">Cargar más</button>
    <p class="meta" style="margin-top:12px">Llevas ${gCalls()} de 500 consultas de hoy · Contenido de theguardian.com, solo para uso personal.</p>`;
  const a = $('#gChips .chip.active'); if (a) a.scrollIntoView({ inline: 'center', block: 'nearest' });
  $('#gq').addEventListener('keydown', e => { if (e.key === 'Enter') go('#guardian/search/' + encodeURIComponent(e.target.value.trim())); });
  let page = 1; const items = [];
  const load = async () => {
    try {
      const filter = sec === 'search' ? 'q=' + q : s[2];
      const cacheKey = 'gl:' + sec + ':' + q + ':' + page;
      let res = page === 1 ? JSON.parse(sessionStorage.getItem(cacheKey) || 'null') : null;
      if (!res) { res = await gFetch('/search?' + (filter ? filter + '&' : '') + 'type=article&show-fields=trailText,wordcount,byline&page-size=20&order-by=newest&page=' + page); try { sessionStorage.setItem(cacheKey, JSON.stringify(res)); } catch (e) {} }
      if (!location.hash.startsWith('#guardian')) return;
      items.push(...res.results);
      $('#gList').innerHTML = items.length ? `<div class="card list-card">${items.map(gCard).join('')}</div>` : '<div class="empty">Sin resultados.</div>';
      $('#gMore').classList.toggle('hidden', page >= res.pages);
    } catch (e) { $('#gList').innerHTML = `<div class="card pad empty">${esc(e.message)}</div>`; }
  };
  $('#gMore').onclick = () => { page++; $('#gMore').classList.add('hidden'); load(); };
  load();
}
function gCard(x) {
  const id = 'g:' + x.id; const r = READS[id]; const f = x.fields || {};
  const kind = /commentisfree/.test(x.id) ? 'Opinión' : x.sectionName;
  return `<a class="story" href="#r/${esc(id)}"><div class="meta"><span class="tag">${esc(kind)}</span>${f.wordcount ? `<span>${Math.max(1, Math.round(f.wordcount / 160))} min</span>` : ''}<span>${new Date(x.webPublicationDate).toLocaleDateString('es-ES', { day: 'numeric', month: 'short', year: 'numeric' })}</span>${r && r.done ? '<span class="read-badge">✓ Leído</span>' : r && r.pct ? `<span class="read-badge">${r.pct}%</span>` : ''}</div><h3>${esc(x.webTitle)}</h3>${f.trailText ? `<p class="trail">${esc(stripTags(f.trailText))}</p>` : ''}</a>`;
}
function htmlToParas(html) {
  const doc = new DOMParser().parseFromString('<div>' + html + '</div>', 'text/html');
  $$('figure, aside, .element-rich-link, .element-embed, .element-image, script, style', doc).forEach(e => e.remove());
  const out = []; const heads = new Set();
  $$('p, h2, h3, li, blockquote', doc).forEach(e => {
    if (e.tagName === 'P' && e.closest('li, blockquote')) return;
    const t = e.textContent.replace(/\s+/g, ' ').trim(); if (!t || /^(Related|Sign up|Explore more|Photograph:|Composite:)/i.test(t)) return;
    if (/^H[23]$/.test(e.tagName)) heads.add(out.length);
    out.push(e.tagName === 'LI' ? '• ' + t : t);
  });
  return { body: out, heads };
}
async function guardianArticle(gid) {
  let cached = await BIG.get('g:' + gid);
  if (!cached) {
    const res = await gFetch('/' + gid + '?show-fields=body,byline,standfirst,headline,wordcount');
    const c = res.content; const f = c.fields || {};
    cached = { title: f.headline || c.webTitle, sub: stripTags(f.standfirst || ''), byline: f.byline || '', date: new Date(c.webPublicationDate).toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' }), url: c.webUrl, section: c.sectionName, html: f.body || '' };
    BIG.set('g:' + gid, cached);
  }
  const { body, heads } = htmlToParas(cached.html);
  if (!body.length) throw new Error('Este artículo no tiene texto (puede ser un vídeo, una galería o un directo).');
  return { id: 'g:' + gid, src: 'guardian', srcName: 'The Guardian', kind: /commentisfree/.test(gid) ? 'Opinión' : cached.section, topic: /law/.test(gid) ? 'law' : '', title: cached.title, sub: cached.sub, byline: cached.byline, date: cached.date, url: cached.url, body, heads, credit: 'Artículo de <a href="' + esc(cached.url) + '" target="_blank" rel="noopener">The Guardian</a>. Uso personal.' };
}

/* ==========================================================
   WIKIPEDIA (inglés)
   ========================================================== */
const WIKI = 'https://en.wikipedia.org';
const WIKI_THEMES = {
  'Derecho': ['Rule of law', 'Common law', 'Magna Carta', 'Supreme Court of the United Kingdom', 'Contract', 'Tort', 'Judicial review', 'European Court of Human Rights', 'Arbitration', 'Law firm', 'Barrister', 'Solicitor', 'Mergers and acquisitions', 'Competition law', 'Trust law', 'Habeas corpus', 'Jury', 'Precedent', 'Equity (law)', 'Inns of Court'],
  'Historia': ['British Empire', 'Industrial Revolution', 'World War I', 'World War II', 'Cold War', 'Spanish Civil War', 'Roman Empire', 'French Revolution', 'Fall of the Berlin Wall', 'The Blitz', 'Winston Churchill', 'Elizabeth I', 'Victorian era', 'Moon landing', 'Black Death'],
  'Ciencia y tecnología': ['Artificial intelligence', 'Internet', 'Climate change', 'Black hole', 'DNA', 'Vaccine', 'Theory of relativity', 'Smartphone', 'Quantum computing', 'Antibiotic', 'Photosynthesis', 'Large language model', 'Electric car', 'Plate tectonics', 'Sleep'],
  'Deporte': ['Association football', 'Premier League', 'Wimbledon Championships', 'Real Madrid CF', 'FC Barcelona', 'Valencia CF', 'Rafael Nadal', 'Olympic Games', 'Rugby union', 'Cricket', 'Formula One', 'Tour de France', 'Marathon', 'Ballon d\'Or', 'UEFA Champions League'],
  'Cultura': ['The Beatles', 'William Shakespeare', 'James Bond', 'Harry Potter', 'BBC', 'Hollywood', 'Pablo Picasso', 'The Godfather', 'Netflix', 'Jazz', 'Sherlock Holmes', 'Queen (band)', 'Star Wars', 'Fawlty Towers', 'Monty Python'],
  'Economía y empresa': ['Inflation', 'Stock market', 'Bank of England', 'European Central Bank', '2008 financial crisis', 'Globalization', 'Startup company', 'Venture capital', 'Cryptocurrency', 'Supply and demand', 'Brexit', 'Amazon (company)', 'Apple Inc.', 'Recession', 'Tax haven'],
  'Ciudades y países': ['London', 'New York City', 'Valencia', 'Madrid', 'Edinburgh', 'Dublin', 'Oxford', 'Cambridge', 'Brussels', 'Singapore', 'Australia', 'Canada', 'Scotland', 'Ireland', 'Gibraltar']
};
async function wikiJSON(url) { let r; try { r = await fetch(url); } catch (e) { throw new Error('Sin conexión con Wikipedia.'); } if (!r.ok) throw new Error('Wikipedia no responde (error ' + r.status + ').'); return r.json(); }
async function renderWiki(arg) {
  const [mode, q] = (arg || '').split('/');
  $('#view').innerHTML = `<div class="h1">Wikipedia</div><p class="sub">Millones de artículos en inglés. Ideal para leer sobre lo que te interese de verdad.</p>
    <div class="search">${IC.search}<input class="input" id="wq" type="search" placeholder="Busca un tema (en inglés o español)…" value="${esc(mode === 'search' ? decodeURIComponent(q || '') : '')}"></div>
    <div class="row wrap" style="margin:10px 0"><button class="btn grow" id="wRand">${ico('shuffle', 16)} Artículo al azar</button><a class="btn grow" href="#wiki">Destacados de hoy</a></div>
    <div id="wBody"><div class="spinner"></div></div>`;
  $('#wq').addEventListener('keydown', e => { if (e.key === 'Enter' && e.target.value.trim()) go('#wiki/search/' + encodeURIComponent(e.target.value.trim())); });
  $('#wRand').onclick = async () => { try { const j = await wikiJSON(WIKI + '/api/rest_v1/page/random/summary'); go('#r/w:' + encodeURIComponent(j.title)); } catch (e) { toast(e.message); } };
  const box = $('#wBody');
  const row = (title, desc) => `<a class="story" href="#r/w:${encodeURIComponent(title)}"><h3>${esc(title)}</h3>${desc ? `<p class="trail">${esc(desc)}</p>` : ''}${READS['w:' + title] && READS['w:' + title].done ? '<div class="meta"><span class="read-badge">✓ Leído</span></div>' : ''}</a>`;
  try {
    if (mode === 'search' && q) {
      const j = await wikiJSON(WIKI + '/w/api.php?action=query&list=search&srsearch=' + q + '&format=json&origin=*&srlimit=25');
      box.innerHTML = `<div class="card list-card">${j.query.search.map(s => row(s.title, stripTags(s.snippet))).join('') || '<div class="empty">Sin resultados.</div>'}</div>`;
      return;
    }
    const d = new Date(); const path = d.getFullYear() + '/' + String(d.getMonth() + 1).padStart(2, '0') + '/' + String(d.getDate()).padStart(2, '0');
    let feat = null; try { feat = await wikiJSON(WIKI + '/api/rest_v1/feed/featured/' + path); } catch (e) {}
    box.innerHTML = `${feat && feat.tfa ? `<div class="h2">Artículo destacado de hoy</div><div class="card list-card">${row(feat.tfa.titles.normalized, feat.tfa.extract)}</div>` : ''}
      ${feat && feat.mostread ? `<div class="h2">Lo más leído ayer</div><div class="card list-card">${feat.mostread.articles.filter(a => !/^(Main_Page|Special:)/.test(a.title)).slice(0, 8).map(a => row(a.titles.normalized, a.description)).join('')}</div>` : ''}
      ${Object.entries(WIKI_THEMES).map(([k, l]) => `<div class="h2">${esc(k)}</div><div class="chips wrapchips">${l.map(x => `<a class="chip" href="#r/w:${encodeURIComponent(x)}">${esc(x)}</a>`).join('')}</div>`).join('')}
      <p class="meta" style="margin-top:14px">Textos de Wikipedia, licencia CC BY-SA 4.0.</p>`;
  } catch (e) { box.innerHTML = `<div class="card pad empty">${esc(e.message)}</div>`; }
}
async function wikiArticle(title) {
  title = decodeURIComponent(title);
  let c = await BIG.get('w:' + title);
  if (!c) {
    const j = await wikiJSON(WIKI + '/w/api.php?action=query&prop=extracts|description&explaintext=1&exsectionformat=wiki&redirects=1&format=json&origin=*&titles=' + encodeURIComponent(title));
    const pg = Object.values(j.query.pages)[0];
    if (!pg || pg.missing != null || !pg.extract) throw new Error('No encuentro ese artículo en Wikipedia.');
    c = { title: pg.title, sub: pg.description || '', text: pg.extract };
    BIG.set('w:' + title, c);
  }
  const lines = c.text.split('\n').map(x => x.trim()).filter(Boolean);
  const body = []; const heads = new Set(); let skip = false; let words = 0;
  for (const l of lines) {
    const h = l.match(/^(=+)\s*(.*?)\s*=+$/);
    if (h) { skip = /^(See also|References|External links|Notes|Further reading|Bibliography|Sources|Citations|Footnotes|Works cited|Explanatory notes|Gallery)$/i.test(h[2]); if (!skip && h[1].length <= 3) { heads.add(body.length); body.push(h[2]); } continue; }
    if (skip) continue;
    body.push(l); words += l.split(/\s+/).length;
    if (words > 9000) { body.push('(El artículo continúa en Wikipedia.)'); break; }
  }
  const url = WIKI + '/wiki/' + encodeURIComponent(c.title.replace(/ /g, '_'));
  return { id: 'w:' + title, src: 'wiki', srcName: 'Wikipedia', kind: 'Enciclopedia', topic: '', title: c.title, sub: c.sub, url, body, heads, credit: 'Texto de <a href="' + esc(url) + '" target="_blank" rel="noopener">Wikipedia</a> (CC BY-SA 4.0).' };
}

/* ==========================================================
   NOVELAS CLÁSICAS COMPLETAS
   ========================================================== */
const BOOK_CACHE = {};
async function getBook(bid) {
  if (BOOK_CACHE[bid]) return BOOK_CACHE[bid];
  let b = await BIG.get('b:' + bid);
  if (!b) {
    let r; try { r = await fetch('content/books/' + bid + '.json'); } catch (e) { throw new Error('Necesitas conexión la primera vez que abres este libro.'); }
    if (!r.ok) throw new Error('No se ha podido cargar el libro.');
    b = await r.json(); BIG.set('b:' + bid, b);
  }
  return (BOOK_CACHE[bid] = b);
}
function renderBooks(bid) {
  const B = window.BOOKS || [];
  if (bid) return renderBook(bid);
  $('#view').innerHTML = `<div class="h1">Novelas</div><p class="sub">Clásicos completos en su versión original, por capítulos. Literatura de verdad, sin adaptar.</p>
    <div class="card list-card">${B.map(b => { const done = Object.keys(READS).filter(k => k.startsWith('b:' + b.id + ':') && READS[k].done).length; return `<a class="story" href="#books/${b.id}"><div class="meta"><span class="tag">${esc(b.genre || 'Novela')}</span><span>${esc(b.author)} · ${b.year}</span><span>${b.chapters} capítulos</span>${done ? `<span class="read-badge">${done}/${b.chapters}</span>` : ''}</div><h3>${esc(b.title)}</h3><p class="trail">${esc(b.desc)}</p></a>`; }).join('')}</div>
    <p class="meta" style="margin-top:12px">Textos de dominio público procedentes del Proyecto Gutenberg.</p>`;
}
async function renderBook(bid) {
  const meta = (window.BOOKS || []).find(b => b.id === bid); if (!meta) return renderBooks();
  $('#view').innerHTML = '<div class="spinner"></div>';
  try {
    const b = await getBook(bid);
    $('#view').innerHTML = `<div class="eyebrow">${esc(meta.author)} · ${meta.year}</div><div class="h1">${esc(meta.title)}</div><p class="sub">${esc(meta.desc)}</p>
      <div class="card list-card">${b.chapters.map((c, i) => { const r = READS['b:' + bid + ':' + i]; return `<a class="story" href="#r/b:${bid}:${i}"><div class="meta"><span>${i + 1}</span><span>${Math.max(1, Math.round(c.w / 160))} min</span>${r && r.done ? '<span class="read-badge">✓ Leído</span>' : r && r.pct ? `<span class="read-badge">${r.pct}%</span>` : ''}</div><h3>${esc(c.title)}</h3></a>`; }).join('')}</div>`;
  } catch (e) { $('#view').innerHTML = `<div class="card pad empty">${esc(e.message)}</div>`; }
}
async function bookChapter(key) {
  const [bid, n] = key.split(':'); const i = +n || 0;
  const meta = (window.BOOKS || []).find(b => b.id === bid); const b = await getBook(bid);
  const c = b.chapters[i]; if (!c) throw new Error('Capítulo no encontrado.');
  return { id: 'b:' + bid + ':' + i, src: 'book', srcName: meta ? meta.author : '', kind: 'Novela', topic: 'culture', title: c.title, sub: meta ? meta.title : '', body: c.body,
    next: b.chapters[i + 1] ? { href: '#r/b:' + bid + ':' + (i + 1), label: 'Siguiente capítulo' } : null, credit: 'Dominio público · Proyecto Gutenberg.' };
}

/* ==========================================================
   MIS TEXTOS (pegados)
   ========================================================== */
function renderTexts() {
  const T = window.TEXTS;
  $('#view').innerHTML = `<div class="h1">Mis textos</div><p class="sub">Pega cualquier texto en inglés (un artículo, un email, unos apuntes…) y léelo con audio, colores y traducción.</p>
    <button class="btn primary block" id="txNew">${ico('plus')} Nuevo texto</button>
    <div class="h2">Guardados</div>
    ${T.length ? `<div class="card list-card">${T.map(t => textCard(allTexts().find(x => x.id === 'm:' + t.id))).join('')}</div>` : '<div class="empty">Aún no has añadido ningún texto.</div>'}`;
  $('#txNew').onclick = () => openTextEditor(null);
}
function openTextEditor(tx) {
  const isNew = !tx;
  openSheet(`<div class="h2" style="margin-top:0">${isNew ? 'Nuevo texto' : 'Editar texto'}</div>
    <label class="lbl">Título</label><input class="input" id="teT" value="${esc(tx ? tx.title : '')}" placeholder="Por ejemplo, Artículo sobre arbitraje">
    <label class="lbl">De dónde viene (opcional)</label><input class="input" id="teS" value="${esc(tx ? tx.src || '' : '')}" placeholder="Un periódico, un email, un libro…">
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
      saveTexts(); closeSheet(); setTimeout(() => go('#r/m:' + tx.id), 250);
    };
  });
}

addRoute('read', renderRead, 'read', 'Leer');
addRoute('orig', renderOrigList, 'read', 'Textos Fluent');
addRoute('r', renderReader, 'read', 'Lectura');
addRoute('guardian', renderGuardian, 'read', 'The Guardian');
addRoute('wiki', renderWiki, 'read', 'Wikipedia');
addRoute('books', renderBooks, 'read', 'Novelas');
addRoute('texts', renderTexts, 'read', 'Mis textos');
addRoute('history', renderHistory, 'read', 'Leídos');

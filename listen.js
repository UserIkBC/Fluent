'use strict';
/* ==========================================================
   ESCUCHAR · textos en modo escucha, diálogos, podcasts reales,
   audiolibros, vídeos, inglés rápido, manos libres y dictado
   ========================================================== */
let VIDEOS = store.get('videos', []);
let PODS = store.get('pods', []);
const saveVideos = () => store.set('videos', VIDEOS);
const savePods = () => store.set('pods', PODS);
let READER_START_MODE = null;

function renderListen() {
  const t = today();
  $('#view').innerHTML = `
    <div class="h1">Escuchar</div>
    <p class="sub">Hoy llevas ${fmtMin(t.lsec)} escuchando. Lo que más entrena el oído es escuchar mucho y sin texto, y comprobar después.</p>
    <a class="card pad cta" href="#listentext"><div class="ico bigico">${IC.ear}</div><div class="grow"><b>Escucha un texto en 3 pasadas</b><div class="muted" style="font-size:14px">Primero sin texto, luego leyendo y otra vez sin texto. El método más eficaz.</div></div><span class="btn primary small">Empezar</span></a>
    <div class="modes">
      ${hubTile('#podcasts', 'podcast', 'Podcasts', 'Nativos hablando de verdad: actualidad, política, economía, fútbol…')}
      ${hubTile('#audiobooks', 'book', 'Audiolibros', 'Novelas clásicas leídas por nativos, con el texto al lado')}
      ${hubTile('#dlg', 'chat', 'Diálogos', (window.DIALOGUES || []).length + ' conversaciones naturales a dos voces')}
      ${hubTile('#videos', 'video', 'Vídeos de YouTube', 'Pega un vídeo y míralo con apuntes')}
      ${hubTile('#ex/dict', 'pen', 'Dictado', 'Escucha frases reales y escríbelas')}
      ${hubTile('#fast', 'ear', 'Inglés rápido', 'Cómo suenan de verdad: gonna, whaddaya…')}
      ${hubTile('#handsfree', 'ear', 'Manos libres', 'Repasa tus palabras en audio sin mirar')}
      ${hubTile('#ex/ear', 'cards', 'Tarjetas de oído', 'Reconoce tus palabras solo oyéndolas')}
      ${hubTile('#ex/pair', 'ear', 'Sonidos parecidos', 'ship / sheep, full / fool…')}
    </div>
    <p class="meta" style="margin-top:14px">Truco: en cualquier texto de Leer tienes el modo «Frase a frase» y el modo «Sin texto».</p>`;
}
/* elige un texto y lo abre en modo escucha */
function renderListenText() {
  const list = allTexts().filter(t => t.src === 'orig');
  const unread = list.filter(t => !(READS[t.id] && READS[t.id].done) && wordCount(t.body) < 1400);
  const picks = recommend(unread.length ? unread : list, 6);
  $('#view').innerHTML = `<div class="h1">Escucha en 3 pasadas</div>
    <div class="card pad"><ol class="steps" style="margin:0"><li><b>Sin texto.</b> Escucha y quédate con lo que puedas.</li><li><b>Leyendo.</b> Vuelve a escucharlo con el texto y toca las palabras que no conozcas.</li><li><b>Sin texto otra vez.</b> Notarás que ahora lo entiendes casi todo.</li></ol></div>
    <div class="h2">Elige un texto</div><div class="card list-card">${picks.map(t => textCard(t).replace('href="#r/', 'data-lt="1" href="#r/')).join('')}</div>
    <p class="meta" style="margin-top:10px">También puedes abrir cualquier texto de Leer (incluido The Guardian) y pulsar «Sin texto».</p>`;
  $('#view').onclick = e => { const a = e.target.closest('[data-lt]'); if (a) READER_START_MODE = 'hide'; };
}

/* ---------- reproductor de audio real (podcasts, audiolibros) ---------- */
let APLAYER = null;
let AUD_T = 0;
function trackAudio() { if (AUD_T) { const s = (Date.now() - AUD_T) / 1000; AUD_T = 0; if (s > 1 && s < 7200) { const t = today(); t.lsec = (t.lsec || 0) + s; saveStats(); } } }
STOPPERS.push(() => { if (APLAYER) { try { APLAYER.pause(); } catch (e) {} trackAudio(); APLAYER = null; } });
function audioPlayerHTML(src, title) {
  return `<div class="card pad aplayer"><b style="display:block;margin-bottom:8px">${esc(title || '')}</b><audio id="aud" preload="metadata" src="${esc(src)}" controls style="width:100%"></audio>
    <div class="row" style="gap:6px;margin-top:8px;flex-wrap:wrap"><button class="btn small" data-sk="-15">−15 s</button><button class="btn small" data-sk="30">+30 s</button><span class="grow"></span>${[0.8, 0.9, 1, 1.1, 1.25].map(r => `<button class="btn small ${r === (S.audRate || 1) ? 'primary' : ''}" data-ar="${r}">${r}×</button>`).join('')}</div></div>`;
}
function bindAudio(onEnd) {
  const a = $('#aud'); if (!a) return; APLAYER = a; a.playbackRate = S.audRate || 1;
  a.onplay = () => { AUD_T = Date.now(); }; a.onpause = trackAudio; a.onended = () => { trackAudio(); if (onEnd) onEnd(); };
  a.onerror = () => toast('No se ha podido cargar el audio');
  $$('[data-sk]').forEach(b => b.onclick = () => { a.currentTime = Math.max(0, a.currentTime + +b.dataset.sk); });
  $$('[data-ar]').forEach(b => b.onclick = () => { S.audRate = +b.dataset.ar; saveSettings(); a.playbackRate = S.audRate; $$('[data-ar]').forEach(x => x.classList.toggle('primary', x === b)); });
}

/* ---------- podcasts ---------- */
const G_PODS = [['news/series/todayinfocus', 'Today in Focus', 'La gran historia del día, contada a fondo (The Guardian)'], ['news/series/the-audio-long-read', 'The Audio Long Read', 'Los reportajes largos del Guardian, leídos en voz alta'], ['politics/series/politicsweekly', 'Politics Weekly', 'Política británica explicada'], ['football/series/footballweekly', 'Football Weekly', 'Fútbol con mucho humor británico'], ['science/series/science', 'Science Weekly', 'Ciencia de actualidad'], ['books/series/books', 'Books', 'Libros y autores']];
const SUGGESTED_FEEDS = [
  ['https://podcasts.files.bbci.co.uk/p02nq0gn.rss', 'Global News Podcast (BBC)', 'Las noticias del mundo, dos veces al día'],
  ['https://podcasts.files.bbci.co.uk/p05299nl.rss', 'Newscast (BBC)', 'Actualidad británica comentada, con mucho inglés coloquial'],
  ['https://podcasts.files.bbci.co.uk/p02nrtvg.rss', 'Best of Today (BBC Radio 4)', 'Las mejores entrevistas del programa de radio más influyente del Reino Unido'],
  ['https://podcasts.files.bbci.co.uk/b006tgy1.rss', 'The Law Show (BBC Radio 4)', 'Derecho explicado con casos reales'],
  ['https://podcasts.files.bbci.co.uk/b006sz6t.rss', 'The Bottom Line (BBC)', 'Directivos y empresas por dentro'],
  ['https://podcasts.files.bbci.co.uk/p02tb8vq.rss', 'World Business Report (BBC)', 'Economía y negocios internacionales'],
  ['https://podcasts.files.bbci.co.uk/b006qshd.rss', 'More or Less (BBC)', 'Los números detrás de las noticias'],
  ['https://podcasts.files.bbci.co.uk/b006qykl.rss', 'In Our Time (BBC Radio 4)', 'Historia, ciencia y filosofía con expertos'],
  ['https://podcasts.files.bbci.co.uk/p004t1hd.rss', 'Witness History (BBC)', 'La historia contada por quienes la vivieron'],
  ['https://podcasts.files.bbci.co.uk/b006qnmr.rss', 'Desert Island Discs (BBC)', 'Grandes entrevistas a personajes famosos'],
  ['https://podcasts.files.bbci.co.uk/p02pc9pj.rss', 'Friday Night Comedy (BBC Radio 4)', 'Humor británico de actualidad'],
  ['https://podcasts.files.bbci.co.uk/p02nrsln.rss', 'Football Daily (BBC)', 'Fútbol cada día'],
  ['https://podcasts.files.bbci.co.uk/p02nrsjn.rss', 'F1: Chequered Flag (BBC)', 'Fórmula 1'],
  ['https://feeds.megaphone.fm/GLT5336643697', 'The Rest Is Politics', 'Alastair Campbell y Rory Stewart hablando de política'],
  ['https://feeds.megaphone.fm/GLT4787413333', 'The Rest Is History', 'Historia contada con mucha gracia'],
  ['https://feeds.simplecast.com/54nAGcIl', 'The Daily (New York Times)', 'Una noticia a fondo cada día (inglés americano)']
];
async function fetchFeed(url) {
  const tries = [url, 'https://api.allorigins.win/raw?url=' + encodeURIComponent(url), 'https://corsproxy.io/?url=' + encodeURIComponent(url)];
  for (const u of tries) { try { const r = await fetch(u); if (r.ok) { const t = await r.text(); if (/<rss|<feed/i.test(t)) return t; } } catch (e) {} }
  throw new Error('No he podido abrir ese podcast. Comprueba el enlace RSS o inténtalo más tarde.');
}
function parseFeed(xml) {
  const d = new DOMParser().parseFromString(xml, 'text/xml');
  const ch = d.querySelector('channel'); const title = ch ? (ch.querySelector('title') || {}).textContent : 'Podcast';
  const items = $$('item', d).slice(0, 60).map(it => ({ t: (it.querySelector('title') || {}).textContent || '', u: (it.querySelector('enclosure') || { getAttribute: () => '' }).getAttribute('url'), d: (it.querySelector('pubDate') || {}).textContent || '', s: stripTags((it.querySelector('description') || {}).textContent || '').slice(0, 220) })).filter(x => x.u);
  return { title, items };
}
async function renderPodcasts(arg) {
  const [kind, ...rest] = (arg || '').split('/'); const key = decodeURIComponent(rest.join('/'));
  if (kind === 'g') return renderGPod(key);
  if (kind === 'f') return renderFeed(key);
  $('#view').innerHTML = `<div class="h1">Podcasts</div><p class="sub">Audio real de nativos. No tienen transcripción, así que es el mejor entrenamiento para entender sin leer.</p>
    <div class="h2">Del Guardian (británicos)</div>
    ${S.guardianKey ? `<div class="card">${G_PODS.map(p => `<a class="note" href="#podcasts/g/${encodeURIComponent(p[0])}" style="text-decoration:none;color:inherit"><div class="grow"><span class="term">${esc(p[1])}</span><div class="es" style="display:block">${esc(p[2])}</div></div><span class="muted">›</span></a>`).join('')}</div>` : `<div class="card pad muted">Para los podcasts del Guardian necesitas tu clave gratuita. <a href="#guardian">Configúrala aquí</a>.</div>`}
    <div class="h2">Otros podcasts</div>
    <div class="card">${SUGGESTED_FEEDS.concat(PODS.map(p => [p.url, p.title, 'Añadido por ti'])).map(p => `<div class="note"><a class="grow" href="#podcasts/f/${encodeURIComponent(p[0])}" style="text-decoration:none;color:inherit"><span class="term">${esc(p[1])}</span><div class="es" style="display:block">${esc(p[2])}</div></a>${PODS.some(x => x.url === p[0]) ? `<button class="mini" data-delpod="${esc(p[0])}">${IC.trash}</button>` : ''}</div>`).join('')}</div>
    <div class="card set-group" style="margin-top:12px"><label class="lbl">Añade cualquier podcast (enlace RSS)</label><div class="row"><input class="input grow" id="podUrl" placeholder="https://…/feed.xml" autocapitalize="off"><button class="btn primary" id="podAdd">Añadir</button></div><p class="meta" style="margin-top:6px">El enlace RSS suele estar en la web del podcast o en buscadores como podnews.net.</p></div>`;
  $('#podAdd').onclick = async () => {
    const u = $('#podUrl').value.trim(); if (!/^https?:\/\//.test(u)) { toast('Pega un enlace que empiece por https://'); return; }
    $('#podAdd').disabled = true;
    try { const f = parseFeed(await fetchFeed(u)); PODS.unshift({ id: uid(), url: u, title: f.title, upd: Date.now() }); savePods(); go('#podcasts/f/' + encodeURIComponent(u)); }
    catch (e) { toast(e.message); $('#podAdd').disabled = false; }
  };
  $('#view').onclick = e => { const d = e.target.closest('[data-delpod]'); if (d && confirm('¿Quitar este podcast?')) { const p = PODS.find(x => x.url === d.dataset.delpod); PODS = PODS.filter(x => x !== p); if (p) { TOMBS[p.id] = Date.now(); saveTombs(); } savePods(); renderPodcasts(); } };
}
function episodeList(items, title) {
  $('#view').innerHTML = `<div class="h1">${esc(title)}</div><div id="epPlayer"></div>
    <div class="card list-card">${items.map((x, i) => `<a class="story" data-ep="${i}" href="javascript:void 0"><div class="meta"><span>${x.d ? esc(new Date(x.d).toLocaleDateString('es-ES', { day: 'numeric', month: 'short', year: 'numeric' })) : ''}</span>${READS['ep:' + x.u] ? '<span class="read-badge">✓ Escuchado</span>' : ''}</div><h3>${esc(x.t)}</h3>${x.s ? `<p class="trail">${esc(x.s)}</p>` : ''}</a>`).join('')}</div>`;
  $('#view').onclick = e => {
    const a = e.target.closest('[data-ep]'); if (!a) return; e.preventDefault();
    const x = items[+a.dataset.ep];
    $('#epPlayer').innerHTML = audioPlayerHTML(x.u, x.t); bindAudio(() => { READS['ep:' + x.u] = { title: x.t, kind: 'Podcast', done: true, pct: 100, upd: Date.now() }; saveReads(); });
    window.scrollTo({ top: 0, behavior: 'smooth' }); setTimeout(() => { try { $('#aud').play(); } catch (err) {} }, 100);
  };
}
async function renderFeed(url) {
  $('#view').innerHTML = '<div class="spinner"></div>';
  try { const f = parseFeed(await fetchFeed(url)); if (!location.hash.startsWith('#podcasts/f/')) return; episodeList(f.items, f.title); }
  catch (e) { $('#view').innerHTML = `<div class="card pad empty">${esc(e.message)}</div><a class="btn block" href="#podcasts">Volver</a>`; }
}
async function renderGPod(tag) {
  $('#view').innerHTML = '<div class="spinner"></div>';
  try {
    const res = await gFetch('/search?tag=' + tag + '&type=audio&show-elements=audio&show-fields=trailText&page-size=30&order-by=newest');
    const items = res.results.map(x => { let u = ''; (x.elements || []).forEach(el => (el.assets || []).forEach(a => { if (!u && a.file && /\.mp3/i.test(a.file)) u = a.file; })); return { t: x.webTitle, u, d: x.webPublicationDate, s: stripTags((x.fields || {}).trailText || '') }; }).filter(x => x.u);
    if (!items.length) throw new Error('Este podcast no tiene episodios disponibles ahora mismo.');
    episodeList(items, (G_PODS.find(p => p[0] === tag) || [0, 'Podcast'])[1]);
  } catch (e) { $('#view').innerHTML = `<div class="card pad empty">${esc(e.message)}</div><a class="btn block" href="#podcasts">Volver</a>`; }
}

/* ---------- audiolibros (LibriVox, dominio público) ---------- */
async function renderAudiobooks(bid) {
  const B = window.BOOKS || [];
  if (!bid) {
    $('#view').innerHTML = `<div class="h1">Audiolibros</div><p class="sub">Las novelas de la app leídas por voluntarios nativos de LibriVox. Escucha un capítulo y luego léelo, o al revés.</p>
      <div class="card list-card">${B.map(b => `<a class="story" href="#audiobooks/${b.id}"><div class="meta"><span>${esc(b.author)}</span></div><h3>${esc(b.title)}</h3></a>`).join('')}</div>`;
    return;
  }
  const meta = B.find(b => b.id === bid); if (!meta) return renderAudiobooks();
  $('#view').innerHTML = `<div class="eyebrow">${esc(meta.author)}</div><div class="h1">${esc(meta.title)}</div><div id="abBody"><div class="spinner"></div></div>`;
  try {
    let rec = await BIG.get('lv:' + bid);
    if (!rec) {
      const q = 'collection:librivoxaudio AND title:(' + (meta.lv || meta.title).replace(/[()":]/g, ' ') + ')';
      const s = await (await fetch('https://cors.archive.org/advancedsearch.php?q=' + encodeURIComponent(q) + '&fl[]=identifier&fl[]=title&rows=5&output=json')).json();
      const doc = (s.response.docs || [])[0]; if (!doc) throw new Error('No hay audiolibro disponible de este título.');
      const m = await (await fetch('https://cors.archive.org/metadata/' + doc.identifier)).json();
      const files = (m.files || []).filter(f => /64kb\.mp3$/i.test(f.name) || (/\.mp3$/i.test(f.name) && !/128kb|_vbr/i.test(f.name))).sort((a, b) => a.name.localeCompare(b.name, 'en', { numeric: true }));
      rec = { id: doc.identifier, files: files.map(f => ({ n: f.name, t: f.title || f.name.replace(/_64kb\.mp3$/i, '').replace(/_/g, ' '), len: f.length })) };
      if (!rec.files.length) throw new Error('No he encontrado los archivos de audio.');
      BIG.set('lv:' + bid, rec);
    }
    if (!location.hash.startsWith('#audiobooks/')) return;
    $('#abBody').innerHTML = `<div id="abPlayer"></div><div class="card list-card">${rec.files.map((f, i) => `<a class="story" data-ab="${i}" href="javascript:void 0"><div class="meta"><span>${i + 1}</span>${f.len ? `<span>${Math.round(parseFloat(f.len) / 60) || ''} min</span>` : ''}</div><h3>${esc(f.t)}</h3></a>`).join('')}</div>
      <a class="btn block" href="#books/${bid}" style="margin-top:10px">Leer el libro</a><p class="meta" style="margin-top:8px">Grabación de LibriVox (dominio público) alojada en archive.org.</p>`;
    $('#abBody').onclick = e => { const a = e.target.closest('[data-ab]'); if (!a) return; e.preventDefault(); const f = rec.files[+a.dataset.ab]; $('#abPlayer').innerHTML = audioPlayerHTML('https://archive.org/download/' + rec.id + '/' + encodeURIComponent(f.n), f.t); bindAudio(); window.scrollTo({ top: 0, behavior: 'smooth' }); setTimeout(() => { try { $('#aud').play(); } catch (err) {} }, 100); };
  } catch (e) { $('#abBody').innerHTML = `<div class="card pad empty">${esc(e.message || 'No se ha podido cargar el audiolibro.')}</div>`; }
}

/* ---------- diálogos ---------- */
let DPLAY = null;
function stopDialogPlay() { if (DPLAY) { DPLAY.stop = true; DPLAY = null; } }
STOPPERS.push(stopDialogPlay);
function renderDialogues(id) {
  const D = window.DIALOGUES || [];
  if (!id) {
    const done = new Set(HISTORY.map(h => h.id));
    $('#view').innerHTML = `<div class="h1">Diálogos</div><p class="sub">Conversaciones como las de la vida real: muletillas, contracciones e interrupciones. Empieza sin texto.</p>
      <div class="card list-card">${D.map(d => `<a class="story" href="#dlg/${d.id}"><div class="meta"><span>${d.lines.length} intervenciones</span>${done.has(d.id) ? '<span class="read-badge">✓ Hecho</span>' : ''}</div><h3>${esc(d.title)}</h3><p class="trail">${esc(d.es)}</p></a>`).join('')}</div>`;
    return;
  }
  const d = D.find(x => x.id === id); if (!d) return renderDialogues();
  const names = Object.keys(d.speakers);
  const pair = TTS.pair();
  const voiceOf = n => (d.speakers[n] === 'f' ? pair.f : pair.m);
  const pitchOf = n => (pair.m === pair.f ? (d.speakers[n] === 'f' ? 1.15 : 0.88) : 1);
  let mode = 'hidden', rate = S.rate;
  const gapLine = txt => { let i = 0; return esc(txt).replace(/\b([A-Za-z']{5,})\b/g, w => (i++ % 3 === 1 ? `<span class="gapw" data-w="${w}">____</span>` : w)); };
  const paint = () => {
    $('#dlgLines').innerHTML = d.lines.map((l, k) => `<div class="dl ${names.indexOf(l[0]) === 1 ? 'me' : ''} ${mode === 'hidden' ? 'hide' : ''}" data-k="${k}"><span class="who">${esc(l[0])}</span><span class="line">${mode === 'gaps' ? gapLine(l[1]) : esc(l[1])}</span></div>`).join('');
    $$('.dmode button').forEach(b => b.classList.toggle('on', b.dataset.m === mode));
  };
  $('#view').innerHTML = `<div class="eyebrow">Diálogo</div><div class="h1">${esc(d.title)}</div><p class="sub">${esc(d.es)}</p>
    <div class="seg dmode"><button data-m="hidden">Sin texto</button><button data-m="gaps">Con huecos</button><button data-m="full">Texto completo</button></div>
    <div class="player"><button class="iconbtn main" id="dPlay">${IC.play}</button><button class="iconbtn" id="dStop">${IC.stop}</button><div class="label grow" id="dLabel">Escuchar el diálogo</div><button class="btn small" id="dRate">${rate}×</button></div>
    <div class="card pad dialogue" id="dlgLines" style="margin-top:12px"></div>
    <div class="h2">Comprensión</div>
    ${d.quiz.map((q, k) => `<div class="card pad" style="margin-bottom:10px" data-qz="${k}"><b>${k + 1}. ${esc(q[0])}</b><div class="opts" style="margin-top:10px">${q[1].map((o, j) => `<button class="opt" data-j="${j}">${esc(o)}</button>`).join('')}</div></div>`).join('')}
    <div class="h2">Expresiones del diálogo</div>
    <div class="card">${d.vocab.map((x, k) => `<div class="note"><div class="grow"><span class="term">${esc(x[0])}</span><div class="es">${esc(x[1])}</div></div><div style="display:flex;flex-direction:column;gap:6px"><button class="mini" data-say="${esc(x[0])}">${IC.speak}</button><button class="mini" data-addv="${k}">${IC.plus}</button></div></div>`).join('')}</div>
    <button class="btn block" id="dAll" style="margin-top:10px">Guardar todas en mis palabras</button>
    <div class="row wrap" style="margin-top:12px"><a class="btn grow" href="#ex/dict/${d.id}">Dictado de este diálogo</a><a class="btn grow" href="#ex/gap/${d.id}">Huecos</a></div>`;
  paint();
  const lineEls = () => $$('#dlgLines .dl');
  const saveV = x => { if (!NOTES.some(n => norm(n.term) === norm(x[0]))) NOTES.unshift({ id: uid(), term: x[0], cat: guessCat(x[0]), es: x[1], ex: (d.lines.find(l => norm(l[1]).includes(norm(x[0]))) || [])[1] || '', src: 'Diálogo · ' + d.title, created: Date.now(), upd: Date.now(), srs: newSrs() }); };
  const playFrom = k => {
    const me = DPLAY; if (!me || me.stop) return;
    const els = lineEls();
    if (k >= d.lines.length) { els.forEach(e => e.classList.remove('on')); $('#dPlay').innerHTML = IC.play; $('#dLabel').textContent = 'Fin del diálogo'; DPLAY = null; if (!HISTORY.some(h => h.id === d.id)) { HISTORY.unshift({ id: d.id, title: d.title, section: 'Diálogo', readAt: Date.now() }); store.set('history', HISTORY); } return; }
    els.forEach((e, j) => e.classList.toggle('on', j === k)); els[k].scrollIntoView({ block: 'nearest', behavior: 'smooth' });
    $('#dLabel').textContent = (k + 1) + ' / ' + d.lines.length;
    const [who, txt] = d.lines[k];
    TTS.speak(txt, { voice: voiceOf(who), pitch: pitchOf(who), rate, onend: () => setTimeout(() => playFrom(k + 1), 280) });
  };
  $('#dPlay').onclick = () => { if (DPLAY) { stopDialogPlay(); TTS.stop(); $('#dPlay').innerHTML = IC.play; return; } DPLAY = {}; $('#dPlay').innerHTML = IC.pause; playFrom(0); };
  $('#dStop').onclick = () => { stopDialogPlay(); TTS.stop(); $('#dPlay').innerHTML = IC.play; lineEls().forEach(e => e.classList.remove('on')); };
  $('#dRate').onclick = () => { const r = [0.8, 0.9, 1, 1.1, 1.25]; rate = r[(r.indexOf(rate) + 1) % r.length] || 1; $('#dRate').textContent = rate + '×'; };
  $$('.dmode button').forEach(b => b.onclick = () => { mode = b.dataset.m; paint(); });
  $('#dAll').onclick = () => { const before = NOTES.length; d.vocab.forEach(saveV); saveNotes(); toast(NOTES.length - before ? (NOTES.length - before) + ' guardadas' : 'Ya las tenías'); };
  $('#view').onclick = e => {
    const g = e.target.closest('.gapw'); if (g) { g.textContent = g.dataset.w; g.classList.add('shown'); return; }
    const s = e.target.closest('[data-say]'); if (s) { TTS.speak(s.dataset.say, { rate: 0.9 }); return; }
    const a = e.target.closest('[data-addv]'); if (a) { saveV(d.vocab[+a.dataset.addv]); saveNotes(); a.outerHTML = '<span class="tag good">✓</span>'; return; }
    const l = e.target.closest('.dl'); if (l && !DPLAY) { const [who, txt] = d.lines[+l.dataset.k]; TTS.speak(txt, { voice: voiceOf(who), pitch: pitchOf(who), rate }); return; }
    const o = e.target.closest('[data-qz] .opt'); if (o) { const c = o.closest('[data-qz]'); if (c.dataset.done) return; c.dataset.done = 1; const qz = d.quiz[+c.dataset.qz]; const ok = +o.dataset.j === qz[2]; $$('.opt', c).forEach(x => +x.dataset.j === qz[2] && x.classList.add('right')); if (!ok) o.classList.add('wrong'); bump('ex'); if (ok) bump('ok'); }
  };
}

/* ---------- inglés rápido ---------- */
function renderFast() {
  const C = window.CONNECTED || [];
  $('#view').innerHTML = `<div class="h1">Inglés rápido</div><p class="sub">Así suena el inglés cuando se habla deprisa. Si conoces estas reducciones, entenderás muchísimo más a los nativos.</p>
    <div class="notice warm">La voz del móvil no reduce las palabras como un nativo. Fíjate en cómo se escribe la versión real y búscala después en los podcasts.</div>
    <a class="btn primary block" href="#ex/fast" style="margin-bottom:12px">Test: escribe lo que oyes</a>
    <div class="card">${C.map((c, k) => `<div class="note"><div class="grow"><span class="term">${esc(c[1])}</span><div class="es">${esc(c[0])}</div><div class="muted" style="font-size:13.5px;margin-top:3px"><b>${esc(c[2])}</b> · ${esc(c[3])}</div></div><div style="display:flex;flex-direction:column;gap:6px"><button class="mini" data-fk="${k}" data-r="1">${IC.speak}</button><button class="mini" data-fk="${k}" data-r="1.35">⚡</button></div></div>`).join('')}</div>`;
  $('#view').onclick = e => { const b = e.target.closest('[data-fk]'); if (b) TTS.speak(C[+b.dataset.fk][0], { rate: +b.dataset.r }); };
}
EXTRA_TITLES.fast = 'Inglés rápido';
EXTRA_GENS.fast = () => { const C = window.CONNECTED || []; const pool = C.concat((window.DIALOGUES || []).flatMap(d => d.lines.filter(l => l[1].split(' ').length <= 14).map(l => [l[1], l[1], 'diálogo', '']))); if (!pool.length) return null; const c = pick(pool); return { type: 'fast', c, it: { s: c[0], src: 'Inglés rápido' } }; };
EXTRA_RENDER.fast = q => {
  $('#view').innerHTML = `${exHeader()}<div id="qArea"><p class="muted" style="margin:16px 0 8px">Escucha la frase a velocidad rápida y escríbela completa</p>
    <div class="row" style="justify-content:center;gap:10px;margin:14px 0"><button class="btn primary" id="fP">${ico('play')} Rápido</button><button class="btn" id="fN">Normal</button><button class="btn" id="fS">🐢 Lento</button></div>
    <textarea class="textarea" id="fIn" autocapitalize="sentences" spellcheck="false" placeholder="Escribe lo que oyes…"></textarea>
    <button class="btn primary block" id="fC" style="margin-top:10px">Comprobar</button></div>`;
  $('#fP').onclick = () => TTS.speak(q.c[0], { rate: 1.4 }); $('#fN').onclick = () => TTS.speak(q.c[0], { rate: 1 }); $('#fS').onclick = () => TTS.speak(q.c[0], { rate: 0.7 });
  setTimeout(() => TTS.speak(q.c[0], { rate: 1.4 }), 250);
  $('#fC').onclick = () => {
    if ($('.feedback')) return;
    const a = tokenize(q.c[0]).map(t => t.w), b = tokenize($('#fIn').value).map(t => t.w); if (!b.length) return;
    const { out, score } = lcsDiff(a, b); const ok = score >= 0.85;
    answered(ok, `<div class="diff ctx" style="margin-top:6px">${out.map(([k, w]) => `<span class="${k}">${esc(w)}</span>`).join(' ')}</div>${q.c[2] !== 'diálogo' ? `<div class="muted" style="font-size:14px;margin-top:6px">Así suena · <b>${esc(q.c[1])}</b> · ${esc(q.c[3])}</div>` : ''}`);
  };
};

/* ---------- manos libres ---------- */
let HF = null;
function stopHandsFree() { if (HF) { HF.stop = true; clearTimeout(HF.t); if (HF.lock) try { HF.lock.release(); } catch (e) {} HF = null; } }
STOPPERS.push(stopHandsFree);
function hfSources() { return [['due', 'Repasos pendientes', dueCards().length], ['mine', 'Mis palabras', NOTES.length], ['learning', 'Todo lo que estoy aprendiendo', LIB.filter(x => x.srs).length + NOTES.length], ['fav', 'Favoritas', setItems('fav').length]].concat(Object.keys(LIB_CATS).map(c => ['cat:' + c, LIB_CATS[c].name, LIB.filter(x => x.cat === c).length])); }
function hfItems(src) { if (src === 'due') return dueCards(); if (src === 'mine') return NOTES.slice(); if (src === 'learning') return LIB.filter(x => x.srs).concat(NOTES); if (src.startsWith('cat:')) return LIB.filter(x => x.cat === src.slice(4)); return setItems(src); }
function renderHandsFree() {
  const cfg = Object.assign({ src: dueCards().length ? 'due' : 'cat:phrasal', pause: 3, es: true, ex: true, rep: false }, store.get('hfcfg', {}));
  $('#view').innerHTML = `<div class="h1">Manos libres</div><p class="sub">Escucha la palabra, intenta pensar qué significa durante la pausa y luego oirás la respuesta. Ideal caminando o en el coche.</p>
    <div class="card set-group">
      <label class="lbl">Qué repasar</label><select class="select" id="hfSrc">${hfSources().map(([k, n, c]) => `<option value="${k}" ${k === cfg.src ? 'selected' : ''} ${c ? '' : 'disabled'}>${esc(n)} (${c})</option>`).join('')}</select>
      <label class="lbl">Pausa para pensar · <span id="hfPv">${cfg.pause}</span> s</label><input type="range" id="hfPause" min="1" max="8" step="1" value="${cfg.pause}" style="width:100%">
      <label class="switch"><span>Decir la traducción en español</span><input type="checkbox" id="hfEs" ${cfg.es ? 'checked' : ''}></label>
      <label class="switch"><span>Leer también el ejemplo</span><input type="checkbox" id="hfEx" ${cfg.ex ? 'checked' : ''}></label>
      <label class="switch"><span>Al revés: primero español, luego inglés</span><input type="checkbox" id="hfRev" ${cfg.rep ? 'checked' : ''}></label>
    </div>
    <div class="card pad hfnow" id="hfNow" style="margin-top:12px;text-align:center"><div class="muted">Pulsa Empezar</div></div>
    <div class="row" style="margin-top:12px"><button class="btn primary grow" id="hfGo">${ico('play')} Empezar</button><button class="btn grow" id="hfSkip">Siguiente</button><button class="btn grow" id="hfStop">Parar</button></div>
    <p class="meta" style="margin-top:10px">Mantén la pantalla encendida: en el iPhone el audio de las webs se para al bloquear el móvil.</p>`;
  const save = () => { cfg.src = $('#hfSrc').value; cfg.pause = +$('#hfPause').value; cfg.es = $('#hfEs').checked; cfg.ex = $('#hfEx').checked; cfg.rep = $('#hfRev').checked; store.set('hfcfg', cfg); $('#hfPv').textContent = cfg.pause; };
  ['hfSrc', 'hfPause', 'hfEs', 'hfEx', 'hfRev'].forEach(id => $('#' + id).addEventListener('input', save));
  const step = () => {
    if (!HF || HF.stop) return;
    if (HF.i >= HF.items.length) { HF.i = 0; HF.items = shuffle(HF.items); }
    const x = HF.items[HF.i]; const me = HF; const tok = HF.tok = (HF.tok || 0) + 1;
    $('#hfNow').innerHTML = `<div class="muted" style="font-size:13px">${HF.i + 1} / ${HF.items.length}</div><div class="term" style="margin:8px 0">${esc(cfg.rep ? (x.es || x.term) : x.term)}</div><div id="hfAns" class="muted" style="min-height:44px"></div>`;
    const seq = [];
    if (cfg.rep) { seq.push([x.es || x.term, true]); seq.push(['__pause']); seq.push([x.term, false]); }
    else { seq.push([x.term, false]); seq.push(['__pause']); if (cfg.es && x.es) seq.push([x.es, true]); }
    if (cfg.ex && x.ex) seq.push([x.ex, false]);
    let j = 0;
    const run = () => {
      if (me.stop || HF !== me || me.tok !== tok) return;
      if (j >= seq.length) { HF.i++; HF.t = setTimeout(step, 900); return; }
      const [txt, es] = seq[j++];
      if (txt === '__pause') { HF.t = setTimeout(() => { if (HF === me && me.tok === tok) $('#hfAns').innerHTML = `<b>${esc(cfg.rep ? x.term : (x.es || ''))}</b>${x.ex ? `<div class="ctx" style="font-style:italic;margin-top:4px">${esc(x.ex)}</div>` : ''}`; run(); }, cfg.pause * 1000); return; }
      TTS.speak(txt, { es, rate: es ? 1 : Math.min(S.rate, 1), onend: () => { if (HF === me && me.tok === tok) HF.t = setTimeout(run, 350); } });
    };
    run();
  };
  $('#hfGo').onclick = async () => {
    save(); stopHandsFree();
    const items = shuffle(hfItems(cfg.src)).filter(x => x.term); if (!items.length) { toast('No hay nada en esa selección'); return; }
    HF = { items, i: 0 };
    try { if (navigator.wakeLock) HF.lock = await navigator.wakeLock.request('screen'); } catch (e) {}
    step();
  };
  $('#hfSkip').onclick = () => { if (!HF) return; TTS.stop(); clearTimeout(HF.t); HF.i++; step(); };
  $('#hfStop').onclick = () => { stopHandsFree(); TTS.stop(); $('#hfNow').innerHTML = '<div class="muted">Parado</div>'; };
}

/* ---------- vídeos de YouTube ---------- */
let VTIMER = null;
function stopVideoTimer() { if (VTIMER) { const s = Math.round((Date.now() - VTIMER) / 1000); if (s > 5 && s < 7200) { const t = today(); t.lsec = (t.lsec || 0) + s; saveStats(); } VTIMER = null; } }
STOPPERS.push(stopVideoTimer);
function ytId(url) { const m = String(url).match(/(?:youtu\.be\/|v=|\/embed\/|\/shorts\/|\/live\/)([A-Za-z0-9_-]{11})/); return m ? m[1] : null; }
function renderVideos(id) {
  if (id) return renderVideo(id);
  $('#view').innerHTML = `<div class="h1">Vídeos de YouTube</div><p class="sub">Pega cualquier vídeo de YouTube para verlo dentro de la app con subtítulos en inglés y apuntar expresiones mientras lo ves.</p>
    <div class="card set-group"><label class="lbl">Enlace de YouTube</label><div class="row"><input class="input grow" id="ytUrl" placeholder="https://www.youtube.com/watch?v=…" autocapitalize="off"><button class="btn primary" id="ytAdd">Abrir</button></div></div>
    ${VIDEOS.length ? `<div class="h2">Mis vídeos</div><div class="card">${VIDEOS.map(v => `<a class="note" href="#videos/${v.id}" style="text-decoration:none;color:inherit"><div class="grow"><span class="term">${esc(v.title || 'Vídeo')}</span><div class="meta">${(v.notes || []).length} apuntes</div></div><span class="muted">›</span></a>`).join('')}</div>` : ''}
    ${(window.RESOURCES || []).map(g => `<div class="h2">${esc(g.group)}</div><div class="card">${g.items.map(r => `<div class="note"><div class="grow"><span class="term">${esc(r[0])}</span><div class="muted" style="font-size:14px;margin-top:3px">${esc(r[1])}</div></div>${r[2] ? `<a class="btn small" href="${esc(r[2])}" target="_blank" rel="noopener">Abrir</a>` : ''}</div>`).join('')}</div>`).join('')}`;
  $('#ytAdd').onclick = () => {
    const vid = ytId($('#ytUrl').value); if (!vid) { toast('No reconozco ese enlace de YouTube'); return; }
    let v = VIDEOS.find(x => x.vid === vid);
    if (!v) { v = { id: uid(), vid, title: '', notes: [], created: Date.now(), upd: Date.now() }; VIDEOS.unshift(v); saveVideos(); }
    go('#videos/' + v.id);
  };
}
function renderVideo(id) {
  const v = VIDEOS.find(x => x.id === id); if (!v) return go('#videos');
  $('#view').innerHTML = `<input class="input nbtitle" id="vT" value="${esc(v.title)}" placeholder="Título del vídeo">
    <div class="vwrap"><iframe src="https://www.youtube-nocookie.com/embed/${esc(v.vid)}?cc_lang_pref=en&cc_load_policy=1&hl=en&rel=0&playsinline=1" title="YouTube" allow="accelerometer; autoplay; clipboard-write; encrypted-media; picture-in-picture" allowfullscreen></iframe></div>
    <p class="meta" style="margin-top:6px">Activa los subtítulos en inglés (CC) y repite los trozos que no entiendas.</p>
    <div class="h2">Apuntes del vídeo</div>
    <div class="row"><input class="input grow" id="vN" placeholder="Expresión o frase que has oído…"><button class="btn primary" id="vAdd">${ico('plus')}</button></div>
    <div id="vNotes" style="margin-top:10px"></div>
    <div class="row" style="margin-top:16px"><button class="btn danger" id="vDel">${ico('trash')} Quitar vídeo</button></div>`;
  VTIMER = Date.now();
  const paint = () => { $('#vNotes').innerHTML = v.notes.length ? `<div class="card">${v.notes.map((n, k) => `<div class="note"><div class="grow"><span class="term" style="font-size:16px">${esc(n)}</span></div><button class="mini" data-say="${esc(n)}">${IC.speak}</button><button class="btn small" data-tomine="${k}">Guardar</button></div>`).join('')}</div>` : '<div class="muted" style="font-size:14px">Apunta lo que oigas y guárdalo después como tarjeta.</div>'; };
  paint();
  $('#vT').addEventListener('input', e => { v.title = e.target.value; v.upd = Date.now(); saveVideos(); });
  $('#vAdd').onclick = () => { const t = $('#vN').value.trim(); if (!t) return; v.notes.unshift(t); v.upd = Date.now(); saveVideos(); $('#vN').value = ''; paint(); };
  $('#vDel').onclick = () => { if (!confirm('¿Quitar este vídeo y sus apuntes?')) return; VIDEOS = VIDEOS.filter(x => x.id !== id); TOMBS[id] = Date.now(); saveVideos(); saveTombs(); go('#videos'); };
  $('#view').onclick = e => { const s = e.target.closest('[data-say]'); if (s) { TTS.speak(s.dataset.say); return; } const m = e.target.closest('[data-tomine]'); if (m) openNoteEditor({ term: v.notes[+m.dataset.tomine], src: 'Vídeo · ' + (v.title || 'YouTube') }); };
}

/* ---------- tarjetas de oído ---------- */
EXTRA_STARTS.ear = arg => {
  const v = $('#view');
  const pool = isSetKey(arg) ? setFromArg(arg) : dueCards().length ? dueCards() : LIB.filter(x => x.srs).concat(NOTES);
  if (!pool.length) { v.innerHTML = emptyBox('Aún no tienes palabras en repaso. Guarda palabras leyendo o aprende palabras nuevas.', '#new', 'Aprender palabras nuevas'); return; }
  const queue = shuffle(pool).slice(0, S.exLen || 10); let i = 0, ok = 0;
  const show = () => {
    if (i >= queue.length) { v.innerHTML = `<div class="card pad" style="text-align:center;padding:28px"><div style="font-size:42px">👂</div><b>${ok}/${queue.length} reconocidas de oído</b><p class="muted">Entender sin leer es justo lo que necesitas para las conversaciones reales.</p><button class="btn primary block" id="again">Otra ronda</button><a class="btn ghost block" href="#listen" style="margin-top:8px">Volver</a></div>`; $('#again').onclick = () => EXTRA_STARTS.ear(arg); return; }
    const x = queue[i];
    v.innerHTML = `<div class="row" style="margin-bottom:8px"><b class="grow">Tarjetas de oído</b><span class="muted">${i + 1}/${queue.length}</span></div><div class="progressbar"><i style="width:${i / queue.length * 100}%"></i></div>
      <div class="card flash" style="margin-top:14px"><div style="font-size:54px">👂</div><div class="muted">Escucha y piensa qué significa</div>
        <div class="row" style="justify-content:center;margin-top:12px;gap:8px"><button class="btn primary" id="eP">${ico('play')} Otra vez</button><button class="btn" id="eS">🐢</button>${x.ex ? '<button class="btn" id="eX">En una frase</button>' : ''}</div>
        <div id="eBack" class="back hidden"><div class="term" style="font-size:24px">${esc(x.term)}</div><div style="font-size:18px;font-weight:600;margin-top:6px">${esc(x.es || '')}</div>${x.ex ? `<div class="ctx muted" style="margin-top:6px;font-style:italic">${esc(x.ex)}</div>` : ''}</div></div>
      <button class="btn primary block" id="eR" style="margin-top:12px">Ver</button>
      <div class="row hidden" id="eG" style="margin-top:12px"><button class="btn grow" data-g="0" style="color:var(--bad)">No la he entendido</button><button class="btn grow" data-g="2" style="color:var(--good)">La he entendido</button></div>`;
    const play = () => TTS.speak(x.term, { rate: 0.95 });
    $('#eP').onclick = play; $('#eS').onclick = () => TTS.speak(x.term, { rate: 0.7 }); if ($('#eX')) $('#eX').onclick = () => TTS.speak(x.ex);
    setTimeout(play, 250);
    $('#eR').onclick = () => { $('#eBack').classList.remove('hidden'); $('#eR').classList.add('hidden'); $('#eG').classList.remove('hidden'); };
    $('#eG').onclick = e => { const b = e.target.closest('[data-g]'); if (!b) return; const g = +b.dataset.g; if (g) ok++; if (x.srs) grade(x, g); bump('ex'); if (g) bump('ok'); i++; show(); };
  };
  show();
};

addRoute('listen', renderListen, 'listen', 'Escuchar');
addRoute('listentext', renderListenText, 'listen', 'Escucha en 3 pasadas');
addRoute('podcasts', renderPodcasts, 'listen', 'Podcasts');
addRoute('audiobooks', renderAudiobooks, 'listen', 'Audiolibros');
addRoute('dlg', renderDialogues, 'listen', 'Diálogos');
addRoute('fast', renderFast, 'listen', 'Inglés rápido');
addRoute('handsfree', renderHandsFree, 'listen', 'Manos libres');
addRoute('videos', renderVideos, 'listen', 'Vídeos');

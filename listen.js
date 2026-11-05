'use strict';
/* ==========================================================
   ESCUCHAR: diálogos, inglés rápido, acentos, manos libres,
   vídeos y podcasts, tarjetas de oído
   ========================================================== */
window.EXTRA_GENS = window.EXTRA_GENS || {};
window.EXTRA_RENDER = window.EXTRA_RENDER || {};
window.EXTRA_TITLES = window.EXTRA_TITLES || {};
window.EXTRA_STARTS = window.EXTRA_STARTS || {};
let VIDEOS = store.get('videos', []);
const saveVideos = () => store.set('videos', VIDEOS);
function addListen(sec) { if (sec > 0) { const t = today(); t.lsec = (t.lsec || 0) + sec; saveStats(); } }

function hubTile(href, ic, title, desc, extra = '') { return `<a class="mode" href="${href}"><div class="ico">${IC[ic] || IC.ear}</div><b>${title}</b><span>${desc}</span>${extra}</a>`; }
function renderListen() {
  const t = today();
  $('#view').innerHTML = `
    <div class="h1">Escuchar</div>
    <p class="sub">Entrenar el oído es lo que más te acerca a entender a un nativo. Hoy llevas ${Math.round((t.lsec || 0) / 60)} min de escucha.</p>
    <a class="card pad cta" href="#handsfree"><div class="ico" style="width:44px;height:44px;border-radius:12px;display:grid;place-items:center;background:var(--accent-soft);color:var(--accent)">${IC.ear}</div><div class="grow"><b>Modo manos libres</b><div class="muted" style="font-size:14px">Repasa en audio mientras caminas o vas en coche, sin mirar la pantalla</div></div><span class="btn primary small">Empezar</span></a>
    <div class="modes">
      ${hubTile('#dlg', 'chat', 'Diálogos reales', (window.DIALOGUES || []).length + ' conversaciones naturales a dos voces')}
      ${hubTile('#fast', 'ear', 'Inglés rápido', 'Cómo suenan de verdad: gonna, whaddaya, shoulda…')}
      ${hubTile('#accents', 'globe', 'Acentos', 'Británico, americano, australiano, irlandés…')}
      ${hubTile('#videos', 'play', 'Vídeos y podcasts', 'Nativos reales y tus propios vídeos de YouTube')}
      ${hubTile('#ex/ear', 'cards', 'Tarjetas de oído', 'Reconoce tus palabras solo escuchándolas')}
      ${hubTile('#ex/dict', 'pen', 'Dictado', 'Escucha y escribe frases')}
      ${hubTile('#ex/fast', 'ear', 'Test de inglés rápido', 'Frases dichas deprisa: escribe lo que oyes')}
      ${hubTile('#ex/pair', 'ear', 'Sonidos parecidos', 'ship / sheep, cat / cut…')}
    </div>
    <div class="h2">Historias con audio</div>
    <a class="card pad sug" href="#read/st-london-1"><span class="sug-k">Historia por capítulos</span><b>A Year in London</b><span class="muted">Un trainee español en un gran despacho de Londres · 6 capítulos con audio</span></a>`;
}

/* ---------- diálogos ---------- */
let DPLAY = null;
function stopDialogPlay() { if (DPLAY) { DPLAY.stop = true; DPLAY = null; } }
function renderDialogues(id) {
  const D = window.DIALOGUES || [];
  if (!id) {
    const done = new Set(HISTORY.map(h => h.id));
    $('#view').innerHTML = `<div class="h1">Diálogos</div><p class="sub">Conversaciones como las de la vida real: muletillas, contracciones e interrupciones. Empieza sin texto y ve ayudándote solo si lo necesitas.</p>
      <div class="card list-card">${D.map(d => `<a class="story" href="#dlg/${d.id}"><div class="meta"><span class="tag">${esc(d.level)}</span><span>${d.lines.length} intervenciones</span>${done.has(d.id) ? '<span class="read-badge">✓ Hecho</span>' : ''}</div><h3>${esc(d.title)}</h3><p class="trail">${esc(d.es)}</p></a>`).join('')}</div>`;
    return;
  }
  const d = D.find(x => x.id === id); if (!d) return renderDialogues();
  const names = Object.keys(d.speakers);
  const pair = TTS.pair();
  const voiceOf = n => (d.speakers[n] === 'f' ? pair.f : pair.m);
  const pitchOf = n => (pair.m === pair.f ? (d.speakers[n] === 'f' ? 1.2 : 0.85) : 1);
  let mode = 'hidden', rate = S.rate;
  const gapLine = txt => { let i = 0; return esc(txt).replace(/\b([A-Za-z']{5,})\b/g, w => (i++ % 3 === 1 ? `<span class="gapw" data-w="${w}">____</span>` : w)); };
  const paint = () => {
    $('#dlgLines').innerHTML = d.lines.map((l, k) => `<div class="dl ${names.indexOf(l[0]) === 1 ? 'me' : ''} ${mode === 'hidden' ? 'hide' : ''}" data-k="${k}"><span class="who">${esc(l[0])}</span><span class="line">${mode === 'gaps' ? gapLine(l[1]) : esc(l[1])}</span></div>`).join('');
    $$('.dmode button').forEach(b => b.classList.toggle('on', b.dataset.m === mode));
  };
  $('#view').innerHTML = `<div class="eyebrow">Diálogo · ${esc(d.level)}</div><div class="h1">${esc(d.title)}</div><p class="sub">${esc(d.es)}</p>
    <div class="notice">Consejo · escúchalo primero sin texto, después con huecos y por último con el texto completo. Toca cualquier frase para repetirla.</div>
    <div class="seg dmode"><button data-m="hidden">Sin texto</button><button data-m="gaps">Con huecos</button><button data-m="full">Texto completo</button></div>
    <div class="player"><button class="iconbtn" id="dPlay">${IC.play}</button><button class="iconbtn" id="dStop">${IC.stop}</button><div class="label" id="dLabel">Escuchar el diálogo</div><button class="btn small" id="dRate">${rate}×</button></div>
    <div class="card pad dialogue" id="dlgLines" style="margin-top:12px"></div>
    <div class="h2">Comprensión</div>
    ${d.quiz.map((q, k) => `<div class="card pad" style="margin-bottom:10px" data-qz="${k}"><b>${k + 1}. ${esc(q[0])}</b><div class="opts" style="margin-top:10px">${q[1].map((o, j) => `<button class="opt" data-j="${j}">${esc(o)}</button>`).join('')}</div></div>`).join('')}
    <div class="h2">Expresiones del diálogo</div>
    <div class="card">${d.vocab.map((x, k) => `<div class="note"><div class="grow"><span class="term">${esc(x[0])}</span><div class="es">${esc(x[1])}</div></div><div style="display:flex;flex-direction:column;gap:6px"><button class="mini" data-say="${esc(x[0])}">${IC.speak}</button><button class="mini" data-addv="${k}">${IC.plus}</button></div></div>`).join('')}</div>
    <button class="btn block" id="dAll" style="margin-top:10px">Guardar todas en Mío</button>
    <div class="h2">Ahora tú</div>
    <div class="row wrap"><a class="btn grow" href="#ex/shadow/${d.id}">Shadowing de este diálogo</a>${names.map(n => `<button class="btn grow" data-role="${esc(n)}">Role-play: tú eres ${esc(n)}</button>`).join('')}</div>
    <div id="dHint" class="muted" style="font-size:14px;margin-top:8px"></div>`;
  paint();
  const lineEls = () => $$('#dlgLines .dl');
  const playFrom = (k, role) => {
    const me = DPLAY; if (!me || me.stop) return;
    const els = lineEls();
    if (k >= d.lines.length) { els.forEach(e => e.classList.remove('on')); $('#dPlay').innerHTML = IC.play; $('#dLabel').textContent = 'Fin del diálogo'; DPLAY = null; if (!HISTORY.some(h => h.id === d.id)) { HISTORY.unshift({ id: d.id, title: d.title, section: 'Diálogo', readAt: Date.now() }); store.set('history', HISTORY); } bump('ex'); return; }
    els.forEach((e, j) => e.classList.toggle('on', j === k)); els[k].scrollIntoView({ block: 'nearest', behavior: 'smooth' });
    $('#dLabel').textContent = (k + 1) + ' / ' + d.lines.length;
    const [who, txt] = d.lines[k];
    if (role && who === role) {
      $('#dHint').innerHTML = `Te toca. Di tu frase en voz alta. <button class="btn small" id="dShow">Ver</button> <button class="btn small primary" id="dNext">Siguiente</button>`;
      $('#dShow').onclick = () => { els[k].classList.remove('hide'); TTS.speak(txt, { voice: voiceOf(who), pitch: pitchOf(who), rate }); };
      $('#dNext').onclick = () => { $('#dHint').textContent = ''; playFrom(k + 1, role); };
      return;
    }
    TTS.speak(txt, { voice: voiceOf(who), pitch: pitchOf(who), rate, onend: () => setTimeout(() => playFrom(k + 1, role), 280) });
  };
  $('#dPlay').onclick = () => { if (DPLAY) { stopDialogPlay(); TTS.stop(); $('#dPlay').innerHTML = IC.play; return; } DPLAY = {}; $('#dPlay').innerHTML = IC.pause; playFrom(0); };
  $('#dStop').onclick = () => { stopDialogPlay(); TTS.stop(); $('#dPlay').innerHTML = IC.play; lineEls().forEach(e => e.classList.remove('on')); };
  $('#dRate').onclick = () => { const r = [0.8, 0.9, 1, 1.1, 1.25]; rate = r[(r.indexOf(rate) + 1) % r.length] || 1; $('#dRate').textContent = rate + '×'; };
  $$('.dmode button').forEach(b => b.onclick = () => { mode = b.dataset.m; paint(); });
  $('#dAll').onclick = () => { let c = 0; const have = new Set(NOTES.map(n => norm(n.term))); d.vocab.forEach(x => { if (!have.has(norm(x[0]))) { NOTES.unshift({ id: uid(), term: x[0], cat: guessCat(x[0]), es: x[1], ex: (d.lines.find(l => norm(l[1]).includes(norm(x[0]))) || [])[1] || '', src: 'Diálogo · ' + d.title, created: Date.now(), upd: Date.now(), srs: newSrs() }); c++; } }); saveNotes(); toast(c ? c + ' guardadas en Mío' : 'Ya las tenías'); };
  $('#view').onclick = e => {
    const g = e.target.closest('.gapw'); if (g) { g.textContent = g.dataset.w; g.classList.add('shown'); return; }
    const s = e.target.closest('[data-say]'); if (s) { TTS.speak(s.dataset.say, { rate: 0.9 }); return; }
    const a = e.target.closest('[data-addv]'); if (a) { const x = d.vocab[+a.dataset.addv]; if (!NOTES.some(n => norm(n.term) === norm(x[0]))) { NOTES.unshift({ id: uid(), term: x[0], cat: guessCat(x[0]), es: x[1], ex: (d.lines.find(l => norm(l[1]).includes(norm(x[0]))) || [])[1] || '', src: 'Diálogo · ' + d.title, created: Date.now(), upd: Date.now(), srs: newSrs() }); saveNotes(); } a.outerHTML = '<span class="tag good">✓</span>'; return; }
    const r = e.target.closest('[data-role]'); if (r) { stopDialogPlay(); TTS.stop(); mode = 'full'; paint(); lineEls().forEach((el, k) => el.classList.toggle('hide', d.lines[k][0] === r.dataset.role)); DPLAY = {}; $('#dPlay').innerHTML = IC.pause; playFrom(0, r.dataset.role); return; }
    const l = e.target.closest('.dl'); if (l && !DPLAY) { const [who, txt] = d.lines[+l.dataset.k]; TTS.speak(txt, { voice: voiceOf(who), pitch: pitchOf(who), rate }); return; }
    const o = e.target.closest('[data-qz] .opt'); if (o) { const c = o.closest('[data-qz]'); if (c.dataset.done) return; c.dataset.done = 1; const qz = d.quiz[+c.dataset.qz]; const ok = +o.dataset.j === qz[2]; $$('.opt', c).forEach(x => +x.dataset.j === qz[2] && x.classList.add('right')); if (!ok) o.classList.add('wrong'); bump('ex'); if (ok) bump('ok'); }
  };
}

/* ---------- inglés rápido ---------- */
function renderFast() {
  const C = window.CONNECTED || [];
  $('#view').innerHTML = `<div class="h1">Inglés rápido</div><p class="sub">Así suena el inglés cuando se habla deprisa. Si conoces estas reducciones, entenderás muchísimo más a los nativos.</p>
    <div class="notice warm">La voz del móvil no siempre reduce las palabras como un nativo. Úsala para practicar el ritmo y fíjate en cómo se escribe la versión real. Para oírlo de verdad, mira los vídeos de la sección Vídeos y podcasts.</div>
    <a class="btn primary block" href="#ex/fast" style="margin-bottom:12px">Test: escribe lo que oyes</a>
    <div class="card">${C.map((c, k) => `<div class="note"><div class="grow"><span class="term">${esc(c[1])}</span><div class="es">${esc(c[0])}</div><div class="muted" style="font-size:13.5px;margin-top:3px"><b>${esc(c[2])}</b> · ${esc(c[3])}</div></div>
      <div style="display:flex;flex-direction:column;gap:6px"><button class="mini" data-fk="${k}" data-r="1" aria-label="Normal">${IC.speak}</button><button class="mini" data-fk="${k}" data-r="1.35" aria-label="Rápido">⚡</button></div></div>`).join('')}</div>`;
  $('#view').onclick = e => { const b = e.target.closest('[data-fk]'); if (b) TTS.speak(C[+b.dataset.fk][0], { rate: +b.dataset.r }); };
}
EXTRA_TITLES.fast = 'Inglés rápido';
EXTRA_GENS.fast = () => { const C = window.CONNECTED || []; const pool = C.concat((window.DIALOGUES || []).flatMap(d => d.lines.filter(l => l[1].split(' ').length <= 12).map(l => [l[1], l[1], 'diálogo', '']))); const c = pick(pool); return { type: 'fast', c, it: { s: c[0], src: 'Inglés rápido' } }; };
EXTRA_RENDER.fast = q => {
  $('#view').innerHTML = `${exHeader()}<div id="qArea"><p class="muted" style="margin:16px 0 8px">Escucha la frase a velocidad rápida y escríbela completa</p>
    <div class="row" style="justify-content:center;gap:10px;margin:14px 0"><button class="btn primary" id="fP">${IC.play.replace('<svg', '<svg width="16" height="16"')} Rápido</button><button class="btn" id="fN">Normal</button><button class="btn" id="fS">🐢 Lento</button></div>
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

/* ---------- acentos ---------- */
function accentKey(v) { const l = v.lang.replace('_', '-'); if (/scot/i.test(v.name) || /en-GB-SC/i.test(l)) return 'en-SC'; return l.slice(0, 5); }
function accentVoices() { TTS.load(); const m = {}; TTS.voices.forEach(v => { const k = accentKey(v); if (window.ACCENTS_INFO[k]) (m[k] = m[k] || []).push(v); }); return m; }
function renderAccents() {
  const m = accentVoices(); const keys = Object.keys(m);
  $('#view').innerHTML = `<div class="h1">Acentos</div><p class="sub">El inglés suena muy distinto según el país. Escucha la misma frase con cada acento.</p>
    ${keys.length < 2 ? `<div class="notice warm">Tu dispositivo tiene pocas voces en inglés. En el iPhone puedes descargar más en Ajustes › Accesibilidad › Contenido leído › Voces › Inglés (Australia, Irlanda, India, Sudáfrica…).</div>` : `<a class="btn primary block" href="#ex/accent" style="margin-bottom:12px">Test: ¿de dónde es este acento?</a>`}
    <label class="lbl">Frase de prueba</label><select class="select" id="acLine">${window.ACCENT_LINES.map((l, k) => `<option value="${k}">${esc(l)}</option>`).join('')}</select>
    <div class="card" style="margin-top:12px">${Object.keys(window.ACCENTS_INFO).map(k => { const I = window.ACCENTS_INFO[k]; const has = m[k]; return `<div class="note ${has ? '' : 'off'}"><div class="grow"><span class="term">${I.flag} ${esc(I.name)}</span><div class="muted" style="font-size:14px;margin-top:3px">${esc(I.tip)}</div>${has ? '' : '<div class="meta">No hay voz instalada</div>'}</div>${has ? `<button class="mini" data-ac="${k}">${IC.speak}</button>` : ''}</div>`; }).join('')}</div>`;
  $('#view').onclick = e => { const b = e.target.closest('[data-ac]'); if (b) TTS.speak(window.ACCENT_LINES[+$('#acLine').value], { voice: pick(m[b.dataset.ac]) }); };
}
EXTRA_TITLES.accent = 'Acentos';
EXTRA_GENS.accent = () => { const m = accentVoices(); const keys = Object.keys(m); if (keys.length < 2) return null; const k = pick(keys); return { type: 'accent', k, keys: shuffle(keys).slice(0, 4), voice: pick(m[k]), line: pick(window.ACCENT_LINES) }; };
EXTRA_RENDER.accent = q => {
  let opts = q.keys.includes(q.k) ? q.keys : q.keys.slice(0, 3).concat(q.k); opts = shuffle(opts);
  $('#view').innerHTML = `${exHeader()}<div id="qArea"><p class="muted" style="margin:16px 0 8px">¿De dónde es este acento?</p>
    <div class="row" style="justify-content:center;margin:14px 0"><button class="btn primary" id="aP">${IC.play.replace('<svg', '<svg width="16" height="16"')} Escuchar otra vez</button></div>
    <div class="opts">${opts.map(o => `<button class="opt" data-o="${o}">${window.ACCENTS_INFO[o].flag} ${esc(window.ACCENTS_INFO[o].name)}</button>`).join('')}</div></div>`;
  const play = () => TTS.speak(q.line, { voice: q.voice }); $('#aP').onclick = play; setTimeout(play, 250);
  $$('.opt').forEach(b => b.onclick = () => { if ($('.opt.right')) return; const ok = b.dataset.o === q.k; $$('.opt').forEach(x => x.dataset.o === q.k && x.classList.add('right')); if (!ok) b.classList.add('wrong'); q.it = { s: q.line, src: 'Acentos' }; answered(ok, `<div style="margin-top:4px">${esc(window.ACCENTS_INFO[q.k].tip)}</div>`); });
};

/* ---------- manos libres ---------- */
let HF = null;
function stopHandsFree() { if (HF) { HF.stop = true; clearTimeout(HF.t); try { HF.lock && HF.lock.release(); } catch (e) {} addListen(Math.round((Date.now() - HF.start) / 1000)); HF = null; TTS.stop(); } }
function hfSources() {
  const src = [['due', 'Repasos pendientes', dueCards().length], ['learning', 'Todo lo que estoy aprendiendo', LIB.filter(x => x.srs && !x.srs.known).length + NOTES.length], ['mine', 'Mis palabras', NOTES.length], ['fav', 'Favoritas', setItems('fav').length], ['unknown', 'No me la sé', setItems('unknown').length]];
  LISTS.forEach(L => src.push(['list:' + L.id, 'Lista · ' + L.name, L.items.length]));
  Object.keys(LIB_CATS).forEach(c => src.push(['cat:' + c, 'Biblioteca · ' + LIB_CATS[c].name, LIB.filter(x => x.cat === c).length]));
  return src;
}
function hfItems(key) {
  if (key === 'due') return dueCards();
  if (key === 'learning') return LIB.filter(x => x.srs && !x.srs.known).concat(NOTES);
  if (key === 'mine') return NOTES.slice();
  if (key.startsWith('cat:')) return shuffle(LIB.filter(x => x.cat === key.slice(4))).slice(0, 60);
  return setItems(key);
}
function renderHandsFree() {
  const cfg = Object.assign({ src: 'due', pause: 3, es: true, ex: true, rep: false }, store.get('hfcfg', {}));
  $('#view').innerHTML = `<div class="h1">Manos libres</div><p class="sub">Escucha la palabra en inglés, intenta decir qué significa durante la pausa y luego oirás la respuesta. Ideal caminando o en el coche.</p>
    <div class="card set-group">
      <label class="lbl">Qué repasar</label><select class="select" id="hfSrc">${hfSources().map(([k, n, c]) => `<option value="${k}" ${k === cfg.src ? 'selected' : ''} ${c ? '' : 'disabled'}>${esc(n)} (${c})</option>`).join('')}</select>
      <label class="lbl">Pausa para pensar · <span id="hfPv">${cfg.pause}</span> s</label><input type="range" id="hfPause" min="1" max="8" step="1" value="${cfg.pause}" style="width:100%">
      <label class="switch"><span>Decir la traducción en español</span><input type="checkbox" id="hfEs" ${cfg.es ? 'checked' : ''}></label>
      <label class="switch"><span>Leer también el ejemplo</span><input type="checkbox" id="hfEx" ${cfg.ex ? 'checked' : ''}></label>
      <label class="switch"><span>Al revés: primero español, luego inglés</span><input type="checkbox" id="hfRev" ${cfg.rep ? 'checked' : ''}></label>
    </div>
    <div class="card pad hfnow" id="hfNow" style="margin-top:12px;text-align:center"><div class="muted">Pulsa Empezar</div></div>
    <div class="row" style="margin-top:12px"><button class="btn primary grow" id="hfGo">${IC.play.replace('<svg', '<svg width="16" height="16"')} Empezar</button><button class="btn grow" id="hfSkip">Siguiente</button><button class="btn grow" id="hfStop">Parar</button></div>
    <p class="meta" style="margin-top:10px">Mantén la pantalla encendida: en el iPhone el audio de las webs se para al bloquear el móvil.</p>`;
  const save = () => { cfg.src = $('#hfSrc').value; cfg.pause = +$('#hfPause').value; cfg.es = $('#hfEs').checked; cfg.ex = $('#hfEx').checked; cfg.rep = $('#hfRev').checked; store.set('hfcfg', cfg); $('#hfPv').textContent = cfg.pause; };
  ['hfSrc', 'hfPause', 'hfEs', 'hfEx', 'hfRev'].forEach(id => $('#' + id).addEventListener('input', save));
  const step = () => {
    if (!HF || HF.stop) return;
    if (HF.i >= HF.items.length) { HF.i = 0; HF.items = shuffle(HF.items); }
    const x = HF.items[HF.i]; const me = HF; const tok = HF.tok = (HF.tok || 0) + 1;
    $('#hfNow').innerHTML = `<div class="muted" style="font-size:13px">${HF.i + 1} / ${HF.items.length}</div><div class="term" style="font-family:var(--serif);font-size:26px;font-weight:700;margin:8px 0">${esc(cfg.rep ? (x.es || x.term) : x.term)}</div><div id="hfAns" class="muted" style="min-height:44px"></div>`;
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
      TTS.speak(txt, { es, rate: es ? 1 : Math.min(S.rate, 0.95), onend: () => { HF.t = setTimeout(run, 350); }, onerror: () => { HF.t = setTimeout(run, 350); } });
    };
    run();
  };
  $('#hfGo').onclick = async () => {
    save(); stopHandsFree();
    const items = shuffle(hfItems(cfg.src)).filter(x => x.term); if (!items.length) { toast('No hay nada en esa selección'); return; }
    HF = { items, i: 0, start: Date.now() };
    try { if (navigator.wakeLock) HF.lock = await navigator.wakeLock.request('screen'); } catch (e) {}
    step();
  };
  $('#hfSkip').onclick = () => { if (!HF) return; TTS.stop(); clearTimeout(HF.t); HF.i++; step(); };
  $('#hfStop').onclick = () => { stopHandsFree(); $('#hfNow').innerHTML = '<div class="muted">Parado</div>'; };
}

/* ---------- vídeos y podcasts ---------- */
let VTIMER = null;
function stopVideoTimer() { if (VTIMER) { addListen(Math.round((Date.now() - VTIMER) / 1000)); VTIMER = null; } }
function ytId(url) { const m = String(url).match(/(?:youtu\.be\/|v=|\/embed\/|\/shorts\/|\/live\/)([A-Za-z0-9_-]{11})/); return m ? m[1] : null; }
function renderVideos(id) {
  if (id) return renderVideo(id);
  $('#view').innerHTML = `<div class="h1">Vídeos y podcasts</div><p class="sub">El inglés de los nativos de verdad. Pega aquí cualquier vídeo de YouTube para verlo dentro de la app y apuntar expresiones mientras lo ves.</p>
    <div class="card set-group"><label class="lbl">Enlace de YouTube</label><div class="row"><input class="input grow" id="ytUrl" placeholder="https://www.youtube.com/watch?v=…" autocapitalize="off"><button class="btn primary" id="ytAdd">Abrir</button></div></div>
    ${VIDEOS.length ? `<div class="h2">Mis vídeos</div><div class="card">${VIDEOS.map(v => `<a class="note" href="#videos/${v.id}" style="text-decoration:none;color:inherit"><div class="grow"><span class="term">${esc(v.title || 'Vídeo')}</span><div class="meta">${(v.notes || []).length} apuntes · ${new Date(v.upd || v.created).toLocaleDateString('es-ES', { day: 'numeric', month: 'short' })}</div></div><span class="muted">›</span></a>`).join('')}</div>` : ''}
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
  $('#view').innerHTML = `<input class="input nbtitle" id="vT" value="${esc(v.title)}" placeholder="Título del vídeo (para encontrarlo luego)">
    <div class="vwrap"><iframe src="https://www.youtube-nocookie.com/embed/${esc(v.vid)}?cc_lang_pref=en&cc_load_policy=1&hl=en&rel=0&playsinline=1" title="YouTube" allow="accelerometer; autoplay; clipboard-write; encrypted-media; picture-in-picture" allowfullscreen></iframe></div>
    <p class="meta" style="margin-top:6px">Activa los subtítulos en inglés (CC) y, si puedes, ve trozos cortos varias veces.</p>
    <div class="h2">Apuntes del vídeo</div>
    <div class="row"><input class="input grow" id="vN" placeholder="Expresión o frase que has oído…"><button class="btn primary" id="vAdd">${IC.plus.replace('<svg', '<svg width="16" height="16"')}</button></div>
    <div id="vNotes" style="margin-top:10px"></div>
    <div class="row" style="margin-top:16px"><button class="btn danger" id="vDel">${IC.trash.replace('<svg', '<svg width="16" height="16"')} Quitar vídeo</button></div>`;
  VTIMER = Date.now();
  const paint = () => { $('#vNotes').innerHTML = v.notes.length ? `<div class="card">${v.notes.map((n, k) => `<div class="note"><div class="grow"><span class="term" style="font-size:16px">${esc(n)}</span></div><button class="mini" data-say="${esc(n)}">${IC.speak}</button><button class="btn small" data-tomine="${k}">A Mío</button></div>`).join('')}</div>` : '<div class="muted" style="font-size:14px">Apunta aquí lo que oigas. Luego pásalo a Mío para repasarlo.</div>'; };
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
  if (!pool.length) { v.innerHTML = `<div class="card pad empty">Aún no tienes palabras en repaso.</div><a class="btn primary block" href="#new">Aprender palabras nuevas</a>`; return; }
  const queue = shuffle(pool).slice(0, S.exLen || 10); let i = 0, ok = 0;
  const show = () => {
    if (i >= queue.length) { v.innerHTML = `<div class="card pad" style="text-align:center;padding:28px"><div style="font-size:42px">👂</div><b>${ok}/${queue.length} reconocidas de oído</b><p class="muted">Entender sin leer es justo lo que necesitas para las conversaciones reales.</p><button class="btn primary block" id="again">Otra ronda</button><a class="btn ghost block" href="#listen" style="margin-top:8px">Volver</a></div>`; $('#again').onclick = () => EXTRA_STARTS.ear(arg); return; }
    const x = queue[i];
    v.innerHTML = `<div class="row" style="margin-bottom:8px"><b class="grow">Tarjetas de oído</b><span class="muted">${i + 1}/${queue.length}</span></div><div class="progressbar"><i style="width:${i / queue.length * 100}%"></i></div>
      <div class="card flash" style="margin-top:14px"><div style="font-size:54px">👂</div><div class="muted">Escucha y piensa qué significa</div>
        <div class="row" style="justify-content:center;margin-top:12px;gap:8px"><button class="btn primary" id="eP">${IC.play.replace('<svg', '<svg width="16" height="16"')} Otra vez</button><button class="btn" id="eS">🐢</button>${x.ex ? '<button class="btn" id="eX">En una frase</button>' : ''}</div>
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

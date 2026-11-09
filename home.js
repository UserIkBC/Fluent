'use strict';
/* ==========================================================
   HOY · tu sesión diaria (larga o corta), progreso y ajustes
   ========================================================== */
let HOME_SESSION = false;
function sessionStepDone() {}
const _route = route;

/* textos elegidos para hoy (estables durante el día) */
function todayPicks() {
  const k = 'picks:' + dayKey();
  let p = store.get('picks2', {});
  if (p.d === dayKey() && p.read && origById(p.read) && origById(p.listen)) return p;
  const all = allTexts().filter(t => t.src === 'orig');
  const unread = all.filter(t => !(READS[t.id] && READS[t.id].done));
  const pool = unread.length > 4 ? unread : all;
  /* lecturas de 5-10 min: si dejaste una a medias por partes, primero la parte siguiente */
  const partDone = t => { const prev = t.chapter > 1 ? allTexts().find(x => x.series === t.series && x.chapter === t.chapter - 1) : null; return !prev || (READS[prev.id] && READS[prev.id].done); };
  const nextParts = unread.filter(t => t.chapter > 1 && partDone(t));
  const reads = nextParts.slice(0, 1).concat(recommend(pool.filter(t => (t.chapter || 1) === 1 && wordCount(t.body) >= 250), 3)).slice(0, 3);
  const listens = recommend(pool.filter(t => !reads.includes(t) && wordCount(t.body) < 900 && t.kind !== 'Mensajes'), 3);
  p = { d: dayKey(), read: (reads[0] || pool[0] || {}).id, read2: (reads[1] || {}).id, listen: (listens[0] || pool[1] || {}).id };
  store.set('picks2', p);
  return p;
}
function sessionSteps() {
  const t = today(); const due = dueCards().length; const p = todayPicks();
  const long = S.sessionLen !== 'short';
  const rd = id => id && READS[id] && READS[id].done && READS[id].upd > new Date().setHours(0, 0, 0, 0);
  const tr = id => { const x = id && origById(id); return x ? x.title : ''; };
  const steps = [
    { k: 'rev', ic: 'cards', t: 'Repasa tus tarjetas', d: due ? due + ' pendientes · con la frase donde encontraste cada palabra' : 'Al día', href: '#ex/review', done: !due || (t.rev || 0) >= 60, min: Math.min(15, Math.ceil(due / 4)) },
    { k: 'read', ic: 'book', t: 'Lectura del día', d: tr(p.read), href: '#r/' + p.read, done: rd(p.read), min: p.read && origById(p.read) ? readMin(origById(p.read).body) : 20 },
    { k: 'listen', ic: 'ear', t: 'Escucha en 3 pasadas', d: tr(p.listen), href: '#r/' + p.listen, mode: 'hide', done: rd(p.listen) || (t.lsec || 0) >= (long ? 900 : 420), min: 10 }
  ];
  if (long) {
    steps.push({ k: 'new', ic: 'spark', t: 'Palabras nuevas, a fondo', d: 'De la biblioteca, en 5 pasos hasta que las escribas de memoria', href: '#learn/new', done: (t.newLib || 0) >= S.newPerDay, min: 8 });
    steps.push(S.guardianKey ? { k: 'real', ic: 'news', t: 'Un artículo real del Guardian', d: 'Opinión o reportaje de hoy, de tus temas', href: '#guardian/' + dailyPick(['opinion', 'longread', 'features', 'law', 'world', 'business', 'culture', 'sport', 'science'], 'gs'), done: Object.keys(READS).some(k => k.startsWith('g:') && READS[k].done && READS[k].upd > new Date().setHours(0, 0, 0, 0)), min: 15 }
      : { k: 'real', ic: 'book', t: 'Segunda lectura', d: tr(p.read2) || 'Un capítulo de novela o un artículo de Wikipedia', href: p.read2 ? '#r/' + p.read2 : '#books', done: rd(p.read2) || (t.art || 0) >= 3, min: 15 });
    steps.push({ k: 'pod', ic: 'podcast', t: 'Un podcast de nativos', d: 'Sin texto, para entrenar el oído de verdad', href: '#podcasts', done: (t.lsec || 0) >= 1800, min: 15 });
  }
  steps.push({ k: 'ex', ic: 'gap', t: 'Ejercicios con lo de hoy', d: 'Huecos en frases de los textos que has leído', href: '#ex/gap', done: (t.ex || 0) >= 10, min: 5 });
  return steps;
}
function renderHome() {
  HOME_SESSION = true;
  const d = new Date();
  let dateStr = d.toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long' }); dateStr = dateStr.charAt(0).toUpperCase() + dateStr.slice(1);
  const h = d.getHours(); const hello = h < 13 ? 'Good morning' : h < 20 ? 'Good afternoon' : 'Good evening';
  const t = today(); const steps = sessionSteps(); const n = steps.filter(s => s.done).length;
  const cont = Object.entries(READS).filter(([, r]) => !r.done && r.pct > 3 && r.pct < 100).sort((a, b) => b[1].upd - a[1].upd)[0];
  const exp = dailyPick(LIB.filter(x => ['idiom', 'phrasal', 'chunk', 'slang', 'convo'].includes(x.cat)), 'e');
  $('#view').innerHTML = `
    <div class="eyebrow">${esc(dateStr)}</div>
    <div class="h1">${hello}${S.name ? ', ' + esc(S.name) : ''}</div>
    ${typeof cfg === 'function' && cfg() && SYNC.ready && !SYNC.user ? `<a class="card pad cta" href="#settings" style="border-color:var(--warm)"><div class="grow"><b>Crea tu cuenta</b><div class="muted" style="font-size:14px">Guarda tu progreso en internet para no perderlo nunca</div></div><span class="btn warm small">Crear</span></a>` : ''}
    ${!S.knownRank ? `<a class="card pad cta" href="#calib"><div class="grow"><b>Primero, calibra tu vocabulario</b><div class="muted" style="font-size:14px">2 minutos para que los textos marquen bien las palabras que no conoces</div></div><span class="btn primary small">Empezar</span></a>` : ''}
    <div class="card plan">
      <div class="row" style="margin-bottom:6px;gap:8px"><b class="grow">Mi sesión de hoy</b><span class="tag ${n === steps.length ? 'good' : ''}">${n}/${steps.length}</span></div>
      <div class="seg mini" id="slen" style="margin-bottom:8px"><button data-l="long" class="${S.sessionLen !== 'short' ? 'on' : ''}">Larga · 1 h</button><button data-l="short" class="${S.sessionLen === 'short' ? 'on' : ''}">Corta · 25 min</button></div>
      <div class="sessbar"><i style="width:${n / steps.length * 100}%"></i></div>
      ${steps.map((s, i) => `<a class="plan-row ${s.done ? 'done' : ''}" href="${esc(s.href)}" ${s.mode ? `data-mode="${s.mode}"` : ''}><span class="check">${s.done ? '✓' : i + 1}</span><span class="grow"><b style="font-weight:600">${esc(s.t)}</b><span class="muted plan-d">${esc(s.d || '')}</span></span><span class="muted" style="white-space:nowrap;font-size:13px">${s.min} min</span></a>`).join('')}
    </div>
    <div class="stats4">
      <div><b>${fmtMin(t.sec)}</b><span>leyendo</span></div><div><b>${fmtMin(t.lsec)}</b><span>escuchando</span></div><div><b>${fmtNum(t.words || 0)}</b><span>palabras leídas</span></div><div><b>${fmtNum(knownCount())}</b><span>conocidas</span></div>
    </div>
    ${cont ? `<div class="h2">Seguir leyendo</div><div class="card list-card"><a class="story" href="#r/${esc(cont[0])}"><div class="meta"><span class="tag">${esc(cont[1].kind || '')}</span><span class="read-badge">${cont[1].pct}%</span></div><h3>${esc(cont[1].title)}</h3></a></div>` : ''}
    ${exp ? `<div class="h2">Expresión del día</div><div class="card pad dayexp"><div class="row"><b class="grow" style="font-family:var(--serif);font-size:20px">${esc(exp.term)}</b><button class="mini" data-say="${esc(exp.term)}">${IC.speak}</button></div><div class="es" style="display:block">${esc(exp.es)}</div><div class="ex">${esc(exp.ex)}</div><div class="row" style="margin-top:8px;gap:6px">${!exp.srs ? `<button class="btn small" data-learn="${esc(exp.id)}">Aprenderla</button>` : '<span class="tag">En tus repasos</span>'}<button class="btn small" data-det="${esc(exp.id)}">Ficha</button></div></div>` : ''}
    <div class="row" style="margin-top:16px;gap:8px"><a class="btn grow" href="#progress">${ico('chart')} Mi progreso</a><a class="btn grow" href="#settings">${ico('gear')} Ajustes</a></div>`;
  $('#slen').onclick = e => { const b = e.target.closest('[data-l]'); if (!b) return; S.sessionLen = b.dataset.l; saveSettings(); renderHome(); };
  $('#view').onclick = e => {
    const m = e.target.closest('[data-mode]'); if (m) { READER_START_MODE = m.dataset.mode; return; }
    const s = e.target.closest('[data-say]'); if (s) { TTS.speak(s.dataset.say, { rate: 0.9 }); return; }
    const l = e.target.closest('[data-learn]'); if (l) { startLearning(LIB_BY_ID[l.dataset.learn]); saveLearn(); toast('Añadida a tus repasos'); renderHome(); return; }
    const dt = e.target.closest('[data-det]'); if (dt) openDetail(dt.dataset.det);
  };
}

/* ==========================================================
   PROGRESO
   ========================================================== */
function renderProgress() {
  const t = today(); const st = streak();
  const keys = Object.keys(STATS);
  const tot = k => keys.reduce((a, d) => a + (STATS[d][k] || 0), 0);
  const days = []; for (let i = 13; i >= 0; i--) { const d = new Date(); d.setDate(d.getDate() - i); const s = STATS[dayKey(d)] || {}; days.push({ d, v: Math.round(((s.sec || 0) + (s.lsec || 0)) / 60) + Math.round(((s.ex || 0) + (s.rev || 0)) / 2) }); }
  const max = Math.max(10, ...days.map(x => x.v));
  const inRev = LIB.filter(x => x.srs).concat(NOTES.filter(n => n.srs && n.srs.reps));
  const active = inRev.filter(x => (x.srs.prodOk || 0) >= 1).length;
  const months = []; for (let i = 5; i >= 0; i--) { const d = new Date(); d.setDate(1); d.setMonth(d.getMonth() - i); const pref = d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0'); const ks = keys.filter(k => k.startsWith(pref)); months.push({ label: d.toLocaleDateString('es-ES', { month: 'short' }), min: Math.round(ks.reduce((a, k) => a + (STATS[k].sec || 0) + (STATS[k].lsec || 0), 0) / 60), words: ks.reduce((a, k) => a + (STATS[k].words || 0), 0) }); }
  const mM = Math.max(10, ...months.map(m => m.min)), mW = Math.max(100, ...months.map(m => m.words));
  const chart = (key, mx) => `<div class="chart">${months.map((m, i) => `<div class="bar ${i === 5 ? 'today' : ''}"><i style="height:${m[key] / mx * 100}%"></i><span>${esc(m.label)}</span></div>`).join('')}</div>`;
  $('#view').innerHTML = `
    <div class="h1">Progreso</div>
    <div class="card hero-streak"><div class="big">${st}</div><div><b>${st === 1 ? 'día seguido' : 'días seguidos'}</b><div class="muted" style="font-size:14px">Un día cuenta si terminas un texto, lees 10 minutos, escuchas 5, haces 10 ejercicios o repasos, o aprendes 5 palabras.</div></div></div>
    <div class="h2">Tu vocabulario</div>
    <div class="stats"><div class="card stat"><b>${fmtNum(knownCount())}</b><span>palabras conocidas</span></div><div class="card stat"><b>${fmtNum(learningCount())}</b><span>aprendiendo en textos</span></div><div class="card stat"><b>${fmtNum(inRev.length)}</b><span>en tus repasos</span></div></div>
    <div class="card pad" style="margin-top:10px"><div class="goal"><div class="row"><span>Pasivo · lo entiendes</span><span class="muted">${inRev.length}</span></div><div class="progressbar"><i style="width:100%"></i></div></div><div class="goal"><div class="row"><span>Activo · lo has escrito tú</span><span class="muted">${active}</span></div><div class="progressbar"><i style="width:${inRev.length ? active / inRev.length * 100 : 0}%;background:var(--good)"></i></div></div><div class="meta">Una palabra pasa a activa cuando la produces en «Dilo tú en inglés».</div></div>
    <div class="h2">Hoy</div>
    <div class="stats"><div class="card stat"><b>${fmtMin(t.sec)}</b><span>leyendo</span></div><div class="card stat"><b>${fmtMin(t.lsec)}</b><span>escuchando</span></div><div class="card stat"><b>${fmtNum(t.words || 0)}</b><span>palabras leídas</span></div><div class="card stat"><b>${t.rev || 0}</b><span>repasos</span></div><div class="card stat"><b>${t.ex || 0}</b><span>ejercicios</span></div><div class="card stat"><b>${t.newLib || 0}</b><span>palabras nuevas</span></div></div>
    <div class="h2">Últimos 14 días</div>
    <div class="card pad"><div class="chart">${days.map((x, i) => `<div class="bar ${i === 13 ? 'today' : ''}"><i style="height:${x.v / max * 100}%"></i><span>${x.d.getDate()}</span></div>`).join('')}</div><div class="meta" style="margin-top:6px">Minutos de lectura y escucha, más ejercicios y repasos</div></div>
    <div class="h2">Por meses</div>
    <div class="card pad"><b style="font-size:14px">Palabras leídas</b>${chart('words', mW)}<b style="font-size:14px;display:block;margin-top:14px">Minutos leyendo y escuchando</b>${chart('min', mM)}</div>
    <div class="h2">En total</div>
    <div class="stats"><div class="card stat"><b>${fmtNum(tot('words'))}</b><span>palabras leídas</span></div><div class="card stat"><b>${fmtNum(HISTORY.length)}</b><span>textos terminados</span></div><div class="card stat"><b>${fmtMin(tot('sec'))}</b><span>leyendo</span></div><div class="card stat"><b>${fmtMin(tot('lsec'))}</b><span>escuchando</span></div><div class="card stat"><b>${fmtNum(tot('ex'))}</b><span>ejercicios</span></div><div class="card stat"><b>${fmtNum(tot('rev'))}</b><span>repasos</span></div></div>`;
}

/* ==========================================================
   AJUSTES
   ========================================================== */
function renderSettings() {
  TTS.load();
  const voices = TTS.voices.slice().sort((a, b) => TTS.rank(b) - TTS.rank(a));
  const sw = (id, label, on) => `<label class="switch"><span>${label}</span><input type="checkbox" id="${id}" ${on ? 'checked' : ''}></label>`;
  $('#view').innerHTML = `
    <div class="h1">Ajustes</div>
    <div class="h2">Cuenta</div><div class="card set-group" id="accountBox"></div>
    <div class="h2">Fuentes de textos</div>
    <div class="card set-group">
      <label class="lbl">Clave de The Guardian</label><div class="row"><input class="input grow" id="sGK" value="${esc(S.guardianKey || '')}" placeholder="Pega aquí tu clave gratuita" autocomplete="off" autocapitalize="off" spellcheck="false"><button class="btn" id="sGKt">Probar</button></div>
      <p class="meta" style="margin-top:6px">Se saca gratis en open-platform.theguardian.com (Register for a developer key).</p>
      ${typeof aiSettingsHTML === 'function' ? aiSettingsHTML() : ''}
      <label class="lbl">Tus temas preferidos</label>
      <div class="chips wrapchips" id="sTop">${Object.entries(TOPIC_NAMES).map(([k, n]) => `<button class="chip ${(S.topics || []).includes(k) ? 'active' : ''}" data-tp="${k}">${esc(n)}</button>`).join('')}</div>
    </div>
    <div class="h2">Lectura</div>
    <div class="card set-group">
      ${sw('sColor', 'Colorear las palabras según las conozcas y subrayar expresiones (normalmente el texto sale limpio)', S.colorWords === true)}
      ${sw('sAutoK', 'Al terminar un texto, dar por conocidas las palabras azules que no he tocado', S.autoKnown)}
      ${sw('sSentHide', 'En «Frase a frase», ocultar el texto hasta que lo pida', S.sentHide)}
      <label class="lbl">Tamaño de letra de las lecturas · <span id="sSizeV">${S.readSize}</span> px</label><input type="range" id="sSize" min="15" max="28" step="1" value="${S.readSize}" style="width:100%">
      <div class="row" style="margin-top:10px"><a class="btn grow" href="#calib">Repetir la calibración del vocabulario</a></div>
      <p class="meta" style="margin-top:6px">Ahora mismo la app da por conocidas las ${fmtNum(S.knownRank || 0)} palabras más frecuentes.</p>
    </div>
    <div class="h2">Voz</div>
    <div class="card set-group">
      ${sw('sAuto', 'Pronunciar automáticamente las palabras en las tarjetas', S.autoplay)}
      <label class="lbl">Voz inglesa</label>
      <select class="select" id="sVoice"><option value="">Automática (la mejor británica)</option>${voices.map(v => `<option value="${esc(v.name)}" ${v.name === S.voice ? 'selected' : ''}>${esc(v.name)} · ${esc(v.lang)}</option>`).join('')}</select>
      <p class="meta" style="margin-top:6px">En el iPhone puedes descargar voces mucho más naturales en Ajustes › Accesibilidad › Contenido leído › Voces › Inglés (Reino Unido). Las «mejoradas» o «premium» suenan casi como una persona.</p>
      <div class="row" style="margin-top:8px"><button class="btn small" id="sTest">Probar voz</button></div>
      <label class="lbl">Velocidad · <span id="sRateV">${S.rate}</span>×</label><input type="range" id="sRate" min="0.6" max="1.4" step="0.05" value="${S.rate}" style="width:100%">
    </div>
    <div class="h2">Palabras y repasos</div>
    <div class="card set-group">
      <label class="lbl">Palabras nuevas de la biblioteca al día · <span id="nV">${S.newPerDay}</span></label><input type="range" id="sNew" min="0" max="50" step="1" value="${S.newPerDay}" style="width:100%">
      <label class="lbl">Qué entra en tus palabras nuevas</label>
      ${Object.keys(LIB_CATS).map(c => `<label class="switch"><span>${esc(LIB_CATS[c].name)} <span class="muted">· ${LIB.filter(x => x.cat === c).length}</span></span><input type="checkbox" data-mix="${c}" ${S.mix[c] ? 'checked' : ''}></label>`).join('')}
      <label class="lbl">Tarjetas guardadas por ti que entran nuevas cada día</label><input class="input" type="number" min="1" max="300" id="gN" value="${S.newNotesPerDay}">
      <label class="lbl">Tarjetas: qué ves primero</label><select class="select" id="sFront"><option value="en">Inglés (y piensas el significado)</option><option value="es">Español (y piensas cómo se dice)</option><option value="mix">Mezclado</option></select>
      ${sw('sCloze', 'A veces, mostrar la tarjeta como frase con hueco', S.clozeCards !== false)}
      ${sw('sActive', 'Repaso activo: cuando ya la has acertado dos veces, escribirla de memoria en vez de solo darle la vuelta', S.activeRev !== false)}
      <label class="lbl">Preguntas por ronda de ejercicios</label><select class="select" id="sExLen"><option>5</option><option>10</option><option>15</option><option>20</option><option>30</option></select>
      ${sw('sShowEs', 'Mostrar la traducción en las listas (tocando se ve)', S.showEs)}
    </div>
    <div class="h2">Aspecto</div>
    <div class="card set-group">
      <label class="lbl">Tu nombre</label><input class="input" id="sName" value="${esc(S.name || '')}">
      <label class="lbl">Color principal</label>
      <div class="row wrap" style="gap:10px">${Object.entries(ACCENTS).map(([k, c]) => `<button type="button" class="swatch big ${S.accent === k ? 'on' : ''}" style="background:${c[0]}" data-acc="${k}" aria-label="${k}"></button>`).join('')}</div>
      <label class="lbl">Tema</label><select class="select" id="sTheme"><option value="auto">Automático (como el móvil)</option><option value="light">Claro</option><option value="dark">Oscuro</option></select>
      <label class="lbl">Letra de los textos</label><select class="select" id="sFont"><option value="serif">Clásica (con remates)</option><option value="sans">Moderna (sin remates)</option></select>
      <label class="lbl">Tamaño de la interfaz</label><select class="select" id="sUi"><option value="small">Pequeño</option><option value="normal">Normal</option><option value="large">Grande</option></select>
      <label class="lbl">Pestaña al abrir la app</label><select class="select" id="sStart"><option value="home">Hoy</option><option value="read">Leer</option><option value="listen">Escuchar</option><option value="words">Palabras</option><option value="mine">Mío</option></select>
    </div>
    <div class="h2">Mis datos</div>
    <div class="card set-group">
      <p class="muted" style="font-size:14px">Con cuenta, todo se guarda solo en internet. Sin cuenta, se guarda en este dispositivo; haz una copia de vez en cuando.</p>
      <div class="row wrap"><button class="btn grow" id="exp">Exportar copia</button><label class="btn grow" for="imp">Importar copia</label><input type="file" id="imp" accept="application/json,.json" class="hidden"></div>
      <div class="row wrap" style="margin-top:8px"><button class="btn grow" id="expCsv">Exportar mis palabras (CSV)</button><button class="btn danger grow" id="wipe">Borrar todo</button></div>
    </div>
    <p class="meta" style="text-align:center;margin:18px 0">Fluent ${VERSION} · ${fmtNum(allTexts().filter(t => t.src === 'orig').length)} textos · ${(window.BOOKS || []).length} novelas · ${fmtNum(LIB.length)} entradas · ${(window.GRAMMAR || []).length} lecciones</p>`;
  if (typeof accountHTML === 'function') { $('#accountBox').innerHTML = accountHTML(); bindAccount(); }
  $('#sTheme').value = S.theme; $('#sFont').value = S.font; $('#sUi').value = S.uiSize; $('#sStart').value = TABS.includes(S.startTab) ? S.startTab : 'home'; $('#sFront').value = S.cardFront; $('#sExLen').value = String(S.exLen);
  const bind = (id, fn, ev = 'change') => $(id).addEventListener(ev, e => { fn(e.target.type === 'checkbox' ? e.target.checked : e.target.value); saveSettings(); });
  bind('#sGK', v => { S.guardianKey = v.trim(); }, 'input');
  $('#sGKt').onclick = async () => { try { await gFetch('/search?page-size=1'); toast('¡La clave funciona!'); } catch (e) { toast(e.message === 'nokey' ? 'Primero pega la clave' : e.message); } };
  $('#sTop').onclick = e => { const b = e.target.closest('[data-tp]'); if (!b) return; b.classList.toggle('active'); S.topics = $$('#sTop .chip.active').map(x => x.dataset.tp); saveSettings(); };
  bind('#sColor', v => { S.colorWords = v; }); bind('#sAutoK', v => { S.autoKnown = v; }); bind('#sSentHide', v => { S.sentHide = v; });
  bind('#sSize', v => { S.readSize = +v; $('#sSizeV').textContent = v; applyTheme(); }, 'input');
  bind('#sName', v => { S.name = v.trim().slice(0, 30); }, 'input');
  $$('[data-acc]').forEach(b => b.onclick = () => { S.accent = b.dataset.acc; saveSettings(); applyTheme(); $$('[data-acc]').forEach(x => x.classList.toggle('on', x === b)); });
  bind('#sTheme', v => { S.theme = v; applyTheme(); }); bind('#sFont', v => { S.font = v; applyTheme(); }); bind('#sUi', v => { S.uiSize = v; applyTheme(); });
  bind('#sStart', v => { S.startTab = v; });
  bind('#sNew', v => { S.newPerDay = +v; $('#nV').textContent = v; }, 'input');
  $$('[data-mix]').forEach(c => c.addEventListener('change', () => { S.mix[c.dataset.mix] = c.checked; if (!Object.values(S.mix).some(Boolean)) { S.mix.word = true; $('[data-mix="word"]').checked = true; } saveSettings(); }));
  bind('#gN', v => { S.newNotesPerDay = Math.max(1, +v || 20); updateBadge(); });
  bind('#sFront', v => { S.cardFront = v; }); bind('#sCloze', v => { S.clozeCards = v; }); bind('#sActive', v => { S.activeRev = v; }); if (typeof bindAISettings === 'function') bindAISettings();
  bind('#sExLen', v => { S.exLen = +v || 10; });
  bind('#sShowEs', v => { S.showEs = v; applyTheme(); });
  bind('#sAuto', v => { S.autoplay = v; }); bind('#sVoice', v => { S.voice = v; });
  bind('#sRate', v => { S.rate = +v; $('#sRateV').textContent = v; }, 'input');
  $('#sTest').onclick = () => TTS.speak('Hi ' + (S.name || 'there') + '! This is how I sound. Shall we read something interesting today?');
  $('#exp').onclick = exportBackup; $('#expCsv').onclick = exportCSV; $('#imp').onchange = importBackup;
  $('#wipe').onclick = () => { if (confirm('¿Seguro que quieres borrar TODO de este dispositivo? Si tienes cuenta, tus datos siguen guardados en internet.') && confirm('Última confirmación. ¿Lo borro todo?')) { Object.keys(localStorage).filter(k => k.startsWith('fl_')).forEach(k => localStorage.removeItem(k)); if (window.firebase && typeof SYNC !== 'undefined' && SYNC.user) firebase.auth().signOut(); location.hash = ''; location.reload(); } };
}
function download(name, text, type) { const blob = new Blob([text], { type }); const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = name; document.body.appendChild(a); a.click(); setTimeout(() => { URL.revokeObjectURL(a.href); a.remove(); }, 1000); }
function exportBackup() { const data = Object.assign({ app: 'fluent', version: VERSION, date: new Date().toISOString() }, snapshot()); download('fluent-copia-' + dayKey() + '.json', JSON.stringify(data), 'application/json'); }
function exportCSV() {
  const q = s => '"' + String(s || '').replace(/"/g, '""') + '"';
  const rows = [['term', 'type', 'spanish', 'definition', 'example', 'more examples', 'synonyms', 'notes', 'favourite', 'status']].concat(NOTES.map(n => [n.term, CATS[n.cat], n.es, n.def, n.ex, n.exs, n.syn, n.note, mark(n.id).fav ? 'yes' : '', mark(n.id).st || '']));
  download('fluent-palabras-' + dayKey() + '.csv', '﻿' + rows.map(r => r.map(q).join(',')).join('\n'), 'text/csv');
}
function importBackup(e) {
  const f = e.target.files[0]; if (!f) return;
  const rd = new FileReader();
  rd.onload = () => {
    try {
      const d = JSON.parse(rd.result); if (d.app !== 'fluent') throw 0;
      if (!confirm('¿Combinar la copia con tus datos actuales? No se pierde nada de lo que ya tienes.')) return;
      const R = {}; SYNC_KEYS.forEach(k => { R[k] = d[k]; });
      applyState(merge(snapshot(), R)); route(); toast('Copia importada'); renderStreak();
    } catch (err) { toast('El archivo no es una copia válida de Fluent'); }
  };
  rd.readAsText(f);
}

addRoute('home', renderHome, 'home', 'Hoy');
addRoute('progress', renderProgress, 'home', 'Progreso');
addRoute('settings', renderSettings, 'home', 'Ajustes');

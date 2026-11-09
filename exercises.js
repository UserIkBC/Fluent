'use strict';

/* ==========================================================

   EJERCICIOS · motor de sesiones, tarjetas de repaso y todos los tipos

   (extraídos y mejorados de la versión anterior)

   ========================================================== */

const STOP = new Set('a an the and or but if of to in on at by for with from as is are was were be been being have has had do does did not no it its this that these those there their they them he she his her we our you your i me my mine us who whom whose which what when where why how than then so such very can could will would shall should may might must also just only even more most less much many some any all each other into over under about after before between through during up down out off again further once here both few own same too s t said says say mr mrs ms'.split(' '));
const FUNC_WORDS = ['in', 'on', 'at', 'of', 'for', 'to', 'with', 'by', 'from', 'which', 'whose', 'whom', 'although', 'despite', 'unless', 'whether', 'such', 'so', 'as', 'than', 'whereas', 'however', 'though', 'since', 'until', 'while', 'because', 'if', 'what', 'who', 'where', 'when', 'its', 'their', 'there', 'been', 'being', 'had', 'has', 'would', 'could', 'should', 'might', 'any', 'some', 'few', 'little', 'much', 'many', 'every', 'each', 'enough', 'too', 'even', 'only', 'yet', 'still', 'already', 'against', 'among', 'between', 'without', 'within', 'into', 'onto', 'upon', 'about', 'over', 'under', 'whereby', 'not', 'nor', 'neither', 'either', 'unlike', 'like', 'own', 'rather', 'instead', 'order', 'spite', 'regardless', 'apart', 'whatever', 'whoever', 'however'];
const FUNC_SET = new Set(FUNC_WORDS);

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
  if (!ALLC.length) { v.innerHTML = `<div class="card pad empty">Todavía no estás aprendiendo nada.<br><br>Empieza con tus palabras nuevas de hoy.</div><a class="btn primary block" href="#new">Palabras nuevas de hoy</a><p class="muted" style="text-align:center;margin-top:10px">O lee algo y guarda las palabras que no conozcas tocándolas.</p>`; return; }
  let queue = setMode ? shuffle(ALLC) : shuffle(dueCards()); let extra = false;
  if (!queue.length) { queue = shuffle(ALLC).slice(0, 15); extra = true; }
  let done = 0; const total = queue.length;
  const show = () => {
    if (!queue.length) {
      v.innerHTML = `<div class="card pad" style="text-align:center;padding:30px"><div style="font-size:46px">✓</div><b>Repaso terminado</b><p class="muted">${done} tarjetas repasadas. Las próximas aparecerán cuando toque.</p><a class="btn primary block" href="#words">Volver</a></div>`; updateBadge(); return;
    }
    const n = queue[0];
    const sr = n.srs || newSrs();
    let front = S.cardFront === 'mix' ? (Math.random() < 0.5 ? 'es' : 'en') : (S.cardFront === 'es' && n.es ? 'es' : 'en');
    const clozeOk = n.ex && S.clozeCards !== false && termWords(n.term).length <= 4 && new RegExp('\\b' + n.term.split('/')[0].trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '\\b', 'i').test(n.ex);
    if (clozeOk && (n.srs && n.srs.reps >= 1) && Math.random() < 0.5) front = 'cloze';
    /* repaso activo: a partir del 2.º acierto, la escribes tú (de memoria se fija mucho más que dándole la vuelta) */
    const typeOk = S.activeRev !== false && n.es && n.srs && (n.srs.reps || 0) >= 2 && termWords(n.term).length <= 6 && typeof checkTyped === 'function';
    if (typeOk && Math.random() < 0.7) front = clozeOk && Math.random() < 0.5 ? 'clozeType' : 'type';
    const own = (n.srs && n.srs.own) || [];
    const leech = n.srs && (n.srs.lapses || 0) >= 4;
    const tStart = Date.now();
    v.innerHTML = `<div class="row" style="margin-bottom:8px"><b class="grow">${setMode ? esc(setName(arg.replace(/^set:/, ''))) : 'Repaso' + (extra ? ' extra' : '')}</b><span class="muted">${done + 1}/${total}</span></div><div class="progressbar"><i style="width:${done / total * 100}%"></i></div>
      ${extra && done === 0 ? '<div class="notice" style="margin-top:12px">No tienes repasos pendientes hoy. Aquí van unas cuantas tarjetas extra.</div>' : ''}
      <div class="card flash" style="margin-top:14px" id="card"><div class="row" style="width:100%;justify-content:center;gap:6px"><span class="tag">${esc(CATS[n.cat] || '')}</span>${markBadges(n.id)}</div>${front === 'type' || front === 'clozeType' ? `${front === 'clozeType' ? `<div class="ctx" style="margin-top:12px;font-size:19px;line-height:1.5">${(blankIn(n.ex, n.term) || { html: esc(n.ex) }).html}</div>` : ''}<div class="term" style="margin-top:10px;font-size:${front === 'clozeType' ? 18 : 24}px">${esc(n.es)}</div><div class="muted" style="font-size:13px;margin-top:6px">Escríbelo en inglés</div>` : front === 'cloze' ? `<div class="ctx" style="margin-top:12px;font-size:20px;line-height:1.5">${esc(n.ex).replace(new RegExp('\\b' + esc(n.term.split('/')[0].trim()).replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '\\b', 'i'), '<span class="gap">?</span>')}</div><div class="muted" style="font-size:13px;margin-top:8px">${esc(n.es || '')} · ¿qué falta?</div>` : front === 'es' ? `<div class="term" style="margin-top:10px;font-size:24px">${esc(n.es || n.term)}</div><div class="muted" style="font-size:13px;margin-top:6px">¿Cómo se dice en inglés?</div>` : `<div class="term" style="margin-top:10px">${esc(n.term)}</div><button class="mini" id="cSay" style="margin-top:10px">${IC.speak}</button>`}
      <div id="back" class="back hidden">${front !== 'en' ? `<div class="term" style="font-size:24px">${esc(n.term)}</div><button class="mini" id="cSay2" style="margin:6px auto">${IC.speak}</button>` : `<div style="font-size:19px;font-weight:600">${esc(n.es || '—')}</div>`}${n.def ? `<div class="muted" style="margin-top:6px;font-size:15px">${esc(n.def)}</div>` : ''}${n.ex ? `<div class="ctx muted" style="margin-top:8px;font-style:italic">${esc(n.ex)}</div>` : ''}${n.note ? `<div class="muted" style="margin-top:6px;font-size:14px">📝 ${esc(n.note)}</div>` : ''}${own.length ? `<div style="margin-top:8px;font-size:14.5px">✍️ ${esc(own[own.length - 1])}</div>` : ''}<div id="typeRes"></div>${leech ? `<div class="notice" style="margin-top:10px;text-align:left">Esta se te resiste (${n.srs.lapses} fallos). Lo que mejor funciona: <a href="#" id="cOwn">escribir una frase tuya con ella</a> o aprenderla de nuevo paso a paso en «Aprender a fondo».</div>` : ''}</div></div>
      ${front === 'type' || front === 'clozeType' ? `<form class="row typebox" id="tyF"><input class="input grow" id="tyIn" placeholder="En inglés…" autocapitalize="off" autocomplete="off" spellcheck="false"><button class="btn primary">OK</button></form><button class="btn ghost small" id="tyGive" style="margin-top:6px">No me acuerdo</button>` : ''}
      <button class="btn primary block ${front === 'type' || front === 'clozeType' ? 'hidden' : ''}" id="reveal" style="margin-top:14px">Mostrar respuesta</button>
      <div class="row" style="justify-content:center;margin-top:10px;gap:8px"><button class="btn small" id="cFav">★</button><button class="btn small" id="cMark">${IC.flag.replace('<svg', '<svg width="14" height="14"')} Marcar</button></div>
      <div class="grades hidden" id="grades">
        <button class="btn" data-g="0" style="color:var(--bad)">Otra vez<small>10 min</small></button>
        <button class="btn" data-g="1">Difícil<small>${ivlLabel(srsPreview(sr, 1))}</small></button>
        <button class="btn" data-g="2" style="color:var(--good)">Bien<small>${ivlLabel(srsPreview(sr, 2))}</small></button>
        <button class="btn" data-g="3" style="color:var(--accent)">Fácil<small>${ivlLabel(srsPreview(sr, 3))}</small></button></div>`;
    if ($('#cSay')) $('#cSay').onclick = e => { e.stopPropagation(); TTS.speak(n.term, { rate: 0.9 }); };
    if ($('#cSay2')) $('#cSay2').onclick = e => { e.stopPropagation(); TTS.speak(n.term, { rate: 0.9 }); };
    if (front === 'en' && S.autoplay) TTS.speak(n.term, { rate: 0.9 });
    if (front === 'cloze' && $('.gap')) $('.gap').onclick = e => e.stopPropagation();
    $('#cFav').onclick = () => { setMark(n.id, { fav: !mark(n.id).fav }); toast(mark(n.id).fav ? 'Añadida a favoritas' : 'Quitada de favoritas'); };
    $('#cMark').onclick = () => openMarkSheet(n.id);
    const rev = () => { if ($('#grades').classList.contains('hidden') === false) return; $('#back').classList.remove('hidden'); $('#reveal').classList.add('hidden'); $('#grades').classList.remove('hidden'); if (front === 'cloze' && $('.gap')) $('.gap').textContent = n.term; if (front !== 'en' && S.autoplay) TTS.speak(front === 'cloze' ? n.ex : n.term, { rate: 0.95 }); };
    $('#reveal').onclick = rev;
    if (front === 'type' || front === 'clozeType') {
      setTimeout(() => $('#tyIn') && $('#tyIn').focus(), 80);
      const fin = said => {
        if (!$('#grades').classList.contains('hidden')) return;
        const r = checkTyped(said, n.term); const secs = (Date.now() - tStart) / 1000;
        const g = r === 'ok' ? (secs < 8 ? 3 : 2) : r === 'typo' ? 1 : 0;
        $('#tyF').classList.add('hidden'); $('#tyGive').classList.add('hidden');
        $('#typeRes').innerHTML = `<div class="feedback ${r === 'ok' ? 'ok' : r === 'typo' ? 'meh' : 'ko'}" style="text-align:left"><b>${r === 'ok' ? '¡Correcto!' : r === 'typo' ? 'Casi: revisa cómo se escribe' : said ? 'No es correcto' : 'Aquí la tienes'}</b>${said ? `<div>Has escrito · «${esc(said)}»</div>` : ''}<div class="muted" style="font-size:13px">Te sugiero «${['Otra vez', 'Difícil', 'Bien', 'Fácil'][g]}», pero puedes elegir otra.</div></div>`;
        if (front === 'clozeType' && $('.gap')) $('.gap').textContent = n.term;
        $('#back').classList.remove('hidden'); $('#grades').classList.remove('hidden');
        const sb = $(`#grades [data-g="${g}"]`); if (sb) sb.classList.add('sugg');
        TTS.speak(n.term, { rate: 0.9 });
      };
      $('#tyF').onsubmit = e => { e.preventDefault(); const v = $('#tyIn').value.trim(); if (v) fin(v); };
      $('#tyGive').onclick = () => fin('');
    } else $('#card').onclick = rev;
    if ($('#cOwn')) $('#cOwn').onclick = e => { e.preventDefault(); e.stopPropagation(); OWN_QUEUE = [n.id]; go('#ex/own'); };
    $('#grades').onclick = e => {
      const b = e.target.closest('[data-g]'); if (!b) return;
      const g = +b.dataset.g; grade(n, g); bump('rev'); queue.shift();
      if (g === 0) queue.splice(Math.min(queue.length, 3), 0, n); else done++;
      show();
    };
  };
  show();
}

async function genTrans(srcId) {
  const pool = sentencePool(srcId).filter(x => { const n = x.s.split(/\s+/).length; return n >= 6 && n <= 20; });
  if (!pool.length) return null;
  const it = pick(pool);
  const es = await translate(it.s);
  if (!es) return { type: 'trans', it, es: '', offline: true };
  return { type: 'trans', it, es };
}
function renderTransQ(q) {
  if (q.offline) { $('#view').innerHTML = `${exHeader()}<div class="notice bad" style="margin-top:14px">Este ejercicio necesita internet para preparar la frase en español. Comprueba la conexión y vuelve a intentarlo.</div><a class="btn block" href="#words">Volver</a>`; return; }
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

let DLG = null;
function stopDialogue() { if (DLG) { DLG.stop = true; DLG = null; } }
function renderSit(id) {
  const L = window.SITUATIONS || [];
  if (!id) {
    const row = s => `<a class="note" href="#sit/${s.id}" style="text-decoration:none;color:inherit"><div class="grow"><span class="term">${esc(s.title)}</span><div class="es">${esc(s.es)}</div></div><span class="muted">›</span></a>`;
    $('#view').innerHTML = `<div class="h1">Situaciones</div><p class="sub">Frases que de verdad se usan y diálogos para escuchar.</p>
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
    <div class="row wrap" style="margin-bottom:10px"><button class="btn primary grow" id="dlgPlay">${IC.play.replace('<svg', '<svg width="16" height="16"')} Escuchar diálogo</button><button class="btn grow" id="dlgHide">Escuchar sin texto</button></div>
    <div class="card pad dialogue" id="dlg">${s.dialogue.map((d, k) => `<div class="dl ${d[0] === 'Iker' ? 'me' : ''}" data-k="${k}"><span class="who">${esc(d[0])}</span><span class="line">${esc(d[1])}</span></div>`).join('')}</div>
    <div id="dlgHint" class="muted" style="font-size:14px;margin-top:8px"></div></div>
    ${s.pack ? `<div class="row wrap" style="margin-top:14px"><a class="btn grow" href="#packs">Más packs</a></div>` : ''}`;
  $('#view').onclick = e => { const n = e.target.closest('.note[data-say]'); if (n) { TTS.speak(n.dataset.say); return; } const l = e.target.closest('.dl'); if (l && !DLG) TTS.speak(s.dialogue[+l.dataset.k][1]); };
  $('#savePh').onclick = () => { const have = new Set(NOTES.map(n => norm(n.term))); let c = 0; s.phrases.forEach(p => { if (have.has(norm(p[0]))) return; NOTES.unshift({ id: uid(), term: p[0], cat: s.legal ? 'legal' : 'convo', es: p[1], ex: '', def: '', note: '', src: s.title, created: Date.now(), srs: newSrs() }); c++; }); saveNotes(); toast(c ? c + ' frases guardadas' : 'Ya las tenías'); };
  const lines = $$('#dlg .dl');
  const hl = k => lines.forEach((el, j) => el.classList.toggle('on', j === k));
  const playFrom = (k, role) => {
    const me = DLG; if (!me || me.stop) return;
    if (k >= s.dialogue.length) { hl(-1); lines.forEach(el => el.classList.remove('hide')); $('#dlgHint').textContent = ''; DLG = null; return; }
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
  $('#dlgHide').onclick = () => { stopDialogue(); TTS.stop(); lines.forEach(el => el.classList.add('hide')); DLG = {}; playFrom(0, false); };
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

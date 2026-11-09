'use strict';
/* ==========================================================
   APRENDER DE VERDAD
   · traducción con contexto (y alternativas por significado)
   · ficha automática: traducción, definición y ejemplo
   · «Aprender a fondo»: cada palabra pasa por 5 pasos
     (ver → reconocer → contexto → oído → escribirla)
   · «Tu propia frase»: usar la palabra en una frase tuya
   · IA opcional (clave de Anthropic guardada solo en el móvil)
   ========================================================== */

/* ---------- utilidades ---------- */
const deacc = s => String(s || '').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().trim();
const POS_ES = { noun: 'sustantivo', verb: 'verbo', adjective: 'adjetivo', adverb: 'adverbio', preposition: 'preposición', pronoun: 'pronombre', conjunction: 'conjunción', interjection: 'interjección', phrase: 'expresión', abbreviation: 'abreviatura', 'auxiliary verb': 'verbo auxiliar', article: 'artículo', prefix: 'prefijo', suffix: 'sufijo', particle: 'partícula' };
function levenshtein(a, b) {
  a = deacc(a); b = deacc(b); if (a === b) return 0;
  const m = a.length, n = b.length; if (!m || !n) return m || n;
  let prev = Array.from({ length: n + 1 }, (_, j) => j);
  for (let i = 1; i <= m; i++) { const cur = [i]; for (let j = 1; j <= n; j++) cur[j] = Math.min(prev[j] + 1, cur[j - 1] + 1, prev[j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1)); prev = cur; }
  return prev[n];
}
/* compara lo que ha escrito con la respuesta: 'ok' | 'typo' | 'ko' */
function checkTyped(said, target) {
  const clean = s => deacc(String(s || '').replace(/\(.*?\)/g, ' ').split('/')[0]).replace(/[’]/g, "'").replace(/[^a-z' -]/g, ' ').replace(/\s+/g, ' ').trim();
  const strip = s => s.replace(/^to /, '').replace(/\b(sb|sth|someone|something|somebody|one's|oneself)\b/g, ' ').replace(/\s+/g, ' ').trim();
  const a = strip(clean(said)), b = strip(clean(target));
  if (!a) return 'ko';
  if (a === b) return 'ok';
  const d = levenshtein(a, b);
  if (d <= Math.max(1, Math.floor(b.length / 7))) return 'typo';
  return 'ko';
}
function hintOf(term, level) { // «r___ o__» → muestra las primeras letras
  const t = String(term).replace(/\(.*?\)/g, '').split('/')[0].trim();
  return t.split(' ').map(w => w.length <= 2 ? w : w.slice(0, level) + '·'.repeat(Math.max(1, w.length - level))).join(' ');
}

/* ---------- IA opcional ---------- */
const AI = {
  key: () => store.get('aikey', ''),
  model: () => store.get('aimodel', '') || 'claude-haiku-4-5',
  async call(prompt, max = 700) {
    const r = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: { 'content-type': 'application/json', 'x-api-key': AI.key(), 'anthropic-version': '2023-06-01', 'anthropic-dangerous-direct-browser-access': 'true' },
      body: JSON.stringify({ model: AI.model(), max_tokens: max, messages: [{ role: 'user', content: prompt }] })
    });
    let j = null; try { j = await r.json(); } catch (e) { }
    if (!r.ok) throw new Error((j && j.error && j.error.message) || ('Error ' + r.status));
    return ((j && j.content) || []).map(c => c.text || '').join('');
  },
  async json(prompt, max) { const t = await AI.call(prompt, max); const m = t.match(/\{[\s\S]*\}/); if (!m) throw new Error('Respuesta sin JSON'); return JSON.parse(m[0]); }
};
async function aiLookup(term, sent) {
  const o = await AI.json(`Eres un lexicógrafo bilingüe inglés–español (español de España) que prepara fichas para un estudiante español de Derecho de nivel avanzado.
Término en inglés: «${term}»
${sent ? `Frase donde lo ha encontrado: «${sent}»` : 'No hay frase de contexto: elige el significado más habitual.'}

Devuelve SOLO un objeto JSON con estas claves:
"es": la traducción que diría de verdad un hablante nativo de España para ESTE significado${sent ? ' en ESTA frase' : ''}. Nada de calcos ni traducciones literales palabra por palabra: si es un phrasal verb, una expresión o un modismo, da su equivalente natural (o un modismo español equivalente). Verbos en infinitivo, sustantivos y adjetivos en su forma base, salvo que sea una expresión fija.
"ctx": ${sent ? 'cómo quedaría traducido exactamente en esa frase (puede estar conjugado), en pocas palabras' : '""'}
"alts": hasta 3 traducciones naturales para OTROS significados frecuentes (array de strings; vacío si no hay)
"pos": categoría gramatical en español (verbo, sustantivo, phrasal verb, expresión…)
"def": definición breve en inglés, de diccionario para estudiantes, de este significado
"ex": una frase de ejemplo NUEVA, natural, en inglés británico, con este mismo significado (no repitas la frase de contexto)
"exEs": su traducción natural al español
"note": una nota breve en español sobre registro o uso (formal, coloquial, británico, falso amigo…) o "" si no hace falta`, 600);
  return { best: o.es || '', ctx: o.ctx || '', alts: (o.alts || []).length ? [{ pos: 'otros significados', words: o.alts.map(w => ({ w })) }] : [], pos: o.pos || '', def: o.def || '', ex: o.ex || '', exEs: o.exEs || '', note: o.note || '', ai: true };
}

/* ---------- traducción con contexto (gratis) ---------- */
async function gtx(q, extra = '') {
  const r = await fetch('https://translate.googleapis.com/translate_a/single?client=gtx&sl=en&tl=es&hl=es&dt=t' + extra + '&q=' + encodeURIComponent(String(q).slice(0, 1500)));
  if (!r.ok) throw new Error('gtx ' + r.status);
  return r.json();
}
const gtxText = j => ((j && j[0]) || []).map(x => (x && x[0]) || '').join('');
function gtxDict(j) {
  const out = [];
  (Array.isArray(j && j[1]) ? j[1] : []).forEach(e => {
    if (!Array.isArray(e) || typeof e[0] !== 'string') return;
    let words = [];
    if (Array.isArray(e[2])) words = e[2].filter(x => Array.isArray(x) && typeof x[0] === 'string').map(x => ({ w: x[0], back: Array.isArray(x[1]) ? x[1].slice(0, 4) : [], sc: typeof x[3] === 'number' ? x[3] : 0 }));
    else if (Array.isArray(e[1])) words = e[1].filter(x => typeof x === 'string').map(w => ({ w, back: [], sc: 0 }));
    words.sort((a, b) => b.sc - a.sc);
    if (words.length) out.push({ pos: POS_ES[e[0]] || e[0], words: words.slice(0, 6) });
  });
  return out;
}
/* pone el término entre corchetes dentro de la frase para que el traductor nos diga cómo lo ha traducido ahí */
function markTerm(sent, term) {
  if (!sent || !term) return '';
  const i = sent.toLowerCase().indexOf(String(term).toLowerCase());
  if (i >= 0) return sent.slice(0, i) + '[' + sent.slice(i, i + term.length) + ']' + sent.slice(i + term.length);
  const re = typeof termRegex === 'function' ? termRegex(term) : null; const m = re && sent.match(re);
  if (m) return sent.slice(0, m.index) + '[' + m[0] + ']' + sent.slice(m.index + m[0].length);
  return '';
}
const ART_ES = /^(el|la|los|las|un|una|unos|unas|lo|al|del|se|que|de)\s+/;
function chooseBest(r) {
  const all = r.alts.flatMap(a => a.words.map(w => w.w));
  const c = deacc(r.ctx).replace(ART_ES, '');
  if (c && c.split(' ').length <= 7) {
    const hit = all.find(w => { const d = deacc(w).replace(ART_ES, ''); if (d === c) return true; const k = Math.min(5, d.length - 1, c.length - 1); return k >= 3 && d.slice(0, k) === c.slice(0, k); });
    return hit || r.ctx;
  }
  return all[0] || r.plain || '';
}
let SMC = store.get('smc', {});
async function smartLookup(term, sent, marked) {
  term = String(term || '').trim(); if (!term) return null;
  sent = String(sent || '').trim();
  const ck = norm(term) + '|' + norm(sent).slice(0, 140) + (AI.key() ? '|ai' : '');
  if (SMC[ck]) return SMC[ck];
  let res = { term, best: '', ctx: '', sentTr: '', alts: [], plain: '', def: '', ex: '', exEs: '', note: '', ai: false };
  if (AI.key()) { try { Object.assign(res, await aiLookup(term, sent)); } catch (e) { res.aiErr = e.message; } }
  if (!res.ai) {
    if (sent && !marked) marked = markTerm(sent, term);
    await Promise.all([
      gtx(term, '&dt=bd').then(j => { res.alts = gtxDict(j); res.plain = gtxText(j); }).catch(() => { }),
      marked ? gtx(marked).then(j => { const t = gtxText(j); const m = t.match(/\[\s*([^\[\]]{1,90}?)\s*\]/); res.ctx = m ? m[1].replace(/^["«“]|["»”]$/g, '').trim() : ''; res.sentTr = t.replace(/[\[\]]/g, ''); }).catch(() => { }) : null
    ]);
    if (!res.alts.length && termWords(term).length === 1) { const s = stem(term); if (s && s !== norm(term)) { try { res.alts = gtxDict(await gtx(s, '&dt=bd')); } catch (e) { } } }
    res.best = chooseBest(res);
    if (!res.best) res.best = await translate(term);
  }
  if (res.best) {
    SMC[ck] = res; const ks = Object.keys(SMC); if (ks.length > 1500) ks.slice(0, 500).forEach(k => delete SMC[k]);
    store.set('smc', SMC);
  }
  return res;
}

/* ejemplos reales sacados de los textos de la app */
function poolExamples(term, n = 3) {
  try { return moreExamples({ term, ex: '' }, n).map(p => p.s); } catch (e) { return []; }
}

/* caja de traducción para el panel de palabra del lector y el editor de fichas */
function smartBoxHTML(r, chosen) {
  if (!r) return '';
  const alts = [];
  const seen = new Set([deacc(chosen || r.best)]);
  r.alts.forEach(a => { const ws = a.words.filter(w => { const k = deacc(w.w); if (seen.has(k)) return false; seen.add(k); return true; }).slice(0, 5); if (ws.length) alts.push({ pos: a.pos, ws }); });
  return `${r.ctx && deacc(r.ctx) !== deacc(chosen || r.best) ? `<div class="muted" style="font-size:14px;margin-top:4px">En esta frase · «${esc(r.ctx)}»</div>` : ''}
    ${r.note ? `<div style="font-size:14px;margin-top:6px">💡 ${esc(r.note)}</div>` : ''}
    ${alts.length ? `<div class="muted" style="font-size:12px;font-weight:700;margin-top:10px">OTROS SIGNIFICADOS · toca uno para usarlo en la tarjeta</div>${alts.map(a => `<div class="trow"><span class="pos">${esc(a.pos)}</span>${a.ws.map(w => `<button type="button" class="chip trchip" data-tr="${esc(w.w)}" ${w.back && w.back.length ? `title="${esc(w.back.join(', '))}"` : ''}>${esc(w.w)}</button>`).join('')}</div>`).join('')}` : ''}
    ${r.sentTr ? `<details style="margin-top:8px"><summary class="muted" style="font-size:13px">Ver la frase traducida</summary><div class="muted" style="font-size:14px;margin-top:4px">${esc(r.sentTr)}</div></details>` : ''}
    ${r.aiErr ? `<div class="meta" style="margin-top:6px">IA no disponible (${esc(r.aiErr)}); traducción automática normal.</div>` : ''}`;
}

/* ==========================================================
   APRENDER A FONDO
   ========================================================== */
const LADDER = [
  { k: 'see', name: 'Conócela' },
  { k: 'rec', name: 'Reconócela' },
  { k: 'ctx', name: 'En contexto' },
  { k: 'ear', name: 'De oído' },
  { k: 'prod', name: 'Escríbela tú' }
];
function learnSource(arg) {
  arg = arg || 'new';
  if (arg === 'new') { const left = Math.max(0, S.newPerDay - (today().newLib || 0)); return nextNewItems(Math.min(6, left || 5)); }
  if (arg === 'mine') {
    const fresh = NOTES.filter(n => n.es && (isNew(n) || ((n.srs.reps || 0) <= 1)));
    return fresh.sort((a, b) => (b.created || 0) - (a.created || 0)).slice(0, 6);
  }
  if (arg === 'hard') {
    const all = NOTES.concat(LIB.filter(x => x.srs)).filter(x => x.es && ((x.srs && (x.srs.lapses || 0) >= 2) || mark(x.id).hard || mark(x.id).st === 'unknown'));
    return shuffle(all).slice(0, 6);
  }
  if (arg === 'today') { const t0 = new Date().setHours(0, 0, 0, 0); return LIB.filter(x => x.srs && (x.srs.added || 0) >= t0 && !x.srs.known).concat(NOTES.filter(n => (n.created || 0) >= t0)).filter(x => x.es).slice(0, 8); }
  if (isSetKey(arg)) return shuffle(setFromArg(arg).filter(x => x.es)).slice(0, 6);
  return [];
}
function distractors(x, field, n = 3) {
  const pool = LIB.concat(NOTES).filter(y => y !== x && y[field] && norm(y[field]) !== norm(x[field]) && norm(y.term) !== norm(x.term));
  const same = pool.filter(y => y.cat === x.cat);
  return shuffle(same.length >= n * 4 ? same : pool).slice(0, n).map(y => y[field]);
}
function blankIn(sent, term) {
  const re = typeof termRegex === 'function' ? termRegex(term) : null; const m = re && sent && sent.match(re);
  if (!m) return null;
  return { html: esc(sent.slice(0, m.index)) + '<span class="gap">?</span>' + esc(sent.slice(m.index + m[0].length)), said: m[0] };
}
let LRN = null;
function startLearn(arg) {
  const items = learnSource(arg).filter(x => x.term && x.es);
  if (!items.length) {
    $('#view').innerHTML = emptyBox(arg === 'mine' ? 'No tienes palabras tuyas nuevas pendientes. Guarda palabras mientras lees y vuelve aquí.' : arg === 'hard' ? 'No tienes palabras difíciles ahora mismo. ¡Bien!' : 'No hay palabras nuevas pendientes para hoy.', '#words', 'Volver'); return;
  }
  LRN = { arg, items: items.map(x => ({ x, st: 0, err: 0, ex: x.ex || poolExamples(x.term, 1)[0] || '' })), queue: [], done: 0, t0: Date.now() };
  LRN.queue = LRN.items.slice();               // primero se presentan todas
  learnNext();
}
function learnNext() {
  if (!LRN) return;
  const left = LRN.items.filter(it => it.st < LADDER.length);
  if (!left.length) return learnEnd();
  let it = LRN.queue.shift();
  while (it && it.st >= LADDER.length) it = LRN.queue.shift();
  if (!it) { LRN.queue = shuffle(left); it = LRN.queue.shift(); }
  LRN.cur = it;
  const doneSteps = LRN.items.reduce((a, b) => a + Math.min(b.st, LADDER.length), 0);
  const total = LRN.items.length * LADDER.length;
  const head = `<div class="row" style="margin-bottom:8px"><b class="grow">Aprender a fondo</b><span class="muted">${LADDER[it.st].name}</span></div><div class="progressbar"><i style="width:${doneSteps / total * 100}%"></i></div>
    <div class="ladder">${LADDER.map((s, i) => `<span class="${i < it.st ? 'ok' : i === it.st ? 'cur' : ''}"></span>`).join('')}</div>`;
  ({ see: lSee, rec: lRec, ctx: lCtx, ear: lEar, prod: lProd })[LADDER[it.st].k](it, head);
}
function learnAdvance(ok, soft) {
  const it = LRN.cur;
  if (ok) it.st++; else { it.err++; if (!soft && it.st > 1) it.st--; }
  const gap = ok ? Math.min(LRN.queue.length, 2 + Math.floor(Math.random() * 2)) : Math.min(LRN.queue.length, 1);
  if (it.st < LADDER.length) LRN.queue.splice(gap, 0, it);
  learnNext();
}
function lFeedback(ok, html, onNext, label) {
  const fb = document.createElement('div');
  fb.innerHTML = `<div class="feedback ${ok === true ? 'ok' : ok === 'meh' ? 'meh' : 'ko'}"><b>${ok === true ? '¡Bien!' : ok === 'meh' ? 'Casi: cuidado con cómo se escribe' : 'Fíjate bien'}</b>${html || ''}</div><button class="btn primary block" id="lNext" style="margin-top:12px">${label || 'Siguiente'}</button>`;
  $('#qArea').appendChild(fb); bump('ex'); if (ok === true) bump('ok');
  $('#lNext').onclick = onNext; $('#lNext').focus();
  fb.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}
const fullCard = it => `<div style="margin-top:6px"><b>${esc(it.x.term)}</b> · ${esc(it.x.es)}</div>${it.x.def ? `<div class="muted" style="font-size:14px">${esc(it.x.def)}</div>` : ''}${it.ex ? `<div class="ctx muted" style="margin-top:4px">${esc(it.ex)}</div>` : ''}`;
function lSee(it, head) {
  const x = it.x; const more = poolExamples(x.term, 3).filter(s => norm(s) !== norm(it.ex)).slice(0, 2);
  $('#view').innerHTML = `${head}<div id="qArea"><div class="card flash" style="margin-top:12px;min-height:280px"><span class="tag">${esc(CATS[x.cat] || NOTE_CATS[x.cat] || '')}</span>
    <div class="term" style="margin-top:12px">${esc(x.term)}</div><button class="mini" id="lSay" style="margin-top:8px">${IC.speak}</button>
    <div style="margin-top:12px;font-size:19px;font-weight:700">${esc(x.es)}</div>${x.def ? `<div class="muted" style="margin-top:6px;font-size:15px">${esc(x.def)}</div>` : ''}
    ${it.ex ? `<div class="ctx" data-say="${esc(it.ex)}" style="margin-top:12px;font-style:italic">${esc(it.ex)}</div>` : ''}${more.map(s => `<div class="ctx muted" data-say="${esc(s)}" style="margin-top:6px;font-size:15px">${esc(s)}</div>`).join('')}
    ${x.note ? `<div class="muted" style="margin-top:8px;font-size:14px">📝 ${esc(x.note)}</div>` : ''}</div>
    <p class="meta" style="text-align:center">Léela en voz alta y fíjate en la frase: así es como la usan los nativos.</p>
    <button class="btn primary block" id="lOk">Entendido</button></div>`;
  TTS.speak(x.term, { rate: 0.9 });
  $('#lSay').onclick = () => TTS.speak(x.term, { rate: 0.9 });
  $('#qArea').onclick = e => { const s = e.target.closest('[data-say]'); if (s) TTS.speak(s.dataset.say); };
  $('#lOk').onclick = () => learnAdvance(true);
}
function lRec(it, head) {
  const x = it.x; const opts = shuffle([x.es].concat(distractors(x, 'es')));
  $('#view').innerHTML = `${head}<div id="qArea"><p class="muted" style="margin:16px 0 0">¿Qué significa?</p><div class="row"><div class="q grow">${esc(x.term)}</div><button class="mini" id="lSay">${IC.speak}</button></div>
    <div class="opts">${opts.map(o => `<button class="opt" data-o="${esc(o)}">${esc(o)}</button>`).join('')}</div></div>`;
  $('#lSay').onclick = () => TTS.speak(x.term, { rate: 0.9 });
  $$('.opt').forEach(b => b.onclick = () => {
    if ($('.opt.right')) return; const ok = b.dataset.o === x.es;
    $$('.opt').forEach(o => { if (o.dataset.o === x.es) o.classList.add('right'); }); if (!ok) b.classList.add('wrong');
    lFeedback(ok, fullCard(it), () => learnAdvance(ok, true));
  });
}
function lCtx(it, head) {
  const x = it.x; const bl = blankIn(it.ex, x.term);
  const opts = shuffle([x.term].concat(distractors(x, 'term')));
  $('#view').innerHTML = `${head}<div id="qArea"><p class="muted" style="margin:16px 0 6px">${bl ? '¿Qué falta en la frase?' : '¿Qué palabra o expresión es?'}</p>
    <div class="card pad"><div class="q" style="margin:0;font-weight:500;font-size:19px;line-height:1.5">${bl ? bl.html : esc(x.def || x.es)}</div>${bl ? `<div class="meta" style="margin-top:6px">${esc(x.es)}</div>` : ''}</div>
    <div class="opts">${opts.map(o => `<button class="opt" data-o="${esc(o)}">${esc(o)}</button>`).join('')}</div></div>`;
  $$('.opt').forEach(b => b.onclick = () => {
    if ($('.opt.right')) return; const ok = b.dataset.o === x.term;
    $$('.opt').forEach(o => { if (o.dataset.o === x.term) o.classList.add('right'); }); if (!ok) b.classList.add('wrong');
    if (it.ex) TTS.speak(it.ex);
    lFeedback(ok, fullCard(it), () => learnAdvance(ok, true));
  });
}
function typedQ(it, head, prompt, sub, target, onDone) {
  let hint = 0;
  $('#view').innerHTML = `${head}<div id="qArea">${prompt}
    <form class="row" id="lF" style="margin-top:12px"><input class="input grow" id="lIn" placeholder="Escríbelo en inglés" autocapitalize="off" autocomplete="off" spellcheck="false"><button class="btn primary">OK</button></form>
    <div class="row" style="margin-top:8px;gap:8px"><button class="btn ghost small" id="lHint" type="button">Pista</button><button class="btn ghost small" id="lGive" type="button">No me sale</button>${sub || ''}</div><div id="lHintOut" class="muted" style="margin-top:6px;font-size:17px;letter-spacing:1px"></div></div>`;
  setTimeout(() => $('#lIn') && $('#lIn').focus(), 80);
  $('#lHint').onclick = () => { hint++; $('#lHintOut').textContent = hintOf(target, hint); };
  const fin = said => {
    if ($('.feedback')) return;
    const r = checkTyped(said, target); const ok = r === 'ok' && hint === 0 ? true : r === 'ko' ? false : 'meh';
    onDone(ok, said);
  };
  $('#lF').onsubmit = e => { e.preventDefault(); const v = $('#lIn').value.trim(); if (v) fin(v); };
  $('#lGive').onclick = () => fin('');
}
function lEar(it, head) {
  const x = it.x; const target = x.term.replace(/\(.*?\)/g, '').split('/')[0].trim();
  typedQ(it, head, `<p class="muted" style="margin:16px 0 6px">Escucha y escribe lo que oyes</p><div class="card flash" style="min-height:120px"><button class="btn primary" id="lPlay">${ico('speak', 18)} Escuchar</button><button class="btn ghost small" id="lSlow" style="margin-top:8px">🐢 Más despacio</button></div>`, '', target, (ok, said) => {
    lFeedback(ok, `${said ? `<div style="margin-top:4px">Has escrito · «${esc(said)}»</div>` : ''}${fullCard(it)}`, () => learnAdvance(ok !== false, true));
  });
  const play = r => TTS.speak(target, { rate: r }); play(0.85);
  $('#lPlay').onclick = () => play(0.85); $('#lSlow').onclick = () => play(0.6);
}
function lProd(it, head) {
  const x = it.x; const target = x.term;
  const bl = it.ex ? blankIn(it.ex, x.term) : null;
  typedQ(it, head, `<p class="muted" style="margin:16px 0 6px">¿Cómo se dice en inglés?</p><div class="card flash" style="min-height:140px"><div class="term" style="font-size:24px">${esc(x.es)}</div>${bl ? `<div class="ctx muted" style="margin-top:10px;font-size:15px">${bl.html}</div>` : x.def ? `<div class="muted" style="margin-top:8px;font-size:14px">${esc(x.def)}</div>` : ''}</div>`, '', target, (ok, said) => {
    TTS.speak(x.term, { rate: 0.9 });
    lFeedback(ok, `${said ? `<div style="margin-top:4px">Has escrito · «${esc(said)}»</div>` : ''}${fullCard(it)}`, () => learnAdvance(ok !== false, false));
  });
}
function learnEnd() {
  const L = LRN; if (!L) return;
  L.items.forEach(it => {
    const x = it.x; const g = it.err === 0 ? 2 : it.err <= 2 ? 1 : 0;
    if (x.lib) { const was = !x.srs; if (was) { startLearning(x); bump('newLib'); } fsrsApply(x.srs, g); }
    else { if (!x.srs) x.srs = newSrs(); if (isNew(x)) { const t = today(); t.newSeen = (t.newSeen || 0) + 1; saveStats(); } fsrsApply(x.srs, g); }
    if (it.err >= 3) setMark(x.id, { hard: true });
  });
  saveLearn(); saveNotes();
  const mins = Math.max(1, Math.round((Date.now() - L.t0) / 60000));
  $('#view').innerHTML = `<div class="card pad" style="text-align:center;padding:28px 18px"><div style="font-size:42px">🧠</div><b>${L.items.length} ${L.items.length === 1 ? 'palabra aprendida' : 'palabras aprendidas'} a fondo</b>
    <p class="muted">${mins} min · ${L.items.filter(i => !i.err).length} sin ningún fallo. Vuelven en tus repasos justo antes de que se te olviden.</p>
    <div class="card" style="text-align:left;margin:12px 0">${L.items.map(it => `<div class="note"><div class="grow"><span class="term">${esc(it.x.term)}</span><div class="es" style="display:block">${esc(it.x.es)}</div></div>${it.err ? `<span class="tag warm">${it.err} ${it.err === 1 ? 'fallo' : 'fallos'}</span>` : '<span class="tag good">✓</span>'}</div>`).join('')}</div>
    <button class="btn primary block" id="lOwn">Último paso: escribe una frase tuya con cada una</button>
    <a class="btn block" href="#learn/${esc(L.arg)}" style="margin-top:8px">Otras ${L.items.length} más</a>
    <a class="btn ghost block" href="${HOME_SESSION ? '#home' : '#words'}" style="margin-top:8px">${HOME_SESSION ? 'Volver a mi sesión' : 'Volver'}</a></div>`;
  const ids = L.items.map(i => i.x.id);
  $('#lOwn').onclick = () => { OWN_QUEUE = ids.slice(); go('#ex/own'); };
  if (typeof sessionStepDone === 'function') sessionStepDone('new');
  LRN = null;
}
addRoute('learn', startLearn, 'words', 'Aprender a fondo');

/* ==========================================================
   TU PROPIA FRASE (el paso que más fija una palabra)
   ========================================================== */
let OWN_QUEUE = null;
EXTRA_TITLES.own = 'Tu propia frase';
EXTRA_GENS.own = arg => {
  let x = null;
  if (OWN_QUEUE && OWN_QUEUE.length) { x = itemById(OWN_QUEUE.shift()); if (SESSION && SESSION.n === 0) SESSION.total = Math.min(SESSION.total, OWN_QUEUE.length + 1); }
  if (!x) {
    const pool = (isSetKey(arg) ? setFromArg(arg) : NOTES.concat(LIB.filter(y => y.srs && !y.srs.known))).filter(y => y.es && y.term && termWords(y.term).length <= 6);
    const weak = pool.filter(y => y.srs && ((y.srs.lapses || 0) >= 1 || (y.srs.S || 0) < 10));
    x = pick(weak.length >= 3 ? weak : pool);
  }
  return x ? { type: 'own', x } : null;
};
function ownSentences(x) { return (x.srs && x.srs.own) || []; }
function saveOwnSentence(x, s) {
  if (!x.srs) { if (x.lib) startLearning(x); else x.srs = newSrs(); }
  x.srs.own = ownSentences(x).concat(s).slice(-5); x.srs.upd = Date.now();
  if (!x.lib) { x.exs = [x.exs, s].filter(Boolean).join('\n'); x.upd = Date.now(); saveNotes(); } else saveLearn();
}
EXTRA_RENDER.own = q => {
  const x = q.x; const prev = ownSentences(x);
  $('#view').innerHTML = `${exHeader()}<div id="qArea"><p class="muted" style="margin:16px 0 6px">Escribe una frase tuya, sobre tu vida, con esta palabra o expresión</p>
    <div class="card pad"><div class="row"><b class="grow" style="font-family:var(--serif);font-size:22px">${esc(x.term)}</b><button class="mini" id="oSay">${IC.speak}</button></div><div class="es" style="display:block">${esc(x.es)}</div>${x.ex ? `<div class="ex">${esc(x.ex)}</div>` : ''}</div>
    ${prev.length ? `<div class="meta" style="margin-top:8px">Tus frases anteriores: ${prev.map(esc).join(' · ')}</div>` : ''}
    <textarea class="textarea" id="oIn" style="margin-top:12px" autocapitalize="sentences" placeholder="Por ejemplo, algo que te pasó ayer o que vas a hacer…"></textarea>
    <button class="btn primary block" id="oCheck" style="margin-top:10px">${AI.key() ? 'Corregir y guardar' : 'Guardar mi frase'}</button></div>`;
  $('#oSay').onclick = () => TTS.speak(x.term, { rate: 0.9 });
  setTimeout(() => $('#oIn') && $('#oIn').focus(), 80);
  $('#oCheck').onclick = async () => {
    if ($('.feedback')) return;
    const s = $('#oIn').value.trim(); if (!s) return;
    const re = typeof termRegex === 'function' ? termRegex(x.term) : null; const uses = !re || re.test(s);
    q.it = { s, src: 'Tu frase' };
    if (AI.key()) {
      $('#oCheck').disabled = true; $('#oCheck').textContent = 'Corrigiendo…';
      try {
        const o = await AI.json(`Un estudiante español avanzado de inglés ha escrito esta frase para practicar «${x.term}» (${x.es}${x.def ? ', ' + x.def : ''}):
«${s}»
Devuelve SOLO JSON: {"ok": true si la frase es correcta y natural y usa bien el término, "fixed": la frase corregida y natural en inglés británico (igual si ya está bien), "why": explicación breve en español de los errores o de qué sonaría más natural ("" si está perfecta)}`, 400);
        saveOwnSentence(x, o.fixed || s);
        answered(!!o.ok, `${!o.ok ? `<div style="margin-top:6px">Mejor así:</div><div class="ctx" style="font-weight:600">${esc(o.fixed || s)}</div>` : ''}${o.why ? `<div class="muted" style="font-size:14px;margin-top:6px">${esc(o.why)}</div>` : ''}`);
        q.it.s = o.fixed || s; return;
      } catch (e) { toast('No se ha podido corregir con IA: ' + e.message); }
    }
    saveOwnSentence(x, s);
    answered(uses, uses ? `<div class="muted" style="font-size:14px;margin-top:6px">Guardada: te aparecerá en el reverso de la tarjeta. Léela en voz alta un par de veces.</div>` : `<div style="margin-top:6px">No encuentro «${esc(x.term)}» en tu frase. Asegúrate de usar la expresión completa.</div>`);
  };
};

/* ==========================================================
   AJUSTES DE IA
   ========================================================== */
function aiSettingsHTML() {
  return `<label class="lbl">Clave de API de Anthropic (opcional)</label>
    <div class="row"><input class="input grow" id="sAIK" type="password" value="${esc(AI.key())}" placeholder="sk-ant-…" autocomplete="off" autocapitalize="off" spellcheck="false"><button class="btn" id="sAIKt" type="button">Probar</button></div>
    <p class="meta" style="margin-top:6px">Sin clave, la app traduce cada palabra teniendo en cuenta la frase y te enseña los otros significados. Con clave, además, Claude te da la traducción que usaría un nativo, una definición, un ejemplo nuevo y una nota de uso, y corrige tus frases. La clave se guarda solo en este dispositivo (no se sincroniza) y cada consulta cuesta una fracción de céntimo; se saca en console.anthropic.com.</p>`;
}
function bindAISettings() {
  if (!$('#sAIK')) return;
  $('#sAIK').addEventListener('change', e => { store.set('aikey', e.target.value.trim()); SMC = {}; store.set('smc', {}); toast(e.target.value.trim() ? 'Clave guardada en este dispositivo' : 'Clave borrada'); });
  $('#sAIKt').onclick = async () => {
    store.set('aikey', $('#sAIK').value.trim()); if (!AI.key()) { toast('Pega primero la clave'); return; }
    $('#sAIKt').textContent = '…';
    try { const r = await aiLookup('to rule out', 'The police have not ruled out foul play.'); toast('Funciona · «rule out» = ' + r.best); } catch (e) { toast('No funciona: ' + e.message); }
    $('#sAIKt').textContent = 'Probar';
  };
}

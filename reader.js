'use strict';
/* ==========================================================
   LECTOR · palabras con colores según las conozcas (como LingQ),
   % conocido, traducción al tocar, audio frase a frase,
   modo escucha sin texto y progreso guardado
   ========================================================== */

/* ---------- estado de cada palabra ----------
   0 nueva · 1-4 aprendiendo · 5 conocida · -1 ignorada (nombres propios…) */
let WORDS = store.get('words', {});
let READS = store.get('reads', {});           // progreso de lectura por texto
let WVER = 0;
const saveWords = () => { WVER++; store.set('words', WORDS); };
const saveReads = () => store.set('reads', READS);
const FREQ_RANK = {}; (window.FREQ || []).forEach((w, i) => { if (FREQ_RANK[w] == null) FREQ_RANK[w] = i + 1; });

const WORD_RE = /[A-Za-zÀ-ÖØ-öø-ÿ]+(?:['’-][A-Za-zÀ-ÖØ-öø-ÿ]+)*/g;
function tokenize(text) { const out = []; let m; WORD_RE.lastIndex = 0; while ((m = WORD_RE.exec(text))) out.push({ w: m[0], s: m.index, e: m.index + m[0].length }); return out; }
function stem(w) {
  w = norm(w);
  if (w.length > 5 && w.endsWith('ies')) return w.slice(0, -3) + 'y';
  if (w.length > 5 && w.endsWith('ied')) return w.slice(0, -3) + 'y';
  if (w.length > 5 && w.endsWith('ing')) return w.slice(0, -3).replace(/(.)\1$/, '$1');
  if (w.length > 4 && w.endsWith('ed')) return w.slice(0, -2).replace(/(.)\1$/, '$1');
  if (w.length > 4 && w.endsWith('es')) return w.slice(0, -2);
  if (w.length > 3 && w.endsWith('s') && !w.endsWith('ss')) return w.slice(0, -1);
  return w;
}
function wordEq(a, b) {
  a = norm(a); b = norm(b); if (a === b) return true;
  const sa = stem(a), sb = stem(b);
  return sa.length > 2 && (sa === sb || sa === sb + 'e' || sb === sa + 'e' || sa.replace(/e$/, '') === sb.replace(/e$/, ''));
}
const FILLER = new Set(['a', 'an', 'the', 'something', 'somebody', 'someone', 'sth', 'sb', 'be', 'to', "one's", 'oneself']);
function termWords(term) { return norm(term).split(' ').filter(Boolean); }
const wkey = w => w.toLowerCase().replace(/[’]/g, "'").replace(/'s$/, '');
function variants(k) { const s = stem(k); return Array.from(new Set([k, s, s + 'e', k.replace(/s$/, ''), k.replace(/es$/, ''), k.replace(/'[a-z]+$/, '')])); }
function wstatus(w) {
  const k = wkey(w);
  if (WORDS[k] != null) return WORDS[k];
  const vs = variants(k);
  for (const v of vs) if (WORDS[v] != null && WORDS[v] !== 0) return WORDS[v];
  const kr = S.knownRank != null ? S.knownRank : 3000;
  if (kr) for (const v of vs) { const r = FREQ_RANK[v]; if (r && r <= kr) return 5; }
  if (k.length <= 2) return 5;
  return 0;
}
function setWord(w, st) { WORDS[wkey(w)] = st; saveWords(); }
function knownCount() {
  const kr = S.knownRank != null ? S.knownRank : 3000; let n = 0;
  const F = window.FREQ || [];
  for (let i = 0; i < Math.min(kr, F.length); i++) { const v = WORDS[F[i]]; if (v == null || v === 5) n++; }
  for (const k in WORDS) if (WORDS[k] === 5 && !(FREQ_RANK[k] && FREQ_RANK[k] <= kr)) n++;
  return n;
}
function learningCount() { let n = 0; for (const k in WORDS) if (WORDS[k] >= 1 && WORDS[k] <= 4) n++; return n; }
/* % de palabras conocidas de un texto (sin contar nombres propios) */
function knownPct(body) {
  let tot = 0, kn = 0;
  body.forEach(par => {
    tokenize(par).forEach((t, i) => {
      if (/^[A-Z]/.test(t.w) && i > 0 && !FREQ_RANK[t.w.toLowerCase()]) return;
      const st = wstatus(t.w); if (st === -1) return;
      tot++; if (st === 5) kn++;
    });
  });
  return tot ? Math.round(kn / tot * 100) : 100;
}
const wordCount = body => body.reduce((a, p) => a + (p.match(WORD_RE) || []).length, 0);
const readMin = body => Math.max(1, Math.round(wordCount(body) / 220));

/* ---------- traducción y diccionario ---------- */
const TRC = store.get('trc', {});
let trcN = 0;
async function translate(text) {
  text = String(text || '').trim(); if (!text) return '';
  const k = norm(text).slice(0, 300); if (TRC[k]) return TRC[k];
  let t = '';
  try {
    const r = await fetch('https://api.mymemory.translated.net/get?langpair=en|es&q=' + encodeURIComponent(text.slice(0, 480)));
    const j = await r.json(); t = j && j.responseData && j.responseData.translatedText || '';
    if (/MYMEMORY WARNING|QUERY LENGTH|INVALID|PLEASE SELECT/i.test(t) || (j && j.quotaFinished)) t = '';
  } catch (e) { t = ''; }
  if (!t) {
    try {
      const r = await fetch('https://translate.googleapis.com/translate_a/single?client=gtx&sl=en&tl=es&dt=t&q=' + encodeURIComponent(text.slice(0, 1500)));
      const j = await r.json(); t = (j[0] || []).map(x => x[0]).join('');
    } catch (e) { t = ''; }
  }
  if (t) { TRC[k] = t; if (++trcN % 5 === 0) { const keys = Object.keys(TRC); if (keys.length > 3000) keys.slice(0, 1000).forEach(x => delete TRC[x]); store.set('trc', TRC); } }
  return t;
}
window.addEventListener('pagehide', () => store.set('trc', TRC));
async function lookupDef(word) {
  const tries = [word.toLowerCase()]; const s = stem(word); if (s !== tries[0]) tries.push(s, s + 'e');
  for (const w of tries) {
    try { const r = await fetch('https://api.dictionaryapi.dev/api/v2/entries/en/' + encodeURIComponent(w)); if (r.ok) { const j = await r.json(); if (Array.isArray(j) && j.length) return j[0]; } }
    catch (e) { return null; }
  }
  return null;
}
function guessCat(term) { const w = termWords(term); if (w.length === 1) return 'vocab'; if (w.length <= 3 && PART_SET.has(w[1])) return 'phrasal'; return 'idiom'; }
const PART_SET = new Set(['up', 'out', 'off', 'down', 'in', 'on', 'over', 'away', 'back', 'through', 'into', 'about', 'around', 'across', 'along', 'forward', 'apart', 'aside']);

/* ---------- expresiones de la biblioteca dentro de un texto ---------- */
let PHR_INDEX = null;
function phraseIndex() {
  if (PHR_INDEX) return PHR_INDEX;
  const idx = {};
  LIB.concat(NOTES).forEach(x => {
    const tw = termWords(String(x.term).split('/')[0].replace(/\(.*?\)|…/g, ' ')).filter(w => !FILLER.has(w));
    if (tw.length < 2) return;
    const k = stem(tw[0]); (idx[k] = idx[k] || []).push({ x, tw });
  });
  return (PHR_INDEX = idx);
}
function findPhrases(tokens) {
  const idx = phraseIndex(); const hits = [];
  for (let i = 0; i < tokens.length; i++) {
    const cands = idx[stem(tokens[i].w)]; if (!cands) continue;
    for (const c of cands) {
      if (!wordEq(tokens[i].w, c.tw[0])) continue;
      let j = i, ok = true; const span = [i];
      for (let k = 1; k < c.tw.length; k++) {
        let found = false;
        for (let g = 1; g <= 3 && j + g < tokens.length; g++) if (wordEq(tokens[j + g].w, c.tw[k])) { j += g; span.push(j); found = true; break; }
        if (!found) { ok = false; break; }
      }
      if (ok && span[span.length - 1] - i <= c.tw.length + 3) hits.push({ x: c.x, span });
    }
  }
  return hits;
}

/* ==========================================================
   PANTALLA DEL LECTOR
   ========================================================== */
let ART = null;      // texto abierto: { t, paras:[{text,tokens,head}], sents:[{p,a,b,s}], phr:{}, start }
let RPLAY = null;    // reproducción { i, playing }
STOPPERS.push(() => { endReading(); RPLAY = null; });
document.addEventListener('visibilitychange', () => {
  if (!ART) return;
  if (document.hidden) { addReadTime(); ART.start = 0; } else ART.start = Date.now();
});
function addReadTime() { if (ART && ART.start) { const s = Math.min(1800, Math.round((Date.now() - ART.start) / 1000)); if (s > 3) bump('sec', s); ART.start = Date.now(); } }
function endReading() { if (!ART) return; addReadTime(); saveProgress(); ART = null; }
function saveProgress() {
  if (!ART || !ART.t) return;
  const r = READS[ART.t.id] || {};
  const max = document.documentElement.scrollHeight - innerHeight;
  const pct = max > 0 ? Math.min(100, Math.round(scrollY / max * 100)) : 100;
  READS[ART.t.id] = Object.assign(r, { title: ART.t.title, kind: ART.t.kind, src: ART.t.src, pct: Math.max(r.done ? 100 : 0, pct), y: scrollY, s: RPLAY ? RPLAY.i : (r.s || 0), upd: Date.now(), done: r.done || false });
  const keys = Object.keys(READS); if (keys.length > 400) keys.sort((a, b) => READS[a].upd - READS[b].upd).slice(0, 100).forEach(k => delete READS[k]);
  saveReads();
}

/* abre cualquier texto: id con prefijo de su fuente (o:, g:, w:, b:, m:) */
async function renderReader(id) {
  $('#view').innerHTML = '<div class="spinner"></div>';
  let t = null;
  try { t = await loadText(id); } catch (e) { t = { error: e.message }; }
  if (location.hash.slice(1).split('/')[0] !== 'r') return;
  if (t && t.error === 'nokey') { $('#view').innerHTML = gKeyBox(); bindGKey(() => renderReader(id)); return; }
  if (!t || t.error) { $('#view').innerHTML = `<div class="card pad empty">${esc((t && t.error) || 'No se ha podido abrir este texto.')}</div><a class="btn block" href="#read">Volver a Leer</a>`; return; }
  showText(t);
}
function paraTokens(text) { return tokenize(text); }
function showText(t) {
  const paras = t.body.map((text, i) => ({ text, tokens: paraTokens(text), head: t.heads && t.heads.has(i) }));
  const sents = [];
  paras.forEach((p, pi) => { if (p.head) { sents.push({ p: pi, a: 0, b: p.text.length, s: p.text }); return; } splitSentences(p.text).forEach(x => sents.push({ p: pi, a: x.a, b: x.b, s: x.s })); });
  ART = { t, paras, sents, start: Date.now() };
  registerTextPool(t, sents);
  const prog = READS[t.id];
  const words = wordCount(t.body);
  const pct = knownPct(t.body);
  $('#view').innerHTML = `
    <div class="art-top"><span class="tag ${t.topic === 'law' ? 'warm' : ''}">${esc(t.kind || 'Texto')}</span><span class="meta">${esc(t.srcName || '')}${t.srcName ? ' · ' : ''}${fmtNum(words)} palabras · ${readMin(t.body)} min</span><span class="grow"></span>${t.editable ? `<button class="mini" id="txEdit">${IC.pen}</button>` : ''}${t.url ? `<a class="mini" href="${esc(t.url)}" target="_blank" rel="noopener" aria-label="Original">${IC.ext}</a>` : ''}</div>
    <h1 class="art-title">${esc(t.title)}</h1>
    ${t.sub ? `<p class="art-stand">${esc(t.sub)}</p>` : ''}
    ${t.byline ? `<p class="meta" style="margin:-4px 0 10px">${esc(t.byline)}${t.date ? ' · ' + esc(t.date) : ''}</p>` : ''}
    <div class="kpct"><div class="kbar"><i style="width:${pct}%"></i></div><span id="kpctTxt">Conoces el ${pct}% de las palabras</span></div>
    <div class="player sticky" id="rPlayer">
      <button class="iconbtn" id="pPrev" aria-label="Frase anterior">${IC.prev}</button>
      <button class="iconbtn main" id="pPlay" aria-label="Escuchar">${IC.play}</button>
      <button class="iconbtn" id="pNext" aria-label="Frase siguiente">${IC.next}</button>
      <div class="label grow" id="pLabel">Escuchar</div>
      <button class="btn small" id="pRate">${S.rate}×</button>
    </div>
    <div class="seg rmode" id="rMode"><button data-m="read" class="on">Leer</button><button data-m="sent">Frase a frase</button><button data-m="hide">Sin texto</button></div>
    <div id="sentBar" class="sentbar hidden"></div>
    <div class="art-body ${S.colorWords === false ? 'nocolor' : ''}" id="artBody">${paras.map((p, i) => p.head ? `<h3 data-pi="${i}">${paraHTML(p, i)}</h3>` : `<p data-pi="${i}">${paraHTML(p, i)}</p>`).join('')}</div>
    ${t.credit ? `<p class="meta" style="margin-top:14px">${t.credit}</p>` : ''}
    <div class="art-end">
      <button class="btn primary block" id="doneBtn">${prog && prog.done ? '✓ Ya lo has terminado' : 'He terminado ✓'}</button>
      <p class="meta" style="text-align:center;margin:6px 0 0">${S.autoKnown ? 'Al terminar, las palabras azules que no hayas tocado pasan a «conocidas».' : ''}</p>
      ${t.next ? `<a class="btn block" href="${t.next.href}" style="margin-top:8px">${esc(t.next.label)} ›</a>` : ''}
      <div class="h2">Practica con este texto</div>
      <div class="row wrap"><a class="btn grow" href="#ex/gap/${encodeURIComponent(t.id)}">Huecos</a><a class="btn grow" href="#ex/dict/${encodeURIComponent(t.id)}">Dictado</a><a class="btn grow" href="#ex/order/${encodeURIComponent(t.id)}">Ordena</a><a class="btn grow" href="#ex/cloze/${encodeURIComponent(t.id)}">Palabra que falta</a></div>
      ${t.more ? `<div class="h2">Más como este</div>${t.more}` : ''}
    </div>`;
  paintStatuses();
  paintPhrases();
  bindReader();
  if (prog && prog.y && !prog.done) setTimeout(() => window.scrollTo(0, prog.y), 60);
}
function paraHTML(p, pi) {
  let h = '', last = 0;
  p.tokens.forEach((t, ti) => { h += esc(p.text.slice(last, t.s)) + `<span class="w" data-p="${pi}" data-t="${ti}">${esc(t.w)}</span>`; last = t.e; });
  return h + esc(p.text.slice(last));
}
function paintStatuses() {
  if (!ART) return;
  $$('#artBody .w').forEach(el => {
    const p = ART.paras[+el.dataset.p]; const ti = +el.dataset.t; const w = p.tokens[ti].w;
    let st = wstatus(w);
    if (st === 0 && /^[A-Z]/.test(w) && !FREQ_RANK[w.toLowerCase()] && ti > 0 && !/[.!?:"“]\s*$/.test(p.text.slice(0, p.tokens[ti].s))) st = -1;
    el.className = 'w s' + (st === -1 ? 'i' : st) + (el.classList.contains('cur') ? ' cur' : '');
  });
}
function paintPhrases() {
  if (!ART) return;
  ART.phr = {};
  ART.paras.forEach((p, pi) => findPhrases(p.tokens).forEach(h => {
    h.span.forEach(ti => { const el = $(`#artBody .w[data-p="${pi}"][data-t="${ti}"]`); if (el) el.classList.add('ph'); (ART.phr[pi + ':' + ti] = ART.phr[pi + ':' + ti] || []).push(h); });
  }));
}
function updatePct() { if (!ART) return; const pct = knownPct(ART.t.body); const el = $('#kpctTxt'); if (el) { el.textContent = 'Conoces el ' + pct + '% de las palabras'; $('.kbar i').style.width = pct + '%'; } }

function bindReader() {
  const body = $('#artBody');
  let mode = 'read';
  RPLAY = { i: (READS[ART.t.id] && READS[ART.t.id].s) || 0, playing: false };
  const hlSent = (i, scroll) => {
    $$('#artBody .w.cur').forEach(x => x.classList.remove('cur'));
    const s = ART.sents[i]; if (!s) return;
    const p = ART.paras[s.p];
    p.tokens.forEach((t, ti) => { if (t.s >= s.a && t.s < s.b) { const el = $(`#artBody .w[data-p="${s.p}"][data-t="${ti}"]`); if (el) el.classList.add('cur'); } });
    if (scroll) { const el = $(`#artBody .w.cur`) || $(`#artBody [data-pi="${s.p}"]`); if (el) el.scrollIntoView({ block: 'center', behavior: 'smooth' }); }
    $('#pLabel').textContent = 'Frase ' + (i + 1) + ' de ' + ART.sents.length;
    paintSentBar();
  };
  const playSent = (i, cont) => {
    if (!ART || i < 0 || i >= ART.sents.length) { stop(); if (i >= ART.sents.length) $('#pLabel').textContent = 'Fin del texto'; return; }
    RPLAY.i = i; hlSent(i, true);
    const me = RPLAY;
    TTS.speak(ART.sents[i].s, { onend: () => { if (RPLAY !== me || !me.playing) return; if (cont && mode !== 'sent') setTimeout(() => { if (RPLAY === me && me.playing) playSent(i + 1, true); }, 200); else { me.playing = false; $('#pPlay').innerHTML = IC.play; } } });
  };
  const stop = () => { if (!RPLAY) return; RPLAY.playing = false; TTS.stop(); $('#pPlay').innerHTML = IC.play; };
  const start = (i, cont = true) => { RPLAY.playing = true; $('#pPlay').innerHTML = IC.pause; playSent(i, cont); };
  $('#pPlay').onclick = () => { if (RPLAY.playing) stop(); else start(RPLAY.i, mode !== 'sent'); };
  $('#pPrev').onclick = () => { const i = Math.max(0, RPLAY.i - 1); if (RPLAY.playing || mode === 'sent') start(i, mode !== 'sent'); else { RPLAY.i = i; hlSent(i, true); } };
  $('#pNext').onclick = () => { const i = Math.min(ART.sents.length - 1, RPLAY.i + 1); if (RPLAY.playing || mode === 'sent') start(i, mode !== 'sent'); else { RPLAY.i = i; hlSent(i, true); } };
  $('#pRate').onclick = () => { const rates = [0.7, 0.8, 0.9, 1, 1.1, 1.2, 1.35]; S.rate = rates[(rates.indexOf(S.rate) + 1) % rates.length] || 1; saveSettings(); $('#pRate').textContent = S.rate + '×'; if (RPLAY.playing) start(RPLAY.i, mode !== 'sent'); };
  const paintSentBar = () => {
    const bar = $('#sentBar'); if (!bar) return;
    if (mode !== 'sent') { bar.classList.add('hidden'); return; }
    bar.classList.remove('hidden');
    bar.innerHTML = `<div class="row" style="gap:6px;flex-wrap:wrap"><button class="btn small" id="sbRep">${ico('back10', 15)} Otra vez</button><button class="btn small" id="sbSlow">🐢 Lenta</button><button class="btn small" id="sbShow">${body.classList.contains('hide') ? 'Ver texto' : 'Ocultar texto'}</button><button class="btn small" id="sbTr">Traducir</button><button class="btn small primary" id="sbNext">Siguiente ›</button></div><div id="sbOut" class="muted" style="margin-top:6px;font-size:15px"></div>`;
    $('#sbRep').onclick = () => start(RPLAY.i, false);
    $('#sbSlow').onclick = () => { RPLAY.playing = true; hlSent(RPLAY.i, false); TTS.speak(ART.sents[RPLAY.i].s, { rate: 0.7, onend: () => { RPLAY.playing = false; } }); };
    $('#sbShow').onclick = () => { body.classList.toggle('hide'); paintSentBar(); };
    $('#sbTr').onclick = async () => { $('#sbOut').textContent = 'Traduciendo…'; $('#sbOut').textContent = await translate(ART.sents[RPLAY.i].s) || 'No se ha podido traducir.'; };
    $('#sbNext').onclick = () => start(Math.min(ART.sents.length - 1, RPLAY.i + 1), false);
  };
  $('#rMode').onclick = e => {
    const b = e.target.closest('[data-m]'); if (!b) return;
    mode = b.dataset.m; $$('#rMode button').forEach(x => x.classList.toggle('on', x === b));
    body.classList.toggle('hide', !!(mode === 'hide' || (mode === 'sent' && S.sentHide)));
    stop(); hlSent(RPLAY.i, mode !== 'read'); paintSentBar();
    if (mode === 'hide') toast('Escucha sin leer. Cuando termines, vuelve a «Leer» para comprobar.');
  };
  let lastTap = { t: 0, el: null };
  body.addEventListener('click', e => {
    const w = e.target.closest('.w'); if (!w) return;
    const now = Date.now();
    if (lastTap.el === w && now - lastTap.t < 350) { closeSheet(); const pi = +w.dataset.p, ti = +w.dataset.t; const pos = ART.paras[pi].tokens[ti].s; const si = ART.sents.findIndex(s => s.p === pi && pos >= s.a && pos < s.b); start(Math.max(0, si), mode !== 'sent'); return; }
    lastTap = { t: now, el: w };
    if (mode === 'hide' && !body.classList.contains('peek')) return;
    openWord(+w.dataset.p, +w.dataset.t);
  });
  if ($('#txEdit')) $('#txEdit').onclick = () => openTextEditor((window.TEXTS || []).find(x => 'm:' + x.id === ART.t.id));
  $('#doneBtn').onclick = () => finishText();
  hlSent(RPLAY.i, false); $$('#artBody .w.cur').forEach(x => x.classList.remove('cur')); $('#pLabel').textContent = 'Escuchar · toca dos veces una palabra para empezar desde ahí';
  window.onscroll = () => { clearTimeout(window._rs); window._rs = setTimeout(() => { if (ART) saveProgress(); }, 800); };
  if (typeof READER_START_MODE !== 'undefined' && READER_START_MODE) { const b = $(`#rMode [data-m="${READER_START_MODE}"]`); READER_START_MODE = null; if (b) setTimeout(() => b.click(), 50); }
}
function finishText() {
  if (!ART) return;
  const t = ART.t; const r = READS[t.id] || {};
  let n = 0;
  if (S.autoKnown) ART.paras.forEach(p => p.tokens.forEach((tk, ti) => { const el = $(`#artBody .w[data-p="${ART.paras.indexOf(p)}"][data-t="${ti}"]`); if (el && el.classList.contains('s0')) { WORDS[wkey(tk.w)] = 5; n++; } }));
  if (n) saveWords();
  if (!r.done) {
    bump('art'); bump('words', wordCount(t.body));
    HISTORY.unshift({ id: t.id, title: t.title, section: t.kind, readAt: Date.now(), words: wordCount(t.body) }); if (HISTORY.length > 2000) HISTORY.length = 2000; store.set('history', HISTORY);
  }
  READS[t.id] = Object.assign(r, { title: t.title, kind: t.kind, src: t.src, pct: 100, done: true, upd: Date.now() }); saveReads();
  paintStatuses(); updatePct();
  $('#doneBtn').textContent = '✓ Ya lo has terminado';
  toast(n ? '¡Terminado! ' + n + ' palabras nuevas pasan a conocidas' : '¡Texto terminado!');
}

/* ---------- panel de palabra ---------- */
let WSEL = null;
function openWord(pi, ti) { WSEL = { p: pi, a: ti, b: ti }; paintWordSheet(true); }
function selText() { const p = ART.paras[WSEL.p]; return p.text.slice(p.tokens[WSEL.a].s, p.tokens[WSEL.b].e); }
function sentenceAt(pi, ti) { const pos = ART.paras[pi].tokens[ti].s; return ART.sents.find(s => s.p === pi && pos >= s.a && pos < s.b) || { s: ART.paras[pi].text }; }
const ST_LABEL = { 0: 'Nueva', 1: 'Aprendiendo 1', 2: 'Aprendiendo 2', 3: 'Aprendiendo 3', 4: 'Casi la sé', 5: 'La sé', '-1': 'Ignorada' };
function paintWordSheet(first) {
  const p = ART.paras[WSEL.p];
  const term = selText(); const single = WSEL.a === WSEL.b;
  const sent = sentenceAt(WSEL.p, WSEL.a);
  const ctx = esc(sent.s).replace(new RegExp('\\b' + esc(term).replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '\\b'), '<b>$&</b>');
  const existing = NOTES.find(n => norm(n.term) === norm(term) || (single && norm(n.term) === norm(stem(term))));
  const lib = LIB.find(x => norm(x.term) === norm(term));
  const phr = (ART.phr[WSEL.p + ':' + WSEL.a] || []).map(h => h.x).filter((x, i, a) => a.indexOf(x) === i);
  const st = single ? wstatus(term) : null;
  $$('.w.sel').forEach(x => x.classList.remove('sel'));
  for (let i = WSEL.a; i <= WSEL.b; i++) { const el = $(`#artBody .w[data-p="${WSEL.p}"][data-t="${i}"]`); if (el) el.classList.add('sel'); }
  const html = `
    <div class="row"><h3 class="grow" id="wTerm" style="margin:0">${esc(term)}</h3><button class="mini" id="wSpeak">${IC.speak}</button><button class="mini" id="wSlow">🐢</button></div>
    <div class="row wrap" style="gap:6px;margin:8px 0 10px">
      <button class="btn small" id="wLeft" ${WSEL.a === 0 ? 'disabled' : ''}>◀ +</button>
      <button class="btn small" id="wRight" ${WSEL.b >= p.tokens.length - 1 ? 'disabled' : ''}>+ ▶</button>
      ${WSEL.b > WSEL.a ? '<button class="btn small" id="wShrink">− quitar</button>' : ''}
      <span class="muted" style="font-size:12.5px">Amplía para seleccionar una expresión</span>
    </div>
    ${phr.length ? phr.map(x => `<div class="box phbox" data-phid="${esc(x.id)}"><div class="muted" style="font-size:12px;font-weight:700">EXPRESIÓN EN ESTA FRASE</div><div style="font-size:17px;font-weight:700">${esc(x.term)}</div><div>${esc(x.es || '')}</div>${x.def ? `<div class="muted" style="font-size:14px">${esc(x.def)}</div>` : ''}</div>`).join('') : ''}
    ${lib ? `<div class="box" style="background:var(--warm-soft)"><div style="font-weight:700">${esc(lib.es)}</div><div class="muted" style="font-size:14px">${esc(lib.def)}</div></div>` : ''}
    <div class="box"><div class="muted" style="font-size:12px;font-weight:700;margin-bottom:3px">EN ESPAÑOL</div><div id="wTr" style="font-size:18px;font-weight:600">…</div></div>
    <div id="wDef"></div>
    ${single ? `<div class="stbar" id="wSt">${[0, 1, 2, 3, 4, 5, -1].map(v => `<button class="${v === st ? 'on' : ''} st${v === -1 ? 'i' : v}" data-st="${v}">${v === 0 ? 'Nueva' : v === 5 ? '✓ La sé' : v === -1 ? 'Ignorar' : v}</button>`).join('')}</div>` : ''}
    <label class="lbl">En contexto</label>
    <div class="box ctx">${ctx}</div>
    <div class="row" style="margin-top:8px;gap:8px;flex-wrap:wrap"><button class="btn small" id="ctxSpeak">${ico('speak', 15)} Escuchar frase</button><button class="btn small" id="ctxTr">Traducir frase</button><button class="btn small" id="ctxFrom">${ico('play', 13)} Leer desde aquí</button></div>
    <div id="ctxTrOut" class="muted" style="margin-top:8px;font-size:15px"></div>
    <div style="margin-top:14px">${existing ? `<div class="notice">Ya está en tus palabras.</div><button class="btn block" id="wEdit">Ver o editar la tarjeta</button>`
      : `<button class="btn primary block" id="wSave">${ico('plus', 18)} Guardar como tarjeta (con esta frase)</button>`}</div>`;
  const mount = b => {
    $('#wSpeak', b).onclick = () => TTS.speak(term, { rate: 0.9 });
    $('#wSlow', b).onclick = () => TTS.speak(term, { rate: 0.65 });
    $('#ctxSpeak', b).onclick = () => TTS.speak(sent.s);
    $('#ctxFrom', b).onclick = () => { closeSheet(); const si = ART.sents.indexOf(sent); if (si >= 0) { RPLAY.i = si; $('#pPlay').click(); } };
    $('#ctxTr', b).onclick = async () => { $('#ctxTrOut').textContent = 'Traduciendo…'; $('#ctxTrOut').textContent = await translate(sent.s) || 'No se ha podido traducir (¿sin conexión?).'; };
    if ($('#wLeft', b)) $('#wLeft', b).onclick = () => { WSEL.a = Math.max(0, WSEL.a - 1); paintWordSheet(); };
    if ($('#wRight', b)) $('#wRight', b).onclick = () => { WSEL.b = Math.min(p.tokens.length - 1, WSEL.b + 1); paintWordSheet(); };
    if ($('#wShrink', b)) $('#wShrink', b).onclick = () => { WSEL.b = Math.max(WSEL.a, WSEL.b - 1); paintWordSheet(); };
    if ($('#wSt', b)) $('#wSt', b).onclick = e => { const x = e.target.closest('[data-st]'); if (!x) return; setWord(term, +x.dataset.st); paintStatuses(); updatePct(); paintWordSheet(); };
    $$('.phbox', b).forEach(el => el.onclick = () => { const x = LIB_BY_ID[el.dataset.phid] || NOTES.find(n => n.id === el.dataset.phid); if (x && typeof openDetail === 'function' && x.lib) openDetail(x.id); });
    if ($('#wSave', b)) $('#wSave', b).onclick = () => openNoteEditor({ term: single ? term.toLowerCase() : term, cat: guessCat(term), es: (lib && lib.es) || $('#wTr').dataset.tr || '', def: (lib && lib.def) || $('#wDef').dataset.def || '', ex: sent.s, src: ART.t.title, srcId: ART.t.id }, () => { if (single && wstatus(term) === 0) setWord(term, 1); paintStatuses(); updatePct(); });
    if ($('#wEdit', b)) $('#wEdit', b).onclick = () => openNoteEditor(existing);
    translate(term).then(tr => { const el = $('#wTr'); if (!el || norm($('#wTerm').textContent) !== norm(term)) return; el.textContent = tr || 'Sin conexión con el traductor'; el.dataset.tr = tr || ''; });
    if (single) lookupDef(term).then(d => {
      const el = $('#wDef'); if (!el || norm($('#wTerm').textContent) !== norm(term) || !d) return;
      const phon = d.phonetic || (d.phonetics || []).map(x => x.text).find(Boolean) || '';
      const defs = []; (d.meanings || []).forEach(m => (m.definitions || []).slice(0, 2).forEach(df => defs.length < 3 && defs.push({ pos: m.partOfSpeech, d: df.definition, ex: df.example })));
      el.dataset.def = defs[0] ? defs[0].d : '';
      el.innerHTML = `<div class="row" style="margin-top:6px"><b>${esc(d.word)}</b><span class="phon">${esc(phon)}</span></div><ul class="defs">${defs.map(x => `<li><span class="pos">${esc(x.pos)}</span>${esc(x.d)}${x.ex ? `<div class="muted" style="font-style:italic;font-size:14px;margin-top:3px">“${esc(x.ex)}”</div>` : ''}</li>`).join('')}</ul>`;
    });
  };
  if (first || !sheetOpen()) openSheet(html, mount); else { $('#sheetBody').innerHTML = html; mount($('#sheetBody')); }
}

/* frases del texto abierto disponibles para los ejercicios */
const TEXT_POOLS = {};
function registerTextPool(t, sents) {
  TEXT_POOLS[t.id] = sents.map(s => ({ s: s.s, src: t.title, id: t.id })).filter(x => { const n = x.s.split(/\s+/).length; return n >= 5 && n <= 32 && /^[A-Z“"‘']/.test(x.s); });
}

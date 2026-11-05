'use strict';
/* ==========================================================
   HABLAR: reconocimiento de voz, conversación con IA, role-plays,
   dilo como un nativo, diario hablado, tarjetas de producción
   ========================================================== */
const SRClass = window.SpeechRecognition || window.webkitSpeechRecognition;
function addSpeak(sec) { if (sec > 0) { const t = today(); t.ssec = (t.ssec || 0) + sec; saveStats(); renderStreak(); } }

/* ---------- reconocimiento de voz ---------- */
function startRecognition({ lang = 'en-GB', onInterim, onEnd, onError } = {}) {
  if (!SRClass) { onError && onError('nosupport'); return null; }
  let r; try { r = new SRClass(); } catch (e) { onError && onError('nosupport'); return null; }
  r.lang = lang; r.interimResults = true; r.continuous = false; r.maxAlternatives = 3;
  let final = '', alts = [], t0 = Date.now(), done = false;
  r.onresult = e => {
    let interim = '';
    for (let i = e.resultIndex; i < e.results.length; i++) {
      if (e.results[i].isFinal) { final += e.results[i][0].transcript; alts = Array.from(e.results[i]).map(a => a.transcript); }
      else interim += e.results[i][0].transcript;
    }
    onInterim && onInterim((final + ' ' + interim).trim());
  };
  r.onerror = e => { if (done) return; done = true; onError && onError(e.error || 'error'); };
  r.onend = () => { addSpeak(Math.round((Date.now() - t0) / 1000)); if (done) return; done = true; onEnd && onEnd(final.trim(), alts); };
  try { r.start(); } catch (e) { onError && onError('start'); return null; }
  return { stop: () => { try { r.stop(); } catch (e) {} } };
}
function srErrorText(e) {
  return { nosupport: 'Este navegador no reconoce la voz. En el iPhone funciona en Safari; si la app instalada no te deja, ábrela en Safari directamente.', 'not-allowed': 'Necesito permiso para usar el micrófono (Ajustes del iPhone › Safari › Micrófono).', 'no-speech': 'No te he oído. Pulsa el micro y habla.', network: 'El reconocimiento de voz necesita conexión.' }[e] || 'No he podido escucharte. Inténtalo otra vez.';
}
function micButton(id, label = 'Pulsa y habla') { return `<button class="rec small" id="${id}" aria-label="Hablar">${IC.mic}</button><p class="muted" style="text-align:center;font-size:13px;margin:4px 0 0" id="${id}Hint">${label}</p>`; }
function bindMic(id, { onText, lang }) {
  let ctl = null;
  $('#' + id).onclick = () => {
    if (ctl) { ctl.stop(); return; }
    TTS.stop();
    $('#' + id).classList.add('on'); $('#' + id + 'Hint').textContent = 'Te escucho… (toca para terminar)';
    ctl = startRecognition({ lang, onInterim: t => { $('#' + id + 'Hint').textContent = t || 'Te escucho…'; },
      onEnd: (t, alts) => { ctl = null; const b = $('#' + id); if (!b) return; b.classList.remove('on'); $('#' + id + 'Hint').textContent = 'Pulsa y habla'; onText(t, alts); },
      onError: e => { ctl = null; const b = $('#' + id); if (!b) return; b.classList.remove('on'); $('#' + id + 'Hint').textContent = srErrorText(e); } });
    if (!ctl && !SRClass) { $('#' + id).classList.remove('on'); $('#' + id + 'Hint').textContent = srErrorText('nosupport'); }
  };
}
function scoreSpeech(target, said, alts = []) {
  const a = tokenize(target).map(t => t.w);
  let best = null;
  [said].concat(alts || []).filter(Boolean).forEach(s => { const r = lcsDiff(a, tokenize(s).map(t => t.w)); if (!best || r.score > best.score) best = r; });
  return best || { out: a.map(w => ['add', w]), score: 0 };
}
function bestScore(targets, said, alts = []) { let best = null; targets.forEach(t => { const r = scoreSpeech(t, said, alts); if (!best || r.score > best.score) best = r; }); return best; }
function diffHTML(out) { return out.filter(([k]) => k !== 'miss').map(([k, w]) => `<span class="${k === 'ok' ? 'ok' : 'add'}">${esc(w)}</span>`).join(' '); }

/* ---------- pestaña Hablar ---------- */
function renderSpeak() {
  const t = today();
  $('#view').innerHTML = `
    <div class="h1">Hablar</div>
    <p class="sub">Hablar en voz alta cada día es lo que te quita el miedo. Hoy llevas ${Math.round((t.ssec || 0) / 60)} min hablando.</p>
    <a class="card pad cta" href="#ai"><div class="ico" style="width:44px;height:44px;border-radius:12px;display:grid;place-items:center;background:var(--warm-soft);color:var(--warm)">${IC.chat}</div><div class="grow"><b>Conversación con IA</b><div class="muted" style="font-size:14px">Habla con un nativo virtual sobre lo que quieras y recibe correcciones</div></div><span class="btn warm small">Hablar</span></a>
    <div class="modes">
      ${hubTile('#rp', 'chat', 'Role-plays', 'Elige qué dirías y aprende la opción más natural')}
      ${hubTile('#native', 'spark', 'Dilo como un nativo', (window.NATIVE || []).length + ' frases que delatan a un español, y su versión natural')}
      ${hubTile('#ex/say', 'mic', 'Pronuncia', 'Di frases en voz alta y el móvil te marca lo que no entiende')}
      ${hubTile('#ex/prod', 'cards', 'Tarjetas de producción', 'Te doy el español y tú lo dices en inglés')}
      ${hubTile('#ex/shadow', 'ear', 'Shadowing', 'Escucha, repite y compárate con el original')}
      ${hubTile('#ex/speak', 'mic', 'Habla 1 minuto', 'Preguntas para hablar sin parar')}
      ${hubTile('#diary', 'book', 'Diario hablado', 'Grábate cada día y oye tu evolución')}
      ${hubTile('#ex/say/chunks', 'link', 'Chunks en voz alta', 'Frases hechas para ganar fluidez')}
    </div>
    ${SRClass ? '' : '<div class="notice warm" style="margin-top:12px">Este navegador no permite reconocer la voz. Los ejercicios con micrófono funcionan en Safari en el iPhone y en Chrome en el ordenador.</div>'}`;
}

/* ---------- pronuncia (reconocimiento) ---------- */
EXTRA_TITLES.say = 'Pronuncia';
EXTRA_GENS.say = arg => {
  let pool;
  if (arg === 'chunks') pool = LIB.filter(x => x.cat === 'chunk').map(x => ({ s: x.ex, src: x.term + ' · ' + x.es }));
  else if (isSetKey(arg)) pool = setFromArg(arg).filter(x => x.ex).map(x => ({ s: x.ex, src: x.term }));
  else pool = sentencePool(arg).filter(x => { const n = x.s.split(/\s+/).length; return n >= 4 && n <= 16; });
  if (!pool.length) return null;
  return { type: 'say', it: pick(pool) };
};
EXTRA_RENDER.say = q => {
  $('#view').innerHTML = `${exHeader()}<div id="qArea"><p class="muted" style="margin:16px 0 6px">Escúchala y dila en voz alta</p>
    <div class="card pad"><div class="q" style="margin:0">${esc(q.it.s)}</div><div class="meta" style="margin-top:6px">${esc(q.it.src || '')}</div></div>
    <div class="row" style="justify-content:center;gap:10px;margin:12px 0"><button class="btn" id="sP">${IC.speak.replace('<svg', '<svg width="16" height="16"')} Escuchar</button><button class="btn" id="sS">🐢 Lento</button></div>
    ${micButton('sMic')}<div id="sOut" style="margin-top:12px"></div></div>`;
  $('#sP').onclick = () => TTS.speak(q.it.s); $('#sS').onclick = () => TTS.speak(q.it.s, { rate: 0.7 });
  let tries = 0;
  bindMic('sMic', { onText: (said, alts) => {
    tries++;
    const r = scoreSpeech(q.it.s, said, alts); const pct = Math.round(r.score * 100);
    $('#sOut').innerHTML = `<div class="card pad"><div class="muted" style="font-size:13px">Lo que ha entendido el móvil</div><div class="ctx">«${esc(said || '…')}»</div><div class="diff ctx" style="margin-top:8px">${diffHTML(r.out)}</div><div style="margin-top:6px"><b style="color:${pct >= 85 ? 'var(--good)' : pct >= 60 ? 'var(--warm)' : 'var(--bad)'}">${pct}%</b> <span class="muted" style="font-size:13px">· en naranja, las palabras que no ha reconocido</span></div>
      <div class="row" style="margin-top:10px"><button class="btn grow" id="sAgain">Otra vez</button><button class="btn primary grow" id="sNext">Siguiente</button></div></div>`;
    $('#sAgain').onclick = () => { $('#sOut').innerHTML = ''; };
    $('#sNext').onclick = () => { const ok = pct >= 80; SESSION.ok += ok ? 1 : 0; bump('ex'); if (ok) bump('ok'); SESSION.n++; nextQ(); };
  } });
};

/* ---------- tarjetas de producción ---------- */
EXTRA_TITLES.prod = 'Producción';
EXTRA_GENS.prod = arg => {
  const pool = (isSetKey(arg) ? setFromArg(arg) : LIB.filter(x => x.srs).concat(NOTES)).filter(x => x.es && x.term && x.term.split(' ').length <= 8);
  const base = pool.length >= 4 ? pool : pool.concat(LIB.filter(x => ['chunk', 'convo', 'phrasal', 'idiom'].includes(x.cat)).slice(0, 80));
  if (!base.length) return null;
  const x = pick(base); return { type: 'prod', x };
};
EXTRA_RENDER.prod = q => {
  const x = q.x;
  $('#view').innerHTML = `${exHeader()}<div id="qArea"><p class="muted" style="margin:16px 0 6px">¿Cómo se dice en inglés? Dilo en voz alta (o escríbelo)</p>
    <div class="card flash" style="min-height:150px"><div class="term" style="font-size:24px">${esc(x.es)}</div>${x.def ? `<div class="muted" style="margin-top:8px;font-size:14px">Pista · ${esc(x.def)}</div>` : ''}</div>
    <div style="margin-top:12px">${micButton('pMic')}</div>
    <div class="row" style="margin-top:10px"><input class="input grow" id="pIn" placeholder="o escríbelo aquí" autocapitalize="off" autocomplete="off" spellcheck="false"><button class="btn primary" id="pOk">OK</button></div>
    <div id="pOut" style="margin-top:12px"></div></div>`;
  const check = (said, alts) => {
    if ($('.feedback')) return;
    const r = scoreSpeech(x.term.replace(/\(.*?\)/g, '').split('/')[0], said, alts); const ok = r.score >= 0.75;
    if (ok && x.srs) { x.srs.prodOk = (x.srs.prodOk || 0) + 1; x.srs.upd = Date.now(); if (x.lib) saveLearn(); else saveNotes(); }
    if (x.srs && !ok) grade(x, 0);
    q.it = { s: x.ex || x.term, src: (LIB_CATS[x.cat] || {}).name || 'Mis palabras' };
    answered(ok, `<div style="margin-top:4px">Has dicho · «${esc(said)}»</div><div style="margin-top:4px"><b>${esc(x.term)}</b></div>${x.ex ? `<div class="ctx muted" style="margin-top:4px">${esc(x.ex)}</div>` : ''}`);
    TTS.speak(x.term, { rate: 0.9 });
  };
  bindMic('pMic', { onText: check });
  $('#pOk').onclick = () => { const v = $('#pIn').value.trim(); if (v) check(v, []); };
};

/* ---------- dilo como un nativo ---------- */
function renderNative() {
  const N = window.NATIVE || [];
  $('#view').innerHTML = `<div class="h1">Dilo como un nativo</div><p class="sub">Frases que suenan a español traducido y cómo las diría un nativo. Tapa la respuesta, intenta corregirla tú y luego dila en voz alta.</p>
    <div class="row wrap" style="margin-bottom:12px"><a class="btn primary grow" href="#ex/native">Practicar con tarjetas</a><a class="btn grow" href="#ex/nativesay">Corrígela en voz alta</a></div>
    <div class="card">${N.map((n, k) => `<div class="note"><div class="grow"><div class="wrongline">✗ ${esc(n[0])}</div><div class="rightline">✓ ${esc(n[1])}</div><div class="muted" style="font-size:13.5px;margin-top:3px">${esc(n[2])}</div></div><div style="display:flex;flex-direction:column;gap:6px"><button class="mini" data-say="${esc(n[1])}">${IC.speak}</button><button class="mini" data-nk="${k}">${IC.plus}</button></div></div>`).join('')}</div>`;
  $('#view').onclick = e => {
    const s = e.target.closest('[data-say]'); if (s) { TTS.speak(s.dataset.say); return; }
    const a = e.target.closest('[data-nk]'); if (a) { const n = N[+a.dataset.nk]; openNoteEditor({ term: n[1], cat: 'other', es: '', note: 'En vez de: ' + n[0] + ' · ' + n[2], src: 'Dilo como un nativo' }); }
  };
}
EXTRA_TITLES.native = 'Dilo como un nativo';
EXTRA_GENS.native = () => { const N = window.NATIVE || []; return N.length ? { type: 'native', n: pick(N) } : null; };
EXTRA_RENDER.native = q => {
  const n = q.n;
  $('#view').innerHTML = `${exHeader()}<div id="qArea"><p class="muted" style="margin:16px 0 6px">Esta frase suena a español traducido. ¿Cómo la diría un nativo?</p>
    <div class="card pad"><div class="q wrongline" style="margin:0">${esc(n[0])}</div></div>
    <textarea class="textarea" id="nIn" style="margin-top:12px;min-height:70px" placeholder="Escribe tu versión (opcional)"></textarea>
    <button class="btn primary block" id="nShow" style="margin-top:10px">Ver la versión natural</button></div>`;
  $('#nShow').onclick = () => {
    $('#nShow').remove();
    const mine = $('#nIn').value.trim();
    const r = mine ? bestScore(n[1].split(' / '), mine) : null;
    const box = document.createElement('div');
    box.innerHTML = `<div class="card pad" style="margin-top:12px"><div class="q rightline" style="margin:0">${esc(n[1])}</div><div class="muted" style="margin-top:6px">${esc(n[2])}</div>${r ? `<div class="meta" style="margin-top:6px">Tu versión coincide en un ${Math.round(r.score * 100)}%</div>` : ''}
      <div class="row" style="margin-top:10px"><button class="btn small" id="nSay">${IC.speak.replace('<svg', '<svg width="15" height="15"')} Escuchar</button></div></div>
      <div class="row" style="margin-top:12px"><button class="btn grow" id="nBad" style="color:var(--bad)">No lo sabía</button><button class="btn grow" id="nGood" style="color:var(--good)">Lo sabía</button></div>`;
    $('#qArea').appendChild(box);
    $('#nSay').onclick = () => TTS.speak(n[1].split(' / ')[0]);
    TTS.speak(n[1].split(' / ')[0]);
    const fin = ok => { SESSION.ok += ok ? 1 : 0; bump('ex'); if (ok) bump('ok'); SESSION.n++; nextQ(); };
    $('#nBad').onclick = () => fin(false); $('#nGood').onclick = () => fin(true);
  };
};
EXTRA_TITLES.nativesay = 'Corrígela en voz alta';
EXTRA_GENS.nativesay = EXTRA_GENS.native;
EXTRA_RENDER.nativesay = q => {
  const n = q.n; const target = n[1].split(' / ')[0];
  $('#view').innerHTML = `${exHeader()}<div id="qArea"><p class="muted" style="margin:16px 0 6px">Di en voz alta la versión correcta y natural</p>
    <div class="card pad"><div class="q wrongline" style="margin:0">${esc(n[0])}</div></div>
    <div style="margin-top:12px">${micButton('nMic')}</div><button class="btn small ghost" id="nGive" style="margin-top:8px">No sé, dímelo</button></div>`;
  const show = (said, alts) => {
    if ($('.feedback')) return;
    const r = said ? bestScore(n[1].split(' / '), said, alts || []) : { score: 0 };
    q.it = { s: target, src: 'Dilo como un nativo' };
    answered(r.score >= 0.8, `${said ? `<div style="margin-top:4px">Has dicho · «${esc(said)}»</div>` : ''}<div style="margin-top:4px"><b>${esc(n[1])}</b></div><div class="muted" style="font-size:14px">${esc(n[2])}</div>`);
    TTS.speak(target);
  };
  bindMic('nMic', { onText: (t, alts) => show(t, alts) });
  $('#nGive').onclick = () => show('');
};

/* ---------- role-plays ---------- */
function renderRoleplays(id) {
  const R = window.ROLEPLAYS || [];
  const best = store.get('rpbest', {});
  if (!id) {
    $('#view').innerHTML = `<div class="h1">Role-plays</div><p class="sub">En cada turno elige qué dirías. Verás qué suena natural, qué suena traducido y qué es un error.</p>
      <div class="card">${R.map(r => `<a class="note" href="#rp/${r.id}" style="text-decoration:none;color:inherit"><div class="grow"><span class="term">${esc(r.title)}</span><div class="es">${esc(r.es)}</div></div>${best[r.id] != null ? `<span class="tag ${best[r.id] >= r.steps.length * 0.8 ? 'good' : ''}">${best[r.id]}/${r.steps.length}</span>` : '<span class="muted">›</span>'}</a>`).join('')}</div>
      <p class="meta" style="margin-top:12px">¿Quieres conversaciones abiertas, sin opciones? Prueba la conversación con IA en la pestaña Hablar.</p>`;
    return;
  }
  const r = R.find(x => x.id === id); if (!r) return renderRoleplays();
  let i = 0, score = 0; const log = [];
  const pair = TTS.pair();
  const show = () => {
    if (i >= r.steps.length) {
      best[r.id] = Math.max(best[r.id] || 0, score); store.set('rpbest', best);
      $('#rpBox').insertAdjacentHTML('beforeend', `<div class="card pad" style="text-align:center;margin-top:14px"><b>${score}/${r.steps.length} respuestas naturales</b><div class="row" style="margin-top:10px"><button class="btn grow" id="rpAgain">Repetir</button><a class="btn primary grow" href="#rp">Otro role-play</a></div></div>`);
      $('#rpAgain').onclick = () => renderRoleplays(id); return;
    }
    const st = r.steps[i];
    const opts = shuffle(st.opts);
    $('#rpBox').insertAdjacentHTML('beforeend', `<div class="dl"><span class="who">${esc(st.say[0])}</span><span class="line">${esc(st.say[1])}</span></div><div class="rpopts" id="rpo${i}">${opts.map((o, k) => `<button class="opt" data-k="${k}">${esc(o[0])}</button>`).join('')}</div>`);
    TTS.speak(st.say[1], { voice: pair.f });
    $('#rpo' + i).lastElementChild.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
    $('#rpo' + i).onclick = e => {
      const b = e.target.closest('.opt'); if (!b || $('#rpo' + i).dataset.done) return; $('#rpo' + i).dataset.done = 1;
      const o = opts[+b.dataset.k]; if (o[1] === 'best') score++;
      const bestOpt = opts.find(x => x[1] === 'best');
      $$('.opt', $('#rpo' + i)).forEach((x, k) => { const t = opts[k][1]; if (t === 'best') x.classList.add('right'); });
      if (o[1] !== 'best') b.classList.add(o[1] === 'bad' ? 'wrong' : 'meh');
      $('#rpo' + i).insertAdjacentHTML('afterend', `<div class="feedback ${o[1] === 'best' ? 'ok' : o[1] === 'ok' ? 'meh' : 'ko'}" style="margin:8px 0 14px"><b>${o[1] === 'best' ? 'Muy natural' : o[1] === 'ok' ? 'Se entiende, pero…' : 'Mejor no'}</b><div>${esc(o[2])}</div>${o[1] !== 'best' ? `<div style="margin-top:4px">Mejor · <b>${esc(bestOpt[0])}</b></div>` : ''}</div><div class="dl me"><span class="who">Tú</span><span class="line">${esc(bestOpt[0])}</span></div>`);
      TTS.speak(bestOpt[0], { voice: pair.m });
      bump('ex'); if (o[1] === 'best') bump('ok');
      i++; setTimeout(show, 900);
    };
  };
  $('#view').innerHTML = `<div class="eyebrow">Role-play</div><div class="h1">${esc(r.title)}</div><p class="sub">${esc(r.es)}</p><div class="dialogue" id="rpBox"></div>`;
  show();
}

/* ---------- diario hablado (grabaciones en el dispositivo) ---------- */
const IDB = {
  db: null,
  open() { return this.db ? Promise.resolve(this.db) : new Promise((ok, ko) => { const r = indexedDB.open('fluent', 1); r.onupgradeneeded = () => r.result.createObjectStore('diary', { keyPath: 'id' }); r.onsuccess = () => { this.db = r.result; ok(r.result); }; r.onerror = () => ko(r.error); }); },
  async all() { const db = await this.open(); return new Promise(ok => { const out = []; const c = db.transaction('diary').objectStore('diary').openCursor(); c.onsuccess = e => { const cur = e.target.result; if (cur) { out.push(cur.value); cur.continue(); } else ok(out.sort((a, b) => b.date - a.date)); }; c.onerror = () => ok(out); }); },
  async put(x) { const db = await this.open(); return new Promise(ok => { const t = db.transaction('diary', 'readwrite'); t.objectStore('diary').put(x); t.oncomplete = ok; }); },
  async del(id) { const db = await this.open(); return new Promise(ok => { const t = db.transaction('diary', 'readwrite'); t.objectStore('diary').delete(id); t.oncomplete = ok; }); }
};
const DIARY_PROMPTS = ['What did you do today, and how did you feel about it?', 'Tell me about something that annoyed you recently.', 'What are you looking forward to this week?', 'Describe your perfect weekend.', 'What did you learn today?', 'Talk about a person who has influenced you.', 'What would you change about your city?', 'Describe a film or series you\'ve watched recently.', 'What are your goals for this month?', 'Tell a funny story from your childhood.', 'What do you think about working at a big law firm?', 'Describe your morning routine in detail.', 'If you could live anywhere, where would it be and why?', 'What\'s the best advice you\'ve ever received?'];
async function renderDiary() {
  const prompt = dailyPick(DIARY_PROMPTS, 'd');
  $('#view').innerHTML = `<div class="h1">Diario hablado</div><p class="sub">Grábate unos minutos cada día. Dentro de unos meses podrás escuchar tus primeras grabaciones y oír cuánto has mejorado.</p>
    <div class="card pad"><div class="eyebrow" style="margin:0 0 4px">Tema de hoy (o habla de lo que quieras)</div><div class="q" style="margin:0">${esc(prompt)}</div><button class="btn small" id="dySay" style="margin-top:8px">${IC.speak.replace('<svg', '<svg width="15" height="15"')} Escuchar</button></div>
    <div class="timer" id="dyT" style="margin-top:14px">0:00</div>
    <button class="rec" id="dyRec">${IC.mic}</button><p class="muted" style="text-align:center;font-size:13px;margin:0" id="dyHint">Toca para grabar (máximo 5 minutos)</p>
    <div class="h2">Mis grabaciones</div><div id="dyList"><div class="spinner"></div></div>
    <p class="meta" style="margin-top:10px">Las grabaciones se guardan solo en este dispositivo (no se suben a tu cuenta porque ocupan mucho).</p>`;
  $('#dySay').onclick = () => TTS.speak(prompt);
  const paintList = async () => {
    let L = []; try { L = await IDB.all(); } catch (e) { $('#dyList').innerHTML = '<div class="muted">Este navegador no permite guardar grabaciones.</div>'; return; }
    $('#dyList').innerHTML = L.length ? `<div class="card">${L.map(x => `<div class="note" style="flex-direction:column;align-items:stretch"><div class="row"><b class="grow">${new Date(x.date).toLocaleDateString('es-ES', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' })}</b><span class="muted">${Math.floor(x.sec / 60)}:${String(x.sec % 60).padStart(2, '0')}</span><button class="mini" data-dydel="${x.id}">${IC.trash}</button></div><div class="muted" style="font-size:13.5px">${esc(x.prompt)}</div><audio controls preload="none" src="${URL.createObjectURL(x.blob)}" style="width:100%;margin-top:6px"></audio></div>`).join('')}</div>` : '<div class="empty">Aún no tienes grabaciones.</div>';
  };
  paintList();
  let rec = null;
  $('#dyRec').onclick = async () => {
    if (rec) { rec.mr.stop(); return; }
    if (!navigator.mediaDevices || !window.MediaRecorder) { toast('Este navegador no permite grabar'); return; }
    let stream; try { stream = await navigator.mediaDevices.getUserMedia({ audio: true }); } catch (e) { toast('Necesito permiso para usar el micrófono'); return; }
    const chunks = []; const mr = new MediaRecorder(stream); const t0 = Date.now();
    rec = { mr, stream };
    mr.ondataavailable = e => e.data.size && chunks.push(e.data);
    mr.onstop = async () => {
      clearInterval(rec.tm); stream.getTracks().forEach(t => t.stop());
      const sec = Math.round((Date.now() - t0) / 1000); rec = null;
      if (!$('#dyRec')) return;
      $('#dyRec').classList.remove('on'); $('#dyRec').innerHTML = IC.mic; $('#dyHint').textContent = 'Toca para grabar otra vez';
      if (sec < 2) return;
      await IDB.put({ id: uid(), date: Date.now(), sec, prompt, blob: new Blob(chunks, { type: mr.mimeType || 'audio/mp4' }) });
      addSpeak(sec); const t = today(); t.spoke = (t.spoke || 0) + 1; saveStats(); toast('Grabación guardada'); paintList();
    };
    mr.start(); $('#dyRec').classList.add('on'); $('#dyRec').innerHTML = IC.stop; $('#dyHint').textContent = 'Grabando… toca para terminar';
    rec.tm = setInterval(() => { const s = Math.round((Date.now() - t0) / 1000); if ($('#dyT')) $('#dyT').textContent = Math.floor(s / 60) + ':' + String(s % 60).padStart(2, '0'); if (s >= 300) mr.stop(); }, 500);
    REC = { mr, stream };
  };
  $('#view').onclick = async e => { const d = e.target.closest('[data-dydel]'); if (d && confirm('¿Borrar esta grabación?')) { await IDB.del(d.dataset.dydel); paintList(); } };
}

/* ---------- conversación con IA ---------- */
const AI_SCENES = [
  ['free', 'Charla libre', 'Hablamos de lo que quieras', 'a friendly British person in their late twenties having a relaxed chat. Ask about the user\'s life, interests and opinions.'],
  ['smalltalk', 'Small talk', 'Una conversación casual con un desconocido', 'a friendly stranger at a party in London making small talk.'],
  ['pub', 'En el pub', 'Pedir, charlar y bromear', 'a bartender and later a chatty local at a busy London pub.'],
  ['interview', 'Entrevista en un despacho', 'Preguntas típicas de una entrevista', 'a partner at an international law firm in London interviewing the user for a trainee position. Ask one question at a time, including competency and motivation questions.'],
  ['client', 'Reunión con un cliente', 'Un cliente con un problema contractual', 'a business client who has a dispute with a supplier and wants advice. Be realistic and a bit worried.'],
  ['debate', 'Debate', 'Defiende tu opinión sobre un tema', 'a debate partner. Choose a current, interesting topic (technology, work, cities, education) and politely challenge the user\'s opinions.'],
  ['travel', 'De viaje', 'Hotel, restaurante y direcciones', 'various people the user meets while travelling in the UK (receptionist, waiter, passer-by).'],
  ['custom', 'Tema propio', 'Tú eliges la situación', '']
];
let AICHAT = null;
function aiKey() { return store.get('aikey', ''); }
async function aiCall(system, messages, max = 400) {
  const key = aiKey(); if (!key) throw new Error('nokey');
  let r;
  try {
    r = await fetch('https://api.anthropic.com/v1/messages', { method: 'POST', headers: { 'content-type': 'application/json', 'x-api-key': key, 'anthropic-version': '2023-06-01', 'anthropic-dangerous-direct-browser-access': 'true' },
      body: JSON.stringify({ model: S.aiModel || 'claude-haiku-5-5', max_tokens: max, system, messages }) });
  } catch (e) { throw new Error('Sin conexión'); }
  const j = await r.json().catch(() => ({}));
  if (!r.ok) throw new Error(r.status === 401 ? 'La clave de la IA no es válida. Revísala en Ajustes.' : r.status === 400 && /credit/i.test(JSON.stringify(j)) ? 'Tu cuenta de la API no tiene saldo. Añade crédito en console.anthropic.com.' : (j.error && j.error.message) || 'Error ' + r.status);
  return (j.content || []).map(c => c.text || '').join('').trim();
}
function renderAI(arg) {
  if (!aiKey()) {
    $('#view').innerHTML = `<div class="h1">Conversación con IA</div><p class="sub">Un compañero de conversación que habla como un nativo, te sigue la charla por voz o por escrito y al final te corrige.</p>
      <div class="card pad"><b>Cómo activarlo</b><ol class="steps"><li>Entra en <a href="https://console.anthropic.com" target="_blank" rel="noopener">console.anthropic.com</a> y crea una cuenta.</li><li>En Billing añade un poco de crédito. Con el modelo rápido, cada conversación cuesta céntimos.</li><li>En API Keys pulsa «Create Key» y copia la clave (empieza por sk-ant-).</li><li>Pégala aquí abajo. Se guarda solo en este dispositivo.</li></ol>
      <label class="lbl">Clave de la API</label><input class="input" id="akIn" type="password" placeholder="sk-ant-…" autocomplete="off" autocapitalize="off" spellcheck="false"><button class="btn primary block" id="akSave" style="margin-top:10px">Guardar y empezar</button></div>`;
    $('#akSave').onclick = () => { const k = $('#akIn').value.trim(); if (!/^sk-/.test(k)) { toast('La clave debe empezar por sk-'); return; } store.set('aikey', k); renderAI(); };
    return;
  }
  if (!arg) {
    $('#view').innerHTML = `<div class="h1">Conversación con IA</div><p class="sub">Elige una situación. Puedes hablar con el micrófono o escribir. Cuando termines, pulsa «Terminar y corregir».</p>
      <div class="card">${AI_SCENES.map(s => `<a class="note" href="#ai/${s[0]}" style="text-decoration:none;color:inherit"><div class="grow"><span class="term">${esc(s[1])}</span><div class="es">${esc(s[2])}</div></div><span class="muted">›</span></a>`).join('')}</div>`;
    return;
  }
  const sc = AI_SCENES.find(s => s[0] === arg) || AI_SCENES[0];
  if (sc[0] === 'custom' && !(AICHAT && AICHAT.scene === 'custom')) {
    const t = prompt('Describe la situación (en español o inglés). Por ejemplo: «Soy un cliente que quiere comprar una empresa»'); if (!t) return go('#ai');
    sc[3] = 'someone in this situation chosen by the user: ' + t;
  }
  AICHAT = { scene: sc[0], msgs: [], voice: store.get('aivoice', true) };
  const system = `You are ${sc[3]} You are talking to Iker, a 20-year-old Spanish law student who wants to sound like a native speaker. Speak natural, modern British English, the way people really talk (contractions, common phrasal verbs and idioms), at a level he can follow. Keep each reply short: 1 to 3 sentences, then usually ask a question to keep the conversation going. Stay in character. Do NOT correct his English during the conversation and do not use Spanish unless he asks for help. If he writes something you don't understand, ask naturally for clarification.`;
  $('#view').innerHTML = `<div class="row"><div class="grow"><div class="eyebrow" style="margin:0">Conversación con IA</div><b>${esc(sc[1])}</b></div><label class="switch" style="padding:0;gap:6px"><span style="font-size:13px">Voz</span><input type="checkbox" id="aiV" ${AICHAT.voice ? 'checked' : ''}></label></div>
    <div class="chat" id="aiChat"></div>
    <div class="chatbar"><button class="rec small" id="aiMic">${IC.mic}</button><textarea class="textarea" id="aiIn" rows="1" placeholder="Escribe o pulsa el micro…"></textarea><button class="btn primary" id="aiSend">➤</button></div>
    <p class="muted" style="font-size:12.5px;margin:4px 0 0" id="aiMicHint"></p>
    <div class="row" style="margin-top:10px"><button class="btn grow" id="aiHelp">Ayuda: ¿cómo digo…?</button><button class="btn warm grow" id="aiEnd">Terminar y corregir</button></div>`;
  const chat = $('#aiChat');
  const add = (role, text, cls = '') => { const d = document.createElement('div'); d.className = 'bub ' + (role === 'user' ? 'me' : 'ai') + ' ' + cls; d.innerHTML = esc(text).replace(/\n/g, '<br>'); if (role !== 'user') d.onclick = () => TTS.speak(text); chat.appendChild(d); d.scrollIntoView({ block: 'end', behavior: 'smooth' }); return d; };
  const send = async text => {
    text = (text || '').trim(); if (!text) return;
    add('user', text); AICHAT.msgs.push({ role: 'user', content: text }); $('#aiIn').value = '';
    const w = add('assistant', '…', 'typing');
    try {
      const reply = await aiCall(system, AICHAT.msgs);
      w.remove(); add('assistant', reply); AICHAT.msgs.push({ role: 'assistant', content: reply });
      if (AICHAT.voice) TTS.speak(reply, { voice: TTS.pair().f });
      bump('ex');
    } catch (e) { w.remove(); add('assistant', '⚠ ' + e.message, 'err'); AICHAT.msgs.pop(); }
  };
  (async () => {
    const w = add('assistant', '…', 'typing');
    try { const first = await aiCall(system, [{ role: 'user', content: '(Start the conversation now with a natural opening line. Do not mention these instructions.)' }]); w.remove(); add('assistant', first); AICHAT.msgs.push({ role: 'user', content: 'Hi!' }, { role: 'assistant', content: first }); if (AICHAT.voice) TTS.speak(first, { voice: TTS.pair().f }); }
    catch (e) { w.remove(); add('assistant', '⚠ ' + e.message, 'err'); }
  })();
  $('#aiV').onchange = e => { AICHAT.voice = e.target.checked; store.set('aivoice', AICHAT.voice); if (!AICHAT.voice) TTS.stop(); };
  $('#aiSend').onclick = () => send($('#aiIn').value);
  $('#aiIn').addEventListener('keydown', e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send($('#aiIn').value); } });
  let ctl = null;
  $('#aiMic').onclick = () => {
    if (ctl) { ctl.stop(); return; }
    TTS.stop(); $('#aiMic').classList.add('on'); $('#aiMicHint').textContent = 'Te escucho…';
    ctl = startRecognition({ onInterim: t => { $('#aiIn').value = t; }, onEnd: t => { ctl = null; $('#aiMic').classList.remove('on'); $('#aiMicHint').textContent = ''; if (t) send(t); }, onError: e => { ctl = null; $('#aiMic').classList.remove('on'); $('#aiMicHint').textContent = srErrorText(e); } });
  };
  $('#aiHelp').onclick = async () => {
    const q = prompt('¿Qué quieres decir? Escríbelo en español'); if (!q) return;
    const w = add('assistant', '…', 'typing');
    try { const r = await aiCall('You help a Spanish speaker say things naturally in British English. Reply in Spanish with 2 natural English options (casual and neutral), each on its own line, then one short tip. Be brief.', [{ role: 'user', content: q }], 300); w.remove(); add('assistant', r, 'help'); }
    catch (e) { w.remove(); add('assistant', '⚠ ' + e.message, 'err'); }
  };
  $('#aiEnd').onclick = async () => {
    const mine = AICHAT.msgs.filter(m => m.role === 'user' && m.content !== 'Hi!');
    if (!mine.length) { toast('Primero di algo'); return; }
    const w = add('assistant', 'Preparando tus correcciones…', 'typing');
    try {
      const transcript = AICHAT.msgs.slice(1).map(m => (m.role === 'user' ? 'IKER: ' : 'PARTNER: ') + m.content).join('\n');
      const out = await aiCall('You are an expert English teacher for Spanish speakers. Reply ONLY with JSON.', [{ role: 'user', content: `Conversation:\n${transcript}\n\nAnalyse only IKER's lines. Return JSON: {"summary_es":"2 frases en español sobre cómo lo ha hecho","corrections":[{"said":"...","better":"...","why_es":"..."}],"natural":[{"said":"...","native":"...","why_es":"..."}],"expressions":[{"en":"useful native expression related to the conversation","es":"traducción","example":"example sentence"}]}. Max 6 corrections, max 4 natural rewrites (sentences that were correct but not how a native would say them), exactly 5 expressions.` }], 1500);
      const j = JSON.parse(out.match(/\{[\s\S]*\}/)[0]);
      w.remove();
      const box = document.createElement('div'); box.className = 'card pad aifb';
      box.innerHTML = `<b>Tu corrección</b><p>${esc(j.summary_es || '')}</p>
        ${(j.corrections || []).length ? `<div class="eyebrow">Errores</div>${j.corrections.map(c => `<div class="fbi"><div class="wrongline">✗ ${esc(c.said)}</div><div class="rightline">✓ ${esc(c.better)}</div><div class="muted" style="font-size:13.5px">${esc(c.why_es)}</div></div>`).join('')}` : '<p>No hay errores importantes. ¡Muy bien!</p>'}
        ${(j.natural || []).length ? `<div class="eyebrow">Más natural</div>${j.natural.map(c => `<div class="fbi"><div class="muted">${esc(c.said)}</div><div class="rightline">→ ${esc(c.native)}</div><div class="muted" style="font-size:13.5px">${esc(c.why_es)}</div></div>`).join('')}` : ''}
        <div class="eyebrow">Expresiones para la próxima vez</div>${(j.expressions || []).map((x, k) => `<div class="fbi row"><div class="grow"><b>${esc(x.en)}</b> · ${esc(x.es)}<div class="ctx muted" style="font-size:14px">${esc(x.example)}</div></div><button class="mini" data-aix="${k}">${IC.plus}</button></div>`).join('')}
        <button class="btn primary block" id="aiSaveAll" style="margin-top:10px">Guardar correcciones y expresiones en Mío</button>`;
      chat.appendChild(box); box.scrollIntoView({ block: 'start', behavior: 'smooth' });
      const saveX = x => NOTES.unshift({ id: uid(), term: x.en, cat: guessCat(x.en), es: x.es, ex: x.example, src: 'Conversación IA · ' + sc[1], created: Date.now(), upd: Date.now(), srs: newSrs() });
      box.onclick = e => { const b = e.target.closest('[data-aix]'); if (b) { saveX(j.expressions[+b.dataset.aix]); saveNotes(); b.outerHTML = '<span class="tag good">✓</span>'; } };
      $('#aiSaveAll').onclick = () => {
        (j.expressions || []).forEach(saveX);
        (j.corrections || []).concat(j.natural || []).forEach(c => NOTES.unshift({ id: uid(), term: c.better || c.native, cat: 'other', es: '', note: 'Dije: ' + c.said + ' · ' + c.why_es, src: 'Corrección IA', created: Date.now(), upd: Date.now(), srs: newSrs() }));
        saveNotes(); toast('Guardado en Mío'); $('#aiSaveAll').disabled = true;
      };
    } catch (e) { w.remove(); add('assistant', '⚠ No he podido preparar la corrección: ' + e.message, 'err'); }
  };
}

'use strict';
/* ==========================================================
   LINGUASKILL · apartado para aprobar el examen
   Versión 1: Reading completo por tareas, con corrección
   explicada, cronómetro, progreso por nivel y repaso de fallos.
   El contenido está en content/ls/*.js (window.LSR).
   ========================================================== */
window.LSR = window.LSR || {};

/* ---------- las 9 tareas oficiales de Reading ---------- */
const LS_TASKS = {
  short: {
    n: 1, name: 'Lectura corta', en: 'One-question multiple choice', lv: 'B1–B2', min: 1, ic: 'note', round: true,
    desc: 'Lees un aviso, una nota, un mensaje o un correo corto y eliges la frase que dice lo mismo. Tres opciones.',
    instr: 'Read the text. Choose the sentence or phrase that is closest in meaning to the text.',
    how: ['Lee el texto entero antes de mirar las opciones. Fíjate en quién lo escribe y para qué.', 'Compara cada opción con lo que el texto dice de verdad, no con lo que parece lógico.', 'Desconfía de las opciones que repiten palabras del texto: suelen ser la trampa.']
  },
  disc: {
    n: 2, name: 'Hueco suelto', en: 'One-question multiple-choice gap-fill', lv: 'B2–C2', min: 0.5, ic: 'gap', round: true,
    desc: 'Una sola frase con un hueco y cuatro opciones. Mide vocabulario, collocations y gramática con palabras.',
    instr: 'Choose the word or phrase that best fills the gap.',
    how: ['Descarta primero las opciones que sabes que están mal.', 'Mira las palabras justo antes y justo después del hueco: suelen dar la respuesta (una preposición, un sustantivo que pide un verbo concreto).', 'Muchas veces las cuatro opciones significan casi lo mismo y solo una encaja con las palabras de alrededor.']
  },
  mcc: {
    n: 3, name: 'Cinco huecos con opciones', en: 'Five-question multiple-choice gap-fill', lv: 'B1–C2', min: 3, ic: 'list',
    desc: 'Un texto corto (60–150 palabras) con cinco huecos. Para cada uno eliges entre cuatro palabras o expresiones.',
    instr: 'Read the text. For each gap, choose the correct answer.',
    how: ['Lee primero el texto entero para entender de qué va.', 'Piensa en qué se diferencian las cuatro opciones: significado, preposición que llevan, si son formales o no.', 'Comprueba que tu elección tiene sentido en todo el texto, no solo en la frase.']
  },
  open: {
    n: 4, name: 'Cinco huecos abiertos', en: 'Five-question open gap-fill', lv: 'B1–C2', min: 4, ic: 'pen',
    desc: 'Un texto corto con cinco huecos y sin opciones. Escribes tú una sola palabra en cada uno, casi siempre gramatical.',
    instr: 'Read the text. Write ONE word in each gap.',
    how: ['Lee el texto entero ignorando los huecos para entender el sentido.', 'Las palabras que faltan son gramaticales: preposiciones, artículos, pronombres, auxiliares, conectores.', 'Escribe una sola palabra y revisa que encaje en significado y en gramática.']
  },
  comp5: {
    n: 5, name: 'Comprensión, cinco preguntas', en: 'Five-question multiple choice', lv: 'B1–C2', min: 8, ic: 'bookopen',
    desc: 'Un texto largo (300–600 palabras) y cinco preguntas de opción múltiple en el mismo orden que el texto.',
    instr: 'Read the text and answer the questions. The questions follow the order of the text.',
    how: ['Lee el texto rápido una vez para entender la idea general.', 'Luego lee cada pregunta y sus opciones y vuelve al texto a buscar la parte exacta.', 'Elige la opción que responde del todo a la pregunta. Las preguntas suelen ir de opinión, propósito, idea principal e implicaciones.']
  },
  comp2: {
    n: 6, name: 'Comprensión, dos preguntas', en: 'Two-question multiple choice', lv: 'B2–C2', min: 3, ic: 'quiz',
    desc: 'Un texto de unas 200–250 palabras y dos preguntas de cuatro opciones, también en el orden del texto.',
    instr: 'Read the text and answer the two questions. The questions follow the order of the text.',
    how: ['Haz una lectura rápida y después ve pregunta por pregunta.', 'La segunda pregunta suele ir sobre la intención del autor o la idea del texto entero.', 'Cuidado con las opciones que son verdad en general pero no son lo que dice el texto.']
  },
  para: {
    n: 7, name: 'Párrafos eliminados', en: 'Missing paragraph text completion', lv: 'B2–C2', min: 10, ic: 'order',
    desc: 'Un texto largo del que han quitado cinco párrafos. Los recolocas eligiendo entre seis; uno sobra.',
    instr: 'Five paragraphs have been removed from the text. Choose the paragraph that fits each gap. There is one extra paragraph that you do not need to use.',
    how: ['Usa como pistas el párrafo de antes y el de después de cada hueco: pronombres, fechas, nombres, ideas que se retoman.', 'Elige el que mejor encaja y piensa por qué no valen los demás.', 'Al final relee el texto completo con tus párrafos puestos para ver si fluye.']
  },
  sent: {
    n: 8, name: 'Frases eliminadas', en: 'Missing sentence text completion', lv: 'B1–C1', min: 7, ic: 'cards',
    desc: 'Un texto con cinco frases quitadas. Las recolocas eligiendo entre ocho; tres sobran.',
    instr: 'Five sentences have been removed from the text. Choose the sentence that fits each gap. There are three extra sentences that you do not need to use.',
    how: ['En cada hueco estudia las ideas y las palabras de alrededor: la frase de antes y la de después.', 'Busca referencias: this, these, it, such, however, as a result… apuntan a algo concreto.', 'Relee el texto entero al final para confirmar que se lee con naturalidad.']
  },
  match: {
    n: 9, name: 'Emparejar textos', en: 'Multiple text matching', lv: 'B2–C2', min: 9, ic: 'chat',
    desc: 'Cuatro textos breves sobre un mismo tema (500–600 palabras en total) y preguntas que tienes que unir con el texto que corresponde.',
    instr: 'Read the four texts. For each question, choose the text (A, B, C or D) that it refers to.',
    how: ['Lee las preguntas primero y luego los cuatro textos buscando la opinión o el dato que pide cada una.', 'Varios textos hablan de lo mismo con matices distintos: compara, no te quedes con la primera coincidencia.', 'Revisa al final que cada respuesta está justificada por una frase concreta.']
  }
};
const LS_ORDER = ['short', 'disc', 'mcc', 'open', 'comp5', 'comp2', 'para', 'sent', 'match'];
const LS_LV = { all: 'Todos', b: 'B1–B2', C1: 'C1', C2: 'C2' };
const LS_TC = ['t-blue', 't-orange', 't-green', 't-teal', 't-red', 't-ochre', 't-slate', 't-plum', 't-blue'];

let LSP = store.get('lsprog', {});
const saveLSP = () => store.set('lsprog', LSP);

function lsItems(task) { return (window.LSR[task] || []).map(x => (x.task = task, x)); }
function lsById(task, id) { return lsItems(task).find(x => x.id === id) || null; }
function lsAll() { return LS_ORDER.flatMap(lsItems); }
function lsLvOk(x, lv) { return !lv || lv === 'all' || (lv === 'b' ? /^B/.test(x.lvl) : x.lvl === lv); }
function lsQCount(x) {
  if (x.task === 'short' || x.task === 'disc') return 1;
  if (x.task === 'mcc' || x.task === 'open') return x.gaps.length;
  if (x.task === 'comp5' || x.task === 'comp2') return x.qs.length;
  if (x.task === 'para' || x.task === 'sent') return x.key.length;
  if (x.task === 'match') return x.prompts.length;
  return 1;
}
function lsTaskStats(task, lv) {
  const it = lsItems(task).filter(x => lsLvOk(x, lv));
  let done = 0, ok = 0, tot = 0, wrong = 0;
  it.forEach(x => { const p = LSP[x.id]; if (!p) return; done++; ok += p.ok; tot += p.tot; if (p.wrong) wrong++; });
  return { n: it.length, done, ok, tot, wrong, pct: tot ? Math.round(ok / tot * 100) : null };
}
function lsLevelStats() {
  const r = { b: { ok: 0, tot: 0 }, C1: { ok: 0, tot: 0 }, C2: { ok: 0, tot: 0 } };
  lsAll().forEach(x => { const p = LSP[x.id]; if (!p) return; const k = /^B/.test(x.lvl) ? 'b' : x.lvl; if (!r[k]) return; r[k].ok += p.ok; r[k].tot += p.tot; });
  return r;
}
function lsRecord(x, ok, tot, sec) {
  const p = LSP[x.id] || { n: 0, best: 0 };
  p.n = (p.n || 0) + 1; p.ok = ok; p.tot = tot; p.best = Math.max(p.best || 0, ok); p.t = Math.round(sec || 0); p.wrong = ok < tot; p.upd = Date.now();
  LSP[x.id] = p; saveLSP();
  bump('ex', tot);
  if (sec > 3) bump('sec', Math.min(1800, Math.round(sec)));
}
/* siguiente ejercicio: primero los que no has hecho, luego los fallados, luego el más antiguo */
function lsNext(task, lv, notId) {
  const it = lsItems(task).filter(x => lsLvOk(x, lv) && x.id !== notId);
  if (!it.length) return null;
  const fresh = it.filter(x => !LSP[x.id]);
  if (fresh.length) return fresh[0];
  const wrong = it.filter(x => LSP[x.id].wrong).sort((a, b) => LSP[a.id].upd - LSP[b.id].upd);
  if (wrong.length) return wrong[0];
  return it.slice().sort((a, b) => LSP[a.id].upd - LSP[b.id].upd)[0];
}
const lsLvTag = l => `<span class="lslv lv-${esc(l)}">${esc(l)}</span>`;
const lsPctClass = p => p == null ? '' : p >= 80 ? 'hi' : p >= 60 ? 'mid' : 'lo';
const LETTERS = 'ABCDEFGH';
const lsFmt = s => { s = Math.max(0, Math.round(s)); return Math.floor(s / 60) + ':' + String(s % 60).padStart(2, '0'); };
function lsDaysLeft() {
  if (!S.lsDate) return null;
  const d = new Date(S.lsDate + 'T09:00:00'); if (isNaN(d)) return null;
  const t = new Date(); t.setHours(0, 0, 0, 0);
  return Math.round((new Date(S.lsDate + 'T00:00:00') - t) / DAY);
}
function lsRecommend() {
  /* la tarea con peor porcentaje entre las que ya has probado, o la primera sin empezar */
  const st = LS_ORDER.map(k => ({ k, s: lsTaskStats(k) }));
  const unstarted = st.find(x => !x.s.done && x.s.n);
  const tried = st.filter(x => x.s.done && x.s.n > x.s.done || (x.s.done && x.s.wrong)).sort((a, b) => (a.s.pct || 0) - (b.s.pct || 0));
  if (tried.length && tried[0].s.pct != null && tried[0].s.pct < 75) return tried[0].k;
  if (unstarted) return unstarted.k;
  return tried.length ? tried[0].k : 'comp5';
}

/* ==========================================================
   PANTALLA PRINCIPAL
   ========================================================== */
function renderLS() {
  const all = lsAll();
  const done = all.filter(x => LSP[x.id]);
  const ok = done.reduce((a, x) => a + LSP[x.id].ok, 0), tot = done.reduce((a, x) => a + LSP[x.id].tot, 0);
  const pct = tot ? Math.round(ok / tot * 100) : null;
  const left = lsDaysLeft();
  const rec = lsRecommend();
  const lvS = lsLevelStats();
  const failed = all.filter(x => LSP[x.id] && LSP[x.id].wrong).length;
  const C = 2 * Math.PI * 26, frac = pct == null ? 0 : pct / 100;
  const lvRow = (k, lab) => { const s = lvS[k]; const p = s.tot ? Math.round(s.ok / s.tot * 100) : 0; return `<div class="lsbar"><div class="row"><span>${lab}</span><span class="muted">${s.tot ? p + ' % · ' + s.tot + ' preguntas' : 'sin datos'}</span></div><div class="progressbar"><i style="width:${p}%;${p < 60 && s.tot ? 'background:var(--warm)' : ''}"></i></div></div>`; };
  $('#view').innerHTML = `
    <div class="kicker">Tu examen · objetivo C1</div>
    <div class="h1">Linguaskill</div>
    <div class="card lshero">
      <div class="top"><svg class="ring" viewBox="0 0 62 62" aria-hidden="true"><circle cx="31" cy="31" r="26" fill="none" stroke="var(--surface2)" stroke-width="8"/><circle cx="31" cy="31" r="26" fill="none" stroke="var(--accent)" stroke-width="8" stroke-linecap="round" stroke-dasharray="${C.toFixed(1)}" stroke-dashoffset="${(C * (1 - frac)).toFixed(1)}" transform="rotate(-90 31 31)"/><text x="31" y="35.5" text-anchor="middle" class="ringtxt">${pct == null ? '–' : pct + '%'}</text></svg>
        <div class="grow"><b>${pct == null ? 'Empieza por el Reading' : 'Aciertas el ' + pct + ' % en Reading'}</b><span>${done.length ? done.length + ' de ' + all.length + ' ejercicios hechos' : all.length + ' ejercicios con el formato del examen'}</span>
        <button class="lsdate" id="lsDate">${ICF.clock}${left == null ? 'Pon la fecha de tu examen' : left > 0 ? 'Faltan ' + left + (left === 1 ? ' día' : ' días') + ' para el examen' : left === 0 ? 'Tu examen es hoy' : 'Examen hecho el ' + new Date(S.lsDate).toLocaleDateString('es-ES', { day: 'numeric', month: 'long' })}</button></div></div>
      <a class="btn primary" href="#lst/${rec}">${ICF.play}Practicar ahora · ${esc(LS_TASKS[rec].name)}</a>
    </div>
    <div class="h2">Reading · las 9 tareas</div>
    <div class="group">${LS_ORDER.map((k, i) => { const T = LS_TASKS[k], s = lsTaskStats(k); return `<a class="li" href="#lst/${k}"><span class="tile lsnum" style="--tc:var(--${LS_TC[i]})">${T.n}</span><span class="g"><b>${esc(T.name)}</b><span>${esc(T.lv)} · ${esc(T.en)}</span></span><span class="m lsm">${s.done ? `<b class="pctchip ${lsPctClass(s.pct)}">${s.pct} %</b><small>${s.done}/${s.n}</small>` : `<small>${s.n} nuevos</small>`}</span><span class="chev"></span></a>`; }).join('')}</div>
    <div class="h2">Por nivel</div>
    <div class="card pad">${lvRow('b', 'B1–B2')}${lvRow('C1', 'C1 · lo que necesitas (180–199)')}${lvRow('C2', 'C2')}<p class="meta" style="margin-top:4px">El examen es adaptativo. Si aciertas, las preguntas suben de nivel. Para sacar C1 tienes que manejarte bien en las de C1.</p></div>
    <div class="h2">Más</div>
    <div class="group">
      <a class="li" href="#" id="lsVoc"><span class="tile" style="--tc:var(--t-green)">${ICF.cap}</span><span class="g"><b>Mi vocabulario del examen</b><span>${(() => { const L = LISTS.find(x => x.name === 'Linguaskill'); return L && L.items.length ? L.items.length + ' palabras y expresiones guardadas' : 'Las palabras que guardes de los ejercicios irán aquí'; })()}</span></span><span class="chev"></span></a>
      <a class="li" href="#lsfail"><span class="tile" style="--tc:var(--t-red)">${ICF.target}</span><span class="g"><b>Repetir lo que fallé</b><span>${failed ? failed + (failed === 1 ? ' ejercicio con errores' : ' ejercicios con errores') : 'Aquí irán los ejercicios en los que falles algo'}</span></span><span class="chev"></span></a>
      <a class="li" href="#lsinfo"><span class="tile" style="--tc:var(--t-slate)">${ICF.cap}</span><span class="g"><b>Cómo es el examen</b><span>Formato, tiempos, puntuación y qué cuenta para el C1</span></span><span class="chev"></span></a>
    </div>
    <div class="notice">Listening, Speaking y los simulacros completos llegarán en las próximas versiones de este apartado.</div>`;
  $('#lsVoc').onclick = e => { e.preventDefault(); go('#list/' + lsList().id); };
  $('#lsDate').onclick = () => {
    openSheet(`<h3>Fecha del examen</h3><p class="muted" style="margin-top:4px">Para ver cuántos días te quedan. Puedes cambiarla cuando quieras.</p>
      <input class="input" type="date" id="lsD" value="${esc(S.lsDate || '')}" min="2026-11-01">
      <div class="row" style="margin-top:14px"><button class="btn grow" id="lsDx">Quitar</button><button class="btn primary grow" id="lsDok">Guardar</button></div>`, b => {
      $('#lsDok', b).onclick = () => { S.lsDate = $('#lsD', b).value || ''; saveSettings(); closeSheet(); renderLS(); };
      $('#lsDx', b).onclick = () => { S.lsDate = ''; saveSettings(); closeSheet(); renderLS(); };
    });
  };
}

/* ==========================================================
   PANTALLA DE UNA TAREA
   ========================================================== */
function lsItemLabel(x) {
  if (x.title) return x.title;
  if (x.task === 'short') return (x.kind ? x.kind + ' · ' : '') + stripTags(x.text).replace(/\s+/g, ' ').slice(0, 60) + '…';
  return x.id;
}
function renderLSTask(task) {
  const T = LS_TASKS[task]; if (!T) { go('#ls'); return; }
  const lv = S.lsLvl || 'all';
  const items = lsItems(task);
  const cnt = k => items.filter(x => lsLvOk(x, k)).length;
  const list = items.filter(x => lsLvOk(x, lv));
  const s = lsTaskStats(task, lv);
  const nx = lsNext(task, lv);
  const showList = task !== 'disc';
  $('#view').innerHTML = `
    <div class="kicker">Reading · tarea ${T.n} de 9</div>
    <div class="h1 nopad">${esc(T.name)}</div>
    <p class="sub">${esc(T.en)} · ${esc(T.lv)} · unos ${T.min < 1 ? '30 segundos' : T.min + (T.min === 1 ? ' minuto' : ' minutos')} por ejercicio</p>
    <div class="card pad">
      <p style="margin:0 0 10px;font-size:15.5px">${esc(T.desc)}</p>
      <details class="lshow"><summary>Consejos de Cambridge para esta tarea</summary><ul class="steps">${T.how.map(h => `<li>${esc(h)}</li>`).join('')}</ul></details>
    </div>
    <div class="seg" id="lsLv">${Object.entries(LS_LV).map(([k, n]) => `<button data-lv="${k}" class="${lv === k ? 'on' : ''}" ${cnt(k) ? '' : 'disabled'}>${n} <span class="muted">${cnt(k)}</span></button>`).join('')}</div>
    <div class="stats"><div class="card stat"><b>${s.done}/${s.n}</b><span>hechos</span></div><div class="card stat"><b>${s.pct == null ? '–' : s.pct + ' %'}</b><span>aciertos</span></div><div class="card stat"><b>${s.wrong}</b><span>con fallos</span></div></div>
    ${T.round ? `<a class="btn primary block" href="#lsq/${task}/round">${ICF.bolt}Ronda de 10 seguidas</a>${nx ? `<a class="btn block" href="#lsq/${task}/${esc(nx.id)}" style="margin-top:8px">Hacer solo uno</a>` : ''}`
      : nx ? `<a class="btn primary block" href="#lsq/${task}/${esc(nx.id)}">${ICF.play}${LSP[nx.id] ? 'Repetir: ' : 'Empezar: '}${esc(lsItemLabel(nx))}</a>` : ''}
    <label class="switch" style="margin-top:6px"><span>Cronómetro con el tiempo recomendado</span><input type="checkbox" id="lsTm" ${S.lsTimer !== false ? 'checked' : ''}></label>
    ${showList ? `<div class="h2">Ejercicios <span class="muted" style="font-size:14px;font-weight:500">${list.length}</span></div>
    <div class="group">${list.map((x, i) => { const p = LSP[x.id]; return `<a class="li lsrow" href="#lsq/${task}/${esc(x.id)}"><span class="lsidx">${i + 1}</span><span class="g"><b>${esc(lsItemLabel(x))}</b><span>${lsLvTag(x.lvl)}${x.topic ? ' · ' + esc(x.topic) : ''}</span></span><span class="m">${p ? `<b class="pctchip ${p.wrong ? 'lo' : 'hi'}">${p.ok}/${p.tot}</b>` : '<small class="muted">nuevo</small>'}</span><span class="chev"></span></a>`; }).join('')}</div>` : ''}`;
  $('#lsLv').onclick = e => { const b = e.target.closest('[data-lv]'); if (!b || b.disabled) return; S.lsLvl = b.dataset.lv; saveSettings(); renderLSTask(task); };
  $('#lsTm').onchange = e => { S.lsTimer = e.target.checked; saveSettings(); };
}

/* ==========================================================
   REPETIR LO QUE FALLÉ
   ========================================================== */
function renderLSFail() {
  const f = lsAll().filter(x => LSP[x.id] && LSP[x.id].wrong).sort((a, b) => LSP[b.id].upd - LSP[a.id].upd);
  $('#view').innerHTML = `<div class="h1 nopad">Repetir lo que fallé</div>
    <p class="sub">Los ejercicios en los que tu último intento tuvo algún error. Cuando los hagas sin fallos, desaparecen de aquí.</p>
    ${f.length ? `<div class="group">${f.map(x => { const p = LSP[x.id]; return `<a class="li" href="#lsq/${x.task}/${esc(x.id)}"><span class="tile lsnum" style="--tc:var(--${LS_TC[LS_TASKS[x.task].n - 1]})">${LS_TASKS[x.task].n}</span><span class="g"><b>${esc(lsItemLabel(x))}</b><span>${esc(LS_TASKS[x.task].name)} · ${esc(x.lvl)}</span></span><span class="m"><b class="pctchip lo">${p.ok}/${p.tot}</b></span><span class="chev"></span></a>`; }).join('')}</div>`
      : emptyBox('No tienes nada pendiente. Cuando falles algo en un ejercicio aparecerá aquí para repetirlo.', '#ls', 'Volver a Linguaskill')}`;
}

/* ==========================================================
   CÓMO ES EL EXAMEN
   ========================================================== */
function renderLSInfo() {
  $('#view').innerHTML = `<div class="h1 nopad">Cómo es el examen</div>
    <p class="sub">Linguaskill de Cambridge. Datos de las páginas oficiales de Cambridge English.</p>
    <div class="card pad lsinfo">
      <b>Cuatro módulos</b>
      <p>Reading, Listening, Writing y Speaking. Se hace en ordenador y el certificado lo emite Cambridge. Evalúa de B1 a C2 y no caduca, aunque cada empresa o institución puede decidir qué antigüedad acepta.</p>
      <b>El Reading es adaptativo</b>
      <p>No hay un número fijo de preguntas. Cada respuesta ayuda al ordenador a afinar tu nivel: si aciertas, sube la dificultad, y si fallas, baja. El módulo termina cuando ya ha identificado tu nivel con precisión. Dura unos 40 minutos y como máximo 59.</p>
      <b>No sabes qué tareas te saldrán</b>
      <p>Te saldrá una selección de las nueve tareas de este apartado. Por eso conviene dominarlas todas, sobre todo las de nivel alto (párrafos, frases y emparejar textos), que son las que aparecen cuando vas bien.</p>
    </div>
    <div class="h2">La escala de Cambridge</div>
    <div class="card"><table class="lstable"><tr><th>Nivel</th><th>Puntuación</th></tr><tr><td>C2</td><td>200–210</td></tr><tr class="hl"><td>C1 · tu objetivo</td><td>180–199</td></tr><tr><td>B2</td><td>160–179</td></tr><tr><td>B1</td><td>140–159</td></tr></table>
    <p class="meta" style="padding:0 16px 14px">Si en un módulo sacas menos de B1, ese módulo no aparece en el certificado. Los resultados llegan en unos 3–5 días laborables.</p></div>
    <div class="h2">Las tareas de Reading</div>
    <div class="card"><table class="lstable"><tr><th>Tarea</th><th>Formato</th><th>Nivel</th></tr>
      <tr><td>Lectura corta</td><td>1 pregunta, 3 opciones</td><td>B1–B2</td></tr>
      <tr><td>Hueco suelto</td><td>1 frase, 3–4 opciones</td><td>B2–C2</td></tr>
      <tr><td>Cinco huecos con opciones</td><td>60–150 palabras</td><td>B1–C2</td></tr>
      <tr><td>Cinco huecos abiertos</td><td>60–150 palabras, 1 palabra gramatical</td><td>B1–C2</td></tr>
      <tr><td>Comprensión, 5 preguntas</td><td>300–600 palabras</td><td>B1–C2</td></tr>
      <tr><td>Comprensión, 2 preguntas</td><td>200–250 palabras, 4 opciones</td><td>B2–C2</td></tr>
      <tr><td>Párrafos eliminados</td><td>5 huecos, 6 párrafos</td><td>B2–C2</td></tr>
      <tr><td>Frases eliminadas</td><td>5 huecos, 8 frases</td><td>B1–C1</td></tr>
      <tr><td>Emparejar textos</td><td>4 textos, 500–600 palabras</td><td>B2–C2</td></tr></table></div>
    <div class="h2">Cómo practicar aquí</div>
    <div class="card pad"><ul class="steps" style="margin:0">
      <li>Elige una tarea y un nivel. Si vas a por el C1, pasa la mayor parte del tiempo en C1 y algo en C2.</li>
      <li>Haz el ejercicio con el cronómetro, como en el examen, y pulsa Comprobar al terminar.</li>
      <li>Lee la explicación de cada fallo: por qué la correcta lo es y por qué la tuya no.</li>
      <li>Después de corregir, toca cualquier palabra del texto para ver su traducción y guardarla en tus palabras.</li>
      <li>Vuelve a «Repetir lo que fallé» unos días después.</li></ul></div>`;
}

/* ==========================================================
   EL EJERCICIO
   ========================================================== */
let LSQ = null;
STOPPERS.push(() => { if (LSQ && LSQ.int) clearInterval(LSQ.int); });

function renderLSItem(arg) {
  const [task, id] = String(arg || '').split('/');
  const T = LS_TASKS[task]; if (!T) { go('#ls'); return; }
  if (id === 'round') {
    const lv = S.lsLvl || 'all';
    let pool = lsItems(task).filter(x => lsLvOk(x, lv));
    if (!pool.length) pool = lsItems(task);
    const fresh = shuffle(pool.filter(x => !LSP[x.id])), wrong = shuffle(pool.filter(x => LSP[x.id] && LSP[x.id].wrong)), rest = shuffle(pool.filter(x => LSP[x.id] && !LSP[x.id].wrong));
    const q = fresh.concat(wrong, rest).slice(0, 10);
    LSQ = { task, round: { q, i: 0, ok: 0, res: [] } };
    lsStart(q[0]);
    return;
  }
  const x = lsById(task, id); if (!x) { go('#lst/' + task); return; }
  LSQ = { task };
  lsStart(x);
}
/* baraja las opciones en cada intento (con sus explicaciones) para que no memorices la posición */
function lsPerm(o) { const idx = shuffle(o.opts.map((_, i) => i)); const r = Object.assign({}, o, { opts: idx.map(i => o.opts[i]), a: idx.indexOf(o.a) }); if (o.ex) r.ex = idx.map(i => o.ex[i]); return r; }
function lsShuffled(x) {
  if (x.task === 'short' || x.task === 'disc') return lsPerm(x);
  if (x.task === 'comp5' || x.task === 'comp2') return Object.assign({}, x, { qs: x.qs.map(lsPerm) });
  if (x.task === 'mcc') return Object.assign({}, x, { gaps: x.gaps.map(lsPerm) });
  return x;
}
function lsStart(x) {
  if (LSQ.int) clearInterval(LSQ.int);
  x = lsShuffled(lsById(x.task, x.id) || x);
  Object.assign(LSQ, { x, ans: {}, checked: false, warned: false, score: null, t0: Date.now(), sec: 0, int: null });
  lsPaint();
  window.scrollTo(0, 0);
  if (S.lsTimer !== false) {
    LSQ.int = setInterval(() => { const el = $('#lsClock'); if (!el || LSQ.checked) return; const s = (Date.now() - LSQ.t0) / 1000; const lim = lsLimit(LSQ.x); el.querySelector('span').textContent = lsFmt(s) + ' / ' + lsFmt(lim); el.classList.toggle('over', s > lim); }, 1000);
  }
}
function lsLimit(x) { return Math.round(LS_TASKS[x.task].min * 60); }

/* ---------- texto: párrafos, huecos y palabras tocables ---------- */
function lsParas(text) { return String(text || '').trim().split(/\n\s*\n/).map(p => p.replace(/\s*\n\s*/g, ' ').trim()).filter(Boolean); }
/* envuelve las palabras para poder tocarlas después de corregir */
function lsWrap(s) { s = String(s || ''); let out = '', pos = 0; const re = /[A-Za-z][A-Za-z'’-]*[A-Za-z]|[A-Za-z]/g; let m; while ((m = re.exec(s))) { out += esc(s.slice(pos, m.index)) + `<span class="lw">${esc(m[0])}</span>`; pos = m.index + m[0].length; } return out + esc(s.slice(pos)); }
/* un párrafo con pistas resaltadas (solo tras corregir) */
function lsRich(p, clues) {
  if (!LSQ.checked) return esc(p);
  const marks = [];
  (clues || []).forEach(c => { if (!c.t) return; const i = p.indexOf(c.t); if (i >= 0 && !marks.some(m => i < m.b && i + c.t.length > m.a)) marks.push({ a: i, b: i + c.t.length, n: c.n }); });
  marks.sort((a, b) => a.a - b.a);
  let out = '', pos = 0;
  marks.forEach(m => { out += lsWrap(p.slice(pos, m.a)) + `<mark class="clue"><sup>${m.n}</sup>${lsWrap(p.slice(m.a, m.b))}</mark>`; pos = m.b; });
  return out + lsWrap(p.slice(pos));
}
/* sustituye los marcadores [1]…[5] por huecos */
function lsGapsIn(p, gapFn, clues) {
  const parts = p.split(/(\[\d\])/);
  return parts.map(s => { const m = s.match(/^\[(\d)\]$/); return m ? gapFn(+m[1] - 1) : lsRich(s, clues); }).join('');
}

function lsPaint() {
  const { x, task } = LSQ; const T = LS_TASKS[task];
  const r = LSQ.round;
  const head = `<div class="lshead"><span class="lschip">${T.n} · ${esc(T.name)}</span>${lsLvTag(x.lvl)}${S.lsTimer !== false && !LSQ.checked ? `<span class="lsclock" id="lsClock">${IC.clock}<span>0:00 / ${lsFmt(lsLimit(x))}</span></span>` : LSQ.checked && LSQ.sec ? `<span class="lsclock done">${IC.clock}<span>${lsFmt(LSQ.sec)}</span></span>` : ''}</div>
    ${r ? `<div class="ladder">${r.q.map((_, i) => `<span class="${i < r.i ? (r.res[i] ? 'ok' : 'bad') : i === r.i ? 'cur' : ''}"></span>`).join('')}</div>` : ''}
    <div class="lsinstr">${esc(T.instr)}</div>`;
  const body = { short: lsShort, disc: lsDisc, mcc: lsMcc, open: lsOpen, comp5: lsComp, comp2: lsComp, para: lsSlot, sent: lsSlot, match: lsMatch }[task](x);
  const single = task === 'short' || task === 'disc';
  const nq = lsQCount(x), answered = lsAnswered();
  let foot = '';
  if (!LSQ.checked && !single) foot = `<button class="btn primary block lscheck" id="lsCheck">${ICF.checkc}Comprobar${answered < nq ? ` <span class="lsleft">${nq - answered} sin responder</span>` : ''}</button>`;
  let banner = '';
  if (LSQ.checked) { const rf = lsResultFoot(); foot = rf.foot; banner = rf.banner; }
  $('#view').innerHTML = `<div class="lsq ${LSQ.checked ? 'checked' : ''}">${head}${banner}${body}${LSQ.checked ? lsVocabHTML(LSQ.x) : ''}${foot}</div>`;
  if (LSQ.checked) lsBindVocab($('#view'));
  lsBind();
}
function lsAnswered() { return Object.values(LSQ.ans).filter(v => v != null && v !== '').length; }

/* ---------- 1 · lectura corta ---------- */
function lsShort(x) {
  return `<div class="lsnotice kind-${esc((x.kind || '').toLowerCase())}">${x.kind ? `<div class="nk">${esc(x.kind)}</div>` : ''}${x.head ? `<div class="nh">${esc(x.head)}</div>` : ''}<div class="nt">${String(x.text).trim().split(/\n+/).map(p => `<p>${lsRich(p.trim())}</p>`).join('')}</div></div>
    ${x.q ? `<div class="lsqq">${esc(x.q)}</div>` : ''}
    ${lsOpts(0, x.opts, x.a, x.ex)}`;
}
/* ---------- 2 · hueco suelto ---------- */
function lsDisc(x) {
  const chosen = LSQ.ans[0];
  const fill = LSQ.checked ? `<span class="gap ${chosen === x.a ? 'okg' : 'kog'}">${esc(x.opts[x.a])}</span>` : chosen != null ? `<span class="gap">${esc(x.opts[chosen])}</span>` : '<span class="gap">&nbsp;</span>';
  const [a, b] = x.s.split('___');
  return `<div class="q lsdisc">${LSQ.checked ? lsWrap(a) : esc(a)}${fill}${LSQ.checked ? lsWrap(b || '') : esc(b || '')}</div>${lsOpts(0, x.opts, x.a, x.ex)}`;
}
/* opciones de una pregunta de opción múltiple (con explicación al corregir) */
function lsOpts(qi, opts, a, ex, label) {
  const ch = LSQ.ans[qi];
  const done = LSQ.checked;
  const html = `<div class="opts lsopts" data-q="${qi}">${opts.map((o, i) => `<button class="opt ${done ? (i === a ? 'right' : i === ch ? 'wrong' : 'dim') : i === ch ? 'sel' : ''}" data-q="${qi}" data-o="${i}" ${done ? 'disabled' : ''}><span class="ol">${LETTERS[i]}</span><span>${esc(o)}</span></button>`).join('')}</div>`;
  if (!done) return html;
  return html + lsExplain(ch, a, opts, ex);
}
function lsExplain(ch, a, opts, ex) {
  ex = ex || [];
  const ok = ch === a;
  const others = opts.map((o, i) => i).filter(i => i !== a && i !== ch && ex[i]);
  return `<div class="feedback ${ok ? 'ok' : 'ko'}"><b>${ok ? 'Correcto' : ch == null ? 'Sin responder' : 'No es esa'}</b>
    <div class="lsx"><span class="ol ok">${LETTERS[a]}</span><span>${esc(ex[a] || '')}</span></div>
    ${!ok && ch != null && ex[ch] ? `<div class="lsx"><span class="ol ko">${LETTERS[ch]}</span><span>${esc(ex[ch])}</span></div>` : ''}
    ${others.length ? `<details class="lsmore"><summary>Por qué no valen las demás</summary>${others.map(i => `<div class="lsx"><span class="ol">${LETTERS[i]}</span><span>${esc(ex[i])}</span></div>`).join('')}</details>` : ''}</div>`;
}
/* ---------- 3 · cinco huecos con opciones ---------- */
function lsMcc(x) {
  const gap = gi => { const ch = LSQ.ans[gi], g = x.gaps[gi]; if (LSQ.checked) { const ok = ch === g.a; return `<span class="gap ${ok ? 'okg' : 'kog'}"><sup>${gi + 1}</sup>${ok ? '' : ch != null ? `<s>${esc(g.opts[ch])}</s> ` : ''}${esc(g.opts[g.a])}</span>`; } return `<button class="gap gbtn ${ch != null ? 'filled' : ''}" data-g="${gi}"><sup>${gi + 1}</sup>${ch != null ? esc(g.opts[ch]) : '&nbsp;'}</button>`; };
  return `${x.title ? `<div class="lstitle">${esc(x.title)}</div>` : ''}<div class="lstext">${lsParas(x.text).map(p => `<p>${lsGapsIn(p, gap)}</p>`).join('')}</div>
    <div class="lsgaps">${x.gaps.map((g, gi) => `<div class="lsgapq" id="g${gi}"><div class="gq">Hueco ${gi + 1}</div><div class="chips wrapchips">${g.opts.map((o, i) => `<button class="chip lsc ${LSQ.checked ? (i === g.a ? 'right' : i === LSQ.ans[gi] ? 'wrong' : 'dim') : i === LSQ.ans[gi] ? 'active' : ''}" data-q="${gi}" data-o="${i}" ${LSQ.checked ? 'disabled' : ''}>${esc(o)}</button>`).join('')}</div>${LSQ.checked ? `<div class="lswhy ${LSQ.ans[gi] === g.a ? 'ok' : 'ko'}">${esc(g.why)}</div>` : ''}</div>`).join('')}</div>`;
}
/* ---------- 4 · cinco huecos abiertos ---------- */
const lsNormAns = s => String(s || '').toLowerCase().replace(/[’‘]/g, "'").replace(/[^a-z'-]/g, ' ').trim().replace(/\s+/g, ' ');
function lsOpenOk(g, v) { return g.a.some(a => lsNormAns(a) === lsNormAns(v)); }
function lsOpen(x) {
  const gap = gi => {
    const v = LSQ.ans[gi] || '', g = x.gaps[gi];
    if (LSQ.checked) { const ok = lsOpenOk(g, v); return `<span class="gap ${ok ? 'okg' : 'kog'}"><sup>${gi + 1}</sup>${ok ? esc(v.trim()) : (v.trim() ? `<s>${esc(v.trim())}</s> ` : '') + esc(g.a[0])}</span>`; }
    return `<span class="ginp"><sup>${gi + 1}</sup><input class="lsin" data-g="${gi}" value="${esc(v)}" autocapitalize="off" autocomplete="off" autocorrect="off" spellcheck="false" enterkeyhint="next" aria-label="Hueco ${gi + 1}"></span>`;
  };
  return `${x.title ? `<div class="lstitle">${esc(x.title)}</div>` : ''}<div class="lstext">${lsParas(x.text).map(p => `<p>${lsGapsIn(p, gap)}</p>`).join('')}</div>
    ${LSQ.checked ? `<div class="lsgaps">${x.gaps.map((g, gi) => { const ok = lsOpenOk(g, LSQ.ans[gi]); return `<div class="lsgapq"><div class="gq">Hueco ${gi + 1} · <b class="${ok ? 'tg' : 'tb'}">${esc(g.a.join(' / '))}</b></div><div class="lswhy ${ok ? 'ok' : 'ko'}">${esc(g.why)}</div></div>`; }).join('')}</div>` : ''}`;
}
/* ---------- 5 y 6 · comprensión ---------- */
function lsComp(x) {
  const clues = x.qs.map((q, i) => ({ t: q.clue, n: i + 1 }));
  return `${x.intro ? `<div class="lsintro">${esc(x.intro)}</div>` : ''}<div class="lstitle">${esc(x.title)}</div>
    <div class="lstext">${lsParas(x.text).map(p => `<p>${lsRich(p, clues)}</p>`).join('')}</div>
    <div class="lsqs">${x.qs.map((q, qi) => `<div class="lsqblock"><div class="lsqq"><span class="qn">${qi + 1}</span>${esc(q.q)}</div>${lsOpts(qi, q.opts, q.a, q.ex)}</div>`).join('')}</div>`;
}
/* ---------- 7 y 8 · párrafos y frases eliminados ---------- */
function lsSlot(x) {
  const isPara = x.task === 'para';
  const used = {}; Object.entries(LSQ.ans).forEach(([g, o]) => { if (o != null) used[o] = +g; });
  const gap = gi => {
    const ch = LSQ.ans[gi], k = x.key[gi];
    if (LSQ.checked) {
      const ok = ch === k;
      return `<span class="slot done ${ok ? 'okg' : 'kog'} ${isPara ? 'pslot' : ''}"><span class="sn">${gi + 1}</span>${!ok && ch != null ? `<s class="sw">${LETTERS[ch]}</s>` : ''}<span class="sl">${LETTERS[k]}</span><span class="st">${lsWrap(x.opts[k])}</span></span>`;
    }
    return `<button class="slot ${ch != null ? 'filled' : ''} ${isPara ? 'pslot' : ''}" data-slot="${gi}"><span class="sn">${gi + 1}</span>${ch != null ? `<span class="sl">${LETTERS[ch]}</span><span class="st">${esc(x.opts[ch])}</span>` : `<span class="st ph">Toca para elegir ${isPara ? 'el párrafo' : 'la frase'}</span>`}</button>`;
  };
  const paras = lsParas(x.text).map(p => /^\[\d\]$/.test(p) ? `<div class="pgap">${gap(+p[1] - 1)}</div>` : `<p>${lsGapsIn(p, gap)}</p>`).join('');
  const optList = `<div class="h2 lsoh">${isPara ? 'Párrafos' : 'Frases'} <span class="muted" style="font-size:14px;font-weight:500">${x.opts.length} · sobra${x.opts.length - x.key.length > 1 ? 'n ' + (x.opts.length - x.key.length) : ' 1'}</span></div>
    <div class="lsoptlist">${x.opts.map((o, i) => { const g = used[i]; const isKey = x.key.indexOf(i); return `<div class="lso ${!LSQ.checked && g != null ? 'used' : ''} ${LSQ.checked ? (isKey >= 0 ? 'k' : 'x') : ''}"><span class="sl">${LETTERS[i]}</span><div class="grow"><div class="ot">${LSQ.checked ? lsWrap(o) : esc(o)}</div>${!LSQ.checked && g != null ? `<div class="meta">En el hueco ${g + 1}</div>` : ''}${LSQ.checked ? `<div class="meta">${isKey >= 0 ? 'Va en el hueco ' + (isKey + 1) : 'Sobra'}</div>` : ''}</div></div>`; }).join('')}</div>`;
  const review = LSQ.checked ? `<div class="h2">Corrección</div><div class="lsgaps">${x.key.map((k, gi) => { const ok = LSQ.ans[gi] === k; return `<div class="lsgapq"><div class="gq">Hueco ${gi + 1} · <b class="${ok ? 'tg' : 'tb'}">${LETTERS[k]}</b>${!ok && LSQ.ans[gi] != null ? ` <span class="muted">· pusiste ${LETTERS[LSQ.ans[gi]]}</span>` : ''}</div><div class="lswhy ${ok ? 'ok' : 'ko'}">${esc(x.why[gi])}</div></div>`; }).join('')}
    ${Object.entries(x.dis || {}).map(([i, w]) => `<div class="lsgapq"><div class="gq">${isPara ? 'Párrafo' : 'Frase'} ${LETTERS[+i]} · <span class="muted">sobra</span></div><div class="lswhy">${esc(w)}</div></div>`).join('')}</div>` : '';
  return `${x.intro ? `<div class="lsintro">${esc(x.intro)}</div>` : ''}<div class="lstitle">${esc(x.title)}</div><div class="lstext ${isPara ? 'ptext' : ''}">${paras}</div>${optList}${review}`;
}
function lsPickSlot(gi) {
  const x = LSQ.x, isPara = x.task === 'para';
  const used = {}; Object.entries(LSQ.ans).forEach(([g, o]) => { if (o != null) used[o] = +g; });
  openSheet(`<h3>Hueco ${gi + 1}</h3><p class="muted" style="margin:2px 0 12px;font-size:14px">Elige ${isPara ? 'el párrafo' : 'la frase'} que encaja. Si eliges una que ya está en otro hueco, se cambia aquí.</p>
    <div class="lspick">${x.opts.map((o, i) => `<button class="lso ${LSQ.ans[gi] === i ? 'on' : ''} ${used[i] != null && used[i] !== gi ? 'used' : ''}" data-o="${i}"><span class="sl">${LETTERS[i]}</span><div class="grow"><div class="ot">${esc(o)}</div>${used[i] != null && used[i] !== gi ? `<div class="meta">Ahora en el hueco ${used[i] + 1}</div>` : ''}</div></button>`).join('')}</div>
    ${LSQ.ans[gi] != null ? '<button class="btn block" id="lsClr" style="margin-top:12px">Dejar el hueco vacío</button>' : ''}`, b => {
    b.onclick = e => {
      if (e.target.closest('#lsClr')) { delete LSQ.ans[gi]; closeSheet(); lsPaint(); return; }
      const o = e.target.closest('[data-o]'); if (!o) return;
      const oi = +o.dataset.o;
      Object.keys(LSQ.ans).forEach(g => { if (LSQ.ans[g] === oi) delete LSQ.ans[g]; });
      LSQ.ans[gi] = oi; closeSheet();
      const y = window.scrollY; lsPaint(); window.scrollTo(0, y);
    };
  });
}
/* ---------- 9 · emparejar textos ---------- */
function lsMatch(x) {
  const clues = {}; x.prompts.forEach((p, i) => { (clues[p.a] = clues[p.a] || []).push({ t: p.clue, n: i + 1 }); });
  return `${x.intro ? `<div class="lsintro">${esc(x.intro)}</div>` : ''}<div class="lstitle">${esc(x.title)}</div>
    ${x.texts.map((t, ti) => `<div class="card lsmt"><div class="mth"><span class="sl">${LETTERS[ti]}</span><b>${esc(t.name)}</b></div><div class="lstext">${lsParas(t.body).map(p => `<p>${lsRich(p, clues[ti])}</p>`).join('')}</div></div>`).join('')}
    <div class="h2">Preguntas</div>
    <div class="lsqs">${x.prompts.map((p, pi) => { const ch = LSQ.ans[pi]; return `<div class="lsqblock"><div class="lsqq"><span class="qn">${pi + 1}</span>${esc(p.q)}</div>
      <div class="lsabcd">${x.texts.map((t, ti) => `<button class="${LSQ.checked ? (ti === p.a ? 'right' : ti === ch ? 'wrong' : '') : ti === ch ? 'on' : ''}" data-q="${pi}" data-o="${ti}" ${LSQ.checked ? 'disabled' : ''}><b>${LETTERS[ti]}</b><small>${esc(t.who || t.name.split(/[ ,]/)[0])}</small></button>`).join('')}</div>
      ${LSQ.checked ? `<div class="lswhy ${ch === p.a ? 'ok' : 'ko'}">${esc(p.why)}</div>` : ''}</div>`; }).join('')}</div>`;
}

/* ---------- corrección ---------- */
function lsScore() {
  const { x, ans } = LSQ; let ok = 0;
  if (x.task === 'short' || x.task === 'disc') ok = ans[0] === x.a ? 1 : 0;
  else if (x.task === 'mcc') x.gaps.forEach((g, i) => { if (ans[i] === g.a) ok++; });
  else if (x.task === 'open') x.gaps.forEach((g, i) => { if (lsOpenOk(g, ans[i])) ok++; });
  else if (x.task === 'comp5' || x.task === 'comp2') x.qs.forEach((q, i) => { if (ans[i] === q.a) ok++; });
  else if (x.task === 'para' || x.task === 'sent') x.key.forEach((k, i) => { if (ans[i] === k) ok++; });
  else if (x.task === 'match') x.prompts.forEach((p, i) => { if (ans[i] === p.a) ok++; });
  return { ok, tot: lsQCount(x) };
}
function lsCheck() {
  if (LSQ.checked) return;
  if (LSQ.x.task === 'open') $$('.lsin').forEach(i => { LSQ.ans[+i.dataset.g] = i.value; });
  LSQ.checked = true;
  if (LSQ.int) clearInterval(LSQ.int);
  LSQ.sec = (Date.now() - LSQ.t0) / 1000;
  const { ok, tot } = lsScore();
  LSQ.score = { ok, tot };
  lsRecord(LSQ.x, ok, tot, LSQ.sec);
  if (LSQ.round) { LSQ.round.res[LSQ.round.i] = ok === tot; if (ok === tot) LSQ.round.ok++; }
  const y = window.scrollY; lsPaint();
  if (LSQ.x.task === 'short' || LSQ.x.task === 'disc') window.scrollTo(0, y); else window.scrollTo(0, 0);
}
function lsResultFoot() {
  const { ok, tot } = LSQ.score || lsScore();
  const r = LSQ.round, x = LSQ.x;
  const single = x.task === 'short' || x.task === 'disc';
  if (r) {
    const last = r.i >= r.q.length - 1;
    return { banner: '', foot: `<div class="lsfoot">${last ? `<div class="card pad lsres ${r.ok === r.q.length ? 'perfect' : ''}"><b>${r.ok} de ${r.q.length}</b><span>${r.ok === r.q.length ? 'Ronda perfecta.' : r.ok >= r.q.length * 0.8 ? 'Muy bien. Repasa las explicaciones de las que fallaste.' : 'Repasa las explicaciones y vuelve a intentarlo.'}</span></div>
      <a class="btn primary block" href="#lsq/${x.task}/round" data-again="1">${ICF.shuffle}Otra ronda</a><a class="btn block" href="#lst/${x.task}">Volver a la tarea</a>`
      : `<button class="btn primary block" id="lsNextR">Siguiente ${ICF.right}<span class="lsleft">${r.i + 1} de ${r.q.length}</span></button>`}</div>` };
  }
  const nx = lsNext(x.task, S.lsLvl || 'all', x.id);
  const banner = single ? '' : `<div class="card pad lsres ${ok === tot ? 'perfect' : ''}" id="lsRes"><b>${ok} de ${tot}</b><span>${ok === tot ? 'Todo bien.' : 'Debajo de cada respuesta tienes la explicación.'}${LSQ.sec ? ' Tiempo ' + lsFmt(LSQ.sec) + ' (recomendado ' + lsFmt(lsLimit(x)) + ').' : ''}</span><span class="meta">Toca cualquier palabra del texto para ver qué significa y guardarla.</span></div>`;
  const foot = `<div class="lsfoot">${nx ? `<a class="btn primary block" href="#lsq/${x.task}/${esc(nx.id)}">Siguiente ejercicio ${ICF.right}</a>` : ''}
    <div class="pair"><button class="btn" id="lsAgain">${IC.back10}Repetir</button><a class="btn" href="#lst/${x.task}">Volver a la tarea</a></div></div>`;
  return { banner, foot };
}

/* ---------- eventos ---------- */
function lsBind() {
  const v = $('#view');
  v.onclick = e => {
    const lw = e.target.closest('.lw'); if (lw && LSQ.checked) { lsWord(lw); return; }
    const sl = e.target.closest('[data-slot]'); if (sl) { lsPickSlot(+sl.dataset.slot); return; }
    const gb = e.target.closest('.gbtn'); if (gb) { const t = $('#g' + gb.dataset.g); if (t) { t.scrollIntoView({ block: 'center', behavior: 'smooth' }); t.classList.add('flash2'); setTimeout(() => t.classList.remove('flash2'), 900); } return; }
    const o = e.target.closest('[data-o][data-q]');
    if (o && !LSQ.checked) {
      const q = +o.dataset.q, oi = +o.dataset.o;
      LSQ.ans[q] = LSQ.ans[q] === oi && LSQ.x.task !== 'short' && LSQ.x.task !== 'disc' ? null : oi;
      if (LSQ.x.task === 'short' || LSQ.x.task === 'disc') { lsCheck(); return; }
      const y = window.scrollY; lsPaint(); window.scrollTo(0, y); return;
    }
    if (e.target.closest('#lsCheck')) {
      const left = lsQCount(LSQ.x) - (LSQ.x.task === 'open' ? $$('.lsin').filter(i => i.value.trim()).length : lsAnswered());
      if (left > 0 && !LSQ.warned) { LSQ.warned = true; toast('Te ' + (left === 1 ? 'falta 1 respuesta' : 'faltan ' + left + ' respuestas') + '. Pulsa otra vez para corregir.'); return; }
      lsCheck(); return;
    }
    if (e.target.closest('#lsAgain')) { LSQ.round = null; lsStart(LSQ.x); return; }
    if (e.target.closest('#lsNextR')) { const r = LSQ.round; r.i++; lsStart(r.q[r.i]); return; }
    if (e.target.closest('[data-again]')) { e.preventDefault(); renderLSItem(LSQ.x.task + '/round'); window.scrollTo(0, 0); }
  };
  if (LSQ.x.task === 'open' && !LSQ.checked) {
    $$('.lsin').forEach(inp => {
      const fit = () => { inp.style.width = Math.max(5, inp.value.length + 2) + 'ch'; };
      fit();
      inp.oninput = () => { LSQ.ans[+inp.dataset.g] = inp.value; fit(); const left = LSQ.x.gaps.length - $$('.lsin').filter(i => i.value.trim()).length; const l = $('.lsleft'); if (l) l.textContent = left ? left + ' sin responder' : ''; };
      inp.onkeydown = e => { if (e.key === 'Enter') { e.preventDefault(); const all = $$('.lsin'); const n = all[all.indexOf(inp) + 1]; if (n) n.focus(); else inp.blur(); } };
    });
  }
}


/* ---------- vocabulario del examen: lista «Linguaskill» y guardado ---------- */
function lsList() {
  let L = LISTS.find(x => x.name === 'Linguaskill');
  if (!L) { L = createList('Linguaskill'); }
  return L;
}
function lsAddToList(id) { const L = lsList(); if (L && !L.items.includes(id)) { L.items.push(id); L.upd = Date.now(); saveLists(); } }
function lsSaveVocab(term, es, ex, srcId) {
  const t = term.trim(); if (!t) return null;
  let n = NOTES.find(z => norm(z.term) === norm(t));
  if (!n) {
    n = { id: uid(), term: t, cat: guessCat(t), es: es || '', def: '', ex: ex || '', exs: '', syn: '', ant: '', pron: '', note: '', src: 'Linguaskill', srcId: srcId || '', created: Date.now(), upd: Date.now(), srs: newSrs() };
    NOTES.unshift(n); saveNotes(); bump('saved');
  }
  lsAddToList(n.id);
  return n;
}
function lsVocabOf(x) {
  const out = (x.v || []).map(([t, es]) => ({ t, es }));
  return out;
}
function lsVocabHTML(x) {
  const v = lsVocabOf(x); if (!v.length) return '';
  const all = v.every(z => NOTES.some(n => norm(n.term) === norm(z.t)));
  return `<div class="card pad lsvocab"><div class="row"><b class="grow">Vocabulario de este ejercicio</b>${all ? '<span class="tag good">Guardado</span>' : '<button class="btn small" id="lsVAll">Guardar todo</button>'}</div>
    ${v.map((z, i) => { const has = NOTES.some(n => norm(n.term) === norm(z.t)); return `<div class="lsv"><button class="mini" data-vsay="${i}" aria-label="Escuchar">${IC.speak}</button><span class="grow"><b>${esc(z.t)}</b><br><span class="muted">${esc(z.es)}</span></span>${has ? '<span class="pk">✓</span>' : `<button class="btn small" data-vsave="${i}">Guardar</button>`}</div>`; }).join('')}
    <p class="meta" style="margin-top:8px">Se guardan en tus palabras, en la lista «Linguaskill», y entran en tus repasos.</p></div>`;
}
function lsBindVocab(root) {
  const x = LSQ.x, v = lsVocabOf(x); if (!v.length) return;
  const ctx = (typeof x.s === 'string' ? x.s.replace('___', v[0].t) : '');
  const refresh = () => { const c = $('.lsvocab', root); if (c) c.outerHTML = lsVocabHTML(x); lsBindVocab(root); };
  $$('[data-vsay]', root).forEach(b => b.onclick = () => TTS.speak(v[+b.dataset.vsay].t, { rate: 0.9 }));
  $$('[data-vsave]', root).forEach(b => b.onclick = () => { const z = v[+b.dataset.vsave]; lsSaveVocab(z.t, z.es, ctx, 'ls:' + x.id); toast('Guardada en «Linguaskill»'); refresh(); });
  const all = $('#lsVAll', root); if (all) all.onclick = () => { v.forEach(z => lsSaveVocab(z.t, z.es, ctx, 'ls:' + x.id)); toast(v.length + ' guardadas en «Linguaskill»'); refresh(); };
}

/* ---------- palabra tocada tras corregir ---------- */
function lsWord(el) {
  const term = el.textContent.replace(/[’]/g, "'");
  const holder = el.closest('p, .nt, .q, .ot, .st, .lstext') || el.parentElement;
  const full = (holder ? holder.textContent : term).replace(/\s+/g, ' ');
  const sents = full.match(/[^.!?]+[.!?]*["”’)]*/g) || [full];
  const sent = (sents.find(s => new RegExp('\\b' + term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '\\b').test(s)) || full).trim();
  $$('.lw.sel').forEach(x => x.classList.remove('sel')); el.classList.add('sel');
  const ctx = esc(sent).replace(new RegExp('\\b' + esc(term).replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '\\b'), '<b>$&</b>');
  const lib = LIB.find(z => norm(z.term) === norm(term));
  const existing = NOTES.find(n => norm(n.term) === norm(term) || norm(n.term) === norm(stem(term)));
  openSheet(`<div class="row"><h3 class="grow" style="margin:0">${esc(term)}</h3><button class="mini" id="lwSay">${IC.speak}</button></div>
    ${lib ? `<div class="box" style="background:var(--warm-soft);margin-top:10px"><div style="font-weight:700">${esc(lib.es)}</div><div class="muted" style="font-size:14px">${esc(lib.def)}</div></div>` : ''}
    <div class="box" style="margin-top:10px"><div class="muted" style="font-size:12px;font-weight:700;margin-bottom:3px">EN ESPAÑOL · según la frase</div><div id="lwTr" style="font-size:18px;font-weight:600">…</div><div id="lwSmart"></div></div>
    <div id="lwDef"></div>
    <label class="lbl">En contexto</label><div class="box ctx">${ctx}</div>
    <div style="margin-top:14px">${existing ? `<div class="notice">Ya está en tus palabras.</div><button class="btn block" id="lwEdit">Ver o editar la tarjeta</button>` : `<button class="btn primary block" id="lwSave">${ico('plus', 18)} Guardar en mis palabras (con esta frase)</button>`}</div>`, b => {
    $('#lwSay', b).onclick = () => TTS.speak(term, { rate: 0.9 });
    let best = '', def = '';
    if ($('#lwSave', b)) $('#lwSave', b).onclick = () => openNoteEditor({ term: term.toLowerCase(), cat: guessCat(term), es: best || (lib && lib.es) || '', def: def || (lib && lib.def) || '', ex: sent, src: 'Linguaskill · ' + (LSQ.x.title || LS_TASKS[LSQ.x.task].name), srcId: 'ls:' + LSQ.x.id }, (sv) => { if (wstatus(term) === 0) setWord(term, 1); const nn = NOTES.find(z => norm(z.term) === norm(term)); if (nn) lsAddToList(nn.id); });
    if ($('#lwEdit', b)) $('#lwEdit', b).onclick = () => openNoteEditor(existing);
    const stale = () => !$('#lwTr') || !$('#sheet').classList.contains('show');
    (typeof smartLookup === 'function' ? smartLookup(term, sent) : translate(term).then(t => ({ best: t, alts: [] }))).then(r => {
      if (stale()) return;
      best = (r && r.best) || '';
      $('#lwTr').textContent = best || 'Sin conexión con el traductor';
      if (r && typeof smartBoxHTML === 'function') { $('#lwSmart').innerHTML = smartBoxHTML(r, best); $('#lwSmart').onclick = e => { const c = e.target.closest('[data-tr]'); if (c) { best = c.dataset.tr; $('#lwTr').textContent = best; } }; }
      if (r && r.def) def = r.def;
    }).catch(() => { if (!stale()) $('#lwTr').textContent = 'Sin conexión con el traductor'; });
    lookupDef(term).then(d => {
      const el = $('#lwDef'); if (!el || !d || stale()) return;
      const phon = d.phonetic || (d.phonetics || []).map(z => z.text).find(Boolean) || '';
      const defs = []; (d.meanings || []).forEach(m => (m.definitions || []).slice(0, 2).forEach(df => defs.length < 3 && defs.push({ pos: m.partOfSpeech, d: df.definition })));
      if (!def && defs[0]) def = defs[0].d;
      el.innerHTML = `<div class="row" style="margin-top:8px"><b>${esc(d.word)}</b><span class="phon">${esc(phon)}</span></div><ul class="defs">${defs.map(z => `<li><span class="pos">${esc(z.pos)}</span>${esc(z.d)}</li>`).join('')}</ul>`;
    });
  });
}

addRoute('ls', renderLS, 'ls', 'Linguaskill');
addRoute('lst', renderLSTask, 'ls', 'Reading');
addRoute('lsq', renderLSItem, 'ls', 'Reading');
addRoute('lsfail', renderLSFail, 'ls', 'Repetir lo que fallé');
addRoute('lsinfo', renderLSInfo, 'ls', 'Cómo es el examen');

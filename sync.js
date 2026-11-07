'use strict';
/* ==========================================================
   CUENTA Y SINCRONIZACIÓN (Firebase)
   Todo funciona sin cuenta. Con cuenta, el progreso se guarda
   también en internet y se mezcla entre dispositivos.
   ========================================================== */
const SYNC_KEYS = ['notes', 'learn', 'gprog', 'stats', 'history', 'marks', 'labels', 'lists', 'nb', 'tombs', 'settings', 'texts', 'videos', 'words', 'reads', 'pods'];
const FB_VER = '10.12.2';
const SYNC = { user: null, ready: false, applying: false, dirty: false, timer: null, lastSync: store.get('lastSync', 0), busy: false, error: '' };
const cfg = () => (window.FLUENT_CONFIG && window.FLUENT_CONFIG.firebase) || null;
const userEmail = u => u.toLowerCase().trim() + '@fluent-user.com';

/* marca cambios locales para subirlos */
(function () {
  const orig = store.set;
  store.set = function (k, v) {
    const r = orig.call(store, k, v);
    if (SYNC_KEYS.includes(k) && !SYNC.applying) { SYNC.dirty = true; schedulePush(); }
    return r;
  };
})();
function schedulePush() { if (!SYNC.user) return; clearTimeout(SYNC.timer); SYNC.timer = setTimeout(() => syncNow(), 4000); }

function loadScript(src) { return new Promise((ok, ko) => { const s = document.createElement('script'); s.src = src; s.onload = ok; s.onerror = () => ko(new Error('No se pudo cargar ' + src)); document.head.appendChild(s); }); }
async function fbInit() {
  if (SYNC.ready) return true;
  if (!cfg()) return false;
  const base = 'https://www.gstatic.com/firebasejs/' + FB_VER + '/';
  await loadScript(base + 'firebase-app-compat.js');
  await loadScript(base + 'firebase-auth-compat.js');
  await loadScript(base + 'firebase-firestore-compat.js');
  if (!firebase.apps.length) firebase.initializeApp(cfg());
  SYNC.ready = true;
  firebase.auth().onAuthStateChanged(u => {
    SYNC.user = u || null;
    if (u) syncNow(true); else paintSyncUI();
  });
  return true;
}

/* ---------- estado local ---------- */
function snapshot() {
  return { notes: NOTES, learn: LEARN, gprog: GPROG, stats: STATS, history: HISTORY, marks: MARKS, labels: LABELS, lists: LISTS, nb: NB, tombs: TOMBS, settings: S, texts: window.TEXTS || [], videos: typeof VIDEOS !== 'undefined' ? VIDEOS : [], words: WORDS, reads: READS, pods: typeof PODS !== 'undefined' ? PODS : [] };
}
const ts = o => (o && (o.upd || o.created || o.added)) || 0;
function mergeArr(a = [], b = [], tombs = {}) {
  const m = {};
  a.concat(b).forEach(x => { if (!x || !x.id) return; if (!m[x.id] || ts(x) > ts(m[x.id])) m[x.id] = x; });
  return Object.values(m).filter(x => !(tombs[x.id] && tombs[x.id] >= ts(x)));
}
function mergeMap(a = {}, b = {}, tomb) {
  const r = Object.assign({}, a);
  for (const k in b) if (!r[k] || ts(b[k]) > ts(r[k]) || (ts(b[k]) === ts(r[k]) && (b[k].reps || 0) > (r[k].reps || 0))) r[k] = b[k];
  if (tomb) for (const k in r) { const t = tomb[tomb.prefix + k]; if (t && t >= ts(r[k])) delete r[k]; }
  return r;
}
function merge(L, R) {
  const tombs = Object.assign({}, L.tombs || {});
  for (const k in (R.tombs || {})) tombs[k] = Math.max(tombs[k] || 0, R.tombs[k]);
  const stats = Object.assign({}, L.stats || {});
  for (const d in (R.stats || {})) { const x = stats[d] || {}; const y = R.stats[d]; const z = {}; new Set(Object.keys(x).concat(Object.keys(y))).forEach(k => z[k] = Math.max(x[k] || 0, y[k] || 0)); stats[d] = z; }
  const gprog = Object.assign({}, L.gprog || {}); for (const k in (R.gprog || {})) gprog[k] = Math.max(gprog[k] || 0, R.gprog[k]);
  const hist = mergeArr(L.history, R.history).sort((a, b) => (b.readAt || 0) - (a.readAt || 0));
  const markTomb = Object.assign({ prefix: 'mark:' }, tombs);
  return {
    notes: mergeArr(L.notes, R.notes, tombs), lists: mergeArr(L.lists, R.lists, tombs), nb: mergeArr(L.nb, R.nb, tombs), labels: mergeArr(L.labels, R.labels, tombs), texts: mergeArr(L.texts, R.texts, tombs), videos: mergeArr(L.videos, R.videos, tombs), pods: mergeArr(L.pods, R.pods, tombs), reads: mergeMap(L.reads, R.reads), words: (() => { const w = Object.assign({}, R.words || {}); for (const k in (L.words || {})) w[k] = w[k] == null ? L.words[k] : Math.max(w[k], L.words[k]); return w; })(),
    learn: mergeMap(L.learn, R.learn), marks: mergeMap(L.marks, R.marks, markTomb), gprog, stats, history: hist, tombs,
    settings: ((R.settings || {})._upd || 0) > ((L.settings || {})._upd || 0) ? Object.assign({}, L.settings, R.settings) : L.settings
  };
}
function applyState(st) {
  SYNC.applying = true;
  try {
    NOTES = st.notes; LEARN = st.learn; GPROG = st.gprog; STATS = st.stats; HISTORY = st.history; MARKS = st.marks; LABELS = st.labels; LISTS = st.lists; NB = st.nb; TOMBS = st.tombs; window.TEXTS = st.texts || []; if (typeof VIDEOS !== 'undefined') VIDEOS = st.videos || []; if (typeof PODS !== 'undefined') PODS = st.pods || []; WORDS = st.words || {}; READS = st.reads || {}; WVER++;
    S = Object.assign({}, DEFAULT_SETTINGS, st.settings || {}); S.mix = Object.assign({}, DEFAULT_SETTINGS.mix, S.mix || {}); S.home = Object.assign({}, DEFAULT_SETTINGS.home, S.home || {});
    LIB.forEach(x => { x.srs = LEARN[x.id] || null; });
    store.set('notes', NOTES); store.set('learn', LEARN); store.set('gprog', GPROG); store.set('stats', STATS); store.set('history', HISTORY);
    store.set('marks', MARKS); store.set('labels', LABELS); store.set('lists', LISTS); store.set('nb', NB); store.set('tombs', TOMBS); store.set('settings', S); store.set('texts', window.TEXTS); store.set('videos', st.videos || []); store.set('pods', st.pods || []); store.set('words', WORDS); store.set('reads', READS);
  } finally { SYNC.applying = false; }
  applyTheme(); buildPool(); updateBadge(); renderStreak();
}

/* ---------- sincronizar ---------- */
async function syncNow(rerender) {
  if (!SYNC.user || SYNC.busy) return;
  SYNC.busy = true; SYNC.error = ''; paintSyncUI();
  try {
    const ref = firebase.firestore().collection('users').doc(SYNC.user.uid);
    const doc = await ref.get();
    const local = snapshot();
    let state = local;
    if (doc.exists && doc.data().state) {
      const remote = JSON.parse(doc.data().state);
      state = merge(local, remote);
      const before = JSON.stringify(local);
      if (JSON.stringify(state) !== before) { applyState(state); if (rerender && !/^#(nb|ex)\//.test(location.hash)) route(); }
    }
    await ref.set({ state: JSON.stringify(state), updatedAt: Date.now(), username: (SYNC.user.email || '').split('@')[0], app: VERSION });
    SYNC.dirty = false; SYNC.lastSync = Date.now(); store.set('lastSync', SYNC.lastSync);
  } catch (e) {
    SYNC.error = /permission/i.test(e.message) ? 'Sin permiso en la base de datos (revisa las reglas de Firestore)' : navigator.onLine ? 'Error al sincronizar' : 'Sin conexión, se sincronizará luego';
    console.warn(e);
  }
  SYNC.busy = false; paintSyncUI();
}
function syncLabel() {
  if (!cfg()) return '';
  if (!SYNC.user) return 'Sin cuenta';
  if (SYNC.busy) return 'Sincronizando…';
  if (SYNC.error) return '⚠ ' + SYNC.error;
  if (!SYNC.lastSync) return 'Conectado';
  const m = Math.round((Date.now() - SYNC.lastSync) / 60000);
  return '☁︎ Guardado ' + (m < 1 ? 'ahora' : 'hace ' + (m < 60 ? m + ' min' : Math.round(m / 60) + ' h'));
}
function paintSyncUI() {
  const a = $('#syncMini'); if (a) a.textContent = syncLabel();
  const box = $('#accountBox'); if (box) box.innerHTML = accountHTML(), bindAccount();
}
document.addEventListener('visibilitychange', () => {
  if (!SYNC.user) return;
  if (document.hidden) { if (SYNC.dirty) syncNow(); }
  else if (Date.now() - SYNC.lastSync > 60000) syncNow(true);
});
window.addEventListener('online', () => { if (SYNC.user) syncNow(true); });

/* ---------- interfaz de cuenta (en Ajustes) ---------- */
function accountHTML() {
  if (!cfg()) return `<p class="muted" style="font-size:14px">La cuenta aún no está activada en esta versión de la app. Mientras tanto, todo se guarda en este dispositivo y puedes usar Exportar e Importar copia.</p>`;
  if (!SYNC.ready) return '<p class="muted">Cargando…</p>';
  if (SYNC.user) {
    const u = (SYNC.user.email || '').split('@')[0];
    return `<div class="row"><div class="grow"><b>${esc(u)}</b><div class="muted" style="font-size:14px">${esc(syncLabel())}</div></div><button class="btn small" id="accSync">Sincronizar</button></div>
      <p class="muted" style="font-size:13px;margin:10px 0 0">Tu progreso se guarda solo cada vez que cambias algo. Entra con este usuario en cualquier dispositivo para tenerlo todo.</p>
      <button class="btn ghost block" id="accOut" style="margin-top:10px">Cerrar sesión</button>`;
  }
  return `<p class="muted" style="font-size:14px;margin-top:0">Crea tu cuenta para guardar el progreso en internet y no perderlo nunca, aunque cambies de móvil.</p>
    <label class="lbl">Usuario</label><input class="input" id="accU" autocapitalize="off" autocomplete="username" spellcheck="false" placeholder="por ejemplo, iker">
    <label class="lbl">Contraseña</label><input class="input" id="accP" type="password" autocomplete="current-password" placeholder="mínimo 6 caracteres">
    <div class="row" style="margin-top:12px"><button class="btn grow" id="accLogin">Entrar</button><button class="btn primary grow" id="accNew">Crear cuenta</button></div>
    <p class="meta" id="accMsg" style="margin-top:8px">Guarda bien la contraseña: la cuenta no usa correo, así que no se puede recuperar automáticamente.</p>`;
}
function bindAccount() {
  const msg = t => { const m = $('#accMsg'); if (m) { m.textContent = t; m.style.color = 'var(--bad)'; } };
  const valid = () => {
    const u = ($('#accU').value || '').trim(), p = $('#accP').value || '';
    if (!/^[a-zA-Z0-9._-]{3,24}$/.test(u)) { msg('El usuario debe tener entre 3 y 24 letras, números, puntos o guiones, sin espacios.'); return null; }
    if (p.length < 6) { msg('La contraseña debe tener al menos 6 caracteres.'); return null; }
    return { u, p };
  };
  const errText = e => ({ 'auth/email-already-in-use': 'Ese usuario ya existe. Si es tuyo, pulsa Entrar.', 'auth/invalid-credential': 'Usuario o contraseña incorrectos.', 'auth/wrong-password': 'Contraseña incorrecta.', 'auth/user-not-found': 'Ese usuario no existe. Pulsa Crear cuenta.', 'auth/network-request-failed': 'Sin conexión.', 'auth/too-many-requests': 'Demasiados intentos. Espera un poco.', 'auth/operation-not-allowed': 'Falta activar «Correo electrónico/contraseña» en Firebase (Authentication › Método de acceso).', 'auth/configuration-not-found': 'Falta activar Authentication en Firebase: pulsa «Comenzar» y activa «Correo electrónico/contraseña».' }[e.code] || e.message);
  if ($('#accNew')) $('#accNew').onclick = async () => { const v = valid(); if (!v) return; try { $('#accNew').disabled = true; await firebase.auth().createUserWithEmailAndPassword(userEmail(v.u), v.p); toast('Cuenta creada. ¡Bienvenido, ' + v.u + '!'); } catch (e) { msg(errText(e)); $('#accNew').disabled = false; } };
  if ($('#accLogin')) $('#accLogin').onclick = async () => { const v = valid(); if (!v) return; try { $('#accLogin').disabled = true; await firebase.auth().signInWithEmailAndPassword(userEmail(v.u), v.p); toast('Sesión iniciada. Sincronizando…'); } catch (e) { msg(errText(e)); $('#accLogin').disabled = false; } };
  if ($('#accSync')) $('#accSync').onclick = () => syncNow(true);
  if ($('#accOut')) $('#accOut').onclick = async () => { if (!confirm('¿Cerrar sesión? Tus datos seguirán en este dispositivo.')) return; if (SYNC.dirty) await syncNow(); await firebase.auth().signOut(); toast('Sesión cerrada'); };
}
window.addEventListener('DOMContentLoaded', () => { if (cfg()) fbInit().then(paintSyncUI).catch(e => { SYNC.error = 'No se pudo conectar'; console.warn(e); }); });

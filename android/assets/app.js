/* Claude Pocket – limity Claude, terminal komputera i pomarańczowy duszek. */
'use strict';
const $ = s => document.querySelector(s);
const $$ = s => [...document.querySelectorAll(s)];
const store = {
  get(k, d) { try { const v = localStorage.getItem('cp.' + k); return v == null ? d : JSON.parse(v); } catch (e) { return d; } },
  set(k, v) { try { localStorage.setItem('cp.' + k, JSON.stringify(v)); } catch (e) { /* brak miejsca */ } },
};
const opts = Object.assign({ petFloat: true, petTalk: true, vibe: true, font: 13, session: 'claude', eyes: 'round', skin: 'ghost' }, store.get('opts', {}));
const saveOpts = () => store.set('opts', opts);
I18N.apply();                                           // teksty w wybranym języku (i18n.js)
const vibe = ms => { if (opts.vibe && navigator.vibrate) try { navigator.vibrate(ms); } catch (e) {} };

// =====================================================================
// połączenie z komputerem
// =====================================================================
let host = store.get('host', '');
let token = store.get('token', '');
let lastUsage = store.get('usage', null);
// znane adresy komputera: domowe Wi-Fi i (jeśli jest) Tailscale – apka sama wybiera ten, który działa
let hosts = store.get('hosts', []);
const isTail = h => /^100\.(6[4-9]|[7-9]\d|1[01]\d|12[0-7])\./.test(h || '');
const viaText = () => isTail(host) ? t('via_ts') : '';
const rawApi = async (h, path, ms) => {
  const ctl = new AbortController();
  const t = setTimeout(() => ctl.abort(), ms);
  try {
    const r = await fetch(`http://${h}/api/${path}?token=${encodeURIComponent(token)}`, { signal: ctl.signal, cache: 'no-store' });
    const j = await r.json().catch(() => ({}));
    if (!r.ok) throw Object.assign(new Error(j.error || `HTTP ${r.status}`), { code: j.error, http: true });
    return j;
  } finally { clearTimeout(t); }
};
const learnHosts = p => {
  const list = [...(p?.addrs || []), host, ...hosts].filter(Boolean);
  // domowe adresy przed Tailscale, bez powtórek
  hosts = [...new Set([...list.filter(h => !isTail(h)), ...list.filter(isTail)])].slice(0, 6);
  store.set('hosts', hosts);
};
let finding = null;
function findHost() {                                   // pinguje wszystkie znane adresy naraz, wygrywa pierwszy z listy, który odpowie
  if (finding) return finding;
  const cand = [...new Set([...hosts.filter(h => !isTail(h)), host, ...hosts].filter(Boolean))];
  finding = (async () => {
    const res = await Promise.all(cand.map(h => rawApi(h, 'ping', 4500).then(p => ({ h, p }), e => ({ h, e }))));
    const ok = cand.map(h => res.find(r => r.h === h)).find(r => r && r.p)
      || res.find(r => r.e && r.e.http);               // serwer odpowiedział (np. zły kod) – też jest „znaleziony”
    if (ok) { host = ok.h; store.set('host', host); if (ok.p) learnHosts(ok.p); }
    return ok;
  })().finally(() => { finding = null; });
  return finding;
}
const api = async (path, ms = 20000) => {
  try { return await rawApi(host, path, ms); }
  catch (e) {
    if (e.http || !token) throw e;                      // to nie problem z siecią
    const before = host, ok = await findHost();
    if (!ok || ok.h === before) throw e;
    return rawApi(host, path, ms);                      // inny adres działa (np. Tailscale poza domem)
  }
};
const setConn = (state, text) => {
  const c = $('#conn');
  c.className = `conn ${state}`;
  c.querySelector('span').textContent = text;
};
const ERR = { 'zly-kod': 'err_code', 'zablokowane-na-5-min': 'err_locked', 'tylko-siec-domowa': 'err_lan' };
const errText = e => ERR[e.code] ? t(ERR[e.code]) : (e.name === 'AbortError' || /fetch|network/i.test(e.message) ? t('err_net') : e.message);

const normHost = h => {
  h = (h || '').trim().replace(/^https?:\/\//, '').replace(/\/.*$/, '');
  return h && !/:\d+$/.test(h) ? `${h}:8765` : h;
};
$('#pair-host').value = host || '';
$('#pair-code').value = token || '';
$('#pair-go').onclick = async () => {
  const btn = $('#pair-go');
  host = normHost($('#pair-host').value);
  token = $('#pair-code').value.trim().toUpperCase();
  $('#pair-err').textContent = '';
  btn.disabled = true; btn.textContent = t('connecting_btn');
  try {
    const p = await rawApi(host, 'ping', 8000);
    store.set('host', host); store.set('token', token);
    learnHosts(p);
    startMain(p);
  } catch (e) {
    $('#pair-err').textContent = errText(e);
  } finally { btn.disabled = false; btn.textContent = t('pair_go'); }
};
// instalator programu na komputer (Linux) – zapis do Pobranych i od razu „wyślij do…”
const PC_FILES = { linux: 'claude-pocket-pc.sh', windows: 'claude-pocket-windows.bat' };
function saveInstaller(msgSel, os) {
  const m = $(msgSel);
  vibe(8);
  if (!window.CP || !CP.saveInstallerFor) { m.textContent = t('inst_only_app'); return; }
  const r = String(CP.saveInstallerFor(PC_FILES[os], true));
  const f = r.slice(3);
  m.textContent = !r.startsWith('ok:') ? t('inst_fail', { e: r.slice(4) }) : t(os === 'windows' ? 'inst_ok_win' : 'inst_ok_lin', { f });
}
// pierwszy ekran: wybór systemu komputera (zapamiętany)
let pcOs = store.get('pcos', '');
function setOs(os) {
  pcOs = os; store.set('pcos', os);
  const box = $('.pair-help');
  box.classList.toggle('os-linux', os === 'linux');
  box.classList.toggle('os-windows', os === 'windows');
  $$('.os-btn').forEach(b => b.classList.toggle('on', b.dataset.os === os));
  $('#pc-installer').textContent = t(os === 'windows' ? 'inst_btn_win' : 'inst_btn_lin');
  $('#pc-installer-msg').textContent = '';
}
$$('.os-btn').forEach(b => { b.onclick = () => { vibe(6); setOs(b.dataset.os); }; });
if (pcOs) setOs(pcOs);
$('#pc-installer').onclick = () => saveInstaller('#pc-installer-msg', pcOs || 'linux');
$('#pc-inst-linux').onclick = () => saveInstaller('#pc-installer2-msg', 'linux');
$('#pc-inst-win').onclick = () => saveInstaller('#pc-installer2-msg', 'windows');
$('#unpair').onclick = () => {
  store.set('token', ''); token = '';
  closeTerm();
  $('#main').classList.add('hidden'); $('#pair').classList.remove('hidden');
  pet.el.classList.add('hidden');
};

function startMain(ping) {
  $('#pair').classList.add('hidden');
  $('#main').classList.remove('hidden');
  $('#set-host').textContent = `${ping?.user || ''}@${ping?.host || ''} · ${host}`;
  setConn('ok', (ping?.host || t('connected')) + viaText());
  pet.show();
  showPage(store.get('page', 'limits'));
  refreshUsage();
}

// =====================================================================
// zakładki
// =====================================================================
let page = 'limits';
function showPage(p) {
  page = p; store.set('page', p);
  $$('.page').forEach(el => el.classList.toggle('hidden', el.id !== `page-${p}`));
  $$('.tabs button').forEach(b => b.classList.toggle('on', b.dataset.page === p));
  if (p === 'term') openTerm();
  if (p === 'limits') refreshUsage();
  pet.onPage(p);
}
$$('.tabs button').forEach(b => { b.onclick = () => { vibe(8); showPage(b.dataset.page); }; });

// =====================================================================
// limity
// =====================================================================
// daty w języku interfejsu (Intl zna odmianę, np. „24 listopada”)
const dfmt = o => { try { return new Intl.DateTimeFormat(I18N.lang, o); } catch (e) { return new Intl.DateTimeFormat('en', o); } };
const fDay = dfmt({ weekday: 'long', day: 'numeric', month: 'long' }), fWd = dfmt({ weekday: 'short' }), fShort = dfmt({ day: 'numeric', month: 'short' });
const ymd = d => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
const dec = s => (/^(pl|de|es|fr|it|pt|uk|ru)$/.test(I18N.lang) ? s.replace('.', ',') : s);
const fmtTok = n => (n >= 1e6 ? `${dec((n / 1e6).toFixed(n >= 10e6 ? 0 : 1))} ${t('mln')}` : n >= 1e3 ? `${Math.round(n / 1e3)} ${t('thous')}` : `${n}`);
const left = t => {
  const s = Math.max(0, t - Date.now() / 1000);
  const d = Math.floor(s / 86400), h = Math.floor(s % 86400 / 3600), m = Math.floor(s % 3600 / 60);
  return d ? `${d} d ${h} h` : h ? `${h} h ${m} min` : `${m} min`;
};
const at = ts => {
  const d = new Date(ts * 1000), now = new Date();
  const hm = `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
  const diff = Math.round((new Date(d.getFullYear(), d.getMonth(), d.getDate()) - new Date(now.getFullYear(), now.getMonth(), now.getDate())) / 864e5);
  return diff === 0 ? t('today_at', { t: hm }) : diff === 1 ? t('tomorrow_at', { t: hm }) : `${fWd.format(d)} ${hm}`;
};
let selDay = '';

function renderLimit(id, l) {
  const el = $(id);
  const p = l?.pct;
  el.querySelector('.fg').style.strokeDashoffset = String(264 - 264 * Math.min(1, (p || 0) / 100));
  el.classList.toggle('warn', p >= 70 && p < 90);
  el.classList.toggle('crit', p >= 90);
  el.querySelector('.ring-pct').textContent = p == null ? '–' : `${Math.round(p)}%`;
  el.querySelector('.lim-left').textContent = p == null ? t('no_data') : t('left_pct', { p: Math.max(0, 100 - Math.round(p)) });
  el.querySelector('.lim-reset').textContent = l?.reset ? t('reset_in', { a: left(l.reset), b: at(l.reset) }) : '';
}
const levelPct = p => (!p ? 0 : p < 4 ? 1 : p < 10 ? 2 : p < 20 ? 3 : 4);
const levelTok = t => (!t ? 0 : t < 300e3 ? 1 : t < 2e6 ? 2 : t < 10e6 ? 3 : 4);

function renderHeat(u) {
  const heat = $('#heat');
  heat.innerHTML = '';
  const today = new Date(); today.setHours(0, 0, 0, 0);
  const monday = new Date(today); monday.setDate(today.getDate() - ((today.getDay() + 6) % 7));
  const WEEKS = 18;
  const start = new Date(monday); start.setDate(monday.getDate() - (WEEKS - 1) * 7);
  for (let i = 0; i < WEEKS * 7; i++) {
    const d = new Date(start); d.setDate(start.getDate() + i);
    const key = ymd(d), c = document.createElement('i');
    const lvl = Math.max(levelPct(u?.days?.[key] || 0), levelTok(u?.cc?.[key]?.tok || 0));
    c.className = `c l${lvl}`;
    if (d > today) c.classList.add('future');
    else {
      if (+d === +today) c.classList.add('today');
      if (key === (selDay || ymd(today))) c.classList.add('sel');
      c.onclick = () => { selDay = key; vibe(6); renderHeat(lastUsage); renderDay(lastUsage); };
    }
    heat.appendChild(c);
  }
  const wrap = $('.heat-wrap');
  wrap.scrollLeft = wrap.scrollWidth;
}
function renderDay(u) {
  const key = selDay || ymd(new Date());
  const d = new Date(`${key}T12:00:00`);
  const c = u?.cc?.[key], p = u?.days?.[key] || 0, tracked = u?.since && key >= u.since;
  $('#day .day-t').textContent = `${key === ymd(new Date()) ? t('today_dot') : ''}${fDay.format(d)}`;
  $('#day .day-big').textContent = c ? t('tokens', { n: fmtTok(c.tok) }) : t('no_tokens');
  $('#day .day-sub').textContent = c ? t('replies', { n: c.msgs }) : t('nothing_day');
  $('#day .day-pct').textContent = tracked
    ? t('week_pct', { p: dec(p.toFixed(p < 10 ? 1 : 0)) })
    : t('week_since', { d: u?.since ? fShort.format(new Date(`${u.since}T12:00:00`)) : t('today_word') });
}
function renderUsage(u) {
  if (!u) return;
  renderLimit('#lim-h5', u.h5);
  renderLimit('#lim-d7', u.d7);
  renderHeat(u);
  renderDay(u);
  const upd = u.updated ? at(u.updated).replace(t('today_at', { t: '' }), '') : '–';
  $('#updated').textContent = u.ok ? t('plan_upd', { p: (u.plan || '').replace(/^./, c => c.toUpperCase()), u: upd })
    : u.err === 'token' ? t('usage_token') : u.err === 'brak-loginu' ? t('usage_nologin') : t('usage_last', { u: upd });
}
let usageBusy = false;
async function refreshUsage() {
  if (!token || usageBusy) return;
  usageBusy = true;
  $('#refresh').classList.add('spin');
  try {
    const u = await api('usage', 45000);
    lastUsage = u; store.set('usage', u);
    const cur = $('#conn span').textContent;
    setConn('ok', cur === t('offline') || cur === t('connecting') ? t('connected') + viaText() : cur);
    renderUsage(u);
  } catch (e) {
    setConn('bad', t('offline'));
    renderUsage(lastUsage);
  } finally { usageBusy = false; $('#refresh').classList.remove('spin'); }
}
$('#refresh').onclick = () => { vibe(8); refreshUsage(); };
setInterval(() => { if (document.visibilityState === 'visible' && page === 'limits') refreshUsage(); }, 60000);
setInterval(() => { if (lastUsage && page === 'limits') { renderLimit('#lim-h5', lastUsage.h5); renderLimit('#lim-d7', lastUsage.d7); } }, 30000);
renderUsage(lastUsage);

// =====================================================================
// terminal
// =====================================================================
let term = null, fit = null, ws = null, ctrl = false;
const unesc = s => s.replace(/\\r/g, '\r').replace(/\\n/g, '\n').replace(/\\x([0-9a-f]{2})/gi, (_, h) => String.fromCharCode(parseInt(h, 16)));
const KEYS = { esc: '\x1b', tab: '\t', up: '\x1b[A', down: '\x1b[B', right: '\x1b[C', left: '\x1b[D' };
const tsend = d => { if (ws && ws.readyState === 1) ws.send(JSON.stringify({ t: 'in', d })); };

function initTerm() {
  if (term) return;
  term = new Terminal({
    fontFamily: 'ui-monospace, "Droid Sans Mono", "DejaVu Sans Mono", monospace', fontSize: opts.font,
    cursorBlink: true, scrollback: 3000, allowProposedApi: false,
    theme: { background: '#0c0c10', foreground: '#e6e6eb', cursor: '#d97757', selectionBackground: 'rgba(217,119,87,0.35)',
      black: '#16161e', red: '#f7768e', green: '#9ece6a', yellow: '#e0af68', blue: '#7aa2f7', magenta: '#bb9af7', cyan: '#73daca', white: '#c0caf5',
      brightBlack: '#565f89', brightRed: '#ff7a93', brightGreen: '#b9f27c', brightYellow: '#ff9e64', brightBlue: '#7da6ff', brightMagenta: '#c3a6ff', brightCyan: '#a4fff0', brightWhite: '#ffffff' },
  });
  fit = new FitAddon.FitAddon();
  term.loadAddon(fit);
  term.open($('#term'));
  term.onData(d => {
    if (ctrl && d.length === 1) {
      const c = d.toUpperCase().charCodeAt(0);
      if (c >= 64 && c <= 95) d = String.fromCharCode(c - 64);
      ctrl = false; $('#key-ctrl').classList.remove('on');
    }
    tsend(d);
  });
  term.onResize(({ cols, rows }) => { if (ws && ws.readyState === 1) ws.send(JSON.stringify({ t: 'rs', c: cols, r: rows })); });
  new ResizeObserver(() => { try { fit.fit(); } catch (e) {} }).observe($('#term'));
}
// ---- przewijanie palcem ----
// Claude Code (tryb pełnoekranowy) sam przewija rozmowę, ale tylko kółkiem myszy – więc przeciągnięcie palcem
// zamieniamy na „kółko”. W zwykłym terminalu przewijamy historię xterm.
let sgrMouse = true;
function wheel(up, n = 1, cx, cy) {
  if (!term) return;
  const buf = term.buffer.active, mouse = term.modes.mouseTrackingMode !== 'none';
  if (mouse) {
    const col = Math.max(1, Math.min(term.cols, cx || Math.ceil(term.cols / 2)));
    const row = Math.max(1, Math.min(term.rows, cy || Math.ceil(term.rows / 2)));
    const b = up ? 64 : 65;
    const one = sgrMouse ? `\x1b[<${b};${col};${row}M` : `\x1b[M${String.fromCharCode(32 + b, 32 + col, 32 + row)}`;
    tsend(one.repeat(n));
  } else if (buf.type === 'alternate') {
    tsend((up ? KEYS.up : KEYS.down).repeat(n));                 // less, man itp.
  } else term.scrollLines(up ? -n : n);
}
(() => {
  const el = $('#term');
  let y0 = null, moved = false, lastY = 0, lastT = 0, vel = 0, fling = 0;
  // Claude Code przesuwa ~1 linię na „ząbek” kółka – ząbek co ~1.3 wiersza pod palcem
  const cell = () => (term?.element?.querySelector('.xterm-screen')?.clientHeight || el.clientHeight) / (term?.rows || 24)
    * (term && term.modes.mouseTrackingMode !== 'none' ? 1.3 : 1);
  const pos = t => {
    const r = term.element.querySelector('.xterm-screen').getBoundingClientRect();
    return [Math.floor((t.clientX - r.left) / (r.width / term.cols)) + 1, Math.floor((t.clientY - r.top) / (r.height / term.rows)) + 1];
  };
  let cx, cy;
  el.addEventListener('touchstart', e => {
    if (e.touches.length !== 1 || !term) { y0 = null; return; }
    cancelAnimationFrame(fling);
    y0 = lastY = e.touches[0].clientY; lastT = performance.now(); vel = 0; moved = false;
    [cx, cy] = pos(e.touches[0]);
  }, { capture: true, passive: true });
  el.addEventListener('touchmove', e => {
    if (y0 === null || e.touches.length !== 1) return;
    const y = e.touches[0].clientY, now = performance.now();
    if (!moved && Math.abs(y - y0) < 8) return;
    moved = true;
    e.preventDefault(); e.stopPropagation();
    vel = (y - lastY) / Math.max(1, now - lastT); lastY = y; lastT = now;
    const step = cell();
    const n = Math.trunc((y - y0) / step);
    if (n) { wheel(n > 0, Math.abs(n), cx, cy); y0 += n * step; }
  }, { capture: true, passive: false });
  el.addEventListener('touchend', e => {
    if (y0 === null) return;
    if (moved) {
      e.preventDefault(); e.stopPropagation();
      // bezwładność – szybkie machnięcie przewija dalej
      let v = vel * 16, rest = 0;
      const step = cell();
      const go = () => {
        if (Math.abs(v) < 0.6) return;
        rest += v; v *= 0.93;
        const n = Math.trunc(rest / step);
        if (n) { wheel(n > 0, Math.abs(n), cx, cy); rest -= n * step; }
        fling = requestAnimationFrame(go);
      };
      if (Math.abs(v) > 4) go();
    }
    y0 = null;
  }, { capture: true, passive: false });
})();
$$('[data-wheel]').forEach(b => {
  b.addEventListener('mousedown', e => e.preventDefault());
  b.onclick = () => { vibe(6); wheel(b.dataset.wheel === 'up', Math.max(3, (term?.rows || 20) - 4)); };
});

const markSession = () => {
  $$('.chip.sess').forEach(b => b.classList.toggle('on', b.dataset.session === opts.session));
  const t = document.getElementById('tin'); if (t) t.placeholder = window.t(opts.session === 'claude' ? 'ph_claude' : 'ph_shell');
};
function connectTerm(retried = false) {
  if (ws && ws.readyState <= 1) return;
  try { fit.fit(); } catch (e) {}
  const { cols, rows } = term;
  markSession();
  term.reset();
  ws = new WebSocket(`ws://${host}/term?token=${encodeURIComponent(token)}&session=${opts.session}&cols=${cols}&rows=${rows}`);
  let opened = false;
  ws.onopen = () => { opened = true; term.focus(); };
  ws.onmessage = e => {
    const d = e.data;
    if (d.includes('\x1b[?1006')) { const i = d.lastIndexOf('\x1b[?1006'); sgrMouse = d[i + 7] === 'h'; }
    term.write(d);
  };
  const mine = ws;
  ws.onclose = e => {
    if (ws !== mine) return;                                          // przełączono na inną sesję
    if (!opened && !retried) {                                        // nie dało się połączyć – może działa inny adres
      ws = null;
      const before = host;
      findHost().then(ok => {
        if (ok && ok.h !== before) { setConn('ok', t('connected') + viaText()); connectTerm(true); }
        else term.write(`\r\n\x1b[38;2;217;119;87m● ${t('term_nopc')}\x1b[0m\r\n`);
      });
      return;
    }
    term.write('\x1b[?1000l\x1b[?1002l\x1b[?1003l\x1b[?1006l\x1b[?2004l\x1b[?1049l\x1b[?25h\x1b[0m'); // tryby po Claude Code
    term.write(e.reason === 'koniec-sesji'
      ? `\r\n\x1b[38;2;217;119;87m● ${t(opts.session === 'claude' ? 'term_end_cc' : 'term_end_sh')}\x1b[0m\r\n`
      : `\r\n\x1b[38;2;217;119;87m● ${t('term_disc', { r: e.reason ? ` (${e.reason})` : '' })}\x1b[0m\r\n`);
    ws = null;
  };
  ws.onerror = () => setConn('bad', t('offline'));
}
function openTerm() { initTerm(); setTimeout(() => { try { fit.fit(); } catch (e) {} connectTerm(); }, 60); }
function closeTerm() { try { ws?.close(); } catch (e) {} ws = null; }
$('#term-reconnect').onclick = () => { vibe(8); closeTerm(); setTimeout(connectTerm, 150); };
// ✦ Claude Code / ❯ Terminal – dwie wspólne sesje na komputerze; działają dalej po zamknięciu aplikacji
$$('.chip.sess').forEach(b => {
  b.addEventListener('mousedown', e => e.preventDefault());
  b.onclick = () => {
    vibe(8);
    if (opts.session === b.dataset.session && ws) { term?.focus(); return; }
    opts.session = b.dataset.session; saveOpts(); markSession();
    closeTerm(); setTimeout(connectTerm, 120);
  };
});
markSession();
$$('[data-send]').forEach(b => {
  b.addEventListener('mousedown', e => e.preventDefault());           // klawiatura telefonu zostaje otwarta
  b.onclick = () => { vibe(6); tsend(unesc(b.dataset.send)); keepFocus(); };
});
$$('[data-key]').forEach(b => {
  b.addEventListener('mousedown', e => e.preventDefault());
  b.onclick = () => {
    vibe(6);
    if (b.dataset.key === 'ctrl') { ctrl = !ctrl; b.classList.toggle('on', ctrl); }
    else tsend(KEYS[b.dataset.key]);
    keepFocus();
  };
});
// ---- pole pisania – pewniejsze na Androidzie niż pisanie prosto w terminal (polskie znaki, autokorekta, dyktowanie) ----
const tin = $('#tin');
function keepFocus() { if (document.activeElement !== tin) term?.focus(); }
const growTin = () => { tin.style.height = 'auto'; tin.style.height = Math.min(96, tin.scrollHeight) + 'px'; };
tin.addEventListener('input', growTin);
function sendLine() {
  const txt = tin.value;
  vibe(8);
  if (!ws || ws.readyState !== 1) { term?.write(`\r\n\x1b[38;2;217;119;87m● ${t('term_off')}\x1b[0m\r\n`); return; }
  if (ctrl && txt.length === 1) {                                   // Ctrl + litera z pola
    const c = txt.toUpperCase().charCodeAt(0);
    if (c >= 64 && c <= 95) tsend(String.fromCharCode(c - 64));
    ctrl = false; $('#key-ctrl').classList.remove('on'); tin.value = ''; growTin(); return;
  }
  if (txt) {
    const multi = txt.includes('\n');
    // wieloliniowy tekst jako „wklejenie”, żeby Enter w środku nie wysłał wiadomości za wcześnie
    tsend(multi ? '\x1b[200~' + txt.replace(/\n/g, '\r') + '\x1b[201~' : txt);
    setTimeout(() => tsend('\r'), 120);
  } else tsend('\r');                                               // pusty = sam Enter (np. potwierdzenie)
  tin.value = ''; growTin();
}
$('#composer').addEventListener('submit', e => { e.preventDefault(); sendLine(); tin.focus(); });
$('#tsend').addEventListener('mousedown', e => e.preventDefault()); // klawiatura zostaje
tin.addEventListener('keydown', e => {
  if (e.key === 'Enter' && !e.shiftKey && !e.isComposing) { e.preventDefault(); sendLine(); }
});

const setFont = n => { opts.font = Math.max(9, Math.min(22, n)); saveOpts(); if (term) { term.options.fontSize = opts.font; try { fit.fit(); } catch (e) {} } };
$('#font-minus').onclick = () => setFont(opts.font - 1);
$('#font-plus').onclick = () => setFont(opts.font + 1);

// =====================================================================
// pokój duszka – meble (SVG), dzień/noc za oknem, zegar z prawdziwą godziną; meble można dotykać
// =====================================================================
const room = (() => {
  const box = $('#pet-room');
  box.querySelector('.room-floor')?.remove();
  box.insertAdjacentHTML('afterbegin', `<svg class="room-svg" viewBox="0 0 360 230" preserveAspectRatio="xMidYMax slice" aria-hidden="true">
  <defs>
    <linearGradient id="r-wall" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#2a2536"/><stop offset="1" stop-color="#1e1b27"/></linearGradient>
    <pattern id="r-stripe" width="18" height="10" patternUnits="userSpaceOnUse"><rect width="9" height="10" fill="rgba(255,255,255,0.025)"/></pattern>
    <linearGradient id="r-floor" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#4a3329"/><stop offset="1" stop-color="#33241e"/></linearGradient>
    <linearGradient id="r-day" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#7ec0ee"/><stop offset="1" stop-color="#d4ecfa"/></linearGradient>
    <linearGradient id="r-night" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#0d1330"/><stop offset="1" stop-color="#2b3566"/></linearGradient>
    <radialGradient id="r-glow"><stop offset="0" stop-color="rgba(255,206,130,0.5)"/><stop offset="1" stop-color="rgba(255,206,130,0)"/></radialGradient>
  </defs>
  <rect width="360" height="188" fill="url(#r-wall)"/>
  <rect width="360" height="188" fill="url(#r-stripe)"/>
  <circle class="r-glow" cx="134" cy="112" r="78" fill="url(#r-glow)"/>

  <g class="r-win" data-act="window">
    <rect x="236" y="30" width="88" height="72" rx="6" fill="#3d3549"/>
    <rect x="242" y="36" width="76" height="60" rx="3" fill="url(#r-day)" class="r-sky-day"/>
    <rect x="242" y="36" width="76" height="60" rx="3" fill="url(#r-night)" class="r-sky-night"/>
    <g class="r-dayonly">
      <circle cx="262" cy="52" r="8" fill="#ffd65a"/>
      <g fill="#fff"><ellipse cx="298" cy="74" rx="11" ry="5"/><ellipse cx="291" cy="70" rx="7" ry="5"/><ellipse cx="303" cy="69" rx="6" ry="5"/></g>
    </g>
    <g class="r-nightonly">
      <circle cx="298" cy="52" r="8" fill="#f4eac2"/><circle cx="302" cy="49" r="7" fill="#141b3e"/>
      <g fill="#fff"><circle cx="256" cy="46" r="1"/><circle cx="270" cy="60" r="0.8"/><circle cx="262" cy="80" r="1"/><circle cx="310" cy="82" r="0.8"/><circle cx="288" cy="64" r="0.7"/></g>
    </g>
    <rect x="279" y="36" width="2" height="60" fill="#3d3549"/>
    <rect x="242" y="65" width="76" height="2" fill="#3d3549"/>
    <rect x="232" y="100" width="96" height="6" rx="2" fill="#4c4259"/>
    <rect x="228" y="24" width="104" height="3" rx="1.5" fill="#5c5170"/>
    <path d="M232 26 h16 q-5 40 1 80 h-17 z" fill="#c4603b" opacity="0.9"/>
    <path d="M328 26 h-16 q5 40 -1 80 h17 z" fill="#c4603b" opacity="0.9"/>
  </g>

  <g transform="translate(140 36)">
    <rect width="46" height="36" rx="3" fill="#4c4259"/>
    <rect x="4" y="4" width="38" height="28" fill="#2e3e5c"/>
    <path d="M4 32 L16 17 L24 25 L31 18 L42 32 Z" fill="#d97757"/>
    <circle cx="33" cy="11" r="3.5" fill="#ffd27a"/>
  </g>

  <g transform="translate(208 52)">
    <circle r="13" fill="#efe6dc" stroke="#4c4259" stroke-width="3"/>
    <line class="r-hh" x1="0" y1="0" x2="0" y2="-6" stroke="#2a1d22" stroke-width="2.2" stroke-linecap="round"/>
    <line class="r-mh" x1="0" y1="0" x2="0" y2="-9.5" stroke="#2a1d22" stroke-width="1.4" stroke-linecap="round"/>
    <circle r="1.6" fill="#d97757"/>
  </g>

  <g transform="translate(16 74)">
    <rect x="0" y="24" width="92" height="5" rx="2" fill="#6b5141"/>
    <path d="M8 29 l0 8 l8 -8 z M76 29 l8 8 l0 -8 z" fill="#5b4537"/>
    <rect x="6" y="4" width="7" height="20" rx="1" fill="#d97757"/>
    <rect x="14" y="7" width="6" height="17" rx="1" fill="#7aa2f7"/>
    <rect x="21" y="2" width="8" height="22" rx="1" fill="#9ece6a"/>
    <rect x="30" y="8" width="5" height="16" rx="1" fill="#e0af68"/>
    <rect x="40" y="6" width="6" height="18" rx="1" fill="#bb9af7" transform="rotate(16 43 24)"/>
    <g class="r-plant" data-act="plant">
      <path d="M64 24 l2 -12 h14 l2 12 z" fill="#c4603b"/>
      <rect x="64" y="10" width="18" height="3" rx="1.5" fill="#a94f30"/>
      <path d="M73 10 q-10 -6 -12 -16 q9 3 12 16 z" fill="#6fbf73"/>
      <path d="M73 10 q9 -8 10 -18 q-9 5 -10 18 z" fill="#86d48a"/>
      <path d="M73 10 q-1 -10 2 -20 q3 10 -2 20 z" fill="#5aa95e"/>
    </g>
  </g>

  <rect y="184" width="360" height="5" fill="#3d3549"/>
  <rect y="189" width="360" height="41" fill="url(#r-floor)"/>
  <g stroke="rgba(0,0,0,0.25)" stroke-width="1">
    <line x1="0" y1="203" x2="360" y2="203"/><line x1="0" y1="217" x2="360" y2="217"/>
    <line x1="60" y1="189" x2="60" y2="203"/><line x1="170" y1="189" x2="170" y2="203"/><line x1="290" y1="189" x2="290" y2="203"/>
    <line x1="20" y1="203" x2="20" y2="217"/><line x1="120" y1="203" x2="120" y2="217"/><line x1="235" y1="203" x2="235" y2="217"/><line x1="335" y1="203" x2="335" y2="217"/>
    <line x1="80" y1="217" x2="80" y2="230"/><line x1="200" y1="217" x2="200" y2="230"/><line x1="310" y1="217" x2="310" y2="230"/>
  </g>
  <ellipse cx="180" cy="209" rx="76" ry="13" fill="#5e3446"/>
  <ellipse cx="180" cy="209" rx="64" ry="9" fill="none" stroke="#d97757" stroke-width="1.5" stroke-dasharray="4 3" opacity="0.8"/>

  <g class="r-bed" data-act="bed">
    <rect x="10" y="134" width="14" height="64" rx="5" fill="#6a4a3a"/>
    <rect x="13" y="138" width="8" height="18" rx="3" fill="#7c5844"/>
    <rect x="16" y="190" width="5" height="9" fill="#5b3f31"/>
    <rect x="112" y="190" width="5" height="9" fill="#5b3f31"/>
    <rect x="14" y="176" width="106" height="15" rx="3" fill="#7c5844"/>
    <rect x="20" y="162" width="98" height="17" rx="6" fill="#efe6dc"/>
    <rect x="24" y="151" width="30" height="15" rx="7" fill="#fffaf4"/>
    <path d="M52 160 h62 q6 0 6 7 v12 h-68 z" fill="#d97757"/>
    <path d="M52 168 h68" stroke="#f3a07f" stroke-width="2"/>
    <rect x="112" y="156" width="10" height="42" rx="4" fill="#6a4a3a"/>
  </g>

  <g class="r-lamp" data-act="lamp">
    <ellipse cx="136" cy="198" rx="11" ry="3" fill="#4c4259"/>
    <rect x="134.5" y="116" width="3" height="82" fill="#5c5170"/>
    <path class="r-shade" d="M122 118 L150 118 L143 95 L129 95 Z" fill="#f3c77a"/>
    <ellipse class="r-bulb" cx="136" cy="119" rx="9" ry="2.5" fill="#fff3c4"/>
  </g>

  <g class="r-pc" data-act="pc">
    <rect x="262" y="112" width="54" height="34" rx="4" fill="#2a2733"/>
    <rect class="r-screen" x="266" y="116" width="46" height="26" rx="2" fill="#0c0c10"/>
    <text class="r-prompt" x="270" y="133" font-family="monospace" font-size="10" font-weight="700" fill="#9ece6a">&gt;_</text>
    <rect x="285" y="146" width="8" height="5" fill="#3d3549"/>
    <rect x="276" y="149" width="26" height="3" rx="1.5" fill="#3d3549"/>
    <rect x="322" y="140" width="9" height="11" rx="2" fill="#d97757"/>
    <path d="M331 143 q5 0 5 3 q0 3 -5 3" fill="none" stroke="#d97757" stroke-width="1.8"/>
    <rect x="250" y="151" width="96" height="6" rx="2" fill="#7c5844"/>
    <rect x="254" y="157" width="5" height="41" fill="#6a4a3a"/>
    <rect x="337" y="157" width="5" height="41" fill="#6a4a3a"/>
    <rect x="300" y="157" width="34" height="16" rx="2" fill="#6a4a3a"/>
    <circle cx="317" cy="165" r="1.8" fill="#e0af68"/>
  </g>

  <g class="r-ball" data-act="ball">
    <g class="r-ball-in">
      <circle cx="236" cy="203" r="8" fill="#7aa2f7"/>
      <path d="M228.5 200 q7.5 5 15 0 M228.5 206 q7.5 -5 15 0" stroke="#fff" stroke-width="1.6" fill="none"/>
      <circle cx="233" cy="200" r="2" fill="rgba(255,255,255,0.6)"/>
    </g>
  </g>
  <rect class="r-dark" width="360" height="230" fill="#05050f" pointer-events="none"/>
</svg>`);
  const svg = box.querySelector('.room-svg');
  let lampOn = true, slept = null, handler = () => {};
  const clock = () => {
    const d = new Date(), h = d.getHours(), m = d.getMinutes();
    svg.querySelector('.r-hh').setAttribute('transform', `rotate(${(h % 12 + m / 60) * 30})`);
    svg.querySelector('.r-mh').setAttribute('transform', `rotate(${m * 6})`);
    svg.classList.toggle('night', h < 7 || h >= 19);
  };
  clock(); setInterval(clock, 30000);
  const light = () => svg.classList.toggle('lamp-off', !lampOn);
  svg.addEventListener('click', e => {
    const g = e.target.closest('[data-act]');
    if (!g) return;
    const act = g.dataset.act;
    if (act === 'lamp') { lampOn = !lampOn; light(); }
    if (act === 'ball') { g.classList.remove('bounce'); void g.getBoundingClientRect(); g.classList.add('bounce'); }
    g.classList.remove('poke'); void g.getBoundingClientRect(); g.classList.add('poke');
    handler(act, { lampOn, night: svg.classList.contains('night') });
  });
  // punkt pokoju (w jednostkach rysunku) → piksele ekranu, z uwzględnieniem przycięcia „slice”
  const pt = (vx, vy) => {
    const r = box.getBoundingClientRect(), k = Math.max(r.width / 360, r.height / 230);
    return [r.left + (r.width - 360 * k) / 2 + vx * k, r.top + (r.height - 230 * k) + vy * k];
  };
  return {
    on: f => { handler = f; },
    sleep: s => { if (s === slept) return; slept = s; svg.classList.toggle('sleeping', s); lampOn = !s; light(); },
    bedSpot: () => { const [x, y] = pt(70, 166); return [x - 46, y - 86]; },
  };
})();

// =====================================================================
// duszek
// =====================================================================
const pet = (() => {
  const el = $('#pet'), bubble = $('#bubble');
  const S = Object.assign({ name: 'Pimpek', food: 80, fun: 80, energy: 90, sleeping: false, t: Date.now(), x: null, y: null, fed: 0, pets: 0 },
    store.get('pet', {}));
  const clamp = v => Math.max(0, Math.min(100, v));
  const save = () => { S.t = Date.now(); store.set('pet', S); };
  // upływ czasu (także gdy aplikacja była zamknięta)
  const tick = () => {
    const min = Math.min(24 * 60, (Date.now() - S.t) / 60000);
    S.food = clamp(S.food - 0.2 * min);
    S.fun = clamp(S.fun - 0.15 * min);
    S.energy = clamp(S.energy + (S.sleeping ? 0.6 : -0.1) * min);
    if (S.sleeping && S.energy >= 100) { S.sleeping = false; say(pick(LINES.wake)); goHome(); }
    save(); paint();
  };
  // kwestie: każda postać ma swoje (lines.js), co jakiś czas wplatamy wspólne; bez powtórek z ostatnich kilku
  const PL = (I18N.lang === 'pl' ? window.PET_LINES : window.PET_LINES_EN) || window.PET_LINES || {};
  const ch = () => PL[el.dataset.skin] || PL.ghost || {};
  const recent = [];
  const pick = arr => {
    const pool = arr.filter(t => !recent.includes(t));
    const t = (pool.length ? pool : arr)[Math.floor(Math.random() * (pool.length || arr.length))];
    recent.push(t); if (recent.length > 12) recent.shift();
    return t;
  };
  const fill = t => (t || '').replace(/\{name\}/g, S.name);
  const line = cat => {
    const own = ch()[cat] || PL.ghost?.[cat] || [];
    if (cat === 'idle') {
      const d = new Date(), day = d.getDay(), h = d.getHours(), c = PL.common || {};
      if ((day === 0 || day === 6) && Math.random() < 0.15) return fill(pick(c.weekend));
      if (day === 1 && h < 14 && Math.random() < 0.12) return fill(pick(c.monday));
      if (h >= 18 && h < 23 && Math.random() < 0.12) return fill(pick(c.evening));
      if (Math.random() < 0.22) return fill(pick(c.idle));
    }
    return fill(pick(own));
  };
  const LINES = new Proxy({}, { get: (_, cat) => [line(cat)] });   // stary kod: pick(LINES.x) dalej działa
  const FOODS = window.FOODS || {};
  const foodName = id => t('food_' + id);
  const limitLine = () => {
    const u = lastUsage;
    if (!u || !u.h5) return null;
    const h5 = u.h5.pct, d7 = u.d7?.pct;
    if (h5 >= 90) return t('lim_crit', { p: Math.round(h5), r: at(u.h5.reset) });
    if (h5 >= 70) return t('lim_warn', { p: Math.round(h5) });
    if (d7 != null && d7 >= 80) return t('lim_week', { p: Math.round(d7), r: at(u.d7.reset) });
    if (h5 < 20) return t('lim_low', { p: 100 - Math.round(h5) });
    return t('lim_info', { a: 100 - Math.round(h5), b: 100 - Math.round(d7 || 0) });
  };

  let hideT = null;
  function say(text, ms = 4200) {
    if (!text) return;
    bubble.textContent = text;
    const r = el.getBoundingClientRect(), vw = innerWidth;
    bubble.classList.toggle('left', r.left > vw - 150);
    bubble.classList.toggle('rightside', r.left < 60);
    bubble.classList.add('show');
    clearTimeout(hideT);
    hideT = setTimeout(() => bubble.classList.remove('show'), ms);
  }
  const mood = (cls, ms) => { el.classList.add(cls); setTimeout(() => el.classList.remove(cls), ms); };
  function fx(emoji, x, y, cls = '', dx = 0) {
    const f = document.createElement('div');
    f.className = `fx ${cls}`;
    if (emoji.startsWith('<svg')) f.innerHTML = emoji; else f.textContent = emoji;
    f.style.left = `${x}px`; f.style.top = `${y}px`; f.style.setProperty('--dx', `${dx}px`);
    $('#fx').appendChild(f);
    setTimeout(() => f.remove(), 1300);
  }
  const center = () => { const r = el.getBoundingClientRect(); return [r.left + r.width / 2, r.top + r.height / 2]; };

  // ---------- postacie (skórki) ----------
  function skin(id, talk) {
    const sk = (window.SKINS || {})[id] || (window.SKINS || {}).ghost;
    if (!sk) return;
    el.querySelector('svg.ghost').outerHTML = sk.svg;
    el.dataset.skin = id;
    $$('#skin-pick .chip').forEach(b => b.classList.toggle('on', b.dataset.skin === id));
    if (talk) say(fill(ch().skin) || t('new_look'));
    renderFoods();
  }
  $('#skin-pick').innerHTML = Object.entries(window.SKINS || {})
    .map(([id, s]) => `<button class="chip" data-skin="${id}"><b>${s.emoji}</b>${t('skin_' + id)}</button>`).join('');
  $$('#skin-pick .chip').forEach(b => { b.onclick = () => {
    opts.skin = b.dataset.skin; saveOpts(); skin(opts.skin, true); vibe(12);
    el.classList.remove('squish'); void el.offsetWidth; el.classList.add('squish');
  }; });
  skin(opts.skin, false);
  function eyes() {
    el.classList.toggle('sq', opts.eyes === 'square');
    $$('[data-eyes]').forEach(b => b.classList.toggle('on', b.dataset.eyes === opts.eyes));
  }
  $$('[data-eyes]').forEach(b => { b.onclick = () => {
    opts.eyes = b.dataset.eyes; saveOpts(); eyes(); vibe(10);
    say(t(opts.eyes === 'square' ? 'eyes_sq_say' : 'eyes_round_say'));
  }; });
  eyes();
  function paint() {
    $('#bar-food').style.width = `${S.food}%`;
    $('#bar-fun').style.width = `${S.fun}%`;
    $('#bar-energy').style.width = `${S.energy}%`;
    $('#pet-name').textContent = S.name;
    el.classList.toggle('sleep', S.sleeping);
    el.classList.toggle('sad', !S.sleeping && (S.food < 20 || S.fun < 20));
    $('#act-sleep').textContent = t(S.sleeping ? 'act_wake' : 'act_sleep');
    room.sleep(S.sleeping);
  }
  function place(x, y) {
    const w = el.offsetWidth || 92, h = el.offsetHeight || 100;
    x = Math.max(0, Math.min(innerWidth - w, x));
    y = Math.max(40, Math.min(innerHeight - h - 70, y));
    S.x = x; S.y = y;
    el.style.transform = `translate(${x}px, ${y}px)`;
  }
  const roomSpot = () => { const r = $('#pet-room').getBoundingClientRect(); return [r.left + r.width / 2 - 46, r.top + r.height - 120]; };

  function petIt() {
    if (S.sleeping) { S.sleeping = false; say(pick(LINES.wake)); paint(); save(); goHome(); return; }
    S.fun = clamp(S.fun + 12); S.pets++;
    el.classList.remove('squish'); void el.offsetWidth; el.classList.add('squish');
    mood('happy', 1400);
    const [x, y] = center();
    ['💛', '💖', '✨'].forEach((e, i) => setTimeout(() => fx(e, x - 12 + (i - 1) * 18, y - 40, '', (i - 1) * 24), i * 90));
    vibe(15);
    say(pick(LINES.pet));
    paint(); save();
  }
  // jedzenie 2D (foods.js); każda postać ma ulubione (★) i własną reakcję na każde danie
  function renderFoods() {
    const fav = ch().fav;
    $('#food-row').innerHTML = Object.entries(FOODS).map(([id, f]) =>
      `<button class="food${id === fav ? ' fav' : ''}" data-food="${id}" aria-label="${foodName(id)}">${f.svg}<span>${foodName(id)}</span></button>`).join('');
    $$('#food-row .food').forEach(b => { b.onclick = () => feed(b.dataset.food); });
    $('#fav-hint').textContent = FOODS[fav] ? t('fav_hint', { f: foodName(fav).toLowerCase() }) : '';
  }
  function feed(id) {
    if (S.sleeping) { say(t('asleep_nofood')); return; }
    if (S.food > 95) { say(pick(LINES.full)); mood('sad', 1200); return; }
    const f = FOODS[id] || { svg: '🍪' };
    const c = ch(), fav = id === c.fav, yuck = id === 'battery' && el.dataset.skin !== 'robot';
    const [x, y] = center();
    fx(f.svg, x - 20, y - 14, 'drop');
    setTimeout(() => {
      el.classList.add('chew');
      setTimeout(() => el.classList.remove('chew'), 1500);
      S.food = clamp(S.food + (yuck ? 4 : fav ? 35 : 25));
      S.fun = clamp(S.fun + (yuck ? -3 : fav ? 14 : 4)); S.fed++;
      vibe(fav ? 35 : 20);
      say(fill((c.taste || {})[id]) || t('yum', { f: foodName(id) }), 4600);
      if (fav) { mood('happy', 1600); ['💛', '✨', '💖'].forEach((e, i) => setTimeout(() => fx(e, x - 12 + (i - 1) * 20, y - 44, '', (i - 1) * 26), 300 + i * 90)); }
      if (yuck) mood('sad', 1400);
      paint(); save();
    }, 650);
  }
  function toggleSleep() {
    S.sleeping = !S.sleeping;
    say(pick(S.sleeping ? LINES.sleep : LINES.wake));
    paint(); save();
    goHome();
  }
  // w pokoju: śpi w łóżku, a nie śpi – na dywanie
  const homeSpot = () => (S.sleeping ? room.bedSpot() : roomSpot());
  function glide(x, y, ms = 500) {
    el.style.transition = `transform ${ms / 1000}s cubic-bezier(.3,1.4,.5,1)`; place(x, y);
    setTimeout(() => { el.style.transition = ''; }, ms + 50);
  }
  function goHome() { if (page === 'pet') { const [x, y] = homeSpot(); glide(x, y, 700); } }
  let ballN = 0;
  room.on((act, st) => {
    vibe(10);
    if (act === 'bed') { toggleSleep(); return; }
    if (act === 'ball') {
      if (S.sleeping) { say(t('asleep_nofood')); return; }
      S.fun = clamp(S.fun + 6); mood('happy', 1200);
      el.classList.remove('squish'); void el.offsetWidth; el.classList.add('squish');
      say(t(ballN++ % 2 ? 'room_ball2' : 'room_ball')); paint(); save(); return;
    }
    if (S.sleeping) return;
    if (act === 'lamp') say(t(st.lampOn ? 'room_lamp_on' : 'room_lamp_off'));
    if (act === 'pc') say(t('room_pc'));
    if (act === 'window') say(t(st.night ? 'room_night' : 'room_day'));
    if (act === 'plant') say(t('room_plant'));
  });
  function chatter() {
    if (S.sleeping) {
      const [x, y] = center();
      const z = document.createElement('div');
      z.className = 'zzz'; z.textContent = 'z'; z.style.left = `${x + 18}px`; z.style.top = `${y - 34}px`;
      $('#fx').appendChild(z); setTimeout(() => z.remove(), 2500);
      return;
    }
    const h = new Date().getHours();
    let pool = LINES.idle;
    if (S.food < 30) pool = LINES.hungry;
    else if (S.energy < 20) pool = LINES.sleepy;
    else if (S.fun < 25) pool = LINES.sad;
    else if (h >= 0 && h < 5 && Math.random() < 0.5) pool = LINES.late;
    else if (h >= 6 && h < 10 && Math.random() < 0.3) pool = LINES.morning;
    else if (Math.random() < 0.3) { const l = limitLine(); if (l) { say(l, 5500); return; } }
    say(pick(pool));
  }

  // ---------- przeciąganie i dotyk ----------
  let drag = null, pressT = null;
  el.addEventListener('pointerdown', e => {
    el.setPointerCapture(e.pointerId);
    const r = el.getBoundingClientRect();
    drag = { sx: e.clientX, sy: e.clientY, ox: e.clientX - r.left, oy: e.clientY - r.top, moved: false };
    pressT = setTimeout(() => { if (drag && !drag.moved) { drag.long = true; mood('wow', 900); vibe(30); say(limitLine() || t('ooo'), 5000); } }, 650);
  });
  el.addEventListener('pointermove', e => {
    if (!drag) return;
    if (!drag.moved && Math.hypot(e.clientX - drag.sx, e.clientY - drag.sy) > 8) {
      drag.moved = true; el.classList.add('dragging'); clearTimeout(pressT);
      if (Math.random() < 0.35) say(pick(LINES.drag), 1500);
    }
    if (drag.moved) place(e.clientX - drag.ox, e.clientY - drag.oy);
  });
  const end = () => {
    clearTimeout(pressT);
    if (!drag) return;
    if (drag.moved) { el.classList.remove('dragging'); save(); }
    else if (!drag.long) petIt();
    drag = null;
  };
  el.addEventListener('pointerup', end);
  el.addEventListener('pointercancel', end);

  // ---------- pokój ----------
  renderFoods();
  $('#act-pet').onclick = petIt;
  $('#act-sleep').onclick = toggleSleep;
  // „Pogadaj”: zwykle własna kwestia postaci, czasem info o limitach
  $('#act-talk').onclick = () => {
    let l = Math.random() < 0.25 ? limitLine() : null;
    if (l && recent.includes(l)) l = null; else if (l) { recent.push(l); if (recent.length > 12) recent.shift(); }
    say(l || pick(LINES.idle), 5000);
  };
  window.__petFood = v => { S.food = v; paint(); };   // do testów
  $('#rename').onclick = () => {
    const span = $('#pet-name');
    const inp = document.createElement('input');
    inp.value = S.name; inp.maxLength = 16; inp.className = 'rename';
    inp.style.cssText = 'width:140px;padding:6px 10px;font-size:15px;border-radius:10px;';
    span.replaceWith(inp); inp.focus(); inp.select();
    const done = () => {
      S.name = inp.value.trim() || S.name; inp.replaceWith(span); save(); paint();
      say(t('renamed', { n: S.name }));
    };
    inp.onblur = done;
    inp.onkeydown = e => { if (e.key === 'Enter') inp.blur(); };
  };

  function onPage(p) {
    const visible = opts.petFloat || p === 'pet';
    el.classList.toggle('hidden', !visible || $('#main').classList.contains('hidden'));
    if (p === 'pet') { const [x, y] = homeSpot(); glide(x, y); }
    el.classList.toggle('mini', p === 'term');                          // w terminalu mniejszy, w rogu – nie zasłania pisania
    if (p === 'term') { el.style.transition = 'transform 0.4s ease'; place(innerWidth - 74, 104); setTimeout(() => { el.style.transition = ''; }, 450); }
  }
  function show() {
    tick();
    el.classList.remove('hidden');
    if (S.x == null) place(innerWidth - 120, innerHeight * 0.55); else place(S.x, S.y);
    setTimeout(() => say(S.food < 30 ? pick(LINES.hungry) : pick(LINES.hello)), 600);
  }
  setInterval(() => { if (!el.classList.contains('hidden')) { el.classList.add('blink'); setTimeout(() => el.classList.remove('blink'), 140); } }, 3800);
  setInterval(tick, 60000);
  const loop = () => { if (opts.petTalk && document.visibilityState === 'visible' && !el.classList.contains('hidden')) chatter();
    setTimeout(loop, S.sleeping ? 4000 : 25000 + Math.random() * 25000); };
  setTimeout(loop, 15000);
  addEventListener('resize', () => { if (S.x != null) place(S.x, S.y); });
  paint();
  return { el, show, onPage, say };
})();

// =====================================================================
// ustawienia
// =====================================================================
$('#opt-pet-float').checked = opts.petFloat;
$('#opt-pet-talk').checked = opts.petTalk;
$('#opt-vibe').checked = opts.vibe;
$('#opt-pet-float').onchange = e => { opts.petFloat = e.target.checked; saveOpts(); pet.onPage(page); };
$('#opt-pet-talk').onchange = e => { opts.petTalk = e.target.checked; saveOpts(); };
$('#opt-vibe').onchange = e => { opts.vibe = e.target.checked; saveOpts(); };

// =====================================================================
// start
// =====================================================================
// język: lista w Ustawieniach i ekran wyboru przy pierwszym uruchomieniu
const langBtns = sel => I18N.LANGS.map(([c, n, f]) => `<button class="lang-btn${c === I18N.lang ? ' on' : ''}" data-lang="${c}"><span>${f}</span>${n}</button>`).join('');
$('#opt-lang').innerHTML = I18N.LANGS.map(([c, n, f]) => `<option value="${c}"${c === I18N.lang ? ' selected' : ''}>${f} ${n}</option>`).join('');
$('#opt-lang').onchange = e => { I18N.set(e.target.value); location.reload(); };
function showLang() {
  $('#pair').classList.add('hidden'); $('#main').classList.add('hidden'); $('#lang').classList.remove('hidden');
  $('#lang-grid').innerHTML = langBtns();
  $$('#lang-grid .lang-btn').forEach(b => { b.onclick = () => { vibe(10); I18N.set(b.dataset.lang); location.reload(); }; });
}
(async () => {
  if (!I18N.chosen()) { showLang(); return; }      // pierwsze uruchomienie: wybór języka
  if (!host || !token) return;                     // potem: ekran parowania
  startMain(null);
  setConn('', t('connecting'));
  try {
    await checkConn();
  } catch (e) { setConn('bad', t('offline')); }
})();
async function checkConn() {
  if (isTail(host) && hosts.some(h => !isTail(h))) await findHost();   // wróciłeś do domu? domowe Wi-Fi jest szybsze
  const p = await api('ping', 6000);
  learnHosts(p);
  setConn('ok', p.host + viaText());
  $('#set-host').textContent = `${p.user}@${p.host} · ${host}`;
  const ts = hosts.find(isTail);
  $('#set-tail').textContent = ts ? t('tail_ready', { ip: ts.replace(/:\d+$/, '') }) : t('tail_hint');
  return p;
}
// po powrocie do apki (np. zmiana Wi-Fi ↔ 4G) sprawdź, który adres teraz działa
document.addEventListener('visibilitychange', () => {
  if (document.visibilityState !== 'visible' || !token) return;
  checkConn().then(() => { if (page === 'limits') refreshUsage(); if (page === 'term' && !ws) connectTerm(); })
    .catch(() => setConn('bad', t('offline')));
});

// przycisk Wstecz w telefonie: najpierw powrót do Limitów, potem wyjście (obsługa w MainActivity)
window.cpBack = () => {
  if (!$('#main').classList.contains('hidden') && page !== 'limits') { showPage('limits'); return true; }
  return false;
};

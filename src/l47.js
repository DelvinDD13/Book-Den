// ===== L47: Audible time counts (approved Nov 11 2026, mocks 3–5). "Add time" gets a From Audible side: he types the time left that
// Audible shows, and the app works out what he listened since the last reading, at his speed. Time the reading timer already
// logged for that book in between is taken off, so nothing counts twice. It is saved as a session on the book (marked as from
// Audible), so it goes toward the day's listening quest, hours on the clock, reading days and the four-week grid on Lifestyle.
// Readings are kept on the book (al: [[time, minutes left]]). The first baseline for 22 books is his Audible library page of Nov 7.
(function () {
  const L47 = window.L47 = {};
  const esc = s => String(s == null ? '' : s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const O = k => { try { return getOverride(k) || {}; } catch (e) { return {}; } };
  const pad = n => String(n).padStart(2, '0');
  const iso = d => d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate());
  const today = () => iso(new Date());
  const hm = m => { m = Math.max(0, Math.round(m)); return Math.floor(m / 60) + ' h ' + pad(m % 60) + ' m'; };
  const fm = m => { try { return L35.fmtMin(m); } catch (e) { return hm(m); } };
  const mins = s => { const x = String(s || '').match(/(\d+)\s*h(?:\D+(\d+)\s*m)?|(\d+)\s*m/i); return x ? (x[3] ? +x[3] : (+x[1]) * 60 + (+(x[2] || 0))) : 0; };
  const day = s => { try { return new Date(String(s).slice(0, 10) + 'T12:00:00').toLocaleDateString(undefined, { month: 'short', day: 'numeric' }); } catch (e) { return String(s).slice(0, 10); } };
  // Nov 7 time-left readings from his Audible library (L22)
  const NOV7 = {"Legends & Lattes: A Novel of High Fantasy and Low Stakes":430,"Sociopath: A Memoir":653,"The Lost Sisters":89,"Tripas: Poems":69,"The Hero of Ages: Book Three of Mistborn":937,"Vengeful: Villains, Book 2":745,"The Shadow of the Gods: The Bloodsworn Saga, Book 1":1072,"Crave: Crave Series, Book 1":887,"Marvel Super Heroes: Secret Wars":396,"The Way of Kings: Book One of the Stormlight Archive":2702,"The Games Gods Play":980,"Six of Crows":894,"Shadow and Bone":381,"Lord of the Butterflies":90,"The Complete Poppy War Trilogy":3869,"Jade City: The Green Bone Saga, Book 1":1135,"Starsight":852,"Heroes: The Greek Myths Reimagined":567,"Quicksilver: The Fae & Alchemy Series, Book 1":608,"Best Served Cold":1573,"The Lies of Locke Lamora: Gentleman Bastard, Book 1":1233};
  L47.NOV7 = NOV7;
  L47.len = t => { try { return L46.len(t); } catch (e) { return +O(t).len || null; } };
  L47.readings = function (t) { const R = (O(t).al || []).map(x => ({ at: String(x[0]), left: +x[1] })).filter(x => x.left >= 0);
    if (NOV7[t] != null && !R.some(x => x.at < '2026-11-08')) R.unshift({ at: '2026-11-07T12:00', left: NOV7[t], lib: 1 }); return R.sort((a, b) => a.at.localeCompare(b.at)); };
  L47.last = t => { const R = L47.readings(t); return R.length ? R[R.length - 1] : null; };
  // book minutes the timer logged on this book after a moment (Audible sessions are not counted here)
  L47.timerBookSince = (t, at) => (O(t).rs || []).filter(x => x[4] !== 'a' && (!at || String(x[0]) > at)).reduce((a, x) => a + (+x[1] || 0) * (+x[2] || 1), 0);
  L47.timerMinSince = (t, at) => (O(t).rs || []).filter(x => x[4] !== 'a' && (!at || String(x[0]) > at)).reduce((a, x) => a + (+x[1] || 0), 0);
  L47.audOn = d => { let n = 0; try { ALL_TITLES.forEach(t => { (O(t).rs || []).forEach(x => { if (x[4] === 'a' && String(x[0]).slice(0, 10) === d) n += +x[1] || 0; }); }); } catch (e) {} return n; };
  // what is left now: the last reading, less what the timer logged since
  L47.leftNow = t => { const r = L47.last(t); if (!r) return null; return Math.max(0, r.left - L47.timerBookSince(t, r.at)); };
  // the sum for a new reading: book minutes since the last one, less the timer's share, at his speed
  L47.calc = function (t, left, sp, len) { sp = +sp || 2; const r = L47.last(t); len = +len || L47.len(t) || null; const out = { first: !r, len, sp, left };
    const from = r ? r.left : len; if (from == null) { out.need = 'len'; return out; }
    out.from = from; out.fromAt = r ? r.at : null; out.book = Math.max(0, from - left); out.timerBook = L47.timerBookSince(t, r ? r.at : null); out.timer = L47.timerMinSince(t, r ? r.at : null);
    out.addBook = Math.max(0, out.book - out.timerBook); out.add = Math.round(out.addBook / sp); out.listened = Math.round(out.book / sp);
    if (len) out.pct = Math.max(0, Math.min(99, Math.round((len - left) / len * 100))); if (left > from) out.back = true; return out; };
  L47.save = function (t, o) { const cur = O(t); const now = new Date(); const at = iso(now) + 'T' + pad(now.getHours()) + ':' + pad(now.getMinutes());
    const c = L47.calc(t, o.left, o.sp, o.len); const patch = { tm: Date.now(), al: (cur.al || []).concat([[at, Math.round(o.left)]]).slice(-60), sp: +o.sp || 2 };
    if (o.len && !(+cur.len > 0)) patch.len = Math.round(o.len);
    if (c.add > 0 && o.count !== false) { const d = o.day || today(); const rs = (cur.rs || []).slice(-299); rs.push([d + 'T' + (d === today() ? pad(now.getHours()) + ':' + pad(now.getMinutes()) : '21:00'), c.add, +o.sp || 2, o.ch || null, 'a']); patch.rs = rs; }
    if (c.pct != null) patch.progress = Math.max(+cur.progress || 0, c.pct);
    if (o.ch) { patch.ch = +o.ch; try { const b = L35.codexBook(t); if (b && b.ch) { let p = 0; b.ch.forEach((last, i) => { if (+o.ch - 1 >= last) p = i + 1; }); if (p > L29.part(b.k)) L29.setPart(b.k, p); } } catch (e) {} }
    if (cur.status !== 'read' && cur.status !== 'currently-reading') patch.status = 'currently-reading';
    try { setOverride(t, patch); setOverride('rt0', { sp: +o.sp || 2, am: 'aud' }); } catch (e) {}
    return c; };

  // ---------- the Add time sheet: Minutes | From Audible ----------
  const CSS = '.seg2{display:grid;grid-template-columns:1fr 1fr;margin:0 0 16px;border:1px solid rgba(243,239,230,.25)}.seg2 button{min-height:44px;font:600 14px "Barlow Condensed",Barlow,sans-serif;letter-spacing:.04em}.seg2 .on{background:var(--d-ink,#f3efe6);color:var(--d-bg,#0f0f11)}' +
    '.hm{display:flex;align-items:center;gap:8px}.hm input{width:84px;text-align:center;font:400 26px var(--b-disp,"Bebas Neue"),Impact,sans-serif;letter-spacing:.04em}.hm i{font-style:normal;color:var(--d-mute,#8e8e95);font:600 13px var(--b-mono,"IBM Plex Mono"),monospace;margin-right:8px}' +
    '.sum{margin:4px 0 16px;padding:12px 14px;border:1px solid var(--d-acc,#ff6a2a)}.sum b{display:block;font:400 30px/1 var(--b-disp,"Bebas Neue"),Impact,sans-serif;letter-spacing:.03em;color:var(--d-acc,#ff6a2a)}.sum span{display:block;margin-top:6px;font-size:14px;line-height:1.4;color:var(--d-ink,#f3efe6)}.sum em{display:block;margin-top:4px;font-size:12.5px;color:var(--d-mute,#8e8e95);font-style:normal}' +
    '.body.aud .l47-min{display:none!important}.body:not(.aud) .l47{display:none!important}.l47 input[type=date]{margin-top:8px}';
  let T = null, mode = 'aud', when = 'today';
  const R = () => { const h = document.getElementById('l35'); return h && h.shadowRoot; };
  function augment(t) { const root = R(); if (!root) return; const body = root.querySelector('.body'); if (!body || body.querySelector('.l47')) return; T = t; when = 'today';
    if (!root.getElementById('l47css')) { const st = document.createElement('style'); st.id = 'l47css'; st.textContent = CSS; root.appendChild(st); }
    const minF = body.querySelector('[data-f=min]'); if (minF && minF.closest('.f')) minF.closest('.f').classList.add('l47-min'); const lenF = body.querySelector('[data-f=len]'); if (lenF && lenF.closest('.f')) lenF.closest('.f').classList.add('l47-min');
    const r = L47.last(t), len = L47.len(t);
    const hint = 'On the book in your Audible library, or under the player.' + (r ? ' Last entry: ' + hm(r.left) + ' left, ' + (r.lib ? 'from your Audible library on ' : 'on ') + day(r.at) + '.' : len ? ' Whole book: ' + hm(len) + '.' : '');
    const seg = '<div class="seg2" data-l47seg><button data-l47m="min">Minutes</button><button data-l47m="aud">From Audible</button></div>';
    const panel = '<div class="l47"><div class="f"><span>Time left, as Audible shows it</span><div class="hm"><input data-l47="h" inputmode="numeric" type="number" min="0" max="200" placeholder="h"><i>h</i><input data-l47="m" inputmode="numeric" type="number" min="0" max="59" placeholder="m"><i>m</i></div><em>' + esc(hint) + '</em></div>' +
      (!r && !len ? '<div class="f"><span>Whole book length, as Audible shows it</span><div class="hm"><input data-l47="lh" inputmode="numeric" type="number" min="0" max="200" placeholder="h"><i>h</i><input data-l47="lm" inputmode="numeric" type="number" min="0" max="59" placeholder="m"><i>m</i></div><em>Needed once, to count the first entry.</em></div>' : '') +
      '<div class="f"><span>Count it on</span><div class="chips" data-l47when><button data-l47w="today" class="on">Today</button><button data-l47w="yday">Yesterday</button><button data-l47w="pick">Pick a day</button></div><input type="date" data-l47="day" hidden max="' + today() + '" value="' + today() + '"></div>' +
      '<div class="sum" data-l47sum><b>—</b><span>Type the hours and minutes left.</span></div></div>';
    const bk = body.querySelector('.bk'); if (bk) bk.insertAdjacentHTML('afterend', seg + panel); else body.insertAdjacentHTML('afterbegin', seg + panel);
    // the speed chips sit between the two; they serve both sides
    const sp = body.querySelector('[data-g=sp]'); const sumBox = body.querySelector('[data-l47sum]'); if (sp && sp.closest('.f') && sumBox) sumBox.parentNode.insertBefore(sp.closest('.f'), sumBox);
    mode = O('rt0').am === 'min' ? 'min' : 'aud'; setMode(mode);
    body.querySelectorAll('[data-l47]').forEach(i => i.addEventListener('input', upd)); }
  function setMode(m) { const root = R(); if (!root) return; mode = m; const body = root.querySelector('.body'); body.classList.toggle('aud', m === 'aud'); root.querySelectorAll('[data-l47m]').forEach(b => b.classList.toggle('on', b.dataset.l47m === m)); const ti = root.querySelector('.top b'); if (ti) ti.textContent = 'Add time'; upd(); }
  const val = f => { const root = R(); const x = root && root.querySelector('[data-l47=' + f + ']'); return x ? x.value : ''; };
  function speed() { const root = R(); const on = root && root.querySelector('[data-g=sp] .on'); return on ? +on.dataset.k : L35.speed(T); }
  function chosenDay() { const d = new Date(); if (when === 'yday') { d.setDate(d.getDate() - 1); return iso(d); } if (when === 'pick') return val('day') || today(); return today(); }
  function read() { const h = val('h'), m = val('m'); if (h === '' && m === '') return null; return (+h || 0) * 60 + (+m || 0); }
  function upd() { const root = R(); if (!root || !T) return; const box = root.querySelector('[data-l47sum]'); if (!box) return; const left = read(); const lh = val('lh'), lm = val('lm'); const len = (lh !== '' || lm !== '') ? (+lh || 0) * 60 + (+lm || 0) : null;
    if (left == null) { box.innerHTML = '<b>—</b><span>Type the hours and minutes left.</span>'; return; }
    const c = L47.calc(T, left, speed(), len); const d = chosenDay(); const dl = d === today() ? 'today’s' : 'that day’s';
    if (c.need) { box.innerHTML = '<b>Saved as your place</b><span>Add the whole book length above to count what you have listened so far.</span>'; return; }
    if (c.back) { box.innerHTML = '<b>Nothing to add</b><span>That is more time left than the last entry (' + hm(c.from) + '). It is saved as your place.</span>'; return; }
    let s = hm(c.book) + ' of book at ' + c.sp + 'x' + (c.first ? ' since the start' : ' since ' + day(c.fromAt)) + '.';
    if (c.timerBook > 0) s += ' The timer already logged ' + fm(c.timer) + ' of it, so ' + fm(c.add) + ' is added.';
    s += ' Goes toward ' + dl + ' 3 h, your hours on the clock and reading days.';
    box.innerHTML = '<b>' + (c.add > 0 ? fm(c.add) + ' listened' : 'Nothing new to add') + '</b><span>' + esc(s) + '</span>' + (c.pct != null ? '<em>Progress moves to ' + c.pct + '%.</em>' : ''); }
  function onClick(e) { const el = e.target.closest && e.target.closest('[data-l47m],[data-l47w],[data-a=save],[data-a=sp]'); if (!el || !T) return; const root = R();
    if (el.dataset.l47m) { e.stopPropagation(); setMode(el.dataset.l47m); try { setOverride('rt0', { am: el.dataset.l47m }); } catch (x) {} return; }
    if (el.dataset.l47w) { e.stopPropagation(); when = el.dataset.l47w; el.parentNode.querySelectorAll('button').forEach(b => b.classList.toggle('on', b === el)); const di = root.querySelector('[data-l47=day]'); if (di) di.hidden = when !== 'pick'; upd(); return; }
    if (el.dataset.a === 'sp') { setTimeout(upd, 0); return; }
    if (el.dataset.a === 'save' && mode === 'aud' && root.querySelector('.l47')) { const left = read(); if (left == null) { e.stopPropagation(); e.preventDefault(); try { toast('Type the time left first'); } catch (x) {} return; }
      e.stopPropagation(); e.preventDefault(); const lh = val('lh'), lm = val('lm'); const len = (lh !== '' || lm !== '') ? (+lh || 0) * 60 + (+lm || 0) : null; const chf = root.querySelector('[data-f=ch]'); const ch = chf && +chf.value || null; const nt = root.querySelector('[data-f=note]'); const t = T;
      let before = null; try { before = L29.stats(L29.by[L29.seriesFor(t)]).u; } catch (x) {}
      const c = L47.save(t, { left, sp: speed(), len, day: chosenDay(), ch });
      if (nt && nt.value.trim()) { try { const kind = (root.querySelector('.chips button.on[data-a=kind]') || {}).dataset; L35.addNote(t, { tx: nt.value.trim(), k: (kind && kind.k) || 'note', ch: ch || O(t).ch || null }); } catch (x) {} }
      T = null; try { L35.close(); } catch (x) {} try { rerender82(); } catch (x) {}
      let msg = c.add > 0 ? fm(c.add) + ' from Audible logged' : 'Your place is saved'; try { const after = L29.stats(L29.by[L29.seriesFor(t)]).u; if (before != null && after > before) msg += ' · ' + (after - before) + ' lore opened'; } catch (x) {}
      try { toast(msg); } catch (x) {} try { document.dispatchEvent(new CustomEvent('l35log', { detail: { t, min: c.add, aud: 1 } })); } catch (x) {} } }
  let bound = false;
  const _add = L35.addTime; L35.addTime = function (t) { const r = _add.apply(this, arguments); try { augment(t); const root = R(); if (root && !bound) { bound = true; root.addEventListener('click', onClick, true); } } catch (e) {} return r; };

  // ---------- Home: the current book says what Audible has left ----------
  (function () { if (!window.L11 || !L11.home) return; const _home = L11.home; L11.home = function () { let h = _home.apply(this, arguments); try { const m = h.match(/<div class="d-nt" data-dopen="([^"]+)">/); if (!m) return h; const t = decodeURIComponent(m[1]); const r0 = L47.last(t); if (!r0 || r0.lib) return h; const left = L47.leftNow(t); if (left == null) return h;
      const i = h.indexOf('<em>', m.index); const j = h.indexOf('</em>', i); if (i < 0 || j < 0) return h; const r = L47.last(t); h = h.slice(0, j) + ' · ' + hm(left) + (r && r.at.slice(0, 10) === today() ? ' left in Audible' : ' left at your last Audible entry') + h.slice(j); } catch (e) {} return h; }; })();
})();

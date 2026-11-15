// ===== L58: releases drop in. When a book, game or film in upcoming.json comes out, it goes into his plans without a tap:
//   a book into its series order (the "still to come" line becomes a book to get) and, when it comes out in 2027, into an open
//   spot of the 2027 plan from its month on (L56 and L57 ask this module); a game into the backlog; a film onto the watch list.
//   "Out" means the list says released, or its day has come and the list was checked within 14 days before that day. A weekly
//   scheduled check keeps the list true, so a date that slipped does not drop in. A drop is worked out from the list on every
//   open; the only thing saved for one is the game's or film's picture (a cv: row). He can keep one out ("Keep it out of my
//   plans", "Put it back in Upcoming"): that is the upoff row, and "Put it back" on something he said he owned keeps it out too.
(function () {
  if (!window.L19 || !window.L41 || !L41.raw) return; const L58 = window.L58 = {};
  const esc = s => String(s == null ? '' : s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const O = k => { try { return getOverride(k) || {}; } catch (e) { return {}; } };
  const nrm = t => { try { return normT(t); } catch (e) { return String(t).toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim(); } };
  const pad = n => String(n).padStart(2, '0');
  const now = () => { try { return today(); } catch (e) { const d = new Date(); return d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate()); } };
  const dOf = s => new Date(String(s).slice(0, 10) + 'T12:00:00');
  const full = d => /^\d{4}-\d{2}-\d{2}$/.test(String(d || ''));
  const FRESH = 14;                                             // days: how close to the day the list must have been checked
  const raw = () => L41.raw() || {};
  const items = kind => (raw()[kind] || []).filter(x => x && x.title);
  const key = (kind, x) => (kind === 'books' ? 'b:' : 'g:') + x.title;
  const off = () => O('upoff').v || {};
  const can = () => { try { return !!CAN_EDIT; } catch (e) { return false; } };
  L58.FRESH = FRESH;
  // out: the list says so, or its day has come and the date was checked close to it
  L58.out = function (x) { if (!x || !x.title) return false; if (x.status === 'released') return true; if (!full(x.date) || x.date > now()) return false; const at = String(raw().at || ''); return full(at) && Math.round((dOf(x.date) - dOf(at)) / 864e5) <= FRESH; };
  L58.isOff = (kind, x) => !!off()[key(kind, x)];
  L58.dropped = kind => items(kind).filter(x => L58.out(x) && !L58.isOff(kind, x));
  L58.soon = kind => items(kind).filter(x => !L58.out(x));
  L58.when = x => { const d = String((x || {}).date || ''); if (!d || /tba/i.test(d)) return 'No date yet'; try { return L19.when(d); } catch (e) { return d; } };
  // his library's copies of a book on the list
  L58.lib = x => { try { const n = nrm(x.title); return ALL_TITLES.filter(t => nrm(t) === n); } catch (e) { return []; } };
  L58.min = title => { const n = nrm(title); const x = items('books').find(y => nrm(y.title) === n); return x ? (+x.minutes || 0) : 0; };
  L58.find = (kind, title) => items(kind).find(x => x.title === title) || null;
  // its number in the series: the list's own, or the "#4" a placeholder title ends with
  const numOf = x => +x.num || +((/#\s*(\d+)\s*$/.exec(x.title) || [])[1]) || 0;
  const PH = /untitled|^book \d+$|final book|^tba$/i;         // a placeholder line in a series order
  L58.numOf = numOf;
  // is this "still to come" label the same book as x (same name, or a placeholder with x's number)?
  L58.same = function (label, n, x) { if (nrm(label) === nrm(x.title)) return true; const k = numOf(x); if (!k) return false; if (n != null && n !== '') return +n === k && PH.test(String(label)); const m = String(label).match(/\d+/g); return !!m && m.length === 1 && +m[0] === k && !/\bto\b/i.test(label); };
  // ---- books: the series order. A "~ still to come" line turns into a book to get; a book the order never had goes on the end ----
  function seriesOrder() { let n = 0; try { if (typeof SERIES_PLAN === 'undefined') return 0;
      L58.dropped('books').forEach(x => { const P = SERIES_PLAN[x.series]; if (!P) return; const nt = nrm(x.title);
        const ttl = e => e[0] === '+' || e[0] === '~' ? (e.slice(1).split('|')[1] || '') : e;
        if (P.some(e => e[0] !== '~' && nrm(ttl(e)) === nt)) return;
        let i = P.findIndex(e => e[0] === '~' && L58.same(ttl(e), e.slice(1).split('|')[0], x));
        const num = i >= 0 ? e0(P[i]) : (numOf(x) || '');             // no number: a collection or a side story, and it is shown as one
        const mine = L58.lib(x).find(t => (META[t] || {}).gr === false);
        const ent = mine || ('+' + num + '|' + x.title + '|' + String(x.date || '').slice(0, 4));
        if (i >= 0) P[i] = ent; else { const j = P.findIndex(e => e[0] === '~'); if (j >= 0) P.splice(j, 0, ent); else P.push(ent); }
        try { if (ent[0] === '+' && typeof SERIES_FOR_GAP !== 'undefined') SERIES_FOR_GAP[ent] = x.series; } catch (e) {} n++; }); } catch (e) { console.warn('l58 series', e); } return n; }
  const e0 = e => e.slice(1).split('|')[0];
  // what a series page needs: the books of this series that are out (to get) and the ones still to come
  L58.forSeries = s => ({ out: L58.dropped('books').filter(x => x.series === s), soon: L58.soon('books').filter(x => x.series === s) });
  // ---- books: the year plan. Books that came out in year y and are not kept out, oldest first; and the ones it is still waiting for ----
  L58.plan = y => L58.dropped('books').filter(x => full(x.date) && x.date.slice(0, 4) === String(y)).sort((a, b) => a.date < b.date ? -1 : a.date > b.date ? 1 : 0).map(x => ({ x, ts: L58.lib(x) }));
  L58.watch = y => L58.soon('books').filter(x => { const d = String(x.date || ''); return !/^\d{4}/.test(d) || d.slice(0, 4) === String(y); })
    .sort((a, b) => { const k = z => { const d = String(z.date || ''); return /^\d{4}/.test(d) ? d + '-99-99'.slice(d.length - 4) : '9999'; }; return k(a) < k(b) ? -1 : k(a) > k(b) ? 1 : 0; });
  // the page a dropped book opens when it is not in his library: its Upcoming page, which has the "I own it" buttons
  L58.sheet = x => { try { const i = L19.ordered('books').findIndex(y => y.title === x.title); return i >= 0 ? 'up:books:' + i : null; } catch (e) { return null; } };
  // ---- games and films: into the backlog and the watch list ----
  const mineP = x => (x.platforms || []).filter(p => L41.MINE.indexOf(p) >= 0);
  function screen() { let n = 0; try { L58.dropped('games').forEach(x => { const film = L41.isFilm(x), t = x.title;
        if (film) { if (typeof SHOWS === 'undefined' || SHOWS.some(s => nrm(s.t) === nrm(t))) return; L41.place({ kind: 'film', t, a: x.developer_or_publisher || '', d: x.date || '', n: x.note || '' }); const s = SHOWS.find(s => s.t === t); if (!s) return; s.up = 2; }
        else { if (typeof GAMES === 'undefined' || GAMES.some(g => nrm(g.t) === nrm(t))) return; const P = mineP(x); GAMES.push({ t, p: P.join(' / '), g: x.genre || 'Game', st: 'backlog', c: '#3a4a6b', up: 2, note: 'Out ' + L58.when(x) });
          if (typeof GMINFO !== 'undefined' && !GMINFO[t]) GMINFO[t] = [/^\d{4}/.test(String(x.date)) ? String(x.date).slice(0, 4) : '', x.developer_or_publisher || '', '', x.note || '']; }
        n++; try { if (x.cover && can()) { const ck = (film ? 'cv:show:' : 'cv:game:') + t; if (!O(ck).url) setOverride(ck, { url: x.cover, src: 'upcoming', at: Date.now() }); } } catch (e) {} }); } catch (e) { console.warn('l58 screen', e); } return n; }
  const mineGame = t => { try { return GAMES.find(g => g.t === t && g.up === 2) || null; } catch (e) { return null; } };
  const mineShow = t => { try { return SHOWS.find(s => s.t === t && s.up === 2) || null; } catch (e) { return null; } };
  // ---- run: once the fresh list and his saved rows are in, and again whenever the app comes back to the front ----
  let ready = false;
  L58.run = function () { if (!ready) return 0; let n = 0; n += seriesOrder(); n += screen(); if (n) { try { L41.fresh(); L41.redraw(); } catch (e) {} } return n; };
  L58.ready = () => ready;
  (function () { let tries = 0, got = false; const go = () => { if (ready) return; ready = true; L58.run(); };
    const tick = () => { const wait = typeof SYNC82 !== 'undefined' && SYNC82.state === 'wait'; if ((got && !wait) || tries++ > 60) return go(); setTimeout(tick, 500); };
    try { fetch('./upcoming.json?b=' + encodeURIComponent(window.DEN_BUILD || ''), { cache: 'no-store' }).then(r => r.ok ? r.json() : null).then(j => { if (j && typeof j === 'object' && Array.isArray(j.books) && JSON.stringify(j) !== JSON.stringify(L41.raw())) L19.data = j; }).catch(() => {}).then(() => { got = true; }); } catch (e) { got = true; }
    setTimeout(tick, 800); })();
  document.addEventListener('visibilitychange', () => { if (document.visibilityState === 'visible') setTimeout(() => { try { L58.run(); } catch (e) {} }, 2500); });
  // ---- keeping one out, and letting it back in ----
  L58.keepOut = function (k, quiet) { if (!can()) return false; const v = Object.assign({}, off()); v[k] = 1; try { setOverride('upoff', { v }); } catch (e) { return false; }
    if (!quiet) { try { toast(k[0] === 'b' ? 'Out of your plans' : 'Back in Upcoming'); } catch (e) {} setTimeout(() => { try { location.reload(); } catch (e) {} }, 900); } return true; };
  L58.letIn = function (k) { if (!can()) return false; const v = Object.assign({}, off()); if (!v[k]) return false; delete v[k]; try { setOverride('upoff', { v }); } catch (e) { return false; }
    try { L41.fresh(); } catch (e) {} const n = L58.run(); if (!n) { try { L41.redraw(); } catch (e) {} } try { toast(k[0] === 'b' ? 'In your plans' : 'Dropped in'); } catch (e) {} return true; };
  // "Put it back" on something he had said he owned: once it is out, it stays in Upcoming instead of dropping straight back in
  try { const _undo = L41.undo; L41.undo = function (k) { try { const kind = String(k)[0] === 'b' ? 'books' : 'games'; const x = items(kind).find(y => key(kind, y) === k); if (x && L58.out(x)) L58.keepOut(k, true); } catch (e) {} return _undo.apply(this, arguments); }; } catch (e) {}
  // a game that dropped in on two of his platforms: saying which one he has makes it his (the same record as "I own it")
  L58.own = function (title, how) { try { const i = GAMES.findIndex(g => g.t === title && g.up === 2); if (i < 0) return null; GAMES.splice(i, 1); const r = L41.own('games', title, how); if (!r) GAMES.push({ t: title, p: how || '', g: 'Game', st: 'backlog', c: '#3a4a6b', up: 2 }); return r; } catch (e) { return null; } };
  // where a book that is out has gone, for its Upcoming page
  L58.where = function (x) { const out = []; try { if (window.L56 && L56.slots) { const s = L56.slots().find(z => z.drop && z.drop.title === x.title); if (s) out.push('your 2027 plan (' + L56.MON[s.m] + ')'); } } catch (e) {}
    try { if (x.series && ((typeof SERIES_PLAN !== 'undefined' && SERIES_PLAN[x.series]) || (VIEWS.series || {})[x.series])) out.push('its series page (' + x.series + ')'); } catch (e) {} return out; };
  // ---- the pages ----
  (function () { if (typeof renderSheet !== 'function') return; const _rs = renderSheet; renderSheet = function () { const r = _rs.apply(this, arguments); try { const t = typeof sheetTitle === 'string' ? sheetTitle : ''; const body = sheet.querySelector('.sheet-body'); if (!body || body.querySelector('.l58') || !can()) return r;
        if (t.indexOf('up:') === 0) { const [, kind, i] = t.split(':'); const x = L19.ordered(kind)[+i]; if (!x || !L58.out(x)) return r; const k = key(kind, x), isOff = L58.isOff(kind, x), film = kind === 'games' && L41.isFilm(x); const box = body.querySelector('.up-sheet') || body;
          if (kind === 'books' && !isOff) { const w = L58.where(x); const when = body.querySelector('.up-when'); if (w.length && when) when.insertAdjacentHTML('afterend', '<p class="l58-in">It has dropped into ' + esc(w.join(' and ')) + '.</p>'); }
          box.insertAdjacentHTML('beforeend', '<div class="l41 l41-back l58"><button data-l58="' + (isOff ? 'in' : 'off') + '" data-key="' + esc(encodeURIComponent(k)) + '">' + (isOff ? (kind === 'books' ? 'Let it drop into my plans' : film ? 'Let it drop onto my watch list' : 'Let it drop into my backlog') : 'Keep it out of my plans') + '</button></div>'); return r; }
        if (t.indexOf('game:') === 0 && mineGame(t.slice(5))) { const x = L58.find('games', t.slice(5)); const P = x ? mineP(x) : [];
          body.insertAdjacentHTML('beforeend', (P.length > 1 ? '<div class="l41 l58" data-title="' + esc(encodeURIComponent(t.slice(5))) + '">' + P.map(p => '<button data-l58="own" data-how="' + esc(p) + '">I have it on ' + esc(p) + '</button>').join('') + '</div>' : '') +
            '<div class="l41 l41-back l58"><button data-l58="off" data-key="' + esc(encodeURIComponent('g:' + t.slice(5))) + '">Dropped in when it came out. Put it back in Upcoming</button></div>'); return r; }
        if (t.indexOf('show:') === 0 && mineShow(t.slice(5))) body.insertAdjacentHTML('beforeend', '<div class="l41 l41-back l58"><button data-l58="off" data-key="' + esc(encodeURIComponent('g:' + t.slice(5))) + '">Dropped in when it came out. Put it back in Upcoming</button></div>');
      } catch (e) { console.warn('l58 sheet', e); } return r; }; })();
  document.addEventListener('click', e => { const b = e.target.closest && e.target.closest('[data-l58]'); if (!b) return; e.preventDefault(); e.stopPropagation(); const a = b.dataset.l58;
    if (a === 'off') { L58.keepOut(decodeURIComponent(b.dataset.key)); return; }
    if (a === 'in') { if (L58.letIn(decodeURIComponent(b.dataset.key))) { try { closeSheet(); } catch (x) {} } return; }
    if (a === 'own') { const title = decodeURIComponent(b.closest('.l41').dataset.title); const r = L58.own(title, b.dataset.how); if (r) { try { closeSheet(); setTimeout(() => { try { openSheet('game:' + r.t); } catch (x) {} }, 250); } catch (x) {} } } }, true);
  try { const st = document.createElement('style'); st.id = 'l58css'; st.textContent = 'html body.den .sheet-body .l58-in{margin:-4px 0 12px;font:400 13px/1.4 Barlow,sans-serif;color:var(--d-mute,#8e8e95)}'; document.head.appendChild(st); } catch (e) {}
})();

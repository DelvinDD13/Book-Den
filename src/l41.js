// ===== L41: Upcoming → library. "I own it" on an upcoming book, game or film puts it in the library and takes it off the Upcoming row. There are no shop links.
(function () {
  if (!window.L19) return; const L41 = window.L41 = {};
  const esc = s => String(s == null ? '' : s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const O = k => { try { return getOverride(k) || {}; } catch (e) { return {}; } };
  const nrm = t => { try { return normT(t); } catch (e) { return String(t).toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim(); } };
  const recs = () => O('upown').v || {};                       // 'b:Title' or 'g:Title' → what was pulled in, kept so the library can rebuild it on every open
  const isFilm = x => (x.platforms || []).indexOf('Film') >= 0;
  const MINE = ['PS5', 'Switch 2', 'Switch'];                  // the platforms he plays on
  // the genre shelf a new book goes on: wherever the rest of its series, or its author, already sits
  function shelfFor(x) { try { const same = ALL_TITLES.find(t => ((typeof SERIES_OF !== 'undefined' && SERIES_OF[t]) || (META[t] || {}).series) === x.series && GENRE_OF[t]); if (same) return GENRE_OF[same]; const by = ALL_TITLES.find(t => (META[t] || {}).author === x.author && GENRE_OF[t]); if (by) return GENRE_OF[by]; } catch (e) {} return 'Fantasy — Epic Fantasy'; }
  function inLibrary(kind, x) { try { if (recs()[(kind === 'books' ? 'b:' : 'g:') + x.title]) return true; if (kind === 'books') { const n = nrm(x.title); return ALL_TITLES.some(t => nrm(t) === n && META[t] && META[t].gr === false); } if (isFilm(x)) return SHOWS.some(s => nrm(s.t) === nrm(x.title)); return GAMES.some(g => nrm(g.t) === nrm(x.title)); } catch (e) { return false; } }
  // put one record into the running library (no store writes here: this also runs on every open)
  function place(r) { try {
      if (r.kind === 'book') { if (window.L22 && L22.add) r.lib = L22.add({ t: r.t, a: r.a, s: r.s, g: r.g, aud: r.f === 'aud', how: 'Kindle or the shelf', syn: r.n, y: (r.d || '').slice(0, 4) }) || r.t; return; }
      if (r.kind === 'film') { if (!SHOWS.some(s => s.t === r.t)) SHOWS.push({ t: r.t, k: 'movie', st: 'queue', up: 1 }); if (typeof MEDIA_DB !== 'undefined' && !MEDIA_DB[r.t]) MEDIA_DB[r.t] = { g: 'Film', y: (r.d || '').slice(0, 4), f: 1 }; if (typeof MINFO !== 'undefined' && !MINFO[r.t]) MINFO[r.t] = [(r.d || '').slice(0, 4), r.a || '', '', r.n || '']; return; }
      if (!GAMES.some(g => g.t === r.t)) GAMES.push({ t: r.t, p: r.p || '', g: r.g || 'Game', st: 'backlog', c: '#3a4a6b', up: 1 });
    } catch (e) { console.warn('l41 place', e); } }
  // the Upcoming rows only list what is not in the library yet
  let RAW = L19.data, VIEW = null, VKEY = '';
  const view = () => { const k = JSON.stringify(Object.keys(recs())) + '|' + (typeof ALL_TITLES !== 'undefined' ? ALL_TITLES.length : 0) + '|' + (typeof GAMES !== 'undefined' ? GAMES.length : 0); if (VIEW && VKEY === k && VIEW.src === RAW) return VIEW.v; const v = Object.assign({}, RAW, { books: ((RAW || {}).books || []).filter(x => !inLibrary('books', x)), games: ((RAW || {}).games || []).filter(x => !inLibrary('games', x)) }); VIEW = { v, src: RAW }; VKEY = k; return v; };
  try { Object.defineProperty(L19, 'data', { configurable: true, get() { return RAW ? view() : RAW; }, set(v) { RAW = v; VIEW = null; } }); } catch (e) {}
  // everything pulled in earlier is rebuilt before the first screen is drawn
  const redraw = () => { try { VIEW = null; if (typeof memoClear === 'function') memoClear(); if (typeof currentLib !== 'undefined' && currentLib === 'books' && window.L15 && L15.placeBooks) { if (typeof rerender82 === 'function') rerender82(); else L15.placeBooks(); } else if (typeof currentLib !== 'undefined' && currentLib === 'screen') renderGamesLib(); } catch (e) {} };
  const restore = () => { let n = 0; try { const R = recs(); Object.keys(R).forEach(k => { const r = R[k]; const had = r.kind === 'game' ? GAMES.some(g => g.t === r.t) : r.kind === 'film' ? SHOWS.some(x => x.t === r.t) : ALL_TITLES.some(t => nrm(t) === nrm(r.t) && META[t] && META[t].gr === false); if (!had) { place(r); n++; } }); } catch (e) {} return n; };
  restore();
  // on a device that had nothing saved yet, the records arrive with the first sync
  (function () { let tries = 0; const tick = () => { if (typeof SYNC82 !== 'undefined' && SYNC82.state === 'wait' && tries++ < 60) return setTimeout(tick, 1000); if (restore()) redraw(); }; setTimeout(tick, 2500); })();
  L41.own = function (kind, title, how) { const x = (((RAW || {})[kind]) || []).find(y => y.title === title); if (!x) return null; const film = kind === 'games' && isFilm(x);
    const r = { t: x.title, kind: kind === 'books' ? 'book' : film ? 'film' : 'game', a: x.author || x.developer_or_publisher || '', s: x.series || '', g: kind === 'books' ? shelfFor(x) : (x.genre || ''), p: kind === 'games' && !film ? (how || (x.platforms || [])[0] || '') : '', f: kind === 'books' ? (how || 'aud') : '', d: x.date || '', n: x.note || '', at: Date.now() };
    place(r); const v = Object.assign({}, recs()); v[(kind === 'books' ? 'b:' : 'g:') + x.title] = r; try { setOverride('upown', { v }); } catch (e) {}
    // the art it had in Upcoming stays with it
    try { if (x.cover) { const ck = r.kind === 'book' ? 'cv:' + (r.lib || r.t) : r.kind === 'film' ? 'cv:show:' + r.t : 'cv:game:' + r.t; if (!O(ck).url) setOverride(ck, { url: x.cover, src: 'upcoming', at: Date.now() }); } } catch (e) {}
    redraw(); try { toast(r.kind === 'film' ? 'On your watch list' : 'In your library'); } catch (e) {} return r; };
  L41.undo = function (key) { const v = Object.assign({}, recs()); if (!v[key]) return; delete v[key]; try { setOverride('upown', { v }); } catch (e) {} try { toast('Back in Upcoming'); } catch (e) {} setTimeout(() => { try { location.reload(); } catch (e) {} }, 900); };
  L41.recFor = function (sheetKey) { const R = recs(); if (!sheetKey) return null; if (sheetKey.indexOf('game:') === 0) { const k = 'g:' + sheetKey.slice(5); return R[k] && R[k].kind === 'game' ? k : null; } if (sheetKey.indexOf('show:') === 0) { const k = 'g:' + sheetKey.slice(5); return R[k] && R[k].kind === 'film' ? k : null; } const k = Object.keys(R).find(k => R[k].kind === 'book' && (R[k].lib === sheetKey || R[k].t === sheetKey)); return k || null; };
  // the buttons on an Upcoming page, and a way back on the library page it becomes
  (function () { if (typeof renderSheet !== 'function') return; const _rs = renderSheet; renderSheet = function () { const r = _rs.apply(this, arguments); try { const t = typeof sheetTitle === 'string' ? sheetTitle : ''; const body = sheet.querySelector('.sheet-body'); if (!body || body.querySelector('.l41')) return r;
        if (t.indexOf('up:') === 0) { const [, kind, i] = t.split(':'); const x = L19.ordered(kind)[+i]; const when = body.querySelector('.up-when'); if (!x || !when) return r; const film = kind === 'games' && isFilm(x); let b = '';
          if (kind === 'books') b = '<button data-l41="own" data-kind="books" data-how="aud">I own it on Audible</button><button data-l41="own" data-kind="books" data-how="other">I own it on Kindle or paper</button>';
          else if (film) b = '<button data-l41="own" data-kind="games" data-how="">Add it to my watch list</button>';
          else { const P = (x.platforms || []).filter(p => MINE.indexOf(p) >= 0); b = (P.length ? P : ['']).map(p => '<button data-l41="own" data-kind="games" data-how="' + esc(p) + '">I own it' + (p ? ' on ' + esc(p) : '') + '</button>').join(''); }
          when.insertAdjacentHTML('afterend', '<div class="l41" data-title="' + esc(encodeURIComponent(x.title)) + '">' + b + '</div>'); return r; }
        const key = L41.recFor(t); if (key) body.insertAdjacentHTML('beforeend', '<div class="l41 l41-back"><button data-l41="undo" data-key="' + esc(encodeURIComponent(key)) + '">Came from Upcoming. Put it back</button></div>'); } catch (e) { console.warn('l41 sheet', e); } return r; }; })();
  document.addEventListener('click', e => { const b = e.target.closest && e.target.closest('[data-l41]'); if (!b) return; e.preventDefault(); e.stopPropagation(); if (b.dataset.l41 === 'undo') return L41.undo(decodeURIComponent(b.dataset.key));
    const box = b.closest('.l41'); const title = decodeURIComponent(box.dataset.title); const r = L41.own(b.dataset.kind, title, b.dataset.how); if (!r) return; try { closeSheet(); setTimeout(() => { try { openSheet(r.kind === 'book' ? (r.lib || r.t) : r.kind === 'film' ? 'show:' + r.t : 'game:' + r.t); } catch (x) {} }, 250); } catch (x) {} }, true);
  try { const st = document.createElement('style'); st.id = 'l41css'; st.textContent = 'html body.den .l41{display:flex;flex-wrap:wrap;gap:8px;margin:4px 0 12px}html body.den .l41 button{flex:1 1 140px;min-height:46px;padding:10px 12px;background:var(--d-acc,#ff6a2a)!important;border:2px solid #111!important;border-radius:0!important;box-shadow:3px 3px 0 #000!important;color:#111!important;font:400 17px/1.1 var(--b-disp,"Bebas Neue"),Impact,sans-serif;letter-spacing:.05em;text-align:center}html body.den .l41.l41-back{margin-top:18px}html body.den .l41.l41-back button{flex:0 1 auto;min-height:44px;background:none!important;border:1px solid var(--d-line,rgba(243,239,230,.3))!important;box-shadow:none!important;color:var(--d-mute,#8e8e95)!important;font:400 13px/1.2 Barlow,sans-serif;letter-spacing:0}'; document.head.appendChild(st); } catch (e) {}
})();

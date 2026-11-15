// ===== L59: the bookcase, a preview. His 2027 plan (L56) as a real bookcase: four seasons of shelves, every book a spine as thick as
//   its listening time at his speed, and the spine is a slice of that book's own cover (the same cover the rest of the app shows).
//   The book he is on stands face-out. A finished book carries a gold seal, and a series whose plan books are all finished gets a
//   brass seal standing on the shelf. A book that is not out yet is a wrapped parcel with its day on the tag, a book that is not in
//   his library is an outline, and the open spots are the empty shelf between two bookends. The Backlog Breaker medal waits at the
//   end of the last shelf. It is a preview: nothing in the app links to it and it changes nothing in his plan or library. It opens
//   from the address ending #bookcase, or by typing "bookcase" in the Books search box. "Pretend it is July 1" shows the first
//   half of the year as read, so the finished states can be seen before any of it has happened. Nothing on it moves.
(function () {
  if (!window.L56 || !L56.slots || typeof ALL_TITLES === 'undefined') return;
  const L59 = window.L59 = {};
  const esc = s => String(s == null ? '' : s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const nrm = s => String(s || '').toLowerCase().replace(/&/g, 'and').replace(/[^a-z0-9 ]/g, '').replace(/\s+/g, ' ').trim();
  const MON = L56.MON || ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  const SEAS = ['Winter', 'Spring', 'Summer', 'Fall']; const seasonOf = m => m < 3 ? 0 : m < 6 ? 1 : m < 9 ? 2 : 3;
  const speed = () => { try { return L56.speed() || 1; } catch (e) { return 1; } };
  const hm = m => { m = Math.max(0, Math.round(m)); return Math.floor(m / 60) + ' h ' + String(m % 60).padStart(2, '0') + ' m'; };
  const md = d => MON[+String(d).slice(5, 7) - 1].slice(0, 3) + ' ' + (+String(d).slice(8, 10));
  const full = d => /^\d{4}-\d{2}-\d{2}$/.test(String(d || ''));
  const PX = 3.6;   // points of shelf for one hour of listening at his speed
  const JULY = '2027-07-01';
  // an open spot is as wide as his median book
  const median = () => { try { const L = ALL_TITLES.map(t => { try { return L46.len(t) || 0; } catch (e) { return 0; } }).filter(Boolean).sort((a, b) => a - b); if (L.length) return L[Math.floor(L.length / 2)]; } catch (e) {} return 540 * speed(); };
  // the cover the app already has for a book: his own art first, then the checked store cover, then the small one in the page
  const art = t => { if (!t) return '';
    try { if (window.L10 && L10.ART && L10.ART[t] && ART[t]) return ART[t]; } catch (e) {}
    try { const c = getOverride('cv:' + t) || {}; if (c.url) return window.L11 && L11.sized ? L11.sized(c.url, false) : c.url; } catch (e) {}
    try { if (ART[t]) return ART[t]; if (COVERS[t] && COVERS[t].cover_data) return COVERS[t].cover_data; } catch (e) {} return ''; };
  const cloth = t => { let h = 0; t = String(t); for (let i = 0; i < t.length; i++) h = (h * 31 + t.charCodeAt(i)) >>> 0; return 'hsl(' + (h % 360) + ' 34% ' + (24 + h % 9) + '%)'; };
  const tall = t => { let h = 0; t = String(t); for (let i = 0; i < t.length; i++) h = (h * 17 + t.charCodeAt(i)) >>> 0; return 138 + (h % 4) * 4; };
  const short = t => String(t).replace(/\s*[\[(][^\])]*[\])]/g, '').split(':')[0].trim();
  const mono = s => { const w = String(s).replace(/^(the|a|an)\s+/i, '').split(/[^A-Za-z0-9]+/).filter(x => x && !/^(of|the|and|a|an|to|in)$/i.test(x)); return ((w[0] || '?')[0] + (w[1] ? w[1][0] : '')).toUpperCase(); };

  // ---- the plan as things on a shelf ----
  L59.data = function (pretend) { const S = L56.slots(); const sp = speed(); const up = window.L58 || null; const med = median();
    const doneAt = {}; try { L56.done().forEach(x => { doneAt[x.id] = x.d; }); } catch (e) {}
    // the series of each spot: his library's for a book he has, else the series page that lists it
    const ser = {}, byName = {}; S.forEach(x => { try { const s = x.t && SERIES_OF[x.t]; if (s && s !== 'Standalone / Other') ser[x.id] = s; } catch (e) {} });
    [...new Set(Object.values(ser))].forEach(s => { try { L57.data(s).R.forEach(r => { if (!r.up) byName[nrm(r.title)] = s; }); } catch (e) {} });
    S.forEach(x => { if (!ser[x.id] && !x.open) { const s = byName[nrm(x.name)]; if (s) ser[x.id] = s; } });
    const notOut = x => { if (x.t || x.open) return null; try { const u = up && up.find('books', x.name); if (!u || up.out(u)) return null; if (pretend && full(u.date) && u.date < JULY) return null; return u; } catch (e) { return null; } };
    const Z = SEAS.map((n, i) => ({ i, n, items: [], room: 0, min: 0, books: 0 })); const all = [];
    S.forEach(x => { const z = Z[seasonOf(x.m)]; const empty = x.open && !x.t && !x.drop;
      if (empty && !(pretend && x.m < 6)) { z.room++; return; }
      const read = pretend ? x.m < 6 : !!doneAt[x.id]; const u = notOut(x); const min = x.min || (empty ? med : 0);
      const it = { k: empty ? 'pick' : u ? 'parcel' : x.t ? 'book' : 'ghost', id: x.id, m: x.m, name: empty ? 'Your pick' : x.name, t: x.t || null, min, w: Math.max(9, Math.min(150, Math.round(min / 60 / sp * PX))), read, d: pretend ? null : doneAt[x.id] || null,
        open: !!x.open, date: u && full(u.date) ? u.date : '', note: x.note || '', ser: ser[x.id] || '' };
      if (it.t) { it.art = art(it.t); try { it.get = (META[it.t] || {}).gr === true; } catch (e) {} try { it.now = getStatus(it.t) === 'currently-reading'; it.pct = +(getOverride(it.t) || {}).progress || 0; } catch (e) {} }
      z.items.push(it); all.push(it); if (!empty) { z.min += min; z.books++; } });
    // books in his series with a day in 2027 that are not out yet: parcels waiting in the open part of their season
    const soon = []; try { const P = L56.P || []; (up ? up.watch(2027) : []).forEach(u => { if (P.some(e => nrm(e[1]) === nrm(u.title))) return; if (!full(u.date)) { soon.push(u.title); return; } if (pretend && u.date < JULY) return;
        const m = +u.date.slice(5, 7) - 1; const min = +u.minutes || med; Z[seasonOf(m)].items.push({ k: 'parcel', id: 'w:' + nrm(u.title), m, name: u.title, t: null, min, w: Math.max(9, Math.min(150, Math.round(min / 60 / sp * PX))), read: false, date: u.date, extra: true, note: u.series && u.title.indexOf(u.series) < 0 ? u.series : '', ser: '' }); }); } catch (e) {}
    // the book he is on: the first one in the plan he has not finished
    const cur = all.find(x => !x.read && x.k !== 'parcel' && x.k !== 'pick') || null; if (cur) cur.cur = true;
    // a series is closed once every plan book in it is read: its seal stands after the last of them
    const bySer = {}; all.forEach(x => { if (x.ser) (bySer[x.ser] = bySer[x.ser] || []).push(x); });
    Object.keys(bySer).forEach(s => { const L = bySer[s]; if (!L.every(x => x.read)) return; const last = L[L.length - 1]; const z = Z[seasonOf(last.m)]; const k = z.items.indexOf(last);
      const when = pretend ? MON[last.m] : (L.map(x => x.d).filter(Boolean).sort().pop() || ''); z.items.splice(k + 1, 0, { k: 'seal', id: 'c:' + nrm(s), m: last.m, name: s, n: L.length, w: 44, when: pretend ? when : (when ? md(when) : '') }); });
    const nDone = pretend ? all.filter(x => x.read).length : Object.keys(doneAt).length;
    return { Z, all, soon, cur, total: S.length, set: S.filter(x => !x.open).length, min: S.filter(x => !x.open).reduce((a, x) => a + x.min, 0), done: nDone, sp, med, pretend: !!pretend }; };

  // ---- drawing ----
  let host = null, mode = false, D = null, IT = [], picked = -1, back = false, lastY = 0;
  const on = () => !!(host && host.classList.contains('on'));
  function thing(x, i) { const lab = esc(x.name);
    if (x.k === 'seal') return { ow: x.w + 6, h: '<button class="l59-seal" data-l59i="' + i + '" style="width:' + x.w + 'px" aria-label="' + lab + ', closed"><b>' + esc(mono(x.name)) + '</b><i></i></button>' };
    if (x.k === 'parcel') return { ow: x.w + 1, h: '<button class="l59-pc' + (x.w < 30 ? ' nar' : '') + '" data-l59i="' + i + '" style="width:' + x.w + 'px;height:' + tall(x.name) + 'px" aria-label="' + lab + ', not out yet"><em>' + (x.date ? esc(md(x.date)) : 'soon') + '</em></button>' };
    if (x.k === 'ghost') return { ow: x.w + 1, h: '<button class="l59-gh' + (x.w < 15 ? ' thin' : '') + (x.read ? ' rd' : '') + '" data-l59i="' + i + '" style="width:' + x.w + 'px;height:' + tall(x.name) + 'px" aria-label="' + lab + ', not in your library"><span>' + esc(short(x.name)) + '</span>' + (x.read ? '<u></u>' : '') + '</button>' };
    if (x.k === 'pick') return { ow: x.w + 1, h: '<button class="l59-sp pick" data-l59i="' + i + '" style="width:' + x.w + 'px;height:' + tall(x.id) + 'px;--c:#4a4458" aria-label="An open spot you filled"><span>Your pick</span><u></u></button>' };
    const img = x.art ? '<img src="' + esc(x.art) + '" alt="" loading="lazy" decoding="async" onload="this.parentNode.classList.add(\'ok\')" onerror="this.remove()">' : '';
    if (x.cur) return { ow: 110, face: 1, h: '<button class="l59-face" data-l59i="' + i + '" style="--c:' + cloth(x.name) + '" aria-label="' + lab + ', the book you are on">' + img + '<span>' + esc(short(x.name)) + '</span></button>' };
    return { ow: x.w + 1, h: '<button class="l59-sp' + (x.w < 15 ? ' thin' : '') + (x.w >= 64 ? ' wide' : '') + (x.read ? ' rd' : '') + (x.get ? ' get' : '') + '" data-l59i="' + i + '" style="width:' + x.w + 'px;height:' + tall(x.name) + 'px;--c:' + cloth(x.name) + '" aria-label="' + lab + '">' + img + '<span>' + esc(short(x.name)) + '</span>' + (x.read ? '<u></u>' : '') + (x.get ? '<s>get</s>' : '') + '</button>' }; }
  function html() { const W = Math.max(280, Math.min(430, host.clientWidth || 390) - 42); IT = []; const sp = D.sp; let h = '';
    h += '<div class="l59-top"><button class="l59-x" data-l59="close">‹ Back</button><span>Preview</span></div><div class="l59-hd"><h1>2027</h1><b>The bookcase</b></div>';
    h += '<p class="l59-lead">Your plan as it stands in the app: ' + D.total + ' books, ' + D.set + ' set and ' + (D.total - D.set) + ' open, ' + Math.round(D.min / 60 / sp) + ' hours at ' + sp + 'x. Every spine is as thick as its listening time and cut from its own cover.</p>';
    h += '<div class="l59-tg"><button data-l59="now"' + (mode ? '' : ' class="on"') + '>Today</button><button data-l59="july"' + (mode ? ' class="on"' : '') + '>Pretend it is July 1</button></div>';
    D.Z.forEach(z => { const L = z.items.map(x => { IT.push(x); return Object.assign(thing(x, IT.length - 1), { x }); });
      if (z.room) { IT.push({ k: 'room', n: z.room, se: z.n }); const w = Math.min(W - 30, Math.round(z.room * D.med / 60 / sp * PX)); L.push({ ow: w + 28, x: null, h: '<button class="l59-gap" data-l59i="' + (IT.length - 1) + '" aria-label="Room for ' + z.room + ' more"><i></i><span style="width:' + w + 'px">room for<br>' + z.room + ' more</span><i></i></button>' }); }
      if (z.i === 3) { IT.push({ k: 'prize' }); let m = ''; try { m = L56.medal(60, D.total ? D.done / D.total : 0); } catch (e) {} L.push({ ow: 72, x: null, h: '<button class="l59-prize" data-l59i="' + (IT.length - 1) + '" aria-label="Backlog Breaker, ' + D.done + ' of ' + D.total + '">' + m + '<i></i></button>' }); }
      const rows = [[]]; let rw = 0; L.forEach(o => { if (rw + o.ow > W && rows[rows.length - 1].length) { rows.push([]); rw = 0; } rows[rows.length - 1].push(o); rw += o.ow; });
      h += '<div class="l59-sea"><b>' + z.n + '</b><span>' + Math.round(z.min / 60 / sp) + ' h, ' + z.books + (z.books === 1 ? ' book' : ' books') + (z.room ? ', room for ' + z.room + ' more' : '') + '</span></div><div class="l59-case">';
      let lastM = -1; rows.forEach(r => { let x = 0, lastX = -99, tags = ''; r.forEach(o => { if (o.x && o.x.k !== 'seal' && !o.x.extra && o.x.m !== lastM) { lastM = o.x.m; const tx = Math.max(x + 2, lastX + 30); if (tx < W - 20) { tags += '<i style="left:' + tx + 'px">' + MON[o.x.m].slice(0, 3) + '</i>'; lastX = tx; } }
          if (o.face) tags += '<i class="now" style="left:' + Math.max(x + 6, lastX + 30) + 'px">' + (o.x.now ? 'Reading now' : 'Next up') + '</i>', lastX = Math.max(x + 6, lastX + 30) + 34; x += o.ow; });
        h += '<div class="l59-sh">' + r.map(o => o.h).join('') + '</div><div class="l59-bd">' + tags + '</div>'; });
      h += '</div>'; });
    h += '<p class="l59-key">A gold seal is a book you finished in 2027. An outline is a book that is not in your library yet. A parcel is a book that is not out yet, and the tag is its day. The space between the bookends is yours.</p>';
    if (D.soon.length) h += '<p class="l59-key">On order with no day yet: ' + D.soon.map(esc).join(', ') + '.</p>';
    h += '<p class="l59-key">This is a preview. Tap anything on the shelf. Moving books by hand is not built, and nothing here changes your plan.</p><div class="l59-card" id="l59card" hidden></div>';
    return h; }
  function card(i) { const c = document.getElementById('l59card'); if (!c) return; const x = IT[i]; if (!x) { c.hidden = true; picked = -1; return; } picked = i; const sp = D.sp; let cv = '', t = '', a = '', b = '', go = '';
    const len = x.min ? hm(x.min / sp) + ' at ' + sp + 'x' : 'A short read';
    if (x.k === 'room') { let sug = []; try { sug = L56.suggest().slice(0, 3); } catch (e) {} t = 'Room for ' + x.n + ' more'; a = x.se + '’s open spots: a Goodreads ' + x.se + ' badge book, a new release, or one from your backlog.'; b = sug.length ? 'From your backlog: ' + sug.join(', ') + '.' : ''; }
    else if (x.k === 'prize') { t = 'Backlog Breaker'; a = D.done + ' of ' + D.total + ' books' + (D.pretend ? ', pretending it is July 1' : ' finished in 2027') + '.'; b = 'The medal for finishing the whole plan in 2027.'; try { cv = L56.medal(84, D.total ? D.done / D.total : 0); } catch (e) {} }
    else if (x.k === 'seal') { t = x.name; a = 'Closed' + (x.when ? ' in ' + x.when : '') + ': ' + (x.n === 1 ? 'the one book' : 'all ' + x.n + ' books') + ' the plan had left in it.'; cv = '<div class="l59-bigseal"><b>' + esc(mono(x.name)) + '</b></div>'; }
    else if (x.k === 'pick') { t = 'Your pick'; a = MON[x.m] + '. An open spot you filled with a book of your choosing.'; b = 'In the real year this is the book itself.'; }
    else { t = x.name; a = MON[x.m] + (x.extra ? '' : '. ' + len) + '.' + (x.ser ? ' ' + x.ser + '.' : x.note && x.extra ? ' ' + x.note + '.' : '');
      b = x.k === 'parcel' ? 'Not out yet. It ' + (x.extra ? 'takes an open spot' : 'is unwrapped') + ' on ' + (x.date ? md(x.date) : 'its release day') + '.' : x.read ? (x.d ? 'Finished ' + md(x.d) + '.' : 'Read, pretending it is July 1.') : x.k === 'ghost' ? 'Not in your library yet.' : x.cur ? (x.now ? 'You are reading it' + (x.pct ? ', ' + Math.round(x.pct) + '% in.' : '.') : 'Next up in the plan.') : x.get ? 'On your Goodreads shelf. You do not own the audiobook yet.' : 'On your shelf, not started.';
      cv = x.art ? '<img src="' + esc(x.art) + '" alt="">' : x.k === 'parcel' ? '<div class="l59-bigpc"></div>' : '<div class="l59-bigcl" style="--c:' + cloth(x.name) + '">' + esc(short(x.name)) + '</div>';
      if (x.t) go = '<button data-l59="book">Open its page</button>'; }
    c.innerHTML = (cv ? '<div class="l59-cv">' + cv + '</div>' : '') + '<div class="l59-ct"><b>' + esc(t) + '</b><p>' + esc(a) + '</p>' + (b ? '<p>' + esc(b) + '</p>' : '') + '<div class="l59-cb">' + go + '<button data-l59="put">Put it back</button></div></div>'; c.hidden = false; }
  L59.open = function () { try { if (!host) { host = document.createElement('div'); host.id = 'l59'; host.setAttribute('role', 'dialog'); host.setAttribute('aria-label', 'The bookcase, a preview'); document.body.appendChild(host); }
      host.classList.add('on'); document.documentElement.classList.add('l59-lock'); D = L59.data(mode); host.innerHTML = '<div class="l59-in">' + html() + '</div>'; host.scrollTop = lastY; lastY = 0; picked = -1; return true; } catch (e) { console.warn('l59', e); return false; } };
  L59.close = function () { if (host) host.classList.remove('on'); document.documentElement.classList.remove('l59-lock'); try { if (/^#bookcase\b/i.test(location.hash)) history.replaceState(null, '', location.pathname + location.search); } catch (e) {} };
  L59.isOpen = on; L59.things = () => IT.slice();
  // a book opened from the shelf comes back to the shelf when its page closes
  try { const _cs = closeSheet; closeSheet = function () { const r = _cs.apply(this, arguments); if (back) { back = false; setTimeout(() => L59.open(), 30); } return r; }; } catch (e) {}
  document.addEventListener('click', e => { const el = e.target.closest && e.target.closest('#l59 [data-l59],#l59 [data-l59i]'); if (!el) return; e.preventDefault(); e.stopPropagation();
    if (el.dataset.l59i != null) { const i = +el.dataset.l59i; card(i === picked ? -1 : i); return; }
    const a = el.dataset.l59; if (a === 'close') L59.close(); else if (a === 'put') card(-1); else if (a === 'now' || a === 'july') { mode = a === 'july'; lastY = host.scrollTop; L59.open(); }
    else if (a === 'book') { const x = IT[picked]; if (x && x.t) { back = true; lastY = host.scrollTop; if (host) host.classList.remove('on'); document.documentElement.classList.remove('l59-lock'); try { openSheet(x.t); } catch (err) { back = false; } } } }, true);
  window.addEventListener('keydown', e => { if (e.key === 'Escape' && on()) L59.close(); });
  // the two ways in: the address, and the word typed in the Books search box
  const want = () => /^#bookcase\b/i.test(location.hash);
  window.addEventListener('hashchange', () => { if (want()) L59.open(); else if (on()) L59.close(); });
  if (want()) { let n = 0; const iv = setInterval(() => { n++; const ready = !(typeof SYNC82 !== 'undefined' && SYNC82.state === 'wait'); if (ready || n > 40) { clearInterval(iv); if (want()) L59.open(); } }, 500); }
  try { const s = document.getElementById('search'); if (s) s.addEventListener('input', () => { if (s.value.trim().toLowerCase() !== 'bookcase') return; s.value = ''; try { s.dispatchEvent(new Event('input', { bubbles: true })); } catch (e) {} try { s.blur(); } catch (e) {} L59.open(); }); } catch (e) {}

  // ---- styles: wood, brass and paper; nothing animates ----
  const B = 'html body #l59';
  const css = B + '{position:fixed;inset:0;z-index:2100;display:none;overflow-y:auto;-webkit-overflow-scrolling:touch;overscroll-behavior:contain;background:var(--d-bg,#0c0a16);color:var(--d-ink,#f4eef7);font:400 15px/1.45 Barlow,system-ui,sans-serif}' + B + '.on{display:block}html.l59-lock,html.l59-lock body{overflow:hidden}' +
    B + ' *{box-sizing:border-box;animation:none!important;transition:none!important}' + B + ' button{-webkit-appearance:none;appearance:none;font:inherit;color:inherit;margin:0;padding:0;border:0;background:none;cursor:pointer;-webkit-tap-highlight-color:transparent}' +
    B + ' .l59-in{max-width:430px;margin:0 auto;padding:calc(env(safe-area-inset-top) + 8px) 12px calc(env(safe-area-inset-bottom) + 190px)}' +
    B + ' .l59-top{display:flex;justify-content:space-between;align-items:center}' + B + ' .l59-x{min-height:44px;padding:0 14px 0 2px;font-size:15px;color:var(--d-mute,#aa9fbb)}' + B + ' .l59-top span{padding:3px 9px;border:1px solid var(--d-line,rgba(220,190,255,.2));border-radius:99px;font-size:12px;color:var(--d-mute,#aa9fbb)}' +
    B + ' .l59-hd{display:flex;justify-content:space-between;align-items:flex-end}' + B + ' .l59-hd h1{margin:0;font:400 58px/.9 "Den Cormorant","Cormorant Garamond",Georgia,serif}' + B + ' .l59-hd b{padding-bottom:5px;font:600 19px/1.1 "Barlow Condensed",Barlow,sans-serif}' +
    B + ' .l59-lead{margin:12px 0 0;font-size:13.5px;line-height:1.42;color:var(--d-mute,#aa9fbb)}' +
    B + ' .l59-tg{display:grid;grid-template-columns:1fr 1.5fr;gap:6px;margin:14px 0 0}' + B + ' .l59-tg button{min-height:44px;border:1px solid var(--d-line,rgba(220,190,255,.2));font-size:14px}' + B + ' .l59-tg .on{background:var(--d-ink,#f4eef7);color:var(--d-bg,#0c0a16);border-color:var(--d-ink,#f4eef7);font-weight:600}' +
    B + ' .l59-sea{display:flex;justify-content:space-between;align-items:flex-end;gap:10px;margin:26px 0 0}' +
    B + ' .l59-sea b{position:relative;z-index:1;margin:0 0 -3px 14px;padding:5px 16px 6px;border-radius:3px;background:linear-gradient(180deg,#ecd596,#b8923f 70%,#8e6c26);color:#2a1c06;font:700 21px/1 "Den Cormorant","Cormorant Garamond",Georgia,serif;letter-spacing:.02em;box-shadow:0 1px 0 #fff3c4 inset,0 2px 4px rgba(0,0,0,.6)}' +
    B + ' .l59-sea span{padding-bottom:7px;font-size:12.5px;color:var(--d-mute,#aa9fbb)}' +
    B + ' .l59-case{padding:0 9px;border-top:9px solid #4a3324;border-radius:3px 3px 0 0;background:linear-gradient(90deg,#3a271b,#4f3626 4px,#33221a 9px,transparent 9px),linear-gradient(270deg,#3a271b,#4f3626 4px,#33221a 9px,transparent 9px),#17111c;box-shadow:0 1px 0 #6d5039 inset}' +
    B + ' .l59-sh{display:flex;align-items:flex-end;height:166px;padding:0;background:linear-gradient(180deg,rgba(0,0,0,.62),rgba(0,0,0,0) 40px),linear-gradient(90deg,rgba(0,0,0,.35),rgba(0,0,0,0) 14px,rgba(0,0,0,0) calc(100% - 14px),rgba(0,0,0,.35))}' +
    B + ' .l59-bd{position:relative;height:17px;background:repeating-linear-gradient(90deg,rgba(255,255,255,.035) 0 2px,rgba(0,0,0,0) 2px 9px,rgba(0,0,0,.05) 9px 11px,rgba(0,0,0,0) 11px 23px),linear-gradient(180deg,#8a6648 0,#6e4f37 2px,#523a29 60%,#2f2018);box-shadow:0 6px 9px rgba(0,0,0,.55)}' +
    B + ' .l59-bd i{position:absolute;top:2.5px;padding:1px 4px;border-radius:1.5px;background:#efe6d2;color:#2b2118;font:600 10px/1.05 "Barlow Condensed",Barlow,sans-serif;font-style:normal;white-space:nowrap}' + B + ' .l59-bd i.now{background:var(--d-acc,#e9a3b8);color:#1b1218}' +
    B + ' .l59-sp{position:relative;flex:none;margin-right:1px;overflow:hidden;border-radius:2px 2px 0 0;background:var(--c);color:#f7f0e3;display:flex;align-items:center;justify-content:center}' +
    B + ' .l59-sp img,' + B + ' .l59-face img{position:absolute;inset:0;width:100%;height:100%;object-fit:cover;object-position:50% 50%}' +
    B + ' .l59-sp::after{content:"";position:absolute;inset:0;pointer-events:none;box-shadow:inset 2px 0 2px rgba(255,255,255,.2),inset -3px 0 4px rgba(0,0,0,.55),inset 0 2px 1px rgba(255,255,255,.16)}' +
    B + ' .l59-sp:not(.ok):not(.thin)::before{content:"";position:absolute;left:0;right:0;top:9px;bottom:22px;border:solid rgba(236,213,150,.5);border-width:2px 0}' +
    B + ' .l59-sp span{position:relative;z-index:1;writing-mode:vertical-rl;max-height:calc(100% - 38px);overflow:hidden;padding:5px 1px;font:600 11.5px/1.06 "Barlow Condensed",Barlow,sans-serif;text-shadow:0 1px 2px #000,0 0 5px rgba(0,0,0,.9)}' +
    B + ' .l59-sp.ok span{background:linear-gradient(90deg,rgba(8,6,12,0),rgba(8,6,12,.6) 22%,rgba(8,6,12,.6) 78%,rgba(8,6,12,0))}' + B + ' .l59-sp.thin span,' + B + ' .l59-sp.ok.wide span{display:none}' +
    B + ' .l59-sp.wide:not(.ok) span{writing-mode:horizontal-tb;max-height:none;padding:0 6px;text-align:center;font:500 15px/1.05 "Cormorant Garamond",Georgia,serif}' +
    B + ' .l59-sp u,' + B + ' .l59-gh u{position:absolute;z-index:2;left:50%;bottom:5px;width:14px;height:14px;margin-left:-7px;border-radius:50%;background:radial-gradient(circle at 35% 30%,#fff3c4,#d9a441 55%,#8a6418);box-shadow:0 1px 2px rgba(0,0,0,.7);text-decoration:none}' + B + ' .l59-sp.thin u,' + B + ' .l59-gh.thin u{width:7px;height:7px;margin-left:-3.5px}' +
    B + ' .l59-sp s{position:absolute;z-index:2;top:0;left:50%;transform:translateX(-50%);padding:2px 3px 3px;background:#efe6d2;color:#2b2118;font:600 9.5px/1 "Barlow Condensed",Barlow,sans-serif;text-decoration:none;border-radius:0 0 2px 2px}' + B + ' .l59-sp.thin s{display:none}' +
    B + ' .l59-sp.pick span{font-style:italic;color:#d9d2e6}' +
    B + ' .l59-gh{position:relative;flex:none;margin-right:1px;border:1.5px dashed rgba(236,213,150,.55);border-bottom:0;border-radius:2px 2px 0 0;color:rgba(239,230,210,.82);display:flex;align-items:center;justify-content:center;overflow:hidden}' + B + ' .l59-gh span{writing-mode:vertical-rl;max-height:calc(100% - 30px);overflow:hidden;font:600 11.5px/1.06 "Barlow Condensed",Barlow,sans-serif}' + B + ' .l59-gh.thin span{display:none}' +
    B + ' .l59-pc{position:relative;flex:none;margin-right:1px;overflow:hidden;border-radius:2px 2px 0 0;background:repeating-linear-gradient(115deg,rgba(255,255,255,.05) 0 3px,rgba(0,0,0,.04) 3px 7px),linear-gradient(90deg,#9a7648,#c19a69 30%,#b08a58 70%,#86643b)}' +
    B + ' .l59-pc::before{content:"";position:absolute;top:0;bottom:0;left:50%;width:2px;margin-left:-1px;background:#5b3d20}' + B + ' .l59-pc::after{content:"";position:absolute;left:0;right:0;top:36%;height:2px;background:#5b3d20}' +
    B + ' .l59-pc em{position:absolute;z-index:1;left:50%;top:36%;transform:translate(-50%,6px);padding:2px 4px;background:#efe6d2;color:#2b2118;font:600 10px/1.1 "Barlow Condensed",Barlow,sans-serif;font-style:normal;white-space:nowrap;box-shadow:0 1px 2px rgba(0,0,0,.5)}' + B + ' .l59-pc.nar em{writing-mode:vertical-rl;padding:4px 2px}' +
    B + ' .l59-face{position:relative;flex:none;width:100px;height:150px;margin:0 5px;border-radius:2px;background:var(--c);box-shadow:0 0 0 1px rgba(0,0,0,.5),0 8px 12px rgba(0,0,0,.65);display:flex;align-items:center;justify-content:center}' +
    B + ' .l59-face span{padding:0 8px;text-align:center;font:500 16px/1.08 "Cormorant Garamond",Georgia,serif;color:#f7f0e3}' + B + ' .l59-face.ok span{display:none}' +
    B + ' .l59-face::before{content:"";position:absolute;z-index:2;top:-5px;right:14px;width:11px;height:36px;background:var(--d-acc,#e9a3b8);clip-path:polygon(0 0,100% 0,100% 100%,50% 76%,0 100%)}' +
    B + ' .l59-gap{flex:none;display:flex;align-items:flex-end;height:150px}' + B + ' .l59-gap i{flex:none;width:14px;height:64px;border-radius:7px 7px 0 0;background:linear-gradient(90deg,#7c8089,#dfe1e6 42%,#6a6e77)}' +
    B + ' .l59-gap span{align-self:stretch;display:flex;align-items:center;justify-content:center;text-align:center;font:italic 600 15.5px/1.15 "Cormorant Garamond",Georgia,serif;color:rgba(236,213,150,.68)}' +
    B + ' .l59-seal{flex:none;display:flex;flex-direction:column;align-items:center;justify-content:flex-end;margin:0 3px}' +
    B + ' .l59-seal b,' + B + ' .l59-bigseal b{display:grid;place-items:center;width:40px;height:40px;border-radius:50%;background:radial-gradient(circle at 35% 28%,#fff3c4,#d9b45c 45%,#8e6c26);box-shadow:inset 0 0 0 2px rgba(92,64,14,.55),inset 0 0 0 4px rgba(255,243,196,.5),0 2px 4px rgba(0,0,0,.6);color:#3a2706;font:700 17px/1 "Den Cormorant","Cormorant Garamond",Georgia,serif}' +
    B + ' .l59-seal i,' + B + ' .l59-prize i{width:22px;height:9px;margin-top:-1px;background:linear-gradient(180deg,#8e6c26,#4d3a14);clip-path:polygon(22% 0,78% 0,100% 100%,0 100%)}' +
    B + ' .l59-prize{flex:none;display:flex;flex-direction:column;align-items:center;justify-content:flex-end;width:66px;margin:0 3px}' + B + ' .l59-prize svg{display:block}' +
    B + ' .l59-key{margin:16px 0 0;font-size:13px;line-height:1.42;color:var(--d-mute,#aa9fbb)}' +
    B + ' .l59-card{position:fixed;z-index:5;left:0;right:0;bottom:0;display:flex;gap:14px;padding:14px 14px calc(env(safe-area-inset-bottom) + 14px);background:var(--d-bg2,#141127);border-top:1px solid var(--d-line,rgba(220,190,255,.2));box-shadow:0 -12px 30px rgba(0,0,0,.6)}' + B + ' .l59-card[hidden]{display:none}' +
    B + ' .l59-cv{flex:none;width:92px}' + B + ' .l59-cv img{display:block;width:92px;height:138px;object-fit:cover;border-radius:2px;box-shadow:0 4px 10px rgba(0,0,0,.6)}' + B + ' .l59-cv svg{display:block;margin:0 auto}' +
    B + ' .l59-bigcl{display:grid;place-items:center;width:92px;height:138px;padding:8px;border-radius:2px;background:var(--c);color:#f7f0e3;text-align:center;font:500 15px/1.1 "Cormorant Garamond",Georgia,serif}' +
    B + ' .l59-bigpc{position:relative;width:92px;height:138px;border-radius:2px;background:linear-gradient(90deg,#9a7648,#c19a69 30%,#b08a58 70%,#86643b)}' + B + ' .l59-bigpc::before{content:"";position:absolute;top:0;bottom:0;left:50%;width:3px;margin-left:-1.5px;background:#5b3d20}' + B + ' .l59-bigpc::after{content:"";position:absolute;left:0;right:0;top:40%;height:3px;background:#5b3d20}' +
    B + ' .l59-bigseal{display:grid;place-items:center;width:92px;height:92px}' + B + ' .l59-bigseal b{width:76px;height:76px;font-size:32px}' +
    B + ' .l59-ct{flex:1;min-width:0}' + B + ' .l59-ct b{display:block;font:600 19px/1.12 "Barlow Condensed",Barlow,sans-serif}' + B + ' .l59-ct p{margin:5px 0 0;font-size:13.5px;line-height:1.38;color:var(--d-mute,#aa9fbb)}' +
    B + ' .l59-cb{display:flex;gap:8px;margin-top:11px}' + B + ' .l59-cb button{min-height:44px;padding:0 14px;border:1px solid var(--d-line,rgba(220,190,255,.24));font-size:14px}' + B + ' .l59-cb button[data-l59="book"]{background:var(--d-ink,#f4eef7);color:var(--d-bg,#0c0a16);border-color:var(--d-ink,#f4eef7);font-weight:600}';
  try { const st = document.createElement('style'); st.id = 'l59css'; st.textContent = css; document.head.appendChild(st); } catch (e) {}
})();

// ===== L56: the 2027 plan. Seventy-five books for 2027, month by month: 58 set books (his must-reads: the Farseer trilogy, The
//   Wheel of Time, Crescent City and the two new ACOTAR books, the rest of Sanderson, John Gwynne, and the new books in series he is
//   reading) and 17 open spots, four or five a Goodreads season, for that season's badge books or his backlog (he finished The Hero of
//   Ages on Nov 8, so its February spot is an open one). It is an arc in the quest log with its own page, and finishing all 75 in 2027
//   earns Backlog Breaker, the one Mistborn-tier badge in Book Den (a tier above Atium). Set books tick themselves when he marks them
//   finished in 2027 (the ones not in his library yet are ticked by hand), any other book he finishes in 2027 fills the next open
//   spot, and a set book he finishes before Jan 1 becomes an open spot. A new book in one of his series that comes out in 2027
//   (upcoming.json, through L58) takes an open spot from its month on the day it is out, and the watch list at the foot of the
//   page is the same list's books that are not out yet.
(function () {
  if (!window.L48 || !window.L4 || !L4.defs) return;
  const L56 = window.L56 = {};
  const esc = s => String(s == null ? '' : s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const O = k => { try { return getOverride(k) || {}; } catch (e) { return {}; } };
  const pad = n => String(n).padStart(2, '0');
  const today = () => { const d = new Date(); return d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate()); };
  const dOf = s => new Date(String(s).slice(0, 10) + 'T12:00:00');
  const days = (a, b) => Math.round((dOf(b) - dOf(a)) / 864e5);
  const hm = m => { m = Math.max(0, Math.round(m)); return Math.floor(m / 60) + ' h ' + pad(m % 60) + ' m'; };
  const hh = m => Math.round(m / 60) + ' h';
  const Y0 = '2027-01-01', Y1 = '2027-12-31';
  const MON = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  const md = d => MON[+String(d).slice(5, 7) - 1].slice(0, 3) + ' ' + (+String(d).slice(8, 10));
  // [month, the book, his library title (null: no way to match it yet), minutes when not in his library, note]
  const P = [
    [0, 'Warbreaker', '^Warbreaker$', 0, ''], [0, 'House of Earth and Blood', '^House of Earth and Blood', 0, ''], [0, 'House of Sky and Breath', '^House of Sky and Breath', 0, ''], [0, 'House of Flame and Shadow', '^House of Flame and Shadow', 0, ''],
    [1, 'A Court of Splintered Harmony', '^A Court of Splintered Harmony', 0, 'After Crescent City, your order'], [1, 'A Court of Forgotten Melody', '^A Court of Forgotten Melody', 1200, 'ACOTAR 7 · out Jan 12 · length is a guess'], [1, 'Onyx Storm', '^Onyx Storm', 0, ''], [1, 'Threshing Day', '^Threshing Day', 0, ''], [1, 'Edgedancer', '^Edgedancer', 0, ''], [1, 'Elsecaller and King Lopen the First of Alethkar', '^Elsecaller', 0, 'Ebook · two short stories set during Words of Radiance'],
    [2, 'The Alloy of Law', '^The Alloy of Law', 0, ''], [2, 'Shadows of Self', '^Shadows of Self', 0, ''], [2, 'The Bands of Mourning', '^The Bands of Mourning', 0, ''], [2, 'Elantris', '^Elantris', 0, ''], [2, 'Arcanum Unbounded', '^Arcanum Unbounded', 0, 'Skip The Emperor\'s Soul and Edgedancer in it; you\'ll have read both'], [2, 'White Sand: Volume One', '^White Sand', 0, 'Dramatized adaptation · Volume Two is sold separately'],
    [3, 'Oathbringer', '^Oathbringer', 0, ''], [3, 'Dawnshard', '^Dawnshard', 0, ''], [3, 'Steelheart', '^Steelheart', 0, ''], [3, 'Firefight', '^Firefight', 0, ''], [3, 'Calamity', '^Calamity', 0, ''], [3, 'The Frugal Wizard\'s Handbook', '^The Frugal Wizard', 0, ''], [3, 'Starsight', '^Starsight', 0, ''],
    [4, 'Sunreach', '^Sunreach', 0, ''], [4, 'ReDawn', '^ReDawn', 0, ''], [4, 'Rhythm of War', '^Rhythm of War', 0, ''], [4, 'Evershore', '^Evershore', 0, ''], [4, 'Cytonic', '^Cytonic', 0, ''], [4, 'Defiant', '^Defiant', 0, ''],
    [5, 'Blightfall', '^Blightfall', 0, ''], [5, 'The Chalice of the Gods', 'The Chalice of the Gods', 0, 'Kindle'], [5, 'Wrath of the Triple Goddess', '^Wrath of the Triple Goddess', 0, 'Kindle'], [5, 'The Lost Metal', '^The Lost Metal', 0, ''], [5, 'Wind and Truth', '^Wind and Truth', 0, ''],
    [6, 'The Sunlit Man', '^The Sunlit Man', 0, ''], [6, 'Isles of the Emberdark', '^Isles of the Emberdark', 0, ''], [6, 'Assassin\'s Apprentice', 'Assassin\'s Apprentice', 0, ''], [6, 'Royal Assassin', '^Royal Assassin', 0, ''], [6, 'Assassin\'s Quest', '^Assassin\'s Quest', 0, ''],
    [7, 'The Eye of the World', '^The Eye of the World', 1797, ''], [7, 'The Great Hunt', '^The Great Hunt', 1594, ''], [7, 'The Dragon Reborn', '^The Dragon Reborn', 1488, ''], [7, 'The Shadow Rising', '^The Shadow Rising', 2473, ''],
    [8, 'The Fires of Heaven', '^The Fires of Heaven', 2187, ''], [8, 'Lord of Chaos', '^Lord of Chaos', 2492, ''], [8, 'A Crown of Swords', '^A Crown of Swords', 1824, ''],
    [9, 'The Path of Daggers', '^The Path of Daggers', 1405, ''], [9, 'Winter\'s Heart', '^Winter\'s Heart', 1452, ''], [9, 'Malice', '^Malice$', 0, ''], [9, 'Valor', '^Valor$', 0, ''], [9, 'Crossroads of Twilight', '^Crossroads of Twilight', 1564, ''],
    [10, 'New Spring', '^New Spring', 758, 'The prequel, where it came out'], [10, 'Knife of Dreams', '^Knife of Dreams', 1939, ''], [10, 'Ruin', '^Ruin$', 0, ''], [10, 'Wrath', '^Wrath$', 0, ''],
    [11, 'The Gathering Storm', '^The Gathering Storm', 1978, ''], [11, 'Towers of Midnight', '^Towers of Midnight', 2301, ''], [11, 'A Memory of Light', '^A Memory of Light', 2507, '']
  ];
  // Goodreads seasons (2026's dates; 2027's are assumed to match) and the open spots, four a season: [month, season]
  const SEASONS = [['Winter', '2027-01-01', '2027-03-31'], ['Spring', '2027-04-01', '2027-06-30'], ['Summer', '2027-07-01', '2027-09-14'], ['Fall', '2027-09-15', '2027-12-31']];
  const OPEN = [[0, 0], [1, 0], [1, 0], [1, 0], [2, 0], [3, 1], [4, 1], [4, 1], [5, 1], [6, 2], [7, 2], [7, 2], [8, 2], [9, 3], [10, 3], [10, 3], [11, 3]];
  const seasonOf = m => m < 3 ? 0 : m < 6 ? 1 : m < 9 ? 2 : 3;
  // his backlog, in the order empty open spots suggest it
  const BACKLOG = [['Golden Son', '^Golden Son'], ['Morning Star', '^Morning Star'], ['The Heroes', '^The Heroes'], ['Red Country', '^Red Country'], ['Iron Gold', '^Iron Gold'], ['A Little Hatred', '^A Little Hatred'], ['Dark Age', '^Dark Age'], ['The Trouble with Peace', '^The Trouble with Peace'], ['Light Bringer', '^Light Bringer'], ['The Wisdom of Crowds', '^The Wisdom of Crowds'], ['Vengeful', '^Vengeful'], ['Victorious', '^Victorious'], ['The Lies of Locke Lamora', '^The Lies of Locke Lamora'], ['The Devils', '^The Devils$'], ['The Heretics', '^The Heretics']];
  // new books in his series that are not out yet come from upcoming.json (L58): they drop into an open spot the day they are out
  const nrm = t => { try { return normT(t); } catch (e) { return String(t).toLowerCase(); } };
  const UP = () => window.L58 || null;
  L56.watch = function () { const up = UP(); if (!up) return []; let L = []; try { L = up.watch(2027); } catch (e) {} return L.filter(x => !P.some(e => nrm(e[1]) === nrm(x.title))).map(x => { const d = String(x.date || ''); const day = /^\d{4}-\d{2}-\d{2}$/.test(d);
    return { name: x.title, sub: (x.series && x.title.indexOf(x.series) < 0 ? x.series + ' · ' : '') + (day ? 'Out ' + md(d) + ' · drops into ' + MON[+d.slice(5, 7) - 1] : /^\d{4}/.test(d) ? 'Expected ' + up.when(x) + ' · no day yet' : 'No date yet') }; }); };
  L56.P = P; L56.OPEN = OPEN; L56.SEASONS = SEASONS; L56.BACKLOG = BACKLOG; L56.MON = MON;
  const st = t => { try { return getStatus(t) || ''; } catch (e) { return ''; } };
  const fin = t => String(O(t).finished || '');
  const ln = t => { try { return L46.len(t) || 0; } catch (e) { return 0; } };
  const BOOK = t => !/^(show|game|cv|hk|ab|gr|badges):/.test(t);
  const all = src => { if (!src) return []; try { const rx = new RegExp(src); return ALL_TITLES.filter(t => rx.test(t) && BOOK(t)); } catch (e) { return []; } };
  const pick = L => { if (!L.length) return null; try { const p = L46.pick(L[0]); if (L.indexOf(p) >= 0 && ln(p)) return p; } catch (e) {} return L.find(t => st(t) === 'currently-reading') || L.find(t => ln(t)) || L.find(t => st(t) === 'read') || L[0]; };
  const len = (L, m) => Math.max(0, ...L.map(ln)) || m || 0;
  const finIn = (L, a, b) => L.map(t => st(t) === 'read' ? fin(t).slice(0, 10) : '').filter(d => d && d >= a && d <= b).sort()[0] || null;
  const before = L => !!finIn(L, '0000', '2026-12-31');
  const fam = t => { try { const v = L46.versions(t); if (v && v.length) return v.slice().sort()[0]; } catch (e) {} return t; };
  L56.speed = () => 1.8; // he listens at 1.8x (Nov 2026)
  // books finished in 2027 that aren't set books, one per book (editions counted once), in the order he finished them
  L56.extras = function (setTs) { const seen = {}, out = []; ALL_TITLES.forEach(t => { if (!BOOK(t) || setTs.has(t) || st(t) !== 'read') return; const d = fin(t).slice(0, 10); if (!d || d < Y0 || d > Y1) return; const k = fam(t); if (seen[k]) return; seen[k] = 1; out.push({ t, d }); });
    return out.sort((a, b) => a.d < b.d ? -1 : a.d > b.d ? 1 : a.t < b.t ? -1 : 1); };
  // the 75 spots in reading order: each month's set books, then its open spots
  L56.slots = function () { const sets = [], opens = [], setTs = new Set();
    P.forEach((e, i) => { const ts = all(e[2]), t = pick(ts); ts.forEach(x => setTs.add(x));
      if (before(ts)) { opens.push({ m: e[0], se: seasonOf(e[0]), early: e[1] }); return; }
      const real = Math.max(0, ...ts.map(ln)) || (UP() ? UP().min(e[1]) : 0);   // its real length, once his library or the upcoming list has it
      sets.push({ id: 's:' + e[1].toLowerCase().replace(/[^a-z0-9]+/g, '-'), m: e[0], name: e[1], t, ts, min: real || e[3] || 0, note: real ? (e[4] || '').replace(/\s*·\s*length is a guess/, '') : (e[4] || '') }); });
    OPEN.forEach(o => opens.push({ m: o[0], se: o[1] }));
    opens.sort((a, b) => a.m - b.m); const ex = L56.extras(setTs);
    opens.forEach((o, k) => { o.id = 'o' + k; o.open = 1; const x = ex[k]; if (x) { o.t = x.t; o.ts = [x.t]; o.name = x.t.replace(/\s*[\[(][^\])]*[\])]/g, ''); o.d = x.d; o.min = ln(x.t); } else { o.t = null; o.ts = []; o.name = 'Open spot'; o.min = 0; } });
    // a new book that came out this year takes an empty open spot from its month on, until he finishes it (then it counts like any other)
    const over = []; try { const up = UP(); (up && up.plan ? up.plan(2027) : []).forEach(d => { if (d.ts.some(t => setTs.has(t)) || P.some(e => nrm(e[1]) === nrm(d.x.title))) return; if (d.ts.some(t => st(t) === 'read')) return;
        const m0 = +d.x.date.slice(5, 7) - 1; const o = opens.find(o => !o.t && !o.drop && o.m >= m0) || opens.slice().reverse().find(o => !o.t && !o.drop); if (!o) { over.push(d.x); return; }
        o.drop = d.x; o.name = d.x.title; o.ts = d.ts; o.lib = pick(d.ts); o.min = len(d.ts, +d.x.minutes || 0); }); } catch (e) { console.warn('l56 drops', e); }
    const out = []; for (let m = 0; m < 12; m++) { sets.forEach(x => { if (x.m === m) out.push(x); }); opens.forEach(x => { if (x.m === m) out.push(x); }); } out.over = over; return out; };
  // the page a dropped-in book opens: his copy when he has one, else its Upcoming page (which has the "I own it" buttons)
  const dropKey = x => x.lib || (UP() && UP().sheet ? UP().sheet(x.drop) : null) || undefined;
  const dropSub = (x, sp) => 'Out ' + md(x.drop.date) + ' · took an open spot' + (x.min ? ' · ' + hm(x.min / sp) : '') + (x.lib ? '' : ' · not in your library yet');
  const doneOn = (a, x) => { if (x.open) return x.d || null; if (x.t) return finIn(x.ts, Y0, Y1); const D = ((O('arcs').done || {})[a] || {})[x.id]; return D && D >= Y0 ? D : null; };
  L56.done = () => L56.slots().map(x => Object.assign({}, x, { d: doneOn('y2027', x) })).filter(x => x.d);
  // backlog books for the empty open spots: not ones he has read, not ones that are not out yet, not ones already dropped in
  L56.suggest = () => { const hold = new Set(); try { const up = UP(); if (up) { up.soon('books').forEach(x => hold.add(nrm(x.title))); up.plan(2027).forEach(d => hold.add(nrm(d.x.title))); } } catch (e) {}
    return BACKLOG.filter(b => !hold.has(nrm(b[0])) && !all(b[1]).some(t => st(t) === 'read')).map(b => b[0]); };
  // the arc in the quest log
  L48.more.push(function () { const S = L56.slots(); const sp = L56.speed(); const set = S.filter(x => !x.open); const tot = set.reduce((s, x) => s + x.min, 0) / sp;
    return { id: 'y2027', name: '2027: 75 books', from: Y0, to: Y1, key: today() < Y0 ? Y0 : Y1, sub: set.length + ' set, ' + (S.length - set.length) + ' open · ' + hh(tot) + ' at ' + sp + 'x',
      steps: S.map(x => x.open && x.drop && !x.t ? { id: x.id, t: x.name, s: dropSub(x, sp), book: dropKey(x), auto: () => false, next: x.name + ' · ' + MON[x.m] }
        : x.open ? { id: x.id, t: x.t ? x.name : 'Open spot', s: x.t ? (x.min ? hm(x.min / sp) + ' · ' : '') + 'open spot' : 'A Goodreads ' + SEASONS[x.se][0] + ' badge book or one from your backlog', book: x.t || undefined, auto: () => !!x.d, next: 'Open spot · ' + MON[x.m] }
        : { id: x.id, t: x.name, s: (x.min ? hm(x.min / sp) : 'Short read') + (x.note ? ' · ' + x.note : ''), book: x.t || undefined, auto: x.t || today() < Y0 ? () => !!doneOn('y2027', x) : undefined, next: x.name + ' · ' + MON[x.m] }),
      page: L56.page }; });
  // Backlog Breaker: one tier, Mistborn, for all 75 in 2027
  try { const C = 'currentColor', B = 'var(--bg)';
    L4_ICONS.y2027 = '<path fill="' + C + '" d="M28 33 L33 15 L42 26 L50 9 L58 26 L67 15 L72 33 Z"/><rect x="26" y="34" width="48" height="4" rx="1.5" fill="' + C + '"/>' +
      '<rect x="20" y="42" width="58" height="13" rx="2.5" fill="' + C + '"/><rect x="26" y="57" width="52" height="13" rx="2.5" fill="' + C + '"/><rect x="17" y="72" width="64" height="14" rx="2.5" fill="' + C + '"/>' +
      '<rect x="27" y="47" width="30" height="3" rx="1.5" fill="' + B + '"/><rect x="33" y="62" width="26" height="3" rx="1.5" fill="' + B + '"/><rect x="25" y="77.5" width="36" height="3" rx="1.5" fill="' + B + '"/>';
  } catch (e) {}
  const bk = x => ({ t: x.t || x.name, k: x.t ? 'book' : 'note', d: x.d, sub: x.t ? undefined : MON[x.m] });
  L4.defs.push({ cat: 'books', id: 'y2027', name: 'Backlog Breaker', sub: '2027', desc: 'All 75 books in your 2027 plan, finished in 2027', th: [75], tn: ['Mistborn'], icon: 'y2027', hue: ['#22325c', '#070b18'],
    items: () => L56.done().sort((a, b) => a.d < b.d ? -1 : a.d > b.d ? 1 : 0).map(bk), cand: () => L56.slots().filter(x => !x.open && !doneOn('y2027', x)).slice(0, 20).map(x => ({ t: x.t || x.name, k: x.t ? 'book' : 'note', sub: MON[x.m] })) });
  // The Full Set (every badge at least Bronze) does not wait on one year's plan
  try { const fs = L4.defs.find(d => d.id === 'fullset'); if (fs && typeof fs.meta === 'function' && !fs._y27) { const _m = fs.meta; fs.meta = function (R) { const a = [].slice.call(arguments); a[0] = (R || []).filter(b => b.id !== 'y2027'); return _m.apply(this, a); }; fs._y27 = 1; } } catch (e) {}
  // its own section, first on the Books badges sheet (ahead of Lore)
  (function () { if (!L4.sheetHTML) return; const _sh = L4.sheetHTML; L4.sheetHTML = function (cat, focus) { let h = _sh.apply(this, arguments); try { if (cat !== 'books' && cat !== 'all') return h; const b = L4.all().find(x => x.id === 'y2027'); if (!b) return h;
      const sec = '<div class="l4-sec l56-sec"><div class="l4-st">The 2027 plan <small>' + (b.tier > 0 ? 1 : 0) + '/1</small></div><div class="l4-grid">' + L4.card(b, focus === b.id) + '</div></div>';
      const k = h.indexOf('<div class="l4-sec">'); return k > 0 ? h.slice(0, k) + sec + h.slice(k) : h + sec; } catch (e) { return h; } }; })();
  // the Mistborn medal: white-gold double rim, night-blue face; it never moves
  L56.medal = function (size, prog) { const u = 'l56' + Math.random().toString(36).slice(2, 7); const r = 56, Cc = 2 * Math.PI * r;
    const ring = prog != null && prog < 1 ? '<circle cx="70" cy="70" r="56" fill="none" stroke="#ffffff18" stroke-width="5"/>' + (prog > 0 ? '<circle cx="70" cy="70" r="56" fill="none" stroke="#7be08f" stroke-width="5" stroke-linecap="round" stroke-dasharray="' + (Cc * prog).toFixed(1) + ' ' + Cc.toFixed(1) + '" transform="rotate(-90 70 70)"/>' : '') : '<circle cx="70" cy="70" r="57" fill="none" stroke="#f3e6b4" stroke-opacity=".55" stroke-width="1.2"/><circle cx="70" cy="70" r="61" fill="none" stroke="#f3e6b4" stroke-opacity=".25" stroke-width="1"/>';
    const star = (x, y, s) => '<path d="M' + x + ' ' + (y - s) + ' L' + (x + s * .28) + ' ' + (y - s * .28) + ' L' + (x + s) + ' ' + y + ' L' + (x + s * .28) + ' ' + (y + s * .28) + ' L' + x + ' ' + (y + s) + ' L' + (x - s * .28) + ' ' + (y + s * .28) + ' L' + (x - s) + ' ' + y + ' L' + (x - s * .28) + ' ' + (y - s * .28) + ' Z" fill="#fffbe8"/>';
    return '<svg class="l4-m" viewBox="0 0 140 140" width="' + (size || 96) + '" height="' + (size || 96) + '" aria-hidden="true"><defs><radialGradient id="g' + u + '" cx="50%" cy="36%" r="66%"><stop offset="0" stop-color="#2c4178"/><stop offset=".6" stop-color="#111a33"/><stop offset="1" stop-color="#060912"/></radialGradient><linearGradient id="r' + u + '" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#fffbe8"/><stop offset=".35" stop-color="#e8d79c"/><stop offset=".7" stop-color="#b59a52"/><stop offset="1" stop-color="#fff4cf"/></linearGradient></defs>' +
      ring + '<circle cx="70" cy="70" r="50" fill="url(#r' + u + ')"/><circle cx="70" cy="70" r="45.5" fill="none" stroke="#5c4a1c" stroke-width="1"/><circle cx="70" cy="70" r="43" fill="url(#g' + u + ')" stroke="#f3e6b4" stroke-width="1.5"/><circle cx="70" cy="70" r="38" fill="none" stroke="#f3e6b4" stroke-opacity=".3" stroke-dasharray="1.5 3.5"/>' +
      '<g transform="translate(37 37) scale(.66)" style="color:#f6e7b0;--bg:#0b1226">' + (L4_ICONS.y2027 || '') + '</g>' + star(70, 20.5, 4.2) + star(106, 92, 2.6) + star(34, 92, 2.6) + '<circle cx="70" cy="132" r="3.4" fill="#f3e6b4"/></svg>'; };
  try { if (window.L26) { const _m = L26.metal, _t = L26.top; L26.metal = b => b && b.id === 'y2027' && b.tier > 0 ? 'mistborn' : _m(b); L26.top = L => (L || []).some(b => b && b.id === 'y2027' && b.tier > 0) ? 'mistborn' : _t(L); }
    document.addEventListener('l25show', () => { try { const k = document.querySelector('#l25 .l26-kel[data-metal="mistborn"] small'); if (k) k.textContent = 'Mistborn'; } catch (e) {} });
    const st = document.createElement('style'); st.id = 'l56css'; st.textContent = 'html body.den #l25 .l26-kel[data-metal="mistborn"] small{color:#f3e6b4}html body.den #l4c-y2027.t1 .l4-t{background:rgba(243,230,180,.14);color:#fff4cf}' +
      'html body.den .l26-mistborn>.l26-fx{inset:-12px;border-radius:50%;background:radial-gradient(circle,rgba(255,244,207,.5),rgba(232,215,156,.18) 45%,rgba(0,0,0,0) 70%);opacity:0;animation:l56glow 2.6s ease-in-out both}' +
      '@keyframes l56glow{0%{opacity:0}45%{opacity:.9}100%{opacity:0}}@media (prefers-reduced-motion:reduce){html body.den .l26-mistborn>.l26-fx{animation:none;opacity:0}}';
    document.head.appendChild(st); } catch (e) {}
  const _medal = L4.medal; L4.medal = function (b, size) { if (b && b.id === 'y2027' && b.tier > 0) return L56.medal(size); return _medal.apply(this, arguments); };
  // the page
  L56.page = function (a) { const t = today(); const S = L56.slots(); const sp = L56.speed(); const set = S.filter(x => !x.open); const tot = set.reduce((s, x) => s + x.min, 0) / sp; const nOpen = S.length - set.length;
    const doneIds = {}; S.forEach(x => { if (doneOn('y2027', x)) doneIds[x.id] = 1; }); const n = Object.keys(doneIds).length;
    const doneSet = set.filter(x => doneIds[x.id]).reduce((s, x) => s + x.min, 0) / sp;
    let h = '<button class="back" data-a="arcback">‹ Quest log</button><p class="ah">2027: 75 books</p><p class="as">Jan 1 – Dec 31, 2027 · ' + (t < Y0 ? 'starts in ' + days(t, Y0) + ' days' : t <= Y1 ? days(t, Y1) + ' days left' : 'over') + '</p>';
    let pace;
    if (t < Y0) pace = '<b>' + n + ' of ' + S.length + '</b><p>The ' + set.length + ' set books are ' + hh(tot) + ' at ' + sp + 'x, about ' + hm(tot / 365).replace(/ 00 m$/, '') + ' a day. The ' + nOpen + ' open spots add whatever you put in them.</p>';
    else { const want = Math.floor(S.length * Math.min(1, (days(Y0, t) + 1) / 365)); const gap = n - want; pace = '<b>' + n + ' of ' + S.length + ' · ' + (gap === 0 ? 'on pace' : gap > 0 ? gap + ' ahead' : -gap + ' behind') + '</b><p>Set books: ' + hh(doneSet) + ' of ' + hh(tot) + ' at ' + sp + 'x.</p>'; }
    h += '<div class="pace">' + pace + '<u class="y27u"><s style="width:' + Math.round(n / S.length * 100) + '%"></s></u></div>';
    h += '<div class="y27b">' + L56.medal(88, n >= S.length ? null : n / S.length) + '<span><b>Backlog Breaker</b><small>Mistborn tier</small><p>Finish all 75 in 2027. Mistborn is a tier above Atium, and no other badge in Book Den has it.</p></span></div>';
    const per = SEASONS.map((z, k) => z[0] + ' ' + S.filter(x => x.open && x.se === k).length).join(', '); const nDrop = S.filter(x => x.drop && !x.t).length;
    h += '<div class="y27g"><b>Goodreads badges</b><p>Open spots for books off each season\'s badge lists: ' + per + '.' + (nDrop ? ' New releases have taken ' + nDrop + ' of them.' : '') + ' Page-Turner, Speed Reader and Book Boss (any 2, 3 and 5 books) come from the set books on their own. The 2026 seasons ran Jan 1–Mar 31, Apr 1–Jun 30, Jul 1–Sep 14 and Sep 15–Dec 31.</p></div>';
    const get = set.filter(x => !x.t); if (get.length) h += '<div class="y27g"><b>' + get.length + ' to get</b><p>' + get.map(x => esc(x.name)).join(', ') + '</p></div>';
    const sug = L56.suggest(); let si = 0;
    for (let m = 0; m < 12; m++) { const R = S.filter(x => x.m === m); if (!R.length) continue; const mm = R.reduce((s, x) => s + x.min, 0) / sp; const dn = R.filter(x => doneIds[x.id]).length; const emp = R.filter(x => x.open && !x.t && !x.drop).length;
      h += '<h3>' + MON[m] + '<small>' + R.length + ' books · ' + hh(mm) + (emp ? ' + ' + emp + ' open' : '') + (dn ? ' · ' + dn + ' done' : '') + '</small></h3>';
      R.forEach(x => { const num = '<span class="num">' + (S.indexOf(x) + 1) + '</span>';
        if (x.open && x.drop && !x.t) { const k = dropKey(x); const now = x.lib && x.ts.some(y => st(y) === 'currently-reading');
          h += '<button class="l37-q"' + (k ? ' data-a="arcstep"' : '') + ' data-k="y2027|' + esc(x.id) + '" aria-disabled="true">' + num + '<span class="l37-x"><b>' + esc(x.name) + '</b><i>' + esc(dropSub(x, sp)) + '</i></span><em>' + (now ? '<small class="now">Now</small>' : k ? '›' : '') + '</em></button>'; return; }
        if (x.open) { let sub; if (x.t) sub = (x.min ? hm(x.min / sp) + ' · ' : '') + 'Open spot · finished ' + md(x.d); else { const nx = sug[si++]; sub = 'Goodreads ' + SEASONS[x.se][0] + ' badge book' + (nx ? ', or from your backlog: ' + nx : '') + (x.early ? ' · ' + x.early + ' was read early' : ''); }
          h += '<button class="l37-q open' + (x.d ? ' done' : '') + '"' + (x.t ? ' data-a="arcstep"' : '') + ' data-k="y2027|' + esc(x.id) + '" aria-disabled="true">' + num + '<span class="l37-x"><b>' + esc(x.t ? x.name : 'Open spot') + '</b><i>' + esc(sub) + '</i></span><em>' + (x.d ? '✓' : '') + '</em></button>'; return; }
        const s = { done: !!doneIds[x.id], auto: !!x.t }; const now = x.t && x.ts.some(y => st(y) === 'currently-reading');
        h += '<button class="l37-q' + (s.done ? ' done' : '') + '"' + (x.t || t >= Y0 ? ' data-a="arcstep"' : '') + ' data-k="y2027|' + esc(x.id) + '"' + (s.auto ? ' aria-disabled="true"' : '') + '>' + num + '<span class="l37-x"><b>' + esc(x.name) + '</b><i>' + esc((x.min ? hm(x.min / sp) : 'Short read') + (x.note ? ' · ' + x.note : '') + (!x.t ? ' · not in your library yet' : '')) + '</i></span><em>' + (s.done ? '✓' : now ? '<small class="now">Now</small>' : x.t ? '›' : '○') + '</em></button>'; }); }
    const W = L56.watch().concat((S.over || []).map(x => ({ name: x.title, sub: 'Out ' + md(x.date) + ' · every open spot is taken, so it counts when you finish it' })));
    if (W.length) h += '<h3>New books to watch<small>added when out</small></h3>' + W.map(w => '<div class="l37-q info"><span class="num"></span><span class="l37-x"><b>' + esc(w.name) + '</b><i>' + esc(w.sub) + '</i></span><em></em></div>').join('');
    h += '<p class="fine">Set books tick themselves when you mark them finished in 2027; tap the ones not in your library yet when you finish them. Any other book you finish in 2027 fills the next open spot, in the order you finish them, so Goodreads badge books and backlog books all count. A new book in one of your series takes an open spot from its month on the day it comes out; the release dates are checked every Monday. A set book you finish before January 1 becomes an open spot.</p>';
    return h; };
  L48.CSS += '.y27u{display:block;height:6px;margin:10px 0 0;background:var(--d-line,rgba(243,239,230,.16));text-decoration:none}.y27u s{display:block;height:100%;background:var(--d-acc,#e9a3b8)}' +
    '.y27b{display:flex;gap:14px;align-items:center;padding:12px 14px;margin:12px 0;border:1px solid #e8d79c55;background:linear-gradient(135deg,#111a33,#0a0f1e)}.y27b svg{flex:0 0 88px}.y27b b{display:block;font:600 20px/1.1 "Barlow Condensed",Barlow,sans-serif;color:#fff4cf}.y27b small{display:block;margin:2px 0 4px;font:600 11px var(--b-mono,"IBM Plex Mono"),monospace;letter-spacing:.14em;text-transform:uppercase;color:#e8d79c}.y27b p{margin:0;font-size:13px;line-height:1.4;color:#c9c3b6}' +
    '.y27g{padding:10px 12px;margin:0 0 6px;border-left:3px solid var(--d-acc,#e9a3b8);background:var(--d-bg2,#15131f)}.y27g b{font:600 15px "Barlow Condensed",Barlow,sans-serif}.y27g p{margin:2px 0 0;font-size:12.5px;line-height:1.45;color:var(--d-mute,#9a8f82)}';
  L48.CSS += '.l37-q.open{border-style:dashed}.l37-q.open:not(.done) b{color:var(--d-mute,#9a8f82)}';
})();

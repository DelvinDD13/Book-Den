// ===== L20: the Cosmere ladder — Brandon Sanderson's own reading order as a climb. Read and owned come from the library;
// rank by rungs climbed; the achievements are badges (they count toward Constellation, Collector and the rest).
(function () {
  const L20 = window.L20 = {};
  const E = s => { try { return esc(String(s == null ? '' : s)); } catch (e) { return String(s == null ? '' : s); } };
  const enc = t => encodeURIComponent(t);
  // ---- the ladder: [name, library titles that count, world, ordering note] ----
  const RUNGS = [
    ['Mistborn: The Final Empire', ['Mistborn: The Final Empire'], 'Scadrial', ''],
    ['The Well of Ascension', ['The Well of Ascension'], 'Scadrial', ''],
    ['The Hero of Ages', ['The Hero of Ages'], 'Scadrial', ''],
    ['Warbreaker', ['Warbreaker'], 'Nalthis', 'Read before Words of Radiance'],
    ['Tress of the Emerald Sea', ['Tress of the Emerald Sea: A Cosmere Novel', 'Tress of the Emerald Sea'], 'Lumar', ''],
    ['The Way of Kings', ['The Way of Kings: Book One of the Stormlight Archive', 'The Way of Kings'], 'Roshar', ''],
    ['The Alloy of Law', ['The Alloy of Law'], 'Scadrial', ''],
    ['Shadows of Self', ['Shadows of Self'], 'Scadrial', ''],
    ['The Bands of Mourning', ['The Bands of Mourning'], 'Scadrial', ''],
    ['The Lost Metal', ['The Lost Metal'], 'Scadrial', ''],
    ['Elantris', ['Elantris: Tenth Anniversary Special Edition', 'Elantris'], 'Sel', ''],
    ['Yumi and the Nightmare Painter', ['Yumi and the Nightmare Painter: A Cosmere Novel', 'Yumi and the Nightmare Painter'], 'Komashi', ''],
    ['Words of Radiance', ['Words of Radiance: Book Two of the Stormlight Archive', 'Words of Radiance'], 'Roshar', ''],
    ['Edgedancer', ['Edgedancer: Stormlight Archive', 'Edgedancer'], 'Roshar', 'Before Oathbringer'],
    ['Oathbringer', ['Oathbringer: Book Three of the Stormlight Archive', 'Oathbringer'], 'Roshar', ''],
    ['Dawnshard', ['Dawnshard: Stormlight Archive', 'Dawnshard'], 'Roshar', 'Before Rhythm of War'],
    ['Rhythm of War', ['Rhythm of War'], 'Roshar', ''],
    ['The Sunlit Man', ['The Sunlit Man: A Cosmere Novel', 'The Sunlit Man'], 'Canticle', ''],
    ['Wind and Truth', ['Wind and Truth'], 'Roshar', '']
  ];
  const SIDE = [
    ["The Emperor's Soul", ["The Emperor's Soul"], 'Sel', ''],
    ['Arcanum Unbounded', ['Arcanum Unbounded: The Cosmere Collection', 'Arcanum Unbounded'], 'Threnody', 'Read each story after its home series'],
    ['Mistborn: Secret History', ['Secret History', 'Mistborn: Secret History'], 'Scadrial', 'Only after The Hero of Ages'],
    ['White Sand', ['White Sand: Volume One [Dramatized Adaptation]', 'White Sand'], 'Taldain', ''],
    ['The Fires of December', ['The Fires of December'], 'Unnamed world', ''],
    ['Isles of the Emberdark', ['Isles of the Emberdark: A Cosmere Novel Secret Projects, Book 5', 'Isles of the Emberdark'], 'First of the Sun', 'After Sixth of the Dusk']
  ];
  const RANKS = [[0, 'At the foot'], [1, 'Mistling'], [3, 'Survivor'], [4, 'Awakener'], [6, 'Bridgeman'], [10, 'Lawkeeper'], [11, 'Elantrian'], [13, 'Radiant'], [17, 'Herald'], [19, 'Shardbearer']];
  const ERA1 = [0, 1, 2], ERA2 = [6, 7, 8, 9], STORM = [5, 12, 13, 14, 15, 16, 18], HOID = [4, 11];
  // ---- the library ----
  const nt = t => { try { return normT(t); } catch (e) { return String(t).toLowerCase(); } };
  const lc = t => String(t).toLowerCase().trim();
  function index(c) { const m = { x: {}, n: {} }; c.B.forEach(b => { const k = lc(b.t); (m.x[k] = m.x[k] || []).push(b); const n = nt(b.t); (m.n[n] = m.n[n] || []).push(b); }); return m; }
  // the best copy of a title: exact titles first (so Secret History never lands on The Final Empire), then the loose
  // match for editions with longer names; among copies a read one wins, then one on the shelf (the dramatized twin loses)
  const pick = L => { let best = null; L.forEach(b => { if (!best || (b.read && !best.read) || (!best.read && !b.isGR && best.isGR)) best = b; }); return best; };
  function find(ix, titles) { let L = []; titles.forEach(t => { L = L.concat(ix.x[lc(t)] || []); }); if (!L.length) titles.forEach(t => { L = L.concat(ix.n[nt(t)] || []); }); return pick(L); }
  function entry(ix, [name, titles, world, note], i) { const b = find(ix, titles); return { i, name, world, note, t: b ? b.t : titles[0], b, read: !!(b && b.read), owned: !!(b && b.owned && !b.isGR), st: b ? b.st : null, fin: b ? b.fin : null }; }
  L20.state = function (c) { c = c || L4.ctx(); const ix = index(c);
    const rungs = RUNGS.map((r, i) => entry(ix, r, i)); const side = SIDE.map((r, i) => entry(ix, r, i));
    const climbed = rungs.filter(r => r.read).length; const next = rungs.find(r => !r.read) || null;
    let rank = RANKS[0], nextRank = null; RANKS.forEach(r => { if (climbed >= r[0]) rank = r; else if (!nextRank) nextRank = r; });
    const worlds = new Set(rungs.concat(side).filter(r => r.read).map(r => r.world));
    return { rungs, side, climbed, total: RUNGS.length, next, rank: rank[1], rankAt: rank[0], nextRank, worlds: [...worlds] }; };
  // ---- achievements as badges ----
  const bk = b => ({ t: b.t, k: 'book', d: b.fin, b });
  const readOf = (c, list, idx) => { const S = L20.state(c); const L = (list === 'side' ? S.side : S.rungs).filter((r, i) => !idx || idx.includes(i)); return L.filter(r => r.read && r.b).map(r => bk(r.b)); };
  const candOf = (c, list, idx) => { const S = L20.state(c); const L = (list === 'side' ? S.side : S.rungs).filter((r, i) => !idx || idx.includes(i)); return L.filter(r => !r.read).map(r => r.b ? bk(r.b) : { t: r.t, k: 'book', d: null }); };
  const HUE = ['#2a2f6b', '#0a0c26'];
  const A = (id, name, sub, desc, th, list, idx, extra) => Object.assign({ cat: 'books', id, name, sub, desc, th: [th], icon: id, hue: HUE, single: 'gold', fmt: v => String(v), items: c => readOf(c, list, idx), cand: c => candOf(c, list, idx) }, extra || {});
  const worldsItems = c => { const S = L20.state(c); const seen = {}; S.rungs.concat(S.side).filter(r => r.read && r.b).sort((a, b) => (a.fin || '9') < (b.fin || '9') ? -1 : 1).forEach(r => { if (!seen[r.world]) seen[r.world] = bk(r.b); }); return Object.values(seen); };
  const DEFS = [
    A('cl_ashwalker', 'Ash Walker', 'Cosmere ladder', 'Finish The Final Empire', 1, 'rungs', [0]),
    A('cl_survivor', 'Survivor', 'Cosmere ladder', 'Finish Mistborn Era 1', 3, 'rungs', ERA1),
    A('cl_awakened', 'Awakened', 'Cosmere ladder', 'Finish Warbreaker', 1, 'rungs', [3]),
    A('cl_bridgefour', 'Bridge Four', 'Cosmere ladder', 'Finish The Way of Kings', 1, 'rungs', [5]),
    A('cl_waxwayne', 'Wax & Wayne', 'Cosmere ladder', 'Finish Mistborn Era 2', 4, 'rungs', ERA2),
    A('cl_elantrian', 'Elantrian', 'Cosmere ladder', 'Finish Elantris', 1, 'rungs', [10]),
    A('cl_hoid', "Hoid's Audience", 'Cosmere ladder', 'Finish Tress, Yumi and The Fires of December', 3, 'rungs', HOID, { items: c => readOf(c, 'rungs', HOID).concat(readOf(c, 'side', [4])), cand: c => candOf(c, 'rungs', HOID).concat(candOf(c, 'side', [4])) }),
    A('cl_radiant', 'Radiant', 'Cosmere ladder', 'Finish all of Stormlight, novellas included', 7, 'rungs', STORM),
    A('cl_arcanist', 'Arcanist', 'Cosmere ladder', 'Finish Arcanum Unbounded', 1, 'side', [1]),
    A('cl_halfway', 'Halfway Up', 'Cosmere ladder', 'Climb 10 rungs', 10, 'rungs', null),
    A('cl_worldhopper', 'Worldhopper', 'Cosmere ladder', 'Finish books from 6 different worlds', 6, 'rungs', null, { items: worldsItems, cand: c => { const S = L20.state(c); const have = new Set(S.worlds); const seen = {}; S.rungs.concat(S.side).filter(r => !r.read && !have.has(r.world)).forEach(r => { if (!seen[r.world]) seen[r.world] = r.b ? bk(r.b) : { t: r.t, k: 'book', d: null }; }); return Object.values(seen); } }),
    A('cl_sidequester', 'Side Quester', 'Cosmere ladder', 'Finish every side quest', SIDE.length, 'side', null),
    A('cl_top', 'Top of the Ladder', 'Cosmere ladder', 'Climb all 19 rungs', RUNGS.length, 'rungs', null, { single: 'plat' })
  ];
  const IDS = DEFS.map(d => d.id);
  // emblems, in the badge set's own style: one mark in a 100×100 box, currentColor ink
  (function () { const I = typeof L4_ICONS !== 'undefined' ? L4_ICONS : window.L4_ICONS; if (!I) return; const C = 'currentColor';
    const ladder = (x1, x2, top, bot, n, w) => '<g fill="none" stroke="' + C + '" stroke-width="' + (w || 7) + '" stroke-linecap="round"><path d="M' + x1 + ' ' + top + 'V' + bot + 'M' + x2 + ' ' + top + 'V' + bot + '"/>' + Array.from({ length: n }, (_, i) => { const y = top + 10 + i * ((bot - top - 20) / (n - 1)); return '<path d="M' + x1 + ' ' + y + 'H' + x2 + '"/>'; }).join('') + '</g>';
    I.cl_ashwalker = '<path fill="' + C + '" d="M50 12c6 14 20 22 20 40a20 20 0 0 1-40 0c0-8 4-12 8-16 0 8 4 12 8 12-2-10 2-24 4-36z"/><path fill="var(--bg)" d="M50 44c3 6 8 9 8 15a8 8 0 0 1-16 0c0-6 5-9 8-15z"/><circle cx="24" cy="78" r="3" fill="' + C + '"/><circle cx="36" cy="86" r="2.5" fill="' + C + '"/><circle cx="68" cy="84" r="3" fill="' + C + '"/><circle cx="78" cy="74" r="2.5" fill="' + C + '"/>';
    I.cl_survivor = '<g fill="none" stroke="' + C + '" stroke-width="7" stroke-linecap="round"><path d="M20 80 L80 20"/><path d="M20 20 L80 80"/><path d="M30 50 H70"/></g><circle cx="50" cy="50" r="9" fill="var(--bg)" stroke="' + C + '" stroke-width="6"/>';
    I.cl_awakened = '<g fill="none" stroke="' + C + '" stroke-width="8" stroke-linecap="round"><path d="M22 70 Q35 30 50 50 T78 30"/><path d="M22 85 Q35 55 50 68 T78 50" opacity=".55"/><path d="M26 42 Q40 18 54 30" opacity=".35"/></g>';
    I.cl_bridgefour = '<path fill="none" stroke="' + C + '" stroke-width="8" stroke-linecap="round" d="M14 70 Q50 22 86 70"/><g fill="' + C + '"><rect x="20" y="66" width="8" height="18"/><rect x="36" y="56" width="8" height="28"/><rect x="56" y="56" width="8" height="28"/><rect x="72" y="66" width="8" height="18"/></g><path d="M12 84 H88" stroke="' + C + '" stroke-width="6" stroke-linecap="round"/>';
    I.cl_waxwayne = '<circle cx="36" cy="46" r="18" fill="none" stroke="' + C + '" stroke-width="7"/><circle cx="36" cy="46" r="6" fill="' + C + '"/><path fill="' + C + '" d="M60 24h18l8 10-6 8h-6v10h-8V42h-6z"/><path d="M34 74 l8 12 l-8 2z M62 74 l-8 12 l8 2z" fill="' + C + '"/>';
    I.cl_elantrian = '<circle cx="50" cy="50" r="34" fill="none" stroke="' + C + '" stroke-width="6"/><path d="M50 16 V84 M16 50 H84" stroke="' + C + '" stroke-width="5"/><circle cx="50" cy="50" r="10" fill="var(--bg)" stroke="' + C + '" stroke-width="5"/><path d="M28 28 L40 40 M72 28 L60 40 M28 72 L40 60 M72 72 L60 60" stroke="' + C + '" stroke-width="5" stroke-linecap="round"/>';
    I.cl_hoid = '<path fill="' + C + '" d="M22 70 Q50 10 78 70 Z"/><path fill="var(--bg)" d="M36 66 Q50 34 64 66 Z"/><circle cx="22" cy="70" r="6" fill="' + C + '"/><circle cx="78" cy="70" r="6" fill="' + C + '"/><circle cx="50" cy="22" r="6" fill="' + C + '"/><path d="M28 82 H72" stroke="' + C + '" stroke-width="7" stroke-linecap="round"/>';
    I.cl_radiant = I.u_stormlight || '';
    I.cl_arcanist = '<path fill="none" stroke="' + C + '" stroke-width="7" stroke-linejoin="round" d="M14 24 Q32 18 50 30 Q68 18 86 24 V76 Q68 70 50 82 Q32 70 14 76 Z"/><path d="M50 30 V82" stroke="' + C + '" stroke-width="5"/><path fill="' + C + '" d="M68 40 l3 7 7 1-5 5 1 7-6-3-6 3 1-7-5-5 7-1z"/>';
    I.cl_halfway = ladder(32, 68, 14, 86, 6) + '<rect x="24" y="50" width="52" height="40" fill="var(--bg)" opacity=".55"/>';
    I.cl_worldhopper = I.u_cosmere || '';
    I.cl_sidequester = '<path fill="none" stroke="' + C + '" stroke-width="8" stroke-linecap="round" d="M20 80 V40 Q20 24 36 24 H56"/><path fill="' + C + '" d="M54 12 L76 24 L54 36 Z"/><path fill="none" stroke="' + C + '" stroke-width="8" stroke-linecap="round" d="M20 80 H80" opacity=".5"/>';
    I.cl_top = ladder(34, 66, 30, 90, 5) + '<path fill="' + C + '" d="M30 12 L50 4 L70 12 L62 24 H38 Z"/>';
    // his blades on the medals that have a book behind them: the face shows the guard, clipped to the medal's circle
    const FOCUS = { oathbringer: .3, sunraiser: .22, firestorm: .3, mayalaran: .3, sylblade: .25, sylspear: .3, ivory: .26, wyndleblade: .28, wyndlefork: .26, pattern: .27, eshonai: .3, nightblood: .28 };
    const face = n => '<image href="art/blades/s_' + n + '.png" x="-30" y="' + Math.round(50 - (FOCUS[n] || .3) * 300) + '" width="160" height="300" preserveAspectRatio="xMidYMin meet" clip-path="url(#l20face)" style="image-rendering:pixelated"/>';
    const BLADE_OF = { cl_awakened: 'nightblood', cl_bridgefour: 'sylspear', cl_radiant: 'oathbringer', cl_arcanist: 'wyndleblade', cl_worldhopper: 'ivory', cl_halfway: 'sunraiser', cl_sidequester: 'pattern', cl_top: 'mayalaran' };
    Object.keys(BLADE_OF).forEach(id => { I[id] = face(BLADE_OF[id]); });
    try { document.body.insertAdjacentHTML('beforeend', '<svg width="0" height="0" style="position:absolute" aria-hidden="true"><defs><clipPath id="l20face"><circle cx="50" cy="50" r="65"/></clipPath></defs></svg>'); } catch (e) {}
  })();
  (function () { try { if (!window.L4 || !L4.defs) return; const have = new Set(L4.defs.map(d => d.id)); DEFS.forEach(d => { if (!have.has(d.id)) L4.defs.push(d); }); L4.clear(); } catch (e) { console.warn('l20 badges', e); } })();
  // the ladder's own section in the badge sheet
  (function () { if (!window.L4 || !L4.sheetHTML) return; const _sh = L4.sheetHTML; L4.sheetHTML = function (cat, focus) { let h = _sh.apply(this, arguments); try { if (cat !== 'books' && cat !== 'all') return h; const by = {}; L4.all().forEach(b => { by[b.id] = b; }); const L = IDS.map(i => by[i]).filter(Boolean); if (!L.length) return h;
      const sec = '<div class="l4-sec"><div class="l4-st">Cosmere ladder <small>' + L.filter(b => b.tier > 0).length + '/' + L.length + '</small></div><div class="l4-grid">' + L.map(b => L4.card(b, b.id === focus)).join('') + '</div></div>';
      const k = h.indexOf('<div class="l4-sec"><div class="l4-st">Everything'); if (k > 0) return h.slice(0, k) + sec + h.slice(k); const e = h.lastIndexOf('</div>'); return h.slice(0, e) + sec + h.slice(e); } catch (e) { return h; } }; })();
  // ---- drawing ----
  const fmtDate = s => { try { return new Date(String(s).slice(0, 10) + 'T12:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric' }); } catch (e) { return ''; } };
  const cover = (r, big) => { try { return coverInner(r.t, !!big); } catch (e) { return '<div class="ph"><div class="ph-title">' + E(r.name) + '</div></div>'; } };
  const stateOf = r => r.read ? 'Finished' + (r.fin ? ' ' + fmtDate(r.fin) : '') : r.st === 'currently-reading' ? 'Listening now' : r.owned ? 'On your shelf' : r.b ? 'Goodreads list' : 'Not in your library';
  // ---- the blade: one of his Shardblade panels, empowered from the tip up as rungs are climbed ----
  const BLADES = ['oathbringer', 'sunraiser', 'firestorm', 'mayalaran', 'sylblade', 'sylspear', 'ivory', 'wyndleblade', 'wyndlefork', 'pattern', 'eshonai', 'nightblood'];
  const BK = 'den:blade';
  L20.blade = () => { try { const v = localStorage.getItem(BK); if (v && BLADES.includes(v)) return v; } catch (e) {} return BLADES[0]; };
  L20.setBlade = n => { if (!BLADES.includes(n)) return; try { localStorage.setItem(BK, n); } catch (e) {} try { if (sheetTitle === 'cosmere') renderSheet(); } catch (e) {} try { if (window.L15 && L15.placeBooks) L15.placeBooks(); } catch (e) {} };
  const tierOf = S => RANKS.filter(r => S.climbed >= r[0]).length - 1; // 0..9
  // the panel: colour where the light has reached, dark glass above it, a bright line where the light stands
  L20.panel = function (S, cls) { const n = L20.blade(); const p = Math.min(1, S.climbed / S.total); const lit = (p * 100).toFixed(2); const tier = tierOf(S); const full = p >= 1; const src = 'art/blades/s_' + n + '.png';
    return '<div class="cl-blade' + (cls ? ' ' + cls : '') + (full ? ' full' : '') + '" data-tier="' + tier + '" style="--lit:' + lit + '%"><img src="' + src + '" alt="' + n + '" decoding="async"><img class="cl-dark" src="' + src + '" alt="" decoding="async">' + (p > 0 && !full ? '<i class="cl-line"></i>' : '') + '</div>'; };
  // the rank scale beside the big panel: every rank at its height
  L20.scale = function (S) { const tier = tierOf(S); const cur = RANKS[tier] || RANKS[0]; const nx = S.nextRank;
    return '<div class="cl-scale">' + RANKS.map(r => { const isCur = r === cur, isNext = nx && r === nx; const on = S.climbed >= r[0]; return '<span class="' + (isCur ? 'cur' : isNext ? 'next' : on ? 'on' : '') + '" style="bottom:' + (r[0] / S.total * 100).toFixed(2) + '%"><i></i><b>' + r[0] + '</b>' + E(r[1]) + (isNext ? ' ›' : '') + '</span>'; }).join('') + '</div>'; };
  L20.picker = function () { const cur = L20.blade(); return '<div class="cl-pick">' + BLADES.map(n => '<button class="' + (n === cur ? 'on' : '') + '" data-blade="' + n + '" aria-label="' + n + '"><img src="art/blades/s_' + n + '.png" alt="" decoding="async"><i>' + n + '</i></button>').join('') + '</div>'; };
  document.addEventListener('click', e => { const b = e.target.closest && e.target.closest('[data-blade]'); if (!b) return; e.preventDefault(); e.stopPropagation(); L20.setBlade(b.dataset.blade); }, true);
  // ---- Kelsier takes the dragon's place while the ladder is being climbed; the dragon comes back at the top ----
  L20.kelsier = function () { try { const dr = document.getElementById('dragon'); const img = dr && dr.querySelector('.dsprite'); if (!img) return; let on = true; try { const S = L20.state(); on = S.climbed < S.total; } catch (e) {}
    const sky = dr.parentElement;
    if (on && !img.dataset.l20) { img.dataset.dragon = img.getAttribute('src'); img.dataset.l20 = '1'; img.src = 'art/kelsier.png'; dr.classList.add('kelsier'); if (sky) sky.classList.add('kelsier'); try { renderExp(); } catch (e) {} }
    else if (!on && img.dataset.l20) { img.src = img.dataset.dragon; delete img.dataset.l20; dr.classList.remove('kelsier'); if (sky) sky.classList.remove('kelsier'); try { renderExp(); } catch (e) {} } } catch (e) {} };
  L20.kelsier();
  // Books tab card: the climb so far, the next rung marked
  L20.card = function () { try { const S = L20.state(); const nr = S.nextRank; const by = {}; L4.all().forEach(b => { by[b.id] = b; }); const ach = IDS.map(i => by[i]).filter(Boolean);
    const tiles = S.rungs.map(r => '<button class="d-cv cl-cv' + (r.read ? ' done' : S.next && r.i === S.next.i ? ' next' : '') + '" data-dopen="' + enc(r.t) + '" aria-label="' + E(r.name) + '"><span class="cl-img">' + cover(r) + '</span><i class="cl-n">' + (r.i + 1) + '</i>' + (S.next && r.i === S.next.i ? '<i class="cl-tag">NEXT</i>' : '') + '</button>').join('');
    return '<div class="d-sec cl-sec"><div class="d-k"><span>Cosmere ladder<i class="b-n">' + S.climbed + ' / ' + S.total + '</i></span><button class="d-more" data-l20="sheet">Open</button></div>' +
      '<div class="cl-top"><button class="cl-bl" data-l20="sheet" aria-label="Open the ladder">' + L20.panel(S, 'sm') + '</button><div class="cl-side">' +
        '<div class="cl-rank">' + (S.climbed < S.total ? '<img class="cl-kel" src="art/kelsier.png" alt="" decoding="async">' : '') + '<b>' + E(S.rank) + '</b><span>' + S.climbed + ' of ' + S.total + ' rungs</span>' + (nr ? '<span>' + E(nr[1]) + ' at ' + nr[0] + '</span>' : '<span>Top of the ladder</span>') + '</div>' +
        '<div class="cl-stats"><div><b>' + S.side.filter(r => r.read).length + '<small>/' + S.side.length + '</small></b><span>Quests</span></div><div><b>' + ach.filter(b => b.tier > 0).length + '<small>/' + ach.length + '</small></b><span>Badges</span></div><div><b>' + S.worlds.length + '<small>/6</small></b><span>Worlds</span></div></div>' +
        (S.next ? '<div class="cl-next"><span>Next rung</span><b>' + (S.next.i + 1) + ' · ' + E(S.next.name) + '</b><i>' + E(stateOf(S.next)) + (S.next.note ? ' · ' + E(S.next.note) : '') + '</i></div>' : '') + '</div></div>' +
      '<div class="d-row cl-row">' + tiles + '</div></div>'; } catch (e) { console.warn('l20 card', e); return ''; } };
  (function () { if (!window.L15 || !L15.booksTop) return; const _bt = L15.booksTop; L15.booksTop = function () { let h = _bt.apply(this, arguments); try { L20.kelsier(); const card = L20.card(); if (!card) return h; const i = h.indexOf('<div class="d-sec"><div class="d-k">Finished in'); h = i > 0 ? h.slice(0, i) + card + h.slice(i) : (h.endsWith('</div>') ? h.slice(0, -6) + card + '</div>' : h + card); } catch (e) {} return h; }; })();
  // the ladder sheet
  const rung = (r, S, n) => '<button class="cl-rung' + (r.read ? ' done' : '') + (S.next && n && r.i === S.next.i ? ' next' : '') + (!r.read && !r.owned ? ' away' : '') + '" data-dopen="' + enc(r.t) + '">' +
    (n ? '<i class="cl-no">' + (r.i + 1) + '</i>' : '<i class="cl-no cl-dot">•</i>') + '<span class="cl-cv2">' + cover(r) + '</span><span class="cl-body"><b>' + E(r.name) + '</b><i>' + E(stateOf(r)) + ' · ' + E(r.world) + '</i>' + (r.note ? '<em>' + E(r.note) + '</em>' : '') + '</span>' + (r.read ? '<i class="cl-ok">✓</i>' : S.next && n && r.i === S.next.i ? '<i class="cl-tag">NEXT</i>' : '') + '</button>';
  L20.sheetHTML = function () { const S = L20.state(); const nr = S.nextRank; const by = {}; L4.all().forEach(b => { by[b.id] = b; }); const ach = IDS.map(i => by[i]).filter(Boolean);
    return '<button class="sheet-close" aria-label="Close">✕</button><div class="l4-sheet cl-sheet"><div class="kicker">Cosmere ladder · Brandon Sanderson’s reading order</div><h2>' + E(S.rank) + ' <i class="b-n">' + S.climbed + ' / ' + S.total + '</i></h2>' +
      '<div class="hint">' + (nr ? E(nr[1]) + ' at ' + nr[0] + ' rungs. ' : 'Top of the ladder. ') + 'Rungs count whenever you finish them; the next rung is the lowest one you haven’t. Tap a book to open it.</div>' +
      '<div class="cl-hero">' + L20.panel(S, 'lg') + L20.scale(S) + '</div>' +
      '<div class="l4-sec"><div class="l4-st">Your blade</div>' + L20.picker() + '</div>' +
      '<div class="l4-sec"><div class="l4-st">The ladder <small>' + S.climbed + '/' + S.total + '</small></div><div class="cl-list">' + S.rungs.slice().reverse().map(r => rung(r, S, true)).join('') + '</div></div>' +
      '<div class="l4-sec"><div class="l4-st">Side quests <small>' + S.side.filter(r => r.read).length + '/' + S.side.length + '</small></div><div class="cl-list">' + S.side.map(r => rung(r, S, false)).join('') + '</div></div>' +
      '<div class="l4-sec"><div class="l4-st">Achievements <small>' + ach.filter(b => b.tier > 0).length + '/' + ach.length + '</small></div><div class="l4-grid">' + ach.map(b => L4.card(b, false)).join('') + '</div></div></div>'; };
  document.addEventListener('click', e => { const b = e.target.closest && e.target.closest('[data-l20]'); if (!b) return; e.preventDefault(); e.stopPropagation(); openSheet('cosmere'); }, true);
  (function () { const _rs = renderSheet; renderSheet = function () { if (sheetTitle === 'cosmere') { sheet.querySelector('.sheet-body').innerHTML = L20.sheetHTML(); return; } return _rs.apply(this, arguments); }; })();
  const css = document.createElement('style'); css.id = 'l20css'; css.textContent = [
    // Books card
    'html body.den .cl-sec .d-more{margin-left:auto}',
    'html body.den .cl-rank{display:flex;flex-direction:column;gap:3px;margin:0}html body.den .cl-rank b{font:400 30px/1 var(--b-disp,"Bebas Neue"),Impact,sans-serif;letter-spacing:.04em;text-transform:uppercase;color:var(--d-ink,#f3efe6)}html body.den .cl-rank span{font:400 11px var(--b-mono,"IBM Plex Mono"),monospace;letter-spacing:.06em;text-transform:uppercase;color:var(--d-mute,#8e8e95)}',
    'html body.den .cl-sec .d-k .b-n{margin-left:8px}',
    'html body.den .cl-row .cl-cv{width:64px;height:auto!important;background:none!important;border:0!important;box-shadow:none!important;overflow:visible;position:relative;text-align:left}',
    'html body.den .cl-cv .cl-img{display:block;width:64px;height:96px;position:relative;overflow:hidden;background:var(--d-bg3,#1b1b1f);border:2px solid #fff;box-shadow:4px 4px 0 #000}html body.den .cl-cv .cl-img img{display:block;width:100%;height:100%;object-fit:cover}html body.den .cl-cv .cl-img .ph,html body.den .cl-cv .cl-img .d-ph{width:100%;height:100%;display:flex;flex-direction:column;justify-content:flex-end;padding:6px;gap:2px}html body.den .cl-cv .cl-img .ph-title,html body.den .cl-cv .cl-img .d-ph b{font:400 10px/1.05 var(--b-disp,"Bebas Neue"),Impact,sans-serif;letter-spacing:.04em;text-transform:uppercase;color:var(--d-ink,#f3efe6)}html body.den .cl-cv .cl-img .ph-author,html body.den .cl-cv .cl-img .d-ph i{display:none}',
    'html body.den .cl-cv:not(.done):not(.next) .cl-img{border-color:rgba(255,255,255,.45);box-shadow:none}html body.den .cl-cv:not(.done):not(.next) .cl-img img,html body.den .cl-cv:not(.done):not(.next) .cl-img .ph,html body.den .cl-cv:not(.done):not(.next) .cl-img .d-ph{filter:grayscale(1) brightness(.5)}',
    'html body.den .cl-cv.next .cl-img{box-shadow:4px 4px 0 var(--d-acc,#ff6a2a)}',
    'html body.den .cl-cv .cl-n{position:absolute;left:-4px;top:-6px;line-height:1;font:400 11px/1 var(--b-disp,"Bebas Neue"),Impact,sans-serif;letter-spacing:.06em;background:#fff;color:#111;border:2px solid #111;padding:3px 5px;font-style:normal;z-index:1}html body.den .cl-cv.done .cl-n{background:var(--d-ink,#f3efe6)}',
    'html body.den .cl-tag{position:absolute;left:-4px;bottom:-6px;font:400 11px/1 var(--b-disp,"Bebas Neue"),Impact,sans-serif;letter-spacing:.1em;text-transform:uppercase;background:var(--d-acc,#ff6a2a);color:#111;border:2px solid #111;padding:4px 6px;transform:rotate(-3deg);font-style:normal;z-index:1}',
    'html body.den .cl-next{display:flex;flex-direction:column;gap:2px;margin-top:0;padding:10px 12px;border:1px solid var(--d-line,#333);background:var(--d-bg2,#17171b)}html body.den .cl-next span{font:400 10px var(--b-mono,"IBM Plex Mono"),monospace;letter-spacing:.1em;text-transform:uppercase;color:var(--d-acc,#ff6a2a)}html body.den .cl-next b{font:400 18px/1.1 var(--b-disp,"Bebas Neue"),Impact,sans-serif;letter-spacing:.04em;text-transform:uppercase;color:var(--d-ink,#f3efe6)}html body.den .cl-next i{font:400 11px var(--b-mono,"IBM Plex Mono"),monospace;color:var(--d-mute,#8e8e95);font-style:normal}',
    // sheet
    '.cl-sheet h2{display:flex;align-items:center;gap:10px}.cl-sheet h2 .b-n{font-size:13px}',
    // the blade panel: colour below the light line, dark glass above it
    '.cl-blade{position:relative;display:block;overflow:visible;background:#121215;border:2px solid #fff;box-shadow:4px 4px 0 #000;flex:0 0 auto}.cl-blade img{display:block;width:100%;height:100%;object-fit:contain;padding:8px 6px;image-rendering:pixelated;image-rendering:crisp-edges}.cl-blade .cl-dark{position:absolute;inset:0;filter:grayscale(1) brightness(.45);clip-path:inset(0 0 var(--lit) 0)}',
    '.cl-blade .cl-line{position:absolute;left:0;right:0;bottom:calc(var(--lit) - 14px);height:28px;background:linear-gradient(to top,rgba(255,106,42,0),rgba(255,176,137,.6) 50%,rgba(255,106,42,0));pointer-events:none;z-index:2}.cl-blade .cl-line:after{content:"";position:absolute;left:-2px;right:-2px;top:13px;height:2px;background:#fff}',
    '.cl-blade[data-tier="4"],.cl-blade[data-tier="5"],.cl-blade[data-tier="6"]{border-color:#ffb089}.cl-blade[data-tier="7"],.cl-blade[data-tier="8"]{border-color:#ff6a2a;box-shadow:4px 4px 0 #ff6a2a}.cl-blade.full{border-color:#fff;box-shadow:4px 4px 0 #ffb089}',
    '.cl-blade.sm{width:96px;height:272px}.cl-blade.lg{width:150px;height:425px}',
    // Books card: blade left, rank and next rung right
    'html body.den .cl-top{display:flex;gap:18px;align-items:stretch;margin:2px 4px 16px 2px}html body.den .cl-bl{padding:0;border:0!important;background:none!important;box-shadow:none!important;flex:0 0 auto;display:block}html body.den .cl-side{flex:1;min-width:0;display:flex;flex-direction:column;gap:12px;justify-content:space-between}',
    'html body.den .cl-stats{display:grid;grid-template-columns:repeat(3,1fr);gap:6px}html body.den .cl-stats div{border:1px solid var(--d-line,#333);padding:8px 6px 6px;display:flex;flex-direction:column;gap:3px;min-width:0}html body.den .cl-stats b{font:400 22px/1 var(--b-disp,"Bebas Neue"),Impact,sans-serif;color:var(--d-ink,#f3efe6)}html body.den .cl-stats b small{font-size:13px;color:var(--d-mute,#8e8e95)}html body.den .cl-stats span{font:400 8.5px var(--b-mono,"IBM Plex Mono"),monospace;letter-spacing:.06em;text-transform:uppercase;color:var(--d-mute,#8e8e95);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}',
    // sheet hero: big blade + the rank scale
    '.cl-hero{display:flex;gap:14px;align-items:stretch;margin:6px 0 18px;padding:14px 10px 14px 10px;background:var(--d-bg2,#17171b);border:1px solid var(--d-line,#333)}',
    '.cl-scale{position:relative;flex:1;min-width:0;margin:0 0 0 4px}.cl-scale span{position:absolute;left:0;right:0;transform:translateY(50%);display:flex;align-items:center;gap:8px;font:400 11px var(--b-mono,"IBM Plex Mono"),monospace;letter-spacing:.06em;text-transform:uppercase;color:#4a4a52;white-space:nowrap}.cl-scale span i{display:block;width:10px;height:2px;background:currentColor;flex:0 0 auto}.cl-scale span b{font:400 15px/1 var(--b-disp,"Bebas Neue"),Impact,sans-serif;color:inherit;min-width:18px}',
    '.cl-scale span.on{color:var(--d-mute,#8e8e95)}.cl-scale span.next{color:var(--d-acc,#ff6a2a)}.cl-scale span.cur{color:var(--d-ink,#f3efe6);font-weight:600;font-size:12px}.cl-scale span.cur i{width:18px;height:3px}',
    '.l4-m g[opacity] image{filter:grayscale(1)}',
    // Kelsier soars across the masthead where the dragon used to fly; the Blend theme hid that sky, so it comes back for him only
    'html body.den.blend header.hero .sky.kelsier{display:block!important;position:absolute!important;inset:0!important;height:calc(env(safe-area-inset-top) + 236px)!important;z-index:2!important;pointer-events:none;opacity:1;overflow:hidden}html body.den.blend header.hero .sky.kelsier .star{display:none!important}',
    'html body.den header.hero.hero .sky .dragon.pix.kelsier{width:56px!important;top:calc(env(safe-area-inset-top) + 56px)!important;filter:drop-shadow(2px 2px 0 rgba(0,0,0,.6))!important;animation:fly 22s linear infinite!important}html body.den header.hero.hero .sky .dragon.pix.kelsier .dsprite{animation:none!important}html body.den .exp-icon img{image-rendering:pixelated}',
    'html body.den .cl-rank{position:relative}html body.den .cl-rank .cl-kel{position:absolute;right:0;top:-6px;width:52px;height:auto;image-rendering:pixelated;image-rendering:crisp-edges}',
    // the blade picker
    '.cl-pick{display:flex;gap:8px;overflow-x:auto;scrollbar-width:none;margin:0 -16px;padding:4px 16px 8px}.cl-pick::-webkit-scrollbar{display:none}.cl-pick button{flex:0 0 auto;width:66px;padding:0;border:2px solid rgba(255,255,255,.35)!important;background:#000!important;box-shadow:none!important;border-radius:0!important;position:relative;overflow:visible}.cl-pick button img{display:block;width:100%;height:150px;object-fit:contain;padding:6px 4px;background:#121215;image-rendering:pixelated;image-rendering:crisp-edges}.cl-pick button i{display:block;font:400 8px var(--b-mono,"IBM Plex Mono"),monospace;letter-spacing:.02em;text-transform:uppercase;color:var(--d-mute,#8e8e95);padding:4px 2px;font-style:normal;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}',
    '.cl-pick button.on{border-color:#fff!important;box-shadow:4px 4px 0 var(--d-acc,#ff6a2a)!important}.cl-pick button.on i{color:#111;background:var(--d-acc,#ff6a2a)}',
    '.cl-list{display:flex;flex-direction:column;gap:6px}',
    '.cl-rung{display:flex;align-items:center;gap:10px;width:100%;text-align:left;padding:8px 10px;background:var(--d-bg2,#17171b);border:1px solid var(--d-line,#333);border-radius:0!important;color:inherit;font:inherit;position:relative}.cl-rung.done{border-color:rgba(243,239,230,.3)}.cl-rung.away{opacity:.6}',
    'html body.den.blend .cl-rung.next{border:2px solid #fff;box-shadow:4px 4px 0 var(--d-acc,#ff6a2a);opacity:1}',
    '.cl-no{flex:0 0 26px;font:400 22px/1 var(--b-disp,"Bebas Neue"),Impact,sans-serif;color:var(--d-mute,#8e8e95);font-style:normal;text-align:center}.cl-rung.done .cl-no,.cl-rung.next .cl-no{color:var(--d-ink,#f3efe6)}.cl-dot{font-size:18px}',
    '.cl-cv2{flex:0 0 38px;width:38px;height:57px;display:block;overflow:hidden;position:relative;background:var(--d-bg3,#202026);border:1px solid #fff}.cl-cv2 img,.cl-cv2 .ph,.cl-cv2 .d-ph{position:absolute;inset:0;width:100%!important;height:100%!important;object-fit:cover;margin:0}.cl-cv2 .ph,.cl-cv2 .d-ph{display:flex;flex-direction:column;justify-content:flex-end;padding:3px}.cl-cv2 .ph-title,.cl-cv2 .d-ph b,.cl-cv2 .ph-author,.cl-cv2 .d-ph i{display:none}.cl-rung:not(.done):not(.next) .cl-cv2 img,.cl-rung:not(.done):not(.next) .cl-cv2 .d-ph{filter:grayscale(1) brightness(.6)}',
    '.cl-body{flex:1;min-width:0;display:flex;flex-direction:column;gap:2px}.cl-body b{font:400 16px/1.1 var(--b-disp,"Bebas Neue"),Impact,sans-serif;letter-spacing:.04em;text-transform:uppercase;color:var(--d-ink,#f3efe6)}.cl-body i{font:400 10.5px var(--b-mono,"IBM Plex Mono"),monospace;letter-spacing:.04em;text-transform:uppercase;color:var(--d-mute,#8e8e95);font-style:normal}.cl-body em{font:400 11px var(--b-mono,"IBM Plex Mono"),monospace;color:var(--d-acc2,#ffb089);font-style:normal}',
    '.cl-rung .cl-ok{flex:0 0 auto;font:400 20px/1 var(--b-disp,"Bebas Neue"),Impact,sans-serif;color:var(--d-acc,#ff6a2a);font-style:normal}.cl-rung .cl-tag{position:static;transform:rotate(-3deg);flex:0 0 auto}',
    '.cl-ranks{display:flex;flex-wrap:wrap;gap:6px}.cl-ranks span{display:inline-flex;align-items:center;gap:6px;padding:4px 8px;border:1px solid var(--d-line,#333);font:400 11px var(--b-mono,"IBM Plex Mono"),monospace;letter-spacing:.06em;text-transform:uppercase;color:var(--d-mute,#8e8e95)}.cl-ranks span b{font:400 14px/1 var(--b-disp,"Bebas Neue"),Impact,sans-serif;color:inherit}.cl-ranks span.on{color:#111;background:var(--d-ink,#f3efe6);border-color:var(--d-ink,#f3efe6)}'
  ].join('\n').replace(/(^|\})\s*([^{}]+)\{/g, (m, a, sel) => a + sel.split(',').map(x => { x = x.trim(); return /^html body/.test(x) ? x : 'html body.den ' + x; }).join(',') + '{'); document.head.appendChild(css);
})();

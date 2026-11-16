// ===== L20: the ladders — the Cosmere in every order it can be read (Brandon's, publication, series, chronological) and the
// Maasverse the same way (series, publication, crossover, Throne of Glass chronological). Read and owned come from the library;
// the Cosmere rank is rungs climbed in Brandon's order whatever order is showing; the achievements are badges.
(function () {
  const L20 = window.L20 = {};
  const E = s => { try { return esc(String(s == null ? '' : s)); } catch (e) { return String(s == null ? '' : s); } };
  const enc = t => encodeURIComponent(t);
  // ---- every work, keyed: [name, library titles that count, world or series, note] ----
  const W = {
    tfe: ['Mistborn: The Final Empire', ['Mistborn: The Final Empire'], 'Scadrial', ''],
    woa: ['The Well of Ascension', ['The Well of Ascension'], 'Scadrial', ''],
    hoa: ['The Hero of Ages', ['The Hero of Ages'], 'Scadrial', ''],
    warbreaker: ['Warbreaker', ['Warbreaker'], 'Nalthis', 'Read before Words of Radiance'],
    tress: ['Tress of the Emerald Sea', ['Tress of the Emerald Sea: A Cosmere Novel', 'Tress of the Emerald Sea'], 'Lumar', ''],
    wok: ['The Way of Kings', ['The Way of Kings: Book One of the Stormlight Archive', 'The Way of Kings'], 'Roshar', ''],
    alloy: ['The Alloy of Law', ['The Alloy of Law'], 'Scadrial', ''],
    sos: ['Shadows of Self', ['Shadows of Self'], 'Scadrial', ''],
    bands: ['The Bands of Mourning', ['The Bands of Mourning'], 'Scadrial', ''],
    lost: ['The Lost Metal', ['The Lost Metal'], 'Scadrial', ''],
    elantris: ['Elantris', ['Elantris: Tenth Anniversary Special Edition', 'Elantris'], 'Sel', ''],
    yumi: ['Yumi and the Nightmare Painter', ['Yumi and the Nightmare Painter: A Cosmere Novel', 'Yumi and the Nightmare Painter'], 'Komashi', ''],
    wor: ['Words of Radiance', ['Words of Radiance: Book Two of the Stormlight Archive', 'Words of Radiance'], 'Roshar', ''],
    edgedancer: ['Edgedancer', ['Edgedancer: Stormlight Archive', 'Edgedancer'], 'Roshar', 'Before Oathbringer'],
    oathbringer: ['Oathbringer', ['Oathbringer: Book Three of the Stormlight Archive', 'Oathbringer'], 'Roshar', ''],
    dawnshard: ['Dawnshard', ['Dawnshard: Stormlight Archive', 'Dawnshard'], 'Roshar', 'Before Rhythm of War'],
    row: ['Rhythm of War', ['Rhythm of War'], 'Roshar', ''],
    sunlit: ['The Sunlit Man', ['The Sunlit Man: A Cosmere Novel', 'The Sunlit Man'], 'Canticle', ''],
    wat: ['Wind and Truth', ['Wind and Truth'], 'Roshar', ''],
    emperor: ["The Emperor's Soul", ["The Emperor's Soul"], 'Sel', ''],
    arcanum: ['Arcanum Unbounded', ['Arcanum Unbounded: The Cosmere Collection', 'Arcanum Unbounded'], 'Threnody', 'Read each story after its home series'],
    secret: ['Mistborn: Secret History', ['Secret History', 'Mistborn: Secret History'], 'Scadrial', 'After The Bands of Mourning: its last scene is that book\u2019s reveal'],
    whitesand: ['White Sand', ['White Sand: Volume One [Dramatized Adaptation]', 'White Sand'], 'Taldain', ''],
    fires: ['The Fires of December', ['The Fires of December'], 'Miral', 'Hoid\u2019s Travails 3, with Tress and Yumi'],
    isles: ['Isles of the Emberdark', ['Isles of the Emberdark: A Cosmere Novel Secret Projects, Book 5', 'Isles of the Emberdark'], 'First of the Sun', 'After Sixth of the Dusk'],
    // the Arcanum Unbounded stories and the Lost Tales, for the orders that list them one by one
    hope: ['The Hope of Elantris', ['The Hope of Elantris'], 'Sel', 'In Arcanum Unbounded; during Elantris'],
    eleventh: ['The Eleventh Metal', ['The Eleventh Metal'], 'Scadrial', 'In Arcanum Unbounded'],
    silence: ['Shadows for Silence in the Forests of Hell', ['Shadows for Silence in the Forests of Hell'], 'Threnody', 'In Arcanum Unbounded'],
    jak: ['Allomancer Jak and the Pits of Eltania', ['Allomancer Jak and the Pits of Eltania'], 'Scadrial', 'In Arcanum Unbounded'],
    sixth: ['Sixth of the Dusk', ['Sixth of the Dusk'], 'First of the Sun', 'In Arcanum Unbounded; also inside Isles of the Emberdark'],
    elsecaller: ['Elsecaller', ['Elsecaller'], 'Roshar', 'Lost Tales; during Words of Radiance'],
    lopen: ['King Lopen the First of Alethkar', ['King Lopen the First of Alethkar'], 'Roshar', 'Lost Tales; during Words of Radiance'],
    // the Maasverse
    tog: ['Throne of Glass', ['Throne of Glass: Throne of Glass, Book 1', 'Throne of Glass'], 'Throne of Glass', ''],
    com: ['Crown of Midnight', ['Crown of Midnight: Throne of Glass, Book 2', 'Crown of Midnight'], 'Throne of Glass', ''],
    ab: ["The Assassin's Blade", ["The Assassin's Blade"], 'Throne of Glass', 'The novellas; most read them after Crown of Midnight'],
    hof: ['Heir of Fire', ['Heir of Fire: Throne of Glass, Book 3', 'Heir of Fire'], 'Throne of Glass', ''],
    qos: ['Queen of Shadows', ['Queen of Shadows'], 'Throne of Glass', ''],
    eos: ['Empire of Storms', ['Empire of Storms'], 'Throne of Glass', ''],
    tod: ['Tower of Dawn', ['Tower of Dawn'], 'Throne of Glass', 'Runs alongside Empire of Storms'],
    koa: ['Kingdom of Ash', ['Kingdom of Ash'], 'Throne of Glass', ''],
    acotar: ['A Court of Thorns and Roses', ['A Court of Thorns and Roses (10th Anniversary Recording)', 'A Court of Thorns and Roses'], 'ACOTAR', ''],
    acomaf: ['A Court of Mist and Fury', ['A Court of Mist and Fury (10th Anniversary Recording)', 'A Court of Mist and Fury'], 'ACOTAR', ''],
    acowar: ['A Court of Wings and Ruin', ['A Court of Wings and Ruin (10th Anniversary Recording)', 'A Court of Wings and Ruin'], 'ACOTAR', ''],
    acofas: ['A Court of Frost and Starlight', ['A Court of Frost and Starlight'], 'ACOTAR', 'The novella; after Wings and Ruin'],
    acosf: ['A Court of Silver Flames', ['A Court of Silver Flames'], 'ACOTAR', ''],
    hoeb: ['House of Earth and Blood', ['House of Earth and Blood: Crescent City, Book 1', 'House of Earth and Blood'], 'Crescent City', ''],
    hosab: ['House of Sky and Breath', ['House of Sky and Breath: Crescent City, Book 2', 'House of Sky and Breath'], 'Crescent City', 'Its ending crosses into ACOTAR; read Silver Flames first'],
    hofas: ['House of Flame and Shadow', ['House of Flame and Shadow: Crescent City, Book 3', 'House of Flame and Shadow'], 'Crescent City', 'ACOTAR 1–5 first'],
    acosh: ['A Court of Splintered Harmony', ['A Court of Splintered Harmony'], 'ACOTAR', 'Starts four weeks after House of Flame and Shadow; out Oct 27, 2026'],
    acofm: ['A Court of Forgotten Melody', ['A Court of Forgotten Melody'], 'ACOTAR', 'Out Jan 12, 2027']
  };
  const LADDERS = {
    cosmere: { name: 'Cosmere ladder', core: ['tfe', 'woa', 'hoa', 'warbreaker', 'tress', 'wok', 'alloy', 'sos', 'bands', 'lost', 'elantris', 'yumi', 'fires', 'wor', 'edgedancer', 'oathbringer', 'dawnshard', 'row', 'sunlit', 'wat'], side: ['emperor', 'arcanum', 'secret', 'whitesand', 'isles'],
      ranks: [[0, 'At the foot'], [1, 'Mistling'], [3, 'Survivor'], [4, 'Awakener'], [6, 'Bridgeman'], [10, 'Lawkeeper'], [11, 'Elantrian'], [13, 'Radiant'], [17, 'Herald'], [20, 'Full Shardbearer']], unit: 'rungs',
      orders: {
        brandon: { name: "Brandon's", note: 'Sanderson’s own suggested order: the ladder, with the side quests read around it.', seq: null },
        pub: { name: 'Published', note: 'Every Cosmere work in the order it came out, the Arcanum Unbounded stories by their own dates.', seq: ['elantris', 'hope', 'tfe', 'woa', 'hoa', 'warbreaker', 'wok', 'alloy', 'eleventh', 'emperor', 'silence', 'wor', 'jak', 'sixth', 'sos', 'bands', 'edgedancer', 'secret', 'whitesand', 'oathbringer', 'dawnshard', 'row', 'lost', 'tress', 'yumi', 'sunlit', 'wat', 'elsecaller', 'lopen', 'isles', 'fires'] },
        series: { name: 'Series', note: 'Each series straight through, Arcanum Unbounded as one block, Warbreaker before Words of Radiance, The Sunlit Man before Wind and Truth.', seq: ['tfe', 'woa', 'hoa', 'elantris', 'whitesand', 'wok', 'warbreaker', 'wor', 'arcanum', 'oathbringer', 'dawnshard', 'row', 'sunlit', 'wat', 'elsecaller', 'lopen', 'alloy', 'sos', 'bands', 'lost', 'tress', 'yumi', 'isles', 'fires'] },
        chrono: { name: 'Timeline', note: 'In-world timeline. Sanderson has never published one, so this is the fan reckoning; not for a first read.', seq: ['whitesand', 'elantris', 'hope', 'emperor', 'eleventh', 'tfe', 'woa', 'hoa', 'secret', 'warbreaker', 'silence', 'wok', 'wor', 'elsecaller', 'lopen', 'edgedancer', 'oathbringer', 'dawnshard', 'row', 'wat', 'jak', 'alloy', 'sos', 'bands', 'lost', 'fires', 'tress', 'sunlit', 'yumi', 'isles'] }
      } },
    maas: { name: 'Maasverse ladder', core: ['acotar', 'acomaf', 'acowar', 'acofas', 'acosf', 'tog', 'com', 'ab', 'hof', 'qos', 'eos', 'tod', 'koa', 'hoeb', 'hosab', 'hofas', 'acosh', 'acofm'], side: [],
      ranks: [[0, 'Mortal'], [2, 'Courtier'], [5, 'Blade of the Court'], [8, 'Illyrian'], [11, 'High Fae'], [14, 'High Lord'], [18, 'Made']], unit: 'books',
      orders: {
        cross: { name: 'Crossover', note: 'Your push order: ACOTAR, straight into Crescent City, then Splintered Harmony. Throne of Glass is done, so it sits at the end.', seq: ['acotar', 'acomaf', 'acowar', 'acofas', 'acosf', 'hoeb', 'hosab', 'hofas', 'acosh', 'acofm', 'tog', 'com', 'ab', 'hof', 'qos', 'eos', 'tod', 'koa'] },
        series: { name: 'Series', note: 'ACOTAR through Silver Flames, then Throne of Glass, then Crescent City, then the new ACOTAR books. The usual recommendation.', seq: ['acotar', 'acomaf', 'acowar', 'acofas', 'acosf', 'tog', 'com', 'ab', 'hof', 'qos', 'eos', 'tod', 'koa', 'hoeb', 'hosab', 'hofas', 'acosh', 'acofm'] },
        pub: { name: 'Published', note: 'As the books came out, the three series weaving together.', seq: ['tog', 'com', 'ab', 'hof', 'acotar', 'qos', 'acomaf', 'eos', 'acowar', 'tod', 'acofas', 'koa', 'hoeb', 'acosf', 'hosab', 'hofas', 'acosh', 'acofm'] },
        chrono: { name: 'Timeline', note: 'Throne of Glass by its own timeline: the Assassin’s Blade novellas first, Empire of Storms and Tower of Dawn side by side. Then ACOTAR and Crescent City.', seq: ['ab', 'tog', 'com', 'hof', 'qos', 'eos', 'tod', 'koa', 'acotar', 'acomaf', 'acowar', 'acofas', 'acosf', 'hoeb', 'hosab', 'hofas', 'acosh', 'acofm'] }
      } }
  };
  // the chart order: the fan reading-order chart he sent on Nov 15 2026 (the Spanish-edition one, updated that day, 29 stops; the
  // 2024 English one has the same spine with the Sel books later). The Arcanum Unbounded stories are their own stops.
  const CHART = { name: 'Chart', note: 'The reading-order chart: follow the numbers.', seq: ['tfe', 'woa', 'hoa', 'eleventh', 'warbreaker', 'emperor', 'elantris', 'hope', 'tress', 'wok', 'wor', 'edgedancer', 'oathbringer', 'dawnshard', 'row', 'wat', 'alloy', 'sos', 'jak', 'bands', 'secret', 'lost', 'yumi', 'silence', 'whitesand', 'sixth', 'sunlit', 'isles', 'fires'] };
  const AUS = new Set(['hope', 'eleventh', 'silence', 'jak', 'sixth']);   // stories that exist only inside Arcanum Unbounded
  const UNRELEASED = { acofm: '2027-01-12' };
  let PREV = false, PREVO = 'chart';   // the chart preview (the address ending #chart): the Chart order and the chart look on the ladder page, nothing saved
  const OK = 'den:order:'; L20.order = id => { if (PREV && id === 'cosmere' && LADDERS.cosmere.orders[PREVO]) return PREVO; try { const v = localStorage.getItem(OK + id); if (v && LADDERS[id].orders[v]) return v; } catch (e) {} return Object.keys(LADDERS[id].orders)[0]; };
  try { if (!localStorage.getItem(OK + 'maas:push')) { localStorage.setItem(OK + 'maas', 'cross'); localStorage.setItem(OK + 'maas:push', '1'); } } catch (e) {}
  L20.setOrder = (id, o) => { if (!LADDERS[id] || !LADDERS[id].orders[o]) return; if (PREV && id === 'cosmere') { PREVO = o; try { renderSheet(); } catch (e) {} return; } try { localStorage.setItem(OK + id, o); } catch (e) {} try { if (String(sheetTitle).startsWith('ladder:') || sheetTitle === 'cosmere') renderSheet(); } catch (e) {} try { if (window.L15 && L15.placeBooks) L15.placeBooks(); } catch (e) {} };
  const ERA1 = ['tfe', 'woa', 'hoa'], ERA2 = ['alloy', 'sos', 'bands', 'lost'], STORM = ['wok', 'wor', 'edgedancer', 'oathbringer', 'dawnshard', 'row', 'wat'], HOID = ['tress', 'yumi', 'fires'];
  // ---- the library ----
  const nt = t => { try { return normT(t); } catch (e) { return String(t).toLowerCase(); } };
  const lc = t => String(t).toLowerCase().trim();
  function index(c) { const m = { x: {}, n: {} }; c.B.forEach(b => { const k = lc(b.t); (m.x[k] = m.x[k] || []).push(b); const n = nt(b.t); (m.n[n] = m.n[n] || []).push(b); }); return m; }
  // the best copy of a title: exact titles first (so Secret History never lands on The Final Empire), then the loose
  // match for editions with longer names; among copies a read one wins, then one on the shelf (the dramatized twin loses)
  const pick = L => { let best = null; L.forEach(b => { if (!best || (b.read && !best.read) || (!best.read && !b.isGR && best.isGR)) best = b; }); return best; };
  function find(ix, titles) { let L = []; titles.forEach(t => { L = L.concat(ix.x[lc(t)] || []); }); if (!L.length) titles.forEach(t => { L = L.concat(ix.n[nt(t)] || []); }); return pick(L); }
  function entry(ix, k) { const [name, titles, world, note] = W[k]; const b = find(ix, titles); return { k, name, world, note, t: b ? b.t : titles[0], b, read: !!(b && b.read), owned: !!(b && b.owned && !b.isGR), st: b ? b.st : null, fin: b ? b.fin : null, soon: UNRELEASED[k] || null }; }
  const CACHE = {};
  L20.state = function (id, c) { id = id || 'cosmere'; const L = LADDERS[id]; c = c || L4.ctx(); const key = id + ':' + L20.order(id) + ':' + (c.__l20 || (c.__l20 = Math.random())); if (CACHE[key]) return CACHE[key]; const ix = index(c);
    const by = {}; L.core.concat(L.side).forEach(k => { by[k] = entry(ix, k); });
    const rungs = L.core.map((k, i) => Object.assign(by[k], { i })); const side = L.side.map((k, i) => by[k]);
    const climbed = rungs.filter(r => r.read).length;
    let rank = L.ranks[0], nextRank = null; L.ranks.forEach(r => { if (climbed >= r[0]) rank = r; else if (!nextRank) nextRank = r; });
    const worlds = new Set(rungs.concat(side).filter(r => r.read).map(r => r.world));
    // the showing order: Brandon's is the ladder itself; the others are one sequence, with the extras the library may not hold
    const o = L20.order(id); const O = L.orders[o]; let seq; if (O.seq) seq = O.seq.map((k, i) => Object.assign({}, by[k] || entry(ix, k), { pos: i })); else seq = rungs.map((r, i) => Object.assign({}, r, { pos: i }));
    if (o === 'chart' && by.arcanum) { const au = by.arcanum; seq = seq.map(r => AUS.has(r.k) ? Object.assign({}, r, { t: au.t, b: au.b, read: au.read, owned: au.owned, st: au.st, fin: au.fin, au: true }) : r); }
    const next = seq.find(r => !r.read && !r.soon) || null;
    const S = { id, name: L.name, unit: L.unit, rungs, side, climbed, total: rungs.length, next, rank: rank[1], rankAt: rank[0], nextRank, ranks: L.ranks, worlds: [...worlds], order: o, orders: L.orders, seq, brandon: !O.seq };
    CACHE[key] = S; if (Object.keys(CACHE).length > 8) Object.keys(CACHE).slice(0, 4).forEach(k => delete CACHE[k]); return S; };
  // ---- achievements as badges (Cosmere) ----
  const bk = b => ({ t: b.t, k: 'book', d: b.fin, b });
  const readOf = (c, keys) => { const S = L20.state('cosmere', c); const L = S.rungs.concat(S.side).filter(r => !keys || keys.includes(r.k)); return L.filter(r => r.read && r.b).map(r => bk(r.b)); };
  const candOf = (c, keys) => { const S = L20.state('cosmere', c); const L = S.rungs.concat(S.side).filter(r => !keys || keys.includes(r.k)); return L.filter(r => !r.read).map(r => r.b ? bk(r.b) : { t: r.t, k: 'book', d: null }); };
  const CORE = LADDERS.cosmere.core, SIDEK = LADDERS.cosmere.side;
  const HUE = ['#2a2f6b', '#0a0c26'];
  const A = (id, name, sub, desc, th, keys, extra) => Object.assign({ cat: 'books', id, name, sub, desc, th: [th], icon: id, hue: HUE, single: 'gold', fmt: v => String(v), items: c => readOf(c, keys), cand: c => candOf(c, keys) }, extra || {});
  const worldsItems = c => { const S = L20.state('cosmere', c); const seen = {}; S.rungs.concat(S.side).filter(r => r.read && r.b).sort((a, b) => (a.fin || '9') < (b.fin || '9') ? -1 : 1).forEach(r => { if (!seen[r.world]) seen[r.world] = bk(r.b); }); return Object.values(seen); };
  const DEFS = [
    A('cl_ashwalker', 'Ash Walker', 'Cosmere ladder', 'Finish The Final Empire', 1, ['tfe']),
    A('cl_survivor', 'Survivor', 'Cosmere ladder', 'Finish Mistborn Era 1', 3, ERA1),
    A('cl_awakened', 'Awakened', 'Cosmere ladder', 'Finish Warbreaker', 1, ['warbreaker']),
    A('cl_bridgefour', 'Bridge Four', 'Cosmere ladder', 'Finish The Way of Kings', 1, ['wok']),
    // his Shardblades: counted once each has had its ten heartbeats (L20.rite), so the badge lands after the moment, not before it
    Object.assign(A('cl_blades', 'Shardbearer', 'Cosmere ladder', 'Shardblades taken', 1, null, { items: () => L20.bladeItems(), cand: () => [] }), { th: [1, 4, 8, 12], single: undefined }),
    A('cl_waxwayne', 'Wax & Wayne', 'Cosmere ladder', 'Finish Mistborn Era 2', 4, ERA2),
    A('cl_elantrian', 'Elantrian', 'Cosmere ladder', 'Finish Elantris', 1, ['elantris']),
    A('cl_hoid', "Hoid's Audience", 'Cosmere ladder', 'Finish Tress, Yumi and The Fires of December', 3, HOID),
    A('cl_radiant', 'Radiant', 'Cosmere ladder', 'Finish all of Stormlight, novellas included', 7, STORM),
    A('cl_arcanist', 'Arcanist', 'Cosmere ladder', 'Finish Arcanum Unbounded', 1, ['arcanum']),
    A('cl_halfway', 'Halfway Up', 'Cosmere ladder', 'Climb 10 rungs', 10, CORE),
    A('cl_worldhopper', 'Worldhopper', 'Cosmere ladder', 'Finish books from 6 different worlds', 6, null, { items: worldsItems, cand: c => { const S = L20.state('cosmere', c); const have = new Set(S.worlds); const seen = {}; S.rungs.concat(S.side).filter(r => !r.read && !have.has(r.world)).forEach(r => { if (!seen[r.world]) seen[r.world] = r.b ? bk(r.b) : { t: r.t, k: 'book', d: null }; }); return Object.values(seen); } }),
    A('cl_sidequester', 'Side Quester', 'Cosmere ladder', 'Finish every side quest', SIDEK.length, SIDEK),
    A('cl_top', 'Top of the Ladder', 'Cosmere ladder', 'Climb all 20 rungs', CORE.length, CORE, { single: 'plat' })
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
    try { Object.defineProperty(I, 'cl_blades', { get: () => face(L20.blade()), enumerable: true, configurable: true }); } catch (e) {}   // the Shardbearer medal shows the blade he carries
    try { document.body.insertAdjacentHTML('beforeend', '<svg width="0" height="0" style="position:absolute" aria-hidden="true"><defs><clipPath id="l20face"><circle cx="50" cy="50" r="65"/></clipPath></defs></svg>'); } catch (e) {}
  })();
  (function () { try { if (!window.L4 || !L4.defs) return; const have = new Set(L4.defs.map(d => d.id)); DEFS.forEach(d => { if (!have.has(d.id)) L4.defs.push(d); }); L4.clear(); } catch (e) { console.warn('l20 badges', e); } })();
  // the ladder's own section in the badge sheet
  (function () { if (!window.L4 || !L4.sheetHTML) return; const _sh = L4.sheetHTML; L4.sheetHTML = function (cat, focus) { let h = _sh.apply(this, arguments); try { if (cat !== 'books' && cat !== 'all') return h; const by = {}; L4.all().forEach(b => { by[b.id] = b; }); const L = IDS.map(i => by[i]).filter(Boolean); if (!L.length) return h;
      const sec = '<div class="l4-sec"><div class="l4-st">Cosmere ladder <small>' + L.filter(b => b.tier > 0).length + '/' + L.length + '</small></div><div class="l4-grid">' + L.map(b => L4.card(b, b.id === focus)).join('') + '</div></div>';
      const k = h.indexOf('<div class="l4-sec"><div class="l4-st">Everything'); if (k > 0) return h.slice(0, k) + sec + h.slice(k); const e = h.lastIndexOf('</div>'); return h.slice(0, e) + sec + h.slice(e); } catch (e) { return h; } }; })();
  // ---- drawing ----
  const fmtDate = s => { try { return new Date(String(s).slice(0, 10) + 'T12:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric' }); } catch (e) { return ''; } };
  const fmtLong = s => { try { return new Date(String(s).slice(0, 10) + 'T12:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }); } catch (e) { return s; } };
  const cover = (r, big) => { try { return coverInner(r.t, !!big); } catch (e) { return '<div class="ph"><div class="ph-title">' + E(r.name) + '</div></div>'; } };
  const stateOf = r => r.read ? 'Finished' + (r.fin ? ' ' + fmtDate(r.fin) : '') : r.st === 'currently-reading' ? 'Listening now' : r.soon ? 'Out ' + fmtLong(r.soon) : r.owned ? 'On your shelf' : r.b ? 'Goodreads list' : 'Not in your library';
  const chips = S => '<div class="cl-orders">' + Object.keys(S.orders).map(o => '<button class="' + (o === S.order ? 'on' : '') + '" data-l20order="' + S.id + ':' + o + '">' + E(S.orders[o].name) + '</button>').join('') + '</div>';
  // ---- his blades. He earns one for every Stormlight book he finishes (the ladder's seven Roshar rungs) and one more at each of
  //   the ladder's top five ranks: twelve in all. He chooses which blade each one is. A blade he has taken is his: lit, and his to
  //   carry. The rest stay dark until he earns another. (Before Nov 15 2026 one blade lit from the tip up over all twenty rungs,
  //   so the first whole blade was twenty books away. His words: "I finished Stormlight in like 4 days but I still need like 16
  //   titles to get one.") ----
  const BLADES = ['oathbringer', 'sunraiser', 'firestorm', 'mayalaran', 'sylblade', 'sylspear', 'ivory', 'wyndleblade', 'wyndlefork', 'pattern', 'eshonai', 'nightblood'];
  const BK = 'den:blade', OWN = 'den:blades', SEEN = 'den:blades:seen'; let bpick = '';   // bpick: the blade he has tapped while one is his to take
  const cosS = () => L20.state('cosmere'); const roshar = S => S.rungs.concat(S.side || []).filter(r => r.world === 'Roshar'); const topRanks = S => S.ranks.slice(-5);
  L20.bladesEarned = function (S) { try { S = S || cosS(); return Math.min(BLADES.length, roshar(S).filter(r => r.read).length + topRanks(S).filter(r => S.climbed >= r[0]).length); } catch (e) { return 0; } };
  L20.blades = function (S) { let L = []; try { L = JSON.parse(localStorage.getItem(OWN) || '[]'); } catch (e) {} if (!Array.isArray(L)) L = []; const seen = {}; return L.filter(n => BLADES.includes(n) && !seen[n] && (seen[n] = 1)).slice(0, L20.bladesEarned(S)); };
  L20.bladesToTake = S => Math.max(0, L20.bladesEarned(S) - L20.blades(S).length);
  // the blade he carries: the one he chose among his own, else his first; before he has any, the saved or first panel (shown dark)
  L20.blade = () => { let v = ''; try { v = localStorage.getItem(BK) || ''; } catch (e) {} let mine = []; try { mine = L20.blades(); } catch (e) {} if (mine.length) return mine.includes(v) ? v : mine[0]; return BLADES.includes(v) ? v : BLADES[0]; };
  const redrawBlades = () => { let x = 0; try { x = sheet.querySelector('.cl-pick').scrollLeft; } catch (e) {} try { if (sheetTitle === 'cosmere' || sheetTitle === 'ladder:cosmere') { renderSheet(); const p = sheet.querySelector('.cl-pick'); if (p) p.scrollLeft = x; } } catch (e) {} try { if (window.L15 && L15.placeBooks) L15.placeBooks(); } catch (e) {} };
  L20.setBlade = n => { if (!L20.blades().includes(n)) return; try { localStorage.setItem(BK, n); } catch (e) {} redrawBlades(); };
  L20.takeBlade = function (n) { if (!BLADES.includes(n) || L20.bladesToTake() < 1) return false; const L = L20.blades(); if (L.includes(n)) return false; L.push(n); try { localStorage.setItem(OWN, JSON.stringify(L)); localStorage.setItem(BK, n); } catch (e) { return false; } bpick = ''; noteBlade(n); redrawBlades(); L20.rite(n); return true; };
  // what each blade was earned by and the day he took it; and how many have had their moment
  const LOGK = 'den:blades:log', RITE = 'den:blades:rite'; const today20 = () => { const d = new Date(); return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0'); };
  const bladeLog = () => { try { const o = JSON.parse(localStorage.getItem(LOGK) || '{}'); return o && typeof o === 'object' ? o : {}; } catch (e) { return {}; } };
  // the things that have earned him a blade so far, oldest first: Stormlight books by the day finished, then the top ranks reached
  const bladeSources = S => { S = S || cosS(); return roshar(S).filter(r => r.read).sort((a, b) => String(a.fin || '9') < String(b.fin || '9') ? -1 : 1).map(r => ({ k: r.k, name: r.name })).concat(topRanks(S).filter(r => S.climbed >= r[0]).map(r => ({ k: 'rank:' + r[0], name: r[1] }))); };
  const noteBlade = n => { const log = bladeLog(); if (log[n]) return log[n]; const used = new Set(Object.values(log).map(x => x.f)); const src = bladeSources().find(x => !used.has(x.k)) || { k: '', name: '' }; log[n] = { at: today20(), f: src.k, by: src.name }; try { localStorage.setItem(LOGK, JSON.stringify(log)); } catch (e) {} return log[n]; };
  const rited = () => { let n = 0; try { n = +localStorage.getItem(RITE) || 0; } catch (e) {} return Math.min(n, L20.blades().length); };
  L20.bladeItems = function () { const log = bladeLog(); return L20.blades().slice(0, rited()).map(n => { const e = log[n] || {}; return { t: L20.bladeName(n, BLADES.indexOf(n)), k: 'note', d: e.at || null, sub: e.by || '' }; }); };
  // ---- the moment a blade becomes his: ten heartbeats, then the blade. The beats are ten marks that light one after another; the
  //   blade then comes out of the dark in one slow fade. Opacity only, each change once: nothing flashes, pulses or moves. A tap
  //   skips the count; with reduced motion there is no count. Closing it counts the blade toward the Shardbearer badge. ----
  let riteEl = null, riteT = [];
  L20.riteOpen = () => !!(riteEl && riteEl.classList.contains('on'));
  L20.rite = function (n) { try { if (!BLADES.includes(n)) return false; const mine = L20.blades(); const k = mine.indexOf(n) + 1; if (!k) return false; const e = noteBlade(n); const nm = L20.bladeName(n, BLADES.indexOf(n)); const src = 'art/blades/s_' + n + '.png';
      let still = false; try { still = matchMedia('(prefers-reduced-motion: reduce)').matches; } catch (x) {}
      if (!riteEl) { riteEl = document.createElement('div'); riteEl.id = 'l20rite'; riteEl.setAttribute('role', 'dialog'); riteEl.setAttribute('aria-modal', 'true'); document.body.appendChild(riteEl); }
      riteT.forEach(clearTimeout); riteT = []; riteEl.dataset.blade = n; riteEl.className = still ? 'still' : '';
      riteEl.innerHTML = '<div class="rt-in"><div class="rt-top"><span>Ten heartbeats</span><div class="rt-beats" aria-hidden="true">' + '<i></i>'.repeat(10) + '</div></div>' +
        '<div class="rt-blade"><b class="rt-glow"></b><img src="' + src + '" alt=""><img class="rt-dk" src="' + src + '" alt=""></div>' +
        '<div class="rt-tx"><span>Shardblade ' + k + ' of ' + BLADES.length + '</span><b>' + E(nm) + '</b>' + (e.by ? '<em>' + E(e.by) + '</em>' : '') + '</div><button class="rt-go" data-rite="done">Carry it</button></div>';
      riteEl.setAttribute('aria-label', 'Shardblade ' + k + ' of ' + BLADES.length);
      const beats = [...riteEl.querySelectorAll('.rt-beats i')]; const arrive = () => { riteT.forEach(clearTimeout); riteT = []; beats.forEach(b => b.classList.add('on')); riteEl.classList.add('here'); };
      riteEl._arrive = arrive; void riteEl.offsetWidth; riteEl.classList.add('on');
      if (still) arrive(); else { beats.forEach((b, i) => riteT.push(setTimeout(() => b.classList.add('on'), 700 + i * 720))); riteT.push(setTimeout(arrive, 700 + 10 * 720 + 300)); }
      return true; } catch (x) { console.warn('l20 rite', x); return false; } };
  L20.riteDone = function () { if (!riteEl) return; riteT.forEach(clearTimeout); riteT = []; riteEl.classList.remove('on', 'here'); try { localStorage.setItem(RITE, String(L20.blades().length)); } catch (e) {}
    try { if (window.L4 && L4.clear) L4.clear(); if (window.L4 && L4.sync) L4.sync(); } catch (e) {} redrawBlades(); };
  // a blade taken before it could have its moment (the first one, taken on Nov 15 2026) gets it the next time the ladder is opened
  L20.riteOwed = function () { try { const mine = L20.blades(); if (!mine.length || rited() >= mine.length || L20.riteOpen()) return false; return L20.rite(mine[mine.length - 1]); } catch (e) { return false; } };
  document.addEventListener('click', e => { if (!riteEl || !riteEl.classList.contains('on')) return; const t = e.target; if (!(t.closest && t.closest('#l20rite'))) return; e.preventDefault(); e.stopPropagation(); if (t.closest('[data-rite="done"]') && riteEl.classList.contains('here')) L20.riteDone(); else if (!riteEl.classList.contains('here') && riteEl._arrive) riteEl._arrive(); }, true);
  // said once each time the count of earned blades goes up (not while the library is still loading)
  L20.bladeNews = function () { try { if (typeof SYNC82 !== 'undefined' && SYNC82.state === 'wait') return 0; const n = L20.bladesEarned(); const was = +localStorage.getItem(SEEN) || 0; if (n === was) return 0; localStorage.setItem(SEEN, String(n)); if (n < was) return 0; const t = L20.bladesToTake(); if (t > 0) toast('Shardblade earned · ' + (t > 1 ? t + ' to choose' : 'choose yours')); return n - was; } catch (e) { return 0; } };
  const tierOf = S => S.ranks.filter(r => S.climbed >= r[0]).length - 1;
  // the panel: the blade he carries, whole and lit. Dark while none is his, with a tag when one is waiting to be chosen. On the ladder page it shows the blade he is about to take.
  L20.panel = function (S, cls, show) { const mine = L20.blades(S); const n = show && BLADES.includes(show) ? show : L20.blade(); const has = n === show || mine.includes(n); const src = 'art/blades/s_' + n + '.png';
    return '<div class="cl-blade' + (cls ? ' ' + cls : '') + (has ? ' full' : ' none') + '" data-tier="' + tierOf(S) + '" style="--lit:' + (has ? 100 : 0) + '%"><img src="' + src + '" alt="" decoding="async">' + (has ? '' : '<img class="cl-dark" src="' + src + '" alt="" decoding="async">') + (cls === 'sm' && L20.bladesToTake(S) > 0 ? '<i class="cl-tag cl-wait">Choose</i>' : '') + '</div>'; };
  // the rank scale beside the big panel: every rank at its height
  L20.scale = function (S) { const tier = tierOf(S); const cur = S.ranks[tier] || S.ranks[0]; const nx = S.nextRank;
    return '<div class="cl-scale">' + S.ranks.map(r => { const isCur = r === cur, isNext = nx && r === nx; const on = S.climbed >= r[0]; return '<span class="' + (isCur ? 'cur' : isNext ? 'next' : on ? 'on' : '') + '" style="bottom:' + (r[0] / S.total * 100).toFixed(2) + '%"><i></i><b>' + r[0] + '</b>' + E(r[1]) + (isNext ? ' ›' : '') + '</span>'; }).join('') + '</div>'; };
  // a blade's name can give away a later book, so it is shown only once the book that names it is finished (same gates as the encyclopedia)
  const BGATE = { oathbringer: '', sunraiser: 'wok', firestorm: 'wok', mayalaran: 'ob', sylblade: 'wor', sylspear: 'wor', ivory: 'wor', wyndleblade: 'edg', wyndlefork: 'edg', pattern: 'wor', eshonai: 'wor', nightblood: 'wor' };
  L20.bladeName = (n, i) => { let open = !BGATE[n]; try { if (!open && window.L29 && L29.ok) { L29.flush(); open = L29.ok(BGATE[n]); } } catch (e) {} return open ? n : 'blade ' + (i + 1); };
  // what gives the next blade, in a few words
  const nextBlade = S => { if (L20.bladesEarned(S) >= BLADES.length) return ''; const book = roshar(S).some(r => !r.read), nr = topRanks(S).find(r => S.climbed < r[0]); const a = [book ? 'a Stormlight book' : '', nr ? E(nr[1]) + ' at ' + nr[0] : ''].filter(Boolean); return a.length ? '<div class="cl-nb">Next: ' + a.join(' · ') + '</div>' : ''; };
  // the rack: his blades lit (the one he carries marked); while one is his to take, the others are lit to choose from and a button takes the one he has tapped; otherwise they are dark
  L20.picker = function () { const S = cosS(); const mine = L20.blades(S), cur = L20.blade(), take = L20.bladesToTake(S); if (!take || mine.includes(bpick)) bpick = '';
    return '<div class="cl-pick">' + BLADES.map((n, i) => { const nm = L20.bladeName(n, i), has = mine.includes(n); return '<button class="' + (has ? (n === cur ? 'on' : '') : take ? 'can' + (bpick === n ? ' pk' : '') : 'dark') + '" data-blade="' + n + '"' + (has || take ? '' : ' disabled') + ' aria-label="' + nm + (has ? '' : take ? ', choose' : ', not yours yet') + '"><img src="art/blades/s_' + n + '.png" alt="" decoding="async"><i>' + nm + '</i></button>'; }).join('') + '</div>' +
      (take ? '<button class="cl-takeb" data-bladetake="1"' + (bpick ? '' : ' disabled') + '>' + (bpick ? 'Take this blade' : 'Choose a blade') + '</button>' : nextBlade(S)); };
  L20.bladePick = () => bpick;
  document.addEventListener('click', e => { const tk = e.target.closest && e.target.closest('[data-bladetake]'); if (tk) { e.preventDefault(); e.stopPropagation(); if (bpick) L20.takeBlade(bpick); return; }
    const b = e.target.closest && e.target.closest('[data-blade]'); if (b) { e.preventDefault(); e.stopPropagation(); const n = b.dataset.blade; if (L20.blades().includes(n)) { bpick = ''; L20.setBlade(n); } else if (L20.bladesToTake() > 0) { bpick = bpick === n ? '' : n; redrawBlades(); } return; } const o = e.target.closest && e.target.closest('[data-l20order]'); if (o) { e.preventDefault(); e.stopPropagation(); const [id, ord] = o.dataset.l20order.split(':'); L20.setOrder(id, ord); } }, true);
  // Spider-Man swing: the web anchors ahead and above, he arcs under it (lowest at the middle), lets go at the far side and a new web catches ahead.
  // The anchor stays put in the world because the flight speed equals one arc's width per swing, so nothing slides backwards.
  const SW = { L: 96, A: 40, T: 1.35 };
  L20.swingKF = function () { const r = Math.PI / 180, L = SW.L, A = SW.A; let line = '', body = '', man = '';
    const top = L * (1 - Math.cos(A * r)); for (let i = 0; i <= 60; i++) { const t = i / 60, th = Math.asin(Math.sin(A * r) * (1 - 2 * t)) / r; const lift = -top * (1 + Math.cos(2 * Math.PI * t)) / 2; const op = t < .06 ? t / .06 : t > .9 ? Math.max(0, (1 - t) / .1) : 1;
      line += (t * 100).toFixed(1) + '%{transform:rotate(' + (-th).toFixed(2) + 'deg);opacity:' + op.toFixed(2) + '}';
      body += (t * 100).toFixed(1) + '%{transform:translateY(' + lift.toFixed(2) + 'px)}';
      const ang = u => -Math.asin(Math.sin(A * r) * (1 - 2 * u)) / r * .35; let bodyA; if (t <= .84) bodyA = ang(t); else { const k = (t - .84) / .16, e = (1 - Math.cos(Math.PI * k)) / 2; bodyA = ang(.84) + (ang(0) - ang(.84)) * e; }
      man += (t * 100).toFixed(1) + '%{transform:rotate(' + bodyA.toFixed(2) + 'deg)}'; }
    return '@keyframes l20swing{' + body + '}@keyframes l20line{' + line + '}@keyframes l20man{' + man + '}'; };
  L20.swingFly = function () { const chord = 2 * SW.L * Math.sin(SW.A * Math.PI / 180), dist = (window.innerWidth || 390) + 180; return (dist / (chord / SW.T)).toFixed(2) + 's'; };
  // ---- Kelsier takes the dragon's place while the Cosmere ladder is being climbed; the dragon comes back at the top ----
  L20.kelsier = function () { try { const dr = document.getElementById('dragon'); const img = dr && dr.querySelector('.dsprite'); if (!img) return; let on = true; try { const S = L20.state('cosmere'); on = S.climbed < S.total; } catch (e) {}
    const sky = dr.parentElement;
    if (on && !img.dataset.l20) { img.dataset.dragon = img.getAttribute('src'); img.dataset.l20 = '1'; img.src = 'art/kelsier_3x.png'; dr.classList.add('kelsier'); if (sky) sky.classList.add('kelsier'); try { dr.style.setProperty('--kel-fly', L20.swingFly()); } catch (e) {}
      // the line he swings from: a wrapper that pivots at its top, the line drawn down to him
      if (!dr.querySelector('.kel-swing')) { const w = document.createElement('span'); w.className = 'kel-swing'; const l = document.createElement('i'); l.className = 'kel-line'; const bd = document.createElement('span'); bd.className = 'kel-body'; img.parentNode.insertBefore(w, img); w.appendChild(l); w.appendChild(bd); bd.appendChild(img); }
      try { renderExp(); } catch (e) {} }
    else if (!on && img.dataset.l20) { img.src = img.dataset.dragon; delete img.dataset.l20; dr.classList.remove('kelsier'); if (sky) sky.classList.remove('kelsier'); const w = dr.querySelector('.kel-swing'); if (w) { dr.insertBefore(img, w); w.remove(); } try { renderExp(); } catch (e) {} } } catch (e) {} };
  L20.kelsier();
  // ---- the Books tab cards: the climb so far, the next book marked, the order chips ----
  const tile = (r, S) => { const isNext = S.next && r.k === S.next.k; return '<button class="d-cv cl-cv' + (r.read ? ' done' : isNext ? ' next' : '') + (r.soon ? ' soon' : '') + '" data-dopen="' + enc(r.t) + '" aria-label="' + E(r.name) + '"><span class="cl-img">' + cover(r) + '</span><i class="cl-n">' + (r.pos + 1) + '</i>' + (isNext ? '<i class="cl-tag">NEXT</i>' : r.soon ? '<i class="cl-tag soon">' + E(fmtDate(r.soon)) + '</i>' : '') + '</button>'; };
  const nextBox = S => S.next ? '<div class="cl-next"><span>Next ' + (S.unit === 'rungs' ? 'rung' : 'book') + '</span><b>' + (S.next.pos + 1) + ' · ' + E(S.next.name) + '</b><i>' + E(stateOf(S.next)) + (S.next.note ? ' · ' + E(S.next.note) : '') + '</i></div>' : '<div class="cl-next"><span>Next</span><b>Nothing left to read here</b></div>';
  L20.card = function (id) { try { const S = L20.state(id); const nr = S.nextRank; const by = {}; L4.all().forEach(b => { by[b.id] = b; }); const ach = IDS.map(i => by[i]).filter(Boolean);
    const head = '<div class="d-k"><span>' + E(S.name) + '<i class="b-n">' + S.climbed + ' / ' + S.total + '</i></span><button class="d-more" data-l20="' + id + '">Open</button></div>' + chips(S);
    const rank = '<div class="cl-rank">' + (id === 'cosmere' && S.climbed < S.total ? '<img class="cl-kel" src="art/kelsier.png" alt="" decoding="async">' : '') + '<b>' + E(S.rank) + '</b><span>' + S.climbed + ' of ' + S.total + ' ' + S.unit + '</span>' + (nr ? '<span>' + E(nr[1]) + ' at ' + nr[0] + '</span>' : '<span>Top of the ladder</span>') + '</div>';
    let stats; if (id === 'cosmere') stats = '<div class="cl-stats c4"><div><b>' + L20.blades(S).length + '<small>/' + BLADES.length + '</small></b><span>Blades</span></div><div><b>' + S.side.filter(r => r.read).length + '<small>/' + S.side.length + '</small></b><span>Quests</span></div><div><b>' + ach.filter(b => b.tier > 0).length + '<small>/' + ach.length + '</small></b><span>Badges</span></div><div><b>' + S.worlds.length + '<small>/6</small></b><span>Worlds</span></div></div>';
    else { const g = {}; S.rungs.forEach(r => { g[r.world] = g[r.world] || [0, 0]; g[r.world][1]++; if (r.read) g[r.world][0]++; }); stats = '<div class="cl-stats">' + ['ACOTAR', 'Throne of Glass', 'Crescent City'].map(w => '<div><b>' + (g[w] || [0, 0])[0] + '<small>/' + (g[w] || [0, 0])[1] + '</small></b><span>' + E(w === 'Throne of Glass' ? 'Throne' : w === 'Crescent City' ? 'Crescent' : w) + '</span></div>').join('') + '</div>'; }
    const left = id === 'cosmere' ? '<button class="cl-bl" data-l20="cosmere" aria-label="Open the ladder">' + L20.panel(S, 'sm') + '</button>' : (S.next ? '<button class="cl-bl cl-nextcv" data-dopen="' + enc(S.next.t) + '" aria-label="' + E(S.next.name) + '"><span class="cl-img">' + cover(S.next, true) + '</span><i class="cl-tag">NEXT</i></button>' : '');
    return '<div class="d-sec cl-sec" data-ladder="' + id + '">' + head + '<div class="cl-top">' + left + '<div class="cl-side">' + rank + stats + nextBox(S) + '</div></div>' +
      '<div class="d-row cl-row">' + S.seq.map(r => tile(r, S)).join('') + '</div></div>'; } catch (e) { console.warn('l20 card', e); return ''; } };
  (function () { if (!window.L15 || !L15.booksTop) return; const _bt = L15.booksTop; L15.booksTop = function () { let h = _bt.apply(this, arguments); try { L20.kelsier(); try { L20.bladeNews(); } catch (x) {} const card = L20.card('cosmere') + L20.card('maas'); if (!card) return h; const i = h.indexOf('<div class="d-sec"><div class="d-k">Finished in'); h = i > 0 ? h.slice(0, i) + card + h.slice(i) : (h.endsWith('</div>') ? h.slice(0, -6) + card + '</div>' : h + card); } catch (e) {} return h; }; })();
  // ---- the ladder sheet ----
  const rung = (r, S, n) => { const isNext = n && S.next && r.k === S.next.k; return '<button class="cl-rung' + (r.read ? ' done' : '') + (isNext ? ' next' : '') + (!r.read && !r.owned ? ' away' : '') + '" data-dopen="' + enc(r.t) + '">' +
    (n ? '<i class="cl-no">' + (r.pos + 1) + '</i>' : '<i class="cl-no cl-dot">•</i>') + '<span class="cl-cv2">' + cover(r) + '</span><span class="cl-body"><b>' + E(r.name) + '</b><i>' + E(stateOf(r)) + ' · ' + E(r.world) + '</i>' + (r.note ? '<em>' + E(r.note) + '</em>' : '') + '</span>' + (r.read ? '<i class="cl-ok">✓</i>' : isNext ? '<i class="cl-tag">NEXT</i>' : '') + '</button>'; };
  // ---- the chart: the order as a numbered path of covers, four across, winding down the page like the reading-order charts.
  //   Every cover is in colour. A finished stop carries a tick and the path behind him is solid; the path ahead is dotted. ----
  L20.chartHTML = function (S) { const L = S.seq, n = L.length, per = 4; const cells = [{ start: 1 }].concat(L.map((r, i) => ({ r, i }))); const rows = []; for (let k = 0; k < cells.length; k += per) rows.push(cells.slice(k, k + per));
    const cell = (c, ri, ci, len) => { if (c.start) return '<div class="cc-cell cc-st"><span class="cc-cv"><b>Start here</b>' + (n ? '<i class="cc-x h' + (L[0].read ? ' go' : '') + '"></i>' : '') + '</span></div>';
      const r = c.r, i = c.i, nx = L[i + 1], isNext = S.next && r.k === S.next.k, now = r.st === 'currently-reading' && !r.read; const end = ci === len - 1; const go = nx && r.read && nx.read ? ' go' : '';
      return '<button class="cc-cell' + (r.read ? ' done' : '') + (isNext ? ' next' : '') + (now ? ' now' : '') + (!r.read && !r.owned ? ' away' : '') + '" data-dopen="' + enc(r.t) + '" aria-label="' + (i + 1) + ', ' + E(r.name) + (r.read ? ', finished' : now ? ', listening now' : isNext ? ', next' : '') + '"><span class="cc-cv"><span class="cc-img">' + cover(r) + '</span><i class="cl-n">' + String(i + 1).padStart(2, '0') + '</i>' + (r.read ? '<i class="cc-ok">✓</i>' : now ? '<i class="cl-tag">NOW</i>' : isNext ? '<i class="cl-tag">NEXT</i>' : '') + (nx && !end ? '<i class="cc-x h' + go + '"></i>' : '') + '</span>' + (nx && end ? '<i class="cc-x v' + go + '"></i>' : '') + '<span class="cc-w">' + E(r.au ? 'Arcanum' : r.world) + '</span><b class="cc-t">' + E(r.name) + '</b></button>'; };
    return '<div class="cc">' + rows.map((R, ri) => { const back = ri % 2 === 1; const H = R.map((c, ci) => cell(c, ri, ci, R.length)); const pad = Array.from({ length: per - R.length }, () => '<div class="cc-cell cc-no"></div>'); return '<div class="cc-row' + (back ? ' back' : '') + '">' + (back ? pad.concat(H.slice().reverse()) : H.concat(pad)).join('') + '</div>'; }).join('') + '</div>'; };
  L20.chartOn = () => PREV;
  L20.sheetHTML = function (id) { const S = L20.state(id); const nr = S.nextRank; const by = {}; L4.all().forEach(b => { by[b.id] = b; }); const ach = id === 'cosmere' ? IDS.map(i => by[i]).filter(Boolean) : []; const O = S.orders[S.order];
    return '<button class="sheet-close" aria-label="Close">✕</button><div class="l4-sheet cl-sheet"><div class="kicker">' + E(S.name) + ' · ' + E(O.name) + '</div><h2>' + E(S.rank) + ' <i class="b-n">' + S.climbed + ' / ' + S.total + '</i></h2>' +
      '<div class="hint">' + (nr ? E(nr[1]) + ' at ' + nr[0] + ' ' + S.unit + '. ' : 'Top of the ladder. ') + E(O.note) + ' Finished books count in every order; the next one is the lowest you haven’t read. Tap a book to open it.</div>' +
      chips(S) +
      (id === 'cosmere' ? '<div class="cl-hero">' + L20.panel(S, 'lg', L20.bladesToTake(S) > 0 ? bpick : '') + L20.scale(S) + '</div><div class="l4-sec"><div class="l4-st">Your blades <small>' + L20.blades(S).length + '/' + BLADES.length + '</small></div>' + L20.picker() + '</div>' : '<div class="cl-ranks">' + S.ranks.map(r => '<span class="' + (S.climbed >= r[0] ? 'on' : '') + '"><b>' + r[0] + '</b>' + E(r[1]) + '</span>').join('') + '</div>') +
      '<div class="l4-sec"><div class="l4-st">' + (S.brandon ? 'The ladder' : E(O.name) + ' order') + ' <small>' + S.seq.filter(r => r.read).length + '/' + S.seq.length + '</small></div>' + (PREV && id === 'cosmere' ? L20.chartHTML(S) : '<div class="cl-list">' + S.seq.slice().reverse().map(r => rung(r, S, true)).join('') + '</div>') + '</div>' +
      (S.brandon && S.side.length ? '<div class="l4-sec"><div class="l4-st">Side quests <small>' + S.side.filter(r => r.read).length + '/' + S.side.length + '</small></div><div class="cl-list">' + S.side.map(r => rung(r, S, false)).join('') + '</div></div>' : '') +
      (ach.length ? '<div class="l4-sec"><div class="l4-st">Achievements <small>' + ach.filter(b => b.tier > 0).length + '/' + ach.length + '</small></div><div class="l4-grid">' + ach.map(b => L4.card(b, false)).join('') + '</div></div>' : '') + '</div>'; };
  document.addEventListener('click', e => { const b = e.target.closest && e.target.closest('[data-l20]'); if (!b) return; e.preventDefault(); e.stopPropagation(); openSheet('ladder:' + (LADDERS[b.dataset.l20] ? b.dataset.l20 : 'cosmere')); if (b.dataset.l20 === 'cosmere') setTimeout(() => { try { L20.riteOwed(); } catch (x) {} }, 350); }, true);
  (function () { const _rs = renderSheet; renderSheet = function () { const t = String(sheetTitle || ''); if (t === 'cosmere' || t.startsWith('ladder:')) { const id = t === 'cosmere' ? 'cosmere' : t.slice(7); if (LADDERS[id]) { sheet.querySelector('.sheet-body').innerHTML = L20.sheetHTML(id); return; } } return _rs.apply(this, arguments); }; })();
  // the chart preview: the address ending #chart opens the ladder page with the Chart order and the chart look; closing the page ends it
  L20.chartPreview = function (on) { on = !!on; if (on === PREV) return; PREV = on; PREVO = 'chart'; if (on) LADDERS.cosmere.orders.chart = CHART; else delete LADDERS.cosmere.orders.chart; Object.keys(CACHE).forEach(k => delete CACHE[k]);
    if (on) { try { if (currentLib !== 'books') switchLib('books'); } catch (e) {} try { openSheet('ladder:cosmere'); } catch (e) {} } };
  (function () { try { const _cs = closeSheet; closeSheet = function () { const r = _cs.apply(this, arguments); if (PREV) { L20.chartPreview(false); try { if (/^#chart\b/i.test(location.hash)) history.replaceState(null, '', location.pathname + location.search); } catch (e) {} try { if (window.L15 && L15.placeBooks) L15.placeBooks(); } catch (e) {} } return r; }; } catch (e) {}
    const want = () => /^#chart\b/i.test(location.hash); window.addEventListener('hashchange', () => { if (want()) L20.chartPreview(true); });
    if (want()) { let n = 0; const iv = setInterval(() => { n++; const ready = !(typeof SYNC82 !== 'undefined' && SYNC82.state === 'wait'); if (ready || n > 40) { clearInterval(iv); if (want()) L20.chartPreview(true); } }, 500); } })();
  // Kelsier's flight: his own keyframes, transforms only, so nothing in the base sheet or a motion setting can park him
  // Kelsier swings across the masthead on a line: the anchor travels, each swing is one forward arc, the line lets go at the top and catches again
  const kf = document.createElement('style'); kf.id = 'l20kf'; kf.textContent = '@keyframes l20fly{0%{transform:translateX(calc(100vw + 60px))}100%{transform:translateX(-120px)}}' + L20.swingKF() + '@keyframes l20bob{0%,100%{transform:translateY(0)}50%{transform:translateY(-4px)}}'; document.head.appendChild(kf);
  const css = document.createElement('style'); css.id = 'l20css'; css.textContent = [
    // Books card
    'html body.den .cl-sec .d-more{margin-left:auto}',
    'html body.den .cl-rank{display:flex;flex-direction:column;gap:3px;margin:0}html body.den .cl-rank b{font:400 30px/1 var(--b-disp,"Bebas Neue"),Impact,sans-serif;letter-spacing:.04em;text-transform:uppercase;color:var(--d-ink,#f3efe6)}html body.den .cl-rank span{font:400 11px var(--b-mono,"IBM Plex Mono"),monospace;letter-spacing:.06em;text-transform:uppercase;color:var(--d-mute,#8e8e95)}',
    'html body.den .cl-sec .d-k .b-n{margin-left:8px}',
    // order chips
    'html body.den .cl-orders{display:flex;gap:6px;overflow-x:auto;scrollbar-width:none;margin:-2px -20px 12px;padding:0 20px 2px}html body.den .cl-orders::-webkit-scrollbar{display:none}html body.den .cl-orders button{flex:0 0 auto;padding:5px 9px;border:1px solid var(--d-line,#333)!important;background:var(--d-bg2,#17171b)!important;box-shadow:none!important;border-radius:0!important;font:400 10.5px var(--b-mono,"IBM Plex Mono"),monospace;letter-spacing:.06em;text-transform:uppercase;color:var(--d-mute,#8e8e95)}html body.den .cl-orders button.on{background:var(--d-ink,#f3efe6)!important;border-color:var(--d-ink,#f3efe6)!important;color:#111}',
    '.cl-sheet .cl-orders{margin:0 -16px 14px;padding:0 16px 2px}',
    'html body.den .cl-row .cl-cv{width:64px;height:auto!important;background:none!important;border:0!important;box-shadow:none!important;overflow:visible;position:relative;text-align:left}',
    'html body.den .cl-cv .cl-img{display:block;width:64px;height:96px;position:relative;overflow:hidden;background:var(--d-bg3,#1b1b1f);border:2px solid #fff;box-shadow:4px 4px 0 #000}html body.den .cl-cv .cl-img img{display:block;width:100%;height:100%;object-fit:cover}html body.den .cl-cv .cl-img .ph,html body.den .cl-cv .cl-img .d-ph{width:100%;height:100%;display:flex;flex-direction:column;justify-content:flex-end;padding:6px;gap:2px}html body.den .cl-cv .cl-img .ph-title,html body.den .cl-cv .cl-img .d-ph b{font:400 10px/1.05 var(--b-disp,"Bebas Neue"),Impact,sans-serif;letter-spacing:.04em;text-transform:uppercase;color:var(--d-ink,#f3efe6)}html body.den .cl-cv .cl-img .ph-author,html body.den .cl-cv .cl-img .d-ph i{display:none}',
    'html body.den .cl-cv:not(.done):not(.next) .cl-img{border-color:rgba(255,255,255,.45);box-shadow:none}html body.den .cl-cv:not(.done):not(.next) .cl-img img,html body.den .cl-cv:not(.done):not(.next) .cl-img .ph,html body.den .cl-cv:not(.done):not(.next) .cl-img .d-ph{filter:grayscale(1) brightness(.5)}',
    'html body.den .cl-cv.next .cl-img{box-shadow:4px 4px 0 var(--d-acc,#ff6a2a)}',
    'html body.den .cl-cv .cl-n{position:absolute;left:-4px;top:-6px;line-height:1;font:400 11px/1 var(--b-disp,"Bebas Neue"),Impact,sans-serif;letter-spacing:.06em;background:#fff;color:#111;border:2px solid #111;padding:3px 5px;font-style:normal;z-index:1}html body.den .cl-cv.done .cl-n{background:var(--d-ink,#f3efe6)}',
    'html body.den .cl-tag{position:absolute;left:-4px;bottom:-6px;font:400 11px/1 var(--b-disp,"Bebas Neue"),Impact,sans-serif;letter-spacing:.1em;text-transform:uppercase;background:var(--d-acc,#ff6a2a);color:#111;border:2px solid #111;padding:4px 6px;transform:rotate(-3deg);font-style:normal;z-index:1}html body.den .cl-tag.soon{background:#fff}',
    'html body.den .cl-next{display:flex;flex-direction:column;gap:2px;margin-top:0;padding:10px 12px;border:1px solid var(--d-line,#333);background:var(--d-bg2,#17171b)}html body.den .cl-next span{font:400 10px var(--b-mono,"IBM Plex Mono"),monospace;letter-spacing:.1em;text-transform:uppercase;color:var(--d-acc,#ff6a2a)}html body.den .cl-next b{font:400 18px/1.1 var(--b-disp,"Bebas Neue"),Impact,sans-serif;letter-spacing:.04em;text-transform:uppercase;color:var(--d-ink,#f3efe6)}html body.den .cl-next i{font:400 11px var(--b-mono,"IBM Plex Mono"),monospace;color:var(--d-mute,#8e8e95);font-style:normal}',
    // sheet
    '.cl-sheet h2{display:flex;align-items:center;gap:10px}.cl-sheet h2 .b-n{font-size:13px}',
    // the blade panel: colour below the light line, dark glass above it
    '.cl-blade{position:relative;display:block;overflow:visible;background:#121215;border:2px solid #fff;box-shadow:4px 4px 0 #000;flex:0 0 auto}.cl-blade img{display:block;width:100%;height:100%;object-fit:contain;padding:8px 6px;image-rendering:pixelated;image-rendering:crisp-edges}.cl-blade .cl-dark{position:absolute;inset:0;filter:grayscale(1) brightness(.45);clip-path:inset(0 0 var(--lit) 0)}',
    '.cl-blade .cl-line{position:absolute;left:0;right:0;bottom:calc(var(--lit) - 14px);height:28px;background:linear-gradient(to top,rgba(255,106,42,0),rgba(255,176,137,.6) 50%,rgba(255,106,42,0));pointer-events:none;z-index:2}.cl-blade .cl-line:after{content:"";position:absolute;left:-2px;right:-2px;top:13px;height:2px;background:#fff}',
    '.cl-blade[data-tier="4"],.cl-blade[data-tier="5"],.cl-blade[data-tier="6"]{border-color:#ffb089}.cl-blade[data-tier="7"],.cl-blade[data-tier="8"]{border-color:#ff6a2a;box-shadow:4px 4px 0 #ff6a2a}.cl-blade.full{border-color:#fff;box-shadow:4px 4px 0 #ffb089}',
    '.cl-blade.sm{width:96px;height:272px}.cl-blade.lg{width:150px;height:425px}',
    // Books card: blade (or the next cover) left, rank and next right
    'html body.den .cl-top{display:flex;gap:18px;align-items:stretch;margin:2px 4px 16px 2px}html body.den .cl-bl{padding:0;border:0!important;background:none!important;box-shadow:none!important;flex:0 0 auto;display:block}html body.den .cl-side{flex:1;min-width:0;display:flex;flex-direction:column;gap:12px;justify-content:space-between}',
    'html body.den .cl-nextcv{position:relative;width:96px;height:144px;align-self:flex-start;overflow:visible!important}html body.den .cl-nextcv .cl-img{display:block;width:96px;height:144px;position:relative;overflow:hidden;background:var(--d-bg3,#1b1b1f);border:2px solid #fff;box-shadow:4px 4px 0 var(--d-acc,#ff6a2a)}html body.den .cl-nextcv .cl-img img{display:block;width:100%;height:100%;object-fit:cover}html body.den .cl-nextcv .cl-img .ph,html body.den .cl-nextcv .cl-img .d-ph{width:100%;height:100%;display:flex;flex-direction:column;justify-content:flex-end;padding:8px}html body.den .cl-nextcv .cl-img .ph-title,html body.den .cl-nextcv .cl-img .d-ph b{font:400 12px/1.05 var(--b-disp,"Bebas Neue"),Impact,sans-serif;text-transform:uppercase;color:var(--d-ink,#f3efe6)}html body.den .cl-nextcv .cl-img .ph-author,html body.den .cl-nextcv .cl-img .d-ph i{display:none}',
    'html body.den .cl-stats{display:grid;grid-template-columns:repeat(3,1fr);gap:6px}html body.den .cl-stats div{border:1px solid var(--d-line,#333);padding:8px 6px 6px;display:flex;flex-direction:column;gap:3px;min-width:0}html body.den .cl-stats b{font:400 22px/1 var(--b-disp,"Bebas Neue"),Impact,sans-serif;color:var(--d-ink,#f3efe6)}html body.den .cl-stats b small{font-size:13px;color:var(--d-mute,#8e8e95)}html body.den .cl-stats span{font:400 8.5px var(--b-mono,"IBM Plex Mono"),monospace;letter-spacing:.06em;text-transform:uppercase;color:var(--d-mute,#8e8e95);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}',
    // sheet hero: big blade + the rank scale
    '.cl-hero{display:flex;gap:14px;align-items:stretch;margin:6px 0 18px;padding:14px 10px 14px 10px;background:var(--d-bg2,#17171b);border:1px solid var(--d-line,#333)}',
    '.cl-scale{position:relative;flex:1;min-width:0;margin:0 0 0 4px}.cl-scale span{position:absolute;left:0;right:0;transform:translateY(50%);display:flex;align-items:center;gap:8px;font:400 11px var(--b-mono,"IBM Plex Mono"),monospace;letter-spacing:.06em;text-transform:uppercase;color:#4a4a52;white-space:nowrap}.cl-scale span i{display:block;width:10px;height:2px;background:currentColor;flex:0 0 auto}.cl-scale span b{font:400 15px/1 var(--b-disp,"Bebas Neue"),Impact,sans-serif;color:inherit;min-width:18px}',
    '.cl-scale span.on{color:var(--d-mute,#8e8e95)}.cl-scale span.next{color:var(--d-acc,#ff6a2a)}.cl-scale span.cur{color:var(--d-ink,#f3efe6);font-weight:600;font-size:12px}.cl-scale span.cur i{width:18px;height:3px}',
    '.l4-m g[opacity] image{filter:grayscale(1)}',
    // Kelsier soars across the masthead where the dragon used to fly; the Blend theme hid that sky, so it comes back for him only
    'html body.den.blend header.hero .sky.kelsier{display:block!important;position:absolute!important;inset:0!important;height:calc(env(safe-area-inset-top) + 236px)!important;z-index:2!important;pointer-events:none;opacity:1;overflow:hidden}html body.den.blend header.hero .sky.kelsier .star{display:none!important}',
    'html body.den header.hero.hero .sky .dragon.pix.kelsier{width:56px!important;left:0!important;right:auto!important;top:calc(env(safe-area-inset-top) + 2px)!important;filter:none!important;animation:l20fly var(--kel-fly,7s) linear infinite!important;will-change:transform;transition:none!important;overflow:visible!important}',
    'html body.den header.hero.hero .sky .dragon.pix.kelsier .kel-swing{display:block;position:relative;padding-top:96px;animation:l20swing 1.35s linear infinite!important;will-change:transform;backface-visibility:hidden}html body.den header.hero.hero .sky .dragon.pix.kelsier .kel-line{position:absolute;left:50%;top:0;width:2px;height:98px;margin-left:-1px;transform-origin:50% 100%;background:linear-gradient(rgba(255,255,255,.35),rgba(255,255,255,.95));animation:l20line 1.35s linear infinite!important;will-change:transform,opacity}html body.den header.hero.hero .sky .dragon.pix.kelsier .kel-body{display:block;position:relative;transform:translateZ(0);--dir:-1}html body.den header.hero.hero .sky .dragon.pix.kelsier .dsprite{display:block;backface-visibility:hidden;image-rendering:auto!important;width:56px;height:auto;transform-origin:50% 8%;animation:l20man 1.35s linear infinite!important;will-change:transform}html body.den .exp-icon img{image-rendering:pixelated}',
    'html body.den .cl-rank{position:relative}html body.den .cl-rank .cl-kel{position:absolute;right:0;top:-6px;width:52px;height:auto;image-rendering:pixelated;image-rendering:crisp-edges;animation:l20bob 2.2s ease-in-out infinite}',
    // the blade picker
    '.cl-pick{display:flex;gap:8px;overflow-x:auto;scrollbar-width:none;margin:0 -16px;padding:4px 16px 8px}.cl-pick::-webkit-scrollbar{display:none}.cl-pick button{flex:0 0 auto;width:66px;padding:0;border:2px solid rgba(255,255,255,.35)!important;background:#000!important;box-shadow:none!important;border-radius:0!important;position:relative;overflow:visible}.cl-pick button img{display:block;width:100%;height:150px;object-fit:contain;padding:6px 4px;background:#121215;image-rendering:pixelated;image-rendering:crisp-edges}.cl-pick button i{display:block;font:400 8px var(--b-mono,"IBM Plex Mono"),monospace;letter-spacing:.02em;text-transform:uppercase;color:var(--d-mute,#8e8e95);padding:4px 2px;font-style:normal;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}',
    '.cl-pick button.on{border-color:#fff!important;box-shadow:4px 4px 0 var(--d-acc,#ff6a2a)!important}.cl-pick button.on i{color:#111;background:var(--d-acc,#ff6a2a)}',
    // his rack: dark until earned; lit to choose from while one is his to take; the one he has tapped stands out
    '.cl-pick button.dark{border-color:rgba(255,255,255,.14)!important;opacity:1}.cl-pick button.dark img{filter:grayscale(1) brightness(.34) contrast(1.1)}.cl-pick button.dark i{opacity:.45}.cl-pick button.can{border-style:dashed!important}.cl-pick button.pk{border-style:solid!important;border-color:#fff!important;box-shadow:4px 4px 0 #fff!important}.cl-pick button.pk i{color:#111;background:#fff}',
    '.cl-takeb{display:block;width:100%;min-height:46px;margin:6px 0 2px;border:2px solid var(--d-acc,#ff6a2a)!important;border-radius:0!important;background:var(--d-acc,#ff6a2a)!important;color:#111!important;box-shadow:none!important;font:400 17px/1 var(--b-disp,"Bebas Neue"),Impact,sans-serif;letter-spacing:.08em;text-transform:uppercase}.cl-takeb[disabled]{background:none!important;color:var(--d-acc,#ff6a2a)!important;opacity:.75}',
    // the moment: dark, the blade in the middle, ten marks above it; every change is one fade
    '#l20rite{position:fixed;inset:0;z-index:2400;display:none;background:#06050b;color:#f3efe6;opacity:0;transition:opacity .6s ease}#l20rite.on{display:block;opacity:1}#l20rite.still,#l20rite.still *{transition:none!important}',
    '#l20rite .rt-in{position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:18px;padding:calc(env(safe-area-inset-top) + 20px) 24px calc(env(safe-area-inset-bottom) + 24px)}',
    '#l20rite .rt-top{display:flex;flex-direction:column;align-items:center;gap:10px;transition:opacity 1.2s ease}#l20rite .rt-top span{font:400 11px var(--b-mono,"IBM Plex Mono"),monospace;letter-spacing:.22em;text-transform:uppercase;color:#8e8e95}#l20rite .rt-beats{display:flex;gap:9px}#l20rite .rt-beats i{width:9px;height:9px;border-radius:50%;border:1px solid rgba(243,239,230,.38);background:#f3efe6;background-clip:content-box;padding:0;opacity:.22;transition:opacity .5s ease}#l20rite .rt-beats i.on{opacity:1}#l20rite.here .rt-top{opacity:.35}',
    '#l20rite .rt-blade{position:relative;flex:0 1 auto;height:min(52vh,460px);aspect-ratio:160/300;max-width:70vw}#l20rite .rt-blade img{position:absolute;inset:0;width:100%;height:100%;object-fit:contain;image-rendering:pixelated;image-rendering:crisp-edges}#l20rite .rt-blade .rt-dk{filter:grayscale(1) brightness(.3) contrast(1.1);transition:opacity 2.2s ease}#l20rite.here .rt-blade .rt-dk{opacity:0}',
    '#l20rite .rt-glow{position:absolute;left:50%;top:50%;width:150%;height:86%;transform:translate(-50%,-50%);background:radial-gradient(closest-side,rgba(180,225,255,.2),rgba(180,225,255,0));opacity:0;transition:opacity 2.6s ease}#l20rite.here .rt-glow{opacity:1}',
    '#l20rite .rt-tx{display:flex;flex-direction:column;align-items:center;gap:5px;text-align:center;opacity:0;transition:opacity 1.2s ease 1.2s}#l20rite.here .rt-tx{opacity:1}#l20rite .rt-tx span{font:400 11px var(--b-mono,"IBM Plex Mono"),monospace;letter-spacing:.22em;text-transform:uppercase;color:var(--d-acc,#ff6a2a)}#l20rite .rt-tx b{font:400 38px/1 var(--b-disp,"Bebas Neue"),Impact,sans-serif;letter-spacing:.06em;text-transform:uppercase}#l20rite .rt-tx em{font:400 13px var(--b-mono,"IBM Plex Mono"),monospace;font-style:normal;color:#b9b4ab}',
    '#l20rite .rt-go{min-width:200px;min-height:48px;padding:0 22px;border:2px solid var(--d-acc,#ff6a2a);border-radius:0;background:var(--d-acc,#ff6a2a);color:#111;font:400 18px/1 var(--b-disp,"Bebas Neue"),Impact,sans-serif;letter-spacing:.1em;text-transform:uppercase;opacity:0;pointer-events:none;transition:opacity 1.2s ease 1.6s}#l20rite.here .rt-go{opacity:1;pointer-events:auto}',
    // the chart: four across, winding; every cover in colour; the path solid behind him and dotted ahead
    'html body.den .cc{display:flex;flex-direction:column;gap:26px;margin:6px 0 4px}html body.den .cc-row{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));column-gap:16px;align-items:start}',
    'html body.den .cc-cell{position:relative;display:flex;flex-direction:column;align-items:stretch;gap:0;min-width:0;padding:0;border:0!important;border-radius:0!important;background:none!important;box-shadow:none!important;color:inherit;text-align:center;font:inherit;overflow:visible;align-self:stretch}html body.den .cc-no{visibility:hidden}',
    'html body.den .cc-cv{position:relative;display:block;width:100%;aspect-ratio:2/3}html body.den .cc-img{position:absolute;inset:0;display:block;overflow:hidden;background:var(--d-bg3,#1b1b1f);border:2px solid rgba(255,255,255,.5)}html body.den .cc-img img{display:block;width:100%;height:100%;object-fit:cover}html body.den .cc-img .ph,html body.den .cc-img .d-ph{width:100%;height:100%;display:flex;flex-direction:column;justify-content:flex-end;padding:6px;gap:2px;text-align:left}html body.den .cc-img .ph-title,html body.den .cc-img .d-ph b{font:400 10px/1.05 var(--b-disp,"Bebas Neue"),Impact,sans-serif;letter-spacing:.04em;text-transform:uppercase;color:var(--d-ink,#f3efe6)}html body.den .cc-img .ph-author,html body.den .cc-img .d-ph i{display:none}',
    'html body.den .cc-cell.done .cc-img{border-color:#fff;box-shadow:3px 3px 0 #000}html body.den .cc-cell.next .cc-img,html body.den .cc-cell.now .cc-img{border-color:#fff;box-shadow:3px 3px 0 var(--d-acc,#ff6a2a)}html body.den .cc-cell.away .cc-img{border-style:dashed}',
    'html body.den .cc-cv .cl-n{position:absolute;left:-5px;top:-7px;font:400 11px/1 var(--b-disp,"Bebas Neue"),Impact,sans-serif;letter-spacing:.06em;background:#fff;color:#111;border:2px solid #111;padding:3px 5px;font-style:normal;z-index:2}html body.den .cc-cv .cl-tag{left:-5px;bottom:-7px;z-index:2}html body.den .cc-ok{position:absolute;right:-6px;bottom:-7px;z-index:2;width:20px;height:20px;border-radius:50%;display:grid;place-items:center;background:var(--d-acc,#ff6a2a);color:#111;border:2px solid #111;font:700 11px/1 system-ui,sans-serif;font-style:normal}',
    'html body.den .cc-w{display:block;margin-top:11px;font:400 8px/1.2 var(--b-mono,"IBM Plex Mono"),monospace;letter-spacing:.08em;text-transform:uppercase;color:var(--d-mute,#8e8e95);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}html body.den .cc-t{display:-webkit-box;-webkit-line-clamp:3;-webkit-box-orient:vertical;overflow:hidden;margin-top:3px;font:400 12.5px/1.15 var(--b-serif,"Den Cormorant","Cormorant Garamond",Georgia,serif);color:var(--d-ink,#f3efe6)}',
    'html body.den .cc-x{position:absolute;z-index:0;pointer-events:none}html body.den .cc-x.h{left:100%;top:50%;width:16px;border-top:2px dotted rgba(243,239,230,.38)}html body.den .cc-row.back .cc-x.h{left:auto;right:100%}html body.den .cc-x.v{left:50%;top:100%;height:26px;border-left:2px dotted rgba(243,239,230,.38)}html body.den .cc-x.go{border-color:var(--d-acc,#ff6a2a);border-style:solid}',
    'html body.den .cc-st .cc-cv{display:grid;place-items:center}html body.den .cc-st .cc-cv b{display:grid;place-items:center;width:100%;aspect-ratio:1;border-radius:50%;border:1.5px dashed var(--d-acc,#ff6a2a);color:var(--d-acc,#ff6a2a);font:400 13px/1.05 var(--b-disp,"Bebas Neue"),Impact,sans-serif;letter-spacing:.1em;text-transform:uppercase;padding:8px}',
    '.cl-nb{margin:6px 0 0;font:400 11px var(--b-mono,"IBM Plex Mono"),monospace;letter-spacing:.04em;color:var(--d-mute,#8e8e95)}',
    'html body.den .cl-stats.c4{grid-template-columns:1fr 1fr}html body.den .cl-blade .cl-wait{left:50%;bottom:12px;transform:translateX(-50%) rotate(-3deg);white-space:nowrap}',
    '.cl-list{display:flex;flex-direction:column;gap:6px}',
    '.cl-rung{display:flex;align-items:center;gap:10px;width:100%;text-align:left;padding:8px 10px;background:var(--d-bg2,#17171b);border:1px solid var(--d-line,#333);border-radius:0!important;color:inherit;font:inherit;position:relative}.cl-rung.done{border-color:rgba(243,239,230,.3)}.cl-rung.away{opacity:.6}',
    'html body.den.blend .cl-rung.next{border:2px solid #fff;box-shadow:4px 4px 0 var(--d-acc,#ff6a2a);opacity:1}',
    '.cl-no{flex:0 0 26px;font:400 22px/1 var(--b-disp,"Bebas Neue"),Impact,sans-serif;color:var(--d-mute,#8e8e95);font-style:normal;text-align:center}.cl-rung.done .cl-no,.cl-rung.next .cl-no{color:var(--d-ink,#f3efe6)}.cl-dot{font-size:18px}',
    '.cl-cv2{flex:0 0 38px;width:38px;height:57px;display:block;overflow:hidden;position:relative;background:var(--d-bg3,#202026);border:1px solid #fff}.cl-cv2 img,.cl-cv2 .ph,.cl-cv2 .d-ph{position:absolute;inset:0;width:100%!important;height:100%!important;object-fit:cover;margin:0}.cl-cv2 .ph,.cl-cv2 .d-ph{display:flex;flex-direction:column;justify-content:flex-end;padding:3px}.cl-cv2 .ph-title,.cl-cv2 .d-ph b,.cl-cv2 .ph-author,.cl-cv2 .d-ph i{display:none}.cl-rung:not(.done):not(.next) .cl-cv2 img,.cl-rung:not(.done):not(.next) .cl-cv2 .d-ph{filter:grayscale(1) brightness(.6)}',
    '.cl-body{flex:1;min-width:0;display:flex;flex-direction:column;gap:2px}.cl-body b{font:400 16px/1.1 var(--b-disp,"Bebas Neue"),Impact,sans-serif;letter-spacing:.04em;text-transform:uppercase;color:var(--d-ink,#f3efe6)}.cl-body i{font:400 10.5px var(--b-mono,"IBM Plex Mono"),monospace;letter-spacing:.04em;text-transform:uppercase;color:var(--d-mute,#8e8e95);font-style:normal}.cl-body em{font:400 11px var(--b-mono,"IBM Plex Mono"),monospace;color:var(--d-acc2,#ffb089);font-style:normal}',
    '.cl-rung .cl-ok{flex:0 0 auto;font:400 20px/1 var(--b-disp,"Bebas Neue"),Impact,sans-serif;color:var(--d-acc,#ff6a2a);font-style:normal}.cl-rung .cl-tag{position:static;transform:rotate(-3deg);flex:0 0 auto}',
    '.cl-ranks{display:flex;flex-wrap:wrap;gap:6px;margin:0 0 16px}.cl-ranks span{display:inline-flex;align-items:center;gap:6px;padding:4px 8px;border:1px solid var(--d-line,#333);font:400 11px var(--b-mono,"IBM Plex Mono"),monospace;letter-spacing:.06em;text-transform:uppercase;color:var(--d-mute,#8e8e95)}.cl-ranks span b{font:400 14px/1 var(--b-disp,"Bebas Neue"),Impact,sans-serif;color:inherit}.cl-ranks span.on{color:#111;background:var(--d-ink,#f3efe6);border-color:var(--d-ink,#f3efe6)}'
  ].join('\n').replace(/(^|\})\s*([^{}]+)\{/g, (m, a, sel) => a + sel.split(',').map(x => { x = x.trim(); return /^html body/.test(x) ? x : 'html body.den ' + x; }).join(',') + '{'); document.head.appendChild(css);
})();

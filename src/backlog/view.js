
  // ---------- his books: a finished book is a card, an unread book he owns is an enemy on its shelf ----------
  const APP = typeof getOverride === 'function' && typeof setOverride === 'function';
  const L63 = window.L63 = { CORE };
  const elOf = (g, t) => /LitRPG|Mytholog/i.test(g) ? 0 : /Science|High Fantasy/i.test(g) ? 1 : /Epic|Children|Cosmere/i.test(g) ? 2 : /Romant|Romance|Poetry|Nonfiction/i.test(g) ? 3 : /Grimdark|Urban|Mystery|Thriller|Literary|Comics|Horror/i.test(g) ? 4 : hashOf(t) % 5;
  const shelfOf = g => String(g || '').replace(/^(Fantasy|Nonfiction) — /, '') || 'Unsorted';
  const BADGED = ['Epic Fantasy', 'Romantasy', 'High Fantasy', 'Grimdark', 'Science Fiction', 'Literary Fiction', 'Mythology & Retellings', 'Poetry', 'Mystery & Thriller', 'Urban Fantasy', 'LitRPG', 'Odds and ends'];
  const slug = s => s.toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_|_$/g, '');
  const h = s => (typeof esc === 'function' ? esc(String(s)) : String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c])));
  const short = t => { try { return shortTitle(t); } catch (e) { return String(t).split(':')[0]; } };
  const cov = t => { try { return coverInner(t); } catch (e) { return ''; } };
  const num = n => Math.round(n).toLocaleString('en-US');
  const dayOf = n => { const d = new Date(Date.now() - n * 864e5); return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0'); };
  let LIB = null;
  function lib() { const out = { cards: [], by: {}, shelves: [] }; if (!APP) return out;
    let B = []; try { if (L4.clear) L4.clear(); B = L4.ctx().B; } catch (e) { return out; } let OWN = new Set(); try { OWN = new Set(L22.owned()); } catch (e) {}
    const read = B.filter(b => b.read).sort((a, b) => (a.fin || '9') < (b.fin || '9') ? -1 : (a.fin || '9') > (b.fin || '9') ? 1 : a.t < b.t ? -1 : 1);
    read.forEach((b, k) => { const dcc = b.series === 'Dungeon Crawler Carl' && (b.num === 1 || b.t === 'Dungeon Crawler Carl');
      const c = cardFrom({ t: b.t, el: elOf(b.genre, b.t), mins: Math.round((b.hours || 8) * 60), rating: b.myR || b.gr || 0, sk: dcc ? 'missile' : null, ld: dcc ? 'combo' : null });
      c.no = k + 1; c.series = b.series || ''; c.bk = b.num || 0; c.author = b.author || ''; c.genre = shelfOf(b.genre); c.reads = b.reads || 1; out.cards.push(c); out.by[b.t] = c; });
    const G = {}; B.filter(b => !b.read && OWN.has(b.t)).forEach(b => { (G[shelfOf(b.genre)] = G[shelfOf(b.genre)] || []).push({ t: b.t, el: elOf(b.genre, b.t), mins: Math.round((b.hours || 8) * 60) }); });
    const odd = []; Object.keys(G).forEach(k => { if (G[k].length < 4 || !BADGED.includes(k)) { odd.push(...G[k]); delete G[k]; } }); if (odd.length >= 4) G['Odds and ends'] = odd;
    Object.keys(G).forEach(name => { const L = G[name].sort((a, b) => a.mins - b.mins || (a.t < b.t ? -1 : 1)), floors = [];
      for (let i = 0; i < L.length; i += 7) { let ch = L.slice(i, i + 7); if (ch.length < 4 && floors.length) { const p = floors.pop(); ch = p.all.concat(ch); } const waves = []; for (let k = 0; k < ch.length - 1; k += 2) waves.push(ch.slice(k, Math.min(k + 2, ch.length - 1))); waves.push([ch[ch.length - 1]]); floors.push({ all: ch, waves, boss: ch[ch.length - 1] }); }
      floors.forEach((f, k) => { f.no = k + 1; f.tier = 1 + K.step * k; });
      const cnt = [0, 0, 0, 0, 0]; L.forEach(x => cnt[x.el]++); out.shelves.push({ name, n: L.length, floors, el: name === 'Odds and ends' ? 3 : cnt.indexOf(Math.max(...cnt)) }); });
    out.shelves.sort((a, b) => b.n - a.n); return out; }

  // ---------- what is kept: his own row "backlog". Team, floors cleared (by the boss's title), what a boss has left ----------
  const blank = () => ({ v: 1, team: [], done: {}, chip: {} });
  function load() { let o = null; try { o = APP ? getOverride('backlog') : null; } catch (e) {} return o && o.v === 1 ? Object.assign(blank(), JSON.parse(JSON.stringify(o))) : blank(); }
  let D = load();
  // a first open can start before his Sheet has answered: before every save, fold in what the row holds that this screen has not seen
  function fold() { let o = null; try { o = getOverride('backlog'); } catch (e) {} if (!o || o.v !== 1) return;
    Object.keys(o.done || {}).forEach(k => { if (!D.done[k]) D.done[k] = o.done[k]; }); Object.keys(o.chip || {}).forEach(k => { if (!D.done[k] && (D.chip[k] == null || o.chip[k] < D.chip[k])) D.chip[k] = o.chip[k]; }); if (!D.team.length && (o.team || []).length) D.team = o.team.slice(); }
  function keep() { try { if (APP) { fold(); setOverride('backlog', D); } } catch (e) { console.warn('l63 keep', e); } }
  function team() { let T = D.team.filter(t => LIB.by[t]).slice(0, 6);
    if (!T.length) { const per = {}; LIB.cards.slice().sort((a, b) => b.atk - a.atk || b.hp - a.hp).forEach(c => { if (T.length < 6 && (per[c.el] || 0) < 2) { per[c.el] = (per[c.el] || 0) + 1; T.push(c.t); } }); }
    return T.map(t => LIB.by[t]); }
  const cur = s => s.floors.find(f => !D.done[f.boss.t]) || null;
  // his logs give the team a lift: never from playing more
  function boosts() { const o = { atk: 1, hp: 1, time: 0, read: false, steel: false, life: false }; if (!APP) return o; const t = dayOf(0), w = dayOf(6), d = x => String(x || '').slice(0, 10);
    try { if (L35.all().some(x => d(x.d) === t && x.min > 0)) o.read = true; } catch (e) {} try { if (L60.events().some(x => !x.out && d(x.d) === t)) o.read = true; } catch (e) {}
    try { if (((getOverride('steelx') || {}).sessions || []).some(x => d(x.date) >= w && d(x.date) <= t)) o.steel = true; } catch (e) {}
    try { const I = (getOverride('log') || {}).items || []; if (I.some(x => x.k === 'steel' && d(x.d) >= w && d(x.d) <= t)) o.steel = true; if (I.some(x => x.k !== 'steel' && d(x.d) === t)) o.life = true; } catch (e) {}
    try { if (((getOverride('sleepd') || {}).nights || {})[t] || ((getOverride('steps') || {}).days || {})[t] || ((getOverride('jr:days') || {}).n || []).some(x => d(x.d) === t)) o.life = true; } catch (e) {}
    if (o.read) o.atk = 1.25; if (o.steel) o.hp = 1.2; if (o.life) o.time = 1; return o; }
  L63.boosts = boosts; L63.lib = () => LIB || (LIB = lib()); L63.data = () => D;

  // ---------- the screen ----------
  const RM = () => { try { return matchMedia('(prefers-reduced-motion: reduce)').matches; } catch (e) { return false; } };
  const wait = ms => new Promise(r => setTimeout(r, RM() ? Math.min(ms, 30) : ms));
  let root = null, view = 'hub', busy = false, F = null, B = null, FL = null, SH = null, wave = 0, BO = null, qc = 60, drag = null, timer = 0, pick = null, filt = -1;
  const els = new Map(), q = s => root.querySelector(s), qa = s => root.querySelectorAll(s);
  const orb = (e, cls) => '<i class="' + (cls || 'q-mini') + ' o-' + e + '"></i>';
  const stars = n => '<span class="q-stars">' + '★'.repeat(n) + '</span>';
  const slot = (c, k, extra) => '<button class="q-slot e-' + c.el + '" data-l63="' + (extra || 'card') + '" data-t="' + h(c.t) + '"' + (k != null ? ' data-i="' + k + '"' : '') + ' aria-label="' + h(short(c.t)) + '"><span class="q-cov" data-cvt="' + h(c.t) + '">' + cov(c.t) + '</span>' + orb(c.el) + (k === 0 ? '<em class="q-lead">Lead</em>' : '') + '<b class="q-cd"></b></button>';
  const tag = (p, cls) => '<span class="q-tag ' + (cls || '') + ' ' + p + '">' + p + '</span>';
  function mount() { if (root) return; root = document.createElement('div'); root.className = 'd-l63'; root.id = 'l63';
    root.innerHTML = '<div class="q-v q-hub"></div><div class="q-v q-cards"></div><div class="q-v q-one"></div><div class="q-v q-fight"><div class="q-hud"></div><div class="q-stage"><div class="q-shv"></div><div class="q-flr"></div><div class="q-foes"></div><div class="q-say" role="status"></div></div><div class="q-team"></div><div class="q-hp"><span class="q-fill"></span>' + orb(5, 'q-hrt') + '<b class="q-n"></b><div class="q-fx"></div></div><div class="q-time"><i></i></div><div class="q-board"><em class="q-combo"></em></div></div><div class="q-sheet"><div class="q-box"></div></div>';
    document.body.appendChild(root); wire(); }
  function show(v) { view = v; root.dataset.v = v; }
  L63.open = function () { mount(); D = load(); LIB = lib(); root.classList.add('on'); hub(); again(8); };
  // opened before his Sheet has answered: look again until his books are there
  function again(n) { if (LIB.cards.length || n <= 0 || typeof SYNC82 === 'undefined' || SYNC82.state !== 'wait') return; setTimeout(() => { if (!root.classList.contains('on') || view !== 'hub') return; D = load(); LIB = lib(); hub(); again(n - 1); }, 1500); }
  L63.close = function () { if (!root) return; if (F) leave(false); root.classList.remove('on'); q('.q-sheet').classList.remove('on'); };
  L63.state = () => ({ on: !!(root && root.classList.contains('on')), view, busy, wave, floor: FL ? FL.no : 0, shelf: SH ? SH.name : '', hp: F ? F.team.hp : 0, max: F ? F.team.max : 0, foes: F ? F.foes.map(f => ({ t: f.t, hp: f.hp, max: f.max, alive: f.alive, cd: f.cd, shields: f.shields, broken: f.broken })) : [], board: B ? B.map(p => p ? p.t : -1) : [], qc });
  function sheet(html) { q('.q-box').innerHTML = html; q('.q-sheet').classList.add('on'); }
  const unsheet = () => q('.q-sheet').classList.remove('on');

  function hub() { show('hub'); F = null; const T = team(), bo = boosts(), tm = T.length ? teamOf(T, bo) : null;
    q('.q-hub').innerHTML = '<div class="q-bar"><button class="q-plate q-gold q-x" data-l63="close" aria-label="Close">✕</button><b class="q-ttl">Backlog</b><button class="q-plate" data-l63="cards">Cards · ' + LIB.cards.length + '</button></div>' +
      '<div class="q-boost"><span class="q-tag' + (bo.read ? ' on' : '') + '">Read today · ATK +25%</span><span class="q-tag' + (bo.steel ? ' on' : '') + '">Steel this week · HP +20%</span><span class="q-tag' + (bo.life ? ' on' : '') + '">Logged today · +1 s</span></div>' +
      (T.length ? '<div class="q-teamrow">' + T.map((c, k) => slot(c, k)).join('') + '</div><div class="q-tstat"><span>HP <b>' + num(tm.max) + '</b></span><span>RCV <b>' + num(tm.rcv) + '</b></span><span>' + h(T[0].series || short(T[0].t)) + ' · ' + h(LD[T[0].ld].text(T[0].el)) + '</span></div>' : '<p class="q-none">Finish a book to get your first card.</p>') +
      '<div class="q-shelves">' + (LIB.shelves.length ? LIB.shelves.map((s, i) => { const f = cur(s), b = f ? f.boss : s.floors[s.floors.length - 1].boss;
        return '<button class="q-shelf e-' + s.el + '" data-l63="shelf" data-i="' + i + '"' + (T.length ? '' : ' disabled') + '><span class="q-cov" data-cvt="' + h(b.t) + '">' + cov(b.t) + '</span><span class="q-sn"><b>' + h(s.name) + '</b><em>' + (f ? 'Floor ' + f.no + ' of ' + s.floors.length : 'Cleared') + ' · ' + s.n + ' books</em></span><span class="q-tag q-rate" data-rate="' + i + '">' + (f ? '' : 'Done') + '</span></button>'; }).join('') : '<p class="q-none">No unread books on your shelves.</p>') + '</div>';
    if (T.length) LIB.shelves.forEach((s, i) => setTimeout(() => { if (view !== 'hub') return; const f = cur(s), e = q('[data-rate="' + i + '"]'); if (!f || !e) return; const lab = rate(s, f, T, bo); e.textContent = lab; e.classList.add(lab); }, 40 + i * 25)); }
  const rate = (s, f, T, bo) => LABEL(winRate(T, f.waves, f.tier, bo, 30, D.chip[f.boss.t]));
  function floorSheet(i) { SH = LIB.shelves[i]; const f = cur(SH); if (!f) return; const T = team(), bo = boosts(), lab = rate(SH, f, T, bo), b = foeFrom(f.boss, f.tier, true), left = D.chip[f.boss.t];
    sheet('<div class="q-fs e-' + b.el + '"><span class="q-cov q-big" data-cvt="' + h(b.t) + '">' + cov(b.t) + '</span><div class="q-fsr"><b class="q-h">' + h(short(b.t)) + '</b><em>' + h(SH.name) + ' · Floor ' + f.no + ' of ' + SH.floors.length + '</em><span>' + tag(lab) + '<span class="q-tag">' + f.waves.length + ' battles</span></span>' +
      '<div class="q-ehp"><i style="width:' + Math.round(100 * (left == null ? 1 : left)) + '%"></i></div><p>' + h(b.line) + '</p></div></div><div class="q-acts"><button class="q-plate" data-l63="unsheet">Not now</button><button class="q-plate q-gold" data-l63="fight">Fight</button></div>'); }

  function cards() { show('cards'); const L = LIB.cards.filter(c => filt < 0 || c.el === filt).sort((a, b) => b.atk - a.atk || a.no - b.no), on = new Set(team().map(c => c.t));
    q('.q-cards').innerHTML = '<div class="q-bar"><button class="q-plate q-gold" data-l63="hub">‹ Back</button><b class="q-ttl">Cards</b><span class="q-cnt">' + L.length + '</span></div><div class="q-filt"><button class="q-plate' + (filt < 0 ? ' q-on' : '') + '" data-l63="filt" data-i="-1">All</button>' + [0, 1, 2, 3, 4].map(e => '<button class="q-plate' + (filt === e ? ' q-on' : '') + '" data-l63="filt" data-i="' + e + '" aria-label="' + NAME[e] + '">' + orb(e) + '</button>').join('') + '</div>' +
      '<div class="q-grid">' + L.map(c => slot(c, null).replace('class="q-slot', 'class="q-slot' + (on.has(c.t) ? ' q-in' : ''))).join('') + '</div>'; }
  function one(t) { const c = LIB.by[t]; if (!c) return; show('one'); pick = t; const T = team(), k = T.findIndex(x => x.t === t), S = SK[c.sk];
    q('.q-one').innerHTML = '<div class="q-bar"><button class="q-plate q-gold" data-l63="cards">‹ Back</button>' + stars(c.stars) + '<span class="q-cnt">No. ' + String(c.no).padStart(3, '0') + '</span></div>' +
      '<div class="q-title e-' + c.el + '">' + orb(c.el, 'q-to') + '<b>' + h(short(c.t)) + '</b></div><div class="q-tags"><span class="q-tag">' + h(c.genre) + '</span>' + (c.series && c.bk ? '<span class="q-tag">Book ' + c.bk + '</span>' : '') + (c.reads > 1 ? '<span class="q-tag">Read ' + c.reads + '×</span>' : '') + (k === 0 ? '<span class="q-tag on">Leader</span>' : k > 0 ? '<span class="q-tag on">On team</span>' : '') + '</div>' +
      '<div class="q-art e-' + c.el + '"><div class="q-rays"></div><div class="q-ring"></div><span class="q-cov q-hero" data-cvt="' + h(c.t) + '">' + cov(c.t) + '</span></div>' +
      '<div class="q-panel"><div class="q-st"><span>HP</span><b>' + num(c.hp) + '</b><span>ATK</span><b>' + num(c.atk) + '</b><span>RCV</span><b>' + num(c.rcv) + '</b></div><div class="q-el">' + orb(c.el, 'q-to') + '<b>' + NAME[c.el] + '</b></div></div>' +
      '<div class="q-sk"><div class="q-skh"><span class="q-lab s">Skill</span><b>' + h(S.name(c.el)) + '</b><i>' + S.cd + ' turns</i></div><p>' + h(S.text(c.el)) + '</p></div>' +
      '<div class="q-sk"><div class="q-skh"><span class="q-lab l">Leader</span><b>' + h(c.series || short(c.t)) + '</b></div><p>' + h(LD[c.ld].text(c.el)) + '</p></div>' +
      '<div class="q-acts">' + (k === 0 ? '' : '<button class="q-plate" data-l63="lead">Make leader</button>') + (k >= 0 ? (T.length > 1 ? '<button class="q-plate" data-l63="off">Take off team</button>' : '') : '<button class="q-plate q-gold" data-l63="add">Add to team</button>') + '</div>'; }
  function setTeam(L) { D.team = L.map(c => c.t || c); keep(); }
  function act(a, el) { const T = team(), c = LIB.by[pick];
    if (a === 'lead') { setTeam([c].concat(T.filter(x => x.t !== c.t)).slice(0, 6)); one(pick); }
    else if (a === 'off') { setTeam(T.filter(x => x.t !== c.t)); one(pick); }
    else if (a === 'add') { if (T.length < 6) { setTeam(T.concat([c])); one(pick); } else sheet('<b class="q-h">Swap with</b><div class="q-teamrow">' + T.map((x, k) => slot(x, k, 'swap')).join('') + '</div><div class="q-acts"><button class="q-plate" data-l63="unsheet">Keep the team</button></div>'); }
    else if (a === 'swap') { const k = +el.dataset.i; T[k] = c; setTeam(T); unsheet(); one(pick); } }

  // ---------- the fight ----------
  function fit() { const st = getComputedStyle(root), top = parseFloat(st.paddingTop) || 0, bot = parseFloat(st.paddingBottom) || 0, W = root.clientWidth, H = root.clientHeight - top - bot;
    qc = Math.max(36, Math.floor(Math.min(W / 6, (H - 50 - 150 - (W / 6 + 16) - 46 - 12) / 5))); root.style.setProperty('--qc', qc + 'px'); root.style.setProperty('--sh', Math.min(330, q('.q-stage').clientHeight) + 'px'); }
  function start() { unsheet(); const f = cur(SH); if (!f) return; FL = f; BO = boosts(); const T = teamOf(team(), BO), R = rng32((Date.now() ^ (Math.random() * 1e9)) >>> 0); F = fightOf(T, [], BO, R); B = fresh(R); wave = -1; busy = false; show('fight'); fit();
    for (const e of els.values()) e.remove(); els.clear(); q('.q-team').innerHTML = T.cards.map((c, k) => slot(c, k, 'skill')).join(''); sync(true); next(); }
  function next() { wave++; const last = wave === FL.waves.length - 1; F.foes = FL.waves[wave].map((o, i) => foeFrom(o, FL.tier, last && i === FL.waves[wave].length - 1)); F.target = -1;
    if (last) { const b = F.foes[F.foes.length - 1], left = D.chip[b.t]; if (left != null) { b.hp = Math.max(1, Math.round(b.max * left)); if (b.hp <= b.max / 2) { b.p2 = true; b.every = Math.max(1, b.every - 1); b.shMax++; b.shields = b.shMax; } } F.dealt = 0; }
    q('.q-hud').innerHTML = '<span class="q-plate q-name">' + h(SH.name) + ' · Floor ' + FL.no + '</span><span class="q-plate">Battle ' + (wave + 1) + ' / ' + FL.waves.length + '</span><button class="q-plate q-gold" data-l63="menu">Menu</button>';
    q('.q-foes').innerHTML = F.foes.map((f, i) => '<button class="q-foe e-' + f.el + (f.boss ? ' q-boss' : '') + '" data-l63="foe" data-i="' + i + '" aria-label="' + h(short(f.t)) + '"><span class="q-turn"><b></b></span><span class="q-book" data-cvt="' + h(f.t) + '">' + cov(f.t) + '</span>' + (f.boss ? '<span class="q-sh"></span>' : '') + '<span class="q-ehp"><i></i></span><span class="q-fx"></span></button>').join('');
    paint(); if (last && F.foes[F.foes.length - 1].line) say(F.foes[F.foes.length - 1].line, 2600); }
  function paint() { if (!F) return; const T = F.team;
    qa('.q-foe').forEach((e, i) => { const f = F.foes[i]; if (!f) return; e.classList.toggle('q-dead', !f.alive); e.classList.toggle('q-aim', F.target === i && f.alive); e.classList.toggle('q-brk', f.broken > 0); e.querySelector('.q-ehp i').style.width = (100 * f.hp / f.max) + '%';
      const t = e.querySelector('.q-turn'); t.classList.toggle('q-now', f.cd <= 1 || f.wind === 1); t.querySelector('b').textContent = f.broken ? 'Broken' : f.wind ? 'Heavy blow in ' + f.wind : f.cd;
      const s = e.querySelector('.q-sh'); if (s) s.innerHTML = Array.from({ length: f.shMax }, (_, k) => '<i class="q-pip' + (k < f.shields ? '' : ' x') + '"></i>').join('') + f.weak.map(w => f.seen.includes(w) ? orb(w) : '<u>?</u>').join('') + (f.p2 ? '<em>Enraged</em>' : ''); });
    qa('.q-team .q-slot').forEach((e, k) => { const c = T.cards[k]; if (!c) return; e.classList.toggle('q-rdy', c.cd === 0); e.querySelector('.q-cd').textContent = c.cd === 0 ? 'Skill' : c.cd; });
    q('.q-fill').style.width = (100 * T.hp / T.max) + '%'; q('.q-hp .q-n').textContent = num(T.hp) + '/' + num(T.max); q('.q-hp').classList.toggle('q-grd', F.guard > 0); }
  let sayT = 0; function say(txt, ms) { const e = q('.q-say'); e.textContent = txt; e.classList.add('on'); clearTimeout(sayT); sayT = setTimeout(() => e.classList.remove('on'), ms || 1100); }
  function fl(host, txt, cls) { if (!host) return; const e = document.createElement('em'); e.className = 'q-fl ' + (cls || ''); e.textContent = txt; host.appendChild(e); setTimeout(() => e.remove(), 950); }
  const xy = i => 'translate3d(' + (i % COLS) * qc + 'px,' + ((i / COLS) | 0) * qc + 'px,0)';
  function sync(instant) { const bd = q('.q-board'), seen = new Set();
    B.forEach((p, i) => { if (!p) return; seen.add(p.id); let e = els.get(p.id);
      if (!e) { e = document.createElement('i'); e.className = 'q-o'; bd.appendChild(e); els.set(p.id, e); if (p.from != null && !instant) { e.style.transition = 'none'; e.style.transform = 'translate3d(' + (i % COLS) * qc + 'px,' + p.from * qc + 'px,0)'; void e.offsetWidth; e.style.transition = ''; } }
      p.from = null; if (e._t !== p.t) { e.classList.remove('o-' + e._t); e.classList.add('o-' + p.t); e._t = p.t; } if (!drag || drag.p !== p) e.style.transform = xy(i); });
    for (const [id, e] of els) if (!seen.has(id)) { e.remove(); els.delete(id); } }
  async function showEv(ev) { const foeEl = i => qa('.q-foe')[i]; let last = -1;
    for (const e of ev) {
      if (e.k === 'hit') { const fe = foeEl(e.foe), c = F.team.cards[e.from], se = qa('.q-team .q-slot')[e.from]; if (se) { se.classList.add('q-go'); setTimeout(() => se.classList.remove('q-go'), 260); } fl(fe && fe.querySelector('.q-fx'), num(e.n), 'e-' + (c ? c.el : 0) + (e.adv > 1 ? ' q-up' : e.adv < 1 ? ' q-dn' : '')); if (fe) fe.querySelector('.q-ehp i').style.width = Math.max(0, 100 * (F.foes[e.foe].hp / F.foes[e.foe].max)) + '%'; if (last !== e.from) await wait(130); last = e.from; }
      else if (e.k === 'heal') { fl(q('.q-hp .q-fx'), '+' + num(e.n), 'q-heal'); paint(); await wait(160); }
      else if (e.k === 'break') { say('Break'); paint(); await wait(420); }
      else if (e.k === 'chip') paint();
      else if (e.k === 'phase') { say('Enraged'); paint(); await wait(420); }
      else if (e.k === 'dead') { const fe = foeEl(e.foe); if (fe) fe.classList.add('q-dead'); await wait(260); }
      else if (e.k === 'strike') { const fe = foeEl(e.foe); if (fe) { fe.classList.add('q-lunge'); setTimeout(() => fe.classList.remove('q-lunge'), 300); } if (e.name) say(e.name); fl(q('.q-hp .q-fx'), '−' + num(e.n), 'q-hurt'); paint(); await wait(380); }
      else if (e.k === 'regen') { const fe = foeEl(e.foe); fl(fe && fe.querySelector('.q-fx'), '+' + num(e.n), 'q-heal'); paint(); await wait(200); }
      else if (e.k === 'wind') { say('Heavy blow in 2'); paint(); await wait(420); } }
    paint(); }
  function combo(n) { const e = q('.q-combo'); e.textContent = n ? n + (n === 1 ? ' Combo' : ' Combos') : ''; e.classList.toggle('on', !!n); }
  async function endMove() { busy = true; const gen = settle(B, F.R); let r = gen.next(), n = 0;
    while (!r.done) { const v = r.value;
      if (v.k === 'combos') { for (const c of v.list) { n++; for (const id of c.ids) { const e = els.get(id); if (e) e.classList.add('q-gone'); } combo(n); await wait(170); } await wait(90); for (const c of v.list) for (const id of c.ids) { const e = els.get(id); if (e) { e.remove(); els.delete(id); } } }
      else { sync(); await wait(270); }
      r = gen.next(); }
    await showEv(playerTurn(F, r.value)); setTimeout(() => combo(0), 500); await after(); }
  async function after() { let res = result(F);
    if (!res) { await wait(200); await showEv(foeTurn(F)); res = result(F); }
    if (res === 'win') { await wait(350); if (wave < FL.waves.length - 1) { next(); busy = false; return; } return won(); }
    if (res === 'lose') { await wait(350); return lost(); }
    busy = false; }
  function leave(chipIt) { if (F && FL && wave === FL.waves.length - 1 && chipIt !== false) { const b = F.foes[F.foes.length - 1]; if (b && b.alive && F.dealt > 0) { const left = b.hp / b.max; if (D.chip[b.t] == null || left < D.chip[b.t]) { D.chip[b.t] = Math.round(left * 1000) / 1000; keep(); } } } F = null; B = null; busy = false; clearTimeout(timer); drag = null; }
  function won() { const b = FL.boss, first = !D.done[b.t], firstOnShelf = !SH.floors.some(f => D.done[f.boss.t]); D.done[b.t] = { d: dayOf(0), s: SH.name, f: FL.no }; delete D.chip[b.t]; keep(); F = null; B = null; busy = false;
    try { if (first && window.L4 && L4.clear) { L4.clear(); L4.sync(true); } } catch (e) {}
    sheet('<div class="q-won e-' + b.el + '"><div class="q-rays"></div><span class="q-cov q-big q-medal" data-cvt="' + h(b.t) + '">' + cov(b.t) + '</span><b class="q-h">Floor ' + FL.no + ' cleared</b><em>' + h(SH.name) + (firstOnShelf && BADGED.includes(SH.name) ? ' · badge earned' : '') + '</em></div><div class="q-acts"><button class="q-plate" data-l63="hub">Shelves</button>' + (cur(SH) ? '<button class="q-plate q-gold" data-l63="again">Next floor</button>' : '') + '</div>'); }
  function lost() { const b = F.foes[F.foes.length - 1], boss = wave === FL.waves.length - 1 && b && b.boss; leave(true); const left = boss ? D.chip[b.t] : null;
    sheet('<b class="q-h">Down on floor ' + FL.no + '</b>' + (left != null ? '<p>' + h(short(b.t)) + ' keeps ' + Math.round(left * 100) + '%.</p>' : '') + '<div class="q-acts"><button class="q-plate q-gold" data-l63="hub">Shelves</button></div>'); }
  function skillSheet(k) { if (!F || busy) return; const c = F.team.cards[k], S = SK[c.sk]; pick = k;
    sheet('<div class="q-fs e-' + c.el + '"><span class="q-cov q-big" data-cvt="' + h(c.t) + '">' + cov(c.t) + '</span><div class="q-fsr"><b class="q-h">' + h(S.name(c.el)) + '</b><em>' + h(short(c.t)) + '</em><p>' + h(S.text(c.el)) + '</p><span><span class="q-tag' + (c.cd ? '' : ' on') + '">' + (c.cd ? c.cd + ' turns' : 'Ready') + '</span></span></div></div><div class="q-acts"><button class="q-plate" data-l63="unsheet">Close</button>' + (c.cd ? '' : '<button class="q-plate q-gold" data-l63="use">Use</button>') + '</div>'); }
  async function use() { unsheet(); if (!F || busy) return; busy = true; const r = useSkill(F, pick, B); if (!r) { busy = false; return; } say(r.name); if (r.board) sync(); await showEv(r.ev); paint(); const res = result(F); if (res) return after(); busy = false; }

  // dragging: the held orb goes where the finger goes and trades places with every orb it crosses. The clock starts on the first trade
  const cellAt = e => { const r = q('.q-board').getBoundingClientRect(); return Math.max(0, Math.min(ROWS - 1, Math.floor((e.clientY - r.top) / qc))) * COLS + Math.max(0, Math.min(COLS - 1, Math.floor((e.clientX - r.left) / qc))); };
  function follow(e) { const r = q('.q-board').getBoundingClientRect(), el = els.get(drag.p.id); if (el) el.style.transform = 'translate3d(' + (e.clientX - r.left - qc / 2) + 'px,' + (e.clientY - r.top - qc * .62) + 'px,0) scale(1.12)'; }
  function release() { if (!drag) return; const d = drag; drag = null; clearTimeout(timer); const tb = q('.q-time'); tb.classList.remove('on'); const el = els.get(d.p.id); if (el) { el.classList.remove('q-held'); el.style.transform = xy(d.cell); } if (d.moved) endMove(); }
  function wire() { const bd = q('.q-board');
    bd.addEventListener('pointerdown', e => { if (busy || !F || drag) return; e.preventDefault(); const c = cellAt(e); if (!B[c]) return; try { bd.setPointerCapture(e.pointerId); } catch (x) {} drag = { p: B[c], cell: c, moved: 0, id: e.pointerId }; els.get(drag.p.id).classList.add('q-held'); follow(e); });
    bd.addEventListener('pointermove', e => { if (!drag || e.pointerId !== drag.id) return; e.preventDefault(); follow(e); const to = cellAt(e);
      while (drag && to !== drag.cell) { const r0 = (drag.cell / COLS) | 0, c0 = drag.cell % COLS, n = (r0 + Math.sign(((to / COLS) | 0) - r0)) * COLS + c0 + Math.sign(to % COLS - c0), o = B[n]; B[n] = drag.p; B[drag.cell] = o; const oe = els.get(o.id); if (oe) oe.style.transform = xy(drag.cell); drag.cell = n;
        if (!drag.moved++) { const ms = (5 + F.boost.time + F.extra) * 1000, tb = q('.q-time'), bar = tb.querySelector('i'); bar.style.transition = 'none'; bar.style.width = '100%'; void bar.offsetWidth; bar.style.transition = 'width ' + ms + 'ms linear'; bar.style.width = '0%'; tb.classList.add('on'); timer = setTimeout(release, ms); } } });
    const up = e => { if (drag && e.pointerId === drag.id) release(); }; bd.addEventListener('pointerup', up); bd.addEventListener('pointercancel', up);
    addEventListener('resize', () => { if (root.classList.contains('on') && view === 'fight' && B) { fit(); sync(true); } }); }
  document.addEventListener('click', e => { const el = e.target.closest && e.target.closest('[data-l63]'); if (!el) return; const a = el.dataset.l63; e.preventDefault(); if (el.disabled) return;
    if (a === 'open') return L63.open(); if (!root) return;
    if (a === 'close') L63.close(); else if (a === 'hub') { unsheet(); hub(); } else if (a === 'cards') cards(); else if (a === 'filt') { filt = +el.dataset.i; cards(); } else if (a === 'card') one(el.dataset.t);
    else if (a === 'lead' || a === 'off' || a === 'add' || a === 'swap') act(a, el); else if (a === 'unsheet') unsheet(); else if (a === 'shelf') floorSheet(+el.dataset.i); else if (a === 'fight') start(); else if (a === 'again') { unsheet(); start(); }
    else if (a === 'skill') skillSheet(+el.dataset.i); else if (a === 'use') use(); else if (a === 'foe') { if (F && !busy) { const i = +el.dataset.i; F.target = F.target === i ? -1 : i; paint(); } }
    else if (a === 'menu') { if (!busy) sheet('<b class="q-h">' + h(SH.name) + ' · Floor ' + FL.no + '</b><div class="q-acts"><button class="q-plate" data-l63="quit">Leave the fight</button><button class="q-plate q-gold" data-l63="unsheet">Keep playing</button></div>'); }
    else if (a === 'quit') { leave(true); unsheet(); hub(); } });
  L63._move = async path => { if (!F || busy) return false; let c = path[0]; const p = B[c]; for (let k = 1; k < path.length; k++) { const n = path[k], o = B[n]; B[n] = p; B[c] = o; c = n; } sync(true); await endMove(); return true; };   // for the tests: one drag along a path of cells
  L63._board = L => { if (!F) return; for (let i = 0; i < NC; i++) B[i] = mk(L[i]); sync(true); };
  L63._ready = k => { if (F) { F.team.cards[k].cd = 0; paint(); } };
  L63._wave = () => { if (F) { wave = FL.waves.length - 2; next(); } };
  L63._hurt = fr => { if (!F) return; const f = F.foes[F.foes.length - 1], n = Math.round(f.max * fr); f.hp = Math.max(1, f.hp - n); F.dealt += n; paint(); };
  L63._end = w => { if (!F) return; if (w) { F.foes.forEach(f => { f.alive = false; f.hp = 0; }); wave = FL.waves.length - 1; return won(); } F.team.hp = 0; return lost(); };

  // ---------- the way in: a chip beside Look, on the first screen of Home ----------
  try { if (window.L11 && L11.head) { const _h = L11.head; L11.head = function () { const r = _h.apply(this, arguments); try { const hero = document.querySelector('header.hero'), d = hero && hero.querySelector('.d-head'); if (d && hero.classList.contains('b-home') && !d.querySelector('.d-l63chip')) d.insertAdjacentHTML('beforeend', '<button class="d-l63chip" data-l63="open">Backlog</button>'); } catch (e) { console.warn('l63 head', e); } return r; }; try { L11.head(); } catch (e) {} } } catch (e) {}
  // a newer build waits while the game is open
  try { if (window.L44 && L44.quiet) { const _q = L44.quiet; L44.quiet = function () { if (root && root.classList.contains('on')) return false; return _q.apply(this, arguments); }; } } catch (e) {}
  // a badge for each shelf, earned with its first floor
  try { if (window.L4 && L4.defs && !L4.defs.some(d => d.id === 'backlog_' + slug(BADGED[0]))) { const I = typeof L4_ICONS !== 'undefined' ? L4_ICONS : window.L4_ICONS;
      BADGED.forEach(name => { const id = 'backlog_' + slug(name), e = name === 'Odds and ends' ? 3 : elOf(name, name); if (I) I[id] = '<image href="' + orbURL(e) + '" x="6" y="6" width="88" height="88"/>';
        L4.defs.push({ cat: 'meta', id, name, sub: 'Backlog', desc: 'Clear a floor of the ' + name + ' shelf in Backlog', th: [1], icon: id, hue: [14, 210, 130, 46, 270][e], single: 'gold', meta: () => { let o = {}; try { o = load().done || {}; } catch (x) {} return Object.keys(o).filter(k => o[k] && o[k].s === name).map(k => ({ t: k, k: 'note', d: o[k].d || null, sub: name + ' floor ' + o[k].f })); } }); });
      if (L4.SECTIONS && L4.SECTIONS.all) L4.SECTIONS.all.push(['Backlog', BADGED.map(n => 'backlog_' + slug(n))]); if (L4.clear) L4.clear(); } } catch (e) { console.warn('l63 badges', e); }


  // ---------- engine: the board, combos, the fight's sums. No screen in here, so it runs in Node for the tests and the tuning ----------
  const COLS = 6, ROWS = 5, NC = COLS * ROWS, ELS = ['fire', 'water', 'wood', 'light', 'dark', 'heart'], NAME = ['Fire', 'Water', 'Wood', 'Light', 'Dark', 'Heart'];
  let PID = 1;
  function rng32(s) { let a = s >>> 0; return () => { a |= 0; a = a + 0x6D2B79F5 | 0; let t = Math.imul(a ^ a >>> 15, 1 | a); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }
  function hashOf(s) { let h = 2166136261; s = String(s); for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); } return h >>> 0; }
  const mk = (t, from) => ({ id: PID++, t, from: from == null ? null : from });
  const pick6 = R => (R() * 6) | 0;

  // every cell that sits in a line of three or more of its colour
  function marks(b) { const m = new Uint8Array(NC);
    for (let r = 0; r < ROWS; r++) for (let c = 0; c < COLS - 2; c++) { const i = r * COLS + c, p = b[i]; if (p && b[i + 1] && b[i + 2] && b[i + 1].t === p.t && b[i + 2].t === p.t) m[i] = m[i + 1] = m[i + 2] = 1; }
    for (let c = 0; c < COLS; c++) for (let r = 0; r < ROWS - 2; r++) { const i = r * COLS + c, p = b[i]; if (p && b[i + COLS] && b[i + 2 * COLS] && b[i + COLS].t === p.t && b[i + 2 * COLS].t === p.t) m[i] = m[i + COLS] = m[i + 2 * COLS] = 1; }
    return m; }
  // a combo is a joined group of marked cells of one colour. Bottom rows first, the way they clear
  function combosOf(b) { const m = marks(b), seen = new Uint8Array(NC), out = [];
    for (let i = NC - 1; i >= 0; i--) { if (!m[i] || seen[i]) continue; const t = b[i].t, cells = [], st = [i]; seen[i] = 1;
      while (st.length) { const k = st.pop(), r = (k / COLS) | 0, c = k % COLS; cells.push(k);
        for (const j of [c > 0 ? k - 1 : -1, c < COLS - 1 ? k + 1 : -1, r > 0 ? k - COLS : -1, r < ROWS - 1 ? k + COLS : -1]) if (j >= 0 && m[j] && !seen[j] && b[j].t === t) { seen[j] = 1; st.push(j); } }
      out.push({ t, cells, n: cells.length }); }
    return out; }
  function drop(b, R) { for (let c = 0; c < COLS; c++) { let w = ROWS - 1;
      for (let r = ROWS - 1; r >= 0; r--) { const p = b[r * COLS + c]; if (p) { if (w !== r) { b[w * COLS + c] = p; b[r * COLS + c] = null; } w--; } }
      if (R) { const n = w + 1; for (let r = w; r >= 0; r--) b[r * COLS + c] = mk(pick6(R), r - n); } } }
  function fresh(R) { const b = []; for (let i = 0; i < NC; i++) { let t; do { t = pick6(R); } while ((i % COLS >= 2 && b[i - 1].t === t && b[i - 2].t === t) || (i >= 2 * COLS && b[i - COLS].t === t && b[i - 2 * COLS].t === t)); b.push(mk(t)); } return b; }
  // clear, fall, clear again until the board is still. Yields each step so the screen can show it; returns every combo made
  function* settle(b, R) { const all = [];
    for (let g = 0; g < 40; g++) { const cs = combosOf(b); if (!cs.length) break;
      for (const c of cs) { c.ids = c.cells.map(i => b[i].id); all.push(c); }
      for (const c of cs) for (const i of c.cells) b[i] = null;
      yield { k: 'combos', list: cs, total: all.length }; drop(b, R); yield { k: 'fall' }; }
    return all; }
  const drain = g => { let r = g.next(); while (!r.done) r = g.next(); return r.value; };

  // ---------- cards and enemies ----------
  // fire beats wood, wood beats water, water beats fire; light and dark beat each other
  function adv(a, d) { if ((a === 0 && d === 2) || (a === 2 && d === 1) || (a === 1 && d === 0) || (a === 3 && d === 4) || (a === 4 && d === 3)) return 2; if ((d === 0 && a === 2) || (d === 2 && a === 1) || (d === 1 && a === 0)) return .5; return 1; }
  const K = { hp: 80, atk: 16, boss: 1.6, step: .08, pow: .5 };   // enemy HP and ATK for each minute of a ten-hour book; a boss's extra HP; how much each floor adds
  const size = mins => 600 * Math.pow(mins / 600, K.pow);   // a book twice as long is not twice the card or twice the enemy
  const SK = {
    row:   { cd: 7,  name: e => NAME[e] + ' Row', text: e => 'Turns the top row into ' + NAME[e] + ' orbs.' },
    conv:  { cd: 8,  name: e => 'Hearts to ' + NAME[e], text: e => 'Turns every Heart orb into a ' + NAME[e] + ' orb.' },
    nuke:  { cd: 9,  name: () => 'Strike', text: () => 'Hits one enemy for 12× this card’s ATK.' },
    heal:  { cd: 8,  name: () => 'Mend', text: () => 'Heals 35% of the team’s HP.' },
    delay: { cd: 10, name: () => 'Stall', text: () => 'Every enemy waits 2 more turns.' },
    boost: { cd: 7,  name: e => NAME[e] + ' Surge', text: e => NAME[e] + ' cards hit for 2× this turn.' },
    time:  { cd: 6,  name: () => 'Focus', text: () => '4 more seconds to move orbs this turn.' },
    guard: { cd: 9,  name: () => 'Brace', text: () => 'Halves the damage the team takes for 2 turns.' },
    mix:   { cd: 5,  name: () => 'Reshuffle', text: () => 'Deals a new board.' },
    missile: { cd: 9, name: () => 'Magic Missile', text: () => 'Turns the top row into Fire orbs. Fire cards hit for 2× this turn.' },
  };
  const SKLIST = ['row', 'conv', 'nuke', 'heal', 'delay', 'boost', 'time', 'guard', 'mix'];
  const LD = {
    combo:   { text: () => '3× ATK with 4 or more combos.', m: x => x.C >= 4 ? 3 : 1 },
    mono:    { text: e => '2.5× ATK for ' + NAME[e] + ' cards.', m: (x, card, lead) => card.el === lead.el ? 2.5 : 1 },
    rainbow: { text: () => '3× ATK when 3 or more colours attack.', m: x => x.els >= 3 ? 3 : 1 },
    tank:    { text: () => '1.5× HP and 1.5× ATK.', hp: 1.5, m: () => 1.5 },
    heart:   { text: () => 'Heart matches heal double. 2× ATK on a turn with a Heart match.', heal: 2, m: x => x.heart ? 2 : 1 },
  };
  const LDLIST = ['combo', 'mono', 'rainbow', 'tank', 'heart'];
  // a card from a finished book: HP from its length, ATK from its rating
  function cardFrom(o) { const h = hashOf(o.t), mins = o.mins > 0 ? o.mins : 480, r = o.rating > 0 ? Math.min(5, o.rating) : 4;
    const sk = o.sk || SKLIST[h % SKLIST.length], ld = o.ld || LDLIST[(h >>> 5) % LDLIST.length];
    return { t: o.t, el: o.el, mins, stars: Math.max(1, Math.round(r)), hp: Math.max(1500, Math.round(size(mins) * 10)), atk: Math.round(500 * r) + 200, rcv: Math.max(100, Math.round(size(mins) / 3)), sk, ld, cd: SK[sk].cd, max: SK[sk].cd }; }
  const GIM = { windup: 'Winds up a heavy blow for two turns. A break stops it.', regen: 'Heals every turn. A break stops it.', enrage: 'Hits harder every time it attacks.' };
  // an enemy from an unread book: the longer the book, the more HP and the harder it hits
  function foeFrom(o, tier, boss) { const h = hashOf(o.t), mins = o.mins > 0 ? o.mins : 480;
    const f = { t: o.t, el: o.el, mins, boss: !!boss, max: Math.round(size(mins) * K.hp * tier * (boss ? K.boss : 1)), atk: Math.round(size(mins) * K.atk * tier), every: 2 + (h % 2), shields: 0, shMax: 0, weak: [], seen: [], broken: 0, gim: '', wind: 0, cool: 0, rage: 0, p2: false, alive: true };
    f.hp = f.max; f.cd = 1 + (h >>> 3) % f.every + (boss ? 1 : 0);
    if (boss) { f.shMax = f.shields = 3 + (h >>> 7) % 3; const a = (h >>> 9) % 5, b = (a + 1 + (h >>> 12) % 4) % 5; f.weak = [a, b]; f.gim = ['windup', 'regen', 'enrage'][(h >>> 15) % 3]; f.cool = 4; f.line = GIM[f.gim]; }
    return f; }

  function teamOf(cards, boost) { const lead = cards[0], L = LD[lead.ld], hpM = (L.hp || 1) * ((boost && boost.hp) || 1);
    const T = { cards: cards.map(c => Object.assign({}, c, { cd: c.max })), lead, max: Math.round(cards.reduce((s, c) => s + c.hp, 0) * hpM), rcv: cards.reduce((s, c) => s + c.rcv, 0) };
    T.hp = T.max; return T; }
  function fightOf(team, foes, boost, R) { return { team, foes, target: -1, surge: {}, guard: 0, extra: 0, boost: boost || { atk: 1, hp: 1, time: 0 }, turn: 0, dealt: 0, R }; }
  const alive = F => F.foes.filter(f => f.alive);
  const aim = F => { const t = F.foes[F.target]; if (t && t.alive) return F.target; return F.foes.findIndex(f => f.alive); };
  function chip(F, i, el, ev) { const f = F.foes[i]; if (!f.shMax || f.broken || !f.weak.includes(el)) return; if (!f.seen.includes(el)) f.seen.push(el); f.shields--; ev.push({ k: 'chip', foe: i });
    if (f.shields <= 0) { f.shields = 0; f.broken = 2; f.wind = 0; f.cool = 4; ev.push({ k: 'break', foe: i }); } }
  function hurt(F, i, n, ev, from, a) { const f = F.foes[i]; if (!f.alive) return; if (f.broken) n = Math.round(n * 1.5); n = Math.min(n, f.hp); f.hp -= n; F.dealt += n; ev.push({ k: 'hit', foe: i, n, from, adv: a || 1 });
    if (f.hp <= 0) { f.alive = false; ev.push({ k: 'dead', foe: i }); }
    else if (f.boss && !f.p2 && f.hp <= f.max / 2) { f.p2 = true; f.every = Math.max(1, f.every - 1); f.shMax++; if (!f.broken) f.shields = f.shMax; ev.push({ k: 'phase', foe: i }); } }
  // what a set of combos does: every card whose colour was matched attacks, Heart matches heal
  function playerTurn(F, combos) { const ev = [], T = F.team, per = [0, 0, 0, 0, 0, 0], C = combos.length; let els = 0;
    for (const c of combos) per[c.t] += 1 + .25 * (c.n - 3);
    for (let e = 0; e < 5; e++) if (per[e] && T.cards.some(c => c.el === e)) els++;
    const cm = 1 + .25 * (C - 1), x = { C, els, heart: per[5] > 0 }, L = LD[T.lead.ld];
    // a combo of a colour the boss is weak to takes a shield off, before the hits land
    for (const c of combos) if (c.t < 5) { const i = aim(F); if (i >= 0) chip(F, i, c.t, ev); }
    if (per[5]) { const n = Math.min(T.max - T.hp, Math.round(T.rcv * per[5] * cm * (L.heal || 1))); if (n > 0) { T.hp += n; ev.push({ k: 'heal', n }); } }
    T.cards.forEach((c, k) => { if (!per[c.el]) return; const i = aim(F); if (i < 0) return; const f = F.foes[i];
      const a = adv(c.el, f.el), n = Math.round(c.atk * per[c.el] * cm * L.m(x, c, T.lead) * (F.surge[c.el] || 1) * F.boost.atk * a); hurt(F, i, n, ev, k, a); });
    F.surge = {}; F.extra = 0; F.turn++; T.cards.forEach(c => { if (c.cd > 0) c.cd--; }); return ev; }
  function strike(F, n, ev, i, name) { if (F.guard > 0) n = Math.round(n / 2); const T = F.team; n = Math.min(n, T.hp); T.hp -= n; ev.push({ k: 'strike', foe: i, n, name }); }
  function foeTurn(F) { const ev = [];
    F.foes.forEach((f, i) => { if (!f.alive || F.team.hp <= 0) return;
      if (f.broken > 0) { f.broken--; if (f.broken === 0) f.shields = f.shMax; ev.push({ k: 'skip', foe: i }); return; }
      if (f.gim === 'regen' && f.hp < f.max) { const n = Math.min(f.max - f.hp, Math.round(f.max * .04)); f.hp += n; ev.push({ k: 'regen', foe: i, n }); }
      if (f.gim === 'windup') { if (f.wind > 0) { f.wind--; if (f.wind === 0) { strike(F, f.atk * 3, ev, i, 'Heavy blow'); f.cool = 4; } } else if (--f.cool <= 0) { f.wind = f.p2 ? 1 : 2; ev.push({ k: 'wind', foe: i }); } }
      if (F.team.hp <= 0) return;
      f.cd--; if (f.cd <= 0) { strike(F, Math.round(f.atk * (1 + .2 * f.rage)), ev, i, ''); if (f.gim === 'enrage') f.rage++; f.cd = f.every; } });
    if (F.guard > 0) F.guard--; return ev; }
  // a card's skill. b is the board; returns what changed so the screen can show it
  function useSkill(F, k, b) { const c = F.team.cards[k], S = SK[c.sk], ev = []; if (!c || c.cd > 0) return null; c.cd = c.max; let board = false;
    const row = e => { for (let i = 0; i < COLS; i++) if (b[i]) b[i].t = e; board = true; };
    if (c.sk === 'row') row(c.el);
    else if (c.sk === 'missile') { row(0); F.surge[0] = 2; }
    else if (c.sk === 'conv') { b.forEach(p => { if (p && p.t === 5) p.t = c.el; }); board = true; }
    else if (c.sk === 'nuke') { const i = aim(F); if (i >= 0) { chip(F, i, c.el, ev); const a = adv(c.el, F.foes[i].el); hurt(F, i, Math.round(c.atk * 12 * a), ev, k, a); } }
    else if (c.sk === 'heal') { const T = F.team, n = Math.min(T.max - T.hp, Math.round(T.max * .35)); T.hp += n; ev.push({ k: 'heal', n }); }
    else if (c.sk === 'delay') F.foes.forEach(f => { if (f.alive) { f.cd += 2; if (f.wind) f.wind += 2; } });
    else if (c.sk === 'boost') F.surge[c.el] = 2;
    else if (c.sk === 'time') F.extra += 4;
    else if (c.sk === 'guard') F.guard = 2;
    else if (c.sk === 'mix') { const nb = fresh(F.R); for (let i = 0; i < NC; i++) b[i] = nb[i]; board = true; }
    return { ev, board, name: S.name(c.el) }; }
  const result = F => F.team.hp <= 0 ? 'lose' : F.foes.every(f => !f.alive) ? 'win' : '';

  // ---------- a stand-in player, for the difficulty word shown before a floor. It makes three to five plain combos a turn ----------
  function simTurn(F, R) { const n = 3 + (R() < .5 ? 1 : 0) + (R() < .25 ? 1 : 0), combos = [];
    for (let k = 0; k < n; k++) combos.push({ t: pick6(R), n: R() < .15 ? 4 : R() < .05 ? 5 : 3 });
    const T = F.team, b = fresh(R);
    T.cards.forEach((c, k) => { if (c.cd > 0) return; if (c.sk === 'heal' && T.hp > T.max * .6) return; if (c.sk === 'guard' && T.hp > T.max * .7) return; if (c.sk === 'row' || c.sk === 'conv' || c.sk === 'missile') combos.push({ t: c.sk === 'missile' ? 0 : c.el, n: 4 }); useSkill(F, k, b); });
    playerTurn(F, combos); if (!result(F)) foeTurn(F); }
  // waves: a list of lists of enemy seeds. start: HP the boss begins on, as a share of its full HP
  function simFloor(cards, waves, tier, boost, seed, start) { const R = rng32(seed), T = teamOf(cards, boost); let last = null;
    for (let w = 0; w < waves.length; w++) { const foes = waves[w].map((o, i) => foeFrom(o, tier, w === waves.length - 1 && i === waves[w].length - 1)); if (w === waves.length - 1 && start != null) { const f = foes[foes.length - 1]; f.hp = Math.max(1, Math.round(f.max * start)); }
      const F = fightOf(T, foes, boost, R); last = F; for (let n = 0; n < 200 && !result(F); n++) simTurn(F, R); if (result(F) !== 'win') return { win: false, F }; }
    return { win: true, F: last }; }
  function winRate(cards, waves, tier, boost, n, start) { let w = 0; for (let k = 0; k < n; k++) if (simFloor(cards, waves, tier, boost, 977 + k * 7919, start).win) w++; return w / n; }
  const LABEL = p => p >= .85 ? 'Easy' : p >= .65 ? 'Fair' : p >= .4 ? 'Hard' : p >= .15 ? 'Brutal' : 'Suicide';
  const CORE = { K, COLS, ROWS, NC, ELS, NAME, rng32, hashOf, mk, marks, combosOf, drop, fresh, settle, drain, adv, SK, SKLIST, LD, LDLIST, cardFrom, foeFrom, GIM, teamOf, fightOf, alive, aim, playerTurn, foeTurn, useSkill, result, simFloor, winRate, LABEL };

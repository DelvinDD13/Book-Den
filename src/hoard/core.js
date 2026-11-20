  // ---------- the game as data: no screen in here, so the same code is played by the test player that sets the move limits ----------
  const N = 8, WHEEL = 7, BOX = 8, CROWN = 9;
  function rngOf(seed) { let a = seed >>> 0; return function () { a |= 0; a = a + 0x6D2B79F5 | 0; let t = Math.imul(a ^ a >>> 15, 1 | a); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }
  const needE = l => 600 + 250 * (l - 1);   // endless: points to the next level
  const key = (r, c) => r * N + c, inb = (r, c) => r >= 0 && r < N && c >= 0 && c < N;
  const fixed = p => p.t === BOX || p.g > 0;   // boxes and stones under glass stay where they are: stones flow round them

  function Game(L, opt) { opt = opt || {}; this.L = L; this.rand = rngOf(opt.seed == null ? (Math.random() * 4294967296) >>> 0 : opt.seed); this.quiet = !!opt.quiet; this.power = opt.power || 1; this.uid = 0; this.log = [];
    this.sc = 0; this.turn = 0; this.moves = L.endless || L.boss ? Infinity : L.moves; this.state = 'play'; this.why = ''; this.fi = 0; this.lv = 1; this.into = 0; this.up = false; this.bonus = 0; this.set = L.set || [0, 1, 2, 3, 4, 5, 6];
    if (L.boss) { const b = L.boss; this.boss = { hp: opt.bossHp > 0 ? opt.bossHp : b.hp, max: b.hp, sh: b.shields, shMax: b.shields, wards: b.wards || 0, broken: 0, timer: b.every, step: 0, charge: 0, rage: 0, seen: (opt.seen || []).slice(), dealt: 0, last: '' }; this.hp = 100; }
    this.build(); }
  const P = Game.prototype;
  P.F = function () { return this.L.floors ? this.L.floors[this.fi] : this.L; };
  P.mk = function (t, x) { return Object.assign({ id: ++this.uid, t, s: 0, f: 0, g: 0, hp: 0, r: 0, c: 0 }, x || {}); };
  P.kind = function () { return this.set[Math.floor(this.rand() * this.set.length)]; };
  P.build = function () { const F = this.F(), map = F.map || Array(N).fill('........'); let tries = 0; this.got = { crown: 0, fuse: 0, kind: {} }; this.fuseDue = 0; this.crownDue = 0; this.crowns = 0; this.lifted = false;
    do { this.G = []; this.C = []; this.crowns = 0;
      for (let r = 0; r < N; r++) { this.G.push([]); this.C.push([]); for (let c = 0; c < N; c++) { const ch = map[r][c], cell = { void: ch === '#', ash: ch === 'a' || ch === 'M' ? 1 : ch === 'A' || ch === 'N' ? 2 : 0, mist: ch === 'm' || ch === 'M' || ch === 'N' ? 1 : 0 };
          if (F.ash && !cell.void) cell.ash = Math.max(cell.ash, +F.ash[r][c] || 0); if (F.mist && !cell.void && F.mist[r][c] === '1') cell.mist = 1; this.C[r].push(cell); let p = null;
          if (ch === '#') p = null; else if (ch === 'b' || ch === 'B' || ch === 'G') p = this.mk(BOX, { hp: ch === 'b' ? 1 : ch === 'B' ? 2 : 3 }); else if (ch === 'c') { p = this.mk(CROWN); this.crowns++; } else if (ch === '*') p = this.mk(WHEEL); else if (ch >= '0' && ch <= '6') p = this.mk(+ch);
          else p = this.mk(-1, { f: ch === 'f' ? (F.fuse || 9) : 0, g: ch === 'g' ? 1 : ch === 'q' ? 2 : 0, s: ch === 'x' ? 1 : ch === 'o' ? 2 : 0 });
          if (p) { p.r = r; p.c = c; if (p.t === BOX) p.tier = p.hp; } this.G[r].push(p); } }
      for (let r = 0; r < N; r++) for (let c = 0; c < N; c++) { const p = this.G[r][c]; if (p && p.t === -1) { let n = 0; do { p.t = this.kind(); n++; } while (n < 40 && this.inRun(r, c)); } }
    } while (++tries < 80 && (this.runs().length || !this.anyMove()));
    // where stones come in (nothing but empty space above) and where a crown leaves (nothing but empty space below)
    this.entry = this.C.map((row, r) => row.map((z, c) => { if (z.void) return false; for (let i = 0; i < r; i++) if (!this.C[i][c].void) return false; return true; }));
    this.exit = this.C.map((row, r) => row.map((z, c) => { if (z.void) return false; for (let i = r + 1; i < N; i++) if (!this.C[i][c].void) return false; return true; }));
    this.ev(this.fi ? 'floor' : 'start'); };
  P.goals = function () { return this.F().goals || []; };
  P.count = function (what) { let n = 0; for (let r = 0; r < N; r++) for (let c = 0; c < N; c++) { const p = this.G[r][c]; n += what === 'ash' ? this.C[r][c].ash : what === 'box' ? (p && p.t === BOX ? 1 : 0) : what === 'glass' ? (p ? p.g : 0) : what === 'mist' ? this.C[r][c].mist : what === 'crown' ? (p && p.t === CROWN ? 1 : 0) : 0; } return n; };
  P.leftOf = function (g) { return Math.max(0, g.type === 'score' ? g.n - this.sc : g.type === 'crown' || g.type === 'fuse' ? g.n - this.got[g.type] : g.type === 'kind' ? g.n - (this.got.kind[g.k] || 0) : this.count(g.type)); };
  P.left = function () { if (this.boss) return this.boss.hp; return this.goals().reduce((s, g) => s + this.leftOf(g), 0); };
  P.done = function () { return this.goals().length > 0 && this.goals().every(g => this.leftOf(g) <= 0); };
  P.add = function (n) { this.sc += n; if (this.L.endless) { this.into += n; while (this.into >= needE(this.lv)) { this.into -= needE(this.lv); this.lv++; this.up = true; } } };
  P.put = function (q, p) { this.G[q[0]][q[1]] = p; if (p) { p.r = q[0]; p.c = q[1]; } };
  P.ev = function (e, x) { if (this.quiet) return; const p = []; for (let r = 0; r < N; r++) for (let c = 0; c < N; c++) if (this.G[r][c]) p.push(Object.assign({}, this.G[r][c]));
    this.log.push(Object.assign({ e, p, cells: this.C.map(row => row.map(z => [z.ash, z.mist, z.void ? 1 : 0])), sc: this.sc, moves: this.moves, goals: this.goals().map(g => this.leftOf(g)), state: this.state, why: this.why, lv: this.lv, into: this.into, fi: this.fi, hp: this.hp, boss: this.boss ? Object.assign({}, this.boss, { seen: this.boss.seen.slice() }) : null }, x || {})); };
  P.runs = function () { const G = this.G, out = [], T = (r, c) => { const p = G[r][c]; return p && p.t >= 0 && p.t < 7 ? p.t : -1; };
    for (let r = 0; r < N; r++) { let st = 0; for (let c = 1; c <= N; c++) { const t0 = T(r, st); if (c < N && t0 >= 0 && T(r, c) === t0) continue; if (t0 >= 0 && c - st >= 3) { const cells = []; for (let i = st; i < c; i++) cells.push([r, i]); out.push({ t: t0, cells }); } st = c; } }
    for (let c = 0; c < N; c++) { let st = 0; for (let r = 1; r <= N; r++) { const t0 = T(st, c); if (r < N && t0 >= 0 && T(r, c) === t0) continue; if (t0 >= 0 && r - st >= 3) { const cells = []; for (let i = st; i < r; i++) cells.push([i, c]); out.push({ t: t0, cells }); } st = r; } } return out; };
  P.inRun = function (r, c) { const G = this.G, p = G[r][c]; if (!p || p.t < 0 || p.t >= 7) return false; const t = p.t, T = (rr, cc) => inb(rr, cc) && G[rr][cc] && G[rr][cc].t === t; let h = 1, v = 1;
    for (let i = c - 1; T(r, i); i--) h++; for (let i = c + 1; T(r, i); i++) h++; for (let i = r - 1; T(i, c); i--) v++; for (let i = r + 1; T(i, c); i++) v++; return h >= 3 || v >= 3; };
  P.can = function (a, b) { const G = this.G; if (!inb(a[0], a[1]) || !inb(b[0], b[1]) || Math.abs(a[0] - b[0]) + Math.abs(a[1] - b[1]) !== 1) return false; const A = G[a[0]][a[1]], B = G[b[0]][b[1]]; if (!A || !B || fixed(A) || fixed(B)) return false;
    if (A.t === WHEEL || B.t === WHEEL) return A.t <= WHEEL && B.t <= WHEEL; if (A.t < 7 && B.t < 7 && A.s && B.s) return true; if (A.t === B.t) return false;
    G[a[0]][a[1]] = B; G[b[0]][b[1]] = A; const ok = this.inRun(a[0], a[1]) || this.inRun(b[0], b[1]); G[a[0]][a[1]] = A; G[b[0]][b[1]] = B; return ok; };
  P.moveList = function () { const out = []; for (let r = 0; r < N; r++) for (let c = 0; c < N; c++) { if (c + 1 < N && this.can([r, c], [r, c + 1])) out.push([[r, c], [r, c + 1]]); if (r + 1 < N && this.can([r, c], [r + 1, c])) out.push([[r, c], [r + 1, c]]); } return out; };
  P.anyMove = function () { for (let r = 0; r < N; r++) for (let c = 0; c < N; c++) { if (c + 1 < N && this.can([r, c], [r, c + 1])) return true; if (r + 1 < N && this.can([r, c], [r + 1, c])) return true; } return false; };

  // one clearing. It grows through any line stone, burst stone or wheel caught in it; then ash, mist, glass and boxes take what they take.
  // Returns the stones that went and how many specials went off (a boss fight reads both).
  P.hit = function (clear, make, chain, spent) { const G = this.G, C = this.C, trig = new Set(spent || []); let grew = true, fired = 0;
    const add = (r, c) => { if (!inb(r, c) || C[r][c].void) return; const k = key(r, c); if (!clear.has(k)) { clear.set(k, [r, c]); grew = true; } };
    while (grew) { grew = false; for (const [k, q] of [...clear]) { if (trig.has(k)) continue; const p = G[q[0]][q[1]]; if (!p || p.g > 0) continue;
        if (p.t < 7 && p.s === 1) { trig.add(k); fired++; for (let i = 0; i < N; i++) { add(q[0], i); add(i, q[1]); } }
        else if (p.t < 7 && p.s === 2) { trig.add(k); fired++; for (let i = -1; i <= 1; i++) for (let j = -1; j <= 1; j++) add(q[0] + i, q[1] + j); }
        else if (p.t === WHEEL) { trig.add(k); fired++; const n = Array(7).fill(0); for (let r = 0; r < N; r++) for (let c = 0; c < N; c++) { const z = G[r][c]; if (z && z.t < 7 && !clear.has(key(r, c))) n[z.t]++; } const top = n.indexOf(Math.max(...n)); if (n[top] > 0) for (let r = 0; r < N; r++) for (let c = 0; c < N; c++) if (G[r][c] && G[r][c].t === top) add(r, c); } } }
    const gone = [], boxes = new Set(), lift = new Set(); let made = 0, pts = 0;
    for (const [k, q] of clear) { const p = G[q[0]][q[1]], cell = C[q[0]][q[1]]; if (cell.mist) lift.add(k); if (!p) { if (cell.ash) { cell.ash--; pts += 20; } continue; } if (p.t === CROWN) continue; if (p.t === BOX) { boxes.add(k); continue; }
      if (cell.ash) { cell.ash--; pts += 20; }
      if (p.g > 0) { p.g--; pts += 20; continue; }
      const m = make.get(k); if (m) { if (p.f) { p.f = 0; this.got.fuse++; pts += 60; } if (p.t < 7) this.got.kind[p.t] = (this.got.kind[p.t] || 0) + 1; p.t = m.t; p.s = m.s; made++; continue; }
      gone.push(p); }
    gone.forEach(p => { [[1, 0], [-1, 0], [0, 1], [0, -1]].forEach(d => { const r = p.r + d[0], c = p.c + d[1]; if (!inb(r, c)) return; if (G[r][c] && G[r][c].t === BOX) boxes.add(key(r, c)); if (C[r][c].mist) lift.add(key(r, c)); }); });
    // a box that opens leaves its loot where it stood: silver a burst stone, gold a wheel
    boxes.forEach(k => { const r = Math.floor(k / N), c = k % N, p = G[r][c]; p.hp--; if (p.hp <= 0) { pts += 50; G[r][c] = p.tier === 3 ? this.mk(WHEEL, { r, c }) : p.tier === 2 ? this.mk(this.kind(), { s: 2, r, c }) : null; if (C[r][c].mist) C[r][c].mist = 0; } });
    if (lift.size) this.lifted = true; lift.forEach(k => { C[Math.floor(k / N)][k % N].mist = 0; });
    gone.forEach(p => { if (p.f) { this.got.fuse++; pts += 60; } if (p.t < 7) this.got.kind[p.t] = (this.got.kind[p.t] || 0) + 1; G[p.r][p.c] = null; });
    this.add(pts + gone.length * 10 * chain + made * 40); this.ev('hit', { burst: gone.map(p => [p.r, p.c, p.t]), gain: pts + gone.length * 10 * chain + made * 40, chain, fired }); return { gone, fired }; };

  // stones fall straight down; where something fixed or a gap in the board is in the way they slide in from the side above
  P.flow = function () { const G = this.G, C = this.C, born = {}, was = {}, slots = [], spawned = {}; let any = false, guard = 0, far = 0;
    const note = p => { if (!(p.id in was) && !(p.id in born)) was[p.id] = p.r; };
    for (;;) { let ch = true;
      while (ch && guard++ < 600) { ch = false;
        for (let r = N - 1; r >= 0; r--) for (let c = 0; c < N; c++) { if (C[r][c].void || G[r][c]) continue;
          if (this.entry[r][c]) { const p = this.mk(this.kind()); spawned[c] = (spawned[c] || 0) + 1; born[p.id] = [r - spawned[c], c]; p.r = r; p.c = c; G[r][c] = p; slots.push(p); ch = any = true; continue; }
          const a = r > 0 && !C[r - 1][c].void ? G[r - 1][c] : null; if (a && !fixed(a)) { note(a); G[r - 1][c] = null; G[r][c] = a; a.r = r; ch = any = true; } } }
      let slid = false;
      for (let r = N - 1; r >= 1 && !slid; r--) for (let c = 0; c < N && !slid; c++) { if (C[r][c].void || G[r][c]) continue; const order = (r + c) % 2 ? [-1, 1] : [1, -1];
        for (const d of order) { const cc = c + d; if (cc < 0 || cc >= N || C[r - 1][cc].void) continue; const a = G[r - 1][cc]; if (a && !fixed(a)) { note(a); G[r - 1][cc] = null; G[r][c] = a; a.r = r; a.c = c; slid = any = true; break; } } }
      if (!slid || guard >= 600) break; }
    if (slots.length && this.fuseDue > 0) { const p = slots.splice(Math.floor(this.rand() * slots.length), 1)[0]; p.f = (this.F().spawn || this.L.spawn).fuse[1]; this.fuseDue--; }
    if (slots.length && this.crownDue > 0) { const p = slots.splice(Math.floor(this.rand() * slots.length), 1)[0]; p.t = CROWN; this.crownDue--; this.crowns++; }
    for (let r = 0; r < N; r++) for (let c = 0; c < N; c++) { const p = G[r][c]; if (!p) continue; if (p.id in born) far = Math.max(far, r - born[p.id][0]); else if (p.id in was) far = Math.max(far, r - was[p.id]); }
    if (any) this.ev('fall', { born, far }); };
  // things fall; a crown that reaches the foot of the board is taken; then things fall again
  P.drop = function () { for (;;) { this.flow(); const got = []; for (let r = 0; r < N; r++) for (let c = 0; c < N; c++) if (this.exit[r][c] && this.G[r][c] && this.G[r][c].t === CROWN) got.push([r, c]);
      if (!got.length) break; got.forEach(q => { this.G[q[0]][q[1]] = null; this.got.crown++; }); this.add(200 * got.length); this.ev('hit', { burst: got.map(q => [q[0], q[1], CROWN]), gain: 200 * got.length, chain: 1, fired: 0 }); } };
  P.settle = function (pref) { let chain = 0;
    for (;;) { const R = this.runs(); if (!R.length) break; chain++; const clear = new Map(), make = new Map(), seen = new Set();
      R.forEach(run => run.cells.forEach(q => { const k = key(q[0], q[1]); if (seen.has(k)) make.set(k, { t: run.t, s: 2 }); seen.add(k); clear.set(k, q); }));
      R.forEach(run => { const n = run.cells.length; if (n < 4) return; let at = run.cells[(n - 1) >> 1]; (pref || []).forEach(q => { if (run.cells.some(z => z[0] === q[0] && z[1] === q[1])) at = q; }); const k = key(at[0], at[1]); if (n >= 5) make.set(k, { t: WHEEL, s: 0 }); else if (!make.has(k)) make.set(k, { t: run.t, s: 1 }); });
      const h = this.hit(clear, make, chain); this.strike(h.gone, R.map(x => x.t), h.fired, chain); this.drop(); pref = null; } };

  // ---------- a boss: shields that only its weak colours and special stones chip; at none it breaks (it loses two turns and takes half again as much) ----------
  P.strike = function (gone, kinds, fired, chain) { const b = this.boss, B = this.L.boss; if (!b) return; let dmg = 0, chip = fired;
    gone.forEach(p => { if (p.t < 7) dmg += 10 * chain * (B.weak.includes(p.t) ? 1.5 : 1); }); kinds.forEach(k => { if (B.weak.includes(k)) { chip++; if (!b.seen.includes(k)) b.seen.push(k); } });
    if (b.broken <= 0 && chip > 0) { if (b.wards > 0) { const w = Math.min(b.wards, chip); b.wards -= w; chip -= w; } b.sh = Math.max(0, b.sh - chip); if (b.sh === 0) { b.broken = 2; if (b.charge) { b.charge = 0; b.step++; b.timer = B.every; } b.last = 'Break'; } }
    dmg = Math.round(dmg * this.power * (b.broken > 0 ? 1.5 : 1)); b.hp = Math.max(0, b.hp - dmg); b.dealt += dmg; if (dmg || chip) this.ev('strike', { dmg }); };
  P.spots = function (ok, n) { const all = []; for (let r = 0; r < N; r++) for (let c = 0; c < N; c++) if (!this.C[r][c].void && ok(this.G[r][c], this.C[r][c], r, c)) all.push([r, c]); const out = []; while (out.length < n && all.length) out.push(all.splice(Math.floor(this.rand() * all.length), 1)[0]); return out; };
  P.afflict = function (m) { const plain = p => p && p.t < 7 && !p.s && !p.g && !p.f;
    if (m.ash) this.spots((p, z) => z.ash < 2, m.ash).forEach(q => { this.C[q[0]][q[1]].ash++; });
    if (m.mist) this.spots((p, z) => !z.mist, m.mist).forEach(q => { this.C[q[0]][q[1]].mist = 1; });
    if (m.glass) this.spots(plain, m.glass).forEach(q => { this.G[q[0]][q[1]].g = 1; });
    if (m.fuse) this.spots(plain, m.fuse[0]).forEach(q => { this.G[q[0]][q[1]].f = m.fuse[1]; });
    if (m.push) { const rows = []; for (let r = 0; r < N; r++) if (this.C[r].every(z => !z.void) && this.G[r].every(p => p && !fixed(p))) rows.push(r); if (rows.length) { const r = rows[Math.floor(this.rand() * rows.length)], row = this.G[r].slice(); for (let c = 0; c < N; c++) this.put([r, (c + 1) % N], row[c]); } } };
  P.bossTurn = function () { const b = this.boss, B = this.L.boss;
    if (b.broken > 0) { b.broken--; if (b.broken === 0) { b.shMax = B.shields + (B.gim === 'escalate' ? ++b.rage : 0); b.sh = b.shMax; b.wards = B.wards || 0; b.last = ''; } this.ev('tick'); return; }
    if (B.gim === 'regen') b.hp = Math.min(b.max, b.hp + Math.round(b.max * B.regen));
    b.timer--; if (b.timer > 0) { this.ev('tick'); return; }
    const m = B.moves[b.step % B.moves.length]; if (m.charge && !b.charge) { b.charge = 1; b.timer = m.charge; b.last = m.name; this.ev('boss', { move: m.name, charging: 1 }); return; }
    b.charge = 0; b.step++; b.timer = B.every; let dmg = m.dmg || 0; if (B.gim === 'enrage') dmg = Math.round(dmg * (1 + .1 * b.rage++)); this.hp = Math.max(0, this.hp - dmg); b.last = m.name; this.afflict(m); this.ev('boss', { move: m.name, dmg });
    if (this.hp <= 0) { this.state = 'lost'; this.why = 'boss'; this.ev('end'); return; } if (this.runs().length) this.settle(null); };

  P.play = function (a, b) { this.log = []; if (this.state !== 'play') return false; const G = this.G, kq = q => key(q[0], q[1]);
    if (!this.can(a, b)) { const A = inb(a[0], a[1]) ? G[a[0]][a[1]] : null, B = inb(b[0], b[1]) ? G[b[0]][b[1]] : null; if (A && B && !fixed(A) && !fixed(B) && Math.abs(a[0] - b[0]) + Math.abs(a[1] - b[1]) === 1) { this.put(a, B); this.put(b, A); this.ev('swap'); this.put(a, A); this.put(b, B); this.ev('swap'); } return false; }
    const A = G[a[0]][a[1]], B = G[b[0]][b[1]]; this.put(a, B); this.put(b, A); this.ev('swap'); this.turn++; if (this.moves !== Infinity) this.moves--; this.lifted = false;
    if (A.t === WHEEL || B.t === WHEEL) { const clear = new Map(), spent = new Set();
      if (A.t === WHEEL && B.t === WHEEL) { for (let r = 0; r < N; r++) for (let c = 0; c < N; c++) if (!this.C[r][c].void) clear.set(key(r, c), [r, c]); spent.add(kq(a)); spent.add(kq(b)); }
      else { const w = A.t === WHEEL ? b : a, o = A.t === WHEEL ? a : b, O = G[o[0]][o[1]]; clear.set(kq(w), w); spent.add(kq(w)); let turned = false;
        for (let r = 0; r < N; r++) for (let c = 0; c < N; c++) { const z = G[r][c]; if (z && z.t === O.t) { if (O.s && !z.s && !z.g) { z.s = O.s; turned = true; } clear.set(key(r, c), [r, c]); } } if (turned) this.ev('swap'); }
      const h = this.hit(clear, new Map(), 1, spent); this.strike(h.gone, [], h.fired + 1, 1); this.drop(); this.settle(null); }
    else if (A.s && B.s) { const clear = new Map(), spent = new Set([kq(a), kq(b)]), big = A.s === 2 && B.s === 2;
      for (let r = 0; r < N; r++) for (let c = 0; c < N; c++) { if (this.C[r][c].void) continue; const dr = Math.abs(r - b[0]), dc = Math.abs(c - b[1]); if (big ? dr <= 2 && dc <= 2 : dr <= 1 || dc <= 1) clear.set(key(r, c), [r, c]); }
      clear.set(kq(a), a); clear.set(kq(b), b); const h = this.hit(clear, new Map(), 1, spent); this.strike(h.gone, [], h.fired + 2, 1); this.drop(); this.settle(null); }
    else this.settle([b, a]);
    this.after(); return true; };
  // the end of a turn that cost a move: goals, then fuses, the boss, creeping mist and falling ash
  P.after = function () { const L = this.L, F = this.F(), G = this.G;
    if (L.endless) { if (!this.anyMove()) { this.state = 'lost'; this.why = 'nomoves'; this.ev('end'); } return; }
    if (this.boss && this.boss.hp <= 0) { this.state = 'won'; this.ev('end'); return; }
    if (!this.boss && this.done()) { if (L.floors && this.fi < L.floors.length - 1) { this.fi++; this.build(); return; } this.state = 'won'; this.bonus = this.moves * 150; this.sc += this.bonus; this.ev('end'); return; }
    let any = false; const boom = []; for (let r = 0; r < N; r++) for (let c = 0; c < N; c++) { const p = G[r][c]; if (p && p.f > 0) { p.f--; any = true; if (p.f <= 0) boom.push(p); } }
    if (boom.length) { if (!this.boss) { this.ev('tick'); this.state = 'lost'; this.why = 'bomb'; this.ev('end'); return; } boom.forEach(p => { G[p.r][p.c] = null; }); this.hp = Math.max(0, this.hp - 25 * boom.length); this.ev('hit', { burst: boom.map(p => [p.r, p.c, p.t]), gain: 0, chain: 1, fired: 0, boom: 1 }); this.drop(); if (this.hp <= 0) { this.state = 'lost'; this.why = 'boss'; this.ev('end'); return; } if (this.runs().length) this.settle(null); }
    if (this.boss) { this.bossTurn(); if (this.state !== 'play') return; if (this.boss.hp <= 0) { this.state = 'won'; this.ev('end'); return; } }
    else if (this.moves <= 0) { if (any) this.ev('tick'); this.state = 'lost'; this.why = 'moves'; this.ev('end'); return; }
    const sp = F.spawn || L.spawn || {}; if (sp.fuse && this.turn % sp.fuse[0] === 0) this.fuseDue++;
    const cg = this.goals().find(g => g.type === 'crown'); if (cg) { const on = this.count('crown'); if (this.crowns + this.crownDue < cg.n && ((sp.crown && this.turn % sp.crown === 0) || on + this.crownDue === 0)) this.crownDue++; }
    if (F.creep && !this.lifted && this.count('mist') > 0) { const q = this.spots((p, z, r, c) => !z.mist && [[1, 0], [-1, 0], [0, 1], [0, -1]].some(d => inb(r + d[0], c + d[1]) && this.C[r + d[0]][c + d[1]].mist), 1)[0]; if (q) { this.C[q[0]][q[1]].mist = 1; any = true; } }
    if (F.ashfall && this.turn % F.ashfall[0] === 0) { this.spots((p, z) => z.ash < 2 && p && p.t !== BOX, F.ashfall[1]).forEach(q => { this.C[q[0]][q[1]].ash++; }); any = true; }
    if (any || this.boss) this.ev('tick'); if (!this.anyMove()) this.shuffle(); };
  // after a booster: nothing ticks and no move is spent
  P.free = function () { if (this.boss) { if (this.boss.hp <= 0) { this.state = 'won'; this.ev('end'); return; } } else if (!this.L.endless && this.done()) { if (this.L.floors && this.fi < this.L.floors.length - 1) { this.fi++; this.build(); return; } this.state = 'won'; this.bonus = this.moves * 150; this.sc += this.bonus; this.ev('end'); return; } if (!this.anyMove()) this.shuffle(); };
  P.useBreak = function (q) { this.log = []; if (this.state !== 'play' || !inb(q[0], q[1]) || this.C[q[0]][q[1]].void) return false; const p = this.G[q[0]][q[1]], z = this.C[q[0]][q[1]]; if ((!p && !z.ash && !z.mist) || (p && p.t === CROWN)) return false;
    const h = this.hit(new Map([[key(q[0], q[1]), q]]), new Map(), 1); this.strike(h.gone, [], h.fired, 1); this.drop(); this.settle(null); this.free(); return true; };
  P.useSwap = function (a, b) { this.log = []; if (this.state !== 'play' || !inb(a[0], a[1]) || !inb(b[0], b[1]) || Math.abs(a[0] - b[0]) + Math.abs(a[1] - b[1]) !== 1) return false; const A = this.G[a[0]][a[1]], B = this.G[b[0]][b[1]]; if (!A || !B || fixed(A) || fixed(B)) return false;
    this.put(a, B); this.put(b, A); this.ev('swap'); this.settle([b, a]); this.free(); return true; };
  P.useShuffle = function () { this.log = []; if (this.state !== 'play') return false; this.shuffle(); this.settle(null); this.free(); return true; };
  P.shuffle = function () { const pos = [], ps = []; for (let r = 0; r < N; r++) for (let c = 0; c < N; c++) { const p = this.G[r][c]; if (p && p.t < 7 && !p.g) { pos.push([r, c]); ps.push(p); } }
    for (let n = 0; n < 80; n++) { for (let i = ps.length - 1; i > 0; i--) { const j = Math.floor(this.rand() * (i + 1)), t = ps[i]; ps[i] = ps[j]; ps[j] = t; } pos.forEach((q, i) => this.put(q, ps[i])); if (!this.runs().length && this.anyMove()) { this.ev('shuffle'); return; } }
    for (let n = 0; n < 80; n++) { ps.forEach(p => { if (!p.s) p.t = this.kind(); }); if (!this.runs().length && this.anyMove()) break; } this.ev('shuffle'); };
  P.clone = function (seed) { const g = Object.create(P); Object.assign(g, this); g.quiet = true; g.log = []; g.got = { crown: this.got.crown, fuse: this.got.fuse, kind: Object.assign({}, this.got.kind) }; g.C = this.C.map(row => row.map(z => Object.assign({}, z))); g.G = this.G.map(row => row.map(p => p ? Object.assign({}, p) : null)); if (this.boss) g.boss = Object.assign({}, this.boss, { seen: this.boss.seen.slice() }); g.rand = rngOf(seed); return g; };
  const stars = (L, sc) => 1 + (sc >= L.stars[0] ? 1 : 0) + (sc >= L.stars[1] ? 1 : 0);

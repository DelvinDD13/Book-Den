// The test player and the tuner. node tune.js [keys] [n]  ->  tuned.json (move limits, star marks, boss ratings)
const core = require(__dirname + '/../l62.js'); const { Game, LEVELS } = core;
function rngOf(seed) { let a = seed >>> 0; return function () { a |= 0; a = a + 0x6D2B79F5 | 0; let t = Math.imul(a ^ a >>> 15, 1 | a); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }
// what a person can see getting better besides the goal count: a crown lower, a box weaker, less mist when it creeps
function prog(g) { let v = 0; const T = g.goals().map(x => x.type), creep = g.F().creep; for (let r = 0; r < 8; r++) for (let c = 0; c < 8; c++) { const p = g.G[r][c]; if (creep && g.C[r][c].mist) v -= .4; if (!p) continue; if (p.t === 9 && T.includes('crown')) v += r; if (p.t === 8 && T.includes('box')) v -= p.hp; if (p.f) v -= Math.max(0, 6 - p.f) * .6; } return v; }
function pick(g, rand, sloppy) { const ms = g.moveList(); if (!ms.length) return null; if (rand() < sloppy) return ms[Math.floor(rand() * ms.length)]; let best = null, bv = -1e18;
  for (const m of ms) { const k = g.clone((rand() * 4294967296) >>> 0), l0 = k.left(), s0 = k.sc, f0 = k.got.fuse, p0 = prog(k), fi = k.fi, h0 = k.hp, sh0 = k.boss ? k.boss.sh : 0; k.play(m[0], m[1]); let v;
    if (g.boss) v = (l0 - k.left()) * 3 + (sh0 - k.boss.sh) * 120 + (k.boss.broken > 0 ? 200 : 0) - (h0 - k.hp) * 30 + rand() * 5;
    else v = (k.fi > fi ? 1e5 : (l0 - k.left()) * 1000) + (k.sc - s0) + (k.got.fuse - f0) * 600 + (k.fi > fi ? 0 : (prog(k) - p0) * 250) + rand() * 5;
    if (k.state === 'lost') v -= 1e9; if (k.state === 'won') v += 1e6; if (v > bv) { bv = v; best = m; } } return best; }
function one(L, seed, sloppy, power) { const rand = rngOf(seed ^ 0x9e3779b9), g = new Game(L, { seed, quiet: true, power: power || 1 }); let guard = 0; while (g.state === 'play' && guard++ < 400) { const m = pick(g, rand, sloppy); if (!m) break; g.play(m[0], m[1]); } return g; }
const pct = (a, p) => { const s = a.slice().sort((x, y) => x - y); return s.length ? s[Math.min(s.length - 1, Math.floor(p * s.length))] : 0; };
const TARGET = [.97, .94, .9, .88, .62, .94, .9, .86, .84, .58, .9, .85, .82, .92, .55];
if (require.main === module) { const only = process.argv[2] ? process.argv[2].split(',') : null, n = +(process.argv[3] || 200), sloppy = .3, out = {}; let prev = {}; try { prev = JSON.parse(require('fs').readFileSync(__dirname + '/tuned.json', 'utf8')); } catch (e) {} Object.assign(out, prev);
  for (const L of LEVELS) { if (only && !only.includes(L.key)) continue;
    if (L.boss) { const rate = {}; let line = ''; for (const pw of [1, 1.25, 1.5, 1.75, 2]) { let win = 0, turns = []; for (let i = 0; i < n; i++) { const g = one(L, 3000 + i * 7919, sloppy, pw); if (g.state === 'won') { win++; turns.push(g.turn); } } rate[pw] = Math.round(100 * win / n); line += ' x' + pw + ' ' + rate[pw] + '%(' + pct(turns, .5) + 't)'; } out[L.key] = { rate }; console.log(L.key.padEnd(5), L.boss.name.padEnd(18), line); continue; }
    const big = Object.assign({}, L, { moves: 99 }), used = []; let bomb = 0, stuck = 0; for (let i = 0; i < n; i++) { const g = one(big, 5000 + i * 7919, sloppy); if (g.state === 'won') used.push(g.turn); else { used.push(999); if (g.why === 'bomb') bomb++; else stuck++; } }
    const t = L.hard ? TARGET[L.i] : TARGET[L.i], raw = pct(used, t), mv = Math.max(raw >= 999 ? L.moves : raw, 8), fin = Object.assign({}, L, { moves: mv }), sc = []; let win = 0; for (let i = 0; i < n; i++) { const g = one(fin, 90000 + i * 104729, sloppy); if (g.state === 'won') { win++; sc.push(g.sc); } }
    const r = v => Math.round(v / 50) * 50, floors = L.floors || [L], misty = floors.some(F => (F.map || []).join('').match(/[mMN]/) || F.mist);
    out[L.key] = { moves: misty ? Math.round(mv * 1.3) : mv, stars: [r(pct(sc, .5)), r(pct(sc, .82))], win: Math.round(100 * win / n) };
    console.log(L.key.padEnd(5), 'target', Math.round(t * 100) + '%', 'needs p50', String(pct(used, .5)).padStart(3), 'p' + Math.round(t * 100), String(raw).padStart(3), '-> moves', String(out[L.key].moves).padStart(3), 'bomb', String(Math.round(100 * bomb / n)).padStart(2) + '%', 'never', String(Math.round(100 * stuck / n)).padStart(2) + '%', 'win', String(out[L.key].win).padStart(3) + '%', 'stars', JSON.stringify(out[L.key].stars)); }
  require('fs').writeFileSync(__dirname + '/tuned.json', JSON.stringify(out)); }
module.exports = { one, pick, pct, rngOf };

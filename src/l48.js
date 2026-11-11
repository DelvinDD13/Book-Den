// ===== L48: Life arcs in the quest log (approved Nov 11 2026, mocks 6–8). An arc is a dated stretch of his life with its own steps:
// Tattoo week (the Steel plan set Nov 9), the Thanksgiving trip (off Nov 23 – Dec 7, Boston for Thanksgiving, Las Vegas Dec 3–4),
// the Friendsgiving Push (his eight books in his order, due Nov 27, at his own hours) and Year end (his Oct 16 goals).
// Steps tick themselves from what he logs where they can (a Steel session that day, a book finished, the date); the rest he taps.
// He can add his own arcs and steps. An arc with every step done moves to finished arcs with the day it closed.
(function () {
  const L48 = window.L48 = {};
  const esc = s => String(s == null ? '' : s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const O = k => { try { return getOverride(k) || {}; } catch (e) { return {}; } };
  const pad = n => String(n).padStart(2, '0');
  const iso = d => d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate());
  const today = () => iso(new Date());
  const dOf = s => new Date(String(s).slice(0, 10) + 'T12:00:00');
  const addD = (s, n) => { const d = dOf(s); d.setDate(d.getDate() + n); return iso(d); };
  const days = (a, b) => Math.round((dOf(b) - dOf(a)) / 864e5);
  const md = s => dOf(s).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  const hm = m => { m = Math.max(0, Math.round(m)); return Math.floor(m / 60) + ' h ' + pad(m % 60) + ' m'; };
  const hShort = m => { m = Math.max(0, Math.round(m)); return m % 60 ? hm(m) : Math.floor(m / 60) + ' h'; };
  const S = () => O('arcs');
  const save = p => { try { setOverride('arcs', p); } catch (e) {} };
  const steelOn = d => { try { const r = C2.habits(d, d)[d]; if (r && r.steel) return true; } catch (e) {} try { return L36.days().some(r => r.d === d); } catch (e) { return false; } };
  const st = t => { try { return getStatus(t) || null; } catch (e) { return null; } };
  const titles = rx => { try { return ALL_TITLES.filter(t => rx.test(t)); } catch (e) { return []; } };
  const readAny = rx => titles(rx).some(t => st(t) === 'read');
  const lenOf = t => { try { return L46.len(t) || 480; } catch (e) { return 480; } };
  const spOf = t => +O(t).sp || +O('rt0').sp || 2;
  // the version of a book he is using: the one he picked, else in progress, else finished, else the first
  const mine = rx => { const L = titles(rx); if (!L.length) return null; try { const p = L46.pick(L[0]); if (L.indexOf(p) >= 0) return p; } catch (e) {} return L.find(t => st(t) === 'currently-reading') || L.find(t => st(t) === 'read') || L[0]; };
  // book minutes left on a book: none if finished; the Audible reading less timer time since; else what progress says
  L48.bookLeft = function (rx) { if (readAny(rx)) return 0; const t = mine(rx); if (!t) return null; const len = lenOf(t); let left = null; try { left = L47.leftNow(t); } catch (e) {} if (left == null) left = Math.round(len * (1 - Math.min(99, +O(t).progress || 0) / 100)); return Math.max(0, Math.min(len, left)); };

  // ---------- the Friendsgiving Push ----------
  const PUSH = () => (window.L37 && L37.PUSH) || { due: '2026-11-27', books: [] };
  L48.pushStop = () => { const n = +S().stop || 0; const all = PUSH().books.length; return n > 0 && n < all ? n : all; };
  L48.pace = function (n) { const P = PUSH(); const B = P.books.slice(0, n || L48.pushStop()); let book = 0, listen = 0; B.forEach(b => { const left = L48.bookLeft(b[0]); if (left == null) return; const t = mine(b[0]); book += left; listen += left / (t ? spOf(t) : 2); });
    const t0 = today(); let plan = 0; for (let d = t0; d <= P.due; d = addD(d, 1)) { try { plan += L37.target(d); } catch (e) { plan += 180; } } let done = 0; try { done = L35.minutesOn(t0); } catch (e) {} plan = Math.max(0, plan - done);
    return { book: Math.round(book), listen: Math.round(listen), plan: Math.round(plan), gap: Math.round(plan - listen), n: B.length }; };

  // ---------- the arcs ----------
  const SOME = { thu: '2026-11-12', sat: '2026-11-14', tue: '2026-11-17' };
  function built() { const t = today(); const P = PUSH(); const stop = L48.pushStop();
    const A = [
      { id: 'tattoo', name: 'Tattoo week', from: '2026-11-12', to: '2026-11-17', key: '2026-11-14', sub: 'Nov 12–17: Thursday lift, Saturday lift then the tattoo, Tuesday lift',
        steps: [{ id: 'thu', t: 'Thursday: Fortress', s: 'Lift, Nov 12', auto: () => steelOn(SOME.thu) }, { id: 'satlift', t: 'Saturday: lift early', s: 'Shower and eat before the tattoo', auto: () => steelOn(SOME.sat) }, { id: 'tattoo', t: 'The tattoo', s: 'Saturday, Nov 14' },
          { id: 'rest', t: '48 hours with no hard sweating', s: 'Through Monday, Nov 16' }, { id: 'tue', t: 'Tuesday: Smallville', s: 'Keep it covered, wipe down pads, no hard stretch on that spot while it peels', auto: () => steelOn(SOME.tue) }] },
      { id: 'trip', name: 'Thanksgiving trip', from: '2026-11-23', to: '2026-12-07', key: '2026-11-26', sub: 'Nov 23 – Dec 7: Boston for Thanksgiving, Las Vegas Dec 3–4',
        steps: [{ id: 'flights', t: 'Flights: home → Boston → Las Vegas → home', s: 'The cheapest, most direct route' }, { id: 'off', t: 'Off work', s: 'Nov 23 – Dec 7', auto: () => t >= '2026-11-23' }, { id: 'boston', t: 'Boston for Thanksgiving', s: 'Thursday, Nov 26' }, { id: 'vegas', t: 'Las Vegas', s: 'Thursday and Friday, Dec 3–4' }, { id: 'home', t: 'Home', s: 'By Monday, Dec 7' }] },
      { id: 'push', name: 'Friendsgiving Push', from: '2026-11-07', to: P.due, key: P.due, push: true,
        steps: P.books.slice(0, stop).map((b, i) => { const ti = mine(b[0]); const len = ti ? lenOf(ti) : null; return { id: 'b' + i, t: b[1], s: len ? hm(len) + ' in Audible' : 'Not in your library', auto: () => readAny(b[0]), book: ti }; }) },
      { id: 'yearend', name: 'Year end', from: '2026-10-16', to: '2026-12-31', key: '2026-12-31', sub: 'The Cosmere, ACOTAR, Crescent City, John Gwynne, back to First Law, 280 h of listening', steps: yearSteps() }
    ];
    (S().own || []).forEach(a => A.push({ id: a.id, name: a.name, from: a.from || a.made || t, to: a.to, key: a.to, own: true, sub: '', steps: (a.steps || []).map(s => ({ id: s.id, t: s.t, s: s.s || '' })) }));
    return A; }
  function series(rx, label) { const L = []; const seen = new Set(); titles(rx).forEach(t => { const k = (window.L46 ? L46.work(t) : t); if (seen.has(k)) return; seen.add(k); L.push(t); }); const n = L.filter(t => (window.L46 ? L46.done(t) : st(t) === 'read')).length; return { n, of: L.length, label }; }
  function yearSteps() { const out = []; let c = null; try { c = L20.state('cosmere'); } catch (e) {}
    out.push({ id: 'cosmere', t: 'The Cosmere', s: c ? c.climbed + ' of ' + c.total + ' rungs' + (c.next ? ' · next: ' + (c.next.name || c.next.t) : '') : 'The Cosmere ladder', auto: () => !!(c && c.total && c.climbed >= c.total), next: c && c.next ? 'Cosmere ladder · ' + (c.next.name || c.next.t) : null });
    const ac = series(/^A Court of (Thorns and Roses|Mist and Fury|Wings and Ruin|Frost and Starlight|Silver Flames|Splintered Harmony)/, 'ACOTAR'); out.push({ id: 'acotar', t: 'ACOTAR', s: ac.n + ' of ' + ac.of + ' books', auto: () => ac.of > 0 && ac.n >= ac.of });
    const cc = series(/^House of (Earth and Blood|Sky and Breath|Flame and Shadow)/, 'Crescent City'); out.push({ id: 'crescent', t: 'Crescent City', s: cc.n + ' of ' + cc.of + ' books', auto: () => cc.of > 0 && cc.n >= cc.of });
    const gw = (() => { const L = ALL_TITLES.filter(t => /John Gwynne/.test((META[t] || {}).author || '')); return { n: L.filter(t => st(t) === 'read').length, of: L.length }; })(); out.push({ id: 'gwynne', t: 'John Gwynne', s: gw.n + ' of ' + gw.of + ' of his books you own', auto: () => gw.of > 0 && gw.n >= gw.of });
    const FL = /^(Last Argument of Kings|Best Served Cold|The Heroes|Red Country|Sharp Ends|A Little Hatred|The Trouble with Peace|The Wisdom of Crowds)/; const flB = titles(FL); const back = flB.some(t => { const o = O(t); return (st(t) === 'currently-reading' && String(o.started || '') >= '2026-10-16') || (st(t) === 'read' && String(o.finished || '') >= '2026-10-16'); });
    const flNow = flB.find(t => st(t) === 'currently-reading'); out.push({ id: 'firstlaw', t: 'Back to First Law', s: back ? 'Back in it' : flNow ? shortTitle(flNow) + ' is marked listening' : 'Start the next First Law book', auto: () => back });
    const hrs = L48.hours(); out.push({ id: 'h280', t: '280 h of listening', s: Math.floor(hrs / 60) + ' h of 280 h since Oct 16', auto: () => hrs >= 280 * 60 });
    return out; }
  // listening since Oct 16: books finished since then at his speed, plus logged time on books not finished
  L48.hours = function () { let m = 0; try { ALL_TITLES.forEach(t => { const o = O(t); if (st(t) === 'read' && String(o.finished || '') >= '2026-10-16') m += lenOf(t) / spOf(t); else (o.rs || []).forEach(x => { if (String(x[0]) >= '2026-10-16') m += +x[1] || 0; }); }); } catch (e) {} return Math.round(m); };
  function view(a) { const t = today(); const D = (S().done || {})[a.id] || {}; const steps = a.steps.map(s => { const auto = s.auto ? !!s.auto() : false; return Object.assign({}, s, { done: auto || !!D[s.id], auto: !!s.auto && auto }); });
    const n = steps.filter(s => s.done).length; const of = steps.length; const closed = (S().closed || {})[a.id] || null; const over = t > a.to;
    const nx = steps.find(s => !s.done); let next = nx ? (nx.next || nx.t) : null; let sub = a.sub || '';
    if (a.push) { const p = L48.pace(); sub = of + ' books in your order · ' + hm(p.listen) + ' left at 2x, ' + hShort(p.plan) + ' in your plan'; if (nx) { let tg = 180; try { tg = L37.target(t); } catch (e) {} next = nx.t + (t <= a.to ? ' · ' + hShort(tg) + ' today' : ''); } }
    if (a.id === 'yearend' && nx) next = nx.next || nx.t + ' · ' + nx.s;
    return Object.assign({}, a, { steps, n, of, pct: of ? Math.round(n / of * 100) : 0, next, sub, closed, over, full: of > 0 && n === of }); }
  L48.arcs = () => built().map(view);
  // an arc with every step done is closed on the day it got there (kept, so it never reopens)
  L48.sync = function () { const A = L48.arcs(); const c = Object.assign({}, S().closed || {}); let ch = false; A.forEach(a => { if (a.full && !c[a.id]) { c[a.id] = today(); ch = true; } if (c[a.id]) a.closed = c[a.id]; }); if (ch) save({ closed: c }); return A; };
  const left = a => { const t = today(); if (a.closed) return 'Closed ' + md(a.closed); if (t < a.key) { const n = days(t, a.key); return n === 1 ? '1 day' : n + ' days'; } if (t === a.key) return 'Today'; if (t <= a.to) { const n = days(t, a.to); return n ? 'ends in ' + n + (n === 1 ? ' day' : ' days') : 'ends today'; } return 'Ended'; };
  const card = a => { const k = dOf(a.key); return '<button class="arc' + (a.closed || a.over ? ' past' : '') + '" data-a="arc" data-k="' + esc(a.id) + '"><span class="dt"><small>' + k.toLocaleDateString('en-US', { month: 'short' }).toUpperCase() + '</small><b>' + k.getDate() + '</b><i>' + esc(left(a)) + '</i></span><span class="tx"><b>' + esc(a.name) + '</b><span>' + esc(a.sub ? a.sub + (a.push ? '' : ' · ' + a.n + ' of ' + a.of) : a.n + ' of ' + a.of + ' steps') + '</span><u><s style="width:' + a.pct + '%"></s></u>' + (a.next && !a.closed ? '<em>' + esc(a.next) + '</em>' : '') + '</span></button>'; };
  L48.section = function () { const A = L48.sync(); const on = A.filter(a => !a.closed && !a.over); const past = A.filter(a => a.closed || a.over);
    return '<h3>Arcs<small>' + on.length + ' open</small></h3><div class="arcs">' + on.map(card).join('') + '<button class="newarc" data-a="arcnew">New arc</button></div>' + (past.length ? '<h3>Finished arcs<small>' + past.length + '</small></h3><div class="arcs">' + past.map(card).join('') + '</div>' : ''); };
  L48.form = function () { return '<button class="back" data-a="arcback">‹ Quest log</button><p class="ah">New arc</p><label class="af"><span>What it is</span><input data-arc="name" maxlength="60" placeholder="Move into the new place"></label><label class="af"><span>The day it comes to</span><input data-arc="to" type="date" min="' + today() + '" value="' + addD(today(), 14) + '"></label><p class="fine">Add its steps on the next screen.</p><button class="pri" data-a="arcsave">Make the arc</button>'; };
  L48.detail = function (id) { const a = L48.arcs().find(x => x.id === id); if (!a) return L48.form(); const t = today();
    const row = (s, i) => '<button class="l37-q' + (s.done ? ' done' : '') + '" data-a="arcstep" data-k="' + esc(a.id + '|' + s.id) + '"' + (s.auto ? ' aria-disabled="true"' : '') + '><span class="num">' + (i + 1) + '</span><span class="l37-x"><b>' + esc(s.t) + '</b><i>' + esc(s.s) + (s.auto ? ' · from your log' : '') + '</i></span><em>' + (s.done ? '✓' : (a.push && s.book && st(s.book) === 'currently-reading') ? '<small class="now">Now</small>' : s.book ? '›' : '○') + '</em></button>';
    let h = '<button class="back" data-a="arcback">‹ Quest log</button><p class="ah">' + esc(a.name) + '</p><p class="as">' + esc(md(a.key)) + ' · ' + esc(left(a)) + '</p>';
    if (a.push) { const p = L48.pace(); const all = PUSH().books.length; const stop = L48.pushStop(); const alt = L48.pace(stop === all ? 6 : all); const altN = stop === all ? 6 : all; const altName = (PUSH().books[altN - 1] || [])[1];
      h += '<div class="pace"><b>' + (p.gap >= 0 ? hm(p.gap) + ' to spare' : hm(-p.gap) + ' short') + '</b><p>' + hm(p.listen) + ' of listening left at 2x (' + hm(p.book) + ' of book). Your plan gives ' + hShort(p.plan) + ' from today' + (+O('quests').rt ? ' at your own ' + hShort(+O('quests').rt) + ' a day.' : ': 3 h on weekdays, 13 h each weekend, 5 h a day Nov 23–27.') + '</p>' +
        (stop === all ? '<p>Stopping after ' + esc(altName) + ': ' + hm(alt.listen) + ', ' + (alt.gap >= 0 ? 'with ' + hm(alt.gap) + ' to spare.' : hm(-alt.gap) + ' short.') + '</p>' : '<p>All ' + all + ': ' + hm(alt.listen) + ', ' + (alt.gap >= 0 ? 'with ' + hm(alt.gap) + ' to spare.' : hm(-alt.gap) + ' short.') + '</p>') +
        '<div class="chips2"><button data-a="arcstop" data-k="' + all + '"' + (stop === all ? ' class="on"' : '') + '>All ' + (all === 8 ? 'eight' : all) + '</button><button data-a="arcstop" data-k="6"' + (stop === 6 ? ' class="on"' : '') + '>Stop after book 6</button></div></div>';
      h += '<h3>The books, in your order</h3>' + a.steps.map(row).join('');
      let tg = 180, so = 0; try { tg = L37.target(t); so = L35.minutesOn(t); } catch (e) {}
      const sat = (() => { const d = dOf(t); const w = d.getDay(); const n = w === 6 ? 0 : w === 0 ? -1 : 6 - w; return addD(t, n); })(); const sun = addD(sat, 1); let wk = 0; try { wk = (sat >= t ? L37.target(sat) : 0) + L37.target(sun); } catch (e) {}
      h += '<h3>Hours</h3>' + (t <= a.to ? '<div class="l37-q info"><span class="num">·</span><span class="l37-x"><b>Today: ' + hShort(tg) + '</b><i>' + (so ? hShort(so) + ' so far' : 'Nothing yet') + ' · the timer and Audible both count</i></span><em></em></div>' : '') +
        (sun <= a.to && sat < '2026-11-23' ? '<div class="l37-q info"><span class="num">·</span><span class="l37-x"><b>This weekend: ' + hShort(wk) + '</b><i>' + (sat >= t ? 'Sat ' + md(sat) + ' and ' : '') + 'Sun ' + md(sun) + '</i></span><em></em></div>' : '') +
        (t <= '2026-11-27' ? '<div class="l37-q info"><span class="num">·</span><span class="l37-x"><b>Nov 23–27: 5 h a day</b><i>Off work</i></span><em></em></div>' : '');
      h += '<h3>When it is done</h3><p class="fine">The Friendsgiving bookmark, and the arc moves to your finished arcs with the day you closed it.</p>'; return h; }
    h += '<h3>Steps<small>' + a.n + ' of ' + a.of + '</small></h3>' + a.steps.map(row).join('') + (a.own || a.id === 'trip' || a.id === 'tattoo' ? '<div class="addstep"><input data-arc="step" maxlength="80" placeholder="Add a step"><button data-a="arcadd" data-k="' + esc(a.id) + '">Add</button></div>' : '');
    h += '<p class="fine">' + (a.closed ? 'Closed ' + md(a.closed) + '.' : 'Steps with “from your log” tick themselves. Tap the others when they are done.') + '</p>' + (a.own ? '<button class="del" data-a="arcdel" data-k="' + esc(a.id) + '">Remove this arc</button>' : ''); return h; };
  // returns the next view for the quest log sheet
  L48.act = function (a, k, root) { const s = S();
    if (a === 'arc') return 'arc:' + k; if (a === 'arcback') return 'log'; if (a === 'arcnew') return 'arc:new';
    if (a === 'arcstop') { save({ stop: +k }); return null; }
    if (a === 'arcstep') { const [id, sid] = String(k).split('|'); const A = L48.arcs().find(x => x.id === id); const stp = A && A.steps.find(x => x.id === sid); if (!stp) return null; if (stp.book) { try { L37.close(); openSheet(stp.book); } catch (e) {} return 'keep'; } if (stp.auto) { try { toast('This one ticks itself from your log'); } catch (e) {} return null; }
      const done = Object.assign({}, s.done || {}); const D = Object.assign({}, done[id] || {}); if (D[sid]) delete D[sid]; else D[sid] = today(); done[id] = D; save({ done }); L48.sync(); return null; }
    if (a === 'arcsave') { const nm = (root.querySelector('[data-arc=name]') || {}).value || ''; const to = (root.querySelector('[data-arc=to]') || {}).value || ''; if (!nm.trim() || !/^\d{4}-\d\d-\d\d$/.test(to)) { try { toast('Give it a name and a day'); } catch (e) {} return null; }
      const id = 'own' + Date.now().toString(36); const own = (s.own || []).concat([{ id, name: nm.trim().slice(0, 60), to, made: today(), steps: [] }]); save({ own }); return 'arc:' + id; }
    if (a === 'arcadd') { const inp = root.querySelector('[data-arc=step]'); const tx = inp && inp.value.trim(); if (!tx) return null; const id = k; const sid = 's' + Date.now().toString(36);
      if ((s.own || []).some(x => x.id === id)) { const own = (s.own || []).map(x => x.id === id ? Object.assign({}, x, { steps: (x.steps || []).concat([{ id: sid, t: tx.slice(0, 80) }]) }) : x); save({ own }); }
      else { const extra = Object.assign({}, s.extra || {}); extra[id] = (extra[id] || []).concat([{ id: sid, t: tx.slice(0, 80), s: 'Added by you' }]); save({ extra }); } return null; }
    if (a === 'arcdel') { save({ own: (s.own || []).filter(x => x.id !== k) }); return 'log'; }
    return null; };
  // steps he adds to a built-in arc
  const _built = built; built = function () { const A = _built(); const X = S().extra || {}; A.forEach(a => { if (!a.own && X[a.id]) a.steps = a.steps.concat(X[a.id].map(x => ({ id: x.id, t: x.t, s: x.s || 'Added by you' }))); }); return A; };
  L48.CSS = '.arcs{margin:4px 0 6px}.arc{display:flex;gap:14px;width:100%;text-align:left;padding:12px 12px 12px 0;border:1px solid var(--d-line,rgba(243,239,230,.16));margin:0 0 10px;background:var(--d-bg2,#15131f);color:inherit}.arc.past{opacity:.7}.arc .dt{flex:0 0 66px;display:flex;flex-direction:column;align-items:center;justify-content:center;border-right:1px solid var(--d-line,rgba(243,239,230,.16))}.arc .dt small{font:600 10px var(--b-mono,"IBM Plex Mono"),monospace;letter-spacing:.12em;color:var(--d-acc,#e9a3b8)}.arc .dt b{font:400 30px/1 var(--b-disp,"Cormorant"),serif;color:var(--d-ink,#efe6d8)}.arc .dt i{font:500 10px var(--b-mono,"IBM Plex Mono"),monospace;font-style:normal;color:var(--d-mute,#9a8f82);margin-top:2px;text-align:center}.arc .tx{flex:1;min-width:0}.arc .tx b{display:block;font:600 17px "Barlow Condensed",Barlow,sans-serif;color:var(--d-ink,#efe6d8)}.arc .tx span{display:block;font-size:13px;line-height:1.35;color:var(--d-mute,#9a8f82);margin-top:2px}.arc .tx u{display:block;height:4px;margin-top:8px;background:rgba(243,239,230,.1)}.arc .tx u s{display:block;height:100%;background:var(--d-acc,#e9a3b8)}.arc .tx em{display:block;margin-top:7px;font-style:normal;font-size:13px;color:var(--d-ink,#efe6d8)}.arc .tx em:before{content:"Next  ";font:600 9.5px var(--b-mono,"IBM Plex Mono"),monospace;letter-spacing:.12em;color:var(--d-acc,#e9a3b8);text-transform:uppercase}' +
    '.newarc{width:100%;min-height:46px;text-align:center;border:1px dashed var(--d-acc,#e9a3b8);color:var(--d-acc,#e9a3b8);font:600 15px "Barlow Condensed",Barlow,sans-serif;letter-spacing:.04em;margin:2px 0 4px}.back{font:600 12px var(--b-mono,"IBM Plex Mono"),monospace;letter-spacing:.08em;color:var(--d-acc,#e9a3b8);text-transform:uppercase;margin:0 0 10px;display:block;padding:6px 0}.ah{font:400 32px/1 var(--b-disp,"Cormorant"),serif;color:var(--d-ink,#efe6d8);margin:0}.as{font:600 11px var(--b-mono,"IBM Plex Mono"),monospace;letter-spacing:.1em;text-transform:uppercase;color:var(--d-mute,#9a8f82);margin:8px 0 14px}' +
    '.pace{border:1px solid var(--d-acc,#e9a3b8);padding:12px 14px;margin:0 0 14px}.pace b{display:block;font:400 22px/1.1 var(--b-disp,"Cormorant"),serif;color:var(--d-acc,#e9a3b8)}.pace p{margin:6px 0 0;font-size:14px;line-height:1.4;color:var(--d-ink,#efe6d8)}.chips2{display:flex;gap:6px;margin-top:10px}.chips2 button{flex:1;min-height:40px;text-align:center;border:1px solid rgba(243,239,230,.22);font:600 13px "Barlow Condensed",Barlow,sans-serif}.chips2 .on{background:var(--d-ink,#efe6d8);color:var(--d-bg,#0c0a16);border-color:var(--d-ink,#efe6d8)}' +
    '.num{flex:0 0 30px;font:400 20px var(--b-disp,"Cormorant"),serif;color:var(--d-acc,#e9a3b8);text-align:center}.l37-q .now{font:600 9.5px var(--b-mono,monospace);letter-spacing:.1em;text-transform:uppercase;color:var(--d-acc,#e9a3b8)}.l37-q.info{cursor:default}' +
    '.af{display:block;margin:12px 0}.af span{display:block;margin-bottom:6px;font:600 10px var(--b-mono,"IBM Plex Mono"),monospace;letter-spacing:.1em;text-transform:uppercase;color:var(--d-mute,#8e8e95)}.af input,.addstep input{width:100%;min-height:44px;padding:8px 10px;background:var(--d-bg2,#17171b);border:1px solid rgba(243,239,230,.25);color:var(--d-ink,#f3efe6);font:400 16px Barlow,sans-serif}.addstep{display:flex;gap:8px;margin:4px 0 8px}.addstep button,.pri,.del{min-height:44px;padding:8px 16px;border:1px solid rgba(243,239,230,.25);font:600 15px "Barlow Condensed",Barlow,sans-serif}.pri{width:100%;background:var(--d-acc,#ff6a2a);border-color:var(--d-acc,#ff6a2a);color:var(--d-bg,#0f0f11)}.del{margin-top:14px;width:100%;color:var(--d-mute,#8e8e95)}';
})();

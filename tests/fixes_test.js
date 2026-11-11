// Nov 11 fixes: bookmarks carry the day they were really earned; Upcoming drops any book he owns, has started or has finished;
// a new build reloads the page only at a quiet moment, and never twice in half a minute.
const { chromium } = require('playwright'); const http = require('http'), fs = require('fs'), path = require('path');
const ROOT = process.env.ROOT || '/home/claude/book-den'; const MIME = { '.html': 'text/html', '.js': 'application/javascript', '.json': 'application/json', '.png': 'image/png', '.jpg': 'image/jpeg', '.woff2': 'font/woff2', '.gif': 'image/gif' };
const srv = http.createServer((req, res) => { let p = decodeURIComponent(req.url.split('?')[0]); if (p === '/') p = '/index.html'; fs.readFile(path.join(ROOT, p), (e, d) => { if (e) { res.writeHead(404); return res.end(); } res.writeHead(200, { 'Content-Type': MIME[path.extname(p)] || 'application/octet-stream' }); res.end(d); }); });
const store = fs.readFileSync(path.join(__dirname, 'store.json')); let pass = 0, fail = 0; const ok = (c, m) => { if (c) pass++; else { fail++; console.log('FAIL', m); } };
(async () => { await new Promise(r => srv.listen(8816, r)); const br = await chromium.launch(); const ctx = await br.newContext({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true });
  await ctx.route(u => !/^http:\/\/localhost/.test(u.href), r => r.abort()); await ctx.route(/script\.google\.com/, r => r.fulfill({ status: 200, contentType: 'application/json', body: store }));
  // first pass: which bookmarks the test data has earned, so the store can carry the Nov 11 first-sync stamp like his phone does
  const p0 = await ctx.newPage(); await p0.goto('http://localhost:8816/'); await p0.waitForTimeout(6000);
  const got0 = await p0.evaluate(() => L37.bookmarks().filter(b => b.got).map(b => b.id)); await p0.close();
  const S = JSON.parse(store); const e0 = {}; got0.forEach(id => { e0[id] = '2026-11-11'; }); const bj = { u: Date.now() - 3600e3, e: e0, init: 1 }; S.v.bmk = { u: bj.u, j: JSON.stringify(bj) };
  const store2 = JSON.stringify(S); await ctx.unroute(/script\.google\.com/); await ctx.route(/script\.google\.com/, r => r.fulfill({ status: 200, contentType: 'application/json', body: store2 }));
  const page = await ctx.newPage(); const errs = []; page.on('pageerror', e => errs.push(String(e)));
  await page.goto('http://localhost:8816/'); await page.waitForTimeout(7000); const R = (f, a) => page.evaluate(f, a);
  const st0 = await R(() => ({ stamp: (getOverride('bmk') || {}).stamp, n: Object.keys((getOverride('bmk') || {}).e || {}).length, nov: L37.bookmarks().filter(b => b.got && b.at === '2026-11-11').map(b => [b.id, L37.earnedOn(b)]) }));
  ok(got0.length > 5 && st0.n >= got0.length, 'the test store carries the first-sync dates: ' + got0.length);
  ok(st0.stamp === '2026-11-11', 'the first-sync day is kept as the stamp: ' + st0.stamp);
  ok(st0.nov.every(x => x[1] === '2026-11-11'), 'no bookmark shows the first-sync day unless the logs say so: ' + JSON.stringify(st0.nov));

  // ---------- 1. bookmark dates ----------
  // a finished series book: its bookmark is dated by the earliest finish date of that book
  const tog = await R(() => { const b = L29.B.tog; const rx = new RegExp(b.m, 'i'); const T = ALL_TITLES.filter(t => rx.test(t)); T.forEach(t => setOverride(t, { status: 'read', finished: '2026-04-02' })); L29.flush(); try { L37.syncMarks(true); } catch (e) {} const m = L37.bookmarks().find(x => x.id === 'bk:tog'); return { at: m.at, got: m.got }; });
  ok(tog.got && tog.at === '2026-04-02', 'a finished book is dated by its finish date, not the day the app noticed: ' + JSON.stringify(tog));
  // timer hours: the session that crossed the hour
  const clock = await R(() => { const t = ALL_TITLES.find(x => /^The Way of Kings/.test(x)); const old = (getOverride(t).rs || []); setOverride(t, { rs: [['2026-09-01T08:00', 40, 2, null], ['2026-09-03T21:10', 30, 2, null]].concat(old) }); L29.flush(); const S = []; ALL_TITLES.forEach(x => (getOverride(x).rs || []).forEach(r => S.push([String(r[0]), +r[1] || 0]))); S.sort((a, b) => a[0] < b[0] ? -1 : 1); let s = 0, want = null; for (const r of S) { s += r[1]; if (s >= 60) { want = r[0].slice(0, 10); break; } } const m = L37.bookmarks().find(b => b.id === 'clock1'); return { want, at: m.at, got: m.got }; });
  ok(clock.got && clock.at === clock.want && clock.want === '2026-09-03', 'the first timer hour is dated by the session that crossed it: ' + JSON.stringify(clock));
  const keep = await R(() => { L37.syncMarks(true); return { stamp: getOverride('bmk').stamp, nov: L37.bookmarks().filter(b => b.got && b.at === '2026-11-11').map(b => [b.id, L37.earnedOn(b)]) }; });
  ok(keep.stamp === '2026-11-11' && keep.nov.every(x => x[1] === '2026-11-11'), 'a new bookmark with an earlier date does not uncover the first-sync day: ' + JSON.stringify(keep));
  // a journal entry and a called theory
  const jot = await R(() => { const t = ALL_TITLES.find(x => /^The Way of Kings/.test(x)); const key = L35.keyFor(t); const at = new Date('2026-08-15T10:00:00').getTime(); setOverride(key, { n: [{ id: 'a1', at, t, k: 'theory', tx: 'Kaladin', ok: true, okAt: new Date('2026-10-20T09:00:00').getTime() }].concat(getOverride(key).n || []) }); const B = L37.bookmarks(); return { jot: B.find(b => b.id === 'jot1').at, th: B.find(b => b.id === 'theory').at }; });
  ok(jot.jot === '2026-08-15' && jot.th === '2026-10-20', 'the journal and theory bookmarks are dated by the entry and the day it was called: ' + JSON.stringify(jot));
  // the sheet shows a year for dates in other years
  const sheet = await R(async () => { const t = ALL_TITLES.find(x => /^The Way of Kings/.test(x)); const key = L35.keyFor(t); setOverride(key, { n: [{ id: 'a0', at: new Date('2025-12-30T10:00:00').getTime(), t, k: 'note', tx: 'x' }].concat(getOverride(key).n || []) }); document.querySelector('[data-l37="marks"]') ? document.querySelector('[data-l37="marks"]').click() : null; await new Promise(r => setTimeout(r, 600)); const r = document.getElementById('l37') && document.getElementById('l37').shadowRoot; return r ? [...r.querySelectorAll('.cell')].map(c => c.textContent).filter(x => /Earned/.test(x)).join(' | ') : ''; });
  ok(/Earned Dec 30, 2025/.test(sheet), 'a date from another year shows its year: ' + sheet.slice(0, 200));
  const nov = await R(() => ({ d: L35.today(), L: L37.bookmarks().filter(b => b.got && b.at === L35.today()).map(b => [b.id, L37.earnedOn(b)]) }));
  ok(nov.L.every(x => x[1] === nov.d), 'anything dated today was really earned today by the logs: ' + JSON.stringify(nov));
  await R(() => { try { document.querySelector('#l37') && document.querySelector('#l37').classList.remove('on'); } catch (e) {} });
  // shows, games and Steel carry their own day: marked watched or finished, or the tracked session that earned it
  const other = await R(() => { const sh = SHOWS.find(x => x.t === 'Hunter x Hunter'); setOverride(sKey(sh), { status: 'watched', finished: '2026-10-05' });
    const x = {}; ['Squat', 'Bench', 'Row', 'Press'].forEach(n => { x[n] = [[100, 8, 2, '', 1]]; }); setOverride('sl:2026-10-01', { day: 'sat', x }); L29.flush();
    const B = L37.bookmarks(); const at = id => (B.find(b => b.id === id) || {}).at; return { hxhs: at('bk:hxhs'), sat: at('bk:sat'), tue: at('bk:tue') }; });
  ok(other.hxhs === '2026-10-05', 'a show bookmark carries the day it was marked watched: ' + JSON.stringify(other));
  ok(other.sat === '2026-10-01', 'a Steel bookmark carries the day of the session that earned it');
  // a book he is reading again keeps the day of the first read
  const again = await R(() => { const t = ALL_TITLES.find(x => /^Mistborn: The Final Empire/.test(x)); setOverride(t, { status: 'read', finished: '2026-10-30', reads: [{ started: '2025-01-02', finished: '2025-02-10', myRating: 5 }] }); L29.flush(); return L37.bookmarks().find(b => b.id === 'bk:tfe').at; });
  ok(again === '2025-02-10', 'a reread book is dated by its first finish: ' + again);
  // a new bookmark earned today is dated today
  const fresh = await R(() => { const t = ALL_TITLES.find(x => /^A Court of Mist and Fury/.test(x)); setOverride(t, { status: 'read', finished: L35.today() }); L29.flush(); L37.syncMarks(true); return L37.bookmarks().find(b => b.id === 'bk:acomaf').at === L35.today(); });
  ok(fresh, 'a bookmark earned today is dated today');

  // ---------- 2. Upcoming drops what he owns, has started or has finished ----------
  const up = await R(() => { const names = L19.ordered('books').map(x => x.title); const t = 'A Married Little Christmas'; const had = names.indexOf(t) >= 0;
    // on his Goodreads shelf only: still upcoming
    if (!META[t]) { META[t] = { gr: true }; ALL_TITLES.push(t); } const still = L19.ordered('books').some(x => x.title === t);
    setOverride(t, { status: 'currently-reading' }); const gone = !L19.ordered('books').some(x => x.title === t);
    return { had, still, gone, ownedGR: L41.ownedBook('The Justice of One'), acosh: L19.ordered('books').some(x => x.title === 'A Court of Splintered Harmony') }; });
  ok(up.had && up.still, 'a book that is only on his Goodreads shelf stays in Upcoming');
  ok(up.gone, 'starting a book takes it off Upcoming');
  ok(up.ownedGR === false, 'a Goodreads shelf row does not count as owned');
  ok(up.acosh === false, 'A Court of Splintered Harmony, which he owns, is not in Upcoming');
  const own = await R(async () => { const i = L19.ordered('books').findIndex(x => x.title === 'A Conspiracy of Charming Monsters'); if (i < 0) return 'missing'; openSheet('up:books:' + i); await new Promise(r => setTimeout(r, 400)); const b = document.querySelector('#sheet .l41 [data-how="aud"]'); if (!b) return 'no button'; b.click(); await new Promise(r => setTimeout(r, 600)); const n = ALL_TITLES.filter(t => normT(t) === normT('A Conspiracy of Charming Monsters')).length; return [L19.ordered('books').some(x => x.title === 'A Conspiracy of Charming Monsters'), n].join(','); });
  ok(own === 'false,1', 'I own it on an out-now book takes it off Upcoming, with one copy in the library: ' + own);
  await R(() => { try { closeSheet(); } catch (e) {} });

  // ---------- 3. a new build reloads only at a quiet moment ----------
  const upd = await R(async () => { const log = []; L44.reload = () => log.push('reload'); try { sessionStorage.removeItem('den:upd'); } catch (e) {}
    const q0 = L44.quiet(); openSheet(ALL_TITLES[0]); await new Promise(r => setTimeout(r, 300)); const q1 = L44.quiet(); const t1 = L44.takeover(); closeSheet(); await new Promise(r => setTimeout(r, 300));
    const inp = document.createElement('input'); document.body.appendChild(inp); inp.focus(); const q2 = L44.quiet(); inp.remove();
    const t2 = L44.takeover(); const t3 = L44.go(); return { q0, q1, t1, q2, t2, t3, pend: L44.pending(), log }; });
  ok(upd.q0 === true && upd.q1 === false && upd.q2 === false, 'quiet means no sheet open and nothing being typed: ' + JSON.stringify(upd));
  ok(upd.t1 === false && upd.pend === true, 'with a sheet open the reload waits');
  ok(upd.t2 === true && upd.log.length === 1, 'once quiet, it reloads');
  ok(upd.t3 === false, 'never twice in half a minute');
  ok(errs.length === 0, 'no page errors: ' + errs.slice(0, 2).join(' | '));
  await br.close(); srv.close(); console.log(pass + ' passed, ' + fail + ' failed'); process.exit(fail ? 1 : 0); })();

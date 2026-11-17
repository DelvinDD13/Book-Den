// L60: pages on every book, and the recap. Each book's page carries its print page count as a number he can tap and change, and
// a tick that says whether the finish on the page counts. The Stats view is Recap: its button stands second in the row of views
// and its tabs are Week, Month, Year and All (All is the old Stats page). A span shows its name over its latest covers, six count
// boxes, what was finished as a run of covers for each of its parts (a year by month, a month by week, a week by day), and a few
// records. "What counts" puts a tick on every book: a tap takes that finish out of every count or puts it back, and one switch
// says whether rereads count. The page fits the phone width and nothing on it moves.
const { chromium } = require('playwright'); const http = require('http'), fs = require('fs'), path = require('path');
const ROOT = process.env.ROOT || '/home/claude/book-den';
const MIME = { '.html': 'text/html', '.js': 'application/javascript', '.json': 'application/json', '.png': 'image/png', '.jpg': 'image/jpeg', '.woff2': 'font/woff2' };
const srv = http.createServer((req, res) => { let p = decodeURIComponent(req.url.split('?')[0]); if (p === '/') p = '/index.html'; if (p === '/upcoming.json') p = '/tests/upcoming_fixture.json'; fs.readFile(path.join(ROOT, p), (e, d) => { if (e) { res.writeHead(404); return res.end(); } res.writeHead(200, { 'Content-Type': MIME[path.extname(p)] || 'application/octet-stream' }); res.end(d); }); });
const store = fs.readFileSync(path.join(__dirname, 'store.json')); let pass = 0, fail = 0; const ok = (c, m) => { if (c) pass++; else { fail++; console.log('FAIL', m); } };
const fake = u => { let h = 0; for (const c of u) h = (h * 31 + c.charCodeAt(0)) >>> 0; const a = h % 360, b = (a + 140) % 360;
  return '<svg xmlns="http://www.w3.org/2000/svg" width="400" height="600" viewBox="0 0 400 600"><rect width="400" height="600" fill="hsl(' + a + ' 55% 22%)"/><circle cx="200" cy="230" r="150" fill="hsl(' + b + ' 60% 48%)"/></svg>'; };
(async () => { await new Promise(r => srv.listen(8883, r)); const br = await chromium.launch(); const ctx = await br.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 1, isMobile: true, hasTouch: true });
  await ctx.route(u => !/^http:\/\/localhost/.test(u.href), r => r.request().resourceType() === 'image' ? r.fulfill({ status: 200, contentType: 'image/svg+xml', body: fake(r.request().url()) }) : r.abort());
  await ctx.route(/script\.google\.com/, r => r.fulfill({ status: 200, contentType: 'application/json', body: store }));
  await ctx.addInitScript(() => { const T = new Date('2026-11-14T15:00:00').getTime(); const D0 = Date; const off = T - D0.now(); class D extends D0 { constructor(...a) { if (!a.length) super(D0.now() + off); else super(...a); } static now() { return D0.now() + off; } } window.Date = D; });
  const page = await ctx.newPage(); const errs = []; page.on('pageerror', e => errs.push(String(e))); page.on('console', m => { if (/l60/.test(m.text())) errs.push(m.text()); });
  await page.addInitScript(() => { const iv = setInterval(() => { if (window.L25 && L25.announce && !L25.announce._q) { L25.announce = function () {}; L25.announce._q = 1; } }, 30); setTimeout(() => clearInterval(iv), 30000); });
  await page.goto('http://localhost:8883/'); await page.waitForTimeout(7500); const R = (f, a) => page.evaluate(f, a); const wait = ms => page.waitForTimeout(ms);
  await R(() => { switchLib('books'); }); await wait(500);

  // ---- its way in, and its tabs ----
  const way = await R(() => { const row = [...document.querySelectorAll('#lib-books .view-toggle button')].map(b => b.textContent.trim()); const b = document.getElementById('btn-stats'); b.click();
    return { row, tabs: [...document.querySelectorAll('#nav button')].map(x => x.textContent.trim()), on: (document.querySelector('#nav button.active') || {}).textContent, rc: !!document.querySelector('#content .rc'), btnOn: b.classList.contains('active'), view: currentView }; });
  ok(way.row[0] === 'Bookcase' && way.row[1] === 'Recap' && way.row.indexOf('Stats') < 0, 'Recap is the second button in the row of views, in place of Stats: ' + way.row.slice(0, 3).join(', '));
  ok(way.tabs.join('|') === 'Week|Month|Year|All' && way.on === 'Week' && way.rc && way.btnOn && way.view === 'stats', 'it opens on the week, behind four tabs: ' + way.tabs.join(', ') + ' / ' + way.on);

  // ---- the year: the counts are the finishes of the year, worked out here from his rows ----
  const yr = await R(() => { L60.open('year', 0); const BOOK = t => !/^(show|game|cv|hk|ab|gr|badges|up|jr):/.test(t); const fam = t => { const v = L46.versions(t); return v && v.length ? v.slice().sort()[0] : t; }; const seen = new Set(), E = [];
    ALL_TITLES.filter(BOOK).forEach(t => { const o = getOverride(t) || {}; if (getStatus(t) !== 'read' || !o.finished || String(o.finished).slice(0, 4) !== '2026') return; const k = fam(t) + '|' + String(o.finished).slice(0, 10); if (seen.has(k)) return; seen.add(k); E.push({ t, d: String(o.finished).slice(0, 10), pg: L60.pages(t), min: +L46.len(t) || 0 }); });
    const cells = [...document.querySelectorAll('#content .rc .rc-st > div')].map(c => [c.querySelector('b').textContent, c.querySelector('span').textContent]); const months = new Set(E.map(x => x.d.slice(0, 7)));
    return { n: E.length, pg: E.reduce((s, x) => s + x.pg, 0), min: E.reduce((s, x) => s + x.min, 0), cells, title: document.querySelector('#content .rc-hero h2').textContent, fan: document.querySelectorAll('#content .rc-fan span').length, parts: document.querySelectorAll('#content .rc [data-l60m]').length, months: months.size,
      covers: document.querySelectorAll('#content .rc .rc-run .cv').length, tag: document.querySelector('#content .rc .rc-k i').textContent, next: document.querySelector('#content .rc [data-l60=next]').disabled, total: L60.total(2026), recs: [...document.querySelectorAll('#content .rc .rc-r small')].map(x => x.textContent), w: document.documentElement.scrollWidth,
      firstPart: (() => { const p = document.querySelector('#content .rc [data-l60m]'); const k = p.dataset.l60m; const L = E.filter(x => x.d.slice(0, 7) === k); return { tag: p.querySelector('.rc-mh i').textContent, em: p.querySelector('.rc-mh em').textContent, n: L.length, pg: L.reduce((s, x) => s + x.pg, 0), cv: p.querySelectorAll('.cv').length }; })() }; });
  const nf = n => Math.round(n).toLocaleString('en-US');
  ok(yr.title === '2026' && yr.n > 20 && yr.total.books === yr.n && yr.total.pages === yr.pg, 'the year counts every dated finish of 2026 once: ' + yr.n + ' books, ' + yr.pg + ' pages (' + JSON.stringify(yr.total) + ')');
  ok(yr.cells.length === 6 && yr.cells.map(c => c[1]).join('|') === 'Books|Pages|Hours|Hours at 1.8x|Pages a day|Pages a book', 'six count boxes: ' + yr.cells.map(c => c[1]).join(', '));
  ok(yr.cells[0][0] === String(yr.n) && yr.cells[1][0] === nf(yr.pg) && yr.cells[2][0] === nf(yr.min / 60) && yr.cells[3][0] === nf(yr.min / 60 / 1.8), 'Books, Pages, Hours and the hours at 1.8x are those sums: ' + yr.cells.slice(0, 4).map(c => c[0]).join(', '));
  ok(yr.fan === 3 && yr.tag === String(yr.n) && yr.next === true, 'the name stands over the three latest covers, the Finished tag carries the count, and there is no later year to go to');
  ok(yr.parts === yr.months && yr.covers === yr.n, 'one run of covers for each month that holds a finish, every finish in one of them: ' + yr.parts + ' months, ' + yr.covers + ' covers');
  ok(yr.firstPart.tag === String(yr.firstPart.n) && yr.firstPart.em === nf(yr.firstPart.pg) + ' pages' && yr.firstPart.cv === yr.firstPart.n, 'a month carries its own count and pages: ' + JSON.stringify(yr.firstPart));
  ok(yr.recs.indexOf('Longest') >= 0 && yr.recs.indexOf('Shortest') >= 0 && yr.recs.indexOf('Busiest') >= 0, 'records under the covers: ' + yr.recs.join(', '));
  ok(yr.w <= 390, 'the year fits the phone width: ' + yr.w);

  // ---- from a month to a week to a book; earlier and later ----
  const nav = await R(() => { const o = {}; const p = [...document.querySelectorAll('#content .rc [data-l60m]')].pop(); o.k = p.dataset.l60m; p.click(); o.tab = L60.tab(); o.title = document.querySelector('#content .rc-hero h2').textContent; o.weeks = document.querySelectorAll('#content .rc [data-l60w]').length;
    const D = L60.data('month', (+o.k.slice(0, 4) - 2026) * 12 + (+o.k.slice(5, 7) - 11)); o.monthBooks = D.cur.books; o.cell = document.querySelector('#content .rc .rc-st b').textContent; const w = document.querySelector('#content .rc [data-l60w]'); o.wk = w.dataset.l60w; w.click(); o.tab2 = L60.tab(); o.title2 = document.querySelector('#content .rc-hero h2').textContent;
    o.days = document.querySelectorAll('#content .rc div.rc-mo').length; const c = document.querySelector('#content .rc .rc-run button[data-l60t]'); o.want = decodeURIComponent(c.dataset.l60t); c.click(); o.sheet = document.getElementById('sheet').classList.contains('open') ? sheetTitle : ''; closeSheet();
    L60.open('week', 0); o.now = document.querySelector('#content .rc-hero h2').textContent; document.querySelector('#content .rc [data-l60=prev]').click(); o.prev = document.querySelector('#content .rc-hero h2').textContent; document.querySelector('#content .rc [data-l60=next]').click(); o.back = document.querySelector('#content .rc-hero h2').textContent; document.querySelector('#content .rc [data-l60=next]').click(); o.stay = document.querySelector('#content .rc-hero h2').textContent; return o; });
  const MON = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  ok(nav.tab === 'month' && nav.title === MON[+nav.k.slice(5, 7) - 1] && nav.cell === String(nav.monthBooks) && nav.weeks > 0, 'a tap on a month opens that month, by week: ' + nav.title + ', ' + nav.monthBooks + ' books, ' + nav.weeks + ' weeks');
  ok(nav.tab2 === 'week' && /^[A-Z][a-z]{2} \d+ – /.test(nav.title2) && nav.days > 0, 'a tap on a week opens that week, by day: ' + nav.title2 + ', ' + nav.days + ' days');
  ok(nav.sheet === nav.want, 'in a week a tap on a cover opens that book: ' + nav.sheet);
  ok(nav.now === 'Nov 9 – 15' && nav.prev === 'Nov 2 – 8' && nav.back === 'Nov 9 – 15' && nav.stay === 'Nov 9 – 15', 'earlier and later step a week at a time and stop at this week: ' + [nav.now, nav.prev, nav.back, nav.stay].join(' / '));

  // ---- what counts ----
  const wc = await R(() => { const o = {}; L60.open('year', 0); const b0 = L60.total(2026); document.querySelector('#content .rc [data-l60=edit]').click(); o.ed = L60.editing(); o.btn = document.querySelector('#content .rc [data-l60=edit]').textContent; o.books = document.querySelectorAll('#content .rc .rc-b').length; o.ticks = document.querySelectorAll('#content .rc .rc-b .tk').length; o.sw = !!document.querySelector('#content .rc [data-l60=rr]'); o.recs = document.querySelectorAll('#content .rc .rc-r').length;
    const b = document.querySelectorAll('#content .rc .rc-b')[2]; const key = b.dataset.l60c, i = key.lastIndexOf('|'), t = decodeURIComponent(key.slice(0, i)), d = key.slice(i + 1); o.t = t; o.pg = L60.pages(t); b.click(); const b1 = L60.total(2026); o.d = [b0.books - b1.books, b0.pages - b1.pages]; o.nc = (getOverride(t).nc || []).join(); o.dWant = d;
    const again = [...document.querySelectorAll('#content .rc .rc-b')].find(x => x.dataset.l60c === key); o.out = again.classList.contains('out') && again.getAttribute('aria-pressed') === 'false'; o.tag = document.querySelector('#content .rc .rc-k i').textContent === String(b1.books); o.still = document.querySelectorAll('#content .rc .rc-b').length;
    document.querySelector('#content .rc [data-l60=edit]').click(); o.done = !L60.editing() && !document.querySelector('#content .rc .tk'); o.grey = document.querySelectorAll('#content .rc .rc-run .cv.out').length; o.covers = document.querySelectorAll('#content .rc .rc-run .cv').length;
    document.querySelector('#content .rc [data-l60=edit]').click(); [...document.querySelectorAll('#content .rc .rc-b')].find(x => x.dataset.l60c === key).click(); const b2 = L60.total(2026); o.restored = b2.books === b0.books && b2.pages === b0.pages && !(getOverride(t).nc || []).length; document.querySelector('#content .rc [data-l60=edit]').click(); o.n0 = b0.books; return o; });
  ok(wc.ed && wc.btn === 'Done' && wc.books === wc.n0 && wc.ticks === wc.books && wc.sw && wc.recs === 0, '"What counts" puts a tick on every book and shows the rereads switch: ' + wc.ticks + ' ticks on ' + wc.books + ' books');
  ok(wc.d[0] === 1 && wc.d[1] === wc.pg && wc.nc === wc.dWant && wc.out && wc.tag, 'a tap takes that finish out of every count: one book and its ' + wc.pg + ' pages fewer (' + wc.t.slice(0, 30) + ')');
  ok(wc.still === wc.books && wc.done && wc.grey === 1 && wc.covers === wc.n0, 'a book that is out stays on the page, greyed, and Done puts the ticks away: ' + wc.grey + ' grey of ' + wc.covers);
  ok(wc.restored, 'a second tap puts it back, and the counts return exactly');

  // ---- rereads ----
  const rr = await R(() => { const o = {}; const E = L60.events().filter(x => x.d.slice(0, 4) === '2026'); const e = E[E.length - 3], t = e.t; o.t = t; o.was = L60.reads(t).map(r => r.re).join(); const b0 = L60.total(2026);
    setOverride(t, { readCount: 2 }); const r1 = L60.reads(t).pop(); o.re = r1.re; o.outOn = r1.out; o.same = L60.total(2026).books === b0.books;
    L60.open('year', 0); L60.edit(true); o.sticker = [...document.querySelectorAll('#content .rc .rc-b')].filter(b => b.querySelector('.tg.re')).length; const sw = document.querySelector('#content .rc [data-l60=rr]'); o.swOn = sw.classList.contains('on'); sw.click(); o.off = !L60.rereads() && (getOverride('recap') || {}).rr === 0;
    o.outOff = L60.reads(t).pop().out; o.minus = b0.books - L60.total(2026).books; const b = [...document.querySelectorAll('#content .rc .rc-b')].find(x => x.querySelector('.tg.re')); o.greyed = b.classList.contains('out'); b.click(); o.yc = (getOverride(t).yc || []).join(); o.forced = !L60.reads(t).pop().out && L60.total(2026).books === b0.books;
    document.querySelector('#content .rc [data-l60=rr]').click(); o.on = L60.rereads(); o.stillIn = !L60.reads(t).pop().out; setOverride(t, { readCount: 1, yc: [], nc: [] }); L60.edit(false); o.clean = L60.total(2026).books === b0.books && !L60.reads(t).pop().re; o.d = e.d; return o; });
  ok(rr.was === 'false' && rr.re === true && rr.outOn === false && rr.same && rr.sticker === 1 && rr.swOn, 'a finish with an earlier read behind it is a reread, wears the sticker, and counts while the switch is on');
  ok(rr.off && rr.outOff === true && rr.minus === 1 && rr.greyed, 'with "Rereads count" off the reread is out of the counts: ' + rr.minus + ' fewer');
  ok(rr.yc === rr.d && rr.forced, 'and one reread can still be put in by hand');
  ok(rr.on && rr.stillIn && rr.clean, 'the switch goes back on, and the book is left as it was');

  // ---- the book's own page ----
  const bk = await R(() => { const o = {}; const E = L60.events().filter(x => x.d.slice(0, 4) === '2026' && x.pg); const e = E[E.length - 1], t = e.t; o.t = t; openSheet(t); const c = document.querySelector('#sheet .l60-pc'); o.cell = !!c; o.lab = c && c.querySelector('small').textContent; const b = c && c.querySelector('[data-l60pg=edit]'); o.shown = b && b.textContent; o.pg = e.pg;
    b.click(); const i = document.getElementById('l60in'); o.input = !!i && i.value === String(e.pg) && !!document.querySelector('#sheet [data-l60pg=save]') && !!document.querySelector('#sheet [data-l60pg=x]'); i.value = String(e.pg + 11); document.querySelector('#sheet [data-l60pg=save]').click(); o.saved = L60.pages(t); o.row = getOverride(t).pg; o.after = document.querySelector('#sheet [data-l60pg=edit]').textContent;
    document.querySelector('#sheet [data-l60pg=edit]').click(); document.getElementById('l60in').value = '5'; document.querySelector('#sheet [data-l60pg=x]').click(); o.cancel = L60.pages(t) === e.pg + 11 && !document.getElementById('l60in'); setOverride(t, { pg: null }); o.back = L60.pages(t) === e.pg;
    const ct = document.querySelector('#sheet .l60-ct'); o.ct = !!ct && ct.classList.contains('on') && ct.dataset.l60ct === e.d; const n0 = L60.total(2026).books; ct.click(); o.ctOff = !document.querySelector('#sheet .l60-ct').classList.contains('on') && L60.total(2026).books === n0 - 1; document.querySelector('#sheet .l60-ct').click(); o.ctOn = document.querySelector('#sheet .l60-ct').classList.contains('on') && L60.total(2026).books === n0; closeSheet();
    const none = ALL_TITLES.find(x => !/^(show|game|cv|hk|ab|gr|badges|up|jr):/.test(x) && !L60.pages(x) && getStatus(x) !== 'read'); o.none = none || ''; if (none) { openSheet(none); const a = document.querySelector('#sheet [data-l60pg=edit]'); o.add = a && a.textContent; o.noTick = !document.querySelector('#sheet .l60-ct'); closeSheet(); } return o; });
  ok(bk.cell && bk.lab === 'Pages' && bk.shown === nf(bk.pg), 'a book\'s page shows its page count as a number to tap: ' + bk.shown + ' (' + bk.t.slice(0, 30) + ')');
  ok(bk.input && bk.saved === bk.pg + 11 && bk.row === bk.pg + 11 && bk.after === nf(bk.pg + 11), 'a tap opens the number for typing, and Save keeps it on the book\'s row: ' + bk.saved);
  ok(bk.cancel && bk.back, 'Cancel leaves the count alone, and with his own number gone the library\'s count stands again');
  ok(bk.ct && bk.ctOff && bk.ctOn, 'the finish on the page has a Counts tick, and it takes the book out of the recap and puts it back');
  ok(!bk.none || (bk.add === 'Add' && bk.noTick), 'a book with no count says Add, and a book not finished has no tick: ' + bk.none.slice(0, 30));

  // ---- the look holds, and the old page is still there ----
  const look = await R(() => { const o = {}; L60.open('month', -1); const c = document.querySelector('#content .rc .rc-run .cv') || document.querySelector('#content .rc .rc-fan span'); const s = getComputedStyle(c); o.frame = s.borderTopWidth + ' ' + s.borderTopColor; o.shadow = s.boxShadow; const css = document.getElementById('l60css').textContent; o.still = !/animation|transition|@keyframes/.test(css); o.w = document.documentElement.scrollWidth;
    L60.open('month', -1); L60.edit(true); o.wEd = document.documentElement.scrollWidth; const tk = document.querySelector('#content .rc .tk'); o.tk = tk ? tk.getBoundingClientRect().width : 0; L60.edit(false);
    document.querySelector('#nav [data-l60v=all]').click(); o.all = !!document.querySelector('#content .stats') && !document.querySelector('#content .rc'); o.tabsStay = document.querySelectorAll('#nav [data-l60v]').length === 4; document.getElementById('btn-genre').click(); o.gone = !document.querySelector('#content .rc') && !document.querySelector('#nav [data-l60v]'); document.getElementById('btn-stats').click(); o.remembers = L60.tab(); L60.open('week', 0); return o; });
  ok(look.frame === '2px rgb(255, 255, 255)' && /[34]px [34]px 0px/.test(look.shadow), 'covers keep their white frame and hard shadow (the tone-down pass leaves them alone): ' + look.frame + ' / ' + look.shadow);
  ok(look.still, 'nothing on the page animates');
  ok(look.w <= 390 && look.wEd <= 390 && look.tk >= 28, 'the month and its What counts mode fit the phone width, and a tick is big enough to see: ' + [look.w, look.wEd, look.tk].join(', '));
  ok(look.all && look.tabsStay, 'All is the old Stats page, behind the same four tabs');
  ok(look.gone && look.remembers === 'all', 'another view puts the recap away, and Recap comes back on the tab he left');
  ok(errs.length === 0, 'no page errors: ' + errs.slice(0, 3).join(' | '));
  console.log(pass + ' passed, ' + fail + ' failed'); await br.close(); srv.close(); process.exit(fail ? 1 : 0); })();

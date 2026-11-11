const { chromium } = require('playwright'); const http = require('http'), fs = require('fs'), path = require('path');
const ROOT = process.env.ROOT || '/home/claude/book-den'; const MIME = { '.html': 'text/html', '.js': 'application/javascript', '.json': 'application/json', '.png': 'image/png', '.jpg': 'image/jpeg', '.woff2': 'font/woff2', '.gif': 'image/gif' };
const srv = http.createServer((req, res) => { let p = decodeURIComponent(req.url.split('?')[0]); if (p === '/') p = '/index.html'; fs.readFile(path.join(ROOT, p), (e, d) => { if (e) { res.writeHead(404); return res.end(); } res.writeHead(200, { 'Content-Type': MIME[path.extname(p)] || 'application/octet-stream' }); res.end(d); }); });
const store = fs.readFileSync(path.join(__dirname, 'store.json')); let pass = 0, fail = 0; const ok = (c, m) => { if (c) pass++; else { fail++; console.log('FAIL', m); } };
(async () => { await new Promise(r => srv.listen(8806, r)); const br = await chromium.launch(); const ctx = await br.newContext({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true });
  await ctx.route(u => !/^http:\/\/localhost/.test(u.href), r => r.abort()); await ctx.route(/script\.google\.com/, r => r.fulfill({ status: 200, contentType: 'application/json', body: store }));
  const page = await ctx.newPage(); const errs = []; page.on('pageerror', e => errs.push(String(e)));
  await page.goto('http://localhost:8806/'); await page.waitForTimeout(7000); const R = f => page.evaluate(f);
  // descriptions: what the thing is, and nothing else
  ok(await R(() => { const all = (UPCOMING.books || []).concat(UPCOMING.games || []); return all.length === 25 && all.every(x => x.note && !/\$|pre-?orders?|demo|closest thing|in decades|standard-setter|Koschei|EON headquarters|Madoc/i.test(x.note)) && UPCOMING.games.every(x => x.genre); }), 'every Upcoming description is plain: no prices, pre-orders, comparisons or plot from later books');
  await R(() => switchLib('books')); await page.waitForTimeout(1500);
  const n0 = await R(() => L19.ordered('books').length);
  ok(await R(() => { const L = L19.ordered('books').map(x => x.title); const lib = ALL_TITLES.filter(t => META[t] && META[t].gr === false).map(t => normT(t)); return L.every(t => lib.indexOf(normT(t)) < 0) && L.indexOf('Seven and the Swift') >= 0; }), 'the Upcoming row lists only books that are not in the library');
  await R(() => { const i = L19.ordered('books').findIndex(x => x.title === 'Seven and the Swift'); openSheet('up:books:' + i); }); await page.waitForTimeout(500);
  ok(await R(() => { const b = document.querySelector('#sheet .sheet-body'); const t = b.textContent; const btn = [...b.querySelectorAll('.l41 button')].map(x => x.textContent); return /Seven and the Swift/.test(t) && /The third and last Shield of Sparrows book\. 656 pages\./.test(t) && btn.length === 2 && btn[0] === 'I own it on Audible' && btn[1] === 'I own it on Kindle or paper' && !/buy|pre-?order|shop|\$/i.test(t) && b.querySelectorAll('.up-src a').length >= 1 && [...b.querySelectorAll('.l41 button')].every(x => x.getBoundingClientRect().height >= 44); }), 'a book page in Upcoming: plain description, two "I own it" buttons, sources kept, nothing to buy');
  await R(() => document.querySelector('#sheet .l41 button[data-how=aud]').click()); await page.waitForTimeout(900);
  ok(await R(() => { const t = 'Seven and the Swift'; const m = META[t] || {}; return ALL_TITLES.indexOf(t) >= 0 && m.gr === false && m.aud === true && getStatus(t) === 'to-read' && m.author === 'Devney Perry' && (SERIES_OF[t] || m.series) === 'Shield of Sparrows' && !!GENRE_OF[t] && sheetTitle === t && (getOverride('upown').v || {})['b:' + t].kind === 'book' && /^https:/.test(getOverride('cv:' + t).url || ''); }), 'it joins the library as an owned Audible book in its series, with its cover, and its page opens');
  ok(await R(() => L19.ordered('books').every(x => x.title !== 'Seven and the Swift')) && (await R(() => L19.ordered('books').length)) === n0 - 1, 'and it leaves the Upcoming row');
  ok(await R(() => { const b = document.querySelector('#sheet .sheet-body .l41-back button'); return !!b && /Put it back/.test(b.textContent); }), 'its library page offers a way back');
  await R(() => closeSheet());
  // games: one button per platform he plays on
  await R(() => switchLib('screen')); await page.waitForTimeout(1500);
  await R(() => { const i = L19.ordered('games').findIndex(x => x.title === 'Brigandine: Abyss'); openSheet('up:games:' + i); }); await page.waitForTimeout(500);
  ok(await R(() => { const btn = [...document.querySelectorAll('#sheet .l41 button')].map(x => x.textContent); return btn.join('|') === 'I own it on PS5|I own it on Switch 2' && /A hex-grid strategy RPG with six story campaigns/.test(document.querySelector('#sheet .sheet-body').textContent); }), 'a game page: one button for each of his platforms it is on');
  await R(() => document.querySelector('#sheet .l41 button[data-how=PS5]').click()); await page.waitForTimeout(900);
  ok(await R(() => { const g = GAMES.find(x => x.t === 'Brigandine: Abyss'); return g && g.p === 'PS5' && g.g === 'Strategy RPG' && gStatus(g) === 'backlog' && sheetTitle === 'game:Brigandine: Abyss' && L19.ordered('games').every(x => x.title !== 'Brigandine: Abyss') && /Brigandine: Abyss/.test(document.querySelector('#lib-other').textContent); }), 'the game lands in the backlog on PS5, shows in the Games grid, and leaves Upcoming');
  await R(() => closeSheet());
  await R(() => { const i = L19.ordered('games').findIndex(x => /Sunrise on the Reaping/.test(x.title)); openSheet('up:games:' + i); }); await page.waitForTimeout(400);
  ok(await R(() => { const btn = [...document.querySelectorAll('#sheet .l41 button')].map(x => x.textContent); return btn.length === 1 && btn[0] === 'Add it to my watch list'; }), 'a film gets a watch-list button instead');
  await R(() => document.querySelector('#sheet .l41 button').click()); await page.waitForTimeout(900);
  ok(await R(() => { const s = SHOWS.find(x => /Sunrise on the Reaping/.test(x.t)); return s && s.k === 'movie' && sStatus(s) === 'queue'; }), 'the film goes on the To watch list as a movie');
  // the second tile still opens the right page after the rows were filtered
  await R(() => closeSheet()); await R(() => { const L = L19.ordered('games'); window.T2 = L[1].title; document.querySelectorAll('#lib-other .up-sec .up-cv')[1].click(); }); await page.waitForTimeout(500);
  ok(await R(() => new RegExp(T2.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).test(document.querySelector('#sheet h2').textContent)), 'tiles still open their own page after items leave the row');
  await R(() => closeSheet());
  // it all survives closing and reopening the app
  await page.reload(); await page.waitForTimeout(7000);
  ok(await R(() => { const g = GAMES.find(x => x.t === 'Brigandine: Abyss'); const t = 'Seven and the Swift'; return g && g.p === 'PS5' && ALL_TITLES.indexOf(t) >= 0 && META[t].gr === false && SHOWS.some(x => /Sunrise on the Reaping/.test(x.t)) && L19.ordered('games').every(x => x.title !== 'Brigandine: Abyss') && L19.ordered('books').every(x => x.title !== t); }), 'after reopening the app everything is still in the library and off the Upcoming rows');
  // and the way back works
  await R(() => { openSheet('game:Brigandine: Abyss'); }); await page.waitForTimeout(500); await R(() => document.querySelector('#sheet .l41-back button').click()); await page.waitForTimeout(7500);
  ok(await R(() => !GAMES.some(x => x.t === 'Brigandine: Abyss') && L19.ordered('games').some(x => x.title === 'Brigandine: Abyss') && !(getOverride('upown').v || {})['g:Brigandine: Abyss']), '"Put it back" returns the game to Upcoming');
  console.log(pass + ' passed, ' + fail + ' failed', JSON.stringify(errs.slice(0, 5))); await br.close(); srv.close(); process.exit(fail ? 1 : 0); })();

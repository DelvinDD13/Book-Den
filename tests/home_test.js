// L61: favorites, Pivotal, ways to order the shelves, and one journal for days, books and media. Every book, show and game has
// a Favorite and a Pivotal button on its page (shows and games also a Journal button). Home shows a Today line for the day's
// journal, a Favorites row and a Pivotal row. Books has a Favorites view, third in the row of views: favorites grouped by his
// rating, pivotal grouped by kind, and everything he has rated grouped by rating. Five buttons order any shelf: Title, Added (the
// order of his Audible library pages, newest first), Finished, Published, Rating; a second tap turns the order round. The Journal
// holds days, books (the journals he already keeps) and media. None of it changes a book's status. Nothing moves.
const { chromium } = require('playwright'); const http = require('http'), fs = require('fs'), path = require('path');
const ROOT = process.env.ROOT || '/home/claude/book-den';
const MIME = { '.html': 'text/html', '.js': 'application/javascript', '.json': 'application/json', '.png': 'image/png', '.jpg': 'image/jpeg', '.woff2': 'font/woff2' };
const srv = http.createServer((req, res) => { let p = decodeURIComponent(req.url.split('?')[0]); if (p === '/') p = '/index.html'; if (p === '/upcoming.json') p = '/tests/upcoming_fixture.json'; fs.readFile(path.join(ROOT, p), (e, d) => { if (e) { res.writeHead(404); return res.end(); } res.writeHead(200, { 'Content-Type': MIME[path.extname(p)] || 'application/octet-stream' }); res.end(d); }); });
const store = fs.readFileSync(path.join(__dirname, 'store.json')); let pass = 0, fail = 0; const ok = (c, m) => { if (c) pass++; else { fail++; console.log('FAIL', m); } };
(async () => { await new Promise(r => srv.listen(8885, r)); const br = await chromium.launch(); const ctx = await br.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 1, isMobile: true, hasTouch: true });
  await ctx.route(u => !/^http:\/\/localhost/.test(u.href), r => r.request().resourceType() === 'image' ? r.fulfill({ status: 200, contentType: 'image/svg+xml', body: '<svg xmlns="http://www.w3.org/2000/svg" width="40" height="60"><rect width="40" height="60" fill="#345"/></svg>' }) : r.abort());
  await ctx.route(/script\.google\.com/, r => r.fulfill({ status: 200, contentType: 'application/json', body: store }));
  await ctx.addInitScript(() => { const T = new Date('2026-11-14T15:00:00').getTime(); const D0 = Date; const off = T - D0.now(); class D extends D0 { constructor(...a) { if (!a.length) super(D0.now() + off); else super(...a); } static now() { return D0.now() + off; } } window.Date = D; });
  const page = await ctx.newPage(); const errs = []; page.on('pageerror', e => errs.push(String(e))); page.on('console', m => { if (/l61/.test(m.text())) errs.push(m.text()); });
  await page.addInitScript(() => { const iv = setInterval(() => { if (window.L25 && L25.announce && !L25.announce._q) { L25.announce = function () {}; L25.announce._q = 1; } }, 30); setTimeout(() => clearInterval(iv), 30000); });
  await page.goto('http://localhost:8885/'); await page.waitForTimeout(7500); const R = (f, a) => page.evaluate(f, a); const wait = ms => page.waitForTimeout(ms);
  await R(() => { switchLib('books'); renderView('genre'); }); await wait(700);

  // ---- where things stand before he has marked anything ----
  const a = await R(() => ({ row: [...document.querySelectorAll('#lib-books .view-toggle button')].map(b => b.textContent.trim()), sort: [...document.querySelectorAll('#mainToolbar .d-l61sort button')].map(b => b.textContent.trim().replace(/[↑↓]/g, '').trim()), sel: getComputedStyle(document.getElementById('sort')).display, fav: L61.list('fav').length, piv: L61.list('piv').length }));
  ok(a.row.slice(0, 3).join('|') === 'Bookcase|Recap|Favorites', 'Favorites is the third button in the row of views: ' + a.row.slice(0, 4).join(', '));
  ok(a.sort.join('|') === 'Title|Added|Finished|Published|Rating' && a.sel === 'none', 'five order buttons stand where the sort menu was: ' + a.sort.join(', '));
  ok(a.fav === 0 && a.piv === 0, 'nothing is a favorite or pivotal until he says so');

  // ---- the two marks, on a book, a show and a game ----
  const m = await R(() => { const o = {}; const BOOK = t => !/^(show|game|cv|hk|ab|gr|badges|up|jr):/.test(t); const t = ALL_TITLES.filter(x => BOOK(x) && getStatus(x) === 'read')[0]; o.t = t; const st0 = getStatus(t); openSheet(t);
    const f = () => document.querySelector('#sheet [data-l61m=fav]'), p = () => document.querySelector('#sheet [data-l61m=piv]'); o.has = !!f() && !!p() && f().textContent.trim() === 'Favorite' && p().textContent.trim() === 'Pivotal'; o.off = f().getAttribute('aria-pressed') === 'false';
    f().click(); o.on = L61.is(t, 'fav') && getOverride(t).fav === 1 && f().classList.contains('on') && f().getAttribute('aria-pressed') === 'true'; p().click(); o.pivOn = L61.is(t, 'piv') && getOverride(t).piv === 1; o.status = getStatus(t) === st0;
    f().click(); o.offAgain = !L61.is(t, 'fav') && !f().classList.contains('on'); f().click(); o.noJournal = !document.querySelector('#sheet [data-l61=jmedia]'); closeSheet();
    const sh = 'show:' + SHOWS[0].t, gm = 'game:' + GAMES[0].t; openSheet(sh); o.show = !!f() && !!p() && !!document.querySelector('#sheet [data-l61=jmedia]'); p().click(); o.showPiv = L61.is(sh, 'piv'); closeSheet(); openSheet(gm); o.game = !!f() && !!p(); f().click(); o.gameFav = L61.is(gm, 'fav'); closeSheet(); o.sh = sh; o.gm = gm; return o; });
  ok(m.has && m.off, 'a book\'s page has Favorite and Pivotal buttons, both off to begin with: ' + m.t.slice(0, 30));
  ok(m.on && m.pivOn, 'a tap turns each on and keeps it on the book\'s own row');
  ok(m.offAgain, 'a second tap turns it off again');
  ok(m.status, 'marking a book changes nothing else about it: its status is as it was');
  ok(m.show && m.showPiv && m.game && m.gameFav && m.noJournal, 'a show and a game have the same two buttons, and a Journal button of their own');

  // ---- Home ----
  const h = await R(() => { const o = {}; switchLib('life'); const root = document.querySelector('.d-home') || document.body; const K = [...root.querySelectorAll('.d-k')].map(e => e.childNodes[0] ? e.childNodes[0].textContent.trim() : ''); o.k = K; o.iT = K.indexOf('Today'); o.iF = K.indexOf('Favorites'); o.iP = K.indexOf('Pivotal'); o.iL = K.indexOf('Finished lately');
    const sec = n => [...root.querySelectorAll('.d-l61sec')].find(s => s.querySelector('.d-k').childNodes[0].textContent.trim() === n); o.favN = sec('Favorites').querySelectorAll('.d-l61cv').length; o.pivN = sec('Pivotal').querySelectorAll('.d-l61cv').length; o.tag = sec('Pivotal').querySelectorAll('.d-l61tag').length; o.count = sec('Favorites').querySelector('.b-n').textContent;
    o.box = !!document.getElementById('l61day'); document.getElementById('l61day').value = 'A line about the day'; document.querySelector('[data-l61=saveday]').click(); const N = (getOverride('jr:days') || {}).n || []; o.saved = N.length === 1 && N[0].tx === 'A line about the day' && N[0].d === '2026-11-14'; o.shown = (document.querySelector('.d-l61e') || {}).textContent || ''; o.w = document.documentElement.scrollWidth;
    const c = [...document.querySelectorAll('.d-l61sec')].find(x => x.querySelector('.d-k').childNodes[0].textContent.trim() === 'Favorites').querySelector('.d-l61cv'); c.click(); o.opens = document.getElementById('sheet').classList.contains('open') && L61.is(sheetTitle, 'fav'); closeSheet(); return o; });
  ok(h.iT >= 0 && h.iF > h.iT && h.iP > h.iF && (h.iL < 0 || h.iL > h.iP), 'Home shows Today, then Favorites, then Pivotal, before Finished lately: ' + h.k.join(', ').slice(0, 120));
  ok(h.favN === 2 && h.count === '2' && h.pivN === 2 && h.tag === 2, 'the rows hold what he marked: 2 favorites, 2 pivotal (each with its sticker): ' + [h.favN, h.pivN, h.tag].join(', '));
  ok(h.box && h.saved && h.shown === 'A line about the day', 'a line written under Today is kept as that day\'s journal entry and shown: ' + h.shown);
  ok(h.opens && h.w <= 390, 'a cover on Home opens its page, and Home fits the phone width: ' + h.w);

  // ---- the Favorites view ----
  const v = await R(() => { const o = {}; const BOOK = t => !/^(show|game|cv|hk|ab|gr|badges|up|jr):/.test(t); const F = ALL_TITLES.filter(x => BOOK(x) && getStatus(x) === 'read').slice(0, 4); F.forEach(t => L61.set(t, 'fav', true)); setOverride(F[0], { myRating: 5 }); setOverride(F[1], { myRating: 4 }); setOverride(F[2], { myRating: 5 }); setOverride(F[3], { myRating: 0 });
    switchLib('books'); document.getElementById('btn-fav').click(); o.view = currentView; o.tabs = [...document.querySelectorAll('#nav button')].map(b => b.textContent.trim().replace(/\d+$/, '').trim()); o.on = (document.querySelector('#nav button.active') || {}).textContent || ''; const secs = () => [...document.querySelectorAll('#content .d-fv .d-sec')].map(s => [s.querySelector('.d-k').childNodes[0].textContent.trim(), s.querySelectorAll('.d-l61cv').length]);
    o.groups = secs(); o.nfav = L61.list('fav').length; document.querySelector('#nav [data-l61v=piv]').click(); o.kinds = secs(); document.querySelector('#nav [data-l61v=rated]').click(); o.rated = secs(); o.nRated = ALL_TITLES.filter(t => BOOK(t) && getMyRating(t) > 0).length + SHOWS.filter(x => getMyRating('show:' + x.t) > 0).length + GAMES.filter(g => getMyRating('game:' + g.t) > 0).length;
    const c = getComputedStyle(document.querySelector('#content .d-fv .d-l61cv')); o.frame = c.borderTopWidth + ' ' + c.borderTopColor; o.w = document.documentElement.scrollWidth; o.css = !/animation|transition|@keyframes/.test(document.getElementById('l61css').textContent);
    document.getElementById('btn-genre').click(); o.gone = !document.querySelector('#content .d-fv') && !document.querySelector('#nav [data-l61v]'); return o; });
  ok(v.view === 'fav' && v.tabs.join('|') === 'Favorites|Pivotal|By rating' && /^Favorites/.test(v.on), 'the Favorites view opens on Favorites, behind three tabs: ' + v.tabs.join(', '));
  ok(v.groups.length >= 3 && v.groups[0][0] === '★★★★★' && v.groups[0][1] >= 2 && v.groups[v.groups.length - 1][0] === 'Not rated' && v.groups.reduce((s, g) => s + g[1], 0) === v.nfav, 'favorites are grouped by his rating, five stars first and the unrated last: ' + JSON.stringify(v.groups));
  ok(v.kinds.map(k => k[0]).join('|') === 'Books|Shows and films' && v.kinds[0][1] === 1 && v.kinds[1][1] === 1, 'pivotal is grouped by kind: ' + JSON.stringify(v.kinds));
  ok(v.rated.length >= 2 && v.rated.reduce((s, g) => s + g[1], 0) === v.nRated && v.rated.every(g => /★/.test(g[0])), 'By rating holds everything he has rated: ' + v.nRated + ' in ' + v.rated.length + ' groups');
  ok(v.frame === '2px rgb(255, 255, 255)' && v.w <= 390 && v.css, 'covers keep their white frame, the view fits the phone width, and nothing animates: ' + v.frame + ', ' + v.w);
  ok(v.gone, 'another view puts it away');

  // ---- ordering a shelf ----
  const s = await R(() => { const o = {}; renderView('genre'); const cards = () => [...document.querySelectorAll('#content .grid .card')].map(c => decodeURIComponent(c.dataset.t || '')); const tap = k => document.querySelector('#mainToolbar [data-l61s=' + k + ']').click(); const all = cards().slice();
    tap('added'); const A = cards(); const want = L61.AUD_ORDER ? null : null; const rank = t => L61.added(t); o.added = A.slice(0, 12).map(rank); o.addedOk = o.added.every((x, i, L) => x > 0 && (i === 0 || L[i - 1] >= x)); o.same = A.length === all.length; o.on = (document.querySelector('#mainToolbar .d-l61sort .on') || {}).textContent || '';
    tap('added'); const A2 = cards().filter(t => rank(t) > 0); o.addedRev = A2.slice(0, 12).map(rank).every((x, i, L) => i === 0 || L[i - 1] <= x); const tail = cards().slice(-3).map(rank); o.unknownLast = cards().some(t => !rank(t)) ? tail.every(x => !x) : true;
    tap('finished'); const F = cards().map(t => String((getOverride(t) || {}).finished || '').slice(0, 10)); const Fk = F.filter(Boolean); o.fin = Fk.length > 3 && Fk.every((x, i, L) => i === 0 || L[i - 1] >= x) && F.indexOf('') === Fk.length;
    tap('published'); const Y = cards().map(t => L61.year(t)); const Yk = Y.filter(Boolean); o.pub = Yk.length > 10 && Yk.every((x, i, L) => i === 0 || L[i - 1] >= x); o.y0 = Yk[0];
    tap('rating'); const Rt = cards().map(t => getMyRating(t) || 0); o.rate = Rt.every((x, i, L) => i === 0 || L[i - 1] >= x) && Rt[0] > 0;
    tap('title'); const T = cards().map(t => shortTitle(t).toLowerCase()); o.title = T.slice(0, 30).every((x, i, L) => i === 0 || L[i - 1].localeCompare(x) <= 0); o.w = document.documentElement.scrollWidth; const r = document.querySelector('#mainToolbar .d-l61sort').getBoundingClientRect(), last = document.querySelector('#mainToolbar [data-l61s=rating]').getBoundingClientRect(); o.fits = last.right <= r.right + 1 && last.right <= 390; return o; });
  ok(s.addedOk && s.same && /^Added/.test(s.on), 'Added puts the shelf in the order of his Audible library, newest first, and loses no book: ' + s.added.slice(0, 6).join(', '));
  ok(s.addedRev && s.unknownLast, 'a second tap turns it round, and books with no place in that order stay at the end');
  ok(s.fin, 'Finished puts the latest finish first, with the unfinished after');
  ok(s.pub, 'Published puts the newest year first: ' + s.y0);
  ok(s.rate && s.title, 'Rating puts his highest first, and Title goes back to A to Z');
  ok(s.fits && s.w <= 390, 'all five buttons fit the row');

  // ---- the journal ----
  const j = await R(() => { const o = {}; switchLib('life'); document.querySelector('[data-l61=journal]').click(); const J = document.getElementById('l61j'); o.open = !!J && J.classList.contains('on'); o.tabs = [...J.querySelectorAll('.tb button')].map(b => b.textContent.trim()); o.days0 = J.querySelectorAll('.nt').length;
    document.getElementById('l61jt').value = 'Second line'; J.querySelector('[data-l61j=addday]').click(); o.days1 = J.querySelectorAll('.nt').length; o.top = J.querySelector('.nt p').textContent; J.querySelector('.nt [data-l61j=del]').click(); o.days2 = J.querySelectorAll('.nt').length;
    const BOOK = t => !/^(show|game|cv|hk|ab|gr|badges|up|jr):/.test(t); const t = ALL_TITLES.filter(BOOK)[3]; L35.addNote(t, { tx: 'A thought on a book', k: 'note' }); J.querySelector('[data-l61j=tab][data-k=books]').click(); o.books = J.querySelectorAll('.jr').length; o.bookLine = (J.querySelector('.jr span') || {}).textContent || '';
    J.querySelector('[data-l61j=tab][data-k=media]').click(); o.media0 = J.querySelectorAll('.jr').length; L61.closeJournal(); o.closed = !J.classList.contains('on');
    const sh = 'show:' + SHOWS[1].t; openSheet(sh); document.querySelector('#sheet [data-l61=jmedia]').click(); o.mediaOpen = J.classList.contains('on') && J.querySelector('.bk').textContent === SHOWS[1].t; document.getElementById('l61jt').value = 'About this show'; J.querySelector('[data-l61j=addmedia]').click(); o.mediaSaved = ((getOverride('jr:m:' + sh) || {}).n || []).length === 1;
    J.querySelector('[data-l61j=allmedia]').click(); o.media1 = J.querySelectorAll('.jr').length; L61.closeJournal(); o.btn = (document.querySelector('#sheet [data-l61=jmedia]') || {}).textContent || ''; closeSheet(); o.locked = document.body.classList.contains('locked'); return o; });
  ok(j.open && j.tabs.join('|') === 'Days|Books|Media', 'the Journal opens from Home with three kinds of writing: ' + j.tabs.join(', '));
  ok(j.days0 === 1 && j.days1 === 2 && j.top === 'Second line' && j.days2 === 1, 'a day\'s entry is added at the top and can be deleted: ' + [j.days0, j.days1, j.days2].join(' → '));
  ok(j.books >= 1 && /A thought on a book/.test(j.bookLine), 'Books lists the journals he keeps on books and series: ' + j.books);
  ok(j.media0 === 0 && j.mediaOpen && j.mediaSaved && j.media1 === 1 && /Journal · 1/.test(j.btn), 'a show\'s Journal button opens its own page of the journal, and what he writes is listed under Media');
  ok(j.closed && !j.locked, 'closing the journal gives the page back');
  ok(errs.length === 0, 'no page errors: ' + errs.slice(0, 3).join(' | '));
  console.log(pass + ' passed, ' + fail + ' failed'); await br.close(); srv.close(); process.exit(fail ? 1 : 0); })();

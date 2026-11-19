// The Has cover and No cover chips ask what a tile has to show (Nov 18 2026, his words: "Lots of the no cover section has covers
// now"). They used to ask whether the old embedded set had the book, so every book whose cover came from his Sheet or from his
// own art sat under No cover while showing one. Now a book is under No cover only when its tile is the placeholder.
const { chromium } = require('playwright'); const http = require('http'), fs = require('fs'), path = require('path');
const ROOT = process.env.ROOT || '/home/claude/book-den';
const MIME = { '.html': 'text/html', '.js': 'application/javascript', '.json': 'application/json', '.png': 'image/png', '.jpg': 'image/jpeg', '.woff2': 'font/woff2' };
const srv = http.createServer((req, res) => { let p = decodeURIComponent(req.url.split('?')[0]); if (p === '/') p = '/index.html'; if (p === '/upcoming.json') p = '/tests/upcoming_fixture.json'; fs.readFile(path.join(ROOT, p), (e, d) => { if (e) { res.writeHead(404); return res.end(); } res.writeHead(200, { 'Content-Type': MIME[path.extname(p)] || 'application/octet-stream' }); res.end(d); }); });
const store = fs.readFileSync(path.join(__dirname, 'store.json')); let pass = 0, fail = 0; const ok = (c, m) => { if (c) pass++; else { fail++; console.log('FAIL', m); } };
(async () => { await new Promise(r => srv.listen(8886, r)); const br = await chromium.launch(); const ctx = await br.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 1, isMobile: true, hasTouch: true });
  await ctx.route(u => !/^http:\/\/localhost/.test(u.href), r => r.request().resourceType() === 'image' ? r.fulfill({ status: 200, contentType: 'image/svg+xml', body: '<svg xmlns="http://www.w3.org/2000/svg" width="4" height="6"/>' }) : r.abort());
  await ctx.route(/script\.google\.com/, r => r.fulfill({ status: 200, contentType: 'application/json', body: store }));
  await ctx.addInitScript(() => { const T = new Date('2026-11-14T15:00:00').getTime(); const D0 = Date; const off = T - D0.now(); class D extends D0 { constructor(...a) { if (!a.length) super(D0.now() + off); else super(...a); } static now() { return D0.now() + off; } } window.Date = D; });
  const page = await ctx.newPage(); const errs = []; page.on('pageerror', e => errs.push(String(e)));
  await page.addInitScript(() => { const iv = setInterval(() => { if (window.L25 && L25.announce && !L25.announce._q) { L25.announce = function () {}; L25.announce._q = 1; } }, 30); setTimeout(() => clearInterval(iv), 30000); });
  await page.goto('http://localhost:8886/'); await page.waitForTimeout(7500); const R = (f, a) => page.evaluate(f, a); const wait = ms => page.waitForTimeout(ms);
  await R(() => { switchLib('books'); renderView('genre'); }); await wait(900);
  // what each tile draws, asked of the renderer itself (without letting it queue a cover lookup)
  await R(() => { window.BOOK = t => !/^(show|game|cv|hk|ab|gr|badges|up|jr):/.test(t); window.DRAWS = t => { const e = L11.ensure; L11.ensure = function () {}; try { return /^<img /.test(coverInner(t, false)); } finally { L11.ensure = e; } };
    window.CHIP = f => { document.querySelector('#filterchips [data-filter="' + f + '"]').click(); const c = document.getElementById('content'); return { mode: filterMode, tiles: c.querySelectorAll('[data-cvt]').length, ph: c.querySelectorAll('.d-ph[data-cvt]').length, img: c.querySelectorAll('img[data-cvt]').length, has: t => !!c.querySelector('[data-cvt="' + enc(t) + '"]') }; }; });

  // ---- the rule is the tile ----
  const a = await R(() => { const B = ALL_TITLES.filter(BOOK); const pic = B.filter(DRAWS); const blind = B.filter(t => !COVERS[t] && DRAWS(t));
    return { books: B.length, has: typeof L11.has, mism: B.filter(t => DRAWS(t) !== (L11.has ? L11.has(t) : !!COVERS[t])).length, pic: pic.length, blind: blind.length, tab: currentTab }; });
  ok(a.has === 'function', 'the app can say whether a book has a cover to show');
  ok(a.mism === 0, 'for every book that answer is what its tile draws: ' + a.mism + ' of ' + a.books + ' differ');
  ok(a.blind > 50, 'many books show a cover the old embedded set never had: ' + a.blind);

  // ---- No cover ----
  const no = await R(() => { const B = ALL_TITLES.filter(BOOK); const r = CHIP('nocover'); const listed = B.filter(matchesFilter); return { mode: r.mode, tiles: r.tiles, ph: r.ph, img: r.img, listed: listed.length, pics: listed.filter(DRAWS).length, bare: B.filter(t => !DRAWS(t)).length }; });
  ok(no.mode === 'nocover', 'the No cover chip is on');
  ok(no.pics === 0, 'no book under No cover is showing a cover: ' + no.pics + ' of ' + no.listed);
  ok(no.listed === no.bare, 'and every book without one is there: ' + no.listed + ' listed, ' + no.bare + ' without');
  ok(no.img === 0 && no.ph === no.tiles, 'on the screen the No cover shelf is placeholders only: ' + no.ph + ' placeholders, ' + no.img + ' pictures');

  // ---- Has cover ----
  const yes = await R(() => { const B = ALL_TITLES.filter(BOOK); const r = CHIP('cover'); const listed = B.filter(matchesFilter); return { mode: r.mode, tiles: r.tiles, ph: r.ph, img: r.img, listed: listed.length, bare: listed.filter(t => !DRAWS(t)).length, pic: B.filter(DRAWS).length }; });
  ok(yes.mode === 'cover' && yes.listed === yes.pic && yes.bare === 0, 'Has cover lists every book that shows one and no other: ' + yes.listed + ' listed, ' + yes.pic + ' showing');
  ok(yes.tiles > 20 && yes.ph === 0, 'on the screen the Has cover shelf has no placeholder: ' + yes.img + ' pictures, ' + yes.ph + ' placeholders');
  ok(no.listed + yes.listed === a.books, 'the two chips split the library between them: ' + no.listed + ' + ' + yes.listed + ' of ' + a.books);

  // ---- a book moves when its cover does ----
  const mv = await R(() => { const shown = [...document.querySelectorAll('#content img[data-cvt]')].map(e => decodeURIComponent(e.dataset.cvt)); const t = shown.find(x => BOOK(x) && !COVERS[x] && !(typeof ART !== 'undefined' && ART[x]) && (getOverride('cv:' + x) || {}).url); if (!t) return { t: '' };
    const url = getOverride('cv:' + t).url; const before = { yes: CHIP('cover').has(t), no: CHIP('nocover').has(t) };
    L11._bad[url] = Date.now(); const flaky = L11.has(t); delete L11._bad[url];
    setOverride('cv:' + t, { url: null }); const gone = !(getOverride('cv:' + t) || {}).url; const noR = CHIP('nocover'); const after = { no: noR.has(t), ph: !!document.querySelector('#content .d-ph[data-cvt="' + enc(t) + '"]'), yes: CHIP('cover').has(t) };
    setOverride('cv:' + t, { url }); const back = { yes: CHIP('cover').has(t), no: CHIP('nocover').has(t) }; return { t, before, flaky, gone, after, back }; });
  ok(!!mv.t, 'a book on this shelf has its cover from his Sheet and none embedded');
  ok(mv.before && mv.before.yes && !mv.before.no, 'it sits under Has cover and not under No cover: ' + String(mv.t).slice(0, 30));
  ok(mv.flaky === true, 'a cover that failed to load a moment ago does not move it');
  ok(mv.gone && mv.after.no && mv.after.ph && !mv.after.yes, 'with the cover taken away it moves to No cover as a placeholder');
  ok(mv.back && mv.back.yes && !mv.back.no, 'and comes back when the cover does');

  // ---- the search box and the other chips ----
  const s = await R(() => { const B = ALL_TITLES.filter(BOOK); CHIP('cover'); const t = B.find(x => DRAWS(x) && /^[A-Za-z]{6,}/.test(x)); const word = t.match(/^[A-Za-z]+/)[0].toLowerCase(); const q = searchQuery; let hit, none, mode;
    try { searchQuery = word; hit = B.filter(matchesFilter); searchQuery = 'zzzz no such book'; none = B.filter(matchesFilter).length; mode = filterMode; } finally { searchQuery = q; }
    const rated = (CHIP('rated'), B.filter(matchesFilter).length), ratedWant = B.filter(x => (META[x] || {}).rating).length; const all = (CHIP('all'), B.filter(matchesFilter).length);
    return { word, hit: hit.length, hitOk: hit.includes(t) && hit.every(DRAWS), fewer: hit.length < B.filter(DRAWS).length, none, mode, rated, ratedWant, all, books: B.length, end: filterMode }; });
  ok(s.hit > 0 && s.hitOk && s.fewer && s.none === 0, 'the search box still narrows Has cover: "' + s.word + '" gives ' + s.hit + ', nonsense gives ' + s.none);
  ok(s.mode === 'cover', 'and the chip stays on while it does');
  ok(s.rated === s.ratedWant && s.all === s.books && s.end === 'all', 'Rated and All list what they did before: ' + s.rated + ' rated, ' + s.all + ' in all');
  ok(errs.length === 0, 'no page errors: ' + errs.slice(0, 3).join(' | '));
  console.log(pass + ' passed, ' + fail + ' failed'); await br.close(); srv.close(); process.exit(fail ? 1 : 0); })();

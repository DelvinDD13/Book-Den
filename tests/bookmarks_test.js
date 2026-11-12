// L37 bookmarks (Nov 11 redesign): each one is an object from its book's world carrying its own cover; Steel ones are gym plates,
// and the Superman split days wear the 1944 shield once earned; every milestone kind has its own object.
const { chromium } = require('playwright'); const http = require('http'), fs = require('fs'), path = require('path');
const ROOT = process.env.ROOT || '/home/claude/book-den'; const MIME = { '.html': 'text/html', '.js': 'application/javascript', '.json': 'application/json', '.png': 'image/png', '.jpg': 'image/jpeg' };
const srv = http.createServer((req, res) => { let p = decodeURIComponent(req.url.split('?')[0]); if (p === '/') p = '/index.html'; fs.readFile(path.join(ROOT, p), (e, d) => { if (e) { res.writeHead(404); return res.end(); } res.writeHead(200, { 'Content-Type': MIME[path.extname(p)] || 'application/octet-stream' }); res.end(d); }); });
const store = fs.readFileSync(path.join(__dirname, 'store.json')); let pass = 0, fail = 0; const ok = (c, m) => { if (c) pass++; else { fail++; console.log('FAIL', m); } };
(async () => { await new Promise(r => srv.listen(8857, r)); const br = await chromium.launch(); const ctx = await br.newContext({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true });
  const PNG = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==', 'base64');
  await ctx.route(u => !/^http:\/\/localhost/.test(u.href), r => r.request().resourceType() === 'image' ? r.fulfill({ status: 200, contentType: 'image/png', body: PNG }) : r.abort()); await ctx.route(/script\.google\.com/, r => r.fulfill({ status: 200, contentType: 'application/json', body: store }));
  const page = await ctx.newPage(); const errs = []; page.on('pageerror', e => errs.push(String(e))); await page.goto('http://localhost:8857/'); await page.waitForTimeout(6500); const R = (f, a) => page.evaluate(f, a);
  await R(() => L37.open('marks')); await page.waitForTimeout(500);
  const S = await R(() => { const r = document.getElementById('l37').shadowRoot; const B = L37.bookmarks(); const cells = [...r.querySelectorAll('.cell')]; const out = {}; B.forEach((b, i) => { const el = cells[i] && cells[i].querySelector('.l37-bm'); if (!el) return; const kind = ['mt', 'gm', 'vv', 'lt', 'bx', 'cr', 'bl', 'pl', 'cart', 'film', 'tk', 'cal', 'nb', 'env', 'map', 'place', 'pc'].find(c => el.classList.contains(c)) || '?'; const key = b.kind === 'book' ? b.sub : b.id.replace(/\d+$/, ''); (out[key] = out[key] || []).push([kind, !!el.querySelector('.cv img'), el.classList.contains('lk'), b.got, !!el.querySelector('.sh'), (el.querySelector('.sb') || {}).textContent || '']); }); return { out, n: cells.length, B: B.length }; });
  const kinds = k => (S.out[k] || []).map(x => x[0]);
  ok(S.n === S.B, 'every bookmark is drawn: ' + S.n);
  ok(kinds('Mistborn').every(k => k === 'mt') && (S.out.Mistborn || [])[0][5] === 'Pewter' && (S.out.Mistborn || [])[2][5] === 'Atium', 'Mistborn bookmarks are metal plates, each in its own metal');
  ok(kinds('Stormlight').every(k => k === 'gm') && new Set((S.out.Stormlight || []).map(x => x[5])).size === (S.out.Stormlight || []).length, 'Stormlight bookmarks are gem glass, a different gem each');
  ok(kinds('ACOTAR').every(k => k === 'vv') && /Court$/.test((S.out.ACOTAR || [])[0][5]), 'ACOTAR bookmarks are velvet in a court colour');
  ok(kinds('Empyrean').every(k => k === 'lt'), 'Empyrean bookmarks are rider leather');
  ok(kinds('DCC').every(k => k === 'bx'), 'DCC bookmarks are loot box cards');
  ok(kinds('Throne of Glass').every(k => k === 'cr'), 'Throne of Glass bookmarks are a crown cut');
  ok(kinds('First Law').every(k => k === 'bl'), 'First Law bookmarks are blades');
  ok(kinds('Steel').every(k => k === 'pl'), 'Steel bookmarks are gym plates');
  const screen = Object.keys(S.out).filter(k => /FFT|Scarlet|DQ|HxH|Naruto/.test(k)); ok(screen.length >= 3 && screen.every(k => kinds(k).every(x => x === 'cart' || x === 'film')), 'games are cartridges and shows are film frames: ' + screen.map(k => k + ':' + kinds(k)).join(','));
  ok(kinds('clock').every(k => k === 'tk') && kinds('days').every(k => k === 'cal') && kinds('jot').every(k => k === 'nb') && kinds('theory').every(k => k === 'env') && kinds('track').every(k => k === 'pl') && kinds('best').every(k => k === 'pl') && kinds('quest').every(k => k === 'map') && kinds('push').every(k => k === 'place'), 'each milestone kind has its own object');
  const books = Object.values(S.out).flat().filter(x => !['pl', 'tk', 'cal', 'nb', 'env', 'map', 'place'].includes(x[0])); ok(books.filter(x => x[1]).length >= books.length * 0.6, 'book bookmarks carry their own covers: ' + books.filter(x => x[1]).length + ' of ' + books.length);
  ok(Object.values(S.out).flat().every(x => x[2] === !x[3]), 'the ones not earned are grey, the earned ones are not');
  // Steel: the shield appears on the split days only when earned
  const sh = await R(() => { const B = L37.bookmarks(); B.forEach(b => { if (b.lib === 'steel') b.got = b.k !== 'tue'; }); L37.open('marks'); const r = document.getElementById('l37').shadowRoot; const cells = [...r.querySelectorAll('.cell')]; const got = {}; B.forEach((b, i) => { if (b.lib === 'steel') got[b.k] = !!cells[i].querySelector('.sh'); }); return got; });
  ok(sh.sat && sh.thu && sh.twelve && !sh.tue && !sh.six, 'the Superman shield is on Krypton, Fortress and twelve sessions once earned, and not on a locked plate: ' + JSON.stringify(sh));
  const sz = await R(() => { L37.close(); switchLib('books'); try { L15.placeBooks(); } catch (e) {} const s = document.querySelector('.l37-strip .l37-bm'); const g = document.querySelector('#l37') && document.getElementById('l37').shadowRoot.querySelector('.l37-bm'); return s ? [getComputedStyle(s).fontSize, getComputedStyle(g).fontSize] : null; });
  ok(sz && sz[0] === '8px' && sz[1] === '12px', 'the Books strip shows them smaller: ' + JSON.stringify(sz));
  ok(!errs.length, 'no page errors: ' + errs.slice(0, 3).join(' | '));
  console.log(pass + ' passed, ' + fail + ' failed'); await br.close(); srv.close(); process.exit(fail ? 1 : 0); })();

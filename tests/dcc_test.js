// L49: the Dungeon Crawler Carl encyclopedia — opens book by book; with all eight finished everything is open; nothing renders sealed text.
const { chromium } = require('playwright'); const http = require('http'), fs = require('fs'), path = require('path');
const ROOT = process.env.ROOT || '/home/claude/book-den'; const MIME = { '.html': 'text/html', '.js': 'application/javascript', '.json': 'application/json' };
const srv = http.createServer((req, res) => { let p = decodeURIComponent(req.url.split('?')[0]); if (p === '/') p = '/index.html'; fs.readFile(path.join(ROOT, p), (e, d) => { if (e) { res.writeHead(404); return res.end(); } res.writeHead(200, { 'Content-Type': MIME[path.extname(p)] || 'application/octet-stream' }); res.end(d); }); });
const store = fs.readFileSync(path.join(__dirname, 'store.json')); let pass = 0, fail = 0; const ok = (c, m) => { if (c) pass++; else { fail++; console.log('FAIL', m); } };
(async () => { await new Promise(r => srv.listen(8850, r)); const br = await chromium.launch(); const ctx = await br.newContext({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true });
  await ctx.route(u => !/^http:\/\/localhost/.test(u.href), r => r.abort()); await ctx.route(/script\.google\.com/, r => r.fulfill({ status: 200, contentType: 'application/json', body: store }));
  const page = await ctx.newPage(); const errs = []; page.on('pageerror', e => errs.push(String(e))); await page.goto('http://localhost:8850/'); await page.waitForTimeout(6500); const R = (f, a) => page.evaluate(f, a);
  const B = await R(() => { const s = L29.by.dcc; return s ? s.books.map(b => [b.k, ALL_TITLES.filter(t => new RegExp(b.m, 'i').test(t)).length]) : null; });
  ok(B && B.length === 8 && B.every(x => x[1] >= 1), 'each of the eight books matches a title in the library: ' + JSON.stringify(B));
  // nothing read: everything sealed
  const set = st => R(st => { const s = L29.by.dcc; s.books.forEach((b, i) => { ALL_TITLES.filter(t => new RegExp(b.m, 'i').test(t)).forEach(t => setOverride(t, { status: st[i] || 'to-read', finished: st[i] === 'read' ? '2026-01-0' + (i + 1) : null })); }); L29.flush(); return L29.stats(s); }, st);
  let s0 = await set([]); const lk = x => Object.values(x.lock || {}).reduce((a, b) => a + b, 0); ok(s0.u === 0 && lk(s0) === s0.n, 'with no book started nothing is open: ' + JSON.stringify(s0));
  let s1 = await set(['currently-reading']); ok(s1.u > 0 && lk(s1) > 0 && !s1.lock.d1 === false, 'starting book 1 opens the opening pieces only: ' + JSON.stringify(s1));
  const leak1 = await R(() => { L29.open('dcc', 'carl'); const r = document.getElementById('l29').shadowRoot; return r.querySelector('.scr').innerText; });
  ok(/Coast Guard veteran/.test(leak1) && !/Compensated Anarchist|Agent Provocateur|Princess Posse|Chandra|Shi Maria/.test(leak1), 'Carl\'s page shows book 1 and nothing later');
  let s8 = await set(['read', 'read', 'read', 'read', 'read', 'read', 'read', 'read']); ok(lk(s8) === 0 && s8.u === s8.n, 'all eight finished: everything open: ' + JSON.stringify(s8));
  const all = await R(() => { L29.open('dcc', 'carl'); const r = document.getElementById('l29').shadowRoot; return r.querySelector('.scr').innerText; });
  ok(/Compensated Anarchist/.test(all) && /Agent Provocateur/.test(all) && /Princess Chandra/.test(all), 'with all eight read Carl\'s page carries every book');
  const ch = await R(() => { L29.open('dcc'); const r = document.getElementById('l29').shadowRoot; return r.querySelector('.scr').innerText; });
  ok(/Dungeon Crawler Carl/.test(ch), 'the encyclopedia opens');
  ok(!errs.length, 'no page errors: ' + errs.slice(0, 3).join(' | '));
  console.log(pass + ' passed, ' + fail + ' failed'); await br.close(); srv.close(); process.exit(fail ? 1 : 0); })();

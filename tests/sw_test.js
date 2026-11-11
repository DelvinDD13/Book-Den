// The offline cache keeps fonts and art when a new build replaces the old one.
const { chromium } = require('playwright'); const http = require('http'), fs = require('fs'), path = require('path');
const ROOT = process.env.ROOT || '/home/claude/book-den'; const MIME = { '.html': 'text/html', '.js': 'application/javascript', '.json': 'application/json', '.png': 'image/png', '.jpg': 'image/jpeg', '.woff2': 'font/woff2', '.gif': 'image/gif' };
let BUILD = 'den-111111111111';
const srv = http.createServer((req, res) => { let p = decodeURIComponent(req.url.split('?')[0]); if (p === '/swtest.html') { res.writeHead(200, { 'Content-Type': 'text/html' }); return res.end('<!doctype html><title>t</title>ok'); }
  if (p === '/' || p === '/index.html') { res.writeHead(200, { 'Content-Type': 'text/html' }); return res.end('<!doctype html><title>stub</title>' + BUILD); }
  fs.readFile(path.join(ROOT, p), (e, d) => { if (e) { res.writeHead(404); return res.end(); } if (p === '/sw.js') d = Buffer.from(String(d).replace(/const C = 'den-\d+';/, "const C = '" + BUILD + "';")); res.writeHead(200, { 'Content-Type': MIME[path.extname(p)] || 'application/octet-stream', 'Cache-Control': 'no-store' }); res.end(d); }); });
let pass = 0, fail = 0; const ok = (c, m) => { if (c) pass++; else { fail++; console.log('FAIL', m); } };
(async () => { await new Promise(r => srv.listen(8804, r)); const br = await chromium.launch(); const ctx = await br.newContext(); const page = await ctx.newPage();
  await page.goto('http://localhost:8804/swtest.html');
  await page.evaluate(async () => { await navigator.serviceWorker.register('./sw.js'); await navigator.serviceWorker.ready; }); await page.waitForTimeout(800); await page.reload(); await page.waitForTimeout(500);
  ok(await page.evaluate(() => !!navigator.serviceWorker.controller), 'worker controls the page');
  await page.evaluate(async () => { await fetch('./fonts/cinzel-latin-700-normal.woff2'); await fetch('./art/sprites/dragon.gif'); await fetch('./manifest.json'); }); await page.waitForTimeout(600);
  const a = await page.evaluate(async () => { const ks = await caches.keys(); const c = await caches.open('den-111111111111'); return { ks, urls: (await c.keys()).map(r => new URL(r.url).pathname) }; }); console.log(JSON.stringify(a));
  ok(a.ks.includes('den-111111111111') && a.urls.includes('/fonts/cinzel-latin-700-normal.woff2') && a.urls.includes('/art/sprites/dragon.gif'), 'first build cached the font and the sprite on first use');
  BUILD = 'den-222222222222';
  await page.evaluate(async () => { const r = await navigator.serviceWorker.getRegistration(); await r.update(); }); await page.waitForTimeout(2500);
  const b = await page.evaluate(async () => { const ks = await caches.keys(); const c = await caches.open('den-222222222222'); const urls = (await c.keys()).map(r => new URL(r.url).pathname); const f = await c.match('./fonts/cinzel-latin-700-normal.woff2'); return { ks, urls, bytes: f ? (await f.arrayBuffer()).byteLength : 0 }; });
  ok(b.ks.includes('den-222222222222') && !b.ks.includes('den-111111111111'), 'the new build replaced the old cache: ' + b.ks.join(','));
  ok(b.urls.includes('/fonts/cinzel-latin-700-normal.woff2') && b.urls.includes('/art/sprites/dragon.gif') && b.bytes > 5000, 'the font and the sprite were carried into the new cache (' + b.bytes + ' bytes)');
  ok(b.urls.includes('/index.html') && !b.urls.includes('/manifest.json') || b.urls.includes('/manifest.json'), 'the page itself is cached fresh');
  await ctx.setOffline(true);
  const off = await page.evaluate(async () => { try { const r = await fetch('./fonts/cinzel-latin-700-normal.woff2'); const n = (await r.arrayBuffer()).byteLength; const p = await fetch('./index.html'); return { n, page: await p.text() }; } catch (e) { return { err: String(e) }; } });
  ok(off.n > 5000 && /den-222222222222/.test(off.page || ''), 'offline right after the update: the font and the new page both load ' + JSON.stringify(off).slice(0, 80));
  console.log(pass + ' passed, ' + fail + ' failed'); await br.close(); srv.close(); process.exit(fail ? 1 : 0); })();

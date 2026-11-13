// L54 his pictures, built in and locked: art/pack.bin is AES-GCM ciphertext; the Paste key button opens it once and his
// pictures go to the looks and to Steel; a wrong key opens nothing; the key never goes to the store; a newer pack comes in
// on its own without doubling pictures; the offline worker never keeps the pack.
const { chromium } = require('playwright'); const http = require('http'), fs = require('fs'), path = require('path'); const { webcrypto } = require('crypto');
const ROOT = process.env.ROOT || '/home/claude/book-den';
const MIME = { '.html': 'text/html', '.js': 'application/javascript', '.json': 'application/json', '.png': 'image/png', '.jpg': 'image/jpeg', '.woff2': 'font/woff2' };
const srv = http.createServer((req, res) => { let p = decodeURIComponent(req.url.split('?')[0]); if (p === '/') p = '/index.html'; fs.readFile(path.join(ROOT, p), (e, d) => { if (e) { res.writeHead(404); return res.end(); } res.writeHead(200, { 'Content-Type': MIME[path.extname(p)] || 'application/octet-stream' }); res.end(d); }); });
const store = fs.readFileSync(path.join(__dirname, 'store.json')); let pass = 0, fail = 0; const ok = (c, m) => { if (c) pass++; else { fail++; console.log('FAIL', m); } };
const PNG = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==', 'base64');
const JPG = 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQEASABIAAD/2wBDAP//////////////////////////////////////////////////////////////////////////////////////wgALCAABAAEBAREA/8QAFBABAAAAAAAAAAAAAAAAAAAAAP/aAAgBAQABPxA=';
const b64u = b => Buffer.from(b).toString('base64').replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
async function lock(obj, raw) { const iv = webcrypto.getRandomValues(new Uint8Array(12)); const k = await webcrypto.subtle.importKey('raw', raw, { name: 'AES-GCM' }, false, ['encrypt']); const ct = new Uint8Array(await webcrypto.subtle.encrypt({ name: 'AES-GCM', iv }, k, new TextEncoder().encode(JSON.stringify(obj)))); return Buffer.concat([Buffer.from(iv), Buffer.from(ct)]); }
(async () => { await new Promise(r => srv.listen(8868, r));
  const raw = webcrypto.getRandomValues(new Uint8Array(32)), KEY = 'den-' + b64u(raw), WRONG = 'den-' + b64u(webcrypto.getRandomValues(new Uint8Array(32)));
  const pack = { kind: 'den-pack', v: 1, looks: { kind: 'den-look-pictures', v: 1, items: [{ th: 'night', key: 'k1', img: JPG, sc: { c: [0, 0, 1, 1], ar: 1, m: 'push', fx: 'night' } }, { th: 'pixel', key: 'k2', img: JPG, sc: { c: [0, 0, 1, 1], ar: 1, m: 'push', fx: 'boom', o: [0.5, 0.5] } }] },
    steel: { kind: 'den-steel-pictures', v: 1, sets: [{ hero: 'superman', era: 'golden', covers: [JPG, JPG], chip: JPG, bg: JPG }] } };
  const BIN = await lock(pack, raw); let packHits = 0; const posts = [];
  const br = await chromium.launch(); const ctx = await br.newContext({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true });
  await ctx.route(/\/art\/pack\.bin/, r => { packHits++; r.fulfill({ status: 200, contentType: 'application/octet-stream', body: BIN }); });
  await ctx.route(u => !/^http:\/\/localhost/.test(u.href), r => r.request().resourceType() === 'image' ? r.fulfill({ status: 200, contentType: 'image/png', body: PNG }) : r.abort());
  await ctx.route(/script\.google\.com/, r => { const b = r.request().postData(); if (b) posts.push(b); r.fulfill({ status: 200, contentType: 'application/json', body: store }); });
  const page = await ctx.newPage(); const errs = []; page.on('pageerror', e => errs.push(String(e))); let answer = ''; page.on('dialog', d => d.accept(answer));
  await page.goto('http://localhost:8868/'); await page.waitForTimeout(6500); const R = (f, a) => page.evaluate(f, a);
  const toasts = async () => R(() => (document.getElementById('toast') || {}).textContent || '');
  // ---- locked: the Look sheet offers Paste key ----
  await R(() => { switchLib('life'); L34.open(); }); await page.waitForTimeout(800);
  let s = await R(() => { const r = document.getElementById('l34').shadowRoot; return [!!r.querySelector('button.pk'), (r.querySelector('h3') || {}).textContent, /locked so only you can open them/.test(r.innerHTML)]; });
  ok(s[0] && s[2], 'locked: the Look sheet says the pictures come locked and offers Paste key: ' + s);
  ok(packHits === 0, 'nothing is downloaded before a key: ' + packHits);
  // ---- a wrong key opens nothing ----
  answer = WRONG; await R(() => document.getElementById('l34').shadowRoot.querySelector('button.pk').click()); await page.waitForTimeout(1500);
  s = await R(() => [localStorage.getItem('den:pk'), localStorage.getItem('den:packv')]); const t1 = await toasts();
  ok(s[0] === null && s[1] === null && /does not open/.test(t1), 'a wrong key opens nothing and says so: ' + t1 + ' ' + s);
  answer = 'hello'; await R(() => document.getElementById('l34').shadowRoot.querySelector('button.pk').click()); await page.waitForTimeout(800);
  ok(/not a picture key/.test(await toasts()), 'something that is not a key is turned away');
  // ---- his key: the pictures come in ----
  answer = '  ' + KEY + '\n'; await R(() => document.getElementById('l34').shadowRoot.querySelector('button.pk').click()); await page.waitForTimeout(2500);
  s = await R(() => L34.artList().then(A => ({ looks: A.filter(a => a.sc).map(a => a.th).join(), steel: L51.sets().join(), v: localStorage.getItem('den:packv'), k: (localStorage.getItem('den:pk') || '').length, block: /are in/.test(document.getElementById('l34').shadowRoot.innerHTML), btn: !!document.getElementById('l34').shadowRoot.querySelector('button.pk') })));
  ok(s.looks === 'night,pixel' && /superman:golden/.test(s.steel), 'his key opens the pack: look pictures and Steel pictures are in: ' + JSON.stringify(s));
  ok(s.v === '1' && s.k === 47 && s.block && !s.btn, 'the key stays on the phone and the sheet says the pictures are in: ' + JSON.stringify(s));
  ok(/Your pictures are in/.test(await toasts()), 'it says so');
  ok(!posts.some(b => b.indexOf(KEY.slice(4)) >= 0), 'the key is never sent to the store (' + posts.length + ' saves checked)');
  // ---- next launch: nothing downloaded again; a newer pack comes in on its own, without doubling ----
  const hits = packHits; await page.reload(); await page.waitForTimeout(7000);
  ok(packHits === hits, 'next launch downloads nothing: ' + (packHits - hits));
  await R(() => localStorage.setItem('den:packv', '0')); await page.reload(); await page.waitForTimeout(8000);
  s = await R(() => L34.artList().then(A => [A.length, localStorage.getItem('den:packv'), L51.sets().length]));
  ok(packHits === hits + 1 && s[0] === 2 && s[1] === '1' && s[2] === 1, 'a newer pack comes in on its own, without doubling pictures: ' + s + ' hits ' + (packHits - hits));
  // ---- the offline worker never keeps the pack ----
  const sw = fs.readFileSync(path.join(ROOT, 'sw.js'), 'utf8'); ok(/art\\\/pack\\\.bin\$\/\.test\(u\.pathname\)\) return;/.test(sw), 'the service worker leaves the pack alone');
  // ---- the pack in the site is not readable without the key ----
  if (fs.existsSync(path.join(ROOT, 'art/pack.bin'))) { const real = fs.readFileSync(path.join(ROOT, 'art/pack.bin')); const txt = real.toString('latin1'); ok(real.length > 1000 && !/den-pack|data:image|den-look-pictures|den-steel-pictures/.test(txt), 'the pack in the site is ciphertext: ' + real.length + ' bytes'); }
  ok(errs.length === 0, 'no page errors: ' + errs.slice(0, 3).join(' | '));
  await br.close(); srv.close(); console.log(pass + ' passed, ' + fail + ' failed'); process.exit(fail ? 1 : 0);
})().catch(e => { console.log('ERR', e); console.log(pass + ' passed, ' + (fail + 1) + ' failed'); process.exit(1); });

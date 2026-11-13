// L54 his pictures, built in and locked: art/pack.bin is AES-GCM ciphertext. A private link ending in #pk=<key> puts the key in
// his Sheet (row den:pk) and shows one card; every copy of the app then opens the pictures by itself (no paste, no button), on
// launch or when it comes back to the screen; a wrong key opens nothing and is not tried again; a key pasted with the first
// version still works; a newer pack comes in on its own without doubling; the offline worker never keeps the pack.
const { chromium } = require('playwright'); const http = require('http'), fs = require('fs'), path = require('path'); const { webcrypto } = require('crypto');
const ROOT = process.env.ROOT || '/home/claude/book-den';
const MIME = { '.html': 'text/html', '.js': 'application/javascript', '.json': 'application/json', '.png': 'image/png', '.jpg': 'image/jpeg', '.woff2': 'font/woff2' };
const srv = http.createServer((req, res) => { let p = decodeURIComponent(req.url.split('?')[0]); if (p === '/') p = '/index.html'; fs.readFile(path.join(ROOT, p), (e, d) => { if (e) { res.writeHead(404); return res.end(); } res.writeHead(200, { 'Content-Type': MIME[path.extname(p)] || 'application/octet-stream' }); res.end(d); }); });
const store = fs.readFileSync(path.join(__dirname, 'store.json'), 'utf8'); let pass = 0, fail = 0; const ok = (c, m) => { if (c) pass++; else { fail++; console.log('FAIL', m); } };
const PNG = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==', 'base64');
const JPG = 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQEASABIAAD/2wBDAP//////////////////////////////////////////////////////////////////////////////////////wgALCAABAAEBAREA/8QAFBABAAAAAAAAAAAAAAAAAAAAAP/aAAgBAQABPxA=';
const b64u = b => Buffer.from(b).toString('base64').replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
async function lock(obj, raw) { const iv = webcrypto.getRandomValues(new Uint8Array(12)); const k = await webcrypto.subtle.importKey('raw', raw, { name: 'AES-GCM' }, false, ['encrypt']); const ct = new Uint8Array(await webcrypto.subtle.encrypt({ name: 'AES-GCM', iv }, k, new TextEncoder().encode(JSON.stringify(obj)))); return Buffer.concat([Buffer.from(iv), Buffer.from(ct)]); }
(async () => { await new Promise(r => srv.listen(8868, r));
  const raw = webcrypto.getRandomValues(new Uint8Array(32)), KEY = 'den-' + b64u(raw), WRONG = 'den-' + b64u(webcrypto.getRandomValues(new Uint8Array(32)));
  const pack = { kind: 'den-pack', v: 1, looks: { kind: 'den-look-pictures', v: 1, items: [{ th: 'night', key: 'k1', img: JPG, sc: { c: [0, 0, 1, 1], ar: 1, m: 'push', fx: 'night' } }, { th: 'pixel', key: 'k2', img: JPG, sc: { c: [0, 0, 1, 1], ar: 1, m: 'push', fx: 'boom', o: [0.5, 0.5] } }] },
    steel: { kind: 'den-steel-pictures', v: 1, sets: [{ hero: 'superman', era: 'golden', covers: [JPG, JPG], chip: JPG, bg: JPG }] } };
  const BIN = await lock(pack, raw); const br = await chromium.launch(); const errs = [];
  // his Sheet, shared by every copy of the app: newest row wins, as the Apps Script does
  const SHEET = JSON.parse(store); const posts = [], elsewhere = [];
  const row = k => SHEET.v[k] ? JSON.parse(SHEET.v[k].j) : null;
  async function phone(opts) { opts = opts || {}; const ctx = await br.newContext({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true }); const st = { hits: 0, toasts: [] };
    await ctx.route(/\/art\/pack\.bin/, r => { st.hits++; r.fulfill({ status: 200, contentType: 'application/octet-stream', body: BIN }); });
    await ctx.route(u => !/^http:\/\/localhost/.test(u.href), r => { const q = r.request(); if ((q.url() + (q.postData() || '')).indexOf(KEY.slice(4)) >= 0) elsewhere.push(q.url()); return q.resourceType() === 'image' ? r.fulfill({ status: 200, contentType: 'image/png', body: PNG }) : r.abort(); });
    await ctx.route(/script\.google\.com/, r => { const b = r.request().postData(); if (b) { posts.push({ who: opts.name, b }); try { const o = JSON.parse(b); Object.entries(o.v || {}).forEach(([k, e]) => { if (!SHEET.v[k] || e.u >= SHEET.v[k].u) SHEET.v[k] = e; }); } catch (e) {} }
      r.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ ok: true, v: SHEET.v }) }); });
    if (opts.ls) await ctx.addInitScript(o => { Object.entries(o).forEach(([k, v]) => { try { if (localStorage.getItem(k) === null) localStorage.setItem(k, v); } catch (e) {} }); }, opts.ls);
    const page = await ctx.newPage(); page.on('pageerror', e => errs.push(opts.name + ': ' + String(e)));
    await page.exposeFunction('noteToast', m => st.toasts.push(m));
    await page.addInitScript(() => { const iv = setInterval(() => { if (typeof toast === 'function' && !toast._w) { const _t = toast; window.toast = toast = function (m) { try { window.noteToast(String(m)); } catch (e) {} return _t.apply(this, arguments); }; toast._w = 1; } }, 50); setTimeout(() => clearInterval(iv), 30000); });
    await page.goto('http://localhost:8868/' + (opts.hash || '')); await page.waitForTimeout(opts.wait || 8000);
    return { ctx, page, st, R: (f, a) => page.evaluate(f, a) }; }
  const pics = P => P.R(() => L34.artList().then(A => ({ looks: A.filter(a => a.sc).map(a => a.th).join(), n: A.length, steel: L51.sets().join(), v: localStorage.getItem('den:packv'), k: localStorage.getItem('den:pk') })));
  const lookSheet = async P => { await P.R(() => { switchLib('life'); L34.open(); }); await P.page.waitForTimeout(800); return P.R(() => { const r = document.getElementById('l34').shadowRoot; const m = r.innerHTML.match(/.{0,60}(<h3>Your pictures|Paste key|picture key).{0,60}/i), w = r.innerHTML.match(/.{0,80}your pictures.{0,40}/i); return { btn: !!r.querySelector('button.pk, [data-a="pk"]'), box: m ? m[0] : '', info: w ? w[0] : '' }; }); };
  // ---- his phone before the link: nothing to do, nothing downloaded, no box in the Look sheet ----
  const A = await phone({ name: 'phone' });
  ok(A.st.hits === 0, 'without a key nothing is downloaded: ' + A.st.hits);
  let s = await lookSheet(A); ok(!s.btn && !s.box, 'the Look sheet has no key box and no Paste key button: ' + JSON.stringify(s));
  await A.R(() => { try { closeSheet && closeSheet(); } catch (e) {} });
  // ---- the link, opened once in any browser: the key goes to his Sheet, one card says so, nothing is downloaded there ----
  const B = await phone({ name: 'link', hash: '#pk=' + KEY, wait: 9000 });
  s = await B.R(() => { const n = document.getElementById('l54-note'); return { hash: location.hash, href: location.href, card: n ? n.textContent : '', btn: n ? (() => { const b = n.querySelector('button').getBoundingClientRect(); return [Math.round(b.width), Math.round(b.height)]; })() : null }; });
  const linkU = (SHEET.v['den:pk'] || {}).u;
  ok((row('den:pk') || {}).k === KEY, 'the link puts the key in his Sheet: ' + JSON.stringify(Object.keys(row('den:pk') || {})));
  ok(s.hash === '' && s.href.indexOf(KEY) < 0, 'the key is taken out of the address at once: ' + s.hash);
  ok(/Picture key saved/i.test(s.card) && /home screen/i.test(s.card) && s.btn && s.btn[1] >= 44, 'one card says it is saved and what to do next: ' + s.card + ' ' + s.btn);
  ok(B.st.hits === 0, 'the link page downloads no pictures: ' + B.st.hits);
  const linkRows = posts.filter(p => p.who === 'link').reduce((a, p) => a.concat(Object.keys((JSON.parse(p.b) || {}).v || {})), []);
  ok(linkRows.indexOf('den:pk') >= 0 && linkRows.every(k => k === 'den:pk' || k === 'den:seen'), 'the link visit writes only the key to his Sheet: ' + linkRows.join(','));
  ok(!(await B.R(() => !!document.querySelector('#l25.in'))) && !B.st.toasts.some(t => /narrator badges/.test(t)), 'the link visit shows no badge alerts (they stay for his phone)');
  await B.R(() => document.querySelector('#l54-note button').click()); ok(!(await B.R(() => !!document.getElementById('l54-note'))), 'OK closes the card');
  await B.ctx.close();
  // ---- back on his phone: when the app comes back to the screen the pictures come in by themselves ----
  await A.R(() => { document.dispatchEvent(new Event('visibilitychange')); }); await A.page.waitForTimeout(10000);
  s = await pics(A);
  ok(s.looks === 'night,pixel' && /superman:golden/.test(s.steel) && s.v === '1', 'his phone opens the pictures by itself when it comes back to the screen: ' + JSON.stringify(s));
  ok(A.st.toasts.some(t => /Your pictures are in/.test(t)), 'it says so: ' + A.st.toasts.join(' | '));
  ok(SHEET.v['den:pk'].u === linkU && !elsewhere.length, 'the key stays where the link put it: his phone never rewrites it and nothing sends it anywhere else (' + elsewhere.length + ')');
  s = await lookSheet(A); ok(!s.btn && !s.box, 'still no key box in the Look sheet: ' + JSON.stringify(s));
  // ---- next launch: nothing downloaded again; a newer pack comes in on its own, without doubling ----
  let hits = A.st.hits; await A.page.reload(); await A.page.waitForTimeout(8000);
  ok(A.st.hits === hits, 'next launch downloads nothing: ' + (A.st.hits - hits));
  await A.R(() => localStorage.setItem('den:packv', '0')); hits = A.st.hits; await A.page.reload(); await A.page.waitForTimeout(9000);
  s = await pics(A); ok(A.st.hits === hits + 1 && s.n === 2 && s.v === '1' && s.steel.split(',').length === 1, 'a newer pack comes in on its own, without doubling pictures: ' + JSON.stringify(s) + ' hits ' + (A.st.hits - hits));
  await A.ctx.close();
  // ---- a fresh copy of the app (a new phone): the pictures are there on first launch ----
  const C = await phone({ name: 'fresh', wait: 10000 }); s = await pics(C);
  ok(s.looks === 'night,pixel' && s.v === '1' && C.st.hits === 1, 'a fresh copy of the app opens them on first launch: ' + JSON.stringify(s) + ' hits ' + C.st.hits);
  await C.ctx.close();
  // ---- a key pasted with the first version still works ----
  const keep = SHEET.v['den:pk']; delete SHEET.v['den:pk'];
  const E = await phone({ name: 'pasted', ls: { 'den:pk': KEY }, wait: 10000 }); s = await pics(E);
  ok(s.looks === 'night,pixel' && s.v === '1', 'a key pasted with the first version still opens them: ' + JSON.stringify(s));
  await E.ctx.close();
  // ---- a wrong key opens nothing, says nothing, and is not tried again ----
  SHEET.v['den:pk'] = { u: Date.now(), j: JSON.stringify({ k: WRONG, u: Date.now() }) };
  const D = await phone({ name: 'wrong', wait: 10000 }); s = await pics(D);
  ok(s.n === 0 && s.v === null && !D.st.toasts.some(t => /pictures are in/.test(t)), 'a wrong key opens nothing: ' + JSON.stringify(s));
  hits = D.st.hits; await D.page.reload(); await D.page.waitForTimeout(9000); await D.R(() => { document.dispatchEvent(new Event('visibilitychange')); }); await D.page.waitForTimeout(9000);
  ok(hits === 1 && D.st.hits === 1, 'a key that did not open the pack is not tried again: ' + hits + ' then ' + D.st.hits);
  await D.ctx.close(); SHEET.v['den:pk'] = keep;
  // ---- the offline worker never keeps the pack; the pack in the site is not readable ----
  const sw = fs.readFileSync(path.join(ROOT, 'sw.js'), 'utf8'); ok(/art\\\/pack\\\.bin\$\/\.test\(u\.pathname\)\) return;/.test(sw), 'the service worker leaves the pack alone');
  if (fs.existsSync(path.join(ROOT, 'art/pack.bin'))) { const real = fs.readFileSync(path.join(ROOT, 'art/pack.bin')); const txt = real.toString('latin1'); ok(real.length > 1000 && !/den-pack|data:image|den-look-pictures|den-steel-pictures/.test(txt), 'the pack in the site is ciphertext: ' + real.length + ' bytes'); }
  ok(errs.length === 0, 'no page errors: ' + errs.slice(0, 3).join(' | '));
  await br.close(); srv.close(); console.log(pass + ' passed, ' + fail + ' failed'); process.exit(fail ? 1 : 0);
})().catch(e => { console.log('ERR', e); console.log(pass + ' passed, ' + (fail + 1) + ' failed'); process.exit(1); });

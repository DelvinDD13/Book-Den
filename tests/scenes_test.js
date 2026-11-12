// L53 series scenes: the cover painting of the series book being read, layered and moving on Home under the Stormlight,
// Mistborn and Throne of Glass looks; the shapes only go over the exact cover they were cut from; Books tab fan; encyclopedia.
const { chromium } = require('playwright'); const http = require('http'), fs = require('fs'), path = require('path');
const ROOT = process.env.ROOT || '/home/claude/book-den'; const SHOTS = process.env.SHOTS || '';
const MIME = { '.html': 'text/html', '.js': 'application/javascript', '.json': 'application/json', '.png': 'image/png', '.jpg': 'image/jpeg', '.woff2': 'font/woff2' };
const srv = http.createServer((req, res) => { let p = decodeURIComponent(req.url.split('?')[0]); if (p === '/') p = '/index.html'; fs.readFile(path.join(ROOT, p), (e, d) => { if (e) { res.writeHead(404); return res.end(); } res.writeHead(200, { 'Content-Type': MIME[path.extname(p)] || 'application/octet-stream' }); res.end(d); }); });
const store = fs.readFileSync(path.join(__dirname, 'store.json')); let pass = 0, fail = 0; const ok = (c, m) => { if (c) pass++; else { fail++; console.log('FAIL', m); } };
// the real covers (from the audit job) stand in for Apple's image server, matched by the same address hash the app uses
const fnv = s => { let h = 0x811c9dc5; for (let i = 0; i < s.length; i++) h = Math.imul(h ^ s.charCodeAt(i), 0x01000193) >>> 0; return ('0000000' + h.toString(16)).slice(-8); };
const norm = u => String(u || '').split('?')[0].replace(/\/\d+x\d+[a-z]*(?:-\d+)?\.(?:jpg|jpeg|png|webp)$/i, '');
const HB = { fa24dfe0: 'c00', '684bfbf7': 'c01', '4715855b': 'c02', c17d4bb7: 'c03', '59fbfb82': 'c04', b6a7a60d: 'c05', '4ead4d7c': 'c06', '2b6b74cd': 'c07', '5f7f5770': 'c08' };
const BIG = path.join(ROOT, 'audit/bigcov'); const PNG = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==', 'base64');
(async () => { await new Promise(r => srv.listen(8861, r)); const br = await chromium.launch(); const big = [];
  const mk = async (opts) => { const ctx = await br.newContext(Object.assign({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true }, opts || {}));
    await ctx.route(u => !/^http:\/\/localhost/.test(u.href), r => { const u = r.request().url(); if (r.request().resourceType() === 'image' || /mzstatic/.test(u)) { const f = HB[fnv(norm(u))]; if (f && fs.existsSync(path.join(BIG, f + '.jpg'))) { if (/1400x2100bb/.test(u)) big.push(f); return r.fulfill({ status: 200, contentType: 'image/jpeg', body: fs.readFileSync(path.join(BIG, f + '.jpg')) }); } return r.fulfill({ status: 200, contentType: 'image/png', body: PNG }); } return r.abort(); });
    await ctx.route(/script\.google\.com/, r => r.fulfill({ status: 200, contentType: 'application/json', body: store })); return ctx; };
  const ctx = await mk(); const page = await ctx.newPage(); const errs = []; page.on('pageerror', e => errs.push(String(e))); page.on('console', m => { if (m.type() === 'warning' && /l53/.test(m.text())) errs.push(m.text()); });
  await page.goto('http://localhost:8861/'); await page.waitForTimeout(6500); const R = (f, a) => page.evaluate(f, a);
  // pictures for review: every animation in the header held at one moment (ms into its cycle)
  const shot = async (n, ms) => { if (!SHOTS) return; await R(() => { if (!document.getElementById('shotcss')) { const st = document.createElement('style'); st.id = 'shotcss'; st.textContent = '#l25{display:none!important}'; document.head.appendChild(st); } document.querySelectorAll('body *').forEach(el => { if (!el.closest('header.hero') && getComputedStyle(el).position === 'fixed' && el.getBoundingClientRect().top < 300) el.style.visibility = 'hidden'; }); }); if (ms != null) await R(t => document.getAnimations().forEach(a => { try { const el = a.effect && a.effect.target; if (el && el.closest && el.closest('header.hero')) { a.pause(); a.currentTime = t; } } catch (e) {} }), ms);
    await page.screenshot({ path: path.join(SHOTS, n + '.png'), clip: { x: 0, y: 0, width: 390, height: 420 } }); if (ms != null) await R(() => document.getAnimations().forEach(a => { try { a.play(); } catch (e) {} })); };
  // ---- the hash and the pick ----
  let s = await R(() => [L53.fnv('abc'), L53.norm('https://is1-ssl.mzstatic.com/image/thumb/a/b.jpg/600x900bb.jpg?x=1')]);
  ok(s[0] === '1a47e90b' && s[1] === 'https://is1-ssl.mzstatic.com/image/thumb/a/b.jpg', 'address hash and size-free address: ' + s);
  // what the library says: the series book in progress, else the last one read, else the first
  const want = await R(() => { const f = ks => ks.find(k => L29.started(k) && !L29.read(k)) || ks.filter(k => L29.read(k)).pop() || ks[0]; return { storm: f(L53.SC.storm.ks), ash: f(L53.SC.ash.ks), glass: f(L53.SC.glass.ks) }; });
  s = await R(() => ['storm', 'ash', 'glass'].map(th => { const p = L53.pick(th); return p ? p.k + ':' + /\/1400x2100bb\.jpg$/.test(p.u) : null; }));
  ok(s.join() === [want.storm, want.ash, want.glass].map(k => k + ':true').join() && want.storm === 'wok', 'each look shows the book being read or last read, from its full-size cover: ' + s + ' want ' + JSON.stringify(want));
  // ---- Stormlight on Home ----
  await R(() => { L34.set({ on: true, mode: 'pick', pick: 'storm' }); switchLib('life'); window.scrollTo(0, 0); }); await page.waitForTimeout(1800);
  s = await R(() => { const m = document.querySelector('header.hero .b-mast'); const w = m.querySelector(':scope > .l53-wrap'); const own = m.querySelector(':scope > img'); const cs = x => x && getComputedStyle(x);
    const L = w ? [...w.querySelectorAll('.l53-L')].map(x => x.className.replace('l53-L ', '')) : []; const box = w && w.querySelector('.l53-base .l53-box'); const br = box && box.getBoundingClientRect(), mr = m.getBoundingClientRect();
    return { L, storm: m.classList.contains('l53-storm'), nosrc: m.classList.contains('l34-nosrc'), own: own && cs(own).visibility, imgs: w ? [...w.querySelectorAll('img')].map(i => i.getAttribute('src')).filter(u => /1400x2100bb/.test(u)).length : 0,
      masks: w ? [...w.querySelectorAll('.l53-box')].map(b => (b.style.webkitMaskImage || b.style.maskImage || '').replace(/^url\("?|"?\)$/g, '')).filter(Boolean) : [], cover: br ? [br.left <= mr.left + 0.5, br.right >= mr.right - 0.5, br.top <= mr.top + 0.5, br.bottom >= mr.bottom - 0.5].every(Boolean) : false,
      c: (m.querySelector('.l53-c') || {}).textContent, anim: [cs(w.querySelector('.l53-sky')).animationName, cs(m).animationName, getComputedStyle(m, '::after').animationName, cs(box).animationName], atmo: (document.querySelector('#l34sky .atmo') || {}).innerHTML,
      acc: getComputedStyle(document.documentElement).getPropertyValue('--d-acc').trim(), loaded: w ? [...w.querySelectorAll('img')].every(i => i.complete && i.naturalWidth > 1000) : false }; });
  ok(s.L.join() === 'l53-base,l53-sky,l53-fg' && s.storm && !s.nosrc && s.own === 'hidden', 'Stormlight Home: painting, drifting sky, figure on top: ' + JSON.stringify(s.L) + ' ' + s.own);
  ok(s.imgs === 3 && s.loaded, 'all three layers are the full-size Way of Kings cover from Apple: ' + s.imgs + ' ' + s.loaded);
  ok(s.masks.join() === 'art/scenes/wok_sky.png,art/scenes/wok_fg.png', 'the sky and figure shapes are the Way of Kings ones: ' + s.masks);
  ok(s.cover, 'the painting covers the whole masthead');
  ok(s.c === 'The Way of Kings · Michael Whelan', 'credit line: ' + s.c);
  ok(s.anim.join() === 'l53sky,l53thunder,l53flash,l53lit', 'sky drift, thunder jolt, lightning flash, lit painting: ' + s.anim);
  ok(s.atmo === '', 'no drawn sky over the painting: ' + s.atmo);
  let q = await R(() => [!!document.querySelector('#l34sky .l34-rig'), L34.mascot()]); ok(!q[0] && q[1] === null, 'no blade sprite over the Stormlight painting: ' + q);
  await R(() => L34.set({ mascot: 'blade' })); await page.waitForTimeout(700); q = await R(() => [!!document.querySelector('#l34sky .l34-rig'), L34.mascot()]); await R(() => L34.set({ mascot: 'auto' })); await page.waitForTimeout(300);
  ok(!q[0] && q[1] === null, 'not even when a sprite is picked by hand: ' + q);
  ok(s.acc === '#efb058', 'Stormlight takes its accent from the painting: ' + s.acc);
  await shot('storm_home_0', 0); await shot('storm_home_flash', 2800); await shot('storm_home_8s', 7900);
  // ---- the shapes only go over the cover they were cut from ----
  s = await R(() => { const t = ALL_TITLES.filter(x => /^The Way of Kings/i.test(x)); const keep = t.map(x => [x, JSON.stringify(getOverride('cv:' + x) || {})]);
    t.forEach(x => { const o = getOverride('cv:' + x); if (o && o.url) o.url = o.url.replace(/\/([^/]+)\/(\d+x\d+bb\.jpg)$/, '/other$1/$2'); });
    const r = L53.pick('storm'); keep.forEach(([x, j]) => Object.assign(getOverride('cv:' + x) || {}, JSON.parse(j))); return [r, L53.pick('storm') && L53.pick('storm').k]; });
  ok(s[0] === null && s[1] === 'wok', 'a changed cover gets no scene, and never a later book in its place: ' + JSON.stringify(s));
  // ---- Mistborn: the figure lifted out, the gap filled, floating ----
  await R(() => L34.set({ mode: 'pick', pick: 'ash' })); await page.waitForTimeout(2500);
  s = await R(() => { const m = document.querySelector('header.hero .b-mast'); const w = m.querySelector(':scope > .l53-wrap'); const c = w && w.querySelector('canvas.l53-fill');
    return { L: w ? [...w.querySelectorAll('.l53-L')].map(x => x.className.replace('l53-L ', '')) : [], ready: w && w.classList.contains('ready'), cw: c && c.width, ch: c && c.height, k: w && w.dataset.k, storm: m.classList.contains('l53-storm'), c: (m.querySelector('.l53-c') || {}).textContent,
      anim: w ? [getComputedStyle(w.querySelector('.l53-drift')).animationName, getComputedStyle(w.querySelector('.l53-bob')).animationName, getComputedStyle(w.querySelector('.l53-bob')).opacity] : [], acc: getComputedStyle(document.documentElement).getPropertyValue('--d-acc').trim() }; });
  ok(s.L.join() === 'l53-base,l53-drift,l53-fg l53-bob' && s.k === want.ash && !s.storm, 'Mistborn Home: the Mistborn book from the library, drifting mist, floating figure: ' + JSON.stringify(s));
  ok(s.ready && s.cw >= 1300 && s.ch >= 600, 'the gap behind the figure is filled on the phone at full size: ' + s.cw + 'x' + s.ch);
  ok(s.anim.join() === 'l53drift,l53bob,1', 'mist drifts and the figure floats once the fill is ready: ' + s.anim);
  ok(s.c === (await R(k => L53.B[k].c, want.ash)) && s.acc === '#f79353', 'Mistborn credit and colours: ' + s.c + ' ' + s.acc);
  s = await R(() => [!!document.querySelector('#l34sky .l34-rig'), L34.mascot()]); ok(!s[0] && s[1] === null, 'no Kelsier sprite over the Mistborn painting: ' + s);
  await shot('ash_home_0', 0); await shot('ash_home_mid', 2600); await shot('ash_home_8s', 7900);
  // ---- Throne of Glass: push-in under firelight, no dragon ----
  await R(() => L34.set({ mode: 'pick', pick: 'glass' })); await page.waitForTimeout(1800);
  s = await R(() => { const m = document.querySelector('header.hero .b-mast'); const w = m.querySelector(':scope > .l53-wrap'); return { L: w ? [...w.querySelectorAll('.l53-L')].map(x => x.className.replace('l53-L ', '')) : [], glow: !!(w && w.querySelector('.l53-push .l53-glow')),
      masc: L34.mascot(), mi: (document.querySelector('#l34sky .l34-m') || {}).innerHTML, anim: w ? getComputedStyle(w.querySelector('.l53-push')).animationName : '', sub: L34.TH.glass.sub, acc: getComputedStyle(document.documentElement).getPropertyValue('--d-acc').trim() }; });
  ok(s.L.join() === 'l53-push' && s.glow && s.anim === 'l53push', 'Throne of Glass Home: the painting pushes in with the glow: ' + JSON.stringify(s.L) + ' ' + s.anim);
  ok(!s.masc && !s.mi, 'no dragon on the Throne of Glass look: ' + s.masc + ' ' + (s.mi || '').slice(0, 40));
  ok(s.acc === '#d23a55', 'Throne of Glass colours: ' + s.acc);
  await shot('glass_home_0', 0); await shot('glass_home_8s', 7900);
  s = await R(() => [L34.TH.night.sub, L34.TH.storm.sub, L34.TH.storm.sw.join()]); ok(!/Starfall/.test(s[0]) && !/rain|blue/i.test(s[1]) && s[2] === '#120f1a,#efb058,#cc5f3f', 'look descriptions and swatches match what is shown: ' + s);
  // ---- back to the Den look: Home's own picture returns ----
  await R(() => L34.set({ mode: 'pick', pick: 'den' })); await page.waitForTimeout(1500);
  s = await R(() => { const m = document.querySelector('header.hero .b-mast'); const own = m.querySelector(':scope > img'); return [!!m.querySelector('.l53-wrap, .l53-c'), m.classList.contains('l53'), getComputedStyle(own).visibility, getComputedStyle(document.documentElement).getPropertyValue('--d-acc').trim()]; });
  ok(!s[0] && !s[1] && s[2] === 'visible' && s[3] !== '#efb058', 'the Den look takes the scene off and shows Home\'s own picture: ' + s);
  // ---- Books tab under Stormlight: the series' covers over the blurred painting; the montage returns under other looks ----
  await R(() => L34.set({ mode: 'pick', pick: 'storm' })); await R(() => { switchLib('books'); window.scrollTo(0, 0); }); await page.waitForTimeout(1500);
  s = await R(() => { const m = document.querySelector('header.hero .b-mast'); const f = [...m.querySelectorAll('.l53-fan img')].map(i => i.getAttribute('src')); return { blur: !!m.querySelector('.l53-blur .l53-box img'), f: f.length, mont: !!m.querySelector('.b-mbg, .b-mc'), storm: m.classList.contains('l53-storm'), mid: (L53.covers('stormlight')[1] || {}).k, n: L53.covers('stormlight').map(c => c.k).join() }; });
  s.front = await R(() => { const c = document.querySelector('header.hero .l53-fan .c.on'); const all = [...document.querySelectorAll('header.hero .l53-fan .c')]; return c ? [all.indexOf(c), all.every(x => +x.style.zIndex <= +c.style.zIndex), getComputedStyle(c).height === getComputedStyle(c.parentElement).height] : null; });
  ok(s.blur && s.f === 3 && !s.mont && s.storm && s.n.split(',')[0] === 'wok' && s.n.split(',').length === 3 && s.front && s.front[0] === 0 && s.front[1] && s.front[2], 'Books under Stormlight: three series covers over the blurred painting, the one being read in front: ' + JSON.stringify(s));
  await shot('storm_books');
  await R(() => { switchLib('life'); }); await page.waitForTimeout(400); await R(() => { L34.set({ mode: 'pick', pick: 'den' }); switchLib('books'); }); await page.waitForTimeout(1500);
  s = await R(() => { const m = document.querySelector('header.hero .b-mast'); return m ? [!!m.querySelector('.l53-wrap'), m.classList.contains('l53'), m.className] : ['none']; });
  ok(!s[0] && !s[1], 'other looks keep the Books montage: ' + s);
  await R(() => { L34.set({ mode: 'pick', pick: 'storm' }); }); await page.waitForTimeout(900); await R(() => L34.set({ mode: 'pick', pick: 'night' })); await page.waitForTimeout(900);
  s = await R(() => { const m = document.querySelector('header.hero .b-mast'); return m ? [!!m.querySelector('.l53-wrap'), m.classList.contains('l53'), m.dataset.k] : ['none']; });
  ok(s[0] === false && s[1] === false, 'changing the look while on Books puts the montage back: ' + s);
  // ---- the encyclopedia shows the painting behind its title ----
  s = await R(() => { const h = L29.ATMO.storm; const o = L29.ATMO.night; return [/1400x2100bb\.jpg/.test(h) && /container-type:size/.test(h), o === '']; });
  ok(s[0] && s[1], 'the Stormlight encyclopedia banner is the Way of Kings painting; ACOTAR unchanged: ' + s);
  s = await R(() => { try { L29.open('stormlight'); } catch (e) { return 'open ' + e.message; } return new Promise(r => setTimeout(() => { const host = document.getElementById('l29'); const sr = host && host.shadowRoot; const hero = sr && sr.querySelector('.hero'); const im = hero && hero.querySelector('.atmo img'); const cx = hero && hero.querySelector('.atmo .l53-cx'); const hr = hero && hero.getBoundingClientRect(), cr = cx && cx.getBoundingClientRect(), ir = im && im.parentElement.getBoundingClientRect();
    r(im && cx ? [im.complete && im.naturalWidth > 1000, Math.abs(cr.top - hr.top) < 1 && Math.abs(cr.width - hr.width) < 1 && cr.height > 200, ir.left <= cr.left + .5 && ir.right >= cr.right - .5 && ir.top <= cr.top + .5 && ir.bottom >= cr.bottom - .5] : ['no img', !!host, !!sr, !!hero]); }, 1500)); });
  ok(s[0] === true && s[1] === true && s[2] === true, 'the encyclopedia shows the painting across the top of its title: ' + s);
  if (SHOTS) await page.screenshot({ path: path.join(SHOTS, 'storm_codex.png'), clip: { x: 0, y: 0, width: 390, height: 520 } });
  ok(errs.length === 0, 'no page errors: ' + errs.slice(0, 3).join(' | '));
  // ---- reduced motion: still pictures ----
  const ctx2 = await mk({ reducedMotion: 'reduce' }); const p2 = await ctx2.newPage(); await p2.goto('http://localhost:8861/'); await p2.waitForTimeout(6500);
  await p2.evaluate(() => { L34.set({ on: true, mode: 'pick', pick: 'storm' }); switchLib('life'); }); await p2.waitForTimeout(1500);
  s = await p2.evaluate(() => { const m = document.querySelector('header.hero .b-mast'); const w = m.querySelector('.l53-wrap'); return w ? [getComputedStyle(w.querySelector('.l53-sky')).animationName, getComputedStyle(m).animationName, getComputedStyle(m, '::after').animationName] : ['no scene']; });
  ok(s.join() === 'none,none,none', 'reduced motion keeps the scene still: ' + s);
  await ctx2.close(); await br.close(); srv.close();
  console.log(pass + ' passed, ' + fail + ' failed'); process.exit(fail ? 1 : 0);
})().catch(e => { console.log('ERR', e); console.log(pass + ' passed, ' + (fail + 1) + ' failed'); process.exit(1); });

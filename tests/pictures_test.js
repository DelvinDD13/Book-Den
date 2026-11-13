// His own pictures as moving Home scenes (ACOTAR and the Dungeon Crawler Carl look): the pictures file through the Look
// sheet, pan / push, darkness / explosion / light, daily pick, Books tab, encyclopedia banner, no sprites, reduced motion.
const { chromium } = require('playwright'); const http = require('http'), fs = require('fs'), path = require('path'), os = require('os');
const ROOT = process.env.ROOT || '/home/claude/book-den';
const MIME = { '.html': 'text/html', '.js': 'application/javascript', '.json': 'application/json', '.png': 'image/png', '.jpg': 'image/jpeg', '.woff2': 'font/woff2' };
const srv = http.createServer((req, res) => { let p = decodeURIComponent(req.url.split('?')[0]); if (p === '/') p = '/index.html'; fs.readFile(path.join(ROOT, p), (e, d) => { if (e) { res.writeHead(404); return res.end(); } res.writeHead(200, { 'Content-Type': MIME[path.extname(p)] || 'application/octet-stream' }); res.end(d); }); });
const store = fs.readFileSync(path.join(__dirname, 'store.json')); let pass = 0, fail = 0; const ok = (c, m) => { if (c) pass++; else { fail++; console.log('FAIL', m); } };
const PNG = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==', 'base64');
(async () => { await new Promise(r => srv.listen(8867, r)); const br = await chromium.launch();
  const mk = async (opts) => { const ctx = await br.newContext(Object.assign({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true }, opts || {}));
    await ctx.route(u => !/^http:\/\/localhost/.test(u.href), r => r.request().resourceType() === 'image' ? r.fulfill({ status: 200, contentType: 'image/png', body: PNG }) : r.abort());
    await ctx.route(/script\.google\.com/, r => r.fulfill({ status: 200, contentType: 'application/json', body: store })); return ctx; };
  const ctx = await mk(); const page = await ctx.newPage(); const errs = []; page.on('pageerror', e => errs.push(String(e))); await page.goto('http://localhost:8867/'); await page.waitForTimeout(6500); const R = (f, a) => page.evaluate(f, a);
  // nothing big on screen keeps brightening or dimming fast, and nothing shakes (in a repeating animation, a change of a tenth or
  // more in under half a second counts; a one-time fade such as a badge banner coming in is not a flash)
  const NOFLASH = () => { const vw = innerWidth * innerHeight, bad = []; document.getAnimations().forEach(a => { const ef = a.effect; if (!ef || !ef.getKeyframes || !ef.target) return; const r = ef.target.getBoundingClientRect(); if (r.width * r.height < 0.1 * vw) return;
      const T = ef.getComputedTiming(); if (!(T.iterations > 1)) return; const dur = +T.duration || 0, K = ef.getKeyframes(); const val = k => { const f = String(k.filter || ''), m = f.match(/brightness\(([\d.]+)\)/); return { o: k.opacity != null && k.opacity !== '' ? +k.opacity : null, b: m ? +m[1] : null }; };
      for (let i = 1; i < K.length; i++) { const A0 = val(K[i - 1]), A1 = val(K[i]), dt = (K[i].computedOffset - K[i - 1].computedOffset) * dur; ['o', 'b'].forEach(p => { if (A0[p] != null && A1[p] != null && Math.abs(A1[p] - A0[p]) >= 0.1 && dt < 500) bad.push((a.animationName || 'anim') + ' ' + p + ' ' + A0[p] + '>' + A1[p] + ' in ' + Math.round(dt) + 'ms'); }); } });
    const m = document.querySelector('header.hero .b-mast'); return { bad, shake: m ? getComputedStyle(m).animationName : 'none', n: document.getAnimations().length }; };
  // ---- the looks before any pictures ----
  let s = await R(() => [Object.keys(L34.TH).join(), L34.TH.pixel.n, L34.TH.pixel.sub, L34.TH.night.sub, L34.TH.pixel.masc]);
  ok(s[0] === 'den,storm,ash,night,glass,pixel' && s[1] === 'Dungeon Crawler Carl' && s[2] === 'Pink and gold, Bungee' && s[3] === 'Night sky, Cormorant' && s[4] === 'none', 'a Dungeon Crawler Carl look, described by what it has: ' + s);
  // ---- a pictures file made in the page (two ACOTAR, two Carl), added through the Look sheet's Add pictures button ----
  const bundle = await R(() => { const pic = (w, h, c) => { const cv = document.createElement('canvas'); cv.width = w; cv.height = h; const g = cv.getContext('2d'); g.fillStyle = c; g.fillRect(0, 0, w, h); g.fillStyle = '#fff'; g.fillRect(w * 0.4, h * 0.2, w * 0.2, h * 0.3); return cv.toDataURL('image/jpeg', 0.8); };
    const it = (th, key, w, h, c, sc) => ({ th, key, img: pic(w, h, c), sc: Object.assign({ ar: +(w / h).toFixed(4) }, sc) });
    return JSON.stringify({ kind: 'den-look-pictures', v: 1, items: [it('night', 'n1', 300, 430, '#335', { c: [0, 0, 1, 1], m: 'pan', p: [0, 1], fx: 'night', o: [0.5, 0.4], g: '#ffd58a' }), it('night', 'n2', 320, 200, '#533', { c: [0, 0, 1, 1], m: 'push', fx: 'night' }),
      it('pixel', 'p1', 300, 450, '#a35', { c: [0, 0, 1, 1], m: 'pan', p: [0.1, 0.9], fx: 'boom', o: [0.6, 0.3] }), it('pixel', 'p2', 300, 300, '#3a5', { c: [0, 0, 1, 1], m: 'pan', p: [0, 1], fx: 'glow', o: [0.5, 0.2], g: '#ffe2a0' }), { th: 'nope', key: 'x', img: pic(10, 10, '#000'), sc: {} }] }); });
  const tmp = path.join(os.tmpdir(), 'Look pictures test.json'); fs.writeFileSync(tmp, bundle);
  await R(() => { L34.set({ on: true, mode: 'pick', pick: 'night' }); switchLib('life'); L34.open(); }); await page.waitForTimeout(800);
  const inp = await page.evaluateHandle(() => document.getElementById('l34').shadowRoot.querySelector('input[data-a="art"]'));
  s = await R(() => document.getElementById('l34').shadowRoot.querySelector('input[data-a="art"]').accept); ok(/\.json/.test(s) && /image/.test(s), 'Add pictures takes photos and a pictures file: ' + s);
  await inp.asElement().setInputFiles(tmp); await page.waitForTimeout(2500);
  s = await R(() => L34.artList().then(A => A.map(a => a.th + ':' + (a.sc ? a.sc.m : '-')).join()));
  ok(s === 'night:pan,night:push,pixel:pan,pixel:pan', 'the file adds four pictures with their settings, and skips a look that does not exist: ' + s);
  s = await R(() => [L34.TH.night.sub, L34.TH.pixel.sub, document.getElementById('l34').shadowRoot.querySelectorAll('.th').length]);
  ok(s[0] === 'Your pictures, darkness, Cormorant' && s[1] === 'Your pictures, pink and gold, Bungee' && s[2] === 6, 'with pictures the looks say so, and the sheet lists six looks: ' + s);
  const inp2 = await page.evaluateHandle(() => document.getElementById('l34').shadowRoot.querySelector('input[data-a="art"]')); await inp2.asElement().setInputFiles(tmp); await page.waitForTimeout(2000);
  s = await R(() => L34.artList().then(A => A.length)); ok(s === 4, 'adding the same file again adds nothing: ' + s);
  await R(() => L34.close()); await page.waitForTimeout(400);
  // ---- ACOTAR on Home: today's picture, moving, darkness at the edges, no sprite ----
  const today = (th) => R(t => L34.artList().then(A => { const P = A.filter(a => a.th === t); return P[Math.floor(Date.now() / 864e5) % P.length].id; }), th);
  await R(() => { switchLib('life'); window.scrollTo(0, 0); try { L11.head(); } catch (e) {} }); await page.waitForTimeout(1500);
  const wantN = await today('night');
  s = await R(() => { const m = document.querySelector('header.hero .b-mast'); const w = m.querySelector(':scope > .l53-wrap'); const L = w && w.querySelector('.l53-L'); const box = w && w.querySelector('.l53-box'); const br = box && box.getBoundingClientRect(), mr = m.getBoundingClientRect();
    const a = L ? L.getAnimations() : []; return { key: m.dataset.l53, L: L && L.className, img: w && /^blob:/.test((w.querySelector('img') || {}).src || ''), dark: !!(w && w.querySelector('.l53-dark')), glow: !!(w && w.querySelector('.l53-g')), own: getComputedStyle(m.querySelector(':scope > img')).visibility,
      covers: br ? br.left <= mr.left + 1 && br.right >= mr.right - 1 : false, anims: a.length + ':' + (a[0] ? a[0].playState : ''), rig: !!document.querySelector('#l34sky .l34-rig'), atmo: (document.querySelector('#l34sky .atmo') || {}).innerHTML }; });
  ok(new RegExp('^art:night:' + wantN + ':').test(s.key || ''), 'ACOTAR shows today\'s picture of his: ' + s.key + ' want ' + wantN);
  ok(s.img && s.own === 'hidden' && s.covers, 'his picture from the phone covers the masthead: ' + JSON.stringify(s));
  ok(s.dark && /l53-(pan|push)/.test(s.L || '') && s.atmo === '', 'darkness breathes at the edges, the picture moves, nothing drawn on top: ' + s.L + ' ' + s.anims);
  ok(!s.rig, 'no sprite over his picture');
  await R(() => L34.set({ mascot: 'kelsier' })); await page.waitForTimeout(700); s = await R(() => [!!document.querySelector('#l34sky .l34-rig'), L34.mascot()]); await R(() => L34.set({ mascot: 'auto' }));
  ok(!s[0] && s[1] === null, 'not even a sprite picked by hand: ' + s);
  // the pan picture itself: travels down the picture, and the light sits in it
  s = await R(() => L34.artList().then(A => { const a = A.find(x => x.th === 'night' && x.sc.m === 'pan'); const m = document.querySelector('header.hero .b-mast'); L53.paintArt(m, 'night', a); const L = m.querySelector('.l53-pan'); const an = L && L.getAnimations()[0]; const k = an && an.effect.getKeyframes();
    return { pan: !!L, glow: !!m.querySelector('.l53-pan .l53-box .l53-g'), from: k && k[0].transform, to: k && k[k.length - 1].transform, run: an && an.playState }; }));
  ok(s.pan && s.glow && /translate3d\(0(px)?, ?0(px)?, ?0(px)?\)/.test(s.from) && /translate3d\(0(px)?, ?-\d/.test(s.to) && s.run === 'running', 'a tall picture travels from its top to its bottom, its light moving with it: ' + JSON.stringify(s));
  // ---- the Carl look: his pictures move; nothing flashes or shakes; colours, font ----
  let nf0 = await R(NOFLASH); ok(!nf0.bad.length && nf0.shake === 'none', 'ACOTAR with his pictures: nothing on screen flashes or shakes: ' + JSON.stringify(nf0));
  await R(() => L34.set({ mode: 'pick', pick: 'pixel' })); await page.waitForTimeout(1500);
  const wantP = await today('pixel');
  s = await R(() => L34.artList().then(A => { const a = A.find(x => x.th === 'pixel' && x.sc.fx === 'boom'); const m = document.querySelector('header.hero .b-mast'); L53.paintArt(m, 'pixel', a); const box = m.querySelector('.l53-box'); const cs = getComputedStyle(document.documentElement);
    return { boom: m.classList.contains('l53-boom'), shake: getComputedStyle(m).animationName, lit: getComputedStyle(box).animationName, flash: !!m.querySelector('.l53-bf'), moves: !!m.querySelector('.l53-pan, .l53-push'), acc: cs.getPropertyValue('--d-acc').trim(), font: cs.getPropertyValue('--b-disp') }; }));
  ok(!s.boom && s.shake === 'none' && s.lit === 'none' && !s.flash && s.moves, 'an explosion picture moves like the rest: no flash, no shake: ' + JSON.stringify(s));
  nf0 = await R(NOFLASH); ok(!nf0.bad.length && nf0.shake === 'none', 'Carl: nothing on screen flashes or shakes: ' + JSON.stringify(nf0));
  ok(s.acc === '#ff4f9a' && /Den Bungee/.test(s.font), 'Carl colours and Bungee: ' + s.acc + ' ' + s.font);
  s = await R(() => document.fonts.check('40px "Den Bungee"') || document.fonts.load('40px "Den Bungee"').then(f => f.length > 0)); ok(s, 'the Bungee font loads from the site');
  await R(() => { L34.mast(); }); await page.waitForTimeout(900); s = await R(() => document.querySelector('header.hero .b-mast').dataset.l53 || '');
  ok(new RegExp('^art:pixel:' + wantP + ':').test(s), 'Home goes back to today\'s Carl picture: ' + s + ' want ' + wantP);
  // ---- Books tab and the encyclopedias ----
  await R(() => { switchLib('books'); window.scrollTo(0, 0); }); await page.waitForTimeout(1500);
  s = await R(() => { const m = document.querySelector('header.hero .b-mast'); return m ? [m.dataset.l53 || '', !!m.querySelector('.l53-blur img'), !!m.querySelector('.b-mbg, .b-mc')] : ['none']; });
  ok(/^art:pixel:/.test(s[0]) && s[1] && !s[2], 'Books under the Carl look: his picture, blurred, behind the series covers: ' + s);
  s = await R(() => [L29.ATMO.night, L29.ATMO.pixel, L53.ATMO0.pixel]);
  ok(/l53-cx/.test(s[0]) && /blob:/.test(s[0]) && /l53-cx/.test(s[1]) && /a-px/.test(s[2]) && !/a-px/.test(s[1]), 'the ACOTAR and Carl encyclopedias show his picture across the top: ' + String(s[1]).slice(0, 50));
  // ---- Follow what I'm reading picks the Carl look for a Carl book ----
  await R(() => { switchLib('life'); const t = ALL_TITLES.find(x => /^Dungeon Crawler Carl/.test(x)); setOverride(t, { status: 'currently-reading', tm: Date.now() + 9000 }); L34.set({ mode: 'auto' }); }); await page.waitForTimeout(3600);
  s = await R(() => [L34.current(), document.documentElement.classList.contains('th-pixel')]); ok(s[0] === 'pixel' && s[1], 'reading a Carl book brings the Carl look: ' + s);
  // ---- the Den look takes the scene off ----
  await R(() => L34.set({ mode: 'pick', pick: 'den' })); await page.waitForTimeout(1200);
  s = await R(() => { const m = document.querySelector('header.hero .b-mast'); return [!!m.querySelector('.l53-wrap'), m.classList.contains('l53-boom'), getComputedStyle(m.querySelector(':scope > img')).visibility]; });
  ok(!s[0] && !s[1] && s[2] === 'visible', 'the Den look shows its own picture again: ' + s);
  // ---- removing a picture ----
  s = await R(() => L34.artList().then(async A => { for (const a of A.filter(x => x.th === 'pixel')) await L34.artDel(a.id); const B = await L34.artList(); L53.setArt(B); return [B.length, L34.TH.pixel.sub]; }));
  ok(s[0] === 2 && s[1] === 'Pink and gold, Bungee', 'removing the Carl pictures puts the plain look back: ' + s);
  ok(errs.length === 0, 'no page errors: ' + errs.slice(0, 3).join(' | '));
  // ---- reduced motion: still ----
  const ctx2 = await mk({ reducedMotion: 'reduce' }); const p2 = await ctx2.newPage(); await p2.goto('http://localhost:8867/'); await p2.waitForTimeout(6500);
  await p2.evaluate(async (b) => { await L34.artImport(JSON.parse(b)); L34.set({ on: true, mode: 'pick', pick: 'pixel' }); switchLib('life'); }, bundle); await p2.waitForTimeout(1500);
  s = await p2.evaluate(() => L34.artList().then(A => { const a = A.find(x => x.th === 'pixel' && x.sc.fx === 'boom'); const m = document.querySelector('header.hero .b-mast'); L53.paintArt(m, 'pixel', a); const L = m.querySelector('.l53-pan'); return [L ? L.getAnimations().length : -1, getComputedStyle(m).animationName, document.getAnimations().filter(x => x.playState === 'running' && x.effect && x.effect.target && m.contains(x.effect.target)).length]; }));
  ok(s[0] === 0 && s[1] === 'none' && s[2] === 0, 'reduced motion keeps his pictures still: ' + s);
  await ctx2.close(); await br.close(); srv.close(); fs.unlinkSync(tmp);
  console.log(pass + ' passed, ' + fail + ' failed'); process.exit(fail ? 1 : 0);
})().catch(e => { console.log('ERR', e); console.log(pass + ' passed, ' + (fail + 1) + ' failed'); process.exit(1); });

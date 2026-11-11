const { chromium } = require('playwright'); const http = require('http'), fs = require('fs'), path = require('path');
const ROOT = '/home/claude/book-den'; const MIME = { '.html': 'text/html', '.js': 'application/javascript', '.json': 'application/json', '.png': 'image/png', '.jpg': 'image/jpeg' };
const srv = http.createServer((req, res) => { let p = decodeURIComponent(req.url.split('?')[0]); if (p === '/') p = '/index.html'; fs.readFile(path.join(ROOT, p), (e, d) => { if (e) { res.writeHead(404); return res.end(); } res.writeHead(200, { 'Content-Type': MIME[path.extname(p)] || 'application/octet-stream' }); res.end(d); }); });
const store = fs.readFileSync('/home/claude/den/pt/store.json'); let pass = 0, fail = 0; const ok = (c, m) => { if (c) pass++; else { fail++; console.log('FAIL', m); } };
(async () => { await new Promise(r => srv.listen(8791, r)); const br = await chromium.launch(); const ctx = await br.newContext({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true });
  await ctx.route(u => !/^http:\/\/localhost/.test(u.href), r => r.abort()); await ctx.route(/script\.google\.com/, r => r.fulfill({ status: 200, contentType: 'application/json', body: store }));
  const page = await ctx.newPage(); const errs = []; page.on('pageerror', e => errs.push(String(e)));
  await page.goto('http://localhost:8791/'); await page.waitForTimeout(6000);
  await page.evaluate(() => { const T = ALL_TITLES; const m = rx => T.filter(t => rx.test(t)); m(/^The Way of Kings|A Court of Mist and Fury \(10th/).forEach(t => setOverride(t, { status: 'currently-reading' })); m(/Well of Ascension|Hero of Ages|^A Court of Thorns and Roses \(/).forEach(t => setOverride(t, { status: 'read', finished: '2026-11-01' })); L29.flush(); });
  const R = () => page.evaluate(() => document.getElementById('l29').shadowRoot.querySelector('.scr').textContent);
  const all = sel => page.evaluate(s => document.getElementById('l29').shadowRoot.querySelectorAll(s).length, sel);
  await page.evaluate(() => L29.open('stormlight')); let t = await R();
  ok(/Kaladin/.test(t) && /Dalinar Kholin/.test(t), 'open entries listed'); ok(!/Eshonai|Venli|Lift|Pattern|Fused|Everstorm|Odium/.test(t), 'sealed entry names hidden at Part One');
  const s1 = await page.evaluate(() => L29.stats(L29.by.stormlight).u);
  await page.evaluate(() => L29.open('stormlight', 'kaladin')); t = await R(); ok(/Honor Chasm/.test(t), 'Part One text shown'); ok(!/Sylphrena|Windrunner|Second Ideal|sideways|highstorm as punishment|Amaram murdered/i.test(t), 'later Kaladin text not in the page');
  ok(/8 more sections sealed/.test(t), 'sealed count shown');
  await page.evaluate(() => { L29.setPart('wok', 3); L29.open('stormlight', 'kaladin'); }); t = await R(); ok(/highstorm as punishment/.test(t) && !/Second Ideal/.test(t), 'Part Three opens Part Three only');
  const s3 = await page.evaluate(() => L29.stats(L29.by.stormlight).u); ok(s3 > s1, 'count rises with the part: ' + s1 + ' -> ' + s3);
  await page.evaluate(() => { L29.setPart('wok', 1); L29.open('stormlight'); });
  // family tree: sealed people absent
  await page.evaluate(() => document.getElementById('l29').shadowRoot.querySelector('[data-k=trees]').click()); t = await R(); ok(/Gavilar/.test(t) && /Adolin/.test(t), 'tree drawn'); ok(!/Evi|Aesudan|Gavinor|Shallan Davar|Oroden/.test(t), 'sealed tree people absent');
  // charts: ring sealed at Part One
  await page.evaluate(() => document.getElementById('l29').shadowRoot.querySelector('[data-k=charts]').click()); t = await R(); ok(/Three Lashings/.test(t) && !/ten orders|Skybreakers|Gravitation|Windrunners/i.test(t), 'orders chart sealed');
  // finished series fully open, unread series sealed
  await page.evaluate(() => L29.open('tog')); t = await R(); ok(/175 \/ 175/.test(t), 'ToG all open');
  // search
  await page.evaluate(() => { L29.open(); const r = document.getElementById('l29').shadowRoot; const q = r.querySelector('.q'); q.value = 'kelsier'; q.dispatchEvent(new Event('input', { bubbles: true })); }); t = await R(); ok(/Kelsier/.test(t) && /Mistborn/.test(t), 'search finds Kelsier');
  await page.evaluate(() => { const r = document.getElementById('l29').shadowRoot; const q = r.querySelector('.q'); q.value = 'odium'; q.dispatchEvent(new Event('input', { bubbles: true })); }); t = await R(); ok(/Nothing opened matches/.test(t), 'search cannot find sealed things');
  // mid-book ACOMAF
  await page.evaluate(() => L29.open('acotar', 'rhysand')); t = await R(); ok(/came for her at her wedding/.test(t) && !/mask|Velaris|mate from the moment/i.test(t), 'ACOMAF checkpoint 1 only');
  // book sheet button + books card + badges
  await page.evaluate(() => { L29.close(); switchLib('books'); }); await page.waitForTimeout(1200);
  ok(await page.evaluate(() => !!document.querySelector('.l29-sec .l29-t')), 'card on Books'); ok(await page.evaluate(() => !document.querySelector('.l27-sec')), 'old companion card gone');
  await page.evaluate(() => openSheet(ALL_TITLES.find(t => /^The Way of Kings/.test(t)))); await page.waitForTimeout(900); ok(await page.evaluate(() => !!document.querySelector('.l29-sb')), 'button on the book sheet');
  await page.evaluate(() => document.querySelector('.l29-sb').click()); await page.waitForTimeout(400); ok(await page.evaluate(() => document.getElementById('l29').classList.contains('on') && /Stormlight/i.test(document.getElementById('l29').shadowRoot.querySelector('.bt').textContent)), 'button opens the series');
  const B = await page.evaluate(() => L4.all().filter(b => b.lore).map(b => b.name + ':' + b.tier + ':' + b.v + '/' + b.th.join(','))); console.log(B.join(' | ')); ok(B.length === 5, 'five lore badges, one per book series');
  // unlock banner when a book is finished
  await page.evaluate(() => { L29.close(); L29.check(true); setOverride(ALL_TITLES.find(t => /^The Way of Kings/.test(t)), { status: 'read', finished: '2026-11-10' }); }); await page.waitForTimeout(1800);
  ok(await page.evaluate(() => { const b = document.getElementById('l29b'); return !!b && /Stormlight/.test(b.textContent) && /\+\d+/.test(b.textContent); }), 'lore banner after finishing'); console.log(await page.evaluate(() => (document.getElementById('l29b') || {}).textContent));
  await page.evaluate(() => L29.open('stormlight')); t = await R(); ok(/New · \d+/.test(t), 'New chip after unlock');
  // the Empyrean: Fourth Wing open (finished), only the opening of Iron Flame (started), nothing from the rest of Iron Flame or Onyx Storm
  const emp = await page.evaluate(async () => { L29.close(); L29.open('empyrean'); await new Promise(r => setTimeout(r, 500)); const root = document.getElementById('l29').shadowRoot; const all = []; const S = L29.by.empyrean;
    for (const e of S.e) { L29.open('empyrean', e.id); await new Promise(r => setTimeout(r, 30)); all.push(root.innerHTML); } const st = L29.stats(S); return { html: all.join(' '), st, started: L29.started('if'), read: L29.read('fw') }; });
  ok(emp.read && emp.started && /twenty-first birthday/.test(emp.html) && /lightning/.test(emp.html), 'Empyrean: Fourth Wing is open and the opening of Iron Flame shows once it is started');
  ok(!/inntinnsic|dreamwalking|became venin|irid|First Six|gave her life|Wyverns are real|graduated as a lieutenant/.test(emp.html), 'Empyrean: nothing past the opening of Iron Flame is on the page');
  ok(emp.st.lock && emp.st.lock.if > 0 && emp.st.lock.os > 0, 'Empyrean: the sealed count waits on Iron Flame and Onyx Storm: ' + JSON.stringify(emp.st.lock));
  // Iron Flame opens chapter by chapter: through chapter 8 shows Aaric and the new vice commandant, not chapter 9 onward
  const emp2 = await page.evaluate(async () => { L29.setPart('if', 2); L29.close(); const root = () => document.getElementById('l29').shadowRoot; const all = []; const S = L29.by.empyrean;
    for (const e of S.e) { L29.open('empyrean', e.id); await new Promise(r => setTimeout(r, 30)); all.push(root().innerHTML); } L29.close(); L29.setPart('if', 0); return all.join(' '); });
  ok(/Camlaen Aaric Tauri/.test(emp2) && /vice commandant/.test(emp2) && !/Nadine|Samara|First Six|talladium/.test(emp2), 'Empyrean: through chapter 8 of Iron Flame opens chapters 1 to 8 and nothing after');
  console.log(pass + ' passed, ' + fail + ' failed', JSON.stringify(errs.slice(0, 5))); await br.close(); srv.close(); process.exit(fail ? 1 : 0); })();

// L47: Audible time counts. The time left Audible shows becomes listening time (less what the timer already logged), on the day picked.
const { chromium } = require('playwright'); const http = require('http'), fs = require('fs'), path = require('path');
const ROOT = process.env.ROOT || '/home/claude/book-den'; const MIME = { '.html': 'text/html', '.js': 'application/javascript', '.json': 'application/json' };
const srv = http.createServer((req, res) => { let p = decodeURIComponent(req.url.split('?')[0]); if (p === '/') p = '/index.html'; fs.readFile(path.join(ROOT, p), (e, d) => { if (e) { res.writeHead(404); return res.end(); } res.writeHead(200, { 'Content-Type': MIME[path.extname(p)] || 'application/octet-stream' }); res.end(d); }); });
const store = fs.readFileSync(path.join(__dirname, 'store.json')); let pass = 0, fail = 0; const ok = (c, m) => { if (c) pass++; else { fail++; console.log('FAIL', m); } };
(async () => { await new Promise(r => srv.listen(8844, r)); const br = await chromium.launch(); const ctx = await br.newContext({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true });
  await ctx.route(u => !/^http:\/\/localhost/.test(u.href), r => r.abort()); await ctx.route(/script\.google\.com/, r => r.fulfill({ status: 200, contentType: 'application/json', body: store }));
  const page = await ctx.newPage(); const errs = []; page.on('pageerror', e => errs.push(String(e))); await page.goto('http://localhost:8844/'); await page.waitForTimeout(6500); const R = (f, a) => page.evaluate(f, a);
  const TEN = 'A Court of Mist and Fury (10th Anniversary Recording)';
  const sh = () => R(() => { const r = document.getElementById('l35').shadowRoot; const b = r.querySelector('.body'); return { aud: b.classList.contains('aud'), seg: [...r.querySelectorAll('[data-l47m]')].map(x => x.textContent + (x.classList.contains('on') ? '*' : '')), sum: (r.querySelector('[data-l47sum]') || {}).textContent || '', hint: ([...r.querySelectorAll('.l47 .f em')][0] || {}).textContent || '', minHidden: getComputedStyle(r.querySelector('[data-f=min]').closest('.f')).display === 'none', lenF: !!r.querySelector('[data-l47=lh]') }; });
  const type = (h, m) => R(([h, m]) => { const r = document.getElementById('l35').shadowRoot; const a = r.querySelector('[data-l47=h]'), b = r.querySelector('[data-l47=m]'); a.value = h; b.value = m; a.dispatchEvent(new Event('input')); b.dispatchEvent(new Event('input')); }, [h, m]);
  const click = sel => R(s => document.getElementById('l35').shadowRoot.querySelector(s).click(), sel);
  // 1. the sheet
  await R(t => { setOverride(t, { rs: [], al: [], progress: 0, status: 'currently-reading' }); setOverride('rt0', { sp: 2, am: null }); L35.addTime(t); }, TEN); await page.waitForTimeout(300);
  let s = await sh(); ok(s.aud && s.seg.join() === 'Minutes,From Audible*' && s.minHidden, 'Add time opens on From Audible, minutes hidden: ' + JSON.stringify(s.seg));
  ok(/Whole book: 19 h 35 m/.test(s.hint) && !s.lenF, 'with no reading yet it counts from the whole length: ' + s.hint);
  await type(17, 24); await page.waitForTimeout(100); s = await sh();
  ok(/^1 h 06 m listened/.test(s.sum) && /2 h 11 m of book at 2x/.test(s.sum) && /Progress moves to 11%/.test(s.sum), 'the sum: 2 h 11 m of book at 2x is 1 h 06 m, progress 11%: ' + s.sum);
  await click('[data-g=sp] [data-k="1.5"]'); await page.waitForTimeout(100); s = await sh(); ok(/^1 h 27 m listened/.test(s.sum), 'speed changes the sum (2 h 11 m at 1.5x is 1 h 27 m): ' + s.sum.slice(0, 40));
  await click('[data-g=sp] [data-k="2"]'); await page.waitForTimeout(50);
  await click('[data-a=save]'); await page.waitForTimeout(400);
  const d1 = await R(t => { const o = getOverride(t); const d = L35.today(); return { rs: o.rs, al: o.al, p: o.progress, day: L35.minutesOn(d), aud: L47.audOn(d), open: document.getElementById('l35').classList.contains('on') }; }, TEN);
  ok(d1.rs.length === 1 && d1.rs[0][1] === 66 && d1.rs[0][2] === 2 && d1.rs[0][4] === 'a' && d1.rs[0][0].slice(0, 10) === await R(() => L35.today()), 'saved as a 66-minute session from Audible, today: ' + JSON.stringify(d1.rs));
  ok(d1.al.length === 1 && d1.al[0][1] === 1044 && d1.p === 11 && d1.day >= 66 && d1.aud === 66 && !d1.open, 'the reading, progress 11% and the day total: ' + JSON.stringify([d1.al, d1.p, d1.day, d1.aud]));
  // 2. the quest line and Home
  const q = await R(() => { const x = L37.list(); const r = (Array.isArray(x) ? x : (x.today || x.all || Object.values(x).flat())).find(y => y && y.id === 'read'); return r ? r.show : JSON.stringify(Object.keys(x)).slice(0, 80); });
  ok(q && /1 h 06( m)? from Audible/.test(q) && /on the timer/.test(q), 'the day quest splits timer and Audible: ' + q);
  const home = await R(() => { try { return L11.home(); } catch (e) { return String(e); } });
  ok(/17 h 24 m left in Audible/.test(home), 'Home shows what Audible has left on the current book');
  // 3. timer time in between is not counted twice
  await R(t => { const o = getOverride(t); const rs = o.rs.slice(); const d = new Date(Date.now() + 60000); const p = n => String(n).padStart(2, '0'); rs.push([L35.today() + 'T' + p(d.getHours()) + ':' + p(d.getMinutes()), 20, 2, null]); setOverride(t, { rs }); L35.addTime(t); }, TEN); await page.waitForTimeout(300);
  s = await sh(); ok(/Last entry: 17 h 24 m left, on /.test(s.hint), 'the hint names the last entry: ' + s.hint);
  await type(16, 24); await page.waitForTimeout(100); s = await sh();
  ok(/^10 min listened/.test(s.sum) && /timer already logged 20 min of it, so 10 min is added/.test(s.sum), 'the timer share is taken off: ' + s.sum);
  await click('[data-l47w=yday]'); await page.waitForTimeout(50); s = await sh(); ok(/that day’s 3 h/.test(s.sum), 'a past day says so: ' + s.sum.slice(-90));
  await click('[data-a=save]'); await page.waitForTimeout(300);
  const d2 = await R(t => { const o = getOverride(t); const y = new Date(); y.setDate(y.getDate() - 1); return { last: o.rs[o.rs.length - 1], y: L35.iso(y) }; }, TEN);
  ok(d2.last[1] === 10 && d2.last[4] === 'a' && d2.last[0].slice(0, 10) === d2.y, 'counted on yesterday: ' + JSON.stringify(d2));
  // 4. a Nov 7 reading from his Audible library is the starting point
  const WOK = 'The Way of Kings: Book One of the Stormlight Archive';
  const has = await R(t => ALL_TITLES.indexOf(t) >= 0, WOK);
  if (has) { await R(t => { setOverride(t, { rs: [], al: [] }); L35.addTime(t); }, WOK); await page.waitForTimeout(300); s = await sh();
    ok(/Last entry: 45 h 02 m left, from your Audible library on Nov 7/.test(s.hint), 'the Nov 7 library page is the first reading: ' + s.hint);
    await type(44, 2); await page.waitForTimeout(100); s = await sh(); ok(/^30 min listened/.test(s.sum) && /since Nov 7/.test(s.sum), '1 h of book since Nov 7 at 2x is 30 min: ' + s.sum.slice(0, 60)); await R(() => L35.close()); }
  else ok(false, 'The Way of Kings is in the library');
  // 5. no length and no reading: asks for the length, and without it saves the place only
  const nol = await R(() => ALL_TITLES.find(t => !L46.len(t) && !L47.last(t) && !(getOverride(t).rs || []).length));
  await R(t => L35.addTime(t), nol); await page.waitForTimeout(300); s = await sh(); ok(s.lenF, 'a book with no known length asks for it: ' + nol);
  await type(3, 0); await page.waitForTimeout(100); s = await sh(); ok(/Saved as your place/.test(s.sum), 'without the length nothing is counted: ' + s.sum);
  await R(() => { const r = document.getElementById('l35').shadowRoot; const a = r.querySelector('[data-l47=lh]'); a.value = 5; a.dispatchEvent(new Event('input')); }); await page.waitForTimeout(100); s = await sh();
  ok(/^1 h 00 m listened/.test(s.sum), 'with the length, 2 h of book at 2x counts 1 h: ' + s.sum.slice(0, 30)); await R(() => L35.close());
  // 6. the Minutes side still works and remembers the choice
  await R(t => L35.addTime(t), TEN); await page.waitForTimeout(200); await click('[data-l47m=min]'); await page.waitForTimeout(100);
  await R(() => { const r = document.getElementById('l35').shadowRoot; const i = r.querySelector('[data-f=min]'); i.value = 15; i.dispatchEvent(new Event('input')); }); await click('[data-a=save]'); await page.waitForTimeout(300);
  const d3 = await R(t => { const o = getOverride(t); return { last: o.rs[o.rs.length - 1], am: getOverride('rt0').am }; }, TEN);
  ok(d3.last[1] === 15 && d3.last[4] == null && d3.am === 'min', 'Minutes still logs a plain session and the choice is kept: ' + JSON.stringify(d3));
  await R(t => L35.addTime(t), TEN); await page.waitForTimeout(200); s = await sh(); ok(!s.aud && s.seg.join() === 'Minutes*,From Audible', 'next time it opens on Minutes'); await R(() => L35.close());
  // 7. Lifestyle: Reading row in the four weeks
  const lw = await R(() => { switchLib('life'); const h = [...document.querySelectorAll('.l3-h')].find(e => /last 4 weeks/i.test(e.textContent)); if (!h) return null; const rows = [...h.nextElementSibling.querySelectorAll('.l3-tr')]; const r = rows.find(x => /Reading/.test(x.textContent)); return r ? { first: rows[0] === r, cells: [...r.querySelectorAll('small')].map(x => x.textContent) } : null; });
  ok(lw && lw.first && lw.cells.length === 4 && /^\dh \d\dm$/.test(lw.cells[3]), 'Lifestyle has a Reading row over the four weeks: ' + JSON.stringify(lw));
  ok(!errs.length, 'no page errors: ' + errs.slice(0, 3).join(' | '));
  console.log(pass + ' passed, ' + fail + ' failed'); await br.close(); srv.close(); process.exit(fail ? 1 : 0); })();

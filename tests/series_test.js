// L57 series pages: every themed series opens with its own look, nothing overflows the phone width and nothing moves; the data is
// right (owned vs missing, extras in place, his reading order, the next book); the ways in (a book's series line, the Series view);
// a book opened from the page comes back to the page; "Add the missing" puts them on Want to Read; Escape and ✕ close it.
const { chromium } = require('playwright'); const http = require('http'), fs = require('fs'), path = require('path');
const ROOT = process.env.ROOT || '/home/claude/book-den';
const MIME = { '.html': 'text/html', '.js': 'application/javascript', '.json': 'application/json', '.png': 'image/png', '.jpg': 'image/jpeg', '.woff2': 'font/woff2' };
const srv = http.createServer((req, res) => { let p = decodeURIComponent(req.url.split('?')[0]); if (p === '/') p = '/index.html'; fs.readFile(path.join(ROOT, p), (e, d) => { if (e) { res.writeHead(404); return res.end(); } res.writeHead(200, { 'Content-Type': MIME[path.extname(p)] || 'application/octet-stream' }); res.end(d); }); });
const store = fs.readFileSync(path.join(__dirname, 'store.json')); let pass = 0, fail = 0; const ok = (c, m) => { if (c) pass++; else { fail++; console.log('FAIL', m); } };
const PNG = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==', 'base64');
(async () => { await new Promise(r => srv.listen(8875, r)); const br = await chromium.launch(); const ctx = await br.newContext({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true });
  await ctx.route(u => !/^http:\/\/localhost/.test(u.href), r => r.request().resourceType() === 'image' ? r.fulfill({ status: 200, contentType: 'image/png', body: PNG }) : r.abort());
  await ctx.route(/script\.google\.com/, r => r.fulfill({ status: 200, contentType: 'application/json', body: store }));
  await ctx.addInitScript(() => { const T = new Date('2026-11-14T15:00:00').getTime(); const D0 = Date; const off = T - D0.now(); class D extends D0 { constructor(...a) { if (!a.length) super(D0.now() + off); else super(...a); } static now() { return D0.now() + off; } } window.Date = D; });
  const page = await ctx.newPage(); const errs = []; page.on('pageerror', e => errs.push(String(e))); page.on('console', m => { if (/l57/.test(m.text())) errs.push(m.text()); });
  await page.addInitScript(() => { const iv = setInterval(() => { if (window.L25 && L25.announce && !L25.announce._q) { L25.announce = function () {}; L25.announce._q = 1; } }, 30); setTimeout(() => clearInterval(iv), 30000); });
  await page.goto('http://localhost:8875/'); await page.waitForTimeout(7500); const R = (f, a) => page.evaluate(f, a);
  // where he is (the test copy of his library is from Nov 1): Way of Kings 88% in, Mistborn 1 and 2 read
  await R(() => { setOverride('The Way of Kings: Book One of the Stormlight Archive', { status: 'currently-reading', progress: 88 }); setOverride('The Well of Ascension', { status: 'read', finished: '2026-11-08' }); });
  // ---- every themed series: its own look, fits the width, nothing moves ----
  const names = await R(() => Object.keys(L57.INFO)); const looks = new Set();
  for (const s of names) { const r = await R(async s => { const opened = L57.open(s); await document.fonts.ready; await new Promise(r => setTimeout(r, 250)); const h = document.getElementById('l57'); const t = h.querySelector('.l57-t'); const W = t.clientWidth;
      const over = [...t.querySelectorAll('span')].some(x => x.getBoundingClientRect().right - t.getBoundingClientRect().left > W + 2); const anims = [...h.querySelectorAll('*')].reduce((n, el) => n + el.getAnimations().length, 0) + h.getAnimations().length;
      const cs = getComputedStyle(t); return { opened, on: h.classList.contains('on'), cls: h.className, over, sw: h.scrollWidth, anims, font: cs.fontFamily, head: (h.querySelector('.l57-card b') || {}).textContent || '', rows: h.querySelectorAll('.l57-list:not(.l57-up) .l57-row').length, eye: (h.querySelector('.l57-eye') || {}).textContent || '' }; }, s);
    looks.add(r.cls.replace(/^on /, '')); ok(r.opened && r.on && !r.over && r.sw <= 390 && r.anims === 0 && r.head && r.rows > 0 && /^Series · .+ · \d{4}–/.test(r.eye), s + ': opens with its look, the title fits 390 px, nothing animates: ' + JSON.stringify({ over: r.over, sw: r.sw, anims: r.anims, rows: r.rows, eye: r.eye })); }
  ok(looks.size === names.length, 'each themed series has a different look: ' + looks.size + ' of ' + names.length);
  // ---- the Stormlight page ----
  let s = await R(() => { L57.open('The Stormlight Archive'); const h = document.getElementById('l57'); return { lib: h.querySelector('.l57-lib b').textContent, add: (h.querySelector('.l57-add') || {}).textContent, card: h.querySelector('.l57-card').innerText.replace(/\n/g, ' | '), rows: [...h.querySelectorAll('.l57-list:not(.l57-up) .l57-row')].map(r => r.querySelector('.tx i').textContent + ':' + r.querySelector('.tx b').textContent + ':' + (r.querySelector('em') || {}).textContent), up: [...h.querySelectorAll('.l57-up .l57-row b')].map(x => x.textContent), stats: [...h.querySelectorAll('.l57-stats dd')].map(x => x.textContent), cls: h.className }; });
  ok(s.lib === 'All 5 books, 2 of 3 extras' && s.add === 'Add the 1 missing', 'Stormlight: all five books and two of three extras, one to add: ' + s.lib + ' / ' + s.add);
  ok(s.rows.join(' || ') === 'Book 1:The Way of Kings:88% || Book 2:Words of Radiance:Next || Extra:Elsecaller and King Lopen the First of Alethkar:Get it || Extra:Edgedancer:Owned || Book 3:Oathbringer:Owned || Extra:Dawnshard:Owned || Book 4:Rhythm of War:Owned || Book 5:Wind and Truth:Owned', 'every book in order with the extras where they fall: ' + s.rows.join(' || '));
  ok(/In book 1/i.test(s.card) && /The Way of Kings, 88% in, about 3 h \d\d m left/.test(s.card) && /Next: Book 2, Words of Radiance \(26 h 48 m\)/.test(s.card) && /to catch up/.test(s.card) && /Change where you are/.test(s.card), 'your place: in book 1, 88%, next Words of Radiance at 1.8x: ' + s.card);
  ok(s.up.join() === 'Book 6,Books 7 to 10' && /five to come/.test(s.stats[0]) && /Kramer & Reading/.test(s.stats.join()), 'still to come and the stats: ' + s.up.join() + ' / ' + s.stats.join(' / '));
  ok(/f-cinzel/.test(s.cls) && /fit/.test(s.cls) && /t-rain/.test(s.cls) && /w-grid/.test(s.cls), 'Stormlight look: carved Cinzel set to the width, rain, the cover wall');
  s = await R(() => { L57.open('The Stormlight Archive'); const small = [...document.querySelectorAll('#l57 button, #l57 a')].filter(b => b.offsetParent !== null || getComputedStyle(b).position === 'fixed').map(b => [b.className || b.dataset.l57 || b.tagName, Math.round(b.getBoundingClientRect().height)]).filter(x => x[1] < 40); return small; });
  ok(s.length === 0, 'every control on the page is at least 40 px tall: ' + JSON.stringify(s));
  // ---- Mistborn: his order, next main book ----
  s = await R(() => { L57.open('Mistborn'); const h = document.getElementById('l57'); return { rows: [...h.querySelectorAll('.l57-list:not(.l57-up) .l57-row .tx b')].map(x => x.textContent), card: h.querySelector('.l57-card').innerText.replace(/\n/g, ' | '), wall: h.querySelectorAll('.l57-wall span').length }; });
  ok(s.rows.join() === 'The Final Empire,The Well of Ascension,The Hero of Ages,The Alloy of Law,Shadows of Self,The Bands of Mourning,The Eleventh Metal,Secret History,The Lost Metal', 'Mistborn in his order, the Arcanum stories after The Bands of Mourning: ' + s.rows.join());
  ok(/Through book 2/i.test(s.card) && /Next: Book 3, The Hero of Ages/.test(s.card) && s.wall === 1, 'through book 2, next The Hero of Ages, one painting behind the title: ' + s.card);
  // ---- The Wheel of Time: books he doesn't own yet are listed one by one ----
  s = await R(() => { L57.open('The Wheel of Time'); const h = document.getElementById('l57'); return { lib: h.querySelector('.l57-lib b').textContent, rows: [...h.querySelectorAll('.l57-list:not(.l57-up) .l57-row')].map(r => r.querySelector('.tx i').textContent + ':' + r.querySelector('.tx b').textContent), links: [...h.querySelectorAll('a.l57-row')].length, add: (h.querySelector('.l57-add') || {}).textContent }; });
  ok(s.lib === 'You have 6 of 14 books, 0 of 1 extra' && s.add === 'Add the 9 missing' && s.links === 9, 'Wheel of Time: 6 of 14 owned, New Spring as the extra, 9 to add: ' + s.lib);
  ok(s.rows[6] === 'Book 7:A Crown of Swords' && s.rows[10] === 'Extra:New Spring' && s.rows[11] === 'Book 11:Knife of Dreams' && s.rows[14] === 'Book 14:A Memory of Light', 'books 7 to 14 by name, New Spring where it came out: ' + s.rows.slice(6).join(' / '));
  // ---- Percy Jackson: companion books are extras, so the numbering holds ----
  s = await R(() => { const D = L57.data('Percy Jackson & the Olympians'); return D.R.filter(x => !x.up).map(x => (x.extra ? 'x' : x.num) + ':' + x.title); });
  ok(s.some(x => /^x:The Demigod Files/.test(x)) && s.some(x => /^6:The Chalice of the Gods/.test(x)) && s.some(x => /^7:Wrath of the Triple Goddess/.test(x)), 'Percy Jackson: The Demigod Files is an extra; Chalice is book 6 and Wrath book 7: ' + s.join(' / '));
  // ---- the ways in ----
  s = await R(async () => { L57.close(); switchLib('books'); openSheet('The Way of Kings: Book One of the Stormlight Archive'); await new Promise(r => setTimeout(r, 200)); const b = document.querySelector('#sheet .l57-go'); const had = !!b && b.getBoundingClientRect().height >= 40; if (b) b.click(); await new Promise(r => setTimeout(r, 200));
    return { had, open: document.getElementById('sheet').classList.contains('open'), cur: L57.current(), on: document.getElementById('l57').classList.contains('on') }; });
  ok(s.had && !s.open && s.on && s.cur === 'The Stormlight Archive', 'a book\'s series line has "Series page ›", which opens the series page in place of the sheet: ' + JSON.stringify(s));
  s = await R(async () => { L57.close(); document.getElementById('btn-series').click(); await new Promise(r => setTimeout(r, 400)); const i = ORDERS.series.indexOf('The Stormlight Archive'); switchToTab(i, 'The Stormlight Archive'); await new Promise(r => setTimeout(r, 300));
    const b = document.querySelector('#sec-' + i + ' .genre-title .l57-go'); const had = !!b; if (b) b.click(); await new Promise(r => setTimeout(r, 200)); return { had, cur: L57.current() }; });
  ok(s.had && s.cur === 'The Stormlight Archive', 'the Series view has "Series page ›" on each series: ' + JSON.stringify(s));
  // a book opened from the page, and back
  s = await R(async () => { L57.open('The Stormlight Archive'); const row = document.querySelector('#l57 [data-l57book]'); row.click(); await new Promise(r => setTimeout(r, 250)); const a = { sheet: document.getElementById('sheet').classList.contains('open'), title: sheetTitle, on: document.getElementById('l57').classList.contains('on') };
    closeSheet(); await new Promise(r => setTimeout(r, 250)); a.back = document.getElementById('l57').classList.contains('on') && L57.current() === 'The Stormlight Archive'; return a; });
  ok(s.sheet && /^The Way of Kings/.test(s.title) && !s.on && s.back, 'tapping a book opens its page; closing it comes back to the series page: ' + JSON.stringify(s));
  s = await R(async () => { document.querySelector('#l57 [data-l57=where]').click(); await new Promise(r => setTimeout(r, 250)); const t = sheetTitle; closeSheet(); await new Promise(r => setTimeout(r, 250)); return t; });
  ok(/^The Way of Kings/.test(s || ''), '"Change where you are" opens the book he is on, where status and progress are set: ' + s);
  // ---- Add the missing ----
  s = await R(async () => { L57.open('The Stormlight Archive'); document.querySelector('#l57 [data-l57=add]').click(); await new Promise(r => setTimeout(r, 300)); const t = 'Elsecaller and King Lopen the First of Alethkar'; const o = getOverride('want:' + t);
    return { row: o.t === t && o.s === 'The Stormlight Archive' && /^\d{4}-\d\d-\d\d$/.test(o.at), inLib: ALL_TITLES.indexOf(t) >= 0, st: getStatus(t), want: statusList('To-Read').indexOf(t) >= 0, lib: document.querySelector('#l57 .l57-lib b').textContent, add: !!document.querySelector('#l57 .l57-add'), again: L57.wants() }; });
  ok(s.row && s.inLib && s.st === 'to-read' && s.want, 'Add the missing writes a want: row to his Sheet and the book shows on Want to Read: ' + JSON.stringify(s));
  ok(s.lib === 'All 5 books, 3 of 3 extras' && !s.add && s.again === 0, 'the page then counts it as in the library, with nothing left to add, and it is only added once: ' + s.lib);
  // ---- closing ----
  s = await R(async () => { await page_key(); return null; async function page_key() {} });
  await page.keyboard.press('Escape'); await page.waitForTimeout(100); s = await R(() => document.getElementById('l57').classList.contains('on'));
  ok(!s, 'Escape closes the page');
  s = await R(async () => { L57.open('Mistborn'); document.querySelector('#l57 [data-l57=close]').click(); await new Promise(r => setTimeout(r, 100)); return { on: document.getElementById('l57').classList.contains('on'), lock: document.documentElement.classList.contains('l57-lock') }; });
  ok(!s.on && !s.lock, '✕ closes it and the app scrolls again');
  // a series with no details of its own still gets a page
  s = await R(() => { const s = Object.keys(SERIES_PLAN).find(k => !L57.INFO[k] && seriesEntries(k).some(e => ALL_TITLES.includes(e))); const ok2 = L57.open(s); const h = document.getElementById('l57'); const r = { s, ok2, cls: h.className, head: h.querySelector('.l57-card b').textContent }; L57.close(); return r; });
  ok(s.ok2 && /f-barlow/.test(s.cls) && s.head, 'a series without its own look gets the standard one: ' + s.s);
  ok(errs.length === 0, 'no page errors: ' + errs.slice(0, 3).join(' | '));
  console.log(pass + ' passed, ' + fail + ' failed'); await br.close(); srv.close(); process.exit(fail ? 1 : 0); })();

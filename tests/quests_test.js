const { chromium } = require('playwright'); const http = require('http'), fs = require('fs'), path = require('path');
const ROOT = process.env.ROOT || '/home/claude/book-den'; const MIME = { '.html': 'text/html', '.js': 'application/javascript', '.json': 'application/json', '.png': 'image/png', '.jpg': 'image/jpeg', '.woff2': 'font/woff2', '.gif': 'image/gif' };
const srv = http.createServer((req, res) => { let p = decodeURIComponent(req.url.split('?')[0]); if (p === '/') p = '/index.html'; fs.readFile(path.join(ROOT, p), (e, d) => { if (e) { res.writeHead(404); return res.end(); } res.writeHead(200, { 'Content-Type': MIME[path.extname(p)] || 'application/octet-stream' }); res.end(d); }); });
const store = fs.readFileSync(path.join(__dirname, 'store.json')); let pass = 0, fail = 0; const ok = (c, m) => { if (c) pass++; else { fail++; console.log('FAIL', m); } };
(async () => { await new Promise(r => srv.listen(8798, r)); const br = await chromium.launch(); const ctx = await br.newContext({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true });
  await ctx.route(u => !/^http:\/\/localhost/.test(u.href), r => r.abort()); await ctx.route(/script\.google\.com/, r => r.fulfill({ status: 200, contentType: 'application/json', body: store }));
  const page = await ctx.newPage(); const errs = []; page.on('pageerror', e => errs.push(String(e)));
  await page.addInitScript(() => { window.__toasts = []; const iv = setInterval(() => { if (typeof toast === 'function' && !toast.__w) { const _t = toast; toast = function (m) { window.__toasts.push(String(m)); return _t.apply(this, arguments); }; toast.__w = 1; clearInterval(iv); } }, 20); });
  await page.goto('http://localhost:8798/'); await page.waitForTimeout(7200);
  ok(await page.evaluate(() => !window.__toasts.some(t => /Quest cleared|Bookmark earned/.test(t))), 'no quest or bookmark toast at first run');
  // the stub applies a batch of listening statuses the first time Books opens; do that first so later counts are stable
  await page.evaluate(() => { switchLib('books'); }); await page.waitForTimeout(1500); await page.evaluate(() => { switchLib('life'); }); await page.waitForTimeout(1500);
  ok(await page.evaluate(() => getOverride('quests').init === 1 && getOverride('bmk').init === 1), 'first run recorded quietly');
  ok(await page.evaluate(() => { const c = document.querySelector('.l37-sec:not(.l37-bs)'); return !!c && c.querySelectorAll('.l37-q').length === 3 && ['p-book', 'p-steel', 'p-life'].every(k => c.querySelector('.' + k)) && /Quest log/.test(c.textContent) && /Bookmarks \d+ \/ \d+/.test(c.textContent); }), 'Home card: one quest per pillar, two buttons');
  ok(await page.evaluate(() => { const s = document.querySelector('.d-now'); const c = document.querySelector('.l37-sec:not(.l37-bs)'); return !!s && !!(s.compareDocumentPosition(c) & 4); }), 'card sits under the now-reading card');
  ok(await page.evaluate(() => L37.target('2026-11-10') === 180 && L37.target('2026-11-14') === 390 && L37.target('2026-11-15') === 390 && L37.target('2026-11-24') === 300 && L37.target('2026-12-05') === 120), 'targets follow his push plan: 3 h weekdays, 6 h 30 weekend days, 5 h Nov 23 to 27, 2 h after');
  await page.evaluate(() => { window.MF = ALL_TITLES.find(t => /^A Court of Mist and Fury/.test(t)); setOverride(MF, { status: 'currently-reading', tm: Date.now() + 9e5 }); L35.log(MF, { min: 60, sp: 2 }); }); await page.waitForTimeout(900);
  ok(await page.evaluate(() => { const q = L37.list().find(q => q.id === 'read'); return q.cur === 60 && !q.done && /1 h of /.test(q.show); }), 'timer minutes count toward the reading quest');
  ok(await page.evaluate(() => (getOverride('log').items || []).filter(i => i.d === L35.today() && i.k === 'reading').length === 1), 'a timed session lights Read in the habit log, once');
  await page.evaluate(() => { L35.log(MF, { min: 400, sp: 2 }); }); await page.waitForTimeout(900);
  ok(await page.evaluate(() => { const q = L37.list().find(q => q.id === 'read'); const c = getOverride('quests').c || {}; return q.done && !!c['read@' + L35.today()] && (getOverride('log').items || []).filter(i => i.d === L35.today() && i.k === 'reading').length === 1; }), 'reading quest clears and is recorded for today');
  ok(await page.evaluate(() => window.__toasts.some(t => /Quest cleared · Read or listen/.test(t))), 'toast on clear');
  const n0 = await page.evaluate(() => L37.cleared());
  await page.evaluate(() => { L37.sync(); L37.sync(); }); ok(await page.evaluate(n => L37.cleared() === n, n0), 'a cleared quest is counted once');
  // Life: one tap from the Home card
  ok(await page.evaluate(() => { const b = document.querySelector('.l37-sec:not(.l37-bs) .l37-q .p-life').closest('.l37-q'); return /Walk thirty minutes/.test(b.textContent) && b.dataset.l37 === 'tap'; }), 'Home shows the walk as the Life quest');
  await page.evaluate(() => document.querySelector('.l37-sec:not(.l37-bs) .l37-q .p-life').closest('.l37-q').click()); await page.waitForTimeout(700);
  ok(await page.evaluate(() => (getOverride('log').items || []).some(i => i.d === L35.today() && i.k === 'walk') && L37.list().find(q => q.id === 'walk').done), 'tap logs the walk in the habit log and clears the quest');
  ok(await page.evaluate(() => /Hit your protein goal/.test(document.querySelector('.l37-sec:not(.l37-bs) .l37-q .p-life').closest('.l37-q').textContent)), 'Home card moves on to the next Life quest');
  await page.evaluate(() => L37.open('log')); await page.waitForTimeout(300);
  const R = sel => page.evaluate(sel => { const r = document.getElementById('l37').shadowRoot; return r.querySelector(sel) ? r.querySelector(sel).textContent : null; }, sel);
  ok(/Quest log/.test(await R('.top b')) && /Today/.test(await R('.body')) && /This week/.test(await R('.body')) && /Quest lines/.test(await R('.body')), 'quest log groups: Today, This week, Quest lines');
  ok(/Friendsgiving Push/.test(await R('.body')) && /of 8 books · \d+ days? left/.test(await R('.body')), 'Friendsgiving Push line with days left');
  await page.evaluate(() => { const r = document.getElementById('l37').shadowRoot; [...r.querySelectorAll('.l37-q')].find(b => /Stretch tonight/.test(b.textContent)).click(); }); await page.waitForTimeout(400);
  ok(await page.evaluate(() => L37.list().find(q => q.id === 'stretch').done && /Done/.test([...document.getElementById('l37').shadowRoot.querySelectorAll('.l37-q')].find(b => /Stretch tonight/.test(b.textContent)).textContent)), 'stretch taps done inside the sheet');
  await page.evaluate(() => { const r = document.getElementById('l37').shadowRoot; [...r.querySelectorAll('.l37-q')].find(b => /Stretch tonight/.test(b.textContent)).click(); }); await page.waitForTimeout(400);
  ok(await page.evaluate(() => !L37.list().find(q => q.id === 'stretch').done), 'stretch can be untapped');
  await page.evaluate(() => { const r = document.getElementById('l37').shadowRoot; r.querySelector('[data-a=tab][data-k=steel]').click(); }); await page.waitForTimeout(200);
  ok(await page.evaluate(() => { const r = document.getElementById('l37').shadowRoot; const rows = [...r.querySelectorAll('.l37-q')]; return rows.length >= 3 && rows.every(b => b.querySelector('.p-steel')); }), 'Steel tab filters');
  ok(await page.evaluate(() => { const r = document.getElementById('l37').shadowRoot; const s = r.querySelector('[data-a=tab][data-k=steel] small').textContent; const Q = L37.list().filter(q => q.p === 'steel'); return s === Q.filter(q => !q.info && q.done).length + '/' + Q.filter(q => !q.info).length && (Q.some(q => q.info) || Q.some(q => q.id === 'lift')); }), 'the next-lift pointer (or, on a lift day, the lift itself) is shown, and the pointer is not counted as a quest');
  await page.evaluate(() => { const r = document.getElementById('l37').shadowRoot; r.querySelector('[data-a=tab][data-k=book]').click(); }); await page.waitForTimeout(200);
  await page.evaluate(() => { const r = document.getElementById('l37').shadowRoot; r.querySelector('[data-a=tg][data-k="120"]').click(); }); await page.waitForTimeout(300);
  ok(await page.evaluate(() => L37.target() === 120 && /Read or listen for 2 h/.test(document.getElementById('l37').shadowRoot.querySelector('.body').textContent) && /Set by you: 2 h a day/.test(document.getElementById('l37').shadowRoot.querySelector('.body').textContent)), 'he can set his own daily target');
  await page.evaluate(() => { const r = document.getElementById('l37').shadowRoot; r.querySelector('[data-a=tg][data-k="0"]').click(); }); await page.waitForTimeout(300);
  ok(await page.evaluate(() => L37.target('2026-11-10') === 180 && !getOverride('quests').rt), 'Plan puts the push plan back');
  // Steel
  await page.evaluate(() => { L37.close(); C2.logSteel(45); }); await page.waitForTimeout(900);
  ok(await page.evaluate(() => { const Q = L37.list(); const l = Q.find(q => q.id === 'lift'); const w = Q.find(q => q.id === 'week3'); return l && l.done && /Session logged/.test(l.show) && w.cur >= 1 && /XP to /.test(w.reward); }), 'a logged session clears Lift today and counts toward three this week');
  // finishing a book
  const b0 = await page.evaluate(() => L37.bookmarks().filter(b => b.got).length);
  await page.evaluate(() => { window.__toasts.length = 0; setOverride(MF, { status: 'read', finished: L35.today() }); try { L29.flush(); } catch (e) {} }); await page.waitForTimeout(1100);
  ok(await page.evaluate(() => { const q = L37.list().find(q => q.id === 'fin:acomaf'); const p = L37.list().find(q => q.id === 'push'); return q && q.done && /Finished/.test(q.show) && p.cur >= 1 && !!(getOverride('quests').c || {})['fin:acomaf@once']; }), 'finishing the book clears its quest line and moves the push');
  ok(await page.evaluate(b0 => { const B = L37.bookmarks(); const m = B.find(b => b.id === 'bk:acomaf'); return m.got && m.at === L35.today() && B.filter(b => b.got).length > b0; }, b0), 'its bookmark is earned and dated');
  ok(await page.evaluate(() => window.__toasts.some(t => /Bookmark earned/.test(t))), 'toast on a new bookmark');
  await page.evaluate(() => { L35.addNote('jr:s:acotar', { t: MF, k: 'theory', tx: 'Test theory' }); document.dispatchEvent(new CustomEvent('l35log', { detail: { t: MF, note: 1 } })); }); await page.waitForTimeout(900);
  ok(await page.evaluate(() => L37.list().find(q => q.id === 'jot').done && L37.bookmarks().find(b => b.id === 'jot1').got), 'a journal entry clears the weekly jot and earns the first journal bookmark');
  // bookmarks sheet
  await page.evaluate(() => L37.open('marks')); await page.waitForTimeout(300);
  ok(await page.evaluate(() => { const r = document.getElementById('l37').shadowRoot; const B = L37.bookmarks(); return r.querySelectorAll('.cell').length === B.length && r.querySelectorAll('button.cell').length === B.filter(b => b.got).length && /Stormlight/.test(r.querySelector('.body').textContent) && /Milestones/.test(r.querySelector('.body').textContent); }), 'bookmark sheet lists every bookmark; earned ones are tappable');
  ok(await page.evaluate(() => { const r = document.getElementById('l37').shadowRoot; return !!r.querySelector('.l37-bm.bk.sk-night:not(.lk)') && !!r.querySelector('.l37-bm.bk.sk-glass') && !!r.querySelector('.l37-bm.bk.sk-storm.lk') && getComputedStyle(r.querySelector('.l37-bm.bk.sk-night:not(.lk)'), '::before').backgroundImage.indexOf('radial-gradient') >= 0; }), 'book bookmarks wear their series (stars, glass, storm) and locked ones are plain');
  ok(await page.evaluate(() => { const r = document.getElementById('l37').shadowRoot; const lk = [...r.querySelectorAll('div.cell')]; return lk.length > 0 && lk.every(c => !/Earned/.test(c.textContent)); }), 'locked bookmarks say what earns them');
  await page.evaluate(() => { const r = document.getElementById('l37').shadowRoot; r.querySelector('button.cell[data-k="bk:tog"]').click(); }); await page.waitForTimeout(300);
  ok(await page.evaluate(() => getOverride('bmk').use === 'bk:tog' && /In your book/.test(document.getElementById('l37').shadowRoot.querySelector('.cell.use').textContent)), 'tap keeps a bookmark in his book');
  await page.evaluate(() => { L37.close(); switchLib('life'); }); await page.waitForTimeout(1200);
  ok(await page.evaluate(() => { const h = document.querySelector('.d-now .d-nc .l37-hang'); return !!h && h.getAttribute('title') === 'Throne of Glass' && h.getBoundingClientRect().height > 40; }), 'the kept bookmark hangs on the Home cover');
  await page.evaluate(() => { L37.use('bk:tog'); }); await page.waitForTimeout(200);
  ok(await page.evaluate(() => getOverride('bmk').use === 'none' && !document.querySelector('.l37-hang')), 'tapping it again takes it out');
  await page.evaluate(() => switchLib('books')); await page.waitForTimeout(1300);
  ok(await page.evaluate(() => { const s = document.querySelector('.l37-bs'); return !!s && /Den bookmarks/.test(s.textContent) && s.querySelectorAll('.l37-bm').length >= 5 && !!document.querySelector('.bm-sec'); }), 'Books tab: Den bookmarks strip beside the Goodreads monthly ones');
  await page.evaluate(() => document.querySelector('.l37-bs .l37-f button').click()); await page.waitForTimeout(300);
  ok(await page.evaluate(() => document.getElementById('l37').classList.contains('on') && /Den bookmarks/.test(document.getElementById('l37').shadowRoot.querySelector('.top b').textContent)), 'See them all opens the sheet');
  // nothing sealed leaks: the sheet only names books, never entry text
  ok(await page.evaluate(() => { const txt = document.getElementById('l37').shadowRoot.querySelector('.body').textContent; return !/Radiant|Odium|Lashing|Hoid|Nightsister|Cauldron/.test(txt); }), 'bookmark sheet carries no lore text');
  // tap targets
  ok(await page.evaluate(() => { const r = document.getElementById('l37').shadowRoot; const x = r.querySelector('.top button').getBoundingClientRect(); return x.width >= 44 && x.height >= 44; }), 'close button is 44 px');
  await page.evaluate(() => { L37.close(); switchLib('life'); }); await page.waitForTimeout(1000);
  ok(await page.evaluate(() => [...document.querySelectorAll('.l37-sec:not(.l37-bs) .l37-q, .l37-sec:not(.l37-bs) .l37-f button')].every(b => b.getBoundingClientRect().height >= 44)), 'Home rows and buttons are at least 44 px tall');
  ok(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth + 1), 'no sideways scroll on Home');
  console.log(pass + ' passed, ' + fail + ' failed', JSON.stringify(errs.slice(0, 5))); await br.close(); srv.close(); process.exit(fail ? 1 : 0); })();

// L48: life arcs in the quest log — Tattoo week, Thanksgiving trip, Friendsgiving Push, Year end, and his own.
const { chromium } = require('playwright'); const http = require('http'), fs = require('fs'), path = require('path');
const ROOT = process.env.ROOT || '/home/claude/book-den'; const MIME = { '.html': 'text/html', '.js': 'application/javascript', '.json': 'application/json' };
const srv = http.createServer((req, res) => { let p = decodeURIComponent(req.url.split('?')[0]); if (p === '/') p = '/index.html'; fs.readFile(path.join(ROOT, p), (e, d) => { if (e) { res.writeHead(404); return res.end(); } res.writeHead(200, { 'Content-Type': MIME[path.extname(p)] || 'application/octet-stream' }); res.end(d); }); });
const store = fs.readFileSync(path.join(__dirname, 'store.json')); let pass = 0, fail = 0; const ok = (c, m) => { if (c) pass++; else { fail++; console.log('FAIL', m); } };
(async () => { await new Promise(r => srv.listen(8846, r)); const br = await chromium.launch(); const ctx = await br.newContext({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true });
  await ctx.route(u => !/^http:\/\/localhost/.test(u.href), r => r.abort()); await ctx.route(/script\.google\.com/, r => r.fulfill({ status: 200, contentType: 'application/json', body: store }));
  // the clock is set to Wed Nov 11 2026, 3 pm, so the dates read as they do for him today
  await ctx.addInitScript(() => { const T = new Date('2026-11-11T15:00:00').getTime(); const D0 = Date; const off = T - D0.now(); class D extends D0 { constructor(...a) { if (!a.length) super(D0.now() + off); else super(...a); } static now() { return D0.now() + off; } } window.Date = D; });
  const page = await ctx.newPage(); const errs = []; page.on('pageerror', e => errs.push(String(e))); await page.goto('http://localhost:8846/'); await page.waitForTimeout(6500); const R = (f, a) => page.evaluate(f, a);
  const sh = () => R(() => { const r = document.getElementById('l37').shadowRoot; const b = r.querySelector('.body'); return { title: r.querySelector('.top b').textContent, txt: b.innerText, arcs: [...b.querySelectorAll('.arc')].map(a => ({ k: a.dataset.k, dt: a.querySelector('.dt').innerText.replace(/\n/g, ' '), sub: a.querySelector('.tx span').textContent, next: (a.querySelector('em') || {}).textContent || '' })), tabsAfter: !!b.querySelector('.arcs ~ .tabs, h3 ~ .tabs') }; });
  const click = sel => R(s => document.getElementById('l37').shadowRoot.querySelector(s).click(), sel);
  await R(() => L37.open('log')); await page.waitForTimeout(300); let s = await sh();
  ok(s.arcs.length === 4 && s.arcs.map(a => a.k).join() === 'tattoo,trip,push,yearend', 'four arcs above the quest tabs: ' + s.arcs.map(a => a.k).join());
  ok(s.tabsAfter, 'the arcs come before the tabs');
  const A = k => s.arcs.find(a => a.k === k);
  ok(/NOV 14 3 days/.test(A('tattoo').dt) && /Nov 12–17/.test(A('tattoo').sub) && /0 of 5/.test(A('tattoo').sub) && /Thursday: Fortress/.test(A('tattoo').next), 'Tattoo week: Nov 14 in 3 days, 0 of 5, next Thursday: Fortress: ' + JSON.stringify(A('tattoo')));
  ok(/NOV 26 15 days/.test(A('trip').dt) && /0 of 5/.test(A('trip').sub) && /Flights: home → Boston → Las Vegas → home/.test(A('trip').next), 'Thanksgiving trip: Nov 26 in 15 days, next the flights');
  ok(/NOV 27 16 days/.test(A('push').dt) && /^8 books in your order · \d+ h \d\d m left at 2x, \d+ h( \d\d m)? in your plan$/.test(A('push').sub) && /^A Court of Mist and Fury · 3 h today$/.test(A('push').next), 'Friendsgiving Push: 8 books, hours left and planned, next ACOMAF 3 h today: ' + JSON.stringify(A('push')));
  ok(/DEC 31 50 days/.test(A('yearend').dt) && /280 h of listening · 0 of 6/.test(A('yearend').sub) && /^Cosmere ladder · /.test(A('yearend').next), 'Year end: Dec 31 in 50 days, 0 of 6, next on the Cosmere ladder: ' + JSON.stringify(A('yearend')));
  // the push opened
  await click('.arc[data-k=push]'); await page.waitForTimeout(200); s = await sh();
  const pace = await R(() => L48.pace()); const pace6 = await R(() => L48.pace(6));
  ok(s.title === 'Arc' && /Friendsgiving Push/.test(s.txt) && /NOV 27 · 16 DAYS/i.test(s.txt), 'the push opens on its own page');
  ok(pace.listen > 0 && pace.book === pace.listen * 2 - (pace.book % 2) || Math.abs(pace.book - pace.listen * 2) <= 8, 'listening left is book time at 2x: ' + JSON.stringify(pace));
  ok(pace.plan >= 70 * 60 && pace.plan <= 80 * 60, 'the plan from Nov 11 to Nov 27 is about 75 h (3 h weekdays, 13 h weekends, 5 h Nov 23–27): ' + (pace.plan / 60).toFixed(1));
  ok(new RegExp((pace.gap >= 0 ? 'to spare' : 'short')).test(s.txt) && /Stopping after House of Sky and Breath/.test(s.txt) && pace6.listen < pace.listen, 'the pace box says short or spare, and what stopping after book 6 does');
  const rows = await R(() => [...document.getElementById('l37').shadowRoot.querySelectorAll('.body .l37-q[data-a=arcstep]')].map(r => r.innerText.replace(/\n/g, ' | ')));
  ok(rows.length === 8 && /A Court of Mist and Fury \| 19 h 35 m in Audible/.test(rows[0]) && /now/i.test(rows[0]) && /House of Flame and Shadow/.test(rows[6]) && /A Court of Splintered Harmony/.test(rows[7]), 'the eight books in his order with their lengths, the current one marked Now: ' + rows[0]);
  ok(/Today: 3 h/.test(s.txt) && /This weekend: 13 h/.test(s.txt) && /Sat Nov 14 and Sun Nov 15/.test(s.txt) && /Nov 23–27: 5 h a day/.test(s.txt), 'the hours: today, this weekend, Thanksgiving week');
  await click('[data-a=arcstop][data-k="6"]'); await page.waitForTimeout(200);
  const six = await R(() => { const q = L37.list(); const x = (Array.isArray(q) ? q : Object.values(q).flat()).find(y => y && y.id === 'push'); return { stop: L48.pushStop(), rows: document.getElementById('l37').shadowRoot.querySelectorAll('.body .l37-q[data-a=arcstep]').length, q: x && x.show }; });
  ok(six.stop === 6 && six.rows === 6 && /of 6 books/.test(six.q || ''), 'stopping after book 6 changes the arc and the push quest: ' + JSON.stringify(six));
  await click('[data-a=arcstop][data-k="8"]'); await page.waitForTimeout(100);
  // tattoo week: a Steel session on Thursday ticks the first step; the tattoo is tapped
  await click('[data-a=arcback]'); await page.waitForTimeout(100); await click('.arc[data-k=tattoo]'); await page.waitForTimeout(100);
  await R(() => { const s = getOverride('steelx').sessions || []; setOverride('steelx', { sessions: s.concat([{ date: '2026-11-12', day: 'thu', min: 60 }]) }); });
  await R(() => { const r = document.getElementById('l37').shadowRoot; r.querySelector('.body .back').click(); }); await page.waitForTimeout(100); await click('.arc[data-k=tattoo]'); await page.waitForTimeout(100);
  let tw = await R(() => [...document.getElementById('l37').shadowRoot.querySelectorAll('.body .l37-q[data-a=arcstep]')].map(r => [r.classList.contains('done'), r.innerText.replace(/\n/g, ' | ')]));
  ok(tw.length === 5 && tw[0][0] && /from your log/.test(tw[0][1]) && !tw[2][0], 'the Thursday lift ticks itself from the Steel log: ' + JSON.stringify(tw.map(x => x[0])));
  await R(() => document.getElementById('l37').shadowRoot.querySelectorAll('.body .l37-q[data-a=arcstep]')[2].click()); await page.waitForTimeout(100);
  tw = await R(() => [...document.getElementById('l37').shadowRoot.querySelectorAll('.body .l37-q[data-a=arcstep]')].map(r => r.classList.contains('done')));
  const st1 = await R(() => (getOverride('arcs').done || {}).tattoo); ok(tw[2] && st1 && st1.tattoo === '2026-11-11', 'tapping the tattoo step marks it done with the day: ' + JSON.stringify(st1));
  await R(() => document.getElementById('l37').shadowRoot.querySelectorAll('.body .l37-q[data-a=arcstep]')[2].click()); await page.waitForTimeout(100);
  ok(!(await R(() => ((getOverride('arcs').done || {}).tattoo || {}).tattoo)), 'tapping it again undoes it');
  // all steps done closes the arc
  await R(() => { setOverride('arcs', { done: { tattoo: { tattoo: '2026-11-14', rest: '2026-11-16' } } }); const s = getOverride('steelx').sessions || []; setOverride('steelx', { sessions: s.concat([{ date: '2026-11-14', day: 'sat', min: 60 }, { date: '2026-11-17', day: 'tue', min: 60 }]) }); });
  await R(() => { L37.open('log'); }); await page.waitForTimeout(200); s = await sh();
  const cl = await R(() => (getOverride('arcs').closed || {}).tattoo); ok(cl === '2026-11-11' && s.arcs.find(a => a.k === 'tattoo') && /Finished arcs/i.test(s.txt) && /Closed Nov 11/i.test(s.arcs.find(a => a.k === 'tattoo').dt), 'an arc with every step done closes and moves to finished arcs: ' + cl);
  // his own arc
  await click('[data-a=arcnew]'); await page.waitForTimeout(100);
  await R(() => { const r = document.getElementById('l37').shadowRoot; r.querySelector('[data-arc=name]').value = 'Move into the new place'; r.querySelector('[data-arc=to]').value = '2026-12-20'; r.querySelector('[data-a=arcsave]').click(); }); await page.waitForTimeout(200);
  await R(() => { const r = document.getElementById('l37').shadowRoot; r.querySelector('[data-arc=step]').value = 'Sign the lease'; r.querySelector('[data-a=arcadd]').click(); }); await page.waitForTimeout(150);
  const own = await R(() => ({ own: getOverride('arcs').own, rows: [...document.getElementById('l37').shadowRoot.querySelectorAll('.body .l37-q[data-a=arcstep]')].map(r => r.innerText) }));
  ok(own.own && own.own.length === 1 && own.own[0].name === 'Move into the new place' && own.own[0].steps.length === 1 && own.rows.length === 1 && /Sign the lease/.test(own.rows[0]), 'he can make his own arc and add steps: ' + JSON.stringify(own.own));
  await R(() => document.getElementById('l37').shadowRoot.querySelector('[data-a=arcdel]').click()); await page.waitForTimeout(100);
  ok(!(await R(() => (getOverride('arcs').own || []).length)), 'and remove it');
  // year end: 280 h counts listening since Oct 16
  const hrs = await R(() => L48.hours()); ok(hrs >= 0, 'listening since Oct 16 is counted: ' + (hrs / 60).toFixed(1) + ' h');
  ok(!errs.length, 'no page errors: ' + errs.slice(0, 3).join(' | '));
  console.log(pass + ' passed, ' + fail + ' failed'); await br.close(); srv.close(); process.exit(fail ? 1 : 0); })();

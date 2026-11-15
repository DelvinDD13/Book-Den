// L58 releases drop in: a game that is out goes into the backlog and a film onto the watch list with no tap; a book that is out
// becomes a book to get in its series order and on its series page, and one that comes out in 2027 takes an open spot of the 2027
// plan from its month on; a date only counts when the list was checked within 14 days before it; he can keep one out and let it
// back in; and the 2027 plan's watch list and each series page's "still to come" come from the same list.
const { chromium } = require('playwright'); const http = require('http'), fs = require('fs'), path = require('path');
const ROOT = process.env.ROOT || '/home/claude/book-den';
const MIME = { '.html': 'text/html', '.js': 'application/javascript', '.json': 'application/json', '.png': 'image/png', '.jpg': 'image/jpeg', '.woff2': 'font/woff2' };
const srv = http.createServer((req, res) => { let p = decodeURIComponent(req.url.split('?')[0]); if (p === '/') p = '/index.html'; if (p === '/upcoming.json') p = '/tests/upcoming_fixture.json'; fs.readFile(path.join(ROOT, p), (e, d) => { if (e) { res.writeHead(404); return res.end(); } res.writeHead(200, { 'Content-Type': MIME[path.extname(p)] || 'application/octet-stream' }); res.end(d); }); });
const store = fs.readFileSync(path.join(__dirname, 'store.json')); let pass = 0, fail = 0; const ok = (c, m) => { if (c) pass++; else { fail++; console.log('FAIL', m); } };
const PNG = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==', 'base64');
const PORT = 8876; const ALL = [];
async function boot(br, when, edit) { const ctx = await br.newContext({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true });
  await ctx.route(u => !/^http:\/\/localhost/.test(u.href), r => r.request().resourceType() === 'image' ? r.fulfill({ status: 200, contentType: 'image/png', body: PNG }) : r.abort());
  await ctx.route(/script\.google\.com/, r => r.fulfill({ status: 200, contentType: 'application/json', body: store }));
  if (edit) await ctx.route(/\/upcoming\.json/, r => { const d = JSON.parse(fs.readFileSync(path.join(ROOT, 'tests', 'upcoming_fixture.json'), 'utf8')); edit(d); r.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(d) }); });
  await ctx.addInitScript(w => { const T = new Date(w).getTime(); const D0 = Date; const off = T - D0.now(); class D extends D0 { constructor(...a) { if (!a.length) super(D0.now() + off); else super(...a); } static now() { return D0.now() + off; } } window.Date = D; }, when);
  const page = await ctx.newPage(); const errs = []; page.on('pageerror', e => { errs.push(String(e)); ALL.push(String(e)); });
  await page.goto('http://localhost:' + PORT + '/'); await page.waitForTimeout(7500); return { ctx, page, errs, R: (f, a) => page.evaluate(f, a) }; }
const book = (d, t) => d.books.find(x => x.title === t), game = (d, t) => d.games.find(x => x.title === t);
(async () => { await new Promise(r => srv.listen(PORT, r)); const br = await chromium.launch();
  // ================= today, Nov 14 2026, the list as it stands =================
  let { ctx, page, R } = await boot(br, '2026-11-14T15:00:00'); let s;
  s = await R(() => ({ ready: L58.ready(), dg: L58.dropped('games').map(x => x.title), G: GAMES.filter(g => g.up === 2).map(g => [g.t, g.p, g.note, gStatus(g)].join('|')), up: L19.ordered('games').map(x => x.title), cv: /^https:/.test(getOverride('cv:game:Brigandine: Abyss').url || '') }));
  ok(s.ready && s.dg.join() === 'Final Fantasy Resonance,Brigandine: Abyss', 'the two games the list marks released are out: ' + s.dg.join());
  ok(s.G.join(' || ') === 'Final Fantasy Resonance|PS5 / Switch / Switch 2|Out Oct 22|backlog || Brigandine: Abyss|PS5 / Switch 2|Out Aug 27|backlog', 'they are in the backlog with their platforms and the day they came out: ' + s.G.join(' || '));
  ok(s.up.indexOf('Brigandine: Abyss') < 0 && s.up.indexOf('Final Fantasy Resonance') < 0 && s.up.length === 10, 'and they have left the Upcoming row: ' + s.up.length);
  ok(s.up[0] === 'The Hunger Games: Sunrise on the Reaping' && s.up.indexOf('Dragon Quest Monsters: The Withered World') > 0 && s.cv, 'what is not out yet stays in Upcoming, and a dropped game keeps its picture');
  await R(() => switchLib('screen')); await page.waitForTimeout(1500);
  ok(await R(() => { const t = document.querySelector('#lib-other').textContent; return /Brigandine: Abyss/.test(t) && /Final Fantasy Resonance/.test(t); }), 'both show in the Games grid');
  s = await R(() => ({ folk: SERIES_PLAN['The Folk of the Air'].filter(e => /Conspiracy/.test(e)), row: L57.data('The Folk of the Air').R.filter(r => /Conspiracy/.test(r.title)).map(r => [r.gap, r.extra, r.note, !!r.t].join('|')), upb: L19.ordered('books').slice(0, 2).map(x => x.title), acPlan: SERIES_PLAN['A Court of Thorns and Roses'].length }));
  ok(s.folk.join() === '+|A Conspiracy of Charming Monsters|2026' && s.row.join() === '1|true|Out Nov 3|false', 'a story collection that is out joins its series as a side book to get: ' + JSON.stringify(s));
  ok(s.upb.join() === 'A Conspiracy of Charming Monsters,A Married Little Christmas' && s.acPlan === 6, 'a book that is out stays in the Upcoming row until he has it; a book he owns changes nothing');
  await R(() => { switchLib('books'); const i = L19.ordered('books').findIndex(x => /Conspiracy/.test(x.title)); openSheet('up:books:' + i); }); await page.waitForTimeout(500);
  s = await R(() => { const b = document.querySelector('#sheet .sheet-body'); return { btn: [...b.querySelectorAll('.l41 button')].map(x => x.textContent), into: (b.querySelector('.l58-in') || {}).textContent, h: [...b.querySelectorAll('.l41 button')].every(x => x.getBoundingClientRect().height >= 44) }; });
  ok(s.btn.join('|') === 'I own it on Audible|I own it on Kindle or paper|Keep it out of my plans' && s.into === 'It has dropped into its series page (The Folk of the Air).' && s.h, 'its Upcoming page says where it went and offers to keep it out: ' + JSON.stringify(s));
  await R(() => closeSheet());
  // the 2027 plan before the year starts
  s = await R(() => { const S = L56.slots(); const a = S.find(x => /Forgotten Melody/.test(x.name)); return { n: S.length, drops: S.filter(x => x.drop).length, a: a && [a.m, a.open || 0, a.min, a.note, a.t].join('|'), get: S.filter(x => !x.open && !x.t).length, watch: L56.watch().map(w => w.name + ' / ' + w.sub), sug: L56.suggest() }; });
  ok(s.n === 75 && s.drops === 0 && s.get === 11, 'the 2027 plan is still 75 with nothing dropped in yet: ' + JSON.stringify([s.n, s.drops, s.get]));
  ok(s.a === '1|0|1200|ACOTAR 7 · out Jan 12 · length is a guess|', 'ACOTAR 7 is in February under its title, A Court of Forgotten Melody: ' + s.a);
  ok(s.watch.join(' || ') === 'Seven and the Swift / Shield of Sparrows · Out Mar 9 · drops into March || Feels Like Falling / Abby Jimenez · Out Apr 20 · drops into April || The Heretics / The Devils · Out May 11 · drops into May || The Justice of One / Hierarchy · Expected 2027 · no day yet || Crescent City #4 / No date yet || The Empyrean #4 / No date yet || Dungeon Crawler Carl #9 / No date yet || Red God / Red Rising Saga · No date yet', 'the watch list comes from the upcoming list, with days: ' + s.watch.join(' || '));
  ok(s.sug.indexOf('The Heretics') < 0 && s.sug[0] === 'Golden Son' && s.sug.indexOf('Victorious') > 0, 'an empty spot never suggests a book that is not out yet: ' + s.sug.join());
  await R(() => { switchLib('life'); L37.open('log'); }); await page.waitForTimeout(500); await R(() => document.getElementById('l37').shadowRoot.querySelector('[data-a="arc"][data-k="y2027"]').click()); await page.waitForTimeout(500);
  s = await R(() => { const b = document.getElementById('l37').shadowRoot.querySelector('.body'); const i = [...b.querySelectorAll('h3')].findIndex(h => /New books to watch/.test(h.textContent)); const info = [...b.querySelectorAll('.l37-q.info')].map(x => x.textContent); return { txt: b.textContent, h: i >= 0 && b.querySelectorAll('h3')[i].textContent, info }; });
  ok(/New books to watch/.test(s.h) && /added when out/i.test(s.h) && s.info.length === 8 && /Seven and the Swift.*Out Mar 9 · drops into March/.test(s.info[0]), 'the plan page lists them under New books to watch: ' + s.h + ' / ' + s.info.length);
  ok(/takes an open spot from its month on the day it comes out; the release dates are checked every Monday/.test(s.txt) && !/New releases have taken/.test(s.txt), 'and says how they drop in');
  await R(() => L37.close());
  // series pages: what is still to come, with dates, and no line twice
  s = await R(() => { const up = n => { L57.open(n); const o = [...document.querySelectorAll('#l57 .l57-up .l57-row')].map(x => x.querySelector('b').textContent + ' / ' + x.querySelector('small').textContent); const rows = [...document.querySelectorAll('#l57 .l57-list:not(.l57-up) .l57-row')].map(x => x.querySelector('.tx i').textContent + ':' + x.querySelector('.tx b').textContent); L57.close(); return { o, rows }; };
    return { ac: up('A Court of Thorns and Roses'), dcc: up('Dungeon Crawler Carl').o, cc: up('Crescent City').o, emp: up('The Empyrean').o, rr: up('Red Rising Saga').o, hi: up('Hierarchy').o }; });
  ok(s.ac.o.join() === 'A Court of Forgotten Melody / Out Jan 12 2027' && s.ac.rows.slice(3).join() === 'Book 4:A Court of Frost and Starlight,Book 5:A Court of Silver Flames,Book 6:A Court of Splintered Harmony', 'ACOTAR: book 7 is still to come with its day, and the books carry the publisher\'s numbers (Splintered Harmony is book 6): ' + JSON.stringify(s.ac));
  ok(s.dcc.join(' || ') === 'Dungeon Crawler Carl #9 / No date yet || Book 10 / Planned' && s.cc.join() === 'Crescent City #4 / No date yet' && s.emp.join(' || ') === 'The Empyrean #4 / No date yet || Book 5 / Planned' && s.rr.join() === 'Red God / No date yet' && s.hi.join() === 'The Justice of One / 2027',
    'the other series list each coming book once (a placeholder line gives way to the list\'s entry): ' + JSON.stringify([s.dcc, s.cc, s.emp, s.rr, s.hi]));
  // a dropped game on two of his platforms: say which, or put it back
  await R(() => { switchLib('screen'); openSheet('game:Brigandine: Abyss'); }); await page.waitForTimeout(600);
  s = await R(() => { const b = [...document.querySelectorAll('#sheet .sheet-body .l58 button')]; const body = document.querySelector('#sheet .sheet-body').textContent; return { t: b.map(x => x.textContent), h: b.every(x => x.getBoundingClientRect().height >= 44), inf: (GMINFO['Brigandine: Abyss'] || []).slice(0, 2).join('|'), page: /Happinet \/ NIS America/.test(body) && /A hex-grid strategy RPG with six story campaigns/.test(body) && /Out Aug 27/.test(body) }; });
  ok(s.t.join('|') === 'I have it on PS5|I have it on Switch 2|Dropped in when it came out. Put it back in Upcoming' && s.h, 'its page asks which platform and offers the way back: ' + s.t.join('|'));
  ok(s.inf === '2026|Happinet / NIS America' && s.page, 'and keeps the year, the maker and the description it had in Upcoming: ' + s.inf);
  await R(() => document.querySelector('#sheet .l58 button[data-how=PS5]').click()); await page.waitForTimeout(900);
  s = await R(() => { const g = GAMES.filter(x => x.t === 'Brigandine: Abyss'); const b = document.querySelector('#sheet .sheet-body'); return { n: g.length, p: g[0] && g[0].p, up: g[0] && g[0].up, rec: ((getOverride('upown').v || {})['g:Brigandine: Abyss'] || {}).p, sheet: sheetTitle, l58: b.querySelectorAll('.l58').length, back: (b.querySelector('.l41-back button') || {}).textContent }; });
  ok(s.n === 1 && s.p === 'PS5' && s.up === 1 && s.rec === 'PS5' && s.sheet === 'game:Brigandine: Abyss' && s.l58 === 0 && /Came from Upcoming/.test(s.back || ''), 'picking PS5 makes it his on PS5, once, and saves it: ' + JSON.stringify(s));
  await R(() => closeSheet()); await R(() => openSheet('game:Final Fantasy Resonance')); await page.waitForTimeout(500);
  await R(() => document.querySelector('#sheet .l58 button[data-l58=off]').click()); await page.waitForTimeout(8600);
  s = await R(() => ({ g: GAMES.some(x => x.t === 'Final Fantasy Resonance'), up: L19.ordered('games').some(x => x.title === 'Final Fantasy Resonance'), off: (getOverride('upoff').v || {})['g:Final Fantasy Resonance'], brig: GAMES.filter(x => x.t === 'Brigandine: Abyss').map(g => g.p + g.up).join() }));
  ok(!s.g && s.up && s.off === 1 && s.brig === 'PS51', '"Put it back in Upcoming" takes it out of the backlog for good (after reopening too), and the one he owns stays: ' + JSON.stringify(s));
  await R(() => { switchLib('screen'); const i = L19.ordered('games').findIndex(x => x.title === 'Final Fantasy Resonance'); openSheet('up:games:' + i); }); await page.waitForTimeout(500);
  s = await R(() => [...document.querySelectorAll('#sheet .sheet-body .l41 button')].map(x => x.textContent));
  ok(s.join('|') === 'I own it on PS5|I own it on Switch|I own it on Switch 2|Let it drop into my backlog', 'back in Upcoming it can still be owned, or let back in: ' + s.join('|'));
  await R(() => document.querySelector('#sheet .l58 button[data-l58=in]').click()); await page.waitForTimeout(900);
  s = await R(() => ({ g: GAMES.filter(x => x.t === 'Final Fantasy Resonance').map(g => g.up).join(), off: (getOverride('upoff').v || {})['g:Final Fantasy Resonance'], up: L19.ordered('games').some(x => x.title === 'Final Fantasy Resonance'), grid: /Final Fantasy Resonance/.test((document.querySelector('#lib-other .glib') || document.querySelector('#lib-other')).textContent) }));
  ok(s.g === '2' && !s.off && !s.up && s.grid, '"Let it drop into my backlog" drops it back in at once: ' + JSON.stringify(s));
  // "Put it back" on a game he had said he owned: it is out, so it stays in Upcoming instead of dropping straight back in
  await R(() => openSheet('game:Brigandine: Abyss')); await page.waitForTimeout(500); await R(() => document.querySelector('#sheet .l41-back button[data-l41=undo]').click()); await page.waitForTimeout(8600);
  s = await R(() => ({ g: GAMES.some(x => x.t === 'Brigandine: Abyss'), up: L19.ordered('games').some(x => x.title === 'Brigandine: Abyss'), off: (getOverride('upoff').v || {})['g:Brigandine: Abyss'], rec: !!(getOverride('upown').v || {})['g:Brigandine: Abyss'] }));
  ok(!s.g && s.up && s.off === 1 && !s.rec, 'the old "Put it back" on an owned game that is out keeps it in Upcoming: ' + JSON.stringify(s));
  // someone he shared the app with gets no buttons
  s = await R(async () => { CAN_EDIT = false; openSheet('game:Final Fantasy Resonance'); await new Promise(z => setTimeout(z, 400)); const n = document.querySelectorAll('#sheet .sheet-body .l58').length; closeSheet(); CAN_EDIT = true; return n; });
  ok(s === 0, 'a shared viewer sees no drop buttons');
  await ctx.close();
  // ================= the 14-day rule =================
  ({ ctx, page, R } = await boot(br, '2026-11-14T15:00:00', d => { const m = game(d, 'Mercenaries Grace: Black Feather and the Golden Right Arm'); m.date = '2026-11-12'; m.platforms = ['PS5', 'Switch']; }));
  s = await R(() => ({ out: L58.dropped('games').map(x => x.title), g: GAMES.some(x => /Mercenaries Grace/.test(x.t)), up: L19.ordered('games').some(x => /Mercenaries Grace/.test(x.title)) }));
  ok(s.out.every(t => !/Mercenaries Grace/.test(t)) && !s.g && s.up, 'a day that has come does not drop in when the list was last checked more than 14 days before it (Oct 26 for Nov 12)');
  await ctx.close();
  ({ ctx, page, R } = await boot(br, '2026-12-04T15:00:00', d => { d.at = '2026-11-30'; }));
  s = await R(() => ({ out: L58.dropped('games').map(x => x.title), G: GAMES.filter(g => g.up === 2).map(g => g.t), S: SHOWS.filter(x => x.up === 2).map(x => x.t + '|' + x.k + '|' + sStatus(x)), up: L19.ordered('games').map(x => x.title) }));
  ok(s.out.indexOf('Dragon Quest Monsters: The Withered World') >= 0 && s.G.indexOf('Dragon Quest Monsters: The Withered World') >= 0, 'checked on Nov 30, the game dated Dec 3 is in the backlog on Dec 4: ' + s.G.join());
  ok(s.S.join() === 'The Hunger Games: Sunrise on the Reaping|movie|queue' && s.up.every(t => !/Sunrise on the Reaping|Withered World/.test(t)), 'and the film from Nov 20 is on the watch list: ' + s.S.join());
  ok(s.up.some(t => /Mercenaries Grace/.test(t)) && s.out.every(t => !/Mercenaries Grace/.test(t)) && s.up.some(t => /Romancing SaGa 3/.test(t)), 'a game with only a month (November 2026) waits for a day, and one dated ahead waits for its day');
  await R(() => { switchLib('screen'); openSheet('show:The Hunger Games: Sunrise on the Reaping'); }); await page.waitForTimeout(600);
  ok(await R(() => { const b = [...document.querySelectorAll('#sheet .sheet-body .l58 button')].map(x => x.textContent); closeSheet(); return b.join('|') === 'Dropped in when it came out. Put it back in Upcoming'; }), 'the film\'s page has the way back');
  await ctx.close();
  // ================= March 10 2027: a new book takes an open spot =================
  let b3 = await boot(br, '2027-03-10T15:00:00', d => { d.at = '2027-03-08'; }); ({ ctx, page, R } = b3);
  s = await R(() => { const S = L56.slots(); const d = S.filter(x => x.drop); return { n: S.length, d: d.map(x => [x.name, x.m, x.open, x.lib, x.id].join('|')), fm: S.filter(x => /Forgotten Melody/.test(x.name)).map(x => [x.open || 0, x.m, !!x.drop].join('|')), out: L58.dropped('books').map(x => x.title), ac: SERIES_PLAN['A Court of Thorns and Roses'].slice(-1)[0], watch: L56.watch().map(w => w.name), acRow: L57.data('A Court of Thorns and Roses').R.filter(r => /Forgotten/.test(r.title)).map(r => [r.num, r.gap, r.note, r.extra].join('|')) }; });
  ok(s.n === 75 && s.d.length === 1 && /^Seven and the Swift\|2\|1\|\|o\d+$/.test(s.d[0]), 'Seven and the Swift (out Mar 9) has taken an open spot in March, and the plan is still 75: ' + JSON.stringify(s.d));
  ok(s.fm.join() === '0|1|false' && s.ac === '+7|A Court of Forgotten Melody|2027' && s.acRow.join() === '7|1|Out Jan 12|false', 'ACOTAR 7 (out Jan 12) stays the set book it was, and is book 7 to get on the ACOTAR page: ' + JSON.stringify([s.fm, s.ac, s.acRow]));
  ok(s.out.indexOf('Feels Like Falling') < 0 && s.watch[0] === 'Feels Like Falling' && s.watch.indexOf('Seven and the Swift') < 0, 'a book dated ahead is still on the watch list, and the one that is out has left it');
  await R(() => { switchLib('life'); L37.open('log'); }); await page.waitForTimeout(500); await R(() => document.getElementById('l37').shadowRoot.querySelector('[data-a="arc"][data-k="y2027"]').click()); await page.waitForTimeout(500);
  s = await R(() => { const b = document.getElementById('l37').shadowRoot.querySelector('.body'); const row = [...b.querySelectorAll('.l37-q')].find(x => /Seven and the Swift/.test(x.textContent)); const hs = [...b.querySelectorAll('h3')]; const mar = hs.find(h => /^March/.test(h.textContent)); return { cls: row.className, a: row.getAttribute('data-a'), txt: row.textContent, mar: mar.textContent, taken: /New releases have taken 1 of them\./.test(b.textContent), open: b.querySelectorAll('.l37-q.open').length, h: row.getBoundingClientRect().height }; });
  ok(s.cls === 'l37-q' && s.a === 'arcstep' && /Seven and the Swift/.test(s.txt) && /Out Mar 9 · took an open spot · not in your library yet/.test(s.txt) && s.h >= 44, 'its row on the plan page is a book, not a dashed open spot: ' + JSON.stringify(s));
  ok(/7 books/.test(s.mar) && !/open/.test(s.mar) && s.taken && s.open === 16, 'March counts it, has no empty spot left, and the Goodreads note says one spot is taken: ' + s.mar + ' / ' + s.open);
  await R(() => { const r = document.getElementById('l37').shadowRoot; [...r.querySelectorAll('.body .l37-q')].find(x => /Seven and the Swift/.test(x.textContent)).click(); }); await page.waitForTimeout(700);
  s = await R(() => { const b = document.querySelector('#sheet .sheet-body'); return { t: String(sheetTitle), h2: (b.querySelector('h2') || {}).textContent, into: (b.querySelector('.l58-in') || {}).textContent, btn: [...b.querySelectorAll('.l41 button')].map(x => x.textContent) }; });
  ok(/^up:books:\d+$/.test(s.t) && s.h2 === 'Seven and the Swift' && s.into === 'It has dropped into your 2027 plan (March) and its series page (Shield of Sparrows).' && s.btn.join('|') === 'I own it on Audible|I own it on Kindle or paper|Keep it out of my plans', 'a tap opens its Upcoming page, which says where it went: ' + JSON.stringify(s));
  await R(() => document.querySelector('#sheet .l41 button[data-how=aud]').click()); await page.waitForTimeout(900);
  s = await R(() => { const S = L56.slots(); const x = S.find(z => z.drop); const A = L48.arcs().find(a => a.id === 'y2027'); const st = A.steps.find(z => z.t === 'Seven and the Swift'); const sos = L57.data('Shield of Sparrows').R.map(r => [r.num, r.title, !!r.t, r.gap || 0].join('|')); closeSheet(); return { lib: x && x.lib, book: st && st.book, up: L19.ordered('books').some(z => z.title === 'Seven and the Swift'), sos }; });
  ok(s.lib === 'Seven and the Swift' && s.book === 'Seven and the Swift' && !s.up && s.sos.join() === '1|Shield of Sparrows|true|0,2|Rites of the Starling|true|0,3|Seven and the Swift|true|0', 'once he owns it the spot opens his copy, and it is book 3 on its series page: ' + JSON.stringify(s));
  s = await R(() => { OVERRIDES['Seven and the Swift'] = Object.assign({}, OVERRIDES['Seven and the Swift'] || {}, { status: 'read', finished: '2027-03-20' }); try { memoClear(); } catch (e) {} const S = L56.slots(); const f = S.filter(x => x.open && x.t === 'Seven and the Swift'); return { n: S.length, drops: S.filter(x => x.drop).length, f: f.map(x => x.d + '|' + x.m).join(), done: L56.done().filter(x => x.t === 'Seven and the Swift').length }; });
  ok(s.n === 75 && s.drops === 0 && s.f === '2027-03-20|0' && s.done === 1, 'finished, it counts once, as the first book to fill an open spot: ' + JSON.stringify(s));
  ok(b3.errs.length === 0, 'no page errors in March 2027: ' + b3.errs.slice(0, 2).join(' | '));
  await ctx.close();
  // ================= April 21 2027: keep one out, let it back in; the real length replaces the guess =================
  ({ ctx, page, R } = await boot(br, '2027-04-21T15:00:00', d => { d.at = '2027-04-19'; book(d, 'A Court of Forgotten Melody').minutes = 1287; book(d, 'Feels Like Falling').minutes = 600; }));
  s = await R(() => { const S = L56.slots(); const a = S.find(x => /Forgotten Melody/.test(x.name)); return { d: S.filter(x => x.drop).map(x => [x.name, x.m, x.min].join('|')), a: [a.min, a.note].join('|') }; });
  ok(s.d.join() === 'Seven and the Swift|2|0,Feels Like Falling|3|600' && s.a === '1287|ACOTAR 7 · out Jan 12', 'two books dropped in, March and April; a length on the list is used and the "guess" note goes: ' + JSON.stringify(s));
  await R(() => { switchLib('books'); const i = L19.ordered('books').findIndex(x => x.title === 'Feels Like Falling'); openSheet('up:books:' + i); }); await page.waitForTimeout(500);
  await R(() => document.querySelector('#sheet .l58 button[data-l58=off]').click()); await page.waitForTimeout(8600);
  s = await R(() => ({ d: L56.slots().filter(x => x.drop).map(x => x.name), off: (getOverride('upoff').v || {})['b:Feels Like Falling'], watch: L56.watch().some(w => w.name === 'Feels Like Falling'), up: L19.ordered('books').some(x => x.title === 'Feels Like Falling') }));
  ok(s.d.join() === 'Seven and the Swift' && s.off === 1 && !s.watch && s.up, '"Keep it out of my plans" takes a book out of the 2027 plan and leaves it in Upcoming: ' + JSON.stringify(s));
  await R(() => { switchLib('books'); const i = L19.ordered('books').findIndex(x => x.title === 'Feels Like Falling'); openSheet('up:books:' + i); }); await page.waitForTimeout(500);
  s = await R(() => [...document.querySelectorAll('#sheet .sheet-body .l58 button')].map(x => x.textContent).join('|'));
  await R(() => document.querySelector('#sheet .l58 button[data-l58=in]').click()); await page.waitForTimeout(900);
  ok(s === 'Let it drop into my plans' && await R(() => L56.slots().filter(x => x.drop).map(x => x.name).join() === 'Seven and the Swift,Feels Like Falling' && !(getOverride('upoff').v || {})['b:Feels Like Falling']), '"Let it drop into my plans" puts it back');
  await ctx.close();
  // ================= every open spot taken =================
  ({ ctx, page, R } = await boot(br, '2027-12-20T15:00:00', d => { d.at = '2027-12-18'; for (let i = 1; i <= 15; i++) d.books.push({ series: 'Test', title: 'Test Book ' + i, author: 'A', date: '2027-12-' + String(i).padStart(2, '0'), status: 'dated', note: 'A test.', cover: null, sources: ['https://example.com/'] }); }));
  s = await R(() => { const S = L56.slots(); return { n: S.length, drops: S.filter(x => x.drop).length, over: (S.over || []).map(x => x.title), first: ['Seven and the Swift', 'Feels Like Falling', 'The Heretics', 'Test Book 1', 'Test Book 2'].map(t => { const x = S.find(z => z.drop && z.name === t); return x ? x.m : -1; }).join() }; });
  ok(s.n === 75 && s.drops === 17 && s.over.join() === 'Test Book 15' && s.first === '2,3,4,11,10', 'with more new books than open spots the plan stays 75 and the extra one waits below: ' + JSON.stringify(s));
  await R(() => { switchLib('life'); L37.open('log'); }); await page.waitForTimeout(500); await R(() => document.getElementById('l37').shadowRoot.querySelector('[data-a="arc"][data-k="y2027"]').click()); await page.waitForTimeout(500);
  ok(await R(() => { const b = document.getElementById('l37').shadowRoot.querySelector('.body'); const x = [...b.querySelectorAll('.l37-q.info')].find(z => /Test Book 15/.test(z.textContent)); return !!x && /every open spot is taken, so it counts when you finish it/.test(x.textContent); }), 'and the page says so');
  await ctx.close();
  ok(ALL.length === 0, 'no page errors anywhere: ' + ALL.slice(0, 3).join(' | '));
  console.log(pass + ' passed, ' + fail + ' failed'); await br.close(); srv.close(); process.exit(fail ? 1 : 0); })();

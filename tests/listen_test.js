// Listening is only ever his own tap (Nov 17 2026, his words: "don't ever do that I will select what I listen to just because
// it's started on audible doesn't mean listening"). Nothing else may make a book Listening: not the Audible catch-up that runs
// once on a device that has not seen it (it marked six books on Nov 16), not the Goodreads shelves the six-hourly job saves,
// and not a Goodreads file he imports. A book he marks Listening himself stays his, and the Listening button still works.
const { chromium } = require('playwright'); const http = require('http'), fs = require('fs'), path = require('path');
const ROOT = process.env.ROOT || '/home/claude/book-den';
const MIME = { '.html': 'text/html', '.js': 'application/javascript', '.json': 'application/json', '.png': 'image/png', '.jpg': 'image/jpeg', '.woff2': 'font/woff2' };
const srv = http.createServer((req, res) => { let p = decodeURIComponent(req.url.split('?')[0]); if (p === '/') p = '/index.html'; if (p === '/upcoming.json') p = '/tests/upcoming_fixture.json'; fs.readFile(path.join(ROOT, p), (e, d) => { if (e) { res.writeHead(404); return res.end(); } res.writeHead(200, { 'Content-Type': MIME[path.extname(p)] || 'application/octet-stream' }); res.end(d); }); });
const store = fs.readFileSync(path.join(__dirname, 'store.json')); let pass = 0, fail = 0; const ok = (c, m) => { if (c) pass++; else { fail++; console.log('FAIL', m); } };
// what the store itself says about each book, before the app has done anything
const SAVED = {}; try { const v = JSON.parse(store).v || {}; Object.keys(v).forEach(k => { try { SAVED[k] = JSON.parse(v[k].j).status || ''; } catch (e) {} }); } catch (e) {}
// the titles Audible showed as started on Nov 7 (the list the old catch-up turned into Listening)
const AUD = ['Vengeful: Villains, Book 2', 'The Shadow of the Gods: The Bloodsworn Saga, Book 1', 'Crave: Crave Series, Book 1', 'Marvel Super Heroes: Secret Wars', 'The Way of Kings: Book One of the Stormlight Archive', 'The Games Gods Play', 'Six of Crows', 'Shadow and Bone', 'Lord of the Butterflies', 'The Complete Poppy War Trilogy', 'Jade City: The Green Bone Saga, Book 1', 'Starsight', 'Heroes: The Greek Myths Reimagined', 'Quicksilver: The Fae & Alchemy Series, Book 1', 'Best Served Cold', 'The Lies of Locke Lamora: Gentleman Bastard, Book 1'];
(async () => { await new Promise(r => srv.listen(8884, r)); const br = await chromium.launch(); const ctx = await br.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 1, isMobile: true, hasTouch: true });
  await ctx.route(u => !/^http:\/\/localhost/.test(u.href), r => r.request().resourceType() === 'image' ? r.fulfill({ status: 200, contentType: 'image/svg+xml', body: '<svg xmlns="http://www.w3.org/2000/svg" width="4" height="6"/>' }) : r.abort());
  await ctx.route(/script\.google\.com/, r => r.fulfill({ status: 200, contentType: 'application/json', body: store }));
  await ctx.addInitScript(() => { const T = new Date('2026-11-14T15:00:00').getTime(); const D0 = Date; const off = T - D0.now(); class D extends D0 { constructor(...a) { if (!a.length) super(D0.now() + off); else super(...a); } static now() { return D0.now() + off; } } window.Date = D; });
  const page = await ctx.newPage(); const errs = []; page.on('pageerror', e => errs.push(String(e)));
  await page.addInitScript(() => { const iv = setInterval(() => { if (window.L25 && L25.announce && !L25.announce._q) { L25.announce = function () {}; L25.announce._q = 1; } }, 30); setTimeout(() => clearInterval(iv), 30000); });
  await page.goto('http://localhost:8884/'); await page.waitForTimeout(7500); const R = (f, a) => page.evaluate(f, a); const wait = ms => page.waitForTimeout(ms);
  await R(() => { switchLib('books'); renderView('genre'); }); await wait(900);

  // ---- a device that has never run the Audible catch-up ----
  const a = await R(AUD => ({ linked: !!window.DEN_LINKED, flags: [localStorage.getItem('den:aud:20261107d'), localStorage.getItem('den:aud:20261107e')], st: AUD.map(t => [t, ALL_TITLES.indexOf(t) >= 0, getStatus(t) || '']) }), AUD);
  const here = a.st.filter(x => x[1]); const flipped = here.filter(x => x[2] === 'currently-reading' && SAVED[x[0]] !== 'currently-reading').map(x => x[0]);
  ok(a.linked && a.flags[0] != null && a.flags[1] != null, 'the catch-up has run on this new device: ' + JSON.stringify(a.flags));
  ok(here.length >= 12, 'the books Audible called started are in the library: ' + here.length);
  ok(flipped.length === 0, 'none of them was made Listening by the app: ' + flipped.join(', '));
  const again = await R(AUD => { const before = AUD.map(t => getStatus(t) || '').join('|'); localStorage.removeItem('den:aud:20261107d'); localStorage.removeItem('den:aud:20261107e'); L22.apply(); return { same: AUD.map(t => getStatus(t) || '').join('|') === before, flags: [localStorage.getItem('den:aud:20261107d'), localStorage.getItem('den:aud:20261107e')] }; }, AUD);
  ok(again.same && again.flags[0] != null, 'and running it again on yet another device changes no status');

  // ---- the Goodreads shelves the job saves ----
  const g = await R(() => { const BOOK = t => !/^(show|game|cv|hk|ab|gr|badges|up|jr):/.test(t); const P = ALL_TITLES.filter(t => BOOK(t) && getStatus(t) === 'to-read' && (getOverride(t) || {}).grId); const t = P[0], t2 = P[1], id = String(getOverride(t).grId), id2 = String(getOverride(t2).grId);
    setStatus(t2, 'currently-reading');   // his own choice
    const ids = {}; ids[id] = 'to-read'; ids[id2] = 'to-read'; setOverride('grsnap', { at: 4, ids, since: '2026-01-01' }); setOverride('gr:meta', { at: 5 }); setOverride('gr:currently-reading:0', { items: [[id, t, '', '', 0], [id2, t2, '', '', 0]] });
    const n = L12.run(); return { t, t2, st: getStatus(t), st2: getStatus(t2), n, seen: (getOverride('grsnap') || {}).at }; });
  ok(g.seen === 5, 'the app read the shelves the job saved');
  ok(g.st === 'to-read', 'a book that turns up on his Goodreads Currently Reading shelf stays as he had it: ' + g.t.slice(0, 30) + ' is ' + g.st);
  ok(g.st2 === 'currently-reading', 'and one he marked Listening himself stays Listening: ' + g.t2.slice(0, 30));

  // ---- a Goodreads file he imports ----
  const f = await R(() => { const BOOK = t => !/^(show|game|cv|hk|ab|gr|badges|up|jr):/.test(t); const t = ALL_TITLES.filter(x => BOOK(x) && getStatus(x) === 'to-read' && (getOverride(x) || {}).grId)[2], id = String(getOverride(t).grId); const ids = {}; ids[id] = 'to-read';
    setOverride('grimp', { at: 1, ids, since: '2026-09-26' }); const q = s => '"' + String(s).replace(/"/g, '""') + '"';
    const csvText = 'Book Id,Title,Author,My Rating,Date Read,Date Added,Exclusive Shelf\n' + [id, q(t), q('Someone'), 0, '', '2026/11/10', 'currently-reading'].join(',') + '\n' + ['999999991', q('Zzz A Book That Is Not Here'), q('No One'), 0, '', '2026/11/10', 'currently-reading'].join(',') + '\n';
    let res = null, err = ''; try { res = L13.goodreads(csvText); } catch (e) { err = String(e); } const nw = ALL_TITLES.find(x => /^Zzz A Book That Is Not Here/.test(x));
    return { t, st: getStatus(t), now: res ? res.now.length : -1, seen: res ? res.seen : 0, added: res ? res.added.length : 0, nw: nw || '', nwSt: nw ? getStatus(nw) : '', err }; });
  ok(!f.err && f.seen === 2, 'the file was read: ' + (f.err || f.seen + ' rows'));
  ok(f.st === 'to-read' && f.now === 0, 'a book the file has on Currently Reading stays as he had it: ' + f.t.slice(0, 30) + ' is ' + f.st);
  ok(f.added === 1 && f.nwSt === 'to-read', 'a new book the file has on Currently Reading comes in as To-Read: ' + f.nwSt);

  // ---- his own tap still does it ----
  const tap = await R(() => { const BOOK = t => !/^(show|game|cv|hk|ab|gr|badges|up|jr):/.test(t); const t = ALL_TITLES.filter(x => BOOK(x) && getStatus(x) === 'to-read')[5]; openSheet(t); const b = document.querySelector('#sheet [data-status="currently-reading"]'); const had = !!b; if (b) b.click(); const st = getStatus(t); const b2 = document.querySelector('#sheet [data-status="to-read"]'); if (b2) b2.click(); const back = getStatus(t); closeSheet(); return { t, had, st, back }; });
  ok(tap.had && tap.st === 'currently-reading' && tap.back === 'to-read', 'the Listening button on a book\'s page still makes it Listening, and To-Read puts it back: ' + tap.t.slice(0, 30));
  ok(errs.length === 0, 'no page errors: ' + errs.slice(0, 3).join(' | '));
  console.log(pass + ' passed, ' + fail + ' failed'); await br.close(); srv.close(); process.exit(fail ? 1 : 0); })();

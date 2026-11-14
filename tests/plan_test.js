// L56 the 2027 plan: 58 set books and 17 open spots (four or five a Goodreads season), an arc in the quest log with its own page, any other
// book finished in 2027 fills the next open spot, a set book finished before 2027 becomes an open spot, Backlog Breaker (one tier,
// Mistborn) is first on the Books badges sheet, its medal never moves, and the banner's Kelsier is labelled Mistborn.
const { chromium } = require('playwright'); const http = require('http'), fs = require('fs'), path = require('path');
const ROOT = process.env.ROOT || '/home/claude/book-den';
const MIME = { '.html': 'text/html', '.js': 'application/javascript', '.json': 'application/json', '.png': 'image/png', '.jpg': 'image/jpeg', '.woff2': 'font/woff2' };
const srv = http.createServer((req, res) => { let p = decodeURIComponent(req.url.split('?')[0]); if (p === '/') p = '/index.html'; fs.readFile(path.join(ROOT, p), (e, d) => { if (e) { res.writeHead(404); return res.end(); } res.writeHead(200, { 'Content-Type': MIME[path.extname(p)] || 'application/octet-stream' }); res.end(d); }); });
const store = fs.readFileSync(path.join(__dirname, 'store.json')); let pass = 0, fail = 0; const ok = (c, m) => { if (c) pass++; else { fail++; console.log('FAIL', m); } };
const PNG = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==', 'base64');
async function boot(br, when) { const ctx = await br.newContext({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true });
  await ctx.route(u => !/^http:\/\/localhost/.test(u.href), r => r.request().resourceType() === 'image' ? r.fulfill({ status: 200, contentType: 'image/png', body: PNG }) : r.abort());
  await ctx.route(/script\.google\.com/, r => r.fulfill({ status: 200, contentType: 'application/json', body: store }));
  await ctx.addInitScript(w => { const T = new Date(w).getTime(); const D0 = Date; const off = T - D0.now(); class D extends D0 { constructor(...a) { if (!a.length) super(D0.now() + off); else super(...a); } static now() { return D0.now() + off; } } window.Date = D; }, when);
  const page = await ctx.newPage(); const errs = []; page.on('pageerror', e => errs.push(String(e)));
  await page.addInitScript(() => { window.__ann = []; const iv = setInterval(() => { if (window.L25 && L25.announce && !L25.announce._w) { const _a = L25.announce; L25.announce = function (n) { try { (n || []).forEach(b => window.__ann.push(b.id)); } catch (e) {} if ((n || []).some(b => b.id === 'y2027')) return _a.apply(this, arguments); }; L25.announce._w = 1; } }, 30); setTimeout(() => clearInterval(iv), 30000); });
  await page.goto('http://localhost:8874/'); await page.waitForTimeout(7500); return { ctx, page, errs, R: (f, a) => page.evaluate(f, a) }; }
(async () => { await new Promise(r => srv.listen(8874, r)); const br = await chromium.launch();
  let { ctx, page, errs, R } = await boot(br, '2026-11-14T15:00:00');
  // ---- the plan ----
  let s = await R(() => { const S = L56.slots(); return { n: S.length, open: S.filter(x => x.open).length, set: S.filter(x => !x.open).length, P: L56.P.length, months: [...new Set(S.map(x => x.m))].length, get: S.filter(x => !x.open && !x.t).map(x => x.name), speed: L56.speed(),
    perSeason: [0, 1, 2, 3].map(k => S.filter(x => x.open && x.se === k).length), first: S[0].name, last: S[S.length - 1].name, wellOfAscension: S.some(x => /Well of Ascension/.test(x.name)), hero: (S.find(x => /Hero of Ages/.test(x.name)) || {}).m }; });
  ok(s.n === 75 && s.set === 58 && s.open === 17 && s.P === 58, '75 spots: 58 set books and 17 open spots: ' + JSON.stringify([s.n, s.set, s.open, s.P]));
  ok(JSON.stringify(s.perSeason) === '[5,4,4,4]', 'open spots per Goodreads season, five in winter where The Hero of Ages was: ' + JSON.stringify(s.perSeason));
  ok(s.months === 12 && s.first === 'Warbreaker' && s.last === 'Open spot', 'all twelve months, January starts with Warbreaker, December ends with an open spot');
  ok(s.get.length === 11 && s.get.indexOf('ACOTAR 7') >= 0 && s.get.indexOf('A Memory of Light') >= 0, 'eleven set books not in his library yet: ' + s.get.join(', '));
  ok(s.speed === 1.8, 'hours are at 1.8x');
  ok(!s.wellOfAscension && s.hero === undefined, 'The Well of Ascension and The Hero of Ages are not in it (he has read both)');
  // ---- the arc in the quest log ----
  await R(() => { switchLib('life'); L37.open('log'); }); await page.waitForTimeout(500);
  s = await R(() => { const r = document.getElementById('l37').shadowRoot; const b = r.querySelector('[data-a="arc"][data-k="y2027"]'); return b ? b.innerText.replace(/\n/g, ' | ') : ''; });
  ok(/2027: 75 books/.test(s) && /58 set, 17 open · \d+ h at 1\.8x/.test(s) && /Warbreaker · January/.test(s) && /JAN/.test(s), 'the arc card: 75 books, 58 set and 17 open, hours at 1.8x, next Warbreaker in January: ' + s);
  await R(() => document.getElementById('l37').shadowRoot.querySelector('[data-a="arc"][data-k="y2027"]').click()); await page.waitForTimeout(500);
  s = await R(() => { const r = document.getElementById('l37').shadowRoot; const b = r.querySelector('.body'); return { txt: b.innerText, h3: [...b.querySelectorAll('h3')].map(x => x.firstChild.textContent), open: b.querySelectorAll('.l37-q.open').length, set: b.querySelectorAll('.l37-q[data-a=arcstep]:not(.open)').length, medal: b.querySelector('.y27b svg').outerHTML }; });
  ok(/Goodreads badges/.test(s.txt) && /Winter 5, Spring 4, Summer 4, Fall 4/.test(s.txt) && /Page-Turner, Speed Reader and Book Boss/.test(s.txt) && /Jan 1–Mar 31, Apr 1–Jun 30, Jul 1–Sep 14 and Sep 15–Dec 31/.test(s.txt), 'the page explains the Goodreads seasons and open spots');
  ok(/11 to get/.test(s.txt) && /The 58 set books are \d+ h at 1\.8x, about \d h( \d\d m)? a day/.test(s.txt) && /starts in 48 days/i.test(s.txt), 'the page: 11 to get, set-book hours and the daily pace, starts in 48 days');
  ok(s.h3.slice(0, 12).join() === 'January,February,March,April,May,June,July,August,September,October,November,December' && /New books to watch/.test(s.h3[12]), 'twelve months, then the watch list: ' + s.h3.join());
  ok(s.open === 17 && s.set === 58, 'seventeen dashed open spots and 58 set books on the page: ' + s.open + '/' + s.set);
  ok(/Goodreads Winter badge book, or from your backlog: Golden Son/.test(s.txt), 'the first empty spot suggests a Goodreads Winter badge book or the next backlog book');
  ok(!/<animate/.test(s.medal) && !/\bwidth="[^"]*"[^>]*stroke="#7be08f"/.test(s.medal) && /Backlog Breaker/.test(s.txt) && /Mistborn tier/i.test(s.txt), 'the medal on the page is still, with no progress arc at 0');
  await R(() => L37.close());
  // ---- open spots fill with other books he finishes in 2027; a set book read early becomes an open spot ----
  s = await R(() => { const set = (t, p) => { OVERRIDES[t] = Object.assign({}, OVERRIDES[t] || {}, p); };
    const gs = ALL_TITLES.find(t => /^Golden Son/.test(t)), wb = ALL_TITLES.find(t => /^Warbreaker$/.test(t)), am = ALL_TITLES.find(t => /^Royal Assassin/.test(t));
    set(gs, { status: 'read', finished: '2027-01-20' }); set(wb, { status: 'read', finished: '2026-12-02' }); set(am, { status: 'read', finished: '2027-06-03' });
    const S = L56.slots(); const o = S.filter(x => x.open); const done = L56.done();
    return { n: S.length, open: o.length, first: o[0].name + '|' + o[0].d, early: !!o.find(x => x.early === 'Warbreaker'), wb: S.some(x => !x.open && x.name === 'Warbreaker'), ra: !!done.find(x => /^Royal Assassin/.test(x.name) && x.d === '2027-06-03'), sug: L56.suggest()[0] }; });
  ok(s.n === 75 && s.open === 18 && s.early && !s.wb, 'Warbreaker read in December 2026 drops out and becomes an open spot, still 75: ' + JSON.stringify(s));
  ok(/^Golden Son/.test(s.first) && /2027-01-20$/.test(s.first) && s.ra, 'Golden Son finished in January 2027 fills the first open spot; Royal Assassin finished in June ticks its set spot');
  ok(s.sug === 'Morning Star', 'the backlog suggestion moves on past a book already read: ' + s.sug);
  await R(() => { const set = (t, p) => { OVERRIDES[t] = Object.assign({}, OVERRIDES[t] || {}, p); }; [/^Golden Son/, /^Warbreaker$/, /^Royal Assassin/].forEach(rx => { const t = ALL_TITLES.find(x => rx.test(x)); const o = Object.assign({}, OVERRIDES[t]); delete o.finished; o.status = 'to-read'; OVERRIDES[t] = o; }); });
  // ---- the badge ----
  s = await R(() => { const b = L4.all().find(x => x.id === 'y2027'); switchLib('books'); openSheet('badges:books'); const secs = [...document.querySelectorAll('#sheet .l4-st')].map(x => x.firstChild.textContent.trim()); const card = document.getElementById('l4c-y2027'); const r = { b: b && { name: b.name, tn: b.tn, th: b.th, tier: b.tier, cat: b.cat }, secs: secs.slice(0, 3), card: !!card, txt: card ? card.textContent : '' }; closeSheet(); return r; });
  ok(s.b && s.b.name === 'Backlog Breaker' && JSON.stringify(s.b.tn) === '["Mistborn"]' && JSON.stringify(s.b.th) === '[75]' && s.b.tier === 0 && s.b.cat === 'books', 'Backlog Breaker: books, one tier at 75 called Mistborn, locked for now: ' + JSON.stringify(s.b));
  ok(s.secs[0] === 'The 2027 plan' && s.card && /0 \/ 75/.test(s.txt), 'its own section first on the Books badges sheet, 0 / 75: ' + JSON.stringify(s.secs) + ' ' + JSON.stringify(s.txt));
  // earned: the banner says Mistborn and the Kelsier glow plays once, slowly
  s = await R(async () => { L56.done = () => L56.slots().map(x => Object.assign({}, x, { d: '2027-12-20', t: x.t || 'Golden Son', name: x.t ? x.name : 'Golden Son' })); L4.clear(); const b = L4.all().find(x => x.id === 'y2027'); L25.announce([b]); await new Promise(r => setTimeout(r, 600));
    const el = document.getElementById('l25'); const k = el && el.querySelector('.l26-kel'); const fx = k && k.querySelector('.l26-fx'); const an = fx ? fx.getAnimations() : [];
    return { tier: b.tier, label: el ? el.innerText.replace(/\n/g, ' | ') : '', metal: k && k.dataset.metal, kel: k && k.querySelector('small').textContent, anim: an.map(a => [a.effect.getTiming().duration, a.effect.getTiming().iterations]), medal: L4.medal(b, 52) }; });
  ok(s.tier === 1 && /Backlog Breaker · Mistborn/.test(s.label) && s.metal === 'mistborn' && s.kel === 'Mistborn', 'earned: the banner reads Backlog Breaker · Mistborn and its Kelsier is labelled Mistborn: ' + JSON.stringify([s.label, s.metal, s.kel]));
  ok(s.anim.length <= 1 && s.anim.every(a => a[0] >= 2000 && a[1] === 1), 'the glow behind Kelsier is one slow pass, no repeats: ' + JSON.stringify(s.anim));
  ok(/fffbe8/.test(s.medal) && !/<animate/.test(s.medal), 'the earned medal is the white-gold one and never moves');
  ok(errs.length === 0, 'no page errors: ' + errs.slice(0, 2).join(' | '));
  await ctx.close();
  // ---- in 2027: pace by books, auto ticks ----
  ({ ctx, page, errs, R } = await boot(br, '2027-03-01T12:00:00'));
  s = await R(() => { const set = (t, p) => { OVERRIDES[t] = Object.assign({}, OVERRIDES[t] || {}, p); }; L56.P.slice(0, 6).forEach(e => { const t = ALL_TITLES.find(x => new RegExp(e[2] || '^$').test(x)); if (t) set(t, { status: 'read', finished: '2027-01-1' + (e[0] + 1) }); });
    switchLib('life'); L37.open('log'); const r = document.getElementById('l37').shadowRoot; r.querySelector('[data-a="arc"][data-k="y2027"]').click(); const t = r.querySelector('.body').innerText; L37.close(); return { t, d: L56.done().length }; });
  ok(s.d >= 4 && /\d+ of 75 · \d+ behind/.test(s.t) && /days left/i.test(s.t), 'on March 1 with a few January books done the page counts them and says how far behind: ' + (s.t.match(/\d+ of 75[^\n]*/) || [''])[0]);
  ok(errs.length === 0, 'no page errors in 2027: ' + errs.slice(0, 2).join(' | '));
  console.log(pass + ' passed, ' + fail + ' failed'); await br.close(); srv.close(); process.exit(fail ? 1 : 0); })();

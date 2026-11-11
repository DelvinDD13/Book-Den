// Book facts (L42): authors and narrator credits checked against the catalogue, and the tidy of poster records that a cover job
// wrote into show:/game: rows. Runs against the Nov 1 store stub.
const { chromium } = require('playwright'); const http = require('http'), fs = require('fs'), path = require('path');
const ROOT = process.env.ROOT || '/home/claude/book-den'; const MIME = { '.html': 'text/html', '.js': 'application/javascript', '.json': 'application/json', '.png': 'image/png', '.jpg': 'image/jpeg', '.woff2': 'font/woff2', '.gif': 'image/gif' };
const srv = http.createServer((req, res) => { let p = decodeURIComponent(req.url.split('?')[0]); if (p === '/') p = '/index.html'; fs.readFile(path.join(ROOT, p), (e, d) => { if (e) { res.writeHead(404); return res.end(); } res.writeHead(200, { 'Content-Type': MIME[path.extname(p)] || 'application/octet-stream' }); res.end(d); }); });
const store = JSON.parse(fs.readFileSync(path.join(__dirname, 'store.json'))); let pass = 0, fail = 0; const ok = (c, m) => { if (c) pass++; else { fail++; console.log('FAIL', m); } };
let HIT = [];   // read from the page once it is up: the 85 names the mistaken runs wrote to
const poster = u => ({ url: 'https://upload.wikimedia.org/wikipedia/en/x/xx/P.jpg', src: 'audit', via: 'wikipedia', at: u, w: 300, h: 450 });
// allowed to stay without an author: no catalogue has a book under this name, so who wrote it is not known
const NO_AUTHOR_OK = ['Legends of Sleeping Dragons'];
async function boot(port, opts) { const br = await chromium.launch(); const ctx = await br.newContext({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true });
  const posts = []; const st = JSON.parse(JSON.stringify(store)); Object.assign(st.v, (opts && opts.rows) || {});
  await ctx.route(u => !/^http:\/\/localhost/.test(u.href), r => r.abort());
  await ctx.route(/script\.google\.com/, r => { const q = r.request(); if (q.method() === 'POST') { let b = {}; try { b = JSON.parse(q.postData() || '{}'); } catch (e) {} posts.push(b.v || {}); Object.keys(b.v || {}).forEach(k => { if (!st.v[k] || b.v[k].u > st.v[k].u) st.v[k] = b.v[k]; }); return r.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ ok: true, wrote: Object.keys(b.v || {}).length, v: b.v || {} }) }); } r.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(st) }); });
  if (opts && opts.local) await ctx.addInitScript(l => { try { if (!localStorage.getItem('__seeded')) { const KEYS = Object.keys(localStorage); localStorage.setItem('__seed', JSON.stringify(l)); } } catch (e) {} }, opts.local);
  const page = await ctx.newPage(); const errs = []; page.on('pageerror', e => errs.push(String(e)));
  return { br, ctx, page, errs, posts, st }; }
(async () => { await new Promise(r => srv.listen(8811, r));
  // ---------- 1. authors and narrators ----------
  let B = await boot(8811); let page = B.page; await page.goto('http://localhost:8811/'); await page.waitForTimeout(7000); const R = (f, a) => page.evaluate(f, a);
  ok(await R(() => !!window.L42 && typeof L42.facts === 'function' && typeof L42.tidy === 'function'), 'L42 is on the page');
  HIT = await R(() => L42.HIT.slice()); ok(HIT.length === 85 && HIT.every(k => /^(show|game):/.test(k)), 'the tidy list is the 85 show and game names: ' + HIT.length);
  const A = await R(() => ALL_TITLES.map(t => ({ t, a: L11.authorFor(t), n: (META[t] || {}).narrator || '' })));
  const none = A.filter(x => !x.a).map(x => x.t); const left = none.filter(t => NO_AUTHOR_OK.indexOf(t) < 0);
  ok(left.length === 0, 'every book shows an author (' + none.length + ' without, ' + NO_AUTHOR_OK.length + ' allowed): ' + left.join(' | '));
  const by = t => (A.find(x => x.t === t) || {}).a;
  [['Project Hail Mary', 'Andy Weir'], ['The Martian', 'Andy Weir'], ['Piranesi', 'Susanna Clarke'], ['Pride and Prejudice', 'Jane Austen'], ['Return to Honor', 'Brian McClellan'], ['Sword of Destiny', 'Andrzej Sapkowski'], ['Sherlock Holmes: The Definitive Collection', 'Arthur Conan Doyle'], ['The Games Gods Play', 'Abigail Owen'], ['Alchemised', 'SenLinYu'], ['Yellow face', 'R. F. Kuang'], ['I Am a Cat', 'Soseki Natsume'], ['Stardust', 'Neil Gaiman'], ['The Devils', 'Joe Abercrombie'], ['Shōgun, Part One', 'James Clavell']].forEach(([t, a]) => ok(by(t) === a, t + ' is by ' + a + ': ' + by(t)));
  const badA = A.filter(x => / - (translator|editor|introductions|adaptation)|^Marvel$|Backyard Ventures|[<>]/.test(x.a)); ok(badA.length === 0, 'no author line carries a catalogue role tag: ' + badA.map(x => x.t + ' [' + x.a + ']').join('; '));
  const kept = await R(() => ['A Court of Mist and Fury (10th Anniversary Recording)', 'Mistborn: The Final Empire', 'Dune'].map(t => L11.authorFor(t))); ok(kept[0] === 'Sarah J. Maas' && kept[1] === 'Brandon Sanderson' && kept[2] === 'Frank Herbert', 'authors that were already there are unchanged: ' + kept.join(', '));
  const vague = A.filter(x => /\(|\/|various|vary|the author|per title/i.test(x.n)); ok(vague.length === 0, 'no narrator credit is vague: ' + vague.map(x => x.t + ' [' + x.n + ']').join('; '));
  const nar = t => (A.find(x => x.t === t) || {}).n;
  [['House of Chains: Malazan Book of the Fallen, Book 4', 'Michael Page'], ['The Crippled God: Malazan Book of the Fallen Series, Book 10', 'Michael Page'], ['Half a War', 'John Keating'], ['Warbreaker', 'Alyssa Bresnahan'], ['The Sunlit Man: A Cosmere Novel', 'William DeMeritt'], ['Mythos', 'Stephen Fry'], ['A Court of Wings and Ruin (10th Anniversary Recording)', 'Elizabeth Evans'], ['Edgedancer: Stormlight Archive', 'Kate Reading']].forEach(([t, n]) => ok(nar(t) === n, t + ' is read by ' + n + ': ' + nar(t)));
  ok(nar('Gardens of the Moon: The Malazan Book of the Fallen, Book 1') === 'Ralph Lister' || nar('Gardens of the Moon') === 'Ralph Lister' || A.some(x => /Gardens of the Moon/.test(x.t) && x.n === 'Ralph Lister'), 'Malazan book 1 keeps Ralph Lister');
  // the book page shows the corrected credit
  await R(() => openSheet('House of Chains: Malazan Book of the Fallen, Book 4')); await page.waitForTimeout(700);
  const sheetTxt = await R(() => (document.querySelector('.d-page, #sheet, .sheet') || document.body).innerText); ok(/Michael Page/.test(sheetTxt) && !/Ralph Lister/.test(sheetTxt), 'the book page for House of Chains names Michael Page');
  // ---------- 1b. synopses say what the book is ----------
  const SY = await R(() => ALL_TITLES.filter(t => (META[t] || {}).synopsis).map(t => ({ t, s: META[t].synopsis, ok: !!META[t].sok })));
  ok(SY.length >= 250, 'the 250 books that had a synopsis still have one: ' + SY.length);
  const SELL = /\b(sprawling|demanding|richly|sizzling|classic|foundational|swashbuckling|gritty|epic-scale|slow-burn|high-stakes|Dune-esque|myth-haunted|morally gr[ae]y|introspective|rollicking|riveting|stunning|beloved|masterpiece|unforgettable|gripping|hilarious|addictive|bestselling|best-selling|award-winning|Hugo-winning|romantasy|grimdark|YA-adjacent|richly told|music-soaked|saga)\b/i;
  const sell = SY.filter(x => SELL.test(x.s) && !/Green Bone Saga|Bloodsworn Saga|A Romantasy:/.test(x.s)); ok(sell.length === 0, 'no synopsis sells the book or labels it: ' + sell.map(x => x.t.slice(0, 30) + ' [' + (x.s.match(SELL) || [''])[0] + ']').join('; '));
  const brand = SY.filter(x => /^[A-Z][\w.]+(?: [A-Z][\w.']+){1,2}'s (YA|epic|adult|dark|classic|mythic|Forgotten|Grishaverse|seven|Martian|time|richly|swash|gangster|Hugo|foundational|introspective|Arthurian|romantasy|urban|traditional|retellings|debut)/.test(x.s)); ok(brand.length === 0, 'no synopsis opens with the author as a brand: ' + brand.map(x => x.t).join('; '));
  const longS = SY.filter(x => x.s.length > 240); ok(longS.length === 0, 'synopses stay short: ' + longS.map(x => x.t + ' ' + x.s.length).join(', '));
  const syn = t => (SY.find(x => x.t.indexOf(t) === 0) || {}).s || '';
  ok(/Jorgen/.test(syn('Evershore')) && !/Kimmalyn/.test(syn('Evershore')), 'Evershore is Jorgen\'s story: ' + syn('Evershore'));
  ok(!/Cosmere/.test(syn("The Frugal Wizard")) && /medieval England/.test(syn("The Frugal Wizard")), 'The Frugal Wizard\'s Handbook is not called a Cosmere book');
  ok(!/Callender/.test(syn('City of Gods and Monsters')) && /Loren Calla/.test(syn('City of Gods and Monsters')), 'House of Devils no longer names the wrong author');
  ok(!/\bgod\b/i.test(syn('From Blood and Ash')) && /Maiden/.test(syn('From Blood and Ash')), 'From Blood and Ash gives away nothing past its opening');
  ok(!/queen/i.test(syn('Throne of Glass')) && /champion/.test(syn('Throne of Glass')), 'Throne of Glass gives away nothing past its opening');
  ok(!/demigod|Half-Blood/i.test(syn('The Throne of Fire')) && /Kane/.test(syn('The Throne of Fire')), 'The Throne of Fire is described as a Kane Chronicles book');
  ok(!/exile/i.test(syn('The Queen of Nothing')) && !/wards|allies/i.test(syn('Onyx Storm')), 'sequels say which book they are and no more');
  ok(!/One Ring/.test(syn('The Hobbit')) && /Smaug/.test(syn('The Hobbit')), 'The Hobbit has its own synopsis');
  ok(SY.filter(x => !x.ok).length <= 3 && SY.some(x => !x.ok && /^A Parade of Horribles/.test(x.t)), 'only a synopsis that says where a series has got to can still fold: ' + SY.filter(x => !x.ok).map(x => x.t.slice(0, 24)).join('; '));
  await R(() => { closeSheet(); openSheet('Warbreaker'); }); await page.waitForTimeout(600);
  ok(await R(() => { const p = document.querySelector('#sheet .sheet-body p.syn'); return !!p && !p.classList.contains('l39-fold') && /Hallandren/.test(p.textContent); }), 'a standalone shows its synopsis without a fold');
  await R(() => closeSheet());
  ok(B.errs.length === 0, 'no page errors: ' + B.errs.slice(0, 2).join(' | ')); await B.br.close();

  // ---------- 2. tidy: a phone that already pulled the poster records ----------
  const [k1, k2, k3, k4] = HIT; const U = Date.now() - 3600e3;
  const rows = {}; rows[k1] = { u: U, j: JSON.stringify(poster(U)) };                                   // still a poster record in the store (job has not blanked it)
  rows[k2] = { u: U + 5, j: JSON.stringify(Object.assign(poster(U), { status: 'watched', rating: 4, u: U + 5 })) };   // his edit on top of a poster record
  rows[k3] = { u: U + 9, j: 'removed' };                                                                 // blanked by the job
  rows['show:Not In The List'] = { u: U - 50, j: JSON.stringify({ status: 'watching', u: U - 50 }) };     // his row for a title the job never touched
  B = await boot(8811, { rows }); page = B.page;
  // the phone's own saved rows before the app starts: a poster record it pulled earlier, and a real row of his for a hit title
  await B.ctx.addInitScript(a => { try { if (localStorage.getItem('__t42')) return; localStorage.setItem('__t42', '1'); const SK = a.sk; const L = JSON.parse(localStorage.getItem(SK) || '{}'); L[a.k3] = a.junk; L[a.k4] = { status: 'watched', notes: 'my note', u: a.u - 999 }; localStorage.setItem(SK, JSON.stringify(L)); } catch (e) {} }, { sk: '__SK__', k3, k4, junk: poster(U), u: U });
  await page.goto('http://localhost:8811/'); await page.waitForTimeout(1500);
  const SK = await page.evaluate(() => STORE_KEY); 
  // seed with the real key, then reload so the app starts from it
  await page.evaluate(a => { const L = JSON.parse(localStorage.getItem(a.SK) || '{}'); L[a.k3] = a.junk; L[a.k4] = { status: 'watched', notes: 'my note', u: a.u - 999 }; localStorage.setItem(a.SK, JSON.stringify(L)); localStorage.removeItem('den:tidy:20261111'); }, { SK, k3, k4, junk: poster(U), u: U });
  B.posts.length = 0; await page.reload(); await page.waitForTimeout(9000);
  // the push waits for a quiet moment after start-up (first-run batches on a fresh phone take about 20 s here)
  for (let i = 0; i < 25; i++) { const P = Object.assign({}, ...B.posts); if (P[k4] && P[k2]) break; await page.waitForTimeout(2000); }
  const S = await page.evaluate(a => ({ o1: OVERRIDES[a.k1] || null, o2: OVERRIDES[a.k2] || null, o3: OVERRIDES[a.k3] || null, o4: OVERRIDES[a.k4] || null, other: OVERRIDES['show:Not In The List'] || null, did: L42.did, flag: localStorage.getItem('den:tidy:20261111'), wok: (OVERRIDES['The Way of Kings: Book One of the Stormlight Archive'] || {}).status || null }), { k1, k2, k3, k4 });
  ok(S.o1 === null, 'a poster record pulled from the store is removed from the phone: ' + JSON.stringify(S.o1));
  ok(S.o2 && S.o2.status === 'watched' && S.o2.rating === 4 && !('url' in S.o2) && !('src' in S.o2) && !('w' in S.o2), 'his edit on top of a poster record is kept without the poster fields: ' + JSON.stringify(S.o2));
  ok(S.o3 === null, 'a poster record already saved on the phone is removed, and the blanked store row is ignored: ' + JSON.stringify(S.o3));
  ok(S.o4 && S.o4.status === 'watched' && S.o4.notes === 'my note' && S.o4.u > U, 'his own row for a hit title is kept and saved again: ' + JSON.stringify(S.o4));
  ok(S.other && S.other.status === 'watching' && S.other.u === U - 50, 'his row for a title outside the list is untouched: ' + JSON.stringify(S.other));
  ok(!!S.flag, 'the one-time part is marked done on this phone');
  const pushed = Object.assign({}, ...B.posts); const pk = Object.keys(pushed);
  ok(pk.indexOf(k4) >= 0 && JSON.parse(pushed[k4].j).notes === 'my note', 'his own row goes back to the store: ' + pk.filter(k => /^(show|game):/.test(k)).join(', '));
  ok(pk.indexOf(k2) >= 0 && !('url' in JSON.parse(pushed[k2].j)) && JSON.parse(pushed[k2].j).status === 'watched', 'the cleaned row replaces the mixed one in the store');
  // a save sends the whole bucket, so a row still in the store can ride along exactly as it was; it must never be written anew
  ok((!pushed[k1] || pushed[k1].u === U) && pk.indexOf(k3) < 0, 'a row that held only a poster record is never written anew: ' + JSON.stringify([pushed[k1] && pushed[k1].u - U, pk.indexOf(k3)]));
  ok(pk.every(k => { try { const o = JSON.parse(pushed[k].j); return !(o && o.src === 'audit' && /^(show|game):/.test(k) && pushed[k].u > U + 10); } catch (e) { return true; } }), 'no new poster record is ever written to a show: or game: row');
  // second start on the same phone: nothing more to do, and his row is not saved again
  const u4 = S.o4.u; B.posts.length = 0; await page.reload(); await page.waitForTimeout(8000); await page.evaluate(() => push82()); await page.waitForTimeout(4000);
  const S2 = await page.evaluate(a => ({ o4: OVERRIDES[a.k4] || null, did: L42.did.tidy }), { k4 });
  ok(S2.o4 && S2.o4.u === u4 && S2.did.resaved === 0 && S2.did.dropped === 0, 'a second start changes nothing: ' + JSON.stringify(S2));
  ok(!Object.keys(Object.assign({}, ...B.posts)).some(k => /^(show|game):/.test(k)), 'and writes no show or game row');
  ok(B.errs.length === 0, 'no page errors in the tidy run: ' + B.errs.slice(0, 2).join(' | '));
  await B.br.close(); srv.close(); console.log(pass + ' passed, ' + fail + ' failed'); process.exit(fail ? 1 : 0); })();

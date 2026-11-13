// L55 narrator badges: a Narrators section in the Books badges, one badge per narrator with two or more finished books
// (tiers 2/4/7/10), Favorite Narrator and Narrators Heard; "full cast"/"others" left out; shared credits count for each
// narrator; the first time on a phone they are filled in from history with one note and no banners; later tier-ups announce.
const { chromium } = require('playwright'); const http = require('http'), fs = require('fs'), path = require('path');
const ROOT = process.env.ROOT || '/home/claude/book-den';
const MIME = { '.html': 'text/html', '.js': 'application/javascript', '.json': 'application/json', '.png': 'image/png', '.jpg': 'image/jpeg', '.woff2': 'font/woff2' };
const srv = http.createServer((req, res) => { let p = decodeURIComponent(req.url.split('?')[0]); if (p === '/') p = '/index.html'; fs.readFile(path.join(ROOT, p), (e, d) => { if (e) { res.writeHead(404); return res.end(); } res.writeHead(200, { 'Content-Type': MIME[path.extname(p)] || 'application/octet-stream' }); res.end(d); }); });
const store = fs.readFileSync(path.join(__dirname, 'store.json')); let pass = 0, fail = 0; const ok = (c, m) => { if (c) pass++; else { fail++; console.log('FAIL', m); } };
const PNG = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==', 'base64');
(async () => { await new Promise(r => srv.listen(8873, r)); const br = await chromium.launch(); const ctx = await br.newContext({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true });
  await ctx.route(u => !/^http:\/\/localhost/.test(u.href), r => r.request().resourceType() === 'image' ? r.fulfill({ status: 200, contentType: 'image/png', body: PNG }) : r.abort());
  await ctx.route(/script\.google\.com/, r => r.fulfill({ status: 200, contentType: 'application/json', body: store }));
  const page = await ctx.newPage(); const errs = []; page.on('pageerror', e => errs.push(String(e))); const toasts = [];
  await page.exposeFunction('noteToast', m => toasts.push(m));
  await page.addInitScript(() => { const iv = setInterval(() => { if (typeof toast === 'function' && !toast._w) { const _t = toast; window.toast = toast = function (m) { try { window.noteToast(String(m)); } catch (e) {} return _t.apply(this, arguments); }; toast._w = 1; } }, 50); setTimeout(() => clearInterval(iv), 20000); });
  const banners = []; await page.exposeFunction('noteBanner', m => banners.push(m));
  await page.addInitScript(() => { const iv = setInterval(() => { if (window.L25 && L25.announce && !L25.announce._w) { const _a = L25.announce; L25.announce = function (news) { try { (news || []).forEach(b => window.noteBanner(b.id)); } catch (e) {} return _a.apply(this, arguments); }; L25.announce._w = 1; } }, 50); setTimeout(() => clearInterval(iv), 20000); });
  await page.goto('http://localhost:8873/'); await page.waitForTimeout(8000); const R = (f, a) => page.evaluate(f, a);
  // ---- what the badges are built from ----
  let s = await R(() => [L55.who('A Court of Wings and Ruin (10th Anniversary Recording)').join(), (() => { const t = ALL_TITLES.find(x => (META[x] || {}).narrator && /,/.test(META[x].narrator)); return t ? [META[t].narrator, L55.who(t).length] : null; })()]);
  ok(s[0] === 'Elizabeth Evans', 'a book\'s narrator comes from its credits: ' + s[0]);
  ok(!s[1] || s[1][1] >= 2, 'a shared credit counts for each narrator: ' + JSON.stringify(s[1]));
  const q = await R(() => ['Mistborn: The Final Empire', 'The Lightning Thief', 'Wolfblade', 'The Well of Ascension', "The Assassin's Blade"].map(t => (META[t] || {}).narrator + ' / ' + (META[t] || {}).runtime));
  ok(/^Michael Kramer \/ 24h 39m$/.test(q[0]) && /^Jesse Bernstein/.test(q[1]) && /^Maggie Mash/.test(q[2]) && /28h 56m$/.test(q[3]) && /12h 52m$/.test(q[4]), 'missing narrators and lengths are filled from Audible\'s listings (no more "Finished" as a length): ' + q.join(' | '));
  s = await R(() => { const save = {}; const T = ALL_TITLES.slice(0, 3); T.forEach(t => { save[t] = (META[t] || {}).narrator; }); META[T[0]] = Object.assign(META[T[0]] || {}, { narrator: 'Full Cast' }); META[T[1]] = Object.assign(META[T[1]] || {}, { narrator: 'Kate Reading, and others' }); const r = [L55.who(T[0]).join('|'), L55.who(T[1]).join('|')]; T.forEach(t => { if (META[t]) { if (save[t] === undefined) delete META[t].narrator; else META[t].narrator = save[t]; } }); return r; });
  ok(s[0] === '' && s[1] === 'Kate Reading', '"full cast" and "others" are not narrators: ' + JSON.stringify(s));
  // ---- the badges ----
  s = await R(() => { const A = L4.all(); const m = L55.byN(L4.ctx()); const want = Object.keys(m).filter(n => m[n].length >= 2).sort(); const got = A.filter(b => b.sub === 'narrator').map(b => b.name).sort();
    const ev = A.find(b => b.name === 'Elizabeth Evans'); const fav = A.find(b => b.id === 'favnarr'), heard = A.find(b => b.id === 'narrheard'); const top = Math.max(...Object.values(m).map(l => l.length));
    return { want: want.join(), got: got.join(), ev: ev && [ev.v, ev.tier, ev.th.join()], fav: fav && [fav.v, top], heard: heard && [heard.v, Object.keys(m).length], sec: (L4.SECTIONS.books.find(x => x[0] === 'Narrators') || [])[1] }; });
  ok(s.want && s.want === s.got, 'one badge for each narrator with two or more finished books: ' + s.got);
  ok(s.ev && s.ev[2] === '2,4,7,10' && s.ev[1] === [2, 4, 7, 10].filter(x => s.ev[0] >= x).length, 'narrator tiers at 2, 4, 7 and 10 books: ' + JSON.stringify(s.ev));
  ok(s.fav && s.fav[0] === s.fav[1] && s.heard && s.heard[0] === s.heard[1], 'Favorite Narrator and Narrators Heard count right: ' + JSON.stringify([s.fav, s.heard]));
  ok(s.sec && s.sec[0] === 'favnarr' && s.sec[1] === 'narrheard' && s.sec.length === 2 + s.got.split(',').length, 'the Narrators section lists them, after Authors: ' + (s.sec || []).length);
  s = await R(() => { const S = L4.SECTIONS.books.map(x => x[0]); return [S.indexOf('Authors'), S.indexOf('Narrators')]; }); ok(s[1] === s[0] + 1, 'Narrators sits right after Authors: ' + s);
  // ---- first time on this phone: filled in from history, one note, no banners ----
  s = await R(() => { const e = (L4.state().e || {}); const ids = L4.all().filter(b => b.sub === 'narrator' && b.tier > 0).map(b => b.id); return [ids.length, ids.filter(id => e[id] && e[id].bf).length, localStorage.getItem('den:narrinit')]; });
  ok(s[0] > 0 && s[1] === s[0] && s[2], 'earned narrator badges are filled in from history: ' + s);
  ok(toasts.some(t => /narrator badges added from your listening/.test(t)), 'one note says so: ' + toasts.filter(t => /narrator/.test(t)).join(' | '));
  ok(!banners.some(id => /^n_|^favnarr$|^narrheard$/.test(id)), 'no banner for each one: ' + banners.join(','));
  // ---- the sheet shows them ----
  await R(() => { switchLib('books'); openSheet('badges:books'); }); await page.waitForTimeout(1200);
  s = await R(() => { const st = [...document.querySelectorAll('.l4-st')].find(x => /^Narrators/.test(x.textContent)); const sec = st && st.closest('.l4-sec'); return sec ? [sec.querySelectorAll('svg.l4-m').length, /Elizabeth Evans/.test(sec.textContent), /<rect x="38" y="10"/.test(sec.innerHTML)] : null; });
  ok(s && s[0] >= 3 && s[1] && s[2], 'the Books badges sheet shows the Narrators section with microphone medals: ' + s);
  // ---- a later launch (what the first session saved is in the store): nothing re-announced; a new tier gets its banner ----
  const st1 = await R(() => L4.state()); const S3 = JSON.parse(store); (S3.v || S3).badges = { u: Date.now(), j: JSON.stringify(st1) };
  const ctx3 = await br.newContext({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true });
  await ctx3.route(u => !/^http:\/\/localhost/.test(u.href), r => r.request().resourceType() === 'image' ? r.fulfill({ status: 200, contentType: 'image/png', body: PNG }) : r.abort());
  await ctx3.route(/script\.google\.com/, r => r.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(S3) }));
  const narrInit = await R(() => localStorage.getItem('den:narrinit')); await ctx3.addInitScript(d => { try { if (!localStorage.getItem('den:narrinit')) localStorage.setItem('den:narrinit', d); } catch (e) {} }, narrInit);
  const p3 = await ctx3.newPage(); p3.on('pageerror', e => errs.push(String(e))); const banners3 = [], toasts3 = []; await p3.exposeFunction('noteBanner', m => banners3.push(m)); await p3.exposeFunction('noteToast', m => toasts3.push(m));
  await p3.addInitScript(() => { const iv = setInterval(() => { if (window.L25 && L25.announce && !L25.announce._w) { const _a = L25.announce; L25.announce = function (news) { try { (news || []).forEach(b => window.noteBanner(b.id)); } catch (e) {} return _a.apply(this, arguments); }; L25.announce._w = 1; } if (typeof toast === 'function' && !toast._w) { const _t = toast; window.toast = toast = function (m) { try { window.noteToast(String(m)); } catch (e) {} return _t.apply(this, arguments); }; toast._w = 1; } }, 50); setTimeout(() => clearInterval(iv), 20000); });
  await p3.goto('http://localhost:8873/'); await p3.waitForTimeout(8000);
  ok(!banners3.some(id => /^n_|^favnarr$|^narrheard$/.test(id)) && !toasts3.some(t => /narrator badges added/.test(t)), 'the next launch re-announces nothing: ' + banners3.join(',') + ' ' + toasts3.join(' | '));
  s = await p3.evaluate(() => { const L = L4.all().filter(b => b.sub === 'narrator'); const b = L.find(x => x.tier > 0 && x.tier < 4); if (!b) return null; const need = b.th[b.tier] - b.v; const n = b.name; const pool = ALL_TITLES.filter(t => !/^(show|game|cv|hk|ab|gr|badges):/.test(t) && getStatus(t) !== 'read' && META[t]).slice(0, need);
    pool.forEach(t => { META[t].narrator = n; setOverride(t, { status: 'read', finished: new Date().toISOString().slice(0, 10) }); }); L4.clear(); L4.sync(); const after = L4.all().find(x => x.id === b.id); return [b.id, b.tier, after.tier, need]; });
  await p3.waitForTimeout(800);
  ok(s && s[2] === s[1] + 1 && banners3.indexOf(s[0]) >= 0, 'a narrator badge that goes up a tier later gets its banner: ' + JSON.stringify(s) + ' ' + banners3.join(','));
  await ctx3.close();
  // ---- a fresh phone: the normal backfill covers them too ----
  const ctx2 = await br.newContext({ viewport: { width: 390, height: 844 } }); await ctx2.route(u => !/^http:\/\/localhost/.test(u.href), r => r.abort());
  const S0 = JSON.parse(store); delete (S0.v || S0).badges; await ctx2.route(/script\.google\.com/, r => r.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(S0) }));
  const p2 = await ctx2.newPage(); await p2.goto('http://localhost:8873/'); await p2.waitForTimeout(8000);
  s = await p2.evaluate(() => { const e = (L4.state().e || {}); const ids = L4.all().filter(b => b.sub === 'narrator' && b.tier > 0).map(b => b.id); return [ids.length, ids.filter(id => e[id]).length]; });
  ok(s[0] > 0 && s[1] === s[0], 'on a fresh phone the narrator badges come in with the rest of the history: ' + s);
  await ctx2.close();
  ok(errs.length === 0, 'no page errors: ' + errs.slice(0, 3).join(' | '));
  await br.close(); srv.close(); console.log(pass + ' passed, ' + fail + ' failed'); process.exit(fail ? 1 : 0);
})().catch(e => { console.log('ERR', e); console.log(pass + ' passed, ' + (fail + 1) + ' failed'); process.exit(1); });

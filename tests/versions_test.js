// L46: one tile per book on the shelves, a version switch on the book page; both versions count; finishing either finishes the book.
const { chromium } = require('playwright'); const http = require('http'), fs = require('fs'), path = require('path');
const ROOT = process.env.ROOT || '/home/claude/book-den'; const MIME = { '.html': 'text/html', '.js': 'application/javascript', '.json': 'application/json' };
const srv = http.createServer((req, res) => { let p = decodeURIComponent(req.url.split('?')[0]); if (p === '/') p = '/index.html'; fs.readFile(path.join(ROOT, p), (e, d) => { if (e) { res.writeHead(404); return res.end(); } res.writeHead(200, { 'Content-Type': MIME[path.extname(p)] || 'application/octet-stream' }); res.end(d); }); });
const store = fs.readFileSync(path.join(__dirname, 'store.json')); let pass = 0, fail = 0; const ok = (c, m) => { if (c) pass++; else { fail++; console.log('FAIL', m); } };
(async () => { await new Promise(r => srv.listen(8841, r)); const br = await chromium.launch(); const ctx = await br.newContext({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true });
  await ctx.route(u => !/^http:\/\/localhost/.test(u.href), r => r.abort()); await ctx.route(/script\.google\.com/, r => r.fulfill({ status: 200, contentType: 'application/json', body: store }));
  const page = await ctx.newPage(); const errs = []; page.on('pageerror', e => errs.push(String(e))); await page.goto('http://localhost:8841/'); await page.waitForTimeout(6500); const R = (f, a) => page.evaluate(f, a);
  const TEN = 'A Court of Mist and Fury (10th Anniversary Recording)', ORIG = 'A Court of Mist and Fury (Original Recording)';
  const g = await R(() => ({ n: L46.all().length, acomaf: L46.versions('A Court of Mist and Fury (10th Anniversary Recording)'), tress: L46.versions('Tress of the Emerald Sea: A Cosmere Novel'), solo: L46.versions('Iron Flame').length }));
  ok(g.n >= 6 && g.acomaf.length === 2 && g.tress.length === 2 && g.solo === 0, 'versions are grouped by work: ' + JSON.stringify(g));
  ok(await R(() => L46.pick('A Court of Mist and Fury (Original Recording)')) === TEN, 'the version in progress is the one on the shelf until he picks');
  // the browse grid: find a tab that lists both versions
  const grid = async () => R(() => { switchLib('books'); const tabs = [...document.querySelectorAll('#nav button')]; for (let i = 0; i < tabs.length; i++) { tabs[i].click(); try { memoClear(); } catch (e) {} renderTabContent(); const tag0 = (document.querySelector('.genre-section.active .count-tag') || {}).textContent || ''; L46.dedupe(document.getElementById('content')); const c = [...document.querySelectorAll('.genre-section.active button.card')]; const hit = c.filter(b => /Mist and Fury/.test(decodeURIComponent(b.dataset.t))); if (hit.length) return { tab: tabs[i].textContent.trim(), n: hit.length, t: decodeURIComponent(hit[0].dataset.t), title: hit[0].querySelector('.title').textContent, vn: (hit[0].querySelector('.l46-vn') || {}).textContent || '', vb: (hit[0].querySelector('.l46-vb') || {}).textContent || '', badge: (hit[0].querySelector('.status-badge') || {}).textContent || '', tag: (document.querySelector('.genre-section.active .count-tag') || {}).textContent || '', tag0, raw: (VIEWS[currentView][currentTab] || []).filter(b => /Mist and Fury/.test(b.title)).length }; } return null; });
  let s1 = await grid(); ok(s1 && s1.n === 1 && s1.raw === 2, 'one tile for the two versions on the shelf: ' + JSON.stringify(s1));
  ok(s1 && s1.t === TEN && s1.title === 'A Court of Mist and Fury' && /2 versions/i.test(s1.vn) && s1.vb === '2', 'the tile names the book and says it has 2 versions');
  ok(s1 && s1.tag && s1.tag === s1.tag0, 'the shelf count still counts both versions (one tile does not change it): ' + (s1 && s1.tag));
  // the book page
  await R(t => openSheet(t), TEN); await page.waitForTimeout(500);
  const p1 = await R(() => { const b = document.querySelector('#sheet .l46'); if (!b) return null; const blks = [...document.querySelectorAll('#sheet .sheet-body .blk')]; const iv = blks.indexOf(b), is = blks.findIndex(x => /^\s*Status/i.test((x.querySelector('.lbl') || {}).textContent || '')); return { rows: [...b.querySelectorAll('.l46-r')].map(r => [r.classList.contains('on'), r.querySelector('.l46-x b').textContent, r.querySelector('.l46-x i').textContent, r.querySelector('em').textContent]), before: iv >= 0 && is > iv, head: b.querySelector('.lbl').textContent, note: b.querySelector('.l46-n').textContent }; });
  ok(p1 && p1.rows.length === 2 && p1.before, 'the version switch sits above Status on the book page: ' + JSON.stringify(p1 && p1.rows));
  ok(p1 && p1.rows[0][0] && p1.rows[0][1] === '10th Anniversary Recording' && /Elizabeth Evans/.test(p1.rows[0][2]) && /19 h 35 m/.test(p1.rows[0][2]) && /2025/.test(p1.rows[0][2]) && p1.rows[0][3] === 'Listening', 'the 10th Anniversary row: narrator, length, year, status');
  ok(p1 && p1.rows[1][1] === 'Original Recording' && /Jennifer Ikeda/.test(p1.rows[1][2]) && /23 h 16 m/.test(p1.rows[1][2]) && /2016/.test(p1.rows[1][2]) && p1.rows[1][3] === 'Not started', 'the Original Recording row: length, year, not started');
  ok(p1 && /2 in your library/i.test(p1.head) && /Finishing either one finishes the book/.test(p1.note), 'the header counts both and the note says how it works');
  // switch
  await R(() => document.querySelectorAll('#sheet .l46-r')[1].click()); await page.waitForTimeout(400);
  const p2 = await R(() => ({ t: sheetTitle, pick: (getOverride('l46').p || {})['a court of mist and fury'], on: [...document.querySelectorAll('#sheet .l46-r')].map(r => r.classList.contains('on')), n: document.querySelectorAll('#sheet .l46').length }));
  ok(p2.t === ORIG && p2.pick === ORIG && p2.on[1] && !p2.on[0] && p2.n === 1, 'tapping a version switches the page to it and remembers the pick: ' + JSON.stringify(p2));
  await R(() => closeSheet()); await page.waitForTimeout(300);
  s1 = await grid(); ok(s1 && s1.n === 1 && s1.t === ORIG, 'the picked version is the one on the shelf: ' + (s1 && s1.t));
  // finishing either one finishes the book
  await R(t => { setOverride(t, { status: 'read', finished: '2026-11-10' }); }, TEN); s1 = await grid();
  ok(s1 && s1.t === ORIG && s1.badge === 'Finished', 'finishing the other version shows the book finished: ' + JSON.stringify(s1 && [s1.t, s1.badge]));
  const cnt = await R(() => ALL_TITLES.filter(t => getStatus(t) === 'read' && /Mist and Fury/.test(t)).length); ok(cnt === 1, 'the original keeps its own status; nothing is marked twice');
  // Tress: one tile, finished
  const tr = await R(() => { const out = []; const tabs = [...document.querySelectorAll('#nav button')]; for (let i = 0; i < tabs.length; i++) { tabs[i].click(); renderTabContent(); L46.dedupe(document.getElementById('content')); const c = [...document.querySelectorAll('.genre-section.active button.card')].filter(b => /^Tress of the Emerald Sea/.test(decodeURIComponent(b.dataset.t))); if (c.length) out.push([c.length, (c[0].querySelector('.status-badge') || {}).textContent]); } return out; });
  ok(tr.length && tr.every(x => x[0] === 1 && x[1] === 'Finished'), 'Tress shows once, finished, wherever it is shelved: ' + JSON.stringify(tr));
  // the shelves at the top never show two versions side by side
  const sh = await R(() => { switchLib('books'); try { L15.placeBooks(); } catch (e) {} L46.dedupe(document.getElementById('lib-books')); const rows = [...document.querySelectorAll('#lib-books .d-row')]; return rows.map(r => { const k = [...r.querySelectorAll('[data-dopen]')].map(b => L46.work(decodeURIComponent(b.dataset.dopen))); return k.length - new Set(k).size; }); });
  ok(sh.every(x => x === 0), 'no shelf row holds two versions of one book: ' + JSON.stringify(sh));
  ok(!errs.length, 'no page errors: ' + errs.slice(0, 3).join(' | '));
  console.log(pass + ' passed, ' + fail + ' failed'); await br.close(); srv.close(); process.exit(fail ? 1 : 0); })();

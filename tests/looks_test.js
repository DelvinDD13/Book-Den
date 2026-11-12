// L51 Steel looks (Superman/Batman switch, era chips, his pictures kept in IndexedDB on the phone) and L52 badge alerts in the books' own words.
const { chromium } = require('playwright'); const http = require('http'), fs = require('fs'), path = require('path'), os = require('os');
const ROOT = process.env.ROOT || '/home/claude/book-den'; const MIME = { '.html': 'text/html', '.js': 'application/javascript', '.json': 'application/json', '.png': 'image/png', '.jpg': 'image/jpeg' };
const srv = http.createServer((req, res) => { let p = decodeURIComponent(req.url.split('?')[0]); if (p === '/') p = '/index.html'; fs.readFile(path.join(ROOT, p), (e, d) => { if (e) { res.writeHead(404); return res.end(); } res.writeHead(200, { 'Content-Type': MIME[path.extname(p)] || 'application/octet-stream' }); res.end(d); }); });
const store = fs.readFileSync(path.join(__dirname, 'store.json')); let pass = 0, fail = 0; const ok = (c, m) => { if (c) pass++; else { fail++; console.log('FAIL', m); } };
(async () => { await new Promise(r => srv.listen(8858, r)); const br = await chromium.launch(); const ctx = await br.newContext({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true });
  const PNG = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==', 'base64');
  await ctx.route(u => !/^http:\/\/localhost/.test(u.href), r => r.request().resourceType() === 'image' ? r.fulfill({ status: 200, contentType: 'image/png', body: PNG }) : r.abort()); await ctx.route(/script\.google\.com/, r => r.fulfill({ status: 200, contentType: 'application/json', body: store }));
  const page = await ctx.newPage(); const errs = []; page.on('pageerror', e => errs.push(String(e))); await page.goto('http://localhost:8858/'); await page.waitForTimeout(6500); const R = (f, a) => page.evaluate(f, a);
  // ---- Steel looks, before any pictures ----
  await R(() => { switchLib('steel'); window.scrollTo(0, 0); }); await page.waitForTimeout(900);
  let s = await R(() => { const r = document.querySelector('#lib-other > .l51'); const m = document.querySelector('header.hero .b-mast img'); return { rail: !!r, tabs: r ? [...r.querySelectorAll('[data-l51h]')].map(b => b.textContent) : [], chips: r ? [...r.querySelectorAll('[data-l51e]')].map(b => b.dataset.l51e) : [], add: !!(r && r.querySelector('[data-l51add]')), img: m && m.getAttribute('src'), acc: document.documentElement.style.getPropertyValue('--d-acc'), plate: L51.plate() }; });
  ok(s.rail && s.tabs.join() === 'Superman,Batman', 'Steel shows the Superman / Batman switch: ' + s.tabs);
  ok(s.chips.join() === '1941' && s.add, 'before any pictures only the Fleischer look and Add pictures show: ' + s.chips);
  ok(/fleischer-superman-title/.test(s.img || '') && s.acc === '#f0b93a', 'the Fleischer look keeps the title card and its gold: ' + s.img + ' ' + s.acc);
  ok(/superman-shield-1944/.test(s.plate), 'plates keep the 1944 shield in the Fleischer look');
  // ---- the pictures file, through the Add pictures button ----
  const bundle = await R(() => { const mk = (w, h, c) => { const cv = document.createElement('canvas'); cv.width = w; cv.height = h; const g = cv.getContext('2d'); g.fillStyle = c; g.fillRect(0, 0, w, h); g.fillStyle = '#fff'; g.fillRect(w / 3, h / 4, w / 3, h / 3); return cv.toDataURL('image/jpeg', 0.8); };
    const set = (hero, era, n, c) => ({ hero, era, covers: Array.from({ length: n }, (_, i) => mk(60, 90, c)), chip: mk(40, 40, c), bg: mk(60, 32, c) });
    return JSON.stringify({ kind: 'den-steel-pictures', v: 1, sets: [set('superman', 'golden', 1, '#a33'), set('superman', 'new52', 4, '#33a'), set('superman', 'absolute', 3, '#a63'), set('batman', 'modern', 5, '#345'), set('batman', 'absolute', 4, '#222'), set('superman', '1941', 2, '#000'), set('wonder', 'x', 1, '#000')] }); });
  const tmp = path.join(os.tmpdir(), 'Steel pictures test.json'); fs.writeFileSync(tmp, bundle);
  const [fc] = await Promise.all([page.waitForEvent('filechooser'), page.click('#lib-other > .l51 [data-l51add]')]); await fc.setFiles(tmp); await page.waitForTimeout(1500);
  s = await R(() => { const r = document.querySelector('#lib-other > .l51'); const m = document.querySelector('header.hero .b-mast'); return { chips: [...r.querySelectorAll('[data-l51e]')].map(b => b.dataset.l51e), on: (r.querySelector('.l51-e.on') || {}).dataset ? r.querySelector('.l51-e.on').dataset.l51e : '', fan: [...m.querySelectorAll('.l51-fan img')].map(i => i.getAttribute('src')), acc: document.documentElement.style.getPropertyValue('--d-acc'), sets: L51.sets().sort() }; });
  ok(s.sets.join() === 'batman:absolute,batman:modern,superman:absolute,superman:golden,superman:new52', 'the file fills only real eras (not the Fleischer look, not unknown heroes): ' + s.sets);
  ok(s.chips.join() === '1941,golden,new52,absolute', 'Superman eras with pictures appear in order: ' + s.chips);
  ok(s.on === 'new52' && s.fan.length === 3 && s.fan.every(u => /^blob:/.test(u)), 'after the import it opens the era with the most pictures as a fan of three from this phone: ' + s.on + ' ' + s.fan.length);
  ok(s.acc === '#ff4b3e', 'New 52 colours: ' + s.acc);
  s = await R(() => L51.plate()); ok(/l51-ph/.test(s) && /blob:/.test(s), 'plates wear the era picture crop: ' + s.slice(0, 60));
  // ---- Batman ----
  await page.click('#lib-other > .l51 [data-l51h="batman"]'); await page.waitForTimeout(500);
  s = await R(() => { const r = document.querySelector('#lib-other > .l51'); return { chips: [...r.querySelectorAll('[data-l51e]')].map(b => b.dataset.l51e), on: r.querySelector('.l51-e.on') && r.querySelector('.l51-e.on').dataset.l51e, n: document.querySelectorAll('header.hero .l51-fan img').length, acc: document.documentElement.style.getPropertyValue('--d-acc') }; });
  ok(s.chips.join() === 'modern,absolute' && s.on === 'modern' && s.n === 3 && s.acc === '#7fa6d6', 'the Batman side shows its own eras and look: ' + JSON.stringify(s));
  await page.click('#lib-other > .l51 [data-l51e="absolute"]'); await page.waitForTimeout(400);
  s = await R(() => [document.documentElement.style.getPropertyValue('--d-acc'), document.querySelector('header.hero .b-mast').dataset.l51]); ok(s[0] === '#ff8a2a' && /^batman:absolute/.test(s[1] || ''), 'picking Absolute changes the header and colours: ' + s);
  // ---- leaving Steel puts the app's own colours back ----
  await R(() => switchLib('books')); await page.waitForTimeout(600);
  s = await R(() => [document.documentElement.style.getPropertyValue('--d-acc'), !!document.querySelector('#lib-other > .l51'), document.documentElement.classList.contains('l51-on')]); ok(s[0] === '' && !s[1] && !s[2], 'other tabs keep their own look: ' + s);
  await R(() => switchLib('steel')); await page.waitForTimeout(600);
  s = await R(() => [document.documentElement.style.getPropertyValue('--d-acc'), !!document.querySelector('#lib-other > .l51'), document.querySelectorAll('header.hero .l51-fan img').length]); ok(s[0] === '#ff8a2a' && s[1] && s[2] === 3, 'coming back to Steel brings the look back: ' + s);
  // ---- one picture from Photos goes to the era on screen ----
  const one = path.join(os.tmpdir(), 'one.jpg'); fs.writeFileSync(one, Buffer.from(bundle.match(/data:image\/jpeg;base64,([^"]+)/)[1], 'base64'));
  const before = await R(() => document.querySelector('header.hero .b-mast').dataset.l51);
  const [fc2] = await Promise.all([page.waitForEvent('filechooser'), page.click('#lib-other > .l51 [data-l51add]')]); await fc2.setFiles(one); await page.waitForTimeout(1500);
  s = await R(() => document.querySelector('header.hero .b-mast').dataset.l51); ok(/:5$/.test(s) && /:4$/.test(before), 'a picture from Photos is added to the era on screen: ' + before + ' -> ' + s);
  // ---- it all survives a reload (IndexedDB + the saved choice) ----
  await page.reload(); await page.waitForTimeout(6500); await R(() => switchLib('steel')); await page.waitForTimeout(1200);
  s = await R(() => ({ h: L51.hero(), e: (L51.era() || {}).k, n: document.querySelectorAll('header.hero .l51-fan img').length, sets: L51.sets().length })); ok(s.h === 'batman' && s.e === 'absolute' && s.n === 3 && s.sets === 5, 'pictures and the chosen look survive a reload: ' + JSON.stringify(s));
  await page.click('#lib-other > .l51 [data-l51h="superman"]'); await page.waitForTimeout(400); await page.click('#lib-other > .l51 [data-l51e="1941"]'); await page.waitForTimeout(500);
  s = await R(() => { const m = document.querySelector('header.hero .b-mast'); return [m.classList.contains('l51-hero'), (m.querySelector('img') || {}).getAttribute ? m.querySelector('img').getAttribute('src') : '', !!document.querySelector('#lib-other > .l51 .l51-c')]; }); ok(!s[0] && /fleischer-superman-title/.test(s[1]) && s[2], 'back to Fleischer restores the title card and its credit line: ' + s);
  // ---- badge alerts (L52) ----
  s = await R(() => { const A = L4.all(); const b = A.find(x => x.id === 'bigmonth'); const it = (typeof b.items === 'function' ? b.items(L4.ctx()) : b.items).slice().sort((x, y) => ((x.d || '') < (y.d || '') ? -1 : (x.d || '') > (y.d || '') ? 1 : 0)); const c = L52.crossing(b); return { tier: b.tier, want: it[b.th[b.tier - 1] - 1].t, got: c && c.t, line: L52.line(b).desc }; });
  ok(s.got === s.want && s.line && s.line.indexOf(s.want.replace(/\s*\([^)]*\)/g, '').split(':')[0]) === 0, 'a count badge names the book that crossed the tier: ' + JSON.stringify(s));
  s = await R(() => { const b = L4.all().find(x => x.id === 'cl_ashwalker'); return L52.line(b).desc; }); ok(/Final Empire/.test(s) && !/[.!]$/.test(s), 'a single badge names its book: ' + s);
  s = await R(() => { localStorage.removeItem('den:alertlore'); L52.snap(); const S = JSON.parse(localStorage.getItem('den:alertlore')); const k = 'mistborn'; S[k] = S[k].slice(4); localStorage.setItem('den:alertlore', JSON.stringify(S)); const b = L4.all().find(x => x.lore === k); return L52.line(b).desc; });
  ok(/^Opened: Vin · Kelsier · Elend Venture · Sazed$/.test(s), 'a lore badge names the entries it opened: ' + s);
  s = await R(() => { const S = JSON.parse(localStorage.getItem('den:alertlore')); const k = 'firstlaw'; const E = L29.by[k].e.filter(e => /^btah/.test(e.g || '')).map(e => e.id); S[k] = S[k].filter(id => E.indexOf(id) < 0); localStorage.setItem('den:alertlore', JSON.stringify(S)); const b = L4.all().find(x => x.lore === k); const o = L52.line(b); return [o.desc, o.by, !!o.q, E.length]; });
  ok(s[3] > 0 && s[0] === '“We should forgive our enemies, but not before they are hanged.”' && s[1] === 'Heinrich Heine · epigraph of Before They Are Hanged' && s[2], 'lore from Before They Are Hanged shows its public-domain epigraph: ' + JSON.stringify(s));
  await page.waitForFunction(() => { const el = document.getElementById('l25'); return !el || !el.classList.contains('in'); }, null, { timeout: 30000 }).catch(() => {}); await page.waitForTimeout(700);
  s = await R(() => { const b = Object.assign({}, L4.all().find(x => x.id === 'cl_ashwalker')); L25.announce([b]); return new Promise(r => setTimeout(() => { const el = document.getElementById('l25'); r(el ? [el.querySelector('em') && el.querySelector('em').textContent, !!el.querySelector('small.by')] : null); }, 600)); });
  ok(s && /Final Empire/.test(s[0]) && !s[1], 'the banner shows the new line: ' + JSON.stringify(s));
  s = await R(() => { const t = L4.all().filter(b => b.lore || b.id === 'hathsin').map(b => b.desc).join(' | '); return [/sealed lore|quarter of its|fell in a single week/.test(t), t.slice(0, 120)]; }); ok(!s[0], 'the lore and Hathsin badge texts are plain: ' + s[1]);
  // ---- the drawn rain and stars are gone ----
  s = await R(() => [L29.ATMO.storm, L29.ATMO.night, document.querySelectorAll('.a-rain,.a-stars,.a-fall,.a-flash').length]); ok(s[0] === '' && s[1] === '' && s[2] === 0, 'no drawn rain or stars anywhere: ' + s);
  ok(!errs.length, 'no page errors: ' + errs.slice(0, 3).join(' | '));
  console.log(pass + ' passed, ' + fail + ' failed'); await br.close(); srv.close(); process.exit(fail ? 1 : 0); })();

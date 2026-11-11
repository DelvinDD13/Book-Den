const { chromium } = require('playwright'); const http = require('http'), fs = require('fs'), path = require('path');
const ROOT = process.env.ROOT || '/home/claude/book-den'; const MIME = { '.html': 'text/html', '.js': 'application/javascript', '.json': 'application/json', '.png': 'image/png', '.jpg': 'image/jpeg', '.woff2': 'font/woff2', '.gif': 'image/gif' };
const srv = http.createServer((req, res) => { let p = decodeURIComponent(req.url.split('?')[0]); if (p === '/') p = '/index.html'; fs.readFile(path.join(ROOT, p), (e, d) => { if (e) { res.writeHead(404); return res.end(); } res.writeHead(200, { 'Content-Type': MIME[path.extname(p)] || 'application/octet-stream' }); res.end(d); }); });
const store = fs.readFileSync(path.join(__dirname, 'store.json')); let pass = 0, fail = 0; const ok = (c, m) => { if (c) pass++; else { fail++; console.log('FAIL', m); } };
// words that turn a description into a review
const OPINION = /\b(best|greatest|one of the great|great (ending|run|season|show|film|writing)|sharp(est)?|standard-setter|blueprint|sweeter|warmer|goes hard|better than|definitive|peak|ever staged|steals scenes|masterpiece|beloved|a classic|iconic|underrated|overrated|must-watch|lands harder|the heart of it|gets wild|brutal|breezy|rough around|fan favou?rite|surprisingly|arguably|essentially|basically)\b/i;
const SPOIL = /Lucavi|Glabados|massacre|Area Zero|true final boss|true ending|real ending|which of the kids|unavoidable|Erdrick trilogy|Age of Stars|Frenzied Flame|Radahn|Mohg|plays? everyone/i;
(async () => { await new Promise(r => srv.listen(8807, r)); const br = await chromium.launch(); const ctx = await br.newContext({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true });
  await ctx.route(u => !/^http:\/\/localhost/.test(u.href), r => r.abort()); await ctx.route(/script\.google\.com/, r => r.fulfill({ status: 200, contentType: 'application/json', body: store }));
  const page = await ctx.newPage(); const errs = []; page.on('pageerror', e => errs.push(String(e)));
  await page.goto('http://localhost:8807/'); await page.waitForTimeout(7000); const R = (f, a) => page.evaluate(f, a);
  const D = await R(() => ({ shows: SHOWS.map(x => ({ t: x.t, k: x.k, d: (MINFO[x.t] || [])[3] || '', inf: MINFO[x.t] || null, db: MEDIA_DB[x.t] || null })), games: GAMES.map(g => ({ t: g.t, g: g.g, p: g.p, inf: GMINFO[g.t] || null })) }));
  // ---------- every title has its data ----------
  ok(D.shows.length >= 217 && D.shows.every(x => x.inf && x.db), 'every show has an info row and a data row: ' + D.shows.filter(x => !x.inf || !x.db).map(x => x.t).join(', '));
  ok(D.games.every(g => g.inf && g.inf[3]), 'every game has a description');
  // ---------- descriptions say what the thing is ----------
  const PENDING = ['Dracula'];
  const bad1 = D.shows.filter(x => PENDING.indexOf(x.t) < 0 && (!x.d || OPINION.test(x.d.replace(/best friend/gi, 'friend'))));
  ok(bad1.length === 0, 'no show or film description is empty or reads as a review: ' + bad1.map(x => x.t + ' [' + (x.d.match(OPINION) || [''])[0] + ']').join('; '));
  const long1 = D.shows.filter(x => x.d.length > 240); ok(long1.length === 0, 'show descriptions stay short: ' + long1.map(x => x.t + ' ' + x.d.length).join(', '));
  const bad2 = D.games.filter(g => OPINION.test(g.inf[3]) || SPOIL.test(g.inf[3]));
  ok(bad2.length === 0, 'no game description reviews the game or gives away its story: ' + bad2.map(g => g.t + ' [' + ((g.inf[3].match(OPINION) || g.inf[3].match(SPOIL) || [''])[0]) + ']').join('; '));
  ok(D.games.every(g => g.inf[3].length < 520), 'game descriptions stay under 520 characters');
  // ---------- numbers are sane ----------
  const badR = D.shows.filter(x => x.db.i != null && !(x.db.i >= 1 && x.db.i <= 10)); ok(badR.length === 0, 'ratings are between 1 and 10');
  const zero = D.shows.filter(x => x.db.s === 0 || x.db.e === 0); ok(zero.length === 0, 'nothing claims zero seasons or zero episodes: ' + zero.map(x => x.t).join(', '));
  const films = D.shows.filter(x => x.k === 'movie' && PENDING.indexOf(x.t) < 0); ok(films.every(x => x.db.m > 30 && /^\d{4}/.test(x.db.y || '')), 'every film has a running time and a year: ' + films.filter(x => !(x.db.m > 30)).map(x => x.t).join(', '));
  const ser = D.shows.filter(x => x.k !== 'movie' && x.t !== 'Kagurabachi'); ok(ser.every(x => x.db.s >= 1 && x.db.e >= 1 && /^\d{4}/.test(x.db.y || '')), 'every series has seasons, episodes and years: ' + ser.filter(x => !(x.db.s >= 1 && x.db.e >= 1)).map(x => x.t).join(', '));
  const yr = D.shows.filter(x => { const m = String(x.db.y || '').match(/^(\d{4})(?:[–-](\d{4})?)?$/); return !m || +m[1] < 1930 || +m[1] > 2027 || (m[2] && +m[2] < +m[1]); }); ok(yr.length === 0, 'years are well formed: ' + yr.map(x => x.t + ' ' + x.db.y).join(', '));
  // ---------- labels ----------
  await R(() => switchLib('screen')); await page.waitForTimeout(1800);
  ok(await R(() => !/Live action/i.test(document.getElementById('lib-other').textContent)), 'the TV & Games tab never says "Live action"');
  await R(() => openSheet('show:Young Sheldon')); await page.waitForTimeout(400);
  ok(await R(() => document.querySelector('#sheet .kicker').textContent.trim() === 'Sitcom'), 'Young Sheldon is labelled a sitcom');
  await R(() => openSheet('show:Kagurabachi')); await page.waitForTimeout(400);
  ok(await R(() => { const t = document.querySelector('#sheet .sheet-body').textContent; return /Starts April 2027/.test(t) && !/\b0 (seasons?|eps|episodes)/.test(t); }), 'Kagurabachi shows its start date, not "0 seasons"');
  await R(() => openSheet('game:Fire Emblem: Fortune’s Weave')); await page.waitForTimeout(400);
  ok(await R(() => /Heroic Games/.test(document.querySelector('#sheet .syn').textContent) && /September 17, 2026/.test(document.querySelector('#sheet .syn').textContent)), 'Fortune’s Weave carries its checked premise and date');
  await R(() => closeSheet());
  ok(errs.length === 0, 'no page errors: ' + errs.slice(0, 3).join(' | '));
  console.log(pass + ' passed, ' + fail + ' failed', JSON.stringify(errs.slice(0, 5))); await br.close(); srv.close(); process.exit(fail ? 1 : 0); })();

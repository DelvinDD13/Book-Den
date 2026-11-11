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
  // ---------- poster matching: the same name and the right year, never a prefix or the first result ----------
  ok(await R(() => L16.sameOk('Goblin', 'Goblin') && !L16.sameOk('Goblin Slayer', 'Goblin') && !L16.sameOk('Goblin Slayer II', 'Goblin') && L16.sameOk('ONE PIECE', 'One Piece') && !L16.sameOk('The Game Plan', 'The Game')), 'a longer title is not taken for a shorter one');
  ok(await R(() => L16.yearOk('One Piece', '1999-10-20') && !L16.yearOk('One Piece', '2023-08-31') && !L16.yearOk('Cowboy Bebop', '2021-11-19') && L16.yearOk('Cowboy Bebop', 1998) && !L16.yearOk('Yu Yu Hakusho', '2023') && !L16.yearOk('The Game', '2025-05-12') && L16.yearOk('The Game', '2006-10-01') && !L16.yearOk('One Piece', '')), 'a remake or a namesake from another year is turned down');
  // ---------- counts and ratings checked against their sources (Nov 11 2026) ----------
  const C = await R(() => { const g = t => MEDIA_DB[t]; return { ted: g('Ted Lasso'), bear: g('The Bear'), abb: g('Abbott Elementary'), xm: g('X-Men ’97'), pr: g('Power Rangers (through Jungle Fury)'), digi: g('Digimon (every season before Tri)'), ygo: g('Yu-Gi-Oh! (through 5D’s)'), db: g('Dragon Ball (all series)'), hp: g('Harry Potter (all 8)'), game: g('The Game'), bl: g('Bleach'), saiki: g('The Disastrous Life of Saiki K'), kp: g('Kim Possible Movie: So the Drama') }; });
  ok(C.ted.s === 4 && C.ted.e === 44 && C.bear.e === 47 && C.abb.s === 6 && C.xm.s === 2 && C.xm.e === 19 && C.game.e === 147, 'TV counts match Wikipedia');
  ok(C.pr.e === 668 && C.digi.e === 332 && C.ygo.e === 558 && C.db.e === 639 && C.bl.e === 416 && C.saiki.e === 54, 'franchise and anime totals add up from their parts');
  ok(C.hp.ia === 1 && C.hp.i === 7.7 && C.db.ia === 1 && C.kp.m === 71, 'averaged ratings are flagged, and running times match');
  await R(() => switchLib('screen')); await page.waitForTimeout(1200);
  await R(() => openSheet('show:Harry Potter (all 8)')); await page.waitForTimeout(400);
  ok(await R(() => /IMDb avg 7\.7/.test(document.querySelector('#sheet .sheet-body').textContent)), 'an averaged rating says it is an average');
  await R(() => openSheet('show:Dragon Ball (all series)')); await page.waitForTimeout(400);
  ok(await R(() => /4 series · 639 eps/.test(document.querySelector('#sheet .sheet-body').textContent)), 'a franchise entry counts series, not seasons');
  await R(() => openSheet('show:Ted Lasso')); await page.waitForTimeout(400);
  ok(await R(() => /4 seasons · 44 eps/.test(document.querySelector('#sheet .sheet-body').textContent)), 'Ted Lasso shows four seasons');
  await R(() => closeSheet());
  // ---------- guide links ----------
  ok(await R(() => { const all = [].concat(...Object.values(GMINFO).map(v => v[4] || [])); return all.length >= 28 && all.every(l => /^https:\/\//.test(l[1])) && !all.some(l => /ign\.com\/wikis\/dragon-quest-iii-hd-2d-remake|^https:\/\/game8\.co\/$/.test(l[1])); }), 'no dead or generic guide links');
  ok(errs.length === 0, 'no page errors: ' + errs.slice(0, 3).join(' | '));
  console.log(pass + ' passed, ' + fail + ' failed', JSON.stringify(errs.slice(0, 5))); await br.close(); srv.close(); process.exit(fail ? 1 : 0); })();

// ===== L57: series pages. One page per series in his library, laid out like the Dungeon Crawler Carl page he liked (Nov 14): the
//   series name huge over its covers, where he is and what's next, how long the rest takes at 1.8x, what he owns and what is missing,
//   every book in order with its extras, and what is still to come. His main series each get their own look (Nov 14: "a little bit
//   more differentiation for each"): typeface, how the title is drawn, how the covers sit behind it, a texture, and the "your place"
//   box. Nothing moves. Open it from the series line on any book, or from a series in the Series view. No spoilers past the titles.
(function () {
  if (typeof seriesEntries !== 'function') return;
  const L57 = window.L57 = {};
  const esc = s => String(s == null ? '' : s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const O = k => { try { return getOverride(k) || {}; } catch (e) { return {}; } };
  const SP = 1.8; // he listens at 1.8x (Nov 2026)
  const pad = n => String(n).padStart(2, '0');
  const hm = m => { m = Math.max(0, Math.round(m)); return Math.floor(m / 60) + ' h ' + pad(m % 60) + ' m'; };
  const rt = s => { const m = /(\d+)\s*h(?:\D+(\d+)\s*m)?/.exec(String(s || '')); return m ? +m[1] * 60 + (+m[2] || 0) : 0; };
  const WORD = ['no', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten', 'eleven', 'twelve', 'thirteen', 'fourteen', 'fifteen'];
  const MS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const today = () => { const d = new Date(); return d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate()); };
  const nrm = s => String(s || '').toLowerCase().replace(/&/g, 'and').replace(/[^a-z0-9 ]/g, '').replace(/\s+/g, ' ').trim();
  // looks: title typeface (fit: each word set to the full width), title treatment, covers behind it, texture, "your place" box, marker
  const DEFLOOK = { font: 'barlow', fx: 'offset', wall: 'grid', tex: 'none', card: 'soft', mark: 'dot' };
  // what the library can't work out on its own. colors: title light, title mid, title deep, title shadow, page. Premises are book one's.
  const INFO = {
    'The Stormlight Archive': { by: 'Brandon Sanderson', from: 2010, planned: 10, place: 'on Roshar', extras: /^(Edgedancer|Dawnshard)/,
      get: [{ t: 'Elsecaller and King Lopen the First of Alethkar', after: /^Words of Radiance/, note: 'Two short stories set during Words of Radiance · ebook only', url: 'https://www.dragonsteelbooks.com/products/elsecaller-king-lopen-the-first-of-alethkar-ebook' }],
      coming: [['Book 6', 'No date yet'], ['Books 7 to 10', 'Planned']],
      blurb: 'A world of stone swept by great storms, and a war on the Shattered Plains.', colors: ['#fff0c2', '#f2b45a', '#df7a3a', '#2a5fa8', '#0a0f1d'],
      look: { font: 'cinzel', fit: 1, fx: 'offset-glow', gl: 'rgba(110,160,255,.35)', wall: 'grid', tex: 'rain', card: 'soft', cb: 'rgba(130,175,255,.45)', ct: 'rgba(110,160,255,.12)', mark: 'diamond', lab: '#a9c8ff' } },
    'Mistborn': { by: 'Brandon Sanderson', from: 2006, place: 'in the mists', extras: /^(The Eleventh Metal|Secret History)/,
      order: [/^Mistborn: The Final Empire/, /^The Well of Ascension/, /^The Hero of Ages/, /^The Alloy of Law/, /^Shadows of Self/, /^The Bands of Mourning/, /^The Eleventh Metal/, /^Secret History/, /^The Lost Metal/],
      notes: { 'The Eleventh Metal': 'In Arcanum Unbounded', 'Secret History': 'In Arcanum Unbounded' }, coming: [['Era Three', 'No date yet']],
      blurb: 'Ash falls from the sky, mist owns the night, and a crew of thieves plans an impossible job.', colors: ['#ffe4c2', '#f79353', '#c9452f', '#5b3f8c', '#110e17'],
      look: { font: 'fell', fit: 1, fx: 'glow', gl: 'rgba(247,147,83,.45)', wall: 'one', tex: 'ash', card: 'panel', mark: 'flame' } },
    'Throne of Glass': { by: 'Sarah J. Maas', from: 2012, to: 2018, place: 'in Erilea', blurb: 'An assassin is pulled out of a death camp to fight for the crown.', colors: ['#ffe1e1', '#f08a8a', '#b8243c', '#3a2c63', '#0f0b14'],
      look: { font: 'marcellus', fit: 1, fx: 'stroke-glow', gl: 'rgba(184,36,60,.6)', wall: 'fan', tex: 'shards', card: 'glass', mark: 'diamond-o', lab: '#f08fb2' } },
    'Dungeon Crawler Carl': { by: 'Matt Dinniman', from: 2020, planned: 10, place: 'in the crawl', extras: /Book 3\.5|^Cyclopsean/, coming: [['Book 10', 'Planned']],
      blurb: 'A man, his ex-girlfriend\'s cat and a dungeon that is also a game show.', colors: ['#fff3a0', '#ffc444', '#ff8a2a', '#e0447c', '#160d1f'],
      look: { font: 'barlow', sfont: 'bungee', fx: 'offset', wall: 'grid', tex: 'scan', card: 'chunky', mark: 'dot', lab: '#f08fb2' } },
    'A Court of Thorns and Roses': { by: 'Sarah J. Maas', from: 2015, place: 'in Prythian',
      blurb: 'A huntress kills a wolf in the woods, and a faerie comes across the wall to collect the debt.', colors: ['#fff0f7', '#f2a7cf', '#b04a8a', '#2a1747', '#0c0816'],
      look: { font: 'cormorant', fit: 1, fx: 'glow', gl: 'rgba(217,120,180,.45)', wall: 'fan', tex: 'stars', card: 'glass', mark: 'star', lab: '#e9a8d8' } },
    'Crescent City': { by: 'Sarah J. Maas', from: 2020, place: 'in Lunathion',
      blurb: 'A half-Fae, half-human party girl and a fallen angel hunt a killer through a city of magic and nightlife.', colors: ['#f2fdff', '#7fe3ff', '#3a8dff', '#ff4fa3', '#070a18'],
      look: { font: 'bebas', fx: 'neon', gl: 'rgba(255,79,163,.55)', wall: 'strip', tex: 'bokeh', card: 'sharp', mark: 'bar', lab: '#7fe3ff' } },
    'Red Rising Saga': { by: 'Pierce Brown', from: 2014, planned: 7, place: 'on Mars',
      blurb: 'A Red miner under the surface of Mars learns the truth about the colours who rule him.', colors: ['#fff1c9', '#f2c14e', '#c8102e', '#4a0a12', '#120607'],
      look: { font: 'barlow', fit: 1, fx: 'emboss', wall: 'grid', tex: 'dust', card: 'sharp', mark: 'tri', lab: '#f2c14e' } },
    'The First Law World': { by: 'Joe Abercrombie', from: 2006, place: 'in the Circle of the World', extras: /^Sharp Ends/,
      blurb: 'A barbarian, a torturer and a vain young officer get caught up in an old wizard\'s plans.', colors: ['#f4efe6', '#d9cbb4', '#9b1c1c', '#3a0d0d', '#0c0b0b'],
      look: { font: 'garamond', fit: 1, fx: 'emboss', wall: 'one', tex: 'steel', card: 'parchment', mark: 'bar', lab: '#d6c7b0' } },
    'The Wheel of Time': { by: 'Robert Jordan', from: 1990, to: 2013, place: 'on the Wheel', drop: /^\+7/, narr: 'Michael Kramer & Kate Reading',
      len: { 'The Eye of the World': 1797, 'The Great Hunt': 1594, 'The Dragon Reborn': 1488, 'The Shadow Rising': 2473, 'The Fires of Heaven': 2187, 'Lord of Chaos': 2492 },
      get: [{ t: 'A Crown of Swords', main: 1, min: 1824 }, { t: 'The Path of Daggers', main: 1, min: 1405 }, { t: 'Winter\'s Heart', main: 1, min: 1452 }, { t: 'Crossroads of Twilight', main: 1, min: 1564 },
        { t: 'New Spring', min: 758, note: 'The prequel, placed where it came out' }, { t: 'Knife of Dreams', main: 1, min: 1939 }, { t: 'The Gathering Storm', main: 1, min: 1978 }, { t: 'Towers of Midnight', main: 1, min: 2301 }, { t: 'A Memory of Light', main: 1, min: 2507 }],
      blurb: 'Three young people from a quiet village are hunted by something that should not exist, and a stranger offers to lead them out.', colors: ['#fff8e1', '#e9c46a', '#b0852f', '#14382b', '#06100c'],
      look: { font: 'cormorant', fit: 1, fx: 'offset-glow', gl: 'rgba(233,196,106,.35)', wall: 'grid', tex: 'rings', card: 'soft', cb: 'rgba(233,196,106,.4)', ct: 'rgba(233,196,106,.1)', mark: 'dot', lab: '#e9c46a' } },
    'Farseer Trilogy': { by: 'Robin Hobb', from: 1995, to: 1997, place: 'in the Six Duchies',
      blurb: 'A royal bastard is raised in the stables and trained in secret as the king\'s assassin.', colors: ['#eef6ff', '#a9c6e8', '#4f7fb5', '#16243a', '#070c14'],
      look: { font: 'garamond', fx: 'stroke-glow', gl: 'rgba(120,170,230,.45)', wall: 'fan', tex: 'waves', card: 'glass', mark: 'diamond-o', lab: '#a9c6e8' } },
    'The Empyrean': { by: 'Rebecca Yarros', from: 2023, planned: 5, place: 'at Basgiath', extras: /^Threshing Day/, coming: [['Book 5', 'Planned']],
      blurb: 'A scribe-in-training is forced into the war college where cadets bond dragons or die trying.', colors: ['#fff2d6', '#ffb347', '#e2552b', '#3a1b0f', '#0a0706'],
      look: { font: 'cinzel', fx: 'glow', gl: 'rgba(255,140,60,.5)', wall: 'one', tex: 'scales', card: 'sharp', mark: 'flame', lab: '#ffb347' } },
    'Percy Jackson & the Olympians': { by: 'Rick Riordan', from: 2005, place: 'at Camp Half-Blood', extras: /Demigod Files/,
      blurb: 'A kid with dyslexia and ADHD finds out his father is a Greek god.', colors: ['#fff6e0', '#ffb03b', '#ff7a1a', '#1f6fb2', '#0a1320'],
      look: { font: 'bungee', fit: 1, fx: 'offset', wall: 'grid', tex: 'waves', card: 'chunky', mark: 'star', lab: '#ffb03b' } },
    'Hierarchy': { by: 'James Islington', from: 2023, planned: 3, place: 'in the Republic',
      blurb: 'In a Republic where everyone gives part of their will to those above them, a hidden prince enrols at its elite academy.', colors: ['#f6f3ea', '#c9b37e', '#8a6d2f', '#2b2d3a', '#0b0c12'],
      look: { font: 'marcellus', fit: 1, fx: 'emboss', wall: 'grid', tex: 'rings', card: 'panel', mark: 'bar', lab: '#c9b37e' } },
    'The Faithful and the Fallen': { by: 'John Gwynne', from: 2012, to: 2016, place: 'in the Banished Lands',
      blurb: 'A blacksmith\'s son trains to be a warrior as old prophecies stir and kingdoms drift toward war.', colors: ['#f6efe0', '#d9b26a', '#9b2c2c', '#2d1a12', '#0e0a08'],
      look: { font: 'cinzel', fit: 1, fx: 'offset', wall: 'one', tex: 'mail', card: 'parchment', mark: 'diamond', lab: '#d9b26a' } },
    'The Bloodsworn Saga': { by: 'John Gwynne', from: 2021, to: 2023, place: 'in Vigrið',
      blurb: 'The gods are dead and their descendants are hunted. A mother, a thrall and a mercenary are pulled into the hunt.', colors: ['#eef7ff', '#9ec9ff', '#4a78b8', '#1a2433', '#070b12'],
      look: { font: 'fell', fit: 1, fx: 'glow', gl: 'rgba(120,170,255,.45)', wall: 'fan', tex: 'snow', card: 'panel', mark: 'bar', lab: '#9ec9ff' } },
    'Gentleman Bastard': { by: 'Scott Lynch', from: 2006, place: 'in Camorr',
      blurb: 'An orphan grows into the cleverest thief in Camorr, running cons on the nobility with his crew.', colors: ['#fff3d9', '#e8b04f', '#b5652a', '#123a3a', '#06100f'],
      look: { font: 'cormorant-i', fit: 1, fx: 'glow', gl: 'rgba(232,176,79,.45)', wall: 'strip', tex: 'waves', card: 'glass', mark: 'dot', lab: '#e8b04f' } },
    'Skyward': { by: 'Brandon Sanderson', from: 2018, place: 'on Detritus', extras: /^(Sunreach|ReDawn|Evershore|Blightfall)/, notes: { 'Blightfall': 'Riftwake, book 1' },
      blurb: 'A girl whose father was branded a coward wants one thing: to fly and fight the aliens attacking her planet.', colors: ['#eafcff', '#7de0ff', '#2f9be0', '#ff7a59', '#050a14'],
      look: { font: 'bebas', fx: 'offset', wall: 'grid', tex: 'stars', card: 'sharp', mark: 'tri', lab: '#7de0ff' } },
    'The Reckoners': { by: 'Brandon Sanderson', from: 2013, to: 2016, place: 'in Newcago', extras: /^Mitosis/,
      blurb: 'People with superpowers rule as tyrants, and a teenager joins the rebels who hunt them.', colors: ['#fffbe6', '#ffd23f', '#ee4266', '#1b1b3a', '#0b0b16'],
      look: { font: 'bungee', fit: 1, fx: 'offset', wall: 'grid', tex: 'halftone', card: 'chunky', mark: 'star', lab: '#ffd23f' } },
    'Villains': { by: 'V. E. Schwab', from: 2013, place: 'in Merit', extras: /^Warm Up/, order: [/^Vicious/, /^Warm Up/, /^Vengeful/, /^Victorious/],
      blurb: 'Two college roommates set out to prove that people can gain extraordinary abilities, and end up enemies.', colors: ['#ffffff', '#ececec', '#9a9a9a', '#d72638', '#0a0a0a'],
      look: { font: 'fraunces', fit: 1, fx: 'offset', wall: 'one', tex: 'slash', card: 'sharp', mark: 'bar', lab: '#ff5a6a' } }
  };
  L57.INFO = INFO;
  const DEF = ['#f6efe3', '#e9a3b8', '#b5536f', '#3b3363', '#0d0c14'];
  const owned = t => { try { return ALL_TITLES.indexOf(t) >= 0; } catch (e) { return false; } };
  // the book's own name on this page: "Percy Jackson and the Olympians: The Chalice of the Gods" is The Chalice of the Gods here
  const nice = (t, s) => { const p = String(t).split(/:\s*/); if (p.length > 1) { const a = nrm(p[0]), sr = nrm(s).replace(/^the /, ''); if (a && (sr.indexOf(a.replace(/^the /, '')) >= 0 || a.indexOf(sr) >= 0)) return p[1].replace(/\s*\([^)]*\)/g, '').trim(); }
    try { return shortTitle(t); } catch (e) { return p[0]; } };
  const cover = t => { try { const c = (typeof COVERS !== 'undefined' && COVERS[t]) || {}; return c.cover_data || O('cv:' + t).url || ''; } catch (e) { return ''; } };
  const lenOf = (t, I, name) => { let m = 0; try { m = L46.len(t) || 0; } catch (e) {} return m || (I.len || {})[name] || rt((META[t] || {}).runtime); };
  const narr = s => String(s || '').split(/\s*(?:&|,| and )\s*/).filter(Boolean).map(n => n.trim().split(/\s+/).pop()).join(' & ');
  const grOf = title => { try { return GR_BY_NORM[normT(title)] || null; } catch (e) { return null; } };
  // the series in reading order: owned books, gaps the library already knows about, and the books listed above that he doesn't own yet
  L57.data = function (s) { const I = INFO[s] || {}; let E = []; try { E = (seriesEntries(s) || []).slice(); } catch (e) {}
    if (I.drop) E = E.filter(e => !I.drop.test(e));
    E = E.map(e => { if (e[0] !== '+') return e; const g = grOf(e.slice(1).split('|')[1]); return g || e; });
    if (I.order) { const pos = e => { const i = I.order.findIndex(r => r.test(e)); return i < 0 ? 99 : i; }; E = E.map((e, i) => [e, i]).sort((a, b) => (pos(a[0]) - pos(b[0])) || (a[1] - b[1])).map(x => x[0]); }
    const R = []; const seen = {};
    E.forEach(e => { if (e[0] === '+' || e[0] === '~') { const p = e.slice(1).split('|'); const title = p[1] || p[0]; const rg = /^(\d+)\s*[–-]\s*(\d+)$/.exec(p[0]); const run = e[0] === '+' && rg ? Math.max(1, +rg[2] - +rg[1] + 1) : 0;
        R.push({ gap: 1, up: e[0] === '~', title, run, n: p[0], note: e[0] === '~' ? (p[2] || 'Announced') : run ? run + ' books, not in your library' : '', extra: !!(I.extras && I.extras.test(title)) || (e[0] === '+' && p[0] === '' && p.length > 1) }); return; }
      if (!owned(e)) { R.push({ gap: 1, title: nice(e, s), extra: !!(I.extras && I.extras.test(e)) }); return; }
      const name = nice(e, s); if (seen[name]) return; seen[name] = 1;
      const m = META[e] || {}; const st = getStatus(e) || ''; const o = O(e);
      R.push({ t: e, title: name, extra: !!(I.extras && I.extras.test(name)), year: m.year || '', min: lenOf(e, I, name), narr: m.narrator || I.narr || '', st, prog: st === 'read' ? 100 : st === 'currently-reading' ? (+o.progress || 0) : 0, fin: String(o.finished || '').slice(0, 10), cover: cover(e), rating: +m.rating || 0, note: (I.notes || {})[name] || '' }); });
    (I.get || []).forEach(g => { if (R.some(x => nrm(x.title) === nrm(g.t))) return; const have = owned(g.t) ? g.t : grOf(g.t);
      let row; if (have) { const m = META[have] || {}; const st = getStatus(have) || ''; const o = O(have); row = { t: have, title: g.t, extra: !g.main, min: lenOf(have, I, g.t) || g.min || 0, narr: m.narrator || I.narr || '', st, prog: st === 'read' ? 100 : st === 'currently-reading' ? (+o.progress || 0) : 0, fin: String(o.finished || '').slice(0, 10), cover: cover(have), rating: +m.rating || 0, note: g.note || '' }; }
      else row = { gap: 1, extra: !g.main, title: g.t, note: g.note || '', min: g.min || 0, url: g.url || '' };
      const i = g.after ? R.findIndex(x => x.t && g.after.test(x.t)) : -1; if (i >= 0) R.splice(i + 1, 0, row); else { const j = R.findIndex(x => x.up); if (j >= 0) R.splice(j, 0, row); else R.push(row); } });
    // books of this series that have come out since (upcoming.json, through L58): each is a book to get until it is in his library,
    // and takes the place of its "still to come" line
    let rel = { out: [], soon: [] }; try { if (window.L58) rel = L58.forSeries(s); } catch (e) {}
    const nt = t => { try { return normT(t); } catch (e) { return nrm(t); } };
    rel.out.forEach(x => { const n = nt(x.title); const hit = R.find(r => !r.up && (nt(r.t || r.title) === n || nrm(r.title) === nrm(x.title)));
      if (hit) { if (hit.gap && !hit.t) { if (!hit.note) hit.note = 'Out ' + L58.when(x); if (!hit.min) hit.min = +x.minutes || 0; } return; }
      const have = L58.lib(x)[0]; let row;
      if (have) { const m = META[have] || {}; const st = getStatus(have) || ''; const o = O(have); row = { t: have, title: x.title, extra: !L58.numOf(x), year: m.year || '', min: lenOf(have, I, x.title) || +x.minutes || 0, narr: m.narrator || I.narr || '', st, prog: st === 'read' ? 100 : st === 'currently-reading' ? (+o.progress || 0) : 0, fin: String(o.finished || '').slice(0, 10), cover: cover(have), rating: +m.rating || 0, note: '' }; }
      else row = { gap: 1, extra: !L58.numOf(x), title: x.title, note: 'Out ' + L58.when(x), min: +x.minutes || 0 };
      const ph = R.find(r => r.up && L58.same(r.title, r.n, x)); if (ph) R[R.indexOf(ph)] = row; else { const j = R.findIndex(r => r.up); if (j >= 0) R.splice(j, 0, row); else R.push(row); } });
    // a series the library only knows as a list comes in number order
    if (!I.order && !(typeof SERIES_PLAN !== 'undefined' && SERIES_PLAN[s])) { const upn = x => { try { const u = window.L58 && L58.find('books', x.title); return u ? L58.numOf(u) : 0; } catch (e) { return 0; } };
      // its number: the library's, else the upcoming list's, else the "Book 2" in its title, and the book the series is named after is book 1
      const num = x => { let v = x.t ? parseFloat((META[x.t] || {}).num) : NaN; if (isNaN(v)) v = upn(x) || NaN; if (isNaN(v) && x.t) { const m = /\bBook (\d+(?:\.\d+)?)\b/.exec(x.t); if (m) v = +m[1]; else if (nrm(x.title) === nrm(s)) v = 1; } return isNaN(v) ? 1e6 : v; }; if (R.some(x => num(x) < 1e6)) { const ix = new Map(R.map((x, i) => [x, i])); R.sort((a, b) => (num(a) - num(b)) || (ix.get(a) - ix.get(b))); } }
    let n = 0; R.forEach(x => { if (!x.extra && !x.up) { x.num = n + 1; n += x.run || 1; } });
    return { s, I, R, soon: rel.soon, C: I.colors || DEF, L: Object.assign({}, DEFLOOK, I.look || {}) }; };
  L57.place = function (D) { const own = D.R.filter(x => x.t && !x.up); const main = own.filter(x => !x.extra);
    const cur = own.find(x => x.st === 'currently-reading'); const read = own.filter(x => x.st === 'read');
    const lastRead = main.filter(x => x.st === 'read').map(x => x.num).reduce((a, b) => Math.max(a, b), 0);
    const left = D.R.filter(x => !x.up && x.st !== 'read');
    const after = cur ? D.R.indexOf(cur) : Math.max(-1, ...own.filter(x => x.st === 'read' && !x.extra).map(x => D.R.indexOf(x)));
    const nx = left.find(x => x !== cur && !x.extra && D.R.indexOf(x) > after) || left.find(x => x !== cur && D.R.indexOf(x) > after);
    const leftMin = left.reduce((s, x) => s + (x.min || 0) * (1 - (x.prog || 0) / 100), 0) / SP;
    const all = D.R.filter(x => !x.up); const allMin = all.reduce((s, x) => s + (x.min || 0), 0); const doneMin = own.reduce((s, x) => s + x.min * x.prog / 100, 0);
    let head; if (!left.length) head = 'Caught up'; else if (cur) head = cur.extra ? 'In ' + cur.title : 'In book ' + cur.num; else if (lastRead) head = 'Through book ' + lastRead; else head = 'Not started';
    return { cur, nx, read: read.length, left, nLeft: left.reduce((s, x) => s + (x.run || 1), 0), leftMin, pct: allMin ? doneMin / allMin : 0, head, lastRead }; };
  const cap = w => w.replace(/^./, c => c.toUpperCase());
  // ---- the page ----
  function html(D) { const I = D.I, R = D.R, P = L57.place(D), L = D.L;
    const own = R.filter(x => x.t); const main = R.filter(x => !x.extra && !x.up); const mainOwn = main.filter(x => x.t); const ex = R.filter(x => x.extra && !x.up); const exOwn = ex.filter(x => x.t);
    const missing = R.filter(x => x.gap && !x.up && !x.t && !x.run); const nMain = main.reduce((s, x) => s + (x.run || 1), 0);
    const covers = own.map(x => x.cover).filter(Boolean); const tiles = []; while (covers.length && tiles.length < 24) tiles.push(covers[tiles.length % covers.length]);
    const words = String(I.title || D.s).split(/\s+/);
    const narrs = [...new Set(own.concat(R.filter(x => x.gap && x.min && I.narr)).flatMap(x => narr(x.narr || I.narr).split(' & ')).filter(Boolean))];
    const hours = Math.round(R.filter(x => !x.up).reduce((s, x) => s + (x.min || 0), 0) / 60);
    const rated = own.filter(x => x.rating); const avg = rated.length ? rated.reduce((s, x) => s + x.rating, 0) / rated.length : 0;
    const toCome = I.planned ? I.planned - main.reduce((s, x) => s + (x.run || 1), 0) : 0;
    const one = (P.cur || P.nx || own[own.length - 1] || {}).cover || covers[0] || ''; const fan = covers.slice(0, 7);
    const wall = L.wall === 'one' ? '<div class="l57-wall" aria-hidden="true"><span style="background-image:url(\'' + esc(one) + '\')"></span></div>'
      : L.wall === 'fan' ? '<div class="l57-wall" aria-hidden="true">' + fan.map((u, i) => '<span style="--i:' + i + ';--n:' + fan.length + ';background-image:url(\'' + esc(u) + '\')"></span>').join('') + '</div>'
      : L.wall === 'strip' ? '<div class="l57-wall" aria-hidden="true">' + covers.concat(covers).slice(0, 8).map(u => '<span style="background-image:url(\'' + esc(u) + '\')"></span>').join('') + '</div>'
      : '<div class="l57-wall" aria-hidden="true">' + tiles.map(u => '<span style="background-image:url(\'' + esc(u) + '\')"></span>').join('') + '</div>';
    let h = '<button class="l57-x" data-l57="close" aria-label="Close">✕</button><div class="l57-bar"><div class="l57-lib"><i>In your library</i><b>' +
      (nMain - mainOwn.length ? 'You have ' + mainOwn.length + ' of ' + nMain + ' books' : 'All ' + nMain + (nMain === 1 ? ' book' : ' books')) + (ex.length ? ', ' + exOwn.length + ' of ' + ex.length + (ex.length === 1 ? ' extra' : ' extras') : '') + '</b><small>Missing ones go on your Want to Read list.</small></div>' +
      (missing.length && CAN_EDIT ? '<button class="l57-add" data-l57="add">Add the ' + missing.length + ' missing</button>' : '') + '</div>';
    h += '<header class="l57-hero">' + wall + '<i class="l57-tex" aria-hidden="true"></i><div class="l57-in">' +
      '<p class="l57-eye">' + ['Series', I.by || (own.map(x => (META[x.t] || {}).author).find(Boolean)) || '', I.from ? I.from + '–' + (I.to || '') : ''].filter(Boolean).map(esc).join(' · ') + '</p><h1 class="l57-t">' + words.map(w => '<span' + (/^(the|of|and|a|an|&)$/i.test(w) ? ' class="sm"' : '') + '>' + esc(w) + '</span>').join('') + '</h1>' +
      '<p class="l57-blurb">' + (I.blurb ? esc(I.blurb) + ' ' : '') + 'Find your place, see how long the rest takes at 1.8x, and keep an eye on what is still to come. No spoilers past the book titles.</p>' +
      '<section class="l57-card"><i>Your place ' + esc(I.place || 'in the series') + '</i><b>' + esc(P.head) + '</b><p>' +
      (P.cur ? esc(P.cur.title) + ', ' + P.cur.prog + '% in, about ' + hm(P.cur.min * (1 - P.cur.prog / 100) / SP) + ' left. ' : '') +
      (P.nx ? 'Next: ' + (P.nx.num ? 'Book ' + P.nx.num + ', ' : '') + esc(P.nx.title) + (P.nx.min ? ' (' + hm(P.nx.min / SP) + ')' : '') + (P.nx.t ? '' : ', not in your library yet') + '. ' : '') +
      (P.left.length ? (P.nLeft === 1 ? 'One book' : (P.nLeft <= 15 ? cap(WORD[P.nLeft]) : P.nLeft) + ' books') + (P.leftMin >= 60 ? ' and about ' + Math.round(P.leftMin / 60) + ' hours at 1.8x' : '') + ' to catch up.' : 'Every book out so far is done.') + '</p>' +
      '<u><s style="width:' + Math.round(P.pct * 100) + '%"></s></u>' + ((P.cur || P.nx || {}).t ? '<button data-l57="where">Change where you are ›</button>' : '') + '</section>' +
      '<dl class="l57-stats"><div><dt>' + nMain + '</dt><dd>' + (nMain === 1 ? 'book' : 'books') + (toCome > 0 ? ', ' + WORD[Math.min(15, toCome)] + ' to come' : '') + '</dd></div>' +
      (ex.length ? '<div><dt>' + ex.length + '</dt><dd>' + (ex.length === 1 ? 'extra' : 'extras') + '</dd></div>' : '') +
      (hours ? '<div><dt>' + hours + '</dt><dd>hours of ' + esc(narrs.length ? (narrs.length > 3 ? narrs.slice(0, 2).join(', ') + ' and ' + (narrs.length - 2) + ' more' : narrs.slice(0, -1).join(', ') + (narrs.length > 1 ? ' & ' : '') + narrs[narrs.length - 1]) : 'listening') + '</dd></div>' : '') +
      (avg ? '<div><dt>' + avg.toFixed(2) + '</dt><dd>Goodreads average</dd></div>' : '') + '</dl></div></header>';
    h += '<section class="l57-list"><h2>The books</h2>' + R.map((x, i) => { if (x.up) return '';
      const sub = x.t ? [x.year, x.min ? hm(x.min / SP) + ' at 1.8x' : '', narr(x.narr), x.note].filter(Boolean).join(' · ') : [x.min ? hm(x.min / SP) + ' at 1.8x' : '', x.note || 'Not in your library'].filter(Boolean).join(' · ');
      const tag = x.extra ? 'Extra' : x.run ? 'Books ' + x.num + ' to ' + (x.num + x.run - 1) : 'Book ' + x.num;
      const stt = !x.t ? '<em class="get">Get it</em>' : x.st === 'read' ? '<em class="done">' + (x.fin ? MS[+x.fin.slice(5, 7) - 1] + ' ' + x.fin.slice(0, 4) : 'Read') + '</em>' : x.st === 'currently-reading' ? '<em class="now">' + x.prog + '%</em>' : x === P.nx ? '<em class="next">Next</em>' : '<em>Owned</em>';
      const inner = '<span class="cv"' + (x.cover ? ' style="background-image:url(\'' + esc(x.cover) + '\')"' : '') + '>' + (x.cover ? '' : '<small>' + esc(x.title) + '</small>') + '</span><span class="tx"><i>' + tag + '</i><b>' + esc(x.title) + '</b><small>' + esc(sub) + '</small></span>' + stt;
      const cls = 'l57-row' + (x.extra ? ' ex' : '') + (x.st === 'read' ? ' rd' : '');
      if (x.t) return '<button class="' + cls + '" data-l57book="' + esc(encodeURIComponent(x.t)) + '">' + inner + '</button>';
      let href = x.url; try { if (!href) href = audibleUrl(x.title + (I.by ? ' ' + I.by : '')); } catch (e) {}
      return '<a class="' + cls + '" href="' + esc(href || '#') + '" target="_blank" rel="noopener">' + inner + '</a>'; }).join('') + '</section>';
    // still to come: the upcoming list's books for this series first (they carry dates), then the lines the library and this page already had
    const soon = D.soon || []; const same = (u, x) => { try { return L58.same(u[0], u[2], x); } catch (e) { return false; } };
    const up = soon.map(x => [x.title, (/^\d{4}-\d{2}-\d{2}$/.test(String(x.date)) ? 'Out ' : '') + L58.when(x)]).concat(R.filter(x => x.up).map(x => [x.title, x.note || 'Announced', x.n]).concat((I.coming || []).map(c => [c[0], c[1], null])).filter(u => !soon.some(x => same(u, x))))
      .filter((u, i, A) => A.findIndex(v => nrm(v[0]) === nrm(u[0])) === i);
    if (up.length) h += '<section class="l57-list l57-up"><h2>Still to come</h2>' + up.map(u => '<div class="l57-row soon"><span class="tx"><b>' + esc(u[0]) + '</b><small>' + esc(u[1]) + '</small></span></div>').join('') + '</section>';
    try { const S = window.L29 && L29.S && L29.S.find(x => x.n === D.s || x.short === D.s || D.s.indexOf(x.short) >= 0); if (S) { const st = L29.stats(S); h += '<button class="l57-enc" data-l29="' + esc(S.k) + '"><b>' + esc(S.short) + ' encyclopedia</b><span>' + st.u + ' of ' + st.n + ' entries open ›</span></button>'; } } catch (e) {}
    return h + '<div class="l57-end"></div>'; }
  let host = null, cur = null;
  const FIT = { cinzel: '900 40px Cinzel', fell: '400 40px "IM Fell English SC"', marcellus: '400 40px "Marcellus SC"', cormorant: '700 40px "Cormorant Garamond"', 'cormorant-i': 'italic 600 40px "Cormorant Garamond"', garamond: '600 40px "EB Garamond"', barlow: '700 40px "Barlow Condensed"', fraunces: '500 40px Fraunces', bebas: '400 40px "Bebas Neue"', bungee: '400 40px "Den Bungee"' };
  L57.open = function (s) { try { if (!s || s === 'Standalone / Other') return false; const D = L57.data(s); if (!D.R.length) return false; cur = s; if (!host) { host = document.createElement('div'); host.id = 'l57'; host.setAttribute('role', 'dialog'); host.setAttribute('aria-label', 'Series page'); document.body.appendChild(host); }
      const C = D.C, L = D.L; host.setAttribute('style', '--a:' + C[0] + ';--b:' + C[1] + ';--c:' + C[2] + ';--d:' + C[3] + ';--bg:' + C[4] + (L.gl ? ';--gl:' + L.gl : '') + (L.lab ? ';--lab:' + L.lab : '') + (L.cb ? ';--cb:' + L.cb : '') + (L.ct ? ';--ct:' + L.ct : ''));
      host.className = 'on f-' + L.font + ' sf-' + (L.sfont || L.font) + ' x-' + L.fx + ' w-' + L.wall + ' t-' + L.tex + ' c-' + L.card + ' m-' + L.mark + (L.fit ? ' fit' : '');
      host.innerHTML = html(D); host.scrollTop = 0; document.documentElement.classList.add('l57-lock');
      fit(); try { document.fonts.load(FIT[L.font] || FIT.barlow).then(fit, () => {}); } catch (e) {} try { const x = host.querySelector('.l57-x'); if (x) setTimeout(() => { try { x.focus({ preventScroll: true }); } catch (e) {} }, 30); } catch (e) {} return true; } catch (e) { console.warn('l57', e); return false; } };
  L57.close = function () { if (host) host.classList.remove('on'); cur = null; document.documentElement.classList.remove('l57-lock'); };
  L57.current = () => cur;
  // carved and engraved titles: each word set to the full width, like an inscription
  function fit() { if (!host || !host.classList.contains('fit')) return; const t = host.querySelector('.l57-t'); if (!t) return; const W = t.clientWidth * .985;
    t.querySelectorAll('span:not(.sm)').forEach(x => { x.style.fontSize = ''; const w = x.getBoundingClientRect().width, f = parseFloat(getComputedStyle(x).fontSize); if (w > 0 && f > 0) x.style.fontSize = Math.min(f * W / w, 118).toFixed(1) + 'px'; }); }
  window.addEventListener('resize', () => { if (host && host.classList.contains('on')) fit(); });
  // books he adds from a series page: kept as want:<title> rows in his Sheet and put on his Want to Read list
  L57.wants = function () { let n = 0; try { Object.keys(OVERRIDES).forEach(k => { if (k.indexOf('want:') !== 0) return; const j = OVERRIDES[k] || {}; const t = j.t; if (!t || owned(t)) return;
      ALL_TITLES.push(t); META[t] = Object.assign({ author: j.by || '', series: j.s || '', status: 'to-read', gr: true, added: true }, META[t] || {}); if (j.s) SERIES_OF[t] = j.s; try { GR_BY_NORM[normT(t)] = t; } catch (e) {} n++; }); } catch (e) {}
    if (n) { try { memoClear(); } catch (e) {} } return n; };
  L57.add = function (s) { if (!CAN_EDIT) return 0; const D = L57.data(s); const miss = D.R.filter(x => x.gap && !x.up && !x.t && !x.run); const d = today();
    miss.forEach(x => { try { setOverride('want:' + x.title, { t: x.title, s: s, by: D.I.by || '', at: d }); } catch (e) {} });
    L57.wants(); try { toast('Added ' + miss.length + ' to Want to Read'); } catch (e) {} try { refreshAfterEdit(); } catch (e) {} if (cur === s) L57.open(s); return miss.length; };
  (function () { let tries = 0; const iv = setInterval(() => { tries++; const ready = !(typeof SYNC82 !== 'undefined' && SYNC82.state === 'wait'); if (ready || tries > 60) { clearInterval(iv); if (L57.wants()) { try { refreshAfterEdit(); } catch (e) {} } } }, 1000); })();
  document.addEventListener('visibilitychange', () => { if (document.visibilityState === 'visible') setTimeout(() => { if (L57.wants()) { try { refreshAfterEdit(); } catch (e) {} } }, 2500); });
  // a book opened from the page comes back to the page when its sheet closes
  let back = null;
  try { const _cs = closeSheet; closeSheet = function () { const r = _cs.apply(this, arguments); if (back) { const s = back; back = null; setTimeout(() => L57.open(s), 30); } return r; }; } catch (e) {}
  const openBook = t => { back = cur; L57.close(); try { openSheet(t); } catch (e) { back = null; } };
  document.addEventListener('click', e => { const el = e.target.closest && e.target.closest('[data-l57],[data-l57book],[data-l57open],#l57 [data-l29]'); if (!el) return;
    if (el.matches('[data-l29]')) { L57.close(); return; }
    e.preventDefault(); e.stopPropagation();
    if (el.dataset.l57open) { const s = decodeURIComponent(el.dataset.l57open); back = null; try { if (typeof sheet !== 'undefined' && sheet.classList.contains('open')) closeSheet(); } catch (x) {} L57.open(s); return; }
    if (el.dataset.l57book) { openBook(decodeURIComponent(el.dataset.l57book)); return; }
    const a = el.dataset.l57; if (a === 'close') L57.close(); else if (a === 'add') L57.add(cur); else if (a === 'where') { const D = L57.data(cur), P = L57.place(D); const x = P.cur || P.nx; if (x && x.t) openBook(x.t); } }, true);
  window.addEventListener('keydown', e => { if (e.key === 'Escape' && host && host.classList.contains('on')) L57.close(); });
  // the ways in: the series line on a book's page, and a series in the Series view
  try { const _rs = renderSheet; renderSheet = function () { const r = _rs.apply(this, arguments); try { const t = sheetTitle, s = t && SERIES_OF[t]; if (s && s !== 'Standalone / Other' && seriesEntries(s).length) { const L = [...sheet.querySelectorAll('.blk .lbl')].find(x => x.textContent.trim() === s); if (L && !L.querySelector('.l57-go')) L.insertAdjacentHTML('beforeend', '<button class="l57-go" data-l57open="' + esc(encodeURIComponent(s)) + '">Series page ›</button>'); }
      if (t && (META[t] || {}).added) { const sl = sheet.querySelector('.srcline'); if (sl) sl.textContent = 'Added from its series page · not in your Audible library' + (s ? ' · ' + s : ''); } } catch (e) {} return r; }; } catch (e) {}
  try { const _rt = renderTabContent; renderTabContent = function () { const r = _rt.apply(this, arguments); try { if (currentView === 'series' && currentTab && currentTab !== 'Standalone / Other') { const sec = document.getElementById('sec-' + activeIdx); const ti = sec && sec.querySelector('.genre-title'); if (ti && !ti.querySelector('.l57-go')) ti.insertAdjacentHTML('beforeend', '<button class="l57-go" data-l57open="' + esc(encodeURIComponent(currentTab)) + '">Series page ›</button>'); } } catch (e) {} return r; }; } catch (e) {}
  // ---- styles ----
  const B = 'html body #l57';
  const css = '#l57{position:fixed;inset:0;z-index:2000;overflow-y:auto;-webkit-overflow-scrolling:touch;overscroll-behavior:contain;background:var(--bg);color:#ece6f4;font:400 15px/1.45 Barlow,system-ui,sans-serif;display:none}' + B + '.on{display:block}html.l57-lock,html.l57-lock body{overflow:hidden}' +
    'html body .l57-go{display:inline-flex;align-items:center;min-height:40px;margin:-10px 0 -10px 6px;padding:0 10px;border:0;background:none;color:inherit;font:600 12px Barlow,sans-serif;letter-spacing:.02em;text-transform:none;vertical-align:middle;text-decoration:underline;text-underline-offset:3px}' +
    B + ' .l57-x{position:fixed;z-index:6;top:calc(env(safe-area-inset-top) + 12px);left:14px;width:40px;height:40px;border:0;border-radius:50%;background:rgba(10,10,16,.62);-webkit-backdrop-filter:blur(8px);backdrop-filter:blur(8px);color:#fff;font-size:16px}' +
    B + ' .l57-bar{position:relative;z-index:3;display:flex;align-items:center;gap:12px;padding:calc(env(safe-area-inset-top) + 10px) 16px 10px 64px;min-height:58px;background:color-mix(in srgb,var(--bg) 88%,#fff 4%);border-bottom:1px solid rgba(255,255,255,.07)}' +
    B + ' .l57-lib{flex:1;min-width:0}' + B + ' .l57-lib i{display:block;font:600 10px/1 Barlow,sans-serif;letter-spacing:.14em;text-transform:uppercase;font-style:normal;color:var(--b)}' + B + ' .l57-lib b{display:block;margin-top:3px;font:600 15px/1.2 Barlow,sans-serif;color:#fff}' + B + ' .l57-lib small{display:block;font-size:11px;color:#a59fb4}' +
    B + ' .l57-add{flex:0 0 auto;min-height:40px;border:0;border-radius:999px;padding:9px 14px;background:linear-gradient(180deg,var(--b),var(--c));color:#1a1012;font:600 12px Barlow,sans-serif;box-shadow:0 6px 18px -6px var(--c)}' +
    B + ' .l57-hero{position:relative;overflow:hidden;padding:30px 20px 26px}' + B + ' .l57-in{position:relative;z-index:2}' +
    B + ' .l57-hero:before{content:"";position:absolute;inset:0;z-index:1;background:linear-gradient(180deg,color-mix(in srgb,var(--bg) 35%,transparent) 0%,color-mix(in srgb,var(--bg) 70%,transparent) 45%,var(--bg) 96%),radial-gradient(120% 70% at 20% 30%,transparent,color-mix(in srgb,var(--d) 30%,transparent))}' +
    B + ' .l57-tex{position:absolute;inset:0;z-index:1;pointer-events:none}' +
    B + ' .l57-eye{margin:0 0 10px;font:600 11px Barlow,sans-serif;letter-spacing:.16em;text-transform:uppercase;color:var(--b)}' +
    B + ' .l57-t{margin:0;text-transform:uppercase;background:linear-gradient(180deg,var(--a) 8%,var(--b) 52%,var(--c) 96%);-webkit-background-clip:text;background-clip:text;color:transparent}' + B + ' .l57-t span{display:block}' + B + '.fit .l57-t span{display:table}' +
    B + ' .l57-t span.sm{font-size:15px;line-height:1.3;letter-spacing:.45em;-webkit-text-stroke:0;margin:2px 0 6px}' + B + '.f-bungee .l57-t span.sm{font-size:21px;letter-spacing:.18em;margin:4px 0}' +
    B + ' .l57-blurb{margin:18px 0 0;max-width:34em;color:#d9d3e6;font-size:15.5px;line-height:1.5}' +
    B + ' .l57-card{margin:22px 0 0;padding:16px 16px 14px;border:1px solid var(--cb,color-mix(in srgb,var(--b) 40%,transparent));border-radius:16px;background:linear-gradient(160deg,var(--ct,rgba(255,255,255,.07)),rgba(255,255,255,.02) 45%),color-mix(in srgb,var(--bg) 80%,var(--d) 20%);box-shadow:0 18px 40px -18px rgba(0,0,0,.7)}' +
    B + ' .l57-card i{display:flex;align-items:center;gap:8px;font:600 10.5px Barlow,sans-serif;letter-spacing:.15em;text-transform:uppercase;font-style:normal;color:var(--lab,#f08fb2)}' + B + ' .l57-card i:before{content:"";flex:0 0 auto;width:7px;height:7px;border-radius:50%;background:currentColor}' +
    B + ' .l57-card b{display:block;margin:6px 0 4px;font-size:38px;line-height:1.02;text-transform:uppercase;background:linear-gradient(180deg,var(--a),var(--b));-webkit-background-clip:text;background-clip:text;color:transparent}' + B + ' .l57-card p{margin:0;color:#cfc8dc;font-size:14px}' +
    B + ' .l57-card u{display:block;height:5px;margin:12px 0 10px;border-radius:9px;background:rgba(255,255,255,.1);text-decoration:none;overflow:hidden}' + B + ' .l57-card s{display:block;height:100%;border-radius:9px;background:linear-gradient(90deg,var(--b),var(--a))}' + B + ' .l57-card button{min-height:40px;margin:-6px 0 -10px;border:0;background:none;padding:0;color:var(--b);font:600 14px Barlow,sans-serif}' +
    B + ' .l57-stats{display:grid;grid-template-columns:1fr 1fr;gap:16px 18px;margin:24px 0 0}' + B + ' .l57-stats div{margin:0}' + B + ' .l57-stats dt{font-size:40px;line-height:1;color:#fff6e4}' + B + ' .l57-stats dd{margin:4px 0 0;font-size:12px;line-height:1.3;color:#a9a2b8}' +
    B + ' .l57-list{padding:8px 16px 4px}' + B + ' .l57-list h2{margin:14px 4px 10px;font-size:30px;line-height:1;text-transform:uppercase;color:var(--b)}' +
    B + ' .l57-row{display:flex;align-items:center;gap:12px;width:100%;padding:10px;margin:0 0 8px;border-radius:12px;background:rgba(255,255,255,.035);border:1px solid rgba(255,255,255,.06);color:inherit;text-align:left;text-decoration:none;font:inherit}' + B + ' .l57-row.ex{width:calc(100% - 18px);margin-left:18px}' + B + ' .l57-row.rd .tx b{color:#cfc8dc}' +
    B + ' .l57-row .cv{flex:0 0 46px;height:69px;border-radius:5px;background:linear-gradient(160deg,var(--d),#111) center/cover no-repeat;display:flex;align-items:flex-end;overflow:hidden}' + B + ' .l57-row .cv small{padding:4px;font:600 8px/1.1 Barlow,sans-serif;color:#fff}' +
    B + ' .l57-row .tx{flex:1;min-width:0}' + B + ' .l57-row .tx i{display:block;font:600 10px Barlow,sans-serif;letter-spacing:.12em;text-transform:uppercase;font-style:normal;color:var(--b)}' + B + ' .l57-row .tx b{display:block;font:600 18px/1.15 "Barlow Condensed",Barlow,sans-serif;color:#fff}' + B + ' .l57-row .tx small{display:block;margin-top:2px;font-size:12px;color:#a9a2b8}' +
    B + ' .l57-row em{flex:0 0 auto;font:600 11px Barlow,sans-serif;font-style:normal;padding:5px 9px;border-radius:999px;background:rgba(255,255,255,.07);color:#cfc8dc}' + B + ' .l57-row em.now{background:var(--b);color:#1a1012}' + B + ' .l57-row em.next{border:1px solid var(--b);background:none;color:var(--b)}' + B + ' .l57-row em.get{background:none;border:1px dashed rgba(255,255,255,.3)}' + B + ' .l57-row em.done{background:none;color:#8fd0a2}' +
    B + ' .l57-row.soon{border-style:dashed;background:none}' + B + ' .l57-enc{display:flex;justify-content:space-between;align-items:center;width:calc(100% - 32px);margin:12px 16px 0;padding:14px 16px;border-radius:14px;border:1px solid color-mix(in srgb,var(--b) 35%,transparent);background:none;color:#fff;font:600 15px Barlow,sans-serif;text-align:left}' + B + ' .l57-enc span{color:var(--b);font-size:13px}' + B + ' .l57-end{height:calc(env(safe-area-inset-bottom) + 32px)}';
  // typefaces: [family, title weight, title size, line height, other weight, card size, number size, heading size, style]
  const FONTS = { barlow: ['"Barlow Condensed",Impact,sans-serif', 700, 'clamp(54px,18.4vw,88px)', .88, 700, 38, 40, 30], bebas: ['"Bebas Neue","Barlow Condensed",sans-serif', 400, 'clamp(64px,22vw,104px)', .86, 400, 42, 44, 34],
    cinzel: ['Cinzel,serif', 900, '46px', 1, 700, 28, 34, 24], fell: ['"IM Fell English SC",serif', 400, '60px', .92, 400, 29, 40, 30], marcellus: ['"Marcellus SC",serif', 400, '56px', .98, 400, 32, 38, 28],
    cormorant: ['"Cormorant Garamond",serif', 700, '58px', .92, 700, 34, 42, 32], 'cormorant-i': ['"Cormorant Garamond",serif', 600, '58px', .95, 700, 34, 42, 32, 'italic'], garamond: ['"EB Garamond",serif', 600, 'clamp(48px,14.5vw,64px)', .95, 600, 30, 38, 28],
    bungee: ['"Den Bungee","Barlow Condensed",sans-serif', 400, 'clamp(34px,10.6vw,52px)', 1, 400, 26, 34, 26], fraunces: ['Fraunces,serif', 500, '58px', .95, 500, 32, 40, 30] };
  const looks = [];
  Object.entries(FONTS).forEach(([k, f]) => { looks.push(B + '.f-' + k + ' .l57-t{font-family:' + f[0] + ';font-weight:' + f[1] + ';font-size:' + f[2] + ';line-height:' + f[3] + ';font-style:' + (f[8] || 'normal') + ';letter-spacing:' + (k === 'cinzel' ? '.015em' : k === 'marcellus' ? '.03em' : '.005em') + '}');
    looks.push(B + '.f-' + k + ' .l57-card b{font-family:' + f[0] + ';font-weight:' + f[4] + ';font-size:' + f[5] + 'px}' + B + '.sf-' + k + ' .l57-stats dt{font-family:' + f[0] + ';font-weight:' + f[4] + ';font-size:' + f[6] + 'px}' + B + '.sf-' + k + ' .l57-list h2{font-family:' + f[0] + ';font-weight:' + f[4] + ';font-size:' + f[7] + 'px' + (k === 'cinzel' ? ';letter-spacing:.08em' : '') + '}'); });
  looks.push(
    // how the title is drawn
    B + '.x-offset .l57-t{filter:drop-shadow(4px 4px 0 var(--d))}', B + '.x-offset-glow .l57-t{filter:drop-shadow(3px 3px 0 var(--d)) drop-shadow(0 0 26px var(--gl,transparent))}',
    B + '.x-glow .l57-t{filter:drop-shadow(0 2px 0 rgba(0,0,0,.6)) drop-shadow(0 0 18px var(--gl,transparent))}', B + '.x-stroke-glow .l57-t{-webkit-text-stroke:1px rgba(255,236,236,.4);filter:drop-shadow(0 0 22px var(--gl,transparent)) drop-shadow(2px 3px 0 var(--d))}',
    B + '.x-emboss .l57-t{filter:drop-shadow(0 -1px 0 rgba(255,255,255,.35)) drop-shadow(0 3px 0 var(--d)) drop-shadow(0 8px 14px rgba(0,0,0,.55))}', B + '.x-neon .l57-t{filter:drop-shadow(0 0 3px var(--b)) drop-shadow(0 0 16px var(--gl,transparent)) drop-shadow(3px 3px 0 color-mix(in srgb,var(--d) 70%,transparent))}',
    // the covers behind it
    B + '.w-grid .l57-wall{position:absolute;inset:-40% -60% auto -60%;height:150%;display:grid;grid-template-columns:repeat(6,1fr);gap:12px;transform:rotate(-14deg);opacity:.42}' + B + '.w-grid .l57-wall span{aspect-ratio:2/3;border-radius:6px;background:#222 center/cover no-repeat;box-shadow:0 10px 24px rgba(0,0,0,.5)}',
    B + '.w-one .l57-wall{position:absolute;inset:0 -12% 0 28%;opacity:.6}' + B + '.w-one .l57-wall span{position:absolute;inset:0;background:center/cover no-repeat;-webkit-mask-image:linear-gradient(90deg,transparent,#000 45%,#000 80%,transparent);mask-image:linear-gradient(90deg,transparent,#000 45%,#000 80%,transparent);filter:grayscale(.35)}',
    B + '.w-fan .l57-wall{position:absolute;top:-6px;right:-40px;width:330px;height:330px;opacity:.5}' + B + '.w-fan .l57-wall span{position:absolute;top:24px;left:50%;width:116px;height:174px;margin-left:-58px;border-radius:5px;background:#222 center/cover no-repeat;box-shadow:0 10px 24px rgba(0,0,0,.5);transform-origin:50% 165%;transform:rotate(calc((var(--i) - (var(--n) - 1) / 2) * 12deg))}',
    B + '.w-strip .l57-wall{position:absolute;left:-30px;right:-30px;top:40%;display:flex;gap:10px;transform:rotate(-7deg);opacity:.38}' + B + '.w-strip .l57-wall span{flex:0 0 104px;height:156px;border-radius:5px;background:#222 center/cover no-repeat;box-shadow:0 10px 24px rgba(0,0,0,.5)}',
    // textures
    B + '.t-rain .l57-tex{background:repeating-linear-gradient(-62deg,rgba(170,205,255,.075) 0 1.5px,transparent 1.5px 34px),radial-gradient(90% 55% at 85% 0%,rgba(80,130,220,.3),transparent 70%)}',
    B + '.t-ash .l57-tex{background:radial-gradient(rgba(255,255,255,.24) 1px,transparent 1.6px) 0 0/26px 26px,radial-gradient(rgba(255,255,255,.13) 1px,transparent 1.6px) 13px 9px/31px 31px,radial-gradient(70% 38% at 18% 22%,rgba(225,225,238,.13),transparent 70%),radial-gradient(65% 32% at 82% 58%,rgba(225,225,238,.11),transparent 70%)}',
    B + '.t-snow .l57-tex{background:radial-gradient(rgba(235,245,255,.32) 1.2px,transparent 2px) 0 0/29px 33px,radial-gradient(rgba(235,245,255,.18) 1px,transparent 1.7px) 11px 17px/41px 37px,radial-gradient(80% 45% at 80% 10%,rgba(120,170,255,.2),transparent 70%)}',
    B + '.t-shards .l57-tex{background:conic-gradient(from 200deg at 80% 16%,rgba(255,255,255,.08) 0 8deg,transparent 8deg 30deg,rgba(255,255,255,.05) 30deg 37deg,transparent 37deg 68deg,rgba(255,255,255,.07) 68deg 74deg,transparent 74deg),radial-gradient(80% 50% at 10% 0%,color-mix(in srgb,var(--c) 32%,transparent),transparent 70%);-webkit-mask-image:linear-gradient(180deg,#000 30%,transparent 62%);mask-image:linear-gradient(180deg,#000 30%,transparent 62%)}',
    B + '.t-scan .l57-tex{background:repeating-linear-gradient(0deg,rgba(255,255,255,.045) 0 1px,transparent 1px 4px),radial-gradient(90% 60% at 85% 8%,color-mix(in srgb,var(--d) 30%,transparent),transparent 70%)}',
    B + '.t-stars .l57-tex{background:radial-gradient(rgba(255,255,255,.6) .8px,transparent 1.4px) 0 0/37px 41px,radial-gradient(rgba(255,255,255,.32) .7px,transparent 1.3px) 17px 23px/53px 47px,radial-gradient(rgba(255,255,255,.5) 1px,transparent 1.6px) 29px 7px/89px 97px,radial-gradient(70% 50% at 75% 8%,color-mix(in srgb,var(--b) 26%,transparent),transparent 70%)}',
    B + '.t-waves .l57-tex{background:repeating-radial-gradient(ellipse 140% 60% at 50% 135%,transparent 0 22px,color-mix(in srgb,var(--b) 10%,transparent) 22px 24px),radial-gradient(80% 50% at 20% 0%,color-mix(in srgb,var(--c) 22%,transparent),transparent 70%)}',
    B + '.t-dust .l57-tex{background:radial-gradient(rgba(255,120,90,.26) 1px,transparent 1.8px) 0 0/19px 23px,radial-gradient(rgba(255,200,150,.13) 1px,transparent 1.8px) 9px 11px/29px 31px,linear-gradient(115deg,transparent 35%,color-mix(in srgb,var(--c) 20%,transparent) 55%,transparent 75%)}',
    B + '.t-rings .l57-tex{background:repeating-radial-gradient(circle at 88% 14%,transparent 0 26px,color-mix(in srgb,var(--b) 16%,transparent) 26px 27.5px),radial-gradient(60% 40% at 88% 14%,color-mix(in srgb,var(--b) 22%,transparent),transparent 70%);-webkit-mask-image:linear-gradient(180deg,#000 35%,transparent 75%);mask-image:linear-gradient(180deg,#000 35%,transparent 75%)}',
    B + '.t-steel .l57-tex{background:repeating-linear-gradient(100deg,rgba(255,255,255,.035) 0 1px,transparent 1px 7px),repeating-linear-gradient(80deg,rgba(0,0,0,.28) 0 1px,transparent 1px 11px),radial-gradient(70% 45% at 85% 5%,color-mix(in srgb,var(--c) 26%,transparent),transparent 70%)}',
    B + '.t-scales .l57-tex{background:radial-gradient(circle at 50% 0,transparent 9px,color-mix(in srgb,var(--b) 16%,transparent) 10px,transparent 11.5px) 0 0/22px 14px,radial-gradient(70% 45% at 80% 10%,color-mix(in srgb,var(--c) 30%,transparent),transparent 70%);-webkit-mask-image:linear-gradient(180deg,#000 25%,transparent 70%);mask-image:linear-gradient(180deg,#000 25%,transparent 70%)}',
    B + '.t-bokeh .l57-tex{background:radial-gradient(circle at 14% 22%,rgba(127,227,255,.2) 0 14px,transparent 15px),radial-gradient(circle at 72% 14%,rgba(255,79,163,.18) 0 22px,transparent 23px),radial-gradient(circle at 88% 38%,rgba(127,227,255,.14) 0 10px,transparent 11px),radial-gradient(circle at 40% 9%,rgba(255,214,120,.14) 0 8px,transparent 9px),radial-gradient(circle at 60% 46%,rgba(255,79,163,.12) 0 12px,transparent 13px),linear-gradient(0deg,color-mix(in srgb,var(--d) 22%,transparent),transparent 40%)}',
    B + '.t-halftone .l57-tex{background:radial-gradient(color-mix(in srgb,var(--b) 32%,transparent) 1.5px,transparent 2px) 0 0/9px 9px;-webkit-mask-image:linear-gradient(200deg,#000 10%,transparent 55%);mask-image:linear-gradient(200deg,#000 10%,transparent 55%)}',
    B + '.t-mail .l57-tex{background:radial-gradient(circle,transparent 3px,rgba(255,255,255,.055) 3.5px,transparent 4.6px) 0 0/9px 9px,radial-gradient(70% 45% at 85% 5%,color-mix(in srgb,var(--c) 28%,transparent),transparent 70%);-webkit-mask-image:linear-gradient(180deg,#000 30%,transparent 72%);mask-image:linear-gradient(180deg,#000 30%,transparent 72%)}',
    B + '.t-slash .l57-tex{background:linear-gradient(118deg,transparent 47%,color-mix(in srgb,var(--d) 75%,transparent) 47.3% 48.6%,transparent 49%),linear-gradient(118deg,transparent 52%,color-mix(in srgb,var(--d) 35%,transparent) 52.2% 52.7%,transparent 53%);-webkit-mask-image:linear-gradient(180deg,#000 35%,transparent 60%);mask-image:linear-gradient(180deg,#000 35%,transparent 60%)}',
    // the "your place" box
    B + '.c-sharp .l57-card{border-radius:3px;border-color:color-mix(in srgb,var(--b) 55%,transparent);background:color-mix(in srgb,var(--bg) 82%,#000)}',
    B + '.c-glass .l57-card{border:1px solid rgba(255,255,255,.24);border-radius:4px;background:rgba(255,255,255,.06);-webkit-backdrop-filter:blur(12px);backdrop-filter:blur(12px)}',
    B + '.c-panel .l57-card{border:0;border-top:2px solid var(--b);border-radius:4px;background:linear-gradient(180deg,rgba(255,255,255,.05),rgba(0,0,0,.25)),color-mix(in srgb,var(--bg) 70%,#222)}',
    B + '.c-chunky .l57-card{border:2px solid var(--d);border-radius:20px;background:linear-gradient(180deg,color-mix(in srgb,var(--d) 18%,transparent),rgba(0,0,0,.1)),color-mix(in srgb,var(--bg) 80%,var(--d) 20%);box-shadow:0 0 0 4px color-mix(in srgb,var(--d) 14%,transparent),0 18px 40px -18px rgba(0,0,0,.7)}' + B + '.c-chunky .l57-add{border-radius:12px;box-shadow:0 4px 0 color-mix(in srgb,var(--d) 70%,#000)}' + B + '.c-chunky .l57-row{border-radius:16px;border-color:color-mix(in srgb,var(--d) 30%,transparent)}' + B + '.c-chunky .l57-stats dt{color:var(--a)}',
    B + '.c-parchment .l57-card{border-radius:2px;border:1px solid color-mix(in srgb,var(--b) 35%,transparent);background:linear-gradient(180deg,#221a14,#16100c);box-shadow:inset 0 0 0 4px rgba(0,0,0,.25),inset 0 0 0 5px color-mix(in srgb,var(--b) 18%,transparent),0 18px 40px -18px rgba(0,0,0,.7)}' + B + '.c-parchment .l57-row{border-radius:2px}',
    B + '.c-sharp .l57-row,' + B + '.c-glass .l57-row,' + B + '.c-panel .l57-row{border-radius:4px}',
    // markers
    B + '.m-diamond .l57-card i:before{border-radius:1px;transform:rotate(45deg)}', B + '.m-diamond-o .l57-card i:before{border-radius:0;transform:rotate(45deg);background:none;border:1.5px solid currentColor}',
    B + '.m-flame .l57-card i:before{width:6px;height:9px;border-radius:50% 50% 50% 50%/62% 62% 38% 38%}', B + '.m-star .l57-card i:before{width:9px;height:9px;border-radius:0;clip-path:polygon(50% 0,61% 39%,100% 50%,61% 61%,50% 100%,39% 61%,0 50%,39% 39%)}',
    B + '.m-tri .l57-card i:before{width:9px;height:8px;border-radius:0;clip-path:polygon(50% 0,100% 100%,0 100%)}', B + '.m-bar .l57-card i:before{width:14px;height:3px;border-radius:2px}');
  try { const st = document.createElement('style'); st.id = 'l57css'; st.textContent = css + looks.join(''); document.head.appendChild(st); } catch (e) {}
})();

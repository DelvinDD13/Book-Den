// ===== L59: the bookcase. One of the Books views (its button stands first in the row of Genre, Series, Status...). It takes
//   the place of the grid and stays the chosen view until he picks one of the grid views. Three bookcases behind three tabs,
//   drawn the same way: the books he owns by category, the books he has finished by year, and his 2027 plan (L56) by season.
//   Every book is the same book-shaped cover (two wide to three tall), three to a shelf, showing its real cover whole. A cover
//   that is not that shape (about one in five is square or narrower) sits whole on the book over a wash of its own colours.
//   No lettering on a book that has a cover; a book with none is a cloth cover with its title, measured so it is shortened at
//   a word and never cut. Marks on a cover: a gold seal when finished, a ribbon on the book he is on or in, a brass seal on the
//   book that closes a series in the plan. A book that is not out yet is a wrapped parcel with its day on the tag, a book that
//   is not in his library is an outline, the open spots are the empty shelf between two bookends, and the Backlog Breaker medal
//   stands at the end of the last shelf. Tapping a book opens its page, like the grid. The page carries no explaining text.
//   The plan tab has one row: a menu of the plans from his 2027 deck (the one the app starts with and three more, defined as
//   data: what leaves and which series take its hours) and Blank, then Use and Edit. Edit works on a copy: a minus on every
//   book, a minus and a plus on the open room, Add on each season, and a tapped book gives the months and Earlier / Later.
//   Use and Save hand the plan to L56, and from then it is the 2027 plan across the app. Looking at a plan changes nothing.
//   Also reached from the 2027 page in the quest log ("Change plan") and from the address ending #bookcase. Nothing moves.
(function () {
  if (!window.L56 || !L56.slots || typeof ALL_TITLES === 'undefined') return;
  const L59 = window.L59 = {};
  const esc = s => String(s == null ? '' : s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const nrm = s => String(s || '').toLowerCase().replace(/&/g, 'and').replace(/[^a-z0-9 ]/g, '').replace(/\s+/g, ' ').trim();
  const MON = L56.MON || ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  const SEAS = ['Winter', 'Spring', 'Summer', 'Fall']; const seasonOf = m => m < 3 ? 0 : m < 6 ? 1 : m < 9 ? 2 : 3;
  const BOOK = t => !/^(show|game|cv|hk|ab|gr|badges):/.test(t);
  const speed = () => { try { return L56.speed() || 1; } catch (e) { return 1; } };
  const hm = m => { m = Math.max(0, Math.round(m)); return Math.floor(m / 60) + ' h ' + String(m % 60).padStart(2, '0') + ' m'; };
  const md = d => MON[+String(d).slice(5, 7) - 1].slice(0, 3) + ' ' + (+String(d).slice(8, 10));
  const full = d => /^\d{4}-\d{2}-\d{2}$/.test(String(d || ''));
  const JULY = '2027-07-01';
  const lenOf = t => { try { return L46.len(t) || 0; } catch (e) { return 0; } };
  // an open spot is as wide as his median book
  const median = () => { try { const L = ALL_TITLES.map(lenOf).filter(Boolean).sort((a, b) => a - b); if (L.length) return L[Math.floor(L.length / 2)]; } catch (e) {} return 540 * speed(); };
  // the cover the app already has for a book: his own art first, then the checked store cover, then the small one in the page
  const art = t => { if (!t) return '';
    try { if (window.L10 && L10.ART && L10.ART[t] && ART[t]) return ART[t]; } catch (e) {}
    try { const c = getOverride('cv:' + t) || {}; if (c.url) return window.L11 && L11.sized ? L11.sized(c.url, false) : c.url; } catch (e) {}
    try { if (ART[t]) return ART[t]; if (COVERS[t] && COVERS[t].cover_data) return COVERS[t].cover_data; } catch (e) {} return ''; };
  const cloth = t => { let h = 0; t = String(t); for (let i = 0; i < t.length; i++) h = (h * 31 + t.charCodeAt(i)) >>> 0; return 'hsl(' + (h % 360) + ' 34% ' + (24 + h % 9) + '%)'; };
  const short = t => String(t).replace(/\s*[\[(][^\])]*[\])]/g, '').split(':')[0].trim();
  const bare = s => String(s).replace(/^(the|a|an)\s+/i, '');
  // a title without its series in front ("The Farseer: Assassin's Apprentice" is "Assassin's Apprentice" on a Farseer shelf)
  const nice = (t, s) => { const p = String(t).split(/:\s*/); if (s && p.length > 1) { const a = nrm(p[0]).replace(/^the /, ''), sr = nrm(s).replace(/^the /, ''); if (a && (sr.indexOf(a) >= 0 || a.indexOf(sr) >= 0)) return p[1].replace(/\s*[\[(][^\])]*[\])]/g, '').split(',')[0].trim() || short(t); } return short(t); };
  const mono = s => { const w = bare(s).split(/[^A-Za-z0-9]+/).filter(x => x && !/^(of|the|and|a|an|to|in)$/i.test(x)); return ((w[0] || '?')[0] + (w[1] ? w[1][0] : '')).toUpperCase(); };
  // lettering is measured, not guessed: the width of a word in the spine's own type
  let mctx = null; const meas = (t, px) => { try { if (!mctx) mctx = document.createElement('canvas').getContext('2d'); mctx.font = '600 ' + px + 'px "Barlow Condensed", Barlow, sans-serif'; return mctx.measureText(t).width + t.length * px * .012; } catch (e) { return t.length * px * .56; } };
  // how many lines the words take set down a spine h tall (Infinity when one word alone is too long for it)
  const linesFor = (text, h, px) => { const sw = meas(' ', px); let n = 1, cur = 0; for (const w of text.split(/\s+/)) { const ww = meas(w, px); if (ww > h) return Infinity; if (!cur) cur = ww; else if (cur + sw + ww <= h) cur += sw + ww; else { n++; cur = ww; } } return n; };
  // a title set in lines of a given length: all of it if it fits in the lines allowed, else shortened only between words, or left off if not even the first word fits
  const fitLines = (name, len, max, px) => { if (linesFor(name, len, px) <= max) return name; const words = name.split(/\s+/); while (words.length > 1) { words.pop(); const t = words.join(' ').replace(/[\s,:;'’&-]+$/, '') + '…'; if (linesFor(t, len, px) <= max) return t; } return ''; };
  // a thick spine can set its title across instead: the largest size, from 13 down to 9.5, at which the whole title fits the lines
  // there is room for; if it never all fits, the smallest size, shortened between words
  const across = (name, w, room, top) => { const len = (w - 12) * .97; let last = null; for (let fs = top || 13; fs >= 9.5; fs -= .5) { const lw = name.split(/\s+/).reduce((a, x) => Math.max(a, meas(x, fs)), 0); if (lw > len) continue; const max = Math.max(1, Math.floor(room / (fs * 1.13))); if (linesFor(name, len, fs) <= max) return { fs, t: name, all: true }; last = { fs, t: fitLines(name, len, max, fs), all: false }; } return last && last.t ? last : null; };
  const book = (t, name, o) => { const min = lenOf(t); const x = Object.assign({ k: 'book', t, name, min, art: art(t), read: false }, o || {});
    try { x.get = (META[t] || {}).gr === true; } catch (e) {} try { x.now = getStatus(t) === 'currently-reading'; x.pct = +(getOverride(t) || {}).progress || 0; } catch (e) {} return x; };

  // ---- 1. the 2027 plan as things on a shelf ----
  L59.data = function (pretend, other) { const S = L56.slots(other); const sp = speed(); const up = window.L58 || null; const med = median();
    const doneAt = {}; try { L56.done().forEach(x => { doneAt[x.id] = x.d; }); } catch (e) {}
    // the series of each spot: his library's for a book he has, else the series page that lists it
    const ser = {}, byName = {}; S.forEach(x => { try { const s = x.t && SERIES_OF[x.t]; if (s && s !== 'Standalone / Other') ser[x.id] = s; } catch (e) {} });
    [...new Set(Object.values(ser))].forEach(s => { try { L57.data(s).R.forEach(r => { if (!r.up) byName[nrm(r.title)] = s; }); } catch (e) {} });
    S.forEach(x => { if (!ser[x.id] && !x.open) { const s = byName[nrm(x.name)]; if (s) ser[x.id] = s; } });
    const notOut = x => { if (x.t || x.open) return null; try { const u = up && up.find('books', x.name); if (!u || up.out(u)) return null; if (pretend && full(u.date) && u.date < JULY) return null; return u; } catch (e) { return null; } };
    const Z = SEAS.map((n, i) => ({ i, n, items: [], room: 0, min: 0, books: 0 })); const all = [];
    S.forEach(x => { const z = Z[seasonOf(x.m)]; const empty = x.open && !x.t && !x.drop;
      if (empty && !(pretend && x.m < 6)) { z.room++; return; }
      const read = pretend ? x.m < 6 : !!doneAt[x.id]; const u = notOut(x); const min = x.min || (empty ? med : 0);
      const it = { k: empty ? 'pick' : u ? 'parcel' : x.t ? 'book' : 'ghost', id: x.id, m: x.m, name: empty ? 'Your pick' : x.name, t: x.t || null, min, read, d: pretend ? null : doneAt[x.id] || null,
        open: !!x.open, date: u && full(u.date) ? u.date : '', note: x.note || '', ser: ser[x.id] || '' };
      if (it.t) { it.art = art(it.t); try { it.get = (META[it.t] || {}).gr === true; } catch (e) {} try { it.now = getStatus(it.t) === 'currently-reading'; it.pct = +(getOverride(it.t) || {}).progress || 0; } catch (e) {} }
      z.items.push(it); all.push(it); if (!empty) { z.min += min; z.books++; } });
    // books in his series with a day in 2027 that are not out yet: parcels waiting in the open part of their season
    const soon = []; try { const P = (other || L56.plan()).P || []; (up ? up.watch(2027) : []).forEach(u => { if (P.some(e => nrm(e[1]) === nrm(u.title))) return; if (!full(u.date)) { soon.push(u.title); return; } if (pretend && u.date < JULY) return;
        const m = +u.date.slice(5, 7) - 1; const min = +u.minutes || med; Z[seasonOf(m)].items.push({ k: 'parcel', id: 'w:' + nrm(u.title), m, name: u.title, t: null, min, read: false, date: u.date, extra: true, note: u.series && u.title.indexOf(u.series) < 0 ? u.series : '', ser: '' }); }); } catch (e) {}
    // the book he is on: the first one in the plan he has not finished
    const cur = all.find(x => !x.read && x.k !== 'parcel' && x.k !== 'pick') || null; if (cur) cur.cur = true;
    // a series is closed once every plan book in it is read: the last of them carries its seal
    const bySer = {}; all.forEach(x => { if (x.ser) (bySer[x.ser] = bySer[x.ser] || []).push(x); });
    Object.keys(bySer).forEach(s => { const L = bySer[s]; if (!L.every(x => x.read)) return; const last = L[L.length - 1]; const when = pretend ? MON[last.m] : (L.map(x => x.d).filter(Boolean).sort().pop() || ''); last.closes = { name: s, n: L.length, when: pretend ? when : (when ? md(when) : '') }; });
    const nDone = pretend ? all.filter(x => x.read).length : Object.keys(doneAt).length;
    return { Z, all, soon, cur, total: S.length, set: S.filter(x => !x.open).length, min: S.filter(x => !x.open).reduce((a, x) => a + x.min, 0), done: nDone, sp, med, pretend: !!pretend }; };

  // ---- the plans to choose from. A is the plan the app starts with. The others are data: the series that leaves it (all of it, or
  // all after its first few books) and the series that take the hours it frees, in order; unread books only, each series in the
  // order its own page gives, packed into the freed months by listening time ----
  const TPL = [{ key: 'A', name: 'The Wheel' },
    { key: 'B', name: 'Finish what’s open', drop: 'The Wheel of Time', add: ['Red Rising Saga', 'The First Law World', 'Villains', 'The Hunger Games', "Stephen Fry's Great Mythology", 'The Chronicles of Narnia', 'Inkworld', 'The Folk of the Air'] },
    { key: 'C', name: 'Half the Wheel', drop: 'The Wheel of Time', keep: 6, add: ['Red Rising Saga', 'The First Law World'] },
    { key: 'D', name: 'Shelf sweep', drop: 'The Wheel of Time', add: ['The Folk of the Air', 'Inkworld', 'Villains', 'The Hunger Games', 'The Chronicles of Narnia', 'Shattered Sea', "Stephen Fry's Great Mythology", 'Arc of a Scythe', 'The Drowning Empire', 'The Belgariad', 'The Bloodsworn Saga', 'Shadow of the Leviathan'] }];
  const rx = t => '^' + String(t).replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '$';
  const slug = n => 's:' + String(n).toLowerCase().replace(/[^a-z0-9]+/g, '-');
  L59.template = function (key) { const T = TPL.find(t => t.key === key); if (!T) return null; const set0 = L56.P0.map(e => e.slice()), open = L56.OPEN0.map(o => o[0]); if (!T.drop) return { key, name: T.name, set: set0, open };
    let rows = []; try { rows = L57.data(T.drop).R.filter(r => !r.up); } catch (e) {} const names = new Set(rows.map(r => nrm(r.title))), keep = new Set(rows.filter(r => !r.extra).slice(0, T.keep || 0).map(r => nrm(r.title)));
    const out = e => names.has(nrm(e[1])) && !keep.has(nrm(e[1])); const minOf = e => { let m = 0; try { if (e[2]) { const re = new RegExp(e[2]); ALL_TITLES.forEach(t => { if (BOOK(t) && re.test(t)) m = Math.max(m, lenOf(t)); }); } } catch (x) {} return m || +e[3] || 0; };
    const freed = {}; set0.forEach(e => { if (out(e)) freed[e[0]] = (freed[e[0]] || 0) + minOf(e); }); const months = Object.keys(freed).map(Number).sort((a, b) => a - b); const set = set0.filter(e => !out(e)); const have = new Set(set.map(e => nrm(e[1])));
    const add = []; T.add.forEach(sn => { let R = []; try { R = L57.data(sn).R; } catch (e) {} R.forEach(r => { if (r.up || r.run > 1 || r.st === 'read' || have.has(nrm(r.title))) return; have.add(nrm(r.title)); add.push([0, r.title, r.t ? rx(r.t) : null, r.min || 0, '']); }); });
    let k = 0, used = 0; add.forEach(e => { const m = e[3] || 600; while (k < months.length - 1 && used + m / 2 > freed[months[k]]) { k++; used = 0; } e[0] = months.length ? months[k] : 11; used += m; set.push(e); });
    return { key, name: T.name, set, open }; };
  L59.templates = () => TPL.map(t => ({ key: t.key, name: t.name }));

  // ---- 2. the books he owns, a case for each category, a series kept together and in its order ----
  L59.owned = function () { const cats = {}; let order = []; try { order = ORDERS.genre.slice(); } catch (e) {} ALL_TITLES.forEach(t => { if (!BOOK(t)) return; let m = {}; try { m = META[t] || {}; } catch (e) {} if (m.gr === true || m.added) return;
      let g = 'Other'; try { g = GENRE_OF[t] || 'Other'; if (order.indexOf(g) < 0) { const n = {}; const src = (seriesEntries(SERIES_OF[t] || '') || []).length ? SERIES_OF[t] : g; (seriesEntries(src) || []).forEach(e => { const k = GENRE_OF[e]; if (k && order.indexOf(k) >= 0) n[k] = (n[k] || 0) + 1; }); g = Object.keys(n).sort((a, b) => n[b] - n[a])[0] || g; } } catch (e) {} if (g === 'Want to Read' || g === 'Upcoming') return; (cats[g] = cats[g] || []).push(t); });
    const names = Object.keys(cats).sort((a, b) => { const i = order.indexOf(a), j = order.indexOf(b); return (i < 0 ? 999 : i) - (j < 0 ? 999 : j) || (a < b ? -1 : 1); });
    const serOf = t => { try { const s = SERIES_OF[t]; return s && s !== 'Standalone / Other' ? s : ''; } catch (e) { return ''; } }; const pos = {}; const at = (s, t) => { if (!pos[s]) { pos[s] = {}; try { seriesEntries(s).forEach((e, i) => { pos[s][e] = i; }); } catch (e) {} } return pos[s][t] == null ? 999 : pos[s][t]; };
    let n = 0, min = 0; const Z = names.map(g => { const L = cats[g].map(t => { const s = serOf(t); let read = false, d = ''; try { read = getStatus(t) === 'read'; d = String((getOverride(t) || {}).finished || '').slice(0, 10); } catch (e) {} return book(t, nice(t, s), { ser: s, read, d: read ? d : '', cat: g }); });
        const cnt = {}; L.forEach(x => { if (x.ser) cnt[x.ser] = (cnt[x.ser] || 0) + 1; }); L.forEach(x => { x.tag = x.ser && cnt[x.ser] > 1 ? x.ser : ''; });
        L.sort((a, b) => { const A = a.tag ? '0' + nrm(bare(a.ser)) : '1', B = b.tag ? '0' + nrm(bare(b.ser)) : '1'; if (A !== B) return A < B ? -1 : 1; if (a.tag) { const d = at(a.ser, a.t) - at(b.ser, b.t); if (d) return d; } const x = nrm(bare(a.name)), y = nrm(bare(b.name)); return x < y ? -1 : x > y ? 1 : 0; });
        n += L.length; const m = L.reduce((s, x) => s + x.min, 0); min += m; return { n: g.replace(/^.*—\s*/, ''), full: g, items: L, min: m, books: L.length }; });
    return { Z, n, min, sp: speed() }; };

  // ---- 3. the books he has finished, a case for each year, in the order he finished them ----
  L59.finished = function () { const seen = {}; const L = []; ALL_TITLES.forEach(t => { if (!BOOK(t)) return; let read = false; try { read = getStatus(t) === 'read'; } catch (e) {} if (!read) return;
      let k = t; try { const v = L46.versions(t); if (v && v.length) k = v.slice().sort()[0]; } catch (e) {} let d = ''; try { d = String((getOverride(t) || {}).finished || '').slice(0, 10); } catch (e) {} if (!full(d)) d = '';
      if (seen[k]) { const o = seen[k]; if (d && (!o.d || d < o.d)) o.d = d; if (!o.min && lenOf(t)) o.min = lenOf(t); if (!o.art && art(t)) { o.art = art(t); o.t = t; } return; }
      let s = ''; try { s = SERIES_OF[t] && SERIES_OF[t] !== 'Standalone / Other' ? SERIES_OF[t] : ''; } catch (e) {} const x = book(t, nice(t, s), { read: true, d, ser: s }); seen[k] = x; L.push(x); });
    const by = {}; L.forEach(x => { const y = x.d ? x.d.slice(0, 4) : ''; (by[y] = by[y] || []).push(x); });
    const Z = Object.keys(by).sort((a, b) => (a === '') - (b === '') || (a < b ? 1 : -1)).map(y => { const I = by[y]; if (y) I.sort((a, b) => a.d < b.d ? -1 : a.d > b.d ? 1 : 0); else I.sort((a, b) => { const A = nrm(bare(a.ser || a.name)) + ' ' + nrm(a.name), B = nrm(bare(b.ser || b.name)) + ' ' + nrm(b.name); return A < B ? -1 : A > B ? 1 : 0; });
      I.forEach(x => { x.tag = y ? MON[+x.d.slice(5, 7) - 1].slice(0, 3) : ''; }); return { n: y || 'Earlier', full: y || 'No finish date', items: I, min: I.reduce((s, x) => s + x.min, 0), books: I.length }; });
    return { Z, n: L.length, min: L.reduce((s, x) => s + x.min, 0), sp: speed() }; };

  // ---- drawing: every book the same cover-shaped book, three to a shelf ----
  let host = null, view = 'owned', mode = false, D = null, IT = [], picked = -1; const KEY = 'den:case', $ = id => document.getElementById(id);
  // which plan is on the shelves ('use' is his own saved plan), the copy being edited, and whether "Use this plan" has had its first tap
  let sel = 'A', work = null, arm = false, adding = -1;
  const own = () => { try { return !!L56.plan().own; } catch (e) { return false; } };
  const asPlan = t => ({ P: t.set, OPEN: t.open.slice().sort((a, b) => a - b).map(m => [m, seasonOf(m)]) });
  const shown = () => { if (work) return asPlan(work); if (sel === 'use' || sel === inUse()) return undefined; const t = L59.template(sel); return t ? asPlan(t) : undefined; };
  const inUse = () => { if (!own()) return 'A'; let n = ''; try { n = L56.plan().name; } catch (e) {} const T = TPL.find(t => t.key !== 'A' && t.name === n); return T ? T.key : 'use'; };   // one of the four taken as it is keeps its own chip
  const on = () => { try { return !!(host && host.classList.contains('on') && currentView === 'case'); } catch (e) { return false; } };
  // a cover that is not two-to-three sits whole on the book over a wash of itself (the same cover asked for very small and stretched)
  const offShape = t => { try { const c = getOverride('cv:' + t) || {}; return +c.w > 0 && +c.h > 0 && Math.abs(c.w / c.h - 2 / 3) > .03; } catch (e) { return false; } };
  const tiny = u => /mzstatic\.com\//.test(u) ? u.replace(/\/[0-9]+x[0-9]+[a-z]*(-[0-9]+)?\.(jpg|png|webp)$/i, '/24x36bb.jpg') : '';
  L59.lit = function (img) { try { const p = img.closest('.l59-bk'); if (!p) return; p.classList.add('ok'); const c = p.querySelector('.cv'); if (c && c.dataset.w) c.style.backgroundImage = 'url("' + c.dataset.w.replace(/"/g, '%22') + '")'; } catch (e) {} };
  function thing(x, i, cw, H) { const has = x.k === 'book' && !!x.art; let inner = '';
    if (x.k === 'parcel') inner = x.date ? '<em>' + esc(md(x.date)) + '</em>' : '';
    else { const a = across(x.name, cw - 4, H - 44, 15); inner = (a ? '<b style="font-size:' + a.fs + 'px">' + esc(a.t) + '</b>' : '') + (has ? '<img src="' + esc(x.art) + '" alt="" loading="lazy" decoding="async" onload="L59.lit(this)" onerror="this.remove()">' : ''); }
    const marks = (x.read ? '<u></u>' : x.get ? '<s>get</s>' : '') + ((x.cur || x.now) && !x.read ? '<i class="rb"></i>' : '') + (x.closes ? '<b class="sl">' + esc(mono(x.closes.name)) + '</b>' : '');
    const kind = x.k === 'parcel' ? ' pc' : x.k === 'ghost' ? ' gh' : x.k === 'pick' ? ' pick' : '', say = x.k === 'parcel' ? ', not out yet' : x.k === 'ghost' ? ', not in your library' : x.cur ? ', the book you are on' : '', w = has && offShape(x.t) ? tiny(x.art) : '';
    return '<button class="l59-bk' + kind + (x.cur ? ' cur' : '') + (x.read ? ' rd' : '') + '" data-l59i="' + i + '" style="width:' + cw + 'px;height:' + H + 'px;--c:' + (x.k === 'pick' ? '#4a4458' : cloth(x.name)) + '" aria-label="' + esc(x.name) + say + '"><span class="cv"' + (w ? ' data-w="' + esc(w) + '"' : '') + '>' + inner + marks + '</span></button>'; }
  // one case: its brass plate, its shelves three books across, and paper tags on the shelf edge where a new month or series starts
  function drawCase(name, sub, L, G, tagOf, id, extra) { const rows = [[]]; let used = 0; const fits = w => used + (rows[rows.length - 1].length ? G.gap : 0) + w <= G.W;
    L.forEach(o => { if (!fits(o.ow) && rows[rows.length - 1].length) { const left = G.W - used - G.gap; if (o.mk && left >= o.min) Object.assign(o, o.mk(left)); else { rows.push([]); used = 0; } } used += (rows[rows.length - 1].length ? G.gap : 0) + o.ow; rows[rows.length - 1].push(o); });
    let h = '<div class="l59-sea"' + (id ? ' id="' + id + '"' : '') + '><b>' + esc(name) + '</b><span>' + esc(sub) + '</span>' + (extra || '') + '</div><div class="l59-case">', last = null;
    rows.forEach(r => { let x = 0, end = -99, tags = '', rm = ''; r.forEach(o => { const key = o.x ? tagOf(o.x) : undefined; if (o.rm != null) rm += '<button class="l59-rm" data-l59rm="' + o.rm + '" style="left:' + (x + o.ow - 44) + 'px" aria-label="Remove ' + esc(o.x.name) + '"><i></i></button>';
        if (key !== undefined && key !== last) { last = key; if (key) { const t = key.length > 19 ? key.slice(0, 18).replace(/\s+$/, '') + '…' : key; const tx = Math.max(x + 2, end + 4), tw = t.length * 5.5 + 9; if (tx + tw <= G.W && tx <= x + Math.max(o.ow, 26)) { tags += '<i style="left:' + tx + 'px">' + esc(t) + '</i>'; end = tx + tw; } } } x += o.ow + G.gap; });
      h += '<div class="l59-sh" style="height:' + (G.H + 12) + 'px;gap:' + G.gap + 'px">' + r.map(o => o.h).join('') + rm + '</div><div class="l59-bd">' + tags + '</div>'; });
    return h + '</div>'; }
  function html() { const W = Math.max(280, Math.min(430, document.documentElement.clientWidth || window.innerWidth || 390) - 42), gap = 12, cw = Math.floor((W - 2 * gap) / 3), H = Math.round(cw * 1.5), G = { W, gap, cw, H }; IT = []; const sp = D.sp;
    const hrs = m => Math.round(m / 60 / sp);
    const put = z => z.items.filter(x => !(work && x.extra)).map(x => { IT.push(x); const i = IT.length - 1; return { x, i, ow: cw, h: thing(x, i, cw, H), rm: work && entryOf(x) ? i : null }; }); const stat = z => z.books + (z.books === 1 ? ' book, ' : ' books, ') + hrs(z.min) + ' h';
    let h = '';
    if (view === 'plan') { const use = inUse(); const opts = (use === 'use' ? [{ key: 'use', name: L56.plan().name || 'My plan' }] : []).concat(TPL.map(t => ({ key: t.key, name: t.key + ' ' + t.name })), [{ key: 'new', name: 'Blank' }]);
      h += work ? '<div class="l59-act"><button data-l59="save" class="go"' + (work.set.length ? '' : ' disabled') + '>Save</button><button data-l59="cancel">Cancel</button></div>'
        : '<div class="l59-act"><select id="l59sel" aria-label="Plan">' + opts.map(c => '<option value="' + c.key + '"' + (sel === c.key ? ' selected' : '') + '>' + esc(c.name) + (c.key === use ? ' ✓' : '') + '</option>').join('') + '</select>' + (sel !== use ? '<button data-l59="use" class="go">' + (arm ? 'Confirm' : 'Use') + '</button>' : '') + '<button data-l59="edit">Edit</button></div>';
      D.Z.forEach(z => { const L = put(z);
        if (z.room) { IT.push({ k: 'room', n: z.room, se: z.n }); const gi = IT.length - 1; const mk = w => ({ ow: w, h: work ? '<div class="l59-gap ed" style="width:' + w + 'px;height:' + H + 'px"><i></i><button data-l59om="' + z.i + '" aria-label="One fewer open in ' + z.n + '"><b class="mi"></b></button><span>' + z.room + ' open</span><button data-l59op="' + z.i + '" aria-label="One more open in ' + z.n + '"><b class="pl"></b></button><i></i></div>'
          : '<button class="l59-gap" data-l59i="' + gi + '" style="width:' + w + 'px;height:' + H + 'px" aria-label="' + z.room + ' open"><i></i><span>' + z.room + ' open</span><i></i></button>' }); L.push(Object.assign(mk(Math.min(W, 2 * cw + gap)), { x: null, min: work ? Math.max(cw, 176) : cw, mk })); }
        if (z.i === 3) { IT.push({ k: 'prize' }); let m = ''; try { m = L56.medal(Math.min(cw - 16, 84), D.total ? D.done / D.total : 0); } catch (e) {} L.push({ ow: cw, x: null, h: '<button class="l59-prize" data-l59i="' + (IT.length - 1) + '" style="width:' + cw + 'px;height:' + H + 'px" aria-label="Backlog Breaker, ' + D.done + ' of ' + D.total + '">' + m + '<i></i></button>' }); }
        h += drawCase(z.n, stat(z), L, G, x => x.extra || x.k === 'pick' ? undefined : MON[x.m].slice(0, 3), 'l59z' + z.i, work ? '<button class="l59-add" data-l59add="' + z.i + '" aria-label="Add to ' + z.n + '">Add</button>' : ''); }); }
    else { if (D.Z.length > 3) h += '<div class="l59-jump">' + D.Z.map((z, i) => '<button data-l59go="' + i + '">' + esc(z.n) + '</button>').join('') + '</div>';
      D.Z.forEach((z, i) => { h += drawCase(z.n, stat(z), put(z), G, x => x.tag ? (view === 'owned' ? bare(x.tag) : x.tag) : null, 'l59c' + i); }); }
    return h + '<div class="l59-card" id="l59card" hidden></div>'; }
  // the card for a tapped book: its cover, its name, and the facts, nothing more
  // editing: the entry of the copy that a book on the shelf stands for
  const entryOf = x => work && x && x.id && !x.extra ? work.set.find(e => slug(e[1]) === x.id) || null : null;
  const inSet = () => { const res = []; work.set.forEach(e => { try { if (e[2]) res.push(new RegExp(e[2])); } catch (x) {} }); return t => res.some(r => r.test(t)) || work.set.some(e => nrm(e[1]) === nrm(short(t))); };
  function picker(q) { const taken = inSet(); const n = nrm(q || ''); const L = ALL_TITLES.filter(t => { if (!BOOK(t) || taken(t)) return false; try { if (getStatus(t) === 'read') return false; } catch (e) {} return !n || nrm(t).indexOf(n) >= 0; }).sort((a, b) => nrm(bare(a)) < nrm(bare(b)) ? -1 : 1).slice(0, 40);
    const typed = String(q || '').replace(/\s+/g, ' ').trim().slice(0, 80); const free = typed.length > 1 && !L.some(t => nrm(short(t)) === nrm(typed)) && !work.set.some(e => nrm(e[1]) === nrm(typed)) ? '<button data-l59free="' + esc(encodeURIComponent(typed)) + '">Add “' + esc(typed) + '”</button>' : '';
    return L.map(t => '<button data-l59pick="' + esc(encodeURIComponent(t)) + '">' + esc(short(t)) + '</button>').join('') + free || '<p>Nothing matches</p>'; }
  const barH = () => { try { const n = $('libs'); const r = n.getBoundingClientRect(); return getComputedStyle(n).position === 'fixed' && r.height && r.top > innerHeight / 2 ? Math.max(0, Math.round(innerHeight - r.top)) : 0; } catch (e) { return 0; } };
  function addCard(se) { const c = document.getElementById('l59card'); if (!c) return; adding = se; picked = -1; c.className = 'l59-card top'; c.style.bottom = ''; c.innerHTML = '<div class="l59-ct"><b>Add to ' + SEAS[se] + '</b><input id="l59q" type="search" placeholder="Search your library" autocomplete="off" autocorrect="off" spellcheck="false"><div class="l59-pk" id="l59pk">' + picker('') + '</div><div class="l59-cb"><button data-l59="os">An open spot</button><button data-l59="put">Close</button></div></div>'; c.hidden = false; }
  function card(i) { const c = document.getElementById('l59card'); if (!c) return; c.className = 'l59-card'; c.style.bottom = barH() + 'px'; const x = IT[i]; if (!x) { c.hidden = true; picked = -1; adding = -1; return; } picked = i; adding = -1; const sp = D.sp; let cv = '', t = '', L = [], go = '';
    if (work && entryOf(x)) { c.innerHTML = '<div class="l59-ct"><b>' + esc(x.name) + '</b><div class="l59-mo">' + MON.map((m, k) => '<button data-l59m="' + k + '"' + (k === x.m ? ' class="on"' : '') + '>' + m.slice(0, 3) + '</button>').join('') + '</div><div class="l59-cb"><button data-l59="up">Earlier</button><button data-l59="dn">Later</button><button data-l59="put">Close</button></div></div>'; c.hidden = false; return; }
    if (x.k === 'room') { let sug = []; try { sug = L56.suggest().slice(0, 3); } catch (e) {} t = x.n + ' open'; L.push(x.se); if (sug.length) L.push('Backlog: ' + sug.join(', ')); }
    else if (x.k === 'prize') { t = 'Backlog Breaker'; L.push(D.done + ' of ' + D.total); try { cv = L56.medal(84, D.total ? D.done / D.total : 0); } catch (e) {} }
    else { t = x.name; const fin = x.d ? 'Finished ' + md(x.d) + (view === 'plan' ? '' : ', ' + x.d.slice(0, 4)) : ''; const a = []; if (view === 'plan') a.push(MON[x.m]); if (x.min && x.k !== 'pick' && !x.extra) a.push(hm(x.min / sp)); if (x.ser) a.push(x.ser); else if (x.extra && x.note) a.push(x.note); if (a.length) L.push(a.join(', '));
      const st = x.k === 'pick' ? '' : x.k === 'parcel' ? 'Out ' + (x.date ? md(x.date) : 'later') : x.read ? (fin || 'Finished') : x.k === 'ghost' ? 'Not in your library' : x.now ? 'Reading' + (x.pct ? ', ' + Math.round(x.pct) + '%' : '') : x.cur ? 'Next' : x.get ? 'Goodreads shelf, not owned' : 'Not started'; if (st) L.push(st);
      if (x.closes) L.push('Closes ' + x.closes.name + (x.closes.when ? ', ' + x.closes.when : ''));
      cv = x.art && x.k === 'book' ? '<img src="' + esc(x.art) + '" alt="">' : x.k === 'parcel' ? '<div class="l59-bigpc"></div>' : '<div class="l59-bigcl" style="--c:' + (x.k === 'pick' ? '#4a4458' : cloth(x.name)) + '">' + esc(x.name) + '</div>'; }
    c.innerHTML = (cv ? '<div class="l59-cv">' + cv + '</div>' : '') + '<div class="l59-ct"><b>' + esc(t) + '</b>' + L.map(l => '<p>' + esc(l) + '</p>').join('') + '<div class="l59-cb">' + go + '<button data-l59="put">Close</button></div></div>'; c.hidden = false; }
  // the bookcase is one of the Books views: the shelves stand where the grid does, and the search row and the category row step aside
  // its three cases are the tabs of the Books tab's own row of tabs, with their counts
  let CNT = null; const counts = () => { if (!CNT) { CNT = {}; try { CNT.owned = L59.owned().n; } catch (e) {} try { CNT.read = L59.finished().n; } catch (e) {} } try { CNT.plan = L56.count(); } catch (e) {} return CNT; };
  const tabs = () => { const n = $('nav'); if (!n) return; const c = counts(); n.style.display = ''; n.innerHTML = [['owned', 'Owned'], ['read', 'Finished'], ['plan', '2027 plan']].map(p => '<button data-l59v="' + p[0] + '"' + (view === p[0] ? ' class="active"' : '') + '><span>' + p[1] + '<span class="n">' + (c[p[0]] == null ? '' : c[p[0]]) + '</span></span></button>').join(''); };
  const mount = () => { const c = $('content'); if (!c) return false; if (!host) { host = document.createElement('div'); host.id = 'l59'; host.setAttribute('role', 'region'); host.setAttribute('aria-label', 'Bookcase'); } if (host.previousElementSibling !== c) c.after(host); return true; };
  L59.open = function (v) { try { if (v === 'plan' || v === 'owned' || v === 'read') view = v; if (!mount()) return false;
      if (currentView !== 'case') { currentView = 'case'; setViewButtons('case'); $('mainToolbar').style.display = 'none'; $('content').innerHTML = ''; try { localStorage.setItem(KEY, '1'); } catch (e) {} }
      try { $('rail').style.display = 'none'; } catch (e) {} host.classList.add('on'); if ((sel === 'use' && inUse() !== 'use') || (sel === 'new' && !work)) sel = inUse(); D = view === 'plan' ? L59.data(work ? false : mode, shown()) : view === 'owned' ? L59.owned() : L59.finished(); host.innerHTML = '<div class="l59-in' + (work ? ' ed' : '') + '">' + html() + '</div>'; picked = -1; tabs(); return true; } catch (e) { console.warn('l59', e); return false; } };
  L59.close = function () { try { if (on()) renderView('genre'); } catch (e) {} };
  // from anywhere in the app: the Books tab, the bookcase, that tab of it, at the top of the screen
  L59.go = function (v) { try { if (window.L37 && L37.close) L37.close(); } catch (e) {} try { if ($('sheet').classList.contains('open')) closeSheet(); } catch (e) {} try { if (currentLib !== 'books') switchLib('books'); } catch (e) {}
    if (!L59.open(v)) return false; try { ($('btn-case').closest('.controls') || host).scrollIntoView({ block: 'start' }); } catch (e) {} return true; };
  L59.pretend = b => { mode = !!b; if (on()) L59.open(); }; L59.isOpen = on; L59.things = () => IT.slice(); L59.view = () => view; L59.sel = () => sel; L59.work = () => work ? { set: work.set.map(e => e.slice()), open: work.open.slice() } : null;
  // its button, first in the row of views; any other view puts the shelves away, and a grid view also stops it being the view he comes back to
  try { const row = document.querySelector('#lib-books .view-toggle'); if (row && !$('btn-case')) { const b = document.createElement('button'); b.id = 'btn-case'; b.innerHTML = '<span>Bookcase</span>'; b.onclick = () => L59.open(); row.insertBefore(b, row.firstChild); }
    try { if (!ORDERS.case) ORDERS.case = []; if (!VIEWS.case) VIEWS.case = {}; } catch (e) {}
    const _svb = setViewButtons; setViewButtons = function (v) { const r = _svb.apply(this, arguments); try { const b = $('btn-case'); if (b) b.classList.toggle('active', v === 'case'); if (v !== 'case') { if (host) host.classList.remove('on'); work = null; arm = false; if (['genre', 'series', 'status', 'shelves'].indexOf(v) >= 0) localStorage.removeItem(KEY); } } catch (e) {} return r; };
    // the shelves follow his library: after any change, and when he comes back to the Books tab
    const _rae = refreshAfterEdit; refreshAfterEdit = function () { const r = _rae.apply(this, arguments); CNT = null; try { if (on() && currentLib === 'books' && !work) L59.open(); } catch (e) {} return r; };
    const _sl = switchLib; switchLib = function (lib) { const r = _sl.apply(this, arguments); CNT = null; try { if (lib === 'books' && on() && !work) L59.open(); } catch (e) {} return r; };
    if (localStorage.getItem(KEY) === '1' && currentView === 'genre') L59.open();
  } catch (e) { console.warn('l59 view', e); }
  document.addEventListener('click', e => { const el = e.target.closest && e.target.closest('#l59 [data-l59],#l59 [data-l59i],#nav [data-l59v],#l59 [data-l59go],#l59 [data-l59m],#l59 [data-l59add],#l59 [data-l59pick],#l59 [data-l59free],#l59 [data-l59rm],#l59 [data-l59om],#l59 [data-l59op]'); if (!el) return; e.preventDefault(); e.stopPropagation();
    const redo = () => { L59.open(); }; const sorted = () => { const S = work.set.map((e, i) => [e, i]).sort((a, b) => a[0][0] - b[0][0] || a[1] - b[1]).map(p => p[0]); work.set.length = 0; S.forEach(e => work.set.push(e)); };
    const again = en => { const id = slug(en[1]); redo(); const i = IT.findIndex(x => x.id === id && !x.extra); if (i >= 0) card(i); }; if (el.dataset.l59 !== 'use') arm = false;
    if (el.dataset.l59i != null) { const i = +el.dataset.l59i, x = IT[i]; if (!work && x && x.t) { card(-1); try { openSheet(x.t); } catch (err) {} return; } card(i === picked ? -1 : i); return; }
    if (el.dataset.l59rm != null && work) { const en = entryOf(IT[+el.dataset.l59rm]); if (en) { work.set.splice(work.set.indexOf(en), 1); redo(); } return; }
    if ((el.dataset.l59om != null || el.dataset.l59op != null) && work) { const more = el.dataset.l59op != null, se = +(more ? el.dataset.l59op : el.dataset.l59om); if (more) work.open.push(se * 3 + 2); else { let k = -1; work.open.forEach((m, i) => { if (seasonOf(m) === se) k = i; }); if (k >= 0) work.open.splice(k, 1); } redo(); return; }
    if (el.dataset.l59add != null) { addCard(+el.dataset.l59add); return; }
    if (el.dataset.l59pick && work && adding >= 0) { const t = decodeURIComponent(el.dataset.l59pick); let sn = ''; try { sn = SERIES_OF[t] && SERIES_OF[t] !== 'Standalone / Other' ? SERIES_OF[t] : ''; } catch (x) {} work.set.push([adding * 3 + 2, nice(t, sn), rx(t), 0, '']); sorted(); redo(); return; }
    if (el.dataset.l59free && work && adding >= 0) { const n = decodeURIComponent(el.dataset.l59free).replace(/\s+/g, ' ').trim().slice(0, 80); if (n && !work.set.some(e => nrm(e[1]) === nrm(n))) { work.set.push([adding * 3 + 2, n, null, 0, '']); sorted(); } redo(); return; }
    if (el.dataset.l59m != null && work) { const en = entryOf(IT[picked]); if (en) { en[0] = +el.dataset.l59m; work.set.splice(work.set.indexOf(en), 1); work.set.push(en); sorted(); again(en); } return; }
    if (el.dataset.l59v) { L59.open(el.dataset.l59v); return; }
    if (el.dataset.l59go != null) { const c = document.getElementById('l59c' + el.dataset.l59go); if (c) c.scrollIntoView({ block: 'start' }); return; }
    const a = el.dataset.l59; if (a === 'put') card(-1);
    else if (a === 'edit') { const p = shown() || L56.plan(); work = { set: p.P.map(e => e.slice()), open: p.OPEN.map(o => o[0]) }; sorted(); redo(); }
    else if (a === 'cancel') { work = null; if (sel === 'new') sel = inUse(); redo(); }
    else if (a === 'os' && work && adding >= 0) { work.open.push(adding * 3 + 2); redo(); }
    else if ((a === 'up' || a === 'dn') && work) { const en = entryOf(IT[picked]); if (!en) return; const S = work.set, i = S.indexOf(en), j = a === 'up' ? i - 1 : i + 1, o = S[j];
      if (o && o[0] === en[0]) { S[j] = en; S[i] = o; } else { const m = en[0] + (a === 'up' ? -1 : 1); if (m < 0 || m > 11) return; en[0] = m; } again(en); }
    else if (a === 'save' && work) { if (!work.set.length) return; if (L56.use(work.set, work.open, 'My plan')) { work = null; sel = inUse(); } redo(); }
    else if (a === 'use') { if (!arm) { arm = true; redo(); return; } arm = false; const t = sel === 'A' ? null : L59.template(sel); if (sel === 'A' ? L56.reset() : t && L56.use(t.set, t.open, t.name)) sel = inUse(); redo(); } }, true);
  document.addEventListener('change', e => { if (!e.target || e.target.id !== 'l59sel') return; sel = e.target.value; work = sel === 'new' ? { set: [], open: [] } : null; arm = false; L59.open(); });
  document.addEventListener('input', e => { if (e.target && e.target.id === 'l59q' && work) { const b = document.getElementById('l59pk'); if (b) b.innerHTML = picker(e.target.value); } });
  // the other ways in: a button elsewhere in the app that names a tab (the 2027 page in the quest log), and the address ending #bookcase
  document.addEventListener('click', e => { let el = null; try { el = (e.composedPath ? e.composedPath() : [e.target]).find(n => n && n.dataset && n.dataset.l59to) || null; } catch (x) {} if (!el) return; e.preventDefault(); e.stopPropagation(); L59.go(el.dataset.l59to); }, true);   // the quest log is drawn inside a shadow root, so the button is found on the event's path
  const want = () => /^#bookcase\b/i.test(location.hash); const take = () => { const m = /^#bookcase[-:/]?(plan|owned|read)?/i.exec(location.hash); try { history.replaceState(null, '', location.pathname + location.search); } catch (e) {} L59.go(m && m[1] ? m[1].toLowerCase() : undefined); };
  window.addEventListener('hashchange', () => { if (want()) take(); });
  if (want()) { let n = 0; const iv = setInterval(() => { n++; const ready = !(typeof SYNC82 !== 'undefined' && SYNC82.state === 'wait'); if (ready || n > 40) { clearInterval(iv); if (want()) take(); } }, 500); }

  // ---- styles: wood, brass and paper; nothing animates ----
  const B = 'html body #l59';
  const css = B + '{display:none;width:100vw;margin-left:calc(50% - 50vw);color:var(--d-ink,#f4eef7);font:400 15px/1.45 Barlow,system-ui,sans-serif}' + B + '.on{display:block}' +
    B + ' *{box-sizing:border-box;animation:none!important;transition:none!important}' + B + ' button{-webkit-appearance:none;appearance:none;font:inherit;color:inherit;margin:0;padding:0;border:0;border-radius:0;background:none;box-shadow:none;cursor:pointer;-webkit-tap-highlight-color:transparent}' +
    B + ' .l59-in{max-width:430px;margin:0 auto;padding:0 12px 150px}' +
    B + ' .ed .l59-act{position:sticky;top:env(safe-area-inset-top,0px);z-index:20;margin:0 -12px;padding:6px 12px;background:var(--d-bg,#0c0a16)}' +
    B + ' .l59-act button,' + B + ' .l59-jump button,' + B + ' .l59-add,' + B + ' .l59-cb button,' + B + ' .l59-mo button{font-family:"Den Cormorant","Cormorant Garamond",Georgia,serif!important;font-weight:500;letter-spacing:1.2px;text-transform:uppercase}' +
    B + ' .l59-act{display:flex;gap:6px;margin:6px 0 0}' + B + ' .l59-act button{flex:1;min-height:44px;border:1px solid var(--d-line,rgba(220,190,255,.2));font-size:14px}' + B + ' .l59-act button[disabled]{opacity:.38}' + B + ' .l59-act .go{background:var(--d-acc2,#dcc09a);border-color:var(--d-acc2,#dcc09a);color:#1b1408;font-weight:600}' +
    B + ' #l59sel{flex:2.4;min-width:0;min-height:44px;margin:0;padding:0 32px 0 13px;border:1px solid var(--d-line,rgba(220,190,255,.2));border-radius:0;background:var(--d-bg2,#141127) url("data:image/svg+xml,%3Csvg xmlns=%27http://www.w3.org/2000/svg%27 width=%2712%27 height=%278%27%3E%3Cpath d=%27M1 1.5l5 5 5-5%27 fill=%27none%27 stroke=%27%23aa9fbb%27 stroke-width=%271.6%27/%3E%3C/svg%3E") no-repeat right 12px center;color:var(--d-ink,#f4eef7);font:500 16px "Den Cormorant","Cormorant Garamond",Georgia,serif;letter-spacing:1.2px;text-transform:uppercase;text-overflow:ellipsis;-webkit-appearance:none;appearance:none}' +
    B + ' .l59-rm{position:absolute;z-index:6;top:7px;width:44px;height:44px;padding:0}' + B + ' .l59-rm i{position:absolute;right:5px;top:10px;width:26px;height:26px;border-radius:50%;background:#15111f;border:1.5px solid var(--d-ink,#f4eef7);box-shadow:0 2px 6px rgba(0,0,0,.75)}' + B + ' .l59-rm i::before{content:"";position:absolute;left:6px;right:6px;top:50%;height:2px;margin-top:-1px;background:var(--d-ink,#f4eef7)}' + B + ' .ed .rb{display:none}' +
    B + ' .l59-gap.ed button{flex:none;align-self:center;position:relative;width:44px;height:44px;padding:0;border:1.5px solid rgba(236,213,150,.7);border-radius:50%}' + B + ' .l59-gap.ed button b::before,' + B + ' .l59-gap.ed button b.pl::after{content:"";position:absolute;left:13px;right:13px;top:50%;height:2px;margin-top:-1px;background:rgba(236,213,150,.9)}' + B + ' .l59-gap.ed button b.pl::after{transform:rotate(90deg)}' +
    B + ' .l59-add{flex:none;min-height:44px;min-width:58px;margin-bottom:-4px;padding:0 12px;border:1px solid var(--d-acc2,#dcc09a)!important;color:var(--d-acc2,#dcc09a)!important;font-size:13.5px!important}' +
    B + ' .l59-mo{display:grid;grid-template-columns:repeat(6,1fr);gap:5px;margin-top:10px}' + B + ' .l59-mo button{min-height:44px;border:1px solid var(--d-line,rgba(220,190,255,.24));font-size:13.5px}' + B + ' .l59-mo .on{background:var(--d-ink,#f4eef7);color:var(--d-bg,#0c0a16);border-color:var(--d-ink,#f4eef7);font-weight:600}' +
    B + ' #l59q{display:block;width:100%;min-height:44px;margin-top:9px;padding:0 12px;border:1px solid var(--d-line,rgba(220,190,255,.3));border-radius:0;background:var(--d-bg,#0c0a16);color:var(--d-ink,#f4eef7);font:400 16px Barlow,system-ui,sans-serif;-webkit-appearance:none}' +
    B + ' .l59-pk{max-height:38vh;margin-top:6px;overflow-y:auto;-webkit-overflow-scrolling:touch}' + B + ' .l59-pk button{display:block;width:100%;min-height:44px;padding:8px 2px;border-bottom:1px solid var(--d-line,rgba(220,190,255,.14));text-align:left;font-size:14.5px}' +
    B + ' .l59-jump{display:flex;gap:6px;margin:12px -12px 0;padding:0 12px 2px;overflow-x:auto;-webkit-overflow-scrolling:touch;scrollbar-width:none}' + B + ' .l59-jump::-webkit-scrollbar{display:none}' + B + ' .l59-jump button{flex:none;min-height:44px;padding:0 13px;border:1px solid var(--d-line,rgba(220,190,255,.2));font-size:14px;white-space:nowrap}' +
    B + ' .l59-sea{display:flex;justify-content:space-between;align-items:flex-end;gap:10px;margin:26px 0 0}' +
    B + ' .l59-sea b{position:relative;z-index:1;margin:0 0 -3px 14px;padding:5px 16px 6px;border-radius:3px;background:linear-gradient(180deg,#ecd596,#b8923f 70%,#8e6c26);color:#2a1c06;font:700 21px/1 "Den Cormorant","Cormorant Garamond",Georgia,serif;letter-spacing:.02em;box-shadow:0 1px 0 #fff3c4 inset,0 2px 4px rgba(0,0,0,.6)}' +
    B + ' .l59-sea span{margin-left:auto;padding-bottom:7px;font-size:12.5px;color:var(--d-mute,#aa9fbb);text-align:right}' +
    B + ' .l59-case{padding:0 9px;border-top:9px solid #4a3324;border-radius:3px 3px 0 0;background:linear-gradient(90deg,#3a271b,#4f3626 4px,#33221a 9px,transparent 9px),linear-gradient(270deg,#3a271b,#4f3626 4px,#33221a 9px,transparent 9px),#17111c;box-shadow:0 1px 0 #6d5039 inset}' +
    B + ' .l59-sh{position:relative;display:flex;align-items:flex-end;padding:0;background:linear-gradient(180deg,rgba(0,0,0,.62),rgba(0,0,0,0) 40px),linear-gradient(90deg,rgba(0,0,0,.35),rgba(0,0,0,0) 14px,rgba(0,0,0,0) calc(100% - 14px),rgba(0,0,0,.35))}' +
    B + ' .l59-bd{position:relative;height:17px;background:repeating-linear-gradient(90deg,rgba(255,255,255,.035) 0 2px,rgba(0,0,0,0) 2px 9px,rgba(0,0,0,.05) 9px 11px,rgba(0,0,0,0) 11px 23px),linear-gradient(180deg,#8a6648 0,#6e4f37 2px,#523a29 60%,#2f2018);box-shadow:0 6px 9px rgba(0,0,0,.55)}' +
    B + ' .l59-bd i{position:absolute;top:2.5px;padding:1px 4px;border-radius:1.5px;background:#efe6d2;color:#2b2118;font:600 10px/1.05 "Barlow Condensed",Barlow,sans-serif;font-style:normal;white-space:nowrap}' + B + ' .l59-bd i.now{background:var(--d-acc,#e9a3b8);color:#1b1218}' +
    // a book: one shape for all, the cover whole on it, and the marks that sit on the cover
    B + ' .l59-bk{position:relative;flex:none;display:block;border-radius:2px 3px 3px 2px;box-shadow:0 0 0 .5px rgba(0,0,0,.55),3px 4px 8px rgba(0,0,0,.6)}' +
    B + ' .l59-bk .cv{position:absolute;inset:0;display:flex;align-items:center;justify-content:center;overflow:hidden;border-radius:inherit;background:var(--c) 50% 50%/100% 100% no-repeat;color:#f7f0e3}' +
    B + ' .l59-bk .cv img{position:absolute;inset:0;width:100%;height:100%;object-fit:contain;object-position:50% 50%}' +
    B + ' .l59-bk .cv::after{content:"";position:absolute;z-index:3;inset:0;pointer-events:none;box-shadow:inset 1.5px 0 0 rgba(255,255,255,.22),inset 0 1.5px 0 rgba(255,255,255,.12),inset 7px 0 6px -5px rgba(0,0,0,.5)}' +
    B + ' .l59-bk .cv>b:not(.sl){position:relative;padding:0 8px;text-align:center;font:600 13px/1.13 "Barlow Condensed",Barlow,sans-serif;letter-spacing:.01em}' + B + ' .l59-bk.ok .cv>b:not(.sl){visibility:hidden}' +
    B + ' .l59-bk u{position:absolute;z-index:4;left:6px;bottom:6px;width:16px;height:16px;border-radius:50%;background:radial-gradient(circle at 35% 30%,#fff3c4,#d9a441 55%,#8a6418);box-shadow:0 1px 3px rgba(0,0,0,.8);text-decoration:none}' +
    B + ' .l59-bk s{position:absolute;z-index:4;left:6px;bottom:6px;padding:2px 4px;background:#efe6d2;color:#2b2118;font:600 10.5px/1 "Barlow Condensed",Barlow,sans-serif;text-decoration:none;border-radius:1.5px;box-shadow:0 1px 2px rgba(0,0,0,.6)}' +
    B + ' .l59-bk .rb{position:absolute;z-index:4;top:0;right:10px;width:11px;height:34px;background:var(--d-acc,#e9a3b8);clip-path:polygon(0 0,100% 0,100% 100%,50% 76%,0 100%)}' +
    B + ' .l59-bk .sl{position:absolute;z-index:4;right:5px;bottom:5px;display:grid;place-items:center;width:30px;height:30px;border-radius:50%;background:radial-gradient(circle at 35% 28%,#fff3c4,#d9b45c 45%,#8e6c26);box-shadow:inset 0 0 0 1.5px rgba(92,64,14,.55),inset 0 0 0 3px rgba(255,243,196,.5),0 2px 4px rgba(0,0,0,.7);color:#3a2706;font:700 13px/1 "Den Cormorant","Cormorant Garamond",Georgia,serif}' +
    B + ' .l59-bk.pick .cv>b{font-style:italic;color:#d9d2e6}' +
    B + ' .l59-bk.gh{box-shadow:none}' + B + ' .l59-bk.gh .cv{background:none;border:1.5px dashed rgba(236,213,150,.6);color:rgba(239,230,210,.86)}' + B + ' .l59-bk.gh .cv::after{display:none}' +
    B + ' .l59-bk.pc .cv{background:repeating-linear-gradient(115deg,rgba(255,255,255,.05) 0 3px,rgba(0,0,0,.04) 3px 7px),linear-gradient(90deg,#9a7648,#c19a69 30%,#b08a58 70%,#86643b)}' +
    B + ' .l59-bk.pc .cv::before{content:"";position:absolute;top:0;bottom:0;left:50%;width:2px;margin-left:-1px;background:#5b3d20}' + B + ' .l59-bk.pc .cv::after{inset:auto 0 auto 0;top:36%;height:2px;background:#5b3d20;box-shadow:none}' +
    B + ' .l59-bk.pc em{position:absolute;z-index:4;left:50%;top:36%;transform:translate(-50%,7px);padding:3px 6px;background:#efe6d2;color:#2b2118;font:600 12px/1.1 "Barlow Condensed",Barlow,sans-serif;font-style:normal;white-space:nowrap;box-shadow:0 1px 2px rgba(0,0,0,.5)}' +
    B + ' .l59-gap{flex:none;display:flex;align-items:flex-end}' + B + ' .l59-gap i{flex:none;width:14px;height:64px;border-radius:7px 7px 0 0;background:linear-gradient(90deg,#7c8089,#dfe1e6 42%,#6a6e77)}' +
    B + ' .l59-gap span{flex:1;align-self:stretch;display:flex;align-items:center;justify-content:center;font:italic 600 16px/1.15 "Cormorant Garamond",Georgia,serif;color:rgba(236,213,150,.68)}' +
    B + ' .l59-prize{flex:none;display:flex;flex-direction:column;align-items:center;justify-content:flex-end}' + B + ' .l59-prize svg{display:block}' + B + ' .l59-prize i{width:26px;height:10px;margin-top:-1px;background:linear-gradient(180deg,#8e6c26,#4d3a14);clip-path:polygon(22% 0,78% 0,100% 100%,0 100%)}' +
    B + ' .l59-card{position:fixed;z-index:30;left:0;right:0;bottom:0;display:flex;gap:14px;padding:14px;background:var(--d-bg2,#141127);border-top:1px solid var(--d-line,rgba(220,190,255,.2));box-shadow:0 -12px 30px rgba(0,0,0,.6)}' + B + ' .l59-card[hidden]{display:none}' + B + ' .l59-card.top{top:0;bottom:auto;padding:calc(env(safe-area-inset-top) + 14px) 14px 14px;border-top:0;border-bottom:1px solid var(--d-line,rgba(220,190,255,.2));box-shadow:0 12px 30px rgba(0,0,0,.6)}' + B + ' .l59-card.top .l59-pk{max-height:30vh}' + B + ' .l59-cb{flex-wrap:wrap}' +
    B + ' .l59-cv{flex:none;width:92px}' + B + ' .l59-cv img{display:block;width:92px;height:138px;object-fit:cover;border-radius:2px;box-shadow:0 4px 10px rgba(0,0,0,.6)}' + B + ' .l59-cv svg{display:block;margin:0 auto}' +
    B + ' .l59-bigcl{display:grid;place-items:center;width:92px;height:138px;padding:8px;border-radius:2px;background:var(--c);color:#f7f0e3;text-align:center;font:500 15px/1.1 "Cormorant Garamond",Georgia,serif}' +
    B + ' .l59-bigpc{position:relative;width:92px;height:138px;border-radius:2px;background:linear-gradient(90deg,#9a7648,#c19a69 30%,#b08a58 70%,#86643b)}' + B + ' .l59-bigpc::before{content:"";position:absolute;top:0;bottom:0;left:50%;width:3px;margin-left:-1.5px;background:#5b3d20}' + B + ' .l59-bigpc::after{content:"";position:absolute;left:0;right:0;top:40%;height:3px;background:#5b3d20}' +
    B + ' .l59-ct{flex:1;min-width:0}' + B + ' .l59-ct b{display:block;font:600 19px/1.12 "Barlow Condensed",Barlow,sans-serif}' + B + ' .l59-ct p{margin:5px 0 0;font-size:13.5px;line-height:1.38;color:var(--d-mute,#aa9fbb)}' +
    B + ' .l59-cb{display:flex;gap:8px;margin-top:11px}' + B + ' .l59-cb button{min-height:44px;padding:0 14px;border:1px solid var(--d-line,rgba(220,190,255,.24));font-size:14px}' + B + ' .l59-cb button[data-l59="book"]{background:var(--d-ink,#f4eef7);color:var(--d-bg,#0c0a16);border-color:var(--d-ink,#f4eef7);font-weight:600}';
  try { const st = document.createElement('style'); st.id = 'l59css'; st.textContent = css; document.head.appendChild(st); } catch (e) {}
})();

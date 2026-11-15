// ===== L59: the bookcase, a preview. Three bookcases, drawn the same way: his 2027 plan (L56) by season, the books he owns by
//   category, and the books he has finished by year. The shelves are built around the covers (his words: "Why is the cover art
//   so small??? Make it fit"): every book stands at full shelf height with its real cover and no lettering. Two looks:
//   "whole covers" shows every cover whole, never cropped, three to a shelf, and the block of pages beside it is as thick as the
//   book's listening time at his speed; "packed" overlaps the covers like a full shelf, and the more hours a book is, the more of its cover shows.
//   A title is lettered only on a book with no cover on file, measured so it is shortened at a word and never cut.
//   In the plan the book he is on carries a ribbon; a finished book carries a gold seal and a series whose plan books are all
//   finished gets a brass seal standing on the shelf; a book that is not out yet is a wrapped parcel with its day on the tag, a
//   book that is not in his library is an outline, the open spots are the empty shelf between two bookends, and the Backlog
//   Breaker medal waits at the end of the last shelf.
//   It is a preview: nothing in the app links to it and it changes nothing. It opens from the address ending #bookcase, or by
//   typing "bookcase" in the Books search box. "Pretend it is July 1" shows the first half of the plan year as read, so the
//   finished states can be seen before any of it has happened. Nothing on it moves.
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
  const PX = 3.6;   // points of shelf for one hour of listening at his speed
  const JULY = '2027-07-01';
  const lenOf = t => { try { return L46.len(t) || 0; } catch (e) { return 0; } };
  const wide = min => Math.max(9, Math.min(150, Math.round(min / 60 / speed() * PX)));
  // an open spot is as wide as his median book
  const median = () => { try { const L = ALL_TITLES.map(lenOf).filter(Boolean).sort((a, b) => a - b); if (L.length) return L[Math.floor(L.length / 2)]; } catch (e) {} return 540 * speed(); };
  // the cover the app already has for a book: his own art first, then the checked store cover, then the small one in the page
  const art = t => { if (!t) return '';
    try { if (window.L10 && L10.ART && L10.ART[t] && ART[t]) return ART[t]; } catch (e) {}
    try { const c = getOverride('cv:' + t) || {}; if (c.url) return window.L11 && L11.sized ? L11.sized(c.url, false) : c.url; } catch (e) {}
    try { if (ART[t]) return ART[t]; if (COVERS[t] && COVERS[t].cover_data) return COVERS[t].cover_data; } catch (e) {} return ''; };
  const cloth = t => { let h = 0; t = String(t); for (let i = 0; i < t.length; i++) h = (h * 31 + t.charCodeAt(i)) >>> 0; return 'hsl(' + (h % 360) + ' 34% ' + (24 + h % 9) + '%)'; };
  const tall = t => { let h = 0; t = String(t); for (let i = 0; i < t.length; i++) h = (h * 17 + t.charCodeAt(i)) >>> 0; return 138 + (h % 4) * 4; };
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
  // down a spine: as many lines as the spine is wide enough for
  const fitV = (name, w, h) => { const px = w < 16.5 ? 10.5 : 11.5; return fitLines(name, h * .96, Math.max(1, Math.min(3, Math.floor((w - 3) / (px * 1.1)))), px); };
  // a thick spine can set its title across instead: the largest size, from 13 down to 9.5, at which the whole title fits the lines
  // there is room for; if it never all fits, the smallest size, shortened between words
  const across = (name, w, room, top) => { const len = (w - 12) * .97; let last = null; for (let fs = top || 13; fs >= 9.5; fs -= .5) { const lw = name.split(/\s+/).reduce((a, x) => Math.max(a, meas(x, fs)), 0); if (lw > len) continue; const max = Math.max(1, Math.floor(room / (fs * 1.13))); if (linesFor(name, len, fs) <= max) return { fs, t: name, all: true }; last = { fs, t: fitLines(name, len, max, fs), all: false }; } return last && last.t ? last : null; };
  const book = (t, name, o) => { const min = lenOf(t); const x = Object.assign({ k: 'book', t, name, min, w: min ? wide(min) : 24, art: art(t), read: false }, o || {});
    try { x.get = (META[t] || {}).gr === true; } catch (e) {} try { x.now = getStatus(t) === 'currently-reading'; x.pct = +(getOverride(t) || {}).progress || 0; } catch (e) {} return x; };

  // ---- 1. the 2027 plan as things on a shelf ----
  L59.data = function (pretend) { const S = L56.slots(); const sp = speed(); const up = window.L58 || null; const med = median();
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
      const it = { k: empty ? 'pick' : u ? 'parcel' : x.t ? 'book' : 'ghost', id: x.id, m: x.m, name: empty ? 'Your pick' : x.name, t: x.t || null, min, w: wide(min), read, d: pretend ? null : doneAt[x.id] || null,
        open: !!x.open, date: u && full(u.date) ? u.date : '', note: x.note || '', ser: ser[x.id] || '' };
      if (it.t) { it.art = art(it.t); try { it.get = (META[it.t] || {}).gr === true; } catch (e) {} try { it.now = getStatus(it.t) === 'currently-reading'; it.pct = +(getOverride(it.t) || {}).progress || 0; } catch (e) {} }
      z.items.push(it); all.push(it); if (!empty) { z.min += min; z.books++; } });
    // books in his series with a day in 2027 that are not out yet: parcels waiting in the open part of their season
    const soon = []; try { const P = L56.P || []; (up ? up.watch(2027) : []).forEach(u => { if (P.some(e => nrm(e[1]) === nrm(u.title))) return; if (!full(u.date)) { soon.push(u.title); return; } if (pretend && u.date < JULY) return;
        const m = +u.date.slice(5, 7) - 1; const min = +u.minutes || med; Z[seasonOf(m)].items.push({ k: 'parcel', id: 'w:' + nrm(u.title), m, name: u.title, t: null, min, w: wide(min), read: false, date: u.date, extra: true, note: u.series && u.title.indexOf(u.series) < 0 ? u.series : '', ser: '' }); }); } catch (e) {}
    // the book he is on: the first one in the plan he has not finished
    const cur = all.find(x => !x.read && x.k !== 'parcel' && x.k !== 'pick') || null; if (cur) cur.cur = true;
    // a series is closed once every plan book in it is read: its seal stands after the last of them
    const bySer = {}; all.forEach(x => { if (x.ser) (bySer[x.ser] = bySer[x.ser] || []).push(x); });
    Object.keys(bySer).forEach(s => { const L = bySer[s]; if (!L.every(x => x.read)) return; const last = L[L.length - 1]; const z = Z[seasonOf(last.m)]; const k = z.items.indexOf(last);
      const when = pretend ? MON[last.m] : (L.map(x => x.d).filter(Boolean).sort().pop() || ''); z.items.splice(k + 1, 0, { k: 'seal', id: 'c:' + nrm(s), m: last.m, name: s, n: L.length, w: 44, when: pretend ? when : (when ? md(when) : '') }); });
    const nDone = pretend ? all.filter(x => x.read).length : Object.keys(doneAt).length;
    return { Z, all, soon, cur, total: S.length, set: S.filter(x => !x.open).length, min: S.filter(x => !x.open).reduce((a, x) => a + x.min, 0), done: nDone, sp, med, pretend: !!pretend }; };

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
      if (seen[k]) { const o = seen[k]; if (d && (!o.d || d < o.d)) o.d = d; if (!o.min && lenOf(t)) { o.min = lenOf(t); o.w = wide(o.min); } if (!o.art && art(t)) { o.art = art(t); o.t = t; } return; }
      let s = ''; try { s = SERIES_OF[t] && SERIES_OF[t] !== 'Standalone / Other' ? SERIES_OF[t] : ''; } catch (e) {} const x = book(t, nice(t, s), { read: true, d, ser: s }); seen[k] = x; L.push(x); });
    const by = {}; L.forEach(x => { const y = x.d ? x.d.slice(0, 4) : ''; (by[y] = by[y] || []).push(x); });
    const Z = Object.keys(by).sort((a, b) => (a === '') - (b === '') || (a < b ? 1 : -1)).map(y => { const I = by[y]; if (y) I.sort((a, b) => a.d < b.d ? -1 : a.d > b.d ? 1 : 0); else I.sort((a, b) => { const A = nrm(bare(a.ser || a.name)) + ' ' + nrm(a.name), B = nrm(bare(b.ser || b.name)) + ' ' + nrm(b.name); return A < B ? -1 : A > B ? 1 : 0; });
      I.forEach(x => { x.tag = y ? MON[+x.d.slice(5, 7) - 1].slice(0, 3) : ''; }); return { n: y || 'Earlier', full: y || 'No finish date', items: I, min: I.reduce((s, x) => s + x.min, 0), books: I.length }; });
    return { Z, n: L.length, min: L.reduce((s, x) => s + x.min, 0), sp: speed() }; };

  // ---- drawing ----
  let host = null, view = 'plan', look = 'whole', mode = false, D = null, IT = [], picked = -1, back = false, lastY = 0;
  const on = () => !!(host && host.classList.contains('on'));
  L59.lit = function (img) { try { const p = img.closest('.l59-bk'); if (p) p.classList.add('ok'); } catch (e) {} };
  // the shape of a book's cover, from the size on file with it (two wide to three tall when there is none)
  const ratio = t => { try { const c = getOverride('cv:' + t) || {}; if (+c.w > 0 && +c.h > 0) return Math.max(.6, Math.min(1.05, c.w / c.h)); } catch (e) {} return 2 / 3; };
  // a book on the shelf. Whole: the cover entire, and beside it the block of pages, about a point for an hour of listening;
  // three stand on a shelf and each shelf's books are sized together (k) so they fill it. Packed: at full shelf height, the cover overlapped by the next book, 5 points of it showing for an hour, up to the whole cover.
  // The book he is on is always whole. Lettering goes on only when there is no cover to show; a cover that loads hides it.
  function thing(x, i, k) { const lab = esc(x.name); k = k || 1;
    if (x.k === 'seal') return { ow: x.w + 6, h: '<button class="l59-seal" data-l59i="' + i + '" style="width:' + x.w + 'px" aria-label="' + lab + ', closed"><b>' + esc(mono(x.name)) + '</b><i></i></button>' };
    const hrs = (x.min || 0) / 60 / speed(), whole = look === 'whole' || !!x.cur, has = x.k === 'book' && !!x.art, H = Math.round(tall(x.name || x.id || '') * (look === 'whole' ? .89 * k : 1)), cw = Math.round(H * (has ? ratio(x.t) : 2 / 3));
    const v = whole ? cw : hrs ? Math.max(12, Math.min(cw, Math.round(hrs * 5))) : 40; const pg = whole && x.k !== 'parcel' ? (hrs ? Math.max(3, Math.min(36, Math.round(hrs * .9))) : 5) : 0;
    const marks = (x.read ? '<u></u>' : x.get ? '<s>get</s>' : '') + ((x.cur || x.now) && !x.read ? '<i class="rb"></i>' : ''); let inner = '';
    if (x.k === 'parcel') inner = '<em' + (v < 34 ? ' class="nar"' : '') + '>' + (x.date ? esc(md(x.date)) : 'soon') + '</em>';
    else { let t = ''; if (v >= 46) { const a = across(x.name, v - 4, H - 44, 15); if (a) t = '<b style="font-size:' + a.fs + 'px">' + esc(a.t) + '</b>'; }
      if (!t && v >= 13) { const d = fitV(x.name, v, H - 30); if (d) t = '<b class="dn' + (v < 16.5 ? ' one' : '') + '">' + esc(d) + '</b>'; }
      inner = t + (has ? '<img src="' + esc(x.art) + '" alt="" loading="lazy" decoding="async" onload="L59.lit(this)" onerror="this.remove()">' : ''); }
    const kind = x.k === 'parcel' ? ' pc' : x.k === 'ghost' ? ' gh' : x.k === 'pick' ? ' pick' : '', say = x.k === 'parcel' ? ', not out yet' : x.k === 'ghost' ? ', not in your library' : x.cur ? ', the book you are on' : '';
    return { ow: v + pg + (whole ? 6 : 0), flex: look === 'whole', face: x.cur ? 1 : 0, h: '<button class="l59-bk' + kind + (whole ? '' : ' pk') + (x.cur ? ' cur' : '') + (x.read ? ' rd' : '') + '" data-l59i="' + i + '" style="height:' + H + 'px;--c:' + (x.k === 'pick' ? '#4a4458' : cloth(x.name)) + '" aria-label="' + lab + say + '"><span class="cv" style="width:' + v + 'px">' + inner + marks + '</span>' + (pg ? '<span class="pg" style="width:' + pg + 'px"></span>' : '') + '</button>' }; }
  // one case: its brass plate, its shelves filled left to right, and paper tags on the shelf edge where a new month or series starts
  function drawCase(name, sub, L, W, tagOf, id) { const lim = look === 'whole' ? W * 1.1 : W;   // whole covers may be a tenth over at their base size: the shelf's books are then sized down together to fit
    const rows = [[]]; let rw = 0; L.forEach(o => { if (rw + o.ow > (o.mk ? W : lim) && rows[rows.length - 1].length) { if (o.mk && W - rw >= o.min) Object.assign(o, o.mk(W - rw)); else { rows.push([]); rw = 0; } } rows[rows.length - 1].push(o); rw += o.ow; });
    let h = '<div class="l59-sea"' + (id ? ' id="' + id + '"' : '') + '><b>' + esc(name) + '</b><span>' + esc(sub) + '</span></div><div class="l59-case">'; let last = null, kPrev = 1.08;
    rows.forEach((r, ri) => { const flex = r.filter(o => o.flex); if (flex.length) { const fixed = r.reduce((a, o) => a + (o.flex ? 0 : o.ow), 0), fw = flex.reduce((a, o) => a + o.ow, 0); let k = ri === rows.length - 1 && rows.length > 1 && fixed + fw < W * .7 ? kPrev : Math.max(.88, Math.min(1.16, (W - fixed) / fw));
        for (let n = 0; n < 12; n++) { flex.forEach(o => Object.assign(o, thing(o.x, o.i, k))); if (r.reduce((a, o) => a + o.ow, 0) <= W) break; k -= .01; } kPrev = k; }
      let x = 0, end = -99, tags = ''; r.forEach(o => { const key = o.x ? tagOf(o.x) : undefined;
        if (key !== undefined && key !== last) { last = key; if (key) { const t = key.length > 19 ? key.slice(0, 18).replace(/\s+$/, '') + '…' : key; const tx = Math.max(x + 2, end + 4), tw = t.length * 5.5 + 9; if (tx + tw <= W && tx <= x + Math.max(o.ow, 26)) { tags += '<i style="left:' + tx + 'px">' + esc(t) + '</i>'; end = tx + tw; } } }
        if (o.face) { const tx = Math.max(x + 6, end + 4); tags += '<i class="now" style="left:' + tx + 'px">' + (o.x.now ? 'Reading now' : 'Next up') + '</i>'; end = tx + 64; } x += o.ow; });
      h += '<div class="l59-sh">' + r.map(o => o.h).join('') + '</div><div class="l59-bd">' + tags + '</div>'; });
    return h + '</div>'; }
  function html() { const W = Math.max(280, Math.min(430, host.clientWidth || 390) - 42); IT = []; const sp = D.sp; const tab = (k, t) => '<button data-l59v="' + k + '"' + (view === k ? ' class="on"' : '') + '>' + t + '</button>';
    let h = '<div class="l59-top"><button class="l59-x" data-l59="close">‹ Back</button><span>Preview</span></div><div class="l59-hd"><h1>' + (view === 'plan' ? '2027' : view === 'owned' ? 'Owned' : 'Finished') + '</h1><b>The bookcase</b></div>';
    h += '<div class="l59-tabs">' + tab('plan', '2027 plan') + tab('owned', 'Owned') + tab('read', 'Finished') + '</div>';
    h += '<div class="l59-lk"><button data-l59l="whole"' + (look === 'whole' ? ' class="on"' : '') + '>Whole covers</button><button data-l59l="packed"' + (look === 'packed' ? ' class="on"' : '') + '>Packed</button></div>'; const how = look === 'whole' ? 'Every cover is whole, and the block of pages beside it is as thick as its listening time.' : 'Covers overlap like a full shelf: the more hours a book is, the more of its cover shows.';
    const put = z => z.items.map(x => { IT.push(x); const i = IT.length - 1; return Object.assign(thing(x, i), { x, i }); }); const hrs = m => Math.round(m / 60 / sp);
    if (view === 'plan') { h += '<p class="l59-lead">Your plan as it stands in the app: ' + D.total + ' books, ' + D.set + ' set and ' + (D.total - D.set) + ' open, ' + hrs(D.min) + ' hours at ' + sp + 'x. ' + how + '</p>';
      h += '<div class="l59-tg"><button data-l59="now"' + (mode ? '' : ' class="on"') + '>Today</button><button data-l59="july"' + (mode ? ' class="on"' : '') + '>Pretend it is July 1</button></div>';
      D.Z.forEach(z => { const L = put(z);
        if (z.room) { IT.push({ k: 'room', n: z.room, se: z.n }); const gi = IT.length - 1; const mk = w => ({ ow: w + 28, h: '<button class="l59-gap" data-l59i="' + gi + '" aria-label="Room for ' + z.room + ' more"><i></i><span style="width:' + w + 'px">room for<br>' + z.room + ' more</span><i></i></button>' });
          L.push(Object.assign(mk(Math.min(W - 30, z.room * (look === 'whole' ? 58 : 44))), { x: null, min: 118, mk: left => mk(left - 28) })); }   // the open room takes what is left of a shelf when that is enough to stand in
        if (z.i === 3) { IT.push({ k: 'prize' }); let m = ''; try { m = L56.medal(60, D.total ? D.done / D.total : 0); } catch (e) {} L.push({ ow: 72, x: null, h: '<button class="l59-prize" data-l59i="' + (IT.length - 1) + '" aria-label="Backlog Breaker, ' + D.done + ' of ' + D.total + '">' + m + '<i></i></button>' }); }
        h += drawCase(z.n, hrs(z.min) + ' h, ' + z.books + (z.books === 1 ? ' book' : ' books') + (z.room ? ', room for ' + z.room + ' more' : ''), L, W, x => x.k === 'seal' || x.extra || x.k === 'pick' ? undefined : MON[x.m].slice(0, 3)); });
      h += '<p class="l59-key">A gold seal is a book you finished in 2027. An outline is a book that is not in your library yet. A parcel is a book that is not out yet, and the tag is its day. The space between the bookends is yours.</p>';
      if (D.soon.length) h += '<p class="l59-key">On order with no day yet: ' + D.soon.map(esc).join(', ') + '.</p>'; }
    else { h += '<p class="l59-lead">' + (view === 'owned' ? 'The ' + D.n + ' books you own, a case for each category, each series together and in order. ' : 'The ' + D.n + ' books you have finished, a case for each year, in the order you finished them. ') + hrs(D.min) + ' hours at ' + sp + 'x. ' + how + ' A gold seal is a finished book' + (view === 'owned' ? ' and a ribbon is one you are in' : '') + '.</p>';
      if (D.Z.length > 3) h += '<div class="l59-jump">' + D.Z.map((z, i) => '<button data-l59go="' + i + '">' + esc(z.n) + '</button>').join('') + '</div>';
      D.Z.forEach((z, i) => { h += drawCase(z.n, hrs(z.min) + ' h, ' + z.books + (z.books === 1 ? ' book' : ' books'), put(z), W, x => x.tag ? (view === 'owned' ? bare(x.tag) : x.tag) : null, 'l59c' + i); }); }
    h += '<p class="l59-key">This is a preview. Tap anything on the shelf. Moving books by hand is not built, and nothing here changes your library or your plan.</p><div class="l59-card" id="l59card" hidden></div>';
    return h; }
  function card(i) { const c = document.getElementById('l59card'); if (!c) return; const x = IT[i]; if (!x) { c.hidden = true; picked = -1; return; } picked = i; const sp = D.sp; let cv = '', t = '', a = '', b = '', go = '';
    const len = x.min ? hm(x.min / sp) + ' at ' + sp + 'x' : 'No length on file';
    if (x.k === 'room') { let sug = []; try { sug = L56.suggest().slice(0, 3); } catch (e) {} t = 'Room for ' + x.n + ' more'; a = x.se + '’s open spots: a Goodreads ' + x.se + ' badge book, a new release, or one from your backlog.'; b = sug.length ? 'From your backlog: ' + sug.join(', ') + '.' : ''; }
    else if (x.k === 'prize') { t = 'Backlog Breaker'; a = D.done + ' of ' + D.total + ' books' + (D.pretend ? ', pretending it is July 1' : ' finished in 2027') + '.'; b = 'The medal for finishing the whole plan in 2027.'; try { cv = L56.medal(84, D.total ? D.done / D.total : 0); } catch (e) {} }
    else if (x.k === 'seal') { t = x.name; a = 'Closed' + (x.when ? ' in ' + x.when : '') + ': ' + (x.n === 1 ? 'the one book' : 'all ' + x.n + ' books') + ' the plan had left in it.'; cv = '<div class="l59-bigseal"><b>' + esc(mono(x.name)) + '</b></div>'; }
    else if (x.k === 'pick') { t = 'Your pick'; a = MON[x.m] + '. An open spot you filled with a book of your choosing.'; b = 'In the real year this is the book itself.'; }
    else { t = x.name; const fin = x.d ? 'Finished ' + md(x.d) + (view === 'plan' ? '' : ', ' + x.d.slice(0, 4)) + '.' : '';
      if (view === 'plan') { a = MON[x.m] + (x.extra ? '' : '. ' + len) + '.' + (x.ser ? ' ' + x.ser + '.' : x.note && x.extra ? ' ' + x.note + '.' : '');
        b = x.k === 'parcel' ? 'Not out yet. It ' + (x.extra ? 'takes an open spot' : 'is unwrapped') + ' on ' + (x.date ? md(x.date) : 'its release day') + '.' : x.read ? (fin || 'Read, pretending it is July 1.') : x.k === 'ghost' ? 'Not in your library yet.' : x.cur ? (x.now ? 'You are reading it' + (x.pct ? ', ' + Math.round(x.pct) + '% in.' : '.') : 'Next up in the plan.') : x.get ? 'On your Goodreads shelf. You do not own the audiobook yet.' : 'On your shelf, not started.'; }
      else { a = len + '.' + (x.ser ? ' ' + x.ser + '.' : ''); b = x.read ? (fin || 'Finished, no date on file.') : x.now ? 'You are reading it' + (x.pct ? ', ' + Math.round(x.pct) + '% in.' : '.') : 'On your shelf, not started.'; }
      cv = x.art ? '<img src="' + esc(x.art) + '" alt="">' : x.k === 'parcel' ? '<div class="l59-bigpc"></div>' : '<div class="l59-bigcl" style="--c:' + cloth(x.name) + '">' + esc(x.name) + '</div>';
      if (x.t) go = '<button data-l59="book">Open its page</button>'; }
    c.innerHTML = (cv ? '<div class="l59-cv">' + cv + '</div>' : '') + '<div class="l59-ct"><b>' + esc(t) + '</b><p>' + esc(a) + '</p>' + (b ? '<p>' + esc(b) + '</p>' : '') + '<div class="l59-cb">' + go + '<button data-l59="put">Put it back</button></div></div>'; c.hidden = false; }
  L59.open = function (v) { try { if (v === 'plan' || v === 'owned' || v === 'read') view = v; if (!host) { host = document.createElement('div'); host.id = 'l59'; host.setAttribute('role', 'dialog'); host.setAttribute('aria-label', 'The bookcase, a preview'); document.body.appendChild(host); }
      host.classList.add('on'); document.documentElement.classList.add('l59-lock'); D = view === 'plan' ? L59.data(mode) : view === 'owned' ? L59.owned() : L59.finished(); host.innerHTML = '<div class="l59-in">' + html() + '</div>'; host.scrollTop = lastY; lastY = 0; picked = -1; return true; } catch (e) { console.warn('l59', e); return false; } };
  L59.close = function () { if (host) host.classList.remove('on'); document.documentElement.classList.remove('l59-lock'); try { if (/^#bookcase\b/i.test(location.hash)) history.replaceState(null, '', location.pathname + location.search); } catch (e) {} };
  L59.isOpen = on; L59.things = () => IT.slice(); L59.view = () => view; L59.look = () => look;
  // a book opened from the shelf comes back to the shelf when its page closes
  try { const _cs = closeSheet; closeSheet = function () { const r = _cs.apply(this, arguments); if (back) { back = false; setTimeout(() => L59.open(), 30); } return r; }; } catch (e) {}
  document.addEventListener('click', e => { const el = e.target.closest && e.target.closest('#l59 [data-l59],#l59 [data-l59i],#l59 [data-l59v],#l59 [data-l59go],#l59 [data-l59l]'); if (!el) return; e.preventDefault(); e.stopPropagation();
    if (el.dataset.l59i != null) { const i = +el.dataset.l59i; card(i === picked ? -1 : i); return; }
    if (el.dataset.l59v) { lastY = 0; L59.open(el.dataset.l59v); return; }
    if (el.dataset.l59l) { const at = host.scrollTop / Math.max(1, host.scrollHeight); look = el.dataset.l59l === 'packed' ? 'packed' : 'whole'; L59.open(); host.scrollTop = Math.round(at * host.scrollHeight); return; }
    if (el.dataset.l59go != null) { const c = document.getElementById('l59c' + el.dataset.l59go); if (c) host.scrollTop = Math.max(0, c.offsetTop - 10); return; }
    const a = el.dataset.l59; if (a === 'close') L59.close(); else if (a === 'put') card(-1); else if (a === 'now' || a === 'july') { mode = a === 'july'; lastY = host.scrollTop; L59.open(); }
    else if (a === 'book') { const x = IT[picked]; if (x && x.t) { back = true; lastY = host.scrollTop; if (host) host.classList.remove('on'); document.documentElement.classList.remove('l59-lock'); try { openSheet(x.t); } catch (err) { back = false; } } } }, true);
  window.addEventListener('keydown', e => { if (e.key === 'Escape' && on()) L59.close(); });
  // the two ways in: the address, and the word typed in the Books search box
  const want = () => /^#bookcase\b/i.test(location.hash);
  window.addEventListener('hashchange', () => { if (want()) L59.open(); else if (on()) L59.close(); });
  if (want()) { let n = 0; const iv = setInterval(() => { n++; const ready = !(typeof SYNC82 !== 'undefined' && SYNC82.state === 'wait'); if (ready || n > 40) { clearInterval(iv); if (want()) L59.open(); } }, 500); }
  try { const s = document.getElementById('search'); if (s) s.addEventListener('input', () => { if (s.value.trim().toLowerCase() !== 'bookcase') return; s.value = ''; try { s.dispatchEvent(new Event('input', { bubbles: true })); } catch (e) {} try { s.blur(); } catch (e) {} L59.open(); }); } catch (e) {}

  // ---- styles: wood, brass and paper; nothing animates ----
  const B = 'html body #l59';
  const css = B + '{position:fixed;inset:0;z-index:2100;display:none;overflow-y:auto;-webkit-overflow-scrolling:touch;overscroll-behavior:contain;background:var(--d-bg,#0c0a16);color:var(--d-ink,#f4eef7);font:400 15px/1.45 Barlow,system-ui,sans-serif}' + B + '.on{display:block}html.l59-lock,html.l59-lock body{overflow:hidden}' +
    B + ' *{box-sizing:border-box;animation:none!important;transition:none!important}' + B + ' button{-webkit-appearance:none;appearance:none;font:inherit;color:inherit;margin:0;padding:0;border:0;background:none;cursor:pointer;-webkit-tap-highlight-color:transparent}' +
    B + ' .l59-in{max-width:430px;margin:0 auto;padding:calc(env(safe-area-inset-top) + 8px) 12px calc(env(safe-area-inset-bottom) + 190px)}' +
    B + ' .l59-top{display:flex;justify-content:space-between;align-items:center}' + B + ' .l59-x{min-height:44px;padding:0 14px 0 2px;font-size:15px;color:var(--d-mute,#aa9fbb)}' + B + ' .l59-top span{padding:3px 9px;border:1px solid var(--d-line,rgba(220,190,255,.2));border-radius:99px;font-size:12px;color:var(--d-mute,#aa9fbb)}' +
    B + ' .l59-hd{display:flex;justify-content:space-between;align-items:flex-end}' + B + ' .l59-hd h1{margin:0;font:400 58px/.9 "Den Cormorant","Cormorant Garamond",Georgia,serif}' + B + ' .l59-hd b{padding-bottom:5px;font:600 19px/1.1 "Barlow Condensed",Barlow,sans-serif}' +
    B + ' .l59-lead{margin:12px 0 0;font-size:13.5px;line-height:1.42;color:var(--d-mute,#aa9fbb)}' +
    B + ' .l59-tabs{display:grid;grid-template-columns:1.25fr 1fr 1fr;gap:6px;margin:14px 0 0}' + B + ' .l59-tg{display:grid;grid-template-columns:1fr 1.5fr;gap:6px;margin:12px 0 0}' +
    B + ' .l59-lk{display:grid;grid-template-columns:1fr 1fr;gap:6px;margin:6px 0 0}' + B + ' .l59-lk button{min-height:44px;border:1px solid var(--d-line,rgba(220,190,255,.2));font-size:13.5px}' + B + ' .l59-lk .on{background:var(--d-bg3,#201a38);border-color:var(--d-acc2,#dcc09a);color:var(--d-acc2,#dcc09a);font-weight:600}' +
    B + ' .l59-tabs button,' + B + ' .l59-tg button{min-height:44px;border:1px solid var(--d-line,rgba(220,190,255,.2));font-size:14px}' + B + ' .l59-tabs .on,' + B + ' .l59-tg .on{background:var(--d-ink,#f4eef7);color:var(--d-bg,#0c0a16);border-color:var(--d-ink,#f4eef7);font-weight:600}' + B + ' .l59-tg button{min-height:44px;font-size:13.5px;border-style:dashed}' + B + ' .l59-tg .on{border-style:solid}' +
    B + ' .l59-jump{display:flex;gap:6px;margin:12px -12px 0;padding:0 12px 2px;overflow-x:auto;-webkit-overflow-scrolling:touch;scrollbar-width:none}' + B + ' .l59-jump::-webkit-scrollbar{display:none}' + B + ' .l59-jump button{flex:none;min-height:44px;padding:0 13px;border:1px solid var(--d-line,rgba(220,190,255,.2));border-radius:99px;font-size:13.5px;white-space:nowrap}' +
    B + ' .l59-sea{display:flex;justify-content:space-between;align-items:flex-end;gap:10px;margin:26px 0 0}' +
    B + ' .l59-sea b{position:relative;z-index:1;margin:0 0 -3px 14px;padding:5px 16px 6px;border-radius:3px;background:linear-gradient(180deg,#ecd596,#b8923f 70%,#8e6c26);color:#2a1c06;font:700 21px/1 "Den Cormorant","Cormorant Garamond",Georgia,serif;letter-spacing:.02em;box-shadow:0 1px 0 #fff3c4 inset,0 2px 4px rgba(0,0,0,.6)}' +
    B + ' .l59-sea span{padding-bottom:7px;font-size:12.5px;color:var(--d-mute,#aa9fbb);text-align:right}' +
    B + ' .l59-case{padding:0 9px;border-top:9px solid #4a3324;border-radius:3px 3px 0 0;background:linear-gradient(90deg,#3a271b,#4f3626 4px,#33221a 9px,transparent 9px),linear-gradient(270deg,#3a271b,#4f3626 4px,#33221a 9px,transparent 9px),#17111c;box-shadow:0 1px 0 #6d5039 inset}' +
    B + ' .l59-sh{display:flex;align-items:flex-end;height:166px;padding:0;background:linear-gradient(180deg,rgba(0,0,0,.62),rgba(0,0,0,0) 40px),linear-gradient(90deg,rgba(0,0,0,.35),rgba(0,0,0,0) 14px,rgba(0,0,0,0) calc(100% - 14px),rgba(0,0,0,.35))}' +
    B + ' .l59-bd{position:relative;height:17px;background:repeating-linear-gradient(90deg,rgba(255,255,255,.035) 0 2px,rgba(0,0,0,0) 2px 9px,rgba(0,0,0,.05) 9px 11px,rgba(0,0,0,0) 11px 23px),linear-gradient(180deg,#8a6648 0,#6e4f37 2px,#523a29 60%,#2f2018);box-shadow:0 6px 9px rgba(0,0,0,.55)}' +
    B + ' .l59-bd i{position:absolute;top:2.5px;padding:1px 4px;border-radius:1.5px;background:#efe6d2;color:#2b2118;font:600 10px/1.05 "Barlow Condensed",Barlow,sans-serif;font-style:normal;white-space:nowrap}' + B + ' .l59-bd i.now{background:var(--d-acc,#e9a3b8);color:#1b1218}' +
    // a book: its cover at full shelf height, the block of pages beside it, and the marks that sit on the cover
    B + ' .l59-bk{position:relative;flex:none;display:flex;align-items:stretch;margin-right:6px;border-radius:2px 1px 0 0;box-shadow:0 0 0 .5px rgba(0,0,0,.55),3px 3px 7px rgba(0,0,0,.55)}' + B + ' .l59-bk.pk{margin-right:0;box-shadow:-5px 0 7px -1px rgba(0,0,0,.7)}' +
    B + ' .l59-bk .cv{position:relative;flex:none;display:flex;align-items:center;justify-content:center;overflow:hidden;border-radius:2px 0 0 0;background:var(--c);color:#f7f0e3}' +
    B + ' .l59-bk .cv img{position:absolute;inset:0;width:100%;height:100%;object-fit:contain;object-position:50% 50%}' + B + ' .l59-bk.pk .cv img{object-fit:cover;object-position:0 50%}' +
    B + ' .l59-bk .cv::after{content:"";position:absolute;z-index:3;inset:0;pointer-events:none;box-shadow:inset 1.5px 0 0 rgba(255,255,255,.24),inset 0 1.5px 0 rgba(255,255,255,.14),inset 6px 0 6px -4px rgba(0,0,0,.5)}' +
    B + ' .l59-bk .pg{flex:none;background:repeating-linear-gradient(90deg,#efe6d2 0 1px,#d3c5a8 1px 2px);box-shadow:inset 0 4px 4px -2px rgba(0,0,0,.4),inset -2px 0 0 var(--c)}' +
    B + ' .l59-bk .cv b{position:relative;padding:0 7px;text-align:center;font:600 13px/1.13 "Barlow Condensed",Barlow,sans-serif;letter-spacing:.01em}' + B + ' .l59-bk.ok .cv b{visibility:hidden}' +
    B + ' .l59-bk .cv b.dn{padding:0;writing-mode:vertical-rl;max-height:calc(100% - 30px);overflow:hidden;font-size:11.5px;line-height:1.09}' + B + ' .l59-bk .cv b.one{white-space:nowrap;font-size:10.5px}' +
    B + ' .l59-bk u{position:absolute;z-index:4;left:6px;bottom:6px;width:15px;height:15px;border-radius:50%;background:radial-gradient(circle at 35% 30%,#fff3c4,#d9a441 55%,#8a6418);box-shadow:0 1px 3px rgba(0,0,0,.8);text-decoration:none}' + B + ' .l59-bk.pk u{left:50%;margin-left:-5px;width:10px;height:10px}' +
    B + ' .l59-bk s{position:absolute;z-index:4;right:5px;bottom:6px;padding:2px 4px;background:#efe6d2;color:#2b2118;font:600 10px/1 "Barlow Condensed",Barlow,sans-serif;text-decoration:none;border-radius:1.5px;box-shadow:0 1px 2px rgba(0,0,0,.6)}' + B + ' .l59-bk.pk s{display:none}' +
    B + ' .l59-bk .rb{position:absolute;z-index:4;top:0;right:9px;width:11px;height:34px;background:var(--d-acc,#e9a3b8);clip-path:polygon(0 0,100% 0,100% 100%,50% 76%,0 100%)}' + B + ' .l59-bk.pk .rb{right:2px;width:6px;height:24px}' +
    B + ' .l59-bk.pick .cv b{font-style:italic;color:#d9d2e6}' +
    B + ' .l59-bk.gh{box-shadow:none}' + B + ' .l59-bk.gh .cv{background:none;border:1.5px dashed rgba(236,213,150,.6);border-bottom:0;color:rgba(239,230,210,.86)}' + B + ' .l59-bk.gh .cv::after{display:none}' + B + ' .l59-bk.gh .pg{background:none;border:1.5px dashed rgba(236,213,150,.35);border-left:0;border-bottom:0;box-shadow:none}' +
    B + ' .l59-bk.pc .cv{background:repeating-linear-gradient(115deg,rgba(255,255,255,.05) 0 3px,rgba(0,0,0,.04) 3px 7px),linear-gradient(90deg,#9a7648,#c19a69 30%,#b08a58 70%,#86643b)}' +
    B + ' .l59-bk.pc .cv::before{content:"";position:absolute;top:0;bottom:0;left:50%;width:2px;margin-left:-1px;background:#5b3d20;box-shadow:0 0 0 0 transparent}' + B + ' .l59-bk.pc .cv::after{inset:auto 0 auto 0;top:36%;height:2px;background:#5b3d20;box-shadow:none}' +
    B + ' .l59-bk.pc em{position:absolute;z-index:4;left:50%;top:36%;transform:translate(-50%,7px);padding:3px 6px;background:#efe6d2;color:#2b2118;font:600 12px/1.1 "Barlow Condensed",Barlow,sans-serif;font-style:normal;white-space:nowrap;box-shadow:0 1px 2px rgba(0,0,0,.5)}' + B + ' .l59-bk.pc em.nar{writing-mode:vertical-rl;padding:4px 2px;font-size:10px}' +
    B + ' .l59-gap{flex:none;display:flex;align-items:flex-end;height:150px}' + B + ' .l59-gap i{flex:none;width:14px;height:64px;border-radius:7px 7px 0 0;background:linear-gradient(90deg,#7c8089,#dfe1e6 42%,#6a6e77)}' +
    B + ' .l59-gap span{align-self:stretch;display:flex;align-items:center;justify-content:center;text-align:center;font:italic 600 15.5px/1.15 "Cormorant Garamond",Georgia,serif;color:rgba(236,213,150,.68)}' +
    B + ' .l59-seal{flex:none;display:flex;flex-direction:column;align-items:center;justify-content:flex-end;margin:0 3px}' +
    B + ' .l59-seal b,' + B + ' .l59-bigseal b{display:grid;place-items:center;width:40px;height:40px;border-radius:50%;background:radial-gradient(circle at 35% 28%,#fff3c4,#d9b45c 45%,#8e6c26);box-shadow:inset 0 0 0 2px rgba(92,64,14,.55),inset 0 0 0 4px rgba(255,243,196,.5),0 2px 4px rgba(0,0,0,.6);color:#3a2706;font:700 17px/1 "Den Cormorant","Cormorant Garamond",Georgia,serif}' +
    B + ' .l59-seal i,' + B + ' .l59-prize i{width:22px;height:9px;margin-top:-1px;background:linear-gradient(180deg,#8e6c26,#4d3a14);clip-path:polygon(22% 0,78% 0,100% 100%,0 100%)}' +
    B + ' .l59-prize{flex:none;display:flex;flex-direction:column;align-items:center;justify-content:flex-end;width:66px;margin:0 3px}' + B + ' .l59-prize svg{display:block}' +
    B + ' .l59-key{margin:16px 0 0;font-size:13px;line-height:1.42;color:var(--d-mute,#aa9fbb)}' +
    B + ' .l59-card{position:fixed;z-index:5;left:0;right:0;bottom:0;display:flex;gap:14px;padding:14px 14px calc(env(safe-area-inset-bottom) + 14px);background:var(--d-bg2,#141127);border-top:1px solid var(--d-line,rgba(220,190,255,.2));box-shadow:0 -12px 30px rgba(0,0,0,.6)}' + B + ' .l59-card[hidden]{display:none}' +
    B + ' .l59-cv{flex:none;width:92px}' + B + ' .l59-cv img{display:block;width:92px;height:138px;object-fit:cover;border-radius:2px;box-shadow:0 4px 10px rgba(0,0,0,.6)}' + B + ' .l59-cv svg{display:block;margin:0 auto}' +
    B + ' .l59-bigcl{display:grid;place-items:center;width:92px;height:138px;padding:8px;border-radius:2px;background:var(--c);color:#f7f0e3;text-align:center;font:500 15px/1.1 "Cormorant Garamond",Georgia,serif}' +
    B + ' .l59-bigpc{position:relative;width:92px;height:138px;border-radius:2px;background:linear-gradient(90deg,#9a7648,#c19a69 30%,#b08a58 70%,#86643b)}' + B + ' .l59-bigpc::before{content:"";position:absolute;top:0;bottom:0;left:50%;width:3px;margin-left:-1.5px;background:#5b3d20}' + B + ' .l59-bigpc::after{content:"";position:absolute;left:0;right:0;top:40%;height:3px;background:#5b3d20}' +
    B + ' .l59-bigseal{display:grid;place-items:center;width:92px;height:92px}' + B + ' .l59-bigseal b{width:76px;height:76px;font-size:32px}' +
    B + ' .l59-ct{flex:1;min-width:0}' + B + ' .l59-ct b{display:block;font:600 19px/1.12 "Barlow Condensed",Barlow,sans-serif}' + B + ' .l59-ct p{margin:5px 0 0;font-size:13.5px;line-height:1.38;color:var(--d-mute,#aa9fbb)}' +
    B + ' .l59-cb{display:flex;gap:8px;margin-top:11px}' + B + ' .l59-cb button{min-height:44px;padding:0 14px;border:1px solid var(--d-line,rgba(220,190,255,.24));font-size:14px}' + B + ' .l59-cb button[data-l59="book"]{background:var(--d-ink,#f4eef7);color:var(--d-bg,#0c0a16);border-color:var(--d-ink,#f4eef7);font-weight:600}';
  try { const st = document.createElement('style'); st.id = 'l59css'; st.textContent = css; document.head.appendChild(st); } catch (e) {}
})();

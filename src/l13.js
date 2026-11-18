// ===== L13: Import. One panel with Goodreads (library export CSV) and Apple Health (export.zip).
// Each row opens the app's export screen, then reads the file it saves. Nothing leaves the phone except the
// normal app save. Rules: never downgrade a finished book, never touch DNF, never overwrite a rating or a
// sleep night already in the app, steps only go up.
(function () {
  const L13 = window.L13 = {};
  const can = () => typeof CAN_EDIT === 'undefined' || CAN_EDIT;
  const O = k => { try { return getOverride(k) || {}; } catch (e) { return {}; } };
  const nT = s => { try { return normT(s); } catch (e) { return String(s || '').toLowerCase(); } };
  const td = () => { try { return today(); } catch (e) { return new Date().toISOString().slice(0, 10); } };
  const E = s => { try { return esc(String(s == null ? '' : s)); } catch (e) { return String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]); } };
  const I = window.L11I || {};
  const ic = (n, cls) => '<svg class="' + (cls || 'd-i') + '" viewBox="0 0 256 256" aria-hidden="true" fill="currentColor">' + (I[n] || '') + '</svg>';
  I['tray-arrow-down'] = I['tray-arrow-down'] || '<path d="M208,34H48A14,14,0,0,0,34,48V208a14,14,0,0,0,14,14H208a14,14,0,0,0,14-14V48A14,14,0,0,0,208,34ZM48,46H208a2,2,0,0,1,2,2V154H179.31a13.94,13.94,0,0,0-9.9,4.1L150.1,177.41a2,2,0,0,1-1.41.59H107.31a2,2,0,0,1-1.41-.58L86.59,158.1a13.94,13.94,0,0,0-9.9-4.1H46V48A2,2,0,0,1,48,46ZM208,210H48a2,2,0,0,1-2-2V166H76.69a2,2,0,0,1,1.41.58L97.41,185.9a13.94,13.94,0,0,0,9.9,4.1h41.38a13.94,13.94,0,0,0,9.9-4.1l19.31-19.31a2,2,0,0,1,1.41-.59H210v42A2,2,0,0,1,208,210ZM91.76,124.24a6,6,0,0,1,8.48-8.48L122,137.51V72a6,6,0,0,1,12,0v65.51l21.76-21.75a6,6,0,0,1,8.48,8.48l-32,32a6,6,0,0,1-8.48,0Z"/>';
  I['arrow-square-out'] = I['arrow-square-out'] || '<path d="M222,104a6,6,0,0,1-12,0V54.49l-69.75,69.75a6,6,0,0,1-8.48-8.48L201.51,46H152a6,6,0,0,1,0-12h64a6,6,0,0,1,6,6Zm-38,26a6,6,0,0,0-6,6v72a2,2,0,0,1-2,2H48a2,2,0,0,1-2-2V80a2,2,0,0,1,2-2h72a6,6,0,0,0,0-12H48A14,14,0,0,0,34,80V208a14,14,0,0,0,14,14H176a14,14,0,0,0,14-14V136A6,6,0,0,0,184,130Z"/>';
  const fmt = d => { try { return new Date(d + 'T12:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric' }); } catch (e) { return d; } };
  function rerender() { try { memoClear(); } catch (e) {} try { L4.clear(); } catch (e) {}
    try { if (currentLib === 'life' && typeof renderLife === 'function') renderLife(); else if (currentLib === 'books' && typeof renderTabContent === 'function') renderTabContent(); } catch (e) {}
    try { if (window.L11 && L11.head) L11.head(); } catch (e) {} }

  // ---------------- titles added from Goodreads (bought or shelved after the original import) ----------------
  const GROUP = 'From Goodreads';
  function addTitle(t, author, grId, series, num) { if (!t) return null; try {
    if (!META[t]) META[t] = {}; Object.assign(META[t], { gr: true, author: META[t].author || author || '' }); if (series && !META[t].series) { META[t].series = series; META[t].num = num || ''; }
    VIEWS.genre[GROUP] = VIEWS.genre[GROUP] || []; if (!VIEWS.genre[GROUP].some(x => x.title === t)) VIEWS.genre[GROUP].push({ title: t }); if (!ORDERS.genre.includes(GROUP)) ORDERS.genre.push(GROUP);
    if (!ALL_TITLES.includes(t)) ALL_TITLES.push(t); if (typeof GENRE_OF !== 'undefined' && !GENRE_OF[t]) GENRE_OF[t] = GROUP; return t; } catch (e) { return null; } }
  L13.restore = function () { const L = O('grnew').list || []; let n = 0; L.forEach(r => { if (Array.isArray(r) && typeof r[0] === 'string' && !ALL_TITLES.includes(r[0])) { if (addTitle(String(r[0]).slice(0, 300), String(r[1] || '').slice(0, 200), String(r[2] || ''), String(r[3] || ''), String(r[4] || ''))) n++; } }); return n; };

  // ---------------- Goodreads ----------------
  function csv(text) { const rows = []; let row = [], cell = '', q = false;
    for (let i = 0; i < text.length; i++) { const c = text[i];
      if (q) { if (c === '"') { if (text[i + 1] === '"') { cell += '"'; i++; } else q = false; } else cell += c; }
      else if (c === '"') q = true; else if (c === ',') { row.push(cell); cell = ''; }
      else if (c === '\n' || c === '\r') { if (c === '\r' && text[i + 1] === '\n') i++; row.push(cell); rows.push(row); row = []; cell = ''; } else cell += c; }
    if (cell || row.length) { row.push(cell); rows.push(row); } return rows; }
  const gDate = s => { const m = String(s || '').trim().match(/^(\d{4})[\/-](\d{1,2})[\/-](\d{1,2})$/); return m ? m[1] + '-' + m[2].padStart(2, '0') + '-' + m[3].padStart(2, '0') : ''; };
  const splitSeries = t => { const m = String(t).match(/^(.*?)\s*\(([^()]*?),?\s*#([\d.]+)\)\s*$/); return m ? [m[1].trim(), m[2].trim(), m[3]] : [String(t).trim(), '', '']; };
  L13.goodreads = function (text) {
    const rows = csv(String(text || '').replace(/^﻿/, '')); const head = rows.shift() || []; const ix = k => head.indexOf(k);
    const iT = ix('Title'), iA = ix('Author'), iS = ix('Exclusive Shelf'), iR = ix('My Rating'), iD = ix('Date Read'), iAdd = ix('Date Added'), iId = ix('Book Id');
    if (iT < 0 || iS < 0 || iId < 0) throw new Error('not a Goodreads export');
    const byId = {}, byNorm = {};
    (typeof GR !== 'undefined' ? GR : []).forEach(g => { if (g.gr) byId[String(g.gr)] = g.title; });
    ALL_TITLES.forEach(t => { if (/^(show|game|cv|hk|ab|gr):/.test(t)) return; const g = O(t).grId; if (g) byId[String(g)] = t; const n = nT(t); if (!byNorm[n] || (O(t).status && !O(byNorm[n]).status)) byNorm[n] = t; });
    const snap = O('grimp'); const first = !snap.at; const prev = snap.ids || {};
    const since = snap.since || '2026-09-26'; // the day the original Goodreads export was loaded
    const ids = {}; const res = { fin: [], now: [], rated: 0, added: [], seen: 0 }; const newList = (O('grnew').list || []).slice();
    rows.forEach(r => { if (r.length < 5) return; const id = String(r[iId] || '').trim(); const shelf = String(r[iS] || '').trim(); if (!id || !shelf) return; res.seen++; ids[id] = shelf;
      const [title, series, num] = splitSeries(r[iT]); const readAt = gDate(r[iD]); const added = gDate(r[iAdd]); const rating = parseInt(r[iR], 10) || 0;
      let t = byId[id] || (ALL_TITLES.includes(r[iT]) ? r[iT] : null) || byNorm[nT(title)] || null;
      const moved = !first && prev[id] !== shelf;
      if (!t) { if (!['read', 'currently-reading', 'to-read'].includes(shelf)) return; t = addTitle(title.slice(0, 300), String(r[iA] || '').slice(0, 200), id, series, num); if (!t) return;
        newList.push([t, String(r[iA] || '').slice(0, 200), id, series, num]); res.added.push(t); byId[id] = t;
        const base = { grId: id, src: 'goodreads' };
        if (shelf === 'read') setOverride(t, Object.assign(base, { status: 'read', finished: readAt || null, progress: 100 }, readAt ? {} : { chron: true }));
        else setOverride(t, Object.assign(base, { status: 'to-read' }));   // a new title on his Currently Reading shelf comes in as To-Read: Listening is only ever his own tap (Nov 17 2026)
        if (rating > 0) setOverride(t, { myRating: rating });
        return; }
      const o = O(t); const patch = {}; if (!o.grId) patch.grId = id;
      if (o.status !== 'dnf' && !o.grHold) {
        if (shelf === 'read' && o.status !== 'read') { if (readAt && (readAt >= since || moved)) { Object.assign(patch, { status: 'read', finished: readAt, progress: 100, src: 'goodreads' }); res.fin.push(t); }
          else if (moved) { Object.assign(patch, { status: 'read', finished: td(), progress: 100, src: 'goodreads' }); res.fin.push(t); } }
      }   // the Currently Reading shelf no longer makes a book Listening (Nov 17 2026)
      if (rating > 0 && !o.myRating) { patch.myRating = rating; res.rated++; }
      if (Object.keys(patch).length) setOverride(t, patch); });
    if (res.added.length) setOverride('grnew', { list: newList.slice(-600) });
    setOverride('grimp', { at: Date.now(), on: td(), ids, since: first ? since : (snap.since || since), last: { fin: res.fin.length, now: res.now.length, rated: res.rated, added: res.added.length } });
    return res; };

  // ---------------- Apple Health ----------------
  async function zipEntry(file, want) {
    const tl = Math.min(file.size, 65557 + 22); const tb = await file.slice(file.size - tl).arrayBuffer(); const tail = new DataView(tb);
    let eo = -1; for (let i = tl - 22; i >= 0; i--) if (tail.getUint32(i, true) === 0x06054b50) { eo = i; break; } if (eo < 0) throw new Error('zip');
    let cnt = tail.getUint16(eo + 10, true), csz = tail.getUint32(eo + 12, true), cof = tail.getUint32(eo + 16, true);
    if (cnt === 0xFFFF || csz === 0xFFFFFFFF || cof === 0xFFFFFFFF) { const lo = eo - 20; if (lo < 0 || tail.getUint32(lo, true) !== 0x07064b50) throw new Error('zip64');
      const zo = Number(tail.getBigUint64(lo + 8, true)); const z = new DataView(await file.slice(zo, zo + 56).arrayBuffer()); if (z.getUint32(0, true) !== 0x06064b50) throw new Error('zip64');
      cnt = Number(z.getBigUint64(32, true)); csz = Number(z.getBigUint64(40, true)); cof = Number(z.getBigUint64(48, true)); }
    const cd = new DataView(await file.slice(cof, cof + csz).arrayBuffer()); const dec = new TextDecoder(); let p = 0;
    for (let n = 0; n < cnt && p + 46 <= cd.byteLength; n++) { if (cd.getUint32(p, true) !== 0x02014b50) break;
      const method = cd.getUint16(p + 10, true); let cs = cd.getUint32(p + 20, true), us = cd.getUint32(p + 24, true); const nl = cd.getUint16(p + 28, true), xl = cd.getUint16(p + 30, true), cl = cd.getUint16(p + 32, true); let off = cd.getUint32(p + 42, true);
      const name = dec.decode(new Uint8Array(cd.buffer, cd.byteOffset + p + 46, nl)); let q = p + 46 + nl; const qe = q + xl;
      while (q + 4 <= qe) { const id = cd.getUint16(q, true), sz = cd.getUint16(q + 2, true); if (id === 1) { let r = q + 4; if (us === 0xFFFFFFFF) { us = Number(cd.getBigUint64(r, true)); r += 8; } if (cs === 0xFFFFFFFF) { cs = Number(cd.getBigUint64(r, true)); r += 8; } if (off === 0xFFFFFFFF) { off = Number(cd.getBigUint64(r, true)); r += 8; } } q += 4 + sz; }
      if (want(name)) { const lh = new DataView(await file.slice(off, off + 30).arrayBuffer()); if (lh.getUint32(0, true) !== 0x04034b50) throw new Error('zip'); return { name, method, cs, us, start: off + 30 + lh.getUint16(26, true) + lh.getUint16(28, true) }; }
      p += 46 + nl + xl + cl; }
    return null; }
  const attr = (tag, a) => { const i = tag.indexOf(' ' + a + '="'); if (i < 0) return ''; const j = tag.indexOf('"', i + a.length + 3); return j < 0 ? '' : tag.slice(i + a.length + 3, j); };
  const ms = s => { const m = String(s).match(/^(\d{4}-\d{2}-\d{2}) (\d{2}:\d{2}:\d{2}) ([+-])(\d{2})(\d{2})$/); return m ? Date.parse(m[1] + 'T' + m[2] + m[3] + m[4] + ':' + m[5]) : NaN; };
  const nextDay = d => { const x = new Date(d + 'T12:00:00Z'); x.setUTCDate(x.getUTCDate() + 1); return x.toISOString().slice(0, 10); };
  // scans export.xml text as it streams; keeps only steps per day and sleep per night, per source
  function scanner(since) { const S = {}, N = {}, B = {}; let rest = '';
    const add = (M, d, src, v) => { const x = M[d] || (M[d] = {}); x[src] = (x[src] || 0) + v; };
    const MK = [['IdentifierStepCount"', 's'], ['IdentifierSleepAnalysis"', 'z']];
    function tag(t, kind) { if (!t.startsWith('<Record ')) return; const sd = attr(t, 'startDate'); const day = sd.slice(0, 10); if (!day || day < since) return; const src = attr(t, 'sourceName') || '?';
      if (kind === 's') { const v = parseFloat(attr(t, 'value')); if (v > 0 && v < 100000) add(S, day, src, v); return; }
      const val = attr(t, 'value'); const a = ms(sd), b = ms(attr(t, 'endDate')); if (!(b > a)) return; const min = (b - a) / 60000; if (min > 1440) return;
      const night = +sd.slice(11, 13) >= 16 ? nextDay(day) : day;
      if (/Asleep/.test(val)) add(N, night, src, min); else if (/InBed/.test(val)) add(B, night, src, min); }
    function feed(chunk, end) { const buf = rest + chunk; let lastEnd = 0, cut = -1;
      for (const [mk, kind] of MK) { let i = 0; for (;;) { const j = buf.indexOf(mk, i); if (j < 0) break; const s = buf.lastIndexOf('<', j); const k = buf.indexOf('>', j);
          if (k < 0) { if (cut < 0 || s < cut) cut = s; break; } if (s >= 0) tag(buf.slice(s, k), kind); if (k + 1 > lastEnd) lastEnd = k + 1; i = k + 1; } }
      rest = end ? '' : (cut >= 0 ? buf.slice(cut) : buf.slice(Math.max(lastEnd, buf.length - 400))); }
    const best = M => { const o = {}; Object.keys(M).forEach(d => { o[d] = Math.max.apply(null, Object.values(M[d])); }); return o; };
    return { feed, done() { feed('', true); const steps = best(S), sleep = best(N), bed = best(B); Object.keys(bed).forEach(d => { if (!sleep[d]) sleep[d] = bed[d]; }); return { steps, sleep }; } }; }
  L13.healthScan = async function (file, since, onProg) {
    let stream, total = file.size;
    if (/\.xml$/i.test(file.name || '')) stream = file.stream();
    else { const e = await zipEntry(file, n => /(^|\/)export\.xml$/i.test(n)); if (!e) throw new Error('no export.xml'); total = e.cs;
      stream = file.slice(e.start, e.start + e.cs).stream(); if (e.method === 8) { if (typeof DecompressionStream === 'undefined') throw new Error('old'); stream = stream.pipeThrough(new DecompressionStream('deflate-raw')); } else if (e.method !== 0) throw new Error('method'); }
    const sc = scanner(since); const rd = stream.pipeThrough(new TextDecoderStream()).getReader();
    let last = 0; const t0 = Date.now(); let chars = 0;
    for (;;) { const { value, done } = await rd.read(); if (done) break; sc.feed(value, false); chars += value.length; if (onProg && Date.now() - last > 250) { last = Date.now(); onProg(chars, Date.now() - t0); } }
    return sc.done(); };
  L13.applyHealth = function (r) { const st = Object.assign({}, O('steps').days || {}); const sl = Object.assign({}, O('sleepd').nights || {}); let ds = 0, dn = 0;
    Object.keys(r.steps).forEach(d => { const n = Math.round(r.steps[d]); if (n > 0 && n < 200000 && n > (+st[d] || 0)) { st[d] = n; ds++; } });
    Object.keys(r.sleep).forEach(d => { const m = r.sleep[d]; if (m > 60 && m < 1200 && !(sl[d] && sl[d].h)) { sl[d] = { h: Math.round(m / 6) / 10, s: null, src: 'health' }; dn++; } });
    if (ds) setOverride('steps', { days: st, synced: td() }); if (dn) setOverride('sleepd', { nights: sl, synced: td() });
    setOverride('hkimp', { at: Date.now(), on: td(), days: ds, nights: dn }); return { days: ds, nights: dn }; };

  // ---------------- the panel ----------------
  let P = null;
  function lastGr() { const s = O('grimp'); if (!s.at) return 'Not imported yet.'; const l = s.last || {}; const bits = []; if (l.fin) bits.push(l.fin + ' finished'); if (l.now) bits.push(l.now + ' now reading'); if (l.rated) bits.push(l.rated + ' rated'); if (l.added) bits.push(l.added + ' new'); return 'Last import ' + fmt(s.on) + (bits.length ? ' · ' + bits.join(', ') : ' · nothing new'); }
  function lastHk() { const s = O('hkimp'); if (!s.at) return 'Not imported yet.'; return 'Last import ' + fmt(s.on) + ' · ' + (s.days || 0) + ' days of steps, ' + (s.nights || 0) + ' nights of sleep'; }
  // what the shelves have to show: a verified cover from the Sheet, his own art, embedded art, or nothing
  function coverCounts() { const c = { books: 0, store: 0, embedded: 0, miss: 0, none: 0, missing: [] }; try { ALL_TITLES.forEach(t => { if (!isBook(t)) return; c.books++; const o = O('cv:' + t); if (o.url) { c.store++; return; } if ((typeof ART !== 'undefined' && ART[t]) || (typeof COVERS !== 'undefined' && COVERS[t] && COVERS[t].cover_data)) { c.embedded++; return; } if (o.miss) c.miss++; else c.none++; c.missing.push(t); }); } catch (e) {} return c; }
  function coverLine() { const c = coverCounts(); const have = c.store + c.embedded; return have + ' of ' + c.books + ' books have a cover' + (c.missing.length ? ' · ' + c.missing.length + ' without one' + (c.miss ? ' (' + c.miss + ' not found in any catalog)' : '') : '') + '.'; }
  // loads one cover per host straight from the page and reports what the phone sees (the one thing a screenshot can't tell me)
  L13.coverTest = function () { const el = P && P.querySelector('#imp-cvt'); if (!el) return; const picks = []; const seen = new Set(); try { const all = Object.keys(OVERRIDES).filter(k => k.startsWith('cv:')); const games = all.filter(k => k.startsWith('cv:game:')); const shows = all.filter(k => k.startsWith('cv:show:')); const books = all.filter(k => !k.startsWith('cv:game:') && !k.startsWith('cv:show:')); [...games, ...shows, ...books].forEach(k => { const u = (OVERRIDES[k] || {}).url; if (!u) return; let h = ''; try { h = new URL(u).hostname; } catch (e) { return; } const key = (k.startsWith('cv:game:') ? 'game ' : k.startsWith('cv:show:') ? 'show ' : 'book ') + h; if (seen.has(key) || picks.length > 9) return; seen.add(key); picks.push({ k, u, key }); }); } catch (e) {}
    if (!picks.length) { el.textContent = 'No cover rows to test.'; return; } el.textContent = 'Testing ' + picks.length + '…';
    const sized = u => { try { return L11.sized(u, false); } catch (e) { return u; } };
    Promise.all(picks.map(p => new Promise(res => { const im = new Image(); const t0 = Date.now(); const done = ok => res(p.key + ': ' + (ok ? 'ok ' + im.naturalWidth + '×' + im.naturalHeight : 'FAILED') + ' · ' + (Date.now() - t0) + ' ms'); im.onload = () => done(true); im.onerror = () => done(false); setTimeout(() => done(false), 15000); im.src = sized(p.u); }))).then(lines => { el.innerHTML = lines.map(l => '<div>' + E(l) + '</div>').join('') + '<div>' + E('Build ' + (window.DEN_BUILD || '') + ' · SW ' + (navigator.serviceWorker && navigator.serviceWorker.controller ? 'on' : 'off')) + '</div>'; }); };
  L13.coverRetry = function () { const c = coverCounts(); let n = 0; c.missing.forEach(t => { try { const o = O('cv:' + t); if (o.miss) setOverride('cv:' + t, { miss: null, at: 0 }); if (window.L11 && L11.ensure) { L11.ensure(t); n++; } } catch (e) {} }); try { if (window.L11 && L11.startCovers) L11.startCovers(); } catch (e) {} return n; };
  function html() { return '<div class="d-imp-in"><button class="d-back" data-imp="close" aria-label="Back">' + ic('caret-left') + '</button><h2>Import</h2>' +
    '<section><div class="d-k">Goodreads</div><p>Shelves, ratings and finish dates.</p><ol>' +
    '<li>Open Goodreads. Sign in if asked. If the page looks like the phone version, tap <b>aA</b> in the address bar → <b>Request Desktop Website</b>.</li>' +
    '<li>Tap <b>Export Library</b>. A dated link appears under the button after a minute; tap it to download.</li>' +
    '<li>Come back here and choose the file. It’s in Downloads.</li></ol>' +
    '<div class="d-imp-b"><a class="d-btn" href="https://www.goodreads.com/review/import" target="_blank" rel="noopener noreferrer">' + ic('arrow-square-out') + 'Open Goodreads</a><button class="d-btn acc" data-imp="gr">Choose file</button></div>' +
    '<div class="d-imp-s" id="imp-gr-s">' + E(lastGr()) + '</div></section>' +
    '<section><div class="d-k">Apple Health</div><p>Steps and sleep for the last 90 days.</p><ol>' +
    '<li>Open Health. Tap your picture, top right.</li><li>Scroll down → <b>Export All Health Data</b> → <b>Export</b>. Keep the phone unlocked; it can take a few minutes.</li>' +
    '<li>Tap <b>Save to Files</b>. Then come back here and choose <b>export.zip</b>.</li></ol>' +
    '<div class="d-imp-b"><button class="d-btn" data-imp="health-open">' + ic('arrow-square-out') + 'Open Health</button><button class="d-btn acc" data-imp="hk">Choose file</button></div>' +
    '<div class="d-imp-s" id="imp-hk-s">' + E(lastHk()) + '</div></section>' +
    '<section><div class="d-k">Covers</div><div class="d-imp-s" id="imp-cv-s">' + E(coverLine()) + '</div><div class="d-imp-b"><button class="d-btn" data-imp="cv">Look again for the missing ones</button><button class="d-btn" data-imp="cvtest">Test image hosts</button></div><div class="d-imp-s" id="imp-cvt"></div></section>' +
    '<p class="d-imp-f">Audible has no export, so it isn’t here.</p><p class="d-imp-f">Build ' + E(String(window.DEN_BUILD || '').replace(/^(\d{4})(\d{2})(\d{2})(\d{2})(\d{2})$/, '$1-$2-$3 $4:$5')) + '</p>' +
    '<input type="file" id="imp-grf" accept=".csv,text/csv" hidden><input type="file" id="imp-hkf" accept=".zip,.xml,application/zip,text/xml" hidden></div>'; }
  L13.open = function () { L13.close(); P = document.createElement('div'); P.className = 'd-imp'; P.setAttribute('role', 'dialog'); P.setAttribute('aria-label', 'Import'); P.innerHTML = html(); document.body.appendChild(P);
    const gf = P.querySelector('#imp-grf'), hf = P.querySelector('#imp-hkf');
    gf.addEventListener('change', () => { const f = gf.files[0]; gf.value = ''; if (f) runGr(f); }); hf.addEventListener('change', () => { const f = hf.files[0]; hf.value = ''; if (f) runHk(f); });
    if (!can()) P.querySelectorAll('[data-imp="gr"],[data-imp="hk"]').forEach(b => { b.disabled = true; }); };
  L13.close = function () { if (P) { P.remove(); P = null; } };
  const say = (id, msg, cls) => { const el = P && P.querySelector('#' + id); if (el) { el.textContent = msg; el.className = 'd-imp-s' + (cls ? ' ' + cls : ''); } };
  function runGr(f) { if (f.size > 20e6) { say('imp-gr-s', 'That file is too big to be a Goodreads export.', 'bad'); return; } say('imp-gr-s', 'Reading…');
    f.text().then(txt => { const r = L13.goodreads(txt); rerender(); const bits = []; if (r.fin.length) bits.push(r.fin.length + ' finished'); if (r.now.length) bits.push(r.now.length + ' now reading'); if (r.rated) bits.push(r.rated + ' rated'); if (r.added.length) bits.push(r.added.length + ' new');
      const msg = bits.length ? 'From Goodreads: ' + bits.join(', ') : 'Goodreads matches the app. Nothing new.'; say('imp-gr-s', msg + ' · ' + r.seen + ' books checked', 'ok'); try { toast(msg); } catch (e) {} })
      .catch(() => say('imp-gr-s', 'That isn’t a Goodreads library export. Choose goodreads_library_export.csv.', 'bad')); }
  function runHk(f) { const since = (() => { const d = new Date(); d.setDate(d.getDate() - 90); return d.toISOString().slice(0, 10); })(); say('imp-hk-s', 'Reading your Health export…');
    const mb = f.size / 1e6;
    L13.healthScan(f, since, (chars, t) => say('imp-hk-s', 'Reading your Health export… ' + Math.round(chars / 1e6) + ' MB read' + (mb > 40 ? '. Keep Book Den open.' : '')))
      .then(r => { const a = L13.applyHealth(r); rerender(); const msg = 'From Health: ' + a.days + ' days of steps, ' + a.nights + ' nights of sleep'; say('imp-hk-s', (a.days || a.nights) ? msg : 'Health matches the app. Nothing new.', 'ok'); try { toast(msg); } catch (e) {} })
      .catch(e => say('imp-hk-s', /old/.test(e && e.message) ? 'This needs a newer iOS to unzip. Unzip export.zip in Files and choose export.xml instead.' : 'That isn’t a Health export. Choose export.zip (or export.xml).', 'bad')); }
  document.addEventListener('click', e => { const b = e.target.closest && e.target.closest('[data-imp]'); if (!b) return; const k = b.dataset.imp;
    if (k === 'open') { e.preventDefault(); e.stopPropagation(); L13.open(); return; }
    if (!P || !P.contains(b)) return; if (k === 'close') { e.preventDefault(); L13.close(); }
    else if (k === 'gr') { e.preventDefault(); P.querySelector('#imp-grf').click(); }
    else if (k === 'hk') { e.preventDefault(); P.querySelector('#imp-hkf').click(); }
    else if (k === 'health-open') { e.preventDefault(); try { window.location.href = 'x-apple-health://'; } catch (x) {} }
    else if (k === 'cvtest') { L13.coverTest(); }
    else if (k === 'cv') { const n = L13.coverRetry(); say('imp-cv-s', n ? 'Looking again for ' + n + ' cover' + (n > 1 ? 's' : '') + ' — they fill in as they are found.' : coverLine(), n ? 'ok' : ''); } }, true);
  document.addEventListener('keydown', e => { if (P && e.key === 'Escape') L13.close(); });

  // header button on Home and Books
  if (window.L11 && L11.head) { const _h = L11.head; L11.head = function () { const r = _h.apply(this, arguments); try { const d = document.querySelector('header.hero .d-head'); const lib = (typeof currentLib !== 'undefined' && currentLib) || 'life';
      if (d && (lib === 'life' || lib === 'books') && !d.querySelector('.d-impb')) d.insertAdjacentHTML('beforeend', '<button class="d-impb" data-imp="open" aria-label="Import from Goodreads or Apple Health">' + ic('tray-arrow-down') + '</button>'); } catch (e) {} return r; };
    try { L11.head(); } catch (e) {} }

  const css = document.createElement('style'); css.id = 'l13css'; css.textContent =
    'html body .d-head{position:relative}html body .d-head h1{padding-right:40px!important}html body .d-impb{position:absolute;right:-6px;bottom:-4px;width:44px;height:44px;border:0!important;background:none!important;box-shadow:none!important;color:var(--d-mute,#9a8f82)!important;display:flex;align-items:center;justify-content:center;padding:0;border-radius:50%!important}' +
    'html body .d-impb svg{width:24px;height:24px}html body .d-impb:active{background:var(--d-bg3,#26211d)!important}' +
    '.d-imp{position:fixed;inset:0;z-index:3500;background:var(--d-bg,#14110f);color:var(--d-ink,#efe6d8);overflow-y:auto;-webkit-overflow-scrolling:touch;font-family:Barlow,sans-serif}' +
    '.d-imp-in{max-width:560px;margin:0 auto;padding:calc(env(safe-area-inset-top,0px) + 60px) 20px calc(env(safe-area-inset-bottom,0px) + 40px);position:relative}' +
    '.d-imp .d-back svg{width:22px;height:22px}' +
    '.d-imp h2{font-family:Fraunces,serif;font-weight:400;font-size:30px;margin:0 0 8px;letter-spacing:-.01em}' +
    '.d-imp section{border-top:1px solid var(--d-line,rgba(239,230,216,.12));padding:20px 0 6px;margin-top:16px}' +
    '.d-imp p{margin:0 0 10px;color:var(--d-ink,#efe6d8);font-size:16px}.d-imp ol{margin:0 0 14px;padding-left:20px;color:var(--d-mute,#9a8f82);font-size:15px;line-height:1.45}.d-imp ol li{margin:0 0 6px}.d-imp ol b{color:var(--d-ink,#efe6d8);font-weight:500}' +
    '.d-imp-b{display:flex;gap:10px}.d-btn{flex:1;height:48px;display:flex;align-items:center;justify-content:center;gap:8px;border:1px solid var(--d-line,rgba(239,230,216,.12));border-radius:12px;background:var(--d-bg2,#1d1916);color:var(--d-ink,#efe6d8);font:500 15px Barlow,sans-serif;text-decoration:none;padding:0 10px;box-shadow:none}' +
    '.d-btn svg{width:18px;height:18px;flex:0 0 auto}.d-btn.acc{border-color:rgba(217,164,65,.5);color:var(--d-acc,#d9a441)}.d-btn:active{background:var(--d-bg3,#26211d)}.d-btn:disabled{opacity:.4}' +
    '.d-imp-s{margin:12px 0 0;font-size:14px;color:var(--d-mute,#9a8f82);min-height:20px}.d-imp-s.ok{color:var(--d-acc,#d9a441)}.d-imp-s.bad{color:#e08a6d}' +
    '.d-imp-f{margin-top:26px!important;font-size:14px!important;color:var(--d-mute,#9a8f82)!important}';
  document.head.appendChild(css);

  // re-register Goodreads-added titles on open, and again once the store has pulled (new device)
  try { L13.restore(); } catch (e) {}
  // Everything was Beautiful: he hasn't read it; Goodreads still lists it as read, so imports leave it alone.
  // Written only after the store has pulled, so a fresh device never pushes a half-empty record over the real one.
  let tries = 0; const tick = () => { if (typeof SYNC82 !== 'undefined' && SYNC82.state === 'wait' && tries++ < 60) return setTimeout(tick, 1000);
    try { if (L13.restore()) rerender(); } catch (e) {}
    const on = typeof SYNC82 !== 'undefined' && SYNC82.state === 'on'; if (!on || !can()) return;
    try { const ew = 'Everything was Beautiful and Nothing Hurt'; const o = O(ew); if (o.status && !o.grHold) setOverride(ew, { grHold: 1 }); } catch (e) {}
    // Moving personal text out of the public page: the phone keeps a full local copy, and the to-do lists and the
    // dates panel live in the store instead of the page's code. Runs only after a good pull, so nothing half-empty is written.
    try { if (typeof LOCAL !== 'undefined' && typeof OVERRIDES !== 'undefined') { let n = 0; Object.keys(OVERRIDES).forEach(k => { if (OVERRIDES[k] && !LOCAL[k]) { LOCAL[k] = OVERRIDES[k]; n++; } }); if (n && typeof saveLocal === 'function') saveLocal(); } } catch (e) {}
    try { const it = O('todo').items || {}; if (typeof todoSaveItems === 'function' && ['daily', 'weekly', 'major'].some(k => !it[k])) todoSaveItems('daily', todoItems('daily')); } catch (e) {}
    try { if (window.L7 && L7.CHATS0 && L7.CHATS0.goal && !(O('chats7').d || {}).goal) setOverride('chats7', { d: L7.CHATS0 }); } catch (e) {} };
  setTimeout(tick, 1200);
})();

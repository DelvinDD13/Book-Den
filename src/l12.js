// ===== L12: outside sources land in the library — Audible (daily job), Goodreads (shelf feeds), Apple Health (Shortcut).
// The store holds raw rows (ab:*, gr:*, hk:*). This applies them on open. Rules: never downgrade a finished book, never touch DNF,
// never stamp a finish date that isn't real — a book only becomes Finished with its real date, or with today's date when the flip
// happened since the last check (first run only records a baseline).
(function () {
  const L12 = window.L12 = {};
  const today0 = () => today();
  const can = () => typeof CAN_EDIT === 'undefined' || CAN_EDIT;
  const O = k => { try { return getOverride(k) || {}; } catch (e) { return {}; } };
  const nT = s => { try { return normT(s); } catch (e) { return String(s || '').toLowerCase(); } };
  let byNorm = null, byGr = null;
  function maps() { byNorm = {}; byGr = {}; (typeof ALL_TITLES !== 'undefined' ? ALL_TITLES : []).forEach(t => { if (/^(show|game|cv|hk|ab|gr):/.test(t)) return; const n = nT(t); if (!byNorm[n] || (O(t).status && !O(byNorm[n]).status)) byNorm[n] = t; const g = O(t).grId; if (g) byGr[String(g)] = t; }); }
  const find = (title, grId) => { if (!byNorm) maps(); if (grId && byGr[String(grId)]) return byGr[String(grId)]; if (typeof ALL_TITLES !== 'undefined' && ALL_TITLES.includes(title)) return title; return byNorm[nT(title)] || null; };
  L12.find = (t, g) => find(t, g);
  const rows = prefix => Object.keys(typeof OVERRIDES !== 'undefined' ? OVERRIDES : {}).filter(k => k.startsWith(prefix)).sort();
  const items = prefix => rows(prefix).reduce((a, k) => a.concat(O(k).items || []), []);
  const log = [];
  function finish(t, date, src) { const o = O(t); if (o.status === 'read' || o.status === 'dnf') return false; setOverride(t, { status: 'read', finished: date, progress: 100, src }); log.push('finished ' + t.split(':')[0] + ' (' + src + ')'); return true; }
  function listening(t, pct, src) { const o = O(t); if (o.status === 'read' || o.status === 'dnf') return false; const p = Math.max(0, Math.min(99, Math.round(pct || 0)));
    if (o.status === 'currently-reading') { if (p && p !== o.progress) { setOverride(t, { progress: p, src }); return true; } return false; }
    return false; }   // an outside source never makes a book Listening (Nov 17 2026, his words: "I will select what I listen to"); it may only move the progress of one he chose

  // ---- Audible ----
  function audible() { const meta = O('ab:meta'); if (!meta.at) return 0; const seen = O('absnap'); if (seen.at === meta.at) return 0;
    const L = items('ab:lib:'); if (!L.length) return 0; const first = !seen.at; const prevPct = seen.pct || {}, prevFin = seen.fin || {}; const pct = {}, fin = {}; let n = 0;
    L.forEach(([asin, title, author, isFin, p, status, fdate]) => { pct[asin] = p; if (isFin) fin[asin] = 1; let t = find(title);
      if (!t && (isFin || p > 0)) { t = L12.addTitle(title, author, 'New on Audible'); }
      if (!t) return;
      if (isFin) { if (fdate) { if (finish(t, fdate, 'audible')) n++; } else if (!first && !prevFin[asin]) { if (finish(t, today0(), 'audible')) n++; } return; }
      if (p > 0 && (first ? O(t).status === 'currently-reading' : p > (prevPct[asin] || 0))) { if (listening(t, p, 'audible')) n++; } });
    setOverride('absnap', { at: meta.at, pct, fin }); return n; }

  // ---- Goodreads ----
  function goodreads() { const meta = O('gr:meta'); if (!meta.at) return 0; const seen = O('grsnap'); if (seen.at === meta.at) return 0; const first = !seen.at; const prev = seen.ids || {}; const ids = {}; let n = 0; const since = seen.since || (() => { const d = new Date(); d.setDate(d.getDate() - 3); return d.toISOString().slice(0, 10); })();
    ['read', 'currently-reading', 'to-read'].forEach(shelf => { items('gr:' + shelf + ':').forEach(([id, title, author, readAt, rating]) => { ids[id] = shelf; const t = find(title, id); if (!t) return;
      if (shelf === 'read') { const moved = !first && prev[id] !== 'read'; if (readAt && (readAt >= since || moved)) { if (finish(t, readAt, 'goodreads')) n++; } else if (moved && !readAt) { if (finish(t, today0(), 'goodreads')) n++; } if (rating > 0 && !O(t).myRating) { setOverride(t, { myRating: rating }); n++; } }
      else if (shelf === 'currently-reading' && !first && prev[id] !== 'currently-reading') { if (listening(t, 0, 'goodreads')) n++; } }); });
    setOverride('grsnap', { at: meta.at, ids, since }); return n; }

  // ---- Apple Health ----
  const toNum = v => { if (typeof v === 'number') return v; const n = parseFloat(String(v == null ? '' : v).replace(/,/g, '').replace(/[^0-9.\-]/g, ' ').trim().split(/\s+/)[0]); return isFinite(n) ? n : 0; };
  const toMin = v => { if (typeof v === 'number') return v > 1440 ? v / 60 : (v > 0 && v < 24 ? v * 60 : v); const s = String(v || '').toLowerCase();
    if (/\d+:\d+/.test(s)) { const p = s.match(/(\d+):(\d+)(?::(\d+))?/); return (+p[1]) * 60 + (+p[2]) + (+(p[3] || 0)) / 60; }
    const h = s.match(/([\d.]+)\s*(h|hr|hour)/), m = s.match(/([\d.]+)\s*(m|min)/); if (h || m) return (h ? +h[1] * 60 : 0) + (m ? +m[1] : 0); return toMin(toNum(s)); };
  const prevDay = d => { const x = new Date(d + 'T12:00:00'); x.setDate(x.getDate() - 1); return x.toISOString().slice(0, 10); };
  function health() { const R = rows('hk:'); if (!R.length) return 0; const st = Object.assign({}, (O('steps').days) || {}); const sl = Object.assign({}, (O('sleepd').nights) || {}); let ds = 0, dn = 0;
    const put = (d, n) => { n = Math.round(toNum(n)); if (n > 0 && n < 200000 && n > (+st[d] || 0)) { st[d] = n; ds++; } };
    R.forEach(k => { const d = k.slice(3); if (!/^\d{4}-\d{2}-\d{2}$/.test(d)) return; const x = O(k); put(d, x.steps); if (x.ysteps != null) put(prevDay(d), x.ysteps);
      const m = toMin(x.sleep_min != null ? x.sleep_min : x.sleep); if (m > 60 && m < 1200 && !(sl[d] && sl[d].h)) { sl[d] = { h: Math.round(m / 6) / 10, s: null, src: 'health' }; dn++; } });
    if (ds) setOverride('steps', { days: st, synced: today0() }); if (dn) setOverride('sleepd', { nights: sl, synced: today0() }); return ds + dn; }

  // a title that isn't in the library yet (bought after the import)
  L12.addTitle = function (title, author, group) { try { if (!title) return null; if (!META[title]) META[title] = {}; if (author && !META[title].author) META[title].author = author;
      VIEWS.genre[group] = VIEWS.genre[group] || []; if (!VIEWS.genre[group].some(x => x.title === title)) VIEWS.genre[group].push({ title }); if (!ORDERS.genre.includes(group)) ORDERS.genre.push(group);
      if (!ALL_TITLES.includes(title)) ALL_TITLES.push(title); if (typeof GENRE_OF !== 'undefined' && !GENRE_OF[title]) GENRE_OF[title] = group; byNorm = null; return title; } catch (e) { return null; } };
  // titles added on earlier runs are registered again on every open
  function restoreAdded() { try { const L = items('ab:lib:'); L.forEach(([asin, title, author, isFin, p]) => { if (!find(title) && (isFin || p > 0)) L12.addTitle(title, author, 'New on Audible'); }); } catch (e) {} }

  L12.run = function () { if (!can()) return 0; if (typeof SYNC82 !== 'undefined' && SYNC82.state === 'wait') return 0; maps(); restoreAdded(); log.length = 0; let n = 0;
    try { n += audible(); } catch (e) { console.warn('l12 audible', e); } try { n += goodreads(); } catch (e) { console.warn('l12 goodreads', e); } try { n += health(); } catch (e) { console.warn('l12 health', e); }
    if (n) { try { memoClear(); } catch (e) {} try { L4.clear(); } catch (e) {} try { if (currentLib === 'life' && typeof renderLife === 'function') renderLife(); else if (currentLib === 'books' && typeof renderTabContent === 'function') renderTabContent(); } catch (e) {}
      const fins = log.filter(x => x.startsWith('finished')).length, lis = log.filter(x => x.startsWith('listening')).length; const parts = []; if (fins) parts.push(fins + ' finished'); if (lis) parts.push(lis + ' now listening'); if (parts.length) try { toast('From Audible and Goodreads: ' + parts.join(', ')); } catch (e) {} }
    L12.last = log.slice(); return n; };
  let tries = 0; const tick = () => { if (typeof SYNC82 !== 'undefined' && SYNC82.state === 'wait' && tries++ < 60) return setTimeout(tick, 1000); L12.run(); };
  setTimeout(tick, 1500); setInterval(() => { if (!document.hidden) L12.run(); }, 5 * 60000);
  document.addEventListener('visibilitychange', () => { if (!document.hidden) setTimeout(L12.run, 2500); });
})();

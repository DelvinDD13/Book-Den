// ===== L55: narrator badges. A Narrators section in the Books badges: a badge for each narrator with two or more of his
//   finished audiobooks (Bronze 2, Pewter 4, Gold 7, Atium 10 books), Favorite Narrator (books finished in one narrator's
//   voice) and Narrators Heard (different narrators across finished audiobooks). Narrators come from each book's own credits;
//   "full cast" and "others" are not people and are left out. The first time they appear they are filled in from his history
//   with one note, not a banner for each.
(function () {
  if (!window.L4 || !L4.defs) return;
  const D = L4.defs, H = ['#2a4a6b', '#0a1624'], TH = [2, 4, 7, 10];
  const SKIP = /^(others?|and others|full cast|a full cast|various|various narrators|uncredited|unknown|n\/a)$/i;
  const who = t => { const m = (typeof META !== 'undefined' && META[t]) || {}; return [...new Set(String(m.narrator || '').split(/\s*(?:,|&|;|\band\b)\s*/i).map(x => x.trim()).filter(x => x.length > 2 && !SKIP.test(x)))]; };
  const bk = b => ({ t: b.t, k: 'book', d: b.fin, b });
  const byD = (a, b) => (a.fin && b.fin) ? (a.fin < b.fin ? -1 : a.fin > b.fin ? 1 : 0) : a.fin ? 1 : b.fin ? -1 : 0;
  const slug = s => 'n_' + s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9]+/g, '_').replace(/^_|_$/g, '');
  const byN = c => { const m = {}; (c.read || []).forEach(b => { who(b.t).forEach(n => { (m[n] = m[n] || []).push(b); }); }); return m; };
  window.L55 = { who, byN };
  // a studio microphone; Favorite Narrator adds a star, Narrators Heard is three
  try { const C = 'currentColor', B = 'var(--bg)';
    const mic = (x, y, s) => '<g transform="translate(' + x + ' ' + y + ') scale(' + s + ')"><rect x="38" y="10" width="24" height="44" rx="12" fill="' + C + '"/><rect x="43" y="20" width="14" height="3.5" rx="1.75" fill="' + B + '"/><rect x="43" y="28" width="14" height="3.5" rx="1.75" fill="' + B + '"/><rect x="43" y="36" width="14" height="3.5" rx="1.75" fill="' + B + '"/>' +
      '<path d="M27 44 a23 23 0 0 0 46 0" fill="none" stroke="' + C + '" stroke-width="6" stroke-linecap="round"/><path d="M50 67 V82 M35 85 H65" fill="none" stroke="' + C + '" stroke-width="6" stroke-linecap="round"/></g>';
    L4_ICONS.narr = mic(0, 0, 1);
    L4_ICONS.favnarr = mic(-6, 4, 0.92) + '<path fill="' + C + '" d="M80 8 L83.5 17 L93 17.5 L85.6 23.5 L88.2 32.7 L80 27.4 L71.8 32.7 L74.4 23.5 L67 17.5 L76.5 17 Z"/>';
    L4_ICONS.narrheard = mic(-14, 18, 0.62) + mic(24, 4, 0.62) + mic(62, 18, 0.62);
  } catch (e) {}
  const STATIC = [{ cat: 'books', id: 'favnarr', name: 'Favorite Narrator', sub: 'lifetime', desc: 'Books finished in one narrator\'s voice', th: [5, 10, 15, 25], icon: 'favnarr', hue: H,
      items: c => { let best = []; Object.values(byN(c)).forEach(l => { if (l.length > best.length) best = l; }); return best.slice().sort(byD).map(bk); },
      cand: c => { const m = byN(c); let top = '', n = 0; Object.keys(m).forEach(k => { if (m[k].length > n) { n = m[k].length; top = k; } }); return top ? (c.B || []).filter(b => !b.read && who(b.t).indexOf(top) >= 0).slice(0, 20).map(bk) : []; } },
    { cat: 'books', id: 'narrheard', name: 'Narrators Heard', sub: 'lifetime', desc: 'Different narrators across finished audiobooks', th: [10, 25, 50, 100], icon: 'narrheard', hue: H,
      items: c => { const seen = {}; const out = []; (c.read || []).slice().sort(byD).forEach(b => { who(b.t).forEach(n => { if (!seen[n]) { seen[n] = 1; out.push({ t: n, k: 'note', d: b.fin, sub: String(b.t).replace(/\s*\([^)]*\)/g, '').replace(/:.*$/, '') }); } }); }); return out; },
      cand: c => { const seen = {}; Object.keys(byN(c)).forEach(n => { seen[n] = 1; }); return (c.B || []).filter(b => !b.read && who(b.t).some(n => !seen[n])).slice(0, 20).map(bk); } }];
  // one badge per narrator he has finished two or more books from; the list grows as he listens
  const have = {}; let ids = [], on = false; const INIT = 'den:narrinit';
  const ready = () => !(typeof SYNC82 !== 'undefined' && SYNC82.state === 'wait') && typeof META !== 'undefined';
  function section() { try { const S = L4.SECTIONS && L4.SECTIONS.books; if (!S || !on) return; let row = S.find(x => x[0] === 'Narrators'); if (!row) { const i = S.findIndex(x => x[0] === 'Authors'); row = ['Narrators', []]; S.splice(i >= 0 ? i + 1 : S.length, 0, row); } row[1] = ['favnarr', 'narrheard'].concat(ids); } catch (e) {} }
  const tierOf = (th, n) => th.filter(x => n >= x).length;
  // nothing is added until his data is in, so an early check never mistakes his whole history for new badges
  const firstRun = (() => { try { return !localStorage.getItem(INIT); } catch (e) { return false; } })(); const quietUntil = firstRun ? Date.now() + 120000 : 0; let quietN = 0, noted = false;
  function ensure() { if (!ready()) return; let c; try { c = L4.ctx(); } catch (e) { return; }
    if (!on) { on = true; STATIC.forEach(b => D.push(b)); }
    const m = byN(c); const L = Object.keys(m).filter(n => m[n].length >= TH[0]).sort((a, b) => m[b].length - m[a].length || a.localeCompare(b)); let added = 0;
    L.forEach(n => { const id = slug(n); if (have[id]) return; have[id] = 1; added++;
      D.push({ cat: 'books', id, name: n, sub: 'narrator', desc: 'Books finished in ' + n + '\'s voice', th: TH, icon: 'narr', hue: H, narr: n,
        items: c2 => ((byN(c2)[n]) || []).slice().sort(byD).map(bk), cand: c2 => (c2.B || []).filter(b => !b.read && who(b.t).indexOf(n) >= 0).slice(0, 20).map(bk) }); });
    const order = L.map(slug); if (added || order.join() !== ids.join()) { ids = order; section(); }
    if (added) { try { L4.clear(); } catch (e) {} } }
  // the first session after narrator badges arrive on this phone: what he has already earned (including whatever the store
  // brings in while the app opens) is filled in from his history with one note, not a banner each
  function prefill() { if (!firstRun || Date.now() > quietUntil || !ready()) return; try { const st = L4.state(); if (!st.init) return; const e = Object.assign({}, st.e || {}); let n = 0;
      _all.call(L4).forEach(b => { if (!(b.narr || b.id === 'favnarr' || b.id === 'narrheard') || !b.tier) return; if (e[b.id] && e[b.id].t >= b.tier) return; e[b.id] = { t: b.tier, at: today(), bf: 1 }; n++; });
      if (!n) return; quietN += n; setOverride('badges', Object.assign({}, st, { e })); try { localStorage.setItem(INIT, today()); } catch (x) {}
      if (!noted) { noted = true; setTimeout(() => { try { toast(quietN + ' narrator badges added from your listening'); } catch (x) {} }, 2500); } } catch (x) { console.warn('l55', x); } }
  const _all0 = L4.all; function _all() { try { ensure(); } catch (e) { console.warn('l55', e); } return _all0.apply(this, arguments); }
  L4.all = _all;
  const _sync = L4.sync; L4.sync = function () { try { L4.clear(); prefill(); } catch (e) {} return _sync.apply(this, arguments); };
})();

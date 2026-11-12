// ===== L52: badge alerts in the books' own words. The line under the badge name is what earned it: the book, show, game or
//   session that crossed the tier, the encyclopedia entries a lore badge opened, or the book's epigraph when that epigraph is a
//   public-domain quotation (word for word, with who said it). Nothing written by the app.
(function () {
  const L52 = window.L52 = {};
  // public-domain epigraphs only, keyed by the encyclopedia's book key; t matches the library title
  const EPI = {
    btah: { q: 'We should forgive our enemies, but not before they are hanged.', by: 'Heinrich Heine', of: 'Before They Are Hanged', t: /^Before They Are Hanged\b/i }
  };
  L52.EPI = EPI;
  const LS = { get(k, d) { try { const v = localStorage.getItem(k); return v == null ? d : JSON.parse(v); } catch (e) { return d; } }, set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) {} } };
  const KEY = 'den:alertlore';
  const shortT = t => String(t || '').replace(/\s*\((?:[^()]*)\)/g, '').replace(/:\s*[^:]*,\s*Book\s+[\d.]+.*$/i, '').trim();
  const md = d => { if (!d || !/^\d{4}-\d\d-\d\d/.test(d)) return ''; const x = new Date(d.slice(0, 10) + 'T12:00:00'); return isNaN(x) ? '' : x.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }); };
  const S29 = k => window.L29 && L29.by && L29.by[k];
  function openNow(k) { const s = S29(k); if (!s) return []; try { L29.flush(); } catch (e) {} return (s.e || []).filter(e => { try { return L29.ok(e.g || ''); } catch (x) { return false; } }).map(e => e.id); }
  // what each encyclopedia had open last time, so a lore alert can name only what is new
  L52.snap = function () { try { const S = LS.get(KEY, {}); let ch = 0; (L29.S || []).forEach(s => { if (!S[s.k]) { S[s.k] = openNow(s.k); ch = 1; } }); if (ch) LS.set(KEY, S); } catch (e) {} };
  function opened(k) { const S = LS.get(KEY, {}); const now = openNow(k); if (!S[k]) { S[k] = now; LS.set(KEY, S); return []; } const before = new Set(S[k]); S[k] = now; LS.set(KEY, S); const by = {}; ((S29(k) || {}).e || []).forEach(e => { by[e.id] = e; }); return now.filter(id => !before.has(id)).map(id => by[id]).filter(Boolean); }
  // the item that crossed the tier just earned (items are dated in order, undated first, as the badge engine counts them)
  L52.crossing = function (b) { try { const T = b.tier || (b.single ? 1 : 0); if (!T) return null; let it = typeof b.items === 'function' ? b.items(L4.ctx ? L4.ctx() : undefined) : b.items; it = (it || []).slice(); if (!it.length) return null;
      it.sort((x, y) => ((x.d || '') < (y.d || '') ? -1 : (x.d || '') > (y.d || '') ? 1 : 0)); const need = (b.th || [])[T - 1];
      if (!need) return it[it.length - 1]; if (typeof b.agg === 'function') { let s = 0; for (const x of it) { s += +b.agg(x) || 0; if (s >= need) return x; } return it[it.length - 1]; }
      return it[Math.min(it.length, need) - 1]; } catch (e) { return null; } };
  const epi = (o, p) => { o.desc = '“' + p.q + '”'; o.q = 1; o.by = p.by + ' · epigraph of ' + p.of; return o; };
  L52.line = function (b) { const o = Object.assign({}, b);
    try { if (b.lore && S29(b.lore)) { const E = opened(b.lore); if (E.length) { const p = E.map(e => EPI[String(e.g || '').split(':')[0]]).find(Boolean); if (p) return epi(o, p); const N = E.map(e => e.n).filter(Boolean); o.desc = 'Opened: ' + N.slice(0, 4).join(' · ') + (N.length > 4 ? ' · ' + (N.length - 4) + ' more' : ''); return o; } } } catch (e) {}
    const x = L52.crossing(b); if (x && x.t) { const p = x.k === 'book' && Object.values(EPI).find(e => e.t.test(x.t)); if (p) return epi(o, p); const d = x.k === 'steel' ? '' : md(x.d); o.desc = shortT(x.t) + (d ? ' · ' + d : ''); }
    return o; };
  (function () { if (!window.L25 || !L25.announce) return; const _a = L25.announce; L25.announce = function (news) { try { news = (news || []).map(b => L52.line(b)); } catch (e) {} return _a.call(this, news); }; })();
  setTimeout(() => L52.snap(), 2500);
})();

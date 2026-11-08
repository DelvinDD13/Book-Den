// ===== L24: Survivor of Hathsin — Mistborn stalled for almost two years, then the rest of the trilogy finished in one week (Nov 2026).
(function () {
  const L24 = window.L24 = {};
  const KEY = 'den:hathsin:20261108';
  const TRIO = ['Mistborn: The Final Empire', 'The Well of Ascension', 'The Hero of Ages'];
  const nt = t => { try { return normT(t); } catch (e) { return String(t).toLowerCase(); } };
  const find = (c, t) => c.B.find(b => b.t === t) || c.B.find(b => nt(b.t) === nt(t));
  // he finished The Hero of Ages on Nov 8: mark it once on this device unless he already has
  L24.apply = function () { try { if (typeof setOverride !== 'function' || !window.DEN_LINKED) return; if (localStorage.getItem(KEY)) return;
      const t = 'The Hero of Ages'; const o = getOverride(t) || {}; if (o.status !== 'read') setOverride(t, { status: 'read', finished: '2026-11-08', progress: 100, started: o.started || '2026-11-01' }); else if (!o.finished) setOverride(t, { finished: '2026-11-08' });
      localStorage.setItem(KEY, '1'); try { L4.clear(); } catch (e) {} } catch (e) { console.warn('l24 apply', e); } };
  const items = c => { const L = TRIO.map(t => find(c, t)).filter(Boolean); return L.every(b => b.read) ? L.map(b => ({ t: b.t, k: 'book', d: b.fin || (b.t === 'The Hero of Ages' ? '2026-11-08' : null), b })) : []; };
  const cand = c => TRIO.map(t => find(c, t)).filter(b => b && !b.read).map(b => ({ t: b.t, k: 'book', d: null, b }));
  const DEF = { cat: 'books', id: 'hathsin', name: 'Survivor of Hathsin', sub: 'Mistborn · Nov 2026', desc: 'Mistborn sat stalled for almost two years, then the rest of the trilogy fell in a single week', th: [3], icon: 'hathsin', hue: ['#3a2a1a', '#0f0b07'], single: 'gold', fmt: v => String(v), items, cand };
  (function () { try { if (!window.L4 || !L4.defs) return; if (!L4.defs.some(d => d.id === DEF.id)) L4.defs.push(DEF); L4.clear(); } catch (e) { console.warn('l24 badge', e); } })();
  (function () { const I = typeof L4_ICONS !== 'undefined' ? L4_ICONS : window.L4_ICONS; if (!I) return;
    I.hathsin = '<image href="art/kelsier.png" x="8" y="6" width="84" height="88" preserveAspectRatio="xMidYMid meet" clip-path="url(#l20face)" style="image-rendering:pixelated"/>'; })();
  // its own section at the top of the Books badges sheet
  (function () { if (!window.L4 || !L4.sheetHTML) return; const _sh = L4.sheetHTML; L4.sheetHTML = function (cat, focus) { let h = _sh.apply(this, arguments); try { if (cat !== 'books' && cat !== 'all') return h; const b = L4.all().find(x => x.id === 'hathsin'); if (!b) return h;
      const sec = '<div class="l4-sec"><div class="l4-st">Comebacks <small>' + (b.tier > 0 ? 1 : 0) + '/1</small></div><div class="l4-grid">' + L4.card(b, focus === 'hathsin') + '</div></div>';
      const k = h.indexOf('<div class="l4-sec">'); return k > 0 ? h.slice(0, k) + sec + h.slice(k) : h + sec; } catch (e) { return h; } }; })();
  (function () { if (!window.L15 || !L15.booksTop) return; const _bt = L15.booksTop; L15.booksTop = function () { try { L24.apply(); } catch (e) {} return _bt.apply(this, arguments); }; })();
})();

// ===== L23: Goodreads 2026 Reading Challenge — his twelve monthly Reader bookmarks (art cut from his own Goodreads screenshots, Nov 7 2026).
(function () {
  const L23 = window.L23 = {};
  const M = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  const F = ['jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec'];
  // as Goodreads showed it Nov 7: 46 of 60 read, 11 of 15 achievements, December still to come
  const GOAL = 60, READ_AT = 46, ASOF = '2026-11-07', EARNED = 11;
  L23.card = function () {
    const end = new Date('2026-12-31T23:59:59'), left = Math.max(0, Math.floor((end - new Date()) / 864e5));
    const marks = M.map((m, i) => { const got = i < EARNED; return '<div class="bm' + (got ? '' : ' bm-off') + '"><img src="art/bookmarks/' + F[i] + '.png" alt="' + m + ' Reader" loading="lazy"><b>' + m.slice(0, 3) + '</b><span>' + (got ? 'Earned' : 'Read one in ' + m) + '</span></div>'; }).join('');
    return '<div class="d-sec bm-sec"><div class="d-k">Reading Challenge 2026 <span class="b-n">' + EARNED + ' / 15</span></div>' +
      '<div class="bm-top"><div class="bm-n"><b>' + READ_AT + '</b><span>of ' + GOAL + ' books</span></div><div class="bm-bar"><i style="width:' + Math.round(READ_AT / GOAL * 100) + '%"></i></div><div class="bm-l">' + (GOAL - READ_AT) + ' to go · ' + left + ' days left · Goodreads count as of Nov 7</div></div>' +
      '<div class="bm-row">' + marks + '</div></div>';
  };
  const css = '.bm-sec{margin-top:6px}.bm-top{margin:4px 0 10px}.bm-n{display:flex;align-items:baseline;gap:8px}.bm-n b{font:400 34px/1 var(--b-disp,"Bebas Neue"),sans-serif;color:var(--d-ink)}.bm-n span{font:500 11px var(--b-mono,"IBM Plex Mono"),monospace;color:var(--d-mute);text-transform:uppercase}.bm-bar{height:6px;background:var(--d-bg3,#202026);margin:8px 0 6px;position:relative}.bm-bar i{position:absolute;left:0;top:0;bottom:0;background:var(--d-acc,#ff6a2a)}.bm-l{font:500 10px var(--b-mono,"IBM Plex Mono"),monospace;color:var(--d-mute);text-transform:uppercase;letter-spacing:.03em}.bm-row{display:flex;gap:10px;overflow-x:auto;padding:4px 0 8px;scrollbar-width:none}.bm{flex:0 0 64px;display:flex;flex-direction:column;align-items:center;gap:3px}.bm img{width:64px;height:auto;display:block}.bm b{font:400 15px var(--b-disp,"Bebas Neue"),sans-serif;color:var(--d-ink);letter-spacing:.04em}.bm span{font:500 9px var(--b-mono,"IBM Plex Mono"),monospace;color:var(--d-acc2,#ffb089);text-transform:uppercase;text-align:center}.bm-off img{filter:grayscale(1);opacity:.35}.bm-off span{color:var(--d-mute)}';
  try { const st = document.createElement('style'); st.id = 'l23css'; st.textContent = css.replace(/(^|\})\s*([^{}]+)\{/g, (a, p, sel) => p + sel.split(',').map(x => 'html body.den ' + x.trim()).join(',') + '{'); document.head.appendChild(st); } catch (e) {}
  (function () { if (!window.L15 || !L15.booksTop) return; const _bt = L15.booksTop; L15.booksTop = function () { let h = _bt.apply(this, arguments); try { const card = L23.card(); const i = h.indexOf('<div class="d-sec"><div class="d-k">Finished in'); h = i > 0 ? h.slice(0, i) + card + h.slice(i) : h + card; } catch (e) {} return h; }; })();
})();

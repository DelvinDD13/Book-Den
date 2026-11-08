// ===== L26: badges are Allomantic metals (Bronze, Pewter, Gold, Atium at the top); when one is earned Kelsier burns it.
//   Bronze — seeking pulses ring out from him.   Pewter — he swells, shudders with the strength, a grey flare.
//   Gold — his past self steps out of him, gold and see-through, then fades.   Atium — shadows of his next moves race ahead; he snaps into them.
(function () {
  const L26 = window.L26 = {};
  const ORDER = ['bronze', 'pewter', 'gold', 'atium'];
  L26.metal = b => b.single ? (b.single === 'plat' ? 'atium' : 'gold') : ORDER[Math.max(0, Math.min(3, (b.tier || 1) - 1))];
  L26.top = L => L.map(L26.metal).sort((a, b) => ORDER.indexOf(b) - ORDER.indexOf(a))[0] || 'bronze';
  const NAME = { bronze: 'Bronze', pewter: 'Pewter', gold: 'Gold', atium: 'Atium' };
  // the effect, built around any Kelsier sprite: host is a positioned box that holds the img
  L26.fx = function (host, img, metal) { try { if (!host || !img) return; host.querySelectorAll('.l26-fx').forEach(x => x.remove()); host.classList.remove('l26-bronze', 'l26-pewter', 'l26-gold', 'l26-atium'); void host.offsetWidth;
      const layer = document.createElement('span'); layer.className = 'l26-fx'; const src = img.getAttribute('src') || 'art/kelsier.png';
      const ghost = (cls, i) => { const g = document.createElement('img'); g.src = src; g.alt = ''; g.className = 'l26-g ' + cls; if (i != null) { g.style.setProperty('--i', i); g.style.setProperty('--d', (22 + 20 * i) + 'px'); } layer.appendChild(g); };
      if (metal === 'bronze') { for (let i = 0; i < 3; i++) { const r = document.createElement('i'); r.className = 'l26-ring'; r.style.setProperty('--i', i); layer.appendChild(r); } }
      if (metal === 'pewter') { const f = document.createElement('i'); f.className = 'l26-flare'; layer.appendChild(f); }
      if (metal === 'gold') ghost('l26-past');
      if (metal === 'atium') { for (let i = 0; i < 3; i++) ghost('l26-shadow', i); const a = document.createElement('i'); a.className = 'l26-aura'; layer.appendChild(a); }
      host.appendChild(layer); host.classList.add('l26-' + metal);
      clearTimeout(host._l26); host._l26 = setTimeout(() => { layer.remove(); host.classList.remove('l26-' + metal); }, 2600); } catch (e) {} };
  // the header Kelsier burns it too (he keeps swinging)
  L26.burnHeader = function (metal) { try { const dr = document.getElementById('dragon'); if (!dr || !dr.classList.contains('kelsier')) return; const w = dr.querySelector('.kel-body') || dr.querySelector('.kel-swing'), img = dr.querySelector('.dsprite'); L26.fx(w, img, metal); } catch (e) {} };
  // the banner gets its own Kelsier on the right, burning the metal of the best badge in it
  document.addEventListener('l25show', ev => { try { const L = ev.detail || []; if (!L.length || !L[0].tier && !L[0].single) return; const metal = L26.top(L); L26.burnHeader(metal);
      const el = document.getElementById('l25'); if (!el) return; const k = document.createElement('span'); k.className = 'l26-kel'; k.innerHTML = '<img src="art/kelsier.png" alt=""><small></small>'; k.querySelector('small').textContent = NAME[metal]; k.dataset.metal = metal; el.appendChild(k); setTimeout(() => L26.fx(k, k.querySelector('img'), metal), 250); } catch (e) {} });
  // L25 rebuilds the banner text each time; keep the Kelsier box last
  const css = [
    '#l25{padding-right:76px!important}#l25 .l26-kel{position:absolute;right:10px;top:50%;width:56px;height:58px;margin-top:-34px;display:block;overflow:visible}#l25 .l26-kel>img{width:56px;height:auto;display:block;image-rendering:pixelated;position:relative;z-index:2}#l25 .l26-kel small{position:absolute;left:-6px;right:-6px;bottom:-14px;text-align:center;font:500 9px var(--b-mono,"IBM Plex Mono"),monospace;letter-spacing:.1em;text-transform:uppercase;color:var(--d-mute)}',
    '#l25 .l26-kel[data-metal="bronze"] small{color:#d79a5c}#l25 .l26-kel[data-metal="pewter"] small{color:#aeb6bf}#l25 .l26-kel[data-metal="gold"] small{color:#e8bf4a}#l25 .l26-kel[data-metal="atium"] small{color:#c9bde8}',
    '.l26-fx{position:absolute;inset:0;pointer-events:none;z-index:1;overflow:visible}',
    '.l26-ring{position:absolute;left:50%;top:50%;width:40px;height:40px;margin:-20px 0 0 -20px;border:2px solid #c98a4b;border-radius:50%;opacity:0;animation:l26ring 1.5s ease-out calc(var(--i) * .38s) 2 both}',
    '.l26-pewter{animation:l26pew 1.6s cubic-bezier(.3,1.4,.5,1) both!important;will-change:transform}.l26-flare{position:absolute;left:50%;top:50%;width:90px;height:90px;margin:-45px 0 0 -45px;border-radius:50%;background:radial-gradient(circle,rgba(214,220,226,.55),rgba(143,152,162,.18) 45%,rgba(0,0,0,0) 70%);animation:l26flare 1.6s ease-out both}',
    '.l26-g{position:absolute;left:0;top:0;width:100%;height:auto;image-rendering:pixelated}.l26-past{filter:sepia(1) saturate(4) hue-rotate(-12deg) brightness(1.15);opacity:0;animation:l26past 2.2s ease-out both}',
    '.l26-shadow{filter:grayscale(1) brightness(1.6) contrast(.7);opacity:0;animation:l26shadow 1.9s cubic-bezier(.2,.8,.3,1) calc(var(--i) * .12s) both}#l25 .l26-kel{--dir:-1}',
    '.l26-atium{animation:l26snap 1.9s cubic-bezier(.65,0,.35,1) both!important;will-change:transform}.l26-aura{position:absolute;left:50%;top:50%;width:76px;height:76px;margin:-38px 0 0 -38px;border-radius:50%;background:conic-gradient(from 0deg,rgba(244,239,255,.0),rgba(154,144,180,.55),rgba(244,239,255,.0),rgba(154,144,180,.55),rgba(244,239,255,.0));animation:l26aura 1.9s linear both}'
  ].join('');
  try { const st = document.createElement('style'); st.id = 'l26css'; st.textContent = css.replace(/(^|\})\s*([^{}]+)\{/g, (a, p, sel) => p + sel.split(',').map(x => 'html body.den ' + x.trim()).join(',') + '{'); document.head.appendChild(st);
    const kf = document.createElement('style'); kf.id = 'l26kf'; kf.textContent =
      '@keyframes l26ring{0%{transform:scale(.4);opacity:.95}100%{transform:scale(2.6);opacity:0}}' +
      '@keyframes l26pew{0%{transform:scale(1)}20%{transform:scale(1.3)}26%{transform:scale(1.3) translate3d(-1.5px,0,0)}32%{transform:scale(1.3) translate3d(1.5px,0,0)}38%{transform:scale(1.3) translate3d(-1px,0,0)}44%{transform:scale(1.3) translate3d(0,0,0)}72%{transform:scale(1.24)}100%{transform:scale(1)}}' +
      '@keyframes l26flare{0%{transform:scale(.3);opacity:0}25%{transform:scale(1);opacity:1}100%{transform:scale(1.5);opacity:0}}' +
      '@keyframes l26past{0%{transform:translate(0,0);opacity:0}20%{opacity:.75}60%{transform:translate(-26px,-4px);opacity:.6}100%{transform:translate(-34px,-6px);opacity:0}}' +
      '@keyframes l26shadow{0%{transform:translateX(0);opacity:0}25%{transform:translateX(calc(var(--d) * var(--dir, 1)));opacity:.55}70%{transform:translateX(calc(var(--d) * var(--dir, 1)));opacity:.4}100%{transform:translateX(calc(var(--d) * var(--dir, 1)));opacity:0}}' +
      '@keyframes l26snap{0%,50%{transform:translate3d(0,0,0)}68%,82%{transform:translate3d(calc(62px * var(--dir, 1)),0,0)}100%{transform:translate3d(0,0,0)}}' +
      '@keyframes l26aura{0%{transform:rotate(0) scale(.6);opacity:0}20%{opacity:1}100%{transform:rotate(360deg) scale(1.2);opacity:0}}';
    document.head.appendChild(kf); } catch (e) {}
})();

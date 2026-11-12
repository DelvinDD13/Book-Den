// ===== L53: series scenes. Under the Stormlight, Mistborn and Throne of Glass looks, Home's masthead is the painted scene from
//   the cover of the series book being read (or the last one read), cut into layers on the phone so it moves: the sky drifts
//   behind the figure (Stormlight, with lightning that jolts the masthead), the figure floats in front of the mist (Mistborn),
//   or the scene pushes in under firelight (Throne of Glass). Each look takes its colours from its painting.
//   The paintings are never copied into the site: the app already loads each cover from Apple's image server, and only the
//   cut-out shapes (art/scenes) live here, with a short hash of the cover address they were cut from, so they are only ever
//   laid over that same picture. The Books tab shows the series' covers fanned over the painting, blurred, and the series'
//   encyclopedia shows the painting across the top of its title, fading into the page.
(function () {
  const L53 = window.L53 = {};
  // x: the painted part of the cover (left, top, right, bottom as fractions), ar: that part's shape, m: how it moves,
  // p: where it sits in the masthead (like object-position), h: hash of the cover's address, c: the credit line
  const B = {
    wok: { x: [0, 0.482, 1, 0.885], ar: 1.648, m: 'sky', p: [50, 30], h: 'fa24dfe0', c: 'The Way of Kings · Michael Whelan' },
    wor: { x: [0, 0.475, 1, 0.885], ar: 1.619, m: 'sky', p: [55, 50], h: '684bfbf7', c: 'Words of Radiance · Michael Whelan' },
    ob: { x: [0, 0.395, 1, 0.79], ar: 1.691, m: 'push', p: [55, 50], h: '4715855b', c: 'Oathbringer · Michael Whelan' },
    row: { x: [0, 0.4, 1, 0.8], ar: 1.529, m: 'push', p: [35, 50], h: 'c17d4bb7', c: 'Rhythm of War · Michael Whelan' },
    wat: { x: [0, 0.385, 1, 0.775], ar: 1.662, m: 'sky', p: [50, 50], h: '59fbfb82', c: 'Wind and Truth · Michael Whelan' },
    tfe: { x: [0, 0, 1, 0.31], ar: 2.14, m: 'float', p: [50, 50], h: 'b6a7a60d', c: 'Mistborn: The Final Empire' },
    woa: { x: [0, 0, 1, 0.36], ar: 1.84, m: 'push', p: [60, 50], h: '4ead4d7c', c: 'The Well of Ascension' },
    hoa: { x: [0, 0, 1, 0.36], ar: 1.843, m: 'float', p: [50, 62], h: '2b6b74cd', c: 'The Hero of Ages' },
    tog: { x: [0.08, 0.738, 0.92, 0.955], ar: 2.579, m: 'push', p: [50, 60], h: '5f7f5770', c: 'Throne of Glass', glow: 1 }
  };
  // the looks with scenes: their series, its books in order, and the colours taken from the paintings (accent, second accent, ground)
  const SC = {
    storm: { s: 'stormlight', ks: ['wok', 'wor', 'ob', 'row', 'wat'], fx: 'storm', v: ['#efb058', '#cc5f3f', '#120f1a'] },
    ash: { s: 'mistborn', ks: ['tfe', 'woa', 'hoa'], v: ['#f79353', '#f5ba70', '#14111d'] },
    glass: { s: 'tog', ks: ['tog'], v: ['#d23a55', '#1690be', '#0b0708'] }
  };
  L53.B = B; L53.SC = SC;
  const E = s => String(s == null ? '' : s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  // the cover's address without its size, and a short hash of it (FNV-1a, the same as the job that cut the shapes)
  const norm = u => String(u || '').split('?')[0].replace(/\/\d+x\d+[a-z]*(?:-\d+)?\.(?:jpg|jpeg|png|webp)$/i, '');
  const fnv = s => { let h = 0x811c9dc5; for (let i = 0; i < s.length; i++) h = Math.imul(h ^ s.charCodeAt(i), 0x01000193) >>> 0; return ('0000000' + h.toString(16)).slice(-8); };
  L53.norm = norm; L53.fnv = fnv;
  // the full-size cover a scene was cut from, only if the library still has exactly that picture
  function src(k) { try { const b = window.L29 && L29.B && L29.B[k]; if (!b || !b.m || !B[k]) return ''; const rx = new RegExp(b.m, 'i');
      for (const t of ALL_TITLES) { if (!rx.test(t)) continue; const u = (getOverride('cv:' + t) || {}).url; if (u && /mzstatic\.com\//.test(u) && fnv(norm(u)) === B[k].h) return norm(u) + '/1400x2100bb.jpg'; } } catch (e) {} return ''; }
  L53.src = src;
  // the series book to show: the one being read, else the last one read, else the first. If that book's cover is not the one
  // the shapes were cut from there is no scene (never a later book's cover instead).
  L53.pick = function (th) { const S = SC[th]; if (!S || !window.L29 || !L29.B) return null; let k = '';
    try { k = S.ks.find(x => L29.started(x) && !L29.read(x)) || S.ks.filter(x => L29.read(x)).pop() || S.ks[0]; } catch (e) { return null; }
    const u = src(k); return u ? { k: k, u: u, b: B[k] } : null; };
  // one copy of the painted part, sized to cover its box the way object-fit: cover would, and placed by p
  const pc = n => (Math.round(n * 1000) / 1000) + '%';
  const imgAt = b => { const X = b.x, w = X[2] - X[0], h = X[3] - X[1]; return 'position:absolute;display:block;max-width:none;max-height:none;object-fit:fill;filter:none;opacity:1;margin:0;width:' + pc(100 / w) + ';height:' + pc(100 / h) + ';left:' + pc(-100 * X[0] / w) + ';top:' + pc(-100 * X[1] / h); };
  function box(p, mask, inner) { const b = p.b, M = mask ? 'url(art/scenes/' + p.k + '_' + mask + '.png)' : '';
    const st = 'position:absolute;overflow:hidden;aspect-ratio:' + b.ar + ';width:100%;width:max(100cqw,calc(100cqh * ' + b.ar + '));left:' + b.p[0] + '%;top:' + b.p[1] + '%;transform:translate(-' + b.p[0] + '%,-' + b.p[1] + '%)' +
      (M ? ';-webkit-mask-image:' + M + ';mask-image:' + M + ';-webkit-mask-size:100% 100%;mask-size:100% 100%;-webkit-mask-repeat:no-repeat;mask-repeat:no-repeat' : '');
    return '<div class="l53-box" style="' + st + '">' + (inner || '<img src="' + E(p.u) + '" alt="" draggable="false" style="' + imgAt(b) + '">') + '</div>'; }
  L53.box = box;
  // Home's layers. sky: the painting, its sky drifting, the figure on top. float: the painting with the figure lifted out and
  // the gap filled (on the phone), drifting, the figure floating in front. push: the painting slowly pushing in.
  function layers(p) { const L = (cls, inner) => '<div class="l53-L ' + cls + '">' + inner + '</div>', m = p.b.m;
    if (m === 'sky') return L('l53-base', box(p)) + L('l53-sky', box(p, 'sky')) + L('l53-fg', box(p, 'fg'));
    if (m === 'float') return L('l53-base', box(p)) + L('l53-drift', box(p, '', '<canvas class="l53-fill" style="position:absolute;left:0;top:0;width:100%;height:100%;display:block"></canvas>')) + L('l53-fg l53-bob', box(p, 'fg'));
    return L('l53-push', box(p) + (p.b.glow ? '<i class="l53-glow"></i>' : '')); }
  // the gap left by the figure, filled from the painting around it (pull-push: halve the picture until it is tiny, the gap
  // counting for nothing, then lay each level back over the one below it). Only drawing is used, so it works with Apple's
  // pictures as they are; the result stays on the phone.
  const FILL = {};
  const load = u => new Promise((ok, no) => { const i = new Image(); i.decoding = 'async'; i.onload = () => ok(i); i.onerror = () => no(new Error('image')); i.src = u; });
  function fill(p) { const key = p.k + '|' + p.u; if (FILL[key]) return FILL[key];
    return FILL[key] = Promise.all([load(p.u), load('art/scenes/' + p.k + '_hole.png')]).then(([im, mk]) => {
      const X = p.b.x, W0 = im.naturalWidth, H0 = im.naturalHeight, sx = X[0] * W0, sy = X[1] * H0, sw = (X[2] - X[0]) * W0, sh = (X[3] - X[1]) * H0;
      if (!sw || !sh) throw new Error('size');
      const cv = (w, h) => { const c = document.createElement('canvas'); c.width = Math.max(1, Math.round(w)); c.height = Math.max(1, Math.round(h)); return c; };
      const ctx = c => { const g = c.getContext('2d'); g.imageSmoothingEnabled = true; g.imageSmoothingQuality = 'high'; return g; };
      const w = Math.min(1400, Math.round(sw)), h = Math.round(w * sh / sw); const A = cv(w, h), a = ctx(A);
      a.drawImage(im, sx, sy, sw, sh, 0, 0, w, h); a.globalCompositeOperation = 'destination-in'; a.drawImage(mk, 0, 0, w, h); a.globalCompositeOperation = 'source-over';
      const P = [A]; while (P[P.length - 1].width > 8 && P[P.length - 1].height > 4) { const s = P[P.length - 1], d = cv(Math.ceil(s.width / 2), Math.ceil(s.height / 2)); ctx(d).drawImage(s, 0, 0, d.width, d.height); P.push(d); }
      const top = P[P.length - 1], T = cv(top.width, top.height), t = ctx(T), g = ctx(top);
      for (let i = 0; i < 12; i++) { t.clearRect(0, 0, T.width, T.height); t.drawImage(top, 0, 0); g.drawImage(T, 0, 0); }
      g.globalCompositeOperation = 'destination-over'; g.fillStyle = (SC[Object.keys(SC).find(th => SC[th].ks.indexOf(p.k) >= 0)] || SC.ash).v[2]; g.fillRect(0, 0, top.width, top.height); g.globalCompositeOperation = 'source-over';
      let R = top; for (let i = P.length - 2; i >= 0; i--) { const d = cv(P[i].width, P[i].height), x = ctx(d); x.drawImage(R, 0, 0, d.width, d.height); x.drawImage(P[i], 0, 0); if (R !== top) R.width = R.height = 0; R = d; }
      P.forEach(c => { c.width = c.height = 0; }); T.width = T.height = 0;
      // the paintings are airbrushed with a fine grain; the filled gap gets the same grain so it does not read as a smooth patch
      try { const N = cv(w, h), n = N.getContext('2d'), id = n.createImageData(w, h), q = id.data; for (let i = 0; i < q.length; i += 4) { const r = Math.random(); const v = r < 0.05 ? 215 + r * 800 : r < 0.09 ? 55 : 128 + (Math.random() + Math.random() + Math.random() - 1.5) * 46; q[i] = q[i + 1] = q[i + 2] = v; q[i + 3] = 255; }
        n.putImageData(id, 0, 0); n.globalCompositeOperation = 'destination-out'; n.drawImage(mk, 0, 0, w, h); const g2 = R.getContext('2d'); g2.globalCompositeOperation = 'overlay'; g2.globalAlpha = 0.6; g2.drawImage(N, 0, 0); g2.globalAlpha = 1; g2.globalCompositeOperation = 'source-over'; N.width = N.height = 0; } catch (e) {}
      return R; });
  }
  L53.fill = fill;
  // three covers from the series for the Books tab: the one being read in the middle, its neighbours either side
  const cover = t => { try { const c = getOverride('cv:' + t) || {}; if (c.url) return (window.L11 && L11.sized) ? L11.sized(c.url, false) : c.url; } catch (e) {} return ''; };
  L53.covers = function (sk) { const S = window.L29 && L29.by && L29.by[sk]; if (!S) return []; const L = [];
    S.books.forEach(b => { const bk = L29.B[b.k]; if (!bk || !bk.m) return; let rx; try { rx = new RegExp(bk.m, 'i'); } catch (e) { return; } const t = ALL_TITLES.filter(x => rx.test(x)).find(x => cover(x)); if (t) L.push({ k: b.k, u: cover(t), on: L29.started(b.k) && !L29.read(b.k), rd: L29.read(b.k) }); });
    if (L.length <= 3) return L; let i = L.findIndex(x => x.on); if (i < 0) { i = L.map(x => x.rd).lastIndexOf(true); if (i < 0) i = 0; } i = Math.max(1, Math.min(L.length - 2, i)); return [L[i - 1], L[i], L[i + 1]]; };
  // the book being read (else the last one read) is the card in front
  const fan = C => { if (!C.length) return ''; let f = C.findIndex(c => c.on); if (f < 0) f = C.map(c => c.rd).lastIndexOf(true); if (f < 0) f = Math.floor(C.length / 2);
    return '<div class="l53-fan n' + C.length + '">' + C.map((c, i) => '<img class="c c' + i + (i === f ? ' on' : '') + '" src="' + E(c.u) + '" alt="" style="z-index:' + (3 - Math.abs(i - f)) + '">').join('') + '</div>'; };
  // take a scene off a masthead (Home keeps its own picture underneath, so it simply shows again)
  function clear(m) { if (!m) return; m.querySelectorAll(':scope > .l53-wrap, :scope > .l53-c, :scope > .l53-fan').forEach(x => x.remove()); m.classList.remove('l53', 'l53-storm'); delete m.dataset.l53; }
  L53.clear = clear;
  // paint one masthead; true when the scene is on it
  function paint(m, th, home) { try { const S = SC[th]; if (!m || !S) { clear(m); return false; } const p = L53.pick(th); if (!p) { clear(m); return false; }
      const C = home ? [] : L53.covers(S.s); const key = th + ':' + p.k + ':' + (home ? 'home' : 'tab:' + C.map(c => c.k).join('.'));
      if (m.dataset.l53 === key && m.querySelector(':scope > .l53-wrap')) return true;
      clear(m); if (!home) m.innerHTML = ''; m.dataset.l53 = key; m.classList.add('l53'); m.classList.toggle('l53-storm', S.fx === 'storm');
      const w = document.createElement('div'); w.className = 'l53-wrap'; w.setAttribute('aria-hidden', 'true'); w.dataset.k = p.k;
      w.innerHTML = home ? layers(p) : '<div class="l53-L l53-blur">' + box(p) + '</div>'; m.appendChild(w);
      if (home) m.insertAdjacentHTML('beforeend', '<span class="l53-c">' + E(p.b.c) + '</span>'); else if (C.length) m.insertAdjacentHTML('beforeend', fan(C));
      if (home && p.b.m === 'float') fill(p).then(R => { w.querySelectorAll('canvas.l53-fill').forEach(c => { c.width = R.width; c.height = R.height; c.getContext('2d').drawImage(R, 0, 0); }); w.classList.add('ready'); })
        .catch(() => { const base = w.querySelector('.l53-base'); if (base) base.classList.add('l53-push'); w.querySelectorAll('.l53-drift, .l53-fg').forEach(x => x.remove()); w.classList.add('ready'); });
      else w.classList.add('ready');
      return true; } catch (e) { console.warn('l53', e); clear(m); return false; } }
  L53.paint = paint;
  // the Books masthead under a scene look; under any other look the tab's own montage comes back
  function tab() { try { if (typeof currentLib === 'undefined' || currentLib !== 'books' || !window.L34) return; const m = document.querySelector('header.hero .b-mast'); if (!m) return;
      const th = L34.current(); if (SC[th] && paint(m, th, false)) return;
      if (m.dataset.l53) { clear(m); delete m.dataset.k; try { L11.head(); } catch (e) {} } } catch (e) { console.warn('l53 tab', e); } }
  L53.tab = tab;
  // no pixel sprites (the blade, Kelsier, the dragon) over the paintings, whatever mascot is chosen
  (function () { if (!window.L34 || !L34.mascot) return; const _m = L34.mascot; L34.mascot = function () { try { if (SC[L34.current()]) return null; } catch (e) {} return _m.apply(this, arguments); }; })();
  (function () { if (typeof switchLib === 'function') { const _s = switchLib; switchLib = function () { const r = _s.apply(this, arguments); setTimeout(tab, 30); return r; }; }
    if (window.L34 && L34.apply) { const _a = L34.apply; L34.apply = function () { const r = _a.apply(this, arguments); setTimeout(tab, 30); return r; }; } })();
  try { const hd = document.querySelector('header.hero'); if (hd) new MutationObserver(() => { if (typeof currentLib !== 'undefined' && currentLib === 'books') { const m = hd.querySelector('.b-mast'); if (m && !m.dataset.l53 && window.L34 && SC[L34.current()]) tab(); } }).observe(hd, { childList: true }); } catch (e) {}
  // each scene look takes its colours from the painting (Steel keeps its own era colours)
  const lift = (h, f) => { const n = parseInt(h.slice(1), 16); const c = [n >> 16, (n >> 8) & 255, n & 255].map(x => Math.min(255, Math.round(x + (255 - x) * f))); return '#' + c.map(x => x.toString(16).padStart(2, '0')).join(''); };
  (function () { const st = document.createElement('style'); st.id = 'l53col'; st.textContent = Object.keys(SC).map(th => { const v = SC[th].v; return 'html.l34.th-' + th + ':not(.l51-on){--d-acc:' + v[0] + ';--d-acc2:' + v[1] + ';--d-bg:' + v[2] + ';--d-bg2:' + lift(v[2], 0.035) + ';--d-bg3:' + lift(v[2], 0.09) + ';--th-sky:' + v[2] + '}html.l34.th-' + th + ':not(.l51-on) body.den{background:' + v[2] + '}'; }).join(''); document.head.appendChild(st); })();
  const P = s => s.split(',').map(x => 'html body.den header.hero ' + x.trim()).join(',');
  const R = (sel, body) => P(sel) + '{' + body + '}';
  const css = [
    R('.b-mast.l53', 'overflow:hidden;background:var(--d-bg,#0b0b0d)'),
    R('.b-mast.l53 > img', 'visibility:hidden'),
    R('.b-mast.l53:not(.l53-storm):after', 'display:none!important'),
    R('.b-mast.l53:before', 'content:"";position:absolute;inset:0;z-index:1;pointer-events:none;background:linear-gradient(rgba(0,0,0,.2),rgba(0,0,0,0) 28%,rgba(0,0,0,0) 58%,var(--d-bg) 100%)'),
    R('.b-mast.l53-storm:after', 'content:"";display:block!important;position:absolute;inset:0;z-index:2;pointer-events:none;background:radial-gradient(120% 90% at 28% -10%,rgba(225,238,255,.95),rgba(170,195,255,.35) 45%,rgba(0,0,0,0) 75%)!important;background-size:auto!important;mix-blend-mode:screen;opacity:0;animation:l53flash 5s linear infinite'),
    R('.b-mast.l53-storm', 'animation:l53thunder 5s linear infinite'),
    R('.b-mast.l53-storm .l53-box', 'animation:l53lit 5s linear infinite'),
    R('.l53-wrap', 'position:absolute;inset:0;overflow:hidden;container-type:size;z-index:0;pointer-events:none'),
    R('.l53-L', 'position:absolute;inset:0;display:block'),
    R('.l53-wrap:not(.ready) .l53-bob', 'opacity:0'),
    R('.l53-sky', 'animation:l53sky 8s ease-in-out infinite alternate;will-change:transform'),
    R('.l53-drift', 'transform:scale(1.16);animation:l53drift 8s ease-in-out infinite alternate;will-change:transform'),
    R('.l53-bob', 'animation:l53bob 2.6s ease-in-out infinite alternate;will-change:transform'),
    R('.l53-push', 'animation:l53push 8s ease-in-out infinite alternate;will-change:transform'),
    R('.l53-glow', 'position:absolute;inset:0;display:block;background:radial-gradient(40% 55% at 52% 58%,rgba(255,60,90,.55),rgba(255,60,90,0) 70%);mix-blend-mode:screen;animation:l53glow 1.6s ease-in-out infinite alternate'),
    R('.l53-blur', 'filter:blur(12px) saturate(1.15);transform:scale(1.15)'),
    R('.l53-fan', 'position:absolute;right:16px;top:calc(env(safe-area-inset-top) + 14px);bottom:50px;width:58%;z-index:2'),
    R('.l53-fan .c', 'position:absolute;top:6%;height:88%;width:auto;max-width:none;aspect-ratio:2/3;object-fit:cover;filter:none;border:3px solid #f4efe6;box-shadow:6px 6px 0 rgba(0,0,0,.55)'),
    R('.l53-fan .c.on', 'top:0;height:100%'),
    R('.l53-fan.n1 .c0', 'right:8%;transform:rotate(2deg)'),
    R('.l53-fan.n2 .c0', 'right:34%;transform:rotate(-5deg)'), R('.l53-fan.n2 .c1', 'right:2%;transform:rotate(4deg)'),
    R('.l53-fan.n3 .c0', 'right:46%;transform:rotate(-7deg)'), R('.l53-fan.n3 .c1', 'right:22%;transform:rotate(1deg)'), R('.l53-fan.n3 .c2', 'right:0;transform:rotate(7deg)'),
    R('.l53-c', 'position:absolute;right:12px;top:calc(env(safe-area-inset-top) + 8px);font:500 9px/1.2 Barlow,sans-serif;letter-spacing:.02em;color:rgba(255,255,255,.75);text-shadow:0 1px 2px rgba(0,0,0,.8);max-width:60%;text-align:right;z-index:4'),
    '@media (prefers-reduced-motion:reduce){' + R('.l53-sky,.l53-drift,.l53-bob,.l53-push,.l53-glow,.b-mast.l53-storm,.b-mast.l53-storm .l53-box,.b-mast.l53-storm:after', 'animation:none!important') + '}'
  ].join('');
  const kf = '@keyframes l53sky{from{transform:translate3d(-6.5%,.5%,0) scale(1.1)}to{transform:translate3d(6.5%,-1.5%,0) scale(1.1)}}' +
    '@keyframes l53drift{from{transform:scale(1.16) translate3d(-6.5%,1.5%,0)}to{transform:scale(1.16) translate3d(6.5%,-2%,0)}}' +
    '@keyframes l53bob{from{transform:translate3d(-.8%,1.5%,0) rotate(-1deg)}to{transform:translate3d(.8%,-4%,0) rotate(1deg)}}' +
    '@keyframes l53push{from{transform:scale(1) translate3d(1.5%,0,0)}to{transform:scale(1.2) translate3d(-1.5%,-1%,0)}}' +
    '@keyframes l53glow{0%{opacity:.35}20%{opacity:.8}35%{opacity:.5}55%{opacity:.95}70%{opacity:.45}100%{opacity:.85}}' +
    '@keyframes l53flash{0%,55%,100%{opacity:0}56%{opacity:.95}57%{opacity:.15}59%{opacity:.85}61%{opacity:.1}64%{opacity:.6}68%{opacity:0}}' +
    '@keyframes l53lit{0%,55%,100%{filter:brightness(1)}56%{filter:brightness(2) contrast(1.15) saturate(.7)}57%{filter:brightness(1.1)}59%{filter:brightness(1.8) saturate(.75)}61%{filter:brightness(1.05)}64%{filter:brightness(1.4)}68%{filter:brightness(1)}}' +
    '@keyframes l53thunder{0%,58%,100%{transform:none}59%{transform:translate3d(-4px,2px,0)}60%{transform:translate3d(4px,-2px,0)}61%{transform:translate3d(-3px,1px,0)}62%{transform:translate3d(2px,0,0)}63%{transform:none}}';
  try { const st = document.createElement('style'); st.id = 'l53css'; st.textContent = css + kf; document.head.appendChild(st); } catch (e) {}
  // the series' encyclopedia shows the same painting behind its title (inline styles: it lives in its own shadow root)
  function codex(th) { const p = L53.pick(th); if (!p) return ''; const F = 'linear-gradient(#000 55%,transparent)';
    return '<div class="l53-cx" style="position:absolute;left:0;right:0;top:0;height:min(100%,360px);overflow:hidden;container-type:size;-webkit-mask-image:' + F + ';mask-image:' + F + '">' + box(p) + '<div style="position:absolute;inset:0;background:rgba(0,0,0,.42)"></div></div>'; }
  L53.codex = codex;
  (function () { if (!window.L29 || !L29.ATMO) return; const A = L29.ATMO; Object.keys(SC).forEach(th => { const old = A[th] || ''; try { Object.defineProperty(A, th, { configurable: true, enumerable: true, get() { return codex(th) || old; } }); } catch (e) {} }); })();
  // Home's masthead is painted from the look's own masthead step; run it once more now that the scenes are here
  setTimeout(() => { try { if (window.L34 && SC[L34.current()]) L34.mast(); } catch (e) {} tab(); }, 800);
})();

  // =====================================================================================================================
  const L62 = window.L62 = { core };
  const KEY = 'den:hoard', KINDS = 7;
  const RM = () => { try { return matchMedia('(prefers-reduced-motion: reduce)').matches; } catch (e) { return false; } };
  const wait = ms => new Promise(r => setTimeout(r, RM() ? 0 : ms));
  const fmt = n => String(Math.round(n || 0)).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

  // ---------- the pieces: outline, a table inside it, and facets shaded by which way they face ----------
  const COL = ['#e23f48', '#f08a24', '#f4cf4a', '#2fb466', '#3d8bfd', '#a56cf2', '#dbe6f3'];
  const NAME = ['Garnet', 'Amber', 'Citrine', 'Emerald', 'Sapphire', 'Amethyst', 'Moonstone', 'Wheel', 'Loot box', 'Crown'];
  const ell = (n, rx, ry, rot) => Array.from({ length: n }, (_, i) => { const a = (rot + i * 360 / n) * Math.PI / 180; return [50 + rx * Math.cos(a), 50 + ry * Math.sin(a)]; });
  const SHAPE = [ell(6, 45, 45, -90), ell(12, 46, 32, -75), [[27, 18], [50, 18], [73, 18], [94, 41], [72, 67], [50, 94], [28, 67], [6, 41]], [[35, 5], [65, 5], [82, 22], [82, 78], [65, 95], [35, 95], [18, 78], [18, 22]], ell(10, 43, 43, -72),
    [[50, 3], [63, 27], [77, 49], [80, 66], [70, 85], [50, 95], [30, 85], [20, 66], [23, 49], [37, 27]], [[50, 3], [72, 27], [94, 50], [72, 73], [50, 97], [28, 73], [6, 50], [28, 27]]];
  const hex = c => [1, 3, 5].map(i => parseInt(c.slice(i, i + 2), 16));
  const mix = (a, b, t) => { const A = hex(a), B = hex(b); t = Math.max(0, Math.min(1, t)); return '#' + A.map((v, i) => Math.round(v + (B[i] - v) * t).toString(16).padStart(2, '0')).join(''); };
  const pts = Q => Q.map(p => p[0].toFixed(1) + ',' + p[1].toFixed(1)).join(' ');
  const wrap = (s, vb) => 'url("data:image/svg+xml,' + encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" viewBox="' + (vb || '-5 -5 112 112') + '">' + s + '</svg>') + '")';
  const INKD = '#0a0612';
  function stone(k, sp) { const Q = SHAPE[k], base = COL[k], n = Q.length, cx = Q.reduce((s, p) => s + p[0], 0) / n, cy = Q.reduce((s, p) => s + p[1], 0) / n, T = Q.map(p => [cx + (p[0] - cx) * .5, cy - 3 + (p[1] - cy) * .5]), L = [-.55, -.83];
    const shade = b => b >= 0 ? mix(base, '#ffffff', b * .5) : mix(base, INKD, -b * .6);
    let s = '<polygon points="' + pts(Q.map(p => [p[0] + 4, p[1] + 5])) + '" fill="#000" fill-opacity=".55" stroke="#000" stroke-opacity=".55" stroke-width="6" stroke-linejoin="round"/><polygon points="' + pts(Q) + '" fill="' + base + '" stroke="#fff" stroke-width="6" stroke-linejoin="round"/>', best = -2, bi = 0;
    for (let i = 0; i < n; i++) { const j = (i + 1) % n, mx = (Q[i][0] + Q[j][0]) / 2 - cx, my = (Q[i][1] + Q[j][1]) / 2 - cy, d = Math.hypot(mx, my) || 1, b = (mx * L[0] + my * L[1]) / d; if (b > best) { best = b; bi = i; }
      s += '<polygon points="' + pts([Q[i], Q[j], T[i]]) + '" fill="' + shade(b + .08) + '"/><polygon points="' + pts([Q[j], T[j], T[i]]) + '" fill="' + shade(b - .16) + '"/>'; }
    s += '<polygon points="' + pts(T) + '" fill="' + mix(base, '#ffffff', .16) + '"/><polygon points="' + pts([T[bi], T[(bi + 1) % n], [cx, cy - 3]]) + '" fill="#fff" fill-opacity=".45"/>';
    const y = cy - 3, q = (dx, dy) => (cx + dx).toFixed(1) + ' ' + (y + dy).toFixed(1);
    if (sp === 1) s += '<path d="M' + q(0, -29) + 'L' + q(6, -6) + 'L' + q(29, 0) + 'L' + q(6, 6) + 'L' + q(0, 29) + 'L' + q(-6, 6) + 'L' + q(-29, 0) + 'L' + q(-6, -6) + 'Z" fill="#fff" stroke="' + INKD + '" stroke-opacity=".6" stroke-width="2.5" stroke-linejoin="round"/>';
    if (sp === 2) s += '<circle cx="' + cx.toFixed(1) + '" cy="' + y.toFixed(1) + '" r="17" fill="' + INKD + '" stroke="#fff" stroke-width="5"/><circle cx="' + (cx - 5).toFixed(1) + '" cy="' + (y - 6).toFixed(1) + '" r="4" fill="#fff" fill-opacity=".85"/><path d="M' + q(10, -14) + 'q6 -9 14 -6" fill="none" stroke="#fff" stroke-width="4" stroke-linecap="round"/>';
    return wrap(s); }
  function wheel() { let s = '<circle cx="54" cy="55" r="45" fill="#000" fill-opacity=".55"/><circle cx="50" cy="50" r="44" fill="#fff"/>';
    for (let k = 0; k < KINDS; k++) { const a0 = (-90 + k * 360 / KINDS) * Math.PI / 180, a1 = (-90 + (k + 1) * 360 / KINDS) * Math.PI / 180, p = a => (50 + 40 * Math.cos(a)).toFixed(1) + ' ' + (50 + 40 * Math.sin(a)).toFixed(1); s += '<path d="M50 50L' + p(a0) + 'A40 40 0 0 1 ' + p(a1) + 'Z" fill="' + COL[k] + '" stroke="#fff" stroke-width="1.6"/>'; }
    return wrap(s + '<circle cx="50" cy="50" r="12" fill="#fff" stroke="' + INKD + '" stroke-opacity=".5" stroke-width="2"/>'); }
  function box(hp) { const c = hp === 3 ? ['#f0c14a', '#b8861f', '#fff1b8'] : hp === 2 ? ['#b3bfcc', '#77838f', '#eef3f8'] : ['#b9703c', '#7c4320', '#e3a676'];
    return wrap('<rect x="14" y="19" width="80" height="78" fill="#000" fill-opacity=".55"/><rect x="9" y="13" width="82" height="80" fill="' + c[0] + '" stroke="#fff" stroke-width="6" stroke-linejoin="round"/><rect x="9" y="13" width="82" height="24" fill="' + c[2] + '" fill-opacity=".55"/><rect x="9" y="37" width="82" height="7" fill="' + c[1] + '"/><rect x="22" y="13" width="9" height="80" fill="' + c[1] + '"/><rect x="69" y="13" width="9" height="80" fill="' + c[1] + '"/>' +
      '<rect x="40" y="33" width="20" height="24" rx="3" fill="' + INKD + '" stroke="' + c[2] + '" stroke-width="3"/><circle cx="50" cy="42" r="3.4" fill="' + c[2] + '"/><rect x="48.4" y="42" width="3.2" height="9" fill="' + c[2] + '"/>' + Array.from({ length: hp }, (_, i) => '<rect x="' + (50 - hp * 7 + i * 14 + 2) + '" y="74" width="10" height="10" fill="' + INKD + '" fill-opacity=".8"/>').join('')); }
  function crown() { const Q = [[13, 72], [8, 27], [30, 46], [50, 14], [70, 46], [92, 27], [87, 72]];
    return wrap('<polygon points="' + pts(Q.map(p => [p[0] + 4, p[1] + 5])) + '" fill="#000" fill-opacity=".55" stroke="#000" stroke-opacity=".55" stroke-width="6" stroke-linejoin="round"/><rect x="17" y="77" width="74" height="16" fill="#000" fill-opacity=".55"/>' +
      '<polygon points="' + pts(Q) + '" fill="#f4cf4a" stroke="#fff" stroke-width="6" stroke-linejoin="round"/><polygon points="' + pts([[13, 72], [8, 27], [30, 46], [50, 14], [50, 72]]) + '" fill="#ffe58a"/><polygon points="' + pts([[50, 14], [70, 46], [92, 27], [87, 72], [50, 72]]) + '" fill="#d9a92c"/>' +
      '<rect x="13" y="72" width="74" height="16" fill="#b8861f" stroke="#fff" stroke-width="6" stroke-linejoin="round"/><rect x="13" y="72" width="74" height="16" fill="#c9962a"/><circle cx="50" cy="52" r="8" fill="#e23f48" stroke="#fff" stroke-width="2.5"/><circle cx="27" cy="80" r="4.5" fill="#3d8bfd"/><circle cx="50" cy="80" r="4.5" fill="#2fb466"/><circle cx="73" cy="80" r="4.5" fill="#3d8bfd"/>'); }
  const ashT = deep => wrap('<rect x="2" y="2" width="96" height="96" fill="' + (deep ? '#b9b1a8' : '#6a625c') + '"/>' + [[18, 22, 5], [44, 14, 3], [76, 26, 6], [30, 52, 4], [62, 60, 5], [84, 74, 4], [20, 82, 6], [52, 86, 3], [70, 42, 3], [12, 50, 3]].map(q => '<circle cx="' + q[0] + '" cy="' + q[1] + '" r="' + q[2] + '" fill="' + (deep ? '#8d857d' : '#8e867f') + '"/>').join('') + (deep ? '<rect x="8" y="8" width="84" height="84" fill="none" stroke="#efe9e1" stroke-width="5"/>' : ''), '0 0 100 100');
  const mistT = () => wrap('<rect width="100" height="100" fill="#c9d1da"/><path d="M-5 30q20-18 40-4t40-6 40 8v22q-22 12-42 2t-40 4-38-6z" fill="#e9eef3"/><path d="M-5 66q24-14 44-4t36-4 32 6v40h-112z" fill="#aab4c0"/><path d="M8 18q14-10 28-2M58 52q16-8 30 0M14 84q16-8 32-2" fill="none" stroke="#fff" stroke-width="4" stroke-linecap="round" stroke-opacity=".8"/>', '0 0 100 100');
  const glassT = thick => wrap('<rect x="6" y="6" width="88" height="88" fill="#bfe6ff" fill-opacity="' + (thick ? '.42' : '.24') + '" stroke="#e6f6ff" stroke-width="' + (thick ? 7 : 4) + '"/>' + (thick ? '<rect x="14" y="14" width="72" height="72" fill="none" stroke="#e6f6ff" stroke-opacity=".7" stroke-width="2.5"/><path d="M16 40L40 16M16 58L58 16" stroke="#fff" stroke-opacity=".75" stroke-width="5" stroke-linecap="round"/>' : '<path d="M8 30L40 46L30 70L52 92M40 46L74 34L92 12M30 70L8 78M74 34L90 60" fill="none" stroke="#fff" stroke-width="3" stroke-linejoin="round"/>'), '0 0 100 100');
  const fuseT = () => wrap('<circle cx="54" cy="62" r="33" fill="#000" fill-opacity=".55"/><circle cx="50" cy="58" r="33" fill="' + INKD + '" stroke="#fff" stroke-width="6"/><circle cx="39" cy="46" r="8" fill="#fff" fill-opacity=".8"/><path d="M66 32q8-16 22-12" fill="none" stroke="#fff" stroke-width="6" stroke-linecap="round"/><circle cx="90" cy="19" r="7" fill="#f08a24" stroke="#fff" stroke-width="2.5"/>');



  // ---------- the orbs: glass balls with a mark for each colour, drawn here as SVG. Its own pieces ----------
  const PAL = [['#ffd9b8', '#ff5a2a', '#8b1206'], ['#c9ecff', '#2f9bff', '#0a3f9c'], ['#d6ffc2', '#3fce57', '#0c6b2a'], ['#fff7c4', '#ffcf2e', '#a86a00'], ['#ecd4ff', '#a45cff', '#3f1590'], ['#ffe0ee', '#ff62a8', '#a8124f']];
  const starPath = (cx, cy, R, r, n) => { let d = ''; for (let i = 0; i < n * 2; i++) { const a = Math.PI * i / n - Math.PI / 2, q = i % 2 ? r : R; d += (i ? 'L' : 'M') + (cx + q * Math.cos(a)).toFixed(1) + ' ' + (cy + q * Math.sin(a)).toFixed(1); } return d + 'Z'; };
  const MARK = [
    m => '<path d="M51 20C53 33 67 40 68 56C69 70 60 80 50 80C40 80 31 71 32 58C32.5 49 38 45 41 38C43 45 45 49 48 49C46 39 47 30 51 20Z"/><path d="M50 55C54 60 57 65 56 70C55 76 45 76 44 70C43 65 46 60 50 55Z" fill="' + m[1] + '" stroke="none"/>',
    m => '<path d="M50 19C50 19 29 46 29 60C29 72 38.5 81 50 81C61.5 81 71 72 71 60C71 46 50 19 50 19Z"/><path d="M39 60C39 68 44 73 51 74" fill="none" stroke="' + m[1] + '" stroke-width="4.5" stroke-linecap="round"/>',
    m => '<path d="M26 75C20 47 40 23 76 24C79 56 59 80 26 75Z"/><path d="M32 69C44 56 57 43 69 31M44 57L45 44M54 47L66 47" fill="none" stroke="' + m[1] + '" stroke-width="3.6" stroke-linecap="round"/>',
    m => '<path d="' + starPath(50, 51, 31, 16, 8) + '" stroke-linejoin="round"/><circle cx="50" cy="51" r="8.5" fill="' + m[1] + '" stroke="none"/>',
    m => '<path d="M58 23A29 29 0 1 0 78 62A23 23 0 1 1 58 23Z"/><path d="' + starPath(63, 43, 8, 3.2, 4) + '" stroke-width="1.5"/>',
    m => '<path d="M50 80C22 61 21 44 27 36C33.5 27 45 28 50 38C55 28 66.5 27 73 36C79 44 78 61 50 80Z"/>',
  ];
  function orbSVG(e) { const m = PAL[e];
    return '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><defs><linearGradient id="g" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fff" stop-opacity=".9"/><stop offset="1" stop-color="#fff" stop-opacity=".05"/></linearGradient>' +
      '<radialGradient id="s" cx=".5" cy=".42" r=".6"><stop offset=".62" stop-color="#000" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity=".42"/></radialGradient>' +
      '<radialGradient id="b" cx=".4" cy=".3" r=".8"><stop offset="0" stop-color="' + m[0] + '"/><stop offset=".42" stop-color="' + m[1] + '"/><stop offset="1" stop-color="' + m[2] + '"/></radialGradient>' +
      '<linearGradient id="r" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="' + m[0] + '"/><stop offset=".5" stop-color="' + m[2] + '"/><stop offset="1" stop-color="#1a0a05"/></linearGradient>' +
      '<linearGradient id="e" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fff"/><stop offset="1" stop-color="' + m[0] + '"/></linearGradient></defs>' +
      '<ellipse cx="50" cy="94" rx="31" ry="4.5" fill="#000" opacity=".4"/><circle cx="50" cy="49" r="46" fill="#140a04"/><circle cx="50" cy="49" r="44.5" fill="url(#r)"/><circle cx="50" cy="49" r="40.5" fill="url(#b)"/><circle cx="50" cy="49" r="40.5" fill="url(#s)"/>' +
      '<g transform="translate(0 -1)"><g fill="' + m[2] + '" stroke="' + m[2] + '" stroke-width="5" stroke-linejoin="round" opacity=".85" transform="translate(0 2.6)">' + MARK[e](['', m[2], '']) + '</g><g fill="url(#e)" stroke="' + m[2] + '" stroke-width="2.2" stroke-linejoin="round">' + MARK[e](m) + '</g></g>' +
      '<path d="M12.5 43A37.5 37.5 0 0 1 87.5 43C72 31 28 31 12.5 43Z" fill="url(#g)" opacity=".55"/><ellipse cx="33" cy="23" rx="9.5" ry="4.6" fill="#fff" opacity=".85" transform="rotate(-30 33 23)"/><path d="M22 72A40 40 0 0 0 78 72A46 46 0 0 1 22 72Z" fill="#fff" opacity=".28"/></svg>'; }
  const orbURL = e => 'data:image/svg+xml,' + encodeURIComponent(orbSVG(e));

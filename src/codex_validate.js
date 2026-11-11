// checks every gate, related id and tree link in the encyclopedia data
const fs = require('fs'); const S = []; global.window = { L29: { add: s => S.push(s) } }; global.L29 = window.L29;
process.argv.slice(2).forEach(f => require(f));
const B = {}; S.forEach(s => s.books.forEach(b => { if (B[b.k]) console.log('DUP book key', b.k); B[b.k] = b; }));
let bad = 0; const gate = (g, where) => { if (!g) return; String(g).split(/[|+]/).forEach(x => { const [k, n] = x.split(':'); if (!B[k]) { bad++; console.log('BAD GATE', g, where); } else if (n != null && (isNaN(+n) || (+n > 0 && (!B[k].parts || +n > B[k].parts.length)))) { bad++; console.log('BAD PART', g, where); } }); };
const txg = (v, w) => { if (Array.isArray(v)) v.forEach(x => { if (!Array.isArray(x) || x.length !== 2) { bad++; console.log('BAD TEXT', JSON.stringify(v).slice(0, 80), w); } else gate(x[0], w); }); };
S.forEach(s => { const ids = new Set(); let secs = 0;
  s.e.forEach(e => { if (ids.has(e.id)) { bad++; console.log('DUP entry', s.k, e.id); } ids.add(e.id); if (!s.cats[e.c]) { bad++; console.log('BAD CAT', s.k, e.id, e.c); } gate(e.g, s.k + '/' + e.id); txg(e.t, s.k + '/' + e.id); (e.s || []).forEach(x => { secs++; gate(x[0], s.k + '/' + e.id); if (typeof x[1] !== 'string' || /—/.test(x[1])) { bad++; console.log('BAD SEC', s.k, e.id); } }); });
  s.e.forEach(e => (e.rel || []).forEach(r => { if (!ids.has(r)) { bad++; console.log('BAD REL', s.k, e.id, '->', r); } }));
  (s.trees || []).forEach(t => { gate(t.g, s.k + '/tree ' + t.id); const pid = new Set(); const pos = new Set(); t.p.forEach(p => { pid.add(p[0]); const o = p[4] || {}; const k = p[2] + ',' + p[3]; if (pos.has(k)) { bad++; console.log('TREE CLASH', s.k, t.id, p[0], k); } pos.add(k); gate(o.g, t.id); gate(o.x, t.id); txg(o.t, t.id); txg(p[1], t.id); if (o.e && !ids.has(o.e)) { bad++; console.log('BAD TREE ENTRY', s.k, t.id, o.e); } });
    (t.u || []).forEach(u => { [u[0], u[1]].forEach(x => { if (!pid.has(x)) { bad++; console.log('BAD UNION', s.k, t.id, x); } }); gate(u[2], t.id); });
    (t.k || []).forEach(k => { k[0].split('+').concat([k[1]]).forEach(x => { if (!pid.has(x)) { bad++; console.log('BAD KID', s.k, t.id, x); } }); gate(k[2], t.id); });
    (t.l || []).forEach(l => { [l[0], l[1]].forEach(x => { if (!pid.has(x)) { bad++; console.log('BAD LINK', s.k, t.id, x); } }); gate(l[3], t.id); }); });
  (s.charts || []).forEach(c => { gate(c.g, s.k + '/chart ' + c.id); txg(c.note, c.id); const its = c.type === 'quads' ? [].concat(...c.groups.map(g => g.items)) : c.type === 'ring' ? c.items.concat(c.edges || []) : c.type === 'table' ? c.rows : c.items; its.forEach(it => { gate(it.g, c.id); ['fx', 'tags', 'who', 'sub'].forEach(f => txg(it[f], c.id)); (it.lines || []).forEach(x => gate(x[0], c.id)); (it.c || []).forEach(x => txg(x, c.id)); if (c.type === 'table' && it.c.length !== c.cols.length) { bad++; console.log('BAD ROW', s.k, c.id, JSON.stringify(it.c).slice(0, 60)); } }); });
  console.log(s.k, s.e.length, 'entries', secs, 'sections', (s.trees || []).length, 'trees', (s.charts || []).length, 'charts'); });
console.log(bad ? bad + ' PROBLEMS' : 'data ok');

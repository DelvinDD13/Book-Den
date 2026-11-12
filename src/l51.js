// ===== L51: Steel looks — a Superman/Batman switch and a look for each era: a fan of his own pictures over a blurred copy,
//   the era's colours, and the era's emblem on the earned Steel plates. The Fleischer title card (public domain) is the default.
//   His pictures are DC's art, so they never go into the repository or the Sheet: they live in this phone's IndexedDB,
//   added from one "Steel pictures" file (sorted by era) or picked one at a time from Photos.
(function () {
  const L51 = window.L51 = {};
  const esc = s => String(s == null ? '' : s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const lift = (h, f) => { const n = parseInt(h.slice(1), 16); const c = [n >> 16, (n >> 8) & 255, n & 255].map(x => Math.min(255, Math.round(x + (255 - x) * f))); return '#' + c.map(x => x.toString(16).padStart(2, '0')).join(''); };
  // acc = accent, bg = page colour; the card colours sit just above the page colour
  const ERA = {
    superman: [
      { k: '1941', n: 'Fleischer', pd: { f: 'art/fleischer-superman-title.jpg', pos: '50% 46%', c: 'Superman (1941) · Fleischer Studios · public domain', em: 'art/superman-shield-1944.png' }, acc: '#f0b93a', bg: '#0c1530' },
      { k: 'golden', n: 'Golden Age', acc: '#e0703a', bg: '#17120f' },
      { k: 'modern', n: 'Modern', acc: '#e0393e', bg: '#0b1a3a' },
      { k: 'new52', n: 'New 52', acc: '#ff4b3e', bg: '#0a1631' },
      { k: 'rebirth', n: 'Rebirth', acc: '#f2b84b', bg: '#141821' },
      { k: 'absolute', n: 'Absolute', acc: '#ff7a1f', bg: '#120c0a' }
    ],
    batman: [
      { k: 'modern', n: 'Modern', acc: '#7fa6d6', bg: '#0b0f16' },
      { k: 'rebirth', n: 'Rebirth', acc: '#f2c23a', bg: '#120d0b' },
      { k: 'absolute', n: 'Absolute', acc: '#ff8a2a', bg: '#0a0a0b' }
    ]
  };
  L51.ERA = ERA;
  const HERO = { superman: 'Superman', batman: 'Batman' };

  // ---------- the pictures: IndexedDB on this phone ----------
  const SETS = {}; // 'superman:new52' -> { covers: [objectURL], chip: objectURL, bg: objectURL }
  let dbp = null;
  function db() { if (dbp) return dbp; dbp = new Promise((res, rej) => { try { const r = indexedDB.open('den-l51', 1); r.onupgradeneeded = () => { r.result.createObjectStore('sets'); }; r.onsuccess = () => res(r.result); r.onerror = () => rej(r.error); } catch (e) { rej(e); } }); return dbp; }
  const tx = (mode, fn) => db().then(d => new Promise((res, rej) => { const t = d.transaction('sets', mode); const st = t.objectStore('sets'); const out = fn(st); t.oncomplete = () => res(out instanceof IDBRequest ? out.result : out); t.onerror = () => rej(t.error); t.onabort = () => rej(t.error); }));
  const url = b => b ? URL.createObjectURL(b) : '';
  function adopt(key, rec) { const old = SETS[key]; if (old) { (old.covers || []).forEach(u => URL.revokeObjectURL(u)); if (old.chip) URL.revokeObjectURL(old.chip); if (old.bg) URL.revokeObjectURL(old.bg); } if (!rec || !(rec.covers || []).length) { delete SETS[key]; return; } SETS[key] = { covers: rec.covers.map(url), chip: url(rec.chip || rec.covers[0]), bg: url(rec.bg || rec.covers[0]), n: rec.covers.length }; }
  L51.ready = (function () { try { if (!window.indexedDB) return Promise.resolve(); return db().then(d => new Promise(res => { const t = d.transaction('sets', 'readonly'); const st = t.objectStore('sets'); const rq = st.openCursor(); rq.onsuccess = () => { const c = rq.result; if (c) { adopt(c.key, c.value); c.continue(); } else res(); }; rq.onerror = () => res(); })).then(() => { try { L51.apply(); } catch (e) {} }).catch(() => {}); } catch (e) { return Promise.resolve(); } })();
  L51.has = (h, k) => !!SETS[h + ':' + k];
  L51.sets = () => Object.keys(SETS);
  const blobOf = dataUrl => { const m = /^data:([^;,]+)?(;base64)?,(.*)$/.exec(dataUrl || ''); if (!m) return null; const bin = m[2] ? atob(m[3]) : decodeURIComponent(m[3]); const a = new Uint8Array(bin.length); for (let i = 0; i < bin.length; i++) a[i] = bin.charCodeAt(i); return new Blob([a], { type: m[1] || 'image/jpeg' }); };
  // a picture picked from Photos: the cover itself (at most 1200 px), a round chip from its upper middle, a soft backdrop
  function canvasBlob(cv, q) { return new Promise(res => { try { cv.toBlob(b => res(b), 'image/jpeg', q || 0.86); } catch (e) { res(null); } }); }
  function loadImg(file) { return new Promise((res, rej) => { const u = URL.createObjectURL(file); const im = new Image(); im.onload = () => res({ im, u }); im.onerror = () => { URL.revokeObjectURL(u); rej(new Error('That picture could not be read')); }; im.src = u; }); }
  async function prep(file) { const { im, u } = await loadImg(file); try { const W = im.naturalWidth, H = im.naturalHeight; const s = Math.min(1, 1200 / Math.max(W, H));
      const c1 = document.createElement('canvas'); c1.width = Math.round(W * s); c1.height = Math.round(H * s); c1.getContext('2d').drawImage(im, 0, 0, c1.width, c1.height);
      const S = Math.round(Math.min(W, H) * 0.42), sx = Math.round((W - S) / 2), sy = Math.round(Math.max(0, H * 0.3 - S / 2)); const c2 = document.createElement('canvas'); c2.width = c2.height = 160; c2.getContext('2d').drawImage(im, sx, sy, S, S, 0, 0, 160, 160);
      const t = document.createElement('canvas'); t.width = 24; t.height = Math.max(8, Math.round(24 * H / W)); t.getContext('2d').drawImage(im, 0, 0, t.width, t.height); const c3 = document.createElement('canvas'); c3.width = 600; c3.height = 320; const g = c3.getContext('2d'); g.imageSmoothingEnabled = true; g.imageSmoothingQuality = 'high'; g.drawImage(t, 0, 0, t.width, Math.round(t.width * 320 / 600) || t.height, 0, 0, 600, 320); g.fillStyle = 'rgba(0,0,0,.18)'; g.fillRect(0, 0, 600, 320);
      return { cover: await canvasBlob(c1, 0.86), chip: await canvasBlob(c2, 0.88), bg: await canvasBlob(c3, 0.8) }; } finally { URL.revokeObjectURL(u); } }
  // the "Steel pictures" file: { kind: 'den-steel-pictures', sets: [{ hero, era, covers: [dataURL], chip, bg }] }
  L51.importFile = async function (obj) { if (!obj || obj.kind !== 'den-steel-pictures' || !Array.isArray(obj.sets)) throw new Error('That file is not a Steel pictures file'); let n = 0;
    for (const s of obj.sets) { if (!ERA[s.hero] || !ERA[s.hero].some(e => e.k === s.era && !e.pd)) continue; const rec = { covers: (s.covers || []).map(blobOf).filter(Boolean), chip: blobOf(s.chip), bg: blobOf(s.bg) }; if (!rec.covers.length) continue; const key = s.hero + ':' + s.era; await tx('readwrite', st => st.put(rec, key)); adopt(key, rec); n += rec.covers.length; }
    return n; };
  L51.addPictures = async function (files, h, k) { const key = h + ':' + k; const old = await tx('readonly', st => st.get(key)).catch(() => null); const rec = old && old.covers ? old : { covers: [] }; let n = 0;
    for (const f of files) { const p = await prep(f); if (!p.cover) continue; rec.covers.push(p.cover); if (!rec.chip) rec.chip = p.chip; if (!rec.bg) rec.bg = p.bg; n++; }
    if (n) { await tx('readwrite', st => st.put(rec, key)); adopt(key, rec); } return n; };
  L51.removeEra = async function (h, k) { const key = h + ':' + k; await tx('readwrite', st => st.delete(key)); adopt(key, null); L51.apply(); };

  // ---------- which look ----------
  const LSK = 'den:steellook';
  const getS = () => { try { return JSON.parse(localStorage.getItem(LSK) || 'null') || {}; } catch (e) { return {}; } };
  const putS = s => { try { localStorage.setItem(LSK, JSON.stringify(s)); } catch (e) {} };
  L51.hero = () => getS().h === 'batman' ? 'batman' : 'superman';
  const avail = h => ERA[h].filter(e => e.pd || L51.has(h, e.k));
  L51.era = function (h) { h = h || L51.hero(); const want = (getS().e || {})[h]; const A = avail(h); return A.find(e => e.k === want) || A[0] || null; };
  L51.set = function (h, k) { const s = getS(); s.h = h; s.e = s.e || {}; if (k) s.e[h] = k; putS(s); L51.apply(); };
  // the emblem on an earned Steel plate
  L51.plate = function () { const e = L51.era() || ERA.superman[0]; if (e.pd) return '<img class="sh" src="' + e.pd.em + '" alt="" loading="lazy">'; const S = SETS[L51.hero() + ':' + e.k]; return S ? '<img class="sh l51-ph" src="' + S.chip + '" alt="">' : '<img class="sh" src="' + ERA.superman[0].pd.em + '" alt="" loading="lazy">'; };

  const onSteel = () => typeof currentLib !== 'undefined' && currentLib === 'steel';
  function colours() { const r = document.documentElement.style; const e = onSteel() && L51.era(); const K = { '--d-acc': e && e.acc, '--d-bg': e && e.bg, '--d-bg2': e && lift(e.bg, 0.03), '--d-bg3': e && lift(e.bg, 0.08) };
    Object.keys(K).forEach(k => { if (K[k]) r.setProperty(k, K[k]); else r.removeProperty(k); }); document.documentElement.classList.toggle('l51-on', !!e); }
  const day = () => Math.floor((Date.now() - new Date().getTimezoneOffset() * 60000) / 864e5);
  // the masthead: the public-domain title card, or a fan of up to three of his pictures (a different three each day)
  function mast() { try { if (!onSteel()) return; const e = L51.era() || ERA.superman[0]; const m = document.querySelector('header.hero .b-mast'); if (!m) return; const h = L51.hero();
      if (!e.pd) { const S = SETS[h + ':' + e.k]; if (!S) return; const n = S.covers.length, st = n > 3 ? day() % n : 0; const C = []; for (let i = 0; i < Math.min(3, n); i++) C.push(S.covers[(st + i) % n]);
        const id = h + ':' + e.k + ':' + st + ':' + n; if (m.dataset.l51 === id) return; m.dataset.l51 = id; m.classList.add('l51-hero');
        m.innerHTML = '<div class="l51-bd" style="background-image:url(' + S.bg + ')"></div><div class="l51-fan n' + C.length + '">' + C.map((c, i) => '<img class="c c' + i + '" src="' + c + '" alt="">').join('') + '</div>'; return; }
      if (m.classList.contains('l51-hero') || m.dataset.l51) { m.classList.remove('l51-hero'); delete m.dataset.l51; m.innerHTML = '<img src="' + e.pd.f + '" alt="" class="wide" style="object-position:' + e.pd.pos + '">'; }
      const im = m.querySelector('img'); if (im && im.getAttribute('src') !== e.pd.f) { im.setAttribute('src', e.pd.f); im.style.objectPosition = e.pd.pos; } } catch (x) { console.warn('l51 mast', x); } }
  function rail() { const h = L51.hero(), cur = L51.era(), A = avail(h);
    const chip = e => { const S = SETS[h + ':' + e.k]; const src = e.pd ? e.pd.em : S && S.chip; return '<button type="button" class="l51-e' + (cur && e.k === cur.k ? ' on' : '') + '" data-l51e="' + e.k + '" aria-pressed="' + !!(cur && e.k === cur.k) + '"><span class="m' + (e.pd ? '' : ' l51-ph') + '"><img src="' + src + '" alt=""></span><i>' + esc(e.n) + '</i></button>'; };
    return '<div class="l51"><div class="l51-h" role="tablist">' + Object.keys(HERO).map(x => '<button type="button" role="tab" data-l51h="' + x + '" class="' + (x === h ? 'on' : '') + '" aria-selected="' + (x === h) + '">' + HERO[x] + '</button>').join('') + '</div>' +
      '<div class="l51-r">' + A.map(chip).join('') + '<button type="button" class="l51-e l51-add" data-l51add="1"><span class="m"><b>+</b></span><i>Add pictures</i></button></div>' +
      (!A.length ? '<p class="l51-c">Add your ' + HERO[h] + ' pictures to see this side.</p>' : cur && cur.pd ? '<p class="l51-c">' + esc(cur.pd.c) + '</p>' : '') +
      '<input type="file" class="l51-in" accept="image/*,.json,application/json" multiple hidden></div>'; }
  function place() { try { const host = document.getElementById('lib-other'); if (!host) return; const old = host.querySelector(':scope > .l51');
      if (!onSteel()) { if (old) old.remove(); return; } const html = rail(); if (old) { if (old.dataset.sig !== html.length + ':' + L51.hero() + ':' + ((L51.era() || {}).k || '')) { old.outerHTML = html; } } else host.insertAdjacentHTML('afterbegin', html);
      const now = host.querySelector(':scope > .l51'); if (now) now.dataset.sig = html.length + ':' + L51.hero() + ':' + ((L51.era() || {}).k || ''); } catch (e) { console.warn('l51', e); } }
  L51.apply = function () { colours(); mast(); place(); };

  document.addEventListener('click', ev => { const b = ev.target.closest && ev.target.closest('[data-l51h],[data-l51e],[data-l51add]'); if (!b) return; ev.preventDefault();
    if (b.dataset.l51add) { const inp = document.querySelector('#lib-other > .l51 .l51-in'); if (inp) { inp.value = ''; inp.click(); } return; }
    if (b.dataset.l51h) L51.set(b.dataset.l51h); else L51.set(L51.hero(), b.dataset.l51e); }, true);
  document.addEventListener('change', async ev => { const inp = ev.target; if (!inp.classList || !inp.classList.contains('l51-in')) return; const files = [...(inp.files || [])]; if (!files.length) return; const say = m => { try { toast(m); } catch (e) {} };
    try { const json = files.filter(f => /json/i.test(f.type) || /\.json$/i.test(f.name)); const imgs = files.filter(f => /^image\//.test(f.type) || /\.(jpe?g|png|heic|webp|gif)$/i.test(f.name)); let n = 0;
      for (const f of json) { n += await L51.importFile(JSON.parse(await f.text())); }
      if (imgs.length) { const h = L51.hero(), e = L51.era(); if (!e || e.pd) say('Pick the era to add to first, then add pictures'); else n += await L51.addPictures(imgs, h, e.k); }
      if (n) { say(n + (n === 1 ? ' picture added' : ' pictures added')); const s = getS(); if (json.length && !(s.e || {})[L51.hero()]) { const A = avail(L51.hero()).filter(e => !e.pd).sort((a, b) => (SETS[L51.hero() + ':' + b.k].n || 0) - (SETS[L51.hero() + ':' + a.k].n || 0)); if (A.length) { L51.set(L51.hero(), A[0].k); return; } } L51.apply(); } } catch (e) { say(e.message || 'That file could not be read'); } });

  (function () { if (typeof switchLib === 'function') { const _s = switchLib; switchLib = function () { const r = _s.apply(this, arguments); try { L51.apply(); } catch (x) {} return r; }; }
    if (typeof renderTabContent === 'function') { const _r = renderTabContent; renderTabContent = function () { const r = _r.apply(this, arguments); try { place(); } catch (x) {} return r; }; } })();
  // re-place after any rebuild of the tab or the header
  try { const host = document.getElementById('lib-other'); if (host) new MutationObserver(() => { if (onSteel() && !host.querySelector(':scope > .l51')) place(); }).observe(host, { childList: true }); } catch (e) {}
  try { const hd = document.querySelector('header.hero'); if (hd) new MutationObserver(() => { if (onSteel()) { const m = hd.querySelector('.b-mast'); const e = L51.era(); if (m && e && !e.pd && !m.dataset.l51) mast(); } }).observe(hd, { childList: true }); } catch (e) {}

  const css = [
    'html.l51-on header.hero .b-cred{display:none}',
    'html.l51-on header.hero .b-mast.l51-hero{overflow:hidden;background:var(--d-bg);height:calc(env(safe-area-inset-top) + 250px)}',
    '.l51-bd{position:absolute;inset:-20px;background-size:cover;background-position:50% 35%}',
    '.l51-fan{position:absolute;right:18px;top:calc(env(safe-area-inset-top) + 16px);bottom:14px;width:62%}',
    '.l51-fan .c{position:absolute;top:0;height:100%;width:auto;max-width:none;object-fit:cover;aspect-ratio:2/3;border:3px solid #f4efe6;box-shadow:6px 6px 0 rgba(0,0,0,.55)}',
    '.l51-fan.n1 .c0{right:6%;transform:rotate(2deg)}',
    '.l51-fan.n2 .c0{right:34%;transform:rotate(-5deg)}.l51-fan.n2 .c1{right:2%;transform:rotate(4deg)}',
    '.l51-fan.n3 .c0{right:46%;top:6%;height:88%;transform:rotate(-7deg)}.l51-fan.n3 .c1{right:22%;transform:rotate(1deg);z-index:2}.l51-fan.n3 .c2{right:0;top:6%;height:88%;transform:rotate(7deg)}',
    '.l51{margin:14px 16px 6px}',
    '.l51-h{display:flex;gap:18px;margin:0 0 10px}',
    '.l51-h button{font:600 15px/1.2 Barlow,-apple-system,sans-serif;color:var(--d-mute);padding:6px 0;border:0;border-bottom:2px solid transparent;background:none}',
    '.l51-h button.on{color:var(--d-ink);border-bottom-color:var(--d-acc)}',
    '.l51-r{display:flex;gap:8px;overflow-x:auto;scrollbar-width:none;padding-bottom:2px}.l51-r::-webkit-scrollbar{display:none}',
    '.l51-e{flex:0 0 78px;display:flex;flex-direction:column;align-items:center;gap:4px;padding:8px 4px 7px;border:1px solid var(--d-line);background:var(--d-bg2);color:var(--d-ink)}',
    '.l51-e.on{border:2px solid var(--d-acc);padding:7px 3px 6px}',
    '.l51-e .m{display:flex;align-items:center;justify-content:center;width:44px;height:44px}.l51-e .m img{max-width:44px;max-height:36px;object-fit:contain}',
    '.l51-e .m.l51-ph{border-radius:50%;overflow:hidden;box-shadow:0 0 0 2px var(--d-bg3)}.l51-e .m.l51-ph img{width:44px;height:44px;max-width:none;max-height:none;object-fit:cover}',
    '.l51-e i{font:400 11px/1.15 Barlow,-apple-system,sans-serif;font-style:normal;color:var(--d-mute);text-align:center}.l51-e.on i{color:var(--d-ink)}',
    '.l51-add{border-style:dashed}.l51-add .m b{font:300 30px/1 Barlow,-apple-system,sans-serif;color:var(--d-mute)}',
    '.l51-c{margin:8px 0 0;font:400 11px/1.35 Barlow,-apple-system,sans-serif;color:var(--d-mute)}'
  ].join('');
  try { const st = document.createElement('style'); st.id = 'l51css'; st.textContent = css.replace(/(^|\})\s*([^{}]+)\{/g, (a, p, sel) => p + sel.split(',').map(x => { x = x.trim(); return /^html\./.test(x) ? x.replace(/^(html\.[\w-]+)/, '$1 body.den') : 'html body.den ' + x; }).join(',') + '{'); document.head.appendChild(st); } catch (e) {}
  try { L51.apply(); } catch (e) {}
})();

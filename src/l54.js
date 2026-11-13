// ===== L54: his pictures, built in and locked. His own pictures (ACOTAR, Dungeon Crawler Carl, Steel) ship inside the site as
//   art/pack.bin, encrypted (AES-GCM, 256-bit key), so the public site never hands the artists' work to anyone else.
//   The key lives in his Sheet (row den:pk). It gets there once, from a private link ending in #pk=<key> opened in any browser;
//   after that every copy of the app (the home-screen one included) opens the pictures by itself, and a newer pack comes in
//   on its own. Nothing to paste and no button. A key pasted with the first version (kept on that phone) still works.
(function () {
  const L54 = window.L54 = {};
  const PACK_V = 1, LK = 'den:pk', LV = 'den:packv', ROW = 'den:pk', BAD = 'den:pkbad';
  const ls = { get(k) { try { return localStorage.getItem(k); } catch (e) { return null; } }, set(k, v) { try { localStorage.setItem(k, v); } catch (e) {} } };
  const clean = k => String(k || '').replace(/\s+/g, '');
  const b64u = s => { s = String(s).replace(/-/g, '+').replace(/_/g, '/'); while (s.length % 4) s += '='; const b = atob(s), u = new Uint8Array(b.length); for (let i = 0; i < b.length; i++) u[i] = b.charCodeAt(i); return u; };
  const say = m => { try { toast(m); } catch (e) {} };
  L54.V = PACK_V;
  L54.valid = k => /^den-[A-Za-z0-9_-]{43}$/.test(clean(k));
  // the key: the one kept on this phone (first version), else the one in his Sheet
  L54.key = () => { const a = ls.get(LK); if (L54.valid(a)) return clean(a); let b = ''; try { b = (getOverride(ROW) || {}).k; } catch (e) {} return L54.valid(b) ? clean(b) : ''; };
  L54.has = () => !!L54.key();
  L54.inV = () => +(ls.get(LV) || 0);
  L54.ready = () => L54.has() && L54.inV() >= PACK_V;
  // fetch the locked pack and open it with the key (the service worker never keeps the pack; the pictures go to IndexedDB)
  async function open(key) { const r = await fetch('art/pack.bin?v=' + PACK_V); if (!r.ok) throw new Error('net'); const buf = new Uint8Array(await r.arrayBuffer());
    let pt; try { const k = await crypto.subtle.importKey('raw', b64u(clean(key).slice(4)), { name: 'AES-GCM' }, false, ['decrypt']); pt = await crypto.subtle.decrypt({ name: 'AES-GCM', iv: buf.slice(0, 12) }, k, buf.slice(12)); } catch (e) { throw new Error('key'); }
    return JSON.parse(new TextDecoder().decode(pt)); }
  let busy = null, fromLink = false;
  // bring the pictures in when this copy of the app has a key and an older pack (or none)
  L54.sync = function () { if (busy) return busy;
    busy = (async () => { const key = L54.key(); if (!key) return { n: 0, err: 'nokey' }; if (L54.inV() >= PACK_V) return { n: 0, same: 1 };
      if (ls.get(BAD) === key + ':' + PACK_V) return { n: 0, err: 'key' };   // a key that did not open this pack is not tried again
      let o; try { o = await open(key); } catch (e) { if (e.message === 'key') ls.set(BAD, key + ':' + PACK_V); return { n: 0, err: e.message === 'key' ? 'key' : 'net' }; }
      if (!o || o.kind !== 'den-pack') { ls.set(BAD, key + ':' + PACK_V); return { n: 0, err: 'key' }; }
      let n = 0;
      try { if (o.looks && window.L34 && L34.artImport) n += await L34.artImport(o.looks); } catch (e) { console.warn('l54 looks', e); }
      try { if (o.steel && window.L51 && L51.importFile) n += await L51.importFile(o.steel); } catch (e) { console.warn('l54 steel', e); }
      ls.set(LV, String(PACK_V));
      try { if (window.L34) { L34.mast(); L34.artList().then(A => { if (window.L53 && L53.setArt) L53.setArt(A); }); } } catch (e) {}
      try { if (window.L51 && L51.apply) L51.apply(); } catch (e) {}
      if (n) say('Your pictures are in');
      return { n }; })().finally(() => { busy = null; });
    return busy; };
  // the private link: #pk=<key> writes the key to his Sheet and says so; this page load downloads nothing
  L54.save = async function (key) { try { if (!window.DEN || !DEN.push) throw new Error('store'); const row = { k: key, u: Date.now() };
      await DEN.push({ [ROW]: { u: row.u, j: JSON.stringify(row) } });
      try { if (typeof OVERRIDES !== 'undefined') OVERRIDES[ROW] = row; if (typeof SYNC82 !== 'undefined') SYNC82.synced[ROW] = row.u; } catch (e) {}
      return true; } catch (e) { return false; } };
  // what the link shows when it is done: one card in the colours of the app's own notes (so it reads in every look), until OK
  function note(ok) { try { const t = document.getElementById('toast'), cs = t ? getComputedStyle(t) : null; const has = v => v && v !== 'none' && v !== 'rgba(0, 0, 0, 0)' && v !== 'transparent';
      const bg = cs && has(cs.backgroundColor) ? cs.backgroundColor : '#f4ead6', fg = cs && has(cs.color) ? cs.color : '#0c0b0d', bd = cs && has(cs.borderTopColor) ? cs.borderTopColor : fg, sh = cs && has(cs.boxShadow) ? cs.boxShadow : '6px 6px 0 #e3262f', ff = (cs && cs.fontFamily) || '"Barlow Condensed",sans-serif';
      const d = document.createElement('div'); d.id = 'l54-note'; d.setAttribute('role', 'dialog');
      d.innerHTML = '<style>#l54-note{position:fixed;inset:0;z-index:2147483000;display:grid;place-items:center;padding:24px;background:rgba(0,0,0,.66)}#l54-note .c{width:100%;max-width:330px;box-sizing:border-box;padding:20px 20px 18px;border:3px solid;font:500 16px/1.45 Barlow,-apple-system,sans-serif;text-align:left}#l54-note b{display:block;margin:0 0 8px;font-size:22px;line-height:1.1;font-weight:800;text-transform:uppercase}#l54-note p{margin:0 0 18px}#l54-note button{min-height:44px;min-width:88px;padding:0 22px;border:0;font-size:17px;line-height:1;font-weight:800;text-transform:uppercase;border-radius:0;cursor:pointer}</style>' +
        '<div class="c"><b>' + (ok ? 'Picture key saved' : 'Picture key not saved') + '</b><p>' + (ok ? 'Open Book Den from your home screen. Your pictures will be there.' : 'Check your connection, then tap the link again.') + '</p><button type="button">OK</button></div>';
      const c = d.querySelector('.c'), b = d.querySelector('b'), k = d.querySelector('button');
      Object.assign(c.style, { background: bg, color: fg, borderColor: bd, boxShadow: sh }); b.style.fontFamily = ff; Object.assign(k.style, { background: fg, color: bg, fontFamily: ff });
      k.addEventListener('click', () => d.remove()); document.body.appendChild(d); } catch (e) { say(ok ? 'Picture key saved' : 'Picture key not saved'); } }
  try { const m = String(location.hash || '').match(/(?:^#|&)pk=(den-[A-Za-z0-9_-]{43})(?![A-Za-z0-9_-])/);
    if (m) { fromLink = true; L54.linkOnly = true; history.replaceState(null, '', location.pathname + location.search);
      // this visit is only for the key: it writes nothing else to his Sheet and shows no badge alerts (those stay for his phone)
      try { CAN_EDIT = false; } catch (e) {} try { if (window.L25) L25.announce = function () {}; } catch (e) {}
      L54.save(m[1]).then(note); } } catch (e) {}
  // check once his Sheet is in, and again whenever the app comes back to the screen
  const ready = () => !(typeof SYNC82 !== 'undefined' && SYNC82.state === 'wait');
  function check() { try { if (fromLink || !ready() || L54.ready() || !L54.has()) return; L54.sync(); } catch (e) {} }
  let tries = 0; const iv = setInterval(() => { tries++; if (ready() || tries > 60) { clearInterval(iv); setTimeout(check, 500); } }, 1000);
  document.addEventListener('visibilitychange', () => { if (document.visibilityState === 'visible') [3000, 7000, 15000].forEach(t => setTimeout(check, t)); });
})();

// ===== L54: his pictures, built in and locked. His own pictures (ACOTAR, Dungeon Crawler Carl, Steel) ship inside the site as
//   art/pack.bin, encrypted (AES-GCM, 256-bit key). Only the key kept on his phone opens it, so the public site never hands the
//   artists' work to anyone else. He pastes the key once in the Look sheet; after that, a newer pack comes in on its own.
//   The key stays on this phone: it is never written to the store or the site.
(function () {
  const L54 = window.L54 = {};
  const PACK_V = 1, LK = 'den:pk', LV = 'den:packv';
  const ls = { get(k) { try { return localStorage.getItem(k); } catch (e) { return null; } }, set(k, v) { try { localStorage.setItem(k, v); } catch (e) {} } };
  const clean = k => String(k || '').replace(/\s+/g, '');
  const b64u = s => { s = String(s).replace(/-/g, '+').replace(/_/g, '/'); while (s.length % 4) s += '='; const b = atob(s), u = new Uint8Array(b.length); for (let i = 0; i < b.length; i++) u[i] = b.charCodeAt(i); return u; };
  const say = m => { try { toast(m); } catch (e) {} };
  L54.V = PACK_V;
  L54.valid = k => /^den-[A-Za-z0-9_-]{43}$/.test(clean(k));
  L54.has = () => L54.valid(ls.get(LK));
  L54.inV = () => +(ls.get(LV) || 0);
  L54.ready = () => L54.has() && L54.inV() >= PACK_V;
  // fetch the locked pack and open it with the key (the pack is never kept by the service worker; the pictures go to IndexedDB)
  async function open(key) { const r = await fetch('art/pack.bin?v=' + PACK_V); if (!r.ok) throw new Error('net'); const buf = new Uint8Array(await r.arrayBuffer());
    let pt; try { const k = await crypto.subtle.importKey('raw', b64u(clean(key).slice(4)), { name: 'AES-GCM' }, false, ['decrypt']); pt = await crypto.subtle.decrypt({ name: 'AES-GCM', iv: buf.slice(0, 12) }, k, buf.slice(12)); } catch (e) { throw new Error('key'); }
    return JSON.parse(new TextDecoder().decode(pt)); }
  let busy = null;
  // bring the pictures in: with a key just pasted, or a newer pack with the key already on this phone
  L54.sync = function (key, quiet) { if (busy) return busy; const fresh = !!key;
    busy = (async () => { key = clean(key || ls.get(LK)); if (!L54.valid(key)) return { n: 0, err: 'nokey' }; if (!fresh && L54.inV() >= PACK_V) return { n: 0, same: 1 };
      let o; try { o = await open(key); } catch (e) { return { n: 0, err: e.message === 'key' ? 'key' : 'net' }; }
      if (!o || o.kind !== 'den-pack') return { n: 0, err: 'key' };
      ls.set(LK, key); let n = 0;
      try { if (o.looks && window.L34 && L34.artImport) n += await L34.artImport(o.looks); } catch (e) { console.warn('l54 looks', e); }
      try { if (o.steel && window.L51 && L51.importFile) n += await L51.importFile(o.steel); } catch (e) { console.warn('l54 steel', e); }
      ls.set(LV, String(PACK_V));
      try { if (window.L34) { L34.mast(); L34.artList().then(A => { if (window.L53 && L53.setArt) L53.setArt(A); }); } } catch (e) {}
      try { if (window.L51 && L51.apply) L51.apply(); } catch (e) {}
      if (!quiet || n) say(n ? 'Your pictures are in' : 'Your pictures were already in');
      return { n }; })().finally(() => { busy = null; });
    return busy; };
  // the Paste key button: the clipboard when the phone allows it, else a box to paste into
  L54.unlock = async function () { let k = '';
    try { if (navigator.clipboard && navigator.clipboard.readText) k = await navigator.clipboard.readText(); } catch (e) {}
    if (!L54.valid(k)) { try { k = window.prompt('Paste your picture key') || ''; } catch (e) { k = ''; } }
    if (!k) return { n: 0, err: 'none' };
    if (!L54.valid(k)) { say('That is not a picture key'); return { n: 0, err: 'bad' }; }
    const r = await L54.sync(k);
    if (r.err === 'key') say('That key does not open your pictures'); else if (r.err === 'net') say('Your pictures could not be downloaded. Try again with a connection.');
    return r; };
  // the Look sheet's part
  L54.block = function () { const ok = L54.ready();
    return '<h3>Your pictures</h3><p class="fine">' + (ok ? 'Your ACOTAR, Dungeon Crawler Carl and Steel pictures are in. New ones come with updates.' : 'Your ACOTAR, Dungeon Crawler Carl and Steel pictures come with the app, locked so only you can open them. Copy your picture key, then tap Paste key.') + '</p>' +
      (ok ? '' : '<button type="button" class="pk" data-a="pk">Paste key</button>'); };
  // a newer pack arrives with an update: bring it in quietly
  setTimeout(() => { try { if (L54.has() && L54.inV() < PACK_V) L54.sync(null, true); } catch (e) {} }, 3000);
})();

// ===== L11 (Book Den v1): the quiet look. Real covers, new Home, new book page, bottom tab bar, and a pass that tones down every loud rule. =====
(function () {
  const L11 = window.L11 = {};
  const I = window.L11I || {};
  const ic = (n, cls) => '<svg class="' + (cls || 'd-i') + '" viewBox="0 0 256 256" aria-hidden="true" fill="currentColor">' + (I[n] || '') + '</svg>';
  const H = 3600000;
  const mainT = t => String(t).split(':')[0].replace(/\((?:[^()]*)\)/g, '').trim();
  const norm = s => String(s || '').normalize('NFKD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/\((?:[^()]*)\)|\[(?:[^\]]*)\]/g, ' ').replace(/&/g, ' and ').replace(/[^a-z0-9 ]/g, ' ').replace(/\s+/g, ' ').trim();
  const authorFor = t => { const m = (typeof META !== 'undefined' && META[t]) || {}; if (m.author) return m.author; const s = typeof SERIES_OF !== 'undefined' && SERIES_OF[t]; const d = s && typeof SERIES_DB !== 'undefined' && SERIES_DB[s]; return (d && d.a) || ''; };
  L11.authorFor = authorFor;
  const fmtD = d => { if (!d) return ''; const x = new Date(String(d).slice(0, 10) + 'T12:00:00'); return isNaN(x) ? '' : x.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }); };
  const canEdit = () => typeof CAN_EDIT === 'undefined' || CAN_EDIT;
  document.body.classList.add('den');
  try { if (window.L11F) { const f = document.createElement('style'); f.id = 'l11fonts'; f.textContent = L11F; document.head.appendChild(f); } } catch (e) {}

  // ================= 1) real covers =================
  const CVK = t => 'cv:' + t;
  const cvGet = t => { try { return getOverride(CVK(t)) || {}; } catch (e) { return {}; } };
  const _ci = coverInner;
  const hue = t => { let h = 0; for (let i = 0; i < t.length; i++) h = (h * 31 + t.charCodeAt(i)) >>> 0; return h % 360; };
  const badCover = t => { const c = typeof COVERS !== 'undefined' && COVERS[t]; return !c || !!(c.lowres || c.upscaled); };
  L11.ph = t => '<div class="d-ph" data-cvt="' + enc(t) + '" style="--h:' + hue(t) + '"><b>' + esc(mainT(t)) + '</b>' + (authorFor(t) ? '<i>' + esc(authorFor(t)) + '</i>' : '') + '</div>';
  // the image is requested at the size of the slot that shows it: tiles get 400x600 (330 device px wide on a 3x screen), the hero and book page 800x1200
  L11.sized = function (u, big) { u = String(u || ''); if (/mzstatic\.com\//.test(u)) return u.replace(/\/[0-9]+x[0-9]+[a-z]*(-[0-9]+)?\.(jpg|png|webp)$/i, big ? '/800x1200bb.jpg' : '/400x600bb.jpg');
    if (/books\.google\.com/.test(u)) return u.replace(/fife=w\d+/, big ? 'fife=w800' : 'fife=w400'); if (/covers\.openlibrary\.org/.test(u)) return u.replace(/-[SML]\.jpg$/, '-L.jpg');
    // Wikimedia: an original is served as it is (a thumb larger than the original is a 404, and the API's URLs carry a
    // tracking query that breaks the thumb path); an existing thumb is only ever made smaller, never larger
    if (/^https:\/\/upload\.wikimedia\.org\//.test(u)) { u = u.replace(/[?#].*$/, ''); const m = u.match(/\/thumb\/.*\/(\d+)px-[^\/]+$/); if (m) { const have = +m[1]; const want = big ? 1000 : 600; if (want < have) return u.replace(/\/(\d+)px-([^\/]+)$/, '/' + want + 'px-$2'); } return u; }
    return u; };
  const ownArt = t => !!(window.L10 && L10.ART && L10.ART[t]) || t === 'The Fires of December';
  coverInner = function (t, big) {
    const c = cvGet(t);
    // his own art always wins; otherwise a verified store cover beats the small embedded art the old pipeline fetched
    if (typeof ART !== 'undefined' && ART[t] && !(typeof COVERS !== 'undefined' && COVERS[t]) && (ownArt(t) || !c.url)) return _ci.apply(this, arguments).replace(/^<(img|div) /, '<$1 data-cvt="' + enc(t) + '" ');
    if (c.url && !badNow(c.url)) return big ? '<img src="' + esc(L11.sized(c.url, true)) + '" alt="" decoding="async" data-cvt="' + enc(t) + '" onerror="L11.cvBad(this)">' : '<img data-src="' + esc(L11.sized(c.url, false)) + '" alt="" decoding="async" data-cvt="' + enc(t) + '" onerror="L11.cvBad(this)">';
    const stripped = typeof COVERS !== 'undefined' && COVERS[t] && !COVERS[t].cover_data;
    if (stripped) { if (typeof ART !== 'undefined' && ART[t]) return '<img src="' + ART[t] + '" alt="" loading="lazy" data-cvt="' + enc(t) + '">'; L11.ensure(t); return L11.ph(t); }
    if (!(typeof ART !== 'undefined' && ART[t] && badCover(t)) && badCover(t)) { L11.ensure(t); return L11.ph(t); }
    if (big) L11.ensure(t);
    const h = _ci.apply(this, arguments);
    return h.replace(/^<(img|div) /, '<$1 data-cvt="' + enc(t) + '" ');
  };
  // what a tile has to show: his own art, a saved cover, or good embedded art. The Has cover and No cover chips ask this
  // (Nov 18 2026, his words: "Lots of the no cover section has covers now": they asked whether the old embedded set had the
  // book, so 301 of the 309 books under No cover were showing a cover). A cover that failed to load a moment ago still counts.
  L11.has = function (t) { try { if (typeof ART !== 'undefined' && ART[t]) return true; if (cvGet(t).url) return true; const c = typeof COVERS !== 'undefined' && COVERS[t]; return !!(c && c.cover_data && !c.lowres && !c.upscaled); } catch (e) { return false; } };
  try { const _mf = matchesFilter; matchesFilter = function (t) { const f = filterMode; if (f !== 'cover' && f !== 'nocover') return _mf.apply(this, arguments);
      let ok; filterMode = 'all'; try { ok = _mf.apply(this, arguments); } finally { filterMode = f; }   // the search box still narrows it
      return ok && L11.has(t) === (f === 'cover'); }; } catch (e) {}
  L11._bad = {};
  // a cover that fails to load is retried before it is given up on: the resized URL falls back to the stored one, then one more
  // try after a pause (a flaky connection at open used to turn a whole shelf into placeholders for the session), and a
  // failure only counts for a minute. Offline, nothing is marked bad.
  L11.cvBad = function (el) { try { el.onerror = null; const t = decodeURIComponent(el.dataset.cvt || ''); const c = cvGet(t); const src = el.getAttribute('src') || ''; const n = +(el.dataset.cvTry || 0);
      if (navigator.onLine === false) return;
      el.style.visibility = 'hidden'; el.onload = () => { el.style.visibility = ''; el.onload = null; };
      if (c.url && n === 0 && src !== c.url) { el.dataset.cvTry = 1; el.onerror = () => L11.cvBad(el); el.src = c.url; return; }
      if (c.url && n < 2) { el.dataset.cvTry = n + 1; setTimeout(() => { if (!el.isConnected) return; el.onerror = () => L11.cvBad(el); el.src = (n === 1 ? L11.sized(c.url, !!el.closest('.d-hc, .d-hbg, .d-nc')) : c.url) + (c.url.includes('?') ? '&' : '?') + 'r=' + Date.now(); }, 2500); return; }
      if (c.url) { L11._bad[c.url] = Date.now(); }
      const stripped = typeof COVERS !== 'undefined' && COVERS[t] && !COVERS[t].cover_data; el.outerHTML = (badCover(t) || stripped) ? L11.ph(t) : _ci(t); } catch (e) {} };
  const badNow = u => { const at = L11._bad[u]; if (!at) return false; if (Date.now() - at > 60000) { delete L11._bad[u]; return false; } return true; };
  function swapCovers(t, url) { document.querySelectorAll('[data-cvt="' + enc(t) + '"]').forEach(el => { const big = !!el.closest('.d-hc, .d-hbg, .d-nc'); const u = L11.sized(url, big); if (el.tagName === 'IMG') { if (el.dataset.src) { el.dataset.src = u; return; } if (el.getAttribute('src') !== u) el.src = u; } else el.outerHTML = '<img src="' + esc(u) + '" alt="" data-cvt="' + enc(t) + '" onerror="L11.cvBad(this)">'; }); }
  let seq = 0;
  function jsonp(url) { return new Promise((res, rej) => { const cb = '__l11cb' + (++seq); const s = document.createElement('script'); const to = setTimeout(() => { done(); rej(new Error('timeout')); }, 12000);
    function done() { clearTimeout(to); try { delete window[cb]; } catch (e) { window[cb] = undefined; } s.remove(); }
    window[cb] = d => { done(); res(d); }; s.onerror = () => { done(); rej(new Error('net')); }; s.src = url + '&callback=' + cb; document.head.appendChild(s); }); }
  function pick(t, results, nameKey) {
    const want = norm(mainT(t)); if (!want) return null; const a = norm(authorFor(t)); const last = a.split(' ').pop();
    const ok = (results || []).filter(r => { const n = norm(r[nameKey] || r.trackName || r.collectionName); if (!n) return false; const head = n.startsWith(want) || (want.startsWith(n) && n.length >= 8); if (!head) return false; if (last && last.length > 2 && !norm(r.artistName).includes(last)) return false; return !!r.artworkUrl100; });
    if (!ok.length) return null; ok.sort((x, y) => norm(x[nameKey] || x.trackName).length - norm(y[nameKey] || y.trackName).length); return ok[0];
  }
  const big = (u, box) => String(u).replace(/\/[0-9]+x[0-9]+[a-z]*(-[0-9]+)?\.(jpg|png|webp)$/i, '/' + box + '.jpg');
  async function resolve(t) {
    const s = (typeof SERIES_OF !== 'undefined' && SERIES_OF[t]) || ''; const a = authorFor(t);
    const words = mainT(t).split(/\s+/).length; const term = mainT(t) + ' ' + (a ? a.split(' ').pop() : (words < 3 ? s : ''));
    const base = 'https://itunes.apple.com/search?country=us&limit=10&term=' + encodeURIComponent(term.trim());
    let appleOk = Date.now() >= apPauseTil;
    if (appleOk) { try { await L11.appleGate(); const d = await jsonp(base + '&media=ebook&entity=ebook'); L11.appleResult(true); const r = pick(t, d.results, 'trackName'); if (r) return { url: big(r.artworkUrl100, '1000x1500bb'), src: 'apple-books' }; } catch (e) { L11.appleResult(false); appleOk = false; } }
    if (appleOk) { try { await L11.appleGate(); const d = await jsonp(base + '&media=audiobook&entity=audiobook'); L11.appleResult(true); const r = pick(t, d.results, 'collectionName'); if (r) return { url: big(r.artworkUrl100, '1200x1200bb'), src: 'apple-audiobooks' }; } catch (e) { L11.appleResult(false); } }
    try { const q = 'https://openlibrary.org/search.json?fields=title,author_name,cover_i,edition_count&limit=8&title=' + encodeURIComponent(mainT(t)) + (a ? '&author=' + encodeURIComponent(a) : '');
      const r = await fetch(q); if (r.ok) { const j = await r.json(); const want = norm(mainT(t)); const docs = (j.docs || []).filter(x => x.cover_i && norm(x.title).startsWith(want)).sort((x, y) => (y.edition_count || 0) - (x.edition_count || 0)); if (docs[0]) return { url: 'https://covers.openlibrary.org/b/id/' + docs[0].cover_i + '-L.jpg', src: 'openlibrary' }; } } catch (e) {}
    return null;
  }
  function queue() {
    const T = (typeof ALL_TITLES !== 'undefined' ? ALL_TITLES : []).filter(t => t && !/^(show|game|badges|cv):/.test(t));
    const day = 864e5, nowT = Date.now();
    const need = T.filter(t => { const c = cvGet(t); if (c.url) return false; if (typeof ART !== 'undefined' && ART[t] && !(typeof COVERS !== 'undefined' && COVERS[t])) return false; if (c.miss && nowT - (c.at || 0) < 14 * day) return false; return true; });
    const rank = t => { const st = getStatus(t); const o = getOverride(t) || {}; const p = ((getOverride('party') || {}).q || []).some(x => x.t === t);
      return (st === 'currently-reading' ? 0 : p ? 1 : st === 'read' ? 2 : (typeof COVERS !== 'undefined' && COVERS[t]) ? 3 : 4) * 1e13 - (Date.parse(o.finished || o.started || 0) || 0); };
    return need.sort((x, y) => rank(x) - rank(y));
  }
  L11.queue = queue;
  // pacing: Apple allows about 20 calls a minute, so one call every 3.3 s; Open Library runs unpaced
  const sleep = ms => new Promise(r => setTimeout(r, ms));
  let apAt = 0, apFails = 0, apPauseTil = 0; const STAT = { ok: 0, miss: 0, err: 0 };
  L11.appleGate = async () => { if (Date.now() < apPauseTil) throw new Error('paused'); const w = apAt - Date.now(); apAt = Math.max(Date.now(), apAt) + 3300; if (w > 0) await sleep(w); };
  L11.appleResult = ok => { if (ok) apFails = 0; else if (++apFails >= 4) { apPauseTil = Date.now() + 10 * 60000; apFails = 0; } };
  let Q = null, qAt = 0; const PRI = []; const taken = new Set();
  const artOnly = t => typeof ART !== 'undefined' && ART[t] && !(typeof COVERS !== 'undefined' && COVERS[t]) && ownArt(t);
  L11.ensure = t => { if (!t || taken.has(t) || cvGet(t).url || artOnly(t)) return; if (!PRI.includes(t)) PRI.push(t); };
  function next() { while (PRI.length) { const t = PRI.shift(); if (!taken.has(t) && !cvGet(t).url) return t; } if (!Q || Date.now() - qAt > 10 * 60000) { Q = queue(); qAt = Date.now(); } while (Q.length) { const t = Q.shift(); if (!taken.has(t)) return t; } return null; }
  let statAt = 0; function stat(force) { if (!canEdit()) return; if (!force && Date.now() - statAt < 30000) return; statAt = Date.now(); try { setOverride('cvstat', { ok: STAT.ok, miss: STAT.miss, err: STAT.err, apple: Date.now() < apPauseTil ? 'paused' : 'ok', at: Date.now() }); } catch (e) {} }
  async function worker() { for (;;) {
    if (document.hidden || !canEdit() || (typeof SYNC82 !== 'undefined' && SYNC82.state === 'wait')) { await sleep(1500); continue; }
    const t = next(); if (!t) { await sleep(20000); continue; } taken.add(t);
    try { const r = await resolve(t); if (r) { setOverride(CVK(t), { url: r.url, src: r.src, at: Date.now(), miss: null }); swapCovers(t, r.url); STAT.ok++; } else { setOverride(CVK(t), { miss: 1, at: Date.now() }); STAT.miss++; } }
    catch (e) { STAT.err++; taken.delete(t); await sleep(4000); }
    stat(); } }
  L11.coverStep = async () => { const t = next(); if (!t) return; taken.add(t); const r = await resolve(t); if (r) { setOverride(CVK(t), { url: r.url, src: r.src, at: Date.now(), miss: null }); swapCovers(t, r.url); } else setOverride(CVK(t), { miss: 1, at: Date.now() }); };

  // ---- game covers: Wikipedia (lead image, any licence) then the App Store ----
  const GK = t => 'cv:game:' + t;
  const gameList = () => (typeof GAMES !== 'undefined' ? GAMES : []).map(g => g.t);
  function applyGameArt() { try { if (typeof ART === 'undefined') return 0; let n = 0; gameList().forEach(t => { const o = getOverride(GK(t)) || {}; const u = L11.sized(o.url, false); if (o.url && ART['game:' + t] !== u) { ART['game:' + t] = u; n++; } }); return n; } catch (e) { return 0; } }
  L11.applyGameArt = applyGameArt;
  // a game cover that fails to load: ask Wikipedia for a thumb at a size it can make, else the tile falls back to its title
  const gameFix = async img => { try { const box = img.closest('.gcov'); const u = img.getAttribute('src') || ''; const t = decodeURIComponent((img.closest('.gcard') || {}).dataset ? img.closest('.gcard').dataset.g : ''); if (!u || img.dataset.fixed) { if (box) box.classList.remove('hasart'); img.remove(); return; } img.dataset.fixed = 1;
      const m = u.match(/upload\.wikimedia\.org\/wikipedia\/(commons|en)\/(?:thumb\/)?[0-9a-f]\/[0-9a-f]{2}\/([^\/?#]+)/); if (m) { const r = await fetch('https://en.wikipedia.org/w/api.php?action=query&format=json&origin=*&titles=File:' + encodeURIComponent(decodeURIComponent(m[2])) + '&prop=imageinfo&iiprop=url&iiurlwidth=600'); if (r.ok) { const j = await r.json(); const pg = Object.values((j.query || {}).pages || {})[0]; const ii = pg && pg.imageinfo && pg.imageinfo[0]; const tu = ii && (ii.thumburl || ii.url); if (tu && tu !== u) { img.onerror = () => { if (box) box.classList.remove('hasart'); img.remove(); }; img.src = tu; if (t && typeof setOverride === 'function') setOverride(GK(t), { url: tu, src: 'wikipedia', at: Date.now(), miss: null }); return; } } }
      if (box) box.classList.remove('hasart'); img.remove(); } catch (e) {} };
  (function () { if (typeof renderGamesLib !== 'function') return; const _rg = renderGamesLib; renderGamesLib = function () { const r = _rg.apply(this, arguments); try { document.querySelectorAll('#lib-other .gcov img').forEach(img => { if (img.dataset.gfx) return; img.dataset.gfx = 1; img.addEventListener('error', () => gameFix(img)); if (img.complete && img.naturalWidth === 0 && img.getAttribute('src')) gameFix(img); }); } catch (e) {} return r; }; })();
  async function resolveGame(t) {
    const q = String(t).replace(/\s*\((?:[^()]*)\)\s*$/, '').replace(/[’]/g, "'");
    try { const u = 'https://en.wikipedia.org/w/api.php?action=query&format=json&origin=*&generator=search&gsrlimit=5&gsrsearch=' + encodeURIComponent(q + ' video game') + '&prop=pageimages&piprop=original|thumbnail&pithumbsize=900&pilicense=any';
      const r = await fetch(u); if (r.ok) { const j = await r.json(); const pages = Object.values((j.query || {}).pages || {}).sort((a, b) => (a.index || 0) - (b.index || 0)); const want = norm(q).split(' ').slice(0, 2).join(' ');
        const hit = pages.find(pg => norm(pg.title).startsWith(want) && (pg.original || pg.thumbnail)); if (hit) { const src = (hit.thumbnail || hit.original).source; if (!/\.svg/i.test(src)) return { url: src, src: 'wikipedia' }; } } } catch (e) {}
    try { await L11.appleGate(); const d = await jsonp('https://itunes.apple.com/search?country=us&limit=5&media=software&term=' + encodeURIComponent(q)); L11.appleResult(true); const want = norm(q).split(' ').slice(0, 2).join(' '); const r = (d.results || []).find(x => norm(x.trackName).startsWith(want)); if (r && (r.artworkUrl512 || r.artworkUrl100)) return { url: big(r.artworkUrl512 || r.artworkUrl100, '1024x1024bb'), src: 'app-store' }; } catch (e) { L11.appleResult(false); }
    return null; }
  async function gameWorker() { await sleep(1500); for (const t of gameList()) { const o = getOverride(GK(t)) || {}; if (o.url || (o.miss && Date.now() - (o.at || 0) < 7 * 864e5)) continue; while (document.hidden || !canEdit() || (typeof SYNC82 !== 'undefined' && SYNC82.state === 'wait')) await sleep(1500);
      const r = await resolveGame(t); if (r) setOverride(GK(t), { url: r.url, src: r.src, at: Date.now(), miss: null }); else setOverride(GK(t), { miss: 1, at: Date.now() });
      if (applyGameArt() && typeof currentLib !== 'undefined' && currentLib === 'screen' && typeof renderGamesLib === 'function') { try { renderGamesLib(); } catch (e) {} } } }
  // whatever scrolls into view gets looked up next
  const seenIO = 'IntersectionObserver' in window ? new IntersectionObserver(es => es.forEach(en => { if (!en.isIntersecting) return; const t = decodeURIComponent(en.target.dataset.cvt || ''); if (t && !cvGet(t).url) L11.ensure(t); seenIO.unobserve(en.target); }), { rootMargin: '200px' }) : null;
  // ---- image loading: our own near-viewport loader. Safari's loading="lazy" never fired for tiles inside horizontal shelves
  // until something re-rendered them, and show posters loaded all 70 at once. A tile gets its src when it comes within
  // 300 px of the viewport (any direction); without IntersectionObserver everything loads at once.
  const lzLoad = el => { const u = el.dataset.src; if (u) { delete el.dataset.src; el.src = u; } };
  // a shelf clips its tiles, so the one after the last visible tile is fetched early to keep sideways scrolling smooth
  const lzIO = 'IntersectionObserver' in window ? new IntersectionObserver(es => es.forEach(en => { if (!en.isIntersecting) return; const el = en.target; lzIO.unobserve(el); lzLoad(el); try { const tile = el.closest('.d-cv, .up-cv, .stile, .gcard'); const nx = tile && tile.nextElementSibling && tile.nextElementSibling.querySelector('img[data-src]'); if (nx) { lzIO.unobserve(nx); lzLoad(nx); } } catch (e) {} }), { rootMargin: '300px 300px 300px 300px' }) : null;
  L11.lazify = root => { try { const vh = innerHeight || 800, vw = innerWidth || 400; (root || document).querySelectorAll('img[src][loading="lazy"]:not([data-lz])').forEach(el => { el.dataset.lz = 1; if (!lzIO || (el.complete && el.naturalWidth)) return; const r = (el.closest('.stile, .card, .gcard, .d-cv, .l1-tile, .up-cv') || el).getBoundingClientRect(); if (r.bottom > -300 && r.top < vh + 300 && r.right > -300 && r.left < vw + 300) return; el.dataset.src = el.getAttribute('src'); el.removeAttribute('src'); el.removeAttribute('loading'); lzIO.observe(el); }); } catch (e) {} };
  const lzScan = () => { document.querySelectorAll('img[data-src]:not([data-lz])').forEach(el => { el.dataset.lz = 1; if (lzIO) lzIO.observe(el); else { el.src = el.dataset.src; delete el.dataset.src; } }); };
  // one scan per frame, not one per mutation (a render makes hundreds)
  { let due = 0; const scan = () => { due = 0; if (seenIO) document.querySelectorAll('[data-cvt]:not([data-io])').forEach(el => { el.dataset.io = 1; seenIO.observe(el); }); lzScan(); L11.lazify(); }; new MutationObserver(() => { if (!due) due = requestAnimationFrame(scan); }).observe(document.body, { childList: true, subtree: true }); scan(); }
  L11.startCovers = () => { if (L11._started) return; L11._started = 1; worker(); worker(); gameWorker(); };
  setTimeout(L11.startCovers, 800);
  document.addEventListener('visibilitychange', () => { if (document.hidden) stat(true); });

  // ================= 2) header + tab bar =================
  const TABS = { life: ['house', 'Home'], books: ['book-open', 'Books'], journey: ['map-trifold', 'Journey'], steel: ['barbell', 'Steel'], screen: ['television-simple', 'TV & Games'], inventory: ['package', 'Inventory'] };
  function greet() { const h = new Date().getHours(); return h < 5 ? 'Good evening' : h < 12 ? 'Good morning' : h < 17 ? 'Good afternoon' : 'Good evening'; }
  function yearCount() { const yr = String(new Date().getFullYear()); try { return ALL_TITLES.filter(t => getStatus(t) === 'read' && String(getOverride(t).finished || '').startsWith(yr)).length; } catch (e) { return 0; } }
  L11.head = function () { const hero = document.querySelector('header.hero'); if (!hero) return; let d = hero.querySelector('.d-head'); if (!d) { d = document.createElement('div'); d.className = 'd-head'; hero.appendChild(d); }
    const lib = (typeof currentLib !== 'undefined' && currentLib) || 'life'; const n = yearCount();
    d.innerHTML = '<div class="d-top"><span>' + new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' }) + '</span><span>' + n + ' book' + (n === 1 ? '' : 's') + ' in ' + new Date().getFullYear() + '</span></div><h1>' + (lib === 'life' ? greet() + ', Delvin.' : esc((TABS[lib] || [, ''])[1])) + '</h1>'; };
  L11.nav = function () { const nav = document.getElementById('libs'); if (!nav) return; nav.querySelectorAll('button[data-lib]').forEach(b => { const k = b.dataset.lib; const T = TABS[k]; if (!T) { b.style.display = 'none'; return; } const want = ic(T[0], 'd-ti') + '<span class="d-tl">' + T[1] + '</span>'; if (b.dataset.den !== k || !b.querySelector('.d-tl')) { b.innerHTML = want; b.dataset.den = k; } });
    Object.keys(TABS).forEach(k => { const b = nav.querySelector('button[data-lib="' + k + '"]'); if (b) nav.appendChild(b); }); };
  (function () { const _sw = switchLib; switchLib = function () { const r = _sw.apply(this, arguments); try { L11.head(); L11.nav(); } catch (e) {} return r; }; })();
  try { const nav = document.getElementById('libs'); if (nav) new MutationObserver(() => { if ([...nav.querySelectorAll('button[data-lib]')].some(b => TABS[b.dataset.lib] && b.dataset.den !== b.dataset.lib)) L11.nav(); }).observe(nav, { childList: true, subtree: true }); } catch (e) {}

  // ================= 3) Home =================
  function readingNow() { let L = []; try { L = ALL_TITLES.filter(t => getStatus(t) === 'currently-reading'); } catch (e) {}
    return L.sort((a, b) => String(getOverride(b).started || '').localeCompare(String(getOverride(a).started || '')) || ((getOverride(b).u || 0) - (getOverride(a).u || 0))); }
  function finishedLately(n) { let L = []; try { L = ALL_TITLES.filter(t => getStatus(t) === 'read' && getOverride(t).finished); } catch (e) {}
    return L.sort((a, b) => String(getOverride(b).finished).localeCompare(String(getOverride(a).finished))).slice(0, n); }
  const cvBox = (t, cls, big) => '<button class="' + cls + '" data-dopen="' + enc(t) + '">' + coverInner(t, big) + '</button>';
  function nowCard() { const R = readingNow(); if (!R.length) return '<div class="d-now empty"><p>Nothing marked as listening. Start one from Books.</p></div>';
    const t = R[0]; const o = getOverride(t) || {}; const p = typeof getProgress === 'function' ? getProgress(t) : 0; const a = authorFor(t); const s = typeof SERIES_OF !== 'undefined' && SERIES_OF[t]; const m = (typeof META !== 'undefined' && META[t]) || {};
    const sub = [a, s && s !== mainT(t) ? s + (m.num ? ' ' + m.num : '') : ''].filter(Boolean).join(' · ');
    const line = (p > 0 ? p + '%' : 'Listening') + (o.started ? ' · started ' + fmtD(o.started) : '');
    const rest = R.slice(1, 9);
    return '<div class="d-now"><div class="d-nc">' + cvBox(t, 'd-cv', true) + '</div><div class="d-nt" data-dopen="' + enc(t) + '"><b>' + esc(mainT(t)) + '</b>' + (sub ? '<i>' + esc(sub) + '</i>' : '') + '<div class="d-bar"><i style="width:' + Math.max(2, Math.min(100, p || 0)) + '%"></i></div><em>' + esc(line) + '</em></div></div>' +
      (rest.length ? '<div class="d-sec"><div class="d-k">Also listening · ' + (R.length - 1) + '</div><div class="d-row sm">' + rest.map(x => cvBox(x, 'd-cv')).join('') + '</div></div>' : ''); }
  function logRow() { let r = {}; try { r = (C2.habitsToday() || {}).r || {}; } catch (e) {}
    const sl = r.sleep && (r.sleep.h || r.sleep); const items = [
      ['steel', 'Steel', r.steel ? (r.steel > 1 ? r.steel + ' min' : 'logged') : 'log today', !!r.steel],
      ['sleep', 'Sleep', sl ? sl + ' h' : 'last night', !!r.sleep],
      ['steps', 'Steps', r.steps ? (+r.steps).toLocaleString() : 'log today', !!r.steps],
      ['book', 'Finished', (r.books || []).length ? (r.books.length + ' today') : 'a book', (r.books || []).length > 0]];
    return '<div class="d-log">' + items.map(([k, l, s, on]) => '<button class="' + (on ? 'on' : '') + '" data-l8dock="' + k + '"><b>' + l + '</b><span>' + esc(String(s)) + '</span></button>').join('') + '</div>'; }
  L11.home = function () { let stage = ''; try { stage = L8.scene(true); } catch (e) {} let enc0 = ''; try { enc0 = window.L9 ? L9.encounter() : ''; } catch (e) {}
    const F = finishedLately(12); let stamps = ''; try { stamps = L8.stampRow(); } catch (e) {}
    return '<div class="d-home">' + nowCard() + logRow() + (stage ? '<div class="d-stage">' + stage + '</div>' : '') + enc0 +
      (F.length ? '<div class="d-sec"><div class="d-k">Finished lately</div><div class="d-row">' + F.map(t => cvBox(t, 'd-cv')).join('') + '</div></div>' : '') + stamps + '</div>'; };
  L8.homeTop = () => L11.home();
  document.addEventListener('click', e => { const b = e.target.closest && e.target.closest('[data-dopen]'); if (!b) return; e.stopPropagation(); e.preventDefault(); openSheet(decodeURIComponent(b.dataset.dopen)); }, true);

  // ================= 4) book page =================
  function facts(t) { const m = (typeof META !== 'undefined' && META[t]) || {}; const f = [['Length', m.runtime], ['Narrator', m.narrator], ['Pages', m.pages], ['Published', m.year]].filter(x => x[1]);
    return f.length ? '<div class="d-facts">' + f.map(([k, v]) => '<div><small>' + k + '</small><b>' + esc(String(v)) + '</b></div>').join('') + '</div>' : ''; }
  function hero(t) { const m = (typeof META !== 'undefined' && META[t]) || {}; const a = authorFor(t); const s = typeof SERIES_OF !== 'undefined' && SERIES_OF[t];
    const meta = [m.rating ? '★ ' + m.rating : '', s && s !== mainT(t) ? s + (m.num ? ' ' + m.num : '') : ''].filter(Boolean).join(' · ');
    const cv = coverInner(t, true);
    return '<div class="d-hero"><div class="d-hbg">' + (/^<img/.test(cv) ? cv.replace(/ data-cvt="[^"]*"/, '').replace(/ onerror="[^"]*"/, '') : '') + '</div><div class="d-hfade"></div>' +
      '<button class="d-back" aria-label="Back">' + ic('caret-left') + '</button><div class="d-hc">' + cv + '</div><div class="d-ht"><b>' + esc(mainT(t)) + '</b>' + (a ? '<i>' + esc(a) + '</i>' : '') + (meta ? '<em>' + esc(meta) + '</em>' : '') + '</div></div>'; }
  (function () { const _rs = renderSheet; renderSheet = function () { const r = _rs.apply(this, arguments); try {
    const t = sheetTitle; const body = sheet.querySelector('.sheet-body'); if (!body) return r; sheet.classList.toggle('d-book', !!t && !/^(show|game|badges):/.test(t));
    if (!t || /^(show|game|badges):/.test(t)) return r; if (body.querySelector('.d-hero')) return r;
    body.insertAdjacentHTML('afterbegin', hero(t));
    const st = [...body.querySelectorAll('.blk')].find(b => b.querySelector('[data-status]')); if (st) st.insertAdjacentHTML('afterend', facts(t));
    const art = body.querySelector('.l10-blk'); const syn = body.querySelector('.syn'); if (st && syn) st.insertAdjacentElement('afterend', syn); if (art && syn) syn.insertAdjacentElement('afterend', art);
  } catch (e) { console.warn('l11 sheet', e); } return r; }; })();
  document.addEventListener('click', e => { const b = e.target.closest && e.target.closest('.d-back'); if (!b) return; e.stopPropagation(); e.preventDefault(); closeSheet(); }, true);
  // pull down from the top to close
  (function () { const p = () => sheet.querySelector('.sheet-panel'); let y0 = null, dy = 0, el = null;
    document.addEventListener('touchstart', e => { el = p(); if (!el || !sheet.classList.contains('open') || el.scrollTop > 0 || document.querySelector('.l10-lb')) { y0 = null; return; } y0 = e.touches[0].clientY; dy = 0; }, { passive: true });
    document.addEventListener('touchmove', e => { if (y0 == null || !el) return; dy = e.touches[0].clientY - y0; if (dy > 0 && el.scrollTop <= 0) { el.style.transform = 'translateY(' + Math.min(dy * 0.8, 300) + 'px)'; el.style.transition = 'none'; } }, { passive: true });
    document.addEventListener('touchend', () => { if (y0 == null || !el) return; const close = dy > 110; el.style.transition = 'transform .2s ease-out'; el.style.transform = close ? 'translateY(100%)' : ''; if (close) setTimeout(() => { closeSheet(); el.style.transform = ''; el.style.transition = ''; }, 190); y0 = null; }, { passive: true }); })();

  // ================= 5) tone down every loud rule =================
  const LOUD_BG = /#e3262f|#c1272d|#ffd23f|#ffd54a|#2fd27a|#f4ead6|#fff\b|#ffffff|var\(--(red7|gold7|cream7|paper|red)\)|rgb\(227, 38, 47\)|rgb\(255, 210, 63\)|rgb\(244, 234, 214\)|rgb\(47, 210, 122\)|rgb\(255, 255, 255\)|#27399a|#0d1660/i;
  const DARK_TX = /^(#0c0b0d|#000|#000000|#111|#0c0b0d!important|rgb\(12, 11, 13\)|rgb\(0, 0, 0\)|#1a1a1a|var\(--ink7\))$/i;
  const SKIP = /\b(l9-ly|l9-trav|l9-gym|l9-fire|l9-ground|dragon|dsprite|fire|l10-lb|d-|l8-lay|l8-dash|l8-trav|l8-fire|ember|gi\b|l5-p|j5-plate|plate)/;
  function tone() { const out = [];
    [...document.styleSheets].forEach(ss => { const id = ss.ownerNode && ss.ownerNode.id; if (id === 'l11css' || id === 'l11tone' || id === 'l11fonts' || id === 'fonts') return; let rules; try { rules = ss.cssRules; } catch (e) { return; }
      const walk = list => [...list].forEach(r => { if (r.cssRules && r.type !== 1) { if (r.type === 4) return; walk(r.cssRules); return; } if (r.type !== 1) return; const sel = r.selectorText || ''; if (!sel || SKIP.test(sel) || /::?-webkit|@/.test(sel)) return; const s = r.style; const fix = [];
        if (s.boxShadow && s.boxShadow !== 'none' && !/inset/.test(s.boxShadow)) fix.push('box-shadow:none');
        if (/skew/.test(s.transform)) fix.push('transform:none');
        const bg = s.background || s.backgroundColor || s.backgroundImage; if (bg && LOUD_BG.test(bg) && !/url\(/.test(bg)) fix.push(/gradient/.test(bg) && /exp|bar|fill|prog/.test(sel) ? 'background:var(--d-acc)' : 'background:var(--d-bg2)');
        if (s.color && DARK_TX.test(s.color.trim())) fix.push('color:var(--d-ink)');
        const bstr = [s.border, s.borderTop, s.borderBottom, s.borderLeft, s.borderRight, s.borderWidth, s.borderTopWidth, s.borderBottomWidth].join(' ');
        if (/(^|\s)([2-9]|1[0-9])px/.test(bstr) && !/l9-|l8-route/.test(sel)) fix.push('border-width:1px', 'border-color:var(--d-line)');
        if (/(^|\s)([2-9]|1[0-9])px/.test(s.outline || '') && !/l9-/.test(sel)) fix.push('outline:none');
        if (s.color && /#e3262f|#c1272d|var\(--red7\)|rgb\(227, 38, 47\)/i.test(s.color)) fix.push('color:var(--d-ink)');
        if (s.color && /#ffd23f|#ffd54a|var\(--gold7\)|#e8c36a|rgb\(255, 210, 63\)/i.test(s.color)) fix.push('color:var(--d-acc)');
        const bg2 = s.background || s.backgroundColor; if (bg2 && /var\(--(ink7|panel7|paper7)\)|#0c0b0d|#1c1a1f|#0e1426|#141216/i.test(bg2) && !/url\(|gradient/.test(bg2)) fix.push('background:var(--d-bg2)');
        if (/Anton/.test(s.fontFamily)) fix.push('letter-spacing:.04em');
        if (/uppercase/.test(s.textTransform) && /Anton/.test(s.fontFamily) && parseFloat(s.fontSize) >= 18) fix.push('text-transform:none', 'font-family:Fraunces,serif', 'font-weight:500', 'letter-spacing:0');
        if (fix.length) out.push('html body.den ' + sel.split(',').map(x => x.trim().replace(/^html body\s*/, '')).join(',html body.den ') + '{' + fix.map(f => f + '!important').join(';') + '}'); });
      walk(rules); });
    let st = document.getElementById('l11tone'); if (!st) { st = document.createElement('style'); st.id = 'l11tone'; document.head.appendChild(st); } st.textContent = out.join('\n');
    const own = document.getElementById('l11css'); if (own) document.head.appendChild(own); return out.length; }
  L11.tone = tone;

  // ================= 6) the stylesheet =================
  const css = document.createElement('style'); css.id = 'l11css'; css.textContent = `
:root{--d-bg:#14110f;--d-bg2:#1d1916;--d-bg3:#26211d;--d-ink:#efe6d8;--d-mute:#9a8f82;--d-line:rgba(239,230,216,.12);--d-acc:#d9a441}
html body.den{background:var(--d-bg)!important;background-image:none!important;color:var(--d-ink)!important;font-family:'Barlow',sans-serif!important;padding-bottom:calc(76px + env(safe-area-inset-bottom))!important;overscroll-behavior-y:none}
html body.den input,html body.den select,html body.den textarea{font-size:16px!important}
/* header */
html body.den header.hero{background:var(--d-bg)!important;border:0!important;height:auto!important;min-height:0!important;padding:calc(env(safe-area-inset-top) + 14px) 20px 6px!important;position:relative!important;overflow:hidden!important}
html body.den header.hero .panels,html body.den header.hero .l7-mast{display:none!important}html body.den header.hero:before,html body.den header.hero:after{display:none!important}html body.den header.hero .sky{background:none!important}
html body.den header.hero .sky{display:block!important;position:absolute!important;inset:0!important;height:auto!important;z-index:0!important;pointer-events:none;opacity:.9}
html body.den header.hero .sky .dragon.pix{width:calc(64px * var(--dsc,1))!important;top:calc(env(safe-area-inset-top) + 2px)!important;animation:fly 26s linear infinite!important;filter:none!important}
.d-head{position:relative;z-index:1}
.d-top{display:flex;justify-content:space-between;font:600 12px 'Anton',sans-serif;letter-spacing:.14em!important;text-transform:uppercase;color:var(--d-mute)}
.d-head h1{font-family:'Fraunces',serif!important;font-weight:400!important;font-size:30px!important;line-height:1.15!important;letter-spacing:-.01em!important;margin:6px 0 0!important;color:var(--d-ink)!important;text-transform:none!important;background:none!important;-webkit-text-stroke:0!important;text-shadow:none!important}
/* tab bar */
html body.den nav#libs.libs.libs.libs{position:fixed!important;left:0!important;right:0!important;bottom:0!important;top:auto!important;z-index:150!important;display:flex!important;gap:0!important;margin:0!important;padding:6px 4px calc(6px + env(safe-area-inset-bottom))!important;background:rgba(20,17,15,.97)!important;border:0!important;border-top:1px solid var(--d-line)!important;overflow:visible!important}
html body.den nav#libs button[data-lib]{flex:1 1 0!important;min-width:0!important;display:flex!important;flex-direction:column!important;align-items:center!important;gap:3px!important;padding:6px 0 2px!important;margin:0!important;background:none!important;border:0!important;color:var(--d-mute)!important;transform:none!important;height:auto!important;min-height:0!important}
html body.den nav#libs button[data-lib] span.d-tl{display:block!important;font:500 10.5px 'Barlow',sans-serif!important;letter-spacing:0!important;text-transform:none!important;white-space:nowrap}
html body.den nav#libs button[data-lib].active{color:var(--d-ink)!important;background:none!important}
html body.den nav#libs button[data-lib].active .d-ti{color:var(--d-acc)}
.d-ti{width:24px;height:24px}
html body.den nav#libs button[data-lib]:before,html body.den nav#libs button[data-lib]:after{display:none!important}
html body.den #hud,html body.den .fab110{display:none!important}
html body.den nav#libs .tab84-ic,html body.den nav#libs .lab84,html body.den nav#libs small,html body.den nav#libs em{display:none!important}
/* home */
.d-home{padding:6px 0 0}
.d-now{display:flex;gap:16px;align-items:flex-end;margin:14px 0 0}
.d-now.empty p{color:var(--d-mute);font-size:14px;margin:8px 0}
.d-nc .d-cv{width:128px;height:192px}
.d-nt{flex:1;min-width:0;padding-bottom:6px;cursor:pointer}
.d-nt b{display:block;font-family:'Fraunces',serif;font-weight:500;font-size:22px;line-height:1.15;color:var(--d-ink)}
.d-nt i{display:block;font-style:normal;color:var(--d-mute);font-size:14px;margin-top:4px;line-height:1.3}
.d-bar{height:3px;background:var(--d-line);border-radius:2px;margin:14px 0 7px;overflow:hidden}.d-bar i{display:block;height:100%;background:var(--d-acc);border-radius:2px}
.d-nt em{font-style:normal;font-size:12px;color:var(--d-mute);letter-spacing:.04em}
html body.den .d-cv{display:block;padding:0;border:0!important;background:var(--d-bg3)!important;border-radius:3px;overflow:hidden;box-shadow:0 14px 30px rgba(0,0,0,.55)!important;flex:0 0 auto}
html body.den .d-cv img{width:100%;height:100%;object-fit:cover;display:block}
html body.den .d-cv .ph{width:100%;height:100%;display:flex;flex-direction:column;justify-content:flex-end;padding:8px;background:var(--d-bg3)!important;border:0!important}
html body.den .d-cv .ph-title{font-family:'Fraunces',serif!important;font-size:12px!important;line-height:1.2;color:var(--d-ink)!important;text-transform:none!important}
html body.den .d-cv .ph-author{font-size:10px;color:var(--d-mute)!important}
.d-sec{margin-top:26px}
.d-k{font:600 12px 'Anton',sans-serif;letter-spacing:.14em!important;text-transform:uppercase;color:var(--d-mute);margin:0 0 10px}
.d-row{display:flex;gap:10px;overflow-x:auto;scrollbar-width:none;margin:0 -20px;padding:0 20px 18px}.d-row::-webkit-scrollbar{display:none}
.d-row .d-cv{width:84px;height:126px}.d-row.sm .d-cv{width:56px;height:84px;box-shadow:0 8px 18px rgba(0,0,0,.5)!important}
.d-log{display:grid;grid-template-columns:repeat(4,1fr);gap:8px;margin:24px 0 0}
.d-log button{height:56px;border:1px solid var(--d-line)!important;border-radius:12px!important;background:var(--d-bg2)!important;color:var(--d-ink)!important;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:2px;padding:0 2px;box-shadow:none!important}
.d-log b{font:500 14px 'Barlow',sans-serif}.d-log span{font-size:11px;color:var(--d-mute);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;max-width:100%}
.d-log button.on{border-color:rgba(217,164,65,.45)!important}.d-log button.on span{color:var(--d-acc)}
.d-log button:active{background:var(--d-bg3)!important}
.d-stage{margin:24px 0 0}
html body.den .d-stage .l9-stage{border:0!important;outline:0!important;border-radius:12px!important;margin:0!important}
html body.den .d-stage .l9-ribbon{background:none!important;border:0!important;margin:8px 0 0!important;padding:0!important;width:100%!important;color:var(--d-ink)!important}
html body.den .l9-ribbon b{background:none!important;color:var(--d-mute)!important;font:600 11px 'Anton',sans-serif!important;letter-spacing:.14em!important;padding:0!important}
html body.den .l9-ribbon span{font:500 15px 'Barlow',sans-serif!important;text-transform:none!important}
html body.den .l9-ribbon em i{width:12px!important;height:4px!important;border:0!important;border-radius:2px;background:var(--d-line)!important}html body.den .l9-ribbon em i.on,html body.den .l9-ribbon em i.here{background:var(--d-acc)!important}
html body.den .l9-ribbon small{color:var(--d-mute)!important;text-transform:none!important;letter-spacing:0!important;font-size:12px!important}
html body.den .l9-chip{background:rgba(20,17,15,.6)!important;border:0!important;border-radius:20px!important;font:500 12px 'Barlow',sans-serif!important;text-transform:none!important;letter-spacing:0!important;padding:4px 10px!important;backdrop-filter:blur(6px)}
html body.den .l9-chip.lamp i{border:0!important;border-radius:2px;width:6px!important;height:12px!important;box-shadow:none!important;background:linear-gradient(0deg,var(--d-acc) calc(var(--p) * 100%),rgba(239,230,216,.2) 0)!important}
html body.den .l9-enc{background:var(--d-bg2)!important;border:1px solid var(--d-line)!important;border-radius:12px!important;margin:12px 0 0!important}
html body.den .l9-et i{background:none!important;color:var(--d-acc)!important;font:600 11px 'Anton',sans-serif!important;letter-spacing:.12em!important;padding:0!important}
html body.den .l9-et b{font-family:'Fraunces',serif!important;font-weight:500!important;font-size:17px!important;text-transform:none!important;color:var(--d-ink)!important}
html body.den .l9-et small{color:var(--d-mute)!important}
html body.den .l8-catch,html body.den .l8-pass{border:1px solid var(--d-line)!important;border-radius:10px!important;background:var(--d-bg3)!important;color:var(--d-ink)!important;font:500 13px 'Barlow',sans-serif!important;text-transform:none!important}
html body.den .l8-catch{border-color:rgba(217,164,65,.5)!important;color:var(--d-acc)!important}
html body.den .l8-stamps{background:none!important;border:0!important;padding:0!important;margin:26px 0 0!important}
html body.den .l8-st-h span{background:none!important;color:var(--d-mute)!important;font:600 12px 'Anton',sans-serif!important;letter-spacing:.14em!important;padding:0!important;border:0!important}
html body.den .l8-seal:after{display:none!important}html body.den .l8-seal .l4-m{filter:grayscale(.6) brightness(.8);animation:none!important}
/* everything below the top of Home */
html body.den .l3-hero,html body.den .l7-chats{display:none!important}
html body.den .l3-h{background:none!important;border:0!important;color:var(--d-mute)!important;font:600 12px 'Anton',sans-serif!important;letter-spacing:.14em!important;text-transform:uppercase!important;padding:0!important;margin:30px 0 10px!important;transform:none!important}
html body.den .l3-h *{color:inherit!important;font:inherit!important;background:none!important}
html body.den .l3-card,html body.den .l3-yr{background:var(--d-bg2)!important;border:1px solid var(--d-line)!important;border-radius:14px!important;box-shadow:none!important}
html body.den #lib-other,html body.den #lib-books,html body.den .container{padding-left:20px!important;padding-right:20px!important}
/* book page */
html body.den #sheet{max-height:none!important;height:auto!important;inset:0!important;border:0!important}html body.den #sheet.open{background:var(--d-bg)!important}
html body.den #sheet.d-book .sheet-panel,html body.den #sheet.open .sheet-panel{position:fixed!important;inset:0!important;width:100%!important;max-width:none!important;max-height:none!important;height:100%!important;margin:0!important;border:0!important;border-radius:0!important;box-shadow:none!important;background:var(--d-bg)!important;padding:0 0 calc(96px + env(safe-area-inset-bottom))!important;transform:none;overflow-y:auto!important;-webkit-overflow-scrolling:touch}
html body.den #sheet .sheet-body{padding:0 20px!important}
html body.den #sheet.open:not(.d-book) .sheet-body{padding-top:calc(env(safe-area-inset-top) + 64px)!important}
html body.den #sheet .sheet-close{top:calc(env(safe-area-inset-top) + 10px)!important;left:12px!important;right:auto!important;width:40px!important;height:40px!important;border-radius:50%!important;border:0!important;background:rgba(20,17,15,.6)!important;color:var(--d-ink)!important;font-size:16px!important;position:fixed!important;z-index:5!important}
html body.den #sheet.d-book .sheet-close,html body.den #sheet.d-book .sheet-top,html body.den .l10-close{display:none!important}
.d-hero{position:relative;margin:0 -20px;height:calc(env(safe-area-inset-top) + 300px);overflow:hidden}
.d-hbg{position:absolute;inset:-30px}.d-hbg img{width:100%;height:100%;object-fit:cover;filter:blur(22px) brightness(.42) saturate(1.15);transform:scale(1.1)}
.d-hfade{position:absolute;inset:0;background:linear-gradient(rgba(20,17,15,0) 35%,var(--d-bg))}
.d-back{position:absolute;left:12px;top:calc(env(safe-area-inset-top) + 8px);width:40px;height:40px;border-radius:50%!important;border:0!important;background:rgba(20,17,15,.55)!important;color:var(--d-ink)!important;display:flex;align-items:center;justify-content:center;backdrop-filter:blur(8px);-webkit-backdrop-filter:blur(8px);z-index:3;padding:0}
.d-back .d-i{width:20px;height:20px}
.d-hc{position:absolute;left:20px;bottom:0;width:150px;height:225px;border-radius:3px;overflow:hidden;box-shadow:0 18px 40px rgba(0,0,0,.7);background:var(--d-bg3);z-index:2}
.d-hc img{width:100%;height:100%;object-fit:cover;display:block}
html body.den .d-hc .ph{height:100%;display:flex;flex-direction:column;justify-content:flex-end;padding:10px;background:var(--d-bg3)!important;border:0!important}
html body.den .d-hc .ph-title{font-family:'Fraunces',serif!important;font-size:15px!important;color:var(--d-ink)!important;text-transform:none!important}
.d-ht{position:absolute;left:186px;right:20px;bottom:8px;z-index:2}
.d-ht b{display:block;font-family:'Fraunces',serif;font-weight:500;font-size:22px;line-height:1.14;color:var(--d-ink)}
.d-ht i{display:block;font-style:normal;color:var(--d-mute);font-size:14px;margin-top:6px}
.d-ht em{display:block;font-style:normal;font-size:13px;color:var(--d-acc);margin-top:8px}
html body.den #sheet .blk{border-top:1px solid var(--d-line)!important;border-bottom:0!important;padding:16px 0!important;margin:0!important;background:none!important}
html body.den #sheet .blk:first-of-type{border-top:0!important}
html body.den #sheet .lbl{margin:0 0 10px!important;font:600 12px 'Anton',sans-serif!important;letter-spacing:.14em!important;text-transform:uppercase!important;color:var(--d-mute)!important;background:none!important;transform:none!important;padding:0!important}
html body.den #sheet .seg{display:flex!important;flex-wrap:nowrap!important;gap:0!important;border:1px solid var(--d-line)!important;border-radius:12px!important;overflow:hidden!important;background:none!important}
html body.den #sheet .seg button{flex:1 1 0!important;min-width:0!important;margin:0!important;padding:11px 0!important;border:0!important;border-radius:0!important;background:none!important;box-shadow:none!important;color:var(--d-mute)!important;font:500 13px 'Barlow',sans-serif!important;text-transform:none!important;letter-spacing:0!important;transform:none!important}
html body.den #sheet .seg button.on{background:var(--d-bg3)!important;color:var(--d-ink)!important}
html body.den #sheet .seg button[data-status=""]{display:none!important}
html body.den #sheet .syn{font-family:'Fraunces',serif!important;font-size:16px!important;line-height:1.5!important;color:#d8cebf!important;margin:4px 0 18px!important}
.d-facts{display:grid;grid-template-columns:1fr 1fr;gap:14px 20px;margin:4px 0 18px}
.d-facts div{border-top:1px solid var(--d-line);padding-top:8px}.d-facts small{display:block;font:600 11px 'Anton',sans-serif;letter-spacing:.12em;text-transform:uppercase;color:var(--d-mute)}.d-facts b{font-weight:500;font-size:15px}
html body.den #sheet .l10-blk{border:0!important;padding:0 0 18px!important}
html body.den #sheet .l10-strip{margin:0 -20px!important;padding:0 20px 6px!important}
html body.den #sheet .l10-strip button{border:0!important;border-radius:6px!important;overflow:hidden;background:var(--d-bg3)!important}
html body.den #sheet .l10-strip img{height:128px!important}
html body.den #sheet input,html body.den #sheet .prog{background:var(--d-bg2)!important;border:1px solid var(--d-line)!important;border-radius:10px!important;color:var(--d-ink)!important}
html body.den #sheet .links a{border:1px solid var(--d-line)!important;border-radius:12px!important;background:var(--d-bg2)!important;color:var(--d-ink)!important;font:500 14px 'Barlow',sans-serif!important;text-transform:none!important;letter-spacing:0!important}
html body.den #sheet .stars i,html body.den #sheet .rate i{color:var(--d-mute)}
/* lower Home, by hand */
html body.den .s-forms,html body.den .l3-ghost,html body.den .l3-note,html body.den .l3-warn{display:none!important}
html body.den .l3-card{padding:16px!important;margin:0!important}
html body.den .l3-done{display:flex!important;flex-wrap:wrap!important;gap:6px!important;margin:0 0 14px!important}
html body.den .l3-done span{border:0!important;background:none!important;padding:0 8px 0 0!important;font:500 12px 'Barlow',sans-serif!important;text-transform:none!important;letter-spacing:0!important;color:var(--d-mute)!important;box-shadow:none!important}
html body.den .l3-done span:before{content:"";display:inline-block;width:7px;height:7px;border-radius:50%;margin-right:6px;background:var(--c);opacity:.35;vertical-align:1px}
html body.den .l3-done span.on{color:var(--d-ink)!important}html body.den .l3-done span.on:before{opacity:1}
html body.den .l3-quick{display:grid!important;grid-template-columns:repeat(3,1fr)!important;gap:8px!important}
html body.den .l3-quick button{min-height:44px!important;height:auto!important;border:1px solid var(--d-line)!important;border-radius:10px!important;background:var(--d-bg)!important;color:var(--d-ink)!important;font:500 13px 'Barlow',sans-serif!important;text-transform:none!important;letter-spacing:0!important;box-shadow:none!important;transform:none!important;padding:6px 4px!important}
html body.den .l3-quick button.on{border-color:rgba(217,164,65,.45)!important;color:var(--d-acc)!important;background:var(--d-bg)!important}
html body.den .l3-calh{display:flex!important;align-items:center!important;justify-content:space-between!important;margin:0 0 10px!important}
html body.den .l3-calh b{font:500 18px 'Fraunces',serif!important;text-transform:none!important;letter-spacing:0!important;color:var(--d-ink)!important}
html body.den .l3-calh button{width:36px!important;height:36px!important;border:0!important;border-radius:50%!important;background:var(--d-bg)!important;color:var(--d-ink)!important;box-shadow:none!important}
html body.den .l3-dow span{font:600 10px 'Anton',sans-serif!important;color:var(--d-mute)!important;letter-spacing:.1em!important}
html body.den .l3-cal{gap:4px!important}
html body.den .l3-cd{border:0!important;border-radius:8px!important;background:none!important;box-shadow:none!important;min-height:42px!important;padding:4px 0!important}
html body.den .l3-cd b{font:500 14px 'Barlow',sans-serif!important;color:var(--d-ink)!important}
html body.den .l3-cd.fut b{color:rgba(239,230,216,.25)!important}
html body.den .l3-cd.now{background:var(--d-bg3)!important}html body.den .l3-cd.now b{color:var(--d-acc)!important}
html body.den .l3-cd.sel{outline:1px solid var(--d-acc)!important}
html body.den .l3-cd span i{width:4px!important;height:4px!important}
html body.den .l3-leg{gap:10px!important;margin-top:12px!important}html body.den .l3-leg span{font:400 11px 'Barlow',sans-serif!important;color:var(--d-mute)!important}
html body.den .l3-leg i{width:6px!important;height:6px!important}
html body.den .l3-card table,html body.den .l3-card td,html body.den .l3-card th{border-color:var(--d-line)!important}
html body.den .l3-card input{background:var(--d-bg)!important;border:1px solid var(--d-line)!important;border-radius:8px!important;color:var(--d-ink)!important;box-shadow:none!important}
html body.den .l3-card *{box-shadow:none!important}
html body.den .l3-wk,html body.den .l3-tr>span{color:var(--d-mute)!important;font:400 12px 'Barlow',sans-serif!important}
html body.den .l3-tc{border:0!important;border-radius:4px!important;background:var(--d-bg)!important;height:52px!important}
html body.den .l3-tc i{background:rgba(217,164,65,.55)!important}
html body.den .l3-tc small{color:var(--d-ink)!important;font:500 11px 'Barlow',sans-serif!important}
html body.den .l3-yr{background:none!important;border:0!important;padding:0!important;gap:8px!important}
html body.den .l3-yr div{background:var(--d-bg2)!important;border:1px solid var(--d-line)!important;border-radius:12px!important;padding:12px!important}
html body.den .l3-yr b{font:500 24px 'Fraunces',serif!important;color:var(--d-ink)!important}
html body.den .l3-yr span{font:400 11px 'Barlow',sans-serif!important;text-transform:none!important;letter-spacing:0!important;color:var(--d-mute)!important}
html body.den nav#libs button[data-lib].active span.d-tl,html body.den nav#libs button[data-lib].active{color:var(--d-ink)!important;opacity:1!important}
html body.den nav#libs button[data-lib] .d-ti{color:inherit}
html body.den .d-ph{width:100%;height:100%;display:flex;flex-direction:column;justify-content:flex-end;gap:4px;padding:10% 9%;background:linear-gradient(160deg,hsl(var(--h) 22% 22%),hsl(var(--h) 18% 12%));text-align:left;overflow:hidden}
html body.den .d-ph b{font:500 13px/1.15 'Fraunces',serif;color:var(--d-ink);display:-webkit-box;-webkit-line-clamp:4;-webkit-box-orient:vertical;overflow:hidden}
html body.den .d-ph i{font:400 10px 'Barlow',sans-serif;font-style:normal;color:rgba(239,230,216,.6)}
html body.den .d-hc .d-ph b,html body.den .d-nc .d-ph b{font-size:19px}html body.den .d-hc .d-ph i,html body.den .d-nc .d-ph i{font-size:12px}
html body.den .d-row.sm .d-ph b{font-size:9.5px}html body.den .d-row.sm .d-ph i{display:none}
html body.den .l8-st-h small{display:none!important}
html body.den .l8-st-row{gap:18px!important}
html body.den .l8-seal b{font:500 12px/1.25 'Barlow',sans-serif!important;color:var(--d-ink)!important;margin-top:6px}
html body.den .l8-seal small{font:400 11px 'Barlow',sans-serif!important;color:var(--d-mute)!important}
/* other tabs, by hand */
html body.den .j5-hero .j5-k,html body.den .j5-hero>h2{display:none!important}
html body.den .j5-hero{background:none!important;border:0!important;padding:0!important;margin:0 0 12px!important}
html body.den .l9-stage{border:0!important;outline:0!important;border-radius:12px!important;box-shadow:none!important}
html body.den .l9-ribbon{background:none!important;border:0!important;transform:none!important;box-shadow:none!important;margin:8px 0 0!important;padding:0!important;width:100%!important;color:var(--d-ink)!important}
html body.den .libhead{outline:0!important;background:var(--d-bg2)!important;background-image:none!important;border:1px solid var(--d-line)!important;border-radius:14px!important;box-shadow:none!important}
html body.den .libhead *{text-shadow:none!important}
html body.den .libhead .libbar-top span{font:500 12px 'Barlow',sans-serif!important;letter-spacing:0!important;text-transform:none!important;color:var(--d-mute)!important}
html body.den .exp-card{background:var(--d-bg2)!important;background-image:none!important;border:1px solid var(--d-line)!important;border-radius:14px!important;box-shadow:none!important}
html body.den .exp-rank{font:500 22px 'Fraunces',serif!important;text-transform:none!important;letter-spacing:0!important;color:var(--d-ink)!important}
html body.den .exp-card [class*=fill],html body.den .libhead [class*=fill]{background:var(--d-acc)!important;background-image:none!important}
html body.den .exp-card [class*=bar]:not([class*=top]){border:0!important;border-radius:3px!important;background-color:rgba(239,230,216,.1)!important;height:6px!important;overflow:hidden}
/* toasts and bursts quiet */
html body.den .l9-cred,html body.den .credits,html body.den [class*=cred]{font:400 11px 'Barlow',sans-serif!important;color:rgba(239,230,216,.35)!important}
html body.den #toast{text-transform:none!important;letter-spacing:0!important;background:var(--d-bg3)!important;color:var(--d-ink)!important;border:1px solid var(--d-line)!important;border-radius:12px!important;font:500 14px 'Barlow',sans-serif!important;bottom:calc(84px + env(safe-area-inset-bottom))!important}
html body.den #l7-burst{display:none!important}
/* the walk and the dragon move even with Reduce Motion on */
@media (prefers-reduced-motion:reduce){html body.den .l9-trav.walk{animation:l9walk .8s steps(7,jump-none) infinite!important}html body.den .l9-fire{animation:l9walk .45s steps(2,jump-none) infinite!important}html body.den .l9-ground{animation:l9g .9s linear infinite!important}html body.den .l9-stage:not(.camp) .l9-ly{animation-play-state:running!important}html body.den header.hero .sky .dragon.pix{animation:fly 26s linear infinite!important}}
`; document.head.appendChild(css);

  (function () { const _t = toast; toast = function (msg) { try { let m = String(msg || ''); if (/·/.test(m)) { const parts = m.split('·').map(x => x.trim()).filter(x => x && !/\bgil\b|\bxp\b|wind|rain|storm|fog|heat|clear skies/i.test(x)); m = parts.join(' · '); } if (!m || /^(lifestyle|books|steel|tv & games|journey|inventory|home) updated\b/i.test(m)) return; return _t.call(this, m); } catch (e) { return _t.apply(this, arguments); } }; })();
  // boot
  const boot = () => { try { if (applyGameArt() && typeof currentLib !== 'undefined' && currentLib === 'screen') renderGamesLib(); } catch (e) {} try { tone(); } catch (e) { console.warn('l11 tone', e); } try { L11.nav(); L11.head(); } catch (e) {} };
  if (document.readyState === 'complete') boot(); else window.addEventListener('load', boot);
  setTimeout(boot, 1200);
  setInterval(() => { try { L11.head(); } catch (e) {} }, 60000);
  setInterval(() => { try { if (applyGameArt() && currentLib === 'screen') renderGamesLib(); } catch (e) {} }, 15000);
})();

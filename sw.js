// Book Den service worker — the app opens from cache at once; a fresh copy is fetched behind it and used on the next open.
// The save goes to the store live and is never cached here. Covers are cached by URL (capped).
const C = 'den-202610260132';
const COVERS = 'den-covers', MAXC = 1500;
self.addEventListener('install', e => { e.waitUntil(caches.open(C).then(c => c.addAll(['./', './index.html', './manifest.json', './icon-192.png', './icon-512.png'])).then(() => self.skipWaiting())); });
self.addEventListener('activate', e => { e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== C && k !== COVERS).map(k => caches.delete(k))))
  .then(() => caches.open(COVERS)).then(c => c.keys().then(ks => Promise.all(ks.slice(0, Math.max(0, ks.length - MAXC)).map(k => c.delete(k))))).then(() => self.clients.claim())); });
self.addEventListener('fetch', e => {
  const u = new URL(e.request.url); if (e.request.method !== 'GET') return;
  if (/(^|\.)mzstatic\.com$|^covers\.openlibrary\.org$|^cdn\.myanimelist\.net$|^static\.tvmaze\.com$|^upload\.wikimedia\.org$|^books\.google\.com$/.test(u.hostname)) { e.respondWith(caches.open(COVERS).then(c => c.match(u.href).then(hit => hit || fetch(u.href, { mode: 'cors' }).then(r => { if (r.ok && /^image\//.test(r.headers.get('content-type') || '')) c.put(u.href, r.clone()); return r; }).catch(() => fetch(e.request))))); return; }
  if (u.origin !== location.origin) return;
  if (e.request.mode === 'navigate' || u.pathname.endsWith('/index.html') || u.pathname.endsWith('/')) {
    e.respondWith(caches.open(C).then(c => c.match('./index.html').then(hit => {
      const net = fetch(e.request).then(r => { if (r.ok) c.put('./index.html', r.clone()); return r; });
      if (hit) { e.waitUntil(net.catch(() => {})); return hit; }
      return net.catch(() => hit);
    })));
    return;
  }
  e.respondWith(caches.match(e.request).then(hit => hit || fetch(e.request).then(r => { if (r.ok) { const cp = r.clone(); caches.open(C).then(c => c.put(e.request, cp)); } return r; })));
});

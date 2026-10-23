// Book Den service worker — offline shell. The save goes to the store live and is never cached here.
const C = 'den-202610230118';
self.addEventListener('install', e => { e.waitUntil(caches.open(C).then(c => c.addAll(['./', './index.html', './manifest.json', './icon-192.png', './icon-512.png'])).then(() => self.skipWaiting())); });
self.addEventListener('activate', e => { e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== C && k !== 'den-covers').map(k => caches.delete(k)))).then(() => self.clients.claim())); });
self.addEventListener('fetch', e => {
  const u = new URL(e.request.url); if (e.request.method !== 'GET') return;
  if (/(^|\.)mzstatic\.com$|^covers\.openlibrary\.org$/.test(u.hostname)) { e.respondWith(caches.open('den-covers').then(c => c.match(u.href).then(hit => hit || fetch(u.href, { mode: 'cors' }).then(r => { if (r.ok) c.put(u.href, r.clone()); return r; }).catch(() => fetch(e.request))))); return; }
  if (u.origin !== location.origin) return;
  if (e.request.mode === 'navigate' || u.pathname.endsWith('/index.html') || u.pathname.endsWith('/')) {
    e.respondWith(fetch(e.request).then(r => { const cp = r.clone(); caches.open(C).then(c => c.put('./index.html', cp)); return r; }).catch(() => caches.match('./index.html')));
    return;
  }
  e.respondWith(caches.match(e.request).then(hit => hit || fetch(e.request).then(r => { const cp = r.clone(); caches.open(C).then(c => c.put(e.request, cp)); return r; })));
});

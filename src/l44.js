// ===== L44: New builds reach the phone. A home-screen app is seldom reloaded, so a new build could sit behind the cached one for days.
// Each time he comes back to the app it asks for a new build. Once the new build has taken over, the page reloads at a quiet moment
// (nothing being typed, no sheet or panel open) or as soon as the app goes to the background. Everything he logs is already saved
// on the phone and in the store, so nothing is lost by the reload.
(function () {
  const L44 = window.L44 = {};
  const PANELS = '#sheet.open, #l29.on, #l34.on, #l35.on, #l36.on, #l37.on';
  L44.quiet = function () { try { const a = document.activeElement; if (a && /^(INPUT|TEXTAREA|SELECT)$/.test(a.tagName)) return false; if (document.querySelector(PANELS)) return false; } catch (e) {} return true; };
  L44.reload = () => { try { location.reload(); } catch (e) {} };
  let pending = false, last = 0;
  // never more than one reload in half a minute, so a bad build cannot loop
  L44.go = function () { try { const t = +sessionStorage.getItem('den:upd') || 0; if (Date.now() - t < 30000) return false; sessionStorage.setItem('den:upd', String(Date.now())); } catch (e) {} L44.reload(); return true; };
  L44.takeover = function () { pending = true; if (document.visibilityState === 'hidden' || L44.quiet()) return L44.go(); return false; };
  L44.pending = () => pending;
  L44.check = function () { if (Date.now() - last < 60000) return; last = Date.now(); try { navigator.serviceWorker.getRegistration().then(r => { if (r) r.update().catch(() => {}); }).catch(() => {}); } catch (e) {} };
  if (!('serviceWorker' in navigator) || location.protocol !== 'https:') return;
  const had = !!navigator.serviceWorker.controller;   // the very first install takes over too; that one is not a new build
  navigator.serviceWorker.addEventListener('controllerchange', () => { if (had) L44.takeover(); });
  document.addEventListener('visibilitychange', () => { if (document.visibilityState === 'visible') L44.check(); else if (pending) L44.go(); });
  window.addEventListener('pageshow', e => { if (e.persisted) L44.check(); });
  setInterval(() => { if (document.visibilityState !== 'visible') return; L44.check(); if (pending && L44.quiet()) L44.go(); }, 10 * 60 * 1000);
})();

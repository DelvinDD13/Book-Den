// ===== L25: badge alerts — a banner that stays long enough to see, and an iPhone notification when he's allowed them.
(function () {
  const L25 = window.L25 = {};
  const Q = []; let busy = false;
  const label = b => b.name + (b.single ? '' : ' · ' + (b.tierName || ''));
  function show() { if (busy || !Q.length) return; busy = true; const L = Q.splice(0, 3);
    let el = document.getElementById('l25'); if (!el) { el = document.createElement('button'); el.id = 'l25'; el.type = 'button'; document.body.appendChild(el); }
    const b = L[0]; el.dataset.cat = b.cat; el.dataset.id = b.id;
    let med = ''; try { med = L4.medal(b, 52); } catch (e) {}
    el.innerHTML = '<span class="l25-m">' + med + '</span><span class="l25-t"><i>' + (L.length > 1 ? L.length + ' badges earned' : 'Badge earned') + '</i><b>' + esc(label(b)) + '</b>' + (L.length > 1 ? '<em>' + esc(L.slice(1).map(label).join(' · ')) + '</em>' : (b.desc ? '<em>' + esc(b.desc) + '</em>' : '')) + '</span>';
    el.classList.remove('out'); void el.offsetWidth; el.classList.add('in'); try { document.dispatchEvent(new CustomEvent('l25show', { detail: L })); } catch (e) {}
    clearTimeout(L25.t); L25.t = setTimeout(() => { el.classList.remove('in'); el.classList.add('out'); setTimeout(() => { busy = false; show(); }, 420); }, 6500); }
  L25.announce = function (news) { if (!news || !news.length) return; news.forEach(b => Q.push(b)); show(); L25.notify(news); };
  // an iPhone notification (home-screen app, permission given): shown by the service worker so it can appear as a banner
  L25.notify = function (news) { try { if (!('Notification' in window) || Notification.permission !== 'granted' || !navigator.serviceWorker) return;
      navigator.serviceWorker.ready.then(reg => { news.slice(0, 3).forEach(b => reg.showNotification('Badge earned: ' + label(b), { body: b.desc || '', icon: 'icon-192.png', badge: 'icon-192.png', tag: 'den-badge-' + b.id, data: { url: './#badges:' + b.cat + ':' + b.id } }).catch(() => {})); }).catch(() => {}); } catch (e) {} };
  L25.can = () => { try { return 'Notification' in window && !!navigator.serviceWorker; } catch (e) { return false; } };
  L25.ask = function () { try { Notification.requestPermission().then(p => { try { toast(p === 'granted' ? 'Badge alerts are on' : 'Badge alerts stay off — Settings › Notifications can turn them on'); } catch (e) {} if (p === 'granted') L25.notify([{ name: 'Alerts on', single: 1, desc: 'This is what a new badge looks like.', id: 'test', cat: 'books' }]); try { if (String(sheetTitle).startsWith('badges')) renderSheet(); } catch (e) {} }); } catch (e) {} };
  // the existing announcer keeps its save logic; the short toast is replaced by the banner
  (function () { if (!window.L4 || !L4.sync) return; const _s = L4.sync; L4.sync = function (quiet) { let news; const st0 = (() => { try { return L4.state(); } catch (e) { return {}; } })(); const fresh = !st0.init;
      const _t = window.toast; let swallowed = false; if (!quiet && !fresh) window.toast = function (m) { if (/^(Badge earned|Gym beaten)/.test(String(m))) { swallowed = true; return; } return _t.apply(this, arguments); };
      try { news = _s.apply(this, arguments); } finally { window.toast = _t; }
      try { if (!quiet && !fresh && news && news.length) L25.announce(news); } catch (e) {} return news; }; })();
  // badges earned while the app sat in the background (a store pull, a date rolling over) are checked when it comes back
  document.addEventListener('visibilitychange', () => { if (document.visibilityState === 'visible') setTimeout(() => { try { L4.clear(); L4.sync(); } catch (e) {} }, 1500); });
  document.addEventListener('click', e => { const el = e.target.closest && e.target.closest('#l25'); if (el) { e.preventDefault(); clearTimeout(L25.t); el.classList.remove('in'); el.classList.add('out'); busy = false; try { openSheet('badges:' + el.dataset.cat + ':' + el.dataset.id); } catch (x) {} setTimeout(show, 400); return; }
    const a = e.target.closest && e.target.closest('[data-l25ask]'); if (a) { e.preventDefault(); e.stopPropagation(); L25.ask(); } }, true);
  // a tap from the notification lands on the badge
  try { const m = String(location.hash).match(/^#badges:([a-z]+):([\w-]+)/); if (m) setTimeout(() => { try { openSheet('badges:' + m[1] + ':' + m[2]); history.replaceState(null, '', location.pathname); } catch (e) {} }, 1800); } catch (e) {}
  // the switch, on top of the badges sheet
  (function () { if (!window.L4 || !L4.sheetHTML) return; const _sh = L4.sheetHTML; L4.sheetHTML = function () { const h = _sh.apply(this, arguments); try { if (!L25.can()) return h; const p = Notification.permission;
      const row = '<div class="l25-row">' + (p === 'granted' ? '<span>Badge alerts are on for this iPhone</span>' : p === 'denied' ? '<span>Badge alerts are blocked — turn them on in Settings › Notifications › Book Den</span>' : '<span>Get an iPhone alert when you earn a badge</span><button data-l25ask="1">Turn on</button>') + '</div>';
      const k = h.indexOf('<div class="l4-sec">'); return k > 0 ? h.slice(0, k) + row + h.slice(k) : h; } catch (e) { return h; } }; })();
  const css = '#l25{position:fixed;left:12px;right:12px;top:calc(env(safe-area-inset-top) + 10px);z-index:9999;display:flex;align-items:center;gap:12px;padding:10px 14px 10px 10px;background:var(--d-bg2,#17171b)!important;border:1px solid var(--d-acc,#ff6a2a)!important;border-radius:0!important;color:var(--d-ink,#f3efe6);text-align:left;transform:translateY(-140%);opacity:0;pointer-events:none}#l25.in{animation:l25in .45s cubic-bezier(.2,.9,.25,1.1) forwards;pointer-events:auto}#l25.out{animation:l25out .4s ease-in forwards}#l25 .l25-m{flex:0 0 52px;width:52px;height:52px;display:block}#l25 .l25-m svg{width:52px;height:52px;display:block}#l25 .l25-t{display:flex;flex-direction:column;gap:2px;min-width:0}#l25 i{font:500 10px var(--b-mono,"IBM Plex Mono"),monospace;letter-spacing:.08em;text-transform:uppercase;color:var(--d-acc,#ff6a2a);font-style:normal}#l25 b{font:400 22px/1 var(--b-disp,"Bebas Neue"),sans-serif;letter-spacing:.03em}#l25 em{font:400 12px/1.3 Barlow,sans-serif;color:var(--d-mute,#8e8e95);font-style:normal;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden}.l25-row{display:flex;align-items:center;justify-content:space-between;gap:10px;margin:0 0 14px;padding:10px 12px;border:1px solid var(--d-line,#333)!important;background:var(--d-bg2,#17171b)!important;font:400 13px Barlow,sans-serif;color:var(--d-mute,#8e8e95)}.l25-row button{flex:0 0 auto;padding:7px 12px;border:1px solid var(--d-acc,#ff6a2a)!important;background:none!important;color:var(--d-acc,#ff6a2a);font:400 15px var(--b-disp,"Bebas Neue"),sans-serif;letter-spacing:.06em;border-radius:0!important}';
  try { const st = document.createElement('style'); st.textContent = css.replace(/(^|\})\s*([^{}]+)\{/g, (a, p, sel) => p + sel.split(',').map(x => 'html body.den ' + x.trim()).join(',') + '{'); document.head.appendChild(st);
    const kf = document.createElement('style'); kf.textContent = '@keyframes l25in{0%{transform:translateY(-140%);opacity:0}100%{transform:translateY(0);opacity:1}}@keyframes l25out{0%{transform:translateY(0);opacity:1}100%{transform:translateY(-140%);opacity:0}}'; document.head.appendChild(kf); } catch (e) {}
})();

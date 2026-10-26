#!/usr/bin/env python3
"""Covers for Book Den, looked up off the phone and verified.
Books: Apple Books (ebook) -> Apple audiobooks -> Google Books -> Open Library.
Shows: anime -> MyAnimeList (Jikan); movies -> iTunes Store; live action and cartoons -> TVmaze; then Wikipedia.
Games: Wikipedia lead image -> App Store.
Every candidate is downloaded and measured; anything under MIN_W pixels wide, or not an image, is rejected.
Rows go to the store as cv:<title> / cv:show:<title> / cv:game:<title> = {url, src, at, w, h}; a row is only
replaced when the new source ranks higher than what the store already has, or the stored image fails the check."""
import json, os, re, sys, time, io, unicodedata, urllib.request, urllib.parse
from PIL import Image

STORE = os.environ['DEN_STORE_URL']; KEY = os.environ['DEN_KEY']
MIN_W = 320
UA = {'User-Agent': 'BookDen/1.0 (+https://delvindd13.github.io/Book-Den/)'}
RANK = {'apple-books': 5, 'itunes-movies': 5, 'jikan': 4, 'tvmaze': 4, 'apple-audiobooks': 4, 'google-books': 3, 'wikipedia': 2, 'app-store': 2, 'openlibrary': 1}
log = lambda *a: print(*a, flush=True)
ERR = {}
def err(src, e):
    ERR.setdefault(src, []).append(str(e)[:120]); log('  %s err %s' % (src, str(e)[:120]))

def get(url, timeout=25, binary=False):
    r = urllib.request.urlopen(urllib.request.Request(url, headers=UA), timeout=timeout)
    data = r.read()
    return data if binary else json.loads(data.decode('utf-8', 'ignore'))

last = {}
def pace(host, secs):
    t = last.get(host, 0); w = t + secs - time.time()
    if w > 0: time.sleep(w)
    last[host] = time.time()

def norm(s):
    s = unicodedata.normalize('NFKD', str(s or '')).encode('ascii', 'ignore').decode().lower()
    s = re.sub(r'\([^)]*\)|\[[^\]]*\]', ' ', s).replace('&', ' and ')
    return re.sub(r'\s+', ' ', re.sub(r'[^a-z0-9 ]', ' ', s)).strip()
def main_title(t): return re.sub(r'\([^)]*\)', '', str(t).split(':')[0]).strip()
def starts(name, q, n=3):
    a, b = norm(name), norm(q)
    if not a or not b: return False
    head = ' '.join(b.split()[:n]); return a.startswith(head) or b.startswith(a)

def measure(url):
    """download and measure; returns (w, h) or None"""
    try:
        data = get(url, binary=True, timeout=30)
        im = Image.open(io.BytesIO(data)); im.load(); return im.size
    except Exception as e:
        return None

def ok_image(url):
    s = measure(url); return s if s and s[0] >= MIN_W else None

# ---------------- books ----------------
def apple(term, media, entity, name_key, title, author):
    pace('apple', 3.1)
    try: d = get('https://itunes.apple.com/search?country=us&limit=10&media=%s&entity=%s&term=%s' % (media, entity, urllib.parse.quote(term)))
    except Exception as e: err('apple', e); return None
    want = norm(main_title(title)); a = norm(author); last_n = a.split()[-1] if a else ''
    ok = []
    for r in d.get('results', []):
        n = norm(r.get(name_key) or r.get('trackName') or r.get('collectionName'))
        if not n: continue
        if not (n.startswith(want) or (want.startswith(n) and len(n) >= 8)): continue
        if last_n and len(last_n) > 2 and last_n not in norm(r.get('artistName')): continue
        if r.get('artworkUrl100'): ok.append((len(n), r))
    if not ok: return None
    r = sorted(ok, key=lambda x: x[0])[0][1]
    return re.sub(r'/[0-9]+x[0-9]+[a-z]*(-[0-9]+)?\.(jpg|png|webp)$', '/1200x1800bb.jpg' if media == 'ebook' else '/1200x1200bb.jpg', r['artworkUrl100'])

def google_books(title, author):
    pace('google', 1.0)
    q = 'intitle:' + main_title(title) + ((' inauthor:' + author.split(',')[0]) if author else '')
    try: d = get('https://www.googleapis.com/books/v1/volumes?maxResults=5&printType=books&q=' + urllib.parse.quote(q))
    except Exception as e: err('google', e); return None
    for it in d.get('items', []):
        vi = it.get('volumeInfo', {}); links = vi.get('imageLinks') or {}
        if not starts(vi.get('title'), main_title(title)): continue
        u = links.get('extraLarge') or links.get('large') or links.get('medium') or links.get('thumbnail') or links.get('smallThumbnail')
        if not u: continue
        u = u.replace('http://', 'https://'); u = re.sub(r'&?zoom=\d', '', u) + '&fife=w800'
        return u
    return None

def open_library(title, author):
    pace('ol', 0.6)
    try: d = get('https://openlibrary.org/search.json?fields=title,author_name,cover_i,edition_count&limit=8&title=%s%s' % (urllib.parse.quote(main_title(title)), ('&author=' + urllib.parse.quote(author.split(',')[0])) if author else ''))
    except Exception as e: err('ol', e); return None
    want = norm(main_title(title))
    docs = sorted([x for x in d.get('docs', []) if x.get('cover_i') and norm(x.get('title')).startswith(want)], key=lambda x: -(x.get('edition_count') or 0))
    return ('https://covers.openlibrary.org/b/id/%s-L.jpg' % docs[0]['cover_i']) if docs else None

def book(title, author):
    s = (author.split()[-1] if author else '')
    term = (main_title(title) + ' ' + s).strip()
    for src, fn in [('apple-books', lambda: apple(term, 'ebook', 'ebook', 'trackName', title, author)),
                    ('apple-audiobooks', lambda: apple(term, 'audiobook', 'audiobook', 'collectionName', title, author)),
                    ('google-books', lambda: google_books(title, author)),
                    ('openlibrary', lambda: open_library(title, author))]:
        u = fn()
        if u:
            wh = ok_image(u)
            if wh: return {'url': u, 'src': src, 'w': wh[0], 'h': wh[1]}
    return None

# ---------------- shows ----------------
def clean_show(t):
    t = re.sub(r'\s*\([^)]*\)\s*', ' ', t); t = re.sub(r' – .*$', '', t).split(' / ')[0].split(' + ')[0]
    return re.sub(r'\s+\d+[–-]\d+$', '', t).replace('’', "'").strip()

def wiki(q, hint):
    pace('wiki', 0.5)
    try: d = get('https://en.wikipedia.org/w/api.php?action=query&format=json&generator=search&gsrlimit=5&gsrsearch=%s&prop=pageimages&piprop=original|thumbnail&pithumbsize=900&pilicense=any' % urllib.parse.quote(q + ' ' + hint))
    except Exception as e: err('wiki', e); return None
    pages = sorted((d.get('query') or {}).get('pages', {}).values(), key=lambda p: p.get('index', 0))
    for p in pages:
        if not starts(p.get('title'), q): continue
        src = ((p.get('thumbnail') or p.get('original') or {}).get('source'))
        if src and not src.lower().endswith('.svg'): return src
    return None

def show(t, kind):
    q = clean_show(t)
    if not q: return None
    cands = []
    if kind == 'anime':
        pace('jikan', 1.1)
        try:
            d = get('https://api.jikan.moe/v4/anime?limit=5&q=' + urllib.parse.quote(q))
            for a in d.get('data', []):
                names = [a.get('title'), a.get('title_english')] + [x.get('title') for x in a.get('titles', [])]
                if any(starts(n, q) for n in names if n):
                    im = (a.get('images') or {}).get('jpg', {}); u = im.get('large_image_url') or im.get('image_url')
                    if u: cands.append(('jikan', u)); break
        except Exception as e: err('jikan', e)
    if kind == 'movie':
        pace('apple', 3.1)
        try:
            d = get('https://itunes.apple.com/search?country=us&limit=8&media=movie&entity=movie&term=' + urllib.parse.quote(q))
            rs = sorted([m for m in d.get('results', []) if m.get('artworkUrl100') and starts(m.get('trackName'), q)], key=lambda m: len(norm(m.get('trackName'))))
            if rs: cands.append(('itunes-movies', re.sub(r'/[0-9]+x[0-9]+[a-z]*(-[0-9]+)?\.(jpg|png|webp)$', '/600x900bb.jpg', rs[0]['artworkUrl100'])))
        except Exception as e: err('itunes-movies', e)
    if kind in ('tv', 'cartoon', 'anime'):
        pace('tvmaze', 0.6)
        try:
            d = get('https://api.tvmaze.com/singlesearch/shows?q=' + urllib.parse.quote(q))
            if d and d.get('image') and starts(d.get('name'), q): cands.append(('tvmaze', d['image'].get('original') or d['image'].get('medium')))
        except Exception as e: err('tvmaze', e)
    u = wiki(q, 'film' if kind == 'movie' else 'anime' if kind == 'anime' else 'TV series')
    if u: cands.append(('wikipedia', u))
    if not u: u = wiki(q, '');
    if u and ('wikipedia', u) not in cands: cands.append(('wikipedia', u))
    if kind == 'movie': cands.sort(key=lambda c: 0 if c[0] == 'wikipedia' else 1)
    for src, u in cands:
        wh = ok_image(u)
        if wh: return {'url': u, 'src': src, 'w': wh[0], 'h': wh[1]}
    return None

def game(t):
    q = re.sub(r'\s*\([^)]*\)\s*$', '', t).replace('’', "'")
    cands = []
    u = wiki(q, 'video game')
    if u: cands.append(('wikipedia', u))
    pace('apple', 3.1)
    try:
        d = get('https://itunes.apple.com/search?country=us&limit=5&media=software&term=' + urllib.parse.quote(q))
        rs = [x for x in d.get('results', []) if starts(x.get('trackName'), q, 2)]
        if rs: cands.append(('app-store', re.sub(r'/[0-9]+x[0-9]+[a-z]*(-[0-9]+)?\.(jpg|png|webp)$', '/1024x1024bb.jpg', rs[0].get('artworkUrl512') or rs[0]['artworkUrl100'])))
    except Exception as e: pass
    for src, u in cands:
        wh = ok_image(u)
        if wh: return {'url': u, 'src': src, 'w': wh[0], 'h': wh[1]}
    return None

# ---------------- store ----------------
def store_get():
    d = get(STORE + '?key=' + urllib.parse.quote(KEY), timeout=90)
    return d.get('v') or {}
def store_post(v):
    body = json.dumps({'key': KEY, 'v': v}).encode()
    r = urllib.request.urlopen(urllib.request.Request(STORE, data=body, headers={'Content-Type': 'text/plain'}), timeout=120)
    return json.loads(r.read().decode())

def main():
    T = json.load(open(os.path.join(os.path.dirname(__file__), 'titles.json')))
    only = sys.argv[1] if len(sys.argv) > 1 else 'all'
    cur = store_get(); log('store rows', len(cur))
    def have(k):
        e = cur.get(k)
        if not e: return None
        try: return json.loads(e['j'])
        except Exception: return None
    jobs = []
    if only in ('all', 'books'): jobs += [('cv:' + t, lambda t=t, a=a: book(t, a)) for t, a in T['books']]
    if only in ('all', 'shows'): jobs += [('cv:show:' + t, lambda t=t, k=k: show(t, k)) for t, k in T['shows']]
    if only in ('all', 'games'): jobs += [('cv:game:' + t, lambda t=t: game(t)) for t in T['games']]
    out = {}; n_new = n_keep = n_miss = n_fix = 0; t0 = time.time()
    def flush():
        if not out: return
        r = store_post(out); log('  posted', len(out), 'wrote', r.get('wrote')); out.clear()
    for i, (k, fn) in enumerate(jobs):
        old = have(k) or {}
        old_rank = RANK.get(old.get('src'), 0) if old.get('url') else 0
        # a stored image that no longer loads or is small gets replaced whatever its source
        if old.get('url') and old_rank >= 4 and old.get('w', 0) >= MIN_W:
            n_keep += 1; continue
        if old.get('url') and old_rank >= 4 and not old.get('w'):
            wh = ok_image(old['url'])
            if wh: out[k] = {'u': int(time.time() * 1000), 'j': json.dumps(dict(old, w=wh[0], h=wh[1]))}; n_keep += 1; continue
        try: r = fn()
        except Exception as e: log('  err', k, e); r = None
        if r and RANK.get(r['src'], 0) > old_rank:
            out[k] = {'u': int(time.time() * 1000), 'j': json.dumps({'url': r['url'], 'src': r['src'], 'at': int(time.time() * 1000), 'w': r['w'], 'h': r['h']})}
            n_fix += 1 if old.get('url') else 0; n_new += 0 if old.get('url') else 1
            log('%4d %-60s %s %dx%d' % (i, k[:60], r['src'], r['w'], r['h']))
        elif not r and not old.get('url'):
            out[k] = {'u': int(time.time() * 1000), 'j': json.dumps({'miss': 1, 'at': int(time.time() * 1000), 'job': 1})}; n_miss += 1
            log('%4d %-60s miss' % (i, k[:60]))
        else: n_keep += 1
        if len(out) >= 60: flush()
        if time.time() - t0 > 5.3 * 3600: log('time cap'); break
    flush()
    diag = {k: {'n': len(v), 'first': v[:3]} for k, v in ERR.items()}
    store_post({'cvjob': {'u': int(time.time() * 1000), 'j': json.dumps({'at': int(time.time() * 1000), 'new': n_new, 'fixed': n_fix, 'kept': n_keep, 'miss': n_miss, 'jobs': len(jobs), 'only': only, 'errs': diag})[:45000]}})
    log('done: new', n_new, 'fixed', n_fix, 'kept', n_keep, 'miss', n_miss)

if __name__ == '__main__': main()

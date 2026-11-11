"""Accuracy audit helper for Book Den. Runs on GitHub (the build sandbox cannot reach these hosts).
Gathers, for every show in sync/titles.json: IMDb's own dataset rows (type, years, genres, rating, votes, seasons, episodes)
and TVmaze's record; makes contact sheets of the posters now in the store so they can be checked by eye; lists Wikipedia
page-image candidates for each game; and collects public-domain Fleischer Superman stills from Wikimedia Commons with
their licence text. Everything lands in audit/ for review. Nothing in the store is changed by this script."""
import os, sys, json, re, gzip, time, urllib.request, urllib.parse, io, traceback
from PIL import Image, ImageDraw, ImageFont

HERE = os.path.dirname(os.path.abspath(__file__)); OUT = os.path.join(HERE, '..', 'audit'); os.makedirs(OUT, exist_ok=True)
STORE = os.environ.get('DEN_STORE_URL', ''); KEY = os.environ.get('DEN_KEY', '')
UA = {'User-Agent': 'BookDenAudit/1.1 (personal library app; https://github.com/DelvinDD13/Book-Den; contact via repository issues)'}
def log(*a): print(*a, flush=True)
def raw(url, timeout=60):
    return urllib.request.urlopen(urllib.request.Request(url, headers=UA), timeout=timeout).read()
def get(url, timeout=60): return json.loads(raw(url, timeout).decode())
def norm(s):
    s = str(s).lower().replace('’', "'").replace('&', ' and '); s = re.sub(r"[^a-z0-9' ]+", ' ', s); return re.sub(r'\s+', ' ', s).strip()
def clean_show(t):
    t = re.sub(r'\s*\([^)]*\)\s*', ' ', t); t = re.sub(r' – .*$', '', t).split(' / ')[0].split(' + ')[0]
    return re.sub(r'\s+\d+[–-]\d+$', '', t).replace('’', "'").strip()
def save(name, obj): json.dump(obj, open(os.path.join(OUT, name), 'w'), ensure_ascii=False, indent=1)

T = json.load(open(os.path.join(HERE, 'titles.json'))); SHOWS = T['shows']; GAMES = T['games']
want = {}
for t, k in SHOWS: want.setdefault(norm(clean_show(t)), []).append(t)
pre = {}
for w in want:
    ws = w.split(' ')
    if len(w) >= 6: pre.setdefault(' '.join(ws[:2]), []).append(w)

def imdb():
    def fetch(name):
        p = '/tmp/' + name
        if not os.path.exists(p): urllib.request.urlretrieve('https://datasets.imdbws.com/' + name, p)
        return gzip.open(p, 'rt', encoding='utf-8', newline='')
    TYPES = {'tvSeries', 'tvMiniSeries', 'movie', 'tvMovie', 'video', 'tvSpecial'}
    cands = {}; by = {}
    with fetch('title.basics.tsv.gz') as f:
        f.readline()
        for line in f:
            p = line.rstrip('\n').split('\t')
            if len(p) < 9 or p[1] not in TYPES: continue
            for nm in {norm(p[2]), norm(p[3])}:
                hit = None
                if nm in want: hit = (nm, 'exact')
                else:
                    for w in pre.get(' '.join(nm.split(' ')[:2]), ()):
                        if nm.startswith(w + ' '): hit = (w, 'prefix'); break
                if hit:
                    cands[p[0]] = {'id': p[0], 'type': p[1], 'title': p[2], 'orig': p[3], 'start': p[5], 'end': p[6], 'mins': p[7], 'genres': p[8], 'match': hit[1]}
                    by.setdefault(hit[0], set()).add(p[0])
    log('imdb candidates', len(cands))
    with fetch('title.ratings.tsv.gz') as f:
        f.readline()
        for line in f:
            p = line.rstrip('\n').split('\t')
            if p[0] in cands: cands[p[0]]['rating'] = float(p[1]); cands[p[0]]['votes'] = int(p[2])
    eps = {}; seas = {}
    with fetch('title.episode.tsv.gz') as f:
        f.readline()
        for line in f:
            p = line.rstrip('\n').split('\t')
            if p[1] in cands:
                eps[p[1]] = eps.get(p[1], 0) + 1
                if p[2].isdigit(): seas.setdefault(p[1], set()).add(int(p[2]))
    out = {}
    for w, ids in by.items():
        L = sorted((cands[i] for i in ids), key=lambda c: (-(c.get('votes') or 0)))
        L = [c for c in L if c.get('votes')][:6]
        for c in L:
            if c['id'] in eps: c['eps'] = eps[c['id']]; c['seasons'] = len(seas.get(c['id'], ()))
        for t in want[w]: out[t] = L
    save('imdb.json', out); log('imdb titles matched', len(out), 'of', len(SHOWS))

def tvmaze():
    out = {}
    for t, k in SHOWS:
        if k == 'movie': continue
        q = clean_show(t)
        try:
            d = get('https://api.tvmaze.com/singlesearch/shows?embed=seasons&q=' + urllib.parse.quote(q), 30)
            S = [s for s in (d.get('_embedded') or {}).get('seasons', []) if s.get('premiereDate')]
            out[t] = {'name': d.get('name'), 'type': d.get('type'), 'genres': d.get('genres'), 'premiered': d.get('premiered'), 'ended': d.get('ended'), 'status': d.get('status'), 'network': ((d.get('network') or d.get('webChannel') or {}).get('name')), 'seasons': len(S), 'eps': sum((s.get('episodeOrder') or 0) for s in S), 'url': d.get('url')}
        except Exception as e: out[t] = {'err': str(e)[:80]}
        time.sleep(0.55)
    save('tvmaze.json', out); log('tvmaze', len(out))

def font(n):
    try: return ImageFont.load_default(size=n)
    except Exception: return ImageFont.load_default()
def thumb(url, w, h):
    try:
        im = Image.open(io.BytesIO(raw(url.split('?')[0] if 'wikimedia' in url else url, 25))).convert('RGB')
        r = max(w / im.width, h / im.height); im = im.resize((max(1, int(im.width * r)), max(1, int(im.height * r))))
        x = (im.width - w) // 2; return im.crop((x, 0, x + w, h)), None
    except Exception as e: return None, str(e)[:60]
def sheet(items, name, cols=6, w=150, h=225, fit=False):
    rows = (len(items) + cols - 1) // cols; lab = 34; img = Image.new('RGB', (cols * (w + 8) + 8, rows * (h + lab + 8) + 8), (18, 18, 20)); d = ImageDraw.Draw(img); f = font(11)
    for i, (label, url) in enumerate(items):
        x = 8 + (i % cols) * (w + 8); y = 8 + (i // cols) * (h + lab + 8)
        if url:
            if fit:
                try:
                    im = Image.open(io.BytesIO(raw(url.split('?')[0] if 'wikimedia' in url else url, 25))).convert('RGB'); im.thumbnail((w, h)); img.paste(im, (x + (w - im.width) // 2, y + (h - im.height) // 2))
                except Exception as e: d.text((x + 4, y + 4), 'ERR ' + str(e)[:40], fill=(255, 90, 90), font=f)
            else:
                t, e = thumb(url, w, h)
                if t: img.paste(t, (x, y))
                else: d.text((x + 4, y + 4), 'ERR ' + (e or ''), fill=(255, 90, 90), font=f)
        else: d.rectangle([x, y, x + w, y + h], outline=(120, 60, 60)); d.text((x + 4, y + 4), 'NO IMAGE', fill=(255, 90, 90), font=f)
        d.text((x, y + h + 3), label[:24], fill=(240, 240, 240), font=f); d.text((x, y + h + 17), label[24:48], fill=(240, 240, 240), font=f)
    img.save(os.path.join(OUT, name), quality=80); log('sheet', name, len(items))

def posters():
    cur = (get(STORE + '?key=' + urllib.parse.quote(KEY), 120).get('v') or {})
    def url(k):
        try: return json.loads(cur[k]['j']).get('url') or ''
        except Exception: return ''
    items = [(('%s [%s]' % (t, k)), url('cv:show:' + t)) for t, k in SHOWS]
    save('poster_urls.json', {'shows': {t: url('cv:show:' + t) for t, k in SHOWS}, 'games': {t: url('cv:game:' + t) for t in GAMES}})
    for n in range(0, len(items), 36): sheet(items[n:n + 36], 'shows_%02d.jpg' % (n // 36 + 1))
    # games: what is stored now, then what Wikipedia offers for the exact title and for a search
    G = []; cand = {}
    for t in GAMES:
        q = re.sub(r'\s*\([^)]*\)\s*$', '', t).replace('’', "'"); G.append(('NOW: ' + t, url('cv:game:' + t))); cand[t] = []
        try:
            d = get('https://en.wikipedia.org/w/api.php?action=query&format=json&redirects=1&titles=%s&prop=pageimages&piprop=original&pilicense=any' % urllib.parse.quote(q), 30)
            for p in (d.get('query') or {}).get('pages', {}).values():
                u = (p.get('original') or {}).get('source')
                if u: cand[t].append([p.get('title'), u.split('?')[0], 'exact'])
        except Exception as e: log('wiki exact', t, e)
        time.sleep(0.4)
        try:
            d = get('https://en.wikipedia.org/w/api.php?action=query&format=json&generator=search&gsrlimit=5&gsrsearch=%s&prop=pageimages&piprop=original&pilicense=any' % urllib.parse.quote(q + ' video game'), 30)
            for p in sorted((d.get('query') or {}).get('pages', {}).values(), key=lambda p: p.get('index', 0)):
                u = (p.get('original') or {}).get('source')
                if u and not any(c[1] == u.split('?')[0] for c in cand[t]): cand[t].append([p.get('title'), u.split('?')[0], 'search'])
        except Exception as e: log('wiki search', t, e)
        time.sleep(0.4)
        for c in cand[t][:5]: G.append(('  ' + c[2] + ': ' + c[0], c[1]))
        while len(G) % 6: G.append(('', ''))
    save('game_candidates.json', cand); sheet([g for g in G if g[0] or True], 'games.jpg', cols=6, w=170, h=220, fit=True)

def superman():
    """Stills from the 1941-43 Fleischer / Famous Studios Superman cartoons on Wikimedia Commons, with the licence text Commons records."""
    d = os.path.join(OUT, 'superman'); os.makedirs(d, exist_ok=True); meta = []; seen = set()
    for q in ['Fleischer Superman 1941', 'Superman 1941 film Fleischer', 'The Mechanical Monsters 1941', 'Superman Fleischer title card', 'Famous Studios Superman 1942']:
        try:
            r = get('https://commons.wikimedia.org/w/api.php?action=query&format=json&generator=search&gsrnamespace=6&gsrlimit=20&gsrsearch=%s&prop=imageinfo&iiprop=url|size|extmetadata|mime&iiurlwidth=1100' % urllib.parse.quote(q), 40)
        except Exception as e: log('commons', q, e); continue
        for p in (r.get('query') or {}).get('pages', {}).values():
            ii = (p.get('imageinfo') or [{}])[0]; t = p.get('title', '')
            if t in seen or ii.get('mime') not in ('image/jpeg', 'image/png'): continue
            seen.add(t); em = ii.get('extmetadata') or {}
            meta.append({'title': t, 'page': ii.get('descriptionurl'), 'url': ii.get('url'), 'thumb': ii.get('thumburl'), 'w': ii.get('width'), 'h': ii.get('height'), 'license': (em.get('LicenseShortName') or {}).get('value'), 'usage': re.sub('<[^>]+>', '', (em.get('UsageTerms') or {}).get('value') or ''), 'artist': re.sub('<[^>]+>', '', (em.get('Artist') or {}).get('value') or '')[:120], 'date': re.sub('<[^>]+>', '', (em.get('DateTimeOriginal') or {}).get('value') or '')[:40], 'desc': re.sub('<[^>]+>', '', (em.get('ImageDescription') or {}).get('value') or '')[:200]})
        time.sleep(0.5)
    keep = [m for m in meta if re.search(r'public domain|^pd', (m.get('license') or '') + ' ' + (m.get('usage') or ''), re.I)]
    for i, m in enumerate(keep[:24]):
        try:
            b = raw(m['thumb'] or m['url'], 40); fn = 'pd_%02d.jpg' % i; im = Image.open(io.BytesIO(b)).convert('RGB'); im.save(os.path.join(d, fn), quality=88); m['file'] = fn
        except Exception as e: m['err'] = str(e)[:80]
        time.sleep(0.3)
    save('superman.json', {'kept': keep[:24], 'all': [{'title': m['title'], 'license': m['license']} for m in meta]}); log('superman stills', len(keep), 'of', len(meta))
    sheet([((m.get('file') or '') + ' ' + m['title'][5:], m.get('thumb') or m.get('url')) for m in keep[:24]], 'superman.jpg', cols=4, w=260, h=195, fit=True)


def wget(url, tries=4):
    """Wikimedia asks for a contact in the User-Agent and paces image traffic; back off when it says so."""
    for i in range(tries):
        try: time.sleep(1.6); return raw(url, 40)
        except Exception as e:
            if '429' in str(e) and i < tries - 1: time.sleep(20 * (i + 1)); continue
            raise
def wiki_image(title, size=600):
    d = get('https://en.wikipedia.org/w/api.php?action=query&format=json&redirects=1&titles=%s&prop=pageimages&piprop=thumbnail|original|name&pithumbsize=%d&pilicense=any' % (urllib.parse.quote(title), size), 30)
    for p in (d.get('query') or {}).get('pages', {}).values():
        t = p.get('thumbnail') or {}; o = p.get('original') or {}
        if t.get('source') or o.get('source'): return {'page': p.get('title'), 'url': (t.get('source') or o.get('source')), 'orig': o.get('source'), 'w': t.get('width') or o.get('width'), 'h': t.get('height') or o.get('height')}
    return {'page': None}
def fix():
    """Candidates for every wrong or missing poster: the named Wikipedia article's own image, or MyAnimeList's poster by id.
    Nothing is written to the store here; the sheets are for checking by eye first."""
    F = json.load(open(os.path.join(HERE, 'poster_fix.json'))); out = {}; items = []
    for k, title in F['wiki'].items():
        try: r = wiki_image(title); r['src'] = 'wikipedia'; r['want'] = title
        except Exception as e: r = {'err': str(e)[:80], 'want': title}
        out[k] = r; time.sleep(0.3)
    for k, mid in F['mal'].items():
        try:
            a = get('https://api.jikan.moe/v4/anime/%d' % mid, 30).get('data') or {}; im = (a.get('images') or {}).get('jpg', {})
            out[k] = {'page': a.get('title'), 'en': a.get('title_english'), 'type': a.get('type'), 'year': (a.get('aired') or {}).get('from', '')[:4], 'eps': a.get('episodes'), 'url': im.get('large_image_url') or im.get('image_url'), 'src': 'jikan', 'want': mid}
        except Exception as e: out[k] = {'err': str(e)[:80], 'want': mid}
        time.sleep(1.2)
    L = {}
    for k, pages in F['list'].items():
        L[k] = []
        for pg in pages:
            try:
                d = get('https://en.wikipedia.org/w/api.php?action=query&format=json&redirects=1&titles=%s&generator=images&gimlimit=40&prop=imageinfo&iiprop=url|size|mime&iiurlwidth=500' % urllib.parse.quote(pg), 30)
                for p in (d.get('query') or {}).get('pages', {}).values():
                    ii = (p.get('imageinfo') or [{}])[0]
                    if ii.get('mime') in ('image/jpeg', 'image/png') and (ii.get('width') or 0) >= 200: L[k].append({'page': pg, 'file': p.get('title'), 'url': ii.get('thumburl') or ii.get('url'), 'orig': ii.get('url'), 'w': ii.get('width'), 'h': ii.get('height')})
            except Exception as e: L[k].append({'page': pg, 'err': str(e)[:80]})
            time.sleep(0.4)
    save('fix.json', {'one': out, 'list': L})
    def tile(label, url):
        if not url: return (label, '')
        return (label, url)
    def fsheet(items, name, cols=6, w=150, h=225):
        rows = (len(items) + cols - 1) // cols; lab = 34; img = Image.new('RGB', (cols * (w + 8) + 8, rows * (h + lab + 8) + 8), (18, 18, 20)); d = ImageDraw.Draw(img); f = font(11)
        for i, (label, url) in enumerate(items):
            x = 8 + (i % cols) * (w + 8); y = 8 + (i // cols) * (h + lab + 8)
            if url:
                try:
                    b = wget(url) if 'wikimedia' in url else raw(url, 30); im = Image.open(io.BytesIO(b)).convert('RGB'); im.thumbnail((w, h)); img.paste(im, (x + (w - im.width) // 2, y + (h - im.height) // 2))
                except Exception as e: d.text((x + 4, y + 4), 'ERR ' + str(e)[:40], fill=(255, 90, 90), font=f)
            else: d.rectangle([x, y, x + w, y + h], outline=(120, 60, 60)); d.text((x + 4, y + 4), 'NO IMAGE', fill=(255, 90, 90), font=f)
            d.text((x, y + h + 3), label[:25], fill=(240, 240, 240), font=f); d.text((x, y + h + 17), label[25:50], fill=(240, 240, 240), font=f)
        img.save(os.path.join(OUT, name), quality=82); log('sheet', name, len(items))
    one = [(k.split(':', 1)[1], (v or {}).get('url') or '') for k, v in out.items()]
    for n in range(0, len(one), 36): fsheet(one[n:n + 36], 'fix_%02d.jpg' % (n // 36 + 1))
    G = []
    for k, files in L.items():
        G.append(('== ' + k.split(':', 1)[1], ''))
        for x in files[:11]: G.append(((x.get('file') or x.get('err') or '')[5:], x.get('url') or ''))
        while len(G) % 6: G.append(('', ''))
    fsheet(G, 'fix_games.jpg', cols=6, w=170, h=220)

def wikibox():
    """Seasons, episodes and air dates from each show's Wikipedia infobox (TV shows and cartoons only)."""
    out = {}
    for t, k in SHOWS:
        if k not in ('tv', 'cartoon'): continue
        q = clean_show(t)
        try:
            d = get('https://en.wikipedia.org/w/api.php?action=query&format=json&list=search&srlimit=4&srsearch=%s' % urllib.parse.quote(q + ' TV series'), 30)
            hits = [h['title'] for h in (d.get('query') or {}).get('search', [])]
            pick = next((h for h in hits if norm(re.sub(r'\s*\([^)]*\)$', '', h)) == norm(q)), hits[0] if hits else None)
            if not pick: out[t] = {'err': 'no article'}; continue
            w = get('https://en.wikipedia.org/w/api.php?action=parse&format=json&prop=wikitext&section=0&redirects=1&page=%s' % urllib.parse.quote(pick), 30)
            tx = ((w.get('parse') or {}).get('wikitext') or {}).get('*', '')
            def f(name):
                m = re.search(r'\|\s*' + name + r'\s*=\s*([^\n|]*)', tx); return re.sub(r'<[^>]+>|\{\{[^}]*\}\}|\[\[|\]\]', '', m.group(1)).strip()[:60] if m else None
            def dt(name):
                m = re.search(r'\|\s*' + name + r'\s*=\s*\{\{[^|}]*\|(?:df=\w+\|)?(\d{4})\|(\d{1,2})\|(\d{1,2})', tx); return '%s-%02d-%02d' % (m.group(1), int(m.group(2)), int(m.group(3))) if m else (f(name) or None)
            out[t] = {'page': pick, 'seasons': f('num_seasons') or f('num_series'), 'eps': f('num_episodes'), 'first': dt('first_aired'), 'last': dt('last_aired'), 'genre': f('genre'), 'hits': hits[:3]}
        except Exception as e: out[t] = {'err': str(e)[:80]}
        time.sleep(0.35)
    save('wikibox.json', out); log('wikibox', len(out))

if __name__ == '__main__':
    todo = sys.argv[1:] or ['fix', 'wikibox']
    for name in todo:
        try: {'imdb': imdb, 'tvmaze': tvmaze, 'posters': posters, 'superman': superman, 'fix': fix, 'wikibox': wikibox}[name]()
        except Exception: log('FAILED', name); traceback.print_exc()

"""Accuracy audit helper for Book Den. Runs on GitHub (the build sandbox cannot reach these hosts).
Gathers, for every show in sync/titles.json: IMDb's own dataset rows (type, years, genres, rating, votes, seasons, episodes)
and TVmaze's record; makes contact sheets of the posters now in the store so they can be checked by eye; lists Wikipedia
page-image candidates for each game; and collects public-domain Fleischer Superman stills from Wikimedia Commons with
their licence text. Everything lands in audit/ for review. Nothing in the store is changed by this script."""
import os, sys, json, re, gzip, time, urllib.request, urllib.parse, urllib.error, io, traceback, socket
_gai = socket.getaddrinfo
def _gai4(*a, **k):
    r = _gai(*a, **k); v4 = [x for x in r if x[0] == socket.AF_INET]; return v4 or r
socket.getaddrinfo = _gai4
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

# ---------------------------------------------------------------- third pass
AL = 'https://graphql.anilist.co'
ALF = 'id idMal format status episodes startDate{year month} endDate{year month} title{romaji english} coverImage{extraLarge} nextAiringEpisode{episode} relations{edges{relationType node{id type format}}}'
def al(query, variables):
    body = json.dumps({'query': query, 'variables': variables}).encode()
    for i in range(5):
        try:
            time.sleep(2.3)
            r = urllib.request.urlopen(urllib.request.Request(AL, data=body, headers=dict(UA, **{'Content-Type': 'application/json', 'Accept': 'application/json'})), timeout=40)
            return json.loads(r.read().decode()).get('data') or {}
        except urllib.error.HTTPError as e:
            if e.code == 429: time.sleep(62); continue
            if e.code == 404: return {}
            raise
    return {}
def al_brief(m):
    if not m: return None
    aired = m.get('episodes') or ((m.get('nextAiringEpisode') or {}).get('episode') or 1) - 1
    return {'id': m['id'], 'mal': m.get('idMal'), 'format': m.get('format'), 'status': m.get('status'), 'eps': m.get('episodes'), 'aired': aired, 'start': (m.get('startDate') or {}).get('year'), 'end': (m.get('endDate') or {}).get('year'), 'romaji': (m.get('title') or {}).get('romaji'), 'english': (m.get('title') or {}).get('english'), 'cover': (m.get('coverImage') or {}).get('extraLarge')}
# the name to search for, where the app's own title is a short form
AN = {'86': '86 EIGHTY-SIX', 'Hell’s Paradise': "Hell's Paradise", 'Re:Zero': 'Re:ZERO -Starting Life in Another World-', 'Mushoku Tensei': 'Mushoku Tensei: Jobless Reincarnation', 'Gundam SEED Destiny': 'Mobile Suit Gundam SEED Destiny', 'Iron-Blooded Orphans': 'Mobile Suit Gundam: Iron-Blooded Orphans', 'Yaiba': 'YAIBA: Samurai Legend', 'Ghost in the Shell': 'Ghost in the Shell: Stand Alone Complex', 'Aquarion': 'Genesis of Aquarion', 'Frieren': "Frieren: Beyond Journey's End", 'Food Wars': 'Food Wars! Shokugeki no Soma', 'Zatch Bell': 'Zatch Bell!', 'Baka and Test': 'Baka and Test - Summon the Beasts', 'The Disastrous Life of Saiki K': 'The Disastrous Life of Saiki K.', 'Code Geass': 'Code Geass: Lelouch of the Rebellion', 'Naruto Shippuden': 'Naruto: Shippuden', 'JoJo’s Bizarre Adventure': "JoJo's Bizarre Adventure", 'Demon Slayer': 'Demon Slayer: Kimetsu no Yaiba', 'The Hentai Prince and the Stony Cat': 'Hentai Ouji to Warawanai Neko', 'Kenichi: The Mightiest Disciple': 'Shijou Saikyou no Deshi Kenichi', 'Mobile Suit Gundam SEED': 'Mobile Suit Gundam SEED', 'Dragon Ball (all series)': 'Dragon Ball', 'Yu-Gi-Oh! (through 5D’s)': 'Yu-Gi-Oh! Duel Monsters', 'Digimon (every season before Tri)': 'Digimon Adventure', 'Pokémon (through Diamond & Pearl)': 'Pokémon', 'Rascal Does Not Dream of Bunny Girl Senpai': 'Rascal Does Not Dream of Bunny Girl Senpai', 'Ace of Diamond': 'Ace of Diamond', 'Inuyasha': 'InuYasha', 'Yu Yu Hakusho': 'Yu Yu Hakusho', 'Bleach': 'Bleach', 'One Piece': 'ONE PIECE'}
# MyAnimeList ids for the first TV series where a search would be ambiguous
MALID = {'One Piece': 21, 'Yu Yu Hakusho': 392, 'Cowboy Bebop': 1, 'Ghost in the Shell': 467, 'Food Wars': 28171, 'Rosario + Vampire': 2993, 'Gundam SEED Destiny': 94, 'Iron-Blooded Orphans': 31251, 'Aquarion': 488, 'The Hentai Prince and the Stony Cat': 15225, 'Digimon (every season before Tri)': 552, 'Pokémon (through Diamond & Pearl)': 527, 'Naruto': 20, 'Naruto Shippuden': 1735, 'Bleach': 269, 'Death Note': 1535, 'Hunter x Hunter': 11061, 'Fairy Tail': 6702, 'Attack on Titan': 16498, 'Inuyasha': 249, 'Dragon Ball (all series)': 223, 'Yu-Gi-Oh! (through 5D’s)': 481, 'Gintama': 918, 'Eureka Seven': 237, 'The Big O': 567, 'Code Geass': 1575, 'Mobile Suit Gundam SEED': 93, 'Black Clover': 34572, 'Jujutsu Kaisen': 40748, 'Demon Slayer': 38000, 'Chainsaw Man': 44511, 'Haikyu!!': 20583, 'Nisekoi': 18897, 'The Prince of Tennis': 22}
# franchises the app keeps as one entry: every TV series that belongs in it, by MyAnimeList id
GROUPS = {'Dragon Ball (all series)': [223, 813, 225, 30694], 'Yu-Gi-Oh! (through 5D’s)': [481, 482, 4107], 'Digimon (every season before Tri)': [552, 1313, 874, 1132, 1629, 8687, 10159, 11743], 'Pokémon (through Diamond & Pearl)': [527, 1564, 1565]}
def anime():
    """AniList record for every anime in the list: the first TV series, every sequel after it, episode totals and the cover."""
    out = {}; pairs = []
    cur = {}
    try: cur = json.load(open(os.path.join(OUT, 'poster_urls.json'))).get('shows', {})
    except Exception: pass
    for t, k in SHOWS:
        if k != 'anime': continue
        q = AN.get(t) or clean_show(t); rec = {'q': q}
        try:
            base = None
            if t in MALID:
                base = (al('query($id:Int){Media(idMal:$id,type:ANIME){%s}}' % ALF, {'id': MALID[t]}) or {}).get('Media')
            res = ((al('query($q:String){Page(perPage:6){media(search:$q,type:ANIME,sort:SEARCH_MATCH){%s}}}' % ALF, {'q': q}) or {}).get('Page') or {}).get('media') or []
            rec['results'] = [al_brief(m) for m in res]
            if not base: base = next((m for m in res if m.get('format') == 'TV'), res[0] if res else None)
            if not base: out[t] = dict(rec, err='nothing found'); continue
            chain = [base]; seen = {base['id']}; queue = [base]
            while queue and len(chain) < 22:
                m = queue.pop(0)
                for e in ((m.get('relations') or {}).get('edges') or []):
                    n = e.get('node') or {}
                    if e.get('relationType') == 'SEQUEL' and n.get('type') == 'ANIME' and n.get('id') not in seen:
                        seen.add(n['id']); nx = (al('query($id:Int){Media(id:$id,type:ANIME){%s}}' % ALF, {'id': n['id']}) or {}).get('Media')
                        if nx: chain.append(nx); queue.append(nx)
            rec['base'] = al_brief(base); rec['chain'] = [al_brief(m) for m in chain]
            tv = [c for c in rec['chain'] if c['format'] in ('TV', 'TV_SHORT', 'ONA')]
            rec['tv_parts'] = len(tv); rec['tv_eps'] = sum((c['aired'] or 0) for c in tv); rec['years'] = [min([c['start'] for c in tv if c['start']] or [None]), max([(c['end'] or 0) for c in tv] or [None])]; rec['airing'] = any(c['status'] in ('RELEASING', 'NOT_YET_RELEASED') for c in tv)
            if t in GROUPS:
                rec['group'] = []
                for mid in GROUPS[t]:
                    g = (al('query($id:Int){Media(idMal:$id,type:ANIME){%s}}' % ALF, {'id': mid}) or {}).get('Media'); rec['group'].append(al_brief(g) or {'mal': mid, 'err': 'not found'})
                rec['group_eps'] = sum((g.get('aired') or 0) for g in rec['group'])
            pairs.append(('NOW ' + t, cur.get(t) or '')); pairs.append(('ANILIST ' + (rec['base']['english'] or rec['base']['romaji'] or ''), rec['base']['cover'] or ''))
        except Exception as e: rec['err'] = str(e)[:120]
        out[t] = rec; log('anime', t, rec.get('tv_parts'), rec.get('tv_eps'), rec.get('err', ''))
    save('anime.json', out)
    for n in range(0, len(pairs), 48): sheet(pairs[n:n + 48], 'anime_%02d.jpg' % (n // 48 + 1), cols=8, w=140, h=200, fit=True)

def steam():
    """Portrait store capsules for the games whose Wikipedia article only carries the old box art."""
    out = {}; items = []
    for t, q in [('Final Fantasy Tactics: The Ivalice Chronicles', 'FINAL FANTASY TACTICS The Ivalice Chronicles'), ('Dragon Quest III HD-2D Remake', 'DRAGON QUEST III HD-2D Remake'), ('Tactics Ogre: Reborn', 'Tactics Ogre Reborn'), ('Octopath Traveler II', 'OCTOPATH TRAVELER II'), ('Digimon Survive', 'Digimon Survive'), ('Elden Ring', 'ELDEN RING')]:
        out[t] = []
        try:
            d = get('https://store.steampowered.com/api/storesearch/?cc=us&l=en&term=' + urllib.parse.quote(q), 30)
            for x in (d.get('items') or [])[:3]:
                rec = {'id': x.get('id'), 'name': x.get('name'), 'caps': []}
                try:
                    g = get('https://api.steampowered.com/IStoreBrowseService/GetItems/v1?input_json=' + urllib.parse.quote(json.dumps({'ids': [{'appid': x['id']}], 'context': {'language': 'english', 'country_code': 'US'}, 'data_request': {'include_assets': True}})), 30)
                    a = (((g.get('response') or {}).get('store_items') or [{}])[0].get('assets') or {}); fmt = a.get('asset_url_format') or ''
                    for key in ('library_capsule_2x', 'library_capsule', 'header'):
                        if a.get(key) and fmt: rec['caps'].append([key, 'https://shared.steamstatic.com/store_item_assets/' + fmt.replace('${FILENAME}', a[key])])
                except Exception as e: rec['err'] = str(e)[:80]
                rec['caps'].append(['old', 'https://cdn.cloudflare.steamstatic.com/steam/apps/%s/library_600x900_2x.jpg' % x.get('id')]); rec['caps'].append(['old1x', 'https://cdn.cloudflare.steamstatic.com/steam/apps/%s/library_600x900.jpg' % x.get('id')])
                for c in rec['caps']:
                    try: im = Image.open(io.BytesIO(raw(c[1], 30))); c += [im.width, im.height]
                    except Exception as e: c += [0, 0, str(e)[:50]]
                out[t].append(rec); good = next((c for c in rec['caps'] if c[2] and c[3] > c[2]), None)
                items.append(('%s -> %s (%s)' % (t[:22], x.get('name', '')[:24], x.get('id')), good[1] if good else ''))
                time.sleep(0.5)
        except Exception as e: out[t] = {'err': str(e)[:100]}
    save('steam.json', out); sheet(items, 'steam.jpg', cols=6, w=180, h=270, fit=True)

def pkmn():
    """Pokemon Scarlet's own box art (the Wikipedia image shows both versions side by side)."""
    out = {}; d = os.path.join(OUT, 'covers'); os.makedirs(d, exist_ok=True)
    for name, api, title in [('bulba', 'https://archives.bulbagarden.net/w/api.php', 'File:Scarlet EN boxart.png'), ('bulba2', 'https://archives.bulbagarden.net/w/api.php', 'File:Scarlet EN boxart.jpg')]:
        try:
            r = get(api + '?action=query&format=json&titles=%s&prop=imageinfo&iiprop=url|size|mime&iiurlwidth=600' % urllib.parse.quote(title), 30)
            for p in (r.get('query') or {}).get('pages', {}).values():
                ii = (p.get('imageinfo') or [{}])[0]
                if ii.get('url'):
                    out[name] = {'title': p.get('title'), 'url': ii.get('url'), 'thumb': ii.get('thumburl'), 'w': ii.get('width'), 'h': ii.get('height')}
                    try:
                        im = Image.open(io.BytesIO(raw(ii.get('thumburl') or ii['url'], 40))).convert('RGB'); im.thumbnail((600, 1000)); im.save(os.path.join(d, 'pokemon-scarlet-%s.jpg' % name), quality=88); out[name]['saved'] = [im.width, im.height]
                    except Exception as e: out[name]['err'] = str(e)[:80]
        except Exception as e: out[name] = {'err': str(e)[:100]}
        time.sleep(1)
    try:
        r = get('https://en.wikipedia.org/w/api.php?action=query&format=json&titles=%s&prop=imageinfo&iiprop=url|size' % urllib.parse.quote('File:Pokémon Scarlet and Violet banner.png'), 30)
        for p in (r.get('query') or {}).get('pages', {}).values():
            ii = (p.get('imageinfo') or [{}])[0]
            if ii.get('url'):
                im = Image.open(io.BytesIO(wget(ii['url']))).convert('RGB'); out['wiki'] = {'url': ii['url'], 'w': im.width, 'h': im.height}
                im.crop((0, 0, im.width // 2, im.height)).save(os.path.join(d, 'pokemon-scarlet-wiki-left.jpg'), quality=90)
    except Exception as e: out['wiki'] = {'err': str(e)[:100]}
    save('pkmn.json', out)

RAWPAGES = ['The Game (2006 TV series)', 'Rugrats', 'The Adventures of Jimmy Neutron, Boy Genius', 'Pucca (TV series)', 'Masters of the Universe: Revelation', 'Guardian: The Lonely and Great God', 'Reba (TV series)', 'Drake & Josh', 'Codename: Kids Next Door', 'Ben 10 (2005 TV series)', 'Regular Show', 'The West Wing', 'Kenan & Kel', 'SpongeBob SquarePants', 'Family Guy', 'American Dad!', 'Abbott Elementary', 'Superman: The Animated Series', 'Batman: The Animated Series', 'Roseanne', 'Hannah Montana', 'My Wife and Kids', 'Danny Phantom', 'The Fairly OddParents', 'Adventure Time', 'Kim Possible', 'Mythic Quest', 'Big Time Rush (TV series)', 'The Office (American TV series)', 'Seinfeld', 'Archer (2009 TV series)', 'All Grown Up!', "My Gym Partner's a Monkey", 'Unfabulous', 'Victorious', 'Hope & Faith', 'Justice League Unlimited', 'Psych', 'The Proud Family', 'Harley Quinn (TV series)', "X-Men '97", 'Ted Lasso', 'The Bear (TV series)', 'The Neighborhood (TV series)', 'Severance (TV series)', 'Westworld (TV series)', 'Game of Thrones', 'Everybody Loves Raymond', 'Xiaolin Showdown', 'Yin Yang Yo!',
            'Mighty Morphin Power Rangers', 'Mighty Morphin Alien Rangers', 'Power Rangers Zeo', 'Power Rangers Turbo', 'Power Rangers in Space', 'Power Rangers Lost Galaxy', 'Power Rangers Lightspeed Rescue', 'Power Rangers Time Force', 'Power Rangers Wild Force', 'Power Rangers Ninja Storm', 'Power Rangers Dino Thunder', 'Power Rangers S.P.D.', 'Power Rangers Mystic Force', 'Power Rangers Operation Overdrive', 'Power Rangers Jungle Fury',
            'StarStruck (2010 film)', 'Starstruck (2010 film)', 'Let It Shine (film)', 'Hatching Pete', 'Kim Possible: A Sitch in Time', 'Kim Possible Movie: So the Drama', 'Codename: Kids Next Door – Operation: Z.E.R.O.', 'Pokémon: The First Movie', 'Pokémon the Movie 2000', 'Pokémon 3: The Movie', 'Digimon: The Movie', 'Yu-Gi-Oh! The Movie: Pyramid of Light', 'Jujutsu Kaisen 0', 'Dragon Ball Super: Super Hero', 'Walking Tall (2004 film)', 'Dr. Dolittle (1998 film)', 'Anchorman: The Legend of Ron Burgundy', 'Cadet Kelly', 'Bram Stoker\'s Dracula (1992 film)', 'Dracula (2025 film)']
def wikiraw():
    """The infobox lines themselves, for the pages where a parsed number needs reading by eye."""
    out = {}
    for pg in RAWPAGES:
        try:
            w = get('https://en.wikipedia.org/w/api.php?action=parse&format=json&prop=wikitext&section=0&redirects=1&page=%s' % urllib.parse.quote(pg), 30)
            tx = ((w.get('parse') or {}).get('wikitext') or {}).get('*', ''); rec = {'title': (w.get('parse') or {}).get('title')}
            for name in ('num_seasons', 'num_series', 'num_episodes', 'first_aired', 'last_aired', 'released', 'runtime', 'network', 'director', 'image'):
                hits = re.findall(r'\|\s*' + name + r'\d*\s*=\s*([^\n]*)', tx)
                if hits: rec[name] = [h.strip()[:220] for h in hits[:4]]
            out[pg] = rec
        except Exception as e: out[pg] = {'err': str(e)[:100]}
        time.sleep(0.4)
    save('wikiraw.json', out); log('wikiraw', len(out))

# titles the first IMDb pass could not match by name, and the parts of the entries that stand for several titles
IMDB2 = {'Goblin': [('Guardian: The Lonely and Great God', 2016)], 'Gundam SEED Destiny': [('Mobile Suit Gundam SEED Destiny', 2004)], 'Iron-Blooded Orphans': [('Mobile Suit Gundam: Iron-Blooded Orphans', 2015)], 'Yaiba': [('Yaiba: Samurai Legend', 2025)], 'Aquarion': [('Aquarion', 2005), ('Genesis of Aquarion', 2005), ('Sousei no Aquarion', 2005)], 'Frieren': [("Frieren: Beyond Journey's End", 2023)], 'Haikyu!!': [('Haikyuu!!', 2014), ('Haikyu!!', 2014)], 'Pucca': [('Pucca', 2006)], 'Jimmy Neutron': [('The Adventures of Jimmy Neutron, Boy Genius', 2002), ('The Adventures of Jimmy Neutron: Boy Genius', 2002)], 'Dr. Dolittle (Eddie Murphy)': [('Doctor Dolittle', 1998), ('Dr. Dolittle', 1998)], 'Anchorman': [('Anchorman: The Legend of Ron Burgundy', 2004)], 'Kim Possible Movie: So the Drama': [('Kim Possible: So the Drama', 2005), ('Kim Possible Movie: So the Drama', 2005)], 'Pokémon: The First Movie': [('Pokémon: The First Movie - Mewtwo Strikes Back', 1998), ('Pokémon: The First Movie', 1998), ('Pokémon the First Movie: Mewtwo Strikes Back', 1998)], 'Pokémon 3: The Movie': [('Pokémon 3: The Movie', 2000), ('Pokémon 3 the Movie: Spell of the Unown', 2000), ('Pokémon 3: The Movie - Spell of the Unown', 2000)], 'Yu-Gi-Oh! The Movie: Pyramid of Light': [('Yu-Gi-Oh!: The Movie', 2004), ('Yu-Gi-Oh! The Movie', 2004), ('Yu-Gi-Oh!: The Movie - Pyramid of Light', 2004)], 'Westworld (Season 1)': [('Westworld', 2016)], 'Ghost in the Shell': [('Ghost in the Shell: Stand Alone Complex', 2002), ('Ghost in the Shell', 1995)], 'Rosario + Vampire': [('Rosario + Vampire', 2008)], 'Power Rangers (through Jungle Fury)': [('Mighty Morphin Power Rangers', 1993)], 'Dragon Ball (all series)': [('Dragon Ball', 1986), ('Dragon Ball Z', 1989), ('Dragon Ball GT', 1996), ('Dragon Ball Super', 2015)], 'Yu-Gi-Oh! (through 5D’s)': [('Yu-Gi-Oh! Duel Monsters', 2000), ('Yu-Gi-Oh!', 2000), ('Yu-Gi-Oh! GX', 2004), ("Yu-Gi-Oh! 5D's", 2008)], 'Digimon (every season before Tri)': [('Digimon: Digital Monsters', 1999), ('Digimon Adventure', 1999)], 'Pokémon (through Diamond & Pearl)': [('Pokémon', 1997)], 'Harry Potter (all 8)': [("Harry Potter and the Sorcerer's Stone", 2001), ('Harry Potter and the Chamber of Secrets', 2002), ('Harry Potter and the Prisoner of Azkaban', 2004), ('Harry Potter and the Goblet of Fire', 2005), ('Harry Potter and the Order of the Phoenix', 2007), ('Harry Potter and the Half-Blood Prince', 2009), ('Harry Potter and the Deathly Hallows: Part 1', 2010), ('Harry Potter and the Deathly Hallows: Part 2', 2011)], 'Friday / Next Friday / Friday After Next': [('Friday', 1995), ('Next Friday', 2000), ('Friday After Next', 2002)], 'Rush Hour 1–3': [('Rush Hour', 1998), ('Rush Hour 2', 2001), ('Rush Hour 3', 2007)], 'Shrek 1–3': [('Shrek', 2001), ('Shrek 2', 2004), ('Shrek the Third', 2007)], 'Divergent + Insurgent': [('Divergent', 2014), ('Insurgent', 2015), ('The Divergent Series: Insurgent', 2015)], 'The Maze Runner + The Scorch Trials': [('The Maze Runner', 2014), ('Maze Runner: The Scorch Trials', 2015)], 'Dracula': [("Bram Stoker's Dracula", 1992), ('Dracula', 1992), ('Dracula', 2025), ('Dracula: A Love Tale', 2025), ('Dracula', 1931), ('Dracula', 2020), ('Dracula Untold', 2014)]}
def imdb2():
    def fetch(name):
        p = '/tmp/' + name
        if not os.path.exists(p): urllib.request.urlretrieve('https://datasets.imdbws.com/' + name, p)
        return gzip.open(p, 'rt', encoding='utf-8', newline='')
    wantk = {}
    for t, L in IMDB2.items():
        for nm, yr in L: wantk.setdefault(norm(nm), []).append((t, nm, yr))
    TYPES = {'tvSeries', 'tvMiniSeries', 'movie', 'tvMovie', 'video'}; cands = {}
    with fetch('title.basics.tsv.gz') as f:
        f.readline()
        for line in f:
            p = line.rstrip('\n').split('\t')
            if len(p) < 9 or p[1] not in TYPES: continue
            for nm in {norm(p[2]), norm(p[3])}:
                for (t, want_nm, yr) in wantk.get(nm, ()):
                    if p[5].isdigit() and abs(int(p[5]) - yr) <= 1: cands[p[0]] = {'for': t, 'asked': want_nm, 'id': p[0], 'type': p[1], 'title': p[2], 'orig': p[3], 'start': p[5], 'end': p[6], 'mins': p[7], 'genres': p[8]}
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
    for c in cands.values():
        if c['id'] in eps: c['eps'] = eps[c['id']]; c['seasons'] = len(seas.get(c['id'], ()))
        out.setdefault(c['for'], []).append(c)
    for t in out: out[t].sort(key=lambda c: -(c.get('votes') or 0)); out[t] = [c for c in out[t] if c.get('votes')][:10]
    save('imdb2.json', out); log('imdb2', len(out), 'of', len(IMDB2))

def books():
    """Contact sheets of every book cover in the store, so a wrong book or a wrong edition can be seen."""
    cur = (get(STORE + '?key=' + urllib.parse.quote(KEY), 120).get('v') or {}); rows = []; meta = {}
    for t, a in T['books']:
        try: j = json.loads(cur['cv:' + t]['j'])
        except Exception: j = {}
        u = j.get('url') or ''
        if 'mzstatic.com' in u: u = re.sub(r'/[0-9]+x[0-9]+[a-z]*(-[0-9]+)?\.(jpg|png|webp)$', '/200x300bb.jpg', u)
        if 'covers.openlibrary.org' in u: u = re.sub(r'-[SML]\.jpg$', '-M.jpg', u)
        rows.append((('%s | %s' % (t, a)), u)); meta[t] = {'author': a, 'url': j.get('url'), 'src': j.get('src'), 'w': j.get('w'), 'h': j.get('h'), 'miss': j.get('miss')}
    save('book_covers.json', meta)
    def bsheet(items, name, cols=10, w=118, h=177):
        lab = 40; rws = (len(items) + cols - 1) // cols; img = Image.new('RGB', (cols * (w + 6) + 6, rws * (h + lab + 6) + 6), (18, 18, 20)); d = ImageDraw.Draw(img); f = font(10)
        for i, (label, url) in enumerate(items):
            x = 6 + (i % cols) * (w + 6); y = 6 + (i // cols) * (h + lab + 6)
            if url:
                try: im = Image.open(io.BytesIO(raw(url, 25))).convert('RGB'); im.thumbnail((w, h)); img.paste(im, (x + (w - im.width) // 2, y + (h - im.height) // 2))
                except Exception as e: d.text((x + 2, y + 4), 'ERR ' + str(e)[:18], fill=(255, 90, 90), font=f)
                time.sleep(0.05)
            else: d.rectangle([x, y, x + w, y + h], outline=(120, 60, 60)); d.text((x + 4, y + 4), 'NO COVER', fill=(255, 90, 90), font=f)
            ti, au = (label.split(' | ') + [''])[:2]
            d.text((x, y + h + 2), ti[:21], fill=(240, 240, 240), font=f); d.text((x, y + h + 14), ti[21:42], fill=(240, 240, 240), font=f); d.text((x, y + h + 26), au[:21], fill=(150, 150, 150), font=f)
        img.save(os.path.join(OUT, name), quality=80); log('sheet', name, len(items))
    for n in range(0, len(rows), 70): bsheet(rows[n:n + 70], 'books_%02d.jpg' % (n // 70 + 1))

def links():
    """Does every outside link the app shows still answer? (Some sites refuse scripts, so only a clear 404 or 410 counts as dead.)"""
    L = json.load(open(os.path.join(HERE, 'links.json'))); out = []
    H = {'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.5 Safari/605.1.15', 'Accept': 'text/html,application/xhtml+xml;q=0.9,*/*;q=0.8', 'Accept-Language': 'en-US,en;q=0.9'}
    for where, u in L:
        try:
            r = urllib.request.urlopen(urllib.request.Request(u, headers=H), timeout=25); body = r.read(60000).decode('utf-8', 'ignore'); m = re.search(r'<title[^>]*>([^<]{0,120})', body, re.I)
            out.append([where, u, r.status, r.geturl() if r.geturl() != u else '', (m.group(1).strip() if m else '')])
        except urllib.error.HTTPError as e: out.append([where, u, e.code, '', ''])
        except Exception as e: out.append([where, u, 0, '', str(e)[:60]])
        time.sleep(0.4)
    save('links.json', out); log('links', len(out), 'dead', len([o for o in out if o[2] in (404, 410)]))

# ---------------------------------------------------------------- fourth pass: write the checked posters, hunt for the rest
def apply():
    """Write the posters in sync/poster_apply.json to the store. Every one was looked at first; each is downloaded again
    here and measured, and only what loads is written. src is 'audit' so later cover jobs leave these rows alone."""
    AP = json.load(open(os.path.join(HERE, 'poster_apply.json'))); rows = {}; rep = {}; now = int(time.time() * 1000)
    for k, v in AP.items():
        u = v['url']
        try:
            b = wget(u) if 'wikimedia' in u else raw(u, 40); im = Image.open(io.BytesIO(b)); w, h = im.size
            if w < 150: raise ValueError('only %d px wide' % w)
            rows[k] = {'u': now, 'j': json.dumps({'url': u, 'src': 'audit', 'via': v.get('from'), 'at': now, 'w': w, 'h': h})}; rep[k] = [u, w, h]
        except Exception as e: rep[k] = ['ERR ' + str(e)[:90], u]
    keys = list(rows); wrote = 0
    for n in range(0, len(keys), 40):
        body = json.dumps({'key': KEY, 'v': {k: rows[k] for k in keys[n:n + 40]}}).encode()
        r = json.loads(urllib.request.urlopen(urllib.request.Request(STORE, data=body, headers={'Content-Type': 'text/plain'}), timeout=120).read().decode()); wrote += int(r.get('wrote') or 0); log('posted', len(keys[n:n + 40]), r.get('wrote'))
    save('applied.json', {'wrote': wrote, 'rows': rep}); log('apply: wrote', wrote, 'of', len(AP), 'errors', len([1 for v in rep.values() if str(v[0]).startswith('ERR')]))

def hunt():
    """Second tries for the posters that are still missing or the wrong shape. Candidates only; nothing is written."""
    import hashlib
    out = {}; items = []
    BR = {'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.5 Safari/605.1.15', 'Accept-Language': 'en-US,en;q=0.9'}
    def braw(u, ref=None, t=40):
        h = dict(BR);
        if ref: h['Referer'] = ref
        return urllib.request.urlopen(urllib.request.Request(u, headers=h), timeout=t).read()
    def add(key, label, url, extra=None):
        rec = {'label': label, 'url': url}
        try:
            b = wget(url) if 'wikimedia' in url else braw(url); im = Image.open(io.BytesIO(b)); rec['w'], rec['h'] = im.size
        except Exception as e: rec['err'] = str(e)[:80]
        if extra: rec.update(extra)
        out.setdefault(key, []).append(rec); items.append(('%s | %s' % (key.split(':', 1)[1][:22], label[:26]), url if 'err' not in rec else ''))
    for t, iid in [('Goblin', 'tt5994364'), ('The Game', 'tt0772137')]:
        try:
            d = get('https://api.tvmaze.com/lookup/shows?imdb=' + iid, 30); im = (d.get('image') or {})
            if im.get('original'): add('show:' + t, 'tvmaze ' + str(d.get('name')) + ' ' + str(d.get('premiered'))[:4], im['original'])
        except Exception as e: out.setdefault('show:' + t, []).append({'label': 'tvmaze', 'err': str(e)[:80]})
        time.sleep(0.6)
    for t, mid in [('Rosario + Vampire', 2993), ('Pokémon (through Diamond & Pearl)', 527), ('Aquarion', 478)]:
        try:
            a = get('https://api.jikan.moe/v4/anime/%d' % mid, 30).get('data') or {}; im = (a.get('images') or {}).get('jpg', {})
            if im.get('large_image_url'): add('show:' + t, 'mal ' + str(a.get('title'))[:22], im['large_image_url'])
        except Exception as e: out.setdefault('show:' + t, []).append({'label': 'jikan', 'err': str(e)[:80]})
        time.sleep(1.3)
    for t, q, yr in [('Harry Potter (all 8)', "Harry Potter and the Sorcerer's Stone", 2001), ('StarStruck', 'Starstruck', 2010), ('Kim Possible: A Sitch in Time', 'Kim Possible A Sitch in Time', 2003), ('Codename: Kids Next Door – Operation Z.E.R.O.', 'Kids Next Door Operation Z.E.R.O.', 2006), ('Dracula', "Bram Stoker's Dracula", 1992), ('Dracula', 'Dracula', 2025)]:
        try:
            d = get('https://itunes.apple.com/search?country=us&limit=12&media=movie&entity=movie&term=' + urllib.parse.quote(q), 30)
            for m in d.get('results', []):
                y = str(m.get('releaseDate') or '')[:4]
                if m.get('artworkUrl100') and y.isdigit() and abs(int(y) - yr) <= 1:
                    add('show:' + t, 'itunes %s %s' % (str(m.get('trackName'))[:20], y), re.sub(r'/[0-9]+x[0-9]+[a-z]*(-[0-9]+)?\.(jpg|png|webp)$', '/600x900bb.jpg', m['artworkUrl100']))
        except Exception as e: out.setdefault('show:' + t, []).append({'label': 'itunes', 'err': str(e)[:80]})
        time.sleep(3.2)
    for t, titles in [('StarStruck', ['Starstruck (2010 film)']), ('Harry Potter (all 8)', ['Harry Potter and the Deathly Hallows – Part 2', 'Harry Potter and the Chamber of Secrets (film)', 'Harry Potter and the Prisoner of Azkaban (film)']), ('Dracula', ["Bram Stoker's Dracula (1992 film)", 'Dracula (2025 film)', 'Dracula: A Love Tale'])]:
        for ti in titles:
            try:
                r = wiki_image(ti)
                if r.get('url'): add('show:' + t, 'wiki ' + str(r.get('page'))[:24], (r.get('orig') or r['url']).split('?')[0])
            except Exception as e: pass
            time.sleep(0.4)
    for t, q in [('Codename: Kids Next Door – Operation Z.E.R.O.', 'Codename Kids Next Door Operation Z.E.R.O. film'), ('Kim Possible: A Sitch in Time', 'Kim Possible A Sitch in Time')]:
        try:
            d = get('https://en.wikipedia.org/w/api.php?action=query&format=json&generator=search&gsrlimit=5&gsrsearch=%s&prop=pageimages&piprop=original|name&pilicense=any' % urllib.parse.quote(q), 30)
            for pg in sorted((d.get('query') or {}).get('pages', {}).values(), key=lambda x: x.get('index', 0)):
                u = (pg.get('original') or {}).get('source')
                if u: add('show:' + t, 'wiki ' + pg.get('title', '')[:24], u.split('?')[0])
        except Exception as e: pass
        time.sleep(0.4)
    # Pokemon Scarlet's own box art
    for nm in ['Scarlet_EN_boxart.png', 'Scarlet_EN_boxart.jpg']:
        h = hashlib.md5(nm.encode()).hexdigest(); u = 'https://archives.bulbagarden.net/media/upload/%s/%s/%s' % (h[0], h[:2], nm)
        rec = {'label': 'bulbagarden ' + nm, 'url': u}
        try:
            b = braw(u, 'https://bulbapedia.bulbagarden.net/'); im = Image.open(io.BytesIO(b)); rec['w'], rec['h'] = im.size
            d2 = os.path.join(OUT, 'covers'); os.makedirs(d2, exist_ok=True); im2 = im.convert('RGB'); im2.thumbnail((600, 1000)); im2.save(os.path.join(d2, 'pokemon-scarlet-bulba.jpg'), quality=88)
        except Exception as e: rec['err'] = str(e)[:80]
        out.setdefault('game:Pokémon Scarlet', []).append(rec); items.append(('Pokemon Scarlet | ' + rec['label'][:24], u if 'err' not in rec else ''))
    try:
        d = json.loads(braw('https://pokemon.fandom.com/api.php?action=query&format=json&generator=search&gsrnamespace=6&gsrlimit=12&gsrsearch=' + urllib.parse.quote('Scarlet boxart') + '&prop=imageinfo&iiprop=url|size').decode())
        for pg in (d.get('query') or {}).get('pages', {}).values():
            ii = (pg.get('imageinfo') or [{}])[0]
            if ii.get('url') and (ii.get('height') or 0) > (ii.get('width') or 0): add('game:Pokémon Scarlet', 'fandom ' + pg.get('title', '')[5:27], ii['url'])
    except Exception as e: out.setdefault('game:Pokémon Scarlet', []).append({'label': 'fandom', 'err': str(e)[:80]})
    try:
        html = braw('https://www.nintendo.com/us/store/products/pokemon-scarlet-switch/').decode('utf-8', 'ignore')
        seen = []
        for u in re.findall(r'https://assets\.nintendo\.com/image/upload/[^"\\ ]+', html):
            base = u.split('/upload/')[1]
            if 'store/software' in u or 'ncom/software' in u:
                pid = re.sub(r'^.*?((?:ncom|store)/software/[^"?]+)$', r'\1', u)
                if pid not in seen: seen.append(pid)
        for pid in seen[:5]: add('game:Pokémon Scarlet', 'nintendo ' + pid[-18:], 'https://assets.nintendo.com/image/upload/f_auto/q_auto/c_fill,w_600/' + pid)
        out.setdefault('game:Pokémon Scarlet', []).append({'label': 'nintendo page', 'ids': seen[:8], 'og': re.findall(r'property="og:image" content="([^"]+)"', html)[:2]})
    except Exception as e: out.setdefault('game:Pokémon Scarlet', []).append({'label': 'nintendo', 'err': str(e)[:80]})
    save('hunt.json', out); sheet(items, 'hunt.jpg', cols=6, w=180, h=270, fit=True)

if __name__ == '__main__':
    todo = sys.argv[1:] or ['apply', 'hunt']
    for name in todo:
        try: {'imdb': imdb, 'tvmaze': tvmaze, 'posters': posters, 'superman': superman, 'fix': fix, 'wikibox': wikibox, 'anime': anime, 'steam': steam, 'pkmn': pkmn, 'wikiraw': wikiraw, 'imdb2': imdb2, 'books': books, 'links': links, 'apply': apply, 'hunt': hunt}[name]()
        except Exception: log('FAILED', name); traceback.print_exc()

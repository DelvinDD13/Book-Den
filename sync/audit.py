"""Accuracy audit helper for Book Den. Runs on GitHub (the build sandbox cannot reach these hosts).
Gathers, for every show in sync/titles.json: IMDb's own dataset rows (type, years, genres, rating, votes, seasons, episodes)
and TVmaze's record; makes contact sheets of the posters now in the store so they can be checked by eye; lists Wikipedia
page-image candidates for each game; and collects public-domain Fleischer Superman stills from Wikimedia Commons with
their licence text. Everything lands in audit/ for review. The only rows this script may write are cover rows (cv:...),
through cover_rows_post(); unstray() is the one exception and touches only rows this script itself wrote by mistake."""
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
# ---------------- the store: the only functions in this file that touch his sheet ----------------
COVER_FIELDS = {'url', 'src', 'via', 'at', 'w', 'h'}
BLANK = 'removed'   # not JSON on purpose: every copy of the app skips a row it cannot read, and keeps what the phone holds
def store_get(): return (get(STORE + '?key=' + urllib.parse.quote(KEY), 120).get('v') or {})
def store_post(rows):
    wrote = 0; keys = list(rows)
    for n in range(0, len(keys), 40):
        body = json.dumps({'key': KEY, 'v': {k: rows[k] for k in keys[n:n + 40]}}).encode()
        r = json.loads(urllib.request.urlopen(urllib.request.Request(STORE, data=body, headers={'Content-Type': 'text/plain'}), timeout=120).read().decode())
        wrote += int(r.get('wrote') or 0); log('posted', len(keys[n:n + 40]), r.get('wrote'))
    return wrote
def cover_rows_post(rows):
    """Cover rows only. A row whose name does not start with cv: is his own (a status, a rating, a note) and is never written here."""
    bad = [k for k in rows if not k.startswith('cv:')]
    if bad: raise ValueError('refusing to write %d row(s) that are not covers, e.g. %r' % (len(bad), bad[0]))
    return store_post(rows)
def cvkey(k):
    """Names in sync/poster_apply.json -> the row the app reads the picture from."""
    if k.startswith('show:') or k.startswith('game:'): return 'cv:' + k
    if k.startswith('book:'): return 'cv:' + k[5:]
    raise ValueError('poster_apply.json: %r is not show:, game: or book:' % k)
def parsed(cur, k):
    e = cur.get(k)
    if not e: return None
    try: return json.loads(e['j'])
    except Exception: return 'unreadable'

def unstray():
    """The first two apply() runs wrote the checked posters to show:<title> and game:<title>. Those names are his own rows for
    that title (status, rating, dates, notes), not cover rows. This finds the rows this job wrote there and blanks them, so no
    copy of the app can take a poster record for his data. Only rows that are provably this job's own are touched: src 'audit',
    a url, and no field outside a cover record. Counts only are reported; nothing of his is printed or saved."""
    AP = json.load(open(os.path.join(HERE, 'poster_apply.json'))); cur = store_get(); now = int(time.time() * 1000)
    names = [k for k in AP if k.startswith('show:') or k.startswith('game:')]
    rep = {'checked': len(names), 'absent': 0, 'ours': 0, 'already_blank': 0, 'not_ours': 0, 'not_ours_fields': [], 'ours_written_between': None}
    mine = {}; us = []
    for k in names:
        o = parsed(cur, k)
        if o is None: rep['absent'] += 1
        elif o == 'unreadable' or o is None or not isinstance(o, dict): rep['already_blank'] += 1
        elif o.get('src') == 'audit' and o.get('url') and set(o) <= COVER_FIELDS:
            rep['ours'] += 1; mine[k] = {'u': now, 'j': BLANK}; us.append(int(cur[k].get('u') or 0))
        else:
            rep['not_ours'] += 1; rep['not_ours_fields'] = sorted(set(rep['not_ours_fields']) | set(o))
    if us: rep['ours_written_between'] = [time.strftime('%Y-%m-%d %H:%M:%S UTC', time.gmtime(min(us) / 1000)), time.strftime('%Y-%m-%d %H:%M:%S UTC', time.gmtime(max(us) / 1000))]
    # how much these rows are used at all: every other show:/game: row in the store, counted, field names only
    other = [k for k in cur if (k.startswith('show:') or k.startswith('game:')) and k not in names]
    fields = {}
    for k in other:
        o = parsed(cur, k)
        for f in (o if isinstance(o, dict) else []): fields[f] = fields.get(f, 0) + 1
    rep['other_show_game_rows'] = len(other); rep['other_fields'] = fields; rep['store_rows'] = len(cur)
    rep['wrote'] = store_post(mine) if mine else 0     # allow-list: exactly the rows proven above to be this job's own
    back = store_get(); left = [k for k in mine if (back.get(k) or {}).get('j') != BLANK]
    if left:   # the store would not take plain text: fall back to JSON null, which the app's row check also drops
        store_post({k: {'u': int(time.time() * 1000), 'j': 'null'} for k in left}); back = store_get(); rep['fallback_null'] = len(left)
    rep['blank_now'] = sum(1 for k in mine if (back.get(k) or {}).get('j') in (BLANK, 'null'))
    save('unstray.json', rep); log('unstray', json.dumps(rep))

def apply():
    """Write the pictures in sync/poster_apply.json to the store, each under its cover row (cv:show:, cv:game:, cv:<book>).
    Every one was looked at first; each is downloaded again here and measured, and only what loads is written. src is 'audit'
    so later cover jobs leave these rows alone. A row that already holds the same picture is left as it is. The store is read
    back afterwards and every row compared."""
    AP = json.load(open(os.path.join(HERE, 'poster_apply.json'))); cur = store_get(); rows = {}; rep = {}; now = int(time.time() * 1000)
    for k, v in AP.items():
        ck = cvkey(k); u = v['url']; old = parsed(cur, ck)
        if isinstance(old, dict) and old.get('url') == u and old.get('src') == 'audit': rep[k] = ['kept', u]; continue
        try:
            b = wget(u) if 'wikimedia' in u else raw(u, 40); im = Image.open(io.BytesIO(b)); w, h = im.size
            if w < 150: raise ValueError('only %d px wide' % w)
            rows[ck] = {'u': now, 'j': json.dumps({'url': u, 'src': 'audit', 'via': v.get('from'), 'at': now, 'w': w, 'h': h})}; rep[k] = [u, w, h]
        except Exception as e: rep[k] = ['ERR ' + str(e)[:90], u]
    wrote = cover_rows_post(rows) if rows else 0
    back = store_get(); good = []; wrong = []
    for k, v in AP.items():
        o = parsed(back, cvkey(k)); (good if isinstance(o, dict) and o.get('url') == v['url'] else wrong).append(k)
    save('applied.json', {'wrote': wrote, 'in_store_now': len(good), 'not_in_store': wrong, 'rows': rep})
    log('apply: wrote', wrote, 'of', len(AP), '| in the store now', len(good), '| missing', len(wrong), '| errors', len([1 for v in rep.values() if str(v[0]).startswith('ERR')]))

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

# ---------------------------------------------------------------- fifth pass: his Audible titles against Audible's own catalogue
def audible(src='audible_titles.json', dst='audible.json'):
    """Author, narrator, length and cover from Audible's public catalogue for each row of sync/<src>:
    [title, author, narrator, series, runtime, search title (optional)]. A match needs the same title (with or without its
    subtitle); a narrator or author the app already has breaks ties. When the title search has no exact match the full
    title is also tried as keywords."""
    L = json.load(open(os.path.join(HERE, src))); out = {}; H = dict(UA, **{'Accept': 'application/json'})
    def q(params):
        u = 'https://api.audible.com/1.0/catalog/products?num_results=12&products_sort_by=Relevance&response_groups=contributors,product_desc,product_attrs,media,rating,series&image_sizes=500,1024&' + urllib.parse.urlencode(params)
        for a in range(3):
            try: return json.loads(urllib.request.urlopen(urllib.request.Request(u, headers=H), timeout=40).read().decode()).get('products') or []
            except urllib.error.HTTPError as e:
                if e.code in (429, 503): time.sleep(8 * (a + 1)); continue
                raise
        return []
    def names(x): return [n.get('name', '') for n in (x or [])]
    def brief(p):
        return {'asin': p.get('asin'), 'title': p.get('title'), 'subtitle': p.get('subtitle'), 'authors': names(p.get('authors')), 'narrators': names(p.get('narrators')), 'min': p.get('runtime_length_min'), 'released': p.get('release_date'), 'lang': p.get('language'), 'fmt': p.get('format_type'), 'series': [[x.get('title'), x.get('sequence')] for x in (p.get('series') or [])], 'img': (p.get('product_images') or {}).get('1024') or (p.get('product_images') or {}).get('500'), 'ratings': ((p.get('rating') or {}).get('overall_distribution') or {}).get('num_ratings')}
    def last(n): return norm(n).split(' ')[-1] if n else ''
    n_ok = 0
    for i, row in enumerate(L):
        t, author, narr, series, rt = row[:5]; qt = (row[5] if len(row) > 5 else None) or t
        main = re.sub(r'\s*[\(\[][^\)\]]*[\)\]]\s*$', '', qt).split(':')[0].strip(); a1 = author.split(',')[0].split('&')[0].strip() if author else ''
        nt = norm(qt)
        def rank(P):
            C = []
            for p in P:
                if (p.get('language') or 'english') != 'english': continue
                full = norm('%s %s' % (p.get('title') or '', p.get('subtitle') or '')); tt = norm(p.get('title') or '')
                how = 'exact' if nt in (full, tt) else 'main' if norm(main) == tt else 'starts' if (nt.startswith(tt + ' ') or tt.startswith(norm(main) + ' ')) else None
                if not how: continue
                sc = {'exact': 30, 'main': 20, 'starts': 8}[how]
                if author and any(last(a) and last(a) == last(a1) for a in names(p.get('authors'))): sc += 10
                if narr and any(last(x) and last(x) in norm(narr) for x in names(p.get('narrators'))): sc += 12
                sc += min(6, (((p.get('rating') or {}).get('overall_distribution') or {}).get('num_ratings') or 0) ** 0.5 / 40)
                C.append((sc, how, p))
            return C
        try:
            P = q({'title': main, 'author': a1}) if a1 else q({'title': main})
            if not P and a1: P = q({'title': main})
            C = rank(P)
            if not any(c[1] == 'exact' for c in C):
                time.sleep(0.25); P2 = q({'keywords': (qt + ' ' + a1).strip()}); seen = {p.get('asin') for p in P}
                P = P + [p for p in P2 if p.get('asin') not in seen]; C = rank(P)
        except Exception as e: out[t] = {'err': str(e)[:100]}; continue
        C.sort(key=lambda c: -c[0])
        if C:
            b = brief(C[0][2]); b['how'] = C[0][1]; b['score'] = round(C[0][0], 1); b['others'] = [[x[1], (x[2].get('title') or '')[:50], names(x[2].get('authors'))[:2], names(x[2].get('narrators'))[:2], x[2].get('runtime_length_min'), (x[2].get('product_images') or {}).get('1024')] for x in C[1:5]]
            out[t] = b; n_ok += 1
        else: out[t] = {'miss': 1, 'saw': [[(p.get('title') or '')[:50], names(p.get('authors'))[:2]] for p in P[:5]]}
        if i % 40 == 0: log('audible', src, i, n_ok)
        time.sleep(0.25)
    save(dst, out); log('audible matched', n_ok, 'of', len(L), '->', dst)
def audible2(): audible('audible_titles2.json', 'audible2.json')

def summaries():
    """The publisher's own summary for each title in sync/summary_titles.json ([title, ASIN or null, author]), from Audible's
    public catalogue. Used to check the app's one-line synopses against what the book says it is. Nothing is written."""
    import html
    L = json.load(open(os.path.join(HERE, 'summary_titles.json'))); out = {}; H = dict(UA, **{'Accept': 'application/json'})
    def call(u):
        for n in range(3):
            try: return json.loads(urllib.request.urlopen(urllib.request.Request(u, headers=H), timeout=40).read().decode())
            except urllib.error.HTTPError as e:
                if e.code in (429, 503): time.sleep(8 * (n + 1)); continue
                raise
        return {}
    def tidy(x): return html.unescape(re.sub(r'\s+', ' ', re.sub(r'<[^>]+>', ' ', x or ''))).strip()
    def brief(p): return {'asin': p.get('asin'), 'title': p.get('title'), 'subtitle': p.get('subtitle'), 'authors': [n.get('name', '') for n in (p.get('authors') or [])], 'series': [[x.get('title'), x.get('sequence')] for x in (p.get('series') or [])], 'released': p.get('release_date'), 'sum': tidy(p.get('publisher_summary') or p.get('merchandising_summary') or p.get('extended_product_description'))[:1100]}
    RG = 'response_groups=product_desc,product_extended_attrs,contributors,series,product_attrs'; keys = {}
    for i, (t, asin, author) in enumerate(L):
        try:
            if asin:
                pr = call('https://api.audible.com/1.0/catalog/products/%s?%s' % (asin, RG)).get('product') or {}; out[t] = brief(pr)
                for k in pr: keys[k] = keys.get(k, 0) + 1
            else:
                main = re.sub(r'\s*[\(\[][^\)\]]*[\)\]]\s*$', '', t).split(':')[0].strip(); a1 = author.split(',')[0].split('&')[0].strip() if author else ''
                P = call('https://api.audible.com/1.0/catalog/products?num_results=8&products_sort_by=Relevance&%s&%s' % (RG, urllib.parse.urlencode({'title': main, 'author': a1} if a1 else {'title': main}))).get('products') or []
                ok = [p for p in P if (p.get('language') or 'english') == 'english' and norm(p.get('title') or '') == norm(main)]
                out[t] = dict(brief(ok[0]), how='searched') if ok else {'miss': 1, 'saw': [(p.get('title') or '')[:50] for p in P[:4]]}
        except Exception as e: out[t] = {'err': str(e)[:100]}
        if i % 50 == 0: log('summaries', i)
        time.sleep(0.2)
    out['__fields'] = keys; save('summaries.json', out); log('summaries', len(out), 'with text', sum(1 for v in out.values() if isinstance(v, dict) and v.get('sum')), 'fields', sorted(keys))

def live():
    """Is the build in this commit the one the public page serves? Polls the live page until its build number matches index.html."""
    want = re.search(r'DEN_BUILD="(\d{12})"', open(os.path.join(HERE, '..', 'index.html')).read()).group(1); got = None; n = 0
    for n in range(1, 19):
        try:
            h = urllib.request.urlopen(urllib.request.Request('https://delvindd13.github.io/Book-Den/?t=%d' % time.time(), headers=dict(UA, **{'Cache-Control': 'no-cache'})), timeout=40).read().decode('utf-8', 'replace')
            m = re.search(r'DEN_BUILD="(\d{12})"', h); got = m.group(1) if m else None
            if got == want: break
        except Exception as e: got = 'ERR ' + str(e)[:60]
        time.sleep(20)
    save('live.json', {'expected': want, 'live': got, 'same': got == want, 'tries': n, 'has_L42': ('// ===== L42' in h) if got == want else None, 'bytes': len(h) if got == want else None})
    log('live', want, got, got == want)

BOOKFIX = [('The Games Gods Play', 'Abigail Owen'), ('Generations: A Memoir', 'Lucille Clifton'), ('The Midnight Library', 'Matt Haig'), ('Sherlock Holmes: The Definitive Collection', 'Arthur Conan Doyle'), ('The Daily Stoic: 366 Meditations on Wisdom, Perseverance, and the Art of Living', 'Ryan Holiday'), ('Percy Jackson and the Olympians: The Chalice of the Gods', 'Rick Riordan'), ('Gild: The Plated Prisoner Series, Book 1', 'Raven Kennedy'), ('Gleam: The Plated Prisoner Series, Book 3', 'Raven Kennedy'), ('Glow: The Plated Prisoner Series, Book 4', 'Raven Kennedy'), ('Goldfinch: The Plated Prisoner Series, Book 6', 'Raven Kennedy'), ('The Poison Daughter', 'Sheila Masterson'), ('Arcanum Unbounded: The Cosmere Collection', 'Brandon Sanderson'), ('Air Awakens: The Complete Series', 'Elise Kova'), ('Reminders of Him', 'Colleen Hoover'), ('Yellow face', 'R. F. Kuang'), ('The Keeper Chronicles: The Complete Trilogy', 'JA Andrews'), ('Return to Honor', ''), ('The Titan’s Curse', 'Rick Riordan'), ('Sixth of the Dusk', 'Brandon Sanderson'), ('Giovanni’s Room', 'James Baldwin'), ('I Am a Cat', 'Soseki Natsume'), ('The Sundering', 'John Gwynne'), ('Legends of Sleeping Dragons', ''), ('The Amber Spyglass', 'Philip Pullman')]
def bookfix():
    """Cover candidates for the books whose stored cover is the wrong book, a foreign edition, or missing. Candidates only."""
    out = {}; items = []
    for t, a in BOOKFIX:
        main = re.sub(r'\s*[\(\[][^\)\]]*[\)\]]\s*$', '', t).split(':')[0].strip(); out[t] = []
        for media, entity, key in (('ebook', 'ebook', 'trackName'), ('audiobook', 'audiobook', 'collectionName')):
            try:
                d = get('https://itunes.apple.com/search?country=us&lang=en_us&limit=10&media=%s&entity=%s&term=%s' % (media, entity, urllib.parse.quote((main + ' ' + a).strip())), 30)
                for m in d.get('results', [])[:6]:
                    nm = m.get(key) or ''; art = m.get('artworkUrl100')
                    if not art or not norm(nm).startswith(norm(main)[:12]): continue
                    if a and norm(a).split(' ')[-1] not in norm(m.get('artistName') or ''): continue
                    u = re.sub(r'/[0-9]+x[0-9]+[a-z]*(-[0-9]+)?\.(jpg|png|webp)$', '/600x900bb.jpg', art)
                    out[t].append({'src': 'apple-' + media, 'name': nm, 'by': m.get('artistName'), 'url': u}); items.append(('%s | %s %s' % (t[:20], media[:5], (m.get('artistName') or '')[:14]), u))
            except Exception as e: out[t].append({'src': media, 'err': str(e)[:80]})
            time.sleep(3.2)
        while len(items) % 8: items.append(('', ''))
    save('bookfix.json', out); sheet(items, 'bookfix.jpg', cols=8, w=140, h=210, fit=True)

BOOKFIX2 = [('Yellow face', 'Yellowface', 'R. F. Kuang'), ('Percy Jackson and the Olympians: The Chalice of the Gods', 'The Chalice of the Gods', 'Rick Riordan'), ('The Amber Spyglass', 'The Amber Spyglass', 'Philip Pullman'), ('The Poison Daughter', 'The Poison Daughter', 'Sheila Masterson'), ('Reminders of Him', 'Reminders of Him', 'Colleen Hoover'), ('Stardust', 'Stardust', 'Neil Gaiman'), ('Sixth of the Dusk', 'Sixth of the Dusk', 'Brandon Sanderson'), ('The Sundering', 'The Sundering', 'John Gwynne'), ('Shōgun, Part One', 'Shogun', 'James Clavell'), ("The Handmaid's Tale: Special Edition", "The Handmaid's Tale", 'Margaret Atwood'), ('A Poetry Handbook', 'A Poetry Handbook', 'Mary Oliver'), ('Doctor Strange: The Fate of Dreams', 'Doctor Strange: The Fate of Dreams', ''), ('Legends of Sleeping Dragons', 'Legends of Sleeping Dragons', ''), ('DSM-5-TR Diagnostic and Statistical Manual of Mental Disorders', 'DSM-5-TR', '')]
def bookfix2(lst=None, name='bookfix2'):
    """Cover candidates: (title in the app, what to search for, author). Candidates only; nothing is written."""
    out = {}; items = []
    for t, qt, a in (lst or BOOKFIX2):
        out[t] = []
        for media, entity, key in (('ebook', 'ebook', 'trackName'), ('audiobook', 'audiobook', 'collectionName')):
            try:
                d = get('https://itunes.apple.com/search?country=us&lang=en_us&limit=12&media=%s&entity=%s&term=%s' % (media, entity, urllib.parse.quote((qt + ' ' + a).strip())), 30)
                for m in d.get('results', [])[:8]:
                    nm = m.get(key) or ''; art = m.get('artworkUrl100')
                    if not art or norm(qt)[:10] not in norm(nm): continue
                    if a and norm(a).split(' ')[-1] not in norm(m.get('artistName') or ''): continue
                    u = re.sub(r'/[0-9]+x[0-9]+[a-z]*(-[0-9]+)?\.(jpg|png|webp)$', '/600x900bb.jpg', art)
                    out[t].append({'src': 'apple-' + media, 'name': nm, 'by': m.get('artistName'), 'url': u}); items.append(('%s | %s %s' % (t[:20], media[:5], (m.get('artistName') or '')[:14]), u))
            except Exception as e: out[t].append({'src': media, 'err': str(e)[:80]})
            time.sleep(3.2)
        while len(items) % 8: items.append(('', ''))
    save(name + '.json', out); sheet(items, name + '.jpg', cols=8, w=140, h=210, fit=True)

BOOKFIX3 = [('A Shadow in the Ember', 'A Shadow in the Ember', 'Jennifer L. Armentrout'), ('Ariel', 'Ariel', 'Sylvia Plath'), ('Legends of Sleeping Dragons', 'Legends of Sleeping Dragons', ''), ('The Justice of One', 'The Justice of One', 'James Islington'), ('The Sundering', 'The Sundering', 'John Gwynne'), ('THINGS WE DON’T TALK ABOUT', 'Things We Don’t Talk About', 'Pandora Owl'), ('Visiting Her in Queens Is More Enlightening than a Month in a Monastery in Tibet', 'Visiting Her in Queens', 'Michael J. Mark'), ('What I Wish I Said To You', 'What I Wish I Said To You', 'Isaac Paredes'), ('Cyclopsean Kingdom: Dungeon Crawler Carl, Book 3.5', 'Cyclopsean Kingdom', 'Matt Dinniman'), ('Sixth of the Dusk', 'Sixth of the Dusk', 'Brandon Sanderson')]
def bookfix3(): bookfix2(BOOKFIX3, 'bookfix3')
SUPERMAN2 = ['File:Superman escapes from Krypton.jpg', 'File:This looks like a job for Superman.jpg', 'File:Superman saves Lois.jpg', 'File:Superman saves Lois again.jpg', 'File:Clark in a phone booth.jpg', 'File:Mechanical monster.jpg', 'File:Shadow of a kidnapping.jpg', 'File:A policeman opens fire.jpg', 'File:Superman Fleischer logo.png']
def superman2():
    """The Fleischer Superman stills the first pass could not fetch (Commons said too many requests): named files, one at a time,
    with the licence Commons records. Public domain only. Candidates for the Steel masthead; nothing is written to the store."""
    d = os.path.join(OUT, 'superman2'); os.makedirs(d, exist_ok=True); out = []; extra = []
    try:
        r = get('https://commons.wikimedia.org/w/api.php?action=query&format=json&generator=search&gsrnamespace=6&gsrlimit=30&gsrsearch=%s&prop=info' % urllib.parse.quote('Fleischer Superman flying'), 40)
        extra = [p.get('title') for p in (r.get('query') or {}).get('pages', {}).values() if p.get('title')]
    except Exception as e: log('superman2 search', e)
    names = SUPERMAN2 + [t for t in extra if t not in SUPERMAN2][:12]
    for i, t in enumerate(names):
        try:
            time.sleep(2.5)
            r = get('https://commons.wikimedia.org/w/api.php?action=query&format=json&titles=%s&prop=imageinfo&iiprop=url|size|extmetadata|mime&iiurlwidth=1400' % urllib.parse.quote(t), 40)
            pg = list((r.get('query') or {}).get('pages', {}).values())[0]; ii = (pg.get('imageinfo') or [{}])[0]; em = ii.get('extmetadata') or {}
            lic = (em.get('LicenseShortName') or {}).get('value') or ''; use = re.sub('<[^>]+>', '', (em.get('UsageTerms') or {}).get('value') or '')
            m = {'title': t, 'page': ii.get('descriptionurl'), 'url': ii.get('url'), 'w': ii.get('width'), 'h': ii.get('height'), 'license': lic, 'usage': use, 'artist': re.sub('<[^>]+>', '', (em.get('Artist') or {}).get('value') or '')[:120], 'desc': re.sub('<[^>]+>', '', (em.get('ImageDescription') or {}).get('value') or '')[:200]}
            if not re.search(r'public domain|^pd', lic + ' ' + use, re.I) or ii.get('mime') not in ('image/jpeg', 'image/png'): m['skip'] = 'licence or type'; out.append(m); continue
            b = wget(ii.get('thumburl') if (ii.get('width') or 0) > 1400 else ii.get('url')); im = Image.open(io.BytesIO(b)).convert('RGB'); fn = 'sm_%02d.jpg' % i; im.save(os.path.join(d, fn), quality=92); m['file'] = fn; m['got'] = list(im.size)
        except Exception as e: m = {'title': t, 'err': str(e)[:90]}
        out.append(m)
    save('superman2.json', out); log('superman2', len([m for m in out if m.get('file')]), 'of', len(names))
    got = [m for m in out if m.get('file')]; cols, w, h = 3, 340, 240; rows = max(1, (len(got) + cols - 1) // cols); img = Image.new('RGB', (cols * (w + 8) + 8, rows * (h + 30) + 8), (18, 18, 20)); dr = ImageDraw.Draw(img); f = font(11)
    for i, m in enumerate(got):
        x = 8 + (i % cols) * (w + 8); y = 8 + (i // cols) * (h + 30); im = Image.open(os.path.join(d, m['file'])); im.thumbnail((w, h)); img.paste(im, (x + (w - im.width) // 2, y)); dr.text((x, y + h + 4), (m['file'] + ' ' + m['title'][5:45])[:56], fill=(240, 240, 240), font=f)
    img.save(os.path.join(OUT, 'superman2.jpg'), quality=85)

ERAS = [('sm', 'Superman costume museum'), ('sm', 'Superman costume exhibition'), ('sm', 'Christopher Reeve Superman costume'), ('sm', 'Superman Returns costume'), ('sm', 'Man of Steel costume'), ('sm', 'Superman suit display'), ('sm', 'Superman logo'), ('sm', 'Superman emblem'), ('sm', 'Superman statue'), ('sm', 'Superman 2025'), ('sm', 'Smallville Superman'), ('sm', 'Famous Studios Superman'), ('sm', 'Superman cosplay'),
        ('bat', 'Batmobile 1966'), ('bat', 'Batmobile 1989'), ('bat', 'Tumbler Batmobile'), ('bat', 'Batmobile 2022'), ('bat', 'Batman costume exhibition'), ('bat', 'Batsuit'), ('bat', 'Batman logo'), ('bat', 'Bat-Signal'), ('bat', 'Batman 1943 serial'), ('bat', 'Batman statue'), ('bat', 'Batman cosplay')]
def eras():
    """Openly licensed pictures for the Steel era looks and a Batman look: Commons files found by search, kept only when Commons
    records public domain, CC0, CC BY or CC BY-SA. Contact sheets for choosing by eye; nothing is written to the store."""
    d = os.path.join(OUT, 'eras'); os.makedirs(d, exist_ok=True); out = []; seen = set()
    for qi, (g, q) in enumerate(ERAS):
        try:
            time.sleep(1.2)
            r = get('https://commons.wikimedia.org/w/api.php?action=query&format=json&generator=search&gsrnamespace=6&gsrlimit=14&gsrsearch=%s&prop=imageinfo&iiprop=url|size|extmetadata|mime&iiurlwidth=700' % urllib.parse.quote(q), 40)
        except Exception as e: log('eras search', q, e); continue
        n = 0
        for p in sorted((r.get('query') or {}).get('pages', {}).values(), key=lambda p: p.get('index', 0)):
            ii = (p.get('imageinfo') or [{}])[0]; t = p.get('title', '')
            if t in seen or ii.get('mime') not in ('image/jpeg', 'image/png'): continue
            seen.add(t); em = ii.get('extmetadata') or {}
            lic = (em.get('LicenseShortName') or {}).get('value') or ''; use = re.sub('<[^>]+>', '', (em.get('UsageTerms') or {}).get('value') or '')
            m = {'g': g, 'q': q, 'id': '%s%d.%d' % (g[0], qi, n), 'title': t, 'page': ii.get('descriptionurl'), 'url': ii.get('url'), 'thumb': ii.get('thumburl'), 'w': ii.get('width'), 'h': ii.get('height'), 'license': lic, 'usage': use,
                 'artist': re.sub('<[^>]+>', '', (em.get('Artist') or {}).get('value') or '')[:120], 'date': re.sub('<[^>]+>', '', (em.get('DateTimeOriginal') or {}).get('value') or '')[:40], 'desc': re.sub('<[^>]+>', '', (em.get('ImageDescription') or {}).get('value') or '')[:240]}
            if not re.search(r'public domain|^pd|cc0|cc[ -]by(?![ -]nc)', lic + ' ' + use, re.I) or re.search(r'fair use|non-free', lic + ' ' + use, re.I): m['skip'] = 'licence'; out.append(m); continue
            try:
                b = wget(m['thumb'] or m['url']); im = Image.open(io.BytesIO(b)).convert('RGB'); fn = m['id'] + '.jpg'; im.save(os.path.join(d, fn), quality=86); m['file'] = fn; m['got'] = list(im.size)
            except Exception as e: m['err'] = str(e)[:90]
            out.append(m); n += 1
            if n >= 10: break
    save('eras.json', out); log('eras', len([m for m in out if m.get('file')]), 'pictures of', len(out))
    for g in ('sm', 'bat'):
        got = [m for m in out if m.get('file') and m['g'] == g]; cols, w, h = 4, 230, 172
        for k in range(0, len(got), 24):
            part = got[k:k + 24]; rows = (len(part) + cols - 1) // cols; img = Image.new('RGB', (cols * (w + 8) + 8, rows * (h + 40) + 8), (18, 18, 20)); dr = ImageDraw.Draw(img); f = font(11)
            for i, m in enumerate(part):
                x = 8 + (i % cols) * (w + 8); y = 8 + (i // cols) * (h + 40); im = Image.open(os.path.join(d, m['file'])); im.thumbnail((w, h)); img.paste(im, (x + (w - im.width) // 2, y))
                dr.text((x, y + h + 3), (m['id'] + ' ' + (m['license'] or '?'))[:38], fill=(255, 210, 120), font=f); dr.text((x, y + h + 17), m['title'][5:43], fill=(240, 240, 240), font=f)
            img.save(os.path.join(OUT, 'eras_%s_%d.jpg' % (g, k // 24 + 1)), quality=82)

ERAS2_CATS = ['Category:Superman logos', 'Category:Superman symbols', 'Category:Batman logos', 'Category:Bat-Signal', 'Category:Batman symbols']
ERAS2_Q = ['Superman logo 19', 'Superman logo 20', 'Superman shield logo', 'Batman logo 19', 'Batman logo 20', 'Batman emblem', 'bat symbol Batman']
def eras2():
    """Era logos for the Steel looks: Commons category listings and searches, public domain / CC0 / CC BY / CC BY-SA only."""
    d = os.path.join(OUT, 'eras2'); os.makedirs(d, exist_ok=True); titles = []; out = []
    for c in ERAS2_CATS:
        try:
            time.sleep(1.0); r = get('https://commons.wikimedia.org/w/api.php?action=query&format=json&list=categorymembers&cmtype=file|subcat&cmlimit=80&cmtitle=%s' % urllib.parse.quote(c), 40)
            mem = (r.get('query') or {}).get('categorymembers', []); log('cat', c, len(mem))
            for x in mem:
                if x.get('ns') == 6: titles.append(x['title'])
                elif x.get('ns') == 14:
                    time.sleep(1.0); r2 = get('https://commons.wikimedia.org/w/api.php?action=query&format=json&list=categorymembers&cmtype=file&cmlimit=40&cmtitle=%s' % urllib.parse.quote(x['title']), 40)
                    titles += [y['title'] for y in (r2.get('query') or {}).get('categorymembers', [])]
        except Exception as e: log('cat', c, e)
    for q in ERAS2_Q:
        try:
            time.sleep(1.0); r = get('https://commons.wikimedia.org/w/api.php?action=query&format=json&list=search&srnamespace=6&srlimit=25&srsearch=%s' % urllib.parse.quote(q), 40)
            titles += [x['title'] for x in (r.get('query') or {}).get('search', [])]
        except Exception as e: log('search', q, e)
    seen = set(); titles = [t for t in titles if not (t in seen or seen.add(t))]; log('eras2 titles', len(titles))
    for i in range(0, len(titles), 40):
        part = titles[i:i + 40]
        try:
            time.sleep(1.2); r = get('https://commons.wikimedia.org/w/api.php?action=query&format=json&titles=%s&prop=imageinfo&iiprop=url|size|extmetadata|mime&iiurlwidth=500' % urllib.parse.quote('|'.join(part)), 60)
        except Exception as e: log('eras2 info', e); continue
        for p in (r.get('query') or {}).get('pages', {}).values():
            ii = (p.get('imageinfo') or [{}])[0]; em = ii.get('extmetadata') or {}; t = p.get('title', '')
            lic = (em.get('LicenseShortName') or {}).get('value') or ''; use = re.sub('<[^>]+>', '', (em.get('UsageTerms') or {}).get('value') or '')
            m = {'title': t, 'page': ii.get('descriptionurl'), 'url': ii.get('url'), 'thumb': ii.get('thumburl'), 'w': ii.get('width'), 'h': ii.get('height'), 'mime': ii.get('mime'), 'license': lic, 'usage': use, 'artist': re.sub('<[^>]+>', '', (em.get('Artist') or {}).get('value') or '')[:120], 'date': re.sub('<[^>]+>', '', (em.get('DateTimeOriginal') or {}).get('value') or '')[:40], 'desc': re.sub('<[^>]+>', '', (em.get('ImageDescription') or {}).get('value') or '')[:240]}
            if ii.get('mime') not in ('image/jpeg', 'image/png', 'image/svg+xml') or not re.search(r'public domain|^pd|cc0|cc[ -]by(?![ -]nc)', lic + ' ' + use, re.I): m['skip'] = 1; out.append(m); continue
            out.append(m)
    keep = [m for m in out if not m.get('skip')]
    for i, m in enumerate(keep[:90]):
        try:
            b = wget(m['thumb'] or m['url']); im = Image.open(io.BytesIO(b)); fn = 'g%02d.png' % i; im.save(os.path.join(d, fn)); m['file'] = fn
        except Exception as e: m['err'] = str(e)[:80]
    save('eras2.json', out); log('eras2', len([m for m in keep if m.get('file')]), 'of', len(out))
    got = [m for m in keep if m.get('file')]; cols, w, h = 5, 180, 140
    for k in range(0, len(got), 30):
        part = got[k:k + 30]; rows = (len(part) + cols - 1) // cols; img = Image.new('RGB', (cols * (w + 8) + 8, rows * (h + 40) + 8), (60, 60, 66)); dr = ImageDraw.Draw(img); f = font(11)
        for i, m in enumerate(part):
            x = 8 + (i % cols) * (w + 8); y = 8 + (i // cols) * (h + 40); im = Image.open(os.path.join(d, m['file'])).convert('RGBA'); im.thumbnail((w, h)); img.paste(im, (x + (w - im.width) // 2, y), im)
            dr.text((x, y + h + 3), (m['file'] + ' ' + (m['license'] or '?'))[:34], fill=(255, 210, 120), font=f); dr.text((x, y + h + 17), m['title'][5:36], fill=(240, 240, 240), font=f)
        img.save(os.path.join(OUT, 'eras2_%d.jpg' % (k // 30 + 1)), quality=85)

ERAS3 = ['File:Superman logo 1938.png', 'File:Superman logo 1941-43.png', 'File:Superman logo 1944.png', 'File:Superman black logo 2001-03.png', 'File:Superman logo 2011-16.png', 'File:Superman (2025) logo 2.png', 'File:Superman 2025 logo.png',
         'File:Credits for DC, Siegel & Shuster.jpg', 'File:Batman (20th Century Fox Television) red text logo.svg', 'File:Batman symbol.svg', 'File:BATMAN 1989.png', 'File:Batman 1989 Logo.png', 'File:Batman- The Animated Series logo.png',
         'File:Batman Begins logo.png', 'File:Batman logo (solid black silhouette).svg', 'File:Batman - Arkham Asylum logo.jpg', 'File:Batman - Arkham City logo.png', 'File:The Batman 2022 film logo.png']
def eras3():
    """The era emblems and titles chosen for the Steel looks, one named file at a time, at 1200 px (SVGs rendered by Commons)."""
    d = os.path.join(OUT, 'eras3'); os.makedirs(d, exist_ok=True); out = []
    for i, t in enumerate(ERAS3):
        try:
            time.sleep(2.0)
            r = get('https://commons.wikimedia.org/w/api.php?action=query&format=json&titles=%s&prop=imageinfo&iiprop=url|size|extmetadata|mime&iiurlwidth=1200' % urllib.parse.quote(t), 40)
            pg = list((r.get('query') or {}).get('pages', {}).values())[0]; ii = (pg.get('imageinfo') or [{}])[0]; em = ii.get('extmetadata') or {}
            lic = (em.get('LicenseShortName') or {}).get('value') or ''; use = re.sub('<[^>]+>', '', (em.get('UsageTerms') or {}).get('value') or '')
            m = {'title': t, 'page': ii.get('descriptionurl'), 'w': ii.get('width'), 'h': ii.get('height'), 'mime': ii.get('mime'), 'license': lic, 'usage': use, 'artist': re.sub('<[^>]+>', '', (em.get('Artist') or {}).get('value') or '')[:120]}
            if not re.search(r'public domain|^pd|cc0|cc[ -]by(?![ -]nc)', lic + ' ' + use, re.I): m['skip'] = 'licence'; out.append(m); continue
            src = ii.get('thumburl') if (ii.get('mime') == 'image/svg+xml' or (ii.get('width') or 0) > 1200) else ii.get('url')
            b = wget(src); im = Image.open(io.BytesIO(b)); fn = 'x%02d%s' % (i, '.jpg' if im.mode == 'RGB' and ii.get('mime') == 'image/jpeg' else '.png')
            (im.convert('RGB').save(os.path.join(d, fn), quality=92) if fn.endswith('.jpg') else im.save(os.path.join(d, fn))); m['file'] = fn; m['got'] = list(im.size); m['mode'] = im.mode
        except Exception as e: m = {'title': t, 'err': str(e)[:90]}
        out.append(m)
    save('eras3.json', out); log('eras3', len([m for m in out if m.get('file')]), 'of', len(ERAS3))

THEME_Q = [('storm', 'NOAA lightning'), ('storm', 'lightning thunderstorm night'), ('storm', 'shelf cloud storm'), ('storm', 'NOAA wall cloud'),
           ('ash', 'volcanic ash fall USGS'), ('ash', 'ash plume eruption USGS'), ('ash', 'red sun smoke sky'),
           ('mist', 'fog at night street lamp'), ('mist', 'night mist forest'),
           ('night', 'Milky Way National Park Service'), ('night', 'night sky stars mountains NPS'),
           ('fire', 'flames fire close up'), ('fire', 'bonfire flames night')]
def themes():
    """Real pictures for the series themes (lightning for Stormlight, ash and mist for Mistborn, a night sky for ACOTAR,
    fire for Throne of Glass): Commons files under public domain, CC0, CC BY or CC BY-SA, laid out on sheets. Nothing is written to the store."""
    d = os.path.join(OUT, 'themes'); os.makedirs(d, exist_ok=True); out = []; seen = set()
    for qi, (g, q) in enumerate(THEME_Q):
        try:
            time.sleep(1.2)
            r = get('https://commons.wikimedia.org/w/api.php?action=query&format=json&generator=search&gsrnamespace=6&gsrlimit=16&gsrsearch=%s&prop=imageinfo&iiprop=url|size|extmetadata|mime&iiurlwidth=900' % urllib.parse.quote(q + ' filetype:bitmap'), 40)
        except Exception as e: log('themes search', q, e); continue
        n = 0
        for p in sorted((r.get('query') or {}).get('pages', {}).values(), key=lambda p: p.get('index', 0)):
            ii = (p.get('imageinfo') or [{}])[0]; t = p.get('title', '')
            if t in seen or ii.get('mime') not in ('image/jpeg', 'image/png') or (ii.get('width') or 0) < 1200: continue
            seen.add(t); em = ii.get('extmetadata') or {}
            lic = (em.get('LicenseShortName') or {}).get('value') or ''; use = re.sub('<[^>]+>', '', (em.get('UsageTerms') or {}).get('value') or '')
            if not re.search(r'public domain|^pd|cc0|cc[ -]by(?![ -]nc)', lic + ' ' + use, re.I): continue
            m = {'g': g, 'q': q, 'id': '%s%d.%d' % (g, qi, n), 'title': t, 'page': ii.get('descriptionurl'), 'url': ii.get('url'), 'thumb': ii.get('thumburl'), 'w': ii.get('width'), 'h': ii.get('height'), 'license': lic,
                 'artist': re.sub('<[^>]+>', '', (em.get('Artist') or {}).get('value') or '')[:120], 'desc': re.sub('<[^>]+>', '', (em.get('ImageDescription') or {}).get('value') or '')[:200]}
            try:
                b = wget(m['thumb'] or m['url']); im = Image.open(io.BytesIO(b)).convert('RGB'); fn = m['id'] + '.jpg'; im.save(os.path.join(d, fn), quality=84); m['file'] = fn
            except Exception as e: m['err'] = str(e)[:90]
            out.append(m); n += 1
            if n >= 8: break
    save('themes.json', out); log('themes', len([m for m in out if m.get('file')]), 'pictures')
    for g in sorted(set(m['g'] for m in out)):
        got = [m for m in out if m.get('file') and m['g'] == g]; cols, w, h = 4, 230, 150
        if not got: continue
        rows = (len(got) + cols - 1) // cols; img = Image.new('RGB', (cols * (w + 8) + 8, rows * (h + 40) + 8), (18, 18, 20)); dr = ImageDraw.Draw(img); f = font(11)
        for i, m in enumerate(got):
            x = 8 + (i % cols) * (w + 8); y = 8 + (i // cols) * (h + 40); im = Image.open(os.path.join(d, m['file'])); im.thumbnail((w, h)); img.paste(im, (x + (w - im.width) // 2, y))
            dr.text((x, y + h + 3), (m['id'] + ' ' + (m['license'] or '?'))[:38], fill=(255, 210, 120), font=f); dr.text((x, y + h + 17), m['title'][5:43], fill=(240, 240, 240), font=f)
        img.save(os.path.join(OUT, 'themes_%s.jpg' % g), quality=82)

BIGCOV = ['The Way of Kings: Book One of the Stormlight Archive', 'Words of Radiance: Book Two of the Stormlight Archive', 'Oathbringer: Book Three of the Stormlight Archive', 'Rhythm of War', 'Wind and Truth',
          'Mistborn: The Final Empire', 'The Well of Ascension', 'The Hero of Ages', 'Throne of Glass: Throne of Glass, Book 1', 'Crown of Midnight: Throne of Glass, Book 2', 'Heir of Fire: Throne of Glass, Book 3',
          'Queen of Shadows', 'Empire of Storms', 'Tower of Dawn', 'Kingdom of Ash', 'Dungeon Crawler Carl', 'The Blade Itself']
def bigcov():
    """The stored covers of the series above at full size (Apple's image server sizes on request), for the theme mocks. Read-only."""
    d = os.path.join(OUT, 'bigcov'); os.makedirs(d, exist_ok=True); cur = (get(STORE + '?key=' + urllib.parse.quote(KEY), 120).get('v') or {}); out = []
    for i, t in enumerate(BIGCOV):
        try: u = json.loads(cur['cv:' + t]['j']).get('url') or ''
        except Exception: out.append({'t': t, 'err': 'no cover row'}); continue
        big = re.sub(r'/\d+x\d+(?:bb|sr|cc)?\.(?:jpg|jpeg|png|webp)$', '/1400x2100bb.jpg', u.split('?')[0]) if 'mzstatic' in u else u
        try:
            time.sleep(0.6); b = raw(big, 40); im = Image.open(io.BytesIO(b)).convert('RGB'); fn = 'c%02d.jpg' % i; im.save(os.path.join(d, fn), quality=90); out.append({'t': t, 'file': fn, 'size': list(im.size)})
        except Exception as e: out.append({'t': t, 'err': str(e)[:80]})
    save('bigcov.json', out); log('bigcov', len([o for o in out if o.get('file')]), 'of', len(BIGCOV))

def hunt2():
    """Pokemon Scarlet's own box art from IGDB's public page (its og:image is the cover)."""
    out = {}; items = []
    BR = {'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.5 Safari/605.1.15', 'Accept-Language': 'en-US,en;q=0.9', 'Accept': 'text/html,application/xhtml+xml'}
    for slug in ['pokemon-scarlet', 'pokemon-scarlet-and-violet']:
        try:
            html = urllib.request.urlopen(urllib.request.Request('https://www.igdb.com/games/' + slug, headers=BR), timeout=40).read().decode('utf-8', 'ignore')
            og = re.findall(r'property="og:image" content="([^"]+)"', html) + re.findall(r'(https://images\.igdb\.com/igdb/image/upload/t_cover_big[^"\\ ]+)', html)
            out[slug] = {'og': og[:4], 'title': (re.findall(r'<title>([^<]+)', html) or [''])[0][:80]}
            for u in og[:2]:
                u2 = re.sub(r'/t_[a-z0-9_]+/', '/t_cover_big_2x/', u if u.startswith('http') else 'https:' + u)
                try: im = Image.open(io.BytesIO(urllib.request.urlopen(urllib.request.Request(u2, headers=BR), timeout=40).read())); out[slug].setdefault('imgs', []).append([u2, im.width, im.height]); items.append(('igdb ' + slug[:22], u2))
                except Exception as e: out[slug].setdefault('imgs', []).append([u2, 'ERR ' + str(e)[:60]])
        except Exception as e: out[slug] = {'err': str(e)[:100]}
        time.sleep(1)
    # Nintendo's own key art, padded to a book-cover shape by its image service
    for nm, tr in [('nintendo pad', 'ar_2:3,c_pad,b_auto,w_600'), ('nintendo fill east', 'ar_2:3,c_fill,g_east,w_600'), ('nintendo fill auto', 'ar_2:3,c_fill,g_auto,w_600')]:
        u = 'https://assets.nintendo.com/image/upload/%s/store/software/switch/70010000053966/849c234de8df7265201d26d9d72f88eed3f32438d3dca12fc135beb4c3befc85' % tr
        try: im = Image.open(io.BytesIO(urllib.request.urlopen(urllib.request.Request(u, headers=BR), timeout=40).read())); out[nm] = [u, im.width, im.height]; items.append((nm, u))
        except Exception as e: out[nm] = [u, 'ERR ' + str(e)[:60]]
    save('hunt2.json', out); sheet(items, 'hunt2.jpg', cols=6, w=180, h=270, fit=True)


OCR_UNTIL = [0]
OWN_ART = {'Tress of the Emerald Sea: A Cosmere Novel', 'Yumi and the Nightmare Painter: A Cosmere Novel', 'The Fires of December'}
STOPW = set('a an the of and to in on for with at by from or is it as be my your our their his her its into book books series part volume vol edition novel complete collection unabridged dramatized adaptation recording anniversary original audible'.split())
GUIDEW = ['summary of', 'study guide', 'workbook', 'analysis of', 'conversation starters', 'trivia', 'quicklet', 'cliffsnotes', 'sparknotes', 'a guide to']
FOREIGNW = set('roman novela edizione edicion ausgabe tome und der die das les une des los las del della il di el et le la'.split())
def big(u):
    """the same picture at a size OCR can read"""
    u = str(u)
    if 'mzstatic.com' in u: return re.sub(r'/[0-9]+x[0-9]+[a-z]*(-[0-9]+)?\.(jpg|png|webp)$', '/600x900bb.jpg', u)
    if 'covers.openlibrary.org' in u: return re.sub(r'-[SML]\.jpg$', '-L.jpg', u)
    if 'books.google.com' in u: return re.sub(r'fife=w\d+', 'fife=w800', u)
    return u.split('?')[0] if 'wikimedia' in u else u
def twords(t):
    main = re.sub(r'\([^)]*\)|\[[^\]]*\]', ' ', t).split(':')[0]
    w = [x for x in norm(main).replace("'", '').split() if len(x) >= 3 and x not in STOPW]
    return w or [x for x in norm(main).split() if x][:2]
def near(w, words):
    if w in words: return True
    if len(w) < 5: return False
    for x in words:
        if abs(len(x) - len(w)) <= 1 and sum(1 for a, b in zip(x, w) if a != b) + abs(len(x) - len(w)) <= 1: return True
        if len(x) >= len(w) and w in x: return True
    return False
def coveraudit():
    """Every book cover the app can show, checked three ways: the picture is fetched and measured, the words printed on it
    are read with OCR and matched against the title and author, and every cover goes on a numbered contact sheet for
    checking by eye. Reads only: nothing is written to the store."""
    import base64
    from concurrent.futures import ThreadPoolExecutor
    try: import pytesseract
    except Exception: pytesseract = None
    cur = store_get(); html = open(os.path.join(HERE, '..', 'index.html'), encoding='utf-8').read()
    a = html.find('let ART = /*ART_START*/'); b = html.find('/*ART_END*/', a)
    ART = json.loads(html[a + len('let ART = /*ART_START*/'):b]) if a >= 0 and b > a else {}
    i = html.find('const COVERS = '); j = html.find('\n', i)
    try: COV = json.loads(html[i + len('const COVERS = '):j].strip().rstrip(';'))
    except Exception: COV = {}
    books = [(t, au) for t, au in T['books']]; have = set(t for t, _ in books)
    for k in sorted(cur):
        if k.startswith('cv:') and not k.startswith(('cv:show:', 'cv:game:')) and k[3:] not in have and k[3:] not in OWN_ART: books.append((k[3:], ''))
    books = [x for x in books if x[0] not in OWN_ART]
    def one(item):
        t, au = item; j = parsed(cur, 'cv:' + t); j = j if isinstance(j, dict) else {}
        url = j.get('url') if str(j.get('url') or '').startswith('https://') else None
        r = {'kind': 'none', 'src': j.get('src') or '', 'host': '', 'w': 0, 'h': 0, 'flags': [], 'ocr': '', 'title_hit': None, 'author_hit': None}
        img = None
        try:
            if url:
                r['kind'] = 'store'; r['host'] = urllib.parse.urlparse(url).netloc
                img = Image.open(io.BytesIO(raw(big(url), 40))).convert('RGB')
            elif ART.get(t) or (COV.get(t) or {}).get('cover_data'):
                r['kind'] = 'embedded'; d = ART.get(t) or COV[t]['cover_data']
                img = Image.open(io.BytesIO(base64.b64decode(d.split(',', 1)[1]))).convert('RGB')
        except Exception as e: r['kind'] = 'broken'; r['err'] = str(e)[:80]
        if img is not None:
            r['w'], r['h'] = img.size
            if img.width < 300: r['flags'].append('small')
            if abs(img.width - img.height) <= img.width * 0.06: r['flags'].append('square')
            if pytesseract and time.time() < OCR_UNTIL[0]:
                try:
                    g = img.convert('L'); k = 760.0 / g.height; g = g.resize((max(1, int(g.width * k)), 760))
                    txt = pytesseract.image_to_string(g, config='--psm 11', timeout=20)
                except Exception as e: txt = ''; r['flags'].append('ocr-error')
                n = norm(txt); words = set(n.replace("'", '').split()); r['ocr'] = ' '.join(n.split())[:160]
                tw = twords(t); r['title_hit'] = round(sum(1 for w in tw if near(w, words)) / max(1, len(tw)), 2)
                last = norm(au).split()[-1] if norm(au) else ''
                r['author_hit'] = (near(last, words) if last else None)
                if any(g2 in n for g2 in GUIDEW): r['flags'].append('guide-words')
                if len([w for w in words if w in FOREIGNW]) >= 2: r['flags'].append('foreign-words')
        else: r['flags'].append('no-picture')
        if img is not None and pytesseract and r['title_hit'] is None and 'ocr-error' not in r['flags']: r['flags'].append('not-read')
        return t, au, r, img
    OCR_UNTIL[0] = time.time() + 40 * 60   # reading words stops after 40 minutes; the sheets are still made for every cover
    res = []
    with ThreadPoolExecutor(6) as ex:
        for x in ex.map(one, books): res.append(x)
    res.sort(key=lambda x: norm(x[0]))
    out = {}; items = []
    for n, (t, au, r, img) in enumerate(res, 1):
        r['n'] = n; r['author'] = au; out[t] = r
        bad = r['kind'] in ('none', 'broken') or 'guide-words' in r['flags'] or 'foreign-words' in r['flags'] or (r['title_hit'] == 0 and r['author_hit'] is not True)
        mid = (not bad) and ((r['title_hit'] or 0) < 0.5 and not r['author_hit'])
        items.append((n, t, au, img, (230, 70, 70) if bad else (230, 170, 40) if mid else (70, 190, 110), r))
    save('cover_audit.json', out)
    def page(chunk, name, cols=6, w=150, h=225):
        lab = 46; rws = (len(chunk) + cols - 1) // cols; im = Image.new('RGB', (cols * (w + 10) + 10, rws * (h + lab + 10) + 10), (18, 18, 20)); d = ImageDraw.Draw(im); f = font(11); fb = font(13)
        for i, (n, t, au, img, col, r) in enumerate(chunk):
            x = 10 + (i % cols) * (w + 10); y = 10 + (i // cols) * (h + lab + 10)
            d.rectangle([x - 3, y - 3, x + w + 2, y + h + 2], outline=col, width=3)
            if img is not None:
                th = img.copy(); th.thumbnail((w, h)); im.paste(th, (x + (w - th.width) // 2, y + (h - th.height) // 2))
            else: d.text((x + 6, y + 26), r['kind'].upper(), fill=(255, 90, 90), font=fb)
            d.rectangle([x, y, x + 30, y + 16], fill=(0, 0, 0)); d.text((x + 3, y + 2), str(n), fill=(255, 255, 255), font=f)
            d.text((x, y + h + 4), t[:25], fill=(240, 240, 240), font=f); d.text((x, y + h + 17), t[25:50], fill=(240, 240, 240), font=f); d.text((x, y + h + 30), (au or '')[:25], fill=(150, 150, 150), font=f)
        im.save(os.path.join(OUT, name), quality=82); log('sheet', name, len(chunk))
    for k in range(0, len(items), 42): page(items[k:k + 42], 'cov_%02d.jpg' % (k // 42 + 1))
    flagged = [x for x in items if x[4] != (70, 190, 110)]
    for k in range(0, len(flagged), 20): page(flagged[k:k + 20], 'covflag_%02d.jpg' % (k // 20 + 1), cols=5, w=200, h=300)
    cnt = {}
    for t, r in out.items():
        cnt[r['kind']] = cnt.get(r['kind'], 0) + 1
        for fl in r['flags']: cnt['flag ' + fl] = cnt.get('flag ' + fl, 0) + 1
    cnt['flagged red or amber'] = len(flagged); cnt['ocr'] = bool(pytesseract); save('cover_audit_counts.json', cnt); log('coveraudit', cnt)

if __name__ == '__main__':
    todo = sys.argv[1:] or ['unstray', 'apply', 'live']   # unstray first, every run: no poster record may sit in a show: or game: row
    if todo[0] != 'unstray': todo = ['unstray'] + [x for x in todo if x != 'unstray']
    for name in todo:
        try: {'imdb': imdb, 'tvmaze': tvmaze, 'posters': posters, 'superman': superman, 'fix': fix, 'wikibox': wikibox, 'anime': anime, 'steam': steam, 'pkmn': pkmn, 'wikiraw': wikiraw, 'bookfix3': bookfix3, 'superman2': superman2, 'eras': eras, 'eras2': eras2, 'eras3': eras3, 'themes': themes, 'bigcov': bigcov, 'imdb2': imdb2, 'books': books, 'links': links, 'apply': apply, 'hunt': hunt, 'audible': audible, 'bookfix': bookfix, 'hunt2': hunt2, 'unstray': unstray, 'audible2': audible2, 'bookfix2': bookfix2, 'summaries': summaries, 'live': live, 'coveraudit': coveraudit}[name]()
        except Exception: log('FAILED', name); traceback.print_exc()

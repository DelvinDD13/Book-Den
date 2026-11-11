"""Art finder for the Steel header. Runs on GitHub (the build sandbox cannot reach these hosts).
The 1941-43 Fleischer / Famous Studios Superman cartoons are in the public domain (their copyrights were not renewed),
and the Internet Archive hosts the films. This script lists those films, downloads a few, and makes contact sheets of
their frames so a frame can be chosen by eye; with FRAMES set it saves the chosen frames at full size.
It also saves the public-domain stills Wikimedia Commons holds, with the licence text Commons records.
Everything lands in audit/steel/. Nothing in the app or the store is changed here."""
import os, sys, json, re, time, io, subprocess, urllib.request, urllib.parse, traceback, socket
from PIL import Image, ImageDraw, ImageFont

_gai = socket.getaddrinfo
def _gai4(*a, **k):
    r = _gai(*a, **k); v4 = [x for x in r if x[0] == socket.AF_INET]; return v4 or r
socket.getaddrinfo = _gai4

HERE = os.path.dirname(os.path.abspath(__file__)); OUT = os.path.join(HERE, '..', 'audit', 'steel'); os.makedirs(OUT, exist_ok=True)
UA = {'User-Agent': 'BookDenAudit/1.2 (personal library app; https://github.com/DelvinDD13/Book-Den; contact via repository issues)'}
def log(*a): print(*a, flush=True)
def raw(url, timeout=120): return urllib.request.urlopen(urllib.request.Request(url, headers=UA), timeout=timeout).read()
def get(url, timeout=60): return json.loads(raw(url, timeout).decode())
def save(name, obj): json.dump(obj, open(os.path.join(OUT, name), 'w'), ensure_ascii=False, indent=1)
def font(n):
    try: return ImageFont.load_default(size=n)
    except Exception: return ImageFont.load_default()
def ffmpeg():
    import imageio_ffmpeg; return imageio_ffmpeg.get_ffmpeg_exe()

# the shorts worth looking through first, by the words in their Internet Archive titles
WANT = [('mad', r'mad scientist|superman\s*\(?1941\)?$|^superman$'), ('mech', r'mechanical monsters'), ('bullet', r'bulleteers'), ('billion', r'billion dollar'), ('arctic', r'arctic giant'), ('volcano', r'volcano'), ('quake', r'electric earthquake'), ('magnet', r'magnetic telescope')]

def films():
    """Find the shorts on the Internet Archive and record each one's files."""
    found = {}
    for q in ['title:(superman) AND (fleischer OR "famous studios" OR 1941 OR 1942) AND mediatype:(movies)', 'title:("superman" "mechanical monsters") AND mediatype:(movies)', 'title:("superman" "mad scientist") AND mediatype:(movies)', 'title:("superman" "bulleteers") AND mediatype:(movies)']:
        try:
            d = get('https://archive.org/advancedsearch.php?q=%s&fl[]=identifier&fl[]=title&fl[]=year&fl[]=downloads&sort[]=downloads+desc&rows=60&output=json' % urllib.parse.quote(q), 60)
            for x in (d.get('response') or {}).get('docs', []): found[x['identifier']] = x
        except Exception as e: log('search failed', q, e)
        time.sleep(1)
    log('archive items', len(found))
    pick = {}
    for key, rx in WANT:
        c = [x for x in found.values() if re.search(rx, str(x.get('title', '')), re.I) and re.search(r'superman', str(x.get('title', '')) + ' ' + x['identifier'], re.I)]
        c.sort(key=lambda x: -(x.get('downloads') or 0))
        for x in c[:3]:
            try:
                m = get('https://archive.org/metadata/' + x['identifier'], 60); time.sleep(0.6)
                vids = [f for f in m.get('files', []) if re.search(r'\.(mp4|mpeg|mpg|ogv|avi|mkv)$', f.get('name', ''), re.I)]
                vids = [{'name': f['name'], 'format': f.get('format'), 'size': int(f.get('size') or 0), 'w': int(f.get('width') or 0), 'h': int(f.get('height') or 0), 'len': f.get('length')} for f in vids]
                lic = (m.get('metadata') or {}).get('licenseurl') or (m.get('metadata') or {}).get('rights') or ''
                pick.setdefault(key, []).append({'id': x['identifier'], 'title': x.get('title'), 'year': x.get('year'), 'downloads': x.get('downloads'), 'licence': lic, 'collection': (m.get('metadata') or {}).get('collection'), 'files': vids})
            except Exception as e: log('metadata failed', x['identifier'], e)
    save('films.json', {'picked': pick, 'all': sorted(([x['identifier'], x.get('title'), x.get('year'), x.get('downloads')] for x in found.values()), key=lambda r: -(r[3] or 0))[:80]})
    return pick

def best_file(item):
    """The largest picture that is still a sane download: mp4 first, under 400 MB."""
    v = [f for f in item['files'] if f['size'] and f['size'] < 400e6]
    v.sort(key=lambda f: (0 if re.search(r'\.mp4$', f['name'], re.I) else 1, -(f['h'] or 0), -f['size']))
    return v[0] if v else None

def fetch(item, f):
    p = '/tmp/%s_%s' % (item['id'], re.sub(r'[^A-Za-z0-9.]+', '_', f['name']))
    if not os.path.exists(p):
        url = 'https://archive.org/download/%s/%s' % (item['id'], urllib.parse.quote(f['name'])); log('download', url, f['size'])
        urllib.request.urlretrieve(url, p)
    return p

def sheets():
    """One frame every three seconds from each chosen short, laid out on contact sheets with the time under each frame."""
    pick = films(); done = {}
    for key, _ in WANT[:int(os.environ.get('SHORTS', '4'))]:
        for item in pick.get(key, []):
            f = best_file(item)
            if not f: continue
            try:
                p = fetch(item, f); d = '/tmp/fr_' + key; os.makedirs(d, exist_ok=True)
                subprocess.run([ffmpeg(), '-loglevel', 'error', '-y', '-i', p, '-vf', 'fps=1/3,scale=320:-2', '-q:v', '5', os.path.join(d, 'f_%04d.jpg')], check=True)
                fr = sorted(os.listdir(d)); log(key, item['id'], f['name'], len(fr), 'frames')
                cols, w, h, lab = 8, 196, 147, 14; per = cols * 9
                for n in range(0, len(fr), per):
                    part = fr[n:n + per]; rows = (len(part) + cols - 1) // cols
                    img = Image.new('RGB', (cols * (w + 4) + 4, rows * (h + lab + 4) + 4), (14, 14, 16)); dr = ImageDraw.Draw(img); ft = font(11)
                    for i, name in enumerate(part):
                        im = Image.open(os.path.join(d, name)).convert('RGB'); im.thumbnail((w, h)); x = 4 + (i % cols) * (w + 4); y = 4 + (i // cols) * (h + lab + 4)
                        img.paste(im, (x + (w - im.width) // 2, y)); sec = (n + i) * 3 + 1; dr.text((x + 2, y + h), '%s  %d:%02d' % (key, sec // 60, sec % 60), fill=(235, 235, 235), font=ft)
                    img.save(os.path.join(OUT, 'frames_%s_%d.jpg' % (key, n // per + 1)), quality=78)
                done[key] = {'id': item['id'], 'file': f['name'], 'w': f['w'], 'h': f['h'], 'frames': len(fr), 'title': item['title'], 'licence': item['licence']}
                break
            except Exception as e: log('frames failed', key, item['id'], e); traceback.print_exc()
    save('sheets.json', done)

def contact(path, key, every=3):
    """Contact sheets for one film file: a frame every few seconds with the time under it."""
    d = '/tmp/fr_' + key; os.makedirs(d, exist_ok=True)
    subprocess.run([ffmpeg(), '-loglevel', 'error', '-y', '-i', path, '-vf', 'fps=1/%d,scale=320:-2' % every, '-q:v', '5', os.path.join(d, 'f_%04d.jpg')], check=True)
    fr = sorted(os.listdir(d)); cols, w, h, lab = 8, 196, 147, 14; per = cols * 9
    for n in range(0, len(fr), per):
        part = fr[n:n + per]; rows = (len(part) + cols - 1) // cols
        img = Image.new('RGB', (cols * (w + 4) + 4, rows * (h + lab + 4) + 4), (14, 14, 16)); dr = ImageDraw.Draw(img); ft = font(11)
        for i, name in enumerate(part):
            im = Image.open(os.path.join(d, name)).convert('RGB'); im.thumbnail((w, h)); x = 4 + (i % cols) * (w + 4); y = 4 + (i // cols) * (h + lab + 4)
            img.paste(im, (x + (w - im.width) // 2, y)); sec = (n + i) * every; dr.text((x + 2, y + h), '%s  %d:%02d' % (key, sec // 60, sec % 60), fill=(235, 235, 235), font=ft)
        img.save(os.path.join(OUT, 'frames_%s_%d.jpg' % (key, n // per + 1)), quality=78)
    return len(fr)

def frames():
    """FRAMES holds lines of  archive-id|file name|key|m:ss,m:ss,...  (or the word sheet in place of the times).
    Each time is saved as audit/steel/pick_<key>_<m>-<ss>.jpg, at most 1280 px wide."""
    want = [x.strip() for x in os.environ.get('FRAMES', '').replace('\n', ';').split(';') if x.strip() and not x.strip().startswith('#')]
    out = []
    for spec in want:
        try:
            ident, fname, key, times = [x.strip() for x in spec.split('|')]
            p = fetch({'id': ident}, {'name': fname, 'size': 0})
            if times == 'sheet': out.append({'key': key, 'sheet_frames': contact(p, key), 'archive': 'https://archive.org/details/' + ident}); continue
            for ts in times.split(','):
                m, sec = ts.strip().split(':'); name = 'pick_%s_%s-%s.jpg' % (key, m, sec.replace('.', '_'))
                subprocess.run([ffmpeg(), '-loglevel', 'error', '-y', '-ss', '%.2f' % (int(m) * 60 + float(sec)), '-i', p, '-frames:v', '1', '-vf', 'scale=min(1280\\,iw):-2', '-q:v', '2', os.path.join(OUT, name)], check=True)
                im = Image.open(os.path.join(OUT, name)); out.append({'key': key, 'at': ts.strip(), 'file': name, 'w': im.width, 'h': im.height, 'archive': 'https://archive.org/details/' + ident, 'source_file': fname})
        except Exception as e: log('frame spec failed', spec, e); traceback.print_exc()
    save('picks.json', out)
    P = [o for o in out if o.get('file')]; cols, w, h, lab = 5, 316, 237, 16; rows = (len(P) + cols - 1) // cols
    if P:
        img = Image.new('RGB', (cols * (w + 6) + 6, rows * (h + lab + 6) + 6), (14, 14, 16)); dr = ImageDraw.Draw(img); ft = font(12)
        for i, o in enumerate(P):
            im = Image.open(os.path.join(OUT, o['file'])).convert('RGB'); im.thumbnail((w, h)); x = 6 + (i % cols) * (w + 6); y = 6 + (i // cols) * (h + lab + 6)
            img.paste(im, (x + (w - im.width) // 2, y)); dr.text((x + 2, y + h + 1), '%s %s  %dx%d' % (o['key'], o['at'], o['w'], o['h']), fill=(235, 235, 235), font=ft)
        img.save(os.path.join(OUT, 'picks.jpg'), quality=84)

STILLS = ['This looks like a job for Superman.jpg', 'Superman saves Lois.jpg', 'Superman saves Lois again.jpg', 'Superman escapes from Krypton.jpg', 'Superman destroys robots.jpg', 'Superman on the mechanical monster.jpg', 'Superman-mechanical-monster.jpg', 'The mechanical monsters.jpg', 'Mechanical monster.jpg', 'Clark in a phone booth.jpg', 'Title card from The Mechanical Monsters.jpg', 'Supermanshorttitle.PNG', 'Destructioninc.jpg', 'Destructioninc2.jpg', 'Japoteurs1.JPG', 'Showdown title screen.JPG', 'Policemen fire.jpg', 'Lois in danger.jpg']
def stills():
    """The stills Wikimedia Commons already holds, fetched slowly (Commons throttles fast image traffic)."""
    meta = []
    for i in range(0, len(STILLS), 9):
        t = '|'.join('File:' + s for s in STILLS[i:i + 9])
        try:
            r = get('https://commons.wikimedia.org/w/api.php?action=query&format=json&titles=%s&prop=imageinfo&iiprop=url|size|extmetadata|mime&iiurlwidth=1280' % urllib.parse.quote(t), 40)
            for p in (r.get('query') or {}).get('pages', {}).values():
                ii = (p.get('imageinfo') or [{}])[0]; em = ii.get('extmetadata') or {}
                if ii.get('url'): meta.append({'title': p.get('title'), 'page': ii.get('descriptionurl'), 'url': ii.get('url'), 'thumb': ii.get('thumburl'), 'w': ii.get('width'), 'h': ii.get('height'), 'license': (em.get('LicenseShortName') or {}).get('value'), 'usage': re.sub('<[^>]+>', '', (em.get('UsageTerms') or {}).get('value') or ''), 'desc': re.sub('<[^>]+>', '', (em.get('ImageDescription') or {}).get('value') or '')[:200]})
        except Exception as e: log('commons failed', e)
        time.sleep(2)
    cols, w, h, lab = 4, 300, 225, 30; rows = (len(meta) + cols - 1) // cols
    img = Image.new('RGB', (cols * (w + 8) + 8, max(1, rows) * (h + lab + 8) + 8), (14, 14, 16)); dr = ImageDraw.Draw(img); ft = font(11)
    for i, m in enumerate(meta):
        x = 8 + (i % cols) * (w + 8); y = 8 + (i // cols) * (h + lab + 8)
        for a in range(4):
            try:
                time.sleep(3); b = raw((m['url'] if (m['w'] or 0) <= 1400 else m['thumb']).split('?')[0], 60); im = Image.open(io.BytesIO(b)).convert('RGB')
                fn = 'still_%02d.jpg' % i; im.save(os.path.join(OUT, fn), quality=90); m['file'] = fn; m['saved'] = [im.width, im.height]; im.thumbnail((w, h)); img.paste(im, (x + (w - im.width) // 2, y)); break
            except Exception as e:
                m['err'] = str(e)[:80]
                if '429' in str(e): time.sleep(25 * (a + 1)); continue
                break
        dr.text((x, y + h + 2), ('%02d ' % i) + m['title'][5:45], fill=(235, 235, 235), font=ft); dr.text((x, y + h + 15), '%sx%s  %s' % (m['w'], m['h'], m.get('license')), fill=(170, 170, 170), font=ft)
    img.save(os.path.join(OUT, 'stills.jpg'), quality=82); save('stills.json', meta); log('stills', len([m for m in meta if m.get('file')]), 'of', len(meta))

if __name__ == '__main__':
    todo = sys.argv[1:] or (['frames'] if os.environ.get('FRAMES') else ['sheets', 'stills'])
    for name in todo:
        try: {'sheets': sheets, 'frames': frames, 'stills': stills}[name]()
        except Exception: log('FAILED', name); traceback.print_exc()

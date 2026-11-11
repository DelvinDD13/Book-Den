"""Offline test of the audit job's store writes. No network: the store and the downloads are faked.
It proves three things: cover pictures only ever go to cv: rows; a row that is his own (a status, a rating, a note) is
never written; and unstray() blanks only the rows the job itself wrote to show:/game: names by mistake."""
import os, sys, io, json, time, importlib.util
HERE = os.path.dirname(os.path.abspath(__file__)); ROOT = os.path.dirname(HERE)
os.environ['DEN_STORE_URL'] = 'http://store.invalid/'; os.environ['DEN_KEY'] = 'k'
spec = importlib.util.spec_from_file_location('audit', os.path.join(ROOT, 'sync', 'audit.py')); A = importlib.util.module_from_spec(spec); spec.loader.exec_module(A)
from PIL import Image
fails = []; n = [0]
def ok(name, cond, extra=''):
    n[0] += 1
    if not cond: fails.append(name); print('FAIL', name, extra)

def png(w=400, h=600):
    b = io.BytesIO(); Image.new('RGB', (w, h), (20, 30, 40)).save(b, 'PNG'); return b.getvalue()
AP = json.load(open(os.path.join(ROOT, 'sync', 'poster_apply.json')))
names = [k for k in AP if k.startswith('show:') or k.startswith('game:')]
books = [k for k in AP if k.startswith('book:')]
ok('poster_apply.json holds only show:, game: and book: names', len(names) + len(books) == len(AP), str(len(AP)))
ok('every name maps to a cv: row', all(A.cvkey(k).startswith('cv:') for k in AP))
ok('a book maps to cv:<title>', A.cvkey('book:Dune') == 'cv:Dune')
try: A.cvkey('Dune'); ok('a bare name is refused', False)
except ValueError: ok('a bare name is refused', True)

T0 = 1794400000000
junk = lambda u: {'u': u, 'j': json.dumps({'url': 'https://x.example/p.jpg', 'src': 'audit', 'via': 'wikipedia', 'at': u, 'w': 300, 'h': 450})}
a, b, c, d = names[0], names[1], names[2], names[3]
STORE = {
    a: junk(T0),                                                                                   # the job's own mistaken row
    b: {'u': T0 - 5, 'j': json.dumps({'status': 'watched', 'rating': 5, 'notes': 'mine'})},        # his own row
    c: {'u': T0 + 9, 'j': json.dumps({'url': 'https://x.example/p.jpg', 'src': 'audit', 'via': 'w', 'at': T0, 'w': 1, 'h': 1, 'status': 'watching', 'u': T0 + 9})},  # the job's row with his edit on top
    'show:Something Else': {'u': T0 - 99, 'j': json.dumps({'status': 'watched'})},                  # his row for a title the job never touched
    'cv:' + a: {'u': T0 - 500, 'j': json.dumps({'url': 'https://old.example/wrong.jpg', 'src': 'tvmaze', 'w': 680, 'h': 1000})},
    'The Way of Kings': {'u': T0 - 1, 'j': json.dumps({'status': 'currently-reading'})},
}
before = json.loads(json.dumps(STORE)); posts = []
def fake_get(): return json.loads(json.dumps(STORE))
def fake_post(rows):
    posts.append(dict(rows))
    for k, v in rows.items():
        if k not in STORE or v['u'] > STORE[k]['u']: STORE[k] = v
    return len(rows)
A.store_get = fake_get; A.store_post = fake_post; A.raw = lambda u, t=60: png(); A.wget = lambda u, tries=4: png(); A.save = lambda name, obj: REP.__setitem__(name, obj)
REP = {}

# --- the guard ---
try: A.cover_rows_post({'show:Goblin': junk(T0)}); ok('cover_rows_post refuses a show: row', False)
except ValueError: ok('cover_rows_post refuses a show: row', True)
try: A.cover_rows_post({'The Way of Kings': junk(T0)}); ok('cover_rows_post refuses a book status row', False)
except ValueError: ok('cover_rows_post refuses a book status row', True)
ok('nothing was posted by a refused write', posts == [])

# --- unstray ---
A.unstray(); r = REP['unstray.json']
ok('unstray found the one row that is the job\'s own', r['ours'] == 1, json.dumps(r))
ok('unstray counted his own rows as not ours', r['not_ours'] == 2, json.dumps(r))
ok('unstray wrote exactly that one row', len(posts) == 1 and list(posts[0]) == [a], str([list(p) for p in posts]))
ok('the mistaken row is blank now', STORE[a]['j'] == A.BLANK and r['blank_now'] == 1)
ok('his own row is untouched', STORE[b] == before[b])
ok('his edit on top of the job\'s row is untouched', STORE[c] == before[c])
ok('his row for another title is untouched', STORE['show:Something Else'] == before['show:Something Else'])
ok('his book row is untouched', STORE['The Way of Kings'] == before['The Way of Kings'])
ok('the report holds counts and field names, no titles or values', not any(x in json.dumps(r) for x in ['mine', 'watched', a.split(':', 1)[1]]), json.dumps(r))
ok('other show/game rows are counted', r['other_show_game_rows'] == 1 and r['other_fields'] == {'status': 1}, json.dumps(r))
try: json.loads(A.BLANK); ok('the blank marker is not JSON', False)
except ValueError: ok('the blank marker is not JSON', True)
posts.clear(); A.unstray(); ok('a second unstray run writes nothing', posts == [], str(posts))

# --- apply ---
posts.clear(); A.apply(); r = REP['applied.json']
written = set().union(*[set(p) for p in posts]) if posts else set()
ok('apply wrote something', len(written) > 0)
ok('apply wrote only cv: rows', all(k.startswith('cv:') for k in written), str([k for k in written if not k.startswith('cv:')][:3]))
ok('apply wrote one row per entry', written == {A.cvkey(k) for k in AP}, '%d vs %d' % (len(written), len(AP)))
ok('the wrong poster was replaced under the cover row', json.loads(STORE['cv:' + a]['j'])['url'] == AP[a]['url'])
ok('apply reports every row as in the store', r['in_store_now'] == len(AP) and r['not_in_store'] == [], json.dumps(r)[:200])
ok('his rows are still untouched after apply', STORE[b] == before[b] and STORE[c] == before[c] and STORE['The Way of Kings'] == before['The Way of Kings'])
posts.clear(); A.apply(); ok('a second apply run writes nothing', posts == [], str([list(p)[:2] for p in posts]))

# --- the cover job protects the same rows ---
src = open(os.path.join(ROOT, 'sync', 'covers.py')).read()
ok('covers.py keeps checked rows by their cv: name', "CHECKED = set(cvkey(k)" in src, '')
print('job_test: %d checks, %d failed' % (n[0], len(fails))); sys.exit(1 if fails else 0)

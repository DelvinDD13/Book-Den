"""The check the weekly release job runs before it commits upcoming.json: the file as it stands passes, and each kind of bad
edit (an entry taken out, a release marked before its day, a price in a note, an unknown platform) is refused."""
import os, sys, json, copy, importlib.util
HERE = os.path.dirname(os.path.abspath(__file__)); ROOT = os.environ.get('ROOT') or '/home/claude/book-den'
spec = importlib.util.spec_from_file_location('upcoming_check', os.path.join(ROOT, 'sync', 'upcoming_check.py')); U = importlib.util.module_from_spec(spec); spec.loader.exec_module(U)
fails = []; n = [0]
def ok(name, cond, extra=''):
    n[0] += 1
    if not cond: fails.append(name); print('FAIL', name, extra)
LIVE = json.load(open(os.path.join(ROOT, 'upcoming.json'), encoding='utf-8'))
ok('the file in the repo passes', U.check(LIVE) == [], json.dumps(U.check(LIVE)))
ok('the file is in its usual layout', json.dumps(LIVE, indent=1, ensure_ascii=False) == open(os.path.join(ROOT, 'upcoming.json'), encoding='utf-8').read())
# the rest runs on a pinned copy (the list as it stood on Nov 14, 2026), so the weekly job's edits cannot move these checks
D = json.load(open(os.path.join(ROOT, 'tests', 'upcoming_fixture.json'), encoding='utf-8'))
T = '2026-11-14'
ok('the pinned copy passes', U.check(D, None, T) == [], json.dumps(U.check(D, None, T)))
def bad(name, edit, want, old=True):
    d = copy.deepcopy(D); edit(d); E = U.check(d, copy.deepcopy(D) if old else None, T)
    ok(name, any(want in e for e in E), json.dumps(E))
def good(name, edit):
    d = copy.deepcopy(D); edit(d); E = U.check(d, copy.deepcopy(D), T); ok(name, E == [], json.dumps(E))
book = lambda d, t: next(x for x in d['books'] if x['title'] == t)
game = lambda d, t: next(x for x in d['games'] if x['title'] == t)
bad('an entry taken out is refused', lambda d: d['books'].pop(2), 'was taken out')
bad('a game taken out is refused', lambda d: d['games'].pop(0), 'was taken out')
bad('released before its day is refused', lambda d: book(d, 'Seven and the Swift').update(status='released'), 'still ahead')
bad('released without a full date is refused', lambda d: book(d, 'The Justice of One').update(status='released'), 'needs its full date')
bad('a released entry cannot go back', lambda d: game(d, 'Brigandine: Abyss').update(status='dated'), 'was released and is now')
bad('a price in a note is refused', lambda d: book(d, 'The Heretics').update(note='The sequel to The Devils. $29.99.'), 'price, shopping or hype')
bad('a pre-order line in a note is refused', lambda d: game(d, 'Persona 6').update(note='Pre-orders open soon.'), 'price, shopping or hype')
bad('a bad date is refused', lambda d: game(d, 'Persona 4 Revival').update(date='Feb 18, 2027'), 'date must be')
bad('a month that does not exist is refused', lambda d: game(d, 'Persona 4 Revival').update(date='2027-13-01'), 'date must be')
bad('dated with no date is refused', lambda d: game(d, 'Persona 4 Revival').update(date='TBA'), 'the date is TBA')
bad('announced with a day is refused', lambda d: book(d, 'Red God').update(date='2027-09-14'), 'its status is dated')
bad('a platform he does not have is refused', lambda d: game(d, 'Persona 6').update(platforms=['PS5', 'Xbox Series X']), 'platforms must come from')
bad('an http source is refused', lambda d: book(d, 'Red God').update(sources=['http://example.com/a']), 'sources must be')
bad('no sources is refused', lambda d: book(d, 'Red God').update(sources=[]), 'sources must be')
bad('a cover that is not an address is refused', lambda d: book(d, 'Red God').update(cover='cover.jpg'), 'cover must be')
bad('an unknown field is refused', lambda d: book(d, 'Red God').update(price='x'), 'unknown field')
bad('minutes must be a whole number', lambda d: book(d, 'Red God').update(minutes='20 hours'), 'minutes must be')
bad('the same title twice is refused', lambda d: d['books'].append(copy.deepcopy(d['books'][0])), 'listed twice')
bad('the checked day cannot go backwards', lambda d: d.update(at='2026-10-01'), 'went backwards')
bad('the checked day cannot be ahead of today', lambda d: d.update(at='2026-12-25'), 'in the future')
bad('a game with no genre is refused', lambda d: game(d, 'Persona 6').pop('genre'), 'no genre')
good('a placeholder getting its real name is fine when the series and number stay', lambda d: book(d, 'The Empyrean #4').update(title='A Real Title', date='2027-09-21', status='dated'))
good('a release on its day is fine', lambda d: (book(d, 'A Conspiracy of Charming Monsters').update(status='released'), d.update(at=T)))
good('a new entry is fine', lambda d: d['books'].append({'series': 'Crescent City', 'title': 'Crescent City #4', 'author': 'Sarah J. Maas', 'date': 'TBA', 'status': 'announced', 'note': 'The fourth Crescent City book. No title or date yet.', 'cover': None, 'sources': ['https://example.com/a'], 'num': 4}))
good('an audiobook length is fine', lambda d: book(d, 'A Court of Forgotten Melody').update(minutes=1287))
d2 = copy.deepcopy(D); book(d2, 'The Empyrean #4').update(title='A Real Title', date='2027-09-21', status='dated'); d2['at'] = T
C = U.changes(d2, D)
ok('the change list says what moved', any('now called A Real Title' in c and 'TBA -> 2027-09-21' in c and 'announced -> dated' in c for c in C) and any(c.startswith('checked 2026-11-14') for c in C), json.dumps(C))
print('upcoming_check_test: %d checks, %d failed' % (n[0], len(fails))); sys.exit(1 if fails else 0)

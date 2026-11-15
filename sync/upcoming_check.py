#!/usr/bin/env python3
"""Check upcoming.json before it is committed.

    python3 sync/upcoming_check.py          # prints what changed since the last commit, then OK (exit 0) or the problems (exit 1)
    python3 sync/upcoming_check.py --tidy   # also rewrites the file in its usual layout (indent 1, real characters, no end newline)

upcoming.json is the list behind the Upcoming rows: the next books in series he reads, and the games and films he is waiting
for. The page reads it every time it opens. When an entry's day comes (and the file was checked in the 14 days before it), the
page drops the entry into his plans by itself: a book into the 2027 plan and its series page, a game into the backlog, a film
onto the watch list. So a wrong date here puts something in his plans that is not out. A weekly scheduled check keeps it true.

The shape:
  at       the day every entry that is not out yet was last checked, YYYY-MM-DD
  books    series, title, author, date, status, note, cover, sources, and when known: num (its number in the series, kept when a
           placeholder title such as "The Empyrean #4" gets its real name) and minutes (the audiobook's length at 1x)
  games    title, developer_or_publisher, platforms (PS5, Switch, Switch 2, or Film for a film), date, status, note, cover,
           sources, genre
  date     YYYY-MM-DD, or YYYY-MM or YYYY when that is all that is known, or TBA
  status   announced, dated (a day, month or year is public) or released (it is out; needs a full date)
Entries are never taken out, released ones included: the page needs them to know what has come out.
"""
import json, os, re, subprocess, sys, datetime

HERE = os.path.dirname(os.path.abspath(__file__))
PATH = os.path.join(HERE, '..', 'upcoming.json')
DATE = re.compile(r'^\d{4}(-(0[1-9]|1[0-2])(-(0[1-9]|[12]\d|3[01]))?)?$')
FULL = re.compile(r'^\d{4}-\d{2}-\d{2}$')
PLATFORMS = {'PS5', 'Switch', 'Switch 2', 'Film'}
STATUS = {'announced', 'dated', 'released'}
# a note says what the thing is and nothing else: no prices, no shopping, no hype
BAD_NOTE = re.compile(r'\$|pre-?orders?|\bdemo\b|closest thing|in decades|standard-setter|must[- ]read|can\'t wait', re.I)


def url_ok(u):
    return isinstance(u, str) and u.startswith('https://') and ' ' not in u and len(u) < 600


def check(d, old=None, today=None):
    """Every problem in d, as a list of lines. old is the last committed version, when there is one."""
    E = []
    today = today or datetime.date.today().isoformat()
    if not isinstance(d, dict): return ['the file is not an object']
    at = d.get('at')
    if not (isinstance(at, str) and FULL.match(at)): E.append('at must be a day, YYYY-MM-DD')
    elif at > (datetime.date.fromisoformat(today) + datetime.timedelta(days=1)).isoformat(): E.append('at is in the future: ' + at)
    for kind in ('books', 'games'):
        L = d.get(kind)
        if not isinstance(L, list): E.append(kind + ' must be a list'); continue
        seen = set()
        for i, x in enumerate(L):
            w = '%s[%d]' % (kind, i)
            if not isinstance(x, dict): E.append(w + ' is not an object'); continue
            t = x.get('title')
            if not (isinstance(t, str) and t.strip() and t == t.strip()): E.append(w + ' has no title'); continue
            w = kind[:-1] + ' "' + t + '"'
            if t.lower() in seen: E.append(w + ' is listed twice')
            seen.add(t.lower())
            st, dt = x.get('status'), x.get('date')
            if st not in STATUS: E.append(w + ': status must be announced, dated or released')
            if not (isinstance(dt, str) and (dt == 'TBA' or DATE.match(dt))): E.append(w + ': date must be YYYY-MM-DD, YYYY-MM, YYYY or TBA')
            elif st == 'released':
                if not FULL.match(dt): E.append(w + ': a released entry needs its full date')
                elif dt > today: E.append(w + ': marked released but dated ' + dt + ', which is still ahead')
            elif st == 'dated' and dt == 'TBA': E.append(w + ': status dated but the date is TBA')
            elif st == 'announced' and FULL.match(dt): E.append(w + ': it has a day, so its status is dated')
            n = x.get('note')
            if not (isinstance(n, str) and n.strip()): E.append(w + ': no note')
            elif BAD_NOTE.search(n): E.append(w + ': the note has a price, shopping or hype in it')
            elif len(n) > 320: E.append(w + ': the note is too long (keep it to a sentence or two)')
            c = x.get('cover', None)
            if c is not None and not url_ok(c): E.append(w + ': cover must be null or an https address')
            S = x.get('sources')
            if not (isinstance(S, list) and S and all(url_ok(u) for u in S)): E.append(w + ': sources must be one or more https addresses')
            if kind == 'books':
                for k in ('series', 'author'):
                    if not (isinstance(x.get(k), str) and x[k].strip()): E.append(w + ': no ' + k)
                if 'num' in x and not (isinstance(x['num'], (int, float)) and not isinstance(x['num'], bool) and 0 < x['num'] < 100): E.append(w + ': num must be its number in the series')
                if 'minutes' in x and not (isinstance(x['minutes'], int) and not isinstance(x['minutes'], bool) and 20 <= x['minutes'] <= 6000): E.append(w + ': minutes must be the audiobook length in whole minutes at 1x')
                extra = set(x) - {'series', 'title', 'author', 'date', 'status', 'note', 'cover', 'sources', 'num', 'minutes'}
            else:
                if not (isinstance(x.get('developer_or_publisher'), str) and x['developer_or_publisher'].strip()): E.append(w + ': no developer_or_publisher')
                if not (isinstance(x.get('genre'), str) and x['genre'].strip()): E.append(w + ': no genre')
                P = x.get('platforms')
                if not (isinstance(P, list) and all(p in PLATFORMS for p in P)): E.append(w + ': platforms must come from PS5, Switch, Switch 2 (or Film for a film)')
                elif st == 'released' and not P: E.append(w + ': a released game needs its platforms')
                extra = set(x) - {'title', 'developer_or_publisher', 'platforms', 'date', 'status', 'note', 'cover', 'sources', 'genre'}
            if extra: E.append(w + ': unknown field ' + ', '.join(sorted(extra)))
    if set(d) - {'at', 'books', 'games'}: E.append('unknown top-level field ' + ', '.join(sorted(set(d) - {'at', 'books', 'games'})))
    if old and not E:
        if isinstance(old.get('at'), str) and FULL.match(old['at']) and at < old['at']: E.append('at went backwards: ' + old['at'] + ' to ' + at)
        for kind in ('books', 'games'):
            now = d[kind]
            for o in old.get(kind) or []:
                if any(x['title'] == o.get('title') for x in now): continue
                if kind == 'books' and 'num' in o and any(x.get('series') == o.get('series') and x.get('num') == o['num'] for x in now): continue  # renamed
                E.append(kind[:-1] + ' "' + str(o.get('title')) + '" was taken out; entries stay in the file (a new name keeps the same series and num)')
            for x in now:
                o = next((o for o in old.get(kind) or [] if o.get('title') == x['title']), None)
                if o and o.get('status') == 'released' and x['status'] != 'released': E.append(kind[:-1] + ' "' + x['title'] + '" was released and is now ' + x['status'])
    return E


def changes(d, old):
    """One plain line for each entry that is new or whose date, status or name moved."""
    out = []
    for kind in ('books', 'games'):
        O = old.get(kind) or []
        for x in d.get(kind) or []:
            o = next((o for o in O if o.get('title') == x.get('title')), None)
            if not o and kind == 'books' and 'num' in x: o = next((o for o in O if o.get('series') == x.get('series') and o.get('num') == x['num']), None)
            if not o: out.append('new: %s (%s, %s)' % (x.get('title'), x.get('date'), x.get('status'))); continue
            bits = []
            if o.get('title') != x.get('title'): bits.append('now called ' + str(x.get('title')))
            if o.get('date') != x.get('date'): bits.append('date %s -> %s' % (o.get('date'), x.get('date')))
            if o.get('status') != x.get('status'): bits.append('%s -> %s' % (o.get('status'), x.get('status')))
            if o.get('minutes') != x.get('minutes') and x.get('minutes'): bits.append('%d min' % x['minutes'])
            if bits: out.append('%s: %s' % (o.get('title'), ', '.join(bits)))
    if old.get('at') != d.get('at'): out.append('checked %s (was %s)' % (d.get('at'), old.get('at')))
    return out


def committed():
    try:
        s = subprocess.run(['git', '-C', os.path.join(HERE, '..'), 'show', 'HEAD:upcoming.json'], capture_output=True, text=True, timeout=30)
        return json.loads(s.stdout) if s.returncode == 0 else None
    except Exception:
        return None


def main():
    try:
        raw = open(PATH, encoding='utf-8').read(); d = json.loads(raw)
    except Exception as e:
        print('upcoming.json does not parse:', e); return 1
    old = committed()
    E = check(d, old)
    if old:
        for line in changes(d, old): print(line)
    if E:
        print('\n'.join('PROBLEM ' + e for e in E)); print('%d problem%s. Nothing should be committed until these are fixed.' % (len(E), '' if len(E) == 1 else 's')); return 1
    if '--tidy' in sys.argv:
        tidy = json.dumps(d, indent=1, ensure_ascii=False)
        if tidy != raw: open(PATH, 'w', encoding='utf-8').write(tidy); print('tidied')
    print('OK: %d books, %d games, checked %s' % (len(d['books']), len(d['games']), d['at'])); return 0


if __name__ == '__main__':
    sys.exit(main())

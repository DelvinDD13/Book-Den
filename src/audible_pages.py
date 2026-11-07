import re, json, sys
RIGHT = re.compile(r'\s{3,}(Listen now|Remove|Unavailable|View PDF|1 CREDIT.*|\$[\d.]+.*)\s*$')
def parse(path):
    lines = open(path, errors='ignore').read().split('\n'); items = []
    for i, L in enumerate(lines):
        m = re.match(r'^\s{2,}By: (.+?)\s*$', L)
        if not m: continue
        j = i - 1; tl = []
        while j >= 0 and lines[j].strip() and not re.search(r'Add to favorites|Download|Write a review|By: |Narrated by|Series:|credits|Select|Date added|Ask Maven', lines[j]) and len(tl) < 4:
            if lines[j].strip() not in (':', 'Listen now'): tl.insert(0, lines[j])
            j -= 1
        # a title that is cut off by the page break shows up as text with no duration: fall back to the nearest line with one
        if tl and not any(re.search(r'\s{3,}((\d+h )?\d+m( left)?|\d+h|Finished)\s*$', RIGHT.sub('', x)) for x in tl): tl = tl[-2:]
        dur = ''; parts = []
        for x in tl:
            x = RIGHT.sub('', x)
            d = re.search(r'\s{3,}((\d+h )?\d+m( left)?|\d+h|Finished)\s*$', x)
            if d: dur = d.group(1); x = x[:d.start()]
            x = x.strip()
            if x and x not in ('Listen now',): parts.append(x)
        title = ' '.join(parts).strip()
        author = re.sub(r'\s{3,}.*$', '', m.group(1)).strip()
        block = '\n'.join(lines[i:i+14])
        ser = re.search(r'Series: (.+)', block)
        books = re.findall(r'([^,]+?) , Book ([\d.\-]+)', ser.group(1)) if ser else []
        state = 'finished' if dur == 'Finished' or 'Mark as Unfinished' in block else ('listening' if 'left' in dur else 'unstarted')
        if not title or re.search(r'CREDIT|…', author): continue
        items.append({'title': title, 'author': author, 'dur': dur, 'series': books[0][0].strip() if books else (ser.group(1).split(',')[0].strip() if ser else ''), 'num': books[0][1] if books else '', 'state': state})
    return items
if __name__ == '__main__':
    sys.path.insert(0, '/home/claude/den/gr'); from lists import norm
    files = sys.argv[1:]; items = []
    for f in files: items += parse(f)
    skip = ('Amy Harper', 'John Collins')
    items = [x for x in items if x['author'] not in skip]
    seen = set(); items = [x for x in items if not (norm(x['title']) in seen or seen.add(norm(x['title'])))]
    json.dump(items, open('items_all.json', 'w'), indent=1); print('titles', len(items))
    B = json.load(open('/home/claude/den/pt/books.json')); byn = {}
    for b in B: byn.setdefault(norm(b['t']), []).append(b)
    new, upd, same = [], [], []
    for x in items:
        L = byn.get(norm(x['title']), [])
        want = {'finished': 'read', 'listening': 'currently-reading', 'unstarted': None}[x['state']]
        if not L: new.append(x); continue
        b = sorted(L, key=lambda b: (b['isGR'], b['st'] != 'read'))[0]
        if all(b['isGR'] for b in L): new.append(dict(x, gr_only=True, grt=L[0]['t'], grst=L[0]['st']))
        elif want and b['st'] != want and not (want == 'currently-reading' and b['st'] == 'read'): upd.append((x, b['t'], b['st']))
        else: same.append(x)
    json.dump({'new': new, 'upd': upd}, open('diff.json', 'w'), indent=1)
    print('NEW', len(new), '| Goodreads-shelf only', sum(1 for x in new if x.get('gr_only')), '| STATUS UPDATES', len(upd), '| fine', len(same))
    for x in new: print('  + %-9s %-64s | %-20s | %s' % (x['state'], x['title'][:64], x['author'][:20], ('GR: ' + x['grt'][:30]) if x.get('gr_only') else ''))
    for x, t, st in upd: print('  ~ %-9s %-64s  app: %s' % (x['state'], t[:64], st))
    bad = [x['title'] for x in items if len(x['title']) < 4 or x['title'].startswith(('and ', '(', ':'))]; print('suspect titles:', bad)

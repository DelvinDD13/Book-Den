import json, sys
d = json.load(open('diff.json'))
G = {'Patric Gagne': 'Nonfiction — Memoir', 'Helene Hanff': 'Literary Fiction', 'Claire Keegan': 'Literary Fiction', 'Natalie Haynes': 'Mythology & Retellings', 'Abby Jimenez': 'Romance', 'C. S. Lewis': "Children's", 'Kiera Azar': 'Fantasy — Romantasy', 'LJ Andrews': 'Fantasy — Romantasy', 'Hannah Nicole Maehrer': 'Fantasy — Romantasy', 'Demi Winters': 'Fantasy — Romantasy', 'Holly Black': 'Fantasy — Romantasy', 'Holly Black, Rovina Cai': 'Fantasy — Romantasy', 'Sarah J. Maas': 'Fantasy — Romantasy', 'Rebecca Yarros': 'Fantasy — Romantasy', 'Jennifer Lynn Barnes': 'Mystery & Thriller', 'John Gwynne': 'Fantasy — Grimdark', 'Brent Weeks': 'Fantasy — Grimdark', 'Scott Lynch': 'Fantasy — Grimdark', 'Travis Baldree': 'Fantasy — High Fantasy', 'Christopher Paolini': 'Fantasy — High Fantasy', 'Guy Gavriel Kay': 'Fantasy — High Fantasy', 'Alix E. Harrow': 'Fantasy — High Fantasy', 'Shelley Parker-Chan': 'Fantasy — High Fantasy', 'Andrea Stewart': 'Fantasy — Epic Fantasy', 'Shannon Lee, Fonda Lee': 'Fantasy — High Fantasy', 'V. E. Schwab': 'Fantasy — Urban Fantasy', 'Brandon Sanderson': 'Fantasy — Epic Fantasy', 'Edgar Allan Poe': 'Literary Fiction', 'James Baldwin': 'Nonfiction — Memoir', 'Maya Angelou': 'Nonfiction — Poetry', 'Natasha Trethewey': 'Nonfiction — Poetry', 'Jericho Brown': 'Nonfiction — Poetry', 'Brandon Som': 'Nonfiction — Poetry', 'R. F. Kuang': 'Literary Fiction', 'Matt Dinniman': 'LitRPG', 'Patrick Rothfuss': 'Fantasy — Epic Fantasy', 'Charlotte Brontë': 'Literary Fiction', 'Emily Brontë': 'Literary Fiction', 'Jennifer L. Armentrout': 'Fantasy — Romantasy'}
add = []
for x in d['new']:
    a = x['author']; key = a if a in G else next((k for k in G if k.split(',')[0] in a), None)
    e = {'t': x['title'], 'a': a, 'rt': '' if 'left' in x['dur'] else x['dur'], 'st': x['state'], 'g': G.get(key, 'Fantasy — Epic Fantasy')}
    if x['series']: e['s'] = x['series']; e['n'] = x['num']
    if x.get('gr_only'): e['gr'] = x['grt']
    if 'left' in x['dur']: e['left'] = x['dur'].replace(' left', '')
    add.append(e)
upd = [{'t': t, 'st': x['state'], 'left': x['dur'].replace(' left', '') if 'left' in x['dur'] else ''} for x, t, st in d['upd']]
js = 'const ADD = ' + json.dumps(add, ensure_ascii=False, separators=(',', ':')) + ';\n  const UPD = ' + json.dumps(upd, ensure_ascii=False, separators=(',', ':')) + ';'
open('/home/claude/den/aud_data.js', 'w').write(js); print('add', len(add), 'upd', len(upd))
T = json.load(open('/home/claude/book-den/sync/titles.json')); have = {t for t, a in T['books']}; n = 0
for e in add:
    if not e.get('gr') and e['t'] not in have: T['books'].append([e['t'], e['a']]); n += 1
json.dump(T, open('/home/claude/book-den/sync/titles.json', 'w'), ensure_ascii=False, indent=0); print('cover job +', n)

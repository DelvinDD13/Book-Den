#!/usr/bin/env python3
"""Refresh the copy of upcoming.json that is built into index.html.

    python3 src/embed_upcoming.py

The page reads upcoming.json fresh every time it opens; the built-in copy is only what it shows before that answer is in, or on a
first open with no connection. Run this when a build is made so the two do not drift far apart. It changes nothing else.
"""
import json, pathlib, sys
root = pathlib.Path(__file__).resolve().parent.parent
idx = root / 'index.html'
data = json.loads((root / 'upcoming.json').read_text(encoding='utf-8'))
s = idx.read_text(encoding='utf-8')
MARK = 'window.UPCOMING='
i = s.find(MARK)
if i < 0 or s.count(MARK) != 1: sys.exit('window.UPCOMING= not found exactly once')
j = i + len(MARK)
_, end = json.JSONDecoder().raw_decode(s[j:])
new = json.dumps(data, ensure_ascii=False).replace('</', '<\\/')
if s[j:j + end] == new: print('already current'); sys.exit(0)
idx.write_text(s[:j] + new + s[j + end:], encoding='utf-8')
print('embedded %d books, %d games, checked %s' % (len(data['books']), len(data['games']), data['at']))

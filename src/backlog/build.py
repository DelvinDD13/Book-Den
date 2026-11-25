#!/usr/bin/env python3
"""Join the parts of Backlog into the one module Book Den takes:

    python3 src/backlog/build.py      # writes src/l63.js
    python3 src/inject.py src/l63.js  # puts it in index.html and stamps the build

The parts, in order: core.js (the engine; runs in Node for the tests), art.js (the orbs, drawn as SVG), view.js (his books as cards and
enemies, saving, his logs, the screens, the badges), style.js (the CSS, with the Kanit typeface carried inside it).
"""
import base64, pathlib
here = pathlib.Path(__file__).resolve().parent
HEAD = '''// ===== L63: Backlog, an orb-matching fight where his finished books are the cards and his unread shelf is the enemy (approved Nov 25 2026: "go" on the mock).
// His words on the way here, Nov 20 to 24 2026: Hoard was "so poorly designed" ("Poor graphics, poor level design, samey gameplay no nuance no
// replayability"), and the take-turns duel that followed was "hideous". He then sent two screens of an orb-matching team game as the look and the
// depth he wants (orbs, cards with stats, a skill on a turn timer, a leader skill) and said "Do it for free": so the orbs and frames are drawn here.
// A finished book is a card: HP from its length, ATK from his rating, a skill and a leader skill. An unread book he owns is an enemy on its
// shelf; a shelf is floors of seven, the longest book of each floor is the boss (his saved boss design: shields, break, a turn at half HP, a
// difficulty word before the fight, a loss still chips the boss). His logs lift the team; nothing comes from playing more. His progress is his
// own row "backlog". A shelf's first floor cleared is a badge (ids backlog_<shelf>) and has its moment. Nothing flashes or shakes.
// Built from src/backlog by build.py: edit the parts.
(function () {
'''
parts = ['core.js', 'art.js', 'view.js', 'style.js']
body = ''.join((here / p).read_text() for p in parts)
for w, f in (('600', 'kanit-latin-600-normal'), ('700', 'kanit-latin-700-normal'), ('800', 'kanit-latin-800-italic')):
    body = body.replace('%%F' + w + '%%', base64.b64encode((here / 'fonts' / (f + '.woff2')).read_bytes()).decode())
(here.parent / 'l63.js').write_text(HEAD + body + '})();\n')
print('built', len(HEAD + body), 'bytes')

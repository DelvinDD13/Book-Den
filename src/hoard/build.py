#!/usr/bin/env python3
"""Join the parts of Hoard into the one module Book Den takes:

    python3 src/hoard/build.py        # writes src/l62.js
    python3 src/inject.py src/l62.js  # puts it in index.html and stamps the build

The parts, in order: core.js (the engine; runs in Node for tune.js and the tests), levels.js (worlds, levels, bosses, the tuned
move limits), art.js (the pieces, drawn as SVG), view.js (saving, his logs, the screens, the badges), style.js (the CSS).
"""
import pathlib
here = pathlib.Path(__file__).resolve().parent; src = here
HEAD = '''// ===== L62: Hoard, a match-three with worlds and bosses (approved Nov 20 2026: "Go" on the third mock). Built from src/hoard by build.py: edit the parts.
// His asks, Nov 19 2026: "Can you make me a bejeweled puzzle game clone" / "Book den" / "Please don't make it ass and don't make it not have any
// differentiation. Did you implement level design bombs gimmicks etc" / "So plain" / "No depth horrible level design limited scope". His answers the
// same night: depth from both puzzle levels and boss battles (his saved boss design), three worlds done deep, his logs give power.
// Three worlds (Mistborn, Dungeon Crawler Carl, Throne of Glass), each a road of fifteen levels and a boss, and an endless board. Break, Swap and
// Shuffle come from what he logs (reading, Steel, sleep/steps/notes); boss tries and boss damage rise with the day's and the week's logs. A world
// opens when its first book is finished. A world cleared is a badge (ids hoard_w1..3) and has its moment. His progress is his own row "hoard".
// Its own name and its own pieces. Nothing flashes or shakes.
(function () {
'''
parts = ['core.js', 'levels.js', 'art.js', 'view.js', 'style.js']
body = ''.join((src / p).read_text() for p in parts if (src / p).exists())
(here.parent / 'l62.js').write_text(HEAD + body + '})();\n')
print('built', len(HEAD + body), 'bytes from', [p for p in parts if (src / p).exists()])

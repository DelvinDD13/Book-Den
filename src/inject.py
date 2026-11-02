#!/usr/bin/env python3
"""Add or replace an app module inside the built index.html, then stamp the build.

    python3 src/inject.py src/l20.js            # inject/replace the L20 block, bump DEN_BUILD + sw.js cache
    python3 src/inject.py src/l20.js --nostamp  # same, keep the stamps (for screenshot builds)

A module file starts with `// ===== L<nn>` on its first line; that marker names the block in index.html.
The block sits at the end of the app script, just before `try { applyTheme(); }`. Modules load in file order,
so a new module can wrap anything already on the page (L4.sheetHTML, L15.booksTop, renderSheet, ...).
"""
import re, sys, time, pathlib
root = pathlib.Path(__file__).resolve().parent.parent
idx = root / 'index.html'; sw = root / 'sw.js'
TAIL = "try { applyTheme(); } catch (e) { console.warn('theme', e.message); }\n</script>"

def main():
    args = [a for a in sys.argv[1:] if not a.startswith('--')]
    if not args: sys.exit(__doc__)
    mod = pathlib.Path(args[0]).read_text()
    m = re.match(r'// ===== (L\d+)\b', mod)
    if not m: sys.exit('module must start with // ===== L<nn>')
    name = m.group(1)
    s = idx.read_text()
    block = mod.rstrip('\n') + '\n\n'
    start = s.find('// ===== ' + name + ' ')
    if start < 0: start = s.find('// ===== ' + name + ':')
    if start >= 0:
        # the block ends where the next module marker or the tail begins
        nxt = re.search(r'\n// ===== L\d+\b', s[start + 10:])
        end = start + 10 + nxt.start() + 1 if nxt else s.find(TAIL, start)
        if end < 0: sys.exit('could not find the end of the ' + name + ' block')
        s = s[:start] + block + s[end:]
        print('replaced', name)
    else:
        k = s.find(TAIL)
        if k < 0: sys.exit('tail not found')
        s = s[:k] + block + s[k:]
        print('added', name)
    if '--nostamp' not in sys.argv:
        stamp = time.strftime('%Y%m%d%H%M')
        s, n = re.subn(r'DEN_BUILD="\d{12}"', 'DEN_BUILD="' + stamp + '"', s)
        t = sw.read_text(); t, n2 = re.subn(r'den-\d{12}', 'den-' + stamp, t); sw.write_text(t)
        print('stamp', stamp, '(index %d, sw %d)' % (n, n2))
    idx.write_text(s)
    print('index.html', len(s), 'bytes')

if __name__ == '__main__': main()

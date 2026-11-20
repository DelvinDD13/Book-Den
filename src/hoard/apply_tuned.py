#!/usr/bin/env python3
"""Write tuned.json into levels.js between the TUNED markers, then rebuild."""
import json, pathlib, re, subprocess
here = pathlib.Path(__file__).resolve().parent; T = json.loads((here / 'tuned.json').read_text()); p = here / 'levels.js'; s = p.read_text()
keep = {k: {x: v[x] for x in ('moves', 'stars', 'rate') if x in v} for k, v in T.items()}
s2 = re.sub(r"// TUNED-BEGIN\n.*?// TUNED-END", lambda m: "// TUNED-BEGIN\n  const TUNED = " + json.dumps(keep, separators=(',', ':')) + ";\n  // TUNED-END", s, flags=re.S)
assert s2 != s or 'TUNED = {' not in s; p.write_text(s2); print(subprocess.run(['python3', str(here / 'build.py')], capture_output=True, text=True).stdout.strip())

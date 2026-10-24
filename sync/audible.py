"""Daily Audible -> Book Den. Reads library.json (+ finished.json if present) written by `audible api`,
slims each title, and posts it to the Book Den store in parts. Prints counts only, never titles or secrets."""
import json, os, sys, urllib.request

STORE = os.environ["DEN_STORE_URL"]
KEY = os.environ["DEN_KEY"]

def load(p):
    try:
        with open(p) as f:
            return json.load(f)
    except Exception:
        return {}

lib = load("library.json")
items = lib.get("items") or []
if not items:
    print("no library items returned", file=sys.stderr)
    sys.exit(1)

# finished dates: walk whatever shape the stats endpoint returns for {asin, <timestamp>} pairs
fin = {}
def walk(x):
    if isinstance(x, dict):
        a = x.get("asin")
        ts = x.get("event_timestamp") or x.get("timestamp") or x.get("finished_date") or x.get("date")
        done = x.get("is_marked_as_finished", x.get("is_finished", True))
        if a and ts and done:
            d = str(ts)[:10]
            if len(d) == 10 and d[4] == "-" and (a not in fin or d > fin[a]):
                fin[a] = d
        for v in x.values():
            walk(v)
    elif isinstance(x, list):
        for v in x:
            walk(v)
walk(load("finished.json"))

rows = []
for it in items:
    asin = it.get("asin")
    if not asin:
        continue
    title = (it.get("title") or "").strip()
    sub = (it.get("subtitle") or "").strip()
    full = title + (": " + sub if sub else "")
    authors = ", ".join(a.get("name", "") for a in (it.get("authors") or []) if a.get("name"))
    ls = it.get("listening_status") or {}
    pct = it.get("percent_complete")
    if pct is None:
        pct = ls.get("percent_complete")
    finished = bool(it.get("is_finished") or ls.get("is_finished"))
    status = ls.get("finished_at_timestamp") and "finished" or ("started" if (pct or 0) > 0 else "")
    fdate = fin.get(asin) or (str(ls.get("finished_at_timestamp"))[:10] if ls.get("finished_at_timestamp") else "")
    rows.append([asin, full, authors, finished, round(float(pct or 0), 1), status, fdate])

parts = [rows[i:i + 120] for i in range(0, len(rows), 120)] or [[]]
for i, chunk in enumerate(parts):
    body = json.dumps({"key": KEY, "kind": "audible", "part": i, "parts": len(parts), "total": len(rows), "items": chunk}).encode()
    req = urllib.request.Request(STORE, data=body, headers={"Content-Type": "text/plain;charset=utf-8"}, method="POST")
    with urllib.request.urlopen(req, timeout=60) as r:
        ok = json.loads(r.read().decode() or "{}").get("ok")
    if not ok:
        print("store refused part", i, file=sys.stderr)
        sys.exit(1)
print("sent", len(rows), "titles in", len(parts), "parts;", sum(1 for r in rows if r[3]), "finished;", len(fin), "finish dates")

"""Every 6 hours: read Delvin's Goodreads shelves from their RSS feeds and save them to the Book Den store.
Read-only. Prints counts only."""
import json, os, sys, time, urllib.parse, urllib.request, email.utils
import xml.etree.ElementTree as ET

BASE = os.environ["GR_RSS"].strip()
STORE = os.environ["DEN_STORE_URL"]
KEY = os.environ["DEN_KEY"]
SHELVES = ["read", "currently-reading", "to-read"]
CHUNKS = 5  # rows per shelf, fixed so a shrinking shelf never leaves stale rows behind

def fetch(shelf, page):
    sep = "&" if "?" in BASE else "?"
    url = BASE + sep + urllib.parse.urlencode({"shelf": shelf, "per_page": 200, "page": page})
    req = urllib.request.Request(url, headers={"User-Agent": "Mozilla/5.0 (Book Den personal shelf sync)"})
    with urllib.request.urlopen(req, timeout=60) as r:
        return r.read()

def day(s):
    s = (s or "").strip()
    if not s:
        return ""
    try:
        return email.utils.parsedate_to_datetime(s).strftime("%Y-%m-%d")
    except Exception:
        return s[:10] if len(s) >= 10 and s[4] == "-" else ""

def num(s):
    try:
        return float(s or 0)
    except Exception:
        return 0

def shelf_items(shelf):
    out = []
    for page in range(1, 11):
        ch = ET.fromstring(fetch(shelf, page)).find("channel")
        if ch is None:
            break
        title = (ch.findtext("title") or "").lower()
        if title and shelf not in title and shelf.replace("-", " ") not in title:
            raise SystemExit("feed for %s returned another shelf (%r)" % (shelf, title))
        its = ch.findall("item")
        for it in its:
            g = lambda n: (it.findtext(n) or "").strip()
            out.append([g("book_id"), g("title"), g("author_name"), day(g("user_read_at")), num(g("user_rating")), day(g("user_date_added"))])
        if len(its) < 200:
            break
        time.sleep(2)
    return out

now = int(time.time() * 1000)
v = {}
counts = {}
for shelf in SHELVES:
    items = shelf_items(shelf)
    counts[shelf] = len(items)
    chunks, cur = [], []
    for x in items:
        cur.append(x)
        if len(json.dumps(cur)) > 40000:
            cur.pop(); chunks.append(cur); cur = [x]
    chunks.append(cur)
    if len(chunks) > CHUNKS:
        raise SystemExit("shelf %s too big" % shelf)
    for i in range(CHUNKS):
        part = chunks[i] if i < len(chunks) else []
        v["gr:%s:%d" % (shelf, i)] = {"u": now, "j": json.dumps({"items": part, "u": now}, separators=(",", ":"))}
    time.sleep(2)
v["gr:meta"] = {"u": now, "j": json.dumps({"at": now, "counts": counts, "u": now})}

body = json.dumps({"key": KEY, "v": v}).encode()
req = urllib.request.Request(STORE, data=body, headers={"Content-Type": "text/plain;charset=utf-8"}, method="POST")
with urllib.request.urlopen(req, timeout=90) as r:
    res = json.loads(r.read().decode() or "{}")
if not res.get("ok"):
    sys.exit("store refused: %s" % res.get("err"))
print("saved", counts)

#!/bin/bash
# Runs every suite against ROOT (default the repo) and prints one gate line: ALL PASS or FAILED.
cd /home/claude/den/pt
S="codex_test look_test timer_test steel_test quests_test manual_test screen_test upcoming_test audit_test sw_test facts_test books_test fixes_test versions_test audible_test arcs_test dcc_test bookmarks_test looks_test scenes_test pictures_test $EXTRA"
mkdir -p out; rm -f out/*.txt
run() { timeout 600 node $1.js > out/$1.txt 2>&1; echo "exit $?" >> out/$1.txt; }
# three at a time keeps the timing-sensitive checks honest
set -- $S
while [ $# -gt 0 ]; do
  for f in $1 $2 $3; do [ -n "$f" ] && run $f & done; wait
  shift; [ $# -gt 0 ] && shift; [ $# -gt 0 ] && shift
done
tot=0; bad=0
for f in $S; do
  line=$(grep -E '[0-9]+ passed, [0-9]+ failed' out/$f.txt | tail -1)
  p=$(echo "$line" | sed -E 's/^([0-9]+) passed.*/\1/'); fl=$(echo "$line" | sed -E 's/.* ([0-9]+) failed.*/\1/')
  if [ -z "$line" ]; then echo "$f: NO RESULT"; bad=$((bad+1)); tail -5 out/$f.txt; continue; fi
  tot=$((tot+p)); if [ "$fl" != "0" ]; then bad=$((bad+1)); echo "$f: $line"; grep FAIL out/$f.txt | head -8; else echo "$f: $p ok"; fi
done
if [ $bad -eq 0 ]; then echo "ALL PASS $tot checks"; else echo "FAILED suites: $bad (passing checks $tot)"; exit 1; fi

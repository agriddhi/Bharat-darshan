"""Inspect the exact shape of the content that site pages must render.

Run:  python tools/inspect_content.py
"""

import io
import json
import os
import sys
import textwrap

sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding="utf-8")

HERE = os.path.dirname(os.path.abspath(__file__))
V2 = os.path.dirname(HERE)
sites = json.load(open(os.path.join(V2, "src", "data", "sites.json"), encoding="utf-8"))

s = next(x for x in sites if x["id"] == "taj-mahal")

print("=== STORY[0] keys ===")
print(list(s["story"][0].keys()))
print()
print("=== STORY[0] sample ===")
for k, v in s["story"][0].items():
    print("  %s: %s" % (k, str(v)[:220]))
print()
print("=== all 5 story titles ===")
for i, st in enumerate(s["story"]):
    print("  %d. %s  (%d chars)  image=%r" % (i + 1, st["title"], len(st["body"]), st["image"]))
print()
print("=== history ===")
print(textwrap.fill(s["history"][:400], 96))
print()
print("=== quickFacts ===")
for f in s["quickFacts"]:
    print("   ", f)
print()
print("=== quiz sample ===")
q = s["quiz"][0]
print("   ", q["q"])
for o in q["options"]:
    print("      -", o)
print("      answer idx", q["answer"])
print("      explain:", q["explain"][:160])
print()
print("=== field coverage across all 25 ===")
for k in ["story", "history", "historyHi", "quiz", "quickFacts", "descriptionHi",
          "pano360", "nameHi", "officialSource"]:
    n = sum(1 for x in sites if x.get(k))
    print("  %-16s %d/25" % (k, n))
print()
print("=== story image field: every distinct value ===")
vals = set()
for x in sites:
    for st in x.get("story", []):
        vals.add(repr(st.get("image")))
print("  ", vals)
print()
print("=== do all sites have the same number of story stages? ===")
counts = {}
for x in sites:
    n = len(x.get("story", []))
    counts[n] = counts.get(n, 0) + 1
print("  ", counts)
print()
print("=== quickFacts: distinct labels used ===")
labels = {}
for x in sites:
    for f in x.get("quickFacts", []):
        labels[f["label"]] = labels.get(f["label"], 0) + 1
for k, v in sorted(labels.items(), key=lambda t: -t[1]):
    print("   %-28s %d" % (k, v))
print()
print("=== quiz: sites with quiz, total questions ===")
withq = [x for x in sites if x.get("quiz")]
print("   sites:", len(withq), "/25   questions:", sum(len(x["quiz"]) for x in withq))

"""Caption cues for one language -> out/subs-<lang>.json for core/render/srt.py.
Same rule as subs() in film.js: hold max(1.8 s, speech + 0.6 s) + 0.4 s, never past the next line. Asserts the hold."""
import json, os, re, sys
D = os.path.dirname(os.path.abspath(__file__)) + '/..'
lang = sys.argv[1]
LT = dict(re.findall(r"(l\d\d): ([\d.]+)", re.search(r"const LINE_T = \{([^}]*)\}", open(f'{D}/film.js').read()).group(1)))
lines = json.load(open(f'{D}/lines-{lang}.json'))
dur = json.load(open(f'{D}/voice-{lang}/dur.json'))
cues = []
for i, L in enumerate(lines):
    t0 = float(LT[L['id']]); nxt = float(LT[lines[i + 1]['id']]) if i + 1 < len(lines) else 72.5
    t1 = min(nxt - .1, t0 + max(1.8, dur[L['id']] + .6) + .4)
    assert t1 - t0 >= max(1.8, dur[L['id']] + .6) - 1e-6, (lang, L['id'], t1 - t0, dur[L['id']])
    cues.append({'t0': t0, 't1': round(t1, 3), 'text': L['sub']})
os.makedirs(f'{D}/out', exist_ok=True)
json.dump(cues, open(f'{D}/out/subs-{lang}.json', 'w'), ensure_ascii=False, indent=1)
print(lang, len(cues), 'cues ok')

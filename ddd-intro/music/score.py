"""The Drawing Comes First: original score. 96 BPM, D minor, a two-part invention for harpsichord
(person and agent as two voices), harp bass, glockenspiel on the checks.
Run: LIB=<lib> $LIB/.venv/bin/python music/score.py  -> music/score.wav (shared by both languages)"""
import os, sys
import numpy as np, soundfile as sf

HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, os.environ['LIB'])
from core.audio import sampler as S
from core.audio.sfx import SR, add, limit, lp

S.seed(2026)
BEAT = 60 / 96; BAR = BEAT * 4; E16 = BEAT / 4; E8 = BEAT / 2
DUR = 72.5 + .8; N = int(DUR * SR)
st = {k: np.zeros((N, 2), np.float32) for k in ['rh', 'lh', 'harp', 'glock']}
bar = lambda n, b=0.0: (n - 1) * BAR + b * BEAT

# D minor; the V chord (A) borrows C#
NAT = [62, 64, 65, 67, 69, 70, 72]
def pitch(deg, octv=0, sharp7=False):
    i, o = deg % 7, deg // 7
    m = NAT[i] + 12 * (o + octv)
    if sharp7 and i == 6: m += 1
    return m
PROG = [0, 3, 6, 2, 5, 3, 4, 0]           # i iv VII III VI iv V i
SUBJ = [0, 1, 2, 3, 4, 2, 3, 1, 2, 4, 3, 5, 4, 2, 0, -3]   # sixteenths
CTR = [7, 6, 5, 4, 3, 4, 5, 2]                               # eighths

def rh(t, m, d, v=.62): add(st['rh'], S.note('harpsichord', m, d, v), t, 1.0, .25)
def lh(t, m, d, v=.58): add(st['lh'], S.note('harpsichord', m, d, v), t, 1.0, -.25)
def harp(t, m, d=BEAT * 1.6, v=.6): add(st['harp'], S.note('harp', m, d, v), t, 1.0, 0)
def glock(t, m, v=.5, d=1.0): add(st['glock'], S.note('glockenspiel', m, d, v), t, 1.0, .1)

def subject(voice, t0, root, octv, step=E16, v=.6):
    sh = root == 4
    for i, d in enumerate(SUBJ):
        voice(t0 + i * step, pitch(root + d, octv, sh), step * .95, v * (1.0 if i % 4 == 0 else .82))
def counter(voice, t0, root, octv, v=.55):
    sh = root == 4
    for i, d in enumerate(CTR): voice(t0 + i * E8, pitch(root + d, octv, sh), E8 * .95, v * (1.0 if i % 2 == 0 else .85))
def bass(t0, root, n_beats=4):
    sh = root == 4
    for b in range(0, n_beats, 2): harp(t0 + b * BEAT, pitch(root, -2, sh) if b == 0 else pitch(root + 4, -2, sh))

# bars 1–2: one voice, hurried and off the beat; it stops dead when the halves miss (5.0)
rng = np.random.default_rng(15)
t = E16
while t < bar(3) - E16:
    d = int(rng.integers(-2, 5)); rh(t, pitch(d, 0), E16 * .9, .5 + .1 * rng.random()); t += E16 * (1 if rng.random() < .7 else 2)
# bars 3–4: silence (paper only)
# bars 5–6: the invention begins: subject, then the answer under a countersubject
subject(rh, bar(5), 0, 0)
subject(lh, bar(6), 3, -1); counter(rh, bar(6), 3, 0)
# bars 7–19: the two voices trade the subject through the progression, harp bass underneath
for i, n in enumerate(range(7, 20)):
    root = PROG[i % 8]
    if i % 2 == 0: subject(rh, bar(n), root, 0); counter(lh, bar(n), root, -1)
    else: subject(lh, bar(n), root, -1); counter(rh, bar(n), root, 0)
    bass(bar(n), root)
# bars 20–21: thinned to one voice and bass (the small change)
for i, n in enumerate(range(20, 22)):
    root = [0, 4][i]; counter(rh, bar(n), root, 0, .5); bass(bar(n), root)
# bar 22 (from 51.25): full again (the new product)
subject(rh, bar(21, 2), 0, 0); counter(lh, bar(21, 2), 0, -1)
subject(lh, bar(22), 4, -1); counter(rh, bar(22), 4, 0); bass(bar(22), 4)
# bars 23–25: the theme in augmentation over running sixteenths, stops dead at 61.9
for i, n in enumerate(range(23, 26)):
    root = [0, 3, 4][i]
    for k, d in enumerate(SUBJ[:8]):
        if bar(n) + k * E8 < 61.9: rh(bar(n) + k * E8, pitch(root + d, 1, root == 4), E8 * .95, .62)
    for k, d in enumerate(SUBJ):
        if bar(n) + k * E16 < 61.9: lh(bar(n) + k * E16, pitch(root + d, -1, root == 4), E16 * .95, .5)
    bass(bar(n), root)
# bar 26: the stamp: a full cadence, D major (tierce de Picardie)
for m, v in ((50, .8), (57, .7), (62, .75), (66, .7), (69, .7), (74, .65)): rh(62.5, m, 2.4, v)
harp(62.5, 38, 3.0, .8); glock(62.5, 86, .7, 2.5); glock(62.5, 90, .5, 2.5)
# bars 27–29: the theme once, quietly; final chord
for k, d in enumerate(SUBJ[:8]): rh(bar(27) + k * E8, pitch(d, 0), E8 * .95, .45)
counter(lh, bar(28), 0, -1, .4)
for m in (50, 57, 62, 65, 69): lh(bar(29) - BEAT, m, 3.0, .5)
harp(bar(29) - BEAT, 38, 3.5, .6); glock(bar(29) - BEAT, 86, .4, 2.5)

# the checks: one glockenspiel note per passed check, rising
for i, tt in enumerate([42.2, 42.7, 43.2, 43.7]): glock(tt, [81, 83, 85, 86][i], .55)
glock(46.3, 88, .6)

# hard stops for the silence before the stamp
def stop(a, b, fade=.02):
    tt = np.arange(N) / SR; g = np.ones(N, np.float32)
    g[(tt >= a) & (tt < b)] = 0
    r = (tt >= a - fade) & (tt < a); g[r] = (a - tt[r]) / fade
    for k in st: st[k] *= g[:, None]
stop(bar(3), bar(3) + .6)            # the bridge misses: the hurried voice is cut
stop(61.9, 62.5)

st['glock'] = np.stack([lp(st['glock'][:, i], 6000) for i in range(2)], 1).astype(np.float32)
st['harp'] *= 1.2
mix = sum(st.values())
mix *= .89 / np.abs(mix).max()
mix = np.stack([limit(mix[:, i], .9) for i in range(2)], 1)
sf.write(os.path.join(HERE, 'score.wav'), mix, SR, subtype='PCM_24')
rms = lambda a, b: round(float(20 * np.log10(np.sqrt(np.mean(mix[int(a * SR):int(b * SR)] ** 2)) + 1e-9)), 1)
print('score ok', {f'{a}-{b}': rms(a, b) for a, b in [(0, 5), (5.6, 10), (10, 15), (15, 30), (30, 47.5), (47.5, 51), (51, 55), (55, 61.9), (61.9, 62.5), (62.5, 65), (65, 72.5)]})
print('\n'.join(S.credits(['harpsichord', 'harp', 'glockenspiel'])))

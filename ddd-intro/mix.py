"""Mix one language: score + voice + procedural drafting foley -> out/mix-<lang>.wav
Foley follows the materials: technical pen on paper (2–6 kHz grain, as long as the stroke), lettering bursts,
eraser rub, ruler slide, compass squeak, paper slap and slide, a wooden clunk per load step, an escapement tick
per check, a dry crack, rubber stamp thump, pen cap click. Dry, close, no reverb.
Run after events.mjs: LIB=<lib> $LIB/.venv/bin/python mix.py en|zh"""
import json, os, sys
import numpy as np, soundfile as sf
from scipy.signal import resample_poly
from scipy.ndimage import maximum_filter1d, uniform_filter1d

HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, os.path.join(os.environ['LIB'], 'core', 'audio'))
import sfx
from sfx import SR, t_, env_exp, bp, lp, hp, noise, norm, add

LANG = sys.argv[1]
rng = np.random.default_rng(7)
ev = json.load(open(os.path.join(HERE, 'events.json')))
DUR = ev['dur']; N = int(DUR * SR)

def grain(d, lo, hi, rate):
    """paper grain: band-passed noise chopped into micro-strokes"""
    x = bp(noise(d), lo, hi); tt = t_(d)
    am = .55 + .45 * np.abs(np.sin(2 * np.pi * rate * tt + rng.random() * 6)) ** 3
    return x * am
def env_ad(d, a=.01, r=.05):
    tt = t_(d); return np.minimum(1, tt / a) * np.minimum(1, np.maximum(0, d - tt) / r)
def pen(d): d = max(.08, d); return norm(grain(d, 2000, 6000, 9) * env_ad(d, .015, .04))
def scratch(d): d = max(.08, d); return norm(grain(d, 1500, 5000, 14) * env_ad(d, .005, .03) * (1 + .5 * np.sin(np.pi * t_(d) / d)))
def letter(d):
    d = max(.1, d); x = np.zeros(int(d * SR)); k = 0
    while k < len(x) - 2000:
        L = int((.04 + .05 * rng.random()) * SR); s = bp(noise(L / SR), 2500, 7000) * np.sin(np.linspace(0, np.pi, L)) ** 2
        x[k:k + L] += s[:len(x) - k]; k += L + int(.02 * SR * rng.random())
    return norm(x)
def eraser(d): tt = t_(d); return norm(bp(noise(d), 300, 2500) * (.6 + .4 * np.sin(2 * np.pi * 7 * tt)) ** 2 * env_ad(d, .05, .1))
def ruler(d): d = max(.1, d); return norm(bp(noise(d), 600, 3000) * env_ad(d, .02, .05) + lp(noise(d), 300) * .2)
def compass(d): tt = t_(d); f = 2400 + 300 * np.sin(2 * np.pi * 3 * tt); return norm(np.sin(2 * np.pi * np.cumsum(f) / SR) * .15 * env_ad(d) + grain(d, 2000, 5000, 6) * env_ad(d))
def slap():
    d = .25; tt = t_(d); return norm(lp(noise(d), 900) * env_exp(d, .03) + np.sin(2 * np.pi * 110 * tt) * env_exp(d, .04) * .6 + hp(noise(d), 3000) * env_exp(d, .006) * .4)
def slide(): d = .35; return norm(bp(noise(d), 500, 4000) * np.sin(np.pi * t_(d) / d) ** 1.5)
def paper(): d = .18; return norm(bp(noise(d), 800, 6000) * np.sin(np.pi * t_(d) / d) ** 2)
def tick(): d = .03; tt = t_(d); return norm(np.sin(2 * np.pi * 3600 * tt) * env_exp(d, .004) + hp(noise(d), 5000) * env_exp(d, .001) * .5)
def check():
    d = .06; tt = t_(d); return norm(sum(a * np.sin(2 * np.pi * f * tt) * env_exp(d, tau) for f, a, tau in [(3900, .6, .008), (5200, .4, .005), (1700, .4, .012)]) + hp(noise(d), 3000) * env_exp(d, .002) * .5)
def clunk():
    d = .16; tt = t_(d); return norm(np.sin(2 * np.pi * 180 * tt) * env_exp(d, .03) + bp(noise(d), 400, 2000) * env_exp(d, .01) * .7)
def crack():
    d = .3; x = np.zeros(int(d * SR))
    for k in range(5): s = int(rng.random() * .12 * SR); c = hp(noise(.02), 2000) * env_exp(.02, .003); x[s:s + len(c)] += c
    return norm(x + lp(noise(d), 500) * env_exp(d, .05) * .4)
def ding(): return sfx.ding()[:int(.8 * SR)] * np.linspace(1, 0, int(.8 * SR)) ** 2
def stamp():
    d = .4; tt = t_(d); return norm(np.sin(2 * np.pi * 70 * tt * (1 - .2 * tt)) * env_exp(d, .07) + lp(noise(d), 700) * env_exp(d, .02) * .8 + hp(noise(d), 2500) * env_exp(d, .004) * .3)
def cap(): d = .05; tt = t_(d); return norm(hp(noise(d), 1500) * env_exp(d, .003) + np.sin(2 * np.pi * 2600 * tt) * env_exp(d, .006) * .7)
def hatchf(d): return scratch(d) * .8

FOLEY = {
    'pen': (lambda e: pen(e['d']), .10), 'scratch': (lambda e: scratch(e['d']), .14), 'letter': (lambda e: letter(e['d']), .07),
    'eraser': (lambda e: eraser(e['d']), .16), 'ruler': (lambda e: ruler(e['d']), .10), 'compass': (lambda e: compass(e['d']), .08),
    'slap': (lambda e: slap(), .30), 'slide': (lambda e: slide(), .12), 'paper': (lambda e: paper(), .10), 'tick': (lambda e: tick(), .10),
    'check': (lambda e: check(), .18), 'clunk': (lambda e: clunk(), .26), 'crack': (lambda e: crack(), .30), 'ding': (lambda e: ding(), .06),
    'stamp': (lambda e: stamp(), .55), 'cap': (lambda e: cap(), .16), 'hatch': (lambda e: hatchf(e['d']), .08),
}
fol = np.zeros((N, 2))
for e in ev['ev']:
    if e['type'] == 'vo': continue
    fn, gain = FOLEY[e['type']]
    add(fol, fn(e).astype(np.float64), e['t'], gain * e.get('g', 1), pan=float(rng.uniform(-.25, .25)))
fol *= .5

# voice
vo = np.zeros((N, 2)); vad = np.zeros(N)
for e in ev['ev']:
    if e['type'] != 'vo': continue
    y, sr = sf.read(os.path.join(HERE, f'voice-{LANG}', e['id'] + '.wav'))
    if y.ndim > 1: y = y.mean(1)
    y = resample_poly(y, SR, sr); y = hp(y, 90)
    y = sfx.compress(y / (np.abs(y).max() + 1e-9), thr=.3, ratio=3, att=.003, rel=.1)
    add(vo, norm(y, .9), e['t'], .72)
    s = int(e['t'] * SR); vad[s:s + len(y)] = 1
vad = maximum_filter1d(vad, size=int(.16 * SR)); vad = uniform_filter1d(vad, size=int(.25 * SR))
duck = 1 - .64 * vad          # music ~0.36× under the voice

mus, msr = sf.read(os.path.join(HERE, 'music', 'score.wav')); assert msr == SR
mus = mus[:N] if len(mus) >= N else np.pad(mus, ((0, N - len(mus)), (0, 0)))
mus = mus * duck[:, None] * .75

mix = mus + vo + fol
mix *= 1.6
for c in range(2): mix[:, c] = sfx.limit(mix[:, c], .6)
assert np.isfinite(mix).all()
os.makedirs(os.path.join(HERE, 'out'), exist_ok=True)
# 20 s of trailing silence: ffmpeg 6.1's loudnorm look-ahead makes mux.sh's decode check misread the length
sf.write(os.path.join(HERE, 'out', f'mix-{LANG}.wav'), np.concatenate([mix, np.zeros((20 * SR, 2))]).astype(np.float32), SR, subtype='FLOAT')
db = lambda x: 20 * np.log10(np.sqrt(np.mean(x ** 2)) + 1e-9)
print(LANG, 'peak %.2f dBFS' % (20 * np.log10(np.abs(mix).max())))
for e in ev['ev']:
    if e['type'] == 'vo':
        s = int(e['t'] * SR); n = int(sf.info(os.path.join(HERE, f'voice-{LANG}', e['id'] + '.wav')).duration * SR)
        print(f"{e['id']} voice {db(vo[s:s+n]):6.1f} music {db(mus[s:s+n]):6.1f} foley {db(fol[s:s+n]):6.1f}")

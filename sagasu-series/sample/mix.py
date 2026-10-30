"""Sample mix: a 120 BPM newsroom pulse (synth kick, hats, bass, a timpani hit), package foley, voice ducked over it."""
import json, os, sys
import numpy as np, soundfile as sf
from scipy.signal import resample_poly
from scipy.ndimage import maximum_filter1d, uniform_filter1d
HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, os.path.join(os.environ['LIB'], 'core', 'audio'))
import sfx
from sfx import SR, t_, env_exp, bp, lp, hp, noise, norm, add
ev = json.load(open(os.path.join(HERE, 'events.json'))); DUR = ev['dur']; N = int(DUR * SR)
mus = np.zeros((N, 2)); fol = np.zeros((N, 2)); vo = np.zeros((N, 2)); vad = np.zeros(N)
hz = lambda m: 440 * 2 ** ((m - 69) / 12)
def kick(): d = .3; tt = t_(d); return norm(np.sin(2 * np.pi * np.cumsum(55 + 90 * np.exp(-tt / .03)) / SR) * env_exp(d, .09))
def hat(): d = .05; return norm(hp(noise(d), 7000) * env_exp(d, .012))
def bass(m, d=.22): tt = t_(d); x = np.sin(2 * np.pi * hz(m) * tt) + .3 * np.sin(4 * np.pi * hz(m) * tt); return x * env_exp(d, .12) * np.minimum(1, (d - tt) / .02)
def timp(): d = 1.2; tt = t_(d); return norm(np.sin(2 * np.pi * 70 * tt * (1 - .05 * tt)) * env_exp(d, .35) + lp(noise(d), 300) * env_exp(d, .05) * .5)
BEAT = .5; t0 = 1.5
for i in range(int((DUR - t0) / BEAT)):
    t = t0 + i * BEAT
    if i % 2 == 0: add(mus, kick(), t, .55)
    add(mus, hat(), t + .25, .12)
    add(mus, bass([45, 45, 48, 43][(i // 4) % 4]), t, .22)
add(mus, timp(), 1.5, .5); add(mus, timp(), 9.0, .35)
FOL = {
  'slash': (lambda: sfx.whoosh(.18), .25), 'impact': (lambda: norm(timp()[:int(.5 * SR)] + hp(noise(.5), 2000) * env_exp(.5, .02)), .7),
  'glint': (lambda: sfx.ding()[:int(.6 * SR)] * np.linspace(1, 0, int(.6 * SR)), .08), 'whoosh': (lambda: sfx.whoosh(.35), .3),
  'band': (lambda: sfx.whoosh(.3), .35), 'strap': (lambda: sfx.whoosh(.4), .2),
  'flip': (lambda: norm(hp(noise(.04), 2500) * env_exp(.04, .006) + np.sin(2 * np.pi * 1800 * t_(.04)) * env_exp(.04, .008) * .5), .25),
  'tick': (lambda: norm(np.sin(2 * np.pi * 2400 * t_(.08)) * env_exp(.08, .02)), .12),
  'stamp': (lambda: norm(np.sin(2 * np.pi * 65 * t_(.4)) * env_exp(.4, .07) + lp(noise(.4), 800) * env_exp(.4, .02)), .7),
}
for e in ev['ev']:
    if e['type'] == 'vo':
        y, sr = sf.read(os.path.join(HERE, 'voice', e['id'] + '.wav')); y = y.mean(1) if y.ndim > 1 else y
        y = sfx.compress(hp(resample_poly(y, SR, sr), 90) / (np.abs(y).max() + 1e-9), thr=.3, ratio=3)
        add(vo, norm(y, .9), e['t'], .75); s = int(e['t'] * SR); vad[s:s + len(y)] = 1
    else: fn, gain = FOL[e['type']]; add(fol, fn(), e['t'], gain)
vad = uniform_filter1d(maximum_filter1d(vad, int(.16 * SR)), int(.25 * SR))
mix = mus * (1 - .7 * vad)[:, None] * .7 + fol * .6 + vo
mix *= 1.6
for c in range(2): mix[:, c] = sfx.limit(mix[:, c], .6)
os.makedirs(os.path.join(HERE, 'out'), exist_ok=True)
sf.write(os.path.join(HERE, 'out', 'mix.wav'), np.concatenate([mix, np.zeros((60 * SR, 2))]).astype(np.float32), SR, subtype='FLOAT')
print('mix ok, peak %.1f dBFS' % (20 * np.log10(np.abs(mix).max())))

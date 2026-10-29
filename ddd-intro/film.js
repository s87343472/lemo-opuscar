// The Drawing Comes First: one sheet, one bridge, five figures. 96 BPM, 29 bars.
// The person builds from the left bank, the agent from the right; without a drawing the halves miss.
import { W, H, ov, setCam, clear, proj, line, text, textW, dim, balloon, hatch, knock, LW, FONT, rect, circ, ell, S, cam, NIBS, f, camMatrix } from './draw.js';
import { TXT, INSTALL, REPO } from './content.js';

const clamp = (x, a = 0, b = 1) => Math.max(a, Math.min(b, x));
const lerp = (a, b, t) => a + (b - a) * t;
const seg = (t, a, b) => clamp((t - a) / (b - a));
const eio = t => { t = clamp(t); return t < .5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2; };
const eo = t => 1 - Math.pow(1 - clamp(t), 3);
export const BEAT = 60 / 96, BAR = BEAT * 4, DUR = 72.5;
export const SW = 6400, SH = 3600;

let L = 'en', T = TXT.en, LINES = [], DURS = {}, WORDS = {};
const LINE_T = { l01: .8, l02: 4.6, l03: 10.0, l04: 15.4, l05: 25.2, l06: 30.6, l07: 37.8, l08: 44.0, l09: 47.8, l10: 55.3, l11: 63.6, l12: 66.4 };
export function setup(lang, lines, durs, words) {
  L = lang; T = TXT[lang]; LINES = lines; DURS = durs; WORDS = words;
  Object.assign(FONT, T.font);
}
const dr = (t, t0, d) => seg(t, t0, t0 + d);   // draw-on progress

// ---------------------------------------------------------------- sheet layout
const C1 = [140, 440, 1700, 1900], C2 = [1760, 440, 3320, 1900], C3 = [3380, 440, 4940, 1900];
const C4 = [140, 2000, 3320, 3440], C5 = [3380, 2000, 4940, 3440];
const NX = 5020, NX1 = 6300;
const TB = { x0: 5020, y0: 2600, x1: 6300, y1: 3440 };

function border() {
  line(rect(46, 46, SW - 46, SH - 46), { w: LW.hair, closed: true, nib: false });
  line(rect(80, 80, SW - 80, SH - 80), { w: LW.out * 1.3, closed: true, nib: false });
  for (let i = 1; i < 10; i++) { const x = 80 + (SW - 160) * i / 10; line([[x, 46], [x, 80]], { w: LW.hair, nib: false }); line([[x, SH - 80], [x, SH - 46]], { w: LW.hair, nib: false }); }
  for (let i = 1; i < 6; i++) { const y = 80 + (SH - 160) * i / 6; line([[46, y], [80, y]], { w: LW.hair, nib: false }); line([[SW - 80, y], [SW - 46, y]], { w: LW.hair, nib: false }); }
  for (let i = 0; i < 10; i++) { const x = 80 + (SW - 160) * (i + .5) / 10; text(String(10 - i), x, 73, { size: 22, align: 'center', font: 'B612', v: .8 }); text(String(10 - i), x, SH - 55, { size: 22, align: 'center', font: 'B612', v: .8 }); }
  for (let i = 0; i < 6; i++) { const y = 80 + (SH - 160) * (i + .5) / 6 + 8; text('FEDCBA'[i], 63, y, { size: 22, align: 'center', font: 'B612', v: .8 }); text('FEDCBA'[i], SW - 63, y, { size: 22, align: 'center', font: 'B612', v: .8 }); }
  for (const c of [C1, C2, C3, C4, C5]) line(rect(...c), { w: LW.hair, closed: true, v: .4, nib: false });
  line([[NX - 30, 400], [NX - 30, SH - 120]], { w: LW.thin, v: .7, nib: false });
}

function header(t) {
  const u = dr(t, 11.4, 1.6), u2 = dr(t, 12.9, .8);
  const size = L === 'zh' ? 170 : 132, ls = L === 'zh' ? 30 : 14;
  text(T.title, 170, 262, { size, font: FONT.hand, ls, u });
  const w = textW(T.title, size, FONT.hand, ls);
  line([[170, 292], [170 + w, 292]], { w: LW.out, u: u2 });
  line([[170, 302], [170 + w, 302]], { w: LW.hair, u: u2 });
  text(T.sub1, 172, 350, { size: 40, font: FONT.tech, weight: 700, ls: L === 'zh' ? 4 : 8, u: dr(t, 13.4, .7) });
  text(T.sub2, 172, 392, { size: 26, font: FONT.tech, ls: 2, u: dr(t, 13.9, .7), v: .9 });
}

function figLabel(i, x, y, u) {
  text(T.fig[i], x, y, { size: 52, font: FONT.hand, ls: L === 'zh' ? 6 : 4, u });
  const w = textW(T.fig[i], 52, FONT.hand, L === 'zh' ? 6 : 4);
  line([[x, y + 16], [x + w, y + 16]], { w: LW.det, u: clamp(u * 2 - 1), nib: false });
}

// ---------------------------------------------------------------- small pictograms
function person(x, gy, u = 1, v = 1) {
  if (u <= 0) return;
  line(circ(x, gy - 176, 30, 32), { w: LW.det, u: clamp(u * 3), v });
  line([[x, gy - 146], [x, gy - 70]], { w: LW.det, u: clamp(u * 3 - 1), v, nib: false });
  line([[x - 28, gy], [x, gy - 70], [x + 28, gy]], { w: LW.det, u: clamp(u * 3 - 1.5), v, nib: false });
  line([[x - 40, gy - 92], [x, gy - 124], [x + 44, gy - 106]], { w: LW.det, u: clamp(u * 3 - 2), v, nib: false });
}
function agent(x, gy, u = 1, v = 1) {
  if (u <= 0) return;
  line(rect(x - 80, gy - 210, x + 80, gy - 90), { w: LW.det, closed: true, u: clamp(u * 2), v });
  line([[x, gy - 90], [x, gy - 40]], { w: LW.det, u: clamp(u * 3 - 1), v, nib: false });
  line([[x - 50, gy], [x, gy - 40], [x + 50, gy]], { w: LW.det, u: clamp(u * 3 - 1.4), v, nib: false });
  line([[x, gy - 210], [x, gy - 246]], { w: LW.det, u: clamp(u * 3 - 1.8), v, nib: false });
  line(circ(x, gy - 256, 10, 16), { w: LW.thin, u: clamp(u * 3 - 2), v, nib: false });
  if (u > .6) text('> _', x - 58, gy - 135, { size: 44, font: 'B612', v, nib: false, u: clamp(u * 3 - 1.8) });
}
function tick(x, y, s, u, v = 1) { line([[x, y], [x + 10 * s, y + 12 * s], [x + 32 * s, y - 16 * s]], { w: LW.out, u, v }); }
// a scalloped revision cloud around an ellipse
function cloud(cx, cy, rx, ry, u, n = 14) {
  const P = [];
  for (let i = 0; i < n; i++) {
    const a0 = i / n * Math.PI * 2, a1 = (i + 1) / n * Math.PI * 2;
    const p0 = [cx + Math.cos(a0) * rx, cy + Math.sin(a0) * ry], p1 = [cx + Math.cos(a1) * rx, cy + Math.sin(a1) * ry];
    const mx = (p0[0] + p1[0]) / 2, my = (p0[1] + p1[1]) / 2, r = Math.hypot(p1[0] - p0[0], p1[1] - p0[1]) / 2;
    const base = Math.atan2(p1[1] - p0[1], p1[0] - p0[0]);
    for (let k = 0; k <= 8; k++) { const a = base + Math.PI + k / 8 * Math.PI; P.push([mx + Math.cos(a) * r, my + Math.sin(a) * r]); }
  }
  line(P, { w: LW.det, u });
}
// a hurried line: hand wobble along the normal
function wob(pts, amp, seed) {
  const out = [];
  for (let i = 0; i < pts.length - 1; i++) {
    const [a, b] = [pts[i], pts[i + 1]], n = Math.max(2, Math.round(Math.hypot(b[0] - a[0], b[1] - a[1]) / 40));
    const nx = -(b[1] - a[1]) / (Math.hypot(b[0] - a[0], b[1] - a[1]) || 1), ny = (b[0] - a[0]) / (Math.hypot(b[0] - a[0], b[1] - a[1]) || 1);
    for (let k = 0; k < n; k++) { const s = k / n, o = amp * Math.sin(seed + (i * n + k) * 1.7) * Math.sin(s * Math.PI + .3); out.push([lerp(a[0], b[0], s) + nx * o, lerp(a[1], b[1], s) + ny * o]); }
  }
  out.push(pts[pts.length - 1]);
  return out;
}

// ---------------------------------------------------------------- FIG. 4 world: banks, river, the bridge
const GY = 2900, ARCH = x => 2600 + 300 * ((x - 1730) / 790) ** 2;
function banks(t, v = 1) {
  const u = dr(t, 0, 1.2);
  line([[160, GY], [900, GY], [980, 3060], [2480, 3060], [2560, GY], [3300, GY]], { w: LW.out, u, v });
  const uw = dr(t, .6, 1.0), wave = [];
  for (let x = 950; x <= 2510; x += 20) wave.push([x, 2960 + 6 * Math.sin(x / 38)]);
  line(wave, { w: LW.thin, u: uw, v: .8 * v, nib: false });
  if (t > 1.2) {
    hatch([[160, GY], [900, GY], [950, 3000], [160, 3000]], { u: dr(t, 1.2, .8), sp: 16 });
    hatch([[2560, GY], [3300, GY], [3300, 3000], [2510, 3000]], { u: dr(t, 1.4, .8), sp: 16 });
  }
}
// the hook: two half-spans that miss
const HALF_L = [[[760, 2500], [1800, 2500]], [[760, 2560], [1800, 2560]], [[1800, 2500], [1800, 2560]], [[880, 2560], [800, GY]], [[1140, 2560], [960, GY]]];
const HALF_R = [[[2700, 2640], [1660, 2640]], [[2700, 2700], [1660, 2700]], [[1660, 2640], [1660, 2700]], [[2580, 2700], [2660, GY]], [[2320, 2700], [2500, GY]]];
function halves(t) {
  const erase = x => 1 - .84 * clamp((t - 7.5 - (x - 700) / 2700 * 1.9) / .25);
  HALF_L.forEach((p, i) => { const u = dr(t, .8 + i * .28, .45); line(wob(p, 5, i * 3.1), { w: LW.out, u, v: erase((p[0][0] + p[1][0]) / 2) }); });
  HALF_R.forEach((p, i) => { const u = dr(t, 2.3 + i * .28, .45); line(wob(p, 5, i * 2.3 + 9), { w: LW.out, u, v: erase((p[0][0] + p[1][0]) / 2) }); });
  if (t < 7.5 + 2.2) {
    const ve = clamp(1 - (t - 7.5) / 1.6);
    dim([760, 2330], [1060, 2330], 0, T.saved, { u: dr(t, 3.4, .8) * ve, size: 64, font: FONT.hand });
    dim([1060, 2330], [3200, 2330], 0, T.debug, { u: dr(t, 4.7, 2.0) * ve, size: 110, font: FONT.hand });
    if (t > 5.4) {
      line([[1720, 2560], [1720, 2640]], { w: LW.hair, u: dr(t, 5.4, .3) * ve, nib: false });
      text(T.miss, 1760, 2622, { size: 60, u: dr(t, 5.7, .5) * ve, font: FONT.hand });
    }
  }
}
function bridge(t) {
  const t0 = 37.6;
  line([[700, 2530], [2760, 2530]], { w: LW.hair, dash: 'center', u: dr(t, 10.2, 1.4), v: .8 });        // the new centre line, drawn in the hook
  line([[1730, 2380], [1730, 3090]], { w: LW.hair, dash: 'center', u: dr(t, t0, .5), v: .8 });
  if (t < t0) return;
  const k = x => dr(t, t0 + x, .55);
  line(rect(760, 2500, 2700, 2560), { w: LW.out, closed: true, u: k(.3) });
  line(rect(760, 2560, 940, GY), { w: LW.out, closed: true, u: k(.6) });
  line(rect(2520, 2560, 2700, GY), { w: LW.out, closed: true, u: k(.7) });
  const arch = []; for (let x = 940; x <= 2520; x += 20) arch.push([x, ARCH(x)]);
  line(arch, { w: LW.out, u: dr(t, t0 + 1.0, .6) });
  const inner = []; for (let x = 990; x <= 2470; x += 20) inner.push([x, ARCH(x) + 34]);
  line(inner, { w: LW.det, u: dr(t, t0 + 1.2, .6) });
  for (let i = 0, x = 1100; x < 2400; x += 158, i++) line([[x, 2560], [x, ARCH(x)]], { w: LW.det, u: dr(t, t0 + 1.6 + i * .06, .25), nib: false });
  hatch(rect(764, 2504, 2696, 2556), { u: dr(t, t0 + 2.0, .5), sp: 12 });
  dim([940, GY], [2520, GY], 210, '48 000', { u: dr(t, t0 + 2.3, .6), size: 40 });
  dim([2520, 2600], [2520, GY], -330, '9 000', { u: dr(t, t0 + 2.5, .6), size: 36 });
}
// the load test: a cart steps across, one check per step
const STEPS = [42.0, 42.5, 43.0, 43.5];
function load(t) {
  if (t < 41.4 || t > 47.4) return;
  let x = 800; STEPS.forEach((s, i) => { x += 455 * eo((t - s) / .3) * (t > s ? 1 : 0); });
  const y = 2500, w = 160;
  line(rect(x, y - 70, x + w, y - 10), { w: LW.det, closed: true, u: dr(t, 41.4, .3) });
  line(circ(x + 32, y - 6, 8, 16), { w: LW.thin, nib: false, u: dr(t, 41.6, .2) }); line(circ(x + w - 32, y - 6, 8, 16), { w: LW.thin, nib: false, u: dr(t, 41.6, .2) });
  text(L === 'zh' ? '3 吨' : '3 T', x + w / 2, y - 26, { size: 30, align: 'center', u: dr(t, 41.6, .3), font: FONT.hand });
}
const TBL = { x0: 1900, x1: 3260, y0: 3110, rh: 44 };
function checks(t) {
  if (t < 40.2) return;
  const { x0, x1, y0, rh } = TBL, n = 6;
  line(rect(x0, y0, x1, y0 + rh * (n + 1)), { w: LW.det, closed: true, u: dr(t, 40.2, .5) });
  for (let i = 1; i <= n; i++) line([[x0, y0 + rh * i], [x1, y0 + rh * i]], { w: LW.hair, u: dr(t, 40.4 + i * .04, .3), nib: false });
  line([[x0 + 70, y0 + rh], [x0 + 70, y0 + rh * 6]], { w: LW.hair, u: dr(t, 40.5, .3), nib: false });
  line([[x1 - 90, y0 + rh], [x1 - 90, y0 + rh * 6]], { w: LW.hair, u: dr(t, 40.5, .3), nib: false });
  text(T.checksHead, x0 + 14, y0 + 32, { size: 26, font: FONT.tech, weight: 700, ls: 3, u: dr(t, 40.4, .4) });
  const rows = [...T.checks, T.bugCheck];
  rows.forEach((s, i) => {
    const y = y0 + rh * (i + 2) - 12, tIn = i < 4 ? 40.6 + i * .15 : 45.3;
    text(String(i + 1), x0 + 35, y, { size: 28, align: 'center', u: dr(t, tIn, .3), font: FONT.hand, nib: false });
    text(s, x0 + 86, y, { size: 28, u: dr(t, tIn, .5), font: FONT.hand });
    const tt = i < 4 ? STEPS[i] + .2 : 46.3;
    if (t > tt) tick(x1 - 62, y - 10, .9, dr(t, tt, .18));
  });
  // the one command
  const cy = y0 + rh * 7 + 34;
  text(T.cmd, x0 + 14, cy, { size: 30, font: 'B612', u: dr(t, 41.5, .5) });
  const cw = textW(T.cmd + '  →  ', 30, 'B612');
  if (t > 43.8 && t < 46.5) text(T.pass(4), x0 + 14 + cw, cy, { size: 30, font: 'B612', weight: 700, u: dr(t, 43.8, .4) });
  if (t >= 45.8 && t < 46.5) line([[x0 + 10 + cw, cy - 10], [x0 + 22 + cw + textW(T.pass(4), 30, 'B612'), cy - 10]], { w: LW.det, u: dr(t, 45.8, .25), nib: false });
  if (t >= 46.5) text(T.pass(5), x0 + 14 + cw, cy, { size: 30, font: 'B612', weight: 700, u: dr(t, 46.5, .4) });
  if (t > 41.5) text('→', x0 + 14 + textW(T.cmd + '  ', 30, 'B612'), cy, { size: 30, font: 'B612', u: dr(t, 41.9, .2), nib: false });
}
function crack(t) {
  if (t < 44.3) return;
  line([[1700, 2604], [1716, 2618], [1704, 2630], [1722, 2646], [1712, 2660]], { w: LW.det, u: dr(t, 44.3, .25) });
  cloud(1716, 2632, 120, 78, dr(t, 44.6, .6));
  const tx = 1880, ty = 2560;
  line([[tx, ty - 30], [tx + 30, ty + 22], [tx - 30, ty + 22]], { w: LW.det, closed: true, u: dr(t, 45.0, .3) });
  text('1', tx, ty + 14, { size: 30, align: 'center', u: dr(t, 45.2, .2), nib: false });
}

// ---------------------------------------------------------------- FIG. 1 business core
function fig1(t) {
  if (t < 15.0) return;
  const k = (a, d = .6) => dr(t, a, d);
  line([[220, 1450], [700, 1450], [760, 1530], [1080, 1530], [1140, 1450], [1620, 1450]], { w: LW.out, u: k(15.2, .8) });
  hatch([[220, 1450], [700, 1450], [730, 1490], [220, 1490]], { u: k(15.8, .5), sp: 14 });
  hatch([[1140, 1450], [1620, 1450], [1620, 1490], [1110, 1490]], { u: k(15.9, .5), sp: 14 });
  [300, 380, 460].forEach((x, i) => person(x, 1450, k(16.2 + i * .15, .5)));
  balloon([380, 1290], [260, 1010], 1, { u: k(16.7) }); text(T.core[0], 300, 1020, { size: 30, u: k(16.9), font: FONT.hand });
  const arc = []; for (let i = 0; i <= 40; i++) { const s = i / 40; arc.push([lerp(520, 1330, s), 1330 - 150 * Math.sin(s * Math.PI)]); }
  line(arc, { w: LW.det, dash: 'hidden', u: k(17.6, 1.0) });
  if (t > 18.6) { const a = arc[40], b = arc[38]; line([[a[0] - 22, a[1] - 18], a, [a[0] - 26, a[1] + 10]], { w: LW.det, u: k(18.6, .2), nib: false }); }
  [[.18, '1'], [.5, '2'], [.82, '3']].forEach(([s, n], i) => { const p = arc[Math.round(s * 40)]; if (t > 17.8 + i * .3) { knock(circ(p[0], p[1], 18, 20)); line(circ(p[0], p[1], 18, 24), { w: LW.thin, u: k(17.8 + i * .3, .2), nib: false }); text(n, p[0], p[1] + 9, { size: 22, align: 'center', font: 'B612', nib: false }); } });
  balloon([930, 1190], [760, 1010], 2, { u: k(18.7) }); text(T.core[1], 800, 1020, { size: 30, u: k(18.9), font: FONT.hand });
  line([[640, 1450], [640, 1260]], { w: LW.det, u: k(19.3, .3) });
  line(rect(560, 1190, 720, 1260), { w: LW.det, closed: true, u: k(19.5, .4) });
  text(T.rulePlate, 640, 1236, { size: 28, align: 'center', font: FONT.tech, weight: 700, u: k(19.8, .4) });
  balloon([560, 1225], [260, 1120], 3, { u: k(20.0) }); text(T.core[2], 300, 1130, { size: 30, u: k(20.2), font: FONT.hand });
  line([[700, 1490], [1140, 1490]], { w: LW.thin, dash: 'phantom', u: k(20.5, .5) });
  text(T.flood, 790, 1590, { size: 28, font: FONT.hand, u: k(20.8, .4) });
  balloon([1000, 1490], [760, 1120], 4, { u: k(20.9) }); text(T.core[3], 800, 1130, { size: 30, u: k(21.1), font: FONT.hand });
  line([[1450, 1450], [1450, 1250]], { w: LW.det, u: k(21.5, .3) });
  line([[1450, 1250], [1540, 1280], [1450, 1310]], { w: LW.det, u: k(21.7, .3), nib: false });
  balloon([1450, 1260], [1260, 1010], 5, { u: k(21.9) }); text(T.core[4], 1300, 1020, { size: 30, u: k(22.1), font: FONT.hand });
  if (t > 22.6) {
    const pw = textW(T.plain, 34, FONT.hand);
    line(rect(210, 1630, 300 + pw, 1700), { w: LW.thin, closed: true, u: k(22.6, .4), nib: false });
    tick(232, 1666, .9, k(22.8, .2));
    text(T.plain, 280, 1678, { size: 34, u: k(22.9, .6), font: FONT.hand });
  }
  figLabel(0, 1000, 1690, k(15.4, .8));
}

// ---------------------------------------------------------------- FIG. 2 check what exists
function fig2(t) {
  if (t < 25.0) return;
  const k = (a, d = .6) => dr(t, a, d);
  text(T.priorHead, 1840, 960, { size: 34, font: FONT.tech, weight: 700, ls: 3, u: k(25.6, .5) });
  const xs = [2030, 2540, 3050], g = 1350;
  xs.forEach((cx, i) => {
    const t0 = 25.9 + i * .5;
    line([[cx - 230, g], [cx + 230, g]], { w: LW.det, u: k(t0, .3) });
    hatch([[cx - 230, g], [cx + 230, g], [cx + 230, g + 30], [cx - 230, g + 30]], { u: k(t0 + .2, .3), sp: 12 });
    if (i === 0) { line(rect(cx - 200, 1250, cx + 200, 1280), { w: LW.det, closed: true, u: k(t0 + .2, .4) }); [-120, 120].forEach(o => line(rect(cx + o - 12, 1280, cx + o + 12, g), { w: LW.det, closed: true, u: k(t0 + .4, .3), nib: false })); }
    if (i === 1) { line([[cx - 200, 1250], [cx + 200, 1250]], { w: LW.det, u: k(t0 + .2, .3) }); const a = []; for (let x = -200; x <= 200; x += 10) a.push([cx + x, 1280 + 70 * (x / 200) ** 2]); line(a, { w: LW.det, u: k(t0 + .4, .4) }); for (let x = -150; x <= 150; x += 50) line([[cx + x, 1250], [cx + x, 1280 + 70 * (x / 200) ** 2]], { w: LW.hair, u: k(t0 + .6, .2), nib: false }); }
    if (i === 2) { line([[cx - 220, 1280], [cx + 220, 1280]], { w: LW.det, u: k(t0 + .2, .3) }); [-130, 130].forEach(o => line([[cx + o, g], [cx + o, 1130]], { w: LW.det, u: k(t0 + .3, .3), nib: false })); const c = []; for (let x = -130; x <= 130; x += 10) c.push([cx + x, 1130 + 120 * (1 - (x / 130) ** 2)]); line([[cx - 230, 1260], [cx - 130, 1130], ...c, [cx + 230, 1260]], { w: LW.thin, u: k(t0 + .5, .5) }); }
    text(T.prior[i], cx, 1420, { size: 34, align: 'center', font: FONT.hand, u: k(27.0 + i * .15, .4) });
    const vt = 27.6 + i * .45;
    text(T.verdict[i], cx, 1530, { size: 44, align: 'center', font: FONT.hand, u: k(vt, .4) });
  });
  if (t > 28.8) line(ell(2540, 1515, 150, 52, -.05, 60, -1.2, -1.2 + Math.PI * 2.1), { w: LW.det, u: k(28.8, .5) });
  figLabel(1, 1840, 1690, k(25.3, .8));
}

// ---------------------------------------------------------------- FIG. 3 short documents
function fig3(t) {
  if (t < 30.0) return;
  const k = (a, d = .6) => dr(t, a, d);
  T.docsFiles.forEach(([name, rows], i) => {
    const x0 = 3460 + i * 450, y0 = 880, w = 380, h = 470, t0 = 31.0 + i * .6;
    knock([[x0, y0], [x0 + w - 50, y0], [x0 + w, y0 + 50], [x0 + w, y0 + h], [x0, y0 + h]]);
    line([[x0, y0], [x0 + w - 50, y0], [x0 + w, y0 + 50], [x0 + w, y0 + h], [x0, y0 + h]], { w: LW.det, closed: true, u: k(t0, .4) });
    line([[x0 + w - 50, y0], [x0 + w - 50, y0 + 50], [x0 + w, y0 + 50]], { w: LW.thin, u: k(t0 + .3, .2), nib: false });
    line([[x0 + 20, y0 + 80], [x0 + w - 20, y0 + 80]], { w: LW.thin, u: k(t0 + .3, .2), nib: false });
    text(name, x0 + 24, y0 + 58, { size: 40, font: 'B612', weight: 700, u: k(t0 + .2, .4) });
    rows.forEach((r, j) => text('— ' + r, x0 + 24, y0 + 150 + j * 70, { size: 30, font: FONT.hand, u: k(t0 + .5 + j * .15, .4), nib: false }));
  });
  text(T.roadmap, 3460, 1420, { size: 30, font: FONT.hand, v: .75, u: k(33.4, .5) });
  const nw = textW(T.codeCant, 36, FONT.hand);
  line(rect(3450, 1490, 3530 + nw, 1560), { w: LW.thin, closed: true, u: k(34.0, .4), nib: false });
  text('★', 3470, 1538, { size: 30, font: 'B612', u: k(34.1, .2), nib: false });
  text(T.codeCant, 3510, 1540, { size: 36, font: FONT.hand, u: k(34.2, .7) });
  figLabel(2, 3460, 1690, k(30.5, .8));
}

// ---------------------------------------------------------------- FIG. 5 depth matches the stakes
function fig5(t) {
  if (t < 47.5) return;
  const k = (a, d = .6) => dr(t, a, d);
  const bx = 3700, by = 2720;
  const hex = []; for (let i = 0; i <= 6; i++) { const a = i / 6 * Math.PI * 2 + Math.PI / 6; hex.push([bx + Math.cos(a) * 90, by + Math.sin(a) * 90]); }
  line([[bx - 150, by], [bx + 150, by]], { w: LW.hair, dash: 'center', u: k(47.6, .4), v: .8 });
  line([[bx, by - 150], [bx, by + 150]], { w: LW.hair, dash: 'center', u: k(47.7, .4), v: .8 });
  line(hex, { w: LW.out, u: k(47.9, .5) });
  line(circ(bx, by, 46, 40), { w: LW.det, u: k(48.3, .4) });
  cloud(bx, by, 175, 160, k(48.9, .7), 16);
  const tx = bx + 170, ty = by - 150;
  line([[tx, ty - 30], [tx + 30, ty + 22], [tx - 30, ty + 22]], { w: LW.det, closed: true, u: k(49.5, .3) });
  text('A', tx, ty + 14, { size: 28, align: 'center', font: 'B612', u: k(49.7, .2), nib: false });
  text(T.rev, tx + 44, ty + 12, { size: 26, font: 'B612', u: k(49.8, .3), nib: false });
  text(T.small, 3480, 3000, { size: 46, font: FONT.hand, u: k(49.6, .5) });
  T.smallSub.forEach((s, i) => text(s, 3480, 3054 + i * 44, { size: 32, font: FONT.hand, u: k(50.0 + i * .25, .4), nib: false }));
  // the full set
  for (let i = 3; i >= 0; i--) {
    const x0 = 4280 + i * 34, y0 = 2420 + i * 34, t0 = 51.4 + (3 - i) * .32;
    knock(rect(x0, y0, x0 + 300, y0 + 380));
    line(rect(x0, y0, x0 + 300, y0 + 380), { w: LW.det, closed: true, u: k(t0, .3) });
  }
  ['intent.md', 'spec.md', 'plan.md', 'roadmap.md'].forEach((s, i) => text(s, 4300, 2490 + i * 56, { size: 28, font: 'B612', u: k(52.0 + i * .12, .3), nib: false }));
  text(T.big, 4280, 3000, { size: 46, font: FONT.hand, u: k(52.3, .5) });
  T.bigSub.forEach((s, i) => text(s, 4280, 3054 + i * 44, { size: 32, font: FONT.hand, u: k(52.7, .4), nib: false }));
  figLabel(4, 3460, 3210, k(47.8, .8));
}

// ---------------------------------------------------------------- notes column and title block
function notesColumn(t) {
  text(T.notesHead, NX, 500, { size: 30, font: FONT.tech, weight: 700, ls: 3 });
  line([[NX, 514], [NX + 340, 514]], { w: LW.thin, nib: false });
  let y = 570;
  const size = 27, lh = 38, maxW = 1200;
  LINES.forEach((Ln, i) => {
    const t0 = LINE_T[Ln.id], u = dr(t, t0, DURS[Ln.id] || 2);
    const rows = wrapSheet((L === 'en' ? Ln.sub.toUpperCase() : Ln.sub), size, maxW - 50, FONT.hand);
    if (u > 0) {
      text((i + 1) + '.', NX, y, { size, font: FONT.hand, nib: false });
      const total = rows.reduce((s, r) => s + r.length, 0); let acc = 0;
      rows.forEach((r, j) => { const uu = clamp((u * total - acc) / r.length); acc += r.length; text(r, NX + 50, y + j * lh, { size, font: FONT.hand, u: uu, nib: false }); });
    }
    y += rows.length * lh + 14;
  });
}
function wrapSheet(str, size, maxW, font) {
  if (L === 'zh') { const out = []; let cur = ''; for (const ch of str) { if (textW(cur + ch, size, font) > maxW && cur) { out.push(cur); cur = ch; } else cur += ch; } if (cur) out.push(cur); return out; }
  const out = []; let cur = '';
  for (const w of str.split(' ')) { const tt = cur ? cur + ' ' + w : w; if (textW(tt, size, font) > maxW && cur) { out.push(cur); cur = w; } else cur = tt; }
  if (cur) out.push(cur); return out;
}
const TBR = [2600, 2700, 2790, 2860, 2990, 3440];
function titleBlock(t) {
  const { x0, x1 } = TB, r = TBR;
  line(rect(x0, r[0], x1, r[5]), { w: LW.out * 1.2, closed: true, nib: false });
  for (let i = 1; i < 5; i++) line([[x0, r[i]], [x1, r[i]]], { w: LW.det, nib: false });
  const cm = x0 + 640, c3a = x0 + 420, c3b = x0 + 840;
  line([[cm, r[1]], [cm, r[2]]], { w: LW.det, nib: false });
  line([[c3a, r[2]], [c3a, r[3]]], { w: LW.det, nib: false }); line([[c3b, r[2]], [c3b, r[3]]], { w: LW.det, nib: false });
  const lab = (s, x, y) => text(s, x + 10, y + 22, { size: 16, font: FONT.tech, v: .75, ls: 1.5, nib: false });
  lab(T.tb.title, x0, r[0]); lab(T.tb.author, x0, r[1]); lab(T.tb.version, cm, r[1]); lab(T.tb.dwg, x0, r[2]); lab(T.tb.license, c3a, r[2]); lab(T.tb.sheet, c3b, r[2]); lab(T.tb.status, x0, r[3]); lab(T.tb.install, x0, r[4]);
  text(T.tbTitle, x0 + 24, r[0] + 78, { size: L === 'zh' ? 58 : 50, font: FONT.hand, ls: 3, u: dr(t, 13.0, 1.2) });
  text(T.tbVersion, cm + 24, r[1] + 70, { size: 36, font: FONT.hand });
  text('DDD-001', x0 + 24, r[2] + 56, { size: 32, font: FONT.hand });
  text('MIT', c3a + 24, r[2] + 56, { size: 32, font: FONT.hand });
  text(T.tbSheet, c3b + 24, r[2] + 56, { size: 32, font: FONT.hand });
  text('SagaSu', x0 + 40, r[1] + 72, { size: 58, font: 'Allura', u: dr(t, 64.6, .9) });
  // status: struck through, then stamped
  text(T.tbStatus, x0 + 24, r[3] + 82, { size: 44, font: FONT.tech, weight: 700, ls: 6, v: t > 62.5 ? .45 : 1 });
  if (t > 62.2) line([[x0 + 16, r[3] + 66], [x0 + 30 + textW(T.tbStatus, 44, FONT.tech, 6), r[3] + 66]], { w: LW.det, u: dr(t, 62.2, .25), nib: false });
  // install
  text(INSTALL, x0 + 24, r[4] + 110, { size: 34, font: 'B612', u: dr(t, 66.5, 1.0) });
  text(REPO, x0 + 24, r[4] + 190, { size: 30, font: 'B612', v: .9, u: dr(t, 67.6, .9) });
  text(T.anyAgent, x0 + 24, r[4] + 300, { size: L === 'zh' ? 60 : 54, font: FONT.hand, u: dr(t, 68.6, .9) });
}
function stampMark(t) {
  if (t < 62.5) return;
  const a = clamp((t - 62.5) / .06);
  f.globalCompositeOperation = 'lighter';
  camMatrix(f, TB.x0 + 860, TBR[3] + 64, -.12);
  const s = 1 + .25 * (1 - eo((t - 62.5) / .12));
  f.scale(s, s);
  f.strokeStyle = `rgba(0,0,255,${a})`; f.lineWidth = 9; f.strokeRect(-230, -62, 460, 124);
  f.lineWidth = 3; f.strokeRect(-216, -49, 432, 98);
  f.fillStyle = `rgba(0,0,255,${a})`; f.font = `700 ${L === 'zh' ? 88 : 72}px ${L === 'zh' ? 'ZQ' : 'B612'}`; f.textAlign = 'center'; f.textBaseline = 'middle'; f.letterSpacing = L === 'zh' ? '40px' : '10px';
  f.fillText(T.stamp, L === 'zh' ? 20 : 5, 4); f.letterSpacing = '0px';
  f.setTransform(1, 0, 0, 1, 0, 0);
}
// the ending labels: person, documents, agent
function meetLabels(t) {
  if (t < 55.4) return;
  const k = (a, d = .7) => dr(t, a, d);
  text(T.person, 180, 2330, { size: 110, font: FONT.hand, u: k(55.5) });
  text(T.personSub, 184, 2410, { size: 56, font: FONT.hand, u: k(56.1) });
  text(T.agent, 3290, 2330, { size: 110, font: FONT.hand, align: 'right', u: k(57.2) });
  text(T.agentSub, 3286, 2410, { size: 56, font: FONT.hand, align: 'right', u: k(57.8) });
  text(T.docs, 1730, 2190, { size: 120, font: FONT.hand, align: 'center', u: k(58.6) });
  text(T.docsSub, 1730, 2270, { size: 60, font: FONT.hand, align: 'center', u: k(59.3) });
}

// ---------------------------------------------------------------- camera: segments with hard cuts on downbeats
function track(keys) {
  return t => {
    if (t <= keys[0][0]) return keys[0][1];
    for (let i = 1; i < keys.length; i++) if (t <= keys[i][0]) { const p = eio((t - keys[i - 1][0]) / (keys[i][0] - keys[i - 1][0])); return keys[i - 1][1].map((v, j) => lerp(v, keys[i][1][j], p)); }
    return keys[keys.length - 1][1];
  };
}
const CAMS = [
  [0, track([[0, [1730, 2620, .58]], [11.0, [1730, 2640, .64]]])],
  [11.25, track([[11.25, [1360, 780, .7]], [15.0, [1400, 780, .71]]])],
  [15.0, track([[15.0, [920, 1180, 1.0]], [24.4, [920, 1200, 1.05]], [25.0, [940, 1180, 1.0]], [25.9, [2540, 1180, 1.0]], [29.9, [2540, 1190, 1.03]], [30.0, [2560, 1180, 1.0]], [30.9, [4160, 1180, 1.0]], [37.4, [4160, 1190, 1.04]]])],
  [37.5, track([[37.5, [1730, 2700, .6]], [44.1, [1750, 2730, .63]], [44.8, [2450, 2985, 1.0]], [47.4, [2460, 2990, 1.02]]])],
  [47.5, track([[47.5, [4160, 2740, 1.0]], [48.6, [4160, 2740, 1.0]]])],
  [48.75, track([[48.75, [3720, 2800, 1.9]], [51.1, [3720, 2800, 2.0]]])],
  [51.25, track([[51.25, [4160, 2740, 1.0]], [55.0, [4160, 2740, 1.02]], [57.6, [3200, 1800, .29]], [62.5, [3200, 1800, .295]]])],
  [62.5, track([[62.5, [5560, 2960, 1.0]], [72.5, [5560, 2960, 1.04]]])],
];
function camAt(t) {
  let fn = CAMS[0][1]; for (const [t0, f2] of CAMS) if (t >= t0) fn = f2;
  const [x, y, z] = fn(t);
  const bump = t > 62.5 ? 8 * Math.exp(-(t - 62.5) * 14) * Math.cos((t - 62.5) * 60) : 0;
  return { x, y: y - bump / z, z };
}

// ---------------------------------------------------------------- captions: drawing notes in empty sky
const SUBPOS = t => t < 11.25 ? ['tl'] : t < 15 ? ['bl'] : t >= 44.0 && t < 47.5 ? ['tr'] : t < 55.0 ? ['tl'] : t < 62.5 ? ['tr'] : ['top'];
export function subs() {
  return LINES.map((Ln, i) => {
    const t0 = LINE_T[Ln.id], next = LINES[i + 1] ? LINE_T[LINES[i + 1].id] : DUR;
    const t1 = Math.min(next - .1, t0 + Math.max(1.8, (DURS[Ln.id] || 2) + .6) + .4);
    return { id: Ln.id, n: i + 1, t0, t1, text: Ln.sub };
  });
}
function wrapOv(c, str, maxW) {
  if (L === 'zh') { const out = []; let cur = ''; for (const ch of str) { if (c.measureText(cur + ch).width > maxW && cur && !'，。、：；）'.includes(ch)) { out.push(cur); cur = ch; } else cur += ch; } if (cur) out.push(cur); return out; }
  const out = []; let cur = '';
  for (const w of str.split(' ')) { const tt = cur ? cur + ' ' + w : w; if (c.measureText(tt).width > maxW && cur) { out.push(cur); cur = w; } else cur = tt; }
  if (cur) out.push(cur); return out;
}
function caption(t) {
  const S2 = subs().find(s => t >= s.t0 - .05 && t < s.t1 + .25);
  if (!S2) return;
  const a = 1 - clamp((t - S2.t1) / .25);
  const u = clamp((t - S2.t0) / .35 / Math.max(1, S2.text.length / 40));
  const c = ov; c.setTransform(1, 0, 0, 1, 0, 0);
  const fs = L === 'zh' ? 40 : 38, ff = L === 'zh' ? 'ZQ' : 'Architects';
  c.font = `400 ${fs}px ${ff}`;
  const maxW = SUBPOS(t)[0] === 'top' ? 1240 : 880;
  const ls = wrapOv(c, S2.text, maxW), tw = Math.max(...ls.map(l => c.measureText(l).width));
  const w = 124 + tw + 36, h = 58 + ls.length * 48;
  const pos = SUBPOS(t)[0];
  let x0 = 80, y0 = 52;
  if (pos === 'bl') y0 = H - 60 - h;
  if (pos === 'tr') x0 = W - 60 - w;
  if (pos === 'top') { x0 = 420; y0 = Math.max(14, 170 - h); }
  c.globalAlpha = a;
  c.fillStyle = 'rgba(12,28,62,.66)'; c.fillRect(x0, y0, w, h);
  c.strokeStyle = 'rgba(232,240,250,.9)'; c.lineWidth = 1.2; c.strokeRect(x0 + .5, y0 + .5, w, h);
  c.lineWidth = .8; c.strokeRect(x0 + 5.5, y0 + 5.5, w - 10, h - 10);
  c.beginPath(); c.moveTo(x0 + 108, y0 + 16); c.lineTo(x0 + 108, y0 + h - 16); c.stroke();
  c.beginPath(); c.moveTo(x0, y0 + h); c.lineTo(x0 - 18, y0 + h + 18); c.stroke();
  c.fillStyle = 'rgba(234,241,250,1)'; c.textAlign = 'center'; c.textBaseline = 'middle';
  c.font = `700 17px B612`; c.letterSpacing = '3px'; c.fillText(L === 'zh' ? '注' : 'NOTE', x0 + 56, y0 + 28);
  c.font = `700 30px B612`; c.letterSpacing = '0px'; c.fillText(String(S2.n), x0 + 55, y0 + 60);
  c.textAlign = 'left'; c.font = `400 ${fs}px ${ff}`;
  const total = ls.reduce((s, l) => s + l.length, 0); let acc = 0;
  ls.forEach((l, i) => { const uu = clamp((u * total - acc) / l.length); acc += l.length; if (uu <= 0) return; const lw2 = c.measureText(l).width; c.save(); c.beginPath(); c.rect(x0 + 116, y0, (lw2 + 16) * uu, h); c.clip(); c.fillText(l, x0 + 124, y0 + 53 + i * 48); c.restore(); });
  c.globalAlpha = 1; c.textBaseline = 'alphabetic';
}

// ---------------------------------------------------------------- the frame
export function renderFilm(t, opt = {}) {
  setCam(camAt(t)); proj.k = 0; clear();
  border(); header(t); notesColumn(t); titleBlock(t);
  // ghost of an old revision in the hook cell, and the river from the first beat
  banks(t); person(480, GY, dr(t, .2, .8)); agent(2980, GY, dr(t, 1.6, .8));
  halves(t); bridge(t); load(t); checks(t); crack(t);
  fig1(t); fig2(t); fig3(t); fig5(t); meetLabels(t);
  figLabel(3, 300, 3380, dr(t, 37.6, .8));
  stampMark(t);
  if (!opt.nosub) caption(t);
  return { sheet: [SW, SH], cam: { ...cam }, seed: 5, desk: 1 };
}

// ---------------------------------------------------------------- texts for readcheck (screen boxes of the key labels)
export function texts(t) {
  const out = [], P = (x, y) => S(x, y);
  const box = (id, s, x0, y0, x1, y1) => { const a = P(x0, y0), b = P(x1, y1); if (a[0] >= 0 && a[1] >= 0 && b[0] <= W && b[1] <= H) out.push({ id, text: s, x0: a[0], y0: a[1], x1: b[0], y1: b[1] }); };
  if (t >= 11.4 && t < 15) box('title', T.title, 170, 120, 2400, 400);
  if (t >= 16 && t < 25) box('f1', T.fig[0], 1000, 1640, 1690, 1710);
  if (t >= 26 && t < 30) box('f2', T.fig[1], 1840, 1640, 3000, 1710);
  if (t >= 31 && t < 37.5) box('f3', T.fig[2], 3460, 1640, 4400, 1710);
  if (t >= 34.9 && t < 37.5) box('cc', T.codeCant, 3450, 1490, 4900, 1560);
  if (t >= 45 && t < 47.5) box('tbl', T.checksHead, 1900, 3110, 3260, 3420);
  if (t >= 53 && t < 55) box('f5', T.big, 4280, 2950, 4900, 3120);
  if (t >= 69.5) box('inst', INSTALL, 5040, 3040, 6280, 3310);
  return out;
}

// ---------------------------------------------------------------- sound events
export function events() {
  const ev = [], add = (t, type, o = {}) => ev.push({ t: +t.toFixed(3), type, ...o });
  add(0, 'pen', { d: 1.2 }); add(.6, 'pen', { d: 1.0, g: .5 });
  HALF_L.forEach((p, i) => add(.8 + i * .28, 'scratch', { d: .45 })); HALF_R.forEach((p, i) => add(2.3 + i * .28, 'scratch', { d: .45 }));
  add(3.4, 'pen', { d: .8, g: .6 }); add(4.7, 'pen', { d: 2.0, g: .7 }); add(5.4, 'tick', { g: .5 });
  add(7.5, 'eraser', { d: 1.9 }); add(10.2, 'ruler', { d: 1.4 });
  add(11.4, 'letter', { d: 1.6 }); add(13.0, 'letter', { d: 1.2, g: .6 }); add(13.4, 'letter', { d: 1.2, g: .5 });
  add(15.0, 'slide', { g: .7 }); add(15.2, 'pen', { d: .8 });
  for (const s of [16.2, 17.6, 19.3, 20.5, 21.5]) add(s, 'pen', { d: .7 });
  for (const s of [16.9, 18.9, 20.2, 21.1, 22.1, 22.9]) add(s, 'letter', { d: .6, g: .7 });
  add(25.0, 'slide'); for (let i = 0; i < 3; i++) add(25.9 + i * .5, 'pen', { d: .6 });
  for (let i = 0; i < 3; i++) add(27.6 + i * .45, 'letter', { d: .4 }); add(28.8, 'compass', { d: .5 });
  add(30.0, 'slide'); for (let i = 0; i < 3; i++) { add(31.0 + i * .6, 'pen', { d: .4 }); add(31.2 + i * .6, 'letter', { d: .9, g: .6 }); } add(34.2, 'letter', { d: .7 });
  add(37.5, 'slap'); add(37.6, 'ruler', { d: .5 }); add(37.9, 'pen', { d: 1.0 }); add(38.6, 'compass', { d: .6 }); add(39.2, 'pen', { d: .5 }); add(39.6, 'hatch', { d: .5 }); add(39.9, 'pen', { d: .8, g: .6 });
  add(40.2, 'pen', { d: .6 }); add(40.6, 'letter', { d: 1.0, g: .6 }); add(41.5, 'letter', { d: .5 });
  STEPS.forEach((s, i) => { add(s, 'clunk'); add(s + .2, 'check'); }); add(43.8, 'ding');
  add(44.3, 'crack'); add(44.6, 'pen', { d: .6 }); add(45.3, 'letter', { d: .6 }); add(45.8, 'ruler', { d: .25 }); add(46.3, 'check'); add(46.5, 'ding');
  add(47.5, 'slap'); add(47.9, 'pen', { d: .9 }); add(48.9, 'pen', { d: .7 }); add(49.6, 'letter', { d: .9 });
  for (let i = 0; i < 4; i++) add(51.4 + i * .32, 'paper', { g: .6 }); add(52.3, 'letter', { d: .8 });
  add(55.5, 'letter', { d: 1.2 }); add(57.2, 'letter', { d: 1.2 }); add(58.6, 'letter', { d: 1.3 });
  add(62.2, 'ruler', { d: .25 }); add(62.5, 'stamp'); add(64.6, 'letter', { d: .9, g: .7 });
  add(66.5, 'letter', { d: 1.0 }); add(67.6, 'letter', { d: .9, g: .7 }); add(68.6, 'letter', { d: .9 }); add(69.6, 'cap');
  for (const [id, t] of Object.entries(LINE_T)) add(t, 'vo', { id });
  return ev.sort((a, b) => a.t - b.t);
}
export { L as lang, NIBS };

import { W, H, inkC, fxC, ovC, ov, nibs } from './draw.js';
import { makePaper } from './paper.js';
import { setup, renderFilm, DUR, subs, events, texts } from './film.js';
import { TXT, INSTALL, REPO } from './content.js';

const out = document.getElementById('c');
const comp = makePaper(out, W, H);
const Q = new URLSearchParams(location.search);
const lang = Q.get('lang') === 'zh' ? 'zh' : 'en';
const get = async u => (await fetch(u)).json();
const [lines, durs, words] = await Promise.all([get(`lines-${lang}.json`), get(`voice-${lang}/dur.json`), get(`voice-${lang}/words.json`)]);
// load every glyph the sheet uses (the Chinese face is split by unicode range)
const all = JSON.stringify(TXT[lang]) + lines.map(l => l.sub).join('') + INSTALL + REPO + '注通过→★';
await Promise.all(['400 40px Architects', '400 40px B612', '700 40px B612', '400 40px Allura'].map(s => document.fonts.load(s)));
if (lang === 'zh') await document.fonts.load('400 40px ZQ', all);
setup(lang, lines, durs, words);

// ?from=&to= renders only that stretch (for re-rendering one shot and splicing it back)
const T0 = +(Q.get('from') || 0), T1 = +(Q.get('to') || DUR);
window.DUR = T1 - T0;
window.EV = events();
window.SUBS = subs();
window.TEXTS = t => texts(t);
window.render = t => {
  const o = renderFilm(t + T0, { nosub: Q.has('nosub') });
  nibs();
  comp(inkC, fxC, ovC, o);
};
window.READY = true;

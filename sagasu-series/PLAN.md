# sagasu.art video series — plan

One house style for short videos of every sagasu.art article, posted on X and WeChat Channels (视频号).
Decided on 2026-10-30.

| Decision | Choice |
|---|---|
| Base style | Lemo-Opuscar `news-package` (电视新闻包装), turned into a house style via `MY-STYLES.md` |
| Brand name on the plate, bug and end card | `sagasu.art` |
| Palette | the site's own: paper `#F6F2E9`, ink `#16150F` / `#1C1A15`, accent forest green `#84A886` (dark mode) / `#2F5233` (light) |
| Formats | 16:9 1920×1080 for X (Premium, no length cap); 9:16 1080×1920 for 视频号 (a separate layout, same content) |
| Captions | burned in (both platforms autoplay muted); the style's default of a separate `.srt` is changed for this series |
| Voice | the author's own voice: one 1–3 min recording, cloned with an open-source model whose weights allow commercial use (licence checked from the source at start, then a listening test approved by the author) |
| Length | 60–90 s by default |
| First video | "个人智能体元年：概念共识与五大核心分歧" (sagasu.art/posts/personal-ai-agents-definitions-and-divergence) |

## Build order

1. House style + template engine: one content file per video (rundown items; card types: timeline, comparison table, checklist, quote card, stamp; text and source per screen; voice script). Both layouts from one content file.
2. Voice cloning set up and approved.
3. A skill that goes article URL → content file → voice → render both formats.
4. Per article: write the content file, one contact-sheet review, render.

## Sample

`sample/` is the 12 s test of the comparison card. `index.html` is in the site palette (`palette-site.jpg`);
`news-sample-yellow.mp4` is the first render in the style's default yellow. The sample voice is edge-tts
(Xiaoxiao) and is replaced by the author's cloned voice in the series.

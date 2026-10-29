#!/bin/sh
# Rebuild both versions from scratch: sh build.sh   (LIB = the Lemo-Opuscar library, default ~/lemo-opuscar)
set -e
LIB=${LIB:-$HOME/lemo-opuscar}; export LIB
HERE=$(cd "$(dirname "$0")" && pwd)
PY=$LIB/.venv/bin/python
CA=${CA_WRAP:-}   # behind a TLS-intercepting proxy, a wrapper that points certifi at the proxy CA (see tools/run_ca.py)
cd "$LIB"
$PY core/tts/tts.py "$HERE/lines-en.json" "$HERE/voice-en"
$PY $CA core/tts/tts_zh.py "$HERE/lines-zh.json" "$HERE/voice-zh"
WHISPER_MODEL=small.en $PY core/tts/asr_check.py "$HERE/lines-en.json" "$HERE/voice-en" --lang en
$PY core/tts/asr_check.py "$HERE/lines-zh.json" "$HERE/voice-zh" --lang zh
$PY "$HERE/music/score.py"
node core/render/events.mjs "$HERE" --q lang=en
for lang in en zh; do
  $PY "$HERE/mix.py" $lang
  $PY "$HERE/tools/subs.py" $lang && $PY core/render/srt.py "$HERE/out/subs-$lang.json" "$HERE/ddd-intro-$lang.srt"
  node core/render/readcheck.mjs "$HERE" --q lang=$lang
  node core/render/video.mjs "$HERE" --q lang=$lang --fps 24 --workers 4 --out "$HERE/out/video-$lang.mp4"
  sh core/render/mux.sh "$HERE/out/video-$lang.mp4" "$HERE/out/mix-$lang.wav" "$HERE/out/master-$lang.mp4" 24 2
  node core/render/still.mjs "$HERE" 71.5 --q "lang=$lang&nosub=1" --out "$HERE/out/still" --prefix po_${lang}_ && cp "$HERE/out/still/po_${lang}_71.5.jpg" "$HERE/poster-$lang.jpg"
done
sh "$HERE/tools/publish.sh"

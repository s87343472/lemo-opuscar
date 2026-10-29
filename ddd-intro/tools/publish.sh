#!/bin/sh
# Upload-ready copy: H.264 High, yuv420p, limited range, tagged BT.709, AAC 48 kHz, faststart.
# The master is BT.601 limited range; convert the matrix explicitly instead of relabelling.
set -e
HERE=$(cd "$(dirname "$0")/.." && pwd)
for lang in en zh; do
  ffmpeg -v error -y -i "$HERE/out/master-$lang.mp4" \
    -vf "scale=in_color_matrix=bt601:in_range=tv:out_color_matrix=bt709:out_range=tv,format=yuv420p" \
    -c:v libx264 -preset slow -crf 16 -profile:v high -level 4.1 -r 24 -g 48 \
    -color_range tv -colorspace bt709 -color_primaries bt709 -color_trc bt709 \
    -c:a copy -movflags +faststart "$HERE/ddd-intro-$lang.mp4"
  echo "wrote $HERE/ddd-intro-$lang.mp4"
done

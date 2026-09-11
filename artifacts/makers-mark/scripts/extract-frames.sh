#!/usr/bin/env bash
# Turn generated video plates (gen/video/*.mp4) into scroll-scrubbable frame
# sequences under public/media/<name>/w{800,1600}/fNNN.webp plus a poster.
# Usage: scripts/extract-frames.sh [name ...]   (defaults to every mp4)
set -euo pipefail
cd "$(dirname "$0")/.."
FPS=${FPS:-12}
names=("$@")
if [ ${#names[@]} -eq 0 ]; then
  for f in gen/video/*.mp4; do names+=("$(basename "$f" .mp4)"); done
fi
for n in "${names[@]}"; do
  src="gen/video/$n.mp4"
  [ -f "$src" ] || { echo "missing $src" >&2; continue; }
  for w in 800 1600; do
    out="public/media/$n/w$w"
    rm -rf "$out"; mkdir -p "$out"
    ffmpeg -loglevel error -y -i "$src" -vf "fps=$FPS,scale=$w:-2:flags=lanczos" -c:v libwebp -quality ${Q:-74} -compression_level 6 "$out/f%03d.webp"
    # ffmpeg numbers from 1; renumber from 0.
    i=0
    for f in "$out"/f*.webp; do
      mv "$f" "$out/tmp$(printf %03d $i).webp"; i=$((i+1))
    done
    for f in "$out"/tmp*.webp; do mv "$f" "${f/tmp/f}"; done
  done
  ffmpeg -loglevel error -y -i "$src" -vf "select=eq(n\,0),scale=1600:-2" -frames:v 1 -q:v 4 "public/media/$n/poster.jpg"
  count=$(ls public/media/$n/w1600 | wc -l)
  echo "$n: $count frames"
done

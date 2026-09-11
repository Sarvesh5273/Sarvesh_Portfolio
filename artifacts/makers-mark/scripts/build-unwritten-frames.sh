#!/usr/bin/env bash
# Build the World 1 scroll plate from the user-supplied 1920×1080 JPG frames.
# Input: gen/incoming/world1-frames/part-{a,b,c}/frame_001.jpg … frame_510.jpg
# Output: public/media/unwritten_journey_frames/{w800,w1600}/fNNN.webp + poster.
set -euo pipefail

cd "$(dirname "$0")/.."

SOURCE_ROOT="gen/incoming/world1-frames"
SEQUENCE="unwritten_journey_frames"
COUNT=510
STAGE="$(mktemp -d)"
trap 'rm -rf "$STAGE"' EXIT

for number in $(seq 1 "$COUNT"); do
  printf -v padded '%03d' "$number"
  if (( number <= 170 )); then
    part="a"
  elif (( number <= 340 )); then
    part="b"
  else
    part="c"
  fi
  source="$SOURCE_ROOT/part-$part/frame_$padded.jpg"
  [ -f "$source" ] || { echo "Missing source frame: $source" >&2; exit 1; }
  # The temporary directory may be mounted on a different filesystem, so use
  # an absolute symlink rather than a hard link.
  ln -s "$(realpath "$source")" "$STAGE/frame_$padded.jpg"
done

for spec in '800:86' '1600:90'; do
  IFS=':' read -r width quality <<< "$spec"
  output="public/media/$SEQUENCE/w$width"
  rm -rf "$output"
  mkdir -p "$output"
  ffmpeg -hide_banner -loglevel error -y \
    -framerate 23 -start_number 1 -i "$STAGE/frame_%03d.jpg" -frames:v "$COUNT" \
    -vf "scale=$width:-2:flags=lanczos" \
    -c:v libwebp -quality "$quality" -compression_level 6 \
    "$output/f%03d.webp"

  # ffmpeg writes image sequences beginning at 001. FramePlate indexes from 000.
  for file in "$output"/f*.webp; do
    index=${file##*/f}
    index=${index%.webp}
    mv "$file" "$output/tmp$index.webp"
  done
  index=0
  for file in "$output"/tmp*.webp; do
    mv "$file" "$output/f$(printf '%03d' "$index").webp"
    index=$((index + 1))
  done
done

ffmpeg -hide_banner -loglevel error -y \
  -i "$STAGE/frame_001.jpg" -vf "scale=1600:-2:flags=lanczos" -frames:v 1 -q:v 3 \
  "public/media/$SEQUENCE/poster.jpg"

printf '%s: %s user-supplied frames\n' "$SEQUENCE" "$(find "public/media/$SEQUENCE/w1600" -type f | wc -l)"
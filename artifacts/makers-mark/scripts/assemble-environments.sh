#!/usr/bin/env bash
# Assemble the future civilization's four shots and encode the two crossings.
# Source generations are retained. This does not touch the Kingdom or Unwritten.
set -euo pipefail
cd "$(dirname "$0")/.."
for name in future_bridge future_well future_gate future_orchard present_daylight stone_to_future future_to_room; do
  test -s "gen/video/$name.mp4" || { echo "Missing generation: $name" >&2; exit 1; }
done

ffmpeg -hide_banner -loglevel error -y -filter_complex_threads 1 \
  -i gen/video/future_bridge.mp4 -i gen/video/future_well.mp4 \
  -i gen/video/future_gate.mp4 -i gen/video/future_orchard.mp4 \
  -filter_complex \
  "[0:v]fps=24,settb=AVTB,setpts=PTS-STARTPTS[v0];[1:v]fps=24,settb=AVTB,setpts=PTS-STARTPTS[v1];[2:v]fps=24,settb=AVTB,setpts=PTS-STARTPTS[v2];[3:v]fps=24,settb=AVTB,setpts=PTS-STARTPTS[v3];[v0][v1]xfade=transition=fade:duration=0.6:offset=5.4[a];[a][v2]xfade=transition=fade:duration=0.6:offset=10.8[b];[b][v3]xfade=transition=fade:duration=0.6:offset=16.2,format=yuv420p[out]" \
  -map "[out]" -an -c:v libx264 -threads 2 -preset fast -crf 18 \
  -movflags +faststart gen/video/future_journey.mp4

for name in stone_to_future future_to_room; do
  ffmpeg -hide_banner -loglevel error -y -i "gen/video/$name.mp4" \
    -vf scale=1600:-2 -an -c:v libx264 -threads 2 -preset fast -crf 26 \
    -pix_fmt yuv420p -movflags +faststart "public/media/$name.mp4"
  # VP9 plays in Chromium builds that do not include the proprietary H.264 codec.
  ffmpeg -hide_banner -loglevel error -y -i "gen/video/$name.mp4" \
    -vf scale=1600:-2 -an -c:v libvpx-vp9 -threads 4 -row-mt 1 \
    -tile-columns 2 -deadline good -cpu-used 4 -b:v 0 -crf 34 \
    -pix_fmt yuv420p "public/media/$name.webm"
done

# The city plate has thin ceramic edges and dark-water reflections: Q52 introduced
# visible blocking at desktop size. Keep this plate at display-grade quality.
FPS=16 Q=86 bash scripts/extract-frames.sh future_journey present_daylight
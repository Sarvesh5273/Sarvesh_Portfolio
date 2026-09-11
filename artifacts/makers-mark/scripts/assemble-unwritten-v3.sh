#!/usr/bin/env bash
# Assemble the regenerated full-bleed World 1 journey and extract display-grade
# frames for the scroll plate. The source clips remain in gen/video for reuse.
set -euo pipefail
cd "$(dirname "$0")/.."

for name in unwritten_orchard_v3 unwritten_bridge_v3 unwritten_well_v3 unwritten_gate_v3; do
  test -s "gen/video/$name.mp4" || { echo "Missing generation: $name" >&2; exit 1; }
done

ffmpeg -hide_banner -loglevel error -y -filter_complex_threads 1 \
  -i gen/video/unwritten_orchard_v3.mp4 \
  -i gen/video/unwritten_bridge_v3.mp4 \
  -i gen/video/unwritten_well_v3.mp4 \
  -i gen/video/unwritten_gate_v3.mp4 \
  -filter_complex \
  "[0:v]fps=24,settb=AVTB,setpts=PTS-STARTPTS[v0];[1:v]fps=24,settb=AVTB,setpts=PTS-STARTPTS[v1];[2:v]fps=24,settb=AVTB,setpts=PTS-STARTPTS[v2];[3:v]fps=24,settb=AVTB,setpts=PTS-STARTPTS[v3];[v0][v1]xfade=transition=fade:duration=0.6:offset=5.4[a];[a][v2]xfade=transition=fade:duration=0.6:offset=10.8[b];[b][v3]xfade=transition=fade:duration=0.6:offset=16.2,format=yuv420p[out]" \
  -map "[out]" -an -c:v libx264 -threads 2 -preset slow -crf 14 \
  -movflags +faststart gen/video/unwritten_journey_v3.mp4

FPS=16 Q=86 bash scripts/extract-frames.sh unwritten_journey_v3
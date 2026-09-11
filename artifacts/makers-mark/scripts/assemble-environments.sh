#!/usr/bin/env bash
# Rebuild the Present Room image sequence from its source footage.
set -euo pipefail
cd "$(dirname "$0")/.."
test -s gen/video/present_daylight.mp4 || { echo "Missing Present Room footage" >&2; exit 1; }
FPS=16 Q=86 bash scripts/extract-frames.sh present_daylight
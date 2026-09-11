/**
 * Runtime sequence metadata. Source footage lives in gen/video; the reproducible
 * assembly commands live in scripts/assemble-*.sh.
 */
export const ENVIRONMENT_MEDIA = {
  unwritten: {
    name: 'unwritten_journey_frames',
    video: 'unwritten_journey.mp4',
    count: 510,
    duration: 22.2,
  },
  presentRoom: { name: 'present_daylight', count: 128, duration: 8 },
} as const;
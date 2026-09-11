import type { CSSProperties } from 'react';
import type { Doorway } from '@/content/doorways';
import arch from '@/assets/gen/door_arch.webp';
import gap from '@/assets/gen/door_gap.webp';
import frame from '@/assets/gen/door_frame.webp';
import round from '@/assets/gen/door_round.webp';

const DOOR_IMAGES: Record<Doorway['id'], string> = { arch, gap, frame, round };

interface DoorwayGlyphProps {
  doorway: Doorway;
  className?: string;
  /** Mirror vertically (the well reflects the doorway back at the visitor). */
  reflected?: boolean;
  style?: CSSProperties;
}

/** A doorway cut from paper. Shared by the Prologue and every later world. */
export function DoorwayGlyph({ doorway, className, reflected, style }: DoorwayGlyphProps) {
  return (
    <img
      src={DOOR_IMAGES[doorway.id]}
      alt=""
      aria-hidden="true"
      draggable={false}
      className={`object-contain ${className ?? ''}`}
      style={{ ...style, ...(reflected ? { transform: 'scaleY(-1)' } : null) }}
    />
  );
}

export function doorwayImage(id: Doorway['id']) {
  return DOOR_IMAGES[id];
}

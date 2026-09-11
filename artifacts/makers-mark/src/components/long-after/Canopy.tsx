import { useState } from 'react';
import type { Structure } from '@/content/types';
import { getDoorway } from '@/content/doorways';
import { useVisitor } from '@/store/VisitorContext';
import { FUTURE_MAT, SceneMedia } from './SceneMedia';

export function Canopy({ structure }: { structure: Structure; reduced: boolean }) {
  const { chosenDoorway } = useVisitor();
  const doorway = getDoorway(chosenDoorway);
  const [spot, setSpot] = useState<number | null>(null);
  const content = structure.longAfter;
  const why = (i: number) => (content.why?.[i] ?? content.why?.[0] ?? '').replace('{doorway}', doorway ? doorway.name.toLowerCase() : 'a doorway');

  return (
    <div className="w-full" data-testid="scene-canopy">
      <SceneMedia structureId="orchard" panelSide="right">
        <p className="la-sub mb-3">{structure.storyName}</p>
        <h3 className="la-heading text-2xl md:text-4xl mb-5" data-testid="text-la-title-orchard">{content.title}</h3>
        <p className="la-sub mb-4 text-[10px]">Choose a place beneath the canopy</p>
        <div className="relative h-28 mb-6 border-b border-[rgba(162,172,184,0.3)] flex justify-between items-end pb-2 px-6" data-testid="canopy-field">
          <div className="absolute inset-0 bg-gradient-to-t from-[rgba(64,224,208,0.03)] to-transparent pointer-events-none" />
          {Array.from({ length: 5 }, (_, i) => {
            const selected = spot === i;
            return (
              <button
                key={i}
                type="button"
                aria-pressed={selected}
                aria-label={`Stand at spot ${i + 1}`}
                data-testid={`canopy-spot-${i}`}
                onPointerEnter={(e) => e.pointerType === 'mouse' && setSpot(i)}
                onPointerLeave={(e) => e.pointerType === 'mouse' && setSpot(null)}
                onFocus={() => setSpot(i)}
                onBlur={() => setSpot(null)}
                onClick={() => setSpot((value) => value === i ? null : i)}
                className="relative h-16 w-8 focus-visible:outline-none flex flex-col items-center justify-end group transition-transform hover:scale-105"
              >
                <span
                  className="block w-[2px] transition-all duration-300"
                  style={{
                    height: selected ? '100%' : '40%',
                    background: selected ? FUTURE_MAT.filament : 'rgba(162,172,184,0.4)',
                    boxShadow: selected ? `0 0 12px ${FUTURE_MAT.filament}` : 'none'
                  }}
                />
                <span
                  className="absolute bottom-[-10px] w-6 h-1 rounded-full transition-all duration-300"
                  style={{
                    background: selected ? FUTURE_MAT.filament : 'rgba(162,172,184,0.4)',
                    boxShadow: selected ? `0 0 8px ${FUTURE_MAT.filament}` : 'none'
                  }}
                />
              </button>
            );
          })}
        </div>
        <p className="la-text-titanium text-sm leading-relaxed" data-testid="text-la-consequence-orchard">{content.consequence}</p>
        <div className="min-h-[7rem] pt-6 border-t border-[rgba(162,172,184,0.1)] mt-4" aria-live="polite">
          {spot !== null ? (
            <p className="la-text-ceramic text-sm leading-relaxed border-l-2 pl-4" style={{ borderColor: FUTURE_MAT.filament }} data-testid="text-la-why">
              <span className="la-sub block mb-1 la-text-filament la-glow">Why</span>
              {why(spot)}
            </p>
          ) : (
            <p className="la-sub" data-testid="text-la-spot-hint">Select a terminal</p>
          )}
        </div>
      </SceneMedia>
    </div>
  );
}
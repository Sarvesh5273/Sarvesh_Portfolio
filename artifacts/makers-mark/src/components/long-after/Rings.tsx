import { useState } from 'react';
import type { Structure } from '@/content/types';
import { useVisitor } from '@/store/VisitorContext';
import { FUTURE_MAT, SceneMedia } from './SceneMedia';

export function Rings({ structure }: { structure: Structure; reduced: boolean; active: boolean }) {
  const { visitedDiscoveries } = useVisitor();
  const [touched, setTouched] = useState<number | null>(null);
  const content = structure.longAfter;
  const askedInFog = visitedDiscoveries.includes('gate-asked');
  const chain = [...(askedInFog ? ['You asked, in the fog, and a faint line recorded it.'] : []), ...(content.trail ?? [])];

  return (
    <div className="w-full" data-testid="scene-rings">
      <SceneMedia structureId="gate" panelSide="left">
        <p className="la-sub mb-3">{structure.storyName}</p>
        <h3 className="la-heading text-2xl md:text-4xl mb-5" data-testid="text-la-title-gate">{content.title}</h3>
        <p className="la-sub mb-4 text-[10px]">Access a data ring</p>
        <div className="relative h-28 mb-5 flex items-center justify-between px-2" data-testid="rings-field">
          {Array.from({ length: 7 }, (_, i) => {
            const selected = touched === i;
            return (
              <button
                key={i}
                type="button"
                aria-pressed={selected}
                aria-label={`Ring ${i + 1}: show who asked what`}
                data-testid={`ring-${i}`}
                onPointerEnter={(e) => e.pointerType === 'mouse' && setTouched(i)}
                onPointerLeave={(e) => e.pointerType === 'mouse' && setTouched(null)}
                onFocus={() => setTouched(i)}
                onBlur={() => setTouched(null)}
                onClick={() => setTouched((value) => value === i ? null : i)}
                className="group relative flex h-24 w-12 items-center justify-center focus-visible:outline-none"
              >
                <div
                  className="absolute inset-0 rounded-[2rem] border transition-all duration-300"
                  style={{
                    borderColor: selected ? FUTURE_MAT.filament : 'rgba(162,172,184,0.3)',
                    background: selected ? 'rgba(64,224,208,0.05)' : 'transparent',
                    boxShadow: selected ? `0 0 15px ${FUTURE_MAT.filamentDim}, inset 0 0 10px ${FUTURE_MAT.filamentDim}` : 'none',
                    transform: selected ? 'scale(1.1)' : 'scale(1)'
                  }}
                />
                <span className="block h-full w-[1px] opacity-20" style={{ background: FUTURE_MAT.titanium }} />
              </button>
            );
          })}
        </div>
        <p className="la-text-titanium text-sm leading-relaxed" data-testid="text-la-consequence-gate">{content.consequence}</p>
        <div className="min-h-[10rem] pt-6 border-t border-[rgba(162,172,184,0.1)] mt-4" aria-live="polite">
          {touched !== null ? (
            <ol className="space-y-3 text-sm" data-testid="text-la-chain">
              {chain.map((line, i) => (
                <li key={i} className="la-text-ceramic flex gap-4" style={i === 0 && askedInFog ? { color: FUTURE_MAT.filament } : undefined}>
                  <span className="la-sub mt-1">{String(i + 1).padStart(2, '0')}</span>
                  <span className={i === 0 && askedInFog ? 'la-glow' : ''}>{line}</span>
                </li>
              ))}
            </ol>
          ) : (
            <p className="la-sub" data-testid="text-la-ring-hint">Select a ring to view the log</p>
          )}
        </div>
      </SceneMedia>
    </div>
  );
}
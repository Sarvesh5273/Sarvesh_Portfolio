import { useEffect, useRef, useState } from 'react';
import type { Structure } from '@/content/types';
import { FUTURE_MAT, SceneMedia } from './SceneMedia';

function formatCounter(value: number, suffix = '') {
  return `${Number.isInteger(value) ? value.toLocaleString('en-US') : value}${suffix}`;
}

export function Lattice({ structure, reduced, active }: { structure: Structure; reduced: boolean; active: boolean }) {
  const [followed, setFollowed] = useState<number | null>(null);
  const [count, setCount] = useState(0);
  const liveRef = useRef<HTMLSpanElement>(null);
  const content = structure.longAfter;
  const shop = content.nodes?.[0];

  useEffect(() => {
    if (reduced || !active) return;
    const timer = window.setInterval(() => {
      setCount((value) => {
        const next = value + 1;
        if (next % 4 === 0 && liveRef.current) liveRef.current.textContent = `${next} crossings so far`;
        return next;
      });
    }, 850);
    return () => window.clearInterval(timer);
  }, [reduced, active]);

  return (
    <div className="w-full" data-testid="scene-lattice">
      <SceneMedia structureId="bridge" panelSide="right">
        <p className="la-sub mb-3">{structure.storyName}</p>
        <h3 className="la-heading text-2xl md:text-4xl mb-5" data-testid="text-la-title-bridge">{content.title}</h3>
        <p className="la-sub mb-4 text-[10px]">Monitor a transit span</p>
        <div className="relative mb-6 border-l border-b border-t border-[rgba(162,172,184,0.1)] py-4 pl-4" data-testid="lattice-spans" aria-label="Spans converging on the lattice">
          <div className="flex flex-col gap-3">
            {Array.from({ length: 4 }, (_, i) => (
              <button
                key={i}
                type="button"
                data-testid={`lattice-span-${i}`}
                aria-label={`Follow span ${i + 1}`}
                onPointerEnter={(e) => e.pointerType === 'mouse' && setFollowed(i)}
                onPointerLeave={(e) => e.pointerType === 'mouse' && setFollowed(null)}
                onFocus={() => setFollowed(i)}
                onBlur={() => setFollowed(null)}
                onClick={() => setFollowed((value) => value === i ? null : i)}
                className="group relative flex items-center h-4 w-full focus-visible:outline-none"
              >
                <span className="block h-[1px] w-full transition-all duration-300" style={{ background: followed === i ? FUTURE_MAT.filament : 'rgba(162,172,184,0.2)', boxShadow: followed === i ? `0 0 10px ${FUTURE_MAT.filamentDim}` : undefined }} />
                <span className="absolute right-0 top-1/2 h-2 w-2 -translate-y-1/2 rounded-full transition-all duration-300" style={{ background: followed === i ? FUTURE_MAT.filament : 'transparent' }} aria-hidden="true" />
              </button>
            ))}
          </div>
          {followed !== null && <span className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 shadow-[0_0_12px_#40E0D0]" style={{ backgroundColor: FUTURE_MAT.filament }} data-testid="lattice-shopfront" />}
        </div>
        <p className="la-text-ceramic text-sm md:text-base" data-testid="text-la-counter">
          <span className="la-tabular text-2xl md:text-3xl">{count}</span>
          <span className="la-sub ml-3">crossings while you watched</span>
        </p>
        <span ref={liveRef} className="sr-only" aria-live="polite" />
        <dl className="my-6 flex flex-wrap gap-x-7 gap-y-3">
          {content.counters?.map((counter) => (
            <div key={counter.label} className="flex gap-2 items-baseline">
              <dd className="la-text-ceramic text-lg">{formatCounter(counter.value, counter.suffix)}</dd>
              <dt className="la-sub">{counter.label}</dt>
            </div>
          ))}
        </dl>
        <p className="la-text-titanium text-sm leading-relaxed" data-testid="text-la-consequence-bridge">{content.consequence}</p>
        <div className="min-h-[5rem] pt-6">
          <button type="button" data-testid="button-follow-span" aria-pressed={followed !== null} onClick={() => setFollowed((v) => v === null ? 1 : null)} className="la-sub underline-offset-4 hover:underline focus-visible:underline focus-visible:outline-none">
            {followed === null ? 'Follow a single span' : 'Let go of the span'}
          </button>
          {followed !== null && shop && <p className="la-text-filament mt-2 text-sm la-glow" data-testid="text-la-shopfront" aria-live="polite">{shop.name}. {shop.line}</p>}
        </div>
      </SceneMedia>
    </div>
  );
}
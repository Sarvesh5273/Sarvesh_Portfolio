import { useRef, useState } from 'react';
import type { Discovery } from '@/content/types';
import { useVisitor } from '@/store/VisitorContext';
import { useTorch, useTorchNear } from './torch';
import { BronzeMark } from './BronzeMark';

export function SideHalls({ discoveries, reduced }: { discoveries: Discovery[]; reduced: boolean }) {
  return (
    <div className="w-full max-w-6xl mx-auto px-4 md:px-8">
      <div className="k-copy-scrim text-center max-w-xl mx-auto mb-7">
        <p className="k-carved-light text-[11px] uppercase tracking-[0.4em] mb-3" style={{ opacity: 0.75 }}>Off the main path</p>
        <p className="text-sm md:text-base italic" style={{ opacity: 0.85 }}>
          {reduced ? 'Six sealed halls. Open any of them.' : 'Six sealed halls. Bring the light close, and open the ones you find.'}
        </p>
      </div>
      <ul className="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-5 list-none m-0 p-0">
        {discoveries.map((discovery) => <li key={discovery.id}><Hall discovery={discovery} /></li>)}
      </ul>
    </div>
  );
}

function Hall({ discovery }: { discovery: Discovery }) {
  const ref = useRef<HTMLDivElement>(null);
  const torch = useTorch();
  const near = useTorchNear(ref, 170);
  const { visitedDiscoveries, visitDiscovery } = useVisitor();
  const [focused, setFocused] = useState(false);
  const open = visitedDiscoveries.includes(discovery.id);
  const lit = near || focused || open || torch.mode === 'static';

  return (
    <div ref={ref} className="k-hall-wrap">
      <button
        type="button"
        className="k-hall w-full"
        data-lit={lit}
        data-open={open}
        aria-expanded={open}
        aria-label={`${discovery.name}, a sealed hall`}
        onClick={() => visitDiscovery(discovery.id)}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        data-testid={`hall-${discovery.id}`}
      >
        <span className="k-hall-arch">
          <span className="k-hall-leaf"><BronzeMark className="h-9 w-9" corrosion={0.7} /></span>
        </span>
        <span className="k-plaque k-carved block mt-2 mx-auto w-fit px-3 py-1 text-[10px] uppercase tracking-[0.2em]" data-testid={`hall-name-${discovery.id}`}>
          {lit ? discovery.name : 'sealed'}
        </span>
      </button>
      <div className="transition-all duration-700 overflow-hidden" style={{ maxHeight: open ? '14rem' : 0, opacity: open ? 1 : 0, marginTop: open ? '0.6rem' : 0 }} aria-hidden={!open} data-testid={`hall-body-${discovery.id}`}>
        <p className="text-sm italic leading-relaxed text-center">{discovery.line}</p>
        <p className="k-gloss text-xs leading-relaxed text-center mt-2">{discovery.description}</p>
        {discovery.href && <p className="text-center mt-2"><a href={discovery.href} target="_blank" rel="noreferrer" className="k-carved-light text-[11px] uppercase tracking-[0.25em] underline underline-offset-4" tabIndex={open ? 0 : -1} data-testid={`hall-link-${discovery.id}`}>the source</a></p>}
      </div>
    </div>
  );
}
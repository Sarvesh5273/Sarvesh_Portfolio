import { useEffect, useMemo, useState } from 'react';
import type { Structure } from '@/content/types';
import { discoveries, worlds } from '@/content';
import { getDoorway } from '@/content/doorways';
import { useVisitor } from '@/store/VisitorContext';
import { FUTURE_MAT, SceneMedia } from './SceneMedia';

const SETTLE_SECONDS = 5;

interface JourneyItem {
  key: string;
  kind: 'doorway' | 'world' | 'discovery';
  label: string;
}

export function StillLake({ structure, reduced, active }: { structure: Structure; reduced: boolean; active: boolean }) {
  const { chosenDoorway, visitedDiscoveries, timestamps } = useVisitor();
  const doorway = getDoorway(chosenDoorway);
  const content = structure.longAfter;
  const [stillFor, setStillFor] = useState(0);

  const journey = useMemo<JourneyItem[]>(() => {
    const items: JourneyItem[] = [];
    if (doorway) items.push({ key: 'doorway', kind: 'doorway', label: doorway.name });
    worlds
      .filter((world) => world.id !== 'longAfter' && world.id !== 'presentRoom' && timestamps[world.id])
      .sort((a, b) => (timestamps[a.id] ?? 0) - (timestamps[b.id] ?? 0))
      .forEach((world) => items.push({ key: world.id, kind: 'world', label: world.title }));
    visitedDiscoveries.forEach((id) => {
      const discovery = discoveries.find((item) => item.id === id);
      if (discovery) items.push({ key: id, kind: 'discovery', label: discovery.name });
      else if (id === 'gate-asked') items.push({ key: id, kind: 'discovery', label: 'Asked at the Gate' });
    });
    return items;
  }, [doorway, timestamps, visitedDiscoveries]);

  useEffect(() => {
    if (reduced) {
      setStillFor(SETTLE_SECONDS);
      return;
    }
    let lastMove = performance.now();
    let timer = 0;
    const disturb = () => {
      lastMove = performance.now();
      setStillFor(0);
    };
    const events: (keyof WindowEventMap)[] = ['pointermove', 'pointerdown', 'wheel', 'keydown', 'scroll', 'touchmove'];
    events.forEach((event) => window.addEventListener(event, disturb, { passive: true }));
    timer = window.setInterval(() => {
      if (active) setStillFor(Math.floor((performance.now() - lastMove) / 1000));
    }, 250);
    return () => {
      window.clearInterval(timer);
      events.forEach((event) => window.removeEventListener(event, disturb));
    };
  }, [reduced, active]);

  const settled = stillFor >= SETTLE_SECONDS;

  return (
    <div className="w-full" data-testid="scene-lake">
      <SceneMedia structureId="well" panelSide="left">
        <p className="la-sub mb-3">{structure.storyName}</p>
        <h3 className="la-heading text-2xl md:text-4xl mb-5" data-testid="text-la-title-well">{content.title}</h3>
        <p className="la-sub mb-4 text-[10px]">Stop moving. Let the dark water settle.</p>
        <div
          className="relative h-40 overflow-hidden border-t border-[rgba(162,172,184,0.1)]"
          data-testid="lake-surface"
          data-settled={settled || undefined}
          style={{ background: 'linear-gradient(180deg, rgba(3,5,7,0.8), transparent)' }}
        >
          <ol className="absolute inset-0 flex flex-wrap items-center justify-center gap-5 px-3" style={{ filter: `blur(${settled ? 0 : 2}px)`, opacity: settled ? 1 : 0.4, transition: 'filter 1200ms, opacity 1200ms' }}>
            {journey.map((item, index) => (
              <li key={item.key} className="flex max-w-24 flex-col items-center gap-2 text-center" data-testid={`lake-item-${item.key}`}>
                <span
                  className={`block border transition-colors duration-1000 ${item.kind === 'world' ? 'h-10 w-8 rounded-t-full' : item.kind === 'doorway' ? 'h-12 w-8' : 'h-4 w-4 rounded-full'}`}
                  style={{ borderColor: item.kind === 'doorway' ? FUTURE_MAT.filament : 'rgba(162,172,184,0.5)', background: item.kind === 'doorway' ? 'rgba(64,224,208,0.1)' : 'transparent', boxShadow: item.kind === 'doorway' ? '0 0 10px rgba(64,224,208,0.3)' : 'none' }}
                  aria-hidden="true"
                />
                <span className="la-sub text-[10px]" style={item.kind === 'doorway' ? { color: FUTURE_MAT.filament } : undefined}>{item.label}</span>
              </li>
            ))}
          </ol>
        </div>
        <ol className="sr-only" data-testid="lake-journey">{journey.map((item) => <li key={item.key}>{item.label}</li>)}</ol>
        <p className="la-text-filament la-tabular mt-4 text-sm la-glow" aria-live="polite" data-testid="text-la-stillness">
          {reduced ? 'The surface is still.' : settled ? `You have stood still for ${stillFor} s. The surface has settled; the reflection is clear.` : stillFor < 1 ? 'The surface is disturbed. Stand still.' : `You have stood still for ${stillFor} s.`}
        </p>
        <p className="la-text-titanium mt-3 text-sm leading-relaxed" data-testid="text-la-consequence-well">{content.consequence}</p>
        {content.nodes?.[0] && <p className="la-text-ceramic mt-4 text-sm leading-relaxed border-l border-[rgba(64,224,208,0.3)] pl-4" data-testid="text-la-companion"><span className="la-sub block mb-1">{content.nodes[0].name}</span>{content.nodes[0].line}</p>}
      </SceneMedia>
    </div>
  );
}
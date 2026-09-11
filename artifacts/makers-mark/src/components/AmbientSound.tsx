import { useEffect, useSyncExternalStore } from 'react';
import { useVisitor } from '@/store/VisitorContext';
import { useDissolve } from '@/lib/dissolve';
import { isAmbientEnabled, setAmbientEnabled, setAmbientWorld, subscribeAmbient } from '@/lib/ambient';

/**
 * The one visible control on the page: sound, off until asked for.
 * Sits opposite the sigil and is drawn in the world's own ink.
 */
export function AmbientToggle() {
  const { activeAct } = useVisitor();
  const dissolve = useDissolve();
  const enabled = useSyncExternalStore(subscribeAmbient, isAmbientEnabled, () => false);

  // The bed changes with the world; during a dissolve it changes with the material.
  const world = dissolve ? dissolve.to : activeAct;
  useEffect(() => {
    setAmbientWorld(world);
  }, [world]);

  return (
    <button
      type="button"
      onClick={() => void setAmbientEnabled(!enabled)}
      aria-pressed={enabled}
      aria-label={enabled ? 'Turn ambient sound off' : 'Turn ambient sound on'}
      data-testid="button-ambient-toggle"
      className="fixed bottom-8 left-6 md:left-8 z-[70] flex items-center gap-2 h-9 px-3 rounded-full text-[10px] uppercase tracking-[0.3em] mix-blend-difference text-white opacity-60 hover:opacity-100 focus-visible:opacity-100 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-white transition-opacity duration-500"
    >
      <span aria-hidden="true" className="flex items-end gap-[2px] h-3">
        {[0, 1, 2, 3].map((i) => (
          <span
            key={i}
            className={`w-[2px] bg-current rounded-sm ${enabled ? 'amb-bar' : ''}`}
            style={{ height: enabled ? undefined : '3px', animationDelay: `${i * 0.18}s` }}
          />
        ))}
      </span>
      <span>{enabled ? 'Sound on' : 'Sound'}</span>
    </button>
  );
}

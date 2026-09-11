import { KeyboardEvent, PointerEvent as ReactPointerEvent, useEffect, useRef, useState } from 'react';
import { FUTURE_MAT } from './SceneMedia';

const PULL_PX = 150;
const HOLD_MS = 1700;

interface Props {
  label: string;
  done: boolean;
  disabled?: boolean;
  reduced: boolean;
  onGrabbed: () => void;
}

export function FilamentGrab({ label, done, disabled = false, reduced, onGrabbed }: Props) {
  const [holding, setHolding] = useState(false);
  const [progressShown, setProgressShown] = useState(0);
  const grip = useRef({ startY: 0, startedAt: 0, active: false, pull: 0 });
  const firedRef = useRef(false);

  useEffect(() => {
    if (reduced) return;
    let raf = 0;
    const tick = () => {
      raf = requestAnimationFrame(tick);
      const state = grip.current;
      const hold = state.active ? Math.min(1, (performance.now() - state.startedAt) / HOLD_MS) : 0;
      const progress = state.active ? Math.max(state.pull, hold) : 0;
      setProgressShown(Math.round(progress * 20) / 20);
      if (progress >= 1 && !firedRef.current) {
        firedRef.current = true;
        state.active = false;
        setHolding(false);
        onGrabbed();
      }
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [reduced, onGrabbed]);

  const begin = (event: ReactPointerEvent<HTMLButtonElement>) => {
    if (disabled || done || firedRef.current) return;
    event.currentTarget.setPointerCapture(event.pointerId);
    grip.current = { startY: event.clientY, startedAt: performance.now(), active: true, pull: 0 };
    setHolding(true);
  };
  const move = (event: ReactPointerEvent<HTMLButtonElement>) => {
    if (grip.current.active) grip.current.pull = Math.max(0, Math.min(1, (event.clientY - grip.current.startY) / PULL_PX));
  };
  const end = () => {
    grip.current.active = false;
    grip.current.pull = 0;
    setHolding(false);
    setProgressShown(0);
  };
  const keyDown = (event: KeyboardEvent<HTMLButtonElement>) => {
    if (event.key !== 'Enter' && event.key !== ' ') return;
    event.preventDefault();
    if (event.repeat || disabled || done || grip.current.active) return;
    grip.current = { startY: 0, startedAt: performance.now(), active: true, pull: 0 };
    setHolding(true);
  };
  const keyUp = (event: KeyboardEvent<HTMLButtonElement>) => {
    if (event.key === 'Enter' || event.key === ' ') end();
  };

  if (reduced) {
    return (
      <div className="flex flex-col items-center gap-8" data-testid="grab-reduced">
        <span className="relative block h-[2px] w-full max-w-[600px]" style={{ background: FUTURE_MAT.filament, boxShadow: `0 0 12px ${FUTURE_MAT.filament}` }} aria-hidden="true"><span className="absolute left-1/2 top-1/2 h-3 w-3 -translate-x-1/2 -translate-y-1/2 rounded-full bg-white" /></span>
        {done ? <p className="la-text-ceramic text-sm italic" aria-live="polite" data-testid="text-grabbed">The light leads home. Scroll down.</p> : <button type="button" onClick={onGrabbed} disabled={disabled} data-testid="button-grab-filament" className="rounded-full border px-9 py-4 text-[12px] uppercase tracking-[0.35em] la-text-filament focus-visible:outline-none transition-colors hover:bg-[rgba(64,224,208,0.1)]" style={{ borderColor: FUTURE_MAT.filament }}>{label}</button>}
      </div>
    );
  }

  return (
    <div className="flex w-full flex-col items-center gap-6" data-testid="grab-filament" data-holding={holding || undefined}>
      <button
        type="button"
        className="la-grab-line relative h-20 w-full max-w-[600px] focus-visible:outline-none"
        tabIndex={done ? -1 : 0}
        aria-label={`${label}: press and hold, or drag downward`}
        aria-disabled={disabled || done}
        data-testid="grab-line"
        onPointerDown={begin}
        onPointerMove={move}
        onPointerUp={end}
        onPointerCancel={end}
        onLostPointerCapture={end}
        onKeyDown={keyDown}
        onKeyUp={keyUp}
      >
        <span className="absolute left-0 right-0 top-1/2 h-[2px] origin-center" style={{ background: FUTURE_MAT.filament, boxShadow: `0 0 ${8 + progressShown * 16}px ${FUTURE_MAT.filamentDim}`, transform: `translateY(${progressShown * 30}px) scaleX(${1 - progressShown * .05})` }} />
        <span className="absolute left-1/2 top-1/2 h-3 w-3 -translate-x-1/2 -translate-y-1/2 rounded-full bg-white" style={{ marginTop: progressShown * 30, boxShadow: `0 0 10px ${FUTURE_MAT.filament}` }} />
      </button>
      {done ? <p className="la-text-ceramic text-sm italic" aria-live="polite" data-testid="text-grabbed">The light leads home. Scroll down.</p> : <>
        <p className="la-text-filament la-glow text-[12px] uppercase tracking-[0.35em]" data-testid="text-grab-label">{label}</p>
        <p className="la-sub tracking-[0.15em]" data-testid="text-grab-hint">{holding ? 'Hold on. Or pull, and it goes faster.' : 'Take hold of the line and pull it down, or hold on until it gives.'}</p>
        <div className="h-px w-40 overflow-hidden bg-[rgba(162,172,184,0.2)] mt-2" aria-hidden="true"><div className="h-full transition-all duration-75" style={{ width: `${progressShown * 100}%`, backgroundColor: FUTURE_MAT.filament, boxShadow: `0 0 8px ${FUTURE_MAT.filament}` }} /></div>
        <span className="sr-only" aria-live="polite">{holding ? `Holding, ${Math.round(progressShown * 100)} percent` : ''}</span>
      </>}
    </div>
  );
}
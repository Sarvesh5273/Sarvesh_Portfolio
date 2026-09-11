import { createContext, useContext, useEffect, useRef, useState, RefObject } from 'react';

export type TorchMode = 'follow' | 'static';

export interface TorchPoint {
  x: number;
  y: number;
}

export interface TorchApi {
  mode: TorchMode;
  /** Current torch position in viewport pixels. */
  point: RefObject<TorchPoint>;
  /** Called on every torch move (rAF-throttled). Returns an unsubscribe. */
  subscribe: (fn: (p: TorchPoint) => void) => () => void;
}

export const TorchContext = createContext<TorchApi | null>(null);

export function useTorch(): TorchApi {
  const api = useContext(TorchContext);
  if (!api) throw new Error('useTorch must be used inside the Kingdom act');
  return api;
}

/**
 * Whether the torch is currently close to an element.
 * In static mode (touch / reduced motion) everything counts as lit.
 */
export function useTorchNear(ref: RefObject<HTMLElement | null>, radius: number): boolean {
  const torch = useTorch();
  const [near, setNear] = useState(torch.mode === 'static');
  useEffect(() => {
    if (torch.mode === 'static') return;
    return torch.subscribe((p) => {
      const el = ref.current;
      if (!el) return;
      const r = el.getBoundingClientRect();
      const cx = Math.max(r.left, Math.min(p.x, r.right));
      const cy = Math.max(r.top, Math.min(p.y, r.bottom));
      const d = Math.hypot(p.x - cx, p.y - cy);
      setNear((prev) => (prev ? d < radius * 1.25 : d < radius));
    });
  }, [torch, ref, radius]);
  return near;
}

/** Owns the pointer listener and fans positions out to subscribers. */
export function useTorchSource(container: RefObject<HTMLElement | null>, mode: TorchMode): TorchApi {
  const point = useRef<TorchPoint>({ x: window.innerWidth / 2, y: window.innerHeight * 0.45 });
  const subs = useRef(new Set<(p: TorchPoint) => void>());
  const apiRef = useRef<TorchApi | null>(null);
  if (!apiRef.current) {
    apiRef.current = {
      mode,
      point,
      subscribe: (fn) => {
        subs.current.add(fn);
        return () => {
          subs.current.delete(fn);
        };
      },
    };
  }

  useEffect(() => {
    const el = container.current;
    if (!el || mode === 'static') return;
    let raf = 0;
    let pending: TorchPoint | null = null;
    const flush = () => {
      raf = 0;
      if (!pending) return;
      point.current = pending;
      const rect = el.getBoundingClientRect();
      el.style.setProperty('--tx', `${pending.x - rect.left}px`);
      el.style.setProperty('--ty', `${pending.y - rect.top}px`);
      subs.current.forEach((fn) => fn(pending!));
      pending = null;
    };
    const onMove = (e: PointerEvent) => {
      if (e.pointerType !== 'mouse' && e.pointerType !== 'pen') return;
      pending = { x: e.clientX, y: e.clientY };
      if (!raf) raf = requestAnimationFrame(flush);
    };
    // Focus moves the torch too, so keyboard visitors light what they reach.
    const onFocus = (e: FocusEvent) => {
      const t = e.target as HTMLElement | null;
      if (!t || !t.getBoundingClientRect) return;
      const r = t.getBoundingClientRect();
      pending = { x: r.left + r.width / 2, y: r.top + r.height / 2 };
      if (!raf) raf = requestAnimationFrame(flush);
    };
    window.addEventListener('pointermove', onMove, { passive: true });
    el.addEventListener('focusin', onFocus);
    return () => {
      window.removeEventListener('pointermove', onMove);
      el.removeEventListener('focusin', onFocus);
      cancelAnimationFrame(raf);
    };
  }, [container, mode]);

  return apiRef.current;
}

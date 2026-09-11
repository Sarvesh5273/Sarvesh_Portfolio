import { forwardRef, useEffect, useImperativeHandle, useRef } from 'react';

export interface FramePlateHandle {
  /** Show the frame at normalised position 0..1 across the sequence. */
  setProgress: (p: number) => void;
  /** Show a specific frame index. */
  setFrame: (i: number) => void;
}

interface Props {
  /** Sequence name under public/media, e.g. "unwritten_travel". */
  name: string;
  /** Number of frames in the sequence. */
  count: number;
  /** Optional CSS class for the canvas wrapper. */
  className?: string;
  /** Initial frame, defaults to 0. */
  initial?: number;
  /** Called once the first frame has been drawn. */
  onReady?: () => void;
  /** Called once the opening playback buffer has downloaded and decoded. */
  onBuffered?: () => void;
}

/** Opening frames decoded before a story act accepts scroll input. */
const INITIAL_BUFFER = 24;
/** Upcoming frames kept decoded while moving through a plate. */
const AHEAD_WINDOW = 28;
/** Recent frames kept decoded for a small reverse scrub. */
const BEHIND_WINDOW = 8;
/** Frames beyond this distance are released (hysteresis so a scrub does not thrash). */
const EVICT = 36;
/** Every Nth frame is kept as a coarse skeleton so a fast scrub always lands near something. */
const COARSE = 12;
const WORKERS = 4;

function pickWidth() {
  if (typeof window === 'undefined') return 1600;
  const navigatorWithHints = navigator as Navigator & {
    connection?: { saveData?: boolean };
    deviceMemory?: number;
  };
  const lowerPowerDevice =
    navigatorWithHints.connection?.saveData === true ||
    (navigatorWithHints.deviceMemory !== undefined && navigatorWithHints.deviceMemory <= 4) ||
    (navigator.hardwareConcurrency !== undefined && navigator.hardwareConcurrency <= 4);
  if (lowerPowerDevice) return 800;
  const need = window.innerWidth * Math.min(window.devicePixelRatio || 1, 2);
  return need <= 900 ? 800 : 1600;
}

export function frameUrl(name: string, width: number, index: number) {
  return `${import.meta.env.BASE_URL}media/${name}/w${width}/f${String(index).padStart(3, '0')}.webp`;
}

export function posterUrl(name: string) {
  return `${import.meta.env.BASE_URL}media/${name}/poster.jpg`;
}

/**
 * A scroll-scrubbable cinematic plate: a sequence of extracted video frames drawn
 * to a canvas with cover fit. The caller drives the frame index from a GSAP
 * timeline proxy so scrolling moves the camera.
 *
 * Memory is bounded: only a window around the current frame plus a coarse
 * skeleton stays decoded, and when the plate leaves the viewport (acts stay
 * mounted once unlocked) everything but the current frame is released.
 */
export const FramePlate = forwardRef<FramePlateHandle, Props>(function FramePlate(
  { name, count, className, initial = 0, onReady, onBuffered },
  ref,
) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const cacheRef = useRef<Map<number, HTMLImageElement>>(new Map());
  const pendingRef = useRef<Set<number>>(new Set());
  const currentRef = useRef(initial);
  const drawnRef = useRef(-1);
  const rafRef = useRef(0);
  const widthRef = useRef<number>(1600);
  const onScreenRef = useRef(true);
  const aliveRef = useRef(true);
  const readyRef = useRef(false);
  const bufferedRef = useRef(false);
  const settledRef = useRef<Set<number>>(new Set());
  const workersRef = useRef(0);
  const directionRef = useRef<1 | -1>(1);

  const draw = () => {
    rafRef.current = 0;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const want = currentRef.current;
    const cache = cacheRef.current;
    // Nearest decoded frame so a scrub never shows a blank.
    let img: HTMLImageElement | undefined;
    let pick = -1;
    for (let d = 0; d < count && !img; d++) {
      const a = cache.get(want - d);
      const b = cache.get(want + d);
      if (a) {
        img = a;
        pick = want - d;
      } else if (b) {
        img = b;
        pick = want + d;
      }
    }
    if (!img || !img.complete || img.naturalWidth === 0) return;
    if (drawnRef.current === pick) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const cw = canvas.clientWidth;
    const ch = canvas.clientHeight;
    if (canvas.width !== Math.round(cw * dpr) || canvas.height !== Math.round(ch * dpr)) {
      canvas.width = Math.round(cw * dpr);
      canvas.height = Math.round(ch * dpr);
    }
    const scale = Math.max(canvas.width / img.naturalWidth, canvas.height / img.naturalHeight);
    const dw = img.naturalWidth * scale;
    const dh = img.naturalHeight * scale;
    ctx.drawImage(img, (canvas.width - dw) / 2, (canvas.height - dh) / 2, dw, dh);
    drawnRef.current = pick;
  };

  const schedule = () => {
    if (!rafRef.current) rafRef.current = requestAnimationFrame(draw);
  };

  const evict = () => {
    const c = currentRef.current;
    const cache = cacheRef.current;
    for (const [i, img] of cache) {
      if (i === c) continue;
      const far = Math.abs(i - c) > EVICT && i % COARSE !== 0;
      if (far || !onScreenRef.current) {
        img.src = '';
        cache.delete(i);
        if (drawnRef.current === i) drawnRef.current = -1;
      }
    }
  };

  const settle = (i: number, img?: HTMLImageElement) => {
    if (!aliveRef.current) {
      img && (img.src = '');
      pendingRef.current.delete(i);
      return;
    }
    if (img) cacheRef.current.set(i, img);
    pendingRef.current.delete(i);
    settledRef.current.add(i);
    if (!readyRef.current && img) {
      readyRef.current = true;
      onReady?.();
    }
    const openingCount = Math.min(INITIAL_BUFFER, count);
    if (!bufferedRef.current && settledRef.current.size >= openingCount) {
      bufferedRef.current = true;
      onBuffered?.();
    }
    schedule();
  };

  const load = (i: number) =>
    new Promise<void>((resolve) => {
      const img = new Image();
      img.decoding = 'async';
      img.onload = () => {
        // Do not let the first scroll draw trigger synchronous decoding.
        // decode() resolves immediately on browsers that have already decoded it.
        void img.decode().catch(() => undefined).then(() => {
          settle(i, img);
          resolve();
        });
      };
      img.onerror = () => {
        // A malformed or missing frame must not leave the opening loader stuck.
        settle(i);
        resolve();
      };
      img.src = frameUrl(name, widthRef.current, i);
    });

  /** Next frame worth fetching: startup buffer, direction of travel, then a sparse skeleton. */
  const nextToLoad = (): number | null => {
    const c = currentRef.current;
    const cache = cacheRef.current;
    const pending = pendingRef.current;
    const free = (i: number) => i >= 0 && i < count && !cache.has(i) && !pending.has(i);
    if (!bufferedRef.current) {
      for (let i = 0; i < Math.min(INITIAL_BUFFER, count); i++) if (free(i)) return i;
    }
    if (free(c)) return c;
    if (!onScreenRef.current) return null;
    for (let d = 1; d <= AHEAD_WINDOW; d++) {
      const i = c + d * directionRef.current;
      if (free(i)) return i;
    }
    for (let d = 1; d <= BEHIND_WINDOW; d++) {
      const i = c - d * directionRef.current;
      if (free(i)) return i;
    }
    for (let i = 0; i < count; i += COARSE) if (free(i)) return i;
    return null;
  };

  const pump = () => {
    while (workersRef.current < WORKERS) {
      const i = nextToLoad();
      if (i === null) return;
      pendingRef.current.add(i);
      workersRef.current++;
      load(i).finally(() => {
        workersRef.current--;
        if (aliveRef.current) pump();
      });
    }
  };

  const goTo = (i: number) => {
    const c = Math.min(count - 1, Math.max(0, Math.round(i)));
    if (c === currentRef.current) return;
    directionRef.current = c > currentRef.current ? 1 : -1;
    currentRef.current = c;
    schedule();
    evict();
    pump();
  };

  useImperativeHandle(ref, () => ({
    setProgress(p) {
      goTo(Math.min(1, Math.max(0, p)) * (count - 1));
    },
    setFrame(i) {
      goTo(i);
    },
  }));

  useEffect(() => {
    aliveRef.current = true;
    readyRef.current = false;
    bufferedRef.current = false;
    settledRef.current = new Set();
    widthRef.current = pickWidth();
    cacheRef.current = new Map();
    pendingRef.current = new Set();
    currentRef.current = initial;
    directionRef.current = 1;
    drawnRef.current = -1;
    pump();

    const canvas = canvasRef.current;
    // Acts stay mounted once unlocked; an off-screen plate keeps only its current frame.
    const observer =
      canvas && typeof IntersectionObserver !== 'undefined'
        ? new IntersectionObserver(
            ([entry]) => {
              const on = entry.isIntersecting;
              if (on === onScreenRef.current) return;
              onScreenRef.current = on;
              if (on) pump();
              else evict();
            },
            { rootMargin: '25% 0px' },
          )
        : null;
    if (canvas && observer) observer.observe(canvas);

    const onResize = () => {
      drawnRef.current = -1;
      schedule();
    };
    window.addEventListener('resize', onResize);
    return () => {
      aliveRef.current = false;
      observer?.disconnect();
      window.removeEventListener('resize', onResize);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      for (const img of cacheRef.current.values()) img.src = '';
      cacheRef.current.clear();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [name, count]);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className={className ?? 'absolute inset-0 h-full w-full'}
      style={{ backgroundImage: `url(${posterUrl(name)})`, backgroundSize: 'cover', backgroundPosition: 'center' }}
    />
  );
});

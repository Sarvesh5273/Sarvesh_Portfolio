import { KeyboardEvent, PointerEvent, useCallback, useEffect, useRef, useState } from 'react';
import type { Structure } from '@/content/types';
import { useVisitor } from '@/store/VisitorContext';
import './unwritten.css';

const HOLD_MS = 2200;
const RECENT_MOVE_MS = 400;
interface Props {
  structure: Structure;
  reduced: boolean;
}

/** A physical sketchbook panel over the travelling plate, with each original discovery interaction intact. */
export function UnwrittenStructure({ structure, reduced }: Props) {
  const { visitDiscovery } = useVisitor();
  const [sharp, setSharp] = useState(false);
  const [extended, setExtended] = useState(false);
  const [favored, setFavored] = useState<number | null>(null);
  const [lookingIn, setLookingIn] = useState(false);
  const { progress: gateProgress, opened, start: startHold, stop: stopHold } = useHold(reduced);
  const id = structure.id;

  useEffect(() => {
    if (opened) visitDiscovery(`${id}-asked`);
  }, [opened, id, visitDiscovery]);

  const onPointerEnter = (event: PointerEvent) => {
    if (event.pointerType === 'mouse') setSharp(true);
  };
  const onPointerLeave = (event: PointerEvent) => {
    if (event.pointerType === 'mouse') {
      setSharp(false);
      setExtended(false);
      setFavored(null);
    }
  };
  const onPointerDown = (event: PointerEvent) => {
    if (event.pointerType !== 'mouse') setSharp((value) => !value);
  };
  const words = structure.unwritten.intent.split(' ');
  const panelSide = id === 'well' || id === 'gate' ? 'right' : 'left';
  const framePosition = {
    orchard: 'items-end pb-8 md:items-end md:pb-16',
    bridge: 'items-end pb-8 md:items-start md:pt-16',
    well: 'items-end pb-8 md:items-center',
    gate: 'items-end pb-8 md:items-end md:pb-16',
  }[id];

  const rotations = { bridge: '-1deg', well: '0.5deg', gate: '-0.5deg', orchard: '1deg' };
  const rotation = rotations[id as keyof typeof rotations] || '0deg';

  const body = (
    <div
      className="relative w-full max-w-[28rem] p-7 md:p-8 text-left uw-paper uw-blueprint-grid"
      style={{ transform: `rotate(${rotation})` }}
    >
      <div className="uw-tape w-20 h-6 -top-3 left-1/2 -translate-x-1/2 -rotate-2" />

      <span data-testid={`glyph-${id}`} data-world="unwritten" aria-hidden="true" />

      <div className="mb-6 border-b border-[#2A2724]/10 pb-4">
        <div className="flex items-center gap-3">
          <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-[#5A5C5B]">
            Project {id === 'orchard' ? '01' : id === 'bridge' ? '02' : id === 'well' ? '03' : '04'}
          </p>
          <div className="w-1 h-1 rounded-full bg-[#2A2724]/20" />
          <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-[#5A5C5B]">
            {structure.unwritten.projectName}
          </p>
        </div>
        <p className="mt-3 font-mono text-[9px] uppercase tracking-[0.16em] text-[#5A5C5B]">{structure.unwritten.category}</p>
        <p className="mt-2 font-mono text-[9px] uppercase tracking-[0.16em] text-[#797b79]">{structure.unwritten.status}</p>
      </div>

      <p
          className={`uw-intent mt-2 text-xl md:text-2xl leading-relaxed font-[family-name:var(--app-font-serif)] text-[#1A1C1B] ${
          id === 'bridge' ? 'cursor-pointer' : ''
        }`}
        data-testid={`text-intent-${id}`}
        onPointerEnter={id === 'bridge' ? () => setExtended(true) : undefined}
        onPointerLeave={id === 'bridge' ? () => setExtended(false) : undefined}
        onPointerDown={id === 'bridge' ? () => setExtended((value) => !value) : undefined}
        aria-label={structure.unwritten.intent}
      >
        {words.map((word, index) => (
          <span key={index} className="uw-word inline-block will-change-[opacity,transform]" aria-hidden="true">
            {word}
            {index < words.length - 1 ? '\u00A0' : ''}
          </span>
        ))}
      </p>

      {id === 'bridge' && (
        <div
          className="mt-4 h-px bg-[#2A2724] transition-[width,opacity] duration-1000"
          style={{ width: extended ? '100%' : '28%', opacity: extended ? 0.6 : 0.2 }}
          aria-hidden="true"
        />
      )}

      <div className="mt-8 relative">
        <div
          className="absolute -left-4 top-4 w-3 h-px bg-[#2A2724] opacity-30"
          style={{ transform: 'rotate(15deg)' }}
          aria-hidden="true"
        />
        <p
          className="uw-hand min-h-16 pl-4 text-xl md:text-2xl leading-relaxed text-[#3A3C3B] mix-blend-multiply"
          data-testid={`text-discovery-${id}`}
          style={{
            opacity: sharp || reduced ? 0.9 : 0,
            transform: sharp || reduced ? 'translateY(0) rotate(-1deg)' : 'translateY(4px) rotate(0deg)',
            transition: 'opacity 800ms ease 100ms, transform 800ms ease 100ms',
          }}
          aria-hidden={!(sharp || reduced)}
        >
          {id === 'gate' && opened ? 'A faint line has been recorded. You asked.' : structure.unwritten.discovery}
        </p>
      </div>

      {id === 'bridge' && (
        <div className="mt-8 pt-4 border-t border-[#2A2724]/10">
          <button
            type="button"
            data-testid="bridge-handwriting"
            aria-pressed={extended}
            className="uw-sketch-button font-mono text-[10px] uppercase tracking-[0.2em] text-[#5A5C5B]"
            onPointerEnter={() => setExtended(true)}
            onPointerLeave={() => setExtended(false)}
            onFocus={() => setExtended(true)}
            onBlur={() => setExtended(false)}
            onClick={() => {
              setSharp(true);
              setExtended((value) => !value);
            }}
          >
            {extended ? 'The build note is open' : 'Read the build note'}
          </button>
        </div>
      )}

      {id === 'well' && (
        <div className="mt-8 pt-4 border-t border-[#2A2724]/10">
          <button
            type="button"
            data-testid="button-look-into-well"
            aria-pressed={lookingIn}
            onClick={() => {
              setSharp(true);
              setLookingIn((value) => !value);
            }}
            className="uw-sketch-button font-mono text-[10px] uppercase tracking-[0.2em] text-[#5A5C5B]"
          >
            {lookingIn ? 'The project note is open' : 'Read the project note'}
          </button>
        </div>
      )}

      {id === 'gate' && (
        <div className="mt-8 pt-4 border-t border-[#2A2724]/10">
          {!opened && <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-[#5A5C5B]">Hold here to ask the gate</p>}
          {opened && <div data-testid="gate-asked-line" className="mt-4 h-[2px] w-full bg-[#2A2724] opacity-80 rounded-full" />}
        </div>
      )}

      {id === 'orchard' && (
        <div className="mt-8 pt-4 border-t border-[#2A2724]/10">
          <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-[#5A5C5B] mb-6">Explore the recommendation field</p>
          <div className="flex h-14 items-end justify-around border-b border-[#2A2724]/20 pb-[1px]" aria-label="Seedlings">
            {Array.from({ length: 7 }, (_, index) => (
              <button
                key={index}
                type="button"
                data-testid={`orchard-seedling-${index}`}
                aria-label={`Lean toward seedling ${index + 1}`}
                aria-pressed={favored === index}
                className="w-1.5 rounded-t-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-current"
                style={{
                  backgroundColor: favored === null || favored === index ? '#2A2724' : '#8A8E8C',
                  height: favored === null || favored === index ? '100%' : '35%',
                  opacity: favored === null || favored === index ? 0.8 : 0.3,
                  transition: 'all 600ms cubic-bezier(0.22, 1, 0.36, 1)'
                }}
                onPointerEnter={() => setFavored(index)}
                onPointerLeave={() => setFavored(null)}
                onFocus={() => setFavored(index)}
                onBlur={() => setFavored(null)}
                onClick={() => {
                  setSharp(true);
                  setFavored((value) => (value === index ? null : index));
                }}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );

  const content = id === 'gate' ? (
    <GateHold progress={gateProgress} opened={opened} reduced={reduced} start={startHold} stop={stopHold}>
      {body}
    </GateHold>
  ) : body;

  return (
    <div
      className={`uw-body relative flex min-h-[min(62vh,36rem)] w-full ${framePosition} ${
        panelSide === 'left' ? 'justify-start' : 'justify-end'
      } ${sharp ? 'is-sharp' : ''}`}
      data-testid={`structure-${id}`}
      data-sharp={sharp || undefined}
      onPointerEnter={onPointerEnter}
      onPointerLeave={onPointerLeave}
      onPointerDown={onPointerDown}
      onFocusCapture={() => setSharp(true)}
      onBlurCapture={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget as Node | null)) setSharp(false);
      }}
      style={{
        opacity: reduced || sharp ? 1 : 0.9,
        transition: reduced ? undefined : 'opacity 700ms ease, transform 1000ms cubic-bezier(.22,.61,.36,1)',
        transform: sharp && !reduced ? 'scale(1.015)' : 'scale(1)',
      }}
    >
      {content}
    </div>
  );
}

function useHold(reduced: boolean) {
  const [progress, setProgress] = useState(0);
  const [opened, setOpened] = useState(false);
  const holding = useRef(false);
  const running = useRef(false);
  const raf = useRef(0);
  const last = useRef(0);
  const value = useRef(0);

  const tick = useCallback((now: number) => {
    const dt = Math.min(64, now - last.current);
    last.current = now;
    const next = holding.current ? value.current + dt / HOLD_MS : value.current - dt / (HOLD_MS * 0.5);
    value.current = Math.max(0, Math.min(1, next));
    setProgress(value.current);
    if (value.current >= 1) {
      setOpened(true);
      running.current = false;
      return;
    }
    if (value.current <= 0 && !holding.current) {
      running.current = false;
      return;
    }
    raf.current = requestAnimationFrame(tick);
  }, []);

  useEffect(() => () => cancelAnimationFrame(raf.current), []);

  const start = useCallback(() => {
    if (reduced) {
      setOpened(true);
      setProgress(1);
      return;
    }
    holding.current = true;
    if (!running.current && value.current < 1) {
      running.current = true;
      last.current = performance.now();
      raf.current = requestAnimationFrame(tick);
    }
  }, [reduced, tick]);
  const stop = useCallback(() => {
    holding.current = false;
  }, []);
  return { progress, opened, start, stop };
}

interface GateHoldProps {
  progress: number;
  opened: boolean;
  reduced: boolean;
  start: () => void;
  stop: () => void;
  children: React.ReactNode;
}

function GateHold({ progress, opened, reduced, start, stop, children }: GateHoldProps) {
  const lastRealMove = useRef(0);
  useEffect(() => {
    const onMove = (event: globalThis.PointerEvent) => {
      if (event.pointerType === 'mouse' && (event.movementX !== 0 || event.movementY !== 0)) {
        lastRealMove.current = performance.now();
      }
    };
    window.addEventListener('pointermove', onMove, { passive: true });
    return () => window.removeEventListener('pointermove', onMove);
  }, []);
  const approachedByMouse = () => performance.now() - lastRealMove.current < RECENT_MOVE_MS;
  const onKeyDown = (event: KeyboardEvent) => {
    if (event.key === ' ' || event.key === 'Enter') {
      event.preventDefault();
      start();
    }
  };
  const onKeyUp = (event: KeyboardEvent) => {
    if (event.key === ' ' || event.key === 'Enter') stop();
  };

  return (
    <div
      className="relative select-none touch-none"
      role="button"
      tabIndex={0}
      aria-label={opened ? 'The gate is open' : reduced ? 'Ask the gate to open' : 'Hold here, slowly, to ask the gate to open'}
      aria-pressed={opened}
      data-testid="button-gate-hold"
      onPointerEnter={(event) => event.pointerType === 'mouse' && approachedByMouse() && start()}
      onPointerMove={(event) => {
        if (event.pointerType === 'mouse' && !opened && (event.movementX !== 0 || event.movementY !== 0)) start();
      }}
      onPointerLeave={(event) => event.pointerType === 'mouse' && stop()}
      onPointerDown={(event) => {
        if (event.pointerType !== 'mouse') {
          event.currentTarget.setPointerCapture(event.pointerId);
          start();
        } else if (reduced) start();
      }}
      onPointerUp={(event) => event.pointerType !== 'mouse' && stop()}
      onPointerCancel={stop}
      onKeyDown={onKeyDown}
      onKeyUp={onKeyUp}
      onClick={reduced ? start : undefined}
      style={{ cursor: opened ? 'default' : 'pointer', outline: 'none' }}
    >
      {children}
      {!reduced && (
        <div
          aria-hidden="true"
          data-testid="gate-hold-progress"
          className="absolute -bottom-14 left-1/2 h-10 w-10 -translate-x-1/2 rounded-full border border-[#2A2724]/20"
          style={{
            opacity: opened ? 0 : progress > 0.02 ? 1 : 0,
            background: `conic-gradient(#2A2724 ${progress * 360}deg, transparent 0deg)`,
            WebkitMaskImage: 'radial-gradient(circle, transparent 50%, black 54%)',
            maskImage: 'radial-gradient(circle, transparent 50%, black 54%)',
            transition: 'opacity 500ms ease',
          }}
        />
      )}
    </div>
  );
}

import { Suspense, lazy, useEffect, useRef } from 'react';
import Lenis from 'lenis';
import gsap from 'gsap';
import ScrollTrigger from 'gsap/ScrollTrigger';
import { useVisitor } from '@/store/VisitorContext';
import { worlds } from '@/content';
import type { ActId } from '@/content/types';
import { Sigil } from '@/components/Sigil';
import { MaterialDissolve } from '@/components/MaterialDissolve';
import { AmbientToggle } from '@/components/AmbientSound';
import { Prologue } from '@/components/Prologue';
import { UnwrittenAct } from '@/components/unwritten/UnwrittenAct';
import { setLenis, refreshScrollAfterLayout, scrollToElement, prefersReducedMotion, waitForElement } from '@/lib/scroll';
import { beginDissolve, useDissolve } from '@/lib/dissolve';

gsap.registerPlugin(ScrollTrigger);

/**
 * Every world after the fog carries its own imagery, canvas and choreography,
 * so each one is its own chunk. A chunk is fetched as soon as the world before
 * it is unlocked, which leaves a whole world of scrolling for it to arrive in;
 * by the time the gate is reached the next act is already in memory.
 */
const loaders = {
  kingdom: () => import('@/components/kingdom/KingdomAct').then((m) => ({ default: m.KingdomAct })),
  presentRoom: () => import('@/components/present-room/PresentRoomAct').then((m) => ({ default: m.PresentRoomAct })),
  coda: () => import('@/components/CodaAct').then((m) => ({ default: m.CodaAct })),
};
const KingdomAct = lazy(loaders.kingdom);
const PresentRoomAct = lazy(loaders.presentRoom);
const CodaAct = lazy(loaders.coda);

const NEXT_ACT: Partial<Record<ActId, keyof typeof loaders>> = {
  unwritten: 'kingdom',
  kingdom: 'presentRoom',
  presentRoom: 'coda',
};

const WORLD_BG: Record<ActId, string> = {
  prologue: '#FCFDFD',
  unwritten: '#D9D2C6',
  kingdom: '#14110e',
  presentRoom: '#DFCCAE',
  coda: '#FCFDFD',
};

export function Home() {
  const { unlockedActs, activeAct, unlockAll, unlockNextAct } = useVisitor();
  const dissolve = useDissolve();

  // Dev-only hook so the dissolves can be driven from an automated browser without replaying every gate.
  useEffect(() => {
    if (!import.meta.env.DEV) return;
    const w = window as unknown as { __makersMark?: unknown };
    w.__makersMark = { beginDissolve, unlockAll, unlockNextAct };
    return () => {
      delete w.__makersMark;
    };
  }, [unlockAll, unlockNextAct]);

  useEffect(() => {
    const isReducedMotion = prefersReducedMotion();
    const lenis = new Lenis({
      smoothWheel: !isReducedMotion,
      duration: isReducedMotion ? 0 : 1.2,
    });
    setLenis(lenis);
    const tick = (time: number) => lenis.raf(time * 1000);
    lenis.on('scroll', ScrollTrigger.update);
    gsap.ticker.add(tick);
    gsap.ticker.lagSmoothing(0);

    return () => {
      gsap.ticker.remove(tick);
      setLenis(null);
      lenis.destroy();
    };
  }, []);

  // The document behind everything wears the colour of the world being shown
  // (or, mid-dissolve, the one being formed) so a heavy repaint never flashes white.
  const shownWorld = dissolve ? dissolve.to : activeAct;
  useEffect(() => {
    document.documentElement.style.backgroundColor = WORLD_BG[shownWorld];
    document.body.style.backgroundColor = WORLD_BG[shownWorld];
  }, [shownWorld]);

  // Prefetch the chunk for the world after the newest unlocked one.
  const lastUnlocked = unlockedActs[unlockedActs.length - 1];
  useEffect(() => {
    const next = NEXT_ACT[lastUnlocked];
    if (next) void loaders[next]();
  }, [lastUnlocked]);

  // Acts are appended to the DOM as gates unlock. Every earlier pin was measured
  // before the new act existed, so wait for it to mount, re-measure, then travel to it.
  const previousUnlocked = useRef(lastUnlocked);
  useEffect(() => {
    if (previousUnlocked.current === lastUnlocked) return;
    previousUnlocked.current = lastUnlocked;
    // The Prologue carries the visitor through the chosen doorway itself.
    if (lastUnlocked === 'unwritten') return;
    let cancelled = false;
    waitForElement(`act-${lastUnlocked}`)
      .then(() => refreshScrollAfterLayout())
      .then(() => {
        if (!cancelled) scrollToElement(`act-${lastUnlocked}`);
      });
    return () => {
      cancelled = true;
    };
  }, [lastUnlocked]);

  const fallback = (bg: string) => <div className="h-screen" style={{ backgroundColor: bg }} aria-hidden="true" />;

  return (
    <main
      className="w-full relative min-h-screen transition-colors duration-1000 overflow-x-hidden"
      data-world={activeAct}
      style={{ backgroundColor: 'var(--world-bg)', color: 'var(--world-fg)' }}
    >
      <div className="noise-layer pointer-events-none fixed inset-0 z-50 mix-blend-overlay"></div>

      <button
        onClick={() => (unlockedActs.includes('coda') ? scrollToElement('act-coda') : unlockAll())}
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 z-[100] bg-black text-white p-4 font-bold"
      >
        Skip to Coda (Conventional Portfolio)
      </button>

      <Sigil />
      <MaterialDissolve />
      <AmbientToggle />

      {/* Each act lives in its own slot: ScrollTrigger's pin-spacer re-parents the
          pinned section, and React must never see that node move (otherwise inserting
          a later act throws insertBefore errors when several unlock at once). */}
      {unlockedActs.includes('prologue') && (
        <div data-act-slot="prologue">
          <Prologue isUnlocked={unlockedActs.includes('unwritten')} />
        </div>
      )}

      {worlds.map((world) => {
        if (!unlockedActs.includes(world.id)) return null;
        if (world.id === 'unwritten') {
          return (
            <div key={world.id} data-act-slot={world.id}>
              <UnwrittenAct />
            </div>
          );
        }
        const Act = world.id === 'kingdom' ? KingdomAct : PresentRoomAct;
        return (
          <div key={world.id} data-act-slot={world.id}>
            <Suspense fallback={fallback(WORLD_BG[world.id])}>
              <Act />
            </Suspense>
          </div>
        );
      })}

      {unlockedActs.includes('coda') && (
        <div data-act-slot="coda">
          <Suspense fallback={fallback(WORLD_BG.coda)}>
            <CodaAct />
          </Suspense>
        </div>
      )}
    </main>
  );
}

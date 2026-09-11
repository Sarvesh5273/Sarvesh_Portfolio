import { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import ScrollTrigger from 'gsap/ScrollTrigger';
import { discoveriesByWorld, structureById, worlds } from '@/content';
import { useVisitor } from '@/store/VisitorContext';
import { prefersReducedMotion } from '@/lib/scroll';
import { beginDissolve } from '@/lib/dissolve';
import { isTouchPrimary } from '@/lib/device';
import { TorchContext, useTorchSource } from './torch';
import { StoneBridge, StoneWell, StoneGates, StoneOrchard } from './KingdomStructures';
import { SideHalls } from './SideHalls';
import { Parchment } from './Ledger';
import { UnfinishedCarving } from './UnfinishedCarving';
import { FramePlate, posterUrl, type FramePlateHandle } from '@/components/FramePlate';
import './kingdom.css';

const world = worlds.find((w) => w.id === 'kingdom')!;
const halls = discoveriesByWorld('kingdom');

/**
 * Act 2. The Buried Kingdom: the four structures as built, used and recorded,
 * lit by a torch the visitor carries. Leaving means finishing a carving by hand.
 */
export function KingdomAct() {
  const containerRef = useRef<HTMLElement>(null);
  const plateRef = useRef<FramePlateHandle>(null);
  const { setActiveAct, recordEntry, unlockNextAct, unlockedActs } = useVisitor();
  const [reduced] = useState(prefersReducedMotion);
  const [touch] = useState(isTouchPrimary);
  const torchMode = reduced || touch ? 'static' : 'follow';
  const torch = useTorchSource(containerRef, torchMode);
  const carved = unlockedActs.indexOf('kingdom') < unlockedActs.length - 1;
  const [refracting, setRefracting] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setActiveAct('kingdom');
          recordEntry('kingdom');
        }
      },
      // Fires when the act crosses the middle of the viewport; a ratio threshold
      // never fires for a section taller than the viewport (the reduced-motion layout).
      { rootMargin: '-50% 0px -50% 0px', threshold: 0 },
    );
    if (containerRef.current) observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, [setActiveAct, recordEntry]);

  useEffect(() => {
    if (reduced) return;
    const ctx = gsap.context(() => {
      const frames = gsap.utils.toArray<HTMLElement>('.k-frame');
      const syncInert = () => {
        frames.forEach((frame) => {
          const visible = Number(gsap.getProperty(frame, 'opacity')) > 0.5;
          frame.style.pointerEvents = visible ? 'auto' : 'none';
          if (visible) frame.removeAttribute('inert');
          else frame.setAttribute('inert', '');
        });
      };

      const END = '+=1000%';
      const tl = gsap.timeline({
        // With scrub smoothing the timeline keeps moving after the last scroll event;
        // only its own onUpdate sees the final opacities, so inert is synced there too.
        onUpdate: syncInert,
        scrollTrigger: {
          trigger: containerRef.current,
          start: 'top top',
          end: END,
          pin: true,
          scrub: 1,
          onUpdate: syncInert,
          onRefresh: syncInert,
        },
      });
      syncInert();

      const cam = { p: 0 };
      tl.to(cam, { p: 1, duration: 20, ease: 'none', onUpdate: () => plateRef.current?.setProgress(cam.p) }, 0);
      tl.to('.k-title', { opacity: 0, y: -24, duration: 0.7 }, 0.4);

      // Plate order: Bridge 3–18, Well 18–33, Gate 34–60, side halls 60–71,
      // Orchard 72–95. The DOM order below must match this order. Fades are deliberately short beside the reading holds.
      const beats = [
        { frame: frames[0], at: 0.65, hold: 2.55 },
        { frame: frames[1], at: 3.75, hold: 2.55 },
        { frame: frames[2], at: 7.15, hold: 4.65 },
        { frame: frames[3], at: 12.65, hold: 1.55 },
        { frame: frames[4], at: 15.1, hold: 4.1 },
      ];
      beats.forEach(({ frame, at, hold }) => {
        const body = frame.querySelector('.k-rise');
        tl.fromTo(frame, { opacity: 0 }, { opacity: 1, duration: 0.45 }, at);
        tl.fromTo(body, { y: 24 }, { y: 0, duration: 0.55, ease: 'power2.out' }, at);
        tl.to(frame, { opacity: 0, duration: 0.45 }, at + 0.45 + hold);
      });

      tl.fromTo('.k-carve', { opacity: 0 }, { opacity: 1, duration: 0.6 }, 20);
      tl.fromTo('.k-carve .k-rise', { y: 30 }, { y: 0, duration: 0.8, ease: 'power2.out' }, 20);
      tl.to({}, { duration: 1.8 }, 20.6);
    }, containerRef);
    return () => ctx.revert();
  }, [reduced]);

  const complete = () => {
    if (carved || refracting) return;
    if (!beginDissolve('stone-paper', unlockNextAct)) return;
    setRefracting(true);
    window.setTimeout(() => setRefracting(false), 3600);
  };

  const frameBase = reduced
    ? 'k-frame relative w-full flex items-center justify-center py-16'
    : 'k-frame absolute inset-0 flex items-center justify-center opacity-0 pointer-events-none';

  const bridge = structureById.bridge;
  const well = structureById.well;
  const gate = structureById.gate;
  const orchard = structureById.orchard;

  return (
    <TorchContext.Provider value={torch}>
      <section
        ref={containerRef}
        id="act-kingdom"
        data-testid="act-kingdom"
        data-reduced-motion={reduced || undefined}
        data-torch={torchMode}
        className={`k-act w-full relative font-[family-name:var(--world-font)] ${
          reduced ? 'min-h-screen overflow-visible' : 'h-screen overflow-hidden'
        }`}
        style={reduced ? { backgroundImage: `linear-gradient(rgba(20,17,14,.42), rgba(20,17,14,.72)), url(${posterUrl('kingdom_travel')})`, backgroundSize: 'cover', backgroundPosition: 'center', backgroundAttachment: 'fixed' } : undefined}
      >
        {!reduced && <FramePlate ref={plateRef} name="kingdom_travel" count={96} className="absolute inset-0 h-full w-full" />}
        <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden="true">
          <div className="k-video-vignette" data-testid="plate-wall">
            <span data-testid="plate-strata" />
            <span data-testid="plate-rubble" />
            <span data-testid="kingdom-dust" />
          </div>
          <div className="k-torch-dark" data-testid="torch-dark" />
        </div>

        <div className={`relative z-10 w-full ${reduced ? 'max-w-6xl mx-auto py-24 flex flex-col gap-16' : 'h-full'}`}>
          <div
            className={`k-title ${reduced ? 'relative py-12' : 'absolute inset-0'} flex flex-col items-center justify-center text-center pointer-events-none px-6`}
          >
            <p className="k-carved-light text-[11px] uppercase tracking-[0.45em] mb-6" style={{ opacity: 0.55 }}>
              World {world.number}
            </p>
            <h2 className="k-inscription text-4xl md:text-6xl font-normal tracking-[0.12em] uppercase" data-testid="text-world-title" style={{ color: '#d9cfbf', textShadow: '0 2px 0 rgba(0,0,0,0.8), 0 0 40px rgba(0,0,0,0.6)' }}>
              {world.title}
            </h2>
            <p className="mt-8 max-w-md font-[family-name:var(--app-font-serif)] italic text-lg md:text-xl" style={{ opacity: 0.7 }}>
              The four were built here, and used, and written down.
            </p>
            {!reduced && (
              <p className="mt-10 text-[11px] uppercase tracking-[0.35em]" style={{ opacity: 0.4 }}>
                {touch ? 'Descend' : 'Carry the light. Descend.'}
              </p>
            )}
          </div>

          <div className={`${frameBase} k-structure`}>
            <div className="k-rise w-full">
              <StoneBridge structure={bridge} reduced={reduced} />
            </div>
          </div>
          <div className={`${frameBase} k-structure`}>
            <div className="k-rise w-full">
              <StoneWell structure={well} reduced={reduced} />
            </div>
          </div>
          <div className={`${frameBase} k-structure`}>
            <div className="k-rise w-full">
              <StoneGates structure={gate} reduced={reduced} />
            </div>
          </div>
          <div className={`${frameBase} k-structure`}>
            <div className="k-rise w-full">
              <SideHalls discoveries={halls} reduced={reduced} />
            </div>
          </div>
          <div className={`${frameBase} k-structure`}>
            <div className="k-rise w-full">
              <StoneOrchard structure={orchard} reduced={reduced} />
            </div>
          </div>

          {/* the way out */}
          <div className={`${frameBase} k-carve px-6`} data-testid="kingdom-gate">
            <div
              className={`k-rise w-full max-w-2xl flex flex-col items-center text-center px-6 py-8 ${refracting ? 'k-refracting' : ''}`}
              style={{ background: 'radial-gradient(ellipse at center, rgba(12,9,6,.86) 0%, rgba(12,9,6,.7) 55%, rgba(12,9,6,0) 80%)' }}
            >
              <p className="k-carved-light text-[11px] uppercase tracking-[0.4em] mb-4" style={{ opacity: 0.8 }}>
                The unfinished carving
              </p>
              <p className="max-w-md font-[family-name:var(--app-font-serif)] italic text-base md:text-lg mb-8" style={{ opacity: 0.92 }}>
                {carved
                  ? 'The last stroke is cut. The stone is not stone any more.'
                  : reduced
                    ? 'One groove was never finished. Finish it.'
                    : touch
                      ? 'One groove was never finished. Drag the chisel to the end of it.'
                      : 'One groove was never finished. Pick up the chisel and drag it to the end.'}
              </p>
              <div className="relative w-full max-w-2xl mx-auto mt-4">
                 <Parchment className="p-8 md:p-14 flex items-center justify-center min-h-[16rem]" imgStyle={{ transform: 'rotate(-1deg)' }}>
                  <div className="relative z-10 w-full h-full max-w-xl mx-auto">
                    <UnfinishedCarving interactive={!carved} reduced={reduced} onComplete={complete} completed={carved} />
                  </div>
                </Parchment>
                <div className="k-refract" aria-hidden="true" />
              </div>
              {carved ? (
                <p className="mt-8 text-sm italic" style={{ opacity: 0.6 }} aria-live="polite">
                  The way is open. Scroll down.
                </p>
              ) : (
                <button
                  type="button"
                  onClick={complete}
                  className="mt-8 k-carved-light text-[11px] uppercase tracking-[0.3em] px-4 py-2 border border-[rgba(201,163,90,0.3)] hover:border-[rgba(201,163,90,0.8)] focus-visible:border-[rgba(201,163,90,0.9)] outline-none transition-colors duration-500"
                  data-testid="button-complete-carving"
                >
                  {reduced ? world.transitionLabel : 'or finish the stroke without the chisel'}
                </button>
              )}
            </div>
          </div>
        </div>

        <div className="k-torch-warm absolute inset-0 z-20" aria-hidden="true" data-testid="torch-warm" />
      </section>
    </TorchContext.Provider>
  );
}

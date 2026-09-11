import { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import ScrollTrigger from 'gsap/ScrollTrigger';
import { structures, worlds } from '@/content';
import { getDoorway } from '@/content/doorways';
import { useVisitor } from '@/store/VisitorContext';
import { prefersReducedMotion } from '@/lib/scroll';
import { beginDissolve } from '@/lib/dissolve';
import { DoorwayGlyph } from '@/components/DoorwayGlyph';
import { posterUrl } from '@/components/FramePlate';
import { ScrollVideoPlate, type ScrollVideoPlateHandle } from '@/components/ScrollVideoPlate';
import { ENVIRONMENT_MEDIA } from '@/content/environment-media';
import { UnwrittenStructure } from './UnwrittenStructure';
import './unwritten.css';

const world = worlds.find((w) => w.id === 'unwritten')!;

const FOG_BASE = '#D9D2C6';

/** Source imagery retained for the reduced-motion poster fallback. */
const PLATE = ENVIRONMENT_MEDIA.unwritten.name;
const VIDEO = ENVIRONMENT_MEDIA.unwritten.video;
/** Footage length in seconds; the timeline runs in the same units. */
const FOOTAGE = ENVIRONMENT_MEDIA.unwritten.duration;
/** The camera rests at the foot of the gate; the bright crossing belongs to the dissolve. */
const JOURNEY = 22.2;
/** [appear, fade] per structure, aligned to 0.6 s crossfaded six-second shots. */
const BEATS = {
  orchard: [1.0, 5.0],
  bridge: [5.8, 10.4],
  well: [11.0, 15.8],
  gate: [16.4, 21.7],
} as const;
const DECIDE_AT = 21.8;

/**
 * Act 1. The Unwritten: fog, and four things that exist only as intent.
 * The visitor scrolls and each structure condenses out of the fog; at the end
 * they decide the doorway they chose, and the fog settles into stone.
 */
export function UnwrittenAct() {
  const containerRef = useRef<HTMLElement>(null);
  const plateRef = useRef<ScrollVideoPlateHandle>(null);
  const { setActiveAct, recordEntry, unlockNextAct, unlockedActs, chosenDoorway } = useVisitor();
  const [reduced] = useState(prefersReducedMotion);
  const [condensing, setCondensing] = useState(false);
  const [plateBuffered, setPlateBuffered] = useState(reduced);
  const decided = unlockedActs.indexOf('unwritten') < unlockedActs.length - 1;
  const doorway = getDoorway(chosenDoorway);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setActiveAct('unwritten');
          recordEntry('unwritten');
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
      const frames = gsap.utils.toArray<HTMLElement>('.uw-frame');
      const syncInert = () => {
        frames.forEach((frame) => {
          const visible = Number(gsap.getProperty(frame, 'opacity')) > 0.5;
          // Visibility, hit-testing and focusability all follow the same rule.
          frame.style.pointerEvents = visible ? 'auto' : 'none';
          if (visible) frame.removeAttribute('inert');
          else frame.setAttribute('inert', '');
        });
      };

      const tl = gsap.timeline({
        // With scrub smoothing the timeline keeps moving after the last scroll event;
        // only its own onUpdate sees the final opacities, so inert is synced there too.
        onUpdate: syncInert,
        scrollTrigger: {
          trigger: containerRef.current,
          start: 'top top',
          end: '+=1000%',
          pin: true,
          scrub: 1,
          onUpdate: syncInert,
          onRefresh: syncInert,
        },
      });
      syncInert();

      // Four regenerated high-bitrate shots (orchard → bridge → well → gatehouse)
      // are crossfaded into one 22.2 s plate. One timeline unit ≈ one footage second.
      const cam = { p: 0 };
      tl.to(cam, {
        p: JOURNEY / FOOTAGE,
        duration: JOURNEY,
        ease: 'none',
        onUpdate: () => plateRef.current?.setProgress(cam.p),
      }, 0);
      tl.to('.uw-title', { opacity: 0, filter: 'blur(8px)', y: -16, duration: 0.6 }, 1.2);

      gsap.utils.toArray<HTMLElement>('.uw-structure').forEach((frame) => {
        const beat = BEATS[frame.dataset.structure as keyof typeof BEATS];
        if (!beat) return;
        const [at, until] = beat;
        tl.fromTo(frame, { opacity: 0 }, { opacity: 1, duration: 0.5 }, at);
        tl.fromTo(
          frame.querySelector('.uw-condense'),
          { filter: 'blur(10px)', scale: 1.015 },
          { filter: 'blur(0px)', scale: 1, duration: 0.7, ease: 'power1.out' },
          at,
        );
        tl.fromTo(
          frame.querySelectorAll('.uw-word'),
          { opacity: 0, y: 5 },
          { opacity: 1, y: 0, duration: 0.4, stagger: 0.05, ease: 'power1.out' },
          at + 0.25,
        );
        tl.to(frame, { opacity: 0, duration: 0.5 }, until);
      });

      // The decision arrives at the foot of the portal, before the light takes over.
      tl.fromTo('.uw-decide', { opacity: 0 }, { opacity: 1, duration: 0.6 }, DECIDE_AT);
      tl.fromTo(
        '.uw-decide .uw-condense',
        { filter: 'blur(10px)', opacity: 0.3 },
        { filter: 'blur(0px)', opacity: 1, duration: 0.8 },
        DECIDE_AT,
      );
      tl.to({}, { duration: 2 }, JOURNEY);
    }, containerRef);

    return () => ctx.revert();
  }, [reduced]);

  const decide = () => {
    if (decided || condensing) return;
    if (!beginDissolve('fog-stone', unlockNextAct)) return;
    setCondensing(true);
  };

  const frameBase = reduced
    ? 'uw-frame relative w-full flex items-center justify-center py-16'
    : 'uw-frame absolute inset-0 flex items-center justify-center opacity-0 pointer-events-none';

  return (
    <section
      ref={containerRef}
      id="act-unwritten"
      data-testid="act-unwritten"
      data-reduced-motion={reduced || undefined}
      className={`w-full relative font-[family-name:var(--world-font)] ${
        reduced ? 'min-h-screen overflow-visible' : 'h-screen overflow-hidden'
      }`}
      style={{
        color: '#2A2724',
        backgroundColor: FOG_BASE,
        backgroundImage: reduced ? `url(${posterUrl(PLATE)})` : undefined,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }}
    >
      {!reduced && (
        <ScrollVideoPlate
          ref={plateRef}
          src={`${import.meta.env.BASE_URL}media/${VIDEO}`}
          poster={posterUrl(PLATE)}
          duration={FOOTAGE}
          className="absolute inset-0 h-full w-full"
          onBuffered={() => setPlateBuffered(true)}
        />
      )}
      <div className="absolute inset-0 pointer-events-none bg-gradient-to-b from-[#F4F1EA]/10 via-transparent to-[#F4F1EA]/15" />
      {!plateBuffered && (
        <div
          className="uw-frame-loader absolute inset-0 z-30 flex flex-col items-center justify-center text-center px-6"
          role="status"
          aria-live="polite"
          onWheel={(event) => event.preventDefault()}
        >
          <div className="uw-paper uw-blueprint-grid max-w-sm px-8 py-7">
            <p className="font-mono text-[10px] uppercase tracking-[0.32em] text-[#5A5C5B]">Preparing the field</p>
            <div className="mt-4 h-px w-full bg-[#2A2724]/15 overflow-hidden">
              <div className="uw-frame-loader-line h-full bg-[#2A2724]/45" />
            </div>
          </div>
        </div>
      )}

      <div className={`relative w-full ${reduced ? 'max-w-5xl mx-auto px-6 py-24 flex flex-col gap-24' : 'h-full'}`}>
        <div
          className={`uw-title ${
            reduced ? 'relative py-12' : 'absolute inset-0'
          } flex flex-col items-center justify-center text-center pointer-events-none px-6 z-10`}
        >
          <div className="uw-paper uw-blueprint-grid p-10 md:p-16 max-w-3xl pointer-events-auto" style={{ transform: 'rotate(-1deg)' }}>
            <div className="uw-tape w-24 h-8 -top-4 left-1/2 -translate-x-1/2 -rotate-1" />
            <div className="uw-pin" />

            <p className="font-mono text-[11px] uppercase tracking-[0.45em] mb-6 text-[#5A5C5B]">
              World {world.number}
            </p>
            <h2 className="text-5xl md:text-7xl lg:text-8xl font-light tracking-tight font-[family-name:var(--app-font-serif)] text-[#1A1C1B]" data-testid="text-world-title">
              {world.title}
            </h2>
            <div className="mt-10 pt-8 border-t border-[#2A2724]/10 relative">
              <div className="absolute left-1/2 -top-1 -translate-x-1/2 w-2 h-2 rounded-full border border-[#2A2724]/30 bg-[#F4F1EA]" />
              <p className="font-[family-name:var(--app-font-hand)] text-2xl md:text-3xl text-[#3A3C3B] rotate-1">
                Four real builds, before they had names.
              </p>
              <p className="mt-5 font-mono text-[10px] uppercase tracking-[0.22em] text-[#5A5C5B]">
                AI products · developer tools · applied systems
              </p>
            </div>
          </div>
        </div>

        {structures.map((s) => (
          <div key={s.id} className={`${frameBase} uw-structure px-6 md:px-12 xl:px-20 z-20`} data-structure={s.id}>
            <div className="uw-condense w-full max-w-none will-change-[filter,opacity,transform]">
              <UnwrittenStructure structure={s} reduced={reduced} />
            </div>
          </div>
        ))}

        <div className={`${frameBase} uw-decide px-6 z-10`}>
          <div
            className="uw-condense w-full max-w-2xl flex flex-col items-center text-center px-10 py-16 uw-paper uw-blueprint-grid"
            style={{ transform: 'rotate(0.5deg)' }}
          >
            <div className="uw-tape w-16 h-6 -top-3 left-1/4 -rotate-3" />
            <div className="uw-tape w-16 h-6 -top-3 right-1/4 rotate-2" />

            <p className="font-mono text-[11px] uppercase tracking-[0.4em] mb-10 text-[#5A5C5B]">
              The doorway
            </p>
            {doorway && (
              <div
                className="w-24 h-[8.5rem] md:w-28 md:h-40 mb-12 mix-blend-multiply opacity-90"
                data-testid={`glyph-chosen-doorway-${doorway.id}`}
              >
                <DoorwayGlyph doorway={doorway} className="w-full h-full" />
              </div>
            )}
            <p className="font-[family-name:var(--app-font-serif)] text-2xl md:text-3xl leading-relaxed max-w-lg text-[#1A1C1B]" data-testid="text-decide-copy">
              {doorway ? `You chose ${doorway.name.toLowerCase()}. ` : ''}
              Nothing here is built yet. Decide, and the fog will settle into something you can touch.
            </p>

            {decided ? (
              <p className="mt-12 font-mono text-xs uppercase tracking-widest text-[#5A5C5B]" aria-live="polite" data-testid="text-decided">
                The way is open. Scroll down.
              </p>
            ) : (
              <button
                type="button"
                onClick={decide}
                disabled={condensing}
                data-testid="button-decide-doorway"
                className="mt-12 px-10 py-4 border border-[#2A2724] font-mono text-[11px] uppercase tracking-[0.3em] text-[#1A1C1B] transition-all duration-500 hover:bg-[#2A2724] hover:text-[#F4F1EA] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-current focus-visible:ring-offset-4 focus-visible:ring-offset-[#F4F1EA] disabled:opacity-40"
              >
                {world.transitionLabel}
              </button>
            )}
          </div>
        </div>
      </div>

    </section>
  );
}

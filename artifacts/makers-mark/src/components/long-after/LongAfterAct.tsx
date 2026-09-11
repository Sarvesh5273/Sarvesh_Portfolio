import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import gsap from 'gsap';
import ScrollTrigger from 'gsap/ScrollTrigger';
import { structures, worlds } from '@/content';
import { useVisitor } from '@/store/VisitorContext';
import { prefersReducedMotion } from '@/lib/scroll';
import { beginDissolve } from '@/lib/dissolve';
import { FramePlate, posterUrl, type FramePlateHandle } from '@/components/FramePlate';
import { ENVIRONMENT_MEDIA } from '@/content/environment-media';
import { FUTURE_MAT } from './SceneMedia';
import './long-after.css';
import { Lattice } from './Lattice';
import { StillLake } from './StillLake';
import { Rings } from './Rings';
import { Canopy } from './Canopy';
import { FilamentNodes } from './FilamentNodes';
import { FilamentGrab } from './FilamentGrab';

const world = worlds.find((item) => item.id === 'longAfter')!;
type FrameId = 'title' | 'bridge' | 'well' | 'gate' | 'orchard' | 'nodes' | 'grab';

export function LongAfterAct() {
  const containerRef = useRef<HTMLElement>(null);
  const plateRef = useRef<FramePlateHandle>(null);
  const reducedBgRef = useRef<HTMLDivElement>(null);
  const { setActiveAct, recordEntry, unlockNextAct, unlockedActs } = useVisitor();
  const [reduced] = useState(prefersReducedMotion);
  const [activeFrame, setActiveFrame] = useState<FrameId>('title');
  const [falling, setFalling] = useState(false);
  const grabbed = unlockedActs.indexOf('longAfter') < unlockedActs.length - 1;
  const byId = useMemo(() => Object.fromEntries(structures.map((structure) => [structure.id, structure])), []);

  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        setActiveAct('longAfter');
        recordEntry('longAfter');
      }
    }, { rootMargin: '-50% 0px -50% 0px', threshold: 0 });
    if (containerRef.current) observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, [setActiveAct, recordEntry]);

  useEffect(() => {
    if (reduced) return;
    const ctx = gsap.context(() => {
      const frames = gsap.utils.toArray<HTMLElement>('.la-frame');
      let current: FrameId | null = null;
      const syncInert = () => {
        let visibleId: FrameId | null = null;
        frames.forEach((frame) => {
          const visible = Number(gsap.getProperty(frame, 'opacity')) > 0.5;
          frame.style.pointerEvents = visible ? 'auto' : 'none';
          if (visible) {
            frame.removeAttribute('inert');
            visibleId = frame.dataset.frame as FrameId;
          } else {
            frame.setAttribute('inert', '');
          }
        });
        if (visibleId && visibleId !== current) {
          current = visibleId;
          setActiveFrame(visibleId);
        }
      };

      const camera = { p: 0 };
      const footageDuration = ENVIRONMENT_MEDIA.longAfter.duration;
      const timeline = gsap.timeline({
        onUpdate: syncInert,
        scrollTrigger: {
          trigger: containerRef.current,
          start: 'top top',
          end: '+=900%',
          pin: true,
          scrub: 1,
          onUpdate: syncInert,
          onRefresh: syncInert,
        },
      });

      timeline.to(camera, {
        p: 1,
        duration: footageDuration,
        ease: 'none',
        onUpdate: () => plateRef.current?.setProgress(camera.p),
      }, 0);
      timeline.to('.la-title', { opacity: 0, duration: 0.55 }, 0.5);

      const show = (selector: string, start: number, end: number) => {
        timeline.fromTo(selector, { opacity: 0, y: 16 }, { opacity: 1, y: 0, duration: 0.55, ease: 'power1.out' }, start);
        timeline.to(selector, { opacity: 1, duration: Math.max(0, end - start - 1.1), ease: 'none' }, start + 0.55);
        timeline.to(selector, { opacity: 0, y: -12, duration: 0.55, ease: 'power1.in' }, end - 0.55);
      };

      // Plate mapping: Bridge 0–5.4, Well 5.4–10.8, Gate 10.8–16.2, Orchard 16.2–22.2
      // Each crossfades 0.6 seconds according to prompt, so scenes can start a bit earlier or fade out later.
      show('[data-frame="bridge"]', 0.5, 5.0);
      show('[data-frame="well"]', 5.6, 10.4);
      show('[data-frame="gate"]', 11.0, 15.8);
      show('[data-frame="orchard"]', 16.4, 21.8);
      show('[data-frame="nodes"]', 22.0, 26.0);
      timeline.fromTo('[data-frame="grab"]', { opacity: 0, y: 14 }, { opacity: 1, y: 0, duration: 0.6 }, 25.5);
      timeline.to({}, { duration: 2 }, 26.1);
      syncInert();
    }, containerRef);
    return () => ctx.revert();
  }, [reduced]);

  useEffect(() => {
    if (!reduced) return;
    const clip = () => {
      const background = reducedBgRef.current;
      const rect = containerRef.current?.getBoundingClientRect();
      if (!background || !rect) return;
      const vh = window.innerHeight;
      background.style.visibility = rect.bottom <= 0 || rect.top >= vh ? 'hidden' : 'visible';
      background.style.clipPath = `inset(${Math.max(0, rect.top)}px 0 ${Math.max(0, vh - rect.bottom)}px 0)`;
    };
    clip();
    window.addEventListener('scroll', clip, { passive: true });
    window.addEventListener('resize', clip);
    return () => {
      window.removeEventListener('scroll', clip);
      window.removeEventListener('resize', clip);
    };
  }, [reduced]);

  const grab = useCallback(() => {
    if (grabbed || falling) return;
    if (reduced) {
      unlockNextAct();
      return;
    }
    if (!beginDissolve('glass-paper', unlockNextAct)) return;
    setFalling(true);
    window.setTimeout(() => setFalling(false), 4000);
  }, [grabbed, falling, reduced, unlockNextAct]);

  const frameBase = reduced
    ? 'la-frame relative w-full flex items-center justify-center py-10'
    : 'la-frame absolute inset-0 flex items-center justify-center opacity-0 pointer-events-none';
  const isActive = (id: FrameId) => reduced || activeFrame === id;

  return (
    <section
      ref={containerRef}
      id="act-longAfter"
      data-testid="act-longAfter"
      data-reduced-motion={reduced || undefined}
      data-active-frame={activeFrame}
      className={`relative w-full font-[family-name:var(--world-font)] ${reduced ? 'min-h-screen overflow-visible' : 'h-screen overflow-hidden'}`}
      style={{ color: FUTURE_MAT.ceramic, backgroundColor: FUTURE_MAT.bg }}
    >
      {reduced ? (
        <div
          ref={reducedBgRef}
          className="pointer-events-none fixed inset-0 bg-cover bg-center"
          style={{ backgroundImage: `linear-gradient(rgba(3,5,7,.6), rgba(3,5,7,.8)), url(${posterUrl(ENVIRONMENT_MEDIA.longAfter.name)})` }}
          aria-hidden="true"
        />
      ) : (
        <FramePlate ref={plateRef} name={ENVIRONMENT_MEDIA.longAfter.name} count={ENVIRONMENT_MEDIA.longAfter.count} className="absolute inset-0 h-full w-full" />
      )}
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(90deg,rgba(3,5,7,.6),transparent_25%,transparent_75%,rgba(3,5,7,.6))]" aria-hidden="true" />

      <div className={`relative w-full ${reduced ? 'mx-auto flex max-w-6xl flex-col gap-10 px-5 py-24' : 'h-full'}`}>
        <div className={`la-title la-frame ${reduced ? 'relative py-12' : 'absolute inset-0'} flex flex-col items-center justify-center px-6 text-center pointer-events-none`} data-frame="title">
          <p className="la-sub mb-6 text-[11px]">World {world.number}</p>
          <h2 className="la-heading text-4xl md:text-7xl" data-testid="text-world-title">{world.title}</h2>
          <p className="mt-8 max-w-md text-sm leading-relaxed md:text-base la-text-ceramic" style={{ textShadow: '0 2px 12px #10272d' }}>What was built, at the scale of what it did. A civilization beyond the horizon. Follow the lights.</p>
        </div>
        <div className={`${frameBase} px-4`} data-frame="bridge"><div className="w-full max-w-6xl"><Lattice structure={byId.bridge} reduced={reduced} active={isActive('bridge')} /></div></div>
        <div className={`${frameBase} px-4`} data-frame="well"><div className="w-full max-w-6xl"><StillLake structure={byId.well} reduced={reduced} active={isActive('well')} /></div></div>
        <div className={`${frameBase} px-4`} data-frame="gate"><div className="w-full max-w-6xl"><Rings structure={byId.gate} reduced={reduced} active={isActive('gate')} /></div></div>
        <div className={`${frameBase} px-4`} data-frame="orchard"><div className="w-full max-w-6xl"><Canopy structure={byId.orchard} reduced={reduced} /></div></div>
        <div className={`${frameBase} px-4`} data-frame="nodes"><div className="w-full max-w-5xl"><FilamentNodes reduced={reduced} /></div></div>
        <div className={`${frameBase} px-6`} data-frame="grab">
          <div className="w-full max-w-2xl p-7 text-center md:p-10" style={{ background: 'linear-gradient(180deg, rgba(3,5,7,0.8), rgba(3,5,7,0.95))', border: '1px solid rgba(162,172,184,0.15)', backdropFilter: 'blur(4px)' }}>
            <p className="la-sub mb-8 text-[11px]">The way out</p>
            <p className="la-text-ceramic mx-auto mb-10 max-w-md text-base leading-relaxed md:text-lg" data-testid="text-grab-copy">One filament here is yours. Everything in this world is what the work became; the line in your hand is where you came in. Take hold of it, and follow the light back to where it began.</p>
            <FilamentGrab label={world.transitionLabel} done={grabbed} disabled={falling} reduced={reduced} onGrabbed={grab} />
          </div>
        </div>
      </div>
    </section>
  );
}
import { useCallback, useEffect, useRef, useState, type ReactNode } from 'react';
import gsap from 'gsap';
import ScrollTrigger from 'gsap/ScrollTrigger';
import { structureById, worlds } from '@/content';
import type { StructureId } from '@/content/types';
import { FramePlate, posterUrl, type FramePlateHandle } from '@/components/FramePlate';
import { prefersReducedMotion, scrollToElement } from '@/lib/scroll';
import { useVisitor } from '@/store/VisitorContext';
import { ENVIRONMENT_MEDIA } from '@/content/environment-media';
import { RoomCard, type RoomCardRef } from './RoomCard';
import { LaptopScreen, PhoneScreen } from './Screens';
import { StickyGate } from './StickyGate';
import { Whiteboard } from './Whiteboard';
import './present-room.css';

gsap.registerPlugin(ScrollTrigger);

const world = worlds.find((w) => w.id === 'presentRoom')!;

const BEATS: {
  id: StructureId;
  gesture: string;
  label: string;
  hotspot: React.CSSProperties;
  side: 'left' | 'right';
}[] = [
  { id: 'orchard', gesture: 'open', label: 'A laptop: open the ReelSense record', hotspot: { left: '60%', top: '22%', width: '33%', height: '42%' }, side: 'left' },
  { id: 'bridge', gesture: 'pick up', label: 'A phone beside a handwritten ledger: Recall AI', hotspot: { left: '24%', top: '55%', width: '24%', height: '20%' }, side: 'right' },
  { id: 'well', gesture: 'read the board', label: 'The whiteboard, dated today: Cognitive AI Companion, research, ongoing', hotspot: { left: '51%', top: '19%', width: '33%', height: '40%' }, side: 'left' },
  { id: 'gate', gesture: 'pick up', label: 'A shelf with an Auth0 lanyard, a GhostWire diagram, a TRACE still, and a sticky note', hotspot: { left: '82%', top: '19%', width: '14%', height: '45%' }, side: 'left' },
];

export function PresentRoomAct() {
  const ref = useRef<HTMLElement>(null);
  const plateRef = useRef<FramePlateHandle>(null);
  const { setActiveAct, recordEntry, visitDiscovery, unlockNextAct, unlockedActs } = useVisitor();
  const [reduced] = useState(prefersReducedMotion);
  const [card, setCard] = useState<RoomCardRef | null>(null);
  const [pageTurning, setPageTurning] = useState(false);
  const codaOpen = unlockedActs.includes('coda');

  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        setActiveAct('presentRoom');
        recordEntry('presentRoom');
      }
    }, { rootMargin: '-50% 0px -50% 0px', threshold: 0 });
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [setActiveAct, recordEntry]);

  useEffect(() => {
    if (reduced) return;
    const ctx = gsap.context(() => {
      const frames = gsap.utils.toArray<HTMLElement>('.pr-frame');
      const syncInert = () => {
        frames.forEach((frame) => {
          const visible = Number(gsap.getProperty(frame, 'opacity')) > 0.5;
          frame.style.pointerEvents = visible ? 'auto' : 'none';
          if (visible) frame.removeAttribute('inert');
          else frame.setAttribute('inert', '');
        });
      };
      const cam = { p: 0 };
      const duration = ENVIRONMENT_MEDIA.presentRoom.duration;
      const tl = gsap.timeline({
        onUpdate: syncInert,
        scrollTrigger: {
          trigger: ref.current,
          start: 'top top',
          end: '+=850%',
          pin: true,
          scrub: 1,
          onUpdate: syncInert,
          onRefresh: syncInert,
        },
      });
      tl.to(cam, { p: 1, duration, ease: 'none', onUpdate: () => plateRef.current?.setProgress(cam.p) }, 0);
      tl.fromTo('.pr-title-frame', { opacity: 1 }, { opacity: 0, duration: 0.3 }, 0.35);
      // laptop 0-2, phone 2-4, whiteboard 4-6, shelves 6-8
      const timings = [
        { start: 0.5, end: 1.8 },
        { start: 2.2, end: 3.8 },
        { start: 4.2, end: 5.8 },
        { start: 6.2, end: 7.8 },
      ];
      frames.filter((frame) => frame.dataset.beat).forEach((frame, index) => {
        const beat = timings[index];
        tl.fromTo(frame, { opacity: 0 }, { opacity: 1, duration: 0.25 }, beat.start);
        tl.to(frame, { opacity: 0, duration: 0.25 }, beat.end - 0.25);
      });
      tl.fromTo('.pr-gate-frame', { opacity: 0 }, { opacity: 1, duration: 0.3 }, 7.8);
      tl.to({}, { duration: 1.7 });
      syncInert();
    }, ref);
    return () => ctx.revert();
  }, [reduced]);

  const open = useCallback((next: RoomCardRef) => {
    setCard(next);
    if (next.kind === 'discovery') visitDiscovery(next.id);
    else visitDiscovery(next.kind === 'drafts' ? 'mark-drafts' : `room-${next.id}`);
  }, [visitDiscovery]);

  const turnPage = useCallback(() => {
    if (codaOpen) {
      scrollToElement('act-coda');
    } else if (reduced) {
      unlockNextAct();
    } else {
      setPageTurning(true);
    }
  }, [codaOpen, reduced, unlockNextAct]);

  const frameClass = reduced ? 'pr-linear-frame' : 'pr-frame';

  return (
    <section
      ref={ref}
      id="act-presentRoom"
      data-testid="act-presentRoom"
      className={`pr-act ${reduced ? 'is-reduced' : ''}`}
      aria-labelledby="present-room-title"
      style={reduced ? { backgroundImage: `linear-gradient(rgba(20,15,10,.28), rgba(20,15,10,.55)), url(${posterUrl(ENVIRONMENT_MEDIA.presentRoom.name)})` } : undefined}
    >
      {!reduced && <FramePlate ref={plateRef} name={ENVIRONMENT_MEDIA.presentRoom.name} count={ENVIRONMENT_MEDIA.presentRoom.count} className="absolute inset-0 h-full w-full" />}
      <div className={`${frameClass} pr-title-frame`}>
        <p>World {world.number}</p>
        <h2 id="present-room-title" data-testid="text-world-title">{world.title}</h2>
      </div>

      {BEATS.map((beat) => (
        <StructureBeat key={beat.id} beat={beat} className={frameClass} open={open} reduced={reduced} />
      ))}

      <div className={`${frameClass} pr-gate-frame`} inert={!reduced ? true : undefined}>
        <div className="pr-final-board"><Whiteboard /></div>
        <div className="pr-final-note">
          <StickyGate done={codaOpen} reduced={reduced} onTurnPage={turnPage} />
        </div>
      </div>

      <RoomCard card={card} onClose={() => setCard(null)} reduced={reduced} />
      {pageTurning && (
        <PageTurn
          onMid={unlockNextAct}
          onDone={() => setPageTurning(false)}
        />
      )}
    </section>
  );
}

function StructureBeat({ beat, className, open, reduced }: {
  beat: (typeof BEATS)[number];
  className: string;
  open: (card: RoomCardRef) => void;
  reduced: boolean;
}) {
  const structure = structureById[beat.id];
  const room = structure.presentRoom;
  return (
    <article className={`${className} pr-beat pr-beat-${beat.side}`} data-beat={beat.id} inert={!reduced ? true : undefined}>
      <div className="pr-copy">
        <p className="pr-eyebrow">The story called it {structure.storyName}{room.unfinished ? ' — still unfinished' : ''}</p>
        <h3>{room.name}</h3>
        <p>{room.description}</p>
        <p className="pr-object-line">{room.object}</p>
        <p className="pr-eyebrow mt-4">In the room: {beat.gesture} it, then read what it carries.</p>
        <ProofObjects id={beat.id} proof={room.proof} />
        <button type="button" className="pr-open-card" onClick={() => open({ kind: 'structure', id: beat.id })}>
          Read the record
        </button>
        {beat.id === 'orchard' && (
          <div className="pr-screen-wrap"><LaptopScreen onOpenTab={() => open({ kind: 'discovery', id: 'paperpilot' })} /></div>
        )}
        {beat.id === 'bridge' && <div className="pr-phone-wrap"><PhoneScreen /></div>}
        {beat.id === 'well' && <Whiteboard />}
        {beat.id === 'gate' && (
          <div className="pr-minor-links">
            <button data-testid="hotspot-perplexity" onClick={() => open({ kind: 'discovery', id: 'perplexity' })}><span data-testid="prop-perplexity">Perplexity Campus Partner</span></button>
            <button data-testid="hotspot-mark-drafts" onClick={() => open({ kind: 'drafts' })}><span data-testid="prop-mark-drafts">The mark, four drafts</span></button>
          </div>
        )}
        {beat.id === 'orchard' && (
          <div className="pr-minor-links">
            <button data-testid="hotspot-reelgap" onClick={() => open({ kind: 'discovery', id: 'reelgap' })}><span data-testid="prop-reelgap">ReelGap</span></button>
            <button data-testid="hotspot-stargap" onClick={() => open({ kind: 'discovery', id: 'stargap' })}><span data-testid="prop-stargap">StarGap</span></button>
          </div>
        )}
      </div>
      <Hotspot label={beat.label} gesture={beat.gesture} style={beat.hotspot} testId={`hotspot-${beat.id === 'bridge' ? 'phone' : beat.id === 'well' ? 'whiteboard' : beat.id === 'gate' ? 'shelf' : 'laptop'}`} onOpen={() => open({ kind: 'structure', id: beat.id })} />
    </article>
  );
}

function ProofObjects({ id, proof }: { id: StructureId; proof: string[] }) {
  const testIds: Partial<Record<StructureId, (string | undefined)[]>> = {
    bridge: ['prop-imagine-cup', 'prop-cost-curve', 'prop-sai-store-photo'],
    gate: [undefined, 'prop-ghostwire', 'prop-trace'],
    orchard: [undefined, 'prop-movielens'],
  };
  return (
    <ul className="pr-proof">
      {proof.map((line, index) => (
        <li key={line} data-testid={testIds[id]?.[index]}>{line}</li>
      ))}
    </ul>
  );
}

function Hotspot({ label, gesture, style, testId, onOpen }: {
  label: string;
  gesture: string;
  style: React.CSSProperties;
  testId: string;
  onOpen: () => void;
}) {
  return (
    <button type="button" className="pr-plate-hotspot" style={style} aria-label={label} onClick={onOpen} data-testid={testId}>
      <span>{gesture}</span>
    </button>
  );
}

function PageTurn({ onMid, onDone }: { onMid: () => void; onDone: () => void }) {
  const fired = useRef(false);
  const finishing = useRef(false);
  const [fading, setFading] = useState(false);
  const finish = useCallback(() => {
    if (finishing.current) return;
    finishing.current = true;
    if (!fired.current) {
      fired.current = true;
      onMid();
    }
    setFading(true);
    doneTimer.current = window.setTimeout(onDone, 650);
  }, [onMid, onDone]);

  const videoRef = useRef<HTMLVideoElement>(null);
  const doneTimer = useRef(0);

  useEffect(() => {
    const safety = window.setTimeout(finish, 12000);
    // Ask to play explicitly: a refused autoplay must fail fast, not strand the visitor.
    const video = videoRef.current;
    const attempt = video?.play();
    if (attempt && typeof attempt.catch === 'function') attempt.catch(finish);
    return () => {
      window.clearTimeout(safety);
      window.clearTimeout(doneTimer.current);
    };
  }, [finish]);

  return (
    <div
      className={`pr-page-turn ${fading ? 'is-fading' : ''}`}
      data-testid="overlay-present-to-coda"
      role="dialog"
      aria-modal="true"
      aria-label="Turning the page"
      tabIndex={-1}
      ref={(el) => el?.focus()}
    >
      <video
        ref={videoRef}
        muted
        playsInline
        preload="auto"
        disablePictureInPicture
        src={`${import.meta.env.BASE_URL}media/present_to_coda.mp4`}
        onTimeUpdate={(event) => {
          const video = event.currentTarget;
          if (!fired.current && video.duration && video.currentTime / video.duration >= 0.6) {
            fired.current = true;
            onMid();
          }
        }}
        onEnded={finish}
        onError={finish}
      />
    </div>
  );
}
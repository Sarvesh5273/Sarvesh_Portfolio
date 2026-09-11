import { useEffect, useRef, useState } from 'react';
import { useVisitor } from '@/store/VisitorContext';
import {
  prefersReducedMotion,
  refreshScrollAfterLayout,
  scrollToElement,
  setScrollLocked,
  waitForElement,
} from '@/lib/scroll';
import './prologue.css';

const MEDIA = `${import.meta.env.BASE_URL}media/`;

/**
 * Act 0. One visible, physical entrance. The door is real footage; the controls
 * are conventional HTML so the invitation is clear on every device.
 */
export function Prologue({ isUnlocked }: { isUnlocked: boolean }) {
  const { setDoorway, unlockNextAct, setActiveAct, recordEntry } = useVisitor();
  const ref = useRef<HTMLElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const arrivedRef = useRef(false);
  const worldRevealedRef = useRef(isUnlocked);
  const allowHandoffRef = useRef(false);
  const [reduced] = useState(prefersReducedMotion);
  const [passing, setPassing] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setActiveAct('prologue');
          recordEntry('prologue');
        }
      },
      { rootMargin: '-50% 0px -50% 0px', threshold: 0 },
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [setActiveAct, recordEntry]);

  useEffect(() => {
    if (!passing) return;
    setScrollLocked(true);
    return () => setScrollLocked(false);
  }, [passing]);

  useEffect(() => {
    if (!passing) return;

    const gateScrollY = window.scrollY;
    const scrollKeys = new Set([' ', 'ArrowDown', 'ArrowUp', 'PageDown', 'PageUp', 'Home', 'End']);
    let restoring = false;

    const blockInput = (event: Event) => {
      if (allowHandoffRef.current) return;
      event.preventDefault();
      event.stopImmediatePropagation();
    };
    const blockScrollKey = (event: KeyboardEvent) => {
      if (allowHandoffRef.current || !scrollKeys.has(event.key)) return;
      event.preventDefault();
      event.stopImmediatePropagation();
    };
    const restoreGatePosition = () => {
      if (allowHandoffRef.current || restoring || Math.abs(window.scrollY - gateScrollY) < 1) return;
      restoring = true;
      window.scrollTo(0, gateScrollY);
      requestAnimationFrame(() => {
        restoring = false;
      });
    };

    window.addEventListener('wheel', blockInput, { capture: true, passive: false });
    window.addEventListener('touchmove', blockInput, { capture: true, passive: false });
    window.addEventListener('keydown', blockScrollKey, true);
    window.addEventListener('scroll', restoreGatePosition, { passive: true });
    return () => {
      window.removeEventListener('wheel', blockInput, true);
      window.removeEventListener('touchmove', blockInput, true);
      window.removeEventListener('keydown', blockScrollKey, true);
      window.removeEventListener('scroll', restoreGatePosition);
    };
  }, [passing]);

  const arrive = async () => {
    if (arrivedRef.current) return;
    arrivedRef.current = true;
    const act = await waitForElement('act-unwritten');
    if (act) {
      await refreshScrollAfterLayout();
      allowHandoffRef.current = true;
      // The door clip itself dissolves into this exact first World 1 frame,
      // so there is no additional full-screen fog or visible page travel.
      scrollToElement('act-unwritten', true);
    }
    // scrollToElement briefly resumes Lenis for its immediate handoff. Release
    // the gate only after that frame has restored the controller state.
    requestAnimationFrame(() => setPassing(false));
  };

  const enter = async () => {
    if (passing) return;
    // The new Prologue offers one entrance, so clear selections made on an
    // earlier four-door version of the experience.
    setDoorway(null);
    setPassing(true);
    arrivedRef.current = false;
    allowHandoffRef.current = false;
    // Mount World 1 while the door video is playing. Its initial frame buffer
    // can warm in the background so the fog reveals a ready scene.
    if (!isUnlocked && !worldRevealedRef.current) {
      worldRevealedRef.current = true;
      unlockNextAct();
    }

    if (reduced) {
      void arrive();
      return;
    }

    const video = videoRef.current;
    if (!video) {
      void arrive();
      return;
    }

    video.currentTime = 0;
    try {
      await video.play();
      // onEnded normally carries the visitor through. This is a safety path
      // for a browser that reports a stalled clip.
      window.setTimeout(() => void arrive(), 6800);
    } catch {
      void arrive();
    }
  };

  return (
    <section
      ref={ref}
      id="act-prologue"
      data-testid="act-prologue"
      className={`pr-door min-h-screen relative overflow-hidden flex items-end justify-center px-6 pb-12 md:pb-16 ${passing ? 'pr-door-passing' : ''}`}
    >
      <h1 className="sr-only">The Maker&apos;s Mark</h1>
      <video
        ref={videoRef}
        className="absolute inset-0 h-full w-full object-cover"
        poster={`${MEDIA}prologue_grand_door_v4_poster.jpg`}
        muted
        playsInline
        preload="auto"
        aria-hidden="true"
        onEnded={() => void arrive()}
      >
        <source src={`${MEDIA}prologue_grand_door_v4.webm`} type="video/webm" />
        <source src={`${MEDIA}prologue_grand_door_v4.mp4`} type="video/mp4" />
      </video>
      <div className="pr-door-shadow absolute inset-0 pointer-events-none" />

      <div className="pr-door-copy relative z-10 w-full max-w-xl text-center text-[#f7eedb]">
        <p className="font-mono text-[10px] md:text-[11px] uppercase tracking-[0.42em] text-[#f2d3a1]/80">
          The Maker&apos;s Mark
        </p>
        <p className="mt-4 font-[family-name:var(--app-font-serif)] text-xl md:text-2xl leading-relaxed text-[#fff8e9]/90">
          Before anything was built, there was a way through.
        </p>
        <button
          type="button"
          data-testid="button-enter-unwritten"
          className="pr-door-enter mt-8 inline-flex items-center justify-center border border-[#f6d69d]/70 px-7 py-3 font-mono text-[10px] uppercase tracking-[0.28em] text-[#fff8e9] transition-colors hover:bg-[#f6d69d]/15 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#f6d69d] disabled:cursor-wait"
          onClick={() => void enter()}
          disabled={passing}
        >
          {passing ? 'The door is opening' : 'Enter the Unwritten'}
        </button>
      </div>
    </section>
  );
}
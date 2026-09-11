import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { endDissolve, setDissolvePhase, useDissolve, type DissolveKind } from '@/lib/dissolve';
import { prefersReducedMotion } from '@/lib/scroll';

/**
 * Each world-to-world crossing is a generated transition shot: one continuous
 * clip that begins in the leaving world's material and ends in the arriving one.
 *   fog-stone   the portal light resolves into the torchlit hall
 *   stone-glass the ancient arch emerges as a future viaduct through daylight
 *   glass-paper the filaments soften into morning light on a wooden desk
 * The midpoint (next act unlocked, page travels) lands where the old material is gone.
 * Under reduced motion the clip is skipped for a plain colour crossfade.
 */
const CLIPS: Record<DissolveKind, { src: string; webm?: boolean; mid: number; poster: string; tail: string }> = {
  'fog-stone': { src: 'unwritten_to_kingdom', mid: 0.4, poster: '#F5EBD6', tail: '#14110e' },
  'stone-glass': { src: 'stone_to_future', webm: true, mid: 0.5, poster: '#14110e', tail: '#10272D' },
  'glass-paper': { src: 'future_to_room', webm: true, mid: 0.55, poster: '#10272D', tail: '#DFCCAE' },
};

const TRAVEL_HOLD = 0.6;

export function MaterialDissolve() {
  const dissolve = useDissolve();
  const ref = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const reduced = prefersReducedMotion();

  const kind = dissolve?.kind ?? null;
  const onMid = dissolve?.onMid;

  useEffect(() => {
    if (!kind || !ref.current || !onMid) return;
    const clip = CLIPS[kind];
    const root = ref.current;
    const video = videoRef.current;
    let cancelled = false;
    let midFired = false;
    let tail: gsap.core.Timeline | null = null;

    const finish = () => {
      if (cancelled) return;
      setDissolvePhase('out');
      tail = gsap.timeline({ onComplete: endDissolve });
      tail.to({}, { duration: TRAVEL_HOLD });
      tail.to(root, { opacity: 0, duration: 1.2, ease: 'power2.out' });
    };

    const fireMid = () => {
      if (midFired) return;
      midFired = true;
      onMid();
    };

    if (reduced || !video) {
      // Plain crossfade: cover, unlock at full cover, thin away.
      const tl = gsap.timeline({ onComplete: endDissolve });
      tl.fromTo(root, { opacity: 0 }, { opacity: 1, duration: 0.6, ease: 'power2.inOut' });
      tl.call(fireMid);
      tl.to({}, { duration: 0.4 });
      tl.call(() => setDissolvePhase('out'));
      tl.to(root, { opacity: 0, duration: 0.6, ease: 'power2.out' });
      return () => {
        cancelled = true;
        tl.kill();
      };
    }

    gsap.set(root, { opacity: 0 });
    const fadeIn = gsap.to(root, { opacity: 1, duration: 0.5, ease: 'power1.out' });

    const onTime = () => {
      if (!video.duration) return;
      if (video.currentTime / video.duration >= clip.mid) fireMid();
    };
    const onEnded = () => {
      fireMid();
      finish();
    };
    // If the clip cannot play (network, autoplay policy), never strand the visitor.
    const safety = window.setTimeout(() => {
      fireMid();
      finish();
    }, 12000);

    video.addEventListener('timeupdate', onTime);
    video.addEventListener('ended', onEnded);
    video.addEventListener('error', onEnded);
    video.currentTime = 0;
    const play = video.play();
    if (play && typeof play.catch === 'function') play.catch(onEnded);

    return () => {
      cancelled = true;
      window.clearTimeout(safety);
      fadeIn.kill();
      tail?.kill();
      video.removeEventListener('timeupdate', onTime);
      video.removeEventListener('ended', onEnded);
      video.removeEventListener('error', onEnded);
      video.pause();
    };
  }, [kind, onMid, reduced]);

  if (!dissolve) return null;
  const clip = CLIPS[dissolve.kind];

  return (
    <div
      ref={ref}
      aria-hidden="true"
      data-testid={`overlay-dissolve-${dissolve.kind}`}
      data-kind={dissolve.kind}
      data-phase={dissolve.phase}
      className="fixed inset-0 z-[60] pointer-events-none"
      style={{ backgroundColor: dissolve.phase === 'out' ? clip.tail : clip.poster }}
    >
      {!reduced && (
        <video
          ref={videoRef}
          className="absolute inset-0 h-full w-full object-cover"
          // A hair of overscan hides the soft frame edges some generations carry.
          style={{ transform: 'scale(1.04)' }}
          muted
          playsInline
          preload="auto"
          disablePictureInPicture
        >
          {clip.webm && <source src={`${import.meta.env.BASE_URL}media/${clip.src}.webm`} type="video/webm" />}
          <source src={`${import.meta.env.BASE_URL}media/${clip.src}.mp4`} type="video/mp4" />
        </video>
      )}
    </div>
  );
}

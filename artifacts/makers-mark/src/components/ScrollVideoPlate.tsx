import { forwardRef, useEffect, useImperativeHandle, useRef } from 'react';

export interface ScrollVideoPlateHandle {
  /** Seek to the normalised position 0..1 across the video. */
  setProgress: (progress: number) => void;
}

interface Props {
  src: string;
  poster?: string;
  duration: number;
  className?: string;
  onReady?: () => void;
  onBuffered?: () => void;
}

/**
 * A scroll-controlled video plate. Unlike an image sequence, a single media
 * stream is buffered and decoded by the browser's video pipeline. Rapid scroll
 * updates collapse into the latest requested seek so they never queue hundreds
 * of decodes behind the visitor's input.
 */
export const ScrollVideoPlate = forwardRef<ScrollVideoPlateHandle, Props>(
  function ScrollVideoPlate({ src, poster, duration, className, onReady, onBuffered }, ref) {
    const videoRef = useRef<HTMLVideoElement>(null);
    const targetTimeRef = useRef(0);
    const seekQueuedRef = useRef(false);
    const readyRef = useRef(false);
    const bufferedRef = useRef(false);
    const callbacksRef = useRef({ onReady, onBuffered });
    callbacksRef.current = { onReady, onBuffered };

    const seekLatest = () => {
      seekQueuedRef.current = false;
      const video = videoRef.current;
      if (!video || video.seeking || video.readyState < HTMLMediaElement.HAVE_METADATA) return;
      const target = targetTimeRef.current;
      if (Math.abs(video.currentTime - target) < 1 / 48) return;
      video.currentTime = target;
    };

    useImperativeHandle(ref, () => ({
      setProgress(progress) {
        const video = videoRef.current;
        const videoDuration =
          video && Number.isFinite(video.duration) && video.duration > 0
            ? video.duration
            : duration;
        targetTimeRef.current = Math.min(videoDuration, Math.max(0, progress) * videoDuration);
        if (!seekQueuedRef.current) {
          seekQueuedRef.current = true;
          requestAnimationFrame(seekLatest);
        }
      },
    }));

    useEffect(() => {
      const video = videoRef.current;
      if (!video) return;

      readyRef.current = false;
      bufferedRef.current = false;

      const reveal = () => {
        if (!readyRef.current) {
          readyRef.current = true;
          callbacksRef.current.onReady?.();
        }
        if (!bufferedRef.current && video.readyState >= HTMLMediaElement.HAVE_FUTURE_DATA) {
          bufferedRef.current = true;
          callbacksRef.current.onBuffered?.();
        }
        seekLatest();
      };

      const continueSeek = () => {
        if (Math.abs(video.currentTime - targetTimeRef.current) >= 1 / 48) {
          seekLatest();
        }
      };

      // Never leave the story blocked if a visitor's browser cannot decode H.264.
      const recoverFromError = () => {
        if (!bufferedRef.current) {
          bufferedRef.current = true;
          callbacksRef.current.onBuffered?.();
        }
      };

      video.addEventListener('loadeddata', reveal);
      video.addEventListener('canplay', reveal);
      video.addEventListener('seeked', continueSeek);
      video.addEventListener('error', recoverFromError);
      if (video.readyState >= HTMLMediaElement.HAVE_CURRENT_DATA) reveal();

      return () => {
        video.removeEventListener('loadeddata', reveal);
        video.removeEventListener('canplay', reveal);
        video.removeEventListener('seeked', continueSeek);
        video.removeEventListener('error', recoverFromError);
      };
    }, [src, duration]);

    return (
      <video
        ref={videoRef}
        aria-hidden="true"
        className={`object-cover ${className ?? 'absolute inset-0 h-full w-full'}`}
        src={src}
        poster={poster}
        preload="auto"
        muted
        playsInline
        disablePictureInPicture
      />
    );
  },
);
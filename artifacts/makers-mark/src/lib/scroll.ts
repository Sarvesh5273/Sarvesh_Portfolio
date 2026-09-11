import type Lenis from 'lenis';
import ScrollTrigger from 'gsap/ScrollTrigger';

/**
 * Single scroll controller shared by the page.
 * All programmatic scrolling goes through Lenis so it never fights the smooth-scroll loop.
 */
let lenisInstance: Lenis | null = null;
let scrollLocked = false;

export function setLenis(lenis: Lenis | null) {
  lenisInstance = lenis;
}

/** Keep a gated scene fixed while still allowing a controlled immediate handoff. */
export function setScrollLocked(locked: boolean) {
  scrollLocked = locked;
  if (!lenisInstance) return;
  if (locked) lenisInstance.stop();
  else lenisInstance.start();
}

export function prefersReducedMotion() {
  return (
    typeof window !== 'undefined' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches
  );
}

/** Re-measure every ScrollTrigger after layout has settled (two frames). */
export function refreshScrollAfterLayout(): Promise<void> {
  return new Promise((resolve) => {
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        ScrollTrigger.refresh();
        resolve();
      });
    });
  });
}

export function scrollToElement(id: string, immediate = false) {
  const el = document.getElementById(id);
  if (!el) return;
  if (lenisInstance && !prefersReducedMotion()) {
    // A gate may have Lenis stopped to block visitor input. Resume only for
    // this synchronous handoff, then return it to its locked state.
    const restoreLock = scrollLocked && immediate;
    if (restoreLock) lenisInstance.start();
    // Lenis clamps targets to its cached limit; after an act is appended that
    // limit is stale (often still 0), so re-measure before travelling.
    lenisInstance.resize();
    lenisInstance.scrollTo(el, { immediate, duration: 1.4 });
    if (restoreLock) requestAnimationFrame(() => lenisInstance?.stop());
  } else {
    el.scrollIntoView({ behavior: prefersReducedMotion() ? 'auto' : 'smooth' });
  }
}

/** Resolve once an element with this id is in the document (lazy acts mount a moment after they unlock). */
export function waitForElement(id: string, timeoutMs = 8000): Promise<HTMLElement | null> {
  return new Promise((resolve) => {
    const existing = document.getElementById(id);
    if (existing) return resolve(existing);
    const started = performance.now();
    const observer = new MutationObserver(() => {
      const el = document.getElementById(id);
      if (el) {
        observer.disconnect();
        resolve(el);
      } else if (performance.now() - started > timeoutMs) {
        observer.disconnect();
        resolve(null);
      }
    });
    observer.observe(document.body, { childList: true, subtree: true });
  });
}

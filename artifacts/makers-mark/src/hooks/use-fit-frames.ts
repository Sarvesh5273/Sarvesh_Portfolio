import { useEffect, type RefObject } from 'react';

/**
 * Pinned frames cannot scroll, so on small screens each frame's scene is set
 * smaller until it fits the viewport (CSS `zoom`, which reflows text as well).
 * Measured at natural size, then scaled; re-run on resize and orientation change.
 */
export function useFitFrames(container: RefObject<HTMLElement | null>, selector: string, enabled: boolean, maxZoom = 1) {
  useEffect(() => {
    if (!enabled) return;
    const root = container.current;
    if (!root) return;
    const fit = () => {
      const scenes = Array.from(root.querySelectorAll<HTMLElement>(selector));
      const budget = window.innerHeight * 0.8;
      scenes.forEach((scene) => {
        scene.style.zoom = '1';
        const natural = scene.scrollHeight;
        const z = Math.min(maxZoom, natural > 0 ? budget / natural : 1);
        scene.style.zoom = String(Math.max(0.4, Math.round(z * 100) / 100));
      });
    };
    fit();
    const id = window.setTimeout(fit, 400); // after fonts/images settle
    window.addEventListener('resize', fit);
    return () => {
      window.clearTimeout(id);
      window.removeEventListener('resize', fit);
    };
  }, [container, selector, enabled, maxZoom]);
}

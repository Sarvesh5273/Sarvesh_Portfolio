/** Coarse device hints used to pick static fallbacks for expensive layers. */

export function isLowPowerDevice(): boolean {
  if (typeof navigator === 'undefined') return false;
  const cores = navigator.hardwareConcurrency;
  const memory = (navigator as unknown as { deviceMemory?: number }).deviceMemory;
  return (cores !== undefined && cores <= 2) || (memory !== undefined && memory <= 2);
}

/** True when the primary pointer cannot hover (touch phones and tablets). */
export function isTouchPrimary(): boolean {
  if (typeof window === 'undefined') return false;
  return window.matchMedia('(hover: none), (pointer: coarse)').matches;
}

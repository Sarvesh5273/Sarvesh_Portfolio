import { useSyncExternalStore } from 'react';
import type { ActId } from '@/content/types';

/**
 * World-to-world material dissolves.
 *
 * A dissolve is a single shared timeline (see components/MaterialDissolve.tsx)
 * that the leaving act starts and the sigil listens to, so the mark changes
 * material in the same breath as the world does. The next act is unlocked at
 * the timeline's midpoint, once the old material is fully covered.
 */
export type DissolveKind = 'fog-stone' | 'stone-paper';

export interface DissolveState {
  kind: DissolveKind;
  /** in: the new material is forming; out: it thins away over the new act. */
  phase: 'in' | 'out';
  from: ActId;
  to: ActId;
  /** Called exactly once, at the point where the old world is fully hidden. */
  onMid: () => void;
}

export const DISSOLVE_TARGET: Record<DissolveKind, { from: ActId; to: ActId }> = {
  'fog-stone': { from: 'unwritten', to: 'kingdom' },
  'stone-paper': { from: 'kingdom', to: 'presentRoom' },
};

let state: DissolveState | null = null;
const listeners = new Set<() => void>();

function emit() {
  listeners.forEach((l) => l());
}

export function beginDissolve(kind: DissolveKind, onMid: () => void) {
  if (state) return false;
  let fired = false;
  state = {
    kind,
    phase: 'in',
    ...DISSOLVE_TARGET[kind],
    onMid: () => {
      if (fired) return;
      fired = true;
      onMid();
    },
  };
  emit();
  return true;
}

export function setDissolvePhase(phase: 'in' | 'out') {
  if (!state || state.phase === phase) return;
  state = { ...state, phase };
  emit();
}

export function endDissolve() {
  if (!state) return;
  state = null;
  emit();
}

function subscribe(l: () => void) {
  listeners.add(l);
  return () => {
    listeners.delete(l);
  };
}

export function useDissolve(): DissolveState | null {
  return useSyncExternalStore(subscribe, () => state, () => null);
}

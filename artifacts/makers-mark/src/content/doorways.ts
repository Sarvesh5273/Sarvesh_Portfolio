/**
 * The doorways offered in the Prologue. The chosen one is remembered by the
 * visitor store and shown back to them later (first at the bottom of the Well).
 *
 */

import type { StructureId } from './types';

export type DoorwayId = 'arch' | 'gap' | 'frame' | 'round';

export interface Doorway {
  id: DoorwayId;
  name: string;
  structure: StructureId;
  leads: string;
}

export const doorways: Doorway[] = [
  {
    id: 'arch',
    name: 'The Arch',
    structure: 'bridge',
    leads: 'The arch is how the Bridge is entered.',
  },
  {
    id: 'gap',
    name: 'The Narrow Gap',
    structure: 'gate',
    leads: "The narrow gap is the Gate's way in.",
  },
  {
    id: 'frame',
    name: 'The Open Frame',
    structure: 'well',
    leads: 'The open frame looks down into the Well.',
  },
  {
    id: 'round',
    name: 'The Round Window',
    structure: 'orchard',
    leads: 'The round window opens onto the Orchard.',
  },
];

export function getDoorway(id: string | null | undefined): Doorway | null {
  if (!id) return null;
  return doorways.find((d) => d.id === id) ?? null;
}

/**
 * Content model for The Maker's Mark.
 *
 * The three narrative worlds render the same four structures from different
 * useful perspectives. Only confirmable facts belong in `kingdom.ledger`.
 */

export type WorldId = 'unwritten' | 'kingdom' | 'presentRoom';

export type ActId = 'prologue' | WorldId | 'coda';

export type StructureId = 'bridge' | 'well' | 'gate' | 'orchard';

export interface Link {
  label: string;
  href: string;
}

export interface LedgerRecord {
  /** The line as carved. Short, declarative, past tense. */
  line: string;
  /** Optional plain-language gloss shown on hover / in reduced-motion mode. */
  gloss?: string;
}

export interface StructureUnwritten {
  /** The real project name revealed in the first world. */
  projectName: string;
  /** The practice area that makes the project legible at a glance. */
  category: string;
  /** A concise, visitor-facing project state. */
  status: string;
  /** One-line project summary, written in plain language. */
  intent: string;
  /** The more personal field note revealed when the visitor leans in. */
  discovery: string;
}

export interface StructureKingdom {
  /** What the stone form is called in this world. */
  title: string;
  /** Carved ledger. Only confirmable facts. */
  ledger: LedgerRecord[];
  /** An older, chiseled-over version of the ledger (optional). */
  olderLedger?: LedgerRecord[];
  /** Evidence of other people's hands (optional). */
  evidence?: string;
  /** Record stones — awards, results. */
  records?: string[];
  /** Whether the unfinished carving sits beside this structure. */
  hasUnfinishedCarving?: boolean;
}

export interface StructurePresentRoom {
  /** The real name, finally. */
  name: string;
  /** One sentence in the maker's own words. */
  description: string;
  /** What object in the room holds it. */
  object: string;
  /** Proof items on/near the object. */
  proof: string[];
  links: Link[];
  /** Real stack, for the Coda. */
  stack: string[];
  /** Whether this is the unfinished thing (whiteboard). */
  unfinished?: boolean;
  /** The question circled on the whiteboard today (unfinished thing only). */
  openQuestion?: string;
}

export interface Structure {
  id: StructureId;
  /** Story name of the structure, shared across worlds. */
  storyName: string;
  unwritten: StructureUnwritten;
  kingdom: StructureKingdom;
  presentRoom: StructurePresentRoom;
}

export interface Discovery {
  id: string;
  name: string;
  /** Which world hides it. */
  world: WorldId;
  /** What the visitor sees when they find it. */
  line: string;
  /** Plain description for the Coda. */
  description: string;
  href?: string;
}

export interface Achievement {
  id: string;
  title: string;
  detail: string;
  year: number;
  /** Which structure it belongs to, if any. */
  structure?: StructureId;
}

export interface Contact {
  name: string;
  identity: string;
  location: string;
  stickyNote: string;
  email?: string;
  links: Link[];
  /** Resume file served from the site's public folder. */
  resume: { label: string; file: string };
}

export interface WorldMeta {
  id: WorldId;
  number: number;
  title: string;
  material: string;
  /** How the visitor leaves this world. */
  transitionAction: string;
  transitionLabel: string;
}

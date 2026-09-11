import { useRef, useState, type ReactNode } from 'react';
import type { Structure } from '@/content/types';
import { getDoorway } from '@/content/doorways';
import { useVisitor } from '@/store/VisitorContext';
import { DoorwayLeadTag } from '@/components/DoorwayLeadTag';
import { Ledger, RecordStone, FossilPage, Parchment } from './Ledger';
import { UnfinishedCarving } from './UnfinishedCarving';
import { useTorchNear } from './torch';

const BRIDGE_PARCHMENT = `${import.meta.env.BASE_URL}assets/bridge-parchment.png`;

interface StoneProps {
  structure: Structure;
  reduced: boolean;
}

function StoneFrame({
  structure,
  structureSide = 'left',
  ledger,
  panelContent,
  below,
  testId,
}: {
  structure: Structure;
  structureSide?: 'left' | 'right';
  ledger: ReactNode;
  panelContent?: ReactNode;
  below?: ReactNode;
  testId: string;
}) {
  return (
    <div className={`k-story-frame k-structure-${structureSide}`} data-testid={testId}>
      <div className="k-copy-scrim">
        <DoorwayLeadTag structureId={structure.id} className="k-carved-light k-frame-meta" />
        <p className="k-carved-light k-frame-kicker text-[11px] uppercase tracking-[0.4em] mb-4">
          {structure.storyName}
        </p>
        {ledger}
        {panelContent && <div className="k-panel-interactions mt-4">{panelContent}</div>}
        {below && <div className="k-paper-records mt-6 flex flex-wrap items-start gap-6">{below}</div>}
      </div>
    </div>
  );
}

export function StoneBridge({ structure }: StoneProps) {
  const k = structure.kingdom;
  return (
    <StoneFrame
      structure={structure}
      testId="stone-bridge"
      structureSide="left"
      panelContent={k.evidence ? <FossilPage text={k.evidence} testId="bridge-fossil" /> : undefined}
      ledger={<Ledger title={k.title} records={k.ledger} older={k.olderLedger} size="wide" testId="ledger-bridge" />}
      below={k.records?.map((record) => <RecordStone key={record} text={record} testId="record-bridge" />)}
    />
  );
}

function minutesSince(ts: number | null | undefined): number | null {
  if (!ts) return null;
  return Math.max(0, Math.round((Date.now() - ts) / 60000));
}

export function StoneWell({ structure, reduced }: StoneProps) {
  const k = structure.kingdom;
  const { chosenDoorway, timestamps } = useVisitor();
  const doorway = getDoorway(chosenDoorway);
  const [state, setState] = useState<'idle' | 'down' | 'up'>('idle');
  const fragmentReady = state === 'up';
  const lower = () => {
    if (state !== 'idle') return;
    if (reduced) return setState('up');
    setState('down');
    window.setTimeout(() => setState('up'), 1500);
  };
  const mins = minutesSince(timestamps.unwritten);
  const fragment = doorway
    ? `You chose ${doorway.name}.${mins !== null ? ` You stepped through it ${mins < 1 ? 'less than a minute' : `${mins} minute${mins === 1 ? '' : 's'}`} ago.` : ''}`
    : 'Something you dropped in before you arrived.';

  return (
    <StoneFrame
      structure={structure}
      testId="stone-well"
      structureSide="left"
      ledger={
        <div className="space-y-4">
          <Ledger title={k.title} records={k.ledger} size="compact" testId="ledger-well" />
          <div className="pt-1">
            <button type="button" onClick={lower} disabled={state !== 'idle'} className="k-image-action" aria-live="polite" data-testid="well-bucket-button">
              {state === 'idle' ? 'Lower the bucket' : state === 'down' ? 'Lowering' : 'The bucket came back'}
            </button>
            <Parchment className="k-interaction-note mt-4 p-5 max-w-[22rem]" style={{ opacity: fragmentReady ? 1 : 0, transform: fragmentReady ? 'none' : 'translateY(6px)', transition: 'opacity 700ms ease, transform 700ms ease' }} aria-hidden={!fragmentReady} data-testid="well-fragment">
              <p className="k-ink-text text-[10px] uppercase tracking-[0.3em] mb-2">a memory fragment, returned</p>
              <p className="k-ink-gloss text-[15px] italic leading-relaxed">{fragment}</p>
            </Parchment>
          </div>
          <Parchment className="p-6 mt-4 max-w-[20rem] mx-auto md:mx-0" imgStyle={{ transform: 'rotate(1deg)' }} data-testid="well-carving-preview">
            <UnfinishedCarving interactive={false} reduced={reduced} />
            <p className="k-ink-text text-[9px] uppercase tracking-[0.3em] text-center mt-4" style={{ opacity: 0.8 }}>the larger well beside it, unfinished</p>
          </Parchment>
        </div>
      }
    />
  );
}

export function StoneGates({ structure }: StoneProps) {
  const k = structure.kingdom;
  const labels = ['a policy tablet', 'a mesh of stopped things', 'a chain of seals'];
  return (
    <StoneFrame
      structure={structure}
      testId="stone-gate"
      structureSide="right"
      panelContent={
        <Parchment className="k-interaction-note p-5 max-w-[27rem]" data-testid="gate-scrolls">
          <div className="flex gap-2 mb-2">{labels.map((label, i) => <span key={label} className="k-plaque px-2 py-1 text-[9px] uppercase tracking-[0.16em]" data-testid={`gate-${i}`}>{label}</span>)}</div>
          {k.evidence && <p className="k-ink-gloss text-[13px] leading-relaxed">{k.evidence}</p>}
        </Parchment>
      }
      ledger={<Ledger title={k.title} records={k.ledger} size="medium" testId="ledger-gate" />}
    />
  );
}

const TREE_COUNT = 7;

export function StoneOrchard({ structure }: StoneProps) {
  const k = structure.kingdom;
  const [favored, setFavored] = useState<number | null>(null);
  const groveRef = useRef<HTMLButtonElement>(null);
  const groveLit = useTorchNear(groveRef, 120);
  const [groveOpen, setGroveOpen] = useState(false);
  const explanations = k.ledger.slice(0, 3);
  const groveLine = k.ledger[3];
  const placard = favored === null ? null : explanations[favored % explanations.length];

  return (
    <StoneFrame
      structure={structure}
      testId="stone-orchard"
      structureSide="left"
      panelContent={
        <>
          <div className="flex gap-2">
            {Array.from({ length: TREE_COUNT }).map((_, i) => (
              <button key={i} type="button" className="k-tree-target" onFocus={() => setFavored(i)} onPointerEnter={() => setFavored(i)} onClick={() => setFavored(i)} aria-label={`Tree ${i + 1}`} />
            ))}
          </div>
          <button ref={groveRef} type="button" className="mt-2 h-10 w-full border border-[#c9a35a55] outline-none" aria-expanded={groveOpen} aria-label="A smaller grove at the back of the orchard" onClick={() => setGroveOpen((v) => !v)} data-testid="orchard-grove" data-lit={groveLit || groveOpen} />
          <div className="mt-3 min-h-12 transition-opacity" style={{ opacity: placard ? 1 : 0 }} aria-live="polite" data-testid="orchard-placard">
            {placard && <Parchment className="k-interaction-note p-4 max-w-[22rem]"><p className="k-ink-text text-[10px] uppercase tracking-[0.25em]">placard, tree {favored! + 1} of {TREE_COUNT}</p><p className="k-ink-text text-sm">{placard.line}</p>{placard.gloss && <p className="k-ink-gloss text-xs">{placard.gloss}</p>}</Parchment>}
          </div>
          <div className="mt-3 min-h-12 transition-opacity" style={{ opacity: groveOpen ? 1 : 0 }} aria-hidden={!groveOpen} data-testid="orchard-grove-placard">
            <Parchment className="k-interaction-note p-4 max-w-[22rem]"><p className="k-ink-text text-[10px] uppercase tracking-[0.25em]">the grove of fourteen</p><p className="k-ink-text text-sm">{groveLine.line}</p>{groveLine.gloss && <p className="k-ink-gloss text-xs">{groveLine.gloss}</p>}</Parchment>
          </div>
        </>
      }
      ledger={<Ledger title={k.title} records={k.ledger} size="compact" testId="ledger-orchard" />}
      below={k.records?.map((record) => <RecordStone key={record} text={record} testId="record-orchard" />)}
    />
  );
}
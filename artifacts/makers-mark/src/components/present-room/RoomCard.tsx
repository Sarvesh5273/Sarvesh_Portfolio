import * as DialogPrimitive from '@radix-ui/react-dialog';
import { discoveries, structureById, achievements, type StructureId } from '@/content';

export type RoomCardRef =
  | { kind: 'structure'; id: StructureId }
  | { kind: 'discovery'; id: string }
  | { kind: 'drafts' };

interface Props {
  card: RoomCardRef | null;
  onClose: () => void;
  reduced: boolean;
}

/**
 * The card that opens when a visitor picks something up in the room. Every
 * word on it comes from the content model: real names, real links, at last.
 */
export function RoomCard({ card, onClose, reduced }: Props) {
  const open = card !== null;
  return (
    <DialogPrimitive.Root open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogPrimitive.Portal>
        <DialogPrimitive.Overlay
          className="fixed inset-0 z-[70] bg-[#1c1917]/40 backdrop-blur-[2px] data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0"
          style={reduced ? { animation: 'none' } : undefined}
        />
        <DialogPrimitive.Content
          className="pr-card fixed left-1/2 top-1/2 z-[80] w-[min(92vw,34rem)] max-h-[88vh] -translate-x-1/2 -translate-y-1/2 overflow-y-auto focus:outline-none data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95"
          style={reduced ? { animation: 'none' } : undefined}
          data-testid="room-card"
        >
          {card && <CardBody card={card} />}
          <DialogPrimitive.Close
            className="absolute right-3 top-3 rounded-full p-2 text-[#57534e] hover:bg-black/5 hover:text-[#1c1917] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1c1917]"
            data-testid="button-room-card-close"
          >
            <span aria-hidden="true">×</span>
            <span className="sr-only">Put it back</span>
          </DialogPrimitive.Close>
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
}

function CardBody({ card }: { card: RoomCardRef }) {
  if (card.kind === 'drafts') {
    return (
      <>
        <Eyebrow>Pinned to the wall</Eyebrow>
        <DialogPrimitive.Title className="pr-card-title">The mark, four drafts</DialogPrimitive.Title>
        <DialogPrimitive.Description className="pr-card-body">
          The same mark you have followed through fog, stone and glass, as it was actually worked out on
          paper. The first draft is a wobble. The last one is the mark that signs this site.
        </DialogPrimitive.Description>
        <p className="pr-card-fine">
          Placeholder drafts until the maker's real sketches are scanned.
        </p>
      </>
    );
  }

  if (card.kind === 'discovery') {
    const d = discoveries.find((x) => x.id === card.id);
    if (!d) return null;
    return (
      <>
        <Eyebrow>{d.world === 'presentRoom' ? 'On the desk' : 'Open in a tab'}</Eyebrow>
        <DialogPrimitive.Title className="pr-card-title">{d.name}</DialogPrimitive.Title>
        <DialogPrimitive.Description className="pr-card-body">{d.description}</DialogPrimitive.Description>
        <p className="pr-card-story">{d.line}</p>
        {d.href && (
          <Links links={[{ label: 'GitHub', href: d.href }]} />
        )}
      </>
    );
  }

  const s = structureById[card.id];
  const room = s.presentRoom;
  const awards = achievements.filter((a) => a.structure === s.id);
  return (
    <>
      <Eyebrow>
        The story called it {s.storyName}
        {room.unfinished ? ' — still unfinished' : ''}
      </Eyebrow>
      <DialogPrimitive.Title className="pr-card-title" data-testid={`text-room-card-name-${s.id}`}>
        {room.name}
      </DialogPrimitive.Title>
      <DialogPrimitive.Description className="pr-card-body">{room.description}</DialogPrimitive.Description>

      {room.unfinished && room.openQuestion && (
        <p className="pr-card-question">
          <span className="pr-card-label">Today's open question</span>
          {room.openQuestion}
        </p>
      )}

      <div className="pr-card-section">
        <span className="pr-card-label">What is here</span>
        <ul className="pr-card-list">
          {room.proof.map((p) => (
            <li key={p}>{p}</li>
          ))}
        </ul>
      </div>

      {awards.length > 0 && (
        <div className="pr-card-section">
          <span className="pr-card-label">On record</span>
          <ul className="pr-card-list">
            {awards.map((a) => (
              <li key={a.id}>
                <strong>{a.title}</strong> — {a.detail}
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="pr-card-section">
        <span className="pr-card-label">Built with</span>
        <p className="pr-card-stack">{room.stack.join(' · ')}</p>
      </div>

      <Links links={room.links} />
    </>
  );
}

function Eyebrow({ children }: { children: React.ReactNode }) {
  return <p className="pr-card-eyebrow">{children}</p>;
}

function Links({ links }: { links: { label: string; href: string }[] }) {
  return (
    <div className="pr-card-links">
      {links.map((l) => (
        <a
          key={l.href}
          href={l.href}
          target="_blank"
          rel="noopener noreferrer"
          className="pr-card-link"
          data-testid={`link-room-${l.label.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`}
        >
          {l.label}
          <span aria-hidden="true"> ↗</span>
        </a>
      ))}
    </div>
  );
}

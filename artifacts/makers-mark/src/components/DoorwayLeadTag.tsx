import type { StructureId } from '@/content/types';
import { getDoorway } from '@/content/doorways';
import { useVisitor } from '@/store/VisitorContext';

export function DoorwayLeadTag({ structureId, className = '' }: { structureId: StructureId; className?: string }) {
  const { chosenDoorway } = useVisitor();
  const doorway = getDoorway(chosenDoorway);
  if (!doorway || doorway.structure !== structureId) return null;

  return (
    <div
      className={`mb-4 flex items-center gap-3 border-t border-current pt-3 text-[10px] uppercase tracking-[0.22em] ${className}`}
      data-testid={`doorway-lead-${structureId}`}
    >
      <span className="h-2 w-2 shrink-0 rounded-full border border-current" aria-hidden="true" />
      <span>Your doorway. You came in through {doorway.name.toLowerCase()}.</span>
    </div>
  );
}
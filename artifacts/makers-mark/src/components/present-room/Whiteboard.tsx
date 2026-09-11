import { useState } from 'react';
import { structureById } from '@/content';

/** Marker writing is HTML so the board remains legible without vector artwork. */
export function Whiteboard() {
  const room = structureById.well.presentRoom;
  const [traced, setTraced] = useState(false);
  const today = new Intl.DateTimeFormat('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }).format(new Date());
  return (
    <div className="pr-board" data-testid="prop-whiteboard">
      <p className="pr-board-date" data-testid="text-whiteboard-date">{today}</p>
      <p className="pr-board-heading">{room.name} <em>ongoing</em></p>
      <div className="pr-board-loop" aria-label="Diagram: memory, reflection, feeling, time, joined in a loop.">
        <span>memory</span><i>to</i><span>reflection</span><i>to</i><span>feeling</span><i>to</i><span>time</span>
      </div>
      <p className="pr-board-question" data-testid="text-whiteboard-question">{room.openQuestion}</p>
      <div className="pr-board-v0" data-placeholder="screenshot" data-testid="prop-mindthread-v0">
        <strong>MindThread</strong><span>v0</span>
      </div>
      <button
        type="button"
        onClick={() => setTraced((value) => !value)}
        aria-pressed={traced}
        className="mt-3 border-b border-[#57534e]/40 pb-0.5 text-[9px] uppercase tracking-[0.18em] text-[#57534e] transition-colors hover:border-[#57534e] focus-visible:outline focus-visible:outline-1 focus-visible:outline-[#57534e]"
        data-testid="button-trace-whiteboard"
      >
        {traced ? 'The loop holds together' : 'Trace the loop'}
      </button>
      {traced && <p className="mt-2 text-[10px] italic text-[#57534e]" aria-live="polite">memory → reflection → feeling → time</p>}
    </div>
  );
}